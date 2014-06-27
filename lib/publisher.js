var stream = require('stream');

/**
 * Expose `Publisher`.
 */

module.exports = Publisher;

/**
 * Initialise a new `Publisher`.
 *
 * @api public
 */

function Publisher() {
  stream.Writable.call(this);
}

Publisher.prototype = Object.create(stream.Transform.prototype);

/**
 * Adds chunks to the buffer. Once it hits the delimiter
 * it'll output the tweet text.
 *
 * @param {Buffer|String} data
 * @param {String} encoding
 * @param {Function} done
 * @fires tweet
 * @api private
 */

Publisher.prototype._write = function(chunk, encoding, done){
  this.emit('tweet', chunk.toString());
  done();
};