
import get      from '../../fn/modules/get.js';
import id       from '../../fn/modules/id.js';
import overload from '../../fn/modules/overload.js';
import create   from '../../dom/modules/create.js';
import events   from '../../dom/modules/events.js';
import rect     from '../../dom/modules/rect.js';
import { toNoteName, toNoteNumber } from '../../midi/modules/note.js';

import createSymbols     from '../modules/create-symbols.js';
import createBarElements from '../modules/create-bar-elements.js';
import { identify }      from '../modules/create-symbol-element.js';
import * as staves from '../modules/staves.js';

import isTransposeable from '../modules/event/is-transposeable.js';
import { selection, select, deselect, clear } from './modules/selection.js';

const stave   = staves.drums;
const body    = document.body;
const element = document.getElementById('scribe-bars');

// Zones cache
const zones = {};




let editDuration = 0.5;

function round24(n) {
    return Math.round(n * 24) / 24;
}

function createDOM(sequence) {
    //const symbols = createSymbols(sequence.events, 'treble', 'C', [0, "meter", 4, 1], 0);
    const symbols = createSymbols(sequence.events, 'drums', 'C', [0, "meter", 4, 1], 0);
    const bars    = createBarElements(symbols);

    bars.forEach((barElement) => {
        const length = Math.round(Number(barElement.dataset.duration) / editDuration);
        const zoneElements = Array.from({ length }, (v, i) => {
            const beat    = round24(i * editDuration);
            const absbeat = Number(barElement.dataset.beat) + beat;

            // Cache zones
            return zones[absbeat] || (zones[absbeat] = create('div', {
                class: 'zone',
                data: { beat: beat + 1, duration: editDuration, absbeat }
            }));
        });

        barElement.prepend.apply(barElement, zoneElements);
    });

    return bars;
}

function renderDOM(elements) {
    element.innerHTML = '';
    element.append.apply(element, elements);
}

// TEMP
export const sequence = {
    events: []
};

const elements = createDOM(sequence);
renderDOM(elements);




// Track cursor
let cursor       = 0;
let rate         = 1.5;

function barAtBeat(b) {
    // TODO
    return Math.floor(b / 4);
}

function updateCursor(beat, barElements) {
    // Advance cursor;
    cursor = beat;
    const barN = barAtBeat(beat);
    barElements[barN].classList.add('cursor-active');
}

export function changeZoneDuration(duration) {
    // Throw away cached zones
    let n;
    for (n in zones) delete zones[n];

    // Change zone duration and rerender
    editDuration = duration;
    render(sequence);
}




// Keys

import keyboard from '../../dom/modules/keyboard.js';

let timer;

function stopTimer() {
    clearTimeout(timer);
}

function updateNoteEvent(event) {
    event[4] += editDuration;

    // Render sequence
    const barElements = createDOM(sequence);
    renderDOM(barElements);
    updateCursor(cursor + editDuration, barElements);
    timer = setTimeout(updateNoteEvent, 1000 * editDuration / rate, event);
}

function addNoteEvent(pitch, dynamic) {
    const event = [cursor, 'note', pitch, dynamic, 0];
    updateNoteEvent(event);
    sequence.events.push(event);
}

function moveSelectionPitch(stave, n) {
    let i = -1;
    let event;

    // Check that all pitches may be transposed
    while (event = selection[++i]) {
        if (isTransposeable(event)) {
            const pitch = stave.movePitch(event[2], n);
            if (!pitch) return;
        }
    }

    // Transpose them
    i = -1;
    while (event = selection[++i]) {
        if (isTransposeable(event)) {
            event[2] = stave.movePitch(event[2], n);
        }
    }

    render(sequence);
}

function moveSelectionBeat(n) {
    let i = -1;
    let event;

    // If any events in selection would start before 0 as a result of this move
    // don't move any of them.
    while (event = selection[++i]) if (event[0] + n < 0) return;

    // Move 'em'
    i = -1;
    while (event = selection[++i]) event[0] += n;

    render(sequence);
}

function moveSelectionDuration(n) {
    let i = -1;
    let event;

    // If any events in selection would reach duration 0 as a result of this
    // move don't shorten any of them.
    while (event = selection[++i]) if (event[4] + n <= 0) return;

    // Move 'em'
    i = -1;
    while (event = selection[++i]) event[4] += n;

    render(sequence);
}


