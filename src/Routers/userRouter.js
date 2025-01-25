import express from "express";
import {
  startGithubLogin,
  finishGithubLogin,
  getEdit,
  postEdit,
  getChangePassword,
  postChangePassword,
  profile,
} from "../Controllers/userController";
import {
  privateMiddleware,
  publicMiddleware,
  avatarUpload,
} from "../middleware";

const userRouter = express.Router();

userRouter
  .route("/edit")
  .all(privateMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);
userRouter
  .route("/change-password")
  .all(privateMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);
userRouter.get("/github/start", publicMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicMiddleware, finishGithubLogin);
userRouter.get("/:id", privateMiddleware, profile);

export default userRouter;
