var sleep = require('co-sleep');

/**
 * Returns a generator that sleeps for `timeout` ms,
 * increasing `timeout` by 250ms each time it is called.
 *
 * @param {Number} start
 * @param {Number} max
 * @return {Function} generator
 * @api public
 */

exports.linear = function(start, max){
  var timeout = start;
  return function*(){
    yield sleep(timeout);
    if (max && timeout >= max) return timeout;
    return timeout += 250;
  };
};

/**
 * Returns a generator that sleeps for `timeout` ms,
 * doubling `timeout` each time it is called.
 *
 * @param {Number} start
 * @param {Number} max
 * @return {Function} generator
 * @api public
 */

exports.exponential = function(start, max){
  var timeout = start;
  return function*(){
    yield sleep(timeout);
    if (max && timeout >= max) return timeout;
    return timeout *= 2;
  };
};