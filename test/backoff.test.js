var rewire = require('rewire');
var expect = require('expect.js');
var co = require('co');

var backoff = rewire('../lib/backoff');

// Assuming `co-sleep` will function correctly, so this thunk mock just
// returns immediately.
backoff.__set__('sleep', function(){
  return function(cb){
    cb();
  };
});

describe('Backoff', function(){

  describe('linear strategy', function(){

    it('should handle starting values', function(){
      co(function*(){
        var timeout = yield backoff.linear(1000);
        expect(timeout).to.be(1250);
      })();
    });

    it('should increment the sleep value by 250ms each time', function(){
      var linear = backoff.linear(0);
      co(function*(){
        var timeout = yield linear;
        expect(timeout).to.be(250);
        timeout = yield linear;
        expect(timeout).to.be(500);
        timeout = yield linear;
        expect(timeout).to.be(750);
      })();
    });

    it('should not increment the sleep value once max is reached', function(){
      var linear = backoff.linear(0, 500);
      co(function*(){
        var timeout = yield linear;
        expect(timeout).to.be(250);
        timeout = yield linear;
        expect(timeout).to.be(500);
        timeout = yield linear;
        expect(timeout).to.be(500);
      })();
    });

  });

  describe('exponential strategy', function(){

    it('should handle starting values', function(){
      co(function*(){
        var timeout = yield backoff.exponential(1000);
        expect(timeout).to.be(2000);
      })();
    });

    it('should double the sleep value each time', function(){
      var exponential = backoff.exponential(100);
      co(function*(){
        var timeout = yield exponential;
        expect(timeout).to.be(200);
        timeout = yield exponential;
        expect(timeout).to.be(400);
        timeout = yield exponential;
        expect(timeout).to.be(800);
      })();
    });

    it('should not increment the sleep value once max is reached', function(){
      var exponential = backoff.exponential(100, 400);
      co(function*(){
        var timeout = yield exponential;
        expect(timeout).to.be(200);
        timeout = yield exponential;
        expect(timeout).to.be(400);
        timeout = yield exponential;
        expect(timeout).to.be(400);
      })();
    });

  });

});