const buildHome = require('./home/build-all');
const buildApproch = require('./approch/build-all');

console.log('=== Building IP3 Website Data ===\n');

try {
    buildHome();
    console.log('');
    buildApproch();
    console.log('\n=== All builds completed successfully ===');
} catch (err) {
    console.error('\nBuild failed:', err);
    process.exit(1);
}
