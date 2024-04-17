const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true },
  bio: { type: String, required: true },
  public_repos: { type: Number, required: true },
  public_gists: { type: Number, required: true },
  followers_url: { type: String, required: true },
  repos_url: { type: String, required: true },
  followers: { type: Number, required: true },
  following: { type: Number, required: true },
  created_at: { type: Number, required: true },
  updated_at: { type: Number, required: true },
  deleted: { type: Boolean, required: true },
});

module.exports = mongoose.model("User", userSchema);
