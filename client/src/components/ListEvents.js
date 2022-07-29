import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const ListEvents = () => {
  const [events, setEvents] = useState([]);

  const getEvents = async () => {
    try {
      const response = await fetch('http://localhost:3001/events');
      const jsonData = await response.json();

      setEvents(jsonData.reverse());
    } catch (err) {
      console.error(err.message);
    }
  };

  const deleteEvent = async (event_id) => {
    try {
      const event = await fetch(`http://localhost:3001/events/${event_id}`, {
        method: 'DELETE',
      });

      console.log(event);

      setEvents(events.filter((event) => event.event_id !== event_id));
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
      <table className='table mt-5 text-center'>
        <thead>
          <tr>
            <th>Order</th>
            <th>Event</th>
            <th>Created At</th>
            <th>Scheduled For</th>
            <th>Start After</th>
            <th>State</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.event_id}>
              <td>{event.event_id}</td>
              <td>{event.type}</td>
              <td>{dayjs(event.created_at).format('DD/MM/YYYY HH:mm:ss')}</td>
              <td>
                {dayjs(event.scheduled_for).format('DD/MM/YYYY HH:mm:ss')}
              </td>
              <td>{event.scheduled_for_time}</td>
              <td>{event.state}</td>
              <td>
                <button
                  className='btn btn-danger'
                  onClick={() => deleteEvent(event.event_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ListEvents;
