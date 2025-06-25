const bcrypt = require('bcrypt');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Enter password to hash: ', async (password) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Hashed password:', hashedPassword);
    readline.close();
  } catch (error) {
    console.error('Error hashing password:', error);
    readline.close();
  }
});
