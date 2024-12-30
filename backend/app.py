import datetime
from flask import Flask, abort, g, json, jsonify, request
from flask_caching import Cache
from flask_cors import CORS
import sqlite3
from streamingPackageOptimiser import find_streaming_packages_with_timeframes
from config import DATABASE, FIRST_GAME_DATE, LAST_GAME_DATE, REDUCED_DATE_FORMAT
from db_queries import *

app = Flask(__name__)
config = {
    "SECRET_KEY":"secret!",
    "DEBUG": True,          # some Flask specific configs
    "CACHE_TYPE": "SimpleCache",  # Flask-Caching related configs
    "CACHE_DEFAULT_TIMEOUT": 300
}
app.config.from_mapping(config)
cache = Cache(app)
CORS(app)


def make_dicts(cursor, row):
    return dict((cursor.description[idx][0], value)
                for idx, value in enumerate(row))

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = make_dicts
    return db

def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

@app.route('/tournaments')
@cache.cached()
def tournaments():
    try:
        tournaments = query_db(tournament_names)
        tournaments = [tournament['tournament_name']
                       for tournament in tournaments]
        return jsonify(tournaments)
    except Exception as e:
        return str(e)

@app.route('/team_names')
@cache.cached()
def team_names():
    try:
        team_names = query_db(all_team_names)
        team_names = [team_name['team_name'] for team_name in team_names]
        return jsonify(team_names)
    except Exception as e:
        return str(e)

@app.route('/get_teams_by_tournament_name')
def get_teams_by_tournament_name():
    try:
        tournament_name = request.args.get(
            'tournament_name', 'Europameisterschaft 2024')
        teams = query_db(all_teams_for_tournament.substitute(
            tournament_name=tournament_name))
        return jsonify(teams)
    except Exception as e:
        return str(e)

@app.route('/get_tournament_coverage')
def get_tournament_coverage():
    try:

        streaming_packages = [[package['id'], package['name']]
                              for package in query_db(get_all_streaming_packages)]

        formatted_coverage = []

        # SQL Query to get coverage for selected streaming packages
        for streaming_package in streaming_packages:
            coverage = query_db(get_tournament_coverage_by_streaming_package_id, [
                                streaming_package[0]]*3)
            formatted_coverage.append({
                "package_id": streaming_package[0],
                "package_name": streaming_package[1],
                "coverage": coverage
            })
        # Return the result as JSON
        return jsonify(formatted_coverage)

    except Exception as e:
        e.with_traceback()
        return str(e), 500

@app.route('/get_streaming_packages_for_team_and_tournament')
@cache.cached(query_string=True)
def get_streaming_packages_for_team_and_tournament():
    try:
        team_names = request.args.getlist('teams')
        tournament_names = request.args.getlist('tournaments')
        start_time = request.args.get('start_date', datetime.datetime.now())
        # format the start time
        start_time = datetime.datetime.strptime(start_time, REDUCED_DATE_FORMAT)

        end_time = request.args.get('end_date', LAST_GAME_DATE)
        end_time = datetime.datetime.strptime(end_time, REDUCED_DATE_FORMAT)

        print(f'Start time: {start_time}, End time: {end_time}')

        games = query_db(get_games_by_team_name_and_tournament_name(team_names, tournament_names),team_names*2 + tournament_names + [str(start_time), str(end_time)])


        result = find_streaming_packages_with_timeframes(
            games, query_db)
        return result

    except Exception as e:
        e.with_traceback()
        return str(e), 500
        
    except Exception as e:
        return str(e), 500
    
@app.route('/get_streaming_packages_for_all_games')
@cache.cached()
def get_streaming_packages_for_all_games():
    try:
        start_time = request.args.get('start_date', FIRST_GAME_DATE)
        # format the start time
        start_time = datetime.datetime.strptime(start_time, REDUCED_DATE_FORMAT)
        end_time = request.args.get('end_date', LAST_GAME_DATE)

        games = query_db(get_all_games, [str(start_time), str(end_time)])


        result = find_streaming_packages_with_timeframes(
            games, query_db)
        return result

    except Exception as e:
        e.with_traceback()
        return str(e), 500
    
@app.route('/get_game_info')
@cache.cached(query_string=True)
def get_game_info():
    try:
        game_ids = request.args.getlist('game_id')
        query = get_game_info_by_id(game_ids)
        game_info = query_db(query, game_ids)

        return jsonify(game_info)
    except Exception as e:
        return str(e), 500

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()
