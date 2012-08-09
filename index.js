//FIRSTLINE
var fs = require('fs')
var rc = require('rc')('hipster')
var ls = fs.createWriteStream('./debug.log')
var Document = require('./document')

var doc = new Document()

var offset = 0
var height = 32
var margin = 4
var page = 20

var file
if(rc._[0]) 
  file = rc._[0], title = file 
else file = __dirname+'/README.md', noSave = true, title = 'README'

//split into lines
doc.lines = toLines(fs.readFileSync(file, 'utf-8'))

//set title to hipster.
process.stdout.
  write('\x1b]0;hipster - ' + (title) + '\007')

doc.lines.pop()

var c = require('charm')(process.stdout)
var key = require('keypress')
var inspect = require('util').inspect

var words = require('./words')

process.on('exit', function () {
  c.reset()
})

process.on('unhandledException', function (err) {
  c.reset()
  console.log(err.stack)
  process.exit(1)
})

key(process.stdin)
process.stdin.setRawMode(true)
process.stdin.resume()

function padNum(n, m) {
  n = '' + n
  while(n.length < m)
    n = '0' + n
  return n.slice(n.length - (m))
}

function render (line, x, y) {
  c.foreground(y % 2 ? 'yellow' : 'green')
    .display(y % 10 ? 'dim' : 'bright')
    .write(padNum(y, margin -1) + ' ') 
    .display('dim')
  .foreground('white')
  c.write(line.slice(0, line.length - 1))
  .foreground('blue').write('\u266b')
  .foreground('white').write('\n')
}

var log = console.error

function toLines(data) {
  return data.split('\n').map(function (e, i, a) {
    //add '\n' to every line but the last one.
    return i + 1 < a.length ? e + '\n' : e
  })
}

//press a key, and need to figure out what column your in
//insert mode.
c.insert(true)

doc.on('new_line', function (line, x, y) {
  log('NEW', x, y, line)
  c.position(1, y - offset)
  .insert('line')
    .erase('line')
  render(line, x, y)
})

doc.on('redraw', function (_, x, y) {
  c.reset()
  c.position(1,1)
  for (var i = offset; i < offset + height && doc.lines[i]; i++)
    if(i < doc.lines.length) render(doc.lines[i], x, i + 1)
  c.position(1,1)
})

doc.on('delete_line', function (line, x, y) {
  log('DELETE', y, line)
//  if(doc.column != y)
    c.position(1, y - offset)
  c.delete('line')
})

//'when the document is shortened, clear the last line

doc.on('erase_line', function (line, x, y) {
  log('ERASE', y, line)
  c.position(1, y - offset).erase('line')
})

doc.on('cursor', function (line, x, y) {
  c.position(x, y - offset)
})

doc.on('update_line', function(line, x, y) {
  log('UPDATE', x, y, line)
  c.position(1, y - offset)
    .erase('line')
  render(line, x, y)
})

doc.on('new_line', function () {
  doc.emit('erase_line', 
    doc.lines[offset + height], 1, offset + height + 1)
})
doc.on('delete_line', function () {
  //redraw the last line on the window.
  doc.emit('update_line', 
    doc.lines[offset + height], 1, offset + height) 
})

c.cursor(true).reset()

function scroll (line, x, y) {
  var target = offset
  //there is an off by one error in here somewhere.
  //when I scroll down,
  if (y - (offset + height) > 0) {//high
    console.error('increase')
    target = y - height
    //erase Math.abs(offset - _offset) lines from end,
    //and update that many lines at the start.
  }
  else if (y - offset<= 0) { 
    console.error('decrease')
    target = y - 1
  }
  console.error(offset, height)
  //for lazyness, redraw the whole screen
  console.error('SCROLL', {c: y, o: offset, h: y - (offset + height), l: y - offset})

  if(Math.abs(target - offset) >= page) {
    offset = target
    return doc.emit('redraw')
  }

  if(target != offset) {
    console.error('SCROLL AMOUNT', target - offset)
    var sa = Math.abs(target - offset)
    var i = 1 
    while(offset !== target) {
      console.error('>>>>>>>>>>>>' , offset, target)
      if(target > offset) {
        console.error('INCREASE ')
        //scrolling down, delete line from TOP.
        console.error('delete line from', offset)
        doc.emit('delete_line', '', 1, 1 + offset)
        offset ++
      } 
      else if(target < offset){
        //offset --
        //scrolling up, add line to top.
        console.error('decrease', offset - 1)
        console.error('new line at line from', doc.lines[offset - 1], offset)
        doc.emit('new_line', doc.lines[offset - 1], 1, offset)
        offset --
      }

    } while(offset !== target);
  }
}

doc.on('cursor', function (line, x, y) {
  scroll(line, x, y)
  c.position(x + margin, y - offset)
})

var shift = false
process.stdin.on('keypress', function (ch, key) {
  var f = false, l = false

    if(key.shift) {
      if(!shift) doc.unmark()
      doc.mark()
      shift = true
    } else if (shift) {
      console.error(doc.marks)
      shift = false
    }

    if(!key.ctrl) {

      if(key.name == 'up'   ) 
        (doc.isFirstLine() ? doc.start() : doc.up()).move()
      if(key.name == 'down' )   
        (doc.isLastLine() ? doc.end() : doc.down()).move()

      if(key.name == 'left' )
        ((doc.isFirst() && !doc.isFirstLine() ? doc.up().end() : doc.left())).move()

      if(key.name == 'right') 
        ((doc.isLast() && !doc.isLastLine() ? doc.down().start() : doc.right())).move()

      if(key.name == 'end') doc.end().move()
      if(key.name == 'home') doc.start().move()

  } else if ( key.ctrl ) {

    if(key.name == 'left' ) {
      //go to start of previous word
      doc.prev().move()  
 
    }
    if(key.name == 'right') {
      //go to end of next word
      doc.next().move()  
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

    if(key.name == 'end') doc.firstLine().start().move()
    if(key.name == 'home') doc.lastLine().end().move()

    log(key)
  }
  
  if(key.name == 'pageup') {
      doc.row = Math.max(doc.row - page, 0)
      doc.move()
  }
  if(key.name == 'pagedown') {
    doc.row = Math.min(doc.row + page, doc.lines.length - 1)
    doc.move()
  }

  if(key.shift && key.name.length === 1)
    key.name = key.name.toUpperCase()

  c.foreground('white')

  if(key.name == 'r' && key.ctrl)
    return doc.emit('redraw')
   if(key.name == 'd' && key.ctrl)
    return console.error(doc.lines)
  if(key.name == 'c' && key.ctrl) {
    c.reset()
    process.stdin.pause()
  }

  if     (key.name == 'delete')    doc.delete(1)
  else if(key.name == 'backspace') doc.delete(-1)
  else if(key.name == 'enter')     doc.newline()
  else if(key.name == 'tab')       doc.write('  ') 
  //do something clever with indentation.
  else if(' ' <= ch && ch <= '~') doc.write(ch)
  
  log(doc.row, doc.column, doc.lines[doc.row], '--', key.name, doc.isFirst(), doc.isLast())

})

doc.emit('redraw', '', 1, 1)
doc.emit('cursor', '', 1, 1)
