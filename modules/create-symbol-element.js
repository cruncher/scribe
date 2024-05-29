import get from '../lib/fn/modules/get.js';
import overload from '../lib/fn/modules/overload.js';
import create from '../lib/dom/modules/create.js';
import * as glyphs from "./glyphs.js";
//import { headGlyphs, restGlyphs, tailGlyphs, timeGlyphs, chordGlyphs } from "./glyphs.js";

const abs = Math.abs;


/* Event ids */

const $id = Symbol('scribe-id');

//const eventMap = {};
let id = 0;

export function identify(event) {
    if (event[$id]) return event[$id];
    event[$id] = (++id + '');
    //eventMap[id] = event;
    return event[$id];
}

export function findEvent(events, id) {
    return events.find((event) => (event[$id] === id));
}


/* Beams */

const beamThickness = 1.1;

function renderBeam(range, stems, beam) {
    return `<path class="beam-path-16th beam-path" d="
        M${beam[0]},              ${(-range * beam[0] / (stems.length - 1)) - 0.5 * beamThickness}
        L${beam[beam.length - 1]},${(-range * beam[beam.length - 1] / (stems.length - 1)) - 0.5 * beamThickness}
        L${beam[beam.length - 1]},${(-range * beam[beam.length - 1] / (stems.length - 1)) + 0.5 * beamThickness}
        L${beam[0]},              ${(-range * beam[0] / (stems.length - 1)) + 0.5 * beamThickness}
    Z"></path>`;
}

function create16thNoteBeams(stems, range) {
    const durations = stems.map(get('duration'));
    let html = '';
    let n = -1;
    let beam;

    while (durations[++n]) {
        if (durations[n] < 0.5 && durations[n].toFixed(2) !== '0.33') {
            // Push to existing beam
            if (beam) { beam.push(n); }
            // Or start new beam
            else { beam = [n]; }
        }
        // Render beam
        else if (beam) {
            html += renderBeam(range, stems, beam);
            beam = undefined;
        }
    }

    // Render beam
    if (beam) {
        html += renderBeam(range, stems, beam);
    }

    return html;
}

