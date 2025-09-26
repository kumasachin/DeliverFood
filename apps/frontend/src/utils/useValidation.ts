import { useState, useCallback } from "react";
import {
  ValidationSchema,
  ValidationErrors,
  validateForm,
  validateField,
} from "utils/validation";

export interface UseValidationOptions {
  schema: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseValidationReturn {
  errors: ValidationErrors;
  isValid: boolean;
  hasErrors: boolean;
  validateSingleField: (fieldName: string, value: any) => string | null;
  validateAllFields: (data: any) => boolean;
  clearError: (fieldName: string) => void;
  clearAllErrors: () => void;
  setError: (fieldName: string, message: string) => void;
  getFieldError: (fieldName: string) => string | undefined;
  hasFieldError: (fieldName: string) => boolean;
}

export const useValidation = ({
  schema,
  validateOnChange = true,
  validateOnBlur = true,
}: UseValidationOptions): UseValidationReturn => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setError = useCallback((fieldName: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: message,
    }));
  }, []);

  const validateSingleField = useCallback(
    (fieldName: string, value: any): string | null => {
      const rules = schema[fieldName];
      if (!rules) return null;

      const error = validateField(value, rules);

      setErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }
        return newErrors;
      });

      return error;
    },
    [schema]
  );

  const validateAllFields = useCallback(
    (data: any): boolean => {
      const newErrors = validateForm(data, schema);
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [schema]
  );

  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      return errors[fieldName];
    },
    [errors]
  );

  const hasFieldError = useCallback(
    (fieldName: string): boolean => {
      return !!errors[fieldName];
    },
    [errors]
  );

  const isValid = Object.keys(errors).length === 0;
  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    isValid,
    hasErrors,
    validateSingleField,
    validateAllFields,
    clearError,
    clearAllErrors,
    setError,
    getFieldError,
    hasFieldError,
  };
};

export interface FormFieldProps {
  name: string;
  value: any;
  onChange: (value: any) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string;
}

export const useFormValidation = (
  schema: ValidationSchema,
  initialData: any = {}
) => {
  const [formData, setFormData] = useState(initialData);
  const validation = useValidation({ schema });

  const handleFieldChange = useCallback(
    (fieldName: string, value: any) => {
      setFormData((prev: any) => ({
        ...prev,
        [fieldName]: value,
      }));

      if (validation.hasFieldError(fieldName)) {
        validation.clearError(fieldName);
      }
    },
    [validation]
  );

  const handleFieldBlur = useCallback(
    (fieldName: string) => {
      const value = formData[fieldName];
      validation.validateSingleField(fieldName, value);
    },
    [formData, validation]
  );

  const validateForm = useCallback((): boolean => {
    return validation.validateAllFields(formData);
  }, [formData, validation]);

  const getFieldProps = useCallback(
    (fieldName: string): FormFieldProps => {
      return {
        name: fieldName,
        value: formData[fieldName] || "",
        onChange: (value: any) => handleFieldChange(fieldName, value),
        onBlur: () => handleFieldBlur(fieldName),
        error: validation.hasFieldError(fieldName),
        helperText: validation.getFieldError(fieldName),
      };
    },
    [formData, validation, handleFieldChange, handleFieldBlur]
  );

  const resetForm = useCallback(() => {
    setFormData(initialData);
    validation.clearAllErrors();
  }, [initialData, validation]);

  return {
    formData,
    setFormData,
    validation,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    getFieldProps,
    resetForm,
    isValid: validation.isValid,
    errors: validation.errors,
  };
};
