
var types = [
  require('../highlight/javascript')
]

module.exports = function () {

  var rc = this.config

  if(rc.highlighting === false)
    return
  
  var file = rc.file

  console.error(file, types)

  for (var i = 0; i < types.length; i++)
    if(types[i].test(file)) {
      return this.renderers.push(types[i].highlight)
    }
}
