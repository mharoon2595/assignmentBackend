const express = require("express");
const router = express.Router();
const {
  fetchUser,
  sortedListOfUsers,
  softDelete,
  searchParam,
  editDetails,
  getAllUsers,
} = require("../controllers/userControllers");

router.get("/search", searchParam);
router.get("/all", getAllUsers);
router.get("/:username", fetchUser);
router.get("/sort/:value", sortedListOfUsers);
router.get("/delete/:username", softDelete);
router.get("/data/search", searchParam);
router.patch("/data/:username/edit", editDetails);

module.exports = router;
