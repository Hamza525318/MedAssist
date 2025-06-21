const Patient = require('../../models/Patient');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
// const { sendEmail } = require('../../utils/email');

// Helper function to create and send JWT token
const sendTokenResponse = (patient, statusCode, res) => {
  // Create token
  const token = jwt.sign(
    { id: patient._id, role: 'patient' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  // Set cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + Number(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  // Set secure flag in production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  // Remove password from response
  patient.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      data: patient
    });
};

/**
 * @desc    Register a new patient
 * @route   POST /api/auth/patients/register
 * @access  Public
 */
exports.registerPatient = async (req, res) => {
  try {
    const { name, email, password, age, dob, gender, contactNumber, address } = req.body;

    // Check if patient already exists
    const existingPatient = await Patient.findOne({ email });
    if (existingPatient) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate unique patient ID
    // Get the latest patient to determine the next ID
    const latestPatient = await Patient.findOne().sort({ patientId: -1 });
    const patientId = latestPatient ? latestPatient.patientId + 1 : 10000;

    // Create new patient
    const patient = await Patient.create({
      patientId,
      name,
      email,
      password,
      age,
      dob: new Date(dob),
      gender,
      contactNumber,
      address
    });

    // Send token response
    sendTokenResponse(patient, 201, res);
  } catch (error) {
    console.error('Register patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Login patient
 * @route   POST /api/auth/patients/login
 * @access  Public
 */
exports.loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for patient
    const patient = await Patient.findOne({ email }).select('+password');
    if (!patient) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if patient is active
    if (!patient.active) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Check if password matches
    const isMatch = await patient.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Send token response
    sendTokenResponse(patient, 200, res);
  } catch (error) {
    console.error('Login patient error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Forgot password
 * @route   POST /api/auth/patients/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find patient by email
    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'No patient found with that email'
      });
    }

    // Get reset token
    const resetToken = patient.getResetPasswordToken();

    // Save the updated patient with reset token
    await patient.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/patients/reset-password/${resetToken}`;

    // Create message
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
    //   await sendEmail({
    //     email: patient.email,
    //     subject: 'Password Reset Token',
    //     message
    //   });

      res.status(200).json({
        success: true,
        message: 'Email sent'
      });
    } catch (err) {
      console.error('Email send error:', err);
      
      // Clear reset token fields
      patient.resetPasswordToken = undefined;
      patient.resetPasswordExpire = undefined;
      
      await patient.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Reset password
 * @route   PUT /api/auth/patients/reset-password/:resettoken
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // Find patient by reset token and check if token is still valid
    const patient = await Patient.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!patient) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token or token has expired'
      });
    }

    // Set new password
    patient.password = req.body.password;
    
    // Clear reset token fields
    patient.resetPasswordToken = undefined;
    patient.resetPasswordExpire = undefined;
    
    // Save patient with new password
    await patient.save();

    // Send token response
    sendTokenResponse(patient, 200, res);
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get current logged in patient
 * @route   GET /api/auth/patients/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Log patient out / clear cookie
 * @route   GET /api/auth/patients/logout
 * @access  Private
 */
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Successfully logged out'
  });
};
