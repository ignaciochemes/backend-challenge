const fs = require('fs');
const path = require('path');

const sourcePath = path.resolve(__dirname, '../seed-data.json');
const distDir = path.resolve(__dirname, '../dist');
const destPath = path.resolve(distDir, 'seed-data.json');

if (!fs.existsSync(distDir)) {
    console.log(`Creating dist directory: ${distDir}`);
    fs.mkdirSync(distDir, { recursive: true });
}

console.log(`Copying seed data from: ${sourcePath}`);
console.log(`                    to: ${destPath}`);

try {
    fs.copyFileSync(sourcePath, destPath);
    console.log('Seed data copied successfully!');
} catch (error) {
    console.error('Error copying seed data:', error.message);
    process.exit(1);
}