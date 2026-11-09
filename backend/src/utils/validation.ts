export const USERNAME_MAX_LENGTH = 50;
export const USER_EMAIL_MAX_LENGTH = 100;
export const CONTACT_EMAIL_MAX_LENGTH = 255;
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_BYTES = 72;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidUsername(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const username = value.trim();
  return username.length > 0 && username.length <= USERNAME_MAX_LENGTH;
}

export function isValidEmail(
  value: unknown,
  maxLength = USER_EMAIL_MAX_LENGTH,
): value is string {
  if (typeof value !== 'string') return false;
  const email = value.trim();
  return email.length > 0 && email.length <= maxLength && EMAIL_PATTERN.test(email);
}

export function isValidPassword(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length >= PASSWORD_MIN_LENGTH &&
    Buffer.byteLength(value, 'utf8') <= PASSWORD_MAX_BYTES
  );
}
