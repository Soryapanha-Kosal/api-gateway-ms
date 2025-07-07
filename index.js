const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// JWT Middleware
function authToken(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.split(' ')[1];
  if (!token) return res.status(401).json("Missing token");

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json("Invalid token");
    req.user = user;
    next();
  });
}

// ✅ AUTH ROUTES
app.use('/auth', createProxyMiddleware({
  target: 'http://54.89.77.52:4000',
  changeOrigin: true,
  pathRewrite: { '^/auth': '' }, // keeps /register & /login routes intact
}));

// ✅ STUDENT ROUTES (Protected)
app.use('/student', authToken, createProxyMiddleware({
  target: 'http://54.91.176.127:3001',
  changeOrigin: true,
  pathRewrite: { '^/student': '' }, // <–– This line fixes the route
}));

// ✅ TEACHER ROUTES (Protected)
app.use('/teacher', authToken, createProxyMiddleware({
  target: 'http://98.80.15.4:3002',
  changeOrigin: true,
  pathRewrite: { '^/teacher': '' }, // <–– And this too, for teacher
}));

app.listen(3000, () => console.log('✅ API Gateway running on port 3000'));
