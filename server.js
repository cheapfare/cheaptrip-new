/**
 * Cheap Trip Today - Node.js Static & Clean URL Server
 * Run: node server.js [port] (default: 3333)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = parseInt(process.argv[2] || process.env.PORT || '3333', 10);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

const SPA_ROUTES = new Set([
  '/',
  '/home',
  '/index',
  '/index.html',
  '/about',
  '/about-us',
  '/about.html',
  '/contact',
  '/contact-us',
  '/contact.html',
  '/privacy',
  '/privacy-policy',
  '/privacy.html',
  '/privacy-policy.html',
  '/terms',
  '/terms-and-conditions',
  '/terms.html',
  '/terms-and-conditions.html',
  '/refund',
  '/refund-policy',
  '/refund.html',
  '/refund-policy.html',
  '/disclaimer',
  '/disclaimer.html',
  '/flights',
  '/results',
  '/flights.html',
  '/checkout',
  '/confirmation'
]);

const server = http.createServer((req, res) => {
  // CORS & No-cache
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Api-Key');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const parsedUrl = url.parse(req.url);
  const cleanPath = (parsedUrl.pathname || '/').replace(/\/$/, '') || '/';

  // Health endpoint
  if (cleanPath === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'healthy', service: 'Cheap Trip Today Server (Node)' }));
  }

  // Airline Reservation landing page
  if (cleanPath === '/airline-reservation' || cleanPath === '/airline-reservation.html') {
    return serveFile(path.join(__dirname, 'airline-reservation.html'), res);
  }

  // SPA Route Clean URL Mapping
  if (SPA_ROUTES.has(cleanPath)) {
    return serveFile(path.join(__dirname, 'index.html'), res);
  }

  // Physical file lookup
  let safePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
  let filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      serveFile(filePath, res);
    } else if (!err && stats.isDirectory()) {
      serveFile(path.join(filePath, 'index.html'), res);
    } else {
      // Clean fallback to index.html for unrecognized routes
      serveFile(path.join(__dirname, 'index.html'), res);
    }
  });
});

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Content-Length': data.length
    });
    res.end(data);
  });
}

server.listen(PORT, () => {
  console.log(`Cheap Trip Today server running at http://localhost:${PORT}`);
});

