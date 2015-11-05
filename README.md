# stweam

[![build status](https://img.shields.io/travis/tanem/stweam/master.svg?style=flat-square)](https://travis-ci.org/tanem/stweam)
[![coverage status](https://img.shields.io/coveralls/tanem/stweam.svg?style=flat-square)](https://coveralls.io/r/tanem/stweam)
[![npm version](https://img.shields.io/npm/v/stweam.svg?style=flat-square)](https://www.npmjs.com/package/stweam)
[![npm downloads](https://img.shields.io/npm/dm/stweam.svg?style=flat-square)](https://www.npmjs.com/package/stweam)

Streams the public Twitter stream.

Note that the output is the "raw" Twitter stream, so you'll need to [process it appropriately](https://dev.twitter.com/docs/streaming-apis/processing). Processing was deliberately left out of this module, so that you can choose your poison(s) via npm.

## Requirements

 * Node.js version 0.11.x (for the `harmony` flag which exposes generators)
 * Keys obtained from dev.twitter.com after [setting up a new app](https://apps.twitter.com/app/new)

## Installation

```
$ npm install stweam --save
```

## Example

```js
// => example.js

var Stweam = require('stweam');
var stream = require('stream');
var dest = new stream.PassThrough();

var stweam = new Stweam({
  consumerKey: 'consumerKey',
  consumerSecret: 'consumerSecret',
  token: 'token',
  tokenSecret: 'tokenSecret'
});

// Optionally hook into log messages...
stweam.on('info', function(msg){
  // Do something with msg.
});

// ... or warn messages.
stweam.on('warn', function(msg){
  // Do something with msg.
});

// stweam is a Stream.
stweam.pipe(dest);

stweam
  .language('fr')
  .track('beaker')
  .follow('12345')
  .start();
```

To run:

```
$ node --harmony example.js
```

Also, check out [chirp](https://github.com/tanem/chirp) to see `Stweam` in action.

## API

### var stweam = new Stweam(opts)

Initialise a new `Stweam` with the given `opts`.

`opts` should contain:

 * consumerKey
 * consumerSecret
 * token
 * tokenSecret

### stweam.track(keywords)

Set the phrases that will determine what is delivered on the stream.

See: [track](https://dev.twitter.com/docs/streaming-apis/parameters#track).

### stweam.language(language)

Set the Tweet language, defaults to `en`.

See: [language](https://dev.twitter.com/docs/streaming-apis/parameters#language).

### stweam.follow(userids)

Set the users whose Tweets will be delivered on the stream.

See: [follow](https://dev.twitter.com/docs/streaming-apis/parameters#follow).

### stweam.start()

Start the app.

## Events

Note: I like [Bunyan's opinions](https://github.com/trentm/node-bunyan#levels) on log levels :)

### stweam.on('info', function(msg){})

Provides detail about regular operation, rather than spamming stdout.

### stweam.on('warn', function(msg){})

Might want to take a closer look at this one.

## Tests

To run:

```
$ make test
```

To generate a coverage report:

```
$ make test-cov
```

## Credits

 * [tweets](https://github.com/benfoxall/tweets)
 * [urlgrey](https://github.com/cainus/urlgrey)
