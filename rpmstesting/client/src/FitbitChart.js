// client/src/FitbitChart.js
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale } from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, Title, CategoryScale);

const FitbitChart = () => {
  const [heartRates, setHeartRates] = useState([]);

  useEffect(() => {
    const fetchFitbitData = async () => {
      try {
        const res = await fetch("/fitbit/fetch-data");
        const data = await res.json();
        const hr = data[0]?.value?.restingHeartRate || 0;

        setHeartRates(prev => [...prev.slice(-19), hr]);
      } catch (error) {
        console.error("Error fetching simulated Fitbit data", error);
      }
    };

    fetchFitbitData();
    const interval = setInterval(fetchFitbitData, 5000);
    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: heartRates.map((_, i) => `T-${heartRates.length - i}`),
    datasets: [
      {
        label: "Simulated Resting Heart Rate",
        data: heartRates,
        fill: false,
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.4)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div style={{ width: "80%", margin: "20px auto" }}>
      <h3>Fitbit Heart Rate Chart (Simulated)</h3>
      <Line data={chartData} />
    </div>
  );
};

export default FitbitChart;
