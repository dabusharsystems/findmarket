import { execSync } from 'child_process';

console.log('Regenerating package-lock.json...');
execSync('npm install --package-lock-only', { stdio: 'inherit', cwd: '/vercel/share/v0-project' });
console.log('package-lock.json regenerated successfully.');
