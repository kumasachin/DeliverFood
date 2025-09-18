import { validators, ValidationSchema } from "utils/validation";

// Common validation schemas for different forms
export const validationSchemas = {
  checkout: {
    address: [
      validators.required("Delivery address is required"),
      validators.address("Please include street number, street name, and city"),
    ],
    phone: [
      validators.required("Phone number is required"),
      validators.phone("Phone number must be 10-15 digits"),
    ],
    paymentMethod: [validators.required("Please select a payment method")],
  } as ValidationSchema,

  user: {
    name: [
      validators.required("Name is required"),
      validators.minLength(2, "Name must be at least 2 characters"),
      validators.maxLength(50, "Name cannot exceed 50 characters"),
    ],
    email: [validators.required("Email is required"), validators.email()],
    password: [
      validators.required("Password is required"),
      validators.password(),
    ],
    phone: [
      validators.required("Phone number is required"),
      validators.phone(),
    ],
  } as ValidationSchema,

  restaurant: {
    name: [
      validators.required("Restaurant name is required"),
      validators.minLength(2, "Name must be at least 2 characters"),
      validators.maxLength(100, "Name cannot exceed 100 characters"),
    ],
    description: [
      validators.required("Description is required"),
      validators.minLength(10, "Description must be at least 10 characters"),
      validators.maxLength(500, "Description cannot exceed 500 characters"),
    ],
    address: [validators.required("Address is required"), validators.address()],
    phone: [
      validators.required("Phone number is required"),
      validators.phone(),
    ],
  } as ValidationSchema,

  meal: {
    name: [
      validators.required("Meal name is required"),
      validators.minLength(2, "Name must be at least 2 characters"),
      validators.maxLength(100, "Name cannot exceed 100 characters"),
    ],
    description: [
      validators.required("Description is required"),
      validators.minLength(10, "Description must be at least 10 characters"),
      validators.maxLength(300, "Description cannot exceed 300 characters"),
    ],
    price: [
      validators.required("Price is required"),
      validators.positiveNumber("Price must be greater than 0"),
    ],
    category: [validators.required("Category is required")],
  } as ValidationSchema,

  coupon: {
    code: [
      validators.required("Coupon code is required"),
      validators.minLength(3, "Code must be at least 3 characters"),
      validators.maxLength(20, "Code cannot exceed 20 characters"),
    ],
    description: [
      validators.required("Description is required"),
      validators.minLength(5, "Description must be at least 5 characters"),
    ],
    discount_amount: [
      validators.required("Discount amount is required"),
      validators.positiveNumber("Discount must be greater than 0"),
    ],
  } as ValidationSchema,

  signIn: {
    email: [validators.required("Email is required"), validators.email()],
    password: [validators.required("Password is required")],
  } as ValidationSchema,

  signUp: {
    name: [
      validators.required("Name is required"),
      validators.minLength(2, "Name must be at least 2 characters"),
    ],
    email: [validators.required("Email is required"), validators.email()],
    password: [
      validators.required("Password is required"),
      validators.password(),
    ],
    confirmPassword: [validators.required("Please confirm your password")],
  } as ValidationSchema,
};
