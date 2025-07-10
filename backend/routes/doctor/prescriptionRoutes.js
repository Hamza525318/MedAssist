const express = require('express');
const { createPrescription, getAllPrescriptions, getPrescriptionsByPatientId, getPrescriptionById, updatePrescription, deletePrescription } = require('../../controller/prescriptionController');
const router = express.Router();

router.post('/create', createPrescription);
router.get('/all',getAllPrescriptions);
router.get('/byPatient/:patientId',getPrescriptionsByPatientId);
router.get('/:id', getPrescriptionById);
router.put('/:id', updatePrescription);
router.delete('/:id',deletePrescription);

module.exports = router;
