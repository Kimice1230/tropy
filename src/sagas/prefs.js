'use strict'

require('../commands/ontology')

const { debug, warn } = require('../common/log')
const { CLOSE } = require('../constants/prefs')
const { ontology } = require('./ontology')
const { history } = require('./history')
const { ipc } = require('./ipc')
const { shell } = require('./shell')
const storage = require('./storage')

const {
  all, call, cancel, cancelled, fork, take
} = require('redux-saga/effects')

module.exports = {
  *main() {
    let aux

    try {
      aux = yield all([
        fork(ontology, { max: 2 }),
        fork(history),
        fork(ipc),
        fork(shell)
      ])

      yield all([
        call(storage.restore, 'prefs'),
        call(storage.restore, 'settings')
      ])

      debug('*prefs.main ready')
      yield take(CLOSE)

    } catch (e) {
      warn({ stack: e.stack }, 'unexpected error in *prefs.main')

    } finally {
      yield all([
        call(storage.persist, 'prefs'),
        call(storage.persist, 'settings')
      ])

      if (!(yield cancelled())) {
        yield all(aux.map(t => cancel(t)))
      }

      debug('*prefs.main terminated')
    }
  }
}
