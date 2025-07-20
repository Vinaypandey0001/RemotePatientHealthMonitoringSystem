const express = require("express");
const router = express.Router();

router.get("/fetch-data", (req, res) => {
  const simulatedData = {
    dateTime: new Date().toISOString().split("T")[0],
    value: {
      restingHeartRate: Math.floor(Math.random() * 20 + 60), // 60–80 bpm
      spo2: Math.floor(Math.random() * 5 + 94),               // 94–98%
      temperature: parseFloat((97 + Math.random() * 2).toFixed(1)) // 97.0–99.0°F
    }
  };

  res.json(simulatedData);
});

module.exports = router;
