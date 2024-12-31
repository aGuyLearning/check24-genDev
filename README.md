# check24-genDev
This repository contains the code for the 2024 check24 GenDev Scholarship challenge. Below is a video with a short overview of the project. 

[![Video zur Abgabe](https://img.youtube.com/vi/vLLS4dwqzBs/0.jpg)](https://www.youtube.com/watch?v=vLLS4dwqzBs)
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

## My Approach
I wanted to use this challenge to finally brush up on my angular developer skills. So i chose to focus on the user experience and on deepening my understanding of Angular 17. I was quite inspired by the example provided in the challenge, so i chose to recreate the layout. My landing page was heavily 'influenced' by the dazn landing page, as i was looking for similar webpages in theme. I wanted to create a simple and clean design, that was easy to navigate. I chose to use Angular Material for the design, as it is a well documented and easy to use library. 

For the backend i went simple. A Flask restfull api with a sqlite3 database. The database is populated with the data from the provided csv files. The data is then used to calculate the best price plan for the user using a simple linear programming model. This approach is performat enough for the given data, but could be improved by using a faster solver and a sharded database. It hits a performance low point when the user selects all games, as the search space explodes. I had quite the list of targets and hopped the problem specification of the integer linear programming model would flexible enough to allow me to implement them.

The integer linear programming model allowed me to solve for time shedules for each subscription package, which was my main objective ad motivation for choosing this. Starting with each game a package covered, i created a timeframe object collecting all the games within a 30 day time frame. For packages with only a yearly subscription, i created a timeframe object with a span of 365 days. I then used the timeframes to create a schedule for the user. 
Certainly there are a lot of improvements that could be made to the model, like stopping the creation of timeframes, when all games are covered, or using a more sophisticated solver. But i wanted to keep it simple and focus on the user experience, as that was something i wanted to improve on.

The schedule is downloadable as a .ics file. I didn't find a nice solution to display the schedule in the frontend, so i chose to use a downloadable file. Angular Calendar wasn't aesthetically pleasing and i didn't have enough time to write my own calendar.

Overall this was a great challenge and i learned a lot. I am looking forward to the feedback and to seeing what other people came up with.


## Features
- Team selection for one or multiple teams
- Ranking of streaming packages based on availability of streamed matches
- Offering the smallest price combination you can find if one package doesn't cover everything
- Reasonable search time (make sure UX is not affected in a negative way)
- The user can select one or multiple teams
- The user can select one or multiple tournaments
- Covered and uncovered games are displayed
- The best price combination is displayed
- Create a shedule, when to subscribe to which package
- Dispaly shedule in a calendar
- The user can select a starting date from when to look
- Added tooltips to the table, for better understanding of the data
  - Games (start time)
  - package tournaments coverage icons

## Technologies
- Python (>= 3.12.7)
- Flask (3.0.3)
- sqlite3
- Node.js (v20.18.0)
- Angular (17.3.0)

## Possible Improvements
- add conversational agent that helps you find the best price plan for your team
- add monthly or yearly budget to the user profile so that the user can get the best price plan for his budget (implemented by passing argument to the optimiser function)
- add an importance order to different tournaments so that the user can get the best price plan for his favorite tournaments
- use external cache to store the data so that the search time is reduced
- update DB to sharded DB to counteract hotspots (Bayern and Barcelona should not be on the same shard)
- use statefull frontend to avoid reloading the team and tournament names every time the user changes the page
- Use a faster LIp solver to all game coverage faster (With the timeframes we are close to 700000 elements in the matrix)
- Use docker for simpler deployment of the backend
- Use a more sophisticated calendar library to display the schedule in the frontend
- Add a user profile to store the user's favorite teams and tournaments
- Use sheduler to periodically run the all_games calculation and store the restults to lessen the load on the server

