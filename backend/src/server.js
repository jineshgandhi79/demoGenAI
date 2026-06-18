require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { initQdrant } = require('./config/qdrant');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedUsers = async () => {
  const adminEmail = 'admin@support.com';
  const userEmail = 'user@support.com';

  const adminExists = await User.findOne({ email: adminEmail });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin_password_123', 12);
    await User.create({
      name: 'System Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN'
    });
  }

  const userExists = await User.findOne({ email: userEmail });
  if (!userExists) {
    const passwordHash = await bcrypt.hash('user_password_123', 12);
    await User.create({
      name: 'Standard User',
      email: userEmail,
      passwordHash,
      role: 'USER'
    });
  }
};

const start = async () => {
  try {
    await connectDB();
    try {
      await initQdrant();
    } catch (qdrantError) {
      process.stdout.write(`Qdrant initialization bypassed or failed: ${qdrantError.message}\n`);
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      process.stdout.write(`Server running on port ${PORT}\n`);
    });
  } catch (error) {
    process.stderr.write(`Failed to start server: ${error.message}\n`);
    process.exit(1);
  }
};

start();
