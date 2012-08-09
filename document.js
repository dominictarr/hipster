var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var words = require('./words')

inherits(Document, EventEmitter)

module.exports = Document

function Document() {
  this.row = this.column = 0
  this.lines = []
  this.marks = null
}

function cmp (m, n) {
  return m.y - n.y === 0 ? m.x - n.x : m.y - n.y
}

var methods = {
  line: function (n) {
    n = n || 0
  return this.lines[this.row + n]
  },
  setLine: function (val) {
    this.lines[this.row] = val
  },
  fixColumn: function () {
    var l
    if(this.column + 1 > (l = this.line().length))
      this.column = l - 1
    return this
  },
  isFirstLine: function () {
    return this.row === 0
  },
  isLastLine: function () {
    return this.row + 1 >= this.lines.length
  },
  isFirst: function () {
    return this.column === 0
  },
  isLast: function () {
    return this.column + 1 >= this.line().length
  },
  end: function () {
    this.column = this.line().length - 1
    return this
  },
  start: function () {
    this.column = 0
    return this
  },
  up: function () {
    if(this.row > 0)
      (--this.row, this.fixColumn())
    return this
  },
  down: function () {
    if(this.row + 1 < this.lines.length) 
      (++this.row, this.fixColumn())
    return this
  },
  mark: function (x, y) {
    if(x == null && y == null)
      x = this.row, y = this.column
    if(!this.marks)
      this.marks = []
    this.marks.push({x: x, y: y})
    if(this.marks.length > 1)
      this.marks.sort(cmp)
    if(this.marks.length > 2)
      this.marks.splice(1, this.marks.length - 2) 
    console.error(this.marks) 
  },
  unmark: function () {
    this.marks = null
  },
  left: function () {
    if(this.column > 0) --this.column
    return this
  },
  right: function () {
    if(this.column + 1 < this.line().length) ++this.column
    return this
  },
  prev: function () {
   var m = words.prev(this.line(), this.column)
    if(m) this.column = m.index
    else if(this.isFirstLine()) this.start()
    else this.up().end()
    return this
  },
  next: function () {
    var m = words.next(this.line(), this.column)
    if(m) this.column = m.index
    else if(this.isLastLine()) this.end()
    else  this.down().start()
    return this
  },
  prevSection: function () {
    this.up()
    while(! this.isFirstLine() && !/^\s*$/.test(this.line(-1)))
      this.up()
    return this
  },
  nextSection: function () {
    this.down()
    while(! this.isLastLine() && !/^\s*$/.test(this.line()))
      this.down()
    while(! this.isLastLine() && /^\s*$/.test(this.line()))
      this.down()
    return this
  },
  firstLine: function () { 
    this.row = 0 
    return this
  },
  lastLine: function () {
    this.row = this.lines.length - 1
    return this
  },
  move: function () {
    this._emit('cursor')
  },
  _emit: function (m, l) {
    this.emit(m, l || this.line(), this.column + 1, this.row + 1)
    return this
  },
  newline: function () {
    var nl, l = this.line()
    this.setLine(l.slice(0, this.column) + '\n')
    this._emit('update_line') 
    this.lines.splice(++this.row, 0, nl = l.slice(this.column))

    //could it be nice to have options to veto stuff?
    this.column = 0
    this._emit('new_line').move()
  },
  write: function (data) { 
    var l = this.line()
    this.setLine(l.slice(0, this.column) + data + l.slice(this.column))
    this.column += data.length
    this._emit('update_line').move()
    return this
  }, 
  delete: function (data) {
    data = data || 1
    if(this.isFirst() && data < 0 ) {
      if(this.isFirstLine()) return this
      this.up()
      //we want to be on the first character of what was the
      //next line, so that we delete the \n character
      this.column = this.line().length
      this._emit('delete_line')
//      this._emit('erase_line', '', 1, this.lines.length)

      this.lines.splice(this.row, 2, this.line() + this.line(1))
    } else if (this.isLast() && data > 0) {
      if(this.isLastLine()) return this
//      this.emit('delete_line', this.line(), this.column + 1, this.row + 1)
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
  backspace: function (n ) {
    return this.delete(-1 * (n || 1))
  }
}




for (var m in methods)
  Document.prototype[m] = methods[m]
