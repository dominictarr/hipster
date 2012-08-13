

module.exports = function (doc, rc) {

  var c = require('charm')(process.stdout)
  var iq = require('insert-queue')

  //this will be reserved space for message bars etc.
//  var footer = 1

  var renderers = []
  var offset = 0

  var R = {
    redraw: redraw,
    header: 0,
    footer: 0,
    updateLine: updateLine,
    renderers: renderers,
    write: c.write.bind(c),
    reset: c.reset.bind(c),
    cursor: function (x, y) {
      cursor('', x, y)
    },
    updateHeader: function () {}
  }
  //this gets updated when you call redraw()
  var height = process.stdout.rows - (R.header + R.footer)

  process.stdout.on('resize', redraw)

  function render (line, x, y) {
    if(!line) return

    console.error('RENDER', y)

    //don't render the '\n'. this can mess-up escape codes.
    line = line.substring(0, line.length - 1)
    var q = iq(line)

    //iterate over the renderers, each gets to modify the line.
    renderers.forEach(function (render) {
      if(render) render(q, x, y)
    })
    return q.apply()
  }

  function updateLine(line, x, y, noErase) {
    if(y < offset || y > offset + height + 1) {
      console.error('OFF SCREEN UPDATE!!!', line, y)
      return
    }
    if(!line) return
    line = render(line, x, y)
    var remember = y+':'+line
    if(R.header + y - offset < R.header)
      throw new Error('OUT OF BOUNDS')
    console.error('WRITE TO', R.header + y - offset, offset)

    c.position(1, R.header + y - offset)

    if(!noErase)
      c.erase('line')

    c.write(line).display('reset')
  }

  function redraw () {
    
    height = process.stdout.rows - (R.header + R.footer)
    //forget everything we've drawn recently
    already = []
    c.reset()
    if(R.header)
      c.position(1, R.header).write('-HEADER-HEADER-HEADER-HEADER-HEADER-HEADER-HEADER-HEADER-HEADER-HEADER-')

    c.position(1, R.header + 1)
    //scroll(_, doc.column + 1, doc.row + 1)
    for (var i = offset; i < offset + height && doc.lines[i]; i++)
      if(i < doc.lines.length) updateLine(doc.lines[i], 1, i + 1, true)

    if(R.footer)
      c.position(1, height + R.header + 1).write('-FOOTER-FOOTER-FOOTER-FOOTER-FOOTER-FOOTER-FOOTER-FOOTER-FOOTER-')
  }
  function eraseLine (line, x, y) {
    c.position(1, R.header + y - offset).erase('line')
  }

  //delete a line from the bottom, and insert one on the top.
  function scrollUpLine () {
    c //delete line from bottom.
      .position(1, R.header + height).delete('line')
      //insert line at top.
      .position(1, R.header + 1).insert('line')
      console.error('SCRLUP', doc.lines[offset], 1, offset)
      updateLine(doc.lines[offset - 1], 1, offset)
  }

  //delete a line from the top, and insert one on the bottom.
  function scrollDownLine () {
    c //insert line at top.
      .position(1, R.header + 1).delete('line')
      .position(1, R.header + height).insert('line')
      //delete line from bottom.
      
      updateLine(doc.lines[offset + height], 1, offset + height + 1)
  }

  function deleteLine (line, x, y) {
    c.position(1, R.header + y - offset)
     .delete('line')
    //'when the document is shortened, add a new line at the bottom
    newLine(doc.lines[offset + height], 1, offset + height) 
  }

  function smaller (m, M) {
    if(!m) return false
    return m.y == M.y ? m.x < M.x : m.y < M.y
  }

  function eq(m, M) {
    return m.y == M.y && m.x == M.x
  }

  var _min, _max
  function updateMark (min, max) {
    var m, M

    console.error(['OLD', _min, _max, 'NEW', min, max])

    if(_min == null && _max == null)
      m = min, M = max
    else if(!eq(min, _min))
      m = _min, M = min
    else if(!eq(max, _max))
      m = _max, M = max
    
    var s
    if(smaller(M, m)) {
      s = M; M = m; m = s
    }

    console.error('UPDATE>>>', m, M, smaller(m, M))

    if(m && M)
      for(var i = m.y; i <= M.y; i ++)
        updateLine(doc.lines[i], 1, i+1)

    _min = min; _max = max
  }

  function clearMark () {
    for(var i = _min.y; i <= _max.y; i ++)
      updateLine(doc.lines[i], 1, i+1)
    _min = _max = null
  }

  function newLine (line, x, y) {
    deleteLastLine('', 1, offset + height + 1)
    c.position(1, R.header + y - offset)
      .insert('line')
    updateLine(line, x, y, true)
  }

  doc.on('update_line', updateLine)
  doc.on('redraw', redraw)
  doc.on('new_line', newLine)
  doc.on('mark', updateMark)
  doc.on('unmark', clearMark)
  doc.on('delete_line', deleteLine) 

  //cursor has moved.
  function cursor (line, x, y) {
    scroll(line, x, y)
    c.position(x + rc.margin, R.header + y - offset)
  }
  
  doc.on('cursor', cursor)
  c.cursor(true)

  function scroll (line, x, y) {
    var target = offset
    //there is an off by one error in here somewhere.
    //when I scroll down,
    if (y - (offset + height) > 0) 
      target = y - height
    else if (y - offset <= 0) 
      target = y - 1

    //if there was lots of scrolling, redraw the whole screen
    if(Math.abs(target - offset) >= rc.page) {
      offset = target
      return redraw()
    }

    //there are event listeners that pop off the lines at the other end
    //when scrolling happens.
    if(target != offset) {
      while(offset !== target) {
        if(target > offset) {
          //scrolling down, delete line from TOP.
//          deleteLine('', 1, 1 + offset)
          scrollDownLine()
          offset ++
        } 
        else if(target < offset){
          //scrolling up, add line to top.
          scrollUpLine()
          offset --
        }
      } while(offset !== target);
    }
  }

  //clear the screen after exiting
  process.on('exit', function () {
    c.reset()
  })

  return R
}
