require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME
    });

    const adminEmail = 'test_admin@support.com';
    const userEmail = 'test_user@support.com';

    await User.deleteMany({ email: { $in: [adminEmail, userEmail] } });

    const adminPasswordHash = await bcrypt.hash('admin_password_123', 12);
    await User.create({
      name: 'Test Admin',
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    });

    const userPasswordHash = await bcrypt.hash('user_password_123', 12);
    await User.create({
      name: 'Test User',
      email: userEmail,
      passwordHash: userPasswordHash,
      role: 'USER'
    });

    process.stdout.write('Database seeded successfully\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    process.stderr.write(`Seeding failed: ${error.message}\n`);
    process.exit(1);
  }
};

seed();
