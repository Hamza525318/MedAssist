// controller/user/patientProfileController.js
const Patient = require('../../models/Patient');

/**
 * @desc    Get patient profile
 * @route   GET /api/patient/profile
 * @access  Private (Patient only)
 */
exports.getPatientProfile = async (req, res) => {
  try {
    // req.user is set by the verifyJwtPatient middleware
    const patient = await Patient.findById(req.user.id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update patient profile
 * @route   PUT /api/patient/profile
 * @access  Private (Patient only)
 */
exports.updatePatientProfile = async (req, res) => {
  try {
    // Fields that are allowed to be updated
    const allowedUpdates = [
      'name',
      'email',
      'age',
      'dob',
      'gender',
      'contactNumber',
      'address'
    ];

    // Filter out fields that are not allowed to be updated
    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // If email is being updated, ensure it's not already in use by another patient
    if (updateData.email) {
      const existingPatient = await Patient.findOne({ 
        email: updateData.email,
        _id: { $ne: req.user.id } // Exclude current patient
      });

      if (existingPatient) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // If date of birth is updated, recalculate age
    if (updateData.dob) {
      const birthDate = new Date(updateData.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      updateData.age = age;
    }

    // Add history entry for each updated field
    const history = [];
    Object.keys(updateData).forEach(field => {
      history.push({
        field,
        note: `Updated ${field} to ${updateData[field]}`,
        date: Date.now(),
        // If this is being updated by an admin or doctor, their ID would be here
        // For now, we'll use the patient's own ID
        addedBy: req.user.id
      });
    });

    // Update the patient profile with new data and add history entries
    const patient = await Patient.findByIdAndUpdate(
      req.user.id,
      { 
        $set: updateData,
        $push: { history: { $each: history } }
      },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.status(200).json({
      success: true,
      data: patient,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};