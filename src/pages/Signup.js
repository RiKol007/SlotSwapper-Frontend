import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../api';
import { UserContext } from '../App';

export default function Signup(){
  const { setUser } = useContext(UserContext);
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSlow(false);
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return setErr('Name, email, and password are required.');
    }
    if (form.password.length < 8) {
      return setErr('Password must be at least 8 characters.');
    }
    const timer = setTimeout(() => setSlow(true), 6000);
    setLoading(true);
    try {
      const res = await auth.signup(form);
      localStorage.setItem('token', res.token);
      setUser(res.user);
      nav('/');
    } catch (err) {
      setErr(err.message);
    } finally {
      clearTimeout(timer);
      setLoading(false);
      setSlow(false);
    }
  };

  return (
    <div className="container auth-page">
      <h2>Sign Up</h2>
      <form onSubmit={submit}>
        <div><input placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} /></div>
        <div><input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} /></div>
        <div><input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} /></div>
        <button type="submit" className="primary" disabled={loading}>{loading ? 'Creating account...' : 'Sign Up'}</button>
        {loading && <div className="loading"><span className="spinner" />Creating your account...</div>}
        {slow && <p className="notice">Server is waking up. This can take 30-60 seconds on the free Render plan.</p>}
        {err && <div className="error">{err}</div>}
      </form>
    </div>
  );
}
