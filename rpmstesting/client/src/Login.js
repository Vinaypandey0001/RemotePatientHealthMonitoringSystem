import React, { useState } from 'react';

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.msg || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      console.log('✅ Logged in:', data);

      if (onLogin) onLogin(); // Refresh App.js

    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Login to RPMS</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ margin: '0.5rem', padding: '0.5rem', width: '200px' }}
        /><br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ margin: '0.5rem', padding: '0.5rem', width: '200px' }}
        /><br />
        <button type="submit" style={{ padding: '0.5rem 1rem', marginTop: '1rem' }}>Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;
