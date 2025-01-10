import express from "express";
import {isAuthenticated, isGuest} from "../middleware/authenticated";
const router = express.Router();
import { homepage } from "../controllers/home";

router.get("/", isGuest, homepage)

router.get("/dashboard", isAuthenticated, (req, res)=>{
    res.status(200).render("dashboard", {title: "Dashboard", user: req.user});
})


export default router