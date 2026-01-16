export const validationRules = {
  firstName: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s-']+$/,
    messages: {
      required: 'First name is required',
      minLength: 'Must be at least 2 characters',
      pattern: 'Only letters, spaces, hyphens and apostrophes allowed',
    },
  },
  lastName: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s-']+$/,
    messages: {
      required: 'Last name is required',
      minLength: 'Must be at least 2 characters',
      pattern: 'Only letters, spaces, hyphens and apostrophes allowed',
    },
  },
  address: {
    required: true,
    minLength: 5,
    messages: {
      required: 'Address is required',
      minLength: 'Address must be at least 5 characters',
    },
  },
  wardNumber: {
    required: true,
    type: 'integer',
    min: 1,
    max: 50,
    messages: {
      required: 'Ward number is required',
      type: 'Must be a valid number',
      integer: 'Must be a whole number',
      min: 'Must be at least 1',
      max: 'Must be no more than 50',
    },
  },
  householdSize: {
    required: true,
    type: 'integer',
    min: 1,
    max: 50,
    messages: {
      required: 'Household size is required',
      type: 'Must be a valid number',
      integer: 'Must be a whole number',
      min: 'Must be at least 1',
      max: 'Must be no more than 50',
    },
  },
};

export const validateField = (fieldName, value) => {
  const rules = validationRules[fieldName];
  if (!rules) return null;

  if (rules.required && (value === '' || value === null || value === undefined)) {
    return rules.messages.required;
  }

  if (rules.type === 'integer') {
    const numValue = parseInt(value);
    
    if (value !== '' && isNaN(numValue)) {
      return rules.messages.type;
    }
    
    if (!isNaN(numValue)) {
      if (!Number.isInteger(numValue)) {
        return rules.messages.integer;
      }
      if (rules.min !== undefined && numValue < rules.min) {
        return rules.messages.min;
      }
      if (rules.max !== undefined && numValue > rules.max) {
        return rules.messages.max;
      }
    }
  }

  if (rules.minLength && value && value.trim().length < rules.minLength) {
    return rules.messages.minLength;
  }

  if (rules.pattern && value && !rules.pattern.test(value)) {
    return rules.messages.pattern;
  }

  return null;
};

export const validateForm = (formData) => {
  const errors = {};
  
  Object.keys(validationRules).forEach((fieldName) => {
    const error = validateField(fieldName, formData[fieldName]);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
