/**
 * Validation utilities for auth forms
 */

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || email.trim().length === 0) {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; error?: string; strength?: 'weak' | 'fair' | 'strong' } => {
  if (!password || password.length === 0) {
    return { valid: false, error: 'Password is required', strength: 'weak' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters', strength: 'weak' };
  }
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const strength = (hasUpperCase ? 1 : 0) + (hasLowerCase ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecialChar ? 1 : 0);
  
  let strengthLevel: 'weak' | 'fair' | 'strong' = 'weak';
  if (strength >= 3) strengthLevel = 'strong';
  else if (strength >= 2) strengthLevel = 'fair';
  
  const criteriaErrors: string[] = [];
  if (!hasUpperCase) criteriaErrors.push('uppercase letter');
  if (!hasLowerCase) criteriaErrors.push('lowercase letter');
  if (!hasNumber) criteriaErrors.push('number');
  if (!hasSpecialChar) criteriaErrors.push('special character');
  
  if (criteriaErrors.length > 0) {
    return {
      valid: false,
      error: `Password must contain: ${criteriaErrors.join(', ')}`,
      strength: strengthLevel,
    };
  }
  
  return { valid: true, strength: strengthLevel };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): { valid: boolean; error?: string } => {
  if (!confirmPassword || confirmPassword.length === 0) {
    return { valid: false, error: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }
  
  return { valid: true };
};

/**
 * Get password strength color
 */
export const getPasswordStrengthColor = (strength?: 'weak' | 'fair' | 'strong'): string => {
  switch (strength) {
    case 'strong':
      return '#16a34a'; // green
    case 'fair':
      return '#ea7a53'; // coral (warning)
    case 'weak':
    default:
      return '#dc2626'; // red
  }
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (strength?: 'weak' | 'fair' | 'strong'): string => {
  switch (strength) {
    case 'strong':
      return 'Strong';
    case 'fair':
      return 'Medium';
    case 'weak':
    default:
      return 'Weak';
  }
};

/**
 * Parse Clerk error messages to user-friendly text
 */
export const parseClerkError = (error: any): string => {
  // Handle Clerk API errors
  if (error?.errors && error.errors.length > 0) {
    const firstError = error.errors[0];
    
    // Common error messages
    if (firstError.code === 'form_identifier_not_found') {
      return 'Email not found. Please check your email or sign up.';
    }
    if (firstError.code === 'form_password_incorrect') {
      return 'Incorrect password. Please try again.';
    }
    if (firstError.code === 'form_identifier_exists') {
      return 'This email is already registered.';
    }
    if (firstError.code === 'form_param_nil') {
      return 'Please fill in all fields.';
    }
    if (firstError.code === 'identification_invalid_email') {
      return 'Please enter a valid email address.';
    }
    
    // Return custom message if available
    return firstError.message || 'An error occurred. Please try again.';
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback
  return 'An error occurred. Please try again.';
};
