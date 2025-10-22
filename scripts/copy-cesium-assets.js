const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// This script copies Cesium's Build output into public/cesium so the dev server
// can serve static assets (workers, images, json).

// Try a few known locations for Cesium assets. Newer packages expose a `Source`
// tree (with Assets, Workers, Widget, ThirdParty) instead of a built `Build/Cesium`
// folder. We'll detect either layout and copy the appropriate files into
// public/cesium so Cesium can load them at runtime from /cesium/*.
const candidates = [
  // original pnpm flattened path (older script)
  path.join(__dirname, '..', 'node_modules', '.pnpm'),
  // direct node_modules path
  path.join(__dirname, '..', 'node_modules', 'cesium'),
  // pnpm structure
  path.join(__dirname, '..', 'node_modules', '.pnpm', 'cesium@1.134.1', 'node_modules', 'cesium'),
  path.join(__dirname, '..', 'node_modules', '.pnpm', 'cesium@*'),
];

let found = null;

// Check for pnpm structure first
const pnpmDir = path.join(__dirname, '..', 'node_modules', '.pnpm');
if (fs.existsSync(pnpmDir)) {
  const entries = fs.readdirSync(pnpmDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('cesium@')) {
      const cesiumPath = path.join(pnpmDir, entry.name, 'node_modules', 'cesium');
      if (fs.existsSync(cesiumPath)) {
        // Check for Build/Cesium
        const buildPath = path.join(cesiumPath, 'Build', 'Cesium');
        if (fs.existsSync(buildPath)) {
          found = { type: 'build', path: buildPath };
          break;
        }

        // Check for Source layout
        const sourcePath = path.join(cesiumPath, 'Source');
        if (fs.existsSync(sourcePath)) {
          found = { type: 'source', path: sourcePath };
          break;
        }
      }
    }
  }
}

// If not found in pnpm, check direct node_modules
if (!found) {
  const directPath = path.join(__dirname, '..', 'node_modules', 'cesium');
  if (fs.existsSync(directPath)) {
    // Check for Build/Cesium
    const buildPath = path.join(directPath, 'Build', 'Cesium');
    if (fs.existsSync(buildPath)) {
      found = { type: 'build', path: buildPath };
    }

    // Check for Source layout
    const sourcePath = path.join(directPath, 'Source');
    if (fs.existsSync(sourcePath)) {
      found = { type: 'source', path: sourcePath };
    }
  }
}

if (!found) {
  console.error('Could not find Cesium Build or Source directory. Make sure "cesium" is installed.');
  process.exit(1);
}

const dest = path.join(__dirname, '..', 'public', 'cesium');

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (found.type === 'build') {
  console.log(`Copying Cesium Build assets from ${found.path} to ${dest} ...`);
  copyDir(found.path, dest);
  console.log('Done.');
} else if (found.type === 'source') {
  // From Source we only need to copy the static asset folders that Cesium
  // expects at runtime. This includes Assets (images/json), Widget images,
  // Workers, and ThirdParty shaders/fonts/etc. We'll mirror them into public/cesium
  // so paths like /cesium/Assets/... or /cesium/Workers/... resolve.
  console.log(`Detected Source layout at ${found.path}. Copying runtime assets to ${dest} ...`);
  const foldersToCopy = ['Assets', 'Widget', 'Workers', 'ThirdParty'];
  for (const name of foldersToCopy) {
    const s = path.join(found.path, name);
    if (fs.existsSync(s)) {
      copyDir(s, path.join(dest, name));
    } else {
      console.warn(`Warning: expected folder ${s} not found, skipping.`);
    }
  }
  // Copy top-level approximateTerrainHeights.json if present inside Assets
  const approx = path.join(found.path, 'Assets', 'approximateTerrainHeights.json');
  if (fs.existsSync(approx)) {
    copyDir(path.join(found.path, 'Assets'), path.join(dest, 'Assets'));
  }
  console.log('Done.');
} else {
  console.error('Unknown layout type for Cesium assets.');
  process.exit(1);
}