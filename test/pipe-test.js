const assert = require('assert')
const spawn = require('child_process').spawn
const pipe = require('../')
const through = require('through2')

const describe = global.describe
const it = global.it

describe('pipe', () => {
  it('should fail for invalid pipes argument', done => {
    try {
      pipe(null)
    } catch (e) {
      if (e instanceof TypeError) return done()
      throw e
    }
    throw new Error('Not thrown')
  })
  it('should fail for invalid pipes array elements', done => {
    try {
      pipe([ null, '' ])
    } catch (e) {
      if (e instanceof TypeError) return done()
      throw e
    }
    throw new Error('Not thrown')
  })
  it('should fail for invalid pipefds', done => {
    try {
      pipe([ -1, -1 ])
    } catch (e) {
      if (e instanceof TypeError) return done()
      throw e
    }
    throw new Error('Not thrown')
  })
  it('should fail for TTY pipefds', done => {
    try {
      pipe([ 0, 1 ])
    } catch (e) {
      if (e instanceof TypeError) return done()
      throw e
    }
    throw new Error('Not thrown')
  })
  it('should fail for not UNKNOWN pipefds', done => {
    try {
      pipe([ 65534, 65535 ])
    } catch (e) {
      if (e instanceof TypeError) return done()
      throw e
    }
    throw new Error('Not thrown')
  })
  it('should not fail for valid pipefds', done => {
    const fds = pipe.pipe()
    const p = pipe(fds)
    p[0].destroy()
    p[1].destroy()
    done()
  })
  it('should not fail for undefined fds (auto-generate)', done => {
    const p = pipe()
    p[0].destroy()
    p[1].destroy()
    done()
  })
})

describe('pipe channel', () => {
  const data = Buffer.from('TESTtestTEST123')
  it('should pass data', done => {
    const p = pipe()
    p[0].on('data', d => {
      p[0].destroy()
      p[1].destroy()
      if (data.equals(d)) return done()
      throw new Error('Buffers not equal')
    })
    p[1].write(data)
  })
  it('should pass data to child process', done => {
    const p = pipe()
    const proc = spawn('cat', [ '/dev/stdin' ],
        { stdio: [ p[0], 'pipe', 'pipe' ] })
    proc.on('error', e => { throw e })
    p[0].destroy()
    let hasData = false
    proc.stdout.pipe(through((chunk, _, cb) => {
      hasData = true
      assert.equal(data.equals(chunk), true,
        'received & sent buffer should be equal')
      cb()
    }, cb => {
      assert.equal(hasData, true,
        'data should have been received')
      cb()
      p[1].destroy()
      done()
    }))
    p[1].end(data)
  })
  it('should pass data from child process', done => {
    const p = pipe()
    const proc = spawn('cat',
        { stdio: [ 'pipe', p[1], 'pipe' ] })
    proc.on('error', e => { throw e })
    p[1].destroy()
    let hasData = false
    p[0].pipe(through((chunk, _, cb) => {
      hasData = true
      assert.equal(data.equals(chunk), true,
        'received & sent buffer should be equal')
      cb()
    }, cb => {
      assert.equal(hasData, true,
        'data should have been received')
      cb()
      p[0].destroy()
      done()
    }))
    proc.stdin.end(data)
  })
})
