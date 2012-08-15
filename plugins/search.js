
module.exports = function (doc, keys, render) {
  var rc = this.config
  term = ''
  accumalating = false
  
  
  keys.on('keypress', function (ch, key) {
    if (accumalating) {
        if ('enter' == key.name) {
            accumalating = false
            search(term)
        } else {
            term += key.sequence        
            console.error('term is:'+term)
            return
        }
    } else {
        console.error('not acc');
    }
      
    if(key.ctrl) {
      if(key.name == 'f') {
        render.updateFooter('find:'+term)
        accumalating = true
        return
      }
    }
  });
  
  function search(t) {
      console.error('search for:'+t)
  }
}