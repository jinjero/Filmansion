import express from "express";
import {
  registerView,
  createComment,
  deleteComment,
} from "../Controllers/flimController";

const apiRouter = express.Router();

apiRouter.post("/flims/:id([0-9a-f]{24})/view", registerView);
apiRouter.post("/flims/:id([0-9a-f]{24})/comment", createComment);
apiRouter.delete("/comments/:commentId([0-9a-f]{24})/delete", deleteComment);

export default apiRouter;
