const User = require("../models/User");

const fetchUser = async (req, res, next) => {
  const username = req.params.username;
  console.log("USERNAME--->", username);
  try {
    let user = await User.findOne({
      username: { $regex: new RegExp(username, "i") },
    });

    if (!user) {
      const githubUser = await fetch(
        `https://api.github.com/users/${username}`,
        {
          headers: { Authorization: "Bearer " + process.env.GithubKey },
        }
      );

      if (!githubUser.ok) {
        throw new Error("User not found");
      }

      const userData = await githubUser.json();
      console.log("response--->", userData);

      let {
        login,
        name,
        company,
        location,
        email,
        bio,
        updated_at,
        created_at,
        followers_url,
        repos_url,
        following,
        followers,
        public_gists,
        public_repos,
      } = userData;

      updated_at = new Date(updated_at).getTime();
      created_at = new Date(created_at).getTime();

      user = new User({
        username: login,
        name: name ? name : "Not set",
        company: company ? company : "Not set",
        location: location ? location : "Not set",
        email: email ? email : "not set",
        bio: bio ? bio : "Not set",
        followers_url,
        repos_url,
        public_gists,
        public_repos,
        updated_at,
        created_at,
        following,
        followers,
        deleted: false,
      });

      await user.save();
    }

    res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

const sortedListOfUsers = async (req, res, next) => {
  const parameter = req.params.value;

  const sortedList = await User.find().sort({ [parameter]: -1 });

  res.status(200).json({ sortedList: sortedList });
};

const searchParam = async (req, res, next) => {
  const { name, location, blog, email, username } = req.query;
  console.log("username--->", username);
  let data;
  try {
    const query = {};
    if (username) {
      query.username = { $regex: username, $options: "i" };
    }
    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    if (name) {
      query.name = { $regex: name, $options: "i" };
    }
    if (blog) {
      query.blog = { $regex: blog, $options: "i" };
    }
    if (email) {
      query.email = { $regex: email, $options: "i" };
    }
    // Search user data in the database based on username and/or location
    data = await User.find(query);
    if (!data || data.length === 0) {
      throw new Error("No user found with the given search parameters");
    }
  } catch (error) {
    console.error("Error searching user data:", error);
    return next(error);
  }

  res.status(200).json({ data: data });
};

const softDelete = async (req, res, next) => {
  const username = req.params.username;

  try {
    const deleteFlag = await User.findOneAndUpdate(
      { username: username },
      { deleted: true }
    );
  } catch (err) {
    console.log(err);
  }
  res.status(201).json({ message: "Deleted!" });
};

exports.fetchUser = fetchUser;
exports.sortedListOfUsers = sortedListOfUsers;
exports.softDelete = softDelete;
exports.searchParam = searchParam;
