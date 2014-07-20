var request = require('request');
var stream = require('stream');
var co = require('co');
var backoff = require('./backoff');

/**
 * Expose `Stweam`.
 */

module.exports = Stweam;

/**
 * Initialise a new `Stweam` with the given `opts`.
 *
 * @param {String} opts.consumerKey
 * @param {String} opts.consumerSecret
 * @param {String} opts.token
 * @param {String} opts.tokenSecret
 * @api public
 */

function Stweam(opts) {
  stream.Transform.call(this);
  opts = opts || {};
  if (!opts.consumerKey) throw new Error('consumer key is required');
  if (!opts.consumerSecret) throw new Error('consumer secret is required');
  if (!opts.token) throw new Error('token is required');
  if (!opts.tokenSecret) throw new Error('token secret is required');
  this.consumerKey = opts.consumerKey;
  this.consumerSecret = opts.consumerSecret;
  this.token = opts.token;
  this.tokenSecret = opts.tokenSecret;
  this._keywords = '';
  this._language = 'en';
  this._initBackoffs();
}

Stweam.prototype = Object.create(stream.Transform.prototype);

/**
 * Initialise the backoff timers.
 *
 * @see https://dev.twitter.com/docs/streaming-apis/connecting#Test_backoff_strategies
 * @api private
 */

Stweam.prototype._initBackoffs = function(){
  this.networkErrorBackoff = backoff.linear(0, 16 * 1000);
  this.httpErrorBackoff = backoff.exponential(5 * 1000, 320 * 1000);
  this.rateLimitedErrorBackoff = backoff.exponential(60 * 1000);
};

/**
 * Connect to Twitter's public statuses stream.
 *
 * @see https://dev.twitter.com/docs/api/1.1/post/statuses/filter
 * @return {Request}
 * @api private
 */

Stweam.prototype._getRequest = function(){
  return request.post({
    url: 'https://stream.twitter.com/1.1/statuses/filter.json',
    oauth: {
      consumer_key: this.consumerKey,
      consumer_secret: this.consumerSecret,
      token: this.token,
      token_secret: this.tokenSecret
    },
    form: {
      track: this._keywords,
      language: this._language
    }
  });
};

/**
 * Pushes the tweet.
 *
 * @param {Buffer|String} chunk
 * @param {String} encoding
 * @param {Function} done
 * @api private
 */

Stweam.prototype._transform = function(chunk, encoding, done){
  this.push(chunk);
  done();
};  

/**
 * Handle the connection plus it's associated events.
 *
 * @api private
 */

Stweam.prototype._connect = function(){

  if (this.stallTimeout) clearTimeout(this.stallTimeout);
  if (this.request) this.request.abort();

  this.request = this._getRequest();

  this.request.on('error', function(){
    this.emit('info', 'request error -> reconnecting with network error backoff strategy');
    co(function*(){
      yield this.networkErrorBackoff;
      this._connect();
    }).call(this);
  }.bind(this));

  this.request.on('response', function(response){

    // https://dev.twitter.com/docs/streaming-apis/connecting#Stalls
    this.stallTimeout = setTimeout(function(){
      this.emit('info', 'response stalled -> reconnecting');
      this._connect();
    }.bind(this), 90 * 1000);

    response.on('data', function(){
      clearTimeout(this.stallTimeout);
    }.bind(this));

    var code = response.statusCode;

    // Rate limited backoff.
    // https://dev.twitter.com/discussions/20479
    if (code === 420 || code >= 500) {
      this.emit('info', 'rate limited response [' + code + '] -> reconnecting with rate limited backoff strategy');
      co(function*(){
        yield this.rateLimitedErrorBackoff;
        this._connect();
      }).call(this);
      return;
    }
    
    // Other HTTP error backoff.    
    if (code > 200) {
      this.emit('info', 'http error response [' + code + '] -> reconnecting with http error backoff strategy');
      co(function*(){
        yield this.httpErrorBackoff;
        this._connect();
      }).call(this);
      return;
    }

    this.emit('info', 'valid response received');

    // We have a valid response so can reset the backoffs.
    this._initBackoffs();
    response.pipe(this);

  }.bind(this));

};

/**
 * Set the phrases that will determine what is delivered on the stream.
 *
 * @see https://dev.twitter.com/docs/streaming-apis/parameters#track
 * @param {String} keywords
 * @return {Stweam} self
 * @api public
 */

Stweam.prototype.track = function(keywords){
  this._keywords = keywords;
  return this;
};

/**
 * Set the Tweet language.
 *
 * @see https://dev.twitter.com/docs/streaming-apis/parameters#language
 * @param {String} language
 * @return {Stweam} self
 * @api public
 */

Stweam.prototype.language = function(language){
  this._language = language;
  return this;
};

/**
 * Start the app.
 *
 * @api public
 */

Stweam.prototype.start = function(){
  this._connect();
};
