const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// JWT Middleware
function authToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.split(" ")[1];
  if (!token) return res.status(401).json("Missing token");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json("Invalid token");
    req.user = user;
    next();
  });
}

// =================== 🔐 AUTH ROUTES ===================
// Forward /auth/login and /auth/register to Auth MS
app.use('/auth', createProxyMiddleware({
  target: 'http://54.89.77.52:4000',  // Replace with Auth-MS public IP
  changeOrigin: true,
  pathRewrite: {
    '^/auth': '', // remove /auth prefix when forwarding
  },
}));

// =================== 🎓 STUDENT ROUTES ===================
// Protected routes to Student-MS
app.use('/student', authToken, createProxyMiddleware({
  target: 'http://54.91.176.127:3001', // Replace with Student-MS public IP
  changeOrigin: true,
  pathRewrite: {
    '^/student': '', // remove /student prefix
  },
}));

// =================== 🧑‍🏫 TEACHER ROUTES ===================
// Protected routes to Teacher-MS
app.use('/teacher', authToken, createProxyMiddleware({
  target: 'http://98.80.15.4:3002', // Replace with Teacher-MS public IP
  changeOrigin: true,
  pathRewrite: {
    '^/teacher': '', // remove /teacher prefix
  },
}));

// Start Gateway
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ API Gateway running on port ${PORT}`));
