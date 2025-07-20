const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const vitalsRoutes = require('./routes/vitals');
const fitbitRoutes = require('./routes/fitbit'); // ✅ Add this line

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB error:", err));

app.use('/api/auth', authRoutes);
app.use('/api/vitals', vitalsRoutes);
app.use('/fitbit', fitbitRoutes); // ✅ Mount the simulated Fitbit route here

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
