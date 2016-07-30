'use strict'

const assert = require('assert')

describe('Some Suite', () => {
  it('Fails', (done) => {
    assert(false)
    done()
  })
  it('Passes', (done) => {
    assert(true)
    done()
  })
  it('Shows message', (done) => {
    assert(true, false, 'True is not false')
    done()
  })
})
