
import Signal            from '../../fn/modules/signal.js';
import create            from '../../dom/modules/create.js';
import element, { getInternals } from '../../dom/modules/element.js';
import { toRootName, toRootNumber } from '../../midi/modules/note.js';
import createSymbols     from '../modules/create-symbols.js';
import requestData       from '../modules/request-data.js';
import parseSource       from '../modules/parse.js';
import * as staves       from '../modules/staves.js';
import createElement     from '../modules/create-element.js';
import svgdefs           from '../modules/svgdefs.js';


const assign = Object.assign;
const define = Object.defineProperties;

/* ScribeMusic.stylesheet */
const shadowCSSUrl = import.meta.url.replace(/\/[^\/]*\.js/, '/shadow.css');
const stylesheet = Signal.of();
const stylefns   = [];
stylesheet.each((url) => stylefns.forEach((fn) => fn(url)));


/* Generate DOM */

function toElements(nodes, symbol) {
    const element = createElement(symbol);
    if (element) { nodes.push(element); }
    return nodes;
}

function toBarElements(elements, bar) {
    elements.push(create('div', {
        class: `${ bar.stave.clef }-stave stave bar`,
        data: { duration: bar.duration },
        children: bar.symbols.reduce(toElements, [])
    }));

    return elements;
}


/* Parse attributes */

const rtimesig = /^(\d+)\/(\d+)$/;

function timesigToMeter(string) {
    const groups = rtimesig.exec(string);
    const num = parseInt(groups[1], 10);
    const div = 4 / parseInt(groups[2], 10);
    return [0, "meter", num * div, div];
}

function meterToTimesig(meter) {
    const dur = meter[2];
    const div = meter[3];
    const num = dur / div;
    const den = 4 / div;
    return num + '/' + den;
}


/* Register <scribe-music> */

export default define(element('scribe-music', {
    shadow: `<link rel="stylesheet" href="${ shadowCSSUrl }" />` + svgdefs,

    construct: function(shadow, internals) {
        // Listen to updates to ScribeMusic.stylesheet and update the link
        const stylelink = shadow.querySelector('link');
        stylefns.push((url) => stylelink.href = url);
        if (stylesheet.value) stylelink.href = stylesheet.value;

        // Set up listeners for attribute/property changes
        internals.data      = Signal.of();
        internals.clef      = Signal.of('treble');
        internals.key       = Signal.of('C');
        internals.meter     = Signal.of([-4, "meter", 4, 1]);
        internals.transpose = Signal.of(0);

        /* Safari has some rounding errors to overcome... */
        internals.isSafari = navigator.userAgent.includes('AppleWebKit/')
            && !navigator.userAgent.includes('Chrome/')
            && !navigator.userAgent.includes('Edge/')
            && !navigator.userAgent.includes('Gecko/');
    },

    connect: function(shadow, internals) {
        // If Safari
        if (internals.isSafari) {
            this.classList.add('safari');
        }

        // Compute signal listens to changs
        Signal.from(() => (
            internals.data.value && createSymbols(
                // Events from data
                internals.data.value.events,
                // Clef is a string
                internals.clef.value,
                // Key name
                internals.key.value,
                // Create an initial [0, "meter", ...] event
                internals.meter.value,
                // Transpose is a number
                internals.transpose.value
            ).reduce(toBarElements, []))
        )
        .each((elements) => {
            // Clear the shadow DOM of bars and put new elements in it
            shadow.querySelectorAll('.bar').forEach((element) => element.remove());
            shadow.append.apply(shadow, elements);
        });

        // If there is no src use text content as data
        if (!this.src) {
            const source = this.textContent.trim();
            internals.data.value = parseSource(this.type, source);
        }
    }
}, {
    clef: {
        /**
        clef="treble"
        Choose the default clef to render. Not that if the rendered sequence
        contains clef events, they override this choice. Possible clefs are
        `"treble"`, `"bass"`, `"piano"`, `"drums"`, `"percussion"`, `"chord"`.
        **/
        attribute: function(value) { this.clef = value; },

        /**
        .clef = "treble"
        Choose the default clef to render. Not that if the rendered sequence
        contains clef events, they override this choice. Possible clefs are
        `"treble"`, `"bass"`, `"piano"`, `"drums"`, `"percussion"`, `"chord"`.
        **/
        get: function() {  return getInternals(this).clef.value; },
        set: function(value) {
            if (!staves[value]) {
                console.warn('<scribe-music> Attempt to set invalid clef="' + value + '" ignored');
                return;
            }
            getInternals(this).clef.value = value;
        }
    },

    key: {
        /**
        key="C"
        Choose the key signature. Defaults to "C".
        **/
        attribute: function(value) {
            this.key = value === '' ? 'C' : '';
        },

        /**
        .key="C"
        Choose the key signature.
        **/
        get: function() { return getInternals(this).key.value; },
        set: function(value) {
            const internals = getInternals(this);

            // Validate
            if (typeof value !== 'string' || !/^[A-G][#b♯♭]?$/.test(value)) {
                console.warn('<scribe-music> Attempt to set invalid key="' + value + '" ignored');
                return;
            }

            // Set
            internals.key.value = value.replace(/[#b]$/, ($0) => $0 === '#' ? '♯' : '♭');
        }
    },

    meter: {
        /**
        meter="4/4"
        Sets the meter. Note that this is overridden by any `"meter"` event
        found at beat `0` in the data.
        **/
        attribute: function(value) {
            // Default to 4/4 where meter attribute simply exists
            this.meter = value === '' ? '4/4' : value;
        },

        /**
        .meter = "4/4"
        Sets the meter. Note that this is overridden by any `"meter"` event
        found at beat `0` in the data.
        **/
        get: function() { return meterToTimesig(getInternals(this).meter.value); },
        set: function(value) { getInternals(this).meter.value = timesigToMeter(value); }
    },

    transpose: {
        /**
        transpose="0"
        Sets transposition value for display of notation.
        **/
        attribute: function(value) { this.transpose = value; },

        /**
        .transpose = 0
        Sets transposition value for display of notation.
        **/
        get: function() { return getInternals(this).transpose.value; },
        set: function(value) {
            // Set integer from value
            getInternals(this).transpose.value = typeof value === 'number' ?
                Math.round(value) :
                parseInt(value, 10) ;
        }
    },

    type: {
        /**
        type="application/json"
        Mimetype or type of data to fetch. Possible mimetypes:
        - `"text/x-abc"`
        - `"text/plain"`
        - `"application/json"`
        **/
        attribute: function(value) { this.type = value; },

        /**
        .type = "application/json"
        Mimetype or type of data to fetch. Possible mimetypes:
        - `"text/x-abc"`
        - `"text/plain"`
        - `"application/json"`
        **/
        writable: true
    },

    /**
    src="url"
    A path to an ABC, JSON or SEQUENCE file
    **/
    src: {
        attribute: function(src) { this.src = src; },
        get: function() { return getInternals(this).src; },
        set: function(src) {
            const internals = getInternals(this);
            internals.src = src;
            requestData(this.type, src).then((data) => this.data = data);
        },
        default:   null
    },

    /**
    .data
    **/
    data: {
        get: function() { return getInternals(this).data.value; },
        set: function(data) { getInternals(this).data.value = data; },
        default: null
    }
}, null, 'github.com/stephband/scribe/'), {
    // Define ScribeMusic.styleheet as the stylesheet signal
    stylesheet: {
        set: (url) => stylesheet.value = url,
        get: ()    => stylesheet.value
    }
});
