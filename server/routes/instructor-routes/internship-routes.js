const router = require("express").Router();
const { createProgram, listPrograms } = require("../../controllers/instructor-controller/internship-controller");
const authenticate = require("../../middleware/auth-middleware");

// All routes require authentication
router.post("/create", authenticate, createProgram);
router.get("/list/:instructorId?", authenticate, listPrograms);

module.exports = router;


