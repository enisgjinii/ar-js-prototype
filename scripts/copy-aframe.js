const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'public', 'aframe');
const outFile = path.join(outDir, 'aframe.min.js');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`Copied A-Frame build from ${src} to ${dest}`);
}

let found = false;

// Look for common dist directories and pick any aframe*min.js file
const possibleDirs = [
  path.join(__dirname, '..', 'node_modules', 'aframe', 'dist'),
  path.join(__dirname, '..', 'node_modules', '.pnpm', 'aframe@*', 'node_modules', 'aframe', 'dist'),
  path.join(__dirname, '..', 'node_modules', '.ignored', 'aframe', 'dist'),
];

for (const dir of possibleDirs) {
  try {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => /^aframe.*\.min\.js$/.test(f));
    if (files.length > 0) {
      // prefer v1.x builds if present
      const preferred = files.find(f => /v?1\./.test(f)) || files[0];
      const src = path.join(dir, preferred);
      try {
        copyFile(src, outFile);
        found = true;
        break;
      } catch (e) {
        console.error('Failed to copy from', src, e);
      }
    }
  } catch (e) {
    // glob could fail for pattern dir; ignore
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
