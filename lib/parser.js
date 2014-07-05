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
  stream.Transform.call(this, { objectMode: true });
  this.delimiter = '\r\n';
  this.buffer = '';
}

Parser.prototype = Object.create(stream.Transform.prototype);

/**
 * Adds chunks to the buffer. Once it hits the delimiter
 * it'll push the tweet object.
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
    try {
      this.push(JSON.parse(this.buffer));
    } catch (e) {}
    this.buffer = str.slice(delimiterIndex + 2); 
  } else {
    this.buffer += str;
  }
  done();
};