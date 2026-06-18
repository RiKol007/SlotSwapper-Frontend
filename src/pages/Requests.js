import React, { useEffect, useState } from 'react';
import { swaps } from '../api';
import { format } from 'date-fns';

export default function Requests(){
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
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
      const res = await swaps.myRequests();
      setIncoming(res.incoming);
      setOutgoing(res.outgoing);
    } catch (err) {
      setErr(err.message);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setSlow(false);
    }
  };

  useEffect(()=> { load(); }, []);

  const respond = async (id, accept) => {
    setErr('');
    setMsg('');
    try {
      await swaps.respond(id, { accept });
      setMsg(accept ? 'Accepted' : 'Rejected');
      load();
    } catch (err) { setErr(err.message); }
  };

  return (
    <div className="container">
      <h2>Requests</h2>
      {msg && <div className="success">{msg}</div>}
      {err && <div className="error">{err}</div>}
      {loading && <div className="loading"><span className="spinner" />Loading requests...</div>}
      {slow && <p className="notice">Server is waking up. This can take 30-60 seconds on the free Render plan.</p>}

      <div className="request-grid">
        <div>
          <h3>Incoming</h3>
          {!loading && incoming.length === 0 && <div className="empty-state">No incoming requests.</div>}
          <ul className="plain-list">
            {incoming.map(r => (
              <li className="request-card" key={r._id}>
                <div><strong>{r.fromUser?.name}</strong> offered <em>{r.mySlot?.title}</em> for your <em>{r.theirSlot?.title}</em></div>
                <div className="time-range">When: {format(new Date(r.createdAt), 'PPpp')}</div>
                <div className="actions">
                  <button className="accept" onClick={()=>respond(r._id, true)}>Accept</button>
                  <button className="reject" onClick={()=>respond(r._id, false)}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3>Outgoing</h3>
          {!loading && outgoing.length === 0 && <div className="empty-state">No outgoing requests.</div>}
          <ul className="plain-list">
            {outgoing.map(r => (
              <li className="request-card" key={r._id}>
                <div>To <strong>{r.toUser?.name}</strong> - {r.mySlot?.title} for {r.theirSlot?.title}</div>
                <div className={`status ${r.status.toLowerCase()}`}>Status: {r.status}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
