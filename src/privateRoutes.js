"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const user = require("./controllers/user");
const auth = require("./controllers/auth");
const router = new Router();
router.get("/authUser", auth.authUser);
router.patch("/user/profiles", user.UpdateProfiles);
router.patch("/user/account", user.UpdateAccount);
exports.default = router;
//# sourceMappingURL=privateRoutes.js.map