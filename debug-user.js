const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function debug() {
  try {
    console.log('Checking user in database...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'admin@blessinghope.co.tz' }
    });

    if (!user) {
      console.log('User NOT found!');
      return;
    }

    console.log('User found!');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Password hash (first 30 chars):', user.passwordHash.substring(0, 30) + '...');
    
    const isValid = await bcrypt.compare('Admin@123', user.passwordHash);
    console.log('Password valid?', isValid ? 'YES' : 'NO');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debug();