keyboard({
    // TODO: I'm doing this wrong. We want to map by key position,
    // not character name
    'backquote:down':   (e) => addNoteEvent('G3',  1),
    'backquote:up':     (e) => stopTimer(),
    'A:down':           (e) => addNoteEvent('Ab3', 1),
    'A:up':             (e) => stopTimer(),
    'Z:down':           (e) => addNoteEvent('A3',  1),
    'Z:up':             (e) => stopTimer(),
    'S:down':           (e) => addNoteEvent('Bb3', 1),
    'S:up':             (e) => stopTimer(),
    'X:down':           (e) => addNoteEvent('B3',  1),
    'X:up':             (e) => stopTimer(),
    'C:down':           (e) => addNoteEvent('C4',  1),
    'C:up':             (e) => stopTimer(),
    'F:down':           (e) => addNoteEvent('C#4', 1),
    'F:up':             (e) => stopTimer(),
    'V:down':           (e) => addNoteEvent('D4',  1),
    'V:up':             (e) => stopTimer(),
    'G:down':           (e) => addNoteEvent('Eb4', 1),
    'G:up':             (e) => stopTimer(),
    'B:down':           (e) => addNoteEvent('E4',  1),
    'B:up':             (e) => stopTimer(),
    'N:down':           (e) => addNoteEvent('F4',  1),
    'N:up':             (e) => stopTimer(),
    'J:down':           (e) => addNoteEvent('F#4', 1),
    'J:up':             (e) => stopTimer(),
    'M:down':           (e) => addNoteEvent('G4',  1),
    'M:up':             (e) => stopTimer(),
    'K:down':           (e) => addNoteEvent('G#4', 1),
    'K:up':             (e) => stopTimer(),
    'comma:down':       (e) => addNoteEvent('A4',  1),
    'comma:up':         (e) => stopTimer(),
    'L:down':           (e) => addNoteEvent('Bb4', 1),
    'L:up':             (e) => stopTimer(),
    'period:down':      (e) => addNoteEvent('B4',  1),
    'period:up':        (e) => stopTimer(),
    'slash:down':       (e) => addNoteEvent('C5',  1),
    'slash:up':         (e) => stopTimer(),
    'quote:down':       (e) => addNoteEvent('C#5', 1),
    'quote:up':         (e) => stopTimer(),
    'up:down':          (e) => moveSelectionPitch(stave, 1),
    'down:down':        (e) => moveSelectionPitch(stave, -1),
    'left:down':        (e) => moveSelectionBeat(-editDuration),
    'right:down':       (e) => moveSelectionBeat(editDuration),
    'shift-left:down':  (e) => moveSelectionDuration(-editDuration),
    'shift-right:down': (e) => moveSelectionDuration(editDuration)
}, body);















// Touch

function trunc2(n) {
    const decimals = ((n % 1) + '').slice(2,4)
    return Math.trunc(n) + (decimals ? '.' + decimals : '') ;
}

export function unhighlightZones() {
    // Unhighlight zones
    body
    .querySelectorAll('.zone.active')
    .forEach((zone) => zone.classList.remove('active'));
}

export function unhighlightSymbols() {
    // Unhighlight zones
    body
    .querySelectorAll('.selected')
    .forEach((element) => element.classList.remove('selected'));
}

export function highlightZones() {
    unhighlightZones();
    unhighlightSymbols();

    selection.forEach((event) => {
        // Select all zones up to end of event duration
        let absbeat = event[0];
        while (absbeat < event[0] + event[4]) {
            const zone = body.querySelector('.zone[data-absbeat^="' + trunc2(absbeat) + '"]');
            if (zone) zone.classList.add('active');
            absbeat += editDuration;
        }

        // Select elements identified by event
        body
        .querySelectorAll('[data-event-id="' + identify(event) + '"]')
        .forEach((element) => element.classList.add('selected'));
    });
}

function render(sequence) {
    const barElements = createDOM(sequence);
    renderDOM(barElements);
    highlightZones();
}

function addNoteEventByTouch(beat, pitch, dynamic, duration) {
    const event = [beat, 'note', pitch, dynamic, duration];
    sequence.events.push(event);
    render(sequence);
    return event;
}

function activateZonesFromEvent(zones, event) {
    const iStart = zones.findIndex((zone) => Number(zone.dataset.absbeat) === event[0]);
    const iStop  = zones.findIndex((zone) => Number(zone.dataset.absbeat) === event[0] + event[4]);

    zones.forEach((zone) => zone.classList.remove('active'));

    zones
    .slice(iStart, iStop)
    .forEach((zone) => zone.classList.add('active'));
}



events({ type: 'pointerdown', device: 'mouse pen touch' }, document)
.each((e) => {
    const zone     = e.target.closest('.zone');

    // If pointerdown is outside a zone deselect everything
    if (!zone) {
        clear();
        unhighlightSymbols();
        unhighlightZones();
        return;
    }

    const zoneRect = rect(zone);
    const ratio    = (e.clientY - zoneRect.top) / zoneRect.height;
    const beat     = Number(zone.dataset.absbeat);
    const pitch    = stave.yRatioToPitch(ratio);
    const duration = Number(zone.dataset.duration);
    const event    = addNoteEventByTouch(beat, pitch, 0.2, duration);
    const zones    = Array.from(body.querySelectorAll('.zone'));

    // Clear selection
    clear();
    activateZonesFromEvent(zones, event);

    const pointermoves = events('pointermove', body)
    .each((e) => {
        //console.log('MOVE');
        const ratio = (e.clientY - zoneRect.top) / zoneRect.height;
        const pitch = stave.yRatioToPitch(ratio);

        // If there is no pitch to move to do nothing
        if (!pitch) { return; }

        // Is there no change in pitch? Don't rerender.
        if (event[2] === pitch) { return; }

        // Update pitch
        event[2] = pitch;
        render(sequence);

        // Highlight zones
        const zones = Array.from(body.querySelectorAll('.zone'));
        activateZonesFromEvent(zones, event);
    });

    const pointerovers = events({ type: 'pointerover', select: '.zone' }, body)
    .each((e) => {
        const zone = e.target;
        const beat = Number(zone.dataset.absbeat);

        // Are we trying to edit backwards? That doesn't make sense.
        if (beat < event[0]) { return; }

        // Update duration
        const duration = Number(zone.dataset.duration);
        event[4] = beat + duration - event[0];
        render(sequence);

        // Highlight zones
        const zones = Array.from(body.querySelectorAll('.zone'));
        activateZonesFromEvent(zones, event);
    });

    const pointerups = events('pointercancel pointerup', body).each(() => {
        pointermoves.stop();
        pointerovers.stop();
        pointerups.stop();

        // Unhighlight zones
        unhighlightZones();

        // Add event to selection
        select(event);
        highlightZones();
    });
});
