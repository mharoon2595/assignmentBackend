const express = require("express");
const router = express.Router();
const {
  fetchUser,
  sortedListOfUsers,
} = require("../controllers/userControllers");

router.get("/:username", fetchUser);
router.get("/sort/:value", sortedListOfUsers);

module.exports = router;
