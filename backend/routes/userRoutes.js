const express = require('express');
const { registerUser, registerValidation, authUser, allUsers } = require('../controllers/userController')
const {protect} = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register',registerValidation,registerUser);
router.route('/login').post(authUser);
router.route('/users').get(protect, allUsers);

module.exports = router