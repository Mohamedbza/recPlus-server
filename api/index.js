require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

//app set up and db connection
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
const DB = process.env.MONGODB_URI;
// Connect to MongoDB
mongoose.connect(DB)
    .then(() => console.log('MongoDB connection successful'))
    .catch((e) => console.error('MongoDB connection error:', e));

// Route imports
const applicationRoutes = require('../routes/applicationRoutes');
const candidateRoutes = require('../routes/candidateRoutes');
const companyRoutes = require('../routes/companyRoutes');
const jobRoutes = require('../routes/jobRoutes');
const skillRoutes = require('../routes/skillRoutes');
const userRoutes = require('../routes/userRoutes');


// Routes
app.use('/api/applications', applicationRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/users', userRoutes);





app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
