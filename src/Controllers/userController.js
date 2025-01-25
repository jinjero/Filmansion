import bcrypt from "bcrypt";
import User from "../Models/User";
import Flim from "../Models/Flim";

// Join
export const getJoin = (req, res) => {
  return res.render("join", { pageTitle: "✨ Join" });
};

export const postJoin = async (req, res) => {
  const { email, name, username, password, password2, location } = req.body;
  // Confrim Password
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle: "✨ Join",
      errorMessage: "비밀번호를 잘못 입력하였습니다.",
    });
  }
  // Confirm Email, Username
  const exists = await User.exists({ $or: [{ email }, { username }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle: "✨ Join",
      errorMessage: "중복된 이메일 또는 닉네임 입니다.",
    });
  }
  // Create User in DB
  try {
    await User.create({
      email,
      name,
      username,
      password,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle: "✨ Join",
      errorMessage: error._message,
    });
  }
};

// Login
export const getLogin = (req, res) => {
  return res.render("login", { pageTitle: "💖 Login" });
};

export const postLogin = async (req, res) => {
  const { email, password } = req.body;
  // Fail to Login
  const user = await User.findOne({ email, socialOnly: false });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle: "💖 Login",
      errorMessage: "가입된 이메일이 존재하지 않습니다.",
    });
  }
  // Compare Password using bcrypt
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle: "💖 Login",
      errorMessage: "비밀번호가 틀렸습니다.",
    });
  }
  // Update Session
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

// Github Login
export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const URL = `${baseUrl}?${params}`;

  return res.redirect(URL);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const URL = `${baseUrl}?${params}`;

  const tokenRequest = await (
    await fetch(URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();

  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";

    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      res.redirect("/login");
    }

    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      user = await User.create({
        email: emailObj.email,
        name: userData.name,
        username: userData.login,
        avatarUrl: userData.avatar_url,
        password: "",
        location: userData.location,
        socialOnly: true,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    res.redirect("/login");
  }
};

// Logout
export const logout = (req, res) => {
  req.session.destroy();
  // req.flash("info", "Bye Bye");
  return res.redirect("/");
};

// Edit Profile
export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "👤 Profile" });
};

export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id, avatarUrl },
    },
    body: { email, name, username, location },
    file,
  } = req;
  console.log(file);
  // Upload User in DB
  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      email,
      name,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updateUser;

  return res.redirect("/user/edit");
};

// Change Password
export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly) {
    req.flash("error", "Can't Change Password");
    return res.redirect("/");
  } else {
    return res.render("change-password", { pageTitle: "🔒 Password" });
  }
};

export const postChangePassword = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { old, newPass, newConfirm },
  } = req;
  const user = await User.findById({ _id });

  const ok = await bcrypt.compare(old, user.password);
  if (!ok) {
    return res.status(400).render("change-password", {
      pageTitle: "🔒 Password",
      errorMessage: "비밀번호가 틀립니다.",
    });
  }

  if (newPass !== newConfirm) {
    return res.status(400).render("change-password", {
      pageTitle: "🔒 Password",
      errorMessage: "새로 입력한 비밀번호가 틀립니다.",
    });
  }

  user.password = newPass;
  await user.save();
  req.flash("info", "Password Updated");
  return res.redirect("/logout");
};

export const profile = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate({
    path: "flims",
    populate: {
      path: "owner",
      model: "User",
    },
  });
  if (!user) {
    return res.status(404).render("404", { pageTitle: "🎬 User Not Found" });
  }
  return res.render("profile", { pageTitle: `🎬 ${user.username}`, user });
};
