import React, { useEffect, useState } from 'react';
import { swaps, events } from '../api';
import { format } from 'date-fns';

export default function Marketplace(){
  const [slots, setSlots] = useState([]);
  const [mySwappables, setMySwappables] = useState([]);
  const [selectedTheirSlot, setSelectedTheirSlot] = useState(null);
  const [selectedMySlot, setSelectedMySlot] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);

  const load = async () => {
    setErr('');
    setSlow(false);
    const timer = setTimeout(() => setSlow(true), 6000);
    setLoading(true);
    try {
      const [res, mine] = await Promise.all([
        swaps.swappableSlots(),
        events.list()
      ]);
      setSlots(res);
      setMySwappables(mine.filter(e => e.status === 'SWAPPABLE'));
    } catch (err) {
      setErr(err.message);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setSlow(false);
    }
  };

  useEffect(()=> { load(); }, []);

  const requestSwap = async () => {
    setErr('');
    setMsg('');
    if (!selectedTheirSlot || !selectedMySlot) return setErr('Choose both slots.');
    try {
      await swaps.createRequest({ mySlotId: selectedMySlot, theirSlotId: selectedTheirSlot });
      setMsg('Request sent');
      load();
      setSelectedTheirSlot(null);
      setSelectedMySlot(null);
    } catch (err) { setErr(err.message); }
  };

  return (
    <div className="container">
      <h2>Marketplace</h2>
      {msg && <div className="success">{msg}</div>}
      {err && <div className="error">{err}</div>}
      {loading && <div className="loading"><span className="spinner" />Loading available slots...</div>}
      {slow && <p className="notice">Server is waking up. This can take 30-60 seconds on the free Render plan.</p>}

      <div className="marketplace">
        <div>
          <h3>Available slots</h3>
          {!loading && slots.length === 0 && <div className="empty-state">No available slots right now.</div>}
          <ul className="plain-list">
            {slots.map(s => (
              <li className="marketplace-card" key={s._id}>
                <div><strong>{s.title}</strong> ({s.owner?.name || 'user'})</div>
                <div className="time-range">{format(new Date(s.startTime), 'PPpp')} - {format(new Date(s.endTime), 'PPpp')}</div>
                <button className="primary" onClick={()=>setSelectedTheirSlot(s._id)}>{selectedTheirSlot === s._id ? 'Selected' : 'Select'}</button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Your SWAPPABLE slots</h3>
          {!loading && mySwappables.length === 0 && <div className="empty-state">You have no swappable slots.</div>}
          <ul className="plain-list">
            {mySwappables.map(m => (
              <li className="marketplace-card" key={m._id}>
                <div>{m.title}</div>
                <div className="time-range">{format(new Date(m.startTime), 'PPpp')}</div>
                <button className="primary" onClick={()=>setSelectedMySlot(m._id)}>{selectedMySlot === m._id ? 'Selected' : 'Select'}</button>
              </li>
            ))}
          </ul>

          <div className="actions">
            <button className="primary" onClick={requestSwap}>Request Swap</button>
          </div>
        </div>
      </div>
    </div>
  );
}
