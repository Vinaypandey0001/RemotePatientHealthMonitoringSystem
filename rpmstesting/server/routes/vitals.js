const express = require('express');
const router = express.Router();
const Vital = require('../models/Vital');
const User = require('../models/User'); // ✅ To fetch user email
const { Parser } = require('json2csv');
const verifyToken = require('../middleware/auth');
const sendEmailAlert = require('../utils/emailalert'); // ✅ Adjust path if needed

// POST /api/vitals - Save vitals (manual + simulated)
router.post('/', verifyToken, async (req, res) => {
  try {
    const vital = new Vital({
      ...req.body,
      userId: req.userId,
      timestamp: new Date()
    });

    await vital.save();
    console.log("💾 Vitals saved:", vital);

    // ✅ Fetch user email for alert
    const user = await User.findById(req.userId);

    if (user) {
      // SpO2 Alert
      if (vital.spo2 && vital.spo2 < 90) {
        await sendEmailAlert(
          user.email,
          "⚠️ Low SpO₂ Alert",
          `Your SpO₂ level dropped to ${vital.spo2}%. Please take necessary precautions.`
        );
      }

      // Heart Rate Alert
      if (vital.heartRate && vital.heartRate > 100) {
        await sendEmailAlert(
          user.email,
          "⚠️ High Heart Rate Alert",
          `Your heart rate reached ${vital.heartRate} bpm. This is above normal.`
        );
      }

      // Blood Pressure Alert
      if (vital.bloodPressure && parseFloat(vital.bloodPressure) > 140) {
        await sendEmailAlert(
          user.email,
          "⚠️ High Blood Pressure Alert",
          `Your BP reading is ${vital.bloodPressure}. Please consult a physician.`
        );
      }

      // Temperature Alert
      if (vital.temperature && parseFloat(vital.temperature) > 100.4) {
        await sendEmailAlert(
          user.email,
          "⚠️ High Temperature Alert",
          `Your temperature is ${vital.temperature}°F. Possible fever detected.`
        );
      }
    }

    res.status(201).json(vital);
  } catch (err) {
    console.error("❌ Failed to save vitals:", err);
    res.status(500).json({ error: "Failed to save vitals" });
  }
});

// GET /api/vitals - List all vitals
router.get('/', async (req, res) => {
  try {
    const allVitals = await Vital.find().sort({ timestamp: -1 });
    res.json(allVitals);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch vitals" });
  }
});

// GET /api/vitals/export - Export vitals as CSV
router.get('/export', async (req, res) => {
  try {
    const vitals = await Vital.find().lean();

    if (!vitals.length) {
      return res.status(404).send("No vitals found");
    }

    const fields = ['timestamp', 'heartRate', 'bloodPressure', 'temperature', 'spo2'];
    const parser = new Parser({ fields });
    const csv = parser.parse(vitals);

    res.header('Content-Type', 'text/csv');
    res.attachment('vitals_export.csv');
    res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).send("Error generating CSV");
  }
});

module.exports = router;
