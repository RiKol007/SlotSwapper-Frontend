import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../api';
import { UserContext } from '../App';

export default function Login(){
  const { setUser } = useContext(UserContext);
  const [form, setForm] = useState({ email:'', password:'' });
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await auth.login(form);
      localStorage.setItem('token', res.token);
      setUser(res.user);
      nav('/');
    } catch (err) { setErr(err.message); }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div><input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} /></div>
        <div><input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} /></div>
        <button type="submit">Login</button>
        {err && <div style={{color:'red'}}>{err}</div>}
      </form>
    </div>
  );
}
