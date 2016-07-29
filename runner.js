'use strict'

/* @flow */

// const path = require('path')
const _atom = require('atom')
const Mocha = require('mocha')

class TestRunner {
  constructor (testFile) {
    this.emitter = new _atom.Emitter()
    this.mocha = new Mocha({
      reporter: 'json-stream'
    })
    this.mocha.addFile(testFile)
    this.runId = 0
    this.args = [testFile]
  }

  run () {
    this.emitter.emit('stderr', { runId: ++this.runId, data: `> mocha ${this.args.join(' ')}` })
    const runner = this.mocha.run()

    runner.on('pass', (event) => {
      this._emitTestResult(event)
      // this.emitter.emit('stdout', { runId: this.runId, data: Object.keys(event) })
    })

    // runner.on('fail', (event) => {
    //   this.emitter.emit('stderr', { runId: this.runId, data: event })
    // })
    //
    // runner.on('start', (event) => {
    //   this.emitter.emit('stderr', { runId: this.runId, data: event })
    // })
    //
    // runner.on('end', (event) => {
    //   this.emitter.emit('stderr', { runId: this.runId, data: event })
    // })
    //
    // runner.on('suite', (event) => {
    //   this.emitter.emit('stderr', { runId: this.runId, data: event })
    // })
    //
    // runner.on('pending', (event) => {
    //   this.emitter.emit('stderr', { runId: this.runId, data: event })
    // })
  }

  _emitTestResult (result) {
    for (let x of Object.keys(result)) {
      console.log(x, result[x])
    }
    this.emitter.emit('run-test', {
      runId: this.runId,
      testInfo: {
        name: result.title
        // durationSecs : (tr.endTime - tr.startTime) / 1000,
        // endedTime    : tr.endTime,
        // status       : statusNumFromString(tr.status),
        // summary      : tr.summary || 'SUMMARY',
        // test_json: {
        //   className : tr.name,
        //   name      : tr.name,
        //   fileName  : tr.name,
        //   id        : tr.name
        // }
      }
    })
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
        console.log('Emitting', m)
        m.kind = event
        this.doFn(m)
      })
    }

    this.run()
    return this
  }

  onDidStart (cb) {
    console.log('did start')
    this.emitter.on('did-start', cb)
  }

  onDidRunTest (cb) {
    console.log('did run')
    this.emitter.on('did-run-test', cb)
  }

  unsubscribe () {
    this.emitter.dispose()
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
