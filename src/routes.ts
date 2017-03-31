import * as Router from 'koa-router'
import * as auth from './controllers/auth'
import * as user from './controllers/user'

const router = new Router()

router.get("/", async(ctx, next) => {
  ctx.body = "Hello World"
})

router.post("/signin", auth.signin)
router.post("/signup", auth.signup)
router.post("/forgot", auth.forgot)
router.patch("/reset", auth.resetPassword)

router.post("/user/exists", user.checkUserExists)
router.patch("/user/profiles", user.UpdateProfiles)
router.patch("/user/account", user.UpdateAccount)


export default router