# Hipster

Okay, so today I wrote a text editor in node.js and named it `hipster` because I am an asshole,
(and no one had already used the name for something more stupid)

I had to cut some corners to get it done in a single day, But it still came out pretty good, 
I am editing this README with it right now.  

The hardest thing to get right was scrolling, lots of off by one errors.

## Unfeatures

hipster ain't got no:

* Copy/Paste        (use the c/p your OS provides the terminal)
* Multiple Buffers  (use screen, or tmux)
* Un Do             (use git)
* Friendly Warnings (deal with it)

This module is only ~500 lines of evented js. 
Will be easy to add these so-called "features" as plugins.

## Usage

```
npm install hipster -g
```

Then
```
hipster filename [options]

--margin     # Set to zero for no line numbers.
--page       # PageUp/Down jump size.
--height     # The Number of rows to use on the screen.

```

`hipster` uses [rc](https://npm.im/rc) for unmanaging configuration. 
you should too.

## Controls

 * Ctrl-S      - Save.
 * Ctrl-Q      - Quit.
 * Ctrl-R      - Redraw Screen.
 * Arrow       - Slow Movement.
 * Ctrl-Arrows - Fast Movement.

## See Also

If this editor is not hip enough for you, you may wish to consider 
[EasyWriter](http://www.webcrunchers.com/stories/easywriter.html)

## Aknowledgements

This module depends on [TooTallNate/keypress](https://github.com/tootallnate/keypress)
and [substack](https://github.com/substack/node-charm)  

But the most important thing is the playful oneupsmanship that exists in the node
community regarding ansi/terminal art. With out that I would probably not have attempted this.
You know who you are!

## Known Issues

sometimes when scrolling UP very quickly, funny characters get drawn. 
I didn't have time to figure out why. press Ctrl-R to make them go away.

## License

MIT
