
//do something else here to inject script for the language of the file.
//for example... 

//  js   is //
//  bash is #
//  ini  is ;

// I spend most of my time editing js, though. 
// so I'll leave that for when it's more important.

function comment (line) {
  return '//' + line
}
function uncomment (line) {
  return isCommented(line) ? line.replace('//', '') : line
}

function isCommented (line) {
  var r =  /^\s*\/\//.test(line)
   console.error('COMMENTED?', r, line)
  return r
}

module.exports = function (doc, keys) {

  var rc = this.config

  keys.on('keypress', function (ch, key) {

    if('k' == key.name && key.ctrl && doc.marks) {
      var m = doc.marks[0]
      var M = doc.marks[1]

      //first decide if we will comment or uncomment.
      //uncomment, if the lines all have comments at the start.
      //else, comment.

      var commented = true
      for(var i = m.y; i <= M.y; i++)
        if(!isCommented(doc.lines[i]))
          commented = false

      for(var i = m.y; i <= M.y; i++)
        doc.updateLine(i,
          (commented ? uncomment : comment) (doc.lines[i])
        )
    }
  })

}
