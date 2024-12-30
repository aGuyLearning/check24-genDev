import datetime
from pulp import LpMinimize, LpProblem, LpVariable, lpSum
from config import DATE_FORMAT


def get_package_coverage(game_ids, query_db):
    """
    Get the coverage and cost of each streaming package
    Args:
    - game_ids: A list of game IDs
    Returns:
    - packages: A dictionary of streaming packages, their costs, and the games they cover
                Looking like this:
                {
                    "package_name": {
                        "monthly_price_cents": monthly_price_cents,
                        "monthly_price_yearly_subscription_in_cents": monthly_price_yearly_subscription_in_cents,
                        "covered_games": set([game_id1, game_id2, ...]),
                        "has_monthly_price": has_monthly_price
                    },
                    ...
                }
    """

    package_query = '''
        SELECT sp.name, sp.monthly_price_cents, sp.monthly_price_yearly_subscription_in_cents, so.game_id
        FROM bc_streaming_offer AS so
        JOIN bc_streaming_package AS sp ON so.streaming_package_id = sp.id
        WHERE so.game_id IN ({}) AND so.live = 1
    '''.format(','.join('?' * len(game_ids)))

    package_coverages = query_db(package_query, tuple(game_ids))

    packages = {}
    for package_info in package_coverages:
        if package_info['name'] not in packages:
            package_cost = package_info['monthly_price_cents']
            has_monthly_price = package_cost != ""
            packages[package_info['name']] = {
                "monthly_price_cents": package_info['monthly_price_cents'],
                "monthly_price_yearly_subscription_in_cents": package_info['monthly_price_yearly_subscription_in_cents'],
                "covered_games": [],
                "has_monthly_price": has_monthly_price
            }
        packages[package_info['name']]['covered_games'].append(
            package_info['game_id'])
        
    return packages

def get_timeframes_for_packages(packages, all_games):
    """
    Get the timeframes for each package
    Args:
    - packages: A dictionary of streaming packages, their costs, and the games they cover
    - all_games: A dictionary of all games
    Returns:
    - time_frames: A list of timeframes for each package
    """
    
    time_frames = []
    
    for package in packages:
        games_covered_by_package = packages[package]['covered_games']
        time_delta = 30
        
        # Check if the package is yearly
        if packages[package]['monthly_price_cents'] == "":
            time_delta = 365

        i = 0
        # Handle monthly package
        # Loop over games, grouping them into 30-day periods
        while i < len(games_covered_by_package):
            current_game_id = games_covered_by_package[i]
            current_game_start = all_games[current_game_id]['starts_at']
            timeframe_start = current_game_start
            timeframe_end = current_game_start + datetime.timedelta(days=time_delta)
            cost = packages[package]['monthly_price_cents'] if packages[package]['monthly_price_cents'] != "" else packages[package]['monthly_price_yearly_subscription_in_cents']

            # Initialize a new timeframe
            timeframe_games = [current_game_id]

            # Check the next games in the list
            for j in range(i + 1, len(games_covered_by_package)):
                next_game_id = games_covered_by_package[j]
                next_game_start = all_games[next_game_id]['starts_at']

                # If the next game is within the timeframe, include it
                if next_game_start <= timeframe_end:
                    timeframe_games.append(next_game_id)
                else:
                    break

            # Store the timeframe (start time and end time) for this package
            time_frames.append((timeframe_start, timeframe_end, timeframe_games, package, cost))

            # Move to the next game 
            i += 1
    return time_frames

