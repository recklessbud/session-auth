import express from "express";
import { postSignup, postLogin, getlogin, getSignup, getLogout} from "../controllers/authController";

const router = express.Router();

router.post("/signup", postSignup);
router.post("/login", postLogin);
router.get("/login", getlogin);
router.get("/signup", getSignup);
router.get("/logout", getLogout);


export default router;