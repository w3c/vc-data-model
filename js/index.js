'use strict';

const fs = require('fs');
const path = require('path');

module.exports = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../contexts/credentials-v1.jsonld'),
    {encoding: 'utf8'}));
