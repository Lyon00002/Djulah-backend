// utils/phoneNormalizer.js

/**
 * Normalize phone numbers to a consistent format for Cameroon
 * Examples:
 *   690119047 → +237690119047
 *   +237690119047 → +237690119047
 *   237690119047 → +237690119047
 *   +237 690 11 90 47 → +237690119047
 *   690-11-90-47 → +237690119047
 */
export const normalizePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return null;

  // Convert to string and remove all non-digit characters except +
  let normalized = phoneNumber.toString().replace(/[\s\-().]/g, '');

  // Remove leading zeros
  normalized = normalized.replace(/^0+/, '');

  // If it starts with +237, keep it
  if (normalized.startsWith('+237')) {
    return normalized;
  }

  // If it starts with 237 (without +), add the +
  if (normalized.startsWith('237')) {
    return '+' + normalized;
  }

  // If it's a 9-digit number (Cameroon mobile without country code)
  if (normalized.length === 9 && /^6/.test(normalized)) {
    return '+237' + normalized;
  }

  // If it's already normalized or doesn't match expected patterns, return as is with + if not present
  return normalized.startsWith('+') ? normalized : '+237' + normalized;
};

/**
 * Validate if a phone number is a valid Cameroon number
 */
export const isValidCameroonPhone = (phoneNumber) => {
  if (!phoneNumber) return false;

  const normalized = normalizePhoneNumber(phoneNumber);

  // Cameroon numbers should be +237 followed by 9 digits starting with 6
  return /^\+237[6][0-9]{8}$/.test(normalized);
};
