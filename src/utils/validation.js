export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
};

export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  const re = /^[6-9]\d{9}$/;
  return re.test(phone.replace(/\D/g, ''));
};

export const validateGrievanceForm = (formData) => {
  const errors = {};

  if (!formData.title || formData.title.trim().length < 5) {
    errors.title = "Title must be at least 5 characters long.";
  } else if (formData.title.trim().length > 150) {
    errors.title = "Title cannot exceed 150 characters.";
  }

  if (!formData.categoryId || formData.categoryId.trim() === '') {
    errors.categoryId = "Please select a valid grievance category.";
  }

  if (!formData.location || formData.location.trim().length < 5) {
    errors.location = "Please provide a specific street location/landmark (min 5 chars).";
  }

  if (!formData.description || formData.description.trim().length < 20) {
    errors.description = "Please describe the grievance in sufficient detail (min 20 characters).";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegistrationForm = (formData, existingUsers = []) => {
  const errors = {};

  if (!formData.name || formData.name.trim().length < 3) {
    errors.name = "Full name is required (at least 3 characters).";
  }

  if (!isValidEmail(formData.email)) {
    errors.email = "Please enter a valid email address.";
  } else if (existingUsers.some(u => u.email.toLowerCase() === formData.email.trim().toLowerCase())) {
    errors.email = "An account with this email address is already registered.";
  }

  if (!isValidPhone(formData.phone)) {
    errors.phone = "Please enter a valid 10-digit Indian mobile number.";
  }

  if (!formData.address || formData.address.trim().length < 10) {
    errors.address = "Residential address is required (at least 10 characters).";
  }

  if (!formData.password || formData.password.length < 6) {
    errors.password = "Password must be at least 6 characters long.";
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
