const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Redirect old domains to irl.ing
app.use((req, res, next) => {
  const host = req.hostname;
  if (host === 'b0b.dev' || host === 'www.b0b.dev' ||
      host === '1-800-bob-ross.com' || host === 'www.1-800-bob-ross.com') {
    return res.redirect(301, 'https://irl.ing' + req.originalUrl);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});