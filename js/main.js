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
  this._slideshowDelay = slideshowDelay !== undefined ? slideshowDelay : 2000;
  this._transitionDuration = transitionDuration !== undefined ? transitionDuration : 1000;

  this._slideshows = [];
  this.reload();
}

HoverSlideshows.prototype.reload = function() {
  // Note: this is currently not really being used. When a page is loaded,
  // main.js is just re-instancing the HoverSlideshows
  var oldSlideshows = this._slideshows || [];
  this._slideshows = [];
  $(".hover-slideshow").each(
    function(_, element) {
      var $element = $(element);
      var index = this._findInSlideshows(element, oldSlideshows);
      if (index !== -1) {
        var slideshow = oldSlideshows.splice(index, 1)[0];
        this._slideshows.push(slideshow);
      } else {
        this._slideshows.push(
          new Slideshow($element, this._slideshowDelay, this._transitionDuration)
        );
      }
    }.bind(this)
  );
};

HoverSlideshows.prototype._findInSlideshows = function(element, slideshows) {
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
  this._$container.find("img").each(
    function(index, element) {
      var $image = $(element);
      $image.css({
        position: "absolute",
        top: "0",
        left: "0",
        zIndex: index === 0 ? 2 : 0 // First image should be on top
      });
      this._$images.push($image);
    }.bind(this)
  );

  // Determine whether to bind interactivity
  this._numImages = this._$images.length;
  if (this._numImages <= 1) return;

  // Bind event listeners
  this._$container.on("mouseenter", this._onEnter.bind(this));
  this._$container.on("mouseleave", this._onLeave.bind(this));
}

Slideshow.prototype.getElement = function() {
  return this._$container.get(0);
};

Slideshow.prototype.get$Element = function() {
  return this._$container;
};

Slideshow.prototype._onEnter = function() {
  // First transition should happen pretty soon after hovering in order
  // to clue the user into what is happening
  this._timeoutId = setTimeout(this._advanceSlideshow.bind(this), 500);
};

Slideshow.prototype._onLeave = function() {
  clearInterval(this._timeoutId);
  this._timeoutId = null;
};

Slideshow.prototype._advanceSlideshow = function() {
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
  this._$images[this._imageIndex].velocity(
    {
      opacity: 1
    },
    this._transitionDuration,
    "easeInOutQuad"
  );

  // Schedule next transition
  this._timeoutId = setTimeout(this._advanceSlideshow.bind(this), this._slideshowDelay);
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
BaseLogoSketch.prototype._createP5Instance = function() {
  new p5(
    function(p) {
      this._p = p;
      p.preload = this._preload.bind(this, p);
      p.setup = this._setup.bind(this, p);
      p.draw = this._draw.bind(this, p);
    }.bind(this),
    this._$container.get(0)
  );
};

/**
 * Find the distance from the top left of the nav to the brand logo's baseline.
 */
BaseLogoSketch.prototype._updateTextOffset = function() {
  var baselineDiv = $("<div>")
    .css({
      display: "inline-block",
      verticalAlign: "baseline"
    })
    .prependTo(this._$navLogo);
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
BaseLogoSketch.prototype._calculateNavLogoBounds = function() {
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
BaseLogoSketch.prototype._updateSize = function() {
  this._width = this._$nav.innerWidth();
  this._height = this._$nav.innerHeight();
};

/**
 * Grab the font size from the brand logo link. This makes the font size of the
 * sketch responsive.
 */
BaseLogoSketch.prototype._updateFontSize = function() {
  this._fontSize = this._$navLogo.css("fontSize").replace("px", "");
};

/**
 * When the browser is resized, recalculate all the necessary stats so that the
 * sketch can be responsive. The logo in the sketch should ALWAYS exactly match
 * the brang logo link the HTML.
 */
BaseLogoSketch.prototype._onResize = function(p) {
  this._updateSize();
  this._updateFontSize();
  this._updateTextOffset();
  this._calculateNavLogoBounds();
  p.resizeCanvas(this._width, this._height);
};

/**
 * Update the _isMouseOver property.
 */
BaseLogoSketch.prototype._setMouseOver = function(isMouseOver) {
  this._isMouseOver = isMouseOver;
};

/**
 * If the cursor is set to a pointer, forward any click events to the nav logo.
 * This reduces the need for the canvas to do any AJAX-y stuff.
 */
BaseLogoSketch.prototype._onClick = function(e) {
  if (this._isOverNavLogo) this._$navLogo.trigger(e);
};

/**
 * Base preload method that just loads the necessary font
 */
BaseLogoSketch.prototype._preload = function(p) {
  this._font = p.loadFont(this._fontPath);
};

/**
 * Base setup method that does some heavy lifting. It hides the nav brand logo
 * and reveals the canvas. It also sets up a lot of the internal variables and
 * canvas events.
 */
BaseLogoSketch.prototype._setup = function(p) {
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
BaseLogoSketch.prototype._draw = function(p) {
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

Sketch.prototype._onResize = function(p) {
  BaseLogoSketch.prototype._onResize.call(this, p);
  this._spacing = utils.map(this._fontSize, 20, 40, 2, 5, {
    clamp: true,
    round: true
  });
  // Update the bboxText, place over the nav text logo and then shift its
  // anchor back to (center, center) while preserving the text position
  this._bboxText
    .setText(this._text)
    .setTextSize(this._fontSize)
    .setAnchor(BboxText.ALIGN.BOX_LEFT, BboxText.BASELINE.ALPHABETIC)
    .setPosition(this._textOffset.left, this._textOffset.top)
    .setAnchor(BboxText.ALIGN.BOX_CENTER, BboxText.BASELINE.BOX_CENTER, true);
  this._drawStationaryLogo(p);
  this._points = this._bboxText.getTextPoints();
  this._isFirstFrame = true;
};

Sketch.prototype._drawStationaryLogo = function(p) {
  p.background(255);
  p.stroke(255);
  p.fill("#0A000A");
  p.strokeWeight(2);
  this._bboxText.draw();
};

Sketch.prototype._setup = function(p) {
  BaseLogoSketch.prototype._setup.call(this, p);

  // Create a BboxAlignedText instance that will be used for drawing and
  // rotating text
  this._bboxText = new BboxText(this._font, this._text, this._fontSize, 0, 0, p);

  // Handle the initial setup by triggering a resize
  this._onResize(p);

  // Draw the stationary logo
  this._drawStationaryLogo(p);

  // Start the sin generator at its max value
  this._thresholdGenerator = new SinGenerator(p, 0, 1, 0.02, p.PI / 2);
};

Sketch.prototype._draw = function(p) {
  BaseLogoSketch.prototype._draw.call(this, p);
  if (!this._isMouseOver || !this._isOverNavLogo) return;

  // When the text is about to become active for the first time, clear
  // the stationary logo that was previously drawn.
  if (this._isFirstFrame) {
    p.background(255);
    this._isFirstFrame = false;
  }

  if (this._fontSize > 30) {
    this._thresholdGenerator.setBounds(0.2 * this._bboxText.height, 0.47 * this._bboxText.height);
  } else {
    this._thresholdGenerator.setBounds(0.2 * this._bboxText.height, 0.6 * this._bboxText.height);
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
        p.ellipse((point1.x + point2.x) / 2, (point1.y + point2.y) / 2, dist, dist);

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
NoiseGenerator1D.prototype.setBounds = function(min, max) {
  this._min = utils.default(min, this._min);
  this._max = utils.default(max, this._max);
};

/**
 * Update the noise increment (e.g. scale)
 * @param  {number} increment New increment (scale) value
 */
NoiseGenerator1D.prototype.setIncrement = function(increment) {
  this._increment = utils.default(increment, this._increment);
};

/**
 * Generate the next noise value
 * @return {number} A noisy value between object's min and max
 */
NoiseGenerator1D.prototype.generate = function() {
  this._update();
  var n = this._p.noise(this._position);
  n = this._p.map(n, 0, 1, this._min, this._max);
  return n;
};

/**
 * Internal update method for generating next noise value
 * @private
 */
NoiseGenerator1D.prototype._update = function() {
  this._position += this._increment;
};

// -- 2D Noise Generator -------------------------------------------------------

function NoiseGenerator2D(p, xMin, xMax, yMin, yMax, xIncrement, yIncrement, xOffset, yOffset) {
  this._xNoise = new NoiseGenerator1D(p, xMin, xMax, xIncrement, xOffset);
  this._yNoise = new NoiseGenerator1D(p, yMin, yMax, yIncrement, yOffset);
  this._p = p;
}

/**
 * Update the min and max noise values
 * @param  {object} options Object with bounds to be updated e.g.
 *                          { xMin: 0, xMax: 1, yMin: -1, yMax: 1 }
 */
NoiseGenerator2D.prototype.setBounds = function(options) {
  if (!options) return;
  this._xNoise.setBounds(options.xMin, options.xMax);
  this._yNoise.setBounds(options.yMin, options.yMax);
};

/**
 * Update the increment (e.g. scale) for the noise generator
 * @param  {object} options Object with bounds to be updated e.g.
 *                          { xIncrement: 0.05, yIncrement: 0.1 }
 */
NoiseGenerator2D.prototype.setBounds = function(options) {
  if (!options) return;
  this._xNoise.setBounds(options.xIncrement);
  this._yNoise.setBounds(options.yIncrement);
};

/**
 * Generate the next pair of noise values
 * @return {object} Object with x and y properties that contain the next noise
 *                  values along each dimension
 */
NoiseGenerator2D.prototype.generate = function() {
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
SinGenerator.prototype.setBounds = function(min, max) {
  this._min = utils.default(min, this._min);
  this._max = utils.default(max, this._max);
};

/**
 * Update the angle increment (e.g. how fast we move through the sinwave)
 * @param  {number} increment New increment value
 */
SinGenerator.prototype.setIncrement = function(increment) {
  this._increment = utils.default(increment, this._increment);
};

/**
 * Generate the next value
 * @return {number} A value between generators's min and max
 */
SinGenerator.prototype.generate = function() {
  this._update();
  var n = this._p.sin(this._angle);
  n = this._p.map(n, -1, 1, this._min, this._max);
  return n;
};

/**
 * Internal update method for generating next value
 * @private
 */
SinGenerator.prototype._update = function() {
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

Sketch.prototype._onResize = function(p) {
  BaseLogoSketch.prototype._onResize.call(this, p);
  this._spacing = utils.map(this._fontSize, 20, 40, 2, 5, {
    clamp: true,
    round: true
  });
  // Update the bboxText, place over the nav text logo and then shift its
  // anchor back to (center, center) while preserving the text position
  this._bboxText
    .setText(this._text)
    .setTextSize(this._fontSize)
    .setAnchor(BboxText.ALIGN.BOX_LEFT, BboxText.BASELINE.ALPHABETIC)
    .setPosition(this._textOffset.left, this._textOffset.top)
    .setAnchor(BboxText.ALIGN.BOX_CENTER, BboxText.BASELINE.BOX_CENTER, true);
  this._drawStationaryLogo(p);
  this._calculateCircles(p);
  this._isFirstFrame = true;
};

Sketch.prototype._drawStationaryLogo = function(p) {
  p.background(255);
  p.stroke(255);
  p.fill("#0A000A");
  p.strokeWeight(2);
  this._bboxText.draw();
};

Sketch.prototype._setup = function(p) {
  BaseLogoSketch.prototype._setup.call(this, p);

  // Create a BboxAlignedText instance that will be used for drawing and
  // rotating text
  this._bboxText = new BboxText(this._font, this._text, this._fontSize, 0, 0, p);

  // Handle the initial setup by triggering a resize
  this._onResize(p);

  // Draw the stationary logo
  this._drawStationaryLogo(p);

  this._calculateCircles(p);
};

Sketch.prototype._calculateCircles = function(p) {
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
      var i = 4 * (y * p.width + x);
      var r = p.pixels[i];
      var g = p.pixels[i + 1];
      var b = p.pixels[i + 2];
      var a = p.pixels[i + 3];
      var c = p.color(r, g, b, a);
      if (p.saturation(c) > 0) {
        this._circles.push({
          x: x + p.random(-2 / 3 * this._spacing, 2 / 3 * this._spacing),
          y: y + p.random(-2 / 3 * this._spacing, 2 / 3 * this._spacing),
          color: p.color("#06FFFF")
        });
        this._circles.push({
          x: x + p.random(-2 / 3 * this._spacing, 2 / 3 * this._spacing),
          y: y + p.random(-2 / 3 * this._spacing, 2 / 3 * this._spacing),
          color: p.color("#FE00FE")
        });
        this._circles.push({
          x: x + p.random(-2 / 3 * this._spacing, 2 / 3 * this._spacing),
          y: y + p.random(-2 / 3 * this._spacing, 2 / 3 * this._spacing),
          color: p.color("#FFFF04")
        });
      }
    }
  }
};

Sketch.prototype._draw = function(p) {
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
    var radius = utils.map(dist, 0, maxDist, 1, maxRadius, { clamp: true });
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

Sketch.prototype._onResize = function(p) {
  BaseLogoSketch.prototype._onResize.call(this, p);
  // Update the bboxText, place over the nav text logo and then shift its
  // anchor back to (center, center) while preserving the text position
  this._bboxText
    .setText(this._text)
    .setTextSize(this._fontSize)
    .setRotation(0)
    .setAnchor(BboxText.ALIGN.BOX_LEFT, BboxText.BASELINE.ALPHABETIC)
    .setPosition(this._textOffset.left, this._textOffset.top)
    .setAnchor(BboxText.ALIGN.BOX_CENTER, BboxText.BASELINE.BOX_CENTER, true);
  this._textPos = this._bboxText.getPosition();
  this._drawStationaryLogo(p);
  this._isFirstFrame = true;
};

Sketch.prototype._drawStationaryLogo = function(p) {
  p.background(255);
  p.stroke(255);
  p.fill("#0A000A");
  p.strokeWeight(2);
  this._bboxText.draw();
};

Sketch.prototype._setup = function(p) {
  BaseLogoSketch.prototype._setup.call(this, p);

  // Create a BboxAlignedText instance that will be used for drawing and
  // rotating text
  this._bboxText = new BboxText(this._font, this._text, this._fontSize, 0, 0, p);

  // Handle the initial setup by triggering a resize
  this._onResize(p);

  // Set up noise generators
  this._rotationNoise = new Noise.NoiseGenerator1D(p, -p.PI / 4, p.PI / 4, 0.02);
  this._xyNoise = new Noise.NoiseGenerator2D(p, -100, 100, -50, 50, 0.01, 0.01);
};

Sketch.prototype._draw = function(p) {
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
  this._bboxText
    .setRotation(rotation)
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

MainNav.prototype.setActiveFromUrl = function() {
  this._deactivate();
  var url = location.pathname;
  if (url === "/index.html" || url === "/") {
    this._activateLink(this._$navLinks.filter("#about-link"));
  } else if (url === "/work.html") {
    this._activateLink(this._$navLinks.filter("#work-link"));
  } else if (url === "/contact.html") {
    this._activateLink(this._$navLinks.filter("#contact-link"));
  }
};

MainNav.prototype._deactivate = function() {
  if (this._$activeNav.length) {
    this._$activeNav.removeClass("active");
    this._$activeNav = $();
  }
};

MainNav.prototype._activateLink = function($link) {
  $link.addClass("active");
  this._$activeNav = $link;
};

MainNav.prototype._onLogoClick = function(e) {
  e.preventDefault();
  var $target = $(e.currentTarget);
  var url = $target.attr("href");
  this._loader.loadPage(url, {}, true);
};

MainNav.prototype._onNavClick = function(e) {
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

  if (url === loader.getLoadedPath() && url === "/work.html") {
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

  // Redirect data-internal-link hyperlinks through the loader
  var internalLinks = $("a[data-internal-link]");
  internalLinks.on("click", function(event) {
    event.preventDefault();
    loader.loadPage($(event.currentTarget).attr("href"), {}, true);
  });

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
  this._fadeDuration = fadeDuration !== undefined ? fadeDuration : 250;
  this._path = location.pathname;
}

Loader.prototype.getLoadedPath = function() {
  return this._path;
};

Loader.prototype.loadPage = function(url, queryObject, shouldPushHistory) {
  // Fade then empty the current contents
  this._$content.velocity(
    { opacity: 0 },
    this._fadeDuration,
    "swing",
    function() {
      this._$content.empty();
      this._$content.load(url + " #content", onContentFetched.bind(this));
    }.bind(this)
  );

  // Fade the new content in after it has been fetched
  function onContentFetched(responseText, textStatus) {
    if (textStatus === "error") {
      console.log("There was a problem loading the page.");
      return;
    }

    var queryString = utilities.createQueryString(queryObject);
    if (shouldPushHistory) {
      history.pushState(
        {
          url: url,
          query: queryObject
        },
        null,
        url + queryString
      );
    }

    // Update Google analytics
    ga("set", "page", url + queryString);
    ga("send", "pageview");

    this._path = location.pathname;
    this._$content.velocity({ opacity: 1 }, this._fadeDuration, "swing");
    this._onReload();
  }
};

},{"./utilities.js":19}],14:[function(require,module,exports){
var cookies = require("js-cookie");
var utils = require("./utilities.js");

var sketchConstructors = {
  "halftone-flashlight": require("./interactive-logos/halftone-flashlight-word.js"),
  "noisy-word": require("./interactive-logos/noisy-word-sketch.js"),
  "connect-points": require("./interactive-logos/connect-points-sketch.js")
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
  this._aspectRatio = aspectRatio !== undefined ? aspectRatio : 16 / 9;
  this._transitionDuration = transitionDuration !== undefined ? transitionDuration : 800;
  this._breakpoints = breakpoints !== undefined ? breakpoints.slice() : defaultBreakpoints.slice();
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

PortfolioFilter.prototype.selectCategory = function(category) {
  category = (category && category.toLowerCase()) || "all";
  var $selectedNav = this._$nav.find("a[data-category=" + category + "]");
  if ($selectedNav.length && !$selectedNav.is(this._$activeNavItem)) {
    this._$activeNavItem.removeClass("active");
    this._$activeNavItem = $selectedNav;
    this._$activeNavItem.addClass("active");
    this._filterProjects(category);
  }
};

PortfolioFilter.prototype._filterProjects = function(category) {
  var $selectedElements = this._getProjectsInCategory(category);

  // Animate the grid to the correct height to contain the rows
  this._animateGridHeight($selectedElements.length);

  // Loop through all projects
  this._$projects.forEach(
    function($element) {
      // Stop all animations
      $element.velocity("stop");
      // If an element is not selected: drop z-index & animate opacity -> hide
      var selectedIndex = $selectedElements.indexOf($element);
      if (selectedIndex === -1) {
        $element.css("zIndex", -1);
        $element.velocity(
          {
            opacity: 0
          },
          this._transitionDuration,
          "easeInOutCubic",
          function() {
            $element.hide();
          }
        );
      } else {
        // If an element is selected: show & bump z-index & animate to position
        $element.show();
        $element.css("zIndex", 0);
        var newPos = this._indexToXY(selectedIndex);
        $element.velocity(
          {
            opacity: 1,
            top: newPos.y + "px",
            left: newPos.x + "px"
          },
          this._transitionDuration,
          "easeInOutCubic"
        );
      }
    }.bind(this)
  );
};

PortfolioFilter.prototype._animateGridHeight = function(numElements) {
  this._$grid.velocity("stop");
  var curRows = Math.ceil(numElements / this._cols);
  this._$grid.velocity(
    {
      height: this._imageHeight * curRows + this._gridSpacing * (curRows - 1) + "px"
    },
    this._transitionDuration
  );
};

PortfolioFilter.prototype._getProjectsInCategory = function(category) {
  if (category === "all") {
    return this._$projects;
  } else {
    return this._$categories[category] || [];
  }
};

PortfolioFilter.prototype._cacheProjects = function() {
  this._$projects = [];
  this._$categories = {};
  this._$grid.find(".project").each(
    function(index, element) {
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
    }.bind(this)
  );
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

PortfolioFilter.prototype._calculateGrid = function() {
  var gridWidth = this._$grid.innerWidth();
  for (var i = 0; i < this._breakpoints.length; i += 1) {
    if (gridWidth <= this._breakpoints[i].width) {
      this._cols = this._breakpoints[i].cols;
      this._gridSpacing = this._breakpoints[i].spacing;
      break;
    }
  }
  this._rows = Math.ceil(this._$projects.length / this._cols);
  this._imageWidth = (gridWidth - (this._cols - 1) * this._gridSpacing) / this._cols;
  this._imageHeight = this._imageWidth * (1 / this._aspectRatio);
};

PortfolioFilter.prototype._createGrid = function() {
  this._calculateGrid();

  this._$grid.css("position", "relative");
  this._$grid.css({
    height: this._imageHeight * this._rows + this._gridSpacing * (this._rows - 1) + "px"
  });

  this._$projects.forEach(
    function($element, index) {
      var pos = this._indexToXY(index);
      $element.css({
        position: "absolute",
        top: pos.y + "px",
        left: pos.x + "px",
        width: this._imageWidth + "px",
        height: this._imageHeight + "px"
      });
    }.bind(this)
  );
};

PortfolioFilter.prototype._onNavClick = function(e) {
  e.preventDefault();
  var $target = $(e.target);
  if ($target.is(this._$activeNavItem)) return;
  if (this._$activeNavItem.length) this._$activeNavItem.removeClass("active");
  $target.addClass("active");
  this._$activeNavItem = $target;
  var category = $target.data("category").toLowerCase();

  history.pushState(
    {
      url: "/work.html",
      query: { category: category }
    },
    null,
    "/work.html?category=" + category
  );

  this._filterProjects(category);
};

PortfolioFilter.prototype._onProjectClick = function(e) {
  e.preventDefault();
  var $target = $(e.currentTarget);
  var projectName = $target.data("name");
  var url = "/projects/" + projectName + ".html";
  this._loader.loadPage(url, {}, true);
};

PortfolioFilter.prototype._indexToXY = function(index) {
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
  setTimeout(
    function() {
      this._onResize();
    }.bind(this),
    0
  );
}

SlideshowModal.prototype.advanceLeft = function() {
  this.showImageAt(this._index - 1);
};

SlideshowModal.prototype.advanceRight = function() {
  this.showImageAt(this._index + 1);
};

SlideshowModal.prototype.showImageAt = function(index) {
  index = Math.max(index, 0);
  index = Math.min(index, this._slideshow.getNumImages() - 1);
  this._index = index;
  var $img = this._slideshow.getGalleryImage(this._index);
  var caption = this._slideshow.getCaption(this._index);

  this._$imageContainer.empty();
  $("<img>", { src: $img.attr("src") }).appendTo(this._$imageContainer);

  this._$caption.empty();
  if (caption) {
    $("<span>")
      .addClass("figure-number")
      .text("Fig. " + (this._index + 1) + ": ")
      .appendTo(this._$caption);
    $("<span>")
      .addClass("caption-text")
      .text(caption)
      .appendTo(this._$caption);
  }

  this._onResize();
  this._updateControls();
};

SlideshowModal.prototype.open = function(index) {
  index = index || 0;
  this._$modal.show();
  this.showImageAt(index);
  this._isOpen = true;
};

SlideshowModal.prototype.close = function() {
  this._$modal.hide();
  this._isOpen = false;
};

SlideshowModal.prototype._onKeyDown = function(e) {
  if (!this._isOpen) return;
  if (e.which === KEY_CODES.LEFT_ARROW) {
    this.advanceLeft();
  } else if (e.which === KEY_CODES.RIGHT_ARROW) {
    this.advanceRight();
  } else if (e.which === KEY_CODES.ESCAPE) {
    this.close();
  }
};

SlideshowModal.prototype._updateControls = function() {
  // Re-enable
  this._$imageRight.removeClass("disabled");
  this._$imageLeft.removeClass("disabled");

  // Disable if we've reached the the max or min limit
  if (this._index >= this._slideshow.getNumImages() - 1) {
    this._$imageRight.addClass("disabled");
  } else if (this._index <= 0) {
    this._$imageLeft.addClass("disabled");
  }
};

SlideshowModal.prototype._onResize = function() {
  var $image = this._$imageContainer.find("img");

  // Reset the content's width
  this._$content.width("");

  // Find the size of the components that need to be displayed in addition to
  // the image
  var controlsWidth = this._$imageLeft.outerWidth(true) + this._$imageRight.outerWidth(true);
  // Hack for now - budget for 2x the caption height.
  var captionHeight = 2 * this._$caption.outerHeight(true);
  // var imagePadding = $image.innerWidth();

  // Calculate the available area for the modal
  var mw = this._$modal.width() - controlsWidth;
  var mh = this._$modal.height() - captionHeight;

  // Fit the image to the remaining screen real estate
  var setSize = function() {
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
    transitionDuration = transitionDuration !== undefined ? transitionDuration : 400;
    this._slideshows = [];
    $(".slideshow").each(
      function(index, element) {
        var slideshow = new Slideshow($(element), transitionDuration);
        this._slideshows.push(slideshow);
      }.bind(this)
    );
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
  this._$selectedImageContainer.on(
    "click",
    function() {
      this._modal.open(this._index);
    }.bind(this)
  );

  // Load images
  this._$galleryImages = this._loadGalleryImages();
  this._numImages = this._$galleryImages.length;

  // Show the first image
  this.showImage(0);
}

Slideshow.prototype.getActiveIndex = function() {
  return this._index;
};

Slideshow.prototype.getNumImages = function() {
  return this._numImages;
};

Slideshow.prototype.getGalleryImage = function(index) {
  return this._$galleryImages[index];
};

Slideshow.prototype.getCaption = function(index) {
  return this._$galleryImages[index].data("caption");
};

Slideshow.prototype.showImage = function(index) {
  // Reset all images to invisible and lowest z-index. This could be smarter,
  // like HoverSlideshow, and only reset exactly what we need, but we aren't
  // wasting that many cycles.
  this._$galleryImages.forEach(function($galleryImage) {
    $galleryImage.css({
      zIndex: 0,
      opacity: 0
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
  $currentImage.velocity({ opacity: 1 }, this._transitionDuration, "easeInOutQuad");

  // Create the caption, if it exists on the thumbnail
  var caption = $currentImage.data("caption");
  if (caption) {
    this._$captionContainer.empty();
    $("<span>")
      .addClass("figure-number")
      .text("Fig. " + (this._index + 1) + ": ")
      .appendTo(this._$captionContainer);
    $("<span>")
      .addClass("caption-text")
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

Slideshow.prototype._loadGalleryImages = function() {
  // Create empty images in the gallery for each thumbnail. This helps us do
  // lazy loading of gallery images and allows us to cross-fade images.
  var $galleryImages = [];
  for (var i = 0; i < this._thumbnailSlider.getNumThumbnails(); i += 1) {
    // Get the thumbnail element which has path and caption data
    var $thumb = this._thumbnailSlider.get$Thumbnail(i);

    // Calculate the id from the path to the large image
    var largePath = $thumb.data("large-path");
    var id = largePath
      .split("/")
      .pop()
      .split(".")[0];

    // Create a gallery image element
    var $galleryImage = $("<img>", { id: id })
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
  this._$thumbnailImages.each(
    function(index, element) {
      var $thumbnail = $(element);
      $thumbnail.data("index", index);
      this._$thumbnails.push($thumbnail);
    }.bind(this)
  );
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
  setTimeout(
    function() {
      this._onResize();
    }.bind(this),
    0
  );
}

ThumbnailSlider.prototype.getActiveIndex = function() {
  return this._index;
};

ThumbnailSlider.prototype.getNumThumbnails = function() {
  return this._numImages;
};

ThumbnailSlider.prototype.get$Thumbnail = function(index) {
  return this._$thumbnails[index];
};

ThumbnailSlider.prototype.advanceLeft = function() {
  var newIndex = this._scrollIndex - this._numVisible;
  newIndex = Math.max(newIndex, 0);
  this._scrollToThumbnail(newIndex);
};

ThumbnailSlider.prototype.advanceRight = function() {
  var newIndex = this._scrollIndex + this._numVisible;
  newIndex = Math.min(newIndex, this._numImages - 1);
  this._scrollToThumbnail(newIndex);
};

ThumbnailSlider.prototype._resetSizing = function() {
  // Reset sizing variables. This includes resetting any inline style that has
  // been applied, so that any size calculations can be based on the CSS
  // styling.
  this._$thumbnailContainer.css({
    top: "",
    left: "",
    width: "",
    height: ""
  });
  this._$visibleThumbnailWrap.width("");
  this._$visibleThumbnailWrap.height("");
  // Make all thumbnails square and reset any height
  this._$thumbnails.forEach(function($element) {
    $element.height(""); // Reset height before setting width
    $element.width($element.height());
  });
};

ThumbnailSlider.prototype._onResize = function() {
  this._resetSizing();

  // Calculate the size of the first thumbnail. This assumes the first image
  // only has a right-side margin.
  var $firstThumb = this._$thumbnails[0];
  var thumbSize = $firstThumb.outerHeight(false);
  var thumbMargin = 2 * ($firstThumb.outerWidth(true) - thumbSize);

  // Measure controls. They need to be visible in order to be measured.
  this._$advanceRight.css("display", "block");
  this._$advanceLeft.css("display", "block");
  var thumbControlWidth =
    this._$advanceRight.outerWidth(true) + this._$advanceLeft.outerWidth(true);

  // Calculate how many full thumbnails can fit within the thumbnail area
  var visibleWidth = this._$visibleThumbnailWrap.outerWidth(false);
  var numThumbsVisible = Math.floor((visibleWidth - thumbMargin) / (thumbSize + thumbMargin));

  // Check whether all the thumbnails can fit on the screen at once
  if (numThumbsVisible < this._numImages) {
    // Take a best guess at how to size the thumbnails. Size formula:
    //  width = num * thumbSize + (num - 1) * thumbMargin + controlSize
    // Solve for number of thumbnails and round to the nearest integer so
    // that we don't have any partial thumbnails showing.
    numThumbsVisible = Math.round(
      (visibleWidth - thumbControlWidth + thumbMargin) / (thumbSize + thumbMargin)
    );

    // Use this number of thumbnails to calculate the thumbnail size
    var newSize = (visibleWidth - thumbControlWidth + thumbMargin) / numThumbsVisible - thumbMargin;
    this._$thumbnails.forEach(function($element) {
      // $.width and $.height set the content size regardless of the
      // box-sizing. The images are border-box, so we want the CSS width
      // and height. This allows the active image to have a border and the
      // other images to have padding.
      $element.css("width", newSize + "px");
      $element.css("height", newSize + "px");
    });

    // Set the thumbnail wrap size. It should be just tall enough to fit a
    // thumbnail and long enough to hold all the thumbnails in one line:
    var totalSize = newSize * this._numImages + thumbMargin * (this._numImages - 1);
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

ThumbnailSlider.prototype._activateThumbnail = function(index) {
  // Activate/deactivate thumbnails
  this._$thumbnails[this._index].removeClass("active");
  this._$thumbnails[index].addClass("active");
};

ThumbnailSlider.prototype._scrollToThumbnail = function(index) {
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
  var centerX = size * this._scrollBounds.min + margin * (this._scrollBounds.min - 1);
  var thumbX = size * index + margin * (index - 1);
  var left = centerX - thumbX;

  // Animate the thumbnail container
  this._$thumbnailContainer.velocity("stop");
  this._$thumbnailContainer.velocity(
    {
      left: left + "px"
    },
    600,
    "easeInOutQuad"
  );

  this._updateThumbnailControls();
};

ThumbnailSlider.prototype._onClick = function(e) {
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

ThumbnailSlider.prototype._updateThumbnailControls = function() {
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
exports.default = function(val, defaultVal) {
  return val !== undefined ? val : defaultVal;
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
exports.timeIt = function(func) {
  var start = performance.now();
  func();
  var end = performance.now();
  return end - start;
};

exports.isInRect = function(x, y, rect) {
  if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
    return true;
  }
  return false;
};

exports.randInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

exports.randArrayElement = function(array) {
  var i = exports.randInt(0, array.length - 1);
  return array[i];
};

exports.map = function(num, min1, max1, min2, max2, options) {
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

exports.getQueryParameters = function() {
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

exports.createQueryString = function(queryObject) {
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

exports.wrapIndex = function(index, length) {
  var wrappedIndex = index % length;
  if (wrappedIndex < 0) {
    // If negative, flip the index so that -1 becomes the last item in list
    wrappedIndex = length + wrappedIndex;
  }
  return wrappedIndex;
};

},{}]},{},[12])

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJub2RlX21vZHVsZXMvcDUtYmJveC1hbGlnbmVkLXRleHQvbGliL2Jib3gtYWxpZ25lZC10ZXh0LmpzIiwibm9kZV9tb2R1bGVzL3A1LWJib3gtYWxpZ25lZC10ZXh0L2xpYi91dGlscy5qcyIsInNyYy9qcy9ob3Zlci1zbGlkZXNob3cuanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvYmFzZS1sb2dvLXNrZXRjaC5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9jb25uZWN0LXBvaW50cy1za2V0Y2guanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvZ2VuZXJhdG9ycy9ub2lzZS1nZW5lcmF0b3JzLmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2dlbmVyYXRvcnMvc2luLWdlbmVyYXRvci5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9oYWxmdG9uZS1mbGFzaGxpZ2h0LXdvcmQuanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3Mvbm9pc3ktd29yZC1za2V0Y2guanMiLCJzcmMvanMvbWFpbi1uYXYuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9wYWdlLWxvYWRlci5qcyIsInNyYy9qcy9waWNrLXJhbmRvbS1za2V0Y2guanMiLCJzcmMvanMvcG9ydGZvbGlvLWZpbHRlci5qcyIsInNyYy9qcy90aHVtYm5haWwtc2xpZGVzaG93L3NsaWRlc2hvdy1tb2RhbC5qcyIsInNyYy9qcy90aHVtYm5haWwtc2xpZGVzaG93L3NsaWRlc2hvdy5qcyIsInNyYy9qcy90aHVtYm5haWwtc2xpZGVzaG93L3RodW1ibmFpbC1zbGlkZXIuanMiLCJzcmMvanMvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxuICogSmF2YVNjcmlwdCBDb29raWUgdjIuMS40XG4gKiBodHRwczovL2dpdGh1Yi5jb20vanMtY29va2llL2pzLWNvb2tpZVxuICpcbiAqIENvcHlyaWdodCAyMDA2LCAyMDE1IEtsYXVzIEhhcnRsICYgRmFnbmVyIEJyYWNrXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuOyhmdW5jdGlvbiAoZmFjdG9yeSkge1xuXHR2YXIgcmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gZmFsc2U7XG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdFx0cmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gdHJ1ZTtcblx0fVxuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdFx0cmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gdHJ1ZTtcblx0fVxuXHRpZiAoIXJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlcikge1xuXHRcdHZhciBPbGRDb29raWVzID0gd2luZG93LkNvb2tpZXM7XG5cdFx0dmFyIGFwaSA9IHdpbmRvdy5Db29raWVzID0gZmFjdG9yeSgpO1xuXHRcdGFwaS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0d2luZG93LkNvb2tpZXMgPSBPbGRDb29raWVzO1xuXHRcdFx0cmV0dXJuIGFwaTtcblx0XHR9O1xuXHR9XG59KGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gZXh0ZW5kICgpIHtcblx0XHR2YXIgaSA9IDA7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlcyA9IGFyZ3VtZW50c1sgaSBdO1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0cmVzdWx0W2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRmdW5jdGlvbiBpbml0IChjb252ZXJ0ZXIpIHtcblx0XHRmdW5jdGlvbiBhcGkgKGtleSwgdmFsdWUsIGF0dHJpYnV0ZXMpIHtcblx0XHRcdHZhciByZXN1bHQ7XG5cdFx0XHRpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFdyaXRlXG5cblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRhdHRyaWJ1dGVzID0gZXh0ZW5kKHtcblx0XHRcdFx0XHRwYXRoOiAnLydcblx0XHRcdFx0fSwgYXBpLmRlZmF1bHRzLCBhdHRyaWJ1dGVzKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0XHR2YXIgZXhwaXJlcyA9IG5ldyBEYXRlKCk7XG5cdFx0XHRcdFx0ZXhwaXJlcy5zZXRNaWxsaXNlY29uZHMoZXhwaXJlcy5nZXRNaWxsaXNlY29uZHMoKSArIGF0dHJpYnV0ZXMuZXhwaXJlcyAqIDg2NGUrNSk7XG5cdFx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gZXhwaXJlcztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFdlJ3JlIHVzaW5nIFwiZXhwaXJlc1wiIGJlY2F1c2UgXCJtYXgtYWdlXCIgaXMgbm90IHN1cHBvcnRlZCBieSBJRVxuXHRcdFx0XHRhdHRyaWJ1dGVzLmV4cGlyZXMgPSBhdHRyaWJ1dGVzLmV4cGlyZXMgPyBhdHRyaWJ1dGVzLmV4cGlyZXMudG9VVENTdHJpbmcoKSA6ICcnO1xuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuXHRcdFx0XHRcdGlmICgvXltcXHtcXFtdLy50ZXN0KHJlc3VsdCkpIHtcblx0XHRcdFx0XHRcdHZhbHVlID0gcmVzdWx0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblxuXHRcdFx0XHRpZiAoIWNvbnZlcnRlci53cml0ZSkge1xuXHRcdFx0XHRcdHZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnwzQXwzQ3wzRXwzRHwyRnwzRnw0MHw1Qnw1RHw1RXw2MHw3Qnw3RHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGNvbnZlcnRlci53cml0ZSh2YWx1ZSwga2V5KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGtleSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoa2V5KSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDVFfDYwfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvW1xcKFxcKV0vZywgZXNjYXBlKTtcblxuXHRcdFx0XHR2YXIgc3RyaW5naWZpZWRBdHRyaWJ1dGVzID0gJyc7XG5cblx0XHRcdFx0Zm9yICh2YXIgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdFx0aWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc7ICcgKyBhdHRyaWJ1dGVOYW1lO1xuXHRcdFx0XHRcdGlmIChhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc9JyArIGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIChkb2N1bWVudC5jb29raWUgPSBrZXkgKyAnPScgKyB2YWx1ZSArIHN0cmluZ2lmaWVkQXR0cmlidXRlcyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlYWRcblxuXHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0cmVzdWx0ID0ge307XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRvIHByZXZlbnQgdGhlIGZvciBsb29wIGluIHRoZSBmaXJzdCBwbGFjZSBhc3NpZ24gYW4gZW1wdHkgYXJyYXlcblx0XHRcdC8vIGluIGNhc2UgdGhlcmUgYXJlIG5vIGNvb2tpZXMgYXQgYWxsLiBBbHNvIHByZXZlbnRzIG9kZCByZXN1bHQgd2hlblxuXHRcdFx0Ly8gY2FsbGluZyBcImdldCgpXCJcblx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG5cdFx0XHR2YXIgcmRlY29kZSA9IC8oJVswLTlBLVpdezJ9KSsvZztcblx0XHRcdHZhciBpID0gMDtcblxuXHRcdFx0Zm9yICg7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBwYXJ0cyA9IGNvb2tpZXNbaV0uc3BsaXQoJz0nKTtcblx0XHRcdFx0dmFyIGNvb2tpZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oJz0nKTtcblxuXHRcdFx0XHRpZiAoY29va2llLmNoYXJBdCgwKSA9PT0gJ1wiJykge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZS5zbGljZSgxLCAtMSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHZhciBuYW1lID0gcGFydHNbMF0ucmVwbGFjZShyZGVjb2RlLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvbnZlcnRlci5yZWFkID9cblx0XHRcdFx0XHRcdGNvbnZlcnRlci5yZWFkKGNvb2tpZSwgbmFtZSkgOiBjb252ZXJ0ZXIoY29va2llLCBuYW1lKSB8fFxuXHRcdFx0XHRcdFx0Y29va2llLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblxuXHRcdFx0XHRcdGlmICh0aGlzLmpzb24pIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGNvb2tpZSA9IEpTT04ucGFyc2UoY29va2llKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGtleSA9PT0gbmFtZSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ID0gY29va2llO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0XHRcdHJlc3VsdFtuYW1lXSA9IGNvb2tpZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXG5cdFx0YXBpLnNldCA9IGFwaTtcblx0XHRhcGkuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0cmV0dXJuIGFwaS5jYWxsKGFwaSwga2V5KTtcblx0XHR9O1xuXHRcdGFwaS5nZXRKU09OID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGFwaS5hcHBseSh7XG5cdFx0XHRcdGpzb246IHRydWVcblx0XHRcdH0sIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG5cdFx0fTtcblx0XHRhcGkuZGVmYXVsdHMgPSB7fTtcblxuXHRcdGFwaS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5LCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRhcGkoa2V5LCAnJywgZXh0ZW5kKGF0dHJpYnV0ZXMsIHtcblx0XHRcdFx0ZXhwaXJlczogLTFcblx0XHRcdH0pKTtcblx0XHR9O1xuXG5cdFx0YXBpLndpdGhDb252ZXJ0ZXIgPSBpbml0O1xuXG5cdFx0cmV0dXJuIGFwaTtcblx0fVxuXG5cdHJldHVybiBpbml0KGZ1bmN0aW9uICgpIHt9KTtcbn0pKTtcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzLmpzXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYm94QWxpZ25lZFRleHQ7XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBCYm94QWxpZ25lZFRleHQgb2JqZWN0IC0gYSB0ZXh0IG9iamVjdCB0aGF0IGNhbiBiZSBkcmF3biB3aXRoXHJcbiAqIGFuY2hvciBwb2ludHMgYmFzZWQgb24gYSB0aWdodCBib3VuZGluZyBib3ggYXJvdW5kIHRoZSB0ZXh0LlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtvYmplY3R9IGZvbnQgLSBwNS5Gb250IG9iamVjdFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFN0cmluZyB0byBkaXNwbGF5XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbZm9udFNpemU9MTJdIC0gRm9udCBzaXplIHRvIHVzZSBmb3Igc3RyaW5nXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeD0wXSAtIEluaXRpYWwgeCBsb2NhdGlvblxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3k9MF0gLSBJbml0aWFsIHkgbG9jYXRpb25cclxuICogQHBhcmFtIHtvYmplY3R9IFtwSW5zdGFuY2U9d2luZG93XSAtIFJlZmVyZW5jZSB0byBwNSBpbnN0YW5jZSwgbGVhdmUgYmxhbmsgaWZcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNrZXRjaCBpcyBnbG9iYWxcclxuICogQGV4YW1wbGVcclxuICogdmFyIGZvbnQsIGJib3hUZXh0O1xyXG4gKiBmdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gKiAgICAgZm9udCA9IGxvYWRGb250KFwiLi9hc3NldHMvUmVndWxhci50dGZcIik7XHJcbiAqIH1cclxuICogZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAqICAgICBjcmVhdGVDYW52YXMoNDAwLCA2MDApO1xyXG4gKiAgICAgYmFja2dyb3VuZCgwKTtcclxuICogICAgIFxyXG4gKiAgICAgYmJveFRleHQgPSBuZXcgQmJveEFsaWduZWRUZXh0KGZvbnQsIFwiSGV5IVwiLCAzMCk7ICAgIFxyXG4gKiAgICAgYmJveFRleHQuc2V0Um90YXRpb24oUEkgLyA0KTtcclxuICogICAgIGJib3hUZXh0LnNldEFuY2hvcihCYm94QWxpZ25lZFRleHQuQUxJR04uQk9YX0NFTlRFUiwgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVIpO1xyXG4gKiAgICAgXHJcbiAqICAgICBmaWxsKFwiIzAwQThFQVwiKTtcclxuICogICAgIG5vU3Ryb2tlKCk7XHJcbiAqICAgICBiYm94VGV4dC5kcmF3KHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XHJcbiAqIH1cclxuICovXHJcbmZ1bmN0aW9uIEJib3hBbGlnbmVkVGV4dChmb250LCB0ZXh0LCBmb250U2l6ZSwgeCwgeSwgcEluc3RhbmNlKSB7XHJcbiAgICB0aGlzLl9mb250ID0gZm9udDtcclxuICAgIHRoaXMuX3RleHQgPSB0ZXh0O1xyXG4gICAgdGhpcy5feCA9IHV0aWxzLmRlZmF1bHQoeCwgMCk7XHJcbiAgICB0aGlzLl95ID0gdXRpbHMuZGVmYXVsdCh5LCAwKTtcclxuICAgIHRoaXMuX2ZvbnRTaXplID0gdXRpbHMuZGVmYXVsdChmb250U2l6ZSwgMTIpO1xyXG4gICAgdGhpcy5fcCA9IHV0aWxzLmRlZmF1bHQocEluc3RhbmNlLCB3aW5kb3cpO1xyXG4gICAgdGhpcy5fcm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy5faEFsaWduID0gQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9DRU5URVI7XHJcbiAgICB0aGlzLl92QWxpZ24gPSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUjtcclxuICAgIHRoaXMuX2NhbGN1bGF0ZU1ldHJpY3ModHJ1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWZXJ0aWNhbCBhbGlnbm1lbnQgdmFsdWVzXHJcbiAqIEBwdWJsaWNcclxuICogQHN0YXRpY1xyXG4gKiBAcmVhZG9ubHlcclxuICogQGVudW0ge3N0cmluZ31cclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5BTElHTiA9IHtcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIGxlZnQgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9MRUZUOiBcImJveF9sZWZ0XCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9DRU5URVI6IFwiYm94X2NlbnRlclwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgcmlnaHQgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9SSUdIVDogXCJib3hfcmlnaHRcIlxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2VsaW5lIGFsaWdubWVudCB2YWx1ZXNcclxuICogQHB1YmxpY1xyXG4gKiBAc3RhdGljXHJcbiAqIEByZWFkb25seVxyXG4gKiBAZW51bSB7c3RyaW5nfVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FID0ge1xyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgdG9wIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfVE9QOiBcImJveF90b3BcIixcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIGNlbnRlciBvZiB0aGUgYmJveCAqL1xyXG4gICAgQk9YX0NFTlRFUjogXCJib3hfY2VudGVyXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBib3R0b20gb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9CT1RUT006IFwiYm94X2JvdHRvbVwiLFxyXG4gICAgLyoqIFxyXG4gICAgICogRHJhdyBmcm9tIGhhbGYgdGhlIGhlaWdodCBvZiB0aGUgZm9udC4gU3BlY2lmaWNhbGx5IHRoZSBoZWlnaHQgaXNcclxuICAgICAqIGNhbGN1bGF0ZWQgYXM6IGFzY2VudCArIGRlc2NlbnQuXHJcbiAgICAgKi9cclxuICAgIEZPTlRfQ0VOVEVSOiBcImZvbnRfY2VudGVyXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSB0aGUgbm9ybWFsIGZvbnQgYmFzZWxpbmUgKi9cclxuICAgIEFMUEhBQkVUSUM6IFwiYWxwaGFiZXRpY1wiXHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGN1cnJlbnQgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBUZXh0IHN0cmluZyB0byBkaXNwbGF5XHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFRleHQgPSBmdW5jdGlvbihzdHJpbmcpIHtcclxuICAgIHRoaXMuX3RleHQgPSBzdHJpbmc7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVNZXRyaWNzKGZhbHNlKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgdGV4dCBwb3NpdGlvblxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gWCBwb3NpdGlvblxyXG4gKiBAcGFyYW0ge251bWJlcn0geCAtIFkgcG9zaXRpb25cclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbih4LCB5KSB7XHJcbiAgICB0aGlzLl94ID0gdXRpbHMuZGVmYXVsdCh4LCB0aGlzLl94KTtcclxuICAgIHRoaXMuX3kgPSB1dGlscy5kZWZhdWx0KHksIHRoaXMuX3kpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRoZSB0ZXh0IHBvc2l0aW9uXHJcbiAqIEBwdWJsaWNcclxuICogQHJldHVybiB7b2JqZWN0fSBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXM6IHgsIHlcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogdGhpcy5feCxcclxuICAgICAgICB5OiB0aGlzLl95XHJcbiAgICB9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCBjdXJyZW50IHRleHQgc2l6ZVxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBmb250U2l6ZSBUZXh0IHNpemVcclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0VGV4dFNpemUgPSBmdW5jdGlvbihmb250U2l6ZSkge1xyXG4gICAgdGhpcy5fZm9udFNpemUgPSBmb250U2l6ZTtcclxuICAgIHRoaXMuX2NhbGN1bGF0ZU1ldHJpY3ModHJ1ZSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgcm90YXRpb24gb2YgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFJvdGF0aW9uIGluIHJhZGlhbnNcclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0Um90YXRpb24gPSBmdW5jdGlvbihhbmdsZSkge1xyXG4gICAgdGhpcy5fcm90YXRpb24gPSB1dGlscy5kZWZhdWx0KGFuZ2xlLCB0aGlzLl9yb3RhdGlvbik7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgcm90YXRpb24gb2YgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJvdGF0aW9uIGluIHJhZGlhbnNcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0Um90YXRpb24gPSBmdW5jdGlvbihhbmdsZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3JvdGF0aW9uO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgcCBpbnN0YW5jZSB0aGF0IGlzIHVzZWQgZm9yIGRyYXdpbmdcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge29iamVjdH0gcCAtIEluc3RhbmNlIG9mIHA1IGZvciBkcmF3aW5nLiBUaGlzIGlzIG9ubHkgbmVlZGVkIHdoZW4gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgdXNpbmcgYW4gb2Zmc2NyZWVuIHJlbmRlcmVyIG9yIHdoZW4gdXNpbmcgcDUgaW4gaW5zdGFuY2VcclxuICogICAgICAgICAgICAgICAgICAgICBtb2RlLlxyXG4gKiBAcmV0dXJucyB7dGhpc30gVXNlZnVsIGZvciBjaGFpbmluZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRQSW5zdGFuY2UgPSBmdW5jdGlvbihwKSB7XHJcbiAgICB0aGlzLl9wID0gdXRpbHMuZGVmYXVsdChwLCB0aGlzLl9wKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCByb3RhdGlvbiBvZiB0ZXh0XHJcbiAqIEBwdWJsaWNcclxuICogQHJldHVybnMge29iamVjdH0gSW5zdGFuY2Ugb2YgcDUgdGhhdCBpcyBiZWluZyB1c2VkIGZvciBkcmF3aW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLmdldFBJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3A7XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGFuY2hvciBwb2ludCBmb3IgdGV4dCAoaG9yaXpvbmFsIGFuZCB2ZXJ0aWNhbCBhbGlnbm1lbnQpIHJlbGF0aXZlIHRvXHJcbiAqIGJvdW5kaW5nIGJveFxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbaEFsaWduPUNFTlRFUl0gLSBIb3Jpem9uYWwgYWxpZ25tZW50XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdkFsaWduPUNFTlRFUl0gLSBWZXJ0aWNhbCBiYXNlbGluZVxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFt1cGRhdGVQb3NpdGlvbj1mYWxzZV0gLSBJZiBzZXQgdG8gdHJ1ZSwgdGhlIHBvc2l0aW9uIG9mIHRoZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgdGV4dCB3aWxsIGJlIHNoaWZ0ZWQgc28gdGhhdFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgdGV4dCB3aWxsIGJlIGRyYXduIGluIHRoZSBzYW1lXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlIGl0IHdhcyBiZWZvcmUgY2FsbGluZyBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0QW5jaG9yLlxyXG4gKiBAcmV0dXJucyB7dGhpc30gVXNlZnVsIGZvciBjaGFpbmluZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRBbmNob3IgPSBmdW5jdGlvbihoQWxpZ24sIHZBbGlnbiwgdXBkYXRlUG9zaXRpb24pIHtcclxuICAgIHZhciBvbGRQb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHRoaXMuX3gsIHRoaXMuX3kpO1xyXG4gICAgdGhpcy5faEFsaWduID0gdXRpbHMuZGVmYXVsdChoQWxpZ24sIEJib3hBbGlnbmVkVGV4dC5BTElHTi5DRU5URVIpO1xyXG4gICAgdGhpcy5fdkFsaWduID0gdXRpbHMuZGVmYXVsdCh2QWxpZ24sIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5DRU5URVIpO1xyXG4gICAgaWYgKHVwZGF0ZVBvc2l0aW9uKSB7XHJcbiAgICAgICAgdmFyIG5ld1BvcyA9IHRoaXMuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHModGhpcy5feCwgdGhpcy5feSk7XHJcbiAgICAgICAgdGhpcy5feCArPSBvbGRQb3MueCAtIG5ld1Bvcy54O1xyXG4gICAgICAgIHRoaXMuX3kgKz0gb2xkUG9zLnkgLSBuZXdQb3MueTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgYm91bmRpbmcgYm94IHdoZW4gdGhlIHRleHQgaXMgcGxhY2VkIGF0IHRoZSBzcGVjaWZpZWQgY29vcmRpbmF0ZXMuXHJcbiAqIE5vdGU6IHRoaXMgaXMgdGhlIHVucm90YXRlZCBib3VuZGluZyBib3ghIFRPRE86IEZpeCB0aGlzLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3g9Y3VycmVudCB4XSAtIEEgbmV3IHggY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpc1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbGwgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJtYW5lbnRseS4gXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeT1jdXJyZW50IHldIC0gQSBuZXcgeSBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbmVudGx5LlxyXG4gKiBAcmV0dXJuIHtvYmplY3R9IFJldHVybnMgYW4gb2JqZWN0IHdpdGggcHJvcGVydGllczogeCwgeSwgdywgaFxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRCYm94ID0gZnVuY3Rpb24oeCwgeSkge1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvbih4LCB5KTtcclxuICAgIHZhciBwb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHRoaXMuX3gsIHRoaXMuX3kpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiBwb3MueCArIHRoaXMuX2JvdW5kc09mZnNldC54LFxyXG4gICAgICAgIHk6IHBvcy55ICsgdGhpcy5fYm91bmRzT2Zmc2V0LnksXHJcbiAgICAgICAgdzogdGhpcy53aWR0aCxcclxuICAgICAgICBoOiB0aGlzLmhlaWdodFxyXG4gICAgfTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgYW4gYXJyYXkgb2YgcG9pbnRzIHRoYXQgZm9sbG93IGFsb25nIHRoZSB0ZXh0IHBhdGguIFRoaXMgd2lsbCB0YWtlIGludG9cclxuICogY29uc2lkZXJhdGlvbiB0aGUgY3VycmVudCBhbGlnbm1lbnQgc2V0dGluZ3MuXHJcbiAqIE5vdGU6IHRoaXMgaXMgYSB0aGluIHdyYXBwZXIgYXJvdW5kIGEgcDUgbWV0aG9kIGFuZCBkb2Vzbid0IGhhbmRsZSB1bnJvdGF0ZWRcclxuICogdGV4dCEgVE9ETzogRml4IHRoaXMuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeD1jdXJyZW50IHhdIC0gQSBuZXcgeCBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbmVudGx5LiBcclxuICogQHBhcmFtIHtudW1iZXJ9IFt5PWN1cnJlbnQgeV0gLSBBIG5ldyB5IGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3IuIFRoaXNcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVybWFuZW50bHkuXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gLSBBbiBvYmplY3QgdGhhdCBjYW4gaGF2ZTpcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBzYW1wbGVGYWN0b3I6IHJhdGlvIG9mIHBhdGgtbGVuZ3RoIHRvIG51bWJlclxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mIHNhbXBsZXMgKGRlZmF1bHQ9MC4yNSkuIEhpZ2hlciB2YWx1ZXMgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgbW9yZXBvaW50cyBhbmQgYXJlIHRoZXJlZm9yZSBtb3JlIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWNpc2UuIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHNpbXBsaWZ5VGhyZXNob2xkOiBpZiBzZXQgdG8gYSBub24temVybyBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSwgY29sbGluZWFyIHBvaW50cyB3aWxsIGJlIHJlbW92ZWQuIFRoZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlIHJlcHJlc2VudHMgdGhlIHRocmVzaG9sZCBhbmdsZSB0byB1c2VcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuIGRldGVybWluaW5nIHdoZXRoZXIgdHdvIGVkZ2VzIGFyZSBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaW5lYXIuXHJcbiAqIEByZXR1cm4ge2FycmF5fSBBbiBhcnJheSBvZiBwb2ludHMsIGVhY2ggd2l0aCB4LCB5ICYgYWxwaGEgKHRoZSBwYXRoIGFuZ2xlKVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRUZXh0UG9pbnRzID0gZnVuY3Rpb24oeCwgeSwgb3B0aW9ucykge1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvbih4LCB5KTtcclxuICAgIHZhciBwb2ludHMgPSB0aGlzLl9mb250LnRleHRUb1BvaW50cyh0aGlzLl90ZXh0LCB0aGlzLl94LCB0aGlzLl95LCBcclxuICAgICAgICB0aGlzLl9mb250U2l6ZSwgb3B0aW9ucyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBwb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHBvaW50c1tpXS54LCBwb2ludHNbaV0ueSk7XHJcbiAgICAgICAgcG9pbnRzW2ldLnggPSBwb3MueDtcclxuICAgICAgICBwb2ludHNbaV0ueSA9IHBvcy55O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBvaW50cztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEcmF3cyB0aGUgdGV4dCBwYXJ0aWNsZSB3aXRoIHRoZSBzcGVjaWZpZWQgc3R5bGUgcGFyYW1ldGVycy4gTm90ZTogdGhpcyBpc1xyXG4gKiBnb2luZyB0byBzZXQgdGhlIHRleHRGb250LCB0ZXh0U2l6ZSAmIHJvdGF0aW9uIGJlZm9yZSBkcmF3aW5nLiBZb3Ugc2hvdWxkIHNldFxyXG4gKiB0aGUgY29sb3Ivc3Ryb2tlL2ZpbGwgdGhhdCB5b3Ugd2FudCBiZWZvcmUgZHJhd2luZy4gVGhpcyBmdW5jdGlvbiB3aWxsIGNsZWFuXHJcbiAqIHVwIGFmdGVyIGl0c2VsZiBhbmQgcmVzZXQgc3R5bGluZyBiYWNrIHRvIHdoYXQgaXQgd2FzIGJlZm9yZSBpdCB3YXMgY2FsbGVkLlxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeD1jdXJyZW50IHhdIC0gQSBuZXcgeCBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzIHdpbGxcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gcGVybWFuZW50bHkuIFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3k9Y3VycmVudCB5XSAtIEEgbmV3IHkgY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpcyB3aWxsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBwZXJtYW5lbnRseS5cclxuICogQHBhcmFtIHtib29sZWFufSBbZHJhd0JvdW5kcz1mYWxzZV0gLSBGbGFnIGZvciBkcmF3aW5nIGJvdW5kaW5nIGJveFxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oeCwgeSwgZHJhd0JvdW5kcykge1xyXG4gICAgZHJhd0JvdW5kcyA9IHV0aWxzLmRlZmF1bHQoZHJhd0JvdW5kcywgZmFsc2UpO1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvbih4LCB5KTtcclxuICAgIHZhciBwb3MgPSB7XHJcbiAgICAgICAgeDogdGhpcy5feCwgXHJcbiAgICAgICAgeTogdGhpcy5feVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9wLnB1c2goKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3JvdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuX2NhbGN1bGF0ZVJvdGF0ZWRDb29yZHMocG9zLngsIHBvcy55LCB0aGlzLl9yb3RhdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuX3Aucm90YXRlKHRoaXMuX3JvdGF0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBvcyA9IHRoaXMuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHMocG9zLngsIHBvcy55KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcC50ZXh0QWxpZ24odGhpcy5fcC5MRUZULCB0aGlzLl9wLkJBU0VMSU5FKTtcclxuICAgICAgICB0aGlzLl9wLnRleHRGb250KHRoaXMuX2ZvbnQpO1xyXG4gICAgICAgIHRoaXMuX3AudGV4dFNpemUodGhpcy5fZm9udFNpemUpO1xyXG4gICAgICAgIHRoaXMuX3AudGV4dCh0aGlzLl90ZXh0LCBwb3MueCwgcG9zLnkpO1xyXG5cclxuICAgICAgICBpZiAoZHJhd0JvdW5kcykge1xyXG4gICAgICAgICAgICB0aGlzLl9wLnN0cm9rZSgyMDApO1xyXG4gICAgICAgICAgICB2YXIgYm91bmRzWCA9IHBvcy54ICsgdGhpcy5fYm91bmRzT2Zmc2V0Lng7XHJcbiAgICAgICAgICAgIHZhciBib3VuZHNZID0gcG9zLnkgKyB0aGlzLl9ib3VuZHNPZmZzZXQueTtcclxuICAgICAgICAgICAgdGhpcy5fcC5ub0ZpbGwoKTtcclxuICAgICAgICAgICAgdGhpcy5fcC5yZWN0KGJvdW5kc1gsIGJvdW5kc1ksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgdGhpcy5fcC5wb3AoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBQcm9qZWN0IHRoZSBjb29yZGluYXRlcyAoeCwgeSkgaW50byBhIHJvdGF0ZWQgY29vcmRpbmF0ZSBzeXN0ZW1cclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtudW1iZXJ9IHggLSBYIGNvb3JkaW5hdGUgKGluIHVucm90YXRlZCBzcGFjZSlcclxuICogQHBhcmFtIHtudW1iZXJ9IHkgLSBZIGNvb3JkaW5hdGUgKGluIHVucm90YXRlZCBzcGFjZSlcclxuICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gUmFkaWFucyBvZiByb3RhdGlvbiB0byBhcHBseVxyXG4gKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCB3aXRoIHggJiB5IHByb3BlcnRpZXNcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuX2NhbGN1bGF0ZVJvdGF0ZWRDb29yZHMgPSBmdW5jdGlvbiAoeCwgeSwgYW5nbGUpIHsgIFxyXG4gICAgdmFyIHJ4ID0gTWF0aC5jb3MoYW5nbGUpICogeCArIE1hdGguY29zKE1hdGguUEkgLyAyIC0gYW5nbGUpICogeTtcclxuICAgIHZhciByeSA9IC1NYXRoLnNpbihhbmdsZSkgKiB4ICsgTWF0aC5zaW4oTWF0aC5QSSAvIDIgLSBhbmdsZSkgKiB5O1xyXG4gICAgcmV0dXJuIHt4OiByeCwgeTogcnl9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgZHJhdyBjb29yZGluYXRlcyBmb3IgdGhlIHRleHQsIGFsaWduaW5nIGJhc2VkIG9uIHRoZSBib3VuZGluZyBib3guXHJcbiAqIFRoZSB0ZXh0IGlzIGV2ZW50dWFsbHkgZHJhd24gd2l0aCBjYW52YXMgYWxpZ25tZW50IHNldCB0byBsZWZ0ICYgYmFzZWxpbmUsIHNvXHJcbiAqIHRoaXMgZnVuY3Rpb24gdGFrZXMgYSBkZXNpcmVkIHBvcyAmIGFsaWdubWVudCBhbmQgcmV0dXJucyB0aGUgYXBwcm9wcmlhdGVcclxuICogY29vcmRpbmF0ZXMgZm9yIHRoZSBsZWZ0ICYgYmFzZWxpbmUuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gWCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gWSBjb29yZGluYXRlXHJcbiAqIEByZXR1cm4ge29iamVjdH0gT2JqZWN0IHdpdGggeCAmIHkgcHJvcGVydGllc1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5fY2FsY3VsYXRlQWxpZ25lZENvb3JkcyA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICAgIHZhciBuZXdYLCBuZXdZO1xyXG4gICAgc3dpdGNoICh0aGlzLl9oQWxpZ24pIHtcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfTEVGVDpcclxuICAgICAgICAgICAgbmV3WCA9IHg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9DRU5URVI6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4IC0gdGhpcy5oYWxmV2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9SSUdIVDpcclxuICAgICAgICAgICAgbmV3WCA9IHggLSB0aGlzLndpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBuZXdYID0geDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbnJlY29nbml6ZWQgaG9yaXpvbmFsIGFsaWduOlwiLCB0aGlzLl9oQWxpZ24pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHN3aXRjaCAodGhpcy5fdkFsaWduKSB7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX1RPUDpcclxuICAgICAgICAgICAgbmV3WSA9IHkgLSB0aGlzLl9ib3VuZHNPZmZzZXQueTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUjpcclxuICAgICAgICAgICAgbmV3WSA9IHkgKyB0aGlzLl9kaXN0QmFzZVRvTWlkO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5CT1hfQk9UVE9NOlxyXG4gICAgICAgICAgICBuZXdZID0geSAtIHRoaXMuX2Rpc3RCYXNlVG9Cb3R0b207XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkZPTlRfQ0VOVEVSOlxyXG4gICAgICAgICAgICAvLyBIZWlnaHQgaXMgYXBwcm94aW1hdGVkIGFzIGFzY2VudCArIGRlc2NlbnRcclxuICAgICAgICAgICAgbmV3WSA9IHkgLSB0aGlzLl9kZXNjZW50ICsgKHRoaXMuX2FzY2VudCArIHRoaXMuX2Rlc2NlbnQpIC8gMjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQUxQSEFCRVRJQzpcclxuICAgICAgICAgICAgbmV3WSA9IHk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5O1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVucmVjb2duaXplZCB2ZXJ0aWNhbCBhbGlnbjpcIiwgdGhpcy5fdkFsaWduKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge3g6IG5ld1gsIHk6IG5ld1l9O1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIGJvdW5kaW5nIGJveCBhbmQgdmFyaW91cyBtZXRyaWNzIGZvciB0aGUgY3VycmVudCB0ZXh0IGFuZCBmb250XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLl9jYWxjdWxhdGVNZXRyaWNzID0gZnVuY3Rpb24oc2hvdWxkVXBkYXRlSGVpZ2h0KSB7ICBcclxuICAgIC8vIHA1IDAuNS4wIGhhcyBhIGJ1ZyAtIHRleHQgYm91bmRzIGFyZSBjbGlwcGVkIGJ5ICgwLCAwKVxyXG4gICAgLy8gQ2FsY3VsYXRpbmcgYm91bmRzIGhhY2tcclxuICAgIHZhciBib3VuZHMgPSB0aGlzLl9mb250LnRleHRCb3VuZHModGhpcy5fdGV4dCwgMTAwMCwgMTAwMCwgdGhpcy5fZm9udFNpemUpO1xyXG4gICAgLy8gQm91bmRzIGlzIGEgcmVmZXJlbmNlIC0gaWYgd2UgbWVzcyB3aXRoIGl0IGRpcmVjdGx5LCB3ZSBjYW4gbWVzcyB1cCBcclxuICAgIC8vIGZ1dHVyZSB2YWx1ZXMhIChJdCBjaGFuZ2VzIHRoZSBiYm94IGNhY2hlIGluIHA1LilcclxuICAgIGJvdW5kcyA9IHsgXHJcbiAgICAgICAgeDogYm91bmRzLnggLSAxMDAwLCBcclxuICAgICAgICB5OiBib3VuZHMueSAtIDEwMDAsIFxyXG4gICAgICAgIHc6IGJvdW5kcy53LCBcclxuICAgICAgICBoOiBib3VuZHMuaCBcclxuICAgIH07IFxyXG5cclxuICAgIGlmIChzaG91bGRVcGRhdGVIZWlnaHQpIHtcclxuICAgICAgICB0aGlzLl9hc2NlbnQgPSB0aGlzLl9mb250Ll90ZXh0QXNjZW50KHRoaXMuX2ZvbnRTaXplKTtcclxuICAgICAgICB0aGlzLl9kZXNjZW50ID0gdGhpcy5fZm9udC5fdGV4dERlc2NlbnQodGhpcy5fZm9udFNpemUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZSBib3VuZHMgdG8gY2FsY3VsYXRlIGZvbnQgbWV0cmljc1xyXG4gICAgdGhpcy53aWR0aCA9IGJvdW5kcy53O1xyXG4gICAgdGhpcy5oZWlnaHQgPSBib3VuZHMuaDtcclxuICAgIHRoaXMuaGFsZldpZHRoID0gdGhpcy53aWR0aCAvIDI7XHJcbiAgICB0aGlzLmhhbGZIZWlnaHQgPSB0aGlzLmhlaWdodCAvIDI7XHJcbiAgICB0aGlzLl9ib3VuZHNPZmZzZXQgPSB7IHg6IGJvdW5kcy54LCB5OiBib3VuZHMueSB9O1xyXG4gICAgdGhpcy5fZGlzdEJhc2VUb01pZCA9IE1hdGguYWJzKGJvdW5kcy55KSAtIHRoaXMuaGFsZkhlaWdodDtcclxuICAgIHRoaXMuX2Rpc3RCYXNlVG9Cb3R0b20gPSB0aGlzLmhlaWdodCAtIE1hdGguYWJzKGJvdW5kcy55KTtcclxufTsiLCJleHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbih2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICByZXR1cm4gKHZhbHVlICE9PSB1bmRlZmluZWQpID8gdmFsdWUgOiBkZWZhdWx0VmFsdWU7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBIb3ZlclNsaWRlc2hvd3M7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gSG92ZXJTbGlkZXNob3dzKHNsaWRlc2hvd0RlbGF5LCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICB0aGlzLl9zbGlkZXNob3dEZWxheSA9IHNsaWRlc2hvd0RlbGF5ICE9PSB1bmRlZmluZWQgPyBzbGlkZXNob3dEZWxheSA6IDIwMDA7XHJcbiAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gdHJhbnNpdGlvbkR1cmF0aW9uICE9PSB1bmRlZmluZWQgPyB0cmFuc2l0aW9uRHVyYXRpb24gOiAxMDAwO1xyXG5cclxuICB0aGlzLl9zbGlkZXNob3dzID0gW107XHJcbiAgdGhpcy5yZWxvYWQoKTtcclxufVxyXG5cclxuSG92ZXJTbGlkZXNob3dzLnByb3RvdHlwZS5yZWxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAvLyBOb3RlOiB0aGlzIGlzIGN1cnJlbnRseSBub3QgcmVhbGx5IGJlaW5nIHVzZWQuIFdoZW4gYSBwYWdlIGlzIGxvYWRlZCxcclxuICAvLyBtYWluLmpzIGlzIGp1c3QgcmUtaW5zdGFuY2luZyB0aGUgSG92ZXJTbGlkZXNob3dzXHJcbiAgdmFyIG9sZFNsaWRlc2hvd3MgPSB0aGlzLl9zbGlkZXNob3dzIHx8IFtdO1xyXG4gIHRoaXMuX3NsaWRlc2hvd3MgPSBbXTtcclxuICAkKFwiLmhvdmVyLXNsaWRlc2hvd1wiKS5lYWNoKFxyXG4gICAgZnVuY3Rpb24oXywgZWxlbWVudCkge1xyXG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG4gICAgICB2YXIgaW5kZXggPSB0aGlzLl9maW5kSW5TbGlkZXNob3dzKGVsZW1lbnQsIG9sZFNsaWRlc2hvd3MpO1xyXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgdmFyIHNsaWRlc2hvdyA9IG9sZFNsaWRlc2hvd3Muc3BsaWNlKGluZGV4LCAxKVswXTtcclxuICAgICAgICB0aGlzLl9zbGlkZXNob3dzLnB1c2goc2xpZGVzaG93KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLl9zbGlkZXNob3dzLnB1c2goXHJcbiAgICAgICAgICBuZXcgU2xpZGVzaG93KCRlbGVtZW50LCB0aGlzLl9zbGlkZXNob3dEZWxheSwgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uKVxyXG4gICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzKVxyXG4gICk7XHJcbn07XHJcblxyXG5Ib3ZlclNsaWRlc2hvd3MucHJvdG90eXBlLl9maW5kSW5TbGlkZXNob3dzID0gZnVuY3Rpb24oZWxlbWVudCwgc2xpZGVzaG93cykge1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzaG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgaWYgKGVsZW1lbnQgPT09IHNsaWRlc2hvd3NbaV0uZ2V0RWxlbWVudCgpKSB7XHJcbiAgICAgIHJldHVybiBpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gLTE7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBTbGlkZXNob3coJGNvbnRhaW5lciwgc2xpZGVzaG93RGVsYXksIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gIHRoaXMuXyRjb250YWluZXIgPSAkY29udGFpbmVyO1xyXG4gIHRoaXMuX3NsaWRlc2hvd0RlbGF5ID0gc2xpZGVzaG93RGVsYXk7XHJcbiAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gdHJhbnNpdGlvbkR1cmF0aW9uO1xyXG4gIHRoaXMuX3RpbWVvdXRJZCA9IG51bGw7XHJcbiAgdGhpcy5faW1hZ2VJbmRleCA9IDA7XHJcbiAgdGhpcy5fJGltYWdlcyA9IFtdO1xyXG5cclxuICAvLyBTZXQgdXAgYW5kIGNhY2hlIHJlZmVyZW5jZXMgdG8gaW1hZ2VzXHJcbiAgdGhpcy5fJGNvbnRhaW5lci5maW5kKFwiaW1nXCIpLmVhY2goXHJcbiAgICBmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICB2YXIgJGltYWdlID0gJChlbGVtZW50KTtcclxuICAgICAgJGltYWdlLmNzcyh7XHJcbiAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICB0b3A6IFwiMFwiLFxyXG4gICAgICAgIGxlZnQ6IFwiMFwiLFxyXG4gICAgICAgIHpJbmRleDogaW5kZXggPT09IDAgPyAyIDogMCAvLyBGaXJzdCBpbWFnZSBzaG91bGQgYmUgb24gdG9wXHJcbiAgICAgIH0pO1xyXG4gICAgICB0aGlzLl8kaW1hZ2VzLnB1c2goJGltYWdlKTtcclxuICAgIH0uYmluZCh0aGlzKVxyXG4gICk7XHJcblxyXG4gIC8vIERldGVybWluZSB3aGV0aGVyIHRvIGJpbmQgaW50ZXJhY3Rpdml0eVxyXG4gIHRoaXMuX251bUltYWdlcyA9IHRoaXMuXyRpbWFnZXMubGVuZ3RoO1xyXG4gIGlmICh0aGlzLl9udW1JbWFnZXMgPD0gMSkgcmV0dXJuO1xyXG5cclxuICAvLyBCaW5kIGV2ZW50IGxpc3RlbmVyc1xyXG4gIHRoaXMuXyRjb250YWluZXIub24oXCJtb3VzZWVudGVyXCIsIHRoaXMuX29uRW50ZXIuYmluZCh0aGlzKSk7XHJcbiAgdGhpcy5fJGNvbnRhaW5lci5vbihcIm1vdXNlbGVhdmVcIiwgdGhpcy5fb25MZWF2ZS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXRFbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMuXyRjb250YWluZXIuZ2V0KDApO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXQkRWxlbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLl8kY29udGFpbmVyO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fb25FbnRlciA9IGZ1bmN0aW9uKCkge1xyXG4gIC8vIEZpcnN0IHRyYW5zaXRpb24gc2hvdWxkIGhhcHBlbiBwcmV0dHkgc29vbiBhZnRlciBob3ZlcmluZyBpbiBvcmRlclxyXG4gIC8vIHRvIGNsdWUgdGhlIHVzZXIgaW50byB3aGF0IGlzIGhhcHBlbmluZ1xyXG4gIHRoaXMuX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fYWR2YW5jZVNsaWRlc2hvdy5iaW5kKHRoaXMpLCA1MDApO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fb25MZWF2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIGNsZWFySW50ZXJ2YWwodGhpcy5fdGltZW91dElkKTtcclxuICB0aGlzLl90aW1lb3V0SWQgPSBudWxsO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fYWR2YW5jZVNsaWRlc2hvdyA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuX2ltYWdlSW5kZXggKz0gMTtcclxuICB2YXIgaTtcclxuXHJcbiAgLy8gTW92ZSB0aGUgaW1hZ2UgZnJvbSAyIHN0ZXBzIGFnbyBkb3duIHRvIHRoZSBib3R0b20gei1pbmRleCBhbmQgbWFrZVxyXG4gIC8vIGl0IGludmlzaWJsZVxyXG4gIGlmICh0aGlzLl9udW1JbWFnZXMgPj0gMykge1xyXG4gICAgaSA9IHV0aWxpdGllcy53cmFwSW5kZXgodGhpcy5faW1hZ2VJbmRleCAtIDIsIHRoaXMuX251bUltYWdlcyk7XHJcbiAgICB0aGlzLl8kaW1hZ2VzW2ldLmNzcyh7XHJcbiAgICAgIHpJbmRleDogMCxcclxuICAgICAgb3BhY2l0eTogMFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLl8kaW1hZ2VzW2ldLnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICB9XHJcblxyXG4gIC8vIE1vdmUgdGhlIGltYWdlIGZyb20gMSBzdGVwcyBhZ28gZG93biB0byB0aGUgbWlkZGxlIHotaW5kZXggYW5kIG1ha2VcclxuICAvLyBpdCBjb21wbGV0ZWx5IHZpc2libGVcclxuICBpZiAodGhpcy5fbnVtSW1hZ2VzID49IDIpIHtcclxuICAgIGkgPSB1dGlsaXRpZXMud3JhcEluZGV4KHRoaXMuX2ltYWdlSW5kZXggLSAxLCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gICAgdGhpcy5fJGltYWdlc1tpXS5jc3Moe1xyXG4gICAgICB6SW5kZXg6IDEsXHJcbiAgICAgIG9wYWNpdHk6IDFcclxuICAgIH0pO1xyXG4gICAgdGhpcy5fJGltYWdlc1tpXS52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgfVxyXG5cclxuICAvLyBNb3ZlIHRoZSBjdXJyZW50IGltYWdlIHRvIHRoZSB0b3Agei1pbmRleCBhbmQgZmFkZSBpdCBpblxyXG4gIHRoaXMuX2ltYWdlSW5kZXggPSB1dGlsaXRpZXMud3JhcEluZGV4KHRoaXMuX2ltYWdlSW5kZXgsIHRoaXMuX251bUltYWdlcyk7XHJcbiAgdGhpcy5fJGltYWdlc1t0aGlzLl9pbWFnZUluZGV4XS5jc3Moe1xyXG4gICAgekluZGV4OiAyLFxyXG4gICAgb3BhY2l0eTogMFxyXG4gIH0pO1xyXG4gIHRoaXMuXyRpbWFnZXNbdGhpcy5faW1hZ2VJbmRleF0udmVsb2NpdHkoXHJcbiAgICB7XHJcbiAgICAgIG9wYWNpdHk6IDFcclxuICAgIH0sXHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sXHJcbiAgICBcImVhc2VJbk91dFF1YWRcIlxyXG4gICk7XHJcblxyXG4gIC8vIFNjaGVkdWxlIG5leHQgdHJhbnNpdGlvblxyXG4gIHRoaXMuX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fYWR2YW5jZVNsaWRlc2hvdy5iaW5kKHRoaXMpLCB0aGlzLl9zbGlkZXNob3dEZWxheSk7XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gQmFzZUxvZ29Ta2V0Y2g7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gQmFzZUxvZ29Ta2V0Y2goJG5hdiwgJG5hdkxvZ28sIGZvbnRQYXRoKSB7XHJcbiAgdGhpcy5fJG5hdiA9ICRuYXY7XHJcbiAgdGhpcy5fJG5hdkxvZ28gPSAkbmF2TG9nbztcclxuICB0aGlzLl9mb250UGF0aCA9IGZvbnRQYXRoO1xyXG5cclxuICB0aGlzLl90ZXh0ID0gdGhpcy5fJG5hdkxvZ28udGV4dCgpO1xyXG4gIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbiAgdGhpcy5faXNNb3VzZU92ZXIgPSBmYWxzZTtcclxuICB0aGlzLl9pc092ZXJOYXZMb2dvID0gZmFsc2U7XHJcblxyXG4gIHRoaXMuX3VwZGF0ZVRleHRPZmZzZXQoKTtcclxuICB0aGlzLl91cGRhdGVTaXplKCk7XHJcbiAgdGhpcy5fdXBkYXRlRm9udFNpemUoKTtcclxuXHJcbiAgLy8gQ3JlYXRlIGEgKHJlbGF0aXZlIHBvc2l0aW9uZWQpIGNvbnRhaW5lciBmb3IgdGhlIHNrZXRjaCBpbnNpZGUgb2YgdGhlXHJcbiAgLy8gbmF2LCBidXQgbWFrZSBzdXJlIHRoYXQgaXQgaXMgQkVISU5EIGV2ZXJ5dGhpbmcgZWxzZS4gRXZlbnR1YWxseSwgd2Ugd2lsbFxyXG4gIC8vIGRyb3AganVzdCB0aGUgbmF2IGxvZ28gKG5vdCB0aGUgbmF2IGxpbmtzISkgYmVoaW5kIHRoZSBjYW52YXMuXHJcbiAgdGhpcy5fJGNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKVxyXG4gICAgLmNzcyh7XHJcbiAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgIHRvcDogXCIwcHhcIixcclxuICAgICAgbGVmdDogXCIwcHhcIlxyXG4gICAgfSlcclxuICAgIC5wcmVwZW5kVG8odGhpcy5fJG5hdilcclxuICAgIC5oaWRlKCk7XHJcblxyXG4gIHRoaXMuX2NyZWF0ZVA1SW5zdGFuY2UoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIG5ldyBwNSBpbnN0YW5jZSBhbmQgYmluZCB0aGUgYXBwcm9wcmlhdGUgY2xhc3MgbWV0aG9kcyB0byB0aGVcclxuICogaW5zdGFuY2UuIFRoaXMgYWxzbyBmaWxscyBpbiB0aGUgcCBwYXJhbWV0ZXIgb24gdGhlIGNsYXNzIG1ldGhvZHMgKHNldHVwLFxyXG4gKiBkcmF3LCBldGMuKSBzbyB0aGF0IHRob3NlIGZ1bmN0aW9ucyBjYW4gYmUgYSBsaXR0bGUgbGVzcyB2ZXJib3NlIDopXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2NyZWF0ZVA1SW5zdGFuY2UgPSBmdW5jdGlvbigpIHtcclxuICBuZXcgcDUoXHJcbiAgICBmdW5jdGlvbihwKSB7XHJcbiAgICAgIHRoaXMuX3AgPSBwO1xyXG4gICAgICBwLnByZWxvYWQgPSB0aGlzLl9wcmVsb2FkLmJpbmQodGhpcywgcCk7XHJcbiAgICAgIHAuc2V0dXAgPSB0aGlzLl9zZXR1cC5iaW5kKHRoaXMsIHApO1xyXG4gICAgICBwLmRyYXcgPSB0aGlzLl9kcmF3LmJpbmQodGhpcywgcCk7XHJcbiAgICB9LmJpbmQodGhpcyksXHJcbiAgICB0aGlzLl8kY29udGFpbmVyLmdldCgwKVxyXG4gICk7XHJcbn07XHJcblxyXG4vKipcclxuICogRmluZCB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgdG9wIGxlZnQgb2YgdGhlIG5hdiB0byB0aGUgYnJhbmQgbG9nbydzIGJhc2VsaW5lLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl91cGRhdGVUZXh0T2Zmc2V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIGJhc2VsaW5lRGl2ID0gJChcIjxkaXY+XCIpXHJcbiAgICAuY3NzKHtcclxuICAgICAgZGlzcGxheTogXCJpbmxpbmUtYmxvY2tcIixcclxuICAgICAgdmVydGljYWxBbGlnbjogXCJiYXNlbGluZVwiXHJcbiAgICB9KVxyXG4gICAgLnByZXBlbmRUbyh0aGlzLl8kbmF2TG9nbyk7XHJcbiAgdmFyIG5hdk9mZnNldCA9IHRoaXMuXyRuYXYub2Zmc2V0KCk7XHJcbiAgdmFyIGxvZ29CYXNlbGluZU9mZnNldCA9IGJhc2VsaW5lRGl2Lm9mZnNldCgpO1xyXG4gIHRoaXMuX3RleHRPZmZzZXQgPSB7XHJcbiAgICB0b3A6IGxvZ29CYXNlbGluZU9mZnNldC50b3AgLSBuYXZPZmZzZXQudG9wLFxyXG4gICAgbGVmdDogbG9nb0Jhc2VsaW5lT2Zmc2V0LmxlZnQgLSBuYXZPZmZzZXQubGVmdFxyXG4gIH07XHJcbiAgYmFzZWxpbmVEaXYucmVtb3ZlKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRmluZCB0aGUgYm91bmRpbmcgYm94IG9mIHRoZSBicmFuZCBsb2dvIGluIHRoZSBuYXYuIFRoaXMgYmJveCBjYW4gdGhlbiBiZVxyXG4gKiB1c2VkIHRvIGNvbnRyb2wgd2hlbiB0aGUgY3Vyc29yIHNob3VsZCBiZSBhIHBvaW50ZXIuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2NhbGN1bGF0ZU5hdkxvZ29Cb3VuZHMgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgbmF2T2Zmc2V0ID0gdGhpcy5fJG5hdi5vZmZzZXQoKTtcclxuICB2YXIgbG9nb09mZnNldCA9IHRoaXMuXyRuYXZMb2dvLm9mZnNldCgpO1xyXG4gIHRoaXMuX2xvZ29CYm94ID0ge1xyXG4gICAgeTogbG9nb09mZnNldC50b3AgLSBuYXZPZmZzZXQudG9wLFxyXG4gICAgeDogbG9nb09mZnNldC5sZWZ0IC0gbmF2T2Zmc2V0LmxlZnQsXHJcbiAgICB3OiB0aGlzLl8kbmF2TG9nby5vdXRlcldpZHRoKCksIC8vIEV4Y2x1ZGUgbWFyZ2luIGZyb20gdGhlIGJib3hcclxuICAgIGg6IHRoaXMuXyRuYXZMb2dvLm91dGVySGVpZ2h0KCkgLy8gTGlua3MgYXJlbid0IGNsaWNrYWJsZSBvbiBtYXJnaW5cclxuICB9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgZGltZW5zaW9ucyB0byBtYXRjaCB0aGUgbmF2IC0gZXhjbHVkaW5nIGFueSBtYXJnaW4sIHBhZGRpbmcgJlxyXG4gKiBib3JkZXIuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3VwZGF0ZVNpemUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl93aWR0aCA9IHRoaXMuXyRuYXYuaW5uZXJXaWR0aCgpO1xyXG4gIHRoaXMuX2hlaWdodCA9IHRoaXMuXyRuYXYuaW5uZXJIZWlnaHQoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHcmFiIHRoZSBmb250IHNpemUgZnJvbSB0aGUgYnJhbmQgbG9nbyBsaW5rLiBUaGlzIG1ha2VzIHRoZSBmb250IHNpemUgb2YgdGhlXHJcbiAqIHNrZXRjaCByZXNwb25zaXZlLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl91cGRhdGVGb250U2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuX2ZvbnRTaXplID0gdGhpcy5fJG5hdkxvZ28uY3NzKFwiZm9udFNpemVcIikucmVwbGFjZShcInB4XCIsIFwiXCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFdoZW4gdGhlIGJyb3dzZXIgaXMgcmVzaXplZCwgcmVjYWxjdWxhdGUgYWxsIHRoZSBuZWNlc3Nhcnkgc3RhdHMgc28gdGhhdCB0aGVcclxuICogc2tldGNoIGNhbiBiZSByZXNwb25zaXZlLiBUaGUgbG9nbyBpbiB0aGUgc2tldGNoIHNob3VsZCBBTFdBWVMgZXhhY3RseSBtYXRjaFxyXG4gKiB0aGUgYnJhbmcgbG9nbyBsaW5rIHRoZSBIVE1MLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZSA9IGZ1bmN0aW9uKHApIHtcclxuICB0aGlzLl91cGRhdGVTaXplKCk7XHJcbiAgdGhpcy5fdXBkYXRlRm9udFNpemUoKTtcclxuICB0aGlzLl91cGRhdGVUZXh0T2Zmc2V0KCk7XHJcbiAgdGhpcy5fY2FsY3VsYXRlTmF2TG9nb0JvdW5kcygpO1xyXG4gIHAucmVzaXplQ2FudmFzKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgX2lzTW91c2VPdmVyIHByb3BlcnR5LlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXRNb3VzZU92ZXIgPSBmdW5jdGlvbihpc01vdXNlT3Zlcikge1xyXG4gIHRoaXMuX2lzTW91c2VPdmVyID0gaXNNb3VzZU92ZXI7XHJcbn07XHJcblxyXG4vKipcclxuICogSWYgdGhlIGN1cnNvciBpcyBzZXQgdG8gYSBwb2ludGVyLCBmb3J3YXJkIGFueSBjbGljayBldmVudHMgdG8gdGhlIG5hdiBsb2dvLlxyXG4gKiBUaGlzIHJlZHVjZXMgdGhlIG5lZWQgZm9yIHRoZSBjYW52YXMgdG8gZG8gYW55IEFKQVgteSBzdHVmZi5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25DbGljayA9IGZ1bmN0aW9uKGUpIHtcclxuICBpZiAodGhpcy5faXNPdmVyTmF2TG9nbykgdGhpcy5fJG5hdkxvZ28udHJpZ2dlcihlKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlIHByZWxvYWQgbWV0aG9kIHRoYXQganVzdCBsb2FkcyB0aGUgbmVjZXNzYXJ5IGZvbnRcclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fcHJlbG9hZCA9IGZ1bmN0aW9uKHApIHtcclxuICB0aGlzLl9mb250ID0gcC5sb2FkRm9udCh0aGlzLl9mb250UGF0aCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQmFzZSBzZXR1cCBtZXRob2QgdGhhdCBkb2VzIHNvbWUgaGVhdnkgbGlmdGluZy4gSXQgaGlkZXMgdGhlIG5hdiBicmFuZCBsb2dvXHJcbiAqIGFuZCByZXZlYWxzIHRoZSBjYW52YXMuIEl0IGFsc28gc2V0cyB1cCBhIGxvdCBvZiB0aGUgaW50ZXJuYWwgdmFyaWFibGVzIGFuZFxyXG4gKiBjYW52YXMgZXZlbnRzLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cCA9IGZ1bmN0aW9uKHApIHtcclxuICB2YXIgcmVuZGVyZXIgPSBwLmNyZWF0ZUNhbnZhcyh0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcclxuICB0aGlzLl8kY2FudmFzID0gJChyZW5kZXJlci5jYW52YXMpO1xyXG5cclxuICAvLyBTaG93IHRoZSBjYW52YXMgYW5kIGhpZGUgdGhlIGxvZ28uIFVzaW5nIHNob3cvaGlkZSBvbiB0aGUgbG9nbyB3aWxsIGNhdXNlXHJcbiAgLy8galF1ZXJ5IHRvIG11Y2sgd2l0aCB0aGUgcG9zaXRpb25pbmcsIHdoaWNoIGlzIHVzZWQgdG8gY2FsY3VsYXRlIHdoZXJlIHRvXHJcbiAgLy8gZHJhdyB0aGUgY2FudmFzIHRleHQuIEluc3RlYWQsIGp1c3QgcHVzaCB0aGUgbG9nbyBiZWhpbmQgdGhlIGNhbnZhcy4gVGhpc1xyXG4gIC8vIGFsbG93cyBtYWtlcyBpdCBzbyB0aGUgY2FudmFzIGlzIHN0aWxsIGJlaGluZCB0aGUgbmF2IGxpbmtzLlxyXG4gIHRoaXMuXyRjb250YWluZXIuc2hvdygpO1xyXG4gIHRoaXMuXyRuYXZMb2dvLmNzcyhcInpJbmRleFwiLCAtMSk7XHJcblxyXG4gIC8vIFRoZXJlIGlzbid0IGEgZ29vZCB3YXkgdG8gY2hlY2sgd2hldGhlciB0aGUgc2tldGNoIGhhcyB0aGUgbW91c2Ugb3ZlclxyXG4gIC8vIGl0LiBwLm1vdXNlWCAmIHAubW91c2VZIGFyZSBpbml0aWFsaXplZCB0byAoMCwgMCksIGFuZCBwLmZvY3VzZWQgaXNuJ3RcclxuICAvLyBhbHdheXMgcmVsaWFibGUuXHJcbiAgdGhpcy5fJGNhbnZhcy5vbihcIm1vdXNlb3ZlclwiLCB0aGlzLl9zZXRNb3VzZU92ZXIuYmluZCh0aGlzLCB0cnVlKSk7XHJcbiAgdGhpcy5fJGNhbnZhcy5vbihcIm1vdXNlb3V0XCIsIHRoaXMuX3NldE1vdXNlT3Zlci5iaW5kKHRoaXMsIGZhbHNlKSk7XHJcblxyXG4gIC8vIEZvcndhcmQgbW91c2UgY2xpY2tzIHRvIHRoZSBuYXYgbG9nb1xyXG4gIHRoaXMuXyRjYW52YXMub24oXCJjbGlja1wiLCB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAvLyBXaGVuIHRoZSB3aW5kb3cgaXMgcmVzaXplZCwgdGV4dCAmIGNhbnZhcyBzaXppbmcgYW5kIHBsYWNlbWVudCBuZWVkIHRvIGJlXHJcbiAgLy8gcmVjYWxjdWxhdGVkLiBUaGUgc2l0ZSBpcyByZXNwb25zaXZlLCBzbyB0aGUgaW50ZXJhY3RpdmUgY2FudmFzIHNob3VsZCBiZVxyXG4gIC8vIHRvbyFcclxuICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgdGhpcy5fb25SZXNpemUuYmluZCh0aGlzLCBwKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQmFzZSBkcmF3IG1ldGhvZCB0aGF0IGNvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSBjdXJzb3IgaXMgYSBwb2ludGVyLiBJdFxyXG4gKiBzaG91bGQgb25seSBiZSBhIHBvaW50ZXIgd2hlbiB0aGUgbW91c2UgaXMgb3ZlciB0aGUgbmF2IGJyYW5kIGxvZ28uXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbihwKSB7XHJcbiAgaWYgKHRoaXMuX2lzTW91c2VPdmVyKSB7XHJcbiAgICB2YXIgaXNPdmVyTG9nbyA9IHV0aWxzLmlzSW5SZWN0KHAubW91c2VYLCBwLm1vdXNlWSwgdGhpcy5fbG9nb0Jib3gpO1xyXG4gICAgaWYgKCF0aGlzLl9pc092ZXJOYXZMb2dvICYmIGlzT3ZlckxvZ28pIHtcclxuICAgICAgdGhpcy5faXNPdmVyTmF2TG9nbyA9IHRydWU7XHJcbiAgICAgIHRoaXMuXyRjYW52YXMuY3NzKFwiY3Vyc29yXCIsIFwicG9pbnRlclwiKTtcclxuICAgIH0gZWxzZSBpZiAodGhpcy5faXNPdmVyTmF2TG9nbyAmJiAhaXNPdmVyTG9nbykge1xyXG4gICAgICB0aGlzLl9pc092ZXJOYXZMb2dvID0gZmFsc2U7XHJcbiAgICAgIHRoaXMuXyRjYW52YXMuY3NzKFwiY3Vyc29yXCIsIFwiaW5pdGlhbFwiKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gU2tldGNoO1xyXG5cclxudmFyIEJib3hUZXh0ID0gcmVxdWlyZShcInA1LWJib3gtYWxpZ25lZC10ZXh0XCIpO1xyXG52YXIgQmFzZUxvZ29Ta2V0Y2ggPSByZXF1aXJlKFwiLi9iYXNlLWxvZ28tc2tldGNoLmpzXCIpO1xyXG52YXIgU2luR2VuZXJhdG9yID0gcmVxdWlyZShcIi4vZ2VuZXJhdG9ycy9zaW4tZ2VuZXJhdG9yLmpzXCIpO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZSk7XHJcblxyXG5mdW5jdGlvbiBTa2V0Y2goJG5hdiwgJG5hdkxvZ28pIHtcclxuICBCYXNlTG9nb1NrZXRjaC5jYWxsKHRoaXMsICRuYXYsICRuYXZMb2dvLCBcIi4uL2ZvbnRzL2JpZ19qb2huLXdlYmZvbnQudHRmXCIpO1xyXG59XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZSA9IGZ1bmN0aW9uKHApIHtcclxuICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplLmNhbGwodGhpcywgcCk7XHJcbiAgdGhpcy5fc3BhY2luZyA9IHV0aWxzLm1hcCh0aGlzLl9mb250U2l6ZSwgMjAsIDQwLCAyLCA1LCB7XHJcbiAgICBjbGFtcDogdHJ1ZSxcclxuICAgIHJvdW5kOiB0cnVlXHJcbiAgfSk7XHJcbiAgLy8gVXBkYXRlIHRoZSBiYm94VGV4dCwgcGxhY2Ugb3ZlciB0aGUgbmF2IHRleHQgbG9nbyBhbmQgdGhlbiBzaGlmdCBpdHNcclxuICAvLyBhbmNob3IgYmFjayB0byAoY2VudGVyLCBjZW50ZXIpIHdoaWxlIHByZXNlcnZpbmcgdGhlIHRleHQgcG9zaXRpb25cclxuICB0aGlzLl9iYm94VGV4dFxyXG4gICAgLnNldFRleHQodGhpcy5fdGV4dClcclxuICAgIC5zZXRUZXh0U2l6ZSh0aGlzLl9mb250U2l6ZSlcclxuICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0xFRlQsIEJib3hUZXh0LkJBU0VMSU5FLkFMUEhBQkVUSUMpXHJcbiAgICAuc2V0UG9zaXRpb24odGhpcy5fdGV4dE9mZnNldC5sZWZ0LCB0aGlzLl90ZXh0T2Zmc2V0LnRvcClcclxuICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0NFTlRFUiwgQmJveFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUiwgdHJ1ZSk7XHJcbiAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG4gIHRoaXMuX3BvaW50cyA9IHRoaXMuX2Jib3hUZXh0LmdldFRleHRQb2ludHMoKTtcclxuICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSB0cnVlO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhd1N0YXRpb25hcnlMb2dvID0gZnVuY3Rpb24ocCkge1xyXG4gIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gIHAuc3Ryb2tlKDI1NSk7XHJcbiAgcC5maWxsKFwiIzBBMDAwQVwiKTtcclxuICBwLnN0cm9rZVdlaWdodCgyKTtcclxuICB0aGlzLl9iYm94VGV4dC5kcmF3KCk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cCA9IGZ1bmN0aW9uKHApIHtcclxuICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldHVwLmNhbGwodGhpcywgcCk7XHJcblxyXG4gIC8vIENyZWF0ZSBhIEJib3hBbGlnbmVkVGV4dCBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZHJhd2luZyBhbmRcclxuICAvLyByb3RhdGluZyB0ZXh0XHJcbiAgdGhpcy5fYmJveFRleHQgPSBuZXcgQmJveFRleHQodGhpcy5fZm9udCwgdGhpcy5fdGV4dCwgdGhpcy5fZm9udFNpemUsIDAsIDAsIHApO1xyXG5cclxuICAvLyBIYW5kbGUgdGhlIGluaXRpYWwgc2V0dXAgYnkgdHJpZ2dlcmluZyBhIHJlc2l6ZVxyXG4gIHRoaXMuX29uUmVzaXplKHApO1xyXG5cclxuICAvLyBEcmF3IHRoZSBzdGF0aW9uYXJ5IGxvZ29cclxuICB0aGlzLl9kcmF3U3RhdGlvbmFyeUxvZ28ocCk7XHJcblxyXG4gIC8vIFN0YXJ0IHRoZSBzaW4gZ2VuZXJhdG9yIGF0IGl0cyBtYXggdmFsdWVcclxuICB0aGlzLl90aHJlc2hvbGRHZW5lcmF0b3IgPSBuZXcgU2luR2VuZXJhdG9yKHAsIDAsIDEsIDAuMDIsIHAuUEkgLyAyKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbihwKSB7XHJcbiAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9kcmF3LmNhbGwodGhpcywgcCk7XHJcbiAgaWYgKCF0aGlzLl9pc01vdXNlT3ZlciB8fCAhdGhpcy5faXNPdmVyTmF2TG9nbykgcmV0dXJuO1xyXG5cclxuICAvLyBXaGVuIHRoZSB0ZXh0IGlzIGFib3V0IHRvIGJlY29tZSBhY3RpdmUgZm9yIHRoZSBmaXJzdCB0aW1lLCBjbGVhclxyXG4gIC8vIHRoZSBzdGF0aW9uYXJ5IGxvZ28gdGhhdCB3YXMgcHJldmlvdXNseSBkcmF3bi5cclxuICBpZiAodGhpcy5faXNGaXJzdEZyYW1lKSB7XHJcbiAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgaWYgKHRoaXMuX2ZvbnRTaXplID4gMzApIHtcclxuICAgIHRoaXMuX3RocmVzaG9sZEdlbmVyYXRvci5zZXRCb3VuZHMoMC4yICogdGhpcy5fYmJveFRleHQuaGVpZ2h0LCAwLjQ3ICogdGhpcy5fYmJveFRleHQuaGVpZ2h0KTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5fdGhyZXNob2xkR2VuZXJhdG9yLnNldEJvdW5kcygwLjIgKiB0aGlzLl9iYm94VGV4dC5oZWlnaHQsIDAuNiAqIHRoaXMuX2Jib3hUZXh0LmhlaWdodCk7XHJcbiAgfVxyXG4gIHZhciBkaXN0YW5jZVRocmVzaG9sZCA9IHRoaXMuX3RocmVzaG9sZEdlbmVyYXRvci5nZW5lcmF0ZSgpO1xyXG5cclxuICBwLmJhY2tncm91bmQoMjU1LCAxMDApO1xyXG4gIHAuc3Ryb2tlV2VpZ2h0KDEpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fcG9pbnRzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICB2YXIgcG9pbnQxID0gdGhpcy5fcG9pbnRzW2ldO1xyXG4gICAgZm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgdGhpcy5fcG9pbnRzLmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgIHZhciBwb2ludDIgPSB0aGlzLl9wb2ludHNbal07XHJcbiAgICAgIHZhciBkaXN0ID0gcC5kaXN0KHBvaW50MS54LCBwb2ludDEueSwgcG9pbnQyLngsIHBvaW50Mi55KTtcclxuICAgICAgaWYgKGRpc3QgPCBkaXN0YW5jZVRocmVzaG9sZCkge1xyXG4gICAgICAgIHAubm9TdHJva2UoKTtcclxuICAgICAgICBwLmZpbGwoXCJyZ2JhKDE2NSwgMCwgMTczLCAwLjI1KVwiKTtcclxuICAgICAgICBwLmVsbGlwc2UoKHBvaW50MS54ICsgcG9pbnQyLngpIC8gMiwgKHBvaW50MS55ICsgcG9pbnQyLnkpIC8gMiwgZGlzdCwgZGlzdCk7XHJcblxyXG4gICAgICAgIHAuc3Ryb2tlKFwicmdiYSgxNjUsIDAsIDE3MywgMC4yNSlcIik7XHJcbiAgICAgICAgcC5ub0ZpbGwoKTtcclxuICAgICAgICBwLmxpbmUocG9pbnQxLngsIHBvaW50MS55LCBwb2ludDIueCwgcG9pbnQyLnkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICBOb2lzZUdlbmVyYXRvcjFEOiBOb2lzZUdlbmVyYXRvcjFELFxyXG4gIE5vaXNlR2VuZXJhdG9yMkQ6IE5vaXNlR2VuZXJhdG9yMkRcclxufTtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG4vLyAtLSAxRCBOb2lzZSBHZW5lcmF0b3IgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLyoqXHJcbiAqIEEgdXRpbGl0eSBjbGFzcyBmb3IgZ2VuZXJhdGluZyBub2lzZSB2YWx1ZXNcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwICAgICAgICAgICAgICAgUmVmZXJlbmNlIHRvIGEgcDUgc2tldGNoXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWluPTBdICAgICAgICAgTWluaW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWF4PTFdICAgICAgICAgTWF4aW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbaW5jcmVtZW50PTAuMV0gU2NhbGUgb2YgdGhlIG5vaXNlLCB1c2VkIHdoZW4gdXBkYXRpbmdcclxuICogQHBhcmFtIHtudW1iZXJ9IFtvZmZzZXQ9cmFuZG9tXSBBIHZhbHVlIHVzZWQgdG8gZW5zdXJlIG11bHRpcGxlIG5vaXNlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdG9ycyBhcmUgcmV0dXJuaW5nIFwiaW5kZXBlbmRlbnRcIiB2YWx1ZXNcclxuICovXHJcbmZ1bmN0aW9uIE5vaXNlR2VuZXJhdG9yMUQocCwgbWluLCBtYXgsIGluY3JlbWVudCwgb2Zmc2V0KSB7XHJcbiAgdGhpcy5fcCA9IHA7XHJcbiAgdGhpcy5fbWluID0gdXRpbHMuZGVmYXVsdChtaW4sIDApO1xyXG4gIHRoaXMuX21heCA9IHV0aWxzLmRlZmF1bHQobWF4LCAxKTtcclxuICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGluY3JlbWVudCwgMC4xKTtcclxuICB0aGlzLl9wb3NpdGlvbiA9IHV0aWxzLmRlZmF1bHQob2Zmc2V0LCBwLnJhbmRvbSgtMTAwMDAwMCwgMTAwMDAwMCkpO1xyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBtaW4gYW5kIG1heCBub2lzZSB2YWx1ZXNcclxuICogQHBhcmFtICB7bnVtYmVyfSBtaW4gTWluaW11bSBub2lzZSB2YWx1ZVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IG1heCBNYXhpbXVtIG5vaXNlIHZhbHVlXHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjFELnByb3RvdHlwZS5zZXRCb3VuZHMgPSBmdW5jdGlvbihtaW4sIG1heCkge1xyXG4gIHRoaXMuX21pbiA9IHV0aWxzLmRlZmF1bHQobWluLCB0aGlzLl9taW4pO1xyXG4gIHRoaXMuX21heCA9IHV0aWxzLmRlZmF1bHQobWF4LCB0aGlzLl9tYXgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgbm9pc2UgaW5jcmVtZW50IChlLmcuIHNjYWxlKVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGluY3JlbWVudCBOZXcgaW5jcmVtZW50IChzY2FsZSkgdmFsdWVcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLnNldEluY3JlbWVudCA9IGZ1bmN0aW9uKGluY3JlbWVudCkge1xyXG4gIHRoaXMuX2luY3JlbWVudCA9IHV0aWxzLmRlZmF1bHQoaW5jcmVtZW50LCB0aGlzLl9pbmNyZW1lbnQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIHRoZSBuZXh0IG5vaXNlIHZhbHVlXHJcbiAqIEByZXR1cm4ge251bWJlcn0gQSBub2lzeSB2YWx1ZSBiZXR3ZWVuIG9iamVjdCdzIG1pbiBhbmQgbWF4XHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjFELnByb3RvdHlwZS5nZW5lcmF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuX3VwZGF0ZSgpO1xyXG4gIHZhciBuID0gdGhpcy5fcC5ub2lzZSh0aGlzLl9wb3NpdGlvbik7XHJcbiAgbiA9IHRoaXMuX3AubWFwKG4sIDAsIDEsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcclxuICByZXR1cm4gbjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBJbnRlcm5hbCB1cGRhdGUgbWV0aG9kIGZvciBnZW5lcmF0aW5nIG5leHQgbm9pc2UgdmFsdWVcclxuICogQHByaXZhdGVcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLl91cGRhdGUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl9wb3NpdGlvbiArPSB0aGlzLl9pbmNyZW1lbnQ7XHJcbn07XHJcblxyXG4vLyAtLSAyRCBOb2lzZSBHZW5lcmF0b3IgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZnVuY3Rpb24gTm9pc2VHZW5lcmF0b3IyRChwLCB4TWluLCB4TWF4LCB5TWluLCB5TWF4LCB4SW5jcmVtZW50LCB5SW5jcmVtZW50LCB4T2Zmc2V0LCB5T2Zmc2V0KSB7XHJcbiAgdGhpcy5feE5vaXNlID0gbmV3IE5vaXNlR2VuZXJhdG9yMUQocCwgeE1pbiwgeE1heCwgeEluY3JlbWVudCwgeE9mZnNldCk7XHJcbiAgdGhpcy5feU5vaXNlID0gbmV3IE5vaXNlR2VuZXJhdG9yMUQocCwgeU1pbiwgeU1heCwgeUluY3JlbWVudCwgeU9mZnNldCk7XHJcbiAgdGhpcy5fcCA9IHA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG1pbiBhbmQgbWF4IG5vaXNlIHZhbHVlc1xyXG4gKiBAcGFyYW0gIHtvYmplY3R9IG9wdGlvbnMgT2JqZWN0IHdpdGggYm91bmRzIHRvIGJlIHVwZGF0ZWQgZS5nLlxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgeyB4TWluOiAwLCB4TWF4OiAxLCB5TWluOiAtMSwgeU1heDogMSB9XHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjJELnByb3RvdHlwZS5zZXRCb3VuZHMgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcbiAgaWYgKCFvcHRpb25zKSByZXR1cm47XHJcbiAgdGhpcy5feE5vaXNlLnNldEJvdW5kcyhvcHRpb25zLnhNaW4sIG9wdGlvbnMueE1heCk7XHJcbiAgdGhpcy5feU5vaXNlLnNldEJvdW5kcyhvcHRpb25zLnlNaW4sIG9wdGlvbnMueU1heCk7XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBpbmNyZW1lbnQgKGUuZy4gc2NhbGUpIGZvciB0aGUgbm9pc2UgZ2VuZXJhdG9yXHJcbiAqIEBwYXJhbSAge29iamVjdH0gb3B0aW9ucyBPYmplY3Qgd2l0aCBib3VuZHMgdG8gYmUgdXBkYXRlZCBlLmcuXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB7IHhJbmNyZW1lbnQ6IDAuMDUsIHlJbmNyZW1lbnQ6IDAuMSB9XHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjJELnByb3RvdHlwZS5zZXRCb3VuZHMgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcbiAgaWYgKCFvcHRpb25zKSByZXR1cm47XHJcbiAgdGhpcy5feE5vaXNlLnNldEJvdW5kcyhvcHRpb25zLnhJbmNyZW1lbnQpO1xyXG4gIHRoaXMuX3lOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy55SW5jcmVtZW50KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZSB0aGUgbmV4dCBwYWlyIG9mIG5vaXNlIHZhbHVlc1xyXG4gKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCB3aXRoIHggYW5kIHkgcHJvcGVydGllcyB0aGF0IGNvbnRhaW4gdGhlIG5leHQgbm9pc2VcclxuICogICAgICAgICAgICAgICAgICB2YWx1ZXMgYWxvbmcgZWFjaCBkaW1lbnNpb25cclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMkQucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHg6IHRoaXMuX3hOb2lzZS5nZW5lcmF0ZSgpLFxyXG4gICAgeTogdGhpcy5feU5vaXNlLmdlbmVyYXRlKClcclxuICB9O1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFNpbkdlbmVyYXRvcjtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG4vKipcclxuICogQSB1dGlsaXR5IGNsYXNzIGZvciBnZW5lcmF0aW5nIHZhbHVlcyBhbG9uZyBhIHNpbndhdmVcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwICAgICAgICAgICAgICAgUmVmZXJlbmNlIHRvIGEgcDUgc2tldGNoXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWluPTBdICAgICAgICAgTWluaW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWF4PTFdICAgICAgICAgTWF4aW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbaW5jcmVtZW50PTAuMV0gSW5jcmVtZW50IHVzZWQgd2hlbiB1cGRhdGluZ1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW29mZnNldD1yYW5kb21dIFdoZXJlIHRvIHN0YXJ0IGFsb25nIHRoZSBzaW5ld2F2ZVxyXG4gKi9cclxuZnVuY3Rpb24gU2luR2VuZXJhdG9yKHAsIG1pbiwgbWF4LCBhbmdsZUluY3JlbWVudCwgc3RhcnRpbmdBbmdsZSkge1xyXG4gIHRoaXMuX3AgPSBwO1xyXG4gIHRoaXMuX21pbiA9IHV0aWxzLmRlZmF1bHQobWluLCAwKTtcclxuICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgMCk7XHJcbiAgdGhpcy5faW5jcmVtZW50ID0gdXRpbHMuZGVmYXVsdChhbmdsZUluY3JlbWVudCwgMC4xKTtcclxuICB0aGlzLl9hbmdsZSA9IHV0aWxzLmRlZmF1bHQoc3RhcnRpbmdBbmdsZSwgcC5yYW5kb20oLTEwMDAwMDAsIDEwMDAwMDApKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgbWluIGFuZCBtYXggdmFsdWVzXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWluIE1pbmltdW0gdmFsdWVcclxuICogQHBhcmFtICB7bnVtYmVyfSBtYXggTWF4aW11bSB2YWx1ZVxyXG4gKi9cclxuU2luR2VuZXJhdG9yLnByb3RvdHlwZS5zZXRCb3VuZHMgPSBmdW5jdGlvbihtaW4sIG1heCkge1xyXG4gIHRoaXMuX21pbiA9IHV0aWxzLmRlZmF1bHQobWluLCB0aGlzLl9taW4pO1xyXG4gIHRoaXMuX21heCA9IHV0aWxzLmRlZmF1bHQobWF4LCB0aGlzLl9tYXgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgYW5nbGUgaW5jcmVtZW50IChlLmcuIGhvdyBmYXN0IHdlIG1vdmUgdGhyb3VnaCB0aGUgc2lud2F2ZSlcclxuICogQHBhcmFtICB7bnVtYmVyfSBpbmNyZW1lbnQgTmV3IGluY3JlbWVudCB2YWx1ZVxyXG4gKi9cclxuU2luR2VuZXJhdG9yLnByb3RvdHlwZS5zZXRJbmNyZW1lbnQgPSBmdW5jdGlvbihpbmNyZW1lbnQpIHtcclxuICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGluY3JlbWVudCwgdGhpcy5faW5jcmVtZW50KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZSB0aGUgbmV4dCB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtudW1iZXJ9IEEgdmFsdWUgYmV0d2VlbiBnZW5lcmF0b3JzJ3MgbWluIGFuZCBtYXhcclxuICovXHJcblNpbkdlbmVyYXRvci5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl91cGRhdGUoKTtcclxuICB2YXIgbiA9IHRoaXMuX3Auc2luKHRoaXMuX2FuZ2xlKTtcclxuICBuID0gdGhpcy5fcC5tYXAobiwgLTEsIDEsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcclxuICByZXR1cm4gbjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBJbnRlcm5hbCB1cGRhdGUgbWV0aG9kIGZvciBnZW5lcmF0aW5nIG5leHQgdmFsdWVcclxuICogQHByaXZhdGVcclxuICovXHJcblNpbkdlbmVyYXRvci5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuX2FuZ2xlICs9IHRoaXMuX2luY3JlbWVudDtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBTa2V0Y2g7XHJcblxyXG52YXIgQmJveFRleHQgPSByZXF1aXJlKFwicDUtYmJveC1hbGlnbmVkLXRleHRcIik7XHJcbnZhciBCYXNlTG9nb1NrZXRjaCA9IHJlcXVpcmUoXCIuL2Jhc2UtbG9nby1za2V0Y2guanNcIik7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuU2tldGNoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlKTtcclxuXHJcbmZ1bmN0aW9uIFNrZXRjaCgkbmF2LCAkbmF2TG9nbykge1xyXG4gIEJhc2VMb2dvU2tldGNoLmNhbGwodGhpcywgJG5hdiwgJG5hdkxvZ28sIFwiLi4vZm9udHMvYmlnX2pvaG4td2ViZm9udC50dGZcIik7XHJcbn1cclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24ocCkge1xyXG4gIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUuY2FsbCh0aGlzLCBwKTtcclxuICB0aGlzLl9zcGFjaW5nID0gdXRpbHMubWFwKHRoaXMuX2ZvbnRTaXplLCAyMCwgNDAsIDIsIDUsIHtcclxuICAgIGNsYW1wOiB0cnVlLFxyXG4gICAgcm91bmQ6IHRydWVcclxuICB9KTtcclxuICAvLyBVcGRhdGUgdGhlIGJib3hUZXh0LCBwbGFjZSBvdmVyIHRoZSBuYXYgdGV4dCBsb2dvIGFuZCB0aGVuIHNoaWZ0IGl0c1xyXG4gIC8vIGFuY2hvciBiYWNrIHRvIChjZW50ZXIsIGNlbnRlcikgd2hpbGUgcHJlc2VydmluZyB0aGUgdGV4dCBwb3NpdGlvblxyXG4gIHRoaXMuX2Jib3hUZXh0XHJcbiAgICAuc2V0VGV4dCh0aGlzLl90ZXh0KVxyXG4gICAgLnNldFRleHRTaXplKHRoaXMuX2ZvbnRTaXplKVxyXG4gICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfTEVGVCwgQmJveFRleHQuQkFTRUxJTkUuQUxQSEFCRVRJQylcclxuICAgIC5zZXRQb3NpdGlvbih0aGlzLl90ZXh0T2Zmc2V0LmxlZnQsIHRoaXMuX3RleHRPZmZzZXQudG9wKVxyXG4gICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfQ0VOVEVSLCBCYm94VGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSLCB0cnVlKTtcclxuICB0aGlzLl9kcmF3U3RhdGlvbmFyeUxvZ28ocCk7XHJcbiAgdGhpcy5fY2FsY3VsYXRlQ2lyY2xlcyhwKTtcclxuICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSB0cnVlO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhd1N0YXRpb25hcnlMb2dvID0gZnVuY3Rpb24ocCkge1xyXG4gIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gIHAuc3Ryb2tlKDI1NSk7XHJcbiAgcC5maWxsKFwiIzBBMDAwQVwiKTtcclxuICBwLnN0cm9rZVdlaWdodCgyKTtcclxuICB0aGlzLl9iYm94VGV4dC5kcmF3KCk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cCA9IGZ1bmN0aW9uKHApIHtcclxuICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldHVwLmNhbGwodGhpcywgcCk7XHJcblxyXG4gIC8vIENyZWF0ZSBhIEJib3hBbGlnbmVkVGV4dCBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZHJhd2luZyBhbmRcclxuICAvLyByb3RhdGluZyB0ZXh0XHJcbiAgdGhpcy5fYmJveFRleHQgPSBuZXcgQmJveFRleHQodGhpcy5fZm9udCwgdGhpcy5fdGV4dCwgdGhpcy5fZm9udFNpemUsIDAsIDAsIHApO1xyXG5cclxuICAvLyBIYW5kbGUgdGhlIGluaXRpYWwgc2V0dXAgYnkgdHJpZ2dlcmluZyBhIHJlc2l6ZVxyXG4gIHRoaXMuX29uUmVzaXplKHApO1xyXG5cclxuICAvLyBEcmF3IHRoZSBzdGF0aW9uYXJ5IGxvZ29cclxuICB0aGlzLl9kcmF3U3RhdGlvbmFyeUxvZ28ocCk7XHJcblxyXG4gIHRoaXMuX2NhbGN1bGF0ZUNpcmNsZXMocCk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9jYWxjdWxhdGVDaXJjbGVzID0gZnVuY3Rpb24ocCkge1xyXG4gIC8vIFRPRE86IERvbid0IG5lZWQgQUxMIHRoZSBwaXhlbHMuIFRoaXMgY291bGQgaGF2ZSBhbiBvZmZzY3JlZW4gcmVuZGVyZXJcclxuICAvLyB0aGF0IGlzIGp1c3QgYmlnIGVub3VnaCB0byBmaXQgdGhlIHRleHQuXHJcbiAgLy8gTG9vcCBvdmVyIHRoZSBwaXhlbHMgaW4gdGhlIHRleHQncyBib3VuZGluZyBib3ggdG8gc2FtcGxlIHRoZSB3b3JkXHJcbiAgdmFyIGJib3ggPSB0aGlzLl9iYm94VGV4dC5nZXRCYm94KCk7XHJcbiAgdmFyIHN0YXJ0WCA9IE1hdGguZmxvb3IoTWF0aC5tYXgoYmJveC54IC0gNSwgMCkpO1xyXG4gIHZhciBlbmRYID0gTWF0aC5jZWlsKE1hdGgubWluKGJib3gueCArIGJib3gudyArIDUsIHAud2lkdGgpKTtcclxuICB2YXIgc3RhcnRZID0gTWF0aC5mbG9vcihNYXRoLm1heChiYm94LnkgLSA1LCAwKSk7XHJcbiAgdmFyIGVuZFkgPSBNYXRoLmNlaWwoTWF0aC5taW4oYmJveC55ICsgYmJveC5oICsgNSwgcC5oZWlnaHQpKTtcclxuICBwLmxvYWRQaXhlbHMoKTtcclxuICBwLnBpeGVsRGVuc2l0eSgxKTtcclxuICB0aGlzLl9jaXJjbGVzID0gW107XHJcbiAgZm9yICh2YXIgeSA9IHN0YXJ0WTsgeSA8IGVuZFk7IHkgKz0gdGhpcy5fc3BhY2luZykge1xyXG4gICAgZm9yICh2YXIgeCA9IHN0YXJ0WDsgeCA8IGVuZFg7IHggKz0gdGhpcy5fc3BhY2luZykge1xyXG4gICAgICB2YXIgaSA9IDQgKiAoeSAqIHAud2lkdGggKyB4KTtcclxuICAgICAgdmFyIHIgPSBwLnBpeGVsc1tpXTtcclxuICAgICAgdmFyIGcgPSBwLnBpeGVsc1tpICsgMV07XHJcbiAgICAgIHZhciBiID0gcC5waXhlbHNbaSArIDJdO1xyXG4gICAgICB2YXIgYSA9IHAucGl4ZWxzW2kgKyAzXTtcclxuICAgICAgdmFyIGMgPSBwLmNvbG9yKHIsIGcsIGIsIGEpO1xyXG4gICAgICBpZiAocC5zYXR1cmF0aW9uKGMpID4gMCkge1xyXG4gICAgICAgIHRoaXMuX2NpcmNsZXMucHVzaCh7XHJcbiAgICAgICAgICB4OiB4ICsgcC5yYW5kb20oLTIgLyAzICogdGhpcy5fc3BhY2luZywgMiAvIDMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgIHk6IHkgKyBwLnJhbmRvbSgtMiAvIDMgKiB0aGlzLl9zcGFjaW5nLCAyIC8gMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgY29sb3I6IHAuY29sb3IoXCIjMDZGRkZGXCIpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fY2lyY2xlcy5wdXNoKHtcclxuICAgICAgICAgIHg6IHggKyBwLnJhbmRvbSgtMiAvIDMgKiB0aGlzLl9zcGFjaW5nLCAyIC8gMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgeTogeSArIHAucmFuZG9tKC0yIC8gMyAqIHRoaXMuX3NwYWNpbmcsIDIgLyAzICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICBjb2xvcjogcC5jb2xvcihcIiNGRTAwRkVcIilcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9jaXJjbGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCArIHAucmFuZG9tKC0yIC8gMyAqIHRoaXMuX3NwYWNpbmcsIDIgLyAzICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICB5OiB5ICsgcC5yYW5kb20oLTIgLyAzICogdGhpcy5fc3BhY2luZywgMiAvIDMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgIGNvbG9yOiBwLmNvbG9yKFwiI0ZGRkYwNFwiKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhdyA9IGZ1bmN0aW9uKHApIHtcclxuICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2RyYXcuY2FsbCh0aGlzLCBwKTtcclxuICBpZiAoIXRoaXMuX2lzTW91c2VPdmVyIHx8ICF0aGlzLl9pc092ZXJOYXZMb2dvKSByZXR1cm47XHJcblxyXG4gIC8vIFdoZW4gdGhlIHRleHQgaXMgYWJvdXQgdG8gYmVjb21lIGFjdGl2ZSBmb3IgdGhlIGZpcnN0IHRpbWUsIGNsZWFyXHJcbiAgLy8gdGhlIHN0YXRpb25hcnkgbG9nbyB0aGF0IHdhcyBwcmV2aW91c2x5IGRyYXduLlxyXG4gIGlmICh0aGlzLl9pc0ZpcnN0RnJhbWUpIHtcclxuICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgdGhpcy5faXNGaXJzdEZyYW1lID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyBDbGVhclxyXG4gIHAuYmxlbmRNb2RlKHAuQkxFTkQpO1xyXG4gIHAuYmFja2dyb3VuZCgyNTUpO1xyXG5cclxuICAvLyBEcmF3IFwiaGFsZnRvbmVcIiBsb2dvXHJcbiAgcC5ub1N0cm9rZSgpO1xyXG4gIHAuYmxlbmRNb2RlKHAuTVVMVElQTFkpO1xyXG5cclxuICB2YXIgbWF4RGlzdCA9IHRoaXMuX2Jib3hUZXh0LmhhbGZXaWR0aDtcclxuICB2YXIgbWF4UmFkaXVzID0gMiAqIHRoaXMuX3NwYWNpbmc7XHJcblxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fY2lyY2xlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgdmFyIGNpcmNsZSA9IHRoaXMuX2NpcmNsZXNbaV07XHJcbiAgICB2YXIgYyA9IGNpcmNsZS5jb2xvcjtcclxuICAgIHZhciBkaXN0ID0gcC5kaXN0KGNpcmNsZS54LCBjaXJjbGUueSwgcC5tb3VzZVgsIHAubW91c2VZKTtcclxuICAgIHZhciByYWRpdXMgPSB1dGlscy5tYXAoZGlzdCwgMCwgbWF4RGlzdCwgMSwgbWF4UmFkaXVzLCB7IGNsYW1wOiB0cnVlIH0pO1xyXG4gICAgcC5maWxsKGMpO1xyXG4gICAgcC5lbGxpcHNlKGNpcmNsZS54LCBjaXJjbGUueSwgcmFkaXVzLCByYWRpdXMpO1xyXG4gIH1cclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBTa2V0Y2g7XHJcblxyXG52YXIgTm9pc2UgPSByZXF1aXJlKFwiLi9nZW5lcmF0b3JzL25vaXNlLWdlbmVyYXRvcnMuanNcIik7XHJcbnZhciBCYm94VGV4dCA9IHJlcXVpcmUoXCJwNS1iYm94LWFsaWduZWQtdGV4dFwiKTtcclxudmFyIEJhc2VMb2dvU2tldGNoID0gcmVxdWlyZShcIi4vYmFzZS1sb2dvLXNrZXRjaC5qc1wiKTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZSk7XHJcblxyXG5mdW5jdGlvbiBTa2V0Y2goJG5hdiwgJG5hdkxvZ28pIHtcclxuICBCYXNlTG9nb1NrZXRjaC5jYWxsKHRoaXMsICRuYXYsICRuYXZMb2dvLCBcIi4uL2ZvbnRzL2JpZ19qb2huLXdlYmZvbnQudHRmXCIpO1xyXG59XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZSA9IGZ1bmN0aW9uKHApIHtcclxuICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplLmNhbGwodGhpcywgcCk7XHJcbiAgLy8gVXBkYXRlIHRoZSBiYm94VGV4dCwgcGxhY2Ugb3ZlciB0aGUgbmF2IHRleHQgbG9nbyBhbmQgdGhlbiBzaGlmdCBpdHNcclxuICAvLyBhbmNob3IgYmFjayB0byAoY2VudGVyLCBjZW50ZXIpIHdoaWxlIHByZXNlcnZpbmcgdGhlIHRleHQgcG9zaXRpb25cclxuICB0aGlzLl9iYm94VGV4dFxyXG4gICAgLnNldFRleHQodGhpcy5fdGV4dClcclxuICAgIC5zZXRUZXh0U2l6ZSh0aGlzLl9mb250U2l6ZSlcclxuICAgIC5zZXRSb3RhdGlvbigwKVxyXG4gICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfTEVGVCwgQmJveFRleHQuQkFTRUxJTkUuQUxQSEFCRVRJQylcclxuICAgIC5zZXRQb3NpdGlvbih0aGlzLl90ZXh0T2Zmc2V0LmxlZnQsIHRoaXMuX3RleHRPZmZzZXQudG9wKVxyXG4gICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfQ0VOVEVSLCBCYm94VGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSLCB0cnVlKTtcclxuICB0aGlzLl90ZXh0UG9zID0gdGhpcy5fYmJveFRleHQuZ2V0UG9zaXRpb24oKTtcclxuICB0aGlzLl9kcmF3U3RhdGlvbmFyeUxvZ28ocCk7XHJcbiAgdGhpcy5faXNGaXJzdEZyYW1lID0gdHJ1ZTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXdTdGF0aW9uYXJ5TG9nbyA9IGZ1bmN0aW9uKHApIHtcclxuICBwLmJhY2tncm91bmQoMjU1KTtcclxuICBwLnN0cm9rZSgyNTUpO1xyXG4gIHAuZmlsbChcIiMwQTAwMEFcIik7XHJcbiAgcC5zdHJva2VXZWlnaHQoMik7XHJcbiAgdGhpcy5fYmJveFRleHQuZHJhdygpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fc2V0dXAgPSBmdW5jdGlvbihwKSB7XHJcbiAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cC5jYWxsKHRoaXMsIHApO1xyXG5cclxuICAvLyBDcmVhdGUgYSBCYm94QWxpZ25lZFRleHQgaW5zdGFuY2UgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIGRyYXdpbmcgYW5kXHJcbiAgLy8gcm90YXRpbmcgdGV4dFxyXG4gIHRoaXMuX2Jib3hUZXh0ID0gbmV3IEJib3hUZXh0KHRoaXMuX2ZvbnQsIHRoaXMuX3RleHQsIHRoaXMuX2ZvbnRTaXplLCAwLCAwLCBwKTtcclxuXHJcbiAgLy8gSGFuZGxlIHRoZSBpbml0aWFsIHNldHVwIGJ5IHRyaWdnZXJpbmcgYSByZXNpemVcclxuICB0aGlzLl9vblJlc2l6ZShwKTtcclxuXHJcbiAgLy8gU2V0IHVwIG5vaXNlIGdlbmVyYXRvcnNcclxuICB0aGlzLl9yb3RhdGlvbk5vaXNlID0gbmV3IE5vaXNlLk5vaXNlR2VuZXJhdG9yMUQocCwgLXAuUEkgLyA0LCBwLlBJIC8gNCwgMC4wMik7XHJcbiAgdGhpcy5feHlOb2lzZSA9IG5ldyBOb2lzZS5Ob2lzZUdlbmVyYXRvcjJEKHAsIC0xMDAsIDEwMCwgLTUwLCA1MCwgMC4wMSwgMC4wMSk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24ocCkge1xyXG4gIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fZHJhdy5jYWxsKHRoaXMsIHApO1xyXG4gIGlmICghdGhpcy5faXNNb3VzZU92ZXIgfHwgIXRoaXMuX2lzT3Zlck5hdkxvZ28pIHJldHVybjtcclxuXHJcbiAgLy8gV2hlbiB0aGUgdGV4dCBpcyBhYm91dCB0byBiZWNvbWUgYWN0aXZlIGZvciB0aGUgZmlyc3QgdGltZSwgY2xlYXJcclxuICAvLyB0aGUgc3RhdGlvbmFyeSBsb2dvIHRoYXQgd2FzIHByZXZpb3VzbHkgZHJhd24uXHJcbiAgaWYgKHRoaXMuX2lzRmlyc3RGcmFtZSkge1xyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vIENhbGN1bGF0ZSBwb3NpdGlvbiBhbmQgcm90YXRpb24gdG8gY3JlYXRlIGEgaml0dGVyeSBsb2dvXHJcbiAgdmFyIHJvdGF0aW9uID0gdGhpcy5fcm90YXRpb25Ob2lzZS5nZW5lcmF0ZSgpO1xyXG4gIHZhciB4eU9mZnNldCA9IHRoaXMuX3h5Tm9pc2UuZ2VuZXJhdGUoKTtcclxuICB0aGlzLl9iYm94VGV4dFxyXG4gICAgLnNldFJvdGF0aW9uKHJvdGF0aW9uKVxyXG4gICAgLnNldFBvc2l0aW9uKHRoaXMuX3RleHRQb3MueCArIHh5T2Zmc2V0LngsIHRoaXMuX3RleHRQb3MueSArIHh5T2Zmc2V0LnkpXHJcbiAgICAuZHJhdygpO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IE1haW5OYXY7XHJcblxyXG5mdW5jdGlvbiBNYWluTmF2KGxvYWRlcikge1xyXG4gIHRoaXMuX2xvYWRlciA9IGxvYWRlcjtcclxuICB0aGlzLl8kbG9nbyA9ICQoXCJuYXYubmF2YmFyIC5uYXZiYXItYnJhbmRcIik7XHJcbiAgdGhpcy5fJG5hdiA9ICQoXCIjbWFpbi1uYXZcIik7XHJcbiAgdGhpcy5fJG5hdkxpbmtzID0gdGhpcy5fJG5hdi5maW5kKFwiYVwiKTtcclxuICB0aGlzLl8kYWN0aXZlTmF2ID0gdGhpcy5fJG5hdkxpbmtzLmZpbmQoXCIuYWN0aXZlXCIpO1xyXG4gIHRoaXMuXyRuYXZMaW5rcy5vbihcImNsaWNrXCIsIHRoaXMuX29uTmF2Q2xpY2suYmluZCh0aGlzKSk7XHJcbiAgdGhpcy5fJGxvZ28ub24oXCJjbGlja1wiLCB0aGlzLl9vbkxvZ29DbGljay5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuc2V0QWN0aXZlRnJvbVVybCA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuX2RlYWN0aXZhdGUoKTtcclxuICB2YXIgdXJsID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgaWYgKHVybCA9PT0gXCIvaW5kZXguaHRtbFwiIHx8IHVybCA9PT0gXCIvXCIpIHtcclxuICAgIHRoaXMuX2FjdGl2YXRlTGluayh0aGlzLl8kbmF2TGlua3MuZmlsdGVyKFwiI2Fib3V0LWxpbmtcIikpO1xyXG4gIH0gZWxzZSBpZiAodXJsID09PSBcIi93b3JrLmh0bWxcIikge1xyXG4gICAgdGhpcy5fYWN0aXZhdGVMaW5rKHRoaXMuXyRuYXZMaW5rcy5maWx0ZXIoXCIjd29yay1saW5rXCIpKTtcclxuICB9IGVsc2UgaWYgKHVybCA9PT0gXCIvY29udGFjdC5odG1sXCIpIHtcclxuICAgIHRoaXMuX2FjdGl2YXRlTGluayh0aGlzLl8kbmF2TGlua3MuZmlsdGVyKFwiI2NvbnRhY3QtbGlua1wiKSk7XHJcbiAgfVxyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX2RlYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcclxuICBpZiAodGhpcy5fJGFjdGl2ZU5hdi5sZW5ndGgpIHtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXYucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2ID0gJCgpO1xyXG4gIH1cclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9hY3RpdmF0ZUxpbmsgPSBmdW5jdGlvbigkbGluaykge1xyXG4gICRsaW5rLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gIHRoaXMuXyRhY3RpdmVOYXYgPSAkbGluaztcclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9vbkxvZ29DbGljayA9IGZ1bmN0aW9uKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgdmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgdmFyIHVybCA9ICR0YXJnZXQuYXR0cihcImhyZWZcIik7XHJcbiAgdGhpcy5fbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIHRydWUpO1xyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX29uTmF2Q2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHRoaXMuXyRuYXYuY29sbGFwc2UoXCJoaWRlXCIpOyAvLyBDbG9zZSB0aGUgbmF2IC0gb25seSBtYXR0ZXJzIG9uIG1vYmlsZVxyXG4gIHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gIGlmICgkdGFyZ2V0LmlzKHRoaXMuXyRhY3RpdmVOYXYpKSByZXR1cm47XHJcbiAgdGhpcy5fZGVhY3RpdmF0ZSgpO1xyXG4gIHRoaXMuX2FjdGl2YXRlTGluaygkdGFyZ2V0KTtcclxuICB2YXIgdXJsID0gJHRhcmdldC5hdHRyKFwiaHJlZlwiKTtcclxuICB0aGlzLl9sb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgdHJ1ZSk7XHJcbn07XHJcbiIsInZhciBMb2FkZXIgPSByZXF1aXJlKFwiLi9wYWdlLWxvYWRlci5qc1wiKTtcclxudmFyIE1haW5OYXYgPSByZXF1aXJlKFwiLi9tYWluLW5hdi5qc1wiKTtcclxudmFyIEhvdmVyU2xpZGVzaG93cyA9IHJlcXVpcmUoXCIuL2hvdmVyLXNsaWRlc2hvdy5qc1wiKTtcclxudmFyIFBvcnRmb2xpb0ZpbHRlciA9IHJlcXVpcmUoXCIuL3BvcnRmb2xpby1maWx0ZXIuanNcIik7XHJcbnZhciBzbGlkZXNob3dzID0gcmVxdWlyZShcIi4vdGh1bWJuYWlsLXNsaWRlc2hvdy9zbGlkZXNob3cuanNcIik7XHJcblxyXG4vLyBQaWNraW5nIGEgcmFuZG9tIHNrZXRjaCB0aGF0IHRoZSB1c2VyIGhhc24ndCBzZWVuIGJlZm9yZVxyXG52YXIgU2tldGNoID0gcmVxdWlyZShcIi4vcGljay1yYW5kb20tc2tldGNoLmpzXCIpKCk7XHJcblxyXG4vLyBBSkFYIHBhZ2UgbG9hZGVyLCB3aXRoIGNhbGxiYWNrIGZvciByZWxvYWRpbmcgd2lkZ2V0c1xyXG52YXIgbG9hZGVyID0gbmV3IExvYWRlcihvblBhZ2VMb2FkKTtcclxuXHJcbi8vIE1haW4gbmF2IHdpZGdldFxyXG52YXIgbWFpbk5hdiA9IG5ldyBNYWluTmF2KGxvYWRlcik7XHJcblxyXG4vLyBJbnRlcmFjdGl2ZSBsb2dvIGluIG5hdmJhclxyXG52YXIgbmF2ID0gJChcIm5hdi5uYXZiYXJcIik7XHJcbnZhciBuYXZMb2dvID0gbmF2LmZpbmQoXCIubmF2YmFyLWJyYW5kXCIpO1xyXG5uZXcgU2tldGNoKG5hdiwgbmF2TG9nbyk7XHJcblxyXG4vLyBXaWRnZXQgZ2xvYmFsc1xyXG52YXIgcG9ydGZvbGlvRmlsdGVyO1xyXG5cclxuLy8gTG9hZCBhbGwgd2lkZ2V0c1xyXG5vblBhZ2VMb2FkKCk7XHJcblxyXG4vLyBIYW5kbGUgYmFjay9mb3J3YXJkIGJ1dHRvbnNcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBvblBvcFN0YXRlKTtcclxuXHJcbmZ1bmN0aW9uIG9uUG9wU3RhdGUoZSkge1xyXG4gIC8vIExvYWRlciBzdG9yZXMgY3VzdG9tIGRhdGEgaW4gdGhlIHN0YXRlIC0gaW5jbHVkaW5nIHRoZSB1cmwgYW5kIHRoZSBxdWVyeVxyXG4gIHZhciB1cmwgPSAoZS5zdGF0ZSAmJiBlLnN0YXRlLnVybCkgfHwgXCIvaW5kZXguaHRtbFwiO1xyXG4gIHZhciBxdWVyeU9iamVjdCA9IChlLnN0YXRlICYmIGUuc3RhdGUucXVlcnkpIHx8IHt9O1xyXG5cclxuICBpZiAodXJsID09PSBsb2FkZXIuZ2V0TG9hZGVkUGF0aCgpICYmIHVybCA9PT0gXCIvd29yay5odG1sXCIpIHtcclxuICAgIC8vIFRoZSBjdXJyZW50ICYgcHJldmlvdXMgbG9hZGVkIHN0YXRlcyB3ZXJlIHdvcmsuaHRtbCwgc28ganVzdCByZWZpbHRlclxyXG4gICAgdmFyIGNhdGVnb3J5ID0gcXVlcnlPYmplY3QuY2F0ZWdvcnkgfHwgXCJhbGxcIjtcclxuICAgIHBvcnRmb2xpb0ZpbHRlci5zZWxlY3RDYXRlZ29yeShjYXRlZ29yeSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIExvYWQgdGhlIG5ldyBwYWdlXHJcbiAgICBsb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgZmFsc2UpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gb25QYWdlTG9hZCgpIHtcclxuICAvLyBSZWxvYWQgYWxsIHBsdWdpbnMvd2lkZ2V0c1xyXG4gIG5ldyBIb3ZlclNsaWRlc2hvd3MoKTtcclxuICBwb3J0Zm9saW9GaWx0ZXIgPSBuZXcgUG9ydGZvbGlvRmlsdGVyKGxvYWRlcik7XHJcbiAgc2xpZGVzaG93cy5pbml0KCk7XHJcbiAgb2JqZWN0Rml0SW1hZ2VzKCk7XHJcbiAgc21hcnRxdW90ZXMoKTtcclxuXHJcbiAgLy8gUmVkaXJlY3QgZGF0YS1pbnRlcm5hbC1saW5rIGh5cGVybGlua3MgdGhyb3VnaCB0aGUgbG9hZGVyXHJcbiAgdmFyIGludGVybmFsTGlua3MgPSAkKFwiYVtkYXRhLWludGVybmFsLWxpbmtdXCIpO1xyXG4gIGludGVybmFsTGlua3Mub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGxvYWRlci5sb2FkUGFnZSgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmF0dHIoXCJocmVmXCIpLCB7fSwgdHJ1ZSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFNsaWdodGx5IHJlZHVuZGFudCwgYnV0IHVwZGF0ZSB0aGUgbWFpbiBuYXYgdXNpbmcgdGhlIGN1cnJlbnQgVVJMLiBUaGlzXHJcbiAgLy8gaXMgaW1wb3J0YW50IGlmIGEgcGFnZSBpcyBsb2FkZWQgYnkgdHlwaW5nIGEgZnVsbCBVUkwgKGUuZy4gZ29pbmdcclxuICAvLyBkaXJlY3RseSB0byAvd29yay5odG1sKSBvciB3aGVuIG1vdmluZyBmcm9tIHdvcmsuaHRtbCB0byBhIHByb2plY3QuXHJcbiAgbWFpbk5hdi5zZXRBY3RpdmVGcm9tVXJsKCk7XHJcbn1cclxuXHJcbi8vIFdlJ3ZlIGhpdCB0aGUgbGFuZGluZyBwYWdlLCBsb2FkIHRoZSBhYm91dCBwYWdlXHJcbi8vIGlmIChsb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvXihcXC98XFwvaW5kZXguaHRtbHxpbmRleC5odG1sKSQvKSkge1xyXG4vLyAgICAgbG9hZGVyLmxvYWRQYWdlKFwiL2Fib3V0Lmh0bWxcIiwge30sIGZhbHNlKTtcclxuLy8gfVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IExvYWRlcjtcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBMb2FkZXIob25SZWxvYWQsIGZhZGVEdXJhdGlvbikge1xyXG4gIHRoaXMuXyRjb250ZW50ID0gJChcIiNjb250ZW50XCIpO1xyXG4gIHRoaXMuX29uUmVsb2FkID0gb25SZWxvYWQ7XHJcbiAgdGhpcy5fZmFkZUR1cmF0aW9uID0gZmFkZUR1cmF0aW9uICE9PSB1bmRlZmluZWQgPyBmYWRlRHVyYXRpb24gOiAyNTA7XHJcbiAgdGhpcy5fcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lO1xyXG59XHJcblxyXG5Mb2FkZXIucHJvdG90eXBlLmdldExvYWRlZFBhdGggPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5fcGF0aDtcclxufTtcclxuXHJcbkxvYWRlci5wcm90b3R5cGUubG9hZFBhZ2UgPSBmdW5jdGlvbih1cmwsIHF1ZXJ5T2JqZWN0LCBzaG91bGRQdXNoSGlzdG9yeSkge1xyXG4gIC8vIEZhZGUgdGhlbiBlbXB0eSB0aGUgY3VycmVudCBjb250ZW50c1xyXG4gIHRoaXMuXyRjb250ZW50LnZlbG9jaXR5KFxyXG4gICAgeyBvcGFjaXR5OiAwIH0sXHJcbiAgICB0aGlzLl9mYWRlRHVyYXRpb24sXHJcbiAgICBcInN3aW5nXCIsXHJcbiAgICBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5fJGNvbnRlbnQuZW1wdHkoKTtcclxuICAgICAgdGhpcy5fJGNvbnRlbnQubG9hZCh1cmwgKyBcIiAjY29udGVudFwiLCBvbkNvbnRlbnRGZXRjaGVkLmJpbmQodGhpcykpO1xyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxuXHJcbiAgLy8gRmFkZSB0aGUgbmV3IGNvbnRlbnQgaW4gYWZ0ZXIgaXQgaGFzIGJlZW4gZmV0Y2hlZFxyXG4gIGZ1bmN0aW9uIG9uQ29udGVudEZldGNoZWQocmVzcG9uc2VUZXh0LCB0ZXh0U3RhdHVzKSB7XHJcbiAgICBpZiAodGV4dFN0YXR1cyA9PT0gXCJlcnJvclwiKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBsb2FkaW5nIHRoZSBwYWdlLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBxdWVyeVN0cmluZyA9IHV0aWxpdGllcy5jcmVhdGVRdWVyeVN0cmluZyhxdWVyeU9iamVjdCk7XHJcbiAgICBpZiAoc2hvdWxkUHVzaEhpc3RvcnkpIHtcclxuICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICBxdWVyeTogcXVlcnlPYmplY3RcclxuICAgICAgICB9LFxyXG4gICAgICAgIG51bGwsXHJcbiAgICAgICAgdXJsICsgcXVlcnlTdHJpbmdcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgR29vZ2xlIGFuYWx5dGljc1xyXG4gICAgZ2EoXCJzZXRcIiwgXCJwYWdlXCIsIHVybCArIHF1ZXJ5U3RyaW5nKTtcclxuICAgIGdhKFwic2VuZFwiLCBcInBhZ2V2aWV3XCIpO1xyXG5cclxuICAgIHRoaXMuX3BhdGggPSBsb2NhdGlvbi5wYXRobmFtZTtcclxuICAgIHRoaXMuXyRjb250ZW50LnZlbG9jaXR5KHsgb3BhY2l0eTogMSB9LCB0aGlzLl9mYWRlRHVyYXRpb24sIFwic3dpbmdcIik7XHJcbiAgICB0aGlzLl9vblJlbG9hZCgpO1xyXG4gIH1cclxufTtcclxuIiwidmFyIGNvb2tpZXMgPSByZXF1aXJlKFwianMtY29va2llXCIpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG52YXIgc2tldGNoQ29uc3RydWN0b3JzID0ge1xyXG4gIFwiaGFsZnRvbmUtZmxhc2hsaWdodFwiOiByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9oYWxmdG9uZS1mbGFzaGxpZ2h0LXdvcmQuanNcIiksXHJcbiAgXCJub2lzeS13b3JkXCI6IHJlcXVpcmUoXCIuL2ludGVyYWN0aXZlLWxvZ29zL25vaXN5LXdvcmQtc2tldGNoLmpzXCIpLFxyXG4gIFwiY29ubmVjdC1wb2ludHNcIjogcmVxdWlyZShcIi4vaW50ZXJhY3RpdmUtbG9nb3MvY29ubmVjdC1wb2ludHMtc2tldGNoLmpzXCIpXHJcbn07XHJcbnZhciBudW1Ta2V0Y2hlcyA9IE9iamVjdC5rZXlzKHNrZXRjaENvbnN0cnVjdG9ycykubGVuZ3RoO1xyXG52YXIgY29va2llS2V5ID0gXCJzZWVuLXNrZXRjaC1uYW1lc1wiO1xyXG5cclxuLyoqXHJcbiAqIFBpY2sgYSByYW5kb20gc2tldGNoIHRoYXQgdXNlciBoYXNuJ3Qgc2VlbiB5ZXQuIElmIHRoZSB1c2VyIGhhcyBzZWVuIGFsbCB0aGVcclxuICogc2tldGNoZXMsIGp1c3QgcGljayBhIHJhbmRvbSBvbmUuIFRoaXMgdXNlcyBjb29raWVzIHRvIHRyYWNrIHdoYXQgdGhlIHVzZXJcclxuICogaGFzIHNlZW4gYWxyZWFkeS5cclxuICogQHJldHVybiB7RnVuY3Rpb259IENvbnN0cnVjdG9yIGZvciBhIFNrZXRjaCBjbGFzc1xyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwaWNrUmFuZG9tU2tldGNoKCkge1xyXG4gIHZhciBzZWVuU2tldGNoTmFtZXMgPSBjb29raWVzLmdldEpTT04oY29va2llS2V5KSB8fCBbXTtcclxuXHJcbiAgLy8gRmluZCB0aGUgbmFtZXMgb2YgdGhlIHVuc2VlbiBza2V0Y2hlc1xyXG4gIHZhciB1bnNlZW5Ta2V0Y2hOYW1lcyA9IGZpbmRVbnNlZW5Ta2V0Y2hlcyhzZWVuU2tldGNoTmFtZXMpO1xyXG5cclxuICAvLyBBbGwgc2tldGNoZXMgaGF2ZSBiZWVuIHNlZW5cclxuICBpZiAodW5zZWVuU2tldGNoTmFtZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAvLyBJZiB3ZSd2ZSBnb3QgbW9yZSB0aGVuIG9uZSBza2V0Y2gsIHRoZW4gbWFrZSBzdXJlIHRvIGNob29zZSBhIHJhbmRvbVxyXG4gICAgLy8gc2tldGNoIGV4Y2x1ZGluZyB0aGUgbW9zdCByZWNlbnRseSBzZWVuIHNrZXRjaFxyXG4gICAgaWYgKG51bVNrZXRjaGVzID4gMSkge1xyXG4gICAgICBzZWVuU2tldGNoTmFtZXMgPSBbc2VlblNrZXRjaE5hbWVzLnBvcCgpXTtcclxuICAgICAgdW5zZWVuU2tldGNoTmFtZXMgPSBmaW5kVW5zZWVuU2tldGNoZXMoc2VlblNrZXRjaE5hbWVzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIElmIHdlJ3ZlIG9ubHkgZ290IG9uZSBza2V0Y2gsIHRoZW4gd2UgY2FuJ3QgZG8gbXVjaC4uLlxyXG4gICAgICBzZWVuU2tldGNoTmFtZXMgPSBbXTtcclxuICAgICAgdW5zZWVuU2tldGNoTmFtZXMgPSBPYmplY3Qua2V5cyhza2V0Y2hDb25zdHJ1Y3RvcnMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIHJhbmRTa2V0Y2hOYW1lID0gdXRpbHMucmFuZEFycmF5RWxlbWVudCh1bnNlZW5Ta2V0Y2hOYW1lcyk7XHJcbiAgc2VlblNrZXRjaE5hbWVzLnB1c2gocmFuZFNrZXRjaE5hbWUpO1xyXG5cclxuICAvLyBTdG9yZSB0aGUgZ2VuZXJhdGVkIHNrZXRjaCBpbiBhIGNvb2tpZS4gVGhpcyBjcmVhdGVzIGEgbW92aW5nIDcgZGF5XHJcbiAgLy8gd2luZG93IC0gYW55dGltZSB0aGUgc2l0ZSBpcyB2aXNpdGVkLCB0aGUgY29va2llIGlzIHJlZnJlc2hlZC5cclxuICBjb29raWVzLnNldChjb29raWVLZXksIHNlZW5Ta2V0Y2hOYW1lcywgeyBleHBpcmVzOiA3IH0pO1xyXG5cclxuICByZXR1cm4gc2tldGNoQ29uc3RydWN0b3JzW3JhbmRTa2V0Y2hOYW1lXTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGZpbmRVbnNlZW5Ta2V0Y2hlcyhzZWVuU2tldGNoTmFtZXMpIHtcclxuICB2YXIgdW5zZWVuU2tldGNoTmFtZXMgPSBbXTtcclxuICBmb3IgKHZhciBza2V0Y2hOYW1lIGluIHNrZXRjaENvbnN0cnVjdG9ycykge1xyXG4gICAgaWYgKHNlZW5Ta2V0Y2hOYW1lcy5pbmRleE9mKHNrZXRjaE5hbWUpID09PSAtMSkge1xyXG4gICAgICB1bnNlZW5Ta2V0Y2hOYW1lcy5wdXNoKHNrZXRjaE5hbWUpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdW5zZWVuU2tldGNoTmFtZXM7XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9GaWx0ZXI7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxudmFyIGRlZmF1bHRCcmVha3BvaW50cyA9IFtcclxuICB7IHdpZHRoOiAxMjAwLCBjb2xzOiAzLCBzcGFjaW5nOiAxNSB9LFxyXG4gIHsgd2lkdGg6IDk5MiwgY29sczogMywgc3BhY2luZzogMTUgfSxcclxuICB7IHdpZHRoOiA3MDAsIGNvbHM6IDMsIHNwYWNpbmc6IDE1IH0sXHJcbiAgeyB3aWR0aDogNjAwLCBjb2xzOiAyLCBzcGFjaW5nOiAxMCB9LFxyXG4gIHsgd2lkdGg6IDQ4MCwgY29sczogMiwgc3BhY2luZzogMTAgfSxcclxuICB7IHdpZHRoOiAzMjAsIGNvbHM6IDEsIHNwYWNpbmc6IDEwIH1cclxuXTtcclxuXHJcbmZ1bmN0aW9uIFBvcnRmb2xpb0ZpbHRlcihsb2FkZXIsIGJyZWFrcG9pbnRzLCBhc3BlY3RSYXRpbywgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgdGhpcy5fbG9hZGVyID0gbG9hZGVyO1xyXG4gIHRoaXMuX2dyaWRTcGFjaW5nID0gMDtcclxuICB0aGlzLl9hc3BlY3RSYXRpbyA9IGFzcGVjdFJhdGlvICE9PSB1bmRlZmluZWQgPyBhc3BlY3RSYXRpbyA6IDE2IC8gOTtcclxuICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb24gIT09IHVuZGVmaW5lZCA/IHRyYW5zaXRpb25EdXJhdGlvbiA6IDgwMDtcclxuICB0aGlzLl9icmVha3BvaW50cyA9IGJyZWFrcG9pbnRzICE9PSB1bmRlZmluZWQgPyBicmVha3BvaW50cy5zbGljZSgpIDogZGVmYXVsdEJyZWFrcG9pbnRzLnNsaWNlKCk7XHJcbiAgdGhpcy5fJGdyaWQgPSAkKFwiI3BvcnRmb2xpby1ncmlkXCIpO1xyXG4gIHRoaXMuXyRuYXYgPSAkKFwiI3BvcnRmb2xpby1uYXZcIik7XHJcbiAgdGhpcy5fJHByb2plY3RzID0gW107XHJcbiAgdGhpcy5fJGNhdGVnb3JpZXMgPSB7fTtcclxuICB0aGlzLl9yb3dzID0gMDtcclxuICB0aGlzLl9jb2xzID0gMDtcclxuICB0aGlzLl9pbWFnZUhlaWdodCA9IDA7XHJcbiAgdGhpcy5faW1hZ2VXaWR0aCA9IDA7XHJcblxyXG4gIC8vIFNvcnQgdGhlIGJyZWFrcG9pbnRzIGluIGRlc2NlbmRpbmcgb3JkZXJcclxuICB0aGlzLl9icmVha3BvaW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgIGlmIChhLndpZHRoIDwgYi53aWR0aCkgcmV0dXJuIC0xO1xyXG4gICAgZWxzZSBpZiAoYS53aWR0aCA+IGIud2lkdGgpIHJldHVybiAxO1xyXG4gICAgZWxzZSByZXR1cm4gMDtcclxuICB9KTtcclxuXHJcbiAgdGhpcy5fY2FjaGVQcm9qZWN0cygpO1xyXG4gIHRoaXMuX2NyZWF0ZUdyaWQoKTtcclxuXHJcbiAgdGhpcy5fJGdyaWQuZmluZChcIi5wcm9qZWN0IGFcIikub24oXCJjbGlja1wiLCB0aGlzLl9vblByb2plY3RDbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgdmFyIHFzID0gdXRpbGl0aWVzLmdldFF1ZXJ5UGFyYW1ldGVycygpO1xyXG4gIHZhciBpbml0aWFsQ2F0ZWdvcnkgPSBxcy5jYXRlZ29yeSB8fCBcImFsbFwiO1xyXG4gIHZhciBjYXRlZ29yeSA9IGluaXRpYWxDYXRlZ29yeS50b0xvd2VyQ2FzZSgpO1xyXG4gIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gdGhpcy5fJG5hdi5maW5kKFwiYVtkYXRhLWNhdGVnb3J5PVwiICsgY2F0ZWdvcnkgKyBcIl1cIik7XHJcbiAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG4gICQoXCIjcG9ydGZvbGlvLW5hdiBhXCIpLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25OYXZDbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX2NyZWF0ZUdyaWQuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuc2VsZWN0Q2F0ZWdvcnkgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xyXG4gIGNhdGVnb3J5ID0gKGNhdGVnb3J5ICYmIGNhdGVnb3J5LnRvTG93ZXJDYXNlKCkpIHx8IFwiYWxsXCI7XHJcbiAgdmFyICRzZWxlY3RlZE5hdiA9IHRoaXMuXyRuYXYuZmluZChcImFbZGF0YS1jYXRlZ29yeT1cIiArIGNhdGVnb3J5ICsgXCJdXCIpO1xyXG4gIGlmICgkc2VsZWN0ZWROYXYubGVuZ3RoICYmICEkc2VsZWN0ZWROYXYuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSB7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gJHNlbGVjdGVkTmF2O1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl9maWx0ZXJQcm9qZWN0cyhjYXRlZ29yeSk7XHJcbiAgfVxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZmlsdGVyUHJvamVjdHMgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xyXG4gIHZhciAkc2VsZWN0ZWRFbGVtZW50cyA9IHRoaXMuX2dldFByb2plY3RzSW5DYXRlZ29yeShjYXRlZ29yeSk7XHJcblxyXG4gIC8vIEFuaW1hdGUgdGhlIGdyaWQgdG8gdGhlIGNvcnJlY3QgaGVpZ2h0IHRvIGNvbnRhaW4gdGhlIHJvd3NcclxuICB0aGlzLl9hbmltYXRlR3JpZEhlaWdodCgkc2VsZWN0ZWRFbGVtZW50cy5sZW5ndGgpO1xyXG5cclxuICAvLyBMb29wIHRocm91Z2ggYWxsIHByb2plY3RzXHJcbiAgdGhpcy5fJHByb2plY3RzLmZvckVhY2goXHJcbiAgICBmdW5jdGlvbigkZWxlbWVudCkge1xyXG4gICAgICAvLyBTdG9wIGFsbCBhbmltYXRpb25zXHJcbiAgICAgICRlbGVtZW50LnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgICAgLy8gSWYgYW4gZWxlbWVudCBpcyBub3Qgc2VsZWN0ZWQ6IGRyb3Agei1pbmRleCAmIGFuaW1hdGUgb3BhY2l0eSAtPiBoaWRlXHJcbiAgICAgIHZhciBzZWxlY3RlZEluZGV4ID0gJHNlbGVjdGVkRWxlbWVudHMuaW5kZXhPZigkZWxlbWVudCk7XHJcbiAgICAgIGlmIChzZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICRlbGVtZW50LmNzcyhcInpJbmRleFwiLCAtMSk7XHJcbiAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sXHJcbiAgICAgICAgICBcImVhc2VJbk91dEN1YmljXCIsXHJcbiAgICAgICAgICBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSWYgYW4gZWxlbWVudCBpcyBzZWxlY3RlZDogc2hvdyAmIGJ1bXAgei1pbmRleCAmIGFuaW1hdGUgdG8gcG9zaXRpb25cclxuICAgICAgICAkZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgJGVsZW1lbnQuY3NzKFwiekluZGV4XCIsIDApO1xyXG4gICAgICAgIHZhciBuZXdQb3MgPSB0aGlzLl9pbmRleFRvWFkoc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDEsXHJcbiAgICAgICAgICAgIHRvcDogbmV3UG9zLnkgKyBcInB4XCIsXHJcbiAgICAgICAgICAgIGxlZnQ6IG5ld1Bvcy54ICsgXCJweFwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uLFxyXG4gICAgICAgICAgXCJlYXNlSW5PdXRDdWJpY1wiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2FuaW1hdGVHcmlkSGVpZ2h0ID0gZnVuY3Rpb24obnVtRWxlbWVudHMpIHtcclxuICB0aGlzLl8kZ3JpZC52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgdmFyIGN1clJvd3MgPSBNYXRoLmNlaWwobnVtRWxlbWVudHMgLyB0aGlzLl9jb2xzKTtcclxuICB0aGlzLl8kZ3JpZC52ZWxvY2l0eShcclxuICAgIHtcclxuICAgICAgaGVpZ2h0OiB0aGlzLl9pbWFnZUhlaWdodCAqIGN1clJvd3MgKyB0aGlzLl9ncmlkU3BhY2luZyAqIChjdXJSb3dzIC0gMSkgKyBcInB4XCJcclxuICAgIH0sXHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb25cclxuICApO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZ2V0UHJvamVjdHNJbkNhdGVnb3J5ID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcclxuICBpZiAoY2F0ZWdvcnkgPT09IFwiYWxsXCIpIHtcclxuICAgIHJldHVybiB0aGlzLl8kcHJvamVjdHM7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiB0aGlzLl8kY2F0ZWdvcmllc1tjYXRlZ29yeV0gfHwgW107XHJcbiAgfVxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fY2FjaGVQcm9qZWN0cyA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuXyRwcm9qZWN0cyA9IFtdO1xyXG4gIHRoaXMuXyRjYXRlZ29yaWVzID0ge307XHJcbiAgdGhpcy5fJGdyaWQuZmluZChcIi5wcm9qZWN0XCIpLmVhY2goXHJcbiAgICBmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG4gICAgICB0aGlzLl8kcHJvamVjdHMucHVzaCgkZWxlbWVudCk7XHJcbiAgICAgIHZhciBjYXRlZ29yeU5hbWVzID0gJGVsZW1lbnQuZGF0YShcImNhdGVnb3JpZXNcIikuc3BsaXQoXCIsXCIpO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhdGVnb3J5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgY2F0ZWdvcnkgPSAkLnRyaW0oY2F0ZWdvcnlOYW1lc1tpXSkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAoIXRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XSkge1xyXG4gICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldID0gWyRlbGVtZW50XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldLnB1c2goJGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxufTtcclxuXHJcbi8vIFBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhbGN1bGF0ZUdyaWQgPSBmdW5jdGlvbiAoKSB7XHJcbi8vICAgICB2YXIgZ3JpZFdpZHRoID0gdGhpcy5fJGdyaWQuaW5uZXJXaWR0aCgpO1xyXG4vLyAgICAgdGhpcy5fY29scyA9IE1hdGguZmxvb3IoKGdyaWRXaWR0aCArIHRoaXMuX2dyaWRTcGFjaW5nKSAvXHJcbi8vICAgICAgICAgKHRoaXMuX21pbkltYWdlV2lkdGggKyB0aGlzLl9ncmlkU3BhY2luZykpO1xyXG4vLyAgICAgdGhpcy5fcm93cyA9IE1hdGguY2VpbCh0aGlzLl8kcHJvamVjdHMubGVuZ3RoIC8gdGhpcy5fY29scyk7XHJcbi8vICAgICB0aGlzLl9pbWFnZVdpZHRoID0gKGdyaWRXaWR0aCAtICgodGhpcy5fY29scyAtIDEpICogdGhpcy5fZ3JpZFNwYWNpbmcpKSAvXHJcbi8vICAgICAgICAgdGhpcy5fY29scztcclxuLy8gICAgIHRoaXMuX2ltYWdlSGVpZ2h0ID0gdGhpcy5faW1hZ2VXaWR0aCAqICgxIC8gdGhpcy5fYXNwZWN0UmF0aW8pO1xyXG4vLyB9O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fY2FsY3VsYXRlR3JpZCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBncmlkV2lkdGggPSB0aGlzLl8kZ3JpZC5pbm5lcldpZHRoKCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9icmVha3BvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgaWYgKGdyaWRXaWR0aCA8PSB0aGlzLl9icmVha3BvaW50c1tpXS53aWR0aCkge1xyXG4gICAgICB0aGlzLl9jb2xzID0gdGhpcy5fYnJlYWtwb2ludHNbaV0uY29scztcclxuICAgICAgdGhpcy5fZ3JpZFNwYWNpbmcgPSB0aGlzLl9icmVha3BvaW50c1tpXS5zcGFjaW5nO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgdGhpcy5fcm93cyA9IE1hdGguY2VpbCh0aGlzLl8kcHJvamVjdHMubGVuZ3RoIC8gdGhpcy5fY29scyk7XHJcbiAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAodGhpcy5fY29scyAtIDEpICogdGhpcy5fZ3JpZFNwYWNpbmcpIC8gdGhpcy5fY29scztcclxuICB0aGlzLl9pbWFnZUhlaWdodCA9IHRoaXMuX2ltYWdlV2lkdGggKiAoMSAvIHRoaXMuX2FzcGVjdFJhdGlvKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NyZWF0ZUdyaWQgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl9jYWxjdWxhdGVHcmlkKCk7XHJcblxyXG4gIHRoaXMuXyRncmlkLmNzcyhcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XHJcbiAgdGhpcy5fJGdyaWQuY3NzKHtcclxuICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKiB0aGlzLl9yb3dzICsgdGhpcy5fZ3JpZFNwYWNpbmcgKiAodGhpcy5fcm93cyAtIDEpICsgXCJweFwiXHJcbiAgfSk7XHJcblxyXG4gIHRoaXMuXyRwcm9qZWN0cy5mb3JFYWNoKFxyXG4gICAgZnVuY3Rpb24oJGVsZW1lbnQsIGluZGV4KSB7XHJcbiAgICAgIHZhciBwb3MgPSB0aGlzLl9pbmRleFRvWFkoaW5kZXgpO1xyXG4gICAgICAkZWxlbWVudC5jc3Moe1xyXG4gICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgdG9wOiBwb3MueSArIFwicHhcIixcclxuICAgICAgICBsZWZ0OiBwb3MueCArIFwicHhcIixcclxuICAgICAgICB3aWR0aDogdGhpcy5faW1hZ2VXaWR0aCArIFwicHhcIixcclxuICAgICAgICBoZWlnaHQ6IHRoaXMuX2ltYWdlSGVpZ2h0ICsgXCJweFwiXHJcbiAgICAgIH0pO1xyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX29uTmF2Q2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcbiAgaWYgKCR0YXJnZXQuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSByZXR1cm47XHJcbiAgaWYgKHRoaXMuXyRhY3RpdmVOYXZJdGVtLmxlbmd0aCkgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgJHRhcmdldC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9ICR0YXJnZXQ7XHJcbiAgdmFyIGNhdGVnb3J5ID0gJHRhcmdldC5kYXRhKFwiY2F0ZWdvcnlcIikudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaGlzdG9yeS5wdXNoU3RhdGUoXHJcbiAgICB7XHJcbiAgICAgIHVybDogXCIvd29yay5odG1sXCIsXHJcbiAgICAgIHF1ZXJ5OiB7IGNhdGVnb3J5OiBjYXRlZ29yeSB9XHJcbiAgICB9LFxyXG4gICAgbnVsbCxcclxuICAgIFwiL3dvcmsuaHRtbD9jYXRlZ29yeT1cIiArIGNhdGVnb3J5XHJcbiAgKTtcclxuXHJcbiAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fb25Qcm9qZWN0Q2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gIHZhciBwcm9qZWN0TmFtZSA9ICR0YXJnZXQuZGF0YShcIm5hbWVcIik7XHJcbiAgdmFyIHVybCA9IFwiL3Byb2plY3RzL1wiICsgcHJvamVjdE5hbWUgKyBcIi5odG1sXCI7XHJcbiAgdGhpcy5fbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIHRydWUpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5faW5kZXhUb1hZID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICB2YXIgciA9IE1hdGguZmxvb3IoaW5kZXggLyB0aGlzLl9jb2xzKTtcclxuICB2YXIgYyA9IGluZGV4ICUgdGhpcy5fY29scztcclxuICByZXR1cm4ge1xyXG4gICAgeDogYyAqIHRoaXMuX2ltYWdlV2lkdGggKyBjICogdGhpcy5fZ3JpZFNwYWNpbmcsXHJcbiAgICB5OiByICogdGhpcy5faW1hZ2VIZWlnaHQgKyByICogdGhpcy5fZ3JpZFNwYWNpbmdcclxuICB9O1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFNsaWRlc2hvd01vZGFsO1xyXG5cclxudmFyIEtFWV9DT0RFUyA9IHtcclxuICBMRUZUX0FSUk9XOiAzNyxcclxuICBSSUdIVF9BUlJPVzogMzksXHJcbiAgRVNDQVBFOiAyN1xyXG59O1xyXG5cclxuZnVuY3Rpb24gU2xpZGVzaG93TW9kYWwoJGNvbnRhaW5lciwgc2xpZGVzaG93KSB7XHJcbiAgdGhpcy5fc2xpZGVzaG93ID0gc2xpZGVzaG93O1xyXG5cclxuICB0aGlzLl8kbW9kYWwgPSAkY29udGFpbmVyLmZpbmQoXCIuc2xpZGVzaG93LW1vZGFsXCIpO1xyXG4gIHRoaXMuXyRvdmVybGF5ID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIubW9kYWwtb3ZlcmxheVwiKTtcclxuICB0aGlzLl8kY29udGVudCA9IHRoaXMuXyRtb2RhbC5maW5kKFwiLm1vZGFsLWNvbnRlbnRzXCIpO1xyXG4gIHRoaXMuXyRjYXB0aW9uID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIubW9kYWwtY2FwdGlvblwiKTtcclxuICB0aGlzLl8kaW1hZ2VDb250YWluZXIgPSB0aGlzLl8kbW9kYWwuZmluZChcIi5tb2RhbC1pbWFnZVwiKTtcclxuICB0aGlzLl8kaW1hZ2VMZWZ0ID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIuaW1hZ2UtYWR2YW5jZS1sZWZ0XCIpO1xyXG4gIHRoaXMuXyRpbWFnZVJpZ2h0ID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIuaW1hZ2UtYWR2YW5jZS1yaWdodFwiKTtcclxuXHJcbiAgdGhpcy5faW5kZXggPSAwOyAvLyBJbmRleCBvZiBzZWxlY3RlZCBpbWFnZVxyXG4gIHRoaXMuX2lzT3BlbiA9IGZhbHNlO1xyXG5cclxuICB0aGlzLl8kaW1hZ2VMZWZ0Lm9uKFwiY2xpY2tcIiwgdGhpcy5hZHZhbmNlTGVmdC5iaW5kKHRoaXMpKTtcclxuICB0aGlzLl8kaW1hZ2VSaWdodC5vbihcImNsaWNrXCIsIHRoaXMuYWR2YW5jZVJpZ2h0LmJpbmQodGhpcykpO1xyXG4gICQoZG9jdW1lbnQpLm9uKFwia2V5ZG93blwiLCB0aGlzLl9vbktleURvd24uYmluZCh0aGlzKSk7XHJcblxyXG4gIC8vIEdpdmUgalF1ZXJ5IGNvbnRyb2wgb3ZlciBzaG93aW5nL2hpZGluZ1xyXG4gIHRoaXMuXyRtb2RhbC5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XHJcbiAgdGhpcy5fJG1vZGFsLmhpZGUoKTtcclxuXHJcbiAgLy8gRXZlbnRzXHJcbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xyXG4gIHRoaXMuXyRvdmVybGF5Lm9uKFwiY2xpY2tcIiwgdGhpcy5jbG9zZS5iaW5kKHRoaXMpKTtcclxuICB0aGlzLl8kbW9kYWwuZmluZChcIi5tb2RhbC1jbG9zZVwiKS5vbihcImNsaWNrXCIsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XHJcblxyXG4gIHRoaXMuX3VwZGF0ZUNvbnRyb2xzKCk7XHJcblxyXG4gIC8vIFNpemUgb2YgZm9udGF3ZXNvbWUgaWNvbnMgbmVlZHMgYSBzbGlnaHQgZGVsYXkgKHVudGlsIHN0YWNrIGlzIGNsZWFyKSBmb3JcclxuICAvLyBzb21lIHJlYXNvblxyXG4gIHNldFRpbWVvdXQoXHJcbiAgICBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5fb25SZXNpemUoKTtcclxuICAgIH0uYmluZCh0aGlzKSxcclxuICAgIDBcclxuICApO1xyXG59XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUuYWR2YW5jZUxlZnQgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLnNob3dJbWFnZUF0KHRoaXMuX2luZGV4IC0gMSk7XHJcbn07XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUuYWR2YW5jZVJpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5zaG93SW1hZ2VBdCh0aGlzLl9pbmRleCArIDEpO1xyXG59O1xyXG5cclxuU2xpZGVzaG93TW9kYWwucHJvdG90eXBlLnNob3dJbWFnZUF0ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICBpbmRleCA9IE1hdGgubWF4KGluZGV4LCAwKTtcclxuICBpbmRleCA9IE1hdGgubWluKGluZGV4LCB0aGlzLl9zbGlkZXNob3cuZ2V0TnVtSW1hZ2VzKCkgLSAxKTtcclxuICB0aGlzLl9pbmRleCA9IGluZGV4O1xyXG4gIHZhciAkaW1nID0gdGhpcy5fc2xpZGVzaG93LmdldEdhbGxlcnlJbWFnZSh0aGlzLl9pbmRleCk7XHJcbiAgdmFyIGNhcHRpb24gPSB0aGlzLl9zbGlkZXNob3cuZ2V0Q2FwdGlvbih0aGlzLl9pbmRleCk7XHJcblxyXG4gIHRoaXMuXyRpbWFnZUNvbnRhaW5lci5lbXB0eSgpO1xyXG4gICQoXCI8aW1nPlwiLCB7IHNyYzogJGltZy5hdHRyKFwic3JjXCIpIH0pLmFwcGVuZFRvKHRoaXMuXyRpbWFnZUNvbnRhaW5lcik7XHJcblxyXG4gIHRoaXMuXyRjYXB0aW9uLmVtcHR5KCk7XHJcbiAgaWYgKGNhcHRpb24pIHtcclxuICAgICQoXCI8c3Bhbj5cIilcclxuICAgICAgLmFkZENsYXNzKFwiZmlndXJlLW51bWJlclwiKVxyXG4gICAgICAudGV4dChcIkZpZy4gXCIgKyAodGhpcy5faW5kZXggKyAxKSArIFwiOiBcIilcclxuICAgICAgLmFwcGVuZFRvKHRoaXMuXyRjYXB0aW9uKTtcclxuICAgICQoXCI8c3Bhbj5cIilcclxuICAgICAgLmFkZENsYXNzKFwiY2FwdGlvbi10ZXh0XCIpXHJcbiAgICAgIC50ZXh0KGNhcHRpb24pXHJcbiAgICAgIC5hcHBlbmRUbyh0aGlzLl8kY2FwdGlvbik7XHJcbiAgfVxyXG5cclxuICB0aGlzLl9vblJlc2l6ZSgpO1xyXG4gIHRoaXMuX3VwZGF0ZUNvbnRyb2xzKCk7XHJcbn07XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgaW5kZXggPSBpbmRleCB8fCAwO1xyXG4gIHRoaXMuXyRtb2RhbC5zaG93KCk7XHJcbiAgdGhpcy5zaG93SW1hZ2VBdChpbmRleCk7XHJcbiAgdGhpcy5faXNPcGVuID0gdHJ1ZTtcclxufTtcclxuXHJcblNsaWRlc2hvd01vZGFsLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuXyRtb2RhbC5oaWRlKCk7XHJcbiAgdGhpcy5faXNPcGVuID0gZmFsc2U7XHJcbn07XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUuX29uS2V5RG93biA9IGZ1bmN0aW9uKGUpIHtcclxuICBpZiAoIXRoaXMuX2lzT3BlbikgcmV0dXJuO1xyXG4gIGlmIChlLndoaWNoID09PSBLRVlfQ09ERVMuTEVGVF9BUlJPVykge1xyXG4gICAgdGhpcy5hZHZhbmNlTGVmdCgpO1xyXG4gIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gS0VZX0NPREVTLlJJR0hUX0FSUk9XKSB7XHJcbiAgICB0aGlzLmFkdmFuY2VSaWdodCgpO1xyXG4gIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gS0VZX0NPREVTLkVTQ0FQRSkge1xyXG4gICAgdGhpcy5jbG9zZSgpO1xyXG4gIH1cclxufTtcclxuXHJcblNsaWRlc2hvd01vZGFsLnByb3RvdHlwZS5fdXBkYXRlQ29udHJvbHMgPSBmdW5jdGlvbigpIHtcclxuICAvLyBSZS1lbmFibGVcclxuICB0aGlzLl8kaW1hZ2VSaWdodC5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIHRoaXMuXyRpbWFnZUxlZnQucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuXHJcbiAgLy8gRGlzYWJsZSBpZiB3ZSd2ZSByZWFjaGVkIHRoZSB0aGUgbWF4IG9yIG1pbiBsaW1pdFxyXG4gIGlmICh0aGlzLl9pbmRleCA+PSB0aGlzLl9zbGlkZXNob3cuZ2V0TnVtSW1hZ2VzKCkgLSAxKSB7XHJcbiAgICB0aGlzLl8kaW1hZ2VSaWdodC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIH0gZWxzZSBpZiAodGhpcy5faW5kZXggPD0gMCkge1xyXG4gICAgdGhpcy5fJGltYWdlTGVmdC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIH1cclxufTtcclxuXHJcblNsaWRlc2hvd01vZGFsLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgJGltYWdlID0gdGhpcy5fJGltYWdlQ29udGFpbmVyLmZpbmQoXCJpbWdcIik7XHJcblxyXG4gIC8vIFJlc2V0IHRoZSBjb250ZW50J3Mgd2lkdGhcclxuICB0aGlzLl8kY29udGVudC53aWR0aChcIlwiKTtcclxuXHJcbiAgLy8gRmluZCB0aGUgc2l6ZSBvZiB0aGUgY29tcG9uZW50cyB0aGF0IG5lZWQgdG8gYmUgZGlzcGxheWVkIGluIGFkZGl0aW9uIHRvXHJcbiAgLy8gdGhlIGltYWdlXHJcbiAgdmFyIGNvbnRyb2xzV2lkdGggPSB0aGlzLl8kaW1hZ2VMZWZ0Lm91dGVyV2lkdGgodHJ1ZSkgKyB0aGlzLl8kaW1hZ2VSaWdodC5vdXRlcldpZHRoKHRydWUpO1xyXG4gIC8vIEhhY2sgZm9yIG5vdyAtIGJ1ZGdldCBmb3IgMnggdGhlIGNhcHRpb24gaGVpZ2h0LlxyXG4gIHZhciBjYXB0aW9uSGVpZ2h0ID0gMiAqIHRoaXMuXyRjYXB0aW9uLm91dGVySGVpZ2h0KHRydWUpO1xyXG4gIC8vIHZhciBpbWFnZVBhZGRpbmcgPSAkaW1hZ2UuaW5uZXJXaWR0aCgpO1xyXG5cclxuICAvLyBDYWxjdWxhdGUgdGhlIGF2YWlsYWJsZSBhcmVhIGZvciB0aGUgbW9kYWxcclxuICB2YXIgbXcgPSB0aGlzLl8kbW9kYWwud2lkdGgoKSAtIGNvbnRyb2xzV2lkdGg7XHJcbiAgdmFyIG1oID0gdGhpcy5fJG1vZGFsLmhlaWdodCgpIC0gY2FwdGlvbkhlaWdodDtcclxuXHJcbiAgLy8gRml0IHRoZSBpbWFnZSB0byB0aGUgcmVtYWluaW5nIHNjcmVlbiByZWFsIGVzdGF0ZVxyXG4gIHZhciBzZXRTaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaXcgPSAkaW1hZ2UucHJvcChcIm5hdHVyYWxXaWR0aFwiKTtcclxuICAgIHZhciBpaCA9ICRpbWFnZS5wcm9wKFwibmF0dXJhbEhlaWdodFwiKTtcclxuICAgIHZhciBzdyA9IGl3IC8gbXc7XHJcbiAgICB2YXIgc2ggPSBpaCAvIG1oO1xyXG4gICAgdmFyIHMgPSBNYXRoLm1heChzdywgc2gpO1xyXG5cclxuICAgIC8vIFNldCB3aWR0aC9oZWlnaHQgdXNpbmcgQ1NTIGluIG9yZGVyIHRvIHJlc3BlY3QgYm94LXNpemluZ1xyXG4gICAgaWYgKHMgPiAxKSB7XHJcbiAgICAgICRpbWFnZS5jc3MoXCJ3aWR0aFwiLCBpdyAvIHMgKyBcInB4XCIpO1xyXG4gICAgICAkaW1hZ2UuY3NzKFwiaGVpZ2h0XCIsIGloIC8gcyArIFwicHhcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkaW1hZ2UuY3NzKFwid2lkdGhcIiwgaXcgKyBcInB4XCIpO1xyXG4gICAgICAkaW1hZ2UuY3NzKFwiaGVpZ2h0XCIsIGloICsgXCJweFwiKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl8kaW1hZ2VSaWdodC5jc3MoXCJ0b3BcIiwgJGltYWdlLm91dGVySGVpZ2h0KCkgLyAyICsgXCJweFwiKTtcclxuICAgIHRoaXMuXyRpbWFnZUxlZnQuY3NzKFwidG9wXCIsICRpbWFnZS5vdXRlckhlaWdodCgpIC8gMiArIFwicHhcIik7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBjb250ZW50IHdyYXBwZXIgdG8gYmUgdGhlIHdpZHRoIG9mIHRoZSBpbWFnZS4gVGhpcyB3aWxsIGtlZXBcclxuICAgIC8vIHRoZSBjYXB0aW9uIGZyb20gZXhwYW5kaW5nIGJleW9uZCB0aGUgaW1hZ2UuXHJcbiAgICB0aGlzLl8kY29udGVudC53aWR0aCgkaW1hZ2Uub3V0ZXJXaWR0aCh0cnVlKSk7XHJcbiAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICBpZiAoJGltYWdlLnByb3AoXCJjb21wbGV0ZVwiKSkgc2V0U2l6ZSgpO1xyXG4gIGVsc2UgJGltYWdlLm9uZShcImxvYWRcIiwgc2V0U2l6ZSk7XHJcbn07XHJcbiIsInZhciBTbGlkZXNob3dNb2RhbCA9IHJlcXVpcmUoXCIuL3NsaWRlc2hvdy1tb2RhbC5qc1wiKTtcclxudmFyIFRodW1ibmFpbFNsaWRlciA9IHJlcXVpcmUoXCIuL3RodW1ibmFpbC1zbGlkZXIuanNcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBpbml0OiBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkID8gdHJhbnNpdGlvbkR1cmF0aW9uIDogNDAwO1xyXG4gICAgdGhpcy5fc2xpZGVzaG93cyA9IFtdO1xyXG4gICAgJChcIi5zbGlkZXNob3dcIikuZWFjaChcclxuICAgICAgZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgc2xpZGVzaG93ID0gbmV3IFNsaWRlc2hvdygkKGVsZW1lbnQpLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xyXG4gICAgICAgIHRoaXMuX3NsaWRlc2hvd3MucHVzaChzbGlkZXNob3cpO1xyXG4gICAgICB9LmJpbmQodGhpcylcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG5cclxuZnVuY3Rpb24gU2xpZGVzaG93KCRjb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbjtcclxuICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICB0aGlzLl9pbmRleCA9IDA7IC8vIEluZGV4IG9mIHNlbGVjdGVkIGltYWdlXHJcblxyXG4gIC8vIENyZWF0ZSBjb21wb25lbnRzXHJcbiAgdGhpcy5fdGh1bWJuYWlsU2xpZGVyID0gbmV3IFRodW1ibmFpbFNsaWRlcigkY29udGFpbmVyLCB0aGlzKTtcclxuICB0aGlzLl9tb2RhbCA9IG5ldyBTbGlkZXNob3dNb2RhbCgkY29udGFpbmVyLCB0aGlzKTtcclxuXHJcbiAgLy8gQ2FjaGUgYW5kIGNyZWF0ZSBuZWNlc3NhcnkgRE9NIGVsZW1lbnRzXHJcbiAgdGhpcy5fJGNhcHRpb25Db250YWluZXIgPSAkY29udGFpbmVyLmZpbmQoXCIuY2FwdGlvblwiKTtcclxuICB0aGlzLl8kc2VsZWN0ZWRJbWFnZUNvbnRhaW5lciA9ICRjb250YWluZXIuZmluZChcIi5zZWxlY3RlZC1pbWFnZVwiKTtcclxuXHJcbiAgLy8gT3BlbiBtb2RhbCBvbiBjbGlja2luZyBzZWxlY3RlZCBpbWFnZVxyXG4gIHRoaXMuXyRzZWxlY3RlZEltYWdlQ29udGFpbmVyLm9uKFxyXG4gICAgXCJjbGlja1wiLFxyXG4gICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuX21vZGFsLm9wZW4odGhpcy5faW5kZXgpO1xyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxuXHJcbiAgLy8gTG9hZCBpbWFnZXNcclxuICB0aGlzLl8kZ2FsbGVyeUltYWdlcyA9IHRoaXMuX2xvYWRHYWxsZXJ5SW1hZ2VzKCk7XHJcbiAgdGhpcy5fbnVtSW1hZ2VzID0gdGhpcy5fJGdhbGxlcnlJbWFnZXMubGVuZ3RoO1xyXG5cclxuICAvLyBTaG93IHRoZSBmaXJzdCBpbWFnZVxyXG4gIHRoaXMuc2hvd0ltYWdlKDApO1xyXG59XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldEFjdGl2ZUluZGV4ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMuX2luZGV4O1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXROdW1JbWFnZXMgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5fbnVtSW1hZ2VzO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXRHYWxsZXJ5SW1hZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIHJldHVybiB0aGlzLl8kZ2FsbGVyeUltYWdlc1tpbmRleF07XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldENhcHRpb24gPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIHJldHVybiB0aGlzLl8kZ2FsbGVyeUltYWdlc1tpbmRleF0uZGF0YShcImNhcHRpb25cIik7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLnNob3dJbWFnZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgLy8gUmVzZXQgYWxsIGltYWdlcyB0byBpbnZpc2libGUgYW5kIGxvd2VzdCB6LWluZGV4LiBUaGlzIGNvdWxkIGJlIHNtYXJ0ZXIsXHJcbiAgLy8gbGlrZSBIb3ZlclNsaWRlc2hvdywgYW5kIG9ubHkgcmVzZXQgZXhhY3RseSB3aGF0IHdlIG5lZWQsIGJ1dCB3ZSBhcmVuJ3RcclxuICAvLyB3YXN0aW5nIHRoYXQgbWFueSBjeWNsZXMuXHJcbiAgdGhpcy5fJGdhbGxlcnlJbWFnZXMuZm9yRWFjaChmdW5jdGlvbigkZ2FsbGVyeUltYWdlKSB7XHJcbiAgICAkZ2FsbGVyeUltYWdlLmNzcyh7XHJcbiAgICAgIHpJbmRleDogMCxcclxuICAgICAgb3BhY2l0eTogMFxyXG4gICAgfSk7XHJcbiAgICAkZ2FsbGVyeUltYWdlLnZlbG9jaXR5KFwic3RvcFwiKTsgLy8gU3RvcCBhbnkgYW5pbWF0aW9uc1xyXG4gIH0sIHRoaXMpO1xyXG5cclxuICAvLyBDYWNoZSByZWZlcmVuY2VzIHRvIHRoZSBsYXN0IGFuZCBjdXJyZW50IGltYWdlXHJcbiAgdmFyICRsYXN0SW1hZ2UgPSB0aGlzLl8kZ2FsbGVyeUltYWdlc1t0aGlzLl9pbmRleF07XHJcbiAgdmFyICRjdXJyZW50SW1hZ2UgPSB0aGlzLl8kZ2FsbGVyeUltYWdlc1tpbmRleF07XHJcbiAgdGhpcy5faW5kZXggPSBpbmRleDtcclxuXHJcbiAgLy8gTWFrZSB0aGUgbGFzdCBpbWFnZSB2aXNpc2JsZSBhbmQgdGhlbiBhbmltYXRlIHRoZSBjdXJyZW50IGltYWdlIGludG8gdmlld1xyXG4gIC8vIG9uIHRvcCBvZiB0aGUgbGFzdFxyXG4gICRsYXN0SW1hZ2UuY3NzKFwiekluZGV4XCIsIDEpO1xyXG4gICRjdXJyZW50SW1hZ2UuY3NzKFwiekluZGV4XCIsIDIpO1xyXG4gICRsYXN0SW1hZ2UuY3NzKFwib3BhY2l0eVwiLCAxKTtcclxuICAkY3VycmVudEltYWdlLnZlbG9jaXR5KHsgb3BhY2l0eTogMSB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFwiZWFzZUluT3V0UXVhZFwiKTtcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSBjYXB0aW9uLCBpZiBpdCBleGlzdHMgb24gdGhlIHRodW1ibmFpbFxyXG4gIHZhciBjYXB0aW9uID0gJGN1cnJlbnRJbWFnZS5kYXRhKFwiY2FwdGlvblwiKTtcclxuICBpZiAoY2FwdGlvbikge1xyXG4gICAgdGhpcy5fJGNhcHRpb25Db250YWluZXIuZW1wdHkoKTtcclxuICAgICQoXCI8c3Bhbj5cIilcclxuICAgICAgLmFkZENsYXNzKFwiZmlndXJlLW51bWJlclwiKVxyXG4gICAgICAudGV4dChcIkZpZy4gXCIgKyAodGhpcy5faW5kZXggKyAxKSArIFwiOiBcIilcclxuICAgICAgLmFwcGVuZFRvKHRoaXMuXyRjYXB0aW9uQ29udGFpbmVyKTtcclxuICAgICQoXCI8c3Bhbj5cIilcclxuICAgICAgLmFkZENsYXNzKFwiY2FwdGlvbi10ZXh0XCIpXHJcbiAgICAgIC50ZXh0KGNhcHRpb24pXHJcbiAgICAgIC5hcHBlbmRUbyh0aGlzLl8kY2FwdGlvbkNvbnRhaW5lcik7XHJcbiAgfVxyXG5cclxuICAvLyBPYmplY3QgaW1hZ2UgZml0IHBvbHlmaWxsIGJyZWFrcyBqUXVlcnkgYXR0ciguLi4pLCBzbyBmYWxsYmFjayB0byBqdXN0XHJcbiAgLy8gdXNpbmcgZWxlbWVudC5zcmNcclxuICAvLyBUT0RPOiBMYXp5IVxyXG4gIC8vIGlmICgkY3VycmVudEltYWdlLmdldCgwKS5zcmMgPT09IFwiXCIpIHtcclxuICAvLyAgICAgJGN1cnJlbnRJbWFnZS5nZXQoMCkuc3JjID0gJGN1cnJlbnRJbWFnZS5kYXRhKFwiaW1hZ2UtdXJsXCIpO1xyXG4gIC8vIH1cclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX2xvYWRHYWxsZXJ5SW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gQ3JlYXRlIGVtcHR5IGltYWdlcyBpbiB0aGUgZ2FsbGVyeSBmb3IgZWFjaCB0aHVtYm5haWwuIFRoaXMgaGVscHMgdXMgZG9cclxuICAvLyBsYXp5IGxvYWRpbmcgb2YgZ2FsbGVyeSBpbWFnZXMgYW5kIGFsbG93cyB1cyB0byBjcm9zcy1mYWRlIGltYWdlcy5cclxuICB2YXIgJGdhbGxlcnlJbWFnZXMgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3RodW1ibmFpbFNsaWRlci5nZXROdW1UaHVtYm5haWxzKCk7IGkgKz0gMSkge1xyXG4gICAgLy8gR2V0IHRoZSB0aHVtYm5haWwgZWxlbWVudCB3aGljaCBoYXMgcGF0aCBhbmQgY2FwdGlvbiBkYXRhXHJcbiAgICB2YXIgJHRodW1iID0gdGhpcy5fdGh1bWJuYWlsU2xpZGVyLmdldCRUaHVtYm5haWwoaSk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBpZCBmcm9tIHRoZSBwYXRoIHRvIHRoZSBsYXJnZSBpbWFnZVxyXG4gICAgdmFyIGxhcmdlUGF0aCA9ICR0aHVtYi5kYXRhKFwibGFyZ2UtcGF0aFwiKTtcclxuICAgIHZhciBpZCA9IGxhcmdlUGF0aFxyXG4gICAgICAuc3BsaXQoXCIvXCIpXHJcbiAgICAgIC5wb3AoKVxyXG4gICAgICAuc3BsaXQoXCIuXCIpWzBdO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIGdhbGxlcnkgaW1hZ2UgZWxlbWVudFxyXG4gICAgdmFyICRnYWxsZXJ5SW1hZ2UgPSAkKFwiPGltZz5cIiwgeyBpZDogaWQgfSlcclxuICAgICAgLmNzcyh7XHJcbiAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICB0b3A6IFwiMHB4XCIsXHJcbiAgICAgICAgbGVmdDogXCIwcHhcIixcclxuICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgIHpJbmRleDogMFxyXG4gICAgICB9KVxyXG4gICAgICAuZGF0YShcImltYWdlLXVybFwiLCBsYXJnZVBhdGgpXHJcbiAgICAgIC5kYXRhKFwiY2FwdGlvblwiLCAkdGh1bWIuZGF0YShcImNhcHRpb25cIikpXHJcbiAgICAgIC5hcHBlbmRUbyh0aGlzLl8kc2VsZWN0ZWRJbWFnZUNvbnRhaW5lcik7XHJcbiAgICAkZ2FsbGVyeUltYWdlLmdldCgwKS5zcmMgPSBsYXJnZVBhdGg7IC8vIFRPRE86IE1ha2UgdGhpcyBsYXp5IVxyXG4gICAgJGdhbGxlcnlJbWFnZXMucHVzaCgkZ2FsbGVyeUltYWdlKTtcclxuICB9XHJcbiAgcmV0dXJuICRnYWxsZXJ5SW1hZ2VzO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFRodW1ibmFpbFNsaWRlcjtcclxuXHJcbmZ1bmN0aW9uIFRodW1ibmFpbFNsaWRlcigkY29udGFpbmVyLCBzbGlkZXNob3cpIHtcclxuICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICB0aGlzLl9zbGlkZXNob3cgPSBzbGlkZXNob3c7XHJcblxyXG4gIHRoaXMuX2luZGV4ID0gMDsgLy8gSW5kZXggb2Ygc2VsZWN0ZWQgdGh1bWJuYWlsXHJcbiAgdGhpcy5fc2Nyb2xsSW5kZXggPSAwOyAvLyBJbmRleCBvZiB0aGUgdGh1bWJuYWlsIHRoYXQgaXMgY3VycmVudGx5IGNlbnRlcmVkXHJcblxyXG4gIC8vIENhY2hlIGFuZCBjcmVhdGUgbmVjZXNzYXJ5IERPTSBlbGVtZW50c1xyXG4gIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIgPSAkY29udGFpbmVyLmZpbmQoXCIudGh1bWJuYWlsc1wiKTtcclxuICB0aGlzLl8kdGh1bWJuYWlsSW1hZ2VzID0gdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci5maW5kKFwiaW1nXCIpO1xyXG4gIHRoaXMuXyR2aXNpYmxlVGh1bWJuYWlsV3JhcCA9ICRjb250YWluZXIuZmluZChcIi52aXNpYmxlLXRodW1ibmFpbHNcIik7XHJcbiAgdGhpcy5fJGFkdmFuY2VMZWZ0ID0gJGNvbnRhaW5lci5maW5kKFwiLnRodW1ibmFpbC1hZHZhbmNlLWxlZnRcIik7XHJcbiAgdGhpcy5fJGFkdmFuY2VSaWdodCA9ICRjb250YWluZXIuZmluZChcIi50aHVtYm5haWwtYWR2YW5jZS1yaWdodFwiKTtcclxuXHJcbiAgLy8gTG9vcCB0aHJvdWdoIHRoZSB0aHVtYm5haWxzLCBnaXZlIHRoZW0gYW4gaW5kZXggZGF0YSBhdHRyaWJ1dGUgYW5kIGNhY2hlXHJcbiAgLy8gYSByZWZlcmVuY2UgdG8gdGhlbSBpbiBhbiBhcnJheVxyXG4gIHRoaXMuXyR0aHVtYm5haWxzID0gW107XHJcbiAgdGhpcy5fJHRodW1ibmFpbEltYWdlcy5lYWNoKFxyXG4gICAgZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgdmFyICR0aHVtYm5haWwgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAkdGh1bWJuYWlsLmRhdGEoXCJpbmRleFwiLCBpbmRleCk7XHJcbiAgICAgIHRoaXMuXyR0aHVtYm5haWxzLnB1c2goJHRodW1ibmFpbCk7XHJcbiAgICB9LmJpbmQodGhpcylcclxuICApO1xyXG4gIHRoaXMuX251bUltYWdlcyA9IHRoaXMuXyR0aHVtYm5haWxzLmxlbmd0aDtcclxuXHJcbiAgLy8gTGVmdC9yaWdodCBjb250cm9sc1xyXG4gIHRoaXMuXyRhZHZhbmNlTGVmdC5vbihcImNsaWNrXCIsIHRoaXMuYWR2YW5jZUxlZnQuYmluZCh0aGlzKSk7XHJcbiAgdGhpcy5fJGFkdmFuY2VSaWdodC5vbihcImNsaWNrXCIsIHRoaXMuYWR2YW5jZVJpZ2h0LmJpbmQodGhpcykpO1xyXG5cclxuICAvLyBDbGlja2luZyBhIHRodW1ibmFpbFxyXG4gIHRoaXMuXyR0aHVtYm5haWxJbWFnZXMub24oXCJjbGlja1wiLCB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICB0aGlzLl9hY3RpdmF0ZVRodW1ibmFpbCgwKTtcclxuXHJcbiAgLy8gUmVzaXplXHJcbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xyXG5cclxuICAvLyBGb3Igc29tZSByZWFzb24sIHRoZSBzaXppbmcgb24gdGhlIGNvbnRyb2xzIGlzIG1lc3NlZCB1cCBpZiBpdCBydW5zXHJcbiAgLy8gaW1tZWRpYXRlbHkgLSBkZWxheSBzaXppbmcgdW50aWwgc3RhY2sgaXMgY2xlYXJcclxuICBzZXRUaW1lb3V0KFxyXG4gICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuX29uUmVzaXplKCk7XHJcbiAgICB9LmJpbmQodGhpcyksXHJcbiAgICAwXHJcbiAgKTtcclxufVxyXG5cclxuVGh1bWJuYWlsU2xpZGVyLnByb3RvdHlwZS5nZXRBY3RpdmVJbmRleCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLl9pbmRleDtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuZ2V0TnVtVGh1bWJuYWlscyA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLl9udW1JbWFnZXM7XHJcbn07XHJcblxyXG5UaHVtYm5haWxTbGlkZXIucHJvdG90eXBlLmdldCRUaHVtYm5haWwgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIHJldHVybiB0aGlzLl8kdGh1bWJuYWlsc1tpbmRleF07XHJcbn07XHJcblxyXG5UaHVtYm5haWxTbGlkZXIucHJvdG90eXBlLmFkdmFuY2VMZWZ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG5ld0luZGV4ID0gdGhpcy5fc2Nyb2xsSW5kZXggLSB0aGlzLl9udW1WaXNpYmxlO1xyXG4gIG5ld0luZGV4ID0gTWF0aC5tYXgobmV3SW5kZXgsIDApO1xyXG4gIHRoaXMuX3Njcm9sbFRvVGh1bWJuYWlsKG5ld0luZGV4KTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuYWR2YW5jZVJpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG5ld0luZGV4ID0gdGhpcy5fc2Nyb2xsSW5kZXggKyB0aGlzLl9udW1WaXNpYmxlO1xyXG4gIG5ld0luZGV4ID0gTWF0aC5taW4obmV3SW5kZXgsIHRoaXMuX251bUltYWdlcyAtIDEpO1xyXG4gIHRoaXMuX3Njcm9sbFRvVGh1bWJuYWlsKG5ld0luZGV4KTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX3Jlc2V0U2l6aW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gUmVzZXQgc2l6aW5nIHZhcmlhYmxlcy4gVGhpcyBpbmNsdWRlcyByZXNldHRpbmcgYW55IGlubGluZSBzdHlsZSB0aGF0IGhhc1xyXG4gIC8vIGJlZW4gYXBwbGllZCwgc28gdGhhdCBhbnkgc2l6ZSBjYWxjdWxhdGlvbnMgY2FuIGJlIGJhc2VkIG9uIHRoZSBDU1NcclxuICAvLyBzdHlsaW5nLlxyXG4gIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIuY3NzKHtcclxuICAgIHRvcDogXCJcIixcclxuICAgIGxlZnQ6IFwiXCIsXHJcbiAgICB3aWR0aDogXCJcIixcclxuICAgIGhlaWdodDogXCJcIlxyXG4gIH0pO1xyXG4gIHRoaXMuXyR2aXNpYmxlVGh1bWJuYWlsV3JhcC53aWR0aChcIlwiKTtcclxuICB0aGlzLl8kdmlzaWJsZVRodW1ibmFpbFdyYXAuaGVpZ2h0KFwiXCIpO1xyXG4gIC8vIE1ha2UgYWxsIHRodW1ibmFpbHMgc3F1YXJlIGFuZCByZXNldCBhbnkgaGVpZ2h0XHJcbiAgdGhpcy5fJHRodW1ibmFpbHMuZm9yRWFjaChmdW5jdGlvbigkZWxlbWVudCkge1xyXG4gICAgJGVsZW1lbnQuaGVpZ2h0KFwiXCIpOyAvLyBSZXNldCBoZWlnaHQgYmVmb3JlIHNldHRpbmcgd2lkdGhcclxuICAgICRlbGVtZW50LndpZHRoKCRlbGVtZW50LmhlaWdodCgpKTtcclxuICB9KTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5fcmVzZXRTaXppbmcoKTtcclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRoZSBzaXplIG9mIHRoZSBmaXJzdCB0aHVtYm5haWwuIFRoaXMgYXNzdW1lcyB0aGUgZmlyc3QgaW1hZ2VcclxuICAvLyBvbmx5IGhhcyBhIHJpZ2h0LXNpZGUgbWFyZ2luLlxyXG4gIHZhciAkZmlyc3RUaHVtYiA9IHRoaXMuXyR0aHVtYm5haWxzWzBdO1xyXG4gIHZhciB0aHVtYlNpemUgPSAkZmlyc3RUaHVtYi5vdXRlckhlaWdodChmYWxzZSk7XHJcbiAgdmFyIHRodW1iTWFyZ2luID0gMiAqICgkZmlyc3RUaHVtYi5vdXRlcldpZHRoKHRydWUpIC0gdGh1bWJTaXplKTtcclxuXHJcbiAgLy8gTWVhc3VyZSBjb250cm9scy4gVGhleSBuZWVkIHRvIGJlIHZpc2libGUgaW4gb3JkZXIgdG8gYmUgbWVhc3VyZWQuXHJcbiAgdGhpcy5fJGFkdmFuY2VSaWdodC5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XHJcbiAgdGhpcy5fJGFkdmFuY2VMZWZ0LmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcclxuICB2YXIgdGh1bWJDb250cm9sV2lkdGggPVxyXG4gICAgdGhpcy5fJGFkdmFuY2VSaWdodC5vdXRlcldpZHRoKHRydWUpICsgdGhpcy5fJGFkdmFuY2VMZWZ0Lm91dGVyV2lkdGgodHJ1ZSk7XHJcblxyXG4gIC8vIENhbGN1bGF0ZSBob3cgbWFueSBmdWxsIHRodW1ibmFpbHMgY2FuIGZpdCB3aXRoaW4gdGhlIHRodW1ibmFpbCBhcmVhXHJcbiAgdmFyIHZpc2libGVXaWR0aCA9IHRoaXMuXyR2aXNpYmxlVGh1bWJuYWlsV3JhcC5vdXRlcldpZHRoKGZhbHNlKTtcclxuICB2YXIgbnVtVGh1bWJzVmlzaWJsZSA9IE1hdGguZmxvb3IoKHZpc2libGVXaWR0aCAtIHRodW1iTWFyZ2luKSAvICh0aHVtYlNpemUgKyB0aHVtYk1hcmdpbikpO1xyXG5cclxuICAvLyBDaGVjayB3aGV0aGVyIGFsbCB0aGUgdGh1bWJuYWlscyBjYW4gZml0IG9uIHRoZSBzY3JlZW4gYXQgb25jZVxyXG4gIGlmIChudW1UaHVtYnNWaXNpYmxlIDwgdGhpcy5fbnVtSW1hZ2VzKSB7XHJcbiAgICAvLyBUYWtlIGEgYmVzdCBndWVzcyBhdCBob3cgdG8gc2l6ZSB0aGUgdGh1bWJuYWlscy4gU2l6ZSBmb3JtdWxhOlxyXG4gICAgLy8gIHdpZHRoID0gbnVtICogdGh1bWJTaXplICsgKG51bSAtIDEpICogdGh1bWJNYXJnaW4gKyBjb250cm9sU2l6ZVxyXG4gICAgLy8gU29sdmUgZm9yIG51bWJlciBvZiB0aHVtYm5haWxzIGFuZCByb3VuZCB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyIHNvXHJcbiAgICAvLyB0aGF0IHdlIGRvbid0IGhhdmUgYW55IHBhcnRpYWwgdGh1bWJuYWlscyBzaG93aW5nLlxyXG4gICAgbnVtVGh1bWJzVmlzaWJsZSA9IE1hdGgucm91bmQoXHJcbiAgICAgICh2aXNpYmxlV2lkdGggLSB0aHVtYkNvbnRyb2xXaWR0aCArIHRodW1iTWFyZ2luKSAvICh0aHVtYlNpemUgKyB0aHVtYk1hcmdpbilcclxuICAgICk7XHJcblxyXG4gICAgLy8gVXNlIHRoaXMgbnVtYmVyIG9mIHRodW1ibmFpbHMgdG8gY2FsY3VsYXRlIHRoZSB0aHVtYm5haWwgc2l6ZVxyXG4gICAgdmFyIG5ld1NpemUgPSAodmlzaWJsZVdpZHRoIC0gdGh1bWJDb250cm9sV2lkdGggKyB0aHVtYk1hcmdpbikgLyBudW1UaHVtYnNWaXNpYmxlIC0gdGh1bWJNYXJnaW47XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlscy5mb3JFYWNoKGZ1bmN0aW9uKCRlbGVtZW50KSB7XHJcbiAgICAgIC8vICQud2lkdGggYW5kICQuaGVpZ2h0IHNldCB0aGUgY29udGVudCBzaXplIHJlZ2FyZGxlc3Mgb2YgdGhlXHJcbiAgICAgIC8vIGJveC1zaXppbmcuIFRoZSBpbWFnZXMgYXJlIGJvcmRlci1ib3gsIHNvIHdlIHdhbnQgdGhlIENTUyB3aWR0aFxyXG4gICAgICAvLyBhbmQgaGVpZ2h0LiBUaGlzIGFsbG93cyB0aGUgYWN0aXZlIGltYWdlIHRvIGhhdmUgYSBib3JkZXIgYW5kIHRoZVxyXG4gICAgICAvLyBvdGhlciBpbWFnZXMgdG8gaGF2ZSBwYWRkaW5nLlxyXG4gICAgICAkZWxlbWVudC5jc3MoXCJ3aWR0aFwiLCBuZXdTaXplICsgXCJweFwiKTtcclxuICAgICAgJGVsZW1lbnQuY3NzKFwiaGVpZ2h0XCIsIG5ld1NpemUgKyBcInB4XCIpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSB0aHVtYm5haWwgd3JhcCBzaXplLiBJdCBzaG91bGQgYmUganVzdCB0YWxsIGVub3VnaCB0byBmaXQgYVxyXG4gICAgLy8gdGh1bWJuYWlsIGFuZCBsb25nIGVub3VnaCB0byBob2xkIGFsbCB0aGUgdGh1bWJuYWlscyBpbiBvbmUgbGluZTpcclxuICAgIHZhciB0b3RhbFNpemUgPSBuZXdTaXplICogdGhpcy5fbnVtSW1hZ2VzICsgdGh1bWJNYXJnaW4gKiAodGhpcy5fbnVtSW1hZ2VzIC0gMSk7XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyLmNzcyh7XHJcbiAgICAgIHdpZHRoOiB0b3RhbFNpemUgKyBcInB4XCIsXHJcbiAgICAgIGhlaWdodDogJGZpcnN0VGh1bWIub3V0ZXJIZWlnaHQodHJ1ZSkgKyBcInB4XCJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldCB0aGUgdmlzaWJsZSB0aHVtYm5haWwgd3JhcCBzaXplLiBUaGlzIGlzIHVzZWQgdG8gbWFrcyB0aGUgbXVjaFxyXG4gICAgLy8gbGFyZ2VyIHRodW1ibmFpbCBjb250YWluZXIuIEl0IHNob3VsZCBiZSBhcyB3aWRlIGFzIGl0IGNhbiBiZSwgbWludXNcclxuICAgIC8vIHRoZSBzcGFjZSBuZWVkZWQgZm9yIHRoZSBsZWZ0L3JpZ2h0IGNvbnRvbHMuXHJcbiAgICB0aGlzLl8kdmlzaWJsZVRodW1ibmFpbFdyYXAuY3NzKHtcclxuICAgICAgd2lkdGg6IHZpc2libGVXaWR0aCAtIHRodW1iQ29udHJvbFdpZHRoICsgXCJweFwiLFxyXG4gICAgICBoZWlnaHQ6ICRmaXJzdFRodW1iLm91dGVySGVpZ2h0KHRydWUpICsgXCJweFwiXHJcbiAgICB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gQWxsIHRodW1ibmFpbHMgYXJlIHZpc2libGUsIHdlIGNhbiBoaWRlIHRoZSBjb250cm9scyBhbmQgZXhwYW5kIHRoZVxyXG4gICAgLy8gdGh1bWJuYWlsIGNvbnRhaW5lciB0byAxMDAlXHJcbiAgICBudW1UaHVtYnNWaXNpYmxlID0gdGhpcy5fbnVtSW1hZ2VzO1xyXG4gICAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci5jc3MoXCJ3aWR0aFwiLCBcIjEwMCVcIik7XHJcbiAgICB0aGlzLl8kYWR2YW5jZVJpZ2h0LmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgdGhpcy5fJGFkdmFuY2VMZWZ0LmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5fbnVtVmlzaWJsZSA9IG51bVRodW1ic1Zpc2libGU7XHJcbiAgdmFyIG1pZGRsZUluZGV4ID0gTWF0aC5mbG9vcigodGhpcy5fbnVtVmlzaWJsZSAtIDEpIC8gMik7XHJcbiAgdGhpcy5fc2Nyb2xsQm91bmRzID0ge1xyXG4gICAgbWluOiBtaWRkbGVJbmRleCxcclxuICAgIG1heDogdGhpcy5fbnVtSW1hZ2VzIC0gMSAtIG1pZGRsZUluZGV4XHJcbiAgfTtcclxuICBpZiAodGhpcy5fbnVtVmlzaWJsZSAlIDIgPT09IDApIHRoaXMuX3Njcm9sbEJvdW5kcy5tYXggLT0gMTtcclxuXHJcbiAgdGhpcy5fdXBkYXRlVGh1bWJuYWlsQ29udHJvbHMoKTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX2FjdGl2YXRlVGh1bWJuYWlsID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAvLyBBY3RpdmF0ZS9kZWFjdGl2YXRlIHRodW1ibmFpbHNcclxuICB0aGlzLl8kdGh1bWJuYWlsc1t0aGlzLl9pbmRleF0ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgdGhpcy5fJHRodW1ibmFpbHNbaW5kZXhdLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG59O1xyXG5cclxuVGh1bWJuYWlsU2xpZGVyLnByb3RvdHlwZS5fc2Nyb2xsVG9UaHVtYm5haWwgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIC8vIE5vIG5lZWQgdG8gc2Nyb2xsIGlmIGFsbCB0aHVtYm5haWxzIGFyZSB2aXNpYmxlXHJcbiAgaWYgKHRoaXMuX251bVZpc2libGUgPT09IHRoaXMuX251bUltYWdlcykgcmV0dXJuO1xyXG5cclxuICAvLyBDb25zdHJhaW4gaW5kZXggc28gdGhhdCB3ZSBjYW4ndCBzY3JvbGwgb3V0IG9mIGJvdW5kc1xyXG4gIGluZGV4ID0gTWF0aC5tYXgoaW5kZXgsIHRoaXMuX3Njcm9sbEJvdW5kcy5taW4pO1xyXG4gIGluZGV4ID0gTWF0aC5taW4oaW5kZXgsIHRoaXMuX3Njcm9sbEJvdW5kcy5tYXgpO1xyXG4gIHRoaXMuX3Njcm9sbEluZGV4ID0gaW5kZXg7XHJcblxyXG4gIC8vIEZpbmQgdGhlIFwibGVmdFwiIHBvc2l0aW9uIG9mIHRoZSB0aHVtYm5haWwgY29udGFpbmVyIHRoYXQgd291bGQgcHV0IHRoZVxyXG4gIC8vIHRodW1ibmFpbCBhdCBpbmRleCBhdCB0aGUgY2VudGVyXHJcbiAgdmFyICR0aHVtYiA9IHRoaXMuXyR0aHVtYm5haWxzWzBdO1xyXG4gIHZhciBzaXplID0gcGFyc2VGbG9hdCgkdGh1bWIuY3NzKFwid2lkdGhcIikpO1xyXG4gIHZhciBtYXJnaW4gPSAyICogcGFyc2VGbG9hdCgkdGh1bWIuY3NzKFwibWFyZ2luLXJpZ2h0XCIpKTtcclxuICB2YXIgY2VudGVyWCA9IHNpemUgKiB0aGlzLl9zY3JvbGxCb3VuZHMubWluICsgbWFyZ2luICogKHRoaXMuX3Njcm9sbEJvdW5kcy5taW4gLSAxKTtcclxuICB2YXIgdGh1bWJYID0gc2l6ZSAqIGluZGV4ICsgbWFyZ2luICogKGluZGV4IC0gMSk7XHJcbiAgdmFyIGxlZnQgPSBjZW50ZXJYIC0gdGh1bWJYO1xyXG5cclxuICAvLyBBbmltYXRlIHRoZSB0aHVtYm5haWwgY29udGFpbmVyXHJcbiAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci52ZWxvY2l0eShcclxuICAgIHtcclxuICAgICAgbGVmdDogbGVmdCArIFwicHhcIlxyXG4gICAgfSxcclxuICAgIDYwMCxcclxuICAgIFwiZWFzZUluT3V0UXVhZFwiXHJcbiAgKTtcclxuXHJcbiAgdGhpcy5fdXBkYXRlVGh1bWJuYWlsQ29udHJvbHMoKTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX29uQ2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuICB2YXIgaW5kZXggPSAkdGFyZ2V0LmRhdGEoXCJpbmRleFwiKTtcclxuXHJcbiAgLy8gQ2xpY2tlZCBvbiB0aGUgYWN0aXZlIGltYWdlIC0gbm8gbmVlZCB0byBkbyBhbnl0aGluZ1xyXG4gIGlmICh0aGlzLl9pbmRleCAhPT0gaW5kZXgpIHtcclxuICAgIHRoaXMuX2FjdGl2YXRlVGh1bWJuYWlsKGluZGV4KTtcclxuICAgIHRoaXMuX3Njcm9sbFRvVGh1bWJuYWlsKGluZGV4KTtcclxuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XHJcbiAgICB0aGlzLl9zbGlkZXNob3cuc2hvd0ltYWdlKGluZGV4KTtcclxuICB9XHJcbn07XHJcblxyXG5UaHVtYm5haWxTbGlkZXIucHJvdG90eXBlLl91cGRhdGVUaHVtYm5haWxDb250cm9scyA9IGZ1bmN0aW9uKCkge1xyXG4gIC8vIFJlLWVuYWJsZVxyXG4gIHRoaXMuXyRhZHZhbmNlTGVmdC5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIHRoaXMuXyRhZHZhbmNlUmlnaHQucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuXHJcbiAgLy8gRGlzYWJsZSBpZiB3ZSd2ZSByZWFjaGVkIHRoZSB0aGUgbWF4IG9yIG1pbiBsaW1pdFxyXG4gIC8vIHZhciBtaWRTY3JvbGxJbmRleCA9IE1hdGguZmxvb3IoKHRoaXMuX251bVZpc2libGUgLSAxKSAvIDIpO1xyXG4gIC8vIHZhciBtaW5TY3JvbGxJbmRleCA9IG1pZFNjcm9sbEluZGV4O1xyXG4gIC8vIHZhciBtYXhTY3JvbGxJbmRleCA9IHRoaXMuX251bUltYWdlcyAtIDEgLSBtaWRTY3JvbGxJbmRleDtcclxuICBpZiAodGhpcy5fc2Nyb2xsSW5kZXggPj0gdGhpcy5fc2Nyb2xsQm91bmRzLm1heCkge1xyXG4gICAgdGhpcy5fJGFkdmFuY2VSaWdodC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIH0gZWxzZSBpZiAodGhpcy5fc2Nyb2xsSW5kZXggPD0gdGhpcy5fc2Nyb2xsQm91bmRzLm1pbikge1xyXG4gICAgdGhpcy5fJGFkdmFuY2VMZWZ0LmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgfVxyXG59O1xyXG4iLCJleHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbih2YWwsIGRlZmF1bHRWYWwpIHtcclxuICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQgPyB2YWwgOiBkZWZhdWx0VmFsO1xyXG59O1xyXG5cclxuLy8gVW50ZXN0ZWRcclxuLy8gZXhwb3J0cy5kZWZhdWx0UHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmF1bHRQcm9wZXJ0aWVzIChvYmosIHByb3BzKSB7XHJcbi8vICAgICBmb3IgKHZhciBwcm9wIGluIHByb3BzKSB7XHJcbi8vICAgICAgICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KHByb3BzLCBwcm9wKSkge1xyXG4vLyAgICAgICAgICAgICB2YXIgdmFsdWUgPSBleHBvcnRzLmRlZmF1bHRWYWx1ZShwcm9wcy52YWx1ZSwgcHJvcHMuZGVmYXVsdCk7XHJcbi8vICAgICAgICAgICAgIG9ialtwcm9wXSA9IHZhbHVlO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgIH1cclxuLy8gICAgIHJldHVybiBvYmo7XHJcbi8vIH07XHJcbi8vXHJcbmV4cG9ydHMudGltZUl0ID0gZnVuY3Rpb24oZnVuYykge1xyXG4gIHZhciBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gIGZ1bmMoKTtcclxuICB2YXIgZW5kID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgcmV0dXJuIGVuZCAtIHN0YXJ0O1xyXG59O1xyXG5cclxuZXhwb3J0cy5pc0luUmVjdCA9IGZ1bmN0aW9uKHgsIHksIHJlY3QpIHtcclxuICBpZiAoeCA+PSByZWN0LnggJiYgeCA8PSByZWN0LnggKyByZWN0LncgJiYgeSA+PSByZWN0LnkgJiYgeSA8PSByZWN0LnkgKyByZWN0LmgpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5leHBvcnRzLnJhbmRJbnQgPSBmdW5jdGlvbihtaW4sIG1heCkge1xyXG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG59O1xyXG5cclxuZXhwb3J0cy5yYW5kQXJyYXlFbGVtZW50ID0gZnVuY3Rpb24oYXJyYXkpIHtcclxuICB2YXIgaSA9IGV4cG9ydHMucmFuZEludCgwLCBhcnJheS5sZW5ndGggLSAxKTtcclxuICByZXR1cm4gYXJyYXlbaV07XHJcbn07XHJcblxyXG5leHBvcnRzLm1hcCA9IGZ1bmN0aW9uKG51bSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Miwgb3B0aW9ucykge1xyXG4gIHZhciBtYXBwZWQgPSAobnVtIC0gbWluMSkgLyAobWF4MSAtIG1pbjEpICogKG1heDIgLSBtaW4yKSArIG1pbjI7XHJcbiAgaWYgKCFvcHRpb25zKSByZXR1cm4gbWFwcGVkO1xyXG4gIGlmIChvcHRpb25zLnJvdW5kICYmIG9wdGlvbnMucm91bmQgPT09IHRydWUpIHtcclxuICAgIG1hcHBlZCA9IE1hdGgucm91bmQobWFwcGVkKTtcclxuICB9XHJcbiAgaWYgKG9wdGlvbnMuZmxvb3IgJiYgb3B0aW9ucy5mbG9vciA9PT0gdHJ1ZSkge1xyXG4gICAgbWFwcGVkID0gTWF0aC5mbG9vcihtYXBwZWQpO1xyXG4gIH1cclxuICBpZiAob3B0aW9ucy5jZWlsICYmIG9wdGlvbnMuY2VpbCA9PT0gdHJ1ZSkge1xyXG4gICAgbWFwcGVkID0gTWF0aC5jZWlsKG1hcHBlZCk7XHJcbiAgfVxyXG4gIGlmIChvcHRpb25zLmNsYW1wICYmIG9wdGlvbnMuY2xhbXAgPT09IHRydWUpIHtcclxuICAgIG1hcHBlZCA9IE1hdGgubWluKG1hcHBlZCwgbWF4Mik7XHJcbiAgICBtYXBwZWQgPSBNYXRoLm1heChtYXBwZWQsIG1pbjIpO1xyXG4gIH1cclxuICByZXR1cm4gbWFwcGVkO1xyXG59O1xyXG5cclxuZXhwb3J0cy5nZXRRdWVyeVBhcmFtZXRlcnMgPSBmdW5jdGlvbigpIHtcclxuICAvLyBDaGVjayBmb3IgcXVlcnkgc3RyaW5nXHJcbiAgdmFyIHFzID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcclxuICBpZiAocXMubGVuZ3RoIDw9IDEpIHJldHVybiB7fTtcclxuICAvLyBRdWVyeSBzdHJpbmcgZXhpc3RzLCBwYXJzZSBpdCBpbnRvIGEgcXVlcnkgb2JqZWN0XHJcbiAgcXMgPSBxcy5zdWJzdHJpbmcoMSk7IC8vIFJlbW92ZSB0aGUgXCI/XCIgZGVsaW1pdGVyXHJcbiAgdmFyIGtleVZhbFBhaXJzID0gcXMuc3BsaXQoXCImXCIpO1xyXG4gIHZhciBxdWVyeU9iamVjdCA9IHt9O1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5VmFsUGFpcnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBrZXlWYWwgPSBrZXlWYWxQYWlyc1tpXS5zcGxpdChcIj1cIik7XHJcbiAgICBpZiAoa2V5VmFsLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICB2YXIga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleVZhbFswXSk7XHJcbiAgICAgIHZhciB2YWwgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5VmFsWzFdKTtcclxuICAgICAgcXVlcnlPYmplY3Rba2V5XSA9IHZhbDtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHF1ZXJ5T2JqZWN0O1xyXG59O1xyXG5cclxuZXhwb3J0cy5jcmVhdGVRdWVyeVN0cmluZyA9IGZ1bmN0aW9uKHF1ZXJ5T2JqZWN0KSB7XHJcbiAgaWYgKHR5cGVvZiBxdWVyeU9iamVjdCAhPT0gXCJvYmplY3RcIikgcmV0dXJuIFwiXCI7XHJcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhxdWVyeU9iamVjdCk7XHJcbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcclxuICB2YXIgcXVlcnlTdHJpbmcgPSBcIj9cIjtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xyXG4gICAgdmFyIHZhbCA9IHF1ZXJ5T2JqZWN0W2tleV07XHJcbiAgICBxdWVyeVN0cmluZyArPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbCk7XHJcbiAgICBpZiAoaSAhPT0ga2V5cy5sZW5ndGggLSAxKSBxdWVyeVN0cmluZyArPSBcIiZcIjtcclxuICB9XHJcbiAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0cy53cmFwSW5kZXggPSBmdW5jdGlvbihpbmRleCwgbGVuZ3RoKSB7XHJcbiAgdmFyIHdyYXBwZWRJbmRleCA9IGluZGV4ICUgbGVuZ3RoO1xyXG4gIGlmICh3cmFwcGVkSW5kZXggPCAwKSB7XHJcbiAgICAvLyBJZiBuZWdhdGl2ZSwgZmxpcCB0aGUgaW5kZXggc28gdGhhdCAtMSBiZWNvbWVzIHRoZSBsYXN0IGl0ZW0gaW4gbGlzdFxyXG4gICAgd3JhcHBlZEluZGV4ID0gbGVuZ3RoICsgd3JhcHBlZEluZGV4O1xyXG4gIH1cclxuICByZXR1cm4gd3JhcHBlZEluZGV4O1xyXG59O1xyXG4iXSwicHJlRXhpc3RpbmdDb21tZW50IjoiLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW01dlpHVmZiVzlrZFd4bGN5OWljbTkzYzJWeUxYQmhZMnN2WDNCeVpXeDFaR1V1YW5NaUxDSnViMlJsWDIxdlpIVnNaWE12YW5NdFkyOXZhMmxsTDNOeVl5OXFjeTVqYjI5cmFXVXVhbk1pTENKdWIyUmxYMjF2WkhWc1pYTXZjRFV0WW1KdmVDMWhiR2xuYm1Wa0xYUmxlSFF2YkdsaUwySmliM2d0WVd4cFoyNWxaQzEwWlhoMExtcHpJaXdpYm05a1pWOXRiMlIxYkdWekwzQTFMV0ppYjNndFlXeHBaMjVsWkMxMFpYaDBMMnhwWWk5MWRHbHNjeTVxY3lJc0luTnlZeTlxY3k5b2IzWmxjaTF6Ykdsa1pYTm9iM2N1YW5NaUxDSnpjbU12YW5NdmFXNTBaWEpoWTNScGRtVXRiRzluYjNNdlltRnpaUzFzYjJkdkxYTnJaWFJqYUM1cWN5SXNJbk55WXk5cWN5OXBiblJsY21GamRHbDJaUzFzYjJkdmN5OWpiMjV1WldOMExYQnZhVzUwY3kxemEyVjBZMmd1YW5NaUxDSnpjbU12YW5NdmFXNTBaWEpoWTNScGRtVXRiRzluYjNNdloyVnVaWEpoZEc5eWN5OXViMmx6WlMxblpXNWxjbUYwYjNKekxtcHpJaXdpYzNKakwycHpMMmx1ZEdWeVlXTjBhWFpsTFd4dloyOXpMMmRsYm1WeVlYUnZjbk12YzJsdUxXZGxibVZ5WVhSdmNpNXFjeUlzSW5OeVl5OXFjeTlwYm5SbGNtRmpkR2wyWlMxc2IyZHZjeTlvWVd4bWRHOXVaUzFtYkdGemFHeHBaMmgwTFhkdmNtUXVhbk1pTENKemNtTXZhbk12YVc1MFpYSmhZM1JwZG1VdGJHOW5iM012Ym05cGMza3RkMjl5WkMxemEyVjBZMmd1YW5NaUxDSnpjbU12YW5NdmJXRnBiaTF1WVhZdWFuTWlMQ0p6Y21NdmFuTXZiV0ZwYmk1cWN5SXNJbk55WXk5cWN5OXdZV2RsTFd4dllXUmxjaTVxY3lJc0luTnlZeTlxY3k5d2FXTnJMWEpoYm1SdmJTMXphMlYwWTJndWFuTWlMQ0p6Y21NdmFuTXZjRzl5ZEdadmJHbHZMV1pwYkhSbGNpNXFjeUlzSW5OeVl5OXFjeTkwYUhWdFltNWhhV3d0YzJ4cFpHVnphRzkzTDNOc2FXUmxjMmh2ZHkxdGIyUmhiQzVxY3lJc0luTnlZeTlxY3k5MGFIVnRZbTVoYVd3dGMyeHBaR1Z6YUc5M0wzTnNhV1JsYzJodmR5NXFjeUlzSW5OeVl5OXFjeTkwYUhWdFltNWhhV3d0YzJ4cFpHVnphRzkzTDNSb2RXMWlibUZwYkMxemJHbGtaWEl1YW5NaUxDSnpjbU12YW5NdmRYUnBiR2wwYVdWekxtcHpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTzBGRFFVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkRja3RCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOcVdrRTdRVUZEUVR0QlFVTkJPenRCUTBaQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRM1pKUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOMlRFRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJReTlHUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVU42UjBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGRGVrUkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOb1NVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVU4wUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUTNKRVFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOeVJVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVTjJSRUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CT3p0QlEzaEVRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVU53VDBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkRiRXRCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkRNMGxCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVU42VDBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJJaXdpWm1sc1pTSTZJbWRsYm1WeVlYUmxaQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lJb1puVnVZM1JwYjI0Z1pTaDBMRzRzY2lsN1puVnVZM1JwYjI0Z2N5aHZMSFVwZTJsbUtDRnVXMjlkS1h0cFppZ2hkRnR2WFNsN2RtRnlJR0U5ZEhsd1pXOW1JSEpsY1hWcGNtVTlQVndpWm5WdVkzUnBiMjVjSWlZbWNtVnhkV2x5WlR0cFppZ2hkU1ltWVNseVpYUjFjbTRnWVNodkxDRXdLVHRwWmlocEtYSmxkSFZ5YmlCcEtHOHNJVEFwTzNaaGNpQm1QVzVsZHlCRmNuSnZjaWhjSWtOaGJtNXZkQ0JtYVc1a0lHMXZaSFZzWlNBblhDSXJieXRjSWlkY0lpazdkR2h5YjNjZ1ppNWpiMlJsUFZ3aVRVOUVWVXhGWDA1UFZGOUdUMVZPUkZ3aUxHWjlkbUZ5SUd3OWJsdHZYVDE3Wlhod2IzSjBjenA3ZlgwN2RGdHZYVnN3WFM1allXeHNLR3d1Wlhod2IzSjBjeXhtZFc1amRHbHZiaWhsS1h0MllYSWdiajEwVzI5ZFd6RmRXMlZkTzNKbGRIVnliaUJ6S0c0L2JqcGxLWDBzYkN4c0xtVjRjRzl5ZEhNc1pTeDBMRzRzY2lsOWNtVjBkWEp1SUc1YmIxMHVaWGh3YjNKMGMzMTJZWElnYVQxMGVYQmxiMllnY21WeGRXbHlaVDA5WENKbWRXNWpkR2x2Ymx3aUppWnlaWEYxYVhKbE8yWnZjaWgyWVhJZ2J6MHdPMjg4Y2k1c1pXNW5kR2c3YnlzcktYTW9jbHR2WFNrN2NtVjBkWEp1SUhOOUtTSXNJaThxSVZ4dUlDb2dTbUYyWVZOamNtbHdkQ0JEYjI5cmFXVWdkakl1TVM0MFhHNGdLaUJvZEhSd2N6b3ZMMmRwZEdoMVlpNWpiMjB2YW5NdFkyOXZhMmxsTDJwekxXTnZiMnRwWlZ4dUlDcGNiaUFxSUVOdmNIbHlhV2RvZENBeU1EQTJMQ0F5TURFMUlFdHNZWFZ6SUVoaGNuUnNJQ1lnUm1GbmJtVnlJRUp5WVdOclhHNGdLaUJTWld4bFlYTmxaQ0IxYm1SbGNpQjBhR1VnVFVsVUlHeHBZMlZ1YzJWY2JpQXFMMXh1T3lobWRXNWpkR2x2YmlBb1ptRmpkRzl5ZVNrZ2UxeHVYSFIyWVhJZ2NtVm5hWE4wWlhKbFpFbHVUVzlrZFd4bFRHOWhaR1Z5SUQwZ1ptRnNjMlU3WEc1Y2RHbG1JQ2gwZVhCbGIyWWdaR1ZtYVc1bElEMDlQU0FuWm5WdVkzUnBiMjRuSUNZbUlHUmxabWx1WlM1aGJXUXBJSHRjYmx4MFhIUmtaV1pwYm1Vb1ptRmpkRzl5ZVNrN1hHNWNkRngwY21WbmFYTjBaWEpsWkVsdVRXOWtkV3hsVEc5aFpHVnlJRDBnZEhKMVpUdGNibHgwZlZ4dVhIUnBaaUFvZEhsd1pXOW1JR1Y0Y0c5eWRITWdQVDA5SUNkdlltcGxZM1FuS1NCN1hHNWNkRngwYlc5a2RXeGxMbVY0Y0c5eWRITWdQU0JtWVdOMGIzSjVLQ2s3WEc1Y2RGeDBjbVZuYVhOMFpYSmxaRWx1VFc5a2RXeGxURzloWkdWeUlEMGdkSEoxWlR0Y2JseDBmVnh1WEhScFppQW9JWEpsWjJsemRHVnlaV1JKYmsxdlpIVnNaVXh2WVdSbGNpa2dlMXh1WEhSY2RIWmhjaUJQYkdSRGIyOXJhV1Z6SUQwZ2QybHVaRzkzTGtOdmIydHBaWE03WEc1Y2RGeDBkbUZ5SUdGd2FTQTlJSGRwYm1SdmR5NURiMjlyYVdWeklEMGdabUZqZEc5eWVTZ3BPMXh1WEhSY2RHRndhUzV1YjBOdmJtWnNhV04wSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1WEhSY2RGeDBkMmx1Wkc5M0xrTnZiMnRwWlhNZ1BTQlBiR1JEYjI5cmFXVnpPMXh1WEhSY2RGeDBjbVYwZFhKdUlHRndhVHRjYmx4MFhIUjlPMXh1WEhSOVhHNTlLR1oxYm1OMGFXOXVJQ2dwSUh0Y2JseDBablZ1WTNScGIyNGdaWGgwWlc1a0lDZ3BJSHRjYmx4MFhIUjJZWElnYVNBOUlEQTdYRzVjZEZ4MGRtRnlJSEpsYzNWc2RDQTlJSHQ5TzF4dVhIUmNkR1p2Y2lBb095QnBJRHdnWVhKbmRXMWxiblJ6TG14bGJtZDBhRHNnYVNzcktTQjdYRzVjZEZ4MFhIUjJZWElnWVhSMGNtbGlkWFJsY3lBOUlHRnlaM1Z0Wlc1MGMxc2dhU0JkTzF4dVhIUmNkRngwWm05eUlDaDJZWElnYTJWNUlHbHVJR0YwZEhKcFluVjBaWE1wSUh0Y2JseDBYSFJjZEZ4MGNtVnpkV3gwVzJ0bGVWMGdQU0JoZEhSeWFXSjFkR1Z6VzJ0bGVWMDdYRzVjZEZ4MFhIUjlYRzVjZEZ4MGZWeHVYSFJjZEhKbGRIVnliaUJ5WlhOMWJIUTdYRzVjZEgxY2JseHVYSFJtZFc1amRHbHZiaUJwYm1sMElDaGpiMjUyWlhKMFpYSXBJSHRjYmx4MFhIUm1kVzVqZEdsdmJpQmhjR2tnS0d0bGVTd2dkbUZzZFdVc0lHRjBkSEpwWW5WMFpYTXBJSHRjYmx4MFhIUmNkSFpoY2lCeVpYTjFiSFE3WEc1Y2RGeDBYSFJwWmlBb2RIbHdaVzltSUdSdlkzVnRaVzUwSUQwOVBTQW5kVzVrWldacGJtVmtKeWtnZTF4dVhIUmNkRngwWEhSeVpYUjFjbTQ3WEc1Y2RGeDBYSFI5WEc1Y2JseDBYSFJjZEM4dklGZHlhWFJsWEc1Y2JseDBYSFJjZEdsbUlDaGhjbWQxYldWdWRITXViR1Z1WjNSb0lENGdNU2tnZTF4dVhIUmNkRngwWEhSaGRIUnlhV0oxZEdWeklEMGdaWGgwWlc1a0tIdGNibHgwWEhSY2RGeDBYSFJ3WVhSb09pQW5MeWRjYmx4MFhIUmNkRngwZlN3Z1lYQnBMbVJsWm1GMWJIUnpMQ0JoZEhSeWFXSjFkR1Z6S1R0Y2JseHVYSFJjZEZ4MFhIUnBaaUFvZEhsd1pXOW1JR0YwZEhKcFluVjBaWE11Wlhod2FYSmxjeUE5UFQwZ0oyNTFiV0psY2ljcElIdGNibHgwWEhSY2RGeDBYSFIyWVhJZ1pYaHdhWEpsY3lBOUlHNWxkeUJFWVhSbEtDazdYRzVjZEZ4MFhIUmNkRngwWlhod2FYSmxjeTV6WlhSTmFXeHNhWE5sWTI5dVpITW9aWGh3YVhKbGN5NW5aWFJOYVd4c2FYTmxZMjl1WkhNb0tTQXJJR0YwZEhKcFluVjBaWE11Wlhod2FYSmxjeUFxSURnMk5HVXJOU2s3WEc1Y2RGeDBYSFJjZEZ4MFlYUjBjbWxpZFhSbGN5NWxlSEJwY21WeklEMGdaWGh3YVhKbGN6dGNibHgwWEhSY2RGeDBmVnh1WEc1Y2RGeDBYSFJjZEM4dklGZGxKM0psSUhWemFXNW5JRndpWlhod2FYSmxjMXdpSUdKbFkyRjFjMlVnWENKdFlYZ3RZV2RsWENJZ2FYTWdibTkwSUhOMWNIQnZjblJsWkNCaWVTQkpSVnh1WEhSY2RGeDBYSFJoZEhSeWFXSjFkR1Z6TG1WNGNHbHlaWE1nUFNCaGRIUnlhV0oxZEdWekxtVjRjR2x5WlhNZ1B5QmhkSFJ5YVdKMWRHVnpMbVY0Y0dseVpYTXVkRzlWVkVOVGRISnBibWNvS1NBNklDY25PMXh1WEc1Y2RGeDBYSFJjZEhSeWVTQjdYRzVjZEZ4MFhIUmNkRngwY21WemRXeDBJRDBnU2xOUFRpNXpkSEpwYm1kcFpua29kbUZzZFdVcE8xeHVYSFJjZEZ4MFhIUmNkR2xtSUNndlhsdGNYSHRjWEZ0ZEx5NTBaWE4wS0hKbGMzVnNkQ2twSUh0Y2JseDBYSFJjZEZ4MFhIUmNkSFpoYkhWbElEMGdjbVZ6ZFd4ME8xeHVYSFJjZEZ4MFhIUmNkSDFjYmx4MFhIUmNkRngwZlNCallYUmphQ0FvWlNrZ2UzMWNibHh1WEhSY2RGeDBYSFJwWmlBb0lXTnZiblpsY25SbGNpNTNjbWwwWlNrZ2UxeHVYSFJjZEZ4MFhIUmNkSFpoYkhWbElEMGdaVzVqYjJSbFZWSkpRMjl0Y0c5dVpXNTBLRk4wY21sdVp5aDJZV3gxWlNrcFhHNWNkRngwWEhSY2RGeDBYSFF1Y21Wd2JHRmpaU2d2SlNneU0zd3lOSHd5Tm53eVFud3pRWHd6UTN3elJYd3pSSHd5Um53elJudzBNSHcxUW53MVJIdzFSWHcyTUh3M1FudzNSSHczUXlrdlp5d2daR1ZqYjJSbFZWSkpRMjl0Y0c5dVpXNTBLVHRjYmx4MFhIUmNkRngwZlNCbGJITmxJSHRjYmx4MFhIUmNkRngwWEhSMllXeDFaU0E5SUdOdmJuWmxjblJsY2k1M2NtbDBaU2gyWVd4MVpTd2dhMlY1S1R0Y2JseDBYSFJjZEZ4MGZWeHVYRzVjZEZ4MFhIUmNkR3RsZVNBOUlHVnVZMjlrWlZWU1NVTnZiWEJ2Ym1WdWRDaFRkSEpwYm1jb2EyVjVLU2s3WEc1Y2RGeDBYSFJjZEd0bGVTQTlJR3RsZVM1eVpYQnNZV05sS0M4bEtESXpmREkwZkRJMmZESkNmRFZGZkRZd2ZEZERLUzluTENCa1pXTnZaR1ZWVWtsRGIyMXdiMjVsYm5RcE8xeHVYSFJjZEZ4MFhIUnJaWGtnUFNCclpYa3VjbVZ3YkdGalpTZ3ZXMXhjS0Z4Y0tWMHZaeXdnWlhOallYQmxLVHRjYmx4dVhIUmNkRngwWEhSMllYSWdjM1J5YVc1bmFXWnBaV1JCZEhSeWFXSjFkR1Z6SUQwZ0p5YzdYRzVjYmx4MFhIUmNkRngwWm05eUlDaDJZWElnWVhSMGNtbGlkWFJsVG1GdFpTQnBiaUJoZEhSeWFXSjFkR1Z6S1NCN1hHNWNkRngwWEhSY2RGeDBhV1lnS0NGaGRIUnlhV0oxZEdWelcyRjBkSEpwWW5WMFpVNWhiV1ZkS1NCN1hHNWNkRngwWEhSY2RGeDBYSFJqYjI1MGFXNTFaVHRjYmx4MFhIUmNkRngwWEhSOVhHNWNkRngwWEhSY2RGeDBjM1J5YVc1bmFXWnBaV1JCZEhSeWFXSjFkR1Z6SUNzOUlDYzdJQ2NnS3lCaGRIUnlhV0oxZEdWT1lXMWxPMXh1WEhSY2RGeDBYSFJjZEdsbUlDaGhkSFJ5YVdKMWRHVnpXMkYwZEhKcFluVjBaVTVoYldWZElEMDlQU0IwY25WbEtTQjdYRzVjZEZ4MFhIUmNkRngwWEhSamIyNTBhVzUxWlR0Y2JseDBYSFJjZEZ4MFhIUjlYRzVjZEZ4MFhIUmNkRngwYzNSeWFXNW5hV1pwWldSQmRIUnlhV0oxZEdWeklDczlJQ2M5SnlBcklHRjBkSEpwWW5WMFpYTmJZWFIwY21saWRYUmxUbUZ0WlYwN1hHNWNkRngwWEhSY2RIMWNibHgwWEhSY2RGeDBjbVYwZFhKdUlDaGtiMk4xYldWdWRDNWpiMjlyYVdVZ1BTQnJaWGtnS3lBblBTY2dLeUIyWVd4MVpTQXJJSE4wY21sdVoybG1hV1ZrUVhSMGNtbGlkWFJsY3lrN1hHNWNkRngwWEhSOVhHNWNibHgwWEhSY2RDOHZJRkpsWVdSY2JseHVYSFJjZEZ4MGFXWWdLQ0ZyWlhrcElIdGNibHgwWEhSY2RGeDBjbVZ6ZFd4MElEMGdlMzA3WEc1Y2RGeDBYSFI5WEc1Y2JseDBYSFJjZEM4dklGUnZJSEJ5WlhabGJuUWdkR2hsSUdadmNpQnNiMjl3SUdsdUlIUm9aU0JtYVhKemRDQndiR0ZqWlNCaGMzTnBaMjRnWVc0Z1pXMXdkSGtnWVhKeVlYbGNibHgwWEhSY2RDOHZJR2x1SUdOaGMyVWdkR2hsY21VZ1lYSmxJRzV2SUdOdmIydHBaWE1nWVhRZ1lXeHNMaUJCYkhOdklIQnlaWFpsYm5SeklHOWtaQ0J5WlhOMWJIUWdkMmhsYmx4dVhIUmNkRngwTHk4Z1kyRnNiR2x1WnlCY0ltZGxkQ2dwWENKY2JseDBYSFJjZEhaaGNpQmpiMjlyYVdWeklEMGdaRzlqZFcxbGJuUXVZMjl2YTJsbElEOGdaRzlqZFcxbGJuUXVZMjl2YTJsbExuTndiR2wwS0NjN0lDY3BJRG9nVzEwN1hHNWNkRngwWEhSMllYSWdjbVJsWTI5a1pTQTlJQzhvSlZzd0xUbEJMVnBkZXpKOUtTc3ZaenRjYmx4MFhIUmNkSFpoY2lCcElEMGdNRHRjYmx4dVhIUmNkRngwWm05eUlDZzdJR2tnUENCamIyOXJhV1Z6TG14bGJtZDBhRHNnYVNzcktTQjdYRzVjZEZ4MFhIUmNkSFpoY2lCd1lYSjBjeUE5SUdOdmIydHBaWE5iYVYwdWMzQnNhWFFvSnowbktUdGNibHgwWEhSY2RGeDBkbUZ5SUdOdmIydHBaU0E5SUhCaGNuUnpMbk5zYVdObEtERXBMbXB2YVc0b0p6MG5LVHRjYmx4dVhIUmNkRngwWEhScFppQW9ZMjl2YTJsbExtTm9ZWEpCZENnd0tTQTlQVDBnSjF3aUp5a2dlMXh1WEhSY2RGeDBYSFJjZEdOdmIydHBaU0E5SUdOdmIydHBaUzV6YkdsalpTZ3hMQ0F0TVNrN1hHNWNkRngwWEhSY2RIMWNibHh1WEhSY2RGeDBYSFIwY25rZ2UxeHVYSFJjZEZ4MFhIUmNkSFpoY2lCdVlXMWxJRDBnY0dGeWRITmJNRjB1Y21Wd2JHRmpaU2h5WkdWamIyUmxMQ0JrWldOdlpHVlZVa2xEYjIxd2IyNWxiblFwTzF4dVhIUmNkRngwWEhSY2RHTnZiMnRwWlNBOUlHTnZiblpsY25SbGNpNXlaV0ZrSUQ5Y2JseDBYSFJjZEZ4MFhIUmNkR052Ym5abGNuUmxjaTV5WldGa0tHTnZiMnRwWlN3Z2JtRnRaU2tnT2lCamIyNTJaWEowWlhJb1kyOXZhMmxsTENCdVlXMWxLU0I4ZkZ4dVhIUmNkRngwWEhSY2RGeDBZMjl2YTJsbExuSmxjR3hoWTJVb2NtUmxZMjlrWlN3Z1pHVmpiMlJsVlZKSlEyOXRjRzl1Wlc1MEtUdGNibHh1WEhSY2RGeDBYSFJjZEdsbUlDaDBhR2x6TG1wemIyNHBJSHRjYmx4MFhIUmNkRngwWEhSY2RIUnllU0I3WEc1Y2RGeDBYSFJjZEZ4MFhIUmNkR052YjJ0cFpTQTlJRXBUVDA0dWNHRnljMlVvWTI5dmEybGxLVHRjYmx4MFhIUmNkRngwWEhSY2RIMGdZMkYwWTJnZ0tHVXBJSHQ5WEc1Y2RGeDBYSFJjZEZ4MGZWeHVYRzVjZEZ4MFhIUmNkRngwYVdZZ0tHdGxlU0E5UFQwZ2JtRnRaU2tnZTF4dVhIUmNkRngwWEhSY2RGeDBjbVZ6ZFd4MElEMGdZMjl2YTJsbE8xeHVYSFJjZEZ4MFhIUmNkRngwWW5KbFlXczdYRzVjZEZ4MFhIUmNkRngwZlZ4dVhHNWNkRngwWEhSY2RGeDBhV1lnS0NGclpYa3BJSHRjYmx4MFhIUmNkRngwWEhSY2RISmxjM1ZzZEZ0dVlXMWxYU0E5SUdOdmIydHBaVHRjYmx4MFhIUmNkRngwWEhSOVhHNWNkRngwWEhSY2RIMGdZMkYwWTJnZ0tHVXBJSHQ5WEc1Y2RGeDBYSFI5WEc1Y2JseDBYSFJjZEhKbGRIVnliaUJ5WlhOMWJIUTdYRzVjZEZ4MGZWeHVYRzVjZEZ4MFlYQnBMbk5sZENBOUlHRndhVHRjYmx4MFhIUmhjR2t1WjJWMElEMGdablZ1WTNScGIyNGdLR3RsZVNrZ2UxeHVYSFJjZEZ4MGNtVjBkWEp1SUdGd2FTNWpZV3hzS0dGd2FTd2dhMlY1S1R0Y2JseDBYSFI5TzF4dVhIUmNkR0Z3YVM1blpYUktVMDlPSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1WEhSY2RGeDBjbVYwZFhKdUlHRndhUzVoY0hCc2VTaDdYRzVjZEZ4MFhIUmNkR3B6YjI0NklIUnlkV1ZjYmx4MFhIUmNkSDBzSUZ0ZExuTnNhV05sTG1OaGJHd29ZWEpuZFcxbGJuUnpLU2s3WEc1Y2RGeDBmVHRjYmx4MFhIUmhjR2t1WkdWbVlYVnNkSE1nUFNCN2ZUdGNibHh1WEhSY2RHRndhUzV5WlcxdmRtVWdQU0JtZFc1amRHbHZiaUFvYTJWNUxDQmhkSFJ5YVdKMWRHVnpLU0I3WEc1Y2RGeDBYSFJoY0drb2EyVjVMQ0FuSnl3Z1pYaDBaVzVrS0dGMGRISnBZblYwWlhNc0lIdGNibHgwWEhSY2RGeDBaWGh3YVhKbGN6b2dMVEZjYmx4MFhIUmNkSDBwS1R0Y2JseDBYSFI5TzF4dVhHNWNkRngwWVhCcExuZHBkR2hEYjI1MlpYSjBaWElnUFNCcGJtbDBPMXh1WEc1Y2RGeDBjbVYwZFhKdUlHRndhVHRjYmx4MGZWeHVYRzVjZEhKbGRIVnliaUJwYm1sMEtHWjFibU4wYVc5dUlDZ3BJSHQ5S1R0Y2JuMHBLVHRjYmlJc0luWmhjaUIxZEdsc2N5QTlJSEpsY1hWcGNtVW9YQ0l1TDNWMGFXeHpMbXB6WENJcE8xeHlYRzVjY2x4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCQ1ltOTRRV3hwWjI1bFpGUmxlSFE3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUTNKbFlYUmxjeUJoSUc1bGR5QkNZbTk0UVd4cFoyNWxaRlJsZUhRZ2IySnFaV04wSUMwZ1lTQjBaWGgwSUc5aWFtVmpkQ0IwYUdGMElHTmhiaUJpWlNCa2NtRjNiaUIzYVhSb1hISmNiaUFxSUdGdVkyaHZjaUJ3YjJsdWRITWdZbUZ6WldRZ2IyNGdZU0IwYVdkb2RDQmliM1Z1WkdsdVp5QmliM2dnWVhKdmRXNWtJSFJvWlNCMFpYaDBMbHh5WEc0Z0tpQkFZMjl1YzNSeWRXTjBiM0pjY2x4dUlDb2dRSEJoY21GdElIdHZZbXBsWTNSOUlHWnZiblFnTFNCd05TNUdiMjUwSUc5aWFtVmpkRnh5WEc0Z0tpQkFjR0Z5WVcwZ2UzTjBjbWx1WjMwZ2RHVjRkQ0F0SUZOMGNtbHVaeUIwYnlCa2FYTndiR0Y1WEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQmJabTl1ZEZOcGVtVTlNVEpkSUMwZ1JtOXVkQ0J6YVhwbElIUnZJSFZ6WlNCbWIzSWdjM1J5YVc1blhISmNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0JiZUQwd1hTQXRJRWx1YVhScFlXd2dlQ0JzYjJOaGRHbHZibHh5WEc0Z0tpQkFjR0Z5WVcwZ2UyNTFiV0psY24wZ1czazlNRjBnTFNCSmJtbDBhV0ZzSUhrZ2JHOWpZWFJwYjI1Y2NseHVJQ29nUUhCaGNtRnRJSHR2WW1wbFkzUjlJRnR3U1c1emRHRnVZMlU5ZDJsdVpHOTNYU0F0SUZKbFptVnlaVzVqWlNCMGJ5QndOU0JwYm5OMFlXNWpaU3dnYkdWaGRtVWdZbXhoYm1zZ2FXWmNjbHh1SUNvZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lITnJaWFJqYUNCcGN5Qm5iRzlpWVd4Y2NseHVJQ29nUUdWNFlXMXdiR1ZjY2x4dUlDb2dkbUZ5SUdadmJuUXNJR0ppYjNoVVpYaDBPMXh5WEc0Z0tpQm1kVzVqZEdsdmJpQndjbVZzYjJGa0tDa2dlMXh5WEc0Z0tpQWdJQ0FnWm05dWRDQTlJR3h2WVdSR2IyNTBLRndpTGk5aGMzTmxkSE12VW1WbmRXeGhjaTUwZEdaY0lpazdYSEpjYmlBcUlIMWNjbHh1SUNvZ1puVnVZM1JwYjI0Z2MyVjBkWEFvS1NCN1hISmNiaUFxSUNBZ0lDQmpjbVZoZEdWRFlXNTJZWE1vTkRBd0xDQTJNREFwTzF4eVhHNGdLaUFnSUNBZ1ltRmphMmR5YjNWdVpDZ3dLVHRjY2x4dUlDb2dJQ0FnSUZ4eVhHNGdLaUFnSUNBZ1ltSnZlRlJsZUhRZ1BTQnVaWGNnUW1KdmVFRnNhV2R1WldSVVpYaDBLR1p2Ym5Rc0lGd2lTR1Y1SVZ3aUxDQXpNQ2s3SUNBZ0lGeHlYRzRnS2lBZ0lDQWdZbUp2ZUZSbGVIUXVjMlYwVW05MFlYUnBiMjRvVUVrZ0x5QTBLVHRjY2x4dUlDb2dJQ0FnSUdKaWIzaFVaWGgwTG5ObGRFRnVZMmh2Y2loQ1ltOTRRV3hwWjI1bFpGUmxlSFF1UVV4SlIwNHVRazlZWDBORlRsUkZVaXdnWEhKY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1FtSnZlRUZzYVdkdVpXUlVaWGgwTGtKQlUwVk1TVTVGTGtKUFdGOURSVTVVUlZJcE8xeHlYRzRnS2lBZ0lDQWdYSEpjYmlBcUlDQWdJQ0JtYVd4c0tGd2lJekF3UVRoRlFWd2lLVHRjY2x4dUlDb2dJQ0FnSUc1dlUzUnliMnRsS0NrN1hISmNiaUFxSUNBZ0lDQmlZbTk0VkdWNGRDNWtjbUYzS0hkcFpIUm9JQzhnTWl3Z2FHVnBaMmgwSUM4Z01pazdYSEpjYmlBcUlIMWNjbHh1SUNvdlhISmNibVoxYm1OMGFXOXVJRUppYjNoQmJHbG5ibVZrVkdWNGRDaG1iMjUwTENCMFpYaDBMQ0JtYjI1MFUybDZaU3dnZUN3Z2VTd2djRWx1YzNSaGJtTmxLU0I3WEhKY2JpQWdJQ0IwYUdsekxsOW1iMjUwSUQwZ1ptOXVkRHRjY2x4dUlDQWdJSFJvYVhNdVgzUmxlSFFnUFNCMFpYaDBPMXh5WEc0Z0lDQWdkR2hwY3k1ZmVDQTlJSFYwYVd4ekxtUmxabUYxYkhRb2VDd2dNQ2s3WEhKY2JpQWdJQ0IwYUdsekxsOTVJRDBnZFhScGJITXVaR1ZtWVhWc2RDaDVMQ0F3S1R0Y2NseHVJQ0FnSUhSb2FYTXVYMlp2Ym5SVGFYcGxJRDBnZFhScGJITXVaR1ZtWVhWc2RDaG1iMjUwVTJsNlpTd2dNVElwTzF4eVhHNGdJQ0FnZEdocGN5NWZjQ0E5SUhWMGFXeHpMbVJsWm1GMWJIUW9jRWx1YzNSaGJtTmxMQ0IzYVc1a2IzY3BPMXh5WEc0Z0lDQWdkR2hwY3k1ZmNtOTBZWFJwYjI0Z1BTQXdPMXh5WEc0Z0lDQWdkR2hwY3k1ZmFFRnNhV2R1SUQwZ1FtSnZlRUZzYVdkdVpXUlVaWGgwTGtGTVNVZE9Ma0pQV0Y5RFJVNVVSVkk3WEhKY2JpQWdJQ0IwYUdsekxsOTJRV3hwWjI0Z1BTQkNZbTk0UVd4cFoyNWxaRlJsZUhRdVFrRlRSVXhKVGtVdVFrOVlYME5GVGxSRlVqdGNjbHh1SUNBZ0lIUm9hWE11WDJOaGJHTjFiR0YwWlUxbGRISnBZM01vZEhKMVpTazdYSEpjYm4xY2NseHVYSEpjYmk4cUtseHlYRzRnS2lCV1pYSjBhV05oYkNCaGJHbG5ibTFsYm5RZ2RtRnNkV1Z6WEhKY2JpQXFJRUJ3ZFdKc2FXTmNjbHh1SUNvZ1FITjBZWFJwWTF4eVhHNGdLaUJBY21WaFpHOXViSGxjY2x4dUlDb2dRR1Z1ZFcwZ2UzTjBjbWx1WjMxY2NseHVJQ292WEhKY2JrSmliM2hCYkdsbmJtVmtWR1Y0ZEM1QlRFbEhUaUE5SUh0Y2NseHVJQ0FnSUM4cUtpQkVjbUYzSUdaeWIyMGdkR2hsSUd4bFpuUWdiMllnZEdobElHSmliM2dnS2k5Y2NseHVJQ0FnSUVKUFdGOU1SVVpVT2lCY0ltSnZlRjlzWldaMFhDSXNYSEpjYmlBZ0lDQXZLaW9nUkhKaGR5Qm1jbTl0SUhSb1pTQmpaVzUwWlhJZ2IyWWdkR2hsSUdKaWIzZ2dLaTljY2x4dUlDQWdJRUpQV0Y5RFJVNVVSVkk2SUZ3aVltOTRYMk5sYm5SbGNsd2lMRnh5WEc0Z0lDQWdMeW9xSUVSeVlYY2dabkp2YlNCMGFHVWdjbWxuYUhRZ2IyWWdkR2hsSUdKaWIzZ2dLaTljY2x4dUlDQWdJRUpQV0Y5U1NVZElWRG9nWENKaWIzaGZjbWxuYUhSY0lseHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUVKaGMyVnNhVzVsSUdGc2FXZHViV1Z1ZENCMllXeDFaWE5jY2x4dUlDb2dRSEIxWW14cFkxeHlYRzRnS2lCQWMzUmhkR2xqWEhKY2JpQXFJRUJ5WldGa2IyNXNlVnh5WEc0Z0tpQkFaVzUxYlNCN2MzUnlhVzVuZlZ4eVhHNGdLaTljY2x4dVFtSnZlRUZzYVdkdVpXUlVaWGgwTGtKQlUwVk1TVTVGSUQwZ2UxeHlYRzRnSUNBZ0x5b3FJRVJ5WVhjZ1puSnZiU0IwYUdVZ2RHOXdJRzltSUhSb1pTQmlZbTk0SUNvdlhISmNiaUFnSUNCQ1QxaGZWRTlRT2lCY0ltSnZlRjkwYjNCY0lpeGNjbHh1SUNBZ0lDOHFLaUJFY21GM0lHWnliMjBnZEdobElHTmxiblJsY2lCdlppQjBhR1VnWW1KdmVDQXFMMXh5WEc0Z0lDQWdRazlZWDBORlRsUkZVam9nWENKaWIzaGZZMlZ1ZEdWeVhDSXNYSEpjYmlBZ0lDQXZLaW9nUkhKaGR5Qm1jbTl0SUhSb1pTQmliM1IwYjIwZ2IyWWdkR2hsSUdKaWIzZ2dLaTljY2x4dUlDQWdJRUpQV0Y5Q1QxUlVUMDA2SUZ3aVltOTRYMkp2ZEhSdmJWd2lMRnh5WEc0Z0lDQWdMeW9xSUZ4eVhHNGdJQ0FnSUNvZ1JISmhkeUJtY205dElHaGhiR1lnZEdobElHaGxhV2RvZENCdlppQjBhR1VnWm05dWRDNGdVM0JsWTJsbWFXTmhiR3g1SUhSb1pTQm9aV2xuYUhRZ2FYTmNjbHh1SUNBZ0lDQXFJR05oYkdOMWJHRjBaV1FnWVhNNklHRnpZMlZ1ZENBcklHUmxjMk5sYm5RdVhISmNiaUFnSUNBZ0tpOWNjbHh1SUNBZ0lFWlBUbFJmUTBWT1ZFVlNPaUJjSW1admJuUmZZMlZ1ZEdWeVhDSXNYSEpjYmlBZ0lDQXZLaW9nUkhKaGR5Qm1jbTl0SUhSb1pTQjBhR1VnYm05eWJXRnNJR1p2Ym5RZ1ltRnpaV3hwYm1VZ0tpOWNjbHh1SUNBZ0lFRk1VRWhCUWtWVVNVTTZJRndpWVd4d2FHRmlaWFJwWTF3aVhISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nVTJWMElHTjFjbkpsYm5RZ2RHVjRkRnh5WEc0Z0tpQkFjSFZpYkdsalhISmNiaUFxSUVCd1lYSmhiU0I3YzNSeWFXNW5mU0J6ZEhKcGJtY2dMU0JVWlhoMElITjBjbWx1WnlCMGJ5QmthWE53YkdGNVhISmNiaUFxSUVCeVpYUjFjbTV6SUh0MGFHbHpmU0JWYzJWbWRXd2dabTl5SUdOb1lXbHVhVzVuWEhKY2JpQXFMMXh5WEc1Q1ltOTRRV3hwWjI1bFpGUmxlSFF1Y0hKdmRHOTBlWEJsTG5ObGRGUmxlSFFnUFNCbWRXNWpkR2x2YmloemRISnBibWNwSUh0Y2NseHVJQ0FnSUhSb2FYTXVYM1JsZUhRZ1BTQnpkSEpwYm1jN1hISmNiaUFnSUNCMGFHbHpMbDlqWVd4amRXeGhkR1ZOWlhSeWFXTnpLR1poYkhObEtUdGNjbHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlGTmxkQ0IwYUdVZ2RHVjRkQ0J3YjNOcGRHbHZibHh5WEc0Z0tpQkFjSFZpYkdsalhISmNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0I0SUMwZ1dDQndiM05wZEdsdmJseHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnZUNBdElGa2djRzl6YVhScGIyNWNjbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UzUm9hWE45SUZWelpXWjFiQ0JtYjNJZ1kyaGhhVzVwYm1kY2NseHVJQ292WEhKY2JrSmliM2hCYkdsbmJtVmtWR1Y0ZEM1d2NtOTBiM1I1Y0dVdWMyVjBVRzl6YVhScGIyNGdQU0JtZFc1amRHbHZiaWg0TENCNUtTQjdYSEpjYmlBZ0lDQjBhR2x6TGw5NElEMGdkWFJwYkhNdVpHVm1ZWFZzZENoNExDQjBhR2x6TGw5NEtUdGNjbHh1SUNBZ0lIUm9hWE11WDNrZ1BTQjFkR2xzY3k1a1pXWmhkV3gwS0hrc0lIUm9hWE11WDNrcE8xeHlYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTTdYSEpjYm4wN1hISmNibHh5WEc0dktpcGNjbHh1SUNvZ1IyVjBJSFJvWlNCMFpYaDBJSEJ2YzJsMGFXOXVYSEpjYmlBcUlFQndkV0pzYVdOY2NseHVJQ29nUUhKbGRIVnliaUI3YjJKcVpXTjBmU0JTWlhSMWNtNXpJR0Z1SUc5aWFtVmpkQ0IzYVhSb0lIQnliM0JsY25ScFpYTTZJSGdzSUhsY2NseHVJQ292WEhKY2JrSmliM2hCYkdsbmJtVmtWR1Y0ZEM1d2NtOTBiM1I1Y0dVdVoyVjBVRzl6YVhScGIyNGdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0FnSUhKbGRIVnliaUI3WEhKY2JpQWdJQ0FnSUNBZ2VEb2dkR2hwY3k1ZmVDeGNjbHh1SUNBZ0lDQWdJQ0I1T2lCMGFHbHpMbDk1WEhKY2JpQWdJQ0I5TzF4eVhHNTlPMXh5WEc1Y2NseHVMeW9xWEhKY2JpQXFJRk5sZENCamRYSnlaVzUwSUhSbGVIUWdjMmw2WlZ4eVhHNGdLaUJBY0hWaWJHbGpYSEpjYmlBcUlFQndZWEpoYlNCN2JuVnRZbVZ5ZlNCbWIyNTBVMmw2WlNCVVpYaDBJSE5wZW1WY2NseHVJQ29nUUhKbGRIVnlibk1nZTNSb2FYTjlJRlZ6WldaMWJDQm1iM0lnWTJoaGFXNXBibWRjY2x4dUlDb3ZYSEpjYmtKaWIzaEJiR2xuYm1Wa1ZHVjRkQzV3Y205MGIzUjVjR1V1YzJWMFZHVjRkRk5wZW1VZ1BTQm1kVzVqZEdsdmJpaG1iMjUwVTJsNlpTa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZlptOXVkRk5wZW1VZ1BTQm1iMjUwVTJsNlpUdGNjbHh1SUNBZ0lIUm9hWE11WDJOaGJHTjFiR0YwWlUxbGRISnBZM01vZEhKMVpTazdYSEpjYmlBZ0lDQnlaWFIxY200Z2RHaHBjenRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlRaWFFnY205MFlYUnBiMjRnYjJZZ2RHVjRkRnh5WEc0Z0tpQkFjSFZpYkdsalhISmNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0JoYm1kc1pTQXRJRkp2ZEdGMGFXOXVJR2x1SUhKaFpHbGhibk5jY2x4dUlDb2dRSEpsZEhWeWJuTWdlM1JvYVhOOUlGVnpaV1oxYkNCbWIzSWdZMmhoYVc1cGJtZGNjbHh1SUNvdlhISmNia0ppYjNoQmJHbG5ibVZrVkdWNGRDNXdjbTkwYjNSNWNHVXVjMlYwVW05MFlYUnBiMjRnUFNCbWRXNWpkR2x2YmloaGJtZHNaU2tnZTF4eVhHNGdJQ0FnZEdocGN5NWZjbTkwWVhScGIyNGdQU0IxZEdsc2N5NWtaV1poZFd4MEtHRnVaMnhsTENCMGFHbHpMbDl5YjNSaGRHbHZiaWs3WEhKY2JpQWdJQ0J5WlhSMWNtNGdkR2hwY3p0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJIWlhRZ2NtOTBZWFJwYjI0Z2IyWWdkR1Y0ZEZ4eVhHNGdLaUJBY0hWaWJHbGpYSEpjYmlBcUlFQnlaWFIxY201eklIdHVkVzFpWlhKOUlGSnZkR0YwYVc5dUlHbHVJSEpoWkdsaGJuTmNjbHh1SUNvdlhISmNia0ppYjNoQmJHbG5ibVZrVkdWNGRDNXdjbTkwYjNSNWNHVXVaMlYwVW05MFlYUnBiMjRnUFNCbWRXNWpkR2x2YmloaGJtZHNaU2tnZTF4eVhHNGdJQ0FnY21WMGRYSnVJSFJvYVhNdVgzSnZkR0YwYVc5dU8xeHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUZObGRDQjBhR1VnY0NCcGJuTjBZVzVqWlNCMGFHRjBJR2x6SUhWelpXUWdabTl5SUdSeVlYZHBibWRjY2x4dUlDb2dRSEIxWW14cFkxeHlYRzRnS2lCQWNHRnlZVzBnZTI5aWFtVmpkSDBnY0NBdElFbHVjM1JoYm1ObElHOW1JSEExSUdadmNpQmtjbUYzYVc1bkxpQlVhR2x6SUdseklHOXViSGtnYm1WbFpHVmtJSGRvWlc0Z1hISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RYTnBibWNnWVc0Z2IyWm1jMk55WldWdUlISmxibVJsY21WeUlHOXlJSGRvWlc0Z2RYTnBibWNnY0RVZ2FXNGdhVzV6ZEdGdVkyVmNjbHh1SUNvZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnRiMlJsTGx4eVhHNGdLaUJBY21WMGRYSnVjeUI3ZEdocGMzMGdWWE5sWm5Wc0lHWnZjaUJqYUdGcGJtbHVaMXh5WEc0Z0tpOWNjbHh1UW1KdmVFRnNhV2R1WldSVVpYaDBMbkJ5YjNSdmRIbHdaUzV6WlhSUVNXNXpkR0Z1WTJVZ1BTQm1kVzVqZEdsdmJpaHdLU0I3WEhKY2JpQWdJQ0IwYUdsekxsOXdJRDBnZFhScGJITXVaR1ZtWVhWc2RDaHdMQ0IwYUdsekxsOXdLVHRjY2x4dUlDQWdJSEpsZEhWeWJpQjBhR2x6TzF4eVhHNTlPMXh5WEc1Y2NseHVMeW9xWEhKY2JpQXFJRWRsZENCeWIzUmhkR2x2YmlCdlppQjBaWGgwWEhKY2JpQXFJRUJ3ZFdKc2FXTmNjbHh1SUNvZ1FISmxkSFZ5Ym5NZ2UyOWlhbVZqZEgwZ1NXNXpkR0Z1WTJVZ2IyWWdjRFVnZEdoaGRDQnBjeUJpWldsdVp5QjFjMlZrSUdadmNpQmtjbUYzYVc1blhISmNiaUFxTDF4eVhHNUNZbTk0UVd4cFoyNWxaRlJsZUhRdWNISnZkRzkwZVhCbExtZGxkRkJKYm5OMFlXNWpaU0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTXVYM0E3WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dVMlYwSUdGdVkyaHZjaUJ3YjJsdWRDQm1iM0lnZEdWNGRDQW9hRzl5YVhwdmJtRnNJR0Z1WkNCMlpYSjBhV05oYkNCaGJHbG5ibTFsYm5RcElISmxiR0YwYVhabElIUnZYSEpjYmlBcUlHSnZkVzVrYVc1bklHSnZlRnh5WEc0Z0tpQkFjSFZpYkdsalhISmNiaUFxSUVCd1lYSmhiU0I3YzNSeWFXNW5mU0JiYUVGc2FXZHVQVU5GVGxSRlVsMGdMU0JJYjNKcGVtOXVZV3dnWVd4cFoyNXRaVzUwWEhKY2JpQXFJRUJ3WVhKaGJTQjdjM1J5YVc1bmZTQmJka0ZzYVdkdVBVTkZUbFJGVWwwZ0xTQldaWEowYVdOaGJDQmlZWE5sYkdsdVpWeHlYRzRnS2lCQWNHRnlZVzBnZTJKdmIyeGxZVzU5SUZ0MWNHUmhkR1ZRYjNOcGRHbHZiajFtWVd4elpWMGdMU0JKWmlCelpYUWdkRzhnZEhKMVpTd2dkR2hsSUhCdmMybDBhVzl1SUc5bUlIUm9aVnh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHVWdkR1Y0ZENCM2FXeHNJR0psSUhOb2FXWjBaV1FnYzI4Z2RHaGhkRnh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFHVWdkR1Y0ZENCM2FXeHNJR0psSUdSeVlYZHVJR2x1SUhSb1pTQnpZVzFsWEhKY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIQnNZV05sSUdsMElIZGhjeUJpWldadmNtVWdZMkZzYkdsdVp5QmNjbHh1SUNvZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYzJWMFFXNWphRzl5TGx4eVhHNGdLaUJBY21WMGRYSnVjeUI3ZEdocGMzMGdWWE5sWm5Wc0lHWnZjaUJqYUdGcGJtbHVaMXh5WEc0Z0tpOWNjbHh1UW1KdmVFRnNhV2R1WldSVVpYaDBMbkJ5YjNSdmRIbHdaUzV6WlhSQmJtTm9iM0lnUFNCbWRXNWpkR2x2Ymlob1FXeHBaMjRzSUhaQmJHbG5iaXdnZFhCa1lYUmxVRzl6YVhScGIyNHBJSHRjY2x4dUlDQWdJSFpoY2lCdmJHUlFiM01nUFNCMGFHbHpMbDlqWVd4amRXeGhkR1ZCYkdsbmJtVmtRMjl2Y21SektIUm9hWE11WDNnc0lIUm9hWE11WDNrcE8xeHlYRzRnSUNBZ2RHaHBjeTVmYUVGc2FXZHVJRDBnZFhScGJITXVaR1ZtWVhWc2RDaG9RV3hwWjI0c0lFSmliM2hCYkdsbmJtVmtWR1Y0ZEM1QlRFbEhUaTVEUlU1VVJWSXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZmRrRnNhV2R1SUQwZ2RYUnBiSE11WkdWbVlYVnNkQ2gyUVd4cFoyNHNJRUppYjNoQmJHbG5ibVZrVkdWNGRDNUNRVk5GVEVsT1JTNURSVTVVUlZJcE8xeHlYRzRnSUNBZ2FXWWdLSFZ3WkdGMFpWQnZjMmwwYVc5dUtTQjdYSEpjYmlBZ0lDQWdJQ0FnZG1GeUlHNWxkMUJ2Y3lBOUlIUm9hWE11WDJOaGJHTjFiR0YwWlVGc2FXZHVaV1JEYjI5eVpITW9kR2hwY3k1ZmVDd2dkR2hwY3k1ZmVTazdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZlQ0FyUFNCdmJHUlFiM011ZUNBdElHNWxkMUJ2Y3k1NE8xeHlYRzRnSUNBZ0lDQWdJSFJvYVhNdVgza2dLejBnYjJ4a1VHOXpMbmtnTFNCdVpYZFFiM011ZVR0Y2NseHVJQ0FnSUgxY2NseHVJQ0FnSUhKbGRIVnliaUIwYUdsek8xeHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUVkbGRDQjBhR1VnWW05MWJtUnBibWNnWW05NElIZG9aVzRnZEdobElIUmxlSFFnYVhNZ2NHeGhZMlZrSUdGMElIUm9aU0J6Y0dWamFXWnBaV1FnWTI5dmNtUnBibUYwWlhNdVhISmNiaUFxSUU1dmRHVTZJSFJvYVhNZ2FYTWdkR2hsSUhWdWNtOTBZWFJsWkNCaWIzVnVaR2x1WnlCaWIzZ2hJRlJQUkU4NklFWnBlQ0IwYUdsekxseHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnVzNnOVkzVnljbVZ1ZENCNFhTQXRJRUVnYm1WM0lIZ2dZMjl2Y21ScGJtRjBaU0J2WmlCMFpYaDBJR0Z1WTJodmNpNGdWR2hwYzF4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIZHBiR3dnWTJoaGJtZGxJSFJvWlNCMFpYaDBKM01nZUNCd2IzTnBkR2x2YmlCY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQndaWEp0WVc1bGJuUnNlUzRnWEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQmJlVDFqZFhKeVpXNTBJSGxkSUMwZ1FTQnVaWGNnZVNCamIyOXlaR2x1WVhSbElHOW1JSFJsZUhRZ1lXNWphRzl5TGlCVWFHbHpYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZDJsc2JDQmphR0Z1WjJVZ2RHaGxJSFJsZUhRbmN5QjRJSEJ2YzJsMGFXOXVJRnh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhCbGNtMWhibVZ1ZEd4NUxseHlYRzRnS2lCQWNtVjBkWEp1SUh0dlltcGxZM1I5SUZKbGRIVnlibk1nWVc0Z2IySnFaV04wSUhkcGRHZ2djSEp2Y0dWeWRHbGxjem9nZUN3Z2VTd2dkeXdnYUZ4eVhHNGdLaTljY2x4dVFtSnZlRUZzYVdkdVpXUlVaWGgwTG5CeWIzUnZkSGx3WlM1blpYUkNZbTk0SUQwZ1puVnVZM1JwYjI0b2VDd2dlU2tnZTF4eVhHNGdJQ0FnZEdocGN5NXpaWFJRYjNOcGRHbHZiaWg0TENCNUtUdGNjbHh1SUNBZ0lIWmhjaUJ3YjNNZ1BTQjBhR2x6TGw5allXeGpkV3hoZEdWQmJHbG5ibVZrUTI5dmNtUnpLSFJvYVhNdVgzZ3NJSFJvYVhNdVgza3BPMXh5WEc0Z0lDQWdjbVYwZFhKdUlIdGNjbHh1SUNBZ0lDQWdJQ0I0T2lCd2IzTXVlQ0FySUhSb2FYTXVYMkp2ZFc1a2MwOW1abk5sZEM1NExGeHlYRzRnSUNBZ0lDQWdJSGs2SUhCdmN5NTVJQ3NnZEdocGN5NWZZbTkxYm1SelQyWm1jMlYwTG5rc1hISmNiaUFnSUNBZ0lDQWdkem9nZEdocGN5NTNhV1IwYUN4Y2NseHVJQ0FnSUNBZ0lDQm9PaUIwYUdsekxtaGxhV2RvZEZ4eVhHNGdJQ0FnZlR0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJIWlhRZ1lXNGdZWEp5WVhrZ2IyWWdjRzlwYm5SeklIUm9ZWFFnWm05c2JHOTNJR0ZzYjI1bklIUm9aU0IwWlhoMElIQmhkR2d1SUZSb2FYTWdkMmxzYkNCMFlXdGxJR2x1ZEc5Y2NseHVJQ29nWTI5dWMybGtaWEpoZEdsdmJpQjBhR1VnWTNWeWNtVnVkQ0JoYkdsbmJtMWxiblFnYzJWMGRHbHVaM011WEhKY2JpQXFJRTV2ZEdVNklIUm9hWE1nYVhNZ1lTQjBhR2x1SUhkeVlYQndaWElnWVhKdmRXNWtJR0VnY0RVZ2JXVjBhRzlrSUdGdVpDQmtiMlZ6YmlkMElHaGhibVJzWlNCMWJuSnZkR0YwWldSY2NseHVJQ29nZEdWNGRDRWdWRTlFVHpvZ1JtbDRJSFJvYVhNdVhISmNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0JiZUQxamRYSnlaVzUwSUhoZElDMGdRU0J1WlhjZ2VDQmpiMjl5WkdsdVlYUmxJRzltSUhSbGVIUWdZVzVqYUc5eUxpQlVhR2x6WEhKY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2QybHNiQ0JqYUdGdVoyVWdkR2hsSUhSbGVIUW5jeUI0SUhCdmMybDBhVzl1SUZ4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIQmxjbTFoYm1WdWRHeDVMaUJjY2x4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlGdDVQV04xY25KbGJuUWdlVjBnTFNCQklHNWxkeUI1SUdOdmIzSmthVzVoZEdVZ2IyWWdkR1Y0ZENCaGJtTm9iM0l1SUZSb2FYTmNjbHh1SUNvZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IzYVd4c0lHTm9ZVzVuWlNCMGFHVWdkR1Y0ZENkeklIZ2djRzl6YVhScGIyNGdYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0dWeWJXRnVaVzUwYkhrdVhISmNiaUFxSUVCd1lYSmhiU0I3YjJKcVpXTjBmU0JiYjNCMGFXOXVjMTBnTFNCQmJpQnZZbXBsWTNRZ2RHaGhkQ0JqWVc0Z2FHRjJaVHBjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnTFNCellXMXdiR1ZHWVdOMGIzSTZJSEpoZEdsdklHOW1JSEJoZEdndGJHVnVaM1JvSUhSdklHNTFiV0psY2x4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHOW1JSE5oYlhCc1pYTWdLR1JsWm1GMWJIUTlNQzR5TlNrdUlFaHBaMmhsY2lCMllXeDFaWE1nWEhKY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2VXbGxiR1FnYlc5eVpYQnZhVzUwY3lCaGJtUWdZWEpsSUhSb1pYSmxabTl5WlNCdGIzSmxJRnh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhCeVpXTnBjMlV1SUZ4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBdElITnBiWEJzYVdaNVZHaHlaWE5vYjJ4a09pQnBaaUJ6WlhRZ2RHOGdZU0J1YjI0dGVtVnlieUJjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllXeDFaU3dnWTI5c2JHbHVaV0Z5SUhCdmFXNTBjeUIzYVd4c0lHSmxJSEpsYlc5MlpXUXVJRlJvWlZ4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWmhiSFZsSUhKbGNISmxjMlZ1ZEhNZ2RHaGxJSFJvY21WemFHOXNaQ0JoYm1kc1pTQjBieUIxYzJWY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjNhR1Z1SUdSbGRHVnliV2x1YVc1bklIZG9aWFJvWlhJZ2RIZHZJR1ZrWjJWeklHRnlaU0JjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamIyeHNhVzVsWVhJdVhISmNiaUFxSUVCeVpYUjFjbTRnZTJGeWNtRjVmU0JCYmlCaGNuSmhlU0J2WmlCd2IybHVkSE1zSUdWaFkyZ2dkMmwwYUNCNExDQjVJQ1lnWVd4d2FHRWdLSFJvWlNCd1lYUm9JR0Z1WjJ4bEtWeHlYRzRnS2k5Y2NseHVRbUp2ZUVGc2FXZHVaV1JVWlhoMExuQnliM1J2ZEhsd1pTNW5aWFJVWlhoMFVHOXBiblJ6SUQwZ1puVnVZM1JwYjI0b2VDd2dlU3dnYjNCMGFXOXVjeWtnZTF4eVhHNGdJQ0FnZEdocGN5NXpaWFJRYjNOcGRHbHZiaWg0TENCNUtUdGNjbHh1SUNBZ0lIWmhjaUJ3YjJsdWRITWdQU0IwYUdsekxsOW1iMjUwTG5SbGVIUlViMUJ2YVc1MGN5aDBhR2x6TGw5MFpYaDBMQ0IwYUdsekxsOTRMQ0IwYUdsekxsOTVMQ0JjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDltYjI1MFUybDZaU3dnYjNCMGFXOXVjeWs3WEhKY2JpQWdJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUhCdmFXNTBjeTVzWlc1bmRHZzdJR2tnS3owZ01Ta2dlMXh5WEc0Z0lDQWdJQ0FnSUhaaGNpQndiM01nUFNCMGFHbHpMbDlqWVd4amRXeGhkR1ZCYkdsbmJtVmtRMjl2Y21SektIQnZhVzUwYzF0cFhTNTRMQ0J3YjJsdWRITmJhVjB1ZVNrN1hISmNiaUFnSUNBZ0lDQWdjRzlwYm5SelcybGRMbmdnUFNCd2IzTXVlRHRjY2x4dUlDQWdJQ0FnSUNCd2IybHVkSE5iYVYwdWVTQTlJSEJ2Y3k1NU8xeHlYRzRnSUNBZ2ZWeHlYRzRnSUNBZ2NtVjBkWEp1SUhCdmFXNTBjenRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQkVjbUYzY3lCMGFHVWdkR1Y0ZENCd1lYSjBhV05zWlNCM2FYUm9JSFJvWlNCemNHVmphV1pwWldRZ2MzUjViR1VnY0dGeVlXMWxkR1Z5Y3k0Z1RtOTBaVG9nZEdocGN5QnBjMXh5WEc0Z0tpQm5iMmx1WnlCMGJ5QnpaWFFnZEdobElIUmxlSFJHYjI1MExDQjBaWGgwVTJsNlpTQW1JSEp2ZEdGMGFXOXVJR0psWm05eVpTQmtjbUYzYVc1bkxpQlpiM1VnYzJodmRXeGtJSE5sZEZ4eVhHNGdLaUIwYUdVZ1kyOXNiM0l2YzNSeWIydGxMMlpwYkd3Z2RHaGhkQ0I1YjNVZ2QyRnVkQ0JpWldadmNtVWdaSEpoZDJsdVp5NGdWR2hwY3lCbWRXNWpkR2x2YmlCM2FXeHNJR05zWldGdVhISmNiaUFxSUhWd0lHRm1kR1Z5SUdsMGMyVnNaaUJoYm1RZ2NtVnpaWFFnYzNSNWJHbHVaeUJpWVdOcklIUnZJSGRvWVhRZ2FYUWdkMkZ6SUdKbFptOXlaU0JwZENCM1lYTWdZMkZzYkdWa0xseHlYRzRnS2lCQWNIVmliR2xqWEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQmJlRDFqZFhKeVpXNTBJSGhkSUMwZ1FTQnVaWGNnZUNCamIyOXlaR2x1WVhSbElHOW1JSFJsZUhRZ1lXNWphRzl5TGlCVWFHbHpJSGRwYkd4Y2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTm9ZVzVuWlNCMGFHVWdkR1Y0ZENkeklIZ2djRzl6YVhScGIyNGdjR1Z5YldGdVpXNTBiSGt1SUZ4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXM2s5WTNWeWNtVnVkQ0I1WFNBdElFRWdibVYzSUhrZ1kyOXZjbVJwYm1GMFpTQnZaaUIwWlhoMElHRnVZMmh2Y2k0Z1ZHaHBjeUIzYVd4c1hISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMmhoYm1kbElIUm9aU0IwWlhoMEozTWdlQ0J3YjNOcGRHbHZiaUJ3WlhKdFlXNWxiblJzZVM1Y2NseHVJQ29nUUhCaGNtRnRJSHRpYjI5c1pXRnVmU0JiWkhKaGQwSnZkVzVrY3oxbVlXeHpaVjBnTFNCR2JHRm5JR1p2Y2lCa2NtRjNhVzVuSUdKdmRXNWthVzVuSUdKdmVGeHlYRzRnS2k5Y2NseHVRbUp2ZUVGc2FXZHVaV1JVWlhoMExuQnliM1J2ZEhsd1pTNWtjbUYzSUQwZ1puVnVZM1JwYjI0b2VDd2dlU3dnWkhKaGQwSnZkVzVrY3lrZ2UxeHlYRzRnSUNBZ1pISmhkMEp2ZFc1a2N5QTlJSFYwYVd4ekxtUmxabUYxYkhRb1pISmhkMEp2ZFc1a2N5d2dabUZzYzJVcE8xeHlYRzRnSUNBZ2RHaHBjeTV6WlhSUWIzTnBkR2x2YmloNExDQjVLVHRjY2x4dUlDQWdJSFpoY2lCd2IzTWdQU0I3WEhKY2JpQWdJQ0FnSUNBZ2VEb2dkR2hwY3k1ZmVDd2dYSEpjYmlBZ0lDQWdJQ0FnZVRvZ2RHaHBjeTVmZVZ4eVhHNGdJQ0FnZlR0Y2NseHVYSEpjYmlBZ0lDQjBhR2x6TGw5d0xuQjFjMmdvS1R0Y2NseHVYSEpjYmlBZ0lDQWdJQ0FnYVdZZ0tIUm9hWE11WDNKdmRHRjBhVzl1S1NCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhCdmN5QTlJSFJvYVhNdVgyTmhiR04xYkdGMFpWSnZkR0YwWldSRGIyOXlaSE1vY0c5ekxuZ3NJSEJ2Y3k1NUxDQjBhR2x6TGw5eWIzUmhkR2x2YmlrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM0F1Y205MFlYUmxLSFJvYVhNdVgzSnZkR0YwYVc5dUtUdGNjbHh1SUNBZ0lDQWdJQ0I5WEhKY2JseHlYRzRnSUNBZ0lDQWdJSEJ2Y3lBOUlIUm9hWE11WDJOaGJHTjFiR0YwWlVGc2FXZHVaV1JEYjI5eVpITW9jRzl6TG5nc0lIQnZjeTU1S1R0Y2NseHVYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjQzUwWlhoMFFXeHBaMjRvZEdocGN5NWZjQzVNUlVaVUxDQjBhR2x6TGw5d0xrSkJVMFZNU1U1RktUdGNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOXdMblJsZUhSR2IyNTBLSFJvYVhNdVgyWnZiblFwTzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WDNBdWRHVjRkRk5wZW1Vb2RHaHBjeTVmWm05dWRGTnBlbVVwTzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WDNBdWRHVjRkQ2gwYUdsekxsOTBaWGgwTENCd2IzTXVlQ3dnY0c5ekxua3BPMXh5WEc1Y2NseHVJQ0FnSUNBZ0lDQnBaaUFvWkhKaGQwSnZkVzVrY3lrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl3TG5OMGNtOXJaU2d5TURBcE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMllYSWdZbTkxYm1SeldDQTlJSEJ2Y3k1NElDc2dkR2hwY3k1ZlltOTFibVJ6VDJabWMyVjBMbmc3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCaWIzVnVaSE5aSUQwZ2NHOXpMbmtnS3lCMGFHbHpMbDlpYjNWdVpITlBabVp6WlhRdWVUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmY0M1dWIwWnBiR3dvS1R0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnZEdocGN5NWZjQzV5WldOMEtHSnZkVzVrYzFnc0lHSnZkVzVrYzFrc0lIUm9hWE11ZDJsa2RHZ3NJSFJvYVhNdWFHVnBaMmgwS1RzZ0lDQWdJQ0FnSUNBZ0lDQmNjbHh1SUNBZ0lDQWdJQ0I5WEhKY2JseHlYRzRnSUNBZ2RHaHBjeTVmY0M1d2IzQW9LVHRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlFjbTlxWldOMElIUm9aU0JqYjI5eVpHbHVZWFJsY3lBb2VDd2dlU2tnYVc1MGJ5QmhJSEp2ZEdGMFpXUWdZMjl2Y21ScGJtRjBaU0J6ZVhOMFpXMWNjbHh1SUNvZ1FIQnlhWFpoZEdWY2NseHVJQ29nUUhCaGNtRnRJSHR1ZFcxaVpYSjlJSGdnTFNCWUlHTnZiM0prYVc1aGRHVWdLR2x1SUhWdWNtOTBZWFJsWkNCemNHRmpaU2xjY2x4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlIa2dMU0JaSUdOdmIzSmthVzVoZEdVZ0tHbHVJSFZ1Y205MFlYUmxaQ0J6Y0dGalpTbGNjbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUdGdVoyeGxJQzBnVW1Ga2FXRnVjeUJ2WmlCeWIzUmhkR2x2YmlCMGJ5QmhjSEJzZVZ4eVhHNGdLaUJBY21WMGRYSnVJSHR2WW1wbFkzUjlJRTlpYW1WamRDQjNhWFJvSUhnZ0ppQjVJSEJ5YjNCbGNuUnBaWE5jY2x4dUlDb3ZYSEpjYmtKaWIzaEJiR2xuYm1Wa1ZHVjRkQzV3Y205MGIzUjVjR1V1WDJOaGJHTjFiR0YwWlZKdmRHRjBaV1JEYjI5eVpITWdQU0JtZFc1amRHbHZiaUFvZUN3Z2VTd2dZVzVuYkdVcElIc2dJRnh5WEc0Z0lDQWdkbUZ5SUhKNElEMGdUV0YwYUM1amIzTW9ZVzVuYkdVcElDb2dlQ0FySUUxaGRHZ3VZMjl6S0UxaGRHZ3VVRWtnTHlBeUlDMGdZVzVuYkdVcElDb2dlVHRjY2x4dUlDQWdJSFpoY2lCeWVTQTlJQzFOWVhSb0xuTnBiaWhoYm1kc1pTa2dLaUI0SUNzZ1RXRjBhQzV6YVc0b1RXRjBhQzVRU1NBdklESWdMU0JoYm1kc1pTa2dLaUI1TzF4eVhHNGdJQ0FnY21WMGRYSnVJSHQ0T2lCeWVDd2dlVG9nY25sOU8xeHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUVOaGJHTjFiR0YwWlhNZ1pISmhkeUJqYjI5eVpHbHVZWFJsY3lCbWIzSWdkR2hsSUhSbGVIUXNJR0ZzYVdkdWFXNW5JR0poYzJWa0lHOXVJSFJvWlNCaWIzVnVaR2x1WnlCaWIzZ3VYSEpjYmlBcUlGUm9aU0IwWlhoMElHbHpJR1YyWlc1MGRXRnNiSGtnWkhKaGQyNGdkMmwwYUNCallXNTJZWE1nWVd4cFoyNXRaVzUwSUhObGRDQjBieUJzWldaMElDWWdZbUZ6Wld4cGJtVXNJSE52WEhKY2JpQXFJSFJvYVhNZ1puVnVZM1JwYjI0Z2RHRnJaWE1nWVNCa1pYTnBjbVZrSUhCdmN5QW1JR0ZzYVdkdWJXVnVkQ0JoYm1RZ2NtVjBkWEp1Y3lCMGFHVWdZWEJ3Y205d2NtbGhkR1ZjY2x4dUlDb2dZMjl2Y21ScGJtRjBaWE1nWm05eUlIUm9aU0JzWldaMElDWWdZbUZ6Wld4cGJtVXVYSEpjYmlBcUlFQndjbWwyWVhSbFhISmNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0I0SUMwZ1dDQmpiMjl5WkdsdVlYUmxYSEpjYmlBcUlFQndZWEpoYlNCN2JuVnRZbVZ5ZlNCNUlDMGdXU0JqYjI5eVpHbHVZWFJsWEhKY2JpQXFJRUJ5WlhSMWNtNGdlMjlpYW1WamRIMGdUMkpxWldOMElIZHBkR2dnZUNBbUlIa2djSEp2Y0dWeWRHbGxjMXh5WEc0Z0tpOWNjbHh1UW1KdmVFRnNhV2R1WldSVVpYaDBMbkJ5YjNSdmRIbHdaUzVmWTJGc1kzVnNZWFJsUVd4cFoyNWxaRU52YjNKa2N5QTlJR1oxYm1OMGFXOXVLSGdzSUhrcElIdGNjbHh1SUNBZ0lIWmhjaUJ1WlhkWUxDQnVaWGRaTzF4eVhHNGdJQ0FnYzNkcGRHTm9JQ2gwYUdsekxsOW9RV3hwWjI0cElIdGNjbHh1SUNBZ0lDQWdJQ0JqWVhObElFSmliM2hCYkdsbmJtVmtWR1Y0ZEM1QlRFbEhUaTVDVDFoZlRFVkdWRHBjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdibVYzV0NBOUlIZzdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHSnlaV0ZyTzF4eVhHNGdJQ0FnSUNBZ0lHTmhjMlVnUW1KdmVFRnNhV2R1WldSVVpYaDBMa0ZNU1VkT0xrSlBXRjlEUlU1VVJWSTZYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHNWxkMWdnUFNCNElDMGdkR2hwY3k1b1lXeG1WMmxrZEdnN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdKeVpXRnJPMXh5WEc0Z0lDQWdJQ0FnSUdOaGMyVWdRbUp2ZUVGc2FXZHVaV1JVWlhoMExrRk1TVWRPTGtKUFdGOVNTVWRJVkRwY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYm1WM1dDQTlJSGdnTFNCMGFHbHpMbmRwWkhSb08xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCaWNtVmhhenRjY2x4dUlDQWdJQ0FnSUNCa1pXWmhkV3gwT2x4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J1WlhkWUlEMGdlRHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1YzI5c1pTNXNiMmNvWENKVmJuSmxZMjluYm1sNlpXUWdhRzl5YVhwdmJtRnNJR0ZzYVdkdU9sd2lMQ0IwYUdsekxsOW9RV3hwWjI0cE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCaWNtVmhhenRjY2x4dUlDQWdJSDFjY2x4dUlDQWdJSE4zYVhSamFDQW9kR2hwY3k1ZmRrRnNhV2R1S1NCN1hISmNiaUFnSUNBZ0lDQWdZMkZ6WlNCQ1ltOTRRV3hwWjI1bFpGUmxlSFF1UWtGVFJVeEpUa1V1UWs5WVgxUlBVRHBjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdibVYzV1NBOUlIa2dMU0IwYUdsekxsOWliM1Z1WkhOUFptWnpaWFF1ZVR0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWW5KbFlXczdYSEpjYmlBZ0lDQWdJQ0FnWTJGelpTQkNZbTk0UVd4cFoyNWxaRlJsZUhRdVFrRlRSVXhKVGtVdVFrOVlYME5GVGxSRlVqcGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2JtVjNXU0E5SUhrZ0t5QjBhR2x6TGw5a2FYTjBRbUZ6WlZSdlRXbGtPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmljbVZoYXp0Y2NseHVJQ0FnSUNBZ0lDQmpZWE5sSUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQzVDUVZORlRFbE9SUzVDVDFoZlFrOVVWRTlOT2x4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J1WlhkWklEMGdlU0F0SUhSb2FYTXVYMlJwYzNSQ1lYTmxWRzlDYjNSMGIyMDdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHSnlaV0ZyTzF4eVhHNGdJQ0FnSUNBZ0lHTmhjMlVnUW1KdmVFRnNhV2R1WldSVVpYaDBMa0pCVTBWTVNVNUZMa1pQVGxSZlEwVk9WRVZTT2x4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCSVpXbG5hSFFnYVhNZ1lYQndjbTk0YVcxaGRHVmtJR0Z6SUdGelkyVnVkQ0FySUdSbGMyTmxiblJjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdibVYzV1NBOUlIa2dMU0IwYUdsekxsOWtaWE5qWlc1MElDc2dLSFJvYVhNdVgyRnpZMlZ1ZENBcklIUm9hWE11WDJSbGMyTmxiblFwSUM4Z01qdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1luSmxZV3M3WEhKY2JpQWdJQ0FnSUNBZ1kyRnpaU0JDWW05NFFXeHBaMjVsWkZSbGVIUXVRa0ZUUlV4SlRrVXVRVXhRU0VGQ1JWUkpRenBjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdibVYzV1NBOUlIazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHSnlaV0ZyTzF4eVhHNGdJQ0FnSUNBZ0lHUmxabUYxYkhRNlhISmNiaUFnSUNBZ0lDQWdJQ0FnSUc1bGQxa2dQU0I1TzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1emIyeGxMbXh2WnloY0lsVnVjbVZqYjJkdWFYcGxaQ0IyWlhKMGFXTmhiQ0JoYkdsbmJqcGNJaXdnZEdocGN5NWZka0ZzYVdkdUtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1luSmxZV3M3WEhKY2JpQWdJQ0I5WEhKY2JpQWdJQ0J5WlhSMWNtNGdlM2c2SUc1bGQxZ3NJSGs2SUc1bGQxbDlPMXh5WEc1OU8xeHlYRzVjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJEWVd4amRXeGhkR1Z6SUdKdmRXNWthVzVuSUdKdmVDQmhibVFnZG1GeWFXOTFjeUJ0WlhSeWFXTnpJR1p2Y2lCMGFHVWdZM1Z5Y21WdWRDQjBaWGgwSUdGdVpDQm1iMjUwWEhKY2JpQXFJRUJ3Y21sMllYUmxYSEpjYmlBcUwxeHlYRzVDWW05NFFXeHBaMjVsWkZSbGVIUXVjSEp2ZEc5MGVYQmxMbDlqWVd4amRXeGhkR1ZOWlhSeWFXTnpJRDBnWm5WdVkzUnBiMjRvYzJodmRXeGtWWEJrWVhSbFNHVnBaMmgwS1NCN0lDQmNjbHh1SUNBZ0lDOHZJSEExSURBdU5TNHdJR2hoY3lCaElHSjFaeUF0SUhSbGVIUWdZbTkxYm1SeklHRnlaU0JqYkdsd2NHVmtJR0o1SUNnd0xDQXdLVnh5WEc0Z0lDQWdMeThnUTJGc1kzVnNZWFJwYm1jZ1ltOTFibVJ6SUdoaFkydGNjbHh1SUNBZ0lIWmhjaUJpYjNWdVpITWdQU0IwYUdsekxsOW1iMjUwTG5SbGVIUkNiM1Z1WkhNb2RHaHBjeTVmZEdWNGRDd2dNVEF3TUN3Z01UQXdNQ3dnZEdocGN5NWZabTl1ZEZOcGVtVXBPMXh5WEc0Z0lDQWdMeThnUW05MWJtUnpJR2x6SUdFZ2NtVm1aWEpsYm1ObElDMGdhV1lnZDJVZ2JXVnpjeUIzYVhSb0lHbDBJR1JwY21WamRHeDVMQ0IzWlNCallXNGdiV1Z6Y3lCMWNDQmNjbHh1SUNBZ0lDOHZJR1oxZEhWeVpTQjJZV3gxWlhNaElDaEpkQ0JqYUdGdVoyVnpJSFJvWlNCaVltOTRJR05oWTJobElHbHVJSEExTGlsY2NseHVJQ0FnSUdKdmRXNWtjeUE5SUhzZ1hISmNiaUFnSUNBZ0lDQWdlRG9nWW05MWJtUnpMbmdnTFNBeE1EQXdMQ0JjY2x4dUlDQWdJQ0FnSUNCNU9pQmliM1Z1WkhNdWVTQXRJREV3TURBc0lGeHlYRzRnSUNBZ0lDQWdJSGM2SUdKdmRXNWtjeTUzTENCY2NseHVJQ0FnSUNBZ0lDQm9PaUJpYjNWdVpITXVhQ0JjY2x4dUlDQWdJSDA3SUZ4eVhHNWNjbHh1SUNBZ0lHbG1JQ2h6YUc5MWJHUlZjR1JoZEdWSVpXbG5hSFFwSUh0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5aGMyTmxiblFnUFNCMGFHbHpMbDltYjI1MExsOTBaWGgwUVhOalpXNTBLSFJvYVhNdVgyWnZiblJUYVhwbEtUdGNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOWtaWE5qWlc1MElEMGdkR2hwY3k1ZlptOXVkQzVmZEdWNGRFUmxjMk5sYm5Rb2RHaHBjeTVmWm05dWRGTnBlbVVwTzF4eVhHNGdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lDOHZJRlZ6WlNCaWIzVnVaSE1nZEc4Z1kyRnNZM1ZzWVhSbElHWnZiblFnYldWMGNtbGpjMXh5WEc0Z0lDQWdkR2hwY3k1M2FXUjBhQ0E5SUdKdmRXNWtjeTUzTzF4eVhHNGdJQ0FnZEdocGN5NW9aV2xuYUhRZ1BTQmliM1Z1WkhNdWFEdGNjbHh1SUNBZ0lIUm9hWE11YUdGc1psZHBaSFJvSUQwZ2RHaHBjeTUzYVdSMGFDQXZJREk3WEhKY2JpQWdJQ0IwYUdsekxtaGhiR1pJWldsbmFIUWdQU0IwYUdsekxtaGxhV2RvZENBdklESTdYSEpjYmlBZ0lDQjBhR2x6TGw5aWIzVnVaSE5QWm1aelpYUWdQU0I3SUhnNklHSnZkVzVrY3k1NExDQjVPaUJpYjNWdVpITXVlU0I5TzF4eVhHNGdJQ0FnZEdocGN5NWZaR2x6ZEVKaGMyVlViMDFwWkNBOUlFMWhkR2d1WVdKektHSnZkVzVrY3k1NUtTQXRJSFJvYVhNdWFHRnNaa2hsYVdkb2REdGNjbHh1SUNBZ0lIUm9hWE11WDJScGMzUkNZWE5sVkc5Q2IzUjBiMjBnUFNCMGFHbHpMbWhsYVdkb2RDQXRJRTFoZEdndVlXSnpLR0p2ZFc1a2N5NTVLVHRjY2x4dWZUc2lMQ0psZUhCdmNuUnpMbVJsWm1GMWJIUWdQU0JtZFc1amRHbHZiaWgyWVd4MVpTd2daR1ZtWVhWc2RGWmhiSFZsS1NCN1hISmNiaUFnSUNCeVpYUjFjbTRnS0haaGJIVmxJQ0U5UFNCMWJtUmxabWx1WldRcElEOGdkbUZzZFdVZ09pQmtaV1poZFd4MFZtRnNkV1U3WEhKY2JuMDdJaXdpYlc5a2RXeGxMbVY0Y0c5eWRITWdQU0JJYjNabGNsTnNhV1JsYzJodmQzTTdYSEpjYmx4eVhHNTJZWElnZFhScGJHbDBhV1Z6SUQwZ2NtVnhkV2x5WlNoY0lpNHZkWFJwYkdsMGFXVnpMbXB6WENJcE8xeHlYRzVjY2x4dVpuVnVZM1JwYjI0Z1NHOTJaWEpUYkdsa1pYTm9iM2R6S0hOc2FXUmxjMmh2ZDBSbGJHRjVMQ0IwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRwSUh0Y2NseHVJQ0IwYUdsekxsOXpiR2xrWlhOb2IzZEVaV3hoZVNBOUlITnNhV1JsYzJodmQwUmxiR0Y1SUNFOVBTQjFibVJsWm1sdVpXUWdQeUJ6Ykdsa1pYTm9iM2RFWld4aGVTQTZJREl3TURBN1hISmNiaUFnZEdocGN5NWZkSEpoYm5OcGRHbHZia1IxY21GMGFXOXVJRDBnZEhKaGJuTnBkR2x2YmtSMWNtRjBhVzl1SUNFOVBTQjFibVJsWm1sdVpXUWdQeUIwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRnT2lBeE1EQXdPMXh5WEc1Y2NseHVJQ0IwYUdsekxsOXpiR2xrWlhOb2IzZHpJRDBnVzEwN1hISmNiaUFnZEdocGN5NXlaV3h2WVdRb0tUdGNjbHh1ZlZ4eVhHNWNjbHh1U0c5MlpYSlRiR2xrWlhOb2IzZHpMbkJ5YjNSdmRIbHdaUzV5Wld4dllXUWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0F2THlCT2IzUmxPaUIwYUdseklHbHpJR04xY25KbGJuUnNlU0J1YjNRZ2NtVmhiR3g1SUdKbGFXNW5JSFZ6WldRdUlGZG9aVzRnWVNCd1lXZGxJR2x6SUd4dllXUmxaQ3hjY2x4dUlDQXZMeUJ0WVdsdUxtcHpJR2x6SUdwMWMzUWdjbVV0YVc1emRHRnVZMmx1WnlCMGFHVWdTRzkyWlhKVGJHbGtaWE5vYjNkelhISmNiaUFnZG1GeUlHOXNaRk5zYVdSbGMyaHZkM01nUFNCMGFHbHpMbDl6Ykdsa1pYTm9iM2R6SUh4OElGdGRPMXh5WEc0Z0lIUm9hWE11WDNOc2FXUmxjMmh2ZDNNZ1BTQmJYVHRjY2x4dUlDQWtLRndpTG1odmRtVnlMWE5zYVdSbGMyaHZkMXdpS1M1bFlXTm9LRnh5WEc0Z0lDQWdablZ1WTNScGIyNG9YeXdnWld4bGJXVnVkQ2tnZTF4eVhHNGdJQ0FnSUNCMllYSWdKR1ZzWlcxbGJuUWdQU0FrS0dWc1pXMWxiblFwTzF4eVhHNGdJQ0FnSUNCMllYSWdhVzVrWlhnZ1BTQjBhR2x6TGw5bWFXNWtTVzVUYkdsa1pYTm9iM2R6S0dWc1pXMWxiblFzSUc5c1pGTnNhV1JsYzJodmQzTXBPMXh5WEc0Z0lDQWdJQ0JwWmlBb2FXNWtaWGdnSVQwOUlDMHhLU0I3WEhKY2JpQWdJQ0FnSUNBZ2RtRnlJSE5zYVdSbGMyaHZkeUE5SUc5c1pGTnNhV1JsYzJodmQzTXVjM0JzYVdObEtHbHVaR1Y0TENBeEtWc3dYVHRjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDl6Ykdsa1pYTm9iM2R6TG5CMWMyZ29jMnhwWkdWemFHOTNLVHRjY2x4dUlDQWdJQ0FnZlNCbGJITmxJSHRjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDl6Ykdsa1pYTm9iM2R6TG5CMWMyZ29YSEpjYmlBZ0lDQWdJQ0FnSUNCdVpYY2dVMnhwWkdWemFHOTNLQ1JsYkdWdFpXNTBMQ0IwYUdsekxsOXpiR2xrWlhOb2IzZEVaV3hoZVN3Z2RHaHBjeTVmZEhKaGJuTnBkR2x2YmtSMWNtRjBhVzl1S1Z4eVhHNGdJQ0FnSUNBZ0lDazdYSEpjYmlBZ0lDQWdJSDFjY2x4dUlDQWdJSDB1WW1sdVpDaDBhR2x6S1Z4eVhHNGdJQ2s3WEhKY2JuMDdYSEpjYmx4eVhHNUliM1psY2xOc2FXUmxjMmh2ZDNNdWNISnZkRzkwZVhCbExsOW1hVzVrU1c1VGJHbGtaWE5vYjNkeklEMGdablZ1WTNScGIyNG9aV3hsYldWdWRDd2djMnhwWkdWemFHOTNjeWtnZTF4eVhHNGdJR1p2Y2lBb2RtRnlJR2tnUFNBd095QnBJRHdnYzJ4cFpHVnphRzkzY3k1c1pXNW5kR2c3SUdrZ0t6MGdNU2tnZTF4eVhHNGdJQ0FnYVdZZ0tHVnNaVzFsYm5RZ1BUMDlJSE5zYVdSbGMyaHZkM05iYVYwdVoyVjBSV3hsYldWdWRDZ3BLU0I3WEhKY2JpQWdJQ0FnSUhKbGRIVnliaUJwTzF4eVhHNGdJQ0FnZlZ4eVhHNGdJSDFjY2x4dUlDQnlaWFIxY200Z0xURTdYSEpjYm4wN1hISmNibHh5WEc1bWRXNWpkR2x2YmlCVGJHbGtaWE5vYjNjb0pHTnZiblJoYVc1bGNpd2djMnhwWkdWemFHOTNSR1ZzWVhrc0lIUnlZVzV6YVhScGIyNUVkWEpoZEdsdmJpa2dlMXh5WEc0Z0lIUm9hWE11WHlSamIyNTBZV2x1WlhJZ1BTQWtZMjl1ZEdGcGJtVnlPMXh5WEc0Z0lIUm9hWE11WDNOc2FXUmxjMmh2ZDBSbGJHRjVJRDBnYzJ4cFpHVnphRzkzUkdWc1lYazdYSEpjYmlBZ2RHaHBjeTVmZEhKaGJuTnBkR2x2YmtSMWNtRjBhVzl1SUQwZ2RISmhibk5wZEdsdmJrUjFjbUYwYVc5dU8xeHlYRzRnSUhSb2FYTXVYM1JwYldWdmRYUkpaQ0E5SUc1MWJHdzdYSEpjYmlBZ2RHaHBjeTVmYVcxaFoyVkpibVJsZUNBOUlEQTdYSEpjYmlBZ2RHaHBjeTVmSkdsdFlXZGxjeUE5SUZ0ZE8xeHlYRzVjY2x4dUlDQXZMeUJUWlhRZ2RYQWdZVzVrSUdOaFkyaGxJSEpsWm1WeVpXNWpaWE1nZEc4Z2FXMWhaMlZ6WEhKY2JpQWdkR2hwY3k1ZkpHTnZiblJoYVc1bGNpNW1hVzVrS0Z3aWFXMW5YQ0lwTG1WaFkyZ29YSEpjYmlBZ0lDQm1kVzVqZEdsdmJpaHBibVJsZUN3Z1pXeGxiV1Z1ZENrZ2UxeHlYRzRnSUNBZ0lDQjJZWElnSkdsdFlXZGxJRDBnSkNobGJHVnRaVzUwS1R0Y2NseHVJQ0FnSUNBZ0pHbHRZV2RsTG1OemN5aDdYSEpjYmlBZ0lDQWdJQ0FnY0c5emFYUnBiMjQ2SUZ3aVlXSnpiMngxZEdWY0lpeGNjbHh1SUNBZ0lDQWdJQ0IwYjNBNklGd2lNRndpTEZ4eVhHNGdJQ0FnSUNBZ0lHeGxablE2SUZ3aU1Gd2lMRnh5WEc0Z0lDQWdJQ0FnSUhwSmJtUmxlRG9nYVc1a1pYZ2dQVDA5SURBZ1B5QXlJRG9nTUNBdkx5QkdhWEp6ZENCcGJXRm5aU0J6YUc5MWJHUWdZbVVnYjI0Z2RHOXdYSEpjYmlBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnSUNCMGFHbHpMbDhrYVcxaFoyVnpMbkIxYzJnb0pHbHRZV2RsS1R0Y2NseHVJQ0FnSUgwdVltbHVaQ2gwYUdsektWeHlYRzRnSUNrN1hISmNibHh5WEc0Z0lDOHZJRVJsZEdWeWJXbHVaU0IzYUdWMGFHVnlJSFJ2SUdKcGJtUWdhVzUwWlhKaFkzUnBkbWwwZVZ4eVhHNGdJSFJvYVhNdVgyNTFiVWx0WVdkbGN5QTlJSFJvYVhNdVh5UnBiV0ZuWlhNdWJHVnVaM1JvTzF4eVhHNGdJR2xtSUNoMGFHbHpMbDl1ZFcxSmJXRm5aWE1nUEQwZ01Ta2djbVYwZFhKdU8xeHlYRzVjY2x4dUlDQXZMeUJDYVc1a0lHVjJaVzUwSUd4cGMzUmxibVZ5YzF4eVhHNGdJSFJvYVhNdVh5UmpiMjUwWVdsdVpYSXViMjRvWENKdGIzVnpaV1Z1ZEdWeVhDSXNJSFJvYVhNdVgyOXVSVzUwWlhJdVltbHVaQ2gwYUdsektTazdYSEpjYmlBZ2RHaHBjeTVmSkdOdmJuUmhhVzVsY2k1dmJpaGNJbTF2ZFhObGJHVmhkbVZjSWl3Z2RHaHBjeTVmYjI1TVpXRjJaUzVpYVc1a0tIUm9hWE1wS1R0Y2NseHVmVnh5WEc1Y2NseHVVMnhwWkdWemFHOTNMbkJ5YjNSdmRIbHdaUzVuWlhSRmJHVnRaVzUwSUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2NtVjBkWEp1SUhSb2FYTXVYeVJqYjI1MFlXbHVaWEl1WjJWMEtEQXBPMXh5WEc1OU8xeHlYRzVjY2x4dVUyeHBaR1Z6YUc5M0xuQnliM1J2ZEhsd1pTNW5aWFFrUld4bGJXVnVkQ0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUhKbGRIVnliaUIwYUdsekxsOGtZMjl1ZEdGcGJtVnlPMXh5WEc1OU8xeHlYRzVjY2x4dVUyeHBaR1Z6YUc5M0xuQnliM1J2ZEhsd1pTNWZiMjVGYm5SbGNpQTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJQzh2SUVacGNuTjBJSFJ5WVc1emFYUnBiMjRnYzJodmRXeGtJR2hoY0hCbGJpQndjbVYwZEhrZ2MyOXZiaUJoWm5SbGNpQm9iM1psY21sdVp5QnBiaUJ2Y21SbGNseHlYRzRnSUM4dklIUnZJR05zZFdVZ2RHaGxJSFZ6WlhJZ2FXNTBieUIzYUdGMElHbHpJR2hoY0hCbGJtbHVaMXh5WEc0Z0lIUm9hWE11WDNScGJXVnZkWFJKWkNBOUlITmxkRlJwYldWdmRYUW9kR2hwY3k1ZllXUjJZVzVqWlZOc2FXUmxjMmh2ZHk1aWFXNWtLSFJvYVhNcExDQTFNREFwTzF4eVhHNTlPMXh5WEc1Y2NseHVVMnhwWkdWemFHOTNMbkJ5YjNSdmRIbHdaUzVmYjI1TVpXRjJaU0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUdOc1pXRnlTVzUwWlhKMllXd29kR2hwY3k1ZmRHbHRaVzkxZEVsa0tUdGNjbHh1SUNCMGFHbHpMbDkwYVcxbGIzVjBTV1FnUFNCdWRXeHNPMXh5WEc1OU8xeHlYRzVjY2x4dVUyeHBaR1Z6YUc5M0xuQnliM1J2ZEhsd1pTNWZZV1IyWVc1alpWTnNhV1JsYzJodmR5QTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJSFJvYVhNdVgybHRZV2RsU1c1a1pYZ2dLejBnTVR0Y2NseHVJQ0IyWVhJZ2FUdGNjbHh1WEhKY2JpQWdMeThnVFc5MlpTQjBhR1VnYVcxaFoyVWdabkp2YlNBeUlITjBaWEJ6SUdGbmJ5QmtiM2R1SUhSdklIUm9aU0JpYjNSMGIyMGdlaTFwYm1SbGVDQmhibVFnYldGclpWeHlYRzRnSUM4dklHbDBJR2x1ZG1semFXSnNaVnh5WEc0Z0lHbG1JQ2gwYUdsekxsOXVkVzFKYldGblpYTWdQajBnTXlrZ2UxeHlYRzRnSUNBZ2FTQTlJSFYwYVd4cGRHbGxjeTUzY21Gd1NXNWtaWGdvZEdocGN5NWZhVzFoWjJWSmJtUmxlQ0F0SURJc0lIUm9hWE11WDI1MWJVbHRZV2RsY3lrN1hISmNiaUFnSUNCMGFHbHpMbDhrYVcxaFoyVnpXMmxkTG1OemN5aDdYSEpjYmlBZ0lDQWdJSHBKYm1SbGVEb2dNQ3hjY2x4dUlDQWdJQ0FnYjNCaFkybDBlVG9nTUZ4eVhHNGdJQ0FnZlNrN1hISmNiaUFnSUNCMGFHbHpMbDhrYVcxaFoyVnpXMmxkTG5abGJHOWphWFI1S0Z3aWMzUnZjRndpS1R0Y2NseHVJQ0I5WEhKY2JseHlYRzRnSUM4dklFMXZkbVVnZEdobElHbHRZV2RsSUdaeWIyMGdNU0J6ZEdWd2N5QmhaMjhnWkc5M2JpQjBieUIwYUdVZ2JXbGtaR3hsSUhvdGFXNWtaWGdnWVc1a0lHMWhhMlZjY2x4dUlDQXZMeUJwZENCamIyMXdiR1YwWld4NUlIWnBjMmxpYkdWY2NseHVJQ0JwWmlBb2RHaHBjeTVmYm5WdFNXMWhaMlZ6SUQ0OUlESXBJSHRjY2x4dUlDQWdJR2tnUFNCMWRHbHNhWFJwWlhNdWQzSmhjRWx1WkdWNEtIUm9hWE11WDJsdFlXZGxTVzVrWlhnZ0xTQXhMQ0IwYUdsekxsOXVkVzFKYldGblpYTXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHbHRZV2RsYzF0cFhTNWpjM01vZTF4eVhHNGdJQ0FnSUNCNlNXNWtaWGc2SURFc1hISmNiaUFnSUNBZ0lHOXdZV05wZEhrNklERmNjbHh1SUNBZ0lIMHBPMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHbHRZV2RsYzF0cFhTNTJaV3h2WTJsMGVTaGNJbk4wYjNCY0lpazdYSEpjYmlBZ2ZWeHlYRzVjY2x4dUlDQXZMeUJOYjNabElIUm9aU0JqZFhKeVpXNTBJR2x0WVdkbElIUnZJSFJvWlNCMGIzQWdlaTFwYm1SbGVDQmhibVFnWm1Ga1pTQnBkQ0JwYmx4eVhHNGdJSFJvYVhNdVgybHRZV2RsU1c1a1pYZ2dQU0IxZEdsc2FYUnBaWE11ZDNKaGNFbHVaR1Y0S0hSb2FYTXVYMmx0WVdkbFNXNWtaWGdzSUhSb2FYTXVYMjUxYlVsdFlXZGxjeWs3WEhKY2JpQWdkR2hwY3k1ZkpHbHRZV2RsYzF0MGFHbHpMbDlwYldGblpVbHVaR1Y0WFM1amMzTW9lMXh5WEc0Z0lDQWdla2x1WkdWNE9pQXlMRnh5WEc0Z0lDQWdiM0JoWTJsMGVUb2dNRnh5WEc0Z0lIMHBPMXh5WEc0Z0lIUm9hWE11WHlScGJXRm5aWE5iZEdocGN5NWZhVzFoWjJWSmJtUmxlRjB1ZG1Wc2IyTnBkSGtvWEhKY2JpQWdJQ0I3WEhKY2JpQWdJQ0FnSUc5d1lXTnBkSGs2SURGY2NseHVJQ0FnSUgwc1hISmNiaUFnSUNCMGFHbHpMbDkwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRzWEhKY2JpQWdJQ0JjSW1WaGMyVkpiazkxZEZGMVlXUmNJbHh5WEc0Z0lDazdYSEpjYmx4eVhHNGdJQzh2SUZOamFHVmtkV3hsSUc1bGVIUWdkSEpoYm5OcGRHbHZibHh5WEc0Z0lIUm9hWE11WDNScGJXVnZkWFJKWkNBOUlITmxkRlJwYldWdmRYUW9kR2hwY3k1ZllXUjJZVzVqWlZOc2FXUmxjMmh2ZHk1aWFXNWtLSFJvYVhNcExDQjBhR2x6TGw5emJHbGtaWE5vYjNkRVpXeGhlU2s3WEhKY2JuMDdYSEpjYmlJc0ltMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1FtRnpaVXh2WjI5VGEyVjBZMmc3WEhKY2JseHlYRzUyWVhJZ2RYUnBiSE1nUFNCeVpYRjFhWEpsS0Z3aUxpNHZkWFJwYkdsMGFXVnpMbXB6WENJcE8xeHlYRzVjY2x4dVpuVnVZM1JwYjI0Z1FtRnpaVXh2WjI5VGEyVjBZMmdvSkc1aGRpd2dKRzVoZGt4dloyOHNJR1p2Ym5SUVlYUm9LU0I3WEhKY2JpQWdkR2hwY3k1ZkpHNWhkaUE5SUNSdVlYWTdYSEpjYmlBZ2RHaHBjeTVmSkc1aGRreHZaMjhnUFNBa2JtRjJURzluYnp0Y2NseHVJQ0IwYUdsekxsOW1iMjUwVUdGMGFDQTlJR1p2Ym5SUVlYUm9PMXh5WEc1Y2NseHVJQ0IwYUdsekxsOTBaWGgwSUQwZ2RHaHBjeTVmSkc1aGRreHZaMjh1ZEdWNGRDZ3BPMXh5WEc0Z0lIUm9hWE11WDJselJtbHljM1JHY21GdFpTQTlJSFJ5ZFdVN1hISmNiaUFnZEdocGN5NWZhWE5OYjNWelpVOTJaWElnUFNCbVlXeHpaVHRjY2x4dUlDQjBhR2x6TGw5cGMwOTJaWEpPWVhaTWIyZHZJRDBnWm1Gc2MyVTdYSEpjYmx4eVhHNGdJSFJvYVhNdVgzVndaR0YwWlZSbGVIUlBabVp6WlhRb0tUdGNjbHh1SUNCMGFHbHpMbDkxY0dSaGRHVlRhWHBsS0NrN1hISmNiaUFnZEdocGN5NWZkWEJrWVhSbFJtOXVkRk5wZW1Vb0tUdGNjbHh1WEhKY2JpQWdMeThnUTNKbFlYUmxJR0VnS0hKbGJHRjBhWFpsSUhCdmMybDBhVzl1WldRcElHTnZiblJoYVc1bGNpQm1iM0lnZEdobElITnJaWFJqYUNCcGJuTnBaR1VnYjJZZ2RHaGxYSEpjYmlBZ0x5OGdibUYyTENCaWRYUWdiV0ZyWlNCemRYSmxJSFJvWVhRZ2FYUWdhWE1nUWtWSVNVNUVJR1YyWlhKNWRHaHBibWNnWld4elpTNGdSWFpsYm5SMVlXeHNlU3dnZDJVZ2QybHNiRnh5WEc0Z0lDOHZJR1J5YjNBZ2FuVnpkQ0IwYUdVZ2JtRjJJR3h2WjI4Z0tHNXZkQ0IwYUdVZ2JtRjJJR3hwYm10eklTa2dZbVZvYVc1a0lIUm9aU0JqWVc1MllYTXVYSEpjYmlBZ2RHaHBjeTVmSkdOdmJuUmhhVzVsY2lBOUlDUW9YQ0k4WkdsMlBsd2lLVnh5WEc0Z0lDQWdMbU56Y3loN1hISmNiaUFnSUNBZ0lIQnZjMmwwYVc5dU9pQmNJbUZpYzI5c2RYUmxYQ0lzWEhKY2JpQWdJQ0FnSUhSdmNEb2dYQ0l3Y0hoY0lpeGNjbHh1SUNBZ0lDQWdiR1ZtZERvZ1hDSXdjSGhjSWx4eVhHNGdJQ0FnZlNsY2NseHVJQ0FnSUM1d2NtVndaVzVrVkc4b2RHaHBjeTVmSkc1aGRpbGNjbHh1SUNBZ0lDNW9hV1JsS0NrN1hISmNibHh5WEc0Z0lIUm9hWE11WDJOeVpXRjBaVkExU1c1emRHRnVZMlVvS1R0Y2NseHVmVnh5WEc1Y2NseHVMeW9xWEhKY2JpQXFJRU55WldGMFpTQmhJRzVsZHlCd05TQnBibk4wWVc1alpTQmhibVFnWW1sdVpDQjBhR1VnWVhCd2NtOXdjbWxoZEdVZ1kyeGhjM01nYldWMGFHOWtjeUIwYnlCMGFHVmNjbHh1SUNvZ2FXNXpkR0Z1WTJVdUlGUm9hWE1nWVd4emJ5Qm1hV3hzY3lCcGJpQjBhR1VnY0NCd1lYSmhiV1YwWlhJZ2IyNGdkR2hsSUdOc1lYTnpJRzFsZEdodlpITWdLSE5sZEhWd0xGeHlYRzRnS2lCa2NtRjNMQ0JsZEdNdUtTQnpieUIwYUdGMElIUm9iM05sSUdaMWJtTjBhVzl1Y3lCallXNGdZbVVnWVNCc2FYUjBiR1VnYkdWemN5QjJaWEppYjNObElEb3BYSEpjYmlBcUwxeHlYRzVDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXVYMk55WldGMFpWQTFTVzV6ZEdGdVkyVWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0J1WlhjZ2NEVW9YSEpjYmlBZ0lDQm1kVzVqZEdsdmJpaHdLU0I3WEhKY2JpQWdJQ0FnSUhSb2FYTXVYM0FnUFNCd08xeHlYRzRnSUNBZ0lDQndMbkJ5Wld4dllXUWdQU0IwYUdsekxsOXdjbVZzYjJGa0xtSnBibVFvZEdocGN5d2djQ2s3WEhKY2JpQWdJQ0FnSUhBdWMyVjBkWEFnUFNCMGFHbHpMbDl6WlhSMWNDNWlhVzVrS0hSb2FYTXNJSEFwTzF4eVhHNGdJQ0FnSUNCd0xtUnlZWGNnUFNCMGFHbHpMbDlrY21GM0xtSnBibVFvZEdocGN5d2djQ2s3WEhKY2JpQWdJQ0I5TG1KcGJtUW9kR2hwY3lrc1hISmNiaUFnSUNCMGFHbHpMbDhrWTI5dWRHRnBibVZ5TG1kbGRDZ3dLVnh5WEc0Z0lDazdYSEpjYm4wN1hISmNibHh5WEc0dktpcGNjbHh1SUNvZ1JtbHVaQ0IwYUdVZ1pHbHpkR0Z1WTJVZ1puSnZiU0IwYUdVZ2RHOXdJR3hsWm5RZ2IyWWdkR2hsSUc1aGRpQjBieUIwYUdVZ1luSmhibVFnYkc5bmJ5ZHpJR0poYzJWc2FXNWxMbHh5WEc0Z0tpOWNjbHh1UW1GelpVeHZaMjlUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDkxY0dSaGRHVlVaWGgwVDJabWMyVjBJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnZG1GeUlHSmhjMlZzYVc1bFJHbDJJRDBnSkNoY0lqeGthWFkrWENJcFhISmNiaUFnSUNBdVkzTnpLSHRjY2x4dUlDQWdJQ0FnWkdsemNHeGhlVG9nWENKcGJteHBibVV0WW14dlkydGNJaXhjY2x4dUlDQWdJQ0FnZG1WeWRHbGpZV3hCYkdsbmJqb2dYQ0ppWVhObGJHbHVaVndpWEhKY2JpQWdJQ0I5S1Z4eVhHNGdJQ0FnTG5CeVpYQmxibVJVYnloMGFHbHpMbDhrYm1GMlRHOW5ieWs3WEhKY2JpQWdkbUZ5SUc1aGRrOW1abk5sZENBOUlIUm9hWE11WHlSdVlYWXViMlptYzJWMEtDazdYSEpjYmlBZ2RtRnlJR3h2WjI5Q1lYTmxiR2x1WlU5bVpuTmxkQ0E5SUdKaGMyVnNhVzVsUkdsMkxtOW1abk5sZENncE8xeHlYRzRnSUhSb2FYTXVYM1JsZUhSUFptWnpaWFFnUFNCN1hISmNiaUFnSUNCMGIzQTZJR3h2WjI5Q1lYTmxiR2x1WlU5bVpuTmxkQzUwYjNBZ0xTQnVZWFpQWm1aelpYUXVkRzl3TEZ4eVhHNGdJQ0FnYkdWbWREb2diRzluYjBKaGMyVnNhVzVsVDJabWMyVjBMbXhsWm5RZ0xTQnVZWFpQWm1aelpYUXViR1ZtZEZ4eVhHNGdJSDA3WEhKY2JpQWdZbUZ6Wld4cGJtVkVhWFl1Y21WdGIzWmxLQ2s3WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dSbWx1WkNCMGFHVWdZbTkxYm1ScGJtY2dZbTk0SUc5bUlIUm9aU0JpY21GdVpDQnNiMmR2SUdsdUlIUm9aU0J1WVhZdUlGUm9hWE1nWW1KdmVDQmpZVzRnZEdobGJpQmlaVnh5WEc0Z0tpQjFjMlZrSUhSdklHTnZiblJ5YjJ3Z2QyaGxiaUIwYUdVZ1kzVnljMjl5SUhOb2IzVnNaQ0JpWlNCaElIQnZhVzUwWlhJdVhISmNiaUFxTDF4eVhHNUNZWE5sVEc5bmIxTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgyTmhiR04xYkdGMFpVNWhka3h2WjI5Q2IzVnVaSE1nUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNCMllYSWdibUYyVDJabWMyVjBJRDBnZEdocGN5NWZKRzVoZGk1dlptWnpaWFFvS1R0Y2NseHVJQ0IyWVhJZ2JHOW5iMDltWm5ObGRDQTlJSFJvYVhNdVh5UnVZWFpNYjJkdkxtOW1abk5sZENncE8xeHlYRzRnSUhSb2FYTXVYMnh2WjI5Q1ltOTRJRDBnZTF4eVhHNGdJQ0FnZVRvZ2JHOW5iMDltWm5ObGRDNTBiM0FnTFNCdVlYWlBabVp6WlhRdWRHOXdMRnh5WEc0Z0lDQWdlRG9nYkc5bmIwOW1abk5sZEM1c1pXWjBJQzBnYm1GMlQyWm1jMlYwTG14bFpuUXNYSEpjYmlBZ0lDQjNPaUIwYUdsekxsOGtibUYyVEc5bmJ5NXZkWFJsY2xkcFpIUm9LQ2tzSUM4dklFVjRZMngxWkdVZ2JXRnlaMmx1SUdaeWIyMGdkR2hsSUdKaWIzaGNjbHh1SUNBZ0lHZzZJSFJvYVhNdVh5UnVZWFpNYjJkdkxtOTFkR1Z5U0dWcFoyaDBLQ2tnTHk4Z1RHbHVhM01nWVhKbGJpZDBJR05zYVdOcllXSnNaU0J2YmlCdFlYSm5hVzVjY2x4dUlDQjlPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlGVndaR0YwWlNCMGFHVWdaR2x0Wlc1emFXOXVjeUIwYnlCdFlYUmphQ0IwYUdVZ2JtRjJJQzBnWlhoamJIVmthVzVuSUdGdWVTQnRZWEpuYVc0c0lIQmhaR1JwYm1jZ0pseHlYRzRnS2lCaWIzSmtaWEl1WEhKY2JpQXFMMXh5WEc1Q1lYTmxURzluYjFOclpYUmphQzV3Y205MGIzUjVjR1V1WDNWd1pHRjBaVk5wZW1VZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQjBhR2x6TGw5M2FXUjBhQ0E5SUhSb2FYTXVYeVJ1WVhZdWFXNXVaWEpYYVdSMGFDZ3BPMXh5WEc0Z0lIUm9hWE11WDJobGFXZG9kQ0E5SUhSb2FYTXVYeVJ1WVhZdWFXNXVaWEpJWldsbmFIUW9LVHRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQkhjbUZpSUhSb1pTQm1iMjUwSUhOcGVtVWdabkp2YlNCMGFHVWdZbkpoYm1RZ2JHOW5ieUJzYVc1ckxpQlVhR2x6SUcxaGEyVnpJSFJvWlNCbWIyNTBJSE5wZW1VZ2IyWWdkR2hsWEhKY2JpQXFJSE5yWlhSamFDQnlaWE53YjI1emFYWmxMbHh5WEc0Z0tpOWNjbHh1UW1GelpVeHZaMjlUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDkxY0dSaGRHVkdiMjUwVTJsNlpTQTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJSFJvYVhNdVgyWnZiblJUYVhwbElEMGdkR2hwY3k1ZkpHNWhka3h2WjI4dVkzTnpLRndpWm05dWRGTnBlbVZjSWlrdWNtVndiR0ZqWlNoY0luQjRYQ0lzSUZ3aVhDSXBPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlGZG9aVzRnZEdobElHSnliM2R6WlhJZ2FYTWdjbVZ6YVhwbFpDd2djbVZqWVd4amRXeGhkR1VnWVd4c0lIUm9aU0J1WldObGMzTmhjbmtnYzNSaGRITWdjMjhnZEdoaGRDQjBhR1ZjY2x4dUlDb2djMnRsZEdOb0lHTmhiaUJpWlNCeVpYTndiMjV6YVhabExpQlVhR1VnYkc5bmJ5QnBiaUIwYUdVZ2MydGxkR05vSUhOb2IzVnNaQ0JCVEZkQldWTWdaWGhoWTNSc2VTQnRZWFJqYUZ4eVhHNGdLaUIwYUdVZ1luSmhibWNnYkc5bmJ5QnNhVzVySUhSb1pTQklWRTFNTGx4eVhHNGdLaTljY2x4dVFtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5dmJsSmxjMmw2WlNBOUlHWjFibU4wYVc5dUtIQXBJSHRjY2x4dUlDQjBhR2x6TGw5MWNHUmhkR1ZUYVhwbEtDazdYSEpjYmlBZ2RHaHBjeTVmZFhCa1lYUmxSbTl1ZEZOcGVtVW9LVHRjY2x4dUlDQjBhR2x6TGw5MWNHUmhkR1ZVWlhoMFQyWm1jMlYwS0NrN1hISmNiaUFnZEdocGN5NWZZMkZzWTNWc1lYUmxUbUYyVEc5bmIwSnZkVzVrY3lncE8xeHlYRzRnSUhBdWNtVnphWHBsUTJGdWRtRnpLSFJvYVhNdVgzZHBaSFJvTENCMGFHbHpMbDlvWldsbmFIUXBPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlGVndaR0YwWlNCMGFHVWdYMmx6VFc5MWMyVlBkbVZ5SUhCeWIzQmxjblI1TGx4eVhHNGdLaTljY2x4dVFtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5elpYUk5iM1Z6WlU5MlpYSWdQU0JtZFc1amRHbHZiaWhwYzAxdmRYTmxUM1psY2lrZ2UxeHlYRzRnSUhSb2FYTXVYMmx6VFc5MWMyVlBkbVZ5SUQwZ2FYTk5iM1Z6WlU5MlpYSTdYSEpjYm4wN1hISmNibHh5WEc0dktpcGNjbHh1SUNvZ1NXWWdkR2hsSUdOMWNuTnZjaUJwY3lCelpYUWdkRzhnWVNCd2IybHVkR1Z5TENCbWIzSjNZWEprSUdGdWVTQmpiR2xqYXlCbGRtVnVkSE1nZEc4Z2RHaGxJRzVoZGlCc2IyZHZMbHh5WEc0Z0tpQlVhR2x6SUhKbFpIVmpaWE1nZEdobElHNWxaV1FnWm05eUlIUm9aU0JqWVc1MllYTWdkRzhnWkc4Z1lXNTVJRUZLUVZndGVTQnpkSFZtWmk1Y2NseHVJQ292WEhKY2JrSmhjMlZNYjJkdlUydGxkR05vTG5CeWIzUnZkSGx3WlM1ZmIyNURiR2xqYXlBOUlHWjFibU4wYVc5dUtHVXBJSHRjY2x4dUlDQnBaaUFvZEdocGN5NWZhWE5QZG1WeVRtRjJURzluYnlrZ2RHaHBjeTVmSkc1aGRreHZaMjh1ZEhKcFoyZGxjaWhsS1R0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJDWVhObElIQnlaV3h2WVdRZ2JXVjBhRzlrSUhSb1lYUWdhblZ6ZENCc2IyRmtjeUIwYUdVZ2JtVmpaWE56WVhKNUlHWnZiblJjY2x4dUlDb3ZYSEpjYmtKaGMyVk1iMmR2VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmY0hKbGJHOWhaQ0E5SUdaMWJtTjBhVzl1S0hBcElIdGNjbHh1SUNCMGFHbHpMbDltYjI1MElEMGdjQzVzYjJGa1JtOXVkQ2gwYUdsekxsOW1iMjUwVUdGMGFDazdYSEpjYm4wN1hISmNibHh5WEc0dktpcGNjbHh1SUNvZ1FtRnpaU0J6WlhSMWNDQnRaWFJvYjJRZ2RHaGhkQ0JrYjJWeklITnZiV1VnYUdWaGRua2diR2xtZEdsdVp5NGdTWFFnYUdsa1pYTWdkR2hsSUc1aGRpQmljbUZ1WkNCc2IyZHZYSEpjYmlBcUlHRnVaQ0J5WlhabFlXeHpJSFJvWlNCallXNTJZWE11SUVsMElHRnNjMjhnYzJWMGN5QjFjQ0JoSUd4dmRDQnZaaUIwYUdVZ2FXNTBaWEp1WVd3Z2RtRnlhV0ZpYkdWeklHRnVaRnh5WEc0Z0tpQmpZVzUyWVhNZ1pYWmxiblJ6TGx4eVhHNGdLaTljY2x4dVFtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5elpYUjFjQ0E5SUdaMWJtTjBhVzl1S0hBcElIdGNjbHh1SUNCMllYSWdjbVZ1WkdWeVpYSWdQU0J3TG1OeVpXRjBaVU5oYm5aaGN5aDBhR2x6TGw5M2FXUjBhQ3dnZEdocGN5NWZhR1ZwWjJoMEtUdGNjbHh1SUNCMGFHbHpMbDhrWTJGdWRtRnpJRDBnSkNoeVpXNWtaWEpsY2k1allXNTJZWE1wTzF4eVhHNWNjbHh1SUNBdkx5QlRhRzkzSUhSb1pTQmpZVzUyWVhNZ1lXNWtJR2hwWkdVZ2RHaGxJR3h2WjI4dUlGVnphVzVuSUhOb2IzY3ZhR2xrWlNCdmJpQjBhR1VnYkc5bmJ5QjNhV3hzSUdOaGRYTmxYSEpjYmlBZ0x5OGdhbEYxWlhKNUlIUnZJRzExWTJzZ2QybDBhQ0IwYUdVZ2NHOXphWFJwYjI1cGJtY3NJSGRvYVdOb0lHbHpJSFZ6WldRZ2RHOGdZMkZzWTNWc1lYUmxJSGRvWlhKbElIUnZYSEpjYmlBZ0x5OGdaSEpoZHlCMGFHVWdZMkZ1ZG1GeklIUmxlSFF1SUVsdWMzUmxZV1FzSUdwMWMzUWdjSFZ6YUNCMGFHVWdiRzluYnlCaVpXaHBibVFnZEdobElHTmhiblpoY3k0Z1ZHaHBjMXh5WEc0Z0lDOHZJR0ZzYkc5M2N5QnRZV3RsY3lCcGRDQnpieUIwYUdVZ1kyRnVkbUZ6SUdseklITjBhV3hzSUdKbGFHbHVaQ0IwYUdVZ2JtRjJJR3hwYm10ekxseHlYRzRnSUhSb2FYTXVYeVJqYjI1MFlXbHVaWEl1YzJodmR5Z3BPMXh5WEc0Z0lIUm9hWE11WHlSdVlYWk1iMmR2TG1OemN5aGNJbnBKYm1SbGVGd2lMQ0F0TVNrN1hISmNibHh5WEc0Z0lDOHZJRlJvWlhKbElHbHpiaWQwSUdFZ1oyOXZaQ0IzWVhrZ2RHOGdZMmhsWTJzZ2QyaGxkR2hsY2lCMGFHVWdjMnRsZEdOb0lHaGhjeUIwYUdVZ2JXOTFjMlVnYjNabGNseHlYRzRnSUM4dklHbDBMaUJ3TG0xdmRYTmxXQ0FtSUhBdWJXOTFjMlZaSUdGeVpTQnBibWwwYVdGc2FYcGxaQ0IwYnlBb01Dd2dNQ2tzSUdGdVpDQndMbVp2WTNWelpXUWdhWE51SjNSY2NseHVJQ0F2THlCaGJIZGhlWE1nY21Wc2FXRmliR1V1WEhKY2JpQWdkR2hwY3k1ZkpHTmhiblpoY3k1dmJpaGNJbTF2ZFhObGIzWmxjbHdpTENCMGFHbHpMbDl6WlhSTmIzVnpaVTkyWlhJdVltbHVaQ2gwYUdsekxDQjBjblZsS1NrN1hISmNiaUFnZEdocGN5NWZKR05oYm5aaGN5NXZiaWhjSW0xdmRYTmxiM1YwWENJc0lIUm9hWE11WDNObGRFMXZkWE5sVDNabGNpNWlhVzVrS0hSb2FYTXNJR1poYkhObEtTazdYSEpjYmx4eVhHNGdJQzh2SUVadmNuZGhjbVFnYlc5MWMyVWdZMnhwWTJ0eklIUnZJSFJvWlNCdVlYWWdiRzluYjF4eVhHNGdJSFJvYVhNdVh5UmpZVzUyWVhNdWIyNG9YQ0pqYkdsamExd2lMQ0IwYUdsekxsOXZia05zYVdOckxtSnBibVFvZEdocGN5a3BPMXh5WEc1Y2NseHVJQ0F2THlCWGFHVnVJSFJvWlNCM2FXNWtiM2NnYVhNZ2NtVnphWHBsWkN3Z2RHVjRkQ0FtSUdOaGJuWmhjeUJ6YVhwcGJtY2dZVzVrSUhCc1lXTmxiV1Z1ZENCdVpXVmtJSFJ2SUdKbFhISmNiaUFnTHk4Z2NtVmpZV3hqZFd4aGRHVmtMaUJVYUdVZ2MybDBaU0JwY3lCeVpYTndiMjV6YVhabExDQnpieUIwYUdVZ2FXNTBaWEpoWTNScGRtVWdZMkZ1ZG1GeklITm9iM1ZzWkNCaVpWeHlYRzRnSUM4dklIUnZieUZjY2x4dUlDQWtLSGRwYm1SdmR5a3ViMjRvWENKeVpYTnBlbVZjSWl3Z2RHaHBjeTVmYjI1U1pYTnBlbVV1WW1sdVpDaDBhR2x6TENCd0tTazdYSEpjYm4wN1hISmNibHh5WEc0dktpcGNjbHh1SUNvZ1FtRnpaU0JrY21GM0lHMWxkR2h2WkNCMGFHRjBJR052Ym5SeWIyeHpJSGRvWlhSb1pYSWdiM0lnYm05MElIUm9aU0JqZFhKemIzSWdhWE1nWVNCd2IybHVkR1Z5TGlCSmRGeHlYRzRnS2lCemFHOTFiR1FnYjI1c2VTQmlaU0JoSUhCdmFXNTBaWElnZDJobGJpQjBhR1VnYlc5MWMyVWdhWE1nYjNabGNpQjBhR1VnYm1GMklHSnlZVzVrSUd4dloyOHVYSEpjYmlBcUwxeHlYRzVDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXVYMlJ5WVhjZ1BTQm1kVzVqZEdsdmJpaHdLU0I3WEhKY2JpQWdhV1lnS0hSb2FYTXVYMmx6VFc5MWMyVlBkbVZ5S1NCN1hISmNiaUFnSUNCMllYSWdhWE5QZG1WeVRHOW5ieUE5SUhWMGFXeHpMbWx6U1c1U1pXTjBLSEF1Ylc5MWMyVllMQ0J3TG0xdmRYTmxXU3dnZEdocGN5NWZiRzluYjBKaWIzZ3BPMXh5WEc0Z0lDQWdhV1lnS0NGMGFHbHpMbDlwYzA5MlpYSk9ZWFpNYjJkdklDWW1JR2x6VDNabGNreHZaMjhwSUh0Y2NseHVJQ0FnSUNBZ2RHaHBjeTVmYVhOUGRtVnlUbUYyVEc5bmJ5QTlJSFJ5ZFdVN1hISmNiaUFnSUNBZ0lIUm9hWE11WHlSallXNTJZWE11WTNOektGd2lZM1Z5YzI5eVhDSXNJRndpY0c5cGJuUmxjbHdpS1R0Y2NseHVJQ0FnSUgwZ1pXeHpaU0JwWmlBb2RHaHBjeTVmYVhOUGRtVnlUbUYyVEc5bmJ5QW1KaUFoYVhOUGRtVnlURzluYnlrZ2UxeHlYRzRnSUNBZ0lDQjBhR2x6TGw5cGMwOTJaWEpPWVhaTWIyZHZJRDBnWm1Gc2MyVTdYSEpjYmlBZ0lDQWdJSFJvYVhNdVh5UmpZVzUyWVhNdVkzTnpLRndpWTNWeWMyOXlYQ0lzSUZ3aWFXNXBkR2xoYkZ3aUtUdGNjbHh1SUNBZ0lIMWNjbHh1SUNCOVhISmNibjA3WEhKY2JpSXNJbTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdVMnRsZEdOb08xeHlYRzVjY2x4dWRtRnlJRUppYjNoVVpYaDBJRDBnY21WeGRXbHlaU2hjSW5BMUxXSmliM2d0WVd4cFoyNWxaQzEwWlhoMFhDSXBPMXh5WEc1MllYSWdRbUZ6WlV4dloyOVRhMlYwWTJnZ1BTQnlaWEYxYVhKbEtGd2lMaTlpWVhObExXeHZaMjh0YzJ0bGRHTm9MbXB6WENJcE8xeHlYRzUyWVhJZ1UybHVSMlZ1WlhKaGRHOXlJRDBnY21WeGRXbHlaU2hjSWk0dloyVnVaWEpoZEc5eWN5OXphVzR0WjJWdVpYSmhkRzl5TG1welhDSXBPMXh5WEc1Y2NseHVkbUZ5SUhWMGFXeHpJRDBnY21WeGRXbHlaU2hjSWk0dUwzVjBhV3hwZEdsbGN5NXFjMXdpS1R0Y2NseHVYSEpjYmxOclpYUmphQzV3Y205MGIzUjVjR1VnUFNCUFltcGxZM1F1WTNKbFlYUmxLRUpoYzJWTWIyZHZVMnRsZEdOb0xuQnliM1J2ZEhsd1pTazdYSEpjYmx4eVhHNW1kVzVqZEdsdmJpQlRhMlYwWTJnb0pHNWhkaXdnSkc1aGRreHZaMjhwSUh0Y2NseHVJQ0JDWVhObFRHOW5iMU5yWlhSamFDNWpZV3hzS0hSb2FYTXNJQ1J1WVhZc0lDUnVZWFpNYjJkdkxDQmNJaTR1TDJadmJuUnpMMkpwWjE5cWIyaHVMWGRsWW1admJuUXVkSFJtWENJcE8xeHlYRzU5WEhKY2JseHlYRzVUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDl2YmxKbGMybDZaU0E5SUdaMWJtTjBhVzl1S0hBcElIdGNjbHh1SUNCQ1lYTmxURzluYjFOclpYUmphQzV3Y205MGIzUjVjR1V1WDI5dVVtVnphWHBsTG1OaGJHd29kR2hwY3l3Z2NDazdYSEpjYmlBZ2RHaHBjeTVmYzNCaFkybHVaeUE5SUhWMGFXeHpMbTFoY0NoMGFHbHpMbDltYjI1MFUybDZaU3dnTWpBc0lEUXdMQ0F5TENBMUxDQjdYSEpjYmlBZ0lDQmpiR0Z0Y0RvZ2RISjFaU3hjY2x4dUlDQWdJSEp2ZFc1a09pQjBjblZsWEhKY2JpQWdmU2s3WEhKY2JpQWdMeThnVlhCa1lYUmxJSFJvWlNCaVltOTRWR1Y0ZEN3Z2NHeGhZMlVnYjNabGNpQjBhR1VnYm1GMklIUmxlSFFnYkc5bmJ5QmhibVFnZEdobGJpQnphR2xtZENCcGRITmNjbHh1SUNBdkx5QmhibU5vYjNJZ1ltRmpheUIwYnlBb1kyVnVkR1Z5TENCalpXNTBaWElwSUhkb2FXeGxJSEJ5WlhObGNuWnBibWNnZEdobElIUmxlSFFnY0c5emFYUnBiMjVjY2x4dUlDQjBhR2x6TGw5aVltOTRWR1Y0ZEZ4eVhHNGdJQ0FnTG5ObGRGUmxlSFFvZEdocGN5NWZkR1Y0ZENsY2NseHVJQ0FnSUM1elpYUlVaWGgwVTJsNlpTaDBhR2x6TGw5bWIyNTBVMmw2WlNsY2NseHVJQ0FnSUM1elpYUkJibU5vYjNJb1FtSnZlRlJsZUhRdVFVeEpSMDR1UWs5WVgweEZSbFFzSUVKaWIzaFVaWGgwTGtKQlUwVk1TVTVGTGtGTVVFaEJRa1ZVU1VNcFhISmNiaUFnSUNBdWMyVjBVRzl6YVhScGIyNG9kR2hwY3k1ZmRHVjRkRTltWm5ObGRDNXNaV1owTENCMGFHbHpMbDkwWlhoMFQyWm1jMlYwTG5SdmNDbGNjbHh1SUNBZ0lDNXpaWFJCYm1Ob2IzSW9RbUp2ZUZSbGVIUXVRVXhKUjA0dVFrOVlYME5GVGxSRlVpd2dRbUp2ZUZSbGVIUXVRa0ZUUlV4SlRrVXVRazlZWDBORlRsUkZVaXdnZEhKMVpTazdYSEpjYmlBZ2RHaHBjeTVmWkhKaGQxTjBZWFJwYjI1aGNubE1iMmR2S0hBcE8xeHlYRzRnSUhSb2FYTXVYM0J2YVc1MGN5QTlJSFJvYVhNdVgySmliM2hVWlhoMExtZGxkRlJsZUhSUWIybHVkSE1vS1R0Y2NseHVJQ0IwYUdsekxsOXBjMFpwY25OMFJuSmhiV1VnUFNCMGNuVmxPMXh5WEc1OU8xeHlYRzVjY2x4dVUydGxkR05vTG5CeWIzUnZkSGx3WlM1ZlpISmhkMU4wWVhScGIyNWhjbmxNYjJkdklEMGdablZ1WTNScGIyNG9jQ2tnZTF4eVhHNGdJSEF1WW1GamEyZHliM1Z1WkNneU5UVXBPMXh5WEc0Z0lIQXVjM1J5YjJ0bEtESTFOU2s3WEhKY2JpQWdjQzVtYVd4c0tGd2lJekJCTURBd1FWd2lLVHRjY2x4dUlDQndMbk4wY205clpWZGxhV2RvZENneUtUdGNjbHh1SUNCMGFHbHpMbDlpWW05NFZHVjRkQzVrY21GM0tDazdYSEpjYm4wN1hISmNibHh5WEc1VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5elpYUjFjQ0E5SUdaMWJtTjBhVzl1S0hBcElIdGNjbHh1SUNCQ1lYTmxURzluYjFOclpYUmphQzV3Y205MGIzUjVjR1V1WDNObGRIVndMbU5oYkd3b2RHaHBjeXdnY0NrN1hISmNibHh5WEc0Z0lDOHZJRU55WldGMFpTQmhJRUppYjNoQmJHbG5ibVZrVkdWNGRDQnBibk4wWVc1alpTQjBhR0YwSUhkcGJHd2dZbVVnZFhObFpDQm1iM0lnWkhKaGQybHVaeUJoYm1SY2NseHVJQ0F2THlCeWIzUmhkR2x1WnlCMFpYaDBYSEpjYmlBZ2RHaHBjeTVmWW1KdmVGUmxlSFFnUFNCdVpYY2dRbUp2ZUZSbGVIUW9kR2hwY3k1ZlptOXVkQ3dnZEdocGN5NWZkR1Y0ZEN3Z2RHaHBjeTVmWm05dWRGTnBlbVVzSURBc0lEQXNJSEFwTzF4eVhHNWNjbHh1SUNBdkx5QklZVzVrYkdVZ2RHaGxJR2x1YVhScFlXd2djMlYwZFhBZ1lua2dkSEpwWjJkbGNtbHVaeUJoSUhKbGMybDZaVnh5WEc0Z0lIUm9hWE11WDI5dVVtVnphWHBsS0hBcE8xeHlYRzVjY2x4dUlDQXZMeUJFY21GM0lIUm9aU0J6ZEdGMGFXOXVZWEo1SUd4dloyOWNjbHh1SUNCMGFHbHpMbDlrY21GM1UzUmhkR2x2Ym1GeWVVeHZaMjhvY0NrN1hISmNibHh5WEc0Z0lDOHZJRk4wWVhKMElIUm9aU0J6YVc0Z1oyVnVaWEpoZEc5eUlHRjBJR2wwY3lCdFlYZ2dkbUZzZFdWY2NseHVJQ0IwYUdsekxsOTBhSEpsYzJodmJHUkhaVzVsY21GMGIzSWdQU0J1WlhjZ1UybHVSMlZ1WlhKaGRHOXlLSEFzSURBc0lERXNJREF1TURJc0lIQXVVRWtnTHlBeUtUdGNjbHh1ZlR0Y2NseHVYSEpjYmxOclpYUmphQzV3Y205MGIzUjVjR1V1WDJSeVlYY2dQU0JtZFc1amRHbHZiaWh3S1NCN1hISmNiaUFnUW1GelpVeHZaMjlUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDlrY21GM0xtTmhiR3dvZEdocGN5d2djQ2s3WEhKY2JpQWdhV1lnS0NGMGFHbHpMbDlwYzAxdmRYTmxUM1psY2lCOGZDQWhkR2hwY3k1ZmFYTlBkbVZ5VG1GMlRHOW5ieWtnY21WMGRYSnVPMXh5WEc1Y2NseHVJQ0F2THlCWGFHVnVJSFJvWlNCMFpYaDBJR2x6SUdGaWIzVjBJSFJ2SUdKbFkyOXRaU0JoWTNScGRtVWdabTl5SUhSb1pTQm1hWEp6ZENCMGFXMWxMQ0JqYkdWaGNseHlYRzRnSUM4dklIUm9aU0J6ZEdGMGFXOXVZWEo1SUd4dloyOGdkR2hoZENCM1lYTWdjSEpsZG1sdmRYTnNlU0JrY21GM2JpNWNjbHh1SUNCcFppQW9kR2hwY3k1ZmFYTkdhWEp6ZEVaeVlXMWxLU0I3WEhKY2JpQWdJQ0J3TG1KaFkydG5jbTkxYm1Rb01qVTFLVHRjY2x4dUlDQWdJSFJvYVhNdVgybHpSbWx5YzNSR2NtRnRaU0E5SUdaaGJITmxPMXh5WEc0Z0lIMWNjbHh1WEhKY2JpQWdhV1lnS0hSb2FYTXVYMlp2Ym5SVGFYcGxJRDRnTXpBcElIdGNjbHh1SUNBZ0lIUm9hWE11WDNSb2NtVnphRzlzWkVkbGJtVnlZWFJ2Y2k1elpYUkNiM1Z1WkhNb01DNHlJQ29nZEdocGN5NWZZbUp2ZUZSbGVIUXVhR1ZwWjJoMExDQXdMalEzSUNvZ2RHaHBjeTVmWW1KdmVGUmxlSFF1YUdWcFoyaDBLVHRjY2x4dUlDQjlJR1ZzYzJVZ2UxeHlYRzRnSUNBZ2RHaHBjeTVmZEdoeVpYTm9iMnhrUjJWdVpYSmhkRzl5TG5ObGRFSnZkVzVrY3lnd0xqSWdLaUIwYUdsekxsOWlZbTk0VkdWNGRDNW9aV2xuYUhRc0lEQXVOaUFxSUhSb2FYTXVYMkppYjNoVVpYaDBMbWhsYVdkb2RDazdYSEpjYmlBZ2ZWeHlYRzRnSUhaaGNpQmthWE4wWVc1alpWUm9jbVZ6YUc5c1pDQTlJSFJvYVhNdVgzUm9jbVZ6YUc5c1pFZGxibVZ5WVhSdmNpNW5aVzVsY21GMFpTZ3BPMXh5WEc1Y2NseHVJQ0J3TG1KaFkydG5jbTkxYm1Rb01qVTFMQ0F4TURBcE8xeHlYRzRnSUhBdWMzUnliMnRsVjJWcFoyaDBLREVwTzF4eVhHNGdJR1p2Y2lBb2RtRnlJR2tnUFNBd095QnBJRHdnZEdocGN5NWZjRzlwYm5SekxteGxibWQwYURzZ2FTQXJQU0F4S1NCN1hISmNiaUFnSUNCMllYSWdjRzlwYm5ReElEMGdkR2hwY3k1ZmNHOXBiblJ6VzJsZE8xeHlYRzRnSUNBZ1ptOXlJQ2gyWVhJZ2FpQTlJR2tnS3lBeE95QnFJRHdnZEdocGN5NWZjRzlwYm5SekxteGxibWQwYURzZ2FpQXJQU0F4S1NCN1hISmNiaUFnSUNBZ0lIWmhjaUJ3YjJsdWRESWdQU0IwYUdsekxsOXdiMmx1ZEhOYmFsMDdYSEpjYmlBZ0lDQWdJSFpoY2lCa2FYTjBJRDBnY0M1a2FYTjBLSEJ2YVc1ME1TNTRMQ0J3YjJsdWRERXVlU3dnY0c5cGJuUXlMbmdzSUhCdmFXNTBNaTU1S1R0Y2NseHVJQ0FnSUNBZ2FXWWdLR1JwYzNRZ1BDQmthWE4wWVc1alpWUm9jbVZ6YUc5c1pDa2dlMXh5WEc0Z0lDQWdJQ0FnSUhBdWJtOVRkSEp2YTJVb0tUdGNjbHh1SUNBZ0lDQWdJQ0J3TG1acGJHd29YQ0p5WjJKaEtERTJOU3dnTUN3Z01UY3pMQ0F3TGpJMUtWd2lLVHRjY2x4dUlDQWdJQ0FnSUNCd0xtVnNiR2x3YzJVb0tIQnZhVzUwTVM1NElDc2djRzlwYm5ReUxuZ3BJQzhnTWl3Z0tIQnZhVzUwTVM1NUlDc2djRzlwYm5ReUxua3BJQzhnTWl3Z1pHbHpkQ3dnWkdsemRDazdYSEpjYmx4eVhHNGdJQ0FnSUNBZ0lIQXVjM1J5YjJ0bEtGd2ljbWRpWVNneE5qVXNJREFzSURFM015d2dNQzR5TlNsY0lpazdYSEpjYmlBZ0lDQWdJQ0FnY0M1dWIwWnBiR3dvS1R0Y2NseHVJQ0FnSUNBZ0lDQndMbXhwYm1Vb2NHOXBiblF4TG5nc0lIQnZhVzUwTVM1NUxDQndiMmx1ZERJdWVDd2djRzlwYm5ReUxua3BPMXh5WEc0Z0lDQWdJQ0I5WEhKY2JpQWdJQ0I5WEhKY2JpQWdmVnh5WEc1OU8xeHlYRzRpTENKdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUh0Y2NseHVJQ0JPYjJselpVZGxibVZ5WVhSdmNqRkVPaUJPYjJselpVZGxibVZ5WVhSdmNqRkVMRnh5WEc0Z0lFNXZhWE5sUjJWdVpYSmhkRzl5TWtRNklFNXZhWE5sUjJWdVpYSmhkRzl5TWtSY2NseHVmVHRjY2x4dVhISmNiblpoY2lCMWRHbHNjeUE5SUhKbGNYVnBjbVVvWENJdUxpOHVMaTkxZEdsc2FYUnBaWE11YW5OY0lpazdYSEpjYmx4eVhHNHZMeUF0TFNBeFJDQk9iMmx6WlNCSFpXNWxjbUYwYjNJZ0xTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExWeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFRWdkWFJwYkdsMGVTQmpiR0Z6Y3lCbWIzSWdaMlZ1WlhKaGRHbHVaeUJ1YjJselpTQjJZV3gxWlhOY2NseHVJQ29nUUdOdmJuTjBjblZqZEc5eVhISmNiaUFxSUVCd1lYSmhiU0I3YjJKcVpXTjBmU0J3SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdVbVZtWlhKbGJtTmxJSFJ2SUdFZ2NEVWdjMnRsZEdOb1hISmNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0JiYldsdVBUQmRJQ0FnSUNBZ0lDQWdUV2x1YVcxMWJTQjJZV3gxWlNCbWIzSWdkR2hsSUc1dmFYTmxYSEpjYmlBcUlFQndZWEpoYlNCN2JuVnRZbVZ5ZlNCYmJXRjRQVEZkSUNBZ0lDQWdJQ0FnVFdGNGFXMTFiU0IyWVd4MVpTQm1iM0lnZEdobElHNXZhWE5sWEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQmJhVzVqY21WdFpXNTBQVEF1TVYwZ1UyTmhiR1VnYjJZZ2RHaGxJRzV2YVhObExDQjFjMlZrSUhkb1pXNGdkWEJrWVhScGJtZGNjbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUZ0dlptWnpaWFE5Y21GdVpHOXRYU0JCSUhaaGJIVmxJSFZ6WldRZ2RHOGdaVzV6ZFhKbElHMTFiSFJwY0d4bElHNXZhWE5sWEhKY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1oyVnVaWEpoZEc5eWN5QmhjbVVnY21WMGRYSnVhVzVuSUZ3aWFXNWtaWEJsYm1SbGJuUmNJaUIyWVd4MVpYTmNjbHh1SUNvdlhISmNibVoxYm1OMGFXOXVJRTV2YVhObFIyVnVaWEpoZEc5eU1VUW9jQ3dnYldsdUxDQnRZWGdzSUdsdVkzSmxiV1Z1ZEN3Z2IyWm1jMlYwS1NCN1hISmNiaUFnZEdocGN5NWZjQ0E5SUhBN1hISmNiaUFnZEdocGN5NWZiV2x1SUQwZ2RYUnBiSE11WkdWbVlYVnNkQ2h0YVc0c0lEQXBPMXh5WEc0Z0lIUm9hWE11WDIxaGVDQTlJSFYwYVd4ekxtUmxabUYxYkhRb2JXRjRMQ0F4S1R0Y2NseHVJQ0IwYUdsekxsOXBibU55WlcxbGJuUWdQU0IxZEdsc2N5NWtaV1poZFd4MEtHbHVZM0psYldWdWRDd2dNQzR4S1R0Y2NseHVJQ0IwYUdsekxsOXdiM05wZEdsdmJpQTlJSFYwYVd4ekxtUmxabUYxYkhRb2IyWm1jMlYwTENCd0xuSmhibVJ2YlNndE1UQXdNREF3TUN3Z01UQXdNREF3TUNrcE8xeHlYRzU5WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nVlhCa1lYUmxJSFJvWlNCdGFXNGdZVzVrSUcxaGVDQnViMmx6WlNCMllXeDFaWE5jY2x4dUlDb2dRSEJoY21GdElDQjdiblZ0WW1WeWZTQnRhVzRnVFdsdWFXMTFiU0J1YjJselpTQjJZV3gxWlZ4eVhHNGdLaUJBY0dGeVlXMGdJSHR1ZFcxaVpYSjlJRzFoZUNCTllYaHBiWFZ0SUc1dmFYTmxJSFpoYkhWbFhISmNiaUFxTDF4eVhHNU9iMmx6WlVkbGJtVnlZWFJ2Y2pGRUxuQnliM1J2ZEhsd1pTNXpaWFJDYjNWdVpITWdQU0JtZFc1amRHbHZiaWh0YVc0c0lHMWhlQ2tnZTF4eVhHNGdJSFJvYVhNdVgyMXBiaUE5SUhWMGFXeHpMbVJsWm1GMWJIUW9iV2x1TENCMGFHbHpMbDl0YVc0cE8xeHlYRzRnSUhSb2FYTXVYMjFoZUNBOUlIVjBhV3h6TG1SbFptRjFiSFFvYldGNExDQjBhR2x6TGw5dFlYZ3BPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlGVndaR0YwWlNCMGFHVWdibTlwYzJVZ2FXNWpjbVZ0Wlc1MElDaGxMbWN1SUhOallXeGxLVnh5WEc0Z0tpQkFjR0Z5WVcwZ0lIdHVkVzFpWlhKOUlHbHVZM0psYldWdWRDQk9aWGNnYVc1amNtVnRaVzUwSUNoelkyRnNaU2tnZG1Gc2RXVmNjbHh1SUNvdlhISmNiazV2YVhObFIyVnVaWEpoZEc5eU1VUXVjSEp2ZEc5MGVYQmxMbk5sZEVsdVkzSmxiV1Z1ZENBOUlHWjFibU4wYVc5dUtHbHVZM0psYldWdWRDa2dlMXh5WEc0Z0lIUm9hWE11WDJsdVkzSmxiV1Z1ZENBOUlIVjBhV3h6TG1SbFptRjFiSFFvYVc1amNtVnRaVzUwTENCMGFHbHpMbDlwYm1OeVpXMWxiblFwTzF4eVhHNTlPMXh5WEc1Y2NseHVMeW9xWEhKY2JpQXFJRWRsYm1WeVlYUmxJSFJvWlNCdVpYaDBJRzV2YVhObElIWmhiSFZsWEhKY2JpQXFJRUJ5WlhSMWNtNGdlMjUxYldKbGNuMGdRU0J1YjJsemVTQjJZV3gxWlNCaVpYUjNaV1Z1SUc5aWFtVmpkQ2R6SUcxcGJpQmhibVFnYldGNFhISmNiaUFxTDF4eVhHNU9iMmx6WlVkbGJtVnlZWFJ2Y2pGRUxuQnliM1J2ZEhsd1pTNW5aVzVsY21GMFpTQTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJSFJvYVhNdVgzVndaR0YwWlNncE8xeHlYRzRnSUhaaGNpQnVJRDBnZEdocGN5NWZjQzV1YjJselpTaDBhR2x6TGw5d2IzTnBkR2x2YmlrN1hISmNiaUFnYmlBOUlIUm9hWE11WDNBdWJXRndLRzRzSURBc0lERXNJSFJvYVhNdVgyMXBiaXdnZEdocGN5NWZiV0Y0S1R0Y2NseHVJQ0J5WlhSMWNtNGdianRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQkpiblJsY201aGJDQjFjR1JoZEdVZ2JXVjBhRzlrSUdadmNpQm5aVzVsY21GMGFXNW5JRzVsZUhRZ2JtOXBjMlVnZG1Gc2RXVmNjbHh1SUNvZ1FIQnlhWFpoZEdWY2NseHVJQ292WEhKY2JrNXZhWE5sUjJWdVpYSmhkRzl5TVVRdWNISnZkRzkwZVhCbExsOTFjR1JoZEdVZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQjBhR2x6TGw5d2IzTnBkR2x2YmlBclBTQjBhR2x6TGw5cGJtTnlaVzFsYm5RN1hISmNibjA3WEhKY2JseHlYRzR2THlBdExTQXlSQ0JPYjJselpTQkhaVzVsY21GMGIzSWdMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMVnh5WEc1Y2NseHVablZ1WTNScGIyNGdUbTlwYzJWSFpXNWxjbUYwYjNJeVJDaHdMQ0I0VFdsdUxDQjRUV0Y0TENCNVRXbHVMQ0I1VFdGNExDQjRTVzVqY21WdFpXNTBMQ0I1U1c1amNtVnRaVzUwTENCNFQyWm1jMlYwTENCNVQyWm1jMlYwS1NCN1hISmNiaUFnZEdocGN5NWZlRTV2YVhObElEMGdibVYzSUU1dmFYTmxSMlZ1WlhKaGRHOXlNVVFvY0N3Z2VFMXBiaXdnZUUxaGVDd2dlRWx1WTNKbGJXVnVkQ3dnZUU5bVpuTmxkQ2s3WEhKY2JpQWdkR2hwY3k1ZmVVNXZhWE5sSUQwZ2JtVjNJRTV2YVhObFIyVnVaWEpoZEc5eU1VUW9jQ3dnZVUxcGJpd2dlVTFoZUN3Z2VVbHVZM0psYldWdWRDd2dlVTltWm5ObGRDazdYSEpjYmlBZ2RHaHBjeTVmY0NBOUlIQTdYSEpjYm4xY2NseHVYSEpjYmk4cUtseHlYRzRnS2lCVmNHUmhkR1VnZEdobElHMXBiaUJoYm1RZ2JXRjRJRzV2YVhObElIWmhiSFZsYzF4eVhHNGdLaUJBY0dGeVlXMGdJSHR2WW1wbFkzUjlJRzl3ZEdsdmJuTWdUMkpxWldOMElIZHBkR2dnWW05MWJtUnpJSFJ2SUdKbElIVndaR0YwWldRZ1pTNW5MbHh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2V5QjRUV2x1T2lBd0xDQjRUV0Y0T2lBeExDQjVUV2x1T2lBdE1Td2dlVTFoZURvZ01TQjlYSEpjYmlBcUwxeHlYRzVPYjJselpVZGxibVZ5WVhSdmNqSkVMbkJ5YjNSdmRIbHdaUzV6WlhSQ2IzVnVaSE1nUFNCbWRXNWpkR2x2YmlodmNIUnBiMjV6S1NCN1hISmNiaUFnYVdZZ0tDRnZjSFJwYjI1ektTQnlaWFIxY200N1hISmNiaUFnZEdocGN5NWZlRTV2YVhObExuTmxkRUp2ZFc1a2N5aHZjSFJwYjI1ekxuaE5hVzRzSUc5d2RHbHZibk11ZUUxaGVDazdYSEpjYmlBZ2RHaHBjeTVmZVU1dmFYTmxMbk5sZEVKdmRXNWtjeWh2Y0hScGIyNXpMbmxOYVc0c0lHOXdkR2x2Ym5NdWVVMWhlQ2s3WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dWWEJrWVhSbElIUm9aU0JwYm1OeVpXMWxiblFnS0dVdVp5NGdjMk5oYkdVcElHWnZjaUIwYUdVZ2JtOXBjMlVnWjJWdVpYSmhkRzl5WEhKY2JpQXFJRUJ3WVhKaGJTQWdlMjlpYW1WamRIMGdiM0IwYVc5dWN5QlBZbXBsWTNRZ2QybDBhQ0JpYjNWdVpITWdkRzhnWW1VZ2RYQmtZWFJsWkNCbExtY3VYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCN0lIaEpibU55WlcxbGJuUTZJREF1TURVc0lIbEpibU55WlcxbGJuUTZJREF1TVNCOVhISmNiaUFxTDF4eVhHNU9iMmx6WlVkbGJtVnlZWFJ2Y2pKRUxuQnliM1J2ZEhsd1pTNXpaWFJDYjNWdVpITWdQU0JtZFc1amRHbHZiaWh2Y0hScGIyNXpLU0I3WEhKY2JpQWdhV1lnS0NGdmNIUnBiMjV6S1NCeVpYUjFjbTQ3WEhKY2JpQWdkR2hwY3k1ZmVFNXZhWE5sTG5ObGRFSnZkVzVrY3lodmNIUnBiMjV6TG5oSmJtTnlaVzFsYm5RcE8xeHlYRzRnSUhSb2FYTXVYM2xPYjJselpTNXpaWFJDYjNWdVpITW9iM0IwYVc5dWN5NTVTVzVqY21WdFpXNTBLVHRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQkhaVzVsY21GMFpTQjBhR1VnYm1WNGRDQndZV2x5SUc5bUlHNXZhWE5sSUhaaGJIVmxjMXh5WEc0Z0tpQkFjbVYwZFhKdUlIdHZZbXBsWTNSOUlFOWlhbVZqZENCM2FYUm9JSGdnWVc1a0lIa2djSEp2Y0dWeWRHbGxjeUIwYUdGMElHTnZiblJoYVc0Z2RHaGxJRzVsZUhRZ2JtOXBjMlZjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZV3gxWlhNZ1lXeHZibWNnWldGamFDQmthVzFsYm5OcGIyNWNjbHh1SUNvdlhISmNiazV2YVhObFIyVnVaWEpoZEc5eU1rUXVjSEp2ZEc5MGVYQmxMbWRsYm1WeVlYUmxJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnY21WMGRYSnVJSHRjY2x4dUlDQWdJSGc2SUhSb2FYTXVYM2hPYjJselpTNW5aVzVsY21GMFpTZ3BMRnh5WEc0Z0lDQWdlVG9nZEdocGN5NWZlVTV2YVhObExtZGxibVZ5WVhSbEtDbGNjbHh1SUNCOU8xeHlYRzU5TzF4eVhHNGlMQ0p0YjJSMWJHVXVaWGh3YjNKMGN5QTlJRk5wYmtkbGJtVnlZWFJ2Y2p0Y2NseHVYSEpjYm5aaGNpQjFkR2xzY3lBOUlISmxjWFZwY21Vb1hDSXVMaTh1TGk5MWRHbHNhWFJwWlhNdWFuTmNJaWs3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUVNCMWRHbHNhWFI1SUdOc1lYTnpJR1p2Y2lCblpXNWxjbUYwYVc1bklIWmhiSFZsY3lCaGJHOXVaeUJoSUhOcGJuZGhkbVZjY2x4dUlDb2dRR052Ym5OMGNuVmpkRzl5WEhKY2JpQXFJRUJ3WVhKaGJTQjdiMkpxWldOMGZTQndJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1VtVm1aWEpsYm1ObElIUnZJR0VnY0RVZ2MydGxkR05vWEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQmJiV2x1UFRCZElDQWdJQ0FnSUNBZ1RXbHVhVzExYlNCMllXeDFaU0JtYjNJZ2RHaGxJRzV2YVhObFhISmNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0JiYldGNFBURmRJQ0FnSUNBZ0lDQWdUV0Y0YVcxMWJTQjJZV3gxWlNCbWIzSWdkR2hsSUc1dmFYTmxYSEpjYmlBcUlFQndZWEpoYlNCN2JuVnRZbVZ5ZlNCYmFXNWpjbVZ0Wlc1MFBUQXVNVjBnU1c1amNtVnRaVzUwSUhWelpXUWdkMmhsYmlCMWNHUmhkR2x1WjF4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXMjltWm5ObGREMXlZVzVrYjIxZElGZG9aWEpsSUhSdklITjBZWEowSUdGc2IyNW5JSFJvWlNCemFXNWxkMkYyWlZ4eVhHNGdLaTljY2x4dVpuVnVZM1JwYjI0Z1UybHVSMlZ1WlhKaGRHOXlLSEFzSUcxcGJpd2diV0Y0TENCaGJtZHNaVWx1WTNKbGJXVnVkQ3dnYzNSaGNuUnBibWRCYm1kc1pTa2dlMXh5WEc0Z0lIUm9hWE11WDNBZ1BTQndPMXh5WEc0Z0lIUm9hWE11WDIxcGJpQTlJSFYwYVd4ekxtUmxabUYxYkhRb2JXbHVMQ0F3S1R0Y2NseHVJQ0IwYUdsekxsOXRZWGdnUFNCMWRHbHNjeTVrWldaaGRXeDBLRzFoZUN3Z01DazdYSEpjYmlBZ2RHaHBjeTVmYVc1amNtVnRaVzUwSUQwZ2RYUnBiSE11WkdWbVlYVnNkQ2hoYm1kc1pVbHVZM0psYldWdWRDd2dNQzR4S1R0Y2NseHVJQ0IwYUdsekxsOWhibWRzWlNBOUlIVjBhV3h6TG1SbFptRjFiSFFvYzNSaGNuUnBibWRCYm1kc1pTd2djQzV5WVc1a2IyMG9MVEV3TURBd01EQXNJREV3TURBd01EQXBLVHRjY2x4dWZWeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlGVndaR0YwWlNCMGFHVWdiV2x1SUdGdVpDQnRZWGdnZG1Gc2RXVnpYSEpjYmlBcUlFQndZWEpoYlNBZ2UyNTFiV0psY24wZ2JXbHVJRTFwYm1sdGRXMGdkbUZzZFdWY2NseHVJQ29nUUhCaGNtRnRJQ0I3Ym5WdFltVnlmU0J0WVhnZ1RXRjRhVzExYlNCMllXeDFaVnh5WEc0Z0tpOWNjbHh1VTJsdVIyVnVaWEpoZEc5eUxuQnliM1J2ZEhsd1pTNXpaWFJDYjNWdVpITWdQU0JtZFc1amRHbHZiaWh0YVc0c0lHMWhlQ2tnZTF4eVhHNGdJSFJvYVhNdVgyMXBiaUE5SUhWMGFXeHpMbVJsWm1GMWJIUW9iV2x1TENCMGFHbHpMbDl0YVc0cE8xeHlYRzRnSUhSb2FYTXVYMjFoZUNBOUlIVjBhV3h6TG1SbFptRjFiSFFvYldGNExDQjBhR2x6TGw5dFlYZ3BPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlGVndaR0YwWlNCMGFHVWdZVzVuYkdVZ2FXNWpjbVZ0Wlc1MElDaGxMbWN1SUdodmR5Qm1ZWE4wSUhkbElHMXZkbVVnZEdoeWIzVm5hQ0IwYUdVZ2MybHVkMkYyWlNsY2NseHVJQ29nUUhCaGNtRnRJQ0I3Ym5WdFltVnlmU0JwYm1OeVpXMWxiblFnVG1WM0lHbHVZM0psYldWdWRDQjJZV3gxWlZ4eVhHNGdLaTljY2x4dVUybHVSMlZ1WlhKaGRHOXlMbkJ5YjNSdmRIbHdaUzV6WlhSSmJtTnlaVzFsYm5RZ1BTQm1kVzVqZEdsdmJpaHBibU55WlcxbGJuUXBJSHRjY2x4dUlDQjBhR2x6TGw5cGJtTnlaVzFsYm5RZ1BTQjFkR2xzY3k1a1pXWmhkV3gwS0dsdVkzSmxiV1Z1ZEN3Z2RHaHBjeTVmYVc1amNtVnRaVzUwS1R0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJIWlc1bGNtRjBaU0IwYUdVZ2JtVjRkQ0IyWVd4MVpWeHlYRzRnS2lCQWNtVjBkWEp1SUh0dWRXMWlaWEo5SUVFZ2RtRnNkV1VnWW1WMGQyVmxiaUJuWlc1bGNtRjBiM0p6SjNNZ2JXbHVJR0Z1WkNCdFlYaGNjbHh1SUNvdlhISmNibE5wYmtkbGJtVnlZWFJ2Y2k1d2NtOTBiM1I1Y0dVdVoyVnVaWEpoZEdVZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQjBhR2x6TGw5MWNHUmhkR1VvS1R0Y2NseHVJQ0IyWVhJZ2JpQTlJSFJvYVhNdVgzQXVjMmx1S0hSb2FYTXVYMkZ1WjJ4bEtUdGNjbHh1SUNCdUlEMGdkR2hwY3k1ZmNDNXRZWEFvYml3Z0xURXNJREVzSUhSb2FYTXVYMjFwYml3Z2RHaHBjeTVmYldGNEtUdGNjbHh1SUNCeVpYUjFjbTRnYmp0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJKYm5SbGNtNWhiQ0IxY0dSaGRHVWdiV1YwYUc5a0lHWnZjaUJuWlc1bGNtRjBhVzVuSUc1bGVIUWdkbUZzZFdWY2NseHVJQ29nUUhCeWFYWmhkR1ZjY2x4dUlDb3ZYSEpjYmxOcGJrZGxibVZ5WVhSdmNpNXdjbTkwYjNSNWNHVXVYM1Z3WkdGMFpTQTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJSFJvYVhNdVgyRnVaMnhsSUNzOUlIUm9hWE11WDJsdVkzSmxiV1Z1ZER0Y2NseHVmVHRjY2x4dUlpd2liVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQlRhMlYwWTJnN1hISmNibHh5WEc1MllYSWdRbUp2ZUZSbGVIUWdQU0J5WlhGMWFYSmxLRndpY0RVdFltSnZlQzFoYkdsbmJtVmtMWFJsZUhSY0lpazdYSEpjYm5aaGNpQkNZWE5sVEc5bmIxTnJaWFJqYUNBOUlISmxjWFZwY21Vb1hDSXVMMkpoYzJVdGJHOW5ieTF6YTJWMFkyZ3Vhbk5jSWlrN1hISmNibHh5WEc1MllYSWdkWFJwYkhNZ1BTQnlaWEYxYVhKbEtGd2lMaTR2ZFhScGJHbDBhV1Z6TG1welhDSXBPMXh5WEc1Y2NseHVVMnRsZEdOb0xuQnliM1J2ZEhsd1pTQTlJRTlpYW1WamRDNWpjbVZoZEdVb1FtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsS1R0Y2NseHVYSEpjYm1aMWJtTjBhVzl1SUZOclpYUmphQ2drYm1GMkxDQWtibUYyVEc5bmJ5a2dlMXh5WEc0Z0lFSmhjMlZNYjJkdlUydGxkR05vTG1OaGJHd29kR2hwY3l3Z0pHNWhkaXdnSkc1aGRreHZaMjhzSUZ3aUxpNHZabTl1ZEhNdlltbG5YMnB2YUc0dGQyVmlabTl1ZEM1MGRHWmNJaWs3WEhKY2JuMWNjbHh1WEhKY2JsTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgyOXVVbVZ6YVhwbElEMGdablZ1WTNScGIyNG9jQ2tnZTF4eVhHNGdJRUpoYzJWTWIyZHZVMnRsZEdOb0xuQnliM1J2ZEhsd1pTNWZiMjVTWlhOcGVtVXVZMkZzYkNoMGFHbHpMQ0J3S1R0Y2NseHVJQ0IwYUdsekxsOXpjR0ZqYVc1bklEMGdkWFJwYkhNdWJXRndLSFJvYVhNdVgyWnZiblJUYVhwbExDQXlNQ3dnTkRBc0lESXNJRFVzSUh0Y2NseHVJQ0FnSUdOc1lXMXdPaUIwY25WbExGeHlYRzRnSUNBZ2NtOTFibVE2SUhSeWRXVmNjbHh1SUNCOUtUdGNjbHh1SUNBdkx5QlZjR1JoZEdVZ2RHaGxJR0ppYjNoVVpYaDBMQ0J3YkdGalpTQnZkbVZ5SUhSb1pTQnVZWFlnZEdWNGRDQnNiMmR2SUdGdVpDQjBhR1Z1SUhOb2FXWjBJR2wwYzF4eVhHNGdJQzh2SUdGdVkyaHZjaUJpWVdOcklIUnZJQ2hqWlc1MFpYSXNJR05sYm5SbGNpa2dkMmhwYkdVZ2NISmxjMlZ5ZG1sdVp5QjBhR1VnZEdWNGRDQndiM05wZEdsdmJseHlYRzRnSUhSb2FYTXVYMkppYjNoVVpYaDBYSEpjYmlBZ0lDQXVjMlYwVkdWNGRDaDBhR2x6TGw5MFpYaDBLVnh5WEc0Z0lDQWdMbk5sZEZSbGVIUlRhWHBsS0hSb2FYTXVYMlp2Ym5SVGFYcGxLVnh5WEc0Z0lDQWdMbk5sZEVGdVkyaHZjaWhDWW05NFZHVjRkQzVCVEVsSFRpNUNUMWhmVEVWR1ZDd2dRbUp2ZUZSbGVIUXVRa0ZUUlV4SlRrVXVRVXhRU0VGQ1JWUkpReWxjY2x4dUlDQWdJQzV6WlhSUWIzTnBkR2x2YmloMGFHbHpMbDkwWlhoMFQyWm1jMlYwTG14bFpuUXNJSFJvYVhNdVgzUmxlSFJQWm1aelpYUXVkRzl3S1Z4eVhHNGdJQ0FnTG5ObGRFRnVZMmh2Y2loQ1ltOTRWR1Y0ZEM1QlRFbEhUaTVDVDFoZlEwVk9WRVZTTENCQ1ltOTRWR1Y0ZEM1Q1FWTkZURWxPUlM1Q1QxaGZRMFZPVkVWU0xDQjBjblZsS1R0Y2NseHVJQ0IwYUdsekxsOWtjbUYzVTNSaGRHbHZibUZ5ZVV4dloyOG9jQ2s3WEhKY2JpQWdkR2hwY3k1ZlkyRnNZM1ZzWVhSbFEybHlZMnhsY3lod0tUdGNjbHh1SUNCMGFHbHpMbDlwYzBacGNuTjBSbkpoYldVZ1BTQjBjblZsTzF4eVhHNTlPMXh5WEc1Y2NseHVVMnRsZEdOb0xuQnliM1J2ZEhsd1pTNWZaSEpoZDFOMFlYUnBiMjVoY25sTWIyZHZJRDBnWm5WdVkzUnBiMjRvY0NrZ2UxeHlYRzRnSUhBdVltRmphMmR5YjNWdVpDZ3lOVFVwTzF4eVhHNGdJSEF1YzNSeWIydGxLREkxTlNrN1hISmNiaUFnY0M1bWFXeHNLRndpSXpCQk1EQXdRVndpS1R0Y2NseHVJQ0J3TG5OMGNtOXJaVmRsYVdkb2RDZ3lLVHRjY2x4dUlDQjBhR2x6TGw5aVltOTRWR1Y0ZEM1a2NtRjNLQ2s3WEhKY2JuMDdYSEpjYmx4eVhHNVRhMlYwWTJndWNISnZkRzkwZVhCbExsOXpaWFIxY0NBOUlHWjFibU4wYVc5dUtIQXBJSHRjY2x4dUlDQkNZWE5sVEc5bmIxTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgzTmxkSFZ3TG1OaGJHd29kR2hwY3l3Z2NDazdYSEpjYmx4eVhHNGdJQzh2SUVOeVpXRjBaU0JoSUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQ0JwYm5OMFlXNWpaU0IwYUdGMElIZHBiR3dnWW1VZ2RYTmxaQ0JtYjNJZ1pISmhkMmx1WnlCaGJtUmNjbHh1SUNBdkx5QnliM1JoZEdsdVp5QjBaWGgwWEhKY2JpQWdkR2hwY3k1ZlltSnZlRlJsZUhRZ1BTQnVaWGNnUW1KdmVGUmxlSFFvZEdocGN5NWZabTl1ZEN3Z2RHaHBjeTVmZEdWNGRDd2dkR2hwY3k1ZlptOXVkRk5wZW1Vc0lEQXNJREFzSUhBcE8xeHlYRzVjY2x4dUlDQXZMeUJJWVc1a2JHVWdkR2hsSUdsdWFYUnBZV3dnYzJWMGRYQWdZbmtnZEhKcFoyZGxjbWx1WnlCaElISmxjMmw2WlZ4eVhHNGdJSFJvYVhNdVgyOXVVbVZ6YVhwbEtIQXBPMXh5WEc1Y2NseHVJQ0F2THlCRWNtRjNJSFJvWlNCemRHRjBhVzl1WVhKNUlHeHZaMjljY2x4dUlDQjBhR2x6TGw5a2NtRjNVM1JoZEdsdmJtRnllVXh2WjI4b2NDazdYSEpjYmx4eVhHNGdJSFJvYVhNdVgyTmhiR04xYkdGMFpVTnBjbU5zWlhNb2NDazdYSEpjYm4wN1hISmNibHh5WEc1VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5allXeGpkV3hoZEdWRGFYSmpiR1Z6SUQwZ1puVnVZM1JwYjI0b2NDa2dlMXh5WEc0Z0lDOHZJRlJQUkU4NklFUnZiaWQwSUc1bFpXUWdRVXhNSUhSb1pTQndhWGhsYkhNdUlGUm9hWE1nWTI5MWJHUWdhR0YyWlNCaGJpQnZabVp6WTNKbFpXNGdjbVZ1WkdWeVpYSmNjbHh1SUNBdkx5QjBhR0YwSUdseklHcDFjM1FnWW1sbklHVnViM1ZuYUNCMGJ5Qm1hWFFnZEdobElIUmxlSFF1WEhKY2JpQWdMeThnVEc5dmNDQnZkbVZ5SUhSb1pTQndhWGhsYkhNZ2FXNGdkR2hsSUhSbGVIUW5jeUJpYjNWdVpHbHVaeUJpYjNnZ2RHOGdjMkZ0Y0d4bElIUm9aU0IzYjNKa1hISmNiaUFnZG1GeUlHSmliM2dnUFNCMGFHbHpMbDlpWW05NFZHVjRkQzVuWlhSQ1ltOTRLQ2s3WEhKY2JpQWdkbUZ5SUhOMFlYSjBXQ0E5SUUxaGRHZ3VabXh2YjNJb1RXRjBhQzV0WVhnb1ltSnZlQzU0SUMwZ05Td2dNQ2twTzF4eVhHNGdJSFpoY2lCbGJtUllJRDBnVFdGMGFDNWpaV2xzS0UxaGRHZ3ViV2x1S0dKaWIzZ3VlQ0FySUdKaWIzZ3VkeUFySURVc0lIQXVkMmxrZEdncEtUdGNjbHh1SUNCMllYSWdjM1JoY25SWklEMGdUV0YwYUM1bWJHOXZjaWhOWVhSb0xtMWhlQ2hpWW05NExua2dMU0ExTENBd0tTazdYSEpjYmlBZ2RtRnlJR1Z1WkZrZ1BTQk5ZWFJvTG1ObGFXd29UV0YwYUM1dGFXNG9ZbUp2ZUM1NUlDc2dZbUp2ZUM1b0lDc2dOU3dnY0M1b1pXbG5hSFFwS1R0Y2NseHVJQ0J3TG14dllXUlFhWGhsYkhNb0tUdGNjbHh1SUNCd0xuQnBlR1ZzUkdWdWMybDBlU2d4S1R0Y2NseHVJQ0IwYUdsekxsOWphWEpqYkdWeklEMGdXMTA3WEhKY2JpQWdabTl5SUNoMllYSWdlU0E5SUhOMFlYSjBXVHNnZVNBOElHVnVaRms3SUhrZ0t6MGdkR2hwY3k1ZmMzQmhZMmx1WnlrZ2UxeHlYRzRnSUNBZ1ptOXlJQ2gyWVhJZ2VDQTlJSE4wWVhKMFdEc2dlQ0E4SUdWdVpGZzdJSGdnS3owZ2RHaHBjeTVmYzNCaFkybHVaeWtnZTF4eVhHNGdJQ0FnSUNCMllYSWdhU0E5SURRZ0tpQW9lU0FxSUhBdWQybGtkR2dnS3lCNEtUdGNjbHh1SUNBZ0lDQWdkbUZ5SUhJZ1BTQndMbkJwZUdWc2MxdHBYVHRjY2x4dUlDQWdJQ0FnZG1GeUlHY2dQU0J3TG5CcGVHVnNjMXRwSUNzZ01WMDdYSEpjYmlBZ0lDQWdJSFpoY2lCaUlEMGdjQzV3YVhobGJITmJhU0FySURKZE8xeHlYRzRnSUNBZ0lDQjJZWElnWVNBOUlIQXVjR2w0Wld4elcya2dLeUF6WFR0Y2NseHVJQ0FnSUNBZ2RtRnlJR01nUFNCd0xtTnZiRzl5S0hJc0lHY3NJR0lzSUdFcE8xeHlYRzRnSUNBZ0lDQnBaaUFvY0M1ellYUjFjbUYwYVc5dUtHTXBJRDRnTUNrZ2UxeHlYRzRnSUNBZ0lDQWdJSFJvYVhNdVgyTnBjbU5zWlhNdWNIVnphQ2g3WEhKY2JpQWdJQ0FnSUNBZ0lDQjRPaUI0SUNzZ2NDNXlZVzVrYjIwb0xUSWdMeUF6SUNvZ2RHaHBjeTVmYzNCaFkybHVaeXdnTWlBdklETWdLaUIwYUdsekxsOXpjR0ZqYVc1bktTeGNjbHh1SUNBZ0lDQWdJQ0FnSUhrNklIa2dLeUJ3TG5KaGJtUnZiU2d0TWlBdklETWdLaUIwYUdsekxsOXpjR0ZqYVc1bkxDQXlJQzhnTXlBcUlIUm9hWE11WDNOd1lXTnBibWNwTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdZMjlzYjNJNklIQXVZMjlzYjNJb1hDSWpNRFpHUmtaR1hDSXBYSEpjYmlBZ0lDQWdJQ0FnZlNrN1hISmNiaUFnSUNBZ0lDQWdkR2hwY3k1ZlkybHlZMnhsY3k1d2RYTm9LSHRjY2x4dUlDQWdJQ0FnSUNBZ0lIZzZJSGdnS3lCd0xuSmhibVJ2YlNndE1pQXZJRE1nS2lCMGFHbHpMbDl6Y0dGamFXNW5MQ0F5SUM4Z015QXFJSFJvYVhNdVgzTndZV05wYm1jcExGeHlYRzRnSUNBZ0lDQWdJQ0FnZVRvZ2VTQXJJSEF1Y21GdVpHOXRLQzB5SUM4Z015QXFJSFJvYVhNdVgzTndZV05wYm1jc0lESWdMeUF6SUNvZ2RHaHBjeTVmYzNCaFkybHVaeWtzWEhKY2JpQWdJQ0FnSUNBZ0lDQmpiMnh2Y2pvZ2NDNWpiMnh2Y2loY0lpTkdSVEF3UmtWY0lpbGNjbHh1SUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5amFYSmpiR1Z6TG5CMWMyZ29lMXh5WEc0Z0lDQWdJQ0FnSUNBZ2VEb2dlQ0FySUhBdWNtRnVaRzl0S0MweUlDOGdNeUFxSUhSb2FYTXVYM053WVdOcGJtY3NJRElnTHlBeklDb2dkR2hwY3k1ZmMzQmhZMmx1Wnlrc1hISmNiaUFnSUNBZ0lDQWdJQ0I1T2lCNUlDc2djQzV5WVc1a2IyMG9MVElnTHlBeklDb2dkR2hwY3k1ZmMzQmhZMmx1Wnl3Z01pQXZJRE1nS2lCMGFHbHpMbDl6Y0dGamFXNW5LU3hjY2x4dUlDQWdJQ0FnSUNBZ0lHTnZiRzl5T2lCd0xtTnZiRzl5S0Z3aUkwWkdSa1l3TkZ3aUtWeHlYRzRnSUNBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnSUNCOVhISmNiaUFnSUNCOVhISmNiaUFnZlZ4eVhHNTlPMXh5WEc1Y2NseHVVMnRsZEdOb0xuQnliM1J2ZEhsd1pTNWZaSEpoZHlBOUlHWjFibU4wYVc5dUtIQXBJSHRjY2x4dUlDQkNZWE5sVEc5bmIxTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgyUnlZWGN1WTJGc2JDaDBhR2x6TENCd0tUdGNjbHh1SUNCcFppQW9JWFJvYVhNdVgybHpUVzkxYzJWUGRtVnlJSHg4SUNGMGFHbHpMbDlwYzA5MlpYSk9ZWFpNYjJkdktTQnlaWFIxY200N1hISmNibHh5WEc0Z0lDOHZJRmRvWlc0Z2RHaGxJSFJsZUhRZ2FYTWdZV0p2ZFhRZ2RHOGdZbVZqYjIxbElHRmpkR2wyWlNCbWIzSWdkR2hsSUdacGNuTjBJSFJwYldVc0lHTnNaV0Z5WEhKY2JpQWdMeThnZEdobElITjBZWFJwYjI1aGNua2diRzluYnlCMGFHRjBJSGRoY3lCd2NtVjJhVzkxYzJ4NUlHUnlZWGR1TGx4eVhHNGdJR2xtSUNoMGFHbHpMbDlwYzBacGNuTjBSbkpoYldVcElIdGNjbHh1SUNBZ0lIQXVZbUZqYTJkeWIzVnVaQ2d5TlRVcE8xeHlYRzRnSUNBZ2RHaHBjeTVmYVhOR2FYSnpkRVp5WVcxbElEMGdabUZzYzJVN1hISmNiaUFnZlZ4eVhHNWNjbHh1SUNBdkx5QkRiR1ZoY2x4eVhHNGdJSEF1WW14bGJtUk5iMlJsS0hBdVFreEZUa1FwTzF4eVhHNGdJSEF1WW1GamEyZHliM1Z1WkNneU5UVXBPMXh5WEc1Y2NseHVJQ0F2THlCRWNtRjNJRndpYUdGc1puUnZibVZjSWlCc2IyZHZYSEpjYmlBZ2NDNXViMU4wY205clpTZ3BPMXh5WEc0Z0lIQXVZbXhsYm1STmIyUmxLSEF1VFZWTVZFbFFURmtwTzF4eVhHNWNjbHh1SUNCMllYSWdiV0Y0UkdsemRDQTlJSFJvYVhNdVgySmliM2hVWlhoMExtaGhiR1pYYVdSMGFEdGNjbHh1SUNCMllYSWdiV0Y0VW1Ga2FYVnpJRDBnTWlBcUlIUm9hWE11WDNOd1lXTnBibWM3WEhKY2JseHlYRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2RHaHBjeTVmWTJseVkyeGxjeTVzWlc1bmRHZzdJR2tnS3owZ01Ta2dlMXh5WEc0Z0lDQWdkbUZ5SUdOcGNtTnNaU0E5SUhSb2FYTXVYMk5wY21Oc1pYTmJhVjA3WEhKY2JpQWdJQ0IyWVhJZ1l5QTlJR05wY21Oc1pTNWpiMnh2Y2p0Y2NseHVJQ0FnSUhaaGNpQmthWE4wSUQwZ2NDNWthWE4wS0dOcGNtTnNaUzU0TENCamFYSmpiR1V1ZVN3Z2NDNXRiM1Z6WlZnc0lIQXViVzkxYzJWWktUdGNjbHh1SUNBZ0lIWmhjaUJ5WVdScGRYTWdQU0IxZEdsc2N5NXRZWEFvWkdsemRDd2dNQ3dnYldGNFJHbHpkQ3dnTVN3Z2JXRjRVbUZrYVhWekxDQjdJR05zWVcxd09pQjBjblZsSUgwcE8xeHlYRzRnSUNBZ2NDNW1hV3hzS0dNcE8xeHlYRzRnSUNBZ2NDNWxiR3hwY0hObEtHTnBjbU5zWlM1NExDQmphWEpqYkdVdWVTd2djbUZrYVhWekxDQnlZV1JwZFhNcE8xeHlYRzRnSUgxY2NseHVmVHRjY2x4dUlpd2liVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQlRhMlYwWTJnN1hISmNibHh5WEc1MllYSWdUbTlwYzJVZ1BTQnlaWEYxYVhKbEtGd2lMaTluWlc1bGNtRjBiM0p6TDI1dmFYTmxMV2RsYm1WeVlYUnZjbk11YW5OY0lpazdYSEpjYm5aaGNpQkNZbTk0VkdWNGRDQTlJSEpsY1hWcGNtVW9YQ0p3TlMxaVltOTRMV0ZzYVdkdVpXUXRkR1Y0ZEZ3aUtUdGNjbHh1ZG1GeUlFSmhjMlZNYjJkdlUydGxkR05vSUQwZ2NtVnhkV2x5WlNoY0lpNHZZbUZ6WlMxc2IyZHZMWE5yWlhSamFDNXFjMXdpS1R0Y2NseHVYSEpjYmxOclpYUmphQzV3Y205MGIzUjVjR1VnUFNCUFltcGxZM1F1WTNKbFlYUmxLRUpoYzJWTWIyZHZVMnRsZEdOb0xuQnliM1J2ZEhsd1pTazdYSEpjYmx4eVhHNW1kVzVqZEdsdmJpQlRhMlYwWTJnb0pHNWhkaXdnSkc1aGRreHZaMjhwSUh0Y2NseHVJQ0JDWVhObFRHOW5iMU5yWlhSamFDNWpZV3hzS0hSb2FYTXNJQ1J1WVhZc0lDUnVZWFpNYjJkdkxDQmNJaTR1TDJadmJuUnpMMkpwWjE5cWIyaHVMWGRsWW1admJuUXVkSFJtWENJcE8xeHlYRzU5WEhKY2JseHlYRzVUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDl2YmxKbGMybDZaU0E5SUdaMWJtTjBhVzl1S0hBcElIdGNjbHh1SUNCQ1lYTmxURzluYjFOclpYUmphQzV3Y205MGIzUjVjR1V1WDI5dVVtVnphWHBsTG1OaGJHd29kR2hwY3l3Z2NDazdYSEpjYmlBZ0x5OGdWWEJrWVhSbElIUm9aU0JpWW05NFZHVjRkQ3dnY0d4aFkyVWdiM1psY2lCMGFHVWdibUYySUhSbGVIUWdiRzluYnlCaGJtUWdkR2hsYmlCemFHbG1kQ0JwZEhOY2NseHVJQ0F2THlCaGJtTm9iM0lnWW1GamF5QjBieUFvWTJWdWRHVnlMQ0JqWlc1MFpYSXBJSGRvYVd4bElIQnlaWE5sY25acGJtY2dkR2hsSUhSbGVIUWdjRzl6YVhScGIyNWNjbHh1SUNCMGFHbHpMbDlpWW05NFZHVjRkRnh5WEc0Z0lDQWdMbk5sZEZSbGVIUW9kR2hwY3k1ZmRHVjRkQ2xjY2x4dUlDQWdJQzV6WlhSVVpYaDBVMmw2WlNoMGFHbHpMbDltYjI1MFUybDZaU2xjY2x4dUlDQWdJQzV6WlhSU2IzUmhkR2x2Ymlnd0tWeHlYRzRnSUNBZ0xuTmxkRUZ1WTJodmNpaENZbTk0VkdWNGRDNUJURWxIVGk1Q1QxaGZURVZHVkN3Z1FtSnZlRlJsZUhRdVFrRlRSVXhKVGtVdVFVeFFTRUZDUlZSSlF5bGNjbHh1SUNBZ0lDNXpaWFJRYjNOcGRHbHZiaWgwYUdsekxsOTBaWGgwVDJabWMyVjBMbXhsWm5Rc0lIUm9hWE11WDNSbGVIUlBabVp6WlhRdWRHOXdLVnh5WEc0Z0lDQWdMbk5sZEVGdVkyaHZjaWhDWW05NFZHVjRkQzVCVEVsSFRpNUNUMWhmUTBWT1ZFVlNMQ0JDWW05NFZHVjRkQzVDUVZORlRFbE9SUzVDVDFoZlEwVk9WRVZTTENCMGNuVmxLVHRjY2x4dUlDQjBhR2x6TGw5MFpYaDBVRzl6SUQwZ2RHaHBjeTVmWW1KdmVGUmxlSFF1WjJWMFVHOXphWFJwYjI0b0tUdGNjbHh1SUNCMGFHbHpMbDlrY21GM1UzUmhkR2x2Ym1GeWVVeHZaMjhvY0NrN1hISmNiaUFnZEdocGN5NWZhWE5HYVhKemRFWnlZVzFsSUQwZ2RISjFaVHRjY2x4dWZUdGNjbHh1WEhKY2JsTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgyUnlZWGRUZEdGMGFXOXVZWEo1VEc5bmJ5QTlJR1oxYm1OMGFXOXVLSEFwSUh0Y2NseHVJQ0J3TG1KaFkydG5jbTkxYm1Rb01qVTFLVHRjY2x4dUlDQndMbk4wY205clpTZ3lOVFVwTzF4eVhHNGdJSEF1Wm1sc2JDaGNJaU13UVRBd01FRmNJaWs3WEhKY2JpQWdjQzV6ZEhKdmEyVlhaV2xuYUhRb01pazdYSEpjYmlBZ2RHaHBjeTVmWW1KdmVGUmxlSFF1WkhKaGR5Z3BPMXh5WEc1OU8xeHlYRzVjY2x4dVUydGxkR05vTG5CeWIzUnZkSGx3WlM1ZmMyVjBkWEFnUFNCbWRXNWpkR2x2Ymlod0tTQjdYSEpjYmlBZ1FtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5elpYUjFjQzVqWVd4c0tIUm9hWE1zSUhBcE8xeHlYRzVjY2x4dUlDQXZMeUJEY21WaGRHVWdZU0JDWW05NFFXeHBaMjVsWkZSbGVIUWdhVzV6ZEdGdVkyVWdkR2hoZENCM2FXeHNJR0psSUhWelpXUWdabTl5SUdSeVlYZHBibWNnWVc1a1hISmNiaUFnTHk4Z2NtOTBZWFJwYm1jZ2RHVjRkRnh5WEc0Z0lIUm9hWE11WDJKaWIzaFVaWGgwSUQwZ2JtVjNJRUppYjNoVVpYaDBLSFJvYVhNdVgyWnZiblFzSUhSb2FYTXVYM1JsZUhRc0lIUm9hWE11WDJadmJuUlRhWHBsTENBd0xDQXdMQ0J3S1R0Y2NseHVYSEpjYmlBZ0x5OGdTR0Z1Wkd4bElIUm9aU0JwYm1sMGFXRnNJSE5sZEhWd0lHSjVJSFJ5YVdkblpYSnBibWNnWVNCeVpYTnBlbVZjY2x4dUlDQjBhR2x6TGw5dmJsSmxjMmw2WlNod0tUdGNjbHh1WEhKY2JpQWdMeThnVTJWMElIVndJRzV2YVhObElHZGxibVZ5WVhSdmNuTmNjbHh1SUNCMGFHbHpMbDl5YjNSaGRHbHZiazV2YVhObElEMGdibVYzSUU1dmFYTmxMazV2YVhObFIyVnVaWEpoZEc5eU1VUW9jQ3dnTFhBdVVFa2dMeUEwTENCd0xsQkpJQzhnTkN3Z01DNHdNaWs3WEhKY2JpQWdkR2hwY3k1ZmVIbE9iMmx6WlNBOUlHNWxkeUJPYjJselpTNU9iMmx6WlVkbGJtVnlZWFJ2Y2pKRUtIQXNJQzB4TURBc0lERXdNQ3dnTFRVd0xDQTFNQ3dnTUM0d01Td2dNQzR3TVNrN1hISmNibjA3WEhKY2JseHlYRzVUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDlrY21GM0lEMGdablZ1WTNScGIyNG9jQ2tnZTF4eVhHNGdJRUpoYzJWTWIyZHZVMnRsZEdOb0xuQnliM1J2ZEhsd1pTNWZaSEpoZHk1allXeHNLSFJvYVhNc0lIQXBPMXh5WEc0Z0lHbG1JQ2doZEdocGN5NWZhWE5OYjNWelpVOTJaWElnZkh3Z0lYUm9hWE11WDJselQzWmxjazVoZGt4dloyOHBJSEpsZEhWeWJqdGNjbHh1WEhKY2JpQWdMeThnVjJobGJpQjBhR1VnZEdWNGRDQnBjeUJoWW05MWRDQjBieUJpWldOdmJXVWdZV04wYVhabElHWnZjaUIwYUdVZ1ptbHljM1FnZEdsdFpTd2dZMnhsWVhKY2NseHVJQ0F2THlCMGFHVWdjM1JoZEdsdmJtRnllU0JzYjJkdklIUm9ZWFFnZDJGeklIQnlaWFpwYjNWemJIa2daSEpoZDI0dVhISmNiaUFnYVdZZ0tIUm9hWE11WDJselJtbHljM1JHY21GdFpTa2dlMXh5WEc0Z0lDQWdjQzVpWVdOclozSnZkVzVrS0RJMU5TazdYSEpjYmlBZ0lDQjBhR2x6TGw5cGMwWnBjbk4wUm5KaGJXVWdQU0JtWVd4elpUdGNjbHh1SUNCOVhISmNibHh5WEc0Z0lDOHZJRU5oYkdOMWJHRjBaU0J3YjNOcGRHbHZiaUJoYm1RZ2NtOTBZWFJwYjI0Z2RHOGdZM0psWVhSbElHRWdhbWwwZEdWeWVTQnNiMmR2WEhKY2JpQWdkbUZ5SUhKdmRHRjBhVzl1SUQwZ2RHaHBjeTVmY205MFlYUnBiMjVPYjJselpTNW5aVzVsY21GMFpTZ3BPMXh5WEc0Z0lIWmhjaUI0ZVU5bVpuTmxkQ0E5SUhSb2FYTXVYM2g1VG05cGMyVXVaMlZ1WlhKaGRHVW9LVHRjY2x4dUlDQjBhR2x6TGw5aVltOTRWR1Y0ZEZ4eVhHNGdJQ0FnTG5ObGRGSnZkR0YwYVc5dUtISnZkR0YwYVc5dUtWeHlYRzRnSUNBZ0xuTmxkRkJ2YzJsMGFXOXVLSFJvYVhNdVgzUmxlSFJRYjNNdWVDQXJJSGg1VDJabWMyVjBMbmdzSUhSb2FYTXVYM1JsZUhSUWIzTXVlU0FySUhoNVQyWm1jMlYwTG5rcFhISmNiaUFnSUNBdVpISmhkeWdwTzF4eVhHNTlPMXh5WEc0aUxDSnRiMlIxYkdVdVpYaHdiM0owY3lBOUlFMWhhVzVPWVhZN1hISmNibHh5WEc1bWRXNWpkR2x2YmlCTllXbHVUbUYyS0d4dllXUmxjaWtnZTF4eVhHNGdJSFJvYVhNdVgyeHZZV1JsY2lBOUlHeHZZV1JsY2p0Y2NseHVJQ0IwYUdsekxsOGtiRzluYnlBOUlDUW9YQ0p1WVhZdWJtRjJZbUZ5SUM1dVlYWmlZWEl0WW5KaGJtUmNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpHNWhkaUE5SUNRb1hDSWpiV0ZwYmkxdVlYWmNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpHNWhka3hwYm10eklEMGdkR2hwY3k1ZkpHNWhkaTVtYVc1a0tGd2lZVndpS1R0Y2NseHVJQ0IwYUdsekxsOGtZV04wYVhabFRtRjJJRDBnZEdocGN5NWZKRzVoZGt4cGJtdHpMbVpwYm1Rb1hDSXVZV04wYVhabFhDSXBPMXh5WEc0Z0lIUm9hWE11WHlSdVlYWk1hVzVyY3k1dmJpaGNJbU5zYVdOclhDSXNJSFJvYVhNdVgyOXVUbUYyUTJ4cFkyc3VZbWx1WkNoMGFHbHpLU2s3WEhKY2JpQWdkR2hwY3k1ZkpHeHZaMjh1YjI0b1hDSmpiR2xqYTF3aUxDQjBhR2x6TGw5dmJreHZaMjlEYkdsamF5NWlhVzVrS0hSb2FYTXBLVHRjY2x4dWZWeHlYRzVjY2x4dVRXRnBiazVoZGk1d2NtOTBiM1I1Y0dVdWMyVjBRV04wYVhabFJuSnZiVlZ5YkNBOUlHWjFibU4wYVc5dUtDa2dlMXh5WEc0Z0lIUm9hWE11WDJSbFlXTjBhWFpoZEdVb0tUdGNjbHh1SUNCMllYSWdkWEpzSUQwZ2JHOWpZWFJwYjI0dWNHRjBhRzVoYldVN1hISmNiaUFnYVdZZ0tIVnliQ0E5UFQwZ1hDSXZhVzVrWlhndWFIUnRiRndpSUh4OElIVnliQ0E5UFQwZ1hDSXZYQ0lwSUh0Y2NseHVJQ0FnSUhSb2FYTXVYMkZqZEdsMllYUmxUR2x1YXloMGFHbHpMbDhrYm1GMlRHbHVhM011Wm1sc2RHVnlLRndpSTJGaWIzVjBMV3hwYm10Y0lpa3BPMXh5WEc0Z0lIMGdaV3h6WlNCcFppQW9kWEpzSUQwOVBTQmNJaTkzYjNKckxtaDBiV3hjSWlrZ2UxeHlYRzRnSUNBZ2RHaHBjeTVmWVdOMGFYWmhkR1ZNYVc1cktIUm9hWE11WHlSdVlYWk1hVzVyY3k1bWFXeDBaWElvWENJamQyOXlheTFzYVc1clhDSXBLVHRjY2x4dUlDQjlJR1ZzYzJVZ2FXWWdLSFZ5YkNBOVBUMGdYQ0l2WTI5dWRHRmpkQzVvZEcxc1hDSXBJSHRjY2x4dUlDQWdJSFJvYVhNdVgyRmpkR2wyWVhSbFRHbHVheWgwYUdsekxsOGtibUYyVEdsdWEzTXVabWxzZEdWeUtGd2lJMk52Ym5SaFkzUXRiR2x1YTF3aUtTazdYSEpjYmlBZ2ZWeHlYRzU5TzF4eVhHNWNjbHh1VFdGcGJrNWhkaTV3Y205MGIzUjVjR1V1WDJSbFlXTjBhWFpoZEdVZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQnBaaUFvZEdocGN5NWZKR0ZqZEdsMlpVNWhkaTVzWlc1bmRHZ3BJSHRjY2x4dUlDQWdJSFJvYVhNdVh5UmhZM1JwZG1WT1lYWXVjbVZ0YjNabFEyeGhjM01vWENKaFkzUnBkbVZjSWlrN1hISmNiaUFnSUNCMGFHbHpMbDhrWVdOMGFYWmxUbUYySUQwZ0pDZ3BPMXh5WEc0Z0lIMWNjbHh1ZlR0Y2NseHVYSEpjYmsxaGFXNU9ZWFl1Y0hKdmRHOTBlWEJsTGw5aFkzUnBkbUYwWlV4cGJtc2dQU0JtZFc1amRHbHZiaWdrYkdsdWF5a2dlMXh5WEc0Z0lDUnNhVzVyTG1Ga1pFTnNZWE56S0Z3aVlXTjBhWFpsWENJcE8xeHlYRzRnSUhSb2FYTXVYeVJoWTNScGRtVk9ZWFlnUFNBa2JHbHVhenRjY2x4dWZUdGNjbHh1WEhKY2JrMWhhVzVPWVhZdWNISnZkRzkwZVhCbExsOXZia3h2WjI5RGJHbGpheUE5SUdaMWJtTjBhVzl1S0dVcElIdGNjbHh1SUNCbExuQnlaWFpsYm5SRVpXWmhkV3gwS0NrN1hISmNiaUFnZG1GeUlDUjBZWEpuWlhRZ1BTQWtLR1V1WTNWeWNtVnVkRlJoY21kbGRDazdYSEpjYmlBZ2RtRnlJSFZ5YkNBOUlDUjBZWEpuWlhRdVlYUjBjaWhjSW1oeVpXWmNJaWs3WEhKY2JpQWdkR2hwY3k1ZmJHOWhaR1Z5TG14dllXUlFZV2RsS0hWeWJDd2dlMzBzSUhSeWRXVXBPMXh5WEc1OU8xeHlYRzVjY2x4dVRXRnBiazVoZGk1d2NtOTBiM1I1Y0dVdVgyOXVUbUYyUTJ4cFkyc2dQU0JtZFc1amRHbHZiaWhsS1NCN1hISmNiaUFnWlM1d2NtVjJaVzUwUkdWbVlYVnNkQ2dwTzF4eVhHNGdJSFJvYVhNdVh5UnVZWFl1WTI5c2JHRndjMlVvWENKb2FXUmxYQ0lwT3lBdkx5QkRiRzl6WlNCMGFHVWdibUYySUMwZ2IyNXNlU0J0WVhSMFpYSnpJRzl1SUcxdlltbHNaVnh5WEc0Z0lIWmhjaUFrZEdGeVoyVjBJRDBnSkNobExtTjFjbkpsYm5SVVlYSm5aWFFwTzF4eVhHNGdJR2xtSUNna2RHRnlaMlYwTG1sektIUm9hWE11WHlSaFkzUnBkbVZPWVhZcEtTQnlaWFIxY200N1hISmNiaUFnZEdocGN5NWZaR1ZoWTNScGRtRjBaU2dwTzF4eVhHNGdJSFJvYVhNdVgyRmpkR2wyWVhSbFRHbHVheWdrZEdGeVoyVjBLVHRjY2x4dUlDQjJZWElnZFhKc0lEMGdKSFJoY21kbGRDNWhkSFJ5S0Z3aWFISmxabHdpS1R0Y2NseHVJQ0IwYUdsekxsOXNiMkZrWlhJdWJHOWhaRkJoWjJVb2RYSnNMQ0I3ZlN3Z2RISjFaU2s3WEhKY2JuMDdYSEpjYmlJc0luWmhjaUJNYjJGa1pYSWdQU0J5WlhGMWFYSmxLRndpTGk5d1lXZGxMV3h2WVdSbGNpNXFjMXdpS1R0Y2NseHVkbUZ5SUUxaGFXNU9ZWFlnUFNCeVpYRjFhWEpsS0Z3aUxpOXRZV2x1TFc1aGRpNXFjMXdpS1R0Y2NseHVkbUZ5SUVodmRtVnlVMnhwWkdWemFHOTNjeUE5SUhKbGNYVnBjbVVvWENJdUwyaHZkbVZ5TFhOc2FXUmxjMmh2ZHk1cWMxd2lLVHRjY2x4dWRtRnlJRkJ2Y25SbWIyeHBiMFpwYkhSbGNpQTlJSEpsY1hWcGNtVW9YQ0l1TDNCdmNuUm1iMnhwYnkxbWFXeDBaWEl1YW5OY0lpazdYSEpjYm5aaGNpQnpiR2xrWlhOb2IzZHpJRDBnY21WeGRXbHlaU2hjSWk0dmRHaDFiV0p1WVdsc0xYTnNhV1JsYzJodmR5OXpiR2xrWlhOb2IzY3Vhbk5jSWlrN1hISmNibHh5WEc0dkx5QlFhV05yYVc1bklHRWdjbUZ1Wkc5dElITnJaWFJqYUNCMGFHRjBJSFJvWlNCMWMyVnlJR2hoYzI0bmRDQnpaV1Z1SUdKbFptOXlaVnh5WEc1MllYSWdVMnRsZEdOb0lEMGdjbVZ4ZFdseVpTaGNJaTR2Y0dsamF5MXlZVzVrYjIwdGMydGxkR05vTG1welhDSXBLQ2s3WEhKY2JseHlYRzR2THlCQlNrRllJSEJoWjJVZ2JHOWhaR1Z5TENCM2FYUm9JR05oYkd4aVlXTnJJR1p2Y2lCeVpXeHZZV1JwYm1jZ2QybGtaMlYwYzF4eVhHNTJZWElnYkc5aFpHVnlJRDBnYm1WM0lFeHZZV1JsY2lodmJsQmhaMlZNYjJGa0tUdGNjbHh1WEhKY2JpOHZJRTFoYVc0Z2JtRjJJSGRwWkdkbGRGeHlYRzUyWVhJZ2JXRnBiazVoZGlBOUlHNWxkeUJOWVdsdVRtRjJLR3h2WVdSbGNpazdYSEpjYmx4eVhHNHZMeUJKYm5SbGNtRmpkR2wyWlNCc2IyZHZJR2x1SUc1aGRtSmhjbHh5WEc1MllYSWdibUYySUQwZ0pDaGNJbTVoZGk1dVlYWmlZWEpjSWlrN1hISmNiblpoY2lCdVlYWk1iMmR2SUQwZ2JtRjJMbVpwYm1Rb1hDSXVibUYyWW1GeUxXSnlZVzVrWENJcE8xeHlYRzV1WlhjZ1UydGxkR05vS0c1aGRpd2dibUYyVEc5bmJ5azdYSEpjYmx4eVhHNHZMeUJYYVdSblpYUWdaMnh2WW1Gc2MxeHlYRzUyWVhJZ2NHOXlkR1p2YkdsdlJtbHNkR1Z5TzF4eVhHNWNjbHh1THk4Z1RHOWhaQ0JoYkd3Z2QybGtaMlYwYzF4eVhHNXZibEJoWjJWTWIyRmtLQ2s3WEhKY2JseHlYRzR2THlCSVlXNWtiR1VnWW1GamF5OW1iM0ozWVhKa0lHSjFkSFJ2Ym5OY2NseHVkMmx1Wkc5M0xtRmtaRVYyWlc1MFRHbHpkR1Z1WlhJb1hDSndiM0J6ZEdGMFpWd2lMQ0J2YmxCdmNGTjBZWFJsS1R0Y2NseHVYSEpjYm1aMWJtTjBhVzl1SUc5dVVHOXdVM1JoZEdVb1pTa2dlMXh5WEc0Z0lDOHZJRXh2WVdSbGNpQnpkRzl5WlhNZ1kzVnpkRzl0SUdSaGRHRWdhVzRnZEdobElITjBZWFJsSUMwZ2FXNWpiSFZrYVc1bklIUm9aU0IxY213Z1lXNWtJSFJvWlNCeGRXVnllVnh5WEc0Z0lIWmhjaUIxY213Z1BTQW9aUzV6ZEdGMFpTQW1KaUJsTG5OMFlYUmxMblZ5YkNrZ2ZId2dYQ0l2YVc1a1pYZ3VhSFJ0YkZ3aU8xeHlYRzRnSUhaaGNpQnhkV1Z5ZVU5aWFtVmpkQ0E5SUNobExuTjBZWFJsSUNZbUlHVXVjM1JoZEdVdWNYVmxjbmtwSUh4OElIdDlPMXh5WEc1Y2NseHVJQ0JwWmlBb2RYSnNJRDA5UFNCc2IyRmtaWEl1WjJWMFRHOWhaR1ZrVUdGMGFDZ3BJQ1ltSUhWeWJDQTlQVDBnWENJdmQyOXlheTVvZEcxc1hDSXBJSHRjY2x4dUlDQWdJQzh2SUZSb1pTQmpkWEp5Wlc1MElDWWdjSEpsZG1sdmRYTWdiRzloWkdWa0lITjBZWFJsY3lCM1pYSmxJSGR2Y21zdWFIUnRiQ3dnYzI4Z2FuVnpkQ0J5WldacGJIUmxjbHh5WEc0Z0lDQWdkbUZ5SUdOaGRHVm5iM0o1SUQwZ2NYVmxjbmxQWW1wbFkzUXVZMkYwWldkdmNua2dmSHdnWENKaGJHeGNJanRjY2x4dUlDQWdJSEJ2Y25SbWIyeHBiMFpwYkhSbGNpNXpaV3hsWTNSRFlYUmxaMjl5ZVNoallYUmxaMjl5ZVNrN1hISmNiaUFnZlNCbGJITmxJSHRjY2x4dUlDQWdJQzh2SUV4dllXUWdkR2hsSUc1bGR5QndZV2RsWEhKY2JpQWdJQ0JzYjJGa1pYSXViRzloWkZCaFoyVW9kWEpzTENCN2ZTd2dabUZzYzJVcE8xeHlYRzRnSUgxY2NseHVmVnh5WEc1Y2NseHVablZ1WTNScGIyNGdiMjVRWVdkbFRHOWhaQ2dwSUh0Y2NseHVJQ0F2THlCU1pXeHZZV1FnWVd4c0lIQnNkV2RwYm5NdmQybGtaMlYwYzF4eVhHNGdJRzVsZHlCSWIzWmxjbE5zYVdSbGMyaHZkM01vS1R0Y2NseHVJQ0J3YjNKMFptOXNhVzlHYVd4MFpYSWdQU0J1WlhjZ1VHOXlkR1p2YkdsdlJtbHNkR1Z5S0d4dllXUmxjaWs3WEhKY2JpQWdjMnhwWkdWemFHOTNjeTVwYm1sMEtDazdYSEpjYmlBZ2IySnFaV04wUm1sMFNXMWhaMlZ6S0NrN1hISmNiaUFnYzIxaGNuUnhkVzkwWlhNb0tUdGNjbHh1WEhKY2JpQWdMeThnVW1Wa2FYSmxZM1FnWkdGMFlTMXBiblJsY201aGJDMXNhVzVySUdoNWNHVnliR2x1YTNNZ2RHaHliM1ZuYUNCMGFHVWdiRzloWkdWeVhISmNiaUFnZG1GeUlHbHVkR1Z5Ym1Gc1RHbHVhM01nUFNBa0tGd2lZVnRrWVhSaExXbHVkR1Z5Ym1Gc0xXeHBibXRkWENJcE8xeHlYRzRnSUdsdWRHVnlibUZzVEdsdWEzTXViMjRvWENKamJHbGphMXdpTENCbWRXNWpkR2x2YmlobGRtVnVkQ2tnZTF4eVhHNGdJQ0FnWlhabGJuUXVjSEpsZG1WdWRFUmxabUYxYkhRb0tUdGNjbHh1SUNBZ0lHeHZZV1JsY2k1c2IyRmtVR0ZuWlNna0tHVjJaVzUwTG1OMWNuSmxiblJVWVhKblpYUXBMbUYwZEhJb1hDSm9jbVZtWENJcExDQjdmU3dnZEhKMVpTazdYSEpjYmlBZ2ZTazdYSEpjYmx4eVhHNGdJQzh2SUZOc2FXZG9kR3g1SUhKbFpIVnVaR0Z1ZEN3Z1luVjBJSFZ3WkdGMFpTQjBhR1VnYldGcGJpQnVZWFlnZFhOcGJtY2dkR2hsSUdOMWNuSmxiblFnVlZKTUxpQlVhR2x6WEhKY2JpQWdMeThnYVhNZ2FXMXdiM0owWVc1MElHbG1JR0VnY0dGblpTQnBjeUJzYjJGa1pXUWdZbmtnZEhsd2FXNW5JR0VnWm5Wc2JDQlZVa3dnS0dVdVp5NGdaMjlwYm1kY2NseHVJQ0F2THlCa2FYSmxZM1JzZVNCMGJ5QXZkMjl5YXk1b2RHMXNLU0J2Y2lCM2FHVnVJRzF2ZG1sdVp5Qm1jbTl0SUhkdmNtc3VhSFJ0YkNCMGJ5QmhJSEJ5YjJwbFkzUXVYSEpjYmlBZ2JXRnBiazVoZGk1elpYUkJZM1JwZG1WR2NtOXRWWEpzS0NrN1hISmNibjFjY2x4dVhISmNiaTh2SUZkbEozWmxJR2hwZENCMGFHVWdiR0Z1WkdsdVp5QndZV2RsTENCc2IyRmtJSFJvWlNCaFltOTFkQ0J3WVdkbFhISmNiaTh2SUdsbUlDaHNiMk5oZEdsdmJpNXdZWFJvYm1GdFpTNXRZWFJqYUNndlhpaGNYQzk4WEZ3dmFXNWtaWGd1YUhSdGJIeHBibVJsZUM1b2RHMXNLU1F2S1NrZ2UxeHlYRzR2THlBZ0lDQWdiRzloWkdWeUxteHZZV1JRWVdkbEtGd2lMMkZpYjNWMExtaDBiV3hjSWl3Z2UzMHNJR1poYkhObEtUdGNjbHh1THk4Z2ZWeHlYRzRpTENKdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUV4dllXUmxjanRjY2x4dVhISmNiblpoY2lCMWRHbHNhWFJwWlhNZ1BTQnlaWEYxYVhKbEtGd2lMaTkxZEdsc2FYUnBaWE11YW5OY0lpazdYSEpjYmx4eVhHNW1kVzVqZEdsdmJpQk1iMkZrWlhJb2IyNVNaV3h2WVdRc0lHWmhaR1ZFZFhKaGRHbHZiaWtnZTF4eVhHNGdJSFJvYVhNdVh5UmpiMjUwWlc1MElEMGdKQ2hjSWlOamIyNTBaVzUwWENJcE8xeHlYRzRnSUhSb2FYTXVYMjl1VW1Wc2IyRmtJRDBnYjI1U1pXeHZZV1E3WEhKY2JpQWdkR2hwY3k1ZlptRmtaVVIxY21GMGFXOXVJRDBnWm1Ga1pVUjFjbUYwYVc5dUlDRTlQU0IxYm1SbFptbHVaV1FnUHlCbVlXUmxSSFZ5WVhScGIyNGdPaUF5TlRBN1hISmNiaUFnZEdocGN5NWZjR0YwYUNBOUlHeHZZMkYwYVc5dUxuQmhkR2h1WVcxbE8xeHlYRzU5WEhKY2JseHlYRzVNYjJGa1pYSXVjSEp2ZEc5MGVYQmxMbWRsZEV4dllXUmxaRkJoZEdnZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQnlaWFIxY200Z2RHaHBjeTVmY0dGMGFEdGNjbHh1ZlR0Y2NseHVYSEpjYmt4dllXUmxjaTV3Y205MGIzUjVjR1V1Ykc5aFpGQmhaMlVnUFNCbWRXNWpkR2x2YmloMWNtd3NJSEYxWlhKNVQySnFaV04wTENCemFHOTFiR1JRZFhOb1NHbHpkRzl5ZVNrZ2UxeHlYRzRnSUM4dklFWmhaR1VnZEdobGJpQmxiWEIwZVNCMGFHVWdZM1Z5Y21WdWRDQmpiMjUwWlc1MGMxeHlYRzRnSUhSb2FYTXVYeVJqYjI1MFpXNTBMblpsYkc5amFYUjVLRnh5WEc0Z0lDQWdleUJ2Y0dGamFYUjVPaUF3SUgwc1hISmNiaUFnSUNCMGFHbHpMbDltWVdSbFJIVnlZWFJwYjI0c1hISmNiaUFnSUNCY0luTjNhVzVuWENJc1hISmNiaUFnSUNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNBZ0lDQWdkR2hwY3k1ZkpHTnZiblJsYm5RdVpXMXdkSGtvS1R0Y2NseHVJQ0FnSUNBZ2RHaHBjeTVmSkdOdmJuUmxiblF1Ykc5aFpDaDFjbXdnS3lCY0lpQWpZMjl1ZEdWdWRGd2lMQ0J2YmtOdmJuUmxiblJHWlhSamFHVmtMbUpwYm1Rb2RHaHBjeWtwTzF4eVhHNGdJQ0FnZlM1aWFXNWtLSFJvYVhNcFhISmNiaUFnS1R0Y2NseHVYSEpjYmlBZ0x5OGdSbUZrWlNCMGFHVWdibVYzSUdOdmJuUmxiblFnYVc0Z1lXWjBaWElnYVhRZ2FHRnpJR0psWlc0Z1ptVjBZMmhsWkZ4eVhHNGdJR1oxYm1OMGFXOXVJRzl1UTI5dWRHVnVkRVpsZEdOb1pXUW9jbVZ6Y0c5dWMyVlVaWGgwTENCMFpYaDBVM1JoZEhWektTQjdYSEpjYmlBZ0lDQnBaaUFvZEdWNGRGTjBZWFIxY3lBOVBUMGdYQ0psY25KdmNsd2lLU0I3WEhKY2JpQWdJQ0FnSUdOdmJuTnZiR1V1Ykc5bktGd2lWR2hsY21VZ2QyRnpJR0VnY0hKdllteGxiU0JzYjJGa2FXNW5JSFJvWlNCd1lXZGxMbHdpS1R0Y2NseHVJQ0FnSUNBZ2NtVjBkWEp1TzF4eVhHNGdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lIWmhjaUJ4ZFdWeWVWTjBjbWx1WnlBOUlIVjBhV3hwZEdsbGN5NWpjbVZoZEdWUmRXVnllVk4wY21sdVp5aHhkV1Z5ZVU5aWFtVmpkQ2s3WEhKY2JpQWdJQ0JwWmlBb2MyaHZkV3hrVUhWemFFaHBjM1J2Y25rcElIdGNjbHh1SUNBZ0lDQWdhR2x6ZEc5eWVTNXdkWE5vVTNSaGRHVW9YSEpjYmlBZ0lDQWdJQ0FnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdkWEpzT2lCMWNtd3NYSEpjYmlBZ0lDQWdJQ0FnSUNCeGRXVnllVG9nY1hWbGNubFBZbXBsWTNSY2NseHVJQ0FnSUNBZ0lDQjlMRnh5WEc0Z0lDQWdJQ0FnSUc1MWJHd3NYSEpjYmlBZ0lDQWdJQ0FnZFhKc0lDc2djWFZsY25sVGRISnBibWRjY2x4dUlDQWdJQ0FnS1R0Y2NseHVJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQXZMeUJWY0dSaGRHVWdSMjl2WjJ4bElHRnVZV3g1ZEdsamMxeHlYRzRnSUNBZ1oyRW9YQ0p6WlhSY0lpd2dYQ0p3WVdkbFhDSXNJSFZ5YkNBcklIRjFaWEo1VTNSeWFXNW5LVHRjY2x4dUlDQWdJR2RoS0Z3aWMyVnVaRndpTENCY0luQmhaMlYyYVdWM1hDSXBPMXh5WEc1Y2NseHVJQ0FnSUhSb2FYTXVYM0JoZEdnZ1BTQnNiMk5oZEdsdmJpNXdZWFJvYm1GdFpUdGNjbHh1SUNBZ0lIUm9hWE11WHlSamIyNTBaVzUwTG5abGJHOWphWFI1S0hzZ2IzQmhZMmwwZVRvZ01TQjlMQ0IwYUdsekxsOW1ZV1JsUkhWeVlYUnBiMjRzSUZ3aWMzZHBibWRjSWlrN1hISmNiaUFnSUNCMGFHbHpMbDl2YmxKbGJHOWhaQ2dwTzF4eVhHNGdJSDFjY2x4dWZUdGNjbHh1SWl3aWRtRnlJR052YjJ0cFpYTWdQU0J5WlhGMWFYSmxLRndpYW5NdFkyOXZhMmxsWENJcE8xeHlYRzUyWVhJZ2RYUnBiSE1nUFNCeVpYRjFhWEpsS0Z3aUxpOTFkR2xzYVhScFpYTXVhbk5jSWlrN1hISmNibHh5WEc1MllYSWdjMnRsZEdOb1EyOXVjM1J5ZFdOMGIzSnpJRDBnZTF4eVhHNGdJRndpYUdGc1puUnZibVV0Wm14aGMyaHNhV2RvZEZ3aU9pQnlaWEYxYVhKbEtGd2lMaTlwYm5SbGNtRmpkR2wyWlMxc2IyZHZjeTlvWVd4bWRHOXVaUzFtYkdGemFHeHBaMmgwTFhkdmNtUXVhbk5jSWlrc1hISmNiaUFnWENKdWIybHplUzEzYjNKa1hDSTZJSEpsY1hWcGNtVW9YQ0l1TDJsdWRHVnlZV04wYVhabExXeHZaMjl6TDI1dmFYTjVMWGR2Y21RdGMydGxkR05vTG1welhDSXBMRnh5WEc0Z0lGd2lZMjl1Ym1WamRDMXdiMmx1ZEhOY0lqb2djbVZ4ZFdseVpTaGNJaTR2YVc1MFpYSmhZM1JwZG1VdGJHOW5iM012WTI5dWJtVmpkQzF3YjJsdWRITXRjMnRsZEdOb0xtcHpYQ0lwWEhKY2JuMDdYSEpjYm5aaGNpQnVkVzFUYTJWMFkyaGxjeUE5SUU5aWFtVmpkQzVyWlhsektITnJaWFJqYUVOdmJuTjBjblZqZEc5eWN5a3ViR1Z1WjNSb08xeHlYRzUyWVhJZ1kyOXZhMmxsUzJWNUlEMGdYQ0p6WldWdUxYTnJaWFJqYUMxdVlXMWxjMXdpTzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUZCcFkyc2dZU0J5WVc1a2IyMGdjMnRsZEdOb0lIUm9ZWFFnZFhObGNpQm9ZWE51SjNRZ2MyVmxiaUI1WlhRdUlFbG1JSFJvWlNCMWMyVnlJR2hoY3lCelpXVnVJR0ZzYkNCMGFHVmNjbHh1SUNvZ2MydGxkR05vWlhNc0lHcDFjM1FnY0dsamF5QmhJSEpoYm1SdmJTQnZibVV1SUZSb2FYTWdkWE5sY3lCamIyOXJhV1Z6SUhSdklIUnlZV05ySUhkb1lYUWdkR2hsSUhWelpYSmNjbHh1SUNvZ2FHRnpJSE5sWlc0Z1lXeHlaV0ZrZVM1Y2NseHVJQ29nUUhKbGRIVnliaUI3Um5WdVkzUnBiMjU5SUVOdmJuTjBjblZqZEc5eUlHWnZjaUJoSUZOclpYUmphQ0JqYkdGemMxeHlYRzRnS2k5Y2NseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQm1kVzVqZEdsdmJpQndhV05yVW1GdVpHOXRVMnRsZEdOb0tDa2dlMXh5WEc0Z0lIWmhjaUJ6WldWdVUydGxkR05vVG1GdFpYTWdQU0JqYjI5cmFXVnpMbWRsZEVwVFQwNG9ZMjl2YTJsbFMyVjVLU0I4ZkNCYlhUdGNjbHh1WEhKY2JpQWdMeThnUm1sdVpDQjBhR1VnYm1GdFpYTWdiMllnZEdobElIVnVjMlZsYmlCemEyVjBZMmhsYzF4eVhHNGdJSFpoY2lCMWJuTmxaVzVUYTJWMFkyaE9ZVzFsY3lBOUlHWnBibVJWYm5ObFpXNVRhMlYwWTJobGN5aHpaV1Z1VTJ0bGRHTm9UbUZ0WlhNcE8xeHlYRzVjY2x4dUlDQXZMeUJCYkd3Z2MydGxkR05vWlhNZ2FHRjJaU0JpWldWdUlITmxaVzVjY2x4dUlDQnBaaUFvZFc1elpXVnVVMnRsZEdOb1RtRnRaWE11YkdWdVozUm9JRDA5UFNBd0tTQjdYSEpjYmlBZ0lDQXZMeUJKWmlCM1pTZDJaU0JuYjNRZ2JXOXlaU0IwYUdWdUlHOXVaU0J6YTJWMFkyZ3NJSFJvWlc0Z2JXRnJaU0J6ZFhKbElIUnZJR05vYjI5elpTQmhJSEpoYm1SdmJWeHlYRzRnSUNBZ0x5OGdjMnRsZEdOb0lHVjRZMngxWkdsdVp5QjBhR1VnYlc5emRDQnlaV05sYm5Sc2VTQnpaV1Z1SUhOclpYUmphRnh5WEc0Z0lDQWdhV1lnS0c1MWJWTnJaWFJqYUdWeklENGdNU2tnZTF4eVhHNGdJQ0FnSUNCelpXVnVVMnRsZEdOb1RtRnRaWE1nUFNCYmMyVmxibE5yWlhSamFFNWhiV1Z6TG5CdmNDZ3BYVHRjY2x4dUlDQWdJQ0FnZFc1elpXVnVVMnRsZEdOb1RtRnRaWE1nUFNCbWFXNWtWVzV6WldWdVUydGxkR05vWlhNb2MyVmxibE5yWlhSamFFNWhiV1Z6S1R0Y2NseHVJQ0FnSUgwZ1pXeHpaU0I3WEhKY2JpQWdJQ0FnSUM4dklFbG1JSGRsSjNabElHOXViSGtnWjI5MElHOXVaU0J6YTJWMFkyZ3NJSFJvWlc0Z2QyVWdZMkZ1SjNRZ1pHOGdiWFZqYUM0dUxseHlYRzRnSUNBZ0lDQnpaV1Z1VTJ0bGRHTm9UbUZ0WlhNZ1BTQmJYVHRjY2x4dUlDQWdJQ0FnZFc1elpXVnVVMnRsZEdOb1RtRnRaWE1nUFNCUFltcGxZM1F1YTJWNWN5aHphMlYwWTJoRGIyNXpkSEoxWTNSdmNuTXBPMXh5WEc0Z0lDQWdmVnh5WEc0Z0lIMWNjbHh1WEhKY2JpQWdkbUZ5SUhKaGJtUlRhMlYwWTJoT1lXMWxJRDBnZFhScGJITXVjbUZ1WkVGeWNtRjVSV3hsYldWdWRDaDFibk5sWlc1VGEyVjBZMmhPWVcxbGN5azdYSEpjYmlBZ2MyVmxibE5yWlhSamFFNWhiV1Z6TG5CMWMyZ29jbUZ1WkZOclpYUmphRTVoYldVcE8xeHlYRzVjY2x4dUlDQXZMeUJUZEc5eVpTQjBhR1VnWjJWdVpYSmhkR1ZrSUhOclpYUmphQ0JwYmlCaElHTnZiMnRwWlM0Z1ZHaHBjeUJqY21WaGRHVnpJR0VnYlc5MmFXNW5JRGNnWkdGNVhISmNiaUFnTHk4Z2QybHVaRzkzSUMwZ1lXNTVkR2x0WlNCMGFHVWdjMmwwWlNCcGN5QjJhWE5wZEdWa0xDQjBhR1VnWTI5dmEybGxJR2x6SUhKbFpuSmxjMmhsWkM1Y2NseHVJQ0JqYjI5cmFXVnpMbk5sZENoamIyOXJhV1ZMWlhrc0lITmxaVzVUYTJWMFkyaE9ZVzFsY3l3Z2V5QmxlSEJwY21Wek9pQTNJSDBwTzF4eVhHNWNjbHh1SUNCeVpYUjFjbTRnYzJ0bGRHTm9RMjl1YzNSeWRXTjBiM0p6VzNKaGJtUlRhMlYwWTJoT1lXMWxYVHRjY2x4dWZUdGNjbHh1WEhKY2JtWjFibU4wYVc5dUlHWnBibVJWYm5ObFpXNVRhMlYwWTJobGN5aHpaV1Z1VTJ0bGRHTm9UbUZ0WlhNcElIdGNjbHh1SUNCMllYSWdkVzV6WldWdVUydGxkR05vVG1GdFpYTWdQU0JiWFR0Y2NseHVJQ0JtYjNJZ0tIWmhjaUJ6YTJWMFkyaE9ZVzFsSUdsdUlITnJaWFJqYUVOdmJuTjBjblZqZEc5eWN5a2dlMXh5WEc0Z0lDQWdhV1lnS0hObFpXNVRhMlYwWTJoT1lXMWxjeTVwYm1SbGVFOW1LSE5yWlhSamFFNWhiV1VwSUQwOVBTQXRNU2tnZTF4eVhHNGdJQ0FnSUNCMWJuTmxaVzVUYTJWMFkyaE9ZVzFsY3k1d2RYTm9LSE5yWlhSamFFNWhiV1VwTzF4eVhHNGdJQ0FnZlZ4eVhHNGdJSDFjY2x4dUlDQnlaWFIxY200Z2RXNXpaV1Z1VTJ0bGRHTm9UbUZ0WlhNN1hISmNibjFjY2x4dUlpd2liVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQlFiM0owWm05c2FXOUdhV3gwWlhJN1hISmNibHh5WEc1MllYSWdkWFJwYkdsMGFXVnpJRDBnY21WeGRXbHlaU2hjSWk0dmRYUnBiR2wwYVdWekxtcHpYQ0lwTzF4eVhHNWNjbHh1ZG1GeUlHUmxabUYxYkhSQ2NtVmhhM0J2YVc1MGN5QTlJRnRjY2x4dUlDQjdJSGRwWkhSb09pQXhNakF3TENCamIyeHpPaUF6TENCemNHRmphVzVuT2lBeE5TQjlMRnh5WEc0Z0lIc2dkMmxrZEdnNklEazVNaXdnWTI5c2N6b2dNeXdnYzNCaFkybHVaem9nTVRVZ2ZTeGNjbHh1SUNCN0lIZHBaSFJvT2lBM01EQXNJR052YkhNNklETXNJSE53WVdOcGJtYzZJREUxSUgwc1hISmNiaUFnZXlCM2FXUjBhRG9nTmpBd0xDQmpiMnh6T2lBeUxDQnpjR0ZqYVc1bk9pQXhNQ0I5TEZ4eVhHNGdJSHNnZDJsa2RHZzZJRFE0TUN3Z1kyOXNjem9nTWl3Z2MzQmhZMmx1WnpvZ01UQWdmU3hjY2x4dUlDQjdJSGRwWkhSb09pQXpNakFzSUdOdmJITTZJREVzSUhOd1lXTnBibWM2SURFd0lIMWNjbHh1WFR0Y2NseHVYSEpjYm1aMWJtTjBhVzl1SUZCdmNuUm1iMnhwYjBacGJIUmxjaWhzYjJGa1pYSXNJR0p5WldGcmNHOXBiblJ6TENCaGMzQmxZM1JTWVhScGJ5d2dkSEpoYm5OcGRHbHZia1IxY21GMGFXOXVLU0I3WEhKY2JpQWdkR2hwY3k1ZmJHOWhaR1Z5SUQwZ2JHOWhaR1Z5TzF4eVhHNGdJSFJvYVhNdVgyZHlhV1JUY0dGamFXNW5JRDBnTUR0Y2NseHVJQ0IwYUdsekxsOWhjM0JsWTNSU1lYUnBieUE5SUdGemNHVmpkRkpoZEdsdklDRTlQU0IxYm1SbFptbHVaV1FnUHlCaGMzQmxZM1JTWVhScGJ5QTZJREUySUM4Z09UdGNjbHh1SUNCMGFHbHpMbDkwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRnUFNCMGNtRnVjMmwwYVc5dVJIVnlZWFJwYjI0Z0lUMDlJSFZ1WkdWbWFXNWxaQ0EvSUhSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlBNklEZ3dNRHRjY2x4dUlDQjBhR2x6TGw5aWNtVmhhM0J2YVc1MGN5QTlJR0p5WldGcmNHOXBiblJ6SUNFOVBTQjFibVJsWm1sdVpXUWdQeUJpY21WaGEzQnZhVzUwY3k1emJHbGpaU2dwSURvZ1pHVm1ZWFZzZEVKeVpXRnJjRzlwYm5SekxuTnNhV05sS0NrN1hISmNiaUFnZEdocGN5NWZKR2R5YVdRZ1BTQWtLRndpSTNCdmNuUm1iMnhwYnkxbmNtbGtYQ0lwTzF4eVhHNGdJSFJvYVhNdVh5UnVZWFlnUFNBa0tGd2lJM0J2Y25SbWIyeHBieTF1WVhaY0lpazdYSEpjYmlBZ2RHaHBjeTVmSkhCeWIycGxZM1J6SUQwZ1cxMDdYSEpjYmlBZ2RHaHBjeTVmSkdOaGRHVm5iM0pwWlhNZ1BTQjdmVHRjY2x4dUlDQjBhR2x6TGw5eWIzZHpJRDBnTUR0Y2NseHVJQ0IwYUdsekxsOWpiMnh6SUQwZ01EdGNjbHh1SUNCMGFHbHpMbDlwYldGblpVaGxhV2RvZENBOUlEQTdYSEpjYmlBZ2RHaHBjeTVmYVcxaFoyVlhhV1IwYUNBOUlEQTdYSEpjYmx4eVhHNGdJQzh2SUZOdmNuUWdkR2hsSUdKeVpXRnJjRzlwYm5SeklHbHVJR1JsYzJObGJtUnBibWNnYjNKa1pYSmNjbHh1SUNCMGFHbHpMbDlpY21WaGEzQnZhVzUwY3k1emIzSjBLR1oxYm1OMGFXOXVLR0VzSUdJcElIdGNjbHh1SUNBZ0lHbG1JQ2hoTG5kcFpIUm9JRHdnWWk1M2FXUjBhQ2tnY21WMGRYSnVJQzB4TzF4eVhHNGdJQ0FnWld4elpTQnBaaUFvWVM1M2FXUjBhQ0ErSUdJdWQybGtkR2dwSUhKbGRIVnliaUF4TzF4eVhHNGdJQ0FnWld4elpTQnlaWFIxY200Z01EdGNjbHh1SUNCOUtUdGNjbHh1WEhKY2JpQWdkR2hwY3k1ZlkyRmphR1ZRY205cVpXTjBjeWdwTzF4eVhHNGdJSFJvYVhNdVgyTnlaV0YwWlVkeWFXUW9LVHRjY2x4dVhISmNiaUFnZEdocGN5NWZKR2R5YVdRdVptbHVaQ2hjSWk1d2NtOXFaV04wSUdGY0lpa3ViMjRvWENKamJHbGphMXdpTENCMGFHbHpMbDl2YmxCeWIycGxZM1JEYkdsamF5NWlhVzVrS0hSb2FYTXBLVHRjY2x4dVhISmNiaUFnZG1GeUlIRnpJRDBnZFhScGJHbDBhV1Z6TG1kbGRGRjFaWEo1VUdGeVlXMWxkR1Z5Y3lncE8xeHlYRzRnSUhaaGNpQnBibWwwYVdGc1EyRjBaV2R2Y25rZ1BTQnhjeTVqWVhSbFoyOXllU0I4ZkNCY0ltRnNiRndpTzF4eVhHNGdJSFpoY2lCallYUmxaMjl5ZVNBOUlHbHVhWFJwWVd4RFlYUmxaMjl5ZVM1MGIweHZkMlZ5UTJGelpTZ3BPMXh5WEc0Z0lIUm9hWE11WHlSaFkzUnBkbVZPWVhaSmRHVnRJRDBnZEdocGN5NWZKRzVoZGk1bWFXNWtLRndpWVZ0a1lYUmhMV05oZEdWbmIzSjVQVndpSUNzZ1kyRjBaV2R2Y25rZ0t5QmNJbDFjSWlrN1hISmNiaUFnZEdocGN5NWZKR0ZqZEdsMlpVNWhka2wwWlcwdVlXUmtRMnhoYzNNb1hDSmhZM1JwZG1WY0lpazdYSEpjYmlBZ2RHaHBjeTVmWm1sc2RHVnlVSEp2YW1WamRITW9ZMkYwWldkdmNua3BPMXh5WEc0Z0lDUW9YQ0lqY0c5eWRHWnZiR2x2TFc1aGRpQmhYQ0lwTG05dUtGd2lZMnhwWTJ0Y0lpd2dkR2hwY3k1ZmIyNU9ZWFpEYkdsamF5NWlhVzVrS0hSb2FYTXBLVHRjY2x4dVhISmNiaUFnSkNoM2FXNWtiM2NwTG05dUtGd2ljbVZ6YVhwbFhDSXNJSFJvYVhNdVgyTnlaV0YwWlVkeWFXUXVZbWx1WkNoMGFHbHpLU2s3WEhKY2JuMWNjbHh1WEhKY2JsQnZjblJtYjJ4cGIwWnBiSFJsY2k1d2NtOTBiM1I1Y0dVdWMyVnNaV04wUTJGMFpXZHZjbmtnUFNCbWRXNWpkR2x2YmloallYUmxaMjl5ZVNrZ2UxeHlYRzRnSUdOaGRHVm5iM0o1SUQwZ0tHTmhkR1ZuYjNKNUlDWW1JR05oZEdWbmIzSjVMblJ2VEc5M1pYSkRZWE5sS0NrcElIeDhJRndpWVd4c1hDSTdYSEpjYmlBZ2RtRnlJQ1J6Wld4bFkzUmxaRTVoZGlBOUlIUm9hWE11WHlSdVlYWXVabWx1WkNoY0ltRmJaR0YwWVMxallYUmxaMjl5ZVQxY0lpQXJJR05oZEdWbmIzSjVJQ3NnWENKZFhDSXBPMXh5WEc0Z0lHbG1JQ2drYzJWc1pXTjBaV1JPWVhZdWJHVnVaM1JvSUNZbUlDRWtjMlZzWldOMFpXUk9ZWFl1YVhNb2RHaHBjeTVmSkdGamRHbDJaVTVoZGtsMFpXMHBLU0I3WEhKY2JpQWdJQ0IwYUdsekxsOGtZV04wYVhabFRtRjJTWFJsYlM1eVpXMXZkbVZEYkdGemN5aGNJbUZqZEdsMlpWd2lLVHRjY2x4dUlDQWdJSFJvYVhNdVh5UmhZM1JwZG1WT1lYWkpkR1Z0SUQwZ0pITmxiR1ZqZEdWa1RtRjJPMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHRmpkR2wyWlU1aGRrbDBaVzB1WVdSa1EyeGhjM01vWENKaFkzUnBkbVZjSWlrN1hISmNiaUFnSUNCMGFHbHpMbDltYVd4MFpYSlFjbTlxWldOMGN5aGpZWFJsWjI5eWVTazdYSEpjYmlBZ2ZWeHlYRzU5TzF4eVhHNWNjbHh1VUc5eWRHWnZiR2x2Um1sc2RHVnlMbkJ5YjNSdmRIbHdaUzVmWm1sc2RHVnlVSEp2YW1WamRITWdQU0JtZFc1amRHbHZiaWhqWVhSbFoyOXllU2tnZTF4eVhHNGdJSFpoY2lBa2MyVnNaV04wWldSRmJHVnRaVzUwY3lBOUlIUm9hWE11WDJkbGRGQnliMnBsWTNSelNXNURZWFJsWjI5eWVTaGpZWFJsWjI5eWVTazdYSEpjYmx4eVhHNGdJQzh2SUVGdWFXMWhkR1VnZEdobElHZHlhV1FnZEc4Z2RHaGxJR052Y25KbFkzUWdhR1ZwWjJoMElIUnZJR052Ym5SaGFXNGdkR2hsSUhKdmQzTmNjbHh1SUNCMGFHbHpMbDloYm1sdFlYUmxSM0pwWkVobGFXZG9kQ2drYzJWc1pXTjBaV1JGYkdWdFpXNTBjeTVzWlc1bmRHZ3BPMXh5WEc1Y2NseHVJQ0F2THlCTWIyOXdJSFJvY205MVoyZ2dZV3hzSUhCeWIycGxZM1J6WEhKY2JpQWdkR2hwY3k1ZkpIQnliMnBsWTNSekxtWnZja1ZoWTJnb1hISmNiaUFnSUNCbWRXNWpkR2x2Ymlna1pXeGxiV1Z1ZENrZ2UxeHlYRzRnSUNBZ0lDQXZMeUJUZEc5d0lHRnNiQ0JoYm1sdFlYUnBiMjV6WEhKY2JpQWdJQ0FnSUNSbGJHVnRaVzUwTG5abGJHOWphWFI1S0Z3aWMzUnZjRndpS1R0Y2NseHVJQ0FnSUNBZ0x5OGdTV1lnWVc0Z1pXeGxiV1Z1ZENCcGN5QnViM1FnYzJWc1pXTjBaV1E2SUdSeWIzQWdlaTFwYm1SbGVDQW1JR0Z1YVcxaGRHVWdiM0JoWTJsMGVTQXRQaUJvYVdSbFhISmNiaUFnSUNBZ0lIWmhjaUJ6Wld4bFkzUmxaRWx1WkdWNElEMGdKSE5sYkdWamRHVmtSV3hsYldWdWRITXVhVzVrWlhoUFppZ2taV3hsYldWdWRDazdYSEpjYmlBZ0lDQWdJR2xtSUNoelpXeGxZM1JsWkVsdVpHVjRJRDA5UFNBdE1Ta2dlMXh5WEc0Z0lDQWdJQ0FnSUNSbGJHVnRaVzUwTG1OemN5aGNJbnBKYm1SbGVGd2lMQ0F0TVNrN1hISmNiaUFnSUNBZ0lDQWdKR1ZzWlcxbGJuUXVkbVZzYjJOcGRIa29YSEpjYmlBZ0lDQWdJQ0FnSUNCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUc5d1lXTnBkSGs2SURCY2NseHVJQ0FnSUNBZ0lDQWdJSDBzWEhKY2JpQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5MGNtRnVjMmwwYVc5dVJIVnlZWFJwYjI0c1hISmNiaUFnSUNBZ0lDQWdJQ0JjSW1WaGMyVkpiazkxZEVOMVltbGpYQ0lzWEhKY2JpQWdJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdKR1ZzWlcxbGJuUXVhR2xrWlNncE8xeHlYRzRnSUNBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNBZ0lDazdYSEpjYmlBZ0lDQWdJSDBnWld4elpTQjdYSEpjYmlBZ0lDQWdJQ0FnTHk4Z1NXWWdZVzRnWld4bGJXVnVkQ0JwY3lCelpXeGxZM1JsWkRvZ2MyaHZkeUFtSUdKMWJYQWdlaTFwYm1SbGVDQW1JR0Z1YVcxaGRHVWdkRzhnY0c5emFYUnBiMjVjY2x4dUlDQWdJQ0FnSUNBa1pXeGxiV1Z1ZEM1emFHOTNLQ2s3WEhKY2JpQWdJQ0FnSUNBZ0pHVnNaVzFsYm5RdVkzTnpLRndpZWtsdVpHVjRYQ0lzSURBcE8xeHlYRzRnSUNBZ0lDQWdJSFpoY2lCdVpYZFFiM01nUFNCMGFHbHpMbDlwYm1SbGVGUnZXRmtvYzJWc1pXTjBaV1JKYm1SbGVDazdYSEpjYmlBZ0lDQWdJQ0FnSkdWc1pXMWxiblF1ZG1Wc2IyTnBkSGtvWEhKY2JpQWdJQ0FnSUNBZ0lDQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHOXdZV05wZEhrNklERXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIUnZjRG9nYm1WM1VHOXpMbmtnS3lCY0luQjRYQ0lzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR3hsWm5RNklHNWxkMUJ2Y3k1NElDc2dYQ0p3ZUZ3aVhISmNiaUFnSUNBZ0lDQWdJQ0I5TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmRISmhibk5wZEdsdmJrUjFjbUYwYVc5dUxGeHlYRzRnSUNBZ0lDQWdJQ0FnWENKbFlYTmxTVzVQZFhSRGRXSnBZMXdpWEhKY2JpQWdJQ0FnSUNBZ0tUdGNjbHh1SUNBZ0lDQWdmVnh5WEc0Z0lDQWdmUzVpYVc1a0tIUm9hWE1wWEhKY2JpQWdLVHRjY2x4dWZUdGNjbHh1WEhKY2JsQnZjblJtYjJ4cGIwWnBiSFJsY2k1d2NtOTBiM1I1Y0dVdVgyRnVhVzFoZEdWSGNtbGtTR1ZwWjJoMElEMGdablZ1WTNScGIyNG9iblZ0Uld4bGJXVnVkSE1wSUh0Y2NseHVJQ0IwYUdsekxsOGtaM0pwWkM1MlpXeHZZMmwwZVNoY0luTjBiM0JjSWlrN1hISmNiaUFnZG1GeUlHTjFjbEp2ZDNNZ1BTQk5ZWFJvTG1ObGFXd29iblZ0Uld4bGJXVnVkSE1nTHlCMGFHbHpMbDlqYjJ4ektUdGNjbHh1SUNCMGFHbHpMbDhrWjNKcFpDNTJaV3h2WTJsMGVTaGNjbHh1SUNBZ0lIdGNjbHh1SUNBZ0lDQWdhR1ZwWjJoME9pQjBhR2x6TGw5cGJXRm5aVWhsYVdkb2RDQXFJR04xY2xKdmQzTWdLeUIwYUdsekxsOW5jbWxrVTNCaFkybHVaeUFxSUNoamRYSlNiM2R6SUMwZ01Ta2dLeUJjSW5CNFhDSmNjbHh1SUNBZ0lIMHNYSEpjYmlBZ0lDQjBhR2x6TGw5MGNtRnVjMmwwYVc5dVJIVnlZWFJwYjI1Y2NseHVJQ0FwTzF4eVhHNTlPMXh5WEc1Y2NseHVVRzl5ZEdadmJHbHZSbWxzZEdWeUxuQnliM1J2ZEhsd1pTNWZaMlYwVUhKdmFtVmpkSE5KYmtOaGRHVm5iM0o1SUQwZ1puVnVZM1JwYjI0b1kyRjBaV2R2Y25rcElIdGNjbHh1SUNCcFppQW9ZMkYwWldkdmNua2dQVDA5SUZ3aVlXeHNYQ0lwSUh0Y2NseHVJQ0FnSUhKbGRIVnliaUIwYUdsekxsOGtjSEp2YW1WamRITTdYSEpjYmlBZ2ZTQmxiSE5sSUh0Y2NseHVJQ0FnSUhKbGRIVnliaUIwYUdsekxsOGtZMkYwWldkdmNtbGxjMXRqWVhSbFoyOXllVjBnZkh3Z1cxMDdYSEpjYmlBZ2ZWeHlYRzU5TzF4eVhHNWNjbHh1VUc5eWRHWnZiR2x2Um1sc2RHVnlMbkJ5YjNSdmRIbHdaUzVmWTJGamFHVlFjbTlxWldOMGN5QTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJSFJvYVhNdVh5UndjbTlxWldOMGN5QTlJRnRkTzF4eVhHNGdJSFJvYVhNdVh5UmpZWFJsWjI5eWFXVnpJRDBnZTMwN1hISmNiaUFnZEdocGN5NWZKR2R5YVdRdVptbHVaQ2hjSWk1d2NtOXFaV04wWENJcExtVmhZMmdvWEhKY2JpQWdJQ0JtZFc1amRHbHZiaWhwYm1SbGVDd2daV3hsYldWdWRDa2dlMXh5WEc0Z0lDQWdJQ0IyWVhJZ0pHVnNaVzFsYm5RZ1BTQWtLR1ZzWlcxbGJuUXBPMXh5WEc0Z0lDQWdJQ0IwYUdsekxsOGtjSEp2YW1WamRITXVjSFZ6YUNna1pXeGxiV1Z1ZENrN1hISmNiaUFnSUNBZ0lIWmhjaUJqWVhSbFoyOXllVTVoYldWeklEMGdKR1ZzWlcxbGJuUXVaR0YwWVNoY0ltTmhkR1ZuYjNKcFpYTmNJaWt1YzNCc2FYUW9YQ0lzWENJcE8xeHlYRzRnSUNBZ0lDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJR05oZEdWbmIzSjVUbUZ0WlhNdWJHVnVaM1JvT3lCcElDczlJREVwSUh0Y2NseHVJQ0FnSUNBZ0lDQjJZWElnWTJGMFpXZHZjbmtnUFNBa0xuUnlhVzBvWTJGMFpXZHZjbmxPWVcxbGMxdHBYU2t1ZEc5TWIzZGxja05oYzJVb0tUdGNjbHh1SUNBZ0lDQWdJQ0JwWmlBb0lYUm9hWE11WHlSallYUmxaMjl5YVdWelcyTmhkR1ZuYjNKNVhTa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ2RHaHBjeTVmSkdOaGRHVm5iM0pwWlhOYlkyRjBaV2R2Y25sZElEMGdXeVJsYkdWdFpXNTBYVHRjY2x4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZkpHTmhkR1ZuYjNKcFpYTmJZMkYwWldkdmNubGRMbkIxYzJnb0pHVnNaVzFsYm5RcE8xeHlYRzRnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnZlZ4eVhHNGdJQ0FnZlM1aWFXNWtLSFJvYVhNcFhISmNiaUFnS1R0Y2NseHVmVHRjY2x4dVhISmNiaTh2SUZCdmNuUm1iMnhwYjBacGJIUmxjaTV3Y205MGIzUjVjR1V1WDJOaGJHTjFiR0YwWlVkeWFXUWdQU0JtZFc1amRHbHZiaUFvS1NCN1hISmNiaTh2SUNBZ0lDQjJZWElnWjNKcFpGZHBaSFJvSUQwZ2RHaHBjeTVmSkdkeWFXUXVhVzV1WlhKWGFXUjBhQ2dwTzF4eVhHNHZMeUFnSUNBZ2RHaHBjeTVmWTI5c2N5QTlJRTFoZEdndVpteHZiM0lvS0dkeWFXUlhhV1IwYUNBcklIUm9hWE11WDJkeWFXUlRjR0ZqYVc1bktTQXZYSEpjYmk4dklDQWdJQ0FnSUNBZ0tIUm9hWE11WDIxcGJrbHRZV2RsVjJsa2RHZ2dLeUIwYUdsekxsOW5jbWxrVTNCaFkybHVaeWtwTzF4eVhHNHZMeUFnSUNBZ2RHaHBjeTVmY205M2N5QTlJRTFoZEdndVkyVnBiQ2gwYUdsekxsOGtjSEp2YW1WamRITXViR1Z1WjNSb0lDOGdkR2hwY3k1ZlkyOXNjeWs3WEhKY2JpOHZJQ0FnSUNCMGFHbHpMbDlwYldGblpWZHBaSFJvSUQwZ0tHZHlhV1JYYVdSMGFDQXRJQ2dvZEdocGN5NWZZMjlzY3lBdElERXBJQ29nZEdocGN5NWZaM0pwWkZOd1lXTnBibWNwS1NBdlhISmNiaTh2SUNBZ0lDQWdJQ0FnZEdocGN5NWZZMjlzY3p0Y2NseHVMeThnSUNBZ0lIUm9hWE11WDJsdFlXZGxTR1ZwWjJoMElEMGdkR2hwY3k1ZmFXMWhaMlZYYVdSMGFDQXFJQ2d4SUM4Z2RHaHBjeTVmWVhOd1pXTjBVbUYwYVc4cE8xeHlYRzR2THlCOU8xeHlYRzVjY2x4dVVHOXlkR1p2YkdsdlJtbHNkR1Z5TG5CeWIzUnZkSGx3WlM1ZlkyRnNZM1ZzWVhSbFIzSnBaQ0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUhaaGNpQm5jbWxrVjJsa2RHZ2dQU0IwYUdsekxsOGtaM0pwWkM1cGJtNWxjbGRwWkhSb0tDazdYSEpjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQjBhR2x6TGw5aWNtVmhhM0J2YVc1MGN5NXNaVzVuZEdnN0lHa2dLejBnTVNrZ2UxeHlYRzRnSUNBZ2FXWWdLR2R5YVdSWGFXUjBhQ0E4UFNCMGFHbHpMbDlpY21WaGEzQnZhVzUwYzF0cFhTNTNhV1IwYUNrZ2UxeHlYRzRnSUNBZ0lDQjBhR2x6TGw5amIyeHpJRDBnZEdocGN5NWZZbkpsWVd0d2IybHVkSE5iYVYwdVkyOXNjenRjY2x4dUlDQWdJQ0FnZEdocGN5NWZaM0pwWkZOd1lXTnBibWNnUFNCMGFHbHpMbDlpY21WaGEzQnZhVzUwYzF0cFhTNXpjR0ZqYVc1bk8xeHlYRzRnSUNBZ0lDQmljbVZoYXp0Y2NseHVJQ0FnSUgxY2NseHVJQ0I5WEhKY2JpQWdkR2hwY3k1ZmNtOTNjeUE5SUUxaGRHZ3VZMlZwYkNoMGFHbHpMbDhrY0hKdmFtVmpkSE11YkdWdVozUm9JQzhnZEdocGN5NWZZMjlzY3lrN1hISmNiaUFnZEdocGN5NWZhVzFoWjJWWGFXUjBhQ0E5SUNobmNtbGtWMmxrZEdnZ0xTQW9kR2hwY3k1ZlkyOXNjeUF0SURFcElDb2dkR2hwY3k1ZlozSnBaRk53WVdOcGJtY3BJQzhnZEdocGN5NWZZMjlzY3p0Y2NseHVJQ0IwYUdsekxsOXBiV0ZuWlVobGFXZG9kQ0E5SUhSb2FYTXVYMmx0WVdkbFYybGtkR2dnS2lBb01TQXZJSFJvYVhNdVgyRnpjR1ZqZEZKaGRHbHZLVHRjY2x4dWZUdGNjbHh1WEhKY2JsQnZjblJtYjJ4cGIwWnBiSFJsY2k1d2NtOTBiM1I1Y0dVdVgyTnlaV0YwWlVkeWFXUWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0IwYUdsekxsOWpZV3hqZFd4aGRHVkhjbWxrS0NrN1hISmNibHh5WEc0Z0lIUm9hWE11WHlSbmNtbGtMbU56Y3loY0luQnZjMmwwYVc5dVhDSXNJRndpY21Wc1lYUnBkbVZjSWlrN1hISmNiaUFnZEdocGN5NWZKR2R5YVdRdVkzTnpLSHRjY2x4dUlDQWdJR2hsYVdkb2REb2dkR2hwY3k1ZmFXMWhaMlZJWldsbmFIUWdLaUIwYUdsekxsOXliM2R6SUNzZ2RHaHBjeTVmWjNKcFpGTndZV05wYm1jZ0tpQW9kR2hwY3k1ZmNtOTNjeUF0SURFcElDc2dYQ0p3ZUZ3aVhISmNiaUFnZlNrN1hISmNibHh5WEc0Z0lIUm9hWE11WHlSd2NtOXFaV04wY3k1bWIzSkZZV05vS0Z4eVhHNGdJQ0FnWm5WdVkzUnBiMjRvSkdWc1pXMWxiblFzSUdsdVpHVjRLU0I3WEhKY2JpQWdJQ0FnSUhaaGNpQndiM01nUFNCMGFHbHpMbDlwYm1SbGVGUnZXRmtvYVc1a1pYZ3BPMXh5WEc0Z0lDQWdJQ0FrWld4bGJXVnVkQzVqYzNNb2UxeHlYRzRnSUNBZ0lDQWdJSEJ2YzJsMGFXOXVPaUJjSW1GaWMyOXNkWFJsWENJc1hISmNiaUFnSUNBZ0lDQWdkRzl3T2lCd2IzTXVlU0FySUZ3aWNIaGNJaXhjY2x4dUlDQWdJQ0FnSUNCc1pXWjBPaUJ3YjNNdWVDQXJJRndpY0hoY0lpeGNjbHh1SUNBZ0lDQWdJQ0IzYVdSMGFEb2dkR2hwY3k1ZmFXMWhaMlZYYVdSMGFDQXJJRndpY0hoY0lpeGNjbHh1SUNBZ0lDQWdJQ0JvWldsbmFIUTZJSFJvYVhNdVgybHRZV2RsU0dWcFoyaDBJQ3NnWENKd2VGd2lYSEpjYmlBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnZlM1aWFXNWtLSFJvYVhNcFhISmNiaUFnS1R0Y2NseHVmVHRjY2x4dVhISmNibEJ2Y25SbWIyeHBiMFpwYkhSbGNpNXdjbTkwYjNSNWNHVXVYMjl1VG1GMlEyeHBZMnNnUFNCbWRXNWpkR2x2YmlobEtTQjdYSEpjYmlBZ1pTNXdjbVYyWlc1MFJHVm1ZWFZzZENncE8xeHlYRzRnSUhaaGNpQWtkR0Z5WjJWMElEMGdKQ2hsTG5SaGNtZGxkQ2s3WEhKY2JpQWdhV1lnS0NSMFlYSm5aWFF1YVhNb2RHaHBjeTVmSkdGamRHbDJaVTVoZGtsMFpXMHBLU0J5WlhSMWNtNDdYSEpjYmlBZ2FXWWdLSFJvYVhNdVh5UmhZM1JwZG1WT1lYWkpkR1Z0TG14bGJtZDBhQ2tnZEdocGN5NWZKR0ZqZEdsMlpVNWhka2wwWlcwdWNtVnRiM1psUTJ4aGMzTW9YQ0poWTNScGRtVmNJaWs3WEhKY2JpQWdKSFJoY21kbGRDNWhaR1JEYkdGemN5aGNJbUZqZEdsMlpWd2lLVHRjY2x4dUlDQjBhR2x6TGw4a1lXTjBhWFpsVG1GMlNYUmxiU0E5SUNSMFlYSm5aWFE3WEhKY2JpQWdkbUZ5SUdOaGRHVm5iM0o1SUQwZ0pIUmhjbWRsZEM1a1lYUmhLRndpWTJGMFpXZHZjbmxjSWlrdWRHOU1iM2RsY2tOaGMyVW9LVHRjY2x4dVhISmNiaUFnYUdsemRHOXllUzV3ZFhOb1UzUmhkR1VvWEhKY2JpQWdJQ0I3WEhKY2JpQWdJQ0FnSUhWeWJEb2dYQ0l2ZDI5eWF5NW9kRzFzWENJc1hISmNiaUFnSUNBZ0lIRjFaWEo1T2lCN0lHTmhkR1ZuYjNKNU9pQmpZWFJsWjI5eWVTQjlYSEpjYmlBZ0lDQjlMRnh5WEc0Z0lDQWdiblZzYkN4Y2NseHVJQ0FnSUZ3aUwzZHZjbXN1YUhSdGJEOWpZWFJsWjI5eWVUMWNJaUFySUdOaGRHVm5iM0o1WEhKY2JpQWdLVHRjY2x4dVhISmNiaUFnZEdocGN5NWZabWxzZEdWeVVISnZhbVZqZEhNb1kyRjBaV2R2Y25rcE8xeHlYRzU5TzF4eVhHNWNjbHh1VUc5eWRHWnZiR2x2Um1sc2RHVnlMbkJ5YjNSdmRIbHdaUzVmYjI1UWNtOXFaV04wUTJ4cFkyc2dQU0JtZFc1amRHbHZiaWhsS1NCN1hISmNiaUFnWlM1d2NtVjJaVzUwUkdWbVlYVnNkQ2dwTzF4eVhHNGdJSFpoY2lBa2RHRnlaMlYwSUQwZ0pDaGxMbU4xY25KbGJuUlVZWEpuWlhRcE8xeHlYRzRnSUhaaGNpQndjbTlxWldOMFRtRnRaU0E5SUNSMFlYSm5aWFF1WkdGMFlTaGNJbTVoYldWY0lpazdYSEpjYmlBZ2RtRnlJSFZ5YkNBOUlGd2lMM0J5YjJwbFkzUnpMMXdpSUNzZ2NISnZhbVZqZEU1aGJXVWdLeUJjSWk1b2RHMXNYQ0k3WEhKY2JpQWdkR2hwY3k1ZmJHOWhaR1Z5TG14dllXUlFZV2RsS0hWeWJDd2dlMzBzSUhSeWRXVXBPMXh5WEc1OU8xeHlYRzVjY2x4dVVHOXlkR1p2YkdsdlJtbHNkR1Z5TG5CeWIzUnZkSGx3WlM1ZmFXNWtaWGhVYjFoWklEMGdablZ1WTNScGIyNG9hVzVrWlhncElIdGNjbHh1SUNCMllYSWdjaUE5SUUxaGRHZ3VabXh2YjNJb2FXNWtaWGdnTHlCMGFHbHpMbDlqYjJ4ektUdGNjbHh1SUNCMllYSWdZeUE5SUdsdVpHVjRJQ1VnZEdocGN5NWZZMjlzY3p0Y2NseHVJQ0J5WlhSMWNtNGdlMXh5WEc0Z0lDQWdlRG9nWXlBcUlIUm9hWE11WDJsdFlXZGxWMmxrZEdnZ0t5QmpJQ29nZEdocGN5NWZaM0pwWkZOd1lXTnBibWNzWEhKY2JpQWdJQ0I1T2lCeUlDb2dkR2hwY3k1ZmFXMWhaMlZJWldsbmFIUWdLeUJ5SUNvZ2RHaHBjeTVmWjNKcFpGTndZV05wYm1kY2NseHVJQ0I5TzF4eVhHNTlPMXh5WEc0aUxDSnRiMlIxYkdVdVpYaHdiM0owY3lBOUlGTnNhV1JsYzJodmQwMXZaR0ZzTzF4eVhHNWNjbHh1ZG1GeUlFdEZXVjlEVDBSRlV5QTlJSHRjY2x4dUlDQk1SVVpVWDBGU1VrOVhPaUF6Tnl4Y2NseHVJQ0JTU1VkSVZGOUJVbEpQVnpvZ016a3NYSEpjYmlBZ1JWTkRRVkJGT2lBeU4xeHlYRzU5TzF4eVhHNWNjbHh1Wm5WdVkzUnBiMjRnVTJ4cFpHVnphRzkzVFc5a1lXd29KR052Ym5SaGFXNWxjaXdnYzJ4cFpHVnphRzkzS1NCN1hISmNiaUFnZEdocGN5NWZjMnhwWkdWemFHOTNJRDBnYzJ4cFpHVnphRzkzTzF4eVhHNWNjbHh1SUNCMGFHbHpMbDhrYlc5a1lXd2dQU0FrWTI5dWRHRnBibVZ5TG1acGJtUW9YQ0l1YzJ4cFpHVnphRzkzTFcxdlpHRnNYQ0lwTzF4eVhHNGdJSFJvYVhNdVh5UnZkbVZ5YkdGNUlEMGdkR2hwY3k1ZkpHMXZaR0ZzTG1acGJtUW9YQ0l1Ylc5a1lXd3RiM1psY214aGVWd2lLVHRjY2x4dUlDQjBhR2x6TGw4a1kyOXVkR1Z1ZENBOUlIUm9hWE11WHlSdGIyUmhiQzVtYVc1a0tGd2lMbTF2WkdGc0xXTnZiblJsYm5SelhDSXBPMXh5WEc0Z0lIUm9hWE11WHlSallYQjBhVzl1SUQwZ2RHaHBjeTVmSkcxdlpHRnNMbVpwYm1Rb1hDSXViVzlrWVd3dFkyRndkR2x2Ymx3aUtUdGNjbHh1SUNCMGFHbHpMbDhrYVcxaFoyVkRiMjUwWVdsdVpYSWdQU0IwYUdsekxsOGtiVzlrWVd3dVptbHVaQ2hjSWk1dGIyUmhiQzFwYldGblpWd2lLVHRjY2x4dUlDQjBhR2x6TGw4a2FXMWhaMlZNWldaMElEMGdkR2hwY3k1ZkpHMXZaR0ZzTG1acGJtUW9YQ0l1YVcxaFoyVXRZV1IyWVc1alpTMXNaV1owWENJcE8xeHlYRzRnSUhSb2FYTXVYeVJwYldGblpWSnBaMmgwSUQwZ2RHaHBjeTVmSkcxdlpHRnNMbVpwYm1Rb1hDSXVhVzFoWjJVdFlXUjJZVzVqWlMxeWFXZG9kRndpS1R0Y2NseHVYSEpjYmlBZ2RHaHBjeTVmYVc1a1pYZ2dQU0F3T3lBdkx5QkpibVJsZUNCdlppQnpaV3hsWTNSbFpDQnBiV0ZuWlZ4eVhHNGdJSFJvYVhNdVgybHpUM0JsYmlBOUlHWmhiSE5sTzF4eVhHNWNjbHh1SUNCMGFHbHpMbDhrYVcxaFoyVk1aV1owTG05dUtGd2lZMnhwWTJ0Y0lpd2dkR2hwY3k1aFpIWmhibU5sVEdWbWRDNWlhVzVrS0hSb2FYTXBLVHRjY2x4dUlDQjBhR2x6TGw4a2FXMWhaMlZTYVdkb2RDNXZiaWhjSW1Oc2FXTnJYQ0lzSUhSb2FYTXVZV1IyWVc1alpWSnBaMmgwTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzRnSUNRb1pHOWpkVzFsYm5RcExtOXVLRndpYTJWNVpHOTNibHdpTENCMGFHbHpMbDl2Ymt0bGVVUnZkMjR1WW1sdVpDaDBhR2x6S1NrN1hISmNibHh5WEc0Z0lDOHZJRWRwZG1VZ2FsRjFaWEo1SUdOdmJuUnliMndnYjNabGNpQnphRzkzYVc1bkwyaHBaR2x1WjF4eVhHNGdJSFJvYVhNdVh5UnRiMlJoYkM1amMzTW9YQ0prYVhOd2JHRjVYQ0lzSUZ3aVlteHZZMnRjSWlrN1hISmNiaUFnZEdocGN5NWZKRzF2WkdGc0xtaHBaR1VvS1R0Y2NseHVYSEpjYmlBZ0x5OGdSWFpsYm5SelhISmNiaUFnSkNoM2FXNWtiM2NwTG05dUtGd2ljbVZ6YVhwbFhDSXNJSFJvYVhNdVgyOXVVbVZ6YVhwbExtSnBibVFvZEdocGN5a3BPMXh5WEc0Z0lIUm9hWE11WHlSdmRtVnliR0Y1TG05dUtGd2lZMnhwWTJ0Y0lpd2dkR2hwY3k1amJHOXpaUzVpYVc1a0tIUm9hWE1wS1R0Y2NseHVJQ0IwYUdsekxsOGtiVzlrWVd3dVptbHVaQ2hjSWk1dGIyUmhiQzFqYkc5elpWd2lLUzV2YmloY0ltTnNhV05yWENJc0lIUm9hWE11WTJ4dmMyVXVZbWx1WkNoMGFHbHpLU2s3WEhKY2JseHlYRzRnSUhSb2FYTXVYM1Z3WkdGMFpVTnZiblJ5YjJ4ektDazdYSEpjYmx4eVhHNGdJQzh2SUZOcGVtVWdiMllnWm05dWRHRjNaWE52YldVZ2FXTnZibk1nYm1WbFpITWdZU0J6YkdsbmFIUWdaR1ZzWVhrZ0tIVnVkR2xzSUhOMFlXTnJJR2x6SUdOc1pXRnlLU0JtYjNKY2NseHVJQ0F2THlCemIyMWxJSEpsWVhOdmJseHlYRzRnSUhObGRGUnBiV1Z2ZFhRb1hISmNiaUFnSUNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNBZ0lDQWdkR2hwY3k1ZmIyNVNaWE5wZW1Vb0tUdGNjbHh1SUNBZ0lIMHVZbWx1WkNoMGFHbHpLU3hjY2x4dUlDQWdJREJjY2x4dUlDQXBPMXh5WEc1OVhISmNibHh5WEc1VGJHbGtaWE5vYjNkTmIyUmhiQzV3Y205MGIzUjVjR1V1WVdSMllXNWpaVXhsWm5RZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQjBhR2x6TG5Ob2IzZEpiV0ZuWlVGMEtIUm9hWE11WDJsdVpHVjRJQzBnTVNrN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2ROYjJSaGJDNXdjbTkwYjNSNWNHVXVZV1IyWVc1alpWSnBaMmgwSUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2RHaHBjeTV6YUc5M1NXMWhaMlZCZENoMGFHbHpMbDlwYm1SbGVDQXJJREVwTzF4eVhHNTlPMXh5WEc1Y2NseHVVMnhwWkdWemFHOTNUVzlrWVd3dWNISnZkRzkwZVhCbExuTm9iM2RKYldGblpVRjBJRDBnWm5WdVkzUnBiMjRvYVc1a1pYZ3BJSHRjY2x4dUlDQnBibVJsZUNBOUlFMWhkR2d1YldGNEtHbHVaR1Y0TENBd0tUdGNjbHh1SUNCcGJtUmxlQ0E5SUUxaGRHZ3ViV2x1S0dsdVpHVjRMQ0IwYUdsekxsOXpiR2xrWlhOb2IzY3VaMlYwVG5WdFNXMWhaMlZ6S0NrZ0xTQXhLVHRjY2x4dUlDQjBhR2x6TGw5cGJtUmxlQ0E5SUdsdVpHVjRPMXh5WEc0Z0lIWmhjaUFrYVcxbklEMGdkR2hwY3k1ZmMyeHBaR1Z6YUc5M0xtZGxkRWRoYkd4bGNubEpiV0ZuWlNoMGFHbHpMbDlwYm1SbGVDazdYSEpjYmlBZ2RtRnlJR05oY0hScGIyNGdQU0IwYUdsekxsOXpiR2xrWlhOb2IzY3VaMlYwUTJGd2RHbHZiaWgwYUdsekxsOXBibVJsZUNrN1hISmNibHh5WEc0Z0lIUm9hWE11WHlScGJXRm5aVU52Ym5SaGFXNWxjaTVsYlhCMGVTZ3BPMXh5WEc0Z0lDUW9YQ0k4YVcxblBsd2lMQ0I3SUhOeVl6b2dKR2x0Wnk1aGRIUnlLRndpYzNKalhDSXBJSDBwTG1Gd2NHVnVaRlJ2S0hSb2FYTXVYeVJwYldGblpVTnZiblJoYVc1bGNpazdYSEpjYmx4eVhHNGdJSFJvYVhNdVh5UmpZWEIwYVc5dUxtVnRjSFI1S0NrN1hISmNiaUFnYVdZZ0tHTmhjSFJwYjI0cElIdGNjbHh1SUNBZ0lDUW9YQ0k4YzNCaGJqNWNJaWxjY2x4dUlDQWdJQ0FnTG1Ga1pFTnNZWE56S0Z3aVptbG5kWEpsTFc1MWJXSmxjbHdpS1Z4eVhHNGdJQ0FnSUNBdWRHVjRkQ2hjSWtacFp5NGdYQ0lnS3lBb2RHaHBjeTVmYVc1a1pYZ2dLeUF4S1NBcklGd2lPaUJjSWlsY2NseHVJQ0FnSUNBZ0xtRndjR1Z1WkZSdktIUm9hWE11WHlSallYQjBhVzl1S1R0Y2NseHVJQ0FnSUNRb1hDSThjM0JoYmo1Y0lpbGNjbHh1SUNBZ0lDQWdMbUZrWkVOc1lYTnpLRndpWTJGd2RHbHZiaTEwWlhoMFhDSXBYSEpjYmlBZ0lDQWdJQzUwWlhoMEtHTmhjSFJwYjI0cFhISmNiaUFnSUNBZ0lDNWhjSEJsYm1SVWJ5aDBhR2x6TGw4a1kyRndkR2x2YmlrN1hISmNiaUFnZlZ4eVhHNWNjbHh1SUNCMGFHbHpMbDl2YmxKbGMybDZaU2dwTzF4eVhHNGdJSFJvYVhNdVgzVndaR0YwWlVOdmJuUnliMnh6S0NrN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2ROYjJSaGJDNXdjbTkwYjNSNWNHVXViM0JsYmlBOUlHWjFibU4wYVc5dUtHbHVaR1Y0S1NCN1hISmNiaUFnYVc1a1pYZ2dQU0JwYm1SbGVDQjhmQ0F3TzF4eVhHNGdJSFJvYVhNdVh5UnRiMlJoYkM1emFHOTNLQ2s3WEhKY2JpQWdkR2hwY3k1emFHOTNTVzFoWjJWQmRDaHBibVJsZUNrN1hISmNiaUFnZEdocGN5NWZhWE5QY0dWdUlEMGdkSEoxWlR0Y2NseHVmVHRjY2x4dVhISmNibE5zYVdSbGMyaHZkMDF2WkdGc0xuQnliM1J2ZEhsd1pTNWpiRzl6WlNBOUlHWjFibU4wYVc5dUtDa2dlMXh5WEc0Z0lIUm9hWE11WHlSdGIyUmhiQzVvYVdSbEtDazdYSEpjYmlBZ2RHaHBjeTVmYVhOUGNHVnVJRDBnWm1Gc2MyVTdYSEpjYm4wN1hISmNibHh5WEc1VGJHbGtaWE5vYjNkTmIyUmhiQzV3Y205MGIzUjVjR1V1WDI5dVMyVjVSRzkzYmlBOUlHWjFibU4wYVc5dUtHVXBJSHRjY2x4dUlDQnBaaUFvSVhSb2FYTXVYMmx6VDNCbGJpa2djbVYwZFhKdU8xeHlYRzRnSUdsbUlDaGxMbmRvYVdOb0lEMDlQU0JMUlZsZlEwOUVSVk11VEVWR1ZGOUJVbEpQVnlrZ2UxeHlYRzRnSUNBZ2RHaHBjeTVoWkhaaGJtTmxUR1ZtZENncE8xeHlYRzRnSUgwZ1pXeHpaU0JwWmlBb1pTNTNhR2xqYUNBOVBUMGdTMFZaWDBOUFJFVlRMbEpKUjBoVVgwRlNVazlYS1NCN1hISmNiaUFnSUNCMGFHbHpMbUZrZG1GdVkyVlNhV2RvZENncE8xeHlYRzRnSUgwZ1pXeHpaU0JwWmlBb1pTNTNhR2xqYUNBOVBUMGdTMFZaWDBOUFJFVlRMa1ZUUTBGUVJTa2dlMXh5WEc0Z0lDQWdkR2hwY3k1amJHOXpaU2dwTzF4eVhHNGdJSDFjY2x4dWZUdGNjbHh1WEhKY2JsTnNhV1JsYzJodmQwMXZaR0ZzTG5CeWIzUnZkSGx3WlM1ZmRYQmtZWFJsUTI5dWRISnZiSE1nUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNBdkx5QlNaUzFsYm1GaWJHVmNjbHh1SUNCMGFHbHpMbDhrYVcxaFoyVlNhV2RvZEM1eVpXMXZkbVZEYkdGemN5aGNJbVJwYzJGaWJHVmtYQ0lwTzF4eVhHNGdJSFJvYVhNdVh5UnBiV0ZuWlV4bFpuUXVjbVZ0YjNabFEyeGhjM01vWENKa2FYTmhZbXhsWkZ3aUtUdGNjbHh1WEhKY2JpQWdMeThnUkdsellXSnNaU0JwWmlCM1pTZDJaU0J5WldGamFHVmtJSFJvWlNCMGFHVWdiV0Y0SUc5eUlHMXBiaUJzYVcxcGRGeHlYRzRnSUdsbUlDaDBhR2x6TGw5cGJtUmxlQ0ErUFNCMGFHbHpMbDl6Ykdsa1pYTm9iM2N1WjJWMFRuVnRTVzFoWjJWektDa2dMU0F4S1NCN1hISmNiaUFnSUNCMGFHbHpMbDhrYVcxaFoyVlNhV2RvZEM1aFpHUkRiR0Z6Y3loY0ltUnBjMkZpYkdWa1hDSXBPMXh5WEc0Z0lIMGdaV3h6WlNCcFppQW9kR2hwY3k1ZmFXNWtaWGdnUEQwZ01Da2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHbHRZV2RsVEdWbWRDNWhaR1JEYkdGemN5aGNJbVJwYzJGaWJHVmtYQ0lwTzF4eVhHNGdJSDFjY2x4dWZUdGNjbHh1WEhKY2JsTnNhV1JsYzJodmQwMXZaR0ZzTG5CeWIzUnZkSGx3WlM1ZmIyNVNaWE5wZW1VZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQjJZWElnSkdsdFlXZGxJRDBnZEdocGN5NWZKR2x0WVdkbFEyOXVkR0ZwYm1WeUxtWnBibVFvWENKcGJXZGNJaWs3WEhKY2JseHlYRzRnSUM4dklGSmxjMlYwSUhSb1pTQmpiMjUwWlc1MEozTWdkMmxrZEdoY2NseHVJQ0IwYUdsekxsOGtZMjl1ZEdWdWRDNTNhV1IwYUNoY0lsd2lLVHRjY2x4dVhISmNiaUFnTHk4Z1JtbHVaQ0IwYUdVZ2MybDZaU0J2WmlCMGFHVWdZMjl0Y0c5dVpXNTBjeUIwYUdGMElHNWxaV1FnZEc4Z1ltVWdaR2x6Y0d4aGVXVmtJR2x1SUdGa1pHbDBhVzl1SUhSdlhISmNiaUFnTHk4Z2RHaGxJR2x0WVdkbFhISmNiaUFnZG1GeUlHTnZiblJ5YjJ4elYybGtkR2dnUFNCMGFHbHpMbDhrYVcxaFoyVk1aV1owTG05MWRHVnlWMmxrZEdnb2RISjFaU2tnS3lCMGFHbHpMbDhrYVcxaFoyVlNhV2RvZEM1dmRYUmxjbGRwWkhSb0tIUnlkV1VwTzF4eVhHNGdJQzh2SUVoaFkyc2dabTl5SUc1dmR5QXRJR0oxWkdkbGRDQm1iM0lnTW5nZ2RHaGxJR05oY0hScGIyNGdhR1ZwWjJoMExseHlYRzRnSUhaaGNpQmpZWEIwYVc5dVNHVnBaMmgwSUQwZ01pQXFJSFJvYVhNdVh5UmpZWEIwYVc5dUxtOTFkR1Z5U0dWcFoyaDBLSFJ5ZFdVcE8xeHlYRzRnSUM4dklIWmhjaUJwYldGblpWQmhaR1JwYm1jZ1BTQWthVzFoWjJVdWFXNXVaWEpYYVdSMGFDZ3BPMXh5WEc1Y2NseHVJQ0F2THlCRFlXeGpkV3hoZEdVZ2RHaGxJR0YyWVdsc1lXSnNaU0JoY21WaElHWnZjaUIwYUdVZ2JXOWtZV3hjY2x4dUlDQjJZWElnYlhjZ1BTQjBhR2x6TGw4a2JXOWtZV3d1ZDJsa2RHZ29LU0F0SUdOdmJuUnliMnh6VjJsa2RHZzdYSEpjYmlBZ2RtRnlJRzFvSUQwZ2RHaHBjeTVmSkcxdlpHRnNMbWhsYVdkb2RDZ3BJQzBnWTJGd2RHbHZia2hsYVdkb2REdGNjbHh1WEhKY2JpQWdMeThnUm1sMElIUm9aU0JwYldGblpTQjBieUIwYUdVZ2NtVnRZV2x1YVc1bklITmpjbVZsYmlCeVpXRnNJR1Z6ZEdGMFpWeHlYRzRnSUhaaGNpQnpaWFJUYVhwbElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdJQ0IyWVhJZ2FYY2dQU0FrYVcxaFoyVXVjSEp2Y0NoY0ltNWhkSFZ5WVd4WGFXUjBhRndpS1R0Y2NseHVJQ0FnSUhaaGNpQnBhQ0E5SUNScGJXRm5aUzV3Y205d0tGd2libUYwZFhKaGJFaGxhV2RvZEZ3aUtUdGNjbHh1SUNBZ0lIWmhjaUJ6ZHlBOUlHbDNJQzhnYlhjN1hISmNiaUFnSUNCMllYSWdjMmdnUFNCcGFDQXZJRzFvTzF4eVhHNGdJQ0FnZG1GeUlITWdQU0JOWVhSb0xtMWhlQ2h6ZHl3Z2MyZ3BPMXh5WEc1Y2NseHVJQ0FnSUM4dklGTmxkQ0IzYVdSMGFDOW9aV2xuYUhRZ2RYTnBibWNnUTFOVElHbHVJRzl5WkdWeUlIUnZJSEpsYzNCbFkzUWdZbTk0TFhOcGVtbHVaMXh5WEc0Z0lDQWdhV1lnS0hNZ1BpQXhLU0I3WEhKY2JpQWdJQ0FnSUNScGJXRm5aUzVqYzNNb1hDSjNhV1IwYUZ3aUxDQnBkeUF2SUhNZ0t5QmNJbkI0WENJcE8xeHlYRzRnSUNBZ0lDQWthVzFoWjJVdVkzTnpLRndpYUdWcFoyaDBYQ0lzSUdsb0lDOGdjeUFySUZ3aWNIaGNJaWs3WEhKY2JpQWdJQ0I5SUdWc2MyVWdlMXh5WEc0Z0lDQWdJQ0FrYVcxaFoyVXVZM056S0Z3aWQybGtkR2hjSWl3Z2FYY2dLeUJjSW5CNFhDSXBPMXh5WEc0Z0lDQWdJQ0FrYVcxaFoyVXVZM056S0Z3aWFHVnBaMmgwWENJc0lHbG9JQ3NnWENKd2VGd2lLVHRjY2x4dUlDQWdJSDFjY2x4dVhISmNiaUFnSUNCMGFHbHpMbDhrYVcxaFoyVlNhV2RvZEM1amMzTW9YQ0owYjNCY0lpd2dKR2x0WVdkbExtOTFkR1Z5U0dWcFoyaDBLQ2tnTHlBeUlDc2dYQ0p3ZUZ3aUtUdGNjbHh1SUNBZ0lIUm9hWE11WHlScGJXRm5aVXhsWm5RdVkzTnpLRndpZEc5d1hDSXNJQ1JwYldGblpTNXZkWFJsY2tobGFXZG9kQ2dwSUM4Z01pQXJJRndpY0hoY0lpazdYSEpjYmx4eVhHNGdJQ0FnTHk4Z1UyVjBJSFJvWlNCamIyNTBaVzUwSUhkeVlYQndaWElnZEc4Z1ltVWdkR2hsSUhkcFpIUm9JRzltSUhSb1pTQnBiV0ZuWlM0Z1ZHaHBjeUIzYVd4c0lHdGxaWEJjY2x4dUlDQWdJQzh2SUhSb1pTQmpZWEIwYVc5dUlHWnliMjBnWlhod1lXNWthVzVuSUdKbGVXOXVaQ0IwYUdVZ2FXMWhaMlV1WEhKY2JpQWdJQ0IwYUdsekxsOGtZMjl1ZEdWdWRDNTNhV1IwYUNna2FXMWhaMlV1YjNWMFpYSlhhV1IwYUNoMGNuVmxLU2s3WEhKY2JpQWdmUzVpYVc1a0tIUm9hWE1wTzF4eVhHNWNjbHh1SUNCcFppQW9KR2x0WVdkbExuQnliM0FvWENKamIyMXdiR1YwWlZ3aUtTa2djMlYwVTJsNlpTZ3BPMXh5WEc0Z0lHVnNjMlVnSkdsdFlXZGxMbTl1WlNoY0lteHZZV1JjSWl3Z2MyVjBVMmw2WlNrN1hISmNibjA3WEhKY2JpSXNJblpoY2lCVGJHbGtaWE5vYjNkTmIyUmhiQ0E5SUhKbGNYVnBjbVVvWENJdUwzTnNhV1JsYzJodmR5MXRiMlJoYkM1cWMxd2lLVHRjY2x4dWRtRnlJRlJvZFcxaWJtRnBiRk5zYVdSbGNpQTlJSEpsY1hWcGNtVW9YQ0l1TDNSb2RXMWlibUZwYkMxemJHbGtaWEl1YW5OY0lpazdYSEpjYmx4eVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlIdGNjbHh1SUNCcGJtbDBPaUJtZFc1amRHbHZiaWgwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRwSUh0Y2NseHVJQ0FnSUhSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlBOUlIUnlZVzV6YVhScGIyNUVkWEpoZEdsdmJpQWhQVDBnZFc1a1pXWnBibVZrSUQ4Z2RISmhibk5wZEdsdmJrUjFjbUYwYVc5dUlEb2dOREF3TzF4eVhHNGdJQ0FnZEdocGN5NWZjMnhwWkdWemFHOTNjeUE5SUZ0ZE8xeHlYRzRnSUNBZ0pDaGNJaTV6Ykdsa1pYTm9iM2RjSWlrdVpXRmphQ2hjY2x4dUlDQWdJQ0FnWm5WdVkzUnBiMjRvYVc1a1pYZ3NJR1ZzWlcxbGJuUXBJSHRjY2x4dUlDQWdJQ0FnSUNCMllYSWdjMnhwWkdWemFHOTNJRDBnYm1WM0lGTnNhV1JsYzJodmR5Z2tLR1ZzWlcxbGJuUXBMQ0IwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRwTzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WDNOc2FXUmxjMmh2ZDNNdWNIVnphQ2h6Ykdsa1pYTm9iM2NwTzF4eVhHNGdJQ0FnSUNCOUxtSnBibVFvZEdocGN5bGNjbHh1SUNBZ0lDazdYSEpjYmlBZ2ZWeHlYRzU5TzF4eVhHNWNjbHh1Wm5WdVkzUnBiMjRnVTJ4cFpHVnphRzkzS0NSamIyNTBZV2x1WlhJc0lIUnlZVzV6YVhScGIyNUVkWEpoZEdsdmJpa2dlMXh5WEc0Z0lIUm9hWE11WDNSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlBOUlIUnlZVzV6YVhScGIyNUVkWEpoZEdsdmJqdGNjbHh1SUNCMGFHbHpMbDhrWTI5dWRHRnBibVZ5SUQwZ0pHTnZiblJoYVc1bGNqdGNjbHh1SUNCMGFHbHpMbDlwYm1SbGVDQTlJREE3SUM4dklFbHVaR1Y0SUc5bUlITmxiR1ZqZEdWa0lHbHRZV2RsWEhKY2JseHlYRzRnSUM4dklFTnlaV0YwWlNCamIyMXdiMjVsYm5SelhISmNiaUFnZEdocGN5NWZkR2gxYldKdVlXbHNVMnhwWkdWeUlEMGdibVYzSUZSb2RXMWlibUZwYkZOc2FXUmxjaWdrWTI5dWRHRnBibVZ5TENCMGFHbHpLVHRjY2x4dUlDQjBhR2x6TGw5dGIyUmhiQ0E5SUc1bGR5QlRiR2xrWlhOb2IzZE5iMlJoYkNna1kyOXVkR0ZwYm1WeUxDQjBhR2x6S1R0Y2NseHVYSEpjYmlBZ0x5OGdRMkZqYUdVZ1lXNWtJR055WldGMFpTQnVaV05sYzNOaGNua2dSRTlOSUdWc1pXMWxiblJ6WEhKY2JpQWdkR2hwY3k1ZkpHTmhjSFJwYjI1RGIyNTBZV2x1WlhJZ1BTQWtZMjl1ZEdGcGJtVnlMbVpwYm1Rb1hDSXVZMkZ3ZEdsdmJsd2lLVHRjY2x4dUlDQjBhR2x6TGw4a2MyVnNaV04wWldSSmJXRm5aVU52Ym5SaGFXNWxjaUE5SUNSamIyNTBZV2x1WlhJdVptbHVaQ2hjSWk1elpXeGxZM1JsWkMxcGJXRm5aVndpS1R0Y2NseHVYSEpjYmlBZ0x5OGdUM0JsYmlCdGIyUmhiQ0J2YmlCamJHbGphMmx1WnlCelpXeGxZM1JsWkNCcGJXRm5aVnh5WEc0Z0lIUm9hWE11WHlSelpXeGxZM1JsWkVsdFlXZGxRMjl1ZEdGcGJtVnlMbTl1S0Z4eVhHNGdJQ0FnWENKamJHbGphMXdpTEZ4eVhHNGdJQ0FnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnSUNBZ0lIUm9hWE11WDIxdlpHRnNMbTl3Wlc0b2RHaHBjeTVmYVc1a1pYZ3BPMXh5WEc0Z0lDQWdmUzVpYVc1a0tIUm9hWE1wWEhKY2JpQWdLVHRjY2x4dVhISmNiaUFnTHk4Z1RHOWhaQ0JwYldGblpYTmNjbHh1SUNCMGFHbHpMbDhrWjJGc2JHVnllVWx0WVdkbGN5QTlJSFJvYVhNdVgyeHZZV1JIWVd4c1pYSjVTVzFoWjJWektDazdYSEpjYmlBZ2RHaHBjeTVmYm5WdFNXMWhaMlZ6SUQwZ2RHaHBjeTVmSkdkaGJHeGxjbmxKYldGblpYTXViR1Z1WjNSb08xeHlYRzVjY2x4dUlDQXZMeUJUYUc5M0lIUm9aU0JtYVhKemRDQnBiV0ZuWlZ4eVhHNGdJSFJvYVhNdWMyaHZkMGx0WVdkbEtEQXBPMXh5WEc1OVhISmNibHh5WEc1VGJHbGtaWE5vYjNjdWNISnZkRzkwZVhCbExtZGxkRUZqZEdsMlpVbHVaR1Y0SUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2NtVjBkWEp1SUhSb2FYTXVYMmx1WkdWNE8xeHlYRzU5TzF4eVhHNWNjbHh1VTJ4cFpHVnphRzkzTG5CeWIzUnZkSGx3WlM1blpYUk9kVzFKYldGblpYTWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0J5WlhSMWNtNGdkR2hwY3k1ZmJuVnRTVzFoWjJWek8xeHlYRzU5TzF4eVhHNWNjbHh1VTJ4cFpHVnphRzkzTG5CeWIzUnZkSGx3WlM1blpYUkhZV3hzWlhKNVNXMWhaMlVnUFNCbWRXNWpkR2x2YmlocGJtUmxlQ2tnZTF4eVhHNGdJSEpsZEhWeWJpQjBhR2x6TGw4a1oyRnNiR1Z5ZVVsdFlXZGxjMXRwYm1SbGVGMDdYSEpjYm4wN1hISmNibHh5WEc1VGJHbGtaWE5vYjNjdWNISnZkRzkwZVhCbExtZGxkRU5oY0hScGIyNGdQU0JtZFc1amRHbHZiaWhwYm1SbGVDa2dlMXh5WEc0Z0lISmxkSFZ5YmlCMGFHbHpMbDhrWjJGc2JHVnllVWx0WVdkbGMxdHBibVJsZUYwdVpHRjBZU2hjSW1OaGNIUnBiMjVjSWlrN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2N1Y0hKdmRHOTBlWEJsTG5Ob2IzZEpiV0ZuWlNBOUlHWjFibU4wYVc5dUtHbHVaR1Y0S1NCN1hISmNiaUFnTHk4Z1VtVnpaWFFnWVd4c0lHbHRZV2RsY3lCMGJ5QnBiblpwYzJsaWJHVWdZVzVrSUd4dmQyVnpkQ0I2TFdsdVpHVjRMaUJVYUdseklHTnZkV3hrSUdKbElITnRZWEowWlhJc1hISmNiaUFnTHk4Z2JHbHJaU0JJYjNabGNsTnNhV1JsYzJodmR5d2dZVzVrSUc5dWJIa2djbVZ6WlhRZ1pYaGhZM1JzZVNCM2FHRjBJSGRsSUc1bFpXUXNJR0oxZENCM1pTQmhjbVZ1SjNSY2NseHVJQ0F2THlCM1lYTjBhVzVuSUhSb1lYUWdiV0Z1ZVNCamVXTnNaWE11WEhKY2JpQWdkR2hwY3k1ZkpHZGhiR3hsY25sSmJXRm5aWE11Wm05eVJXRmphQ2htZFc1amRHbHZiaWdrWjJGc2JHVnllVWx0WVdkbEtTQjdYSEpjYmlBZ0lDQWtaMkZzYkdWeWVVbHRZV2RsTG1OemN5aDdYSEpjYmlBZ0lDQWdJSHBKYm1SbGVEb2dNQ3hjY2x4dUlDQWdJQ0FnYjNCaFkybDBlVG9nTUZ4eVhHNGdJQ0FnZlNrN1hISmNiaUFnSUNBa1oyRnNiR1Z5ZVVsdFlXZGxMblpsYkc5amFYUjVLRndpYzNSdmNGd2lLVHNnTHk4Z1UzUnZjQ0JoYm5rZ1lXNXBiV0YwYVc5dWMxeHlYRzRnSUgwc0lIUm9hWE1wTzF4eVhHNWNjbHh1SUNBdkx5QkRZV05vWlNCeVpXWmxjbVZ1WTJWeklIUnZJSFJvWlNCc1lYTjBJR0Z1WkNCamRYSnlaVzUwSUdsdFlXZGxYSEpjYmlBZ2RtRnlJQ1JzWVhOMFNXMWhaMlVnUFNCMGFHbHpMbDhrWjJGc2JHVnllVWx0WVdkbGMxdDBhR2x6TGw5cGJtUmxlRjA3WEhKY2JpQWdkbUZ5SUNSamRYSnlaVzUwU1cxaFoyVWdQU0IwYUdsekxsOGtaMkZzYkdWeWVVbHRZV2RsYzF0cGJtUmxlRjA3WEhKY2JpQWdkR2hwY3k1ZmFXNWtaWGdnUFNCcGJtUmxlRHRjY2x4dVhISmNiaUFnTHk4Z1RXRnJaU0IwYUdVZ2JHRnpkQ0JwYldGblpTQjJhWE5wYzJKc1pTQmhibVFnZEdobGJpQmhibWx0WVhSbElIUm9aU0JqZFhKeVpXNTBJR2x0WVdkbElHbHVkRzhnZG1sbGQxeHlYRzRnSUM4dklHOXVJSFJ2Y0NCdlppQjBhR1VnYkdGemRGeHlYRzRnSUNSc1lYTjBTVzFoWjJVdVkzTnpLRndpZWtsdVpHVjRYQ0lzSURFcE8xeHlYRzRnSUNSamRYSnlaVzUwU1cxaFoyVXVZM056S0Z3aWVrbHVaR1Y0WENJc0lESXBPMXh5WEc0Z0lDUnNZWE4wU1cxaFoyVXVZM056S0Z3aWIzQmhZMmwwZVZ3aUxDQXhLVHRjY2x4dUlDQWtZM1Z5Y21WdWRFbHRZV2RsTG5abGJHOWphWFI1S0hzZ2IzQmhZMmwwZVRvZ01TQjlMQ0IwYUdsekxsOTBjbUZ1YzJsMGFXOXVSSFZ5WVhScGIyNHNJRndpWldGelpVbHVUM1YwVVhWaFpGd2lLVHRjY2x4dVhISmNiaUFnTHk4Z1EzSmxZWFJsSUhSb1pTQmpZWEIwYVc5dUxDQnBaaUJwZENCbGVHbHpkSE1nYjI0Z2RHaGxJSFJvZFcxaWJtRnBiRnh5WEc0Z0lIWmhjaUJqWVhCMGFXOXVJRDBnSkdOMWNuSmxiblJKYldGblpTNWtZWFJoS0Z3aVkyRndkR2x2Ymx3aUtUdGNjbHh1SUNCcFppQW9ZMkZ3ZEdsdmJpa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHTmhjSFJwYjI1RGIyNTBZV2x1WlhJdVpXMXdkSGtvS1R0Y2NseHVJQ0FnSUNRb1hDSThjM0JoYmo1Y0lpbGNjbHh1SUNBZ0lDQWdMbUZrWkVOc1lYTnpLRndpWm1sbmRYSmxMVzUxYldKbGNsd2lLVnh5WEc0Z0lDQWdJQ0F1ZEdWNGRDaGNJa1pwWnk0Z1hDSWdLeUFvZEdocGN5NWZhVzVrWlhnZ0t5QXhLU0FySUZ3aU9pQmNJaWxjY2x4dUlDQWdJQ0FnTG1Gd2NHVnVaRlJ2S0hSb2FYTXVYeVJqWVhCMGFXOXVRMjl1ZEdGcGJtVnlLVHRjY2x4dUlDQWdJQ1FvWENJOGMzQmhiajVjSWlsY2NseHVJQ0FnSUNBZ0xtRmtaRU5zWVhOektGd2lZMkZ3ZEdsdmJpMTBaWGgwWENJcFhISmNiaUFnSUNBZ0lDNTBaWGgwS0dOaGNIUnBiMjRwWEhKY2JpQWdJQ0FnSUM1aGNIQmxibVJVYnloMGFHbHpMbDhrWTJGd2RHbHZia052Ym5SaGFXNWxjaWs3WEhKY2JpQWdmVnh5WEc1Y2NseHVJQ0F2THlCUFltcGxZM1FnYVcxaFoyVWdabWwwSUhCdmJIbG1hV3hzSUdKeVpXRnJjeUJxVVhWbGNua2dZWFIwY2lndUxpNHBMQ0J6YnlCbVlXeHNZbUZqYXlCMGJ5QnFkWE4wWEhKY2JpQWdMeThnZFhOcGJtY2daV3hsYldWdWRDNXpjbU5jY2x4dUlDQXZMeUJVVDBSUE9pQk1ZWHA1SVZ4eVhHNGdJQzh2SUdsbUlDZ2tZM1Z5Y21WdWRFbHRZV2RsTG1kbGRDZ3dLUzV6Y21NZ1BUMDlJRndpWENJcElIdGNjbHh1SUNBdkx5QWdJQ0FnSkdOMWNuSmxiblJKYldGblpTNW5aWFFvTUNrdWMzSmpJRDBnSkdOMWNuSmxiblJKYldGblpTNWtZWFJoS0Z3aWFXMWhaMlV0ZFhKc1hDSXBPMXh5WEc0Z0lDOHZJSDFjY2x4dWZUdGNjbHh1WEhKY2JsTnNhV1JsYzJodmR5NXdjbTkwYjNSNWNHVXVYMnh2WVdSSFlXeHNaWEo1U1cxaFoyVnpJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnTHk4Z1EzSmxZWFJsSUdWdGNIUjVJR2x0WVdkbGN5QnBiaUIwYUdVZ1oyRnNiR1Z5ZVNCbWIzSWdaV0ZqYUNCMGFIVnRZbTVoYVd3dUlGUm9hWE1nYUdWc2NITWdkWE1nWkc5Y2NseHVJQ0F2THlCc1lYcDVJR3h2WVdScGJtY2diMllnWjJGc2JHVnllU0JwYldGblpYTWdZVzVrSUdGc2JHOTNjeUIxY3lCMGJ5QmpjbTl6Y3kxbVlXUmxJR2x0WVdkbGN5NWNjbHh1SUNCMllYSWdKR2RoYkd4bGNubEpiV0ZuWlhNZ1BTQmJYVHRjY2x4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJSFJvYVhNdVgzUm9kVzFpYm1GcGJGTnNhV1JsY2k1blpYUk9kVzFVYUhWdFltNWhhV3h6S0NrN0lHa2dLejBnTVNrZ2UxeHlYRzRnSUNBZ0x5OGdSMlYwSUhSb1pTQjBhSFZ0WW01aGFXd2daV3hsYldWdWRDQjNhR2xqYUNCb1lYTWdjR0YwYUNCaGJtUWdZMkZ3ZEdsdmJpQmtZWFJoWEhKY2JpQWdJQ0IyWVhJZ0pIUm9kVzFpSUQwZ2RHaHBjeTVmZEdoMWJXSnVZV2xzVTJ4cFpHVnlMbWRsZENSVWFIVnRZbTVoYVd3b2FTazdYSEpjYmx4eVhHNGdJQ0FnTHk4Z1EyRnNZM1ZzWVhSbElIUm9aU0JwWkNCbWNtOXRJSFJvWlNCd1lYUm9JSFJ2SUhSb1pTQnNZWEpuWlNCcGJXRm5aVnh5WEc0Z0lDQWdkbUZ5SUd4aGNtZGxVR0YwYUNBOUlDUjBhSFZ0WWk1a1lYUmhLRndpYkdGeVoyVXRjR0YwYUZ3aUtUdGNjbHh1SUNBZ0lIWmhjaUJwWkNBOUlHeGhjbWRsVUdGMGFGeHlYRzRnSUNBZ0lDQXVjM0JzYVhRb1hDSXZYQ0lwWEhKY2JpQWdJQ0FnSUM1d2IzQW9LVnh5WEc0Z0lDQWdJQ0F1YzNCc2FYUW9YQ0l1WENJcFd6QmRPMXh5WEc1Y2NseHVJQ0FnSUM4dklFTnlaV0YwWlNCaElHZGhiR3hsY25rZ2FXMWhaMlVnWld4bGJXVnVkRnh5WEc0Z0lDQWdkbUZ5SUNSbllXeHNaWEo1U1cxaFoyVWdQU0FrS0Z3aVBHbHRaejVjSWl3Z2V5QnBaRG9nYVdRZ2ZTbGNjbHh1SUNBZ0lDQWdMbU56Y3loN1hISmNiaUFnSUNBZ0lDQWdjRzl6YVhScGIyNDZJRndpWVdKemIyeDFkR1ZjSWl4Y2NseHVJQ0FnSUNBZ0lDQjBiM0E2SUZ3aU1IQjRYQ0lzWEhKY2JpQWdJQ0FnSUNBZ2JHVm1kRG9nWENJd2NIaGNJaXhjY2x4dUlDQWdJQ0FnSUNCdmNHRmphWFI1T2lBd0xGeHlYRzRnSUNBZ0lDQWdJSHBKYm1SbGVEb2dNRnh5WEc0Z0lDQWdJQ0I5S1Z4eVhHNGdJQ0FnSUNBdVpHRjBZU2hjSW1sdFlXZGxMWFZ5YkZ3aUxDQnNZWEpuWlZCaGRHZ3BYSEpjYmlBZ0lDQWdJQzVrWVhSaEtGd2lZMkZ3ZEdsdmJsd2lMQ0FrZEdoMWJXSXVaR0YwWVNoY0ltTmhjSFJwYjI1Y0lpa3BYSEpjYmlBZ0lDQWdJQzVoY0hCbGJtUlVieWgwYUdsekxsOGtjMlZzWldOMFpXUkpiV0ZuWlVOdmJuUmhhVzVsY2lrN1hISmNiaUFnSUNBa1oyRnNiR1Z5ZVVsdFlXZGxMbWRsZENnd0tTNXpjbU1nUFNCc1lYSm5aVkJoZEdnN0lDOHZJRlJQUkU4NklFMWhhMlVnZEdocGN5QnNZWHA1SVZ4eVhHNGdJQ0FnSkdkaGJHeGxjbmxKYldGblpYTXVjSFZ6YUNna1oyRnNiR1Z5ZVVsdFlXZGxLVHRjY2x4dUlDQjlYSEpjYmlBZ2NtVjBkWEp1SUNSbllXeHNaWEo1U1cxaFoyVnpPMXh5WEc1OU8xeHlYRzRpTENKdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUZSb2RXMWlibUZwYkZOc2FXUmxjanRjY2x4dVhISmNibVoxYm1OMGFXOXVJRlJvZFcxaWJtRnBiRk5zYVdSbGNpZ2tZMjl1ZEdGcGJtVnlMQ0J6Ykdsa1pYTm9iM2NwSUh0Y2NseHVJQ0IwYUdsekxsOGtZMjl1ZEdGcGJtVnlJRDBnSkdOdmJuUmhhVzVsY2p0Y2NseHVJQ0IwYUdsekxsOXpiR2xrWlhOb2IzY2dQU0J6Ykdsa1pYTm9iM2M3WEhKY2JseHlYRzRnSUhSb2FYTXVYMmx1WkdWNElEMGdNRHNnTHk4Z1NXNWtaWGdnYjJZZ2MyVnNaV04wWldRZ2RHaDFiV0p1WVdsc1hISmNiaUFnZEdocGN5NWZjMk55YjJ4c1NXNWtaWGdnUFNBd095QXZMeUJKYm1SbGVDQnZaaUIwYUdVZ2RHaDFiV0p1WVdsc0lIUm9ZWFFnYVhNZ1kzVnljbVZ1ZEd4NUlHTmxiblJsY21Wa1hISmNibHh5WEc0Z0lDOHZJRU5oWTJobElHRnVaQ0JqY21WaGRHVWdibVZqWlhOellYSjVJRVJQVFNCbGJHVnRaVzUwYzF4eVhHNGdJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeERiMjUwWVdsdVpYSWdQU0FrWTI5dWRHRnBibVZ5TG1acGJtUW9YQ0l1ZEdoMWJXSnVZV2xzYzF3aUtUdGNjbHh1SUNCMGFHbHpMbDhrZEdoMWJXSnVZV2xzU1cxaFoyVnpJRDBnZEdocGN5NWZKSFJvZFcxaWJtRnBiRU52Ym5SaGFXNWxjaTVtYVc1a0tGd2lhVzFuWENJcE8xeHlYRzRnSUhSb2FYTXVYeVIyYVhOcFlteGxWR2gxYldKdVlXbHNWM0poY0NBOUlDUmpiMjUwWVdsdVpYSXVabWx1WkNoY0lpNTJhWE5wWW14bExYUm9kVzFpYm1GcGJITmNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpHRmtkbUZ1WTJWTVpXWjBJRDBnSkdOdmJuUmhhVzVsY2k1bWFXNWtLRndpTG5Sb2RXMWlibUZwYkMxaFpIWmhibU5sTFd4bFpuUmNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpHRmtkbUZ1WTJWU2FXZG9kQ0E5SUNSamIyNTBZV2x1WlhJdVptbHVaQ2hjSWk1MGFIVnRZbTVoYVd3dFlXUjJZVzVqWlMxeWFXZG9kRndpS1R0Y2NseHVYSEpjYmlBZ0x5OGdURzl2Y0NCMGFISnZkV2RvSUhSb1pTQjBhSFZ0WW01aGFXeHpMQ0JuYVhabElIUm9aVzBnWVc0Z2FXNWtaWGdnWkdGMFlTQmhkSFJ5YVdKMWRHVWdZVzVrSUdOaFkyaGxYSEpjYmlBZ0x5OGdZU0J5WldabGNtVnVZMlVnZEc4Z2RHaGxiU0JwYmlCaGJpQmhjbkpoZVZ4eVhHNGdJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeHpJRDBnVzEwN1hISmNiaUFnZEdocGN5NWZKSFJvZFcxaWJtRnBiRWx0WVdkbGN5NWxZV05vS0Z4eVhHNGdJQ0FnWm5WdVkzUnBiMjRvYVc1a1pYZ3NJR1ZzWlcxbGJuUXBJSHRjY2x4dUlDQWdJQ0FnZG1GeUlDUjBhSFZ0WW01aGFXd2dQU0FrS0dWc1pXMWxiblFwTzF4eVhHNGdJQ0FnSUNBa2RHaDFiV0p1WVdsc0xtUmhkR0VvWENKcGJtUmxlRndpTENCcGJtUmxlQ2s3WEhKY2JpQWdJQ0FnSUhSb2FYTXVYeVIwYUhWdFltNWhhV3h6TG5CMWMyZ29KSFJvZFcxaWJtRnBiQ2s3WEhKY2JpQWdJQ0I5TG1KcGJtUW9kR2hwY3lsY2NseHVJQ0FwTzF4eVhHNGdJSFJvYVhNdVgyNTFiVWx0WVdkbGN5QTlJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeHpMbXhsYm1kMGFEdGNjbHh1WEhKY2JpQWdMeThnVEdWbWRDOXlhV2RvZENCamIyNTBjbTlzYzF4eVhHNGdJSFJvYVhNdVh5UmhaSFpoYm1ObFRHVm1kQzV2YmloY0ltTnNhV05yWENJc0lIUm9hWE11WVdSMllXNWpaVXhsWm5RdVltbHVaQ2gwYUdsektTazdYSEpjYmlBZ2RHaHBjeTVmSkdGa2RtRnVZMlZTYVdkb2RDNXZiaWhjSW1Oc2FXTnJYQ0lzSUhSb2FYTXVZV1IyWVc1alpWSnBaMmgwTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzVjY2x4dUlDQXZMeUJEYkdsamEybHVaeUJoSUhSb2RXMWlibUZwYkZ4eVhHNGdJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeEpiV0ZuWlhNdWIyNG9YQ0pqYkdsamExd2lMQ0IwYUdsekxsOXZia05zYVdOckxtSnBibVFvZEdocGN5a3BPMXh5WEc1Y2NseHVJQ0IwYUdsekxsOWhZM1JwZG1GMFpWUm9kVzFpYm1GcGJDZ3dLVHRjY2x4dVhISmNiaUFnTHk4Z1VtVnphWHBsWEhKY2JpQWdKQ2gzYVc1a2IzY3BMbTl1S0Z3aWNtVnphWHBsWENJc0lIUm9hWE11WDI5dVVtVnphWHBsTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzVjY2x4dUlDQXZMeUJHYjNJZ2MyOXRaU0J5WldGemIyNHNJSFJvWlNCemFYcHBibWNnYjI0Z2RHaGxJR052Ym5SeWIyeHpJR2x6SUcxbGMzTmxaQ0IxY0NCcFppQnBkQ0J5ZFc1elhISmNiaUFnTHk4Z2FXMXRaV1JwWVhSbGJIa2dMU0JrWld4aGVTQnphWHBwYm1jZ2RXNTBhV3dnYzNSaFkyc2dhWE1nWTJ4bFlYSmNjbHh1SUNCelpYUlVhVzFsYjNWMEtGeHlYRzRnSUNBZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ0lDQWdJSFJvYVhNdVgyOXVVbVZ6YVhwbEtDazdYSEpjYmlBZ0lDQjlMbUpwYm1Rb2RHaHBjeWtzWEhKY2JpQWdJQ0F3WEhKY2JpQWdLVHRjY2x4dWZWeHlYRzVjY2x4dVZHaDFiV0p1WVdsc1UyeHBaR1Z5TG5CeWIzUnZkSGx3WlM1blpYUkJZM1JwZG1WSmJtUmxlQ0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUhKbGRIVnliaUIwYUdsekxsOXBibVJsZUR0Y2NseHVmVHRjY2x4dVhISmNibFJvZFcxaWJtRnBiRk5zYVdSbGNpNXdjbTkwYjNSNWNHVXVaMlYwVG5WdFZHaDFiV0p1WVdsc2N5QTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJSEpsZEhWeWJpQjBhR2x6TGw5dWRXMUpiV0ZuWlhNN1hISmNibjA3WEhKY2JseHlYRzVVYUhWdFltNWhhV3hUYkdsa1pYSXVjSEp2ZEc5MGVYQmxMbWRsZENSVWFIVnRZbTVoYVd3Z1BTQm1kVzVqZEdsdmJpaHBibVJsZUNrZ2UxeHlYRzRnSUhKbGRIVnliaUIwYUdsekxsOGtkR2gxYldKdVlXbHNjMXRwYm1SbGVGMDdYSEpjYm4wN1hISmNibHh5WEc1VWFIVnRZbTVoYVd4VGJHbGtaWEl1Y0hKdmRHOTBlWEJsTG1Ga2RtRnVZMlZNWldaMElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdkbUZ5SUc1bGQwbHVaR1Y0SUQwZ2RHaHBjeTVmYzJOeWIyeHNTVzVrWlhnZ0xTQjBhR2x6TGw5dWRXMVdhWE5wWW14bE8xeHlYRzRnSUc1bGQwbHVaR1Y0SUQwZ1RXRjBhQzV0WVhnb2JtVjNTVzVrWlhnc0lEQXBPMXh5WEc0Z0lIUm9hWE11WDNOamNtOXNiRlJ2VkdoMWJXSnVZV2xzS0c1bGQwbHVaR1Y0S1R0Y2NseHVmVHRjY2x4dVhISmNibFJvZFcxaWJtRnBiRk5zYVdSbGNpNXdjbTkwYjNSNWNHVXVZV1IyWVc1alpWSnBaMmgwSUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2RtRnlJRzVsZDBsdVpHVjRJRDBnZEdocGN5NWZjMk55YjJ4c1NXNWtaWGdnS3lCMGFHbHpMbDl1ZFcxV2FYTnBZbXhsTzF4eVhHNGdJRzVsZDBsdVpHVjRJRDBnVFdGMGFDNXRhVzRvYm1WM1NXNWtaWGdzSUhSb2FYTXVYMjUxYlVsdFlXZGxjeUF0SURFcE8xeHlYRzRnSUhSb2FYTXVYM05qY205c2JGUnZWR2gxYldKdVlXbHNLRzVsZDBsdVpHVjRLVHRjY2x4dWZUdGNjbHh1WEhKY2JsUm9kVzFpYm1GcGJGTnNhV1JsY2k1d2NtOTBiM1I1Y0dVdVgzSmxjMlYwVTJsNmFXNW5JRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnTHk4Z1VtVnpaWFFnYzJsNmFXNW5JSFpoY21saFlteGxjeTRnVkdocGN5QnBibU5zZFdSbGN5QnlaWE5sZEhScGJtY2dZVzU1SUdsdWJHbHVaU0J6ZEhsc1pTQjBhR0YwSUdoaGMxeHlYRzRnSUM4dklHSmxaVzRnWVhCd2JHbGxaQ3dnYzI4Z2RHaGhkQ0JoYm5rZ2MybDZaU0JqWVd4amRXeGhkR2x2Ym5NZ1kyRnVJR0psSUdKaGMyVmtJRzl1SUhSb1pTQkRVMU5jY2x4dUlDQXZMeUJ6ZEhsc2FXNW5MbHh5WEc0Z0lIUm9hWE11WHlSMGFIVnRZbTVoYVd4RGIyNTBZV2x1WlhJdVkzTnpLSHRjY2x4dUlDQWdJSFJ2Y0RvZ1hDSmNJaXhjY2x4dUlDQWdJR3hsWm5RNklGd2lYQ0lzWEhKY2JpQWdJQ0IzYVdSMGFEb2dYQ0pjSWl4Y2NseHVJQ0FnSUdobGFXZG9kRG9nWENKY0lseHlYRzRnSUgwcE8xeHlYRzRnSUhSb2FYTXVYeVIyYVhOcFlteGxWR2gxYldKdVlXbHNWM0poY0M1M2FXUjBhQ2hjSWx3aUtUdGNjbHh1SUNCMGFHbHpMbDhrZG1semFXSnNaVlJvZFcxaWJtRnBiRmR5WVhBdWFHVnBaMmgwS0Z3aVhDSXBPMXh5WEc0Z0lDOHZJRTFoYTJVZ1lXeHNJSFJvZFcxaWJtRnBiSE1nYzNGMVlYSmxJR0Z1WkNCeVpYTmxkQ0JoYm5rZ2FHVnBaMmgwWEhKY2JpQWdkR2hwY3k1ZkpIUm9kVzFpYm1GcGJITXVabTl5UldGamFDaG1kVzVqZEdsdmJpZ2taV3hsYldWdWRDa2dlMXh5WEc0Z0lDQWdKR1ZzWlcxbGJuUXVhR1ZwWjJoMEtGd2lYQ0lwT3lBdkx5QlNaWE5sZENCb1pXbG5hSFFnWW1WbWIzSmxJSE5sZEhScGJtY2dkMmxrZEdoY2NseHVJQ0FnSUNSbGJHVnRaVzUwTG5kcFpIUm9LQ1JsYkdWdFpXNTBMbWhsYVdkb2RDZ3BLVHRjY2x4dUlDQjlLVHRjY2x4dWZUdGNjbHh1WEhKY2JsUm9kVzFpYm1GcGJGTnNhV1JsY2k1d2NtOTBiM1I1Y0dVdVgyOXVVbVZ6YVhwbElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdkR2hwY3k1ZmNtVnpaWFJUYVhwcGJtY29LVHRjY2x4dVhISmNiaUFnTHk4Z1EyRnNZM1ZzWVhSbElIUm9aU0J6YVhwbElHOW1JSFJvWlNCbWFYSnpkQ0IwYUhWdFltNWhhV3d1SUZSb2FYTWdZWE56ZFcxbGN5QjBhR1VnWm1seWMzUWdhVzFoWjJWY2NseHVJQ0F2THlCdmJteDVJR2hoY3lCaElISnBaMmgwTFhOcFpHVWdiV0Z5WjJsdUxseHlYRzRnSUhaaGNpQWtabWx5YzNSVWFIVnRZaUE5SUhSb2FYTXVYeVIwYUhWdFltNWhhV3h6V3pCZE8xeHlYRzRnSUhaaGNpQjBhSFZ0WWxOcGVtVWdQU0FrWm1seWMzUlVhSFZ0WWk1dmRYUmxja2hsYVdkb2RDaG1ZV3h6WlNrN1hISmNiaUFnZG1GeUlIUm9kVzFpVFdGeVoybHVJRDBnTWlBcUlDZ2tabWx5YzNSVWFIVnRZaTV2ZFhSbGNsZHBaSFJvS0hSeWRXVXBJQzBnZEdoMWJXSlRhWHBsS1R0Y2NseHVYSEpjYmlBZ0x5OGdUV1ZoYzNWeVpTQmpiMjUwY205c2N5NGdWR2hsZVNCdVpXVmtJSFJ2SUdKbElIWnBjMmxpYkdVZ2FXNGdiM0prWlhJZ2RHOGdZbVVnYldWaGMzVnlaV1F1WEhKY2JpQWdkR2hwY3k1ZkpHRmtkbUZ1WTJWU2FXZG9kQzVqYzNNb1hDSmthWE53YkdGNVhDSXNJRndpWW14dlkydGNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpHRmtkbUZ1WTJWTVpXWjBMbU56Y3loY0ltUnBjM0JzWVhsY0lpd2dYQ0ppYkc5amExd2lLVHRjY2x4dUlDQjJZWElnZEdoMWJXSkRiMjUwY205c1YybGtkR2dnUFZ4eVhHNGdJQ0FnZEdocGN5NWZKR0ZrZG1GdVkyVlNhV2RvZEM1dmRYUmxjbGRwWkhSb0tIUnlkV1VwSUNzZ2RHaHBjeTVmSkdGa2RtRnVZMlZNWldaMExtOTFkR1Z5VjJsa2RHZ29kSEoxWlNrN1hISmNibHh5WEc0Z0lDOHZJRU5oYkdOMWJHRjBaU0JvYjNjZ2JXRnVlU0JtZFd4c0lIUm9kVzFpYm1GcGJITWdZMkZ1SUdacGRDQjNhWFJvYVc0Z2RHaGxJSFJvZFcxaWJtRnBiQ0JoY21WaFhISmNiaUFnZG1GeUlIWnBjMmxpYkdWWGFXUjBhQ0E5SUhSb2FYTXVYeVIyYVhOcFlteGxWR2gxYldKdVlXbHNWM0poY0M1dmRYUmxjbGRwWkhSb0tHWmhiSE5sS1R0Y2NseHVJQ0IyWVhJZ2JuVnRWR2gxYldKelZtbHphV0pzWlNBOUlFMWhkR2d1Wm14dmIzSW9LSFpwYzJsaWJHVlhhV1IwYUNBdElIUm9kVzFpVFdGeVoybHVLU0F2SUNoMGFIVnRZbE5wZW1VZ0t5QjBhSFZ0WWsxaGNtZHBiaWtwTzF4eVhHNWNjbHh1SUNBdkx5QkRhR1ZqYXlCM2FHVjBhR1Z5SUdGc2JDQjBhR1VnZEdoMWJXSnVZV2xzY3lCallXNGdabWwwSUc5dUlIUm9aU0J6WTNKbFpXNGdZWFFnYjI1alpWeHlYRzRnSUdsbUlDaHVkVzFVYUhWdFluTldhWE5wWW14bElEd2dkR2hwY3k1ZmJuVnRTVzFoWjJWektTQjdYSEpjYmlBZ0lDQXZMeUJVWVd0bElHRWdZbVZ6ZENCbmRXVnpjeUJoZENCb2IzY2dkRzhnYzJsNlpTQjBhR1VnZEdoMWJXSnVZV2xzY3k0Z1UybDZaU0JtYjNKdGRXeGhPbHh5WEc0Z0lDQWdMeThnSUhkcFpIUm9JRDBnYm5WdElDb2dkR2gxYldKVGFYcGxJQ3NnS0c1MWJTQXRJREVwSUNvZ2RHaDFiV0pOWVhKbmFXNGdLeUJqYjI1MGNtOXNVMmw2WlZ4eVhHNGdJQ0FnTHk4Z1UyOXNkbVVnWm05eUlHNTFiV0psY2lCdlppQjBhSFZ0WW01aGFXeHpJR0Z1WkNCeWIzVnVaQ0IwYnlCMGFHVWdibVZoY21WemRDQnBiblJsWjJWeUlITnZYSEpjYmlBZ0lDQXZMeUIwYUdGMElIZGxJR1J2YmlkMElHaGhkbVVnWVc1NUlIQmhjblJwWVd3Z2RHaDFiV0p1WVdsc2N5QnphRzkzYVc1bkxseHlYRzRnSUNBZ2JuVnRWR2gxYldKelZtbHphV0pzWlNBOUlFMWhkR2d1Y205MWJtUW9YSEpjYmlBZ0lDQWdJQ2gyYVhOcFlteGxWMmxrZEdnZ0xTQjBhSFZ0WWtOdmJuUnliMnhYYVdSMGFDQXJJSFJvZFcxaVRXRnlaMmx1S1NBdklDaDBhSFZ0WWxOcGVtVWdLeUIwYUhWdFlrMWhjbWRwYmlsY2NseHVJQ0FnSUNrN1hISmNibHh5WEc0Z0lDQWdMeThnVlhObElIUm9hWE1nYm5WdFltVnlJRzltSUhSb2RXMWlibUZwYkhNZ2RHOGdZMkZzWTNWc1lYUmxJSFJvWlNCMGFIVnRZbTVoYVd3Z2MybDZaVnh5WEc0Z0lDQWdkbUZ5SUc1bGQxTnBlbVVnUFNBb2RtbHphV0pzWlZkcFpIUm9JQzBnZEdoMWJXSkRiMjUwY205c1YybGtkR2dnS3lCMGFIVnRZazFoY21kcGJpa2dMeUJ1ZFcxVWFIVnRZbk5XYVhOcFlteGxJQzBnZEdoMWJXSk5ZWEpuYVc0N1hISmNiaUFnSUNCMGFHbHpMbDhrZEdoMWJXSnVZV2xzY3k1bWIzSkZZV05vS0daMWJtTjBhVzl1S0NSbGJHVnRaVzUwS1NCN1hISmNiaUFnSUNBZ0lDOHZJQ1F1ZDJsa2RHZ2dZVzVrSUNRdWFHVnBaMmgwSUhObGRDQjBhR1VnWTI5dWRHVnVkQ0J6YVhwbElISmxaMkZ5Wkd4bGMzTWdiMllnZEdobFhISmNiaUFnSUNBZ0lDOHZJR0p2ZUMxemFYcHBibWN1SUZSb1pTQnBiV0ZuWlhNZ1lYSmxJR0p2Y21SbGNpMWliM2dzSUhOdklIZGxJSGRoYm5RZ2RHaGxJRU5UVXlCM2FXUjBhRnh5WEc0Z0lDQWdJQ0F2THlCaGJtUWdhR1ZwWjJoMExpQlVhR2x6SUdGc2JHOTNjeUIwYUdVZ1lXTjBhWFpsSUdsdFlXZGxJSFJ2SUdoaGRtVWdZU0JpYjNKa1pYSWdZVzVrSUhSb1pWeHlYRzRnSUNBZ0lDQXZMeUJ2ZEdobGNpQnBiV0ZuWlhNZ2RHOGdhR0YyWlNCd1lXUmthVzVuTGx4eVhHNGdJQ0FnSUNBa1pXeGxiV1Z1ZEM1amMzTW9YQ0ozYVdSMGFGd2lMQ0J1WlhkVGFYcGxJQ3NnWENKd2VGd2lLVHRjY2x4dUlDQWdJQ0FnSkdWc1pXMWxiblF1WTNOektGd2lhR1ZwWjJoMFhDSXNJRzVsZDFOcGVtVWdLeUJjSW5CNFhDSXBPMXh5WEc0Z0lDQWdmU2s3WEhKY2JseHlYRzRnSUNBZ0x5OGdVMlYwSUhSb1pTQjBhSFZ0WW01aGFXd2dkM0poY0NCemFYcGxMaUJKZENCemFHOTFiR1FnWW1VZ2FuVnpkQ0IwWVd4c0lHVnViM1ZuYUNCMGJ5Qm1hWFFnWVZ4eVhHNGdJQ0FnTHk4Z2RHaDFiV0p1WVdsc0lHRnVaQ0JzYjI1bklHVnViM1ZuYUNCMGJ5Qm9iMnhrSUdGc2JDQjBhR1VnZEdoMWJXSnVZV2xzY3lCcGJpQnZibVVnYkdsdVpUcGNjbHh1SUNBZ0lIWmhjaUIwYjNSaGJGTnBlbVVnUFNCdVpYZFRhWHBsSUNvZ2RHaHBjeTVmYm5WdFNXMWhaMlZ6SUNzZ2RHaDFiV0pOWVhKbmFXNGdLaUFvZEdocGN5NWZiblZ0U1cxaFoyVnpJQzBnTVNrN1hISmNiaUFnSUNCMGFHbHpMbDhrZEdoMWJXSnVZV2xzUTI5dWRHRnBibVZ5TG1OemN5aDdYSEpjYmlBZ0lDQWdJSGRwWkhSb09pQjBiM1JoYkZOcGVtVWdLeUJjSW5CNFhDSXNYSEpjYmlBZ0lDQWdJR2hsYVdkb2REb2dKR1pwY25OMFZHaDFiV0l1YjNWMFpYSklaV2xuYUhRb2RISjFaU2tnS3lCY0luQjRYQ0pjY2x4dUlDQWdJSDBwTzF4eVhHNWNjbHh1SUNBZ0lDOHZJRk5sZENCMGFHVWdkbWx6YVdKc1pTQjBhSFZ0WW01aGFXd2dkM0poY0NCemFYcGxMaUJVYUdseklHbHpJSFZ6WldRZ2RHOGdiV0ZyY3lCMGFHVWdiWFZqYUZ4eVhHNGdJQ0FnTHk4Z2JHRnlaMlZ5SUhSb2RXMWlibUZwYkNCamIyNTBZV2x1WlhJdUlFbDBJSE5vYjNWc1pDQmlaU0JoY3lCM2FXUmxJR0Z6SUdsMElHTmhiaUJpWlN3Z2JXbHVkWE5jY2x4dUlDQWdJQzh2SUhSb1pTQnpjR0ZqWlNCdVpXVmtaV1FnWm05eUlIUm9aU0JzWldaMEwzSnBaMmgwSUdOdmJuUnZiSE11WEhKY2JpQWdJQ0IwYUdsekxsOGtkbWx6YVdKc1pWUm9kVzFpYm1GcGJGZHlZWEF1WTNOektIdGNjbHh1SUNBZ0lDQWdkMmxrZEdnNklIWnBjMmxpYkdWWGFXUjBhQ0F0SUhSb2RXMWlRMjl1ZEhKdmJGZHBaSFJvSUNzZ1hDSndlRndpTEZ4eVhHNGdJQ0FnSUNCb1pXbG5hSFE2SUNSbWFYSnpkRlJvZFcxaUxtOTFkR1Z5U0dWcFoyaDBLSFJ5ZFdVcElDc2dYQ0p3ZUZ3aVhISmNiaUFnSUNCOUtUdGNjbHh1SUNCOUlHVnNjMlVnZTF4eVhHNGdJQ0FnTHk4Z1FXeHNJSFJvZFcxaWJtRnBiSE1nWVhKbElIWnBjMmxpYkdVc0lIZGxJR05oYmlCb2FXUmxJSFJvWlNCamIyNTBjbTlzY3lCaGJtUWdaWGh3WVc1a0lIUm9aVnh5WEc0Z0lDQWdMeThnZEdoMWJXSnVZV2xzSUdOdmJuUmhhVzVsY2lCMGJ5QXhNREFsWEhKY2JpQWdJQ0J1ZFcxVWFIVnRZbk5XYVhOcFlteGxJRDBnZEdocGN5NWZiblZ0U1cxaFoyVnpPMXh5WEc0Z0lDQWdkR2hwY3k1ZkpIUm9kVzFpYm1GcGJFTnZiblJoYVc1bGNpNWpjM01vWENKM2FXUjBhRndpTENCY0lqRXdNQ1ZjSWlrN1hISmNiaUFnSUNCMGFHbHpMbDhrWVdSMllXNWpaVkpwWjJoMExtTnpjeWhjSW1ScGMzQnNZWGxjSWl3Z1hDSnViMjVsWENJcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkdGa2RtRnVZMlZNWldaMExtTnpjeWhjSW1ScGMzQnNZWGxjSWl3Z1hDSnViMjVsWENJcE8xeHlYRzRnSUgxY2NseHVYSEpjYmlBZ2RHaHBjeTVmYm5WdFZtbHphV0pzWlNBOUlHNTFiVlJvZFcxaWMxWnBjMmxpYkdVN1hISmNiaUFnZG1GeUlHMXBaR1JzWlVsdVpHVjRJRDBnVFdGMGFDNW1iRzl2Y2lnb2RHaHBjeTVmYm5WdFZtbHphV0pzWlNBdElERXBJQzhnTWlrN1hISmNiaUFnZEdocGN5NWZjMk55YjJ4c1FtOTFibVJ6SUQwZ2UxeHlYRzRnSUNBZ2JXbHVPaUJ0YVdSa2JHVkpibVJsZUN4Y2NseHVJQ0FnSUcxaGVEb2dkR2hwY3k1ZmJuVnRTVzFoWjJWeklDMGdNU0F0SUcxcFpHUnNaVWx1WkdWNFhISmNiaUFnZlR0Y2NseHVJQ0JwWmlBb2RHaHBjeTVmYm5WdFZtbHphV0pzWlNBbElESWdQVDA5SURBcElIUm9hWE11WDNOamNtOXNiRUp2ZFc1a2N5NXRZWGdnTFQwZ01UdGNjbHh1WEhKY2JpQWdkR2hwY3k1ZmRYQmtZWFJsVkdoMWJXSnVZV2xzUTI5dWRISnZiSE1vS1R0Y2NseHVmVHRjY2x4dVhISmNibFJvZFcxaWJtRnBiRk5zYVdSbGNpNXdjbTkwYjNSNWNHVXVYMkZqZEdsMllYUmxWR2gxYldKdVlXbHNJRDBnWm5WdVkzUnBiMjRvYVc1a1pYZ3BJSHRjY2x4dUlDQXZMeUJCWTNScGRtRjBaUzlrWldGamRHbDJZWFJsSUhSb2RXMWlibUZwYkhOY2NseHVJQ0IwYUdsekxsOGtkR2gxYldKdVlXbHNjMXQwYUdsekxsOXBibVJsZUYwdWNtVnRiM1psUTJ4aGMzTW9YQ0poWTNScGRtVmNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpIUm9kVzFpYm1GcGJITmJhVzVrWlhoZExtRmtaRU5zWVhOektGd2lZV04wYVhabFhDSXBPMXh5WEc1OU8xeHlYRzVjY2x4dVZHaDFiV0p1WVdsc1UyeHBaR1Z5TG5CeWIzUnZkSGx3WlM1ZmMyTnliMnhzVkc5VWFIVnRZbTVoYVd3Z1BTQm1kVzVqZEdsdmJpaHBibVJsZUNrZ2UxeHlYRzRnSUM4dklFNXZJRzVsWldRZ2RHOGdjMk55YjJ4c0lHbG1JR0ZzYkNCMGFIVnRZbTVoYVd4eklHRnlaU0IyYVhOcFlteGxYSEpjYmlBZ2FXWWdLSFJvYVhNdVgyNTFiVlpwYzJsaWJHVWdQVDA5SUhSb2FYTXVYMjUxYlVsdFlXZGxjeWtnY21WMGRYSnVPMXh5WEc1Y2NseHVJQ0F2THlCRGIyNXpkSEpoYVc0Z2FXNWtaWGdnYzI4Z2RHaGhkQ0IzWlNCallXNG5kQ0J6WTNKdmJHd2diM1YwSUc5bUlHSnZkVzVrYzF4eVhHNGdJR2x1WkdWNElEMGdUV0YwYUM1dFlYZ29hVzVrWlhnc0lIUm9hWE11WDNOamNtOXNiRUp2ZFc1a2N5NXRhVzRwTzF4eVhHNGdJR2x1WkdWNElEMGdUV0YwYUM1dGFXNG9hVzVrWlhnc0lIUm9hWE11WDNOamNtOXNiRUp2ZFc1a2N5NXRZWGdwTzF4eVhHNGdJSFJvYVhNdVgzTmpjbTlzYkVsdVpHVjRJRDBnYVc1a1pYZzdYSEpjYmx4eVhHNGdJQzh2SUVacGJtUWdkR2hsSUZ3aWJHVm1kRndpSUhCdmMybDBhVzl1SUc5bUlIUm9aU0IwYUhWdFltNWhhV3dnWTI5dWRHRnBibVZ5SUhSb1lYUWdkMjkxYkdRZ2NIVjBJSFJvWlZ4eVhHNGdJQzh2SUhSb2RXMWlibUZwYkNCaGRDQnBibVJsZUNCaGRDQjBhR1VnWTJWdWRHVnlYSEpjYmlBZ2RtRnlJQ1IwYUhWdFlpQTlJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeHpXekJkTzF4eVhHNGdJSFpoY2lCemFYcGxJRDBnY0dGeWMyVkdiRzloZENna2RHaDFiV0l1WTNOektGd2lkMmxrZEdoY0lpa3BPMXh5WEc0Z0lIWmhjaUJ0WVhKbmFXNGdQU0F5SUNvZ2NHRnljMlZHYkc5aGRDZ2tkR2gxYldJdVkzTnpLRndpYldGeVoybHVMWEpwWjJoMFhDSXBLVHRjY2x4dUlDQjJZWElnWTJWdWRHVnlXQ0E5SUhOcGVtVWdLaUIwYUdsekxsOXpZM0p2Ykd4Q2IzVnVaSE11YldsdUlDc2diV0Z5WjJsdUlDb2dLSFJvYVhNdVgzTmpjbTlzYkVKdmRXNWtjeTV0YVc0Z0xTQXhLVHRjY2x4dUlDQjJZWElnZEdoMWJXSllJRDBnYzJsNlpTQXFJR2x1WkdWNElDc2diV0Z5WjJsdUlDb2dLR2x1WkdWNElDMGdNU2s3WEhKY2JpQWdkbUZ5SUd4bFpuUWdQU0JqWlc1MFpYSllJQzBnZEdoMWJXSllPMXh5WEc1Y2NseHVJQ0F2THlCQmJtbHRZWFJsSUhSb1pTQjBhSFZ0WW01aGFXd2dZMjl1ZEdGcGJtVnlYSEpjYmlBZ2RHaHBjeTVmSkhSb2RXMWlibUZwYkVOdmJuUmhhVzVsY2k1MlpXeHZZMmwwZVNoY0luTjBiM0JjSWlrN1hISmNiaUFnZEdocGN5NWZKSFJvZFcxaWJtRnBiRU52Ym5SaGFXNWxjaTUyWld4dlkybDBlU2hjY2x4dUlDQWdJSHRjY2x4dUlDQWdJQ0FnYkdWbWREb2diR1ZtZENBcklGd2ljSGhjSWx4eVhHNGdJQ0FnZlN4Y2NseHVJQ0FnSURZd01DeGNjbHh1SUNBZ0lGd2laV0Z6WlVsdVQzVjBVWFZoWkZ3aVhISmNiaUFnS1R0Y2NseHVYSEpjYmlBZ2RHaHBjeTVmZFhCa1lYUmxWR2gxYldKdVlXbHNRMjl1ZEhKdmJITW9LVHRjY2x4dWZUdGNjbHh1WEhKY2JsUm9kVzFpYm1GcGJGTnNhV1JsY2k1d2NtOTBiM1I1Y0dVdVgyOXVRMnhwWTJzZ1BTQm1kVzVqZEdsdmJpaGxLU0I3WEhKY2JpQWdkbUZ5SUNSMFlYSm5aWFFnUFNBa0tHVXVkR0Z5WjJWMEtUdGNjbHh1SUNCMllYSWdhVzVrWlhnZ1BTQWtkR0Z5WjJWMExtUmhkR0VvWENKcGJtUmxlRndpS1R0Y2NseHVYSEpjYmlBZ0x5OGdRMnhwWTJ0bFpDQnZiaUIwYUdVZ1lXTjBhWFpsSUdsdFlXZGxJQzBnYm04Z2JtVmxaQ0IwYnlCa2J5QmhibmwwYUdsdVoxeHlYRzRnSUdsbUlDaDBhR2x6TGw5cGJtUmxlQ0FoUFQwZ2FXNWtaWGdwSUh0Y2NseHVJQ0FnSUhSb2FYTXVYMkZqZEdsMllYUmxWR2gxYldKdVlXbHNLR2x1WkdWNEtUdGNjbHh1SUNBZ0lIUm9hWE11WDNOamNtOXNiRlJ2VkdoMWJXSnVZV2xzS0dsdVpHVjRLVHRjY2x4dUlDQWdJSFJvYVhNdVgybHVaR1Y0SUQwZ2FXNWtaWGc3WEhKY2JpQWdJQ0IwYUdsekxsOXpiR2xrWlhOb2IzY3VjMmh2ZDBsdFlXZGxLR2x1WkdWNEtUdGNjbHh1SUNCOVhISmNibjA3WEhKY2JseHlYRzVVYUhWdFltNWhhV3hUYkdsa1pYSXVjSEp2ZEc5MGVYQmxMbDkxY0dSaGRHVlVhSFZ0WW01aGFXeERiMjUwY205c2N5QTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJQzh2SUZKbExXVnVZV0pzWlZ4eVhHNGdJSFJvYVhNdVh5UmhaSFpoYm1ObFRHVm1kQzV5WlcxdmRtVkRiR0Z6Y3loY0ltUnBjMkZpYkdWa1hDSXBPMXh5WEc0Z0lIUm9hWE11WHlSaFpIWmhibU5sVW1sbmFIUXVjbVZ0YjNabFEyeGhjM01vWENKa2FYTmhZbXhsWkZ3aUtUdGNjbHh1WEhKY2JpQWdMeThnUkdsellXSnNaU0JwWmlCM1pTZDJaU0J5WldGamFHVmtJSFJvWlNCMGFHVWdiV0Y0SUc5eUlHMXBiaUJzYVcxcGRGeHlYRzRnSUM4dklIWmhjaUJ0YVdSVFkzSnZiR3hKYm1SbGVDQTlJRTFoZEdndVpteHZiM0lvS0hSb2FYTXVYMjUxYlZacGMybGliR1VnTFNBeEtTQXZJRElwTzF4eVhHNGdJQzh2SUhaaGNpQnRhVzVUWTNKdmJHeEpibVJsZUNBOUlHMXBaRk5qY205c2JFbHVaR1Y0TzF4eVhHNGdJQzh2SUhaaGNpQnRZWGhUWTNKdmJHeEpibVJsZUNBOUlIUm9hWE11WDI1MWJVbHRZV2RsY3lBdElERWdMU0J0YVdSVFkzSnZiR3hKYm1SbGVEdGNjbHh1SUNCcFppQW9kR2hwY3k1ZmMyTnliMnhzU1c1a1pYZ2dQajBnZEdocGN5NWZjMk55YjJ4c1FtOTFibVJ6TG0xaGVDa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHRmtkbUZ1WTJWU2FXZG9kQzVoWkdSRGJHRnpjeWhjSW1ScGMyRmliR1ZrWENJcE8xeHlYRzRnSUgwZ1pXeHpaU0JwWmlBb2RHaHBjeTVmYzJOeWIyeHNTVzVrWlhnZ1BEMGdkR2hwY3k1ZmMyTnliMnhzUW05MWJtUnpMbTFwYmlrZ2UxeHlYRzRnSUNBZ2RHaHBjeTVmSkdGa2RtRnVZMlZNWldaMExtRmtaRU5zWVhOektGd2laR2x6WVdKc1pXUmNJaWs3WEhKY2JpQWdmVnh5WEc1OU8xeHlYRzRpTENKbGVIQnZjblJ6TG1SbFptRjFiSFFnUFNCbWRXNWpkR2x2YmloMllXd3NJR1JsWm1GMWJIUldZV3dwSUh0Y2NseHVJQ0J5WlhSMWNtNGdkbUZzSUNFOVBTQjFibVJsWm1sdVpXUWdQeUIyWVd3Z09pQmtaV1poZFd4MFZtRnNPMXh5WEc1OU8xeHlYRzVjY2x4dUx5OGdWVzUwWlhOMFpXUmNjbHh1THk4Z1pYaHdiM0owY3k1a1pXWmhkV3gwVUhKdmNHVnlkR2xsY3lBOUlHWjFibU4wYVc5dUlHUmxabUYxYkhSUWNtOXdaWEowYVdWeklDaHZZbW9zSUhCeWIzQnpLU0I3WEhKY2JpOHZJQ0FnSUNCbWIzSWdLSFpoY2lCd2NtOXdJR2x1SUhCeWIzQnpLU0I3WEhKY2JpOHZJQ0FnSUNBZ0lDQWdhV1lnS0hCeWIzQnpMbWhoYzA5M2JsQnliM0JsY25SNUtIQnliM0J6TENCd2NtOXdLU2tnZTF4eVhHNHZMeUFnSUNBZ0lDQWdJQ0FnSUNCMllYSWdkbUZzZFdVZ1BTQmxlSEJ2Y25SekxtUmxabUYxYkhSV1lXeDFaU2h3Y205d2N5NTJZV3gxWlN3Z2NISnZjSE11WkdWbVlYVnNkQ2s3WEhKY2JpOHZJQ0FnSUNBZ0lDQWdJQ0FnSUc5aWFsdHdjbTl3WFNBOUlIWmhiSFZsTzF4eVhHNHZMeUFnSUNBZ0lDQWdJSDFjY2x4dUx5OGdJQ0FnSUgxY2NseHVMeThnSUNBZ0lISmxkSFZ5YmlCdlltbzdYSEpjYmk4dklIMDdYSEpjYmk4dlhISmNibVY0Y0c5eWRITXVkR2x0WlVsMElEMGdablZ1WTNScGIyNG9ablZ1WXlrZ2UxeHlYRzRnSUhaaGNpQnpkR0Z5ZENBOUlIQmxjbVp2Y20xaGJtTmxMbTV2ZHlncE8xeHlYRzRnSUdaMWJtTW9LVHRjY2x4dUlDQjJZWElnWlc1a0lEMGdjR1Z5Wm05eWJXRnVZMlV1Ym05M0tDazdYSEpjYmlBZ2NtVjBkWEp1SUdWdVpDQXRJSE4wWVhKME8xeHlYRzU5TzF4eVhHNWNjbHh1Wlhod2IzSjBjeTVwYzBsdVVtVmpkQ0E5SUdaMWJtTjBhVzl1S0hnc0lIa3NJSEpsWTNRcElIdGNjbHh1SUNCcFppQW9lQ0ErUFNCeVpXTjBMbmdnSmlZZ2VDQThQU0J5WldOMExuZ2dLeUJ5WldOMExuY2dKaVlnZVNBK1BTQnlaV04wTG5rZ0ppWWdlU0E4UFNCeVpXTjBMbmtnS3lCeVpXTjBMbWdwSUh0Y2NseHVJQ0FnSUhKbGRIVnliaUIwY25WbE8xeHlYRzRnSUgxY2NseHVJQ0J5WlhSMWNtNGdabUZzYzJVN1hISmNibjA3WEhKY2JseHlYRzVsZUhCdmNuUnpMbkpoYm1SSmJuUWdQU0JtZFc1amRHbHZiaWh0YVc0c0lHMWhlQ2tnZTF4eVhHNGdJSEpsZEhWeWJpQk5ZWFJvTG1ac2IyOXlLRTFoZEdndWNtRnVaRzl0S0NrZ0tpQW9iV0Y0SUMwZ2JXbHVJQ3NnTVNrcElDc2diV2x1TzF4eVhHNTlPMXh5WEc1Y2NseHVaWGh3YjNKMGN5NXlZVzVrUVhKeVlYbEZiR1Z0Wlc1MElEMGdablZ1WTNScGIyNG9ZWEp5WVhrcElIdGNjbHh1SUNCMllYSWdhU0E5SUdWNGNHOXlkSE11Y21GdVpFbHVkQ2d3TENCaGNuSmhlUzVzWlc1bmRHZ2dMU0F4S1R0Y2NseHVJQ0J5WlhSMWNtNGdZWEp5WVhsYmFWMDdYSEpjYm4wN1hISmNibHh5WEc1bGVIQnZjblJ6TG0xaGNDQTlJR1oxYm1OMGFXOXVLRzUxYlN3Z2JXbHVNU3dnYldGNE1Td2diV2x1TWl3Z2JXRjRNaXdnYjNCMGFXOXVjeWtnZTF4eVhHNGdJSFpoY2lCdFlYQndaV1FnUFNBb2JuVnRJQzBnYldsdU1Ta2dMeUFvYldGNE1TQXRJRzFwYmpFcElDb2dLRzFoZURJZ0xTQnRhVzR5S1NBcklHMXBiakk3WEhKY2JpQWdhV1lnS0NGdmNIUnBiMjV6S1NCeVpYUjFjbTRnYldGd2NHVmtPMXh5WEc0Z0lHbG1JQ2h2Y0hScGIyNXpMbkp2ZFc1a0lDWW1JRzl3ZEdsdmJuTXVjbTkxYm1RZ1BUMDlJSFJ5ZFdVcElIdGNjbHh1SUNBZ0lHMWhjSEJsWkNBOUlFMWhkR2d1Y205MWJtUW9iV0Z3Y0dWa0tUdGNjbHh1SUNCOVhISmNiaUFnYVdZZ0tHOXdkR2x2Ym5NdVpteHZiM0lnSmlZZ2IzQjBhVzl1Y3k1bWJHOXZjaUE5UFQwZ2RISjFaU2tnZTF4eVhHNGdJQ0FnYldGd2NHVmtJRDBnVFdGMGFDNW1iRzl2Y2lodFlYQndaV1FwTzF4eVhHNGdJSDFjY2x4dUlDQnBaaUFvYjNCMGFXOXVjeTVqWldsc0lDWW1JRzl3ZEdsdmJuTXVZMlZwYkNBOVBUMGdkSEoxWlNrZ2UxeHlYRzRnSUNBZ2JXRndjR1ZrSUQwZ1RXRjBhQzVqWldsc0tHMWhjSEJsWkNrN1hISmNiaUFnZlZ4eVhHNGdJR2xtSUNodmNIUnBiMjV6TG1Oc1lXMXdJQ1ltSUc5d2RHbHZibk11WTJ4aGJYQWdQVDA5SUhSeWRXVXBJSHRjY2x4dUlDQWdJRzFoY0hCbFpDQTlJRTFoZEdndWJXbHVLRzFoY0hCbFpDd2diV0Y0TWlrN1hISmNiaUFnSUNCdFlYQndaV1FnUFNCTllYUm9MbTFoZUNodFlYQndaV1FzSUcxcGJqSXBPMXh5WEc0Z0lIMWNjbHh1SUNCeVpYUjFjbTRnYldGd2NHVmtPMXh5WEc1OU8xeHlYRzVjY2x4dVpYaHdiM0owY3k1blpYUlJkV1Z5ZVZCaGNtRnRaWFJsY25NZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQXZMeUJEYUdWamF5Qm1iM0lnY1hWbGNua2djM1J5YVc1blhISmNiaUFnZG1GeUlIRnpJRDBnZDJsdVpHOTNMbXh2WTJGMGFXOXVMbk5sWVhKamFEdGNjbHh1SUNCcFppQW9jWE11YkdWdVozUm9JRHc5SURFcElISmxkSFZ5YmlCN2ZUdGNjbHh1SUNBdkx5QlJkV1Z5ZVNCemRISnBibWNnWlhocGMzUnpMQ0J3WVhKelpTQnBkQ0JwYm5SdklHRWdjWFZsY25rZ2IySnFaV04wWEhKY2JpQWdjWE1nUFNCeGN5NXpkV0p6ZEhKcGJtY29NU2s3SUM4dklGSmxiVzkyWlNCMGFHVWdYQ0kvWENJZ1pHVnNhVzFwZEdWeVhISmNiaUFnZG1GeUlHdGxlVlpoYkZCaGFYSnpJRDBnY1hNdWMzQnNhWFFvWENJbVhDSXBPMXh5WEc0Z0lIWmhjaUJ4ZFdWeWVVOWlhbVZqZENBOUlIdDlPMXh5WEc0Z0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2dhMlY1Vm1Gc1VHRnBjbk11YkdWdVozUm9PeUJwSUNzOUlERXBJSHRjY2x4dUlDQWdJSFpoY2lCclpYbFdZV3dnUFNCclpYbFdZV3hRWVdseWMxdHBYUzV6Y0d4cGRDaGNJajFjSWlrN1hISmNiaUFnSUNCcFppQW9hMlY1Vm1Gc0xteGxibWQwYUNBOVBUMGdNaWtnZTF4eVhHNGdJQ0FnSUNCMllYSWdhMlY1SUQwZ1pHVmpiMlJsVlZKSlEyOXRjRzl1Wlc1MEtHdGxlVlpoYkZzd1hTazdYSEpjYmlBZ0lDQWdJSFpoY2lCMllXd2dQU0JrWldOdlpHVlZVa2xEYjIxd2IyNWxiblFvYTJWNVZtRnNXekZkS1R0Y2NseHVJQ0FnSUNBZ2NYVmxjbmxQWW1wbFkzUmJhMlY1WFNBOUlIWmhiRHRjY2x4dUlDQWdJSDFjY2x4dUlDQjlYSEpjYmlBZ2NtVjBkWEp1SUhGMVpYSjVUMkpxWldOME8xeHlYRzU5TzF4eVhHNWNjbHh1Wlhod2IzSjBjeTVqY21WaGRHVlJkV1Z5ZVZOMGNtbHVaeUE5SUdaMWJtTjBhVzl1S0hGMVpYSjVUMkpxWldOMEtTQjdYSEpjYmlBZ2FXWWdLSFI1Y0dWdlppQnhkV1Z5ZVU5aWFtVmpkQ0FoUFQwZ1hDSnZZbXBsWTNSY0lpa2djbVYwZFhKdUlGd2lYQ0k3WEhKY2JpQWdkbUZ5SUd0bGVYTWdQU0JQWW1wbFkzUXVhMlY1Y3loeGRXVnllVTlpYW1WamRDazdYSEpjYmlBZ2FXWWdLR3RsZVhNdWJHVnVaM1JvSUQwOVBTQXdLU0J5WlhSMWNtNGdYQ0pjSWp0Y2NseHVJQ0IyWVhJZ2NYVmxjbmxUZEhKcGJtY2dQU0JjSWo5Y0lqdGNjbHh1SUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHdGxlWE11YkdWdVozUm9PeUJwSUNzOUlERXBJSHRjY2x4dUlDQWdJSFpoY2lCclpYa2dQU0JyWlhselcybGRPMXh5WEc0Z0lDQWdkbUZ5SUhaaGJDQTlJSEYxWlhKNVQySnFaV04wVzJ0bGVWMDdYSEpjYmlBZ0lDQnhkV1Z5ZVZOMGNtbHVaeUFyUFNCbGJtTnZaR1ZWVWtsRGIyMXdiMjVsYm5Rb2EyVjVLU0FySUZ3aVBWd2lJQ3NnWlc1amIyUmxWVkpKUTI5dGNHOXVaVzUwS0haaGJDazdYSEpjYmlBZ0lDQnBaaUFvYVNBaFBUMGdhMlY1Y3k1c1pXNW5kR2dnTFNBeEtTQnhkV1Z5ZVZOMGNtbHVaeUFyUFNCY0lpWmNJanRjY2x4dUlDQjlYSEpjYmlBZ2NtVjBkWEp1SUhGMVpYSjVVM1J5YVc1bk8xeHlYRzU5TzF4eVhHNWNjbHh1Wlhod2IzSjBjeTUzY21Gd1NXNWtaWGdnUFNCbWRXNWpkR2x2YmlocGJtUmxlQ3dnYkdWdVozUm9LU0I3WEhKY2JpQWdkbUZ5SUhkeVlYQndaV1JKYm1SbGVDQTlJR2x1WkdWNElDVWdiR1Z1WjNSb08xeHlYRzRnSUdsbUlDaDNjbUZ3Y0dWa1NXNWtaWGdnUENBd0tTQjdYSEpjYmlBZ0lDQXZMeUJKWmlCdVpXZGhkR2wyWlN3Z1pteHBjQ0IwYUdVZ2FXNWtaWGdnYzI4Z2RHaGhkQ0F0TVNCaVpXTnZiV1Z6SUhSb1pTQnNZWE4wSUdsMFpXMGdhVzRnYkdsemRGeHlYRzRnSUNBZ2QzSmhjSEJsWkVsdVpHVjRJRDBnYkdWdVozUm9JQ3NnZDNKaGNIQmxaRWx1WkdWNE8xeHlYRzRnSUgxY2NseHVJQ0J5WlhSMWNtNGdkM0poY0hCbFpFbHVaR1Y0TzF4eVhHNTlPMXh5WEc0aVhYMD0ifQ==
