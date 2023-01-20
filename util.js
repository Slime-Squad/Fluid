/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @returns String that can be used as a rgb web color
 */
const rgb = (r, g, b) => `rgba(${r}, ${g}, ${b})`;

/** Global Parameters Object */
const PARAMS = { 
    BITWIDTH: 8,
    SCALE: 4,
    DEBUG: true,
    COLORS: {
        DARKGREEN: rgb(91, 166, 117),
        GREEN: rgb(107, 201, 108),
        LIMEGREEN: rgb(171, 221, 100),
        YELLOW: rgb(252, 239, 141),
        ORANGE: rgb(255, 184, 121),
        GRAPEFRUIT: rgb(234, 98, 98),
        RED: rgb(204, 66, 94),
        REDPINK: rgb(163, 40, 88),
        LIGHTPURPLE: rgb(117, 23, 86),
        DARKPURPLE: rgb(57, 9, 71),
        MAROON: rgb(97, 24, 81),
        BROWNPURPLE: rgb(135, 53, 85),
        BROWN: rgb(166, 85, 95),
        LIGHTBROWN: rgb(201, 115, 115),
        TAN: rgb(242, 174, 153),
        WHITEPINK: rgb(255, 195, 242),
        LIGHTPINK: rgb(238, 143, 203),
        PINK: rgb(212, 110, 179),
        LIGHTPURPLE: rgb(135, 62, 132),
        BLACKPURPLE: rgb(31, 16, 42),
        DARKGREY: rgb(74, 48, 82),
        GREY: rgb(123, 84, 128),
        LIGHTGREY: rgb(166, 133, 159),
        WHITEGREY: rgb(217, 189, 200),
        WHITE: rgb(255, 255, 255),
        WHITEBLUE: rgb(174, 226, 255),
        LIGHTBLUE: rgb(141, 183, 255),
        BLUE: rgb(109, 128, 250),
        BLUEPURPLE: rgb(132, 101, 236),
        LIGHTGRAPE: rgb(131, 77, 196),
        PURPLE: rgb(125, 45, 160),
        GRAPE: rgb(78, 24, 124)
    }
};

/**
 * @param {Number} n
 * @returns Random Integer Between 0 and n-1
 */
const randomInt = n => Math.floor(Math.random() * n);



/**
 * @param {Number} r Red Value
 * @param {Number} g Green Value
 * @param {Number} b Blue Value
 * @param {Number} a Alpha Value
 * @returns String that can be used as a rgba web color
 */
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

/**
 * @param {Number} h Hue
 * @param {Number} s Saturation
 * @param {Number} l Lightness
 * @returns String that can be used as a hsl web color
 */
const hsl = (h, s, l) => `hsl(${h}, ${s}%, ${l}%)`;

/** Creates an alias for requestAnimationFrame for backwards compatibility */
window.requestAnimFrame = (() => {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        /**
         * Compatibility for requesting animation frames in older browsers
         * @param {Function} callback Function
         * @param {DOM} element DOM ELEMENT
         */
        ((callback, element) => {
            window.setTimeout(callback, 1000 / 60);
        });
})();

/**
 * Returns distance from two points
 * @param {Number} p1, p2 Two objects with x and y coordinates
 * @returns Distance between the two points
 */
const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};