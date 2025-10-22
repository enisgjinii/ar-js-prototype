/**
 * Geolocation utility functions
 */

export interface LocationData {
  lat: number;
  lon: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

/**
 * Get current position with improved error handling
 */
export const getCurrentPosition = (
  successCallback: (position: GeolocationPosition) => void,
  errorCallback: (error: GeolocationError) => void,
  options?: PositionOptions
): void => {
  // Default options
  const defaultOptions: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 30000, // increased timeout to reduce false timeouts on slow devices
    maximumAge: 600000, // 10 minutes
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    errorCallback({
      code: 0,
      message: 'Geolocation is not supported by this browser',
    });
    return;
  }

  // If Permissions API is available, try to pre-check permission state
  try {
    if (
      (navigator as any).permissions &&
      typeof (navigator as any).permissions.query === 'function'
    ) {
      // Note: the Permissions API may not include 'geolocation' in all browsers
      (navigator as any).permissions
        .query({ name: 'geolocation' })
        .then((status: any) => {
          // possible states: 'granted', 'prompt', 'denied'
          if (status.state === 'denied') {
            errorCallback({
              code: 1,
              message:
                'Location access denied. Please enable location permissions in your browser settings.',
            });
            return;
          }
        })
        .catch(() => {
          // ignore permission check failures
        });
    }
  } catch (e) {
    // ignore
  }

  // Try to get current position
  try {
    navigator.geolocation.getCurrentPosition(
      successCallback,
      (error: any) => {
        // Defensive normalization: browsers may pass unexpected shapes
        const code = typeof error?.code === 'number' ? error.code : -1;
        const message =
          typeof error?.message === 'string' && error.message
            ? error.message
            : getErrorMessage(code);

        const normalizedError: GeolocationError = {
          code,
          message,
        };

        errorCallback(normalizedError);
      },
      finalOptions
    );
  } catch (err) {
    // Unexpected synchronous failure
    const normalizedError: GeolocationError = {
      code: -1,
      message:
        typeof err === 'string'
          ? err
          : 'An unknown error occurred while accessing geolocation.',
    };
    errorCallback(normalizedError);
  }
};

/**
 * Watch position with improved error handling
 */
export const watchPosition = (
  successCallback: (position: GeolocationPosition) => void,
  errorCallback: (error: GeolocationError) => void,
  options?: PositionOptions
): number | null => {
  // Default options
  const defaultOptions: PositionOptions = {
    enableHighAccuracy: false,
    timeout: 15000,
    maximumAge: 600000, // 10 minutes
  };

  const finalOptions = { ...defaultOptions, ...options };

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    errorCallback({
      code: 0,
      message: 'Geolocation is not supported by this browser',
    });
    return null;
  }

  try {
    return navigator.geolocation.watchPosition(
      successCallback,
      (error: any) => {
        const code = typeof error?.code === 'number' ? error.code : -1;
        const message =
          typeof error?.message === 'string' && error.message
            ? error.message
            : getErrorMessage(code);

        const normalizedError: GeolocationError = {
          code,
          message,
        };
        errorCallback(normalizedError);
      },
      finalOptions
    );
  } catch (err) {
    const normalizedError: GeolocationError = {
      code: -1,
      message:
        typeof err === 'string'
          ? err
          : 'An unknown error occurred while starting geolocation watch.',
    };
    errorCallback(normalizedError);
    return null;
  }
};

/**
 * Get user-friendly error message based on error code
 */
export const getErrorMessage = (errorCode: number): string => {
  switch (errorCode) {
    case 1: // PERMISSION_DENIED
      return 'Location access denied. Please enable location permissions in your browser settings.';
    case 2: // POSITION_UNAVAILABLE
      return 'Location information is unavailable. Please check your device settings.';
    case 3: // TIMEOUT
      return 'The request to get your location timed out. Please try again.';
    default:
      return 'An unknown error occurred while retrieving your location.';
  }
};

/**
 * Check if geolocation is supported
 */
export const isGeolocationSupported = (): boolean => {
  return !!navigator.geolocation;
};

/**
 * Compute an approximate east/north/up offset in meters from a reference
 * coordinate (fromLat, fromLon, fromAlt) to a target coordinate
 * (toLat, toLon, toAlt).
 *
 * This uses a local flat-earth approximation (Equirectangular / small-distance)
 * which is suitable for distances up to a few kilometers and is lightweight for
 * client-side AR placement. For higher accuracy over larger distances use a
 * geodetic library (geodesy) or proj4.
 */
export interface MetersOffset {
  east: number; // +east (meters)
  north: number; // +north (meters)
  up: number; // +up (meters)
}

export const computeOffsetMeters = (
  fromLat: number,
  fromLon: number,
  toLat: number,
  toLon: number,
  fromAlt: number = 0,
  toAlt: number = 0
): MetersOffset => {
  // WGS84 mean radius in meters (approx)
  const R = 6378137;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(toLat - fromLat);
  const dLon = toRad(toLon - fromLon);

  // Use the average latitude for longitude scaling
  const meanLat = toRad((fromLat + toLat) / 2);

  // North offset (meters)
  const north = dLat * R;

  // East offset (meters)
  const east = dLon * R * Math.cos(meanLat);

  const up = toAlt - fromAlt;

  return {
    east,
    north,
    up,
  };
};

/**
 * Convert the computed offset (east,north,up) into a simple right-handed
 * Babylon-friendly coordinate triple. Babylon's typical forward direction is
 * -Z (camera looks towards -Z in many default setups), so we map:
 *   x = +east
 *   y = +up
 *   z = -north
 *
 * This function is intentionally simple and deterministic; callers may tweak
 * axes if their scene uses a different convention.
 */
export const offsetToBabylonCoords = (offset: MetersOffset) => {
  return {
    x: offset.east,
    y: offset.up,
    z: -offset.north,
  };
};

/**
 * Promise wrapper around getCurrentPosition for async/await usage.
 */
export const getCurrentPositionAsync = (options?: PositionOptions): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    getCurrentPosition(
      (pos) => resolve(pos),
      (err) => reject(err),
      options
    );
  });
};

/**
 * Convert lat/lon directly to Babylon coordinates given the user's known
 * location. This is useful when you already have both positions and don't
 * need to request browser geolocation.
 */
export const convertLatLonToBabylonCoords = (
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number,
  userAlt: number = 0,
  targetAlt: number = 0
) => {
  const offset = computeOffsetMeters(userLat, userLon, targetLat, targetLon, userAlt, targetAlt);
  return offsetToBabylonCoords(offset);
};

/**
 * Compute Babylon coordinates for a target lat/lon by using the device's
 * current geolocation. Returns a promise resolving to { x, y, z }.
 */
export const computeBabylonCoordsForTarget = async (
  targetLat: number,
  targetLon: number,
  options?: PositionOptions
): Promise<{ x: number; y: number; z: number }> => {
  const pos = await getCurrentPositionAsync(options);
  const userLat = pos.coords.latitude;
  const userLon = pos.coords.longitude;
  const userAlt = pos.coords.altitude ?? 0;
  const babylon = convertLatLonToBabylonCoords(userLat, userLon, targetLat, targetLon, userAlt, 0);
  return babylon;
};
