module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/build/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Twitter = __webpack_require__(1);

	var json = __webpack_require__(8);

	var client = new Twitter({
	    consumer_key: json.CONSUMER_KEY,
	    consumer_secret: json.CONSUMER_SECRET,
	    access_token_key: json.ACCESS_TOKEN,
	    access_token_secret: json.ACCESS_TOKEN_SECRET
	});

	function store_tweets(query, cb) {
	    client.get('search/tweets', { q: query }, function (error, tweets, response) {
	        if (!error) {
	            cb(tweets);
	        } else {
	            cb(error);
	        }
	    });
	}

	module.exports = function (context, cb) {
	    var query = context.query.name;

	    if (!query) {
	        cb("enter search term as query=<term> in the url");
	        return;
	    }

	    store_tweets(query, function (data) {
	        var data_list = new Object();
	        for (var i = 0; i < data.statuses.length; i++) {
	            data_list["tweet " + (i + 1)] = data.statuses[i].text;
	        }
	        cb(null, data_list);
	    });
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Module dependencies
	 */

	var url = __webpack_require__(2);
	var Streamparser = __webpack_require__(3);
	var request = __webpack_require__(5);
	var extend = __webpack_require__(6);

	// Package version
	var VERSION = __webpack_require__(7).version;

	function Twitter(options) {
	  if (!(this instanceof Twitter)) { return new Twitter(options) }

	  this.VERSION = VERSION;

	  // Merge the default options with the client submitted options
	  this.options = extend({
	    consumer_key: null,
	    consumer_secret: null,
	    access_token_key: null,
	    access_token_secret: null,
	    bearer_token: null,
	    rest_base: 'https://api.twitter.com/1.1',
	    stream_base: 'https://stream.twitter.com/1.1',
	    user_stream_base: 'https://userstream.twitter.com/1.1',
	    site_stream_base: 'https://sitestream.twitter.com/1.1',
	    media_base: 'https://upload.twitter.com/1.1',
	    request_options: {
	      headers: {
	        Accept: '*/*',
	        Connection: 'close',
	        'User-Agent': 'node-twitter/' + VERSION
	      }
	    }
	  }, options);

	  // Default to user authentication
	  var authentication_options = {
	    oauth: {
	      consumer_key: this.options.consumer_key,
	      consumer_secret: this.options.consumer_secret,
	      token: this.options.access_token_key,
	      token_secret: this.options.access_token_secret
	    }
	  };

	  // Check to see if we are going to use User Authentication or Application Authetication
	  if (this.options.bearer_token) {
	    authentication_options = {
	      headers: {
	        Authorization: 'Bearer ' + this.options.bearer_token
	      }
	    };
	  }

	  // Configure default request options
	  this.request = request.defaults(
	    extend(
	      this.options.request_options,
	      authentication_options
	    )
	  );
	}

	Twitter.prototype.__buildEndpoint = function(path, base) {
	  var bases = {
	    'rest': this.options.rest_base,
	    'stream': this.options.stream_base,
	    'user_stream': this.options.user_stream_base,
	    'site_stream': this.options.site_stream_base,
	    'media': this.options.media_base
	  };
	  var endpoint = (bases.hasOwnProperty(base)) ? bases[base] : bases.rest;

	  if (url.parse(path).protocol) {
	    endpoint = path;
	  }
	  else {
	    // If the path begins with media or /media
	    if (path.match(/^(\/)?media/)) {
	      endpoint = bases.media;
	    }
	    endpoint += (path.charAt(0) === '/') ? path : '/' + path;
	  }

	  // Remove trailing slash
	  endpoint = endpoint.replace(/\/$/, '');

	  // Add json extension if not provided in call
	  endpoint += (path.split('.').pop() !== 'json') ? '.json' : '';

	  return endpoint;
	};

	Twitter.prototype.__request = function(method, path, params, callback) {
	  var base = 'rest';

	  // Set the callback if no params are passed
	  if (typeof params === 'function') {
	    callback = params;
	    params = {};
	  }

	  // Set API base
	  if (typeof params.base !== 'undefined') {
	    base = params.base;
	    delete params.base;
	  }

	  // Build the options to pass to our custom request object
	  var options = {
	    method: method.toLowerCase(),  // Request method - get || post
	    url: this.__buildEndpoint(path, base) // Generate url
	  };

	  // Pass url parameters if get
	  if (method === 'get') {
	    options.qs = params;
	  }

	  // Pass form data if post
	  if (method === 'post') {
	    var formKey = 'form';

	    if (typeof params.media !== 'undefined') {
	      formKey = 'formData';
	    }
	    options[formKey] = params;
	  }

	  this.request(options, function(error, response, data) {
	    // request error
	    if (error) {
	      return callback(error, data, response);
	    }

	    // JSON parse error or empty strings
	    try {
	      // An empty string is a valid response
	      if (data === '') {
	        data = {};
	      }
	      else {
	        data = JSON.parse(data);
	      }
	    }
	    catch(parseError) {
	      return callback(
	        new Error('JSON parseError with HTTP Status: ' + response.statusCode + ' ' + response.statusMessage),
	        data,
	        response
	      );
	    }


	    // response object errors
	    // This should return an error object not an array of errors
	    if (data.errors !== undefined) {
	      return callback(data.errors, data, response);
	    }

	    // status code errors
	    if(response.statusCode < 200 || response.statusCode > 299) {
	      return callback(
	        new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage),
	        data,
	        response
	      );
	    }
	    // no errors
	    callback(null, data, response);
	  });

	};

	/**
	 * GET
	 */
	Twitter.prototype.get = function(url, params, callback) {
	  return this.__request('get', url, params, callback);
	};

	/**
	 * POST
	 */
	Twitter.prototype.post = function(url, params, callback) {
	  return this.__request('post', url, params, callback);
	};

	/**
	 * STREAM
	 */
	Twitter.prototype.stream = function(method, params, callback) {
	  if (typeof params === 'function') {
	    callback = params;
	    params = {};
	  }

	  var base = 'stream';

	  if (method === 'user' || method === 'site') {
	    base = method + '_' + base;
	  }

	  var url = this.__buildEndpoint(method, base);
	  var request = this.request({url: url, qs: params});
	  var stream = new Streamparser();

	  stream.destroy = function() {
	    // FIXME: should we emit end/close on explicit destroy?
	    if ( typeof request.abort === 'function' ) {
	      request.abort(); // node v0.4.0
	    }
	    else {
	      request.socket.destroy();
	    }
	  };

	  request.on('response', function(response) {
	    if(response.statusCode !== 200) {
	      stream.emit('error', new Error('Status Code: ' + response.statusCode));
	    }
	    response.on('data', function(chunk) {
	      stream.receive(chunk);
	    });

	    response.on('error', function(error) {
	      stream.emit('error', error);
	    });

	    response.on('end', function() {
	      stream.emit('end', response);
	    });
	  });

	  request.on('error', function(error) {
	    stream.emit('error', error);
	  });
	  request.end();

	  if (typeof callback === 'function') {
	    callback(stream);
	  }
	  else {
	    return stream;
	  }
	};


	module.exports = Twitter;


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("url");

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// glorious streaming json parser, built specifically for the twitter streaming api
	// assumptions:
	//   1) ninjas are mammals
	//   2) tweets come in chunks of text, surrounded by {}'s, separated by line breaks
	//   3) only one tweet per chunk
	//
	//   p = new parser.instance()
	//   p.addListener('object', function...)
	//   p.receive(data)
	//   p.receive(data)
	//   ...

	var EventEmitter = __webpack_require__(4).EventEmitter;

	var Parser = module.exports = function Parser() {
	  // Make sure we call our parents constructor
	  EventEmitter.call(this);
	  this.buffer = '';
	  return this;
	};

	// The parser emits events!
	Parser.prototype = Object.create(EventEmitter.prototype);

	Parser.END        = '\r\n';
	Parser.END_LENGTH = 2;

	Parser.prototype.receive = function receive(buffer) {
	  this.buffer += buffer.toString('utf8');
	  var index, json;

	  // We have END?
	  while ((index = this.buffer.indexOf(Parser.END)) > -1) {
	    json = this.buffer.slice(0, index);
	    this.buffer = this.buffer.slice(index + Parser.END_LENGTH);
	    if (json.length > 0) {
	      try {
	        json = JSON.parse(json);
	        switch(json.event){
	          case 'follow':
	            this.emit('follow', json);
	            break;
	          case 'unfollow':
	            this.emit('unfollow', json);
	            break;
	          case 'favorite':
	            this.emit('favorite', json);
	            break;
	          case 'unfavorite':
	            this.emit('unfavorite', json);
	            break;
	          case 'block':
	            this.emit('block', json);
	            break;
	          case 'unblock':
	            this.emit('unblock', json);
	            break;
	          case 'list_created':
	            this.emit('list_created', json);
	            break;
	          case 'list_destroyed':
	            this.emit('list_destroyed', json);
	            break;
	          case 'list_updated':
	            this.emit('list_updated', json);
	            break;
	          case 'list_member_added':
	            this.emit('list_member_added', json);
	            break;
	          case 'list_member_removed':
	            this.emit('list_member_removed', json);
	            break;
	          case 'list_user_subscribed':
	            this.emit('list_user_subscribed', json);
	            break;
	          case 'list_user_unsubscribed':
	            this.emit('list_user_unsubscribed', json);
	            break;
	          case 'quoted_tweet':
	            this.emit('quoted_tweet', json);
	            break;
	          case 'user_update':
	            this.emit('user_update', json);
	            break;
	          default:
	            this.emit('data', json);
	            break;
	        }
	      }
	      catch (error) {
	        error.source = json;
	        this.emit('error', error);
	      }
	    }
	  }
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("events");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("request");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("deep-extend");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = {
		"_args": [
			[
				{
					"raw": "twitter",
					"scope": null,
					"escapedName": "twitter",
					"name": "twitter",
					"rawSpec": "",
					"spec": "latest",
					"type": "tag"
				},
				"/Users/rahulaswani/twitter_webtask"
			]
		],
		"_from": "twitter@latest",
		"_id": "twitter@1.4.0",
		"_inCache": true,
		"_location": "/twitter",
		"_nodeVersion": "4.4.5",
		"_npmOperationalInternal": {
			"host": "packages-16-east.internal.npmjs.com",
			"tmp": "tmp/twitter-1.4.0.tgz_1470249396615_0.221101543167606"
		},
		"_npmUser": {
			"name": "reconbot",
			"email": "wizard@roborooter.com"
		},
		"_npmVersion": "2.15.5",
		"_phantomChildren": {},
		"_requested": {
			"raw": "twitter",
			"scope": null,
			"escapedName": "twitter",
			"name": "twitter",
			"rawSpec": "",
			"spec": "latest",
			"type": "tag"
		},
		"_requiredBy": [
			"#USER"
		],
		"_resolved": "https://registry.npmjs.org/twitter/-/twitter-1.4.0.tgz",
		"_shasum": "93ccacb4acb563c53e8562b27a8c667fce5066d3",
		"_shrinkwrap": null,
		"_spec": "twitter",
		"_where": "/Users/rahulaswani/twitter_webtask",
		"author": {
			"name": "Desmond Morris",
			"email": "hi@desmondmorris.com"
		},
		"bugs": {
			"url": "https://github.com/desmondmorris/node-twitter/issues"
		},
		"dependencies": {
			"deep-extend": "^0.4.1",
			"request": "^2.72.0"
		},
		"description": "Twitter API client library for node.js",
		"devDependencies": {
			"eslint": "^2.10.0",
			"mocha": "^2.4.5",
			"nock": "^8.0.0"
		},
		"directories": {},
		"dist": {
			"shasum": "93ccacb4acb563c53e8562b27a8c667fce5066d3",
			"tarball": "https://registry.npmjs.org/twitter/-/twitter-1.4.0.tgz"
		},
		"gitHead": "17fb3637312dbc9dc36080a49eca89bee4765e35",
		"homepage": "https://github.com/desmondmorris/node-twitter",
		"keywords": [
			"twitter",
			"streaming",
			"oauth"
		],
		"license": "MIT",
		"main": "./lib/twitter",
		"maintainers": [
			{
				"name": "desmondmorris",
				"email": "hi@desmondmorris.com"
			}
		],
		"name": "twitter",
		"optionalDependencies": {},
		"readme": "ERROR: No README data found!",
		"repository": {
			"type": "git",
			"url": "git+https://github.com/desmondmorris/node-twitter.git"
		},
		"scripts": {
			"lint": "eslint test/*.js lib/*.js",
			"test": "npm run lint && mocha"
		},
		"version": "1.4.0"
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = {
		"CONSUMER_KEY": "JzWOT89ySvf1W0OFZUQvplHpk",
		"CONSUMER_SECRET": "CcmSUhRI2ol34qCy0FpPSF7dkOZsl6v0aPBZbTc6X3nEjfotmR",
		"ACCESS_TOKEN": "2836738801-rP6NmAj3JSPOuoAXreb3p4U7EXy6Ho8CMlAYxWs",
		"ACCESS_TOKEN_SECRET": "7eZTWtt4fhYn4dnL37ckDwOtwf6J83CSvm4IejXGv14fZ"
	};

/***/ }
/******/ ]);