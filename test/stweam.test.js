var rewire = require('rewire');
var expect = require('expect.js');
var sinon = require('sinon');
var events = require('events');
var stream = require('stream');

describe('Stweam', function(){

  var Stweam;
  var stweam;
  var clock;

  // Fake timers need to be set up first so they're picked up by rewire.
  beforeEach(function(){
    clock = sinon.useFakeTimers();
    Stweam = rewire('../lib/stweam');
    stweam = new Stweam({
      consumerKey: 'key',
      consumerSecret: 'secret',
      token: 'token',
      tokenSecret: 'secret'
    });
  });

  afterEach(function(){
    clock.restore();
  });

  describe('construction', function(){

    it('should throw an error if consumerKey is not set', function(){
      expect(function(){
        new Stweam();
      }).to.throwException(/consumer key is required/);
    });

    it('should throw an error if consumerSecret is not set', function(){
      expect(function(){
        new Stweam({
          consumerKey: 'key'
        });
      }).to.throwException(/consumer secret is required/);
    });

    it('should throw an error if token is not set', function(){
      expect(function(){
        new Stweam({
          consumerKey: 'key',
          consumerSecret: 'secret'
        });
      }).to.throwException(/token is required/);
    });

    it('should throw an error if tokenSecret is not set', function(){
      expect(function(){
        new Stweam({
          consumerKey: 'key',
          consumerSecret: 'secret',
          token: 'token'
        });
      }).to.throwException(/token secret is required/);
    });

  });

  describe('backoff strategies', function(){

    var backoff;

    beforeEach(function(){
      backoff = { linear: sinon.stub(), exponential: sinon.stub() };
      Stweam.__set__('backoff', backoff);
      new Stweam({
        consumerKey: 'key',
        consumerSecret: 'secret',
        token: 'token',
        tokenSecret: 'secret'
      });
    });

    it('should include a linear network backoff strategy that starts at 0 and maxes at 16s', function(){
      expect(backoff.linear.args[0]).to.eql([0, 16000]);
    });

    it('should include an exponential http error backoff strategy that starts at 5s and maxes at 320s', function(){
      expect(backoff.exponential.args[0]).to.eql([5000, 320000]);
    }); 

    it('should include an exponential rate limited backoff strategy that starts at 60s and has no maximum', function(){
      expect(backoff.exponential.args[1]).to.eql([60000]);
    });

  });

  describe('Twitter request', function(){

    it('should POST with the correct parameters', function(){
      var postStub = sinon.stub();
      Stweam.__set__('request', { post: postStub });
      stweam._keywords = 'surfing';
      stweam._follow = '1234,5678';

      stweam._getRequest();

      expect(postStub.args[0][0]).to.eql({
        url: 'https://stream.twitter.com/1.1/statuses/filter.json',
        oauth: {
          consumer_key: 'key',
          consumer_secret: 'secret',
          token: 'token',
          token_secret: 'secret'
        },
        form: {
          track: 'surfing',
          language: 'en',
          follow: '1234,5678'
        }
      });

    });

  });

  describe('prior to connecting', function(){

    it('should clear an existing stall timeout', function(){
      var clearTimeoutStub = sinon.stub();
      Stweam.__set__({
        clearTimeout: clearTimeoutStub
      });
      stweam.stallTimeout = {};
      sinon.stub(stweam, '_getRequest').returns(new events.EventEmitter());

      stweam.start();

      expect(clearTimeoutStub.args[0][0]).to.be(stweam.stallTimeout);
    });

    it('should abort an existing request', function(){
      var requestStub = { abort: sinon.stub() };
      stweam.request = requestStub;
      sinon.stub(stweam, '_getRequest').returns(new events.EventEmitter());

      stweam.start();

      expect(requestStub.abort.calledOnce).to.be(true);
    });

  });

  describe('upon receiving a response', function(){
    
    it('should attempt reconnection after 90s if no data is received', function(){
      var response = new stream.PassThrough();
      sinon.stub(stweam, '_getRequest').returns(new events.EventEmitter());

      stweam.start();
      var connectStub = sinon.stub(stweam, '_connect');
      stweam.request.emit('response', response);
      clock.tick(1000 * 90);

      expect(connectStub.calledOnce).to.be(true);
      clock.restore();
    });

    it('should cancel the stall timeout if data is received', function(){
      var response = new stream.PassThrough();
      sinon.stub(stweam, '_getRequest').returns(new events.EventEmitter());

      stweam.start();
      var connectStub = sinon.stub(stweam, '_connect');
      stweam.request.emit('response', response);
      response.emit('data', new Buffer(''));
      clock.tick(1000 * 90);

      expect(connectStub.calledOnce).to.be(false);
      clock.restore();
    });

  });

  describe('upon receiving a request error', function(){

    it('should attempt reconnects according to the network backoff strategy', function(){
      var networkErrorBackoffStub = sinon.stub(
        stweam,
        'networkErrorBackoff',
        function(cb){
          cb();
        }
      );
      sinon.stub(stweam, '_getRequest').returns(new events.EventEmitter());

      stweam.start();
      var connectStub = sinon.stub(stweam, '_connect');
      stweam.request.emit('error');

      expect(networkErrorBackoffStub.calledOnce).to.be(true);
      expect(connectStub.calledOnce).to.be(true);
    });

  });

  describe('upon receiving a 420 response code', function(){

    it('should attempt reconnects according to the rate limited backoff strategy', function(){
      var rateLimitedErrorBackoffStub = sinon.stub(
        stweam,
        'rateLimitedErrorBackoff',
        function(cb){
          cb();
        }
      );
      var response = new stream.PassThrough();
      sinon.stub(stweam, '_getRequest').returns(new events.EventEmitter());

      stweam.start();
      var connectStub = sinon.stub(stweam, '_connect');
      response.statusCode = 420;
      stweam.request.emit('response', response);

      expect(rateLimitedErrorBackoffStub.calledOnce).to.be(true);
      expect(connectStub.calledOnce).to.be(true);
    });

  });

  describe('upon receiving a response code >= 500', function(){

    it('should attempt reconnects according to the rate limited backoff strategy', function(){
      var rateLimitedErrorBackoffStub = sinon.stub(
        stweam,
        'rateLimitedErrorBackoff',
        function(cb){
          cb();
        }
      );
      var response = new stream.PassThrough();
      sinon.stub(stweam, '_getRequest').returns(new events.EventEmitter());

      stweam.start();
      var connectStub = sinon.stub(stweam, '_connect');
      response.statusCode = 500;
      stweam.request.emit('response', response);

      expect(rateLimitedErrorBackoffStub.calledOnce).to.be(true);
      expect(connectStub.calledOnce).to.be(true);
    });

  });

  describe('upon receiving a response code > 200, < 500 and != 420', function(){

    it('should attempt reconnects according to the http error backoff strategy', function(){
      var httpErrorBackoffStub = sinon.stub(
        stweam,
        'httpErrorBackoff',
        function(cb){
          cb();
        }
      );
      var response = new stream.PassThrough();
      sinon.stub(stweam, '_getRequest').returns(new events.EventEmitter());

      stweam.start();
      var connectStub = sinon.stub(stweam, '_connect');
      response.statusCode = 401;
      stweam.request.emit('response', response);

      expect(httpErrorBackoffStub.calledOnce).to.be(true);
      expect(connectStub.calledOnce).to.be(true);
    });

  });

  describe('upon receiving a valid response code', function(){
  
    it('should reset the backoff strategies', function(){
      var backoffStub = sinon.stub(stweam, '_initBackoffs');
      var response = new stream.PassThrough();
      sinon.stub(stweam, '_getRequest').returns(new events.EventEmitter());

      stweam.start();
      stweam.request.emit('response', response);

      expect(backoffStub.calledOnce).to.be(true);
    });

    it('should pipe the twitter response through itself', function(done){
      var response = new stream.PassThrough();
      sinon.stub(stweam, '_getRequest').returns(new events.EventEmitter());

      stweam.start();
      stweam.request.emit('response', response);

      stweam
        .on('data', function(chunk){
          expect(chunk.toString()).to.be('{ "foo": "bar" }\r\n');
        })
        .on('end', done);

      response.end(new Buffer('{ "foo": "bar" }\r\n'));
    });

    // We know the piping is set up correctly from the above test,
    // so just checking `push` is called correctly.
    it('should push the tweet', function(){
      var pushStub = sinon.stub(stweam, 'push');
      stweam._transform('{ "foo": "bar", "baz": "qux" }', null, function(){});
      expect(pushStub.args[0][0]).to.eql('{ "foo": "bar", "baz": "qux" }');
    });

  });
  
  describe('track method', function(){

    it('should update the keywords property', function(){
      stweam.track('foo');
      expect(stweam._keywords).to.be('foo');
    });

  });

  describe('language method', function(){

    it('should update the language property', function(){
      stweam.language('foo');
      expect(stweam._language).to.eql('foo');
    });

  });

  describe('follow method', function(){

    it('should update the follow property', function(){
      stweam.follow('12345');
      expect(stweam._follow).to.be('12345');
    });

  });

  describe('start method', function(){

    it('should start the app', function(){
      var connectStub = sinon.stub(stweam, '_connect');
      stweam.start();
      expect(connectStub.calledOnce).to.be(true);
    });

  });

});