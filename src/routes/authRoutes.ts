import express from "express";
import { postSignup, postLogin, getlogin, getSignup, getLogout, getProfile, postUpdateProfile, deleteAccount} from "../controllers/authController";
import { isAuthenticated, isGuest } from "../middleware/authenticated";

const router = express.Router();

router.post("/signup", postSignup);
router.post("/login", postLogin);
router.get("/login", getlogin);
router.get("/signup", getSignup);
router.get("/logout", getLogout);
router.get("/profile", isAuthenticated, getProfile)
router.post("/account/profile", isAuthenticated, postUpdateProfile)
router.post('/account/delete', isAuthenticated, deleteAccount)


export default router;