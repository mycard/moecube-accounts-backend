import * as Router from 'koa-router';
import * as auth from './controllers/auth';
import * as user from './controllers/user';
import * as upload from './controllers/upload';

const router = new Router();

router.get('/', async (ctx, next) => {
    ctx.body = 'Hello World';
});

router.post('/signin', auth.signin);
router.post('/signup', auth.signup);
router.post('/forgot', auth.forgot);
router.post('/activate', auth.activate);
router.post('/user/exists', user.checkUserExists);
router.post('/upload/image', upload.UploadImage);

router.patch('/reset', auth.resetPassword);

// 给现有的 ygopro 服务用的兼容接口
router.get('/user/:username.json', user.legacyYGOProAuth);
router.get('/user/:username.png', user.legacyYGOProAvatar);


export default router;