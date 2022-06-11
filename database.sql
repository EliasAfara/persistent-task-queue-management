CREATE DATABASE ral_tasks_queue;

CREATE TABLE callback(
    callback_id SERIAL PRIMARY KEY,
    label VARCHAR(255) UNIQUE NOT NULL
)

CREATE TABLE events(
    event_id SERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    data json,
    createdAt timestamp with time zone NOT NULL DEFAULT now(),
    callback_id INTEGER NOT NULL REFERENCES callback(callback_id)
)


CREATE OR REPLACE FUNCTION notify_event()
RETURNS TRIGGER
AS
$$
BEGIN
    PERFORM pg_notify('new_event', row_to_json(NEW)::text);
 	RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_event_trigger AFTER INSERT on events
FOR EACH ROW EXECUTE PROCEDURE notify_event();