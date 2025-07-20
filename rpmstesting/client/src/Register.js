import React, { useState } from 'react';

function Register({ onRegister }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("✅ Registered! Please login.");
        if (onRegister) onRegister();
      } else {
        setMsg(`❌ ${data.msg}`);
      }
    } catch (err) {
      setMsg("❌ Registration failed.");
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required /><br />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required /><br />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required /><br />
        <button type="submit">Register</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

export default Register;
