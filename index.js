import 'dotenv/config';
import { join } from "node:path";
import express, { urlencoded } from "express";
import session from "express-session";
import { passport } from "./authUtils.js";
import authRouter from "./routes/authRoutes.js";
import { prisma } from "./lib/prisma.js";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import filesRouter from './routes/fileRoutes.js';
const dir = import.meta.dirname;
const assetsPath = join(dir, "public");


const app = express();
app.set("views", join(dir, "views"));
app.set("view engine", "ejs");
app.use(express.static(assetsPath));

app.use(session({
  store:
    new PrismaSessionStore(
      prisma,
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    ),
  secret: "cats", resave: false, saveUninitialized: false, cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, secure: false, httpOnly: true, sameSite: "lax" }
}));
// app.use(passport.initialize());
app.use(passport.session());
app.use(urlencoded({ extended: false }));


app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});


app.get("/", (req, res) => {
  res.redirect("files")
});

app.use("/files", filesRouter)
app.use("/auth", authRouter)

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || 500;
  console.log(err)
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(3000, (error) => {
  if (error) {
    throw error;
  }
  console.log("app listening on port 3000!");
  console.log("http://localhost:3000");
});
