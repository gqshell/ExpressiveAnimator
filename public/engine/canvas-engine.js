(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@zindex/skia-ts')) :
    typeof define === 'function' && define.amd ? define(['exports', '@zindex/skia-ts'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory((global.Zindex = global.Zindex || {}, global.Zindex.CanvasEngine = {}), global.SkiaWasmInit));
}(this, (function (exports, SkiaWasmInit) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var SkiaWasmInit__default = /*#__PURE__*/_interopDefaultLegacy(SkiaWasmInit);

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.MouseButton = void 0;
    (function (MouseButton) {
        MouseButton[MouseButton["Left"] = 0] = "Left";
        MouseButton[MouseButton["Wheel"] = 1] = "Wheel";
        MouseButton[MouseButton["Right"] = 2] = "Right";
        MouseButton[MouseButton["Unknown"] = 3] = "Unknown";
    })(exports.MouseButton || (exports.MouseButton = {}));
    const isMacOS = navigator?.platform.toUpperCase().startsWith('MAC');
    class KeyboardStatus {
        constructor() {
            this.isCtrl = false;
            this.isShift = false;
            this.isAlt = false;
        }
        update(event) {
            let changed = false;
            if (this.isShift !== event.shiftKey) {
                this.isShift = event.shiftKey;
                changed = true;
            }
            if (this.isAlt !== event.altKey) {
                this.isAlt = event.altKey;
                changed = true;
            }
            const ctrl = isMacOS ? event.metaKey : event.ctrlKey;
            if (this.isCtrl !== ctrl) {
                this.isCtrl = ctrl;
                changed = true;
            }
            return changed;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const EPSILON = 0.00001;
    function round(value) {
        return Number.isInteger(value) ? value : Math.round(value * 100) / 100;
    }
    function clamp(value, min = 0, max = 1) {
        return value <= min ? min : (value >= max ? max : value);
    }
    function isCloseTo(a, b) {
        return Math.abs(a - b) <= EPSILON;
    }
    function numberToString(value) {
        return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    }
    function isValidNumber(value) {
        return Number.isFinite(value) && !Number.isNaN(value);
    }
    function parseNumber(value, fallback = 0) {
        const number = parseFloat(value);
        return isValidNumber(number) ? number : fallback;
    }
    const NUMBER_REGEX = /-?(?:\d\.?\d*[Ee][+\-]?\d+|(?:\d+\.\d*|\d*\.\d+)|\d+)/gm;
    function parseNumberList(value) {
        const list = [];
        let match;
        while (match = NUMBER_REGEX.exec(value)) {
            const number = parseFloat(match[0]);
            if (isValidNumber(number)) {
                list.push(number);
            }
        }
        return list;
    }
    function numberListToString(value, separator = ' ') {
        return value.map(numberToString).join(separator);
    }

    /**
     * Take input from [0, n] and return it as [0, 1]
     * @hidden
     */
    function bound01(n, max) {
        if (isOnePointZero(n)) {
            n = '100%';
        }
        var isPercent = isPercentage(n);
        n = max === 360 ? n : Math.min(max, Math.max(0, parseFloat(n)));
        // Automatically convert percentage into number
        if (isPercent) {
            n = parseInt(String(n * max), 10) / 100;
        }
        // Handle floating point rounding errors
        if (Math.abs(n - max) < 0.000001) {
            return 1;
        }
        // Convert into [0, 1] range if it isn't already
        if (max === 360) {
            // If n is a hue given in degrees,
            // wrap around out-of-range values into [0, 360] range
            // then convert into [0, 1].
            n = (n < 0 ? (n % max) + max : n % max) / parseFloat(String(max));
        }
        else {
            // If n not a hue given in degrees
            // Convert into [0, 1] range if it isn't already.
            n = (n % max) / parseFloat(String(max));
        }
        return n;
    }
    /**
     * Need to handle 1.0 as 100%, since once it is a number, there is no difference between it and 1
     * <http://stackoverflow.com/questions/7422072/javascript-how-to-detect-number-as-a-decimal-including-1-0>
     * @hidden
     */
    function isOnePointZero(n) {
        return typeof n === 'string' && n.indexOf('.') !== -1 && parseFloat(n) === 1;
    }
    /**
     * Check to see if string passed in is a percentage
     * @hidden
     */
    function isPercentage(n) {
        return typeof n === 'string' && n.indexOf('%') !== -1;
    }
    /**
     * Return a valid alpha value [0,1] with all invalid values being set to 1
     * @hidden
     */
    function boundAlpha(a) {
        a = parseFloat(a);
        if (isNaN(a) || a < 0 || a > 1) {
            a = 1;
        }
        return a;
    }
    /**
     * Replace a decimal with it's percentage value
     * @hidden
     */
    function convertToPercentage(n) {
        if (n <= 1) {
            return Number(n) * 100 + "%";
        }
        return n;
    }

    // `rgbToHsl`, `rgbToHsv`, `hslToRgb`, `hsvToRgb` modified from:
    // <http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript>
    /**
     * Handle bounds / percentage checking to conform to CSS color spec
     * <http://www.w3.org/TR/css3-color/>
     * *Assumes:* r, g, b in [0, 255] or [0, 1]
     * *Returns:* { r, g, b } in [0, 255]
     */
    function rgbToRgb(r, g, b) {
        return {
            r: bound01(r, 255) * 255,
            g: bound01(g, 255) * 255,
            b: bound01(b, 255) * 255,
        };
    }
    function hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * (6 * t);
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }
    /**
     * Converts an HSL color value to RGB.
     *
     * *Assumes:* h is contained in [0, 1] or [0, 360] and s and l are contained [0, 1] or [0, 100]
     * *Returns:* { r, g, b } in the set [0, 255]
     */
    function hslToRgb(h, s, l) {
        var r;
        var g;
        var b;
        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);
        if (s === 0) {
            // achromatic
            g = l;
            b = l;
            r = l;
        }
        else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return { r: r * 255, g: g * 255, b: b * 255 };
    }
    /**
     * Converts an HSV color value to RGB.
     *
     * *Assumes:* h is contained in [0, 1] or [0, 360] and s and v are contained in [0, 1] or [0, 100]
     * *Returns:* { r, g, b } in the set [0, 255]
     */
    function hsvToRgb(h, s, v) {
        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);
        var i = Math.floor(h);
        var f = h - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);
        var mod = i % 6;
        var r = [v, q, p, p, t, v][mod];
        var g = [t, v, v, q, p, p][mod];
        var b = [p, p, t, v, v, q][mod];
        return { r: r * 255, g: g * 255, b: b * 255 };
    }
    /** Converts a hex value to a decimal */
    function convertHexToDecimal(h) {
        return parseIntFromHex(h) / 255;
    }
    /** Parse a base-16 hex value into a base-10 integer */
    function parseIntFromHex(val) {
        return parseInt(val, 16);
    }

    // https://github.com/bahamas10/css-color-names/blob/master/css-color-names.json
    /**
     * @hidden
     */
    var names = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkgrey: '#a9a9a9',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        goldenrod: '#daa520',
        gold: '#ffd700',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        grey: '#808080',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        lavenderblush: '#fff0f5',
        lavender: '#e6e6fa',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgreen: '#90ee90',
        lightgrey: '#d3d3d3',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370db',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#db7093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        rebeccapurple: '#663399',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32',
    };

    /**
     * Given a string or object, convert that input to RGB
     *
     * Possible string inputs:
     * ```
     * "red"
     * "#f00" or "f00"
     * "#ff0000" or "ff0000"
     * "#ff000000" or "ff000000"
     * "rgb 255 0 0" or "rgb (255, 0, 0)"
     * "rgb 1.0 0 0" or "rgb (1, 0, 0)"
     * "rgba (255, 0, 0, 1)" or "rgba 255, 0, 0, 1"
     * "rgba (1.0, 0, 0, 1)" or "rgba 1.0, 0, 0, 1"
     * "hsl(0, 100%, 50%)" or "hsl 0 100% 50%"
     * "hsla(0, 100%, 50%, 1)" or "hsla 0 100% 50%, 1"
     * "hsv(0, 100%, 100%)" or "hsv 0 100% 100%"
     * ```
     */
    function inputToRGB(color) {
        var rgb = { r: 0, g: 0, b: 0 };
        var a = 1;
        var s = null;
        var v = null;
        var l = null;
        var ok = false;
        var format = false;
        if (typeof color === 'string') {
            color = stringInputToObject(color);
        }
        if (typeof color === 'object') {
            if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = String(color.r).substr(-1) === '%' ? 'prgb' : 'rgb';
            }
            else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
                s = convertToPercentage(color.s);
                v = convertToPercentage(color.v);
                rgb = hsvToRgb(color.h, s, v);
                ok = true;
                format = 'hsv';
            }
            else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
                s = convertToPercentage(color.s);
                l = convertToPercentage(color.l);
                rgb = hslToRgb(color.h, s, l);
                ok = true;
                format = 'hsl';
            }
            if (Object.prototype.hasOwnProperty.call(color, 'a')) {
                a = color.a;
            }
        }
        a = boundAlpha(a);
        return {
            ok: ok,
            format: color.format || format,
            r: Math.min(255, Math.max(rgb.r, 0)),
            g: Math.min(255, Math.max(rgb.g, 0)),
            b: Math.min(255, Math.max(rgb.b, 0)),
            a: a,
        };
    }
    // <http://www.w3.org/TR/css3-values/#integers>
    var CSS_INTEGER = '[-\\+]?\\d+%?';
    // <http://www.w3.org/TR/css3-values/#number-value>
    var CSS_NUMBER = '[-\\+]?\\d*\\.\\d+%?';
    // Allow positive/negative integer/number.  Don't capture the either/or, just the entire outcome.
    var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";
    // Actual matching.
    // Parentheses and commas are optional, but not required.
    // Whitespace can take the place of commas or opening paren
    var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
    var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
    var matchers = {
        CSS_UNIT: new RegExp(CSS_UNIT),
        rgb: new RegExp('rgb' + PERMISSIVE_MATCH3),
        rgba: new RegExp('rgba' + PERMISSIVE_MATCH4),
        hsl: new RegExp('hsl' + PERMISSIVE_MATCH3),
        hsla: new RegExp('hsla' + PERMISSIVE_MATCH4),
        hsv: new RegExp('hsv' + PERMISSIVE_MATCH3),
        hsva: new RegExp('hsva' + PERMISSIVE_MATCH4),
        hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
        hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
    };
    /**
     * Permissive string parsing.  Take in a number of formats, and output an object
     * based on detected format.  Returns `{ r, g, b }` or `{ h, s, l }` or `{ h, s, v}`
     */
    function stringInputToObject(color) {
        color = color.trim().toLowerCase();
        if (color.length === 0) {
            return false;
        }
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        }
        else if (color === 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0, format: 'name' };
        }
        // Try to match string input using regular expressions.
        // Keep most of the number bounding out of this function - don't worry about [0,1] or [0,100] or [0,360]
        // Just return an object and let the conversion functions handle that.
        // This way the result will be the same whether the tinycolor is initialized with string or object.
        var match = matchers.rgb.exec(color);
        if (match) {
            return { r: match[1], g: match[2], b: match[3] };
        }
        match = matchers.rgba.exec(color);
        if (match) {
            return { r: match[1], g: match[2], b: match[3], a: match[4] };
        }
        match = matchers.hsl.exec(color);
        if (match) {
            return { h: match[1], s: match[2], l: match[3] };
        }
        match = matchers.hsla.exec(color);
        if (match) {
            return { h: match[1], s: match[2], l: match[3], a: match[4] };
        }
        match = matchers.hsv.exec(color);
        if (match) {
            return { h: match[1], s: match[2], v: match[3] };
        }
        match = matchers.hsva.exec(color);
        if (match) {
            return { h: match[1], s: match[2], v: match[3], a: match[4] };
        }
        match = matchers.hex8.exec(color);
        if (match) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                a: convertHexToDecimal(match[4]),
                format: named ? 'name' : 'hex8',
            };
        }
        match = matchers.hex6.exec(color);
        if (match) {
            return {
                r: parseIntFromHex(match[1]),
                g: parseIntFromHex(match[2]),
                b: parseIntFromHex(match[3]),
                format: named ? 'name' : 'hex',
            };
        }
        match = matchers.hex4.exec(color);
        if (match) {
            return {
                r: parseIntFromHex(match[1] + match[1]),
                g: parseIntFromHex(match[2] + match[2]),
                b: parseIntFromHex(match[3] + match[3]),
                a: convertHexToDecimal(match[4] + match[4]),
                format: named ? 'name' : 'hex8',
            };
        }
        match = matchers.hex3.exec(color);
        if (match) {
            return {
                r: parseIntFromHex(match[1] + match[1]),
                g: parseIntFromHex(match[2] + match[2]),
                b: parseIntFromHex(match[3] + match[3]),
                format: named ? 'name' : 'hex',
            };
        }
        return false;
    }
    /**
     * Check to see if it looks like a CSS unit
     * (see `matchers` above for definition).
     */
    function isValidCSSUnit(color) {
        return Boolean(matchers.CSS_UNIT.exec(String(color)));
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.Cursor = void 0;
    (function (Cursor) {
        Cursor["Bucket"] = "bucket";
        Cursor["ColorPicker"] = "color-picker";
        Cursor["Default"] = "default";
        Cursor["Hand"] = "hand";
        Cursor["HandHold"] = "hand-hold";
        Cursor["Move"] = "move";
        Cursor["Pointer"] = "pointer";
        Cursor["PointerAlt"] = "pointer-alt";
        Cursor["PointerAdd"] = "pointer-add";
        Cursor["PointerAddAlt"] = "pointer-add-alt";
        Cursor["PointerCurve"] = "pointer-curve";
        Cursor["PointerCurveAlt"] = "pointer-curve-alt";
        Cursor["PointerMove"] = "pointer-move";
        Cursor["PointerMoveAlt"] = "pointer-move-alt";
        Cursor["PointerRemove"] = "pointer-remove";
        Cursor["PointerRemoveAlt"] = "pointer-remove-alt";
        Cursor["PointerSelectable"] = "pointer-selectable";
        Cursor["PointerSelectableAlt"] = "pointer-selectable-alt";
        Cursor["NotAllowed"] = "not-allowed";
        Cursor["Pen"] = "pen";
        Cursor["PenAdd"] = "pen-add";
        Cursor["PenClose"] = "pen-close";
        Cursor["PenContinue"] = "pen-continue";
        Cursor["PenPoint"] = "pen-point";
        Cursor["PenRemove"] = "pen-remove";
        Cursor["ResizeEW"] = "resize-ew";
        Cursor["ResizeNS"] = "resize-ns";
        Cursor["ResizeNESW"] = "resize-nesw";
        Cursor["ResizeNWSE"] = "resize-nwse";
        Cursor["Rotate"] = "rotate";
        Cursor["RotateAlt"] = "rotate-alt";
        Cursor["Target"] = "target";
        Cursor["Zoom"] = "zoom";
        Cursor["ZoomIn"] = "zoom-in";
        Cursor["ZoomOut"] = "zoom-out";
    })(exports.Cursor || (exports.Cursor = {}));

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.Unit = void 0;
    (function (Unit) {
        Unit["PX"] = "px";
        Unit["PT"] = "pt";
        Unit["PC"] = "pc";
        Unit["CM"] = "cm";
        Unit["MM"] = "mm";
        Unit["IN"] = "in";
    })(exports.Unit || (exports.Unit = {}));
    const DPI = 96.0;
    const FROM_MAP = {
        [exports.Unit.PT](value) {
            return value * DPI / 72;
        },
        [exports.Unit.PC](value) {
            return value * 15;
        },
        [exports.Unit.CM](value) {
            return value * DPI / 2.54;
        },
        [exports.Unit.MM](value) {
            return value * DPI / 25.4;
        },
        [exports.Unit.IN](value) {
            return value * DPI;
        },
    };
    const TO_MAP = {
        [exports.Unit.PT](value) {
            return value * 72 / DPI;
        },
        [exports.Unit.PC](value) {
            return value / 15;
        },
        [exports.Unit.CM](value) {
            return value * 2.54 / DPI;
        },
        [exports.Unit.MM](value) {
            return value * 25.4 / DPI;
        },
        [exports.Unit.IN](value) {
            return value / DPI;
        },
    };
    function convertUnit(value, from, to) {
        if (from !== to) {
            if (from !== exports.Unit.PX) {
                value = FROM_MAP[from](value);
            }
            if (to !== exports.Unit.PX) {
                value = TO_MAP[to](value);
            }
        }
        return value;
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const RADIANS = Math.PI / 180;
    const DEGREES = 180 / Math.PI;
    function greatestCommonDivisor(a, b) {
        // https://en.wikipedia.org/wiki/Euclidean_algorithm#Implementations
        let t;
        while (b) {
            t = b;
            b = a % b;
            a = t;
        }
        return a || 1;
    }
    function leastCommonMultiple(a, b) {
        // https://en.wikipedia.org/wiki/Least_common_multiple#Using_the_greatest_common_divisor
        return Math.abs((a * b) / greatestCommonDivisor(a, b));
    }
    function getRangePercent(value, min, max) {
        if (min === max) {
            return 1;
        }
        return (value - min) / (max - min);
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function equals(a, b) {
        if (a === b) {
            return true;
        }
        if (a == null) {
            return b == null;
        }
        if ((typeof a !== 'object') || (typeof b !== 'object')) {
            return false;
        }
        if (Array.isArray(a)) {
            if (!Array.isArray(b) || a.length !== b.length) {
                return false;
            }
            const length = a.length;
            for (let i = 0; i < length; i++) {
                if (!equals(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        }
        if (typeof a.equals === 'function') {
            return a.equals(b);
        }
        const keys = Object.keys(a);
        if (Object.keys(b).length !== keys.length) {
            return false;
        }
        for (const key of keys) {
            if (!(key in b) || !equals(a[key], b[key])) {
                return false;
            }
        }
        return true;
    }
    function clone(value) {
        if (!value || (typeof value !== "object")) {
            return value;
        }
        if (Array.isArray(value)) {
            return value.map(clone);
        }
        if (typeof value.clone === "function") {
            return value.clone();
        }
        const object = {};
        for (const prop in value) {
            if (value.hasOwnProperty(prop)) {
                object[prop] = clone(value[prop]);
            }
        }
        return object;
    }
    const UUID_REGEX = /[018]/g;
    function uuid() {
        let i = 0;
        const arr = crypto.getRandomValues(new Uint8Array(31));
        return "10000000-1000-4000-8000-100000000000"
            .replace(UUID_REGEX, (c) => {
            c = +c;
            return (c ^ arr[i++] & 15 >> c / 4).toString(16);
        });
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.Position = void 0;
    (function (Position) {
        Position[Position["None"] = 0] = "None";
        Position[Position["Start"] = 1] = "Start";
        Position[Position["Middle"] = 2] = "Middle";
        Position[Position["End"] = 3] = "End";
    })(exports.Position || (exports.Position = {}));

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class BaseTool {
        constructor() {
            this.data = null;
            this.mouseDownEvent = null;
            this.panPivot = null;
            this.isInvalidated = true;
            this.snapshotImage = null;
            this.drawDocumentOnly = true;
            this.allowSnapshotCapture = false;
            this.keyboardStatus = null;
            this.defaultCanvasCursor = exports.Cursor.Default;
        }
        activate(engine, data) {
            this.keyboardStatus = engine.keyboardStatus;
            this.data = data;
            this.invalidate();
            // set default cursor
            engine.cursor = this.defaultCanvasCursor;
            // update theme
            this.updateTheme(engine);
        }
        deactivate(engine) {
            this.keyboardStatus = null;
            this.data = null;
            this.invalidate();
            // clear cursor
            engine.cursor = exports.Cursor.Default;
        }
        updateTheme(engine) {
            // do nothing
        }
        invalidate() {
            this.isInvalidated = true;
            this.allowSnapshotCapture = false;
            if (this.snapshotImage !== null) {
                this.snapshotImage.delete();
                this.snapshotImage = null;
            }
        }
        invalidateToolDrawing() {
            this.isInvalidated = true;
        }
        render(engine, timestamp) {
            if (!this.isInvalidated) {
                return;
            }
            if (this.drawDocumentOnly) {
                this.drawDocument(engine);
            }
            else {
                this.drawSnapshotImage(engine);
            }
            this.isInvalidated = false;
        }
        onMouseDown(engine, event) {
            this.mouseDownEvent = event;
            if (event.button === exports.MouseButton.Left) {
                this.onMouseLeftButtonDown(engine, event);
            }
            else if (event.button === exports.MouseButton.Wheel) {
                this.onMouseWheelButtonDown(engine, event);
            }
        }
        onMouseUp(engine, event) {
            if (event.button === exports.MouseButton.Left) {
                this.onMouseLeftButtonUp(engine, event);
            }
            else if (event.button === exports.MouseButton.Wheel) {
                this.onMouseWheelButtonUp(engine, event);
            }
            else if (event.button === exports.MouseButton.Right) ;
            this.mouseDownEvent = null;
            this.panPivot = null;
        }
        onMouseMove(engine, event) {
            if (this.mouseDownEvent) {
                if (this.mouseDownEvent.button === exports.MouseButton.Left) {
                    this.onMouseLeftButtonMove(engine, event);
                }
                else if (this.mouseDownEvent.button === exports.MouseButton.Wheel) {
                    this.onMouseWheelButtonMove(engine, event);
                }
            }
            else {
                this.onMouseHover(engine, event);
            }
        }
        onMouseHover(engine, event) {
            // nothing to do here, override
        }
        onMouseWheelButtonDown(engine, event) {
            this.panPivot = event.canvasPosition;
            engine.cursor = exports.Cursor.HandHold;
        }
        onMouseWheelButtonUp(engine, event) {
            this.doPan(engine, event);
            engine.cursor = this.defaultCanvasCursor;
        }
        onMouseWheelButtonMove(engine, event) {
            this.doPan(engine, event);
            this.panPivot = event.canvasPosition;
        }
        doPan(engine, event, pivot = this.panPivot) {
            engine.viewBox.panBy(event.canvasPosition.sub(pivot));
        }
        drawSnapshotImage(engine, flush = true) {
            const context = engine.context;
            if (this.snapshotImage !== null) {
                // Draw bitmap cache at scale 1:1
                context.save();
                context.matrix = context.matrix.toIdentity();
                context.drawImage(this.snapshotImage);
                context.restore();
                if (flush) {
                    context.flush();
                }
                return;
            }
            this.drawDocument(engine, false);
            if (this.allowSnapshotCapture) {
                this.snapshotImage = engine.makeImageSnapshot();
            }
            this.allowSnapshotCapture = true;
            if (flush) {
                context.flush();
            }
        }
        drawDocument(engine, flush = true) {
            const { context, document } = engine;
            if (document !== null) {
                document.render(engine);
            }
            if (flush) {
                context.flush();
            }
        }
        decorateVectorElement(engine, element) {
            const global = engine.globalElementProperties;
            element.fill = global.fill.clone();
            element.stroke = global.stroke.clone();
            element.fillRule = global.fillRule;
            element.paintOrder = global.paintOrder;
            element.blend = global.blend;
            element.opacity = global.opacity;
            // We do not isolate vector elements
            // element.isolate = global.isolate;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class PanTool extends BaseTool {
        constructor() {
            super(...arguments);
            this.defaultCanvasCursor = exports.Cursor.Hand;
        }
        get name() {
            return "pan";
        }
        onMouseLeftButtonDown(engine, event) {
            this.panPivot = event.canvasPosition;
            engine.cursor = exports.Cursor.HandHold;
        }
        onMouseLeftButtonMove(engine, event) {
            if (!this.panPivot) {
                return;
            }
            this.doPan(engine, event);
            this.panPivot = event.canvasPosition;
        }
        onMouseLeftButtonUp(engine, event) {
            this.doPan(engine, event);
            engine.cursor = exports.Cursor.Hand;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.FillRule = void 0;
    (function (FillRule) {
        FillRule[FillRule["NonZero"] = 0] = "NonZero";
        FillRule[FillRule["EvenOdd"] = 1] = "EvenOdd";
    })(exports.FillRule || (exports.FillRule = {}));
    exports.BrushType = void 0;
    (function (BrushType) {
        BrushType[BrushType["None"] = 0] = "None";
        BrushType[BrushType["Solid"] = 1] = "Solid";
        BrushType[BrushType["LinearGradient"] = 2] = "LinearGradient";
        BrushType[BrushType["RadialGradient"] = 3] = "RadialGradient";
        BrushType[BrushType["TwoPointGradient"] = 4] = "TwoPointGradient";
        BrushType[BrushType["ConicalGradient"] = 5] = "ConicalGradient";
        BrushType[BrushType["Pattern"] = 6] = "Pattern";
        BrushType[BrushType["Pointer"] = 7] = "Pointer";
    })(exports.BrushType || (exports.BrushType = {}));
    exports.PaintOrder = void 0;
    (function (PaintOrder) {
        PaintOrder[PaintOrder["FillStrokeMarkers"] = 0] = "FillStrokeMarkers";
        PaintOrder[PaintOrder["FillMarkersStroke"] = 1] = "FillMarkersStroke";
        PaintOrder[PaintOrder["StrokeFillMarkers"] = 2] = "StrokeFillMarkers";
        PaintOrder[PaintOrder["StrokeMarkersFill"] = 3] = "StrokeMarkersFill";
        PaintOrder[PaintOrder["MarkersFillStroke"] = 4] = "MarkersFillStroke";
        PaintOrder[PaintOrder["MarkersStrokeFill"] = 5] = "MarkersStrokeFill";
    })(exports.PaintOrder || (exports.PaintOrder = {}));
    class BaseBrush {
        constructor(type, opacity) {
            this._type = type;
            this._opacity = opacity;
        }
        get type() {
            return this._type;
        }
        get opacity() {
            return this._opacity;
        }
        get isVisible() {
            return this._opacity > 0;
        }
        set opacity(value) {
            this._opacity = clamp(value, 0, 1);
        }
        preparePaint(paint) {
            paint.isAntiAlias = true;
            paint.alpha = this._opacity;
            paint.style = Skia.SkPaintStyle.Fill;
            return true;
        }
    }
    class EmptyBrush extends BaseBrush {
        constructor(opacity) {
            super(exports.BrushType.None, opacity ?? 1);
        }
        get isVisible() {
            return false;
        }
        clone() {
            return new EmptyBrush(this._opacity);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Color {
        constructor(r = 0, g = 0, b = 0, a = 1.0) {
            this._rgba = null;
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a == null ? 1 : a;
        }
        get code() {
            return (((this.a * 255) << 24) | (this.r << 16) | (this.g << 8) | (this.b << 0)) >>> 0;
        }
        get rgba() {
            if (!this._rgba) {
                this._rgba = `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
            }
            return this._rgba;
        }
        clone() {
            return new Color(this.r, this.g, this.b, this.a);
        }
        inverted() {
            return new Color(255 - this.r, 255 - this.g, 255 - this.b, this.a);
        }
        equals(other) {
            return (this.r === other.r &&
                this.g === other.g &&
                this.b === other.b &&
                this.a === other.a);
        }
        interpolate(color, percent = 0.5) {
            if (percent <= 0) {
                return this;
            }
            if (percent >= 1) {
                return color;
            }
            return new Color(interpolateColorComponent$1(this.r, color.r, percent), interpolateColorComponent$1(this.g, color.g, percent), interpolateColorComponent$1(this.b, color.b, percent), interpolateAlphaComponent$1(this.a, color.a, percent));
        }
        toArray() {
            return [this.r, this.g, this.b, this.a];
        }
        toIntArray() {
            return [this.r, this.g, this.b, this.a * 255];
        }
        toFloatArray() {
            return [this.r / 255, this.g / 255, this.b / 255, this.a];
        }
        static fromCode(code) {
            return new Color((code >> 16) & 0xFF, (code >> 8) & 0xFF, (code >> 0) & 0xFF, ((code >> 24) & 0xFF) / 255);
        }
        static from(data) {
            const color = inputToRGB(data);
            if (!color.ok) {
                return Color.transparent;
            }
            return new Color(color.r, color.g, color.b, color.a);
        }
    }
    Color.transparent = new Color(0, 0, 0, 0);
    Color.white = new Color(255, 255, 255);
    Color.black = new Color(0, 0, 0);
    Color.red = new Color(255, 0, 0);
    Color.green = new Color(0, 255, 0);
    Color.blue = new Color(0, 0, 255);
    function interpolateColorComponent$1(from, to, percent = 0.5) {
        return clamp(Math.round(from + percent * (to - from)), 0, 255);
    }
    function interpolateAlphaComponent$1(from, to, percent = 0.5) {
        if (from == null) {
            from = 1;
        }
        if (to == null) {
            to = 1;
        }
        return clamp(round(from + percent * (to - from)), 0, 1);
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class SolidBrush extends BaseBrush {
        constructor(color, opacity = 1) {
            super(exports.BrushType.Solid, opacity);
            this.color = color;
        }
        get isVisible() {
            return this.opacity > 0 && this.color.a > 0;
        }
        preparePaint(paint) {
            super.preparePaint(paint);
            paint.color = this.color.code;
            // When setting paint.color, the opacity is lost
            // so we must add it again
            paint.addAlpha(this.opacity);
            return true;
        }
        clone() {
            return new SolidBrush(this.color, this._opacity);
        }
        static fromColor(color, opacity = 1) {
            return new SolidBrush(color, opacity);
        }
        static get BLACK() {
            return new SolidBrush(Color.black);
        }
        static get WHITE() {
            return new SolidBrush(Color.white);
        }
        static get TRANSPARENT() {
            return new SolidBrush(Color.transparent, 0);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class StopColorList {
        constructor(list, reference) {
            this._nativeCache = null;
            this._stringCache = null;
            this.list = list || [];
            this.reference = reference || null;
        }
        get length() {
            return this.list.length;
        }
        get isVisible() {
            for (const stop of this.list) {
                if (stop.color.a > 0) {
                    return true;
                }
            }
            return false;
        }
        getColorAt(index) {
            return this.list[index]?.color;
        }
        setColorAt(index, color) {
            if (index > this.list.length || this.list[index].color.equals(color)) {
                return false;
            }
            this.list[index].color = color;
            this._nativeCache = this._stringCache = null;
            return true;
        }
        getOffsetAt(index) {
            return this.list[index]?.offset;
        }
        setOffsetAt(index, offset) {
            if (index > this.list.length || this.list[index].offset === offset) {
                return false;
            }
            this.list[index].offset = offset;
            this.list.sort(sortStopColors);
            this._nativeCache = this._stringCache = null;
            return true;
        }
        removeColorAt(index) {
            if (index > this.list.length) {
                return false;
            }
            this.list.splice(index, 1);
            this._nativeCache = this._stringCache = null;
            return true;
        }
        addStopColor(offset, color) {
            if (color == null) {
                color = this.computeColor(offset);
            }
            const stop = { color, offset };
            this.list.push(stop);
            this.list.sort(sortStopColors);
            this._nativeCache = this._stringCache = null;
            return stop;
        }
        reverseOffsets() {
            let changed = false;
            for (const color of this.list) {
                if (color.offset !== 0.5) {
                    color.offset = 1 - color.offset;
                    changed = true;
                }
            }
            if (changed) {
                this.list.reverse();
                this._nativeCache = this._stringCache = null;
                return true;
            }
            return false;
        }
        computeColor(offset) {
            const list = this.list;
            const length = list.length;
            if (length === 0) {
                return Color.black;
            }
            if (length === 1) {
                return list[0].color;
            }
            if (offset <= list[0].offset) {
                return list[0].color;
            }
            const last = length - 1;
            if (offset >= list[last].offset) {
                return list[last].color;
            }
            for (let i = 2; i < last; i++) {
                const prev = list[i - 1];
                const current = list[i];
                if (prev.offset <= offset && offset <= current.offset) {
                    if (offset === prev.offset) {
                        return prev.color;
                    }
                    if (offset === current.offset) {
                        return current.color;
                    }
                    return prev.color.interpolate(current.color, getRangePercent(offset, prev.offset, current.offset));
                }
            }
            return list[last].color;
        }
        static fromColor(color, reference) {
            if (!color) {
                return new StopColorList([
                    { color: Color.black, offset: 0 },
                    { color: Color.white, offset: 1 },
                ], reference);
            }
            return new StopColorList([
                { color: color, offset: 0 },
                { color: color.inverted(), offset: 1 },
            ], reference);
        }
        toNative() {
            if (this._nativeCache) {
                return this._nativeCache;
            }
            const ret = {
                colors: [],
                offsets: [],
            };
            for (const stop of this.list) {
                ret.colors.push(stop.color.code);
                ret.offsets.push(stop.offset);
            }
            return this._nativeCache = ret;
        }
        toString() {
            if (this._stringCache === null) {
                this._stringCache = this.list.map(stopColorToString).join(', ');
            }
            return this._stringCache;
        }
        clone() {
            if (this.reference) {
                return this;
            }
            return new StopColorList(this.list.map(cloneStopColor), null);
        }
    }
    function cloneStopColor(stop) {
        return { color: stop.color, offset: stop.offset };
    }
    function stopColorToString(stop) {
        return stop.color + ' ' + numberToString(stop.offset * 100) + '%';
    }
    function sortStopColors(a, b) {
        if (a.offset === b.offset) {
            return 0;
        }
        return a.offset < b.offset ? -1 : 1;
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.SpreadMethod = void 0;
    (function (SpreadMethod) {
        SpreadMethod[SpreadMethod["Pad"] = 0] = "Pad";
        SpreadMethod[SpreadMethod["Repeat"] = 1] = "Repeat";
        SpreadMethod[SpreadMethod["Reflect"] = 2] = "Reflect";
    })(exports.SpreadMethod || (exports.SpreadMethod = {}));
    class GradientBrush extends BaseBrush {
        constructor(type, stopColors, spread, opacity = 1, transform = null) {
            super(type, opacity);
            this.transform = null;
            this.stopColors = stopColors;
            this.spread = spread;
            this.transform = transform;
        }
        get isVisible() {
            if (!this._opacity) {
                return false;
            }
            return this.stopColors.isVisible;
        }
        get nativeSpreadMethod() {
            switch (this.spread) {
                case exports.SpreadMethod.Repeat:
                    return Skia.SkTileMode.Repeat;
                case exports.SpreadMethod.Reflect:
                    return Skia.SkTileMode.Mirror;
                case exports.SpreadMethod.Pad:
                default:
                    return Skia.SkTileMode.Clamp;
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class LinearGradientBrush extends GradientBrush {
        constructor(start, end, stopColors, spread = exports.SpreadMethod.Pad, opacity = 1, transform = null) {
            super(exports.BrushType.LinearGradient, stopColors, spread, opacity, transform);
            this.start = start;
            this.end = end;
        }
        clone() {
            return new LinearGradientBrush(this.start.clone(), this.end.clone(), this.stopColors.clone(), this.spread, this._opacity, this.transform ? this.transform.clone() : null);
        }
        preparePaint(paint) {
            super.preparePaint(paint);
            const stop = this.stopColors.toNative();
            paint.shader = Skia.SkShader.MakeLinearGradient(this.start, this.end, stop.colors, stop.offsets, this.nativeSpreadMethod, this.transform);
            return true;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class RadialGradientBrush extends GradientBrush {
        constructor(center, radius, stopColors, spread = exports.SpreadMethod.Pad, opacity = 1, transform = null) {
            super(exports.BrushType.RadialGradient, stopColors, spread, opacity, transform);
            this.center = center;
            this.radius = radius;
        }
        clone() {
            return new RadialGradientBrush(this.center.clone(), this.radius, this.stopColors.clone(), this.spread, this._opacity, this.transform ? this.transform.clone() : null);
        }
        preparePaint(paint) {
            super.preparePaint(paint);
            const stop = this.stopColors.toNative();
            paint.shader = Skia.SkShader.MakeRadialGradient(this.center, this.radius, stop.colors, stop.offsets, this.nativeSpreadMethod, this.transform);
            return true;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class TwoPointGradientBrush extends GradientBrush {
        constructor(start, startRadius, end, endRadius, stopColors, spread = exports.SpreadMethod.Pad, opacity = 1, transform = null) {
            super(exports.BrushType.TwoPointGradient, stopColors, spread, opacity, transform);
            this.start = start;
            this.startRadius = startRadius;
            this.end = end;
            this.endRadius = endRadius;
        }
        clone() {
            return new TwoPointGradientBrush(this.start.clone(), this.startRadius, this.end.clone(), this.endRadius, this.stopColors.clone(), this.spread, this._opacity, this.transform ? this.transform.clone() : null);
        }
        preparePaint(paint) {
            super.preparePaint(paint);
            const stop = this.stopColors.toNative();
            paint.shader = Skia.SkShader.MakeTwoPointConicalGradient(this.start, this.startRadius, this.end, this.endRadius, stop.colors, stop.offsets, this.nativeSpreadMethod, this.transform);
            return true;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class ConicalGradientBrush extends GradientBrush {
        constructor(center, stopColors, spread = exports.SpreadMethod.Pad, startAngle = 0, endAngle = 360, opacity = 1, transform = null) {
            super(exports.BrushType.ConicalGradient, stopColors, spread, opacity, transform);
            this.center = center;
            this.startAngle = startAngle;
            this.endAngle = endAngle;
        }
        clone() {
            return new ConicalGradientBrush(this.center.clone(), this.stopColors.clone(), this.spread, this.startAngle, this.endAngle, this._opacity, this.transform ? this.transform.clone() : null);
        }
        preparePaint(paint) {
            super.preparePaint(paint);
            const stop = this.stopColors.toNative();
            paint.shader = Skia.SkShader.MakeSweepGradient(this.center, this.startAngle, this.endAngle, stop.colors, stop.offsets, this.nativeSpreadMethod, this.transform);
            return true;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        /**
         * Vector direction (angle)
         */
        get direction() {
            return Math.atan2(this.y, this.x);
        }
        /**
         * Vector angle in degrees
         */
        get angle() {
            return this.direction * DEGREES;
        }
        get length() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }
        get isZero() {
            return this.x === 0 && this.y === 0;
        }
        get isUnit() {
            return isCloseTo(this.length, 1);
        }
        isPerpendicularTo(vector) {
            return isCloseTo(this.dot(vector), 0);
        }
        distanceTo(other) {
            return Point.distance(this, other);
        }
        rounded() {
            if (Number.isInteger(this.x) && Number.isInteger(this.y)) {
                return this;
            }
            return new Point(Math.round(this.x), Math.round(this.y));
        }
        shifted(dx, dy) {
            return new Point(this.x + dx, this.y + dy);
        }
        add(p) {
            return new Point(this.x + p.x, this.y + p.y);
        }
        sub(p) {
            return new Point(this.x - p.x, this.y - p.y);
        }
        scale(s) {
            return new Point(s * this.x, s * this.y);
        }
        offset(x, y) {
            return new Point(this.x + x, this.y + y);
        }
        /**
         * Dot product
         * @param vector
         */
        dot(vector) {
            return this.x * vector.x + this.y * vector.y;
        }
        /**
         * Cross product
         * @param vector
         */
        cross(vector) {
            return this.x * vector.y - this.y * vector.x;
        }
        negate() {
            if (this.isZero) {
                return this;
            }
            return new Point(-this.x, -this.y);
        }
        toLength(length) {
            if (this.isZero) {
                return new Point(0, 0);
            }
            return this.scale(length / this.length);
        }
        /**
         * Normalize vector
         */
        toUnit() {
            return this.toLength(1);
        }
        equals(other) {
            return this.x === other.x && this.y === other.y;
        }
        clone() {
            return new Point(this.x, this.y);
        }
        static fromObject(o) {
            return new Point(o.x, o.y);
        }
        /**
         * Creates a vector from an angle
         * @param angle In degrees
         * @param length
         */
        static fromAngle(angle, length = 1) {
            return this.fromDirection(angle * RADIANS, length);
        }
        /**
         * Creates a vector from a direction
         * @param radians angle in radians
         * @param length
         */
        static fromDirection(radians, length = 1) {
            return new Point(length * Math.cos(radians), length * Math.sin(radians));
        }
        /**
         * Distance between two points
         * @param a
         * @param b
         */
        static distance(a, b) {
            return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        }
        /**
         * Center point
         * @param a
         * @param b
         */
        static center(a, b) {
            return new Point((a.x + b.x) / 2, (a.y + b.y) / 2);
        }
        static isSamePoint(a, b) {
            return a.x === b.x && a.y === b.y;
        }
    }
    Point.ZERO = new Point(0, 0);
    Point.UNIT = new Point(1, 1);

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Matrix {
        constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
            this.value = [a, b, c, d, tx, ty];
        }
        get a() {
            return this.value[0];
        }
        get b() {
            return this.value[1];
        }
        get c() {
            return this.value[2];
        }
        get d() {
            return this.value[3];
        }
        /**
         * Alias of tx
         */
        get e() {
            return this.value[4];
        }
        /**
         * Alias of ty
         */
        get f() {
            return this.value[5];
        }
        get tx() {
            return this.value[4];
        }
        get ty() {
            return this.value[5];
        }
        get determinant() {
            const m = this.value;
            return m[0] * m[3] - m[1] * m[2];
        }
        get isInvertible() {
            return this.determinant !== 0;
        }
        get lineScale() {
            return Math.sqrt(Math.abs(this.determinant));
        }
        get isIdentity() {
            const m = this.value;
            return m[0] === 1 && m[1] === 0 &&
                m[2] === 0 && m[3] === 1 &&
                m[4] === 0 && m[5] === 0;
        }
        toIdentity() {
            const m = this.value;
            m[0] = m[3] = 1;
            m[1] = m[2] = m[4] = m[5] = 0;
            return this;
        }
        reset(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
            const m = this.value;
            m[0] = a;
            m[1] = b;
            m[2] = c;
            m[3] = d;
            m[4] = tx;
            m[5] = ty;
            return this;
        }
        panZoom(pan, zoom = 1) {
            return this.scale(zoom, zoom).translate(pan.x / zoom, pan.y / zoom);
        }
        translate(x = 0, y = 0) {
            if (x === 0 && y === 0) {
                return this;
            }
            const m = this.value;
            m[4] += m[0] * x + m[2] * y;
            m[5] += m[1] * x + m[3] * y;
            return this;
        }
        scale(x = 1, y = 1) {
            if (x === 1 && y === 1) {
                return this;
            }
            const m = this.value;
            m[0] *= x;
            m[1] *= x;
            m[2] *= y;
            m[3] *= y;
            return this;
        }
        skew(x = 0, y = 0) {
            x %= 360;
            y %= 360;
            if (x === 0 && y === 0) {
                return this;
            }
            const m = this.value;
            const a = m[0];
            const b = m[1];
            const c = m[2];
            const d = m[3];
            if (x) {
                x = Math.tan(x * RADIANS);
                m[2] += a * x;
                m[3] += b * x;
            }
            if (y) {
                y = Math.tan(y * RADIANS);
                m[0] += c * y;
                m[1] += d * y;
            }
            return this;
        }
        rotate(angle) {
            angle %= 360;
            if (angle) {
                angle *= RADIANS;
                const sin = Math.sin(angle);
                const cos = Math.cos(angle);
                const m = this.value;
                const a = m[0];
                const b = m[1];
                m[0] = a * cos + m[2] * sin;
                m[1] = b * cos + m[3] * sin;
                m[2] = m[2] * cos - a * sin;
                m[3] = m[3] * cos - b * sin;
            }
            return this;
        }
        skewAxis(angle = 0, axis = 0) {
            if (angle === 0) {
                return this;
            }
            angle *= RADIANS;
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            const tan = axis === 0 ? 0 : Math.tan(Math.tan(-axis * RADIANS));
            const m = [
                cos * cos - sin * (cos * tan - sin),
                sin * cos - sin * (sin * tan + cos),
                sin * cos + cos * (cos * tan - sin),
                sin * sin + cos * (sin * tan + cos),
                0, 0,
            ];
            multiplyArray$1(this.value, m, this.value);
            return this;
        }
        inverse() {
            inverseArray(this.value, this.value);
            return this;
        }
        multiply(other) {
            multiplyArray$1(this.value, other.value, this.value);
            return this;
        }
        preMultiply(other) {
            multiplyArray$1(other.value, this.value, this.value);
            return this;
        }
        point(x, y, shifted = true) {
            const m = this.value;
            return new Point(m[0] * x + m[2] * y + (shifted ? m[4] : 0), m[1] * x + m[3] * y + (shifted ? m[5] : 0));
        }
        transformPoint(point, shifted = true) {
            return this.point(point.x, point.y, shifted);
        }
        inversePoint(x, y, shifted = true) {
            const m = [];
            if (inverseArray(this.value, m)) {
                return new Point(m[0] * x + m[2] * y + (shifted ? m[4] : 0), m[1] * x + m[3] * y + (shifted ? m[5] : 0));
            }
            return new Point(x, y);
        }
        transformInversePoint(point, shifted = true) {
            return this.inversePoint(point.x, point.y, shifted);
        }
        clone() {
            const m = this.value;
            return new Matrix(m[0], m[1], m[2], m[3], m[4], m[5]);
        }
        equals(other) {
            return this.value.every((value, index) => value === other.value[index]);
        }
        toString() {
            return `matrix(${this.value.join(' ')})`;
        }
        static Create(matrix) {
            if (!matrix) {
                return new Matrix();
            }
            if (Array.isArray(matrix)) {
                return new Matrix(...matrix);
            }
            return new Matrix(matrix.a || 0, matrix.b || 0, matrix.c || 0, matrix.d || 0, matrix.e || 0, matrix.f || 0);
        }
        static CreatePanZoom(pan, zoom = 1) {
            return new Matrix(zoom, 0, 0, zoom, pan.x, pan.y);
        }
        static CreateDevicePixelRatio(dpr = 1) {
            return new Matrix(dpr, 0, 0, dpr, 0, 0);
        }
    }
    function multiplyArray$1(left, right, dst) {
        const a = left[0] * right[0] + left[2] * right[1];
        const b = left[1] * right[0] + left[3] * right[1];
        const c = left[0] * right[2] + left[2] * right[3];
        const d = left[1] * right[2] + left[3] * right[3];
        const tx = left[0] * right[4] + left[2] * right[5] + left[4];
        const ty = left[1] * right[4] + left[3] * right[5] + left[5];
        dst[0] = a;
        dst[1] = b;
        dst[2] = c;
        dst[3] = d;
        dst[4] = tx;
        dst[5] = ty;
    }
    function inverseArray(src, dst) {
        const det = src[0] * src[3] - src[1] * src[2];
        if (det === 0) {
            return false;
        }
        const a = src[3] / det, b = -src[1] / det, c = -src[2] / det, d = src[0] / det, e = -(src[3] * src[4] - src[2] * src[5]) / det, f = (src[1] * src[4] - src[0] * src[5]) / det;
        dst[0] = a;
        dst[1] = b;
        dst[2] = c;
        dst[3] = d;
        dst[4] = e;
        dst[5] = f;
        return true;
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.PatternTile = void 0;
    (function (PatternTile) {
        PatternTile[PatternTile["None"] = 0] = "None";
        PatternTile[PatternTile["Vertical"] = 1] = "Vertical";
        PatternTile[PatternTile["ReflectVertical"] = 2] = "ReflectVertical";
        PatternTile[PatternTile["Horizontal"] = 3] = "Horizontal";
        PatternTile[PatternTile["ReflectHorizontal"] = 4] = "ReflectHorizontal";
        PatternTile[PatternTile["Both"] = 5] = "Both";
        PatternTile[PatternTile["ReflectBoth"] = 6] = "ReflectBoth";
    })(exports.PatternTile || (exports.PatternTile = {}));
    class PatternBrush extends BaseBrush {
        constructor(pattern, opacity = 1, tile = exports.PatternTile.Both, transform = new Matrix(), rectangle = null) {
            super(exports.BrushType.Pattern, opacity);
            this._pattern = pattern;
            this._tile = tile;
            this._transform = transform;
            this._rectangle = rectangle;
        }
        preparePaint(paint) {
            super.preparePaint(paint);
            let xTile, yTile;
            switch (this._tile) {
                case exports.PatternTile.Horizontal:
                    xTile = Skia.SkTileMode.Repeat;
                    yTile = Skia.SkTileMode.Decal;
                    break;
                case exports.PatternTile.ReflectHorizontal:
                    xTile = Skia.SkTileMode.Mirror;
                    yTile = Skia.SkTileMode.Decal;
                    break;
                case exports.PatternTile.Vertical:
                    xTile = Skia.SkTileMode.Decal;
                    yTile = Skia.SkTileMode.Repeat;
                    break;
                case exports.PatternTile.ReflectVertical:
                    xTile = Skia.SkTileMode.Decal;
                    yTile = Skia.SkTileMode.Mirror;
                    break;
                case exports.PatternTile.Both:
                    xTile = Skia.SkTileMode.Repeat;
                    yTile = Skia.SkTileMode.Repeat;
                    break;
                case exports.PatternTile.ReflectBoth:
                    xTile = Skia.SkTileMode.Mirror;
                    yTile = Skia.SkTileMode.Mirror;
                    break;
                case exports.PatternTile.None:
                default:
                    xTile = Skia.SkTileMode.Decal;
                    yTile = Skia.SkTileMode.Decal;
                    break;
            }
            paint.shader = this._pattern.getPicture().makeShader(xTile, yTile, this._transform, this._rectangle);
            return true;
        }
        clone() {
            return new PatternBrush(this._pattern.clone(), this._opacity, this._tile, this._transform.clone(), this._rectangle ? this._rectangle.clone() : null);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class PointerBrush extends BaseBrush {
        constructor(brush, opacity = 1) {
            super(exports.BrushType.Pointer, opacity);
            this._pointer = brush;
        }
        get pointer() {
            return this._pointer;
        }
        preparePaint(paint) {
            if (this._pointer.preparePaint(paint)) {
                return super.preparePaint(paint);
            }
            return false;
        }
        clone() {
            return new PointerBrush(this._pointer, this._opacity);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.StrokeLineCap = void 0;
    (function (StrokeLineCap) {
        StrokeLineCap[StrokeLineCap["Butt"] = 0] = "Butt";
        StrokeLineCap[StrokeLineCap["Round"] = 1] = "Round";
        StrokeLineCap[StrokeLineCap["Square"] = 2] = "Square";
    })(exports.StrokeLineCap || (exports.StrokeLineCap = {}));
    exports.StrokeLineJoin = void 0;
    (function (StrokeLineJoin) {
        StrokeLineJoin[StrokeLineJoin["Miter"] = 0] = "Miter";
        StrokeLineJoin[StrokeLineJoin["Round"] = 1] = "Round";
        StrokeLineJoin[StrokeLineJoin["Bevel"] = 2] = "Bevel";
    })(exports.StrokeLineJoin || (exports.StrokeLineJoin = {}));
    exports.PenType = void 0;
    (function (PenType) {
        PenType[PenType["Default"] = 0] = "Default";
    })(exports.PenType || (exports.PenType = {}));
    class BasePen {
        constructor(brush = SolidBrush.BLACK, width = 1, lineCap = exports.StrokeLineCap.Butt, lineJoin = exports.StrokeLineJoin.Miter, miterLimit = 4, dashes = [], offset = 0) {
            this._brush = brush;
            this._width = width;
            this._lineCap = lineCap;
            this._lineJoin = lineJoin;
            this._miterLimit = miterLimit;
            this._dashes = dashes;
            this._offset = offset;
        }
        clone() {
            const ctor = this.constructor;
            // @ts-ignore
            return new ctor(this._brush.clone(), this._width, this._lineCap, this._lineJoin, this._miterLimit, this._dashes.slice(), this._offset);
        }
        get brush() {
            return this._brush;
        }
        set brush(value) {
            this._brush = value;
        }
        get width() {
            return this._width;
        }
        set width(value) {
            this._width = value;
        }
        get lineCap() {
            return this._lineCap;
        }
        set lineCap(value) {
            this._lineCap = value;
        }
        get lineJoin() {
            return this._lineJoin;
        }
        set lineJoin(value) {
            this._lineJoin = value;
        }
        get miterLimit() {
            return this._miterLimit;
        }
        set miterLimit(value) {
            this._miterLimit = value;
        }
        get dashes() {
            return this._dashes;
        }
        set dashes(value) {
            this._dashes = value;
        }
        get offset() {
            return this._offset;
        }
        set offset(value) {
            this._offset = value;
        }
        get isVisible() {
            return this._brush.isVisible && this._width > 0;
        }
        preparePaint(paint) {
            if (!this._brush.preparePaint(paint)) {
                return false;
            }
            paint.style = Skia.SkPaintStyle.Stroke;
            paint.strokeWidth = this._width;
            paint.strokeMiter = this._miterLimit;
            switch (this._lineJoin) {
                case exports.StrokeLineJoin.Bevel:
                    paint.strokeJoin = Skia.SkPaintStrokeJoin.Bevel;
                    break;
                case exports.StrokeLineJoin.Round:
                    paint.strokeJoin = Skia.SkPaintStrokeJoin.Round;
                    break;
                case exports.StrokeLineJoin.Miter:
                default:
                    paint.strokeJoin = Skia.SkPaintStrokeJoin.Miter;
                    break;
            }
            switch (this._lineCap) {
                case exports.StrokeLineCap.Square:
                    paint.strokeCap = Skia.SkPaintStrokeCap.Square;
                    break;
                case exports.StrokeLineCap.Round:
                    paint.strokeCap = Skia.SkPaintStrokeCap.Round;
                    break;
                case exports.StrokeLineCap.Butt:
                default:
                    paint.strokeCap = Skia.SkPaintStrokeCap.Butt;
                    break;
            }
            if (this._dashes.length > 0) {
                paint.pathEffect = Skia.SkPathEffect.MakeDash(this._dashes, this._offset);
            }
            return true;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class DefaultPen extends BasePen {
        get type() {
            return exports.PenType.Default;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Rectangle {
        constructor(x, y, width, height) {
            this.x = x;
            this.y = y;
            if (width < 0) {
                this.x += width;
                width = -width;
            }
            if (height < 0) {
                this.y += height;
                height = -height;
            }
            this.width = width;
            this.height = height;
            this.top = y;
            this.bottom = y + height;
            this.left = x;
            this.right = x + width;
        }
        clone() {
            return new Rectangle(this.x, this.y, this.width, this.height);
        }
        equals(other) {
            return (this.x === other.x &&
                this.y === other.y &&
                this.width === other.width &&
                this.height === other.height);
        }
        getPointFromPosition(x, y, ref) {
            // let's reuse cached points where available
            switch (y) {
                case exports.Position.Start:
                    switch (x) {
                        case exports.Position.Start:
                            return this.topLeft;
                        case exports.Position.End:
                            return this.topRight;
                        case exports.Position.Middle:
                            return this.topMiddle;
                        case exports.Position.None:
                            return ref ? new Point(ref.x, this.top) : null;
                    }
                    return null;
                case exports.Position.End:
                    switch (x) {
                        case exports.Position.Start:
                            return this.bottomLeft;
                        case exports.Position.End:
                            return this.bottomRight;
                        case exports.Position.Middle:
                            return this.bottomMiddle;
                        case exports.Position.None:
                            return ref ? new Point(ref.x, this.bottom) : null;
                    }
                    return null;
                case exports.Position.Middle:
                    switch (x) {
                        case exports.Position.Start:
                            return this.middleLeft;
                        case exports.Position.End:
                            return this.middleRight;
                        case exports.Position.Middle:
                            return this.middle;
                        case exports.Position.None:
                            return ref ? new Point(ref.x, this.middleY) : null;
                    }
                    return null;
                case exports.Position.None:
                    switch (x) {
                        case exports.Position.Start:
                            return new Point(this.left, ref.y);
                        case exports.Position.End:
                            return new Point(this.right, ref.y);
                        case exports.Position.Middle:
                            return new Point(this.middleX, ref.y);
                        case exports.Position.None:
                            return ref ? new Point(ref.x, ref.y) : null;
                    }
                    return null;
            }
            return null;
        }
        ensureMinSize(size) {
            if (this.width >= size.width && this.height >= size.height) {
                return this;
            }
            return new Rectangle(this.x, this.y, Math.max(this.width, size.width), Math.max(this.height, size.height));
        }
        intersects(other) {
            return !(this.right < other.left ||
                other.right < this.left ||
                this.bottom < other.top ||
                other.bottom < this.top);
        }
        containsPoint(point) {
            return this.contains(point.x, point.y);
        }
        contains(x, y) {
            return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
        }
        get middle() {
            if (!this._middle) {
                this._middle = new Point(this.x + this.width / 2, this.y + this.height / 2);
            }
            return this._middle;
        }
        get middleX() {
            return this.x + this.width / 2;
        }
        get middleY() {
            return this.y + this.height / 2;
        }
        get topMiddle() {
            return new Point(this.middleX, this.top);
        }
        get bottomMiddle() {
            return new Point(this.middleX, this.bottom);
        }
        get middleLeft() {
            return new Point(this.left, this.middleY);
        }
        get middleRight() {
            return new Point(this.right, this.middleY);
        }
        get topLeft() {
            if (!this._topLeft) {
                this._topLeft = new Point(this.left, this.top);
            }
            return this._topLeft;
        }
        get topRight() {
            if (!this._topRight) {
                this._topRight = new Point(this.right, this.top);
            }
            return this._topRight;
        }
        get bottomLeft() {
            if (!this._bottomLeft) {
                this._bottomLeft = new Point(this.left, this.bottom);
            }
            return this._bottomLeft;
        }
        get bottomRight() {
            if (!this._bottomRight) {
                this._bottomRight = new Point(this.right, this.bottom);
            }
            return this._bottomRight;
        }
        get isVisible() {
            return this.width > 0 && this.height > 0;
        }
        inset(x, y = x) {
            return this.outset(-x, -y);
        }
        get diagonal() {
            return Point.distance(this.topLeft, this.bottomRight);
        }
        outset(x, y = x) {
            return new Rectangle(this.x - x, this.y - y, this.width + 2 * x, this.height + 2 * y);
        }
        scale(x, y = x) {
            return this.outset(this.width * x / 2, this.height * y / 2);
        }
        shifted(dx, dy) {
            return new Rectangle(this.x + dx, this.y + dy, this.width, this.height);
        }
        transform(matrix, shifted = true) {
            if (!matrix || matrix.isIdentity) {
                return this;
            }
            return Rectangle.fromPoints(matrix.transformPoint(this.topLeft, shifted), matrix.transformPoint(this.topRight, shifted), matrix.transformPoint(this.bottomRight, shifted), matrix.transformPoint(this.bottomLeft, shifted));
        }
        static fromLTRBObject(o) {
            if (!o) {
                return Rectangle.ZERO;
            }
            return new Rectangle(o.left, o.top, o.right - o.left, o.bottom - o.top);
        }
        static fromLTRB(left, top, right, bottom) {
            return new Rectangle(left, top, right - left, bottom - top);
        }
        static fromSize(size, point = Point.ZERO) {
            return new Rectangle(point.x, point.y, size.width, size.height);
        }
        static fromTransformedPoints(matrix, ...points) {
            if (!matrix || matrix.isIdentity) {
                return this.fromPoints(...points);
            }
            if (points.length === 0) {
                return new Rectangle(0, 0, 0, 0);
            }
            let p = matrix.transformPoint(points[0]);
            let left = p.x;
            let top = p.y;
            let right = left;
            let bottom = top;
            for (let i = 1; i < points.length; i++) {
                p = matrix.transformPoint(points[i]);
                if (p.x < left) {
                    left = p.x;
                }
                else if (p.x > right) {
                    right = p.x;
                }
                if (p.y < top) {
                    top = p.y;
                }
                else if (p.y > bottom) {
                    bottom = p.y;
                }
            }
            return new Rectangle(left, top, right - left, bottom - top);
        }
        static fromPoints(...points) {
            if (points.length === 0) {
                return new Rectangle(0, 0, 0, 0);
            }
            let left = points[0].x;
            let top = points[0].y;
            let right = left;
            let bottom = top;
            for (let i = 1; i < points.length; i++) {
                const p = points[i];
                if (p.x < left) {
                    left = p.x;
                }
                else if (p.x > right) {
                    right = p.x;
                }
                if (p.y < top) {
                    top = p.y;
                }
                else if (p.y > bottom) {
                    bottom = p.y;
                }
            }
            return new Rectangle(left, top, right - left, bottom - top);
        }
        static merge(rects) {
            let left = Number.POSITIVE_INFINITY;
            let top = Number.POSITIVE_INFINITY;
            let right = Number.NEGATIVE_INFINITY;
            let bottom = Number.NEGATIVE_INFINITY;
            let r = null;
            for (r of rects) {
                if (r.left < left) {
                    left = r.left;
                }
                if (r.top < top) {
                    top = r.top;
                }
                if (r.right > right) {
                    right = r.right;
                }
                if (r.bottom > bottom) {
                    bottom = r.bottom;
                }
            }
            if (r === null) {
                return new Rectangle(0, 0, 0, 0);
            }
            return new Rectangle(left, top, right - left, bottom - top);
        }
    }
    Rectangle.ZERO = new Rectangle(0, 0, 0, 0);

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class EllipseShape {
        constructor(width = 0, height = 0) {
            this.width = width;
            this.height = height;
        }
        get type() {
            return "ellipse";
        }
        get oval() {
            const width = this.width / 2;
            const height = this.height / 2;
            return new Rectangle(-width, -height, width, height);
        }
        equals(other) {
            return this.width === other.width && this.height === other.height;
        }
        clone() {
            return new EllipseShape(this.width, this.height);
        }
        preparePath(path) {
            path.addEllipse(0, 0, this.width / 2, this.height / 2);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.PathJoint = void 0;
    (function (PathJoint) {
        PathJoint[PathJoint["Cusp"] = 0] = "Cusp";
        PathJoint[PathJoint["Corner"] = 1] = "Corner";
        PathJoint[PathJoint["Symmetric"] = 2] = "Symmetric";
        PathJoint[PathJoint["Asymmetric"] = 3] = "Asymmetric";
    })(exports.PathJoint || (exports.PathJoint = {}));
    exports.PathNodeType = void 0;
    (function (PathNodeType) {
        PathNodeType[PathNodeType["Node"] = 0] = "Node";
        PathNodeType[PathNodeType["ContourStart"] = 1] = "ContourStart";
        PathNodeType[PathNodeType["ContourEnd"] = 2] = "ContourEnd";
        PathNodeType[PathNodeType["ContourEndClosed"] = 3] = "ContourEndClosed";
    })(exports.PathNodeType || (exports.PathNodeType = {}));
    class PathNode {
        constructor(x, y, type = exports.PathNodeType.Node, joint = exports.PathJoint.Cusp, handleIn = null, handleOut = null) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.joint = joint;
            this.handleIn = handleIn;
            this.handleOut = handleOut;
        }
        moveBy(dx, dy) {
            if (dx === 0 && dy === 0) {
                return false;
            }
            this.x += dx;
            this.y += dy;
            if (this.handleIn) {
                this.handleIn = this.handleIn.shifted(dx, dy);
            }
            if (this.handleOut) {
                this.handleOut = this.handleOut.shifted(dx, dy);
            }
            return true;
        }
        transform(matrix) {
            if (matrix.isIdentity) {
                return false;
            }
            const p = matrix.transformPoint(this);
            this.x = p.x;
            this.y = p.y;
            if (this.handleIn) {
                this.handleIn = matrix.transformPoint(this.handleIn);
            }
            if (this.handleOut) {
                this.handleOut = matrix.transformPoint(this.handleOut);
            }
            return true;
        }
        equals(other) {
            return this.x === other.x
                && this.y === other.y
                && this.type === other.type
                && this.joint === other.joint
                && equals(this.handleIn, other.handleIn)
                && equals(this.handleOut, other.handleOut);
        }
        clone() {
            return new PathNode(this.x, this.y, this.type, this.joint, this.handleIn, this.handleOut);
        }
    }
    class Path {
        constructor(nodes) {
            this._bounds = null;
            this._path = null;
            this.nodes = nodes || [];
        }
        get type() {
            return 'path';
        }
        get isEmpty() {
            return this.nodes.length === 0 || this.path.isEmpty;
        }
        preparePath(path) {
            path.addPath(this.path);
        }
        get path() {
            if (!this._path) {
                this._path = nodesToSkPath(this.nodes);
            }
            return this._path;
        }
        get bounds() {
            if (!this._bounds) {
                this._bounds = Rectangle.fromLTRBObject(this.path.computeTightBounds());
            }
            return this._bounds;
        }
        get pathLength() {
            return this.path.length;
        }
        closeAllContours(closeWithLine) {
            // TODO:
            return false;
        }
        splitContoursIntoPaths() {
            const list = [];
            const nodes = this.nodes;
            const length = nodes.length;
            let start = null;
            for (let i = 0; i < length; i++) {
                if (nodes[i].type === exports.PathNodeType.ContourStart) {
                    start = i;
                    continue;
                }
                if (nodes[i].type < exports.PathNodeType.ContourEnd) {
                    continue;
                }
                list.push(new Path(nodes.slice(start, i + 1).map(node => node.clone())));
            }
            return list;
        }
        getPointAndAngleAtLength(length) {
            const pt = this.path.getPosTanAtLength(length);
            if (!pt) {
                return null;
            }
            return {
                x: pt.px,
                y: pt.py,
                angle: Math.atan2(pt.ty, pt.tx) * DEGREES,
            };
        }
        transform(matrix) {
            if (matrix.isIdentity) {
                return false;
            }
            this.nodes.forEach(node => node.transform(matrix));
            // transform internal path if needed
            if (this._path) {
                this._path.transform(matrix);
            }
            this._bounds = null;
            return true;
        }
        moveBy(dx, dy) {
            if (dx === 0 && dy === 0) {
                return false;
            }
            this.nodes.forEach(node => node.moveBy(dx, dy));
            if (this._path) {
                this._path.offset(dx, dy);
            }
            if (this._bounds) {
                this._bounds = this._bounds.shifted(dx, dy);
            }
            return true;
        }
        moveTo(x, y) {
            const bounds = this.bounds;
            if (bounds.x === x && bounds.y === y) {
                return false;
            }
            return this.moveBy(x - bounds.x, y - bounds.y);
        }
        equals(other) {
            const length = this.nodes.length;
            if (length !== other.nodes.length) {
                return false;
            }
            for (let i = 0; i < length; i++) {
                if (!this.nodes[i].equals(other.nodes[i])) {
                    return false;
                }
            }
            return true;
        }
        clone() {
            const path = new Path(this.nodes.map(node => node.clone()));
            // Rects are immutable, do not calc bounds again
            path._bounds = this._bounds;
            return path;
        }
        /**
         * Call this method to invalidate the path and bounds
         * You must call it only when you make direct changes to nodes (avoid doing that).
         */
        invalidate() {
            if (this._bounds) {
                this._bounds = null;
            }
            if (this._path) {
                this._path.delete();
                this._path = null;
            }
        }
        dispose() {
            this.invalidate();
            this.nodes.splice(0);
        }
        static fromSkPath(path, closeWithLine = true) {
            return new Path(nodesFromSkPath(path, closeWithLine));
        }
        static fromString(path, closeWithLine = true) {
            const skPath = Skia.SkPath.MakeFromString(path, false);
            const ret = this.fromSkPath(skPath, closeWithLine);
            // save the path object
            ret._path = skPath;
            return ret;
        }
    }
    function nodesToSkPath(nodes) {
        const length = nodes.length;
        let prev = null;
        let first = null;
        const path = new Skia.SkPath();
        for (let i = 0; i < length; i++) {
            const node = nodes[i];
            if (!prev || node.type === exports.PathNodeType.ContourStart) {
                path.moveTo(node.x, node.y);
                prev = node;
                first = node;
                continue;
            }
            drawCurve(path, prev, node);
            if (node.type >= exports.PathNodeType.ContourEnd) {
                drawCurve(path, node, first);
                if (node.type === exports.PathNodeType.ContourEndClosed) {
                    path.close();
                }
                first = prev = null;
            }
            else {
                prev = node;
            }
        }
        return path;
    }
    function drawCurve(path, from, to) {
        if (to.joint === exports.PathJoint.Corner || !to.handleIn) {
            if (from.joint === exports.PathJoint.Corner || !from.handleOut) {
                path.lineTo(to.x, to.y);
            }
            else {
                path.quadTo(to.x, to.y, from.handleOut.x, from.handleOut.y);
            }
        }
        else {
            if (from.joint === exports.PathJoint.Corner || !from.handleOut) {
                path.quadTo(to.x, to.y, to.handleIn.x, to.handleIn.y);
            }
            else {
                path.cubicTo(to.x, to.y, from.handleOut.x, from.handleOut.y, to.handleIn.x, to.handleIn.y);
            }
        }
    }
    function nodesFromSkPath(path, closeWithLine = true) {
        const nodes = [];
        let first = null;
        let last = null;
        path.walk((verb, p, cp1, cp2) => {
            switch (verb) {
                case Skia.SkPathVerb.Move:
                    if (last && last.type < exports.PathNodeType.ContourEnd) {
                        last.type = exports.PathNodeType.ContourEnd;
                    }
                    first = new PathNode(p.x, p.y, exports.PathNodeType.ContourStart, exports.PathJoint.Cusp);
                    last = first;
                    break;
                case Skia.SkPathVerb.Close:
                    if (last) {
                        if (closeWithLine && (last.x !== first.x || last.y !== first.y)) {
                            last = new PathNode(first.x, first.y, exports.PathNodeType.ContourEndClosed, exports.PathJoint.Corner);
                            first = null; // do not null last, so to new line will be added
                            break;
                        }
                        else {
                            last.type = exports.PathNodeType.ContourEndClosed;
                        }
                    }
                    first = last = null;
                    break;
                case Skia.SkPathVerb.Line:
                    last = new PathNode(p.x, p.y, exports.PathNodeType.Node, exports.PathJoint.Corner);
                    break;
                case Skia.SkPathVerb.Quad:
                    if (last) {
                        last.handleOut = new Point(cp1.x, cp1.y);
                    }
                    last = new PathNode(p.x, p.y, exports.PathNodeType.Node, exports.PathJoint.Cusp);
                    break;
                case Skia.SkPathVerb.Cubic:
                    if (last) {
                        last.handleOut = new Point(cp1.x, cp1.y);
                    }
                    last = new PathNode(p.x, p.y, exports.PathNodeType.Node, exports.PathJoint.Cusp, new Point(cp1.x, cp2.x), null);
                    break;
                default:
                    return;
            }
            if (last) {
                nodes.push(last);
            }
        }, false);
        return nodes;
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class PolyShape {
        constructor(points, isClosed = false) {
            this.points = points;
            this.isClosed = isClosed;
        }
        get type() {
            return "poly";
        }
        equals(other) {
            if (this.isClosed !== other.isClosed) {
                return false;
            }
            const length = this.points.length;
            if (other.points.length !== length) {
                return false;
            }
            for (let i = 0; i < length; i++) {
                if (!this.points[i].equals(other.points[i])) {
                    return false;
                }
            }
            return true;
        }
        clone() {
            return new PolyShape(this.points.slice(), this.isClosed);
        }
        get isLine() {
            return !this.isClosed && this.points.length === 2;
        }
        preparePath(path) {
            path.addPoly(this.points, this.isClosed);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function isGTZero(value) {
        return value > 0;
    }
    class RectShapeRadius {
        constructor(rx, ry, multiple = false) {
            this._rx = rx;
            this._ry = ry;
            this._multiple = multiple;
            this.fix();
        }
        equals(other) {
            if (this._multiple != other._multiple) {
                return false;
            }
            return equals(this._rx, other._rx) && equals(this._ry, other._ry);
        }
        get isRounded() {
            if (!this._multiple) {
                return this._rx > 0 || this._ry > 0;
            }
            return (this._rx.findIndex(isGTZero) !== -1
                ||
                    this._ry.findIndex(isGTZero) !== -1);
        }
        get multiple() {
            return this._multiple;
        }
        set multiple(value) {
            if (this._multiple !== value) {
                this._multiple = value;
                this.fix();
            }
        }
        get rx() {
            return this._rx;
        }
        set rx(value) {
            if (this._rx === value) {
                return;
            }
            const fix = typeof this._rx !== typeof value;
            this._rx = value;
            fix && this.fix();
        }
        get ry() {
            return this._ry;
        }
        set ry(value) {
            if (this._ry === value) {
                return;
            }
            const fix = typeof this._ry !== typeof value;
            this._ry = value;
            fix && this.fix();
        }
        clone() {
            return new RectShapeRadius(this._multiple && Array.isArray(this._rx) ? [...this._rx] : this._rx, this._multiple && Array.isArray(this._ry) ? [...this._ry] : this._ry, this._multiple);
        }
        fix() {
            const ax = Array.isArray(this._rx);
            const ay = Array.isArray(this._ry);
            if (this._multiple) {
                if (!ax) {
                    const r = this._rx;
                    this._rx = [r, r, r, r];
                }
                if (!ay) {
                    const r = this._ry;
                    this._ry = [r, r, r, r];
                }
            }
            else {
                if (ax) {
                    this._rx = this._rx[0];
                }
                if (ay) {
                    this._ry = this._ry[0];
                }
            }
        }
    }
    class RectShape {
        constructor(width = 1, height = 1, radius = null) {
            this.width = width;
            this.height = height;
            this.radius = radius || (new RectShapeRadius(0, 0, false));
        }
        get type() {
            return "rect";
        }
        get isRounded() {
            return this.radius.isRounded;
        }
        get oval() {
            return new Rectangle(0, 0, this.width, this.height);
        }
        equals(other) {
            if (this.width === other.width && this.height === other.height) {
                return this.radius.equals(other.radius);
            }
            return false;
        }
        clone() {
            return new RectShape(this.width, this.height, this.radius.clone());
        }
        preparePath(path) {
            if (!this.radius.isRounded) {
                path.addRect(0, 0, this.width, this.height);
                return;
            }
            const rx = this.radius.rx;
            const ry = this.radius.ry;
            if (!this.radius.multiple) {
                path.addRoundRect(this.oval, rx, ry);
                return;
            }
            path.addRRect({
                rect: this.oval,
                rx1: rx[0],
                ry1: ry[0],
                rx2: rx[1],
                ry2: ry[1],
                rx3: rx[2],
                ry3: ry[2],
                rx4: rx[3],
                ry4: ry[3],
            });
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class RegularPolygonShape {
        constructor(sides, radius, cornerRadius = 0, angle = 0) {
            this.sides = sides;
            this.radius = radius;
            this.cornerRadius = cornerRadius;
            this.angle = angle;
        }
        get type() {
            return "regular-polygon";
        }
        equals(other) {
            return this.sides === other.sides
                && this.radius === other.radius
                && this.cornerRadius === other.cornerRadius
                && this.angle === other.angle;
        }
        clone() {
            return new RegularPolygonShape(this.sides, this.radius, this.cornerRadius, this.angle);
        }
        preparePath(path) {
            path.addRegularPolygon(0, 0, this.radius, this.sides, this.cornerRadius, this.angle);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class StarShape {
        constructor(sides, outerRadius, innerRadius, outerCornerRadius = 0, innerCornerRadius = 0, outerRotate = 0, innerRotate = 0, angle = 0) {
            this.sides = sides;
            this.outerRadius = outerRadius;
            this.innerRadius = innerRadius;
            this.outerCornerRadius = outerCornerRadius;
            this.innerCornerRadius = innerCornerRadius;
            this.outerRotate = outerRotate;
            this.innerRotate = innerRotate;
            this.angle = angle;
        }
        get type() {
            return "star";
        }
        equals(other) {
            return this.sides === other.sides
                && this.outerRadius === other.outerRadius
                && this.innerRadius === other.innerRadius
                && this.outerCornerRadius === other.outerCornerRadius
                && this.innerCornerRadius === other.innerCornerRadius
                && this.outerRotate === other.outerRotate
                && this.innerRotate === other.innerRotate
                && this.angle === other.angle;
        }
        clone() {
            return new StarShape(this.sides, this.outerRadius, this.innerRadius, this.outerCornerRadius, this.innerCornerRadius, this.outerRotate, this.innerRotate, this.angle);
        }
        preparePath(path) {
            path.addStar(0, 0, this.outerRadius, this.innerRadius, this.sides, this.outerRotate, this.innerRotate, this.outerCornerRadius, this.innerCornerRadius, this.angle);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class ColorMatrix {
        constructor(value) {
            if (!value || value.length !== 20) {
                value = new Float32Array(20);
                value[0] = value[6] = value[12] = value[18] = 1;
            }
            this.value = value;
        }
        equals(other) {
            const length = this.value.length;
            if (other.value.length !== length) {
                return false;
            }
            for (let i = 0; i < length; i++) {
                if (this.value[i] !== other.value[i]) {
                    return false;
                }
            }
            return true;
        }
        /**
         * Creates a clone
         */
        clone() {
            return new ColorMatrix(this.value.slice());
        }
        /**
         * Resets matrix
         */
        toIdentity() {
            const v = this.value;
            v[0] = v[6] = v[12] = v[18] = 1;
            v[1] = v[2] = v[3] = v[4] =
                v[5] = v[7] = v[8] = v[9] =
                    v[10] = v[11] = v[13] = v[14] =
                        v[15] = v[16] = v[17] = v[19] = 0;
            return this;
        }
        /**
         * Pre multiply matrix
         * @param matrix
         */
        preMultiply(matrix) {
            multiplyArray(matrix instanceof ColorMatrix ? matrix.value : matrix, this.value, this.value);
            return this;
        }
        /**
         * Multiply matrix
         * @param matrix
         */
        multiply(matrix) {
            multiplyArray(this.value, matrix instanceof ColorMatrix ? matrix.value : matrix, this.value);
            return this;
        }
        /**
         * Brightness filter
         * @param v
         */
        brightness(v) {
            return this.multiply([
                v, 0, 0, 0, 0,
                0, v, 0, 0, 0,
                0, 0, v, 0, 0,
                0, 0, 0, 1, 0,
            ]);
        }
        luminanceToAlpha() {
            return this.multiply([
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0, 0, 0, 0, 0,
                0.2125, 0.7154, 0.0721, 0, 0
            ]);
        }
        /**
         * Grayscale filter
         * @param v
         */
        greyscale(v) {
            return this.multiply([
                v, v, v, 0, 0,
                v, v, v, 0, 0,
                v, v, v, 0, 0,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Hue-rotate filter
         * @param deg
         */
        hueRotate(deg) {
            deg *= RADIANS;
            const cosR = Math.cos(deg);
            const sinR = Math.sin(deg);
            const wCosR = (1 - cosR) / 3;
            const wSinR = sinR * Math.sqrt(3) / 3;
            return this.multiply([
                cosR + wCosR, wCosR - wSinR, wCosR + wSinR, 0, 0,
                wCosR + wSinR, cosR + wCosR, wCosR - wSinR, 0, 0,
                wCosR - wSinR, wCosR - wSinR, cosR + wCosR, 0, 0,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Contrast filter
         * @param v
         */
        contrast(v) {
            const o = -v / 2;
            v++;
            return this.multiply([
                v, 0, 0, 0, o,
                0, v, 0, 0, o,
                0, 0, v, 0, o,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Saturate filter
         * @param v
         */
        saturate(v) {
            const x = 1 + v * 2 / 3;
            const y = (1 - x) / 2;
            return this.multiply([
                x, y, y, 0, 0,
                y, x, y, 0, 0,
                y, y, x, 0, 0,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Desaturate filter
         * @param v
         */
        desaturate(v = 1) {
            return this.saturate(-v);
        }
        /**
         * Sepia filter
         * @param v
         */
        sepia(v) {
            return this.multiply([
                1 - 0.607 * v, 0.769 * v, 0.189 * v, 0, 0,
                0.349 * v, 1 - 0.314 * v, 0.168 * v, 0, 0,
                0.272 * v, 0.534 * v, 1 - 0.869 * v, 0, 0,
                0, 0, 0, 1, 0,
            ]);
        }
        // ---
        /**
         * Black and white
         */
        blackAndWhite() {
            return this.multiply([
                0.3, 0.6, 0.1, 0, 0,
                0.3, 0.6, 0.1, 0, 0,
                0.3, 0.6, 0.1, 0, 0,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Negative image (inverse of classic rgb matrix)
         */
        negative() {
            return this.multiply([
                -1, 0, 0, 1, 0,
                0, -1, 0, 1, 0,
                0, 0, -1, 1, 0,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Transforms : Red -> Blue and Blue -> Red
         */
        bgr() {
            return this.multiply([
                0, 0, 1, 0, 0,
                0, 1, 0, 0, 0,
                1, 0, 0, 0, 0,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Color motion picture process invented in 1916
         */
        technicolor() {
            return this.multiply([
                1.9125277891456083, -0.8545344976951645, -0.09155508482755585, 0, 11.793603434377337,
                -0.3087833385928097, 1.7658908555458428, -0.10601743074722245, 0, -70.35205161461398,
                -0.231103377548616, -0.7501899197440212, 1.847597816108189, 0, 30.950940869491138,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Polaroid filter
         */
        polaroid() {
            return this.multiply([
                1.438, -0.062, -0.062, 0, 0,
                -0.122, 1.378, -0.122, 0, 0,
                -0.016, -0.016, 1.483, 0, 0,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Color reversal film introduced by Eastman Kodak in 1935
         */
        kodachrome() {
            return this.multiply([
                1.1285582396593525, -0.3967382283601348, -0.03992559172921793, 0, 63.72958762196502,
                -0.16404339962244616, 1.0835251566291304, -0.05498805115633132, 0, 24.732407896706203,
                -0.16786010706155763, -0.5603416277695248, 1.6014850761964943, 0, 35.62982807460946,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Browni filter
         */
        browni() {
            return this.multiply([
                0.5997023498159715, 0.34553243048391263, -0.2708298674538042, 0, 47.43192855600873,
                -0.037703249837783157, 0.8609577587992641, 0.15059552388459913, 0, -36.96841498319127,
                0.24113635128153335, -0.07441037908422492, 0.44972182064877153, 0, -7.562075277591283,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Vintage filter
         */
        vintage() {
            return this.multiply([
                0.6279345635605994, 0.3202183420819367, -0.03965408211312453, 0, 9.651285835294123,
                0.02578397704808868, 0.6441188644374771, 0.03259127616149294, 0, 7.462829176470591,
                0.0466055556782719, -0.0851232987247891, 0.5241648018700465, 0, 5.159190588235296,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Color tone
         * @param desaturation
         * @param toned
         * @param lightColor
         * @param darkColor
         */
        colorTone(desaturation = 0.2, toned = 0.15, lightColor = 0xFFE580, darkColor = 0x338000) {
            const lR = ((lightColor >> 16) & 0xFF) / 255;
            const lG = ((lightColor >> 8) & 0xFF) / 255;
            const lB = (lightColor & 0xFF) / 255;
            const dR = ((darkColor >> 16) & 0xFF) / 255;
            const dG = ((darkColor >> 8) & 0xFF) / 255;
            const dB = (darkColor & 0xFF) / 255;
            return this.multiply([
                0.3, 0.59, 0.11, 0, 0,
                lR, lG, lB, desaturation, 0,
                dR, dG, dB, toned, 0,
                lR - dR, lG - dG, lB - dB, 0, 0,
            ]);
        }
        /**
         * Night effect
         * @param v
         */
        night(v = 0.1) {
            return this.multiply([
                -v * 2, -v, 0, 0, 0,
                -v, 0, v, 0, 0,
                0, v, v * 2, 0, 0,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * Predator effect
         * @param v
         */
        predator(v) {
            return this.multiply([
                11.224130630493164 * v, -4.794486999511719 * v, -2.8746118545532227 * v, 0, 0.40342438220977783 * v,
                -3.6330697536468506 * v, 9.193157196044922 * v, -2.951810836791992 * v, 0, -1.316135048866272 * v,
                -3.2184197902679443 * v, -4.2375030517578125 * v, 7.476448059082031 * v, 0, 0.8044459223747253 * v,
                0, 0, 0, 1, 0,
            ]);
        }
        /**
         * LSD effect
         */
        lsd() {
            return this.multiply([
                2, -0.4, 0.5, 0, 0,
                -0.5, 2, -0.4, 0, 0,
                -0.4, -0.5, 3, 0, 0,
                0, 0, 0, 1, 0,
            ]);
        }
        warm() {
            return this.multiply([
                1.06, 0, 0, 0, 0,
                0, 1.01, 0, 0, 0,
                0, 0, 0.93, 0, 0,
                0, 0, 0, 1, 0
            ]);
        }
        cool() {
            return this.multiply([
                0.99, 0, 0, 0, 0,
                0, 0.93, 0, 0, 0,
                0, 0, 1.08, 0, 0,
                0, 0, 0, 1, 0
            ]);
        }
        exposure(v) {
            return this.multiply([
                v, 0, 0, 0, 0,
                0, v, 0, 0, 0,
                0, 0, v, 0, 0,
                0, 0, 0, 1, 0
            ]);
        }
        temperature(v) {
            return this.multiply([
                1 + v, 0, 0, 0, 0,
                0, 1, 0, 0, 0,
                0, 0, 1 - v, 0, 0,
                0, 0, 0, 1, 0
            ]);
        }
        tint(v) {
            return this.multiply([
                1 + v, 0, 0, 0, 0,
                0, 1, 0, 0, 0,
                0, 0, 1 + v, 0, 0,
                0, 0, 0, 1, 0
            ]);
        }
        // ----
        protanomaly() {
            return this.multiply([
                0.817, 0.183, 0, 0, 0,
                0.333, 0.667, 0, 0, 0,
                0, 0.125, 0.875, 0, 0,
                0, 0, 0, 1, 0
            ]);
        }
        deuteranomaly() {
            return this.multiply([
                0.8, 0.2, 0, 0, 0,
                0.258, 0.742, 0, 0, 0,
                0, 0.142, 0.858, 0, 0,
                0, 0, 0, 1, 0
            ]);
        }
        protanopia() {
            return this.multiply([
                0.567, 0.433, 0, 0, 0,
                0.558, 0.442, 0, 0, 0,
                0, 0.242, 0.758, 0, 0,
                0, 0, 0, 1, 0
            ]);
        }
        deuteranopia() {
            return this.multiply([
                0.625, 0.375, 0, 0, 0,
                0.7, 0.3, 0, 0, 0,
                0, 0.3, 0.7, 0, 0,
                0, 0, 0, 1, 0
            ]);
        }
        tritanopia() {
            return this.multiply([
                0.95, 0.05, 0, 0, 0,
                0, 0.433, 0.567, 0, 0,
                0, 0.475, 0.525, 0, 0,
                0, 0, 0, 1, 0
            ]);
        }
        achromatopsia() {
            return this.multiply([
                0.299, 0.587, 0.114, 0, 0,
                0.299, 0.587, 0.114, 0, 0,
                0.299, 0.587, 0.114, 0, 0,
                0, 0, 0, 1, 0
            ]);
        }
        achromatomaly() {
            return this.multiply([
                0.618, 0.320, 0.062, 0, 0,
                0.163, 0.775, 0.062, 0, 0,
                0.163, 0.320, 0.516, 0, 0,
                0, 0, 0, 1, 0
            ]);
        }
    }
    function multiplyArray(left, right, dest) {
        // Red Channel
        dest[0] = (left[0] * right[0]) + (left[1] * right[5]) + (left[2] * right[10]) + (left[3] * right[15]);
        dest[1] = (left[0] * right[1]) + (left[1] * right[6]) + (left[2] * right[11]) + (left[3] * right[16]);
        dest[2] = (left[0] * right[2]) + (left[1] * right[7]) + (left[2] * right[12]) + (left[3] * right[17]);
        dest[3] = (left[0] * right[3]) + (left[1] * right[8]) + (left[2] * right[13]) + (left[3] * right[18]);
        dest[4] = (left[0] * right[4]) + (left[1] * right[9]) + (left[2] * right[14]) + (left[3] * right[19]) + left[4];
        // Green Channel
        dest[5] = (left[5] * right[0]) + (left[6] * right[5]) + (left[7] * right[10]) + (left[8] * right[15]);
        dest[6] = (left[5] * right[1]) + (left[6] * right[6]) + (left[7] * right[11]) + (left[8] * right[16]);
        dest[7] = (left[5] * right[2]) + (left[6] * right[7]) + (left[7] * right[12]) + (left[8] * right[17]);
        dest[8] = (left[5] * right[3]) + (left[6] * right[8]) + (left[7] * right[13]) + (left[8] * right[18]);
        dest[9] = (left[5] * right[4]) + (left[6] * right[9]) + (left[7] * right[14]) + (left[8] * right[19]) + left[9];
        // Blue Channel
        dest[10] = (left[10] * right[0]) + (left[11] * right[5]) + (left[12] * right[10]) + (left[13] * right[15]);
        dest[11] = (left[10] * right[1]) + (left[11] * right[6]) + (left[12] * right[11]) + (left[13] * right[16]);
        dest[12] = (left[10] * right[2]) + (left[11] * right[7]) + (left[12] * right[12]) + (left[13] * right[17]);
        dest[13] = (left[10] * right[3]) + (left[11] * right[8]) + (left[12] * right[13]) + (left[13] * right[18]);
        dest[14] = (left[10] * right[4]) + (left[11] * right[9]) + (left[12] * right[14]) + (left[13] * right[19]) + left[14];
        // Alpha Channel
        dest[15] = (left[15] * right[0]) + (left[16] * right[5]) + (left[17] * right[10]) + (left[18] * right[15]);
        dest[16] = (left[15] * right[1]) + (left[16] * right[6]) + (left[17] * right[11]) + (left[18] * right[16]);
        dest[17] = (left[15] * right[2]) + (left[16] * right[7]) + (left[17] * right[12]) + (left[18] * right[17]);
        dest[18] = (left[15] * right[3]) + (left[16] * right[8]) + (left[17] * right[13]) + (left[18] * right[18]);
        dest[19] = (left[15] * right[4]) + (left[16] * right[9]) + (left[17] * right[14]) + (left[18] * right[19]) + left[19];
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.BlendMode = void 0;
    (function (BlendMode) {
        BlendMode[BlendMode["Color"] = 0] = "Color";
        BlendMode[BlendMode["ColorBurn"] = 1] = "ColorBurn";
        BlendMode[BlendMode["ColorDodge"] = 2] = "ColorDodge";
        BlendMode[BlendMode["Darken"] = 3] = "Darken";
        BlendMode[BlendMode["Difference"] = 4] = "Difference";
        BlendMode[BlendMode["Exclusion"] = 5] = "Exclusion";
        BlendMode[BlendMode["HardLight"] = 6] = "HardLight";
        BlendMode[BlendMode["Hue"] = 7] = "Hue";
        BlendMode[BlendMode["Lighten"] = 8] = "Lighten";
        BlendMode[BlendMode["Luminosity"] = 9] = "Luminosity";
        BlendMode[BlendMode["Multiply"] = 10] = "Multiply";
        BlendMode[BlendMode["Normal"] = 11] = "Normal";
        BlendMode[BlendMode["Overlay"] = 12] = "Overlay";
        BlendMode[BlendMode["Saturation"] = 13] = "Saturation";
        BlendMode[BlendMode["Screen"] = 14] = "Screen";
        BlendMode[BlendMode["SoftLight"] = 15] = "SoftLight";
    })(exports.BlendMode || (exports.BlendMode = {}));
    class Composition {
        constructor(blend = exports.BlendMode.Normal, opacity = 1, isolate = false) {
            this.blend = blend;
            this.opacity = clamp(opacity, 0, 1);
            this.isolate = isolate;
        }
        clone() {
            return new Composition(this.blend, this.opacity, this.isolate);
        }
        get needsLayer() {
            return this.isolate || this.opacity !== 1 || this.blend !== exports.BlendMode.Normal;
        }
        get isVisible() {
            return this.opacity > 0;
        }
        preparePaint(paint) {
            if (!this.needsLayer) {
                return false;
            }
            paint.isAntiAlias = true;
            paint.alpha = this.opacity;
            switch (this.blend) {
                case exports.BlendMode.Color:
                    paint.blendMode = Skia.SkBlendMode.Color;
                    break;
                case exports.BlendMode.ColorBurn:
                    paint.blendMode = Skia.SkBlendMode.ColorBurn;
                    break;
                case exports.BlendMode.ColorDodge:
                    paint.blendMode = Skia.SkBlendMode.ColorDodge;
                    break;
                case exports.BlendMode.Darken:
                    paint.blendMode = Skia.SkBlendMode.Darken;
                    break;
                case exports.BlendMode.Difference:
                    paint.blendMode = Skia.SkBlendMode.Difference;
                    break;
                case exports.BlendMode.Exclusion:
                    paint.blendMode = Skia.SkBlendMode.Exclusion;
                    break;
                case exports.BlendMode.HardLight:
                    paint.blendMode = Skia.SkBlendMode.HardLight;
                    break;
                case exports.BlendMode.Hue:
                    paint.blendMode = Skia.SkBlendMode.Hue;
                    break;
                case exports.BlendMode.Lighten:
                    paint.blendMode = Skia.SkBlendMode.Lighten;
                    break;
                case exports.BlendMode.Luminosity:
                    paint.blendMode = Skia.SkBlendMode.Luminosity;
                    break;
                case exports.BlendMode.Multiply:
                    paint.blendMode = Skia.SkBlendMode.Multiply;
                    break;
                case exports.BlendMode.Normal:
                    paint.blendMode = Skia.SkBlendMode.SrcOver;
                    break;
                case exports.BlendMode.Overlay:
                    paint.blendMode = Skia.SkBlendMode.Overlay;
                    break;
                case exports.BlendMode.Saturation:
                    paint.blendMode = Skia.SkBlendMode.Saturation;
                    break;
                case exports.BlendMode.Screen:
                    paint.blendMode = Skia.SkBlendMode.Screen;
                    break;
                case exports.BlendMode.SoftLight:
                    paint.blendMode = Skia.SkBlendMode.SoftLight;
                    break;
            }
            return true;
        }
        equals(other) {
            return this.blend === other.blend
                && this.opacity === other.opacity
                && this.isolate === other.isolate;
        }
    }
    Composition.NormalComposition = new Composition(exports.BlendMode.Normal, 1);
    Composition.NormalIsolatedComposition = new Composition(exports.BlendMode.Normal, 1, true);

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class DrawingContext {
        constructor(canvas, matrix = new Matrix(), surface = null) {
            this._stack = [];
            this._paint = null;
            this._canvas = canvas;
            this._matrix = matrix;
            this._paint = new Skia.SkPaint();
            this._canvas.setMatrix(matrix);
            this._surface = surface;
        }
        get canvas() {
            return this._canvas;
        }
        get paint() {
            return this._paint;
        }
        get surface() {
            return this._surface;
        }
        dispose() {
            // Do not delete canvas
            this._canvas = null;
            this._surface = null;
            this._stack.splice(0);
            this._matrix.toIdentity();
            if (this._paint) {
                this._paint.delete();
                this._paint = null;
            }
        }
        get matrix() {
            return this._matrix;
        }
        set matrix(value) {
            this._matrix = value;
            this._canvas.setMatrix(value);
        }
        multiplyMatrix(matrix) {
            if (!matrix.isIdentity) {
                this.matrix = this._matrix.multiply(matrix);
            }
        }
        translate(x, y) {
            if (x || y) {
                this.matrix = this._matrix.translate(x, y);
            }
        }
        clipSize(size, point = Point.ZERO) {
            this._canvas.clipRect(Rectangle.fromSize(size, point), Skia.SkClipOp.Intersect, true);
        }
        clipRect(rectangle) {
            this._canvas.clipRect(rectangle, Skia.SkClipOp.Intersect, true);
        }
        clipPath(path) {
            this._canvas.clipPath(getNativePath(path), Skia.SkClipOp.Intersect, true);
        }
        clear(color) {
            this._canvas.clear(color.code);
        }
        drawRect(rect, paint) {
            if (!paint.isVisible) {
                return;
            }
            const nativePaint = this._paint;
            if (paint.preparePaint(nativePaint)) {
                this._canvas.drawRect(rect.left, rect.top, rect.right, rect.bottom, nativePaint);
            }
            nativePaint.reset();
        }
        drawCircle(center, radius, paint) {
            if (!paint.isVisible) {
                return;
            }
            const nativePaint = this._paint;
            if (paint.preparePaint(nativePaint)) {
                this._canvas.drawCircle(center.x, center.y, radius, nativePaint);
            }
            nativePaint.reset();
        }
        drawText(text, paint, font, anchor = Point.ZERO) {
            if (!paint.isVisible) {
                return;
            }
            const nativePaint = this._paint;
            if (paint.preparePaint(nativePaint)) {
                if (typeof text === 'string') {
                    this._canvas.drawText(text, nativePaint, font.nativeFont, Skia.SkTextEncoding.UTF8, anchor.x, anchor.y);
                }
                else {
                    this._canvas.drawGlyphs(text, nativePaint, font.nativeFont, true, anchor.x, anchor.y);
                }
            }
            nativePaint.reset();
        }
        drawLine(from, to, paint) {
            if (!paint.isVisible) {
                return;
            }
            const nativePaint = this._paint;
            if (paint.preparePaint(nativePaint)) {
                this._canvas.drawLine(from, to, nativePaint);
            }
            nativePaint.reset();
        }
        drawImage(image, dx = 0, dy = 0, composition) {
            if (!composition) {
                this._canvas.drawImage(image, dx, dy);
                return;
            }
            if (!composition.isVisible) {
                return;
            }
            const nativePaint = this._paint;
            if (composition.preparePaint(nativePaint)) {
                this._canvas.drawImage(image, dx, dy, nativePaint);
            }
            else {
                this._canvas.drawImage(image, dx, dy);
            }
            nativePaint.reset();
        }
        drawPicture(picture, composition) {
            if (!composition) {
                this._canvas.drawPicture(picture);
                return;
            }
            if (!composition.isVisible) {
                return;
            }
            const nativePaint = this._paint;
            if (composition.preparePaint(nativePaint)) {
                this._canvas.drawPicture(picture, nativePaint);
            }
            else {
                this._canvas.drawPicture(picture);
            }
            nativePaint.reset();
        }
        drawPath(path, paint) {
            if (path.isEmpty || !paint.isVisible) {
                return;
            }
            const nativePaint = this._paint;
            if (paint.preparePaint(nativePaint)) {
                this._canvas.drawPath(getNativePath(path), nativePaint);
            }
            nativePaint.reset();
        }
        flush() {
            this._surface?.flush();
        }
        restore() {
            if (this._stack.length === 0) {
                return;
            }
            this._canvas.restore();
            // canvas matrix is auto-restored
            this._matrix = this._stack.pop();
        }
        save() {
            this._canvas.save();
            this._stack.push(this._matrix.clone());
        }
        getStrokePath(path, pen) {
            let ret = null;
            const nativePaint = this._paint;
            if (pen.preparePaint(nativePaint)) {
                ret = getNativePath(path).getFilled(nativePaint);
            }
            nativePaint.reset();
            return ret;
        }
    }
    function getNativePath(path) {
        return path instanceof Path ? path.path : path;
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.FontStyle = void 0;
    (function (FontStyle) {
        FontStyle[FontStyle["Normal"] = 0] = "Normal";
        FontStyle[FontStyle["Italic"] = 1] = "Italic";
    })(exports.FontStyle || (exports.FontStyle = {}));
    exports.FontWeight = void 0;
    (function (FontWeight) {
        FontWeight[FontWeight["Invisible"] = 0] = "Invisible";
        FontWeight[FontWeight["Thin"] = 100] = "Thin";
        FontWeight[FontWeight["ExtraLight"] = 200] = "ExtraLight";
        FontWeight[FontWeight["Light"] = 300] = "Light";
        FontWeight[FontWeight["Normal"] = 400] = "Normal";
        FontWeight[FontWeight["Medium"] = 500] = "Medium";
        FontWeight[FontWeight["SemiBold"] = 600] = "SemiBold";
        FontWeight[FontWeight["Bold"] = 700] = "Bold";
        FontWeight[FontWeight["ExtraBold"] = 800] = "ExtraBold";
        FontWeight[FontWeight["Black"] = 900] = "Black";
        FontWeight[FontWeight["ExtraBlack"] = 1000] = "ExtraBlack";
    })(exports.FontWeight || (exports.FontWeight = {}));
    class Font {
        constructor(typeface, size = 16) {
            this.font = null;
            this.typeface = typeface;
            this._size = size;
            this.style = typeface.isItalic ? exports.FontStyle.Italic : exports.FontStyle.Normal;
            this.weight = typeface.fontStyle.weight;
        }
        get size() {
            return this._size;
        }
        set size(value) {
            this._size = value;
            if (this.font) {
                this.font.size = value;
            }
        }
        get nativeFont() {
            if (!this.font) {
                let f = this.font = new Skia.SkFont(this.typeface, this._size);
                f.hinting = Skia.SkFontHinting.Normal;
                f.edging = Skia.SkFontEdging.SubpixelAntiAlias;
                f.isSubpixel = true;
            }
            return this.font;
        }
        convertTextToGlyphs(text) {
            return this.nativeFont.textToGlyphs(text);
        }
        getGlyphsBounds(glyphs) {
            return Rectangle.fromLTRBObject(this.nativeFont.measureBounds(glyphs));
        }
        getTextBounds(text) {
            return Rectangle.fromLTRBObject(this.nativeFont.measureTextBounds(text, Skia.SkTextEncoding.UTF8));
        }
        equals(other) {
            return this.style === other.style
                && this.weight === other.weight
                && this.family === other.family
                && this.size === other.size;
        }
        clone() {
            return new Font(this.typeface.clone(), this._size);
        }
        dispose() {
            if (this.typeface) {
                this.typeface.delete();
                this.typeface = null;
            }
            if (this.font) {
                this.font.delete();
                this.font = null;
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class FontManagerImpl {
        constructor() {
            this.typefaces = new Set();
            this.defaultTypeface = null;
        }
        registerTypeface(typeface, asDefault = false) {
            this.typefaces.add(typeface);
            if (asDefault) {
                this.defaultTypeface = typeface;
            }
        }
        getFont(family, style = exports.FontStyle.Normal, weight = exports.FontWeight.Normal, size = 16) {
            // TODO: this must be reviewed
            for (const typeface of this.typefaces) {
                if (typeface.familyName === family) {
                    return new Font(typeface.clone(), size);
                }
            }
            return this.getDefaultFont(size);
        }
        getDefaultFont(size = 16) {
            // we always assume that a default typeface exist
            return new Font(this.defaultTypeface.clone(), size);
        }
        dispose() {
            this.defaultTypeface = null;
            for (const typeface of this.typefaces) {
                typeface.delete();
            }
            this.typefaces.clear();
        }
    }
    const FontManager = new FontManagerImpl();

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Size {
        constructor(width, height) {
            this.width = width;
            this.height = height;
        }
        equals(other) {
            return this.width === other.width && this.height === other.height;
        }
        clone() {
            return new Size(this.width, this.height);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const MAX_ZOOM = 100;
    const MIN_ZOOM = 1 / MAX_ZOOM;
    class ViewBox {
        constructor(onChange) {
            this._matrix = new Matrix();
            this._pan = { x: 0, y: 0 };
            this._zoom = 1;
            this.hash = 0;
            this._onChange = onChange;
        }
        dispose() {
            this._onChange = null;
            this._matrix = null;
            this._pan = null;
        }
        get matrix() {
            return this._matrix;
        }
        get pan() {
            return this._pan;
        }
        set pan(value) {
            if (this._pan.x !== value.x && this._pan.y !== value.y) {
                this._pan.x = value.x;
                this._pan.y = value.y;
                this._updateMatrix();
            }
        }
        get zoom() {
            return this._zoom;
        }
        set zoom(value) {
            this.panAndZoom(this._pan, value);
        }
        panBy(delta) {
            if (delta.x === 0 && delta.y === 0) {
                return false;
            }
            this._pan.x += delta.x;
            this._pan.y += delta.y;
            this._updateMatrix();
            return true;
        }
        panAndZoom(pan, zoom) {
            zoom = clamp(zoom, MIN_ZOOM, MAX_ZOOM);
            if (this._zoom === zoom && this._pan.x === pan.x && this._pan.y === pan.y) {
                return false;
            }
            this._zoom = zoom;
            this._pan.x = pan.x;
            this._pan.y = pan.y;
            this._updateMatrix();
            return true;
        }
        getPointPosition(point) {
            return this._matrix.transformInversePoint(point);
        }
        getRectangleFromPoints(...points) {
            return Rectangle.fromTransformedPoints(this._matrix, ...points);
        }
        getLineWidth(value = 1) {
            return value / this._zoom;
        }
        zoomFit(rectangle, screen, margin = 0) {
            margin *= 2;
            const zoom = Math.min((screen.width - margin) / rectangle.width, (screen.height - margin) / rectangle.height);
            return this.panAndZoom({
                x: (screen.width - rectangle.width * zoom) / 2,
                y: (screen.height - rectangle.height * zoom) / 2
            }, zoom);
        }
        zoomByCoefficient(position, value) {
            const zoom = this._zoom;
            value = clamp(zoom * value, MIN_ZOOM, MAX_ZOOM);
            if (value === zoom) {
                // same zoom
                return false;
            }
            this._zoom = value;
            const pan = this._pan;
            pan.x = position.x + value * (pan.x - position.x) / zoom;
            pan.y = position.y + value * (pan.y - position.y) / zoom;
            this._updateMatrix();
            return true;
        }
        reset() {
            this._pan.x = this._pan.y = 0;
            this._zoom = 1;
            this._updateMatrix();
        }
        _updateMatrix() {
            this._matrix.toIdentity().panZoom(this._pan, this._zoom);
            this.hash++;
            this._onChange && this._onChange();
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Node {
        constructor(document, id) {
            this._id = null;
            this._title = null;
            this._isDrawing = false;
            this._parent = null;
            this._next = null;
            this._prev = null;
            this._first = null;
            this._last = null;
            this._localBounds = null;
            this._localTightBounds = null;
            this._globalBounds = null;
            this._globalTightBounds = null;
            this._pictureCache = null;
            this._globalMatrix = null;
            this._localMatrix = null;
            this._document = document;
            this._id = id;
            if (document && id == null) {
                this._id = document.generateUniqueId();
            }
        }
        /**
         * Flag that indicates if drawing is in progress
         * You can use this flag to check for circular-references and abort drawing
         */
        get isDrawing() {
            return this._isDrawing;
        }
        /**
         * Unique element id
         */
        get id() {
            return this._id;
        }
        get title() {
            return this._title;
        }
        set title(value) {
            this._title = value;
        }
        get document() {
            return this._document;
        }
        get parent() {
            return this._parent;
        }
        get firstChild() {
            return this._first;
        }
        get lastChild() {
            return this._last;
        }
        get nextSibling() {
            return this._next;
        }
        get previousSibling() {
            return this._prev;
        }
        get hasChildren() {
            return this._first != null;
        }
        /**
         * Checks if this node has child/deep-child
         */
        contains(node) {
            if (node === this) {
                return false;
            }
            do {
                node = node._parent;
                if (node === this) {
                    return true;
                }
            } while (node != null);
            return false;
        }
        /**
         * Local bounds with local transform applied
         */
        get transformedBounds() {
            return this.localBounds.transform(this.localMatrix);
        }
        /**
         * Local tight bounds with local transform applied
         */
        get transformedTightBounds() {
            return this.localTightBounds.transform(this.localMatrix);
        }
        /**
         * Bounds without transform applied
         */
        get localBounds() {
            if (this._localBounds === null) {
                this._localBounds = Rectangle.merge(this.childrenPropertyIterator('transformedBounds'));
            }
            return this._localBounds;
        }
        /**
         * Tight bounds without transform applied
         */
        get localTightBounds() {
            if (this._localTightBounds === null) {
                this._localTightBounds = Rectangle.merge(this.childrenPropertyIterator('transformedTightBounds'));
            }
            return this._localTightBounds;
        }
        /**
         * Bounds with global transform applied
         */
        get globalBounds() {
            if (this._globalBounds === null) {
                this._globalBounds = Rectangle.merge(this.childrenPropertyIterator('globalBounds'));
            }
            return this._globalBounds;
        }
        /**
         * Tight bounds with global transform applied
         */
        get globalTightBounds() {
            if (this._globalTightBounds === null) {
                this._globalTightBounds = Rectangle.merge(this.childrenPropertyIterator('globalTightBounds'));
            }
            return this._globalTightBounds;
        }
        /**
         * Matrix of this element
         */
        get localMatrix() {
            if (this._localMatrix === null) {
                this._localMatrix = this.getLocalMatrix();
            }
            return this._localMatrix;
        }
        /**
         * Full matrix to this element
         */
        get globalMatrix() {
            if (this._globalMatrix === null) {
                const local = this.localMatrix;
                if (!this._parent) {
                    return this._globalMatrix = local;
                }
                const global = this._parent.globalMatrix;
                if (global.isIdentity) {
                    return this._globalMatrix = local;
                }
                return this._globalMatrix = global.clone().multiply(local);
            }
            return this._globalMatrix;
        }
        /**
         * Invoke when the "picture" changed (shape, color, etc.)
         * This will also invoke parent.invalidate()
         * Do NOT invoke when the matrix (local or global) has changed
         */
        invalidate() {
            if (this._pictureCache !== null) {
                this._pictureCache.delete();
                this._pictureCache = null;
            }
            if (this._parent != null) {
                this._parent.invalidate();
            }
        }
        /**
         * Invoke when the matrix of an ancestor has changed
         * This is also invoke invalidateGlobalMatrix() for every children
         */
        invalidateGlobalMatrix() {
            this._globalMatrix = null;
            this._globalBounds = null;
            this._globalTightBounds = null;
            for (let n = this._first; n !== null; n = n._next) {
                if (n._globalMatrix !== null) {
                    n.invalidateGlobalMatrix();
                }
            }
        }
        /**
         * Invoke when local matrix has changed
         * This is also:
         *   - invoke invalidateGlobalMatrix() for every children
         *   - invoke invalidateBoundsAndPicture(true)
         * @protected
         */
        invalidateLocalMatrix() {
            if (this._globalMatrix !== null) {
                this.invalidateGlobalMatrix();
            }
            this._localMatrix = null;
            // Invalidate parent's picture, so he can draw us with the new local matrix
            this.invalidateBoundsAndPicture(true);
        }
        /**
         * Invoked by invalidateLocalMatrix()
         * This is a helper for: invalidateBounds() + invalidate()
         * @protected
         */
        invalidateBoundsAndPicture(parentPictureOnly = false) {
            // Invalidate all bounds
            this._localBounds = null;
            this._localTightBounds = null;
            this._globalBounds = null;
            this._globalTightBounds = null;
            if (this._parent !== null) {
                this._parent.invalidateBoundsAndPicture();
            }
            // Remove self picture
            if (!parentPictureOnly) {
                if (this._pictureCache !== null) {
                    this._pictureCache.delete();
                    this._pictureCache = null;
                }
            }
        }
        /**
         * Draws contents of the element into a picture
         */
        getPicture() {
            this._isDrawing = true;
            if (this._pictureCache === null) {
                const bounds = this.pictureBounds;
                const recorder = new Skia.SkPictureRecorder();
                const context = new DrawingContext(recorder.beginRecording(bounds));
                const newBounds = this.drawOnPicture(context, bounds);
                this._pictureCache = newBounds
                    ? recorder.finishRecordingAsPicture(newBounds)
                    : recorder.finishRecordingAsPicture(bounds);
                recorder.delete();
                context.dispose();
            }
            this._isDrawing = false;
            return this._pictureCache;
        }
        insertAfter(node, target) {
            if (target._next !== null) {
                return this.insertBefore(node, target._next);
            }
            return this.appendChild(node);
        }
        insertBefore(node, target) {
            if (!this.supportsChildren) {
                throw new Error("Children are not supported");
            }
            if (target._parent !== this || node.contains(this)) {
                throw new Error('Invalid target');
            }
            if (node._parent) {
                if (node._parent === this && node._next === target) {
                    // Already in the right place
                    return node;
                }
                // We wrap here because we don't want to invalidate twice
                Node.preventInvalidation(node._parent.removeChild, node._parent, node);
            }
            this._document.adoptNode(node);
            node._parent = this.isElement ? this : this._document;
            const prev = target._prev;
            target._prev = node;
            node._next = target;
            node._prev = prev;
            if (prev) {
                prev._next = node;
            }
            else {
                this._first = node;
            }
            this._document.notifyTreeChanged();
            if (!Node.invalidationPrevented) {
                node.invalidateGlobalMatrix();
                this.invalidateBoundsAndPicture();
            }
            return node;
        }
        appendChild(node) {
            if (!this.supportsChildren) {
                throw new Error("Children are not supported");
            }
            if (node === this || node.contains(this)) {
                throw new Error('Invalid node');
            }
            if (node._parent) {
                // We wrap here because we don't want to invalidate twice
                Node.preventInvalidation(node._parent.removeChild, node._parent, node);
            }
            this._document.adoptNode(node);
            node._parent = this.isElement ? this : this._document;
            if (this._last) {
                this._last._next = node;
                node._prev = this._last;
            }
            this._last = node;
            if (!this._first) {
                this._first = node;
            }
            this._document.notifyTreeChanged();
            if (!Node.invalidationPrevented) {
                node.invalidateGlobalMatrix();
                this.invalidateBoundsAndPicture();
            }
            return node;
        }
        prependChild(node) {
            if (this._first) {
                return this.insertBefore(node, this._first);
            }
            return this.appendChild(node);
        }
        removeChild(node) {
            if (!this.supportsChildren) {
                throw new Error("Children are not supported");
            }
            if (node === this || node._parent !== this) {
                throw new Error('Invalid node');
            }
            if (this._first === node) {
                if (this._last === node) {
                    this._first = this._last = null;
                }
                else {
                    this._first = node._next;
                    this._first._prev = null;
                }
            }
            else if (this._last === node) {
                this._last = node._prev;
                this._last._next = null;
            }
            else {
                node._next._prev = node._prev;
                node._prev._next = node._next;
            }
            node._parent = node._next = node._prev = null;
            this._document.notifyTreeChanged();
            if (!Node.invalidationPrevented) {
                this.invalidateBoundsAndPicture();
            }
            return node;
        }
        clone(newId = false) {
            const clone = this.cloneCurrent(newId);
            // Clone title
            clone._title = this._title;
            // Clone matrix
            clone._localMatrix = this._localMatrix ? this._localMatrix.clone() : null;
            clone._globalMatrix = this._globalMatrix ? this._globalMatrix.clone() : null;
            // Also save bounds to prevent recomputing
            clone._localBounds = this._localBounds;
            clone._localTightBounds = this._localTightBounds;
            clone._globalBounds = this._globalBounds;
            clone._globalTightBounds = this._globalTightBounds;
            // // We can save picture-cache clone
            // if (this._pictureCache) {
            //     clone._pictureCache = this._pictureCache.clone();
            // }
            // Clone children
            if (this.hasChildren) {
                Node.preventInvalidation(() => {
                    for (const child of this.children()) {
                        clone.appendChild(child.clone(newId));
                    }
                });
            }
            return clone;
        }
        dispose() {
            // Remove picture cache
            if (this._pictureCache !== null) {
                this._pictureCache.delete();
                this._pictureCache = null;
            }
            // Remove other objects cache
            this._globalMatrix = null;
            this._localMatrix = null;
            this._globalBounds = null;
            this._globalTightBounds = null;
            this._localBounds = null;
            this._localTightBounds = null;
            // Collect children
            const children = Array.from(this.children());
            // Dispose children
            for (let i = 0, l = children.length; i < l; i++) {
                children[i].dispose();
            }
            // Remove links
            this._document = null;
            this._parent = this._prev = this._next = this._first = this._last = null;
        }
        *[Symbol.iterator]() {
            for (let node = this._first; node != null; node = node._next) {
                yield node;
            }
        }
        *children(reverse = false) {
            if (reverse) {
                for (let node = this._last; node != null; node = node._prev) {
                    yield node;
                }
            }
            else {
                for (let node = this._first; node != null; node = node._next) {
                    yield node;
                }
            }
        }
        /**
         * True if this node is an Element
         */
        get isElement() {
            return false;
        }
        /**
         * Bounds (without transform) where paint is allowed
         * @protected
         */
        get pictureBounds() {
            if (this.supportsChildren) {
                // @ts-ignore
                return Rectangle.merge(this.childrenPropertyIterator('transformedPictureBounds'));
            }
            return this.localBounds;
        }
        /**
         * Bounds with local transform applied
         */
        get transformedPictureBounds() {
            return this.pictureBounds.transform(this.localMatrix);
        }
        /**
         * Draws the element
         * @param context
         * @param bounds Current bounds
         * @return If this functions returns a rect => overwrites picture bounds
         * @protected
         */
        drawOnPicture(context, bounds) {
            for (let node = this._first; node != null; node = node._next) {
                node.draw(context);
            }
        }
        *childrenPropertyIterator(prop) {
            for (let node = this._first; node != null; node = node._next) {
                yield node[prop];
            }
        }
        static preventInvalidation(f, ctx, data) {
            this.invalidationPrevented++;
            try {
                f.call(ctx, data);
            }
            finally {
                this.invalidationPrevented--;
            }
        }
    }
    Node.invalidationPrevented = 0;

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.Orientation = void 0;
    (function (Orientation) {
        Orientation[Orientation["None"] = 0] = "None";
        Orientation[Orientation["Auto"] = 1] = "Auto";
        Orientation[Orientation["AutoReverse"] = -1] = "AutoReverse";
    })(exports.Orientation || (exports.Orientation = {}));
    class Element extends Node {
        constructor(document, id) {
            super(document, id);
            // Element
            this._locked = false;
            this._hidden = false;
            // Transform
            this._position = Point.ZERO;
            this._anchor = Point.ZERO;
            this._scale = Point.UNIT;
            this._skewAngle = 0;
            this._skewAxis = 0;
            this._rotate = 0;
            this._orientation = exports.Orientation.None;
            this._autoOrientAngle = 0;
            // Composition
            this._blendMode = exports.BlendMode.Normal;
            this._opacity = 1;
            this._isolate = false;
            this._composition = null;
        }
        get isElement() {
            return true;
        }
        /**
         * True if element cannot be selected with mouse
         */
        get locked() {
            return this._locked;
        }
        set locked(value) {
            if (value !== this._locked) {
                this._locked = value;
            }
        }
        /**
         * True if element should net be rendered
         */
        get hidden() {
            return this._hidden;
        }
        set hidden(value) {
            if (value !== this._hidden) {
                this._hidden = value;
                this.invalidate();
            }
        }
        bringForward() {
            if (!this._next || !this._parent) {
                return false;
            }
            this._parent.insertAfter(this, this._next);
            return true;
        }
        sendBackward() {
            if (!this._prev || !this._parent) {
                return false;
            }
            this._parent.insertBefore(this, this._prev);
            return true;
        }
        bringToFront() {
            if (!this._next || !this._parent) {
                return false;
            }
            this._parent.insertAfter(this, this._parent.lastChild);
            return true;
        }
        sendToBack() {
            if (!this._prev || !this._parent) {
                return false;
            }
            this._parent.insertBefore(this, this._parent.firstChild);
            return true;
        }
        remove() {
            if (!this._parent) {
                return false;
            }
            this._parent.removeChild(this);
            return true;
        }
        // Transforms
        getLocalMatrix() {
            const matrix = new Matrix();
            matrix
                .translate(this._position.x, this._position.y)
                .rotate(this._rotate + this.autoOrientAngle)
                .skewAxis(this._skewAngle, this._skewAxis)
                .scale(this._scale.x, this._scale.y)
                .translate(-this._anchor.x, -this._anchor.y);
            return matrix;
        }
        get anchor() {
            return this._anchor;
        }
        set anchor(value) {
            this._anchor = value;
            this.invalidateLocalMatrix();
        }
        get scale() {
            return this._scale;
        }
        set scale(value) {
            this._scale = value;
            this.invalidateLocalMatrix();
        }
        get skewAngle() {
            return this._skewAngle;
        }
        set skewAngle(value) {
            if (value !== this._skewAngle) {
                this._skewAngle = value;
                this.invalidateLocalMatrix();
            }
        }
        get skewAxis() {
            return this._skewAxis;
        }
        set skewAxis(value) {
            if (value !== this._skewAxis) {
                this._skewAxis = value;
                this.invalidateLocalMatrix();
            }
        }
        get rotate() {
            return this._rotate;
        }
        set rotate(value) {
            this._rotate = value;
            this.invalidateLocalMatrix();
        }
        get orientation() {
            return this._orientation;
        }
        set orientation(value) {
            this._orientation = value;
        }
        get autoOrientAngle() {
            if (this._orientation === exports.Orientation.None) {
                return 0;
            }
            if (this._orientation === exports.Orientation.AutoReverse) {
                return -this._autoOrientAngle;
            }
            return this._autoOrientAngle;
        }
        set autoOrientAngle(value) {
            if (this._autoOrientAngle === value) {
                return;
            }
            this._autoOrientAngle = value;
            if (this._orientation !== exports.Orientation.None) {
                this.invalidateLocalMatrix();
            }
        }
        // Coordinates
        get position() {
            return this._position;
        }
        set position(value) {
            this._position = value;
            this.invalidateLocalMatrix();
        }
        // Opacity
        get opacity() {
            return this._opacity;
        }
        set opacity(value) {
            value = clamp(value, 0, 1);
            if (this._opacity !== value) {
                this._opacity = value;
                this._composition = null;
                this.invalidate();
            }
        }
        // Blend mode
        get blend() {
            return this._blendMode;
        }
        set blend(value) {
            if (this._blendMode != value) {
                this._blendMode = value;
                this._composition = null;
                this.invalidate();
            }
        }
        // Isolate
        get isolate() {
            return this._isolate;
        }
        set isolate(value) {
            if (this._isolate != value) {
                this._isolate = value;
                this._composition = null;
                this.invalidate();
            }
        }
        // Composition
        get composition() {
            if (this._composition === null) {
                this._composition = new Composition(this._blendMode, this._opacity, this._isolate);
            }
            return this._composition;
        }
        clone(newId = false) {
            const node = super.clone(newId);
            node._locked = this._locked;
            node._hidden = this._hidden;
            // Point is immutable
            node._position = this._position;
            node._anchor = this._anchor;
            node._scale = this._scale;
            node._skewAngle = this._skewAngle;
            node._skewAxis = this._skewAxis;
            node._rotate = this._rotate;
            node._orientation = this._orientation;
            node._opacity = this._opacity;
            node._blendMode = this._blendMode;
            node._isolate = this._isolate;
            node._composition = this._composition === null ? null : this._composition.clone();
            return node;
        }
        draw(context) {
            if (this._hidden) {
                return;
            }
            if (this._opacity === 0) {
                return; // not visible
            }
            context.save();
            context.multiplyMatrix(this.localMatrix);
            context.drawPicture(this.getPicture(), this.composition);
            context.restore();
        }
        getElementAt(point) {
            if (this.hidden) {
                return null;
            }
            // TODO: check if locked ...
            for (let n = this._last; n !== null; n = n._prev) {
                const result = n.getElementAt(point);
                if (result) {
                    return result;
                }
            }
            return null;
        }
        dispose() {
            super.dispose();
            this._position = this._anchor = this._scale = null;
            this._composition = null;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class VectorElement extends Element {
        constructor() {
            super(...arguments);
            this._fill = null;
            this._stroke = null;
            this._rule = exports.FillRule.NonZero;
            this._paintOrder = exports.PaintOrder.FillStrokeMarkers;
        }
        /**
         * Fill rule
         */
        get fillRule() {
            return this._rule;
        }
        set fillRule(value) {
            this._rule = value;
            this.invalidate();
        }
        get paintOrder() {
            return this._paintOrder;
        }
        set paintOrder(value) {
            this._paintOrder = value;
            this.invalidate();
        }
        // Fill
        get fill() {
            if (this._fill === null) {
                this._fill = SolidBrush.BLACK;
            }
            return this._fill;
        }
        set fill(value) {
            this._fill = value;
            this.invalidate();
        }
        get fillOpacity() {
            return this.fill.opacity;
        }
        set fillOpacity(value) {
            this.fill.opacity = value;
            this.invalidate();
        }
        // Stroke
        get stroke() {
            if (!this._stroke) {
                this._stroke = new DefaultPen();
            }
            return this._stroke;
        }
        set stroke(value) {
            this._stroke = value;
            this.invalidateBoundsAndPicture();
        }
        get strokeBrush() {
            return this.stroke.brush;
        }
        set strokeBrush(value) {
            this.stroke.brush = value;
            this.invalidate();
        }
        get strokeOpacity() {
            return this.stroke.brush.opacity;
        }
        set strokeOpacity(value) {
            this.stroke.brush.opacity = value;
            this.invalidate();
        }
        get strokeLineWidth() {
            return this.stroke.width;
        }
        set strokeLineWidth(value) {
            this.stroke.width = value;
            this.invalidateBoundsAndPicture();
        }
        get strokeLineCap() {
            return this.stroke.lineCap;
        }
        set strokeLineCap(value) {
            const stroke = this.stroke;
            if (value !== stroke.lineCap) {
                stroke.lineCap = value;
                if (stroke.isVisible) {
                    this.invalidateBoundsAndPicture();
                }
            }
        }
        get strokeLineJoin() {
            return this.stroke.lineJoin;
        }
        set strokeLineJoin(value) {
            const stroke = this.stroke;
            if (value !== stroke.lineJoin) {
                stroke.lineJoin = value;
                if (stroke.isVisible) {
                    this.invalidateBoundsAndPicture();
                }
            }
        }
        get strokeMiterLimit() {
            return this.stroke.miterLimit;
        }
        set strokeMiterLimit(value) {
            value = clamp(value, 1, Number.POSITIVE_INFINITY);
            const stroke = this.stroke;
            if (value !== stroke.miterLimit) {
                stroke.miterLimit = value;
                if (stroke.isVisible) {
                    this.invalidateBoundsAndPicture();
                }
            }
        }
        get strokeDashArray() {
            return this.stroke.dashes;
        }
        set strokeDashArray(value) {
            const stroke = this.stroke;
            if (value !== stroke.dashes) {
                stroke.dashes = value;
                if (stroke.isVisible) {
                    this.invalidateBoundsAndPicture();
                }
            }
        }
        get strokeDashOffset() {
            return this.stroke.offset;
        }
        set strokeDashOffset(value) {
            const stroke = this.stroke;
            if (value !== stroke.offset) {
                stroke.offset = value;
                if (stroke.isVisible) {
                    this.invalidateBoundsAndPicture();
                }
            }
        }
        /**
         * @inheritDoc
         */
        get pictureBounds() {
            // TODO: get extra padding from filters
            return this.getStrokeBounds(this.localBounds);
        }
        getStrokeBounds(bounds) {
            if (!this.stroke.isVisible) {
                return bounds;
            }
            // We just outset with 2 * line width
            return bounds.outset(this.strokeLineWidth * 2);
        }
        get nativeFillRule() {
            return this._rule === exports.FillRule.EvenOdd
                ? Skia.SkPathFillType.EvenOdd
                : Skia.SkPathFillType.Winding;
        }
        drawOnPicture(context, bounds) {
            const path = this.pathToDraw;
            if (!path) {
                return null;
            }
            let rect = null;
            let prevRule = null;
            const rule = this.nativeFillRule;
            if (path.fillType !== rule) {
                prevRule = path.fillType;
                path.fillType = rule;
            }
            switch (this._paintOrder) {
                case exports.PaintOrder.FillStrokeMarkers:
                default:
                    context.drawPath(path, this.fill);
                    context.drawPath(path, this.stroke);
                    rect = this.paintMarkers(context);
                    break;
                case exports.PaintOrder.FillMarkersStroke:
                    context.drawPath(path, this.fill);
                    rect = this.paintMarkers(context);
                    context.drawPath(path, this.stroke);
                    break;
                case exports.PaintOrder.StrokeFillMarkers:
                    context.drawPath(path, this.stroke);
                    context.drawPath(path, this.fill);
                    rect = this.paintMarkers(context);
                    break;
                case exports.PaintOrder.StrokeMarkersFill:
                    context.drawPath(path, this.stroke);
                    rect = this.paintMarkers(context);
                    context.drawPath(path, this.fill);
                    break;
                case exports.PaintOrder.MarkersFillStroke:
                    rect = this.paintMarkers(context);
                    context.drawPath(path, this.fill);
                    context.drawPath(path, this.stroke);
                    break;
                case exports.PaintOrder.MarkersStrokeFill:
                    rect = this.paintMarkers(context);
                    context.drawPath(path, this.stroke);
                    context.drawPath(path, this.fill);
                    break;
            }
            if (prevRule !== null) {
                path.fillType = prevRule;
            }
            if (!rect) {
                // use the default picture bounds
                return bounds;
            }
            // enlarge to show markers
            return Rectangle.merge([bounds, rect]);
        }
        get supportsChildren() {
            return false;
        }
        dispose() {
            super.dispose();
            this._fill = this._stroke = null;
        }
        paintMarkers(context) {
            // TODO: implement markers sometime
            return null;
        }
        getElementAt(point) {
            // TODO: remove this
            if (this.hidden || this.locked) {
                return null;
            }
            // TODO: use transformed path???
            return this.pathToDraw?.contains(point.x, point.y, this.globalMatrix) ? this : null;
        }
        clone(newId = false) {
            const element = super.clone();
            element._fill = this._fill ? this._fill.clone() : null;
            element._stroke = this._stroke ? this._stroke.clone() : null;
            element._rule = this._rule;
            element._paintOrder = this._paintOrder;
            return element;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class ShapeElement extends VectorElement {
        constructor(shape, document, id) {
            super(document, id);
            this._localPath = null;
            this._pathNeedsRebuild = false;
            this._globalPath = null;
            this._shape = shape;
        }
        get shape() {
            return this._shape;
        }
        set shape(value) {
            if (value !== this._shape) {
                this._shape = value;
                this.invalidateShape();
            }
        }
        get type() {
            return this._shape.type;
        }
        /**
         * A native path object
         * This object is managed by the element
         */
        get localPath() {
            let setup = false;
            if (this._localPath == null) {
                this._localPath = new Skia.SkPath();
                setup = true;
            }
            else if (this._pathNeedsRebuild) {
                this._localPath.reset();
                setup = true;
            }
            if (setup) {
                this._localPath.isVolatile = true;
                this._localPath.fillType = this.nativeFillRule;
                this._shape.preparePath(this._localPath);
                this._pathNeedsRebuild = false;
            }
            return this._localPath;
        }
        /**
         * A native path object with globalMatrix applied
         * This object is managed by the element
         */
        get globalPath() {
            if (this._globalPath === null) {
                this._globalPath = this.localPath.copy();
                const matrix = this.globalMatrix;
                if (!matrix.isIdentity) {
                    this._globalPath.transform(matrix);
                }
            }
            return this._globalPath;
        }
        /**
         * @inheritDoc
         */
        get localBounds() {
            if (this._localBounds === null) {
                this._localBounds = Rectangle.fromLTRBObject(this.localPath.getBounds());
            }
            return this._localBounds;
        }
        /**
         * @inheritDoc
         */
        get localTightBounds() {
            if (this._localTightBounds === null) {
                this._localTightBounds = Rectangle.fromLTRBObject(this.localPath.computeTightBounds());
            }
            return this._localTightBounds;
        }
        /**
         * @inheritDoc
         */
        get globalBounds() {
            if (this._globalBounds !== null) {
                return this._globalBounds;
            }
            const matrix = this.globalMatrix;
            if (matrix.isIdentity) {
                return this._globalBounds = this.localBounds;
            }
            return this._globalBounds = Rectangle.fromLTRBObject(this.globalPath.getBounds());
        }
        /**
         * @inheritDoc
         */
        get globalTightBounds() {
            if (this._globalTightBounds !== null) {
                return this._globalTightBounds;
            }
            const matrix = this.globalMatrix;
            if (matrix.isIdentity) {
                return this._globalTightBounds = this.localTightBounds;
            }
            return this._globalTightBounds = Rectangle.fromLTRBObject(this.globalPath.computeTightBounds());
        }
        invalidateShape() {
            if (ShapeElement.invalidationPrevented) {
                return;
            }
            this._pathNeedsRebuild = true;
            this.invalidateBoundsAndPicture();
        }
        dispose() {
            super.dispose();
            if (this._localPath !== null) {
                this._localPath.delete();
                this._localPath = null;
            }
            if (this._globalPath !== null) {
                this._globalPath.delete();
                this._globalPath = null;
            }
            this._shape = null;
        }
        get pathToDraw() {
            return this.localPath;
        }
        invalidateBoundsAndPicture(parentPictureOnly = false) {
            if (this._globalPath !== null) {
                this._globalPath.delete();
                this._globalPath = null;
            }
            super.invalidateBoundsAndPicture(parentPictureOnly);
        }
        cloneCurrent(newId) {
            // @ts-ignore
            return new this.constructor(this._shape.clone(), this._document, newId ? null : this._id);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class EllipseElement extends ShapeElement {
        get width() {
            return this._shape.width;
        }
        set width(value) {
            value = clamp(value, 0, Number.POSITIVE_INFINITY);
            if (value !== this._shape.width) {
                this._shape.width = value;
                this.invalidateShape();
            }
        }
        get height() {
            return this._shape.height;
        }
        set height(value) {
            value = clamp(value, 0, Number.POSITIVE_INFINITY);
            if (value !== this._shape.height) {
                this._shape.height = value;
                this.invalidateShape();
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class GroupElement extends Element {
        get type() {
            return "group";
        }
        get supportsChildren() {
            return true;
        }
        cloneCurrent(newId) {
            return new GroupElement(this._document, newId ? null : this._id);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class PathElement extends ShapeElement {
        get path() {
            return this._shape;
        }
        set path(value) {
            this._shape = value;
            this.invalidateShape();
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class PolyElement extends ShapeElement {
        get points() {
            return this._shape.points;
        }
        set points(value) {
            if (value !== this._shape.points) {
                this._shape.points = value;
                this.invalidateShape();
            }
        }
        get isClosed() {
            return this._shape.isClosed;
        }
        set isClosed(value) {
            if (value !== this._shape.isClosed) {
                this._shape.isClosed = value;
                this.invalidateShape();
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class RectElement extends ShapeElement {
        get radius() {
            return this._shape.radius;
        }
        set radius(value) {
            if (this._shape.radius !== value) {
                this._shape.radius = value;
                this.invalidateShape();
            }
        }
        get width() {
            return this._shape.width;
        }
        set width(value) {
            value = clamp(value, 0, Number.POSITIVE_INFINITY);
            if (value !== this._shape.width) {
                this._shape.width = value;
                this.invalidateShape();
            }
        }
        get height() {
            return this._shape.height;
        }
        set height(value) {
            value = clamp(value, 0, Number.POSITIVE_INFINITY);
            if (value !== this._shape.height) {
                this._shape.height = value;
                this.invalidateShape();
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class RegularPolygonElement extends ShapeElement {
        get sides() {
            return this._shape.sides;
        }
        set sides(value) {
            value = clamp(value, 3, Number.POSITIVE_INFINITY);
            if (value !== this._shape.sides) {
                this._shape.sides = value;
                this.invalidateShape();
            }
        }
        get radius() {
            return this._shape.radius;
        }
        set radius(value) {
            value = clamp(value, 0, Number.POSITIVE_INFINITY);
            if (value !== this._shape.radius) {
                this._shape.radius = value;
                this.invalidateShape();
            }
        }
        get cornerRadius() {
            return this._shape.cornerRadius;
        }
        set cornerRadius(value) {
            value = clamp(value, 0, 1);
            if (value !== this._shape.cornerRadius) {
                this._shape.cornerRadius = value;
                this.invalidateShape();
            }
        }
        get angle() {
            return this._shape.angle;
        }
        set angle(value) {
            if (value !== this._shape.angle) {
                this._shape.angle = value;
                this.invalidateShape();
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class StarElement extends ShapeElement {
        get sides() {
            return this._shape.sides;
        }
        set sides(value) {
            value = clamp(value, 3, Number.POSITIVE_INFINITY);
            if (value !== this._shape.sides) {
                this._shape.sides = value;
                this.invalidateShape();
            }
        }
        get outerRadius() {
            return this._shape.outerRadius;
        }
        set outerRadius(value) {
            value = clamp(value, 0, Number.POSITIVE_INFINITY);
            if (value !== this._shape.outerRadius) {
                this._shape.outerRadius = value;
                this.invalidateShape();
            }
        }
        get innerRadius() {
            return this._shape.innerRadius;
        }
        set innerRadius(value) {
            value = clamp(value, 0, Number.POSITIVE_INFINITY);
            if (value !== this._shape.innerRadius) {
                this._shape.innerRadius = value;
                this.invalidateShape();
            }
        }
        get outerCornerRadius() {
            return this._shape.outerCornerRadius;
        }
        set outerCornerRadius(value) {
            value = clamp(value, 0, 1);
            if (value !== this._shape.outerCornerRadius) {
                this._shape.outerCornerRadius = value;
                this.invalidateShape();
            }
        }
        get innerCornerRadius() {
            return this._shape.innerCornerRadius;
        }
        set innerCornerRadius(value) {
            value = clamp(value, 0, 1);
            if (value !== this._shape.innerCornerRadius) {
                this._shape.innerCornerRadius = value;
                this.invalidateShape();
            }
        }
        get outerRotate() {
            return this._shape.outerRotate;
        }
        set outerRotate(value) {
            if (value !== this._shape.outerRotate) {
                this._shape.outerRotate = value;
                this.invalidateShape();
            }
        }
        get innerRotate() {
            return this._shape.innerRotate;
        }
        set innerRotate(value) {
            if (value !== this._shape.innerRotate) {
                this._shape.innerRotate = value;
                this.invalidateShape();
            }
        }
        get angle() {
            return this._shape.angle;
        }
        set angle(value) {
            if (value !== this._shape.angle) {
                this._shape.angle = value;
                this.invalidateShape();
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class ClipPathElement extends Element {
        constructor(path, document, id) {
            super(document, id);
            this._path = path;
        }
        get type() {
            return "clip-path";
        }
        get path() {
            return this._path;
        }
        set path(value) {
            if (this._path === value) {
                this._path.invalidate();
            }
            else {
                this._path = value;
            }
            this.invalidateBoundsAndPicture();
        }
        get globalBounds() {
            return this._path.bounds;
        }
        get globalTightBounds() {
            return this._path.bounds;
        }
        get supportsChildren() {
            return true;
        }
        dispose() {
            super.dispose();
            if (this._path !== null) {
                this._path.dispose();
                this._path = null;
            }
        }
        cloneCurrent(newId) {
            return new ClipPathElement(this._path.clone(), this._document, newId ? null : this._id);
        }
        drawOnPicture(context, bounds) {
            context.clipPath(this._path);
            super.drawOnPicture(context, bounds);
            //return this._path.bounds;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class TextElement extends VectorElement {
        constructor(document, text, font, id) {
            super(document, id);
            this._path = null;
            this._glyphs = null;
            this._text = text;
            this._font = font;
        }
        get stroke() {
            if (!this._stroke) {
                this._stroke = new DefaultPen(new EmptyBrush());
            }
            return this._stroke;
        }
        get type() {
            return "text";
        }
        /**
         * @inheritDoc
         */
        get localBounds() {
            if (this._localBounds === null) {
                this._localBounds = this.font.getGlyphsBounds(this.glyphs);
            }
            return this._localBounds;
        }
        /**
         * @inheritDoc
         */
        get localTightBounds() {
            return this.localBounds;
        }
        /**
         * @inheritDoc
         */
        get globalBounds() {
            if (this._globalBounds === null) {
                this._globalBounds = this.localBounds.transform(this.globalMatrix);
            }
            return this._globalBounds;
        }
        /**
         * @inheritDoc
         */
        get globalTightBounds() {
            return this.globalBounds;
        }
        get text() {
            return this._text;
        }
        set text(value) {
            if (this._text !== value) {
                this._text = value;
                this.invalidateText();
            }
        }
        get glyphs() {
            if (this._glyphs == null) {
                this._glyphs = this.font.convertTextToGlyphs(this._text);
            }
            return this._glyphs;
        }
        get font() {
            return this._font;
        }
        set font(value) {
            if (this._font !== value) {
                this._font.dispose();
                this._font = value;
                this.invalidateText();
            }
        }
        get fontSize() {
            return this._font.size;
        }
        set fontSize(value) {
            if (this._font.size !== value) {
                this._font.size = value;
                this.invalidateText();
            }
        }
        get fontStyle() {
            return this._font.style;
        }
        set fontStyle(value) {
            const f = this._font;
            if (f.style !== value) {
                this.font = FontManager.getFont(f.family, value, f.weight, f.size);
            }
        }
        get fontWeight() {
            return this._font.weight;
        }
        set fontWeight(value) {
            const f = this._font;
            if (f.weight !== value) {
                this.font = FontManager.getFont(f.family, f.style, value, f.size);
            }
        }
        /**
         * @inheritDoc
         * @override
         */
        drawOnPicture(context, bounds) {
            const glyphs = this.glyphs;
            if (glyphs.length === 0) {
                return null;
            }
            const font = this.font;
            let rect = null;
            switch (this._paintOrder) {
                case exports.PaintOrder.FillStrokeMarkers:
                default:
                    context.drawText(glyphs, this.fill, font);
                    context.drawText(glyphs, this.stroke, font);
                    rect = this.paintMarkers(context);
                    break;
                case exports.PaintOrder.FillMarkersStroke:
                    context.drawText(glyphs, this.fill, font);
                    rect = this.paintMarkers(context);
                    context.drawText(glyphs, this.stroke, font);
                    break;
                case exports.PaintOrder.StrokeFillMarkers:
                    context.drawText(glyphs, this.stroke, font);
                    context.drawText(glyphs, this.fill, font);
                    rect = this.paintMarkers(context);
                    break;
                case exports.PaintOrder.StrokeMarkersFill:
                    context.drawText(glyphs, this.stroke, font);
                    rect = this.paintMarkers(context);
                    context.drawText(glyphs, this.fill, font);
                    break;
                case exports.PaintOrder.MarkersFillStroke:
                    rect = this.paintMarkers(context);
                    context.drawText(glyphs, this.fill, font);
                    context.drawText(glyphs, this.stroke, font);
                    break;
                case exports.PaintOrder.MarkersStrokeFill:
                    rect = this.paintMarkers(context);
                    context.drawText(glyphs, this.stroke, font);
                    context.drawText(glyphs, this.fill, font);
                    break;
            }
            if (!rect) {
                // use the default picture bounds
                return bounds;
            }
            // enlarge to show markers
            return Rectangle.merge([bounds, rect]);
        }
        dispose() {
            super.dispose();
            this._font.dispose();
            if (this._path) {
                this._path.delete();
                this._path = null;
            }
        }
        getElementAt(point) {
            if (this.hidden || this.locked) {
                return null;
            }
            return this.globalTightBounds.contains(point.x, point.y) ? this : null;
        }
        get pathToDraw() {
            if (this._path === null) {
                this._path = this._font.nativeFont.textToPath(this._text);
            }
            return this._path;
        }
        cloneCurrent(newId) {
            return new TextElement(this.document, this._text, this._font.clone(), newId ? null : this._id);
        }
        invalidateText() {
            this.invalidateBoundsAndPicture();
            this._glyphs = null;
            if (this._path) {
                this._path.delete();
                this._path = null;
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class ReferenceElement extends Element {
        constructor(reference, document, id) {
            super(document, id);
            this._reference = reference;
        }
        get localBounds() {
            if (this._localBounds == null) {
                this._localBounds = this.getBounds() || super.localBounds;
            }
            return this._localBounds;
        }
        get localTightBounds() {
            return this.localBounds;
        }
        get globalBounds() {
            if (this._globalBounds == null) {
                this._globalBounds = this.localBounds.transform(this.globalMatrix);
            }
            return this._globalBounds;
        }
        get globalTightBounds() {
            return this.globalBounds;
        }
        get reference() {
            return this._reference;
        }
        set reference(value) {
            if (this._reference !== value) {
                this._reference = value;
                this.invalidate();
            }
        }
        /**
         * Get the time to use for picture generation, or null to not change time
         */
        getReferenceTime() {
            return null;
        }
        resolvePicture() {
            if (!this._reference || !this._document || !this._document.project) {
                // Reference is not resolvable right now
                return null;
            }
            // Generate a new document picture
            return this._document.project.getDocumentPicture(this._reference, this.getReferenceTime());
        }
        getElementAt(point) {
            if (this.hidden || this.locked) {
                return null;
            }
            return this.globalTightBounds.contains(point.x, point.y) ? this : null;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class SymbolElement extends ReferenceElement {
        constructor(reference, document, id) {
            super(reference, document, id);
            this._x = 0;
            this._y = 0;
            this._width = 0;
            this._height = 0;
            this._time = 0;
        }
        get type() {
            return "symbol";
        }
        get supportsChildren() {
            return false;
        }
        get width() {
            return this._width;
        }
        set width(value) {
            value = clamp(value, 0, Number.POSITIVE_INFINITY);
            if (this._width !== value) {
                this._width = value;
                this.invalidateBoundsAndPicture();
            }
        }
        get height() {
            return this._height;
        }
        set height(value) {
            value = clamp(value, 0, Number.POSITIVE_INFINITY);
            if (this._height !== value) {
                this._height = value;
                this.invalidateBoundsAndPicture();
            }
        }
        get time() {
            return this._time;
        }
        set time(value) {
            if (this._time !== value) {
                this._time = value;
                this.invalidate();
            }
        }
        getReferenceTime() {
            return this._time;
        }
        getBounds() {
            return new Rectangle(0, 0, this._width, this._height);
        }
        cloneCurrent(newId) {
            const clone = new SymbolElement(this._reference, this._document, newId ? null : this._id);
            clone._x = this._x;
            clone._y = this._y;
            clone._width = this._width;
            clone._height = this._height;
            clone._time = this._time;
            return clone;
        }
        /**
         * @inheritDoc
         * @override
         */
        drawOnPicture(context, bounds) {
            const picture = this.resolvePicture();
            if (!picture) {
                return;
            }
            context.save();
            context.clipRect(bounds);
            context.translate(-this._x, -this._y);
            context.drawPicture(picture);
            context.restore();
            return bounds;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class MaskElement extends ReferenceElement {
        constructor(reference, document, id) {
            super(reference, document, id);
            this._time = 0;
            this._absolute = true;
        }
        get supportsChildren() {
            return true;
        }
        get type() {
            return "mask";
        }
        get time() {
            return this._time;
        }
        set time(value) {
            if (this._time !== value) {
                this._time = value;
                this.invalidate();
            }
        }
        getReferenceTime() {
            return this._time;
        }
        getBounds() {
            return null;
        }
        cloneCurrent(newId) {
            const clone = new MaskElement(this._reference, this._document, newId ? null : this._id);
            clone._time = this._time;
            clone._absolute = this._absolute;
            return clone;
        }
        /**
         * @inheritDoc
         * @override
         */
        drawOnPicture(context, bounds) {
            if (!this.hasChildren) {
                return;
            }
            let mask = this.resolvePicture();
            if (!mask) {
                return;
            }
            // bounds = this.localBounds;
            const recorder = new Skia.SkPictureRecorder();
            let canvas = recorder.beginRecording(bounds);
            const ctx = new DrawingContext(canvas);
            // Draw children
            super.drawOnPicture(ctx, bounds);
            ctx.dispose();
            canvas = null;
            const picture = recorder.finishRecordingAsPicture(bounds);
            // Calculate absolute bounds
            if (this._absolute && !this.globalMatrix.isIdentity) {
                canvas = recorder.beginRecording(mask.getBounds());
                canvas.drawPicture(mask, null, this.globalMatrix.clone().inverse());
                mask = recorder.finishRecordingAsPicture();
            }
            // End calculation of absolute bounds
            recorder.delete();
            if (!picture) {
                return;
            }
            // Everything under a white pixel is visible
            // Everything under a black pixel is hidden
            context.canvas.drawPictureMasked(picture, mask);
            picture.delete();
            return bounds;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Grid2D {
        constructor(color, horizontalDivisions = 10, verticalDivisions = 10) {
            this._isVisible = false;
            this._drawToBack = true;
            this._shader = null;
            this._lastLineWidth = 1;
            this._lastSize = null;
            this._color = color;
            this._horizontalSubdivisions = horizontalDivisions;
            this._verticalSubdivisions = verticalDivisions;
        }
        cloneProperties(grid) {
            grid._isVisible = this._isVisible;
            grid._drawToBack = this._drawToBack;
            grid._lastLineWidth = this._lastLineWidth;
            grid._lastSize = this._lastSize;
        }
        dispose() {
            this._color = null;
            this.clearCache();
        }
        get isVisible() {
            return this._isVisible;
        }
        set isVisible(value) {
            if (this._isVisible !== value) {
                this._isVisible = value;
                this.clearCache();
            }
        }
        get drawToBack() {
            return this._drawToBack;
        }
        set drawToBack(value) {
            this._drawToBack = value;
        }
        get color() {
            return this._color;
        }
        set color(value) {
            if (!this._color.equals(value)) {
                this._color = value;
                this.clearCache();
            }
        }
        get horizontalSubdivisions() {
            return this._horizontalSubdivisions;
        }
        set horizontalSubdivisions(value) {
            if (this._horizontalSubdivisions !== value) {
                this._horizontalSubdivisions = value;
                this.clearCache();
            }
        }
        get verticalSubdivisions() {
            return this._verticalSubdivisions;
        }
        set verticalSubdivisions(value) {
            if (this._verticalSubdivisions !== value) {
                this._verticalSubdivisions = value;
                this.clearCache();
            }
        }
        clearCache() {
            if (this._shader) {
                this._shader.delete();
                this._shader = null;
            }
        }
        getShader() {
            if (this._shader) {
                return this._shader;
            }
            const paint = new Skia.SkPaint();
            paint.style = Skia.SkPaintStyle.Stroke;
            paint.isAntiAlias = true;
            paint.color = this._color.code;
            paint.strokeWidth = this._lastLineWidth;
            this._shader = createGridShader(this._lastSize, this._horizontalSubdivisions, this._verticalSubdivisions, paint);
            paint.delete();
            return this._shader;
        }
        render(engine) {
            const { context, boundingBox, viewBox, dpr } = engine;
            const { canvas, paint } = context;
            const lineWidth = dpr / context.matrix.lineScale;
            if (this._lastLineWidth !== lineWidth) {
                this._lastLineWidth = lineWidth;
                this.clearCache();
            }
            const size = this.calcSize(engine);
            if (!this._lastSize || !size.equals(this._lastSize)) {
                this._lastSize = size;
                this.clearCache();
            }
            const rect = Rectangle.fromPoints(viewBox.matrix.inversePoint(0, 0), viewBox.matrix.inversePoint(boundingBox.right, boundingBox.bottom));
            paint.reset();
            paint.isAntiAlias = true;
            paint.style = Skia.SkPaintStyle.Fill;
            paint.shader = this.getShader();
            canvas.drawRect(rect, paint);
            paint.reset();
        }
    }
    function createGridShader(cell, widthSubdivisions, heightSubdivisions, paint) {
        const recorder = new Skia.SkPictureRecorder();
        const canvas = recorder.beginRecording(cell);
        // Draw big rect
        canvas.drawRect(0, 0, cell.width, cell.height, paint);
        paint.strokeWidth /= 2;
        const half = paint.strokeWidth / 2;
        // Draw small rects
        const width = cell.width / widthSubdivisions;
        for (let i = 1; i < widthSubdivisions; i++) {
            canvas.drawVLine(i * width - half, 0, cell.height, paint);
        }
        const height = cell.height / heightSubdivisions;
        for (let i = 1; i < heightSubdivisions; i++) {
            canvas.drawHLine(0, i * height - half, cell.width, paint);
        }
        const picture = recorder.finishRecordingAsPicture(cell);
        recorder.delete();
        const shader = picture.makeShader(Skia.SkTileMode.Repeat, Skia.SkTileMode.Repeat, null, cell);
        picture.delete();
        return shader;
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class AutomaticGrid extends Grid2D {
        constructor(color = Color.from('gray'), hSubdivision = 10, vSubdivision = 10) {
            super(color, hSubdivision, vSubdivision);
        }
        calcSize(engine) {
            const size = engine.rulerMajorGraduationWidth;
            return new Rectangle(0, 0, size, size);
        }
        clone() {
            const clone = new AutomaticGrid(this._color, this._horizontalSubdivisions, this._verticalSubdivisions);
            this.cloneProperties(clone);
            return clone;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Guide {
        constructor(position, isHorizontal, isHidden = false) {
            this.position = position;
            this.isHorizontal = isHorizontal;
            this.isHidden = isHidden;
        }
        clone() {
            return new Guide(this.position, this.isHorizontal, this.isHidden);
        }
    }
    class GuideList {
        constructor(guides = []) {
            this.isVisible = true;
            this._guides = guides;
        }
        dispose() {
            this._guides = null;
        }
        add(guide) {
            this._guides.push(guide);
        }
        has(guide) {
            return this._guides.indexOf(guide) >= 0;
        }
        remove(guide) {
            const index = this._guides.indexOf(guide);
            if (index >= 0) {
                this._guides.splice(index, 1);
                return true;
            }
            return false;
        }
        render(engine) {
            const { context, viewBox, boundingBox, dpr } = engine;
            const guides = this._guides;
            const pen = new DefaultPen(new SolidBrush(engine.theme.guide), dpr / context.matrix.lineScale);
            const topLeft = viewBox.getPointPosition({ x: 0, y: 0 });
            const bottomRight = viewBox.getPointPosition({ x: boundingBox.width, y: boundingBox.height });
            for (let i = 0, l = guides.length; i < l; i++) {
                const guide = guides[i];
                if (guide.isHidden) {
                    continue;
                }
                if (guide.isHorizontal) {
                    context.drawLine({ x: topLeft.x, y: guide.position }, { x: bottomRight.x, y: guide.position }, pen);
                }
                else {
                    context.drawLine({ x: guide.position, y: topLeft.y }, { x: guide.position, y: bottomRight.y }, pen);
                }
            }
        }
        getGuideAtPoint(point, epsilon = 0.000001) {
            for (let i = 0, l = this._guides.length; i < l; i++) {
                const guide = this._guides[i];
                if (guide.isHidden) {
                    continue;
                }
                const value = guide.isHorizontal ? point.x : point.y;
                if (Math.abs(guide.position - value) <= epsilon) {
                    return guide;
                }
            }
            return null;
        }
        clone() {
            return new GuideList(this._guides.map((g) => g.clone()));
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Document extends Node {
        constructor(id) {
            super(null, id);
            this._elementCache = new Map();
            this._grid = null;
            this._guides = null;
            // This is optional, and must be manually set
            // Projects that are not using animations should ignore this
            // It is kept here only to preserve correct State (see clone(), dispose())
            this._animation = null;
            /**
             * Readonly! Reference to current project.
             * If null, then this document is not attached to a project.
             * Do not change the project from here!
             */
            this.project = null;
            this._document = this;
            if (!id) {
                this._id = this.generateUniqueId();
            }
        }
        get localBounds() {
            if (!this._localBounds) {
                this._localBounds = this.getBounds();
            }
            return this._localBounds;
        }
        get localTightBounds() {
            return this.localBounds;
        }
        get globalBounds() {
            if (!this._globalBounds) {
                this._globalBounds = this.localBounds.transform(this.localMatrix);
            }
            return this._globalBounds;
        }
        get globalTightBounds() {
            return this.globalBounds;
        }
        get size() {
            return this.localBounds;
        }
        get pictureBounds() {
            return Rectangle.merge([this.localBounds, super.pictureBounds]);
        }
        get animation() {
            return this._animation;
        }
        set animation(value) {
            if (value.document !== this) {
                return;
            }
            if (this._animation) {
                this._animation.dispose();
            }
            this._animation = value;
            if (value) {
                value.cleanupAnimatedProperties();
            }
        }
        clone(newId = false) {
            const clone = super.clone(newId);
            // Set project
            clone.project = this.project;
            if (this._grid) {
                clone._grid = this._grid.clone();
            }
            if (this._guides) {
                clone._guides = this._guides.clone();
            }
            if (this._animation) {
                clone._animation = this._animation.clone(clone);
            }
            return clone;
        }
        dispose() {
            super.dispose();
            if (this._grid) {
                this._grid.dispose();
                this._grid = null;
            }
            if (this._guides) {
                this._guides.dispose();
                this._guides = null;
            }
            if (this._animation) {
                this._animation.dispose();
                this._animation = null;
            }
            // Remove reference to project
            this.project = null;
        }
        get supportsChildren() {
            return true;
        }
        get grid() {
            if (this._grid === null) {
                this._grid = new AutomaticGrid();
            }
            return this._grid;
        }
        get guides() {
            if (this._guides === null) {
                this._guides = new GuideList();
            }
            return this._guides;
        }
        set grid(value) {
            this._grid = value;
        }
        getElementById(id) {
            if (this._elementCache.has(id)) {
                return this._elementCache.get(id);
            }
            const element = this.findElementById(this, id);
            this._elementCache.set(id, element);
            return element;
        }
        getElementAt(point) {
            // TODO: remove this or add multiple options (see through groups, etc)
            for (const element of this.children(true)) {
                const el = element.getElementAt(point);
                if (el) {
                    return el;
                }
            }
            return null;
        }
        adoptNode(node) {
            if (node.document !== this) {
                node._document = this;
                for (let n = node.firstChild; n !== null; n = n.nextSibling) {
                    this.adoptNode(n);
                }
            }
            return node;
        }
        getLocalMatrix() {
            return new Matrix();
        }
        generateUniqueId() {
            return uuid();
        }
        draw(context) {
            context.drawPicture(this.getPicture(), Composition.NormalIsolatedComposition);
        }
        notifyTreeChanged() {
            this._elementCache.clear();
        }
        findElementById(parent, id) {
            for (let n = parent.firstChild; n !== null; n = n.nextSibling) {
                if (n.id === id) {
                    return n;
                }
                if (n.supportsChildren) {
                    const ret = this.findElementById(n, id);
                    if (ret) {
                        return ret;
                    }
                }
            }
            return null;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const WHITE_BRUSH = SolidBrush.WHITE;
    class BoardDocument extends Document {
        constructor(board, id) {
            super(id);
            this._board = board;
        }
        getBounds() {
            return this._board;
        }
        render(engine) {
            const { context, theme, viewBox } = engine;
            context.clear(theme.background);
            context.save();
            context.multiplyMatrix(viewBox.matrix);
            // TODO: use custom brush
            context.drawRect(this.localBounds, WHITE_BRUSH);
            const { grid, guides } = this;
            if (grid.drawToBack && grid.isVisible) {
                grid.render(engine);
            }
            this.draw(context);
            if (!grid.drawToBack && grid.isVisible) {
                grid.render(engine);
            }
            if (guides.isVisible) {
                guides.render(engine);
            }
            context.restore();
        }
        cloneCurrent(newId) {
            // @ts-ignore
            return new this.constructor(this._board, newId ? null : this._id);
        }
        dispose() {
            super.dispose();
            this._board = null;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class MasterDocument extends BoardDocument {
        constructor(board = new Rectangle(0, 0, 900, 600), id) {
            super(board, id);
        }
        test() {
            // TODO: remove this
            const p = new Skia.SkPath();
            p.addRect(new Rectangle(0, 0, 200, 100));
            for (let i = 0; i < 10; i++) {
                const gr = new GroupElement(this);
                gr.title = "Group " + (i + 1);
                gr.position = new Point(i * 10, i * 10);
                gr.scale = new Point(2, 2);
                for (let j = 0; j < 30; j++) {
                    const sh = new StarElement(new StarShape(Math.trunc(3 + Math.random() * 10), 150, 0.25), this);
                    sh.position = new Point(Math.random() * 8000 - 2000, Math.random() * 8000 - 2000);
                    sh.fill = new SolidBrush(Color.green);
                    sh.title = "Path " + (i + 1) + " - " + (j + 1);
                    gr.appendChild(sh);
                }
                this.appendChild(gr);
            }
            const text = new TextElement(this, 'AHello,    World! $ ÎȘȚĂÂ', FontManager.getDefaultFont(32));
            text.position = new Point(0, this.localBounds.bottom);
            // text.strokeBrush = new SolidBrush(Color.from('pink'));
            // text.strokeLineWidth = 0.1;
            this.appendChild(text);
            // const text2 = new TextElement(this, 'Hello, World 2!', FontManager.getDefaultFont(18));
            // text2.position = new Point(700, 500);
            // this.appendChild(text2);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class PatternDocument extends BoardDocument {
        constructor(board = new Rectangle(0, 0, 900, 600), id) {
            super(board, id);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const DefaultSnappingOptions = {
        pixel: false,
        grid: false,
        guides: true,
        bounds: true,
        points: true,
        tolerance: 10,
    };
    class Snapping {
        constructor(engine, options) {
            // TODO: add ignore points
            this.options = options || DefaultSnappingOptions;
            this.list = this.collect(engine.document);
        }
        dispose() {
            this.list = this.options = null;
        }
        collect(document) {
            const list = [];
            if (this.options.guides) ;
            this.collectRectPoints(Rectangle.fromSize(document.size), list);
            if (this.options.bounds || this.options.points) {
                for (const child of document.children(true)) {
                    this.collectElementPoints(child, list);
                }
            }
            // Removing duplicates using a custom function is problematic in js
            // and also very, very slow.
            // let s = performance.now();
            // list.filter(filterDuplicatePoints);
            // console.log(performance.now() - s);
            return list;
        }
        collectRectPoints(rect, list) {
            const mx = rect.middleX, my = rect.middleY;
            list.push(new Point(rect.left, my), new Point(mx, rect.top), new Point(rect.right, my), new Point(mx, rect.bottom));
        }
        collectElementPoints(element, list) {
            if (element.hidden) {
                return;
            }
            if (element.supportsChildren) {
                for (const child of element.children(true)) {
                    this.collectElementPoints(child, list);
                }
            }
            if (this.options.bounds) {
                this.collectRectPoints(element.globalTightBounds, list);
            }
            if (this.options.points) ;
        }
        snapMultiple(point, references) {
            const data = {
                point,
                dist: 0,
                current: {
                    x: null,
                    y: null
                },
                delta: {
                    x: 0,
                    y: 0
                },
                min: {
                    x: Number.POSITIVE_INFINITY,
                    y: Number.POSITIVE_INFINITY,
                },
                lines: {
                    top: Number.POSITIVE_INFINITY,
                    bottom: Number.NEGATIVE_INFINITY,
                    left: Number.POSITIVE_INFINITY,
                    right: Number.NEGATIVE_INFINITY,
                }
            };
            for (const reference of references) {
                this.snapOne(point, reference, data);
            }
            data.dist = data.min.x ** 2 + data.min.y ** 2;
            return data;
        }
        snapOne(point, reference, data) {
            const dx = reference.x - point.x;
            const mdx = Math.abs(dx);
            if (mdx <= this.options.tolerance) {
                if (mdx < data.min.x) {
                    data.min.x = mdx;
                    data.delta.x = dx;
                    data.current.x = reference.x;
                    data.lines.top = data.lines.bottom = reference.y;
                }
                else if (reference.x === data.current.x) {
                    if (reference.y < data.lines.top) {
                        data.lines.top = reference.y;
                    }
                    if (reference.y > data.lines.bottom) {
                        data.lines.bottom = reference.y;
                    }
                }
            }
            const dy = reference.y - point.y;
            const mdy = Math.abs(dy);
            if (mdy <= this.options.tolerance) {
                if (mdy < data.min.y) {
                    data.min.y = mdy;
                    data.delta.y = dy;
                    data.current.y = reference.y;
                    data.lines.left = data.lines.right = reference.x;
                }
                else if (reference.y === data.current.y) {
                    if (reference.x < data.lines.left) {
                        data.lines.left = reference.x;
                    }
                    if (reference.x > data.lines.right) {
                        data.lines.right = reference.x;
                    }
                }
            }
        }
        preparePoints(points) {
            if (!this.options.pixel && !this.options.grid) {
                return points;
            }
            return points.map(point => {
                if (this.options.pixel) {
                    point = point.rounded();
                }
                if (this.options.grid) ;
                return point;
            });
        }
        snapRect(rect, delta) {
            if (!this.list || !this.list.length) {
                return null;
            }
            if (delta && !delta.isZero) {
                return this.snapPoints(rect.topLeft.add(delta), rect.topRight.add(delta), rect.middle.add(delta), rect.bottomLeft.add(delta), rect.bottomRight.add(delta));
            }
            return this.snapPoints(rect.topLeft, rect.topRight, rect.middle, rect.bottomLeft, rect.bottomRight);
        }
        snapPoints(...points) {
            if (!this.list || !this.list.length) {
                return null;
            }
            points = this.preparePoints(points);
            let best = null;
            for (const p of points) {
                const ret = this.snapMultiple(p, this.list);
                if (best == null) {
                    best = ret;
                }
                else {
                    if (ret.dist < best.dist) {
                        best = ret;
                    }
                    else if (ret.dist === best.dist) {
                        if (best.current.x === ret.current.x) {
                            if (ret.lines.top < best.lines.top) {
                                best.lines.top = ret.lines.top;
                            }
                            if (ret.lines.bottom > best.lines.bounds) {
                                best.lines.bounds = ret.lines.bottom;
                            }
                        }
                        if (best.current.y === ret.current.y) {
                            if (ret.lines.left < best.lines.left) {
                                best.lines.left = ret.lines.left;
                            }
                            if (ret.lines.right > best.lines.right) {
                                best.lines.right = ret.lines.right;
                            }
                        }
                    }
                }
            }
            if (!best) {
                return null;
            }
            if (best.point.x < best.lines.left) {
                best.lines.left = best.point.x;
            }
            if (best.point.x > best.lines.right) {
                best.lines.right = best.point.x;
            }
            if (best.point.y < best.lines.top) {
                best.lines.top = best.point.y;
            }
            if (best.point.y > best.lines.bottom) {
                best.lines.bottom = best.point.y;
            }
            return best;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class ShapeBuilderTool extends BaseTool {
        constructor() {
            super(...arguments);
            this.snappingInfo = null;
            this.element = null;
            this.startPoint = null;
            this.currentPoint = null;
            this.lastEvent = null;
            this.snappingLines = null;
            this.snapLinePen = new DefaultPen(new SolidBrush(Color.from('red')), 1);
            this.defaultCanvasCursor = exports.Cursor.Target;
        }
        render(engine) {
            if (!this.isInvalidated) {
                return;
            }
            this.drawSnapshotImage(engine, false);
            // Check if there is something to draw
            if (this.element && this.startPoint && this.currentPoint) {
                this.updateElement(engine, this.element, this.startPoint, this.currentPoint);
                const context = engine.context;
                context.save();
                context.multiplyMatrix(engine.viewBox.matrix);
                this.drawShape(engine, this.element);
                context.restore();
            }
            engine.context.flush();
            this.isInvalidated = false;
        }
        onKeyboardStatusChange(engine, event) {
            this.invalidateToolDrawing();
        }
        /**
         * Override this method to draw boxes, etc.
         * @protected
         */
        drawShape(engine, element) {
            element.draw(engine.context);
            this.drawSnappingLines(engine);
        }
        drawSnappingLines(engine) {
            if (!this.snappingLines) {
                return;
            }
            // TODO: improve
            const context = engine.context;
            const pen = this.snapLinePen;
            const w = pen.width;
            pen.width = engine.viewBox.getLineWidth(pen.width);
            context.drawLine({ x: this.currentPoint.x, y: this.snappingLines.top }, { x: this.currentPoint.x, y: this.snappingLines.bottom }, pen);
            context.drawLine({ x: this.snappingLines.left, y: this.currentPoint.y }, { x: this.snappingLines.right, y: this.currentPoint.y }, pen);
            pen.width = w;
        }
        decorateElement(engine, element) {
            // nothing here, you can override this method
        }
        prepareSnapping(engine) {
            return new Snapping(engine);
        }
        getSnappedPoint(point) {
            if (!this.snappingInfo) {
                return point;
            }
            const snap = this.snappingInfo.snapPoints(point);
            if (!snap) {
                this.snappingLines = null;
                return point;
            }
            this.snappingLines = snap.lines;
            return point.add(snap.delta);
        }
        onMouseLeftButtonDown(engine, event) {
            this.createSnapping(engine);
            this.startPoint = this.currentPoint = this.getSnappedPoint(event.position);
            this.createBuilder(engine);
        }
        onMouseLeftButtonMove(engine, event) {
            this.lastEvent = event;
            const p = this.getSnappedPoint(event.position);
            if (p.equals(this.currentPoint)) {
                return;
            }
            this.currentPoint = p;
            this.invalidateToolDrawing();
        }
        onMouseLeftButtonUp(engine, event) {
            this.saveElement(engine);
            this.disposeBuilder();
        }
        createSnapping(engine) {
            if (this.snappingInfo) {
                this.snappingInfo.dispose();
            }
            this.snappingLines = null;
            // let start = performance.now();
            this.snappingInfo = this.prepareSnapping(engine);
            // console.log(performance.now() - start);
        }
        createBuilder(engine) {
            if (!this.element) {
                this.element = this.createElement(engine, this.startPoint);
                this.decorateVectorElement(engine, this.element);
                this.decorateElement(engine, this.element);
            }
        }
        disposeBuilder() {
            if (this.element) {
                this.element.dispose();
                this.element = null;
            }
            if (this.snappingInfo) {
                this.snappingInfo.dispose();
                this.snappingInfo = null;
            }
            this.snappingLines = null;
            this.lastEvent = this.startPoint = this.currentPoint = null;
            this.invalidateToolDrawing();
        }
        saveElement(engine) {
            if (!this.element) {
                return;
            }
            // Append to document
            engine.document.appendChild(this.element);
            this.element = null;
            // The canvas draw will change
            this.invalidate();
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class RectangleTool extends ShapeBuilderTool {
        get name() {
            return "rectangle";
        }
        createElement(engine) {
            return new RectElement(new RectShape(0, 0, engine.globalElementProperties.rectRadius?.clone()), engine.document);
        }
        updateElement(engine, element, from, to) {
            let rect;
            if (this.keyboardStatus.isShift) {
                const size = Math.max(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
                rect = new Rectangle(to.x >= from.x ? from.x : from.x - size, to.y >= from.y ? from.y : from.y - size, size, size);
            }
            else {
                rect = Rectangle.fromPoints(from, to);
            }
            if (this.keyboardStatus.isAlt) {
                // Center
                element.position = from;
                element.anchor = new Point(rect.width, rect.height);
                element.width = rect.width * 2;
                element.height = rect.height * 2;
            }
            else {
                element.position = rect.topLeft;
                element.anchor = Point.ZERO;
                element.width = rect.width;
                element.height = rect.height;
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class EllipseTool extends ShapeBuilderTool {
        get name() {
            return 'ellipse';
        }
        createElement(engine, start) {
            return new EllipseElement(new EllipseShape(0, 0), engine.document);
        }
        updateElement(engine, element, from, to) {
            const rect = Rectangle.fromPoints(from, to);
            if (this.keyboardStatus.isAlt) {
                // git [uTODO: ... copy rectangle behaviour
                element.position = rect.topLeft;
            }
            else {
                // Center
                element.position = from;
            }
            if (this.keyboardStatus.isShift) {
                element.width = element.height = rect.diagonal * 2;
            }
            else {
                element.width = rect.width * 2;
                element.height = rect.height * 2;
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class RegularPolygonTool extends ShapeBuilderTool {
        get name() {
            return 'regular-polygon';
        }
        createElement(engine) {
            const global = engine.globalElementProperties;
            return new RegularPolygonElement(new RegularPolygonShape(global.regularPolygonSides, 0, global.regularPolygonCornerRadius), engine.document);
        }
        updateElement(engine, element, from, to) {
            const radius = from.distanceTo(to);
            element.angle = this.keyboardStatus.isShift ? -90 : to.sub(from).angle;
            if (this.keyboardStatus.isAlt) {
                element.position = Point.center(from, to);
                element.radius = radius / 2;
            }
            else {
                element.position = from;
                element.radius = radius;
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class StarTool extends ShapeBuilderTool {
        get name() {
            return 'star';
        }
        createElement(engine) {
            const global = engine.globalElementProperties;
            return new StarElement(new StarShape(global.starSides, 0, global.starInnerRadiusPercent, global.starOuterCornerRadius, global.starInnerCornerRadius, global.starOuterRotate, global.starInnerRotate, 0), engine.document);
        }
        updateElement(engine, element, from, to) {
            const radius = from.distanceTo(to);
            element.angle = this.keyboardStatus.isShift ? -90 : to.sub(from).angle;
            if (this.keyboardStatus.isAlt) {
                element.position = Point.center(from, to);
                element.outerRadius = radius / 2;
            }
            else {
                element.position = from;
                element.outerRadius = radius;
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class PolyTool extends ShapeBuilderTool {
        constructor() {
            super(...arguments);
            this.isBuilding = false;
        }
        get name() {
            return 'poly';
        }
        onMouseHover(engine, event) {
            if (this.isBuilding) {
                this.currentPoint = this.getSnappedPoint(event.position);
                this.invalidateToolDrawing();
            }
        }
        onMouseLeftButtonMove(engine, event) {
            this.onMouseHover(engine, event);
        }
        onKeyDown(engine, event) {
            if (this.isBuilding && event.key === 'Escape') {
                this.commitElement(engine);
            }
        }
        onMouseLeftButtonDown(engine, event) {
            if (this.isBuilding) {
                this.currentPoint = event.position;
                const points = this.element.shape.points;
                if (event.position.equals(points[points.length - 2])) {
                    this.commitElement(engine);
                }
                else {
                    this.element.shape.points.push(event.position);
                    this.element.invalidateShape();
                }
            }
            else {
                super.onMouseLeftButtonDown(engine, event);
                this.isBuilding = true;
            }
        }
        onMouseLeftButtonUp(engine, event) {
        }
        commitElement(engine) {
            if (!this.element) {
                return;
            }
            const points = this.element.shape.points;
            points.pop();
            this.element.isClosed = points[0].equals(points[points.length - 1]);
            this.element.invalidateShape();
            this.saveElement(engine);
            this.disposeBuilder();
            this.isBuilding = false;
        }
        createElement(engine, startPoint) {
            return new PolyElement(new PolyShape([
                startPoint,
                startPoint,
            ], false), engine.document);
        }
        updateElement(engine, element, startPoint, currentPoint) {
            element.shape.points.splice(-1, 1, currentPoint);
            element.invalidateShape();
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    var Action;
    (function (Action) {
        Action[Action["None"] = 0] = "None";
        Action[Action["Hover"] = 1] = "Hover";
        Action[Action["Move"] = 2] = "Move";
        Action[Action["Select"] = 3] = "Select";
        Action[Action["RectangleSelection"] = 4] = "RectangleSelection";
        Action[Action["Pan"] = 5] = "Pan";
    })(Action || (Action = {}));
    class SelectTool extends BaseTool {
        constructor() {
            super(...arguments);
            this.position = null;
            this.selectionPivot = null;
            this.hoverElement = null;
            this.selectionRectangle = null;
            this.defaultCanvasCursor = exports.Cursor.Pointer;
            this.action = Action.None;
        }
        deactivate(engine) {
            super.deactivate(engine);
            this.action = Action.None;
        }
        updateTheme(engine) {
            const theme = engine.theme;
            this.hoverPen = new DefaultPen(new SolidBrush(theme.elementHover));
            this.selectPen = new DefaultPen(new SolidBrush(theme.selectionBox));
            this.selectFill = new SolidBrush(theme.selectionArea, 0.25);
        }
        get name() {
            return "select";
        }
        render(engine) {
            if (!this.isInvalidated) {
                return;
            }
            switch (this.action) {
                case Action.Hover:
                    engine.cursor = exports.Cursor.PointerSelectable;
                    break;
                case Action.Move:
                case Action.Select:
                    engine.cursor = exports.Cursor.PointerMove;
                    break;
                case Action.RectangleSelection:
                    engine.cursor = exports.Cursor.Pointer;
                    break;
                case Action.Pan:
                    engine.cursor = exports.Cursor.HandHold;
                    break;
                default:
                    engine.cursor = this.defaultCanvasCursor;
            }
            this.drawSnapshotImage(engine, false);
            if (this.action !== Action.Pan) {
                this.drawSelectedElements(engine);
                this.drawHoverElements(engine);
                this.drawSelectionRectangle(engine);
            }
            engine.context.flush();
            this.isInvalidated = false;
        }
        onMouseHover(engine, event) {
            const prev = this.hoverElement;
            this.hoverElement = engine.document.getElementAt(event.position);
            if (prev !== this.hoverElement) {
                this.action = this.hoverElement ? Action.Hover : Action.None;
                this.isInvalidated = true;
            }
        }
        onMouseLeftButtonDown(engine, event) {
            const node = engine.document.getElementAt(event.position);
            if (node !== null) {
                this.action = Action.Select;
                this.position = event.position;
                //engine.selection.toggle(node, this.keyboardStatus.isCtrl);
                engine.selection.select(node, this.keyboardStatus.isCtrl || engine.selection.isSelected(node));
                this.isInvalidated = true;
                return;
            }
            this.action = Action.RectangleSelection;
            this.selectionPivot = event.position;
            this.selectionRectangle = engine.viewBox.getRectangleFromPoints(this.selectionPivot, event.position);
            engine.selection.clear();
            this.isInvalidated = true;
        }
        onMouseLeftButtonMove(engine, event) {
            if (this.selectionPivot !== null) {
                this.selectionRectangle = engine.viewBox.getRectangleFromPoints(this.selectionPivot, event.position);
                this.isInvalidated = true;
                return;
            }
            if (this.position !== null && !this.position.equals(event.position)) {
                const sub = event.position.sub(this.position);
                this.position = event.position;
                if (engine.project.middleware.moveElementsBy(engine.selection, sub)) {
                    this.action = Action.Move;
                    this.invalidate();
                }
                return;
            }
        }
        onMouseLeftButtonUp(engine, event) {
            if (this.selectionPivot) {
                engine.selection.rectSelect(Rectangle.fromTransformedPoints(engine.document.globalMatrix, this.selectionPivot, event.position), engine.document);
                this.selectionRectangle = null;
                this.selectionPivot = null;
                this.isInvalidated = true;
                this.hoverElement = engine.document.getElementAt(event.position);
                this.action = this.hoverElement ? Action.Hover : Action.None;
                return;
            }
            if (this.position !== null) {
                this.position = null;
                // TODO: Check if object was moved
                if (this.action === Action.Move) {
                    engine.project.state.snapshot();
                }
                this.action = Action.Hover;
                this.invalidate();
                return;
            }
        }
        onMouseWheelButtonDown(engine, event) {
            super.onMouseWheelButtonDown(engine, event);
            this.action = Action.Pan;
            this.isInvalidated = true;
        }
        onMouseWheelButtonUp(engine, event) {
            super.onMouseWheelButtonUp(engine, event);
            this.hoverElement = engine.document.getElementAt(event.position);
            this.action = this.hoverElement ? Action.Hover : Action.None;
            this.isInvalidated = true;
        }
        drawSelectedElements(engine) {
            if (engine.selection.length === 0) {
                return;
            }
            const context = engine.context;
            context.save();
            context.multiplyMatrix(engine.viewBox.matrix);
            this.selectPen.width = engine.viewBox.getLineWidth(1);
            for (let node of engine.selection) {
                context.drawRect(node.globalTightBounds, this.selectPen);
            }
            context.restore();
        }
        drawHoverElements(engine) {
            if (this.hoverElement === null) {
                return;
            }
            const context = engine.context;
            context.save();
            context.multiplyMatrix(engine.viewBox.matrix);
            this.hoverPen.width = engine.viewBox.getLineWidth(1);
            if (this.hoverElement instanceof ShapeElement) {
                context.drawPath(this.hoverElement.globalPath, this.hoverPen);
            }
            else {
                context.drawRect(this.hoverElement.globalBounds, this.hoverPen);
            }
            context.restore();
        }
        drawSelectionRectangle(engine) {
            if (this.selectionRectangle !== null && this.selectionRectangle.isVisible) {
                engine.context.drawRect(this.selectionRectangle, this.selectFill);
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class ColorPickerTool extends BaseTool {
        get name() {
            return "color-picker";
        }
        onMouseLeftButtonDown(engine, event) {
            // if (event.domEvent.altKey) {
            //
            //     if (hasAppearanceView???) {
            //         const node = event.engine.document.getElementAt(event) as ShapeElement<any>;
            //         if (!node || !(node instanceof ShapeElement)) {
            //             return;
            //         }
            //
            //         let changed;
            //         if (isStrokeSelected???) {
            //             changed = this.applyStrokeBrush(node.strokeBrush);
            //         } else {
            //             changed = this.applyFillBrush(node.fill);
            //         }
            //
            //         if (changed) {
            //             //
            //         }
            //     }
            //
            //     return;
            // }
            const color = engine.getColorAt(event.position);
            console.log(color);
        }
        onMouseLeftButtonMove(engine, event) {
        }
        onMouseLeftButtonUp(engine, event) {
        }
        applyFillBrush(engine, brush) {
            return engine.project.middleware
                .setElementsPropertyDynamic(engine.selection.vectorElements(), "fill", () => brush.clone());
        }
        applyStrokeBrush(engine, brush) {
            return engine.project.middleware
                .setElementsPropertyDynamic(engine.selection.vectorElements(), "strokeBrush", () => brush.clone());
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function resizeCanvasElement(canvas, width, height, dpr = 1) {
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.width = width * dpr;
        canvas.height = height * dpr;
    }
    class DPRObserver {
        constructor(callback, initial) {
            this.callback = callback;
            this.value = initial || window.devicePixelRatio;
            this.update = this.onChange.bind(this);
            this.updateListener();
        }
        onChange() {
            const dpr = window.devicePixelRatio;
            if (this.value !== dpr) {
                this.value = dpr;
                this.callback(dpr);
                this.updateListener();
            }
        }
        updateListener() {
            this.removeListener();
            this.media = matchMedia(`not screen and (resolution: ${this.value}dppx)`);
            this.media.addEventListener('change', this.update);
        }
        removeListener() {
            if (this.media) {
                this.media.removeEventListener('change', this.update);
                this.media = null;
            }
        }
        dispose() {
            this.removeListener();
            this.update = null;
            this.callback = null;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Ruler {
        constructor(rulerH, rulerV, size = 32) {
            this._rulerH = null;
            this._rulerV = null;
            this._cacheH = null;
            this._cacheV = null;
            this.visible = true;
            this._rulerH = rulerH;
            this._rulerV = rulerV;
            this.size = size;
        }
        dispose() {
            this.visible = false;
            this._rulerH = this._rulerV = null;
            this._cacheH = this._cacheV = null;
        }
        updateSize(width, height, dpr) {
            resizeCanvasElement(this._rulerH.canvas, width, this.size, dpr);
            resizeCanvasElement(this._rulerV.canvas, this.size, height, dpr);
            this._rulerH.scale(dpr, dpr);
            this._rulerV.scale(dpr, dpr);
        }
        getStep(zoom) {
            let step = 0;
            if (zoom >= 1) {
                if (zoom < 5) {
                    step = 100;
                }
                else if (zoom >= 5 && zoom < 10) {
                    step = 50;
                }
                else if (zoom >= 10 && zoom < 25) {
                    step = 20;
                }
                else {
                    step = 10;
                }
            }
            else if (zoom < 1) {
                if (zoom >= 0.5) {
                    step = 200;
                }
                else if (zoom >= 0.25) {
                    step = 400;
                }
                else if (zoom >= 0.125) {
                    step = 800;
                }
                else if (zoom >= 0.05) {
                    step = 1600;
                }
                else if (zoom >= 0.02) {
                    step = 3200;
                }
                else {
                    step = 6400;
                }
            }
            return step;
        }
        draw(engine, clear = false) {
            if (!this.visible) {
                return;
            }
            const rulerH = this._rulerH;
            const rulerV = this._rulerV;
            if (clear) {
                this._cacheH = this._cacheV = null;
            }
            const theme = engine.theme;
            if (this._cacheH !== null) {
                rulerH.putImageData(this._cacheH, 0, 0);
                rulerV.putImageData(this._cacheV, 0, 0);
            }
            const width = engine.canvasElement.width;
            const dpr = engine.dpr;
            this.drawRuler(rulerH, engine.viewBox, width, theme, dpr, false);
            this.drawRuler(rulerV, engine.viewBox, width, theme, dpr, true);
            if (!clear && this._cacheH === null) {
                this._cacheH = rulerH.getImageData(0, 0, rulerH.canvas.width, rulerH.canvas.height);
                this._cacheV = rulerV.getImageData(0, 0, rulerV.canvas.width, rulerV.canvas.height);
            }
            const position = engine.currentPointerPosition;
            if (position) {
                this.drawIndicator(rulerH, position.x, theme, dpr, false);
                this.drawIndicator(rulerV, position.y, theme, dpr, true);
            }
        }
        drawRuler(ctx, viewBox, width, theme, dpr, vertical) {
            ctx.save();
            ctx.fillStyle = theme.rulerBackground.rgba;
            if (vertical) {
                ctx.fillRect(0, 0, this.size, ctx.canvas.height);
            }
            else {
                ctx.fillRect(0, 0, ctx.canvas.width, this.size);
            }
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.strokeStyle = theme.rulerText.rgba;
            ctx.fillStyle = theme.rulerText.rgba;
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = "ideographic";
            ctx.lineWidth = 1;
            // TODO: get the zoom level from viewBox
            const zoom = viewBox.zoom;
            let step = this.getStep(zoom), start = 0;
            const pan = vertical ? viewBox.pan.y : viewBox.pan.x;
            const segment = step * zoom;
            const unit = segment / 10;
            const tx = Math.floor(pan % segment);
            const path = new Path2D();
            if (pan > 0) {
                start = (Math.ceil(-pan / segment) - 1) * step;
            }
            else {
                start = (Math.floor(-pan / segment) - 1) * step;
            }
            const delta = 0.5 * dpr;
            if (vertical) {
                ctx.translate(0, 0);
                ctx.rotate(RADIANS * 90);
                ctx.translate(tx + delta, -this.size + delta);
            }
            else {
                ctx.translate(tx + delta, delta);
            }
            const max = Math.ceil(width / segment) + 2;
            for (let i = -1, k = 0; i < max; i++, k++) {
                const x = i * segment;
                for (let j = 0; j < 10; j++) {
                    const px = Math.floor(x + j * unit);
                    path.moveTo(px, vertical ? 0 : this.size);
                    if (j === 0) {
                        path.lineTo(px, vertical ? 24 : 8);
                        ctx.fillText((start + k * step).toString(), px + 4, vertical ? 20 : 16);
                    }
                    else if (j === 5) {
                        path.lineTo(px, vertical ? 12 : 20);
                    }
                    else {
                        path.lineTo(px, vertical ? 8 : 24);
                    }
                }
            }
            ctx.stroke(path);
            ctx.restore();
        }
        drawIndicator(ctx, position, theme, dpr, vertical) {
            const path = new Path2D();
            ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = theme.rulerIndicator.rgba;
            if (vertical) {
                path.moveTo(0.5, position);
                path.lineTo(this.size, position);
            }
            else {
                path.moveTo(position, 0);
                path.lineTo(position, this.size);
            }
            ctx.stroke(path);
            ctx.restore();
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function getCanvasEngineTemplate () {
        return `
<style>       
    :host {
        display: block;
        margin: 0;
        padding: 0;
        border: none;
        min-width: 300px;
        min-height: 300px;
        height: 100%;
        width: 100%;
        outline: none;
        box-sizing: border-box;
        --bucket-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxnPgogICAgICA8cG9seWdvbiBwb2ludHM9IjAuNSAwLjUyIDAuNSAxMi4zIDMuMSA5LjUyIDkuMTUgMy4wNSAxMS41MSAwLjUyIDAuNSAwLjUyIi8+CiAgICAgIDxwYXRoIGQ9Ik0xLDEuMDJWMTEuMDNMMi43Myw5LjE4LDguNzgsMi43MWwxLjU4LTEuNjlaTTIsOC41VjIuMDJIOC4wNVoiIGZpbGw9IiNmZmYiLz4KICAgIDwvZz4KICAgIDxnPgogICAgICA8cGF0aCBkPSJNOS41NCwyMi45Niw3LjA2LDIwLjQ5LDYsMTkuNDMsNC45NCwyMC40OSwyLjQ2LDIyLjk2YTUuMDA2LDUuMDA2LDAsMSwwLDcuMDgsMFoiLz4KICAgICAgPHBhdGggZD0iTTkuMTgsMjMuMzIsNi43MSwyMC44NCw2LDIwLjE0bC0uNzEuN0wyLjgyLDIzLjMyYTQuNSw0LjUsMCwxLDAsNi4zNiwwWm0tLjcxLDUuNjVhMy40NzcsMy40NzcsMCwwLDEtNC45NCwwLDMuNDgzLDMuNDgzLDAsMCwxLDAtNC45NEw2LDIxLjU1bDIuNDcsMi40OEEzLjQ4MywzLjQ4MywwLDAsMSw4LjQ3LDI4Ljk3WiIgZmlsbD0iI2ZmZiIvPgogICAgPC9nPgogICAgPGc+CiAgICAgIDxwYXRoIGQ9Ik0zMC41NywxNC4wNGwtLjEtLjItLjE1LS4xNUwyNS4xNCw4LjQxbDEuNjMtMS42NGEyLjUsMi41LDAsMCwwLTMuNTQtMy41NEwyMS42MSw0Ljg2bC0uNDctLjQ3YTIuOTg5LDIuOTg5LDAsMCwwLTIuMTktLjg0Yy0yLjAxLDAtNC44MiwxLjU2LTcuMzIsNC4wNmwtNi4yLDYuMzRMMy45NywxNS40NGwxLjg4LjkxLDMuNDksMS42OSw4LjM3LDguMjUuMTUuMTUuMi4xMWEzLjksMy45LDAsMCwwLDEuODQuNDJjMi4xNSwwLDQuOTQtMS40Niw3LjI5LTMuODFDMjkuODcsMjAuNDgsMzEuOTUsMTYuNjIsMzAuNTcsMTQuMDRaIi8+CiAgICAgIDxnPgogICAgICAgIDxwYXRoIGQ9Ik0zMC4xMywxNC4yN2wtLjA3LS4xMy0uMS0uMUwyNC40NCw4LjQxbDEuOTgtMS45OWEyLjAwOCwyLjAwOCwwLDAsMC0yLjg0LTIuODRMMjEuNjEsNS41NmwtLjgyLS44MmEyLjUzNCwyLjUzNCwwLDAsMC0xLjg0LS42OWMtMS44OSwwLTQuNTYsMS41LTYuOTcsMy45MUw1Ljc5LDE0LjNsLS45OC45OSwxLjI1LjYxLDMuNTgsMS43Myw4LjQyLDguMy4xLjExLjEzLjA2YTMuMzI4LDMuMzI4LDAsMCwwLDEuNjEuMzdjMi4wMiwwLDQuNjgtMS40LDYuOTQtMy42NkMyOS44NSwxOS43OSwzMS4yLDE2LjI4LDMwLjEzLDE0LjI3Wm0tNCw3LjgzYy0yLjEzLDIuMTMtNC41NCwzLjM3LTYuMjMsMy4zN2EyLjQsMi40LDAsMCwxLTEuMTQtLjI1TDEwLjIyLDE2LjgsNi41LDE1bDYuMTktNi4zM2MyLjI1LTIuMjUsNC43MS0zLjYyLDYuMjYtMy42MmExLjU0NiwxLjU0NiwwLDAsMSwxLjEzLjRsMS41MywxLjUzLDIuNjgtMi42OWExLjAxNCwxLjAxNCwwLDAsMSwxLjQyLDAsMS4wMDgsMS4wMDgsMCwwLDEsMCwxLjQyTDIzLjAzLDguNGw2LjIyLDYuMzRDMzAuMDgsMTYuMywyOC44LDE5LjQzLDI2LjEzLDIyLjFaIiBmaWxsPSIjZmZmIi8+CiAgICAgICAgPHBhdGggZD0iTTE4LjkzLDExLjA5YTEuMDA4LDEuMDA4LDAsMCwwLDEuNDIsMEwyMy4wMyw4LjQsMjEuNjEsNi45OCwxOC45Myw5LjY3QTEuMDA4LDEuMDA4LDAsMCwwLDE4LjkzLDExLjA5WiIgZmlsbD0iI2ZmZiIvPgogICAgICA8L2c+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K");
        --color-picker-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0yMi4yNSw5LjlsLS4xNS0uMTVhNC41NzUsNC41NzUsMCwwLDAtNi40NywwbC0xLjY3LDEuNjctMS41LDEuNWEyLjU1NywyLjU1NywwLDAsMC0xLjc0Ljc0bC0uMTcuMTdhMi41MDgsMi41MDgsMCwwLDAtLjcsMi4yTDUuMTgsMjAuN2MtMS4yLDEuMi0zLjAyLDMuNDMtMy4xLDMuNTJsLS4zLjM2LS4wOS40NmMtLjA3LjQxLS4yOCwxLjQxLS40NCwyLjA5QTIuNTYsMi41NiwwLDAsMCwzLjA2LDMxLjVhMi41NzYsMi41NzYsMCwwLDAsMS44MS0uNzV2LS4wMWMuNjgtLjE2LDEuNjgtLjM2LDIuMDktLjQ0bC40NS0uMDkuMzctLjI5Yy4wOS0uMDgsMi4zMi0xLjkxLDMuNTEtMy4xbDQuNjgtNC42N2EyLjk2NiwyLjk2NiwwLDAsMCwuNDIuMDMsMi41MjksMi41MjksMCwwLDAsMS43OC0uNzNsLjE3LS4xN2EyLjUyMSwyLjUyMSwwLDAsMCwuNzMtMS43NGwxLjUxLTEuNTEsMS42Ny0xLjY2QTQuNTg3LDQuNTg3LDAsMCwwLDIyLjI1LDkuOVoiLz4KICAgIDxnPgogICAgICA8cGF0aCBkPSJNMjEuODksMTAuMjVsLS4xNS0uMTVhNC4wOCw0LjA4LDAsMCwwLTUuNzYsMGwtMS42NiwxLjY3LTEuNjYsMS42NmMtLjA2LDAtLjExLS4wMS0uMTYtLjAxYTIuMDEyLDIuMDEyLDAsMCwwLTEuNDMuNTlsLS4xNy4xN2EyLjAzNywyLjAzNywwLDAsMC0uNSwyLjAxTDUuNTMsMjEuMDZjLTEuMTgsMS4xNy0yLjk5LDMuMzgtMy4wNiwzLjQ4bC0uMjIuMjYtLjA2LjMzYy0uMDkuNDQtLjMyLDEuNTYtLjQ4LDIuMjVsLS4xMS4xQTIuMDY1LDIuMDY1LDAsMCwwLDMuMDYsMzFhMi4wMzYsMi4wMzYsMCwwLDAsMS40NS0uNjFsLjExLS4xYy42OC0uMTcsMS44LS4zOSwyLjI0LS40OGwuMzQtLjA2LjI2LS4yMmMuMDktLjA4LDIuMy0xLjg5LDMuNDgtMy4wNmw0Ljg3LTQuODdhMi4yNTUsMi4yNTUsMCwwLDAsLjU4LjA4LDEuOTg5LDEuOTg5LDAsMCwwLDEuNDItLjU5bC4xNy0uMTdhMS45ODksMS45ODksMCwwLDAsLjU5LTEuNDJ2LS4xNmwxLjY2LTEuNjYsMS42Ni0xLjY3YTQuMDU2LDQuMDU2LDAsMCwwLDAtNS43NlptLS45NSw0LjgxLTEuNjcsMS42NkwxNywxOWwuMDMuMDNhLjY2NC42NjQsMCwwLDEsMCwuOTRsLS4xNy4xN2EuNjc2LjY3NiwwLDAsMS0uOTQsMGwtLjI4LS4yOUw5Ljk4LDI1LjUxQzguODQsMjYuNjUsNi42LDI4LjQ5LDYuNiwyOC40OXMtMS45Mi4zNy0yLjY4LjU5bC0uMzYuMzZhLjcwNy43MDcsMCwxLDEtMS0xbC4zNi0uMzZjLjIyLS43Ny41OS0yLjY5LjU5LTIuNjlzMS44My0yLjI0LDIuOTctMy4zOGw1LjY2LTUuNjYtLjI4LS4yOGEuNjUyLjY1MiwwLDAsMSwwLS45M2wuMTctLjE3YS42NDEuNjQxLDAsMCwxLC45MywwTDEzLDE1bDIuMjctMi4yOCwxLjY3LTEuNjZhMi43MTYsMi43MTYsMCwwLDEsMy44NSwwbC4xNS4xNUEyLjcyOCwyLjcyOCwwLDAsMSwyMC45NCwxNS4wNloiIGZpbGw9IiNmZmYiLz4KICAgICAgPHBhdGggZD0iTTcuMTkyLDIyLjcxOWMtLjkuOS0yLjI4NSwyLjU1NC0yLjc0OSwzLjExNS0uMDg5LjQ0NS0uMjgsMS4zODItLjQ0NSwyLjA2NmEuNi42LDAsMCwxLC4wNTkuMDM5aDBjLjAxNy4wMTguMDI0LjA0LjAzOS4wNTkuNjg0LS4xNjUsMS42MjEtLjM1NiwyLjA2Ny0uNDQ0LjU2LS40NjUsMi4yMTItMS44NDcsMy4xMTUtMi43NWw1LjY1Ny01LjY1Ny0yLjA4Ni0yLjA4NVoiIGZpbGw9IiNmZmYiLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPgo=");
        --hand-hold-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0xNC4zODEsMjguNWE0LjA1NSw0LjA1NSwwLDAsMS0yLjk0OC0uODQxLDUwLjYyNiw1MC42MjYsMCwwLDEtNS44Mi02LjM0Myw0LjE2Nyw0LjE2NywwLDAsMS0uNDQxLTMuMTc0LDQuNjgzLDQuNjgzLDAsMCwxLDEuNTY3LTMuMDY5LDEuNDY0LDEuNDY0LDAsMCwxLC43NjQtLjI1OC44NzQuODc0LDAsMCwxLC42NjIuMjg4LDE5LjE5NCwxOS4xOTQsMCwwLDAtLjY0LTIuNDQ1LDIuOTIzLDIuOTIzLDAsMCwxLC4yLTIuMjY4QTIuNzM2LDIuNzM2LDAsMCwxLDkuMzYxLDkuMDJhMi40NzIsMi40NzIsMCwwLDEsLjY4Ni0uMDkzLDMuNDExLDMuNDExLDAsMCwxLDIuNTI0LDEuMiwyLjYsMi42LDAsMCwxLDIuNDc3LTIuMUEzLjI3LDMuMjcsMCwwLDEsMTguMzM0LDEwLjFsLjEuMTc5Yy4wOC4xNDEuMTI4LjE2OS4xMjkuMTY5YTIuNywyLjcsMCwwLDAsLjU2NS0uMzQxLDMuNTA2LDMuNTA2LDAsMCwxLDItLjgsMi42NTksMi42NTksMCwwLDEsMS4wNjkuMjM1LDIuNTA3LDIuNTA3LDAsMCwxLDEuMzE4LDEuNzQxLDUuOTkyLDUuOTkyLDAsMCwwLC4yODkuNzM4LDIuODc1LDIuODc1LDAsMCwxLDEuMzc0LS4zNzQsMy40NjUsMy40NjUsMCwwLDEsMS41NDIuNDA2YzEuMzM0LjY2NywxLjUwNywyLjMzMywxLjEwNSwzLjZMMjMuODExLDI2LjQyM2EyLjkyLDIuOTIsMCwwLDEtMi43LDIuMDc3WiIgZmlsbD0iI2ZmZiIvPgogICAgPHBhdGggZD0iTTE1LjA0OCw4LjUyM2MxLjk1MiwwLDIuMzgyLjk5NCwyLjk1MiwyLC4xNzEuMy4zNS40MTcuNTQ1LjQxNy42MTMsMCwxLjM4Ni0xLjEzNCwyLjU4Ni0xLjEzNEEyLjEzMiwyLjEzMiwwLDAsMSwyMiwxMGMxLjAxNC40NDYuOSwxLjUxNSwxLjUsMi41YS4xODguMTg4LDAsMCwwLC4xNjcuMTA1Yy4yNjEsMCwuNy0uNDU3LDEuNTE1LS40NTdBMi45MzIsMi45MzIsMCwwLDEsMjYuNSwxMi41YTIuNDQsMi40NCwwLDAsMSwuODUzLDNMMjMuMzQxLDI2LjI0OEEyLjQxMywyLjQxMywwLDAsMSwyMS4xMSwyOEgxNC4zODFhMy41ODMsMy41ODMsMCwwLDEtMi42MzEtLjcyOEE0OS45OTMsNDkuOTkzLDAsMCwxLDYsMjFjLS45MzQtMS4xNC0uMjM4LTQuNzQyLDEtNS41YTEuMDE1LDEuMDE1LDAsMCwxLC41LS4xODRjLjQ5MiwwLC41NTcuNzkyLDEuMTE1LDEuNTQ1LjA0Ny4wNjQuMDg3LjA5NC4xMTkuMDk0LjI3NiwwLC4wMDctMi4yMTgtLjczNy00LjQ1NWEyLjM5MiwyLjM5MiwwLDAsMSwxLjUtMywxLjk2OSwxLjk2OSwwLDAsMSwuNTQ3LS4wNzNBMi42OTQsMi42OTQsMCwwLDEsMTIuNSwxMWMuMDg5LjI1NS4xNDkuMzYxLjIuMzYxLjI1MywwLC4yMTYtMi44MzgsMi4zNS0yLjgzOG0wLTFhMi44MzEsMi44MzEsMCwwLDAtMi42NjEsMS43MjYsMy44NTQsMy44NTQsMCwwLDAtMi4zNC0uODIyLDIuOTYxLDIuOTYxLDAsMCwwLS44MjQuMTEyLDMuMjM5LDMuMjM5LDAsMCwwLTEuOTM2LDEuNjE3LDMuNDI3LDMuNDI3LDAsMCwwLS4yMzYsMi42NmMuMTczLjUxOS4zMTYsMS4wMjkuNDMsMS41YTEuOTcyLDEuOTcyLDAsMCwwLTEsLjMzMWMtMS4yNjUuNzc0LTEuNywyLjgwNi0xLjgsMy40MS0uMTIzLjcyNS0uMzE1LDIuNTI0LjU0NywzLjU3N2E1MS4wNTcsNTEuMDU3LDAsMCwwLDUuODg5LDYuNDExQTQuNTE5LDQuNTE5LDAsMCwwLDE0LjM4MSwyOUgyMS4xMWEzLjQyMSwzLjQyMSwwLDAsMCwzLjE4MS0yLjQzN2w0LTEwLjcxM2MuNTg0LTEuODM0LjAyNS0zLjU2LTEuMzQzLTQuMjQ0YTMuOTU0LDMuOTU0LDAsMCwwLTEuNzY1LS40NTgsMy4wODcsMy4wODcsMCwwLDAtMS4xMS4yMDVjLS4wMjctLjA3Ni0uMDUzLS4xNTItLjA3OS0uMjNBMi45ODUsMi45ODUsMCwwLDAsMjIuNCw5LjA4NWEzLjE0NiwzLjE0NiwwLDAsMC0xLjI3Mi0uMjc5LDMuOTcxLDMuOTcxLDAsMCwwLTIuMjg3Ljg4NmMtLjAzNy4wMjYtLjA3Ny4wNTQtLjExOC4wODFhMy43MywzLjczLDAsMCwwLTMuNjc4LTIuMjVaIi8+CiAgPC9nPgo8L3N2Zz4K");
        --hand-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0xNC4zODEsMjguNWE0LjA1Niw0LjA1NiwwLDAsMS0yLjk0OC0uODQxLDY3Ljg2LDY3Ljg2LDAsMCwxLTYuNzY2LTcuNDQxLDIuOTcyLDIuOTcyLDAsMCwxLS42MjUtMi4zODMsMi45MTQsMi45MTQsMCwwLDEsMS4zMzctMiwyLjczMSwyLjczMSwwLDAsMSwzLjY0MS43MzFjLjEwNi4xNDQuMjIzLjMxOC4zNDEuNTA2LS40MDYtMS4yMjgtMi4yNS02Ljc1LTIuMjUtNi43NUEyLjg1LDIuODUsMCwwLDEsNy4yOSw4LjEwNiwyLjY1MiwyLjY1MiwwLDAsMSw4LjksNi43NzVhMi42LDIuNiwwLDAsMSwuNzExLS4xQTIuNjU5LDIuNjU5LDAsMCwxLDEyLjEsOC40ODZjLjIxNC42MTQuNTA1LDEuNTA4LjgsMi40MjktLjE4NC0xLjU3OS0uMzg2LTMuMzI3LS40NzktNC40NTVhMi43OTQsMi43OTQsMCwwLDEsLjcxOS0yLjExNywyLjU2NywyLjU2NywwLDAsMSwxLjktLjg0MywyLjY1MiwyLjY1MiwwLDAsMSwyLjYyLDIuNDk0Yy4wODMsMS4wMDkuMjMyLDIuNy4zNzQsNC4zMTMuMDM5LjQ0NC4wNzguODgxLjExNCwxLjMuMDE0LS4xNDEuMDI3LS4yODUuMDQtLjQyOS4xNDMtMS41MzkuMy0zLjI4Mi40OTEtNC4zMzJBMi42NTYsMi42NTYsMCwwLDEsMjEuMjcyLDQuNmEyLjU3NiwyLjU3NiwwLDAsMSwuNzA4LjEsMi43MjEsMi43MjEsMCwwLDEsMS44ODUsMy4xMTVjLS4xMTMuNjU0LS4yNTQsMS41OS0uNCwyLjU3Ni4wMzQtLjExMS4wNjgtLjIxNC4xLS4zMDhhMi41NTYsMi41NTYsMCwwLDEsMi4zODktMS43NCwyLjQ2OSwyLjQ2OSwwLDAsMSwuNjgyLjFBMi41NCwyLjU0LDAsMCwxLDI4LjE4LDkuN2EyLjczNCwyLjczNCwwLDAsMSwuMTkyLDIuMTA1TDIzLjgxOSwyNi40YTIuOTI5LDIuOTI5LDAsMCwxLTIuNzA5LDIuMVoiIGZpbGw9IiNmZmYiLz4KICAgIDxwYXRoIGQ9Ik0xNS4wNDgsNEEyLjE2OSwyLjE2OSwwLDAsMSwxNy4xNyw2LjAzNWMuMTY0LDIsLjU4OCw2LjY3NS43LDguMDlhLjI1Mi4yNTIsMCwwLDAsLjI1NC4yNDQuMjQ4LjI0OCwwLDAsMCwuMjQ3LS4yMTRjLjIxMy0xLjExMy40NzQtNS4zMzkuODA3LTcuMjI2QTIuMTYsMi4xNiwwLDAsMSwyMS4yNzMsNS4xYTIuMDU1LDIuMDU1LDAsMCwxLC41NjkuMDgyLDIuMjM0LDIuMjM0LDAsMCwxLDEuNTMxLDIuNTQ4Yy0uMzI2LDEuODc4LS44NzUsNi4wOC0xLjA2Niw3LjFhLjIyNS4yMjUsMCwwLDAsLjIyLjI3NC4yMDkuMjA5LDAsMCwwLC4yLS4xMzZjLjI2NC0uNjEuODg3LTMuNDgxLDEuMzItNC43MjRhMi4wNDcsMi4wNDcsMCwwLDEsMS45MTYtMS40LDEuOTYyLDEuOTYyLDAsMCwxLC41NDMuMDc3QTIuMTUyLDIuMTUyLDAsMCwxLDI3LjksMTEuNjU2TDIzLjM0MSwyNi4yNDhBMi40MTMsMi40MTMsMCwwLDEsMjEuMTEsMjhIMTQuMzgxYTMuNTgzLDMuNTgzLDAsMCwxLTIuNjMxLS43MjgsNjkuMjE0LDY5LjIxNCwwLDAsMS02LjctNy4zNzEsMi40NzEsMi40NzEsMCwwLDEsLjU4OC0zLjY0MkEyLjIxNSwyLjIxNSwwLDAsMSw2LjgsMTUuOTNhMi4yNjMsMi4yNjMsMCwwLDEsMS44MTguOTMxYy40NTIuNjA5LDEuMTQ0LDEuOSwxLjMsMi4xMTJhLjI3NC4yNzQsMCwwLDAsLjIyMi4xMTcuMy4zLDAsMCwwLC4yNzUtLjM5NGMtLjQ3MS0xLjQ4LTItNi4wMzgtMi44MzMtOC41MzVhMi4yNjYsMi4yNjYsMCwwLDEsMS40NTgtMi45LDIuMDYzLDIuMDYzLDAsMCwxLC41NzItLjA4MSwyLjE1MiwyLjE1MiwwLDAsMSwyLjAxNiwxLjQ3NmMuNTQ3LDEuNTY5LDEuNiw0Ljk4OSwxLjk0LDUuOTU0YS4xMTcuMTE3LDAsMCwwLC4xMTEuMDgzLjEyMi4xMjIsMCwwLDAsLjEyMy0uMTM3Yy0uMTIzLTEuNTQzLS43LTUuOTUzLS44OC04LjEzMkEyLjE5MSwyLjE5MSwwLDAsMSwxNS4wNDgsNG0wLTFhMy4wNTgsMy4wNTgsMCwwLDAtMi4yNjksMSwzLjI5NCwzLjI5NCwwLDAsMC0uODUsMi41Yy4wMi4yNDUuMDQ1LjUxNi4wNzMuODA2QTMuMTE0LDMuMTE0LDAsMCwwLDkuNjE2LDYuMTc1YTMuMDYsMy4wNiwwLDAsMC0uODQ5LjEyQTMuMTQyLDMuMTQyLDAsMCwwLDYuODQ4LDcuODczYTMuMzQzLDMuMzQzLDAsMCwwLS4yMTEsMi42bC44NDgsMi41NDNjLjI0Ny43MzcuNSwxLjUwNi43NSwyLjI0NWEzLjIyMiwzLjIyMiwwLDAsMC0zLjExNi4xNDFBMy40LDMuNCwwLDAsMCwzLjU1LDE3Ljc1MWEzLjQ3MSwzLjQ3MSwwLDAsMCwuNzMsMi43ODQsNjguMzMzLDY4LjMzMywwLDAsMCw2LjgzNSw3LjUxQTQuNTE5LDQuNTE5LDAsMCwwLDE0LjM4MSwyOUgyMS4xMWEzLjQyMSwzLjQyMSwwLDAsMCwzLjE4MS0yLjQzN0wyOC44NSwxMS45NTRhMy4yMzIsMy4yMzIsMCwwLDAtLjIyOS0yLjQ4NiwzLjAzOCwzLjAzOCwwLDAsMC0xLjg0Mi0xLjUsMi45NTQsMi45NTQsMCwwLDAtMi41LjQwN2MuMDI3LS4xNjguMDUzLS4zMjQuMDc4LS40NjZhMy4yMjMsMy4yMjMsMCwwLDAtMi4yNC0zLjY4LDMuMDQ2LDMuMDQ2LDAsMCwwLS44NDYtLjEyMSwzLjE1MiwzLjE1MiwwLDAsMC0zLjA1MSwyLjUxMWMtLjAyMS0uMjQyLS4wMzktLjQ2NS0uMDU2LS42NjFBMy4xNSwzLjE1LDAsMCwwLDE1LjA0OCwzWiIvPgogIDwvZz4KPC9zdmc+Cg==");
        --move-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8cmVjdCB4PSIxMyIgeT0iMTMuNSIgd2lkdGg9IjYiIGhlaWdodD0iNiIgcng9IjIuOTYiLz4KICA8cGF0aCBkPSJNMTYuMDM0LDE0aC0uMDY4QTIuNDY2LDIuNDY2LDAsMCwwLDEzLjUsMTYuNDY2di4wNjhBMi40NjYsMi40NjYsMCwwLDAsMTUuOTY2LDE5aC4wNjhBMi40NjYsMi40NjYsMCwwLDAsMTguNSwxNi41MzR2LS4wNjhBMi40NjYsMi40NjYsMCwwLDAsMTYuMDM0LDE0Wk0xNy41LDE2LjUyQTEuNDgsMS40OCwwLDAsMSwxNi4wMiwxOGgtLjA0YTEuNDgsMS40OCwwLDAsMS0xLjQ4LTEuNDh2LS4wNEExLjQ4LDEuNDgsMCwwLDEsMTUuOTgsMTVoLjA0YTEuNDgsMS40OCwwLDAsMSwxLjQ4LDEuNDhaIiBmaWxsPSIjZmZmIi8+CiAgPGc+CiAgICA8cG9seWdvbiBwb2ludHM9IjE1Ljk4OCAyIDE1LjE3MiAzLjE4NCAxMS41OTUgOC4zNzUgMTAuNDc1IDEwIDEyLjQxMSAxMCAxOS41NjQgMTAgMjEuNSAxMCAyMC4zOCA4LjM3NSAxNi44MDMgMy4xODQgMTUuOTg4IDIgMTUuOTg4IDIiLz4KICAgIDxwYXRoIGQ9Ik0yMC41MzIsOS40ODVIMTEuNDQzTDE1Ljk4OCwyLjg5Wm0tNy4xNTMtMS4wM0gxOC42TDE1Ljk4OCw0LjY2OVoiIGZpbGw9IiNmZmYiLz4KICA8L2c+CiAgPGc+CiAgICA8cG9seWdvbiBwb2ludHM9IjMwLjUgMTYuNDg4IDI5LjMxNiAxNS42NzIgMjQuMTI1IDEyLjA5NSAyMi41IDEwLjk3NSAyMi41IDEyLjkxMSAyMi41IDIwLjA2NCAyMi41IDIyIDI0LjEyNSAyMC44OCAyOS4zMTYgMTcuMzAzIDMwLjUgMTYuNDg4IDMwLjUgMTYuNDg4Ii8+CiAgICA8cGF0aCBkPSJNMjMuMDE1LDIxLjAzMlYxMS45NDNsNi41OTUsNC41NDVabTEuMDMtNy4xNTNWMTkuMWwzLjc4Ni0yLjYwOFoiIGZpbGw9IiNmZmYiLz4KICA8L2c+CiAgPGc+CiAgICA8cG9seWdvbiBwb2ludHM9IjE2LjAxMiAzMSAxNi44MjggMjkuODE2IDIwLjQwNSAyNC42MjUgMjEuNTI1IDIzIDE5LjU4OSAyMyAxMi40MzYgMjMgMTAuNSAyMyAxMS42MiAyNC42MjUgMTUuMTk3IDI5LjgxNiAxNi4wMTIgMzEgMTYuMDEyIDMxIi8+CiAgICA8cGF0aCBkPSJNMTEuNDY4LDIzLjUxNWg5LjA4OUwxNi4wMTIsMzAuMTFabTcuMTUzLDEuMDNIMTMuNGwyLjYwOCwzLjc4NloiIGZpbGw9IiNmZmYiLz4KICA8L2c+CiAgPGc+CiAgICA8cG9seWdvbiBwb2ludHM9IjEuNSAxNi41MTIgMi42ODQgMTcuMzI4IDcuODc1IDIwLjkwNSA5LjUgMjIuMDI1IDkuNSAyMC4wODkgOS41IDEyLjkzNiA5LjUgMTEgNy44NzUgMTIuMTIgMi42ODQgMTUuNjk3IDEuNSAxNi41MTIgMS41IDE2LjUxMiIvPgogICAgPHBhdGggZD0iTTguOTg1LDExLjk2OHY5LjA4OUwyLjM5LDE2LjUxMlptLTEuMDMsNy4xNTNWMTMuOUw0LjE2OSwxNi41MTJaIiBmaWxsPSIjZmZmIi8+CiAgPC9nPgo8L3N2Zz4K");
        --not-allowed-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxyZWN0IHg9IjEuOTE1IiB5PSIyIiB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHJ4PSIxNCIvPgogICAgPHJlY3QgeD0iMi40MTUiIHk9IjIuNSIgd2lkdGg9IjI3IiBoZWlnaHQ9IjI3IiByeD0iMTMuNSIgZmlsbD0iI2ZmZiIvPgogICAgPHBhdGggZD0iTTE1LjkxNSw0YTEyLDEyLDAsMSwwLDEyLDEyQTEyLDEyLDAsMCwwLDE1LjkxNSw0Wm0tMTAsMTJBOS45MzQsOS45MzQsMCwwLDEsNy45NjMsOS45NjJsMTMuOTksMTMuOTlBOS45ODEsOS45ODEsMCwwLDEsNS45MTUsMTZabTE3LjUsNi41ODlMOS4zMjYsOC41QTkuOTg0LDkuOTg0LDAsMCwxLDIzLjQxOCwyMi41ODlaIi8+CiAgPC9nPgo8L3N2Zz4K");
        --pen-add-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMjUuNSAyMiAyNS41IDE5IDIxLjUgMTkgMjEuNSAyMiAxOC41IDIyIDE4LjUgMjYgMjEuNSAyNiAyMS41IDI5IDI1LjUgMjkgMjUuNSAyNiAyOC41IDI2IDI4LjUgMjIgMjUuNSAyMiIvPgogICAgPHBhdGggZD0iTTI1LDIyLjV2LTNIMjJ2M0gxOXYzaDN2M2gzdi0zaDN2LTNabTIsMkgyNHYzSDIzdi0zSDIwdi0xaDN2LTNoMXYzaDNaIiBmaWxsPSIjZmZmIi8+CiAgPC9nPgogIDxnPgogICAgPHBhdGggZD0iTTE1LDEzLDEzLjcyLDYuNThBMi4wMzgsMi4wMzgsMCwwLDAsMTIuNDcsNS4xTC41LjVWMTMuNGEyLDIsMCwwLDAsLjkzLDEuNjlMNiwxOGwzLDQuNSw4LjUtNVpNNi40MiwxNy43MmwtLjA2LS4wOS0uMDktLjA1TDEuNjksMTQuNjdBMS41MDYsMS41MDYsMCwwLDEsMSwxMy40VjEuMjNMMTIuMjksNS41N2ExLjUxMywxLjUxMywwLDAsMSwuOTQsMS4xMWwxLjI4LDYuNDIuMDIuMDcuMDMuMDcsMi4yNyw0LjA4TDkuMTUsMjEuODNaIiBmaWxsPSIjZmZmIi8+CiAgICA8cGF0aCBkPSJNMTUsMTMsMTMuNzIsNi41OEEyLjAzOCwyLjAzOCwwLDAsMCwxMi40Nyw1LjFMLjUuNVYxMy40YTIsMiwwLDAsMCwuOTMsMS42OUw2LDE4bDMsNC41LDguNS01WiIvPgogICAgPHBhdGggZD0iTTYuNDIsMTcuNzJsLS4wNi0uMDktLjA5LS4wNUwxLjY5LDE0LjY3QTEuNTA2LDEuNTA2LDAsMCwxLDEsMTMuNFYxLjIzTDEyLjI5LDUuNTdhMS41MTMsMS41MTMsMCwwLDEsLjk0LDEuMTFsMS4yOCw2LjQyLjAyLjA3LjAzLjA3LDIuMjcsNC4wOEw5LjE1LDIxLjgzWiIgZmlsbD0iI2ZmZiIvPgogICAgPHBhdGggZD0iTTE1LjI4LDE2Ljg5bC01Ljc3LDMuNEw3LjM3LDE3LjA4bC0uMTktLjI5LS4yOS0uMThMMi4zMSwxMy43YS4zNjYuMzY2LDAsMCwxLS4xNi0uM1YzLjg3TDYuMTIsOS40MkExLjQzNSwxLjQzNSwwLDAsMCw2LDEwLDEuNSwxLjUsMCwxLDAsNy41LDguNWExLjM0NSwxLjM0NSwwLDAsMC0uMzUuMDVMMy40OCwzLjQxbDguNCwzLjIzYS4zODQuMzg0LDAsMCwxLC4yMi4yNmwxLjI4LDYuNDIuMDUuMjYuMTMuMjJaIi8+CiAgPC9nPgo8L3N2Zz4K");
        --pen-close-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8cGF0aCBkPSJNMjUuNDcsMjIuMDNBMy40OTMsMy40OTMsMCwxLDAsMjMsMjhhMy41LDMuNSwwLDAsMCwzLjUtMy41QTMuNDYsMy40NiwwLDAsMCwyNS40NywyMi4wM1oiLz4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0xNSwxMywxMy43Miw2LjU4QTIuMDM4LDIuMDM4LDAsMCwwLDEyLjQ3LDUuMUwuNS41VjEzLjRhMiwyLDAsMCwwLC45MywxLjY5TDYsMThsMyw0LjUsOC41LTVaTTYuNDIsMTcuNzJsLS4wNi0uMDktLjA5LS4wNUwxLjY5LDE0LjY3QTEuNTA2LDEuNTA2LDAsMCwxLDEsMTMuNFYxLjIzTDEyLjI5LDUuNTdhMS41MTMsMS41MTMsMCwwLDEsLjk0LDEuMTFsMS4yOCw2LjQyLjAyLjA3LjAzLjA3LDIuMjcsNC4wOEw5LjE1LDIxLjgzWiIgZmlsbD0iI2ZmZiIvPgogICAgPHBhdGggZD0iTTE1LDEzLDEzLjcyLDYuNThBMi4wMzgsMi4wMzgsMCwwLDAsMTIuNDcsNS4xTC41LjVWMTMuNGEyLDIsMCwwLDAsLjkzLDEuNjlMNiwxOGwzLDQuNSw4LjUtNVoiLz4KICAgIDxwYXRoIGQ9Ik02LjQyLDE3LjcybC0uMDYtLjA5LS4wOS0uMDVMMS42OSwxNC42N0ExLjUwNiwxLjUwNiwwLDAsMSwxLDEzLjRWMS4yM0wxMi4yOSw1LjU3YTEuNTEzLDEuNTEzLDAsMCwxLC45NCwxLjExbDEuMjgsNi40Mi4wMi4wNy4wMy4wNywyLjI3LDQuMDhMOS4xNSwyMS44M1oiIGZpbGw9IiNmZmYiLz4KICAgIDxwYXRoIGQ9Ik0xNS4yOCwxNi44OWwtNS43NywzLjRMNy4zNywxNy4wOGwtLjE5LS4yOS0uMjktLjE4TDIuMzEsMTMuN2EuMzY2LjM2NiwwLDAsMS0uMTYtLjNWMy44N0w2LjEyLDkuNDJBMS40MzUsMS40MzUsMCwwLDAsNiwxMCwxLjUsMS41LDAsMSwwLDcuNSw4LjVhMS4zNDUsMS4zNDUsMCwwLDAtLjM1LjA1TDMuNDgsMy40MWw4LjQsMy4yM2EuMzg0LjM4NCwwLDAsMSwuMjIuMjZsMS4yOCw2LjQyLjA1LjI2LjEzLjIyWiIvPgogIDwvZz4KICA8cGF0aCBkPSJNMjUuMTIsMjIuMzhBMi45OTQsMi45OTQsMCwxLDAsMjYsMjQuNSwyLjk5MywyLjk5MywwLDAsMCwyNS4xMiwyMi4zOFpNMjMsMjYuMjVhMS43NSwxLjc1LDAsMSwxLDEuNzUtMS43NUExLjc1OCwxLjc1OCwwLDAsMSwyMywyNi4yNVoiIGZpbGw9IiNmZmYiLz4KPC9zdmc+Cg==");
        --pen-continue-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0xNSwxMywxMy43Miw2LjU4QTIuMDM4LDIuMDM4LDAsMCwwLDEyLjQ3LDUuMUwuNS41VjEzLjRhMiwyLDAsMCwwLC45MywxLjY5TDYsMThsMyw0LjUsOC41LTVaTTYuNDIsMTcuNzJsLS4wNi0uMDktLjA5LS4wNUwxLjY5LDE0LjY3QTEuNTA2LDEuNTA2LDAsMCwxLDEsMTMuNFYxLjIzTDEyLjI5LDUuNTdhMS41MTMsMS41MTMsMCwwLDEsLjk0LDEuMTFsMS4yOCw2LjQyLjAyLjA3LjAzLjA3LDIuMjcsNC4wOEw5LjE1LDIxLjgzWiIgZmlsbD0iI2ZmZiIvPgogICAgPHBhdGggZD0iTTE1LDEzLDEzLjcyLDYuNThBMi4wMzgsMi4wMzgsMCwwLDAsMTIuNDcsNS4xTC41LjVWMTMuNGEyLDIsMCwwLDAsLjkzLDEuNjlMNiwxOGwzLDQuNSw4LjUtNVoiLz4KICAgIDxwYXRoIGQ9Ik02LjQyLDE3LjcybC0uMDYtLjA5LS4wOS0uMDVMMS42OSwxNC42N0ExLjUwNiwxLjUwNiwwLDAsMSwxLDEzLjRWMS4yM0wxMi4yOSw1LjU3YTEuNTEzLDEuNTEzLDAsMCwxLC45NCwxLjExbDEuMjgsNi40Mi4wMi4wNy4wMy4wNywyLjI3LDQuMDhMOS4xNSwyMS44M1oiIGZpbGw9IiNmZmYiLz4KICAgIDxwYXRoIGQ9Ik0xNS4yOCwxNi44OWwtNS43NywzLjRMNy4zNywxNy4wOGwtLjE5LS4yOS0uMjktLjE4TDIuMzEsMTMuN2EuMzY2LjM2NiwwLDAsMS0uMTYtLjNWMy44N0w2LjEyLDkuNDJBMS40MzUsMS40MzUsMCwwLDAsNiwxMCwxLjUsMS41LDAsMSwwLDcuNSw4LjVhMS4zNDUsMS4zNDUsMCwwLDAtLjM1LjA1TDMuNDgsMy40MWw4LjQsMy4yM2EuMzg0LjM4NCwwLDAsMSwuMjIuMjZsMS4yOCw2LjQyLjA1LjI2LjEzLjIyWiIvPgogIDwvZz4KICA8cG9seWdvbiBwb2ludHM9IjI4LjczIDIwLjY3IDI4LjAzIDE5LjUxIDI3LjI2IDE4LjIzIDI1Ljk3IDE5IDE1Ljk3IDI1IDE0LjY5IDI1Ljc3IDE1LjQ2IDI3LjA2IDE2LjE2IDI4LjIyIDE2LjkzIDI5LjUgMTguMjEgMjguNzMgMjguMjEgMjIuNzMgMjkuNSAyMS45NiAyOC43MyAyMC42NyIvPgogIDxwYXRoIGQ9Ik0yOC4zLDIwLjkzbC0uNy0xLjE2LS41MS0uODYtLjg2LjUyLTEwLDYtLjg2LjUxLjUyLjg2LjY5LDEuMTYuNTIuODUuODYtLjUxLDEwLTYsLjg1LS41MVpNMTcuNDQsMjcuNDRsLS42OS0xLjE1LDEwLTYsLjY5LDEuMTVaIiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPgo=");
        --pen-point-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0xNSwxMywxMy43Miw2LjU4QTIuMDM4LDIuMDM4LDAsMCwwLDEyLjQ3LDUuMUwuNS41VjEzLjRhMiwyLDAsMCwwLC45MywxLjY5TDYsMThsMyw0LjUsOC41LTVaTTYuNDIsMTcuNzJsLS4wNi0uMDktLjA5LS4wNUwxLjY5LDE0LjY3QTEuNTA2LDEuNTA2LDAsMCwxLDEsMTMuNFYxLjIzTDEyLjI5LDUuNTdhMS41MTMsMS41MTMsMCwwLDEsLjk0LDEuMTFsMS4yOCw2LjQyLjAyLjA3LjAzLjA3LDIuMjcsNC4wOEw5LjE1LDIxLjgzWiIgZmlsbD0iI2ZmZiIvPgogICAgPHBhdGggZD0iTTE1LDEzLDEzLjcyLDYuNThBMi4wMzgsMi4wMzgsMCwwLDAsMTIuNDcsNS4xTC41LjVWMTMuNGEyLDIsMCwwLDAsLjkzLDEuNjlMNiwxOGwzLDQuNSw4LjUtNVoiLz4KICAgIDxwYXRoIGQ9Ik02LjQyLDE3LjcybC0uMDYtLjA5LS4wOS0uMDVMMS42OSwxNC42N0ExLjUwNiwxLjUwNiwwLDAsMSwxLDEzLjRWMS4yM0wxMi4yOSw1LjU3YTEuNTEzLDEuNTEzLDAsMCwxLC45NCwxLjExbDEuMjgsNi40Mi4wMi4wNy4wMy4wNywyLjI3LDQuMDhMOS4xNSwyMS44M1oiIGZpbGw9IiNmZmYiLz4KICAgIDxwYXRoIGQ9Ik0xNS4yOCwxNi44OWwtNS43NywzLjRMNy4zNywxNy4wOGwtLjE5LS4yOS0uMjktLjE4TDIuMzEsMTMuN2EuMzY2LjM2NiwwLDAsMS0uMTYtLjNWMy44N0w2LjEyLDkuNDJBMS40MzUsMS40MzUsMCwwLDAsNiwxMCwxLjUsMS41LDAsMSwwLDcuNSw4LjVhMS4zNDUsMS4zNDUsMCwwLDAtLjM1LjA1TDMuNDgsMy40MWw4LjQsMy4yM2EuMzg0LjM4NCwwLDAsMSwuMjIuMjZsMS4yOCw2LjQyLjA1LjI2LjEzLjIyWiIvPgogIDwvZz4KICA8cGF0aCBkPSJNMzAuMzUsMjQuMmEyLjYsMi42LDAsMCwwLTIuMjQtMi41N0EyLjYsMi42LDAsMCwwLDI3LDE4LjRhMi41NTksMi41NTksMCwwLDAtMS4zLS4zNSwyLjYzMiwyLjYzMiwwLDAsMC0yLjA1LDEsMi42LDIuNiwwLDAsMC00LjQ2LDIuNTgsMi42LDIuNiwwLDAsMCwwLDUuMTUsMi42LDIuNiwwLDAsMCw0LjQ2LDIuNTcsMi42MzIsMi42MzIsMCwwLDAsMi4wNSwxQTIuNTU5LDIuNTU5LDAsMCwwLDI3LDMwYTIuNTg4LDIuNTg4LDAsMCwwLDEuMTEtMy4yMkEyLjYxNywyLjYxNywwLDAsMCwzMC4zNSwyNC4yWiIvPgogIDxwYXRoIGQ9Ik0yOS44NSwyNC4yYTIuMSwyLjEsMCwwLDAtMi4xLTIuMWgtLjQ2bC4yMy0uNGEyLjEwNywyLjEwNywwLDAsMC0uNzctMi44NywyLjE0MiwyLjE0MiwwLDAsMC0xLjA1LS4yOCwyLjEsMi4xLDAsMCwwLTEuODIsMS4wNWwtLjIzLjQtLjIzLS40YTIuMSwyLjEsMCwwLDAtMS44Mi0xLjA1LDIuMTcxLDIuMTcxLDAsMCwwLTEuMDUuMjgsMi4xMTYsMi4xMTYsMCwwLDAtLjc3LDIuODdsLjIzLjRoLS40NmEyLjEsMi4xLDAsMCwwLDAsNC4yaC40NmwtLjIzLjRhMi4xMTYsMi4xMTYsMCwwLDAsLjc3LDIuODcsMi4xNDIsMi4xNDIsMCwwLDAsMS4wNS4yOCwyLjEsMi4xLDAsMCwwLDEuODItMS4wNWwuMjMtLjQuMjMuNGEyLjEwOCwyLjEwOCwwLDAsMCwxLjgyLDEuMDUsMi4xNDIsMi4xNDIsMCwwLDAsMS4wNS0uMjgsMi4xMDcsMi4xMDcsMCwwLDAsLjc3LTIuODdsLS4yMy0uNGguNDZBMi4xLDIuMSwwLDAsMCwyOS44NSwyNC4yWm0tNC45Ljc1LDEuNCwyLjQzYS43NDQuNzQ0LDAsMCwxLS42NSwxLjEyLjczNS43MzUsMCwwLDEtLjY1LS4zOGwtMS40LTIuNDItMS40LDIuNDJhLjczNS43MzUsMCwwLDEtLjY1LjM4LjcxMS43MTEsMCwwLDEtLjM3LS4xLjc1NC43NTQsMCwwLDEtLjI4LTEuMDJsMS40LTIuNDNoLTIuOGEuNzUuNzUsMCwwLDEsMC0xLjVoMi44bC0xLjQtMi40MkEuNzY0Ljc2NCwwLDAsMSwyMS4yMywyMGEuNzM2LjczNiwwLDAsMSwuMzctLjEuNzU2Ljc1NiwwLDAsMSwuNjUuMzhsMS40LDIuNDIsMS40LTIuNDJhLjc1Ni43NTYsMCwwLDEsLjY1LS4zOC43NDYuNzQ2LDAsMCwxLC4zOC4xLjc2MS43NjEsMCwwLDEsLjI3LDEuMDNsLTEuNCwyLjQyaDIuOGEuNzUuNzUsMCwwLDEsMCwxLjVaIiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPgo=");
        --pen-remove-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxyZWN0IHg9IjE4LjUiIHk9IjIyIiB3aWR0aD0iMTAiIGhlaWdodD0iNCIvPgogICAgPHBhdGggZD0iTTE5LDIyLjV2M2g5di0zWm04LDJIMjB2LTFoN1oiIGZpbGw9IiNmZmYiLz4KICA8L2c+CiAgPGc+CiAgICA8cGF0aCBkPSJNMTUsMTMsMTMuNzIsNi41OEEyLjAzOCwyLjAzOCwwLDAsMCwxMi40Nyw1LjFMLjUuNVYxMy40YTIsMiwwLDAsMCwuOTMsMS42OUw2LDE4bDMsNC41LDguNS01Wk02LjQyLDE3LjcybC0uMDYtLjA5LS4wOS0uMDVMMS42OSwxNC42N0ExLjUwNiwxLjUwNiwwLDAsMSwxLDEzLjRWMS4yM0wxMi4yOSw1LjU3YTEuNTEzLDEuNTEzLDAsMCwxLC45NCwxLjExbDEuMjgsNi40Mi4wMi4wNy4wMy4wNywyLjI3LDQuMDhMOS4xNSwyMS44M1oiIGZpbGw9IiNmZmYiLz4KICAgIDxwYXRoIGQ9Ik0xNSwxMywxMy43Miw2LjU4QTIuMDM4LDIuMDM4LDAsMCwwLDEyLjQ3LDUuMUwuNS41VjEzLjRhMiwyLDAsMCwwLC45MywxLjY5TDYsMThsMyw0LjUsOC41LTVaIi8+CiAgICA8cGF0aCBkPSJNNi40MiwxNy43MmwtLjA2LS4wOS0uMDktLjA1TDEuNjksMTQuNjdBMS41MDYsMS41MDYsMCwwLDEsMSwxMy40VjEuMjNMMTIuMjksNS41N2ExLjUxMywxLjUxMywwLDAsMSwuOTQsMS4xMWwxLjI4LDYuNDIuMDIuMDcuMDMuMDcsMi4yNyw0LjA4TDkuMTUsMjEuODNaIiBmaWxsPSIjZmZmIi8+CiAgICA8cGF0aCBkPSJNMTUuMjgsMTYuODlsLTUuNzcsMy40TDcuMzcsMTcuMDhsLS4xOS0uMjktLjI5LS4xOEwyLjMxLDEzLjdhLjM2Ni4zNjYsMCwwLDEtLjE2LS4zVjMuODdMNi4xMiw5LjQyQTEuNDM1LDEuNDM1LDAsMCwwLDYsMTAsMS41LDEuNSwwLDEsMCw3LjUsOC41YTEuMzQ1LDEuMzQ1LDAsMCwwLS4zNS4wNUwzLjQ4LDMuNDFsOC40LDMuMjNhLjM4NC4zODQsMCwwLDEsLjIyLjI2bDEuMjgsNi40Mi4wNS4yNi4xMy4yMloiLz4KICA8L2c+Cjwvc3ZnPgo=");
        --pen-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0xNSwxMywxMy43Miw2LjU4QTIuMDM4LDIuMDM4LDAsMCwwLDEyLjQ3LDUuMUwuNS41VjEzLjRhMiwyLDAsMCwwLC45MywxLjY5TDYsMThsMyw0LjUsOC41LTVaTTYuNDIsMTcuNzJsLS4wNi0uMDktLjA5LS4wNUwxLjY5LDE0LjY3QTEuNTA2LDEuNTA2LDAsMCwxLDEsMTMuNFYxLjIzTDEyLjI5LDUuNTdhMS41MTMsMS41MTMsMCwwLDEsLjk0LDEuMTFsMS4yOCw2LjQyLjAyLjA3LjAzLjA3LDIuMjcsNC4wOEw5LjE1LDIxLjgzWiIgZmlsbD0iI2ZmZiIvPgogICAgPHBhdGggZD0iTTE1LDEzLDEzLjcyLDYuNThBMi4wMzgsMi4wMzgsMCwwLDAsMTIuNDcsNS4xTC41LjVWMTMuNGEyLDIsMCwwLDAsLjkzLDEuNjlMNiwxOGwzLDQuNSw4LjUtNVoiLz4KICAgIDxwYXRoIGQ9Ik02LjQyLDE3LjcybC0uMDYtLjA5LS4wOS0uMDVMMS42OSwxNC42N0ExLjUwNiwxLjUwNiwwLDAsMSwxLDEzLjRWMS4yM0wxMi4yOSw1LjU3YTEuNTEzLDEuNTEzLDAsMCwxLC45NCwxLjExbDEuMjgsNi40Mi4wMi4wNy4wMy4wNywyLjI3LDQuMDhMOS4xNSwyMS44M1oiIGZpbGw9IiNmZmYiLz4KICAgIDxwYXRoIGQ9Ik0xNS4yOCwxNi44OWwtNS43NywzLjRMNy4zNywxNy4wOGwtLjE5LS4yOS0uMjktLjE4TDIuMzEsMTMuN2EuMzY2LjM2NiwwLDAsMS0uMTYtLjNWMy44N0w2LjEyLDkuNDJBMS40MzUsMS40MzUsMCwwLDAsNiwxMCwxLjUsMS41LDAsMSwwLDcuNSw4LjVhMS4zNDUsMS4zNDUsMCwwLDAtLjM1LjA1TDMuNDgsMy40MWw4LjQsMy4yM2EuMzg0LjM4NCwwLDAsMSwuMjIuMjZsMS4yOCw2LjQyLjA1LjI2LjEzLjIyWiIvPgogIDwvZz4KPC9zdmc+Cg==");
        --pointer-add-alt-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMjUuNSAyMiAyNS41IDE5IDIxLjUgMTkgMjEuNSAyMiAxOC41IDIyIDE4LjUgMjYgMjEuNSAyNiAyMS41IDI5IDI1LjUgMjkgMjUuNSAyNiAyOC41IDI2IDI4LjUgMjIgMjUuNSAyMiIvPgogICAgPHBhdGggZD0iTTI1LDIyLjV2LTNIMjJ2M0gxOXYzaDN2M2gzdi0zaDN2LTNabTIsMkgyNHYzSDIzdi0zSDIwdi0xaDN2LTNoMXYzaDNaIiBmaWxsPSIjZmZmIi8+CiAgPC9nPgogIDxnPgogICAgPHBvbHlnb24gcG9pbnRzPSIwLjUgMC41IDAuNSAxLjY3MyAwLjUgMjIuNTc0IDAuNSAyMy43NTggMS4zNDkgMjIuOTMzIDcuNDY4IDE2Ljk3OCAxNi40MjEgMTYuOTc4IDE3LjY2NCAxNi45NzggMTYuNzY3IDE2LjExNyAxLjM0NiAxLjMxMiAwLjUgMC41IDAuNSAwLjUiLz4KICAgIDxwYXRoIGQ9Ik0xLDEuNjczdjIwLjlsNi4yNjUtNi4xaDkuMTU2Wk02Ljg1OSwxNS40NzhsLS4yOTIuMjgzTDIsMjAuMjA2VjQuMDE5TDEzLjkzNiwxNS40NzhINi44NTlaIiBmaWxsPSIjZmZmIi8+CiAgPC9nPgo8L3N2Zz4K");
        --pointer-add-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMjUuNSAyMiAyNS41IDE5IDIxLjUgMTkgMjEuNSAyMiAxOC41IDIyIDE4LjUgMjYgMjEuNSAyNiAyMS41IDI5IDI1LjUgMjkgMjUuNSAyNiAyOC41IDI2IDI4LjUgMjIgMjUuNSAyMiIvPgogICAgPHBhdGggZD0iTTI1LDIyLjV2LTNIMjJ2M0gxOXYzaDN2M2gzdi0zaDN2LTNabTIsMkgyNHYzSDIzdi0zSDIwdi0xaDN2LTNoMXYzaDNaIiBmaWxsPSIjZmZmIi8+CiAgPC9nPgogIDxnPgogICAgPHBvbHlnb24gcG9pbnRzPSIxNi43NyAxNi4xMiAxLjM1IDEuMzEgMC41IDAuNSAwLjUgMjMuNzYgMS4zNSAyMi45MyA3LjQ3IDE2Ljk4IDE3LjY2IDE2Ljk4IDE2Ljc3IDE2LjEyIi8+CiAgICA8cG9seWdvbiBwb2ludHM9IjE2LjQyIDE2LjQ4IDcuMjYgMTYuNDggMSAyMi41OCAxIDEuNjcgMTYuNDIgMTYuNDgiIGZpbGw9IiNmZmYiLz4KICAgIDxwYXRoIGQ9Ik0yLDQuMDJWMjAuMjFsNC44Ni00LjczaDcuMDhaTTYuNDUsMTQuNDgsMywxNy44NFY2LjM3bDguNDUsOC4xMVoiLz4KICA8L2c+Cjwvc3ZnPgo=");
        --pointer-alt-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMC41IDAuNSAwLjUgMS42NzMgMC41IDIyLjU3NCAwLjUgMjMuNzU4IDEuMzQ5IDIyLjkzMyA3LjQ2OCAxNi45NzggMTYuNDIxIDE2Ljk3OCAxNy42NjQgMTYuOTc4IDE2Ljc2NyAxNi4xMTcgMS4zNDYgMS4zMTIgMC41IDAuNSAwLjUgMC41Ii8+CiAgICA8cGF0aCBkPSJNMSwxLjY3M3YyMC45bDYuMjY1LTYuMWg5LjE1NlpNNi44NTksMTUuNDc4bC0uMjkyLjI4M0wyLDIwLjIwNlY0LjAxOUwxMy45MzYsMTUuNDc4SDYuODU5WiIgZmlsbD0iI2ZmZiIvPgogIDwvZz4KPC9zdmc+Cg==");
        --pointer-curve-alt-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMC41IDAuNSAwLjUgMS42NzMgMC41IDIyLjU3NCAwLjUgMjMuNzU4IDEuMzQ5IDIyLjkzMyA3LjQ2OCAxNi45NzggMTYuNDIxIDE2Ljk3OCAxNy42NjQgMTYuOTc4IDE2Ljc2NyAxNi4xMTcgMS4zNDYgMS4zMTIgMC41IDAuNSAwLjUgMC41Ii8+CiAgICA8cGF0aCBkPSJNMSwxLjY3M3YyMC45bDYuMjY1LTYuMWg5LjE1NlpNNi44NTksMTUuNDc4bC0uMjkyLjI4M0wyLDIwLjIwNlY0LjAxOUwxMy45MzYsMTUuNDc4SDYuODU5WiIgZmlsbD0iI2ZmZiIvPgogIDwvZz4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0yMy42NDcsMTMuNjVWMTUuNWE3Ljc4Myw3Ljc4MywwLDAsMS0uNjgsMy4xMiw4LjU0NCw4LjU0NCwwLDAsMS0xLjg1LDIuNzUsOC44LDguOCwwLDAsMS0yLjc1LDEuODZBOC42MjUsOC42MjUsMCwwLDEsMTUsMjMuOWgtMS44NXY1LjJIMTVhMTMuODQ0LDEzLjg0NCwwLDAsMCw5Ljc5LTQuMDUsMTMuODQxLDEzLjg0MSwwLDAsMCwyLjk3LTQuNCwxMy4yMzksMTMuMjM5LDAsMCwwLDEuMDktNS4xNVYxMy42NVoiLz4KICAgIDxwYXRoIGQ9Ik0yNC4xNDcsMTQuMTVWMTUuNWE4LjM4NCw4LjM4NCwwLDAsMS0uNzIsMy4zMSw5LjEwNyw5LjEwNywwLDAsMS0xLjk2LDIuOTEsOC45NzUsOC45NzUsMCwwLDEtMi45MSwxLjk3QTkuMiw5LjIsMCwwLDEsMTUsMjQuNGgtMS4zNXY0LjJIMTVhMTMuMywxMy4zLDAsMCwwLDkuNDQtMy45MSwxMy4xMTcsMTMuMTE3LDAsMCwwLDIuODYtNC4yNCwxMi43MjgsMTIuNzI4LDAsMCwwLDEuMDUtNC45NVYxNC4xNVptMS45MSw1Ljc4YTEyLjE0MSwxMi4xNDEsMCwwLDEtMi41NywzLjgxLDEyLjAxNywxMi4wMTcsMCwwLDEtMy44MiwyLjU3LDExLjg0NCwxMS44NDQsMCwwLDEtNC42Ny45NHYtMS41YTEwLjQsMTAuNCwwLDAsMCw3LjQyLTMuMDcsMTAuMzA2LDEwLjMwNiwwLDAsMCwyLjI1LTMuMzQsOS42LDkuNiwwLDAsMCwuODMtMy44NEgyN0ExMS40NTUsMTEuNDU1LDAsMCwxLDI2LjA1NywxOS45M1oiIGZpbGw9IiNmZmYiLz4KICA8L2c+Cjwvc3ZnPgo=");
        --pointer-curve-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0yMy42NSwxMy42NDZWMTUuNWE3Ljc4Myw3Ljc4MywwLDAsMS0uNjgsMy4xMiw4LjU0NCw4LjU0NCwwLDAsMS0xLjg1LDIuNzUsOC44LDguOCwwLDAsMS0yLjc1LDEuODZBOC42MjUsOC42MjUsMCwwLDEsMTUsMjMuOUgxMy4xNXY1LjJIMTVhMTMuODQ0LDEzLjg0NCwwLDAsMCw5Ljc5LTQuMDUsMTMuODQxLDEzLjg0MSwwLDAsMCwyLjk3LTQuNCwxMy4yMzksMTMuMjM5LDAsMCwwLDEuMDktNS4xNXYtMS44NVoiLz4KICAgIDxwYXRoIGQ9Ik0yNC4xNSwxNC4xNDZWMTUuNWE4LjM4NCw4LjM4NCwwLDAsMS0uNzIsMy4zMSw5LjEwNyw5LjEwNywwLDAsMS0xLjk2LDIuOTEsOC45NzUsOC45NzUsMCwwLDEtMi45MSwxLjk3QTkuMiw5LjIsMCwwLDEsMTUsMjQuNEgxMy42NXY0LjJIMTVhMTMuMywxMy4zLDAsMCwwLDkuNDQtMy45MSwxMy4xMTcsMTMuMTE3LDAsMCwwLDIuODYtNC4yNCwxMi43MjgsMTIuNzI4LDAsMCwwLDEuMDUtNC45NXYtMS4zNVptMS45MSw1Ljc4YTEyLjE0MSwxMi4xNDEsMCwwLDEtMi41NywzLjgxLDEyLjAxNywxMi4wMTcsMCwwLDEtMy44MiwyLjU3LDExLjg0NCwxMS44NDQsMCwwLDEtNC42Ny45NHYtMS41YTEwLjQsMTAuNCwwLDAsMCw3LjQyLTMuMDcsMTAuMzA2LDEwLjMwNiwwLDAsMCwyLjI1LTMuMzQsOS42LDkuNiwwLDAsMCwuODMtMy44NEgyN0ExMS40NTUsMTEuNDU1LDAsMCwxLDI2LjA2LDE5LjkyNloiIGZpbGw9IiNmZmYiLz4KICA8L2c+CiAgPGc+CiAgICA8cG9seWdvbiBwb2ludHM9IjE2Ljc3IDE2LjIyNiAxLjM1IDEuNDE2IDAuNSAwLjYwNiAwLjUgMjMuODY2IDEuMzUgMjMuMDM2IDcuNDcgMTcuMDg2IDE3LjY2IDE3LjA4NiAxNi43NyAxNi4yMjYiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMTYuNDIgMTYuNTg2IDcuMjYgMTYuNTg2IDEgMjIuNjg2IDEgMS43NzYgMTYuNDIgMTYuNTg2IiBmaWxsPSIjZmZmIi8+CiAgICA8cGF0aCBkPSJNMiw0LjEyNnYxNi4xOWw0Ljg2LTQuNzNoNy4wOFptNC40NSwxMC40NkwzLDE3Ljk0NlY2LjQ3Nmw4LjQ1LDguMTFaIi8+CiAgPC9nPgo8L3N2Zz4K");
        --pointer-move-alt-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMC41NDYgMC41NjMgMC41NDYgMS43MzYgMC41NDYgMjIuNjM3IDAuNTQ2IDIzLjgyMSAxLjM5NCAyMi45OTUgNy41MTQgMTcuMDQxIDE2LjQ2NyAxNy4wNDEgMTcuNzEgMTcuMDQxIDE2LjgxMyAxNi4xOCAxLjM5MiAxLjM3NSAwLjU0NiAwLjU2MyAwLjU0NiAwLjU2MyIvPgogICAgPHBhdGggZD0iTTEuMDQ2LDEuNzM2djIwLjlsNi4yNjUtNi4xaDkuMTU2Wk02LjksMTUuNTQxbC0uMjkxLjI4M0wyLjA0NiwyMC4yNjlWNC4wODJMMTMuOTgxLDE1LjU0MUg2LjlaIiBmaWxsPSIjZmZmIi8+CiAgPC9nPgogIDxnPgogICAgPHJlY3QgeD0iMjIuNSIgeT0iMjMiIHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHJ4PSIyLjk2Ii8+CiAgICA8cGF0aCBkPSJNMjUuNTM0LDIzLjVoLS4wNjhBMi40NjYsMi40NjYsMCwwLDAsMjMsMjUuOTY2di4wNjhBMi40NjYsMi40NjYsMCwwLDAsMjUuNDY2LDI4LjVoLjA2OEEyLjQ2NiwyLjQ2NiwwLDAsMCwyOCwyNi4wMzR2LS4wNjhBMi40NjYsMi40NjYsMCwwLDAsMjUuNTM0LDIzLjVaTTI3LDI2LjAyYTEuNDgsMS40OCwwLDAsMS0xLjQ4LDEuNDhoLS4wNEExLjQ4LDEuNDgsMCwwLDEsMjQsMjYuMDJ2LS4wNGExLjQ4LDEuNDgsMCwwLDEsMS40OC0xLjQ4aC4wNEExLjQ4LDEuNDgsMCwwLDEsMjcsMjUuOThaIiBmaWxsPSIjZmZmIi8+CiAgICA8Zz4KICAgICAgPHBvbHlnb24gcG9pbnRzPSIyNS40ODggMTIuNSAyNC42NzIgMTMuNjg0IDIxLjA5NSAxOC44NzUgMTkuOTc1IDIwLjUgMjEuOTExIDIwLjUgMjkuMDY0IDIwLjUgMzEgMjAuNSAyOS44OCAxOC44NzUgMjYuMzAzIDEzLjY4NCAyNS40ODggMTIuNSAyNS40ODggMTIuNSIvPgogICAgICA8cGF0aCBkPSJNMzAuMDMyLDE5Ljk4NUgyMC45NDNsNC41NDUtNi41OTVabS03LjE1My0xLjAzSDI4LjFsLTIuNjA4LTMuNzg2WiIgZmlsbD0iI2ZmZiIvPgogICAgPC9nPgogICAgPGc+CiAgICAgIDxwb2x5Z29uIHBvaW50cz0iMzkgMjUuOTg4IDM3LjgxNiAyNS4xNzIgMzIuNjI1IDIxLjU5NSAzMSAyMC40NzUgMzEgMjIuNDExIDMxIDI5LjU2NCAzMSAzMS41IDMyLjYyNSAzMC4zOCAzNy44MTYgMjYuODAzIDM5IDI1Ljk4OCAzOSAyNS45ODgiLz4KICAgICAgPHBhdGggZD0iTTMxLjUxNSwzMC41MzJWMjEuNDQzbDYuNTk1LDQuNTQ1Wm0xLjAzLTcuMTUzVjI4LjZsMy43ODYtMi42MDhaIiBmaWxsPSIjZmZmIi8+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPHBvbHlnb24gcG9pbnRzPSIyNS41MTIgMzkuNSAyNi4zMjggMzguMzE2IDI5LjkwNSAzMy4xMjUgMzEuMDI1IDMxLjUgMjkuMDg5IDMxLjUgMjEuOTM2IDMxLjUgMjAgMzEuNSAyMS4xMiAzMy4xMjUgMjQuNjk3IDM4LjMxNiAyNS41MTIgMzkuNSAyNS41MTIgMzkuNSIvPgogICAgICA8cGF0aCBkPSJNMjAuOTY4LDMyLjAxNWg5LjA4OUwyNS41MTIsMzguNjFabTcuMTUzLDEuMDNIMjIuOWwyLjYwOCwzLjc4NloiIGZpbGw9IiNmZmYiLz4KICAgIDwvZz4KICAgIDxnPgogICAgICA8cG9seWdvbiBwb2ludHM9IjEyIDI2LjAxMiAxMy4xODQgMjYuODI4IDE4LjM3NSAzMC40MDUgMjAgMzEuNTI1IDIwIDI5LjU4OSAyMCAyMi40MzYgMjAgMjAuNSAxOC4zNzUgMjEuNjIgMTMuMTg0IDI1LjE5NyAxMiAyNi4wMTIgMTIgMjYuMDEyIi8+CiAgICAgIDxwYXRoIGQ9Ik0xOS40ODUsMjEuNDY4djkuMDg5TDEyLjg5LDI2LjAxMlptLTEuMDMsNy4xNTNWMjMuNGwtMy43ODYsMi42MDhaIiBmaWxsPSIjZmZmIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K");
        --pointer-move-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj4KICA8Zz4KICAgIDxyZWN0IHg9IjIyLjUiIHk9IjIzIiB3aWR0aD0iNiIgaGVpZ2h0PSI2IiByeD0iMi45NiIvPgogICAgPHBhdGggZD0iTTI1LjUzNCwyMy41aC0uMDY4QTIuNDY2LDIuNDY2LDAsMCwwLDIzLDI1Ljk2NnYuMDY4QTIuNDY2LDIuNDY2LDAsMCwwLDI1LjQ2NiwyOC41aC4wNjhBMi40NjYsMi40NjYsMCwwLDAsMjgsMjYuMDM0di0uMDY4QTIuNDY2LDIuNDY2LDAsMCwwLDI1LjUzNCwyMy41Wk0yNywyNi4wMmExLjQ4LDEuNDgsMCwwLDEtMS40OCwxLjQ4aC0uMDRBMS40OCwxLjQ4LDAsMCwxLDI0LDI2LjAydi0uMDRhMS40OCwxLjQ4LDAsMCwxLDEuNDgtMS40OGguMDRBMS40OCwxLjQ4LDAsMCwxLDI3LDI1Ljk4WiIgZmlsbD0iI2ZmZiIvPgogICAgPGc+CiAgICAgIDxwb2x5Z29uIHBvaW50cz0iMjUuNDg4IDEyLjUgMjQuNjcyIDEzLjY4NCAyMS4wOTUgMTguODc1IDE5Ljk3NSAyMC41IDIxLjkxMSAyMC41IDI5LjA2NCAyMC41IDMxIDIwLjUgMjkuODggMTguODc1IDI2LjMwMyAxMy42ODQgMjUuNDg4IDEyLjUgMjUuNDg4IDEyLjUiLz4KICAgICAgPHBhdGggZD0iTTMwLjAzMiwxOS45ODVIMjAuOTQzbDQuNTQ1LTYuNTk1Wm0tNy4xNTMtMS4wM0gyOC4xbC0yLjYwOC0zLjc4NloiIGZpbGw9IiNmZmYiLz4KICAgIDwvZz4KICAgIDxnPgogICAgICA8cG9seWdvbiBwb2ludHM9IjM5IDI1Ljk4OCAzNy44MTYgMjUuMTcyIDMyLjYyNSAyMS41OTUgMzEgMjAuNDc1IDMxIDIyLjQxMSAzMSAyOS41NjQgMzEgMzEuNSAzMi42MjUgMzAuMzggMzcuODE2IDI2LjgwMyAzOSAyNS45ODggMzkgMjUuOTg4Ii8+CiAgICAgIDxwYXRoIGQ9Ik0zMS41MTUsMzAuNTMyVjIxLjQ0M2w2LjU5NSw0LjU0NVptMS4wMy03LjE1M1YyOC42bDMuNzg2LTIuNjA4WiIgZmlsbD0iI2ZmZiIvPgogICAgPC9nPgogICAgPGc+CiAgICAgIDxwb2x5Z29uIHBvaW50cz0iMjUuNTEyIDM5LjUgMjYuMzI4IDM4LjMxNiAyOS45MDUgMzMuMTI1IDMxLjAyNSAzMS41IDI5LjA4OSAzMS41IDIxLjkzNiAzMS41IDIwIDMxLjUgMjEuMTIgMzMuMTI1IDI0LjY5NyAzOC4zMTYgMjUuNTEyIDM5LjUgMjUuNTEyIDM5LjUiLz4KICAgICAgPHBhdGggZD0iTTIwLjk2OCwzMi4wMTVoOS4wODlMMjUuNTEyLDM4LjYxWm03LjE1MywxLjAzSDIyLjlsMi42MDgsMy43ODZaIiBmaWxsPSIjZmZmIi8+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPHBvbHlnb24gcG9pbnRzPSIxMiAyNi4wMTIgMTMuMTg0IDI2LjgyOCAxOC4zNzUgMzAuNDA1IDIwIDMxLjUyNSAyMCAyOS41ODkgMjAgMjIuNDM2IDIwIDIwLjUgMTguMzc1IDIxLjYyIDEzLjE4NCAyNS4xOTcgMTIgMjYuMDEyIDEyIDI2LjAxMiIvPgogICAgICA8cGF0aCBkPSJNMTkuNDg1LDIxLjQ2OHY5LjA4OUwxMi44OSwyNi4wMTJabS0xLjAzLDcuMTUzVjIzLjRsLTMuNzg2LDIuNjA4WiIgZmlsbD0iI2ZmZiIvPgogICAgPC9nPgogIDwvZz4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMTYuNzcgMTYuMTIgMS4zNSAxLjMxIDAuNSAwLjUgMC41IDIzLjc2IDEuMzUgMjIuOTMgNy40NyAxNi45OCAxNy42NiAxNi45OCAxNi43NyAxNi4xMiIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIxNi40MiAxNi40OCA3LjI2IDE2LjQ4IDEgMjIuNTggMSAxLjY3IDE2LjQyIDE2LjQ4IiBmaWxsPSIjZmZmIi8+CiAgICA8cGF0aCBkPSJNMiw0LjAyVjIwLjIxbDQuODYtNC43M2g3LjA4Wk02LjQ1LDE0LjQ4LDMsMTcuODRWNi4zN2w4LjQ1LDguMTFaIi8+CiAgPC9nPgo8L3N2Zz4K");
        --pointer-remove-alt-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxyZWN0IHg9IjE4LjUiIHk9IjIyIiB3aWR0aD0iMTAiIGhlaWdodD0iNCIvPgogICAgPHBhdGggZD0iTTE5LDIyLjV2M2g5di0zWm04LDJIMjB2LTFoN1oiIGZpbGw9IiNmZmYiLz4KICA8L2c+CiAgPGc+CiAgICA8cG9seWdvbiBwb2ludHM9IjAuNSAwLjUgMC41IDEuNjczIDAuNSAyMi41NzQgMC41IDIzLjc1OCAxLjM0OSAyMi45MzMgNy40NjggMTYuOTc4IDE2LjQyMSAxNi45NzggMTcuNjY0IDE2Ljk3OCAxNi43NjcgMTYuMTE3IDEuMzQ2IDEuMzEyIDAuNSAwLjUgMC41IDAuNSIvPgogICAgPHBhdGggZD0iTTEsMS42NzN2MjAuOWw2LjI2NS02LjFoOS4xNTZaTTYuODU5LDE1LjQ3OGwtLjI5Mi4yODNMMiwyMC4yMDZWNC4wMTlMMTMuOTM2LDE1LjQ3OEg2Ljg1OVoiIGZpbGw9IiNmZmYiLz4KICA8L2c+Cjwvc3ZnPgo=");
        --pointer-remove-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxyZWN0IHg9IjE4LjUiIHk9IjIyIiB3aWR0aD0iMTAiIGhlaWdodD0iNCIvPgogICAgPHBhdGggZD0iTTE5LDIyLjV2M2g5di0zWm04LDJIMjB2LTFoN1oiIGZpbGw9IiNmZmYiLz4KICA8L2c+CiAgPGc+CiAgICA8cG9seWdvbiBwb2ludHM9IjE2Ljc3IDE2LjEyIDEuMzUgMS4zMSAwLjUgMC41IDAuNSAyMy43NiAxLjM1IDIyLjkzIDcuNDcgMTYuOTggMTcuNjYgMTYuOTggMTYuNzcgMTYuMTIiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMTYuNDIgMTYuNDggNy4yNiAxNi40OCAxIDIyLjU4IDEgMS42NyAxNi40MiAxNi40OCIgZmlsbD0iI2ZmZiIvPgogICAgPHBhdGggZD0iTTIsNC4wMlYyMC4yMWw0Ljg2LTQuNzNoNy4wOFpNNi40NSwxNC40OCwzLDE3Ljg0VjYuMzdsOC40NSw4LjExWiIvPgogIDwvZz4KPC9zdmc+Cg==");
        --pointer-selectable-alt-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMC41IDAuNSAwLjUgMS42NzMgMC41IDIyLjU3NCAwLjUgMjMuNzU4IDEuMzQ5IDIyLjkzMyA3LjQ2OCAxNi45NzggMTYuNDIxIDE2Ljk3OCAxNy42NjQgMTYuOTc4IDE2Ljc2NyAxNi4xMTcgMS4zNDYgMS4zMTIgMC41IDAuNSAwLjUgMC41Ii8+CiAgICA8cGF0aCBkPSJNMSwxLjY3M3YyMC45bDYuMjY1LTYuMWg5LjE1NlpNNi44NTksMTUuNDc4bC0uMjkyLjI4M0wyLDIwLjIwNlY0LjAxOUwxMy45MzYsMTUuNDc4SDYuODU5WiIgZmlsbD0iI2ZmZiIvPgogIDwvZz4KICA8Zz4KICAgIDxyZWN0IHg9IjE5LjUiIHk9IjIxIiB3aWR0aD0iNyIgaGVpZ2h0PSI3Ii8+CiAgICA8cmVjdCB4PSIyMCIgeT0iMjEuNSIgd2lkdGg9IjYiIGhlaWdodD0iNiIgZmlsbD0iI2ZmZiIvPgogICAgPHJlY3QgeD0iMjEiIHk9IjIyLjUiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz4KICA8L2c+Cjwvc3ZnPgo=");
        --pointer-selectable-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxyZWN0IHg9IjE5LjUiIHk9IjIxIiB3aWR0aD0iNyIgaGVpZ2h0PSI3Ii8+CiAgICA8cmVjdCB4PSIyMCIgeT0iMjEuNSIgd2lkdGg9IjYiIGhlaWdodD0iNiIgZmlsbD0iI2ZmZiIvPgogICAgPHJlY3QgeD0iMjEiIHk9IjIyLjUiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz4KICA8L2c+CiAgPGc+CiAgICA8cG9seWdvbiBwb2ludHM9IjE2Ljc3IDE2LjEyIDEuMzUgMS4zMSAwLjUgMC41IDAuNSAyMy43NiAxLjM1IDIyLjkzIDcuNDcgMTYuOTggMTcuNjYgMTYuOTggMTYuNzcgMTYuMTIiLz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMTYuNDIgMTYuNDggNy4yNiAxNi40OCAxIDIyLjU4IDEgMS42NyAxNi40MiAxNi40OCIgZmlsbD0iI2ZmZiIvPgogICAgPHBhdGggZD0iTTIsNC4wMlYyMC4yMWw0Ljg2LTQuNzNoNy4wOFpNNi40NSwxNC40OCwzLDE3Ljg0VjYuMzdsOC40NSw4LjExWiIvPgogIDwvZz4KPC9zdmc+Cg==");
        --pointer-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMTYuNzcgMTYuMTIgMS4zNSAxLjMxIDAuNSAwLjUgMC41IDIzLjc2IDEuMzUgMjIuOTMgNy40NyAxNi45OCAxNy42NiAxNi45OCAxNi43NyAxNi4xMiIvPgogICAgPHBvbHlnb24gcG9pbnRzPSIxNi40MiAxNi40OCA3LjI2IDE2LjQ4IDEgMjIuNTggMSAxLjY3IDE2LjQyIDE2LjQ4IiBmaWxsPSIjZmZmIi8+CiAgICA8cGF0aCBkPSJNMiw0LjAyVjIwLjIxbDQuODYtNC43M2g3LjA4Wk02LjQ1LDE0LjQ4LDMsMTcuODRWNi4zN2w4LjQ1LDguMTFaIi8+CiAgPC9nPgo8L3N2Zz4K");
        --resize-ew-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMjIuNSAxOC41IDIyLjUgMjMuMTIgMjQuOTQgMjEuMTcgMjkuOTQgMTcuMTcgMzEuNCAxNiAyOS45NCAxNC44MyAyNC45NCAxMC44MyAyMi41IDguODggMjIuNSAxMy41IDkuNSAxMy41IDkuNSA4Ljg4IDcuMDYgMTAuODMgMi4wNiAxNC44MyAwLjYgMTYgMi4wNiAxNy4xNyA3LjA2IDIxLjE3IDkuNSAyMy4xMiA5LjUgMTguNSAyMi41IDE4LjUiLz4KICAgIDxwYXRoIGQ9Ik0yMywxOHY0LjA4bDEuNjItMS4zLDUtNEwzMC42LDE2bC0uOTgtLjc4LTUtNEwyMyw5LjkyVjE0SDlWOS45MmwtMS42MiwxLjMtNSw0TDEuNCwxNmwuOTguNzgsNSw0TDksMjIuMDhWMThaTTgsMjAsMywxNmw1LTR2M0gyNFYxMmw1LDQtNSw0VjE3SDhaIiBmaWxsPSIjZmZmIi8+CiAgPC9nPgo8L3N2Zz4K");
        --resize-nesw-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iNS42IDIwIDcuMDEgMjEuNTEgMjEuODMgNy4xIDIwLjM1IDUuNTIgMTcuOTkgMyAyOSAzIDI5IDE0Ljc4IDI2LjQgMTIgMjUuMjQgMTAuNzUgMTAuNDMgMjUuMTcgMTEuNjUgMjYuNDggMTQuMDEgMjkgMyAyOSAzIDE3LjIyIDUuNiAyMCIvPgogICAgPHBhdGggZD0iTTUuMjMsMjAuMzRsMS43NiwxLjg5TDIyLjUyLDcuMTJsLTEuOC0xLjk0TDE5LjE0LDMuNUgyOC41VjEzLjUxbC0xLjczLTEuODUtMS41MS0xLjYyTDkuNzMsMjUuMTVsMS41NSwxLjY3LDEuNTgsMS42OEgzLjVWMTguNDlaTTQuNSwyNy41aDYuMDVMOC4zMywyNS4xMiwyNS4yOSw4LjYxbDIuMjEsMi4zN1Y0LjVIMjEuNDVsMi40NywyLjY1TDYuOTYsMjMuNjYsNC41LDIxLjAyWiIgZmlsbD0iI2ZmZiIvPgogIDwvZz4KPC9zdmc+Cg==");
        --resize-ns-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMTguNSA5LjUgMjMuMTIgOS41IDIxLjE3IDcuMDYgMTcuMTcgMi4wNiAxNiAwLjYgMTQuODMgMi4wNiAxMC44MyA3LjA2IDguODggOS41IDEzLjUgOS41IDEzLjUgMjIuNSA4Ljg4IDIyLjUgMTAuODMgMjQuOTQgMTQuODMgMjkuOTQgMTYgMzEuNCAxNy4xNyAyOS45NCAyMS4xNyAyNC45NCAyMy4xMiAyMi41IDE4LjUgMjIuNSAxOC41IDkuNSIvPgogICAgPHBhdGggZD0iTTE4LDloNC4wOGwtMS4zLTEuNjItNC01TDE2LDEuNGwtLjc4Ljk4LTQsNUw5LjkyLDlIMTRWMjNIOS45MmwxLjMsMS42Miw0LDUsLjc4Ljk4Ljc4LS45OCw0LTVMMjIuMDgsMjNIMThabTIsMTUtNCw1LTQtNWgzVjhIMTJsNC01LDQsNUgxN1YyNFoiIGZpbGw9IiNmZmYiLz4KICA8L2c+Cjwvc3ZnPgo=");
        --resize-nwse-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwb2x5Z29uIHBvaW50cz0iMjYuNCAyMCAyNC45OSAyMS41MSAxMC4xNyA3LjEgMTEuNjUgNS41MiAxNC4wMSAzIDMgMyAzIDE0Ljc4IDUuNiAxMiA2Ljc2IDEwLjc1IDIxLjU3IDI1LjE3IDIwLjM1IDI2LjQ4IDE3Ljk5IDI5IDI5IDI5IDI5IDE3LjIyIDI2LjQgMjAiLz4KICAgIDxwYXRoIGQ9Ik0yNi43NywyMC4zNGwtMS43NiwxLjg5TDkuNDgsNy4xMmwxLjgtMS45NEwxMi44NiwzLjVIMy41VjEzLjUxbDEuNzMtMS44NSwxLjUxLTEuNjJMMjIuMjcsMjUuMTVsLTEuNTUsMS42N0wxOS4xNCwyOC41SDI4LjVWMTguNDlabS43Myw3LjE2SDIxLjQ1bDIuMjItMi4zOEw2LjcxLDguNjEsNC41LDEwLjk4VjQuNWg2LjA1TDguMDgsNy4xNSwyNS4wNCwyMy42NmwyLjQ2LTIuNjRaIiBmaWxsPSIjZmZmIi8+CiAgPC9nPgo8L3N2Zz4K");
        --rotate-alt-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0yNS43Niw4LjI0QTEzLjY0NCwxMy42NDQsMCwwLDAsMTcuOCw0LjMyVjBMNC42Nyw3LDE3LjgsMTRWOS40OUE4LjcsOC43LDAsMSwxLDkuODUsMjQuMTVMOC41OCwyMi44OCw0Ljk3LDI2LjQ5bDEuMjcsMS4yN0ExMy44LDEzLjgsMCwwLDAsMjUuNzYsOC4yNFoiLz4KICAgIDxwYXRoIGQ9Ik0yNS40LDguNmExMy4xODIsMTMuMTgyLDAsMCwwLTguMS0zLjg0Vi44M0wxNS4zOSwxLjg1bC0xLjUzLjgyTDksNS4yNmwtMS4xMS41OUw1Ljc0LDcsNy44OSw4LjE1LDksOC43NGw0Ljg2LDIuNTksMS41My44MiwxLjkxLDEuMDJWOC44OUE5LjIsOS4yLDAsMSwxLDkuNDksMjQuNTFsLS45MS0uOTItLjkyLjkyTDYuNiwyNS41N2wtLjkyLjkyLjkyLjkxYTEzLjI3OCwxMy4yNzgsMCwwLDAsMTguOCwwLDEzLjI3OCwxMy4yNzgsMCwwLDAsMC0xOC44Wm0tLjkxLDE3Ljg5YTEyLjAyMywxMi4wMjMsMCwwLDEtMTYuOTgsMGwxLjA3LTEuMDdBMTAuNDkzLDEwLjQ5MywwLDEsMCwyMy40MiwxMC41OCwxMC40LDEwLjQsMCwwLDAsMTYsNy41VjExbC0xLjUyLS44MUw5LjYxLDcuNTksOC41LDdsMS4xMS0uNTksNC44Ny0yLjZMMTYsM1Y2YTEyLjAwNywxMi4wMDcsMCwwLDEsOC40OSwyMC40OVoiIGZpbGw9IiNmZmYiLz4KICA8L2c+Cjwvc3ZnPgo=");
        --rotate-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxnPgogICAgICA8cGF0aCBkPSJNMjQuMDgyLDguMjRhMTMuNjQ0LDEzLjY0NCwwLDAsMC03Ljk2LTMuOTJWMEwyLjk5Miw3bDEzLjEzLDdWOS40OWE4LjcsOC43LDAsMCwxLDYuOSw4LjUxdi41aDUuMVYxOEExMy43MzksMTMuNzM5LDAsMCwwLDI0LjA4Miw4LjI0WiIvPgogICAgICA8cGF0aCBkPSJNMjMuNzIyLDguNmExMy4xODIsMTMuMTgyLDAsMCwwLTguMS0zLjg0Vi44M2wtMS45MSwxLjAyLTEuNTMuODJMNy4zMjIsNS4yNmwtMS4xMS41OUw0LjA2Miw3bDIuMTUsMS4xNSwxLjExLjU5LDQuODYsMi41OSwxLjUzLjgyLDEuOTEsMS4wMlY4Ljg5YTkuMTg1LDkuMTg1LDAsMCwxLDcuOSw5LjExaDQuMUExMy4xNzUsMTMuMTc1LDAsMCwwLDIzLjcyMiw4LjZabS0xLjk4LDEuOThhMTAuNCwxMC40LDAsMCwwLTcuNDItMy4wOFYxMWwtMS41Mi0uODEtNC44Ny0yLjZMNi44MjIsN2wxLjExLS41OSw0Ljg3LTIuNkwxNC4zMjIsM1Y2YTExLjk4NSwxMS45ODUsMCwwLDEsMTEuOTYsMTFoLTEuNTFBMTAuMzc4LDEwLjM3OCwwLDAsMCwyMS43NDIsMTAuNThaIiBmaWxsPSIjZmZmIi8+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPHBhdGggZD0iTTcuNCwyMy43NmExMy42NDQsMTMuNjQ0LDAsMCwwLDcuOTYsMy45MlYzMmwxMy4xMy03LTEzLjEzLTd2NC41MUE4LjcsOC43LDAsMCwxLDguNDYyLDE0di0uNWgtNS4xVjE0QTEzLjczOSwxMy43MzksMCwwLDAsNy40LDIzLjc2WiIvPgogICAgICA8cGF0aCBkPSJNNy43NjIsMjMuNGExMy4xODIsMTMuMTgyLDAsMCwwLDguMSwzLjg0djMuOTNsMS45MS0xLjAyLDEuNTMtLjgyLDQuODYtMi41OSwxLjExLS41OUwyNy40MjIsMjVsLTIuMTUtMS4xNS0xLjExLS41OUwxOS4zLDIwLjY3bC0xLjUzLS44Mi0xLjkxLTEuMDJ2NC4yOEE5LjE4NSw5LjE4NSwwLDAsMSw3Ljk2MiwxNGgtNC4xQTEzLjE3NSwxMy4xNzUsMCwwLDAsNy43NjIsMjMuNFptMS45OC0xLjk4YTEwLjQsMTAuNCwwLDAsMCw3LjQyLDMuMDhWMjFsMS41Mi44MSw0Ljg3LDIuNiwxLjExLjU5LTEuMTEuNTktNC44NywyLjYtMS41Mi44MVYyNkExMS45ODUsMTEuOTg1LDAsMCwxLDUuMiwxNWgxLjUxQTEwLjM3OCwxMC4zNzgsMCwwLDAsOS43NDIsMjEuNDJaIiBmaWxsPSIjZmZmIi8+CiAgICA8L2c+CiAgPC9nPgo8L3N2Zz4K");
        --target-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxyZWN0IHg9IjEzLjUiIHk9IjEzIiB3aWR0aD0iNSIgaGVpZ2h0PSI1IiByeD0iMi41Ii8+CiAgICA8Zz4KICAgICAgPHJlY3QgeD0iMTMuNSIgd2lkdGg9IjUiIGhlaWdodD0iMTAiIHJ4PSIyLjUiLz4KICAgICAgPHBhdGggZD0iTTE0LDIuNDA2VjcuNTk0QTEuOTA3LDEuOTA3LDAsMCwwLDE1LjkwNiw5LjVoLjE4OEExLjkwNywxLjkwNywwLDAsMCwxOCw3LjU5NFYyLjQwNkExLjkwNywxLjkwNywwLDAsMCwxNi4wOTQuNWgtLjE4OEExLjkwNywxLjkwNywwLDAsMCwxNCwyLjQwNlpNMTYsOC41aDBhMSwxLDAsMCwxLTEtMXYtNWExLDEsMCwwLDEsMS0xaDBhMSwxLDAsMCwxLDEsMXY1QTEsMSwwLDAsMSwxNiw4LjVaIiBmaWxsPSIjZmZmIi8+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPHJlY3QgeD0iMTMuNSIgeT0iMjIiIHdpZHRoPSI1IiBoZWlnaHQ9IjEwIiByeD0iMi41Ii8+CiAgICAgIDxwYXRoIGQ9Ik0xNCwyNC41djVhMiwyLDAsMCwwLDIsMmgwYTIsMiwwLDAsMCwyLTJ2LTVhMiwyLDAsMCwwLTItMmgwQTIsMiwwLDAsMCwxNCwyNC41Wm0yLDZoMGExLDEsMCwwLDEtMS0xdi01YTEsMSwwLDAsMSwxLTFoMGExLDEsMCwwLDEsMSwxdjVBMSwxLDAsMCwxLDE2LDMwLjVaIiBmaWxsPSIjZmZmIi8+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPHJlY3QgeD0iMC41IiB5PSIxMyIgd2lkdGg9IjEwIiBoZWlnaHQ9IjUiIHJ4PSIyLjUiLz4KICAgICAgPHBhdGggZD0iTTMsMTcuNUg4YTIsMiwwLDAsMCwyLTJoMGEyLDIsMCwwLDAtMi0ySDNhMiwyLDAsMCwwLTIsMkgxQTIsMiwwLDAsMCwzLDE3LjVabTYtMkg5YTEsMSwwLDAsMS0xLDFIM2ExLDEsMCwwLDEtMS0xSDJhMSwxLDAsMCwxLDEtMUg4QTEsMSwwLDAsMSw5LDE1LjVaIiBmaWxsPSIjZmZmIi8+CiAgICA8L2c+CiAgICA8Zz4KICAgICAgPHJlY3QgeD0iMjEuNSIgeT0iMTMiIHdpZHRoPSIxMCIgaGVpZ2h0PSI1IiByeD0iMi41Ii8+CiAgICAgIDxwYXRoIGQ9Ik0yNCwxNy41aDVhMiwyLDAsMCwwLDItMmgwYTIsMiwwLDAsMC0yLTJIMjRhMiwyLDAsMCwwLTIsMmgwQTIsMiwwLDAsMCwyNCwxNy41Wm02LTJoMGExLDEsMCwwLDEtMSwxSDI0YTEsMSwwLDAsMS0xLTFoMGExLDEsMCwwLDEsMS0xaDVBMSwxLDAsMCwxLDMwLDE1LjVaIiBmaWxsPSIjZmZmIi8+CiAgICA8L2c+CiAgICA8cmVjdCB4PSIxNCIgeT0iMTMuNSIgd2lkdGg9IjQiIGhlaWdodD0iNCIgcng9IjIiIGZpbGw9IiNmZmYiLz4KICAgIDxyZWN0IHg9IjE1IiB5PSIxNC41IiB3aWR0aD0iMiIgaGVpZ2h0PSIyIiByeD0iMSIvPgogIDwvZz4KPC9zdmc+Cg==");
        --zoom-in-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0yNS41NDgsMjUuMDNsLTYuNzktNy41MUExMC4zNDUsMTAuMzQ1LDAsMCwwLDEyLjYxOC42NSwxMC41NzQsMTAuNTc0LDAsMCwwLDEwLjg0OC41YTEwLjM1MSwxMC4zNTEsMCwwLDAtMi4wOCwyMC40OSwxMC40ODUsMTAuNDg1LDAsMCwwLDIuMDguMjEsMTAuMiwxMC4yLDAsMCwwLDMuMTEtLjQ4bDcuMzYsOC4xM2EyLjg0OSwyLjg0OSwwLDAsMCw0LjAzLjIsMi44NTIsMi44NTIsMCwwLDAsLjItNC4wMloiLz4KICAgIDxwYXRoIGQ9Ik0yNS43NzgsMjcuMDZhMi4zMSwyLjMxLDAsMCwxLS43NywxLjYyLDIuMzQyLDIuMzQyLDAsMCwxLTEuNTcuNjEsMi4zNjksMi4zNjksMCwwLDEtMS43NS0uNzdsLTcuNTctOC4zOGE5Ljg1OSw5Ljg1OSwwLDAsMS0zLjI3LjU2LDkuNSw5LjUsMCwwLDEtMS45OC0uMkE5Ljg1MSw5Ljg1MSwwLDAsMSwxMC44NDgsMWExMC43LDEwLjcsMCwwLDEsMS42OS4xNCw5Ljg1Nyw5Ljg1NywwLDAsMSw1LjU1LDE2LjM5bDcuMDksNy44M0EyLjMxNiwyLjMxNiwwLDAsMSwyNS43NzgsMjcuMDZaIiBmaWxsPSIjZmZmIi8+CiAgICA8cGF0aCBkPSJNMjQuMTc4LDI2LjI3LDE2LjIsMTcuNDVhOC41LDguNSwwLDAsMC0zLjg4LTE0Ljk3LDguMjc1LDguMjc1LDAsMCwwLTEuNDctLjEzLDguNSw4LjUsMCwwLDAtMS43MSwxNi44Myw4LjUxOCw4LjUxOCwwLDAsMCw1LjM0LS42NWw4LjIyLDkuMDhhLjk2Ni45NjYsMCwwLDAsLjc0LjMzLDEuMDA4LDEuMDA4LDAsMCwwLC42Ny0uMjZBMSwxLDAsMCwwLDI0LjE3OCwyNi4yN1ptLTEzLjMzLTguODNhNi41LDYuNSwwLDEsMSw2LjUtNi41QTYuNSw2LjUsMCwwLDEsMTAuODQ4LDE3LjQ0WiIvPgogIDwvZz4KICA8cG9seWdvbiBwb2ludHM9IjE0LjUgMTAuNSAxMS41IDEwLjUgMTEuNSA3LjUgMTAuNSA3LjUgMTAuNSAxMC41IDcuNSAxMC41IDcuNSAxMS41IDEwLjUgMTEuNSAxMC41IDE0LjUgMTEuNSAxNC41IDExLjUgMTEuNSAxNC41IDExLjUgMTQuNSAxMC41IiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMC41Ii8+Cjwvc3ZnPgo=");
        --zoom-out-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0yNS41NDgsMjUuMDNsLTYuNzktNy41MUExMC4zNDUsMTAuMzQ1LDAsMCwwLDEyLjYxOC42NSwxMC41NzQsMTAuNTc0LDAsMCwwLDEwLjg0OC41YTEwLjM1MSwxMC4zNTEsMCwwLDAtMi4wOCwyMC40OSwxMC40ODUsMTAuNDg1LDAsMCwwLDIuMDguMjEsMTAuMiwxMC4yLDAsMCwwLDMuMTEtLjQ4bDcuMzYsOC4xM2EyLjg0OSwyLjg0OSwwLDAsMCw0LjAzLjIsMi44NTIsMi44NTIsMCwwLDAsLjItNC4wMloiLz4KICAgIDxwYXRoIGQ9Ik0yNS43NzgsMjcuMDZhMi4zMSwyLjMxLDAsMCwxLS43NywxLjYyLDIuMzQyLDIuMzQyLDAsMCwxLTEuNTcuNjEsMi4zNjksMi4zNjksMCwwLDEtMS43NS0uNzdsLTcuNTctOC4zOGE5Ljg1OSw5Ljg1OSwwLDAsMS0zLjI3LjU2LDkuNSw5LjUsMCwwLDEtMS45OC0uMkE5Ljg1MSw5Ljg1MSwwLDAsMSwxMC44NDgsMWExMC43LDEwLjcsMCwwLDEsMS42OS4xNCw5Ljg1Nyw5Ljg1NywwLDAsMSw1LjU1LDE2LjM5bDcuMDksNy44M0EyLjMxNiwyLjMxNiwwLDAsMSwyNS43NzgsMjcuMDZaIiBmaWxsPSIjZmZmIi8+CiAgICA8cGF0aCBkPSJNMjQuMTc4LDI2LjI3LDE2LjIsMTcuNDVhOC41LDguNSwwLDAsMC0zLjg4LTE0Ljk3LDguMjc1LDguMjc1LDAsMCwwLTEuNDctLjEzLDguNSw4LjUsMCwwLDAtMS43MSwxNi44Myw4LjUxOCw4LjUxOCwwLDAsMCw1LjM0LS42NWw4LjIyLDkuMDhhLjk2Ni45NjYsMCwwLDAsLjc0LjMzLDEuMDA4LDEuMDA4LDAsMCwwLC42Ny0uMjZBMSwxLDAsMCwwLDI0LjE3OCwyNi4yN1ptLTEzLjMzLTguODNhNi41LDYuNSwwLDEsMSw2LjUtNi41QTYuNSw2LjUsMCwwLDEsMTAuODQ4LDE3LjQ0WiIvPgogIDwvZz4KICA8cmVjdCB4PSI3LjUiIHk9IjEwLjUiIHdpZHRoPSI3IiBoZWlnaHQ9IjEiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPC9zdmc+Cg==");
        --zoom-cursor: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj4KICA8Zz4KICAgIDxwYXRoIGQ9Ik0yNS41NDgsMjUuMDNsLTYuNzktNy41MUExMC4zNDUsMTAuMzQ1LDAsMCwwLDEyLjYxOC42NSwxMC41NzQsMTAuNTc0LDAsMCwwLDEwLjg0OC41YTEwLjM1MSwxMC4zNTEsMCwwLDAtMi4wOCwyMC40OSwxMC40ODUsMTAuNDg1LDAsMCwwLDIuMDguMjEsMTAuMiwxMC4yLDAsMCwwLDMuMTEtLjQ4bDcuMzYsOC4xM2EyLjg0OSwyLjg0OSwwLDAsMCw0LjAzLjIsMi44NTIsMi44NTIsMCwwLDAsLjItNC4wMloiLz4KICAgIDxwYXRoIGQ9Ik0yNS43NzgsMjcuMDZhMi4zMSwyLjMxLDAsMCwxLS43NywxLjYyLDIuMzQyLDIuMzQyLDAsMCwxLTEuNTcuNjEsMi4zNjksMi4zNjksMCwwLDEtMS43NS0uNzdsLTcuNTctOC4zOGE5Ljg1OSw5Ljg1OSwwLDAsMS0zLjI3LjU2LDkuNSw5LjUsMCwwLDEtMS45OC0uMkE5Ljg1MSw5Ljg1MSwwLDAsMSwxMC44NDgsMWExMC43LDEwLjcsMCwwLDEsMS42OS4xNCw5Ljg1Nyw5Ljg1NywwLDAsMSw1LjU1LDE2LjM5bDcuMDksNy44M0EyLjMxNiwyLjMxNiwwLDAsMSwyNS43NzgsMjcuMDZaIiBmaWxsPSIjZmZmIi8+CiAgICA8cGF0aCBkPSJNMjQuMTc4LDI2LjI3LDE2LjIsMTcuNDVhOC41LDguNSwwLDAsMC0zLjg4LTE0Ljk3LDguMjc1LDguMjc1LDAsMCwwLTEuNDctLjEzLDguNSw4LjUsMCwwLDAtMS43MSwxNi44Myw4LjUxOCw4LjUxOCwwLDAsMCw1LjM0LS42NWw4LjIyLDkuMDhhLjk2Ni45NjYsMCwwLDAsLjc0LjMzLDEuMDA4LDEuMDA4LDAsMCwwLC42Ny0uMjZBMSwxLDAsMCwwLDI0LjE3OCwyNi4yN1ptLTEzLjMzLTguODNhNi41LDYuNSwwLDEsMSw2LjUtNi41QTYuNSw2LjUsMCwwLDEsMTAuODQ4LDE3LjQ0WiIvPgogIDwvZz4KPC9zdmc+Cg==");   
    }
    
    :host, :host([theme="dark"]) {        
        --canvas-engine-background-color: #3e3e3e;
        --canvas-engine-rulerBackground-color: #2f2f2f;
        --canvas-engine-rulerText-color: #e3e3e3;
        --canvas-engine-rulerIndicator-color: #378ef0;
        --canvas-engine-grid-color: lightblue;
        --canvas-engine-guide-color: maroon;
        --canvas-engine-snap-color: red;
        --canvas-engine-elementHover-color: red;
        --canvas-engine-guideHover-color: blue;
        --canvas-engine-selectionBox-color: blue;
        --canvas-engine-selectionArea-color: blue;
    }
    
    :host([theme="light"]) {        
        --canvas-engine-background-color: #eaeaea;
        --canvas-engine-rulerBackground-color: #fafafa;
        --canvas-engine-rulerText-color: #4b4b4b;
        --canvas-engine-rulerIndicator-color: #1473e6;
    }
    
    :host([cursor="bucket"]) { cursor: var(--bucket-cursor) 0 0, auto; }
    :host([cursor="color-picker"]) { cursor: var(--color-picker-cursor) 0 0, auto; }
    :host([cursor="default"]) { cursor: default; }
    :host([cursor="hand-hold"]) { cursor: var(--hand-hold-cursor) 16 16, auto; }
    :host([cursor="hand"]) { cursor: var(--hand-cursor) 16 16, auto; }
    :host([cursor="move"]) { cursor: var(--move-cursor) 16 16, auto; }
    :host([cursor="not-allowed"]) { cursor: var(--not-allowed-cursor) 0 0, auto; }
    :host([cursor="pen-add"]) { cursor: var(--pen-add-cursor) 0 0, auto; }
    :host([cursor="pen-close"]) { cursor: var(--pen-close-cursor) 0 0, auto; }
    :host([cursor="pen-continue"]) { cursor: var(--pen-continue-cursor) 0 0, auto; }
    :host([cursor="pen-point"]) { cursor: var(--pen-point-cursor) 0 0, auto; }
    :host([cursor="pen-remove"]) { cursor: var(--pen-remove-cursor) 0 0, auto; }
    :host([cursor="pen"]) { cursor: var(--pen-cursor) 0 0, auto; }
    :host([cursor="pointer-add-alt"]) { cursor: var(--pointer-add-alt-cursor) 0 0, auto; }
    :host([cursor="pointer-add"]) { cursor: var(--pointer-add-cursor) 0 0, auto; }
    :host([cursor="pointer-alt"]) { cursor: var(--pointer-alt-cursor) 0 0, auto; }
    :host([cursor="pointer-curve-alt"]) { cursor: var(--pointer-curve-alt-cursor) 0 0, auto; }
    :host([cursor="pointer-curve"]) { cursor: var(--pointer-curve-cursor) 0 0, auto; }
    :host([cursor="pointer-move"]) { cursor: var(--pointer-move-cursor) 0 0, auto; }
    :host([cursor="pointer-move-alt"]) { cursor: var(--pointer-move-alt-cursor) 0 0, auto; }
    :host([cursor="pointer-remove-alt"]) { cursor: var(--pointer-remove-alt-cursor) 0 0, auto; }
    :host([cursor="pointer-remove"]) { cursor: var(--pointer-remove-cursor) 0 0, auto; }
    :host([cursor="pointer-selectable-alt"]) { cursor: var(--pointer-selectable-alt-cursor) 0 0, auto; }
    :host([cursor="pointer-selectable"]) { cursor: var(--pointer-selectable-cursor) 0 0, auto; }
    :host([cursor="pointer"]) { cursor: var(--pointer-cursor) 0 0, auto; }
    :host([cursor="resize-ew"]) { cursor: var(--resize-ew-cursor) 16 16, auto; }
    :host([cursor="resize-nesw"]) { cursor: var(--resize-nesw-cursor) 16 16, auto; }
    :host([cursor="resize-ns"]) { cursor: var(--resize-ns-cursor) 16 16, auto; }
    :host([cursor="resize-nwse"]) { cursor: var(--resize-nwse-cursor) 16 16, auto; }
    :host([cursor="rotate-alt"]) { cursor: var(--rotate-alt-cursor) 16 16, auto; }
    :host([cursor="rotate"]) { cursor: var(--rotate-cursor) 16 16, auto; }
    :host([cursor="target"]) { cursor: var(--target-cursor) 16 16, auto; }
    :host([cursor="zoom-in"]) { cursor: var(--zoom-in-cursor) 11 11, auto; }
    :host([cursor="zoom-out"]) { cursor: var(--zoom-out-cursor) 11 11, auto; }
    :host([cursor="zoom"]) { cursor: var(--zoom-cursor) 11 11, auto; }
    
    #main {
        background: var(--canvas-engine-background-color);
        box-sizing: border-box;
    }
    #grid {
        display: grid;
        grid-template-columns: 32px 1fr;
        grid-template-rows: 32px 1fr;
        grid-gap: 0;
        outline: none;
        border: none;
        padding: 0;
        margin: 0;
        max-width: 100%;
        max-height: 100%;
        box-sizing: border-box;
    }
    #grid.no-ruler {
        grid-template-rows: 1fr;
        grid-template-columns: 1fr;
        grid-template-areas: "main";
    }
    #grid.no-ruler > bg-ruler, #grid.no-ruler > .measure-unit {
        display: none;
    }
    #grid.no-ruler > canvas {
        grid-area: main;
    }
    
    .bg-ruler {
        background: var(--canvas-engine-rulerBackground-color);
        box-sizing: border-box;
    }
    .measure-unit {
        display: flex;
        flex: 1;
        font-size: 10px;
        font-family: sans-serif;
        color: var(--canvas-engine-rulerText-color);
        justify-content: center;
        align-items: center;
        user-select: none;
        box-sizing: border-box;
    }
</style>
<div id="grid">
    <div class="bg-ruler measure-unit">px</div>
    <canvas id="rulerH" class="bg-ruler" height="32"></canvas>
    <canvas id="rulerV" class="bg-ruler" width="32"></canvas>
    <canvas id="main"></canvas>
</div>
`;
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class GlobalElementProperties {
        constructor() {
            // Vector element
            this.stroke = null;
            this.fill = null;
            this.fillRule = exports.FillRule.NonZero;
            this.paintOrder = exports.PaintOrder.FillStrokeMarkers;
            this.blendMode = exports.BlendMode.Normal;
            this.opacity = 1;
            this.isolate = false;
            // Rect element
            this.rectRadius = null;
            // Regular polygon
            this.regularPolygonSides = 5;
            this.regularPolygonCornerRadius = 0;
            // Star
            this.starSides = 5;
            this.starInnerRadiusPercent = 0.4;
            this.starInnerCornerRadius = 0;
            this.starOuterCornerRadius = 0;
            this.starOuterRotate = 0;
            this.starInnerRotate = 0;
            this.stroke = new DefaultPen();
            //this.fill = SolidBrush.BLACK;
            this.fill = new SolidBrush(Color.from('violet'));
        }
        dispose() {
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Theme {
        constructor(style) {
            this.background = Color.from(style.getPropertyValue('--canvas-engine-background-color'));
            this.rulerBackground = Color.from(style.getPropertyValue('--canvas-engine-rulerBackground-color'));
            this.rulerText = Color.from(style.getPropertyValue('--canvas-engine-rulerText-color'));
            this.rulerIndicator = Color.from(style.getPropertyValue('--canvas-engine-rulerIndicator-color'));
            this.grid = Color.from(style.getPropertyValue('--canvas-engine-grid-color'));
            this.guide = Color.from(style.getPropertyValue('--canvas-engine-guide-color'));
            this.snap = Color.from(style.getPropertyValue('--canvas-engine-snap-color'));
            this.elementHover = Color.from(style.getPropertyValue('--canvas-engine-elementHover-color'));
            this.guideHover = Color.from(style.getPropertyValue('--canvas-engine-guideHover-color'));
            this.selectionBox = Color.from(style.getPropertyValue('--canvas-engine-selectionBox-color'));
            this.selectionArea = Color.from(style.getPropertyValue('--canvas-engine-selectionArea-color'));
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class GuideTool extends BaseTool {
        constructor() {
            super(...arguments);
            this.from = null;
            this.to = null;
            this.pen = null;
        }
        get name() {
            return "guide";
        }
        activate(engine, data) {
            super.activate(engine, data);
            data.tool?.deactivate(engine);
        }
        deactivate(engine) {
            super.deactivate(engine);
            this.pen = null;
            this.from = null;
            this.to = null;
        }
        updateTheme(engine) {
            super.updateTheme(engine);
            this.pen = new DefaultPen(new SolidBrush(engine.theme.guide));
        }
        render(engine, timestamp) {
            if (!this.isInvalidated) {
                return;
            }
            const context = engine.context;
            this.drawSnapshotImage(engine, false);
            context.drawLine(this.from, this.to, this.pen);
            context.flush();
            this.isInvalidated = false;
        }
        onMouseLeftButtonDown(engine, event) {
            // set cursor?
            this.onMouseLeftButtonMove(engine, event);
        }
        onMouseLeftButtonMove(engine, event) {
            if (this.data.horizontal) {
                this.from = new Point(0, event.canvasPosition.y);
                this.to = new Point(engine.boundingBox.width, event.canvasPosition.y);
            }
            else {
                this.from = new Point(event.canvasPosition.x, 0);
                this.to = new Point(event.canvasPosition.x, engine.boundingBox.height);
            }
            this.isInvalidated = true;
        }
        onMouseLeftButtonUp(engine, event) {
            // add guides
            const horizontal = this.data.horizontal;
            const point = engine.viewBox.getPointPosition(event.canvasPosition);
            const guide = new Guide(horizontal ? point.y : point.x, horizontal);
            engine.document.guides.add(guide);
            // release tool
            this.data.release(this.data.tool);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const HIGH_QUALITY = {
        antialias: false,
    };
    const HIGH_PERFORMANCE = {
        antialias: true,
    };
    class CanvasEngine extends HTMLElement {
        constructor() {
            super();
            this._ruler = null;
            this._context = null;
            this._tool = null;
            this._guideTool = new GuideTool();
            this._project = null;
            this._mousePointerInside = false;
            this._mousePointerPosition = { x: 0, y: 0 };
            this._keyboardStatus = new KeyboardStatus();
            this._theme = null;
            this._surface = null;
            this._highQuality = true;
            this._frameCallback = null;
            this._frameId = null;
            this._cursor = exports.Cursor.Default;
            this._globalElementProperties = null;
            this.boundingBox = null;
            this._onDisconnect = null;
            this._onCanvasDisconnect = null;
            this._deferId = null;
            this.attachShadow({
                mode: "open",
                // delegatesFocus: true
            });
            this.shadowRoot.innerHTML = getCanvasEngineTemplate();
            this.dpr = this.ownerDocument.defaultView.devicePixelRatio || 1;
            this._frameCallback = this.renderFrame.bind(this);
            this._ruler = new Ruler(this.shadowRoot.getElementById('rulerH').getContext('2d', { alpha: false }), this.shadowRoot.getElementById('rulerV').getContext('2d', { alpha: false }));
            this._globalElementProperties = new GlobalElementProperties();
            this.viewBox = new ViewBox(this.invalidateViewBox.bind(this));
        }
        get rulerMajorGraduationWidth() {
            return this._ruler.getStep(this.viewBox.zoom);
        }
        get globalElementProperties() {
            return this._globalElementProperties;
        }
        /**
         * Returns current pointer position if mouse is inside canvas
         */
        get currentPointerPosition() {
            if (!this._mousePointerInside) {
                return null;
            }
            return this.getCanvasMouse(this._mousePointerPosition.x, this._mousePointerPosition.y);
        }
        get cursor() {
            return this._cursor;
        }
        set cursor(value) {
            if (this._cursor !== value) {
                this._cursor = value;
                this.setAttribute('cursor', value);
            }
        }
        get highQuality() {
            return this._highQuality;
        }
        set highQuality(value) {
            if (this._highQuality === value) {
                return;
            }
            this._highQuality = value;
            const running = this._frameId != null;
            this.stopRenderLoop();
            this.destroySurface(false);
            this.disconnectCanvas();
            const dpr = this.dpr;
            const old = this.canvasElement;
            const width = old.width / dpr;
            const height = old.height / dpr;
            const canvas = old.cloneNode(false);
            old.replaceWith(canvas);
            this.resizeCanvas(width, height, dpr);
            this.connectCanvas(canvas);
            this.invalidate();
            if (running) {
                this.startRenderLoop();
            }
        }
        get surface() {
            if (!this._surface) {
                const canvas = this.canvasElement;
                this._surface = Skia.SkSurface.MakeWebGLCanvasSurface(canvas, canvas.width, canvas.height, this._highQuality ? HIGH_QUALITY : HIGH_PERFORMANCE);
            }
            return this._surface;
        }
        destroySurface(invalidate) {
            if (this._surface) {
                this._surface.delete();
                this._surface = null;
            }
            if (this._context) {
                this._context.dispose();
                this._context = null;
            }
            if (invalidate) {
                this.invalidate();
            }
        }
        get context() {
            if (!this._context) {
                const surface = this.surface;
                this._context = new DrawingContext(surface.getCanvas(), Matrix.CreateDevicePixelRatio(this.dpr), surface);
            }
            return this._context;
        }
        getColorAt(point) {
            // TODO: how to take the color of pixel???
            return Color.fromCode(this.surface.getCanvas().colorAt(point));
        }
        get theme() {
            if (this._theme === null) {
                this._theme = new Theme(this.ownerDocument.defaultView.getComputedStyle(this));
            }
            return this._theme;
        }
        get showRuler() {
            return this._ruler.visible;
        }
        set showRuler(value) {
            if (value === this._ruler.visible) {
                return;
            }
            const classList = this.shadowRoot.getElementById('grid').classList;
            if (value) {
                classList.remove('no-ruler');
            }
            else {
                classList.add('no-ruler');
            }
            this._ruler.visible = value;
            this.handleElementResize();
        }
        get selection() {
            return this._project?.selection;
        }
        get canvasElement() {
            return this.shadowRoot.getElementById('main');
        }
        invalidateViewBox() {
            this._ruler.draw(this, true);
            this.invalidate();
        }
        startRenderLoop() {
            if (this._frameId === null) {
                this._frameId = requestAnimationFrame(this._frameCallback);
            }
        }
        stopRenderLoop() {
            if (this._frameId !== null) {
                cancelAnimationFrame(this._frameId);
                this._frameId = null;
            }
        }
        renderFrame(timestamp) {
            if (this._project && this._tool) {
                this._tool.render(this, timestamp);
            }
            this._frameId = requestAnimationFrame(this._frameCallback);
        }
        invalidate() {
            this._tool && this._tool.invalidate();
        }
        makeImageSnapshot() {
            return this.surface.makeImageSnapshot();
        }
        get project() {
            return this._project;
        }
        set project(value) {
            if (this._project !== value) {
                this._project = value;
                this.viewBox.reset();
            }
        }
        get document() {
            return this._project?.document;
        }
        set document(value) {
            if (this._project !== null) {
                this._project.document = value;
                this.viewBox.reset();
            }
        }
        get tool() {
            return this._tool;
        }
        set tool(value) {
            this.setCurrentTool(value);
        }
        get keyboardStatus() {
            return this._keyboardStatus;
        }
        undo() {
            if (this._project?.state.undo()) {
                this.invalidate();
            }
        }
        redo() {
            if (this._project?.state.redo()) {
                this.invalidate();
            }
        }
        /**
         * Sets current tool with optional data
         * @param tool
         * @param data
         */
        setCurrentTool(tool, data) {
            if (this._tool === tool) {
                if (tool) {
                    tool.deactivate(this);
                    tool.activate(this, data);
                }
                return;
            }
            if (this._tool) {
                this._tool.deactivate(this);
            }
            this._tool = tool;
            if (tool) {
                tool.activate(this, data);
            }
        }
        getCanvasMouse(x, y) {
            const box = this.boundingBox;
            return new Point(x - box.x, y - box.y);
        }
        getDocumentMouse(x, y) {
            return this.viewBox.getPointPosition(this.getCanvasMouse(x, y));
        }
        connectedCallback() {
            if (!this.isConnected) {
                return;
            }
            this.updateBoundingBox();
            if (!this.hasAttribute('tabindex')) {
                this.setAttribute('tabindex', '0');
            }
            this.disconnectCanvas();
            this.connectCanvas(this.canvasElement);
            if (this._onDisconnect) {
                this._onDisconnect();
                this._onDisconnect = null;
            }
            // @ts-ignore
            let obs = new ResizeObserver(this.deferElementResize.bind(this));
            obs.observe(this);
            this.handleMouseEvents.bind(this);
            let window = this.ownerDocument.defaultView;
            let keyboard = this.handleKeyboardEvents.bind(this);
            window.addEventListener('keydown', keyboard);
            window.addEventListener('keyup', keyboard);
            let rulerHandler = this.rulerHandler.bind(this);
            this.shadowRoot.getElementById('rulerH').addEventListener('pointerdown', rulerHandler);
            this.shadowRoot.getElementById('rulerV').addEventListener('pointerdown', rulerHandler);
            let dprObs = new DPRObserver(this.onDPRChange.bind(this), this.dpr);
            this._onDisconnect = () => {
                obs.disconnect();
                dprObs.dispose();
                window.removeEventListener('keydown', keyboard);
                window.removeEventListener('keyup', keyboard);
                this.shadowRoot.getElementById('rulerH').removeEventListener('pointerdown', rulerHandler);
                this.shadowRoot.getElementById('rulerV').removeEventListener('pointerdown', rulerHandler);
                //
                dprObs = obs = rulerHandler = keyboard = window = null;
            };
            this.refreshTheme();
        }
        disconnectedCallback() {
            this.stopRenderLoop();
            this.setCurrentTool(null);
            this.destroySurface(false);
            this.disconnectCanvas();
            if (this._onDisconnect) {
                this._onDisconnect();
                this._onDisconnect = null;
            }
            if (this._globalElementProperties) {
                this._globalElementProperties.dispose();
                this._globalElementProperties = null;
            }
            if (this._project) {
                this._project.dispose();
                this._project = null;
            }
            this._frameCallback = null;
            this.boundingBox = null;
            this._ruler.dispose();
            this.viewBox.dispose();
            this.boundingBox = null;
        }
        disconnectCanvas() {
            if (this._onCanvasDisconnect) {
                this._onCanvasDisconnect();
                this._onCanvasDisconnect = null;
            }
        }
        connectCanvas(canvas) {
            let mouse = this.handleMouseEvents.bind(this);
            canvas.addEventListener('pointerdown', mouse);
            canvas.addEventListener('pointerup', mouse);
            canvas.addEventListener('pointermove', mouse);
            canvas.addEventListener('pointerenter', mouse);
            canvas.addEventListener('pointerleave', mouse);
            let wheel = this.handleMouseWheel.bind(this);
            canvas.addEventListener('wheel', wheel);
            this._onCanvasDisconnect = () => {
                canvas.removeEventListener('pointerdown', mouse);
                canvas.removeEventListener('pointerup', mouse);
                canvas.removeEventListener('pointermove', mouse);
                canvas.removeEventListener('pointerenter', mouse);
                canvas.removeEventListener('pointerleave', mouse);
                canvas.removeEventListener('wheel', wheel);
                //
                canvas = mouse = wheel = null;
            };
        }
        resizeCanvas(width, height, dpr = this.dpr) {
            resizeCanvasElement(this.canvasElement, width, height, dpr);
        }
        static get observedAttributes() {
            return ['theme'];
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (name === 'theme') {
                this.refreshTheme(true);
            }
        }
        updateBoundingBox() {
            const box = this.getBoundingClientRect();
            const padding = this._ruler.visible ? this._ruler.size : 0;
            return this.boundingBox = new Rectangle(box.x + padding, box.y + padding, box.width - padding, box.height - padding);
        }
        refreshTheme(render = false) {
            this._theme = null;
            if (this._ruler) {
                this._ruler.draw(this, true);
            }
            if (this._tool) {
                this._tool.updateTheme(this);
            }
            if (render) {
                this.invalidate();
            }
        }
        onDPRChange(value) {
            this.dpr = value;
            this.handleElementResize();
        }
        rulerHandler(event) {
            const toolEvent = this.buildToolEvent(event);
            if (toolEvent.button !== exports.MouseButton.Left) {
                return;
            }
            const horizontal = event.target.id === "rulerH";
            const tool = this._tool;
            this._tool = this._guideTool;
            const release = (tool) => {
                this._tool = tool;
                this._guideTool.deactivate(this);
                this._tool?.activate(this, null);
            };
            this.canvasElement.setPointerCapture(event.pointerId);
            this._tool.activate(this, { tool, horizontal, release });
            this._tool.onMouseDown(this, toolEvent);
        }
        deferElementResize() {
            if (this._deferId) {
                clearTimeout(this._deferId);
                this._deferId = null;
            }
            this._deferId = setTimeout(this.handleElementResize.bind(this), 250);
        }
        handleElementResize() {
            const box = this.updateBoundingBox();
            this.resizeCanvas(box.width, box.height, this.dpr);
            this.destroySurface(true);
            this._ruler.updateSize(box.width, box.height, this.dpr);
            this._ruler.draw(this, true);
        }
        handleKeyboardEvents(event) {
            const changed = this._keyboardStatus.update(event);
            if (this._tool == null) {
                return;
            }
            if (changed) {
                this._tool.onKeyboardStatusChange && this._tool.onKeyboardStatusChange(this, event);
            }
            if (!this._mousePointerInside) {
                return;
            }
            switch (event.type) {
                case "keydown":
                    this._tool.onKeyDown && this._tool.onKeyDown(this, event);
                    break;
                case "keyup":
                    this._tool.onKeyUp && this._tool.onKeyUp(this, event);
                    break;
            }
        }
        handleMouseEvents(event) {
            if (!event.isPrimary) {
                // for now, we don't support multi-touch
                return;
            }
            let method = null;
            switch (event.type) {
                case "pointermove":
                    if (this._mousePointerInside) {
                        this._mousePointerPosition.x = event.clientX;
                        this._mousePointerPosition.y = event.clientY;
                        this._ruler.draw(this, false);
                    }
                    method = 'onMouseMove';
                    break;
                case "pointerdown":
                    this.canvasElement.setPointerCapture(event.pointerId);
                    method = 'onMouseDown';
                    break;
                case "pointerup":
                    this.canvasElement.releasePointerCapture(event.pointerId);
                    method = 'onMouseUp';
                    break;
                case "pointerenter":
                    this._mousePointerInside = true;
                    this._ruler.draw(this, false);
                    method = 'onMouseEnter';
                    break;
                case "pointerleave":
                    this._mousePointerInside = false;
                    this._ruler.draw(this);
                    method = 'onMouseLeave';
                    break;
                default:
                    return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            if (method && this._tool && this._tool[method]) {
                const context = this.context;
                context.save();
                this._tool[method](this, this.buildToolEvent(event));
                context.restore();
            }
        }
        handleMouseWheel(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            this.viewBox.zoomByCoefficient(this.getCanvasMouse(e.clientX, e.clientY), clamp(1 - (0.005 * e.deltaY), .85, 1.15));
        }
        buildToolEvent(event) {
            const canvasPosition = this.getCanvasMouse(event.clientX, event.clientY);
            return {
                canvasPosition,
                position: this.viewBox.getPointPosition(canvasPosition),
                button: event.button >= exports.MouseButton.Unknown ? exports.MouseButton.Unknown : event.button,
                domEvent: event,
            };
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Keyframe {
        constructor(value, offset = 0, easing = null) {
            this.value = value;
            this.offset = offset;
            this.easing = easing;
        }
        clone() {
            // T should be immutable
            return new Keyframe(this.value, this.offset, this.easing);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Animation {
        constructor(keyframes = null, disabled = false, interpolate) {
            this.keyframes = keyframes ?? [];
            this.disabled = disabled;
            this.interpolate = interpolate;
        }
        clone() {
            // @ts-ignore
            return new this.constructor(this.keyframes.map(k => k.clone()), this.disabled, this.interpolate);
        }
        get length() {
            return this.keyframes.length;
        }
        get isAnimated() {
            return !this.disabled && this.keyframes.length > 1;
        }
        get hasKeyframes() {
            return this.keyframes.length > 0;
        }
        getKeyframeAtIndex(index) {
            return this.keyframes[index] || null;
        }
        removeKeyframeAtIndex(index) {
            const r = this.keyframes.splice(index, 1);
            return r.length > 0 ? r[0] : null;
        }
        addKeyframe(keyframe) {
            const offset = keyframe.offset;
            const length = this.keyframes.length;
            for (let i = 0; i < length; i++) {
                const k = this.keyframes[i];
                if (offset === k.offset) {
                    return this.keyframes[i] = keyframe;
                }
                if (offset < k.offset) {
                    this.keyframes.splice(i, 0, keyframe);
                    return keyframe;
                }
            }
            this.keyframes.push(keyframe);
            return keyframe;
        }
        removeKeyframe(keyframe) {
            const index = this.keyframes.indexOf(keyframe);
            if (index !== -1) {
                this.keyframes.splice(index, 1);
                return true;
            }
            return false;
        }
        removeKeyframes(keyframes) {
            let index, removed = false;
            for (const k of keyframes) {
                index = this.keyframes.indexOf(k);
                if (index !== -1) {
                    this.keyframes.splice(index, 1);
                    removed = true;
                }
            }
            return removed;
        }
        getKeyframeAtOffset(offset) {
            const length = this.keyframes.length;
            for (let i = 0; i < length; i++) {
                const k = this.keyframes[i];
                if (offset === k.offset) {
                    return k;
                }
                if (k.offset > offset) {
                    return null;
                }
            }
            return null;
        }
        addKeyframeAtOffset(offset, value, easing = null) {
            if (value == null) {
                value = this.getValueAtOffset(offset);
            }
            let keyframe = this.getKeyframeAtOffset(offset);
            if (keyframe != null) {
                keyframe.value = value;
                if (easing != null) {
                    keyframe.easing = easing;
                }
                return keyframe;
            }
            return this.addKeyframe(this.createKeyframe(value, offset, easing));
        }
        removeKeyframeAtOffset(offset) {
            const keyframe = this.getKeyframeAtOffset(offset);
            if (keyframe == null) {
                return false;
            }
            return this.removeKeyframe(keyframe);
        }
        getValueAtOffset(offset) {
            const keyframes = this.keyframes;
            const last = keyframes.length - 1;
            if (last === -1) {
                return null;
            }
            if (last === 0) {
                return keyframes[0].value;
            }
            if (offset <= keyframes[0].offset) {
                return keyframes[0].value;
            }
            if (offset >= keyframes[last].offset) {
                return keyframes[last].value;
            }
            for (let i = 1; i <= last; i++) {
                if (offset > keyframes[i].offset) {
                    continue;
                }
                const j = i - 1;
                let percent = getRangePercent(offset, keyframes[j].offset, keyframes[i].offset);
                const easing = keyframes[j].easing;
                if (easing != null) {
                    percent = easing.value(percent);
                }
                return this.interpolate(keyframes[j].value, keyframes[i].value, percent);
            }
            return null;
        }
        createKeyframe(value, offset, easing = null) {
            return new Keyframe(value, offset, easing);
        }
        *[Symbol.iterator]() {
            const length = this.keyframes.length;
            for (let i = 0; i < length; i++) {
                yield this.keyframes[i];
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    function interpolateNumber(from, to, percent = 0.5) {
        return from + percent * (to - from);
    }
    function interpolatePositiveNumber(from, to, percent = 0.5) {
        return Math.max(0, from + percent * (to - from));
    }
    function interpolatePercent(from, to, percent = 0.5) {
        return clamp(interpolateNumber(from, to, percent), 0, 1);
    }
    function interpolateColorComponent(from, to, percent = 0.5) {
        return clamp(Math.round(from + percent * (to - from)), 0, 255);
    }
    function interpolateAlphaComponent(from, to, percent = 0.5) {
        if (from == null) {
            from = 1;
        }
        if (to == null) {
            to = 1;
        }
        return clamp(round(from + percent * (to - from)), 0, 1);
    }
    function interpolateDiscrete(from, to, percent = 0.5) {
        return percent < 0.5 ? from : to;
    }
    function interpolatePoint(from, to, percent = 0.5) {
        return new Point(interpolateNumber(from.x, to.x, percent), interpolateNumber(from.y, to.y, percent));
    }
    function interpolatePoly(from, to, percent = 0.5) {
        if (from.length !== to.length) {
            return interpolateDiscrete(from, to, percent).slice();
        }
        const list = [];
        const length = from.length;
        for (let i = 0; i < length; i++) {
            list.push(interpolatePoint(from[i], to[i], percent));
        }
        return list;
    }
    function interpolateColor(from, to, percent = 0.5) {
        if (percent <= 0) {
            return from;
        }
        if (percent >= 1) {
            return to;
        }
        return new Color(interpolateColorComponent(from.r, to.r, percent), interpolateColorComponent(from.g, to.g, percent), interpolateColorComponent(from.b, to.b, percent), interpolateAlphaComponent(from.a, to.a, percent));
    }
    function interpolateBrush(from, to, percent = 0.5) {
        // TODO: implement different brush interpolation
        return interpolateDiscrete(from, to, percent).clone();
    }
    function interpolateDashArray(from, to, percent = 0.5) {
        // TODO:
        return percent < 0.5 ? from : to;
    }
    function interpolateMotion(from, to, percent = 0.5) {
        // TODO:
        // @ts-ignore
        return interpolatePoint(from, to, percent);
    }
    function interpolateRectRadius(from, to, percent = 0.5) {
        // TODO:
        return percent < 0.5 ? from : to;
    }
    function interpolatePathNode(from, to, percent = 0.5) {
        // TODO:
        return interpolateDiscrete(from, to, percent).clone();
    }
    function interpolatePath(from, to, percent = 0.5) {
        if (from.nodes.length !== to.nodes.length) {
            return interpolateDiscrete(from, to, percent).clone();
        }
        const length = from.nodes.length;
        const nodes = [];
        for (let i = 0; i < length; i++) {
            nodes.push(interpolatePathNode(from.nodes[i], to.nodes[i], percent));
        }
        // TODO: check if something like mirror, etc.
        return new Path(nodes);
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class NumberAnimation extends Animation {
        constructor(keyframes = null, disabled = false) {
            super(keyframes, disabled, interpolateNumber);
        }
    }
    class PercentAnimation extends Animation {
        constructor(keyframes = null, disabled = false) {
            super(keyframes, disabled, interpolatePercent);
        }
    }
    class PointAnimation extends Animation {
        constructor(keyframes = null, disabled = false) {
            super(keyframes, disabled, interpolatePoint);
        }
    }
    class OpacityAnimation extends Animation {
        constructor(keyframes = null, disabled = false) {
            super(keyframes, disabled, interpolateAlphaComponent);
        }
    }
    class PositiveNumberAnimation extends Animation {
        constructor(keyframes = null, disabled = false) {
            super(keyframes, disabled, interpolatePositiveNumber);
        }
    }
    class BrushAnimation extends Animation {
        constructor(keyframes = null, disabled = false) {
            super(keyframes, disabled, interpolateBrush);
        }
    }
    class DashArrayAnimation extends Animation {
        constructor(keyframes = null, disabled = false) {
            super(keyframes, disabled, interpolateDashArray);
        }
    }
    class MotionAnimation extends Animation {
        constructor(keyframes = null, disabled = false) {
            super(keyframes, disabled, interpolateMotion);
        }
    }
    class RectRadiusAnimation extends Animation {
        constructor(keyframes = null, disabled = false) {
            super(keyframes, disabled, interpolateRectRadius);
        }
    }
    class PathAnimation extends Animation {
        constructor(keyframes = null, disabled = false) {
            super(keyframes, disabled, interpolatePath);
        }
    }
    class PolyAnimation extends Animation {
        constructor(keyframes = null, disabled = false) {
            super(keyframes, disabled, interpolatePoly);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const ElementAnimators = {
        opacity: {
            id: 'opacity',
            title: 'Opacity',
            create() {
                return new OpacityAnimation();
            }
        }
    };
    const TransformAnimators = {
        position: {
            id: 'position',
            title: 'Position',
            //@ts-ignore
            create() {
                // TODO: check this out
                return new MotionAnimation();
            }
        },
        anchor: {
            id: 'anchor',
            title: 'Anchor',
            create() {
                return new PointAnimation();
            }
        },
        rotate: {
            id: 'rotate',
            title: 'Rotate',
            create() {
                return new NumberAnimation();
            }
        },
        scale: {
            id: 'scale',
            title: 'Scale',
            create() {
                return new PointAnimation();
            }
        },
        skewAngle: {
            id: 'skew-angle',
            title: 'Skew angle',
            create() {
                return new NumberAnimation();
            }
        },
        skewAxis: {
            id: 'skew-axis',
            title: 'Skew axis',
            create() {
                return new NumberAnimation();
            }
        },
    };
    const FillAnimators = {
        fill: {
            id: 'fill',
            title: 'Fill',
            create() {
                return new BrushAnimation();
            }
        },
        fillOpacity: {
            id: 'fill-opacity',
            title: 'Fill opacity',
            create() {
                return new OpacityAnimation();
            }
        },
    };
    const StrokeAnimators = {
        strokeBrush: {
            id: 'stroke',
            title: 'Stroke',
            create() {
                return new BrushAnimation();
            }
        },
        strokeOpacity: {
            id: 'stroke-opacity',
            title: 'Stroke opacity',
            create() {
                return new OpacityAnimation();
            }
        },
        strokeLineWidth: {
            id: 'stroke-width',
            title: 'Stroke width',
            create() {
                return new PositiveNumberAnimation();
            }
        },
        strokeDashOffset: {
            id: 'stroke-dash-offset',
            title: 'Dash offset',
            create() {
                return new NumberAnimation();
            }
        },
        strokeDashArray: {
            id: 'stroke-dash-array',
            title: 'Dash array',
            create() {
                return new DashArrayAnimation();
            }
        },
    };
    const VectorAnimators = {
        ...ElementAnimators,
        ...TransformAnimators,
        ...FillAnimators,
        ...StrokeAnimators,
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const RectAnimators = {
        ...VectorAnimators,
        width: {
            id: 'width',
            title: 'Width',
            create() {
                return new PositiveNumberAnimation();
            }
        },
        height: {
            id: 'height',
            title: 'Height',
            create() {
                return new PositiveNumberAnimation();
            }
        },
        radius: {
            id: 'rect-radius',
            title: 'Radius',
            create() {
                return new RectRadiusAnimation();
            }
        }
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const EllipseAnimators = {
        ...VectorAnimators,
        width: {
            id: 'width',
            title: 'Width',
            create() {
                return new PositiveNumberAnimation();
            }
        },
        height: {
            id: 'height',
            title: 'Height',
            create() {
                return new PositiveNumberAnimation();
            }
        },
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const ClipPathAnimators = {
        ...ElementAnimators,
        ...TransformAnimators,
        path: {
            id: 'path',
            title: 'Clip path',
            create() {
                return new PathAnimation();
            }
        }
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const PathAnimators = {
        ...VectorAnimators,
        path: {
            id: 'path',
            title: 'Path',
            create() {
                return new PathAnimation();
            }
        }
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const GroupAnimators = {
        ...ElementAnimators,
        ...TransformAnimators,
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const PolyAnimators = {
        ...VectorAnimators,
        points: {
            id: 'points',
            title: 'Points',
            create() {
                return new PolyAnimation();
            }
        }
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const RegularPolygonAnimators = {
        ...VectorAnimators,
        radius: {
            id: 'radius',
            title: 'Radius',
            create() {
                return new PositiveNumberAnimation();
            }
        },
        // TODO: cornerRadius?
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const StarAnimators = {
        ...VectorAnimators,
        outerRadius: {
            id: 'radius',
            title: 'Radius',
            create() {
                return new PositiveNumberAnimation();
            }
        },
        // TODO: add innerRadius, outerCornerRadius, innerCornerRadius, innerRotate?
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const TextAnimators = {
        ...VectorAnimators,
        // TODO: add size animator? other text animators...
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const SymbolAnimators = {
        ...ElementAnimators,
        ...TransformAnimators,
        time: {
            id: 'time',
            title: 'Time',
            create() {
                return new PositiveNumberAnimation();
            }
        }
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const MaskAnimators = {
        ...ElementAnimators,
        ...TransformAnimators,
        time: {
            id: 'time',
            title: 'Time',
            create() {
                return new PositiveNumberAnimation();
            }
        }
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const DefaultAnimatorsMap = {
        'rect': RectAnimators,
        'ellipse': EllipseAnimators,
        'clip-path': ClipPathAnimators,
        'path': PathAnimators,
        'group': GroupAnimators,
        'poly': PolyAnimators,
        'regular-polygon': RegularPolygonAnimators,
        'star': StarAnimators,
        'text': TextAnimators,
        'symbol': SymbolAnimators,
        'mask': MaskAnimators,
    };

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class AnimatorSource {
        constructor(source) {
            this._source = source || new Map(Object.entries(DefaultAnimatorsMap));
        }
        setElementAnimators(element, animators) {
            const type = typeof element === 'string' ? element : element.type;
            if (!animators) {
                this._source.delete(type);
            }
            else {
                this._source.set(type, animators);
            }
        }
        setAnimator(element, property, animator) {
            const type = typeof element === 'string' ? element : element.type;
            if (!this._source.has(type)) {
                if (!animator) {
                    return;
                }
                this._source.set(type, {});
            }
            const map = this._source.get(type);
            if (animator) {
                map[property] = animator;
            }
            else if (property in map) {
                delete map[property];
            }
        }
        getAnimator(element, property) {
            const type = element.type;
            if (!this._source.has(type)) {
                return null;
            }
            const list = this._source.get(type);
            if (!(property in list)) {
                return null;
            }
            return list[property];
        }
        isAnimatable(element, property) {
            if (!(property in element)) {
                return false;
            }
            return this.getAnimator(element, property) != null;
        }
        createAnimation(element, property) {
            if (!(property in element)) {
                return null;
            }
            return this.getAnimator(element, property)?.create();
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.AnimationMode = void 0;
    (function (AnimationMode) {
        AnimationMode[AnimationMode["Normal"] = 0] = "Normal";
        AnimationMode[AnimationMode["Loop"] = 1] = "Loop";
        AnimationMode[AnimationMode["LoopReverse"] = 2] = "LoopReverse";
    })(exports.AnimationMode || (exports.AnimationMode = {}));
    class DocumentAnimation {
        constructor(document, startTime, endTime, mode = exports.AnimationMode.Normal, animations) {
            this._document = document;
            this._startTime = startTime;
            this._endTime = endTime;
            this._mode = mode;
            this._map = animations ?? new Map();
        }
        get document() {
            return this._document;
        }
        get startTime() {
            return this._startTime;
        }
        set startTime(value) {
            this._startTime = clamp(Math.round(value), 0, this._endTime);
        }
        get endTime() {
            return this._endTime;
        }
        set endTime(value) {
            this._endTime = clamp(Math.round(value), this._startTime, Number.POSITIVE_INFINITY);
        }
        get duration() {
            return this._endTime - this._startTime;
        }
        get mode() {
            return this._mode;
        }
        set mode(value) {
            this._mode = value;
        }
        mapTime(time) {
            switch (this._mode) {
                case exports.AnimationMode.Loop:
                    time = time % this._endTime;
                    break;
                case exports.AnimationMode.LoopReverse:
                    // TODO:
                    break;
            }
            return clamp(time, this._startTime, this._endTime);
        }
        *getAnimatedElements() {
            let element;
            for (const [id, properties] of this._map.entries()) {
                element = this._document.getElementById(id);
                if (element) {
                    yield [element, properties];
                }
            }
        }
        /**
         * Updates the property values for animated documents
         */
        updateAnimatedProperties(time, setter) {
            if (this._map.size === 0) {
                return false;
            }
            time = this.mapTime(time);
            let updated = false;
            let element;
            let property;
            let animation;
            let value;
            for (const [id, properties] of this._map.entries()) {
                element = this._document.getElementById(id);
                if (!element) {
                    continue;
                }
                for ([property, animation] of Object.entries(properties)) {
                    if (animation.disabled) {
                        continue;
                    }
                    value = animation.getValueAtOffset(time);
                    if (value === null) {
                        // no keyframes, ignore
                        continue;
                    }
                    if (setter(element, property, value)) {
                        updated = true;
                    }
                }
            }
            return updated;
        }
        /**
         * Remove animated elements that are no longer present in document
         */
        cleanupAnimatedProperties() {
            let changed = false;
            for (const id of this._map.keys()) {
                if (this._document.getElementById(id) == null) {
                    this._map.delete(id);
                    changed = true;
                }
            }
            return changed;
        }
        clone(document) {
            return new DocumentAnimation(document || this._document, this._startTime, this._endTime, this._mode, this.cloneAnimationMap());
        }
        cloneAnimationMap() {
            const list = new Map();
            for (const [id, properties] of this._map.entries()) {
                const value = {};
                for (const [property, animation] of Object.entries(properties)) {
                    value[property] = animation.clone();
                }
                list.set(id, value);
            }
            return list;
        }
        dispose() {
            this._document = null;
            if (this._map) {
                this._map.clear();
                this._map = null;
            }
        }
        getAnimatedProperties(element) {
            if (element.document !== this._document) {
                return null;
            }
            return this._map.has(element.id) ? this._map.get(element.id) : null;
        }
        removeAnimatedProperties(element) {
            if (element.document !== this._document) {
                return false;
            }
            if (this._map.has(element.id)) {
                this._map.delete(element.id);
                return true;
            }
            return false;
        }
        isAnimated(element) {
            if (element.document !== this._document) {
                return false;
            }
            const properties = this.getAnimatedProperties(element);
            if (properties == null) {
                return false;
            }
            for (const prop in properties) {
                if (properties[prop].isAnimated) {
                    return true;
                }
            }
            return false;
        }
        getAnimation(element, property) {
            if (element.document !== this._document) {
                return null;
            }
            const properties = this.getAnimatedProperties(element);
            if (properties == null || !(property in properties)) {
                return null;
            }
            return properties[property];
        }
        removeAnimation(element, property) {
            if (element.document !== this._document) {
                return false;
            }
            const properties = this.getAnimatedProperties(element);
            if (properties == null || !(property in properties)) {
                return false;
            }
            delete properties[property];
            if (Object.keys(properties).length === 0) {
                // Remove empty list
                this.removeAnimatedProperties(element);
            }
            return true;
        }
        addAnimation(element, property, animation) {
            if (element.document !== this._document) {
                return false;
            }
            let properties;
            if (this._map.has(element.id)) {
                properties = this._map.get(element.id);
            }
            else {
                properties = {};
                this._map.set(element.id, properties);
            }
            properties[property] = animation;
            return true;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class State {
        constructor(project, size = 10) {
            this.undoList = [];
            this.redoList = [];
            this.project = project;
            this.size = size;
            this.record = this.createRecord(project.document, true);
        }
        createRecord(document, cloneDocument) {
            const meta = this.createMeta(document);
            if (cloneDocument) {
                document = document.clone();
            }
            return { document, meta };
        }
        disposeRecord(record) {
            record.document.dispose();
            record.document = record.meta = null;
        }
        createMeta(document) {
            return {
                selection: this.project.selection.getSelectedIds(),
            };
        }
        get canUndo() {
            return this.undoList.length > 0;
        }
        get canRedo() {
            return this.redoList.length > 0;
        }
        undo() {
            if (!this.canUndo) {
                return false;
            }
            const next = this.undoList.pop();
            this.redoList.push(this.record);
            const meta = this.record.meta;
            this.record = { document: next.document.clone(), meta: next.meta };
            return this.project.replaceDocument(next.document, meta);
        }
        redo() {
            if (!this.canRedo) {
                return false;
            }
            const next = this.redoList.pop();
            this.undoList.push(this.record);
            const meta = next.meta;
            this.record = { document: next.document.clone(), meta: next.meta };
            return this.project.replaceDocument(next.document, meta);
        }
        snapshot() {
            while (this.redoList.length) {
                this.disposeRecord(this.redoList.pop());
            }
            this.undoList.push(this.record);
            this.record = this.createRecord(this.project.document, true);
            if (this.undoList.length > this.size) {
                this.disposeRecord(this.undoList.shift());
            }
        }
        dispose() {
            while (this.undoList.length) {
                this.disposeRecord(this.undoList.pop());
            }
            this.undoList = null;
            while (this.redoList.length) {
                this.disposeRecord(this.redoList.pop());
            }
            this.redoList = null;
            this.disposeRecord(this.record);
            this.record = null;
            this.project = null;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class AnimationState extends State {
        createMeta(document) {
            const meta = super.createMeta(document);
            meta.keyframeSelection = this.project.keyframeSelection?.getSelectedKeyframes();
            return meta;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class Selection {
        constructor() {
            this._document = null;
            this._selection = new Set();
            this._activeElement = null;
            this._info = null;
            this._hash = 0;
        }
        dispose() {
            this._info = null;
            this._document = null;
            this._activeElement = null;
            if (this._selection) {
                this._selection.clear();
                this._selection = null;
            }
        }
        get document() {
            return this._document;
        }
        set document(value) {
            this.setDocument(value);
        }
        setDocument(document, selection = null) {
            if (selection == null && document != null && this._document != null && document.id === this._document.id) {
                // we have the same document id and no selection, get current selection
                selection = this.getSelectedIds();
            }
            // Set new document
            this._document = document;
            // Clear current selection
            this._activeElement = null;
            this._selection.clear();
            // Restore selection if possible
            if (document != null && selection != null && selection.length > 0) {
                // Set the new selection
                for (const id of selection) {
                    const el = document.getElementById(id);
                    if (el) {
                        this._selection.add(el);
                    }
                }
                // Set active element
                this.makeFirstElementActive();
            }
            this.clearCache();
        }
        get hash() {
            return this._hash;
        }
        get length() {
            return this._selection.size;
        }
        get activeElement() {
            return this._activeElement;
        }
        set activeElement(element) {
            this.setActiveElement(element);
        }
        get elements() {
            return this._selection;
        }
        setActiveElement(element) {
            if (!element) {
                return this.clear();
            }
            if (this._activeElement !== element) {
                return this.select(element, true);
            }
            return false;
        }
        clear() {
            this._activeElement = null;
            if (this._selection.size !== 0) {
                this._selection.clear();
                this.clearCache();
                return true;
            }
            return false;
        }
        isSelected(element) {
            return this._selection.has(element);
        }
        rectSelect(rect, start, seeThrough = true) {
            if (this._document !== start.document) {
                // prevent cross document selection
                return false;
            }
            if (!rect.isVisible) {
                return this.clear();
            }
            const cleared = this.clear();
            const selected = this._selection;
            function doSelection(element) {
                for (const child of element.children(true)) {
                    if (child.hidden || child.locked) {
                        // do not select hidden or locked
                        continue;
                    }
                    if (seeThrough && child.supportsChildren) {
                        if (child.hasChildren) {
                            doSelection(child);
                        }
                        continue;
                    }
                    if (rect.intersects(child.globalTightBounds)) {
                        selected.add(child);
                    }
                }
            }
            doSelection(start);
            this._activeElement = null;
            if (selected.size > 0) {
                this.makeFirstElementActive();
                if (!cleared) {
                    this.clearCache();
                }
                return true;
            }
            return cleared;
        }
        select(element, multiple = false) {
            if (this._document !== element.document) {
                return false;
            }
            const selection = this._selection;
            if (multiple) {
                if (!selection.has(element)) {
                    this.selectElement(element);
                }
            }
            else {
                if (selection.size === 1 && selection.has(element)) {
                    return false;
                }
                selection.clear();
                selection.add(element);
            }
            this._activeElement = element;
            this.clearCache();
            return true;
        }
        toggle(element, multiple = false) {
            if (multiple && this._selection.has(element)) {
                return this.deselect(element);
            }
            return this.select(element, multiple);
        }
        deselect(element) {
            if (this._document !== element.document) {
                return false;
            }
            const selected = this._selection;
            if (selected.has(element)) {
                selected.delete(element);
                if (this._activeElement === element) {
                    this.makeFirstElementActive();
                }
                this.clearCache();
                return true;
            }
            return false;
        }
        deselectChildren(element) {
            if (this._document !== element.document) {
                return false;
            }
            if (this.deselectElementChildren(element) === 0) {
                return false;
            }
            const selected = this._selection;
            // Set a new active element if deselected
            if (!selected.has(this._activeElement)) {
                this.makeFirstElementActive();
            }
            this.clearCache();
            return true;
        }
        selectElement(element) {
            const selected = this._selection;
            if (!selected.size) {
                selected.add(element);
                return;
            }
            let parent = element.parent;
            while (parent && parent.isElement && selected.size) {
                if (selected.has(parent)) {
                    selected.delete(parent);
                }
                parent = parent.parent;
            }
            if (selected.size === 0) {
                return;
            }
            this.deselectElementChildren(element);
            selected.add(element);
        }
        deselectElementChildren(element) {
            if (!element.supportsChildren || !element.hasChildren) {
                return 0;
            }
            const selected = this._selection;
            if (!selected.size) {
                return 0;
            }
            let removed = 0;
            for (const child of selected) {
                if (element.contains(child)) {
                    selected.delete(child);
                    removed++;
                }
            }
            return removed;
        }
        makeFirstElementActive() {
            this._activeElement = this._selection.size ? this._selection.values().next().value : null;
        }
        clearCache() {
            this._info = null;
            this._hash++;
        }
        /**
         * Selection info
         */
        get info() {
            if (this._info !== null) {
                return this._info;
            }
            const info = {
                isVectorOnly: true,
                isSameType: true,
                isSamePenType: true
            };
            let lastType = undefined, lastPenType = undefined;
            for (const element of this._selection) {
                if (lastType === undefined) {
                    lastType = element.type;
                }
                else if (info.isSameType) {
                    info.isSameType = lastType === element.type;
                }
                if (element instanceof VectorElement) {
                    if (lastPenType === undefined) {
                        lastPenType = element.stroke.type;
                    }
                    else if (info.isSamePenType) {
                        info.isSamePenType = element.stroke.type === lastPenType;
                    }
                }
                else {
                    info.isVectorOnly = false;
                }
            }
            return this._info = info;
        }
        /**
         * If you ever need only the selection ids use this method
         * The active element id is always first
         */
        getSelectedIds() {
            if (this._selection.size === 0) {
                return [];
            }
            const list = Array.from(this._selection).map((el) => el.id);
            const id = this._activeElement.id;
            if (list[0] !== id) {
                const pos = list.indexOf(id);
                if (pos !== -1) {
                    list.splice(pos, 1);
                }
                list.unshift(id);
            }
            return list;
        }
        *[Symbol.iterator]() {
            for (const value of this._selection) {
                yield value;
            }
        }
        *vectorElements() {
            for (const value of this._selection) {
                if (value instanceof VectorElement) {
                    yield value;
                }
            }
        }
        *filteredElements(filter, includeActiveElement = true) {
            if (includeActiveElement && this._activeElement) {
                for (const value of this._selection) {
                    if (value !== this._activeElement && filter(value)) {
                        yield value;
                    }
                }
            }
            else {
                for (const value of this._selection) {
                    if (filter(value)) {
                        yield value;
                    }
                }
            }
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const MAX_STATE_STACK = 10;
    class Project {
        constructor() {
            this._document = null;
            this._masterDocument = null;
            this._documentMap = new Map();
            this._state = new Map();
            this._middleware = null;
            this._selection = new Selection();
        }
        dispose() {
            if (this._documentMap == null) {
                // Already disposed
                return;
            }
            const state = this._state;
            this._state = null;
            // Clear document list
            if (this._documentMap) {
                for (const [id, document] of this._documentMap.entries()) {
                    if (state.has(id)) {
                        state.get(id).dispose();
                        state.delete(id);
                    }
                    document.dispose();
                }
                this._documentMap.clear();
                this._documentMap = null;
            }
            this._document = null;
            this._masterDocument = null;
            // Clear left-over state
            for (const st of state.values()) {
                st.dispose();
            }
            state.clear();
            // Clear selection
            this._selection.dispose();
            this._selection = null;
            // Remove middleware
            this._middleware = null;
        }
        hasDocument(document) {
            return this._documentMap.has(document.id);
        }
        addDocument(document) {
            if (document.project != null) {
                // Document must not be attached to other project
                return false;
            }
            const id = document.id;
            if (this._documentMap.has(id)) {
                return false;
            }
            // Link to current project
            document.project = this;
            this._documentMap.set(id, document);
            if (this._document == null) {
                this.setCurrentDocument(document);
            }
            return true;
        }
        /**
         * Removes the document and clears document state
         * If the current document is the document you want to remove, the document will not be removed
         * Optionally you can dispose the document
         * You cannot remove the master document
         */
        removeDocument(document, dispose = false) {
            const id = document.id;
            if (!this._documentMap.has(id) || this._document.id === id) {
                return false;
            }
            this._documentMap.delete(id);
            if (this._state.has(id)) {
                this._state.get(id).dispose();
                this._state.delete(id);
            }
            if (id === this._masterDocument) {
                this._masterDocument = null;
            }
            if (dispose) {
                document.dispose();
            }
            // Unlink from current project
            document.project = null;
            return true;
        }
        getDocumentById(id) {
            return this._documentMap.has(id) ? this._documentMap.get(id) : null;
        }
        /**
         * Resolves another document by id, preventing circular references when drawing
         */
        getDocumentForDraw(id) {
            const ref = this.getDocumentById(id);
            if (!ref || ref.isDrawing) {
                // Document not found, or this is a circular-reference
                // Example of simple circular reference:
                // Doc1 - contains E1 - references Doc1
                // Example of complex circular reference:
                // Doc1 - contains E1 - references Doc2, Doc2 - contains E2 - references Doc3, Doc3 - contains E3 - references Doc1
                return null;
            }
            return ref;
        }
        /**
         * @inheritDoc
         */
        getDocumentPicture(id, time) {
            const document = this.getDocumentForDraw(id);
            if (!document) {
                return null;
            }
            return document.getPicture();
        }
        /**
         * Get an iterator to documents
         */
        getDocuments() {
            return this._documentMap.values();
        }
        get selection() {
            return this._selection;
        }
        get middleware() {
            if (this._middleware == null) {
                this._middleware = this.createMiddleware();
            }
            return this._middleware;
        }
        get masterDocument() {
            if (!this._masterDocument || !this._documentMap.has(this._masterDocument)) {
                return null;
            }
            return this._documentMap.get(this._masterDocument);
        }
        set masterDocument(value) {
            if (value) {
                this._masterDocument = value.id;
            }
            else {
                this._masterDocument = null;
            }
        }
        get document() {
            return this._document;
        }
        set document(value) {
            if (this._documentMap.has(value.id)) {
                this.setCurrentDocument(value);
            }
        }
        setCurrentDocument(value, state) {
            this._document = value;
            this._selection.setDocument(value, state?.selection);
            if (!this._state.has(value.id)) {
                this._state.set(value.id, this.createState(MAX_STATE_STACK));
            }
        }
        /**
         * This is used by State, do NOT call it!
         * @internal
         */
        replaceDocument(next, meta) {
            this.setCurrentDocument(next, meta);
            // Overwrite current document
            this._documentMap.set(next.id, next);
            return true;
        }
        createState(maxStack) {
            return new State(this, maxStack);
        }
        get state() {
            // if (!this._state.has(this._document.id)) {
            //     this._state.set(this._document.id, this.createState(MAX_STATE_STACK));
            // }
            return this._state.get(this._document.id);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    exports.MoveElementMode = void 0;
    (function (MoveElementMode) {
        MoveElementMode["APPEND"] = "append";
        MoveElementMode["PREPEND"] = "prepend";
        MoveElementMode["BEFORE"] = "before";
        MoveElementMode["AFTER"] = "after";
    })(exports.MoveElementMode || (exports.MoveElementMode = {}));
    class Middleware {
        constructor(project) {
            this._project = project;
        }
        get project() {
            return this._project;
        }
        bringForward(elements) {
            return this.forEachElement(elements, (el) => el.bringForward());
        }
        bringToFront(elements) {
            return this.forEachElement(elements, (el) => el.bringToFront());
        }
        sendBackward(elements) {
            return this.forEachElement(elements, (el) => el.sendBackward());
        }
        sendToBack(elements) {
            return this.forEachElement(elements, (el) => el.sendToBack());
        }
        /**
         * Moves tree elements to another element target
         */
        sendToTarget(element, target, mode = exports.MoveElementMode.APPEND, extraElements) {
            switch (mode) {
                case exports.MoveElementMode.BEFORE:
                    if (!target.parent || target.previousSibling === element) {
                        return false;
                    }
                    target.parent.insertBefore(element, target);
                    break;
                case exports.MoveElementMode.AFTER:
                    if (!target.parent || target.nextSibling === element) {
                        return false;
                    }
                    target.parent.insertAfter(element, target);
                    break;
                case exports.MoveElementMode.PREPEND:
                    if (!target.supportsChildren || target.firstChild === element) {
                        return false;
                    }
                    target.prependChild(element);
                    break;
                case exports.MoveElementMode.APPEND:
                    if (!target.supportsChildren || target.lastChild === element) {
                        return false;
                    }
                    target.appendChild(element);
                    break;
                default:
                    return false;
            }
            if (!extraElements) {
                return true;
            }
            // TODO: optimize here
            let last = element;
            for (const el of extraElements) {
                if (el !== element) {
                    last.parent.insertAfter(el, last);
                }
            }
            return true;
        }
        /**
         * Deletes elements from tree
         * You can use a custom dispose function, or you can prevent disposal
         */
        deleteElements(elements, dispose = true) {
            return this.forEachElement(elements, (el) => {
                const ret = el.remove();
                if (dispose) {
                    if (typeof dispose === 'function') {
                        dispose(el);
                    }
                    else {
                        el.dispose();
                    }
                }
                return ret;
            });
        }
        /**
         * Adds elements to a group
         */
        groupElements(elements, group) {
            let changed = false;
            for (const element of elements) {
                if (group.lastChild !== element) {
                    group.appendChild(element);
                    changed = true;
                }
            }
            return changed;
        }
        /**
         * Ungroups elements
         * Removed groups are disposed
         */
        ungroupElements(elements, removeGroups = true) {
            let changed = false;
            for (const element of elements) {
                if (!(element instanceof GroupElement)) {
                    continue;
                }
                if (!element.hasChildren) {
                    if (removeGroups && element.remove()) {
                        element.dispose();
                        changed = true;
                    }
                    continue;
                }
                let child;
                let last = element;
                while ((child = element.firstChild) != null) {
                    last.parent.insertAfter(child, last);
                    last = child;
                }
                if (removeGroups && element.remove()) {
                    element.dispose();
                }
                changed = true;
            }
            return changed;
        }
        forEachElement(elements, f) {
            let changed = false;
            for (const element of elements) {
                if (f(element)) {
                    changed = true;
                }
            }
            return changed;
        }
        /**
         * Swaps stroke and fill brushes
         */
        swapStrokeFill(elements, keepOpacity = false) {
            let changed = false;
            const f = (element) => {
                // clone stroke
                const fill = element.strokeBrush.clone();
                // clone fill
                const stroke = element.fill.clone();
                if (keepOpacity) {
                    // preserve original opacity
                    const fillOp = fill.opacity;
                    fill.opacity = stroke.opacity;
                    stroke.opacity = fillOp;
                }
                // Set stroke brush
                if (this.setElementProperty(element, "strokeBrush", stroke)) {
                    changed = true;
                }
                // Set fill brush
                if (this.setElementProperty(element, "fill", fill)) {
                    changed = true;
                }
                // Set stroke opacity (to allow animations)
                if (this.setElementProperty(element, "strokeOpacity", stroke.opacity)) {
                    changed = true;
                }
                // Set fill opacity (to allow animations)
                if (this.setElementProperty(element, "fillOpacity", fill.opacity)) {
                    changed = true;
                }
            };
            for (const element of elements) {
                if (!(element instanceof VectorElement)) {
                    // Only vector elements allowed
                    continue;
                }
                // Multiple properties are set, prevent invalidation
                Node.preventInvalidation(f, this, element);
                // Now we can invalidate
                element.invalidate();
            }
            return changed;
        }
        /**
         * Converts document delta to element delta
         */
        getElementDeltaPoint(element, delta, shifted = false) {
            if (delta.isZero) {
                return delta;
            }
            const matrix = element?.parent.globalMatrix;
            if (matrix && !matrix.isIdentity) {
                return matrix.transformInversePoint(delta, shifted);
            }
            return delta;
        }
        /**
         * Aligns element to rectangle position (relative to document)
         */
        alignElementToRectangle(element, rectangle, x, y) {
            // TODO: get position?
            let position = element.localTightBounds.topLeft;
            const matrix = element?.parent.globalMatrix;
            if (matrix && !matrix.isIdentity) {
                position = matrix.transformPoint(position);
            }
            let point = rectangle.getPointFromPosition(x, y, position);
            if (point === null) {
                return false;
            }
            point = this.getElementDeltaPoint(element, point.sub(position));
            throw "WIP";
        }
        /**
         * Moves the element anchor so the specified bbox point matches origin
         */
        alignElementToOrigin(element, x, y) {
            const point = element.localTightBounds.getPointFromPosition(x, y, element.anchor.negate());
            if (point === null) {
                // no point
                return false;
            }
            return this.setElementsProperty(element, "anchor", point.negate());
        }
        /**
         * Moves origin to a position on elements bbox
         */
        alignOriginToElement(element, x, y) {
            const point = element.localTightBounds.getPointFromPosition(x, y, element.position);
            if (point === null) {
                // no point
                return false;
            }
            return this.moveLocalOriginTo(element, point);
        }
        /**
         * Moves the origin (relative to document) and keeps the element in place by recalculating anchor
         */
        moveOriginTo(element, point) {
            return this.moveLocalOriginTo(element, this.getElementDeltaPoint(element, point, true));
        }
        /**
         * Moves origin (relative to element) and keeps the element in place by recalculating anchor
         * @protected
         */
        moveLocalOriginTo(element, point) {
            const position = element.position;
            if (position.equals(point)) {
                // already in place
                return false;
            }
            // we must recalculate anchor to keep the element in place
            this.setElementProperty(element, "anchor", element.anchor.sub(position.sub(point)));
            // set the new position
            return this.setElementPosition(element, point);
        }
        /**
         * Moves the origin by delta (relative to document), but keeps the element position by recalculating anchor
         */
        moveOriginBy(element, delta) {
            if (delta.isZero) {
                return false;
            }
            return this.moveLocalOriginTo(element, element.position.add(this.getElementDeltaPoint(element, delta)));
        }
        /**
         * Move element to a different position relative to document
         */
        moveElementTo(element, point) {
            return this.setElementPosition(element, this.getElementDeltaPoint(element, point, true));
        }
        /**
         * Move one element by delta (relative to document)
         */
        moveElementBy(element, delta) {
            if (delta.isZero) {
                return false;
            }
            return this.setElementPosition(element, element.position.add(this.getElementDeltaPoint(element, delta)));
        }
        /**
         * Move multiple elements by delta (relative to document)
         */
        moveElementsBy(elements, delta) {
            if (delta.isZero) {
                return false;
            }
            let changed = false;
            for (const element of elements) {
                if (this.setElementPosition(element, element.position.add(this.getElementDeltaPoint(element, delta)))) {
                    changed = true;
                }
            }
            return changed;
        }
        /**
         * Sets the element local position
         * Override this if needed
         */
        setElementPosition(element, position, angle) {
            let changed = false;
            if (angle != null) {
                const prev = element.autoOrientAngle;
                element.autoOrientAngle = angle;
                changed = prev !== element.autoOrientAngle;
            }
            return this.setElementProperty(element, "position", position) || changed;
        }
        /**
         * Set a dynamic property value for multiple elements
         * Use this when the value is dynamic at every call, usually when you want to set a new clone as value
         */
        setElementsPropertyDynamic(elements, property, value) {
            let changed = false;
            for (const element of elements) {
                if (element.hasOwnProperty(property) && this.setElementProperty(element, property, value())) {
                    changed = true;
                }
            }
            return changed;
        }
        /**
         * Set the same property value for multiple elements
         * Use this when the value is immutable
         */
        setElementsProperty(elements, property, value) {
            let changed = false;
            for (const element of elements) {
                if (element.hasOwnProperty(property) && this.setElementProperty(element, property, value)) {
                    changed = true;
                }
            }
            return changed;
        }
        /**
         * Sets a property value on element
         * This method updates the property if exists and the value is not the same
         */
        setElementProperty(element, property, value) {
            if (!(property in element) || equals(element[property], value)) {
                // missing or same value
                return false;
            }
            // update value
            element[property] = value;
            return true;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class AnimationMiddleware extends Middleware {
        setTime(time) {
            if (this.project.setTime(time)) {
                return this.updateAnimatedProperties(this.project.document);
            }
            return false;
        }
        getTime() {
            return this.project.time;
        }
        /**
         * Updates the document animated properties
         */
        updateAnimatedProperties(document, time) {
            const animation = document.animation;
            if (!animation) {
                return false;
            }
            if (time == null) {
                time = this.project.time;
            }
            return animation.updateAnimatedProperties(time, this.setAnimatedPropertyValue.bind(this));
        }
        /**
         * Get property animation from element, or null if no animation is defined
         */
        getAnimation(element, property) {
            return element.document.animation?.getAnimation(element, property);
        }
        setAnimatedPropertyValue(element, property, value) {
            return super.setElementProperty(element, property, value);
        }
        /**
         * @override
         */
        setElementPosition(element, position, angle) {
            return super.setElementPosition(element, position, angle);
        }
        /**
         * @override
         */
        setElementProperty(element, property, value) {
            const project = this._project;
            let animation = this.getAnimation(element, property);
            if (!animation) {
                const documentAnimation = element.document.animation;
                if (!documentAnimation || !project.isRecording) {
                    // document is not animated OR
                    // we are not recording animations
                    return super.setElementProperty(element, property, value);
                }
                if (project.animatorSource.isAnimatable(element, property)) {
                    // create a new empty animation
                    animation = project.animatorSource.createAnimation(element, property);
                    if (!animation || !documentAnimation.addAnimation(element, property, animation)) {
                        return false;
                    }
                    // Add first keyframe
                    if (documentAnimation.startTime != project.time) {
                        animation.addKeyframeAtOffset(documentAnimation.startTime, element[property]);
                    }
                }
                else {
                    // property is not animatable
                    return super.setElementProperty(element, property, value);
                }
            }
            else if (animation.disabled) {
                // animation is disabled
                return super.setElementProperty(element, property, value);
            }
            // Update the animation
            // This updates the keyframe if there is an existing one
            if (!animation.addKeyframeAtOffset(project.time, value)) {
                return false;
            }
            super.setElementProperty(element, property, value);
            return true;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    class KeyframeSelection {
        // TODO: finish this
        constructor() {
        }
        dispose() {
        }
        setDocument(document, state) {
        }
        getSelectedKeyframes() {
            return null;
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    const MAX_TIME = 1000000 * 1000;
    class AnimationProject extends Project {
        constructor(source) {
            super();
            this._time = 0;
            this._isRecording = false;
            this._keyframeSelection = new KeyframeSelection();
            this._animatorSource = source;
        }
        dispose() {
            super.dispose();
            this._isRecording = false;
            if (this._keyframeSelection) {
                this._keyframeSelection.dispose();
                this._keyframeSelection = null;
            }
        }
        get time() {
            return this._time;
        }
        set time(value) {
            this.setTime(value);
        }
        setTime(value) {
            value = clamp(Math.round(value), 0, MAX_TIME);
            if (this._time === value) {
                return false;
            }
            this._time = value;
            return true;
        }
        /**
         * @inheritDoc
         */
        getDocumentPicture(id, time) {
            const document = this.getDocumentForDraw(id);
            if (!document) {
                return null;
            }
            if (time != null) {
                this.middleware.updateAnimatedProperties(document, time);
            }
            return document.getPicture();
        }
        get animatorSource() {
            return this._animatorSource;
        }
        get keyframeSelection() {
            return this._keyframeSelection;
        }
        get isRecording() {
            return this._isRecording;
        }
        set isRecording(value) {
            this._isRecording = value;
        }
        /**
         * @override
         */
        setCurrentDocument(value, state) {
            super.setCurrentDocument(value, state);
            this._keyframeSelection.setDocument(value, state?.keyframeSelection);
            this.middleware.updateAnimatedProperties(value, this._time);
        }
        // /**
        //  * @override
        //  * @internal
        //  */
        // replaceDocument(next: Document, meta?: AnimationStateMeta): boolean {
        //     if (!super.replaceDocument(next, meta)) {
        //         return false;
        //     }
        //     this.middleware.updateAnimatedProperties(next);
        //     return true;
        // }
        /**
         * @override
         */
        createMiddleware() {
            return new AnimationMiddleware(this);
        }
        /**
         * @override
         */
        createState(maxStack) {
            return new AnimationState(this, maxStack);
        }
    }

    /*
     * Copyright 2021 Zindex Software
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *    http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    async function CanvasEngineInit(init) {
        if (!init) {
            init = { defaultFont: './font.ttf.woff2' };
        }
        if (!window['Skia']) {
            // @ts-ignore
            window['Skia'] = await (init.skia || SkiaWasmInit__default['default'])(); // Define Skia as global
        }
        // Register default typeface
        FontManager.registerTypeface(Skia.SkTypeface.MakeFromData(await (await fetch(init.defaultFont)).arrayBuffer()), true);
        if (init.fonts) {
            for (let i = 0, l = init.fonts.length; i < l; i++) {
                FontManager.registerTypeface(Skia.SkTypeface.MakeFromData(await (await fetch(init.fonts[i])).arrayBuffer()));
            }
        }
        customElements.define('canvas-engine', CanvasEngine);
        await customElements.whenDefined('canvas-engine');
    }

    exports.Animation = Animation;
    exports.AnimationMiddleware = AnimationMiddleware;
    exports.AnimationProject = AnimationProject;
    exports.AnimationState = AnimationState;
    exports.AnimatorSource = AnimatorSource;
    exports.BaseBrush = BaseBrush;
    exports.BasePen = BasePen;
    exports.BaseTool = BaseTool;
    exports.BoardDocument = BoardDocument;
    exports.BrushAnimation = BrushAnimation;
    exports.CanvasEngine = CanvasEngine;
    exports.CanvasEngineInit = CanvasEngineInit;
    exports.ClipPathAnimators = ClipPathAnimators;
    exports.ClipPathElement = ClipPathElement;
    exports.Color = Color;
    exports.ColorMatrix = ColorMatrix;
    exports.ColorPickerTool = ColorPickerTool;
    exports.Composition = Composition;
    exports.ConicalGradientBrush = ConicalGradientBrush;
    exports.DEGREES = DEGREES;
    exports.DashArrayAnimation = DashArrayAnimation;
    exports.DefaultAnimatorsMap = DefaultAnimatorsMap;
    exports.DefaultPen = DefaultPen;
    exports.Document = Document;
    exports.DocumentAnimation = DocumentAnimation;
    exports.DrawingContext = DrawingContext;
    exports.EPSILON = EPSILON;
    exports.Element = Element;
    exports.ElementAnimators = ElementAnimators;
    exports.EllipseAnimators = EllipseAnimators;
    exports.EllipseElement = EllipseElement;
    exports.EllipseShape = EllipseShape;
    exports.EllipseTool = EllipseTool;
    exports.EmptyBrush = EmptyBrush;
    exports.FillAnimators = FillAnimators;
    exports.Font = Font;
    exports.FontManager = FontManager;
    exports.GlobalElementProperties = GlobalElementProperties;
    exports.GradientBrush = GradientBrush;
    exports.GroupAnimators = GroupAnimators;
    exports.GroupElement = GroupElement;
    exports.KeyboardStatus = KeyboardStatus;
    exports.Keyframe = Keyframe;
    exports.KeyframeSelection = KeyframeSelection;
    exports.LinearGradientBrush = LinearGradientBrush;
    exports.MAX_TIME = MAX_TIME;
    exports.MaskAnimators = MaskAnimators;
    exports.MaskElement = MaskElement;
    exports.MasterDocument = MasterDocument;
    exports.Matrix = Matrix;
    exports.Middleware = Middleware;
    exports.MotionAnimation = MotionAnimation;
    exports.Node = Node;
    exports.NumberAnimation = NumberAnimation;
    exports.OpacityAnimation = OpacityAnimation;
    exports.PanTool = PanTool;
    exports.Path = Path;
    exports.PathAnimation = PathAnimation;
    exports.PathAnimators = PathAnimators;
    exports.PathElement = PathElement;
    exports.PathNode = PathNode;
    exports.PatternBrush = PatternBrush;
    exports.PatternDocument = PatternDocument;
    exports.PercentAnimation = PercentAnimation;
    exports.Point = Point;
    exports.PointAnimation = PointAnimation;
    exports.PointerBrush = PointerBrush;
    exports.PolyAnimation = PolyAnimation;
    exports.PolyAnimators = PolyAnimators;
    exports.PolyElement = PolyElement;
    exports.PolyShape = PolyShape;
    exports.PolyTool = PolyTool;
    exports.PositiveNumberAnimation = PositiveNumberAnimation;
    exports.Project = Project;
    exports.RADIANS = RADIANS;
    exports.RadialGradientBrush = RadialGradientBrush;
    exports.RectAnimators = RectAnimators;
    exports.RectElement = RectElement;
    exports.RectRadiusAnimation = RectRadiusAnimation;
    exports.RectShape = RectShape;
    exports.RectShapeRadius = RectShapeRadius;
    exports.Rectangle = Rectangle;
    exports.RectangleTool = RectangleTool;
    exports.ReferenceElement = ReferenceElement;
    exports.RegularPolygonAnimators = RegularPolygonAnimators;
    exports.RegularPolygonElement = RegularPolygonElement;
    exports.RegularPolygonShape = RegularPolygonShape;
    exports.RegularPolygonTool = RegularPolygonTool;
    exports.Ruler = Ruler;
    exports.SelectTool = SelectTool;
    exports.Selection = Selection;
    exports.ShapeElement = ShapeElement;
    exports.Size = Size;
    exports.SolidBrush = SolidBrush;
    exports.StarAnimators = StarAnimators;
    exports.StarElement = StarElement;
    exports.StarShape = StarShape;
    exports.StarTool = StarTool;
    exports.State = State;
    exports.StopColorList = StopColorList;
    exports.StrokeAnimators = StrokeAnimators;
    exports.SymbolAnimators = SymbolAnimators;
    exports.SymbolElement = SymbolElement;
    exports.TextAnimators = TextAnimators;
    exports.TextElement = TextElement;
    exports.Theme = Theme;
    exports.TransformAnimators = TransformAnimators;
    exports.TwoPointGradientBrush = TwoPointGradientBrush;
    exports.VectorAnimators = VectorAnimators;
    exports.VectorElement = VectorElement;
    exports.ViewBox = ViewBox;
    exports.clamp = clamp;
    exports.clone = clone;
    exports.convertUnit = convertUnit;
    exports.equals = equals;
    exports.getRangePercent = getRangePercent;
    exports.greatestCommonDivisor = greatestCommonDivisor;
    exports.interpolateAlphaComponent = interpolateAlphaComponent;
    exports.interpolateBrush = interpolateBrush;
    exports.interpolateColor = interpolateColor;
    exports.interpolateColorComponent = interpolateColorComponent;
    exports.interpolateDashArray = interpolateDashArray;
    exports.interpolateDiscrete = interpolateDiscrete;
    exports.interpolateMotion = interpolateMotion;
    exports.interpolateNumber = interpolateNumber;
    exports.interpolatePath = interpolatePath;
    exports.interpolatePathNode = interpolatePathNode;
    exports.interpolatePercent = interpolatePercent;
    exports.interpolatePoint = interpolatePoint;
    exports.interpolatePoly = interpolatePoly;
    exports.interpolatePositiveNumber = interpolatePositiveNumber;
    exports.interpolateRectRadius = interpolateRectRadius;
    exports.isCloseTo = isCloseTo;
    exports.isMacOS = isMacOS;
    exports.isValidNumber = isValidNumber;
    exports.leastCommonMultiple = leastCommonMultiple;
    exports.numberListToString = numberListToString;
    exports.numberToString = numberToString;
    exports.parseColor = inputToRGB;
    exports.parseNumber = parseNumber;
    exports.parseNumberList = parseNumberList;
    exports.round = round;
    exports.uuid = uuid;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
