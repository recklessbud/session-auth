//express configure
import express from "express";
import dotenv from "dotenv";
import logger from "morgan";
import path from "path";
// import { Request, Response } from "express";
import flash from "express-flash";
import lusca from "lusca";
import passport from "passport";



const app = express();
dotenv.config({path:  path.resolve(__dirname, './config/.env')});

import connectDB from "./config/dbconn";
//middleware

connectDB()
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "./views"));
app.use(express.static(path.resolve(__dirname, "./public")));
app.use(flash());



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


export default app