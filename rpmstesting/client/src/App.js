import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import './App.css';
import Login from './Login';
import Register from './Register';

//localStorage.removeItem("token");

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [vitals, setVitals] = useState({
    heartRate: '',
    bloodPressure: '',
    temperature: '',
    spo2: ''
  });

  const [history, setHistory] = useState([]);
  const [fitbitHistory, setFitbitHistory] = useState([]);
  const [showRegister, setShowRegister] = useState(false);

  const token = localStorage.getItem("token");

  if (!token) {
    return showRegister ? (
      <>
        <Register onRegister={() => setShowRegister(false)} />
        <p style={{ textAlign: 'center' }}>
          Already have an account? <button onClick={() => setShowRegister(false)}>Login</button>
        </p>
      </>
    ) : (
      <>
        <Login onLogin={() => window.location.reload()} />
        <p style={{ textAlign: 'center' }}>
          Don’t have an account? <button onClick={() => setShowRegister(true)}>Register</button>
        </p>
      </>
    );
  }

  const handleChange = (e) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const vitalData = { ...vitals };

    try {
      const response = await fetch("http://localhost:5000/api/vitals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(vitalData)
      });

      const result = await response.json();
      console.log("Saved:", result);

      if (response.status === 401) {
        localStorage.removeItem("token");
        alert("Session expired. Please log in again.");
        window.location.reload();
      }

    } catch (error) {
      console.error("Error saving vitals:", error);
    }

    setHistory([...history, { time: new Date().toLocaleTimeString(), ...vitals }]);
    setVitals({ heartRate: '', bloodPressure: '', temperature: '', spo2: '' });
  };

  const getChartData = (key, color, source) => ({
    labels: source.map((entry) => entry.time),
    datasets: [
      {
        label: key,
        data: source.map((entry) => parseFloat(entry[key])),
        borderColor: color,
        fill: false
      }
    ]
  });

  const downloadCSV = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/vitals/export");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vitals_export.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV download failed:", err);
    }
  };

  useEffect(() => {
    const fetchFitbitData = async () => {
      try {
        const response = await fetch("http://localhost:5000/fitbit/fetch-data");
        const data = await response.json();
        const hr = data?.value?.restingHeartRate;
        const spo2 = data?.value?.spo2;
        const temperature = data?.value?.temperature;
        const timestamp = new Date().toLocaleTimeString();

        if (hr && spo2 && temperature) {
          setFitbitHistory(prev => {
            const updated = [...prev, { time: timestamp, heartRate: hr, spo2, temperature }];
            return updated.length > 20 ? updated.slice(-20) : updated;
          });

          if (token) {
            fetch("http://localhost:5000/api/vitals", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                heartRate: hr,
                spo2,
                temperature,
                bloodPressure: ''
              })
            })
              .then(res => res.json())
              .then(res => console.log("📤 Auto-submitted simulated vitals:", res))
              .catch(err => console.error("❌ Auto-submit error:", err));
          }
        }
      } catch (err) {
        console.error("Failed to fetch Fitbit data:", err);
      }
    };

    fetchFitbitData();
    const interval = setInterval(fetchFitbitData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>Remote Patient Monitoring System</h1>

      <button style={{ float: 'right', margin: '1rem' }} onClick={() => {
        localStorage.removeItem("token");
        window.location.reload();
      }}>
        Logout
      </button>

      <button onClick={downloadCSV} style={{ margin: '1rem' }}>
        ⬇️ Export Vitals as CSV
      </button>

      <form onSubmit={handleSubmit}>
        <input type="number" name="heartRate" placeholder="Heart Rate" value={vitals.heartRate} onChange={handleChange} required />
        <input type="number" name="bloodPressure" placeholder="Blood Pressure" value={vitals.bloodPressure} onChange={handleChange} required />
        <input type="number" name="temperature" placeholder="Temperature in F" value={vitals.temperature} onChange={handleChange} required />
        <input type="number" name="spo2" placeholder="SpO2" value={vitals.spo2} onChange={handleChange} required />
        <button type="submit">Submit</button>
      </form>

      <div className="charts">
        <h2>Manual Input Charts</h2>
        <div className="chart"><h3>Heart Rate</h3><Line data={getChartData('heartRate', 'blue', history)} /></div>
        <div className="chart"><h3>SpO2</h3><Line data={getChartData('spo2', 'green', history)} /></div>
        <div className="chart"><h3>Temperature</h3><Line data={getChartData('temperature', 'red', history)} /></div>
        <div className="chart"><h3>Blood Pressure</h3><Line data={getChartData('bloodPressure', 'orange', history)} /></div>

        <h2>Simulated Fitbit Charts</h2>
        <div className="chart"><h3>Heart Rate (Simulated)</h3><Line data={getChartData('heartRate', 'purple', fitbitHistory)} /></div>
        <div className="chart"><h3>SpO2 (Simulated)</h3><Line data={getChartData('spo2', 'darkblue', fitbitHistory)} /></div>
        <div className="chart"><h3>Temperature (Simulated)</h3><Line data={getChartData('temperature', 'darkred', fitbitHistory)} /></div>
      </div>
    </div>
  );
}

export default App;
