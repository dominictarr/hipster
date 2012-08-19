# Hipster

Okay, so today I wrote a text editor in node.js and named it "hipster". 
Because I am an asshole. 
(and no one had already used the name for something more stupid)

I had to cut some corners to get it done in a single day,  
But it still came out pretty good,  
I am editing this README with it right now.  

## Features

Hipster has modern controls. no modes or silly stuff like that.

* Selection of text (Shift + Arrows)
* Copy/Paste        (`sudo apt-get install xclip`, on OSX, make a pull request)
* Typing            (like, duh)

## Unfeatures

Hipster ain't got no:

* Multiple Buffers  (use screen, [tmux interferes with controls too much])
* Un Do             (use git)
* Friendly Warnings (deal with it)

Will be easy to implement these so-called "features" as plugins.

## Usage

```
npm install hipster -g
```

Then
```
hip filename [options]

--margin     # Set to N >= 2 for line numbers.
--page       # PageUp/Down jump size.
--version|-v # print version and exit

```

`hipster` uses [rc](https://npm.im/rc) for unmanaging configuration. 
you should too.

## Controls

 * Arrows         - Slow Movement.
 * Ctrl-Arrows    - Fast Movement.
 * Shift-Movement - Select text
 * Ctrl-C         - Copy
 * Ctrl-X         - Cut
 * Ctrl-P,V       - Paste
 * Tab            - Indent   (to selected lines)
 * Shift-Tab      - Unindent (to selected lines)
 * Ctrl-R         - Redraw Screen.
 * Ctrl-S         - Save.
 * Ctrl-Q         - Quit.

## Preferred Terminals

Some terminals interfere with Modifier keys. I've found the XTerm works best. 
If you use fancy terminals that have tabs and stuff then you may have trouble
selecting text with key combinations like `Ctrl-Shift-Up/Down`.

## See Also

If this editor is not hip enough for you, you may wish to consider 
[EasyWriter](http://www.webcrunchers.com/stories/easywriter.html)

## Aknowledgements

This module depends on [TooTallNate/keypress](https://github.com/tootallnate/keypress),
[substack/node-charm](https://github.com/substack/node-charm) and 
[Marak/colors.js](https://github.com/Marak/colors.js)

But the most important thing is the playful oneupsmanship that exists in the node
community regarding ansi/terminal art. Without that I would probably not have attempted this.

You know who you are!

## Known Issues

Doesn't wrap lines or anything yet.

## License

MIT
