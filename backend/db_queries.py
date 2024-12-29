from string import Template

free_steraming_packages = """
SELECT name
FROM bc_streaming_package 
WHERE monthly_price_cents IS NULL OR monthly_price_cents = 0;
"""
no_monthly_option = """
SELECT * FROM 'bc_streaming_package'
WHERE monthly_price_cents IS NULL OR monthly_price_cents = ""
LIMIT 0,30;
"""

all_games_assosiated_with_free_streaming_package = """
SELECT g.id, g.team_home, g.team_away, g.starts_at, g.tournament_name, sp.name 
FROM bc_game g
JOIN bc_streaming_offer o ON g.id = o.game_id
JOIN bc_streaming_package sp ON o.streaming_package_id = sp.id
WHERE sp.monthly_price_cents = 0;
"""

tournament_names = """
SELECT DISTINCT tournament_name 
FROM bc_game;
"""

all_team_names = """
SELECT DISTINCT team_home AS team_name
FROM bc_game
UNION
SELECT DISTINCT team_away AS team_name
FROM bc_game;
"""

all_teams_for_tournament = Template("""
                                    SELECT DISTINCT g.team_home AS team_name
                                    FROM bc_game g
                                    WHERE g.tournament_name = '$tournament_name'

                                    UNION

                                    SELECT DISTINCT g.team_away AS team_name
                                    FROM bc_game g
                                    WHERE g.tournament_name = '$tournament_name';
                                    """)


get_tournament_coverage_by_streaming_package_id = """
SELECT 
    g.tournament_name,
    COUNT(DISTINCT g.id) AS total_games,
    SUM(CASE WHEN so.streaming_package_id = ? THEN 1 ELSE 0 END) AS covered_games,
    SUM(CASE WHEN so.streaming_package_id = ? AND so.highlights = 1 THEN 1 ELSE 0 END) AS highlighted_games,
    CASE 
        WHEN COUNT(DISTINCT g.id) > 0 THEN 
            (SUM(CASE WHEN so.streaming_package_id = ? THEN 1 ELSE 0 END) * 100.0 / COUNT(DISTINCT g.id)) 
        ELSE 0 
    END AS coverage_percentage
FROM 
    bc_game g
LEFT JOIN 
    bc_streaming_offer so ON g.id = so.game_id
GROUP BY 
    g.tournament_name;
"""

def get_packages_for_teams(teams):
    return """
        SELECT DISTINCT sp.name
        FROM bc_game g
        JOIN bc_streaming_offer so ON g.id = so.game_id
        JOIN bc_streaming_package sp ON so.streaming_package_id = sp.id
        WHERE (g.team_home IN ({0}) OR g.team_away IN ({0}))
        AND g.starts_at >= ?;
        """.format(','.join('?' * len(teams)))

def get_games_by_team_name(team_names):
    """
    Generate SQL query to get all games associated with a list of team names
    Args:
    - team_names: A list of team names
    Returns:
    - generated_query: A string containing the generated SQL query. With placeholders for team names
    (e.g. 'SELECT * FROM bc_game WHERE team_home IN (?, ?, ?) OR team_away IN (?, ?, ?);')
    This is done to prevent SQL injection attacks
    """
    generated_query = """
    SELECT DISTINCT g.id, g.starts_at, g.tournament_name, g.team_home, g.team_away
    FROM bc_game g
    WHERE (g.team_home IN ({0}) OR g.team_away IN ({0}))
    AND g.starts_at >= ?
    ORDER BY g.starts_at;
    """.format(','.join('?' * len(team_names)))
    
    return generated_query

get_all_games = """
SELECT DISTINCT g.id, g.starts_at, g.tournament_name, g.team_home, g.team_away
FROM bc_game g
WHERE g.starts_at >= ?
ORDER BY g.starts_at;
"""

def get_exclusive_games(game_ids):
    generated_query = """
    SELECT g.id AS game_id, g.starts_at, 
       sp.id AS streaming_package_id, sp.name AS streaming_package_name
    FROM bc_streaming_offer AS so
    JOIN bc_streaming_package AS sp ON so.streaming_package_id = sp.id
    JOIN bc_game AS g ON so.game_id = g.id
    WHERE so.live = 1 AND g.id IN ({})
    GROUP BY g.id
    HAVING COUNT(DISTINCT sp.id) = 1
    ORDER BY g.starts_at;
    """.format(','.join('?' * len(game_ids)))

    return generated_query 

def get_game_info_by_id(game_ids):
    generated_query = """
    SELECT g.id AS game_id, g.starts_at, g.tournament_name, g.team_home, g.team_away
    FROM bc_game g
    WHERE g.id IN ({})
    ORDER BY g.starts_at;
    """.format(','.join('?' * len(game_ids)))
    
    return generated_query

get_all_streaming_packages = """ SELECT * FROM bc_streaming_package; """