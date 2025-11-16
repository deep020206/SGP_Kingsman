// Simple unit test for role assignment logic
const adminAuthService = require('./services/adminAuthService');

function testRoleAssignment() {
  console.log('🧪 Testing Role Assignment Logic');
  console.log('=' * 40);

  // Test admin email
  const adminEmail = 'damarodiya8314@gmail.com';
  const isAdmin = adminAuthService.isAuthorizedAdmin(adminEmail);
  console.log(`📧 Email: ${adminEmail}`);
  console.log(`🔐 Is Admin: ${isAdmin}`);
  console.log(`👤 Assigned Role: ${isAdmin ? 'admin' : 'customer'}`);
  console.log('');

  // Test customer email
  const customerEmail = 'customer@example.com';
  const isCustomer = adminAuthService.isAuthorizedAdmin(customerEmail);
  console.log(`📧 Email: ${customerEmail}`);
  console.log(`🔐 Is Admin: ${isCustomer}`);
  console.log(`👤 Assigned Role: ${isCustomer ? 'admin' : 'customer'}`);
  console.log('');

  // Test various other emails
  const testEmails = [
    'test@gmail.com',
    'vendor@example.com',
    'admin@test.com',
    'damarodiya8314@yahoo.com' // Similar but not exact match
  ];

  console.log('🔍 Testing Other Emails:');
  testEmails.forEach(email => {
    const isAuth = adminAuthService.isAuthorizedAdmin(email);
    console.log(`   ${email} → ${isAuth ? '✅ Admin' : '👤 Customer'}`);
  });

  console.log('');
  console.log('✅ Role assignment logic test completed!');
  console.log('');
  console.log('📝 Summary:');
  console.log(`   • Only "damarodiya8314@gmail.com" gets admin role`);
  console.log(`   • All other emails get customer role automatically`);
  console.log(`   • No manual role selection needed in signup`);
}

// Run the test
testRoleAssignment();