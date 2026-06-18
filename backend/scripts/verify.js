const app = require('../src/app');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

process.stdout.write('Sanity check passed: All files imported and loaded without syntax errors.\n');
process.exit(0);