
import by           from '../../fn/modules/by.js';
import get          from '../../fn/modules/get.js';
import overload     from '../../fn/modules/overload.js';
import { toNoteNumber, toNoteName, normaliseNoteName, toRootName, toRootNumber } from '../../midi/modules/note.js';
import toKeys       from './sequence/to-keys.js';
import { keysAtBeats, keyFromBeatKeys } from './sequence/key-at-beat.js';
import eventsAtBeat from './sequence/events-at-beat.js';
import * as staves  from './staves.js';
import { mod12 }    from './maths.js';

const assign = Object.assign;
const { abs, ceil, floor } = Math;

const rflat        = /b|♭/;
const rsharp       = /#|♯/;
const rdoubleflat  = /bb|𝄫/;
const rdoublesharp = /##|𝄪/;
const rrootpitch   = /^[A-G][b#♭♯𝄫𝄪]?/;

const defaultMeter = {
    duration: 4,
    division: 1,
    breaks: [2],
    label: '4/4'
};

const defaults = {
    cursor:  0,
    key:     'C',
    timesig: '4/4',
    stave:   'treble'
};

function toPitch(stave, key, transpose, pitch) {
    return stave.getSpelling(
        // key
        mod12(key + transpose),
        // number
        toNoteNumber(pitch) + transpose,
        // type
        'note'
    );
}

function toChord(stave, key, transpose, string) {
    const root = (rrootpitch.exec(string) || nothing)[0];
    return stave.getSpelling(
        // key
        mod12(key + transpose),
        // chord name
        toRootName(toRootNumber(root) + transpose) + string.slice(root.length),
        // type
        'chord'
    );
}

function getStemDirection(note, head) {
    return head && head.stemDirection || (
        toNoteNumber(note) < toNoteNumber(head.pitch) ?
            'down' :
            'up' );
}

function isAfterBreak(breaks, b1, b2) {
    let n = -1;
    while (breaks[++n] && breaks[n] <= b1);
    // If breaks[n] is undefined, returns false, which is what we want
    return b2 >= breaks[n];
}

function getDuration(event) {
    return event[1] === 'chord' ? event[3] :
        event[4] ;
}

function insertTail(symbols, stemNote, i) {
    const head = symbols[i];
    const stemDirection = getStemDirection(stemNote, head) ;

    // Splice stem and tail in before head
    // TODO put tail before accidentals for CSS reasons
    symbols.splice(i, 0, assign({}, head, {
        type: 'stem',
        stemDirection
    }), assign({}, head, {
        type: 'tail',
        stemDirection
    }));

    // We just spliced two symbols in before index n
    return 2;
}

const lines = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function addStaveRows(n, row) {
    if (n < 0) {
        while (n++) {
            const line   = row[0];
            const octave = parseInt(row[row.length - 1], 10);

            // Are we switching octave down the way ?
            if (line === lines[0]) {
                row = lines[lines.length - 1] + (octave - 1);
            }
            else {
                const l = lines.indexOf(line);
                row = lines[l - 1] + octave;
            }
        }

        return row;
    }

    while (n--) {
        const line = row[0];
        const octave = parseInt(row[row.length - 1], 10);

        // Are we switching octave up the way ?
        if (line === lines[lines.length - 1]) {
            row = lines[0] + (octave + 1);
        }
        else {
            const l = lines.indexOf(line);
            row = lines[l + 1] + octave;
        }
    }

    return row;
}

function subtractStaveRows(stave, r1, r2) {
    if (stave.getRowDiff) {
        return stave.getRowDiff(r1, r2);
    }

    // Calculate diff for diatonic stave
    const degree1 = r1[0];
    // TODO Support -ve octave (and double figure octave?) numbers
    const octave1 = parseInt(r1[r1.length - 1], 10);
    const degree2 = r2[0];
    const octave2 = parseInt(r2[r2.length - 1], 10);

    let i1 = lines.indexOf(degree1);
    let i2 = lines.indexOf(degree2);
    let n  = i2 - i1;

    return n + (octave2 - octave1) * 7;
}

function insertBeam(symbols, stave, beam, stemNote, n) {
    const part = symbols[0].part;

    // Not enough stems for a beam, give it a tail
    if (beam.length === 1) {
        if (beam[0] >= n) {
            throw new Error('Last beam index (' + i + ') cant be greater than n (' + n + ')');
        }

        return insertTail(symbols, stemNote, beam[0]);
    }

    // Render stems and beam
    const stemDirection = symbols[beam[0]] && symbols[beam[0]].stemDirection ?
            symbols[beam[0]].stemDirection :
        (beam
        .map((i) => subtractStaveRows(stave, stemNote, symbols[i].pitch))
        .reduce((t, u) => t + u, 0) / beam.length) < 0 ?
            'up' :
            'down' ;

    const stems  = [];
    const buffer = [];

    // Loop backwards through beam splicing in stem symbols before
    // the heads, all with the winning stem direction
    let b = -1;
    let avgBeginLine = 0;
    let avgEndLine   = 0;
    let i, head, line, stem;
    while (beam[++b] !== undefined) {
        i    = beam[b];
        head = symbols[i];
        line = subtractStaveRows(stave, stemNote, head.pitch);

        head.stemDirection = stemDirection;
        head.tieDirection  = stemDirection === 'up' ? 'down' : 'up' ;

        if (b < (beam.length - 1) / 2) {
            avgBeginLine += line / Math.floor(beam.length / 2);
        }

        else if (b > (beam.length - 1) / 2) {
            avgEndLine += line / Math.floor(beam.length / 2);
        }

        if (stem && stem.beat === head.beat) {
            //let stemLine = subtractStaveRows('B4', head.pitch)
            //let range =
            stem.range = subtractStaveRows(stave, stem.pitch, head.pitch);
            stem.pitch = stem.range < 0 ?
                stem.stemDirection === 'up' ? stem.pitch : head.pitch :
                stem.stemDirection === 'up' ? head.pitch : stem.pitch ;
        }
        else {
            stem = assign({}, head, {
                type: 'stem'
            });
            stems.push(stem);
        }

        if (head.tie === 'begin') {
            buffer.push(assign({}, head, {
                type: 'tie',
                beat:   head.beat,
                updown: head.tieDirection,
                event:  head.event
            }));
        }
    }

    // Calculate where to put beam exactly
    let begin    = stems[0];
    let end      = stems[stems.length - 1];
    let endRange = subtractStaveRows(stave, begin.pitch, end.pitch);
    let avgRange = avgEndLine - avgBeginLine;
    let range    = abs(avgRange) > abs(0.75 * endRange) ?
        0.75 * endRange :
        avgRange ;

    stems.forEach((stem, i) => {
        stem.beamY = stemDirection === 'down' ?
            -range * i / (stems.length - 1) + subtractStaveRows(stave, begin.pitch, stem.pitch) :
            range * i / (stems.length - 1) - subtractStaveRows(stave, begin.pitch, stem.pitch) ;
    });

    symbols.splice(i, 0, ...stems);

    // Put the beam in front of the first head (??)
    symbols.splice(i, 0, assign({}, begin, {
        type:   'beam',
        // Push beam start into next grid column
        beat:   begin.beat,
        duration: end.beat - begin.beat,
        //pitch:  begin.pitch,
        range:  range,
        updown: stemDirection,
        stems:  stems
    }));

    symbols.splice(i, 0, ...buffer);

    // We just spliced a bunch of symbols in before index n
    return stems.length + buffer.length + 1;
}

function insertSymbols(symbols, bar, stemNote) {
    // All events in symbols have the same part
    const part  = symbols[0].part;
    const accidentals = {};
    let beat = 0;
    let n = -1;
    let head;
    let beam;
    let endBeat;

    while (head = symbols[++n]) {
        endBeat = head.beat + head.duration;

        // We are only interested in notes
        if (head.type !== 'head') continue;

        // Rest
        // Insert rest if head beat is greater than beat
        if (head.beat > beat) {
            // [beat, 'rest', pitch (currently unused), duration]
            symbols.splice(n++, 0, {
                beat,
                type:     'rest',
                pitch:    '',
                part:     part,
                duration: head.beat - beat
            });
        }

        // Update beat
        if (endBeat > beat) beat = endBeat;

        // Accidental
        // Determine accidental
        const acci = rsharp.test(head.pitch) ? 1 :
            rflat.test(head.pitch) ? -1 :
            undefined ;

        // Line name is note name + octave (no # or b)
        const line = head.pitch[0] + head.pitch.slice(-1);

        if (
            // If head is not a tied head from a previous bar - they
            // don't require accidentals,
            !(head.beat === 0 && head.tie && head.tie !== 'begin')
            // and if it has changed from the bars current accidentals
            && acci !== accidentals[line]
        ) {
            accidentals[line] = acci;
            symbols.splice(n++, 0, assign({}, head, {
                type: 'acci',
                value: acci || 0
            }));
        }

        // Up ledger lines
        let ledgerrows = subtractStaveRows(bar.stave, 'G5', head.pitch);

        if (ledgerrows > 0) {
            symbols.splice(n++, 0, assign({}, head, {
                type: 'upledger',
                rows: ledgerrows
            }));
        }

        // Down ledger lines
        else {
            ledgerrows = subtractStaveRows(bar.stave, head.pitch, 'D4');
            if (ledgerrows > 0) {
                symbols.splice(n++, 0, assign({}, head, {
                    type: 'downledger',
                    rows: ledgerrows
                }));
            }
        }

        // Beam
        if (beam && beam.length) {
            // If head is a quarter note or longer
            if (head.duration >= 1
                // or head is a triplet quarter note
                || head.duration.toFixed(2) === '0.67'
                // or head crosses a bar break
                || isAfterBreak(bar.breaks, symbols[beam[beam.length - 1]].beat, head.beat)
            ) {
                // Close the current beam
                n += insertBeam(symbols, bar.stave, beam, stemNote, n);
                beam = undefined;
            }
        }

        // Stem and tieheads. We must wait for stems to be decided before rendering
        // tieheads as their up/down direction is dependent.
        if (head.duration < 4) {
            // Is this head less than 1 beat, and not 1 triplet beat, long?
            // Wait for it to be beamed.
            if (head.duration < 1 && head.duration.toFixed(2) !== '0.67') {
                if (beam) {
                    // Keep index of head
                    beam.push(n);
                }
                else {
                    // Create new beam
                    beam = [n];
                }
            }
            // Otherwise render the stem immediately
            else {
                let stemDirection = getStemDirection(stemNote, head);
                symbols.splice(n++, 0, assign({}, head, {
                    type: 'stem',
                    stemDirection
                }));

                if (head.tie === 'begin') {
                    symbols.splice(n++, 0, assign({}, head, {
                        type: 'tie',
                        // Move tie into following grid column
                        beat:   head.beat,
                        updown: stemDirection === 'up' ? 'down' : 'up',
                        event:  head.event
                    }));
                }
            }
        }
        else {
            if (head.tie === 'begin' || head.tie === 'middle') {
                let stemDirection = getStemDirection(stemNote, head);
                symbols.splice(n++, 0, assign({}, head, {
                    type: 'tie',
                    // Move tie into following grid column
                    beat:   head.beat,
                    updown: stemDirection === 'up' ? 'down' : 'up',
                    event:  head.event
                }));
            }
        }
    }

    // Close the current beam
    if (beam && beam.length) {
        n += insertBeam(symbols, bar.stave, beam, stemNote, n);
        beam = undefined;
    }

    // If last event has not taken us to the end of the bar, insert rest
    if (beat < bar.duration) {
        symbols.push({
            beat,
            type:     'rest',
            pitch:    '',
            duration: bar.duration - beat,
            part:     part
        });
    }

    return symbols;
}

function toSymbols(bar) {
    const state = {
        clef: { name: 'treble', stemDirectionNote: 'B4' }
    };

    // Split symbols by part
    const parts = Object.values(
        bar.symbols.reduce((parts, symbol) => {
            if (!parts[symbol.part]) parts[symbol.part] = [];
            parts[symbol.part].push(symbol);
            return parts;
        }, {})
    );

    // Fill each parts with accidentals, rests, beams, tieheads
    parts.forEach((part) => insertSymbols(part, bar, state.clef.stemDirectionNote));

    // Empty out bar.symbols and push in symbols from parts
    bar.symbols.length = 0;
    parts.reduce((symbols, part) => {
        symbols.push.apply(symbols, part);
        return symbols;
    }, bar.symbols);

    return bar;
}

function createBar(beat, stave, meter, tieheads) {
    const bar = {
        beat:     beat,
        duration: meter[2],
        // TODO do something about breaks
        breaks:   meter[2] === 4 ? [2] :
            meter[2] === 3 ? [1,2]
            : [2],
        symbols:  [],
        stave:    stave
    };

    // If meter change is on this beat push a timesig into symbols
    if (meter[0] === beat) {
        bar.symbols.push({
            type:        'timesig',
            beat:        0,
            numerator:   meter[2] / meter[3],
            denominator: 4 / meter[3],
            event:       meter
        });
    }

    // Push tied heads into symbols
    let m = -1;
    let head, event;
    while ((head = tieheads[++m])
        && (event = head.event)
        && event[0] < bar.beat + meter[2]
    ) {
        const duration = event[0] + event[4] - bar.beat;

        if (duration > bar.duration) {
            // Event ends after this bar
            bar.symbols.push(assign({}, head, {
                beat: 0,
                duration: bar.duration,
                head: stave.getHead && stave.getHead(head.pitch, bar.duration),
                tie: 'middle'
            }, stave.getPart && stave.getPart(head.pitch)));
        }
        else {
            // Event ends in this bar
            bar.symbols.push(assign({}, head, {
                beat: 0,
                duration,
                head: stave.getHead && stave.getHead(head.pitch, duration),
                tie: 'end'
            }, stave.getPart && stave.getPart(head.pitch)));

            // Remove event from tieheads, as it has ended
            tieheads.splice(m, 1);
            --m;
        }
    }

    return bar;
}

const eventNameLogs = {};

function splitByBar(events, beatkeys, stave, keysig, meter, transpose) {
    // A buffer of head symbols to be tied to symbols in the next bar
    const tieheads = [];
    // An array of bar objects
    const bars = [];

    const events0 = eventsAtBeat(events, 0);
    meter = events0.find((event) => event[1] === 'meter') || meter ;

    // First bar
    let bar = createBar(0, stave, meter, tieheads);
    bars.push(bar);

    // TODO: Add key signature in front of timesig
    bar.symbols.unshift({
        type:   'keysig',
        beat:   0,
        keysig: keysig
    });

    // Add clef in front of keysig
    bar.symbols.unshift({
        type: 'clef',
        beat: 0,
        clef: stave.clef
    });

    let n = -1;
    let event;
    while (event = events[++n]) {
        if (event[1] === 'meter') {
            if (event[0] !== bar.beat) {
                new TypeError('Scribe: "meter" event must occur at bar start – event [' + event.join(', ') + '] is on beat ' + (event[0] - bar.beat) + ' of bar')
            }
            continue;
        }

        if (event[1] !== 'note' && event[1] !== 'chord' && event[1] !== 'lyric') {
            if (window.DEBUG && !eventNameLogs[event[1]]) {
                eventNameLogs[event[1]] = true;
                console.log('Scribe "' + event[1] + '" events ignored');
            }
            continue;
        }

        // Event is in a future bar
        while (event[0] >= bar.beat + bar.duration) {
            // Pick up meter for next bar
            if (event[0] === bar.beat + bar.duration) {
                let m = n - 1;
                while (events[++m] && events[m][0] === event[0]) {
                    if (events[m][1] === 'meter') {
                        meter = events[m];
                        // TODO: We may want to add an advisory timesig to the
                        // end of the current bar, to be displayed when this bar
                        // is at the end of a line
                    }
                }
            }

            // Create the next bar
            bar = createBar(bar.beat + bar.duration, stave, meter, tieheads);
            bars.push(bar);
        }

        const beat     = event[0] - bar.beat;
        const key      = keyFromBeatKeys(beatkeys, event[0]);

        // Truncate duration to bar end
        const duration = event[0] + getDuration(event) > bar.beat + bar.duration ?
            bar.beat + bar.duration - event[0] :
            getDuration(event) ;

        if (event[1] === 'note') {
            let pitch = toPitch(stave, key, transpose, event[2]);
            let head = assign({
                type: 'head',
                beat,
                pitch,
                duration,
                transpose,
                head: stave.getHead && stave.getHead(pitch, duration),
                event: event
            }, stave.getPart && stave.getPart(pitch));

            // Stick it in symbols
            bar.symbols.push(head);

            // If it's longer than the bar stick it in tieheads buffer
            if (event[4] > duration) {
                head.tie = 'begin';
                tieheads.push(head);
            }
        }
        else if (event[1] === 'chord') {
            bar.symbols.push({
                type:  'chord',
                beat,
                duration,
                transpose,
                value: toChord(stave, key, transpose, event[2]),
                event: event
            });
        }
        else {
            bar.symbols.push({
                type:  'lyric',
                beat,
                duration,
                value: event[2],
                event: event
            });
        }
    }

    // There are still hanging notes to render
    while (tieheads.length) {
        // Create the next bar
        bar = createBar(bar.beat + bar.duration, stave, meter, tieheads);
        bars.push(bar);
    }

    return bars;
}

export default function createSymbols(events, clef, keysig, meter, transpose) {
    // Transpose events before generating keys??
    events.sort(by(get(0)));

    // Get the stave controller
    const stave = clef ?
        staves[clef] :
        staves.treble ;

    // Create a map of keys at beats. Doing this here is n optimisation so we
    // don't end up running the keys matrix calculations on every note which
    // causes measurable delay.
    const beatkeys = keysAtBeats(events);

    return splitByBar(events, beatkeys, stave, keysig, meter, transpose).map(toSymbols);
}
