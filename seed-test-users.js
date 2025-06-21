require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');

const testUsers = [
  {
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@recplus.com',
    password: 'password123',
    role: 'super_admin',
    region: 'montreal',
    department: 'Administration',
    position: 'System Administrator',
    isActive: true,
    isVerified: true,
    emailVerified: true
  },
  {
    firstName: 'Regional',
    lastName: 'Admin',  
    email: 'admin.montreal@recplus.com',
    password: 'password123',
    role: 'admin',
    region: 'montreal',
    department: 'Management',
    position: 'Regional Manager',
    isActive: true,
    isVerified: true,
    emailVerified: true
  },
  {
    firstName: 'Senior',
    lastName: 'Consultant',
    email: 'consultant@recplus.com',
    password: 'password123',
    role: 'consultant',
    region: 'montreal',
    department: 'Recruitment',
    position: 'Senior Consultant',
    isActive: true,
    isVerified: true,
    emailVerified: true
  },
  {
    firstName: 'Tech',
    lastName: 'Employer',
    email: 'employer@recplus.com',
    password: 'password123',
    role: 'employer',
    region: 'montreal',
    department: 'Technology',
    position: 'Hiring Manager',
    isActive: true,
    isVerified: true,
    emailVerified: true
  },
  {
    firstName: 'Dubai',
    lastName: 'Consultant',
    email: 'consultant.dubai@recplus.com',
    password: 'password123',
    role: 'consultant',
    region: 'dubai',
    department: 'Recruitment',
    position: 'Recruitment Consultant',
    isActive: true,
    isVerified: true, 
    emailVerified: true
  },
  {
    firstName: 'Turkey',
    lastName: 'Admin',
    email: 'admin.turkey@recplus.com',
    password: 'password123',
    role: 'admin',
    region: 'turkey',
    department: 'Management',
    position: 'Regional Manager',
    isActive: true,
    isVerified: true,
    emailVerified: true
  }
];

async function seedTestUsers() {
  try {
    // Connect to MongoDB
    const DB = process.env.MONGODB_URI;
    if (!DB) {
      console.error('MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    await mongoose.connect(DB);
    console.log('Connected to MongoDB');

    // Clear existing test users
    console.log('Clearing existing test users...');
    await User.deleteMany({ email: { $in: testUsers.map(user => user.email) } });

    // Hash passwords and create users
    console.log('Creating test users...');
    for (const userData of testUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      console.log(`Created user: ${userData.email} (${userData.role})`);
    }

    console.log('\nTest users created successfully!');
    console.log('\nLogin credentials:');
    testUsers.forEach(user => {
      console.log(`${user.role.replace('_', ' ').toUpperCase()}: ${user.email} / password123`);
    });

  } catch (error) {
    console.error('Error seeding test users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the seeder
seedTestUsers(); 