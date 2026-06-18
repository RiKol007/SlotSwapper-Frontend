import React, { useState, useEffect } from 'react';
import { events } from '../api';

export default function Dashboard(){
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title:'', startTime:'', endTime:'' });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setErr(null);
    setSlow(false);
    const timer = setTimeout(() => setSlow(true), 6000);
    setLoading(true);
    try {
      const res = await events.list();
      setList(res);
    } catch (err) {
      setErr(err.message);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setSlow(false);
    }
  };

  useEffect(()=>{ load(); }, []);

  const validateForm = () => {
    const title = form.title.trim();
    const start = new Date(form.startTime);
    const end = new Date(form.endTime);

    if (!title) return 'Title is required.';
    if (!form.startTime || Number.isNaN(start.getTime())) return 'Start time is required.';
    if (!form.endTime || Number.isNaN(end.getTime())) return 'End time is required.';
    if (end <= start) return 'End time must be after start time.';
    return null;
  };

  const create = async (e) => {
    e.preventDefault();
    setErr(null);
    const validationError = validateForm();
    if (validationError) return setErr(validationError);
    setSaving(true);
    try {
      await events.create({
        title: form.title.trim(),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        status: 'BUSY'
      });
      setForm({ title:'', startTime:'', endTime:'' });
      load();
    } catch (err) {
      setErr(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleSwappable = async (ev) => {
    setErr(null);
    try {
      const newStatus = ev.status === 'SWAPPABLE' ? 'BUSY' : 'SWAPPABLE';
      await events.update(ev._id, { status: newStatus });
      load();
    } catch (err) { setErr(err.message); }
  };

  const remove = async (ev) => {
    if (!window.confirm('Delete event?')) return;
    setErr(null);
    try {
      await events.remove(ev._id);
      load();
    } catch (err) { setErr(err.message); }
  };

  return (
    <div className="container">
      <h2>Your Events</h2>
      <form onSubmit={create}>
        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
        <input type="datetime-local" value={form.startTime} onChange={e=>setForm({...form, startTime:e.target.value})} />
        <input type="datetime-local" value={form.endTime} onChange={e=>setForm({...form, endTime:e.target.value})} />
        <button type="submit" className="primary" disabled={saving}>{saving ? 'Creating...' : 'Create Event'}</button>
      </form>

      {err && <p className="error">{err}</p>}
      {loading && <div className="loading"><span className="spinner" />Loading your events...</div>}
      {slow && <p className="notice">Server is waking up. This can take 30-60 seconds on the free Render plan.</p>}
      {!loading && list.length === 0 && <div className="empty-state">No events yet. Create your first slot above.</div>}

      {list.map(ev => (
        <div className="event-card" key={ev._id}>
          <div className="title">{ev.title}</div>
          <div className="time-range">
            {new Date(ev.startTime).toLocaleString()} - {new Date(ev.endTime).toLocaleString()}
          </div>
          <div className={`status ${ev.status.toLowerCase().replace('_', '-')}`}>{ev.status}</div>
          <div className="actions">
            <button className="primary" onClick={()=>toggleSwappable(ev)}>
              {ev.status === 'SWAPPABLE' ? 'Unmark' : 'Make Swappable'}
            </button>
            <button className="reject" onClick={()=>remove(ev)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
