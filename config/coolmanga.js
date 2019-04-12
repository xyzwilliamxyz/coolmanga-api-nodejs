'use strict';

module.exports = {

	db: {
		host            : 'localhost',
		database        : 'coolmanga',
		user            : 'root',
		password        : 'mysqldb174',
		maxConnections  : 10
	},
	dbSQL: {

		/** MANGA **/

		SELECT_MANGA_BY_ID: (
			`SELECT m.id_manga, m.name, m.alternate_name, m.chapters, m.author, m.artist, m.status, m.rank, 
				m.read_direction, m.year_release, m.description, m.cover_url, m.source_id, m.last_update, m.score, 
				m.votes 
			FROM manga m WHERE m.id_manga = ?`
		),

		SELECT_MANGA_BY_NAME: (
			`SELECT m.id_manga, m.name, m.alternate_name, m.chapters, m.author, m.artist, m.status, m.rank, 
				m.read_direction, m.year_release, m.description, m.cover_url, m.source_id, m.last_update, m.score, 
				m.votes 
			FROM manga m WHERE m.name = ?`
		),

		SELECT_MANGA_IN_NAME: (
			`SELECT m.id_manga, m.name, m.alternate_name, m.chapters, m.author, m.artist, m.status, m.rank, 
				m.read_direction, m.year_release, m.description, m.cover_url, m.source_id, m.last_update, m.score, 
				m.votes 
			FROM manga m WHERE m.name IN (?)`
		),

		SELECT_MANGA_ALL_MIN: (
			`SELECT m.id_manga, m.name, m.cover_url, m.source_id, m.rank FROM manga m`
		),

		SELECT_MANGA_ALL_FULL: (
			`SELECT m.id_manga, m.name, m.cover_url, m.source_id, m.manga_url FROM manga m`
		),

		SELECT_NEW_MANGA: (
			`SELECT m.id_manga, m.name, m.cover_url, m.source_id, m.rank FROM manga m WHERE m.id_manga > ?`
		),

		SELECT_MANGA_GENRE_BY_MANGA_ID: (
			`SELECT manga_id, genre_id FROM manga_genre WHERE manga_id = ?`
		),

		SELECT_MANGA_GENRE_BY_MANGAS_ID: (
			`SELECT manga_id, genre_id FROM manga_genre WHERE manga_id IN (?)`
		),

		SELECT_MANGA_RATING_BY_DEVICE_UID: (
			`SELECT * FROM rating WHERE manga_id = ? AND device_uid = ?`
		),

		SELECT_MANGA_GENRE_ALL: (
			`SELECT manga_id, genre_id FROM manga_genre`
		),

		SELECT_MANGA_RANK_ALL: (
			`SELECT id_manga, rank FROM manga`
		),


		INSERT_MANGA: (
			/*`INSERT INTO manga SET name = ?, alternate_name = ?, chapters = ?, author = ?, artist = ?, status = ?, rank = ?,
                    read_direction = ?, year_release = ?, description = ?, cover_url = ?, source_id = ?, last_update = ?, manga_url = ?`*/
            `INSERT INTO manga SET ?`
		),

		INSERT_MANGA_GENRE: (
			`INSERT INTO manga_genre SET ?`
		),

		INSERT_RATING: (
			`INSERT INTO rating SET rate = ?, device_uid = ?, manga_id = ?`
		),

		UPDATE_RATING_BY_RATING_ID: (
			`UPDATE rating SET rate = ?, device_uid = ?, manga_id = ? WHERE id_rating = ?`
		),

		UPDATE_MANGA_SCORES_1: (
			`SET @rank = 0`
		),

		UPDATE_MANGA_SCORES_2: (
			`UPDATE manga m 
			JOIN (SELECT manga_id, TRUNCATE(SUM(rate) / COUNT(*), 1) AS score, COUNT(*) AS votes
					FROM rating
					GROUP BY manga_id
					ORDER BY score DESC) r
			ON r.manga_id = m.id_manga
			SET m.score = r.score, m.votes = r.votes, m.rank = @rank := @rank + 1`
		),



		/** CHAPTER **/

		SELECT_CHAPTER_BY_MANGA_AND_CHAPTER: (
			`SELECT id_chapter, number, name, chapter_url, release_date, manga_id FROM chapter WHERE manga_id = ? AND number = ?`
		),

		SELECT_CHAPTER_COUNT_BY_MANGA_ID: (
			`SELECT COUNT(id_chapter) FROM chapter WHERE manga_id = ?`
		),

		SELECT_CHAPTERS_BY_MANGA_ID_DESC: (
			`SELECT id_chapter, number, name, chapter_url, release_date, manga_id FROM chapter WHERE manga_id = ? ORDER BY number DESC`
		),

		SELECT_NEW_CHAPTERS: (
			`SELECT id_chapter, number, name, chapter_url, release_date, manga_id 
			FROM chapter 
			WHERE manga_id = ? AND number NOT IN (?) ORDER BY number`
		),


		INSERT_CHAPTER: (
			`INSERT INTO chapter SET ?`
		),

		UPDATE_CHAPTER_TO_DONE: (
			`UPDATE chapter SET done = 1 WHERE id_chapter = ?`
		),

		UPDATE_CHAPTER_NAME: (
			`UPDATE chapter SET name = ? WHERE id_chapter = ?`
		),



		/** GENRE **/

		SELECT_GENRE_ALL: (
			`SELECT id_genre, description FROM genre`
		),


		/** COMMENT **/

		SELECT_LAST_COMMENT_NUMBER: (
			`SELECT MAX(number) AS number FROM comment WHERE manga_id = ? ORDER BY number DESC LIMIT 1`
		),

		SELECT_RECENT_COMMENTS_BY_MANGA_ID: (
			`SELECT id_comment, number, text, author, datetime, manga_id 
			FROM comment 
			WHERE manga_id = ? and number > ? ORDER BY number DESC limit 10`
		),

		SELECT_COMMENT_BY_ID: (
			`SELECT id_comment, number, text, author, datetime, manga_id FROM comment WHERE id_comment = ?`
		),

		SELECT_OLD_COMMENTS: (
			`SELECT id_comment, number, text, author, datetime, manga_id FROM comment WHERE manga_id = ? and number < ? ORDER BY number DESC limit 10`
		),


		INSERT_COMMENT: (
			`INSERT INTO comment SET number = ?, text = ?, author = ?, datetime = now(), manga_id = ?`
		),

		UPDATE_COMMENT_BY_ID_COMMENT: (
			`UPDATE comment SET number = ?, text = ?, author = ?, datetime = ?, manga_id = ? WHERE id_comment = ?`
		),



		/** PARAMETER **/
		
		SELECT_PARAMETER_BY_NAME: (
			`SELECT p.name, p.value FROM parameter p WHERE p.name = ?`
		),

		SELECT_PARAMETER_ALL: (
			`SELECT p.name, p.value FROM parameter p`
		)
	}
};