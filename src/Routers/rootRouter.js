import express from "express";
import {
  home,
  search,
  getUpload,
  postUpload,
} from "../Controllers/flimController";
import {
  getJoin,
  postJoin,
  getLogin,
  postLogin,
  logout,
} from "../Controllers/userController";
import {
  publicMiddleware,
  privateMiddleware,
  videoUpload,
} from "../middleware";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.get("/search", search);
rootRouter
  .route("/upload")
  .all(privateMiddleware)
  .get(getUpload)
  .post(
    videoUpload.fields([
      { name: "video", maxCount: 1 },
      { name: "thumb", maxCount: 1 },
    ]),
    postUpload
  );
rootRouter.route("/join").all(publicMiddleware).get(getJoin).post(postJoin);
rootRouter.route("/login").all(publicMiddleware).get(getLogin).post(postLogin);
rootRouter.get("/logout", privateMiddleware, logout);

export default rootRouter;
