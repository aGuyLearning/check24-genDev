# check24-genDev
Thsi repository contains the code for the 2024 check24 GenDev Scholarship challenge

## Minimum Requirements
- Team selection for one or multiple teams
- Ranking of streaming packages based on availability of streamed matches
- Offering the smallest price combination you can find if one package doesn't cover everything
- Reasonable search time (make sure UX is not affected in a negative way)

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
- Python
- Flask
- sqlite3

## Possible Improvements
- add conversational agent that helps you find the best price plan for your team
- add monthly or yearly budget to the user profile so that the user can get the best price plan for his budget
- add a importance order to different tournaments so that the user can get the best price plan for his favorite tournaments
- use external cache to store the data so that the search time is reduced
- update DB to sharded DB to counteract hotspots (Bayern and Barcelona should not be on the same shard)

## Modes
- search for my team
- search for my tournament