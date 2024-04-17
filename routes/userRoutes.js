const express = require("express");
const router = express.Router();
const {
  fetchUser,
  sortedListOfUsers,
  softDelete,
  searchParam,
} = require("../controllers/userControllers");

router.get("/search", searchParam);
router.get("/:username", fetchUser);
router.get("/sort/:value", sortedListOfUsers);
router.get("/delete/:username", softDelete);
router.get("/data/search", (req, res, next) => {
  const { sortBy } = req.query;
  console.log(sortBy);
  res.send("done");
});

module.exports = router;
