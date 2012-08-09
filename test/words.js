var w = require('../words')
var assert = require('assert')

var str = '#aaaaa bbbb cc d\n'

console.log('# find words forward')

var m = w.next(str, 0)
assert.ok(m)
assert.equal(m.index, 7)

var m = w.next(str, 3)
assert.ok(m)
assert.equal(m.index, 7)

var m = w.next(str, 7)
assert.ok(m)
assert.equal(m.index, 12)

var m = w.next(str, 14)
assert.ok(m)
assert.equal(m.index, 15)

var m = w.next(str, 15)
assert.equal(m, null)

console.log('# find words backwards')

var m = w.prev(str, 0)
assert.equal(m, null)

var m = w.prev(str, 3)
assert.equal(m.index, 0)

var m = w.prev(str, 7)
assert.equal(m.index, 0)

var m = w.prev(str, 14)
assert.ok(m)
assert.equal(m.index, 12)

var m = w.prev(str, 15)
assert.notEqual(m, null)
assert.equal(m.index, 12)

str = '# hhhhhhh\n'

var m = w.next(str, 0)
assert.ok(m)
assert.equal(m.index, 2)

console.log('# whitespace line')

assert.equal(w.next(' ', 0), null)
assert.equal(w.prev(' ', 0), null)

console.log('# empty string')

assert.equal(w.next('', 0), null)
assert.equal(w.prev('', 0), null)


