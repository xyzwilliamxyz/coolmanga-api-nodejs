'use strict';

const
	Q = require('q'),
	dbSQL = require('./../../config/coolmanga').dbSQL;

module.exports = function(connectionPool) {

	let 
		self = {},
		pool = connectionPool;

	self.getMangaByName = function(mangaName) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_MANGA_BY_NAME, [mangaName], function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
				}

				connection.destroy();
				d.resolve(rows[0]);
			});
		});

		return d.promise;
	};

	self.getNewMangas = function(mangaId) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_NEW_MANGA, [mangaId], function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
				}

				connection.destroy();
				d.resolve(rows);
			});
		});

		return d.promise;
	};

	self.getNewChapters = function(args) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_NEW_CHAPTERS, args, function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
				}

				connection.destroy();
				d.resolve(rows);
			});
		});

		return d.promise;
	};

	self.getAllChapters = function(mangaId) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_CHAPTERS_BY_MANGA_ID_DESC, [mangaId], function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
				}

				connection.destroy();
				d.resolve(rows);
			});
		});

		return d.promise;
	};

	self.getAllGenres = function() {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_GENRE_ALL, function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
				}

				connection.destroy();
				d.resolve(rows);
			});
		});

		return d.promise;
	};

	self.getAllMangaGenres = function() {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_MANGA_GENRE_ALL, function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
				}

				connection.destroy();
				d.resolve(rows);
			});
		});

		return d.promise;
	};

	self.getMangaGenre = function(idManga) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_MANGA_GENRE_BY_MANGA_ID, [idManga], function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
				}

				connection.destroy();
				d.resolve(rows);
			});
		});

		return d.promise;
	};

	self.getAllRank = function() {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_MANGA_RANK_ALL, function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
				}

				connection.destroy();
				d.resolve(rows);
			});
		});

		return d.promise;
	};

	self.getAllMangasMin = function() {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_MANGA_ALL_MIN, function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
				}

				connection.destroy();
				d.resolve(rows);
			});
		});

		return d.promise;
	};

	self.getMangaDetails = function(idManga) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_MANGA_BY_ID, [idManga], function(err, result) {

				if (err) {
					connection.destroy();
					d.reject(err);
					return;
				}

				if (result.length === 0) {
					connection.destroy();
					d.reject({status: 404, msg: 'Not found.'});
					return;
				}

				connection.destroy();
				d.resolve(result[0]);
			});
		});

		return d.promise;
	};

	self.getParameter = function(parameter) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_PARAMETER_BY_NAME, [parameter], function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
					return;
				}

				if (rows.length === 0) {
					connection.destroy();
					d.reject({status: 404, msg: 'Not found.'});
					return;
				}

				connection.destroy();
				d.resolve(rows[0]);
			});
		});

		return d.promise;
	};

	self.getLastCommentNumber = function(mangaId) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_LAST_COMMENT_NUMBER, [mangaId], function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
					return;
				}

				connection.destroy();
				d.resolve(rows[0].number);
			});
		});

		return d.promise;
	};

	self.insertComment = function(comment) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.INSERT_COMMENT, [comment.number, comment.text, comment.author, comment.manga_id], function(err, result) {

				if (err) {
					connection.destroy();
					d.reject(err);
					return;
				}

				connection.destroy();
				comment.id_comment = result.insertId;
				comment.datetime = new Date().toISOString();
				d.resolve(comment);
			});
		});

		return d.promise;
	};

	self.getRatingByDeviceUIDAndMangaID = function(args) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_MANGA_RATING_BY_DEVICE_UID, args, function(err, result) {

				if (err) {
					connection.destroy();
					d.reject(err);
					return;
				}

				connection.destroy();
				d.resolve(result[0]);
			});
		});

		return d.promise;
	};

	self.insertOrUpdateRating = function(sql, sqlParams) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(sql, sqlParams, function(err, result) {

				if (err) {
					connection.destroy();
					d.reject(err);
					return;
				}

				connection.destroy();
				d.resolve();
			});
		});

		return d.promise;
	};

	self.getOldComments = function(args) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_OLD_COMMENTS, args, function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
					return;
				}

				connection.destroy();
				d.resolve(rows);
			});
		});

		return d.promise;
	};

	self.getNewComments = function(args) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_RECENT_COMMENTS_BY_MANGA_ID, args, function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
					return;
				}

				connection.destroy();
				d.resolve(rows);
			});
		});

		return d.promise;
	};

	self.fetchMangaChapterByMangaIDAndChapterNumber = function(idManga, chapterNumber) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.SELECT_CHAPTER_BY_MANGA_AND_CHAPTER, [idManga, chapterNumber], function(err, rows) {

				if (err) {
					connection.destroy();
					d.reject(err);
					return;
				}

				connection.destroy();
				d.resolve(rows[0]);
			});
		});

		return d.promise;
	};

	self.insertManga = function(manga) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.INSERT_MANGA, manga, function(err, result) {

				if (err) {
					connection.destroy();
					d.reject(err);
					return;
				}

				manga.id_manga = result.insertId;

				connection.destroy();
				d.resolve(manga);
			});
		});

		return d.promise;
	};

	self.insertChapter = function(chapter) {

		let d = Q.defer();

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.INSERT_CHAPTER, chapter, function(err, result) {

				if (err) {
					connection.destroy();
					d.reject(err);
					return;
				}

				chapter.id_chapter = result.insertId;

				connection.destroy();
				d.resolve(chapter);
			});
		});

		return d.promise;
	};

	self.insertMangaGenre = function(mangaId, genreId) {

		let d = Q.defer();

		let mangaGenre = {manga_id: mangaId, genre_id: genreId};

		pool.getConnection(function(err, connection) {

			connection.query(dbSQL.INSERT_MANGA_GENRE, mangaGenre, function(err, result) {

				if (err) {
					connection.destroy();
					d.reject(err);
					return;
				}

				connection.destroy();
				d.resolve(mangaGenre);
			});
		});

		return d.promise;
	};

	self.updateScores = function() {

		let d = Q.defer();

		let deferred = Q.defer();
        pool.getConnection(function(err, connection) {

			connection.query(dbSQL.UPDATE_MANGA_SCORES_1, function(err, rows) {

				if (err) {
					if (connection) connection.destroy();
					deferred.reject(err);
					return;
				}

				deferred.resolve(connection);
			});
		});

	    deferred.promise
	    .then(function(connection) {

			connection.query(dbSQL.UPDATE_MANGA_SCORES_2, function(err, rows) {

				if (err) {
					if (connection) connection.destroy();
					deffered.reject(err);
					return;
				}

				connection.destroy();
				d.resolve();
			});
	    })
		.catch(function(err) {
			d.reject(err);
		});

		return d.promise;
	};

	return self;
}