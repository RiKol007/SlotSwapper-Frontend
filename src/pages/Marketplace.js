import React, { useEffect, useState } from 'react';
import { swaps, events } from '../api';
import { format } from 'date-fns';

export default function Marketplace(){
  const [slots, setSlots] = useState([]);
  const [mySwappables, setMySwappables] = useState([]);
  const [selectedTheirSlot, setSelectedTheirSlot] = useState(null);
  const [selectedMySlot, setSelectedMySlot] = useState(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const res = await swaps.swappableSlots();
      setSlots(res);
      const mine = await events.list();
      setMySwappables(mine.filter(e => e.status === 'SWAPPABLE'));
    } catch (err) { setMsg(err.message); }
  };

  useEffect(()=> { load(); }, []);

  const requestSwap = async () => {
    if (!selectedTheirSlot || !selectedMySlot) return setMsg('Choose both slots');
    try {
      await swaps.createRequest({ mySlotId: selectedMySlot, theirSlotId: selectedTheirSlot });
      setMsg('Request sent');
      // refresh
      load();
      setSelectedTheirSlot(null);
      setSelectedMySlot(null);
    } catch (err) { setMsg(err.message); }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Marketplace</h2>
      {msg && <div style={{ color: 'green' }}>{msg}</div>}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h3>Available slots</h3>
          {slots.length === 0 && <div>No available slots</div>}
          <ul>
            {slots.map(s => (
              <li key={s._id}>
                <div><strong>{s.title}</strong> ({s.owner?.name || 'user'})</div>
                <div>{format(new Date(s.startTime), 'PPpp')} — {format(new Date(s.endTime), 'PPpp')}</div>
                <button onClick={()=>setSelectedTheirSlot(s._id)}>{selectedTheirSlot === s._id ? 'Selected' : 'Select'}</button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ width: 320 }}>
          <h3>Your SWAPPABLE slots</h3>
          {mySwappables.length === 0 && <div>You have no swappable slots</div>}
          <ul>
            {mySwappables.map(m => (
              <li key={m._id}>
                <div>{m.title} — {format(new Date(m.startTime), 'PPpp')}</div>
                <button onClick={()=>setSelectedMySlot(m._id)}>{selectedMySlot === m._id ? 'Selected' : 'Select'}</button>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 12 }}>
            <button onClick={requestSwap}>Request Swap</button>
          </div>
        </div>
      </div>
    </div>
  );
}
