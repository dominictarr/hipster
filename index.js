#!/usr/bin/env node

var fs = require('fs')
var rc = require('./config')
var ls = fs.createWriteStream('./debug.log')
var Document = require('./document')
var c = require('charm')(process.stdout)
var key = require('keypress')

//internal representation of our text file
var doc = new Document()

var offset = 0 
var height = rc.height
var margin = rc.margin
var page   = rc.page
var noSave = false
var log

//default to empty file
doc.lines = ['\n']

//try and open the file the user past in
//if it doesn't exit yet, we will write 
//to it on Ctrl-S

var file = rc._[0] || __dirname+'/README.md', title = file 

try {
  doc.lines = toLines(fs.readFileSync(file, 'utf-8'))
  doc.lines.pop()
} catch (_) { }

if(rc._[0]) title = file
else        noSave = true, title = 'README'

//setup debugging
if(!rc.debug)
  log = console.error = function noop(){}

//log to a file
else if('string' == typeof rc.debug) {
  var inspect = require('util').inspect
  var ds = fs.createWriteStream(rc.debug)
  log = console.error = function () {
    ds.write(
      [].arguments.slice.call(arguments)
        .map(inspect).join(' ')
      +'\n'
    )    
  }
}

//log to stderr.
//hipster file 2> debug.log
else log = console.error 

//set title to hipster - $filename
process.stdout.
  write('\x1b]0;hipster - ' + (title) + '\007')

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
  if(!line) return

  if(margin) {
    c.foreground(y % 2 ? 'yellow' : 'green')
      .display(y % 10 ? 'dim' : 'bright')
      .write(padNum(y, margin - 1) + ' ') 
      .display('reset')
  }

  c.write(line.slice(0, line.length - 1))
  .foreground('blue').write('\u266b')
  .display('reset').write('\n')
}

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
  if (y - (offset + height) > 0) 
    target = y - height
  else if (y - offset<= 0) 
    target = y - 1

  //if there was lots of scrolling, redraw the whole screen
  if(Math.abs(target - offset) >= page) {
    offset = target
    return doc.emit('redraw')
  }

  //there are event listeners that pop off the lines at the other end
  //when scrolling happens.
  if(target != offset) {
    var sa = Math.abs(target - offset)
    var i = 1 
    while(offset !== target) {
      if(target > offset) {
        //scrolling down, delete line from TOP.
        doc.emit('delete_line', '', 1, 1 + offset)
        offset ++
      } 
      else if(target < offset){
        //scrolling up, add line to top.
        doc.emit('new_line', doc.lines[offset - 1], 1, offset)
        offset --
      }

    } while(offset !== target);
  }
}

//cursor has moved.
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

  c.display('reset')
  if(key.ctrl) {

    if(key.name == 's' && !noSave)
      return fs.writeFileSync(file, doc.lines.join(''), 'utf-8')
    if(key.name == 'r')
      return doc.emit('redraw')
    if(key.name == 'd')
      return console.error(doc.lines)
    if(key.name == 'q') {
      c.reset()
      process.stdin.pause()
    }
  }

  if     (key.name == 'delete')    doc.delete(1)
  else if(key.name == 'backspace') doc.delete(-1)
  else if(key.name == 'enter')     doc.newline()
  else if(key.name == 'tab')       doc.write('  ') 
  else if(' ' <= ch && ch <= '~') doc.write(ch)
})

doc.emit('redraw', '', 1, 1)
doc.emit('cursor', '', 1, 1)
