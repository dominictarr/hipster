
module.exports = function (doc, keys, render) {
  var rc = this.config,
  term = '',
  accumalating = false
  
  keys.on('keypress', function (ch, key) {
    if (accumalating) {
        if ('escape' == key.name) {
            accumalating = false
            //TODO put back prev footer info once renderer support getFooter()
            render.updateFooter(' ')
            return
        }
        else if ('enter' == key.name) {
            accumalating = false
            search(term)
        } else {
            if(key.name == 'backspace') {
                term = term.substring(0, term.length-1)
            } else {
                term += key.sequence        
            }
            console.error('term is:'+term)
            render.updateFooter('find:'+term)              
        }
        //Refactor this when there is another command that needs to veto something.
        //vvv TOTALLY HIDEOUS WAY TO PREVENT OTHER COMMANDS TRIGGERING.         
        key.name = 'VETOED'
        return
    } else {
        console.error('not acc');
    }
      
    if(key.ctrl) {
      if(key.name == 'f') {
        //TODO inc prev footer info once renderer support getFooter()
        render.updateFooter('find:'+term)
        accumalating = true
        return
      }
    }
  });
  
  function search(term) {
      var lineNumber = doc.row,
          idx = doc.column
      
      console.error('from line:'+lineNumber+' search for:'+term)
      
      //only search first line from current column & clear any mark before starting
      for(doc.unmark(); lineNumber < doc.lines.length; lineNumber++, idx=0) {
          var match = doc.lines[lineNumber].indexOf(term, idx)
          if (match != -1) {
              console.error('match line:'+lineNumber+' idx:'+match)
              //doc.pos(match, lineNumber).move() 
              doc.pos(match, lineNumber).move().mark().pos(match+term.length, lineNumber).mark()
              lastOffset = match + 1
              return;
          }           
      }
      console.error('no matches')      
  }
}