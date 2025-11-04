const express = require("express");
const { verifyCertificate } = require("../controllers/public-controller");

const router = express.Router();

// Public certificate verification - no authentication required
router.get("/verify-certificate/:certificateId", verifyCertificate);

module.exports = router;
