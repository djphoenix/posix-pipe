'use strict';
var pipe = require('../build/Release/posix').pipe;
var net = require('net');

function PipeSockets(pipes) {
  var pipefd = (pipes !== undefined) ? pipes : pipe();
  if (!(pipefd instanceof Array))
    throw new TypeError('pipes must be an array');
  if (pipefd.length !== 2)
    throw new TypeError('pipes must contain two elements');
  if (typeof pipefd[0] !== 'number' ||
      typeof pipefd[1] !== 'number')
    throw new TypeError('pipes elements must be a numbers');
  if (pipefd[0] < 0 ||
      pipefd[1] < 0)
    throw new TypeError('pipes elements must be valid file descriptors');
  var streams = [
    new net.Socket({
      fd: pipefd[0],
      allowHalfOpen: true,
      readable: true,
      writable: false
    }),
    new net.Socket({
      fd: pipefd[1],
      allowHalfOpen: true,
      readable: false,
      writable: true
    })
  ];
  return streams;
}

module.exports = PipeSockets;
module.exports.pipe = pipe;
