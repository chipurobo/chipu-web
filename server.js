import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { SECURITY_HEADERS } from './security-headers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers on every response, including the SPA fallback below.
// Without them the dashboard can be framed for clickjacking and there is no
// CSP to contain injected script.
app.use((_req, res, next) => {
  res.set(SECURITY_HEADERS);
  next();
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, 'dist')));

// Handle all routes by serving the index.html file
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});