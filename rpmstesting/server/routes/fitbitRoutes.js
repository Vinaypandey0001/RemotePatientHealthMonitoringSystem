const express = require('express');
const axios = require('axios');
const qs = require('qs');
const router = express.Router();
require('dotenv').config();

const CLIENT_ID = process.env.FITBIT_CLIENT_ID;
const CLIENT_SECRET = process.env.FITBIT_CLIENT_SECRET;
const REDIRECT_URI = process.env.FITBIT_REDIRECT_URI;
let access_token = '';

router.get('/auth', (req, res) => {
  const scope = 'heartrate activity temperature profile';
  const authURL = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scope)}`;
  res.redirect(authURL);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const response = await axios.post('https://api.fitbit.com/oauth2/token',
      qs.stringify({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code
      }),
      {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    access_token = response.data.access_token;
    console.log('✅ Fitbit Access Token received:', access_token);
    res.send("Fitbit connected successfully. You can close this tab.");
  } catch (error) {
    console.error('❌ Fitbit token error:', error.message);
    res.status(500).send("Failed to connect Fitbit.");
  }
});

router.get('/data', async (req, res) => {
  if (!access_token) return res.status(401).json({ msg: "Not connected to Fitbit" });
  try {
    const today = new Date().toISOString().split('T')[0];
    const fitbitData = await axios.get(`https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    res.json(fitbitData.data);
  } catch (error) {
    console.error('❌ Fitbit fetch error:', error.message);
    res.status(500).json({ msg: "Error fetching Fitbit data" });
  }
});

module.exports = router;
