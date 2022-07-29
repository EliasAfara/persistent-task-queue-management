# Project walk through 

## Setup

### PostgreSQL Database

To setup the PostgreSQL database please follow the steps in order.

1. Create a new database *ral_tasks_queue*
2. Create table *callback*
3. Insert callbacks data into table *callback*
4. Create an ENUM type *eventState*
5. Create table *events*
6. Create function *notify_event*
7. Create trigger *update_event_trigger*

Open up [`database.sql`](https://github.com/EliasAfara/red-alert-labs-technical-assessment/blob/master/database.sql) to check the query associated to each step.

### Inside the Project Root Directory

- Run `npm install`
- Create `.env` With these Environmental Variables (Check [`.env.example`](https://github.com/EliasAfara/red-alert-labs-technical-assessment/blob/master/.env.example) for reference)
    1. PG_HOST
    2. PG_PORT
    3. PG_USER
    4. PG_PASSWORD
    5. PG_DATABASE
    6. PG_CONNECTION_STRING
- Run `npm run dev`

### Inside the Client Directory

- Run `npm install`
- Run `npm start`

## Project Structure

### Client

```Bash
client
   |-- .gitignore
   |-- package-lock.json
   |-- package.json
   |-- public
   |   |-- favicon.ico
   |   |-- index.html
   |   |-- logo192.png
   |   |-- logo512.png
   |   |-- manifest.json
   |   |-- robots.txt
   |-- src
   |   |-- App.css
   |   |-- App.js
   |   |-- components
   |   |   |-- Form.js
   |   |   |-- ListEvents.js
   |   |-- index.css
   |   |-- index.js
```

### Server

```Bash
.env.example
.gitignore
README.md
controllers
   |-- callback.js
   |-- events.js
database.sql
db.js
index.js
lib.js
logs
   |-- eventsErrorLog.txt
   |-- eventsLog.txt
package-lock.json
package.json
routes
   |-- callback.js
   |-- events.js
```

## RESTful API endpoints

- CRUD operations on Callback
  - (GET) `/callbacks`, should get the list of all available callbacks
  - (GET) `/callbacks/:id`, should get the details of a specific callback
  - (POST) `/callbacks`, to create a callback
  - (PUT) `/callbacks/:id`, to update an existing callback
  - (DELETE) `/callbacks/:id`, to delete an existing callback

- CRUD operations on Event
  - (GET) `/events`, should get the list of all available events
  - (GET) `/events/:id`, should get the details of a specific event
  - (POST) `/events`, to create an event
  - (PUT) `/events/:id`, to update an existing event
  - (DELETE) `/events/:id`, to delete an existing event

## Future Work 🔜

### Improvements

- Use websocket to send the data after the event state is updated and listen to the client side to rerender the dom and update the displayed events.
- We can log the finished events into their own DB table instead of a file.
- Take into account all the event states and implement code to use them.
- Run several instances of the application, just in case an instance restarts or shutdown, other instances will still be available.

### Different approach

Priority queue: Events executes not according to its scheduled time but according to the event priority inside the database.
The `events` Database table will be almost the same but we will replace `scheduled_for_time` and `scheduled_for` with `priority` and `processed_at`.

Event priority will be assigned by the user. The priority can be a positive numeric value (E.g. from 1 to 10) that is used to determine which events get executed first: events with a higher priority number are executed first.

One can specify the number of events which can be executed at one time within each event Queue.

## Logging 🗄

> Logging each event after its callback has finished executing

Created a custom logger in [index.js](https://github.com/EliasAfara/red-alert-labs-technical-assessment/blob/master/index.js) that saves logs to [eventsLog.txt](https://github.com/EliasAfara/red-alert-labs-technical-assessment/blob/master/logs/eventsLog.txt) file inside logs directory.

> ***PURPOSE:*** For safekeeping and reporting
  
```JS
const { Console } = require('console'); // get the Console class
const fs = require('fs'); // get fs module for creating write streams

// make a new logger
const eventsLogger = new Console({
  stdout: fs.createWriteStream('logs/eventsLog.txt', {
    flags: 'a+',
  }), // a write stream (normal log outputs)
  stderr: fs.createWriteStream('logs/eventsErrorLog.txt', {
    flags: 'a+',
  }), // a write stream (error outputs)
});

eventsLogger.log("Normal logged message");
eventsLogger.error('Error logged message');
```

## Dependencies Installed 🛠

### Server

1. [express](https://www.npmjs.com/package/express) - Fast, unopinionated, minimalist web framework for [node](https://nodejs.org/en/).
2. [cors](https://www.npmjs.com/package/cors) - A node.js package for providing a Connect/Express middleware that can be used to enable [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) with various options.
3. [pg](npmjs.com/package/pg) - Non-blocking PostgreSQL client for Node.js
4. [dotenv](https://www.npmjs.com/package/dotenv) - A zero-dependency module that loads environment variables from a .env file into process.env.
5. [nodemon](https://www.npmjs.com/package/nodemon) - A tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected. (`Installed as a Dev Dependency`)
6. [node-schedule](https://www.npmjs.com/package/node-schedule) - A flexible cron-like and not-cron-like job scheduler for Node.js. It allows you to schedule jobs (arbitrary functions) for execution at specific dates, with optional recurrence rules. It only uses a single timer at any given time (rather than reevaluating upcoming jobs every second/minute).

> Check [package.json](https://github.com/EliasAfara/red-alert-labs-technical-assessment/blob/master/package.json)

### Client

1. [dayjs](https://www.npmjs.com/package/dayjs) - A minimalist JavaScript library that parses, validates, manipulates, and displays dates and times for modern browsers

> Check [package.json](https://github.com/EliasAfara/red-alert-labs-technical-assessment/blob/master/client/package.json)

## Code Snippet Explanation ❗

### PostgreSQL event triggers with Nodejs Listen and Notify

After creating the database and the required tables, the next step is to create a PSQL function `notify_event()` which will send the `new_event` notification whenever it is executed.

```SQL
CREATE OR REPLACE FUNCTION notify_event()
RETURNS TRIGGER
AS
$$
BEGIN
    PERFORM pg_notify('new_event', row_to_json(NEW)::text);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

After that we created the event trigger `update_event_trigger`. Here we’re telling our database to execute our function `notify_event()` whenever a row is added into the events table.

```SQL
CREATE TRIGGER update_event_trigger AFTER INSERT on events
FOR EACH ROW EXECUTE PROCEDURE notify_event();
```

At this point, PSQL is gonna send an event when a row is added, now we’re gonna listen the event on Node.js.

First we connect to out database using the created `pgClient` and then we create the listener.
When ever the event is triggered, PSQL is gonna send a notification, so in order to do stuff with it let’s listen to it.

```JS
pgClient.connect((err, client) => {
  if (err) {
    eventsLogger.error('Error in connecting to database', err);
  } else {
    console.log('Database Connected');

    // listening to event notification after a new event was created
    const query = client.query('LISTEN new_event'); // listener

    // listening to the event
    pgClient.on('notification', async (event) => {
      const payload = JSON.parse(event.payload);
      ...
    });
  }
});
```

### Nodejs Schedule Events

```JS
const schedule = require('node-schedule');
schedule.scheduleJob(scheduled_for, async function () {
            eventsLogger.log(
              JSON.stringify({
                type,
                callback: label,
                created_at,
                scheduled_for,
                output: data.x * data.y,
                state: 'finished',
              })
            );

            updateEventState('finished', event_id);
          });
```

In this snippet, we created a new scheduled job that will execute the callback when the scheduled_for date is reached. Then we are logging the event state update to a log file and updated the state of the event to finished.
