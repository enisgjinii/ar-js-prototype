const fs = require('fs');
const path = require('path');

const candidates = [
  path.join(__dirname, '..', 'node_modules', 'aframe', 'dist', 'aframe.min.js'),
  path.join(__dirname, '..', 'node_modules', 'aframe', 'build', 'aframe.min.js'),
];

const outDir = path.join(__dirname, '..', 'public', 'aframe');
const outFile = path.join(outDir, 'aframe.min.js');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`Copied A-Frame build from ${src} to ${dest}`);
}

let found = false;
for (const candidate of candidates) {
  if (fs.existsSync(candidate)) {
    try {
      copyFile(candidate, outFile);
      found = true;
      break;
    } catch (e) {
      console.error('Failed to copy from', candidate, e);
    }
  }
}

if (!found) {
  console.warn('A-Frame build not found in node_modules. Make sure aframe is installed.');
  const repoFallback = path.join(__dirname, '..', 'public', 'aframe', 'aframe.min.js');
  if (fs.existsSync(repoFallback)) {
    try {
      copyFile(repoFallback, outFile);
      console.log('Copied A-Frame from repo fallback');
      found = true;
    } catch (e) {
      console.error('Failed to copy repo fallback', e);
    }
  }
}

if (!found) process.exitCode = 0;
