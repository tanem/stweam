var stream = require('stream');

/**
 * Expose `Parser`.
 */

module.exports = Parser;

/**
 * Initialise a new `Parser`.
 *
 * @api public
 */

function Parser() {
  stream.Transform.call(this);
  this.delimiter = '\r\n';
  this.buffer = '';
}

Parser.prototype = Object.create(stream.Transform.prototype);

/**
 * Adds chunks to the buffer. Once it hits the delimiter
 * it'll push the tweet string.
 *
 * @param {Buffer|String} chunk
 * @param {String} encoding
 * @param {Function} done
 * @api private
 */

Parser.prototype._transform = function (chunk, encoding, done) {
  var str = chunk.toString();
  var delimiterIndex = str.indexOf(this.delimiter);
  if (~delimiterIndex) {
    this.buffer += str.slice(0, delimiterIndex);
    this.push(this.buffer);
    this.buffer = str.slice(delimiterIndex + 2); 
  } else {
    this.buffer += str;
  }
  done();
};