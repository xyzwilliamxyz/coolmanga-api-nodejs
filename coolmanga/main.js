'use strict';

module.exports = function(router, mysql) {

	/** Set database configuration for coolmanga **/
	const
		Q = require('q'),
		request = require('request'),
		config = require('./../config/coolmanga'),
		pool = mysql.createPool({
			connectionLimit: config.db.maxConnections,
			host: config.db.host,
			user: config.db.user,
			password: config.db.password,
			database: config.db.database
		}),
		dbSQL = config.dbSQL,
		db = require('./model/db.js')(pool),
		updateWatcher = require('./updateWatcher.js'),
		htmlParser = require('./utils/html-parser.js'),
		schedule = require('node-schedule');

	schedule.scheduleJob('0 0 * * * *', function() {
		console.log('JOB: updatewatcher running...');
		
		updateWatcher(pool, function(err) {
			
			if (err) {
				console.log(err);
				return;
			}
		});	
	});

	router.get('/manga/all', function(req, res) {

		db.getAllMangasMin().then(function(mangas) {
			res.status(200).json(mangas);
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});

	router.get('/manga/all/rank', function(req, res) {

		db.getAllRank().then(function(ranks) {
			res.status(200).json(ranks);
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});

	router.get('/manga/all/genres', function(req, res) {

		db.getAllMangaGenres().then(function(mangaGenres) {
			res.status(200).json(mangaGenres);
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});

	router.get('/genre/all', function(req, res) {

		db.getAllGenres().then(function(genres) {
			res.status(200).json(genres);
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});

	router.get('/chapter/all', function(req, res) {

		let mangaId = req.query.manga_id;

		req.checkQuery('manga_id', 'Invalid manga_id.').notEmpty().isInt();
		if (!handleParameterValidation(req, res)) return;

		db.getAllChapters(mangaId).then(function(chapters) {
			res.status(200).json(chapters);
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});

	router.post('/manga/chapter/new', function(req, res) {

		/*console.log(req.body);

		req.checkBody('mangaId', 'Invalid mangaId.').notEmpty().isInt();
		req.checkBody('chapters', 'Invalid chapters.').notEmpty();
		if (!handleParameterValidation(req, res)) return;*/

		let generator = Q.async(function*() {
			let result = [];
			let mangas = req.body;
			for (let i = 0; i < mangas.length; i++) {

				let mangaId = mangas[i].mangaId;
				let chapters = mangas[i].chapters;
				let args = [mangaId, chapters.split(',')];

				let newChapters = yield db.getNewChapters(args);
				if (newChapters.length > 0) {
					result.push(newChapters);
				}
			}
			return result;
		});

		generator().then(function(result) {

			res.status(200).json(result);
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});

	router.get('/manga/new', function(req, res) {

		let mangaId = req.query.manga_id;

		req.checkQuery('manga_id', 'Invalid manga_id.').notEmpty().isInt();
		if (!handleParameterValidation(req, res)) return;

		db.getNewMangas(mangaId).then(function(mangas) {
			res.status(200).json(mangas);
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});

	router.get('/manga/rate', function(req, res) {

		let mangaId = req.query.manga_id;
		let rate = req.query.rate;
		let deviceUID = req.query.device_uid;

		req.checkQuery('manga_id', 'Invalid manga_id.').notEmpty().isInt();
		req.checkQuery('rate', 'Invalid rate.').notEmpty().isInt();
		req.checkQuery('device_uid', 'Invalid device_uid.').notEmpty();
		if (!handleParameterValidation(req, res)) return;

		db.getRatingByDeviceUIDAndMangaID([mangaId, deviceUID])
		.then(function(rating) {

			let sql;
			let sqlParams = [rate, deviceUID, mangaId];

			if (rating) {
				sql = dbSQL.UPDATE_RATING_BY_RATING_ID;
				sqlParams.push(rating.id_rating);
			} else {
				sql = dbSQL.INSERT_RATING;
			}

			return db.insertOrUpdateRating(sql, sqlParams);
		})
		.then(function() {
			res.status(201).end();
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});

	router.post('/comment', function(req, res) {

		let comment = req.body;
		let deferred = Q.defer();

		console.log(comment);

		req.checkBody('manga_id', 'Invalid manga_id.').notEmpty().isInt();
		req.checkBody('text', 'Empty text.').notEmpty();
		req.checkBody('author', 'Empty author.').notEmpty();
		if (!handleParameterValidation(req, res)) return;

		db.getLastCommentNumber(comment.mangaId)
		.then(function(number) {

			comment.number = number + 1;
			return comment;
		})
		.then(db.insertComment)
		.then(function(comment) {

			res.status(201).json(comment);
		})
		.catch(function(err) {
			handleError(err, res);
		});

	});

	router.get('/comment/new', function(req, res) {

		let mangaId = req.query.manga_id;
		let number = req.query.number;

		req.checkQuery('manga_id', 'Invalid manga_id.').notEmpty().isInt();
		req.checkQuery('number', 'Invalid number.').notEmpty().isInt();
		if (!handleParameterValidation(req, res)) return;

		db.getNewComments([mangaId, number]).then(function(comments) {
			res.status(200).json(comments);
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});

	router.get('/comment/old', function(req, res) {

		let mangaId = req.query.manga_id;
		let number = req.query.number;

		req.checkQuery('manga_id', 'Invalid manga_id.').notEmpty().isInt();
		req.checkQuery('number', 'Invalid number.').notEmpty().isInt();
		if (!handleParameterValidation(req, res)) return;

		db.getOldComments([mangaId, number]).then(function(comments) {
			res.status(200).json(comments);
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});

	router.get('/parameter', function(req, res) {

		let parameter = req.query.parameter;

		req.checkQuery('parameter', 'No value provided.').notEmpty();
		if (!handleParameterValidation(req, res)) return;

		db.getParameter(parameter).then(function(parameter) {
			res.status(200).json(parameter);
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});

	router.get('/manga', function(req, res) {

		let idManga = req.query.manga_id;
		let device_uid = req.query.device_uid;

		req.checkQuery('manga_id', 'Invalid manga_id.').notEmpty().isInt();
		req.checkQuery('device_uid', 'Invalid device_uid.').notEmpty();
		if (!handleParameterValidation(req, res)) return;

		let generator = Q.async(function*() {

			let manga = yield db.getMangaDetails(idManga);
			let rating = yield db.getRatingByDeviceUIDAndMangaID([idManga, device_uid]);

			if (rating) manga.user_rate = rating.rate;
			else manga.user_rate = 0;

			let mangaGenres = yield db.getMangaGenre(idManga, device_uid);

			return {manga: manga, manga_genres: mangaGenres};
		});

		generator().then(function(result) {

			res.status(200).json(result);
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});

	router.get('/updatewatcher', function(req, res) {

		updateWatcher(pool, function(err) {
			
			if (err) {
				console.log(err);
				res.status(500).end();
				return;
			}
			res.status(200).end();
		});	
	});

	router.get('/initdata', function(req, res) {

		htmlParser.getGooglePlayVersion('https://play.google.com/store/apps/details?id=com.coolmanga')
		.then(function(version) {

			version.sec = 0;
			version.sync = new Date().toISOString();
			version.status = 'OK';

			res.status(200).json(version);
		})
		.catch(function(err) {
			handleError(err, res);
		});
	});



	function handleParameterValidation(req, res) {

		let errors = req.validationErrors();
		if (errors) {
		    res.status(400).json({validaton: true, error: errors});
		    return false;
		}

		return true;
	}

	function handleError(err, res) {

		console.log(err);

		if (err.status) {
			res.status(err.status).json({validation: false, error: {msg: err.msg}});
		} else {
			res.status(500).json({validation: false, error: {msg: 'Internal server error.'}});
		}
	}
};