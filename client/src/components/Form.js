import React, { useState } from 'react';

const initialData = {
  type: '',
  data: {
    x: 0,
    y: 0,
  },
  scheduled_for_time: '',
};

const Form = () => {
  const [formData, setFormData] = useState(initialData);

  const { type, data, scheduled_for_time } = formData;

  const handleData = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();

    console.log(formData);
    try {
      const response = await fetch('http://localhost:3001/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      console.log(response);

      window.location = '/';
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <>
      <h1 className='text-center mt-5'>Red Alert Labs Technical Assessment</h1>
      <form className='mt-5' onSubmit={onSubmitForm}>
        <div className='form-row'>
          <div className='form-group col-md-6'>
            <label htmlFor='eventTypeSelect'>Event type</label>
            <select
              className='form-control form-select'
              aria-label='Event type select'
              id='eventTypeSelect'
              value={type}
              onChange={(e) => handleData('type', e.target.value)}
            >
              <option value='' disabled>
                Select an event...
              </option>
              <option value='addition'>Addition</option>
              <option value='subtraction'>Subtraction</option>
              <option value='division'>Division</option>
              <option value='multiplication'>Multiplication</option>
            </select>
          </div>
          <div className='form-group col-md-6'>
            <label htmlFor='scheduledForSelect'>Scheduled for</label>
            <select
              className='form-control form-select'
              aria-label='Scheduled for select'
              id='scheduledForSelect'
              value={scheduled_for_time}
              onChange={(e) => handleData('scheduled_for_time', e.target.value)}
            >
              <option value='' disabled>
                Select scheduled for time...
              </option>
              <option value='5 second'>5 seconds</option>
              <option value='30 second'>30 seconds</option>
              <option value='1 minute'>1 minute</option>
              <option value='5 minute'>5 minutes</option>
              <option value='30 minute'>30 minutes</option>
              <option value='1 day'>1 day</option>
              <option value='3 day'>3 days</option>
              <option value='1 month'>1 month</option>
              <option value='2 month'>2 months</option>
              <option value='1 year'>1 year</option>
            </select>
          </div>
        </div>
        <div className='form-row'>
          <div class='form-group col-md-2'>
            <label htmlFor='dataX-value'>Data: x</label>
            <input
              type='number'
              class='form-control'
              id='dataX-value'
              value={data.x}
              onChange={(e) =>
                handleData('data', { ...data, x: e.target.value })
              }
            />
          </div>

          <div class='form-group col-md-2'>
            <label htmlFor='dataY-value'>Data: y</label>
            <input
              type='number'
              class='form-control'
              id='dataY-value'
              value={data.y}
              onChange={(e) =>
                handleData('data', { ...data, y: e.target.value })
              }
            />
          </div>
        </div>

        <button type='submit' class='btn btn-success'>
          Submit
        </button>
      </form>
    </>
  );
};

export default Form;
