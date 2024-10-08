from flask import Flask, abort, g, json, jsonify, request
from flask_cors import CORS
import sqlite3
from config import DATABASE
from db_queries import *

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret!"
CORS(app)

def make_dicts(cursor, row):
    return dict((cursor.description[idx][0], value)
                for idx, value in enumerate(row))

def get_paginated_list(results, url, start, limit):
    start = int(start)
    limit = int(limit)
    count = len(results)
    if count < start or limit < 0:
        abort(404)
    # make response
    obj = {}
    obj['start'] = start
    obj['limit'] = limit
    obj['count'] = count
    # make URLs
    # make previous url
    if start == 1:
        obj['previous'] = ''
    else:
        start_copy = max(1, start - limit)
        limit_copy = start - 1
        obj['previous'] = url + '?start=%d&limit=%d' % (start_copy, limit_copy)
    # make next url
    if start + limit > count:
        obj['next'] = ''
    else:
        start_copy = start + limit
        obj['next'] = url + '?start=%d&limit=%d' % (start_copy, limit)
    # finally extract result according to bounds
    obj['results'] = results[(start - 1):(start - 1 + limit)]
    return obj

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

@app.route("/")
def hello_world():
    try:
        free_games = query_db(all_games_assosiated_with_free_streaming_package)
        return jsonify(free_games)
    except Exception as e:
        return str(e)

@app.route('/team_names')
def team_names():
    try:
        team_names = query_db(all_team_names)
        team_names = [team_name['team_name'] for team_name in team_names]
        return jsonify(team_names)
        # TODO: see if pagination is needed
        # return jsonify(get_paginated_list(
        # team_names, 
        # '/team_names', 
        # start=request.args.get('start', 1), 
        # limit=request.args.get('limit', 20)
    # ))
    except Exception as e:
        return str(e)

@app.route('/get_teams_by_tournament_name')
def get_teams_by_tournament_name():
    try:
        tournament_name = request.args.get('tournament_name', 'Europameisterschaft 2024')
        teams = query_db(all_teams_for_tournament.substitute(tournament_name=tournament_name))
        return jsonify(teams)
    except Exception as e:
        return str(e)
    
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()