const fs = require('fs');
const path = require('path');

const servicesPath = path.join(__dirname, '../services.json');
const services = JSON.parse(fs.readFileSync(servicesPath, 'utf-8'));

// Backup original services just in case
fs.writeFileSync(path.join(__dirname, '../services.backup.json'), JSON.stringify(services, null, 2));

for (let service of services) {
  service.price = '0.001000'; // $0.001 per call to allow indexing 1,000 nodes with $1 USD
}

fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2));
console.log('✅ Success: Temporarily lowered all 1000 nodes to $0.001 for the indexing phase.');
console.log('Deploy these changes to Vercel so the live endpoints reflect the $0.001 price.');
