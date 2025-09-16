import { useState } from "react";

type FormFields = Record<string, string | number | boolean>;

export const useFormState = <T extends FormFields>(initialState: T) => {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldError = (field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const reset = () => {
    setValues(initialState);
    setErrors({});
    setIsSubmitting(false);
  };

  const validateRequired = (fields: (keyof T)[]): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    fields.forEach((field) => {
      const value = values[field];
      if (!value || (typeof value === "string" && !value.trim())) {
        newErrors[field] = "This field is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  return {
    values,
    errors,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    setFieldError,
    clearErrors,
    reset,
    validateRequired,
  };
};
