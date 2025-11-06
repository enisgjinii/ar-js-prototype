const fs = require('fs');
const path = require('path');

const candidates = [
  // common package layouts
  path.join(__dirname, '..', 'node_modules', 'ar.js', 'aframe', 'build', 'aframe-ar.min.js'),
  path.join(__dirname, '..', 'node_modules', 'ar.js', 'build', 'aframe-ar.min.js'),
  path.join(__dirname, '..', 'node_modules', 'ar.js', 'dist', 'aframe', 'build', 'aframe-ar.min.js'),
  // fallback to legacy /lib locations
  path.join(__dirname, '..', 'node_modules', 'ar.js', 'lib', 'aframe', 'aframe-ar.min.js'),
];

const outDir = path.join(__dirname, '..', 'public', 'arjs');
const outFile = path.join(outDir, 'aframe-ar.min.js');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`Copied AR.js build from ${src} to ${dest}`);
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
  console.warn('AR.js build not found in node_modules. Make sure ar.js is installed.');
  // if there's already a file in repo public/arjs, leave it as-is
  const repoFallback = path.join(__dirname, '..', 'public', 'arjs', 'aframe-ar.min.js');
  if (fs.existsSync(repoFallback)) {
    try {
      copyFile(repoFallback, outFile);
      console.log('Copied AR.js from repo fallback');
      found = true;
    } catch (e) {
      console.error('Failed to copy repo fallback', e);
    }
  }
}

if (!found) process.exitCode = 0;
