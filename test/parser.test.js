var expect = require('expect.js');
var Parser = require('../lib/parser');
var stream = require('stream');

describe('Parser', function(){

  var parser;

  beforeEach(function(){
    parser = new Parser();
  });

  it('should parse tweet text from an object', function(done){
    var source = stream.PassThrough();
    source.pipe(parser);
    source.write(new Buffer('{ "text"'));
    source.write(new Buffer(': "bar'));
    source.end(new Buffer('" }\r\n{ "text'));

    parser
      .on('data', function(chunk){
        expect(chunk.toString()).to.be('bar');
      })
      .on('end', done);
  });

});