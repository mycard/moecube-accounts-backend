import * as Router from 'koa-router'
import * as user from './controllers/user'
import * as auth from './controllers/auth'

const router = new Router()


router.get("/authUser", auth.authUser)
router.patch("/user/profiles", user.UpdateProfiles)
router.patch("/user/account", user.UpdateAccount)

export default router