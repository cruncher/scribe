import get from '../lib/fn/modules/get.js';
import overload from '../lib/fn/modules/overload.js';
import create from '../lib/dom/modules/create.js';
import { headGlyphs, restGlyphs, tailGlyphs, timeGlyphs, chordGlyphs } from "./glyphs.js";

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
    // Create clef
    clef: (symbol) => symbol.clef === 'percussion' ?
        undefined :
        create('span', {
            class: `${symbol.clef}-clef clef`,
            style: `font-size:2em;line-height:0.25em;`,
            //data: { eventId: identify(symbol.event) },
            data: { eventId: null },
            viewBox: "0 0.4 5.2 14.6",
            preserveAspectRatio: "none",
            html: "\uE050"
        }),

    // Create chord symbol
    chord: (symbol) => create('p', {
        class: "chord",
        data: { beat: symbol.beat + 1, duration: symbol.duration, eventId: identify(symbol.event) },
        html: symbol.root + (chordGlyphs[symbol.extension] ? chordGlyphs[symbol.extension] : symbol.extension)
    }),

    timesig: (symbol) => create('span', {
        class: "timesig",
        html: `<span style="font-size:1.5em;line-height:1em;">${timeGlyphs[symbol.numerator]}</span>
            <span style="font-size:1.5em;line-height:1em;">${timeGlyphs[symbol.denominator]}</span>`,
        data: { eventId: identify(symbol.event) },
    }),

    lyric: (symbol) => create('p', {
        class: "lyric",
        data: { beat: symbol.beat + 1, duration: symbol.duration, eventId: identify(symbol.event) },
        html: symbol.value
    }),

    // Create accidental
    acci: (symbol) => create('span', {
        class: "acci",
        style: `font-size:2em;line-height:0.25em;`,
        data: symbol.beat === undefined ?
            { pitch: symbol.pitch } :
            { beat: symbol.beat + 1, pitch: symbol.pitch, part: symbol.part, eventId: identify(symbol.event) },
        html: symbol.value === 1 ? '\uE262' : symbol.value === -1 ? '\uE260' : '\uE261'
    }),

    // Create note head
    upledger: (symbol) => create('svg', {
        class: "up-ledge ledge",
        viewBox: `0 ${0.5 - symbol.rows} 4.4 ${symbol.rows}`,
        preserveAspectRatio: "xMidYMax",
        data: { beat: symbol.beat + 1, pitch: symbol.pitch, part: symbol.part },
        style: `height: calc(${symbol.rows} * var(--y-size));`,
        html: '<use x="0" y="-8" href="#ledges"></use>'
    }),

    downledger: (symbol) => create('svg', {
        class: "down-ledge ledge",
        viewBox: `0 -0.5 4.4 ${symbol.rows}`,
        preserveAspectRatio: "xMidYMin",
        data: { beat: symbol.beat + 1, pitch: symbol.pitch, part: symbol.part },
        style: `height: calc(${symbol.rows} * var(--y-size));`,
        html: '<use x="0" y="-8" href="#ledges"></use>'
    }),

    // Create note head
    head: (symbol) => create('span', {
        class: "head",
        viewBox: "0 -1 2.7 2",
        style: `font-size:2em;line-height:0.25em;`,
        preserveAspectRatio: "xMidYMid slice",
        data: { beat: symbol.beat + 1, pitch: symbol.pitch, duration: symbol.duration, part: symbol.part, eventId: identify(symbol.event) },
        html: symbol.head ? headGlyphs[symbol.head] : ![0.125, 0.375, 0.75, 1.5, 3, 6].includes(symbol.duration) ? headGlyphs[symbol.duration] : `${headGlyphs[symbol.duration]}<span>${headGlyphs["dot"]}</span>`
    }),

    // Create note stem
    stem: (symbol) => create('svg', {
        class: `${symbol.stemDirection}-stem stem`,
        viewBox: "0 0 2.7 7",
        // Stretch stems by height
        preserveAspectRatio: "none",
        data: { beat: symbol.beat + 1, pitch: symbol.pitch, duration: symbol.duration, part: symbol.part },
        style: `--beam-y: ${symbol.beamY === undefined ? 0 : symbol.beamY};`,
        html: '<use href="#stem' + symbol.stemDirection + '"></use>'
    }),

    // Create note beam
    beam: (symbol) => create('svg', {
        // Beam is sloped down
        class: `${symbol.updown}-beam beam`,
        viewBox: `0 ${(symbol.range > 0 ? -symbol.range : 0) - 0.5} ${symbol.stems.length - 1} ${abs(symbol.range) + 1}`,
        preserveAspectRatio: "none",
        data: { beat: symbol.beat + 1, pitch: symbol.pitch, duration: symbol.duration, part: symbol.part },
        /*style: 'grid-row-end: span ' + Math.ceil(1 - symbol.range),*/
        style: `height: calc(${abs(symbol.range) + 1} * var(--y-size)); align-self: ${symbol.range > 0 ? 'end' : 'start'};`,
        html: `
            <path class="beam-path" d="M0,${-0.5 * beamThickness} L${symbol.stems.length - 1},${-symbol.range - 0.5 * beamThickness} L${symbol.stems.length - 1},${-symbol.range + 0.5 * beamThickness} L0,${0.5 * beamThickness} Z"></path>
            ${create16thNoteBeams(symbol.stems, symbol.range)}
        `
    }),

    // Create note beam
    tie: (symbol) => create('svg', {
        // Beam is sloped down
        class: `${symbol.updown}-tie tie`,
        viewBox: `0 0 1 1`,
        preserveAspectRatio: "none",
        data: { beat: symbol.beat + 1, pitch: symbol.pitch, duration: symbol.duration, part: symbol.part },
        /*style: 'grid-row-end: span ' + symbol.duration / 24 + ';' */
        style: `height: calc(6 * var(--y-size)); align-self: ${symbol.updown === 'up' ? 'end' : 'start'};`,
        html: `<use href="#tie"></use>`
    }),

    // Create note tail
    tail: (symbol) => create('span', {
        class: `${symbol.stemDirection}-tail tail`,
        style: `font-size:2em;line-height:0.25em;`,
        data: { beat: symbol.beat + 1, pitch: symbol.pitch, duration: symbol.duration, part: symbol.part, eventId: identify(symbol.event) },
        html: tailGlyphs[symbol.stemDirection][symbol.duration]
    }),

    // Create rest
    rest: (symbol) => create('span', {
        class: "rest",
        style: `font-size:2em;line-height:0.25em;`,
        preserveAspectRatio: "xMidYMid slice",
        data: { beat: symbol.beat + 1, pitch: symbol.pitch, duration: symbol.duration, part: symbol.part },
        html: ![0.125, 0.375, 0.75, 1.5, 3, 6].includes(symbol.duration) ? restGlyphs[symbol.duration] : `${restGlyphs[symbol.duration]}<span>${restGlyphs["dot"]}</span>`
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