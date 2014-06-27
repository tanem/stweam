var expect = require('expect.js');
var stream = require('stream');
var Publisher = require('../lib/publisher');

describe('Publisher', function(){

  var publisher;

  beforeEach(function(){
    publisher = new Publisher();
  });

  it('should emit tweets', function(done){
    publisher.on('tweet', function(tweet){
      expect(tweet).to.be('foo bar baz');
      done();
    });
    var source = new stream.PassThrough();
    source.pipe(publisher);
    source.end(new Buffer('foo bar baz'));
  });

});