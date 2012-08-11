
module.exports = function (doc) {

  require('colors')//make sure we have colors

  this.renderers.push(function (line) {
    return line + '\u266b'.blue
  })

}
