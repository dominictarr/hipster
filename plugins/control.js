
//Ctrl-$X keys for controling hipster itself.

module.exports = function (doc, keys, render) {

  var saved = false
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

  function clipIn () {
    if(process.platform === 'darwin') {
      send(['pbcopy'], doc.getMarked())
    }
    else if(process.platform === 'linux') {
      send(['xclip', '-i', '-selection', 'clipboard'], doc.getMarked())
    }
  }

  function clipOut () {
    function cb (_, paste) {
      doc.insert(paste)
    }

    if(process.platform === 'darwin') {
      send(['pbpaste'], '', cb)
    }
    else if(process.platform === 'linux') {
      send(['xclip', '-o', '-selection', 'clipboard'], '', cb)
    }
  }

  keys.on('keypress', function (ch, key) {

    console.error(ch, key)

    if(key.ctrl) {
      if(key.name == 's' && !rc.noSave) {
        saved = true
        fs.writeFileSync(rc.file, doc.lines.join(''), 'utf-8')
        return
      }
      if(key.name == 'c') {
        clipIn()
      }
      if(key.name == 'x') {
        clipIn()
        doc.clearMarked()
      }
      if(key.name == 'p' || key.name == 'v') {
        doc.clearMarked()
        clipOut()
      }
      if(key.name == 'r')
        return render.redraw(), doc.move()
      //delete current line
      if(key.name == 'd')
        return doc.start().deleteLines(doc.row, 1).move()
      //select current line
      if(key.name == 'l')
        doc.start().mark().down().mark().move()
      if(key.name == 'q') {
        process.stdin.pause()
        //exit error if not saved, so you can cancel editing
        //git commit messages
        process.exit(saved ? 0 : 1)
      }
    }

  })
}

