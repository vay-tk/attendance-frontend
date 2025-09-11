export const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password) => {
    // At least 8 characters, one uppercase, one lowercase, one digit, one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  phone: (phone) => {
    // Indian phone number format
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  },

  courseCode: (code) => {
    // Format like CS101, EE201
    const codeRegex = /^[A-Z]{2}\d{3}$/;
    return codeRegex.test(code);
  },

  rollNumber: (rollNo) => {
    return rollNo && rollNo.length > 0 && rollNo.length <= 20;
  },

  employeeId: (empId) => {
    return empId && empId.length > 0 && empId.length <= 20;
  },

  name: (name) => {
    const nameRegex = /^[a-zA-Z\s]{2,100}$/;
    return nameRegex.test(name);
  },

  required: (value) => {
    return value !== null && value !== undefined && value.toString().trim().length > 0;
  },

  minLength: (value, min) => {
    return value && value.length >= min;
  },

  maxLength: (value, max) => {
    return !value || value.length <= max;
  },

  isPositiveNumber: (value) => {
    return !isNaN(value) && parseFloat(value) > 0;
  },

  isValidFile: (file, allowedTypes = ['image/jpeg', 'image/png'], maxSize = 20 * 1024 * 1024) => {
    if (!file) return false;
    
    const isValidType = allowedTypes.includes(file.type);
    const isValidSize = file.size <= maxSize;
    
    return isValidType && isValidSize;
  },
};

export const getValidationMessage = {
  email: 'Please enter a valid email address',
  password: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  phone: 'Please enter a valid 10-digit Indian phone number',
  courseCode: 'Course code must be in format like CS101, EE201',
  rollNumber: 'Roll number is required and must be between 1-20 characters',
  employeeId: 'Employee ID is required and must be between 1-20 characters',
  name: 'Name must be 2-100 characters and contain only letters and spaces',
  required: 'This field is required',
  minLength: (min) => `Minimum ${min} characters required`,
  maxLength: (max) => `Maximum ${max} characters allowed`,
  positiveNumber: 'Must be a positive number',
  invalidFile: 'Please select a valid image file (JPEG/PNG, max 20MB)',
};