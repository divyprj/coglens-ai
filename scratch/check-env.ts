console.log('Environment variable keys:');
Object.keys(process.env).forEach(key => {
  const value = process.env[key];
  console.log(`  - ${key}: ${value ? 'CONFIGURED (length: ' + value.length + ')' : 'EMPTY'}`);
});
