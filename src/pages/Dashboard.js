import React, { useState, useEffect } from 'react';
import { events } from '../api';


export default function Dashboard(){
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ title:'', startTime:'', endTime:'' });
  const [err, setErr] = useState(null);

  const load = async () => {
    try {
      const res = await events.list();
      setList(res);
    } catch (err) { setErr(err.message); }
  };

  useEffect(()=>{ load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await events.create({
        title: form.title,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        status: 'BUSY'
      });
      setForm({ title:'', startTime:'', endTime:'' });
      load();
    } catch (err) { setErr(err.message); }
  };

  const toggleSwappable = async (ev) => {
    try {
      const newStatus = ev.status === 'SWAPPABLE' ? 'BUSY' : 'SWAPPABLE';
      await events.update(ev._id, { status: newStatus });
      load();
    } catch (err) { setErr(err.message); }
  };

  const remove = async (ev) => {
    if (!window.confirm('Delete event?')) return;
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
    <button type="submit" className="primary">Create Event</button>
  </form>

  {list.map(ev => (
    <div className="event-card" key={ev._id}>
      <div className="title">{ev.title}</div>
      <div className={`status ${ev.status.toLowerCase()}`}>{ev.status}</div>
      <div style={{ marginTop: 8 }}>
        <button className="primary" onClick={()=>toggleSwappable(ev)}>
          {ev.status === 'SWAPPABLE' ? 'Unmark' : 'Make Swappable'}
        </button>
        <button className="reject" onClick={()=>remove(ev)} style={{ marginLeft:8 }}>Delete</button>
      </div>
    </div>
  ))}
</div>

  );
}
