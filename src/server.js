import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./Routers/rootRouter";
import flimRouter from "./Routers/flimRouter";
import userRouter from "./Routers/userRouter";
import apiRouter from "./Routers/apiRouter";
import { localMiddleware } from "./middleware";

export const app = express();
const logger = morgan("dev");

app.set("views", process.cwd() + "/src/Views");
app.set("view engine", "pug");

app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
  })
);

// ffmpeg ShareArrayBuffer Error
app.use((req, res, next) => {
  res.header("Cross-Origin-Embedder-Policy", "credentialless");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

app.use(flash());
app.use(localMiddleware);
app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));
app.use("/", rootRouter);
app.use("/flim", flimRouter);
app.use("/user", userRouter);
app.use("/api", apiRouter);

export default app;
