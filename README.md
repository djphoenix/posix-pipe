# Posix-Pipe

[![Build Status](https://travis-ci.org/djphoenix/posix-pipe.svg?branch=master)](https://travis-ci.org/djphoenix/posix-pipe) [![npm version](https://badge.fury.io/js/posix-pipe.svg)](https://badge.fury.io/js/posix-pipe)

[`posix-pipe`](https://www.npmjs.com/package/posix-pipe) is a `node.js` module providing missing POSIX pipe streams functionality.

## Usage
```javascript
var pipe = require('posix-pipe');

var streams = pipe();

// streams[0] is readable net.Socket, streams[1] is writable one
```

## Want raw FDs?
Just use it!
```javascript
var pipe = require('posix-pipe');

var streams = pipe.pipe(); // [ 23, 24 ] etc.
```
