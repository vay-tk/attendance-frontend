import React, { useState, useEffect } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';

const EditSessionModal = ({ session, isOpen, onClose, onSubmit }) => {
  useEffect(() => {
    if (isOpen) {
      console.log('EditSessionModal mounted for session:', session);
    }
  }, [isOpen, session]);

  const [form, setForm] = useState({
    title: session?.title || '',
    description: session?.description || '',
    date: session?.date ? session.date.slice(0, 10) : '',
    startAt: session?.startAt ? session.startAt.slice(0, 16) : '',
    endAt: session?.endAt ? session.endAt.slice(0, 16) : '',
    mode: session?.mode || 'QR',
    location: session?.location || ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      title: session?.title || '',
      description: session?.description || '',
      date: session?.date ? session.date.slice(0, 10) : '',
      startAt: session?.startAt ? session.startAt.slice(0, 16) : '',
      endAt: session?.endAt ? session.endAt.slice(0, 16) : '',
      mode: session?.mode || 'QR',
      location: session?.location || ''
    });
  }, [session]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const start = new Date(form.startAt);
    const end = new Date(form.endAt);
    if (isNaN(start) || isNaN(end)) {
      setError('Please provide valid start and end times.');
      return;
    }
    if (end <= start) {
      setError('End time must be after start time.');
      return;
    }
    const payload = {
      ...form,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      date: new Date(form.date).toISOString()
    };
    console.log('Submitting session update:', payload);
    onSubmit(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Session">
      <form onSubmit={handleSubmit} className="space-y-3 m-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input name="title" value={form.title} onChange={handleChange} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium">Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="input-field" required />
        </div>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium">Start At</label>
            <input type="datetime-local" name="startAt" value={form.startAt} onChange={handleChange} className="input-field" required />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">End At</label>
            <input type="datetime-local" name="endAt" value={form.endAt} onChange={handleChange} className="input-field" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Mode</label>
          <select name="mode" value={form.mode} onChange={handleChange} className="input-field">
            <option value="QR">QR</option>
            <option value="FACE">FACE</option>
            <option value="HYBRID">HYBRID</option>
            <option value="MANUAL">MANUAL</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input name="location" value={form.location} onChange={handleChange} className="input-field" />
        </div>
        <div className="flex justify-end space-x-2 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSessionModal;
