require("dotenv").config()
const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();

app.use(express.json());

const cors = require('cors');

app.use(cors());

const upload = multer({ dest: "uploads/" });

// Import routers
const activitiesRouter = require("./routes/activities.router");
const coursesRouter = require("./routes/courses.router");
const aiRouter = require("./routes/ai.router");
const authRouter = require("./routes/auth.router");

// Mount routers
app.use("/activities", activitiesRouter);
app.use("/courses", coursesRouter);
app.use("/ai", aiRouter);
app.use("/auth", authRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Inlihtan Labs backend running on port ${PORT}`));
