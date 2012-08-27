var keypress = require('keypress')
var listeners = []

keypress(process.stdin)

process.stdin.on('keypress', function (ch, key) {
    listeners.some(function(l) {
        return l(ch, key)
    })
})

module.exports.on = function(foo, listener) {
    listeners.push(listener)
}

module.exports.listeners = function(evt) {
  return listeners
}

module.exports.removeAllListeners = function(evt) {
  listeners = []
}
