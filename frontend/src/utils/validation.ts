export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule[];
}

export interface ValidationErrors {
  [fieldName: string]: string;
}

export const validators = {
  required: (message = "This field is required"): ValidationRule => ({
    validate: (value: any) => {
      if (typeof value === "string") return value.trim().length > 0;
      return value != null && value !== "";
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.trim().length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value: string) => value.trim().length <= max,
    message: message || `Cannot exceed ${max} characters`,
  }),

  email: (message = "Please enter a valid email address"): ValidationRule => ({
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  phone: (message = "Please enter a valid phone number"): ValidationRule => ({
    validate: (value: string) => {
      const cleanPhone = value.replace(/\D/g, "");
      return cleanPhone.length >= 10 && cleanPhone.length <= 15;
    },
    message,
  }),

  address: (message = "Please provide a complete address"): ValidationRule => ({
    validate: (value: string) => {
      const trimmed = value.trim();
      if (trimmed.length < 10) return false;
      const addressParts = trimmed.split(/\s+/);
      return addressParts.length >= 3;
    },
    message,
  }),

  number: (message = "Please enter a valid number"): ValidationRule => ({
    validate: (value: any) => !isNaN(Number(value)) && Number(value) >= 0,
    message,
  }),

  positiveNumber: (message = "Must be a positive number"): ValidationRule => ({
    validate: (value: any) => !isNaN(Number(value)) && Number(value) > 0,
    message,
  }),

  password: (
    message = "Password must be at least 8 characters with letters and numbers"
  ): ValidationRule => ({
    validate: (value: string) => {
      return value.length >= 8 && /[A-Za-z]/.test(value) && /[0-9]/.test(value);
    },
    message,
  }),

  confirmPassword: (
    originalPassword: string,
    message = "Passwords do not match"
  ): ValidationRule => ({
    validate: (value: string) => value === originalPassword,
    message,
  }),

  url: (message = "Please enter a valid URL"): ValidationRule => ({
    validate: (value: string) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  custom: (
    validateFn: (value: any) => boolean,
    message: string
  ): ValidationRule => ({
    validate: validateFn,
    message,
  }),
};

export const validateField = (
  value: any,
  rules: ValidationRule[]
): string | null => {
  for (const rule of rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }
  return null;
};

export const validateForm = (
  data: any,
  schema: ValidationSchema
): ValidationErrors => {
  const errors: ValidationErrors = {};

  for (const [fieldName, rules] of Object.entries(schema)) {
    const value = data[fieldName];
    const error = validateField(value, rules);
    if (error) {
      errors[fieldName] = error;
    }
  }

  return errors;
};
