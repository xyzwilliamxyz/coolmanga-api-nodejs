'use strict';

module.exports = function(router) {

	router.get('/test', function(req, res) {

		res.status(200).json({ok: true});
	});
};