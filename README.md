# stweam

[![Build Status](https://travis-ci.org/tanem/stweam.png?branch=master)](https://travis-ci.org/tanem/stweam)
[![Coverage Status](https://coveralls.io/repos/tanem/stweam/badge.png?branch=master)](https://coveralls.io/r/tanem/stweam?branch=master)
[![NPM version](https://badge.fury.io/js/stweam.svg)](http://badge.fury.io/js/stweam)

Returns tweet data from the public Twitter stream.

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

var stweam = new Stweam({
  consumerKey: 'consumerKey',
  consumerSecret: 'consumerSecret',
  token: 'token',
  tokenSecret: 'tokenSecret'
});

stweam.on('info', function(msg){
  // Do something with the log msg.
});

stweam.on('data', function(tweet){
  // Do something with the tweet.  
});

// You can also pipe the output to some destination.
// stweam.pipe(...);

// Set a keyword to track.
stweam.track('beaker');

// Set the tweet object properties to be received.
stweam.receive(['text'])

// Start the app.
stweam.start();
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

Sets the phrases that will determine what is delivered on the stream.

Note that the default [language](https://dev.twitter.com/docs/streaming-apis/parameters#language) is `en`.

See: [track](https://dev.twitter.com/docs/streaming-apis/parameters#track).

### stweam.receive(receive)

Set the tweet object properties to return.

See: [tweets](https://dev.twitter.com/docs/platform-objects/tweets).

### stweam.start()

Start the app.


## Events

### stweam.on('data', function(result){})

Emitted each time a tweet object is written to `Stweam`. Note that `Stweam` is also an instance of `stream.Transform`, so tweet objects can be piped to some destination.

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