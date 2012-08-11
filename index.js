#!/usr/bin/env node

var fs = require('fs')
var rc = require('./config')
var ls = fs.createWriteStream('./debug.log')
var Document = require('./document')
var c = require('charm')(process.stdout)
var key = require('keypress')

//monkeypatch colors onto String
require('colors')

//internal representation of our text file
process.on('exit', function () {
  c.reset()
})

key(process.stdin)

process.stdin.setRawMode(true)
process.stdin.resume()

function Hipster (rc, doc) {

var offset = 0 
var height = rc.height

var renderers = []

doc = doc || new Document()

  var hip = {

    config: rc,

    plugins: [],

    clear: function () {
      this.plugins = []
      return this
    },

    renderers: renderers,

    use: function (plugin) {
      if(plugin)
        this.plugins.push(plugin)
      return this
    },

    init: function () {
      var self = this
      this.plugins.forEach(function (plug) {
        plug.call(self, doc, process.stdin, c)
      })
      doc.emit('cursor', 1, 1)
      doc.emit('redraw')
      return this
    }
  }

  var cache = []

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

  function updateLine(line, x, y, noErase) {
    if(y < offset || y > offset + height)
      return
    if(!noErase)
      c.position(1, y - offset).erase('line')
    line = render(line, x, y)
    c.write(line).display('reset').write('\n')
  }

  function redraw (_, x, y) {
    c.reset()
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
    eraseLine('', 1, offset + height + 1)
    c.position(1, y - offset)
      .insert('line')
    render(line, x, y)
  }

  doc.on('update_line', updateLine)
  doc.on('redraw', redraw)
  doc.on('new_line', newLine)
  doc.on('mark', updateMark)
  doc.on('unmark', updateMark)
  doc.on('delete_line', deleteLine) 

  //cursor has moved.
  doc.on('cursor', function (line, x, y) {
    scroll(line, x, y)
    c.position(x + rc.margin, y - offset)
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

  return hip
}

var hipster = Hipster(require('./config'))
  .use(require('./plugins/basics'))
  .use(require('./plugins/entry'))
  .use(require('./plugins/easy-writer'))
  .use(require('./plugins/movement'))
  .use(require('./plugins/selection')) //MUST come after movement.
  .use(require('./plugins/line-nums')) //MUST come after selection.
  .use(require('./plugins/control'))
  .init()






