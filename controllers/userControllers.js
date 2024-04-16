const User = require("../models/User");

const fetchUser = async (req, res, next) => {
  const username = req.params.username;

  let user;
  try {
    user = await User.findOne({ username: username });
  } catch (err) {
    console.log("fetching user failed, please try again later", 500);
  }

  if (!user) {
    user = await fetch(`https://api.github.com/users/${username}`);
    const response = await user.json();
    console.log("response--->", response);
    let {
      login,
      name,
      company,
      location,
      email,
      bio,
      updated_at,
      created_at,
      following,
      followers,
      public_gists,
      public_repos,
    } = response;

    updated_at = new Date(updated_at).getTime();
    created_at = new Date(created_at).getTime();

    const newUser = new User({
      username: login,
      name: name ? name : "Not set",
      company: company ? company : "Not set",
      location: location ? location : "Not set",
      email: email ? email : "not set",
      bio: bio ? bio : "Not set",
      public_gists,
      public_repos,
      updated_at,
      created_at,
      following,
      followers,
    });
    await newUser.save();

    res.status(201).json({ user: newUser });
  }

  res.status(200).json({ user });
};

const sortedListOfUsers = async (req, res, next) => {
  const parameter = req.params.value;

  console.log("parameter--->", parameter);

  const sortedList = await User.find().sort({ [parameter]: -1 });

  res.status(200).json({ sortedList: sortedList });
};

exports.fetchUser = fetchUser;
exports.sortedListOfUsers = sortedListOfUsers;
