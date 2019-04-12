'use strict';

module.exports = function(pool, done) {

	const
		cheerio = require('cheerio'),
		request = require('request'),
		Q = require('q'),
		htmlParser = require('./utils/html-parser.js'),
		db = require('./model/db.js')(pool);

	let deferred = Q.defer(),
		update = [],
		urls = [],
		startTime = new Date().getTime();
	

	let generator = Q.async(function*() {

		let args;

		args = yield htmlParser.getMangasUrlAndUpdates();
		urls = args[0];
		update = args[1];

		//console.log(Object.keys(update));

		let mangas = Object.keys(update);
		
		for (let i = 0; i < mangas.length; i++) {

			let manga = mangas[i];

			let mangaDetails = yield db.getMangaByName(manga);

			if (!mangaDetails) {

				let mangaFiltered = yield htmlParser.filterMangaDetails(urls[manga]);
				let genres = mangaFiltered.genres;
				delete mangaFiltered.genres;

				if (!mangaFiltered) {
					console.log('manga Details not found: ' + urls[manga]);
					continue;
				}
				let mangaInserted = yield db.insertManga(mangaFiltered); 

				for (let j = 0; j < genres.length; j++) {
					yield db.insertMangaGenre(mangaInserted.id_manga, genres[j]);
				}

				mangaDetails = {id_manga: mangaInserted.id_manga};
				console.log('manga_id inserted: ' + mangaDetails.id_manga);
			}

			console.log('manga: ' + manga + '(' + mangaDetails.id_manga + ')');

			let newChapters = null;

			for (let j = 0; j < update[manga].length; j++) {
				let chapter = update[manga][j];

				console.log('chapter: ' + chapter.chapterNumber);

				let chapterDetails = 
					yield db.fetchMangaChapterByMangaIDAndChapterNumber(mangaDetails.id_manga, chapter.chapterNumber);

				if (!chapterDetails) {

					if (!newChapters) {
						newChapters = yield htmlParser.filterChapters(urls[manga], update[manga]);
					}

					if (!newChapters) {
						console.log('chapters page doesn\'t exist.');
						break;
					}

					for (let k = 0; k < newChapters.length; k++) {
						let nc = newChapters[k];

						if (nc.number == chapter.chapterNumber) {
							chapterDetails = nc;
							chapterDetails.manga_id = mangaDetails.id_manga;
							break;
						}
					}

					if (!mangaDetails) {
						cosnole.log('chapter doesn\'t exist!');
						continue;
					}

					let chapterInserted = yield db.insertChapter(chapterDetails);
					chapterDetails.id_chapter = chapterInserted.id_chapter;
					chapterDetails.done = 0;

					console.log('id_chapter inserted: ' + chapterDetails.id_chapter);
				} else {
					console.log('>> (' + chapterDetails.id_chapter + ')');
				}
			}
		}

		yield db.updateScores();

		return;
	});

	generator().then(function() {
		
		console.log('End execution with success: ' + new Date().toISOString());
		console.log('Executed in '+ ((new Date().getTime() - startTime) / 1000) + ' seconds.');
		done();
	})
	.catch(function(err) {

		console.log('End execution with error: ' + new Date().toISOString());
		console.log('Executed in '+ ((new Date().getTime() - startTime) / 1000) + ' seconds.');
		done(err);
	});
};