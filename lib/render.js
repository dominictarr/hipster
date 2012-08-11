

module.exports = function (doc, rc) {

  var c = require('charm')(process.stdout)

  var renderers = []
  var offset = 0

  var height = rc.height

  function render (line, x, y) {
    if(!line) return

    //don't render the '\n'. this can mess-up escape codes.
    line = line.substring(0, line.length - 1)

    //iterate over the renderers, each gets to modify the line.
    renderers.forEach(function (render) {
      if(!render) return
      var l = render(line, x, y)
      if(l) line = l
    })
    return line
  }

  // This prevents flicker when selecting text.
  // I think this is a bad pattern. Not as good as
  // knowing what lines have changed.
  // But then... the most expensive thing is
  // updating the screen. it's way cheaper to redo some
  // string manipulation.

  // This is a good example of why I suspect caching is an 
  // anti-pattern. It's so easy to add, and seems to help.
  // But it doesn't address the underlieing problem.

  // However, maybe the underlieing problem just isn't that important.
  // Right Now... it never is.

  var already = []
  function updateLine(line, x, y, noErase) {
    if(y < offset || y > offset + height)
      return
    if(!line) return
    line = render(line, x, y)
    var remember = y+':'+line
    if(!~already.indexOf(remember)) {
      already.push(remember)
      if(!noErase)
        c.position(1, y - offset).erase('line')
      c.write(line).display('reset').write('\n')
      //clear old lines.
      if(already.length > rc.height)
        already.shift()
    }
  }

  function redraw (_, x, y) {
    //forget everything we've drawn recently
    already = []
    c.reset()
    //scroll(_, doc.column + 1, doc.row + 1)
    for (var i = offset; i < offset + height && doc.lines[i]; i++)
      if(i < doc.lines.length) updateLine(doc.lines[i], x, i + 1, true)
  }
  function eraseLine (line, x, y) {
    c.position(1, y - offset).erase('line')
  }

  function deleteLine (line, x, y) {
    c.position(1, y - offset)
     .delete('line')
    //'when the document is shortened, clear the last line
    updateLine(doc.lines[offset + height], 1, offset + height) 
  }

  function smaller (m, M) {
    if(!m) return false
    return m.y < M.y ? true : m.x < M.x
  }

  var _min, _max
  function updateMark (min, max) {
    var m = smaller(_min, min) ? _min : min
    var M = smaller(_max, max) ? _max : max
    for(var i = m.y; i <= M.y; i ++)
      updateLine(doc.lines[i], 1, i+1)
    doc.move()
    _min = min; _max = max
  }

  function newLine (line, x, y) {
    c.position(1, y - offset)
      .insert('line')
    updateLine(line, x, y, true)
    eraseLine('', 1, offset + height + 1)
  }

  doc.on('update_line', updateLine)
  doc.on('redraw', redraw)
  doc.on('new_line', newLine)
  doc.on('mark', updateMark)
  doc.on('unmark', updateMark)
  doc.on('delete_line', deleteLine) 

  //cursor has moved.
  function cursor (line, x, y) {
    scroll(line, x, y)
    c.position(x + rc.margin, y - offset)
  }
  
  doc.on('cursor', cursor)
  c.cursor(true)

  function scroll (line, x, y) {
    var target = offset
    //there is an off by one error in here somewhere.
    //when I scroll down,
    if (y - (offset + height) > 0) 
      target = y - height
    else if (y - offset<= 0) 
      target = y - 1

    //if there was lots of scrolling, redraw the whole screen
    if(Math.abs(target - offset) >= rc.page) {
      offset = target
      return redraw()
    }

    //there are event listeners that pop off the lines at the other end
    //when scrolling happens.
    if(target != offset) {
      var sa = Math.abs(target - offset)
      var i = 1 
      while(offset !== target) {
        if(target > offset) {
          //scrolling down, delete line from TOP.
          deleteLine('', 1, 1 + offset)
          offset ++
        } 
        else if(target < offset){
          //scrolling up, add line to top.
          newLine(doc.lines[offset - 1], 1, offset)
          offset --
        }
      } while(offset !== target);
    }
  }

  //clear the screen after exiting
  process.on('exit', function () {
    c.reset()
  })

  return {
    redraw: redraw,
    updateLine: updateLine,
    renderers: renderers,
    write: c.write.bind(c),
    reset: c.reset.bind(c),
    cursor: function (x, y) {
      cursor('', x, y)
    }
  }
}
