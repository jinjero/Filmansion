import express from "express";
import {
  watchFlim,
  getEdit,
  postEdit,
  deleteFlim,
} from "../Controllers/flimController";
import { privateMiddleware } from "../middleware";

const flimRouter = express.Router();

flimRouter.get("/:id([0-9a-f]{24})", watchFlim);
flimRouter
  .route("/:id([0-9a-f]{24})/edit")
  .all(privateMiddleware)
  .get(getEdit)
  .post(postEdit);
flimRouter.get("/:id([0-9a-f]{24})/delete", privateMiddleware, deleteFlim);

export default flimRouter;
