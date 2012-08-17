
module.exports = function (doc, keys, cursor) {
  var rc = this.config
  var preferred = 0

  function pref () {
    preferred = doc.column
    console.error('PREFERRED COLUMN', preferred)
  }
  function toPref() {
    if('undefined' === typeof preferred) doc.move()
    if(doc.line().length < preferred)
      doc.column = doc.line().length - 1
    else
      doc.column = preferred
    doc.move()
  }

  keys.on('keypress', function (ch, key) {

      if(!key.ctrl) {

        if(key.name == 'up'   ) {
          (doc.isFirstLine() ? doc.start() : doc.up())
          toPref()
        }
        if(key.name == 'down' ) {
          (doc.isLastLine() ? doc.end() : doc.down())
          toPref()
        }
        if(key.name == 'left' ) {
          ((doc.isFirst() && !doc.isFirstLine() ? doc.up().end() : doc.left())).move()
          pref()
        }
        if(key.name == 'right') {
          ((doc.isLast() && !doc.isLastLine() ? doc.down().start() : doc.right())).move()
          pref()
        }
        if(key.name == 'end') doc.end().move(), pref()
        if(key.name == 'home') doc.start().move(), pref()

    } else if ( key.ctrl ) {

      if(key.name == 'left' ) {
        //go to start of previous word
        if(doc.isFirst())
          doc.up().end().move()
        else
          doc.prev().move()  
        pref()
      }
      if(key.name == 'right') {
        //go to end of next word
        if(doc.isLast())
          doc.down().start().move()
        else
          doc.next().move()  
        pref()
      }

      //start of the previous non whitespace line.
      if(key.name == 'up')
        doc.prevSection().start().move()
      
      //start of the previous non whitespace line.
      if(key.name == 'down') {
        if(doc.isLastLine()) doc.end()
        else doc.nextSection().start()
        doc.move() 
      }

      if(key.name == 'home') doc.firstLine().start().move()
      if(key.name == 'end') doc.lastLine().end().move()
    }
    
    if(key.name == 'pageup') {
        doc.row = Math.max(doc.row - rc.page, 0)
        doc.move()
    }

    if(key.name == 'pagedown') {
      doc.row = Math.min(doc.row + rc.page, doc.lines.length - 1)
      doc.move()
    }
  })
}
