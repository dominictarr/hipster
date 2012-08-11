
//Ctrl-$X keys for controling hipster itself.

module.exports = function (doc, keys, cursor) {

  var rc = this.config
  var fs = require('fs')

  keys.on('keypress', function (ch, key) {

    if(key.ctrl) {
      if(key.name == 's' && !rc.noSave) {
        fs.writeFileSync(rc.file, doc.lines.join(''), 'utf-8')
        return
      }
      if(key.name == 'r')
        return doc.emit('redraw')
      if(key.name == 'd')
        return console.error(doc.lines)
      if(key.name == 'q') {
        cursor.reset()
        process.stdin.pause()
      }
    }

  })
}
