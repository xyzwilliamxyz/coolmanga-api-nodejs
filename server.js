#!/usr/bin/env nodejs
'use strict';

const
	express = require('express'),
	app = express(),
	logger = require('morgan'),
	cookieParser = require('cookie-parser'),
	bodyParser = require("body-parser"),
	expressValidator = require('express-validator'),
	request = require('request'),
	async = require('async'),
	mysql = require('mysql'),
	coolmangaRouter = express.Router(),
	dictionaryRouter = express.Router();

/** Set middlewares **/
app.use(cookieParser());
app.use(logger('dev'));
app.use(bodyParser.json({
	extended: true
}));
app.use(expressValidator());

app.use(express.static('public'));

/** Set routes **/
require('./coolmanga/main.js')(coolmangaRouter, mysql);
require('./dictionary/main.js')(dictionaryRouter);



app.use('/coolmanga/api', coolmangaRouter);
app.use('/dictionary/api', dictionaryRouter);

app.listen(8080, function() {

	console.log('Server running...');
});
