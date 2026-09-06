export function normalizePhoneNumber(phone: string): string {
  // Strip all non-digit characters except the leading '+'
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // If it doesn't start with '+', assume India '+91' for now (or require explicit country codes in the future)
  if (!normalized.startsWith('+')) {
    // Basic heuristic: if it's 10 digits, prefix +91
    if (normalized.length === 10) {
      normalized = '+91' + normalized;
    } else {
      normalized = '+' + normalized;
    }
  }
  return normalized;
}
