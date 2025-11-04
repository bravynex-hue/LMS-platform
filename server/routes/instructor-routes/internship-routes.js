const router = require("express").Router();
const { createProgram, listPrograms } = require("../../controllers/instructor-controller/internship-controller");

router.post("/create", createProgram);
router.get("/list/:instructorId?", listPrograms);

module.exports = router;