def ilp_solver(covered_games, time_frames, timeframe_weight=0.001):
    """
    Solve the linear integer programming problem to find the best combination of packages
    Args:
    - packages: A dictionary of streaming packages, their costs, and the games they cover
    - games: A list of
    Returns:
    - selected_timeframes: A list of selected timeframes
    """
    # Step 1: Create the ILP problem (minimize cost)
    problem = LpProblem("OptimalStreamingPackages", LpMinimize)

    # Step 2: Create binary decision variables for each timeframe (1 = select, 0 = don't select)
    timeframe_vars = {i: LpVariable(f"timeframe_{i}", cat='Binary') for i in range(len(time_frames))}

    # Step 3: Objective function (minimize total cost and number of timeframes)
    total_cost = lpSum([timeframe_vars[i] * time_frames[i][4] for i in range(len(time_frames))])
    total_timeframes = lpSum([timeframe_vars[i] for i in range(len(time_frames))])
    problem += total_cost + timeframe_weight * total_timeframes, "Objective"

    # Step 4: Add constraints to ensure all games are covered
    # Create a dictionary to track which timeframes cover which games
    game_coverage = {game: [] for game in covered_games}

    for i, timeframe in enumerate(time_frames):
        for game in timeframe[2]:
            game_coverage[game].append(timeframe_vars[i])

    # Add constraints that each game must be covered by at least one selected timeframe
    for game in covered_games:
        problem += lpSum(game_coverage[game]) >= 1, f"cover_game_{game}"

     # Step 5: Solve the ILP problem
    print('Solving ILP problem')
    problem.solve()

    # Step 6: Retrieve the selected timeframes (1 if selected, 0 if not)
    selected_timeframes = []
    for i, var in timeframe_vars.items():
        if var.value() == 1:
            selected_timeframes.append(time_frames[i])

    # Step 7: Return the selected timeframes
    return selected_timeframes

def find_streaming_packages_with_timeframes(games, query_db):
    """
    Find the best combination of streaming packages to cover all games for the given teams
    Args:
    - team_names: A list of team names
    - query_db: A function to query the database
    Returns:
    - result: A dictionary with the selected packages, total cost, and uncovered games
    """
    # Step 1: Get all games for the team
    for game in games: 
        game['starts_at'] = datetime.datetime.strptime(game['starts_at'], DATE_FORMAT)

    game_ids = [game['id'] for game in games]
    games = {game['id']: game for game in games}

    competition_to_games = {}
    for game in games:
        competition = games[game]['tournament_name']
        if competition not in competition_to_games:
            competition_to_games[competition] = set()
        competition_to_games[competition].add(game)
    
    

    packages = get_package_coverage(game_ids, query_db)
    print('Got packages')

    # for each package, check if it coveres all games in a competition
    for _ , package_info in packages.items():
        games_covered_by_package = package_info['covered_games']
        package_info['competition_coverage'] = {}
        for competition in competition_to_games:
            competition_coverage = {
                "covered_games": [],
                "uncovered_games": []
            }
            # get intersection of games covered by package and games in competition
            competition_games = competition_to_games[competition]
            competition_coverage['covered_games'] = list(set(games_covered_by_package).intersection(competition_games))
            competition_coverage['uncovered_games'] = list(set(competition_games) - set(competition_coverage['covered_games']))

            package_info['competition_coverage'][competition] = competition_coverage

            
            
    covered_games = set()
    for package in packages:
        covered_games.update(packages[package]['covered_games'])
    
    # identify uncovered games
    uncovered_games = set(game_ids) - covered_games
    package_time_frames = get_timeframes_for_packages(packages, games)
    print('Got timeframes')

    # Step 4: cost minimization with timeframes (Linear Integer Programming)
    selected_timeframes = ilp_solver(covered_games, package_time_frames)
    print('Got selected timeframes')

    # Step 5: Format the result
    for competition in competition_to_games:
        competition_to_games[competition] = list(competition_to_games[competition])
    selected_packages = {}
    total_cost = 0

    for timeframe in selected_timeframes:
        package_name = timeframe[3]
        cost = packages[package_name]['monthly_price_cents'] if packages[package_name]['monthly_price_cents'] != "" else packages[package_name]['monthly_price_yearly_subscription_in_cents']
        total_cost += cost * (1 if packages[package_name]['has_monthly_price'] else 12)
        if package_name not in selected_packages:
            selected_packages[package_name] = []
        selected_packages[package_name].append({
            "start_time": timeframe[0].strftime(DATE_FORMAT),
            "end_time": timeframe[1].strftime(DATE_FORMAT),
            "games": timeframe[2]
        })
 
    return {
        "packages": packages,
        "competition_to_games": competition_to_games,
        "selected_packages": selected_packages,
        "total_cost": total_cost,
        "uncovered_games": list(uncovered_games)
    }
