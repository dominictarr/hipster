var assert = require('assert')
var Document = require('../lib/document')

var doc = new Document()

doc.lines = [
  'first line\n',
  'second line\n',
  'third line\n'
]

// setting marks and gettingMarked.

doc.mark(0, 0)
assert.equal(doc.getMarked(), '')

doc.mark(5, 0)
assert.equal(doc.getMarked(), 'first')

console.log(doc.getMarked())

doc.mark(0, 1)

console.log(doc.getMarked())
assert.equal(doc.getMarked(), 'first line\n')

doc.unmark()
assert.equal(doc.getMarked(), null)

doc.mark(7, 1)
doc.mark(5, 2)
console.log(doc.lines, doc.marks)
assert.equal(doc.getMarked(), 'line\nthird')

// move back to the first line, 
// the first mark we made will be anchored at 7, 1
doc.mark (6, 0)

assert.equal(doc.getMarked(), 'line\nsecond ')

// clear marked
var orig = doc.lines.slice()

doc.unmark().mark(0, 0).mark(5, 0).clearMarked()
assert.equal(doc.lines[0], ' line\n')
console.log(doc.lines)

doc.lines = orig.slice()
doc.unmark().mark(0, 0).mark(0, 1)
console.log(doc.getMarked())
doc.clearMarked()
assert.equal(doc.lines[0], 'second line\n')