export default overload(get('type'), {
    clef: (symbol) => create('span', {
        class: `${ symbol.clef }-clef clef`,
        //data: { eventId: identify(symbol.event) },
        data: { eventId: null },
        html: glyphs[symbol.clef + 'Clef'] || ''
    }),

    chord: (symbol) => create('abbr', {
        class: "chord-abbr",
        title: "TODO - name of chord",
        data: {
            beat:     symbol.beat + 1,
            duration: symbol.duration,
            eventId:  identify(symbol.event)
        },
        html: symbol.root + (chordGlyphs[symbol.extension] ? chordGlyphs[symbol.extension] : symbol.extension)
    }),

    timesig: (symbol) => create('span', {
        class: "timesig",
        data: { eventId: identify(symbol.event) },
        html: `<sup>${ glyphs['timeSig' + symbol.numerator] }</sup><sub>${ glyphs['timeSig' + symbol.denominator] }</sub>`
    }),

    lyric: (symbol) => create('p', {
        class: "lyric",
        data: {
            beat:     symbol.beat + 1,
            duration: symbol.duration,
            eventId:  identify(symbol.event)
        },
        html: symbol.value
    }),

    acci: (symbol) => create('span', {
        class: "acci",
        data: symbol.beat === undefined ?
            { pitch: symbol.pitch } :
            { beat: symbol.beat + 1, pitch: symbol.pitch, part: symbol.part, eventId: identify(symbol.event) },
        html: symbol.value === 1 ? glyphs.acciSharp :
            symbol.value === -1 ? glyphs.acciFlat :
            glyphs.acciNatural
    }),

    upledger: (symbol) => create('svg', {
        class: "up-ledge ledge",
        viewBox: `0 ${0.5 - symbol.rows} 4.4 ${symbol.rows}`,
        preserveAspectRatio: "xMidYMax",
        data: { beat: symbol.beat + 1, pitch: symbol.pitch, part: symbol.part },
        style: `height: ${ symbol.rows * 0.125 }em;`,
        html: '<use x="0" y="-8" href="#ledges"></use>'
    }),

    downledger: (symbol) => create('svg', {
        class: "down-ledge ledge",
        viewBox: `0 -0.5 4.4 ${symbol.rows}`,
        preserveAspectRatio: "xMidYMin",
        data: { beat: symbol.beat + 1, pitch: symbol.pitch, part: symbol.part },
        style: `height: ${ symbol.rows * 0.125 }em;`,
        html: '<use x="0" y="-8" href="#ledges"></use>'
    }),

    head: (symbol) => create('span', {
        class: "head",
        data: {
            beat:     symbol.beat + 1,
            pitch:    symbol.pitch,
            duration: symbol.duration,
            part:     symbol.part,
            eventId:  identify(symbol.event)
        },
        html: `${ glyphs['head' + (symbol.duration + '').replace('.', '')] }`
    }),

    stem: (symbol) => create('svg', {
        class: `${symbol.stemDirection}-stem stem`,
        viewBox: "0 0 2.7 7",
        // Stretch stems by height
        preserveAspectRatio: "none",
        data: {
            beat:     symbol.beat + 1,
            pitch:    symbol.pitch,
            duration: symbol.duration,
            part:     symbol.part
        },
        style: `--beam-y: ${symbol.beamY === undefined ? 0 : symbol.beamY};`,
        html: '<use href="#stem' + symbol.stemDirection + '"></use>'
    }),

    beam: (symbol) => create('svg', {
        // Beam is sloped down
        class: `${symbol.updown}-beam beam`,
        viewBox: `0 ${(symbol.range > 0 ? -symbol.range : 0) - 0.5} ${symbol.stems.length - 1} ${abs(symbol.range) + 1}`,
        preserveAspectRatio: "none",
        data: { beat: symbol.beat + 1, pitch: symbol.pitch, duration: symbol.duration, part: symbol.part },
        /*style: 'grid-row-end: span ' + Math.ceil(1 - symbol.range),*/
        style: `height: ${ (abs(symbol.range) + 1) * 0.125 }em; align-self: ${symbol.range > 0 ? 'end' : 'start'};`,
        html: `
            <path class="beam-path" d="M0,${-0.5 * beamThickness} L${symbol.stems.length - 1},${-symbol.range - 0.5 * beamThickness} L${symbol.stems.length - 1},${-symbol.range + 0.5 * beamThickness} L0,${0.5 * beamThickness} Z"></path>
            ${create16thNoteBeams(symbol.stems, symbol.range)}
        `
    }),

    tie: (symbol) => create('svg', {
        class: `${symbol.updown}-tie tie`,
        viewBox: `0 0 1 1`,
        preserveAspectRatio: "none",
        data: {
            beat:     symbol.beat + 1,
            pitch:    symbol.pitch,
            duration: symbol.duration,
            part:     symbol.part
        },
        style: `height: 0.75em; align-self: ${symbol.updown === 'up' ? 'end' : 'start'};`,
        html: `<use href="#tie"></use>`
    }),

    tail: (symbol) => create('span', {
        class: `${symbol.stemDirection}-tail tail`,
        data: {
            beat: symbol.beat + 1,
            pitch: symbol.pitch,
            duration: symbol.duration,
            part: symbol.part,
            eventId: identify(symbol.event)
        },
        html: glyphs['tail' + (symbol.stemDirection === 'up' ? 'Up' : 'Down') + (symbol.duration + '').replace('.', '')]
    }),

    rest: (symbol) => create('span', {
        class: "rest",
        data: {
            beat:     symbol.beat + 1,
            pitch:    symbol.pitch,
            duration: symbol.duration,
            part:     symbol.part
        },
        html: `${ glyphs['rest' + (symbol.duration + '').replace('.', '')] }`
    }),

    default: (function (types) {
        return function (symbol) {
            if (types[symbol.type]) return;
            types[symbol.type] = true;
            console.log(symbol);
            console.error('Scribe: symbol type "' + symbol.type + '" not rendered');
        };
    })({})
});
