# stweam

[![Build Status](https://travis-ci.org/tanem/stweam.png?branch=master)](https://travis-ci.org/tanem/stweam)
[![Coverage Status](https://coveralls.io/repos/tanem/stweam/badge.png?branch=master)](https://coveralls.io/r/tanem/stweam?branch=master)
[![NPM version](https://badge.fury.io/js/stweam.svg)](http://badge.fury.io/js/stweam)

Returns Tweet data from the public Twitter stream.

Note that the "raw" Twitter stream is returned, so you'll need to [process it appropriately](https://dev.twitter.com/docs/streaming-apis/processing). Processing was deliberately left out of this module, so that you can choose your poison(s) via npm.

## Requirements

 * Node.js version 0.11.x (for the `harmony` flag which exposes generators)
 * Keys obtained from dev.twitter.com after [setting up a new app](https://apps.twitter.com/app/new)


## Installation

```sh
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

// Optionally hook into log messages.
stweam.on('info', function(msg){
  // Do something with msg.
});

// stweam is a Stream.
stweam.pipe(dest);

stweam
  .language('fr');
  .track('beaker')
  .start();
```

To run:

```sh
$ node --harmony example.js
```


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

See: [language](https://dev.twitter.com/docs/streaming-apis/parameters#language)

### stweam.start()

Start the app.


## Events

### stweam.on('info', function(msg){})

Provides detail about regular operation, rather than spamming stdout.


## Testing

```sh
$ make test
```

To generate a coverage report:

```sh
$ make test-cov
```


## Credits

 * [tweets](https://github.com/benfoxall/tweets)
 * [urlgrey](https://github.com/cainus/urlgrey)