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
    