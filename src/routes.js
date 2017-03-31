"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const auth = require("./controllers/auth");
const user = require("./controllers/user");
const router = new Router();
router.get("/", (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    ctx.body = "Hello World";
}));
router.post("/signin", auth.signin);
router.post("/signup", auth.signup);
router.post("/forgot", auth.forgot);
router.patch("/reset", auth.resetPassword);
router.post("/user/exists", user.checkUserExists);
router.patch("/user/profiles", user.UpdateProfiles);
router.patch("/user/account", user.UpdateAccount);
exports.default = router;
//# sourceMappingURL=routes.js.map