var keypress = require('keypress')
var listeners = []

keypress(process.stdin)

process.stdin.on('keypress', function (ch, key) {
    listeners.forEach(function(l) {
        if (l(ch, key) !== true) return
    });
});

module.exports.on = function(foo, listener) {
    listeners.push(listener);
}
