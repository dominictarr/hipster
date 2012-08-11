module.exports = function (doc, keys, cursor) {

  //wether or not we are currently selecting text 
  var shift = false

  //we need to intercept after keypress
  //both before and after so that we can
  //select text properly if the keypress
  //has moved the cursor.

  //to achive this, remove all the listeners
  //add our first listener, then readd the listeners
  //then add our last listener.

  var listeners = keys.listeners('keypress')
  keys.removeAllListeners('keypress')

  function startSelection (ch, key) {

      //if it's shifted, _and_ they have pressed a directional key...
      if(key.shift) {
        if(!shift) doc.unmark()
        shift = true
        doc.mark()
      } else if (shift)
        shift = false
  }

  function endSelection (ch, key) {
    if(key.shift)
      doc.mark()
    else
      doc.unmark()
  }

  keys.on('keypress', startSelection)

  listeners.forEach(function (listener) {
    keys.on('keypress', listener)
  })   

  keys.on('keypress', endSelection)


  this.renderers.push(function (line, x, y) {

    if(doc.marks) {
      console.error(doc.marks, y)
      var m = doc.marks[0]
      var M = doc.marks[1]
      var diff = 0

      //if the match starts and ends on the same line
      if(m.y == M.y && m.y + 1 == y) {
        var l =[ line.substring(0, m.x), line.substring(m.x, M.x), line.substring(M.x)]
        console.error(l)
        l[1] = l[1].cyan.inverse
        line = l.join('')
      }

      //if we are inbetween the first and last matched lines.
      else if(m.y + 1 < y && y < M.y + 1) {
        line = line.cyan.inverse
      }

      //if this is the first matched line
      else if(m.y + 1 == y) {
        line = line.substr(0, m.x) + line.substr(m.x).cyan.inverse
        console.error(JSON.stringify(line))
      }

      //if this is the last matched line
      else if(M.y + 1 == y){
        //if the first mark is on the same line, adjust for that.
        line = line.substr(0, M.x).cyan.inverse + line.substr(M.x)
      }
    }

    return line

  })

}
