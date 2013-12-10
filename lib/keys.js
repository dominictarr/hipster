var keypress = require('keypress')
var events = {keypress: [], mousepress: []}

process.stdin.setRawMode(true)
process.stdin.resume()

process.stdin.on('keypress', function (ch, key) {
  events.keypress.some(function(l) {
    return l(ch, key || {name: ch, ctrl: false, shift: false, meta: false})
  })
})

keypress(process.stdin)

process.stdin.on('mousepress', function (mouse) {
  events.mousepress.some(function(l) {
    return l(mouse)
  })
})

module.exports.on = function(event, listener) {
  events[event].push(listener)
}

module.exports._events = events

module.exports.listeners = function(evt) {
  return events[evt]
}

module.exports.removeAllListeners = function(evt) {
  events[evt] = []
}

if(!module.parent) {
  process.stdin.on('keypress', function (c, k) {
    console.error(c, k)
    if(c === 'q')
      process.exit()
  })
}
