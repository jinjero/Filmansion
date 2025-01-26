import "dotenv/config";
import "./db";
import "./Models/Flim";
import "./Models/User";
import "./Models/Comment";
import app from "./server";

const PORT = 3000;

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
