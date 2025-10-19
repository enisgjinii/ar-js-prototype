/**
 * Geolocation utility functions
 */

export interface LocationData {
  lat: number
  lon: number
}

export interface GeolocationError {
  code: number
  message: string
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
    timeout: 15000,
    maximumAge: 600000 // 10 minutes
  }

  const finalOptions = { ...defaultOptions, ...options }

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    errorCallback({
      code: 0,
      message: "Geolocation is not supported by this browser"
    })
    return
  }

  // Try to get current position
  try {
    navigator.geolocation.getCurrentPosition(
      successCallback,
      (error: any) => {
        // Defensive normalization: browsers may pass unexpected shapes
        const code = typeof error?.code === "number" ? error.code : -1
        const message = typeof error?.message === "string" && error.message
          ? error.message
          : getErrorMessage(code)

        const normalizedError: GeolocationError = {
          code,
          message,
        }

        errorCallback(normalizedError)
      },
      finalOptions
    )
  } catch (err) {
    // Unexpected synchronous failure
    const normalizedError: GeolocationError = {
      code: -1,
      message: typeof err === "string" ? err : "An unknown error occurred while accessing geolocation."
    }
    errorCallback(normalizedError)
  }
}

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
    maximumAge: 600000 // 10 minutes
  }

  const finalOptions = { ...defaultOptions, ...options }

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    errorCallback({
      code: 0,
      message: "Geolocation is not supported by this browser"
    })
    return null
  }

  try {
    return navigator.geolocation.watchPosition(
      successCallback,
      (error: any) => {
        const code = typeof error?.code === "number" ? error.code : -1
        const message = typeof error?.message === "string" && error.message
          ? error.message
          : getErrorMessage(code)

        const normalizedError: GeolocationError = {
          code,
          message,
        }
        errorCallback(normalizedError)
      },
      finalOptions
    )
  } catch (err) {
    const normalizedError: GeolocationError = {
      code: -1,
      message: typeof err === "string" ? err : "An unknown error occurred while starting geolocation watch."
    }
    errorCallback(normalizedError)
    return null
  }
}

/**
 * Get user-friendly error message based on error code
 */
export const getErrorMessage = (errorCode: number): string => {
  switch (errorCode) {
    case 1: // PERMISSION_DENIED
      return "Location access denied. Please enable location permissions in your browser settings."
    case 2: // POSITION_UNAVAILABLE
      return "Location information is unavailable. Please check your device settings."
    case 3: // TIMEOUT
      return "The request to get your location timed out. Please try again."
    default:
      return "An unknown error occurred while retrieving your location."
  }
}

/**
 * Check if geolocation is supported
 */
export const isGeolocationSupported = (): boolean => {
  return !!navigator.geolocation
}