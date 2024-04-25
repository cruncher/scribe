
<img src="https://stephen.band/scribe/logo.png" style="float: right;" />

# Scribe

Scribe renders music notation in HTML.

Scribe takes a sequence of events – notes, chords, meter changes and so on – and
renders notation as symbols in a CSS grid.

There is a description of the CSS grid system in the blog post
<a href="https://cruncher.ch/blog/printing-music-with-css-grid/">Printing Music with CSS Grid</a>.


## Download

Scribe 0.3 is a recent rewrite, and does not yet have a release build.
Development builds are kept in the `build/` folder.


## `<scribe-music>`

Scribe 0.3 is a rewrite, and this custom element is the test bed. To try out the
development version of the element, import the css and register the element:

```html
<link rel="stylesheet" href="https://stephen.band/scribe/build/scribe-music/module.css" />
<script type="module" src="https://stephen.band/scribe/build/scribe-music/module.js"></script>
```

Now the `<scribe-music>` element renders music notation from data found in
it's content:

```html
<scribe-music type="sequence" clef="treble" meter="4/4">
    0 chord Dmaj    4
    0 F#5 0.2 1
    0 A4  0.2 1
    0 D4  0.2 1
</scribe-music>
```

Or imported from a file in its `src` attribute, like this gist:

```html
<scribe-music type="json" src="https://api.github.com/gists/739fa16055debb7972737835e4fa4623"></scribe-music>
```

Or set on it's data property:

```js
let scribe = document.body.querySelector('scribe-music');

scribe.data = {
    name:      'My Song',
    events:    [...]
};
```

Scribe consumes <a href="https://github.com/soundio/music-json/">Sequence JSON</a>
(and data objects of the same structure). Events are described by arrays of data in
the `.events` array:

```js
scribe.data = {
    events: [
        [0, "note", "G4", 0.2, 3]
    ]
};
```

Each event type has its own structure. Scribe 0.3 supports these event types:

| beat   | type         | 2 | 3 | 4 |
| :----- | :----------- | :--- | :--- | :--- |
| `beat` | `"chord"`    | `root` | `mode` | `duration` |
| `beat` | `"note"`     | `pitch` | `dynamic` | `duration` |
| `beat` | `"meter"`    | `duration` | `divisor` |  |
| `beat` | `"rate"`     | `number` |  |  |
| `beat` | `"key"`      | `notename` |  |  |
| `beat` | `"clef"`     | `clefname` |  |  |

Scribe 0.3 also parses a shorthand version of this format intended for quick hand authoring,
as in the first example above, which is basically Sequence JSON structure with all the JSON
syntax – commas and brackets and quotemarks – removed, and with the `note` type optional when
`note` events have pitch identifiers (like `G4`, as oppposed to pitch numbers like `67`).

Scribe 0.3 also parses ABC (thanks to the parser from [ABCjs](https://github.com/paulrosen/abcjs)).

---

### Attributes

#### `type="json"`

Mimetype or type of data to fetch from `src` or to parse from text content. 
Scribe supports 3 types of data:

- "application/json", or just "json"
- "text/x-abc", or just "abc"
- "sequence"

#### `src="url"`

A URL of some sequence data in JSON or ABC.

#### `clef="treble"`

Sets the stave. One of `"treble"`, `"bass"`, `"piano"`, `"drums"`, `"percussion"` or
`"chords"`.

#### `key="C"`

Gets and sets the key signature of the stave. Accepts any chromatic note name,
spelled with unicode sharps `♯` and flats `♭` or with hash `#` and small case `b`.

#### `meter="4/4"`

Sets the default meter. May be overridden by any `"meter"` events in data. If this
attribute is omitted no time signature is displayed (unless the data contains a `"meter"`
event at beat `0`) and the meter defaults to 4/4.

#### `transpose="0"`

Sets scribe to render notation transposed by `transpose` semitones. Transposition
is applied to key signature, notes and chords before render, and not to the underlying data.

---

### Properties

#### `.clef`

The name of the clef, one of `"treble"`, `"bass"`, `"piano"`, `"drums"`, `"percussion"` or
`"chords"`.

```js
let scribe = document.body.querySelector('scribe-music');
scribe.clef = "bass";
```

#### `.key`

The key signature of the stave. This is the key signature pre-transpose, if
`scribe.transpose` is something other than `0`, the key signature is transposed
before render.

```js
let scribe = document.body.querySelector('scribe-music');
scribe.key = "Bb";
```

#### `.meter`

The meter, expressed as a standard time signature. This setting is overridden
by any meter event found in the data at beat `0`.

```js
let scribe = document.body.querySelector('scribe-music');
scribe.meter = "4/4";
```

#### `.transpose`

A transpose value in semitones, an integer, applied to both key, notes and
chords before rendering.

```js
let scribe = document.body.querySelector('scribe-music');
scribe.transpose = 2;
```

Transposing a `scribe` does not change `scribe.data`, only the rendered output.

#### `.src`

URL of data to be parsed and rendered.

#### `.type`

Mimetype or type of data to fetch from `src` or to parse from text content.

- "application/json", or just "json"
- "text/x-abc", or just "abc"
- "sequence"

#### `.data`

Gets Scribe's internal data object, whose structure is a <a href="https://github.com/soundio/music-json/#sequence">Sequence</a>.
To export Sequence JSON, simply stringify `scribe.data`:

```js
let scribe = document.body.querySelector('scribe-music');
let mySong = JSON.stringify(scribe.data);
```

Set a `.data` object, structured as a <a href="https://github.com/soundio/music-json/#sequence">Sequence</a>,
to render it.

```js
let scribe = document.body.querySelector('scribe-music');
scribe.data = {
    name:      'My Song',
    events:    [...],
    sequences: [...]
};
```

---

## Develop

To install Scribe locally you need several repos served from one directory, as
Scribe's modules import modules from these other repos using relative paths.

Assuming you are inside a project repo, add the submodules:

```
git submodule add git@github.com:stephband/fn path/to/fn
git submodule add git@github.com:stephband/dom path/to/dom
git submodule add git@github.com:stephband/abcjs path/to/abcjs
git submodule add git@github.com:stephband/midi path/to/midi
git submodule add git@github.com:stephband/scribe path/to/scribe
```

To check things are working launch your server and navigate to
`path/to/scribe/scribe-music/index.html`.


## Roadmap

Asides from some immediate improvements I can make to Scribe 0.3, like
tuning the autospeller and fixing the 1/16th-note beams and detecting and
displaying tuplets, here are some longer-term features I would like to investigate:

- <strong>Support for <a href="https://www.smufl.org/fonts/">SMuFL fonts</a></strong> – changing the font used for notation symbols. So far I have not been able to display their extended character sets reliably cross-browser.
- <strong>Support for nested sequences</strong> – enabling multi-part tunes.
- <strong>Split-stave rendering</strong> – placing multiple parts on one stave. The mechanics for this are already half in place – the drums stave and piano stave currently auto-split by pitch.
- <strong>Multi-stave rendering</strong> – placing multiple parts on multiple, aligned, staves.


## Contributions

Rich Sigler of Sigler Music Fonts (http://www.jazzfont.com/) very kindly granted
permission to use JazzFont shapes as SVG paths in this project.

Gavin Band implemented probabalistic key centre analysis.

Scribe logo/mascot by Mariana Alt.
