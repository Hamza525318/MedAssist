const express = require('express');
const router = express.Router();
const {
  createSlot,
  getSlots,
  updateSlot,
  deleteSlot
} = require('../controller/slotController');
const verifyJwt = require("../middleware/auth")


router.post("/get-slots",verifyJwt,getSlots);
router.post("/create-slot",verifyJwt,createSlot);
router.put("/update-slot/:id",verifyJwt,updateSlot);
router.delete("/delete-slot/:id",verifyJwt,deleteSlot);


module.exports = router; 