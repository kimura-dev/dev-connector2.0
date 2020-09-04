const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next) {
	// Get the token from header
	const token = req.header('x-auth-token');

	// Check if no token
	if (!token) {
		return res.status(401).json({ msg: 'No token, authorization denied ' });
	}

	// Verify Token
	try {
		const decoded = jwt.verify(token, config.get('jwtSecret'));

		// Has access to the user because we attached user.id to the payload
		req.user = decoded.user;
		next();
	} catch (error) {
		res.status(401).json({ msg: 'Token is not valid' });
	}
};
