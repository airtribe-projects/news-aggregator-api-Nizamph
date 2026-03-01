require('dotenv').config();
const express = require('express');

const app = express();

// Parse incoming JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/users', require('./src/routes/authRoutes'));
app.use('/users', require('./src/routes/userRoutes'));
app.use('/news',  require('./src/routes/newsRoutes'));

module.exports = app;
