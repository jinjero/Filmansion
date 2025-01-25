import multer from "multer";

export const localMiddleware = (req, res, next) => {
  res.locals.siteName = "Filmasion";
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user || {};
  res.locals.currentPath = req.path;
  next();
};

export const privateMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    return res.redirect("/login");
  }
};

export const publicMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    next();
  } else {
    req.flash("error", "Not Authorized");
    return res.redirect("/");
  }
};

export const avatarUpload = multer({
  dest: "uploads/avatar/",
  limits: { fileSize: 3000000 },
});

export const videoUpload = multer({
  dest: "uploads/video/",
  limits: { fileSize: 30000000 },
});
