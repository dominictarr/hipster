var word = /[^\s]+/g

exports.prev = prev
exports.next = next

function prev(string, i, r) {
  r = r || word
  r.lastIndex = 0
  r.global = true

  var _m = null, m = null
  do { 
    _m = m
    m = r.exec(string)
  } while (m && m.index < i);

  if(!m || m.index >= i) return _m
  return m
}

function next (string, i, r) {
  r = r || word
  r.lastIndex = i
  r.global = true

  var _m = null, m = null
  do {
    m = r.exec(string)
    if(!m) return _m
    _m = m
  } while (m && m.index > i);

  return r.exec(string)
}


