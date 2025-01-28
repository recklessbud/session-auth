import async from "async";
import { Request, Response, NextFunction } from "express";
import { User, Users } from "../models/userSchema";
import { ValidationError, body, check, validationResult } from "express-validator";
import "../config/passport";
import passport from "passport";
import { IVerifyOptions } from "passport-local";
import { error } from "console";
import { CallbackError} from "mongoose";
import { WriteError } from "mongodb";
// import { title } from "process";

declare module 'express-session' {
    interface Session {
      returnTo: string;
    }
  }



export const getlogin = (req: Request, res: Response):void => {
    res.render("auth/login", {
        title: "Login",
        messages: req.flash("errors"),
        user: req.user
    });
};

export const getSignup = (req: Request, res: Response):void => {
    if(req.user){
        return res.redirect("/")
    }
    res.render("auth/signup", {
        title: "Signup",    
        messages: req.flash("errors"),
        user: req.user
    });
};

export const getProfile = (req: Request, res: Response):void => {
    res.render("auth/profile", {
        title: "Profile", 
        user: req.user, 
        messages: req.flash("errors")
    });	
}


/**
 * Sign in using username and password.
 * @route POST /login
 */
export const postLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("username", "username is not valid").isLength({ min: 3, max: 20 }).run(req);
    await check("password", "Password cannot be blank").isLength({min: 1}).run(req);
    await body("username").trim().toLowerCase().run(req);

    const errors = validationResult(req);

    if (!errors.isEmpty() && errors.array().some(err =>{ 
        //@ts-ignore
       return err.param === "username"})) {
        req.flash("errors", errors.array().map( err=> err.msg));
        return res.redirect("/api/v1/auth/login");
    }

    passport.authenticate("local", (err: Error, user: Users, info: IVerifyOptions) => {
        if (err) { return next(err); }
        if (!user) {
            req.flash("errors",  info.message);
            return res.redirect("/api/v1/auth/login");
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            req.flash("success", "Success! You are logged in.");
            res.redirect(req.session.returnTo || "/dashboard");
        });
    })(req, res, next);
};


/**
 * Create a new local account.
 * @route POST /signup
 */
export const postSignup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("username", "username is not valid").isLength({ min: 3, max: 20 }).run(req);
    await check("email", "Email is not valid").isEmail().run(req);
    await check("password", "Password must be at least 4 characters long").isLength({ min: 4 }).run(req);
    await check("confirmPassword", "Passwords do not match").equals(req.body.password).run(req);
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);
    await body("username").trim().toLowerCase().run(req);

    try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.flash("errors", errors.array().map(err => err.msg));
        return res.redirect("/api/v1/auth/signup");
    }

    const user = new User({
        username: req.body.username, 
        password: req.body.password,
        email: req.body.email
    }); 
    const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        req.flash("errors",  "Account with that email address already exists.");
        return res.redirect("/api/v1/auth/signup");
     }
     await user.save() 
            req.logIn(user, (err) => {
                if (err) {
                    return next(err);
                }
                res.redirect("/dashboard");
            });
    } catch (error) {
        next(error)
    }
   

    // User.findOne({ username: req.body.username }, (err: NativeError, existingUser: Users) => {
    //     if (err) { return next(err); }
    //     if (existingUser) {
    //         req.flash("errors",  "Account with that email address already exists.");
    //         return res.redirect("api/v1/auth/signup");
    //     }

    
};

 
export const getLogout = (req: Request, res: Response, done: any):void => {
    req.logout(done, (err: any) => {
        if (err) { return done(err); }
        res.redirect("/dashboard");
    });
    res.redirect("/");
};


/**
 * Update Profile Page
 * @route POST /account/profile
 * 
 */


export const postUpdateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    await check("username", "username is not valid").isLength({ min: 3, max: 20 }).run(req);
    await check("email", 'Please enter a valid email address').isEmail().run(req);
    await body("email").normalizeEmail({ gmail_remove_dots: false }).run(req);

    const errors =  validationResult(req)
    if (!errors.isEmpty()) {
        req.flash('errors', errors.array().map(err => err.msg));
        return res.redirect('/api/v1/auth/profile');
    }

    const user = req.user as Users;
    try {
        // Find the user by ID
        const foundUser = await User.findById(user.id);
        
        if (!foundUser) {
          req.flash("errors", "User not found.");
          return res.redirect("/api/v1/auth/profile");
        }
      
        // Update the user's information
        foundUser.username = req.body.username || "";
        foundUser.email = req.body.email || "";
      
        // Save the updated user
        await foundUser.save();
        req.flash("success", "Profile information has been updated.");
        res.redirect("/dashboard");
      } catch (err: any) {
        if (err.code === 11000) {
          req.flash("errors", "Account with that email address already exists.");
          return res.redirect("/api/v1/auth/profile");
        }
        return next(err);
      }
}


export const deleteAccount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user as Users;
    try {
        // Delete the user
        await User.deleteOne({ _id: user.id });
      
        // Log out the user
        req.logout((err: any) => {
            if (err) { return next(err); }
            res.redirect("/");
        });
        res.redirect("/");
      } catch (err: any) {
        return next(err);
      }

}