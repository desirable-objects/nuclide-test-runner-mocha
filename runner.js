'use strict'

/* @flow */

const _atom = require('atom')
const Mocha = require('mocha')

class TestRunner {
  constructor (testFile) {
    this.emitter = new _atom.Emitter()
    this.mocha = new Mocha({
      reporter: 'json-stream'
    })
    this.mocha.addFile(testFile)
    this.args = [testFile]
  }

  run () {
    this.runId = 0

    this.emitter.emit('stderr', { runId: this.runId, data: `> mocha ${this.args.join(' ')}` })
    const runner = this.mocha.run()

    runner.on('pass', (event) => {
      this.emitter.emit('run-test', { testInfo: { name: event.title, durationSecs: event.duration, status: 1 } })
    })

    runner.on('fail', (event) => {
      const durationSecs = event.duration / 1000
      const status = event.timedOut ? 4 : 2
      const test_json = {
        className: 'n/a',
        name: event.ctx.test.parent.title,
        fileName: event.file,
        id: 'n/a'
      }

      this.emitter.emit('run-test', { testInfo: { name: event.title, durationSecs, summary: 'SUMMARY', status, test_json } })
    })

    runner.on('test', (event) => {
      ++this.runId
    })

    runner.on('suite', (event) => {
      this.emitter.emit('start', { testInfo: { name: event.title } })
    })

    runner.on('end', (event) => {
      // this.emitter.emit('summary', { testInfo: { test_json: { id: 0 },  } })
      this.finallyFn(this.runId)
    })

    // pending
  }

  do (fn) {
    this.doFn = fn
    return this
  }

  finally (fn) {
    this.finallyFn = fn
    return this
  }

  subscribe () {
    for (let event of ['summary', 'run-test', 'start', 'error', 'stdout', 'stderr']) {
      this.emitter.on(event, (m) => {
        m.kind = event
        this.doFn(m)
      })
    }

    this.run()
    return this
  }

  unsubscribe () {
    this.emitter.dispose()
    return this
  }

}

module.exports = {
  provideTestRunner: (service) => {
    return {
      label: 'Mocha',
      runTest: (openFilePath) => {
        return new TestRunner(openFilePath)
      }
    }
  }
}
