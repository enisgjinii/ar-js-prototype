/**
 * Simple verification script for geolocation error handling
 */

// Import our geolocation utility functions
const { getDetailedErrorMessage } = require('../lib/geolocation');

console.log('Testing geolocation error handling...');

// Test kCLErrorLocationUnknown
const unknownError = getDetailedErrorMessage(2, 'kCLErrorLocationUnknown');
console.log('kCLErrorLocationUnknown:', unknownError);

// Test kCLErrorDenied
const deniedError = getDetailedErrorMessage(1, 'kCLErrorDenied');
console.log('kCLErrorDenied:', deniedError);

// Test kCLErrorNetwork
const networkError = getDetailedErrorMessage(2, 'kCLErrorNetwork');
console.log('kCLErrorNetwork:', networkError);

// Test fallback to standard messages
const fallbackError = getDetailedErrorMessage(1, 'User denied Geolocation');
console.log('Fallback error:', fallbackError);

console.log('Verification complete!');
