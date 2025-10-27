/**
 * Domain Exception: Invalid Phone Number
 * Thrown when phone number format is invalid
 */
export class InvalidPhoneNumberException extends Error {
  constructor(phone: string, reason?: string) {
    const message = reason
      ? `Invalid phone number "${phone}": ${reason}`
      : `Invalid phone number format: "${phone}"`;
    super(message);
    this.name = 'InvalidPhoneNumberException';
    Object.setPrototypeOf(this, InvalidPhoneNumberException.prototype);
  }
}
