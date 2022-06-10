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