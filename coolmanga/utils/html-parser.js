'use strict';

const
	cheerio = require('cheerio'),
	request = require('request'),
	Q = require('q');

let self = {};



self.getHTMLParser = function(url) {

	let d = Q.defer();
	request(url, function(err, response, html) {

		if (err) {
			d.reject(err);
		} else {
			d.resolve(html);
		}
	});
	return d.promise;
}

self.getMangasUrlAndUpdates = function() {

	let d = Q.defer();

	self.getHTMLParser('http://www.mangareader.net/latest')
		.then(function(html) {

			let
				$ = cheerio.load(html),
				urls = [],
				update = [];

			// get manga/chapters list
			$('tr.c2').each(function(i, element) {

				let mangaName = $(this).find('a.chapter').text().trim();
				urls[mangaName] = 'http://www.mangareader.net' + $(this).find('a.chapter').attr('href').trim();

				$(this).find('a.chaptersrec').each(function(i, element) {

					if (!update[mangaName]) update[mangaName] = [];

					update[mangaName].unshift({
						chapterNumber: $(this).text().replace(mangaName, '').trim(),
						chapterUrl: 'http://www.mangareader.net' + $(this).attr('href')
					});
				});
			});

			d.resolve([urls, update]);
		})
		.catch(function(err) {
			d.reject(err);
		});

	return d.promise;
}

self.filterMangaDetails = function(url) {

	let d = Q.defer();

	self.getHTMLParser(url)
		.then(function(html) {
			let
				$ = cheerio.load(html),
				table = $('#mangaproperties > table'),
				tds = table.find('tr > td'),
				manga = {},
				genres = [];

			manga.cover_url = $('#mangaimg > img').attr('src').trim();
			manga.name = tds.eq(1).text().trim();
			manga.alternate_name = tds.eq(3).text().trim();
			manga.year_release = tds.eq(5).text().trim();
			manga.status = self.getStatusId(tds.eq(7).text().trim());
			manga.author = tds.eq(9).text().trim();
			manga.artist = tds.eq(11).text().trim();
			manga.read_direction = self.getReadId(tds.eq(13).text().trim());
			manga.chapters = $('table#listing > tr > td > a').length;

			let genresTag = table.find('tr > td > a');
			for (let i = 0; i < genresTag.length; i++) {
				let genre = genresTag.eq(i);

				genres.push(self.getGenreId(genre.text().trim()));
			}

			manga.genres = genres;
			manga.description = $('#readmangasum > p').text();
			manga.manga_url = url;
			manga.source_id = 0;
			manga.rank = 9999999; // no rank
			manga.last_update = 0;

			d.resolve(manga);
		})
		.catch(function(err) {
			d.reject(err);
		});

	return d.promise;
}

self.filterChapters = function(mangaURL, chaptersLink) {

	let d = Q.defer();

	self.getHTMLParser(mangaURL)
		.then(function(html) {
			//setTimeout(function() {
			let
				$ = cheerio.load(html),
				trs = $('table#listing > tr'),
				mangaName = $('#mangaproperties > table > tr > td').eq(1).text().trim(),
				newChapters = [];

			for (let i = 0; i < trs.length; i++) {
				let tr = trs.eq(i);

				if (!tr.hasClass('table_head')) {

					let chapterURL = 'http://www.mangareader.net' + tr.find('td > a').eq(0).attr('href');

					for (let j = 0; j < chaptersLink.length; j++) {
						let
							chapterEntry = chaptersLink[j],
							chapter = {};

						if (chapterEntry.chapterUrl == chapterURL) {

							chapter.name = tr.find('td').eq(0).text().trim().replace(/.*( : ?)/, '');
							chapter.chapter_url = chapterURL;
							chapter.number = chapterEntry.chapterNumber;

							if (chapter.name.length == 0) {
								chapter.name = 'Chapter: ' + chapter.number;
							}

							newChapters.push(chapter);
						}
					}
				}
			}

			d.resolve(newChapters);
			//}, 100);
		})
		.catch(function(err) {
			d.reject(err);
		});

	return d.promise;
}

self.filterPages = function(chapterURL, chapterId) {


	let d = Q.defer();

	let generator = Q.async(function*() {

		let html = yield self.getHTMLParser(chapterURL);

		let
			$ = cheerio.load(html),
			pages = [],
			options;

		options = $('#pageMenu > option');

		for (let i = 0; i < options.length; i++) {
			let option = options.eq(i);

			let pageHTML = yield self.getHTMLParser('http://www.mangareader.net' + option.attr('value'));
			$ = cheerio.load(pageHTML);

			let page = {};
			page.number = i + 1;
			page.page_url = $('img').eq(0).attr('src');
			page.chapter_id = chapterId;
		}
	});

	generator().then(function() {
		d.resolve(pages);
	})
	.catch(function(err) {
		d.reject(err);
	});

	return d.promise;
}

self.getGooglePlayVersion = function(URL) {

	let d = Q.defer();

	self.getHTMLParser(URL)
		.then(function(html) {
			let
				$ = cheerio.load(html);

			d.resolve({sec: $('div[itemprop=softwareVersion]').eq(0).text().trim().replace(/\./g, '')});

		})
		.catch(function(err) {
			d.reject(err);
		});


	return d.promise;
}

self.getReadId = function(readDirection) {

	if (readDirection == 'Right to Left') return 1;
	else if (readDirection == 'Left to Right') return 2;
	else return 0;
}

self.getStatusId = function(status) {

	if (status == 'Ongoing') return 1;
	else if (status == 'Complete') return 2;
	else return 0;
}

self.getGenreId = function(genre) {

	switch (genre) {
		case 'Action':
			return 1;
		case 'Adventure':
			return 2;
		case 'Comedy':
			return 3;
		case 'Demons':
			return 4;
		case 'Drama':
			return 5;
		case 'Ecchi':
			return 6;
		case 'Fantasy':
			return 7;
		case 'Gender Bender':
			return 8;
		case 'Harem':
			return 9;
		case 'Historical':
			return 10;
		case 'Horror':
			return 11;
		case 'Josei':
			return 12;
		case 'Magic':
			return 13;
		case 'Martial Arts':
			return 14;
		case 'Mature':
			return 15;
		case 'Mecha':
			return 16;
		case 'Military':
			return 17;
		case 'Mystery':
			return 18;
		case 'One shot':
			return 19;
		case 'Psychological':
			return 20;
		case 'Romance':
			return 21;
		case 'School Life':
			return 22;
		case 'Sci-Fi':
			return 23;
		case 'Seinen':
			return 24;
		case 'Shoujo':
			return 25;
		case 'Shoujoai':
			return 26;
		case 'Shounen':
			return 27;
		case 'Shounenai':
			return 28;
		case 'Slice of Life':
			return 29;
		case 'Smut':
			return 30;
		case 'Sports':
			return 31;
		case 'Super Power':
			return 32;
		case 'Supernatural':
			return 33;
		case 'Tragedy':
			return 34;
		case 'Vampire':
			return 35;
		case 'Yaoi':
			return 36;
		case 'Yuri':
			return 37;
	}

	return -1;
}

module.exports = self;