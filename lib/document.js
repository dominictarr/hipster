var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var words = require('./words')

inherits(Document, EventEmitter)

module.exports = Document

function Document() {
  this.row = this.column = 0
  this.lines = ['\n']
  this.marks = null
}
//compare marked positions
function cmp (m, n) {
  return m.y - n.y === 0 ? m.x - n.x : m.y - n.y
}

var methods = {

  //get line relative to current
  line: function (n) {
    n = n || 0
  return this.lines[this.row + n]
  },

  //set the current line
  setLine: function (val) {
    this.lines[this.row] = val
  },

  //force the column inside the string
  fixColumn: function () {
    var l
    if(this.column + 1 > (l = this.line().length))
      this.column = l - 1
    return this
  },

  //check if cursor is on first line
  isFirstLine: function () {
    return this.row === 0
  },

  //check if cursor is on last line
  isLastLine: function () {
    return this.row + 1 >= this.lines.length
  },

  //check if cursor is at start of line
  isFirst: function () {
    return this.column === 0
  },

  //check if cursor is at end of line
  isLast: function () {
    return this.column + 1 >= this.line().length
  },

  //move cursor to end of line
  end: function () {
    this.column = this.line().length - 1
    return this
  },

  //move cursor to start of line
  start: function () {
    this.column = 0
    return this
  },

  //move cursor up a line
  up: function () {
    if(this.row > 0)
      (--this.row, this.fixColumn())
    return this
  },

  //move cursor down a line
  down: function () {
    if(this.row + 1 < this.lines.length) 
      (++this.row, this.fixColumn())
    return this
  },

  //move cursor left
  left: function () {
    if(this.column > 0) --this.column
    return this
  },

  //move cursor to right
  right: function () {
    if(this.column + 1 < this.line().length) ++this.column
    return this
  },

  //move to previous word
  prev: function () {
   var m = words.prev(this.line(), this.column)
    if(m) this.column = m.index
    else if(this.isFirstLine()) this.start()
    else this.up().end()
    return this
  },

  //move to next word
  next: function () {
    var m = words.next(this.line(), this.column)
    if(m) this.column = m.index
    else if(this.isLastLine()) this.end()
    else  this.down().start()
    return this
  },

  //move to prev section (start of non whitespace block)
  prevSection: function () {
    this.up()
    while(! this.isFirstLine() && !/^\s*$/.test(this.line(-1)))
      this.up()
    while(! this.isFirstLine() && /^\s*$/.test(this.line()))
      this.up()
   return this
  },

  //move to next section (start of non whitespace block)
  nextSection: function () {
    this.down()
    while(! this.isLastLine() && !/^\s*$/.test(this.line()))
      this.down()
   while(! this.isLastLine() && /^\s*$/.test(this.line()))
      this.down()
    return this
  },

  //go to the first line
  firstLine: function () { 
    this.row = 0 
    return this
  },

  //go to the last line
  lastLine: function () {
    this.row = this.lines.length - 1
    return this
  },

  //ACTUALLY MOVE THE TERMINAL CURSOR.
  //IMPORTANT.
  move: function () {
    this._emit('cursor')
  },

   //set a mark, to mark a section just call this twice
  mark: function (x, y) {
    if(x == null && y == null)
      x = this.column, y = this.row

    var mark = {x: x, y: y}

    if(!this.firstMark) this.firstMark =  mark
    this.secondMark = mark

    this.marks = [this.firstMark, this.secondMark].sort(cmp)
    this.emit('mark', this.marks[0], this.marks[1])
  },

  //remove marks
  unmark: function () {
    var old = this.marks
    this.firstMark = this.secondMark = this.marks = null
    if(old)
      this.emit('unmark', old[0], old[1])
  },

  //internal. emit an event with current line and cursor pos.
  _emit: function (m, l) {
    this.emit(m, l || this.line(), this.column + 1, this.row + 1)
    return this
  },
  
  //create a new line under the cursor
  newline: function () {
    var nl, l = this.line()
    this.setLine(l.slice(0, this.column) + '\n')
    this._emit('update_line') 
    this.lines.splice(++this.row, 0, nl = l.slice(this.column))

    //could it be nice to have options to veto stuff?
    this.column = 0
    this._emit('new_line').move()
  },

  //write some data
  write: function (data) { 
    var l = this.line()
    this.setLine(l.slice(0, this.column) + data + l.slice(this.column))
    this.column += data.length
    this._emit('update_line').move()
    return this
  },

  //delete (+-charsToDelete)
  delete: function (data) {
    data = data || 1
    if(this.isFirst() && data < 0 ) {
      if(this.isFirstLine()) return this
      this.up()
      //we want to be on the first character of what was the
      //next line, so that we delete the \n character
      this.column = this.line().length
      this._emit('delete_line')

      this.lines.splice(this.row, 2, this.line() + this.line(1))
    } else if (this.isLast() && data > 0) {
      if(this.isLastLine()) return this
      this._emit('delete_line')
      this.end()
      this.lines.splice(this.row, 2, this.line() + this.line(+1))
    }
    var nc = this.column + data
    var l = this.line()
    var s = Math.min(this.column, nc)
    var e = Math.max(this.column, nc)
    this.lines[this.row] = 
      l.slice(0, s) + l.slice(e)
    this.column = s
    this._emit('update_line').move()
  },

  //delete backwards
  backspace: function (n) {
    return this.delete(-1 * (n || 1))
  }
}




for (var m in methods)
  Document.prototype[m] = methods[m]
