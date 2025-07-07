const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());

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

// 👇 Auth Service: expects /auth/register and /auth/login
app.use('/auth', createProxyMiddleware({
  target: 'http://54.89.77.52:4000',
  changeOrigin: true,
}));

// 👇 Student (protected)
app.use('/student', authToken, createProxyMiddleware({
  target: 'http://54.91.176.127:3001',
  changeOrigin: true,
  pathRewrite: { '^/student': '' }
}));

// 👇 Teacher (protected)
app.use('/teacher', authToken, createProxyMiddleware({
  target: 'http://98.80.15.4:3002',
  changeOrigin: true,
  pathRewrite: { '^/teacher': '' }
}));

app.listen(3000, () => {
  console.log('✅ API Gateway running on port 3000');
});
