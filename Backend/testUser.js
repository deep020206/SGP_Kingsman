const mongoose = require('mongoose');
const { User } = require('./models');

async function checkUser() {
  try {
    await mongoose.connect('mongodb+srv://23it060:00XJRTOZUvLKNXlj@cluster0.sn6d5ao.mongodb.net/sgp_kingsman?retryWrites=true&w=majority&appName=Cluster0');
    
    const user = await User.findOne({ email: 'damarodiya8314@gmail.com' });
    
    if (user) {
      console.log('✅ User found:');
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  Active:', user.isActive);
      console.log('  Created:', user.createdAt);
    } else {
      console.log('❌ User not found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUser();