import { authenticationMiddleware } from "./lib/authenticate";
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");

// Auth routes
router.post("/signup", authRoute.signup);
router.post("/request-otp", authRoute.requestOTP);
router.get("/signin", authRoute.signin);
router.post("/resetpassword", authRoute.resetPassword);

// User routes
router.get("/profile", authenticationMiddleware, userRoute.profile);

module.exports = router;
