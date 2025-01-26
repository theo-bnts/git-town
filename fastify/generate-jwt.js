const jwt = require('jsonwebtoken');
const fs = require('fs');

const privateKey = fs.readFileSync('./campus-dev.2024-11-09.private-key 18.19.57.pem', 'utf8');

const payload = {
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 60 * 10,
  iss: '1052137',
};

const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
console.log(token);
