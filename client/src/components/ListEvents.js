import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const ListEvents = () => {
  const [events, setEvents] = useState([]);

  const getEvents = async () => {
    try {
      const response = await fetch('http://localhost:3001/events');
      const jsonData = await response.json();

      setEvents(jsonData);
    } catch (err) {
      console.error(err.message);
    }
  };
  useEffect(() => {
    getEvents();
  }, []);

  return (
    <>
      {' '}
      <table class='table mt-5 text-center'>
        <thead>
          <tr>
            <th>Event</th>
            <th>Created At</th>
            <th>Scheduled For</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {/*<tr>
            <td>John</td>
            <td>Doe</td>
            <td>john@example.com</td>
          </tr> */}
          {events.map((event) => (
            <tr key={event.event_id}>
              <td>{event.type}</td>
              <td>{dayjs(event.created_at).format('DD/MM/YYYY HH:mm:ss')}</td>
              <td>{event.scheduled_for_time}</td>
              <td>{event.state}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ListEvents;
