const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://slotswapper-backend-ob57.onrender.com/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    if (!res.ok) throw new Error(data?.message || res.statusText || 'Request failed');
    return data;
  } catch (err) {
    if (err.name === 'TypeError') {
      throw new Error('Cannot reach the server. It may still be waking up, so please try again in a moment.');
    }
    throw err;
  }
}

export const auth = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
};

export const events = {
  list: () => request('/events'),
  create: (payload) => request('/events', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id) => request(`/events/${id}`, { method: 'DELETE' })
};

export const swaps = {
  swappableSlots: () => request('/swappable-slots'),
  createRequest: (payload) => request('/swap-request', { method: 'POST', body: JSON.stringify(payload) }),
  respond: (requestId, payload) => request(`/swap-response/${requestId}`, { method: 'POST', body: JSON.stringify(payload) }),
  myRequests: () => request('/requests/me')
};
