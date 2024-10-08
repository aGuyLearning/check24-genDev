# This script is used to populate the database with the csv files provided for the challenge

import csv
import sqlite3

# Connect to the database
con = sqlite3.connect('check24-challenge.db')
cur = con.cursor()

# Create the tables (bc_game, bc_streaming_package, bc_streaming_offer)

cur.execute('''CREATE TABLE IF NOT EXISTS bc_game
                (id INTEGER PRIMARY KEY, team_home TEXT, team_away TEXT, starts_at DATETIME, tournament_name TEXT)''')

cur.execute('''CREATE TABLE IF NOT EXISTS bc_streaming_package
                (id INTEGER PRIMARY KEY, name TEXT, monthly_price_cents INTEGER, monthly_price_yearly_subscription_in_cents INTEGER)''')

# bc_streaming_offer has a foreign key to bc_streaming_package and bc_game
# the columns are: game_id,streaming_package_id,live,highlights

cur.execute('''CREATE TABLE IF NOT EXISTS bc_streaming_offer
                (game_id INTEGER, streaming_package_id INTEGER, live BOOLEAN, highlights BOOLEAN,
                FOREIGN KEY(game_id) REFERENCES bc_game(id),
                FOREIGN KEY(streaming_package_id) REFERENCES bc_streaming_package(id),
                PRIMARY KEY (game_id, streaming_package_id))''')


# populate the bc_game table
#TODO: look at how i can clean up the code here
with open('/Users/carlbuchholz/Documents/GitHub/check24-genDev/backend/csv/bc_game.csv', 'r') as f:
    dr = csv.DictReader(f)
    to_db = [(i['id'], i['team_home'], i['team_away'], i['starts_at'], i['tournament_name']) for i in dr]

cur.executemany("INSERT INTO bc_game (id, team_home, team_away, starts_at, tournament_name) VALUES (?, ?, ?, ?, ?);", to_db)

# populate the bc_streaming_package table
with open('/Users/carlbuchholz/Documents/GitHub/check24-genDev/backend/csv/bc_streaming_package.csv', 'r') as f:
    dr = csv.DictReader(f)
    to_db = [(i['id'], i['name'], i['monthly_price_cents'], i['monthly_price_yearly_subscription_in_cents']) for i in dr]

cur.executemany("INSERT INTO bc_streaming_package (id, name, monthly_price_cents, monthly_price_yearly_subscription_in_cents) VALUES (?, ?, ?, ?);", to_db)

# populate the bc_streaming_offer table
with open('/Users/carlbuchholz/Documents/GitHub/check24-genDev/backend/csv/bc_streaming_offer.csv', 'r') as f:
    dr = csv.DictReader(f)
    to_db = [(i['game_id'], i['streaming_package_id'], i['live'], i['highlights']) for i in dr]

cur.executemany("INSERT INTO bc_streaming_offer (game_id, streaming_package_id, live, highlights) VALUES (?, ?, ?, ?);", to_db)



con.commit()
con.close()

