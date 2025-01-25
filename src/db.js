import mongoose from "mongoose";

mongoose.connect(process.env.DB_URL);

mongoose.connection.on("error", (error) => console.log("DB Error: ", error));
mongoose.connection.once("open", () => console.log("DB Connection"));
