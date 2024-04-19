const { response } = require("express");
const User = require("../models/User");

async function getAllPages(url) {
  let data = [];
  let page = 1;
  let response;

  do {
    response = await fetch(`${url}?page=${page}&per_page=100`);
    const pageData = await response.json();
    data = data.concat(pageData);
    page++;
  } while (response.headers.get("link").includes('rel="next"'));

  return data;
}

async function getFriendCount(username) {
  try {
    const userResponse = await fetch(
      `https://api.github.com/users/${username}`
    );
    const userData = await userResponse.json();

    const followers = await getAllPages(userData.followers_url);
    const following = await getAllPages(
      userData.following_url.replace("{/other_user}", "")
    );

    const followerUsernames = followers.map((user) => user.login);
    const followingUsernames = following.map((user) => user.login);

    const friends = followerUsernames.filter((username) =>
      followingUsernames.includes(username)
    );

    return friends.length;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return 0;
  }
}

const fetchUser = async (req, res, next) => {
  const username = req.params.username;
  console.log("USERNAME--->", username);
  try {
    let user = await User.findOne({
      username: { $regex: new RegExp(username, "i") },
    });

    if (user) {
      await User.findOneAndUpdate({ username: username }, { deleted: false });
    }

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
        blog,
        updated_at,
        avatar_url,
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

      const friends = await getFriendCount(username);
      console.log("FRIENDS----->", friends);

      user = new User({
        username: login,
        name: name ? name : "Not set",
        company: company ? company : "Not set",
        location: location ? location : "Not set",
        email: email ? email : "Not set",
        bio: bio ? bio : "Not set",
        blog: blog ? blog : "Not set",
        avatar_url,
        followers_url,
        repos_url,
        public_gists,
        public_repos,
        updated_at,
        friends,
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

const getAllUsers = async (req, res, next) => {
  let fetchUsers;
  try {
    fetchUsers = await User.find({});
    console.log("RESPONSE FROM FETCH ALL USERS--->", fetchUsers);
  } catch (err) {
    return next(err);
  }
  res.status(200).json({ Users: fetchUsers });
};

const softDelete = async (req, res, next) => {
  const username = req.params.username;
  console.log("hitting delete");
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

const editDetails = async (req, res, next) => {
  console.log("hitting!!!");
  const username = req.params.username;
  const { location, bio, email, company } = req.body;

  console.log("username--->", username);

  let change;
  let param;
  if (location) {
    change = location;
    param = "location";
  } else if (bio) {
    change = bio;
    param = "bio";
  } else if (email) {
    change = email;
    param = "email";
  } else if (company) {
    change = company;
    param = "company";
  }

  console.log("change--->", change, "param--->", param);

  try {
    const user = await User.findOne({ username });
    console.log("user param--->", user[param]);
    user[param] = change;
    await user.save();
  } catch (err) {
    return next(err);
  }
  res.status(204).json({ message: "Updated successfully" });
};

exports.fetchUser = fetchUser;
exports.sortedListOfUsers = sortedListOfUsers;
exports.softDelete = softDelete;
exports.getAllUsers = getAllUsers;
exports.searchParam = searchParam;
exports.editDetails = editDetails;
