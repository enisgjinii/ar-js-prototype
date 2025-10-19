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
  navigator.geolocation.getCurrentPosition(
    successCallback,
    (error) => {
      // Normalize error object
      const normalizedError: GeolocationError = {
        code: error.code,
        message: error.message || getErrorMessage(error.code)
      }
      errorCallback(normalizedError)
    },
    finalOptions
  )
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

  // Start watching position
  return navigator.geolocation.watchPosition(
    successCallback,
    (error) => {
      // Normalize error object
      const normalizedError: GeolocationError = {
        code: error.code,
        message: error.message || getErrorMessage(error.code)
      }
      errorCallback(normalizedError)
    },
    finalOptions
  )
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