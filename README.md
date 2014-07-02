# stweam

[![Build Status](https://travis-ci.org/tanem/stweam.png?branch=master)](https://travis-ci.org/tanem/stweam)
[![Coverage Status](https://coveralls.io/repos/tanem/stweam/badge.png?branch=master)](https://coveralls.io/r/tanem/stweam?branch=master)
[![NPM version](https://badge.fury.io/js/stweam.svg)](http://badge.fury.io/js/stweam)

A module that connects to the public Twitter stream, returning statuses for tracked keywords.

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

stweam.on('tweet', function(tweet){
  // Do something with the tweet.  
});

stweam.track('beaker');
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

Sets the phrases that will determine what is delivered on the stream,
then starts the app or reconnects if there was already an existing connection.

Note that the default [language](https://dev.twitter.com/docs/streaming-apis/parameters#language) is `en`.

## Events

### stweam.on('tweet', function(tweet){})

Emitted each time tweet text is written to `Stweam`.

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