var keypress = require('keypress')
var events = {keypress: [], mousepress: []}

process.stdin.setRawMode(true)
process.stdin.resume()

process.stdin.on('keypress', function (ch, key) {
  events.keypress.some(function(l) {
    return l(ch, key)
  })
})

keypress(process.stdin)
keypress.enableMouse(process.stdout)

process.on('exit', function () {
  //disable mouse on exit, so that the state is back to normal
  //for the terminal.
  keypress.disableMouse(process.stdout)
})

process.stdin.on('mousepress', function (mouse) {
  events.mousepress.some(function(l) {
    return l(mouse)
  })
})

module.exports.on = function(event, listener) {
  console.error("LISTEN", event, listener)
  
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
