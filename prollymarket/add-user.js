const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];
  const email = process.argv[3];
  const password = process.argv[4];
  const name = process.argv[5] || username;

  if (!username || !email || !password) {
    console.log('Usage: node add-user.js <username> <email> <password> [displayName]');
    console.log('Example: node add-user.js john john@school.edu password123 "John Smith"');
    process.exit(1);
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        username,
        email,
        passwordHash,
        displayName: name,
        approved: true,
      },
    });
    console.log(`Created user: ${user.username} (ID: ${user.id})`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();