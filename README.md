# check24-genDev
This repository contains the code for the 2024 check24 GenDev Scholarship challenge

## Setup
1. Clone the repository
2. Install the requirements
   1. We suggest using a virtual environment for the project
   2. Run `pip install -r requirements.txt`
   3. `cd` into the frontend folder
   4. Run `npm install`

   
## Run
1. cd into the backend folder
2. Run `flask --app app run`
    * if multiple versions of python are installed, use `python3 -m flask --app app run`
3. `cd` into the frontend folder
4. run `ng serve --open`
5. The app should open in your browser(localhost:4200)

## Minimum Requirements
- [X] Team selection for one or multiple teams
- [X] Ranking of streaming packages based on availability of streamed matches
- [X] Offering the smallest price combination you can find if one package doesn't cover everything
- [X] Reasonable search time (make sure UX is not affected in a negative way)

There's always room for an improved feature set. Maybe it can make sense to book monthly packages one after another expires, instead of purchasing multiple yearly ones together. Improve, adapt, overcome.
More inspiration for additional features could be:

1. Search by teams, leagues, date ranges and more
2. Save past searches and recommend similar packages
3. Visualize the upcoming games and the availability on streaming services



## Optimum Package Selection
- [X] The user can select one or multiple teams
- [X] Covered and uncovered games are displayed
- [X] The best price combination is displayed
- [X] Create a shedule, when to subscribe to which package
- [X] Dispaly shedule in a calendar
- [X] The user can select a starting date from when to look (default is today)
- [ ] Quick select option, e.g. "next match", "first game"

## Technologies
- Python (>= 3.12.7)
- Flask (3.0.3)
- sqlite3
- npm 
- Angular (17.3.0)

## Possible Improvements
- add conversational agent that helps you find the best price plan for your team
- add monthly or yearly budget to the user profile so that the user can get the best price plan for his budget
- add a importance order to different tournaments so that the user can get the best price plan for his favorite tournaments
- use external cache to store the data so that the search time is reduced
- update DB to sharded DB to counteract hotspots (Bayern and Barcelona should not be on the same shard)

