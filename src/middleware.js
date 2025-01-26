import multer from "multer";
import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

const s3Client = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const s3AvatarStorage = multerS3({
  s3: s3Client,
  bucket: "filmansion-127",
  acl: "public-read",
  key: function (req, file, cb) {
    cb(null, `avatars/${req.session.user._id}/${Date.now().toString()}`);
  },
});
const s3VideoStorage = multerS3({
  s3: s3Client,
  bucket: "filmansion-127",
  acl: "public-read",
  key: function (req, file, cb) {
    cb(null, `videos/${req.session.user._id}/${Date.now().toString()}`);
  },
});

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
  limits: { fileSize: 3000000 },
  storage: s3AvatarStorage,
});

export const videoUpload = multer({
  limits: { fileSize: 30000000 },
  storage: s3VideoStorage,
});
