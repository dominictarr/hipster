
//Ctrl-$X keys for controling hipster itself.

module.exports = function (doc, keys, cursor) {

  var rc = this.config
  var fs = require('fs')
  var cp = require('child_process')

  function send (args, write, cb) {
    var cmd = args.shift()
    var output = ''
    var c = cp.spawn(cmd, args)
    if(cb) {
      c.stdout.on('data', function (b) { output += b })
      c.stdout.on('end', function () { cb(null, output) })
    }
    c.on('error', function () {})
    c.stdin.write(write || '')
    c.stdin.end()
  }

  keys.on('keypress', function (ch, key) {

    if(key.ctrl) {
      if(key.name == 's' && !rc.noSave) {
        fs.writeFileSync(rc.file, doc.lines.join(''), 'utf-8')
        return
      }
      if(key.name == 'c') {
        send(['xclip', '-i', '-selection', 'clipboard'],
          doc.getMarked())
      }
      if(key.name == 'x') {
        send(['xclip', '-i', '-selection', 'clipboard'],
          doc.getMarked())
        doc.clearMarked()
      }
      if(key.name == 'p') {
        doc.clearMarked()
        send(['xclip', '-o', '-selection', 'clipboard'], '',
          function (_, paste) {   
            doc.insert(paste)
          })
      }
      if(key.name == 'r')
        return doc.emit('redraw')
      if(key.name == 'd')
        return console.error(doc.lines)
      if(key.name == 'q') {
        cursor.reset()
        process.stdin.pause()
        process.exit()
      }
    }

  })
}
