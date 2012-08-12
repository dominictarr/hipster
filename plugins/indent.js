
//apply indentation!

function indent (line) {
  return /^\s*$/.test(line) ? line : '  ' + line
}

function deindent (line) {
  var l = /^\s*/.exec(line)[0].length
  return line.substring(l > 1 ? 2 : l)
}

module.exports = function (doc, keys) {

  var rc = this.config

  keys.on('keypress', function (ch, key) {

    if(key.name !== 'tab') return

    // apply indentation to selected lines.
    if(doc.marks) {
      var m = doc.marks[0]
      var M = doc.marks[1]

      for(var i = m.y; i <= M.y; i++) {
        doc.updateLine(i, 
          (key.shift ? deindent : indent) (doc.lines[i])
        )
      }
      key.name = 'VETOED'
    }

  })

}
