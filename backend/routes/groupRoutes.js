const express = require("express");
const router = express.Router();

const groupController = require("../controllers/groupController");
const authenticateToken = require("../middleware/authenticateToken");

// mandatory middleware to run when routes are called.
router.use(authenticateToken);

router.get("/", groupController.getDistinctGroups);
router.post("/assign", groupController.assignGroup);
router.post("/checkgroup", groupController.checkGroupRoute);
router.post("/create", groupController.createGroup);

module.exports = router;
