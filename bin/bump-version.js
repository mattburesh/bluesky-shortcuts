const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const bumpType = process.argv[2] || 'patch';

execSync(`npm version ${bumpType} --no-git-tag-version`);

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const newVersion = packageJson.version;

console.log(`Bumped version to ${newVersion}`);