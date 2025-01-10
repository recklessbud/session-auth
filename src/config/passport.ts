import passport from "passport";
import passportLocal from "passport-local";
import {User, Users} from "../models/userSchema";
import { Request, Response, NextFunction } from "express";
// import  NativeError from "mongoose";
import mongoose from "mongoose";

// interface NativeError extends Error {
//     name: string;
//     message: string;
// }


const LocalStrategy = passportLocal.Strategy;

passport.serializeUser<any, any>((req, user, done) => {
    done(undefined, user);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err: NativeError, user: Users) => done(err, user));
});


passport.use(new LocalStrategy({ usernameField: "username" }, (username, password, done) => {
    User.findOne({ username: username.toLowerCase() }, (err: NativeError, user: Users) => {
        if (err) { return done(err); }
        if (!user) {
            return done(undefined, false, { message: `Email ${username} not found.` });
        }
        user.comparePassword(password, (err: mongoose.Error, isMatch: boolean) => {
            if (err) { return done(err); }
            if (isMatch) {
                return done(null, user);
            }
            return done(null, false, { message: "Invalid email or password." });
        });
    });
}));