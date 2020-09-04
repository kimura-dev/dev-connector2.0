const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../../models/Users');

// @route POST api/users
// @desc Register route
// @access Public
router.post(
	'/',
	[
		body('name', 'Name is required').not().isEmpty(),
		body('email', 'Please include a valid email').isEmail(),
		body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
	],
	async (req, res) => {
		// Finds the validation errors in this request and wraps them in an object with handy functions
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { name, email, password } = req.body;

		try {
			// See if user exists
			let user = await User.findOne({ email });

			if (user) {
				return res.status(400).json({ errors: [ { msg: 'User already exists' } ] });
			}

			// Get users gravatar
			const avatar = gravatar.url(email, {
				s: '200',
				r: 'pg',
				d: 'mm'
			});

			user = new User({
				name,
				email,
				password,
				avatar
			});

			// Encrypt the password
			const salt = await bcrypt.genSalt(10);

			user.password = await bcrypt.hash(password, salt);

			await user.save();

			// Return JSON web token
			res.send('User Registered');
			// res.send(req.body);
		} catch (error) {
			console.error(error.message);
			res.status(500).send('Internal Server Error');
		}
	}
);

module.exports = router;
