(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * JavaScript Cookie v2.1.4
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof define === 'function' && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}
	if (typeof exports === 'object') {
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));

},{}],2:[function(require,module,exports){
var utils = require("./utils.js");

module.exports = BboxAlignedText;

/**
 * Creates a new BboxAlignedText object - a text object that can be drawn with
 * anchor points based on a tight bounding box around the text.
 * @constructor
 * @param {object} font - p5.Font object
 * @param {string} text - String to display
 * @param {number} [fontSize=12] - Font size to use for string
 * @param {number} [x=0] - Initial x location
 * @param {number} [y=0] - Initial y location
 * @param {object} [pInstance=window] - Reference to p5 instance, leave blank if
 *                                      sketch is global
 * @example
 * var font, bboxText;
 * function preload() {
 *     font = loadFont("./assets/Regular.ttf");
 * }
 * function setup() {
 *     createCanvas(400, 600);
 *     background(0);
 *     
 *     bboxText = new BboxAlignedText(font, "Hey!", 30);    
 *     bboxText.setRotation(PI / 4);
 *     bboxText.setAnchor(BboxAlignedText.ALIGN.BOX_CENTER, 
 *                        BboxAlignedText.BASELINE.BOX_CENTER);
 *     
 *     fill("#00A8EA");
 *     noStroke();
 *     bboxText.draw(width / 2, height / 2);
 * }
 */
function BboxAlignedText(font, text, fontSize, x, y, pInstance) {
    this._font = font;
    this._text = text;
    this._x = utils.default(x, 0);
    this._y = utils.default(y, 0);
    this._fontSize = utils.default(fontSize, 12);
    this._p = utils.default(pInstance, window);
    this._rotation = 0;
    this._hAlign = BboxAlignedText.ALIGN.BOX_CENTER;
    this._vAlign = BboxAlignedText.BASELINE.BOX_CENTER;
    this._calculateMetrics(true);
}

/**
 * Vertical alignment values
 * @public
 * @static
 * @readonly
 * @enum {string}
 */
BboxAlignedText.ALIGN = {
    /** Draw from the left of the bbox */
    BOX_LEFT: "box_left",
    /** Draw from the center of the bbox */
    BOX_CENTER: "box_center",
    /** Draw from the right of the bbox */
    BOX_RIGHT: "box_right"
};

/**
 * Baseline alignment values
 * @public
 * @static
 * @readonly
 * @enum {string}
 */
BboxAlignedText.BASELINE = {
    /** Draw from the top of the bbox */
    BOX_TOP: "box_top",
    /** Draw from the center of the bbox */
    BOX_CENTER: "box_center",
    /** Draw from the bottom of the bbox */
    BOX_BOTTOM: "box_bottom",
    /** 
     * Draw from half the height of the font. Specifically the height is
     * calculated as: ascent + descent.
     */
    FONT_CENTER: "font_center",
    /** Draw from the the normal font baseline */
    ALPHABETIC: "alphabetic"
};

/**
 * Set current text
 * @public
 * @param {string} string - Text string to display
 * @returns {this} Useful for chaining
 */
BboxAlignedText.prototype.setText = function(string) {
    this._text = string;
    this._calculateMetrics(false);
    return this;
};

/**
 * Set the text position
 * @public
 * @param {number} x - X position
 * @param {number} x - Y position
 * @returns {this} Useful for chaining
 */
BboxAlignedText.prototype.setPosition = function(x, y) {
    this._x = utils.default(x, this._x);
    this._y = utils.default(y, this._y);
    return this;
};

/**
 * Get the text position
 * @public
 * @return {object} Returns an object with properties: x, y
 */
BboxAlignedText.prototype.getPosition = function() {
    return {
        x: this._x,
        y: this._y
    };
};

/**
 * Set current text size
 * @public
 * @param {number} fontSize Text size
 * @returns {this} Useful for chaining
 */
BboxAlignedText.prototype.setTextSize = function(fontSize) {
    this._fontSize = fontSize;
    this._calculateMetrics(true);
    return this;
};

/**
 * Set rotation of text
 * @public
 * @param {number} angle - Rotation in radians
 * @returns {this} Useful for chaining
 */
BboxAlignedText.prototype.setRotation = function(angle) {
    this._rotation = utils.default(angle, this._rotation);
    return this;
};

/**
 * Get rotation of text
 * @public
 * @returns {number} Rotation in radians
 */
BboxAlignedText.prototype.getRotation = function(angle) {
    return this._rotation;
};

/**
 * Set the p instance that is used for drawing
 * @public
 * @param {object} p - Instance of p5 for drawing. This is only needed when 
 *                     using an offscreen renderer or when using p5 in instance
 *                     mode.
 * @returns {this} Useful for chaining
 */
BboxAlignedText.prototype.setPInstance = function(p) {
    this._p = utils.default(p, this._p);
    return this;
};

/**
 * Get rotation of text
 * @public
 * @returns {object} Instance of p5 that is being used for drawing
 */
BboxAlignedText.prototype.getPInstance = function() {
    return this._p;
};

/**
 * Set anchor point for text (horizonal and vertical alignment) relative to
 * bounding box
 * @public
 * @param {string} [hAlign=CENTER] - Horizonal alignment
 * @param {string} [vAlign=CENTER] - Vertical baseline
 * @param {boolean} [updatePosition=false] - If set to true, the position of the
 *                                           the text will be shifted so that
 *                                           the text will be drawn in the same
 *                                           place it was before calling 
 *                                           setAnchor.
 * @returns {this} Useful for chaining
 */
BboxAlignedText.prototype.setAnchor = function(hAlign, vAlign, updatePosition) {
    var oldPos = this._calculateAlignedCoords(this._x, this._y);
    this._hAlign = utils.default(hAlign, BboxAlignedText.ALIGN.CENTER);
    this._vAlign = utils.default(vAlign, BboxAlignedText.BASELINE.CENTER);
    if (updatePosition) {
        var newPos = this._calculateAlignedCoords(this._x, this._y);
        this._x += oldPos.x - newPos.x;
        this._y += oldPos.y - newPos.y;
    }
    return this;
};

/**
 * Get the bounding box when the text is placed at the specified coordinates.
 * Note: this is the unrotated bounding box! TODO: Fix this.
 * @param {number} [x=current x] - A new x coordinate of text anchor. This
 *                                 will change the text's x position 
 *                                 permanently. 
 * @param {number} [y=current y] - A new y coordinate of text anchor. This
 *                                 will change the text's x position 
 *                                 permanently.
 * @return {object} Returns an object with properties: x, y, w, h
 */
BboxAlignedText.prototype.getBbox = function(x, y) {
    this.setPosition(x, y);
    var pos = this._calculateAlignedCoords(this._x, this._y);
    return {
        x: pos.x + this._boundsOffset.x,
        y: pos.y + this._boundsOffset.y,
        w: this.width,
        h: this.height
    };
};

/**
 * Get an array of points that follow along the text path. This will take into
 * consideration the current alignment settings.
 * Note: this is a thin wrapper around a p5 method and doesn't handle unrotated
 * text! TODO: Fix this.
 * @param {number} [x=current x] - A new x coordinate of text anchor. This
 *                                 will change the text's x position 
 *                                 permanently. 
 * @param {number} [y=current y] - A new y coordinate of text anchor. This
 *                                 will change the text's x position 
 *                                 permanently.
 * @param {object} [options] - An object that can have:
 *                               - sampleFactor: ratio of path-length to number
 *                                 of samples (default=0.25). Higher values 
 *                                 yield morepoints and are therefore more 
 *                                 precise. 
 *                               - simplifyThreshold: if set to a non-zero 
 *                                 value, collinear points will be removed. The
 *                                 value represents the threshold angle to use
 *                                 when determining whether two edges are 
 *                                 collinear.
 * @return {array} An array of points, each with x, y & alpha (the path angle)
 */
BboxAlignedText.prototype.getTextPoints = function(x, y, options) {
    this.setPosition(x, y);
    var points = this._font.textToPoints(this._text, this._x, this._y, 
        this._fontSize, options);
    for (var i = 0; i < points.length; i += 1) {
        var pos = this._calculateAlignedCoords(points[i].x, points[i].y);
        points[i].x = pos.x;
        points[i].y = pos.y;
    }
    return points;
};

/**
 * Draws the text particle with the specified style parameters. Note: this is
 * going to set the textFont, textSize & rotation before drawing. You should set
 * the color/stroke/fill that you want before drawing. This function will clean
 * up after itself and reset styling back to what it was before it was called.
 * @public
 * @param {number} [x=current x] - A new x coordinate of text anchor. This will
 *                                change the text's x position permanently. 
 * @param {number} [y=current y] - A new y coordinate of text anchor. This will
 *                                 change the text's x position permanently.
 * @param {boolean} [drawBounds=false] - Flag for drawing bounding box
 */
BboxAlignedText.prototype.draw = function(x, y, drawBounds) {
    drawBounds = utils.default(drawBounds, false);
    this.setPosition(x, y);
    var pos = {
        x: this._x, 
        y: this._y
    };

    this._p.push();

        if (this._rotation) {
            pos = this._calculateRotatedCoords(pos.x, pos.y, this._rotation);
            this._p.rotate(this._rotation);
        }

        pos = this._calculateAlignedCoords(pos.x, pos.y);

        this._p.textAlign(this._p.LEFT, this._p.BASELINE);
        this._p.textFont(this._font);
        this._p.textSize(this._fontSize);
        this._p.text(this._text, pos.x, pos.y);

        if (drawBounds) {
            this._p.stroke(200);
            var boundsX = pos.x + this._boundsOffset.x;
            var boundsY = pos.y + this._boundsOffset.y;
            this._p.noFill();
            this._p.rect(boundsX, boundsY, this.width, this.height);            
        }

    this._p.pop();
};

/**
 * Project the coordinates (x, y) into a rotated coordinate system
 * @private
 * @param {number} x - X coordinate (in unrotated space)
 * @param {number} y - Y coordinate (in unrotated space)
 * @param {number} angle - Radians of rotation to apply
 * @return {object} Object with x & y properties
 */
BboxAlignedText.prototype._calculateRotatedCoords = function (x, y, angle) {  
    var rx = Math.cos(angle) * x + Math.cos(Math.PI / 2 - angle) * y;
    var ry = -Math.sin(angle) * x + Math.sin(Math.PI / 2 - angle) * y;
    return {x: rx, y: ry};
};

/**
 * Calculates draw coordinates for the text, aligning based on the bounding box.
 * The text is eventually drawn with canvas alignment set to left & baseline, so
 * this function takes a desired pos & alignment and returns the appropriate
 * coordinates for the left & baseline.
 * @private
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @return {object} Object with x & y properties
 */
BboxAlignedText.prototype._calculateAlignedCoords = function(x, y) {
    var newX, newY;
    switch (this._hAlign) {
        case BboxAlignedText.ALIGN.BOX_LEFT:
            newX = x;
            break;
        case BboxAlignedText.ALIGN.BOX_CENTER:
            newX = x - this.halfWidth;
            break;
        case BboxAlignedText.ALIGN.BOX_RIGHT:
            newX = x - this.width;
            break;
        default:
            newX = x;
            console.log("Unrecognized horizonal align:", this._hAlign);
            break;
    }
    switch (this._vAlign) {
        case BboxAlignedText.BASELINE.BOX_TOP:
            newY = y - this._boundsOffset.y;
            break;
        case BboxAlignedText.BASELINE.BOX_CENTER:
            newY = y + this._distBaseToMid;
            break;
        case BboxAlignedText.BASELINE.BOX_BOTTOM:
            newY = y - this._distBaseToBottom;
            break;
        case BboxAlignedText.BASELINE.FONT_CENTER:
            // Height is approximated as ascent + descent
            newY = y - this._descent + (this._ascent + this._descent) / 2;
            break;
        case BboxAlignedText.BASELINE.ALPHABETIC:
            newY = y;
            break;
        default:
            newY = y;
            console.log("Unrecognized vertical align:", this._vAlign);
            break;
    }
    return {x: newX, y: newY};
};


/**
 * Calculates bounding box and various metrics for the current text and font
 * @private
 */
BboxAlignedText.prototype._calculateMetrics = function(shouldUpdateHeight) {  
    // p5 0.5.0 has a bug - text bounds are clipped by (0, 0)
    // Calculating bounds hack
    var bounds = this._font.textBounds(this._text, 1000, 1000, this._fontSize);
    // Bounds is a reference - if we mess with it directly, we can mess up 
    // future values! (It changes the bbox cache in p5.)
    bounds = { 
        x: bounds.x - 1000, 
        y: bounds.y - 1000, 
        w: bounds.w, 
        h: bounds.h 
    }; 

    if (shouldUpdateHeight) {
        this._ascent = this._font._textAscent(this._fontSize);
        this._descent = this._font._textDescent(this._fontSize);
    }

    // Use bounds to calculate font metrics
    this.width = bounds.w;
    this.height = bounds.h;
    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;
    this._boundsOffset = { x: bounds.x, y: bounds.y };
    this._distBaseToMid = Math.abs(bounds.y) - this.halfHeight;
    this._distBaseToBottom = this.height - Math.abs(bounds.y);
};
},{"./utils.js":3}],3:[function(require,module,exports){
exports.default = function(value, defaultValue) {
    return (value !== undefined) ? value : defaultValue;
};
},{}],4:[function(require,module,exports){
module.exports = HoverSlideshows;

var utilities = require("./utilities.js");

function HoverSlideshows(slideshowDelay, transitionDuration) {
    this._slideshowDelay = (slideshowDelay !== undefined) ? slideshowDelay :
        2000;
    this._transitionDuration = (transitionDuration !== undefined) ?
        transitionDuration : 1000;

    this._slideshows = [];
    this.reload();
}

HoverSlideshows.prototype.reload = function () {
    // Note: this is currently not really being used. When a page is loaded,
    // main.js is just re-instancing the HoverSlideshows
    var oldSlideshows = this._slideshows || [];
    this._slideshows = [];
    $(".hover-slideshow").each(function (_, element) {
        var $element = $(element);
        var index = this._findInSlideshows(element, oldSlideshows);
        if (index !== -1) {
            var slideshow = oldSlideshows.splice(index, 1)[0];
            this._slideshows.push(slideshow);
        } else {
            this._slideshows.push(new Slideshow($element, this._slideshowDelay,
                this._transitionDuration));
        }
    }.bind(this));
};

HoverSlideshows.prototype._findInSlideshows = function (element, slideshows) {
    for (var i = 0; i < slideshows.length; i += 1) {
        if (element === slideshows[i].getElement()) {
            return i;
        }
    }
    return -1;
};

function Slideshow($container, slideshowDelay, transitionDuration) {
    this._$container = $container;
    this._slideshowDelay = slideshowDelay;
    this._transitionDuration = transitionDuration;
    this._timeoutId = null;
    this._imageIndex = 0;
    this._$images = [];

    // Set up and cache references to images
    this._$container.find("img").each(function (index, element) {
        var $image = $(element);
        $image.css({
            position: "absolute",
            top: "0",
            left: "0",
            zIndex: (index === 0) ? 2 : 0 // First image should be on top
        });
        this._$images.push($image);
    }.bind(this));

    // Determine whether to bind interactivity
    this._numImages = this._$images.length;
    if (this._numImages <= 1) return;

    // Bind event listeners
    this._$container.on("mouseenter", this._onEnter.bind(this));
    this._$container.on("mouseleave", this._onLeave.bind(this));

}

Slideshow.prototype.getElement = function () {
    return this._$container.get(0);
};

Slideshow.prototype.get$Element = function () {
    return this._$container;
};

Slideshow.prototype._onEnter = function () {
    // First transition should happen pretty soon after hovering in order
    // to clue the user into what is happening
    this._timeoutId = setTimeout(this._advanceSlideshow.bind(this), 500);
};

Slideshow.prototype._onLeave = function () {
    clearInterval(this._timeoutId);
    this._timeoutId = null;
};

Slideshow.prototype._advanceSlideshow = function () {
    this._imageIndex += 1;
    var i;

    // Move the image from 2 steps ago down to the bottom z-index and make
    // it invisible
    if (this._numImages >= 3) {
        i = utilities.wrapIndex(this._imageIndex - 2, this._numImages);
        this._$images[i].css({
            zIndex: 0,
            opacity: 0
        });
        this._$images[i].velocity("stop");
    }

    // Move the image from 1 steps ago down to the middle z-index and make
    // it completely visible
    if (this._numImages >= 2) {
        i = utilities.wrapIndex(this._imageIndex - 1, this._numImages);
        this._$images[i].css({
            zIndex: 1,
            opacity: 1
        });
        this._$images[i].velocity("stop");
    }

    // Move the current image to the top z-index and fade it in
    this._imageIndex = utilities.wrapIndex(this._imageIndex, this._numImages);
    this._$images[this._imageIndex].css({
        zIndex: 2,
        opacity: 0
    });
    this._$images[this._imageIndex].velocity({
        opacity: 1
    }, this._transitionDuration, "easeInOutQuad");

    // Schedule next transition
    this._timeoutId = setTimeout(this._advanceSlideshow.bind(this),
        this._slideshowDelay);
};
},{"./utilities.js":19}],5:[function(require,module,exports){
module.exports = BaseLogoSketch;

var utils = require("../utilities.js");

function BaseLogoSketch($nav, $navLogo, fontPath) {
    this._$nav = $nav;
    this._$navLogo = $navLogo;
    this._fontPath = fontPath;

    this._text = this._$navLogo.text();
    this._isFirstFrame = true;
    this._isMouseOver = false;
    this._isOverNavLogo = false;

    this._updateTextOffset();
    this._updateSize();
    this._updateFontSize();

    // Create a (relative positioned) container for the sketch inside of the
    // nav, but make sure that it is BEHIND everything else. Eventually, we will
    // drop just the nav logo (not the nav links!) behind the canvas.
    this._$container = $("<div>")
        .css({
            position: "absolute",
            top: "0px",
            left: "0px"
        })
        .prependTo(this._$nav)
        .hide();

    this._createP5Instance();
}

/**
 * Create a new p5 instance and bind the appropriate class methods to the
 * instance. This also fills in the p parameter on the class methods (setup,
 * draw, etc.) so that those functions can be a little less verbose :) 
 */
BaseLogoSketch.prototype._createP5Instance = function () {
    new p5(function(p) {
        this._p = p;
        p.preload = this._preload.bind(this, p);
        p.setup = this._setup.bind(this, p);
        p.draw = this._draw.bind(this, p);
    }.bind(this), this._$container.get(0));
};

/**
 * Find the distance from the top left of the nav to the brand logo's baseline.
 */
BaseLogoSketch.prototype._updateTextOffset = function () {
    var baselineDiv = $("<div>")
        .css({
            display: "inline-block",
            verticalAlign: "baseline"
        }).prependTo(this._$navLogo);
    var navOffset = this._$nav.offset();
    var logoBaselineOffset = baselineDiv.offset();
    this._textOffset = {
        top: logoBaselineOffset.top - navOffset.top,
        left: logoBaselineOffset.left - navOffset.left
    };
    baselineDiv.remove();
};

/**
 * Find the bounding box of the brand logo in the nav. This bbox can then be 
 * used to control when the cursor should be a pointer.
 */
BaseLogoSketch.prototype._calculateNavLogoBounds = function () {
    var navOffset = this._$nav.offset();
    var logoOffset = this._$navLogo.offset();
    this._logoBbox = {
        y: logoOffset.top - navOffset.top,
        x: logoOffset.left - navOffset.left,
        w: this._$navLogo.outerWidth(), // Exclude margin from the bbox
        h: this._$navLogo.outerHeight() // Links aren't clickable on margin
    };
};

/**
 * Update the dimensions to match the nav - excluding any margin, padding & 
 * border.
 */
BaseLogoSketch.prototype._updateSize = function () {
    this._width = this._$nav.innerWidth();
    this._height = this._$nav.innerHeight();
};

/**
 * Grab the font size from the brand logo link. This makes the font size of the
 * sketch responsive.
 */
BaseLogoSketch.prototype._updateFontSize = function () {
    this._fontSize = this._$navLogo.css("fontSize").replace("px", "");
};

/**
 * When the browser is resized, recalculate all the necessary stats so that the
 * sketch can be responsive. The logo in the sketch should ALWAYS exactly match
 * the brang logo link the HTML.
 */
BaseLogoSketch.prototype._onResize = function (p) {
    this._updateSize();
    this._updateFontSize();
    this._updateTextOffset();
    this._calculateNavLogoBounds();
    p.resizeCanvas(this._width, this._height);
};

/**
 * Update the _isMouseOver property. 
 */
BaseLogoSketch.prototype._setMouseOver = function (isMouseOver) {
    this._isMouseOver = isMouseOver;
};

/**
 * If the cursor is set to a pointer, forward any click events to the nav logo.
 * This reduces the need for the canvas to do any AJAX-y stuff.
 */
BaseLogoSketch.prototype._onClick = function (e) {
    if (this._isOverNavLogo) this._$navLogo.trigger(e);
};

/**
 * Base preload method that just loads the necessary font
 */
BaseLogoSketch.prototype._preload = function (p) {
    this._font = p.loadFont(this._fontPath);
};

/**
 * Base setup method that does some heavy lifting. It hides the nav brand logo
 * and reveals the canvas. It also sets up a lot of the internal variables and
 * canvas events.
 */
BaseLogoSketch.prototype._setup = function (p) {
    var renderer = p.createCanvas(this._width, this._height);
    this._$canvas = $(renderer.canvas);

    // Show the canvas and hide the logo. Using show/hide on the logo will cause
    // jQuery to muck with the positioning, which is used to calculate where to
    // draw the canvas text. Instead, just push the logo behind the canvas. This
    // allows makes it so the canvas is still behind the nav links.
    this._$container.show();
    this._$navLogo.css("zIndex", -1);

    // There isn't a good way to check whether the sketch has the mouse over
    // it. p.mouseX & p.mouseY are initialized to (0, 0), and p.focused isn't 
    // always reliable.
    this._$canvas.on("mouseover", this._setMouseOver.bind(this, true));
    this._$canvas.on("mouseout", this._setMouseOver.bind(this, false));

    // Forward mouse clicks to the nav logo
    this._$canvas.on("click", this._onClick.bind(this));

    // When the window is resized, text & canvas sizing and placement need to be
    // recalculated. The site is responsive, so the interactive canvas should be
    // too! 
    $(window).on("resize", this._onResize.bind(this, p));
};

/**
 * Base draw method that controls whether or not the cursor is a pointer. It
 * should only be a pointer when the mouse is over the nav brand logo.
 */
BaseLogoSketch.prototype._draw = function (p) {
    if (this._isMouseOver) {
        var isOverLogo = utils.isInRect(p.mouseX, p.mouseY, this._logoBbox);
        if (!this._isOverNavLogo && isOverLogo) {
            this._isOverNavLogo = true;
            this._$canvas.css("cursor", "pointer");
        } else if (this._isOverNavLogo && !isOverLogo) {
            this._isOverNavLogo = false;
            this._$canvas.css("cursor", "initial");
        }
    }
};
},{"../utilities.js":19}],6:[function(require,module,exports){
module.exports = Sketch;

var BboxText = require("p5-bbox-aligned-text");
var BaseLogoSketch = require("./base-logo-sketch.js");
var SinGenerator = require("./generators/sin-generator.js");

var utils = require("../utilities.js");

Sketch.prototype = Object.create(BaseLogoSketch.prototype);

function Sketch($nav, $navLogo) {
    BaseLogoSketch.call(this, $nav, $navLogo, "../fonts/big_john-webfont.ttf");
}

Sketch.prototype._onResize = function (p) {
    BaseLogoSketch.prototype._onResize.call(this, p);
    this._spacing = utils.map(this._fontSize, 20, 40, 2, 5, {clamp: true,
        round: true});
    // Update the bboxText, place over the nav text logo and then shift its
    // anchor back to (center, center) while preserving the text position
    this._bboxText.setText(this._text)
        .setTextSize(this._fontSize)
        .setAnchor(BboxText.ALIGN.BOX_LEFT, BboxText.BASELINE.ALPHABETIC)
        .setPosition(this._textOffset.left, this._textOffset.top)
        .setAnchor(BboxText.ALIGN.BOX_CENTER, BboxText.BASELINE.BOX_CENTER,
            true);
    this._drawStationaryLogo(p);
    this._points = this._bboxText.getTextPoints();
    this._isFirstFrame = true;
};

Sketch.prototype._drawStationaryLogo = function (p) {
    p.background(255);
    p.stroke(255);
    p.fill("#0A000A");
    p.strokeWeight(2);
    this._bboxText.draw();
};

Sketch.prototype._setup = function (p) {
    BaseLogoSketch.prototype._setup.call(this, p);

    // Create a BboxAlignedText instance that will be used for drawing and
    // rotating text
    this._bboxText = new BboxText(this._font, this._text, this._fontSize, 0, 0,
        p);

    // Handle the initial setup by triggering a resize
    this._onResize(p);

    // Draw the stationary logo
    this._drawStationaryLogo(p);

    // Start the sin generator at its max value
    this._thresholdGenerator = new SinGenerator(p, 0, 1, 0.02, p.PI/2);
};

Sketch.prototype._draw = function (p) {
    BaseLogoSketch.prototype._draw.call(this, p);
    if (!this._isMouseOver || !this._isOverNavLogo) return;

    // When the text is about to become active for the first time, clear
    // the stationary logo that was previously drawn.
    if (this._isFirstFrame) {
        p.background(255);
        this._isFirstFrame = false;
    }

    if (this._fontSize > 30) {
        this._thresholdGenerator.setBounds(0.2 * this._bboxText.height,
            0.47 * this._bboxText.height);
    } else {
        this._thresholdGenerator.setBounds(0.2 * this._bboxText.height,
            0.6 * this._bboxText.height);
    }
    var distanceThreshold = this._thresholdGenerator.generate();

    p.background(255, 100);
    p.strokeWeight(1);
    for (var i = 0; i < this._points.length; i += 1) {
        var point1 = this._points[i];
        for (var j = i + 1; j < this._points.length; j += 1) {
            var point2 = this._points[j];
            var dist = p.dist(point1.x, point1.y, point2.x, point2.y);
            if (dist < distanceThreshold) {

                p.noStroke();
                p.fill("rgba(165, 0, 173, 0.25)");
                p.ellipse((point1.x + point2.x) / 2, (point1.y + point2.y) / 2,
                    dist, dist);

                p.stroke("rgba(165, 0, 173, 0.25)");
                p.noFill();
                p.line(point1.x, point1.y, point2.x, point2.y);
            }
        }
    }
};
},{"../utilities.js":19,"./base-logo-sketch.js":5,"./generators/sin-generator.js":8,"p5-bbox-aligned-text":2}],7:[function(require,module,exports){
module.exports = {
    NoiseGenerator1D: NoiseGenerator1D,
    NoiseGenerator2D: NoiseGenerator2D
};

var utils = require("../../utilities.js");

// -- 1D Noise Generator -------------------------------------------------------

/**
 * A utility class for generating noise values
 * @constructor
 * @param {object} p               Reference to a p5 sketch
 * @param {number} [min=0]         Minimum value for the noise
 * @param {number} [max=1]         Maximum value for the noise
 * @param {number} [increment=0.1] Scale of the noise, used when updating
 * @param {number} [offset=random] A value used to ensure multiple noise
 *                                 generators are returning "independent" values
 */
function NoiseGenerator1D(p, min, max, increment, offset) {
    this._p = p;
    this._min = utils.default(min, 0);
    this._max = utils.default(max, 1);
    this._increment = utils.default(increment, 0.1);
    this._position = utils.default(offset, p.random(-1000000, 1000000));
}

/**
 * Update the min and max noise values
 * @param  {number} min Minimum noise value
 * @param  {number} max Maximum noise value
 */
NoiseGenerator1D.prototype.setBounds = function (min, max) {
    this._min = utils.default(min, this._min);
    this._max = utils.default(max, this._max);
};

/**
 * Update the noise increment (e.g. scale)
 * @param  {number} increment New increment (scale) value
 */
NoiseGenerator1D.prototype.setIncrement = function (increment) {
    this._increment = utils.default(increment, this._increment);
};

/** 
 * Generate the next noise value
 * @return {number} A noisy value between object's min and max
 */
NoiseGenerator1D.prototype.generate = function () {
    this._update();
    var n = this._p.noise(this._position);
    n = this._p.map(n, 0, 1, this._min, this._max);
    return n;
};

/**
 * Internal update method for generating next noise value
 * @private
 */
NoiseGenerator1D.prototype._update = function () {
    this._position += this._increment;
};


// -- 2D Noise Generator -------------------------------------------------------

function NoiseGenerator2D(p, xMin, xMax, yMin, yMax, xIncrement, yIncrement, 
                          xOffset, yOffset) {
    this._xNoise = new NoiseGenerator1D(p, xMin, xMax, xIncrement, xOffset);
    this._yNoise = new NoiseGenerator1D(p, yMin, yMax, yIncrement, yOffset);
    this._p = p;
}

/**
 * Update the min and max noise values
 * @param  {object} options Object with bounds to be updated e.g. 
 *                          { xMin: 0, xMax: 1, yMin: -1, yMax: 1 }
 */
NoiseGenerator2D.prototype.setBounds = function (options) {
    if (!options) return;  
    this._xNoise.setBounds(options.xMin, options.xMax);
    this._yNoise.setBounds(options.yMin, options.yMax);
};

/**
 * Update the increment (e.g. scale) for the noise generator
 * @param  {object} options Object with bounds to be updated e.g. 
 *                          { xIncrement: 0.05, yIncrement: 0.1 }
 */
NoiseGenerator2D.prototype.setBounds = function (options) {
    if (!options) return;
    this._xNoise.setBounds(options.xIncrement);
    this._yNoise.setBounds(options.yIncrement);
};

/**
 * Generate the next pair of noise values
 * @return {object} Object with x and y properties that contain the next noise
 *                  values along each dimension
 */
NoiseGenerator2D.prototype.generate = function () {
    return {
        x: this._xNoise.generate(),
        y: this._yNoise.generate()
    };
};
},{"../../utilities.js":19}],8:[function(require,module,exports){
module.exports = SinGenerator;

var utils = require("../../utilities.js");

/**
 * A utility class for generating values along a sinwave
 * @constructor
 * @param {object} p               Reference to a p5 sketch
 * @param {number} [min=0]         Minimum value for the noise
 * @param {number} [max=1]         Maximum value for the noise
 * @param {number} [increment=0.1] Increment used when updating
 * @param {number} [offset=random] Where to start along the sinewave
 */
function SinGenerator(p, min, max, angleIncrement, startingAngle) {
    this._p = p;
    this._min = utils.default(min, 0);
    this._max = utils.default(max, 0);
    this._increment = utils.default(angleIncrement, 0.1);
    this._angle = utils.default(startingAngle, p.random(-1000000, 1000000));
}

/**
 * Update the min and max values
 * @param  {number} min Minimum value
 * @param  {number} max Maximum value
 */
SinGenerator.prototype.setBounds = function (min, max) {
    this._min = utils.default(min, this._min);
    this._max = utils.default(max, this._max);
};

/**
 * Update the angle increment (e.g. how fast we move through the sinwave)
 * @param  {number} increment New increment value
 */
SinGenerator.prototype.setIncrement = function (increment) {
    this._increment = utils.default(increment, this._increment);
};

/** 
 * Generate the next value
 * @return {number} A value between generators's min and max
 */
SinGenerator.prototype.generate = function () {
    this._update();
    var n = this._p.sin(this._angle);
    n = this._p.map(n, -1, 1, this._min, this._max);
    return n;
};

/**
 * Internal update method for generating next value
 * @private
 */
SinGenerator.prototype._update = function () {
    this._angle += this._increment;
};
},{"../../utilities.js":19}],9:[function(require,module,exports){
module.exports = Sketch;

var BboxText = require("p5-bbox-aligned-text");
var BaseLogoSketch = require("./base-logo-sketch.js");

var utils = require("../utilities.js");

Sketch.prototype = Object.create(BaseLogoSketch.prototype);

function Sketch($nav, $navLogo) {
    BaseLogoSketch.call(this, $nav, $navLogo, "../fonts/big_john-webfont.ttf");
}

Sketch.prototype._onResize = function (p) {
    BaseLogoSketch.prototype._onResize.call(this, p);
    this._spacing = utils.map(this._fontSize, 20, 40, 2, 5, {clamp: true, 
        round: true});
    // Update the bboxText, place over the nav text logo and then shift its 
    // anchor back to (center, center) while preserving the text position
    this._bboxText.setText(this._text)
        .setTextSize(this._fontSize)
        .setAnchor(BboxText.ALIGN.BOX_LEFT, BboxText.BASELINE.ALPHABETIC)
        .setPosition(this._textOffset.left, this._textOffset.top)
        .setAnchor(BboxText.ALIGN.BOX_CENTER, BboxText.BASELINE.BOX_CENTER, 
            true);
    this._drawStationaryLogo(p);
    this._calculateCircles(p);
    this._isFirstFrame = true;
};

Sketch.prototype._drawStationaryLogo = function (p) {
    p.background(255);
    p.stroke(255);
    p.fill("#0A000A");
    p.strokeWeight(2);
    this._bboxText.draw();
};

Sketch.prototype._setup = function (p) {
    BaseLogoSketch.prototype._setup.call(this, p);

    // Create a BboxAlignedText instance that will be used for drawing and 
    // rotating text
    this._bboxText = new BboxText(this._font, this._text, this._fontSize, 0, 0, 
        p);

    // Handle the initial setup by triggering a resize
    this._onResize(p);

    // Draw the stationary logo
    this._drawStationaryLogo(p);

    this._calculateCircles(p);
};

Sketch.prototype._calculateCircles = function (p) {
    // TODO: Don't need ALL the pixels. This could have an offscreen renderer
    // that is just big enough to fit the text.
    // Loop over the pixels in the text's bounding box to sample the word
    var bbox = this._bboxText.getBbox();
    var startX = Math.floor(Math.max(bbox.x - 5, 0));
    var endX = Math.ceil(Math.min(bbox.x + bbox.w + 5, p.width));
    var startY = Math.floor(Math.max(bbox.y - 5, 0));
    var endY = Math.ceil(Math.min(bbox.y + bbox.h + 5, p.height));
    p.loadPixels();
    p.pixelDensity(1);
    this._circles = [];
    for (var y = startY; y < endY; y += this._spacing) {
        for (var x = startX; x < endX; x += this._spacing) {  
            var i = 4 * ((y * p.width) + x);
            var r = p.pixels[i];
            var g = p.pixels[i + 1];
            var b = p.pixels[i + 2];
            var a = p.pixels[i + 3];
            var c = p.color(r, g, b, a);
            if (p.saturation(c) > 0) {
                this._circles.push({
                    x: x + p.random(-2/3 * this._spacing, 2/3 * this._spacing),
                    y: y + p.random(-2/3 * this._spacing, 2/3 * this._spacing),
                    color: p.color("#06FFFF")
                });
                this._circles.push({
                    x: x + p.random(-2/3 * this._spacing, 2/3 * this._spacing),
                    y: y + p.random(-2/3 * this._spacing, 2/3 * this._spacing),
                    color: p.color("#FE00FE")
                });
                this._circles.push({
                    x: x + p.random(-2/3 * this._spacing, 2/3 * this._spacing),
                    y: y + p.random(-2/3 * this._spacing, 2/3 * this._spacing),
                    color: p.color("#FFFF04")
                });
            }
        }
    }
};

Sketch.prototype._draw = function (p) {
    BaseLogoSketch.prototype._draw.call(this, p);
    if (!this._isMouseOver || !this._isOverNavLogo) return;

    // When the text is about to become active for the first time, clear
    // the stationary logo that was previously drawn. 
    if (this._isFirstFrame) {
        p.background(255);
        this._isFirstFrame = false;
    }

    // Clear
    p.blendMode(p.BLEND);
    p.background(255);

    // Draw "halftone" logo
    p.noStroke();   
    p.blendMode(p.MULTIPLY);

    var maxDist = this._bboxText.halfWidth;
    var maxRadius = 2 * this._spacing;

    for (var i = 0; i < this._circles.length; i += 1) {
        var circle = this._circles[i];
        var c = circle.color;
        var dist = p.dist(circle.x, circle.y, p.mouseX, p.mouseY);
        var radius = utils.map(dist, 0, maxDist, 1, maxRadius, {clamp: true});
        p.fill(c);
        p.ellipse(circle.x, circle.y, radius, radius);
    }
};
},{"../utilities.js":19,"./base-logo-sketch.js":5,"p5-bbox-aligned-text":2}],10:[function(require,module,exports){
module.exports = Sketch;

var Noise = require("./generators/noise-generators.js");
var BboxText = require("p5-bbox-aligned-text");
var BaseLogoSketch = require("./base-logo-sketch.js");

Sketch.prototype = Object.create(BaseLogoSketch.prototype);

function Sketch($nav, $navLogo) {
    BaseLogoSketch.call(this, $nav, $navLogo, "../fonts/big_john-webfont.ttf");
}

Sketch.prototype._onResize = function (p) {
    BaseLogoSketch.prototype._onResize.call(this, p);
    // Update the bboxText, place over the nav text logo and then shift its 
    // anchor back to (center, center) while preserving the text position
    this._bboxText.setText(this._text)
        .setTextSize(this._fontSize)
        .setRotation(0)
        .setAnchor(BboxText.ALIGN.BOX_LEFT, BboxText.BASELINE.ALPHABETIC)
        .setPosition(this._textOffset.left, this._textOffset.top)
        .setAnchor(BboxText.ALIGN.BOX_CENTER, BboxText.BASELINE.BOX_CENTER, 
            true);
    this._textPos = this._bboxText.getPosition();
    this._drawStationaryLogo(p);
    this._isFirstFrame = true;
};

Sketch.prototype._drawStationaryLogo = function (p) {
    p.background(255);
    p.stroke(255);
    p.fill("#0A000A");
    p.strokeWeight(2);
    this._bboxText.draw();
};

Sketch.prototype._setup = function (p) {
    BaseLogoSketch.prototype._setup.call(this, p);

    // Create a BboxAlignedText instance that will be used for drawing and 
    // rotating text
    this._bboxText = new BboxText(this._font, this._text, this._fontSize, 0, 0, 
        p);

    // Handle the initial setup by triggering a resize
    this._onResize(p);

    // Set up noise generators
    this._rotationNoise = new Noise.NoiseGenerator1D(p, -p.PI/4, p.PI/4, 0.02); 
    this._xyNoise = new Noise.NoiseGenerator2D(p, -100, 100, -50, 50, 0.01, 
        0.01);
};

Sketch.prototype._draw = function (p) {
    BaseLogoSketch.prototype._draw.call(this, p);
    if (!this._isMouseOver || !this._isOverNavLogo) return;

    // When the text is about to become active for the first time, clear
    // the stationary logo that was previously drawn. 
    if (this._isFirstFrame) {
        p.background(255);
        this._isFirstFrame = false;
    }

    // Calculate position and rotation to create a jittery logo
    var rotation = this._rotationNoise.generate();
    var xyOffset = this._xyNoise.generate();
    this._bboxText.setRotation(rotation)
        .setPosition(this._textPos.x + xyOffset.x, this._textPos.y + xyOffset.y)
        .draw();
};
},{"./base-logo-sketch.js":5,"./generators/noise-generators.js":7,"p5-bbox-aligned-text":2}],11:[function(require,module,exports){
module.exports = MainNav;

function MainNav(loader) {
    this._loader = loader;
    this._$logo = $("nav.navbar .navbar-brand");
    this._$nav = $("#main-nav");
    this._$navLinks = this._$nav.find("a");
    this._$activeNav = this._$navLinks.find(".active");
    this._$navLinks.on("click", this._onNavClick.bind(this));
    this._$logo.on("click", this._onLogoClick.bind(this));
}

MainNav.prototype.setActiveFromUrl = function () {
    this._deactivate();
    var url = location.pathname;
    if (url === "/index.html" || url === "/") {
        this._activateLink(this._$navLinks.filter("#about-link"));
    } else if (url === "/work.html") {
        this._activateLink(this._$navLinks.filter("#work-link"));
    }
};

MainNav.prototype._deactivate = function () {
    if (this._$activeNav.length) {
        this._$activeNav.removeClass("active");
        this._$activeNav = $();
    }
};

MainNav.prototype._activateLink = function ($link) {
    $link.addClass("active");
    this._$activeNav = $link;
};

MainNav.prototype._onLogoClick = function (e) {
    e.preventDefault();
    var $target = $(e.currentTarget);
    var url = $target.attr("href");
    this._loader.loadPage(url, {}, true);
};

MainNav.prototype._onNavClick = function (e) {
    e.preventDefault();
    this._$nav.collapse("hide"); // Close the nav - only matters on mobile
    var $target = $(e.currentTarget);
    if ($target.is(this._$activeNav)) return;
    this._deactivate();
    this._activateLink($target);
    var url = $target.attr("href");
    this._loader.loadPage(url, {}, true);
};
},{}],12:[function(require,module,exports){
var Loader = require("./page-loader.js");
var MainNav = require("./main-nav.js");
var HoverSlideshows = require("./hover-slideshow.js");
var PortfolioFilter = require("./portfolio-filter.js");
var slideshows = require("./thumbnail-slideshow/slideshow.js");

// Picking a random sketch that the user hasn't seen before
var Sketch = require("./pick-random-sketch.js")();

// AJAX page loader, with callback for reloading widgets
var loader = new Loader(onPageLoad);

// Main nav widget
var mainNav = new MainNav(loader);

// Interactive logo in navbar
var nav = $("nav.navbar");
var navLogo = nav.find(".navbar-brand");
new Sketch(nav, navLogo);

// Widget globals
var portfolioFilter;

// Load all widgets
onPageLoad();

// Handle back/forward buttons
window.addEventListener("popstate", onPopState);

function onPopState(e) {
    // Loader stores custom data in the state - including the url and the query
    var url = (e.state && e.state.url) || "/index.html";
    var queryObject = (e.state && e.state.query) || {};

    if ((url === loader.getLoadedPath()) && (url === "/work.html")) {
        // The current & previous loaded states were work.html, so just refilter
        var category = queryObject.category || "all";
        portfolioFilter.selectCategory(category);
    } else {
        // Load the new page
        loader.loadPage(url, {}, false);
    }
}

function onPageLoad() {
    // Reload all plugins/widgets
    new HoverSlideshows();
    portfolioFilter = new PortfolioFilter(loader);
    slideshows.init();
    objectFitImages();
    smartquotes();

    // Slightly redundant, but update the main nav using the current URL. This
    // is important if a page is loaded by typing a full URL (e.g. going
    // directly to /work.html) or when moving from work.html to a project.
    mainNav.setActiveFromUrl();
}

// We've hit the landing page, load the about page
// if (location.pathname.match(/^(\/|\/index.html|index.html)$/)) {
//     loader.loadPage("/about.html", {}, false);
// }
},{"./hover-slideshow.js":4,"./main-nav.js":11,"./page-loader.js":13,"./pick-random-sketch.js":14,"./portfolio-filter.js":15,"./thumbnail-slideshow/slideshow.js":17}],13:[function(require,module,exports){
module.exports = Loader;

var utilities = require("./utilities.js");

function Loader(onReload, fadeDuration) {
    this._$content = $("#content");
    this._onReload = onReload;
    this._fadeDuration = (fadeDuration !== undefined) ? fadeDuration : 250;
    this._path = location.pathname;
}

Loader.prototype.getLoadedPath = function () {
    return this._path;
};

Loader.prototype.loadPage = function (url, queryObject, shouldPushHistory) {
    // Fade then empty the current contents
    this._$content.velocity({ opacity: 0 }, this._fadeDuration, "swing", function () {
        this._$content.empty();
        this._$content.load(url + " #content", onContentFetched.bind(this));
    }.bind(this));

    // Fade the new content in after it has been fetched
    function onContentFetched(responseText, textStatus) {
        if (textStatus === "error") {
            console.log("There was a problem loading the page.");
            return;
        }

        var queryString = utilities.createQueryString(queryObject);
        if (shouldPushHistory) {
            history.pushState({
                url: url,
                query: queryObject
            }, null, url + queryString);
        }

        // Update Google analytics
        ga("set", "page", url + queryString);
        ga("send", "pageview");

        this._path = location.pathname;
        this._$content.velocity({ opacity: 1 }, this._fadeDuration,
            "swing");
        this._onReload();
    }
};
},{"./utilities.js":19}],14:[function(require,module,exports){
var cookies = require("js-cookie");
var utils = require("./utilities.js");

var sketchConstructors = {
    "halftone-flashlight": 
        require("./interactive-logos/halftone-flashlight-word.js"),
    "noisy-word":
        require("./interactive-logos/noisy-word-sketch.js"),
    "connect-points":
        require("./interactive-logos/connect-points-sketch.js")
};
var numSketches = Object.keys(sketchConstructors).length;
var cookieKey = "seen-sketch-names";

/**
 * Pick a random sketch that user hasn't seen yet. If the user has seen all the
 * sketches, just pick a random one. This uses cookies to track what the user 
 * has seen already.
 * @return {Function} Constructor for a Sketch class
 */
module.exports = function pickRandomSketch() {
    var seenSketchNames = cookies.getJSON(cookieKey) || [];

    // Find the names of the unseen sketches
    var unseenSketchNames = findUnseenSketches(seenSketchNames);

    // All sketches have been seen
    if (unseenSketchNames.length === 0) {
        // If we've got more then one sketch, then make sure to choose a random
        // sketch excluding the most recently seen sketch
        if (numSketches > 1) {
            seenSketchNames = [seenSketchNames.pop()];
            unseenSketchNames = findUnseenSketches(seenSketchNames);
        } else {
            // If we've only got one sketch, then we can't do much...
            seenSketchNames = [];
            unseenSketchNames = Object.keys(sketchConstructors);            
        }
    }

    var randSketchName = utils.randArrayElement(unseenSketchNames);
    seenSketchNames.push(randSketchName);

    // Store the generated sketch in a cookie. This creates a moving 7 day
    // window - anytime the site is visited, the cookie is refreshed.
    cookies.set(cookieKey, seenSketchNames, { expires: 7 });

    return sketchConstructors[randSketchName];
};

function findUnseenSketches(seenSketchNames) {
    var unseenSketchNames = [];
    for (var sketchName in sketchConstructors) {
        if (seenSketchNames.indexOf(sketchName) === -1) {
            unseenSketchNames.push(sketchName);
        }
    }
    return unseenSketchNames;
}
},{"./interactive-logos/connect-points-sketch.js":6,"./interactive-logos/halftone-flashlight-word.js":9,"./interactive-logos/noisy-word-sketch.js":10,"./utilities.js":19,"js-cookie":1}],15:[function(require,module,exports){
module.exports = PortfolioFilter;

var utilities = require("./utilities.js");

var defaultBreakpoints = [
    { width: 1200, cols: 3, spacing: 15 },
    { width: 992, cols: 3, spacing: 15 },
    { width: 700, cols: 3, spacing: 15 },
    { width: 600, cols: 2, spacing: 10 },
    { width: 480, cols: 2, spacing: 10 },
    { width: 320, cols: 1, spacing: 10 }
];

function PortfolioFilter(loader, breakpoints, aspectRatio, transitionDuration) {
    this._loader = loader;
    this._gridSpacing = 0;
    this._aspectRatio = (aspectRatio !== undefined) ? aspectRatio : (16/9);
    this._transitionDuration = (transitionDuration !== undefined) ? 
        transitionDuration : 800;
    this._breakpoints = (breakpoints !== undefined) ? 
        breakpoints.slice() : defaultBreakpoints.slice();
    this._$grid = $("#portfolio-grid");
    this._$nav = $("#portfolio-nav");
    this._$projects = [];
    this._$categories = {};
    this._rows = 0;
    this._cols = 0;
    this._imageHeight = 0;
    this._imageWidth = 0;

    // Sort the breakpoints in descending order
    this._breakpoints.sort(function(a, b) {
        if (a.width < b.width) return -1;
        else if (a.width > b.width) return 1;
        else return 0;
    });

    this._cacheProjects();
    this._createGrid();

    this._$grid.find(".project a").on("click", this._onProjectClick.bind(this));

    var qs = utilities.getQueryParameters();
    var initialCategory = qs.category || "all";
    var category = initialCategory.toLowerCase();
    this._$activeNavItem = this._$nav.find("a[data-category=" + category + "]");
    this._$activeNavItem.addClass("active");
    this._filterProjects(category);
    $("#portfolio-nav a").on("click", this._onNavClick.bind(this));

    $(window).on("resize", this._createGrid.bind(this));
}

PortfolioFilter.prototype.selectCategory = function (category) {
    category = (category && category.toLowerCase()) || "all";
    var $selectedNav = this._$nav.find("a[data-category=" + category + "]");
    if ($selectedNav.length && !$selectedNav.is(this._$activeNavItem)) {
        this._$activeNavItem.removeClass("active");
        this._$activeNavItem = $selectedNav;
        this._$activeNavItem.addClass("active");
        this._filterProjects(category);
    }
};

PortfolioFilter.prototype._filterProjects = function (category) {
    var $selectedElements = this._getProjectsInCategory(category);

    // Animate the grid to the correct height to contain the rows
    this._animateGridHeight($selectedElements.length);
    
    // Loop through all projects
    this._$projects.forEach(function ($element) {
        // Stop all animations
        $element.velocity("stop");
        // If an element is not selected: drop z-index & animate opacity -> hide
        var selectedIndex = $selectedElements.indexOf($element); 
        if (selectedIndex === -1) {
            $element.css("zIndex", -1);
            $element.velocity({
                opacity: 0
            }, this._transitionDuration, "easeInOutCubic", function () {
                $element.hide();
            });
        } else {
            // If an element is selected: show & bump z-index & animate to position 
            $element.show();
            $element.css("zIndex", 0);
            var newPos = this._indexToXY(selectedIndex);
            $element.velocity({ 
                opacity: 1,
                top: newPos.y + "px",
                left: newPos.x + "px"
            }, this._transitionDuration, "easeInOutCubic");
        }
    }.bind(this));
};

PortfolioFilter.prototype._animateGridHeight = function (numElements) {
    this._$grid.velocity("stop");
    var curRows = Math.ceil(numElements / this._cols);
    this._$grid.velocity({
        height: this._imageHeight * curRows + 
            this._gridSpacing * (curRows - 1) + "px"
    }, this._transitionDuration);
};

PortfolioFilter.prototype._getProjectsInCategory = function (category) {
    if (category === "all") {
        return this._$projects;
    } else {
        return (this._$categories[category] || []);
    }        
};

PortfolioFilter.prototype._cacheProjects = function () {
    this._$projects = [];
    this._$categories = {};
    this._$grid.find(".project").each(function (index, element) {
        var $element = $(element);
        this._$projects.push($element);
        var categoryNames = $element.data("categories").split(",");
        for (var i = 0; i < categoryNames.length; i += 1) {
            var category = $.trim(categoryNames[i]).toLowerCase();
            if (!this._$categories[category]) {
                this._$categories[category] = [$element];
            } else {
                this._$categories[category].push($element);
            }
        }
    }.bind(this));
};

// PortfolioFilter.prototype._calculateGrid = function () {
//     var gridWidth = this._$grid.innerWidth();
//     this._cols = Math.floor((gridWidth + this._gridSpacing) / 
//         (this._minImageWidth + this._gridSpacing));
//     this._rows = Math.ceil(this._$projects.length / this._cols);
//     this._imageWidth = (gridWidth - ((this._cols - 1) * this._gridSpacing)) / 
//         this._cols;
//     this._imageHeight = this._imageWidth * (1 / this._aspectRatio);
// };

PortfolioFilter.prototype._calculateGrid = function () {
    var gridWidth = this._$grid.innerWidth();
    for (var i = 0; i < this._breakpoints.length; i += 1) {
        if (gridWidth <= this._breakpoints[i].width) {
            this._cols = this._breakpoints[i].cols;
            this._gridSpacing = this._breakpoints[i].spacing;
            break;
        }
    }
    this._rows = Math.ceil(this._$projects.length / this._cols);
    this._imageWidth = (gridWidth - ((this._cols - 1) * this._gridSpacing)) / 
        this._cols;
    this._imageHeight = this._imageWidth * (1 / this._aspectRatio);
};

PortfolioFilter.prototype._createGrid = function () {
    this._calculateGrid();

    this._$grid.css("position", "relative");
    this._$grid.css({
        height: this._imageHeight * this._rows + 
            this._gridSpacing * (this._rows - 1) + "px"
    });    

    this._$projects.forEach(function ($element, index) {
        var pos = this._indexToXY(index);
        $element.css({
            position: "absolute",
            top: pos.y + "px",
            left: pos.x + "px",
            width: this._imageWidth + "px",
            height: this._imageHeight + "px"
        });
    }.bind(this));    
};

PortfolioFilter.prototype._onNavClick = function (e) {
    e.preventDefault();
    var $target = $(e.target);
    if ($target.is(this._$activeNavItem)) return;
    if (this._$activeNavItem.length) this._$activeNavItem.removeClass("active");
    $target.addClass("active");
    this._$activeNavItem = $target;
    var category = $target.data("category").toLowerCase();

    history.pushState({
        url: "/work.html",
        query: { category: category }
    }, null, "/work.html?category=" + category);

    this._filterProjects(category);
};

PortfolioFilter.prototype._onProjectClick = function (e) {
    e.preventDefault();
    var $target = $(e.currentTarget);
    var projectName = $target.data("name");
    var url = "/projects/" + projectName + ".html";
    this._loader.loadPage(url, {}, true);
};


PortfolioFilter.prototype._indexToXY = function (index) {
    var r = Math.floor(index / this._cols);
    var c = index % this._cols; 
    return {
        x: c * this._imageWidth + c * this._gridSpacing,
        y: r * this._imageHeight + r * this._gridSpacing
    };
};
},{"./utilities.js":19}],16:[function(require,module,exports){
module.exports = SlideshowModal;

var KEY_CODES = {
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    ESCAPE: 27
};

function SlideshowModal($container, slideshow) {
    this._slideshow = slideshow;

    this._$modal = $container.find(".slideshow-modal");
    this._$overlay = this._$modal.find(".modal-overlay");
    this._$content = this._$modal.find(".modal-contents");
    this._$caption = this._$modal.find(".modal-caption");
    this._$imageContainer = this._$modal.find(".modal-image");
    this._$imageLeft = this._$modal.find(".image-advance-left");
    this._$imageRight = this._$modal.find(".image-advance-right");

    this._index = 0; // Index of selected image
    this._isOpen = false;
    
    this._$imageLeft.on("click", this.advanceLeft.bind(this));
    this._$imageRight.on("click", this.advanceRight.bind(this));
    $(document).on("keydown", this._onKeyDown.bind(this));

    // Give jQuery control over showing/hiding
    this._$modal.css("display", "block");
    this._$modal.hide();

    // Events
    $(window).on("resize", this._onResize.bind(this));
    this._$overlay.on("click", this.close.bind(this));
    this._$modal.find(".modal-close").on("click", this.close.bind(this));
    
    this._updateControls();

    // Size of fontawesome icons needs a slight delay (until stack is clear) for
    // some reason
    setTimeout(function () {
        this._onResize();
    }.bind(this), 0);
}

SlideshowModal.prototype.advanceLeft = function () {
    this.showImageAt(this._index - 1);
};

SlideshowModal.prototype.advanceRight = function () {
    this.showImageAt(this._index + 1);
};

SlideshowModal.prototype.showImageAt = function (index) {
    index = Math.max(index, 0);
    index = Math.min(index, this._slideshow.getNumImages() - 1);
    this._index = index;
    var $img = this._slideshow.getGalleryImage(this._index);
    var caption = this._slideshow.getCaption(this._index);

    this._$imageContainer.empty();
    $("<img>", {src: $img.attr("src")})
        .appendTo(this._$imageContainer);

    this._$caption.empty();
    if (caption) {
        $("<span>").addClass("figure-number")
            .text("Fig. " + (this._index + 1) + ": ")
            .appendTo(this._$caption);
        $("<span>").addClass("caption-text")
            .text(caption)
            .appendTo(this._$caption);
    }
    
    this._onResize();
    this._updateControls();
};

SlideshowModal.prototype.open = function (index) {
    index = index || 0;
    this._$modal.show();
    this.showImageAt(index);
    this._isOpen = true;
};

SlideshowModal.prototype.close = function () {
    this._$modal.hide();
    this._isOpen = false;
};

SlideshowModal.prototype._onKeyDown = function (e) {
    if (!this._isOpen) return;
    if (e.which === KEY_CODES.LEFT_ARROW) {
        this.advanceLeft();
    } else if (e.which === KEY_CODES.RIGHT_ARROW) {
        this.advanceRight();
    } else if (e.which === KEY_CODES.ESCAPE) {
        this.close();   
    }
};

SlideshowModal.prototype._updateControls = function () {
    // Re-enable
    this._$imageRight.removeClass("disabled");
    this._$imageLeft.removeClass("disabled");
    
    // Disable if we've reached the the max or min limit
    if (this._index >= (this._slideshow.getNumImages() - 1)) {
        this._$imageRight.addClass("disabled");
    } else if (this._index <= 0) {
        this._$imageLeft.addClass("disabled");
    }
};

SlideshowModal.prototype._onResize = function () {
    var $image = this._$imageContainer.find("img");

    // Reset the content's width
    this._$content.width("");

    // Find the size of the components that need to be displayed in addition to 
    // the image
    var controlsWidth = this._$imageLeft.outerWidth(true) + 
        this._$imageRight.outerWidth(true);
    // Hack for now - budget for 2x the caption height. 
    var captionHeight = 2 * this._$caption.outerHeight(true); 
    // var imagePadding = $image.innerWidth();

    // Calculate the available area for the modal
    var mw = this._$modal.width() - controlsWidth;
    var mh = this._$modal.height() - captionHeight;

    // Fit the image to the remaining screen real estate 
    var setSize = function () {
        var iw = $image.prop("naturalWidth");
        var ih = $image.prop("naturalHeight");
        var sw = iw / mw;
        var sh = ih / mh;
        var s = Math.max(sw, sh);

        // Set width/height using CSS in order to respect box-sizing
        if (s > 1) {
            $image.css("width", iw / s + "px");
            $image.css("height", ih / s + "px");
        } else {
            $image.css("width", iw + "px");
            $image.css("height", ih + "px");
        }

        this._$imageRight.css("top", $image.outerHeight() / 2 + "px");
        this._$imageLeft.css("top", $image.outerHeight() / 2 + "px");

        // Set the content wrapper to be the width of the image. This will keep 
        // the caption from expanding beyond the image.
        this._$content.width($image.outerWidth(true));        
    }.bind(this);

    if ($image.prop("complete")) setSize();
    else $image.one("load", setSize);
};

},{}],17:[function(require,module,exports){
var SlideshowModal = require("./slideshow-modal.js");
var ThumbnailSlider = require("./thumbnail-slider.js");

module.exports = {
    init: function(transitionDuration) {
        transitionDuration = (transitionDuration !== undefined) ?
            transitionDuration : 400;
        this._slideshows = [];
        $(".slideshow").each(function (index, element) {
            var slideshow = new Slideshow($(element), transitionDuration);
            this._slideshows.push(slideshow);
        }.bind(this));
    }
};

function Slideshow($container, transitionDuration) {
    this._transitionDuration = transitionDuration;
    this._$container = $container;
    this._index = 0; // Index of selected image

    // Create components
    this._thumbnailSlider = new ThumbnailSlider($container, this);
    this._modal = new SlideshowModal($container, this);

    // Cache and create necessary DOM elements   
    this._$captionContainer = $container.find(".caption");
    this._$selectedImageContainer = $container.find(".selected-image");

    // Open modal on clicking selected image
    this._$selectedImageContainer.on("click", function () {
        this._modal.open(this._index);    
    }.bind(this));

    // Load images
    this._$galleryImages = this._loadGalleryImages();
    this._numImages = this._$galleryImages.length;

    // Show the first image
    this.showImage(0);
}

Slideshow.prototype.getActiveIndex = function () {
    return this._index;
};

Slideshow.prototype.getNumImages = function () {
    return this._numImages;
};

Slideshow.prototype.getGalleryImage = function (index) {
    return this._$galleryImages[index];
};

Slideshow.prototype.getCaption = function (index) {
    return this._$galleryImages[index].data("caption");
};

Slideshow.prototype.showImage = function (index) {
    // Reset all images to invisible and lowest z-index. This could be smarter,
    // like HoverSlideshow, and only reset exactly what we need, but we aren't 
    // wasting that many cycles.
    this._$galleryImages.forEach(function ($galleryImage) {
        $galleryImage.css({
            "zIndex": 0,
            "opacity": 0
        });
        $galleryImage.velocity("stop"); // Stop any animations
    }, this);

    // Cache references to the last and current image
    var $lastImage = this._$galleryImages[this._index];
    var $currentImage = this._$galleryImages[index];
    this._index = index;

    // Make the last image visisble and then animate the current image into view
    // on top of the last
    $lastImage.css("zIndex", 1);
    $currentImage.css("zIndex", 2);
    $lastImage.css("opacity", 1);
    $currentImage.velocity({"opacity": 1}, this._transitionDuration, 
        "easeInOutQuad");

    // Create the caption, if it exists on the thumbnail
    var caption = $currentImage.data("caption");
    if (caption) {
        this._$captionContainer.empty();
        $("<span>").addClass("figure-number")
            .text("Fig. " + (this._index + 1) + ": ")
            .appendTo(this._$captionContainer);
        $("<span>").addClass("caption-text")
            .text(caption)
            .appendTo(this._$captionContainer);
    }

    // Object image fit polyfill breaks jQuery attr(...), so fallback to just 
    // using element.src
    // TODO: Lazy!
    // if ($currentImage.get(0).src === "") {
    //     $currentImage.get(0).src = $currentImage.data("image-url");
    // }
};

Slideshow.prototype._loadGalleryImages = function () {
    // Create empty images in the gallery for each thumbnail. This helps us do
    // lazy loading of gallery images and allows us to cross-fade images.
    var $galleryImages = [];
    for (var i = 0; i < this._thumbnailSlider.getNumThumbnails(); i += 1) {
        // Get the thumbnail element which has path and caption data
        var $thumb = this._thumbnailSlider.get$Thumbnail(i);

        // Calculate the id from the path to the large image
        var largePath = $thumb.data("large-path");
        var id = largePath.split("/").pop().split(".")[0];

        // Create a gallery image element
        var $galleryImage = $("<img>", {id: id})
            .css({
                position: "absolute",
                top: "0px",
                left: "0px",
                opacity: 0,
                zIndex: 0
            })
            .data("image-url", largePath)            
            .data("caption", $thumb.data("caption"))
            .appendTo(this._$selectedImageContainer);
        $galleryImage.get(0).src = largePath; // TODO: Make this lazy!
        $galleryImages.push($galleryImage);
    }
    return $galleryImages;
};
},{"./slideshow-modal.js":16,"./thumbnail-slider.js":18}],18:[function(require,module,exports){
module.exports = ThumbnailSlider;

function ThumbnailSlider($container, slideshow) {
    this._$container = $container;
    this._slideshow = slideshow;

    this._index = 0; // Index of selected thumbnail
    this._scrollIndex = 0; // Index of the thumbnail that is currently centered

    // Cache and create necessary DOM elements
    this._$thumbnailContainer = $container.find(".thumbnails");
    this._$thumbnailImages = this._$thumbnailContainer.find("img");
    this._$visibleThumbnailWrap = $container.find(".visible-thumbnails");
    this._$advanceLeft = $container.find(".thumbnail-advance-left");
    this._$advanceRight = $container.find(".thumbnail-advance-right");

    // Loop through the thumbnails, give them an index data attribute and cache
    // a reference to them in an array
    this._$thumbnails = [];
    this._$thumbnailImages.each(function (index, element) {
        var $thumbnail = $(element);
        $thumbnail.data("index", index);
        this._$thumbnails.push($thumbnail);
    }.bind(this));
    this._numImages = this._$thumbnails.length;

    // Left/right controls
    this._$advanceLeft.on("click", this.advanceLeft.bind(this));
    this._$advanceRight.on("click", this.advanceRight.bind(this));

    // Clicking a thumbnail
    this._$thumbnailImages.on("click", this._onClick.bind(this));

    this._activateThumbnail(0);

    // Resize
    $(window).on("resize", this._onResize.bind(this));

    // For some reason, the sizing on the controls is messed up if it runs
    // immediately - delay sizing until stack is clear
    setTimeout(function () {
        this._onResize();
    }.bind(this), 0);
}

ThumbnailSlider.prototype.getActiveIndex = function () {
    return this._index;
};

ThumbnailSlider.prototype.getNumThumbnails = function () {
    return this._numImages;
};

ThumbnailSlider.prototype.get$Thumbnail = function (index) {
    return this._$thumbnails[index];
};

ThumbnailSlider.prototype.advanceLeft = function () {
    var newIndex = this._scrollIndex - this._numVisible;
    newIndex = Math.max(newIndex, 0);
    this._scrollToThumbnail(newIndex);
};

ThumbnailSlider.prototype.advanceRight = function () {
    var newIndex = this._scrollIndex + this._numVisible;
    newIndex = Math.min(newIndex, this._numImages - 1);
    this._scrollToThumbnail(newIndex);
};

ThumbnailSlider.prototype._resetSizing = function () {
    // Reset sizing variables. This includes resetting any inline style that has
    // been applied, so that any size calculations can be based on the CSS
    // styling.
    this._$thumbnailContainer.css({
        top: "", left: "", width: "", height: ""
    });
    this._$visibleThumbnailWrap.width("");
    this._$visibleThumbnailWrap.height("");
    // Make all thumbnails square and reset any height
    this._$thumbnails.forEach(function ($element) { 
        $element.height(""); // Reset height before setting width
        $element.width($element.height());
    });
};

ThumbnailSlider.prototype._onResize = function () {
    this._resetSizing();

    // Calculate the size of the first thumbnail. This assumes the first image
    // only has a right-side margin.
    var $firstThumb = this._$thumbnails[0];
    var thumbSize = $firstThumb.outerHeight(false);
    var thumbMargin = 2 * ($firstThumb.outerWidth(true) - thumbSize);

    // Measure controls. They need to be visible in order to be measured.
    this._$advanceRight.css("display", "block");
    this._$advanceLeft.css("display", "block");
    var thumbControlWidth = this._$advanceRight.outerWidth(true) +
        this._$advanceLeft.outerWidth(true);

    // Calculate how many full thumbnails can fit within the thumbnail area
    var visibleWidth = this._$visibleThumbnailWrap.outerWidth(false);
    var numThumbsVisible = Math.floor(
        (visibleWidth - thumbMargin) / (thumbSize + thumbMargin)
    );

    // Check whether all the thumbnails can fit on the screen at once
    if (numThumbsVisible < this._numImages) {
        // Take a best guess at how to size the thumbnails. Size formula:
        //  width = num * thumbSize + (num - 1) * thumbMargin + controlSize
        // Solve for number of thumbnails and round to the nearest integer so 
        // that we don't have any partial thumbnails showing.
        numThumbsVisible = Math.round(
            (visibleWidth - thumbControlWidth + thumbMargin) / 
            (thumbSize + thumbMargin)
        );

        // Use this number of thumbnails to calculate the thumbnail size
        var newSize = (visibleWidth - thumbControlWidth + thumbMargin) / 
            numThumbsVisible - thumbMargin;
        this._$thumbnails.forEach(function ($element) {
            // $.width and $.height set the content size regardless of the 
            // box-sizing. The images are border-box, so we want the CSS width
            // and height. This allows the active image to have a border and the
            // other images to have padding. 
            $element.css("width", newSize + "px");
            $element.css("height", newSize + "px");
        });

        // Set the thumbnail wrap size. It should be just tall enough to fit a
        // thumbnail and long enough to hold all the thumbnails in one line:
        var totalSize = newSize * this._numImages + 
            thumbMargin * (this._numImages - 1);
        this._$thumbnailContainer.css({
            width: totalSize + "px",
            height: $firstThumb.outerHeight(true) + "px"
        });

        // Set the visible thumbnail wrap size. This is used to maks the much 
        // larger thumbnail container. It should be as wide as it can be, minus
        // the space needed for the left/right contols.
        this._$visibleThumbnailWrap.css({
            width: visibleWidth - thumbControlWidth + "px",
            height: $firstThumb.outerHeight(true) + "px"
        });
    } else {
        // All thumbnails are visible, we can hide the controls and expand the
        // thumbnail container to 100%
        numThumbsVisible = this._numImages;
        this._$thumbnailContainer.css("width", "100%");
        this._$advanceRight.css("display", "none");
        this._$advanceLeft.css("display", "none");
    }

    this._numVisible = numThumbsVisible;
    var middleIndex = Math.floor((this._numVisible - 1) / 2);
    this._scrollBounds = {
        min: middleIndex,
        max: this._numImages - 1 - middleIndex
    };
    if (this._numVisible % 2 === 0) this._scrollBounds.max -= 1;

    this._updateThumbnailControls();
};

ThumbnailSlider.prototype._activateThumbnail = function (index) {
    // Activate/deactivate thumbnails
    this._$thumbnails[this._index].removeClass("active");
    this._$thumbnails[index].addClass("active");
};

ThumbnailSlider.prototype._scrollToThumbnail = function (index) {
    // No need to scroll if all thumbnails are visible
    if (this._numVisible === this._numImages) return;

    // Constrain index so that we can't scroll out of bounds 
    index = Math.max(index, this._scrollBounds.min);
    index = Math.min(index, this._scrollBounds.max);
    this._scrollIndex = index;
    
    // Find the "left" position of the thumbnail container that would put the 
    // thumbnail at index at the center
    var $thumb = this._$thumbnails[0];
    var size = parseFloat($thumb.css("width"));
    var margin = 2 * parseFloat($thumb.css("margin-right")); 
    var centerX = size * this._scrollBounds.min + 
        margin * (this._scrollBounds.min - 1);
    var thumbX = size * index + margin * (index - 1);
    var left = centerX - thumbX;

    // Animate the thumbnail container
    this._$thumbnailContainer.velocity("stop");
    this._$thumbnailContainer.velocity({
        "left": left + "px"
    }, 600, "easeInOutQuad");

    this._updateThumbnailControls();
};

ThumbnailSlider.prototype._onClick = function (e) {
    var $target = $(e.target);
    var index = $target.data("index");
    
    // Clicked on the active image - no need to do anything
    if (this._index !== index) {
        this._activateThumbnail(index);
        this._scrollToThumbnail(index);
        this._index = index;
        this._slideshow.showImage(index);
    }
};

ThumbnailSlider.prototype._updateThumbnailControls = function () {
    // Re-enable
    this._$advanceLeft.removeClass("disabled");
    this._$advanceRight.removeClass("disabled");
    
    // Disable if we've reached the the max or min limit
    // var midScrollIndex = Math.floor((this._numVisible - 1) / 2);
    // var minScrollIndex = midScrollIndex;
    // var maxScrollIndex = this._numImages - 1 - midScrollIndex;
    if (this._scrollIndex >= this._scrollBounds.max) {
        this._$advanceRight.addClass("disabled");
    } else if (this._scrollIndex <= this._scrollBounds.min) {
        this._$advanceLeft.addClass("disabled");
    }
};
},{}],19:[function(require,module,exports){
exports.default = function (val, defaultVal) {
    return (val !== undefined) ? val : defaultVal;
};

// Untested
// exports.defaultProperties = function defaultProperties (obj, props) {
//     for (var prop in props) {
//         if (props.hasOwnProperty(props, prop)) {
//             var value = exports.defaultValue(props.value, props.default);
//             obj[prop] = value;
//         }
//     }
//     return obj;
// };
// 
exports.timeIt = function (func) {
    var start = performance.now();
    func();
    var end = performance.now();
    return end - start;
};

exports.isInRect = function (x, y, rect) {
    if (x >= rect.x && x <= (rect.x + rect.w) &&
        y >= rect.y && y <= (rect.y + rect.h)) {
        return true;
    }
    return false;
};

exports.randInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.randArrayElement = function (array) {
    var i = exports.randInt(0, array.length - 1);    
    return array[i];
};

exports.map = function (num, min1, max1, min2, max2, options) {
    var mapped = (num - min1) / (max1 - min1) * (max2 - min2) + min2;
    if (!options) return mapped;
    if (options.round && options.round === true) {
        mapped = Math.round(mapped);
    }
    if (options.floor && options.floor === true) {
        mapped = Math.floor(mapped);        
    }
    if (options.ceil && options.ceil === true) {
        mapped = Math.ceil(mapped);        
    }
    if (options.clamp && options.clamp === true) {
        mapped = Math.min(mapped, max2);
        mapped = Math.max(mapped, min2);
    }
    return mapped;
};

exports.getQueryParameters = function () {
    // Check for query string
    var qs = window.location.search;
    if (qs.length <= 1) return {};
    // Query string exists, parse it into a query object
    qs = qs.substring(1); // Remove the "?" delimiter
    var keyValPairs = qs.split("&");
    var queryObject = {};
    for (var i = 0; i < keyValPairs.length; i += 1) {
        var keyVal = keyValPairs[i].split("=");
        if (keyVal.length === 2) {
            var key = decodeURIComponent(keyVal[0]);
            var val = decodeURIComponent(keyVal[1]);
            queryObject[key] = val;
        }
    }
    return queryObject;
};

exports.createQueryString = function (queryObject) {
    if (typeof queryObject !== "object") return "";
    var keys = Object.keys(queryObject);
    if (keys.length === 0) return "";
    var queryString = "?";
    for (var i = 0; i < keys.length; i += 1) {
        var key = keys[i];
        var val = queryObject[key];
        queryString += encodeURIComponent(key) + "=" + encodeURIComponent(val);
        if (i !== keys.length - 1) queryString += "&";
    }
    return queryString;
};

exports.wrapIndex = function (index, length) {
    var wrappedIndex = (index % length); 
    if (wrappedIndex < 0) {
        // If negative, flip the index so that -1 becomes the last item in list 
        wrappedIndex = length + wrappedIndex;
    }
    return wrappedIndex;
};

},{}]},{},[12])

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJub2RlX21vZHVsZXMvcDUtYmJveC1hbGlnbmVkLXRleHQvbGliL2Jib3gtYWxpZ25lZC10ZXh0LmpzIiwibm9kZV9tb2R1bGVzL3A1LWJib3gtYWxpZ25lZC10ZXh0L2xpYi91dGlscy5qcyIsInNyYy9qcy9ob3Zlci1zbGlkZXNob3cuanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvYmFzZS1sb2dvLXNrZXRjaC5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9jb25uZWN0LXBvaW50cy1za2V0Y2guanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvZ2VuZXJhdG9ycy9ub2lzZS1nZW5lcmF0b3JzLmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2dlbmVyYXRvcnMvc2luLWdlbmVyYXRvci5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9oYWxmdG9uZS1mbGFzaGxpZ2h0LXdvcmQuanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3Mvbm9pc3ktd29yZC1za2V0Y2guanMiLCJzcmMvanMvbWFpbi1uYXYuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9wYWdlLWxvYWRlci5qcyIsInNyYy9qcy9waWNrLXJhbmRvbS1za2V0Y2guanMiLCJzcmMvanMvcG9ydGZvbGlvLWZpbHRlci5qcyIsInNyYy9qcy90aHVtYm5haWwtc2xpZGVzaG93L3NsaWRlc2hvdy1tb2RhbC5qcyIsInNyYy9qcy90aHVtYm5haWwtc2xpZGVzaG93L3NsaWRlc2hvdy5qcyIsInNyYy9qcy90aHVtYm5haWwtc2xpZGVzaG93L3RodW1ibmFpbC1zbGlkZXIuanMiLCJzcmMvanMvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIEphdmFTY3JpcHQgQ29va2llIHYyLjEuNFxuICogaHR0cHM6Ly9naXRodWIuY29tL2pzLWNvb2tpZS9qcy1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAwNiwgMjAxNSBLbGF1cyBIYXJ0bCAmIEZhZ25lciBCcmFja1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0dmFyIHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IGZhbHNlO1xuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZhY3RvcnkpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKCFyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIpIHtcblx0XHR2YXIgT2xkQ29va2llcyA9IHdpbmRvdy5Db29raWVzO1xuXHRcdHZhciBhcGkgPSB3aW5kb3cuQ29va2llcyA9IGZhY3RvcnkoKTtcblx0XHRhcGkubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHdpbmRvdy5Db29raWVzID0gT2xkQ29va2llcztcblx0XHRcdHJldHVybiBhcGk7XG5cdFx0fTtcblx0fVxufShmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIGV4dGVuZCAoKSB7XG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHNbIGkgXTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdHJlc3VsdFtrZXldID0gYXR0cmlidXRlc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG5cdFx0ZnVuY3Rpb24gYXBpIChrZXksIHZhbHVlLCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHR2YXIgcmVzdWx0O1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXcml0ZVxuXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0YXR0cmlidXRlcyA9IGV4dGVuZCh7XG5cdFx0XHRcdFx0cGF0aDogJy8nXG5cdFx0XHRcdH0sIGFwaS5kZWZhdWx0cywgYXR0cmlidXRlcyk7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiBhdHRyaWJ1dGVzLmV4cGlyZXMgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0dmFyIGV4cGlyZXMgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0XHRcdGV4cGlyZXMuc2V0TWlsbGlzZWNvbmRzKGV4cGlyZXMuZ2V0TWlsbGlzZWNvbmRzKCkgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlKzUpO1xuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGV4cGlyZXM7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBXZSdyZSB1c2luZyBcImV4cGlyZXNcIiBiZWNhdXNlIFwibWF4LWFnZVwiIGlzIG5vdCBzdXBwb3J0ZWQgYnkgSUVcblx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gYXR0cmlidXRlcy5leHBpcmVzID8gYXR0cmlidXRlcy5leHBpcmVzLnRvVVRDU3RyaW5nKCkgOiAnJztcblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcblx0XHRcdFx0XHRpZiAoL15bXFx7XFxbXS8udGVzdChyZXN1bHQpKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZSA9IHJlc3VsdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cblx0XHRcdFx0aWYgKCFjb252ZXJ0ZXIud3JpdGUpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcodmFsdWUpKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8M0F8M0N8M0V8M0R8MkZ8M0Z8NDB8NUJ8NUR8NUV8NjB8N0J8N0R8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRrZXkgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGtleSkpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1tcXChcXCldL2csIGVzY2FwZSk7XG5cblx0XHRcdFx0dmFyIHN0cmluZ2lmaWVkQXR0cmlidXRlcyA9ICcnO1xuXG5cdFx0XHRcdGZvciAodmFyIGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRcdGlmICghYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnOyAnICsgYXR0cmlidXRlTmFtZTtcblx0XHRcdFx0XHRpZiAoYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnPScgKyBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAoZG9jdW1lbnQuY29va2llID0ga2V5ICsgJz0nICsgdmFsdWUgKyBzdHJpbmdpZmllZEF0dHJpYnV0ZXMpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZWFkXG5cblx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdHJlc3VsdCA9IHt9O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG5cdFx0XHQvLyBpbiBjYXNlIHRoZXJlIGFyZSBubyBjb29raWVzIGF0IGFsbC4gQWxzbyBwcmV2ZW50cyBvZGQgcmVzdWx0IHdoZW5cblx0XHRcdC8vIGNhbGxpbmcgXCJnZXQoKVwiXG5cdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOyAnKSA6IFtdO1xuXHRcdFx0dmFyIHJkZWNvZGUgPSAvKCVbMC05QS1aXXsyfSkrL2c7XG5cdFx0XHR2YXIgaSA9IDA7XG5cblx0XHRcdGZvciAoOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG5cblx0XHRcdFx0aWYgKGNvb2tpZS5jaGFyQXQoMCkgPT09ICdcIicpIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWUuc2xpY2UoMSwgLTEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR2YXIgbmFtZSA9IHBhcnRzWzBdLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0XHRjb29raWUgPSBjb252ZXJ0ZXIucmVhZCA/XG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXIucmVhZChjb29raWUsIG5hbWUpIDogY29udmVydGVyKGNvb2tpZSwgbmFtZSkgfHxcblx0XHRcdFx0XHRcdGNvb2tpZS5yZXBsYWNlKHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cblx0XHRcdFx0XHRpZiAodGhpcy5qc29uKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb29raWUgPSBKU09OLnBhcnNlKGNvb2tpZSk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChrZXkgPT09IG5hbWUpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IGNvb2tpZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdFx0XHRyZXN1bHRbbmFtZV0gPSBjb29raWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdGFwaS5zZXQgPSBhcGk7XG5cdFx0YXBpLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHJldHVybiBhcGkuY2FsbChhcGksIGtleSk7XG5cdFx0fTtcblx0XHRhcGkuZ2V0SlNPTiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBhcGkuYXBwbHkoe1xuXHRcdFx0XHRqc29uOiB0cnVlXG5cdFx0XHR9LCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuXHRcdH07XG5cdFx0YXBpLmRlZmF1bHRzID0ge307XG5cblx0XHRhcGkucmVtb3ZlID0gZnVuY3Rpb24gKGtleSwgYXR0cmlidXRlcykge1xuXHRcdFx0YXBpKGtleSwgJycsIGV4dGVuZChhdHRyaWJ1dGVzLCB7XG5cdFx0XHRcdGV4cGlyZXM6IC0xXG5cdFx0XHR9KSk7XG5cdFx0fTtcblxuXHRcdGFwaS53aXRoQ29udmVydGVyID0gaW5pdDtcblxuXHRcdHJldHVybiBhcGk7XG5cdH1cblxuXHRyZXR1cm4gaW5pdChmdW5jdGlvbiAoKSB7fSk7XG59KSk7XG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKFwiLi91dGlscy5qc1wiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmJveEFsaWduZWRUZXh0O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgQmJveEFsaWduZWRUZXh0IG9iamVjdCAtIGEgdGV4dCBvYmplY3QgdGhhdCBjYW4gYmUgZHJhd24gd2l0aFxyXG4gKiBhbmNob3IgcG9pbnRzIGJhc2VkIG9uIGEgdGlnaHQgYm91bmRpbmcgYm94IGFyb3VuZCB0aGUgdGV4dC5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBmb250IC0gcDUuRm9udCBvYmplY3RcclxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBTdHJpbmcgdG8gZGlzcGxheVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW2ZvbnRTaXplPTEyXSAtIEZvbnQgc2l6ZSB0byB1c2UgZm9yIHN0cmluZ1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW3g9MF0gLSBJbml0aWFsIHggbG9jYXRpb25cclxuICogQHBhcmFtIHtudW1iZXJ9IFt5PTBdIC0gSW5pdGlhbCB5IGxvY2F0aW9uXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcEluc3RhbmNlPXdpbmRvd10gLSBSZWZlcmVuY2UgdG8gcDUgaW5zdGFuY2UsIGxlYXZlIGJsYW5rIGlmXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2V0Y2ggaXMgZ2xvYmFsXHJcbiAqIEBleGFtcGxlXHJcbiAqIHZhciBmb250LCBiYm94VGV4dDtcclxuICogZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICogICAgIGZvbnQgPSBsb2FkRm9udChcIi4vYXNzZXRzL1JlZ3VsYXIudHRmXCIpO1xyXG4gKiB9XHJcbiAqIGZ1bmN0aW9uIHNldHVwKCkge1xyXG4gKiAgICAgY3JlYXRlQ2FudmFzKDQwMCwgNjAwKTtcclxuICogICAgIGJhY2tncm91bmQoMCk7XHJcbiAqICAgICBcclxuICogICAgIGJib3hUZXh0ID0gbmV3IEJib3hBbGlnbmVkVGV4dChmb250LCBcIkhleSFcIiwgMzApOyAgICBcclxuICogICAgIGJib3hUZXh0LnNldFJvdGF0aW9uKFBJIC8gNCk7XHJcbiAqICAgICBiYm94VGV4dC5zZXRBbmNob3IoQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9DRU5URVIsIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSKTtcclxuICogICAgIFxyXG4gKiAgICAgZmlsbChcIiMwMEE4RUFcIik7XHJcbiAqICAgICBub1N0cm9rZSgpO1xyXG4gKiAgICAgYmJveFRleHQuZHJhdyh3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xyXG4gKiB9XHJcbiAqL1xyXG5mdW5jdGlvbiBCYm94QWxpZ25lZFRleHQoZm9udCwgdGV4dCwgZm9udFNpemUsIHgsIHksIHBJbnN0YW5jZSkge1xyXG4gICAgdGhpcy5fZm9udCA9IGZvbnQ7XHJcbiAgICB0aGlzLl90ZXh0ID0gdGV4dDtcclxuICAgIHRoaXMuX3ggPSB1dGlscy5kZWZhdWx0KHgsIDApO1xyXG4gICAgdGhpcy5feSA9IHV0aWxzLmRlZmF1bHQoeSwgMCk7XHJcbiAgICB0aGlzLl9mb250U2l6ZSA9IHV0aWxzLmRlZmF1bHQoZm9udFNpemUsIDEyKTtcclxuICAgIHRoaXMuX3AgPSB1dGlscy5kZWZhdWx0KHBJbnN0YW5jZSwgd2luZG93KTtcclxuICAgIHRoaXMuX3JvdGF0aW9uID0gMDtcclxuICAgIHRoaXMuX2hBbGlnbiA9IEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfQ0VOVEVSO1xyXG4gICAgdGhpcy5fdkFsaWduID0gQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVI7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVNZXRyaWNzKHRydWUpO1xyXG59XHJcblxyXG4vKipcclxuICogVmVydGljYWwgYWxpZ25tZW50IHZhbHVlc1xyXG4gKiBAcHVibGljXHJcbiAqIEBzdGF0aWNcclxuICogQHJlYWRvbmx5XHJcbiAqIEBlbnVtIHtzdHJpbmd9XHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQuQUxJR04gPSB7XHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBsZWZ0IG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfTEVGVDogXCJib3hfbGVmdFwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgY2VudGVyIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfQ0VOVEVSOiBcImJveF9jZW50ZXJcIixcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIHJpZ2h0IG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfUklHSFQ6IFwiYm94X3JpZ2h0XCJcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlbGluZSBhbGlnbm1lbnQgdmFsdWVzXHJcbiAqIEBwdWJsaWNcclxuICogQHN0YXRpY1xyXG4gKiBAcmVhZG9ubHlcclxuICogQGVudW0ge3N0cmluZ31cclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5CQVNFTElORSA9IHtcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIHRvcCBvZiB0aGUgYmJveCAqL1xyXG4gICAgQk9YX1RPUDogXCJib3hfdG9wXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9DRU5URVI6IFwiYm94X2NlbnRlclwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgYm90dG9tIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfQk9UVE9NOiBcImJveF9ib3R0b21cIixcclxuICAgIC8qKiBcclxuICAgICAqIERyYXcgZnJvbSBoYWxmIHRoZSBoZWlnaHQgb2YgdGhlIGZvbnQuIFNwZWNpZmljYWxseSB0aGUgaGVpZ2h0IGlzXHJcbiAgICAgKiBjYWxjdWxhdGVkIGFzOiBhc2NlbnQgKyBkZXNjZW50LlxyXG4gICAgICovXHJcbiAgICBGT05UX0NFTlRFUjogXCJmb250X2NlbnRlclwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgdGhlIG5vcm1hbCBmb250IGJhc2VsaW5lICovXHJcbiAgICBBTFBIQUJFVElDOiBcImFscGhhYmV0aWNcIlxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCBjdXJyZW50IHRleHRcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gVGV4dCBzdHJpbmcgdG8gZGlzcGxheVxyXG4gKiBAcmV0dXJucyB7dGhpc30gVXNlZnVsIGZvciBjaGFpbmluZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRUZXh0ID0gZnVuY3Rpb24oc3RyaW5nKSB7XHJcbiAgICB0aGlzLl90ZXh0ID0gc3RyaW5nO1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlTWV0cmljcyhmYWxzZSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIHRleHQgcG9zaXRpb25cclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0geCAtIFggcG9zaXRpb25cclxuICogQHBhcmFtIHtudW1iZXJ9IHggLSBZIHBvc2l0aW9uXHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oeCwgeSkge1xyXG4gICAgdGhpcy5feCA9IHV0aWxzLmRlZmF1bHQoeCwgdGhpcy5feCk7XHJcbiAgICB0aGlzLl95ID0gdXRpbHMuZGVmYXVsdCh5LCB0aGlzLl95KTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgdGV4dCBwb3NpdGlvblxyXG4gKiBAcHVibGljXHJcbiAqIEByZXR1cm4ge29iamVjdH0gUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzOiB4LCB5XHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHRoaXMuX3gsXHJcbiAgICAgICAgeTogdGhpcy5feVxyXG4gICAgfTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgY3VycmVudCB0ZXh0IHNpemVcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0gZm9udFNpemUgVGV4dCBzaXplXHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFRleHRTaXplID0gZnVuY3Rpb24oZm9udFNpemUpIHtcclxuICAgIHRoaXMuX2ZvbnRTaXplID0gZm9udFNpemU7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVNZXRyaWNzKHRydWUpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IHJvdGF0aW9uIG9mIHRleHRcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBSb3RhdGlvbiBpbiByYWRpYW5zXHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFJvdGF0aW9uID0gZnVuY3Rpb24oYW5nbGUpIHtcclxuICAgIHRoaXMuX3JvdGF0aW9uID0gdXRpbHMuZGVmYXVsdChhbmdsZSwgdGhpcy5fcm90YXRpb24pO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHJvdGF0aW9uIG9mIHRleHRcclxuICogQHB1YmxpY1xyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSb3RhdGlvbiBpbiByYWRpYW5zXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLmdldFJvdGF0aW9uID0gZnVuY3Rpb24oYW5nbGUpIHtcclxuICAgIHJldHVybiB0aGlzLl9yb3RhdGlvbjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIHAgaW5zdGFuY2UgdGhhdCBpcyB1c2VkIGZvciBkcmF3aW5nXHJcbiAqIEBwdWJsaWNcclxuICogQHBhcmFtIHtvYmplY3R9IHAgLSBJbnN0YW5jZSBvZiBwNSBmb3IgZHJhd2luZy4gVGhpcyBpcyBvbmx5IG5lZWRlZCB3aGVuIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgIHVzaW5nIGFuIG9mZnNjcmVlbiByZW5kZXJlciBvciB3aGVuIHVzaW5nIHA1IGluIGluc3RhbmNlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgbW9kZS5cclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0UEluc3RhbmNlID0gZnVuY3Rpb24ocCkge1xyXG4gICAgdGhpcy5fcCA9IHV0aWxzLmRlZmF1bHQocCwgdGhpcy5fcCk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgcm90YXRpb24gb2YgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9IEluc3RhbmNlIG9mIHA1IHRoYXQgaXMgYmVpbmcgdXNlZCBmb3IgZHJhd2luZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRQSW5zdGFuY2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9wO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCBhbmNob3IgcG9pbnQgZm9yIHRleHQgKGhvcml6b25hbCBhbmQgdmVydGljYWwgYWxpZ25tZW50KSByZWxhdGl2ZSB0b1xyXG4gKiBib3VuZGluZyBib3hcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2hBbGlnbj1DRU5URVJdIC0gSG9yaXpvbmFsIGFsaWdubWVudFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW3ZBbGlnbj1DRU5URVJdIC0gVmVydGljYWwgYmFzZWxpbmVcclxuICogQHBhcmFtIHtib29sZWFufSBbdXBkYXRlUG9zaXRpb249ZmFsc2VdIC0gSWYgc2V0IHRvIHRydWUsIHRoZSBwb3NpdGlvbiBvZiB0aGVcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHRleHQgd2lsbCBiZSBzaGlmdGVkIHNvIHRoYXRcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHRleHQgd2lsbCBiZSBkcmF3biBpbiB0aGUgc2FtZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZSBpdCB3YXMgYmVmb3JlIGNhbGxpbmcgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEFuY2hvci5cclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0QW5jaG9yID0gZnVuY3Rpb24oaEFsaWduLCB2QWxpZ24sIHVwZGF0ZVBvc2l0aW9uKSB7XHJcbiAgICB2YXIgb2xkUG9zID0gdGhpcy5fY2FsY3VsYXRlQWxpZ25lZENvb3Jkcyh0aGlzLl94LCB0aGlzLl95KTtcclxuICAgIHRoaXMuX2hBbGlnbiA9IHV0aWxzLmRlZmF1bHQoaEFsaWduLCBCYm94QWxpZ25lZFRleHQuQUxJR04uQ0VOVEVSKTtcclxuICAgIHRoaXMuX3ZBbGlnbiA9IHV0aWxzLmRlZmF1bHQodkFsaWduLCBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQ0VOVEVSKTtcclxuICAgIGlmICh1cGRhdGVQb3NpdGlvbikge1xyXG4gICAgICAgIHZhciBuZXdQb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHRoaXMuX3gsIHRoaXMuX3kpO1xyXG4gICAgICAgIHRoaXMuX3ggKz0gb2xkUG9zLnggLSBuZXdQb3MueDtcclxuICAgICAgICB0aGlzLl95ICs9IG9sZFBvcy55IC0gbmV3UG9zLnk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGJvdW5kaW5nIGJveCB3aGVuIHRoZSB0ZXh0IGlzIHBsYWNlZCBhdCB0aGUgc3BlY2lmaWVkIGNvb3JkaW5hdGVzLlxyXG4gKiBOb3RlOiB0aGlzIGlzIHRoZSB1bnJvdGF0ZWQgYm91bmRpbmcgYm94ISBUT0RPOiBGaXggdGhpcy5cclxuICogQHBhcmFtIHtudW1iZXJ9IFt4PWN1cnJlbnQgeF0gLSBBIG5ldyB4IGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3IuIFRoaXNcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVybWFuZW50bHkuIFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3k9Y3VycmVudCB5XSAtIEEgbmV3IHkgY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpc1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbGwgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJtYW5lbnRseS5cclxuICogQHJldHVybiB7b2JqZWN0fSBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXM6IHgsIHksIHcsIGhcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0QmJveCA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICB2YXIgcG9zID0gdGhpcy5fY2FsY3VsYXRlQWxpZ25lZENvb3Jkcyh0aGlzLl94LCB0aGlzLl95KTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogcG9zLnggKyB0aGlzLl9ib3VuZHNPZmZzZXQueCxcclxuICAgICAgICB5OiBwb3MueSArIHRoaXMuX2JvdW5kc09mZnNldC55LFxyXG4gICAgICAgIHc6IHRoaXMud2lkdGgsXHJcbiAgICAgICAgaDogdGhpcy5oZWlnaHRcclxuICAgIH07XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IGFuIGFycmF5IG9mIHBvaW50cyB0aGF0IGZvbGxvdyBhbG9uZyB0aGUgdGV4dCBwYXRoLiBUaGlzIHdpbGwgdGFrZSBpbnRvXHJcbiAqIGNvbnNpZGVyYXRpb24gdGhlIGN1cnJlbnQgYWxpZ25tZW50IHNldHRpbmdzLlxyXG4gKiBOb3RlOiB0aGlzIGlzIGEgdGhpbiB3cmFwcGVyIGFyb3VuZCBhIHA1IG1ldGhvZCBhbmQgZG9lc24ndCBoYW5kbGUgdW5yb3RhdGVkXHJcbiAqIHRleHQhIFRPRE86IEZpeCB0aGlzLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3g9Y3VycmVudCB4XSAtIEEgbmV3IHggY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpc1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbGwgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJtYW5lbnRseS4gXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeT1jdXJyZW50IHldIC0gQSBuZXcgeSBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbmVudGx5LlxyXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIC0gQW4gb2JqZWN0IHRoYXQgY2FuIGhhdmU6XHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gc2FtcGxlRmFjdG9yOiByYXRpbyBvZiBwYXRoLWxlbmd0aCB0byBudW1iZXJcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZiBzYW1wbGVzIChkZWZhdWx0PTAuMjUpLiBIaWdoZXIgdmFsdWVzIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIG1vcmVwb2ludHMgYW5kIGFyZSB0aGVyZWZvcmUgbW9yZSBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVjaXNlLiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBzaW1wbGlmeVRocmVzaG9sZDogaWYgc2V0IHRvIGEgbm9uLXplcm8gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsIGNvbGxpbmVhciBwb2ludHMgd2lsbCBiZSByZW1vdmVkLiBUaGVcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSByZXByZXNlbnRzIHRoZSB0aHJlc2hvbGQgYW5nbGUgdG8gdXNlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiBkZXRlcm1pbmluZyB3aGV0aGVyIHR3byBlZGdlcyBhcmUgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGluZWFyLlxyXG4gKiBAcmV0dXJuIHthcnJheX0gQW4gYXJyYXkgb2YgcG9pbnRzLCBlYWNoIHdpdGggeCwgeSAmIGFscGhhICh0aGUgcGF0aCBhbmdsZSlcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0VGV4dFBvaW50cyA9IGZ1bmN0aW9uKHgsIHksIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5fZm9udC50ZXh0VG9Qb2ludHModGhpcy5fdGV4dCwgdGhpcy5feCwgdGhpcy5feSwgXHJcbiAgICAgICAgdGhpcy5fZm9udFNpemUsIG9wdGlvbnMpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgcG9zID0gdGhpcy5fY2FsY3VsYXRlQWxpZ25lZENvb3Jkcyhwb2ludHNbaV0ueCwgcG9pbnRzW2ldLnkpO1xyXG4gICAgICAgIHBvaW50c1tpXS54ID0gcG9zLng7XHJcbiAgICAgICAgcG9pbnRzW2ldLnkgPSBwb3MueTtcclxuICAgIH1cclxuICAgIHJldHVybiBwb2ludHM7XHJcbn07XHJcblxyXG4vKipcclxuICogRHJhd3MgdGhlIHRleHQgcGFydGljbGUgd2l0aCB0aGUgc3BlY2lmaWVkIHN0eWxlIHBhcmFtZXRlcnMuIE5vdGU6IHRoaXMgaXNcclxuICogZ29pbmcgdG8gc2V0IHRoZSB0ZXh0Rm9udCwgdGV4dFNpemUgJiByb3RhdGlvbiBiZWZvcmUgZHJhd2luZy4gWW91IHNob3VsZCBzZXRcclxuICogdGhlIGNvbG9yL3N0cm9rZS9maWxsIHRoYXQgeW91IHdhbnQgYmVmb3JlIGRyYXdpbmcuIFRoaXMgZnVuY3Rpb24gd2lsbCBjbGVhblxyXG4gKiB1cCBhZnRlciBpdHNlbGYgYW5kIHJlc2V0IHN0eWxpbmcgYmFjayB0byB3aGF0IGl0IHdhcyBiZWZvcmUgaXQgd2FzIGNhbGxlZC5cclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW3g9Y3VycmVudCB4XSAtIEEgbmV3IHggY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpcyB3aWxsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIHBlcm1hbmVudGx5LiBcclxuICogQHBhcmFtIHtudW1iZXJ9IFt5PWN1cnJlbnQgeV0gLSBBIG5ldyB5IGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3IuIFRoaXMgd2lsbFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gcGVybWFuZW50bHkuXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2RyYXdCb3VuZHM9ZmFsc2VdIC0gRmxhZyBmb3IgZHJhd2luZyBib3VuZGluZyBib3hcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHgsIHksIGRyYXdCb3VuZHMpIHtcclxuICAgIGRyYXdCb3VuZHMgPSB1dGlscy5kZWZhdWx0KGRyYXdCb3VuZHMsIGZhbHNlKTtcclxuICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICB2YXIgcG9zID0ge1xyXG4gICAgICAgIHg6IHRoaXMuX3gsIFxyXG4gICAgICAgIHk6IHRoaXMuX3lcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fcC5wdXNoKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9yb3RhdGlvbikge1xyXG4gICAgICAgICAgICBwb3MgPSB0aGlzLl9jYWxjdWxhdGVSb3RhdGVkQ29vcmRzKHBvcy54LCBwb3MueSwgdGhpcy5fcm90YXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLl9wLnJvdGF0ZSh0aGlzLl9yb3RhdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHBvcy54LCBwb3MueSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3AudGV4dEFsaWduKHRoaXMuX3AuTEVGVCwgdGhpcy5fcC5CQVNFTElORSk7XHJcbiAgICAgICAgdGhpcy5fcC50ZXh0Rm9udCh0aGlzLl9mb250KTtcclxuICAgICAgICB0aGlzLl9wLnRleHRTaXplKHRoaXMuX2ZvbnRTaXplKTtcclxuICAgICAgICB0aGlzLl9wLnRleHQodGhpcy5fdGV4dCwgcG9zLngsIHBvcy55KTtcclxuXHJcbiAgICAgICAgaWYgKGRyYXdCb3VuZHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fcC5zdHJva2UoMjAwKTtcclxuICAgICAgICAgICAgdmFyIGJvdW5kc1ggPSBwb3MueCArIHRoaXMuX2JvdW5kc09mZnNldC54O1xyXG4gICAgICAgICAgICB2YXIgYm91bmRzWSA9IHBvcy55ICsgdGhpcy5fYm91bmRzT2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Aubm9GaWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3AucmVjdChib3VuZHNYLCBib3VuZHNZLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIHRoaXMuX3AucG9wKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogUHJvamVjdCB0aGUgY29vcmRpbmF0ZXMgKHgsIHkpIGludG8gYSByb3RhdGVkIGNvb3JkaW5hdGUgc3lzdGVtXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gWCBjb29yZGluYXRlIChpbiB1bnJvdGF0ZWQgc3BhY2UpXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gWSBjb29yZGluYXRlIChpbiB1bnJvdGF0ZWQgc3BhY2UpXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFJhZGlhbnMgb2Ygcm90YXRpb24gdG8gYXBwbHlcclxuICogQHJldHVybiB7b2JqZWN0fSBPYmplY3Qgd2l0aCB4ICYgeSBwcm9wZXJ0aWVzXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLl9jYWxjdWxhdGVSb3RhdGVkQ29vcmRzID0gZnVuY3Rpb24gKHgsIHksIGFuZ2xlKSB7ICBcclxuICAgIHZhciByeCA9IE1hdGguY29zKGFuZ2xlKSAqIHggKyBNYXRoLmNvcyhNYXRoLlBJIC8gMiAtIGFuZ2xlKSAqIHk7XHJcbiAgICB2YXIgcnkgPSAtTWF0aC5zaW4oYW5nbGUpICogeCArIE1hdGguc2luKE1hdGguUEkgLyAyIC0gYW5nbGUpICogeTtcclxuICAgIHJldHVybiB7eDogcngsIHk6IHJ5fTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIGRyYXcgY29vcmRpbmF0ZXMgZm9yIHRoZSB0ZXh0LCBhbGlnbmluZyBiYXNlZCBvbiB0aGUgYm91bmRpbmcgYm94LlxyXG4gKiBUaGUgdGV4dCBpcyBldmVudHVhbGx5IGRyYXduIHdpdGggY2FudmFzIGFsaWdubWVudCBzZXQgdG8gbGVmdCAmIGJhc2VsaW5lLCBzb1xyXG4gKiB0aGlzIGZ1bmN0aW9uIHRha2VzIGEgZGVzaXJlZCBwb3MgJiBhbGlnbm1lbnQgYW5kIHJldHVybnMgdGhlIGFwcHJvcHJpYXRlXHJcbiAqIGNvb3JkaW5hdGVzIGZvciB0aGUgbGVmdCAmIGJhc2VsaW5lLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0geCAtIFggY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0geSAtIFkgY29vcmRpbmF0ZVxyXG4gKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCB3aXRoIHggJiB5IHByb3BlcnRpZXNcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHMgPSBmdW5jdGlvbih4LCB5KSB7XHJcbiAgICB2YXIgbmV3WCwgbmV3WTtcclxuICAgIHN3aXRjaCAodGhpcy5faEFsaWduKSB7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQUxJR04uQk9YX0xFRlQ6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfQ0VOVEVSOlxyXG4gICAgICAgICAgICBuZXdYID0geCAtIHRoaXMuaGFsZldpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfUklHSFQ6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4IC0gdGhpcy53aWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgbmV3WCA9IHg7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5yZWNvZ25pemVkIGhvcml6b25hbCBhbGlnbjpcIiwgdGhpcy5faEFsaWduKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBzd2l0Y2ggKHRoaXMuX3ZBbGlnbikge1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9UT1A6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5IC0gdGhpcy5fYm91bmRzT2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVI6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5ICsgdGhpcy5fZGlzdEJhc2VUb01pZDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0JPVFRPTTpcclxuICAgICAgICAgICAgbmV3WSA9IHkgLSB0aGlzLl9kaXN0QmFzZVRvQm90dG9tO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5GT05UX0NFTlRFUjpcclxuICAgICAgICAgICAgLy8gSGVpZ2h0IGlzIGFwcHJveGltYXRlZCBhcyBhc2NlbnQgKyBkZXNjZW50XHJcbiAgICAgICAgICAgIG5ld1kgPSB5IC0gdGhpcy5fZGVzY2VudCArICh0aGlzLl9hc2NlbnQgKyB0aGlzLl9kZXNjZW50KSAvIDI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkFMUEhBQkVUSUM6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBuZXdZID0geTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbnJlY29nbml6ZWQgdmVydGljYWwgYWxpZ246XCIsIHRoaXMuX3ZBbGlnbik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHt4OiBuZXdYLCB5OiBuZXdZfTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyBib3VuZGluZyBib3ggYW5kIHZhcmlvdXMgbWV0cmljcyBmb3IgdGhlIGN1cnJlbnQgdGV4dCBhbmQgZm9udFxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5fY2FsY3VsYXRlTWV0cmljcyA9IGZ1bmN0aW9uKHNob3VsZFVwZGF0ZUhlaWdodCkgeyAgXHJcbiAgICAvLyBwNSAwLjUuMCBoYXMgYSBidWcgLSB0ZXh0IGJvdW5kcyBhcmUgY2xpcHBlZCBieSAoMCwgMClcclxuICAgIC8vIENhbGN1bGF0aW5nIGJvdW5kcyBoYWNrXHJcbiAgICB2YXIgYm91bmRzID0gdGhpcy5fZm9udC50ZXh0Qm91bmRzKHRoaXMuX3RleHQsIDEwMDAsIDEwMDAsIHRoaXMuX2ZvbnRTaXplKTtcclxuICAgIC8vIEJvdW5kcyBpcyBhIHJlZmVyZW5jZSAtIGlmIHdlIG1lc3Mgd2l0aCBpdCBkaXJlY3RseSwgd2UgY2FuIG1lc3MgdXAgXHJcbiAgICAvLyBmdXR1cmUgdmFsdWVzISAoSXQgY2hhbmdlcyB0aGUgYmJveCBjYWNoZSBpbiBwNS4pXHJcbiAgICBib3VuZHMgPSB7IFxyXG4gICAgICAgIHg6IGJvdW5kcy54IC0gMTAwMCwgXHJcbiAgICAgICAgeTogYm91bmRzLnkgLSAxMDAwLCBcclxuICAgICAgICB3OiBib3VuZHMudywgXHJcbiAgICAgICAgaDogYm91bmRzLmggXHJcbiAgICB9OyBcclxuXHJcbiAgICBpZiAoc2hvdWxkVXBkYXRlSGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5fYXNjZW50ID0gdGhpcy5fZm9udC5fdGV4dEFzY2VudCh0aGlzLl9mb250U2l6ZSk7XHJcbiAgICAgICAgdGhpcy5fZGVzY2VudCA9IHRoaXMuX2ZvbnQuX3RleHREZXNjZW50KHRoaXMuX2ZvbnRTaXplKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2UgYm91bmRzIHRvIGNhbGN1bGF0ZSBmb250IG1ldHJpY3NcclxuICAgIHRoaXMud2lkdGggPSBib3VuZHMudztcclxuICAgIHRoaXMuaGVpZ2h0ID0gYm91bmRzLmg7XHJcbiAgICB0aGlzLmhhbGZXaWR0aCA9IHRoaXMud2lkdGggLyAyO1xyXG4gICAgdGhpcy5oYWxmSGVpZ2h0ID0gdGhpcy5oZWlnaHQgLyAyO1xyXG4gICAgdGhpcy5fYm91bmRzT2Zmc2V0ID0geyB4OiBib3VuZHMueCwgeTogYm91bmRzLnkgfTtcclxuICAgIHRoaXMuX2Rpc3RCYXNlVG9NaWQgPSBNYXRoLmFicyhib3VuZHMueSkgLSB0aGlzLmhhbGZIZWlnaHQ7XHJcbiAgICB0aGlzLl9kaXN0QmFzZVRvQm90dG9tID0gdGhpcy5oZWlnaHQgLSBNYXRoLmFicyhib3VuZHMueSk7XHJcbn07IiwiZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24odmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgcmV0dXJuICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSA/IHZhbHVlIDogZGVmYXVsdFZhbHVlO1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gSG92ZXJTbGlkZXNob3dzO1xyXG5cclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEhvdmVyU2xpZGVzaG93cyhzbGlkZXNob3dEZWxheSwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl9zbGlkZXNob3dEZWxheSA9IChzbGlkZXNob3dEZWxheSAhPT0gdW5kZWZpbmVkKSA/IHNsaWRlc2hvd0RlbGF5IDpcclxuICAgICAgICAyMDAwO1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gKHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSA/XHJcbiAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uIDogMTAwMDtcclxuXHJcbiAgICB0aGlzLl9zbGlkZXNob3dzID0gW107XHJcbiAgICB0aGlzLnJlbG9hZCgpO1xyXG59XHJcblxyXG5Ib3ZlclNsaWRlc2hvd3MucHJvdG90eXBlLnJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIE5vdGU6IHRoaXMgaXMgY3VycmVudGx5IG5vdCByZWFsbHkgYmVpbmcgdXNlZC4gV2hlbiBhIHBhZ2UgaXMgbG9hZGVkLFxyXG4gICAgLy8gbWFpbi5qcyBpcyBqdXN0IHJlLWluc3RhbmNpbmcgdGhlIEhvdmVyU2xpZGVzaG93c1xyXG4gICAgdmFyIG9sZFNsaWRlc2hvd3MgPSB0aGlzLl9zbGlkZXNob3dzIHx8IFtdO1xyXG4gICAgdGhpcy5fc2xpZGVzaG93cyA9IFtdO1xyXG4gICAgJChcIi5ob3Zlci1zbGlkZXNob3dcIikuZWFjaChmdW5jdGlvbiAoXywgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5fZmluZEluU2xpZGVzaG93cyhlbGVtZW50LCBvbGRTbGlkZXNob3dzKTtcclxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBzbGlkZXNob3cgPSBvbGRTbGlkZXNob3dzLnNwbGljZShpbmRleCwgMSlbMF07XHJcbiAgICAgICAgICAgIHRoaXMuX3NsaWRlc2hvd3MucHVzaChzbGlkZXNob3cpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NsaWRlc2hvd3MucHVzaChuZXcgU2xpZGVzaG93KCRlbGVtZW50LCB0aGlzLl9zbGlkZXNob3dEZWxheSxcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbikpO1xyXG4gICAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5Ib3ZlclNsaWRlc2hvd3MucHJvdG90eXBlLl9maW5kSW5TbGlkZXNob3dzID0gZnVuY3Rpb24gKGVsZW1lbnQsIHNsaWRlc2hvd3MpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzaG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmIChlbGVtZW50ID09PSBzbGlkZXNob3dzW2ldLmdldEVsZW1lbnQoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gLTE7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBTbGlkZXNob3coJGNvbnRhaW5lciwgc2xpZGVzaG93RGVsYXksIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lciA9ICRjb250YWluZXI7XHJcbiAgICB0aGlzLl9zbGlkZXNob3dEZWxheSA9IHNsaWRlc2hvd0RlbGF5O1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gdHJhbnNpdGlvbkR1cmF0aW9uO1xyXG4gICAgdGhpcy5fdGltZW91dElkID0gbnVsbDtcclxuICAgIHRoaXMuX2ltYWdlSW5kZXggPSAwO1xyXG4gICAgdGhpcy5fJGltYWdlcyA9IFtdO1xyXG5cclxuICAgIC8vIFNldCB1cCBhbmQgY2FjaGUgcmVmZXJlbmNlcyB0byBpbWFnZXNcclxuICAgIHRoaXMuXyRjb250YWluZXIuZmluZChcImltZ1wiKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciAkaW1hZ2UgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgICRpbWFnZS5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICB0b3A6IFwiMFwiLFxyXG4gICAgICAgICAgICBsZWZ0OiBcIjBcIixcclxuICAgICAgICAgICAgekluZGV4OiAoaW5kZXggPT09IDApID8gMiA6IDAgLy8gRmlyc3QgaW1hZ2Ugc2hvdWxkIGJlIG9uIHRvcFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXMucHVzaCgkaW1hZ2UpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0byBiaW5kIGludGVyYWN0aXZpdHlcclxuICAgIHRoaXMuX251bUltYWdlcyA9IHRoaXMuXyRpbWFnZXMubGVuZ3RoO1xyXG4gICAgaWYgKHRoaXMuX251bUltYWdlcyA8PSAxKSByZXR1cm47XHJcblxyXG4gICAgLy8gQmluZCBldmVudCBsaXN0ZW5lcnNcclxuICAgIHRoaXMuXyRjb250YWluZXIub24oXCJtb3VzZWVudGVyXCIsIHRoaXMuX29uRW50ZXIuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLl8kY29udGFpbmVyLm9uKFwibW91c2VsZWF2ZVwiLCB0aGlzLl9vbkxlYXZlLmJpbmQodGhpcykpO1xyXG5cclxufVxyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXRFbGVtZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuXyRjb250YWluZXIuZ2V0KDApO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXQkRWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLl8kY29udGFpbmVyO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fb25FbnRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIEZpcnN0IHRyYW5zaXRpb24gc2hvdWxkIGhhcHBlbiBwcmV0dHkgc29vbiBhZnRlciBob3ZlcmluZyBpbiBvcmRlclxyXG4gICAgLy8gdG8gY2x1ZSB0aGUgdXNlciBpbnRvIHdoYXQgaXMgaGFwcGVuaW5nXHJcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2FkdmFuY2VTbGlkZXNob3cuYmluZCh0aGlzKSwgNTAwKTtcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX29uTGVhdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBjbGVhckludGVydmFsKHRoaXMuX3RpbWVvdXRJZCk7XHJcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBudWxsO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fYWR2YW5jZVNsaWRlc2hvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX2ltYWdlSW5kZXggKz0gMTtcclxuICAgIHZhciBpO1xyXG5cclxuICAgIC8vIE1vdmUgdGhlIGltYWdlIGZyb20gMiBzdGVwcyBhZ28gZG93biB0byB0aGUgYm90dG9tIHotaW5kZXggYW5kIG1ha2VcclxuICAgIC8vIGl0IGludmlzaWJsZVxyXG4gICAgaWYgKHRoaXMuX251bUltYWdlcyA+PSAzKSB7XHJcbiAgICAgICAgaSA9IHV0aWxpdGllcy53cmFwSW5kZXgodGhpcy5faW1hZ2VJbmRleCAtIDIsIHRoaXMuX251bUltYWdlcyk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlc1tpXS5jc3Moe1xyXG4gICAgICAgICAgICB6SW5kZXg6IDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VzW2ldLnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBNb3ZlIHRoZSBpbWFnZSBmcm9tIDEgc3RlcHMgYWdvIGRvd24gdG8gdGhlIG1pZGRsZSB6LWluZGV4IGFuZCBtYWtlXHJcbiAgICAvLyBpdCBjb21wbGV0ZWx5IHZpc2libGVcclxuICAgIGlmICh0aGlzLl9udW1JbWFnZXMgPj0gMikge1xyXG4gICAgICAgIGkgPSB1dGlsaXRpZXMud3JhcEluZGV4KHRoaXMuX2ltYWdlSW5kZXggLSAxLCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXNbaV0uY3NzKHtcclxuICAgICAgICAgICAgekluZGV4OiAxLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAxXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlc1tpXS52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTW92ZSB0aGUgY3VycmVudCBpbWFnZSB0byB0aGUgdG9wIHotaW5kZXggYW5kIGZhZGUgaXQgaW5cclxuICAgIHRoaXMuX2ltYWdlSW5kZXggPSB1dGlsaXRpZXMud3JhcEluZGV4KHRoaXMuX2ltYWdlSW5kZXgsIHRoaXMuX251bUltYWdlcyk7XHJcbiAgICB0aGlzLl8kaW1hZ2VzW3RoaXMuX2ltYWdlSW5kZXhdLmNzcyh7XHJcbiAgICAgICAgekluZGV4OiAyLFxyXG4gICAgICAgIG9wYWNpdHk6IDBcclxuICAgIH0pO1xyXG4gICAgdGhpcy5fJGltYWdlc1t0aGlzLl9pbWFnZUluZGV4XS52ZWxvY2l0eSh7XHJcbiAgICAgICAgb3BhY2l0eTogMVxyXG4gICAgfSwgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uLCBcImVhc2VJbk91dFF1YWRcIik7XHJcblxyXG4gICAgLy8gU2NoZWR1bGUgbmV4dCB0cmFuc2l0aW9uXHJcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2FkdmFuY2VTbGlkZXNob3cuYmluZCh0aGlzKSxcclxuICAgICAgICB0aGlzLl9zbGlkZXNob3dEZWxheSk7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBCYXNlTG9nb1NrZXRjaDtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBCYXNlTG9nb1NrZXRjaCgkbmF2LCAkbmF2TG9nbywgZm9udFBhdGgpIHtcclxuICAgIHRoaXMuXyRuYXYgPSAkbmF2O1xyXG4gICAgdGhpcy5fJG5hdkxvZ28gPSAkbmF2TG9nbztcclxuICAgIHRoaXMuX2ZvbnRQYXRoID0gZm9udFBhdGg7XHJcblxyXG4gICAgdGhpcy5fdGV4dCA9IHRoaXMuXyRuYXZMb2dvLnRleHQoKTtcclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbiAgICB0aGlzLl9pc01vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgdGhpcy5faXNPdmVyTmF2TG9nbyA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuX3VwZGF0ZVRleHRPZmZzZXQoKTtcclxuICAgIHRoaXMuX3VwZGF0ZVNpemUoKTtcclxuICAgIHRoaXMuX3VwZGF0ZUZvbnRTaXplKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgKHJlbGF0aXZlIHBvc2l0aW9uZWQpIGNvbnRhaW5lciBmb3IgdGhlIHNrZXRjaCBpbnNpZGUgb2YgdGhlXHJcbiAgICAvLyBuYXYsIGJ1dCBtYWtlIHN1cmUgdGhhdCBpdCBpcyBCRUhJTkQgZXZlcnl0aGluZyBlbHNlLiBFdmVudHVhbGx5LCB3ZSB3aWxsXHJcbiAgICAvLyBkcm9wIGp1c3QgdGhlIG5hdiBsb2dvIChub3QgdGhlIG5hdiBsaW5rcyEpIGJlaGluZCB0aGUgY2FudmFzLlxyXG4gICAgdGhpcy5fJGNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKVxyXG4gICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICB0b3A6IFwiMHB4XCIsXHJcbiAgICAgICAgICAgIGxlZnQ6IFwiMHB4XCJcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5wcmVwZW5kVG8odGhpcy5fJG5hdilcclxuICAgICAgICAuaGlkZSgpO1xyXG5cclxuICAgIHRoaXMuX2NyZWF0ZVA1SW5zdGFuY2UoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIG5ldyBwNSBpbnN0YW5jZSBhbmQgYmluZCB0aGUgYXBwcm9wcmlhdGUgY2xhc3MgbWV0aG9kcyB0byB0aGVcclxuICogaW5zdGFuY2UuIFRoaXMgYWxzbyBmaWxscyBpbiB0aGUgcCBwYXJhbWV0ZXIgb24gdGhlIGNsYXNzIG1ldGhvZHMgKHNldHVwLFxyXG4gKiBkcmF3LCBldGMuKSBzbyB0aGF0IHRob3NlIGZ1bmN0aW9ucyBjYW4gYmUgYSBsaXR0bGUgbGVzcyB2ZXJib3NlIDopIFxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9jcmVhdGVQNUluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgbmV3IHA1KGZ1bmN0aW9uKHApIHtcclxuICAgICAgICB0aGlzLl9wID0gcDtcclxuICAgICAgICBwLnByZWxvYWQgPSB0aGlzLl9wcmVsb2FkLmJpbmQodGhpcywgcCk7XHJcbiAgICAgICAgcC5zZXR1cCA9IHRoaXMuX3NldHVwLmJpbmQodGhpcywgcCk7XHJcbiAgICAgICAgcC5kcmF3ID0gdGhpcy5fZHJhdy5iaW5kKHRoaXMsIHApO1xyXG4gICAgfS5iaW5kKHRoaXMpLCB0aGlzLl8kY29udGFpbmVyLmdldCgwKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRmluZCB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgdG9wIGxlZnQgb2YgdGhlIG5hdiB0byB0aGUgYnJhbmQgbG9nbydzIGJhc2VsaW5lLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl91cGRhdGVUZXh0T2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGJhc2VsaW5lRGl2ID0gJChcIjxkaXY+XCIpXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6IFwiaW5saW5lLWJsb2NrXCIsXHJcbiAgICAgICAgICAgIHZlcnRpY2FsQWxpZ246IFwiYmFzZWxpbmVcIlxyXG4gICAgICAgIH0pLnByZXBlbmRUbyh0aGlzLl8kbmF2TG9nbyk7XHJcbiAgICB2YXIgbmF2T2Zmc2V0ID0gdGhpcy5fJG5hdi5vZmZzZXQoKTtcclxuICAgIHZhciBsb2dvQmFzZWxpbmVPZmZzZXQgPSBiYXNlbGluZURpdi5vZmZzZXQoKTtcclxuICAgIHRoaXMuX3RleHRPZmZzZXQgPSB7XHJcbiAgICAgICAgdG9wOiBsb2dvQmFzZWxpbmVPZmZzZXQudG9wIC0gbmF2T2Zmc2V0LnRvcCxcclxuICAgICAgICBsZWZ0OiBsb2dvQmFzZWxpbmVPZmZzZXQubGVmdCAtIG5hdk9mZnNldC5sZWZ0XHJcbiAgICB9O1xyXG4gICAgYmFzZWxpbmVEaXYucmVtb3ZlKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRmluZCB0aGUgYm91bmRpbmcgYm94IG9mIHRoZSBicmFuZCBsb2dvIGluIHRoZSBuYXYuIFRoaXMgYmJveCBjYW4gdGhlbiBiZSBcclxuICogdXNlZCB0byBjb250cm9sIHdoZW4gdGhlIGN1cnNvciBzaG91bGQgYmUgYSBwb2ludGVyLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9jYWxjdWxhdGVOYXZMb2dvQm91bmRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG5hdk9mZnNldCA9IHRoaXMuXyRuYXYub2Zmc2V0KCk7XHJcbiAgICB2YXIgbG9nb09mZnNldCA9IHRoaXMuXyRuYXZMb2dvLm9mZnNldCgpO1xyXG4gICAgdGhpcy5fbG9nb0Jib3ggPSB7XHJcbiAgICAgICAgeTogbG9nb09mZnNldC50b3AgLSBuYXZPZmZzZXQudG9wLFxyXG4gICAgICAgIHg6IGxvZ29PZmZzZXQubGVmdCAtIG5hdk9mZnNldC5sZWZ0LFxyXG4gICAgICAgIHc6IHRoaXMuXyRuYXZMb2dvLm91dGVyV2lkdGgoKSwgLy8gRXhjbHVkZSBtYXJnaW4gZnJvbSB0aGUgYmJveFxyXG4gICAgICAgIGg6IHRoaXMuXyRuYXZMb2dvLm91dGVySGVpZ2h0KCkgLy8gTGlua3MgYXJlbid0IGNsaWNrYWJsZSBvbiBtYXJnaW5cclxuICAgIH07XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBkaW1lbnNpb25zIHRvIG1hdGNoIHRoZSBuYXYgLSBleGNsdWRpbmcgYW55IG1hcmdpbiwgcGFkZGluZyAmIFxyXG4gKiBib3JkZXIuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3VwZGF0ZVNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl93aWR0aCA9IHRoaXMuXyRuYXYuaW5uZXJXaWR0aCgpO1xyXG4gICAgdGhpcy5faGVpZ2h0ID0gdGhpcy5fJG5hdi5pbm5lckhlaWdodCgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdyYWIgdGhlIGZvbnQgc2l6ZSBmcm9tIHRoZSBicmFuZCBsb2dvIGxpbmsuIFRoaXMgbWFrZXMgdGhlIGZvbnQgc2l6ZSBvZiB0aGVcclxuICogc2tldGNoIHJlc3BvbnNpdmUuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3VwZGF0ZUZvbnRTaXplID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fZm9udFNpemUgPSB0aGlzLl8kbmF2TG9nby5jc3MoXCJmb250U2l6ZVwiKS5yZXBsYWNlKFwicHhcIiwgXCJcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogV2hlbiB0aGUgYnJvd3NlciBpcyByZXNpemVkLCByZWNhbGN1bGF0ZSBhbGwgdGhlIG5lY2Vzc2FyeSBzdGF0cyBzbyB0aGF0IHRoZVxyXG4gKiBza2V0Y2ggY2FuIGJlIHJlc3BvbnNpdmUuIFRoZSBsb2dvIGluIHRoZSBza2V0Y2ggc2hvdWxkIEFMV0FZUyBleGFjdGx5IG1hdGNoXHJcbiAqIHRoZSBicmFuZyBsb2dvIGxpbmsgdGhlIEhUTUwuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHRoaXMuX3VwZGF0ZVNpemUoKTtcclxuICAgIHRoaXMuX3VwZGF0ZUZvbnRTaXplKCk7XHJcbiAgICB0aGlzLl91cGRhdGVUZXh0T2Zmc2V0KCk7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVOYXZMb2dvQm91bmRzKCk7XHJcbiAgICBwLnJlc2l6ZUNhbnZhcyh0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIF9pc01vdXNlT3ZlciBwcm9wZXJ0eS4gXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldE1vdXNlT3ZlciA9IGZ1bmN0aW9uIChpc01vdXNlT3Zlcikge1xyXG4gICAgdGhpcy5faXNNb3VzZU92ZXIgPSBpc01vdXNlT3ZlcjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBJZiB0aGUgY3Vyc29yIGlzIHNldCB0byBhIHBvaW50ZXIsIGZvcndhcmQgYW55IGNsaWNrIGV2ZW50cyB0byB0aGUgbmF2IGxvZ28uXHJcbiAqIFRoaXMgcmVkdWNlcyB0aGUgbmVlZCBmb3IgdGhlIGNhbnZhcyB0byBkbyBhbnkgQUpBWC15IHN0dWZmLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vbkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICh0aGlzLl9pc092ZXJOYXZMb2dvKSB0aGlzLl8kbmF2TG9nby50cmlnZ2VyKGUpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgcHJlbG9hZCBtZXRob2QgdGhhdCBqdXN0IGxvYWRzIHRoZSBuZWNlc3NhcnkgZm9udFxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9wcmVsb2FkID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHRoaXMuX2ZvbnQgPSBwLmxvYWRGb250KHRoaXMuX2ZvbnRQYXRoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlIHNldHVwIG1ldGhvZCB0aGF0IGRvZXMgc29tZSBoZWF2eSBsaWZ0aW5nLiBJdCBoaWRlcyB0aGUgbmF2IGJyYW5kIGxvZ29cclxuICogYW5kIHJldmVhbHMgdGhlIGNhbnZhcy4gSXQgYWxzbyBzZXRzIHVwIGEgbG90IG9mIHRoZSBpbnRlcm5hbCB2YXJpYWJsZXMgYW5kXHJcbiAqIGNhbnZhcyBldmVudHMuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldHVwID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHZhciByZW5kZXJlciA9IHAuY3JlYXRlQ2FudmFzKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQpO1xyXG4gICAgdGhpcy5fJGNhbnZhcyA9ICQocmVuZGVyZXIuY2FudmFzKTtcclxuXHJcbiAgICAvLyBTaG93IHRoZSBjYW52YXMgYW5kIGhpZGUgdGhlIGxvZ28uIFVzaW5nIHNob3cvaGlkZSBvbiB0aGUgbG9nbyB3aWxsIGNhdXNlXHJcbiAgICAvLyBqUXVlcnkgdG8gbXVjayB3aXRoIHRoZSBwb3NpdGlvbmluZywgd2hpY2ggaXMgdXNlZCB0byBjYWxjdWxhdGUgd2hlcmUgdG9cclxuICAgIC8vIGRyYXcgdGhlIGNhbnZhcyB0ZXh0LiBJbnN0ZWFkLCBqdXN0IHB1c2ggdGhlIGxvZ28gYmVoaW5kIHRoZSBjYW52YXMuIFRoaXNcclxuICAgIC8vIGFsbG93cyBtYWtlcyBpdCBzbyB0aGUgY2FudmFzIGlzIHN0aWxsIGJlaGluZCB0aGUgbmF2IGxpbmtzLlxyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5zaG93KCk7XHJcbiAgICB0aGlzLl8kbmF2TG9nby5jc3MoXCJ6SW5kZXhcIiwgLTEpO1xyXG5cclxuICAgIC8vIFRoZXJlIGlzbid0IGEgZ29vZCB3YXkgdG8gY2hlY2sgd2hldGhlciB0aGUgc2tldGNoIGhhcyB0aGUgbW91c2Ugb3ZlclxyXG4gICAgLy8gaXQuIHAubW91c2VYICYgcC5tb3VzZVkgYXJlIGluaXRpYWxpemVkIHRvICgwLCAwKSwgYW5kIHAuZm9jdXNlZCBpc24ndCBcclxuICAgIC8vIGFsd2F5cyByZWxpYWJsZS5cclxuICAgIHRoaXMuXyRjYW52YXMub24oXCJtb3VzZW92ZXJcIiwgdGhpcy5fc2V0TW91c2VPdmVyLmJpbmQodGhpcywgdHJ1ZSkpO1xyXG4gICAgdGhpcy5fJGNhbnZhcy5vbihcIm1vdXNlb3V0XCIsIHRoaXMuX3NldE1vdXNlT3Zlci5iaW5kKHRoaXMsIGZhbHNlKSk7XHJcblxyXG4gICAgLy8gRm9yd2FyZCBtb3VzZSBjbGlja3MgdG8gdGhlIG5hdiBsb2dvXHJcbiAgICB0aGlzLl8kY2FudmFzLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSB3aW5kb3cgaXMgcmVzaXplZCwgdGV4dCAmIGNhbnZhcyBzaXppbmcgYW5kIHBsYWNlbWVudCBuZWVkIHRvIGJlXHJcbiAgICAvLyByZWNhbGN1bGF0ZWQuIFRoZSBzaXRlIGlzIHJlc3BvbnNpdmUsIHNvIHRoZSBpbnRlcmFjdGl2ZSBjYW52YXMgc2hvdWxkIGJlXHJcbiAgICAvLyB0b28hIFxyXG4gICAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcywgcCkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgZHJhdyBtZXRob2QgdGhhdCBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgY3Vyc29yIGlzIGEgcG9pbnRlci4gSXRcclxuICogc2hvdWxkIG9ubHkgYmUgYSBwb2ludGVyIHdoZW4gdGhlIG1vdXNlIGlzIG92ZXIgdGhlIG5hdiBicmFuZCBsb2dvLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24gKHApIHtcclxuICAgIGlmICh0aGlzLl9pc01vdXNlT3Zlcikge1xyXG4gICAgICAgIHZhciBpc092ZXJMb2dvID0gdXRpbHMuaXNJblJlY3QocC5tb3VzZVgsIHAubW91c2VZLCB0aGlzLl9sb2dvQmJveCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc092ZXJOYXZMb2dvICYmIGlzT3ZlckxvZ28pIHtcclxuICAgICAgICAgICAgdGhpcy5faXNPdmVyTmF2TG9nbyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuXyRjYW52YXMuY3NzKFwiY3Vyc29yXCIsIFwicG9pbnRlclwiKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzT3Zlck5hdkxvZ28gJiYgIWlzT3ZlckxvZ28pIHtcclxuICAgICAgICAgICAgdGhpcy5faXNPdmVyTmF2TG9nbyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl8kY2FudmFzLmNzcyhcImN1cnNvclwiLCBcImluaXRpYWxcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gU2tldGNoO1xyXG5cclxudmFyIEJib3hUZXh0ID0gcmVxdWlyZShcInA1LWJib3gtYWxpZ25lZC10ZXh0XCIpO1xyXG52YXIgQmFzZUxvZ29Ta2V0Y2ggPSByZXF1aXJlKFwiLi9iYXNlLWxvZ28tc2tldGNoLmpzXCIpO1xyXG52YXIgU2luR2VuZXJhdG9yID0gcmVxdWlyZShcIi4vZ2VuZXJhdG9ycy9zaW4tZ2VuZXJhdG9yLmpzXCIpO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZSk7XHJcblxyXG5mdW5jdGlvbiBTa2V0Y2goJG5hdiwgJG5hdkxvZ28pIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLmNhbGwodGhpcywgJG5hdiwgJG5hdkxvZ28sIFwiLi4vZm9udHMvYmlnX2pvaG4td2ViZm9udC50dGZcIik7XHJcbn1cclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUuY2FsbCh0aGlzLCBwKTtcclxuICAgIHRoaXMuX3NwYWNpbmcgPSB1dGlscy5tYXAodGhpcy5fZm9udFNpemUsIDIwLCA0MCwgMiwgNSwge2NsYW1wOiB0cnVlLFxyXG4gICAgICAgIHJvdW5kOiB0cnVlfSk7XHJcbiAgICAvLyBVcGRhdGUgdGhlIGJib3hUZXh0LCBwbGFjZSBvdmVyIHRoZSBuYXYgdGV4dCBsb2dvIGFuZCB0aGVuIHNoaWZ0IGl0c1xyXG4gICAgLy8gYW5jaG9yIGJhY2sgdG8gKGNlbnRlciwgY2VudGVyKSB3aGlsZSBwcmVzZXJ2aW5nIHRoZSB0ZXh0IHBvc2l0aW9uXHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRUZXh0KHRoaXMuX3RleHQpXHJcbiAgICAgICAgLnNldFRleHRTaXplKHRoaXMuX2ZvbnRTaXplKVxyXG4gICAgICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0xFRlQsIEJib3hUZXh0LkJBU0VMSU5FLkFMUEhBQkVUSUMpXHJcbiAgICAgICAgLnNldFBvc2l0aW9uKHRoaXMuX3RleHRPZmZzZXQubGVmdCwgdGhpcy5fdGV4dE9mZnNldC50b3ApXHJcbiAgICAgICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfQ0VOVEVSLCBCYm94VGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSLFxyXG4gICAgICAgICAgICB0cnVlKTtcclxuICAgIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuICAgIHRoaXMuX3BvaW50cyA9IHRoaXMuX2Jib3hUZXh0LmdldFRleHRQb2ludHMoKTtcclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3U3RhdGlvbmFyeUxvZ28gPSBmdW5jdGlvbiAocCkge1xyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICBwLnN0cm9rZSgyNTUpO1xyXG4gICAgcC5maWxsKFwiIzBBMDAwQVwiKTtcclxuICAgIHAuc3Ryb2tlV2VpZ2h0KDIpO1xyXG4gICAgdGhpcy5fYmJveFRleHQuZHJhdygpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fc2V0dXAgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cC5jYWxsKHRoaXMsIHApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIEJib3hBbGlnbmVkVGV4dCBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZHJhd2luZyBhbmRcclxuICAgIC8vIHJvdGF0aW5nIHRleHRcclxuICAgIHRoaXMuX2Jib3hUZXh0ID0gbmV3IEJib3hUZXh0KHRoaXMuX2ZvbnQsIHRoaXMuX3RleHQsIHRoaXMuX2ZvbnRTaXplLCAwLCAwLFxyXG4gICAgICAgIHApO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgaW5pdGlhbCBzZXR1cCBieSB0cmlnZ2VyaW5nIGEgcmVzaXplXHJcbiAgICB0aGlzLl9vblJlc2l6ZShwKTtcclxuXHJcbiAgICAvLyBEcmF3IHRoZSBzdGF0aW9uYXJ5IGxvZ29cclxuICAgIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuXHJcbiAgICAvLyBTdGFydCB0aGUgc2luIGdlbmVyYXRvciBhdCBpdHMgbWF4IHZhbHVlXHJcbiAgICB0aGlzLl90aHJlc2hvbGRHZW5lcmF0b3IgPSBuZXcgU2luR2VuZXJhdG9yKHAsIDAsIDEsIDAuMDIsIHAuUEkvMik7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fZHJhdy5jYWxsKHRoaXMsIHApO1xyXG4gICAgaWYgKCF0aGlzLl9pc01vdXNlT3ZlciB8fCAhdGhpcy5faXNPdmVyTmF2TG9nbykgcmV0dXJuO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHRleHQgaXMgYWJvdXQgdG8gYmVjb21lIGFjdGl2ZSBmb3IgdGhlIGZpcnN0IHRpbWUsIGNsZWFyXHJcbiAgICAvLyB0aGUgc3RhdGlvbmFyeSBsb2dvIHRoYXQgd2FzIHByZXZpb3VzbHkgZHJhd24uXHJcbiAgICBpZiAodGhpcy5faXNGaXJzdEZyYW1lKSB7XHJcbiAgICAgICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICAgICAgdGhpcy5faXNGaXJzdEZyYW1lID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX2ZvbnRTaXplID4gMzApIHtcclxuICAgICAgICB0aGlzLl90aHJlc2hvbGRHZW5lcmF0b3Iuc2V0Qm91bmRzKDAuMiAqIHRoaXMuX2Jib3hUZXh0LmhlaWdodCxcclxuICAgICAgICAgICAgMC40NyAqIHRoaXMuX2Jib3hUZXh0LmhlaWdodCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuX3RocmVzaG9sZEdlbmVyYXRvci5zZXRCb3VuZHMoMC4yICogdGhpcy5fYmJveFRleHQuaGVpZ2h0LFxyXG4gICAgICAgICAgICAwLjYgKiB0aGlzLl9iYm94VGV4dC5oZWlnaHQpO1xyXG4gICAgfVxyXG4gICAgdmFyIGRpc3RhbmNlVGhyZXNob2xkID0gdGhpcy5fdGhyZXNob2xkR2VuZXJhdG9yLmdlbmVyYXRlKCk7XHJcblxyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSwgMTAwKTtcclxuICAgIHAuc3Ryb2tlV2VpZ2h0KDEpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9wb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgcG9pbnQxID0gdGhpcy5fcG9pbnRzW2ldO1xyXG4gICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IHRoaXMuX3BvaW50cy5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgICAgICB2YXIgcG9pbnQyID0gdGhpcy5fcG9pbnRzW2pdO1xyXG4gICAgICAgICAgICB2YXIgZGlzdCA9IHAuZGlzdChwb2ludDEueCwgcG9pbnQxLnksIHBvaW50Mi54LCBwb2ludDIueSk7XHJcbiAgICAgICAgICAgIGlmIChkaXN0IDwgZGlzdGFuY2VUaHJlc2hvbGQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBwLm5vU3Ryb2tlKCk7XHJcbiAgICAgICAgICAgICAgICBwLmZpbGwoXCJyZ2JhKDE2NSwgMCwgMTczLCAwLjI1KVwiKTtcclxuICAgICAgICAgICAgICAgIHAuZWxsaXBzZSgocG9pbnQxLnggKyBwb2ludDIueCkgLyAyLCAocG9pbnQxLnkgKyBwb2ludDIueSkgLyAyLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3QsIGRpc3QpO1xyXG5cclxuICAgICAgICAgICAgICAgIHAuc3Ryb2tlKFwicmdiYSgxNjUsIDAsIDE3MywgMC4yNSlcIik7XHJcbiAgICAgICAgICAgICAgICBwLm5vRmlsbCgpO1xyXG4gICAgICAgICAgICAgICAgcC5saW5lKHBvaW50MS54LCBwb2ludDEueSwgcG9pbnQyLngsIHBvaW50Mi55KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIE5vaXNlR2VuZXJhdG9yMUQ6IE5vaXNlR2VuZXJhdG9yMUQsXHJcbiAgICBOb2lzZUdlbmVyYXRvcjJEOiBOb2lzZUdlbmVyYXRvcjJEXHJcbn07XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuLy8gLS0gMUQgTm9pc2UgR2VuZXJhdG9yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBBIHV0aWxpdHkgY2xhc3MgZm9yIGdlbmVyYXRpbmcgbm9pc2UgdmFsdWVzXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge29iamVjdH0gcCAgICAgICAgICAgICAgIFJlZmVyZW5jZSB0byBhIHA1IHNrZXRjaFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW21pbj0wXSAgICAgICAgIE1pbmltdW0gdmFsdWUgZm9yIHRoZSBub2lzZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW21heD0xXSAgICAgICAgIE1heGltdW0gdmFsdWUgZm9yIHRoZSBub2lzZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW2luY3JlbWVudD0wLjFdIFNjYWxlIG9mIHRoZSBub2lzZSwgdXNlZCB3aGVuIHVwZGF0aW5nXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb2Zmc2V0PXJhbmRvbV0gQSB2YWx1ZSB1c2VkIHRvIGVuc3VyZSBtdWx0aXBsZSBub2lzZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRvcnMgYXJlIHJldHVybmluZyBcImluZGVwZW5kZW50XCIgdmFsdWVzXHJcbiAqL1xyXG5mdW5jdGlvbiBOb2lzZUdlbmVyYXRvcjFEKHAsIG1pbiwgbWF4LCBpbmNyZW1lbnQsIG9mZnNldCkge1xyXG4gICAgdGhpcy5fcCA9IHA7XHJcbiAgICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgMCk7XHJcbiAgICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgMSk7XHJcbiAgICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGluY3JlbWVudCwgMC4xKTtcclxuICAgIHRoaXMuX3Bvc2l0aW9uID0gdXRpbHMuZGVmYXVsdChvZmZzZXQsIHAucmFuZG9tKC0xMDAwMDAwLCAxMDAwMDAwKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG1pbiBhbmQgbWF4IG5vaXNlIHZhbHVlc1xyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IG1pbiBNaW5pbXVtIG5vaXNlIHZhbHVlXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWF4IE1heGltdW0gbm9pc2UgdmFsdWVcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xyXG4gICAgdGhpcy5fbWluID0gdXRpbHMuZGVmYXVsdChtaW4sIHRoaXMuX21pbik7XHJcbiAgICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgdGhpcy5fbWF4KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG5vaXNlIGluY3JlbWVudCAoZS5nLiBzY2FsZSlcclxuICogQHBhcmFtICB7bnVtYmVyfSBpbmNyZW1lbnQgTmV3IGluY3JlbWVudCAoc2NhbGUpIHZhbHVlXHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjFELnByb3RvdHlwZS5zZXRJbmNyZW1lbnQgPSBmdW5jdGlvbiAoaW5jcmVtZW50KSB7XHJcbiAgICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGluY3JlbWVudCwgdGhpcy5faW5jcmVtZW50KTtcclxufTtcclxuXHJcbi8qKiBcclxuICogR2VuZXJhdGUgdGhlIG5leHQgbm9pc2UgdmFsdWVcclxuICogQHJldHVybiB7bnVtYmVyfSBBIG5vaXN5IHZhbHVlIGJldHdlZW4gb2JqZWN0J3MgbWluIGFuZCBtYXhcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICB2YXIgbiA9IHRoaXMuX3Aubm9pc2UodGhpcy5fcG9zaXRpb24pO1xyXG4gICAgbiA9IHRoaXMuX3AubWFwKG4sIDAsIDEsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcclxuICAgIHJldHVybiBuO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEludGVybmFsIHVwZGF0ZSBtZXRob2QgZm9yIGdlbmVyYXRpbmcgbmV4dCBub2lzZSB2YWx1ZVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IxRC5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX3Bvc2l0aW9uICs9IHRoaXMuX2luY3JlbWVudDtcclxufTtcclxuXHJcblxyXG4vLyAtLSAyRCBOb2lzZSBHZW5lcmF0b3IgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZnVuY3Rpb24gTm9pc2VHZW5lcmF0b3IyRChwLCB4TWluLCB4TWF4LCB5TWluLCB5TWF4LCB4SW5jcmVtZW50LCB5SW5jcmVtZW50LCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB4T2Zmc2V0LCB5T2Zmc2V0KSB7XHJcbiAgICB0aGlzLl94Tm9pc2UgPSBuZXcgTm9pc2VHZW5lcmF0b3IxRChwLCB4TWluLCB4TWF4LCB4SW5jcmVtZW50LCB4T2Zmc2V0KTtcclxuICAgIHRoaXMuX3lOb2lzZSA9IG5ldyBOb2lzZUdlbmVyYXRvcjFEKHAsIHlNaW4sIHlNYXgsIHlJbmNyZW1lbnQsIHlPZmZzZXQpO1xyXG4gICAgdGhpcy5fcCA9IHA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG1pbiBhbmQgbWF4IG5vaXNlIHZhbHVlc1xyXG4gKiBAcGFyYW0gIHtvYmplY3R9IG9wdGlvbnMgT2JqZWN0IHdpdGggYm91bmRzIHRvIGJlIHVwZGF0ZWQgZS5nLiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHsgeE1pbjogMCwgeE1heDogMSwgeU1pbjogLTEsIHlNYXg6IDEgfVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IyRC5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgIGlmICghb3B0aW9ucykgcmV0dXJuOyAgXHJcbiAgICB0aGlzLl94Tm9pc2Uuc2V0Qm91bmRzKG9wdGlvbnMueE1pbiwgb3B0aW9ucy54TWF4KTtcclxuICAgIHRoaXMuX3lOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy55TWluLCBvcHRpb25zLnlNYXgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgaW5jcmVtZW50IChlLmcuIHNjYWxlKSBmb3IgdGhlIG5vaXNlIGdlbmVyYXRvclxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IG9wdGlvbnMgT2JqZWN0IHdpdGggYm91bmRzIHRvIGJlIHVwZGF0ZWQgZS5nLiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHsgeEluY3JlbWVudDogMC4wNSwgeUluY3JlbWVudDogMC4xIH1cclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMkQucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICBpZiAoIW9wdGlvbnMpIHJldHVybjtcclxuICAgIHRoaXMuX3hOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy54SW5jcmVtZW50KTtcclxuICAgIHRoaXMuX3lOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy55SW5jcmVtZW50KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZSB0aGUgbmV4dCBwYWlyIG9mIG5vaXNlIHZhbHVlc1xyXG4gKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCB3aXRoIHggYW5kIHkgcHJvcGVydGllcyB0aGF0IGNvbnRhaW4gdGhlIG5leHQgbm9pc2VcclxuICogICAgICAgICAgICAgICAgICB2YWx1ZXMgYWxvbmcgZWFjaCBkaW1lbnNpb25cclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMkQucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiB0aGlzLl94Tm9pc2UuZ2VuZXJhdGUoKSxcclxuICAgICAgICB5OiB0aGlzLl95Tm9pc2UuZ2VuZXJhdGUoKVxyXG4gICAgfTtcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IFNpbkdlbmVyYXRvcjtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG4vKipcclxuICogQSB1dGlsaXR5IGNsYXNzIGZvciBnZW5lcmF0aW5nIHZhbHVlcyBhbG9uZyBhIHNpbndhdmVcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwICAgICAgICAgICAgICAgUmVmZXJlbmNlIHRvIGEgcDUgc2tldGNoXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWluPTBdICAgICAgICAgTWluaW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWF4PTFdICAgICAgICAgTWF4aW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbaW5jcmVtZW50PTAuMV0gSW5jcmVtZW50IHVzZWQgd2hlbiB1cGRhdGluZ1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW29mZnNldD1yYW5kb21dIFdoZXJlIHRvIHN0YXJ0IGFsb25nIHRoZSBzaW5ld2F2ZVxyXG4gKi9cclxuZnVuY3Rpb24gU2luR2VuZXJhdG9yKHAsIG1pbiwgbWF4LCBhbmdsZUluY3JlbWVudCwgc3RhcnRpbmdBbmdsZSkge1xyXG4gICAgdGhpcy5fcCA9IHA7XHJcbiAgICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgMCk7XHJcbiAgICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgMCk7XHJcbiAgICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGFuZ2xlSW5jcmVtZW50LCAwLjEpO1xyXG4gICAgdGhpcy5fYW5nbGUgPSB1dGlscy5kZWZhdWx0KHN0YXJ0aW5nQW5nbGUsIHAucmFuZG9tKC0xMDAwMDAwLCAxMDAwMDAwKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG1pbiBhbmQgbWF4IHZhbHVlc1xyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IG1pbiBNaW5pbXVtIHZhbHVlXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWF4IE1heGltdW0gdmFsdWVcclxuICovXHJcblNpbkdlbmVyYXRvci5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XHJcbiAgICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgdGhpcy5fbWluKTtcclxuICAgIHRoaXMuX21heCA9IHV0aWxzLmRlZmF1bHQobWF4LCB0aGlzLl9tYXgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgYW5nbGUgaW5jcmVtZW50IChlLmcuIGhvdyBmYXN0IHdlIG1vdmUgdGhyb3VnaCB0aGUgc2lud2F2ZSlcclxuICogQHBhcmFtICB7bnVtYmVyfSBpbmNyZW1lbnQgTmV3IGluY3JlbWVudCB2YWx1ZVxyXG4gKi9cclxuU2luR2VuZXJhdG9yLnByb3RvdHlwZS5zZXRJbmNyZW1lbnQgPSBmdW5jdGlvbiAoaW5jcmVtZW50KSB7XHJcbiAgICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGluY3JlbWVudCwgdGhpcy5faW5jcmVtZW50KTtcclxufTtcclxuXHJcbi8qKiBcclxuICogR2VuZXJhdGUgdGhlIG5leHQgdmFsdWVcclxuICogQHJldHVybiB7bnVtYmVyfSBBIHZhbHVlIGJldHdlZW4gZ2VuZXJhdG9ycydzIG1pbiBhbmQgbWF4XHJcbiAqL1xyXG5TaW5HZW5lcmF0b3IucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICB2YXIgbiA9IHRoaXMuX3Auc2luKHRoaXMuX2FuZ2xlKTtcclxuICAgIG4gPSB0aGlzLl9wLm1hcChuLCAtMSwgMSwgdGhpcy5fbWluLCB0aGlzLl9tYXgpO1xyXG4gICAgcmV0dXJuIG47XHJcbn07XHJcblxyXG4vKipcclxuICogSW50ZXJuYWwgdXBkYXRlIG1ldGhvZCBmb3IgZ2VuZXJhdGluZyBuZXh0IHZhbHVlXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5TaW5HZW5lcmF0b3IucHJvdG90eXBlLl91cGRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9hbmdsZSArPSB0aGlzLl9pbmNyZW1lbnQ7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBTa2V0Y2g7XHJcblxyXG52YXIgQmJveFRleHQgPSByZXF1aXJlKFwicDUtYmJveC1hbGlnbmVkLXRleHRcIik7XHJcbnZhciBCYXNlTG9nb1NrZXRjaCA9IHJlcXVpcmUoXCIuL2Jhc2UtbG9nby1za2V0Y2guanNcIik7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuU2tldGNoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlKTtcclxuXHJcbmZ1bmN0aW9uIFNrZXRjaCgkbmF2LCAkbmF2TG9nbykge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2guY2FsbCh0aGlzLCAkbmF2LCAkbmF2TG9nbywgXCIuLi9mb250cy9iaWdfam9obi13ZWJmb250LnR0ZlwiKTtcclxufVxyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZS5jYWxsKHRoaXMsIHApO1xyXG4gICAgdGhpcy5fc3BhY2luZyA9IHV0aWxzLm1hcCh0aGlzLl9mb250U2l6ZSwgMjAsIDQwLCAyLCA1LCB7Y2xhbXA6IHRydWUsIFxyXG4gICAgICAgIHJvdW5kOiB0cnVlfSk7XHJcbiAgICAvLyBVcGRhdGUgdGhlIGJib3hUZXh0LCBwbGFjZSBvdmVyIHRoZSBuYXYgdGV4dCBsb2dvIGFuZCB0aGVuIHNoaWZ0IGl0cyBcclxuICAgIC8vIGFuY2hvciBiYWNrIHRvIChjZW50ZXIsIGNlbnRlcikgd2hpbGUgcHJlc2VydmluZyB0aGUgdGV4dCBwb3NpdGlvblxyXG4gICAgdGhpcy5fYmJveFRleHQuc2V0VGV4dCh0aGlzLl90ZXh0KVxyXG4gICAgICAgIC5zZXRUZXh0U2l6ZSh0aGlzLl9mb250U2l6ZSlcclxuICAgICAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9MRUZULCBCYm94VGV4dC5CQVNFTElORS5BTFBIQUJFVElDKVxyXG4gICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLl90ZXh0T2Zmc2V0LmxlZnQsIHRoaXMuX3RleHRPZmZzZXQudG9wKVxyXG4gICAgICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0NFTlRFUiwgQmJveFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUiwgXHJcbiAgICAgICAgICAgIHRydWUpO1xyXG4gICAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlQ2lyY2xlcyhwKTtcclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3U3RhdGlvbmFyeUxvZ28gPSBmdW5jdGlvbiAocCkge1xyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICBwLnN0cm9rZSgyNTUpO1xyXG4gICAgcC5maWxsKFwiIzBBMDAwQVwiKTtcclxuICAgIHAuc3Ryb2tlV2VpZ2h0KDIpO1xyXG4gICAgdGhpcy5fYmJveFRleHQuZHJhdygpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fc2V0dXAgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cC5jYWxsKHRoaXMsIHApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIEJib3hBbGlnbmVkVGV4dCBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZHJhd2luZyBhbmQgXHJcbiAgICAvLyByb3RhdGluZyB0ZXh0XHJcbiAgICB0aGlzLl9iYm94VGV4dCA9IG5ldyBCYm94VGV4dCh0aGlzLl9mb250LCB0aGlzLl90ZXh0LCB0aGlzLl9mb250U2l6ZSwgMCwgMCwgXHJcbiAgICAgICAgcCk7XHJcblxyXG4gICAgLy8gSGFuZGxlIHRoZSBpbml0aWFsIHNldHVwIGJ5IHRyaWdnZXJpbmcgYSByZXNpemVcclxuICAgIHRoaXMuX29uUmVzaXplKHApO1xyXG5cclxuICAgIC8vIERyYXcgdGhlIHN0YXRpb25hcnkgbG9nb1xyXG4gICAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG5cclxuICAgIHRoaXMuX2NhbGN1bGF0ZUNpcmNsZXMocCk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9jYWxjdWxhdGVDaXJjbGVzID0gZnVuY3Rpb24gKHApIHtcclxuICAgIC8vIFRPRE86IERvbid0IG5lZWQgQUxMIHRoZSBwaXhlbHMuIFRoaXMgY291bGQgaGF2ZSBhbiBvZmZzY3JlZW4gcmVuZGVyZXJcclxuICAgIC8vIHRoYXQgaXMganVzdCBiaWcgZW5vdWdoIHRvIGZpdCB0aGUgdGV4dC5cclxuICAgIC8vIExvb3Agb3ZlciB0aGUgcGl4ZWxzIGluIHRoZSB0ZXh0J3MgYm91bmRpbmcgYm94IHRvIHNhbXBsZSB0aGUgd29yZFxyXG4gICAgdmFyIGJib3ggPSB0aGlzLl9iYm94VGV4dC5nZXRCYm94KCk7XHJcbiAgICB2YXIgc3RhcnRYID0gTWF0aC5mbG9vcihNYXRoLm1heChiYm94LnggLSA1LCAwKSk7XHJcbiAgICB2YXIgZW5kWCA9IE1hdGguY2VpbChNYXRoLm1pbihiYm94LnggKyBiYm94LncgKyA1LCBwLndpZHRoKSk7XHJcbiAgICB2YXIgc3RhcnRZID0gTWF0aC5mbG9vcihNYXRoLm1heChiYm94LnkgLSA1LCAwKSk7XHJcbiAgICB2YXIgZW5kWSA9IE1hdGguY2VpbChNYXRoLm1pbihiYm94LnkgKyBiYm94LmggKyA1LCBwLmhlaWdodCkpO1xyXG4gICAgcC5sb2FkUGl4ZWxzKCk7XHJcbiAgICBwLnBpeGVsRGVuc2l0eSgxKTtcclxuICAgIHRoaXMuX2NpcmNsZXMgPSBbXTtcclxuICAgIGZvciAodmFyIHkgPSBzdGFydFk7IHkgPCBlbmRZOyB5ICs9IHRoaXMuX3NwYWNpbmcpIHtcclxuICAgICAgICBmb3IgKHZhciB4ID0gc3RhcnRYOyB4IDwgZW5kWDsgeCArPSB0aGlzLl9zcGFjaW5nKSB7ICBcclxuICAgICAgICAgICAgdmFyIGkgPSA0ICogKCh5ICogcC53aWR0aCkgKyB4KTtcclxuICAgICAgICAgICAgdmFyIHIgPSBwLnBpeGVsc1tpXTtcclxuICAgICAgICAgICAgdmFyIGcgPSBwLnBpeGVsc1tpICsgMV07XHJcbiAgICAgICAgICAgIHZhciBiID0gcC5waXhlbHNbaSArIDJdO1xyXG4gICAgICAgICAgICB2YXIgYSA9IHAucGl4ZWxzW2kgKyAzXTtcclxuICAgICAgICAgICAgdmFyIGMgPSBwLmNvbG9yKHIsIGcsIGIsIGEpO1xyXG4gICAgICAgICAgICBpZiAocC5zYXR1cmF0aW9uKGMpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2lyY2xlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4ICsgcC5yYW5kb20oLTIvMyAqIHRoaXMuX3NwYWNpbmcsIDIvMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHkgKyBwLnJhbmRvbSgtMi8zICogdGhpcy5fc3BhY2luZywgMi8zICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IHAuY29sb3IoXCIjMDZGRkZGXCIpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NpcmNsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeCArIHAucmFuZG9tKC0yLzMgKiB0aGlzLl9zcGFjaW5nLCAyLzMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgICAgICAgICAgICB5OiB5ICsgcC5yYW5kb20oLTIvMyAqIHRoaXMuX3NwYWNpbmcsIDIvMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBwLmNvbG9yKFwiI0ZFMDBGRVwiKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jaXJjbGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHggKyBwLnJhbmRvbSgtMi8zICogdGhpcy5fc3BhY2luZywgMi8zICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogeSArIHAucmFuZG9tKC0yLzMgKiB0aGlzLl9zcGFjaW5nLCAyLzMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogcC5jb2xvcihcIiNGRkZGMDRcIilcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhdyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2RyYXcuY2FsbCh0aGlzLCBwKTtcclxuICAgIGlmICghdGhpcy5faXNNb3VzZU92ZXIgfHwgIXRoaXMuX2lzT3Zlck5hdkxvZ28pIHJldHVybjtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSB0ZXh0IGlzIGFib3V0IHRvIGJlY29tZSBhY3RpdmUgZm9yIHRoZSBmaXJzdCB0aW1lLCBjbGVhclxyXG4gICAgLy8gdGhlIHN0YXRpb25hcnkgbG9nbyB0aGF0IHdhcyBwcmV2aW91c2x5IGRyYXduLiBcclxuICAgIGlmICh0aGlzLl9pc0ZpcnN0RnJhbWUpIHtcclxuICAgICAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgICAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDbGVhclxyXG4gICAgcC5ibGVuZE1vZGUocC5CTEVORCk7XHJcbiAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuXHJcbiAgICAvLyBEcmF3IFwiaGFsZnRvbmVcIiBsb2dvXHJcbiAgICBwLm5vU3Ryb2tlKCk7ICAgXHJcbiAgICBwLmJsZW5kTW9kZShwLk1VTFRJUExZKTtcclxuXHJcbiAgICB2YXIgbWF4RGlzdCA9IHRoaXMuX2Jib3hUZXh0LmhhbGZXaWR0aDtcclxuICAgIHZhciBtYXhSYWRpdXMgPSAyICogdGhpcy5fc3BhY2luZztcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2NpcmNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgY2lyY2xlID0gdGhpcy5fY2lyY2xlc1tpXTtcclxuICAgICAgICB2YXIgYyA9IGNpcmNsZS5jb2xvcjtcclxuICAgICAgICB2YXIgZGlzdCA9IHAuZGlzdChjaXJjbGUueCwgY2lyY2xlLnksIHAubW91c2VYLCBwLm1vdXNlWSk7XHJcbiAgICAgICAgdmFyIHJhZGl1cyA9IHV0aWxzLm1hcChkaXN0LCAwLCBtYXhEaXN0LCAxLCBtYXhSYWRpdXMsIHtjbGFtcDogdHJ1ZX0pO1xyXG4gICAgICAgIHAuZmlsbChjKTtcclxuICAgICAgICBwLmVsbGlwc2UoY2lyY2xlLngsIGNpcmNsZS55LCByYWRpdXMsIHJhZGl1cyk7XHJcbiAgICB9XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBTa2V0Y2g7XHJcblxyXG52YXIgTm9pc2UgPSByZXF1aXJlKFwiLi9nZW5lcmF0b3JzL25vaXNlLWdlbmVyYXRvcnMuanNcIik7XHJcbnZhciBCYm94VGV4dCA9IHJlcXVpcmUoXCJwNS1iYm94LWFsaWduZWQtdGV4dFwiKTtcclxudmFyIEJhc2VMb2dvU2tldGNoID0gcmVxdWlyZShcIi4vYmFzZS1sb2dvLXNrZXRjaC5qc1wiKTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZSk7XHJcblxyXG5mdW5jdGlvbiBTa2V0Y2goJG5hdiwgJG5hdkxvZ28pIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLmNhbGwodGhpcywgJG5hdiwgJG5hdkxvZ28sIFwiLi4vZm9udHMvYmlnX2pvaG4td2ViZm9udC50dGZcIik7XHJcbn1cclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUuY2FsbCh0aGlzLCBwKTtcclxuICAgIC8vIFVwZGF0ZSB0aGUgYmJveFRleHQsIHBsYWNlIG92ZXIgdGhlIG5hdiB0ZXh0IGxvZ28gYW5kIHRoZW4gc2hpZnQgaXRzIFxyXG4gICAgLy8gYW5jaG9yIGJhY2sgdG8gKGNlbnRlciwgY2VudGVyKSB3aGlsZSBwcmVzZXJ2aW5nIHRoZSB0ZXh0IHBvc2l0aW9uXHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRUZXh0KHRoaXMuX3RleHQpXHJcbiAgICAgICAgLnNldFRleHRTaXplKHRoaXMuX2ZvbnRTaXplKVxyXG4gICAgICAgIC5zZXRSb3RhdGlvbigwKVxyXG4gICAgICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0xFRlQsIEJib3hUZXh0LkJBU0VMSU5FLkFMUEhBQkVUSUMpXHJcbiAgICAgICAgLnNldFBvc2l0aW9uKHRoaXMuX3RleHRPZmZzZXQubGVmdCwgdGhpcy5fdGV4dE9mZnNldC50b3ApXHJcbiAgICAgICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfQ0VOVEVSLCBCYm94VGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSLCBcclxuICAgICAgICAgICAgdHJ1ZSk7XHJcbiAgICB0aGlzLl90ZXh0UG9zID0gdGhpcy5fYmJveFRleHQuZ2V0UG9zaXRpb24oKTtcclxuICAgIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3U3RhdGlvbmFyeUxvZ28gPSBmdW5jdGlvbiAocCkge1xyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICBwLnN0cm9rZSgyNTUpO1xyXG4gICAgcC5maWxsKFwiIzBBMDAwQVwiKTtcclxuICAgIHAuc3Ryb2tlV2VpZ2h0KDIpO1xyXG4gICAgdGhpcy5fYmJveFRleHQuZHJhdygpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fc2V0dXAgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cC5jYWxsKHRoaXMsIHApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIEJib3hBbGlnbmVkVGV4dCBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZHJhd2luZyBhbmQgXHJcbiAgICAvLyByb3RhdGluZyB0ZXh0XHJcbiAgICB0aGlzLl9iYm94VGV4dCA9IG5ldyBCYm94VGV4dCh0aGlzLl9mb250LCB0aGlzLl90ZXh0LCB0aGlzLl9mb250U2l6ZSwgMCwgMCwgXHJcbiAgICAgICAgcCk7XHJcblxyXG4gICAgLy8gSGFuZGxlIHRoZSBpbml0aWFsIHNldHVwIGJ5IHRyaWdnZXJpbmcgYSByZXNpemVcclxuICAgIHRoaXMuX29uUmVzaXplKHApO1xyXG5cclxuICAgIC8vIFNldCB1cCBub2lzZSBnZW5lcmF0b3JzXHJcbiAgICB0aGlzLl9yb3RhdGlvbk5vaXNlID0gbmV3IE5vaXNlLk5vaXNlR2VuZXJhdG9yMUQocCwgLXAuUEkvNCwgcC5QSS80LCAwLjAyKTsgXHJcbiAgICB0aGlzLl94eU5vaXNlID0gbmV3IE5vaXNlLk5vaXNlR2VuZXJhdG9yMkQocCwgLTEwMCwgMTAwLCAtNTAsIDUwLCAwLjAxLCBcclxuICAgICAgICAwLjAxKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9kcmF3LmNhbGwodGhpcywgcCk7XHJcbiAgICBpZiAoIXRoaXMuX2lzTW91c2VPdmVyIHx8ICF0aGlzLl9pc092ZXJOYXZMb2dvKSByZXR1cm47XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgdGV4dCBpcyBhYm91dCB0byBiZWNvbWUgYWN0aXZlIGZvciB0aGUgZmlyc3QgdGltZSwgY2xlYXJcclxuICAgIC8vIHRoZSBzdGF0aW9uYXJ5IGxvZ28gdGhhdCB3YXMgcHJldmlvdXNseSBkcmF3bi4gXHJcbiAgICBpZiAodGhpcy5faXNGaXJzdEZyYW1lKSB7XHJcbiAgICAgICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICAgICAgdGhpcy5faXNGaXJzdEZyYW1lID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHBvc2l0aW9uIGFuZCByb3RhdGlvbiB0byBjcmVhdGUgYSBqaXR0ZXJ5IGxvZ29cclxuICAgIHZhciByb3RhdGlvbiA9IHRoaXMuX3JvdGF0aW9uTm9pc2UuZ2VuZXJhdGUoKTtcclxuICAgIHZhciB4eU9mZnNldCA9IHRoaXMuX3h5Tm9pc2UuZ2VuZXJhdGUoKTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LnNldFJvdGF0aW9uKHJvdGF0aW9uKVxyXG4gICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLl90ZXh0UG9zLnggKyB4eU9mZnNldC54LCB0aGlzLl90ZXh0UG9zLnkgKyB4eU9mZnNldC55KVxyXG4gICAgICAgIC5kcmF3KCk7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBNYWluTmF2O1xyXG5cclxuZnVuY3Rpb24gTWFpbk5hdihsb2FkZXIpIHtcclxuICAgIHRoaXMuX2xvYWRlciA9IGxvYWRlcjtcclxuICAgIHRoaXMuXyRsb2dvID0gJChcIm5hdi5uYXZiYXIgLm5hdmJhci1icmFuZFwiKTtcclxuICAgIHRoaXMuXyRuYXYgPSAkKFwiI21haW4tbmF2XCIpO1xyXG4gICAgdGhpcy5fJG5hdkxpbmtzID0gdGhpcy5fJG5hdi5maW5kKFwiYVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXYgPSB0aGlzLl8kbmF2TGlua3MuZmluZChcIi5hY3RpdmVcIik7XHJcbiAgICB0aGlzLl8kbmF2TGlua3Mub24oXCJjbGlja1wiLCB0aGlzLl9vbk5hdkNsaWNrLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5fJGxvZ28ub24oXCJjbGlja1wiLCB0aGlzLl9vbkxvZ29DbGljay5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuc2V0QWN0aXZlRnJvbVVybCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX2RlYWN0aXZhdGUoKTtcclxuICAgIHZhciB1cmwgPSBsb2NhdGlvbi5wYXRobmFtZTtcclxuICAgIGlmICh1cmwgPT09IFwiL2luZGV4Lmh0bWxcIiB8fCB1cmwgPT09IFwiL1wiKSB7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVMaW5rKHRoaXMuXyRuYXZMaW5rcy5maWx0ZXIoXCIjYWJvdXQtbGlua1wiKSk7XHJcbiAgICB9IGVsc2UgaWYgKHVybCA9PT0gXCIvd29yay5odG1sXCIpIHtcclxuICAgICAgICB0aGlzLl9hY3RpdmF0ZUxpbmsodGhpcy5fJG5hdkxpbmtzLmZpbHRlcihcIiN3b3JrLWxpbmtcIikpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX2RlYWN0aXZhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5fJGFjdGl2ZU5hdi5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2LnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgIHRoaXMuXyRhY3RpdmVOYXYgPSAkKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5NYWluTmF2LnByb3RvdHlwZS5fYWN0aXZhdGVMaW5rID0gZnVuY3Rpb24gKCRsaW5rKSB7XHJcbiAgICAkbGluay5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXYgPSAkbGluaztcclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9vbkxvZ29DbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgIHZhciB1cmwgPSAkdGFyZ2V0LmF0dHIoXCJocmVmXCIpO1xyXG4gICAgdGhpcy5fbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIHRydWUpO1xyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX29uTmF2Q2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdGhpcy5fJG5hdi5jb2xsYXBzZShcImhpZGVcIik7IC8vIENsb3NlIHRoZSBuYXYgLSBvbmx5IG1hdHRlcnMgb24gbW9iaWxlXHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgIGlmICgkdGFyZ2V0LmlzKHRoaXMuXyRhY3RpdmVOYXYpKSByZXR1cm47XHJcbiAgICB0aGlzLl9kZWFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLl9hY3RpdmF0ZUxpbmsoJHRhcmdldCk7XHJcbiAgICB2YXIgdXJsID0gJHRhcmdldC5hdHRyKFwiaHJlZlwiKTtcclxuICAgIHRoaXMuX2xvYWRlci5sb2FkUGFnZSh1cmwsIHt9LCB0cnVlKTtcclxufTsiLCJ2YXIgTG9hZGVyID0gcmVxdWlyZShcIi4vcGFnZS1sb2FkZXIuanNcIik7XHJcbnZhciBNYWluTmF2ID0gcmVxdWlyZShcIi4vbWFpbi1uYXYuanNcIik7XHJcbnZhciBIb3ZlclNsaWRlc2hvd3MgPSByZXF1aXJlKFwiLi9ob3Zlci1zbGlkZXNob3cuanNcIik7XHJcbnZhciBQb3J0Zm9saW9GaWx0ZXIgPSByZXF1aXJlKFwiLi9wb3J0Zm9saW8tZmlsdGVyLmpzXCIpO1xyXG52YXIgc2xpZGVzaG93cyA9IHJlcXVpcmUoXCIuL3RodW1ibmFpbC1zbGlkZXNob3cvc2xpZGVzaG93LmpzXCIpO1xyXG5cclxuLy8gUGlja2luZyBhIHJhbmRvbSBza2V0Y2ggdGhhdCB0aGUgdXNlciBoYXNuJ3Qgc2VlbiBiZWZvcmVcclxudmFyIFNrZXRjaCA9IHJlcXVpcmUoXCIuL3BpY2stcmFuZG9tLXNrZXRjaC5qc1wiKSgpO1xyXG5cclxuLy8gQUpBWCBwYWdlIGxvYWRlciwgd2l0aCBjYWxsYmFjayBmb3IgcmVsb2FkaW5nIHdpZGdldHNcclxudmFyIGxvYWRlciA9IG5ldyBMb2FkZXIob25QYWdlTG9hZCk7XHJcblxyXG4vLyBNYWluIG5hdiB3aWRnZXRcclxudmFyIG1haW5OYXYgPSBuZXcgTWFpbk5hdihsb2FkZXIpO1xyXG5cclxuLy8gSW50ZXJhY3RpdmUgbG9nbyBpbiBuYXZiYXJcclxudmFyIG5hdiA9ICQoXCJuYXYubmF2YmFyXCIpO1xyXG52YXIgbmF2TG9nbyA9IG5hdi5maW5kKFwiLm5hdmJhci1icmFuZFwiKTtcclxubmV3IFNrZXRjaChuYXYsIG5hdkxvZ28pO1xyXG5cclxuLy8gV2lkZ2V0IGdsb2JhbHNcclxudmFyIHBvcnRmb2xpb0ZpbHRlcjtcclxuXHJcbi8vIExvYWQgYWxsIHdpZGdldHNcclxub25QYWdlTG9hZCgpO1xyXG5cclxuLy8gSGFuZGxlIGJhY2svZm9yd2FyZCBidXR0b25zXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicG9wc3RhdGVcIiwgb25Qb3BTdGF0ZSk7XHJcblxyXG5mdW5jdGlvbiBvblBvcFN0YXRlKGUpIHtcclxuICAgIC8vIExvYWRlciBzdG9yZXMgY3VzdG9tIGRhdGEgaW4gdGhlIHN0YXRlIC0gaW5jbHVkaW5nIHRoZSB1cmwgYW5kIHRoZSBxdWVyeVxyXG4gICAgdmFyIHVybCA9IChlLnN0YXRlICYmIGUuc3RhdGUudXJsKSB8fCBcIi9pbmRleC5odG1sXCI7XHJcbiAgICB2YXIgcXVlcnlPYmplY3QgPSAoZS5zdGF0ZSAmJiBlLnN0YXRlLnF1ZXJ5KSB8fCB7fTtcclxuXHJcbiAgICBpZiAoKHVybCA9PT0gbG9hZGVyLmdldExvYWRlZFBhdGgoKSkgJiYgKHVybCA9PT0gXCIvd29yay5odG1sXCIpKSB7XHJcbiAgICAgICAgLy8gVGhlIGN1cnJlbnQgJiBwcmV2aW91cyBsb2FkZWQgc3RhdGVzIHdlcmUgd29yay5odG1sLCBzbyBqdXN0IHJlZmlsdGVyXHJcbiAgICAgICAgdmFyIGNhdGVnb3J5ID0gcXVlcnlPYmplY3QuY2F0ZWdvcnkgfHwgXCJhbGxcIjtcclxuICAgICAgICBwb3J0Zm9saW9GaWx0ZXIuc2VsZWN0Q2F0ZWdvcnkoY2F0ZWdvcnkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBMb2FkIHRoZSBuZXcgcGFnZVxyXG4gICAgICAgIGxvYWRlci5sb2FkUGFnZSh1cmwsIHt9LCBmYWxzZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUGFnZUxvYWQoKSB7XHJcbiAgICAvLyBSZWxvYWQgYWxsIHBsdWdpbnMvd2lkZ2V0c1xyXG4gICAgbmV3IEhvdmVyU2xpZGVzaG93cygpO1xyXG4gICAgcG9ydGZvbGlvRmlsdGVyID0gbmV3IFBvcnRmb2xpb0ZpbHRlcihsb2FkZXIpO1xyXG4gICAgc2xpZGVzaG93cy5pbml0KCk7XHJcbiAgICBvYmplY3RGaXRJbWFnZXMoKTtcclxuICAgIHNtYXJ0cXVvdGVzKCk7XHJcblxyXG4gICAgLy8gU2xpZ2h0bHkgcmVkdW5kYW50LCBidXQgdXBkYXRlIHRoZSBtYWluIG5hdiB1c2luZyB0aGUgY3VycmVudCBVUkwuIFRoaXNcclxuICAgIC8vIGlzIGltcG9ydGFudCBpZiBhIHBhZ2UgaXMgbG9hZGVkIGJ5IHR5cGluZyBhIGZ1bGwgVVJMIChlLmcuIGdvaW5nXHJcbiAgICAvLyBkaXJlY3RseSB0byAvd29yay5odG1sKSBvciB3aGVuIG1vdmluZyBmcm9tIHdvcmsuaHRtbCB0byBhIHByb2plY3QuXHJcbiAgICBtYWluTmF2LnNldEFjdGl2ZUZyb21VcmwoKTtcclxufVxyXG5cclxuLy8gV2UndmUgaGl0IHRoZSBsYW5kaW5nIHBhZ2UsIGxvYWQgdGhlIGFib3V0IHBhZ2VcclxuLy8gaWYgKGxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC9eKFxcL3xcXC9pbmRleC5odG1sfGluZGV4Lmh0bWwpJC8pKSB7XHJcbi8vICAgICBsb2FkZXIubG9hZFBhZ2UoXCIvYWJvdXQuaHRtbFwiLCB7fSwgZmFsc2UpO1xyXG4vLyB9IiwibW9kdWxlLmV4cG9ydHMgPSBMb2FkZXI7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gTG9hZGVyKG9uUmVsb2FkLCBmYWRlRHVyYXRpb24pIHtcclxuICAgIHRoaXMuXyRjb250ZW50ID0gJChcIiNjb250ZW50XCIpO1xyXG4gICAgdGhpcy5fb25SZWxvYWQgPSBvblJlbG9hZDtcclxuICAgIHRoaXMuX2ZhZGVEdXJhdGlvbiA9IChmYWRlRHVyYXRpb24gIT09IHVuZGVmaW5lZCkgPyBmYWRlRHVyYXRpb24gOiAyNTA7XHJcbiAgICB0aGlzLl9wYXRoID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbn1cclxuXHJcbkxvYWRlci5wcm90b3R5cGUuZ2V0TG9hZGVkUGF0aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9wYXRoO1xyXG59O1xyXG5cclxuTG9hZGVyLnByb3RvdHlwZS5sb2FkUGFnZSA9IGZ1bmN0aW9uICh1cmwsIHF1ZXJ5T2JqZWN0LCBzaG91bGRQdXNoSGlzdG9yeSkge1xyXG4gICAgLy8gRmFkZSB0aGVuIGVtcHR5IHRoZSBjdXJyZW50IGNvbnRlbnRzXHJcbiAgICB0aGlzLl8kY29udGVudC52ZWxvY2l0eSh7IG9wYWNpdHk6IDAgfSwgdGhpcy5fZmFkZUR1cmF0aW9uLCBcInN3aW5nXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl8kY29udGVudC5lbXB0eSgpO1xyXG4gICAgICAgIHRoaXMuXyRjb250ZW50LmxvYWQodXJsICsgXCIgI2NvbnRlbnRcIiwgb25Db250ZW50RmV0Y2hlZC5iaW5kKHRoaXMpKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gRmFkZSB0aGUgbmV3IGNvbnRlbnQgaW4gYWZ0ZXIgaXQgaGFzIGJlZW4gZmV0Y2hlZFxyXG4gICAgZnVuY3Rpb24gb25Db250ZW50RmV0Y2hlZChyZXNwb25zZVRleHQsIHRleHRTdGF0dXMpIHtcclxuICAgICAgICBpZiAodGV4dFN0YXR1cyA9PT0gXCJlcnJvclwiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBsb2FkaW5nIHRoZSBwYWdlLlwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHF1ZXJ5U3RyaW5nID0gdXRpbGl0aWVzLmNyZWF0ZVF1ZXJ5U3RyaW5nKHF1ZXJ5T2JqZWN0KTtcclxuICAgICAgICBpZiAoc2hvdWxkUHVzaEhpc3RvcnkpIHtcclxuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICBxdWVyeTogcXVlcnlPYmplY3RcclxuICAgICAgICAgICAgfSwgbnVsbCwgdXJsICsgcXVlcnlTdHJpbmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIEdvb2dsZSBhbmFseXRpY3NcclxuICAgICAgICBnYShcInNldFwiLCBcInBhZ2VcIiwgdXJsICsgcXVlcnlTdHJpbmcpO1xyXG4gICAgICAgIGdhKFwic2VuZFwiLCBcInBhZ2V2aWV3XCIpO1xyXG5cclxuICAgICAgICB0aGlzLl9wYXRoID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICAgICAgdGhpcy5fJGNvbnRlbnQudmVsb2NpdHkoeyBvcGFjaXR5OiAxIH0sIHRoaXMuX2ZhZGVEdXJhdGlvbixcclxuICAgICAgICAgICAgXCJzd2luZ1wiKTtcclxuICAgICAgICB0aGlzLl9vblJlbG9hZCgpO1xyXG4gICAgfVxyXG59OyIsInZhciBjb29raWVzID0gcmVxdWlyZShcImpzLWNvb2tpZVwiKTtcclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxudmFyIHNrZXRjaENvbnN0cnVjdG9ycyA9IHtcclxuICAgIFwiaGFsZnRvbmUtZmxhc2hsaWdodFwiOiBcclxuICAgICAgICByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9oYWxmdG9uZS1mbGFzaGxpZ2h0LXdvcmQuanNcIiksXHJcbiAgICBcIm5vaXN5LXdvcmRcIjpcclxuICAgICAgICByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9ub2lzeS13b3JkLXNrZXRjaC5qc1wiKSxcclxuICAgIFwiY29ubmVjdC1wb2ludHNcIjpcclxuICAgICAgICByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9jb25uZWN0LXBvaW50cy1za2V0Y2guanNcIilcclxufTtcclxudmFyIG51bVNrZXRjaGVzID0gT2JqZWN0LmtleXMoc2tldGNoQ29uc3RydWN0b3JzKS5sZW5ndGg7XHJcbnZhciBjb29raWVLZXkgPSBcInNlZW4tc2tldGNoLW5hbWVzXCI7XHJcblxyXG4vKipcclxuICogUGljayBhIHJhbmRvbSBza2V0Y2ggdGhhdCB1c2VyIGhhc24ndCBzZWVuIHlldC4gSWYgdGhlIHVzZXIgaGFzIHNlZW4gYWxsIHRoZVxyXG4gKiBza2V0Y2hlcywganVzdCBwaWNrIGEgcmFuZG9tIG9uZS4gVGhpcyB1c2VzIGNvb2tpZXMgdG8gdHJhY2sgd2hhdCB0aGUgdXNlciBcclxuICogaGFzIHNlZW4gYWxyZWFkeS5cclxuICogQHJldHVybiB7RnVuY3Rpb259IENvbnN0cnVjdG9yIGZvciBhIFNrZXRjaCBjbGFzc1xyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwaWNrUmFuZG9tU2tldGNoKCkge1xyXG4gICAgdmFyIHNlZW5Ta2V0Y2hOYW1lcyA9IGNvb2tpZXMuZ2V0SlNPTihjb29raWVLZXkpIHx8IFtdO1xyXG5cclxuICAgIC8vIEZpbmQgdGhlIG5hbWVzIG9mIHRoZSB1bnNlZW4gc2tldGNoZXNcclxuICAgIHZhciB1bnNlZW5Ta2V0Y2hOYW1lcyA9IGZpbmRVbnNlZW5Ta2V0Y2hlcyhzZWVuU2tldGNoTmFtZXMpO1xyXG5cclxuICAgIC8vIEFsbCBza2V0Y2hlcyBoYXZlIGJlZW4gc2VlblxyXG4gICAgaWYgKHVuc2VlblNrZXRjaE5hbWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIC8vIElmIHdlJ3ZlIGdvdCBtb3JlIHRoZW4gb25lIHNrZXRjaCwgdGhlbiBtYWtlIHN1cmUgdG8gY2hvb3NlIGEgcmFuZG9tXHJcbiAgICAgICAgLy8gc2tldGNoIGV4Y2x1ZGluZyB0aGUgbW9zdCByZWNlbnRseSBzZWVuIHNrZXRjaFxyXG4gICAgICAgIGlmIChudW1Ta2V0Y2hlcyA+IDEpIHtcclxuICAgICAgICAgICAgc2VlblNrZXRjaE5hbWVzID0gW3NlZW5Ta2V0Y2hOYW1lcy5wb3AoKV07XHJcbiAgICAgICAgICAgIHVuc2VlblNrZXRjaE5hbWVzID0gZmluZFVuc2VlblNrZXRjaGVzKHNlZW5Ta2V0Y2hOYW1lcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gSWYgd2UndmUgb25seSBnb3Qgb25lIHNrZXRjaCwgdGhlbiB3ZSBjYW4ndCBkbyBtdWNoLi4uXHJcbiAgICAgICAgICAgIHNlZW5Ta2V0Y2hOYW1lcyA9IFtdO1xyXG4gICAgICAgICAgICB1bnNlZW5Ta2V0Y2hOYW1lcyA9IE9iamVjdC5rZXlzKHNrZXRjaENvbnN0cnVjdG9ycyk7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciByYW5kU2tldGNoTmFtZSA9IHV0aWxzLnJhbmRBcnJheUVsZW1lbnQodW5zZWVuU2tldGNoTmFtZXMpO1xyXG4gICAgc2VlblNrZXRjaE5hbWVzLnB1c2gocmFuZFNrZXRjaE5hbWUpO1xyXG5cclxuICAgIC8vIFN0b3JlIHRoZSBnZW5lcmF0ZWQgc2tldGNoIGluIGEgY29va2llLiBUaGlzIGNyZWF0ZXMgYSBtb3ZpbmcgNyBkYXlcclxuICAgIC8vIHdpbmRvdyAtIGFueXRpbWUgdGhlIHNpdGUgaXMgdmlzaXRlZCwgdGhlIGNvb2tpZSBpcyByZWZyZXNoZWQuXHJcbiAgICBjb29raWVzLnNldChjb29raWVLZXksIHNlZW5Ta2V0Y2hOYW1lcywgeyBleHBpcmVzOiA3IH0pO1xyXG5cclxuICAgIHJldHVybiBza2V0Y2hDb25zdHJ1Y3RvcnNbcmFuZFNrZXRjaE5hbWVdO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gZmluZFVuc2VlblNrZXRjaGVzKHNlZW5Ta2V0Y2hOYW1lcykge1xyXG4gICAgdmFyIHVuc2VlblNrZXRjaE5hbWVzID0gW107XHJcbiAgICBmb3IgKHZhciBza2V0Y2hOYW1lIGluIHNrZXRjaENvbnN0cnVjdG9ycykge1xyXG4gICAgICAgIGlmIChzZWVuU2tldGNoTmFtZXMuaW5kZXhPZihza2V0Y2hOYW1lKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdW5zZWVuU2tldGNoTmFtZXMucHVzaChza2V0Y2hOYW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5zZWVuU2tldGNoTmFtZXM7XHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb0ZpbHRlcjtcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG52YXIgZGVmYXVsdEJyZWFrcG9pbnRzID0gW1xyXG4gICAgeyB3aWR0aDogMTIwMCwgY29sczogMywgc3BhY2luZzogMTUgfSxcclxuICAgIHsgd2lkdGg6IDk5MiwgY29sczogMywgc3BhY2luZzogMTUgfSxcclxuICAgIHsgd2lkdGg6IDcwMCwgY29sczogMywgc3BhY2luZzogMTUgfSxcclxuICAgIHsgd2lkdGg6IDYwMCwgY29sczogMiwgc3BhY2luZzogMTAgfSxcclxuICAgIHsgd2lkdGg6IDQ4MCwgY29sczogMiwgc3BhY2luZzogMTAgfSxcclxuICAgIHsgd2lkdGg6IDMyMCwgY29sczogMSwgc3BhY2luZzogMTAgfVxyXG5dO1xyXG5cclxuZnVuY3Rpb24gUG9ydGZvbGlvRmlsdGVyKGxvYWRlciwgYnJlYWtwb2ludHMsIGFzcGVjdFJhdGlvLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRoaXMuX2xvYWRlciA9IGxvYWRlcjtcclxuICAgIHRoaXMuX2dyaWRTcGFjaW5nID0gMDtcclxuICAgIHRoaXMuX2FzcGVjdFJhdGlvID0gKGFzcGVjdFJhdGlvICE9PSB1bmRlZmluZWQpID8gYXNwZWN0UmF0aW8gOiAoMTYvOSk7XHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSAodHJhbnNpdGlvbkR1cmF0aW9uICE9PSB1bmRlZmluZWQpID8gXHJcbiAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uIDogODAwO1xyXG4gICAgdGhpcy5fYnJlYWtwb2ludHMgPSAoYnJlYWtwb2ludHMgIT09IHVuZGVmaW5lZCkgPyBcclxuICAgICAgICBicmVha3BvaW50cy5zbGljZSgpIDogZGVmYXVsdEJyZWFrcG9pbnRzLnNsaWNlKCk7XHJcbiAgICB0aGlzLl8kZ3JpZCA9ICQoXCIjcG9ydGZvbGlvLWdyaWRcIik7XHJcbiAgICB0aGlzLl8kbmF2ID0gJChcIiNwb3J0Zm9saW8tbmF2XCIpO1xyXG4gICAgdGhpcy5fJHByb2plY3RzID0gW107XHJcbiAgICB0aGlzLl8kY2F0ZWdvcmllcyA9IHt9O1xyXG4gICAgdGhpcy5fcm93cyA9IDA7XHJcbiAgICB0aGlzLl9jb2xzID0gMDtcclxuICAgIHRoaXMuX2ltYWdlSGVpZ2h0ID0gMDtcclxuICAgIHRoaXMuX2ltYWdlV2lkdGggPSAwO1xyXG5cclxuICAgIC8vIFNvcnQgdGhlIGJyZWFrcG9pbnRzIGluIGRlc2NlbmRpbmcgb3JkZXJcclxuICAgIHRoaXMuX2JyZWFrcG9pbnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgIGlmIChhLndpZHRoIDwgYi53aWR0aCkgcmV0dXJuIC0xO1xyXG4gICAgICAgIGVsc2UgaWYgKGEud2lkdGggPiBiLndpZHRoKSByZXR1cm4gMTtcclxuICAgICAgICBlbHNlIHJldHVybiAwO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fY2FjaGVQcm9qZWN0cygpO1xyXG4gICAgdGhpcy5fY3JlYXRlR3JpZCgpO1xyXG5cclxuICAgIHRoaXMuXyRncmlkLmZpbmQoXCIucHJvamVjdCBhXCIpLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25Qcm9qZWN0Q2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdmFyIHFzID0gdXRpbGl0aWVzLmdldFF1ZXJ5UGFyYW1ldGVycygpO1xyXG4gICAgdmFyIGluaXRpYWxDYXRlZ29yeSA9IHFzLmNhdGVnb3J5IHx8IFwiYWxsXCI7XHJcbiAgICB2YXIgY2F0ZWdvcnkgPSBpbml0aWFsQ2F0ZWdvcnkudG9Mb3dlckNhc2UoKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gdGhpcy5fJG5hdi5maW5kKFwiYVtkYXRhLWNhdGVnb3J5PVwiICsgY2F0ZWdvcnkgKyBcIl1cIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgIHRoaXMuX2ZpbHRlclByb2plY3RzKGNhdGVnb3J5KTtcclxuICAgICQoXCIjcG9ydGZvbGlvLW5hdiBhXCIpLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25OYXZDbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgdGhpcy5fY3JlYXRlR3JpZC5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5zZWxlY3RDYXRlZ29yeSA9IGZ1bmN0aW9uIChjYXRlZ29yeSkge1xyXG4gICAgY2F0ZWdvcnkgPSAoY2F0ZWdvcnkgJiYgY2F0ZWdvcnkudG9Mb3dlckNhc2UoKSkgfHwgXCJhbGxcIjtcclxuICAgIHZhciAkc2VsZWN0ZWROYXYgPSB0aGlzLl8kbmF2LmZpbmQoXCJhW2RhdGEtY2F0ZWdvcnk9XCIgKyBjYXRlZ29yeSArIFwiXVwiKTtcclxuICAgIGlmICgkc2VsZWN0ZWROYXYubGVuZ3RoICYmICEkc2VsZWN0ZWROYXYuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSB7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0gPSAkc2VsZWN0ZWROYXY7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZmlsdGVyUHJvamVjdHMgPSBmdW5jdGlvbiAoY2F0ZWdvcnkpIHtcclxuICAgIHZhciAkc2VsZWN0ZWRFbGVtZW50cyA9IHRoaXMuX2dldFByb2plY3RzSW5DYXRlZ29yeShjYXRlZ29yeSk7XHJcblxyXG4gICAgLy8gQW5pbWF0ZSB0aGUgZ3JpZCB0byB0aGUgY29ycmVjdCBoZWlnaHQgdG8gY29udGFpbiB0aGUgcm93c1xyXG4gICAgdGhpcy5fYW5pbWF0ZUdyaWRIZWlnaHQoJHNlbGVjdGVkRWxlbWVudHMubGVuZ3RoKTtcclxuICAgIFxyXG4gICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBwcm9qZWN0c1xyXG4gICAgdGhpcy5fJHByb2plY3RzLmZvckVhY2goZnVuY3Rpb24gKCRlbGVtZW50KSB7XHJcbiAgICAgICAgLy8gU3RvcCBhbGwgYW5pbWF0aW9uc1xyXG4gICAgICAgICRlbGVtZW50LnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgICAgICAvLyBJZiBhbiBlbGVtZW50IGlzIG5vdCBzZWxlY3RlZDogZHJvcCB6LWluZGV4ICYgYW5pbWF0ZSBvcGFjaXR5IC0+IGhpZGVcclxuICAgICAgICB2YXIgc2VsZWN0ZWRJbmRleCA9ICRzZWxlY3RlZEVsZW1lbnRzLmluZGV4T2YoJGVsZW1lbnQpOyBcclxuICAgICAgICBpZiAoc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgJGVsZW1lbnQuY3NzKFwiekluZGV4XCIsIC0xKTtcclxuICAgICAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoe1xyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICAgICAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFwiZWFzZUluT3V0Q3ViaWNcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBJZiBhbiBlbGVtZW50IGlzIHNlbGVjdGVkOiBzaG93ICYgYnVtcCB6LWluZGV4ICYgYW5pbWF0ZSB0byBwb3NpdGlvbiBcclxuICAgICAgICAgICAgJGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC5jc3MoXCJ6SW5kZXhcIiwgMCk7XHJcbiAgICAgICAgICAgIHZhciBuZXdQb3MgPSB0aGlzLl9pbmRleFRvWFkoc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgICRlbGVtZW50LnZlbG9jaXR5KHsgXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxLFxyXG4gICAgICAgICAgICAgICAgdG9wOiBuZXdQb3MueSArIFwicHhcIixcclxuICAgICAgICAgICAgICAgIGxlZnQ6IG5ld1Bvcy54ICsgXCJweFwiXHJcbiAgICAgICAgICAgIH0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fYW5pbWF0ZUdyaWRIZWlnaHQgPSBmdW5jdGlvbiAobnVtRWxlbWVudHMpIHtcclxuICAgIHRoaXMuXyRncmlkLnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgIHZhciBjdXJSb3dzID0gTWF0aC5jZWlsKG51bUVsZW1lbnRzIC8gdGhpcy5fY29scyk7XHJcbiAgICB0aGlzLl8kZ3JpZC52ZWxvY2l0eSh7XHJcbiAgICAgICAgaGVpZ2h0OiB0aGlzLl9pbWFnZUhlaWdodCAqIGN1clJvd3MgKyBcclxuICAgICAgICAgICAgdGhpcy5fZ3JpZFNwYWNpbmcgKiAoY3VyUm93cyAtIDEpICsgXCJweFwiXHJcbiAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24pO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZ2V0UHJvamVjdHNJbkNhdGVnb3J5ID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XHJcbiAgICBpZiAoY2F0ZWdvcnkgPT09IFwiYWxsXCIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fJHByb2plY3RzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XSB8fCBbXSk7XHJcbiAgICB9ICAgICAgICBcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhY2hlUHJvamVjdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl8kcHJvamVjdHMgPSBbXTtcclxuICAgIHRoaXMuXyRjYXRlZ29yaWVzID0ge307XHJcbiAgICB0aGlzLl8kZ3JpZC5maW5kKFwiLnByb2plY3RcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuXyRwcm9qZWN0cy5wdXNoKCRlbGVtZW50KTtcclxuICAgICAgICB2YXIgY2F0ZWdvcnlOYW1lcyA9ICRlbGVtZW50LmRhdGEoXCJjYXRlZ29yaWVzXCIpLnNwbGl0KFwiLFwiKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhdGVnb3J5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyIGNhdGVnb3J5ID0gJC50cmltKGNhdGVnb3J5TmFtZXNbaV0pLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl8kY2F0ZWdvcmllc1tjYXRlZ29yeV0gPSBbJGVsZW1lbnRdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldLnB1c2goJGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbi8vIFBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhbGN1bGF0ZUdyaWQgPSBmdW5jdGlvbiAoKSB7XHJcbi8vICAgICB2YXIgZ3JpZFdpZHRoID0gdGhpcy5fJGdyaWQuaW5uZXJXaWR0aCgpO1xyXG4vLyAgICAgdGhpcy5fY29scyA9IE1hdGguZmxvb3IoKGdyaWRXaWR0aCArIHRoaXMuX2dyaWRTcGFjaW5nKSAvIFxyXG4vLyAgICAgICAgICh0aGlzLl9taW5JbWFnZVdpZHRoICsgdGhpcy5fZ3JpZFNwYWNpbmcpKTtcclxuLy8gICAgIHRoaXMuX3Jvd3MgPSBNYXRoLmNlaWwodGhpcy5fJHByb2plY3RzLmxlbmd0aCAvIHRoaXMuX2NvbHMpO1xyXG4vLyAgICAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAoKHRoaXMuX2NvbHMgLSAxKSAqIHRoaXMuX2dyaWRTcGFjaW5nKSkgLyBcclxuLy8gICAgICAgICB0aGlzLl9jb2xzO1xyXG4vLyAgICAgdGhpcy5faW1hZ2VIZWlnaHQgPSB0aGlzLl9pbWFnZVdpZHRoICogKDEgLyB0aGlzLl9hc3BlY3RSYXRpbyk7XHJcbi8vIH07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jYWxjdWxhdGVHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGdyaWRXaWR0aCA9IHRoaXMuXyRncmlkLmlubmVyV2lkdGgoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYnJlYWtwb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAoZ3JpZFdpZHRoIDw9IHRoaXMuX2JyZWFrcG9pbnRzW2ldLndpZHRoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbHMgPSB0aGlzLl9icmVha3BvaW50c1tpXS5jb2xzO1xyXG4gICAgICAgICAgICB0aGlzLl9ncmlkU3BhY2luZyA9IHRoaXMuX2JyZWFrcG9pbnRzW2ldLnNwYWNpbmc7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuX3Jvd3MgPSBNYXRoLmNlaWwodGhpcy5fJHByb2plY3RzLmxlbmd0aCAvIHRoaXMuX2NvbHMpO1xyXG4gICAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAoKHRoaXMuX2NvbHMgLSAxKSAqIHRoaXMuX2dyaWRTcGFjaW5nKSkgLyBcclxuICAgICAgICB0aGlzLl9jb2xzO1xyXG4gICAgdGhpcy5faW1hZ2VIZWlnaHQgPSB0aGlzLl9pbWFnZVdpZHRoICogKDEgLyB0aGlzLl9hc3BlY3RSYXRpbyk7XHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jcmVhdGVHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlR3JpZCgpO1xyXG5cclxuICAgIHRoaXMuXyRncmlkLmNzcyhcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XHJcbiAgICB0aGlzLl8kZ3JpZC5jc3Moe1xyXG4gICAgICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKiB0aGlzLl9yb3dzICsgXHJcbiAgICAgICAgICAgIHRoaXMuX2dyaWRTcGFjaW5nICogKHRoaXMuX3Jvd3MgLSAxKSArIFwicHhcIlxyXG4gICAgfSk7ICAgIFxyXG5cclxuICAgIHRoaXMuXyRwcm9qZWN0cy5mb3JFYWNoKGZ1bmN0aW9uICgkZWxlbWVudCwgaW5kZXgpIHtcclxuICAgICAgICB2YXIgcG9zID0gdGhpcy5faW5kZXhUb1hZKGluZGV4KTtcclxuICAgICAgICAkZWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICB0b3A6IHBvcy55ICsgXCJweFwiLFxyXG4gICAgICAgICAgICBsZWZ0OiBwb3MueCArIFwicHhcIixcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuX2ltYWdlV2lkdGggKyBcInB4XCIsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKyBcInB4XCJcclxuICAgICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7ICAgIFxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fb25OYXZDbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xyXG4gICAgaWYgKCR0YXJnZXQuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSByZXR1cm47XHJcbiAgICBpZiAodGhpcy5fJGFjdGl2ZU5hdkl0ZW0ubGVuZ3RoKSB0aGlzLl8kYWN0aXZlTmF2SXRlbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9ICR0YXJnZXQ7XHJcbiAgICB2YXIgY2F0ZWdvcnkgPSAkdGFyZ2V0LmRhdGEoXCJjYXRlZ29yeVwiKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgIGhpc3RvcnkucHVzaFN0YXRlKHtcclxuICAgICAgICB1cmw6IFwiL3dvcmsuaHRtbFwiLFxyXG4gICAgICAgIHF1ZXJ5OiB7IGNhdGVnb3J5OiBjYXRlZ29yeSB9XHJcbiAgICB9LCBudWxsLCBcIi93b3JrLmh0bWw/Y2F0ZWdvcnk9XCIgKyBjYXRlZ29yeSk7XHJcblxyXG4gICAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fb25Qcm9qZWN0Q2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICB2YXIgcHJvamVjdE5hbWUgPSAkdGFyZ2V0LmRhdGEoXCJuYW1lXCIpO1xyXG4gICAgdmFyIHVybCA9IFwiL3Byb2plY3RzL1wiICsgcHJvamVjdE5hbWUgKyBcIi5odG1sXCI7XHJcbiAgICB0aGlzLl9sb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgdHJ1ZSk7XHJcbn07XHJcblxyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5faW5kZXhUb1hZID0gZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICB2YXIgciA9IE1hdGguZmxvb3IoaW5kZXggLyB0aGlzLl9jb2xzKTtcclxuICAgIHZhciBjID0gaW5kZXggJSB0aGlzLl9jb2xzOyBcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogYyAqIHRoaXMuX2ltYWdlV2lkdGggKyBjICogdGhpcy5fZ3JpZFNwYWNpbmcsXHJcbiAgICAgICAgeTogciAqIHRoaXMuX2ltYWdlSGVpZ2h0ICsgciAqIHRoaXMuX2dyaWRTcGFjaW5nXHJcbiAgICB9O1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gU2xpZGVzaG93TW9kYWw7XHJcblxyXG52YXIgS0VZX0NPREVTID0ge1xyXG4gICAgTEVGVF9BUlJPVzogMzcsXHJcbiAgICBSSUdIVF9BUlJPVzogMzksXHJcbiAgICBFU0NBUEU6IDI3XHJcbn07XHJcblxyXG5mdW5jdGlvbiBTbGlkZXNob3dNb2RhbCgkY29udGFpbmVyLCBzbGlkZXNob3cpIHtcclxuICAgIHRoaXMuX3NsaWRlc2hvdyA9IHNsaWRlc2hvdztcclxuXHJcbiAgICB0aGlzLl8kbW9kYWwgPSAkY29udGFpbmVyLmZpbmQoXCIuc2xpZGVzaG93LW1vZGFsXCIpO1xyXG4gICAgdGhpcy5fJG92ZXJsYXkgPSB0aGlzLl8kbW9kYWwuZmluZChcIi5tb2RhbC1vdmVybGF5XCIpO1xyXG4gICAgdGhpcy5fJGNvbnRlbnQgPSB0aGlzLl8kbW9kYWwuZmluZChcIi5tb2RhbC1jb250ZW50c1wiKTtcclxuICAgIHRoaXMuXyRjYXB0aW9uID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIubW9kYWwtY2FwdGlvblwiKTtcclxuICAgIHRoaXMuXyRpbWFnZUNvbnRhaW5lciA9IHRoaXMuXyRtb2RhbC5maW5kKFwiLm1vZGFsLWltYWdlXCIpO1xyXG4gICAgdGhpcy5fJGltYWdlTGVmdCA9IHRoaXMuXyRtb2RhbC5maW5kKFwiLmltYWdlLWFkdmFuY2UtbGVmdFwiKTtcclxuICAgIHRoaXMuXyRpbWFnZVJpZ2h0ID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIuaW1hZ2UtYWR2YW5jZS1yaWdodFwiKTtcclxuXHJcbiAgICB0aGlzLl9pbmRleCA9IDA7IC8vIEluZGV4IG9mIHNlbGVjdGVkIGltYWdlXHJcbiAgICB0aGlzLl9pc09wZW4gPSBmYWxzZTtcclxuICAgIFxyXG4gICAgdGhpcy5fJGltYWdlTGVmdC5vbihcImNsaWNrXCIsIHRoaXMuYWR2YW5jZUxlZnQuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLl8kaW1hZ2VSaWdodC5vbihcImNsaWNrXCIsIHRoaXMuYWR2YW5jZVJpZ2h0LmJpbmQodGhpcykpO1xyXG4gICAgJChkb2N1bWVudCkub24oXCJrZXlkb3duXCIsIHRoaXMuX29uS2V5RG93bi5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBHaXZlIGpRdWVyeSBjb250cm9sIG92ZXIgc2hvd2luZy9oaWRpbmdcclxuICAgIHRoaXMuXyRtb2RhbC5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XHJcbiAgICB0aGlzLl8kbW9kYWwuaGlkZSgpO1xyXG5cclxuICAgIC8vIEV2ZW50c1xyXG4gICAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5fJG92ZXJsYXkub24oXCJjbGlja1wiLCB0aGlzLmNsb3NlLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5fJG1vZGFsLmZpbmQoXCIubW9kYWwtY2xvc2VcIikub24oXCJjbGlja1wiLCB0aGlzLmNsb3NlLmJpbmQodGhpcykpO1xyXG4gICAgXHJcbiAgICB0aGlzLl91cGRhdGVDb250cm9scygpO1xyXG5cclxuICAgIC8vIFNpemUgb2YgZm9udGF3ZXNvbWUgaWNvbnMgbmVlZHMgYSBzbGlnaHQgZGVsYXkgKHVudGlsIHN0YWNrIGlzIGNsZWFyKSBmb3JcclxuICAgIC8vIHNvbWUgcmVhc29uXHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9vblJlc2l6ZSgpO1xyXG4gICAgfS5iaW5kKHRoaXMpLCAwKTtcclxufVxyXG5cclxuU2xpZGVzaG93TW9kYWwucHJvdG90eXBlLmFkdmFuY2VMZWZ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5zaG93SW1hZ2VBdCh0aGlzLl9pbmRleCAtIDEpO1xyXG59O1xyXG5cclxuU2xpZGVzaG93TW9kYWwucHJvdG90eXBlLmFkdmFuY2VSaWdodCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuc2hvd0ltYWdlQXQodGhpcy5faW5kZXggKyAxKTtcclxufTtcclxuXHJcblNsaWRlc2hvd01vZGFsLnByb3RvdHlwZS5zaG93SW1hZ2VBdCA9IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgaW5kZXggPSBNYXRoLm1heChpbmRleCwgMCk7XHJcbiAgICBpbmRleCA9IE1hdGgubWluKGluZGV4LCB0aGlzLl9zbGlkZXNob3cuZ2V0TnVtSW1hZ2VzKCkgLSAxKTtcclxuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XHJcbiAgICB2YXIgJGltZyA9IHRoaXMuX3NsaWRlc2hvdy5nZXRHYWxsZXJ5SW1hZ2UodGhpcy5faW5kZXgpO1xyXG4gICAgdmFyIGNhcHRpb24gPSB0aGlzLl9zbGlkZXNob3cuZ2V0Q2FwdGlvbih0aGlzLl9pbmRleCk7XHJcblxyXG4gICAgdGhpcy5fJGltYWdlQ29udGFpbmVyLmVtcHR5KCk7XHJcbiAgICAkKFwiPGltZz5cIiwge3NyYzogJGltZy5hdHRyKFwic3JjXCIpfSlcclxuICAgICAgICAuYXBwZW5kVG8odGhpcy5fJGltYWdlQ29udGFpbmVyKTtcclxuXHJcbiAgICB0aGlzLl8kY2FwdGlvbi5lbXB0eSgpO1xyXG4gICAgaWYgKGNhcHRpb24pIHtcclxuICAgICAgICAkKFwiPHNwYW4+XCIpLmFkZENsYXNzKFwiZmlndXJlLW51bWJlclwiKVxyXG4gICAgICAgICAgICAudGV4dChcIkZpZy4gXCIgKyAodGhpcy5faW5kZXggKyAxKSArIFwiOiBcIilcclxuICAgICAgICAgICAgLmFwcGVuZFRvKHRoaXMuXyRjYXB0aW9uKTtcclxuICAgICAgICAkKFwiPHNwYW4+XCIpLmFkZENsYXNzKFwiY2FwdGlvbi10ZXh0XCIpXHJcbiAgICAgICAgICAgIC50ZXh0KGNhcHRpb24pXHJcbiAgICAgICAgICAgIC5hcHBlbmRUbyh0aGlzLl8kY2FwdGlvbik7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHRoaXMuX29uUmVzaXplKCk7XHJcbiAgICB0aGlzLl91cGRhdGVDb250cm9scygpO1xyXG59O1xyXG5cclxuU2xpZGVzaG93TW9kYWwucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgIGluZGV4ID0gaW5kZXggfHwgMDtcclxuICAgIHRoaXMuXyRtb2RhbC5zaG93KCk7XHJcbiAgICB0aGlzLnNob3dJbWFnZUF0KGluZGV4KTtcclxuICAgIHRoaXMuX2lzT3BlbiA9IHRydWU7XHJcbn07XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUuY2xvc2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl8kbW9kYWwuaGlkZSgpO1xyXG4gICAgdGhpcy5faXNPcGVuID0gZmFsc2U7XHJcbn07XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUuX29uS2V5RG93biA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAoIXRoaXMuX2lzT3BlbikgcmV0dXJuO1xyXG4gICAgaWYgKGUud2hpY2ggPT09IEtFWV9DT0RFUy5MRUZUX0FSUk9XKSB7XHJcbiAgICAgICAgdGhpcy5hZHZhbmNlTGVmdCgpO1xyXG4gICAgfSBlbHNlIGlmIChlLndoaWNoID09PSBLRVlfQ09ERVMuUklHSFRfQVJST1cpIHtcclxuICAgICAgICB0aGlzLmFkdmFuY2VSaWdodCgpO1xyXG4gICAgfSBlbHNlIGlmIChlLndoaWNoID09PSBLRVlfQ09ERVMuRVNDQVBFKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZSgpOyAgIFxyXG4gICAgfVxyXG59O1xyXG5cclxuU2xpZGVzaG93TW9kYWwucHJvdG90eXBlLl91cGRhdGVDb250cm9scyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIFJlLWVuYWJsZVxyXG4gICAgdGhpcy5fJGltYWdlUmlnaHQucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgIHRoaXMuXyRpbWFnZUxlZnQucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgIFxyXG4gICAgLy8gRGlzYWJsZSBpZiB3ZSd2ZSByZWFjaGVkIHRoZSB0aGUgbWF4IG9yIG1pbiBsaW1pdFxyXG4gICAgaWYgKHRoaXMuX2luZGV4ID49ICh0aGlzLl9zbGlkZXNob3cuZ2V0TnVtSW1hZ2VzKCkgLSAxKSkge1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZVJpZ2h0LmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2luZGV4IDw9IDApIHtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VMZWZ0LmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICB9XHJcbn07XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyICRpbWFnZSA9IHRoaXMuXyRpbWFnZUNvbnRhaW5lci5maW5kKFwiaW1nXCIpO1xyXG5cclxuICAgIC8vIFJlc2V0IHRoZSBjb250ZW50J3Mgd2lkdGhcclxuICAgIHRoaXMuXyRjb250ZW50LndpZHRoKFwiXCIpO1xyXG5cclxuICAgIC8vIEZpbmQgdGhlIHNpemUgb2YgdGhlIGNvbXBvbmVudHMgdGhhdCBuZWVkIHRvIGJlIGRpc3BsYXllZCBpbiBhZGRpdGlvbiB0byBcclxuICAgIC8vIHRoZSBpbWFnZVxyXG4gICAgdmFyIGNvbnRyb2xzV2lkdGggPSB0aGlzLl8kaW1hZ2VMZWZ0Lm91dGVyV2lkdGgodHJ1ZSkgKyBcclxuICAgICAgICB0aGlzLl8kaW1hZ2VSaWdodC5vdXRlcldpZHRoKHRydWUpO1xyXG4gICAgLy8gSGFjayBmb3Igbm93IC0gYnVkZ2V0IGZvciAyeCB0aGUgY2FwdGlvbiBoZWlnaHQuIFxyXG4gICAgdmFyIGNhcHRpb25IZWlnaHQgPSAyICogdGhpcy5fJGNhcHRpb24ub3V0ZXJIZWlnaHQodHJ1ZSk7IFxyXG4gICAgLy8gdmFyIGltYWdlUGFkZGluZyA9ICRpbWFnZS5pbm5lcldpZHRoKCk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBhdmFpbGFibGUgYXJlYSBmb3IgdGhlIG1vZGFsXHJcbiAgICB2YXIgbXcgPSB0aGlzLl8kbW9kYWwud2lkdGgoKSAtIGNvbnRyb2xzV2lkdGg7XHJcbiAgICB2YXIgbWggPSB0aGlzLl8kbW9kYWwuaGVpZ2h0KCkgLSBjYXB0aW9uSGVpZ2h0O1xyXG5cclxuICAgIC8vIEZpdCB0aGUgaW1hZ2UgdG8gdGhlIHJlbWFpbmluZyBzY3JlZW4gcmVhbCBlc3RhdGUgXHJcbiAgICB2YXIgc2V0U2l6ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaXcgPSAkaW1hZ2UucHJvcChcIm5hdHVyYWxXaWR0aFwiKTtcclxuICAgICAgICB2YXIgaWggPSAkaW1hZ2UucHJvcChcIm5hdHVyYWxIZWlnaHRcIik7XHJcbiAgICAgICAgdmFyIHN3ID0gaXcgLyBtdztcclxuICAgICAgICB2YXIgc2ggPSBpaCAvIG1oO1xyXG4gICAgICAgIHZhciBzID0gTWF0aC5tYXgoc3csIHNoKTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHdpZHRoL2hlaWdodCB1c2luZyBDU1MgaW4gb3JkZXIgdG8gcmVzcGVjdCBib3gtc2l6aW5nXHJcbiAgICAgICAgaWYgKHMgPiAxKSB7XHJcbiAgICAgICAgICAgICRpbWFnZS5jc3MoXCJ3aWR0aFwiLCBpdyAvIHMgKyBcInB4XCIpO1xyXG4gICAgICAgICAgICAkaW1hZ2UuY3NzKFwiaGVpZ2h0XCIsIGloIC8gcyArIFwicHhcIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJGltYWdlLmNzcyhcIndpZHRoXCIsIGl3ICsgXCJweFwiKTtcclxuICAgICAgICAgICAgJGltYWdlLmNzcyhcImhlaWdodFwiLCBpaCArIFwicHhcIik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl8kaW1hZ2VSaWdodC5jc3MoXCJ0b3BcIiwgJGltYWdlLm91dGVySGVpZ2h0KCkgLyAyICsgXCJweFwiKTtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VMZWZ0LmNzcyhcInRvcFwiLCAkaW1hZ2Uub3V0ZXJIZWlnaHQoKSAvIDIgKyBcInB4XCIpO1xyXG5cclxuICAgICAgICAvLyBTZXQgdGhlIGNvbnRlbnQgd3JhcHBlciB0byBiZSB0aGUgd2lkdGggb2YgdGhlIGltYWdlLiBUaGlzIHdpbGwga2VlcCBcclxuICAgICAgICAvLyB0aGUgY2FwdGlvbiBmcm9tIGV4cGFuZGluZyBiZXlvbmQgdGhlIGltYWdlLlxyXG4gICAgICAgIHRoaXMuXyRjb250ZW50LndpZHRoKCRpbWFnZS5vdXRlcldpZHRoKHRydWUpKTsgICAgICAgIFxyXG4gICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgIGlmICgkaW1hZ2UucHJvcChcImNvbXBsZXRlXCIpKSBzZXRTaXplKCk7XHJcbiAgICBlbHNlICRpbWFnZS5vbmUoXCJsb2FkXCIsIHNldFNpemUpO1xyXG59O1xyXG4iLCJ2YXIgU2xpZGVzaG93TW9kYWwgPSByZXF1aXJlKFwiLi9zbGlkZXNob3ctbW9kYWwuanNcIik7XHJcbnZhciBUaHVtYm5haWxTbGlkZXIgPSByZXF1aXJlKFwiLi90aHVtYm5haWwtc2xpZGVyLmpzXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBpbml0OiBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb24gPSAodHJhbnNpdGlvbkR1cmF0aW9uICE9PSB1bmRlZmluZWQpID9cclxuICAgICAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uIDogNDAwO1xyXG4gICAgICAgIHRoaXMuX3NsaWRlc2hvd3MgPSBbXTtcclxuICAgICAgICAkKFwiLnNsaWRlc2hvd1wiKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgICAgICB2YXIgc2xpZGVzaG93ID0gbmV3IFNsaWRlc2hvdygkKGVsZW1lbnQpLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLl9zbGlkZXNob3dzLnB1c2goc2xpZGVzaG93KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZnVuY3Rpb24gU2xpZGVzaG93KCRjb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gdHJhbnNpdGlvbkR1cmF0aW9uO1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lciA9ICRjb250YWluZXI7XHJcbiAgICB0aGlzLl9pbmRleCA9IDA7IC8vIEluZGV4IG9mIHNlbGVjdGVkIGltYWdlXHJcblxyXG4gICAgLy8gQ3JlYXRlIGNvbXBvbmVudHNcclxuICAgIHRoaXMuX3RodW1ibmFpbFNsaWRlciA9IG5ldyBUaHVtYm5haWxTbGlkZXIoJGNvbnRhaW5lciwgdGhpcyk7XHJcbiAgICB0aGlzLl9tb2RhbCA9IG5ldyBTbGlkZXNob3dNb2RhbCgkY29udGFpbmVyLCB0aGlzKTtcclxuXHJcbiAgICAvLyBDYWNoZSBhbmQgY3JlYXRlIG5lY2Vzc2FyeSBET00gZWxlbWVudHMgICBcclxuICAgIHRoaXMuXyRjYXB0aW9uQ29udGFpbmVyID0gJGNvbnRhaW5lci5maW5kKFwiLmNhcHRpb25cIik7XHJcbiAgICB0aGlzLl8kc2VsZWN0ZWRJbWFnZUNvbnRhaW5lciA9ICRjb250YWluZXIuZmluZChcIi5zZWxlY3RlZC1pbWFnZVwiKTtcclxuXHJcbiAgICAvLyBPcGVuIG1vZGFsIG9uIGNsaWNraW5nIHNlbGVjdGVkIGltYWdlXHJcbiAgICB0aGlzLl8kc2VsZWN0ZWRJbWFnZUNvbnRhaW5lci5vbihcImNsaWNrXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9tb2RhbC5vcGVuKHRoaXMuX2luZGV4KTsgICAgXHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIExvYWQgaW1hZ2VzXHJcbiAgICB0aGlzLl8kZ2FsbGVyeUltYWdlcyA9IHRoaXMuX2xvYWRHYWxsZXJ5SW1hZ2VzKCk7XHJcbiAgICB0aGlzLl9udW1JbWFnZXMgPSB0aGlzLl8kZ2FsbGVyeUltYWdlcy5sZW5ndGg7XHJcblxyXG4gICAgLy8gU2hvdyB0aGUgZmlyc3QgaW1hZ2VcclxuICAgIHRoaXMuc2hvd0ltYWdlKDApO1xyXG59XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldEFjdGl2ZUluZGV4ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX2luZGV4O1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXROdW1JbWFnZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fbnVtSW1hZ2VzO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXRHYWxsZXJ5SW1hZ2UgPSBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLl8kZ2FsbGVyeUltYWdlc1tpbmRleF07XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldENhcHRpb24gPSBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgIHJldHVybiB0aGlzLl8kZ2FsbGVyeUltYWdlc1tpbmRleF0uZGF0YShcImNhcHRpb25cIik7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLnNob3dJbWFnZSA9IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgLy8gUmVzZXQgYWxsIGltYWdlcyB0byBpbnZpc2libGUgYW5kIGxvd2VzdCB6LWluZGV4LiBUaGlzIGNvdWxkIGJlIHNtYXJ0ZXIsXHJcbiAgICAvLyBsaWtlIEhvdmVyU2xpZGVzaG93LCBhbmQgb25seSByZXNldCBleGFjdGx5IHdoYXQgd2UgbmVlZCwgYnV0IHdlIGFyZW4ndCBcclxuICAgIC8vIHdhc3RpbmcgdGhhdCBtYW55IGN5Y2xlcy5cclxuICAgIHRoaXMuXyRnYWxsZXJ5SW1hZ2VzLmZvckVhY2goZnVuY3Rpb24gKCRnYWxsZXJ5SW1hZ2UpIHtcclxuICAgICAgICAkZ2FsbGVyeUltYWdlLmNzcyh7XHJcbiAgICAgICAgICAgIFwiekluZGV4XCI6IDAsXHJcbiAgICAgICAgICAgIFwib3BhY2l0eVwiOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGdhbGxlcnlJbWFnZS52ZWxvY2l0eShcInN0b3BcIik7IC8vIFN0b3AgYW55IGFuaW1hdGlvbnNcclxuICAgIH0sIHRoaXMpO1xyXG5cclxuICAgIC8vIENhY2hlIHJlZmVyZW5jZXMgdG8gdGhlIGxhc3QgYW5kIGN1cnJlbnQgaW1hZ2VcclxuICAgIHZhciAkbGFzdEltYWdlID0gdGhpcy5fJGdhbGxlcnlJbWFnZXNbdGhpcy5faW5kZXhdO1xyXG4gICAgdmFyICRjdXJyZW50SW1hZ2UgPSB0aGlzLl8kZ2FsbGVyeUltYWdlc1tpbmRleF07XHJcbiAgICB0aGlzLl9pbmRleCA9IGluZGV4O1xyXG5cclxuICAgIC8vIE1ha2UgdGhlIGxhc3QgaW1hZ2UgdmlzaXNibGUgYW5kIHRoZW4gYW5pbWF0ZSB0aGUgY3VycmVudCBpbWFnZSBpbnRvIHZpZXdcclxuICAgIC8vIG9uIHRvcCBvZiB0aGUgbGFzdFxyXG4gICAgJGxhc3RJbWFnZS5jc3MoXCJ6SW5kZXhcIiwgMSk7XHJcbiAgICAkY3VycmVudEltYWdlLmNzcyhcInpJbmRleFwiLCAyKTtcclxuICAgICRsYXN0SW1hZ2UuY3NzKFwib3BhY2l0eVwiLCAxKTtcclxuICAgICRjdXJyZW50SW1hZ2UudmVsb2NpdHkoe1wib3BhY2l0eVwiOiAxfSwgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uLCBcclxuICAgICAgICBcImVhc2VJbk91dFF1YWRcIik7XHJcblxyXG4gICAgLy8gQ3JlYXRlIHRoZSBjYXB0aW9uLCBpZiBpdCBleGlzdHMgb24gdGhlIHRodW1ibmFpbFxyXG4gICAgdmFyIGNhcHRpb24gPSAkY3VycmVudEltYWdlLmRhdGEoXCJjYXB0aW9uXCIpO1xyXG4gICAgaWYgKGNhcHRpb24pIHtcclxuICAgICAgICB0aGlzLl8kY2FwdGlvbkNvbnRhaW5lci5lbXB0eSgpO1xyXG4gICAgICAgICQoXCI8c3Bhbj5cIikuYWRkQ2xhc3MoXCJmaWd1cmUtbnVtYmVyXCIpXHJcbiAgICAgICAgICAgIC50ZXh0KFwiRmlnLiBcIiArICh0aGlzLl9pbmRleCArIDEpICsgXCI6IFwiKVxyXG4gICAgICAgICAgICAuYXBwZW5kVG8odGhpcy5fJGNhcHRpb25Db250YWluZXIpO1xyXG4gICAgICAgICQoXCI8c3Bhbj5cIikuYWRkQ2xhc3MoXCJjYXB0aW9uLXRleHRcIilcclxuICAgICAgICAgICAgLnRleHQoY2FwdGlvbilcclxuICAgICAgICAgICAgLmFwcGVuZFRvKHRoaXMuXyRjYXB0aW9uQ29udGFpbmVyKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBPYmplY3QgaW1hZ2UgZml0IHBvbHlmaWxsIGJyZWFrcyBqUXVlcnkgYXR0ciguLi4pLCBzbyBmYWxsYmFjayB0byBqdXN0IFxyXG4gICAgLy8gdXNpbmcgZWxlbWVudC5zcmNcclxuICAgIC8vIFRPRE86IExhenkhXHJcbiAgICAvLyBpZiAoJGN1cnJlbnRJbWFnZS5nZXQoMCkuc3JjID09PSBcIlwiKSB7XHJcbiAgICAvLyAgICAgJGN1cnJlbnRJbWFnZS5nZXQoMCkuc3JjID0gJGN1cnJlbnRJbWFnZS5kYXRhKFwiaW1hZ2UtdXJsXCIpO1xyXG4gICAgLy8gfVxyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fbG9hZEdhbGxlcnlJbWFnZXMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBDcmVhdGUgZW1wdHkgaW1hZ2VzIGluIHRoZSBnYWxsZXJ5IGZvciBlYWNoIHRodW1ibmFpbC4gVGhpcyBoZWxwcyB1cyBkb1xyXG4gICAgLy8gbGF6eSBsb2FkaW5nIG9mIGdhbGxlcnkgaW1hZ2VzIGFuZCBhbGxvd3MgdXMgdG8gY3Jvc3MtZmFkZSBpbWFnZXMuXHJcbiAgICB2YXIgJGdhbGxlcnlJbWFnZXMgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fdGh1bWJuYWlsU2xpZGVyLmdldE51bVRodW1ibmFpbHMoKTsgaSArPSAxKSB7XHJcbiAgICAgICAgLy8gR2V0IHRoZSB0aHVtYm5haWwgZWxlbWVudCB3aGljaCBoYXMgcGF0aCBhbmQgY2FwdGlvbiBkYXRhXHJcbiAgICAgICAgdmFyICR0aHVtYiA9IHRoaXMuX3RodW1ibmFpbFNsaWRlci5nZXQkVGh1bWJuYWlsKGkpO1xyXG5cclxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGlkIGZyb20gdGhlIHBhdGggdG8gdGhlIGxhcmdlIGltYWdlXHJcbiAgICAgICAgdmFyIGxhcmdlUGF0aCA9ICR0aHVtYi5kYXRhKFwibGFyZ2UtcGF0aFwiKTtcclxuICAgICAgICB2YXIgaWQgPSBsYXJnZVBhdGguc3BsaXQoXCIvXCIpLnBvcCgpLnNwbGl0KFwiLlwiKVswXTtcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIGEgZ2FsbGVyeSBpbWFnZSBlbGVtZW50XHJcbiAgICAgICAgdmFyICRnYWxsZXJ5SW1hZ2UgPSAkKFwiPGltZz5cIiwge2lkOiBpZH0pXHJcbiAgICAgICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICAgICAgICAgIHRvcDogXCIwcHhcIixcclxuICAgICAgICAgICAgICAgIGxlZnQ6IFwiMHB4XCIsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICAgICAgekluZGV4OiAwXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5kYXRhKFwiaW1hZ2UtdXJsXCIsIGxhcmdlUGF0aCkgICAgICAgICAgICBcclxuICAgICAgICAgICAgLmRhdGEoXCJjYXB0aW9uXCIsICR0aHVtYi5kYXRhKFwiY2FwdGlvblwiKSlcclxuICAgICAgICAgICAgLmFwcGVuZFRvKHRoaXMuXyRzZWxlY3RlZEltYWdlQ29udGFpbmVyKTtcclxuICAgICAgICAkZ2FsbGVyeUltYWdlLmdldCgwKS5zcmMgPSBsYXJnZVBhdGg7IC8vIFRPRE86IE1ha2UgdGhpcyBsYXp5IVxyXG4gICAgICAgICRnYWxsZXJ5SW1hZ2VzLnB1c2goJGdhbGxlcnlJbWFnZSk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gJGdhbGxlcnlJbWFnZXM7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBUaHVtYm5haWxTbGlkZXI7XHJcblxyXG5mdW5jdGlvbiBUaHVtYm5haWxTbGlkZXIoJGNvbnRhaW5lciwgc2xpZGVzaG93KSB7XHJcbiAgICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICAgIHRoaXMuX3NsaWRlc2hvdyA9IHNsaWRlc2hvdztcclxuXHJcbiAgICB0aGlzLl9pbmRleCA9IDA7IC8vIEluZGV4IG9mIHNlbGVjdGVkIHRodW1ibmFpbFxyXG4gICAgdGhpcy5fc2Nyb2xsSW5kZXggPSAwOyAvLyBJbmRleCBvZiB0aGUgdGh1bWJuYWlsIHRoYXQgaXMgY3VycmVudGx5IGNlbnRlcmVkXHJcblxyXG4gICAgLy8gQ2FjaGUgYW5kIGNyZWF0ZSBuZWNlc3NhcnkgRE9NIGVsZW1lbnRzXHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyID0gJGNvbnRhaW5lci5maW5kKFwiLnRodW1ibmFpbHNcIik7XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsSW1hZ2VzID0gdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci5maW5kKFwiaW1nXCIpO1xyXG4gICAgdGhpcy5fJHZpc2libGVUaHVtYm5haWxXcmFwID0gJGNvbnRhaW5lci5maW5kKFwiLnZpc2libGUtdGh1bWJuYWlsc1wiKTtcclxuICAgIHRoaXMuXyRhZHZhbmNlTGVmdCA9ICRjb250YWluZXIuZmluZChcIi50aHVtYm5haWwtYWR2YW5jZS1sZWZ0XCIpO1xyXG4gICAgdGhpcy5fJGFkdmFuY2VSaWdodCA9ICRjb250YWluZXIuZmluZChcIi50aHVtYm5haWwtYWR2YW5jZS1yaWdodFwiKTtcclxuXHJcbiAgICAvLyBMb29wIHRocm91Z2ggdGhlIHRodW1ibmFpbHMsIGdpdmUgdGhlbSBhbiBpbmRleCBkYXRhIGF0dHJpYnV0ZSBhbmQgY2FjaGVcclxuICAgIC8vIGEgcmVmZXJlbmNlIHRvIHRoZW0gaW4gYW4gYXJyYXlcclxuICAgIHRoaXMuXyR0aHVtYm5haWxzID0gW107XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsSW1hZ2VzLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICR0aHVtYm5haWwgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgICR0aHVtYm5haWwuZGF0YShcImluZGV4XCIsIGluZGV4KTtcclxuICAgICAgICB0aGlzLl8kdGh1bWJuYWlscy5wdXNoKCR0aHVtYm5haWwpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuX251bUltYWdlcyA9IHRoaXMuXyR0aHVtYm5haWxzLmxlbmd0aDtcclxuXHJcbiAgICAvLyBMZWZ0L3JpZ2h0IGNvbnRyb2xzXHJcbiAgICB0aGlzLl8kYWR2YW5jZUxlZnQub24oXCJjbGlja1wiLCB0aGlzLmFkdmFuY2VMZWZ0LmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5fJGFkdmFuY2VSaWdodC5vbihcImNsaWNrXCIsIHRoaXMuYWR2YW5jZVJpZ2h0LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIENsaWNraW5nIGEgdGh1bWJuYWlsXHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsSW1hZ2VzLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB0aGlzLl9hY3RpdmF0ZVRodW1ibmFpbCgwKTtcclxuXHJcbiAgICAvLyBSZXNpemVcclxuICAgICQod2luZG93KS5vbihcInJlc2l6ZVwiLCB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBGb3Igc29tZSByZWFzb24sIHRoZSBzaXppbmcgb24gdGhlIGNvbnRyb2xzIGlzIG1lc3NlZCB1cCBpZiBpdCBydW5zXHJcbiAgICAvLyBpbW1lZGlhdGVseSAtIGRlbGF5IHNpemluZyB1bnRpbCBzdGFjayBpcyBjbGVhclxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fb25SZXNpemUoKTtcclxuICAgIH0uYmluZCh0aGlzKSwgMCk7XHJcbn1cclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuZ2V0QWN0aXZlSW5kZXggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5faW5kZXg7XHJcbn07XHJcblxyXG5UaHVtYm5haWxTbGlkZXIucHJvdG90eXBlLmdldE51bVRodW1ibmFpbHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fbnVtSW1hZ2VzO1xyXG59O1xyXG5cclxuVGh1bWJuYWlsU2xpZGVyLnByb3RvdHlwZS5nZXQkVGh1bWJuYWlsID0gZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICByZXR1cm4gdGhpcy5fJHRodW1ibmFpbHNbaW5kZXhdO1xyXG59O1xyXG5cclxuVGh1bWJuYWlsU2xpZGVyLnByb3RvdHlwZS5hZHZhbmNlTGVmdCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBuZXdJbmRleCA9IHRoaXMuX3Njcm9sbEluZGV4IC0gdGhpcy5fbnVtVmlzaWJsZTtcclxuICAgIG5ld0luZGV4ID0gTWF0aC5tYXgobmV3SW5kZXgsIDApO1xyXG4gICAgdGhpcy5fc2Nyb2xsVG9UaHVtYm5haWwobmV3SW5kZXgpO1xyXG59O1xyXG5cclxuVGh1bWJuYWlsU2xpZGVyLnByb3RvdHlwZS5hZHZhbmNlUmlnaHQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbmV3SW5kZXggPSB0aGlzLl9zY3JvbGxJbmRleCArIHRoaXMuX251bVZpc2libGU7XHJcbiAgICBuZXdJbmRleCA9IE1hdGgubWluKG5ld0luZGV4LCB0aGlzLl9udW1JbWFnZXMgLSAxKTtcclxuICAgIHRoaXMuX3Njcm9sbFRvVGh1bWJuYWlsKG5ld0luZGV4KTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX3Jlc2V0U2l6aW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gUmVzZXQgc2l6aW5nIHZhcmlhYmxlcy4gVGhpcyBpbmNsdWRlcyByZXNldHRpbmcgYW55IGlubGluZSBzdHlsZSB0aGF0IGhhc1xyXG4gICAgLy8gYmVlbiBhcHBsaWVkLCBzbyB0aGF0IGFueSBzaXplIGNhbGN1bGF0aW9ucyBjYW4gYmUgYmFzZWQgb24gdGhlIENTU1xyXG4gICAgLy8gc3R5bGluZy5cclxuICAgIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIuY3NzKHtcclxuICAgICAgICB0b3A6IFwiXCIsIGxlZnQ6IFwiXCIsIHdpZHRoOiBcIlwiLCBoZWlnaHQ6IFwiXCJcclxuICAgIH0pO1xyXG4gICAgdGhpcy5fJHZpc2libGVUaHVtYm5haWxXcmFwLndpZHRoKFwiXCIpO1xyXG4gICAgdGhpcy5fJHZpc2libGVUaHVtYm5haWxXcmFwLmhlaWdodChcIlwiKTtcclxuICAgIC8vIE1ha2UgYWxsIHRodW1ibmFpbHMgc3F1YXJlIGFuZCByZXNldCBhbnkgaGVpZ2h0XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlscy5mb3JFYWNoKGZ1bmN0aW9uICgkZWxlbWVudCkgeyBcclxuICAgICAgICAkZWxlbWVudC5oZWlnaHQoXCJcIik7IC8vIFJlc2V0IGhlaWdodCBiZWZvcmUgc2V0dGluZyB3aWR0aFxyXG4gICAgICAgICRlbGVtZW50LndpZHRoKCRlbGVtZW50LmhlaWdodCgpKTtcclxuICAgIH0pO1xyXG59O1xyXG5cclxuVGh1bWJuYWlsU2xpZGVyLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9yZXNldFNpemluZygpO1xyXG5cclxuICAgIC8vIENhbGN1bGF0ZSB0aGUgc2l6ZSBvZiB0aGUgZmlyc3QgdGh1bWJuYWlsLiBUaGlzIGFzc3VtZXMgdGhlIGZpcnN0IGltYWdlXHJcbiAgICAvLyBvbmx5IGhhcyBhIHJpZ2h0LXNpZGUgbWFyZ2luLlxyXG4gICAgdmFyICRmaXJzdFRodW1iID0gdGhpcy5fJHRodW1ibmFpbHNbMF07XHJcbiAgICB2YXIgdGh1bWJTaXplID0gJGZpcnN0VGh1bWIub3V0ZXJIZWlnaHQoZmFsc2UpO1xyXG4gICAgdmFyIHRodW1iTWFyZ2luID0gMiAqICgkZmlyc3RUaHVtYi5vdXRlcldpZHRoKHRydWUpIC0gdGh1bWJTaXplKTtcclxuXHJcbiAgICAvLyBNZWFzdXJlIGNvbnRyb2xzLiBUaGV5IG5lZWQgdG8gYmUgdmlzaWJsZSBpbiBvcmRlciB0byBiZSBtZWFzdXJlZC5cclxuICAgIHRoaXMuXyRhZHZhbmNlUmlnaHQuY3NzKFwiZGlzcGxheVwiLCBcImJsb2NrXCIpO1xyXG4gICAgdGhpcy5fJGFkdmFuY2VMZWZ0LmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcclxuICAgIHZhciB0aHVtYkNvbnRyb2xXaWR0aCA9IHRoaXMuXyRhZHZhbmNlUmlnaHQub3V0ZXJXaWR0aCh0cnVlKSArXHJcbiAgICAgICAgdGhpcy5fJGFkdmFuY2VMZWZ0Lm91dGVyV2lkdGgodHJ1ZSk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIGhvdyBtYW55IGZ1bGwgdGh1bWJuYWlscyBjYW4gZml0IHdpdGhpbiB0aGUgdGh1bWJuYWlsIGFyZWFcclxuICAgIHZhciB2aXNpYmxlV2lkdGggPSB0aGlzLl8kdmlzaWJsZVRodW1ibmFpbFdyYXAub3V0ZXJXaWR0aChmYWxzZSk7XHJcbiAgICB2YXIgbnVtVGh1bWJzVmlzaWJsZSA9IE1hdGguZmxvb3IoXHJcbiAgICAgICAgKHZpc2libGVXaWR0aCAtIHRodW1iTWFyZ2luKSAvICh0aHVtYlNpemUgKyB0aHVtYk1hcmdpbilcclxuICAgICk7XHJcblxyXG4gICAgLy8gQ2hlY2sgd2hldGhlciBhbGwgdGhlIHRodW1ibmFpbHMgY2FuIGZpdCBvbiB0aGUgc2NyZWVuIGF0IG9uY2VcclxuICAgIGlmIChudW1UaHVtYnNWaXNpYmxlIDwgdGhpcy5fbnVtSW1hZ2VzKSB7XHJcbiAgICAgICAgLy8gVGFrZSBhIGJlc3QgZ3Vlc3MgYXQgaG93IHRvIHNpemUgdGhlIHRodW1ibmFpbHMuIFNpemUgZm9ybXVsYTpcclxuICAgICAgICAvLyAgd2lkdGggPSBudW0gKiB0aHVtYlNpemUgKyAobnVtIC0gMSkgKiB0aHVtYk1hcmdpbiArIGNvbnRyb2xTaXplXHJcbiAgICAgICAgLy8gU29sdmUgZm9yIG51bWJlciBvZiB0aHVtYm5haWxzIGFuZCByb3VuZCB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyIHNvIFxyXG4gICAgICAgIC8vIHRoYXQgd2UgZG9uJ3QgaGF2ZSBhbnkgcGFydGlhbCB0aHVtYm5haWxzIHNob3dpbmcuXHJcbiAgICAgICAgbnVtVGh1bWJzVmlzaWJsZSA9IE1hdGgucm91bmQoXHJcbiAgICAgICAgICAgICh2aXNpYmxlV2lkdGggLSB0aHVtYkNvbnRyb2xXaWR0aCArIHRodW1iTWFyZ2luKSAvIFxyXG4gICAgICAgICAgICAodGh1bWJTaXplICsgdGh1bWJNYXJnaW4pXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgLy8gVXNlIHRoaXMgbnVtYmVyIG9mIHRodW1ibmFpbHMgdG8gY2FsY3VsYXRlIHRoZSB0aHVtYm5haWwgc2l6ZVxyXG4gICAgICAgIHZhciBuZXdTaXplID0gKHZpc2libGVXaWR0aCAtIHRodW1iQ29udHJvbFdpZHRoICsgdGh1bWJNYXJnaW4pIC8gXHJcbiAgICAgICAgICAgIG51bVRodW1ic1Zpc2libGUgLSB0aHVtYk1hcmdpbjtcclxuICAgICAgICB0aGlzLl8kdGh1bWJuYWlscy5mb3JFYWNoKGZ1bmN0aW9uICgkZWxlbWVudCkge1xyXG4gICAgICAgICAgICAvLyAkLndpZHRoIGFuZCAkLmhlaWdodCBzZXQgdGhlIGNvbnRlbnQgc2l6ZSByZWdhcmRsZXNzIG9mIHRoZSBcclxuICAgICAgICAgICAgLy8gYm94LXNpemluZy4gVGhlIGltYWdlcyBhcmUgYm9yZGVyLWJveCwgc28gd2Ugd2FudCB0aGUgQ1NTIHdpZHRoXHJcbiAgICAgICAgICAgIC8vIGFuZCBoZWlnaHQuIFRoaXMgYWxsb3dzIHRoZSBhY3RpdmUgaW1hZ2UgdG8gaGF2ZSBhIGJvcmRlciBhbmQgdGhlXHJcbiAgICAgICAgICAgIC8vIG90aGVyIGltYWdlcyB0byBoYXZlIHBhZGRpbmcuIFxyXG4gICAgICAgICAgICAkZWxlbWVudC5jc3MoXCJ3aWR0aFwiLCBuZXdTaXplICsgXCJweFwiKTtcclxuICAgICAgICAgICAgJGVsZW1lbnQuY3NzKFwiaGVpZ2h0XCIsIG5ld1NpemUgKyBcInB4XCIpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBTZXQgdGhlIHRodW1ibmFpbCB3cmFwIHNpemUuIEl0IHNob3VsZCBiZSBqdXN0IHRhbGwgZW5vdWdoIHRvIGZpdCBhXHJcbiAgICAgICAgLy8gdGh1bWJuYWlsIGFuZCBsb25nIGVub3VnaCB0byBob2xkIGFsbCB0aGUgdGh1bWJuYWlscyBpbiBvbmUgbGluZTpcclxuICAgICAgICB2YXIgdG90YWxTaXplID0gbmV3U2l6ZSAqIHRoaXMuX251bUltYWdlcyArIFxyXG4gICAgICAgICAgICB0aHVtYk1hcmdpbiAqICh0aGlzLl9udW1JbWFnZXMgLSAxKTtcclxuICAgICAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyLmNzcyh7XHJcbiAgICAgICAgICAgIHdpZHRoOiB0b3RhbFNpemUgKyBcInB4XCIsXHJcbiAgICAgICAgICAgIGhlaWdodDogJGZpcnN0VGh1bWIub3V0ZXJIZWlnaHQodHJ1ZSkgKyBcInB4XCJcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU2V0IHRoZSB2aXNpYmxlIHRodW1ibmFpbCB3cmFwIHNpemUuIFRoaXMgaXMgdXNlZCB0byBtYWtzIHRoZSBtdWNoIFxyXG4gICAgICAgIC8vIGxhcmdlciB0aHVtYm5haWwgY29udGFpbmVyLiBJdCBzaG91bGQgYmUgYXMgd2lkZSBhcyBpdCBjYW4gYmUsIG1pbnVzXHJcbiAgICAgICAgLy8gdGhlIHNwYWNlIG5lZWRlZCBmb3IgdGhlIGxlZnQvcmlnaHQgY29udG9scy5cclxuICAgICAgICB0aGlzLl8kdmlzaWJsZVRodW1ibmFpbFdyYXAuY3NzKHtcclxuICAgICAgICAgICAgd2lkdGg6IHZpc2libGVXaWR0aCAtIHRodW1iQ29udHJvbFdpZHRoICsgXCJweFwiLFxyXG4gICAgICAgICAgICBoZWlnaHQ6ICRmaXJzdFRodW1iLm91dGVySGVpZ2h0KHRydWUpICsgXCJweFwiXHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIEFsbCB0aHVtYm5haWxzIGFyZSB2aXNpYmxlLCB3ZSBjYW4gaGlkZSB0aGUgY29udHJvbHMgYW5kIGV4cGFuZCB0aGVcclxuICAgICAgICAvLyB0aHVtYm5haWwgY29udGFpbmVyIHRvIDEwMCVcclxuICAgICAgICBudW1UaHVtYnNWaXNpYmxlID0gdGhpcy5fbnVtSW1hZ2VzO1xyXG4gICAgICAgIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIuY3NzKFwid2lkdGhcIiwgXCIxMDAlXCIpO1xyXG4gICAgICAgIHRoaXMuXyRhZHZhbmNlUmlnaHQuY3NzKFwiZGlzcGxheVwiLCBcIm5vbmVcIik7XHJcbiAgICAgICAgdGhpcy5fJGFkdmFuY2VMZWZ0LmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuX251bVZpc2libGUgPSBudW1UaHVtYnNWaXNpYmxlO1xyXG4gICAgdmFyIG1pZGRsZUluZGV4ID0gTWF0aC5mbG9vcigodGhpcy5fbnVtVmlzaWJsZSAtIDEpIC8gMik7XHJcbiAgICB0aGlzLl9zY3JvbGxCb3VuZHMgPSB7XHJcbiAgICAgICAgbWluOiBtaWRkbGVJbmRleCxcclxuICAgICAgICBtYXg6IHRoaXMuX251bUltYWdlcyAtIDEgLSBtaWRkbGVJbmRleFxyXG4gICAgfTtcclxuICAgIGlmICh0aGlzLl9udW1WaXNpYmxlICUgMiA9PT0gMCkgdGhpcy5fc2Nyb2xsQm91bmRzLm1heCAtPSAxO1xyXG5cclxuICAgIHRoaXMuX3VwZGF0ZVRodW1ibmFpbENvbnRyb2xzKCk7XHJcbn07XHJcblxyXG5UaHVtYm5haWxTbGlkZXIucHJvdG90eXBlLl9hY3RpdmF0ZVRodW1ibmFpbCA9IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgLy8gQWN0aXZhdGUvZGVhY3RpdmF0ZSB0aHVtYm5haWxzXHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsc1t0aGlzLl9pbmRleF0ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsc1tpbmRleF0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbn07XHJcblxyXG5UaHVtYm5haWxTbGlkZXIucHJvdG90eXBlLl9zY3JvbGxUb1RodW1ibmFpbCA9IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgLy8gTm8gbmVlZCB0byBzY3JvbGwgaWYgYWxsIHRodW1ibmFpbHMgYXJlIHZpc2libGVcclxuICAgIGlmICh0aGlzLl9udW1WaXNpYmxlID09PSB0aGlzLl9udW1JbWFnZXMpIHJldHVybjtcclxuXHJcbiAgICAvLyBDb25zdHJhaW4gaW5kZXggc28gdGhhdCB3ZSBjYW4ndCBzY3JvbGwgb3V0IG9mIGJvdW5kcyBcclxuICAgIGluZGV4ID0gTWF0aC5tYXgoaW5kZXgsIHRoaXMuX3Njcm9sbEJvdW5kcy5taW4pO1xyXG4gICAgaW5kZXggPSBNYXRoLm1pbihpbmRleCwgdGhpcy5fc2Nyb2xsQm91bmRzLm1heCk7XHJcbiAgICB0aGlzLl9zY3JvbGxJbmRleCA9IGluZGV4O1xyXG4gICAgXHJcbiAgICAvLyBGaW5kIHRoZSBcImxlZnRcIiBwb3NpdGlvbiBvZiB0aGUgdGh1bWJuYWlsIGNvbnRhaW5lciB0aGF0IHdvdWxkIHB1dCB0aGUgXHJcbiAgICAvLyB0aHVtYm5haWwgYXQgaW5kZXggYXQgdGhlIGNlbnRlclxyXG4gICAgdmFyICR0aHVtYiA9IHRoaXMuXyR0aHVtYm5haWxzWzBdO1xyXG4gICAgdmFyIHNpemUgPSBwYXJzZUZsb2F0KCR0aHVtYi5jc3MoXCJ3aWR0aFwiKSk7XHJcbiAgICB2YXIgbWFyZ2luID0gMiAqIHBhcnNlRmxvYXQoJHRodW1iLmNzcyhcIm1hcmdpbi1yaWdodFwiKSk7IFxyXG4gICAgdmFyIGNlbnRlclggPSBzaXplICogdGhpcy5fc2Nyb2xsQm91bmRzLm1pbiArIFxyXG4gICAgICAgIG1hcmdpbiAqICh0aGlzLl9zY3JvbGxCb3VuZHMubWluIC0gMSk7XHJcbiAgICB2YXIgdGh1bWJYID0gc2l6ZSAqIGluZGV4ICsgbWFyZ2luICogKGluZGV4IC0gMSk7XHJcbiAgICB2YXIgbGVmdCA9IGNlbnRlclggLSB0aHVtYlg7XHJcblxyXG4gICAgLy8gQW5pbWF0ZSB0aGUgdGh1bWJuYWlsIGNvbnRhaW5lclxyXG4gICAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyLnZlbG9jaXR5KHtcclxuICAgICAgICBcImxlZnRcIjogbGVmdCArIFwicHhcIlxyXG4gICAgfSwgNjAwLCBcImVhc2VJbk91dFF1YWRcIik7XHJcblxyXG4gICAgdGhpcy5fdXBkYXRlVGh1bWJuYWlsQ29udHJvbHMoKTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX29uQ2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuICAgIHZhciBpbmRleCA9ICR0YXJnZXQuZGF0YShcImluZGV4XCIpO1xyXG4gICAgXHJcbiAgICAvLyBDbGlja2VkIG9uIHRoZSBhY3RpdmUgaW1hZ2UgLSBubyBuZWVkIHRvIGRvIGFueXRoaW5nXHJcbiAgICBpZiAodGhpcy5faW5kZXggIT09IGluZGV4KSB7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVUaHVtYm5haWwoaW5kZXgpO1xyXG4gICAgICAgIHRoaXMuX3Njcm9sbFRvVGh1bWJuYWlsKGluZGV4KTtcclxuICAgICAgICB0aGlzLl9pbmRleCA9IGluZGV4O1xyXG4gICAgICAgIHRoaXMuX3NsaWRlc2hvdy5zaG93SW1hZ2UoaW5kZXgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuVGh1bWJuYWlsU2xpZGVyLnByb3RvdHlwZS5fdXBkYXRlVGh1bWJuYWlsQ29udHJvbHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBSZS1lbmFibGVcclxuICAgIHRoaXMuXyRhZHZhbmNlTGVmdC5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgdGhpcy5fJGFkdmFuY2VSaWdodC5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gICAgXHJcbiAgICAvLyBEaXNhYmxlIGlmIHdlJ3ZlIHJlYWNoZWQgdGhlIHRoZSBtYXggb3IgbWluIGxpbWl0XHJcbiAgICAvLyB2YXIgbWlkU2Nyb2xsSW5kZXggPSBNYXRoLmZsb29yKCh0aGlzLl9udW1WaXNpYmxlIC0gMSkgLyAyKTtcclxuICAgIC8vIHZhciBtaW5TY3JvbGxJbmRleCA9IG1pZFNjcm9sbEluZGV4O1xyXG4gICAgLy8gdmFyIG1heFNjcm9sbEluZGV4ID0gdGhpcy5fbnVtSW1hZ2VzIC0gMSAtIG1pZFNjcm9sbEluZGV4O1xyXG4gICAgaWYgKHRoaXMuX3Njcm9sbEluZGV4ID49IHRoaXMuX3Njcm9sbEJvdW5kcy5tYXgpIHtcclxuICAgICAgICB0aGlzLl8kYWR2YW5jZVJpZ2h0LmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3Njcm9sbEluZGV4IDw9IHRoaXMuX3Njcm9sbEJvdW5kcy5taW4pIHtcclxuICAgICAgICB0aGlzLl8kYWR2YW5jZUxlZnQuYWRkQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuICAgIH1cclxufTsiLCJleHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAodmFsLCBkZWZhdWx0VmFsKSB7XHJcbiAgICByZXR1cm4gKHZhbCAhPT0gdW5kZWZpbmVkKSA/IHZhbCA6IGRlZmF1bHRWYWw7XHJcbn07XHJcblxyXG4vLyBVbnRlc3RlZFxyXG4vLyBleHBvcnRzLmRlZmF1bHRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gZGVmYXVsdFByb3BlcnRpZXMgKG9iaiwgcHJvcHMpIHtcclxuLy8gICAgIGZvciAodmFyIHByb3AgaW4gcHJvcHMpIHtcclxuLy8gICAgICAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkocHJvcHMsIHByb3ApKSB7XHJcbi8vICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGV4cG9ydHMuZGVmYXVsdFZhbHVlKHByb3BzLnZhbHVlLCBwcm9wcy5kZWZhdWx0KTtcclxuLy8gICAgICAgICAgICAgb2JqW3Byb3BdID0gdmFsdWU7XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgfVxyXG4vLyAgICAgcmV0dXJuIG9iajtcclxuLy8gfTtcclxuLy8gXHJcbmV4cG9ydHMudGltZUl0ID0gZnVuY3Rpb24gKGZ1bmMpIHtcclxuICAgIHZhciBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgZnVuYygpO1xyXG4gICAgdmFyIGVuZCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgcmV0dXJuIGVuZCAtIHN0YXJ0O1xyXG59O1xyXG5cclxuZXhwb3J0cy5pc0luUmVjdCA9IGZ1bmN0aW9uICh4LCB5LCByZWN0KSB7XHJcbiAgICBpZiAoeCA+PSByZWN0LnggJiYgeCA8PSAocmVjdC54ICsgcmVjdC53KSAmJlxyXG4gICAgICAgIHkgPj0gcmVjdC55ICYmIHkgPD0gKHJlY3QueSArIHJlY3QuaCkpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbmV4cG9ydHMucmFuZEludCA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbn07XHJcblxyXG5leHBvcnRzLnJhbmRBcnJheUVsZW1lbnQgPSBmdW5jdGlvbiAoYXJyYXkpIHtcclxuICAgIHZhciBpID0gZXhwb3J0cy5yYW5kSW50KDAsIGFycmF5Lmxlbmd0aCAtIDEpOyAgICBcclxuICAgIHJldHVybiBhcnJheVtpXTtcclxufTtcclxuXHJcbmV4cG9ydHMubWFwID0gZnVuY3Rpb24gKG51bSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Miwgb3B0aW9ucykge1xyXG4gICAgdmFyIG1hcHBlZCA9IChudW0gLSBtaW4xKSAvIChtYXgxIC0gbWluMSkgKiAobWF4MiAtIG1pbjIpICsgbWluMjtcclxuICAgIGlmICghb3B0aW9ucykgcmV0dXJuIG1hcHBlZDtcclxuICAgIGlmIChvcHRpb25zLnJvdW5kICYmIG9wdGlvbnMucm91bmQgPT09IHRydWUpIHtcclxuICAgICAgICBtYXBwZWQgPSBNYXRoLnJvdW5kKG1hcHBlZCk7XHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy5mbG9vciAmJiBvcHRpb25zLmZsb29yID09PSB0cnVlKSB7XHJcbiAgICAgICAgbWFwcGVkID0gTWF0aC5mbG9vcihtYXBwZWQpOyAgICAgICAgXHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy5jZWlsICYmIG9wdGlvbnMuY2VpbCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIG1hcHBlZCA9IE1hdGguY2VpbChtYXBwZWQpOyAgICAgICAgXHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy5jbGFtcCAmJiBvcHRpb25zLmNsYW1wID09PSB0cnVlKSB7XHJcbiAgICAgICAgbWFwcGVkID0gTWF0aC5taW4obWFwcGVkLCBtYXgyKTtcclxuICAgICAgICBtYXBwZWQgPSBNYXRoLm1heChtYXBwZWQsIG1pbjIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1hcHBlZDtcclxufTtcclxuXHJcbmV4cG9ydHMuZ2V0UXVlcnlQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gQ2hlY2sgZm9yIHF1ZXJ5IHN0cmluZ1xyXG4gICAgdmFyIHFzID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcclxuICAgIGlmIChxcy5sZW5ndGggPD0gMSkgcmV0dXJuIHt9O1xyXG4gICAgLy8gUXVlcnkgc3RyaW5nIGV4aXN0cywgcGFyc2UgaXQgaW50byBhIHF1ZXJ5IG9iamVjdFxyXG4gICAgcXMgPSBxcy5zdWJzdHJpbmcoMSk7IC8vIFJlbW92ZSB0aGUgXCI/XCIgZGVsaW1pdGVyXHJcbiAgICB2YXIga2V5VmFsUGFpcnMgPSBxcy5zcGxpdChcIiZcIik7XHJcbiAgICB2YXIgcXVlcnlPYmplY3QgPSB7fTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5VmFsUGFpcnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIga2V5VmFsID0ga2V5VmFsUGFpcnNbaV0uc3BsaXQoXCI9XCIpO1xyXG4gICAgICAgIGlmIChrZXlWYWwubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5VmFsWzBdKTtcclxuICAgICAgICAgICAgdmFyIHZhbCA9IGRlY29kZVVSSUNvbXBvbmVudChrZXlWYWxbMV0pO1xyXG4gICAgICAgICAgICBxdWVyeU9iamVjdFtrZXldID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBxdWVyeU9iamVjdDtcclxufTtcclxuXHJcbmV4cG9ydHMuY3JlYXRlUXVlcnlTdHJpbmcgPSBmdW5jdGlvbiAocXVlcnlPYmplY3QpIHtcclxuICAgIGlmICh0eXBlb2YgcXVlcnlPYmplY3QgIT09IFwib2JqZWN0XCIpIHJldHVybiBcIlwiO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhxdWVyeU9iamVjdCk7XHJcbiAgICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHJldHVybiBcIlwiO1xyXG4gICAgdmFyIHF1ZXJ5U3RyaW5nID0gXCI/XCI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcclxuICAgICAgICB2YXIgdmFsID0gcXVlcnlPYmplY3Rba2V5XTtcclxuICAgICAgICBxdWVyeVN0cmluZyArPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbCk7XHJcbiAgICAgICAgaWYgKGkgIT09IGtleXMubGVuZ3RoIC0gMSkgcXVlcnlTdHJpbmcgKz0gXCImXCI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcXVlcnlTdHJpbmc7XHJcbn07XHJcblxyXG5leHBvcnRzLndyYXBJbmRleCA9IGZ1bmN0aW9uIChpbmRleCwgbGVuZ3RoKSB7XHJcbiAgICB2YXIgd3JhcHBlZEluZGV4ID0gKGluZGV4ICUgbGVuZ3RoKTsgXHJcbiAgICBpZiAod3JhcHBlZEluZGV4IDwgMCkge1xyXG4gICAgICAgIC8vIElmIG5lZ2F0aXZlLCBmbGlwIHRoZSBpbmRleCBzbyB0aGF0IC0xIGJlY29tZXMgdGhlIGxhc3QgaXRlbSBpbiBsaXN0IFxyXG4gICAgICAgIHdyYXBwZWRJbmRleCA9IGxlbmd0aCArIHdyYXBwZWRJbmRleDtcclxuICAgIH1cclxuICAgIHJldHVybiB3cmFwcGVkSW5kZXg7XHJcbn07XHJcbiJdLCJwcmVFeGlzdGluZ0NvbW1lbnQiOiIvLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldD11dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5aWNtOTNjMlZ5TFhCaFkyc3ZYM0J5Wld4MVpHVXVhbk1pTENKdWIyUmxYMjF2WkhWc1pYTXZhbk10WTI5dmEybGxMM055WXk5cWN5NWpiMjlyYVdVdWFuTWlMQ0p1YjJSbFgyMXZaSFZzWlhNdmNEVXRZbUp2ZUMxaGJHbG5ibVZrTFhSbGVIUXZiR2xpTDJKaWIzZ3RZV3hwWjI1bFpDMTBaWGgwTG1weklpd2libTlrWlY5dGIyUjFiR1Z6TDNBMUxXSmliM2d0WVd4cFoyNWxaQzEwWlhoMEwyeHBZaTkxZEdsc2N5NXFjeUlzSW5OeVl5OXFjeTlvYjNabGNpMXpiR2xrWlhOb2IzY3Vhbk1pTENKemNtTXZhbk12YVc1MFpYSmhZM1JwZG1VdGJHOW5iM012WW1GelpTMXNiMmR2TFhOclpYUmphQzVxY3lJc0luTnlZeTlxY3k5cGJuUmxjbUZqZEdsMlpTMXNiMmR2Y3k5amIyNXVaV04wTFhCdmFXNTBjeTF6YTJWMFkyZ3Vhbk1pTENKemNtTXZhbk12YVc1MFpYSmhZM1JwZG1VdGJHOW5iM012WjJWdVpYSmhkRzl5Y3k5dWIybHpaUzFuWlc1bGNtRjBiM0p6TG1weklpd2ljM0pqTDJwekwybHVkR1Z5WVdOMGFYWmxMV3h2WjI5ekwyZGxibVZ5WVhSdmNuTXZjMmx1TFdkbGJtVnlZWFJ2Y2k1cWN5SXNJbk55WXk5cWN5OXBiblJsY21GamRHbDJaUzFzYjJkdmN5OW9ZV3htZEc5dVpTMW1iR0Z6YUd4cFoyaDBMWGR2Y21RdWFuTWlMQ0p6Y21NdmFuTXZhVzUwWlhKaFkzUnBkbVV0Ykc5bmIzTXZibTlwYzNrdGQyOXlaQzF6YTJWMFkyZ3Vhbk1pTENKemNtTXZhbk12YldGcGJpMXVZWFl1YW5NaUxDSnpjbU12YW5NdmJXRnBiaTVxY3lJc0luTnlZeTlxY3k5d1lXZGxMV3h2WVdSbGNpNXFjeUlzSW5OeVl5OXFjeTl3YVdOckxYSmhibVJ2YlMxemEyVjBZMmd1YW5NaUxDSnpjbU12YW5NdmNHOXlkR1p2YkdsdkxXWnBiSFJsY2k1cWN5SXNJbk55WXk5cWN5OTBhSFZ0WW01aGFXd3RjMnhwWkdWemFHOTNMM05zYVdSbGMyaHZkeTF0YjJSaGJDNXFjeUlzSW5OeVl5OXFjeTkwYUhWdFltNWhhV3d0YzJ4cFpHVnphRzkzTDNOc2FXUmxjMmh2ZHk1cWN5SXNJbk55WXk5cWN5OTBhSFZ0WW01aGFXd3RjMnhwWkdWemFHOTNMM1JvZFcxaWJtRnBiQzF6Ykdsa1pYSXVhbk1pTENKemNtTXZhbk12ZFhScGJHbDBhV1Z6TG1weklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lKQlFVRkJPMEZEUVVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGRGNrdEJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVU5xV2tFN1FVRkRRVHRCUVVOQk96dEJRMFpCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUTJwSlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRMnhNUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlEycEhRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUXpGSFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZEZUVSQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRemxJUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlEzUkZRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZEYkVSQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkROMFJCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZET1VOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZETVVSQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZEYms1Qk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUXk5S1FUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUTJ4SlFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlEyeFBRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRU0lzSW1acGJHVWlPaUpuWlc1bGNtRjBaV1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaUtHWjFibU4wYVc5dUlHVW9kQ3h1TEhJcGUyWjFibU4wYVc5dUlITW9ieXgxS1h0cFppZ2hibHR2WFNsN2FXWW9JWFJiYjEwcGUzWmhjaUJoUFhSNWNHVnZaaUJ5WlhGMWFYSmxQVDFjSW1aMWJtTjBhVzl1WENJbUpuSmxjWFZwY21VN2FXWW9JWFVtSm1FcGNtVjBkWEp1SUdFb2J5d2hNQ2s3YVdZb2FTbHlaWFIxY200Z2FTaHZMQ0V3S1R0MllYSWdaajF1WlhjZ1JYSnliM0lvWENKRFlXNXViM1FnWm1sdVpDQnRiMlIxYkdVZ0oxd2lLMjhyWENJblhDSXBPM1JvY205M0lHWXVZMjlrWlQxY0lrMVBSRlZNUlY5T1QxUmZSazlWVGtSY0lpeG1mWFpoY2lCc1BXNWJiMTA5ZTJWNGNHOXlkSE02ZTMxOU8zUmJiMTFiTUYwdVkyRnNiQ2hzTG1WNGNHOXlkSE1zWm5WdVkzUnBiMjRvWlNsN2RtRnlJRzQ5ZEZ0dlhWc3hYVnRsWFR0eVpYUjFjbTRnY3lodVAyNDZaU2w5TEd3c2JDNWxlSEJ2Y25SekxHVXNkQ3h1TEhJcGZYSmxkSFZ5YmlCdVcyOWRMbVY0Y0c5eWRITjlkbUZ5SUdrOWRIbHdaVzltSUhKbGNYVnBjbVU5UFZ3aVpuVnVZM1JwYjI1Y0lpWW1jbVZ4ZFdseVpUdG1iM0lvZG1GeUlHODlNRHR2UEhJdWJHVnVaM1JvTzI4ckt5bHpLSEpiYjEwcE8zSmxkSFZ5YmlCemZTa2lMQ0l2S2lGY2JpQXFJRXBoZG1GVFkzSnBjSFFnUTI5dmEybGxJSFl5TGpFdU5GeHVJQ29nYUhSMGNITTZMeTluYVhSb2RXSXVZMjl0TDJwekxXTnZiMnRwWlM5cWN5MWpiMjlyYVdWY2JpQXFYRzRnS2lCRGIzQjVjbWxuYUhRZ01qQXdOaXdnTWpBeE5TQkxiR0YxY3lCSVlYSjBiQ0FtSUVaaFoyNWxjaUJDY21GamExeHVJQ29nVW1Wc1pXRnpaV1FnZFc1a1pYSWdkR2hsSUUxSlZDQnNhV05sYm5ObFhHNGdLaTljYmpzb1puVnVZM1JwYjI0Z0tHWmhZM1J2Y25rcElIdGNibHgwZG1GeUlISmxaMmx6ZEdWeVpXUkpiazF2WkhWc1pVeHZZV1JsY2lBOUlHWmhiSE5sTzF4dVhIUnBaaUFvZEhsd1pXOW1JR1JsWm1sdVpTQTlQVDBnSjJaMWJtTjBhVzl1SnlBbUppQmtaV1pwYm1VdVlXMWtLU0I3WEc1Y2RGeDBaR1ZtYVc1bEtHWmhZM1J2Y25rcE8xeHVYSFJjZEhKbFoybHpkR1Z5WldSSmJrMXZaSFZzWlV4dllXUmxjaUE5SUhSeWRXVTdYRzVjZEgxY2JseDBhV1lnS0hSNWNHVnZaaUJsZUhCdmNuUnpJRDA5UFNBbmIySnFaV04wSnlrZ2UxeHVYSFJjZEcxdlpIVnNaUzVsZUhCdmNuUnpJRDBnWm1GamRHOXllU2dwTzF4dVhIUmNkSEpsWjJsemRHVnlaV1JKYmsxdlpIVnNaVXh2WVdSbGNpQTlJSFJ5ZFdVN1hHNWNkSDFjYmx4MGFXWWdLQ0Z5WldkcGMzUmxjbVZrU1c1TmIyUjFiR1ZNYjJGa1pYSXBJSHRjYmx4MFhIUjJZWElnVDJ4a1EyOXZhMmxsY3lBOUlIZHBibVJ2ZHk1RGIyOXJhV1Z6TzF4dVhIUmNkSFpoY2lCaGNHa2dQU0IzYVc1a2IzY3VRMjl2YTJsbGN5QTlJR1poWTNSdmNua29LVHRjYmx4MFhIUmhjR2t1Ym05RGIyNW1iR2xqZENBOUlHWjFibU4wYVc5dUlDZ3BJSHRjYmx4MFhIUmNkSGRwYm1SdmR5NURiMjlyYVdWeklEMGdUMnhrUTI5dmEybGxjenRjYmx4MFhIUmNkSEpsZEhWeWJpQmhjR2s3WEc1Y2RGeDBmVHRjYmx4MGZWeHVmU2htZFc1amRHbHZiaUFvS1NCN1hHNWNkR1oxYm1OMGFXOXVJR1Y0ZEdWdVpDQW9LU0I3WEc1Y2RGeDBkbUZ5SUdrZ1BTQXdPMXh1WEhSY2RIWmhjaUJ5WlhOMWJIUWdQU0I3ZlR0Y2JseDBYSFJtYjNJZ0tEc2dhU0E4SUdGeVozVnRaVzUwY3k1c1pXNW5kR2c3SUdrckt5a2dlMXh1WEhSY2RGeDBkbUZ5SUdGMGRISnBZblYwWlhNZ1BTQmhjbWQxYldWdWRITmJJR2tnWFR0Y2JseDBYSFJjZEdadmNpQW9kbUZ5SUd0bGVTQnBiaUJoZEhSeWFXSjFkR1Z6S1NCN1hHNWNkRngwWEhSY2RISmxjM1ZzZEZ0clpYbGRJRDBnWVhSMGNtbGlkWFJsYzF0clpYbGRPMXh1WEhSY2RGeDBmVnh1WEhSY2RIMWNibHgwWEhSeVpYUjFjbTRnY21WemRXeDBPMXh1WEhSOVhHNWNibHgwWm5WdVkzUnBiMjRnYVc1cGRDQW9ZMjl1ZG1WeWRHVnlLU0I3WEc1Y2RGeDBablZ1WTNScGIyNGdZWEJwSUNoclpYa3NJSFpoYkhWbExDQmhkSFJ5YVdKMWRHVnpLU0I3WEc1Y2RGeDBYSFIyWVhJZ2NtVnpkV3gwTzF4dVhIUmNkRngwYVdZZ0tIUjVjR1Z2WmlCa2IyTjFiV1Z1ZENBOVBUMGdKM1Z1WkdWbWFXNWxaQ2NwSUh0Y2JseDBYSFJjZEZ4MGNtVjBkWEp1TzF4dVhIUmNkRngwZlZ4dVhHNWNkRngwWEhRdkx5QlhjbWwwWlZ4dVhHNWNkRngwWEhScFppQW9ZWEpuZFcxbGJuUnpMbXhsYm1kMGFDQStJREVwSUh0Y2JseDBYSFJjZEZ4MFlYUjBjbWxpZFhSbGN5QTlJR1Y0ZEdWdVpDaDdYRzVjZEZ4MFhIUmNkRngwY0dGMGFEb2dKeThuWEc1Y2RGeDBYSFJjZEgwc0lHRndhUzVrWldaaGRXeDBjeXdnWVhSMGNtbGlkWFJsY3lrN1hHNWNibHgwWEhSY2RGeDBhV1lnS0hSNWNHVnZaaUJoZEhSeWFXSjFkR1Z6TG1WNGNHbHlaWE1nUFQwOUlDZHVkVzFpWlhJbktTQjdYRzVjZEZ4MFhIUmNkRngwZG1GeUlHVjRjR2x5WlhNZ1BTQnVaWGNnUkdGMFpTZ3BPMXh1WEhSY2RGeDBYSFJjZEdWNGNHbHlaWE11YzJWMFRXbHNiR2x6WldOdmJtUnpLR1Y0Y0dseVpYTXVaMlYwVFdsc2JHbHpaV052Ym1SektDa2dLeUJoZEhSeWFXSjFkR1Z6TG1WNGNHbHlaWE1nS2lBNE5qUmxLelVwTzF4dVhIUmNkRngwWEhSY2RHRjBkSEpwWW5WMFpYTXVaWGh3YVhKbGN5QTlJR1Y0Y0dseVpYTTdYRzVjZEZ4MFhIUmNkSDFjYmx4dVhIUmNkRngwWEhRdkx5QlhaU2R5WlNCMWMybHVaeUJjSW1WNGNHbHlaWE5jSWlCaVpXTmhkWE5sSUZ3aWJXRjRMV0ZuWlZ3aUlHbHpJRzV2ZENCemRYQndiM0owWldRZ1lua2dTVVZjYmx4MFhIUmNkRngwWVhSMGNtbGlkWFJsY3k1bGVIQnBjbVZ6SUQwZ1lYUjBjbWxpZFhSbGN5NWxlSEJwY21WeklEOGdZWFIwY21saWRYUmxjeTVsZUhCcGNtVnpMblJ2VlZSRFUzUnlhVzVuS0NrZ09pQW5KenRjYmx4dVhIUmNkRngwWEhSMGNua2dlMXh1WEhSY2RGeDBYSFJjZEhKbGMzVnNkQ0E5SUVwVFQwNHVjM1J5YVc1bmFXWjVLSFpoYkhWbEtUdGNibHgwWEhSY2RGeDBYSFJwWmlBb0wxNWJYRng3WEZ4YlhTOHVkR1Z6ZENoeVpYTjFiSFFwS1NCN1hHNWNkRngwWEhSY2RGeDBYSFIyWVd4MVpTQTlJSEpsYzNWc2REdGNibHgwWEhSY2RGeDBYSFI5WEc1Y2RGeDBYSFJjZEgwZ1kyRjBZMmdnS0dVcElIdDlYRzVjYmx4MFhIUmNkRngwYVdZZ0tDRmpiMjUyWlhKMFpYSXVkM0pwZEdVcElIdGNibHgwWEhSY2RGeDBYSFIyWVd4MVpTQTlJR1Z1WTI5a1pWVlNTVU52YlhCdmJtVnVkQ2hUZEhKcGJtY29kbUZzZFdVcEtWeHVYSFJjZEZ4MFhIUmNkRngwTG5KbGNHeGhZMlVvTHlVb01qTjhNalI4TWpaOE1rSjhNMEY4TTBOOE0wVjhNMFI4TWtaOE0wWjhOREI4TlVKOE5VUjhOVVY4TmpCOE4wSjhOMFI4TjBNcEwyY3NJR1JsWTI5a1pWVlNTVU52YlhCdmJtVnVkQ2s3WEc1Y2RGeDBYSFJjZEgwZ1pXeHpaU0I3WEc1Y2RGeDBYSFJjZEZ4MGRtRnNkV1VnUFNCamIyNTJaWEowWlhJdWQzSnBkR1VvZG1Gc2RXVXNJR3RsZVNrN1hHNWNkRngwWEhSY2RIMWNibHh1WEhSY2RGeDBYSFJyWlhrZ1BTQmxibU52WkdWVlVrbERiMjF3YjI1bGJuUW9VM1J5YVc1bktHdGxlU2twTzF4dVhIUmNkRngwWEhSclpYa2dQU0JyWlhrdWNtVndiR0ZqWlNndkpTZ3lNM3d5Tkh3eU5ud3lRbncxUlh3Mk1IdzNReWt2Wnl3Z1pHVmpiMlJsVlZKSlEyOXRjRzl1Wlc1MEtUdGNibHgwWEhSY2RGeDBhMlY1SUQwZ2EyVjVMbkpsY0d4aFkyVW9MMXRjWENoY1hDbGRMMmNzSUdWelkyRndaU2s3WEc1Y2JseDBYSFJjZEZ4MGRtRnlJSE4wY21sdVoybG1hV1ZrUVhSMGNtbGlkWFJsY3lBOUlDY25PMXh1WEc1Y2RGeDBYSFJjZEdadmNpQW9kbUZ5SUdGMGRISnBZblYwWlU1aGJXVWdhVzRnWVhSMGNtbGlkWFJsY3lrZ2UxeHVYSFJjZEZ4MFhIUmNkR2xtSUNnaFlYUjBjbWxpZFhSbGMxdGhkSFJ5YVdKMWRHVk9ZVzFsWFNrZ2UxeHVYSFJjZEZ4MFhIUmNkRngwWTI5dWRHbHVkV1U3WEc1Y2RGeDBYSFJjZEZ4MGZWeHVYSFJjZEZ4MFhIUmNkSE4wY21sdVoybG1hV1ZrUVhSMGNtbGlkWFJsY3lBclBTQW5PeUFuSUNzZ1lYUjBjbWxpZFhSbFRtRnRaVHRjYmx4MFhIUmNkRngwWEhScFppQW9ZWFIwY21saWRYUmxjMXRoZEhSeWFXSjFkR1ZPWVcxbFhTQTlQVDBnZEhKMVpTa2dlMXh1WEhSY2RGeDBYSFJjZEZ4MFkyOXVkR2x1ZFdVN1hHNWNkRngwWEhSY2RGeDBmVnh1WEhSY2RGeDBYSFJjZEhOMGNtbHVaMmxtYVdWa1FYUjBjbWxpZFhSbGN5QXJQU0FuUFNjZ0t5QmhkSFJ5YVdKMWRHVnpXMkYwZEhKcFluVjBaVTVoYldWZE8xeHVYSFJjZEZ4MFhIUjlYRzVjZEZ4MFhIUmNkSEpsZEhWeWJpQW9aRzlqZFcxbGJuUXVZMjl2YTJsbElEMGdhMlY1SUNzZ0p6MG5JQ3NnZG1Gc2RXVWdLeUJ6ZEhKcGJtZHBabWxsWkVGMGRISnBZblYwWlhNcE8xeHVYSFJjZEZ4MGZWeHVYRzVjZEZ4MFhIUXZMeUJTWldGa1hHNWNibHgwWEhSY2RHbG1JQ2doYTJWNUtTQjdYRzVjZEZ4MFhIUmNkSEpsYzNWc2RDQTlJSHQ5TzF4dVhIUmNkRngwZlZ4dVhHNWNkRngwWEhRdkx5QlVieUJ3Y21WMlpXNTBJSFJvWlNCbWIzSWdiRzl2Y0NCcGJpQjBhR1VnWm1seWMzUWdjR3hoWTJVZ1lYTnphV2R1SUdGdUlHVnRjSFI1SUdGeWNtRjVYRzVjZEZ4MFhIUXZMeUJwYmlCallYTmxJSFJvWlhKbElHRnlaU0J1YnlCamIyOXJhV1Z6SUdGMElHRnNiQzRnUVd4emJ5QndjbVYyWlc1MGN5QnZaR1FnY21WemRXeDBJSGRvWlc1Y2JseDBYSFJjZEM4dklHTmhiR3hwYm1jZ1hDSm5aWFFvS1Z3aVhHNWNkRngwWEhSMllYSWdZMjl2YTJsbGN5QTlJR1J2WTNWdFpXNTBMbU52YjJ0cFpTQS9JR1J2WTNWdFpXNTBMbU52YjJ0cFpTNXpjR3hwZENnbk95QW5LU0E2SUZ0ZE8xeHVYSFJjZEZ4MGRtRnlJSEprWldOdlpHVWdQU0F2S0NWYk1DMDVRUzFhWFhzeWZTa3JMMmM3WEc1Y2RGeDBYSFIyWVhJZ2FTQTlJREE3WEc1Y2JseDBYSFJjZEdadmNpQW9PeUJwSUR3Z1kyOXZhMmxsY3k1c1pXNW5kR2c3SUdrckt5a2dlMXh1WEhSY2RGeDBYSFIyWVhJZ2NHRnlkSE1nUFNCamIyOXJhV1Z6VzJsZExuTndiR2wwS0NjOUp5azdYRzVjZEZ4MFhIUmNkSFpoY2lCamIyOXJhV1VnUFNCd1lYSjBjeTV6YkdsalpTZ3hLUzVxYjJsdUtDYzlKeWs3WEc1Y2JseDBYSFJjZEZ4MGFXWWdLR052YjJ0cFpTNWphR0Z5UVhRb01Da2dQVDA5SUNkY0lpY3BJSHRjYmx4MFhIUmNkRngwWEhSamIyOXJhV1VnUFNCamIyOXJhV1V1YzJ4cFkyVW9NU3dnTFRFcE8xeHVYSFJjZEZ4MFhIUjlYRzVjYmx4MFhIUmNkRngwZEhKNUlIdGNibHgwWEhSY2RGeDBYSFIyWVhJZ2JtRnRaU0E5SUhCaGNuUnpXekJkTG5KbGNHeGhZMlVvY21SbFkyOWtaU3dnWkdWamIyUmxWVkpKUTI5dGNHOXVaVzUwS1R0Y2JseDBYSFJjZEZ4MFhIUmpiMjlyYVdVZ1BTQmpiMjUyWlhKMFpYSXVjbVZoWkNBL1hHNWNkRngwWEhSY2RGeDBYSFJqYjI1MlpYSjBaWEl1Y21WaFpDaGpiMjlyYVdVc0lHNWhiV1VwSURvZ1kyOXVkbVZ5ZEdWeUtHTnZiMnRwWlN3Z2JtRnRaU2tnZkh4Y2JseDBYSFJjZEZ4MFhIUmNkR052YjJ0cFpTNXlaWEJzWVdObEtISmtaV052WkdVc0lHUmxZMjlrWlZWU1NVTnZiWEJ2Ym1WdWRDazdYRzVjYmx4MFhIUmNkRngwWEhScFppQW9kR2hwY3k1cWMyOXVLU0I3WEc1Y2RGeDBYSFJjZEZ4MFhIUjBjbmtnZTF4dVhIUmNkRngwWEhSY2RGeDBYSFJqYjI5cmFXVWdQU0JLVTA5T0xuQmhjbk5sS0dOdmIydHBaU2s3WEc1Y2RGeDBYSFJjZEZ4MFhIUjlJR05oZEdOb0lDaGxLU0I3ZlZ4dVhIUmNkRngwWEhSY2RIMWNibHh1WEhSY2RGeDBYSFJjZEdsbUlDaHJaWGtnUFQwOUlHNWhiV1VwSUh0Y2JseDBYSFJjZEZ4MFhIUmNkSEpsYzNWc2RDQTlJR052YjJ0cFpUdGNibHgwWEhSY2RGeDBYSFJjZEdKeVpXRnJPMXh1WEhSY2RGeDBYSFJjZEgxY2JseHVYSFJjZEZ4MFhIUmNkR2xtSUNnaGEyVjVLU0I3WEc1Y2RGeDBYSFJjZEZ4MFhIUnlaWE4xYkhSYmJtRnRaVjBnUFNCamIyOXJhV1U3WEc1Y2RGeDBYSFJjZEZ4MGZWeHVYSFJjZEZ4MFhIUjlJR05oZEdOb0lDaGxLU0I3ZlZ4dVhIUmNkRngwZlZ4dVhHNWNkRngwWEhSeVpYUjFjbTRnY21WemRXeDBPMXh1WEhSY2RIMWNibHh1WEhSY2RHRndhUzV6WlhRZ1BTQmhjR2s3WEc1Y2RGeDBZWEJwTG1kbGRDQTlJR1oxYm1OMGFXOXVJQ2hyWlhrcElIdGNibHgwWEhSY2RISmxkSFZ5YmlCaGNHa3VZMkZzYkNoaGNHa3NJR3RsZVNrN1hHNWNkRngwZlR0Y2JseDBYSFJoY0drdVoyVjBTbE5QVGlBOUlHWjFibU4wYVc5dUlDZ3BJSHRjYmx4MFhIUmNkSEpsZEhWeWJpQmhjR2t1WVhCd2JIa29lMXh1WEhSY2RGeDBYSFJxYzI5dU9pQjBjblZsWEc1Y2RGeDBYSFI5TENCYlhTNXpiR2xqWlM1allXeHNLR0Z5WjNWdFpXNTBjeWtwTzF4dVhIUmNkSDA3WEc1Y2RGeDBZWEJwTG1SbFptRjFiSFJ6SUQwZ2UzMDdYRzVjYmx4MFhIUmhjR2t1Y21WdGIzWmxJRDBnWm5WdVkzUnBiMjRnS0d0bGVTd2dZWFIwY21saWRYUmxjeWtnZTF4dVhIUmNkRngwWVhCcEtHdGxlU3dnSnljc0lHVjRkR1Z1WkNoaGRIUnlhV0oxZEdWekxDQjdYRzVjZEZ4MFhIUmNkR1Y0Y0dseVpYTTZJQzB4WEc1Y2RGeDBYSFI5S1NrN1hHNWNkRngwZlR0Y2JseHVYSFJjZEdGd2FTNTNhWFJvUTI5dWRtVnlkR1Z5SUQwZ2FXNXBkRHRjYmx4dVhIUmNkSEpsZEhWeWJpQmhjR2s3WEc1Y2RIMWNibHh1WEhSeVpYUjFjbTRnYVc1cGRDaG1kVzVqZEdsdmJpQW9LU0I3ZlNrN1hHNTlLU2s3WEc0aUxDSjJZWElnZFhScGJITWdQU0J5WlhGMWFYSmxLRndpTGk5MWRHbHNjeTVxYzF3aUtUdGNjbHh1WEhKY2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1FtSnZlRUZzYVdkdVpXUlVaWGgwTzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUVOeVpXRjBaWE1nWVNCdVpYY2dRbUp2ZUVGc2FXZHVaV1JVWlhoMElHOWlhbVZqZENBdElHRWdkR1Y0ZENCdlltcGxZM1FnZEdoaGRDQmpZVzRnWW1VZ1pISmhkMjRnZDJsMGFGeHlYRzRnS2lCaGJtTm9iM0lnY0c5cGJuUnpJR0poYzJWa0lHOXVJR0VnZEdsbmFIUWdZbTkxYm1ScGJtY2dZbTk0SUdGeWIzVnVaQ0IwYUdVZ2RHVjRkQzVjY2x4dUlDb2dRR052Ym5OMGNuVmpkRzl5WEhKY2JpQXFJRUJ3WVhKaGJTQjdiMkpxWldOMGZTQm1iMjUwSUMwZ2NEVXVSbTl1ZENCdlltcGxZM1JjY2x4dUlDb2dRSEJoY21GdElIdHpkSEpwYm1kOUlIUmxlSFFnTFNCVGRISnBibWNnZEc4Z1pHbHpjR3hoZVZ4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXMlp2Ym5SVGFYcGxQVEV5WFNBdElFWnZiblFnYzJsNlpTQjBieUIxYzJVZ1ptOXlJSE4wY21sdVoxeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnVzNnOU1GMGdMU0JKYm1sMGFXRnNJSGdnYkc5allYUnBiMjVjY2x4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlGdDVQVEJkSUMwZ1NXNXBkR2xoYkNCNUlHeHZZMkYwYVc5dVhISmNiaUFxSUVCd1lYSmhiU0I3YjJKcVpXTjBmU0JiY0VsdWMzUmhibU5sUFhkcGJtUnZkMTBnTFNCU1pXWmxjbVZ1WTJVZ2RHOGdjRFVnYVc1emRHRnVZMlVzSUd4bFlYWmxJR0pzWVc1cklHbG1YSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnphMlYwWTJnZ2FYTWdaMnh2WW1Gc1hISmNiaUFxSUVCbGVHRnRjR3hsWEhKY2JpQXFJSFpoY2lCbWIyNTBMQ0JpWW05NFZHVjRkRHRjY2x4dUlDb2dablZ1WTNScGIyNGdjSEpsYkc5aFpDZ3BJSHRjY2x4dUlDb2dJQ0FnSUdadmJuUWdQU0JzYjJGa1JtOXVkQ2hjSWk0dllYTnpaWFJ6TDFKbFozVnNZWEl1ZEhSbVhDSXBPMXh5WEc0Z0tpQjlYSEpjYmlBcUlHWjFibU4wYVc5dUlITmxkSFZ3S0NrZ2UxeHlYRzRnS2lBZ0lDQWdZM0psWVhSbFEyRnVkbUZ6S0RRd01Dd2dOakF3S1R0Y2NseHVJQ29nSUNBZ0lHSmhZMnRuY205MWJtUW9NQ2s3WEhKY2JpQXFJQ0FnSUNCY2NseHVJQ29nSUNBZ0lHSmliM2hVWlhoMElEMGdibVYzSUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQ2htYjI1MExDQmNJa2hsZVNGY0lpd2dNekFwT3lBZ0lDQmNjbHh1SUNvZ0lDQWdJR0ppYjNoVVpYaDBMbk5sZEZKdmRHRjBhVzl1S0ZCSklDOGdOQ2s3WEhKY2JpQXFJQ0FnSUNCaVltOTRWR1Y0ZEM1elpYUkJibU5vYjNJb1FtSnZlRUZzYVdkdVpXUlVaWGgwTGtGTVNVZE9Ma0pQV0Y5RFJVNVVSVklzSUZ4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lFSmliM2hCYkdsbmJtVmtWR1Y0ZEM1Q1FWTkZURWxPUlM1Q1QxaGZRMFZPVkVWU0tUdGNjbHh1SUNvZ0lDQWdJRnh5WEc0Z0tpQWdJQ0FnWm1sc2JDaGNJaU13TUVFNFJVRmNJaWs3WEhKY2JpQXFJQ0FnSUNCdWIxTjBjbTlyWlNncE8xeHlYRzRnS2lBZ0lDQWdZbUp2ZUZSbGVIUXVaSEpoZHloM2FXUjBhQ0F2SURJc0lHaGxhV2RvZENBdklESXBPMXh5WEc0Z0tpQjlYSEpjYmlBcUwxeHlYRzVtZFc1amRHbHZiaUJDWW05NFFXeHBaMjVsWkZSbGVIUW9abTl1ZEN3Z2RHVjRkQ3dnWm05dWRGTnBlbVVzSUhnc0lIa3NJSEJKYm5OMFlXNWpaU2tnZTF4eVhHNGdJQ0FnZEdocGN5NWZabTl1ZENBOUlHWnZiblE3WEhKY2JpQWdJQ0IwYUdsekxsOTBaWGgwSUQwZ2RHVjRkRHRjY2x4dUlDQWdJSFJvYVhNdVgzZ2dQU0IxZEdsc2N5NWtaV1poZFd4MEtIZ3NJREFwTzF4eVhHNGdJQ0FnZEdocGN5NWZlU0E5SUhWMGFXeHpMbVJsWm1GMWJIUW9lU3dnTUNrN1hISmNiaUFnSUNCMGFHbHpMbDltYjI1MFUybDZaU0E5SUhWMGFXeHpMbVJsWm1GMWJIUW9abTl1ZEZOcGVtVXNJREV5S1R0Y2NseHVJQ0FnSUhSb2FYTXVYM0FnUFNCMWRHbHNjeTVrWldaaGRXeDBLSEJKYm5OMFlXNWpaU3dnZDJsdVpHOTNLVHRjY2x4dUlDQWdJSFJvYVhNdVgzSnZkR0YwYVc5dUlEMGdNRHRjY2x4dUlDQWdJSFJvYVhNdVgyaEJiR2xuYmlBOUlFSmliM2hCYkdsbmJtVmtWR1Y0ZEM1QlRFbEhUaTVDVDFoZlEwVk9WRVZTTzF4eVhHNGdJQ0FnZEdocGN5NWZka0ZzYVdkdUlEMGdRbUp2ZUVGc2FXZHVaV1JVWlhoMExrSkJVMFZNU1U1RkxrSlBXRjlEUlU1VVJWSTdYSEpjYmlBZ0lDQjBhR2x6TGw5allXeGpkV3hoZEdWTlpYUnlhV056S0hSeWRXVXBPMXh5WEc1OVhISmNibHh5WEc0dktpcGNjbHh1SUNvZ1ZtVnlkR2xqWVd3Z1lXeHBaMjV0Wlc1MElIWmhiSFZsYzF4eVhHNGdLaUJBY0hWaWJHbGpYSEpjYmlBcUlFQnpkR0YwYVdOY2NseHVJQ29nUUhKbFlXUnZibXg1WEhKY2JpQXFJRUJsYm5WdElIdHpkSEpwYm1kOVhISmNiaUFxTDF4eVhHNUNZbTk0UVd4cFoyNWxaRlJsZUhRdVFVeEpSMDRnUFNCN1hISmNiaUFnSUNBdktpb2dSSEpoZHlCbWNtOXRJSFJvWlNCc1pXWjBJRzltSUhSb1pTQmlZbTk0SUNvdlhISmNiaUFnSUNCQ1QxaGZURVZHVkRvZ1hDSmliM2hmYkdWbWRGd2lMRnh5WEc0Z0lDQWdMeW9xSUVSeVlYY2dabkp2YlNCMGFHVWdZMlZ1ZEdWeUlHOW1JSFJvWlNCaVltOTRJQ292WEhKY2JpQWdJQ0JDVDFoZlEwVk9WRVZTT2lCY0ltSnZlRjlqWlc1MFpYSmNJaXhjY2x4dUlDQWdJQzhxS2lCRWNtRjNJR1p5YjIwZ2RHaGxJSEpwWjJoMElHOW1JSFJvWlNCaVltOTRJQ292WEhKY2JpQWdJQ0JDVDFoZlVrbEhTRlE2SUZ3aVltOTRYM0pwWjJoMFhDSmNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtseHlYRzRnS2lCQ1lYTmxiR2x1WlNCaGJHbG5ibTFsYm5RZ2RtRnNkV1Z6WEhKY2JpQXFJRUJ3ZFdKc2FXTmNjbHh1SUNvZ1FITjBZWFJwWTF4eVhHNGdLaUJBY21WaFpHOXViSGxjY2x4dUlDb2dRR1Z1ZFcwZ2UzTjBjbWx1WjMxY2NseHVJQ292WEhKY2JrSmliM2hCYkdsbmJtVmtWR1Y0ZEM1Q1FWTkZURWxPUlNBOUlIdGNjbHh1SUNBZ0lDOHFLaUJFY21GM0lHWnliMjBnZEdobElIUnZjQ0J2WmlCMGFHVWdZbUp2ZUNBcUwxeHlYRzRnSUNBZ1FrOVlYMVJQVURvZ1hDSmliM2hmZEc5d1hDSXNYSEpjYmlBZ0lDQXZLaW9nUkhKaGR5Qm1jbTl0SUhSb1pTQmpaVzUwWlhJZ2IyWWdkR2hsSUdKaWIzZ2dLaTljY2x4dUlDQWdJRUpQV0Y5RFJVNVVSVkk2SUZ3aVltOTRYMk5sYm5SbGNsd2lMRnh5WEc0Z0lDQWdMeW9xSUVSeVlYY2dabkp2YlNCMGFHVWdZbTkwZEc5dElHOW1JSFJvWlNCaVltOTRJQ292WEhKY2JpQWdJQ0JDVDFoZlFrOVVWRTlOT2lCY0ltSnZlRjlpYjNSMGIyMWNJaXhjY2x4dUlDQWdJQzhxS2lCY2NseHVJQ0FnSUNBcUlFUnlZWGNnWm5KdmJTQm9ZV3htSUhSb1pTQm9aV2xuYUhRZ2IyWWdkR2hsSUdadmJuUXVJRk53WldOcFptbGpZV3hzZVNCMGFHVWdhR1ZwWjJoMElHbHpYSEpjYmlBZ0lDQWdLaUJqWVd4amRXeGhkR1ZrSUdGek9pQmhjMk5sYm5RZ0t5QmtaWE5qWlc1MExseHlYRzRnSUNBZ0lDb3ZYSEpjYmlBZ0lDQkdUMDVVWDBORlRsUkZVam9nWENKbWIyNTBYMk5sYm5SbGNsd2lMRnh5WEc0Z0lDQWdMeW9xSUVSeVlYY2dabkp2YlNCMGFHVWdkR2hsSUc1dmNtMWhiQ0JtYjI1MElHSmhjMlZzYVc1bElDb3ZYSEpjYmlBZ0lDQkJURkJJUVVKRlZFbERPaUJjSW1Gc2NHaGhZbVYwYVdOY0lseHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUZObGRDQmpkWEp5Wlc1MElIUmxlSFJjY2x4dUlDb2dRSEIxWW14cFkxeHlYRzRnS2lCQWNHRnlZVzBnZTNOMGNtbHVaMzBnYzNSeWFXNW5JQzBnVkdWNGRDQnpkSEpwYm1jZ2RHOGdaR2x6Y0d4aGVWeHlYRzRnS2lCQWNtVjBkWEp1Y3lCN2RHaHBjMzBnVlhObFpuVnNJR1p2Y2lCamFHRnBibWx1WjF4eVhHNGdLaTljY2x4dVFtSnZlRUZzYVdkdVpXUlVaWGgwTG5CeWIzUnZkSGx3WlM1elpYUlVaWGgwSUQwZ1puVnVZM1JwYjI0b2MzUnlhVzVuS1NCN1hISmNiaUFnSUNCMGFHbHpMbDkwWlhoMElEMGdjM1J5YVc1bk8xeHlYRzRnSUNBZ2RHaHBjeTVmWTJGc1kzVnNZWFJsVFdWMGNtbGpjeWhtWVd4elpTazdYSEpjYmlBZ0lDQnlaWFIxY200Z2RHaHBjenRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlRaWFFnZEdobElIUmxlSFFnY0c5emFYUnBiMjVjY2x4dUlDb2dRSEIxWW14cFkxeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnZUNBdElGZ2djRzl6YVhScGIyNWNjbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUhnZ0xTQlpJSEJ2YzJsMGFXOXVYSEpjYmlBcUlFQnlaWFIxY201eklIdDBhR2x6ZlNCVmMyVm1kV3dnWm05eUlHTm9ZV2x1YVc1blhISmNiaUFxTDF4eVhHNUNZbTk0UVd4cFoyNWxaRlJsZUhRdWNISnZkRzkwZVhCbExuTmxkRkJ2YzJsMGFXOXVJRDBnWm5WdVkzUnBiMjRvZUN3Z2VTa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZmVDQTlJSFYwYVd4ekxtUmxabUYxYkhRb2VDd2dkR2hwY3k1ZmVDazdYSEpjYmlBZ0lDQjBhR2x6TGw5NUlEMGdkWFJwYkhNdVpHVm1ZWFZzZENoNUxDQjBhR2x6TGw5NUtUdGNjbHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFZGxkQ0IwYUdVZ2RHVjRkQ0J3YjNOcGRHbHZibHh5WEc0Z0tpQkFjSFZpYkdsalhISmNiaUFxSUVCeVpYUjFjbTRnZTI5aWFtVmpkSDBnVW1WMGRYSnVjeUJoYmlCdlltcGxZM1FnZDJsMGFDQndjbTl3WlhKMGFXVnpPaUI0TENCNVhISmNiaUFxTDF4eVhHNUNZbTk0UVd4cFoyNWxaRlJsZUhRdWNISnZkRzkwZVhCbExtZGxkRkJ2YzJsMGFXOXVJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnSUNCeVpYUjFjbTRnZTF4eVhHNGdJQ0FnSUNBZ0lIZzZJSFJvYVhNdVgzZ3NYSEpjYmlBZ0lDQWdJQ0FnZVRvZ2RHaHBjeTVmZVZ4eVhHNGdJQ0FnZlR0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJUWlhRZ1kzVnljbVZ1ZENCMFpYaDBJSE5wZW1WY2NseHVJQ29nUUhCMVlteHBZMXh5WEc0Z0tpQkFjR0Z5WVcwZ2UyNTFiV0psY24wZ1ptOXVkRk5wZW1VZ1ZHVjRkQ0J6YVhwbFhISmNiaUFxSUVCeVpYUjFjbTV6SUh0MGFHbHpmU0JWYzJWbWRXd2dabTl5SUdOb1lXbHVhVzVuWEhKY2JpQXFMMXh5WEc1Q1ltOTRRV3hwWjI1bFpGUmxlSFF1Y0hKdmRHOTBlWEJsTG5ObGRGUmxlSFJUYVhwbElEMGdablZ1WTNScGIyNG9abTl1ZEZOcGVtVXBJSHRjY2x4dUlDQWdJSFJvYVhNdVgyWnZiblJUYVhwbElEMGdabTl1ZEZOcGVtVTdYSEpjYmlBZ0lDQjBhR2x6TGw5allXeGpkV3hoZEdWTlpYUnlhV056S0hSeWRXVXBPMXh5WEc0Z0lDQWdjbVYwZFhKdUlIUm9hWE03WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dVMlYwSUhKdmRHRjBhVzl1SUc5bUlIUmxlSFJjY2x4dUlDb2dRSEIxWW14cFkxeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnWVc1bmJHVWdMU0JTYjNSaGRHbHZiaUJwYmlCeVlXUnBZVzV6WEhKY2JpQXFJRUJ5WlhSMWNtNXpJSHQwYUdsemZTQlZjMlZtZFd3Z1ptOXlJR05vWVdsdWFXNW5YSEpjYmlBcUwxeHlYRzVDWW05NFFXeHBaMjVsWkZSbGVIUXVjSEp2ZEc5MGVYQmxMbk5sZEZKdmRHRjBhVzl1SUQwZ1puVnVZM1JwYjI0b1lXNW5iR1VwSUh0Y2NseHVJQ0FnSUhSb2FYTXVYM0p2ZEdGMGFXOXVJRDBnZFhScGJITXVaR1ZtWVhWc2RDaGhibWRzWlN3Z2RHaHBjeTVmY205MFlYUnBiMjRwTzF4eVhHNGdJQ0FnY21WMGRYSnVJSFJvYVhNN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUjJWMElISnZkR0YwYVc5dUlHOW1JSFJsZUhSY2NseHVJQ29nUUhCMVlteHBZMXh5WEc0Z0tpQkFjbVYwZFhKdWN5QjdiblZ0WW1WeWZTQlNiM1JoZEdsdmJpQnBiaUJ5WVdScFlXNXpYSEpjYmlBcUwxeHlYRzVDWW05NFFXeHBaMjVsWkZSbGVIUXVjSEp2ZEc5MGVYQmxMbWRsZEZKdmRHRjBhVzl1SUQwZ1puVnVZM1JwYjI0b1lXNW5iR1VwSUh0Y2NseHVJQ0FnSUhKbGRIVnliaUIwYUdsekxsOXliM1JoZEdsdmJqdGNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtseHlYRzRnS2lCVFpYUWdkR2hsSUhBZ2FXNXpkR0Z1WTJVZ2RHaGhkQ0JwY3lCMWMyVmtJR1p2Y2lCa2NtRjNhVzVuWEhKY2JpQXFJRUJ3ZFdKc2FXTmNjbHh1SUNvZ1FIQmhjbUZ0SUh0dlltcGxZM1I5SUhBZ0xTQkpibk4wWVc1alpTQnZaaUJ3TlNCbWIzSWdaSEpoZDJsdVp5NGdWR2hwY3lCcGN5QnZibXg1SUc1bFpXUmxaQ0IzYUdWdUlGeHlYRzRnS2lBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIVnphVzVuSUdGdUlHOW1abk5qY21WbGJpQnlaVzVrWlhKbGNpQnZjaUIzYUdWdUlIVnphVzVuSUhBMUlHbHVJR2x1YzNSaGJtTmxYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiVzlrWlM1Y2NseHVJQ29nUUhKbGRIVnlibk1nZTNSb2FYTjlJRlZ6WldaMWJDQm1iM0lnWTJoaGFXNXBibWRjY2x4dUlDb3ZYSEpjYmtKaWIzaEJiR2xuYm1Wa1ZHVjRkQzV3Y205MGIzUjVjR1V1YzJWMFVFbHVjM1JoYm1ObElEMGdablZ1WTNScGIyNG9jQ2tnZTF4eVhHNGdJQ0FnZEdocGN5NWZjQ0E5SUhWMGFXeHpMbVJsWm1GMWJIUW9jQ3dnZEdocGN5NWZjQ2s3WEhKY2JpQWdJQ0J5WlhSMWNtNGdkR2hwY3p0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJIWlhRZ2NtOTBZWFJwYjI0Z2IyWWdkR1Y0ZEZ4eVhHNGdLaUJBY0hWaWJHbGpYSEpjYmlBcUlFQnlaWFIxY201eklIdHZZbXBsWTNSOUlFbHVjM1JoYm1ObElHOW1JSEExSUhSb1lYUWdhWE1nWW1WcGJtY2dkWE5sWkNCbWIzSWdaSEpoZDJsdVoxeHlYRzRnS2k5Y2NseHVRbUp2ZUVGc2FXZHVaV1JVWlhoMExuQnliM1J2ZEhsd1pTNW5aWFJRU1c1emRHRnVZMlVnUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMbDl3TzF4eVhHNTlPMXh5WEc1Y2NseHVMeW9xWEhKY2JpQXFJRk5sZENCaGJtTm9iM0lnY0c5cGJuUWdabTl5SUhSbGVIUWdLR2h2Y21sNmIyNWhiQ0JoYm1RZ2RtVnlkR2xqWVd3Z1lXeHBaMjV0Wlc1MEtTQnlaV3hoZEdsMlpTQjBiMXh5WEc0Z0tpQmliM1Z1WkdsdVp5QmliM2hjY2x4dUlDb2dRSEIxWW14cFkxeHlYRzRnS2lCQWNHRnlZVzBnZTNOMGNtbHVaMzBnVzJoQmJHbG5iajFEUlU1VVJWSmRJQzBnU0c5eWFYcHZibUZzSUdGc2FXZHViV1Z1ZEZ4eVhHNGdLaUJBY0dGeVlXMGdlM04wY21sdVozMGdXM1pCYkdsbmJqMURSVTVVUlZKZElDMGdWbVZ5ZEdsallXd2dZbUZ6Wld4cGJtVmNjbHh1SUNvZ1FIQmhjbUZ0SUh0aWIyOXNaV0Z1ZlNCYmRYQmtZWFJsVUc5emFYUnBiMjQ5Wm1Gc2MyVmRJQzBnU1dZZ2MyVjBJSFJ2SUhSeWRXVXNJSFJvWlNCd2IzTnBkR2x2YmlCdlppQjBhR1ZjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHaGxJSFJsZUhRZ2QybHNiQ0JpWlNCemFHbG1kR1ZrSUhOdklIUm9ZWFJjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHaGxJSFJsZUhRZ2QybHNiQ0JpWlNCa2NtRjNiaUJwYmlCMGFHVWdjMkZ0WlZ4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQndiR0ZqWlNCcGRDQjNZWE1nWW1WbWIzSmxJR05oYkd4cGJtY2dYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhObGRFRnVZMmh2Y2k1Y2NseHVJQ29nUUhKbGRIVnlibk1nZTNSb2FYTjlJRlZ6WldaMWJDQm1iM0lnWTJoaGFXNXBibWRjY2x4dUlDb3ZYSEpjYmtKaWIzaEJiR2xuYm1Wa1ZHVjRkQzV3Y205MGIzUjVjR1V1YzJWMFFXNWphRzl5SUQwZ1puVnVZM1JwYjI0b2FFRnNhV2R1TENCMlFXeHBaMjRzSUhWd1pHRjBaVkJ2YzJsMGFXOXVLU0I3WEhKY2JpQWdJQ0IyWVhJZ2IyeGtVRzl6SUQwZ2RHaHBjeTVmWTJGc1kzVnNZWFJsUVd4cFoyNWxaRU52YjNKa2N5aDBhR2x6TGw5NExDQjBhR2x6TGw5NUtUdGNjbHh1SUNBZ0lIUm9hWE11WDJoQmJHbG5iaUE5SUhWMGFXeHpMbVJsWm1GMWJIUW9hRUZzYVdkdUxDQkNZbTk0UVd4cFoyNWxaRlJsZUhRdVFVeEpSMDR1UTBWT1ZFVlNLVHRjY2x4dUlDQWdJSFJvYVhNdVgzWkJiR2xuYmlBOUlIVjBhV3h6TG1SbFptRjFiSFFvZGtGc2FXZHVMQ0JDWW05NFFXeHBaMjVsWkZSbGVIUXVRa0ZUUlV4SlRrVXVRMFZPVkVWU0tUdGNjbHh1SUNBZ0lHbG1JQ2gxY0dSaGRHVlFiM05wZEdsdmJpa2dlMXh5WEc0Z0lDQWdJQ0FnSUhaaGNpQnVaWGRRYjNNZ1BTQjBhR2x6TGw5allXeGpkV3hoZEdWQmJHbG5ibVZrUTI5dmNtUnpLSFJvYVhNdVgzZ3NJSFJvYVhNdVgza3BPMXh5WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYM2dnS3owZ2IyeGtVRzl6TG5nZ0xTQnVaWGRRYjNNdWVEdGNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOTVJQ3M5SUc5c1pGQnZjeTU1SUMwZ2JtVjNVRzl6TG5rN1hISmNiaUFnSUNCOVhISmNiaUFnSUNCeVpYUjFjbTRnZEdocGN6dGNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtseHlYRzRnS2lCSFpYUWdkR2hsSUdKdmRXNWthVzVuSUdKdmVDQjNhR1Z1SUhSb1pTQjBaWGgwSUdseklIQnNZV05sWkNCaGRDQjBhR1VnYzNCbFkybG1hV1ZrSUdOdmIzSmthVzVoZEdWekxseHlYRzRnS2lCT2IzUmxPaUIwYUdseklHbHpJSFJvWlNCMWJuSnZkR0YwWldRZ1ltOTFibVJwYm1jZ1ltOTRJU0JVVDBSUE9pQkdhWGdnZEdocGN5NWNjbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUZ0NFBXTjFjbkpsYm5RZ2VGMGdMU0JCSUc1bGR5QjRJR052YjNKa2FXNWhkR1VnYjJZZ2RHVjRkQ0JoYm1Ob2IzSXVJRlJvYVhOY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjNhV3hzSUdOb1lXNW5aU0IwYUdVZ2RHVjRkQ2R6SUhnZ2NHOXphWFJwYjI0Z1hISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjR1Z5YldGdVpXNTBiSGt1SUZ4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXM2s5WTNWeWNtVnVkQ0I1WFNBdElFRWdibVYzSUhrZ1kyOXZjbVJwYm1GMFpTQnZaaUIwWlhoMElHRnVZMmh2Y2k0Z1ZHaHBjMXh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhkcGJHd2dZMmhoYm1kbElIUm9aU0IwWlhoMEozTWdlQ0J3YjNOcGRHbHZiaUJjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCd1pYSnRZVzVsYm5Sc2VTNWNjbHh1SUNvZ1FISmxkSFZ5YmlCN2IySnFaV04wZlNCU1pYUjFjbTV6SUdGdUlHOWlhbVZqZENCM2FYUm9JSEJ5YjNCbGNuUnBaWE02SUhnc0lIa3NJSGNzSUdoY2NseHVJQ292WEhKY2JrSmliM2hCYkdsbmJtVmtWR1Y0ZEM1d2NtOTBiM1I1Y0dVdVoyVjBRbUp2ZUNBOUlHWjFibU4wYVc5dUtIZ3NJSGtwSUh0Y2NseHVJQ0FnSUhSb2FYTXVjMlYwVUc5emFYUnBiMjRvZUN3Z2VTazdYSEpjYmlBZ0lDQjJZWElnY0c5eklEMGdkR2hwY3k1ZlkyRnNZM1ZzWVhSbFFXeHBaMjVsWkVOdmIzSmtjeWgwYUdsekxsOTRMQ0IwYUdsekxsOTVLVHRjY2x4dUlDQWdJSEpsZEhWeWJpQjdYSEpjYmlBZ0lDQWdJQ0FnZURvZ2NHOXpMbmdnS3lCMGFHbHpMbDlpYjNWdVpITlBabVp6WlhRdWVDeGNjbHh1SUNBZ0lDQWdJQ0I1T2lCd2IzTXVlU0FySUhSb2FYTXVYMkp2ZFc1a2MwOW1abk5sZEM1NUxGeHlYRzRnSUNBZ0lDQWdJSGM2SUhSb2FYTXVkMmxrZEdnc1hISmNiaUFnSUNBZ0lDQWdhRG9nZEdocGN5NW9aV2xuYUhSY2NseHVJQ0FnSUgwN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUjJWMElHRnVJR0Z5Y21GNUlHOW1JSEJ2YVc1MGN5QjBhR0YwSUdadmJHeHZkeUJoYkc5dVp5QjBhR1VnZEdWNGRDQndZWFJvTGlCVWFHbHpJSGRwYkd3Z2RHRnJaU0JwYm5SdlhISmNiaUFxSUdOdmJuTnBaR1Z5WVhScGIyNGdkR2hsSUdOMWNuSmxiblFnWVd4cFoyNXRaVzUwSUhObGRIUnBibWR6TGx4eVhHNGdLaUJPYjNSbE9pQjBhR2x6SUdseklHRWdkR2hwYmlCM2NtRndjR1Z5SUdGeWIzVnVaQ0JoSUhBMUlHMWxkR2h2WkNCaGJtUWdaRzlsYzI0bmRDQm9ZVzVrYkdVZ2RXNXliM1JoZEdWa1hISmNiaUFxSUhSbGVIUWhJRlJQUkU4NklFWnBlQ0IwYUdsekxseHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnVzNnOVkzVnljbVZ1ZENCNFhTQXRJRUVnYm1WM0lIZ2dZMjl2Y21ScGJtRjBaU0J2WmlCMFpYaDBJR0Z1WTJodmNpNGdWR2hwYzF4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIZHBiR3dnWTJoaGJtZGxJSFJvWlNCMFpYaDBKM01nZUNCd2IzTnBkR2x2YmlCY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQndaWEp0WVc1bGJuUnNlUzRnWEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQmJlVDFqZFhKeVpXNTBJSGxkSUMwZ1FTQnVaWGNnZVNCamIyOXlaR2x1WVhSbElHOW1JSFJsZUhRZ1lXNWphRzl5TGlCVWFHbHpYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZDJsc2JDQmphR0Z1WjJVZ2RHaGxJSFJsZUhRbmN5QjRJSEJ2YzJsMGFXOXVJRnh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhCbGNtMWhibVZ1ZEd4NUxseHlYRzRnS2lCQWNHRnlZVzBnZTI5aWFtVmpkSDBnVzI5d2RHbHZibk5kSUMwZ1FXNGdiMkpxWldOMElIUm9ZWFFnWTJGdUlHaGhkbVU2WEhKY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUMwZ2MyRnRjR3hsUm1GamRHOXlPaUJ5WVhScGJ5QnZaaUJ3WVhSb0xXeGxibWQwYUNCMGJ5QnVkVzFpWlhKY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnZaaUJ6WVcxd2JHVnpJQ2hrWldaaGRXeDBQVEF1TWpVcExpQklhV2RvWlhJZ2RtRnNkV1Z6SUZ4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIbHBaV3hrSUcxdmNtVndiMmx1ZEhNZ1lXNWtJR0Z5WlNCMGFHVnlaV1p2Y21VZ2JXOXlaU0JjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCd2NtVmphWE5sTGlCY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0xTQnphVzF3YkdsbWVWUm9jbVZ6YUc5c1pEb2dhV1lnYzJWMElIUnZJR0VnYm05dUxYcGxjbThnWEhKY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtRnNkV1VzSUdOdmJHeHBibVZoY2lCd2IybHVkSE1nZDJsc2JDQmlaU0J5WlcxdmRtVmtMaUJVYUdWY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZV3gxWlNCeVpYQnlaWE5sYm5SeklIUm9aU0IwYUhKbGMyaHZiR1FnWVc1bmJHVWdkRzhnZFhObFhISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkMmhsYmlCa1pYUmxjbTFwYm1sdVp5QjNhR1YwYUdWeUlIUjNieUJsWkdkbGN5QmhjbVVnWEhKY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyOXNiR2x1WldGeUxseHlYRzRnS2lCQWNtVjBkWEp1SUh0aGNuSmhlWDBnUVc0Z1lYSnlZWGtnYjJZZ2NHOXBiblJ6TENCbFlXTm9JSGRwZEdnZ2VDd2dlU0FtSUdGc2NHaGhJQ2gwYUdVZ2NHRjBhQ0JoYm1kc1pTbGNjbHh1SUNvdlhISmNia0ppYjNoQmJHbG5ibVZrVkdWNGRDNXdjbTkwYjNSNWNHVXVaMlYwVkdWNGRGQnZhVzUwY3lBOUlHWjFibU4wYVc5dUtIZ3NJSGtzSUc5d2RHbHZibk1wSUh0Y2NseHVJQ0FnSUhSb2FYTXVjMlYwVUc5emFYUnBiMjRvZUN3Z2VTazdYSEpjYmlBZ0lDQjJZWElnY0c5cGJuUnpJRDBnZEdocGN5NWZabTl1ZEM1MFpYaDBWRzlRYjJsdWRITW9kR2hwY3k1ZmRHVjRkQ3dnZEdocGN5NWZlQ3dnZEdocGN5NWZlU3dnWEhKY2JpQWdJQ0FnSUNBZ2RHaHBjeTVmWm05dWRGTnBlbVVzSUc5d2RHbHZibk1wTzF4eVhHNGdJQ0FnWm05eUlDaDJZWElnYVNBOUlEQTdJR2tnUENCd2IybHVkSE11YkdWdVozUm9PeUJwSUNzOUlERXBJSHRjY2x4dUlDQWdJQ0FnSUNCMllYSWdjRzl6SUQwZ2RHaHBjeTVmWTJGc1kzVnNZWFJsUVd4cFoyNWxaRU52YjNKa2N5aHdiMmx1ZEhOYmFWMHVlQ3dnY0c5cGJuUnpXMmxkTG5rcE8xeHlYRzRnSUNBZ0lDQWdJSEJ2YVc1MGMxdHBYUzU0SUQwZ2NHOXpMbmc3WEhKY2JpQWdJQ0FnSUNBZ2NHOXBiblJ6VzJsZExua2dQU0J3YjNNdWVUdGNjbHh1SUNBZ0lIMWNjbHh1SUNBZ0lISmxkSFZ5YmlCd2IybHVkSE03WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dSSEpoZDNNZ2RHaGxJSFJsZUhRZ2NHRnlkR2xqYkdVZ2QybDBhQ0IwYUdVZ2MzQmxZMmxtYVdWa0lITjBlV3hsSUhCaGNtRnRaWFJsY25NdUlFNXZkR1U2SUhSb2FYTWdhWE5jY2x4dUlDb2daMjlwYm1jZ2RHOGdjMlYwSUhSb1pTQjBaWGgwUm05dWRDd2dkR1Y0ZEZOcGVtVWdKaUJ5YjNSaGRHbHZiaUJpWldadmNtVWdaSEpoZDJsdVp5NGdXVzkxSUhOb2IzVnNaQ0J6WlhSY2NseHVJQ29nZEdobElHTnZiRzl5TDNOMGNtOXJaUzltYVd4c0lIUm9ZWFFnZVc5MUlIZGhiblFnWW1WbWIzSmxJR1J5WVhkcGJtY3VJRlJvYVhNZ1puVnVZM1JwYjI0Z2QybHNiQ0JqYkdWaGJseHlYRzRnS2lCMWNDQmhablJsY2lCcGRITmxiR1lnWVc1a0lISmxjMlYwSUhOMGVXeHBibWNnWW1GamF5QjBieUIzYUdGMElHbDBJSGRoY3lCaVpXWnZjbVVnYVhRZ2QyRnpJR05oYkd4bFpDNWNjbHh1SUNvZ1FIQjFZbXhwWTF4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXM2c5WTNWeWNtVnVkQ0I0WFNBdElFRWdibVYzSUhnZ1kyOXZjbVJwYm1GMFpTQnZaaUIwWlhoMElHRnVZMmh2Y2k0Z1ZHaHBjeUIzYVd4c1hISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmphR0Z1WjJVZ2RHaGxJSFJsZUhRbmN5QjRJSEJ2YzJsMGFXOXVJSEJsY20xaGJtVnVkR3g1TGlCY2NseHVJQ29nUUhCaGNtRnRJSHR1ZFcxaVpYSjlJRnQ1UFdOMWNuSmxiblFnZVYwZ0xTQkJJRzVsZHlCNUlHTnZiM0prYVc1aGRHVWdiMllnZEdWNGRDQmhibU5vYjNJdUlGUm9hWE1nZDJsc2JGeHlYRzRnS2lBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05vWVc1blpTQjBhR1VnZEdWNGRDZHpJSGdnY0c5emFYUnBiMjRnY0dWeWJXRnVaVzUwYkhrdVhISmNiaUFxSUVCd1lYSmhiU0I3WW05dmJHVmhibjBnVzJSeVlYZENiM1Z1WkhNOVptRnNjMlZkSUMwZ1JteGhaeUJtYjNJZ1pISmhkMmx1WnlCaWIzVnVaR2x1WnlCaWIzaGNjbHh1SUNvdlhISmNia0ppYjNoQmJHbG5ibVZrVkdWNGRDNXdjbTkwYjNSNWNHVXVaSEpoZHlBOUlHWjFibU4wYVc5dUtIZ3NJSGtzSUdSeVlYZENiM1Z1WkhNcElIdGNjbHh1SUNBZ0lHUnlZWGRDYjNWdVpITWdQU0IxZEdsc2N5NWtaV1poZFd4MEtHUnlZWGRDYjNWdVpITXNJR1poYkhObEtUdGNjbHh1SUNBZ0lIUm9hWE11YzJWMFVHOXphWFJwYjI0b2VDd2dlU2s3WEhKY2JpQWdJQ0IyWVhJZ2NHOXpJRDBnZTF4eVhHNGdJQ0FnSUNBZ0lIZzZJSFJvYVhNdVgzZ3NJRnh5WEc0Z0lDQWdJQ0FnSUhrNklIUm9hWE11WDNsY2NseHVJQ0FnSUgwN1hISmNibHh5WEc0Z0lDQWdkR2hwY3k1ZmNDNXdkWE5vS0NrN1hISmNibHh5WEc0Z0lDQWdJQ0FnSUdsbUlDaDBhR2x6TGw5eWIzUmhkR2x2YmlrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCd2IzTWdQU0IwYUdsekxsOWpZV3hqZFd4aGRHVlNiM1JoZEdWa1EyOXZjbVJ6S0hCdmN5NTRMQ0J3YjNNdWVTd2dkR2hwY3k1ZmNtOTBZWFJwYjI0cE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl3TG5KdmRHRjBaU2gwYUdsekxsOXliM1JoZEdsdmJpazdYSEpjYmlBZ0lDQWdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lDQWdJQ0J3YjNNZ1BTQjBhR2x6TGw5allXeGpkV3hoZEdWQmJHbG5ibVZrUTI5dmNtUnpLSEJ2Y3k1NExDQndiM011ZVNrN1hISmNibHh5WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYM0F1ZEdWNGRFRnNhV2R1S0hSb2FYTXVYM0F1VEVWR1ZDd2dkR2hwY3k1ZmNDNUNRVk5GVEVsT1JTazdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjQzUwWlhoMFJtOXVkQ2gwYUdsekxsOW1iMjUwS1R0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5d0xuUmxlSFJUYVhwbEtIUm9hWE11WDJadmJuUlRhWHBsS1R0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5d0xuUmxlSFFvZEdocGN5NWZkR1Y0ZEN3Z2NHOXpMbmdzSUhCdmN5NTVLVHRjY2x4dVhISmNiaUFnSUNBZ0lDQWdhV1lnS0dSeVlYZENiM1Z1WkhNcElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmY0M1emRISnZhMlVvTWpBd0tUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR0p2ZFc1a2MxZ2dQU0J3YjNNdWVDQXJJSFJvYVhNdVgySnZkVzVrYzA5bVpuTmxkQzU0TzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1ltOTFibVJ6V1NBOUlIQnZjeTU1SUNzZ2RHaHBjeTVmWW05MWJtUnpUMlptYzJWMExuazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNBdWJtOUdhV3hzS0NrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM0F1Y21WamRDaGliM1Z1WkhOWUxDQmliM1Z1WkhOWkxDQjBhR2x6TG5kcFpIUm9MQ0IwYUdsekxtaGxhV2RvZENrN0lDQWdJQ0FnSUNBZ0lDQWdYSEpjYmlBZ0lDQWdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lIUm9hWE11WDNBdWNHOXdLQ2s3WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dVSEp2YW1WamRDQjBhR1VnWTI5dmNtUnBibUYwWlhNZ0tIZ3NJSGtwSUdsdWRHOGdZU0J5YjNSaGRHVmtJR052YjNKa2FXNWhkR1VnYzNsemRHVnRYSEpjYmlBcUlFQndjbWwyWVhSbFhISmNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0I0SUMwZ1dDQmpiMjl5WkdsdVlYUmxJQ2hwYmlCMWJuSnZkR0YwWldRZ2MzQmhZMlVwWEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQjVJQzBnV1NCamIyOXlaR2x1WVhSbElDaHBiaUIxYm5KdmRHRjBaV1FnYzNCaFkyVXBYSEpjYmlBcUlFQndZWEpoYlNCN2JuVnRZbVZ5ZlNCaGJtZHNaU0F0SUZKaFpHbGhibk1nYjJZZ2NtOTBZWFJwYjI0Z2RHOGdZWEJ3YkhsY2NseHVJQ29nUUhKbGRIVnliaUI3YjJKcVpXTjBmU0JQWW1wbFkzUWdkMmwwYUNCNElDWWdlU0J3Y205d1pYSjBhV1Z6WEhKY2JpQXFMMXh5WEc1Q1ltOTRRV3hwWjI1bFpGUmxlSFF1Y0hKdmRHOTBlWEJsTGw5allXeGpkV3hoZEdWU2IzUmhkR1ZrUTI5dmNtUnpJRDBnWm5WdVkzUnBiMjRnS0hnc0lIa3NJR0Z1WjJ4bEtTQjdJQ0JjY2x4dUlDQWdJSFpoY2lCeWVDQTlJRTFoZEdndVkyOXpLR0Z1WjJ4bEtTQXFJSGdnS3lCTllYUm9MbU52Y3loTllYUm9MbEJKSUM4Z01pQXRJR0Z1WjJ4bEtTQXFJSGs3WEhKY2JpQWdJQ0IyWVhJZ2Nua2dQU0F0VFdGMGFDNXphVzRvWVc1bmJHVXBJQ29nZUNBcklFMWhkR2d1YzJsdUtFMWhkR2d1VUVrZ0x5QXlJQzBnWVc1bmJHVXBJQ29nZVR0Y2NseHVJQ0FnSUhKbGRIVnliaUI3ZURvZ2NuZ3NJSGs2SUhKNWZUdGNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtseHlYRzRnS2lCRFlXeGpkV3hoZEdWeklHUnlZWGNnWTI5dmNtUnBibUYwWlhNZ1ptOXlJSFJvWlNCMFpYaDBMQ0JoYkdsbmJtbHVaeUJpWVhObFpDQnZiaUIwYUdVZ1ltOTFibVJwYm1jZ1ltOTRMbHh5WEc0Z0tpQlVhR1VnZEdWNGRDQnBjeUJsZG1WdWRIVmhiR3g1SUdSeVlYZHVJSGRwZEdnZ1kyRnVkbUZ6SUdGc2FXZHViV1Z1ZENCelpYUWdkRzhnYkdWbWRDQW1JR0poYzJWc2FXNWxMQ0J6YjF4eVhHNGdLaUIwYUdseklHWjFibU4wYVc5dUlIUmhhMlZ6SUdFZ1pHVnphWEpsWkNCd2IzTWdKaUJoYkdsbmJtMWxiblFnWVc1a0lISmxkSFZ5Ym5NZ2RHaGxJR0Z3Y0hKdmNISnBZWFJsWEhKY2JpQXFJR052YjNKa2FXNWhkR1Z6SUdadmNpQjBhR1VnYkdWbWRDQW1JR0poYzJWc2FXNWxMbHh5WEc0Z0tpQkFjSEpwZG1GMFpWeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnZUNBdElGZ2dZMjl2Y21ScGJtRjBaVnh5WEc0Z0tpQkFjR0Z5WVcwZ2UyNTFiV0psY24wZ2VTQXRJRmtnWTI5dmNtUnBibUYwWlZ4eVhHNGdLaUJBY21WMGRYSnVJSHR2WW1wbFkzUjlJRTlpYW1WamRDQjNhWFJvSUhnZ0ppQjVJSEJ5YjNCbGNuUnBaWE5jY2x4dUlDb3ZYSEpjYmtKaWIzaEJiR2xuYm1Wa1ZHVjRkQzV3Y205MGIzUjVjR1V1WDJOaGJHTjFiR0YwWlVGc2FXZHVaV1JEYjI5eVpITWdQU0JtZFc1amRHbHZiaWg0TENCNUtTQjdYSEpjYmlBZ0lDQjJZWElnYm1WM1dDd2dibVYzV1R0Y2NseHVJQ0FnSUhOM2FYUmphQ0FvZEdocGN5NWZhRUZzYVdkdUtTQjdYSEpjYmlBZ0lDQWdJQ0FnWTJGelpTQkNZbTk0UVd4cFoyNWxaRlJsZUhRdVFVeEpSMDR1UWs5WVgweEZSbFE2WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzVsZDFnZ1BTQjRPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmljbVZoYXp0Y2NseHVJQ0FnSUNBZ0lDQmpZWE5sSUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQzVCVEVsSFRpNUNUMWhmUTBWT1ZFVlNPbHh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnVaWGRZSUQwZ2VDQXRJSFJvYVhNdWFHRnNabGRwWkhSb08xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCaWNtVmhhenRjY2x4dUlDQWdJQ0FnSUNCallYTmxJRUppYjNoQmJHbG5ibVZrVkdWNGRDNUJURWxIVGk1Q1QxaGZVa2xIU0ZRNlhISmNiaUFnSUNBZ0lDQWdJQ0FnSUc1bGQxZ2dQU0I0SUMwZ2RHaHBjeTUzYVdSMGFEdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1luSmxZV3M3WEhKY2JpQWdJQ0FnSUNBZ1pHVm1ZWFZzZERwY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYm1WM1dDQTlJSGc3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym5OdmJHVXViRzluS0Z3aVZXNXlaV052WjI1cGVtVmtJR2h2Y21sNmIyNWhiQ0JoYkdsbmJqcGNJaXdnZEdocGN5NWZhRUZzYVdkdUtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1luSmxZV3M3WEhKY2JpQWdJQ0I5WEhKY2JpQWdJQ0J6ZDJsMFkyZ2dLSFJvYVhNdVgzWkJiR2xuYmlrZ2UxeHlYRzRnSUNBZ0lDQWdJR05oYzJVZ1FtSnZlRUZzYVdkdVpXUlVaWGgwTGtKQlUwVk1TVTVGTGtKUFdGOVVUMUE2WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzVsZDFrZ1BTQjVJQzBnZEdocGN5NWZZbTkxYm1SelQyWm1jMlYwTG5rN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdKeVpXRnJPMXh5WEc0Z0lDQWdJQ0FnSUdOaGMyVWdRbUp2ZUVGc2FXZHVaV1JVWlhoMExrSkJVMFZNU1U1RkxrSlBXRjlEUlU1VVJWSTZYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHNWxkMWtnUFNCNUlDc2dkR2hwY3k1ZlpHbHpkRUpoYzJWVWIwMXBaRHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdZbkpsWVdzN1hISmNiaUFnSUNBZ0lDQWdZMkZ6WlNCQ1ltOTRRV3hwWjI1bFpGUmxlSFF1UWtGVFJVeEpUa1V1UWs5WVgwSlBWRlJQVFRwY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYm1WM1dTQTlJSGtnTFNCMGFHbHpMbDlrYVhOMFFtRnpaVlJ2UW05MGRHOXRPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmljbVZoYXp0Y2NseHVJQ0FnSUNBZ0lDQmpZWE5sSUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQzVDUVZORlRFbE9SUzVHVDA1VVgwTkZUbFJGVWpwY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1NHVnBaMmgwSUdseklHRndjSEp2ZUdsdFlYUmxaQ0JoY3lCaGMyTmxiblFnS3lCa1pYTmpaVzUwWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzVsZDFrZ1BTQjVJQzBnZEdocGN5NWZaR1Z6WTJWdWRDQXJJQ2gwYUdsekxsOWhjMk5sYm5RZ0t5QjBhR2x6TGw5a1pYTmpaVzUwS1NBdklESTdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHSnlaV0ZyTzF4eVhHNGdJQ0FnSUNBZ0lHTmhjMlVnUW1KdmVFRnNhV2R1WldSVVpYaDBMa0pCVTBWTVNVNUZMa0ZNVUVoQlFrVlVTVU02WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzVsZDFrZ1BTQjVPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmljbVZoYXp0Y2NseHVJQ0FnSUNBZ0lDQmtaV1poZFd4ME9seHlYRzRnSUNBZ0lDQWdJQ0FnSUNCdVpYZFpJRDBnZVR0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVzYjJjb1hDSlZibkpsWTI5bmJtbDZaV1FnZG1WeWRHbGpZV3dnWVd4cFoyNDZYQ0lzSUhSb2FYTXVYM1pCYkdsbmJpazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHSnlaV0ZyTzF4eVhHNGdJQ0FnZlZ4eVhHNGdJQ0FnY21WMGRYSnVJSHQ0T2lCdVpYZFlMQ0I1T2lCdVpYZFpmVHRjY2x4dWZUdGNjbHh1WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUTJGc1kzVnNZWFJsY3lCaWIzVnVaR2x1WnlCaWIzZ2dZVzVrSUhaaGNtbHZkWE1nYldWMGNtbGpjeUJtYjNJZ2RHaGxJR04xY25KbGJuUWdkR1Y0ZENCaGJtUWdabTl1ZEZ4eVhHNGdLaUJBY0hKcGRtRjBaVnh5WEc0Z0tpOWNjbHh1UW1KdmVFRnNhV2R1WldSVVpYaDBMbkJ5YjNSdmRIbHdaUzVmWTJGc1kzVnNZWFJsVFdWMGNtbGpjeUE5SUdaMWJtTjBhVzl1S0hOb2IzVnNaRlZ3WkdGMFpVaGxhV2RvZENrZ2V5QWdYSEpjYmlBZ0lDQXZMeUJ3TlNBd0xqVXVNQ0JvWVhNZ1lTQmlkV2NnTFNCMFpYaDBJR0p2ZFc1a2N5QmhjbVVnWTJ4cGNIQmxaQ0JpZVNBb01Dd2dNQ2xjY2x4dUlDQWdJQzh2SUVOaGJHTjFiR0YwYVc1bklHSnZkVzVrY3lCb1lXTnJYSEpjYmlBZ0lDQjJZWElnWW05MWJtUnpJRDBnZEdocGN5NWZabTl1ZEM1MFpYaDBRbTkxYm1SektIUm9hWE11WDNSbGVIUXNJREV3TURBc0lERXdNREFzSUhSb2FYTXVYMlp2Ym5SVGFYcGxLVHRjY2x4dUlDQWdJQzh2SUVKdmRXNWtjeUJwY3lCaElISmxabVZ5Wlc1alpTQXRJR2xtSUhkbElHMWxjM01nZDJsMGFDQnBkQ0JrYVhKbFkzUnNlU3dnZDJVZ1kyRnVJRzFsYzNNZ2RYQWdYSEpjYmlBZ0lDQXZMeUJtZFhSMWNtVWdkbUZzZFdWeklTQW9TWFFnWTJoaGJtZGxjeUIwYUdVZ1ltSnZlQ0JqWVdOb1pTQnBiaUJ3TlM0cFhISmNiaUFnSUNCaWIzVnVaSE1nUFNCN0lGeHlYRzRnSUNBZ0lDQWdJSGc2SUdKdmRXNWtjeTU0SUMwZ01UQXdNQ3dnWEhKY2JpQWdJQ0FnSUNBZ2VUb2dZbTkxYm1Sekxua2dMU0F4TURBd0xDQmNjbHh1SUNBZ0lDQWdJQ0IzT2lCaWIzVnVaSE11ZHl3Z1hISmNiaUFnSUNBZ0lDQWdhRG9nWW05MWJtUnpMbWdnWEhKY2JpQWdJQ0I5T3lCY2NseHVYSEpjYmlBZ0lDQnBaaUFvYzJodmRXeGtWWEJrWVhSbFNHVnBaMmgwS1NCN1hISmNiaUFnSUNBZ0lDQWdkR2hwY3k1ZllYTmpaVzUwSUQwZ2RHaHBjeTVmWm05dWRDNWZkR1Y0ZEVGelkyVnVkQ2gwYUdsekxsOW1iMjUwVTJsNlpTazdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZaR1Z6WTJWdWRDQTlJSFJvYVhNdVgyWnZiblF1WDNSbGVIUkVaWE5qWlc1MEtIUm9hWE11WDJadmJuUlRhWHBsS1R0Y2NseHVJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQXZMeUJWYzJVZ1ltOTFibVJ6SUhSdklHTmhiR04xYkdGMFpTQm1iMjUwSUcxbGRISnBZM05jY2x4dUlDQWdJSFJvYVhNdWQybGtkR2dnUFNCaWIzVnVaSE11ZHp0Y2NseHVJQ0FnSUhSb2FYTXVhR1ZwWjJoMElEMGdZbTkxYm1SekxtZzdYSEpjYmlBZ0lDQjBhR2x6TG1oaGJHWlhhV1IwYUNBOUlIUm9hWE11ZDJsa2RHZ2dMeUF5TzF4eVhHNGdJQ0FnZEdocGN5NW9ZV3htU0dWcFoyaDBJRDBnZEdocGN5NW9aV2xuYUhRZ0x5QXlPMXh5WEc0Z0lDQWdkR2hwY3k1ZlltOTFibVJ6VDJabWMyVjBJRDBnZXlCNE9pQmliM1Z1WkhNdWVDd2dlVG9nWW05MWJtUnpMbmtnZlR0Y2NseHVJQ0FnSUhSb2FYTXVYMlJwYzNSQ1lYTmxWRzlOYVdRZ1BTQk5ZWFJvTG1GaWN5aGliM1Z1WkhNdWVTa2dMU0IwYUdsekxtaGhiR1pJWldsbmFIUTdYSEpjYmlBZ0lDQjBhR2x6TGw5a2FYTjBRbUZ6WlZSdlFtOTBkRzl0SUQwZ2RHaHBjeTVvWldsbmFIUWdMU0JOWVhSb0xtRmljeWhpYjNWdVpITXVlU2s3WEhKY2JuMDdJaXdpWlhod2IzSjBjeTVrWldaaGRXeDBJRDBnWm5WdVkzUnBiMjRvZG1Gc2RXVXNJR1JsWm1GMWJIUldZV3gxWlNrZ2UxeHlYRzRnSUNBZ2NtVjBkWEp1SUNoMllXeDFaU0FoUFQwZ2RXNWtaV1pwYm1Wa0tTQS9JSFpoYkhWbElEb2daR1ZtWVhWc2RGWmhiSFZsTzF4eVhHNTlPeUlzSW0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnU0c5MlpYSlRiR2xrWlhOb2IzZHpPMXh5WEc1Y2NseHVkbUZ5SUhWMGFXeHBkR2xsY3lBOUlISmxjWFZwY21Vb1hDSXVMM1YwYVd4cGRHbGxjeTVxYzF3aUtUdGNjbHh1WEhKY2JtWjFibU4wYVc5dUlFaHZkbVZ5VTJ4cFpHVnphRzkzY3loemJHbGtaWE5vYjNkRVpXeGhlU3dnZEhKaGJuTnBkR2x2YmtSMWNtRjBhVzl1S1NCN1hISmNiaUFnSUNCMGFHbHpMbDl6Ykdsa1pYTm9iM2RFWld4aGVTQTlJQ2h6Ykdsa1pYTm9iM2RFWld4aGVTQWhQVDBnZFc1a1pXWnBibVZrS1NBL0lITnNhV1JsYzJodmQwUmxiR0Y1SURwY2NseHVJQ0FnSUNBZ0lDQXlNREF3TzF4eVhHNGdJQ0FnZEdocGN5NWZkSEpoYm5OcGRHbHZia1IxY21GMGFXOXVJRDBnS0hSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlBaFBUMGdkVzVrWldacGJtVmtLU0EvWEhKY2JpQWdJQ0FnSUNBZ2RISmhibk5wZEdsdmJrUjFjbUYwYVc5dUlEb2dNVEF3TUR0Y2NseHVYSEpjYmlBZ0lDQjBhR2x6TGw5emJHbGtaWE5vYjNkeklEMGdXMTA3WEhKY2JpQWdJQ0IwYUdsekxuSmxiRzloWkNncE8xeHlYRzU5WEhKY2JseHlYRzVJYjNabGNsTnNhV1JsYzJodmQzTXVjSEp2ZEc5MGVYQmxMbkpsYkc5aFpDQTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUM4dklFNXZkR1U2SUhSb2FYTWdhWE1nWTNWeWNtVnVkR3g1SUc1dmRDQnlaV0ZzYkhrZ1ltVnBibWNnZFhObFpDNGdWMmhsYmlCaElIQmhaMlVnYVhNZ2JHOWhaR1ZrTEZ4eVhHNGdJQ0FnTHk4Z2JXRnBiaTVxY3lCcGN5QnFkWE4wSUhKbExXbHVjM1JoYm1OcGJtY2dkR2hsSUVodmRtVnlVMnhwWkdWemFHOTNjMXh5WEc0Z0lDQWdkbUZ5SUc5c1pGTnNhV1JsYzJodmQzTWdQU0IwYUdsekxsOXpiR2xrWlhOb2IzZHpJSHg4SUZ0ZE8xeHlYRzRnSUNBZ2RHaHBjeTVmYzJ4cFpHVnphRzkzY3lBOUlGdGRPMXh5WEc0Z0lDQWdKQ2hjSWk1b2IzWmxjaTF6Ykdsa1pYTm9iM2RjSWlrdVpXRmphQ2htZFc1amRHbHZiaUFvWHl3Z1pXeGxiV1Z1ZENrZ2UxeHlYRzRnSUNBZ0lDQWdJSFpoY2lBa1pXeGxiV1Z1ZENBOUlDUW9aV3hsYldWdWRDazdYSEpjYmlBZ0lDQWdJQ0FnZG1GeUlHbHVaR1Y0SUQwZ2RHaHBjeTVmWm1sdVpFbHVVMnhwWkdWemFHOTNjeWhsYkdWdFpXNTBMQ0J2YkdSVGJHbGtaWE5vYjNkektUdGNjbHh1SUNBZ0lDQWdJQ0JwWmlBb2FXNWtaWGdnSVQwOUlDMHhLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCemJHbGtaWE5vYjNjZ1BTQnZiR1JUYkdsa1pYTm9iM2R6TG5Od2JHbGpaU2hwYm1SbGVDd2dNU2xiTUYwN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM05zYVdSbGMyaHZkM011Y0hWemFDaHpiR2xrWlhOb2IzY3BPMXh5WEc0Z0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzTnNhV1JsYzJodmQzTXVjSFZ6YUNodVpYY2dVMnhwWkdWemFHOTNLQ1JsYkdWdFpXNTBMQ0IwYUdsekxsOXpiR2xrWlhOb2IzZEVaV3hoZVN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlrcE8xeHlYRzRnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJSDB1WW1sdVpDaDBhR2x6S1NrN1hISmNibjA3WEhKY2JseHlYRzVJYjNabGNsTnNhV1JsYzJodmQzTXVjSEp2ZEc5MGVYQmxMbDltYVc1a1NXNVRiR2xrWlhOb2IzZHpJRDBnWm5WdVkzUnBiMjRnS0dWc1pXMWxiblFzSUhOc2FXUmxjMmh2ZDNNcElIdGNjbHh1SUNBZ0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2djMnhwWkdWemFHOTNjeTVzWlc1bmRHZzdJR2tnS3owZ01Ta2dlMXh5WEc0Z0lDQWdJQ0FnSUdsbUlDaGxiR1Z0Wlc1MElEMDlQU0J6Ykdsa1pYTm9iM2R6VzJsZExtZGxkRVZzWlcxbGJuUW9LU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdhVHRjY2x4dUlDQWdJQ0FnSUNCOVhISmNiaUFnSUNCOVhISmNiaUFnSUNCeVpYUjFjbTRnTFRFN1hISmNibjA3WEhKY2JseHlYRzVtZFc1amRHbHZiaUJUYkdsa1pYTm9iM2NvSkdOdmJuUmhhVzVsY2l3Z2MyeHBaR1Z6YUc5M1JHVnNZWGtzSUhSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlrZ2UxeHlYRzRnSUNBZ2RHaHBjeTVmSkdOdmJuUmhhVzVsY2lBOUlDUmpiMjUwWVdsdVpYSTdYSEpjYmlBZ0lDQjBhR2x6TGw5emJHbGtaWE5vYjNkRVpXeGhlU0E5SUhOc2FXUmxjMmh2ZDBSbGJHRjVPMXh5WEc0Z0lDQWdkR2hwY3k1ZmRISmhibk5wZEdsdmJrUjFjbUYwYVc5dUlEMGdkSEpoYm5OcGRHbHZia1IxY21GMGFXOXVPMXh5WEc0Z0lDQWdkR2hwY3k1ZmRHbHRaVzkxZEVsa0lEMGdiblZzYkR0Y2NseHVJQ0FnSUhSb2FYTXVYMmx0WVdkbFNXNWtaWGdnUFNBd08xeHlYRzRnSUNBZ2RHaHBjeTVmSkdsdFlXZGxjeUE5SUZ0ZE8xeHlYRzVjY2x4dUlDQWdJQzh2SUZObGRDQjFjQ0JoYm1RZ1kyRmphR1VnY21WbVpYSmxibU5sY3lCMGJ5QnBiV0ZuWlhOY2NseHVJQ0FnSUhSb2FYTXVYeVJqYjI1MFlXbHVaWEl1Wm1sdVpDaGNJbWx0WjF3aUtTNWxZV05vS0daMWJtTjBhVzl1SUNocGJtUmxlQ3dnWld4bGJXVnVkQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lIWmhjaUFrYVcxaFoyVWdQU0FrS0dWc1pXMWxiblFwTzF4eVhHNGdJQ0FnSUNBZ0lDUnBiV0ZuWlM1amMzTW9lMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQndiM05wZEdsdmJqb2dYQ0poWW5OdmJIVjBaVndpTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IwYjNBNklGd2lNRndpTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JzWldaME9pQmNJakJjSWl4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZWtsdVpHVjRPaUFvYVc1a1pYZ2dQVDA5SURBcElEOGdNaUE2SURBZ0x5OGdSbWx5YzNRZ2FXMWhaMlVnYzJodmRXeGtJR0psSUc5dUlIUnZjRnh5WEc0Z0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ0lDQWdJSFJvYVhNdVh5UnBiV0ZuWlhNdWNIVnphQ2drYVcxaFoyVXBPMXh5WEc0Z0lDQWdmUzVpYVc1a0tIUm9hWE1wS1R0Y2NseHVYSEpjYmlBZ0lDQXZMeUJFWlhSbGNtMXBibVVnZDJobGRHaGxjaUIwYnlCaWFXNWtJR2x1ZEdWeVlXTjBhWFpwZEhsY2NseHVJQ0FnSUhSb2FYTXVYMjUxYlVsdFlXZGxjeUE5SUhSb2FYTXVYeVJwYldGblpYTXViR1Z1WjNSb08xeHlYRzRnSUNBZ2FXWWdLSFJvYVhNdVgyNTFiVWx0WVdkbGN5QThQU0F4S1NCeVpYUjFjbTQ3WEhKY2JseHlYRzRnSUNBZ0x5OGdRbWx1WkNCbGRtVnVkQ0JzYVhOMFpXNWxjbk5jY2x4dUlDQWdJSFJvYVhNdVh5UmpiMjUwWVdsdVpYSXViMjRvWENKdGIzVnpaV1Z1ZEdWeVhDSXNJSFJvYVhNdVgyOXVSVzUwWlhJdVltbHVaQ2gwYUdsektTazdYSEpjYmlBZ0lDQjBhR2x6TGw4a1kyOXVkR0ZwYm1WeUxtOXVLRndpYlc5MWMyVnNaV0YyWlZ3aUxDQjBhR2x6TGw5dmJreGxZWFpsTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzVjY2x4dWZWeHlYRzVjY2x4dVUyeHBaR1Z6YUc5M0xuQnliM1J2ZEhsd1pTNW5aWFJGYkdWdFpXNTBJRDBnWm5WdVkzUnBiMjRnS0NrZ2UxeHlYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTXVYeVJqYjI1MFlXbHVaWEl1WjJWMEtEQXBPMXh5WEc1OU8xeHlYRzVjY2x4dVUyeHBaR1Z6YUc5M0xuQnliM1J2ZEhsd1pTNW5aWFFrUld4bGJXVnVkQ0E5SUdaMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMbDhrWTI5dWRHRnBibVZ5TzF4eVhHNTlPMXh5WEc1Y2NseHVVMnhwWkdWemFHOTNMbkJ5YjNSdmRIbHdaUzVmYjI1RmJuUmxjaUE5SUdaMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lDOHZJRVpwY25OMElIUnlZVzV6YVhScGIyNGdjMmh2ZFd4a0lHaGhjSEJsYmlCd2NtVjBkSGtnYzI5dmJpQmhablJsY2lCb2IzWmxjbWx1WnlCcGJpQnZjbVJsY2x4eVhHNGdJQ0FnTHk4Z2RHOGdZMngxWlNCMGFHVWdkWE5sY2lCcGJuUnZJSGRvWVhRZ2FYTWdhR0Z3Y0dWdWFXNW5YSEpjYmlBZ0lDQjBhR2x6TGw5MGFXMWxiM1YwU1dRZ1BTQnpaWFJVYVcxbGIzVjBLSFJvYVhNdVgyRmtkbUZ1WTJWVGJHbGtaWE5vYjNjdVltbHVaQ2gwYUdsektTd2dOVEF3S1R0Y2NseHVmVHRjY2x4dVhISmNibE5zYVdSbGMyaHZkeTV3Y205MGIzUjVjR1V1WDI5dVRHVmhkbVVnUFNCbWRXNWpkR2x2YmlBb0tTQjdYSEpjYmlBZ0lDQmpiR1ZoY2tsdWRHVnlkbUZzS0hSb2FYTXVYM1JwYldWdmRYUkpaQ2s3WEhKY2JpQWdJQ0IwYUdsekxsOTBhVzFsYjNWMFNXUWdQU0J1ZFd4c08xeHlYRzU5TzF4eVhHNWNjbHh1VTJ4cFpHVnphRzkzTG5CeWIzUnZkSGx3WlM1ZllXUjJZVzVqWlZOc2FXUmxjMmh2ZHlBOUlHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJSFJvYVhNdVgybHRZV2RsU1c1a1pYZ2dLejBnTVR0Y2NseHVJQ0FnSUhaaGNpQnBPMXh5WEc1Y2NseHVJQ0FnSUM4dklFMXZkbVVnZEdobElHbHRZV2RsSUdaeWIyMGdNaUJ6ZEdWd2N5QmhaMjhnWkc5M2JpQjBieUIwYUdVZ1ltOTBkRzl0SUhvdGFXNWtaWGdnWVc1a0lHMWhhMlZjY2x4dUlDQWdJQzh2SUdsMElHbHVkbWx6YVdKc1pWeHlYRzRnSUNBZ2FXWWdLSFJvYVhNdVgyNTFiVWx0WVdkbGN5QStQU0F6S1NCN1hISmNiaUFnSUNBZ0lDQWdhU0E5SUhWMGFXeHBkR2xsY3k1M2NtRndTVzVrWlhnb2RHaHBjeTVmYVcxaFoyVkpibVJsZUNBdElESXNJSFJvYVhNdVgyNTFiVWx0WVdkbGN5azdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZKR2x0WVdkbGMxdHBYUzVqYzNNb2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCNlNXNWtaWGc2SURBc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUc5d1lXTnBkSGs2SURCY2NseHVJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDhrYVcxaFoyVnpXMmxkTG5abGJHOWphWFI1S0Z3aWMzUnZjRndpS1R0Y2NseHVJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQXZMeUJOYjNabElIUm9aU0JwYldGblpTQm1jbTl0SURFZ2MzUmxjSE1nWVdkdklHUnZkMjRnZEc4Z2RHaGxJRzFwWkdSc1pTQjZMV2x1WkdWNElHRnVaQ0J0WVd0bFhISmNiaUFnSUNBdkx5QnBkQ0JqYjIxd2JHVjBaV3g1SUhacGMybGliR1ZjY2x4dUlDQWdJR2xtSUNoMGFHbHpMbDl1ZFcxSmJXRm5aWE1nUGowZ01pa2dlMXh5WEc0Z0lDQWdJQ0FnSUdrZ1BTQjFkR2xzYVhScFpYTXVkM0poY0VsdVpHVjRLSFJvYVhNdVgybHRZV2RsU1c1a1pYZ2dMU0F4TENCMGFHbHpMbDl1ZFcxSmJXRm5aWE1wTzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WHlScGJXRm5aWE5iYVYwdVkzTnpLSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdla2x1WkdWNE9pQXhMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnZjR0ZqYVhSNU9pQXhYSEpjYmlBZ0lDQWdJQ0FnZlNrN1hISmNiaUFnSUNBZ0lDQWdkR2hwY3k1ZkpHbHRZV2RsYzF0cFhTNTJaV3h2WTJsMGVTaGNJbk4wYjNCY0lpazdYSEpjYmlBZ0lDQjlYSEpjYmx4eVhHNGdJQ0FnTHk4Z1RXOTJaU0IwYUdVZ1kzVnljbVZ1ZENCcGJXRm5aU0IwYnlCMGFHVWdkRzl3SUhvdGFXNWtaWGdnWVc1a0lHWmhaR1VnYVhRZ2FXNWNjbHh1SUNBZ0lIUm9hWE11WDJsdFlXZGxTVzVrWlhnZ1BTQjFkR2xzYVhScFpYTXVkM0poY0VsdVpHVjRLSFJvYVhNdVgybHRZV2RsU1c1a1pYZ3NJSFJvYVhNdVgyNTFiVWx0WVdkbGN5azdYSEpjYmlBZ0lDQjBhR2x6TGw4a2FXMWhaMlZ6VzNSb2FYTXVYMmx0WVdkbFNXNWtaWGhkTG1OemN5aDdYSEpjYmlBZ0lDQWdJQ0FnZWtsdVpHVjRPaUF5TEZ4eVhHNGdJQ0FnSUNBZ0lHOXdZV05wZEhrNklEQmNjbHh1SUNBZ0lIMHBPMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHbHRZV2RsYzF0MGFHbHpMbDlwYldGblpVbHVaR1Y0WFM1MlpXeHZZMmwwZVNoN1hISmNiaUFnSUNBZ0lDQWdiM0JoWTJsMGVUb2dNVnh5WEc0Z0lDQWdmU3dnZEdocGN5NWZkSEpoYm5OcGRHbHZia1IxY21GMGFXOXVMQ0JjSW1WaGMyVkpiazkxZEZGMVlXUmNJaWs3WEhKY2JseHlYRzRnSUNBZ0x5OGdVMk5vWldSMWJHVWdibVY0ZENCMGNtRnVjMmwwYVc5dVhISmNiaUFnSUNCMGFHbHpMbDkwYVcxbGIzVjBTV1FnUFNCelpYUlVhVzFsYjNWMEtIUm9hWE11WDJGa2RtRnVZMlZUYkdsa1pYTm9iM2N1WW1sdVpDaDBhR2x6S1N4Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5emJHbGtaWE5vYjNkRVpXeGhlU2s3WEhKY2JuMDdJaXdpYlc5a2RXeGxMbVY0Y0c5eWRITWdQU0JDWVhObFRHOW5iMU5yWlhSamFEdGNjbHh1WEhKY2JuWmhjaUIxZEdsc2N5QTlJSEpsY1hWcGNtVW9YQ0l1TGk5MWRHbHNhWFJwWlhNdWFuTmNJaWs3WEhKY2JseHlYRzVtZFc1amRHbHZiaUJDWVhObFRHOW5iMU5yWlhSamFDZ2tibUYyTENBa2JtRjJURzluYnl3Z1ptOXVkRkJoZEdncElIdGNjbHh1SUNBZ0lIUm9hWE11WHlSdVlYWWdQU0FrYm1GMk8xeHlYRzRnSUNBZ2RHaHBjeTVmSkc1aGRreHZaMjhnUFNBa2JtRjJURzluYnp0Y2NseHVJQ0FnSUhSb2FYTXVYMlp2Ym5SUVlYUm9JRDBnWm05dWRGQmhkR2c3WEhKY2JseHlYRzRnSUNBZ2RHaHBjeTVmZEdWNGRDQTlJSFJvYVhNdVh5UnVZWFpNYjJkdkxuUmxlSFFvS1R0Y2NseHVJQ0FnSUhSb2FYTXVYMmx6Um1seWMzUkdjbUZ0WlNBOUlIUnlkV1U3WEhKY2JpQWdJQ0IwYUdsekxsOXBjMDF2ZFhObFQzWmxjaUE5SUdaaGJITmxPMXh5WEc0Z0lDQWdkR2hwY3k1ZmFYTlBkbVZ5VG1GMlRHOW5ieUE5SUdaaGJITmxPMXh5WEc1Y2NseHVJQ0FnSUhSb2FYTXVYM1Z3WkdGMFpWUmxlSFJQWm1aelpYUW9LVHRjY2x4dUlDQWdJSFJvYVhNdVgzVndaR0YwWlZOcGVtVW9LVHRjY2x4dUlDQWdJSFJvYVhNdVgzVndaR0YwWlVadmJuUlRhWHBsS0NrN1hISmNibHh5WEc0Z0lDQWdMeThnUTNKbFlYUmxJR0VnS0hKbGJHRjBhWFpsSUhCdmMybDBhVzl1WldRcElHTnZiblJoYVc1bGNpQm1iM0lnZEdobElITnJaWFJqYUNCcGJuTnBaR1VnYjJZZ2RHaGxYSEpjYmlBZ0lDQXZMeUJ1WVhZc0lHSjFkQ0J0WVd0bElITjFjbVVnZEdoaGRDQnBkQ0JwY3lCQ1JVaEpUa1FnWlhabGNubDBhR2x1WnlCbGJITmxMaUJGZG1WdWRIVmhiR3g1TENCM1pTQjNhV3hzWEhKY2JpQWdJQ0F2THlCa2NtOXdJR3AxYzNRZ2RHaGxJRzVoZGlCc2IyZHZJQ2h1YjNRZ2RHaGxJRzVoZGlCc2FXNXJjeUVwSUdKbGFHbHVaQ0IwYUdVZ1kyRnVkbUZ6TGx4eVhHNGdJQ0FnZEdocGN5NWZKR052Ym5SaGFXNWxjaUE5SUNRb1hDSThaR2wyUGx3aUtWeHlYRzRnSUNBZ0lDQWdJQzVqYzNNb2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCd2IzTnBkR2x2YmpvZ1hDSmhZbk52YkhWMFpWd2lMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBiM0E2SUZ3aU1IQjRYQ0lzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR3hsWm5RNklGd2lNSEI0WENKY2NseHVJQ0FnSUNBZ0lDQjlLVnh5WEc0Z0lDQWdJQ0FnSUM1d2NtVndaVzVrVkc4b2RHaHBjeTVmSkc1aGRpbGNjbHh1SUNBZ0lDQWdJQ0F1YUdsa1pTZ3BPMXh5WEc1Y2NseHVJQ0FnSUhSb2FYTXVYMk55WldGMFpWQTFTVzV6ZEdGdVkyVW9LVHRjY2x4dWZWeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFTnlaV0YwWlNCaElHNWxkeUJ3TlNCcGJuTjBZVzVqWlNCaGJtUWdZbWx1WkNCMGFHVWdZWEJ3Y205d2NtbGhkR1VnWTJ4aGMzTWdiV1YwYUc5a2N5QjBieUIwYUdWY2NseHVJQ29nYVc1emRHRnVZMlV1SUZSb2FYTWdZV3h6YnlCbWFXeHNjeUJwYmlCMGFHVWdjQ0J3WVhKaGJXVjBaWElnYjI0Z2RHaGxJR05zWVhOeklHMWxkR2h2WkhNZ0tITmxkSFZ3TEZ4eVhHNGdLaUJrY21GM0xDQmxkR011S1NCemJ5QjBhR0YwSUhSb2IzTmxJR1oxYm1OMGFXOXVjeUJqWVc0Z1ltVWdZU0JzYVhSMGJHVWdiR1Z6Y3lCMlpYSmliM05sSURvcElGeHlYRzRnS2k5Y2NseHVRbUZ6WlV4dloyOVRhMlYwWTJndWNISnZkRzkwZVhCbExsOWpjbVZoZEdWUU5VbHVjM1JoYm1ObElEMGdablZ1WTNScGIyNGdLQ2tnZTF4eVhHNGdJQ0FnYm1WM0lIQTFLR1oxYm1OMGFXOXVLSEFwSUh0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5d0lEMGdjRHRjY2x4dUlDQWdJQ0FnSUNCd0xuQnlaV3h2WVdRZ1BTQjBhR2x6TGw5d2NtVnNiMkZrTG1KcGJtUW9kR2hwY3l3Z2NDazdYSEpjYmlBZ0lDQWdJQ0FnY0M1elpYUjFjQ0E5SUhSb2FYTXVYM05sZEhWd0xtSnBibVFvZEdocGN5d2djQ2s3WEhKY2JpQWdJQ0FnSUNBZ2NDNWtjbUYzSUQwZ2RHaHBjeTVmWkhKaGR5NWlhVzVrS0hSb2FYTXNJSEFwTzF4eVhHNGdJQ0FnZlM1aWFXNWtLSFJvYVhNcExDQjBhR2x6TGw4a1kyOXVkR0ZwYm1WeUxtZGxkQ2d3S1NrN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUm1sdVpDQjBhR1VnWkdsemRHRnVZMlVnWm5KdmJTQjBhR1VnZEc5d0lHeGxablFnYjJZZ2RHaGxJRzVoZGlCMGJ5QjBhR1VnWW5KaGJtUWdiRzluYnlkeklHSmhjMlZzYVc1bExseHlYRzRnS2k5Y2NseHVRbUZ6WlV4dloyOVRhMlYwWTJndWNISnZkRzkwZVhCbExsOTFjR1JoZEdWVVpYaDBUMlptYzJWMElEMGdablZ1WTNScGIyNGdLQ2tnZTF4eVhHNGdJQ0FnZG1GeUlHSmhjMlZzYVc1bFJHbDJJRDBnSkNoY0lqeGthWFkrWENJcFhISmNiaUFnSUNBZ0lDQWdMbU56Y3loN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdScGMzQnNZWGs2SUZ3aWFXNXNhVzVsTFdKc2IyTnJYQ0lzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFpsY25ScFkyRnNRV3hwWjI0NklGd2lZbUZ6Wld4cGJtVmNJbHh5WEc0Z0lDQWdJQ0FnSUgwcExuQnlaWEJsYm1SVWJ5aDBhR2x6TGw4a2JtRjJURzluYnlrN1hISmNiaUFnSUNCMllYSWdibUYyVDJabWMyVjBJRDBnZEdocGN5NWZKRzVoZGk1dlptWnpaWFFvS1R0Y2NseHVJQ0FnSUhaaGNpQnNiMmR2UW1GelpXeHBibVZQWm1aelpYUWdQU0JpWVhObGJHbHVaVVJwZGk1dlptWnpaWFFvS1R0Y2NseHVJQ0FnSUhSb2FYTXVYM1JsZUhSUFptWnpaWFFnUFNCN1hISmNiaUFnSUNBZ0lDQWdkRzl3T2lCc2IyZHZRbUZ6Wld4cGJtVlBabVp6WlhRdWRHOXdJQzBnYm1GMlQyWm1jMlYwTG5SdmNDeGNjbHh1SUNBZ0lDQWdJQ0JzWldaME9pQnNiMmR2UW1GelpXeHBibVZQWm1aelpYUXViR1ZtZENBdElHNWhkazltWm5ObGRDNXNaV1owWEhKY2JpQWdJQ0I5TzF4eVhHNGdJQ0FnWW1GelpXeHBibVZFYVhZdWNtVnRiM1psS0NrN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUm1sdVpDQjBhR1VnWW05MWJtUnBibWNnWW05NElHOW1JSFJvWlNCaWNtRnVaQ0JzYjJkdklHbHVJSFJvWlNCdVlYWXVJRlJvYVhNZ1ltSnZlQ0JqWVc0Z2RHaGxiaUJpWlNCY2NseHVJQ29nZFhObFpDQjBieUJqYjI1MGNtOXNJSGRvWlc0Z2RHaGxJR04xY25OdmNpQnphRzkxYkdRZ1ltVWdZU0J3YjJsdWRHVnlMbHh5WEc0Z0tpOWNjbHh1UW1GelpVeHZaMjlUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDlqWVd4amRXeGhkR1ZPWVhaTWIyZHZRbTkxYm1SeklEMGdablZ1WTNScGIyNGdLQ2tnZTF4eVhHNGdJQ0FnZG1GeUlHNWhkazltWm5ObGRDQTlJSFJvYVhNdVh5UnVZWFl1YjJabWMyVjBLQ2s3WEhKY2JpQWdJQ0IyWVhJZ2JHOW5iMDltWm5ObGRDQTlJSFJvYVhNdVh5UnVZWFpNYjJkdkxtOW1abk5sZENncE8xeHlYRzRnSUNBZ2RHaHBjeTVmYkc5bmIwSmliM2dnUFNCN1hISmNiaUFnSUNBZ0lDQWdlVG9nYkc5bmIwOW1abk5sZEM1MGIzQWdMU0J1WVhaUFptWnpaWFF1ZEc5d0xGeHlYRzRnSUNBZ0lDQWdJSGc2SUd4dloyOVBabVp6WlhRdWJHVm1kQ0F0SUc1aGRrOW1abk5sZEM1c1pXWjBMRnh5WEc0Z0lDQWdJQ0FnSUhjNklIUm9hWE11WHlSdVlYWk1iMmR2TG05MWRHVnlWMmxrZEdnb0tTd2dMeThnUlhoamJIVmtaU0J0WVhKbmFXNGdabkp2YlNCMGFHVWdZbUp2ZUZ4eVhHNGdJQ0FnSUNBZ0lHZzZJSFJvYVhNdVh5UnVZWFpNYjJkdkxtOTFkR1Z5U0dWcFoyaDBLQ2tnTHk4Z1RHbHVhM01nWVhKbGJpZDBJR05zYVdOcllXSnNaU0J2YmlCdFlYSm5hVzVjY2x4dUlDQWdJSDA3WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dWWEJrWVhSbElIUm9aU0JrYVcxbGJuTnBiMjV6SUhSdklHMWhkR05vSUhSb1pTQnVZWFlnTFNCbGVHTnNkV1JwYm1jZ1lXNTVJRzFoY21kcGJpd2djR0ZrWkdsdVp5QW1JRnh5WEc0Z0tpQmliM0prWlhJdVhISmNiaUFxTDF4eVhHNUNZWE5sVEc5bmIxTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgzVndaR0YwWlZOcGVtVWdQU0JtZFc1amRHbHZiaUFvS1NCN1hISmNiaUFnSUNCMGFHbHpMbDkzYVdSMGFDQTlJSFJvYVhNdVh5UnVZWFl1YVc1dVpYSlhhV1IwYUNncE8xeHlYRzRnSUNBZ2RHaHBjeTVmYUdWcFoyaDBJRDBnZEdocGN5NWZKRzVoZGk1cGJtNWxja2hsYVdkb2RDZ3BPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFZHlZV0lnZEdobElHWnZiblFnYzJsNlpTQm1jbTl0SUhSb1pTQmljbUZ1WkNCc2IyZHZJR3hwYm1zdUlGUm9hWE1nYldGclpYTWdkR2hsSUdadmJuUWdjMmw2WlNCdlppQjBhR1ZjY2x4dUlDb2djMnRsZEdOb0lISmxjM0J2Ym5OcGRtVXVYSEpjYmlBcUwxeHlYRzVDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXVYM1Z3WkdGMFpVWnZiblJUYVhwbElEMGdablZ1WTNScGIyNGdLQ2tnZTF4eVhHNGdJQ0FnZEdocGN5NWZabTl1ZEZOcGVtVWdQU0IwYUdsekxsOGtibUYyVEc5bmJ5NWpjM01vWENKbWIyNTBVMmw2WlZ3aUtTNXlaWEJzWVdObEtGd2ljSGhjSWl3Z1hDSmNJaWs3WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dWMmhsYmlCMGFHVWdZbkp2ZDNObGNpQnBjeUJ5WlhOcGVtVmtMQ0J5WldOaGJHTjFiR0YwWlNCaGJHd2dkR2hsSUc1bFkyVnpjMkZ5ZVNCemRHRjBjeUJ6YnlCMGFHRjBJSFJvWlZ4eVhHNGdLaUJ6YTJWMFkyZ2dZMkZ1SUdKbElISmxjM0J2Ym5OcGRtVXVJRlJvWlNCc2IyZHZJR2x1SUhSb1pTQnphMlYwWTJnZ2MyaHZkV3hrSUVGTVYwRlpVeUJsZUdGamRHeDVJRzFoZEdOb1hISmNiaUFxSUhSb1pTQmljbUZ1WnlCc2IyZHZJR3hwYm1zZ2RHaGxJRWhVVFV3dVhISmNiaUFxTDF4eVhHNUNZWE5sVEc5bmIxTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgyOXVVbVZ6YVhwbElEMGdablZ1WTNScGIyNGdLSEFwSUh0Y2NseHVJQ0FnSUhSb2FYTXVYM1Z3WkdGMFpWTnBlbVVvS1R0Y2NseHVJQ0FnSUhSb2FYTXVYM1Z3WkdGMFpVWnZiblJUYVhwbEtDazdYSEpjYmlBZ0lDQjBhR2x6TGw5MWNHUmhkR1ZVWlhoMFQyWm1jMlYwS0NrN1hISmNiaUFnSUNCMGFHbHpMbDlqWVd4amRXeGhkR1ZPWVhaTWIyZHZRbTkxYm1SektDazdYSEpjYmlBZ0lDQndMbkpsYzJsNlpVTmhiblpoY3loMGFHbHpMbDkzYVdSMGFDd2dkR2hwY3k1ZmFHVnBaMmgwS1R0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJWY0dSaGRHVWdkR2hsSUY5cGMwMXZkWE5sVDNabGNpQndjbTl3WlhKMGVTNGdYSEpjYmlBcUwxeHlYRzVDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXVYM05sZEUxdmRYTmxUM1psY2lBOUlHWjFibU4wYVc5dUlDaHBjMDF2ZFhObFQzWmxjaWtnZTF4eVhHNGdJQ0FnZEdocGN5NWZhWE5OYjNWelpVOTJaWElnUFNCcGMwMXZkWE5sVDNabGNqdGNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtseHlYRzRnS2lCSlppQjBhR1VnWTNWeWMyOXlJR2x6SUhObGRDQjBieUJoSUhCdmFXNTBaWElzSUdadmNuZGhjbVFnWVc1NUlHTnNhV05ySUdWMlpXNTBjeUIwYnlCMGFHVWdibUYySUd4dloyOHVYSEpjYmlBcUlGUm9hWE1nY21Wa2RXTmxjeUIwYUdVZ2JtVmxaQ0JtYjNJZ2RHaGxJR05oYm5aaGN5QjBieUJrYnlCaGJua2dRVXBCV0MxNUlITjBkV1ptTGx4eVhHNGdLaTljY2x4dVFtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5dmJrTnNhV05ySUQwZ1puVnVZM1JwYjI0Z0tHVXBJSHRjY2x4dUlDQWdJR2xtSUNoMGFHbHpMbDlwYzA5MlpYSk9ZWFpNYjJkdktTQjBhR2x6TGw4a2JtRjJURzluYnk1MGNtbG5aMlZ5S0dVcE8xeHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUVKaGMyVWdjSEpsYkc5aFpDQnRaWFJvYjJRZ2RHaGhkQ0JxZFhOMElHeHZZV1J6SUhSb1pTQnVaV05sYzNOaGNua2dabTl1ZEZ4eVhHNGdLaTljY2x4dVFtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5d2NtVnNiMkZrSUQwZ1puVnVZM1JwYjI0Z0tIQXBJSHRjY2x4dUlDQWdJSFJvYVhNdVgyWnZiblFnUFNCd0xteHZZV1JHYjI1MEtIUm9hWE11WDJadmJuUlFZWFJvS1R0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJDWVhObElITmxkSFZ3SUcxbGRHaHZaQ0IwYUdGMElHUnZaWE1nYzI5dFpTQm9aV0YyZVNCc2FXWjBhVzVuTGlCSmRDQm9hV1JsY3lCMGFHVWdibUYySUdKeVlXNWtJR3h2WjI5Y2NseHVJQ29nWVc1a0lISmxkbVZoYkhNZ2RHaGxJR05oYm5aaGN5NGdTWFFnWVd4emJ5QnpaWFJ6SUhWd0lHRWdiRzkwSUc5bUlIUm9aU0JwYm5SbGNtNWhiQ0IyWVhKcFlXSnNaWE1nWVc1a1hISmNiaUFxSUdOaGJuWmhjeUJsZG1WdWRITXVYSEpjYmlBcUwxeHlYRzVDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXVYM05sZEhWd0lEMGdablZ1WTNScGIyNGdLSEFwSUh0Y2NseHVJQ0FnSUhaaGNpQnlaVzVrWlhKbGNpQTlJSEF1WTNKbFlYUmxRMkZ1ZG1GektIUm9hWE11WDNkcFpIUm9MQ0IwYUdsekxsOW9aV2xuYUhRcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkdOaGJuWmhjeUE5SUNRb2NtVnVaR1Z5WlhJdVkyRnVkbUZ6S1R0Y2NseHVYSEpjYmlBZ0lDQXZMeUJUYUc5M0lIUm9aU0JqWVc1MllYTWdZVzVrSUdocFpHVWdkR2hsSUd4dloyOHVJRlZ6YVc1bklITm9iM2N2YUdsa1pTQnZiaUIwYUdVZ2JHOW5ieUIzYVd4c0lHTmhkWE5sWEhKY2JpQWdJQ0F2THlCcVVYVmxjbmtnZEc4Z2JYVmpheUIzYVhSb0lIUm9aU0J3YjNOcGRHbHZibWx1Wnl3Z2QyaHBZMmdnYVhNZ2RYTmxaQ0IwYnlCallXeGpkV3hoZEdVZ2QyaGxjbVVnZEc5Y2NseHVJQ0FnSUM4dklHUnlZWGNnZEdobElHTmhiblpoY3lCMFpYaDBMaUJKYm5OMFpXRmtMQ0JxZFhOMElIQjFjMmdnZEdobElHeHZaMjhnWW1Wb2FXNWtJSFJvWlNCallXNTJZWE11SUZSb2FYTmNjbHh1SUNBZ0lDOHZJR0ZzYkc5M2N5QnRZV3RsY3lCcGRDQnpieUIwYUdVZ1kyRnVkbUZ6SUdseklITjBhV3hzSUdKbGFHbHVaQ0IwYUdVZ2JtRjJJR3hwYm10ekxseHlYRzRnSUNBZ2RHaHBjeTVmSkdOdmJuUmhhVzVsY2k1emFHOTNLQ2s3WEhKY2JpQWdJQ0IwYUdsekxsOGtibUYyVEc5bmJ5NWpjM01vWENKNlNXNWtaWGhjSWl3Z0xURXBPMXh5WEc1Y2NseHVJQ0FnSUM4dklGUm9aWEpsSUdsemJpZDBJR0VnWjI5dlpDQjNZWGtnZEc4Z1kyaGxZMnNnZDJobGRHaGxjaUIwYUdVZ2MydGxkR05vSUdoaGN5QjBhR1VnYlc5MWMyVWdiM1psY2x4eVhHNGdJQ0FnTHk4Z2FYUXVJSEF1Ylc5MWMyVllJQ1lnY0M1dGIzVnpaVmtnWVhKbElHbHVhWFJwWVd4cGVtVmtJSFJ2SUNnd0xDQXdLU3dnWVc1a0lIQXVabTlqZFhObFpDQnBjMjRuZENCY2NseHVJQ0FnSUM4dklHRnNkMkY1Y3lCeVpXeHBZV0pzWlM1Y2NseHVJQ0FnSUhSb2FYTXVYeVJqWVc1MllYTXViMjRvWENKdGIzVnpaVzkyWlhKY0lpd2dkR2hwY3k1ZmMyVjBUVzkxYzJWUGRtVnlMbUpwYm1Rb2RHaHBjeXdnZEhKMVpTa3BPMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHTmhiblpoY3k1dmJpaGNJbTF2ZFhObGIzVjBYQ0lzSUhSb2FYTXVYM05sZEUxdmRYTmxUM1psY2k1aWFXNWtLSFJvYVhNc0lHWmhiSE5sS1NrN1hISmNibHh5WEc0Z0lDQWdMeThnUm05eWQyRnlaQ0J0YjNWelpTQmpiR2xqYTNNZ2RHOGdkR2hsSUc1aGRpQnNiMmR2WEhKY2JpQWdJQ0IwYUdsekxsOGtZMkZ1ZG1GekxtOXVLRndpWTJ4cFkydGNJaXdnZEdocGN5NWZiMjVEYkdsamF5NWlhVzVrS0hSb2FYTXBLVHRjY2x4dVhISmNiaUFnSUNBdkx5QlhhR1Z1SUhSb1pTQjNhVzVrYjNjZ2FYTWdjbVZ6YVhwbFpDd2dkR1Y0ZENBbUlHTmhiblpoY3lCemFYcHBibWNnWVc1a0lIQnNZV05sYldWdWRDQnVaV1ZrSUhSdklHSmxYSEpjYmlBZ0lDQXZMeUJ5WldOaGJHTjFiR0YwWldRdUlGUm9aU0J6YVhSbElHbHpJSEpsYzNCdmJuTnBkbVVzSUhOdklIUm9aU0JwYm5SbGNtRmpkR2wyWlNCallXNTJZWE1nYzJodmRXeGtJR0psWEhKY2JpQWdJQ0F2THlCMGIyOGhJRnh5WEc0Z0lDQWdKQ2gzYVc1a2IzY3BMbTl1S0Z3aWNtVnphWHBsWENJc0lIUm9hWE11WDI5dVVtVnphWHBsTG1KcGJtUW9kR2hwY3l3Z2NDa3BPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFSmhjMlVnWkhKaGR5QnRaWFJvYjJRZ2RHaGhkQ0JqYjI1MGNtOXNjeUIzYUdWMGFHVnlJRzl5SUc1dmRDQjBhR1VnWTNWeWMyOXlJR2x6SUdFZ2NHOXBiblJsY2k0Z1NYUmNjbHh1SUNvZ2MyaHZkV3hrSUc5dWJIa2dZbVVnWVNCd2IybHVkR1Z5SUhkb1pXNGdkR2hsSUcxdmRYTmxJR2x6SUc5MlpYSWdkR2hsSUc1aGRpQmljbUZ1WkNCc2IyZHZMbHh5WEc0Z0tpOWNjbHh1UW1GelpVeHZaMjlUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDlrY21GM0lEMGdablZ1WTNScGIyNGdLSEFwSUh0Y2NseHVJQ0FnSUdsbUlDaDBhR2x6TGw5cGMwMXZkWE5sVDNabGNpa2dlMXh5WEc0Z0lDQWdJQ0FnSUhaaGNpQnBjMDkyWlhKTWIyZHZJRDBnZFhScGJITXVhWE5KYmxKbFkzUW9jQzV0YjNWelpWZ3NJSEF1Ylc5MWMyVlpMQ0IwYUdsekxsOXNiMmR2UW1KdmVDazdYSEpjYmlBZ0lDQWdJQ0FnYVdZZ0tDRjBhR2x6TGw5cGMwOTJaWEpPWVhaTWIyZHZJQ1ltSUdselQzWmxja3h2WjI4cElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYVhOUGRtVnlUbUYyVEc5bmJ5QTlJSFJ5ZFdVN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYeVJqWVc1MllYTXVZM056S0Z3aVkzVnljMjl5WENJc0lGd2ljRzlwYm5SbGNsd2lLVHRjY2x4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnYVdZZ0tIUm9hWE11WDJselQzWmxjazVoZGt4dloyOGdKaVlnSVdselQzWmxja3h2WjI4cElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmYVhOUGRtVnlUbUYyVEc5bmJ5QTlJR1poYkhObE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDhrWTJGdWRtRnpMbU56Y3loY0ltTjFjbk52Y2x3aUxDQmNJbWx1YVhScFlXeGNJaWs3WEhKY2JpQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ2ZWeHlYRzU5T3lJc0ltMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1UydGxkR05vTzF4eVhHNWNjbHh1ZG1GeUlFSmliM2hVWlhoMElEMGdjbVZ4ZFdseVpTaGNJbkExTFdKaWIzZ3RZV3hwWjI1bFpDMTBaWGgwWENJcE8xeHlYRzUyWVhJZ1FtRnpaVXh2WjI5VGEyVjBZMmdnUFNCeVpYRjFhWEpsS0Z3aUxpOWlZWE5sTFd4dloyOHRjMnRsZEdOb0xtcHpYQ0lwTzF4eVhHNTJZWElnVTJsdVIyVnVaWEpoZEc5eUlEMGdjbVZ4ZFdseVpTaGNJaTR2WjJWdVpYSmhkRzl5Y3k5emFXNHRaMlZ1WlhKaGRHOXlMbXB6WENJcE8xeHlYRzVjY2x4dWRtRnlJSFYwYVd4eklEMGdjbVZ4ZFdseVpTaGNJaTR1TDNWMGFXeHBkR2xsY3k1cWMxd2lLVHRjY2x4dVhISmNibE5yWlhSamFDNXdjbTkwYjNSNWNHVWdQU0JQWW1wbFkzUXVZM0psWVhSbEtFSmhjMlZNYjJkdlUydGxkR05vTG5CeWIzUnZkSGx3WlNrN1hISmNibHh5WEc1bWRXNWpkR2x2YmlCVGEyVjBZMmdvSkc1aGRpd2dKRzVoZGt4dloyOHBJSHRjY2x4dUlDQWdJRUpoYzJWTWIyZHZVMnRsZEdOb0xtTmhiR3dvZEdocGN5d2dKRzVoZGl3Z0pHNWhka3h2WjI4c0lGd2lMaTR2Wm05dWRITXZZbWxuWDJwdmFHNHRkMlZpWm05dWRDNTBkR1pjSWlrN1hISmNibjFjY2x4dVhISmNibE5yWlhSamFDNXdjbTkwYjNSNWNHVXVYMjl1VW1WemFYcGxJRDBnWm5WdVkzUnBiMjRnS0hBcElIdGNjbHh1SUNBZ0lFSmhjMlZNYjJkdlUydGxkR05vTG5CeWIzUnZkSGx3WlM1ZmIyNVNaWE5wZW1VdVkyRnNiQ2gwYUdsekxDQndLVHRjY2x4dUlDQWdJSFJvYVhNdVgzTndZV05wYm1jZ1BTQjFkR2xzY3k1dFlYQW9kR2hwY3k1ZlptOXVkRk5wZW1Vc0lESXdMQ0EwTUN3Z01pd2dOU3dnZTJOc1lXMXdPaUIwY25WbExGeHlYRzRnSUNBZ0lDQWdJSEp2ZFc1a09pQjBjblZsZlNrN1hISmNiaUFnSUNBdkx5QlZjR1JoZEdVZ2RHaGxJR0ppYjNoVVpYaDBMQ0J3YkdGalpTQnZkbVZ5SUhSb1pTQnVZWFlnZEdWNGRDQnNiMmR2SUdGdVpDQjBhR1Z1SUhOb2FXWjBJR2wwYzF4eVhHNGdJQ0FnTHk4Z1lXNWphRzl5SUdKaFkyc2dkRzhnS0dObGJuUmxjaXdnWTJWdWRHVnlLU0IzYUdsc1pTQndjbVZ6WlhKMmFXNW5JSFJvWlNCMFpYaDBJSEJ2YzJsMGFXOXVYSEpjYmlBZ0lDQjBhR2x6TGw5aVltOTRWR1Y0ZEM1elpYUlVaWGgwS0hSb2FYTXVYM1JsZUhRcFhISmNiaUFnSUNBZ0lDQWdMbk5sZEZSbGVIUlRhWHBsS0hSb2FYTXVYMlp2Ym5SVGFYcGxLVnh5WEc0Z0lDQWdJQ0FnSUM1elpYUkJibU5vYjNJb1FtSnZlRlJsZUhRdVFVeEpSMDR1UWs5WVgweEZSbFFzSUVKaWIzaFVaWGgwTGtKQlUwVk1TVTVGTGtGTVVFaEJRa1ZVU1VNcFhISmNiaUFnSUNBZ0lDQWdMbk5sZEZCdmMybDBhVzl1S0hSb2FYTXVYM1JsZUhSUFptWnpaWFF1YkdWbWRDd2dkR2hwY3k1ZmRHVjRkRTltWm5ObGRDNTBiM0FwWEhKY2JpQWdJQ0FnSUNBZ0xuTmxkRUZ1WTJodmNpaENZbTk0VkdWNGRDNUJURWxIVGk1Q1QxaGZRMFZPVkVWU0xDQkNZbTk0VkdWNGRDNUNRVk5GVEVsT1JTNUNUMWhmUTBWT1ZFVlNMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBjblZsS1R0Y2NseHVJQ0FnSUhSb2FYTXVYMlJ5WVhkVGRHRjBhVzl1WVhKNVRHOW5ieWh3S1R0Y2NseHVJQ0FnSUhSb2FYTXVYM0J2YVc1MGN5QTlJSFJvYVhNdVgySmliM2hVWlhoMExtZGxkRlJsZUhSUWIybHVkSE1vS1R0Y2NseHVJQ0FnSUhSb2FYTXVYMmx6Um1seWMzUkdjbUZ0WlNBOUlIUnlkV1U3WEhKY2JuMDdYSEpjYmx4eVhHNVRhMlYwWTJndWNISnZkRzkwZVhCbExsOWtjbUYzVTNSaGRHbHZibUZ5ZVV4dloyOGdQU0JtZFc1amRHbHZiaUFvY0NrZ2UxeHlYRzRnSUNBZ2NDNWlZV05yWjNKdmRXNWtLREkxTlNrN1hISmNiaUFnSUNCd0xuTjBjbTlyWlNneU5UVXBPMXh5WEc0Z0lDQWdjQzVtYVd4c0tGd2lJekJCTURBd1FWd2lLVHRjY2x4dUlDQWdJSEF1YzNSeWIydGxWMlZwWjJoMEtESXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZlltSnZlRlJsZUhRdVpISmhkeWdwTzF4eVhHNTlPMXh5WEc1Y2NseHVVMnRsZEdOb0xuQnliM1J2ZEhsd1pTNWZjMlYwZFhBZ1BTQm1kVzVqZEdsdmJpQW9jQ2tnZTF4eVhHNGdJQ0FnUW1GelpVeHZaMjlUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDl6WlhSMWNDNWpZV3hzS0hSb2FYTXNJSEFwTzF4eVhHNWNjbHh1SUNBZ0lDOHZJRU55WldGMFpTQmhJRUppYjNoQmJHbG5ibVZrVkdWNGRDQnBibk4wWVc1alpTQjBhR0YwSUhkcGJHd2dZbVVnZFhObFpDQm1iM0lnWkhKaGQybHVaeUJoYm1SY2NseHVJQ0FnSUM4dklISnZkR0YwYVc1bklIUmxlSFJjY2x4dUlDQWdJSFJvYVhNdVgySmliM2hVWlhoMElEMGdibVYzSUVKaWIzaFVaWGgwS0hSb2FYTXVYMlp2Ym5Rc0lIUm9hWE11WDNSbGVIUXNJSFJvYVhNdVgyWnZiblJUYVhwbExDQXdMQ0F3TEZ4eVhHNGdJQ0FnSUNBZ0lIQXBPMXh5WEc1Y2NseHVJQ0FnSUM4dklFaGhibVJzWlNCMGFHVWdhVzVwZEdsaGJDQnpaWFIxY0NCaWVTQjBjbWxuWjJWeWFXNW5JR0VnY21WemFYcGxYSEpjYmlBZ0lDQjBhR2x6TGw5dmJsSmxjMmw2WlNod0tUdGNjbHh1WEhKY2JpQWdJQ0F2THlCRWNtRjNJSFJvWlNCemRHRjBhVzl1WVhKNUlHeHZaMjljY2x4dUlDQWdJSFJvYVhNdVgyUnlZWGRUZEdGMGFXOXVZWEo1VEc5bmJ5aHdLVHRjY2x4dVhISmNiaUFnSUNBdkx5QlRkR0Z5ZENCMGFHVWdjMmx1SUdkbGJtVnlZWFJ2Y2lCaGRDQnBkSE1nYldGNElIWmhiSFZsWEhKY2JpQWdJQ0IwYUdsekxsOTBhSEpsYzJodmJHUkhaVzVsY21GMGIzSWdQU0J1WlhjZ1UybHVSMlZ1WlhKaGRHOXlLSEFzSURBc0lERXNJREF1TURJc0lIQXVVRWt2TWlrN1hISmNibjA3WEhKY2JseHlYRzVUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDlrY21GM0lEMGdablZ1WTNScGIyNGdLSEFwSUh0Y2NseHVJQ0FnSUVKaGMyVk1iMmR2VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmWkhKaGR5NWpZV3hzS0hSb2FYTXNJSEFwTzF4eVhHNGdJQ0FnYVdZZ0tDRjBhR2x6TGw5cGMwMXZkWE5sVDNabGNpQjhmQ0FoZEdocGN5NWZhWE5QZG1WeVRtRjJURzluYnlrZ2NtVjBkWEp1TzF4eVhHNWNjbHh1SUNBZ0lDOHZJRmRvWlc0Z2RHaGxJSFJsZUhRZ2FYTWdZV0p2ZFhRZ2RHOGdZbVZqYjIxbElHRmpkR2wyWlNCbWIzSWdkR2hsSUdacGNuTjBJSFJwYldVc0lHTnNaV0Z5WEhKY2JpQWdJQ0F2THlCMGFHVWdjM1JoZEdsdmJtRnllU0JzYjJkdklIUm9ZWFFnZDJGeklIQnlaWFpwYjNWemJIa2daSEpoZDI0dVhISmNiaUFnSUNCcFppQW9kR2hwY3k1ZmFYTkdhWEp6ZEVaeVlXMWxLU0I3WEhKY2JpQWdJQ0FnSUNBZ2NDNWlZV05yWjNKdmRXNWtLREkxTlNrN1hISmNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmFYTkdhWEp6ZEVaeVlXMWxJRDBnWm1Gc2MyVTdYSEpjYmlBZ0lDQjlYSEpjYmx4eVhHNGdJQ0FnYVdZZ0tIUm9hWE11WDJadmJuUlRhWHBsSUQ0Z016QXBJSHRjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDkwYUhKbGMyaHZiR1JIWlc1bGNtRjBiM0l1YzJWMFFtOTFibVJ6S0RBdU1pQXFJSFJvYVhNdVgySmliM2hVWlhoMExtaGxhV2RvZEN4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnTUM0ME55QXFJSFJvYVhNdVgySmliM2hVWlhoMExtaGxhV2RvZENrN1hISmNiaUFnSUNCOUlHVnNjMlVnZTF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WDNSb2NtVnphRzlzWkVkbGJtVnlZWFJ2Y2k1elpYUkNiM1Z1WkhNb01DNHlJQ29nZEdocGN5NWZZbUp2ZUZSbGVIUXVhR1ZwWjJoMExGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBd0xqWWdLaUIwYUdsekxsOWlZbTk0VkdWNGRDNW9aV2xuYUhRcE8xeHlYRzRnSUNBZ2ZWeHlYRzRnSUNBZ2RtRnlJR1JwYzNSaGJtTmxWR2h5WlhOb2IyeGtJRDBnZEdocGN5NWZkR2h5WlhOb2IyeGtSMlZ1WlhKaGRHOXlMbWRsYm1WeVlYUmxLQ2s3WEhKY2JseHlYRzRnSUNBZ2NDNWlZV05yWjNKdmRXNWtLREkxTlN3Z01UQXdLVHRjY2x4dUlDQWdJSEF1YzNSeWIydGxWMlZwWjJoMEtERXBPMXh5WEc0Z0lDQWdabTl5SUNoMllYSWdhU0E5SURBN0lHa2dQQ0IwYUdsekxsOXdiMmx1ZEhNdWJHVnVaM1JvT3lCcElDczlJREVwSUh0Y2NseHVJQ0FnSUNBZ0lDQjJZWElnY0c5cGJuUXhJRDBnZEdocGN5NWZjRzlwYm5SelcybGRPMXh5WEc0Z0lDQWdJQ0FnSUdadmNpQW9kbUZ5SUdvZ1BTQnBJQ3NnTVRzZ2FpQThJSFJvYVhNdVgzQnZhVzUwY3k1c1pXNW5kR2c3SUdvZ0t6MGdNU2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2NHOXBiblF5SUQwZ2RHaHBjeTVmY0c5cGJuUnpXMnBkTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1pHbHpkQ0E5SUhBdVpHbHpkQ2h3YjJsdWRERXVlQ3dnY0c5cGJuUXhMbmtzSUhCdmFXNTBNaTU0TENCd2IybHVkREl1ZVNrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaGthWE4wSUR3Z1pHbHpkR0Z1WTJWVWFISmxjMmh2YkdRcElIdGNjbHh1WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCd0xtNXZVM1J5YjJ0bEtDazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J3TG1acGJHd29YQ0p5WjJKaEtERTJOU3dnTUN3Z01UY3pMQ0F3TGpJMUtWd2lLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhBdVpXeHNhWEJ6WlNnb2NHOXBiblF4TG5nZ0t5QndiMmx1ZERJdWVDa2dMeUF5TENBb2NHOXBiblF4TG5rZ0t5QndiMmx1ZERJdWVTa2dMeUF5TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1JwYzNRc0lHUnBjM1FwTzF4eVhHNWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEF1YzNSeWIydGxLRndpY21kaVlTZ3hOalVzSURBc0lERTNNeXdnTUM0eU5TbGNJaWs3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCd0xtNXZSbWxzYkNncE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjQzVzYVc1bEtIQnZhVzUwTVM1NExDQndiMmx1ZERFdWVTd2djRzlwYm5ReUxuZ3NJSEJ2YVc1ME1pNTVLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUgxY2NseHVmVHNpTENKdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUh0Y2NseHVJQ0FnSUU1dmFYTmxSMlZ1WlhKaGRHOXlNVVE2SUU1dmFYTmxSMlZ1WlhKaGRHOXlNVVFzWEhKY2JpQWdJQ0JPYjJselpVZGxibVZ5WVhSdmNqSkVPaUJPYjJselpVZGxibVZ5WVhSdmNqSkVYSEpjYm4wN1hISmNibHh5WEc1MllYSWdkWFJwYkhNZ1BTQnlaWEYxYVhKbEtGd2lMaTR2TGk0dmRYUnBiR2wwYVdWekxtcHpYQ0lwTzF4eVhHNWNjbHh1THk4Z0xTMGdNVVFnVG05cGMyVWdSMlZ1WlhKaGRHOXlJQzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzFjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJCSUhWMGFXeHBkSGtnWTJ4aGMzTWdabTl5SUdkbGJtVnlZWFJwYm1jZ2JtOXBjMlVnZG1Gc2RXVnpYSEpjYmlBcUlFQmpiMjV6ZEhKMVkzUnZjbHh5WEc0Z0tpQkFjR0Z5WVcwZ2UyOWlhbVZqZEgwZ2NDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUZKbFptVnlaVzVqWlNCMGJ5QmhJSEExSUhOclpYUmphRnh5WEc0Z0tpQkFjR0Z5WVcwZ2UyNTFiV0psY24wZ1cyMXBiajB3WFNBZ0lDQWdJQ0FnSUUxcGJtbHRkVzBnZG1Gc2RXVWdabTl5SUhSb1pTQnViMmx6WlZ4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXMjFoZUQweFhTQWdJQ0FnSUNBZ0lFMWhlR2x0ZFcwZ2RtRnNkV1VnWm05eUlIUm9aU0J1YjJselpWeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnVzJsdVkzSmxiV1Z1ZEQwd0xqRmRJRk5qWVd4bElHOW1JSFJvWlNCdWIybHpaU3dnZFhObFpDQjNhR1Z1SUhWd1pHRjBhVzVuWEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQmJiMlptYzJWMFBYSmhibVJ2YlYwZ1FTQjJZV3gxWlNCMWMyVmtJSFJ2SUdWdWMzVnlaU0J0ZFd4MGFYQnNaU0J1YjJselpWeHlYRzRnS2lBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2RsYm1WeVlYUnZjbk1nWVhKbElISmxkSFZ5Ym1sdVp5QmNJbWx1WkdWd1pXNWtaVzUwWENJZ2RtRnNkV1Z6WEhKY2JpQXFMMXh5WEc1bWRXNWpkR2x2YmlCT2IybHpaVWRsYm1WeVlYUnZjakZFS0hBc0lHMXBiaXdnYldGNExDQnBibU55WlcxbGJuUXNJRzltWm5ObGRDa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZmNDQTlJSEE3WEhKY2JpQWdJQ0IwYUdsekxsOXRhVzRnUFNCMWRHbHNjeTVrWldaaGRXeDBLRzFwYml3Z01DazdYSEpjYmlBZ0lDQjBhR2x6TGw5dFlYZ2dQU0IxZEdsc2N5NWtaV1poZFd4MEtHMWhlQ3dnTVNrN1hISmNiaUFnSUNCMGFHbHpMbDlwYm1OeVpXMWxiblFnUFNCMWRHbHNjeTVrWldaaGRXeDBLR2x1WTNKbGJXVnVkQ3dnTUM0eEtUdGNjbHh1SUNBZ0lIUm9hWE11WDNCdmMybDBhVzl1SUQwZ2RYUnBiSE11WkdWbVlYVnNkQ2h2Wm1aelpYUXNJSEF1Y21GdVpHOXRLQzB4TURBd01EQXdMQ0F4TURBd01EQXdLU2s3WEhKY2JuMWNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlZjR1JoZEdVZ2RHaGxJRzFwYmlCaGJtUWdiV0Y0SUc1dmFYTmxJSFpoYkhWbGMxeHlYRzRnS2lCQWNHRnlZVzBnSUh0dWRXMWlaWEo5SUcxcGJpQk5hVzVwYlhWdElHNXZhWE5sSUhaaGJIVmxYSEpjYmlBcUlFQndZWEpoYlNBZ2UyNTFiV0psY24wZ2JXRjRJRTFoZUdsdGRXMGdibTlwYzJVZ2RtRnNkV1ZjY2x4dUlDb3ZYSEpjYms1dmFYTmxSMlZ1WlhKaGRHOXlNVVF1Y0hKdmRHOTBlWEJsTG5ObGRFSnZkVzVrY3lBOUlHWjFibU4wYVc5dUlDaHRhVzRzSUcxaGVDa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZmJXbHVJRDBnZFhScGJITXVaR1ZtWVhWc2RDaHRhVzRzSUhSb2FYTXVYMjFwYmlrN1hISmNiaUFnSUNCMGFHbHpMbDl0WVhnZ1BTQjFkR2xzY3k1a1pXWmhkV3gwS0cxaGVDd2dkR2hwY3k1ZmJXRjRLVHRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlZjR1JoZEdVZ2RHaGxJRzV2YVhObElHbHVZM0psYldWdWRDQW9aUzVuTGlCelkyRnNaU2xjY2x4dUlDb2dRSEJoY21GdElDQjdiblZ0WW1WeWZTQnBibU55WlcxbGJuUWdUbVYzSUdsdVkzSmxiV1Z1ZENBb2MyTmhiR1VwSUhaaGJIVmxYSEpjYmlBcUwxeHlYRzVPYjJselpVZGxibVZ5WVhSdmNqRkVMbkJ5YjNSdmRIbHdaUzV6WlhSSmJtTnlaVzFsYm5RZ1BTQm1kVzVqZEdsdmJpQW9hVzVqY21WdFpXNTBLU0I3WEhKY2JpQWdJQ0IwYUdsekxsOXBibU55WlcxbGJuUWdQU0IxZEdsc2N5NWtaV1poZFd4MEtHbHVZM0psYldWdWRDd2dkR2hwY3k1ZmFXNWpjbVZ0Wlc1MEtUdGNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtpQmNjbHh1SUNvZ1IyVnVaWEpoZEdVZ2RHaGxJRzVsZUhRZ2JtOXBjMlVnZG1Gc2RXVmNjbHh1SUNvZ1FISmxkSFZ5YmlCN2JuVnRZbVZ5ZlNCQklHNXZhWE41SUhaaGJIVmxJR0psZEhkbFpXNGdiMkpxWldOMEozTWdiV2x1SUdGdVpDQnRZWGhjY2x4dUlDb3ZYSEpjYms1dmFYTmxSMlZ1WlhKaGRHOXlNVVF1Y0hKdmRHOTBlWEJsTG1kbGJtVnlZWFJsSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZmRYQmtZWFJsS0NrN1hISmNiaUFnSUNCMllYSWdiaUE5SUhSb2FYTXVYM0F1Ym05cGMyVW9kR2hwY3k1ZmNHOXphWFJwYjI0cE8xeHlYRzRnSUNBZ2JpQTlJSFJvYVhNdVgzQXViV0Z3S0c0c0lEQXNJREVzSUhSb2FYTXVYMjFwYml3Z2RHaHBjeTVmYldGNEtUdGNjbHh1SUNBZ0lISmxkSFZ5YmlCdU8xeHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUVsdWRHVnlibUZzSUhWd1pHRjBaU0J0WlhSb2IyUWdabTl5SUdkbGJtVnlZWFJwYm1jZ2JtVjRkQ0J1YjJselpTQjJZV3gxWlZ4eVhHNGdLaUJBY0hKcGRtRjBaVnh5WEc0Z0tpOWNjbHh1VG05cGMyVkhaVzVsY21GMGIzSXhSQzV3Y205MGIzUjVjR1V1WDNWd1pHRjBaU0E5SUdaMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lIUm9hWE11WDNCdmMybDBhVzl1SUNzOUlIUm9hWE11WDJsdVkzSmxiV1Z1ZER0Y2NseHVmVHRjY2x4dVhISmNibHh5WEc0dkx5QXRMU0F5UkNCT2IybHpaU0JIWlc1bGNtRjBiM0lnTFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFZ4eVhHNWNjbHh1Wm5WdVkzUnBiMjRnVG05cGMyVkhaVzVsY21GMGIzSXlSQ2h3TENCNFRXbHVMQ0I0VFdGNExDQjVUV2x1TENCNVRXRjRMQ0I0U1c1amNtVnRaVzUwTENCNVNXNWpjbVZ0Wlc1MExDQmNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I0VDJabWMyVjBMQ0I1VDJabWMyVjBLU0I3WEhKY2JpQWdJQ0IwYUdsekxsOTRUbTlwYzJVZ1BTQnVaWGNnVG05cGMyVkhaVzVsY21GMGIzSXhSQ2h3TENCNFRXbHVMQ0I0VFdGNExDQjRTVzVqY21WdFpXNTBMQ0I0VDJabWMyVjBLVHRjY2x4dUlDQWdJSFJvYVhNdVgzbE9iMmx6WlNBOUlHNWxkeUJPYjJselpVZGxibVZ5WVhSdmNqRkVLSEFzSUhsTmFXNHNJSGxOWVhnc0lIbEpibU55WlcxbGJuUXNJSGxQWm1aelpYUXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZmNDQTlJSEE3WEhKY2JuMWNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlZjR1JoZEdVZ2RHaGxJRzFwYmlCaGJtUWdiV0Y0SUc1dmFYTmxJSFpoYkhWbGMxeHlYRzRnS2lCQWNHRnlZVzBnSUh0dlltcGxZM1I5SUc5d2RHbHZibk1nVDJKcVpXTjBJSGRwZEdnZ1ltOTFibVJ6SUhSdklHSmxJSFZ3WkdGMFpXUWdaUzVuTGlCY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSHNnZUUxcGJqb2dNQ3dnZUUxaGVEb2dNU3dnZVUxcGJqb2dMVEVzSUhsTllYZzZJREVnZlZ4eVhHNGdLaTljY2x4dVRtOXBjMlZIWlc1bGNtRjBiM0l5UkM1d2NtOTBiM1I1Y0dVdWMyVjBRbTkxYm1SeklEMGdablZ1WTNScGIyNGdLRzl3ZEdsdmJuTXBJSHRjY2x4dUlDQWdJR2xtSUNnaGIzQjBhVzl1Y3lrZ2NtVjBkWEp1T3lBZ1hISmNiaUFnSUNCMGFHbHpMbDk0VG05cGMyVXVjMlYwUW05MWJtUnpLRzl3ZEdsdmJuTXVlRTFwYml3Z2IzQjBhVzl1Y3k1NFRXRjRLVHRjY2x4dUlDQWdJSFJvYVhNdVgzbE9iMmx6WlM1elpYUkNiM1Z1WkhNb2IzQjBhVzl1Y3k1NVRXbHVMQ0J2Y0hScGIyNXpMbmxOWVhncE8xeHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUZWd1pHRjBaU0IwYUdVZ2FXNWpjbVZ0Wlc1MElDaGxMbWN1SUhOallXeGxLU0JtYjNJZ2RHaGxJRzV2YVhObElHZGxibVZ5WVhSdmNseHlYRzRnS2lCQWNHRnlZVzBnSUh0dlltcGxZM1I5SUc5d2RHbHZibk1nVDJKcVpXTjBJSGRwZEdnZ1ltOTFibVJ6SUhSdklHSmxJSFZ3WkdGMFpXUWdaUzVuTGlCY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSHNnZUVsdVkzSmxiV1Z1ZERvZ01DNHdOU3dnZVVsdVkzSmxiV1Z1ZERvZ01DNHhJSDFjY2x4dUlDb3ZYSEpjYms1dmFYTmxSMlZ1WlhKaGRHOXlNa1F1Y0hKdmRHOTBlWEJsTG5ObGRFSnZkVzVrY3lBOUlHWjFibU4wYVc5dUlDaHZjSFJwYjI1ektTQjdYSEpjYmlBZ0lDQnBaaUFvSVc5d2RHbHZibk1wSUhKbGRIVnlianRjY2x4dUlDQWdJSFJvYVhNdVgzaE9iMmx6WlM1elpYUkNiM1Z1WkhNb2IzQjBhVzl1Y3k1NFNXNWpjbVZ0Wlc1MEtUdGNjbHh1SUNBZ0lIUm9hWE11WDNsT2IybHpaUzV6WlhSQ2IzVnVaSE1vYjNCMGFXOXVjeTU1U1c1amNtVnRaVzUwS1R0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJIWlc1bGNtRjBaU0IwYUdVZ2JtVjRkQ0J3WVdseUlHOW1JRzV2YVhObElIWmhiSFZsYzF4eVhHNGdLaUJBY21WMGRYSnVJSHR2WW1wbFkzUjlJRTlpYW1WamRDQjNhWFJvSUhnZ1lXNWtJSGtnY0hKdmNHVnlkR2xsY3lCMGFHRjBJR052Ym5SaGFXNGdkR2hsSUc1bGVIUWdibTlwYzJWY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVd4MVpYTWdZV3h2Ym1jZ1pXRmphQ0JrYVcxbGJuTnBiMjVjY2x4dUlDb3ZYSEpjYms1dmFYTmxSMlZ1WlhKaGRHOXlNa1F1Y0hKdmRHOTBlWEJsTG1kbGJtVnlZWFJsSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdjbVYwZFhKdUlIdGNjbHh1SUNBZ0lDQWdJQ0I0T2lCMGFHbHpMbDk0VG05cGMyVXVaMlZ1WlhKaGRHVW9LU3hjY2x4dUlDQWdJQ0FnSUNCNU9pQjBhR2x6TGw5NVRtOXBjMlV1WjJWdVpYSmhkR1VvS1Z4eVhHNGdJQ0FnZlR0Y2NseHVmVHNpTENKdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUZOcGJrZGxibVZ5WVhSdmNqdGNjbHh1WEhKY2JuWmhjaUIxZEdsc2N5QTlJSEpsY1hWcGNtVW9YQ0l1TGk4dUxpOTFkR2xzYVhScFpYTXVhbk5jSWlrN1hISmNibHh5WEc0dktpcGNjbHh1SUNvZ1FTQjFkR2xzYVhSNUlHTnNZWE56SUdadmNpQm5aVzVsY21GMGFXNW5JSFpoYkhWbGN5QmhiRzl1WnlCaElITnBibmRoZG1WY2NseHVJQ29nUUdOdmJuTjBjblZqZEc5eVhISmNiaUFxSUVCd1lYSmhiU0I3YjJKcVpXTjBmU0J3SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdVbVZtWlhKbGJtTmxJSFJ2SUdFZ2NEVWdjMnRsZEdOb1hISmNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0JiYldsdVBUQmRJQ0FnSUNBZ0lDQWdUV2x1YVcxMWJTQjJZV3gxWlNCbWIzSWdkR2hsSUc1dmFYTmxYSEpjYmlBcUlFQndZWEpoYlNCN2JuVnRZbVZ5ZlNCYmJXRjRQVEZkSUNBZ0lDQWdJQ0FnVFdGNGFXMTFiU0IyWVd4MVpTQm1iM0lnZEdobElHNXZhWE5sWEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQmJhVzVqY21WdFpXNTBQVEF1TVYwZ1NXNWpjbVZ0Wlc1MElIVnpaV1FnZDJobGJpQjFjR1JoZEdsdVoxeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnVzI5bVpuTmxkRDF5WVc1a2IyMWRJRmRvWlhKbElIUnZJSE4wWVhKMElHRnNiMjVuSUhSb1pTQnphVzVsZDJGMlpWeHlYRzRnS2k5Y2NseHVablZ1WTNScGIyNGdVMmx1UjJWdVpYSmhkRzl5S0hBc0lHMXBiaXdnYldGNExDQmhibWRzWlVsdVkzSmxiV1Z1ZEN3Z2MzUmhjblJwYm1kQmJtZHNaU2tnZTF4eVhHNGdJQ0FnZEdocGN5NWZjQ0E5SUhBN1hISmNiaUFnSUNCMGFHbHpMbDl0YVc0Z1BTQjFkR2xzY3k1a1pXWmhkV3gwS0cxcGJpd2dNQ2s3WEhKY2JpQWdJQ0IwYUdsekxsOXRZWGdnUFNCMWRHbHNjeTVrWldaaGRXeDBLRzFoZUN3Z01DazdYSEpjYmlBZ0lDQjBhR2x6TGw5cGJtTnlaVzFsYm5RZ1BTQjFkR2xzY3k1a1pXWmhkV3gwS0dGdVoyeGxTVzVqY21WdFpXNTBMQ0F3TGpFcE8xeHlYRzRnSUNBZ2RHaHBjeTVmWVc1bmJHVWdQU0IxZEdsc2N5NWtaV1poZFd4MEtITjBZWEowYVc1blFXNW5iR1VzSUhBdWNtRnVaRzl0S0MweE1EQXdNREF3TENBeE1EQXdNREF3S1NrN1hISmNibjFjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJWY0dSaGRHVWdkR2hsSUcxcGJpQmhibVFnYldGNElIWmhiSFZsYzF4eVhHNGdLaUJBY0dGeVlXMGdJSHR1ZFcxaVpYSjlJRzFwYmlCTmFXNXBiWFZ0SUhaaGJIVmxYSEpjYmlBcUlFQndZWEpoYlNBZ2UyNTFiV0psY24wZ2JXRjRJRTFoZUdsdGRXMGdkbUZzZFdWY2NseHVJQ292WEhKY2JsTnBia2RsYm1WeVlYUnZjaTV3Y205MGIzUjVjR1V1YzJWMFFtOTFibVJ6SUQwZ1puVnVZM1JwYjI0Z0tHMXBiaXdnYldGNEtTQjdYSEpjYmlBZ0lDQjBhR2x6TGw5dGFXNGdQU0IxZEdsc2N5NWtaV1poZFd4MEtHMXBiaXdnZEdocGN5NWZiV2x1S1R0Y2NseHVJQ0FnSUhSb2FYTXVYMjFoZUNBOUlIVjBhV3h6TG1SbFptRjFiSFFvYldGNExDQjBhR2x6TGw5dFlYZ3BPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlGVndaR0YwWlNCMGFHVWdZVzVuYkdVZ2FXNWpjbVZ0Wlc1MElDaGxMbWN1SUdodmR5Qm1ZWE4wSUhkbElHMXZkbVVnZEdoeWIzVm5hQ0IwYUdVZ2MybHVkMkYyWlNsY2NseHVJQ29nUUhCaGNtRnRJQ0I3Ym5WdFltVnlmU0JwYm1OeVpXMWxiblFnVG1WM0lHbHVZM0psYldWdWRDQjJZV3gxWlZ4eVhHNGdLaTljY2x4dVUybHVSMlZ1WlhKaGRHOXlMbkJ5YjNSdmRIbHdaUzV6WlhSSmJtTnlaVzFsYm5RZ1BTQm1kVzVqZEdsdmJpQW9hVzVqY21WdFpXNTBLU0I3WEhKY2JpQWdJQ0IwYUdsekxsOXBibU55WlcxbGJuUWdQU0IxZEdsc2N5NWtaV1poZFd4MEtHbHVZM0psYldWdWRDd2dkR2hwY3k1ZmFXNWpjbVZ0Wlc1MEtUdGNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtpQmNjbHh1SUNvZ1IyVnVaWEpoZEdVZ2RHaGxJRzVsZUhRZ2RtRnNkV1ZjY2x4dUlDb2dRSEpsZEhWeWJpQjdiblZ0WW1WeWZTQkJJSFpoYkhWbElHSmxkSGRsWlc0Z1oyVnVaWEpoZEc5eWN5ZHpJRzFwYmlCaGJtUWdiV0Y0WEhKY2JpQXFMMXh5WEc1VGFXNUhaVzVsY21GMGIzSXVjSEp2ZEc5MGVYQmxMbWRsYm1WeVlYUmxJRDBnWm5WdVkzUnBiMjRnS0NrZ2UxeHlYRzRnSUNBZ2RHaHBjeTVmZFhCa1lYUmxLQ2s3WEhKY2JpQWdJQ0IyWVhJZ2JpQTlJSFJvYVhNdVgzQXVjMmx1S0hSb2FYTXVYMkZ1WjJ4bEtUdGNjbHh1SUNBZ0lHNGdQU0IwYUdsekxsOXdMbTFoY0NodUxDQXRNU3dnTVN3Z2RHaHBjeTVmYldsdUxDQjBhR2x6TGw5dFlYZ3BPMXh5WEc0Z0lDQWdjbVYwZFhKdUlHNDdYSEpjYm4wN1hISmNibHh5WEc0dktpcGNjbHh1SUNvZ1NXNTBaWEp1WVd3Z2RYQmtZWFJsSUcxbGRHaHZaQ0JtYjNJZ1oyVnVaWEpoZEdsdVp5QnVaWGgwSUhaaGJIVmxYSEpjYmlBcUlFQndjbWwyWVhSbFhISmNiaUFxTDF4eVhHNVRhVzVIWlc1bGNtRjBiM0l1Y0hKdmRHOTBlWEJsTGw5MWNHUmhkR1VnUFNCbWRXNWpkR2x2YmlBb0tTQjdYSEpjYmlBZ0lDQjBhR2x6TGw5aGJtZHNaU0FyUFNCMGFHbHpMbDlwYm1OeVpXMWxiblE3WEhKY2JuMDdJaXdpYlc5a2RXeGxMbVY0Y0c5eWRITWdQU0JUYTJWMFkyZzdYSEpjYmx4eVhHNTJZWElnUW1KdmVGUmxlSFFnUFNCeVpYRjFhWEpsS0Z3aWNEVXRZbUp2ZUMxaGJHbG5ibVZrTFhSbGVIUmNJaWs3WEhKY2JuWmhjaUJDWVhObFRHOW5iMU5yWlhSamFDQTlJSEpsY1hWcGNtVW9YQ0l1TDJKaGMyVXRiRzluYnkxemEyVjBZMmd1YW5OY0lpazdYSEpjYmx4eVhHNTJZWElnZFhScGJITWdQU0J5WlhGMWFYSmxLRndpTGk0dmRYUnBiR2wwYVdWekxtcHpYQ0lwTzF4eVhHNWNjbHh1VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaU0E5SUU5aWFtVmpkQzVqY21WaGRHVW9RbUZ6WlV4dloyOVRhMlYwWTJndWNISnZkRzkwZVhCbEtUdGNjbHh1WEhKY2JtWjFibU4wYVc5dUlGTnJaWFJqYUNna2JtRjJMQ0FrYm1GMlRHOW5ieWtnZTF4eVhHNGdJQ0FnUW1GelpVeHZaMjlUYTJWMFkyZ3VZMkZzYkNoMGFHbHpMQ0FrYm1GMkxDQWtibUYyVEc5bmJ5d2dYQ0l1TGk5bWIyNTBjeTlpYVdkZmFtOW9iaTEzWldKbWIyNTBMblIwWmx3aUtUdGNjbHh1ZlZ4eVhHNWNjbHh1VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmYjI1U1pYTnBlbVVnUFNCbWRXNWpkR2x2YmlBb2NDa2dlMXh5WEc0Z0lDQWdRbUZ6WlV4dloyOVRhMlYwWTJndWNISnZkRzkwZVhCbExsOXZibEpsYzJsNlpTNWpZV3hzS0hSb2FYTXNJSEFwTzF4eVhHNGdJQ0FnZEdocGN5NWZjM0JoWTJsdVp5QTlJSFYwYVd4ekxtMWhjQ2gwYUdsekxsOW1iMjUwVTJsNlpTd2dNakFzSURRd0xDQXlMQ0ExTENCN1kyeGhiWEE2SUhSeWRXVXNJRnh5WEc0Z0lDQWdJQ0FnSUhKdmRXNWtPaUIwY25WbGZTazdYSEpjYmlBZ0lDQXZMeUJWY0dSaGRHVWdkR2hsSUdKaWIzaFVaWGgwTENCd2JHRmpaU0J2ZG1WeUlIUm9aU0J1WVhZZ2RHVjRkQ0JzYjJkdklHRnVaQ0IwYUdWdUlITm9hV1owSUdsMGN5QmNjbHh1SUNBZ0lDOHZJR0Z1WTJodmNpQmlZV05ySUhSdklDaGpaVzUwWlhJc0lHTmxiblJsY2lrZ2QyaHBiR1VnY0hKbGMyVnlkbWx1WnlCMGFHVWdkR1Y0ZENCd2IzTnBkR2x2Ymx4eVhHNGdJQ0FnZEdocGN5NWZZbUp2ZUZSbGVIUXVjMlYwVkdWNGRDaDBhR2x6TGw5MFpYaDBLVnh5WEc0Z0lDQWdJQ0FnSUM1elpYUlVaWGgwVTJsNlpTaDBhR2x6TGw5bWIyNTBVMmw2WlNsY2NseHVJQ0FnSUNBZ0lDQXVjMlYwUVc1amFHOXlLRUppYjNoVVpYaDBMa0ZNU1VkT0xrSlBXRjlNUlVaVUxDQkNZbTk0VkdWNGRDNUNRVk5GVEVsT1JTNUJURkJJUVVKRlZFbERLVnh5WEc0Z0lDQWdJQ0FnSUM1elpYUlFiM05wZEdsdmJpaDBhR2x6TGw5MFpYaDBUMlptYzJWMExteGxablFzSUhSb2FYTXVYM1JsZUhSUFptWnpaWFF1ZEc5d0tWeHlYRzRnSUNBZ0lDQWdJQzV6WlhSQmJtTm9iM0lvUW1KdmVGUmxlSFF1UVV4SlIwNHVRazlZWDBORlRsUkZVaXdnUW1KdmVGUmxlSFF1UWtGVFJVeEpUa1V1UWs5WVgwTkZUbFJGVWl3Z1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhSeWRXVXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZlpISmhkMU4wWVhScGIyNWhjbmxNYjJkdktIQXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZlkyRnNZM1ZzWVhSbFEybHlZMnhsY3lod0tUdGNjbHh1SUNBZ0lIUm9hWE11WDJselJtbHljM1JHY21GdFpTQTlJSFJ5ZFdVN1hISmNibjA3WEhKY2JseHlYRzVUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDlrY21GM1UzUmhkR2x2Ym1GeWVVeHZaMjhnUFNCbWRXNWpkR2x2YmlBb2NDa2dlMXh5WEc0Z0lDQWdjQzVpWVdOclozSnZkVzVrS0RJMU5TazdYSEpjYmlBZ0lDQndMbk4wY205clpTZ3lOVFVwTzF4eVhHNGdJQ0FnY0M1bWFXeHNLRndpSXpCQk1EQXdRVndpS1R0Y2NseHVJQ0FnSUhBdWMzUnliMnRsVjJWcFoyaDBLRElwTzF4eVhHNGdJQ0FnZEdocGN5NWZZbUp2ZUZSbGVIUXVaSEpoZHlncE8xeHlYRzU5TzF4eVhHNWNjbHh1VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmYzJWMGRYQWdQU0JtZFc1amRHbHZiaUFvY0NrZ2UxeHlYRzRnSUNBZ1FtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5elpYUjFjQzVqWVd4c0tIUm9hWE1zSUhBcE8xeHlYRzVjY2x4dUlDQWdJQzh2SUVOeVpXRjBaU0JoSUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQ0JwYm5OMFlXNWpaU0IwYUdGMElIZHBiR3dnWW1VZ2RYTmxaQ0JtYjNJZ1pISmhkMmx1WnlCaGJtUWdYSEpjYmlBZ0lDQXZMeUJ5YjNSaGRHbHVaeUIwWlhoMFhISmNiaUFnSUNCMGFHbHpMbDlpWW05NFZHVjRkQ0E5SUc1bGR5QkNZbTk0VkdWNGRDaDBhR2x6TGw5bWIyNTBMQ0IwYUdsekxsOTBaWGgwTENCMGFHbHpMbDltYjI1MFUybDZaU3dnTUN3Z01Dd2dYSEpjYmlBZ0lDQWdJQ0FnY0NrN1hISmNibHh5WEc0Z0lDQWdMeThnU0dGdVpHeGxJSFJvWlNCcGJtbDBhV0ZzSUhObGRIVndJR0o1SUhSeWFXZG5aWEpwYm1jZ1lTQnlaWE5wZW1WY2NseHVJQ0FnSUhSb2FYTXVYMjl1VW1WemFYcGxLSEFwTzF4eVhHNWNjbHh1SUNBZ0lDOHZJRVJ5WVhjZ2RHaGxJSE4wWVhScGIyNWhjbmtnYkc5bmIxeHlYRzRnSUNBZ2RHaHBjeTVmWkhKaGQxTjBZWFJwYjI1aGNubE1iMmR2S0hBcE8xeHlYRzVjY2x4dUlDQWdJSFJvYVhNdVgyTmhiR04xYkdGMFpVTnBjbU5zWlhNb2NDazdYSEpjYm4wN1hISmNibHh5WEc1VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5allXeGpkV3hoZEdWRGFYSmpiR1Z6SUQwZ1puVnVZM1JwYjI0Z0tIQXBJSHRjY2x4dUlDQWdJQzh2SUZSUFJFODZJRVJ2YmlkMElHNWxaV1FnUVV4TUlIUm9aU0J3YVhobGJITXVJRlJvYVhNZ1kyOTFiR1FnYUdGMlpTQmhiaUJ2Wm1aelkzSmxaVzRnY21WdVpHVnlaWEpjY2x4dUlDQWdJQzh2SUhSb1lYUWdhWE1nYW5WemRDQmlhV2NnWlc1dmRXZG9JSFJ2SUdacGRDQjBhR1VnZEdWNGRDNWNjbHh1SUNBZ0lDOHZJRXh2YjNBZ2IzWmxjaUIwYUdVZ2NHbDRaV3h6SUdsdUlIUm9aU0IwWlhoMEozTWdZbTkxYm1ScGJtY2dZbTk0SUhSdklITmhiWEJzWlNCMGFHVWdkMjl5WkZ4eVhHNGdJQ0FnZG1GeUlHSmliM2dnUFNCMGFHbHpMbDlpWW05NFZHVjRkQzVuWlhSQ1ltOTRLQ2s3WEhKY2JpQWdJQ0IyWVhJZ2MzUmhjblJZSUQwZ1RXRjBhQzVtYkc5dmNpaE5ZWFJvTG0xaGVDaGlZbTk0TG5nZ0xTQTFMQ0F3S1NrN1hISmNiaUFnSUNCMllYSWdaVzVrV0NBOUlFMWhkR2d1WTJWcGJDaE5ZWFJvTG0xcGJpaGlZbTk0TG5nZ0t5QmlZbTk0TG5jZ0t5QTFMQ0J3TG5kcFpIUm9LU2s3WEhKY2JpQWdJQ0IyWVhJZ2MzUmhjblJaSUQwZ1RXRjBhQzVtYkc5dmNpaE5ZWFJvTG0xaGVDaGlZbTk0TG5rZ0xTQTFMQ0F3S1NrN1hISmNiaUFnSUNCMllYSWdaVzVrV1NBOUlFMWhkR2d1WTJWcGJDaE5ZWFJvTG0xcGJpaGlZbTk0TG5rZ0t5QmlZbTk0TG1nZ0t5QTFMQ0J3TG1obGFXZG9kQ2twTzF4eVhHNGdJQ0FnY0M1c2IyRmtVR2w0Wld4ektDazdYSEpjYmlBZ0lDQndMbkJwZUdWc1JHVnVjMmwwZVNneEtUdGNjbHh1SUNBZ0lIUm9hWE11WDJOcGNtTnNaWE1nUFNCYlhUdGNjbHh1SUNBZ0lHWnZjaUFvZG1GeUlIa2dQU0J6ZEdGeWRGazdJSGtnUENCbGJtUlpPeUI1SUNzOUlIUm9hWE11WDNOd1lXTnBibWNwSUh0Y2NseHVJQ0FnSUNBZ0lDQm1iM0lnS0haaGNpQjRJRDBnYzNSaGNuUllPeUI0SUR3Z1pXNWtXRHNnZUNBclBTQjBhR2x6TGw5emNHRmphVzVuS1NCN0lDQmNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR2tnUFNBMElDb2dLQ2g1SUNvZ2NDNTNhV1IwYUNrZ0t5QjRLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUhJZ1BTQndMbkJwZUdWc2MxdHBYVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdjZ1BTQndMbkJwZUdWc2MxdHBJQ3NnTVYwN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQmlJRDBnY0M1d2FYaGxiSE5iYVNBcklESmRPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnWVNBOUlIQXVjR2w0Wld4elcya2dLeUF6WFR0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHTWdQU0J3TG1OdmJHOXlLSElzSUdjc0lHSXNJR0VwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2NDNXpZWFIxY21GMGFXOXVLR01wSUQ0Z01Da2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZZMmx5WTJ4bGN5NXdkWE5vS0h0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I0T2lCNElDc2djQzV5WVc1a2IyMG9MVEl2TXlBcUlIUm9hWE11WDNOd1lXTnBibWNzSURJdk15QXFJSFJvYVhNdVgzTndZV05wYm1jcExGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhrNklIa2dLeUJ3TG5KaGJtUnZiU2d0TWk4eklDb2dkR2hwY3k1ZmMzQmhZMmx1Wnl3Z01pOHpJQ29nZEdocGN5NWZjM0JoWTJsdVp5a3NYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyOXNiM0k2SUhBdVkyOXNiM0lvWENJak1EWkdSa1pHWENJcFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYMk5wY21Oc1pYTXVjSFZ6YUNoN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZURvZ2VDQXJJSEF1Y21GdVpHOXRLQzB5THpNZ0tpQjBhR2x6TGw5emNHRmphVzVuTENBeUx6TWdLaUIwYUdsekxsOXpjR0ZqYVc1bktTeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCNU9pQjVJQ3NnY0M1eVlXNWtiMjBvTFRJdk15QXFJSFJvYVhNdVgzTndZV05wYm1jc0lESXZNeUFxSUhSb2FYTXVYM053WVdOcGJtY3BMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTnZiRzl5T2lCd0xtTnZiRzl5S0Z3aUkwWkZNREJHUlZ3aUtWeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDlqYVhKamJHVnpMbkIxYzJnb2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhnNklIZ2dLeUJ3TG5KaGJtUnZiU2d0TWk4eklDb2dkR2hwY3k1ZmMzQmhZMmx1Wnl3Z01pOHpJQ29nZEdocGN5NWZjM0JoWTJsdVp5a3NYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2VUb2dlU0FySUhBdWNtRnVaRzl0S0MweUx6TWdLaUIwYUdsekxsOXpjR0ZqYVc1bkxDQXlMek1nS2lCMGFHbHpMbDl6Y0dGamFXNW5LU3hjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpiMnh2Y2pvZ2NDNWpiMnh2Y2loY0lpTkdSa1pHTURSY0lpbGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEhKY2JpQWdJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ2ZWeHlYRzU5TzF4eVhHNWNjbHh1VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmWkhKaGR5QTlJR1oxYm1OMGFXOXVJQ2h3S1NCN1hISmNiaUFnSUNCQ1lYTmxURzluYjFOclpYUmphQzV3Y205MGIzUjVjR1V1WDJSeVlYY3VZMkZzYkNoMGFHbHpMQ0J3S1R0Y2NseHVJQ0FnSUdsbUlDZ2hkR2hwY3k1ZmFYTk5iM1Z6WlU5MlpYSWdmSHdnSVhSb2FYTXVYMmx6VDNabGNrNWhka3h2WjI4cElISmxkSFZ5Ymp0Y2NseHVYSEpjYmlBZ0lDQXZMeUJYYUdWdUlIUm9aU0IwWlhoMElHbHpJR0ZpYjNWMElIUnZJR0psWTI5dFpTQmhZM1JwZG1VZ1ptOXlJSFJvWlNCbWFYSnpkQ0IwYVcxbExDQmpiR1ZoY2x4eVhHNGdJQ0FnTHk4Z2RHaGxJSE4wWVhScGIyNWhjbmtnYkc5bmJ5QjBhR0YwSUhkaGN5QndjbVYyYVc5MWMyeDVJR1J5WVhkdUxpQmNjbHh1SUNBZ0lHbG1JQ2gwYUdsekxsOXBjMFpwY25OMFJuSmhiV1VwSUh0Y2NseHVJQ0FnSUNBZ0lDQndMbUpoWTJ0bmNtOTFibVFvTWpVMUtUdGNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOXBjMFpwY25OMFJuSmhiV1VnUFNCbVlXeHpaVHRjY2x4dUlDQWdJSDFjY2x4dVhISmNiaUFnSUNBdkx5QkRiR1ZoY2x4eVhHNGdJQ0FnY0M1aWJHVnVaRTF2WkdVb2NDNUNURVZPUkNrN1hISmNiaUFnSUNCd0xtSmhZMnRuY205MWJtUW9NalUxS1R0Y2NseHVYSEpjYmlBZ0lDQXZMeUJFY21GM0lGd2lhR0ZzWm5SdmJtVmNJaUJzYjJkdlhISmNiaUFnSUNCd0xtNXZVM1J5YjJ0bEtDazdJQ0FnWEhKY2JpQWdJQ0J3TG1Kc1pXNWtUVzlrWlNod0xrMVZURlJKVUV4WktUdGNjbHh1WEhKY2JpQWdJQ0IyWVhJZ2JXRjRSR2x6ZENBOUlIUm9hWE11WDJKaWIzaFVaWGgwTG1oaGJHWlhhV1IwYUR0Y2NseHVJQ0FnSUhaaGNpQnRZWGhTWVdScGRYTWdQU0F5SUNvZ2RHaHBjeTVmYzNCaFkybHVaenRjY2x4dVhISmNiaUFnSUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElIUm9hWE11WDJOcGNtTnNaWE11YkdWdVozUm9PeUJwSUNzOUlERXBJSHRjY2x4dUlDQWdJQ0FnSUNCMllYSWdZMmx5WTJ4bElEMGdkR2hwY3k1ZlkybHlZMnhsYzF0cFhUdGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ1l5QTlJR05wY21Oc1pTNWpiMnh2Y2p0Y2NseHVJQ0FnSUNBZ0lDQjJZWElnWkdsemRDQTlJSEF1WkdsemRDaGphWEpqYkdVdWVDd2dZMmx5WTJ4bExua3NJSEF1Ylc5MWMyVllMQ0J3TG0xdmRYTmxXU2s3WEhKY2JpQWdJQ0FnSUNBZ2RtRnlJSEpoWkdsMWN5QTlJSFYwYVd4ekxtMWhjQ2hrYVhOMExDQXdMQ0J0WVhoRWFYTjBMQ0F4TENCdFlYaFNZV1JwZFhNc0lIdGpiR0Z0Y0RvZ2RISjFaWDBwTzF4eVhHNGdJQ0FnSUNBZ0lIQXVabWxzYkNoaktUdGNjbHh1SUNBZ0lDQWdJQ0J3TG1Wc2JHbHdjMlVvWTJseVkyeGxMbmdzSUdOcGNtTnNaUzU1TENCeVlXUnBkWE1zSUhKaFpHbDFjeWs3WEhKY2JpQWdJQ0I5WEhKY2JuMDdJaXdpYlc5a2RXeGxMbVY0Y0c5eWRITWdQU0JUYTJWMFkyZzdYSEpjYmx4eVhHNTJZWElnVG05cGMyVWdQU0J5WlhGMWFYSmxLRndpTGk5blpXNWxjbUYwYjNKekwyNXZhWE5sTFdkbGJtVnlZWFJ2Y25NdWFuTmNJaWs3WEhKY2JuWmhjaUJDWW05NFZHVjRkQ0E5SUhKbGNYVnBjbVVvWENKd05TMWlZbTk0TFdGc2FXZHVaV1F0ZEdWNGRGd2lLVHRjY2x4dWRtRnlJRUpoYzJWTWIyZHZVMnRsZEdOb0lEMGdjbVZ4ZFdseVpTaGNJaTR2WW1GelpTMXNiMmR2TFhOclpYUmphQzVxYzF3aUtUdGNjbHh1WEhKY2JsTnJaWFJqYUM1d2NtOTBiM1I1Y0dVZ1BTQlBZbXBsWTNRdVkzSmxZWFJsS0VKaGMyVk1iMmR2VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaU2s3WEhKY2JseHlYRzVtZFc1amRHbHZiaUJUYTJWMFkyZ29KRzVoZGl3Z0pHNWhka3h2WjI4cElIdGNjbHh1SUNBZ0lFSmhjMlZNYjJkdlUydGxkR05vTG1OaGJHd29kR2hwY3l3Z0pHNWhkaXdnSkc1aGRreHZaMjhzSUZ3aUxpNHZabTl1ZEhNdlltbG5YMnB2YUc0dGQyVmlabTl1ZEM1MGRHWmNJaWs3WEhKY2JuMWNjbHh1WEhKY2JsTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgyOXVVbVZ6YVhwbElEMGdablZ1WTNScGIyNGdLSEFwSUh0Y2NseHVJQ0FnSUVKaGMyVk1iMmR2VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmYjI1U1pYTnBlbVV1WTJGc2JDaDBhR2x6TENCd0tUdGNjbHh1SUNBZ0lDOHZJRlZ3WkdGMFpTQjBhR1VnWW1KdmVGUmxlSFFzSUhCc1lXTmxJRzkyWlhJZ2RHaGxJRzVoZGlCMFpYaDBJR3h2WjI4Z1lXNWtJSFJvWlc0Z2MyaHBablFnYVhSeklGeHlYRzRnSUNBZ0x5OGdZVzVqYUc5eUlHSmhZMnNnZEc4Z0tHTmxiblJsY2l3Z1kyVnVkR1Z5S1NCM2FHbHNaU0J3Y21WelpYSjJhVzVuSUhSb1pTQjBaWGgwSUhCdmMybDBhVzl1WEhKY2JpQWdJQ0IwYUdsekxsOWlZbTk0VkdWNGRDNXpaWFJVWlhoMEtIUm9hWE11WDNSbGVIUXBYSEpjYmlBZ0lDQWdJQ0FnTG5ObGRGUmxlSFJUYVhwbEtIUm9hWE11WDJadmJuUlRhWHBsS1Z4eVhHNGdJQ0FnSUNBZ0lDNXpaWFJTYjNSaGRHbHZiaWd3S1Z4eVhHNGdJQ0FnSUNBZ0lDNXpaWFJCYm1Ob2IzSW9RbUp2ZUZSbGVIUXVRVXhKUjA0dVFrOVlYMHhGUmxRc0lFSmliM2hVWlhoMExrSkJVMFZNU1U1RkxrRk1VRWhCUWtWVVNVTXBYSEpjYmlBZ0lDQWdJQ0FnTG5ObGRGQnZjMmwwYVc5dUtIUm9hWE11WDNSbGVIUlBabVp6WlhRdWJHVm1kQ3dnZEdocGN5NWZkR1Y0ZEU5bVpuTmxkQzUwYjNBcFhISmNiaUFnSUNBZ0lDQWdMbk5sZEVGdVkyaHZjaWhDWW05NFZHVjRkQzVCVEVsSFRpNUNUMWhmUTBWT1ZFVlNMQ0JDWW05NFZHVjRkQzVDUVZORlRFbE9SUzVDVDFoZlEwVk9WRVZTTENCY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZEhKMVpTazdYSEpjYmlBZ0lDQjBhR2x6TGw5MFpYaDBVRzl6SUQwZ2RHaHBjeTVmWW1KdmVGUmxlSFF1WjJWMFVHOXphWFJwYjI0b0tUdGNjbHh1SUNBZ0lIUm9hWE11WDJSeVlYZFRkR0YwYVc5dVlYSjVURzluYnlod0tUdGNjbHh1SUNBZ0lIUm9hWE11WDJselJtbHljM1JHY21GdFpTQTlJSFJ5ZFdVN1hISmNibjA3WEhKY2JseHlYRzVUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDlrY21GM1UzUmhkR2x2Ym1GeWVVeHZaMjhnUFNCbWRXNWpkR2x2YmlBb2NDa2dlMXh5WEc0Z0lDQWdjQzVpWVdOclozSnZkVzVrS0RJMU5TazdYSEpjYmlBZ0lDQndMbk4wY205clpTZ3lOVFVwTzF4eVhHNGdJQ0FnY0M1bWFXeHNLRndpSXpCQk1EQXdRVndpS1R0Y2NseHVJQ0FnSUhBdWMzUnliMnRsVjJWcFoyaDBLRElwTzF4eVhHNGdJQ0FnZEdocGN5NWZZbUp2ZUZSbGVIUXVaSEpoZHlncE8xeHlYRzU5TzF4eVhHNWNjbHh1VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmYzJWMGRYQWdQU0JtZFc1amRHbHZiaUFvY0NrZ2UxeHlYRzRnSUNBZ1FtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5elpYUjFjQzVqWVd4c0tIUm9hWE1zSUhBcE8xeHlYRzVjY2x4dUlDQWdJQzh2SUVOeVpXRjBaU0JoSUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQ0JwYm5OMFlXNWpaU0IwYUdGMElIZHBiR3dnWW1VZ2RYTmxaQ0JtYjNJZ1pISmhkMmx1WnlCaGJtUWdYSEpjYmlBZ0lDQXZMeUJ5YjNSaGRHbHVaeUIwWlhoMFhISmNiaUFnSUNCMGFHbHpMbDlpWW05NFZHVjRkQ0E5SUc1bGR5QkNZbTk0VkdWNGRDaDBhR2x6TGw5bWIyNTBMQ0IwYUdsekxsOTBaWGgwTENCMGFHbHpMbDltYjI1MFUybDZaU3dnTUN3Z01Dd2dYSEpjYmlBZ0lDQWdJQ0FnY0NrN1hISmNibHh5WEc0Z0lDQWdMeThnU0dGdVpHeGxJSFJvWlNCcGJtbDBhV0ZzSUhObGRIVndJR0o1SUhSeWFXZG5aWEpwYm1jZ1lTQnlaWE5wZW1WY2NseHVJQ0FnSUhSb2FYTXVYMjl1VW1WemFYcGxLSEFwTzF4eVhHNWNjbHh1SUNBZ0lDOHZJRk5sZENCMWNDQnViMmx6WlNCblpXNWxjbUYwYjNKelhISmNiaUFnSUNCMGFHbHpMbDl5YjNSaGRHbHZiazV2YVhObElEMGdibVYzSUU1dmFYTmxMazV2YVhObFIyVnVaWEpoZEc5eU1VUW9jQ3dnTFhBdVVFa3ZOQ3dnY0M1UVNTODBMQ0F3TGpBeUtUc2dYSEpjYmlBZ0lDQjBhR2x6TGw5NGVVNXZhWE5sSUQwZ2JtVjNJRTV2YVhObExrNXZhWE5sUjJWdVpYSmhkRzl5TWtRb2NDd2dMVEV3TUN3Z01UQXdMQ0F0TlRBc0lEVXdMQ0F3TGpBeExDQmNjbHh1SUNBZ0lDQWdJQ0F3TGpBeEtUdGNjbHh1ZlR0Y2NseHVYSEpjYmxOclpYUmphQzV3Y205MGIzUjVjR1V1WDJSeVlYY2dQU0JtZFc1amRHbHZiaUFvY0NrZ2UxeHlYRzRnSUNBZ1FtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5a2NtRjNMbU5oYkd3b2RHaHBjeXdnY0NrN1hISmNiaUFnSUNCcFppQW9JWFJvYVhNdVgybHpUVzkxYzJWUGRtVnlJSHg4SUNGMGFHbHpMbDlwYzA5MlpYSk9ZWFpNYjJkdktTQnlaWFIxY200N1hISmNibHh5WEc0Z0lDQWdMeThnVjJobGJpQjBhR1VnZEdWNGRDQnBjeUJoWW05MWRDQjBieUJpWldOdmJXVWdZV04wYVhabElHWnZjaUIwYUdVZ1ptbHljM1FnZEdsdFpTd2dZMnhsWVhKY2NseHVJQ0FnSUM4dklIUm9aU0J6ZEdGMGFXOXVZWEo1SUd4dloyOGdkR2hoZENCM1lYTWdjSEpsZG1sdmRYTnNlU0JrY21GM2JpNGdYSEpjYmlBZ0lDQnBaaUFvZEdocGN5NWZhWE5HYVhKemRFWnlZVzFsS1NCN1hISmNiaUFnSUNBZ0lDQWdjQzVpWVdOclozSnZkVzVrS0RJMU5TazdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZhWE5HYVhKemRFWnlZVzFsSUQwZ1ptRnNjMlU3WEhKY2JpQWdJQ0I5WEhKY2JseHlYRzRnSUNBZ0x5OGdRMkZzWTNWc1lYUmxJSEJ2YzJsMGFXOXVJR0Z1WkNCeWIzUmhkR2x2YmlCMGJ5QmpjbVZoZEdVZ1lTQnFhWFIwWlhKNUlHeHZaMjljY2x4dUlDQWdJSFpoY2lCeWIzUmhkR2x2YmlBOUlIUm9hWE11WDNKdmRHRjBhVzl1VG05cGMyVXVaMlZ1WlhKaGRHVW9LVHRjY2x4dUlDQWdJSFpoY2lCNGVVOW1abk5sZENBOUlIUm9hWE11WDNoNVRtOXBjMlV1WjJWdVpYSmhkR1VvS1R0Y2NseHVJQ0FnSUhSb2FYTXVYMkppYjNoVVpYaDBMbk5sZEZKdmRHRjBhVzl1S0hKdmRHRjBhVzl1S1Z4eVhHNGdJQ0FnSUNBZ0lDNXpaWFJRYjNOcGRHbHZiaWgwYUdsekxsOTBaWGgwVUc5ekxuZ2dLeUI0ZVU5bVpuTmxkQzU0TENCMGFHbHpMbDkwWlhoMFVHOXpMbmtnS3lCNGVVOW1abk5sZEM1NUtWeHlYRzRnSUNBZ0lDQWdJQzVrY21GM0tDazdYSEpjYm4wN0lpd2liVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQk5ZV2x1VG1GMk8xeHlYRzVjY2x4dVpuVnVZM1JwYjI0Z1RXRnBiazVoZGloc2IyRmtaWElwSUh0Y2NseHVJQ0FnSUhSb2FYTXVYMnh2WVdSbGNpQTlJR3h2WVdSbGNqdGNjbHh1SUNBZ0lIUm9hWE11WHlSc2IyZHZJRDBnSkNoY0ltNWhkaTV1WVhaaVlYSWdMbTVoZG1KaGNpMWljbUZ1WkZ3aUtUdGNjbHh1SUNBZ0lIUm9hWE11WHlSdVlYWWdQU0FrS0Z3aUkyMWhhVzR0Ym1GMlhDSXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHNWhka3hwYm10eklEMGdkR2hwY3k1ZkpHNWhkaTVtYVc1a0tGd2lZVndpS1R0Y2NseHVJQ0FnSUhSb2FYTXVYeVJoWTNScGRtVk9ZWFlnUFNCMGFHbHpMbDhrYm1GMlRHbHVhM011Wm1sdVpDaGNJaTVoWTNScGRtVmNJaWs3WEhKY2JpQWdJQ0IwYUdsekxsOGtibUYyVEdsdWEzTXViMjRvWENKamJHbGphMXdpTENCMGFHbHpMbDl2Yms1aGRrTnNhV05yTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkd4dloyOHViMjRvWENKamJHbGphMXdpTENCMGFHbHpMbDl2Ymt4dloyOURiR2xqYXk1aWFXNWtLSFJvYVhNcEtUdGNjbHh1ZlZ4eVhHNWNjbHh1VFdGcGJrNWhkaTV3Y205MGIzUjVjR1V1YzJWMFFXTjBhWFpsUm5KdmJWVnliQ0E5SUdaMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lIUm9hWE11WDJSbFlXTjBhWFpoZEdVb0tUdGNjbHh1SUNBZ0lIWmhjaUIxY213Z1BTQnNiMk5oZEdsdmJpNXdZWFJvYm1GdFpUdGNjbHh1SUNBZ0lHbG1JQ2gxY213Z1BUMDlJRndpTDJsdVpHVjRMbWgwYld4Y0lpQjhmQ0IxY213Z1BUMDlJRndpTDF3aUtTQjdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZZV04wYVhaaGRHVk1hVzVyS0hSb2FYTXVYeVJ1WVhaTWFXNXJjeTVtYVd4MFpYSW9YQ0lqWVdKdmRYUXRiR2x1YTF3aUtTazdYSEpjYmlBZ0lDQjlJR1ZzYzJVZ2FXWWdLSFZ5YkNBOVBUMGdYQ0l2ZDI5eWF5NW9kRzFzWENJcElIdGNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOWhZM1JwZG1GMFpVeHBibXNvZEdocGN5NWZKRzVoZGt4cGJtdHpMbVpwYkhSbGNpaGNJaU4zYjNKckxXeHBibXRjSWlrcE8xeHlYRzRnSUNBZ2ZWeHlYRzU5TzF4eVhHNWNjbHh1VFdGcGJrNWhkaTV3Y205MGIzUjVjR1V1WDJSbFlXTjBhWFpoZEdVZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEhKY2JpQWdJQ0JwWmlBb2RHaHBjeTVmSkdGamRHbDJaVTVoZGk1c1pXNW5kR2dwSUh0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw4a1lXTjBhWFpsVG1GMkxuSmxiVzkyWlVOc1lYTnpLRndpWVdOMGFYWmxYQ0lwTzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WHlSaFkzUnBkbVZPWVhZZ1BTQWtLQ2s3WEhKY2JpQWdJQ0I5WEhKY2JuMDdYSEpjYmx4eVhHNU5ZV2x1VG1GMkxuQnliM1J2ZEhsd1pTNWZZV04wYVhaaGRHVk1hVzVySUQwZ1puVnVZM1JwYjI0Z0tDUnNhVzVyS1NCN1hISmNiaUFnSUNBa2JHbHVheTVoWkdSRGJHRnpjeWhjSW1GamRHbDJaVndpS1R0Y2NseHVJQ0FnSUhSb2FYTXVYeVJoWTNScGRtVk9ZWFlnUFNBa2JHbHVhenRjY2x4dWZUdGNjbHh1WEhKY2JrMWhhVzVPWVhZdWNISnZkRzkwZVhCbExsOXZia3h2WjI5RGJHbGpheUE5SUdaMWJtTjBhVzl1SUNobEtTQjdYSEpjYmlBZ0lDQmxMbkJ5WlhabGJuUkVaV1poZFd4MEtDazdYSEpjYmlBZ0lDQjJZWElnSkhSaGNtZGxkQ0E5SUNRb1pTNWpkWEp5Wlc1MFZHRnlaMlYwS1R0Y2NseHVJQ0FnSUhaaGNpQjFjbXdnUFNBa2RHRnlaMlYwTG1GMGRISW9YQ0pvY21WbVhDSXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZmJHOWhaR1Z5TG14dllXUlFZV2RsS0hWeWJDd2dlMzBzSUhSeWRXVXBPMXh5WEc1OU8xeHlYRzVjY2x4dVRXRnBiazVoZGk1d2NtOTBiM1I1Y0dVdVgyOXVUbUYyUTJ4cFkyc2dQU0JtZFc1amRHbHZiaUFvWlNrZ2UxeHlYRzRnSUNBZ1pTNXdjbVYyWlc1MFJHVm1ZWFZzZENncE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkc1aGRpNWpiMnhzWVhCelpTaGNJbWhwWkdWY0lpazdJQzh2SUVOc2IzTmxJSFJvWlNCdVlYWWdMU0J2Ym14NUlHMWhkSFJsY25NZ2IyNGdiVzlpYVd4bFhISmNiaUFnSUNCMllYSWdKSFJoY21kbGRDQTlJQ1FvWlM1amRYSnlaVzUwVkdGeVoyVjBLVHRjY2x4dUlDQWdJR2xtSUNna2RHRnlaMlYwTG1sektIUm9hWE11WHlSaFkzUnBkbVZPWVhZcEtTQnlaWFIxY200N1hISmNiaUFnSUNCMGFHbHpMbDlrWldGamRHbDJZWFJsS0NrN1hISmNiaUFnSUNCMGFHbHpMbDloWTNScGRtRjBaVXhwYm1zb0pIUmhjbWRsZENrN1hISmNiaUFnSUNCMllYSWdkWEpzSUQwZ0pIUmhjbWRsZEM1aGRIUnlLRndpYUhKbFpsd2lLVHRjY2x4dUlDQWdJSFJvYVhNdVgyeHZZV1JsY2k1c2IyRmtVR0ZuWlNoMWNtd3NJSHQ5TENCMGNuVmxLVHRjY2x4dWZUc2lMQ0oyWVhJZ1RHOWhaR1Z5SUQwZ2NtVnhkV2x5WlNoY0lpNHZjR0ZuWlMxc2IyRmtaWEl1YW5OY0lpazdYSEpjYm5aaGNpQk5ZV2x1VG1GMklEMGdjbVZ4ZFdseVpTaGNJaTR2YldGcGJpMXVZWFl1YW5OY0lpazdYSEpjYm5aaGNpQkliM1psY2xOc2FXUmxjMmh2ZDNNZ1BTQnlaWEYxYVhKbEtGd2lMaTlvYjNabGNpMXpiR2xrWlhOb2IzY3Vhbk5jSWlrN1hISmNiblpoY2lCUWIzSjBabTlzYVc5R2FXeDBaWElnUFNCeVpYRjFhWEpsS0Z3aUxpOXdiM0owWm05c2FXOHRabWxzZEdWeUxtcHpYQ0lwTzF4eVhHNTJZWElnYzJ4cFpHVnphRzkzY3lBOUlISmxjWFZwY21Vb1hDSXVMM1JvZFcxaWJtRnBiQzF6Ykdsa1pYTm9iM2N2YzJ4cFpHVnphRzkzTG1welhDSXBPMXh5WEc1Y2NseHVMeThnVUdsamEybHVaeUJoSUhKaGJtUnZiU0J6YTJWMFkyZ2dkR2hoZENCMGFHVWdkWE5sY2lCb1lYTnVKM1FnYzJWbGJpQmlaV1p2Y21WY2NseHVkbUZ5SUZOclpYUmphQ0E5SUhKbGNYVnBjbVVvWENJdUwzQnBZMnN0Y21GdVpHOXRMWE5yWlhSamFDNXFjMXdpS1NncE8xeHlYRzVjY2x4dUx5OGdRVXBCV0NCd1lXZGxJR3h2WVdSbGNpd2dkMmwwYUNCallXeHNZbUZqYXlCbWIzSWdjbVZzYjJGa2FXNW5JSGRwWkdkbGRITmNjbHh1ZG1GeUlHeHZZV1JsY2lBOUlHNWxkeUJNYjJGa1pYSW9iMjVRWVdkbFRHOWhaQ2s3WEhKY2JseHlYRzR2THlCTllXbHVJRzVoZGlCM2FXUm5aWFJjY2x4dWRtRnlJRzFoYVc1T1lYWWdQU0J1WlhjZ1RXRnBiazVoZGloc2IyRmtaWElwTzF4eVhHNWNjbHh1THk4Z1NXNTBaWEpoWTNScGRtVWdiRzluYnlCcGJpQnVZWFppWVhKY2NseHVkbUZ5SUc1aGRpQTlJQ1FvWENKdVlYWXVibUYyWW1GeVhDSXBPMXh5WEc1MllYSWdibUYyVEc5bmJ5QTlJRzVoZGk1bWFXNWtLRndpTG01aGRtSmhjaTFpY21GdVpGd2lLVHRjY2x4dWJtVjNJRk5yWlhSamFDaHVZWFlzSUc1aGRreHZaMjhwTzF4eVhHNWNjbHh1THk4Z1YybGtaMlYwSUdkc2IySmhiSE5jY2x4dWRtRnlJSEJ2Y25SbWIyeHBiMFpwYkhSbGNqdGNjbHh1WEhKY2JpOHZJRXh2WVdRZ1lXeHNJSGRwWkdkbGRITmNjbHh1YjI1UVlXZGxURzloWkNncE8xeHlYRzVjY2x4dUx5OGdTR0Z1Wkd4bElHSmhZMnN2Wm05eWQyRnlaQ0JpZFhSMGIyNXpYSEpjYm5kcGJtUnZkeTVoWkdSRmRtVnVkRXhwYzNSbGJtVnlLRndpY0c5d2MzUmhkR1ZjSWl3Z2IyNVFiM0JUZEdGMFpTazdYSEpjYmx4eVhHNW1kVzVqZEdsdmJpQnZibEJ2Y0ZOMFlYUmxLR1VwSUh0Y2NseHVJQ0FnSUM4dklFeHZZV1JsY2lCemRHOXlaWE1nWTNWemRHOXRJR1JoZEdFZ2FXNGdkR2hsSUhOMFlYUmxJQzBnYVc1amJIVmthVzVuSUhSb1pTQjFjbXdnWVc1a0lIUm9aU0J4ZFdWeWVWeHlYRzRnSUNBZ2RtRnlJSFZ5YkNBOUlDaGxMbk4wWVhSbElDWW1JR1V1YzNSaGRHVXVkWEpzS1NCOGZDQmNJaTlwYm1SbGVDNW9kRzFzWENJN1hISmNiaUFnSUNCMllYSWdjWFZsY25sUFltcGxZM1FnUFNBb1pTNXpkR0YwWlNBbUppQmxMbk4wWVhSbExuRjFaWEo1S1NCOGZDQjdmVHRjY2x4dVhISmNiaUFnSUNCcFppQW9LSFZ5YkNBOVBUMGdiRzloWkdWeUxtZGxkRXh2WVdSbFpGQmhkR2dvS1NrZ0ppWWdLSFZ5YkNBOVBUMGdYQ0l2ZDI5eWF5NW9kRzFzWENJcEtTQjdYSEpjYmlBZ0lDQWdJQ0FnTHk4Z1ZHaGxJR04xY25KbGJuUWdKaUJ3Y21WMmFXOTFjeUJzYjJGa1pXUWdjM1JoZEdWeklIZGxjbVVnZDI5eWF5NW9kRzFzTENCemJ5QnFkWE4wSUhKbFptbHNkR1Z5WEhKY2JpQWdJQ0FnSUNBZ2RtRnlJR05oZEdWbmIzSjVJRDBnY1hWbGNubFBZbXBsWTNRdVkyRjBaV2R2Y25rZ2ZId2dYQ0poYkd4Y0lqdGNjbHh1SUNBZ0lDQWdJQ0J3YjNKMFptOXNhVzlHYVd4MFpYSXVjMlZzWldOMFEyRjBaV2R2Y25rb1kyRjBaV2R2Y25rcE8xeHlYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2NseHVJQ0FnSUNBZ0lDQXZMeUJNYjJGa0lIUm9aU0J1WlhjZ2NHRm5aVnh5WEc0Z0lDQWdJQ0FnSUd4dllXUmxjaTVzYjJGa1VHRm5aU2gxY213c0lIdDlMQ0JtWVd4elpTazdYSEpjYmlBZ0lDQjlYSEpjYm4xY2NseHVYSEpjYm1aMWJtTjBhVzl1SUc5dVVHRm5aVXh2WVdRb0tTQjdYSEpjYmlBZ0lDQXZMeUJTWld4dllXUWdZV3hzSUhCc2RXZHBibk12ZDJsa1oyVjBjMXh5WEc0Z0lDQWdibVYzSUVodmRtVnlVMnhwWkdWemFHOTNjeWdwTzF4eVhHNGdJQ0FnY0c5eWRHWnZiR2x2Um1sc2RHVnlJRDBnYm1WM0lGQnZjblJtYjJ4cGIwWnBiSFJsY2loc2IyRmtaWElwTzF4eVhHNGdJQ0FnYzJ4cFpHVnphRzkzY3k1cGJtbDBLQ2s3WEhKY2JpQWdJQ0J2WW1wbFkzUkdhWFJKYldGblpYTW9LVHRjY2x4dUlDQWdJSE50WVhKMGNYVnZkR1Z6S0NrN1hISmNibHh5WEc0Z0lDQWdMeThnVTJ4cFoyaDBiSGtnY21Wa2RXNWtZVzUwTENCaWRYUWdkWEJrWVhSbElIUm9aU0J0WVdsdUlHNWhkaUIxYzJsdVp5QjBhR1VnWTNWeWNtVnVkQ0JWVWt3dUlGUm9hWE5jY2x4dUlDQWdJQzh2SUdseklHbHRjRzl5ZEdGdWRDQnBaaUJoSUhCaFoyVWdhWE1nYkc5aFpHVmtJR0o1SUhSNWNHbHVaeUJoSUdaMWJHd2dWVkpNSUNobExtY3VJR2R2YVc1blhISmNiaUFnSUNBdkx5QmthWEpsWTNSc2VTQjBieUF2ZDI5eWF5NW9kRzFzS1NCdmNpQjNhR1Z1SUcxdmRtbHVaeUJtY205dElIZHZjbXN1YUhSdGJDQjBieUJoSUhCeWIycGxZM1F1WEhKY2JpQWdJQ0J0WVdsdVRtRjJMbk5sZEVGamRHbDJaVVp5YjIxVmNtd29LVHRjY2x4dWZWeHlYRzVjY2x4dUx5OGdWMlVuZG1VZ2FHbDBJSFJvWlNCc1lXNWthVzVuSUhCaFoyVXNJR3h2WVdRZ2RHaGxJR0ZpYjNWMElIQmhaMlZjY2x4dUx5OGdhV1lnS0d4dlkyRjBhVzl1TG5CaGRHaHVZVzFsTG0xaGRHTm9LQzllS0Z4Y0wzeGNYQzlwYm1SbGVDNW9kRzFzZkdsdVpHVjRMbWgwYld3cEpDOHBLU0I3WEhKY2JpOHZJQ0FnSUNCc2IyRmtaWEl1Ykc5aFpGQmhaMlVvWENJdllXSnZkWFF1YUhSdGJGd2lMQ0I3ZlN3Z1ptRnNjMlVwTzF4eVhHNHZMeUI5SWl3aWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCTWIyRmtaWEk3WEhKY2JseHlYRzUyWVhJZ2RYUnBiR2wwYVdWeklEMGdjbVZ4ZFdseVpTaGNJaTR2ZFhScGJHbDBhV1Z6TG1welhDSXBPMXh5WEc1Y2NseHVablZ1WTNScGIyNGdURzloWkdWeUtHOXVVbVZzYjJGa0xDQm1ZV1JsUkhWeVlYUnBiMjRwSUh0Y2NseHVJQ0FnSUhSb2FYTXVYeVJqYjI1MFpXNTBJRDBnSkNoY0lpTmpiMjUwWlc1MFhDSXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZmIyNVNaV3h2WVdRZ1BTQnZibEpsYkc5aFpEdGNjbHh1SUNBZ0lIUm9hWE11WDJaaFpHVkVkWEpoZEdsdmJpQTlJQ2htWVdSbFJIVnlZWFJwYjI0Z0lUMDlJSFZ1WkdWbWFXNWxaQ2tnUHlCbVlXUmxSSFZ5WVhScGIyNGdPaUF5TlRBN1hISmNiaUFnSUNCMGFHbHpMbDl3WVhSb0lEMGdiRzlqWVhScGIyNHVjR0YwYUc1aGJXVTdYSEpjYm4xY2NseHVYSEpjYmt4dllXUmxjaTV3Y205MGIzUjVjR1V1WjJWMFRHOWhaR1ZrVUdGMGFDQTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUhKbGRIVnliaUIwYUdsekxsOXdZWFJvTzF4eVhHNTlPMXh5WEc1Y2NseHVURzloWkdWeUxuQnliM1J2ZEhsd1pTNXNiMkZrVUdGblpTQTlJR1oxYm1OMGFXOXVJQ2gxY213c0lIRjFaWEo1VDJKcVpXTjBMQ0J6YUc5MWJHUlFkWE5vU0dsemRHOXllU2tnZTF4eVhHNGdJQ0FnTHk4Z1JtRmtaU0IwYUdWdUlHVnRjSFI1SUhSb1pTQmpkWEp5Wlc1MElHTnZiblJsYm5SelhISmNiaUFnSUNCMGFHbHpMbDhrWTI5dWRHVnVkQzUyWld4dlkybDBlU2g3SUc5d1lXTnBkSGs2SURBZ2ZTd2dkR2hwY3k1ZlptRmtaVVIxY21GMGFXOXVMQ0JjSW5OM2FXNW5YQ0lzSUdaMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOGtZMjl1ZEdWdWRDNWxiWEIwZVNncE8xeHlYRzRnSUNBZ0lDQWdJSFJvYVhNdVh5UmpiMjUwWlc1MExteHZZV1FvZFhKc0lDc2dYQ0lnSTJOdmJuUmxiblJjSWl3Z2IyNURiMjUwWlc1MFJtVjBZMmhsWkM1aWFXNWtLSFJvYVhNcEtUdGNjbHh1SUNBZ0lIMHVZbWx1WkNoMGFHbHpLU2s3WEhKY2JseHlYRzRnSUNBZ0x5OGdSbUZrWlNCMGFHVWdibVYzSUdOdmJuUmxiblFnYVc0Z1lXWjBaWElnYVhRZ2FHRnpJR0psWlc0Z1ptVjBZMmhsWkZ4eVhHNGdJQ0FnWm5WdVkzUnBiMjRnYjI1RGIyNTBaVzUwUm1WMFkyaGxaQ2h5WlhOd2IyNXpaVlJsZUhRc0lIUmxlSFJUZEdGMGRYTXBJSHRjY2x4dUlDQWdJQ0FnSUNCcFppQW9kR1Y0ZEZOMFlYUjFjeUE5UFQwZ1hDSmxjbkp2Y2x3aUtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk52YkdVdWJHOW5LRndpVkdobGNtVWdkMkZ6SUdFZ2NISnZZbXhsYlNCc2IyRmthVzVuSUhSb1pTQndZV2RsTGx3aUtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1TzF4eVhHNGdJQ0FnSUNBZ0lIMWNjbHh1WEhKY2JpQWdJQ0FnSUNBZ2RtRnlJSEYxWlhKNVUzUnlhVzVuSUQwZ2RYUnBiR2wwYVdWekxtTnlaV0YwWlZGMVpYSjVVM1J5YVc1bktIRjFaWEo1VDJKcVpXTjBLVHRjY2x4dUlDQWdJQ0FnSUNCcFppQW9jMmh2ZFd4a1VIVnphRWhwYzNSdmNua3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdhR2x6ZEc5eWVTNXdkWE5vVTNSaGRHVW9lMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZFhKc09pQjFjbXdzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeGRXVnllVG9nY1hWbGNubFBZbXBsWTNSY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZlN3Z2JuVnNiQ3dnZFhKc0lDc2djWFZsY25sVGRISnBibWNwTzF4eVhHNGdJQ0FnSUNBZ0lIMWNjbHh1WEhKY2JpQWdJQ0FnSUNBZ0x5OGdWWEJrWVhSbElFZHZiMmRzWlNCaGJtRnNlWFJwWTNOY2NseHVJQ0FnSUNBZ0lDQm5ZU2hjSW5ObGRGd2lMQ0JjSW5CaFoyVmNJaXdnZFhKc0lDc2djWFZsY25sVGRISnBibWNwTzF4eVhHNGdJQ0FnSUNBZ0lHZGhLRndpYzJWdVpGd2lMQ0JjSW5CaFoyVjJhV1YzWENJcE8xeHlYRzVjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDl3WVhSb0lEMGdiRzlqWVhScGIyNHVjR0YwYUc1aGJXVTdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZKR052Ym5SbGJuUXVkbVZzYjJOcGRIa29leUJ2Y0dGamFYUjVPaUF4SUgwc0lIUm9hWE11WDJaaFpHVkVkWEpoZEdsdmJpeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1hDSnpkMmx1WjF3aUtUdGNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOXZibEpsYkc5aFpDZ3BPMXh5WEc0Z0lDQWdmVnh5WEc1OU95SXNJblpoY2lCamIyOXJhV1Z6SUQwZ2NtVnhkV2x5WlNoY0ltcHpMV052YjJ0cFpWd2lLVHRjY2x4dWRtRnlJSFYwYVd4eklEMGdjbVZ4ZFdseVpTaGNJaTR2ZFhScGJHbDBhV1Z6TG1welhDSXBPMXh5WEc1Y2NseHVkbUZ5SUhOclpYUmphRU52Ym5OMGNuVmpkRzl5Y3lBOUlIdGNjbHh1SUNBZ0lGd2lhR0ZzWm5SdmJtVXRabXhoYzJoc2FXZG9kRndpT2lCY2NseHVJQ0FnSUNBZ0lDQnlaWEYxYVhKbEtGd2lMaTlwYm5SbGNtRmpkR2wyWlMxc2IyZHZjeTlvWVd4bWRHOXVaUzFtYkdGemFHeHBaMmgwTFhkdmNtUXVhbk5jSWlrc1hISmNiaUFnSUNCY0ltNXZhWE41TFhkdmNtUmNJanBjY2x4dUlDQWdJQ0FnSUNCeVpYRjFhWEpsS0Z3aUxpOXBiblJsY21GamRHbDJaUzFzYjJkdmN5OXViMmx6ZVMxM2IzSmtMWE5yWlhSamFDNXFjMXdpS1N4Y2NseHVJQ0FnSUZ3aVkyOXVibVZqZEMxd2IybHVkSE5jSWpwY2NseHVJQ0FnSUNBZ0lDQnlaWEYxYVhKbEtGd2lMaTlwYm5SbGNtRmpkR2wyWlMxc2IyZHZjeTlqYjI1dVpXTjBMWEJ2YVc1MGN5MXphMlYwWTJndWFuTmNJaWxjY2x4dWZUdGNjbHh1ZG1GeUlHNTFiVk5yWlhSamFHVnpJRDBnVDJKcVpXTjBMbXRsZVhNb2MydGxkR05vUTI5dWMzUnlkV04wYjNKektTNXNaVzVuZEdnN1hISmNiblpoY2lCamIyOXJhV1ZMWlhrZ1BTQmNJbk5sWlc0dGMydGxkR05vTFc1aGJXVnpYQ0k3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nVUdsamF5QmhJSEpoYm1SdmJTQnphMlYwWTJnZ2RHaGhkQ0IxYzJWeUlHaGhjMjRuZENCelpXVnVJSGxsZEM0Z1NXWWdkR2hsSUhWelpYSWdhR0Z6SUhObFpXNGdZV3hzSUhSb1pWeHlYRzRnS2lCemEyVjBZMmhsY3l3Z2FuVnpkQ0J3YVdOcklHRWdjbUZ1Wkc5dElHOXVaUzRnVkdocGN5QjFjMlZ6SUdOdmIydHBaWE1nZEc4Z2RISmhZMnNnZDJoaGRDQjBhR1VnZFhObGNpQmNjbHh1SUNvZ2FHRnpJSE5sWlc0Z1lXeHlaV0ZrZVM1Y2NseHVJQ29nUUhKbGRIVnliaUI3Um5WdVkzUnBiMjU5SUVOdmJuTjBjblZqZEc5eUlHWnZjaUJoSUZOclpYUmphQ0JqYkdGemMxeHlYRzRnS2k5Y2NseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQm1kVzVqZEdsdmJpQndhV05yVW1GdVpHOXRVMnRsZEdOb0tDa2dlMXh5WEc0Z0lDQWdkbUZ5SUhObFpXNVRhMlYwWTJoT1lXMWxjeUE5SUdOdmIydHBaWE11WjJWMFNsTlBUaWhqYjI5cmFXVkxaWGtwSUh4OElGdGRPMXh5WEc1Y2NseHVJQ0FnSUM4dklFWnBibVFnZEdobElHNWhiV1Z6SUc5bUlIUm9aU0IxYm5ObFpXNGdjMnRsZEdOb1pYTmNjbHh1SUNBZ0lIWmhjaUIxYm5ObFpXNVRhMlYwWTJoT1lXMWxjeUE5SUdacGJtUlZibk5sWlc1VGEyVjBZMmhsY3loelpXVnVVMnRsZEdOb1RtRnRaWE1wTzF4eVhHNWNjbHh1SUNBZ0lDOHZJRUZzYkNCemEyVjBZMmhsY3lCb1lYWmxJR0psWlc0Z2MyVmxibHh5WEc0Z0lDQWdhV1lnS0hWdWMyVmxibE5yWlhSamFFNWhiV1Z6TG14bGJtZDBhQ0E5UFQwZ01Da2dlMXh5WEc0Z0lDQWdJQ0FnSUM4dklFbG1JSGRsSjNabElHZHZkQ0J0YjNKbElIUm9aVzRnYjI1bElITnJaWFJqYUN3Z2RHaGxiaUJ0WVd0bElITjFjbVVnZEc4Z1kyaHZiM05sSUdFZ2NtRnVaRzl0WEhKY2JpQWdJQ0FnSUNBZ0x5OGdjMnRsZEdOb0lHVjRZMngxWkdsdVp5QjBhR1VnYlc5emRDQnlaV05sYm5Sc2VTQnpaV1Z1SUhOclpYUmphRnh5WEc0Z0lDQWdJQ0FnSUdsbUlDaHVkVzFUYTJWMFkyaGxjeUErSURFcElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2MyVmxibE5yWlhSamFFNWhiV1Z6SUQwZ1czTmxaVzVUYTJWMFkyaE9ZVzFsY3k1d2IzQW9LVjA3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFZ1YzJWbGJsTnJaWFJqYUU1aGJXVnpJRDBnWm1sdVpGVnVjMlZsYmxOclpYUmphR1Z6S0hObFpXNVRhMlYwWTJoT1lXMWxjeWs3WEhKY2JpQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1NXWWdkMlVuZG1VZ2IyNXNlU0JuYjNRZ2IyNWxJSE5yWlhSamFDd2dkR2hsYmlCM1pTQmpZVzRuZENCa2J5QnRkV05vTGk0dVhISmNiaUFnSUNBZ0lDQWdJQ0FnSUhObFpXNVRhMlYwWTJoT1lXMWxjeUE5SUZ0ZE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMWJuTmxaVzVUYTJWMFkyaE9ZVzFsY3lBOUlFOWlhbVZqZEM1clpYbHpLSE5yWlhSamFFTnZibk4wY25WamRHOXljeWs3SUNBZ0lDQWdJQ0FnSUNBZ1hISmNiaUFnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdmVnh5WEc1Y2NseHVJQ0FnSUhaaGNpQnlZVzVrVTJ0bGRHTm9UbUZ0WlNBOUlIVjBhV3h6TG5KaGJtUkJjbkpoZVVWc1pXMWxiblFvZFc1elpXVnVVMnRsZEdOb1RtRnRaWE1wTzF4eVhHNGdJQ0FnYzJWbGJsTnJaWFJqYUU1aGJXVnpMbkIxYzJnb2NtRnVaRk5yWlhSamFFNWhiV1VwTzF4eVhHNWNjbHh1SUNBZ0lDOHZJRk4wYjNKbElIUm9aU0JuWlc1bGNtRjBaV1FnYzJ0bGRHTm9JR2x1SUdFZ1kyOXZhMmxsTGlCVWFHbHpJR055WldGMFpYTWdZU0J0YjNacGJtY2dOeUJrWVhsY2NseHVJQ0FnSUM4dklIZHBibVJ2ZHlBdElHRnVlWFJwYldVZ2RHaGxJSE5wZEdVZ2FYTWdkbWx6YVhSbFpDd2dkR2hsSUdOdmIydHBaU0JwY3lCeVpXWnlaWE5vWldRdVhISmNiaUFnSUNCamIyOXJhV1Z6TG5ObGRDaGpiMjlyYVdWTFpYa3NJSE5sWlc1VGEyVjBZMmhPWVcxbGN5d2dleUJsZUhCcGNtVnpPaUEzSUgwcE8xeHlYRzVjY2x4dUlDQWdJSEpsZEhWeWJpQnphMlYwWTJoRGIyNXpkSEoxWTNSdmNuTmJjbUZ1WkZOclpYUmphRTVoYldWZE8xeHlYRzU5TzF4eVhHNWNjbHh1Wm5WdVkzUnBiMjRnWm1sdVpGVnVjMlZsYmxOclpYUmphR1Z6S0hObFpXNVRhMlYwWTJoT1lXMWxjeWtnZTF4eVhHNGdJQ0FnZG1GeUlIVnVjMlZsYmxOclpYUmphRTVoYldWeklEMGdXMTA3WEhKY2JpQWdJQ0JtYjNJZ0tIWmhjaUJ6YTJWMFkyaE9ZVzFsSUdsdUlITnJaWFJqYUVOdmJuTjBjblZqZEc5eWN5a2dlMXh5WEc0Z0lDQWdJQ0FnSUdsbUlDaHpaV1Z1VTJ0bGRHTm9UbUZ0WlhNdWFXNWtaWGhQWmloemEyVjBZMmhPWVcxbEtTQTlQVDBnTFRFcElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RXNXpaV1Z1VTJ0bGRHTm9UbUZ0WlhNdWNIVnphQ2h6YTJWMFkyaE9ZVzFsS1R0Y2NseHVJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQjlYSEpjYmlBZ0lDQnlaWFIxY200Z2RXNXpaV1Z1VTJ0bGRHTm9UbUZ0WlhNN1hISmNibjBpTENKdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUZCdmNuUm1iMnhwYjBacGJIUmxjanRjY2x4dVhISmNiblpoY2lCMWRHbHNhWFJwWlhNZ1BTQnlaWEYxYVhKbEtGd2lMaTkxZEdsc2FYUnBaWE11YW5OY0lpazdYSEpjYmx4eVhHNTJZWElnWkdWbVlYVnNkRUp5WldGcmNHOXBiblJ6SUQwZ1cxeHlYRzRnSUNBZ2V5QjNhV1IwYURvZ01USXdNQ3dnWTI5c2N6b2dNeXdnYzNCaFkybHVaem9nTVRVZ2ZTeGNjbHh1SUNBZ0lIc2dkMmxrZEdnNklEazVNaXdnWTI5c2N6b2dNeXdnYzNCaFkybHVaem9nTVRVZ2ZTeGNjbHh1SUNBZ0lIc2dkMmxrZEdnNklEY3dNQ3dnWTI5c2N6b2dNeXdnYzNCaFkybHVaem9nTVRVZ2ZTeGNjbHh1SUNBZ0lIc2dkMmxrZEdnNklEWXdNQ3dnWTI5c2N6b2dNaXdnYzNCaFkybHVaem9nTVRBZ2ZTeGNjbHh1SUNBZ0lIc2dkMmxrZEdnNklEUTRNQ3dnWTI5c2N6b2dNaXdnYzNCaFkybHVaem9nTVRBZ2ZTeGNjbHh1SUNBZ0lIc2dkMmxrZEdnNklETXlNQ3dnWTI5c2N6b2dNU3dnYzNCaFkybHVaem9nTVRBZ2ZWeHlYRzVkTzF4eVhHNWNjbHh1Wm5WdVkzUnBiMjRnVUc5eWRHWnZiR2x2Um1sc2RHVnlLR3h2WVdSbGNpd2dZbkpsWVd0d2IybHVkSE1zSUdGemNHVmpkRkpoZEdsdkxDQjBjbUZ1YzJsMGFXOXVSSFZ5WVhScGIyNHBJSHRjY2x4dUlDQWdJSFJvYVhNdVgyeHZZV1JsY2lBOUlHeHZZV1JsY2p0Y2NseHVJQ0FnSUhSb2FYTXVYMmR5YVdSVGNHRmphVzVuSUQwZ01EdGNjbHh1SUNBZ0lIUm9hWE11WDJGemNHVmpkRkpoZEdsdklEMGdLR0Z6Y0dWamRGSmhkR2x2SUNFOVBTQjFibVJsWm1sdVpXUXBJRDhnWVhOd1pXTjBVbUYwYVc4Z09pQW9NVFl2T1NrN1hISmNiaUFnSUNCMGFHbHpMbDkwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRnUFNBb2RISmhibk5wZEdsdmJrUjFjbUYwYVc5dUlDRTlQU0IxYm1SbFptbHVaV1FwSUQ4Z1hISmNiaUFnSUNBZ0lDQWdkSEpoYm5OcGRHbHZia1IxY21GMGFXOXVJRG9nT0RBd08xeHlYRzRnSUNBZ2RHaHBjeTVmWW5KbFlXdHdiMmx1ZEhNZ1BTQW9ZbkpsWVd0d2IybHVkSE1nSVQwOUlIVnVaR1ZtYVc1bFpDa2dQeUJjY2x4dUlDQWdJQ0FnSUNCaWNtVmhhM0J2YVc1MGN5NXpiR2xqWlNncElEb2daR1ZtWVhWc2RFSnlaV0ZyY0c5cGJuUnpMbk5zYVdObEtDazdYSEpjYmlBZ0lDQjBhR2x6TGw4a1ozSnBaQ0E5SUNRb1hDSWpjRzl5ZEdadmJHbHZMV2R5YVdSY0lpazdYSEpjYmlBZ0lDQjBhR2x6TGw4a2JtRjJJRDBnSkNoY0lpTndiM0owWm05c2FXOHRibUYyWENJcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkhCeWIycGxZM1J6SUQwZ1cxMDdYSEpjYmlBZ0lDQjBhR2x6TGw4a1kyRjBaV2R2Y21sbGN5QTlJSHQ5TzF4eVhHNGdJQ0FnZEdocGN5NWZjbTkzY3lBOUlEQTdYSEpjYmlBZ0lDQjBhR2x6TGw5amIyeHpJRDBnTUR0Y2NseHVJQ0FnSUhSb2FYTXVYMmx0WVdkbFNHVnBaMmgwSUQwZ01EdGNjbHh1SUNBZ0lIUm9hWE11WDJsdFlXZGxWMmxrZEdnZ1BTQXdPMXh5WEc1Y2NseHVJQ0FnSUM4dklGTnZjblFnZEdobElHSnlaV0ZyY0c5cGJuUnpJR2x1SUdSbGMyTmxibVJwYm1jZ2IzSmtaWEpjY2x4dUlDQWdJSFJvYVhNdVgySnlaV0ZyY0c5cGJuUnpMbk52Y25Rb1puVnVZM1JwYjI0b1lTd2dZaWtnZTF4eVhHNGdJQ0FnSUNBZ0lHbG1JQ2hoTG5kcFpIUm9JRHdnWWk1M2FXUjBhQ2tnY21WMGRYSnVJQzB4TzF4eVhHNGdJQ0FnSUNBZ0lHVnNjMlVnYVdZZ0tHRXVkMmxrZEdnZ1BpQmlMbmRwWkhSb0tTQnlaWFIxY200Z01UdGNjbHh1SUNBZ0lDQWdJQ0JsYkhObElISmxkSFZ5YmlBd08xeHlYRzRnSUNBZ2ZTazdYSEpjYmx4eVhHNGdJQ0FnZEdocGN5NWZZMkZqYUdWUWNtOXFaV04wY3lncE8xeHlYRzRnSUNBZ2RHaHBjeTVmWTNKbFlYUmxSM0pwWkNncE8xeHlYRzVjY2x4dUlDQWdJSFJvYVhNdVh5Um5jbWxrTG1acGJtUW9YQ0l1Y0hKdmFtVmpkQ0JoWENJcExtOXVLRndpWTJ4cFkydGNJaXdnZEdocGN5NWZiMjVRY205cVpXTjBRMnhwWTJzdVltbHVaQ2gwYUdsektTazdYSEpjYmx4eVhHNGdJQ0FnZG1GeUlIRnpJRDBnZFhScGJHbDBhV1Z6TG1kbGRGRjFaWEo1VUdGeVlXMWxkR1Z5Y3lncE8xeHlYRzRnSUNBZ2RtRnlJR2x1YVhScFlXeERZWFJsWjI5eWVTQTlJSEZ6TG1OaGRHVm5iM0o1SUh4OElGd2lZV3hzWENJN1hISmNiaUFnSUNCMllYSWdZMkYwWldkdmNua2dQU0JwYm1sMGFXRnNRMkYwWldkdmNua3VkRzlNYjNkbGNrTmhjMlVvS1R0Y2NseHVJQ0FnSUhSb2FYTXVYeVJoWTNScGRtVk9ZWFpKZEdWdElEMGdkR2hwY3k1ZkpHNWhkaTVtYVc1a0tGd2lZVnRrWVhSaExXTmhkR1ZuYjNKNVBWd2lJQ3NnWTJGMFpXZHZjbmtnS3lCY0lsMWNJaWs3WEhKY2JpQWdJQ0IwYUdsekxsOGtZV04wYVhabFRtRjJTWFJsYlM1aFpHUkRiR0Z6Y3loY0ltRmpkR2wyWlZ3aUtUdGNjbHh1SUNBZ0lIUm9hWE11WDJacGJIUmxjbEJ5YjJwbFkzUnpLR05oZEdWbmIzSjVLVHRjY2x4dUlDQWdJQ1FvWENJamNHOXlkR1p2YkdsdkxXNWhkaUJoWENJcExtOXVLRndpWTJ4cFkydGNJaXdnZEdocGN5NWZiMjVPWVhaRGJHbGpheTVpYVc1a0tIUm9hWE1wS1R0Y2NseHVYSEpjYmlBZ0lDQWtLSGRwYm1SdmR5a3ViMjRvWENKeVpYTnBlbVZjSWl3Z2RHaHBjeTVmWTNKbFlYUmxSM0pwWkM1aWFXNWtLSFJvYVhNcEtUdGNjbHh1ZlZ4eVhHNWNjbHh1VUc5eWRHWnZiR2x2Um1sc2RHVnlMbkJ5YjNSdmRIbHdaUzV6Wld4bFkzUkRZWFJsWjI5eWVTQTlJR1oxYm1OMGFXOXVJQ2hqWVhSbFoyOXllU2tnZTF4eVhHNGdJQ0FnWTJGMFpXZHZjbmtnUFNBb1kyRjBaV2R2Y25rZ0ppWWdZMkYwWldkdmNua3VkRzlNYjNkbGNrTmhjMlVvS1NrZ2ZId2dYQ0poYkd4Y0lqdGNjbHh1SUNBZ0lIWmhjaUFrYzJWc1pXTjBaV1JPWVhZZ1BTQjBhR2x6TGw4a2JtRjJMbVpwYm1Rb1hDSmhXMlJoZEdFdFkyRjBaV2R2Y25rOVhDSWdLeUJqWVhSbFoyOXllU0FySUZ3aVhWd2lLVHRjY2x4dUlDQWdJR2xtSUNna2MyVnNaV04wWldST1lYWXViR1Z1WjNSb0lDWW1JQ0VrYzJWc1pXTjBaV1JPWVhZdWFYTW9kR2hwY3k1ZkpHRmpkR2wyWlU1aGRrbDBaVzBwS1NCN1hISmNiaUFnSUNBZ0lDQWdkR2hwY3k1ZkpHRmpkR2wyWlU1aGRrbDBaVzB1Y21WdGIzWmxRMnhoYzNNb1hDSmhZM1JwZG1WY0lpazdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZKR0ZqZEdsMlpVNWhka2wwWlcwZ1BTQWtjMlZzWldOMFpXUk9ZWFk3WEhKY2JpQWdJQ0FnSUNBZ2RHaHBjeTVmSkdGamRHbDJaVTVoZGtsMFpXMHVZV1JrUTJ4aGMzTW9YQ0poWTNScGRtVmNJaWs3WEhKY2JpQWdJQ0FnSUNBZ2RHaHBjeTVmWm1sc2RHVnlVSEp2YW1WamRITW9ZMkYwWldkdmNua3BPMXh5WEc0Z0lDQWdmVnh5WEc1OU8xeHlYRzVjY2x4dVVHOXlkR1p2YkdsdlJtbHNkR1Z5TG5CeWIzUnZkSGx3WlM1ZlptbHNkR1Z5VUhKdmFtVmpkSE1nUFNCbWRXNWpkR2x2YmlBb1kyRjBaV2R2Y25rcElIdGNjbHh1SUNBZ0lIWmhjaUFrYzJWc1pXTjBaV1JGYkdWdFpXNTBjeUE5SUhSb2FYTXVYMmRsZEZCeWIycGxZM1J6U1c1RFlYUmxaMjl5ZVNoallYUmxaMjl5ZVNrN1hISmNibHh5WEc0Z0lDQWdMeThnUVc1cGJXRjBaU0IwYUdVZ1ozSnBaQ0IwYnlCMGFHVWdZMjl5Y21WamRDQm9aV2xuYUhRZ2RHOGdZMjl1ZEdGcGJpQjBhR1VnY205M2MxeHlYRzRnSUNBZ2RHaHBjeTVmWVc1cGJXRjBaVWR5YVdSSVpXbG5hSFFvSkhObGJHVmpkR1ZrUld4bGJXVnVkSE11YkdWdVozUm9LVHRjY2x4dUlDQWdJRnh5WEc0Z0lDQWdMeThnVEc5dmNDQjBhSEp2ZFdkb0lHRnNiQ0J3Y205cVpXTjBjMXh5WEc0Z0lDQWdkR2hwY3k1ZkpIQnliMnBsWTNSekxtWnZja1ZoWTJnb1puVnVZM1JwYjI0Z0tDUmxiR1Z0Wlc1MEtTQjdYSEpjYmlBZ0lDQWdJQ0FnTHk4Z1UzUnZjQ0JoYkd3Z1lXNXBiV0YwYVc5dWMxeHlYRzRnSUNBZ0lDQWdJQ1JsYkdWdFpXNTBMblpsYkc5amFYUjVLRndpYzNSdmNGd2lLVHRjY2x4dUlDQWdJQ0FnSUNBdkx5QkpaaUJoYmlCbGJHVnRaVzUwSUdseklHNXZkQ0J6Wld4bFkzUmxaRG9nWkhKdmNDQjZMV2x1WkdWNElDWWdZVzVwYldGMFpTQnZjR0ZqYVhSNUlDMCtJR2hwWkdWY2NseHVJQ0FnSUNBZ0lDQjJZWElnYzJWc1pXTjBaV1JKYm1SbGVDQTlJQ1J6Wld4bFkzUmxaRVZzWlcxbGJuUnpMbWx1WkdWNFQyWW9KR1ZzWlcxbGJuUXBPeUJjY2x4dUlDQWdJQ0FnSUNCcFppQW9jMlZzWldOMFpXUkpibVJsZUNBOVBUMGdMVEVwSUh0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkdWc1pXMWxiblF1WTNOektGd2lla2x1WkdWNFhDSXNJQzB4S1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkdWc1pXMWxiblF1ZG1Wc2IyTnBkSGtvZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2IzQmhZMmwwZVRvZ01GeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCOUxDQjBhR2x6TGw5MGNtRnVjMmwwYVc5dVJIVnlZWFJwYjI0c0lGd2laV0Z6WlVsdVQzVjBRM1ZpYVdOY0lpd2dablZ1WTNScGIyNGdLQ2tnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0pHVnNaVzFsYm5RdWFHbGtaU2dwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5QkpaaUJoYmlCbGJHVnRaVzUwSUdseklITmxiR1ZqZEdWa09pQnphRzkzSUNZZ1luVnRjQ0I2TFdsdVpHVjRJQ1lnWVc1cGJXRjBaU0IwYnlCd2IzTnBkR2x2YmlCY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkdWc1pXMWxiblF1YzJodmR5Z3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWtaV3hsYldWdWRDNWpjM01vWENKNlNXNWtaWGhjSWl3Z01DazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJ1WlhkUWIzTWdQU0IwYUdsekxsOXBibVJsZUZSdldGa29jMlZzWldOMFpXUkpibVJsZUNrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNSbGJHVnRaVzUwTG5abGJHOWphWFI1S0hzZ1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnZjR0ZqYVhSNU9pQXhMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEc5d09pQnVaWGRRYjNNdWVTQXJJRndpY0hoY0lpeGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR3hsWm5RNklHNWxkMUJ2Y3k1NElDc2dYQ0p3ZUZ3aVhISmNiaUFnSUNBZ0lDQWdJQ0FnSUgwc0lIUm9hWE11WDNSeVlXNXphWFJwYjI1RWRYSmhkR2x2Yml3Z1hDSmxZWE5sU1c1UGRYUkRkV0pwWTF3aUtUdGNjbHh1SUNBZ0lDQWdJQ0I5WEhKY2JpQWdJQ0I5TG1KcGJtUW9kR2hwY3lrcE8xeHlYRzU5TzF4eVhHNWNjbHh1VUc5eWRHWnZiR2x2Um1sc2RHVnlMbkJ5YjNSdmRIbHdaUzVmWVc1cGJXRjBaVWR5YVdSSVpXbG5hSFFnUFNCbWRXNWpkR2x2YmlBb2JuVnRSV3hsYldWdWRITXBJSHRjY2x4dUlDQWdJSFJvYVhNdVh5Um5jbWxrTG5abGJHOWphWFI1S0Z3aWMzUnZjRndpS1R0Y2NseHVJQ0FnSUhaaGNpQmpkWEpTYjNkeklEMGdUV0YwYUM1alpXbHNLRzUxYlVWc1pXMWxiblJ6SUM4Z2RHaHBjeTVmWTI5c2N5azdYSEpjYmlBZ0lDQjBhR2x6TGw4a1ozSnBaQzUyWld4dlkybDBlU2g3WEhKY2JpQWdJQ0FnSUNBZ2FHVnBaMmgwT2lCMGFHbHpMbDlwYldGblpVaGxhV2RvZENBcUlHTjFjbEp2ZDNNZ0t5QmNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmWjNKcFpGTndZV05wYm1jZ0tpQW9ZM1Z5VW05M2N5QXRJREVwSUNzZ1hDSndlRndpWEhKY2JpQWdJQ0I5TENCMGFHbHpMbDkwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRwTzF4eVhHNTlPMXh5WEc1Y2NseHVVRzl5ZEdadmJHbHZSbWxzZEdWeUxuQnliM1J2ZEhsd1pTNWZaMlYwVUhKdmFtVmpkSE5KYmtOaGRHVm5iM0o1SUQwZ1puVnVZM1JwYjI0Z0tHTmhkR1ZuYjNKNUtTQjdYSEpjYmlBZ0lDQnBaaUFvWTJGMFpXZHZjbmtnUFQwOUlGd2lZV3hzWENJcElIdGNjbHh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdkR2hwY3k1ZkpIQnliMnBsWTNSek8xeHlYRzRnSUNBZ2ZTQmxiSE5sSUh0Y2NseHVJQ0FnSUNBZ0lDQnlaWFIxY200Z0tIUm9hWE11WHlSallYUmxaMjl5YVdWelcyTmhkR1ZuYjNKNVhTQjhmQ0JiWFNrN1hISmNiaUFnSUNCOUlDQWdJQ0FnSUNCY2NseHVmVHRjY2x4dVhISmNibEJ2Y25SbWIyeHBiMFpwYkhSbGNpNXdjbTkwYjNSNWNHVXVYMk5oWTJobFVISnZhbVZqZEhNZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEhKY2JpQWdJQ0IwYUdsekxsOGtjSEp2YW1WamRITWdQU0JiWFR0Y2NseHVJQ0FnSUhSb2FYTXVYeVJqWVhSbFoyOXlhV1Z6SUQwZ2UzMDdYSEpjYmlBZ0lDQjBhR2x6TGw4a1ozSnBaQzVtYVc1a0tGd2lMbkJ5YjJwbFkzUmNJaWt1WldGamFDaG1kVzVqZEdsdmJpQW9hVzVrWlhnc0lHVnNaVzFsYm5RcElIdGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ0pHVnNaVzFsYm5RZ1BTQWtLR1ZzWlcxbGJuUXBPMXh5WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYeVJ3Y205cVpXTjBjeTV3ZFhOb0tDUmxiR1Z0Wlc1MEtUdGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ1kyRjBaV2R2Y25sT1lXMWxjeUE5SUNSbGJHVnRaVzUwTG1SaGRHRW9YQ0pqWVhSbFoyOXlhV1Z6WENJcExuTndiR2wwS0Z3aUxGd2lLVHRjY2x4dUlDQWdJQ0FnSUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHTmhkR1ZuYjNKNVRtRnRaWE11YkdWdVozUm9PeUJwSUNzOUlERXBJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdOaGRHVm5iM0o1SUQwZ0pDNTBjbWx0S0dOaGRHVm5iM0o1VG1GdFpYTmJhVjBwTG5SdlRHOTNaWEpEWVhObEtDazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2doZEdocGN5NWZKR05oZEdWbmIzSnBaWE5iWTJGMFpXZHZjbmxkS1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw4a1kyRjBaV2R2Y21sbGMxdGpZWFJsWjI5eWVWMGdQU0JiSkdWc1pXMWxiblJkTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZKR05oZEdWbmIzSnBaWE5iWTJGMFpXZHZjbmxkTG5CMWMyZ29KR1ZzWlcxbGJuUXBPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYSEpjYmlBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnZlM1aWFXNWtLSFJvYVhNcEtUdGNjbHh1ZlR0Y2NseHVYSEpjYmk4dklGQnZjblJtYjJ4cGIwWnBiSFJsY2k1d2NtOTBiM1I1Y0dVdVgyTmhiR04xYkdGMFpVZHlhV1FnUFNCbWRXNWpkR2x2YmlBb0tTQjdYSEpjYmk4dklDQWdJQ0IyWVhJZ1ozSnBaRmRwWkhSb0lEMGdkR2hwY3k1ZkpHZHlhV1F1YVc1dVpYSlhhV1IwYUNncE8xeHlYRzR2THlBZ0lDQWdkR2hwY3k1ZlkyOXNjeUE5SUUxaGRHZ3VabXh2YjNJb0tHZHlhV1JYYVdSMGFDQXJJSFJvYVhNdVgyZHlhV1JUY0dGamFXNW5LU0F2SUZ4eVhHNHZMeUFnSUNBZ0lDQWdJQ2gwYUdsekxsOXRhVzVKYldGblpWZHBaSFJvSUNzZ2RHaHBjeTVmWjNKcFpGTndZV05wYm1jcEtUdGNjbHh1THk4Z0lDQWdJSFJvYVhNdVgzSnZkM01nUFNCTllYUm9MbU5sYVd3b2RHaHBjeTVmSkhCeWIycGxZM1J6TG14bGJtZDBhQ0F2SUhSb2FYTXVYMk52YkhNcE8xeHlYRzR2THlBZ0lDQWdkR2hwY3k1ZmFXMWhaMlZYYVdSMGFDQTlJQ2huY21sa1YybGtkR2dnTFNBb0tIUm9hWE11WDJOdmJITWdMU0F4S1NBcUlIUm9hWE11WDJkeWFXUlRjR0ZqYVc1bktTa2dMeUJjY2x4dUx5OGdJQ0FnSUNBZ0lDQjBhR2x6TGw5amIyeHpPMXh5WEc0dkx5QWdJQ0FnZEdocGN5NWZhVzFoWjJWSVpXbG5hSFFnUFNCMGFHbHpMbDlwYldGblpWZHBaSFJvSUNvZ0tERWdMeUIwYUdsekxsOWhjM0JsWTNSU1lYUnBieWs3WEhKY2JpOHZJSDA3WEhKY2JseHlYRzVRYjNKMFptOXNhVzlHYVd4MFpYSXVjSEp2ZEc5MGVYQmxMbDlqWVd4amRXeGhkR1ZIY21sa0lEMGdablZ1WTNScGIyNGdLQ2tnZTF4eVhHNGdJQ0FnZG1GeUlHZHlhV1JYYVdSMGFDQTlJSFJvYVhNdVh5Um5jbWxrTG1sdWJtVnlWMmxrZEdnb0tUdGNjbHh1SUNBZ0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2dkR2hwY3k1ZlluSmxZV3R3YjJsdWRITXViR1Z1WjNSb095QnBJQ3M5SURFcElIdGNjbHh1SUNBZ0lDQWdJQ0JwWmlBb1ozSnBaRmRwWkhSb0lEdzlJSFJvYVhNdVgySnlaV0ZyY0c5cGJuUnpXMmxkTG5kcFpIUm9LU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgyTnZiSE1nUFNCMGFHbHpMbDlpY21WaGEzQnZhVzUwYzF0cFhTNWpiMnh6TzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOW5jbWxrVTNCaFkybHVaeUE5SUhSb2FYTXVYMkp5WldGcmNHOXBiblJ6VzJsZExuTndZV05wYm1jN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdKeVpXRnJPMXh5WEc0Z0lDQWdJQ0FnSUgxY2NseHVJQ0FnSUgxY2NseHVJQ0FnSUhSb2FYTXVYM0p2ZDNNZ1BTQk5ZWFJvTG1ObGFXd29kR2hwY3k1ZkpIQnliMnBsWTNSekxteGxibWQwYUNBdklIUm9hWE11WDJOdmJITXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZmFXMWhaMlZYYVdSMGFDQTlJQ2huY21sa1YybGtkR2dnTFNBb0tIUm9hWE11WDJOdmJITWdMU0F4S1NBcUlIUm9hWE11WDJkeWFXUlRjR0ZqYVc1bktTa2dMeUJjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDlqYjJ4ek8xeHlYRzRnSUNBZ2RHaHBjeTVmYVcxaFoyVklaV2xuYUhRZ1BTQjBhR2x6TGw5cGJXRm5aVmRwWkhSb0lDb2dLREVnTHlCMGFHbHpMbDloYzNCbFkzUlNZWFJwYnlrN1hISmNibjA3WEhKY2JseHlYRzVRYjNKMFptOXNhVzlHYVd4MFpYSXVjSEp2ZEc5MGVYQmxMbDlqY21WaGRHVkhjbWxrSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZlkyRnNZM1ZzWVhSbFIzSnBaQ2dwTzF4eVhHNWNjbHh1SUNBZ0lIUm9hWE11WHlSbmNtbGtMbU56Y3loY0luQnZjMmwwYVc5dVhDSXNJRndpY21Wc1lYUnBkbVZjSWlrN1hISmNiaUFnSUNCMGFHbHpMbDhrWjNKcFpDNWpjM01vZTF4eVhHNGdJQ0FnSUNBZ0lHaGxhV2RvZERvZ2RHaHBjeTVmYVcxaFoyVklaV2xuYUhRZ0tpQjBhR2x6TGw5eWIzZHpJQ3NnWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgyZHlhV1JUY0dGamFXNW5JQ29nS0hSb2FYTXVYM0p2ZDNNZ0xTQXhLU0FySUZ3aWNIaGNJbHh5WEc0Z0lDQWdmU2s3SUNBZ0lGeHlYRzVjY2x4dUlDQWdJSFJvYVhNdVh5UndjbTlxWldOMGN5NW1iM0pGWVdOb0tHWjFibU4wYVc5dUlDZ2taV3hsYldWdWRDd2dhVzVrWlhncElIdGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ2NHOXpJRDBnZEdocGN5NWZhVzVrWlhoVWIxaFpLR2x1WkdWNEtUdGNjbHh1SUNBZ0lDQWdJQ0FrWld4bGJXVnVkQzVqYzNNb2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCd2IzTnBkR2x2YmpvZ1hDSmhZbk52YkhWMFpWd2lMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBiM0E2SUhCdmN5NTVJQ3NnWENKd2VGd2lMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnNaV1owT2lCd2IzTXVlQ0FySUZ3aWNIaGNJaXhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdkMmxrZEdnNklIUm9hWE11WDJsdFlXZGxWMmxrZEdnZ0t5QmNJbkI0WENJc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdobGFXZG9kRG9nZEdocGN5NWZhVzFoWjJWSVpXbG5hSFFnS3lCY0luQjRYQ0pjY2x4dUlDQWdJQ0FnSUNCOUtUdGNjbHh1SUNBZ0lIMHVZbWx1WkNoMGFHbHpLU2s3SUNBZ0lGeHlYRzU5TzF4eVhHNWNjbHh1VUc5eWRHWnZiR2x2Um1sc2RHVnlMbkJ5YjNSdmRIbHdaUzVmYjI1T1lYWkRiR2xqYXlBOUlHWjFibU4wYVc5dUlDaGxLU0I3WEhKY2JpQWdJQ0JsTG5CeVpYWmxiblJFWldaaGRXeDBLQ2s3WEhKY2JpQWdJQ0IyWVhJZ0pIUmhjbWRsZENBOUlDUW9aUzUwWVhKblpYUXBPMXh5WEc0Z0lDQWdhV1lnS0NSMFlYSm5aWFF1YVhNb2RHaHBjeTVmSkdGamRHbDJaVTVoZGtsMFpXMHBLU0J5WlhSMWNtNDdYSEpjYmlBZ0lDQnBaaUFvZEdocGN5NWZKR0ZqZEdsMlpVNWhka2wwWlcwdWJHVnVaM1JvS1NCMGFHbHpMbDhrWVdOMGFYWmxUbUYyU1hSbGJTNXlaVzF2ZG1WRGJHRnpjeWhjSW1GamRHbDJaVndpS1R0Y2NseHVJQ0FnSUNSMFlYSm5aWFF1WVdSa1EyeGhjM01vWENKaFkzUnBkbVZjSWlrN1hISmNiaUFnSUNCMGFHbHpMbDhrWVdOMGFYWmxUbUYyU1hSbGJTQTlJQ1IwWVhKblpYUTdYSEpjYmlBZ0lDQjJZWElnWTJGMFpXZHZjbmtnUFNBa2RHRnlaMlYwTG1SaGRHRW9YQ0pqWVhSbFoyOXllVndpS1M1MGIweHZkMlZ5UTJGelpTZ3BPMXh5WEc1Y2NseHVJQ0FnSUdocGMzUnZjbmt1Y0hWemFGTjBZWFJsS0h0Y2NseHVJQ0FnSUNBZ0lDQjFjbXc2SUZ3aUwzZHZjbXN1YUhSdGJGd2lMRnh5WEc0Z0lDQWdJQ0FnSUhGMVpYSjVPaUI3SUdOaGRHVm5iM0o1T2lCallYUmxaMjl5ZVNCOVhISmNiaUFnSUNCOUxDQnVkV3hzTENCY0lpOTNiM0pyTG1oMGJXdy9ZMkYwWldkdmNuazlYQ0lnS3lCallYUmxaMjl5ZVNrN1hISmNibHh5WEc0Z0lDQWdkR2hwY3k1ZlptbHNkR1Z5VUhKdmFtVmpkSE1vWTJGMFpXZHZjbmtwTzF4eVhHNTlPMXh5WEc1Y2NseHVVRzl5ZEdadmJHbHZSbWxzZEdWeUxuQnliM1J2ZEhsd1pTNWZiMjVRY205cVpXTjBRMnhwWTJzZ1BTQm1kVzVqZEdsdmJpQW9aU2tnZTF4eVhHNGdJQ0FnWlM1d2NtVjJaVzUwUkdWbVlYVnNkQ2dwTzF4eVhHNGdJQ0FnZG1GeUlDUjBZWEpuWlhRZ1BTQWtLR1V1WTNWeWNtVnVkRlJoY21kbGRDazdYSEpjYmlBZ0lDQjJZWElnY0hKdmFtVmpkRTVoYldVZ1BTQWtkR0Z5WjJWMExtUmhkR0VvWENKdVlXMWxYQ0lwTzF4eVhHNGdJQ0FnZG1GeUlIVnliQ0E5SUZ3aUwzQnliMnBsWTNSekwxd2lJQ3NnY0hKdmFtVmpkRTVoYldVZ0t5QmNJaTVvZEcxc1hDSTdYSEpjYmlBZ0lDQjBhR2x6TGw5c2IyRmtaWEl1Ykc5aFpGQmhaMlVvZFhKc0xDQjdmU3dnZEhKMVpTazdYSEpjYm4wN1hISmNibHh5WEc1Y2NseHVVRzl5ZEdadmJHbHZSbWxzZEdWeUxuQnliM1J2ZEhsd1pTNWZhVzVrWlhoVWIxaFpJRDBnWm5WdVkzUnBiMjRnS0dsdVpHVjRLU0I3WEhKY2JpQWdJQ0IyWVhJZ2NpQTlJRTFoZEdndVpteHZiM0lvYVc1a1pYZ2dMeUIwYUdsekxsOWpiMnh6S1R0Y2NseHVJQ0FnSUhaaGNpQmpJRDBnYVc1a1pYZ2dKU0IwYUdsekxsOWpiMnh6T3lCY2NseHVJQ0FnSUhKbGRIVnliaUI3WEhKY2JpQWdJQ0FnSUNBZ2VEb2dZeUFxSUhSb2FYTXVYMmx0WVdkbFYybGtkR2dnS3lCaklDb2dkR2hwY3k1ZlozSnBaRk53WVdOcGJtY3NYSEpjYmlBZ0lDQWdJQ0FnZVRvZ2NpQXFJSFJvYVhNdVgybHRZV2RsU0dWcFoyaDBJQ3NnY2lBcUlIUm9hWE11WDJkeWFXUlRjR0ZqYVc1blhISmNiaUFnSUNCOU8xeHlYRzU5T3lJc0ltMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1UyeHBaR1Z6YUc5M1RXOWtZV3c3WEhKY2JseHlYRzUyWVhJZ1MwVlpYME5QUkVWVElEMGdlMXh5WEc0Z0lDQWdURVZHVkY5QlVsSlBWem9nTXpjc1hISmNiaUFnSUNCU1NVZElWRjlCVWxKUFZ6b2dNemtzWEhKY2JpQWdJQ0JGVTBOQlVFVTZJREkzWEhKY2JuMDdYSEpjYmx4eVhHNW1kVzVqZEdsdmJpQlRiR2xrWlhOb2IzZE5iMlJoYkNna1kyOXVkR0ZwYm1WeUxDQnpiR2xrWlhOb2IzY3BJSHRjY2x4dUlDQWdJSFJvYVhNdVgzTnNhV1JsYzJodmR5QTlJSE5zYVdSbGMyaHZkenRjY2x4dVhISmNiaUFnSUNCMGFHbHpMbDhrYlc5a1lXd2dQU0FrWTI5dWRHRnBibVZ5TG1acGJtUW9YQ0l1YzJ4cFpHVnphRzkzTFcxdlpHRnNYQ0lwTzF4eVhHNGdJQ0FnZEdocGN5NWZKRzkyWlhKc1lYa2dQU0IwYUdsekxsOGtiVzlrWVd3dVptbHVaQ2hjSWk1dGIyUmhiQzF2ZG1WeWJHRjVYQ0lwTzF4eVhHNGdJQ0FnZEdocGN5NWZKR052Ym5SbGJuUWdQU0IwYUdsekxsOGtiVzlrWVd3dVptbHVaQ2hjSWk1dGIyUmhiQzFqYjI1MFpXNTBjMXdpS1R0Y2NseHVJQ0FnSUhSb2FYTXVYeVJqWVhCMGFXOXVJRDBnZEdocGN5NWZKRzF2WkdGc0xtWnBibVFvWENJdWJXOWtZV3d0WTJGd2RHbHZibHdpS1R0Y2NseHVJQ0FnSUhSb2FYTXVYeVJwYldGblpVTnZiblJoYVc1bGNpQTlJSFJvYVhNdVh5UnRiMlJoYkM1bWFXNWtLRndpTG0xdlpHRnNMV2x0WVdkbFhDSXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHbHRZV2RsVEdWbWRDQTlJSFJvYVhNdVh5UnRiMlJoYkM1bWFXNWtLRndpTG1sdFlXZGxMV0ZrZG1GdVkyVXRiR1ZtZEZ3aUtUdGNjbHh1SUNBZ0lIUm9hWE11WHlScGJXRm5aVkpwWjJoMElEMGdkR2hwY3k1ZkpHMXZaR0ZzTG1acGJtUW9YQ0l1YVcxaFoyVXRZV1IyWVc1alpTMXlhV2RvZEZ3aUtUdGNjbHh1WEhKY2JpQWdJQ0IwYUdsekxsOXBibVJsZUNBOUlEQTdJQzh2SUVsdVpHVjRJRzltSUhObGJHVmpkR1ZrSUdsdFlXZGxYSEpjYmlBZ0lDQjBhR2x6TGw5cGMwOXdaVzRnUFNCbVlXeHpaVHRjY2x4dUlDQWdJRnh5WEc0Z0lDQWdkR2hwY3k1ZkpHbHRZV2RsVEdWbWRDNXZiaWhjSW1Oc2FXTnJYQ0lzSUhSb2FYTXVZV1IyWVc1alpVeGxablF1WW1sdVpDaDBhR2x6S1NrN1hISmNiaUFnSUNCMGFHbHpMbDhrYVcxaFoyVlNhV2RvZEM1dmJpaGNJbU5zYVdOclhDSXNJSFJvYVhNdVlXUjJZVzVqWlZKcFoyaDBMbUpwYm1Rb2RHaHBjeWtwTzF4eVhHNGdJQ0FnSkNoa2IyTjFiV1Z1ZENrdWIyNG9YQ0pyWlhsa2IzZHVYQ0lzSUhSb2FYTXVYMjl1UzJWNVJHOTNiaTVpYVc1a0tIUm9hWE1wS1R0Y2NseHVYSEpjYmlBZ0lDQXZMeUJIYVhabElHcFJkV1Z5ZVNCamIyNTBjbTlzSUc5MlpYSWdjMmh2ZDJsdVp5OW9hV1JwYm1kY2NseHVJQ0FnSUhSb2FYTXVYeVJ0YjJSaGJDNWpjM01vWENKa2FYTndiR0Y1WENJc0lGd2lZbXh2WTJ0Y0lpazdYSEpjYmlBZ0lDQjBhR2x6TGw4a2JXOWtZV3d1YUdsa1pTZ3BPMXh5WEc1Y2NseHVJQ0FnSUM4dklFVjJaVzUwYzF4eVhHNGdJQ0FnSkNoM2FXNWtiM2NwTG05dUtGd2ljbVZ6YVhwbFhDSXNJSFJvYVhNdVgyOXVVbVZ6YVhwbExtSnBibVFvZEdocGN5a3BPMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHOTJaWEpzWVhrdWIyNG9YQ0pqYkdsamExd2lMQ0IwYUdsekxtTnNiM05sTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkcxdlpHRnNMbVpwYm1Rb1hDSXViVzlrWVd3dFkyeHZjMlZjSWlrdWIyNG9YQ0pqYkdsamExd2lMQ0IwYUdsekxtTnNiM05sTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzRnSUNBZ1hISmNiaUFnSUNCMGFHbHpMbDkxY0dSaGRHVkRiMjUwY205c2N5Z3BPMXh5WEc1Y2NseHVJQ0FnSUM4dklGTnBlbVVnYjJZZ1ptOXVkR0YzWlhOdmJXVWdhV052Ym5NZ2JtVmxaSE1nWVNCemJHbG5hSFFnWkdWc1lYa2dLSFZ1ZEdsc0lITjBZV05ySUdseklHTnNaV0Z5S1NCbWIzSmNjbHh1SUNBZ0lDOHZJSE52YldVZ2NtVmhjMjl1WEhKY2JpQWdJQ0J6WlhSVWFXMWxiM1YwS0daMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOXZibEpsYzJsNlpTZ3BPMXh5WEc0Z0lDQWdmUzVpYVc1a0tIUm9hWE1wTENBd0tUdGNjbHh1ZlZ4eVhHNWNjbHh1VTJ4cFpHVnphRzkzVFc5a1lXd3VjSEp2ZEc5MGVYQmxMbUZrZG1GdVkyVk1aV1owSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdkR2hwY3k1emFHOTNTVzFoWjJWQmRDaDBhR2x6TGw5cGJtUmxlQ0F0SURFcE8xeHlYRzU5TzF4eVhHNWNjbHh1VTJ4cFpHVnphRzkzVFc5a1lXd3VjSEp2ZEc5MGVYQmxMbUZrZG1GdVkyVlNhV2RvZENBOUlHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJSFJvYVhNdWMyaHZkMGx0WVdkbFFYUW9kR2hwY3k1ZmFXNWtaWGdnS3lBeEtUdGNjbHh1ZlR0Y2NseHVYSEpjYmxOc2FXUmxjMmh2ZDAxdlpHRnNMbkJ5YjNSdmRIbHdaUzV6YUc5M1NXMWhaMlZCZENBOUlHWjFibU4wYVc5dUlDaHBibVJsZUNrZ2UxeHlYRzRnSUNBZ2FXNWtaWGdnUFNCTllYUm9MbTFoZUNocGJtUmxlQ3dnTUNrN1hISmNiaUFnSUNCcGJtUmxlQ0E5SUUxaGRHZ3ViV2x1S0dsdVpHVjRMQ0IwYUdsekxsOXpiR2xrWlhOb2IzY3VaMlYwVG5WdFNXMWhaMlZ6S0NrZ0xTQXhLVHRjY2x4dUlDQWdJSFJvYVhNdVgybHVaR1Y0SUQwZ2FXNWtaWGc3WEhKY2JpQWdJQ0IyWVhJZ0pHbHRaeUE5SUhSb2FYTXVYM05zYVdSbGMyaHZkeTVuWlhSSFlXeHNaWEo1U1cxaFoyVW9kR2hwY3k1ZmFXNWtaWGdwTzF4eVhHNGdJQ0FnZG1GeUlHTmhjSFJwYjI0Z1BTQjBhR2x6TGw5emJHbGtaWE5vYjNjdVoyVjBRMkZ3ZEdsdmJpaDBhR2x6TGw5cGJtUmxlQ2s3WEhKY2JseHlYRzRnSUNBZ2RHaHBjeTVmSkdsdFlXZGxRMjl1ZEdGcGJtVnlMbVZ0Y0hSNUtDazdYSEpjYmlBZ0lDQWtLRndpUEdsdFp6NWNJaXdnZTNOeVl6b2dKR2x0Wnk1aGRIUnlLRndpYzNKalhDSXBmU2xjY2x4dUlDQWdJQ0FnSUNBdVlYQndaVzVrVkc4b2RHaHBjeTVmSkdsdFlXZGxRMjl1ZEdGcGJtVnlLVHRjY2x4dVhISmNiaUFnSUNCMGFHbHpMbDhrWTJGd2RHbHZiaTVsYlhCMGVTZ3BPMXh5WEc0Z0lDQWdhV1lnS0dOaGNIUnBiMjRwSUh0Y2NseHVJQ0FnSUNBZ0lDQWtLRndpUEhOd1lXNCtYQ0lwTG1Ga1pFTnNZWE56S0Z3aVptbG5kWEpsTFc1MWJXSmxjbHdpS1Z4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0F1ZEdWNGRDaGNJa1pwWnk0Z1hDSWdLeUFvZEdocGN5NWZhVzVrWlhnZ0t5QXhLU0FySUZ3aU9pQmNJaWxjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdMbUZ3Y0dWdVpGUnZLSFJvYVhNdVh5UmpZWEIwYVc5dUtUdGNjbHh1SUNBZ0lDQWdJQ0FrS0Z3aVBITndZVzQrWENJcExtRmtaRU5zWVhOektGd2lZMkZ3ZEdsdmJpMTBaWGgwWENJcFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUM1MFpYaDBLR05oY0hScGIyNHBYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDNWhjSEJsYm1SVWJ5aDBhR2x6TGw4a1kyRndkR2x2YmlrN1hISmNiaUFnSUNCOVhISmNiaUFnSUNCY2NseHVJQ0FnSUhSb2FYTXVYMjl1VW1WemFYcGxLQ2s3WEhKY2JpQWdJQ0IwYUdsekxsOTFjR1JoZEdWRGIyNTBjbTlzY3lncE8xeHlYRzU5TzF4eVhHNWNjbHh1VTJ4cFpHVnphRzkzVFc5a1lXd3VjSEp2ZEc5MGVYQmxMbTl3Wlc0Z1BTQm1kVzVqZEdsdmJpQW9hVzVrWlhncElIdGNjbHh1SUNBZ0lHbHVaR1Y0SUQwZ2FXNWtaWGdnZkh3Z01EdGNjbHh1SUNBZ0lIUm9hWE11WHlSdGIyUmhiQzV6YUc5M0tDazdYSEpjYmlBZ0lDQjBhR2x6TG5Ob2IzZEpiV0ZuWlVGMEtHbHVaR1Y0S1R0Y2NseHVJQ0FnSUhSb2FYTXVYMmx6VDNCbGJpQTlJSFJ5ZFdVN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2ROYjJSaGJDNXdjbTkwYjNSNWNHVXVZMnh2YzJVZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEhKY2JpQWdJQ0IwYUdsekxsOGtiVzlrWVd3dWFHbGtaU2dwTzF4eVhHNGdJQ0FnZEdocGN5NWZhWE5QY0dWdUlEMGdabUZzYzJVN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2ROYjJSaGJDNXdjbTkwYjNSNWNHVXVYMjl1UzJWNVJHOTNiaUE5SUdaMWJtTjBhVzl1SUNobEtTQjdYSEpjYmlBZ0lDQnBaaUFvSVhSb2FYTXVYMmx6VDNCbGJpa2djbVYwZFhKdU8xeHlYRzRnSUNBZ2FXWWdLR1V1ZDJocFkyZ2dQVDA5SUV0RldWOURUMFJGVXk1TVJVWlVYMEZTVWs5WEtTQjdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWhaSFpoYm1ObFRHVm1kQ2dwTzF4eVhHNGdJQ0FnZlNCbGJITmxJR2xtSUNobExuZG9hV05vSUQwOVBTQkxSVmxmUTA5RVJWTXVVa2xIU0ZSZlFWSlNUMWNwSUh0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TG1Ga2RtRnVZMlZTYVdkb2RDZ3BPMXh5WEc0Z0lDQWdmU0JsYkhObElHbG1JQ2hsTG5kb2FXTm9JRDA5UFNCTFJWbGZRMDlFUlZNdVJWTkRRVkJGS1NCN1hISmNiaUFnSUNBZ0lDQWdkR2hwY3k1amJHOXpaU2dwT3lBZ0lGeHlYRzRnSUNBZ2ZWeHlYRzU5TzF4eVhHNWNjbHh1VTJ4cFpHVnphRzkzVFc5a1lXd3VjSEp2ZEc5MGVYQmxMbDkxY0dSaGRHVkRiMjUwY205c2N5QTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2NseHVJQ0FnSUM4dklGSmxMV1Z1WVdKc1pWeHlYRzRnSUNBZ2RHaHBjeTVmSkdsdFlXZGxVbWxuYUhRdWNtVnRiM1psUTJ4aGMzTW9YQ0prYVhOaFlteGxaRndpS1R0Y2NseHVJQ0FnSUhSb2FYTXVYeVJwYldGblpVeGxablF1Y21WdGIzWmxRMnhoYzNNb1hDSmthWE5oWW14bFpGd2lLVHRjY2x4dUlDQWdJRnh5WEc0Z0lDQWdMeThnUkdsellXSnNaU0JwWmlCM1pTZDJaU0J5WldGamFHVmtJSFJvWlNCMGFHVWdiV0Y0SUc5eUlHMXBiaUJzYVcxcGRGeHlYRzRnSUNBZ2FXWWdLSFJvYVhNdVgybHVaR1Y0SUQ0OUlDaDBhR2x6TGw5emJHbGtaWE5vYjNjdVoyVjBUblZ0U1cxaFoyVnpLQ2tnTFNBeEtTa2dlMXh5WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYeVJwYldGblpWSnBaMmgwTG1Ga1pFTnNZWE56S0Z3aVpHbHpZV0pzWldSY0lpazdYSEpjYmlBZ0lDQjlJR1ZzYzJVZ2FXWWdLSFJvYVhNdVgybHVaR1Y0SUR3OUlEQXBJSHRjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDhrYVcxaFoyVk1aV1owTG1Ga1pFTnNZWE56S0Z3aVpHbHpZV0pzWldSY0lpazdYSEpjYmlBZ0lDQjlYSEpjYm4wN1hISmNibHh5WEc1VGJHbGtaWE5vYjNkTmIyUmhiQzV3Y205MGIzUjVjR1V1WDI5dVVtVnphWHBsSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdkbUZ5SUNScGJXRm5aU0E5SUhSb2FYTXVYeVJwYldGblpVTnZiblJoYVc1bGNpNW1hVzVrS0Z3aWFXMW5YQ0lwTzF4eVhHNWNjbHh1SUNBZ0lDOHZJRkpsYzJWMElIUm9aU0JqYjI1MFpXNTBKM01nZDJsa2RHaGNjbHh1SUNBZ0lIUm9hWE11WHlSamIyNTBaVzUwTG5kcFpIUm9LRndpWENJcE8xeHlYRzVjY2x4dUlDQWdJQzh2SUVacGJtUWdkR2hsSUhOcGVtVWdiMllnZEdobElHTnZiWEJ2Ym1WdWRITWdkR2hoZENCdVpXVmtJSFJ2SUdKbElHUnBjM0JzWVhsbFpDQnBiaUJoWkdScGRHbHZiaUIwYnlCY2NseHVJQ0FnSUM4dklIUm9aU0JwYldGblpWeHlYRzRnSUNBZ2RtRnlJR052Ym5SeWIyeHpWMmxrZEdnZ1BTQjBhR2x6TGw4a2FXMWhaMlZNWldaMExtOTFkR1Z5VjJsa2RHZ29kSEoxWlNrZ0t5QmNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOGthVzFoWjJWU2FXZG9kQzV2ZFhSbGNsZHBaSFJvS0hSeWRXVXBPMXh5WEc0Z0lDQWdMeThnU0dGamF5Qm1iM0lnYm05M0lDMGdZblZrWjJWMElHWnZjaUF5ZUNCMGFHVWdZMkZ3ZEdsdmJpQm9aV2xuYUhRdUlGeHlYRzRnSUNBZ2RtRnlJR05oY0hScGIyNUlaV2xuYUhRZ1BTQXlJQ29nZEdocGN5NWZKR05oY0hScGIyNHViM1YwWlhKSVpXbG5hSFFvZEhKMVpTazdJRnh5WEc0Z0lDQWdMeThnZG1GeUlHbHRZV2RsVUdGa1pHbHVaeUE5SUNScGJXRm5aUzVwYm01bGNsZHBaSFJvS0NrN1hISmNibHh5WEc0Z0lDQWdMeThnUTJGc1kzVnNZWFJsSUhSb1pTQmhkbUZwYkdGaWJHVWdZWEpsWVNCbWIzSWdkR2hsSUcxdlpHRnNYSEpjYmlBZ0lDQjJZWElnYlhjZ1BTQjBhR2x6TGw4a2JXOWtZV3d1ZDJsa2RHZ29LU0F0SUdOdmJuUnliMnh6VjJsa2RHZzdYSEpjYmlBZ0lDQjJZWElnYldnZ1BTQjBhR2x6TGw4a2JXOWtZV3d1YUdWcFoyaDBLQ2tnTFNCallYQjBhVzl1U0dWcFoyaDBPMXh5WEc1Y2NseHVJQ0FnSUM4dklFWnBkQ0IwYUdVZ2FXMWhaMlVnZEc4Z2RHaGxJSEpsYldGcGJtbHVaeUJ6WTNKbFpXNGdjbVZoYkNCbGMzUmhkR1VnWEhKY2JpQWdJQ0IyWVhJZ2MyVjBVMmw2WlNBOUlHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJQ0FnSUNCMllYSWdhWGNnUFNBa2FXMWhaMlV1Y0hKdmNDaGNJbTVoZEhWeVlXeFhhV1IwYUZ3aUtUdGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ2FXZ2dQU0FrYVcxaFoyVXVjSEp2Y0NoY0ltNWhkSFZ5WVd4SVpXbG5hSFJjSWlrN1hISmNiaUFnSUNBZ0lDQWdkbUZ5SUhOM0lEMGdhWGNnTHlCdGR6dGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ2MyZ2dQU0JwYUNBdklHMW9PMXh5WEc0Z0lDQWdJQ0FnSUhaaGNpQnpJRDBnVFdGMGFDNXRZWGdvYzNjc0lITm9LVHRjY2x4dVhISmNiaUFnSUNBZ0lDQWdMeThnVTJWMElIZHBaSFJvTDJobGFXZG9kQ0IxYzJsdVp5QkRVMU1nYVc0Z2IzSmtaWElnZEc4Z2NtVnpjR1ZqZENCaWIzZ3RjMmw2YVc1blhISmNiaUFnSUNBZ0lDQWdhV1lnS0hNZ1BpQXhLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQ1JwYldGblpTNWpjM01vWENKM2FXUjBhRndpTENCcGR5QXZJSE1nS3lCY0luQjRYQ0lwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrYVcxaFoyVXVZM056S0Z3aWFHVnBaMmgwWENJc0lHbG9JQzhnY3lBcklGd2ljSGhjSWlrN1hISmNiaUFnSUNBZ0lDQWdmU0JsYkhObElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0pHbHRZV2RsTG1OemN5aGNJbmRwWkhSb1hDSXNJR2wzSUNzZ1hDSndlRndpS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSkdsdFlXZGxMbU56Y3loY0ltaGxhV2RvZEZ3aUxDQnBhQ0FySUZ3aWNIaGNJaWs3WEhKY2JpQWdJQ0FnSUNBZ2ZWeHlYRzVjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDhrYVcxaFoyVlNhV2RvZEM1amMzTW9YQ0owYjNCY0lpd2dKR2x0WVdkbExtOTFkR1Z5U0dWcFoyaDBLQ2tnTHlBeUlDc2dYQ0p3ZUZ3aUtUdGNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOGthVzFoWjJWTVpXWjBMbU56Y3loY0luUnZjRndpTENBa2FXMWhaMlV1YjNWMFpYSklaV2xuYUhRb0tTQXZJRElnS3lCY0luQjRYQ0lwTzF4eVhHNWNjbHh1SUNBZ0lDQWdJQ0F2THlCVFpYUWdkR2hsSUdOdmJuUmxiblFnZDNKaGNIQmxjaUIwYnlCaVpTQjBhR1VnZDJsa2RHZ2diMllnZEdobElHbHRZV2RsTGlCVWFHbHpJSGRwYkd3Z2EyVmxjQ0JjY2x4dUlDQWdJQ0FnSUNBdkx5QjBhR1VnWTJGd2RHbHZiaUJtY205dElHVjRjR0Z1WkdsdVp5QmlaWGx2Ym1RZ2RHaGxJR2x0WVdkbExseHlYRzRnSUNBZ0lDQWdJSFJvYVhNdVh5UmpiMjUwWlc1MExuZHBaSFJvS0NScGJXRm5aUzV2ZFhSbGNsZHBaSFJvS0hSeWRXVXBLVHNnSUNBZ0lDQWdJRnh5WEc0Z0lDQWdmUzVpYVc1a0tIUm9hWE1wTzF4eVhHNWNjbHh1SUNBZ0lHbG1JQ2drYVcxaFoyVXVjSEp2Y0NoY0ltTnZiWEJzWlhSbFhDSXBLU0J6WlhSVGFYcGxLQ2s3WEhKY2JpQWdJQ0JsYkhObElDUnBiV0ZuWlM1dmJtVW9YQ0pzYjJGa1hDSXNJSE5sZEZOcGVtVXBPMXh5WEc1OU8xeHlYRzRpTENKMllYSWdVMnhwWkdWemFHOTNUVzlrWVd3Z1BTQnlaWEYxYVhKbEtGd2lMaTl6Ykdsa1pYTm9iM2N0Ylc5a1lXd3Vhbk5jSWlrN1hISmNiblpoY2lCVWFIVnRZbTVoYVd4VGJHbGtaWElnUFNCeVpYRjFhWEpsS0Z3aUxpOTBhSFZ0WW01aGFXd3RjMnhwWkdWeUxtcHpYQ0lwTzF4eVhHNWNjbHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0I3WEhKY2JpQWdJQ0JwYm1sME9pQm1kVzVqZEdsdmJpaDBjbUZ1YzJsMGFXOXVSSFZ5WVhScGIyNHBJSHRjY2x4dUlDQWdJQ0FnSUNCMGNtRnVjMmwwYVc5dVJIVnlZWFJwYjI0Z1BTQW9kSEpoYm5OcGRHbHZia1IxY21GMGFXOXVJQ0U5UFNCMWJtUmxabWx1WldRcElEOWNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RISmhibk5wZEdsdmJrUjFjbUYwYVc5dUlEb2dOREF3TzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WDNOc2FXUmxjMmh2ZDNNZ1BTQmJYVHRjY2x4dUlDQWdJQ0FnSUNBa0tGd2lMbk5zYVdSbGMyaHZkMXdpS1M1bFlXTm9LR1oxYm1OMGFXOXVJQ2hwYm1SbGVDd2daV3hsYldWdWRDa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnYzJ4cFpHVnphRzkzSUQwZ2JtVjNJRk5zYVdSbGMyaHZkeWdrS0dWc1pXMWxiblFwTENCMGNtRnVjMmwwYVc5dVJIVnlZWFJwYjI0cE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl6Ykdsa1pYTm9iM2R6TG5CMWMyZ29jMnhwWkdWemFHOTNLVHRjY2x4dUlDQWdJQ0FnSUNCOUxtSnBibVFvZEdocGN5a3BPMXh5WEc0Z0lDQWdmVnh5WEc1OU8xeHlYRzVjY2x4dVpuVnVZM1JwYjI0Z1UyeHBaR1Z6YUc5M0tDUmpiMjUwWVdsdVpYSXNJSFJ5WVc1emFYUnBiMjVFZFhKaGRHbHZiaWtnZTF4eVhHNGdJQ0FnZEdocGN5NWZkSEpoYm5OcGRHbHZia1IxY21GMGFXOXVJRDBnZEhKaGJuTnBkR2x2YmtSMWNtRjBhVzl1TzF4eVhHNGdJQ0FnZEdocGN5NWZKR052Ym5SaGFXNWxjaUE5SUNSamIyNTBZV2x1WlhJN1hISmNiaUFnSUNCMGFHbHpMbDlwYm1SbGVDQTlJREE3SUM4dklFbHVaR1Y0SUc5bUlITmxiR1ZqZEdWa0lHbHRZV2RsWEhKY2JseHlYRzRnSUNBZ0x5OGdRM0psWVhSbElHTnZiWEJ2Ym1WdWRITmNjbHh1SUNBZ0lIUm9hWE11WDNSb2RXMWlibUZwYkZOc2FXUmxjaUE5SUc1bGR5QlVhSFZ0WW01aGFXeFRiR2xrWlhJb0pHTnZiblJoYVc1bGNpd2dkR2hwY3lrN1hISmNiaUFnSUNCMGFHbHpMbDl0YjJSaGJDQTlJRzVsZHlCVGJHbGtaWE5vYjNkTmIyUmhiQ2drWTI5dWRHRnBibVZ5TENCMGFHbHpLVHRjY2x4dVhISmNiaUFnSUNBdkx5QkRZV05vWlNCaGJtUWdZM0psWVhSbElHNWxZMlZ6YzJGeWVTQkVUMDBnWld4bGJXVnVkSE1nSUNCY2NseHVJQ0FnSUhSb2FYTXVYeVJqWVhCMGFXOXVRMjl1ZEdGcGJtVnlJRDBnSkdOdmJuUmhhVzVsY2k1bWFXNWtLRndpTG1OaGNIUnBiMjVjSWlrN1hISmNiaUFnSUNCMGFHbHpMbDhrYzJWc1pXTjBaV1JKYldGblpVTnZiblJoYVc1bGNpQTlJQ1JqYjI1MFlXbHVaWEl1Wm1sdVpDaGNJaTV6Wld4bFkzUmxaQzFwYldGblpWd2lLVHRjY2x4dVhISmNiaUFnSUNBdkx5QlBjR1Z1SUcxdlpHRnNJRzl1SUdOc2FXTnJhVzVuSUhObGJHVmpkR1ZrSUdsdFlXZGxYSEpjYmlBZ0lDQjBhR2x6TGw4a2MyVnNaV04wWldSSmJXRm5aVU52Ym5SaGFXNWxjaTV2YmloY0ltTnNhV05yWENJc0lHWjFibU4wYVc5dUlDZ3BJSHRjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDl0YjJSaGJDNXZjR1Z1S0hSb2FYTXVYMmx1WkdWNEtUc2dJQ0FnWEhKY2JpQWdJQ0I5TG1KcGJtUW9kR2hwY3lrcE8xeHlYRzVjY2x4dUlDQWdJQzh2SUV4dllXUWdhVzFoWjJWelhISmNiaUFnSUNCMGFHbHpMbDhrWjJGc2JHVnllVWx0WVdkbGN5QTlJSFJvYVhNdVgyeHZZV1JIWVd4c1pYSjVTVzFoWjJWektDazdYSEpjYmlBZ0lDQjBhR2x6TGw5dWRXMUpiV0ZuWlhNZ1BTQjBhR2x6TGw4a1oyRnNiR1Z5ZVVsdFlXZGxjeTVzWlc1bmRHZzdYSEpjYmx4eVhHNGdJQ0FnTHk4Z1UyaHZkeUIwYUdVZ1ptbHljM1FnYVcxaFoyVmNjbHh1SUNBZ0lIUm9hWE11YzJodmQwbHRZV2RsS0RBcE8xeHlYRzU5WEhKY2JseHlYRzVUYkdsa1pYTm9iM2N1Y0hKdmRHOTBlWEJsTG1kbGRFRmpkR2wyWlVsdVpHVjRJRDBnWm5WdVkzUnBiMjRnS0NrZ2UxeHlYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTXVYMmx1WkdWNE8xeHlYRzU5TzF4eVhHNWNjbHh1VTJ4cFpHVnphRzkzTG5CeWIzUnZkSGx3WlM1blpYUk9kVzFKYldGblpYTWdQU0JtZFc1amRHbHZiaUFvS1NCN1hISmNiaUFnSUNCeVpYUjFjbTRnZEdocGN5NWZiblZ0U1cxaFoyVnpPMXh5WEc1OU8xeHlYRzVjY2x4dVUyeHBaR1Z6YUc5M0xuQnliM1J2ZEhsd1pTNW5aWFJIWVd4c1pYSjVTVzFoWjJVZ1BTQm1kVzVqZEdsdmJpQW9hVzVrWlhncElIdGNjbHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMbDhrWjJGc2JHVnllVWx0WVdkbGMxdHBibVJsZUYwN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2N1Y0hKdmRHOTBlWEJsTG1kbGRFTmhjSFJwYjI0Z1BTQm1kVzVqZEdsdmJpQW9hVzVrWlhncElIdGNjbHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMbDhrWjJGc2JHVnllVWx0WVdkbGMxdHBibVJsZUYwdVpHRjBZU2hjSW1OaGNIUnBiMjVjSWlrN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2N1Y0hKdmRHOTBlWEJsTG5Ob2IzZEpiV0ZuWlNBOUlHWjFibU4wYVc5dUlDaHBibVJsZUNrZ2UxeHlYRzRnSUNBZ0x5OGdVbVZ6WlhRZ1lXeHNJR2x0WVdkbGN5QjBieUJwYm5acGMybGliR1VnWVc1a0lHeHZkMlZ6ZENCNkxXbHVaR1Y0TGlCVWFHbHpJR052ZFd4a0lHSmxJSE50WVhKMFpYSXNYSEpjYmlBZ0lDQXZMeUJzYVd0bElFaHZkbVZ5VTJ4cFpHVnphRzkzTENCaGJtUWdiMjVzZVNCeVpYTmxkQ0JsZUdGamRHeDVJSGRvWVhRZ2QyVWdibVZsWkN3Z1luVjBJSGRsSUdGeVpXNG5kQ0JjY2x4dUlDQWdJQzh2SUhkaGMzUnBibWNnZEdoaGRDQnRZVzU1SUdONVkyeGxjeTVjY2x4dUlDQWdJSFJvYVhNdVh5Um5ZV3hzWlhKNVNXMWhaMlZ6TG1admNrVmhZMmdvWm5WdVkzUnBiMjRnS0NSbllXeHNaWEo1U1cxaFoyVXBJSHRjY2x4dUlDQWdJQ0FnSUNBa1oyRnNiR1Z5ZVVsdFlXZGxMbU56Y3loN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUZ3aWVrbHVaR1Y0WENJNklEQXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lGd2liM0JoWTJsMGVWd2lPaUF3WEhKY2JpQWdJQ0FnSUNBZ2ZTazdYSEpjYmlBZ0lDQWdJQ0FnSkdkaGJHeGxjbmxKYldGblpTNTJaV3h2WTJsMGVTaGNJbk4wYjNCY0lpazdJQzh2SUZOMGIzQWdZVzU1SUdGdWFXMWhkR2x2Ym5OY2NseHVJQ0FnSUgwc0lIUm9hWE1wTzF4eVhHNWNjbHh1SUNBZ0lDOHZJRU5oWTJobElISmxabVZ5Wlc1alpYTWdkRzhnZEdobElHeGhjM1FnWVc1a0lHTjFjbkpsYm5RZ2FXMWhaMlZjY2x4dUlDQWdJSFpoY2lBa2JHRnpkRWx0WVdkbElEMGdkR2hwY3k1ZkpHZGhiR3hsY25sSmJXRm5aWE5iZEdocGN5NWZhVzVrWlhoZE8xeHlYRzRnSUNBZ2RtRnlJQ1JqZFhKeVpXNTBTVzFoWjJVZ1BTQjBhR2x6TGw4a1oyRnNiR1Z5ZVVsdFlXZGxjMXRwYm1SbGVGMDdYSEpjYmlBZ0lDQjBhR2x6TGw5cGJtUmxlQ0E5SUdsdVpHVjRPMXh5WEc1Y2NseHVJQ0FnSUM4dklFMWhhMlVnZEdobElHeGhjM1FnYVcxaFoyVWdkbWx6YVhOaWJHVWdZVzVrSUhSb1pXNGdZVzVwYldGMFpTQjBhR1VnWTNWeWNtVnVkQ0JwYldGblpTQnBiblJ2SUhacFpYZGNjbHh1SUNBZ0lDOHZJRzl1SUhSdmNDQnZaaUIwYUdVZ2JHRnpkRnh5WEc0Z0lDQWdKR3hoYzNSSmJXRm5aUzVqYzNNb1hDSjZTVzVrWlhoY0lpd2dNU2s3WEhKY2JpQWdJQ0FrWTNWeWNtVnVkRWx0WVdkbExtTnpjeWhjSW5wSmJtUmxlRndpTENBeUtUdGNjbHh1SUNBZ0lDUnNZWE4wU1cxaFoyVXVZM056S0Z3aWIzQmhZMmwwZVZ3aUxDQXhLVHRjY2x4dUlDQWdJQ1JqZFhKeVpXNTBTVzFoWjJVdWRtVnNiMk5wZEhrb2Uxd2liM0JoWTJsMGVWd2lPaUF4ZlN3Z2RHaHBjeTVmZEhKaGJuTnBkR2x2YmtSMWNtRjBhVzl1TENCY2NseHVJQ0FnSUNBZ0lDQmNJbVZoYzJWSmJrOTFkRkYxWVdSY0lpazdYSEpjYmx4eVhHNGdJQ0FnTHk4Z1EzSmxZWFJsSUhSb1pTQmpZWEIwYVc5dUxDQnBaaUJwZENCbGVHbHpkSE1nYjI0Z2RHaGxJSFJvZFcxaWJtRnBiRnh5WEc0Z0lDQWdkbUZ5SUdOaGNIUnBiMjRnUFNBa1kzVnljbVZ1ZEVsdFlXZGxMbVJoZEdFb1hDSmpZWEIwYVc5dVhDSXBPMXh5WEc0Z0lDQWdhV1lnS0dOaGNIUnBiMjRwSUh0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw4a1kyRndkR2x2YmtOdmJuUmhhVzVsY2k1bGJYQjBlU2dwTzF4eVhHNGdJQ0FnSUNBZ0lDUW9YQ0k4YzNCaGJqNWNJaWt1WVdSa1EyeGhjM01vWENKbWFXZDFjbVV0Ym5WdFltVnlYQ0lwWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQzUwWlhoMEtGd2lSbWxuTGlCY0lpQXJJQ2gwYUdsekxsOXBibVJsZUNBcklERXBJQ3NnWENJNklGd2lLVnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQXVZWEJ3Wlc1a1ZHOG9kR2hwY3k1ZkpHTmhjSFJwYjI1RGIyNTBZV2x1WlhJcE8xeHlYRzRnSUNBZ0lDQWdJQ1FvWENJOGMzQmhiajVjSWlrdVlXUmtRMnhoYzNNb1hDSmpZWEIwYVc5dUxYUmxlSFJjSWlsY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnTG5SbGVIUW9ZMkZ3ZEdsdmJpbGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0xtRndjR1Z1WkZSdktIUm9hWE11WHlSallYQjBhVzl1UTI5dWRHRnBibVZ5S1R0Y2NseHVJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQXZMeUJQWW1wbFkzUWdhVzFoWjJVZ1ptbDBJSEJ2YkhsbWFXeHNJR0p5WldGcmN5QnFVWFZsY25rZ1lYUjBjaWd1TGk0cExDQnpieUJtWVd4c1ltRmpheUIwYnlCcWRYTjBJRnh5WEc0Z0lDQWdMeThnZFhOcGJtY2daV3hsYldWdWRDNXpjbU5jY2x4dUlDQWdJQzh2SUZSUFJFODZJRXhoZW5raFhISmNiaUFnSUNBdkx5QnBaaUFvSkdOMWNuSmxiblJKYldGblpTNW5aWFFvTUNrdWMzSmpJRDA5UFNCY0lsd2lLU0I3WEhKY2JpQWdJQ0F2THlBZ0lDQWdKR04xY25KbGJuUkpiV0ZuWlM1blpYUW9NQ2t1YzNKaklEMGdKR04xY25KbGJuUkpiV0ZuWlM1a1lYUmhLRndpYVcxaFoyVXRkWEpzWENJcE8xeHlYRzRnSUNBZ0x5OGdmVnh5WEc1OU8xeHlYRzVjY2x4dVUyeHBaR1Z6YUc5M0xuQnliM1J2ZEhsd1pTNWZiRzloWkVkaGJHeGxjbmxKYldGblpYTWdQU0JtZFc1amRHbHZiaUFvS1NCN1hISmNiaUFnSUNBdkx5QkRjbVZoZEdVZ1pXMXdkSGtnYVcxaFoyVnpJR2x1SUhSb1pTQm5ZV3hzWlhKNUlHWnZjaUJsWVdOb0lIUm9kVzFpYm1GcGJDNGdWR2hwY3lCb1pXeHdjeUIxY3lCa2IxeHlYRzRnSUNBZ0x5OGdiR0Y2ZVNCc2IyRmthVzVuSUc5bUlHZGhiR3hsY25rZ2FXMWhaMlZ6SUdGdVpDQmhiR3h2ZDNNZ2RYTWdkRzhnWTNKdmMzTXRabUZrWlNCcGJXRm5aWE11WEhKY2JpQWdJQ0IyWVhJZ0pHZGhiR3hsY25sSmJXRm5aWE1nUFNCYlhUdGNjbHh1SUNBZ0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2dkR2hwY3k1ZmRHaDFiV0p1WVdsc1UyeHBaR1Z5TG1kbGRFNTFiVlJvZFcxaWJtRnBiSE1vS1RzZ2FTQXJQU0F4S1NCN1hISmNiaUFnSUNBZ0lDQWdMeThnUjJWMElIUm9aU0IwYUhWdFltNWhhV3dnWld4bGJXVnVkQ0IzYUdsamFDQm9ZWE1nY0dGMGFDQmhibVFnWTJGd2RHbHZiaUJrWVhSaFhISmNiaUFnSUNBZ0lDQWdkbUZ5SUNSMGFIVnRZaUE5SUhSb2FYTXVYM1JvZFcxaWJtRnBiRk5zYVdSbGNpNW5aWFFrVkdoMWJXSnVZV2xzS0drcE8xeHlYRzVjY2x4dUlDQWdJQ0FnSUNBdkx5QkRZV3hqZFd4aGRHVWdkR2hsSUdsa0lHWnliMjBnZEdobElIQmhkR2dnZEc4Z2RHaGxJR3hoY21kbElHbHRZV2RsWEhKY2JpQWdJQ0FnSUNBZ2RtRnlJR3hoY21kbFVHRjBhQ0E5SUNSMGFIVnRZaTVrWVhSaEtGd2liR0Z5WjJVdGNHRjBhRndpS1R0Y2NseHVJQ0FnSUNBZ0lDQjJZWElnYVdRZ1BTQnNZWEpuWlZCaGRHZ3VjM0JzYVhRb1hDSXZYQ0lwTG5CdmNDZ3BMbk53YkdsMEtGd2lMbHdpS1Zzd1hUdGNjbHh1WEhKY2JpQWdJQ0FnSUNBZ0x5OGdRM0psWVhSbElHRWdaMkZzYkdWeWVTQnBiV0ZuWlNCbGJHVnRaVzUwWEhKY2JpQWdJQ0FnSUNBZ2RtRnlJQ1JuWVd4c1pYSjVTVzFoWjJVZ1BTQWtLRndpUEdsdFp6NWNJaXdnZTJsa09pQnBaSDBwWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJQzVqYzNNb2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjRzl6YVhScGIyNDZJRndpWVdKemIyeDFkR1ZjSWl4Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUnZjRG9nWENJd2NIaGNJaXhjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUd4bFpuUTZJRndpTUhCNFhDSXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J2Y0dGamFYUjVPaUF3TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2VrbHVaR1Y0T2lBd1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUgwcFhISmNiaUFnSUNBZ0lDQWdJQ0FnSUM1a1lYUmhLRndpYVcxaFoyVXRkWEpzWENJc0lHeGhjbWRsVUdGMGFDa2dJQ0FnSUNBZ0lDQWdJQ0JjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdMbVJoZEdFb1hDSmpZWEIwYVc5dVhDSXNJQ1IwYUhWdFlpNWtZWFJoS0Z3aVkyRndkR2x2Ymx3aUtTbGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0xtRndjR1Z1WkZSdktIUm9hWE11WHlSelpXeGxZM1JsWkVsdFlXZGxRMjl1ZEdGcGJtVnlLVHRjY2x4dUlDQWdJQ0FnSUNBa1oyRnNiR1Z5ZVVsdFlXZGxMbWRsZENnd0tTNXpjbU1nUFNCc1lYSm5aVkJoZEdnN0lDOHZJRlJQUkU4NklFMWhhMlVnZEdocGN5QnNZWHA1SVZ4eVhHNGdJQ0FnSUNBZ0lDUm5ZV3hzWlhKNVNXMWhaMlZ6TG5CMWMyZ29KR2RoYkd4bGNubEpiV0ZuWlNrN1hISmNiaUFnSUNCOVhISmNiaUFnSUNCeVpYUjFjbTRnSkdkaGJHeGxjbmxKYldGblpYTTdYSEpjYm4wN0lpd2liVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQlVhSFZ0WW01aGFXeFRiR2xrWlhJN1hISmNibHh5WEc1bWRXNWpkR2x2YmlCVWFIVnRZbTVoYVd4VGJHbGtaWElvSkdOdmJuUmhhVzVsY2l3Z2MyeHBaR1Z6YUc5M0tTQjdYSEpjYmlBZ0lDQjBhR2x6TGw4a1kyOXVkR0ZwYm1WeUlEMGdKR052Ym5SaGFXNWxjanRjY2x4dUlDQWdJSFJvYVhNdVgzTnNhV1JsYzJodmR5QTlJSE5zYVdSbGMyaHZkenRjY2x4dVhISmNiaUFnSUNCMGFHbHpMbDlwYm1SbGVDQTlJREE3SUM4dklFbHVaR1Y0SUc5bUlITmxiR1ZqZEdWa0lIUm9kVzFpYm1GcGJGeHlYRzRnSUNBZ2RHaHBjeTVmYzJOeWIyeHNTVzVrWlhnZ1BTQXdPeUF2THlCSmJtUmxlQ0J2WmlCMGFHVWdkR2gxYldKdVlXbHNJSFJvWVhRZ2FYTWdZM1Z5Y21WdWRHeDVJR05sYm5SbGNtVmtYSEpjYmx4eVhHNGdJQ0FnTHk4Z1EyRmphR1VnWVc1a0lHTnlaV0YwWlNCdVpXTmxjM05oY25rZ1JFOU5JR1ZzWlcxbGJuUnpYSEpjYmlBZ0lDQjBhR2x6TGw4a2RHaDFiV0p1WVdsc1EyOXVkR0ZwYm1WeUlEMGdKR052Ym5SaGFXNWxjaTVtYVc1a0tGd2lMblJvZFcxaWJtRnBiSE5jSWlrN1hISmNiaUFnSUNCMGFHbHpMbDhrZEdoMWJXSnVZV2xzU1cxaFoyVnpJRDBnZEdocGN5NWZKSFJvZFcxaWJtRnBiRU52Ym5SaGFXNWxjaTVtYVc1a0tGd2lhVzFuWENJcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkhacGMybGliR1ZVYUhWdFltNWhhV3hYY21Gd0lEMGdKR052Ym5SaGFXNWxjaTVtYVc1a0tGd2lMblpwYzJsaWJHVXRkR2gxYldKdVlXbHNjMXdpS1R0Y2NseHVJQ0FnSUhSb2FYTXVYeVJoWkhaaGJtTmxUR1ZtZENBOUlDUmpiMjUwWVdsdVpYSXVabWx1WkNoY0lpNTBhSFZ0WW01aGFXd3RZV1IyWVc1alpTMXNaV1owWENJcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkdGa2RtRnVZMlZTYVdkb2RDQTlJQ1JqYjI1MFlXbHVaWEl1Wm1sdVpDaGNJaTUwYUhWdFltNWhhV3d0WVdSMllXNWpaUzF5YVdkb2RGd2lLVHRjY2x4dVhISmNiaUFnSUNBdkx5Qk1iMjl3SUhSb2NtOTFaMmdnZEdobElIUm9kVzFpYm1GcGJITXNJR2RwZG1VZ2RHaGxiU0JoYmlCcGJtUmxlQ0JrWVhSaElHRjBkSEpwWW5WMFpTQmhibVFnWTJGamFHVmNjbHh1SUNBZ0lDOHZJR0VnY21WbVpYSmxibU5sSUhSdklIUm9aVzBnYVc0Z1lXNGdZWEp5WVhsY2NseHVJQ0FnSUhSb2FYTXVYeVIwYUhWdFltNWhhV3h6SUQwZ1cxMDdYSEpjYmlBZ0lDQjBhR2x6TGw4a2RHaDFiV0p1WVdsc1NXMWhaMlZ6TG1WaFkyZ29ablZ1WTNScGIyNGdLR2x1WkdWNExDQmxiR1Z0Wlc1MEtTQjdYSEpjYmlBZ0lDQWdJQ0FnZG1GeUlDUjBhSFZ0WW01aGFXd2dQU0FrS0dWc1pXMWxiblFwTzF4eVhHNGdJQ0FnSUNBZ0lDUjBhSFZ0WW01aGFXd3VaR0YwWVNoY0ltbHVaR1Y0WENJc0lHbHVaR1Y0S1R0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw4a2RHaDFiV0p1WVdsc2N5NXdkWE5vS0NSMGFIVnRZbTVoYVd3cE8xeHlYRzRnSUNBZ2ZTNWlhVzVrS0hSb2FYTXBLVHRjY2x4dUlDQWdJSFJvYVhNdVgyNTFiVWx0WVdkbGN5QTlJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeHpMbXhsYm1kMGFEdGNjbHh1WEhKY2JpQWdJQ0F2THlCTVpXWjBMM0pwWjJoMElHTnZiblJ5YjJ4elhISmNiaUFnSUNCMGFHbHpMbDhrWVdSMllXNWpaVXhsWm5RdWIyNG9YQ0pqYkdsamExd2lMQ0IwYUdsekxtRmtkbUZ1WTJWTVpXWjBMbUpwYm1Rb2RHaHBjeWtwTzF4eVhHNGdJQ0FnZEdocGN5NWZKR0ZrZG1GdVkyVlNhV2RvZEM1dmJpaGNJbU5zYVdOclhDSXNJSFJvYVhNdVlXUjJZVzVqWlZKcFoyaDBMbUpwYm1Rb2RHaHBjeWtwTzF4eVhHNWNjbHh1SUNBZ0lDOHZJRU5zYVdOcmFXNW5JR0VnZEdoMWJXSnVZV2xzWEhKY2JpQWdJQ0IwYUdsekxsOGtkR2gxYldKdVlXbHNTVzFoWjJWekxtOXVLRndpWTJ4cFkydGNJaXdnZEdocGN5NWZiMjVEYkdsamF5NWlhVzVrS0hSb2FYTXBLVHRjY2x4dVhISmNiaUFnSUNCMGFHbHpMbDloWTNScGRtRjBaVlJvZFcxaWJtRnBiQ2d3S1R0Y2NseHVYSEpjYmlBZ0lDQXZMeUJTWlhOcGVtVmNjbHh1SUNBZ0lDUW9kMmx1Wkc5M0tTNXZiaWhjSW5KbGMybDZaVndpTENCMGFHbHpMbDl2YmxKbGMybDZaUzVpYVc1a0tIUm9hWE1wS1R0Y2NseHVYSEpjYmlBZ0lDQXZMeUJHYjNJZ2MyOXRaU0J5WldGemIyNHNJSFJvWlNCemFYcHBibWNnYjI0Z2RHaGxJR052Ym5SeWIyeHpJR2x6SUcxbGMzTmxaQ0IxY0NCcFppQnBkQ0J5ZFc1elhISmNiaUFnSUNBdkx5QnBiVzFsWkdsaGRHVnNlU0F0SUdSbGJHRjVJSE5wZW1sdVp5QjFiblJwYkNCemRHRmpheUJwY3lCamJHVmhjbHh5WEc0Z0lDQWdjMlYwVkdsdFpXOTFkQ2htZFc1amRHbHZiaUFvS1NCN1hISmNiaUFnSUNBZ0lDQWdkR2hwY3k1ZmIyNVNaWE5wZW1Vb0tUdGNjbHh1SUNBZ0lIMHVZbWx1WkNoMGFHbHpLU3dnTUNrN1hISmNibjFjY2x4dVhISmNibFJvZFcxaWJtRnBiRk5zYVdSbGNpNXdjbTkwYjNSNWNHVXVaMlYwUVdOMGFYWmxTVzVrWlhnZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEhKY2JpQWdJQ0J5WlhSMWNtNGdkR2hwY3k1ZmFXNWtaWGc3WEhKY2JuMDdYSEpjYmx4eVhHNVVhSFZ0WW01aGFXeFRiR2xrWlhJdWNISnZkRzkwZVhCbExtZGxkRTUxYlZSb2RXMWlibUZwYkhNZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEhKY2JpQWdJQ0J5WlhSMWNtNGdkR2hwY3k1ZmJuVnRTVzFoWjJWek8xeHlYRzU5TzF4eVhHNWNjbHh1VkdoMWJXSnVZV2xzVTJ4cFpHVnlMbkJ5YjNSdmRIbHdaUzVuWlhRa1ZHaDFiV0p1WVdsc0lEMGdablZ1WTNScGIyNGdLR2x1WkdWNEtTQjdYSEpjYmlBZ0lDQnlaWFIxY200Z2RHaHBjeTVmSkhSb2RXMWlibUZwYkhOYmFXNWtaWGhkTzF4eVhHNTlPMXh5WEc1Y2NseHVWR2gxYldKdVlXbHNVMnhwWkdWeUxuQnliM1J2ZEhsd1pTNWhaSFpoYm1ObFRHVm1kQ0E5SUdaMWJtTjBhVzl1SUNncElIdGNjbHh1SUNBZ0lIWmhjaUJ1WlhkSmJtUmxlQ0E5SUhSb2FYTXVYM05qY205c2JFbHVaR1Y0SUMwZ2RHaHBjeTVmYm5WdFZtbHphV0pzWlR0Y2NseHVJQ0FnSUc1bGQwbHVaR1Y0SUQwZ1RXRjBhQzV0WVhnb2JtVjNTVzVrWlhnc0lEQXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZmMyTnliMnhzVkc5VWFIVnRZbTVoYVd3b2JtVjNTVzVrWlhncE8xeHlYRzU5TzF4eVhHNWNjbHh1VkdoMWJXSnVZV2xzVTJ4cFpHVnlMbkJ5YjNSdmRIbHdaUzVoWkhaaGJtTmxVbWxuYUhRZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEhKY2JpQWdJQ0IyWVhJZ2JtVjNTVzVrWlhnZ1BTQjBhR2x6TGw5elkzSnZiR3hKYm1SbGVDQXJJSFJvYVhNdVgyNTFiVlpwYzJsaWJHVTdYSEpjYmlBZ0lDQnVaWGRKYm1SbGVDQTlJRTFoZEdndWJXbHVLRzVsZDBsdVpHVjRMQ0IwYUdsekxsOXVkVzFKYldGblpYTWdMU0F4S1R0Y2NseHVJQ0FnSUhSb2FYTXVYM05qY205c2JGUnZWR2gxYldKdVlXbHNLRzVsZDBsdVpHVjRLVHRjY2x4dWZUdGNjbHh1WEhKY2JsUm9kVzFpYm1GcGJGTnNhV1JsY2k1d2NtOTBiM1I1Y0dVdVgzSmxjMlYwVTJsNmFXNW5JRDBnWm5WdVkzUnBiMjRnS0NrZ2UxeHlYRzRnSUNBZ0x5OGdVbVZ6WlhRZ2MybDZhVzVuSUhaaGNtbGhZbXhsY3k0Z1ZHaHBjeUJwYm1Oc2RXUmxjeUJ5WlhObGRIUnBibWNnWVc1NUlHbHViR2x1WlNCemRIbHNaU0IwYUdGMElHaGhjMXh5WEc0Z0lDQWdMeThnWW1WbGJpQmhjSEJzYVdWa0xDQnpieUIwYUdGMElHRnVlU0J6YVhwbElHTmhiR04xYkdGMGFXOXVjeUJqWVc0Z1ltVWdZbUZ6WldRZ2IyNGdkR2hsSUVOVFUxeHlYRzRnSUNBZ0x5OGdjM1I1YkdsdVp5NWNjbHh1SUNBZ0lIUm9hWE11WHlSMGFIVnRZbTVoYVd4RGIyNTBZV2x1WlhJdVkzTnpLSHRjY2x4dUlDQWdJQ0FnSUNCMGIzQTZJRndpWENJc0lHeGxablE2SUZ3aVhDSXNJSGRwWkhSb09pQmNJbHdpTENCb1pXbG5hSFE2SUZ3aVhDSmNjbHh1SUNBZ0lIMHBPMXh5WEc0Z0lDQWdkR2hwY3k1ZkpIWnBjMmxpYkdWVWFIVnRZbTVoYVd4WGNtRndMbmRwWkhSb0tGd2lYQ0lwTzF4eVhHNGdJQ0FnZEdocGN5NWZKSFpwYzJsaWJHVlVhSFZ0WW01aGFXeFhjbUZ3TG1obGFXZG9kQ2hjSWx3aUtUdGNjbHh1SUNBZ0lDOHZJRTFoYTJVZ1lXeHNJSFJvZFcxaWJtRnBiSE1nYzNGMVlYSmxJR0Z1WkNCeVpYTmxkQ0JoYm5rZ2FHVnBaMmgwWEhKY2JpQWdJQ0IwYUdsekxsOGtkR2gxYldKdVlXbHNjeTVtYjNKRllXTm9LR1oxYm1OMGFXOXVJQ2drWld4bGJXVnVkQ2tnZXlCY2NseHVJQ0FnSUNBZ0lDQWtaV3hsYldWdWRDNW9aV2xuYUhRb1hDSmNJaWs3SUM4dklGSmxjMlYwSUdobGFXZG9kQ0JpWldadmNtVWdjMlYwZEdsdVp5QjNhV1IwYUZ4eVhHNGdJQ0FnSUNBZ0lDUmxiR1Z0Wlc1MExuZHBaSFJvS0NSbGJHVnRaVzUwTG1obGFXZG9kQ2dwS1R0Y2NseHVJQ0FnSUgwcE8xeHlYRzU5TzF4eVhHNWNjbHh1VkdoMWJXSnVZV2xzVTJ4cFpHVnlMbkJ5YjNSdmRIbHdaUzVmYjI1U1pYTnBlbVVnUFNCbWRXNWpkR2x2YmlBb0tTQjdYSEpjYmlBZ0lDQjBhR2x6TGw5eVpYTmxkRk5wZW1sdVp5Z3BPMXh5WEc1Y2NseHVJQ0FnSUM4dklFTmhiR04xYkdGMFpTQjBhR1VnYzJsNlpTQnZaaUIwYUdVZ1ptbHljM1FnZEdoMWJXSnVZV2xzTGlCVWFHbHpJR0Z6YzNWdFpYTWdkR2hsSUdacGNuTjBJR2x0WVdkbFhISmNiaUFnSUNBdkx5QnZibXg1SUdoaGN5QmhJSEpwWjJoMExYTnBaR1VnYldGeVoybHVMbHh5WEc0Z0lDQWdkbUZ5SUNSbWFYSnpkRlJvZFcxaUlEMGdkR2hwY3k1ZkpIUm9kVzFpYm1GcGJITmJNRjA3WEhKY2JpQWdJQ0IyWVhJZ2RHaDFiV0pUYVhwbElEMGdKR1pwY25OMFZHaDFiV0l1YjNWMFpYSklaV2xuYUhRb1ptRnNjMlVwTzF4eVhHNGdJQ0FnZG1GeUlIUm9kVzFpVFdGeVoybHVJRDBnTWlBcUlDZ2tabWx5YzNSVWFIVnRZaTV2ZFhSbGNsZHBaSFJvS0hSeWRXVXBJQzBnZEdoMWJXSlRhWHBsS1R0Y2NseHVYSEpjYmlBZ0lDQXZMeUJOWldGemRYSmxJR052Ym5SeWIyeHpMaUJVYUdWNUlHNWxaV1FnZEc4Z1ltVWdkbWx6YVdKc1pTQnBiaUJ2Y21SbGNpQjBieUJpWlNCdFpXRnpkWEpsWkM1Y2NseHVJQ0FnSUhSb2FYTXVYeVJoWkhaaGJtTmxVbWxuYUhRdVkzTnpLRndpWkdsemNHeGhlVndpTENCY0ltSnNiMk5yWENJcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkdGa2RtRnVZMlZNWldaMExtTnpjeWhjSW1ScGMzQnNZWGxjSWl3Z1hDSmliRzlqYTF3aUtUdGNjbHh1SUNBZ0lIWmhjaUIwYUhWdFlrTnZiblJ5YjJ4WGFXUjBhQ0E5SUhSb2FYTXVYeVJoWkhaaGJtTmxVbWxuYUhRdWIzVjBaWEpYYVdSMGFDaDBjblZsS1NBclhISmNiaUFnSUNBZ0lDQWdkR2hwY3k1ZkpHRmtkbUZ1WTJWTVpXWjBMbTkxZEdWeVYybGtkR2dvZEhKMVpTazdYSEpjYmx4eVhHNGdJQ0FnTHk4Z1EyRnNZM1ZzWVhSbElHaHZkeUJ0WVc1NUlHWjFiR3dnZEdoMWJXSnVZV2xzY3lCallXNGdabWwwSUhkcGRHaHBiaUIwYUdVZ2RHaDFiV0p1WVdsc0lHRnlaV0ZjY2x4dUlDQWdJSFpoY2lCMmFYTnBZbXhsVjJsa2RHZ2dQU0IwYUdsekxsOGtkbWx6YVdKc1pWUm9kVzFpYm1GcGJGZHlZWEF1YjNWMFpYSlhhV1IwYUNobVlXeHpaU2s3WEhKY2JpQWdJQ0IyWVhJZ2JuVnRWR2gxYldKelZtbHphV0pzWlNBOUlFMWhkR2d1Wm14dmIzSW9YSEpjYmlBZ0lDQWdJQ0FnS0hacGMybGliR1ZYYVdSMGFDQXRJSFJvZFcxaVRXRnlaMmx1S1NBdklDaDBhSFZ0WWxOcGVtVWdLeUIwYUhWdFlrMWhjbWRwYmlsY2NseHVJQ0FnSUNrN1hISmNibHh5WEc0Z0lDQWdMeThnUTJobFkyc2dkMmhsZEdobGNpQmhiR3dnZEdobElIUm9kVzFpYm1GcGJITWdZMkZ1SUdacGRDQnZiaUIwYUdVZ2MyTnlaV1Z1SUdGMElHOXVZMlZjY2x4dUlDQWdJR2xtSUNodWRXMVVhSFZ0WW5OV2FYTnBZbXhsSUR3Z2RHaHBjeTVmYm5WdFNXMWhaMlZ6S1NCN1hISmNiaUFnSUNBZ0lDQWdMeThnVkdGclpTQmhJR0psYzNRZ1ozVmxjM01nWVhRZ2FHOTNJSFJ2SUhOcGVtVWdkR2hsSUhSb2RXMWlibUZwYkhNdUlGTnBlbVVnWm05eWJYVnNZVHBjY2x4dUlDQWdJQ0FnSUNBdkx5QWdkMmxrZEdnZ1BTQnVkVzBnS2lCMGFIVnRZbE5wZW1VZ0t5QW9iblZ0SUMwZ01Ta2dLaUIwYUhWdFlrMWhjbWRwYmlBcklHTnZiblJ5YjJ4VGFYcGxYSEpjYmlBZ0lDQWdJQ0FnTHk4Z1UyOXNkbVVnWm05eUlHNTFiV0psY2lCdlppQjBhSFZ0WW01aGFXeHpJR0Z1WkNCeWIzVnVaQ0IwYnlCMGFHVWdibVZoY21WemRDQnBiblJsWjJWeUlITnZJRnh5WEc0Z0lDQWdJQ0FnSUM4dklIUm9ZWFFnZDJVZ1pHOXVKM1FnYUdGMlpTQmhibmtnY0dGeWRHbGhiQ0IwYUhWdFltNWhhV3h6SUhOb2IzZHBibWN1WEhKY2JpQWdJQ0FnSUNBZ2JuVnRWR2gxYldKelZtbHphV0pzWlNBOUlFMWhkR2d1Y205MWJtUW9YSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDaDJhWE5wWW14bFYybGtkR2dnTFNCMGFIVnRZa052Ym5SeWIyeFhhV1IwYUNBcklIUm9kVzFpVFdGeVoybHVLU0F2SUZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FvZEdoMWJXSlRhWHBsSUNzZ2RHaDFiV0pOWVhKbmFXNHBYSEpjYmlBZ0lDQWdJQ0FnS1R0Y2NseHVYSEpjYmlBZ0lDQWdJQ0FnTHk4Z1ZYTmxJSFJvYVhNZ2JuVnRZbVZ5SUc5bUlIUm9kVzFpYm1GcGJITWdkRzhnWTJGc1kzVnNZWFJsSUhSb1pTQjBhSFZ0WW01aGFXd2djMmw2WlZ4eVhHNGdJQ0FnSUNBZ0lIWmhjaUJ1WlhkVGFYcGxJRDBnS0hacGMybGliR1ZYYVdSMGFDQXRJSFJvZFcxaVEyOXVkSEp2YkZkcFpIUm9JQ3NnZEdoMWJXSk5ZWEpuYVc0cElDOGdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHNTFiVlJvZFcxaWMxWnBjMmxpYkdVZ0xTQjBhSFZ0WWsxaGNtZHBianRjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDhrZEdoMWJXSnVZV2xzY3k1bWIzSkZZV05vS0daMWJtTjBhVzl1SUNna1pXeGxiV1Z1ZENrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5QWtMbmRwWkhSb0lHRnVaQ0FrTG1obGFXZG9kQ0J6WlhRZ2RHaGxJR052Ym5SbGJuUWdjMmw2WlNCeVpXZGhjbVJzWlhOeklHOW1JSFJvWlNCY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1ltOTRMWE5wZW1sdVp5NGdWR2hsSUdsdFlXZGxjeUJoY21VZ1ltOXlaR1Z5TFdKdmVDd2djMjhnZDJVZ2QyRnVkQ0IwYUdVZ1ExTlRJSGRwWkhSb1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUM4dklHRnVaQ0JvWldsbmFIUXVJRlJvYVhNZ1lXeHNiM2R6SUhSb1pTQmhZM1JwZG1VZ2FXMWhaMlVnZEc4Z2FHRjJaU0JoSUdKdmNtUmxjaUJoYm1RZ2RHaGxYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJRzkwYUdWeUlHbHRZV2RsY3lCMGJ5Qm9ZWFpsSUhCaFpHUnBibWN1SUZ4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0FrWld4bGJXVnVkQzVqYzNNb1hDSjNhV1IwYUZ3aUxDQnVaWGRUYVhwbElDc2dYQ0p3ZUZ3aUtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0pHVnNaVzFsYm5RdVkzTnpLRndpYUdWcFoyaDBYQ0lzSUc1bGQxTnBlbVVnS3lCY0luQjRYQ0lwTzF4eVhHNGdJQ0FnSUNBZ0lIMHBPMXh5WEc1Y2NseHVJQ0FnSUNBZ0lDQXZMeUJUWlhRZ2RHaGxJSFJvZFcxaWJtRnBiQ0IzY21Gd0lITnBlbVV1SUVsMElITm9iM1ZzWkNCaVpTQnFkWE4wSUhSaGJHd2daVzV2ZFdkb0lIUnZJR1pwZENCaFhISmNiaUFnSUNBZ0lDQWdMeThnZEdoMWJXSnVZV2xzSUdGdVpDQnNiMjVuSUdWdWIzVm5hQ0IwYnlCb2IyeGtJR0ZzYkNCMGFHVWdkR2gxYldKdVlXbHNjeUJwYmlCdmJtVWdiR2x1WlRwY2NseHVJQ0FnSUNBZ0lDQjJZWElnZEc5MFlXeFRhWHBsSUQwZ2JtVjNVMmw2WlNBcUlIUm9hWE11WDI1MWJVbHRZV2RsY3lBcklGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFIVnRZazFoY21kcGJpQXFJQ2gwYUdsekxsOXVkVzFKYldGblpYTWdMU0F4S1R0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw4a2RHaDFiV0p1WVdsc1EyOXVkR0ZwYm1WeUxtTnpjeWg3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSGRwWkhSb09pQjBiM1JoYkZOcGVtVWdLeUJjSW5CNFhDSXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHaGxhV2RvZERvZ0pHWnBjbk4wVkdoMWJXSXViM1YwWlhKSVpXbG5hSFFvZEhKMVpTa2dLeUJjSW5CNFhDSmNjbHh1SUNBZ0lDQWdJQ0I5S1R0Y2NseHVYSEpjYmlBZ0lDQWdJQ0FnTHk4Z1UyVjBJSFJvWlNCMmFYTnBZbXhsSUhSb2RXMWlibUZwYkNCM2NtRndJSE5wZW1VdUlGUm9hWE1nYVhNZ2RYTmxaQ0IwYnlCdFlXdHpJSFJvWlNCdGRXTm9JRnh5WEc0Z0lDQWdJQ0FnSUM4dklHeGhjbWRsY2lCMGFIVnRZbTVoYVd3Z1kyOXVkR0ZwYm1WeUxpQkpkQ0J6YUc5MWJHUWdZbVVnWVhNZ2QybGtaU0JoY3lCcGRDQmpZVzRnWW1Vc0lHMXBiblZ6WEhKY2JpQWdJQ0FnSUNBZ0x5OGdkR2hsSUhOd1lXTmxJRzVsWldSbFpDQm1iM0lnZEdobElHeGxablF2Y21sbmFIUWdZMjl1ZEc5c2N5NWNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOGtkbWx6YVdKc1pWUm9kVzFpYm1GcGJGZHlZWEF1WTNOektIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2QybGtkR2c2SUhacGMybGliR1ZYYVdSMGFDQXRJSFJvZFcxaVEyOXVkSEp2YkZkcFpIUm9JQ3NnWENKd2VGd2lMRnh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQm9aV2xuYUhRNklDUm1hWEp6ZEZSb2RXMWlMbTkxZEdWeVNHVnBaMmgwS0hSeWRXVXBJQ3NnWENKd2VGd2lYSEpjYmlBZ0lDQWdJQ0FnZlNrN1hISmNiaUFnSUNCOUlHVnNjMlVnZTF4eVhHNGdJQ0FnSUNBZ0lDOHZJRUZzYkNCMGFIVnRZbTVoYVd4eklHRnlaU0IyYVhOcFlteGxMQ0IzWlNCallXNGdhR2xrWlNCMGFHVWdZMjl1ZEhKdmJITWdZVzVrSUdWNGNHRnVaQ0IwYUdWY2NseHVJQ0FnSUNBZ0lDQXZMeUIwYUhWdFltNWhhV3dnWTI5dWRHRnBibVZ5SUhSdklERXdNQ1ZjY2x4dUlDQWdJQ0FnSUNCdWRXMVVhSFZ0WW5OV2FYTnBZbXhsSUQwZ2RHaHBjeTVmYm5WdFNXMWhaMlZ6TzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WHlSMGFIVnRZbTVoYVd4RGIyNTBZV2x1WlhJdVkzTnpLRndpZDJsa2RHaGNJaXdnWENJeE1EQWxYQ0lwTzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WHlSaFpIWmhibU5sVW1sbmFIUXVZM056S0Z3aVpHbHpjR3hoZVZ3aUxDQmNJbTV2Ym1WY0lpazdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZKR0ZrZG1GdVkyVk1aV1owTG1OemN5aGNJbVJwYzNCc1lYbGNJaXdnWENKdWIyNWxYQ0lwTzF4eVhHNGdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lIUm9hWE11WDI1MWJWWnBjMmxpYkdVZ1BTQnVkVzFVYUhWdFluTldhWE5wWW14bE8xeHlYRzRnSUNBZ2RtRnlJRzFwWkdSc1pVbHVaR1Y0SUQwZ1RXRjBhQzVtYkc5dmNpZ29kR2hwY3k1ZmJuVnRWbWx6YVdKc1pTQXRJREVwSUM4Z01pazdYSEpjYmlBZ0lDQjBhR2x6TGw5elkzSnZiR3hDYjNWdVpITWdQU0I3WEhKY2JpQWdJQ0FnSUNBZ2JXbHVPaUJ0YVdSa2JHVkpibVJsZUN4Y2NseHVJQ0FnSUNBZ0lDQnRZWGc2SUhSb2FYTXVYMjUxYlVsdFlXZGxjeUF0SURFZ0xTQnRhV1JrYkdWSmJtUmxlRnh5WEc0Z0lDQWdmVHRjY2x4dUlDQWdJR2xtSUNoMGFHbHpMbDl1ZFcxV2FYTnBZbXhsSUNVZ01pQTlQVDBnTUNrZ2RHaHBjeTVmYzJOeWIyeHNRbTkxYm1SekxtMWhlQ0F0UFNBeE8xeHlYRzVjY2x4dUlDQWdJSFJvYVhNdVgzVndaR0YwWlZSb2RXMWlibUZwYkVOdmJuUnliMnh6S0NrN1hISmNibjA3WEhKY2JseHlYRzVVYUhWdFltNWhhV3hUYkdsa1pYSXVjSEp2ZEc5MGVYQmxMbDloWTNScGRtRjBaVlJvZFcxaWJtRnBiQ0E5SUdaMWJtTjBhVzl1SUNocGJtUmxlQ2tnZTF4eVhHNGdJQ0FnTHk4Z1FXTjBhWFpoZEdVdlpHVmhZM1JwZG1GMFpTQjBhSFZ0WW01aGFXeHpYSEpjYmlBZ0lDQjBhR2x6TGw4a2RHaDFiV0p1WVdsc2MxdDBhR2x6TGw5cGJtUmxlRjB1Y21WdGIzWmxRMnhoYzNNb1hDSmhZM1JwZG1WY0lpazdYSEpjYmlBZ0lDQjBhR2x6TGw4a2RHaDFiV0p1WVdsc2MxdHBibVJsZUYwdVlXUmtRMnhoYzNNb1hDSmhZM1JwZG1WY0lpazdYSEpjYm4wN1hISmNibHh5WEc1VWFIVnRZbTVoYVd4VGJHbGtaWEl1Y0hKdmRHOTBlWEJsTGw5elkzSnZiR3hVYjFSb2RXMWlibUZwYkNBOUlHWjFibU4wYVc5dUlDaHBibVJsZUNrZ2UxeHlYRzRnSUNBZ0x5OGdUbThnYm1WbFpDQjBieUJ6WTNKdmJHd2dhV1lnWVd4c0lIUm9kVzFpYm1GcGJITWdZWEpsSUhacGMybGliR1ZjY2x4dUlDQWdJR2xtSUNoMGFHbHpMbDl1ZFcxV2FYTnBZbXhsSUQwOVBTQjBhR2x6TGw5dWRXMUpiV0ZuWlhNcElISmxkSFZ5Ymp0Y2NseHVYSEpjYmlBZ0lDQXZMeUJEYjI1emRISmhhVzRnYVc1a1pYZ2djMjhnZEdoaGRDQjNaU0JqWVc0bmRDQnpZM0p2Ykd3Z2IzVjBJRzltSUdKdmRXNWtjeUJjY2x4dUlDQWdJR2x1WkdWNElEMGdUV0YwYUM1dFlYZ29hVzVrWlhnc0lIUm9hWE11WDNOamNtOXNiRUp2ZFc1a2N5NXRhVzRwTzF4eVhHNGdJQ0FnYVc1a1pYZ2dQU0JOWVhSb0xtMXBiaWhwYm1SbGVDd2dkR2hwY3k1ZmMyTnliMnhzUW05MWJtUnpMbTFoZUNrN1hISmNiaUFnSUNCMGFHbHpMbDl6WTNKdmJHeEpibVJsZUNBOUlHbHVaR1Y0TzF4eVhHNGdJQ0FnWEhKY2JpQWdJQ0F2THlCR2FXNWtJSFJvWlNCY0lteGxablJjSWlCd2IzTnBkR2x2YmlCdlppQjBhR1VnZEdoMWJXSnVZV2xzSUdOdmJuUmhhVzVsY2lCMGFHRjBJSGR2ZFd4a0lIQjFkQ0IwYUdVZ1hISmNiaUFnSUNBdkx5QjBhSFZ0WW01aGFXd2dZWFFnYVc1a1pYZ2dZWFFnZEdobElHTmxiblJsY2x4eVhHNGdJQ0FnZG1GeUlDUjBhSFZ0WWlBOUlIUm9hWE11WHlSMGFIVnRZbTVoYVd4eld6QmRPMXh5WEc0Z0lDQWdkbUZ5SUhOcGVtVWdQU0J3WVhKelpVWnNiMkYwS0NSMGFIVnRZaTVqYzNNb1hDSjNhV1IwYUZ3aUtTazdYSEpjYmlBZ0lDQjJZWElnYldGeVoybHVJRDBnTWlBcUlIQmhjbk5sUm14dllYUW9KSFJvZFcxaUxtTnpjeWhjSW0xaGNtZHBiaTF5YVdkb2RGd2lLU2s3SUZ4eVhHNGdJQ0FnZG1GeUlHTmxiblJsY2xnZ1BTQnphWHBsSUNvZ2RHaHBjeTVmYzJOeWIyeHNRbTkxYm1SekxtMXBiaUFySUZ4eVhHNGdJQ0FnSUNBZ0lHMWhjbWRwYmlBcUlDaDBhR2x6TGw5elkzSnZiR3hDYjNWdVpITXViV2x1SUMwZ01TazdYSEpjYmlBZ0lDQjJZWElnZEdoMWJXSllJRDBnYzJsNlpTQXFJR2x1WkdWNElDc2diV0Z5WjJsdUlDb2dLR2x1WkdWNElDMGdNU2s3WEhKY2JpQWdJQ0IyWVhJZ2JHVm1kQ0E5SUdObGJuUmxjbGdnTFNCMGFIVnRZbGc3WEhKY2JseHlYRzRnSUNBZ0x5OGdRVzVwYldGMFpTQjBhR1VnZEdoMWJXSnVZV2xzSUdOdmJuUmhhVzVsY2x4eVhHNGdJQ0FnZEdocGN5NWZKSFJvZFcxaWJtRnBiRU52Ym5SaGFXNWxjaTUyWld4dlkybDBlU2hjSW5OMGIzQmNJaWs3WEhKY2JpQWdJQ0IwYUdsekxsOGtkR2gxYldKdVlXbHNRMjl1ZEdGcGJtVnlMblpsYkc5amFYUjVLSHRjY2x4dUlDQWdJQ0FnSUNCY0lteGxablJjSWpvZ2JHVm1kQ0FySUZ3aWNIaGNJbHh5WEc0Z0lDQWdmU3dnTmpBd0xDQmNJbVZoYzJWSmJrOTFkRkYxWVdSY0lpazdYSEpjYmx4eVhHNGdJQ0FnZEdocGN5NWZkWEJrWVhSbFZHaDFiV0p1WVdsc1EyOXVkSEp2YkhNb0tUdGNjbHh1ZlR0Y2NseHVYSEpjYmxSb2RXMWlibUZwYkZOc2FXUmxjaTV3Y205MGIzUjVjR1V1WDI5dVEyeHBZMnNnUFNCbWRXNWpkR2x2YmlBb1pTa2dlMXh5WEc0Z0lDQWdkbUZ5SUNSMFlYSm5aWFFnUFNBa0tHVXVkR0Z5WjJWMEtUdGNjbHh1SUNBZ0lIWmhjaUJwYm1SbGVDQTlJQ1IwWVhKblpYUXVaR0YwWVNoY0ltbHVaR1Y0WENJcE8xeHlYRzRnSUNBZ1hISmNiaUFnSUNBdkx5QkRiR2xqYTJWa0lHOXVJSFJvWlNCaFkzUnBkbVVnYVcxaFoyVWdMU0J1YnlCdVpXVmtJSFJ2SUdSdklHRnVlWFJvYVc1blhISmNiaUFnSUNCcFppQW9kR2hwY3k1ZmFXNWtaWGdnSVQwOUlHbHVaR1Y0S1NCN1hISmNiaUFnSUNBZ0lDQWdkR2hwY3k1ZllXTjBhWFpoZEdWVWFIVnRZbTVoYVd3b2FXNWtaWGdwTzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WDNOamNtOXNiRlJ2VkdoMWJXSnVZV2xzS0dsdVpHVjRLVHRjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDlwYm1SbGVDQTlJR2x1WkdWNE8xeHlYRzRnSUNBZ0lDQWdJSFJvYVhNdVgzTnNhV1JsYzJodmR5NXphRzkzU1cxaFoyVW9hVzVrWlhncE8xeHlYRzRnSUNBZ2ZWeHlYRzU5TzF4eVhHNWNjbHh1VkdoMWJXSnVZV2xzVTJ4cFpHVnlMbkJ5YjNSdmRIbHdaUzVmZFhCa1lYUmxWR2gxYldKdVlXbHNRMjl1ZEhKdmJITWdQU0JtZFc1amRHbHZiaUFvS1NCN1hISmNiaUFnSUNBdkx5QlNaUzFsYm1GaWJHVmNjbHh1SUNBZ0lIUm9hWE11WHlSaFpIWmhibU5sVEdWbWRDNXlaVzF2ZG1WRGJHRnpjeWhjSW1ScGMyRmliR1ZrWENJcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkdGa2RtRnVZMlZTYVdkb2RDNXlaVzF2ZG1WRGJHRnpjeWhjSW1ScGMyRmliR1ZrWENJcE8xeHlYRzRnSUNBZ1hISmNiaUFnSUNBdkx5QkVhWE5oWW14bElHbG1JSGRsSjNabElISmxZV05vWldRZ2RHaGxJSFJvWlNCdFlYZ2diM0lnYldsdUlHeHBiV2wwWEhKY2JpQWdJQ0F2THlCMllYSWdiV2xrVTJOeWIyeHNTVzVrWlhnZ1BTQk5ZWFJvTG1ac2IyOXlLQ2gwYUdsekxsOXVkVzFXYVhOcFlteGxJQzBnTVNrZ0x5QXlLVHRjY2x4dUlDQWdJQzh2SUhaaGNpQnRhVzVUWTNKdmJHeEpibVJsZUNBOUlHMXBaRk5qY205c2JFbHVaR1Y0TzF4eVhHNGdJQ0FnTHk4Z2RtRnlJRzFoZUZOamNtOXNiRWx1WkdWNElEMGdkR2hwY3k1ZmJuVnRTVzFoWjJWeklDMGdNU0F0SUcxcFpGTmpjbTlzYkVsdVpHVjRPMXh5WEc0Z0lDQWdhV1lnS0hSb2FYTXVYM05qY205c2JFbHVaR1Y0SUQ0OUlIUm9hWE11WDNOamNtOXNiRUp2ZFc1a2N5NXRZWGdwSUh0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw4a1lXUjJZVzVqWlZKcFoyaDBMbUZrWkVOc1lYTnpLRndpWkdsellXSnNaV1JjSWlrN1hISmNiaUFnSUNCOUlHVnNjMlVnYVdZZ0tIUm9hWE11WDNOamNtOXNiRWx1WkdWNElEdzlJSFJvYVhNdVgzTmpjbTlzYkVKdmRXNWtjeTV0YVc0cElIdGNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOGtZV1IyWVc1alpVeGxablF1WVdSa1EyeGhjM01vWENKa2FYTmhZbXhsWkZ3aUtUdGNjbHh1SUNBZ0lIMWNjbHh1ZlRzaUxDSmxlSEJ2Y25SekxtUmxabUYxYkhRZ1BTQm1kVzVqZEdsdmJpQW9kbUZzTENCa1pXWmhkV3gwVm1Gc0tTQjdYSEpjYmlBZ0lDQnlaWFIxY200Z0tIWmhiQ0FoUFQwZ2RXNWtaV1pwYm1Wa0tTQS9JSFpoYkNBNklHUmxabUYxYkhSV1lXdzdYSEpjYm4wN1hISmNibHh5WEc0dkx5QlZiblJsYzNSbFpGeHlYRzR2THlCbGVIQnZjblJ6TG1SbFptRjFiSFJRY205d1pYSjBhV1Z6SUQwZ1puVnVZM1JwYjI0Z1pHVm1ZWFZzZEZCeWIzQmxjblJwWlhNZ0tHOWlhaXdnY0hKdmNITXBJSHRjY2x4dUx5OGdJQ0FnSUdadmNpQW9kbUZ5SUhCeWIzQWdhVzRnY0hKdmNITXBJSHRjY2x4dUx5OGdJQ0FnSUNBZ0lDQnBaaUFvY0hKdmNITXVhR0Z6VDNkdVVISnZjR1Z5ZEhrb2NISnZjSE1zSUhCeWIzQXBLU0I3WEhKY2JpOHZJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQjJZV3gxWlNBOUlHVjRjRzl5ZEhNdVpHVm1ZWFZzZEZaaGJIVmxLSEJ5YjNCekxuWmhiSFZsTENCd2NtOXdjeTVrWldaaGRXeDBLVHRjY2x4dUx5OGdJQ0FnSUNBZ0lDQWdJQ0FnYjJKcVczQnliM0JkSUQwZ2RtRnNkV1U3WEhKY2JpOHZJQ0FnSUNBZ0lDQWdmVnh5WEc0dkx5QWdJQ0FnZlZ4eVhHNHZMeUFnSUNBZ2NtVjBkWEp1SUc5aWFqdGNjbHh1THk4Z2ZUdGNjbHh1THk4Z1hISmNibVY0Y0c5eWRITXVkR2x0WlVsMElEMGdablZ1WTNScGIyNGdLR1oxYm1NcElIdGNjbHh1SUNBZ0lIWmhjaUJ6ZEdGeWRDQTlJSEJsY21admNtMWhibU5sTG01dmR5Z3BPMXh5WEc0Z0lDQWdablZ1WXlncE8xeHlYRzRnSUNBZ2RtRnlJR1Z1WkNBOUlIQmxjbVp2Y20xaGJtTmxMbTV2ZHlncE8xeHlYRzRnSUNBZ2NtVjBkWEp1SUdWdVpDQXRJSE4wWVhKME8xeHlYRzU5TzF4eVhHNWNjbHh1Wlhod2IzSjBjeTVwYzBsdVVtVmpkQ0E5SUdaMWJtTjBhVzl1SUNoNExDQjVMQ0J5WldOMEtTQjdYSEpjYmlBZ0lDQnBaaUFvZUNBK1BTQnlaV04wTG5nZ0ppWWdlQ0E4UFNBb2NtVmpkQzU0SUNzZ2NtVmpkQzUzS1NBbUpseHlYRzRnSUNBZ0lDQWdJSGtnUGowZ2NtVmpkQzU1SUNZbUlIa2dQRDBnS0hKbFkzUXVlU0FySUhKbFkzUXVhQ2twSUh0Y2NseHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2RISjFaVHRjY2x4dUlDQWdJSDFjY2x4dUlDQWdJSEpsZEhWeWJpQm1ZV3h6WlR0Y2NseHVmVHRjY2x4dVhISmNibVY0Y0c5eWRITXVjbUZ1WkVsdWRDQTlJR1oxYm1OMGFXOXVJQ2h0YVc0c0lHMWhlQ2tnZTF4eVhHNGdJQ0FnY21WMGRYSnVJRTFoZEdndVpteHZiM0lvVFdGMGFDNXlZVzVrYjIwb0tTQXFJQ2h0WVhnZ0xTQnRhVzRnS3lBeEtTa2dLeUJ0YVc0N1hISmNibjA3WEhKY2JseHlYRzVsZUhCdmNuUnpMbkpoYm1SQmNuSmhlVVZzWlcxbGJuUWdQU0JtZFc1amRHbHZiaUFvWVhKeVlYa3BJSHRjY2x4dUlDQWdJSFpoY2lCcElEMGdaWGh3YjNKMGN5NXlZVzVrU1c1MEtEQXNJR0Z5Y21GNUxteGxibWQwYUNBdElERXBPeUFnSUNCY2NseHVJQ0FnSUhKbGRIVnliaUJoY25KaGVWdHBYVHRjY2x4dWZUdGNjbHh1WEhKY2JtVjRjRzl5ZEhNdWJXRndJRDBnWm5WdVkzUnBiMjRnS0c1MWJTd2diV2x1TVN3Z2JXRjRNU3dnYldsdU1pd2diV0Y0TWl3Z2IzQjBhVzl1Y3lrZ2UxeHlYRzRnSUNBZ2RtRnlJRzFoY0hCbFpDQTlJQ2h1ZFcwZ0xTQnRhVzR4S1NBdklDaHRZWGd4SUMwZ2JXbHVNU2tnS2lBb2JXRjRNaUF0SUcxcGJqSXBJQ3NnYldsdU1qdGNjbHh1SUNBZ0lHbG1JQ2doYjNCMGFXOXVjeWtnY21WMGRYSnVJRzFoY0hCbFpEdGNjbHh1SUNBZ0lHbG1JQ2h2Y0hScGIyNXpMbkp2ZFc1a0lDWW1JRzl3ZEdsdmJuTXVjbTkxYm1RZ1BUMDlJSFJ5ZFdVcElIdGNjbHh1SUNBZ0lDQWdJQ0J0WVhCd1pXUWdQU0JOWVhSb0xuSnZkVzVrS0cxaGNIQmxaQ2s3WEhKY2JpQWdJQ0I5WEhKY2JpQWdJQ0JwWmlBb2IzQjBhVzl1Y3k1bWJHOXZjaUFtSmlCdmNIUnBiMjV6TG1ac2IyOXlJRDA5UFNCMGNuVmxLU0I3WEhKY2JpQWdJQ0FnSUNBZ2JXRndjR1ZrSUQwZ1RXRjBhQzVtYkc5dmNpaHRZWEJ3WldRcE95QWdJQ0FnSUNBZ1hISmNiaUFnSUNCOVhISmNiaUFnSUNCcFppQW9iM0IwYVc5dWN5NWpaV2xzSUNZbUlHOXdkR2x2Ym5NdVkyVnBiQ0E5UFQwZ2RISjFaU2tnZTF4eVhHNGdJQ0FnSUNBZ0lHMWhjSEJsWkNBOUlFMWhkR2d1WTJWcGJDaHRZWEJ3WldRcE95QWdJQ0FnSUNBZ1hISmNiaUFnSUNCOVhISmNiaUFnSUNCcFppQW9iM0IwYVc5dWN5NWpiR0Z0Y0NBbUppQnZjSFJwYjI1ekxtTnNZVzF3SUQwOVBTQjBjblZsS1NCN1hISmNiaUFnSUNBZ0lDQWdiV0Z3Y0dWa0lEMGdUV0YwYUM1dGFXNG9iV0Z3Y0dWa0xDQnRZWGd5S1R0Y2NseHVJQ0FnSUNBZ0lDQnRZWEJ3WldRZ1BTQk5ZWFJvTG0xaGVDaHRZWEJ3WldRc0lHMXBiaklwTzF4eVhHNGdJQ0FnZlZ4eVhHNGdJQ0FnY21WMGRYSnVJRzFoY0hCbFpEdGNjbHh1ZlR0Y2NseHVYSEpjYm1WNGNHOXlkSE11WjJWMFVYVmxjbmxRWVhKaGJXVjBaWEp6SUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh5WEc0Z0lDQWdMeThnUTJobFkyc2dabTl5SUhGMVpYSjVJSE4wY21sdVoxeHlYRzRnSUNBZ2RtRnlJSEZ6SUQwZ2QybHVaRzkzTG14dlkyRjBhVzl1TG5ObFlYSmphRHRjY2x4dUlDQWdJR2xtSUNoeGN5NXNaVzVuZEdnZ1BEMGdNU2tnY21WMGRYSnVJSHQ5TzF4eVhHNGdJQ0FnTHk4Z1VYVmxjbmtnYzNSeWFXNW5JR1Y0YVhOMGN5d2djR0Z5YzJVZ2FYUWdhVzUwYnlCaElIRjFaWEo1SUc5aWFtVmpkRnh5WEc0Z0lDQWdjWE1nUFNCeGN5NXpkV0p6ZEhKcGJtY29NU2s3SUM4dklGSmxiVzkyWlNCMGFHVWdYQ0kvWENJZ1pHVnNhVzFwZEdWeVhISmNiaUFnSUNCMllYSWdhMlY1Vm1Gc1VHRnBjbk1nUFNCeGN5NXpjR3hwZENoY0lpWmNJaWs3WEhKY2JpQWdJQ0IyWVhJZ2NYVmxjbmxQWW1wbFkzUWdQU0I3ZlR0Y2NseHVJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2EyVjVWbUZzVUdGcGNuTXViR1Z1WjNSb095QnBJQ3M5SURFcElIdGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ2EyVjVWbUZzSUQwZ2EyVjVWbUZzVUdGcGNuTmJhVjB1YzNCc2FYUW9YQ0k5WENJcE8xeHlYRzRnSUNBZ0lDQWdJR2xtSUNoclpYbFdZV3d1YkdWdVozUm9JRDA5UFNBeUtTQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJyWlhrZ1BTQmtaV052WkdWVlVrbERiMjF3YjI1bGJuUW9hMlY1Vm1Gc1d6QmRLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUhaaGJDQTlJR1JsWTI5a1pWVlNTVU52YlhCdmJtVnVkQ2hyWlhsV1lXeGJNVjBwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J4ZFdWeWVVOWlhbVZqZEZ0clpYbGRJRDBnZG1Gc08xeHlYRzRnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJSDFjY2x4dUlDQWdJSEpsZEhWeWJpQnhkV1Z5ZVU5aWFtVmpkRHRjY2x4dWZUdGNjbHh1WEhKY2JtVjRjRzl5ZEhNdVkzSmxZWFJsVVhWbGNubFRkSEpwYm1jZ1BTQm1kVzVqZEdsdmJpQW9jWFZsY25sUFltcGxZM1FwSUh0Y2NseHVJQ0FnSUdsbUlDaDBlWEJsYjJZZ2NYVmxjbmxQWW1wbFkzUWdJVDA5SUZ3aWIySnFaV04wWENJcElISmxkSFZ5YmlCY0lsd2lPMXh5WEc0Z0lDQWdkbUZ5SUd0bGVYTWdQU0JQWW1wbFkzUXVhMlY1Y3loeGRXVnllVTlpYW1WamRDazdYSEpjYmlBZ0lDQnBaaUFvYTJWNWN5NXNaVzVuZEdnZ1BUMDlJREFwSUhKbGRIVnliaUJjSWx3aU8xeHlYRzRnSUNBZ2RtRnlJSEYxWlhKNVUzUnlhVzVuSUQwZ1hDSS9YQ0k3WEhKY2JpQWdJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUd0bGVYTXViR1Z1WjNSb095QnBJQ3M5SURFcElIdGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ2EyVjVJRDBnYTJWNWMxdHBYVHRjY2x4dUlDQWdJQ0FnSUNCMllYSWdkbUZzSUQwZ2NYVmxjbmxQWW1wbFkzUmJhMlY1WFR0Y2NseHVJQ0FnSUNBZ0lDQnhkV1Z5ZVZOMGNtbHVaeUFyUFNCbGJtTnZaR1ZWVWtsRGIyMXdiMjVsYm5Rb2EyVjVLU0FySUZ3aVBWd2lJQ3NnWlc1amIyUmxWVkpKUTI5dGNHOXVaVzUwS0haaGJDazdYSEpjYmlBZ0lDQWdJQ0FnYVdZZ0tHa2dJVDA5SUd0bGVYTXViR1Z1WjNSb0lDMGdNU2tnY1hWbGNubFRkSEpwYm1jZ0t6MGdYQ0ltWENJN1hISmNiaUFnSUNCOVhISmNiaUFnSUNCeVpYUjFjbTRnY1hWbGNubFRkSEpwYm1jN1hISmNibjA3WEhKY2JseHlYRzVsZUhCdmNuUnpMbmR5WVhCSmJtUmxlQ0E5SUdaMWJtTjBhVzl1SUNocGJtUmxlQ3dnYkdWdVozUm9LU0I3WEhKY2JpQWdJQ0IyWVhJZ2QzSmhjSEJsWkVsdVpHVjRJRDBnS0dsdVpHVjRJQ1VnYkdWdVozUm9LVHNnWEhKY2JpQWdJQ0JwWmlBb2QzSmhjSEJsWkVsdVpHVjRJRHdnTUNrZ2UxeHlYRzRnSUNBZ0lDQWdJQzh2SUVsbUlHNWxaMkYwYVhabExDQm1iR2x3SUhSb1pTQnBibVJsZUNCemJ5QjBhR0YwSUMweElHSmxZMjl0WlhNZ2RHaGxJR3hoYzNRZ2FYUmxiU0JwYmlCc2FYTjBJRnh5WEc0Z0lDQWdJQ0FnSUhkeVlYQndaV1JKYm1SbGVDQTlJR3hsYm1kMGFDQXJJSGR5WVhCd1pXUkpibVJsZUR0Y2NseHVJQ0FnSUgxY2NseHVJQ0FnSUhKbGRIVnliaUIzY21Gd2NHVmtTVzVrWlhnN1hISmNibjA3WEhKY2JpSmRmUT09In0=
