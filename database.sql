
-- 1. Create a new database ral_tasks_queue
CREATE DATABASE ral_tasks_queue;

-- 2. Create table callback
CREATE TABLE IF NOT EXISTS callback(
    callback_id SERIAL PRIMARY KEY,
    label VARCHAR(255) UNIQUE NOT NULL
)

-- 3. Insert callback data into callback table
INSERT INTO callback(label) VALUES ('add');
INSERT INTO callback(label) VALUES ('subtract');
INSERT INTO callback(label) VALUES ('divide');
INSERT INTO callback(label) VALUES ('multiply');

-- 4. Create an ENUM type eventState
DO $$ BEGIN
    CREATE TYPE eventState AS ENUM ('processing', 'failed', 'finished');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 5. Create table events
CREATE TABLE IF NOT EXISTS events(
    event_id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    state eventState NOT NULL DEFAULT 'processing',
    data json,
    scheduled_for_time VARCHAR(255) DEFAULT '1 second',
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT now(),
    callback_id INTEGER NOT NULL REFERENCES callback(callback_id)
)

-- 6. Create function notify_event
CREATE OR REPLACE FUNCTION notify_event()
RETURNS TRIGGER
AS
$$
BEGIN
    PERFORM pg_notify('new_event', row_to_json(NEW)::text);
 	RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger update_event_trigger
CREATE TRIGGER update_event_trigger AFTER INSERT on events
FOR EACH ROW EXECUTE PROCEDURE notify_event();

-- DROP TRIGGER update_event_trigger ON events;
-- DROP FUNCTION notify_event();
