import React, { useEffect, useState } from 'react';
import { swaps } from '../api';
import { format } from 'date-fns';

export default function Requests(){
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const res = await swaps.myRequests();
      setIncoming(res.incoming);
      setOutgoing(res.outgoing);
    } catch (err) { setMsg(err.message); }
  };

  useEffect(()=> { load(); }, []);

  const respond = async (id, accept) => {
    try {
      await swaps.respond(id, { accept });
      setMsg(accept ? 'Accepted' : 'Rejected');
      load();
    } catch (err) { setMsg(err.message); }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Requests</h2>
      {msg && <div>{msg}</div>}

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <h3>Incoming</h3>
          {incoming.length === 0 && <div>No incoming requests</div>}
          <ul>
            {incoming.map(r => (
              <li key={r._id}>
                <div><strong>{r.fromUser?.name}</strong> offered <em>{r.mySlot?.title}</em> for your <em>{r.theirSlot?.title}</em></div>
                <div>When: {format(new Date(r.createdAt), 'PPpp')}</div>
                <div>
                  <button onClick={()=>respond(r._id, true)}>Accept</button>
                  <button onClick={()=>respond(r._id, false)} style={{ marginLeft:8 }}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ width: 360 }}>
          <h3>Outgoing</h3>
          {outgoing.length === 0 && <div>No outgoing requests</div>}
          <ul>
            {outgoing.map(r => (
              <li key={r._id}>
                <div>To <strong>{r.toUser?.name}</strong> — {r.mySlot?.title} for {r.theirSlot?.title}</div>
                <div>Status: {r.status}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
