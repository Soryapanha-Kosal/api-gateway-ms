const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Update with actual IPs of your EC2 instances running Student and Teacher
app.use('/student', createProxyMiddleware({
  target: 'http://54.91.176.127:3001',
  changeOrigin: true
}));

app.use('/teacher', createProxyMiddleware({
  target: 'http://98.80.15.4:3002',
  changeOrigin: true
}));

app.listen(3000, () => console.log('API Gateway running on port 3000'));
