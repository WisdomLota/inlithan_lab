require("dotenv").config()
const express = require("express");
const multer = require("multer");
const path = require("path");
const connectDB = require("./config/db");
const app = express();

const cron = require("node-cron");
const researchRouter = require("./routes/research.router");
const { generateWeeklyResearchPaper } = require("./services/researchService");


connectDB();

app.use(express.json());

const cors = require('cors');
const session = require("express-session");
const passport = require("./config/passport");

app.use(cors());
app.use(session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false }));
app.use(passport.initialize());

const upload = multer({ dest: "uploads/" });

// Import routers
const activitiesRouter = require("./routes/activities.router");
const coursesRouter = require("./routes/courses.router");
const aiRouter = require("./routes/ai.router");
const authRouter = require("./routes/auth.router");
const scoresRouter = require("./routes/scores.router");
const labsRouter = require("./routes/labs.router");
const usersRouter = require("./routes/users.router");

// Mount routers
app.use("/activities", activitiesRouter);
app.use("/courses", coursesRouter);
app.use("/ai", aiRouter);
app.use("/auth", authRouter);
app.use("/scores", scoresRouter);
app.use("/labs", labsRouter);
app.use("/users", usersRouter);
app.use("/research", researchRouter);

// Weekly: every Monday at 00:05
cron.schedule("5 0 * * 1", async () => {
  try {
    console.log("Generating weekly research paper...");
    await generateWeeklyResearchPaper();
    console.log("Weekly research paper generated.");
  } catch (err) {
    console.error("Weekly research paper generation failed:", err.message);
  }
});


const PORT = process.env.PORT || 5000;

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Something went wrong on the server." });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found." });
});


app.listen(PORT, () => console.log(`Inlihtan Labs backend running on port ${PORT}`));
