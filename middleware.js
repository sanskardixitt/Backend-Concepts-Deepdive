const express = require('express');
const app = express();
const PORT = 3000;

const loggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  console.log(`${timestamp} - [${method}] ${path}`);
  next();
};

app.use(loggerMiddleware);

app.get('/', (req, res) => {
  res.status(200).send('Hello Check your console to see the logger middleware in action.');
});

app.get('/about', (req, res) => {
  res.status(200).send('This is the about page.');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
