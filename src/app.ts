//express configure
import express from "express";
import dotenv from "dotenv";
import logger from "morgan";
import path from "path";
// import { Request, Response } from "express";
import MongoStore from "connect-mongo";
import flash from "express-flash";
import lusca from "lusca";
import passport from "passport";
import session from "express-session"
// import mongoose, {mongoOptions} from "mongoose";
// import { ConnectMongoOptions } from "connect-mongo/build/main/lib/MongoStore";
import { MongoClientOptions } from "mongodb";

const app = express();
dotenv.config({path:  path.resolve(__dirname, './config/.env')});

import connectDB from "./config/dbconn";
import * as passportConfig from "./config/passport";
import homeRoutes from "./routes/homeRoutes";
import authRoutes from "./routes/authRoutes";
//middleware

connectDB()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "./views"));
app.use(express.static(path.resolve(__dirname, "./public")));
app.use(flash());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET!,
    store: new MongoStore({
        mongoUrl: process.env.MONGO_URI!,
        mongoOptions: {
            useNewUrlParser: true,
            useUnifiedTopology: true
          }as MongoClientOptions
    })
}));


//passport configure
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});

app.use("/", homeRoutes);
app.use("/api/v1/auth", authRoutes);


export default app