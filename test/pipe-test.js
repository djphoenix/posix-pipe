var assert = require('assert')
var spawn = require('child_process').spawn
var pipe = require('../')
var through = require('through2')

var describe = global.describe
var it = global.it

describe('pipe', function () {
  it('should fail for invalid pipes argument', function (done) {
    try {
      pipe(null)
    } catch (e) {
      if (e instanceof TypeError) return done()
      throw e
    }
    throw new Error('Not thrown')
  })
  it('should fail for invalid pipes array elements', function (done) {
    try {
      pipe([ null, '' ])
    } catch (e) {
      if (e instanceof TypeError) return done()
      throw e
    }
    throw new Error('Not thrown')
  })
  it('should fail for invalid pipefds', function (done) {
    try {
      pipe([ -1, -1 ])
    } catch (e) {
      if (e instanceof TypeError) return done()
      throw e
    }
    throw new Error('Not thrown')
  })
  it('should fail for TTY pipefds', function (done) {
    try {
      pipe([ 0, 1 ])
    } catch (e) {
      if (e instanceof TypeError) return done()
      throw e
    }
    throw new Error('Not thrown')
  })
  it('should fail for not UNKNOWN pipefds', function (done) {
    try {
      pipe([ 65534, 65535 ])
    } catch (e) {
      if (e instanceof TypeError) return done()
      throw e
    }
    throw new Error('Not thrown')
  })
  it('should not fail for valid pipefds', function (done) {
    var fds = pipe.pipe()
    var p = pipe(fds)
    p[0].destroy()
    p[1].destroy()
    done()
  })
  it('should not fail for undefined fds (auto-generate)', function (done) {
    var p = pipe()
    p[0].destroy()
    p[1].destroy()
    done()
  })
})

describe('pipe channel', function () {
  var data = new Buffer('TESTtestTEST123')
  it('should pass data', function (done) {
    var p = pipe()
    p[0].on('data', function (d) {
      p[0].destroy()
      p[1].destroy()
      if (data.equals(d)) return done()
      throw new Error('Buffers not equal')
    })
    p[1].write(data)
  })
  it('should pass data to child process', function (done) {
    var p = pipe()
    var proc = spawn('cat', [ '/dev/stdin' ],
        { stdio: [ p[0], 'pipe', 'pipe' ] })
    proc.on('error', function (e) { throw e })
    p[0].destroy()
    var hasData = false
    proc.stdout.pipe(through(function (chunk, _, cb) {
      hasData = true
      assert.equal(data.equals(chunk), true,
        'received & sent buffer should be equal')
      cb()
    }, function (cb) {
      assert.equal(hasData, true,
        'data should have been received')
      cb()
      p[1].destroy()
      done()
    }))
    p[1].end(data)
  })
  it('should pass data from child process', function (done) {
    var p = pipe()
    var proc = spawn('cat',
        { stdio: [ 'pipe', p[1], 'pipe' ] })
    proc.on('error', function (e) { throw e })
    p[1].destroy()
    var hasData = false
    p[0].pipe(through(function (chunk, _, cb) {
      hasData = true
      assert.equal(data.equals(chunk), true,
        'received & sent buffer should be equal')
      cb()
    }, function (cb) {
      assert.equal(hasData, true,
        'data should have been received')
      cb()
      p[0].destroy()
      done()
    }))
    proc.stdin.end(data)
  })
})
