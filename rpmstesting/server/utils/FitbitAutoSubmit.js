const axios = require('axios');
require('dotenv').config();

// Replace this with a real JWT token from your login
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MDM0NDVkZmI2ZGUwYzViZTFmNjk5YyIsImlhdCI6MTc0NzY4OTAyOCwiZXhwIjoxNzQ3Nzc1NDI4fQ.6chGZtkk3hbTXmACQfqQ-M9FoPHaxybVur88vouPiXI";

const autoSubmitVitals = async () => {
  try {
    // Step 1: Fetch heart rate from Fitbit
    const fitbitData = await axios.get("http://localhost:5000/api/fitbit/data");
    const heartData = fitbitData.data["activities-heart"];
    const heartRate = heartData?.[0]?.value?.restingHeartRate || 80;

    // Step 2: Prepare vitals payload
    const vitals = {
      heartRate,
      bloodPressure: 120,
      temperature: 98.6,
      spo2: 97
    };

    // Step 3: Submit to /api/vitals
    const res = await axios.post("http://localhost:5000/api/vitals", vitals, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("✅ Fitbit vitals submitted:", res.data);
  } catch (err) {
    console.error("❌ Auto submission failed:", err.message);
  }
};

autoSubmitVitals();
