// middlewares/validationMiddleware.js

export const validateRegistration = (req, res, next) => {
  const { firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;
  const errors = [];

  if (!firstName || firstName.trim() === '') errors.push('First name is required');
  if (!lastName || lastName.trim() === '') errors.push('Last name is required');

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!phoneNumber || phoneNumber.trim() === '') errors.push('Phone number is required');

  // STRONG PASSWORD VALIDATION (MODERN STANDARD)
  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character (e.g. !@#$%^&*)');
    }
  }

  if (!confirmPassword || confirmPassword.trim() === '') {
    errors.push('Confirm password is required');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateVerification = (req, res, next) => {
  const { email, code } = req.body;
  const errors = [];

  if (!email || email.trim() === '') errors.push('Email is required');
  if (!code || code.trim() === '') {
    errors.push('Verification code is required');
  } else if (!/^\d{6}$/.test(code)) {
    errors.push('Verification code must be exactly 6 digits');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || password.trim() === '') {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};