
import Signal            from '../../fn/modules/signal.js';
import create            from '../../dom/modules/create.js';
import element, { getInternals } from '../../dom/modules/element.js';
import { toRootName, toRootNumber } from '../../midi/modules/note.js';
import createSymbols     from '../modules/create-symbols.js';
import requestData       from '../modules/request-data.js';
import parseSource       from '../modules/parse.js';
import * as staves       from '../modules/staves.js';
import createElement     from './modules/create-element.js';


const assign     = Object.assign;
const define     = Object.defineProperties;

/* ScribeScript.stylesheet */

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


/* Register <scribe-script> */

export default define(element('scribe-script', {
    shadow: `
        <link rel="stylesheet" href="./shadow.css" />
        <svg width="0" height="0">
            <defs>
                <!-- Rests -->
                <path id="rest[0.125]" class="rest-path" transform="scale(0.111111) translate(-495 -154)" d="M507.3916,171.1987c0,0.5762,0.2881,1.2241,0.9365,1.8003c0.5762,0.6479,0.9365,1.1519,0.9365,1.4399c0,0.8643-0.6484,2.0884-1.873,3.8164c-1.2236,1.728-2.2314,2.5205-3.0234,2.5205s-1.2246-0.2881-1.4404-0.9365c-0.0723-0.2158-0.0723-0.8638-0.0723-1.9438c0-0.936,0.792-4.3926,2.4482-10.3691c-1.3682,0.2881-2.4482,0.3604-3.3838,0.3604c-3.8887,0-5.833-2.1602-5.833-6.5527c0-2.9521,0.792-5.9043,2.376-8.7847l1.3682-2.3042c-0.2881-1.0083-0.4316-2.0161-0.4316-3.0962c0-2.8804,0.8643-5.8325,2.4482-8.7852c-1.0078-1.1519-1.584-2.8081-1.584-4.9683c0-1.8003,0.5762-4.1045,1.584-6.8403c1.2959-3.2407,2.6641-4.8965,4.1768-4.8965c0.6475,0,0.9355,0.3599,0.9355,1.0801c0,0.6479-0.1436,1.584-0.5039,2.7363c-0.2881,1.1519-0.4316,2.0161-0.4316,2.5918c0,1.6562,0.8633,2.4482,2.6641,2.4482c1.7998,0,3.8164-0.7197,5.9043-2.2319c1.0078-0.7202,2.7363-2.0884,5.04-4.1763c0.2168-0.144,0.5762-0.2881,1.1523-0.2881c1.1523,0,1.7285,0.7197,1.7285,2.0879c0,0.5762-0.0723,1.0801-0.2158,1.3682c-6.4814,15.4097-11.0898,28.3706-13.8262,38.8833C507.752,169.1108,507.3916,170.7666,507.3916,171.1987z M509.4082,153.269c-1.8721,0.4321-3.3125,0.6484-4.3926,0.6484c-1.0078,0-1.8721-0.2163-2.5918-0.6484c-0.1445,0.3604-0.2881,0.6484-0.4326,0.8643c-0.1436,0.6479-0.2158,1.2964-0.2158,1.8721c0,1.5845,0.8643,2.3765,2.6641,2.3765c0.9365,0,2.1602-0.2881,3.8164-0.936C508.4004,156.7974,508.832,155.4297,509.4082,153.269z M513.5127,138.8682c-4.1768,0.8638-6.4805,1.2959-6.9844,1.2959c-0.4326,0-0.8643,0-1.2246-0.0718c-0.1436,0.7197-0.2158,1.2241-0.2158,1.6558c0,1.6562,0.8643,2.4482,2.6641,2.4482c1.1523,0,2.5928-0.4316,4.4648-1.4399C512.2168,142.7563,512.6484,141.4604,513.5127,138.8682z"/>
                <path id="rest[0.25]"  class="rest-path" transform="scale(0.111111) translate(-467 -154)" d="M478.5918,168.4624c0,0.6484,0.2168,1.2964,0.7207,1.8726c0.5039,0.5757,0.792,1.0801,0.792,1.3677c0,0.7925-0.7197,2.0884-2.1602,3.8164c-1.4404,1.7285-2.5205,2.5923-3.2402,2.5923c-0.8643,0-1.2959-0.4321-1.2959-1.4399c0-2.4482,1.0078-6.4805,3.0957-12.1689c-1.8721,0.4316-3.3838,0.6479-4.4639,0.6479c-3.3848,0-5.041-2.0161-5.041-6.1929c0-2.8081,1.0078-5.9043,3.1689-9.3604c-0.7207-1.0083-1.1523-2.4482-1.1523-4.3208c0-1.7998,0.7197-4.248,2.0879-7.2725c1.584-3.3843,3.168-5.1123,4.7529-5.1123c0.5752,0,0.8633,0.2881,0.8633,0.8638c0,0.7202-0.2158,1.6562-0.7197,2.9526c-0.5039,1.2959-0.7197,2.3042-0.7197,2.9521c0,1.4399,0.792,2.0879,2.4482,2.0879c1.8721,0,3.96-0.7197,6.2646-2.3042c0.8633-0.5757,2.5918-1.9438,5.2559-4.1763c0.2158-0.144,0.5762-0.2881,1.1523-0.2881c1.0801,0,1.584,0.5762,1.584,1.7285c0,0.7197-0.1436,1.2959-0.3604,1.728c-3.3115,6.3364-5.5439,10.729-6.624,13.105c-2.376,4.9688-4.1768,9.5049-5.4727,13.6812C478.8799,167.2383,478.5918,168.3184,478.5918,168.4624z M481.832,150.1011c-4.3203,0.8638-6.6963,1.2959-7.0557,1.2959c-0.4326,0-0.8643,0-1.2246-0.0718c-0.2881,0.8638-0.4316,1.584-0.4316,2.0879c0,1.3682,0.8633,2.0166,2.5195,2.0166c1.0801,0,2.5928-0.4321,4.5371-1.4404C480.6084,152.7651,481.1846,151.4692,481.832,150.1011z"/>
                <g id="rest[0.375]">
                    <use xlink:href="#rest[0.25]"></use>
                    <use xlink:href="#dot" transform="translate(0 1)"></use>
                </g>
                <path id="rest[0.5]"   class="rest-path" transform="scale(0.111111) translate(-444 -154)" d="M454.4014,160.0381c0,0.6479,0.2158,1.2959,0.7197,1.8721c0.5039,0.5757,0.792,1.0801,0.792,1.3682c0,0.792-0.7197,2.0879-2.1602,3.8159c-1.4404,1.7285-2.5205,2.5923-3.2402,2.5923c-0.792,0-1.2959-0.2881-1.5117-0.8638c-0.0723-0.2881-0.1445-0.936-0.1445-1.9443c0-1.0078,2.2324-6.1924,6.6963-15.6973c-4.248,0.8643-6.6963,1.2241-7.2725,1.2241c-3.6719,0-5.4727-2.0161-5.4727-6.1206c0-1.8003,0.6484-4.2485,2.0166-7.2725c1.584-3.3125,3.168-5.0405,4.752-5.0405c0.5762,0,0.8643,0.2881,0.8643,0.8638c0,0.7202-0.2158,1.6562-0.7197,2.9526c-0.5039,1.2959-0.7197,2.2319-0.7197,2.9521c0,1.3682,0.792,2.0161,2.4473,2.0161c1.7285,0,3.8164-0.7202,6.4092-2.2324c2.1602-1.2959,4.0322-2.6641,5.4727-4.1763c0.4316-0.144,0.792-0.2158,1.2236-0.2158c1.0801,0,1.584,0.5762,1.584,1.6562c0,0.5757-0.1436,1.1519-0.4316,1.728c-0.8643,1.9443-2.6641,4.9683-5.3281,9.1445c-2.5205,3.8164-4.3213,7.0566-5.3291,9.6489C454.6895,159.3179,454.4727,159.894,454.4014,160.0381z"/>
                <g id="rest[0.75]">
                    <use xlink:href="#rest[0.5]"></use>
                    <use xlink:href="#dot" transform="translate(0 1)"></use>
                </g>
                <path id="rest[1]" class="rest-path" transform="scale(0.111111) translate(-418 -154)" d="M431.4346,152.5493c2.4482,0.4321,3.8877,0.6479,4.3926,0.7197c1.8721,0.3604,3.2402,0.7925,4.1035,1.2241c-0.1436,0.2881-2.3037,2.8804-6.2637,7.7769c-3.5283,4.3203-5.2568,6.6245-5.2568,6.9126c0,0.7202,0.5762,1.8003,1.7285,3.3843c1.1514,1.584,1.7998,2.8081,1.7998,3.8164c0,1.2241-0.7197,2.4482-2.0879,3.6724c-1.3682,1.2959-2.665,1.8721-3.8164,1.8721c-1.8721,0-2.8086-1.5122-2.8086-4.6084c0-2.3042,2.5205-7.4888,7.7051-15.4814c-1.2246-0.4321-2.7363-0.792-4.6084-1.0078c-1.5127-0.0723-3.0967-0.2163-4.6807-0.3604v-0.2881c-0.1445-1.728,2.376-5.3281,7.5605-10.8008c-0.792-0.3599-1.9443-0.936-3.4561-1.8003c-4.7529-2.8081-7.0566-6.6963-7.0566-11.665c0-2.52,0.5039-4.6802,1.6562-6.4805c0.9355-1.5122,2.5195-3.168,4.8242-4.8965c-0.4326,2.3042-0.6484,4.0327-0.6484,5.1846c0,2.7363,1.1523,5.1123,3.6006,7.1289c2.2324,1.8721,5.4727,2.8081,9.7207,2.8799c2.0166,0.0723,3.0967,0.4321,3.0967,1.0083c0,0.5039-1.4404,2.376-4.249,5.6885C434.8906,148.5171,433.1621,150.5332,431.4346,152.5493z"/>
                <g id="rest[1.5]">
                    <use xlink:href="#rest[1]"></use>
                    <use xlink:href="#dot" transform="translate(0 1)"></use>
                </g>
                <path id="rest[2]" class="rest-path" transform="translate(-43.6 -17) scale(0.1111)" d="M418.5479,143.0444v1.4399c0.0723,2.1602-0.4316,5.1128-1.4404,8.7129h-26.9297c0.2158-3.8882,0.792-7.2007,1.6562-9.937c2.9521,0,7.416,0,13.3926-0.0718C411.2031,143.1162,415.668,143.0444,418.5479,143.0444z"/>
                <g id="rest[3]">
                    <use xlink:href="#rest[2]"></use>
                    <use xlink:href="#dot" transform="translate(0 0)"></use>
                </g>
                <g id="rest[4]">
                    <use xlink:href="#rest[2]" transform="translate(0 -1)"></use>
                </g>
                <path id="dot" class="scribe-symbol" transform="translate(-70     -36.28) scale(0.1111)" d="M661.3232,322.9727c0,1.0078-0.4316,2.4482-1.2959,4.248c-0.9365,2.0166-1.7998,3.1689-2.5918,3.3125c-0.3604,0.1445-1.7285,0.1445-4.249,0.1445h-1.2236c-1.1523,0-1.7285-0.5039-1.7285-1.5117c0-0.7207,0.4316-2.0176,1.3682-3.9609c1.0078-1.8721,1.7285-3.0957,2.3047-3.5283c0.2871-0.1436,1.584-0.2881,3.8877-0.2881c1.2959,0,2.0166,0.0723,2.2324,0.0723C660.8916,321.6768,661.3232,322.1807,661.3232,322.9727z"/>
                <path id="acci-flat"    class="acci-path" transform="scale(0.054) translate(-606.4 -191)" d="M629.4297,136.6357c1.4404,0,2.5928,0.8643,3.3848,2.5923c0.5039,1.2959,0.792,2.8081,0.792,4.5366c0,5.04-1.9443,10.6567-5.7607,16.8491c-2.9521,4.8247-6.624,9.5771-11.1611,14.1855l0.5762-60.1255c1.0078-1.1519,2.0879-1.8003,3.2402-1.8003c0.2881,0,0.4326,0.0723,0.5762,0.0723l-0.2881,29.2344C622.877,138.5078,625.7578,136.6357,629.4297,136.6357z M625.9014,145.6367c-1.0801,0-2.376,1.0801-3.7441,3.168c-1.2959,1.9443-1.9443,3.3843-2.0156,4.3208l-0.1445,8.2085c4.9688-4.6802,7.4883-9.2168,7.4883-13.6094C627.4854,146.3564,626.9102,145.6367,625.9014,145.6367z"/>
                <path id="acci-natural" class="acci-path" transform="scale(0.054) translate(-644 -191)"   d="M669.0293,136.9961l-2.9521,56.6685c-1.0088,0.7202-1.585,1.0801-1.873,1.0801c-0.792,0-1.1514,0-1.0801-0.0718l1.6562-30.8906c-0.5039,1.1519-1.7998,2.2319-3.7441,3.312s-3.5283,1.5845-4.8242,1.5845c-0.7197,0-1.4404-0.144-1.9443-0.4321l2.8799-54.5806c0.7207-0.4321,1.2969-0.6484,1.7285-0.6484c0.9365,0,1.2959,0,1.1523,0l-1.0078,28.4429c0.4316-0.8643,1.9434-1.8726,4.5361-2.9526C666.0049,137.5,667.8047,136.9961,669.0293,136.9961z M664.9961,148.4448c-2.6641,0.7202-4.8242,2.0161-6.4805,3.8882l-0.2158,5.4727c2.7363-0.4321,4.8242-1.4399,6.3369-3.1685C664.7803,153.4854,664.9248,151.4692,664.9961,148.4448z"/>
                <path id="acci-sharp"   class="acci-path" transform="scale(0.054) translate(-624.5 -191)" d="M655.709,134.8354c0.1445,0.4321,0.2168,1.1523,0.2168,2.3042c0,1.2964-0.1445,2.5923-0.2881,4.0327c0,0.5757-0.1445,1.4399-0.4326,2.52c-0.5039,1.0083-2.3037,2.3042-5.3281,3.7446l-0.2881,6.6963c1.6562-1.2241,3.0967-1.8721,4.1768-1.8721c0.2871,0,0.5752,1.584,0.7197,4.7524c0.0723,1.0078,0.0723,1.728,0.0723,2.3042c0,1.728-0.0723,2.7363-0.3604,3.168c-0.0723,0.2163-1.8721,1.4404-5.3281,3.6724c0,3.3125-0.1445,6.6968-0.3604,10.2969c-0.0723,1.4404-0.1445,2.8804-0.2158,4.2485c-0.2881,2.3042-0.7207,3.4565-1.3682,3.4565c-0.0723,0.0718-0.1445,0.0718-0.1445,0.0718c-0.792,0-1.1514-1.9443-1.1514-5.8325c0-0.936,0-2.376,0.1436-4.3203c0.0723-1.9443,0.1436-3.3843,0.1436-4.3926c0-1.0078-0.0713-1.6558-0.2158-2.0161c-1.0078,0.144-1.7275,0.5039-2.2314,1.0083c-0.0723,1.9438-0.2168,4.8242-0.4326,8.5688c-0.0723,2.0161-0.1436,3.96-0.2158,5.8325c-0.1445,3.3843-0.4326,5.2563-0.6484,5.6162c-0.2158,0.2163-0.4316,0.2881-0.7197,0.2881c-1.0078,0-1.5117-1.5122-1.5117-4.6802c0-2.3047,0.3594-7.1289,0.9355-14.6177c-1.4404,0.5044-2.8799,1.0083-4.3926,1.4404c-0.7197,0-1.0078-1.9443-1.0078-5.9048c0-0.2881,0-0.792,0.0723-1.5122c0-0.7197,0.0713-1.2241,0.0713-1.5117c0.1445-0.4321,1.0088-1.0083,2.4482-1.8003c1.0088-0.4321,1.9443-0.936,2.9531-1.5122c0.2871-1.4399,0.3594-3.3843,0.2871-5.6885l-0.0713-0.8643c-1.2959,0.7202-2.8809,1.3682-4.7529,2.0161c-0.3594-0.1436-0.5039-0.792-0.5039-1.9438c0-0.8643,0.0723-2.3765,0.3604-4.4644c0.2158-2.0884,0.4316-3.4565,0.7197-4.1045c1.0078-0.8643,2.6641-1.9443,5.1123-3.3125c0-1.7998,0.1445-4.5361,0.3604-8.2803c0.2881-4.9688,0.792-7.4888,1.5117-7.4888c0.8643,0,1.2969,2.3042,1.2969,6.7686c0,1.728-0.1445,4.1763-0.4326,7.4165c0.792,0,1.7285-0.3599,2.8086-1.1519c0.2881-0.4321,0.5762-4.8965,0.8643-13.4653c0.2881-7.8486,1.1514-11.8091,2.5918-11.8091c0.5762,1.1523,0.8643,2.5205,0.8643,4.1045c0,4.4644-0.4326,11.0889-1.1523,20.0176C653.0449,135.4839,654.7012,134.8354,655.709,134.8354z M647.501,148.7329c-1.0801,0.5039-2.3047,1.2241-3.8887,2.2319c-0.1436,2.3042-0.2158,4.1045-0.2158,5.4009c0,0.5757,0,1.0078,0,1.2959c1.0801-0.4321,2.3037-1.0801,3.7441-2.0884C647.1406,154.0615,647.2842,151.7573,647.501,148.7329z"/>

                <!-- Stems -->
                <line id="stemup"   class="stem-path" x1="2.4" y1="0" x2="2.4" y2="6"></line>
                <line id="stemdown" class="stem-path" x1="0.1" y1="0.3" x2="0.1" y2="7"></line>

                <!-- Ties -->
                <path id="tie" class="tie-path" transform="translate(0, 0.14) scale(1 0.6)" d="M0.979174733,0.0124875307 C0.650597814,1.1195554 0.135029714,1.00095361 0.0165376402,0.026468657 C0.0113570514,0.0135475362 0.00253387291,0.00218807553 0,0 C0.0977526897,1.29523004 0.656681642,1.37089992 1,2.43111793e-08 C0.991901367,2.43111797e-08 0.987703936,0.01248753 0.979174733,0.0124875307 Z M0.979174733,0.0124875307"></path>

                <!-- Tails -->
                <path id="tailup[0.5]"    class="tail-path" transform="translate(-33.14  -42) scale(0.1111)" d="M335.6724,356.0957c-0.5039,0-0.936-0.1445-1.2959-0.5762c-0.4321-0.3594-0.5762-0.792-0.5762-1.2246c0-0.2148,0.0723-0.5039,0.2163-0.791c1.0078-2.3047,1.584-4.8965,1.584-7.7773c0-9.6484-5.8325-18.1455-17.3535-25.418v-16.3457c1.728,1.4404,4.2485,3.6006,7.5605,6.5527c8.6406,8.8574,12.9614,20.5215,12.9614,34.9238c0,1.7275-0.2163,3.6719-0.6484,5.9756C337.4727,354.584,336.6807,356.0957,335.6724,356.0957z"/>
                <path id="taildown[0.5]"  class="tail-path" transform="translate(-42.3  -30.5) scale(0.1111)" d="M404.5039,283.8735c1.1514,4.248,1.7275,8.6406,1.7275,13.105c0,8.9287-3.3125,19.3691-9.793,31.251c-4.6797,8.4971-10.2246,14.041-16.6328,16.7773v-11.2334c0-1.4395,1.6562-3.7441,4.9678-6.9844c3.3848-3.0244,6.6973-6.1211,10.0088-9.2168c3.8164-3.8887,6.1934-7.1289,7.0566-9.7207c1.2969-4.1758,2.0166-7.8486,2.0166-10.873l-0.2881-4.3921c-0.0723-0.7202-0.3604-1.9443-0.792-3.6724c-0.3604-1.5845-0.5762-2.7363-0.5762-3.6006C402.1992,284.3057,402.9912,283.8013,404.5039,283.8735z"/>
                <path id="tailup[0.25]"   class="tail-path" transform="translate(-37.7  -42) scale(0.1111)" d="M371.5986,371.793c-0.5049,0-0.8643-0.7207-1.2246-2.2324c2.7363-3.2402,4.1045-6.2637,4.1045-9.1445c0-2.5195-0.792-5.3281-2.376-8.4961c-1.4404-2.5928-3.0967-5.041-5.1846-7.2012c-0.792-0.8643-2.0879-1.9443-3.8887-3.3848c-1.7275-1.4395-3.0244-2.5195-3.6719-3.2402v-31.8984c6.2646,2.5918,11.1611,7.416,14.7607,14.3291c3.2402,6.2646,4.8965,13.0332,4.8965,20.3779c0,1.8721-0.792,4.6084-2.2324,8.3525c0.5049,1.7285,0.793,3.5283,0.793,5.4014c0,7.1279-1.873,12.7441-5.4727,16.8486C371.958,371.7207,371.7422,371.793,371.5986,371.793z M376.4229,342.0547c0-3.3125-3.1689-8.6406-9.5049-15.9141c-1.2246-1.2236-3.0967-3.0957-5.5449-5.6162v4.3926c5.7607,4.4639,10.585,10.9443,14.6172,19.4424C376.2783,343.3506,376.4229,342.6309,376.4229,342.0547z"/>
                <path id="taildown[0.25]" class="tail-path" transform="translate(-51.24  -30.5) scale(0.1111)"  d="M460.2285,319.8047c0-1.0078,1.6562-2.6641,4.9678-5.041c3.3125-2.3037,6.625-4.6797,10.0088-6.9844c3.8164-2.8799,6.1934-5.2559,7.0566-7.2725c1.2969-3.0962,2.0166-5.7603,2.0166-7.9927c0-0.2881-0.1436-1.2959-0.3604-3.1685c0-0.2876-0.2158-0.792-0.5039-1.584s-0.4316-1.2241-0.4316-1.3682c0-0.2881,0.2158-0.5039,0.7197-0.7202c0.4326-0.2158,0.8643-0.3599,1.1523-0.3599s0.5039,0.0723,0.6484,0.0723c0.7197,2.4482,1.1514,4.896,1.1514,7.2007c0,2.5918-0.5039,5.2563-1.3682,7.9204c0.8643,2.5928,1.3682,5.3291,1.3682,8.208c0,3.8887-0.8643,7.5615-2.4482,10.9453c-1.584,3.457-2.7363,5.833-3.3838,7.1289c-1.3682,2.7363-2.7363,4.9688-4.0322,6.7686c-2.3047,3.3125-4.7529,5.9053-7.2012,7.7764c-2.4482,1.873-5.5439,3.6729-9.3604,5.2568V319.8047z M461.8125,334.0625c0.4316-0.4326,2.0156-1.585,4.6084-3.457c4.248-2.7363,7.1289-4.8242,8.7842-6.1211c3.8887-3.0234,6.1934-5.4717,7.0566-7.416c1.2969-3.168,2.0166-5.832,2.0166-7.9209c0-1.9443-0.2158-3.5283-0.5762-4.8242c-3.7441,7.417-6.5527,12.3857-8.4248,14.833c-3.3125,4.3203-7.7764,7.7051-13.4648,10.2969V334.0625z"/>
                <use  id="tailup[0.375]"   href="#tailup[0.25]"></use>
                <use  id="taildown[0.375]" href="#taildown[0.25]"></use>
                <use  id="tailup[0.75]"    href="#tailup[0.5]"></use>
                <use  id="taildown[0.75]"  href="#taildown[0.5]"></use>

                <!-- Note heads -->
                <use  id="head[0.125]" href="#head[1]"></use>
                <use  id="head[0.25]"  href="#head[1]"></use>
                <use  id="head[0.375]" href="#head[1.5]"></use>
                <use  id="head[0.5]"   href="#head[1]"></use>
                <use  id="head[0.75]"  href="#head[1.5]"></use>
                <path id="head[1]" class="head-path" transform="translate(-18.9 -36.28) scale(0.1111)" d="M177.2754,335.8613c-2.0884,0-3.8164-0.3594-5.2568-1.1514c-1.728-1.0088-2.5918-2.4482-2.5918-4.3926c0-3.0244,1.7998-6.1201,5.5444-9.4326c3.6001-3.168,6.9126-4.752,9.9365-4.752c5.7607,0,8.6411,2.2314,8.6411,6.6953c0,3.0254-1.9443,6.0488-5.9766,8.9297C183.8999,334.4941,180.4434,335.8613,177.2754,335.8613z"/>
                <g id="head[1.5]">
                    <use xlink:href="#head[1]"></use>
                    <use xlink:href="#dot" transform="translate(0.8 0.5)"></use>
                </g>
                <path id="head[2]" class="head-path" transform="translate(-16.3 -36.28) scale(0.1111)" d="M169.5732,322.1094c0,1.6553-0.3599,3.168-1.1523,4.4639c-1.5117,2.6641-4.4644,5.1846-8.8564,7.6318c-4.4644,2.4492-8.2808,3.6729-11.521,3.6729c-1.8721,0-3.4565-0.6475-4.6807-2.0166c-1.1519-1.3672-1.728-2.9512-1.728-4.8242c0-4.0312,2.2324-7.9199,6.8408-11.5928c4.4644-3.5283,8.9287-5.3281,13.3931-5.3281C166.981,314.1162,169.5732,316.7803,169.5732,322.1094z M160.5005,325.4209c0-1.1514-0.2163-2.376-0.7202-3.8164c-0.7202-1.7275-1.584-2.5918-2.5923-2.5918c-2.3042,0-4.0322,1.1514-5.3281,3.3115c-1.0083,1.7285-1.4404,3.8164-1.4404,6.1211c0,3.0957,0.8643,4.6084,2.5923,4.6084c2.0161,0,3.7441-0.792,5.2563-2.376S160.5005,327.3652,160.5005,325.4209z"/>
                <g id="head[3]">
                    <use xlink:href="#head[2]"></use>
                    <use xlink:href="#dot" transform="translate(1 0.5)"></use>
                </g>
                <path id="head[4]" class="head-path" transform="translate(-12.6 -36.28) scale(0.1111)" d="M118.0923,336.0781c-6.0488,0-9.001-2.1602-9.001-6.4805c0-3.8887,2.6641-7.2734,8.1367-10.1533c4.7524-2.5205,9.5049-3.8154,14.3291-3.8154c2.7363,0,5.0405,0.5752,6.9126,1.6553c2.1602,1.2236,3.2402,2.9521,3.2402,5.1846c0,2.9521-1.0801,5.3281-3.168,7.2012c-2.1602,1.8711-5.2568,3.4551-9.5049,4.6797C125.2207,335.502,121.5483,336.0781,118.0923,336.0781z M131.269,326.2129c0-4.4648-1.7998-6.7686-5.4004-6.7686c-2.0161,0-3.6724,0.9365-5.0405,2.8086s-2.0161,3.6729-2.0161,5.4717c0,3.0967,1.8721,4.6094,5.6167,4.6094c2.0161,0,3.6001-0.5762,4.8965-1.7285C130.6211,329.4531,131.269,327.9414,131.269,326.2129z"/>
                <g id="head[6]">
                    <use xlink:href="#head[4]"></use>
                    <use xlink:href="#dot" transform="translate(0 0)"></use>
                </g>
                <path id="head[x]" class="head-path" transform="translate(-5.84 -34.2) scale(0.105)" d="M72.8774,337.5898c-1.5122,0-3.1685-0.6484-5.0405-1.9434c-1.3682-1.0088-2.8081-2.0889-4.1763-3.0967c-0.5039,0.2158-1.4399,1.3682-2.8081,3.3838c-1.2964,2.0166-2.3042,3.0244-2.9521,3.0244c-0.7925,0-1.1523-0.5039-1.1523-1.584c0-1.1514,1.584-4.1045,4.7524-8.7842c-0.5762-0.9365-1.2241-1.873-1.8721-2.8086c-1.1523-1.9443-1.728-3.8887-1.728-5.9043c0-3.0967,1.2959-5.5449,4.0322-7.3457c0.144-0.0713,0.2158-0.1436,0.2881-0.1436c0.2158,0,0.5757,0.792,1.0078,2.2324c0.936,3.0244,2.3042,5.4004,3.9604,7.2725c1.5122-1.8721,2.9521-3.8164,4.4644-5.7598c2.4482-3.0967,4.1045-4.6816,4.9683-4.6816c0.2881,0,0.4321,0.1445,0.4321,0.4326c0,0.9365-1.1519,3.2402-3.5283,6.8408c-2.3042,3.5996-3.4561,5.4727-3.4561,5.6162c0,0.8643,0.8638,1.7998,2.7363,2.8799c1.8721,1.0801,3.3843,1.584,4.5361,1.584c0.2881,0,0.3599,0.3613,0.3599,0.9365c0,1.1523-0.4316,2.665-1.4399,4.5361C75.1816,336.5098,74.0293,337.5898,72.8774,337.5898z"/>
                <path id="head[v]" class="head-path" transform="translate(-9.3 -35.86) scale(0.11)" d="M109.0942,319.373v4.1758c-0.5757,1.0078-2.2319,3.0957-4.9683,6.2646c-3.2402,3.8164-6.9844,8.208-11.3047,13.1045c-7.3447-5.4004-12.3853-8.5684-15.0493-9.4316v-4.6816c2.7358-3.3115,5.4722-6.624,8.2803-9.9355c3.3843-4.249,5.8325-7.7773,7.2007-10.5137c3.9604,3.3848,6.4087,5.4727,7.417,6.2646C104.0542,317.1406,106.79,318.7246,109.0942,319.373z M103.8379,323.6934c-2.8804-1.4404-6.0483-3.8164-9.5767-7.1289c-1.2241,2.0879-4.8247,6.3359-10.729,12.8164c1.0801,0.8652,4.2485,3.0967,9.6489,6.8418C95.4131,333.3418,99.0137,329.166,103.8379,323.6934z"/>

                <!-- Ledger lines -->
                <g id="ledges">
                    <line x1="0" x2="4.4" y1="8" y2="8"></line>
                    <line x1="0" x2="4.4" y1="6" y2="6"></line>
                    <line x1="0" x2="4.4" y1="4" y2="4"></line>
                    <line x1="0" x2="4.4" y1="2" y2="2"></line>
                    <line x1="0" x2="4.4" y1="0" y2="0"></line>
                    <line x1="0" x2="4.4" y1="2" y2="2"></line>
                    <line x1="0" x2="4.4" y1="4" y2="4"></line>
                    <line x1="0" x2="4.4" y1="6" y2="6"></line>
                    <line x1="0" x2="4.4" y1="8" y2="8"></line>
                </g>

                <!-- Clefs -->
                <symbol id="treble-clef" viewBox="0 -4 10 8" style="overflow: visible;">
                    <path transform="translate(-9.8 -16) scale(0.1111)" d="M108.2324,146.5005c0,2.0884-0.3599,5.1846-1.0801,9.2168c-0.7202,4.2485-1.4399,7.2007-2.1602,8.9292c-2.0161,4.752-4.8965,8.8564-8.7129,12.1689c-0.936,0.8638-2.5923,2.0161-4.8242,3.5283c-0.144,0.144-0.2881,0.2158-0.3599,0.2881c0,0,0.2158,1.0801,0.6479,3.3843c0.5762,3.312,0.8638,5.8325,0.8638,7.7046c0,3.8164-0.5039,7.9204-1.5117,12.313c-1.3682,6.1924-3.2407,9.2168-5.5444,9.2168c-0.7925,0-1.4404-1.2241-1.8726-3.7441c-0.3599-1.7285-0.5039-3.4565-0.5039-5.1846c3.4565-5.9048,5.2563-11.4492,5.2563-16.6333c0-0.7202-0.144-1.7285-0.2881-2.8804c-0.2881-1.5845-0.5757-2.4482-0.936-2.4482c-0.2881,0-0.7197,0.0718-1.2959,0.2158c-0.5039,0.144-0.936,0.2881-1.0801,0.2881c-1.6562,0.2881-3.4565,0.3599-5.3286,0.3599c-7.4888,0-13.1772-2.4478-17.0654-7.4165c-3.5283-4.4644-5.2563-10.5127-5.2563-18.2173c0-5.4009,1.584-12.9614,4.7524-22.7544c1.2241-3.7441,2.8081-7.9204,4.6084-12.5288c1.8721-4.3926,3.6724-8.8569,5.5444-13.3213c3.2402-7.7764,4.8242-11.9531,4.7524-12.3848l-4.4644-36.2915c0.4321-1.7998,1.3682-2.7363,2.5923-2.7363c0.5757,0,1.6558,0.5762,3.2402,1.6562c6.3364,4.5366,9.5049,12.0972,9.5049,22.7539c0,5.1846-1.6562,11.7373-4.9688,19.73c-0.792,2.0161-1.2241,3.0244-1.2241,3.0244c0,1.6558,0.4321,7.3442,1.2241,16.9932c0.8643,9.8647,1.3682,15.1216,1.6562,15.6973c1.6562-1.7998,3.6001-3.312,5.9043-4.5361c2.5923-1.2964,4.9688-2.0161,7.2007-2.0161C104.6323,130.8755,108.2324,136.1318,108.2324,146.5005z M81.0859,139.876l-2.4482-27.4341c-3.6001,7.9927-6.8403,15.6973-9.7207,23.186c-4.5361,11.665-6.7686,19.2256-6.7686,22.5376c0,4.4644,1.728,7.4888,5.1846,9.001c0.0718,0.0718,0.8643,0.3599,2.376,0.8643c0-7.2007,2.4482-14.6895,7.417-22.4663C78.062,144.3403,79.3579,142.4683,81.0859,139.876z M85.0464,167.6704c-0.5039-3.6001-1.0801-9.1445-1.8721-16.4893c-1.2959,1.4399-3.0962,3.7441-5.4727,6.9126c-2.4482,4.1763-3.6001,7.7046-3.6001,10.5127c0.7202,0.2881,1.6562,0.3604,2.7363,0.3604C78.4219,168.9668,81.1582,168.5347,85.0464,167.6704z M82.8145,80.543c0-0.936-0.5044-2.1602-1.5122-3.6001c-1.0083-1.4404-1.8721-2.1602-2.6646-2.1602c-0.5757,0-0.8638,0.5757-0.8638,1.6558c0,5.4004,0.5762,11.2329,1.728,17.4258c0.6479-2.2324,1.3682-4.4644,2.0161-6.6968C82.3823,84.2153,82.8145,81.9829,82.8145,80.543z M102.9761,146.2129c0-1.0083-0.792-1.8726-2.2324-2.5923c-1.2241-0.5762-2.376-0.8643-3.5283-0.8643c-1.3677,0-3.3843,0.792-6.2642,2.2324c-3.0967,1.6558-4.6084,3.0962-4.6084,4.248c0,2.0884,0.2158,4.8965,0.5757,8.353c0.4321,4.3921,0.6484,7.2002,0.7925,8.4243c2.8799-1.0078,6.1201-3.8159,9.7207-8.4243C101.104,152.9814,102.9761,149.165,102.9761,146.2129z"/>
                </symbol>
                <symbol id="piano-clef" viewBox="0 -4 10 8" style="overflow: visible;">
                    <path transform="translate(-9.8 -16) scale(0.1111)" d="M108.2324,146.5005c0,2.0884-0.3599,5.1846-1.0801,9.2168c-0.7202,4.2485-1.4399,7.2007-2.1602,8.9292c-2.0161,4.752-4.8965,8.8564-8.7129,12.1689c-0.936,0.8638-2.5923,2.0161-4.8242,3.5283c-0.144,0.144-0.2881,0.2158-0.3599,0.2881c0,0,0.2158,1.0801,0.6479,3.3843c0.5762,3.312,0.8638,5.8325,0.8638,7.7046c0,3.8164-0.5039,7.9204-1.5117,12.313c-1.3682,6.1924-3.2407,9.2168-5.5444,9.2168c-0.7925,0-1.4404-1.2241-1.8726-3.7441c-0.3599-1.7285-0.5039-3.4565-0.5039-5.1846c3.4565-5.9048,5.2563-11.4492,5.2563-16.6333c0-0.7202-0.144-1.7285-0.2881-2.8804c-0.2881-1.5845-0.5757-2.4482-0.936-2.4482c-0.2881,0-0.7197,0.0718-1.2959,0.2158c-0.5039,0.144-0.936,0.2881-1.0801,0.2881c-1.6562,0.2881-3.4565,0.3599-5.3286,0.3599c-7.4888,0-13.1772-2.4478-17.0654-7.4165c-3.5283-4.4644-5.2563-10.5127-5.2563-18.2173c0-5.4009,1.584-12.9614,4.7524-22.7544c1.2241-3.7441,2.8081-7.9204,4.6084-12.5288c1.8721-4.3926,3.6724-8.8569,5.5444-13.3213c3.2402-7.7764,4.8242-11.9531,4.7524-12.3848l-4.4644-36.2915c0.4321-1.7998,1.3682-2.7363,2.5923-2.7363c0.5757,0,1.6558,0.5762,3.2402,1.6562c6.3364,4.5366,9.5049,12.0972,9.5049,22.7539c0,5.1846-1.6562,11.7373-4.9688,19.73c-0.792,2.0161-1.2241,3.0244-1.2241,3.0244c0,1.6558,0.4321,7.3442,1.2241,16.9932c0.8643,9.8647,1.3682,15.1216,1.6562,15.6973c1.6562-1.7998,3.6001-3.312,5.9043-4.5361c2.5923-1.2964,4.9688-2.0161,7.2007-2.0161C104.6323,130.8755,108.2324,136.1318,108.2324,146.5005z M81.0859,139.876l-2.4482-27.4341c-3.6001,7.9927-6.8403,15.6973-9.7207,23.186c-4.5361,11.665-6.7686,19.2256-6.7686,22.5376c0,4.4644,1.728,7.4888,5.1846,9.001c0.0718,0.0718,0.8643,0.3599,2.376,0.8643c0-7.2007,2.4482-14.6895,7.417-22.4663C78.062,144.3403,79.3579,142.4683,81.0859,139.876z M85.0464,167.6704c-0.5039-3.6001-1.0801-9.1445-1.8721-16.4893c-1.2959,1.4399-3.0962,3.7441-5.4727,6.9126c-2.4482,4.1763-3.6001,7.7046-3.6001,10.5127c0.7202,0.2881,1.6562,0.3604,2.7363,0.3604C78.4219,168.9668,81.1582,168.5347,85.0464,167.6704z M82.8145,80.543c0-0.936-0.5044-2.1602-1.5122-3.6001c-1.0083-1.4404-1.8721-2.1602-2.6646-2.1602c-0.5757,0-0.8638,0.5757-0.8638,1.6558c0,5.4004,0.5762,11.2329,1.728,17.4258c0.6479-2.2324,1.3682-4.4644,2.0161-6.6968C82.3823,84.2153,82.8145,81.9829,82.8145,80.543z M102.9761,146.2129c0-1.0083-0.792-1.8726-2.2324-2.5923c-1.2241-0.5762-2.376-0.8643-3.5283-0.8643c-1.3677,0-3.3843,0.792-6.2642,2.2324c-3.0967,1.6558-4.6084,3.0962-4.6084,4.248c0,2.0884,0.2158,4.8965,0.5757,8.353c0.4321,4.3921,0.6484,7.2002,0.7925,8.4243c2.8799-1.0078,6.1201-3.8159,9.7207-8.4243C101.104,152.9814,102.9761,149.165,102.9761,146.2129z"/>
                </symbol>
                <path id="bass-clef"  class="clef-path" transform="translate(-29 -9.2)   scale(0.092)" d="M300.395,214.4746c0.0723,0-0.5039-0.2163-1.728-0.6479c0-1.5845,0.144-4.0327,0.4321-7.3447c0-0.144,0.144-0.6479,0.4321-1.5122c0.2158-0.8643,0.3599-1.3682,0.3599-1.6562c0-0.144-0.0718-0.2158-0.0718-0.2881c7.2002-3.312,13.5371-8.3525,19.0093-15.1934c5.9048-7.3442,8.8569-14.7612,8.8569-22.1055c0-1.8726-0.4321-4.0327-1.3682-6.625c-3.1685-8.9287-9.6489-13.3931-19.5137-13.3931c-3.0962,0-6.5527,1.4404-10.3691,4.2485c-4.0322,3.0244-6.0483,5.9766-6.0483,8.9287c0,1.0083,0.6479,2.0161,2.0161,3.1685c1.3682,1.1519,2.0884,2.8799,2.0884,5.04c0,4.6084-0.6479,6.8408-1.9443,6.8408c-0.4321,0-1.0801-0.3599-1.8003-1.0801c-2.8799-2.5923-4.3203-6.1924-4.3203-10.8008c0-7.7051,1.8003-14.4736,5.4004-20.3062c4.2485-6.7686,10.0093-10.1528,17.2817-10.1528c7.6328,0,13.4653,3.5283,17.5693,10.4409c3.3843,5.8325,5.1128,12.8174,5.1128,20.9541c0,12.1689-2.5923,22.3218-7.7769,30.5308c-0.6479,1.1519-2.376,3.6001-5.2563,7.2002c-1.728,2.2324-4.6084,4.9688-8.6406,8.1367C305.5078,212.6025,302.2671,214.4746,300.395,214.4746z M351.4473,140.1641c0,1.4404-0.2158,2.9521-0.6475,4.6084c-0.5039,2.1602-1.2246,3.4565-2.0889,3.7446c-0.2158,0.1436-1.3682,0.2876-3.3115,0.5757c-2.0166,0.2881-3.1689,0.3604-3.6006,0.3604c-1.5122,0-2.2324-0.7925-2.2324-2.3765c0-0.8638,0.2881-2.376,0.8643-4.4644c0.6484-2.0884,1.2236-3.3843,1.7285-3.9604c0.2871-0.2158,1.4395-0.4316,3.5283-0.7197c1.9434-0.2163,3.2402-0.3604,3.96-0.3604C350.8711,137.5718,351.4473,138.436,351.4473,140.1641z M310.5479,114.8179c0-0.144-0.2158-0.2158-0.5757-0.2158c-0.8643,0-1.2964,1.0078-1.2964,2.9521c0.5762-0.2881,1.0801-0.5039,1.5122-0.792C310.4038,116.5459,310.5479,115.8979,310.5479,114.8179z M351.4473,140.1641c0,1.4404-0.2158,2.9521-0.6475,4.6084c-0.5039,2.1602-1.2246,3.4565-2.0889,3.7446c-0.2158,0.1436-1.3682,0.2876-3.3115,0.5757c-2.0166,0.2881-3.1689,0.3604-3.6006,0.3604c-1.5122,0-2.2324-0.7925-2.2324-2.3765c0-0.8638,0.2881-2.376,0.8643-4.4644c0.6484-2.0884,1.2236-3.3843,1.7285-3.9604c0.2871-0.2158,1.4395-0.4316,3.5283-0.7197c1.9434-0.2163,3.2402-0.3604,3.96-0.3604C350.8711,137.5718,351.4473,138.436,351.4473,140.1641z M351.4473,159.1738c0,1.4399-0.2158,2.9521-0.6475,4.6084c-0.5039,2.1602-1.2246,3.4561-2.0889,3.7441c-0.2158,0.144-1.3682,0.2881-3.3115,0.5762c-2.0166,0.2881-3.1689,0.3599-3.6006,0.3599c-1.5122,0-2.2324-0.792-2.2324-2.376c0-0.8643,0.2881-2.3765,0.8643-4.4644c0.6484-2.0884,1.2236-3.3843,1.7285-3.9604c0.2871-0.2158,1.4395-0.4321,3.5283-0.7202c1.9434-0.2158,3.2402-0.3599,3.96-0.3599C350.8711,156.5815,351.4473,157.4458,351.4473,159.1738z" />
                <path id="drums-clef" transform="translate(-2.5 2.6)" class="clef-path" d="M0,2.2 L1.2,2.2 L1.2,5.8 L0,5.8 Z M1.9,2.2 L3.1,2.2 L3.1,5.8 L1.9,5.8 Z" />
            </defs>
        </svg>
    `,

    construct: function(shadow, internals) {
        // Listen to updates to ScribeScript.stylesheet and update the link
        const stylelink = shadow.querySelector('link');
        stylefns.push((url) => stylelink.href = url);
        if (stylesheet.value) stylelink.href = stylesheet.value;

        // Set up listeners for attribute/property changes
        internals.data      = Signal.of();
        internals.clef      = Signal.of('treble');
        internals.key       = Signal.of('C');
        internals.meter     = Signal.of('4/4');
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
                timesigToMeter(internals.meter.value),
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
    /**
    clef="treble"
    Choose the default clef to render. Not that if the rendered sequence
    contains clef events, they override this choice. Possible clefs are
    `"treble"`, `"bass"`, `"piano"`, `"drums"`, `"percussion"`, `"chord"`.
    **/
    clef: {
        attribute: function(value) { this.clef = value; },
        get: function() {  return getInternals(this).clef.value; },
        set: function(value) {
            if (!staves[value]) {
                console.warn('<scribe-script> Attempt to set invalid clef="' + value + '" ignored');
                return;
            }
            getInternals(this).clef.value = value;
        }
    },

    /**
    key="C"
    Choose the default key to render.
    **/
    key: {
        attribute: function(value) { this.key = value; },
        get: function() { return getInternals(this).key.value; },
        set: function(value) {
            const internals = getInternals(this);

            // Validate
            if (typeof value !== 'string' || !/^[A-G][#b♯♭]?$/.test(value)) {
                console.warn('<scribe-script> Attempt to set invalid key="' + value + '" ignored');
                return;
            }

            // Set
            internals.key.value = value.replace(/[#b]$/, ($0) => $0 === '#' ? '♯' : '♭');
        }
    },

    /**
    meter="4/4"
    Sets the meter. Note that this is overridden by any `"meter"` event found at
    beat `0` in the data.
    **/
    meter: {
        attribute: function(value) { this.key = value; },
        get: function() { return getInternals(this).meter.value; },
        set: function(value) { getInternals(this).meter.value = value; }
    },

    /**
    transpose="0"
    Sets transposition value for display of notation.
    **/

    /**
    .transpose = 0
    Sets transposition value for display of notation.
    **/
    transpose: {
        attribute: function(value) { this.transpose = value; },
        get: function() { return getInternals(this).transpose.value; },
        set: function(value) {
            // Set integer from value
            getInternals(this).transpose.value = typeof value === 'number' ?
                Math.round(value) :
                parseInt(value, 10) ;
        }
    },

    /**
    type="application/json"
    Mimetype or type of data to fetch. Possible mimetypes:
    - `"text/x-abc"`
    - `"text/plain"`
    - `"application/json"`
    **/

    type: {
        attribute: function(value) { this.type = value; },
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
}, './shadow.css'), {
    // Define ScribeScript.styleheet as the stylesheet signal
    stylesheet: {
        set: (url) => stylesheet.value = url,
        get: ()    => stylesheet.value
    }
});
