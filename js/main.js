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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJub2RlX21vZHVsZXMvcDUtYmJveC1hbGlnbmVkLXRleHQvbGliL2Jib3gtYWxpZ25lZC10ZXh0LmpzIiwibm9kZV9tb2R1bGVzL3A1LWJib3gtYWxpZ25lZC10ZXh0L2xpYi91dGlscy5qcyIsInNyYy9qcy9ob3Zlci1zbGlkZXNob3cuanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvYmFzZS1sb2dvLXNrZXRjaC5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9jb25uZWN0LXBvaW50cy1za2V0Y2guanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvZ2VuZXJhdG9ycy9ub2lzZS1nZW5lcmF0b3JzLmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2dlbmVyYXRvcnMvc2luLWdlbmVyYXRvci5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9oYWxmdG9uZS1mbGFzaGxpZ2h0LXdvcmQuanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3Mvbm9pc3ktd29yZC1za2V0Y2guanMiLCJzcmMvanMvbWFpbi1uYXYuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9wYWdlLWxvYWRlci5qcyIsInNyYy9qcy9waWNrLXJhbmRvbS1za2V0Y2guanMiLCJzcmMvanMvcG9ydGZvbGlvLWZpbHRlci5qcyIsInNyYy9qcy90aHVtYm5haWwtc2xpZGVzaG93L3NsaWRlc2hvdy1tb2RhbC5qcyIsInNyYy9qcy90aHVtYm5haWwtc2xpZGVzaG93L3NsaWRlc2hvdy5qcyIsInNyYy9qcy90aHVtYm5haWwtc2xpZGVzaG93L3RodW1ibmFpbC1zbGlkZXIuanMiLCJzcmMvanMvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIEphdmFTY3JpcHQgQ29va2llIHYyLjEuNFxuICogaHR0cHM6Ly9naXRodWIuY29tL2pzLWNvb2tpZS9qcy1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAwNiwgMjAxNSBLbGF1cyBIYXJ0bCAmIEZhZ25lciBCcmFja1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0dmFyIHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IGZhbHNlO1xuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZhY3RvcnkpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHRcdHJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlciA9IHRydWU7XG5cdH1cblx0aWYgKCFyZWdpc3RlcmVkSW5Nb2R1bGVMb2FkZXIpIHtcblx0XHR2YXIgT2xkQ29va2llcyA9IHdpbmRvdy5Db29raWVzO1xuXHRcdHZhciBhcGkgPSB3aW5kb3cuQ29va2llcyA9IGZhY3RvcnkoKTtcblx0XHRhcGkubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHdpbmRvdy5Db29raWVzID0gT2xkQ29va2llcztcblx0XHRcdHJldHVybiBhcGk7XG5cdFx0fTtcblx0fVxufShmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIGV4dGVuZCAoKSB7XG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHNbIGkgXTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdHJlc3VsdFtrZXldID0gYXR0cmlidXRlc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG5cdFx0ZnVuY3Rpb24gYXBpIChrZXksIHZhbHVlLCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHR2YXIgcmVzdWx0O1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXcml0ZVxuXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0YXR0cmlidXRlcyA9IGV4dGVuZCh7XG5cdFx0XHRcdFx0cGF0aDogJy8nXG5cdFx0XHRcdH0sIGFwaS5kZWZhdWx0cywgYXR0cmlidXRlcyk7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiBhdHRyaWJ1dGVzLmV4cGlyZXMgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0dmFyIGV4cGlyZXMgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0XHRcdGV4cGlyZXMuc2V0TWlsbGlzZWNvbmRzKGV4cGlyZXMuZ2V0TWlsbGlzZWNvbmRzKCkgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlKzUpO1xuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGV4cGlyZXM7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBXZSdyZSB1c2luZyBcImV4cGlyZXNcIiBiZWNhdXNlIFwibWF4LWFnZVwiIGlzIG5vdCBzdXBwb3J0ZWQgYnkgSUVcblx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gYXR0cmlidXRlcy5leHBpcmVzID8gYXR0cmlidXRlcy5leHBpcmVzLnRvVVRDU3RyaW5nKCkgOiAnJztcblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcblx0XHRcdFx0XHRpZiAoL15bXFx7XFxbXS8udGVzdChyZXN1bHQpKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZSA9IHJlc3VsdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cblx0XHRcdFx0aWYgKCFjb252ZXJ0ZXIud3JpdGUpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcodmFsdWUpKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8M0F8M0N8M0V8M0R8MkZ8M0Z8NDB8NUJ8NUR8NUV8NjB8N0J8N0R8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRrZXkgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGtleSkpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1tcXChcXCldL2csIGVzY2FwZSk7XG5cblx0XHRcdFx0dmFyIHN0cmluZ2lmaWVkQXR0cmlidXRlcyA9ICcnO1xuXG5cdFx0XHRcdGZvciAodmFyIGF0dHJpYnV0ZU5hbWUgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRcdGlmICghYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnOyAnICsgYXR0cmlidXRlTmFtZTtcblx0XHRcdFx0XHRpZiAoYXR0cmlidXRlc1thdHRyaWJ1dGVOYW1lXSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHN0cmluZ2lmaWVkQXR0cmlidXRlcyArPSAnPScgKyBhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAoZG9jdW1lbnQuY29va2llID0ga2V5ICsgJz0nICsgdmFsdWUgKyBzdHJpbmdpZmllZEF0dHJpYnV0ZXMpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZWFkXG5cblx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdHJlc3VsdCA9IHt9O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG5cdFx0XHQvLyBpbiBjYXNlIHRoZXJlIGFyZSBubyBjb29raWVzIGF0IGFsbC4gQWxzbyBwcmV2ZW50cyBvZGQgcmVzdWx0IHdoZW5cblx0XHRcdC8vIGNhbGxpbmcgXCJnZXQoKVwiXG5cdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOyAnKSA6IFtdO1xuXHRcdFx0dmFyIHJkZWNvZGUgPSAvKCVbMC05QS1aXXsyfSkrL2c7XG5cdFx0XHR2YXIgaSA9IDA7XG5cblx0XHRcdGZvciAoOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG5cblx0XHRcdFx0aWYgKGNvb2tpZS5jaGFyQXQoMCkgPT09ICdcIicpIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWUuc2xpY2UoMSwgLTEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR2YXIgbmFtZSA9IHBhcnRzWzBdLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0XHRjb29raWUgPSBjb252ZXJ0ZXIucmVhZCA/XG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXIucmVhZChjb29raWUsIG5hbWUpIDogY29udmVydGVyKGNvb2tpZSwgbmFtZSkgfHxcblx0XHRcdFx0XHRcdGNvb2tpZS5yZXBsYWNlKHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cblx0XHRcdFx0XHRpZiAodGhpcy5qc29uKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb29raWUgPSBKU09OLnBhcnNlKGNvb2tpZSk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChrZXkgPT09IG5hbWUpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IGNvb2tpZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdFx0XHRyZXN1bHRbbmFtZV0gPSBjb29raWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdGFwaS5zZXQgPSBhcGk7XG5cdFx0YXBpLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHJldHVybiBhcGkuY2FsbChhcGksIGtleSk7XG5cdFx0fTtcblx0XHRhcGkuZ2V0SlNPTiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBhcGkuYXBwbHkoe1xuXHRcdFx0XHRqc29uOiB0cnVlXG5cdFx0XHR9LCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuXHRcdH07XG5cdFx0YXBpLmRlZmF1bHRzID0ge307XG5cblx0XHRhcGkucmVtb3ZlID0gZnVuY3Rpb24gKGtleSwgYXR0cmlidXRlcykge1xuXHRcdFx0YXBpKGtleSwgJycsIGV4dGVuZChhdHRyaWJ1dGVzLCB7XG5cdFx0XHRcdGV4cGlyZXM6IC0xXG5cdFx0XHR9KSk7XG5cdFx0fTtcblxuXHRcdGFwaS53aXRoQ29udmVydGVyID0gaW5pdDtcblxuXHRcdHJldHVybiBhcGk7XG5cdH1cblxuXHRyZXR1cm4gaW5pdChmdW5jdGlvbiAoKSB7fSk7XG59KSk7XG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKFwiLi91dGlscy5qc1wiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmJveEFsaWduZWRUZXh0O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgQmJveEFsaWduZWRUZXh0IG9iamVjdCAtIGEgdGV4dCBvYmplY3QgdGhhdCBjYW4gYmUgZHJhd24gd2l0aFxyXG4gKiBhbmNob3IgcG9pbnRzIGJhc2VkIG9uIGEgdGlnaHQgYm91bmRpbmcgYm94IGFyb3VuZCB0aGUgdGV4dC5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBmb250IC0gcDUuRm9udCBvYmplY3RcclxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBTdHJpbmcgdG8gZGlzcGxheVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW2ZvbnRTaXplPTEyXSAtIEZvbnQgc2l6ZSB0byB1c2UgZm9yIHN0cmluZ1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW3g9MF0gLSBJbml0aWFsIHggbG9jYXRpb25cclxuICogQHBhcmFtIHtudW1iZXJ9IFt5PTBdIC0gSW5pdGlhbCB5IGxvY2F0aW9uXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcEluc3RhbmNlPXdpbmRvd10gLSBSZWZlcmVuY2UgdG8gcDUgaW5zdGFuY2UsIGxlYXZlIGJsYW5rIGlmXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2V0Y2ggaXMgZ2xvYmFsXHJcbiAqIEBleGFtcGxlXHJcbiAqIHZhciBmb250LCBiYm94VGV4dDtcclxuICogZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICogICAgIGZvbnQgPSBsb2FkRm9udChcIi4vYXNzZXRzL1JlZ3VsYXIudHRmXCIpO1xyXG4gKiB9XHJcbiAqIGZ1bmN0aW9uIHNldHVwKCkge1xyXG4gKiAgICAgY3JlYXRlQ2FudmFzKDQwMCwgNjAwKTtcclxuICogICAgIGJhY2tncm91bmQoMCk7XHJcbiAqICAgICBcclxuICogICAgIGJib3hUZXh0ID0gbmV3IEJib3hBbGlnbmVkVGV4dChmb250LCBcIkhleSFcIiwgMzApOyAgICBcclxuICogICAgIGJib3hUZXh0LnNldFJvdGF0aW9uKFBJIC8gNCk7XHJcbiAqICAgICBiYm94VGV4dC5zZXRBbmNob3IoQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9DRU5URVIsIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSKTtcclxuICogICAgIFxyXG4gKiAgICAgZmlsbChcIiMwMEE4RUFcIik7XHJcbiAqICAgICBub1N0cm9rZSgpO1xyXG4gKiAgICAgYmJveFRleHQuZHJhdyh3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xyXG4gKiB9XHJcbiAqL1xyXG5mdW5jdGlvbiBCYm94QWxpZ25lZFRleHQoZm9udCwgdGV4dCwgZm9udFNpemUsIHgsIHksIHBJbnN0YW5jZSkge1xyXG4gICAgdGhpcy5fZm9udCA9IGZvbnQ7XHJcbiAgICB0aGlzLl90ZXh0ID0gdGV4dDtcclxuICAgIHRoaXMuX3ggPSB1dGlscy5kZWZhdWx0KHgsIDApO1xyXG4gICAgdGhpcy5feSA9IHV0aWxzLmRlZmF1bHQoeSwgMCk7XHJcbiAgICB0aGlzLl9mb250U2l6ZSA9IHV0aWxzLmRlZmF1bHQoZm9udFNpemUsIDEyKTtcclxuICAgIHRoaXMuX3AgPSB1dGlscy5kZWZhdWx0KHBJbnN0YW5jZSwgd2luZG93KTtcclxuICAgIHRoaXMuX3JvdGF0aW9uID0gMDtcclxuICAgIHRoaXMuX2hBbGlnbiA9IEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfQ0VOVEVSO1xyXG4gICAgdGhpcy5fdkFsaWduID0gQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVI7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVNZXRyaWNzKHRydWUpO1xyXG59XHJcblxyXG4vKipcclxuICogVmVydGljYWwgYWxpZ25tZW50IHZhbHVlc1xyXG4gKiBAcHVibGljXHJcbiAqIEBzdGF0aWNcclxuICogQHJlYWRvbmx5XHJcbiAqIEBlbnVtIHtzdHJpbmd9XHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQuQUxJR04gPSB7XHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBsZWZ0IG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfTEVGVDogXCJib3hfbGVmdFwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgY2VudGVyIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfQ0VOVEVSOiBcImJveF9jZW50ZXJcIixcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIHJpZ2h0IG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfUklHSFQ6IFwiYm94X3JpZ2h0XCJcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlbGluZSBhbGlnbm1lbnQgdmFsdWVzXHJcbiAqIEBwdWJsaWNcclxuICogQHN0YXRpY1xyXG4gKiBAcmVhZG9ubHlcclxuICogQGVudW0ge3N0cmluZ31cclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5CQVNFTElORSA9IHtcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIHRvcCBvZiB0aGUgYmJveCAqL1xyXG4gICAgQk9YX1RPUDogXCJib3hfdG9wXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9DRU5URVI6IFwiYm94X2NlbnRlclwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgYm90dG9tIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfQk9UVE9NOiBcImJveF9ib3R0b21cIixcclxuICAgIC8qKiBcclxuICAgICAqIERyYXcgZnJvbSBoYWxmIHRoZSBoZWlnaHQgb2YgdGhlIGZvbnQuIFNwZWNpZmljYWxseSB0aGUgaGVpZ2h0IGlzXHJcbiAgICAgKiBjYWxjdWxhdGVkIGFzOiBhc2NlbnQgKyBkZXNjZW50LlxyXG4gICAgICovXHJcbiAgICBGT05UX0NFTlRFUjogXCJmb250X2NlbnRlclwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgdGhlIG5vcm1hbCBmb250IGJhc2VsaW5lICovXHJcbiAgICBBTFBIQUJFVElDOiBcImFscGhhYmV0aWNcIlxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCBjdXJyZW50IHRleHRcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gVGV4dCBzdHJpbmcgdG8gZGlzcGxheVxyXG4gKiBAcmV0dXJucyB7dGhpc30gVXNlZnVsIGZvciBjaGFpbmluZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRUZXh0ID0gZnVuY3Rpb24oc3RyaW5nKSB7XHJcbiAgICB0aGlzLl90ZXh0ID0gc3RyaW5nO1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlTWV0cmljcyhmYWxzZSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIHRleHQgcG9zaXRpb25cclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0geCAtIFggcG9zaXRpb25cclxuICogQHBhcmFtIHtudW1iZXJ9IHggLSBZIHBvc2l0aW9uXHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oeCwgeSkge1xyXG4gICAgdGhpcy5feCA9IHV0aWxzLmRlZmF1bHQoeCwgdGhpcy5feCk7XHJcbiAgICB0aGlzLl95ID0gdXRpbHMuZGVmYXVsdCh5LCB0aGlzLl95KTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgdGV4dCBwb3NpdGlvblxyXG4gKiBAcHVibGljXHJcbiAqIEByZXR1cm4ge29iamVjdH0gUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzOiB4LCB5XHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHRoaXMuX3gsXHJcbiAgICAgICAgeTogdGhpcy5feVxyXG4gICAgfTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgY3VycmVudCB0ZXh0IHNpemVcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0gZm9udFNpemUgVGV4dCBzaXplXHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFRleHRTaXplID0gZnVuY3Rpb24oZm9udFNpemUpIHtcclxuICAgIHRoaXMuX2ZvbnRTaXplID0gZm9udFNpemU7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVNZXRyaWNzKHRydWUpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IHJvdGF0aW9uIG9mIHRleHRcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBSb3RhdGlvbiBpbiByYWRpYW5zXHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFJvdGF0aW9uID0gZnVuY3Rpb24oYW5nbGUpIHtcclxuICAgIHRoaXMuX3JvdGF0aW9uID0gdXRpbHMuZGVmYXVsdChhbmdsZSwgdGhpcy5fcm90YXRpb24pO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHJvdGF0aW9uIG9mIHRleHRcclxuICogQHB1YmxpY1xyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSb3RhdGlvbiBpbiByYWRpYW5zXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLmdldFJvdGF0aW9uID0gZnVuY3Rpb24oYW5nbGUpIHtcclxuICAgIHJldHVybiB0aGlzLl9yb3RhdGlvbjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIHAgaW5zdGFuY2UgdGhhdCBpcyB1c2VkIGZvciBkcmF3aW5nXHJcbiAqIEBwdWJsaWNcclxuICogQHBhcmFtIHtvYmplY3R9IHAgLSBJbnN0YW5jZSBvZiBwNSBmb3IgZHJhd2luZy4gVGhpcyBpcyBvbmx5IG5lZWRlZCB3aGVuIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgIHVzaW5nIGFuIG9mZnNjcmVlbiByZW5kZXJlciBvciB3aGVuIHVzaW5nIHA1IGluIGluc3RhbmNlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgbW9kZS5cclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0UEluc3RhbmNlID0gZnVuY3Rpb24ocCkge1xyXG4gICAgdGhpcy5fcCA9IHV0aWxzLmRlZmF1bHQocCwgdGhpcy5fcCk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgcm90YXRpb24gb2YgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9IEluc3RhbmNlIG9mIHA1IHRoYXQgaXMgYmVpbmcgdXNlZCBmb3IgZHJhd2luZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRQSW5zdGFuY2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9wO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCBhbmNob3IgcG9pbnQgZm9yIHRleHQgKGhvcml6b25hbCBhbmQgdmVydGljYWwgYWxpZ25tZW50KSByZWxhdGl2ZSB0b1xyXG4gKiBib3VuZGluZyBib3hcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2hBbGlnbj1DRU5URVJdIC0gSG9yaXpvbmFsIGFsaWdubWVudFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW3ZBbGlnbj1DRU5URVJdIC0gVmVydGljYWwgYmFzZWxpbmVcclxuICogQHBhcmFtIHtib29sZWFufSBbdXBkYXRlUG9zaXRpb249ZmFsc2VdIC0gSWYgc2V0IHRvIHRydWUsIHRoZSBwb3NpdGlvbiBvZiB0aGVcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHRleHQgd2lsbCBiZSBzaGlmdGVkIHNvIHRoYXRcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHRleHQgd2lsbCBiZSBkcmF3biBpbiB0aGUgc2FtZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZSBpdCB3YXMgYmVmb3JlIGNhbGxpbmcgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEFuY2hvci5cclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0QW5jaG9yID0gZnVuY3Rpb24oaEFsaWduLCB2QWxpZ24sIHVwZGF0ZVBvc2l0aW9uKSB7XHJcbiAgICB2YXIgb2xkUG9zID0gdGhpcy5fY2FsY3VsYXRlQWxpZ25lZENvb3Jkcyh0aGlzLl94LCB0aGlzLl95KTtcclxuICAgIHRoaXMuX2hBbGlnbiA9IHV0aWxzLmRlZmF1bHQoaEFsaWduLCBCYm94QWxpZ25lZFRleHQuQUxJR04uQ0VOVEVSKTtcclxuICAgIHRoaXMuX3ZBbGlnbiA9IHV0aWxzLmRlZmF1bHQodkFsaWduLCBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQ0VOVEVSKTtcclxuICAgIGlmICh1cGRhdGVQb3NpdGlvbikge1xyXG4gICAgICAgIHZhciBuZXdQb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHRoaXMuX3gsIHRoaXMuX3kpO1xyXG4gICAgICAgIHRoaXMuX3ggKz0gb2xkUG9zLnggLSBuZXdQb3MueDtcclxuICAgICAgICB0aGlzLl95ICs9IG9sZFBvcy55IC0gbmV3UG9zLnk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGJvdW5kaW5nIGJveCB3aGVuIHRoZSB0ZXh0IGlzIHBsYWNlZCBhdCB0aGUgc3BlY2lmaWVkIGNvb3JkaW5hdGVzLlxyXG4gKiBOb3RlOiB0aGlzIGlzIHRoZSB1bnJvdGF0ZWQgYm91bmRpbmcgYm94ISBUT0RPOiBGaXggdGhpcy5cclxuICogQHBhcmFtIHtudW1iZXJ9IFt4PWN1cnJlbnQgeF0gLSBBIG5ldyB4IGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3IuIFRoaXNcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVybWFuZW50bHkuIFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3k9Y3VycmVudCB5XSAtIEEgbmV3IHkgY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpc1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbGwgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJtYW5lbnRseS5cclxuICogQHJldHVybiB7b2JqZWN0fSBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXM6IHgsIHksIHcsIGhcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0QmJveCA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICB2YXIgcG9zID0gdGhpcy5fY2FsY3VsYXRlQWxpZ25lZENvb3Jkcyh0aGlzLl94LCB0aGlzLl95KTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogcG9zLnggKyB0aGlzLl9ib3VuZHNPZmZzZXQueCxcclxuICAgICAgICB5OiBwb3MueSArIHRoaXMuX2JvdW5kc09mZnNldC55LFxyXG4gICAgICAgIHc6IHRoaXMud2lkdGgsXHJcbiAgICAgICAgaDogdGhpcy5oZWlnaHRcclxuICAgIH07XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IGFuIGFycmF5IG9mIHBvaW50cyB0aGF0IGZvbGxvdyBhbG9uZyB0aGUgdGV4dCBwYXRoLiBUaGlzIHdpbGwgdGFrZSBpbnRvXHJcbiAqIGNvbnNpZGVyYXRpb24gdGhlIGN1cnJlbnQgYWxpZ25tZW50IHNldHRpbmdzLlxyXG4gKiBOb3RlOiB0aGlzIGlzIGEgdGhpbiB3cmFwcGVyIGFyb3VuZCBhIHA1IG1ldGhvZCBhbmQgZG9lc24ndCBoYW5kbGUgdW5yb3RhdGVkXHJcbiAqIHRleHQhIFRPRE86IEZpeCB0aGlzLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3g9Y3VycmVudCB4XSAtIEEgbmV3IHggY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpc1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbGwgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJtYW5lbnRseS4gXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeT1jdXJyZW50IHldIC0gQSBuZXcgeSBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbmVudGx5LlxyXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIC0gQW4gb2JqZWN0IHRoYXQgY2FuIGhhdmU6XHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gc2FtcGxlRmFjdG9yOiByYXRpbyBvZiBwYXRoLWxlbmd0aCB0byBudW1iZXJcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZiBzYW1wbGVzIChkZWZhdWx0PTAuMjUpLiBIaWdoZXIgdmFsdWVzIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIG1vcmVwb2ludHMgYW5kIGFyZSB0aGVyZWZvcmUgbW9yZSBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVjaXNlLiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBzaW1wbGlmeVRocmVzaG9sZDogaWYgc2V0IHRvIGEgbm9uLXplcm8gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsIGNvbGxpbmVhciBwb2ludHMgd2lsbCBiZSByZW1vdmVkLiBUaGVcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSByZXByZXNlbnRzIHRoZSB0aHJlc2hvbGQgYW5nbGUgdG8gdXNlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiBkZXRlcm1pbmluZyB3aGV0aGVyIHR3byBlZGdlcyBhcmUgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGluZWFyLlxyXG4gKiBAcmV0dXJuIHthcnJheX0gQW4gYXJyYXkgb2YgcG9pbnRzLCBlYWNoIHdpdGggeCwgeSAmIGFscGhhICh0aGUgcGF0aCBhbmdsZSlcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0VGV4dFBvaW50cyA9IGZ1bmN0aW9uKHgsIHksIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5fZm9udC50ZXh0VG9Qb2ludHModGhpcy5fdGV4dCwgdGhpcy5feCwgdGhpcy5feSwgXHJcbiAgICAgICAgdGhpcy5fZm9udFNpemUsIG9wdGlvbnMpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgcG9zID0gdGhpcy5fY2FsY3VsYXRlQWxpZ25lZENvb3Jkcyhwb2ludHNbaV0ueCwgcG9pbnRzW2ldLnkpO1xyXG4gICAgICAgIHBvaW50c1tpXS54ID0gcG9zLng7XHJcbiAgICAgICAgcG9pbnRzW2ldLnkgPSBwb3MueTtcclxuICAgIH1cclxuICAgIHJldHVybiBwb2ludHM7XHJcbn07XHJcblxyXG4vKipcclxuICogRHJhd3MgdGhlIHRleHQgcGFydGljbGUgd2l0aCB0aGUgc3BlY2lmaWVkIHN0eWxlIHBhcmFtZXRlcnMuIE5vdGU6IHRoaXMgaXNcclxuICogZ29pbmcgdG8gc2V0IHRoZSB0ZXh0Rm9udCwgdGV4dFNpemUgJiByb3RhdGlvbiBiZWZvcmUgZHJhd2luZy4gWW91IHNob3VsZCBzZXRcclxuICogdGhlIGNvbG9yL3N0cm9rZS9maWxsIHRoYXQgeW91IHdhbnQgYmVmb3JlIGRyYXdpbmcuIFRoaXMgZnVuY3Rpb24gd2lsbCBjbGVhblxyXG4gKiB1cCBhZnRlciBpdHNlbGYgYW5kIHJlc2V0IHN0eWxpbmcgYmFjayB0byB3aGF0IGl0IHdhcyBiZWZvcmUgaXQgd2FzIGNhbGxlZC5cclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW3g9Y3VycmVudCB4XSAtIEEgbmV3IHggY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpcyB3aWxsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIHBlcm1hbmVudGx5LiBcclxuICogQHBhcmFtIHtudW1iZXJ9IFt5PWN1cnJlbnQgeV0gLSBBIG5ldyB5IGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3IuIFRoaXMgd2lsbFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gcGVybWFuZW50bHkuXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2RyYXdCb3VuZHM9ZmFsc2VdIC0gRmxhZyBmb3IgZHJhd2luZyBib3VuZGluZyBib3hcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHgsIHksIGRyYXdCb3VuZHMpIHtcclxuICAgIGRyYXdCb3VuZHMgPSB1dGlscy5kZWZhdWx0KGRyYXdCb3VuZHMsIGZhbHNlKTtcclxuICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICB2YXIgcG9zID0ge1xyXG4gICAgICAgIHg6IHRoaXMuX3gsIFxyXG4gICAgICAgIHk6IHRoaXMuX3lcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fcC5wdXNoKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9yb3RhdGlvbikge1xyXG4gICAgICAgICAgICBwb3MgPSB0aGlzLl9jYWxjdWxhdGVSb3RhdGVkQ29vcmRzKHBvcy54LCBwb3MueSwgdGhpcy5fcm90YXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLl9wLnJvdGF0ZSh0aGlzLl9yb3RhdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHBvcy54LCBwb3MueSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3AudGV4dEFsaWduKHRoaXMuX3AuTEVGVCwgdGhpcy5fcC5CQVNFTElORSk7XHJcbiAgICAgICAgdGhpcy5fcC50ZXh0Rm9udCh0aGlzLl9mb250KTtcclxuICAgICAgICB0aGlzLl9wLnRleHRTaXplKHRoaXMuX2ZvbnRTaXplKTtcclxuICAgICAgICB0aGlzLl9wLnRleHQodGhpcy5fdGV4dCwgcG9zLngsIHBvcy55KTtcclxuXHJcbiAgICAgICAgaWYgKGRyYXdCb3VuZHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fcC5zdHJva2UoMjAwKTtcclxuICAgICAgICAgICAgdmFyIGJvdW5kc1ggPSBwb3MueCArIHRoaXMuX2JvdW5kc09mZnNldC54O1xyXG4gICAgICAgICAgICB2YXIgYm91bmRzWSA9IHBvcy55ICsgdGhpcy5fYm91bmRzT2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Aubm9GaWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3AucmVjdChib3VuZHNYLCBib3VuZHNZLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIHRoaXMuX3AucG9wKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogUHJvamVjdCB0aGUgY29vcmRpbmF0ZXMgKHgsIHkpIGludG8gYSByb3RhdGVkIGNvb3JkaW5hdGUgc3lzdGVtXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gWCBjb29yZGluYXRlIChpbiB1bnJvdGF0ZWQgc3BhY2UpXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gWSBjb29yZGluYXRlIChpbiB1bnJvdGF0ZWQgc3BhY2UpXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFJhZGlhbnMgb2Ygcm90YXRpb24gdG8gYXBwbHlcclxuICogQHJldHVybiB7b2JqZWN0fSBPYmplY3Qgd2l0aCB4ICYgeSBwcm9wZXJ0aWVzXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLl9jYWxjdWxhdGVSb3RhdGVkQ29vcmRzID0gZnVuY3Rpb24gKHgsIHksIGFuZ2xlKSB7ICBcclxuICAgIHZhciByeCA9IE1hdGguY29zKGFuZ2xlKSAqIHggKyBNYXRoLmNvcyhNYXRoLlBJIC8gMiAtIGFuZ2xlKSAqIHk7XHJcbiAgICB2YXIgcnkgPSAtTWF0aC5zaW4oYW5nbGUpICogeCArIE1hdGguc2luKE1hdGguUEkgLyAyIC0gYW5nbGUpICogeTtcclxuICAgIHJldHVybiB7eDogcngsIHk6IHJ5fTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIGRyYXcgY29vcmRpbmF0ZXMgZm9yIHRoZSB0ZXh0LCBhbGlnbmluZyBiYXNlZCBvbiB0aGUgYm91bmRpbmcgYm94LlxyXG4gKiBUaGUgdGV4dCBpcyBldmVudHVhbGx5IGRyYXduIHdpdGggY2FudmFzIGFsaWdubWVudCBzZXQgdG8gbGVmdCAmIGJhc2VsaW5lLCBzb1xyXG4gKiB0aGlzIGZ1bmN0aW9uIHRha2VzIGEgZGVzaXJlZCBwb3MgJiBhbGlnbm1lbnQgYW5kIHJldHVybnMgdGhlIGFwcHJvcHJpYXRlXHJcbiAqIGNvb3JkaW5hdGVzIGZvciB0aGUgbGVmdCAmIGJhc2VsaW5lLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0geCAtIFggY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0geSAtIFkgY29vcmRpbmF0ZVxyXG4gKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCB3aXRoIHggJiB5IHByb3BlcnRpZXNcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHMgPSBmdW5jdGlvbih4LCB5KSB7XHJcbiAgICB2YXIgbmV3WCwgbmV3WTtcclxuICAgIHN3aXRjaCAodGhpcy5faEFsaWduKSB7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQUxJR04uQk9YX0xFRlQ6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfQ0VOVEVSOlxyXG4gICAgICAgICAgICBuZXdYID0geCAtIHRoaXMuaGFsZldpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfUklHSFQ6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4IC0gdGhpcy53aWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgbmV3WCA9IHg7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5yZWNvZ25pemVkIGhvcml6b25hbCBhbGlnbjpcIiwgdGhpcy5faEFsaWduKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBzd2l0Y2ggKHRoaXMuX3ZBbGlnbikge1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9UT1A6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5IC0gdGhpcy5fYm91bmRzT2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVI6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5ICsgdGhpcy5fZGlzdEJhc2VUb01pZDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0JPVFRPTTpcclxuICAgICAgICAgICAgbmV3WSA9IHkgLSB0aGlzLl9kaXN0QmFzZVRvQm90dG9tO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5GT05UX0NFTlRFUjpcclxuICAgICAgICAgICAgLy8gSGVpZ2h0IGlzIGFwcHJveGltYXRlZCBhcyBhc2NlbnQgKyBkZXNjZW50XHJcbiAgICAgICAgICAgIG5ld1kgPSB5IC0gdGhpcy5fZGVzY2VudCArICh0aGlzLl9hc2NlbnQgKyB0aGlzLl9kZXNjZW50KSAvIDI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkFMUEhBQkVUSUM6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBuZXdZID0geTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbnJlY29nbml6ZWQgdmVydGljYWwgYWxpZ246XCIsIHRoaXMuX3ZBbGlnbik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHt4OiBuZXdYLCB5OiBuZXdZfTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyBib3VuZGluZyBib3ggYW5kIHZhcmlvdXMgbWV0cmljcyBmb3IgdGhlIGN1cnJlbnQgdGV4dCBhbmQgZm9udFxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5fY2FsY3VsYXRlTWV0cmljcyA9IGZ1bmN0aW9uKHNob3VsZFVwZGF0ZUhlaWdodCkgeyAgXHJcbiAgICAvLyBwNSAwLjUuMCBoYXMgYSBidWcgLSB0ZXh0IGJvdW5kcyBhcmUgY2xpcHBlZCBieSAoMCwgMClcclxuICAgIC8vIENhbGN1bGF0aW5nIGJvdW5kcyBoYWNrXHJcbiAgICB2YXIgYm91bmRzID0gdGhpcy5fZm9udC50ZXh0Qm91bmRzKHRoaXMuX3RleHQsIDEwMDAsIDEwMDAsIHRoaXMuX2ZvbnRTaXplKTtcclxuICAgIC8vIEJvdW5kcyBpcyBhIHJlZmVyZW5jZSAtIGlmIHdlIG1lc3Mgd2l0aCBpdCBkaXJlY3RseSwgd2UgY2FuIG1lc3MgdXAgXHJcbiAgICAvLyBmdXR1cmUgdmFsdWVzISAoSXQgY2hhbmdlcyB0aGUgYmJveCBjYWNoZSBpbiBwNS4pXHJcbiAgICBib3VuZHMgPSB7IFxyXG4gICAgICAgIHg6IGJvdW5kcy54IC0gMTAwMCwgXHJcbiAgICAgICAgeTogYm91bmRzLnkgLSAxMDAwLCBcclxuICAgICAgICB3OiBib3VuZHMudywgXHJcbiAgICAgICAgaDogYm91bmRzLmggXHJcbiAgICB9OyBcclxuXHJcbiAgICBpZiAoc2hvdWxkVXBkYXRlSGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5fYXNjZW50ID0gdGhpcy5fZm9udC5fdGV4dEFzY2VudCh0aGlzLl9mb250U2l6ZSk7XHJcbiAgICAgICAgdGhpcy5fZGVzY2VudCA9IHRoaXMuX2ZvbnQuX3RleHREZXNjZW50KHRoaXMuX2ZvbnRTaXplKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2UgYm91bmRzIHRvIGNhbGN1bGF0ZSBmb250IG1ldHJpY3NcclxuICAgIHRoaXMud2lkdGggPSBib3VuZHMudztcclxuICAgIHRoaXMuaGVpZ2h0ID0gYm91bmRzLmg7XHJcbiAgICB0aGlzLmhhbGZXaWR0aCA9IHRoaXMud2lkdGggLyAyO1xyXG4gICAgdGhpcy5oYWxmSGVpZ2h0ID0gdGhpcy5oZWlnaHQgLyAyO1xyXG4gICAgdGhpcy5fYm91bmRzT2Zmc2V0ID0geyB4OiBib3VuZHMueCwgeTogYm91bmRzLnkgfTtcclxuICAgIHRoaXMuX2Rpc3RCYXNlVG9NaWQgPSBNYXRoLmFicyhib3VuZHMueSkgLSB0aGlzLmhhbGZIZWlnaHQ7XHJcbiAgICB0aGlzLl9kaXN0QmFzZVRvQm90dG9tID0gdGhpcy5oZWlnaHQgLSBNYXRoLmFicyhib3VuZHMueSk7XHJcbn07IiwiZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24odmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgcmV0dXJuICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSA/IHZhbHVlIDogZGVmYXVsdFZhbHVlO1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gSG92ZXJTbGlkZXNob3dzO1xyXG5cclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEhvdmVyU2xpZGVzaG93cyhzbGlkZXNob3dEZWxheSwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgdGhpcy5fc2xpZGVzaG93RGVsYXkgPSBzbGlkZXNob3dEZWxheSAhPT0gdW5kZWZpbmVkID8gc2xpZGVzaG93RGVsYXkgOiAyMDAwO1xyXG4gIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkID8gdHJhbnNpdGlvbkR1cmF0aW9uIDogMTAwMDtcclxuXHJcbiAgdGhpcy5fc2xpZGVzaG93cyA9IFtdO1xyXG4gIHRoaXMucmVsb2FkKCk7XHJcbn1cclxuXHJcbkhvdmVyU2xpZGVzaG93cy5wcm90b3R5cGUucmVsb2FkID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gTm90ZTogdGhpcyBpcyBjdXJyZW50bHkgbm90IHJlYWxseSBiZWluZyB1c2VkLiBXaGVuIGEgcGFnZSBpcyBsb2FkZWQsXHJcbiAgLy8gbWFpbi5qcyBpcyBqdXN0IHJlLWluc3RhbmNpbmcgdGhlIEhvdmVyU2xpZGVzaG93c1xyXG4gIHZhciBvbGRTbGlkZXNob3dzID0gdGhpcy5fc2xpZGVzaG93cyB8fCBbXTtcclxuICB0aGlzLl9zbGlkZXNob3dzID0gW107XHJcbiAgJChcIi5ob3Zlci1zbGlkZXNob3dcIikuZWFjaChcclxuICAgIGZ1bmN0aW9uKF8sIGVsZW1lbnQpIHtcclxuICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcclxuICAgICAgdmFyIGluZGV4ID0gdGhpcy5fZmluZEluU2xpZGVzaG93cyhlbGVtZW50LCBvbGRTbGlkZXNob3dzKTtcclxuICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgIHZhciBzbGlkZXNob3cgPSBvbGRTbGlkZXNob3dzLnNwbGljZShpbmRleCwgMSlbMF07XHJcbiAgICAgICAgdGhpcy5fc2xpZGVzaG93cy5wdXNoKHNsaWRlc2hvdyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5fc2xpZGVzaG93cy5wdXNoKFxyXG4gICAgICAgICAgbmV3IFNsaWRlc2hvdygkZWxlbWVudCwgdGhpcy5fc2xpZGVzaG93RGVsYXksIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbilcclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9LmJpbmQodGhpcylcclxuICApO1xyXG59O1xyXG5cclxuSG92ZXJTbGlkZXNob3dzLnByb3RvdHlwZS5fZmluZEluU2xpZGVzaG93cyA9IGZ1bmN0aW9uKGVsZW1lbnQsIHNsaWRlc2hvd3MpIHtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlc2hvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIGlmIChlbGVtZW50ID09PSBzbGlkZXNob3dzW2ldLmdldEVsZW1lbnQoKSkge1xyXG4gICAgICByZXR1cm4gaTtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIC0xO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gU2xpZGVzaG93KCRjb250YWluZXIsIHNsaWRlc2hvd0RlbGF5LCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICB0aGlzLl9zbGlkZXNob3dEZWxheSA9IHNsaWRlc2hvd0RlbGF5O1xyXG4gIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbjtcclxuICB0aGlzLl90aW1lb3V0SWQgPSBudWxsO1xyXG4gIHRoaXMuX2ltYWdlSW5kZXggPSAwO1xyXG4gIHRoaXMuXyRpbWFnZXMgPSBbXTtcclxuXHJcbiAgLy8gU2V0IHVwIGFuZCBjYWNoZSByZWZlcmVuY2VzIHRvIGltYWdlc1xyXG4gIHRoaXMuXyRjb250YWluZXIuZmluZChcImltZ1wiKS5lYWNoKFxyXG4gICAgZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgdmFyICRpbWFnZSA9ICQoZWxlbWVudCk7XHJcbiAgICAgICRpbWFnZS5jc3Moe1xyXG4gICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgdG9wOiBcIjBcIixcclxuICAgICAgICBsZWZ0OiBcIjBcIixcclxuICAgICAgICB6SW5kZXg6IGluZGV4ID09PSAwID8gMiA6IDAgLy8gRmlyc3QgaW1hZ2Ugc2hvdWxkIGJlIG9uIHRvcFxyXG4gICAgICB9KTtcclxuICAgICAgdGhpcy5fJGltYWdlcy5wdXNoKCRpbWFnZSk7XHJcbiAgICB9LmJpbmQodGhpcylcclxuICApO1xyXG5cclxuICAvLyBEZXRlcm1pbmUgd2hldGhlciB0byBiaW5kIGludGVyYWN0aXZpdHlcclxuICB0aGlzLl9udW1JbWFnZXMgPSB0aGlzLl8kaW1hZ2VzLmxlbmd0aDtcclxuICBpZiAodGhpcy5fbnVtSW1hZ2VzIDw9IDEpIHJldHVybjtcclxuXHJcbiAgLy8gQmluZCBldmVudCBsaXN0ZW5lcnNcclxuICB0aGlzLl8kY29udGFpbmVyLm9uKFwibW91c2VlbnRlclwiLCB0aGlzLl9vbkVudGVyLmJpbmQodGhpcykpO1xyXG4gIHRoaXMuXyRjb250YWluZXIub24oXCJtb3VzZWxlYXZlXCIsIHRoaXMuX29uTGVhdmUuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuZ2V0RWxlbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLl8kY29udGFpbmVyLmdldCgwKTtcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuZ2V0JEVsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5fJGNvbnRhaW5lcjtcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX29uRW50ZXIgPSBmdW5jdGlvbigpIHtcclxuICAvLyBGaXJzdCB0cmFuc2l0aW9uIHNob3VsZCBoYXBwZW4gcHJldHR5IHNvb24gYWZ0ZXIgaG92ZXJpbmcgaW4gb3JkZXJcclxuICAvLyB0byBjbHVlIHRoZSB1c2VyIGludG8gd2hhdCBpcyBoYXBwZW5pbmdcclxuICB0aGlzLl90aW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2FkdmFuY2VTbGlkZXNob3cuYmluZCh0aGlzKSwgNTAwKTtcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX29uTGVhdmUgPSBmdW5jdGlvbigpIHtcclxuICBjbGVhckludGVydmFsKHRoaXMuX3RpbWVvdXRJZCk7XHJcbiAgdGhpcy5fdGltZW91dElkID0gbnVsbDtcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX2FkdmFuY2VTbGlkZXNob3cgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl9pbWFnZUluZGV4ICs9IDE7XHJcbiAgdmFyIGk7XHJcblxyXG4gIC8vIE1vdmUgdGhlIGltYWdlIGZyb20gMiBzdGVwcyBhZ28gZG93biB0byB0aGUgYm90dG9tIHotaW5kZXggYW5kIG1ha2VcclxuICAvLyBpdCBpbnZpc2libGVcclxuICBpZiAodGhpcy5fbnVtSW1hZ2VzID49IDMpIHtcclxuICAgIGkgPSB1dGlsaXRpZXMud3JhcEluZGV4KHRoaXMuX2ltYWdlSW5kZXggLSAyLCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gICAgdGhpcy5fJGltYWdlc1tpXS5jc3Moe1xyXG4gICAgICB6SW5kZXg6IDAsXHJcbiAgICAgIG9wYWNpdHk6IDBcclxuICAgIH0pO1xyXG4gICAgdGhpcy5fJGltYWdlc1tpXS52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgfVxyXG5cclxuICAvLyBNb3ZlIHRoZSBpbWFnZSBmcm9tIDEgc3RlcHMgYWdvIGRvd24gdG8gdGhlIG1pZGRsZSB6LWluZGV4IGFuZCBtYWtlXHJcbiAgLy8gaXQgY29tcGxldGVseSB2aXNpYmxlXHJcbiAgaWYgKHRoaXMuX251bUltYWdlcyA+PSAyKSB7XHJcbiAgICBpID0gdXRpbGl0aWVzLndyYXBJbmRleCh0aGlzLl9pbWFnZUluZGV4IC0gMSwgdGhpcy5fbnVtSW1hZ2VzKTtcclxuICAgIHRoaXMuXyRpbWFnZXNbaV0uY3NzKHtcclxuICAgICAgekluZGV4OiAxLFxyXG4gICAgICBvcGFjaXR5OiAxXHJcbiAgICB9KTtcclxuICAgIHRoaXMuXyRpbWFnZXNbaV0udmVsb2NpdHkoXCJzdG9wXCIpO1xyXG4gIH1cclxuXHJcbiAgLy8gTW92ZSB0aGUgY3VycmVudCBpbWFnZSB0byB0aGUgdG9wIHotaW5kZXggYW5kIGZhZGUgaXQgaW5cclxuICB0aGlzLl9pbWFnZUluZGV4ID0gdXRpbGl0aWVzLndyYXBJbmRleCh0aGlzLl9pbWFnZUluZGV4LCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gIHRoaXMuXyRpbWFnZXNbdGhpcy5faW1hZ2VJbmRleF0uY3NzKHtcclxuICAgIHpJbmRleDogMixcclxuICAgIG9wYWNpdHk6IDBcclxuICB9KTtcclxuICB0aGlzLl8kaW1hZ2VzW3RoaXMuX2ltYWdlSW5kZXhdLnZlbG9jaXR5KFxyXG4gICAge1xyXG4gICAgICBvcGFjaXR5OiAxXHJcbiAgICB9LFxyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uLFxyXG4gICAgXCJlYXNlSW5PdXRRdWFkXCJcclxuICApO1xyXG5cclxuICAvLyBTY2hlZHVsZSBuZXh0IHRyYW5zaXRpb25cclxuICB0aGlzLl90aW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2FkdmFuY2VTbGlkZXNob3cuYmluZCh0aGlzKSwgdGhpcy5fc2xpZGVzaG93RGVsYXkpO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IEJhc2VMb2dvU2tldGNoO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEJhc2VMb2dvU2tldGNoKCRuYXYsICRuYXZMb2dvLCBmb250UGF0aCkge1xyXG4gIHRoaXMuXyRuYXYgPSAkbmF2O1xyXG4gIHRoaXMuXyRuYXZMb2dvID0gJG5hdkxvZ287XHJcbiAgdGhpcy5fZm9udFBhdGggPSBmb250UGF0aDtcclxuXHJcbiAgdGhpcy5fdGV4dCA9IHRoaXMuXyRuYXZMb2dvLnRleHQoKTtcclxuICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSB0cnVlO1xyXG4gIHRoaXMuX2lzTW91c2VPdmVyID0gZmFsc2U7XHJcbiAgdGhpcy5faXNPdmVyTmF2TG9nbyA9IGZhbHNlO1xyXG5cclxuICB0aGlzLl91cGRhdGVUZXh0T2Zmc2V0KCk7XHJcbiAgdGhpcy5fdXBkYXRlU2l6ZSgpO1xyXG4gIHRoaXMuX3VwZGF0ZUZvbnRTaXplKCk7XHJcblxyXG4gIC8vIENyZWF0ZSBhIChyZWxhdGl2ZSBwb3NpdGlvbmVkKSBjb250YWluZXIgZm9yIHRoZSBza2V0Y2ggaW5zaWRlIG9mIHRoZVxyXG4gIC8vIG5hdiwgYnV0IG1ha2Ugc3VyZSB0aGF0IGl0IGlzIEJFSElORCBldmVyeXRoaW5nIGVsc2UuIEV2ZW50dWFsbHksIHdlIHdpbGxcclxuICAvLyBkcm9wIGp1c3QgdGhlIG5hdiBsb2dvIChub3QgdGhlIG5hdiBsaW5rcyEpIGJlaGluZCB0aGUgY2FudmFzLlxyXG4gIHRoaXMuXyRjb250YWluZXIgPSAkKFwiPGRpdj5cIilcclxuICAgIC5jc3Moe1xyXG4gICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICB0b3A6IFwiMHB4XCIsXHJcbiAgICAgIGxlZnQ6IFwiMHB4XCJcclxuICAgIH0pXHJcbiAgICAucHJlcGVuZFRvKHRoaXMuXyRuYXYpXHJcbiAgICAuaGlkZSgpO1xyXG5cclxuICB0aGlzLl9jcmVhdGVQNUluc3RhbmNlKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBuZXcgcDUgaW5zdGFuY2UgYW5kIGJpbmQgdGhlIGFwcHJvcHJpYXRlIGNsYXNzIG1ldGhvZHMgdG8gdGhlXHJcbiAqIGluc3RhbmNlLiBUaGlzIGFsc28gZmlsbHMgaW4gdGhlIHAgcGFyYW1ldGVyIG9uIHRoZSBjbGFzcyBtZXRob2RzIChzZXR1cCxcclxuICogZHJhdywgZXRjLikgc28gdGhhdCB0aG9zZSBmdW5jdGlvbnMgY2FuIGJlIGEgbGl0dGxlIGxlc3MgdmVyYm9zZSA6KVxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9jcmVhdGVQNUluc3RhbmNlID0gZnVuY3Rpb24oKSB7XHJcbiAgbmV3IHA1KFxyXG4gICAgZnVuY3Rpb24ocCkge1xyXG4gICAgICB0aGlzLl9wID0gcDtcclxuICAgICAgcC5wcmVsb2FkID0gdGhpcy5fcHJlbG9hZC5iaW5kKHRoaXMsIHApO1xyXG4gICAgICBwLnNldHVwID0gdGhpcy5fc2V0dXAuYmluZCh0aGlzLCBwKTtcclxuICAgICAgcC5kcmF3ID0gdGhpcy5fZHJhdy5iaW5kKHRoaXMsIHApO1xyXG4gICAgfS5iaW5kKHRoaXMpLFxyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5nZXQoMClcclxuICApO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZpbmQgdGhlIGRpc3RhbmNlIGZyb20gdGhlIHRvcCBsZWZ0IG9mIHRoZSBuYXYgdG8gdGhlIGJyYW5kIGxvZ28ncyBiYXNlbGluZS5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fdXBkYXRlVGV4dE9mZnNldCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBiYXNlbGluZURpdiA9ICQoXCI8ZGl2PlwiKVxyXG4gICAgLmNzcyh7XHJcbiAgICAgIGRpc3BsYXk6IFwiaW5saW5lLWJsb2NrXCIsXHJcbiAgICAgIHZlcnRpY2FsQWxpZ246IFwiYmFzZWxpbmVcIlxyXG4gICAgfSlcclxuICAgIC5wcmVwZW5kVG8odGhpcy5fJG5hdkxvZ28pO1xyXG4gIHZhciBuYXZPZmZzZXQgPSB0aGlzLl8kbmF2Lm9mZnNldCgpO1xyXG4gIHZhciBsb2dvQmFzZWxpbmVPZmZzZXQgPSBiYXNlbGluZURpdi5vZmZzZXQoKTtcclxuICB0aGlzLl90ZXh0T2Zmc2V0ID0ge1xyXG4gICAgdG9wOiBsb2dvQmFzZWxpbmVPZmZzZXQudG9wIC0gbmF2T2Zmc2V0LnRvcCxcclxuICAgIGxlZnQ6IGxvZ29CYXNlbGluZU9mZnNldC5sZWZ0IC0gbmF2T2Zmc2V0LmxlZnRcclxuICB9O1xyXG4gIGJhc2VsaW5lRGl2LnJlbW92ZSgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZpbmQgdGhlIGJvdW5kaW5nIGJveCBvZiB0aGUgYnJhbmQgbG9nbyBpbiB0aGUgbmF2LiBUaGlzIGJib3ggY2FuIHRoZW4gYmVcclxuICogdXNlZCB0byBjb250cm9sIHdoZW4gdGhlIGN1cnNvciBzaG91bGQgYmUgYSBwb2ludGVyLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9jYWxjdWxhdGVOYXZMb2dvQm91bmRzID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG5hdk9mZnNldCA9IHRoaXMuXyRuYXYub2Zmc2V0KCk7XHJcbiAgdmFyIGxvZ29PZmZzZXQgPSB0aGlzLl8kbmF2TG9nby5vZmZzZXQoKTtcclxuICB0aGlzLl9sb2dvQmJveCA9IHtcclxuICAgIHk6IGxvZ29PZmZzZXQudG9wIC0gbmF2T2Zmc2V0LnRvcCxcclxuICAgIHg6IGxvZ29PZmZzZXQubGVmdCAtIG5hdk9mZnNldC5sZWZ0LFxyXG4gICAgdzogdGhpcy5fJG5hdkxvZ28ub3V0ZXJXaWR0aCgpLCAvLyBFeGNsdWRlIG1hcmdpbiBmcm9tIHRoZSBiYm94XHJcbiAgICBoOiB0aGlzLl8kbmF2TG9nby5vdXRlckhlaWdodCgpIC8vIExpbmtzIGFyZW4ndCBjbGlja2FibGUgb24gbWFyZ2luXHJcbiAgfTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIGRpbWVuc2lvbnMgdG8gbWF0Y2ggdGhlIG5hdiAtIGV4Y2x1ZGluZyBhbnkgbWFyZ2luLCBwYWRkaW5nICZcclxuICogYm9yZGVyLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl91cGRhdGVTaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5fd2lkdGggPSB0aGlzLl8kbmF2LmlubmVyV2lkdGgoKTtcclxuICB0aGlzLl9oZWlnaHQgPSB0aGlzLl8kbmF2LmlubmVySGVpZ2h0KCk7XHJcbn07XHJcblxyXG4vKipcclxuICogR3JhYiB0aGUgZm9udCBzaXplIGZyb20gdGhlIGJyYW5kIGxvZ28gbGluay4gVGhpcyBtYWtlcyB0aGUgZm9udCBzaXplIG9mIHRoZVxyXG4gKiBza2V0Y2ggcmVzcG9uc2l2ZS5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fdXBkYXRlRm9udFNpemUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl9mb250U2l6ZSA9IHRoaXMuXyRuYXZMb2dvLmNzcyhcImZvbnRTaXplXCIpLnJlcGxhY2UoXCJweFwiLCBcIlwiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBXaGVuIHRoZSBicm93c2VyIGlzIHJlc2l6ZWQsIHJlY2FsY3VsYXRlIGFsbCB0aGUgbmVjZXNzYXJ5IHN0YXRzIHNvIHRoYXQgdGhlXHJcbiAqIHNrZXRjaCBjYW4gYmUgcmVzcG9uc2l2ZS4gVGhlIGxvZ28gaW4gdGhlIHNrZXRjaCBzaG91bGQgQUxXQVlTIGV4YWN0bHkgbWF0Y2hcclxuICogdGhlIGJyYW5nIGxvZ28gbGluayB0aGUgSFRNTC5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbihwKSB7XHJcbiAgdGhpcy5fdXBkYXRlU2l6ZSgpO1xyXG4gIHRoaXMuX3VwZGF0ZUZvbnRTaXplKCk7XHJcbiAgdGhpcy5fdXBkYXRlVGV4dE9mZnNldCgpO1xyXG4gIHRoaXMuX2NhbGN1bGF0ZU5hdkxvZ29Cb3VuZHMoKTtcclxuICBwLnJlc2l6ZUNhbnZhcyh0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIF9pc01vdXNlT3ZlciBwcm9wZXJ0eS5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fc2V0TW91c2VPdmVyID0gZnVuY3Rpb24oaXNNb3VzZU92ZXIpIHtcclxuICB0aGlzLl9pc01vdXNlT3ZlciA9IGlzTW91c2VPdmVyO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIElmIHRoZSBjdXJzb3IgaXMgc2V0IHRvIGEgcG9pbnRlciwgZm9yd2FyZCBhbnkgY2xpY2sgZXZlbnRzIHRvIHRoZSBuYXYgbG9nby5cclxuICogVGhpcyByZWR1Y2VzIHRoZSBuZWVkIGZvciB0aGUgY2FudmFzIHRvIGRvIGFueSBBSkFYLXkgc3R1ZmYuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX29uQ2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgaWYgKHRoaXMuX2lzT3Zlck5hdkxvZ28pIHRoaXMuXyRuYXZMb2dvLnRyaWdnZXIoZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQmFzZSBwcmVsb2FkIG1ldGhvZCB0aGF0IGp1c3QgbG9hZHMgdGhlIG5lY2Vzc2FyeSBmb250XHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3ByZWxvYWQgPSBmdW5jdGlvbihwKSB7XHJcbiAgdGhpcy5fZm9udCA9IHAubG9hZEZvbnQodGhpcy5fZm9udFBhdGgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2Ugc2V0dXAgbWV0aG9kIHRoYXQgZG9lcyBzb21lIGhlYXZ5IGxpZnRpbmcuIEl0IGhpZGVzIHRoZSBuYXYgYnJhbmQgbG9nb1xyXG4gKiBhbmQgcmV2ZWFscyB0aGUgY2FudmFzLiBJdCBhbHNvIHNldHMgdXAgYSBsb3Qgb2YgdGhlIGludGVybmFsIHZhcmlhYmxlcyBhbmRcclxuICogY2FudmFzIGV2ZW50cy5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fc2V0dXAgPSBmdW5jdGlvbihwKSB7XHJcbiAgdmFyIHJlbmRlcmVyID0gcC5jcmVhdGVDYW52YXModGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7XHJcbiAgdGhpcy5fJGNhbnZhcyA9ICQocmVuZGVyZXIuY2FudmFzKTtcclxuXHJcbiAgLy8gU2hvdyB0aGUgY2FudmFzIGFuZCBoaWRlIHRoZSBsb2dvLiBVc2luZyBzaG93L2hpZGUgb24gdGhlIGxvZ28gd2lsbCBjYXVzZVxyXG4gIC8vIGpRdWVyeSB0byBtdWNrIHdpdGggdGhlIHBvc2l0aW9uaW5nLCB3aGljaCBpcyB1c2VkIHRvIGNhbGN1bGF0ZSB3aGVyZSB0b1xyXG4gIC8vIGRyYXcgdGhlIGNhbnZhcyB0ZXh0LiBJbnN0ZWFkLCBqdXN0IHB1c2ggdGhlIGxvZ28gYmVoaW5kIHRoZSBjYW52YXMuIFRoaXNcclxuICAvLyBhbGxvd3MgbWFrZXMgaXQgc28gdGhlIGNhbnZhcyBpcyBzdGlsbCBiZWhpbmQgdGhlIG5hdiBsaW5rcy5cclxuICB0aGlzLl8kY29udGFpbmVyLnNob3coKTtcclxuICB0aGlzLl8kbmF2TG9nby5jc3MoXCJ6SW5kZXhcIiwgLTEpO1xyXG5cclxuICAvLyBUaGVyZSBpc24ndCBhIGdvb2Qgd2F5IHRvIGNoZWNrIHdoZXRoZXIgdGhlIHNrZXRjaCBoYXMgdGhlIG1vdXNlIG92ZXJcclxuICAvLyBpdC4gcC5tb3VzZVggJiBwLm1vdXNlWSBhcmUgaW5pdGlhbGl6ZWQgdG8gKDAsIDApLCBhbmQgcC5mb2N1c2VkIGlzbid0XHJcbiAgLy8gYWx3YXlzIHJlbGlhYmxlLlxyXG4gIHRoaXMuXyRjYW52YXMub24oXCJtb3VzZW92ZXJcIiwgdGhpcy5fc2V0TW91c2VPdmVyLmJpbmQodGhpcywgdHJ1ZSkpO1xyXG4gIHRoaXMuXyRjYW52YXMub24oXCJtb3VzZW91dFwiLCB0aGlzLl9zZXRNb3VzZU92ZXIuYmluZCh0aGlzLCBmYWxzZSkpO1xyXG5cclxuICAvLyBGb3J3YXJkIG1vdXNlIGNsaWNrcyB0byB0aGUgbmF2IGxvZ29cclxuICB0aGlzLl8kY2FudmFzLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgLy8gV2hlbiB0aGUgd2luZG93IGlzIHJlc2l6ZWQsIHRleHQgJiBjYW52YXMgc2l6aW5nIGFuZCBwbGFjZW1lbnQgbmVlZCB0byBiZVxyXG4gIC8vIHJlY2FsY3VsYXRlZC4gVGhlIHNpdGUgaXMgcmVzcG9uc2l2ZSwgc28gdGhlIGludGVyYWN0aXZlIGNhbnZhcyBzaG91bGQgYmVcclxuICAvLyB0b28hXHJcbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcywgcCkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgZHJhdyBtZXRob2QgdGhhdCBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgY3Vyc29yIGlzIGEgcG9pbnRlci4gSXRcclxuICogc2hvdWxkIG9ubHkgYmUgYSBwb2ludGVyIHdoZW4gdGhlIG1vdXNlIGlzIG92ZXIgdGhlIG5hdiBicmFuZCBsb2dvLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24ocCkge1xyXG4gIGlmICh0aGlzLl9pc01vdXNlT3Zlcikge1xyXG4gICAgdmFyIGlzT3ZlckxvZ28gPSB1dGlscy5pc0luUmVjdChwLm1vdXNlWCwgcC5tb3VzZVksIHRoaXMuX2xvZ29CYm94KTtcclxuICAgIGlmICghdGhpcy5faXNPdmVyTmF2TG9nbyAmJiBpc092ZXJMb2dvKSB7XHJcbiAgICAgIHRoaXMuX2lzT3Zlck5hdkxvZ28gPSB0cnVlO1xyXG4gICAgICB0aGlzLl8kY2FudmFzLmNzcyhcImN1cnNvclwiLCBcInBvaW50ZXJcIik7XHJcbiAgICB9IGVsc2UgaWYgKHRoaXMuX2lzT3Zlck5hdkxvZ28gJiYgIWlzT3ZlckxvZ28pIHtcclxuICAgICAgdGhpcy5faXNPdmVyTmF2TG9nbyA9IGZhbHNlO1xyXG4gICAgICB0aGlzLl8kY2FudmFzLmNzcyhcImN1cnNvclwiLCBcImluaXRpYWxcIik7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFNrZXRjaDtcclxuXHJcbnZhciBCYm94VGV4dCA9IHJlcXVpcmUoXCJwNS1iYm94LWFsaWduZWQtdGV4dFwiKTtcclxudmFyIEJhc2VMb2dvU2tldGNoID0gcmVxdWlyZShcIi4vYmFzZS1sb2dvLXNrZXRjaC5qc1wiKTtcclxudmFyIFNpbkdlbmVyYXRvciA9IHJlcXVpcmUoXCIuL2dlbmVyYXRvcnMvc2luLWdlbmVyYXRvci5qc1wiKTtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUpO1xyXG5cclxuZnVuY3Rpb24gU2tldGNoKCRuYXYsICRuYXZMb2dvKSB7XHJcbiAgQmFzZUxvZ29Ta2V0Y2guY2FsbCh0aGlzLCAkbmF2LCAkbmF2TG9nbywgXCIuLi9mb250cy9iaWdfam9obi13ZWJmb250LnR0ZlwiKTtcclxufVxyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbihwKSB7XHJcbiAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZS5jYWxsKHRoaXMsIHApO1xyXG4gIHRoaXMuX3NwYWNpbmcgPSB1dGlscy5tYXAodGhpcy5fZm9udFNpemUsIDIwLCA0MCwgMiwgNSwge1xyXG4gICAgY2xhbXA6IHRydWUsXHJcbiAgICByb3VuZDogdHJ1ZVxyXG4gIH0pO1xyXG4gIC8vIFVwZGF0ZSB0aGUgYmJveFRleHQsIHBsYWNlIG92ZXIgdGhlIG5hdiB0ZXh0IGxvZ28gYW5kIHRoZW4gc2hpZnQgaXRzXHJcbiAgLy8gYW5jaG9yIGJhY2sgdG8gKGNlbnRlciwgY2VudGVyKSB3aGlsZSBwcmVzZXJ2aW5nIHRoZSB0ZXh0IHBvc2l0aW9uXHJcbiAgdGhpcy5fYmJveFRleHRcclxuICAgIC5zZXRUZXh0KHRoaXMuX3RleHQpXHJcbiAgICAuc2V0VGV4dFNpemUodGhpcy5fZm9udFNpemUpXHJcbiAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9MRUZULCBCYm94VGV4dC5CQVNFTElORS5BTFBIQUJFVElDKVxyXG4gICAgLnNldFBvc2l0aW9uKHRoaXMuX3RleHRPZmZzZXQubGVmdCwgdGhpcy5fdGV4dE9mZnNldC50b3ApXHJcbiAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9DRU5URVIsIEJib3hUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVIsIHRydWUpO1xyXG4gIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuICB0aGlzLl9wb2ludHMgPSB0aGlzLl9iYm94VGV4dC5nZXRUZXh0UG9pbnRzKCk7XHJcbiAgdGhpcy5faXNGaXJzdEZyYW1lID0gdHJ1ZTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXdTdGF0aW9uYXJ5TG9nbyA9IGZ1bmN0aW9uKHApIHtcclxuICBwLmJhY2tncm91bmQoMjU1KTtcclxuICBwLnN0cm9rZSgyNTUpO1xyXG4gIHAuZmlsbChcIiMwQTAwMEFcIik7XHJcbiAgcC5zdHJva2VXZWlnaHQoMik7XHJcbiAgdGhpcy5fYmJveFRleHQuZHJhdygpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fc2V0dXAgPSBmdW5jdGlvbihwKSB7XHJcbiAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cC5jYWxsKHRoaXMsIHApO1xyXG5cclxuICAvLyBDcmVhdGUgYSBCYm94QWxpZ25lZFRleHQgaW5zdGFuY2UgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIGRyYXdpbmcgYW5kXHJcbiAgLy8gcm90YXRpbmcgdGV4dFxyXG4gIHRoaXMuX2Jib3hUZXh0ID0gbmV3IEJib3hUZXh0KHRoaXMuX2ZvbnQsIHRoaXMuX3RleHQsIHRoaXMuX2ZvbnRTaXplLCAwLCAwLCBwKTtcclxuXHJcbiAgLy8gSGFuZGxlIHRoZSBpbml0aWFsIHNldHVwIGJ5IHRyaWdnZXJpbmcgYSByZXNpemVcclxuICB0aGlzLl9vblJlc2l6ZShwKTtcclxuXHJcbiAgLy8gRHJhdyB0aGUgc3RhdGlvbmFyeSBsb2dvXHJcbiAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG5cclxuICAvLyBTdGFydCB0aGUgc2luIGdlbmVyYXRvciBhdCBpdHMgbWF4IHZhbHVlXHJcbiAgdGhpcy5fdGhyZXNob2xkR2VuZXJhdG9yID0gbmV3IFNpbkdlbmVyYXRvcihwLCAwLCAxLCAwLjAyLCBwLlBJIC8gMik7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24ocCkge1xyXG4gIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fZHJhdy5jYWxsKHRoaXMsIHApO1xyXG4gIGlmICghdGhpcy5faXNNb3VzZU92ZXIgfHwgIXRoaXMuX2lzT3Zlck5hdkxvZ28pIHJldHVybjtcclxuXHJcbiAgLy8gV2hlbiB0aGUgdGV4dCBpcyBhYm91dCB0byBiZWNvbWUgYWN0aXZlIGZvciB0aGUgZmlyc3QgdGltZSwgY2xlYXJcclxuICAvLyB0aGUgc3RhdGlvbmFyeSBsb2dvIHRoYXQgd2FzIHByZXZpb3VzbHkgZHJhd24uXHJcbiAgaWYgKHRoaXMuX2lzRmlyc3RGcmFtZSkge1xyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIGlmICh0aGlzLl9mb250U2l6ZSA+IDMwKSB7XHJcbiAgICB0aGlzLl90aHJlc2hvbGRHZW5lcmF0b3Iuc2V0Qm91bmRzKDAuMiAqIHRoaXMuX2Jib3hUZXh0LmhlaWdodCwgMC40NyAqIHRoaXMuX2Jib3hUZXh0LmhlaWdodCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIHRoaXMuX3RocmVzaG9sZEdlbmVyYXRvci5zZXRCb3VuZHMoMC4yICogdGhpcy5fYmJveFRleHQuaGVpZ2h0LCAwLjYgKiB0aGlzLl9iYm94VGV4dC5oZWlnaHQpO1xyXG4gIH1cclxuICB2YXIgZGlzdGFuY2VUaHJlc2hvbGQgPSB0aGlzLl90aHJlc2hvbGRHZW5lcmF0b3IuZ2VuZXJhdGUoKTtcclxuXHJcbiAgcC5iYWNrZ3JvdW5kKDI1NSwgMTAwKTtcclxuICBwLnN0cm9rZVdlaWdodCgxKTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3BvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgdmFyIHBvaW50MSA9IHRoaXMuX3BvaW50c1tpXTtcclxuICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IHRoaXMuX3BvaW50cy5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICB2YXIgcG9pbnQyID0gdGhpcy5fcG9pbnRzW2pdO1xyXG4gICAgICB2YXIgZGlzdCA9IHAuZGlzdChwb2ludDEueCwgcG9pbnQxLnksIHBvaW50Mi54LCBwb2ludDIueSk7XHJcbiAgICAgIGlmIChkaXN0IDwgZGlzdGFuY2VUaHJlc2hvbGQpIHtcclxuICAgICAgICBwLm5vU3Ryb2tlKCk7XHJcbiAgICAgICAgcC5maWxsKFwicmdiYSgxNjUsIDAsIDE3MywgMC4yNSlcIik7XHJcbiAgICAgICAgcC5lbGxpcHNlKChwb2ludDEueCArIHBvaW50Mi54KSAvIDIsIChwb2ludDEueSArIHBvaW50Mi55KSAvIDIsIGRpc3QsIGRpc3QpO1xyXG5cclxuICAgICAgICBwLnN0cm9rZShcInJnYmEoMTY1LCAwLCAxNzMsIDAuMjUpXCIpO1xyXG4gICAgICAgIHAubm9GaWxsKCk7XHJcbiAgICAgICAgcC5saW5lKHBvaW50MS54LCBwb2ludDEueSwgcG9pbnQyLngsIHBvaW50Mi55KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgTm9pc2VHZW5lcmF0b3IxRDogTm9pc2VHZW5lcmF0b3IxRCxcclxuICBOb2lzZUdlbmVyYXRvcjJEOiBOb2lzZUdlbmVyYXRvcjJEXHJcbn07XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuLy8gLS0gMUQgTm9pc2UgR2VuZXJhdG9yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBBIHV0aWxpdHkgY2xhc3MgZm9yIGdlbmVyYXRpbmcgbm9pc2UgdmFsdWVzXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge29iamVjdH0gcCAgICAgICAgICAgICAgIFJlZmVyZW5jZSB0byBhIHA1IHNrZXRjaFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW21pbj0wXSAgICAgICAgIE1pbmltdW0gdmFsdWUgZm9yIHRoZSBub2lzZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW21heD0xXSAgICAgICAgIE1heGltdW0gdmFsdWUgZm9yIHRoZSBub2lzZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW2luY3JlbWVudD0wLjFdIFNjYWxlIG9mIHRoZSBub2lzZSwgdXNlZCB3aGVuIHVwZGF0aW5nXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb2Zmc2V0PXJhbmRvbV0gQSB2YWx1ZSB1c2VkIHRvIGVuc3VyZSBtdWx0aXBsZSBub2lzZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRvcnMgYXJlIHJldHVybmluZyBcImluZGVwZW5kZW50XCIgdmFsdWVzXHJcbiAqL1xyXG5mdW5jdGlvbiBOb2lzZUdlbmVyYXRvcjFEKHAsIG1pbiwgbWF4LCBpbmNyZW1lbnQsIG9mZnNldCkge1xyXG4gIHRoaXMuX3AgPSBwO1xyXG4gIHRoaXMuX21pbiA9IHV0aWxzLmRlZmF1bHQobWluLCAwKTtcclxuICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgMSk7XHJcbiAgdGhpcy5faW5jcmVtZW50ID0gdXRpbHMuZGVmYXVsdChpbmNyZW1lbnQsIDAuMSk7XHJcbiAgdGhpcy5fcG9zaXRpb24gPSB1dGlscy5kZWZhdWx0KG9mZnNldCwgcC5yYW5kb20oLTEwMDAwMDAsIDEwMDAwMDApKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgbWluIGFuZCBtYXggbm9pc2UgdmFsdWVzXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWluIE1pbmltdW0gbm9pc2UgdmFsdWVcclxuICogQHBhcmFtICB7bnVtYmVyfSBtYXggTWF4aW11bSBub2lzZSB2YWx1ZVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IxRC5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24obWluLCBtYXgpIHtcclxuICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgdGhpcy5fbWluKTtcclxuICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgdGhpcy5fbWF4KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG5vaXNlIGluY3JlbWVudCAoZS5nLiBzY2FsZSlcclxuICogQHBhcmFtICB7bnVtYmVyfSBpbmNyZW1lbnQgTmV3IGluY3JlbWVudCAoc2NhbGUpIHZhbHVlXHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjFELnByb3RvdHlwZS5zZXRJbmNyZW1lbnQgPSBmdW5jdGlvbihpbmNyZW1lbnQpIHtcclxuICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGluY3JlbWVudCwgdGhpcy5faW5jcmVtZW50KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZSB0aGUgbmV4dCBub2lzZSB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtudW1iZXJ9IEEgbm9pc3kgdmFsdWUgYmV0d2VlbiBvYmplY3QncyBtaW4gYW5kIG1heFxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IxRC5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl91cGRhdGUoKTtcclxuICB2YXIgbiA9IHRoaXMuX3Aubm9pc2UodGhpcy5fcG9zaXRpb24pO1xyXG4gIG4gPSB0aGlzLl9wLm1hcChuLCAwLCAxLCB0aGlzLl9taW4sIHRoaXMuX21heCk7XHJcbiAgcmV0dXJuIG47XHJcbn07XHJcblxyXG4vKipcclxuICogSW50ZXJuYWwgdXBkYXRlIG1ldGhvZCBmb3IgZ2VuZXJhdGluZyBuZXh0IG5vaXNlIHZhbHVlXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjFELnByb3RvdHlwZS5fdXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5fcG9zaXRpb24gKz0gdGhpcy5faW5jcmVtZW50O1xyXG59O1xyXG5cclxuLy8gLS0gMkQgTm9pc2UgR2VuZXJhdG9yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmZ1bmN0aW9uIE5vaXNlR2VuZXJhdG9yMkQocCwgeE1pbiwgeE1heCwgeU1pbiwgeU1heCwgeEluY3JlbWVudCwgeUluY3JlbWVudCwgeE9mZnNldCwgeU9mZnNldCkge1xyXG4gIHRoaXMuX3hOb2lzZSA9IG5ldyBOb2lzZUdlbmVyYXRvcjFEKHAsIHhNaW4sIHhNYXgsIHhJbmNyZW1lbnQsIHhPZmZzZXQpO1xyXG4gIHRoaXMuX3lOb2lzZSA9IG5ldyBOb2lzZUdlbmVyYXRvcjFEKHAsIHlNaW4sIHlNYXgsIHlJbmNyZW1lbnQsIHlPZmZzZXQpO1xyXG4gIHRoaXMuX3AgPSBwO1xyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBtaW4gYW5kIG1heCBub2lzZSB2YWx1ZXNcclxuICogQHBhcmFtICB7b2JqZWN0fSBvcHRpb25zIE9iamVjdCB3aXRoIGJvdW5kcyB0byBiZSB1cGRhdGVkIGUuZy5cclxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHsgeE1pbjogMCwgeE1heDogMSwgeU1pbjogLTEsIHlNYXg6IDEgfVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IyRC5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG4gIGlmICghb3B0aW9ucykgcmV0dXJuO1xyXG4gIHRoaXMuX3hOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy54TWluLCBvcHRpb25zLnhNYXgpO1xyXG4gIHRoaXMuX3lOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy55TWluLCBvcHRpb25zLnlNYXgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgaW5jcmVtZW50IChlLmcuIHNjYWxlKSBmb3IgdGhlIG5vaXNlIGdlbmVyYXRvclxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IG9wdGlvbnMgT2JqZWN0IHdpdGggYm91bmRzIHRvIGJlIHVwZGF0ZWQgZS5nLlxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgeyB4SW5jcmVtZW50OiAwLjA1LCB5SW5jcmVtZW50OiAwLjEgfVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IyRC5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG4gIGlmICghb3B0aW9ucykgcmV0dXJuO1xyXG4gIHRoaXMuX3hOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy54SW5jcmVtZW50KTtcclxuICB0aGlzLl95Tm9pc2Uuc2V0Qm91bmRzKG9wdGlvbnMueUluY3JlbWVudCk7XHJcbn07XHJcblxyXG4vKipcclxuICogR2VuZXJhdGUgdGhlIG5leHQgcGFpciBvZiBub2lzZSB2YWx1ZXNcclxuICogQHJldHVybiB7b2JqZWN0fSBPYmplY3Qgd2l0aCB4IGFuZCB5IHByb3BlcnRpZXMgdGhhdCBjb250YWluIHRoZSBuZXh0IG5vaXNlXHJcbiAqICAgICAgICAgICAgICAgICAgdmFsdWVzIGFsb25nIGVhY2ggZGltZW5zaW9uXHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjJELnByb3RvdHlwZS5nZW5lcmF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB4OiB0aGlzLl94Tm9pc2UuZ2VuZXJhdGUoKSxcclxuICAgIHk6IHRoaXMuX3lOb2lzZS5nZW5lcmF0ZSgpXHJcbiAgfTtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBTaW5HZW5lcmF0b3I7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuLyoqXHJcbiAqIEEgdXRpbGl0eSBjbGFzcyBmb3IgZ2VuZXJhdGluZyB2YWx1ZXMgYWxvbmcgYSBzaW53YXZlXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge29iamVjdH0gcCAgICAgICAgICAgICAgIFJlZmVyZW5jZSB0byBhIHA1IHNrZXRjaFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW21pbj0wXSAgICAgICAgIE1pbmltdW0gdmFsdWUgZm9yIHRoZSBub2lzZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW21heD0xXSAgICAgICAgIE1heGltdW0gdmFsdWUgZm9yIHRoZSBub2lzZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW2luY3JlbWVudD0wLjFdIEluY3JlbWVudCB1c2VkIHdoZW4gdXBkYXRpbmdcclxuICogQHBhcmFtIHtudW1iZXJ9IFtvZmZzZXQ9cmFuZG9tXSBXaGVyZSB0byBzdGFydCBhbG9uZyB0aGUgc2luZXdhdmVcclxuICovXHJcbmZ1bmN0aW9uIFNpbkdlbmVyYXRvcihwLCBtaW4sIG1heCwgYW5nbGVJbmNyZW1lbnQsIHN0YXJ0aW5nQW5nbGUpIHtcclxuICB0aGlzLl9wID0gcDtcclxuICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgMCk7XHJcbiAgdGhpcy5fbWF4ID0gdXRpbHMuZGVmYXVsdChtYXgsIDApO1xyXG4gIHRoaXMuX2luY3JlbWVudCA9IHV0aWxzLmRlZmF1bHQoYW5nbGVJbmNyZW1lbnQsIDAuMSk7XHJcbiAgdGhpcy5fYW5nbGUgPSB1dGlscy5kZWZhdWx0KHN0YXJ0aW5nQW5nbGUsIHAucmFuZG9tKC0xMDAwMDAwLCAxMDAwMDAwKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG1pbiBhbmQgbWF4IHZhbHVlc1xyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IG1pbiBNaW5pbXVtIHZhbHVlXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWF4IE1heGltdW0gdmFsdWVcclxuICovXHJcblNpbkdlbmVyYXRvci5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24obWluLCBtYXgpIHtcclxuICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgdGhpcy5fbWluKTtcclxuICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgdGhpcy5fbWF4KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIGFuZ2xlIGluY3JlbWVudCAoZS5nLiBob3cgZmFzdCB3ZSBtb3ZlIHRocm91Z2ggdGhlIHNpbndhdmUpXHJcbiAqIEBwYXJhbSAge251bWJlcn0gaW5jcmVtZW50IE5ldyBpbmNyZW1lbnQgdmFsdWVcclxuICovXHJcblNpbkdlbmVyYXRvci5wcm90b3R5cGUuc2V0SW5jcmVtZW50ID0gZnVuY3Rpb24oaW5jcmVtZW50KSB7XHJcbiAgdGhpcy5faW5jcmVtZW50ID0gdXRpbHMuZGVmYXVsdChpbmNyZW1lbnQsIHRoaXMuX2luY3JlbWVudCk7XHJcbn07XHJcblxyXG4vKipcclxuICogR2VuZXJhdGUgdGhlIG5leHQgdmFsdWVcclxuICogQHJldHVybiB7bnVtYmVyfSBBIHZhbHVlIGJldHdlZW4gZ2VuZXJhdG9ycydzIG1pbiBhbmQgbWF4XHJcbiAqL1xyXG5TaW5HZW5lcmF0b3IucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgdmFyIG4gPSB0aGlzLl9wLnNpbih0aGlzLl9hbmdsZSk7XHJcbiAgbiA9IHRoaXMuX3AubWFwKG4sIC0xLCAxLCB0aGlzLl9taW4sIHRoaXMuX21heCk7XHJcbiAgcmV0dXJuIG47XHJcbn07XHJcblxyXG4vKipcclxuICogSW50ZXJuYWwgdXBkYXRlIG1ldGhvZCBmb3IgZ2VuZXJhdGluZyBuZXh0IHZhbHVlXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5TaW5HZW5lcmF0b3IucHJvdG90eXBlLl91cGRhdGUgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl9hbmdsZSArPSB0aGlzLl9pbmNyZW1lbnQ7XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gU2tldGNoO1xyXG5cclxudmFyIEJib3hUZXh0ID0gcmVxdWlyZShcInA1LWJib3gtYWxpZ25lZC10ZXh0XCIpO1xyXG52YXIgQmFzZUxvZ29Ta2V0Y2ggPSByZXF1aXJlKFwiLi9iYXNlLWxvZ28tc2tldGNoLmpzXCIpO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZSk7XHJcblxyXG5mdW5jdGlvbiBTa2V0Y2goJG5hdiwgJG5hdkxvZ28pIHtcclxuICBCYXNlTG9nb1NrZXRjaC5jYWxsKHRoaXMsICRuYXYsICRuYXZMb2dvLCBcIi4uL2ZvbnRzL2JpZ19qb2huLXdlYmZvbnQudHRmXCIpO1xyXG59XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZSA9IGZ1bmN0aW9uKHApIHtcclxuICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplLmNhbGwodGhpcywgcCk7XHJcbiAgdGhpcy5fc3BhY2luZyA9IHV0aWxzLm1hcCh0aGlzLl9mb250U2l6ZSwgMjAsIDQwLCAyLCA1LCB7XHJcbiAgICBjbGFtcDogdHJ1ZSxcclxuICAgIHJvdW5kOiB0cnVlXHJcbiAgfSk7XHJcbiAgLy8gVXBkYXRlIHRoZSBiYm94VGV4dCwgcGxhY2Ugb3ZlciB0aGUgbmF2IHRleHQgbG9nbyBhbmQgdGhlbiBzaGlmdCBpdHNcclxuICAvLyBhbmNob3IgYmFjayB0byAoY2VudGVyLCBjZW50ZXIpIHdoaWxlIHByZXNlcnZpbmcgdGhlIHRleHQgcG9zaXRpb25cclxuICB0aGlzLl9iYm94VGV4dFxyXG4gICAgLnNldFRleHQodGhpcy5fdGV4dClcclxuICAgIC5zZXRUZXh0U2l6ZSh0aGlzLl9mb250U2l6ZSlcclxuICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0xFRlQsIEJib3hUZXh0LkJBU0VMSU5FLkFMUEhBQkVUSUMpXHJcbiAgICAuc2V0UG9zaXRpb24odGhpcy5fdGV4dE9mZnNldC5sZWZ0LCB0aGlzLl90ZXh0T2Zmc2V0LnRvcClcclxuICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0NFTlRFUiwgQmJveFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUiwgdHJ1ZSk7XHJcbiAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG4gIHRoaXMuX2NhbGN1bGF0ZUNpcmNsZXMocCk7XHJcbiAgdGhpcy5faXNGaXJzdEZyYW1lID0gdHJ1ZTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXdTdGF0aW9uYXJ5TG9nbyA9IGZ1bmN0aW9uKHApIHtcclxuICBwLmJhY2tncm91bmQoMjU1KTtcclxuICBwLnN0cm9rZSgyNTUpO1xyXG4gIHAuZmlsbChcIiMwQTAwMEFcIik7XHJcbiAgcC5zdHJva2VXZWlnaHQoMik7XHJcbiAgdGhpcy5fYmJveFRleHQuZHJhdygpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fc2V0dXAgPSBmdW5jdGlvbihwKSB7XHJcbiAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cC5jYWxsKHRoaXMsIHApO1xyXG5cclxuICAvLyBDcmVhdGUgYSBCYm94QWxpZ25lZFRleHQgaW5zdGFuY2UgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIGRyYXdpbmcgYW5kXHJcbiAgLy8gcm90YXRpbmcgdGV4dFxyXG4gIHRoaXMuX2Jib3hUZXh0ID0gbmV3IEJib3hUZXh0KHRoaXMuX2ZvbnQsIHRoaXMuX3RleHQsIHRoaXMuX2ZvbnRTaXplLCAwLCAwLCBwKTtcclxuXHJcbiAgLy8gSGFuZGxlIHRoZSBpbml0aWFsIHNldHVwIGJ5IHRyaWdnZXJpbmcgYSByZXNpemVcclxuICB0aGlzLl9vblJlc2l6ZShwKTtcclxuXHJcbiAgLy8gRHJhdyB0aGUgc3RhdGlvbmFyeSBsb2dvXHJcbiAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG5cclxuICB0aGlzLl9jYWxjdWxhdGVDaXJjbGVzKHApO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fY2FsY3VsYXRlQ2lyY2xlcyA9IGZ1bmN0aW9uKHApIHtcclxuICAvLyBUT0RPOiBEb24ndCBuZWVkIEFMTCB0aGUgcGl4ZWxzLiBUaGlzIGNvdWxkIGhhdmUgYW4gb2Zmc2NyZWVuIHJlbmRlcmVyXHJcbiAgLy8gdGhhdCBpcyBqdXN0IGJpZyBlbm91Z2ggdG8gZml0IHRoZSB0ZXh0LlxyXG4gIC8vIExvb3Agb3ZlciB0aGUgcGl4ZWxzIGluIHRoZSB0ZXh0J3MgYm91bmRpbmcgYm94IHRvIHNhbXBsZSB0aGUgd29yZFxyXG4gIHZhciBiYm94ID0gdGhpcy5fYmJveFRleHQuZ2V0QmJveCgpO1xyXG4gIHZhciBzdGFydFggPSBNYXRoLmZsb29yKE1hdGgubWF4KGJib3gueCAtIDUsIDApKTtcclxuICB2YXIgZW5kWCA9IE1hdGguY2VpbChNYXRoLm1pbihiYm94LnggKyBiYm94LncgKyA1LCBwLndpZHRoKSk7XHJcbiAgdmFyIHN0YXJ0WSA9IE1hdGguZmxvb3IoTWF0aC5tYXgoYmJveC55IC0gNSwgMCkpO1xyXG4gIHZhciBlbmRZID0gTWF0aC5jZWlsKE1hdGgubWluKGJib3gueSArIGJib3guaCArIDUsIHAuaGVpZ2h0KSk7XHJcbiAgcC5sb2FkUGl4ZWxzKCk7XHJcbiAgcC5waXhlbERlbnNpdHkoMSk7XHJcbiAgdGhpcy5fY2lyY2xlcyA9IFtdO1xyXG4gIGZvciAodmFyIHkgPSBzdGFydFk7IHkgPCBlbmRZOyB5ICs9IHRoaXMuX3NwYWNpbmcpIHtcclxuICAgIGZvciAodmFyIHggPSBzdGFydFg7IHggPCBlbmRYOyB4ICs9IHRoaXMuX3NwYWNpbmcpIHtcclxuICAgICAgdmFyIGkgPSA0ICogKHkgKiBwLndpZHRoICsgeCk7XHJcbiAgICAgIHZhciByID0gcC5waXhlbHNbaV07XHJcbiAgICAgIHZhciBnID0gcC5waXhlbHNbaSArIDFdO1xyXG4gICAgICB2YXIgYiA9IHAucGl4ZWxzW2kgKyAyXTtcclxuICAgICAgdmFyIGEgPSBwLnBpeGVsc1tpICsgM107XHJcbiAgICAgIHZhciBjID0gcC5jb2xvcihyLCBnLCBiLCBhKTtcclxuICAgICAgaWYgKHAuc2F0dXJhdGlvbihjKSA+IDApIHtcclxuICAgICAgICB0aGlzLl9jaXJjbGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCArIHAucmFuZG9tKC0yIC8gMyAqIHRoaXMuX3NwYWNpbmcsIDIgLyAzICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICB5OiB5ICsgcC5yYW5kb20oLTIgLyAzICogdGhpcy5fc3BhY2luZywgMiAvIDMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgIGNvbG9yOiBwLmNvbG9yKFwiIzA2RkZGRlwiKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX2NpcmNsZXMucHVzaCh7XHJcbiAgICAgICAgICB4OiB4ICsgcC5yYW5kb20oLTIgLyAzICogdGhpcy5fc3BhY2luZywgMiAvIDMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgIHk6IHkgKyBwLnJhbmRvbSgtMiAvIDMgKiB0aGlzLl9zcGFjaW5nLCAyIC8gMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgY29sb3I6IHAuY29sb3IoXCIjRkUwMEZFXCIpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fY2lyY2xlcy5wdXNoKHtcclxuICAgICAgICAgIHg6IHggKyBwLnJhbmRvbSgtMiAvIDMgKiB0aGlzLl9zcGFjaW5nLCAyIC8gMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgeTogeSArIHAucmFuZG9tKC0yIC8gMyAqIHRoaXMuX3NwYWNpbmcsIDIgLyAzICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICBjb2xvcjogcC5jb2xvcihcIiNGRkZGMDRcIilcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbihwKSB7XHJcbiAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9kcmF3LmNhbGwodGhpcywgcCk7XHJcbiAgaWYgKCF0aGlzLl9pc01vdXNlT3ZlciB8fCAhdGhpcy5faXNPdmVyTmF2TG9nbykgcmV0dXJuO1xyXG5cclxuICAvLyBXaGVuIHRoZSB0ZXh0IGlzIGFib3V0IHRvIGJlY29tZSBhY3RpdmUgZm9yIHRoZSBmaXJzdCB0aW1lLCBjbGVhclxyXG4gIC8vIHRoZSBzdGF0aW9uYXJ5IGxvZ28gdGhhdCB3YXMgcHJldmlvdXNseSBkcmF3bi5cclxuICBpZiAodGhpcy5faXNGaXJzdEZyYW1lKSB7XHJcbiAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2xlYXJcclxuICBwLmJsZW5kTW9kZShwLkJMRU5EKTtcclxuICBwLmJhY2tncm91bmQoMjU1KTtcclxuXHJcbiAgLy8gRHJhdyBcImhhbGZ0b25lXCIgbG9nb1xyXG4gIHAubm9TdHJva2UoKTtcclxuICBwLmJsZW5kTW9kZShwLk1VTFRJUExZKTtcclxuXHJcbiAgdmFyIG1heERpc3QgPSB0aGlzLl9iYm94VGV4dC5oYWxmV2lkdGg7XHJcbiAgdmFyIG1heFJhZGl1cyA9IDIgKiB0aGlzLl9zcGFjaW5nO1xyXG5cclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2NpcmNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBjaXJjbGUgPSB0aGlzLl9jaXJjbGVzW2ldO1xyXG4gICAgdmFyIGMgPSBjaXJjbGUuY29sb3I7XHJcbiAgICB2YXIgZGlzdCA9IHAuZGlzdChjaXJjbGUueCwgY2lyY2xlLnksIHAubW91c2VYLCBwLm1vdXNlWSk7XHJcbiAgICB2YXIgcmFkaXVzID0gdXRpbHMubWFwKGRpc3QsIDAsIG1heERpc3QsIDEsIG1heFJhZGl1cywgeyBjbGFtcDogdHJ1ZSB9KTtcclxuICAgIHAuZmlsbChjKTtcclxuICAgIHAuZWxsaXBzZShjaXJjbGUueCwgY2lyY2xlLnksIHJhZGl1cywgcmFkaXVzKTtcclxuICB9XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gU2tldGNoO1xyXG5cclxudmFyIE5vaXNlID0gcmVxdWlyZShcIi4vZ2VuZXJhdG9ycy9ub2lzZS1nZW5lcmF0b3JzLmpzXCIpO1xyXG52YXIgQmJveFRleHQgPSByZXF1aXJlKFwicDUtYmJveC1hbGlnbmVkLXRleHRcIik7XHJcbnZhciBCYXNlTG9nb1NrZXRjaCA9IHJlcXVpcmUoXCIuL2Jhc2UtbG9nby1za2V0Y2guanNcIik7XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUpO1xyXG5cclxuZnVuY3Rpb24gU2tldGNoKCRuYXYsICRuYXZMb2dvKSB7XHJcbiAgQmFzZUxvZ29Ta2V0Y2guY2FsbCh0aGlzLCAkbmF2LCAkbmF2TG9nbywgXCIuLi9mb250cy9iaWdfam9obi13ZWJmb250LnR0ZlwiKTtcclxufVxyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbihwKSB7XHJcbiAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZS5jYWxsKHRoaXMsIHApO1xyXG4gIC8vIFVwZGF0ZSB0aGUgYmJveFRleHQsIHBsYWNlIG92ZXIgdGhlIG5hdiB0ZXh0IGxvZ28gYW5kIHRoZW4gc2hpZnQgaXRzXHJcbiAgLy8gYW5jaG9yIGJhY2sgdG8gKGNlbnRlciwgY2VudGVyKSB3aGlsZSBwcmVzZXJ2aW5nIHRoZSB0ZXh0IHBvc2l0aW9uXHJcbiAgdGhpcy5fYmJveFRleHRcclxuICAgIC5zZXRUZXh0KHRoaXMuX3RleHQpXHJcbiAgICAuc2V0VGV4dFNpemUodGhpcy5fZm9udFNpemUpXHJcbiAgICAuc2V0Um90YXRpb24oMClcclxuICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0xFRlQsIEJib3hUZXh0LkJBU0VMSU5FLkFMUEhBQkVUSUMpXHJcbiAgICAuc2V0UG9zaXRpb24odGhpcy5fdGV4dE9mZnNldC5sZWZ0LCB0aGlzLl90ZXh0T2Zmc2V0LnRvcClcclxuICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0NFTlRFUiwgQmJveFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUiwgdHJ1ZSk7XHJcbiAgdGhpcy5fdGV4dFBvcyA9IHRoaXMuX2Jib3hUZXh0LmdldFBvc2l0aW9uKCk7XHJcbiAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG4gIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3U3RhdGlvbmFyeUxvZ28gPSBmdW5jdGlvbihwKSB7XHJcbiAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgcC5zdHJva2UoMjU1KTtcclxuICBwLmZpbGwoXCIjMEEwMDBBXCIpO1xyXG4gIHAuc3Ryb2tlV2VpZ2h0KDIpO1xyXG4gIHRoaXMuX2Jib3hUZXh0LmRyYXcoKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX3NldHVwID0gZnVuY3Rpb24ocCkge1xyXG4gIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fc2V0dXAuY2FsbCh0aGlzLCBwKTtcclxuXHJcbiAgLy8gQ3JlYXRlIGEgQmJveEFsaWduZWRUZXh0IGluc3RhbmNlIHRoYXQgd2lsbCBiZSB1c2VkIGZvciBkcmF3aW5nIGFuZFxyXG4gIC8vIHJvdGF0aW5nIHRleHRcclxuICB0aGlzLl9iYm94VGV4dCA9IG5ldyBCYm94VGV4dCh0aGlzLl9mb250LCB0aGlzLl90ZXh0LCB0aGlzLl9mb250U2l6ZSwgMCwgMCwgcCk7XHJcblxyXG4gIC8vIEhhbmRsZSB0aGUgaW5pdGlhbCBzZXR1cCBieSB0cmlnZ2VyaW5nIGEgcmVzaXplXHJcbiAgdGhpcy5fb25SZXNpemUocCk7XHJcblxyXG4gIC8vIFNldCB1cCBub2lzZSBnZW5lcmF0b3JzXHJcbiAgdGhpcy5fcm90YXRpb25Ob2lzZSA9IG5ldyBOb2lzZS5Ob2lzZUdlbmVyYXRvcjFEKHAsIC1wLlBJIC8gNCwgcC5QSSAvIDQsIDAuMDIpO1xyXG4gIHRoaXMuX3h5Tm9pc2UgPSBuZXcgTm9pc2UuTm9pc2VHZW5lcmF0b3IyRChwLCAtMTAwLCAxMDAsIC01MCwgNTAsIDAuMDEsIDAuMDEpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhdyA9IGZ1bmN0aW9uKHApIHtcclxuICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2RyYXcuY2FsbCh0aGlzLCBwKTtcclxuICBpZiAoIXRoaXMuX2lzTW91c2VPdmVyIHx8ICF0aGlzLl9pc092ZXJOYXZMb2dvKSByZXR1cm47XHJcblxyXG4gIC8vIFdoZW4gdGhlIHRleHQgaXMgYWJvdXQgdG8gYmVjb21lIGFjdGl2ZSBmb3IgdGhlIGZpcnN0IHRpbWUsIGNsZWFyXHJcbiAgLy8gdGhlIHN0YXRpb25hcnkgbG9nbyB0aGF0IHdhcyBwcmV2aW91c2x5IGRyYXduLlxyXG4gIGlmICh0aGlzLl9pc0ZpcnN0RnJhbWUpIHtcclxuICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgdGhpcy5faXNGaXJzdEZyYW1lID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAvLyBDYWxjdWxhdGUgcG9zaXRpb24gYW5kIHJvdGF0aW9uIHRvIGNyZWF0ZSBhIGppdHRlcnkgbG9nb1xyXG4gIHZhciByb3RhdGlvbiA9IHRoaXMuX3JvdGF0aW9uTm9pc2UuZ2VuZXJhdGUoKTtcclxuICB2YXIgeHlPZmZzZXQgPSB0aGlzLl94eU5vaXNlLmdlbmVyYXRlKCk7XHJcbiAgdGhpcy5fYmJveFRleHRcclxuICAgIC5zZXRSb3RhdGlvbihyb3RhdGlvbilcclxuICAgIC5zZXRQb3NpdGlvbih0aGlzLl90ZXh0UG9zLnggKyB4eU9mZnNldC54LCB0aGlzLl90ZXh0UG9zLnkgKyB4eU9mZnNldC55KVxyXG4gICAgLmRyYXcoKTtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBNYWluTmF2O1xyXG5cclxuZnVuY3Rpb24gTWFpbk5hdihsb2FkZXIpIHtcclxuICB0aGlzLl9sb2FkZXIgPSBsb2FkZXI7XHJcbiAgdGhpcy5fJGxvZ28gPSAkKFwibmF2Lm5hdmJhciAubmF2YmFyLWJyYW5kXCIpO1xyXG4gIHRoaXMuXyRuYXYgPSAkKFwiI21haW4tbmF2XCIpO1xyXG4gIHRoaXMuXyRuYXZMaW5rcyA9IHRoaXMuXyRuYXYuZmluZChcImFcIik7XHJcbiAgdGhpcy5fJGFjdGl2ZU5hdiA9IHRoaXMuXyRuYXZMaW5rcy5maW5kKFwiLmFjdGl2ZVwiKTtcclxuICB0aGlzLl8kbmF2TGlua3Mub24oXCJjbGlja1wiLCB0aGlzLl9vbk5hdkNsaWNrLmJpbmQodGhpcykpO1xyXG4gIHRoaXMuXyRsb2dvLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25Mb2dvQ2xpY2suYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbk1haW5OYXYucHJvdG90eXBlLnNldEFjdGl2ZUZyb21VcmwgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl9kZWFjdGl2YXRlKCk7XHJcbiAgdmFyIHVybCA9IGxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gIGlmICh1cmwgPT09IFwiL2luZGV4Lmh0bWxcIiB8fCB1cmwgPT09IFwiL1wiKSB7XHJcbiAgICB0aGlzLl9hY3RpdmF0ZUxpbmsodGhpcy5fJG5hdkxpbmtzLmZpbHRlcihcIiNhYm91dC1saW5rXCIpKTtcclxuICB9IGVsc2UgaWYgKHVybCA9PT0gXCIvd29yay5odG1sXCIpIHtcclxuICAgIHRoaXMuX2FjdGl2YXRlTGluayh0aGlzLl8kbmF2TGlua3MuZmlsdGVyKFwiI3dvcmstbGlua1wiKSk7XHJcbiAgfSBlbHNlIGlmICh1cmwgPT09IFwiL2NvbnRhY3QuaHRtbFwiKSB7XHJcbiAgICB0aGlzLl9hY3RpdmF0ZUxpbmsodGhpcy5fJG5hdkxpbmtzLmZpbHRlcihcIiNjb250YWN0LWxpbmtcIikpO1xyXG4gIH1cclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9kZWFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgaWYgKHRoaXMuXyRhY3RpdmVOYXYubGVuZ3RoKSB7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2LnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdiA9ICQoKTtcclxuICB9XHJcbn07XHJcblxyXG5NYWluTmF2LnByb3RvdHlwZS5fYWN0aXZhdGVMaW5rID0gZnVuY3Rpb24oJGxpbmspIHtcclxuICAkbGluay5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICB0aGlzLl8kYWN0aXZlTmF2ID0gJGxpbms7XHJcbn07XHJcblxyXG5NYWluTmF2LnByb3RvdHlwZS5fb25Mb2dvQ2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gIHZhciB1cmwgPSAkdGFyZ2V0LmF0dHIoXCJocmVmXCIpO1xyXG4gIHRoaXMuX2xvYWRlci5sb2FkUGFnZSh1cmwsIHt9LCB0cnVlKTtcclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9vbk5hdkNsaWNrID0gZnVuY3Rpb24oZSkge1xyXG4gIGUucHJldmVudERlZmF1bHQoKTtcclxuICB0aGlzLl8kbmF2LmNvbGxhcHNlKFwiaGlkZVwiKTsgLy8gQ2xvc2UgdGhlIG5hdiAtIG9ubHkgbWF0dGVycyBvbiBtb2JpbGVcclxuICB2YXIgJHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICBpZiAoJHRhcmdldC5pcyh0aGlzLl8kYWN0aXZlTmF2KSkgcmV0dXJuO1xyXG4gIHRoaXMuX2RlYWN0aXZhdGUoKTtcclxuICB0aGlzLl9hY3RpdmF0ZUxpbmsoJHRhcmdldCk7XHJcbiAgdmFyIHVybCA9ICR0YXJnZXQuYXR0cihcImhyZWZcIik7XHJcbiAgdGhpcy5fbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIHRydWUpO1xyXG59O1xyXG4iLCJ2YXIgTG9hZGVyID0gcmVxdWlyZShcIi4vcGFnZS1sb2FkZXIuanNcIik7XHJcbnZhciBNYWluTmF2ID0gcmVxdWlyZShcIi4vbWFpbi1uYXYuanNcIik7XHJcbnZhciBIb3ZlclNsaWRlc2hvd3MgPSByZXF1aXJlKFwiLi9ob3Zlci1zbGlkZXNob3cuanNcIik7XHJcbnZhciBQb3J0Zm9saW9GaWx0ZXIgPSByZXF1aXJlKFwiLi9wb3J0Zm9saW8tZmlsdGVyLmpzXCIpO1xyXG52YXIgc2xpZGVzaG93cyA9IHJlcXVpcmUoXCIuL3RodW1ibmFpbC1zbGlkZXNob3cvc2xpZGVzaG93LmpzXCIpO1xyXG5cclxuLy8gUGlja2luZyBhIHJhbmRvbSBza2V0Y2ggdGhhdCB0aGUgdXNlciBoYXNuJ3Qgc2VlbiBiZWZvcmVcclxudmFyIFNrZXRjaCA9IHJlcXVpcmUoXCIuL3BpY2stcmFuZG9tLXNrZXRjaC5qc1wiKSgpO1xyXG5cclxuLy8gQUpBWCBwYWdlIGxvYWRlciwgd2l0aCBjYWxsYmFjayBmb3IgcmVsb2FkaW5nIHdpZGdldHNcclxudmFyIGxvYWRlciA9IG5ldyBMb2FkZXIob25QYWdlTG9hZCk7XHJcblxyXG4vLyBNYWluIG5hdiB3aWRnZXRcclxudmFyIG1haW5OYXYgPSBuZXcgTWFpbk5hdihsb2FkZXIpO1xyXG5cclxuLy8gSW50ZXJhY3RpdmUgbG9nbyBpbiBuYXZiYXJcclxudmFyIG5hdiA9ICQoXCJuYXYubmF2YmFyXCIpO1xyXG52YXIgbmF2TG9nbyA9IG5hdi5maW5kKFwiLm5hdmJhci1icmFuZFwiKTtcclxubmV3IFNrZXRjaChuYXYsIG5hdkxvZ28pO1xyXG5cclxuLy8gV2lkZ2V0IGdsb2JhbHNcclxudmFyIHBvcnRmb2xpb0ZpbHRlcjtcclxuXHJcbi8vIExvYWQgYWxsIHdpZGdldHNcclxub25QYWdlTG9hZCgpO1xyXG5cclxuLy8gSGFuZGxlIGJhY2svZm9yd2FyZCBidXR0b25zXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicG9wc3RhdGVcIiwgb25Qb3BTdGF0ZSk7XHJcblxyXG5mdW5jdGlvbiBvblBvcFN0YXRlKGUpIHtcclxuICAvLyBMb2FkZXIgc3RvcmVzIGN1c3RvbSBkYXRhIGluIHRoZSBzdGF0ZSAtIGluY2x1ZGluZyB0aGUgdXJsIGFuZCB0aGUgcXVlcnlcclxuICB2YXIgdXJsID0gKGUuc3RhdGUgJiYgZS5zdGF0ZS51cmwpIHx8IFwiL2luZGV4Lmh0bWxcIjtcclxuICB2YXIgcXVlcnlPYmplY3QgPSAoZS5zdGF0ZSAmJiBlLnN0YXRlLnF1ZXJ5KSB8fCB7fTtcclxuXHJcbiAgaWYgKHVybCA9PT0gbG9hZGVyLmdldExvYWRlZFBhdGgoKSAmJiB1cmwgPT09IFwiL3dvcmsuaHRtbFwiKSB7XHJcbiAgICAvLyBUaGUgY3VycmVudCAmIHByZXZpb3VzIGxvYWRlZCBzdGF0ZXMgd2VyZSB3b3JrLmh0bWwsIHNvIGp1c3QgcmVmaWx0ZXJcclxuICAgIHZhciBjYXRlZ29yeSA9IHF1ZXJ5T2JqZWN0LmNhdGVnb3J5IHx8IFwiYWxsXCI7XHJcbiAgICBwb3J0Zm9saW9GaWx0ZXIuc2VsZWN0Q2F0ZWdvcnkoY2F0ZWdvcnkpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAvLyBMb2FkIHRoZSBuZXcgcGFnZVxyXG4gICAgbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIGZhbHNlKTtcclxuICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUGFnZUxvYWQoKSB7XHJcbiAgLy8gUmVsb2FkIGFsbCBwbHVnaW5zL3dpZGdldHNcclxuICBuZXcgSG92ZXJTbGlkZXNob3dzKCk7XHJcbiAgcG9ydGZvbGlvRmlsdGVyID0gbmV3IFBvcnRmb2xpb0ZpbHRlcihsb2FkZXIpO1xyXG4gIHNsaWRlc2hvd3MuaW5pdCgpO1xyXG4gIG9iamVjdEZpdEltYWdlcygpO1xyXG4gIHNtYXJ0cXVvdGVzKCk7XHJcblxyXG4gIC8vIFNsaWdodGx5IHJlZHVuZGFudCwgYnV0IHVwZGF0ZSB0aGUgbWFpbiBuYXYgdXNpbmcgdGhlIGN1cnJlbnQgVVJMLiBUaGlzXHJcbiAgLy8gaXMgaW1wb3J0YW50IGlmIGEgcGFnZSBpcyBsb2FkZWQgYnkgdHlwaW5nIGEgZnVsbCBVUkwgKGUuZy4gZ29pbmdcclxuICAvLyBkaXJlY3RseSB0byAvd29yay5odG1sKSBvciB3aGVuIG1vdmluZyBmcm9tIHdvcmsuaHRtbCB0byBhIHByb2plY3QuXHJcbiAgbWFpbk5hdi5zZXRBY3RpdmVGcm9tVXJsKCk7XHJcbn1cclxuXHJcbi8vIFdlJ3ZlIGhpdCB0aGUgbGFuZGluZyBwYWdlLCBsb2FkIHRoZSBhYm91dCBwYWdlXHJcbi8vIGlmIChsb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvXihcXC98XFwvaW5kZXguaHRtbHxpbmRleC5odG1sKSQvKSkge1xyXG4vLyAgICAgbG9hZGVyLmxvYWRQYWdlKFwiL2Fib3V0Lmh0bWxcIiwge30sIGZhbHNlKTtcclxuLy8gfVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IExvYWRlcjtcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBMb2FkZXIob25SZWxvYWQsIGZhZGVEdXJhdGlvbikge1xyXG4gIHRoaXMuXyRjb250ZW50ID0gJChcIiNjb250ZW50XCIpO1xyXG4gIHRoaXMuX29uUmVsb2FkID0gb25SZWxvYWQ7XHJcbiAgdGhpcy5fZmFkZUR1cmF0aW9uID0gZmFkZUR1cmF0aW9uICE9PSB1bmRlZmluZWQgPyBmYWRlRHVyYXRpb24gOiAyNTA7XHJcbiAgdGhpcy5fcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lO1xyXG59XHJcblxyXG5Mb2FkZXIucHJvdG90eXBlLmdldExvYWRlZFBhdGggPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5fcGF0aDtcclxufTtcclxuXHJcbkxvYWRlci5wcm90b3R5cGUubG9hZFBhZ2UgPSBmdW5jdGlvbih1cmwsIHF1ZXJ5T2JqZWN0LCBzaG91bGRQdXNoSGlzdG9yeSkge1xyXG4gIC8vIEZhZGUgdGhlbiBlbXB0eSB0aGUgY3VycmVudCBjb250ZW50c1xyXG4gIHRoaXMuXyRjb250ZW50LnZlbG9jaXR5KFxyXG4gICAgeyBvcGFjaXR5OiAwIH0sXHJcbiAgICB0aGlzLl9mYWRlRHVyYXRpb24sXHJcbiAgICBcInN3aW5nXCIsXHJcbiAgICBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5fJGNvbnRlbnQuZW1wdHkoKTtcclxuICAgICAgdGhpcy5fJGNvbnRlbnQubG9hZCh1cmwgKyBcIiAjY29udGVudFwiLCBvbkNvbnRlbnRGZXRjaGVkLmJpbmQodGhpcykpO1xyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxuXHJcbiAgLy8gRmFkZSB0aGUgbmV3IGNvbnRlbnQgaW4gYWZ0ZXIgaXQgaGFzIGJlZW4gZmV0Y2hlZFxyXG4gIGZ1bmN0aW9uIG9uQ29udGVudEZldGNoZWQocmVzcG9uc2VUZXh0LCB0ZXh0U3RhdHVzKSB7XHJcbiAgICBpZiAodGV4dFN0YXR1cyA9PT0gXCJlcnJvclwiKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBsb2FkaW5nIHRoZSBwYWdlLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBxdWVyeVN0cmluZyA9IHV0aWxpdGllcy5jcmVhdGVRdWVyeVN0cmluZyhxdWVyeU9iamVjdCk7XHJcbiAgICBpZiAoc2hvdWxkUHVzaEhpc3RvcnkpIHtcclxuICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICBxdWVyeTogcXVlcnlPYmplY3RcclxuICAgICAgICB9LFxyXG4gICAgICAgIG51bGwsXHJcbiAgICAgICAgdXJsICsgcXVlcnlTdHJpbmdcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgR29vZ2xlIGFuYWx5dGljc1xyXG4gICAgZ2EoXCJzZXRcIiwgXCJwYWdlXCIsIHVybCArIHF1ZXJ5U3RyaW5nKTtcclxuICAgIGdhKFwic2VuZFwiLCBcInBhZ2V2aWV3XCIpO1xyXG5cclxuICAgIHRoaXMuX3BhdGggPSBsb2NhdGlvbi5wYXRobmFtZTtcclxuICAgIHRoaXMuXyRjb250ZW50LnZlbG9jaXR5KHsgb3BhY2l0eTogMSB9LCB0aGlzLl9mYWRlRHVyYXRpb24sIFwic3dpbmdcIik7XHJcbiAgICB0aGlzLl9vblJlbG9hZCgpO1xyXG4gIH1cclxufTtcclxuIiwidmFyIGNvb2tpZXMgPSByZXF1aXJlKFwianMtY29va2llXCIpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG52YXIgc2tldGNoQ29uc3RydWN0b3JzID0ge1xyXG4gIFwiaGFsZnRvbmUtZmxhc2hsaWdodFwiOiByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9oYWxmdG9uZS1mbGFzaGxpZ2h0LXdvcmQuanNcIiksXHJcbiAgXCJub2lzeS13b3JkXCI6IHJlcXVpcmUoXCIuL2ludGVyYWN0aXZlLWxvZ29zL25vaXN5LXdvcmQtc2tldGNoLmpzXCIpLFxyXG4gIFwiY29ubmVjdC1wb2ludHNcIjogcmVxdWlyZShcIi4vaW50ZXJhY3RpdmUtbG9nb3MvY29ubmVjdC1wb2ludHMtc2tldGNoLmpzXCIpXHJcbn07XHJcbnZhciBudW1Ta2V0Y2hlcyA9IE9iamVjdC5rZXlzKHNrZXRjaENvbnN0cnVjdG9ycykubGVuZ3RoO1xyXG52YXIgY29va2llS2V5ID0gXCJzZWVuLXNrZXRjaC1uYW1lc1wiO1xyXG5cclxuLyoqXHJcbiAqIFBpY2sgYSByYW5kb20gc2tldGNoIHRoYXQgdXNlciBoYXNuJ3Qgc2VlbiB5ZXQuIElmIHRoZSB1c2VyIGhhcyBzZWVuIGFsbCB0aGVcclxuICogc2tldGNoZXMsIGp1c3QgcGljayBhIHJhbmRvbSBvbmUuIFRoaXMgdXNlcyBjb29raWVzIHRvIHRyYWNrIHdoYXQgdGhlIHVzZXJcclxuICogaGFzIHNlZW4gYWxyZWFkeS5cclxuICogQHJldHVybiB7RnVuY3Rpb259IENvbnN0cnVjdG9yIGZvciBhIFNrZXRjaCBjbGFzc1xyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwaWNrUmFuZG9tU2tldGNoKCkge1xyXG4gIHZhciBzZWVuU2tldGNoTmFtZXMgPSBjb29raWVzLmdldEpTT04oY29va2llS2V5KSB8fCBbXTtcclxuXHJcbiAgLy8gRmluZCB0aGUgbmFtZXMgb2YgdGhlIHVuc2VlbiBza2V0Y2hlc1xyXG4gIHZhciB1bnNlZW5Ta2V0Y2hOYW1lcyA9IGZpbmRVbnNlZW5Ta2V0Y2hlcyhzZWVuU2tldGNoTmFtZXMpO1xyXG5cclxuICAvLyBBbGwgc2tldGNoZXMgaGF2ZSBiZWVuIHNlZW5cclxuICBpZiAodW5zZWVuU2tldGNoTmFtZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAvLyBJZiB3ZSd2ZSBnb3QgbW9yZSB0aGVuIG9uZSBza2V0Y2gsIHRoZW4gbWFrZSBzdXJlIHRvIGNob29zZSBhIHJhbmRvbVxyXG4gICAgLy8gc2tldGNoIGV4Y2x1ZGluZyB0aGUgbW9zdCByZWNlbnRseSBzZWVuIHNrZXRjaFxyXG4gICAgaWYgKG51bVNrZXRjaGVzID4gMSkge1xyXG4gICAgICBzZWVuU2tldGNoTmFtZXMgPSBbc2VlblNrZXRjaE5hbWVzLnBvcCgpXTtcclxuICAgICAgdW5zZWVuU2tldGNoTmFtZXMgPSBmaW5kVW5zZWVuU2tldGNoZXMoc2VlblNrZXRjaE5hbWVzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIElmIHdlJ3ZlIG9ubHkgZ290IG9uZSBza2V0Y2gsIHRoZW4gd2UgY2FuJ3QgZG8gbXVjaC4uLlxyXG4gICAgICBzZWVuU2tldGNoTmFtZXMgPSBbXTtcclxuICAgICAgdW5zZWVuU2tldGNoTmFtZXMgPSBPYmplY3Qua2V5cyhza2V0Y2hDb25zdHJ1Y3RvcnMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIHJhbmRTa2V0Y2hOYW1lID0gdXRpbHMucmFuZEFycmF5RWxlbWVudCh1bnNlZW5Ta2V0Y2hOYW1lcyk7XHJcbiAgc2VlblNrZXRjaE5hbWVzLnB1c2gocmFuZFNrZXRjaE5hbWUpO1xyXG5cclxuICAvLyBTdG9yZSB0aGUgZ2VuZXJhdGVkIHNrZXRjaCBpbiBhIGNvb2tpZS4gVGhpcyBjcmVhdGVzIGEgbW92aW5nIDcgZGF5XHJcbiAgLy8gd2luZG93IC0gYW55dGltZSB0aGUgc2l0ZSBpcyB2aXNpdGVkLCB0aGUgY29va2llIGlzIHJlZnJlc2hlZC5cclxuICBjb29raWVzLnNldChjb29raWVLZXksIHNlZW5Ta2V0Y2hOYW1lcywgeyBleHBpcmVzOiA3IH0pO1xyXG5cclxuICByZXR1cm4gc2tldGNoQ29uc3RydWN0b3JzW3JhbmRTa2V0Y2hOYW1lXTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGZpbmRVbnNlZW5Ta2V0Y2hlcyhzZWVuU2tldGNoTmFtZXMpIHtcclxuICB2YXIgdW5zZWVuU2tldGNoTmFtZXMgPSBbXTtcclxuICBmb3IgKHZhciBza2V0Y2hOYW1lIGluIHNrZXRjaENvbnN0cnVjdG9ycykge1xyXG4gICAgaWYgKHNlZW5Ta2V0Y2hOYW1lcy5pbmRleE9mKHNrZXRjaE5hbWUpID09PSAtMSkge1xyXG4gICAgICB1bnNlZW5Ta2V0Y2hOYW1lcy5wdXNoKHNrZXRjaE5hbWUpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdW5zZWVuU2tldGNoTmFtZXM7XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9GaWx0ZXI7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxudmFyIGRlZmF1bHRCcmVha3BvaW50cyA9IFtcclxuICB7IHdpZHRoOiAxMjAwLCBjb2xzOiAzLCBzcGFjaW5nOiAxNSB9LFxyXG4gIHsgd2lkdGg6IDk5MiwgY29sczogMywgc3BhY2luZzogMTUgfSxcclxuICB7IHdpZHRoOiA3MDAsIGNvbHM6IDMsIHNwYWNpbmc6IDE1IH0sXHJcbiAgeyB3aWR0aDogNjAwLCBjb2xzOiAyLCBzcGFjaW5nOiAxMCB9LFxyXG4gIHsgd2lkdGg6IDQ4MCwgY29sczogMiwgc3BhY2luZzogMTAgfSxcclxuICB7IHdpZHRoOiAzMjAsIGNvbHM6IDEsIHNwYWNpbmc6IDEwIH1cclxuXTtcclxuXHJcbmZ1bmN0aW9uIFBvcnRmb2xpb0ZpbHRlcihsb2FkZXIsIGJyZWFrcG9pbnRzLCBhc3BlY3RSYXRpbywgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgdGhpcy5fbG9hZGVyID0gbG9hZGVyO1xyXG4gIHRoaXMuX2dyaWRTcGFjaW5nID0gMDtcclxuICB0aGlzLl9hc3BlY3RSYXRpbyA9IGFzcGVjdFJhdGlvICE9PSB1bmRlZmluZWQgPyBhc3BlY3RSYXRpbyA6IDE2IC8gOTtcclxuICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb24gIT09IHVuZGVmaW5lZCA/IHRyYW5zaXRpb25EdXJhdGlvbiA6IDgwMDtcclxuICB0aGlzLl9icmVha3BvaW50cyA9IGJyZWFrcG9pbnRzICE9PSB1bmRlZmluZWQgPyBicmVha3BvaW50cy5zbGljZSgpIDogZGVmYXVsdEJyZWFrcG9pbnRzLnNsaWNlKCk7XHJcbiAgdGhpcy5fJGdyaWQgPSAkKFwiI3BvcnRmb2xpby1ncmlkXCIpO1xyXG4gIHRoaXMuXyRuYXYgPSAkKFwiI3BvcnRmb2xpby1uYXZcIik7XHJcbiAgdGhpcy5fJHByb2plY3RzID0gW107XHJcbiAgdGhpcy5fJGNhdGVnb3JpZXMgPSB7fTtcclxuICB0aGlzLl9yb3dzID0gMDtcclxuICB0aGlzLl9jb2xzID0gMDtcclxuICB0aGlzLl9pbWFnZUhlaWdodCA9IDA7XHJcbiAgdGhpcy5faW1hZ2VXaWR0aCA9IDA7XHJcblxyXG4gIC8vIFNvcnQgdGhlIGJyZWFrcG9pbnRzIGluIGRlc2NlbmRpbmcgb3JkZXJcclxuICB0aGlzLl9icmVha3BvaW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgIGlmIChhLndpZHRoIDwgYi53aWR0aCkgcmV0dXJuIC0xO1xyXG4gICAgZWxzZSBpZiAoYS53aWR0aCA+IGIud2lkdGgpIHJldHVybiAxO1xyXG4gICAgZWxzZSByZXR1cm4gMDtcclxuICB9KTtcclxuXHJcbiAgdGhpcy5fY2FjaGVQcm9qZWN0cygpO1xyXG4gIHRoaXMuX2NyZWF0ZUdyaWQoKTtcclxuXHJcbiAgdGhpcy5fJGdyaWQuZmluZChcIi5wcm9qZWN0IGFcIikub24oXCJjbGlja1wiLCB0aGlzLl9vblByb2plY3RDbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgdmFyIHFzID0gdXRpbGl0aWVzLmdldFF1ZXJ5UGFyYW1ldGVycygpO1xyXG4gIHZhciBpbml0aWFsQ2F0ZWdvcnkgPSBxcy5jYXRlZ29yeSB8fCBcImFsbFwiO1xyXG4gIHZhciBjYXRlZ29yeSA9IGluaXRpYWxDYXRlZ29yeS50b0xvd2VyQ2FzZSgpO1xyXG4gIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gdGhpcy5fJG5hdi5maW5kKFwiYVtkYXRhLWNhdGVnb3J5PVwiICsgY2F0ZWdvcnkgKyBcIl1cIik7XHJcbiAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG4gICQoXCIjcG9ydGZvbGlvLW5hdiBhXCIpLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25OYXZDbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX2NyZWF0ZUdyaWQuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuc2VsZWN0Q2F0ZWdvcnkgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xyXG4gIGNhdGVnb3J5ID0gKGNhdGVnb3J5ICYmIGNhdGVnb3J5LnRvTG93ZXJDYXNlKCkpIHx8IFwiYWxsXCI7XHJcbiAgdmFyICRzZWxlY3RlZE5hdiA9IHRoaXMuXyRuYXYuZmluZChcImFbZGF0YS1jYXRlZ29yeT1cIiArIGNhdGVnb3J5ICsgXCJdXCIpO1xyXG4gIGlmICgkc2VsZWN0ZWROYXYubGVuZ3RoICYmICEkc2VsZWN0ZWROYXYuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSB7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gJHNlbGVjdGVkTmF2O1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl9maWx0ZXJQcm9qZWN0cyhjYXRlZ29yeSk7XHJcbiAgfVxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZmlsdGVyUHJvamVjdHMgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xyXG4gIHZhciAkc2VsZWN0ZWRFbGVtZW50cyA9IHRoaXMuX2dldFByb2plY3RzSW5DYXRlZ29yeShjYXRlZ29yeSk7XHJcblxyXG4gIC8vIEFuaW1hdGUgdGhlIGdyaWQgdG8gdGhlIGNvcnJlY3QgaGVpZ2h0IHRvIGNvbnRhaW4gdGhlIHJvd3NcclxuICB0aGlzLl9hbmltYXRlR3JpZEhlaWdodCgkc2VsZWN0ZWRFbGVtZW50cy5sZW5ndGgpO1xyXG5cclxuICAvLyBMb29wIHRocm91Z2ggYWxsIHByb2plY3RzXHJcbiAgdGhpcy5fJHByb2plY3RzLmZvckVhY2goXHJcbiAgICBmdW5jdGlvbigkZWxlbWVudCkge1xyXG4gICAgICAvLyBTdG9wIGFsbCBhbmltYXRpb25zXHJcbiAgICAgICRlbGVtZW50LnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgICAgLy8gSWYgYW4gZWxlbWVudCBpcyBub3Qgc2VsZWN0ZWQ6IGRyb3Agei1pbmRleCAmIGFuaW1hdGUgb3BhY2l0eSAtPiBoaWRlXHJcbiAgICAgIHZhciBzZWxlY3RlZEluZGV4ID0gJHNlbGVjdGVkRWxlbWVudHMuaW5kZXhPZigkZWxlbWVudCk7XHJcbiAgICAgIGlmIChzZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICRlbGVtZW50LmNzcyhcInpJbmRleFwiLCAtMSk7XHJcbiAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sXHJcbiAgICAgICAgICBcImVhc2VJbk91dEN1YmljXCIsXHJcbiAgICAgICAgICBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSWYgYW4gZWxlbWVudCBpcyBzZWxlY3RlZDogc2hvdyAmIGJ1bXAgei1pbmRleCAmIGFuaW1hdGUgdG8gcG9zaXRpb25cclxuICAgICAgICAkZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgJGVsZW1lbnQuY3NzKFwiekluZGV4XCIsIDApO1xyXG4gICAgICAgIHZhciBuZXdQb3MgPSB0aGlzLl9pbmRleFRvWFkoc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDEsXHJcbiAgICAgICAgICAgIHRvcDogbmV3UG9zLnkgKyBcInB4XCIsXHJcbiAgICAgICAgICAgIGxlZnQ6IG5ld1Bvcy54ICsgXCJweFwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uLFxyXG4gICAgICAgICAgXCJlYXNlSW5PdXRDdWJpY1wiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2FuaW1hdGVHcmlkSGVpZ2h0ID0gZnVuY3Rpb24obnVtRWxlbWVudHMpIHtcclxuICB0aGlzLl8kZ3JpZC52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgdmFyIGN1clJvd3MgPSBNYXRoLmNlaWwobnVtRWxlbWVudHMgLyB0aGlzLl9jb2xzKTtcclxuICB0aGlzLl8kZ3JpZC52ZWxvY2l0eShcclxuICAgIHtcclxuICAgICAgaGVpZ2h0OiB0aGlzLl9pbWFnZUhlaWdodCAqIGN1clJvd3MgKyB0aGlzLl9ncmlkU3BhY2luZyAqIChjdXJSb3dzIC0gMSkgKyBcInB4XCJcclxuICAgIH0sXHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb25cclxuICApO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZ2V0UHJvamVjdHNJbkNhdGVnb3J5ID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcclxuICBpZiAoY2F0ZWdvcnkgPT09IFwiYWxsXCIpIHtcclxuICAgIHJldHVybiB0aGlzLl8kcHJvamVjdHM7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiB0aGlzLl8kY2F0ZWdvcmllc1tjYXRlZ29yeV0gfHwgW107XHJcbiAgfVxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fY2FjaGVQcm9qZWN0cyA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuXyRwcm9qZWN0cyA9IFtdO1xyXG4gIHRoaXMuXyRjYXRlZ29yaWVzID0ge307XHJcbiAgdGhpcy5fJGdyaWQuZmluZChcIi5wcm9qZWN0XCIpLmVhY2goXHJcbiAgICBmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG4gICAgICB0aGlzLl8kcHJvamVjdHMucHVzaCgkZWxlbWVudCk7XHJcbiAgICAgIHZhciBjYXRlZ29yeU5hbWVzID0gJGVsZW1lbnQuZGF0YShcImNhdGVnb3JpZXNcIikuc3BsaXQoXCIsXCIpO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhdGVnb3J5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgY2F0ZWdvcnkgPSAkLnRyaW0oY2F0ZWdvcnlOYW1lc1tpXSkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAoIXRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XSkge1xyXG4gICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldID0gWyRlbGVtZW50XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldLnB1c2goJGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxufTtcclxuXHJcbi8vIFBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhbGN1bGF0ZUdyaWQgPSBmdW5jdGlvbiAoKSB7XHJcbi8vICAgICB2YXIgZ3JpZFdpZHRoID0gdGhpcy5fJGdyaWQuaW5uZXJXaWR0aCgpO1xyXG4vLyAgICAgdGhpcy5fY29scyA9IE1hdGguZmxvb3IoKGdyaWRXaWR0aCArIHRoaXMuX2dyaWRTcGFjaW5nKSAvXHJcbi8vICAgICAgICAgKHRoaXMuX21pbkltYWdlV2lkdGggKyB0aGlzLl9ncmlkU3BhY2luZykpO1xyXG4vLyAgICAgdGhpcy5fcm93cyA9IE1hdGguY2VpbCh0aGlzLl8kcHJvamVjdHMubGVuZ3RoIC8gdGhpcy5fY29scyk7XHJcbi8vICAgICB0aGlzLl9pbWFnZVdpZHRoID0gKGdyaWRXaWR0aCAtICgodGhpcy5fY29scyAtIDEpICogdGhpcy5fZ3JpZFNwYWNpbmcpKSAvXHJcbi8vICAgICAgICAgdGhpcy5fY29scztcclxuLy8gICAgIHRoaXMuX2ltYWdlSGVpZ2h0ID0gdGhpcy5faW1hZ2VXaWR0aCAqICgxIC8gdGhpcy5fYXNwZWN0UmF0aW8pO1xyXG4vLyB9O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fY2FsY3VsYXRlR3JpZCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBncmlkV2lkdGggPSB0aGlzLl8kZ3JpZC5pbm5lcldpZHRoKCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9icmVha3BvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgaWYgKGdyaWRXaWR0aCA8PSB0aGlzLl9icmVha3BvaW50c1tpXS53aWR0aCkge1xyXG4gICAgICB0aGlzLl9jb2xzID0gdGhpcy5fYnJlYWtwb2ludHNbaV0uY29scztcclxuICAgICAgdGhpcy5fZ3JpZFNwYWNpbmcgPSB0aGlzLl9icmVha3BvaW50c1tpXS5zcGFjaW5nO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgdGhpcy5fcm93cyA9IE1hdGguY2VpbCh0aGlzLl8kcHJvamVjdHMubGVuZ3RoIC8gdGhpcy5fY29scyk7XHJcbiAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAodGhpcy5fY29scyAtIDEpICogdGhpcy5fZ3JpZFNwYWNpbmcpIC8gdGhpcy5fY29scztcclxuICB0aGlzLl9pbWFnZUhlaWdodCA9IHRoaXMuX2ltYWdlV2lkdGggKiAoMSAvIHRoaXMuX2FzcGVjdFJhdGlvKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NyZWF0ZUdyaWQgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl9jYWxjdWxhdGVHcmlkKCk7XHJcblxyXG4gIHRoaXMuXyRncmlkLmNzcyhcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XHJcbiAgdGhpcy5fJGdyaWQuY3NzKHtcclxuICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKiB0aGlzLl9yb3dzICsgdGhpcy5fZ3JpZFNwYWNpbmcgKiAodGhpcy5fcm93cyAtIDEpICsgXCJweFwiXHJcbiAgfSk7XHJcblxyXG4gIHRoaXMuXyRwcm9qZWN0cy5mb3JFYWNoKFxyXG4gICAgZnVuY3Rpb24oJGVsZW1lbnQsIGluZGV4KSB7XHJcbiAgICAgIHZhciBwb3MgPSB0aGlzLl9pbmRleFRvWFkoaW5kZXgpO1xyXG4gICAgICAkZWxlbWVudC5jc3Moe1xyXG4gICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgdG9wOiBwb3MueSArIFwicHhcIixcclxuICAgICAgICBsZWZ0OiBwb3MueCArIFwicHhcIixcclxuICAgICAgICB3aWR0aDogdGhpcy5faW1hZ2VXaWR0aCArIFwicHhcIixcclxuICAgICAgICBoZWlnaHQ6IHRoaXMuX2ltYWdlSGVpZ2h0ICsgXCJweFwiXHJcbiAgICAgIH0pO1xyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX29uTmF2Q2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcbiAgaWYgKCR0YXJnZXQuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSByZXR1cm47XHJcbiAgaWYgKHRoaXMuXyRhY3RpdmVOYXZJdGVtLmxlbmd0aCkgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgJHRhcmdldC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9ICR0YXJnZXQ7XHJcbiAgdmFyIGNhdGVnb3J5ID0gJHRhcmdldC5kYXRhKFwiY2F0ZWdvcnlcIikudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaGlzdG9yeS5wdXNoU3RhdGUoXHJcbiAgICB7XHJcbiAgICAgIHVybDogXCIvd29yay5odG1sXCIsXHJcbiAgICAgIHF1ZXJ5OiB7IGNhdGVnb3J5OiBjYXRlZ29yeSB9XHJcbiAgICB9LFxyXG4gICAgbnVsbCxcclxuICAgIFwiL3dvcmsuaHRtbD9jYXRlZ29yeT1cIiArIGNhdGVnb3J5XHJcbiAgKTtcclxuXHJcbiAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fb25Qcm9qZWN0Q2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gIHZhciBwcm9qZWN0TmFtZSA9ICR0YXJnZXQuZGF0YShcIm5hbWVcIik7XHJcbiAgdmFyIHVybCA9IFwiL3Byb2plY3RzL1wiICsgcHJvamVjdE5hbWUgKyBcIi5odG1sXCI7XHJcbiAgdGhpcy5fbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIHRydWUpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5faW5kZXhUb1hZID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICB2YXIgciA9IE1hdGguZmxvb3IoaW5kZXggLyB0aGlzLl9jb2xzKTtcclxuICB2YXIgYyA9IGluZGV4ICUgdGhpcy5fY29scztcclxuICByZXR1cm4ge1xyXG4gICAgeDogYyAqIHRoaXMuX2ltYWdlV2lkdGggKyBjICogdGhpcy5fZ3JpZFNwYWNpbmcsXHJcbiAgICB5OiByICogdGhpcy5faW1hZ2VIZWlnaHQgKyByICogdGhpcy5fZ3JpZFNwYWNpbmdcclxuICB9O1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFNsaWRlc2hvd01vZGFsO1xyXG5cclxudmFyIEtFWV9DT0RFUyA9IHtcclxuICBMRUZUX0FSUk9XOiAzNyxcclxuICBSSUdIVF9BUlJPVzogMzksXHJcbiAgRVNDQVBFOiAyN1xyXG59O1xyXG5cclxuZnVuY3Rpb24gU2xpZGVzaG93TW9kYWwoJGNvbnRhaW5lciwgc2xpZGVzaG93KSB7XHJcbiAgdGhpcy5fc2xpZGVzaG93ID0gc2xpZGVzaG93O1xyXG5cclxuICB0aGlzLl8kbW9kYWwgPSAkY29udGFpbmVyLmZpbmQoXCIuc2xpZGVzaG93LW1vZGFsXCIpO1xyXG4gIHRoaXMuXyRvdmVybGF5ID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIubW9kYWwtb3ZlcmxheVwiKTtcclxuICB0aGlzLl8kY29udGVudCA9IHRoaXMuXyRtb2RhbC5maW5kKFwiLm1vZGFsLWNvbnRlbnRzXCIpO1xyXG4gIHRoaXMuXyRjYXB0aW9uID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIubW9kYWwtY2FwdGlvblwiKTtcclxuICB0aGlzLl8kaW1hZ2VDb250YWluZXIgPSB0aGlzLl8kbW9kYWwuZmluZChcIi5tb2RhbC1pbWFnZVwiKTtcclxuICB0aGlzLl8kaW1hZ2VMZWZ0ID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIuaW1hZ2UtYWR2YW5jZS1sZWZ0XCIpO1xyXG4gIHRoaXMuXyRpbWFnZVJpZ2h0ID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIuaW1hZ2UtYWR2YW5jZS1yaWdodFwiKTtcclxuXHJcbiAgdGhpcy5faW5kZXggPSAwOyAvLyBJbmRleCBvZiBzZWxlY3RlZCBpbWFnZVxyXG4gIHRoaXMuX2lzT3BlbiA9IGZhbHNlO1xyXG5cclxuICB0aGlzLl8kaW1hZ2VMZWZ0Lm9uKFwiY2xpY2tcIiwgdGhpcy5hZHZhbmNlTGVmdC5iaW5kKHRoaXMpKTtcclxuICB0aGlzLl8kaW1hZ2VSaWdodC5vbihcImNsaWNrXCIsIHRoaXMuYWR2YW5jZVJpZ2h0LmJpbmQodGhpcykpO1xyXG4gICQoZG9jdW1lbnQpLm9uKFwia2V5ZG93blwiLCB0aGlzLl9vbktleURvd24uYmluZCh0aGlzKSk7XHJcblxyXG4gIC8vIEdpdmUgalF1ZXJ5IGNvbnRyb2wgb3ZlciBzaG93aW5nL2hpZGluZ1xyXG4gIHRoaXMuXyRtb2RhbC5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XHJcbiAgdGhpcy5fJG1vZGFsLmhpZGUoKTtcclxuXHJcbiAgLy8gRXZlbnRzXHJcbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xyXG4gIHRoaXMuXyRvdmVybGF5Lm9uKFwiY2xpY2tcIiwgdGhpcy5jbG9zZS5iaW5kKHRoaXMpKTtcclxuICB0aGlzLl8kbW9kYWwuZmluZChcIi5tb2RhbC1jbG9zZVwiKS5vbihcImNsaWNrXCIsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XHJcblxyXG4gIHRoaXMuX3VwZGF0ZUNvbnRyb2xzKCk7XHJcblxyXG4gIC8vIFNpemUgb2YgZm9udGF3ZXNvbWUgaWNvbnMgbmVlZHMgYSBzbGlnaHQgZGVsYXkgKHVudGlsIHN0YWNrIGlzIGNsZWFyKSBmb3JcclxuICAvLyBzb21lIHJlYXNvblxyXG4gIHNldFRpbWVvdXQoXHJcbiAgICBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5fb25SZXNpemUoKTtcclxuICAgIH0uYmluZCh0aGlzKSxcclxuICAgIDBcclxuICApO1xyXG59XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUuYWR2YW5jZUxlZnQgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLnNob3dJbWFnZUF0KHRoaXMuX2luZGV4IC0gMSk7XHJcbn07XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUuYWR2YW5jZVJpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5zaG93SW1hZ2VBdCh0aGlzLl9pbmRleCArIDEpO1xyXG59O1xyXG5cclxuU2xpZGVzaG93TW9kYWwucHJvdG90eXBlLnNob3dJbWFnZUF0ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICBpbmRleCA9IE1hdGgubWF4KGluZGV4LCAwKTtcclxuICBpbmRleCA9IE1hdGgubWluKGluZGV4LCB0aGlzLl9zbGlkZXNob3cuZ2V0TnVtSW1hZ2VzKCkgLSAxKTtcclxuICB0aGlzLl9pbmRleCA9IGluZGV4O1xyXG4gIHZhciAkaW1nID0gdGhpcy5fc2xpZGVzaG93LmdldEdhbGxlcnlJbWFnZSh0aGlzLl9pbmRleCk7XHJcbiAgdmFyIGNhcHRpb24gPSB0aGlzLl9zbGlkZXNob3cuZ2V0Q2FwdGlvbih0aGlzLl9pbmRleCk7XHJcblxyXG4gIHRoaXMuXyRpbWFnZUNvbnRhaW5lci5lbXB0eSgpO1xyXG4gICQoXCI8aW1nPlwiLCB7IHNyYzogJGltZy5hdHRyKFwic3JjXCIpIH0pLmFwcGVuZFRvKHRoaXMuXyRpbWFnZUNvbnRhaW5lcik7XHJcblxyXG4gIHRoaXMuXyRjYXB0aW9uLmVtcHR5KCk7XHJcbiAgaWYgKGNhcHRpb24pIHtcclxuICAgICQoXCI8c3Bhbj5cIilcclxuICAgICAgLmFkZENsYXNzKFwiZmlndXJlLW51bWJlclwiKVxyXG4gICAgICAudGV4dChcIkZpZy4gXCIgKyAodGhpcy5faW5kZXggKyAxKSArIFwiOiBcIilcclxuICAgICAgLmFwcGVuZFRvKHRoaXMuXyRjYXB0aW9uKTtcclxuICAgICQoXCI8c3Bhbj5cIilcclxuICAgICAgLmFkZENsYXNzKFwiY2FwdGlvbi10ZXh0XCIpXHJcbiAgICAgIC50ZXh0KGNhcHRpb24pXHJcbiAgICAgIC5hcHBlbmRUbyh0aGlzLl8kY2FwdGlvbik7XHJcbiAgfVxyXG5cclxuICB0aGlzLl9vblJlc2l6ZSgpO1xyXG4gIHRoaXMuX3VwZGF0ZUNvbnRyb2xzKCk7XHJcbn07XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgaW5kZXggPSBpbmRleCB8fCAwO1xyXG4gIHRoaXMuXyRtb2RhbC5zaG93KCk7XHJcbiAgdGhpcy5zaG93SW1hZ2VBdChpbmRleCk7XHJcbiAgdGhpcy5faXNPcGVuID0gdHJ1ZTtcclxufTtcclxuXHJcblNsaWRlc2hvd01vZGFsLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuXyRtb2RhbC5oaWRlKCk7XHJcbiAgdGhpcy5faXNPcGVuID0gZmFsc2U7XHJcbn07XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUuX29uS2V5RG93biA9IGZ1bmN0aW9uKGUpIHtcclxuICBpZiAoIXRoaXMuX2lzT3BlbikgcmV0dXJuO1xyXG4gIGlmIChlLndoaWNoID09PSBLRVlfQ09ERVMuTEVGVF9BUlJPVykge1xyXG4gICAgdGhpcy5hZHZhbmNlTGVmdCgpO1xyXG4gIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gS0VZX0NPREVTLlJJR0hUX0FSUk9XKSB7XHJcbiAgICB0aGlzLmFkdmFuY2VSaWdodCgpO1xyXG4gIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gS0VZX0NPREVTLkVTQ0FQRSkge1xyXG4gICAgdGhpcy5jbG9zZSgpO1xyXG4gIH1cclxufTtcclxuXHJcblNsaWRlc2hvd01vZGFsLnByb3RvdHlwZS5fdXBkYXRlQ29udHJvbHMgPSBmdW5jdGlvbigpIHtcclxuICAvLyBSZS1lbmFibGVcclxuICB0aGlzLl8kaW1hZ2VSaWdodC5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIHRoaXMuXyRpbWFnZUxlZnQucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuXHJcbiAgLy8gRGlzYWJsZSBpZiB3ZSd2ZSByZWFjaGVkIHRoZSB0aGUgbWF4IG9yIG1pbiBsaW1pdFxyXG4gIGlmICh0aGlzLl9pbmRleCA+PSB0aGlzLl9zbGlkZXNob3cuZ2V0TnVtSW1hZ2VzKCkgLSAxKSB7XHJcbiAgICB0aGlzLl8kaW1hZ2VSaWdodC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIH0gZWxzZSBpZiAodGhpcy5faW5kZXggPD0gMCkge1xyXG4gICAgdGhpcy5fJGltYWdlTGVmdC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIH1cclxufTtcclxuXHJcblNsaWRlc2hvd01vZGFsLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgJGltYWdlID0gdGhpcy5fJGltYWdlQ29udGFpbmVyLmZpbmQoXCJpbWdcIik7XHJcblxyXG4gIC8vIFJlc2V0IHRoZSBjb250ZW50J3Mgd2lkdGhcclxuICB0aGlzLl8kY29udGVudC53aWR0aChcIlwiKTtcclxuXHJcbiAgLy8gRmluZCB0aGUgc2l6ZSBvZiB0aGUgY29tcG9uZW50cyB0aGF0IG5lZWQgdG8gYmUgZGlzcGxheWVkIGluIGFkZGl0aW9uIHRvXHJcbiAgLy8gdGhlIGltYWdlXHJcbiAgdmFyIGNvbnRyb2xzV2lkdGggPSB0aGlzLl8kaW1hZ2VMZWZ0Lm91dGVyV2lkdGgodHJ1ZSkgKyB0aGlzLl8kaW1hZ2VSaWdodC5vdXRlcldpZHRoKHRydWUpO1xyXG4gIC8vIEhhY2sgZm9yIG5vdyAtIGJ1ZGdldCBmb3IgMnggdGhlIGNhcHRpb24gaGVpZ2h0LlxyXG4gIHZhciBjYXB0aW9uSGVpZ2h0ID0gMiAqIHRoaXMuXyRjYXB0aW9uLm91dGVySGVpZ2h0KHRydWUpO1xyXG4gIC8vIHZhciBpbWFnZVBhZGRpbmcgPSAkaW1hZ2UuaW5uZXJXaWR0aCgpO1xyXG5cclxuICAvLyBDYWxjdWxhdGUgdGhlIGF2YWlsYWJsZSBhcmVhIGZvciB0aGUgbW9kYWxcclxuICB2YXIgbXcgPSB0aGlzLl8kbW9kYWwud2lkdGgoKSAtIGNvbnRyb2xzV2lkdGg7XHJcbiAgdmFyIG1oID0gdGhpcy5fJG1vZGFsLmhlaWdodCgpIC0gY2FwdGlvbkhlaWdodDtcclxuXHJcbiAgLy8gRml0IHRoZSBpbWFnZSB0byB0aGUgcmVtYWluaW5nIHNjcmVlbiByZWFsIGVzdGF0ZVxyXG4gIHZhciBzZXRTaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaXcgPSAkaW1hZ2UucHJvcChcIm5hdHVyYWxXaWR0aFwiKTtcclxuICAgIHZhciBpaCA9ICRpbWFnZS5wcm9wKFwibmF0dXJhbEhlaWdodFwiKTtcclxuICAgIHZhciBzdyA9IGl3IC8gbXc7XHJcbiAgICB2YXIgc2ggPSBpaCAvIG1oO1xyXG4gICAgdmFyIHMgPSBNYXRoLm1heChzdywgc2gpO1xyXG5cclxuICAgIC8vIFNldCB3aWR0aC9oZWlnaHQgdXNpbmcgQ1NTIGluIG9yZGVyIHRvIHJlc3BlY3QgYm94LXNpemluZ1xyXG4gICAgaWYgKHMgPiAxKSB7XHJcbiAgICAgICRpbWFnZS5jc3MoXCJ3aWR0aFwiLCBpdyAvIHMgKyBcInB4XCIpO1xyXG4gICAgICAkaW1hZ2UuY3NzKFwiaGVpZ2h0XCIsIGloIC8gcyArIFwicHhcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkaW1hZ2UuY3NzKFwid2lkdGhcIiwgaXcgKyBcInB4XCIpO1xyXG4gICAgICAkaW1hZ2UuY3NzKFwiaGVpZ2h0XCIsIGloICsgXCJweFwiKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl8kaW1hZ2VSaWdodC5jc3MoXCJ0b3BcIiwgJGltYWdlLm91dGVySGVpZ2h0KCkgLyAyICsgXCJweFwiKTtcclxuICAgIHRoaXMuXyRpbWFnZUxlZnQuY3NzKFwidG9wXCIsICRpbWFnZS5vdXRlckhlaWdodCgpIC8gMiArIFwicHhcIik7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBjb250ZW50IHdyYXBwZXIgdG8gYmUgdGhlIHdpZHRoIG9mIHRoZSBpbWFnZS4gVGhpcyB3aWxsIGtlZXBcclxuICAgIC8vIHRoZSBjYXB0aW9uIGZyb20gZXhwYW5kaW5nIGJleW9uZCB0aGUgaW1hZ2UuXHJcbiAgICB0aGlzLl8kY29udGVudC53aWR0aCgkaW1hZ2Uub3V0ZXJXaWR0aCh0cnVlKSk7XHJcbiAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICBpZiAoJGltYWdlLnByb3AoXCJjb21wbGV0ZVwiKSkgc2V0U2l6ZSgpO1xyXG4gIGVsc2UgJGltYWdlLm9uZShcImxvYWRcIiwgc2V0U2l6ZSk7XHJcbn07XHJcbiIsInZhciBTbGlkZXNob3dNb2RhbCA9IHJlcXVpcmUoXCIuL3NsaWRlc2hvdy1tb2RhbC5qc1wiKTtcclxudmFyIFRodW1ibmFpbFNsaWRlciA9IHJlcXVpcmUoXCIuL3RodW1ibmFpbC1zbGlkZXIuanNcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBpbml0OiBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkID8gdHJhbnNpdGlvbkR1cmF0aW9uIDogNDAwO1xyXG4gICAgdGhpcy5fc2xpZGVzaG93cyA9IFtdO1xyXG4gICAgJChcIi5zbGlkZXNob3dcIikuZWFjaChcclxuICAgICAgZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgc2xpZGVzaG93ID0gbmV3IFNsaWRlc2hvdygkKGVsZW1lbnQpLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xyXG4gICAgICAgIHRoaXMuX3NsaWRlc2hvd3MucHVzaChzbGlkZXNob3cpO1xyXG4gICAgICB9LmJpbmQodGhpcylcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG5cclxuZnVuY3Rpb24gU2xpZGVzaG93KCRjb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbjtcclxuICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICB0aGlzLl9pbmRleCA9IDA7IC8vIEluZGV4IG9mIHNlbGVjdGVkIGltYWdlXHJcblxyXG4gIC8vIENyZWF0ZSBjb21wb25lbnRzXHJcbiAgdGhpcy5fdGh1bWJuYWlsU2xpZGVyID0gbmV3IFRodW1ibmFpbFNsaWRlcigkY29udGFpbmVyLCB0aGlzKTtcclxuICB0aGlzLl9tb2RhbCA9IG5ldyBTbGlkZXNob3dNb2RhbCgkY29udGFpbmVyLCB0aGlzKTtcclxuXHJcbiAgLy8gQ2FjaGUgYW5kIGNyZWF0ZSBuZWNlc3NhcnkgRE9NIGVsZW1lbnRzXHJcbiAgdGhpcy5fJGNhcHRpb25Db250YWluZXIgPSAkY29udGFpbmVyLmZpbmQoXCIuY2FwdGlvblwiKTtcclxuICB0aGlzLl8kc2VsZWN0ZWRJbWFnZUNvbnRhaW5lciA9ICRjb250YWluZXIuZmluZChcIi5zZWxlY3RlZC1pbWFnZVwiKTtcclxuXHJcbiAgLy8gT3BlbiBtb2RhbCBvbiBjbGlja2luZyBzZWxlY3RlZCBpbWFnZVxyXG4gIHRoaXMuXyRzZWxlY3RlZEltYWdlQ29udGFpbmVyLm9uKFxyXG4gICAgXCJjbGlja1wiLFxyXG4gICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuX21vZGFsLm9wZW4odGhpcy5faW5kZXgpO1xyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxuXHJcbiAgLy8gTG9hZCBpbWFnZXNcclxuICB0aGlzLl8kZ2FsbGVyeUltYWdlcyA9IHRoaXMuX2xvYWRHYWxsZXJ5SW1hZ2VzKCk7XHJcbiAgdGhpcy5fbnVtSW1hZ2VzID0gdGhpcy5fJGdhbGxlcnlJbWFnZXMubGVuZ3RoO1xyXG5cclxuICAvLyBTaG93IHRoZSBmaXJzdCBpbWFnZVxyXG4gIHRoaXMuc2hvd0ltYWdlKDApO1xyXG59XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldEFjdGl2ZUluZGV4ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMuX2luZGV4O1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXROdW1JbWFnZXMgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5fbnVtSW1hZ2VzO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXRHYWxsZXJ5SW1hZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIHJldHVybiB0aGlzLl8kZ2FsbGVyeUltYWdlc1tpbmRleF07XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldENhcHRpb24gPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIHJldHVybiB0aGlzLl8kZ2FsbGVyeUltYWdlc1tpbmRleF0uZGF0YShcImNhcHRpb25cIik7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLnNob3dJbWFnZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgLy8gUmVzZXQgYWxsIGltYWdlcyB0byBpbnZpc2libGUgYW5kIGxvd2VzdCB6LWluZGV4LiBUaGlzIGNvdWxkIGJlIHNtYXJ0ZXIsXHJcbiAgLy8gbGlrZSBIb3ZlclNsaWRlc2hvdywgYW5kIG9ubHkgcmVzZXQgZXhhY3RseSB3aGF0IHdlIG5lZWQsIGJ1dCB3ZSBhcmVuJ3RcclxuICAvLyB3YXN0aW5nIHRoYXQgbWFueSBjeWNsZXMuXHJcbiAgdGhpcy5fJGdhbGxlcnlJbWFnZXMuZm9yRWFjaChmdW5jdGlvbigkZ2FsbGVyeUltYWdlKSB7XHJcbiAgICAkZ2FsbGVyeUltYWdlLmNzcyh7XHJcbiAgICAgIHpJbmRleDogMCxcclxuICAgICAgb3BhY2l0eTogMFxyXG4gICAgfSk7XHJcbiAgICAkZ2FsbGVyeUltYWdlLnZlbG9jaXR5KFwic3RvcFwiKTsgLy8gU3RvcCBhbnkgYW5pbWF0aW9uc1xyXG4gIH0sIHRoaXMpO1xyXG5cclxuICAvLyBDYWNoZSByZWZlcmVuY2VzIHRvIHRoZSBsYXN0IGFuZCBjdXJyZW50IGltYWdlXHJcbiAgdmFyICRsYXN0SW1hZ2UgPSB0aGlzLl8kZ2FsbGVyeUltYWdlc1t0aGlzLl9pbmRleF07XHJcbiAgdmFyICRjdXJyZW50SW1hZ2UgPSB0aGlzLl8kZ2FsbGVyeUltYWdlc1tpbmRleF07XHJcbiAgdGhpcy5faW5kZXggPSBpbmRleDtcclxuXHJcbiAgLy8gTWFrZSB0aGUgbGFzdCBpbWFnZSB2aXNpc2JsZSBhbmQgdGhlbiBhbmltYXRlIHRoZSBjdXJyZW50IGltYWdlIGludG8gdmlld1xyXG4gIC8vIG9uIHRvcCBvZiB0aGUgbGFzdFxyXG4gICRsYXN0SW1hZ2UuY3NzKFwiekluZGV4XCIsIDEpO1xyXG4gICRjdXJyZW50SW1hZ2UuY3NzKFwiekluZGV4XCIsIDIpO1xyXG4gICRsYXN0SW1hZ2UuY3NzKFwib3BhY2l0eVwiLCAxKTtcclxuICAkY3VycmVudEltYWdlLnZlbG9jaXR5KHsgb3BhY2l0eTogMSB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFwiZWFzZUluT3V0UXVhZFwiKTtcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSBjYXB0aW9uLCBpZiBpdCBleGlzdHMgb24gdGhlIHRodW1ibmFpbFxyXG4gIHZhciBjYXB0aW9uID0gJGN1cnJlbnRJbWFnZS5kYXRhKFwiY2FwdGlvblwiKTtcclxuICBpZiAoY2FwdGlvbikge1xyXG4gICAgdGhpcy5fJGNhcHRpb25Db250YWluZXIuZW1wdHkoKTtcclxuICAgICQoXCI8c3Bhbj5cIilcclxuICAgICAgLmFkZENsYXNzKFwiZmlndXJlLW51bWJlclwiKVxyXG4gICAgICAudGV4dChcIkZpZy4gXCIgKyAodGhpcy5faW5kZXggKyAxKSArIFwiOiBcIilcclxuICAgICAgLmFwcGVuZFRvKHRoaXMuXyRjYXB0aW9uQ29udGFpbmVyKTtcclxuICAgICQoXCI8c3Bhbj5cIilcclxuICAgICAgLmFkZENsYXNzKFwiY2FwdGlvbi10ZXh0XCIpXHJcbiAgICAgIC50ZXh0KGNhcHRpb24pXHJcbiAgICAgIC5hcHBlbmRUbyh0aGlzLl8kY2FwdGlvbkNvbnRhaW5lcik7XHJcbiAgfVxyXG5cclxuICAvLyBPYmplY3QgaW1hZ2UgZml0IHBvbHlmaWxsIGJyZWFrcyBqUXVlcnkgYXR0ciguLi4pLCBzbyBmYWxsYmFjayB0byBqdXN0XHJcbiAgLy8gdXNpbmcgZWxlbWVudC5zcmNcclxuICAvLyBUT0RPOiBMYXp5IVxyXG4gIC8vIGlmICgkY3VycmVudEltYWdlLmdldCgwKS5zcmMgPT09IFwiXCIpIHtcclxuICAvLyAgICAgJGN1cnJlbnRJbWFnZS5nZXQoMCkuc3JjID0gJGN1cnJlbnRJbWFnZS5kYXRhKFwiaW1hZ2UtdXJsXCIpO1xyXG4gIC8vIH1cclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX2xvYWRHYWxsZXJ5SW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gQ3JlYXRlIGVtcHR5IGltYWdlcyBpbiB0aGUgZ2FsbGVyeSBmb3IgZWFjaCB0aHVtYm5haWwuIFRoaXMgaGVscHMgdXMgZG9cclxuICAvLyBsYXp5IGxvYWRpbmcgb2YgZ2FsbGVyeSBpbWFnZXMgYW5kIGFsbG93cyB1cyB0byBjcm9zcy1mYWRlIGltYWdlcy5cclxuICB2YXIgJGdhbGxlcnlJbWFnZXMgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3RodW1ibmFpbFNsaWRlci5nZXROdW1UaHVtYm5haWxzKCk7IGkgKz0gMSkge1xyXG4gICAgLy8gR2V0IHRoZSB0aHVtYm5haWwgZWxlbWVudCB3aGljaCBoYXMgcGF0aCBhbmQgY2FwdGlvbiBkYXRhXHJcbiAgICB2YXIgJHRodW1iID0gdGhpcy5fdGh1bWJuYWlsU2xpZGVyLmdldCRUaHVtYm5haWwoaSk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBpZCBmcm9tIHRoZSBwYXRoIHRvIHRoZSBsYXJnZSBpbWFnZVxyXG4gICAgdmFyIGxhcmdlUGF0aCA9ICR0aHVtYi5kYXRhKFwibGFyZ2UtcGF0aFwiKTtcclxuICAgIHZhciBpZCA9IGxhcmdlUGF0aFxyXG4gICAgICAuc3BsaXQoXCIvXCIpXHJcbiAgICAgIC5wb3AoKVxyXG4gICAgICAuc3BsaXQoXCIuXCIpWzBdO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIGdhbGxlcnkgaW1hZ2UgZWxlbWVudFxyXG4gICAgdmFyICRnYWxsZXJ5SW1hZ2UgPSAkKFwiPGltZz5cIiwgeyBpZDogaWQgfSlcclxuICAgICAgLmNzcyh7XHJcbiAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICB0b3A6IFwiMHB4XCIsXHJcbiAgICAgICAgbGVmdDogXCIwcHhcIixcclxuICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgIHpJbmRleDogMFxyXG4gICAgICB9KVxyXG4gICAgICAuZGF0YShcImltYWdlLXVybFwiLCBsYXJnZVBhdGgpXHJcbiAgICAgIC5kYXRhKFwiY2FwdGlvblwiLCAkdGh1bWIuZGF0YShcImNhcHRpb25cIikpXHJcbiAgICAgIC5hcHBlbmRUbyh0aGlzLl8kc2VsZWN0ZWRJbWFnZUNvbnRhaW5lcik7XHJcbiAgICAkZ2FsbGVyeUltYWdlLmdldCgwKS5zcmMgPSBsYXJnZVBhdGg7IC8vIFRPRE86IE1ha2UgdGhpcyBsYXp5IVxyXG4gICAgJGdhbGxlcnlJbWFnZXMucHVzaCgkZ2FsbGVyeUltYWdlKTtcclxuICB9XHJcbiAgcmV0dXJuICRnYWxsZXJ5SW1hZ2VzO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFRodW1ibmFpbFNsaWRlcjtcclxuXHJcbmZ1bmN0aW9uIFRodW1ibmFpbFNsaWRlcigkY29udGFpbmVyLCBzbGlkZXNob3cpIHtcclxuICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICB0aGlzLl9zbGlkZXNob3cgPSBzbGlkZXNob3c7XHJcblxyXG4gIHRoaXMuX2luZGV4ID0gMDsgLy8gSW5kZXggb2Ygc2VsZWN0ZWQgdGh1bWJuYWlsXHJcbiAgdGhpcy5fc2Nyb2xsSW5kZXggPSAwOyAvLyBJbmRleCBvZiB0aGUgdGh1bWJuYWlsIHRoYXQgaXMgY3VycmVudGx5IGNlbnRlcmVkXHJcblxyXG4gIC8vIENhY2hlIGFuZCBjcmVhdGUgbmVjZXNzYXJ5IERPTSBlbGVtZW50c1xyXG4gIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIgPSAkY29udGFpbmVyLmZpbmQoXCIudGh1bWJuYWlsc1wiKTtcclxuICB0aGlzLl8kdGh1bWJuYWlsSW1hZ2VzID0gdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci5maW5kKFwiaW1nXCIpO1xyXG4gIHRoaXMuXyR2aXNpYmxlVGh1bWJuYWlsV3JhcCA9ICRjb250YWluZXIuZmluZChcIi52aXNpYmxlLXRodW1ibmFpbHNcIik7XHJcbiAgdGhpcy5fJGFkdmFuY2VMZWZ0ID0gJGNvbnRhaW5lci5maW5kKFwiLnRodW1ibmFpbC1hZHZhbmNlLWxlZnRcIik7XHJcbiAgdGhpcy5fJGFkdmFuY2VSaWdodCA9ICRjb250YWluZXIuZmluZChcIi50aHVtYm5haWwtYWR2YW5jZS1yaWdodFwiKTtcclxuXHJcbiAgLy8gTG9vcCB0aHJvdWdoIHRoZSB0aHVtYm5haWxzLCBnaXZlIHRoZW0gYW4gaW5kZXggZGF0YSBhdHRyaWJ1dGUgYW5kIGNhY2hlXHJcbiAgLy8gYSByZWZlcmVuY2UgdG8gdGhlbSBpbiBhbiBhcnJheVxyXG4gIHRoaXMuXyR0aHVtYm5haWxzID0gW107XHJcbiAgdGhpcy5fJHRodW1ibmFpbEltYWdlcy5lYWNoKFxyXG4gICAgZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgdmFyICR0aHVtYm5haWwgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAkdGh1bWJuYWlsLmRhdGEoXCJpbmRleFwiLCBpbmRleCk7XHJcbiAgICAgIHRoaXMuXyR0aHVtYm5haWxzLnB1c2goJHRodW1ibmFpbCk7XHJcbiAgICB9LmJpbmQodGhpcylcclxuICApO1xyXG4gIHRoaXMuX251bUltYWdlcyA9IHRoaXMuXyR0aHVtYm5haWxzLmxlbmd0aDtcclxuXHJcbiAgLy8gTGVmdC9yaWdodCBjb250cm9sc1xyXG4gIHRoaXMuXyRhZHZhbmNlTGVmdC5vbihcImNsaWNrXCIsIHRoaXMuYWR2YW5jZUxlZnQuYmluZCh0aGlzKSk7XHJcbiAgdGhpcy5fJGFkdmFuY2VSaWdodC5vbihcImNsaWNrXCIsIHRoaXMuYWR2YW5jZVJpZ2h0LmJpbmQodGhpcykpO1xyXG5cclxuICAvLyBDbGlja2luZyBhIHRodW1ibmFpbFxyXG4gIHRoaXMuXyR0aHVtYm5haWxJbWFnZXMub24oXCJjbGlja1wiLCB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICB0aGlzLl9hY3RpdmF0ZVRodW1ibmFpbCgwKTtcclxuXHJcbiAgLy8gUmVzaXplXHJcbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xyXG5cclxuICAvLyBGb3Igc29tZSByZWFzb24sIHRoZSBzaXppbmcgb24gdGhlIGNvbnRyb2xzIGlzIG1lc3NlZCB1cCBpZiBpdCBydW5zXHJcbiAgLy8gaW1tZWRpYXRlbHkgLSBkZWxheSBzaXppbmcgdW50aWwgc3RhY2sgaXMgY2xlYXJcclxuICBzZXRUaW1lb3V0KFxyXG4gICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuX29uUmVzaXplKCk7XHJcbiAgICB9LmJpbmQodGhpcyksXHJcbiAgICAwXHJcbiAgKTtcclxufVxyXG5cclxuVGh1bWJuYWlsU2xpZGVyLnByb3RvdHlwZS5nZXRBY3RpdmVJbmRleCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLl9pbmRleDtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuZ2V0TnVtVGh1bWJuYWlscyA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLl9udW1JbWFnZXM7XHJcbn07XHJcblxyXG5UaHVtYm5haWxTbGlkZXIucHJvdG90eXBlLmdldCRUaHVtYm5haWwgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIHJldHVybiB0aGlzLl8kdGh1bWJuYWlsc1tpbmRleF07XHJcbn07XHJcblxyXG5UaHVtYm5haWxTbGlkZXIucHJvdG90eXBlLmFkdmFuY2VMZWZ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG5ld0luZGV4ID0gdGhpcy5fc2Nyb2xsSW5kZXggLSB0aGlzLl9udW1WaXNpYmxlO1xyXG4gIG5ld0luZGV4ID0gTWF0aC5tYXgobmV3SW5kZXgsIDApO1xyXG4gIHRoaXMuX3Njcm9sbFRvVGh1bWJuYWlsKG5ld0luZGV4KTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuYWR2YW5jZVJpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG5ld0luZGV4ID0gdGhpcy5fc2Nyb2xsSW5kZXggKyB0aGlzLl9udW1WaXNpYmxlO1xyXG4gIG5ld0luZGV4ID0gTWF0aC5taW4obmV3SW5kZXgsIHRoaXMuX251bUltYWdlcyAtIDEpO1xyXG4gIHRoaXMuX3Njcm9sbFRvVGh1bWJuYWlsKG5ld0luZGV4KTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX3Jlc2V0U2l6aW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gUmVzZXQgc2l6aW5nIHZhcmlhYmxlcy4gVGhpcyBpbmNsdWRlcyByZXNldHRpbmcgYW55IGlubGluZSBzdHlsZSB0aGF0IGhhc1xyXG4gIC8vIGJlZW4gYXBwbGllZCwgc28gdGhhdCBhbnkgc2l6ZSBjYWxjdWxhdGlvbnMgY2FuIGJlIGJhc2VkIG9uIHRoZSBDU1NcclxuICAvLyBzdHlsaW5nLlxyXG4gIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIuY3NzKHtcclxuICAgIHRvcDogXCJcIixcclxuICAgIGxlZnQ6IFwiXCIsXHJcbiAgICB3aWR0aDogXCJcIixcclxuICAgIGhlaWdodDogXCJcIlxyXG4gIH0pO1xyXG4gIHRoaXMuXyR2aXNpYmxlVGh1bWJuYWlsV3JhcC53aWR0aChcIlwiKTtcclxuICB0aGlzLl8kdmlzaWJsZVRodW1ibmFpbFdyYXAuaGVpZ2h0KFwiXCIpO1xyXG4gIC8vIE1ha2UgYWxsIHRodW1ibmFpbHMgc3F1YXJlIGFuZCByZXNldCBhbnkgaGVpZ2h0XHJcbiAgdGhpcy5fJHRodW1ibmFpbHMuZm9yRWFjaChmdW5jdGlvbigkZWxlbWVudCkge1xyXG4gICAgJGVsZW1lbnQuaGVpZ2h0KFwiXCIpOyAvLyBSZXNldCBoZWlnaHQgYmVmb3JlIHNldHRpbmcgd2lkdGhcclxuICAgICRlbGVtZW50LndpZHRoKCRlbGVtZW50LmhlaWdodCgpKTtcclxuICB9KTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5fcmVzZXRTaXppbmcoKTtcclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRoZSBzaXplIG9mIHRoZSBmaXJzdCB0aHVtYm5haWwuIFRoaXMgYXNzdW1lcyB0aGUgZmlyc3QgaW1hZ2VcclxuICAvLyBvbmx5IGhhcyBhIHJpZ2h0LXNpZGUgbWFyZ2luLlxyXG4gIHZhciAkZmlyc3RUaHVtYiA9IHRoaXMuXyR0aHVtYm5haWxzWzBdO1xyXG4gIHZhciB0aHVtYlNpemUgPSAkZmlyc3RUaHVtYi5vdXRlckhlaWdodChmYWxzZSk7XHJcbiAgdmFyIHRodW1iTWFyZ2luID0gMiAqICgkZmlyc3RUaHVtYi5vdXRlcldpZHRoKHRydWUpIC0gdGh1bWJTaXplKTtcclxuXHJcbiAgLy8gTWVhc3VyZSBjb250cm9scy4gVGhleSBuZWVkIHRvIGJlIHZpc2libGUgaW4gb3JkZXIgdG8gYmUgbWVhc3VyZWQuXHJcbiAgdGhpcy5fJGFkdmFuY2VSaWdodC5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XHJcbiAgdGhpcy5fJGFkdmFuY2VMZWZ0LmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcclxuICB2YXIgdGh1bWJDb250cm9sV2lkdGggPVxyXG4gICAgdGhpcy5fJGFkdmFuY2VSaWdodC5vdXRlcldpZHRoKHRydWUpICsgdGhpcy5fJGFkdmFuY2VMZWZ0Lm91dGVyV2lkdGgodHJ1ZSk7XHJcblxyXG4gIC8vIENhbGN1bGF0ZSBob3cgbWFueSBmdWxsIHRodW1ibmFpbHMgY2FuIGZpdCB3aXRoaW4gdGhlIHRodW1ibmFpbCBhcmVhXHJcbiAgdmFyIHZpc2libGVXaWR0aCA9IHRoaXMuXyR2aXNpYmxlVGh1bWJuYWlsV3JhcC5vdXRlcldpZHRoKGZhbHNlKTtcclxuICB2YXIgbnVtVGh1bWJzVmlzaWJsZSA9IE1hdGguZmxvb3IoKHZpc2libGVXaWR0aCAtIHRodW1iTWFyZ2luKSAvICh0aHVtYlNpemUgKyB0aHVtYk1hcmdpbikpO1xyXG5cclxuICAvLyBDaGVjayB3aGV0aGVyIGFsbCB0aGUgdGh1bWJuYWlscyBjYW4gZml0IG9uIHRoZSBzY3JlZW4gYXQgb25jZVxyXG4gIGlmIChudW1UaHVtYnNWaXNpYmxlIDwgdGhpcy5fbnVtSW1hZ2VzKSB7XHJcbiAgICAvLyBUYWtlIGEgYmVzdCBndWVzcyBhdCBob3cgdG8gc2l6ZSB0aGUgdGh1bWJuYWlscy4gU2l6ZSBmb3JtdWxhOlxyXG4gICAgLy8gIHdpZHRoID0gbnVtICogdGh1bWJTaXplICsgKG51bSAtIDEpICogdGh1bWJNYXJnaW4gKyBjb250cm9sU2l6ZVxyXG4gICAgLy8gU29sdmUgZm9yIG51bWJlciBvZiB0aHVtYm5haWxzIGFuZCByb3VuZCB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyIHNvXHJcbiAgICAvLyB0aGF0IHdlIGRvbid0IGhhdmUgYW55IHBhcnRpYWwgdGh1bWJuYWlscyBzaG93aW5nLlxyXG4gICAgbnVtVGh1bWJzVmlzaWJsZSA9IE1hdGgucm91bmQoXHJcbiAgICAgICh2aXNpYmxlV2lkdGggLSB0aHVtYkNvbnRyb2xXaWR0aCArIHRodW1iTWFyZ2luKSAvICh0aHVtYlNpemUgKyB0aHVtYk1hcmdpbilcclxuICAgICk7XHJcblxyXG4gICAgLy8gVXNlIHRoaXMgbnVtYmVyIG9mIHRodW1ibmFpbHMgdG8gY2FsY3VsYXRlIHRoZSB0aHVtYm5haWwgc2l6ZVxyXG4gICAgdmFyIG5ld1NpemUgPSAodmlzaWJsZVdpZHRoIC0gdGh1bWJDb250cm9sV2lkdGggKyB0aHVtYk1hcmdpbikgLyBudW1UaHVtYnNWaXNpYmxlIC0gdGh1bWJNYXJnaW47XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlscy5mb3JFYWNoKGZ1bmN0aW9uKCRlbGVtZW50KSB7XHJcbiAgICAgIC8vICQud2lkdGggYW5kICQuaGVpZ2h0IHNldCB0aGUgY29udGVudCBzaXplIHJlZ2FyZGxlc3Mgb2YgdGhlXHJcbiAgICAgIC8vIGJveC1zaXppbmcuIFRoZSBpbWFnZXMgYXJlIGJvcmRlci1ib3gsIHNvIHdlIHdhbnQgdGhlIENTUyB3aWR0aFxyXG4gICAgICAvLyBhbmQgaGVpZ2h0LiBUaGlzIGFsbG93cyB0aGUgYWN0aXZlIGltYWdlIHRvIGhhdmUgYSBib3JkZXIgYW5kIHRoZVxyXG4gICAgICAvLyBvdGhlciBpbWFnZXMgdG8gaGF2ZSBwYWRkaW5nLlxyXG4gICAgICAkZWxlbWVudC5jc3MoXCJ3aWR0aFwiLCBuZXdTaXplICsgXCJweFwiKTtcclxuICAgICAgJGVsZW1lbnQuY3NzKFwiaGVpZ2h0XCIsIG5ld1NpemUgKyBcInB4XCIpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSB0aHVtYm5haWwgd3JhcCBzaXplLiBJdCBzaG91bGQgYmUganVzdCB0YWxsIGVub3VnaCB0byBmaXQgYVxyXG4gICAgLy8gdGh1bWJuYWlsIGFuZCBsb25nIGVub3VnaCB0byBob2xkIGFsbCB0aGUgdGh1bWJuYWlscyBpbiBvbmUgbGluZTpcclxuICAgIHZhciB0b3RhbFNpemUgPSBuZXdTaXplICogdGhpcy5fbnVtSW1hZ2VzICsgdGh1bWJNYXJnaW4gKiAodGhpcy5fbnVtSW1hZ2VzIC0gMSk7XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyLmNzcyh7XHJcbiAgICAgIHdpZHRoOiB0b3RhbFNpemUgKyBcInB4XCIsXHJcbiAgICAgIGhlaWdodDogJGZpcnN0VGh1bWIub3V0ZXJIZWlnaHQodHJ1ZSkgKyBcInB4XCJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldCB0aGUgdmlzaWJsZSB0aHVtYm5haWwgd3JhcCBzaXplLiBUaGlzIGlzIHVzZWQgdG8gbWFrcyB0aGUgbXVjaFxyXG4gICAgLy8gbGFyZ2VyIHRodW1ibmFpbCBjb250YWluZXIuIEl0IHNob3VsZCBiZSBhcyB3aWRlIGFzIGl0IGNhbiBiZSwgbWludXNcclxuICAgIC8vIHRoZSBzcGFjZSBuZWVkZWQgZm9yIHRoZSBsZWZ0L3JpZ2h0IGNvbnRvbHMuXHJcbiAgICB0aGlzLl8kdmlzaWJsZVRodW1ibmFpbFdyYXAuY3NzKHtcclxuICAgICAgd2lkdGg6IHZpc2libGVXaWR0aCAtIHRodW1iQ29udHJvbFdpZHRoICsgXCJweFwiLFxyXG4gICAgICBoZWlnaHQ6ICRmaXJzdFRodW1iLm91dGVySGVpZ2h0KHRydWUpICsgXCJweFwiXHJcbiAgICB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gQWxsIHRodW1ibmFpbHMgYXJlIHZpc2libGUsIHdlIGNhbiBoaWRlIHRoZSBjb250cm9scyBhbmQgZXhwYW5kIHRoZVxyXG4gICAgLy8gdGh1bWJuYWlsIGNvbnRhaW5lciB0byAxMDAlXHJcbiAgICBudW1UaHVtYnNWaXNpYmxlID0gdGhpcy5fbnVtSW1hZ2VzO1xyXG4gICAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci5jc3MoXCJ3aWR0aFwiLCBcIjEwMCVcIik7XHJcbiAgICB0aGlzLl8kYWR2YW5jZVJpZ2h0LmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgdGhpcy5fJGFkdmFuY2VMZWZ0LmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5fbnVtVmlzaWJsZSA9IG51bVRodW1ic1Zpc2libGU7XHJcbiAgdmFyIG1pZGRsZUluZGV4ID0gTWF0aC5mbG9vcigodGhpcy5fbnVtVmlzaWJsZSAtIDEpIC8gMik7XHJcbiAgdGhpcy5fc2Nyb2xsQm91bmRzID0ge1xyXG4gICAgbWluOiBtaWRkbGVJbmRleCxcclxuICAgIG1heDogdGhpcy5fbnVtSW1hZ2VzIC0gMSAtIG1pZGRsZUluZGV4XHJcbiAgfTtcclxuICBpZiAodGhpcy5fbnVtVmlzaWJsZSAlIDIgPT09IDApIHRoaXMuX3Njcm9sbEJvdW5kcy5tYXggLT0gMTtcclxuXHJcbiAgdGhpcy5fdXBkYXRlVGh1bWJuYWlsQ29udHJvbHMoKTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX2FjdGl2YXRlVGh1bWJuYWlsID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAvLyBBY3RpdmF0ZS9kZWFjdGl2YXRlIHRodW1ibmFpbHNcclxuICB0aGlzLl8kdGh1bWJuYWlsc1t0aGlzLl9pbmRleF0ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgdGhpcy5fJHRodW1ibmFpbHNbaW5kZXhdLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG59O1xyXG5cclxuVGh1bWJuYWlsU2xpZGVyLnByb3RvdHlwZS5fc2Nyb2xsVG9UaHVtYm5haWwgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIC8vIE5vIG5lZWQgdG8gc2Nyb2xsIGlmIGFsbCB0aHVtYm5haWxzIGFyZSB2aXNpYmxlXHJcbiAgaWYgKHRoaXMuX251bVZpc2libGUgPT09IHRoaXMuX251bUltYWdlcykgcmV0dXJuO1xyXG5cclxuICAvLyBDb25zdHJhaW4gaW5kZXggc28gdGhhdCB3ZSBjYW4ndCBzY3JvbGwgb3V0IG9mIGJvdW5kc1xyXG4gIGluZGV4ID0gTWF0aC5tYXgoaW5kZXgsIHRoaXMuX3Njcm9sbEJvdW5kcy5taW4pO1xyXG4gIGluZGV4ID0gTWF0aC5taW4oaW5kZXgsIHRoaXMuX3Njcm9sbEJvdW5kcy5tYXgpO1xyXG4gIHRoaXMuX3Njcm9sbEluZGV4ID0gaW5kZXg7XHJcblxyXG4gIC8vIEZpbmQgdGhlIFwibGVmdFwiIHBvc2l0aW9uIG9mIHRoZSB0aHVtYm5haWwgY29udGFpbmVyIHRoYXQgd291bGQgcHV0IHRoZVxyXG4gIC8vIHRodW1ibmFpbCBhdCBpbmRleCBhdCB0aGUgY2VudGVyXHJcbiAgdmFyICR0aHVtYiA9IHRoaXMuXyR0aHVtYm5haWxzWzBdO1xyXG4gIHZhciBzaXplID0gcGFyc2VGbG9hdCgkdGh1bWIuY3NzKFwid2lkdGhcIikpO1xyXG4gIHZhciBtYXJnaW4gPSAyICogcGFyc2VGbG9hdCgkdGh1bWIuY3NzKFwibWFyZ2luLXJpZ2h0XCIpKTtcclxuICB2YXIgY2VudGVyWCA9IHNpemUgKiB0aGlzLl9zY3JvbGxCb3VuZHMubWluICsgbWFyZ2luICogKHRoaXMuX3Njcm9sbEJvdW5kcy5taW4gLSAxKTtcclxuICB2YXIgdGh1bWJYID0gc2l6ZSAqIGluZGV4ICsgbWFyZ2luICogKGluZGV4IC0gMSk7XHJcbiAgdmFyIGxlZnQgPSBjZW50ZXJYIC0gdGh1bWJYO1xyXG5cclxuICAvLyBBbmltYXRlIHRoZSB0aHVtYm5haWwgY29udGFpbmVyXHJcbiAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci52ZWxvY2l0eShcclxuICAgIHtcclxuICAgICAgbGVmdDogbGVmdCArIFwicHhcIlxyXG4gICAgfSxcclxuICAgIDYwMCxcclxuICAgIFwiZWFzZUluT3V0UXVhZFwiXHJcbiAgKTtcclxuXHJcbiAgdGhpcy5fdXBkYXRlVGh1bWJuYWlsQ29udHJvbHMoKTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX29uQ2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuICB2YXIgaW5kZXggPSAkdGFyZ2V0LmRhdGEoXCJpbmRleFwiKTtcclxuXHJcbiAgLy8gQ2xpY2tlZCBvbiB0aGUgYWN0aXZlIGltYWdlIC0gbm8gbmVlZCB0byBkbyBhbnl0aGluZ1xyXG4gIGlmICh0aGlzLl9pbmRleCAhPT0gaW5kZXgpIHtcclxuICAgIHRoaXMuX2FjdGl2YXRlVGh1bWJuYWlsKGluZGV4KTtcclxuICAgIHRoaXMuX3Njcm9sbFRvVGh1bWJuYWlsKGluZGV4KTtcclxuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XHJcbiAgICB0aGlzLl9zbGlkZXNob3cuc2hvd0ltYWdlKGluZGV4KTtcclxuICB9XHJcbn07XHJcblxyXG5UaHVtYm5haWxTbGlkZXIucHJvdG90eXBlLl91cGRhdGVUaHVtYm5haWxDb250cm9scyA9IGZ1bmN0aW9uKCkge1xyXG4gIC8vIFJlLWVuYWJsZVxyXG4gIHRoaXMuXyRhZHZhbmNlTGVmdC5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIHRoaXMuXyRhZHZhbmNlUmlnaHQucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuXHJcbiAgLy8gRGlzYWJsZSBpZiB3ZSd2ZSByZWFjaGVkIHRoZSB0aGUgbWF4IG9yIG1pbiBsaW1pdFxyXG4gIC8vIHZhciBtaWRTY3JvbGxJbmRleCA9IE1hdGguZmxvb3IoKHRoaXMuX251bVZpc2libGUgLSAxKSAvIDIpO1xyXG4gIC8vIHZhciBtaW5TY3JvbGxJbmRleCA9IG1pZFNjcm9sbEluZGV4O1xyXG4gIC8vIHZhciBtYXhTY3JvbGxJbmRleCA9IHRoaXMuX251bUltYWdlcyAtIDEgLSBtaWRTY3JvbGxJbmRleDtcclxuICBpZiAodGhpcy5fc2Nyb2xsSW5kZXggPj0gdGhpcy5fc2Nyb2xsQm91bmRzLm1heCkge1xyXG4gICAgdGhpcy5fJGFkdmFuY2VSaWdodC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIH0gZWxzZSBpZiAodGhpcy5fc2Nyb2xsSW5kZXggPD0gdGhpcy5fc2Nyb2xsQm91bmRzLm1pbikge1xyXG4gICAgdGhpcy5fJGFkdmFuY2VMZWZ0LmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgfVxyXG59O1xyXG4iLCJleHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbih2YWwsIGRlZmF1bHRWYWwpIHtcclxuICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQgPyB2YWwgOiBkZWZhdWx0VmFsO1xyXG59O1xyXG5cclxuLy8gVW50ZXN0ZWRcclxuLy8gZXhwb3J0cy5kZWZhdWx0UHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmF1bHRQcm9wZXJ0aWVzIChvYmosIHByb3BzKSB7XHJcbi8vICAgICBmb3IgKHZhciBwcm9wIGluIHByb3BzKSB7XHJcbi8vICAgICAgICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KHByb3BzLCBwcm9wKSkge1xyXG4vLyAgICAgICAgICAgICB2YXIgdmFsdWUgPSBleHBvcnRzLmRlZmF1bHRWYWx1ZShwcm9wcy52YWx1ZSwgcHJvcHMuZGVmYXVsdCk7XHJcbi8vICAgICAgICAgICAgIG9ialtwcm9wXSA9IHZhbHVlO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgIH1cclxuLy8gICAgIHJldHVybiBvYmo7XHJcbi8vIH07XHJcbi8vXHJcbmV4cG9ydHMudGltZUl0ID0gZnVuY3Rpb24oZnVuYykge1xyXG4gIHZhciBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gIGZ1bmMoKTtcclxuICB2YXIgZW5kID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgcmV0dXJuIGVuZCAtIHN0YXJ0O1xyXG59O1xyXG5cclxuZXhwb3J0cy5pc0luUmVjdCA9IGZ1bmN0aW9uKHgsIHksIHJlY3QpIHtcclxuICBpZiAoeCA+PSByZWN0LnggJiYgeCA8PSByZWN0LnggKyByZWN0LncgJiYgeSA+PSByZWN0LnkgJiYgeSA8PSByZWN0LnkgKyByZWN0LmgpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5leHBvcnRzLnJhbmRJbnQgPSBmdW5jdGlvbihtaW4sIG1heCkge1xyXG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG59O1xyXG5cclxuZXhwb3J0cy5yYW5kQXJyYXlFbGVtZW50ID0gZnVuY3Rpb24oYXJyYXkpIHtcclxuICB2YXIgaSA9IGV4cG9ydHMucmFuZEludCgwLCBhcnJheS5sZW5ndGggLSAxKTtcclxuICByZXR1cm4gYXJyYXlbaV07XHJcbn07XHJcblxyXG5leHBvcnRzLm1hcCA9IGZ1bmN0aW9uKG51bSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Miwgb3B0aW9ucykge1xyXG4gIHZhciBtYXBwZWQgPSAobnVtIC0gbWluMSkgLyAobWF4MSAtIG1pbjEpICogKG1heDIgLSBtaW4yKSArIG1pbjI7XHJcbiAgaWYgKCFvcHRpb25zKSByZXR1cm4gbWFwcGVkO1xyXG4gIGlmIChvcHRpb25zLnJvdW5kICYmIG9wdGlvbnMucm91bmQgPT09IHRydWUpIHtcclxuICAgIG1hcHBlZCA9IE1hdGgucm91bmQobWFwcGVkKTtcclxuICB9XHJcbiAgaWYgKG9wdGlvbnMuZmxvb3IgJiYgb3B0aW9ucy5mbG9vciA9PT0gdHJ1ZSkge1xyXG4gICAgbWFwcGVkID0gTWF0aC5mbG9vcihtYXBwZWQpO1xyXG4gIH1cclxuICBpZiAob3B0aW9ucy5jZWlsICYmIG9wdGlvbnMuY2VpbCA9PT0gdHJ1ZSkge1xyXG4gICAgbWFwcGVkID0gTWF0aC5jZWlsKG1hcHBlZCk7XHJcbiAgfVxyXG4gIGlmIChvcHRpb25zLmNsYW1wICYmIG9wdGlvbnMuY2xhbXAgPT09IHRydWUpIHtcclxuICAgIG1hcHBlZCA9IE1hdGgubWluKG1hcHBlZCwgbWF4Mik7XHJcbiAgICBtYXBwZWQgPSBNYXRoLm1heChtYXBwZWQsIG1pbjIpO1xyXG4gIH1cclxuICByZXR1cm4gbWFwcGVkO1xyXG59O1xyXG5cclxuZXhwb3J0cy5nZXRRdWVyeVBhcmFtZXRlcnMgPSBmdW5jdGlvbigpIHtcclxuICAvLyBDaGVjayBmb3IgcXVlcnkgc3RyaW5nXHJcbiAgdmFyIHFzID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcclxuICBpZiAocXMubGVuZ3RoIDw9IDEpIHJldHVybiB7fTtcclxuICAvLyBRdWVyeSBzdHJpbmcgZXhpc3RzLCBwYXJzZSBpdCBpbnRvIGEgcXVlcnkgb2JqZWN0XHJcbiAgcXMgPSBxcy5zdWJzdHJpbmcoMSk7IC8vIFJlbW92ZSB0aGUgXCI/XCIgZGVsaW1pdGVyXHJcbiAgdmFyIGtleVZhbFBhaXJzID0gcXMuc3BsaXQoXCImXCIpO1xyXG4gIHZhciBxdWVyeU9iamVjdCA9IHt9O1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5VmFsUGFpcnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBrZXlWYWwgPSBrZXlWYWxQYWlyc1tpXS5zcGxpdChcIj1cIik7XHJcbiAgICBpZiAoa2V5VmFsLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICB2YXIga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleVZhbFswXSk7XHJcbiAgICAgIHZhciB2YWwgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5VmFsWzFdKTtcclxuICAgICAgcXVlcnlPYmplY3Rba2V5XSA9IHZhbDtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHF1ZXJ5T2JqZWN0O1xyXG59O1xyXG5cclxuZXhwb3J0cy5jcmVhdGVRdWVyeVN0cmluZyA9IGZ1bmN0aW9uKHF1ZXJ5T2JqZWN0KSB7XHJcbiAgaWYgKHR5cGVvZiBxdWVyeU9iamVjdCAhPT0gXCJvYmplY3RcIikgcmV0dXJuIFwiXCI7XHJcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhxdWVyeU9iamVjdCk7XHJcbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcclxuICB2YXIgcXVlcnlTdHJpbmcgPSBcIj9cIjtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xyXG4gICAgdmFyIHZhbCA9IHF1ZXJ5T2JqZWN0W2tleV07XHJcbiAgICBxdWVyeVN0cmluZyArPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbCk7XHJcbiAgICBpZiAoaSAhPT0ga2V5cy5sZW5ndGggLSAxKSBxdWVyeVN0cmluZyArPSBcIiZcIjtcclxuICB9XHJcbiAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0cy53cmFwSW5kZXggPSBmdW5jdGlvbihpbmRleCwgbGVuZ3RoKSB7XHJcbiAgdmFyIHdyYXBwZWRJbmRleCA9IGluZGV4ICUgbGVuZ3RoO1xyXG4gIGlmICh3cmFwcGVkSW5kZXggPCAwKSB7XHJcbiAgICAvLyBJZiBuZWdhdGl2ZSwgZmxpcCB0aGUgaW5kZXggc28gdGhhdCAtMSBiZWNvbWVzIHRoZSBsYXN0IGl0ZW0gaW4gbGlzdFxyXG4gICAgd3JhcHBlZEluZGV4ID0gbGVuZ3RoICsgd3JhcHBlZEluZGV4O1xyXG4gIH1cclxuICByZXR1cm4gd3JhcHBlZEluZGV4O1xyXG59O1xyXG4iXSwicHJlRXhpc3RpbmdDb21tZW50IjoiLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW01dlpHVmZiVzlrZFd4bGN5OWljbTkzYzJWeUxYQmhZMnN2WDNCeVpXeDFaR1V1YW5NaUxDSnViMlJsWDIxdlpIVnNaWE12YW5NdFkyOXZhMmxsTDNOeVl5OXFjeTVqYjI5cmFXVXVhbk1pTENKdWIyUmxYMjF2WkhWc1pYTXZjRFV0WW1KdmVDMWhiR2xuYm1Wa0xYUmxlSFF2YkdsaUwySmliM2d0WVd4cFoyNWxaQzEwWlhoMExtcHpJaXdpYm05a1pWOXRiMlIxYkdWekwzQTFMV0ppYjNndFlXeHBaMjVsWkMxMFpYaDBMMnhwWWk5MWRHbHNjeTVxY3lJc0luTnlZeTlxY3k5b2IzWmxjaTF6Ykdsa1pYTm9iM2N1YW5NaUxDSnpjbU12YW5NdmFXNTBaWEpoWTNScGRtVXRiRzluYjNNdlltRnpaUzFzYjJkdkxYTnJaWFJqYUM1cWN5SXNJbk55WXk5cWN5OXBiblJsY21GamRHbDJaUzFzYjJkdmN5OWpiMjV1WldOMExYQnZhVzUwY3kxemEyVjBZMmd1YW5NaUxDSnpjbU12YW5NdmFXNTBaWEpoWTNScGRtVXRiRzluYjNNdloyVnVaWEpoZEc5eWN5OXViMmx6WlMxblpXNWxjbUYwYjNKekxtcHpJaXdpYzNKakwycHpMMmx1ZEdWeVlXTjBhWFpsTFd4dloyOXpMMmRsYm1WeVlYUnZjbk12YzJsdUxXZGxibVZ5WVhSdmNpNXFjeUlzSW5OeVl5OXFjeTlwYm5SbGNtRmpkR2wyWlMxc2IyZHZjeTlvWVd4bWRHOXVaUzFtYkdGemFHeHBaMmgwTFhkdmNtUXVhbk1pTENKemNtTXZhbk12YVc1MFpYSmhZM1JwZG1VdGJHOW5iM012Ym05cGMza3RkMjl5WkMxemEyVjBZMmd1YW5NaUxDSnpjbU12YW5NdmJXRnBiaTF1WVhZdWFuTWlMQ0p6Y21NdmFuTXZiV0ZwYmk1cWN5SXNJbk55WXk5cWN5OXdZV2RsTFd4dllXUmxjaTVxY3lJc0luTnlZeTlxY3k5d2FXTnJMWEpoYm1SdmJTMXphMlYwWTJndWFuTWlMQ0p6Y21NdmFuTXZjRzl5ZEdadmJHbHZMV1pwYkhSbGNpNXFjeUlzSW5OeVl5OXFjeTkwYUhWdFltNWhhV3d0YzJ4cFpHVnphRzkzTDNOc2FXUmxjMmh2ZHkxdGIyUmhiQzVxY3lJc0luTnlZeTlxY3k5MGFIVnRZbTVoYVd3dGMyeHBaR1Z6YUc5M0wzTnNhV1JsYzJodmR5NXFjeUlzSW5OeVl5OXFjeTkwYUhWdFltNWhhV3d0YzJ4cFpHVnphRzkzTDNSb2RXMWlibUZwYkMxemJHbGtaWEl1YW5NaUxDSnpjbU12YW5NdmRYUnBiR2wwYVdWekxtcHpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTzBGRFFVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkRja3RCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOcVdrRTdRVUZEUVR0QlFVTkJPenRCUTBaQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRM1pKUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOMlRFRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJReTlHUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVU42UjBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGRGVrUkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOb1NVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVU4wUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPenRCUTNKRVFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGRE9VUkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkRka1JCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVTjRSRUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZEY0U5Qk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRMnhMUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRek5KUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZEZWs5Qk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRU0lzSW1acGJHVWlPaUpuWlc1bGNtRjBaV1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaUtHWjFibU4wYVc5dUlHVW9kQ3h1TEhJcGUyWjFibU4wYVc5dUlITW9ieXgxS1h0cFppZ2hibHR2WFNsN2FXWW9JWFJiYjEwcGUzWmhjaUJoUFhSNWNHVnZaaUJ5WlhGMWFYSmxQVDFjSW1aMWJtTjBhVzl1WENJbUpuSmxjWFZwY21VN2FXWW9JWFVtSm1FcGNtVjBkWEp1SUdFb2J5d2hNQ2s3YVdZb2FTbHlaWFIxY200Z2FTaHZMQ0V3S1R0MllYSWdaajF1WlhjZ1JYSnliM0lvWENKRFlXNXViM1FnWm1sdVpDQnRiMlIxYkdVZ0oxd2lLMjhyWENJblhDSXBPM1JvY205M0lHWXVZMjlrWlQxY0lrMVBSRlZNUlY5T1QxUmZSazlWVGtSY0lpeG1mWFpoY2lCc1BXNWJiMTA5ZTJWNGNHOXlkSE02ZTMxOU8zUmJiMTFiTUYwdVkyRnNiQ2hzTG1WNGNHOXlkSE1zWm5WdVkzUnBiMjRvWlNsN2RtRnlJRzQ5ZEZ0dlhWc3hYVnRsWFR0eVpYUjFjbTRnY3lodVAyNDZaU2w5TEd3c2JDNWxlSEJ2Y25SekxHVXNkQ3h1TEhJcGZYSmxkSFZ5YmlCdVcyOWRMbVY0Y0c5eWRITjlkbUZ5SUdrOWRIbHdaVzltSUhKbGNYVnBjbVU5UFZ3aVpuVnVZM1JwYjI1Y0lpWW1jbVZ4ZFdseVpUdG1iM0lvZG1GeUlHODlNRHR2UEhJdWJHVnVaM1JvTzI4ckt5bHpLSEpiYjEwcE8zSmxkSFZ5YmlCemZTa2lMQ0l2S2lGY2JpQXFJRXBoZG1GVFkzSnBjSFFnUTI5dmEybGxJSFl5TGpFdU5GeHVJQ29nYUhSMGNITTZMeTluYVhSb2RXSXVZMjl0TDJwekxXTnZiMnRwWlM5cWN5MWpiMjlyYVdWY2JpQXFYRzRnS2lCRGIzQjVjbWxuYUhRZ01qQXdOaXdnTWpBeE5TQkxiR0YxY3lCSVlYSjBiQ0FtSUVaaFoyNWxjaUJDY21GamExeHVJQ29nVW1Wc1pXRnpaV1FnZFc1a1pYSWdkR2hsSUUxSlZDQnNhV05sYm5ObFhHNGdLaTljYmpzb1puVnVZM1JwYjI0Z0tHWmhZM1J2Y25rcElIdGNibHgwZG1GeUlISmxaMmx6ZEdWeVpXUkpiazF2WkhWc1pVeHZZV1JsY2lBOUlHWmhiSE5sTzF4dVhIUnBaaUFvZEhsd1pXOW1JR1JsWm1sdVpTQTlQVDBnSjJaMWJtTjBhVzl1SnlBbUppQmtaV1pwYm1VdVlXMWtLU0I3WEc1Y2RGeDBaR1ZtYVc1bEtHWmhZM1J2Y25rcE8xeHVYSFJjZEhKbFoybHpkR1Z5WldSSmJrMXZaSFZzWlV4dllXUmxjaUE5SUhSeWRXVTdYRzVjZEgxY2JseDBhV1lnS0hSNWNHVnZaaUJsZUhCdmNuUnpJRDA5UFNBbmIySnFaV04wSnlrZ2UxeHVYSFJjZEcxdlpIVnNaUzVsZUhCdmNuUnpJRDBnWm1GamRHOXllU2dwTzF4dVhIUmNkSEpsWjJsemRHVnlaV1JKYmsxdlpIVnNaVXh2WVdSbGNpQTlJSFJ5ZFdVN1hHNWNkSDFjYmx4MGFXWWdLQ0Z5WldkcGMzUmxjbVZrU1c1TmIyUjFiR1ZNYjJGa1pYSXBJSHRjYmx4MFhIUjJZWElnVDJ4a1EyOXZhMmxsY3lBOUlIZHBibVJ2ZHk1RGIyOXJhV1Z6TzF4dVhIUmNkSFpoY2lCaGNHa2dQU0IzYVc1a2IzY3VRMjl2YTJsbGN5QTlJR1poWTNSdmNua29LVHRjYmx4MFhIUmhjR2t1Ym05RGIyNW1iR2xqZENBOUlHWjFibU4wYVc5dUlDZ3BJSHRjYmx4MFhIUmNkSGRwYm1SdmR5NURiMjlyYVdWeklEMGdUMnhrUTI5dmEybGxjenRjYmx4MFhIUmNkSEpsZEhWeWJpQmhjR2s3WEc1Y2RGeDBmVHRjYmx4MGZWeHVmU2htZFc1amRHbHZiaUFvS1NCN1hHNWNkR1oxYm1OMGFXOXVJR1Y0ZEdWdVpDQW9LU0I3WEc1Y2RGeDBkbUZ5SUdrZ1BTQXdPMXh1WEhSY2RIWmhjaUJ5WlhOMWJIUWdQU0I3ZlR0Y2JseDBYSFJtYjNJZ0tEc2dhU0E4SUdGeVozVnRaVzUwY3k1c1pXNW5kR2c3SUdrckt5a2dlMXh1WEhSY2RGeDBkbUZ5SUdGMGRISnBZblYwWlhNZ1BTQmhjbWQxYldWdWRITmJJR2tnWFR0Y2JseDBYSFJjZEdadmNpQW9kbUZ5SUd0bGVTQnBiaUJoZEhSeWFXSjFkR1Z6S1NCN1hHNWNkRngwWEhSY2RISmxjM1ZzZEZ0clpYbGRJRDBnWVhSMGNtbGlkWFJsYzF0clpYbGRPMXh1WEhSY2RGeDBmVnh1WEhSY2RIMWNibHgwWEhSeVpYUjFjbTRnY21WemRXeDBPMXh1WEhSOVhHNWNibHgwWm5WdVkzUnBiMjRnYVc1cGRDQW9ZMjl1ZG1WeWRHVnlLU0I3WEc1Y2RGeDBablZ1WTNScGIyNGdZWEJwSUNoclpYa3NJSFpoYkhWbExDQmhkSFJ5YVdKMWRHVnpLU0I3WEc1Y2RGeDBYSFIyWVhJZ2NtVnpkV3gwTzF4dVhIUmNkRngwYVdZZ0tIUjVjR1Z2WmlCa2IyTjFiV1Z1ZENBOVBUMGdKM1Z1WkdWbWFXNWxaQ2NwSUh0Y2JseDBYSFJjZEZ4MGNtVjBkWEp1TzF4dVhIUmNkRngwZlZ4dVhHNWNkRngwWEhRdkx5QlhjbWwwWlZ4dVhHNWNkRngwWEhScFppQW9ZWEpuZFcxbGJuUnpMbXhsYm1kMGFDQStJREVwSUh0Y2JseDBYSFJjZEZ4MFlYUjBjbWxpZFhSbGN5QTlJR1Y0ZEdWdVpDaDdYRzVjZEZ4MFhIUmNkRngwY0dGMGFEb2dKeThuWEc1Y2RGeDBYSFJjZEgwc0lHRndhUzVrWldaaGRXeDBjeXdnWVhSMGNtbGlkWFJsY3lrN1hHNWNibHgwWEhSY2RGeDBhV1lnS0hSNWNHVnZaaUJoZEhSeWFXSjFkR1Z6TG1WNGNHbHlaWE1nUFQwOUlDZHVkVzFpWlhJbktTQjdYRzVjZEZ4MFhIUmNkRngwZG1GeUlHVjRjR2x5WlhNZ1BTQnVaWGNnUkdGMFpTZ3BPMXh1WEhSY2RGeDBYSFJjZEdWNGNHbHlaWE11YzJWMFRXbHNiR2x6WldOdmJtUnpLR1Y0Y0dseVpYTXVaMlYwVFdsc2JHbHpaV052Ym1SektDa2dLeUJoZEhSeWFXSjFkR1Z6TG1WNGNHbHlaWE1nS2lBNE5qUmxLelVwTzF4dVhIUmNkRngwWEhSY2RHRjBkSEpwWW5WMFpYTXVaWGh3YVhKbGN5QTlJR1Y0Y0dseVpYTTdYRzVjZEZ4MFhIUmNkSDFjYmx4dVhIUmNkRngwWEhRdkx5QlhaU2R5WlNCMWMybHVaeUJjSW1WNGNHbHlaWE5jSWlCaVpXTmhkWE5sSUZ3aWJXRjRMV0ZuWlZ3aUlHbHpJRzV2ZENCemRYQndiM0owWldRZ1lua2dTVVZjYmx4MFhIUmNkRngwWVhSMGNtbGlkWFJsY3k1bGVIQnBjbVZ6SUQwZ1lYUjBjbWxpZFhSbGN5NWxlSEJwY21WeklEOGdZWFIwY21saWRYUmxjeTVsZUhCcGNtVnpMblJ2VlZSRFUzUnlhVzVuS0NrZ09pQW5KenRjYmx4dVhIUmNkRngwWEhSMGNua2dlMXh1WEhSY2RGeDBYSFJjZEhKbGMzVnNkQ0E5SUVwVFQwNHVjM1J5YVc1bmFXWjVLSFpoYkhWbEtUdGNibHgwWEhSY2RGeDBYSFJwWmlBb0wxNWJYRng3WEZ4YlhTOHVkR1Z6ZENoeVpYTjFiSFFwS1NCN1hHNWNkRngwWEhSY2RGeDBYSFIyWVd4MVpTQTlJSEpsYzNWc2REdGNibHgwWEhSY2RGeDBYSFI5WEc1Y2RGeDBYSFJjZEgwZ1kyRjBZMmdnS0dVcElIdDlYRzVjYmx4MFhIUmNkRngwYVdZZ0tDRmpiMjUyWlhKMFpYSXVkM0pwZEdVcElIdGNibHgwWEhSY2RGeDBYSFIyWVd4MVpTQTlJR1Z1WTI5a1pWVlNTVU52YlhCdmJtVnVkQ2hUZEhKcGJtY29kbUZzZFdVcEtWeHVYSFJjZEZ4MFhIUmNkRngwTG5KbGNHeGhZMlVvTHlVb01qTjhNalI4TWpaOE1rSjhNMEY4TTBOOE0wVjhNMFI4TWtaOE0wWjhOREI4TlVKOE5VUjhOVVY4TmpCOE4wSjhOMFI4TjBNcEwyY3NJR1JsWTI5a1pWVlNTVU52YlhCdmJtVnVkQ2s3WEc1Y2RGeDBYSFJjZEgwZ1pXeHpaU0I3WEc1Y2RGeDBYSFJjZEZ4MGRtRnNkV1VnUFNCamIyNTJaWEowWlhJdWQzSnBkR1VvZG1Gc2RXVXNJR3RsZVNrN1hHNWNkRngwWEhSY2RIMWNibHh1WEhSY2RGeDBYSFJyWlhrZ1BTQmxibU52WkdWVlVrbERiMjF3YjI1bGJuUW9VM1J5YVc1bktHdGxlU2twTzF4dVhIUmNkRngwWEhSclpYa2dQU0JyWlhrdWNtVndiR0ZqWlNndkpTZ3lNM3d5Tkh3eU5ud3lRbncxUlh3Mk1IdzNReWt2Wnl3Z1pHVmpiMlJsVlZKSlEyOXRjRzl1Wlc1MEtUdGNibHgwWEhSY2RGeDBhMlY1SUQwZ2EyVjVMbkpsY0d4aFkyVW9MMXRjWENoY1hDbGRMMmNzSUdWelkyRndaU2s3WEc1Y2JseDBYSFJjZEZ4MGRtRnlJSE4wY21sdVoybG1hV1ZrUVhSMGNtbGlkWFJsY3lBOUlDY25PMXh1WEc1Y2RGeDBYSFJjZEdadmNpQW9kbUZ5SUdGMGRISnBZblYwWlU1aGJXVWdhVzRnWVhSMGNtbGlkWFJsY3lrZ2UxeHVYSFJjZEZ4MFhIUmNkR2xtSUNnaFlYUjBjbWxpZFhSbGMxdGhkSFJ5YVdKMWRHVk9ZVzFsWFNrZ2UxeHVYSFJjZEZ4MFhIUmNkRngwWTI5dWRHbHVkV1U3WEc1Y2RGeDBYSFJjZEZ4MGZWeHVYSFJjZEZ4MFhIUmNkSE4wY21sdVoybG1hV1ZrUVhSMGNtbGlkWFJsY3lBclBTQW5PeUFuSUNzZ1lYUjBjbWxpZFhSbFRtRnRaVHRjYmx4MFhIUmNkRngwWEhScFppQW9ZWFIwY21saWRYUmxjMXRoZEhSeWFXSjFkR1ZPWVcxbFhTQTlQVDBnZEhKMVpTa2dlMXh1WEhSY2RGeDBYSFJjZEZ4MFkyOXVkR2x1ZFdVN1hHNWNkRngwWEhSY2RGeDBmVnh1WEhSY2RGeDBYSFJjZEhOMGNtbHVaMmxtYVdWa1FYUjBjbWxpZFhSbGN5QXJQU0FuUFNjZ0t5QmhkSFJ5YVdKMWRHVnpXMkYwZEhKcFluVjBaVTVoYldWZE8xeHVYSFJjZEZ4MFhIUjlYRzVjZEZ4MFhIUmNkSEpsZEhWeWJpQW9aRzlqZFcxbGJuUXVZMjl2YTJsbElEMGdhMlY1SUNzZ0p6MG5JQ3NnZG1Gc2RXVWdLeUJ6ZEhKcGJtZHBabWxsWkVGMGRISnBZblYwWlhNcE8xeHVYSFJjZEZ4MGZWeHVYRzVjZEZ4MFhIUXZMeUJTWldGa1hHNWNibHgwWEhSY2RHbG1JQ2doYTJWNUtTQjdYRzVjZEZ4MFhIUmNkSEpsYzNWc2RDQTlJSHQ5TzF4dVhIUmNkRngwZlZ4dVhHNWNkRngwWEhRdkx5QlVieUJ3Y21WMlpXNTBJSFJvWlNCbWIzSWdiRzl2Y0NCcGJpQjBhR1VnWm1seWMzUWdjR3hoWTJVZ1lYTnphV2R1SUdGdUlHVnRjSFI1SUdGeWNtRjVYRzVjZEZ4MFhIUXZMeUJwYmlCallYTmxJSFJvWlhKbElHRnlaU0J1YnlCamIyOXJhV1Z6SUdGMElHRnNiQzRnUVd4emJ5QndjbVYyWlc1MGN5QnZaR1FnY21WemRXeDBJSGRvWlc1Y2JseDBYSFJjZEM4dklHTmhiR3hwYm1jZ1hDSm5aWFFvS1Z3aVhHNWNkRngwWEhSMllYSWdZMjl2YTJsbGN5QTlJR1J2WTNWdFpXNTBMbU52YjJ0cFpTQS9JR1J2WTNWdFpXNTBMbU52YjJ0cFpTNXpjR3hwZENnbk95QW5LU0E2SUZ0ZE8xeHVYSFJjZEZ4MGRtRnlJSEprWldOdlpHVWdQU0F2S0NWYk1DMDVRUzFhWFhzeWZTa3JMMmM3WEc1Y2RGeDBYSFIyWVhJZ2FTQTlJREE3WEc1Y2JseDBYSFJjZEdadmNpQW9PeUJwSUR3Z1kyOXZhMmxsY3k1c1pXNW5kR2c3SUdrckt5a2dlMXh1WEhSY2RGeDBYSFIyWVhJZ2NHRnlkSE1nUFNCamIyOXJhV1Z6VzJsZExuTndiR2wwS0NjOUp5azdYRzVjZEZ4MFhIUmNkSFpoY2lCamIyOXJhV1VnUFNCd1lYSjBjeTV6YkdsalpTZ3hLUzVxYjJsdUtDYzlKeWs3WEc1Y2JseDBYSFJjZEZ4MGFXWWdLR052YjJ0cFpTNWphR0Z5UVhRb01Da2dQVDA5SUNkY0lpY3BJSHRjYmx4MFhIUmNkRngwWEhSamIyOXJhV1VnUFNCamIyOXJhV1V1YzJ4cFkyVW9NU3dnTFRFcE8xeHVYSFJjZEZ4MFhIUjlYRzVjYmx4MFhIUmNkRngwZEhKNUlIdGNibHgwWEhSY2RGeDBYSFIyWVhJZ2JtRnRaU0E5SUhCaGNuUnpXekJkTG5KbGNHeGhZMlVvY21SbFkyOWtaU3dnWkdWamIyUmxWVkpKUTI5dGNHOXVaVzUwS1R0Y2JseDBYSFJjZEZ4MFhIUmpiMjlyYVdVZ1BTQmpiMjUyWlhKMFpYSXVjbVZoWkNBL1hHNWNkRngwWEhSY2RGeDBYSFJqYjI1MlpYSjBaWEl1Y21WaFpDaGpiMjlyYVdVc0lHNWhiV1VwSURvZ1kyOXVkbVZ5ZEdWeUtHTnZiMnRwWlN3Z2JtRnRaU2tnZkh4Y2JseDBYSFJjZEZ4MFhIUmNkR052YjJ0cFpTNXlaWEJzWVdObEtISmtaV052WkdVc0lHUmxZMjlrWlZWU1NVTnZiWEJ2Ym1WdWRDazdYRzVjYmx4MFhIUmNkRngwWEhScFppQW9kR2hwY3k1cWMyOXVLU0I3WEc1Y2RGeDBYSFJjZEZ4MFhIUjBjbmtnZTF4dVhIUmNkRngwWEhSY2RGeDBYSFJqYjI5cmFXVWdQU0JLVTA5T0xuQmhjbk5sS0dOdmIydHBaU2s3WEc1Y2RGeDBYSFJjZEZ4MFhIUjlJR05oZEdOb0lDaGxLU0I3ZlZ4dVhIUmNkRngwWEhSY2RIMWNibHh1WEhSY2RGeDBYSFJjZEdsbUlDaHJaWGtnUFQwOUlHNWhiV1VwSUh0Y2JseDBYSFJjZEZ4MFhIUmNkSEpsYzNWc2RDQTlJR052YjJ0cFpUdGNibHgwWEhSY2RGeDBYSFJjZEdKeVpXRnJPMXh1WEhSY2RGeDBYSFJjZEgxY2JseHVYSFJjZEZ4MFhIUmNkR2xtSUNnaGEyVjVLU0I3WEc1Y2RGeDBYSFJjZEZ4MFhIUnlaWE4xYkhSYmJtRnRaVjBnUFNCamIyOXJhV1U3WEc1Y2RGeDBYSFJjZEZ4MGZWeHVYSFJjZEZ4MFhIUjlJR05oZEdOb0lDaGxLU0I3ZlZ4dVhIUmNkRngwZlZ4dVhHNWNkRngwWEhSeVpYUjFjbTRnY21WemRXeDBPMXh1WEhSY2RIMWNibHh1WEhSY2RHRndhUzV6WlhRZ1BTQmhjR2s3WEc1Y2RGeDBZWEJwTG1kbGRDQTlJR1oxYm1OMGFXOXVJQ2hyWlhrcElIdGNibHgwWEhSY2RISmxkSFZ5YmlCaGNHa3VZMkZzYkNoaGNHa3NJR3RsZVNrN1hHNWNkRngwZlR0Y2JseDBYSFJoY0drdVoyVjBTbE5QVGlBOUlHWjFibU4wYVc5dUlDZ3BJSHRjYmx4MFhIUmNkSEpsZEhWeWJpQmhjR2t1WVhCd2JIa29lMXh1WEhSY2RGeDBYSFJxYzI5dU9pQjBjblZsWEc1Y2RGeDBYSFI5TENCYlhTNXpiR2xqWlM1allXeHNLR0Z5WjNWdFpXNTBjeWtwTzF4dVhIUmNkSDA3WEc1Y2RGeDBZWEJwTG1SbFptRjFiSFJ6SUQwZ2UzMDdYRzVjYmx4MFhIUmhjR2t1Y21WdGIzWmxJRDBnWm5WdVkzUnBiMjRnS0d0bGVTd2dZWFIwY21saWRYUmxjeWtnZTF4dVhIUmNkRngwWVhCcEtHdGxlU3dnSnljc0lHVjRkR1Z1WkNoaGRIUnlhV0oxZEdWekxDQjdYRzVjZEZ4MFhIUmNkR1Y0Y0dseVpYTTZJQzB4WEc1Y2RGeDBYSFI5S1NrN1hHNWNkRngwZlR0Y2JseHVYSFJjZEdGd2FTNTNhWFJvUTI5dWRtVnlkR1Z5SUQwZ2FXNXBkRHRjYmx4dVhIUmNkSEpsZEhWeWJpQmhjR2s3WEc1Y2RIMWNibHh1WEhSeVpYUjFjbTRnYVc1cGRDaG1kVzVqZEdsdmJpQW9LU0I3ZlNrN1hHNTlLU2s3WEc0aUxDSjJZWElnZFhScGJITWdQU0J5WlhGMWFYSmxLRndpTGk5MWRHbHNjeTVxYzF3aUtUdGNjbHh1WEhKY2JtMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1FtSnZlRUZzYVdkdVpXUlVaWGgwTzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUVOeVpXRjBaWE1nWVNCdVpYY2dRbUp2ZUVGc2FXZHVaV1JVWlhoMElHOWlhbVZqZENBdElHRWdkR1Y0ZENCdlltcGxZM1FnZEdoaGRDQmpZVzRnWW1VZ1pISmhkMjRnZDJsMGFGeHlYRzRnS2lCaGJtTm9iM0lnY0c5cGJuUnpJR0poYzJWa0lHOXVJR0VnZEdsbmFIUWdZbTkxYm1ScGJtY2dZbTk0SUdGeWIzVnVaQ0IwYUdVZ2RHVjRkQzVjY2x4dUlDb2dRR052Ym5OMGNuVmpkRzl5WEhKY2JpQXFJRUJ3WVhKaGJTQjdiMkpxWldOMGZTQm1iMjUwSUMwZ2NEVXVSbTl1ZENCdlltcGxZM1JjY2x4dUlDb2dRSEJoY21GdElIdHpkSEpwYm1kOUlIUmxlSFFnTFNCVGRISnBibWNnZEc4Z1pHbHpjR3hoZVZ4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXMlp2Ym5SVGFYcGxQVEV5WFNBdElFWnZiblFnYzJsNlpTQjBieUIxYzJVZ1ptOXlJSE4wY21sdVoxeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnVzNnOU1GMGdMU0JKYm1sMGFXRnNJSGdnYkc5allYUnBiMjVjY2x4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlGdDVQVEJkSUMwZ1NXNXBkR2xoYkNCNUlHeHZZMkYwYVc5dVhISmNiaUFxSUVCd1lYSmhiU0I3YjJKcVpXTjBmU0JiY0VsdWMzUmhibU5sUFhkcGJtUnZkMTBnTFNCU1pXWmxjbVZ1WTJVZ2RHOGdjRFVnYVc1emRHRnVZMlVzSUd4bFlYWmxJR0pzWVc1cklHbG1YSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnphMlYwWTJnZ2FYTWdaMnh2WW1Gc1hISmNiaUFxSUVCbGVHRnRjR3hsWEhKY2JpQXFJSFpoY2lCbWIyNTBMQ0JpWW05NFZHVjRkRHRjY2x4dUlDb2dablZ1WTNScGIyNGdjSEpsYkc5aFpDZ3BJSHRjY2x4dUlDb2dJQ0FnSUdadmJuUWdQU0JzYjJGa1JtOXVkQ2hjSWk0dllYTnpaWFJ6TDFKbFozVnNZWEl1ZEhSbVhDSXBPMXh5WEc0Z0tpQjlYSEpjYmlBcUlHWjFibU4wYVc5dUlITmxkSFZ3S0NrZ2UxeHlYRzRnS2lBZ0lDQWdZM0psWVhSbFEyRnVkbUZ6S0RRd01Dd2dOakF3S1R0Y2NseHVJQ29nSUNBZ0lHSmhZMnRuY205MWJtUW9NQ2s3WEhKY2JpQXFJQ0FnSUNCY2NseHVJQ29nSUNBZ0lHSmliM2hVWlhoMElEMGdibVYzSUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQ2htYjI1MExDQmNJa2hsZVNGY0lpd2dNekFwT3lBZ0lDQmNjbHh1SUNvZ0lDQWdJR0ppYjNoVVpYaDBMbk5sZEZKdmRHRjBhVzl1S0ZCSklDOGdOQ2s3WEhKY2JpQXFJQ0FnSUNCaVltOTRWR1Y0ZEM1elpYUkJibU5vYjNJb1FtSnZlRUZzYVdkdVpXUlVaWGgwTGtGTVNVZE9Ma0pQV0Y5RFJVNVVSVklzSUZ4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lFSmliM2hCYkdsbmJtVmtWR1Y0ZEM1Q1FWTkZURWxPUlM1Q1QxaGZRMFZPVkVWU0tUdGNjbHh1SUNvZ0lDQWdJRnh5WEc0Z0tpQWdJQ0FnWm1sc2JDaGNJaU13TUVFNFJVRmNJaWs3WEhKY2JpQXFJQ0FnSUNCdWIxTjBjbTlyWlNncE8xeHlYRzRnS2lBZ0lDQWdZbUp2ZUZSbGVIUXVaSEpoZHloM2FXUjBhQ0F2SURJc0lHaGxhV2RvZENBdklESXBPMXh5WEc0Z0tpQjlYSEpjYmlBcUwxeHlYRzVtZFc1amRHbHZiaUJDWW05NFFXeHBaMjVsWkZSbGVIUW9abTl1ZEN3Z2RHVjRkQ3dnWm05dWRGTnBlbVVzSUhnc0lIa3NJSEJKYm5OMFlXNWpaU2tnZTF4eVhHNGdJQ0FnZEdocGN5NWZabTl1ZENBOUlHWnZiblE3WEhKY2JpQWdJQ0IwYUdsekxsOTBaWGgwSUQwZ2RHVjRkRHRjY2x4dUlDQWdJSFJvYVhNdVgzZ2dQU0IxZEdsc2N5NWtaV1poZFd4MEtIZ3NJREFwTzF4eVhHNGdJQ0FnZEdocGN5NWZlU0E5SUhWMGFXeHpMbVJsWm1GMWJIUW9lU3dnTUNrN1hISmNiaUFnSUNCMGFHbHpMbDltYjI1MFUybDZaU0E5SUhWMGFXeHpMbVJsWm1GMWJIUW9abTl1ZEZOcGVtVXNJREV5S1R0Y2NseHVJQ0FnSUhSb2FYTXVYM0FnUFNCMWRHbHNjeTVrWldaaGRXeDBLSEJKYm5OMFlXNWpaU3dnZDJsdVpHOTNLVHRjY2x4dUlDQWdJSFJvYVhNdVgzSnZkR0YwYVc5dUlEMGdNRHRjY2x4dUlDQWdJSFJvYVhNdVgyaEJiR2xuYmlBOUlFSmliM2hCYkdsbmJtVmtWR1Y0ZEM1QlRFbEhUaTVDVDFoZlEwVk9WRVZTTzF4eVhHNGdJQ0FnZEdocGN5NWZka0ZzYVdkdUlEMGdRbUp2ZUVGc2FXZHVaV1JVWlhoMExrSkJVMFZNU1U1RkxrSlBXRjlEUlU1VVJWSTdYSEpjYmlBZ0lDQjBhR2x6TGw5allXeGpkV3hoZEdWTlpYUnlhV056S0hSeWRXVXBPMXh5WEc1OVhISmNibHh5WEc0dktpcGNjbHh1SUNvZ1ZtVnlkR2xqWVd3Z1lXeHBaMjV0Wlc1MElIWmhiSFZsYzF4eVhHNGdLaUJBY0hWaWJHbGpYSEpjYmlBcUlFQnpkR0YwYVdOY2NseHVJQ29nUUhKbFlXUnZibXg1WEhKY2JpQXFJRUJsYm5WdElIdHpkSEpwYm1kOVhISmNiaUFxTDF4eVhHNUNZbTk0UVd4cFoyNWxaRlJsZUhRdVFVeEpSMDRnUFNCN1hISmNiaUFnSUNBdktpb2dSSEpoZHlCbWNtOXRJSFJvWlNCc1pXWjBJRzltSUhSb1pTQmlZbTk0SUNvdlhISmNiaUFnSUNCQ1QxaGZURVZHVkRvZ1hDSmliM2hmYkdWbWRGd2lMRnh5WEc0Z0lDQWdMeW9xSUVSeVlYY2dabkp2YlNCMGFHVWdZMlZ1ZEdWeUlHOW1JSFJvWlNCaVltOTRJQ292WEhKY2JpQWdJQ0JDVDFoZlEwVk9WRVZTT2lCY0ltSnZlRjlqWlc1MFpYSmNJaXhjY2x4dUlDQWdJQzhxS2lCRWNtRjNJR1p5YjIwZ2RHaGxJSEpwWjJoMElHOW1JSFJvWlNCaVltOTRJQ292WEhKY2JpQWdJQ0JDVDFoZlVrbEhTRlE2SUZ3aVltOTRYM0pwWjJoMFhDSmNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtseHlYRzRnS2lCQ1lYTmxiR2x1WlNCaGJHbG5ibTFsYm5RZ2RtRnNkV1Z6WEhKY2JpQXFJRUJ3ZFdKc2FXTmNjbHh1SUNvZ1FITjBZWFJwWTF4eVhHNGdLaUJBY21WaFpHOXViSGxjY2x4dUlDb2dRR1Z1ZFcwZ2UzTjBjbWx1WjMxY2NseHVJQ292WEhKY2JrSmliM2hCYkdsbmJtVmtWR1Y0ZEM1Q1FWTkZURWxPUlNBOUlIdGNjbHh1SUNBZ0lDOHFLaUJFY21GM0lHWnliMjBnZEdobElIUnZjQ0J2WmlCMGFHVWdZbUp2ZUNBcUwxeHlYRzRnSUNBZ1FrOVlYMVJQVURvZ1hDSmliM2hmZEc5d1hDSXNYSEpjYmlBZ0lDQXZLaW9nUkhKaGR5Qm1jbTl0SUhSb1pTQmpaVzUwWlhJZ2IyWWdkR2hsSUdKaWIzZ2dLaTljY2x4dUlDQWdJRUpQV0Y5RFJVNVVSVkk2SUZ3aVltOTRYMk5sYm5SbGNsd2lMRnh5WEc0Z0lDQWdMeW9xSUVSeVlYY2dabkp2YlNCMGFHVWdZbTkwZEc5dElHOW1JSFJvWlNCaVltOTRJQ292WEhKY2JpQWdJQ0JDVDFoZlFrOVVWRTlOT2lCY0ltSnZlRjlpYjNSMGIyMWNJaXhjY2x4dUlDQWdJQzhxS2lCY2NseHVJQ0FnSUNBcUlFUnlZWGNnWm5KdmJTQm9ZV3htSUhSb1pTQm9aV2xuYUhRZ2IyWWdkR2hsSUdadmJuUXVJRk53WldOcFptbGpZV3hzZVNCMGFHVWdhR1ZwWjJoMElHbHpYSEpjYmlBZ0lDQWdLaUJqWVd4amRXeGhkR1ZrSUdGek9pQmhjMk5sYm5RZ0t5QmtaWE5qWlc1MExseHlYRzRnSUNBZ0lDb3ZYSEpjYmlBZ0lDQkdUMDVVWDBORlRsUkZVam9nWENKbWIyNTBYMk5sYm5SbGNsd2lMRnh5WEc0Z0lDQWdMeW9xSUVSeVlYY2dabkp2YlNCMGFHVWdkR2hsSUc1dmNtMWhiQ0JtYjI1MElHSmhjMlZzYVc1bElDb3ZYSEpjYmlBZ0lDQkJURkJJUVVKRlZFbERPaUJjSW1Gc2NHaGhZbVYwYVdOY0lseHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUZObGRDQmpkWEp5Wlc1MElIUmxlSFJjY2x4dUlDb2dRSEIxWW14cFkxeHlYRzRnS2lCQWNHRnlZVzBnZTNOMGNtbHVaMzBnYzNSeWFXNW5JQzBnVkdWNGRDQnpkSEpwYm1jZ2RHOGdaR2x6Y0d4aGVWeHlYRzRnS2lCQWNtVjBkWEp1Y3lCN2RHaHBjMzBnVlhObFpuVnNJR1p2Y2lCamFHRnBibWx1WjF4eVhHNGdLaTljY2x4dVFtSnZlRUZzYVdkdVpXUlVaWGgwTG5CeWIzUnZkSGx3WlM1elpYUlVaWGgwSUQwZ1puVnVZM1JwYjI0b2MzUnlhVzVuS1NCN1hISmNiaUFnSUNCMGFHbHpMbDkwWlhoMElEMGdjM1J5YVc1bk8xeHlYRzRnSUNBZ2RHaHBjeTVmWTJGc1kzVnNZWFJsVFdWMGNtbGpjeWhtWVd4elpTazdYSEpjYmlBZ0lDQnlaWFIxY200Z2RHaHBjenRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlRaWFFnZEdobElIUmxlSFFnY0c5emFYUnBiMjVjY2x4dUlDb2dRSEIxWW14cFkxeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnZUNBdElGZ2djRzl6YVhScGIyNWNjbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUhnZ0xTQlpJSEJ2YzJsMGFXOXVYSEpjYmlBcUlFQnlaWFIxY201eklIdDBhR2x6ZlNCVmMyVm1kV3dnWm05eUlHTm9ZV2x1YVc1blhISmNiaUFxTDF4eVhHNUNZbTk0UVd4cFoyNWxaRlJsZUhRdWNISnZkRzkwZVhCbExuTmxkRkJ2YzJsMGFXOXVJRDBnWm5WdVkzUnBiMjRvZUN3Z2VTa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZmVDQTlJSFYwYVd4ekxtUmxabUYxYkhRb2VDd2dkR2hwY3k1ZmVDazdYSEpjYmlBZ0lDQjBhR2x6TGw5NUlEMGdkWFJwYkhNdVpHVm1ZWFZzZENoNUxDQjBhR2x6TGw5NUtUdGNjbHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFZGxkQ0IwYUdVZ2RHVjRkQ0J3YjNOcGRHbHZibHh5WEc0Z0tpQkFjSFZpYkdsalhISmNiaUFxSUVCeVpYUjFjbTRnZTI5aWFtVmpkSDBnVW1WMGRYSnVjeUJoYmlCdlltcGxZM1FnZDJsMGFDQndjbTl3WlhKMGFXVnpPaUI0TENCNVhISmNiaUFxTDF4eVhHNUNZbTk0UVd4cFoyNWxaRlJsZUhRdWNISnZkRzkwZVhCbExtZGxkRkJ2YzJsMGFXOXVJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnSUNCeVpYUjFjbTRnZTF4eVhHNGdJQ0FnSUNBZ0lIZzZJSFJvYVhNdVgzZ3NYSEpjYmlBZ0lDQWdJQ0FnZVRvZ2RHaHBjeTVmZVZ4eVhHNGdJQ0FnZlR0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJUWlhRZ1kzVnljbVZ1ZENCMFpYaDBJSE5wZW1WY2NseHVJQ29nUUhCMVlteHBZMXh5WEc0Z0tpQkFjR0Z5WVcwZ2UyNTFiV0psY24wZ1ptOXVkRk5wZW1VZ1ZHVjRkQ0J6YVhwbFhISmNiaUFxSUVCeVpYUjFjbTV6SUh0MGFHbHpmU0JWYzJWbWRXd2dabTl5SUdOb1lXbHVhVzVuWEhKY2JpQXFMMXh5WEc1Q1ltOTRRV3hwWjI1bFpGUmxlSFF1Y0hKdmRHOTBlWEJsTG5ObGRGUmxlSFJUYVhwbElEMGdablZ1WTNScGIyNG9abTl1ZEZOcGVtVXBJSHRjY2x4dUlDQWdJSFJvYVhNdVgyWnZiblJUYVhwbElEMGdabTl1ZEZOcGVtVTdYSEpjYmlBZ0lDQjBhR2x6TGw5allXeGpkV3hoZEdWTlpYUnlhV056S0hSeWRXVXBPMXh5WEc0Z0lDQWdjbVYwZFhKdUlIUm9hWE03WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dVMlYwSUhKdmRHRjBhVzl1SUc5bUlIUmxlSFJjY2x4dUlDb2dRSEIxWW14cFkxeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnWVc1bmJHVWdMU0JTYjNSaGRHbHZiaUJwYmlCeVlXUnBZVzV6WEhKY2JpQXFJRUJ5WlhSMWNtNXpJSHQwYUdsemZTQlZjMlZtZFd3Z1ptOXlJR05vWVdsdWFXNW5YSEpjYmlBcUwxeHlYRzVDWW05NFFXeHBaMjVsWkZSbGVIUXVjSEp2ZEc5MGVYQmxMbk5sZEZKdmRHRjBhVzl1SUQwZ1puVnVZM1JwYjI0b1lXNW5iR1VwSUh0Y2NseHVJQ0FnSUhSb2FYTXVYM0p2ZEdGMGFXOXVJRDBnZFhScGJITXVaR1ZtWVhWc2RDaGhibWRzWlN3Z2RHaHBjeTVmY205MFlYUnBiMjRwTzF4eVhHNGdJQ0FnY21WMGRYSnVJSFJvYVhNN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUjJWMElISnZkR0YwYVc5dUlHOW1JSFJsZUhSY2NseHVJQ29nUUhCMVlteHBZMXh5WEc0Z0tpQkFjbVYwZFhKdWN5QjdiblZ0WW1WeWZTQlNiM1JoZEdsdmJpQnBiaUJ5WVdScFlXNXpYSEpjYmlBcUwxeHlYRzVDWW05NFFXeHBaMjVsWkZSbGVIUXVjSEp2ZEc5MGVYQmxMbWRsZEZKdmRHRjBhVzl1SUQwZ1puVnVZM1JwYjI0b1lXNW5iR1VwSUh0Y2NseHVJQ0FnSUhKbGRIVnliaUIwYUdsekxsOXliM1JoZEdsdmJqdGNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtseHlYRzRnS2lCVFpYUWdkR2hsSUhBZ2FXNXpkR0Z1WTJVZ2RHaGhkQ0JwY3lCMWMyVmtJR1p2Y2lCa2NtRjNhVzVuWEhKY2JpQXFJRUJ3ZFdKc2FXTmNjbHh1SUNvZ1FIQmhjbUZ0SUh0dlltcGxZM1I5SUhBZ0xTQkpibk4wWVc1alpTQnZaaUJ3TlNCbWIzSWdaSEpoZDJsdVp5NGdWR2hwY3lCcGN5QnZibXg1SUc1bFpXUmxaQ0IzYUdWdUlGeHlYRzRnS2lBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIVnphVzVuSUdGdUlHOW1abk5qY21WbGJpQnlaVzVrWlhKbGNpQnZjaUIzYUdWdUlIVnphVzVuSUhBMUlHbHVJR2x1YzNSaGJtTmxYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdiVzlrWlM1Y2NseHVJQ29nUUhKbGRIVnlibk1nZTNSb2FYTjlJRlZ6WldaMWJDQm1iM0lnWTJoaGFXNXBibWRjY2x4dUlDb3ZYSEpjYmtKaWIzaEJiR2xuYm1Wa1ZHVjRkQzV3Y205MGIzUjVjR1V1YzJWMFVFbHVjM1JoYm1ObElEMGdablZ1WTNScGIyNG9jQ2tnZTF4eVhHNGdJQ0FnZEdocGN5NWZjQ0E5SUhWMGFXeHpMbVJsWm1GMWJIUW9jQ3dnZEdocGN5NWZjQ2s3WEhKY2JpQWdJQ0J5WlhSMWNtNGdkR2hwY3p0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJIWlhRZ2NtOTBZWFJwYjI0Z2IyWWdkR1Y0ZEZ4eVhHNGdLaUJBY0hWaWJHbGpYSEpjYmlBcUlFQnlaWFIxY201eklIdHZZbXBsWTNSOUlFbHVjM1JoYm1ObElHOW1JSEExSUhSb1lYUWdhWE1nWW1WcGJtY2dkWE5sWkNCbWIzSWdaSEpoZDJsdVoxeHlYRzRnS2k5Y2NseHVRbUp2ZUVGc2FXZHVaV1JVWlhoMExuQnliM1J2ZEhsd1pTNW5aWFJRU1c1emRHRnVZMlVnUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpMbDl3TzF4eVhHNTlPMXh5WEc1Y2NseHVMeW9xWEhKY2JpQXFJRk5sZENCaGJtTm9iM0lnY0c5cGJuUWdabTl5SUhSbGVIUWdLR2h2Y21sNmIyNWhiQ0JoYm1RZ2RtVnlkR2xqWVd3Z1lXeHBaMjV0Wlc1MEtTQnlaV3hoZEdsMlpTQjBiMXh5WEc0Z0tpQmliM1Z1WkdsdVp5QmliM2hjY2x4dUlDb2dRSEIxWW14cFkxeHlYRzRnS2lCQWNHRnlZVzBnZTNOMGNtbHVaMzBnVzJoQmJHbG5iajFEUlU1VVJWSmRJQzBnU0c5eWFYcHZibUZzSUdGc2FXZHViV1Z1ZEZ4eVhHNGdLaUJBY0dGeVlXMGdlM04wY21sdVozMGdXM1pCYkdsbmJqMURSVTVVUlZKZElDMGdWbVZ5ZEdsallXd2dZbUZ6Wld4cGJtVmNjbHh1SUNvZ1FIQmhjbUZ0SUh0aWIyOXNaV0Z1ZlNCYmRYQmtZWFJsVUc5emFYUnBiMjQ5Wm1Gc2MyVmRJQzBnU1dZZ2MyVjBJSFJ2SUhSeWRXVXNJSFJvWlNCd2IzTnBkR2x2YmlCdlppQjBhR1ZjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHaGxJSFJsZUhRZ2QybHNiQ0JpWlNCemFHbG1kR1ZrSUhOdklIUm9ZWFJjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RHaGxJSFJsZUhRZ2QybHNiQ0JpWlNCa2NtRjNiaUJwYmlCMGFHVWdjMkZ0WlZ4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQndiR0ZqWlNCcGRDQjNZWE1nWW1WbWIzSmxJR05oYkd4cGJtY2dYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhObGRFRnVZMmh2Y2k1Y2NseHVJQ29nUUhKbGRIVnlibk1nZTNSb2FYTjlJRlZ6WldaMWJDQm1iM0lnWTJoaGFXNXBibWRjY2x4dUlDb3ZYSEpjYmtKaWIzaEJiR2xuYm1Wa1ZHVjRkQzV3Y205MGIzUjVjR1V1YzJWMFFXNWphRzl5SUQwZ1puVnVZM1JwYjI0b2FFRnNhV2R1TENCMlFXeHBaMjRzSUhWd1pHRjBaVkJ2YzJsMGFXOXVLU0I3WEhKY2JpQWdJQ0IyWVhJZ2IyeGtVRzl6SUQwZ2RHaHBjeTVmWTJGc1kzVnNZWFJsUVd4cFoyNWxaRU52YjNKa2N5aDBhR2x6TGw5NExDQjBhR2x6TGw5NUtUdGNjbHh1SUNBZ0lIUm9hWE11WDJoQmJHbG5iaUE5SUhWMGFXeHpMbVJsWm1GMWJIUW9hRUZzYVdkdUxDQkNZbTk0UVd4cFoyNWxaRlJsZUhRdVFVeEpSMDR1UTBWT1ZFVlNLVHRjY2x4dUlDQWdJSFJvYVhNdVgzWkJiR2xuYmlBOUlIVjBhV3h6TG1SbFptRjFiSFFvZGtGc2FXZHVMQ0JDWW05NFFXeHBaMjVsWkZSbGVIUXVRa0ZUUlV4SlRrVXVRMFZPVkVWU0tUdGNjbHh1SUNBZ0lHbG1JQ2gxY0dSaGRHVlFiM05wZEdsdmJpa2dlMXh5WEc0Z0lDQWdJQ0FnSUhaaGNpQnVaWGRRYjNNZ1BTQjBhR2x6TGw5allXeGpkV3hoZEdWQmJHbG5ibVZrUTI5dmNtUnpLSFJvYVhNdVgzZ3NJSFJvYVhNdVgza3BPMXh5WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYM2dnS3owZ2IyeGtVRzl6TG5nZ0xTQnVaWGRRYjNNdWVEdGNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOTVJQ3M5SUc5c1pGQnZjeTU1SUMwZ2JtVjNVRzl6TG5rN1hISmNiaUFnSUNCOVhISmNiaUFnSUNCeVpYUjFjbTRnZEdocGN6dGNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtseHlYRzRnS2lCSFpYUWdkR2hsSUdKdmRXNWthVzVuSUdKdmVDQjNhR1Z1SUhSb1pTQjBaWGgwSUdseklIQnNZV05sWkNCaGRDQjBhR1VnYzNCbFkybG1hV1ZrSUdOdmIzSmthVzVoZEdWekxseHlYRzRnS2lCT2IzUmxPaUIwYUdseklHbHpJSFJvWlNCMWJuSnZkR0YwWldRZ1ltOTFibVJwYm1jZ1ltOTRJU0JVVDBSUE9pQkdhWGdnZEdocGN5NWNjbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUZ0NFBXTjFjbkpsYm5RZ2VGMGdMU0JCSUc1bGR5QjRJR052YjNKa2FXNWhkR1VnYjJZZ2RHVjRkQ0JoYm1Ob2IzSXVJRlJvYVhOY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjNhV3hzSUdOb1lXNW5aU0IwYUdVZ2RHVjRkQ2R6SUhnZ2NHOXphWFJwYjI0Z1hISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjR1Z5YldGdVpXNTBiSGt1SUZ4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXM2s5WTNWeWNtVnVkQ0I1WFNBdElFRWdibVYzSUhrZ1kyOXZjbVJwYm1GMFpTQnZaaUIwWlhoMElHRnVZMmh2Y2k0Z1ZHaHBjMXh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhkcGJHd2dZMmhoYm1kbElIUm9aU0IwWlhoMEozTWdlQ0J3YjNOcGRHbHZiaUJjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCd1pYSnRZVzVsYm5Sc2VTNWNjbHh1SUNvZ1FISmxkSFZ5YmlCN2IySnFaV04wZlNCU1pYUjFjbTV6SUdGdUlHOWlhbVZqZENCM2FYUm9JSEJ5YjNCbGNuUnBaWE02SUhnc0lIa3NJSGNzSUdoY2NseHVJQ292WEhKY2JrSmliM2hCYkdsbmJtVmtWR1Y0ZEM1d2NtOTBiM1I1Y0dVdVoyVjBRbUp2ZUNBOUlHWjFibU4wYVc5dUtIZ3NJSGtwSUh0Y2NseHVJQ0FnSUhSb2FYTXVjMlYwVUc5emFYUnBiMjRvZUN3Z2VTazdYSEpjYmlBZ0lDQjJZWElnY0c5eklEMGdkR2hwY3k1ZlkyRnNZM1ZzWVhSbFFXeHBaMjVsWkVOdmIzSmtjeWgwYUdsekxsOTRMQ0IwYUdsekxsOTVLVHRjY2x4dUlDQWdJSEpsZEhWeWJpQjdYSEpjYmlBZ0lDQWdJQ0FnZURvZ2NHOXpMbmdnS3lCMGFHbHpMbDlpYjNWdVpITlBabVp6WlhRdWVDeGNjbHh1SUNBZ0lDQWdJQ0I1T2lCd2IzTXVlU0FySUhSb2FYTXVYMkp2ZFc1a2MwOW1abk5sZEM1NUxGeHlYRzRnSUNBZ0lDQWdJSGM2SUhSb2FYTXVkMmxrZEdnc1hISmNiaUFnSUNBZ0lDQWdhRG9nZEdocGN5NW9aV2xuYUhSY2NseHVJQ0FnSUgwN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUjJWMElHRnVJR0Z5Y21GNUlHOW1JSEJ2YVc1MGN5QjBhR0YwSUdadmJHeHZkeUJoYkc5dVp5QjBhR1VnZEdWNGRDQndZWFJvTGlCVWFHbHpJSGRwYkd3Z2RHRnJaU0JwYm5SdlhISmNiaUFxSUdOdmJuTnBaR1Z5WVhScGIyNGdkR2hsSUdOMWNuSmxiblFnWVd4cFoyNXRaVzUwSUhObGRIUnBibWR6TGx4eVhHNGdLaUJPYjNSbE9pQjBhR2x6SUdseklHRWdkR2hwYmlCM2NtRndjR1Z5SUdGeWIzVnVaQ0JoSUhBMUlHMWxkR2h2WkNCaGJtUWdaRzlsYzI0bmRDQm9ZVzVrYkdVZ2RXNXliM1JoZEdWa1hISmNiaUFxSUhSbGVIUWhJRlJQUkU4NklFWnBlQ0IwYUdsekxseHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnVzNnOVkzVnljbVZ1ZENCNFhTQXRJRUVnYm1WM0lIZ2dZMjl2Y21ScGJtRjBaU0J2WmlCMFpYaDBJR0Z1WTJodmNpNGdWR2hwYzF4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIZHBiR3dnWTJoaGJtZGxJSFJvWlNCMFpYaDBKM01nZUNCd2IzTnBkR2x2YmlCY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQndaWEp0WVc1bGJuUnNlUzRnWEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQmJlVDFqZFhKeVpXNTBJSGxkSUMwZ1FTQnVaWGNnZVNCamIyOXlaR2x1WVhSbElHOW1JSFJsZUhRZ1lXNWphRzl5TGlCVWFHbHpYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZDJsc2JDQmphR0Z1WjJVZ2RHaGxJSFJsZUhRbmN5QjRJSEJ2YzJsMGFXOXVJRnh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhCbGNtMWhibVZ1ZEd4NUxseHlYRzRnS2lCQWNHRnlZVzBnZTI5aWFtVmpkSDBnVzI5d2RHbHZibk5kSUMwZ1FXNGdiMkpxWldOMElIUm9ZWFFnWTJGdUlHaGhkbVU2WEhKY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUMwZ2MyRnRjR3hsUm1GamRHOXlPaUJ5WVhScGJ5QnZaaUJ3WVhSb0xXeGxibWQwYUNCMGJ5QnVkVzFpWlhKY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnZaaUJ6WVcxd2JHVnpJQ2hrWldaaGRXeDBQVEF1TWpVcExpQklhV2RvWlhJZ2RtRnNkV1Z6SUZ4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIbHBaV3hrSUcxdmNtVndiMmx1ZEhNZ1lXNWtJR0Z5WlNCMGFHVnlaV1p2Y21VZ2JXOXlaU0JjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCd2NtVmphWE5sTGlCY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0xTQnphVzF3YkdsbWVWUm9jbVZ6YUc5c1pEb2dhV1lnYzJWMElIUnZJR0VnYm05dUxYcGxjbThnWEhKY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtRnNkV1VzSUdOdmJHeHBibVZoY2lCd2IybHVkSE1nZDJsc2JDQmlaU0J5WlcxdmRtVmtMaUJVYUdWY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZV3gxWlNCeVpYQnlaWE5sYm5SeklIUm9aU0IwYUhKbGMyaHZiR1FnWVc1bmJHVWdkRzhnZFhObFhISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkMmhsYmlCa1pYUmxjbTFwYm1sdVp5QjNhR1YwYUdWeUlIUjNieUJsWkdkbGN5QmhjbVVnWEhKY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyOXNiR2x1WldGeUxseHlYRzRnS2lCQWNtVjBkWEp1SUh0aGNuSmhlWDBnUVc0Z1lYSnlZWGtnYjJZZ2NHOXBiblJ6TENCbFlXTm9JSGRwZEdnZ2VDd2dlU0FtSUdGc2NHaGhJQ2gwYUdVZ2NHRjBhQ0JoYm1kc1pTbGNjbHh1SUNvdlhISmNia0ppYjNoQmJHbG5ibVZrVkdWNGRDNXdjbTkwYjNSNWNHVXVaMlYwVkdWNGRGQnZhVzUwY3lBOUlHWjFibU4wYVc5dUtIZ3NJSGtzSUc5d2RHbHZibk1wSUh0Y2NseHVJQ0FnSUhSb2FYTXVjMlYwVUc5emFYUnBiMjRvZUN3Z2VTazdYSEpjYmlBZ0lDQjJZWElnY0c5cGJuUnpJRDBnZEdocGN5NWZabTl1ZEM1MFpYaDBWRzlRYjJsdWRITW9kR2hwY3k1ZmRHVjRkQ3dnZEdocGN5NWZlQ3dnZEdocGN5NWZlU3dnWEhKY2JpQWdJQ0FnSUNBZ2RHaHBjeTVmWm05dWRGTnBlbVVzSUc5d2RHbHZibk1wTzF4eVhHNGdJQ0FnWm05eUlDaDJZWElnYVNBOUlEQTdJR2tnUENCd2IybHVkSE11YkdWdVozUm9PeUJwSUNzOUlERXBJSHRjY2x4dUlDQWdJQ0FnSUNCMllYSWdjRzl6SUQwZ2RHaHBjeTVmWTJGc1kzVnNZWFJsUVd4cFoyNWxaRU52YjNKa2N5aHdiMmx1ZEhOYmFWMHVlQ3dnY0c5cGJuUnpXMmxkTG5rcE8xeHlYRzRnSUNBZ0lDQWdJSEJ2YVc1MGMxdHBYUzU0SUQwZ2NHOXpMbmc3WEhKY2JpQWdJQ0FnSUNBZ2NHOXBiblJ6VzJsZExua2dQU0J3YjNNdWVUdGNjbHh1SUNBZ0lIMWNjbHh1SUNBZ0lISmxkSFZ5YmlCd2IybHVkSE03WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dSSEpoZDNNZ2RHaGxJSFJsZUhRZ2NHRnlkR2xqYkdVZ2QybDBhQ0IwYUdVZ2MzQmxZMmxtYVdWa0lITjBlV3hsSUhCaGNtRnRaWFJsY25NdUlFNXZkR1U2SUhSb2FYTWdhWE5jY2x4dUlDb2daMjlwYm1jZ2RHOGdjMlYwSUhSb1pTQjBaWGgwUm05dWRDd2dkR1Y0ZEZOcGVtVWdKaUJ5YjNSaGRHbHZiaUJpWldadmNtVWdaSEpoZDJsdVp5NGdXVzkxSUhOb2IzVnNaQ0J6WlhSY2NseHVJQ29nZEdobElHTnZiRzl5TDNOMGNtOXJaUzltYVd4c0lIUm9ZWFFnZVc5MUlIZGhiblFnWW1WbWIzSmxJR1J5WVhkcGJtY3VJRlJvYVhNZ1puVnVZM1JwYjI0Z2QybHNiQ0JqYkdWaGJseHlYRzRnS2lCMWNDQmhablJsY2lCcGRITmxiR1lnWVc1a0lISmxjMlYwSUhOMGVXeHBibWNnWW1GamF5QjBieUIzYUdGMElHbDBJSGRoY3lCaVpXWnZjbVVnYVhRZ2QyRnpJR05oYkd4bFpDNWNjbHh1SUNvZ1FIQjFZbXhwWTF4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXM2c5WTNWeWNtVnVkQ0I0WFNBdElFRWdibVYzSUhnZ1kyOXZjbVJwYm1GMFpTQnZaaUIwWlhoMElHRnVZMmh2Y2k0Z1ZHaHBjeUIzYVd4c1hISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmphR0Z1WjJVZ2RHaGxJSFJsZUhRbmN5QjRJSEJ2YzJsMGFXOXVJSEJsY20xaGJtVnVkR3g1TGlCY2NseHVJQ29nUUhCaGNtRnRJSHR1ZFcxaVpYSjlJRnQ1UFdOMWNuSmxiblFnZVYwZ0xTQkJJRzVsZHlCNUlHTnZiM0prYVc1aGRHVWdiMllnZEdWNGRDQmhibU5vYjNJdUlGUm9hWE1nZDJsc2JGeHlYRzRnS2lBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05vWVc1blpTQjBhR1VnZEdWNGRDZHpJSGdnY0c5emFYUnBiMjRnY0dWeWJXRnVaVzUwYkhrdVhISmNiaUFxSUVCd1lYSmhiU0I3WW05dmJHVmhibjBnVzJSeVlYZENiM1Z1WkhNOVptRnNjMlZkSUMwZ1JteGhaeUJtYjNJZ1pISmhkMmx1WnlCaWIzVnVaR2x1WnlCaWIzaGNjbHh1SUNvdlhISmNia0ppYjNoQmJHbG5ibVZrVkdWNGRDNXdjbTkwYjNSNWNHVXVaSEpoZHlBOUlHWjFibU4wYVc5dUtIZ3NJSGtzSUdSeVlYZENiM1Z1WkhNcElIdGNjbHh1SUNBZ0lHUnlZWGRDYjNWdVpITWdQU0IxZEdsc2N5NWtaV1poZFd4MEtHUnlZWGRDYjNWdVpITXNJR1poYkhObEtUdGNjbHh1SUNBZ0lIUm9hWE11YzJWMFVHOXphWFJwYjI0b2VDd2dlU2s3WEhKY2JpQWdJQ0IyWVhJZ2NHOXpJRDBnZTF4eVhHNGdJQ0FnSUNBZ0lIZzZJSFJvYVhNdVgzZ3NJRnh5WEc0Z0lDQWdJQ0FnSUhrNklIUm9hWE11WDNsY2NseHVJQ0FnSUgwN1hISmNibHh5WEc0Z0lDQWdkR2hwY3k1ZmNDNXdkWE5vS0NrN1hISmNibHh5WEc0Z0lDQWdJQ0FnSUdsbUlDaDBhR2x6TGw5eWIzUmhkR2x2YmlrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCd2IzTWdQU0IwYUdsekxsOWpZV3hqZFd4aGRHVlNiM1JoZEdWa1EyOXZjbVJ6S0hCdmN5NTRMQ0J3YjNNdWVTd2dkR2hwY3k1ZmNtOTBZWFJwYjI0cE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpMbDl3TG5KdmRHRjBaU2gwYUdsekxsOXliM1JoZEdsdmJpazdYSEpjYmlBZ0lDQWdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lDQWdJQ0J3YjNNZ1BTQjBhR2x6TGw5allXeGpkV3hoZEdWQmJHbG5ibVZrUTI5dmNtUnpLSEJ2Y3k1NExDQndiM011ZVNrN1hISmNibHh5WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYM0F1ZEdWNGRFRnNhV2R1S0hSb2FYTXVYM0F1VEVWR1ZDd2dkR2hwY3k1ZmNDNUNRVk5GVEVsT1JTazdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjQzUwWlhoMFJtOXVkQ2gwYUdsekxsOW1iMjUwS1R0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5d0xuUmxlSFJUYVhwbEtIUm9hWE11WDJadmJuUlRhWHBsS1R0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5d0xuUmxlSFFvZEdocGN5NWZkR1Y0ZEN3Z2NHOXpMbmdzSUhCdmN5NTVLVHRjY2x4dVhISmNiaUFnSUNBZ0lDQWdhV1lnS0dSeVlYZENiM1Z1WkhNcElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RHaHBjeTVmY0M1emRISnZhMlVvTWpBd0tUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR0p2ZFc1a2MxZ2dQU0J3YjNNdWVDQXJJSFJvYVhNdVgySnZkVzVrYzA5bVpuTmxkQzU0TzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1ltOTFibVJ6V1NBOUlIQnZjeTU1SUNzZ2RHaHBjeTVmWW05MWJtUnpUMlptYzJWMExuazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIUm9hWE11WDNBdWJtOUdhV3hzS0NrN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhSb2FYTXVYM0F1Y21WamRDaGliM1Z1WkhOWUxDQmliM1Z1WkhOWkxDQjBhR2x6TG5kcFpIUm9MQ0IwYUdsekxtaGxhV2RvZENrN0lDQWdJQ0FnSUNBZ0lDQWdYSEpjYmlBZ0lDQWdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lIUm9hWE11WDNBdWNHOXdLQ2s3WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dVSEp2YW1WamRDQjBhR1VnWTI5dmNtUnBibUYwWlhNZ0tIZ3NJSGtwSUdsdWRHOGdZU0J5YjNSaGRHVmtJR052YjNKa2FXNWhkR1VnYzNsemRHVnRYSEpjYmlBcUlFQndjbWwyWVhSbFhISmNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0I0SUMwZ1dDQmpiMjl5WkdsdVlYUmxJQ2hwYmlCMWJuSnZkR0YwWldRZ2MzQmhZMlVwWEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQjVJQzBnV1NCamIyOXlaR2x1WVhSbElDaHBiaUIxYm5KdmRHRjBaV1FnYzNCaFkyVXBYSEpjYmlBcUlFQndZWEpoYlNCN2JuVnRZbVZ5ZlNCaGJtZHNaU0F0SUZKaFpHbGhibk1nYjJZZ2NtOTBZWFJwYjI0Z2RHOGdZWEJ3YkhsY2NseHVJQ29nUUhKbGRIVnliaUI3YjJKcVpXTjBmU0JQWW1wbFkzUWdkMmwwYUNCNElDWWdlU0J3Y205d1pYSjBhV1Z6WEhKY2JpQXFMMXh5WEc1Q1ltOTRRV3hwWjI1bFpGUmxlSFF1Y0hKdmRHOTBlWEJsTGw5allXeGpkV3hoZEdWU2IzUmhkR1ZrUTI5dmNtUnpJRDBnWm5WdVkzUnBiMjRnS0hnc0lIa3NJR0Z1WjJ4bEtTQjdJQ0JjY2x4dUlDQWdJSFpoY2lCeWVDQTlJRTFoZEdndVkyOXpLR0Z1WjJ4bEtTQXFJSGdnS3lCTllYUm9MbU52Y3loTllYUm9MbEJKSUM4Z01pQXRJR0Z1WjJ4bEtTQXFJSGs3WEhKY2JpQWdJQ0IyWVhJZ2Nua2dQU0F0VFdGMGFDNXphVzRvWVc1bmJHVXBJQ29nZUNBcklFMWhkR2d1YzJsdUtFMWhkR2d1VUVrZ0x5QXlJQzBnWVc1bmJHVXBJQ29nZVR0Y2NseHVJQ0FnSUhKbGRIVnliaUI3ZURvZ2NuZ3NJSGs2SUhKNWZUdGNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtseHlYRzRnS2lCRFlXeGpkV3hoZEdWeklHUnlZWGNnWTI5dmNtUnBibUYwWlhNZ1ptOXlJSFJvWlNCMFpYaDBMQ0JoYkdsbmJtbHVaeUJpWVhObFpDQnZiaUIwYUdVZ1ltOTFibVJwYm1jZ1ltOTRMbHh5WEc0Z0tpQlVhR1VnZEdWNGRDQnBjeUJsZG1WdWRIVmhiR3g1SUdSeVlYZHVJSGRwZEdnZ1kyRnVkbUZ6SUdGc2FXZHViV1Z1ZENCelpYUWdkRzhnYkdWbWRDQW1JR0poYzJWc2FXNWxMQ0J6YjF4eVhHNGdLaUIwYUdseklHWjFibU4wYVc5dUlIUmhhMlZ6SUdFZ1pHVnphWEpsWkNCd2IzTWdKaUJoYkdsbmJtMWxiblFnWVc1a0lISmxkSFZ5Ym5NZ2RHaGxJR0Z3Y0hKdmNISnBZWFJsWEhKY2JpQXFJR052YjNKa2FXNWhkR1Z6SUdadmNpQjBhR1VnYkdWbWRDQW1JR0poYzJWc2FXNWxMbHh5WEc0Z0tpQkFjSEpwZG1GMFpWeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnZUNBdElGZ2dZMjl2Y21ScGJtRjBaVnh5WEc0Z0tpQkFjR0Z5WVcwZ2UyNTFiV0psY24wZ2VTQXRJRmtnWTI5dmNtUnBibUYwWlZ4eVhHNGdLaUJBY21WMGRYSnVJSHR2WW1wbFkzUjlJRTlpYW1WamRDQjNhWFJvSUhnZ0ppQjVJSEJ5YjNCbGNuUnBaWE5jY2x4dUlDb3ZYSEpjYmtKaWIzaEJiR2xuYm1Wa1ZHVjRkQzV3Y205MGIzUjVjR1V1WDJOaGJHTjFiR0YwWlVGc2FXZHVaV1JEYjI5eVpITWdQU0JtZFc1amRHbHZiaWg0TENCNUtTQjdYSEpjYmlBZ0lDQjJZWElnYm1WM1dDd2dibVYzV1R0Y2NseHVJQ0FnSUhOM2FYUmphQ0FvZEdocGN5NWZhRUZzYVdkdUtTQjdYSEpjYmlBZ0lDQWdJQ0FnWTJGelpTQkNZbTk0UVd4cFoyNWxaRlJsZUhRdVFVeEpSMDR1UWs5WVgweEZSbFE2WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzVsZDFnZ1BTQjRPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmljbVZoYXp0Y2NseHVJQ0FnSUNBZ0lDQmpZWE5sSUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQzVCVEVsSFRpNUNUMWhmUTBWT1ZFVlNPbHh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnVaWGRZSUQwZ2VDQXRJSFJvYVhNdWFHRnNabGRwWkhSb08xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCaWNtVmhhenRjY2x4dUlDQWdJQ0FnSUNCallYTmxJRUppYjNoQmJHbG5ibVZrVkdWNGRDNUJURWxIVGk1Q1QxaGZVa2xIU0ZRNlhISmNiaUFnSUNBZ0lDQWdJQ0FnSUc1bGQxZ2dQU0I0SUMwZ2RHaHBjeTUzYVdSMGFEdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1luSmxZV3M3WEhKY2JpQWdJQ0FnSUNBZ1pHVm1ZWFZzZERwY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYm1WM1dDQTlJSGc3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR052Ym5OdmJHVXViRzluS0Z3aVZXNXlaV052WjI1cGVtVmtJR2h2Y21sNmIyNWhiQ0JoYkdsbmJqcGNJaXdnZEdocGN5NWZhRUZzYVdkdUtUdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ1luSmxZV3M3WEhKY2JpQWdJQ0I5WEhKY2JpQWdJQ0J6ZDJsMFkyZ2dLSFJvYVhNdVgzWkJiR2xuYmlrZ2UxeHlYRzRnSUNBZ0lDQWdJR05oYzJVZ1FtSnZlRUZzYVdkdVpXUlVaWGgwTGtKQlUwVk1TVTVGTGtKUFdGOVVUMUE2WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzVsZDFrZ1BTQjVJQzBnZEdocGN5NWZZbTkxYm1SelQyWm1jMlYwTG5rN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdKeVpXRnJPMXh5WEc0Z0lDQWdJQ0FnSUdOaGMyVWdRbUp2ZUVGc2FXZHVaV1JVWlhoMExrSkJVMFZNU1U1RkxrSlBXRjlEUlU1VVJWSTZYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHNWxkMWtnUFNCNUlDc2dkR2hwY3k1ZlpHbHpkRUpoYzJWVWIwMXBaRHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdZbkpsWVdzN1hISmNiaUFnSUNBZ0lDQWdZMkZ6WlNCQ1ltOTRRV3hwWjI1bFpGUmxlSFF1UWtGVFJVeEpUa1V1UWs5WVgwSlBWRlJQVFRwY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYm1WM1dTQTlJSGtnTFNCMGFHbHpMbDlrYVhOMFFtRnpaVlJ2UW05MGRHOXRPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmljbVZoYXp0Y2NseHVJQ0FnSUNBZ0lDQmpZWE5sSUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQzVDUVZORlRFbE9SUzVHVDA1VVgwTkZUbFJGVWpwY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1NHVnBaMmgwSUdseklHRndjSEp2ZUdsdFlYUmxaQ0JoY3lCaGMyTmxiblFnS3lCa1pYTmpaVzUwWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzVsZDFrZ1BTQjVJQzBnZEdocGN5NWZaR1Z6WTJWdWRDQXJJQ2gwYUdsekxsOWhjMk5sYm5RZ0t5QjBhR2x6TGw5a1pYTmpaVzUwS1NBdklESTdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHSnlaV0ZyTzF4eVhHNGdJQ0FnSUNBZ0lHTmhjMlVnUW1KdmVFRnNhV2R1WldSVVpYaDBMa0pCVTBWTVNVNUZMa0ZNVUVoQlFrVlVTVU02WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzVsZDFrZ1BTQjVPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmljbVZoYXp0Y2NseHVJQ0FnSUNBZ0lDQmtaV1poZFd4ME9seHlYRzRnSUNBZ0lDQWdJQ0FnSUNCdVpYZFpJRDBnZVR0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dWMyOXNaUzVzYjJjb1hDSlZibkpsWTI5bmJtbDZaV1FnZG1WeWRHbGpZV3dnWVd4cFoyNDZYQ0lzSUhSb2FYTXVYM1pCYkdsbmJpazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHSnlaV0ZyTzF4eVhHNGdJQ0FnZlZ4eVhHNGdJQ0FnY21WMGRYSnVJSHQ0T2lCdVpYZFlMQ0I1T2lCdVpYZFpmVHRjY2x4dWZUdGNjbHh1WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUTJGc1kzVnNZWFJsY3lCaWIzVnVaR2x1WnlCaWIzZ2dZVzVrSUhaaGNtbHZkWE1nYldWMGNtbGpjeUJtYjNJZ2RHaGxJR04xY25KbGJuUWdkR1Y0ZENCaGJtUWdabTl1ZEZ4eVhHNGdLaUJBY0hKcGRtRjBaVnh5WEc0Z0tpOWNjbHh1UW1KdmVFRnNhV2R1WldSVVpYaDBMbkJ5YjNSdmRIbHdaUzVmWTJGc1kzVnNZWFJsVFdWMGNtbGpjeUE5SUdaMWJtTjBhVzl1S0hOb2IzVnNaRlZ3WkdGMFpVaGxhV2RvZENrZ2V5QWdYSEpjYmlBZ0lDQXZMeUJ3TlNBd0xqVXVNQ0JvWVhNZ1lTQmlkV2NnTFNCMFpYaDBJR0p2ZFc1a2N5QmhjbVVnWTJ4cGNIQmxaQ0JpZVNBb01Dd2dNQ2xjY2x4dUlDQWdJQzh2SUVOaGJHTjFiR0YwYVc1bklHSnZkVzVrY3lCb1lXTnJYSEpjYmlBZ0lDQjJZWElnWW05MWJtUnpJRDBnZEdocGN5NWZabTl1ZEM1MFpYaDBRbTkxYm1SektIUm9hWE11WDNSbGVIUXNJREV3TURBc0lERXdNREFzSUhSb2FYTXVYMlp2Ym5SVGFYcGxLVHRjY2x4dUlDQWdJQzh2SUVKdmRXNWtjeUJwY3lCaElISmxabVZ5Wlc1alpTQXRJR2xtSUhkbElHMWxjM01nZDJsMGFDQnBkQ0JrYVhKbFkzUnNlU3dnZDJVZ1kyRnVJRzFsYzNNZ2RYQWdYSEpjYmlBZ0lDQXZMeUJtZFhSMWNtVWdkbUZzZFdWeklTQW9TWFFnWTJoaGJtZGxjeUIwYUdVZ1ltSnZlQ0JqWVdOb1pTQnBiaUJ3TlM0cFhISmNiaUFnSUNCaWIzVnVaSE1nUFNCN0lGeHlYRzRnSUNBZ0lDQWdJSGc2SUdKdmRXNWtjeTU0SUMwZ01UQXdNQ3dnWEhKY2JpQWdJQ0FnSUNBZ2VUb2dZbTkxYm1Sekxua2dMU0F4TURBd0xDQmNjbHh1SUNBZ0lDQWdJQ0IzT2lCaWIzVnVaSE11ZHl3Z1hISmNiaUFnSUNBZ0lDQWdhRG9nWW05MWJtUnpMbWdnWEhKY2JpQWdJQ0I5T3lCY2NseHVYSEpjYmlBZ0lDQnBaaUFvYzJodmRXeGtWWEJrWVhSbFNHVnBaMmgwS1NCN1hISmNiaUFnSUNBZ0lDQWdkR2hwY3k1ZllYTmpaVzUwSUQwZ2RHaHBjeTVmWm05dWRDNWZkR1Y0ZEVGelkyVnVkQ2gwYUdsekxsOW1iMjUwVTJsNlpTazdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZaR1Z6WTJWdWRDQTlJSFJvYVhNdVgyWnZiblF1WDNSbGVIUkVaWE5qWlc1MEtIUm9hWE11WDJadmJuUlRhWHBsS1R0Y2NseHVJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQXZMeUJWYzJVZ1ltOTFibVJ6SUhSdklHTmhiR04xYkdGMFpTQm1iMjUwSUcxbGRISnBZM05jY2x4dUlDQWdJSFJvYVhNdWQybGtkR2dnUFNCaWIzVnVaSE11ZHp0Y2NseHVJQ0FnSUhSb2FYTXVhR1ZwWjJoMElEMGdZbTkxYm1SekxtZzdYSEpjYmlBZ0lDQjBhR2x6TG1oaGJHWlhhV1IwYUNBOUlIUm9hWE11ZDJsa2RHZ2dMeUF5TzF4eVhHNGdJQ0FnZEdocGN5NW9ZV3htU0dWcFoyaDBJRDBnZEdocGN5NW9aV2xuYUhRZ0x5QXlPMXh5WEc0Z0lDQWdkR2hwY3k1ZlltOTFibVJ6VDJabWMyVjBJRDBnZXlCNE9pQmliM1Z1WkhNdWVDd2dlVG9nWW05MWJtUnpMbmtnZlR0Y2NseHVJQ0FnSUhSb2FYTXVYMlJwYzNSQ1lYTmxWRzlOYVdRZ1BTQk5ZWFJvTG1GaWN5aGliM1Z1WkhNdWVTa2dMU0IwYUdsekxtaGhiR1pJWldsbmFIUTdYSEpjYmlBZ0lDQjBhR2x6TGw5a2FYTjBRbUZ6WlZSdlFtOTBkRzl0SUQwZ2RHaHBjeTVvWldsbmFIUWdMU0JOWVhSb0xtRmljeWhpYjNWdVpITXVlU2s3WEhKY2JuMDdJaXdpWlhod2IzSjBjeTVrWldaaGRXeDBJRDBnWm5WdVkzUnBiMjRvZG1Gc2RXVXNJR1JsWm1GMWJIUldZV3gxWlNrZ2UxeHlYRzRnSUNBZ2NtVjBkWEp1SUNoMllXeDFaU0FoUFQwZ2RXNWtaV1pwYm1Wa0tTQS9JSFpoYkhWbElEb2daR1ZtWVhWc2RGWmhiSFZsTzF4eVhHNTlPeUlzSW0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnU0c5MlpYSlRiR2xrWlhOb2IzZHpPMXh5WEc1Y2NseHVkbUZ5SUhWMGFXeHBkR2xsY3lBOUlISmxjWFZwY21Vb1hDSXVMM1YwYVd4cGRHbGxjeTVxYzF3aUtUdGNjbHh1WEhKY2JtWjFibU4wYVc5dUlFaHZkbVZ5VTJ4cFpHVnphRzkzY3loemJHbGtaWE5vYjNkRVpXeGhlU3dnZEhKaGJuTnBkR2x2YmtSMWNtRjBhVzl1S1NCN1hISmNiaUFnZEdocGN5NWZjMnhwWkdWemFHOTNSR1ZzWVhrZ1BTQnpiR2xrWlhOb2IzZEVaV3hoZVNBaFBUMGdkVzVrWldacGJtVmtJRDhnYzJ4cFpHVnphRzkzUkdWc1lYa2dPaUF5TURBd08xeHlYRzRnSUhSb2FYTXVYM1J5WVc1emFYUnBiMjVFZFhKaGRHbHZiaUE5SUhSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlBaFBUMGdkVzVrWldacGJtVmtJRDhnZEhKaGJuTnBkR2x2YmtSMWNtRjBhVzl1SURvZ01UQXdNRHRjY2x4dVhISmNiaUFnZEdocGN5NWZjMnhwWkdWemFHOTNjeUE5SUZ0ZE8xeHlYRzRnSUhSb2FYTXVjbVZzYjJGa0tDazdYSEpjYm4xY2NseHVYSEpjYmtodmRtVnlVMnhwWkdWemFHOTNjeTV3Y205MGIzUjVjR1V1Y21Wc2IyRmtJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnTHk4Z1RtOTBaVG9nZEdocGN5QnBjeUJqZFhKeVpXNTBiSGtnYm05MElISmxZV3hzZVNCaVpXbHVaeUIxYzJWa0xpQlhhR1Z1SUdFZ2NHRm5aU0JwY3lCc2IyRmtaV1FzWEhKY2JpQWdMeThnYldGcGJpNXFjeUJwY3lCcWRYTjBJSEpsTFdsdWMzUmhibU5wYm1jZ2RHaGxJRWh2ZG1WeVUyeHBaR1Z6YUc5M2MxeHlYRzRnSUhaaGNpQnZiR1JUYkdsa1pYTm9iM2R6SUQwZ2RHaHBjeTVmYzJ4cFpHVnphRzkzY3lCOGZDQmJYVHRjY2x4dUlDQjBhR2x6TGw5emJHbGtaWE5vYjNkeklEMGdXMTA3WEhKY2JpQWdKQ2hjSWk1b2IzWmxjaTF6Ykdsa1pYTm9iM2RjSWlrdVpXRmphQ2hjY2x4dUlDQWdJR1oxYm1OMGFXOXVLRjhzSUdWc1pXMWxiblFwSUh0Y2NseHVJQ0FnSUNBZ2RtRnlJQ1JsYkdWdFpXNTBJRDBnSkNobGJHVnRaVzUwS1R0Y2NseHVJQ0FnSUNBZ2RtRnlJR2x1WkdWNElEMGdkR2hwY3k1ZlptbHVaRWx1VTJ4cFpHVnphRzkzY3lobGJHVnRaVzUwTENCdmJHUlRiR2xrWlhOb2IzZHpLVHRjY2x4dUlDQWdJQ0FnYVdZZ0tHbHVaR1Y0SUNFOVBTQXRNU2tnZTF4eVhHNGdJQ0FnSUNBZ0lIWmhjaUJ6Ykdsa1pYTm9iM2NnUFNCdmJHUlRiR2xrWlhOb2IzZHpMbk53YkdsalpTaHBibVJsZUN3Z01TbGJNRjA3WEhKY2JpQWdJQ0FnSUNBZ2RHaHBjeTVmYzJ4cFpHVnphRzkzY3k1d2RYTm9LSE5zYVdSbGMyaHZkeWs3WEhKY2JpQWdJQ0FnSUgwZ1pXeHpaU0I3WEhKY2JpQWdJQ0FnSUNBZ2RHaHBjeTVmYzJ4cFpHVnphRzkzY3k1d2RYTm9LRnh5WEc0Z0lDQWdJQ0FnSUNBZ2JtVjNJRk5zYVdSbGMyaHZkeWdrWld4bGJXVnVkQ3dnZEdocGN5NWZjMnhwWkdWemFHOTNSR1ZzWVhrc0lIUm9hWE11WDNSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlsY2NseHVJQ0FnSUNBZ0lDQXBPMXh5WEc0Z0lDQWdJQ0I5WEhKY2JpQWdJQ0I5TG1KcGJtUW9kR2hwY3lsY2NseHVJQ0FwTzF4eVhHNTlPMXh5WEc1Y2NseHVTRzkyWlhKVGJHbGtaWE5vYjNkekxuQnliM1J2ZEhsd1pTNWZabWx1WkVsdVUyeHBaR1Z6YUc5M2N5QTlJR1oxYm1OMGFXOXVLR1ZzWlcxbGJuUXNJSE5zYVdSbGMyaHZkM01wSUh0Y2NseHVJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUhOc2FXUmxjMmh2ZDNNdWJHVnVaM1JvT3lCcElDczlJREVwSUh0Y2NseHVJQ0FnSUdsbUlDaGxiR1Z0Wlc1MElEMDlQU0J6Ykdsa1pYTm9iM2R6VzJsZExtZGxkRVZzWlcxbGJuUW9LU2tnZTF4eVhHNGdJQ0FnSUNCeVpYUjFjbTRnYVR0Y2NseHVJQ0FnSUgxY2NseHVJQ0I5WEhKY2JpQWdjbVYwZFhKdUlDMHhPMXh5WEc1OU8xeHlYRzVjY2x4dVpuVnVZM1JwYjI0Z1UyeHBaR1Z6YUc5M0tDUmpiMjUwWVdsdVpYSXNJSE5zYVdSbGMyaHZkMFJsYkdGNUxDQjBjbUZ1YzJsMGFXOXVSSFZ5WVhScGIyNHBJSHRjY2x4dUlDQjBhR2x6TGw4a1kyOXVkR0ZwYm1WeUlEMGdKR052Ym5SaGFXNWxjanRjY2x4dUlDQjBhR2x6TGw5emJHbGtaWE5vYjNkRVpXeGhlU0E5SUhOc2FXUmxjMmh2ZDBSbGJHRjVPMXh5WEc0Z0lIUm9hWE11WDNSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlBOUlIUnlZVzV6YVhScGIyNUVkWEpoZEdsdmJqdGNjbHh1SUNCMGFHbHpMbDkwYVcxbGIzVjBTV1FnUFNCdWRXeHNPMXh5WEc0Z0lIUm9hWE11WDJsdFlXZGxTVzVrWlhnZ1BTQXdPMXh5WEc0Z0lIUm9hWE11WHlScGJXRm5aWE1nUFNCYlhUdGNjbHh1WEhKY2JpQWdMeThnVTJWMElIVndJR0Z1WkNCallXTm9aU0J5WldabGNtVnVZMlZ6SUhSdklHbHRZV2RsYzF4eVhHNGdJSFJvYVhNdVh5UmpiMjUwWVdsdVpYSXVabWx1WkNoY0ltbHRaMXdpS1M1bFlXTm9LRnh5WEc0Z0lDQWdablZ1WTNScGIyNG9hVzVrWlhnc0lHVnNaVzFsYm5RcElIdGNjbHh1SUNBZ0lDQWdkbUZ5SUNScGJXRm5aU0E5SUNRb1pXeGxiV1Z1ZENrN1hISmNiaUFnSUNBZ0lDUnBiV0ZuWlM1amMzTW9lMXh5WEc0Z0lDQWdJQ0FnSUhCdmMybDBhVzl1T2lCY0ltRmljMjlzZFhSbFhDSXNYSEpjYmlBZ0lDQWdJQ0FnZEc5d09pQmNJakJjSWl4Y2NseHVJQ0FnSUNBZ0lDQnNaV1owT2lCY0lqQmNJaXhjY2x4dUlDQWdJQ0FnSUNCNlNXNWtaWGc2SUdsdVpHVjRJRDA5UFNBd0lEOGdNaUE2SURBZ0x5OGdSbWx5YzNRZ2FXMWhaMlVnYzJodmRXeGtJR0psSUc5dUlIUnZjRnh5WEc0Z0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ2RHaHBjeTVmSkdsdFlXZGxjeTV3ZFhOb0tDUnBiV0ZuWlNrN1hISmNiaUFnSUNCOUxtSnBibVFvZEdocGN5bGNjbHh1SUNBcE8xeHlYRzVjY2x4dUlDQXZMeUJFWlhSbGNtMXBibVVnZDJobGRHaGxjaUIwYnlCaWFXNWtJR2x1ZEdWeVlXTjBhWFpwZEhsY2NseHVJQ0IwYUdsekxsOXVkVzFKYldGblpYTWdQU0IwYUdsekxsOGthVzFoWjJWekxteGxibWQwYUR0Y2NseHVJQ0JwWmlBb2RHaHBjeTVmYm5WdFNXMWhaMlZ6SUR3OUlERXBJSEpsZEhWeWJqdGNjbHh1WEhKY2JpQWdMeThnUW1sdVpDQmxkbVZ1ZENCc2FYTjBaVzVsY25OY2NseHVJQ0IwYUdsekxsOGtZMjl1ZEdGcGJtVnlMbTl1S0Z3aWJXOTFjMlZsYm5SbGNsd2lMQ0IwYUdsekxsOXZia1Z1ZEdWeUxtSnBibVFvZEdocGN5a3BPMXh5WEc0Z0lIUm9hWE11WHlSamIyNTBZV2x1WlhJdWIyNG9YQ0p0YjNWelpXeGxZWFpsWENJc0lIUm9hWE11WDI5dVRHVmhkbVV1WW1sdVpDaDBhR2x6S1NrN1hISmNibjFjY2x4dVhISmNibE5zYVdSbGMyaHZkeTV3Y205MGIzUjVjR1V1WjJWMFJXeGxiV1Z1ZENBOUlHWjFibU4wYVc5dUtDa2dlMXh5WEc0Z0lISmxkSFZ5YmlCMGFHbHpMbDhrWTI5dWRHRnBibVZ5TG1kbGRDZ3dLVHRjY2x4dWZUdGNjbHh1WEhKY2JsTnNhV1JsYzJodmR5NXdjbTkwYjNSNWNHVXVaMlYwSkVWc1pXMWxiblFnUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNCeVpYUjFjbTRnZEdocGN5NWZKR052Ym5SaGFXNWxjanRjY2x4dWZUdGNjbHh1WEhKY2JsTnNhV1JsYzJodmR5NXdjbTkwYjNSNWNHVXVYMjl1Ulc1MFpYSWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0F2THlCR2FYSnpkQ0IwY21GdWMybDBhVzl1SUhOb2IzVnNaQ0JvWVhCd1pXNGdjSEpsZEhSNUlITnZiMjRnWVdaMFpYSWdhRzkyWlhKcGJtY2dhVzRnYjNKa1pYSmNjbHh1SUNBdkx5QjBieUJqYkhWbElIUm9aU0IxYzJWeUlHbHVkRzhnZDJoaGRDQnBjeUJvWVhCd1pXNXBibWRjY2x4dUlDQjBhR2x6TGw5MGFXMWxiM1YwU1dRZ1BTQnpaWFJVYVcxbGIzVjBLSFJvYVhNdVgyRmtkbUZ1WTJWVGJHbGtaWE5vYjNjdVltbHVaQ2gwYUdsektTd2dOVEF3S1R0Y2NseHVmVHRjY2x4dVhISmNibE5zYVdSbGMyaHZkeTV3Y205MGIzUjVjR1V1WDI5dVRHVmhkbVVnUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNCamJHVmhja2x1ZEdWeWRtRnNLSFJvYVhNdVgzUnBiV1Z2ZFhSSlpDazdYSEpjYmlBZ2RHaHBjeTVmZEdsdFpXOTFkRWxrSUQwZ2JuVnNiRHRjY2x4dWZUdGNjbHh1WEhKY2JsTnNhV1JsYzJodmR5NXdjbTkwYjNSNWNHVXVYMkZrZG1GdVkyVlRiR2xrWlhOb2IzY2dQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0IwYUdsekxsOXBiV0ZuWlVsdVpHVjRJQ3M5SURFN1hISmNiaUFnZG1GeUlHazdYSEpjYmx4eVhHNGdJQzh2SUUxdmRtVWdkR2hsSUdsdFlXZGxJR1p5YjIwZ01pQnpkR1Z3Y3lCaFoyOGdaRzkzYmlCMGJ5QjBhR1VnWW05MGRHOXRJSG90YVc1a1pYZ2dZVzVrSUcxaGEyVmNjbHh1SUNBdkx5QnBkQ0JwYm5acGMybGliR1ZjY2x4dUlDQnBaaUFvZEdocGN5NWZiblZ0U1cxaFoyVnpJRDQ5SURNcElIdGNjbHh1SUNBZ0lHa2dQU0IxZEdsc2FYUnBaWE11ZDNKaGNFbHVaR1Y0S0hSb2FYTXVYMmx0WVdkbFNXNWtaWGdnTFNBeUxDQjBhR2x6TGw5dWRXMUpiV0ZuWlhNcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkdsdFlXZGxjMXRwWFM1amMzTW9lMXh5WEc0Z0lDQWdJQ0I2U1c1a1pYZzZJREFzWEhKY2JpQWdJQ0FnSUc5d1lXTnBkSGs2SURCY2NseHVJQ0FnSUgwcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkdsdFlXZGxjMXRwWFM1MlpXeHZZMmwwZVNoY0luTjBiM0JjSWlrN1hISmNiaUFnZlZ4eVhHNWNjbHh1SUNBdkx5Qk5iM1psSUhSb1pTQnBiV0ZuWlNCbWNtOXRJREVnYzNSbGNITWdZV2R2SUdSdmQyNGdkRzhnZEdobElHMXBaR1JzWlNCNkxXbHVaR1Y0SUdGdVpDQnRZV3RsWEhKY2JpQWdMeThnYVhRZ1kyOXRjR3hsZEdWc2VTQjJhWE5wWW14bFhISmNiaUFnYVdZZ0tIUm9hWE11WDI1MWJVbHRZV2RsY3lBK1BTQXlLU0I3WEhKY2JpQWdJQ0JwSUQwZ2RYUnBiR2wwYVdWekxuZHlZWEJKYm1SbGVDaDBhR2x6TGw5cGJXRm5aVWx1WkdWNElDMGdNU3dnZEdocGN5NWZiblZ0U1cxaFoyVnpLVHRjY2x4dUlDQWdJSFJvYVhNdVh5UnBiV0ZuWlhOYmFWMHVZM056S0h0Y2NseHVJQ0FnSUNBZ2VrbHVaR1Y0T2lBeExGeHlYRzRnSUNBZ0lDQnZjR0ZqYVhSNU9pQXhYSEpjYmlBZ0lDQjlLVHRjY2x4dUlDQWdJSFJvYVhNdVh5UnBiV0ZuWlhOYmFWMHVkbVZzYjJOcGRIa29YQ0p6ZEc5d1hDSXBPMXh5WEc0Z0lIMWNjbHh1WEhKY2JpQWdMeThnVFc5MlpTQjBhR1VnWTNWeWNtVnVkQ0JwYldGblpTQjBieUIwYUdVZ2RHOXdJSG90YVc1a1pYZ2dZVzVrSUdaaFpHVWdhWFFnYVc1Y2NseHVJQ0IwYUdsekxsOXBiV0ZuWlVsdVpHVjRJRDBnZFhScGJHbDBhV1Z6TG5keVlYQkpibVJsZUNoMGFHbHpMbDlwYldGblpVbHVaR1Y0TENCMGFHbHpMbDl1ZFcxSmJXRm5aWE1wTzF4eVhHNGdJSFJvYVhNdVh5UnBiV0ZuWlhOYmRHaHBjeTVmYVcxaFoyVkpibVJsZUYwdVkzTnpLSHRjY2x4dUlDQWdJSHBKYm1SbGVEb2dNaXhjY2x4dUlDQWdJRzl3WVdOcGRIazZJREJjY2x4dUlDQjlLVHRjY2x4dUlDQjBhR2x6TGw4a2FXMWhaMlZ6VzNSb2FYTXVYMmx0WVdkbFNXNWtaWGhkTG5abGJHOWphWFI1S0Z4eVhHNGdJQ0FnZTF4eVhHNGdJQ0FnSUNCdmNHRmphWFI1T2lBeFhISmNiaUFnSUNCOUxGeHlYRzRnSUNBZ2RHaHBjeTVmZEhKaGJuTnBkR2x2YmtSMWNtRjBhVzl1TEZ4eVhHNGdJQ0FnWENKbFlYTmxTVzVQZFhSUmRXRmtYQ0pjY2x4dUlDQXBPMXh5WEc1Y2NseHVJQ0F2THlCVFkyaGxaSFZzWlNCdVpYaDBJSFJ5WVc1emFYUnBiMjVjY2x4dUlDQjBhR2x6TGw5MGFXMWxiM1YwU1dRZ1BTQnpaWFJVYVcxbGIzVjBLSFJvYVhNdVgyRmtkbUZ1WTJWVGJHbGtaWE5vYjNjdVltbHVaQ2gwYUdsektTd2dkR2hwY3k1ZmMyeHBaR1Z6YUc5M1JHVnNZWGtwTzF4eVhHNTlPMXh5WEc0aUxDSnRiMlIxYkdVdVpYaHdiM0owY3lBOUlFSmhjMlZNYjJkdlUydGxkR05vTzF4eVhHNWNjbHh1ZG1GeUlIVjBhV3h6SUQwZ2NtVnhkV2x5WlNoY0lpNHVMM1YwYVd4cGRHbGxjeTVxYzF3aUtUdGNjbHh1WEhKY2JtWjFibU4wYVc5dUlFSmhjMlZNYjJkdlUydGxkR05vS0NSdVlYWXNJQ1J1WVhaTWIyZHZMQ0JtYjI1MFVHRjBhQ2tnZTF4eVhHNGdJSFJvYVhNdVh5UnVZWFlnUFNBa2JtRjJPMXh5WEc0Z0lIUm9hWE11WHlSdVlYWk1iMmR2SUQwZ0pHNWhka3h2WjI4N1hISmNiaUFnZEdocGN5NWZabTl1ZEZCaGRHZ2dQU0JtYjI1MFVHRjBhRHRjY2x4dVhISmNiaUFnZEdocGN5NWZkR1Y0ZENBOUlIUm9hWE11WHlSdVlYWk1iMmR2TG5SbGVIUW9LVHRjY2x4dUlDQjBhR2x6TGw5cGMwWnBjbk4wUm5KaGJXVWdQU0IwY25WbE8xeHlYRzRnSUhSb2FYTXVYMmx6VFc5MWMyVlBkbVZ5SUQwZ1ptRnNjMlU3WEhKY2JpQWdkR2hwY3k1ZmFYTlBkbVZ5VG1GMlRHOW5ieUE5SUdaaGJITmxPMXh5WEc1Y2NseHVJQ0IwYUdsekxsOTFjR1JoZEdWVVpYaDBUMlptYzJWMEtDazdYSEpjYmlBZ2RHaHBjeTVmZFhCa1lYUmxVMmw2WlNncE8xeHlYRzRnSUhSb2FYTXVYM1Z3WkdGMFpVWnZiblJUYVhwbEtDazdYSEpjYmx4eVhHNGdJQzh2SUVOeVpXRjBaU0JoSUNoeVpXeGhkR2wyWlNCd2IzTnBkR2x2Ym1Wa0tTQmpiMjUwWVdsdVpYSWdabTl5SUhSb1pTQnphMlYwWTJnZ2FXNXphV1JsSUc5bUlIUm9aVnh5WEc0Z0lDOHZJRzVoZGl3Z1luVjBJRzFoYTJVZ2MzVnlaU0IwYUdGMElHbDBJR2x6SUVKRlNFbE9SQ0JsZG1WeWVYUm9hVzVuSUdWc2MyVXVJRVYyWlc1MGRXRnNiSGtzSUhkbElIZHBiR3hjY2x4dUlDQXZMeUJrY205d0lHcDFjM1FnZEdobElHNWhkaUJzYjJkdklDaHViM1FnZEdobElHNWhkaUJzYVc1cmN5RXBJR0psYUdsdVpDQjBhR1VnWTJGdWRtRnpMbHh5WEc0Z0lIUm9hWE11WHlSamIyNTBZV2x1WlhJZ1BTQWtLRndpUEdScGRqNWNJaWxjY2x4dUlDQWdJQzVqYzNNb2UxeHlYRzRnSUNBZ0lDQndiM05wZEdsdmJqb2dYQ0poWW5OdmJIVjBaVndpTEZ4eVhHNGdJQ0FnSUNCMGIzQTZJRndpTUhCNFhDSXNYSEpjYmlBZ0lDQWdJR3hsWm5RNklGd2lNSEI0WENKY2NseHVJQ0FnSUgwcFhISmNiaUFnSUNBdWNISmxjR1Z1WkZSdktIUm9hWE11WHlSdVlYWXBYSEpjYmlBZ0lDQXVhR2xrWlNncE8xeHlYRzVjY2x4dUlDQjBhR2x6TGw5amNtVmhkR1ZRTlVsdWMzUmhibU5sS0NrN1hISmNibjFjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJEY21WaGRHVWdZU0J1WlhjZ2NEVWdhVzV6ZEdGdVkyVWdZVzVrSUdKcGJtUWdkR2hsSUdGd2NISnZjSEpwWVhSbElHTnNZWE56SUcxbGRHaHZaSE1nZEc4Z2RHaGxYSEpjYmlBcUlHbHVjM1JoYm1ObExpQlVhR2x6SUdGc2MyOGdabWxzYkhNZ2FXNGdkR2hsSUhBZ2NHRnlZVzFsZEdWeUlHOXVJSFJvWlNCamJHRnpjeUJ0WlhSb2IyUnpJQ2h6WlhSMWNDeGNjbHh1SUNvZ1pISmhkeXdnWlhSakxpa2djMjhnZEdoaGRDQjBhRzl6WlNCbWRXNWpkR2x2Ym5NZ1kyRnVJR0psSUdFZ2JHbDBkR3hsSUd4bGMzTWdkbVZ5WW05elpTQTZLVnh5WEc0Z0tpOWNjbHh1UW1GelpVeHZaMjlUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDlqY21WaGRHVlFOVWx1YzNSaGJtTmxJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnYm1WM0lIQTFLRnh5WEc0Z0lDQWdablZ1WTNScGIyNG9jQ2tnZTF4eVhHNGdJQ0FnSUNCMGFHbHpMbDl3SUQwZ2NEdGNjbHh1SUNBZ0lDQWdjQzV3Y21Wc2IyRmtJRDBnZEdocGN5NWZjSEpsYkc5aFpDNWlhVzVrS0hSb2FYTXNJSEFwTzF4eVhHNGdJQ0FnSUNCd0xuTmxkSFZ3SUQwZ2RHaHBjeTVmYzJWMGRYQXVZbWx1WkNoMGFHbHpMQ0J3S1R0Y2NseHVJQ0FnSUNBZ2NDNWtjbUYzSUQwZ2RHaHBjeTVmWkhKaGR5NWlhVzVrS0hSb2FYTXNJSEFwTzF4eVhHNGdJQ0FnZlM1aWFXNWtLSFJvYVhNcExGeHlYRzRnSUNBZ2RHaHBjeTVmSkdOdmJuUmhhVzVsY2k1blpYUW9NQ2xjY2x4dUlDQXBPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFWnBibVFnZEdobElHUnBjM1JoYm1ObElHWnliMjBnZEdobElIUnZjQ0JzWldaMElHOW1JSFJvWlNCdVlYWWdkRzhnZEdobElHSnlZVzVrSUd4dloyOG5jeUJpWVhObGJHbHVaUzVjY2x4dUlDb3ZYSEpjYmtKaGMyVk1iMmR2VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmZFhCa1lYUmxWR1Y0ZEU5bVpuTmxkQ0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUhaaGNpQmlZWE5sYkdsdVpVUnBkaUE5SUNRb1hDSThaR2wyUGx3aUtWeHlYRzRnSUNBZ0xtTnpjeWg3WEhKY2JpQWdJQ0FnSUdScGMzQnNZWGs2SUZ3aWFXNXNhVzVsTFdKc2IyTnJYQ0lzWEhKY2JpQWdJQ0FnSUhabGNuUnBZMkZzUVd4cFoyNDZJRndpWW1GelpXeHBibVZjSWx4eVhHNGdJQ0FnZlNsY2NseHVJQ0FnSUM1d2NtVndaVzVrVkc4b2RHaHBjeTVmSkc1aGRreHZaMjhwTzF4eVhHNGdJSFpoY2lCdVlYWlBabVp6WlhRZ1BTQjBhR2x6TGw4a2JtRjJMbTltWm5ObGRDZ3BPMXh5WEc0Z0lIWmhjaUJzYjJkdlFtRnpaV3hwYm1WUFptWnpaWFFnUFNCaVlYTmxiR2x1WlVScGRpNXZabVp6WlhRb0tUdGNjbHh1SUNCMGFHbHpMbDkwWlhoMFQyWm1jMlYwSUQwZ2UxeHlYRzRnSUNBZ2RHOXdPaUJzYjJkdlFtRnpaV3hwYm1WUFptWnpaWFF1ZEc5d0lDMGdibUYyVDJabWMyVjBMblJ2Y0N4Y2NseHVJQ0FnSUd4bFpuUTZJR3h2WjI5Q1lYTmxiR2x1WlU5bVpuTmxkQzVzWldaMElDMGdibUYyVDJabWMyVjBMbXhsWm5SY2NseHVJQ0I5TzF4eVhHNGdJR0poYzJWc2FXNWxSR2wyTG5KbGJXOTJaU2dwTzF4eVhHNTlPMXh5WEc1Y2NseHVMeW9xWEhKY2JpQXFJRVpwYm1RZ2RHaGxJR0p2ZFc1a2FXNW5JR0p2ZUNCdlppQjBhR1VnWW5KaGJtUWdiRzluYnlCcGJpQjBhR1VnYm1GMkxpQlVhR2x6SUdKaWIzZ2dZMkZ1SUhSb1pXNGdZbVZjY2x4dUlDb2dkWE5sWkNCMGJ5QmpiMjUwY205c0lIZG9aVzRnZEdobElHTjFjbk52Y2lCemFHOTFiR1FnWW1VZ1lTQndiMmx1ZEdWeUxseHlYRzRnS2k5Y2NseHVRbUZ6WlV4dloyOVRhMlYwWTJndWNISnZkRzkwZVhCbExsOWpZV3hqZFd4aGRHVk9ZWFpNYjJkdlFtOTFibVJ6SUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2RtRnlJRzVoZGs5bVpuTmxkQ0E5SUhSb2FYTXVYeVJ1WVhZdWIyWm1jMlYwS0NrN1hISmNiaUFnZG1GeUlHeHZaMjlQWm1aelpYUWdQU0IwYUdsekxsOGtibUYyVEc5bmJ5NXZabVp6WlhRb0tUdGNjbHh1SUNCMGFHbHpMbDlzYjJkdlFtSnZlQ0E5SUh0Y2NseHVJQ0FnSUhrNklHeHZaMjlQWm1aelpYUXVkRzl3SUMwZ2JtRjJUMlptYzJWMExuUnZjQ3hjY2x4dUlDQWdJSGc2SUd4dloyOVBabVp6WlhRdWJHVm1kQ0F0SUc1aGRrOW1abk5sZEM1c1pXWjBMRnh5WEc0Z0lDQWdkem9nZEdocGN5NWZKRzVoZGt4dloyOHViM1YwWlhKWGFXUjBhQ2dwTENBdkx5QkZlR05zZFdSbElHMWhjbWRwYmlCbWNtOXRJSFJvWlNCaVltOTRYSEpjYmlBZ0lDQm9PaUIwYUdsekxsOGtibUYyVEc5bmJ5NXZkWFJsY2tobGFXZG9kQ2dwSUM4dklFeHBibXR6SUdGeVpXNG5kQ0JqYkdsamEyRmliR1VnYjI0Z2JXRnlaMmx1WEhKY2JpQWdmVHRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlZjR1JoZEdVZ2RHaGxJR1JwYldWdWMybHZibk1nZEc4Z2JXRjBZMmdnZEdobElHNWhkaUF0SUdWNFkyeDFaR2x1WnlCaGJua2diV0Z5WjJsdUxDQndZV1JrYVc1bklDWmNjbHh1SUNvZ1ltOXlaR1Z5TGx4eVhHNGdLaTljY2x4dVFtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5MWNHUmhkR1ZUYVhwbElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdkR2hwY3k1ZmQybGtkR2dnUFNCMGFHbHpMbDhrYm1GMkxtbHVibVZ5VjJsa2RHZ29LVHRjY2x4dUlDQjBhR2x6TGw5b1pXbG5hSFFnUFNCMGFHbHpMbDhrYm1GMkxtbHVibVZ5U0dWcFoyaDBLQ2s3WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dSM0poWWlCMGFHVWdabTl1ZENCemFYcGxJR1p5YjIwZ2RHaGxJR0p5WVc1a0lHeHZaMjhnYkdsdWF5NGdWR2hwY3lCdFlXdGxjeUIwYUdVZ1ptOXVkQ0J6YVhwbElHOW1JSFJvWlZ4eVhHNGdLaUJ6YTJWMFkyZ2djbVZ6Y0c5dWMybDJaUzVjY2x4dUlDb3ZYSEpjYmtKaGMyVk1iMmR2VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmZFhCa1lYUmxSbTl1ZEZOcGVtVWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0IwYUdsekxsOW1iMjUwVTJsNlpTQTlJSFJvYVhNdVh5UnVZWFpNYjJkdkxtTnpjeWhjSW1admJuUlRhWHBsWENJcExuSmxjR3hoWTJVb1hDSndlRndpTENCY0lsd2lLVHRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlhhR1Z1SUhSb1pTQmljbTkzYzJWeUlHbHpJSEpsYzJsNlpXUXNJSEpsWTJGc1kzVnNZWFJsSUdGc2JDQjBhR1VnYm1WalpYTnpZWEo1SUhOMFlYUnpJSE52SUhSb1lYUWdkR2hsWEhKY2JpQXFJSE5yWlhSamFDQmpZVzRnWW1VZ2NtVnpjRzl1YzJsMlpTNGdWR2hsSUd4dloyOGdhVzRnZEdobElITnJaWFJqYUNCemFHOTFiR1FnUVV4WFFWbFRJR1Y0WVdOMGJIa2diV0YwWTJoY2NseHVJQ29nZEdobElHSnlZVzVuSUd4dloyOGdiR2x1YXlCMGFHVWdTRlJOVEM1Y2NseHVJQ292WEhKY2JrSmhjMlZNYjJkdlUydGxkR05vTG5CeWIzUnZkSGx3WlM1ZmIyNVNaWE5wZW1VZ1BTQm1kVzVqZEdsdmJpaHdLU0I3WEhKY2JpQWdkR2hwY3k1ZmRYQmtZWFJsVTJsNlpTZ3BPMXh5WEc0Z0lIUm9hWE11WDNWd1pHRjBaVVp2Ym5SVGFYcGxLQ2s3WEhKY2JpQWdkR2hwY3k1ZmRYQmtZWFJsVkdWNGRFOW1abk5sZENncE8xeHlYRzRnSUhSb2FYTXVYMk5oYkdOMWJHRjBaVTVoZGt4dloyOUNiM1Z1WkhNb0tUdGNjbHh1SUNCd0xuSmxjMmw2WlVOaGJuWmhjeWgwYUdsekxsOTNhV1IwYUN3Z2RHaHBjeTVmYUdWcFoyaDBLVHRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlZjR1JoZEdVZ2RHaGxJRjlwYzAxdmRYTmxUM1psY2lCd2NtOXdaWEowZVM1Y2NseHVJQ292WEhKY2JrSmhjMlZNYjJkdlUydGxkR05vTG5CeWIzUnZkSGx3WlM1ZmMyVjBUVzkxYzJWUGRtVnlJRDBnWm5WdVkzUnBiMjRvYVhOTmIzVnpaVTkyWlhJcElIdGNjbHh1SUNCMGFHbHpMbDlwYzAxdmRYTmxUM1psY2lBOUlHbHpUVzkxYzJWUGRtVnlPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFbG1JSFJvWlNCamRYSnpiM0lnYVhNZ2MyVjBJSFJ2SUdFZ2NHOXBiblJsY2l3Z1ptOXlkMkZ5WkNCaGJua2dZMnhwWTJzZ1pYWmxiblJ6SUhSdklIUm9aU0J1WVhZZ2JHOW5ieTVjY2x4dUlDb2dWR2hwY3lCeVpXUjFZMlZ6SUhSb1pTQnVaV1ZrSUdadmNpQjBhR1VnWTJGdWRtRnpJSFJ2SUdSdklHRnVlU0JCU2tGWUxYa2djM1IxWm1ZdVhISmNiaUFxTDF4eVhHNUNZWE5sVEc5bmIxTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgyOXVRMnhwWTJzZ1BTQm1kVzVqZEdsdmJpaGxLU0I3WEhKY2JpQWdhV1lnS0hSb2FYTXVYMmx6VDNabGNrNWhka3h2WjI4cElIUm9hWE11WHlSdVlYWk1iMmR2TG5SeWFXZG5aWElvWlNrN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUW1GelpTQndjbVZzYjJGa0lHMWxkR2h2WkNCMGFHRjBJR3AxYzNRZ2JHOWhaSE1nZEdobElHNWxZMlZ6YzJGeWVTQm1iMjUwWEhKY2JpQXFMMXh5WEc1Q1lYTmxURzluYjFOclpYUmphQzV3Y205MGIzUjVjR1V1WDNCeVpXeHZZV1FnUFNCbWRXNWpkR2x2Ymlod0tTQjdYSEpjYmlBZ2RHaHBjeTVmWm05dWRDQTlJSEF1Ykc5aFpFWnZiblFvZEdocGN5NWZabTl1ZEZCaGRHZ3BPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFSmhjMlVnYzJWMGRYQWdiV1YwYUc5a0lIUm9ZWFFnWkc5bGN5QnpiMjFsSUdobFlYWjVJR3hwWm5ScGJtY3VJRWwwSUdocFpHVnpJSFJvWlNCdVlYWWdZbkpoYm1RZ2JHOW5iMXh5WEc0Z0tpQmhibVFnY21WMlpXRnNjeUIwYUdVZ1kyRnVkbUZ6TGlCSmRDQmhiSE52SUhObGRITWdkWEFnWVNCc2IzUWdiMllnZEdobElHbHVkR1Z5Ym1Gc0lIWmhjbWxoWW14bGN5QmhibVJjY2x4dUlDb2dZMkZ1ZG1GeklHVjJaVzUwY3k1Y2NseHVJQ292WEhKY2JrSmhjMlZNYjJkdlUydGxkR05vTG5CeWIzUnZkSGx3WlM1ZmMyVjBkWEFnUFNCbWRXNWpkR2x2Ymlod0tTQjdYSEpjYmlBZ2RtRnlJSEpsYm1SbGNtVnlJRDBnY0M1amNtVmhkR1ZEWVc1MllYTW9kR2hwY3k1ZmQybGtkR2dzSUhSb2FYTXVYMmhsYVdkb2RDazdYSEpjYmlBZ2RHaHBjeTVmSkdOaGJuWmhjeUE5SUNRb2NtVnVaR1Z5WlhJdVkyRnVkbUZ6S1R0Y2NseHVYSEpjYmlBZ0x5OGdVMmh2ZHlCMGFHVWdZMkZ1ZG1GeklHRnVaQ0JvYVdSbElIUm9aU0JzYjJkdkxpQlZjMmx1WnlCemFHOTNMMmhwWkdVZ2IyNGdkR2hsSUd4dloyOGdkMmxzYkNCallYVnpaVnh5WEc0Z0lDOHZJR3BSZFdWeWVTQjBieUJ0ZFdOcklIZHBkR2dnZEdobElIQnZjMmwwYVc5dWFXNW5MQ0IzYUdsamFDQnBjeUIxYzJWa0lIUnZJR05oYkdOMWJHRjBaU0IzYUdWeVpTQjBiMXh5WEc0Z0lDOHZJR1J5WVhjZ2RHaGxJR05oYm5aaGN5QjBaWGgwTGlCSmJuTjBaV0ZrTENCcWRYTjBJSEIxYzJnZ2RHaGxJR3h2WjI4Z1ltVm9hVzVrSUhSb1pTQmpZVzUyWVhNdUlGUm9hWE5jY2x4dUlDQXZMeUJoYkd4dmQzTWdiV0ZyWlhNZ2FYUWdjMjhnZEdobElHTmhiblpoY3lCcGN5QnpkR2xzYkNCaVpXaHBibVFnZEdobElHNWhkaUJzYVc1cmN5NWNjbHh1SUNCMGFHbHpMbDhrWTI5dWRHRnBibVZ5TG5Ob2IzY29LVHRjY2x4dUlDQjBhR2x6TGw4a2JtRjJURzluYnk1amMzTW9YQ0o2U1c1a1pYaGNJaXdnTFRFcE8xeHlYRzVjY2x4dUlDQXZMeUJVYUdWeVpTQnBjMjRuZENCaElHZHZiMlFnZDJGNUlIUnZJR05vWldOcklIZG9aWFJvWlhJZ2RHaGxJSE5yWlhSamFDQm9ZWE1nZEdobElHMXZkWE5sSUc5MlpYSmNjbHh1SUNBdkx5QnBkQzRnY0M1dGIzVnpaVmdnSmlCd0xtMXZkWE5sV1NCaGNtVWdhVzVwZEdsaGJHbDZaV1FnZEc4Z0tEQXNJREFwTENCaGJtUWdjQzVtYjJOMWMyVmtJR2x6YmlkMFhISmNiaUFnTHk4Z1lXeDNZWGx6SUhKbGJHbGhZbXhsTGx4eVhHNGdJSFJvYVhNdVh5UmpZVzUyWVhNdWIyNG9YQ0p0YjNWelpXOTJaWEpjSWl3Z2RHaHBjeTVmYzJWMFRXOTFjMlZQZG1WeUxtSnBibVFvZEdocGN5d2dkSEoxWlNrcE8xeHlYRzRnSUhSb2FYTXVYeVJqWVc1MllYTXViMjRvWENKdGIzVnpaVzkxZEZ3aUxDQjBhR2x6TGw5elpYUk5iM1Z6WlU5MlpYSXVZbWx1WkNoMGFHbHpMQ0JtWVd4elpTa3BPMXh5WEc1Y2NseHVJQ0F2THlCR2IzSjNZWEprSUcxdmRYTmxJR05zYVdOcmN5QjBieUIwYUdVZ2JtRjJJR3h2WjI5Y2NseHVJQ0IwYUdsekxsOGtZMkZ1ZG1GekxtOXVLRndpWTJ4cFkydGNJaXdnZEdocGN5NWZiMjVEYkdsamF5NWlhVzVrS0hSb2FYTXBLVHRjY2x4dVhISmNiaUFnTHk4Z1YyaGxiaUIwYUdVZ2QybHVaRzkzSUdseklISmxjMmw2WldRc0lIUmxlSFFnSmlCallXNTJZWE1nYzJsNmFXNW5JR0Z1WkNCd2JHRmpaVzFsYm5RZ2JtVmxaQ0IwYnlCaVpWeHlYRzRnSUM4dklISmxZMkZzWTNWc1lYUmxaQzRnVkdobElITnBkR1VnYVhNZ2NtVnpjRzl1YzJsMlpTd2djMjhnZEdobElHbHVkR1Z5WVdOMGFYWmxJR05oYm5aaGN5QnphRzkxYkdRZ1ltVmNjbHh1SUNBdkx5QjBiMjhoWEhKY2JpQWdKQ2gzYVc1a2IzY3BMbTl1S0Z3aWNtVnphWHBsWENJc0lIUm9hWE11WDI5dVVtVnphWHBsTG1KcGJtUW9kR2hwY3l3Z2NDa3BPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFSmhjMlVnWkhKaGR5QnRaWFJvYjJRZ2RHaGhkQ0JqYjI1MGNtOXNjeUIzYUdWMGFHVnlJRzl5SUc1dmRDQjBhR1VnWTNWeWMyOXlJR2x6SUdFZ2NHOXBiblJsY2k0Z1NYUmNjbHh1SUNvZ2MyaHZkV3hrSUc5dWJIa2dZbVVnWVNCd2IybHVkR1Z5SUhkb1pXNGdkR2hsSUcxdmRYTmxJR2x6SUc5MlpYSWdkR2hsSUc1aGRpQmljbUZ1WkNCc2IyZHZMbHh5WEc0Z0tpOWNjbHh1UW1GelpVeHZaMjlUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDlrY21GM0lEMGdablZ1WTNScGIyNG9jQ2tnZTF4eVhHNGdJR2xtSUNoMGFHbHpMbDlwYzAxdmRYTmxUM1psY2lrZ2UxeHlYRzRnSUNBZ2RtRnlJR2x6VDNabGNreHZaMjhnUFNCMWRHbHNjeTVwYzBsdVVtVmpkQ2h3TG0xdmRYTmxXQ3dnY0M1dGIzVnpaVmtzSUhSb2FYTXVYMnh2WjI5Q1ltOTRLVHRjY2x4dUlDQWdJR2xtSUNnaGRHaHBjeTVmYVhOUGRtVnlUbUYyVEc5bmJ5QW1KaUJwYzA5MlpYSk1iMmR2S1NCN1hISmNiaUFnSUNBZ0lIUm9hWE11WDJselQzWmxjazVoZGt4dloyOGdQU0IwY25WbE8xeHlYRzRnSUNBZ0lDQjBhR2x6TGw4a1kyRnVkbUZ6TG1OemN5aGNJbU4xY25OdmNsd2lMQ0JjSW5CdmFXNTBaWEpjSWlrN1hISmNiaUFnSUNCOUlHVnNjMlVnYVdZZ0tIUm9hWE11WDJselQzWmxjazVoZGt4dloyOGdKaVlnSVdselQzWmxja3h2WjI4cElIdGNjbHh1SUNBZ0lDQWdkR2hwY3k1ZmFYTlBkbVZ5VG1GMlRHOW5ieUE5SUdaaGJITmxPMXh5WEc0Z0lDQWdJQ0IwYUdsekxsOGtZMkZ1ZG1GekxtTnpjeWhjSW1OMWNuTnZjbHdpTENCY0ltbHVhWFJwWVd4Y0lpazdYSEpjYmlBZ0lDQjlYSEpjYmlBZ2ZWeHlYRzU5TzF4eVhHNGlMQ0p0YjJSMWJHVXVaWGh3YjNKMGN5QTlJRk5yWlhSamFEdGNjbHh1WEhKY2JuWmhjaUJDWW05NFZHVjRkQ0E5SUhKbGNYVnBjbVVvWENKd05TMWlZbTk0TFdGc2FXZHVaV1F0ZEdWNGRGd2lLVHRjY2x4dWRtRnlJRUpoYzJWTWIyZHZVMnRsZEdOb0lEMGdjbVZ4ZFdseVpTaGNJaTR2WW1GelpTMXNiMmR2TFhOclpYUmphQzVxYzF3aUtUdGNjbHh1ZG1GeUlGTnBia2RsYm1WeVlYUnZjaUE5SUhKbGNYVnBjbVVvWENJdUwyZGxibVZ5WVhSdmNuTXZjMmx1TFdkbGJtVnlZWFJ2Y2k1cWMxd2lLVHRjY2x4dVhISmNiblpoY2lCMWRHbHNjeUE5SUhKbGNYVnBjbVVvWENJdUxpOTFkR2xzYVhScFpYTXVhbk5jSWlrN1hISmNibHh5WEc1VGEyVjBZMmd1Y0hKdmRHOTBlWEJsSUQwZ1QySnFaV04wTG1OeVpXRjBaU2hDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXBPMXh5WEc1Y2NseHVablZ1WTNScGIyNGdVMnRsZEdOb0tDUnVZWFlzSUNSdVlYWk1iMmR2S1NCN1hISmNiaUFnUW1GelpVeHZaMjlUYTJWMFkyZ3VZMkZzYkNoMGFHbHpMQ0FrYm1GMkxDQWtibUYyVEc5bmJ5d2dYQ0l1TGk5bWIyNTBjeTlpYVdkZmFtOW9iaTEzWldKbWIyNTBMblIwWmx3aUtUdGNjbHh1ZlZ4eVhHNWNjbHh1VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmYjI1U1pYTnBlbVVnUFNCbWRXNWpkR2x2Ymlod0tTQjdYSEpjYmlBZ1FtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5dmJsSmxjMmw2WlM1allXeHNLSFJvYVhNc0lIQXBPMXh5WEc0Z0lIUm9hWE11WDNOd1lXTnBibWNnUFNCMWRHbHNjeTV0WVhBb2RHaHBjeTVmWm05dWRGTnBlbVVzSURJd0xDQTBNQ3dnTWl3Z05Td2dlMXh5WEc0Z0lDQWdZMnhoYlhBNklIUnlkV1VzWEhKY2JpQWdJQ0J5YjNWdVpEb2dkSEoxWlZ4eVhHNGdJSDBwTzF4eVhHNGdJQzh2SUZWd1pHRjBaU0IwYUdVZ1ltSnZlRlJsZUhRc0lIQnNZV05sSUc5MlpYSWdkR2hsSUc1aGRpQjBaWGgwSUd4dloyOGdZVzVrSUhSb1pXNGdjMmhwWm5RZ2FYUnpYSEpjYmlBZ0x5OGdZVzVqYUc5eUlHSmhZMnNnZEc4Z0tHTmxiblJsY2l3Z1kyVnVkR1Z5S1NCM2FHbHNaU0J3Y21WelpYSjJhVzVuSUhSb1pTQjBaWGgwSUhCdmMybDBhVzl1WEhKY2JpQWdkR2hwY3k1ZlltSnZlRlJsZUhSY2NseHVJQ0FnSUM1elpYUlVaWGgwS0hSb2FYTXVYM1JsZUhRcFhISmNiaUFnSUNBdWMyVjBWR1Y0ZEZOcGVtVW9kR2hwY3k1ZlptOXVkRk5wZW1VcFhISmNiaUFnSUNBdWMyVjBRVzVqYUc5eUtFSmliM2hVWlhoMExrRk1TVWRPTGtKUFdGOU1SVVpVTENCQ1ltOTRWR1Y0ZEM1Q1FWTkZURWxPUlM1QlRGQklRVUpGVkVsREtWeHlYRzRnSUNBZ0xuTmxkRkJ2YzJsMGFXOXVLSFJvYVhNdVgzUmxlSFJQWm1aelpYUXViR1ZtZEN3Z2RHaHBjeTVmZEdWNGRFOW1abk5sZEM1MGIzQXBYSEpjYmlBZ0lDQXVjMlYwUVc1amFHOXlLRUppYjNoVVpYaDBMa0ZNU1VkT0xrSlBXRjlEUlU1VVJWSXNJRUppYjNoVVpYaDBMa0pCVTBWTVNVNUZMa0pQV0Y5RFJVNVVSVklzSUhSeWRXVXBPMXh5WEc0Z0lIUm9hWE11WDJSeVlYZFRkR0YwYVc5dVlYSjVURzluYnlod0tUdGNjbHh1SUNCMGFHbHpMbDl3YjJsdWRITWdQU0IwYUdsekxsOWlZbTk0VkdWNGRDNW5aWFJVWlhoMFVHOXBiblJ6S0NrN1hISmNiaUFnZEdocGN5NWZhWE5HYVhKemRFWnlZVzFsSUQwZ2RISjFaVHRjY2x4dWZUdGNjbHh1WEhKY2JsTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgyUnlZWGRUZEdGMGFXOXVZWEo1VEc5bmJ5QTlJR1oxYm1OMGFXOXVLSEFwSUh0Y2NseHVJQ0J3TG1KaFkydG5jbTkxYm1Rb01qVTFLVHRjY2x4dUlDQndMbk4wY205clpTZ3lOVFVwTzF4eVhHNGdJSEF1Wm1sc2JDaGNJaU13UVRBd01FRmNJaWs3WEhKY2JpQWdjQzV6ZEhKdmEyVlhaV2xuYUhRb01pazdYSEpjYmlBZ2RHaHBjeTVmWW1KdmVGUmxlSFF1WkhKaGR5Z3BPMXh5WEc1OU8xeHlYRzVjY2x4dVUydGxkR05vTG5CeWIzUnZkSGx3WlM1ZmMyVjBkWEFnUFNCbWRXNWpkR2x2Ymlod0tTQjdYSEpjYmlBZ1FtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5elpYUjFjQzVqWVd4c0tIUm9hWE1zSUhBcE8xeHlYRzVjY2x4dUlDQXZMeUJEY21WaGRHVWdZU0JDWW05NFFXeHBaMjVsWkZSbGVIUWdhVzV6ZEdGdVkyVWdkR2hoZENCM2FXeHNJR0psSUhWelpXUWdabTl5SUdSeVlYZHBibWNnWVc1a1hISmNiaUFnTHk4Z2NtOTBZWFJwYm1jZ2RHVjRkRnh5WEc0Z0lIUm9hWE11WDJKaWIzaFVaWGgwSUQwZ2JtVjNJRUppYjNoVVpYaDBLSFJvYVhNdVgyWnZiblFzSUhSb2FYTXVYM1JsZUhRc0lIUm9hWE11WDJadmJuUlRhWHBsTENBd0xDQXdMQ0J3S1R0Y2NseHVYSEpjYmlBZ0x5OGdTR0Z1Wkd4bElIUm9aU0JwYm1sMGFXRnNJSE5sZEhWd0lHSjVJSFJ5YVdkblpYSnBibWNnWVNCeVpYTnBlbVZjY2x4dUlDQjBhR2x6TGw5dmJsSmxjMmw2WlNod0tUdGNjbHh1WEhKY2JpQWdMeThnUkhKaGR5QjBhR1VnYzNSaGRHbHZibUZ5ZVNCc2IyZHZYSEpjYmlBZ2RHaHBjeTVmWkhKaGQxTjBZWFJwYjI1aGNubE1iMmR2S0hBcE8xeHlYRzVjY2x4dUlDQXZMeUJUZEdGeWRDQjBhR1VnYzJsdUlHZGxibVZ5WVhSdmNpQmhkQ0JwZEhNZ2JXRjRJSFpoYkhWbFhISmNiaUFnZEdocGN5NWZkR2h5WlhOb2IyeGtSMlZ1WlhKaGRHOXlJRDBnYm1WM0lGTnBia2RsYm1WeVlYUnZjaWh3TENBd0xDQXhMQ0F3TGpBeUxDQndMbEJKSUM4Z01pazdYSEpjYm4wN1hISmNibHh5WEc1VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5a2NtRjNJRDBnWm5WdVkzUnBiMjRvY0NrZ2UxeHlYRzRnSUVKaGMyVk1iMmR2VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmWkhKaGR5NWpZV3hzS0hSb2FYTXNJSEFwTzF4eVhHNGdJR2xtSUNnaGRHaHBjeTVmYVhOTmIzVnpaVTkyWlhJZ2ZId2dJWFJvYVhNdVgybHpUM1psY2s1aGRreHZaMjhwSUhKbGRIVnlianRjY2x4dVhISmNiaUFnTHk4Z1YyaGxiaUIwYUdVZ2RHVjRkQ0JwY3lCaFltOTFkQ0IwYnlCaVpXTnZiV1VnWVdOMGFYWmxJR1p2Y2lCMGFHVWdabWx5YzNRZ2RHbHRaU3dnWTJ4bFlYSmNjbHh1SUNBdkx5QjBhR1VnYzNSaGRHbHZibUZ5ZVNCc2IyZHZJSFJvWVhRZ2QyRnpJSEJ5WlhacGIzVnpiSGtnWkhKaGQyNHVYSEpjYmlBZ2FXWWdLSFJvYVhNdVgybHpSbWx5YzNSR2NtRnRaU2tnZTF4eVhHNGdJQ0FnY0M1aVlXTnJaM0p2ZFc1a0tESTFOU2s3WEhKY2JpQWdJQ0IwYUdsekxsOXBjMFpwY25OMFJuSmhiV1VnUFNCbVlXeHpaVHRjY2x4dUlDQjlYSEpjYmx4eVhHNGdJR2xtSUNoMGFHbHpMbDltYjI1MFUybDZaU0ErSURNd0tTQjdYSEpjYmlBZ0lDQjBhR2x6TGw5MGFISmxjMmh2YkdSSFpXNWxjbUYwYjNJdWMyVjBRbTkxYm1SektEQXVNaUFxSUhSb2FYTXVYMkppYjNoVVpYaDBMbWhsYVdkb2RDd2dNQzQwTnlBcUlIUm9hWE11WDJKaWIzaFVaWGgwTG1obGFXZG9kQ2s3WEhKY2JpQWdmU0JsYkhObElIdGNjbHh1SUNBZ0lIUm9hWE11WDNSb2NtVnphRzlzWkVkbGJtVnlZWFJ2Y2k1elpYUkNiM1Z1WkhNb01DNHlJQ29nZEdocGN5NWZZbUp2ZUZSbGVIUXVhR1ZwWjJoMExDQXdMallnS2lCMGFHbHpMbDlpWW05NFZHVjRkQzVvWldsbmFIUXBPMXh5WEc0Z0lIMWNjbHh1SUNCMllYSWdaR2x6ZEdGdVkyVlVhSEpsYzJodmJHUWdQU0IwYUdsekxsOTBhSEpsYzJodmJHUkhaVzVsY21GMGIzSXVaMlZ1WlhKaGRHVW9LVHRjY2x4dVhISmNiaUFnY0M1aVlXTnJaM0p2ZFc1a0tESTFOU3dnTVRBd0tUdGNjbHh1SUNCd0xuTjBjbTlyWlZkbGFXZG9kQ2d4S1R0Y2NseHVJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUhSb2FYTXVYM0J2YVc1MGN5NXNaVzVuZEdnN0lHa2dLejBnTVNrZ2UxeHlYRzRnSUNBZ2RtRnlJSEJ2YVc1ME1TQTlJSFJvYVhNdVgzQnZhVzUwYzF0cFhUdGNjbHh1SUNBZ0lHWnZjaUFvZG1GeUlHb2dQU0JwSUNzZ01Uc2dhaUE4SUhSb2FYTXVYM0J2YVc1MGN5NXNaVzVuZEdnN0lHb2dLejBnTVNrZ2UxeHlYRzRnSUNBZ0lDQjJZWElnY0c5cGJuUXlJRDBnZEdocGN5NWZjRzlwYm5SelcycGRPMXh5WEc0Z0lDQWdJQ0IyWVhJZ1pHbHpkQ0E5SUhBdVpHbHpkQ2h3YjJsdWRERXVlQ3dnY0c5cGJuUXhMbmtzSUhCdmFXNTBNaTU0TENCd2IybHVkREl1ZVNrN1hISmNiaUFnSUNBZ0lHbG1JQ2hrYVhOMElEd2daR2x6ZEdGdVkyVlVhSEpsYzJodmJHUXBJSHRjY2x4dUlDQWdJQ0FnSUNCd0xtNXZVM1J5YjJ0bEtDazdYSEpjYmlBZ0lDQWdJQ0FnY0M1bWFXeHNLRndpY21kaVlTZ3hOalVzSURBc0lERTNNeXdnTUM0eU5TbGNJaWs3WEhKY2JpQWdJQ0FnSUNBZ2NDNWxiR3hwY0hObEtDaHdiMmx1ZERFdWVDQXJJSEJ2YVc1ME1pNTRLU0F2SURJc0lDaHdiMmx1ZERFdWVTQXJJSEJ2YVc1ME1pNTVLU0F2SURJc0lHUnBjM1FzSUdScGMzUXBPMXh5WEc1Y2NseHVJQ0FnSUNBZ0lDQndMbk4wY205clpTaGNJbkpuWW1Fb01UWTFMQ0F3TENBeE56TXNJREF1TWpVcFhDSXBPMXh5WEc0Z0lDQWdJQ0FnSUhBdWJtOUdhV3hzS0NrN1hISmNiaUFnSUNBZ0lDQWdjQzVzYVc1bEtIQnZhVzUwTVM1NExDQndiMmx1ZERFdWVTd2djRzlwYm5ReUxuZ3NJSEJ2YVc1ME1pNTVLVHRjY2x4dUlDQWdJQ0FnZlZ4eVhHNGdJQ0FnZlZ4eVhHNGdJSDFjY2x4dWZUdGNjbHh1SWl3aWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCN1hISmNiaUFnVG05cGMyVkhaVzVsY21GMGIzSXhSRG9nVG05cGMyVkhaVzVsY21GMGIzSXhSQ3hjY2x4dUlDQk9iMmx6WlVkbGJtVnlZWFJ2Y2pKRU9pQk9iMmx6WlVkbGJtVnlZWFJ2Y2pKRVhISmNibjA3WEhKY2JseHlYRzUyWVhJZ2RYUnBiSE1nUFNCeVpYRjFhWEpsS0Z3aUxpNHZMaTR2ZFhScGJHbDBhV1Z6TG1welhDSXBPMXh5WEc1Y2NseHVMeThnTFMwZ01VUWdUbTlwYzJVZ1IyVnVaWEpoZEc5eUlDMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMWNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQkJJSFYwYVd4cGRIa2dZMnhoYzNNZ1ptOXlJR2RsYm1WeVlYUnBibWNnYm05cGMyVWdkbUZzZFdWelhISmNiaUFxSUVCamIyNXpkSEoxWTNSdmNseHlYRzRnS2lCQWNHRnlZVzBnZTI5aWFtVmpkSDBnY0NBZ0lDQWdJQ0FnSUNBZ0lDQWdJRkpsWm1WeVpXNWpaU0IwYnlCaElIQTFJSE5yWlhSamFGeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnVzIxcGJqMHdYU0FnSUNBZ0lDQWdJRTFwYm1sdGRXMGdkbUZzZFdVZ1ptOXlJSFJvWlNCdWIybHpaVnh5WEc0Z0tpQkFjR0Z5WVcwZ2UyNTFiV0psY24wZ1cyMWhlRDB4WFNBZ0lDQWdJQ0FnSUUxaGVHbHRkVzBnZG1Gc2RXVWdabTl5SUhSb1pTQnViMmx6WlZ4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXMmx1WTNKbGJXVnVkRDB3TGpGZElGTmpZV3hsSUc5bUlIUm9aU0J1YjJselpTd2dkWE5sWkNCM2FHVnVJSFZ3WkdGMGFXNW5YSEpjYmlBcUlFQndZWEpoYlNCN2JuVnRZbVZ5ZlNCYmIyWm1jMlYwUFhKaGJtUnZiVjBnUVNCMllXeDFaU0IxYzJWa0lIUnZJR1Z1YzNWeVpTQnRkV3gwYVhCc1pTQnViMmx6WlZ4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHZGxibVZ5WVhSdmNuTWdZWEpsSUhKbGRIVnlibWx1WnlCY0ltbHVaR1Z3Wlc1a1pXNTBYQ0lnZG1Gc2RXVnpYSEpjYmlBcUwxeHlYRzVtZFc1amRHbHZiaUJPYjJselpVZGxibVZ5WVhSdmNqRkVLSEFzSUcxcGJpd2diV0Y0TENCcGJtTnlaVzFsYm5Rc0lHOW1abk5sZENrZ2UxeHlYRzRnSUhSb2FYTXVYM0FnUFNCd08xeHlYRzRnSUhSb2FYTXVYMjFwYmlBOUlIVjBhV3h6TG1SbFptRjFiSFFvYldsdUxDQXdLVHRjY2x4dUlDQjBhR2x6TGw5dFlYZ2dQU0IxZEdsc2N5NWtaV1poZFd4MEtHMWhlQ3dnTVNrN1hISmNiaUFnZEdocGN5NWZhVzVqY21WdFpXNTBJRDBnZFhScGJITXVaR1ZtWVhWc2RDaHBibU55WlcxbGJuUXNJREF1TVNrN1hISmNiaUFnZEdocGN5NWZjRzl6YVhScGIyNGdQU0IxZEdsc2N5NWtaV1poZFd4MEtHOW1abk5sZEN3Z2NDNXlZVzVrYjIwb0xURXdNREF3TURBc0lERXdNREF3TURBcEtUdGNjbHh1ZlZ4eVhHNWNjbHh1THlvcVhISmNiaUFxSUZWd1pHRjBaU0IwYUdVZ2JXbHVJR0Z1WkNCdFlYZ2dibTlwYzJVZ2RtRnNkV1Z6WEhKY2JpQXFJRUJ3WVhKaGJTQWdlMjUxYldKbGNuMGdiV2x1SUUxcGJtbHRkVzBnYm05cGMyVWdkbUZzZFdWY2NseHVJQ29nUUhCaGNtRnRJQ0I3Ym5WdFltVnlmU0J0WVhnZ1RXRjRhVzExYlNCdWIybHpaU0IyWVd4MVpWeHlYRzRnS2k5Y2NseHVUbTlwYzJWSFpXNWxjbUYwYjNJeFJDNXdjbTkwYjNSNWNHVXVjMlYwUW05MWJtUnpJRDBnWm5WdVkzUnBiMjRvYldsdUxDQnRZWGdwSUh0Y2NseHVJQ0IwYUdsekxsOXRhVzRnUFNCMWRHbHNjeTVrWldaaGRXeDBLRzFwYml3Z2RHaHBjeTVmYldsdUtUdGNjbHh1SUNCMGFHbHpMbDl0WVhnZ1BTQjFkR2xzY3k1a1pXWmhkV3gwS0cxaGVDd2dkR2hwY3k1ZmJXRjRLVHRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlZjR1JoZEdVZ2RHaGxJRzV2YVhObElHbHVZM0psYldWdWRDQW9aUzVuTGlCelkyRnNaU2xjY2x4dUlDb2dRSEJoY21GdElDQjdiblZ0WW1WeWZTQnBibU55WlcxbGJuUWdUbVYzSUdsdVkzSmxiV1Z1ZENBb2MyTmhiR1VwSUhaaGJIVmxYSEpjYmlBcUwxeHlYRzVPYjJselpVZGxibVZ5WVhSdmNqRkVMbkJ5YjNSdmRIbHdaUzV6WlhSSmJtTnlaVzFsYm5RZ1BTQm1kVzVqZEdsdmJpaHBibU55WlcxbGJuUXBJSHRjY2x4dUlDQjBhR2x6TGw5cGJtTnlaVzFsYm5RZ1BTQjFkR2xzY3k1a1pXWmhkV3gwS0dsdVkzSmxiV1Z1ZEN3Z2RHaHBjeTVmYVc1amNtVnRaVzUwS1R0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJIWlc1bGNtRjBaU0IwYUdVZ2JtVjRkQ0J1YjJselpTQjJZV3gxWlZ4eVhHNGdLaUJBY21WMGRYSnVJSHR1ZFcxaVpYSjlJRUVnYm05cGMza2dkbUZzZFdVZ1ltVjBkMlZsYmlCdlltcGxZM1FuY3lCdGFXNGdZVzVrSUcxaGVGeHlYRzRnS2k5Y2NseHVUbTlwYzJWSFpXNWxjbUYwYjNJeFJDNXdjbTkwYjNSNWNHVXVaMlZ1WlhKaGRHVWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0IwYUdsekxsOTFjR1JoZEdVb0tUdGNjbHh1SUNCMllYSWdiaUE5SUhSb2FYTXVYM0F1Ym05cGMyVW9kR2hwY3k1ZmNHOXphWFJwYjI0cE8xeHlYRzRnSUc0Z1BTQjBhR2x6TGw5d0xtMWhjQ2h1TENBd0xDQXhMQ0IwYUdsekxsOXRhVzRzSUhSb2FYTXVYMjFoZUNrN1hISmNiaUFnY21WMGRYSnVJRzQ3WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dTVzUwWlhKdVlXd2dkWEJrWVhSbElHMWxkR2h2WkNCbWIzSWdaMlZ1WlhKaGRHbHVaeUJ1WlhoMElHNXZhWE5sSUhaaGJIVmxYSEpjYmlBcUlFQndjbWwyWVhSbFhISmNiaUFxTDF4eVhHNU9iMmx6WlVkbGJtVnlZWFJ2Y2pGRUxuQnliM1J2ZEhsd1pTNWZkWEJrWVhSbElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdkR2hwY3k1ZmNHOXphWFJwYjI0Z0t6MGdkR2hwY3k1ZmFXNWpjbVZ0Wlc1ME8xeHlYRzU5TzF4eVhHNWNjbHh1THk4Z0xTMGdNa1FnVG05cGMyVWdSMlZ1WlhKaGRHOXlJQzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzFjY2x4dVhISmNibVoxYm1OMGFXOXVJRTV2YVhObFIyVnVaWEpoZEc5eU1rUW9jQ3dnZUUxcGJpd2dlRTFoZUN3Z2VVMXBiaXdnZVUxaGVDd2dlRWx1WTNKbGJXVnVkQ3dnZVVsdVkzSmxiV1Z1ZEN3Z2VFOW1abk5sZEN3Z2VVOW1abk5sZENrZ2UxeHlYRzRnSUhSb2FYTXVYM2hPYjJselpTQTlJRzVsZHlCT2IybHpaVWRsYm1WeVlYUnZjakZFS0hBc0lIaE5hVzRzSUhoTllYZ3NJSGhKYm1OeVpXMWxiblFzSUhoUFptWnpaWFFwTzF4eVhHNGdJSFJvYVhNdVgzbE9iMmx6WlNBOUlHNWxkeUJPYjJselpVZGxibVZ5WVhSdmNqRkVLSEFzSUhsTmFXNHNJSGxOWVhnc0lIbEpibU55WlcxbGJuUXNJSGxQWm1aelpYUXBPMXh5WEc0Z0lIUm9hWE11WDNBZ1BTQndPMXh5WEc1OVhISmNibHh5WEc0dktpcGNjbHh1SUNvZ1ZYQmtZWFJsSUhSb1pTQnRhVzRnWVc1a0lHMWhlQ0J1YjJselpTQjJZV3gxWlhOY2NseHVJQ29nUUhCaGNtRnRJQ0I3YjJKcVpXTjBmU0J2Y0hScGIyNXpJRTlpYW1WamRDQjNhWFJvSUdKdmRXNWtjeUIwYnlCaVpTQjFjR1JoZEdWa0lHVXVaeTVjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIc2dlRTFwYmpvZ01Dd2dlRTFoZURvZ01Td2dlVTFwYmpvZ0xURXNJSGxOWVhnNklERWdmVnh5WEc0Z0tpOWNjbHh1VG05cGMyVkhaVzVsY21GMGIzSXlSQzV3Y205MGIzUjVjR1V1YzJWMFFtOTFibVJ6SUQwZ1puVnVZM1JwYjI0b2IzQjBhVzl1Y3lrZ2UxeHlYRzRnSUdsbUlDZ2hiM0IwYVc5dWN5a2djbVYwZFhKdU8xeHlYRzRnSUhSb2FYTXVYM2hPYjJselpTNXpaWFJDYjNWdVpITW9iM0IwYVc5dWN5NTRUV2x1TENCdmNIUnBiMjV6TG5oTllYZ3BPMXh5WEc0Z0lIUm9hWE11WDNsT2IybHpaUzV6WlhSQ2IzVnVaSE1vYjNCMGFXOXVjeTU1VFdsdUxDQnZjSFJwYjI1ekxubE5ZWGdwTzF4eVhHNTlPMXh5WEc1Y2NseHVMeW9xWEhKY2JpQXFJRlZ3WkdGMFpTQjBhR1VnYVc1amNtVnRaVzUwSUNobExtY3VJSE5qWVd4bEtTQm1iM0lnZEdobElHNXZhWE5sSUdkbGJtVnlZWFJ2Y2x4eVhHNGdLaUJBY0dGeVlXMGdJSHR2WW1wbFkzUjlJRzl3ZEdsdmJuTWdUMkpxWldOMElIZHBkR2dnWW05MWJtUnpJSFJ2SUdKbElIVndaR0YwWldRZ1pTNW5MbHh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2V5QjRTVzVqY21WdFpXNTBPaUF3TGpBMUxDQjVTVzVqY21WdFpXNTBPaUF3TGpFZ2ZWeHlYRzRnS2k5Y2NseHVUbTlwYzJWSFpXNWxjbUYwYjNJeVJDNXdjbTkwYjNSNWNHVXVjMlYwUW05MWJtUnpJRDBnWm5WdVkzUnBiMjRvYjNCMGFXOXVjeWtnZTF4eVhHNGdJR2xtSUNnaGIzQjBhVzl1Y3lrZ2NtVjBkWEp1TzF4eVhHNGdJSFJvYVhNdVgzaE9iMmx6WlM1elpYUkNiM1Z1WkhNb2IzQjBhVzl1Y3k1NFNXNWpjbVZ0Wlc1MEtUdGNjbHh1SUNCMGFHbHpMbDk1VG05cGMyVXVjMlYwUW05MWJtUnpLRzl3ZEdsdmJuTXVlVWx1WTNKbGJXVnVkQ2s3WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dSMlZ1WlhKaGRHVWdkR2hsSUc1bGVIUWdjR0ZwY2lCdlppQnViMmx6WlNCMllXeDFaWE5jY2x4dUlDb2dRSEpsZEhWeWJpQjdiMkpxWldOMGZTQlBZbXBsWTNRZ2QybDBhQ0I0SUdGdVpDQjVJSEJ5YjNCbGNuUnBaWE1nZEdoaGRDQmpiMjUwWVdsdUlIUm9aU0J1WlhoMElHNXZhWE5sWEhKY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZzZFdWeklHRnNiMjVuSUdWaFkyZ2daR2x0Wlc1emFXOXVYSEpjYmlBcUwxeHlYRzVPYjJselpVZGxibVZ5WVhSdmNqSkVMbkJ5YjNSdmRIbHdaUzVuWlc1bGNtRjBaU0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUhKbGRIVnliaUI3WEhKY2JpQWdJQ0I0T2lCMGFHbHpMbDk0VG05cGMyVXVaMlZ1WlhKaGRHVW9LU3hjY2x4dUlDQWdJSGs2SUhSb2FYTXVYM2xPYjJselpTNW5aVzVsY21GMFpTZ3BYSEpjYmlBZ2ZUdGNjbHh1ZlR0Y2NseHVJaXdpYlc5a2RXeGxMbVY0Y0c5eWRITWdQU0JUYVc1SFpXNWxjbUYwYjNJN1hISmNibHh5WEc1MllYSWdkWFJwYkhNZ1BTQnlaWEYxYVhKbEtGd2lMaTR2TGk0dmRYUnBiR2wwYVdWekxtcHpYQ0lwTzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUVFZ2RYUnBiR2wwZVNCamJHRnpjeUJtYjNJZ1oyVnVaWEpoZEdsdVp5QjJZV3gxWlhNZ1lXeHZibWNnWVNCemFXNTNZWFpsWEhKY2JpQXFJRUJqYjI1emRISjFZM1J2Y2x4eVhHNGdLaUJBY0dGeVlXMGdlMjlpYW1WamRIMGdjQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lGSmxabVZ5Wlc1alpTQjBieUJoSUhBMUlITnJaWFJqYUZ4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXMjFwYmowd1hTQWdJQ0FnSUNBZ0lFMXBibWx0ZFcwZ2RtRnNkV1VnWm05eUlIUm9aU0J1YjJselpWeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnVzIxaGVEMHhYU0FnSUNBZ0lDQWdJRTFoZUdsdGRXMGdkbUZzZFdVZ1ptOXlJSFJvWlNCdWIybHpaVnh5WEc0Z0tpQkFjR0Z5WVcwZ2UyNTFiV0psY24wZ1cybHVZM0psYldWdWREMHdMakZkSUVsdVkzSmxiV1Z1ZENCMWMyVmtJSGRvWlc0Z2RYQmtZWFJwYm1kY2NseHVJQ29nUUhCaGNtRnRJSHR1ZFcxaVpYSjlJRnR2Wm1aelpYUTljbUZ1Wkc5dFhTQlhhR1Z5WlNCMGJ5QnpkR0Z5ZENCaGJHOXVaeUIwYUdVZ2MybHVaWGRoZG1WY2NseHVJQ292WEhKY2JtWjFibU4wYVc5dUlGTnBia2RsYm1WeVlYUnZjaWh3TENCdGFXNHNJRzFoZUN3Z1lXNW5iR1ZKYm1OeVpXMWxiblFzSUhOMFlYSjBhVzVuUVc1bmJHVXBJSHRjY2x4dUlDQjBhR2x6TGw5d0lEMGdjRHRjY2x4dUlDQjBhR2x6TGw5dGFXNGdQU0IxZEdsc2N5NWtaV1poZFd4MEtHMXBiaXdnTUNrN1hISmNiaUFnZEdocGN5NWZiV0Y0SUQwZ2RYUnBiSE11WkdWbVlYVnNkQ2h0WVhnc0lEQXBPMXh5WEc0Z0lIUm9hWE11WDJsdVkzSmxiV1Z1ZENBOUlIVjBhV3h6TG1SbFptRjFiSFFvWVc1bmJHVkpibU55WlcxbGJuUXNJREF1TVNrN1hISmNiaUFnZEdocGN5NWZZVzVuYkdVZ1BTQjFkR2xzY3k1a1pXWmhkV3gwS0hOMFlYSjBhVzVuUVc1bmJHVXNJSEF1Y21GdVpHOXRLQzB4TURBd01EQXdMQ0F4TURBd01EQXdLU2s3WEhKY2JuMWNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlZjR1JoZEdVZ2RHaGxJRzFwYmlCaGJtUWdiV0Y0SUhaaGJIVmxjMXh5WEc0Z0tpQkFjR0Z5WVcwZ0lIdHVkVzFpWlhKOUlHMXBiaUJOYVc1cGJYVnRJSFpoYkhWbFhISmNiaUFxSUVCd1lYSmhiU0FnZTI1MWJXSmxjbjBnYldGNElFMWhlR2x0ZFcwZ2RtRnNkV1ZjY2x4dUlDb3ZYSEpjYmxOcGJrZGxibVZ5WVhSdmNpNXdjbTkwYjNSNWNHVXVjMlYwUW05MWJtUnpJRDBnWm5WdVkzUnBiMjRvYldsdUxDQnRZWGdwSUh0Y2NseHVJQ0IwYUdsekxsOXRhVzRnUFNCMWRHbHNjeTVrWldaaGRXeDBLRzFwYml3Z2RHaHBjeTVmYldsdUtUdGNjbHh1SUNCMGFHbHpMbDl0WVhnZ1BTQjFkR2xzY3k1a1pXWmhkV3gwS0cxaGVDd2dkR2hwY3k1ZmJXRjRLVHRjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlZjR1JoZEdVZ2RHaGxJR0Z1WjJ4bElHbHVZM0psYldWdWRDQW9aUzVuTGlCb2IzY2dabUZ6ZENCM1pTQnRiM1psSUhSb2NtOTFaMmdnZEdobElITnBibmRoZG1VcFhISmNiaUFxSUVCd1lYSmhiU0FnZTI1MWJXSmxjbjBnYVc1amNtVnRaVzUwSUU1bGR5QnBibU55WlcxbGJuUWdkbUZzZFdWY2NseHVJQ292WEhKY2JsTnBia2RsYm1WeVlYUnZjaTV3Y205MGIzUjVjR1V1YzJWMFNXNWpjbVZ0Wlc1MElEMGdablZ1WTNScGIyNG9hVzVqY21WdFpXNTBLU0I3WEhKY2JpQWdkR2hwY3k1ZmFXNWpjbVZ0Wlc1MElEMGdkWFJwYkhNdVpHVm1ZWFZzZENocGJtTnlaVzFsYm5Rc0lIUm9hWE11WDJsdVkzSmxiV1Z1ZENrN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUjJWdVpYSmhkR1VnZEdobElHNWxlSFFnZG1Gc2RXVmNjbHh1SUNvZ1FISmxkSFZ5YmlCN2JuVnRZbVZ5ZlNCQklIWmhiSFZsSUdKbGRIZGxaVzRnWjJWdVpYSmhkRzl5Y3lkeklHMXBiaUJoYm1RZ2JXRjRYSEpjYmlBcUwxeHlYRzVUYVc1SFpXNWxjbUYwYjNJdWNISnZkRzkwZVhCbExtZGxibVZ5WVhSbElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdkR2hwY3k1ZmRYQmtZWFJsS0NrN1hISmNiaUFnZG1GeUlHNGdQU0IwYUdsekxsOXdMbk5wYmloMGFHbHpMbDloYm1kc1pTazdYSEpjYmlBZ2JpQTlJSFJvYVhNdVgzQXViV0Z3S0c0c0lDMHhMQ0F4TENCMGFHbHpMbDl0YVc0c0lIUm9hWE11WDIxaGVDazdYSEpjYmlBZ2NtVjBkWEp1SUc0N1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nU1c1MFpYSnVZV3dnZFhCa1lYUmxJRzFsZEdodlpDQm1iM0lnWjJWdVpYSmhkR2x1WnlCdVpYaDBJSFpoYkhWbFhISmNiaUFxSUVCd2NtbDJZWFJsWEhKY2JpQXFMMXh5WEc1VGFXNUhaVzVsY21GMGIzSXVjSEp2ZEc5MGVYQmxMbDkxY0dSaGRHVWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0IwYUdsekxsOWhibWRzWlNBclBTQjBhR2x6TGw5cGJtTnlaVzFsYm5RN1hISmNibjA3WEhKY2JpSXNJbTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdVMnRsZEdOb08xeHlYRzVjY2x4dWRtRnlJRUppYjNoVVpYaDBJRDBnY21WeGRXbHlaU2hjSW5BMUxXSmliM2d0WVd4cFoyNWxaQzEwWlhoMFhDSXBPMXh5WEc1MllYSWdRbUZ6WlV4dloyOVRhMlYwWTJnZ1BTQnlaWEYxYVhKbEtGd2lMaTlpWVhObExXeHZaMjh0YzJ0bGRHTm9MbXB6WENJcE8xeHlYRzVjY2x4dWRtRnlJSFYwYVd4eklEMGdjbVZ4ZFdseVpTaGNJaTR1TDNWMGFXeHBkR2xsY3k1cWMxd2lLVHRjY2x4dVhISmNibE5yWlhSamFDNXdjbTkwYjNSNWNHVWdQU0JQWW1wbFkzUXVZM0psWVhSbEtFSmhjMlZNYjJkdlUydGxkR05vTG5CeWIzUnZkSGx3WlNrN1hISmNibHh5WEc1bWRXNWpkR2x2YmlCVGEyVjBZMmdvSkc1aGRpd2dKRzVoZGt4dloyOHBJSHRjY2x4dUlDQkNZWE5sVEc5bmIxTnJaWFJqYUM1allXeHNLSFJvYVhNc0lDUnVZWFlzSUNSdVlYWk1iMmR2TENCY0lpNHVMMlp2Ym5SekwySnBaMTlxYjJodUxYZGxZbVp2Ym5RdWRIUm1YQ0lwTzF4eVhHNTlYSEpjYmx4eVhHNVRhMlYwWTJndWNISnZkRzkwZVhCbExsOXZibEpsYzJsNlpTQTlJR1oxYm1OMGFXOXVLSEFwSUh0Y2NseHVJQ0JDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXVYMjl1VW1WemFYcGxMbU5oYkd3b2RHaHBjeXdnY0NrN1hISmNiaUFnZEdocGN5NWZjM0JoWTJsdVp5QTlJSFYwYVd4ekxtMWhjQ2gwYUdsekxsOW1iMjUwVTJsNlpTd2dNakFzSURRd0xDQXlMQ0ExTENCN1hISmNiaUFnSUNCamJHRnRjRG9nZEhKMVpTeGNjbHh1SUNBZ0lISnZkVzVrT2lCMGNuVmxYSEpjYmlBZ2ZTazdYSEpjYmlBZ0x5OGdWWEJrWVhSbElIUm9aU0JpWW05NFZHVjRkQ3dnY0d4aFkyVWdiM1psY2lCMGFHVWdibUYySUhSbGVIUWdiRzluYnlCaGJtUWdkR2hsYmlCemFHbG1kQ0JwZEhOY2NseHVJQ0F2THlCaGJtTm9iM0lnWW1GamF5QjBieUFvWTJWdWRHVnlMQ0JqWlc1MFpYSXBJSGRvYVd4bElIQnlaWE5sY25acGJtY2dkR2hsSUhSbGVIUWdjRzl6YVhScGIyNWNjbHh1SUNCMGFHbHpMbDlpWW05NFZHVjRkRnh5WEc0Z0lDQWdMbk5sZEZSbGVIUW9kR2hwY3k1ZmRHVjRkQ2xjY2x4dUlDQWdJQzV6WlhSVVpYaDBVMmw2WlNoMGFHbHpMbDltYjI1MFUybDZaU2xjY2x4dUlDQWdJQzV6WlhSQmJtTm9iM0lvUW1KdmVGUmxlSFF1UVV4SlIwNHVRazlZWDB4RlJsUXNJRUppYjNoVVpYaDBMa0pCVTBWTVNVNUZMa0ZNVUVoQlFrVlVTVU1wWEhKY2JpQWdJQ0F1YzJWMFVHOXphWFJwYjI0b2RHaHBjeTVmZEdWNGRFOW1abk5sZEM1c1pXWjBMQ0IwYUdsekxsOTBaWGgwVDJabWMyVjBMblJ2Y0NsY2NseHVJQ0FnSUM1elpYUkJibU5vYjNJb1FtSnZlRlJsZUhRdVFVeEpSMDR1UWs5WVgwTkZUbFJGVWl3Z1FtSnZlRlJsZUhRdVFrRlRSVXhKVGtVdVFrOVlYME5GVGxSRlVpd2dkSEoxWlNrN1hISmNiaUFnZEdocGN5NWZaSEpoZDFOMFlYUnBiMjVoY25sTWIyZHZLSEFwTzF4eVhHNGdJSFJvYVhNdVgyTmhiR04xYkdGMFpVTnBjbU5zWlhNb2NDazdYSEpjYmlBZ2RHaHBjeTVmYVhOR2FYSnpkRVp5WVcxbElEMGdkSEoxWlR0Y2NseHVmVHRjY2x4dVhISmNibE5yWlhSamFDNXdjbTkwYjNSNWNHVXVYMlJ5WVhkVGRHRjBhVzl1WVhKNVRHOW5ieUE5SUdaMWJtTjBhVzl1S0hBcElIdGNjbHh1SUNCd0xtSmhZMnRuY205MWJtUW9NalUxS1R0Y2NseHVJQ0J3TG5OMGNtOXJaU2d5TlRVcE8xeHlYRzRnSUhBdVptbHNiQ2hjSWlNd1FUQXdNRUZjSWlrN1hISmNiaUFnY0M1emRISnZhMlZYWldsbmFIUW9NaWs3WEhKY2JpQWdkR2hwY3k1ZlltSnZlRlJsZUhRdVpISmhkeWdwTzF4eVhHNTlPMXh5WEc1Y2NseHVVMnRsZEdOb0xuQnliM1J2ZEhsd1pTNWZjMlYwZFhBZ1BTQm1kVzVqZEdsdmJpaHdLU0I3WEhKY2JpQWdRbUZ6WlV4dloyOVRhMlYwWTJndWNISnZkRzkwZVhCbExsOXpaWFIxY0M1allXeHNLSFJvYVhNc0lIQXBPMXh5WEc1Y2NseHVJQ0F2THlCRGNtVmhkR1VnWVNCQ1ltOTRRV3hwWjI1bFpGUmxlSFFnYVc1emRHRnVZMlVnZEdoaGRDQjNhV3hzSUdKbElIVnpaV1FnWm05eUlHUnlZWGRwYm1jZ1lXNWtYSEpjYmlBZ0x5OGdjbTkwWVhScGJtY2dkR1Y0ZEZ4eVhHNGdJSFJvYVhNdVgySmliM2hVWlhoMElEMGdibVYzSUVKaWIzaFVaWGgwS0hSb2FYTXVYMlp2Ym5Rc0lIUm9hWE11WDNSbGVIUXNJSFJvYVhNdVgyWnZiblJUYVhwbExDQXdMQ0F3TENCd0tUdGNjbHh1WEhKY2JpQWdMeThnU0dGdVpHeGxJSFJvWlNCcGJtbDBhV0ZzSUhObGRIVndJR0o1SUhSeWFXZG5aWEpwYm1jZ1lTQnlaWE5wZW1WY2NseHVJQ0IwYUdsekxsOXZibEpsYzJsNlpTaHdLVHRjY2x4dVhISmNiaUFnTHk4Z1JISmhkeUIwYUdVZ2MzUmhkR2x2Ym1GeWVTQnNiMmR2WEhKY2JpQWdkR2hwY3k1ZlpISmhkMU4wWVhScGIyNWhjbmxNYjJkdktIQXBPMXh5WEc1Y2NseHVJQ0IwYUdsekxsOWpZV3hqZFd4aGRHVkRhWEpqYkdWektIQXBPMXh5WEc1OU8xeHlYRzVjY2x4dVUydGxkR05vTG5CeWIzUnZkSGx3WlM1ZlkyRnNZM1ZzWVhSbFEybHlZMnhsY3lBOUlHWjFibU4wYVc5dUtIQXBJSHRjY2x4dUlDQXZMeUJVVDBSUE9pQkViMjRuZENCdVpXVmtJRUZNVENCMGFHVWdjR2w0Wld4ekxpQlVhR2x6SUdOdmRXeGtJR2hoZG1VZ1lXNGdiMlptYzJOeVpXVnVJSEpsYm1SbGNtVnlYSEpjYmlBZ0x5OGdkR2hoZENCcGN5QnFkWE4wSUdKcFp5QmxibTkxWjJnZ2RHOGdabWwwSUhSb1pTQjBaWGgwTGx4eVhHNGdJQzh2SUV4dmIzQWdiM1psY2lCMGFHVWdjR2w0Wld4eklHbHVJSFJvWlNCMFpYaDBKM01nWW05MWJtUnBibWNnWW05NElIUnZJSE5oYlhCc1pTQjBhR1VnZDI5eVpGeHlYRzRnSUhaaGNpQmlZbTk0SUQwZ2RHaHBjeTVmWW1KdmVGUmxlSFF1WjJWMFFtSnZlQ2dwTzF4eVhHNGdJSFpoY2lCemRHRnlkRmdnUFNCTllYUm9MbVpzYjI5eUtFMWhkR2d1YldGNEtHSmliM2d1ZUNBdElEVXNJREFwS1R0Y2NseHVJQ0IyWVhJZ1pXNWtXQ0E5SUUxaGRHZ3VZMlZwYkNoTllYUm9MbTFwYmloaVltOTRMbmdnS3lCaVltOTRMbmNnS3lBMUxDQndMbmRwWkhSb0tTazdYSEpjYmlBZ2RtRnlJSE4wWVhKMFdTQTlJRTFoZEdndVpteHZiM0lvVFdGMGFDNXRZWGdvWW1KdmVDNTVJQzBnTlN3Z01Da3BPMXh5WEc0Z0lIWmhjaUJsYm1SWklEMGdUV0YwYUM1alpXbHNLRTFoZEdndWJXbHVLR0ppYjNndWVTQXJJR0ppYjNndWFDQXJJRFVzSUhBdWFHVnBaMmgwS1NrN1hISmNiaUFnY0M1c2IyRmtVR2w0Wld4ektDazdYSEpjYmlBZ2NDNXdhWGhsYkVSbGJuTnBkSGtvTVNrN1hISmNiaUFnZEdocGN5NWZZMmx5WTJ4bGN5QTlJRnRkTzF4eVhHNGdJR1p2Y2lBb2RtRnlJSGtnUFNCemRHRnlkRms3SUhrZ1BDQmxibVJaT3lCNUlDczlJSFJvYVhNdVgzTndZV05wYm1jcElIdGNjbHh1SUNBZ0lHWnZjaUFvZG1GeUlIZ2dQU0J6ZEdGeWRGZzdJSGdnUENCbGJtUllPeUI0SUNzOUlIUm9hWE11WDNOd1lXTnBibWNwSUh0Y2NseHVJQ0FnSUNBZ2RtRnlJR2tnUFNBMElDb2dLSGtnS2lCd0xuZHBaSFJvSUNzZ2VDazdYSEpjYmlBZ0lDQWdJSFpoY2lCeUlEMGdjQzV3YVhobGJITmJhVjA3WEhKY2JpQWdJQ0FnSUhaaGNpQm5JRDBnY0M1d2FYaGxiSE5iYVNBcklERmRPMXh5WEc0Z0lDQWdJQ0IyWVhJZ1lpQTlJSEF1Y0dsNFpXeHpXMmtnS3lBeVhUdGNjbHh1SUNBZ0lDQWdkbUZ5SUdFZ1BTQndMbkJwZUdWc2MxdHBJQ3NnTTEwN1hISmNiaUFnSUNBZ0lIWmhjaUJqSUQwZ2NDNWpiMnh2Y2loeUxDQm5MQ0JpTENCaEtUdGNjbHh1SUNBZ0lDQWdhV1lnS0hBdWMyRjBkWEpoZEdsdmJpaGpLU0ErSURBcElIdGNjbHh1SUNBZ0lDQWdJQ0IwYUdsekxsOWphWEpqYkdWekxuQjFjMmdvZTF4eVhHNGdJQ0FnSUNBZ0lDQWdlRG9nZUNBcklIQXVjbUZ1Wkc5dEtDMHlJQzhnTXlBcUlIUm9hWE11WDNOd1lXTnBibWNzSURJZ0x5QXpJQ29nZEdocGN5NWZjM0JoWTJsdVp5a3NYSEpjYmlBZ0lDQWdJQ0FnSUNCNU9pQjVJQ3NnY0M1eVlXNWtiMjBvTFRJZ0x5QXpJQ29nZEdocGN5NWZjM0JoWTJsdVp5d2dNaUF2SURNZ0tpQjBhR2x6TGw5emNHRmphVzVuS1N4Y2NseHVJQ0FnSUNBZ0lDQWdJR052Ykc5eU9pQndMbU52Ykc5eUtGd2lJekEyUmtaR1Jsd2lLVnh5WEc0Z0lDQWdJQ0FnSUgwcE8xeHlYRzRnSUNBZ0lDQWdJSFJvYVhNdVgyTnBjbU5zWlhNdWNIVnphQ2g3WEhKY2JpQWdJQ0FnSUNBZ0lDQjRPaUI0SUNzZ2NDNXlZVzVrYjIwb0xUSWdMeUF6SUNvZ2RHaHBjeTVmYzNCaFkybHVaeXdnTWlBdklETWdLaUIwYUdsekxsOXpjR0ZqYVc1bktTeGNjbHh1SUNBZ0lDQWdJQ0FnSUhrNklIa2dLeUJ3TG5KaGJtUnZiU2d0TWlBdklETWdLaUIwYUdsekxsOXpjR0ZqYVc1bkxDQXlJQzhnTXlBcUlIUm9hWE11WDNOd1lXTnBibWNwTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdZMjlzYjNJNklIQXVZMjlzYjNJb1hDSWpSa1V3TUVaRlhDSXBYSEpjYmlBZ0lDQWdJQ0FnZlNrN1hISmNiaUFnSUNBZ0lDQWdkR2hwY3k1ZlkybHlZMnhsY3k1d2RYTm9LSHRjY2x4dUlDQWdJQ0FnSUNBZ0lIZzZJSGdnS3lCd0xuSmhibVJ2YlNndE1pQXZJRE1nS2lCMGFHbHpMbDl6Y0dGamFXNW5MQ0F5SUM4Z015QXFJSFJvYVhNdVgzTndZV05wYm1jcExGeHlYRzRnSUNBZ0lDQWdJQ0FnZVRvZ2VTQXJJSEF1Y21GdVpHOXRLQzB5SUM4Z015QXFJSFJvYVhNdVgzTndZV05wYm1jc0lESWdMeUF6SUNvZ2RHaHBjeTVmYzNCaFkybHVaeWtzWEhKY2JpQWdJQ0FnSUNBZ0lDQmpiMnh2Y2pvZ2NDNWpiMnh2Y2loY0lpTkdSa1pHTURSY0lpbGNjbHh1SUNBZ0lDQWdJQ0I5S1R0Y2NseHVJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ2ZWeHlYRzRnSUgxY2NseHVmVHRjY2x4dVhISmNibE5yWlhSamFDNXdjbTkwYjNSNWNHVXVYMlJ5WVhjZ1BTQm1kVzVqZEdsdmJpaHdLU0I3WEhKY2JpQWdRbUZ6WlV4dloyOVRhMlYwWTJndWNISnZkRzkwZVhCbExsOWtjbUYzTG1OaGJHd29kR2hwY3l3Z2NDazdYSEpjYmlBZ2FXWWdLQ0YwYUdsekxsOXBjMDF2ZFhObFQzWmxjaUI4ZkNBaGRHaHBjeTVmYVhOUGRtVnlUbUYyVEc5bmJ5a2djbVYwZFhKdU8xeHlYRzVjY2x4dUlDQXZMeUJYYUdWdUlIUm9aU0IwWlhoMElHbHpJR0ZpYjNWMElIUnZJR0psWTI5dFpTQmhZM1JwZG1VZ1ptOXlJSFJvWlNCbWFYSnpkQ0IwYVcxbExDQmpiR1ZoY2x4eVhHNGdJQzh2SUhSb1pTQnpkR0YwYVc5dVlYSjVJR3h2WjI4Z2RHaGhkQ0IzWVhNZ2NISmxkbWx2ZFhOc2VTQmtjbUYzYmk1Y2NseHVJQ0JwWmlBb2RHaHBjeTVmYVhOR2FYSnpkRVp5WVcxbEtTQjdYSEpjYmlBZ0lDQndMbUpoWTJ0bmNtOTFibVFvTWpVMUtUdGNjbHh1SUNBZ0lIUm9hWE11WDJselJtbHljM1JHY21GdFpTQTlJR1poYkhObE8xeHlYRzRnSUgxY2NseHVYSEpjYmlBZ0x5OGdRMnhsWVhKY2NseHVJQ0J3TG1Kc1pXNWtUVzlrWlNod0xrSk1SVTVFS1R0Y2NseHVJQ0J3TG1KaFkydG5jbTkxYm1Rb01qVTFLVHRjY2x4dVhISmNiaUFnTHk4Z1JISmhkeUJjSW1oaGJHWjBiMjVsWENJZ2JHOW5iMXh5WEc0Z0lIQXVibTlUZEhKdmEyVW9LVHRjY2x4dUlDQndMbUpzWlc1a1RXOWtaU2h3TGsxVlRGUkpVRXhaS1R0Y2NseHVYSEpjYmlBZ2RtRnlJRzFoZUVScGMzUWdQU0IwYUdsekxsOWlZbTk0VkdWNGRDNW9ZV3htVjJsa2RHZzdYSEpjYmlBZ2RtRnlJRzFoZUZKaFpHbDFjeUE5SURJZ0tpQjBhR2x6TGw5emNHRmphVzVuTzF4eVhHNWNjbHh1SUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElIUm9hWE11WDJOcGNtTnNaWE11YkdWdVozUm9PeUJwSUNzOUlERXBJSHRjY2x4dUlDQWdJSFpoY2lCamFYSmpiR1VnUFNCMGFHbHpMbDlqYVhKamJHVnpXMmxkTzF4eVhHNGdJQ0FnZG1GeUlHTWdQU0JqYVhKamJHVXVZMjlzYjNJN1hISmNiaUFnSUNCMllYSWdaR2x6ZENBOUlIQXVaR2x6ZENoamFYSmpiR1V1ZUN3Z1kybHlZMnhsTG5rc0lIQXViVzkxYzJWWUxDQndMbTF2ZFhObFdTazdYSEpjYmlBZ0lDQjJZWElnY21Ga2FYVnpJRDBnZFhScGJITXViV0Z3S0dScGMzUXNJREFzSUcxaGVFUnBjM1FzSURFc0lHMWhlRkpoWkdsMWN5d2dleUJqYkdGdGNEb2dkSEoxWlNCOUtUdGNjbHh1SUNBZ0lIQXVabWxzYkNoaktUdGNjbHh1SUNBZ0lIQXVaV3hzYVhCelpTaGphWEpqYkdVdWVDd2dZMmx5WTJ4bExua3NJSEpoWkdsMWN5d2djbUZrYVhWektUdGNjbHh1SUNCOVhISmNibjA3WEhKY2JpSXNJbTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdVMnRsZEdOb08xeHlYRzVjY2x4dWRtRnlJRTV2YVhObElEMGdjbVZ4ZFdseVpTaGNJaTR2WjJWdVpYSmhkRzl5Y3k5dWIybHpaUzFuWlc1bGNtRjBiM0p6TG1welhDSXBPMXh5WEc1MllYSWdRbUp2ZUZSbGVIUWdQU0J5WlhGMWFYSmxLRndpY0RVdFltSnZlQzFoYkdsbmJtVmtMWFJsZUhSY0lpazdYSEpjYm5aaGNpQkNZWE5sVEc5bmIxTnJaWFJqYUNBOUlISmxjWFZwY21Vb1hDSXVMMkpoYzJVdGJHOW5ieTF6YTJWMFkyZ3Vhbk5jSWlrN1hISmNibHh5WEc1VGEyVjBZMmd1Y0hKdmRHOTBlWEJsSUQwZ1QySnFaV04wTG1OeVpXRjBaU2hDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXBPMXh5WEc1Y2NseHVablZ1WTNScGIyNGdVMnRsZEdOb0tDUnVZWFlzSUNSdVlYWk1iMmR2S1NCN1hISmNiaUFnUW1GelpVeHZaMjlUYTJWMFkyZ3VZMkZzYkNoMGFHbHpMQ0FrYm1GMkxDQWtibUYyVEc5bmJ5d2dYQ0l1TGk5bWIyNTBjeTlpYVdkZmFtOW9iaTEzWldKbWIyNTBMblIwWmx3aUtUdGNjbHh1ZlZ4eVhHNWNjbHh1VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmYjI1U1pYTnBlbVVnUFNCbWRXNWpkR2x2Ymlod0tTQjdYSEpjYmlBZ1FtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5dmJsSmxjMmw2WlM1allXeHNLSFJvYVhNc0lIQXBPMXh5WEc0Z0lDOHZJRlZ3WkdGMFpTQjBhR1VnWW1KdmVGUmxlSFFzSUhCc1lXTmxJRzkyWlhJZ2RHaGxJRzVoZGlCMFpYaDBJR3h2WjI4Z1lXNWtJSFJvWlc0Z2MyaHBablFnYVhSelhISmNiaUFnTHk4Z1lXNWphRzl5SUdKaFkyc2dkRzhnS0dObGJuUmxjaXdnWTJWdWRHVnlLU0IzYUdsc1pTQndjbVZ6WlhKMmFXNW5JSFJvWlNCMFpYaDBJSEJ2YzJsMGFXOXVYSEpjYmlBZ2RHaHBjeTVmWW1KdmVGUmxlSFJjY2x4dUlDQWdJQzV6WlhSVVpYaDBLSFJvYVhNdVgzUmxlSFFwWEhKY2JpQWdJQ0F1YzJWMFZHVjRkRk5wZW1Vb2RHaHBjeTVmWm05dWRGTnBlbVVwWEhKY2JpQWdJQ0F1YzJWMFVtOTBZWFJwYjI0b01DbGNjbHh1SUNBZ0lDNXpaWFJCYm1Ob2IzSW9RbUp2ZUZSbGVIUXVRVXhKUjA0dVFrOVlYMHhGUmxRc0lFSmliM2hVWlhoMExrSkJVMFZNU1U1RkxrRk1VRWhCUWtWVVNVTXBYSEpjYmlBZ0lDQXVjMlYwVUc5emFYUnBiMjRvZEdocGN5NWZkR1Y0ZEU5bVpuTmxkQzVzWldaMExDQjBhR2x6TGw5MFpYaDBUMlptYzJWMExuUnZjQ2xjY2x4dUlDQWdJQzV6WlhSQmJtTm9iM0lvUW1KdmVGUmxlSFF1UVV4SlIwNHVRazlZWDBORlRsUkZVaXdnUW1KdmVGUmxlSFF1UWtGVFJVeEpUa1V1UWs5WVgwTkZUbFJGVWl3Z2RISjFaU2s3WEhKY2JpQWdkR2hwY3k1ZmRHVjRkRkJ2Y3lBOUlIUm9hWE11WDJKaWIzaFVaWGgwTG1kbGRGQnZjMmwwYVc5dUtDazdYSEpjYmlBZ2RHaHBjeTVmWkhKaGQxTjBZWFJwYjI1aGNubE1iMmR2S0hBcE8xeHlYRzRnSUhSb2FYTXVYMmx6Um1seWMzUkdjbUZ0WlNBOUlIUnlkV1U3WEhKY2JuMDdYSEpjYmx4eVhHNVRhMlYwWTJndWNISnZkRzkwZVhCbExsOWtjbUYzVTNSaGRHbHZibUZ5ZVV4dloyOGdQU0JtZFc1amRHbHZiaWh3S1NCN1hISmNiaUFnY0M1aVlXTnJaM0p2ZFc1a0tESTFOU2s3WEhKY2JpQWdjQzV6ZEhKdmEyVW9NalUxS1R0Y2NseHVJQ0J3TG1acGJHd29YQ0lqTUVFd01EQkJYQ0lwTzF4eVhHNGdJSEF1YzNSeWIydGxWMlZwWjJoMEtESXBPMXh5WEc0Z0lIUm9hWE11WDJKaWIzaFVaWGgwTG1SeVlYY29LVHRjY2x4dWZUdGNjbHh1WEhKY2JsTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgzTmxkSFZ3SUQwZ1puVnVZM1JwYjI0b2NDa2dlMXh5WEc0Z0lFSmhjMlZNYjJkdlUydGxkR05vTG5CeWIzUnZkSGx3WlM1ZmMyVjBkWEF1WTJGc2JDaDBhR2x6TENCd0tUdGNjbHh1WEhKY2JpQWdMeThnUTNKbFlYUmxJR0VnUW1KdmVFRnNhV2R1WldSVVpYaDBJR2x1YzNSaGJtTmxJSFJvWVhRZ2QybHNiQ0JpWlNCMWMyVmtJR1p2Y2lCa2NtRjNhVzVuSUdGdVpGeHlYRzRnSUM4dklISnZkR0YwYVc1bklIUmxlSFJjY2x4dUlDQjBhR2x6TGw5aVltOTRWR1Y0ZENBOUlHNWxkeUJDWW05NFZHVjRkQ2gwYUdsekxsOW1iMjUwTENCMGFHbHpMbDkwWlhoMExDQjBhR2x6TGw5bWIyNTBVMmw2WlN3Z01Dd2dNQ3dnY0NrN1hISmNibHh5WEc0Z0lDOHZJRWhoYm1Sc1pTQjBhR1VnYVc1cGRHbGhiQ0J6WlhSMWNDQmllU0IwY21sbloyVnlhVzVuSUdFZ2NtVnphWHBsWEhKY2JpQWdkR2hwY3k1ZmIyNVNaWE5wZW1Vb2NDazdYSEpjYmx4eVhHNGdJQzh2SUZObGRDQjFjQ0J1YjJselpTQm5aVzVsY21GMGIzSnpYSEpjYmlBZ2RHaHBjeTVmY205MFlYUnBiMjVPYjJselpTQTlJRzVsZHlCT2IybHpaUzVPYjJselpVZGxibVZ5WVhSdmNqRkVLSEFzSUMxd0xsQkpJQzhnTkN3Z2NDNVFTU0F2SURRc0lEQXVNRElwTzF4eVhHNGdJSFJvYVhNdVgzaDVUbTlwYzJVZ1BTQnVaWGNnVG05cGMyVXVUbTlwYzJWSFpXNWxjbUYwYjNJeVJDaHdMQ0F0TVRBd0xDQXhNREFzSUMwMU1Dd2dOVEFzSURBdU1ERXNJREF1TURFcE8xeHlYRzU5TzF4eVhHNWNjbHh1VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmWkhKaGR5QTlJR1oxYm1OMGFXOXVLSEFwSUh0Y2NseHVJQ0JDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXVYMlJ5WVhjdVkyRnNiQ2gwYUdsekxDQndLVHRjY2x4dUlDQnBaaUFvSVhSb2FYTXVYMmx6VFc5MWMyVlBkbVZ5SUh4OElDRjBhR2x6TGw5cGMwOTJaWEpPWVhaTWIyZHZLU0J5WlhSMWNtNDdYSEpjYmx4eVhHNGdJQzh2SUZkb1pXNGdkR2hsSUhSbGVIUWdhWE1nWVdKdmRYUWdkRzhnWW1WamIyMWxJR0ZqZEdsMlpTQm1iM0lnZEdobElHWnBjbk4wSUhScGJXVXNJR05zWldGeVhISmNiaUFnTHk4Z2RHaGxJSE4wWVhScGIyNWhjbmtnYkc5bmJ5QjBhR0YwSUhkaGN5QndjbVYyYVc5MWMyeDVJR1J5WVhkdUxseHlYRzRnSUdsbUlDaDBhR2x6TGw5cGMwWnBjbk4wUm5KaGJXVXBJSHRjY2x4dUlDQWdJSEF1WW1GamEyZHliM1Z1WkNneU5UVXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZmFYTkdhWEp6ZEVaeVlXMWxJRDBnWm1Gc2MyVTdYSEpjYmlBZ2ZWeHlYRzVjY2x4dUlDQXZMeUJEWVd4amRXeGhkR1VnY0c5emFYUnBiMjRnWVc1a0lISnZkR0YwYVc5dUlIUnZJR055WldGMFpTQmhJR3BwZEhSbGNua2diRzluYjF4eVhHNGdJSFpoY2lCeWIzUmhkR2x2YmlBOUlIUm9hWE11WDNKdmRHRjBhVzl1VG05cGMyVXVaMlZ1WlhKaGRHVW9LVHRjY2x4dUlDQjJZWElnZUhsUFptWnpaWFFnUFNCMGFHbHpMbDk0ZVU1dmFYTmxMbWRsYm1WeVlYUmxLQ2s3WEhKY2JpQWdkR2hwY3k1ZlltSnZlRlJsZUhSY2NseHVJQ0FnSUM1elpYUlNiM1JoZEdsdmJpaHliM1JoZEdsdmJpbGNjbHh1SUNBZ0lDNXpaWFJRYjNOcGRHbHZiaWgwYUdsekxsOTBaWGgwVUc5ekxuZ2dLeUI0ZVU5bVpuTmxkQzU0TENCMGFHbHpMbDkwWlhoMFVHOXpMbmtnS3lCNGVVOW1abk5sZEM1NUtWeHlYRzRnSUNBZ0xtUnlZWGNvS1R0Y2NseHVmVHRjY2x4dUlpd2liVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQk5ZV2x1VG1GMk8xeHlYRzVjY2x4dVpuVnVZM1JwYjI0Z1RXRnBiazVoZGloc2IyRmtaWElwSUh0Y2NseHVJQ0IwYUdsekxsOXNiMkZrWlhJZ1BTQnNiMkZrWlhJN1hISmNiaUFnZEdocGN5NWZKR3h2WjI4Z1BTQWtLRndpYm1GMkxtNWhkbUpoY2lBdWJtRjJZbUZ5TFdKeVlXNWtYQ0lwTzF4eVhHNGdJSFJvYVhNdVh5UnVZWFlnUFNBa0tGd2lJMjFoYVc0dGJtRjJYQ0lwTzF4eVhHNGdJSFJvYVhNdVh5UnVZWFpNYVc1cmN5QTlJSFJvYVhNdVh5UnVZWFl1Wm1sdVpDaGNJbUZjSWlrN1hISmNiaUFnZEdocGN5NWZKR0ZqZEdsMlpVNWhkaUE5SUhSb2FYTXVYeVJ1WVhaTWFXNXJjeTVtYVc1a0tGd2lMbUZqZEdsMlpWd2lLVHRjY2x4dUlDQjBhR2x6TGw4a2JtRjJUR2x1YTNNdWIyNG9YQ0pqYkdsamExd2lMQ0IwYUdsekxsOXZiazVoZGtOc2FXTnJMbUpwYm1Rb2RHaHBjeWtwTzF4eVhHNGdJSFJvYVhNdVh5UnNiMmR2TG05dUtGd2lZMnhwWTJ0Y0lpd2dkR2hwY3k1ZmIyNU1iMmR2UTJ4cFkyc3VZbWx1WkNoMGFHbHpLU2s3WEhKY2JuMWNjbHh1WEhKY2JrMWhhVzVPWVhZdWNISnZkRzkwZVhCbExuTmxkRUZqZEdsMlpVWnliMjFWY213Z1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQjBhR2x6TGw5a1pXRmpkR2wyWVhSbEtDazdYSEpjYmlBZ2RtRnlJSFZ5YkNBOUlHeHZZMkYwYVc5dUxuQmhkR2h1WVcxbE8xeHlYRzRnSUdsbUlDaDFjbXdnUFQwOUlGd2lMMmx1WkdWNExtaDBiV3hjSWlCOGZDQjFjbXdnUFQwOUlGd2lMMXdpS1NCN1hISmNiaUFnSUNCMGFHbHpMbDloWTNScGRtRjBaVXhwYm1zb2RHaHBjeTVmSkc1aGRreHBibXR6TG1acGJIUmxjaWhjSWlOaFltOTFkQzFzYVc1clhDSXBLVHRjY2x4dUlDQjlJR1ZzYzJVZ2FXWWdLSFZ5YkNBOVBUMGdYQ0l2ZDI5eWF5NW9kRzFzWENJcElIdGNjbHh1SUNBZ0lIUm9hWE11WDJGamRHbDJZWFJsVEdsdWF5aDBhR2x6TGw4a2JtRjJUR2x1YTNNdVptbHNkR1Z5S0Z3aUkzZHZjbXN0YkdsdWExd2lLU2s3WEhKY2JpQWdmU0JsYkhObElHbG1JQ2gxY213Z1BUMDlJRndpTDJOdmJuUmhZM1F1YUhSdGJGd2lLU0I3WEhKY2JpQWdJQ0IwYUdsekxsOWhZM1JwZG1GMFpVeHBibXNvZEdocGN5NWZKRzVoZGt4cGJtdHpMbVpwYkhSbGNpaGNJaU5qYjI1MFlXTjBMV3hwYm10Y0lpa3BPMXh5WEc0Z0lIMWNjbHh1ZlR0Y2NseHVYSEpjYmsxaGFXNU9ZWFl1Y0hKdmRHOTBlWEJsTGw5a1pXRmpkR2wyWVhSbElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdhV1lnS0hSb2FYTXVYeVJoWTNScGRtVk9ZWFl1YkdWdVozUm9LU0I3WEhKY2JpQWdJQ0IwYUdsekxsOGtZV04wYVhabFRtRjJMbkpsYlc5MlpVTnNZWE56S0Z3aVlXTjBhWFpsWENJcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkdGamRHbDJaVTVoZGlBOUlDUW9LVHRjY2x4dUlDQjlYSEpjYm4wN1hISmNibHh5WEc1TllXbHVUbUYyTG5CeWIzUnZkSGx3WlM1ZllXTjBhWFpoZEdWTWFXNXJJRDBnWm5WdVkzUnBiMjRvSkd4cGJtc3BJSHRjY2x4dUlDQWtiR2x1YXk1aFpHUkRiR0Z6Y3loY0ltRmpkR2wyWlZ3aUtUdGNjbHh1SUNCMGFHbHpMbDhrWVdOMGFYWmxUbUYySUQwZ0pHeHBibXM3WEhKY2JuMDdYSEpjYmx4eVhHNU5ZV2x1VG1GMkxuQnliM1J2ZEhsd1pTNWZiMjVNYjJkdlEyeHBZMnNnUFNCbWRXNWpkR2x2YmlobEtTQjdYSEpjYmlBZ1pTNXdjbVYyWlc1MFJHVm1ZWFZzZENncE8xeHlYRzRnSUhaaGNpQWtkR0Z5WjJWMElEMGdKQ2hsTG1OMWNuSmxiblJVWVhKblpYUXBPMXh5WEc0Z0lIWmhjaUIxY213Z1BTQWtkR0Z5WjJWMExtRjBkSElvWENKb2NtVm1YQ0lwTzF4eVhHNGdJSFJvYVhNdVgyeHZZV1JsY2k1c2IyRmtVR0ZuWlNoMWNtd3NJSHQ5TENCMGNuVmxLVHRjY2x4dWZUdGNjbHh1WEhKY2JrMWhhVzVPWVhZdWNISnZkRzkwZVhCbExsOXZiazVoZGtOc2FXTnJJRDBnWm5WdVkzUnBiMjRvWlNrZ2UxeHlYRzRnSUdVdWNISmxkbVZ1ZEVSbFptRjFiSFFvS1R0Y2NseHVJQ0IwYUdsekxsOGtibUYyTG1OdmJHeGhjSE5sS0Z3aWFHbGtaVndpS1RzZ0x5OGdRMnh2YzJVZ2RHaGxJRzVoZGlBdElHOXViSGtnYldGMGRHVnljeUJ2YmlCdGIySnBiR1ZjY2x4dUlDQjJZWElnSkhSaGNtZGxkQ0E5SUNRb1pTNWpkWEp5Wlc1MFZHRnlaMlYwS1R0Y2NseHVJQ0JwWmlBb0pIUmhjbWRsZEM1cGN5aDBhR2x6TGw4a1lXTjBhWFpsVG1GMktTa2djbVYwZFhKdU8xeHlYRzRnSUhSb2FYTXVYMlJsWVdOMGFYWmhkR1VvS1R0Y2NseHVJQ0IwYUdsekxsOWhZM1JwZG1GMFpVeHBibXNvSkhSaGNtZGxkQ2s3WEhKY2JpQWdkbUZ5SUhWeWJDQTlJQ1IwWVhKblpYUXVZWFIwY2loY0ltaHlaV1pjSWlrN1hISmNiaUFnZEdocGN5NWZiRzloWkdWeUxteHZZV1JRWVdkbEtIVnliQ3dnZTMwc0lIUnlkV1VwTzF4eVhHNTlPMXh5WEc0aUxDSjJZWElnVEc5aFpHVnlJRDBnY21WeGRXbHlaU2hjSWk0dmNHRm5aUzFzYjJGa1pYSXVhbk5jSWlrN1hISmNiblpoY2lCTllXbHVUbUYySUQwZ2NtVnhkV2x5WlNoY0lpNHZiV0ZwYmkxdVlYWXVhbk5jSWlrN1hISmNiblpoY2lCSWIzWmxjbE5zYVdSbGMyaHZkM01nUFNCeVpYRjFhWEpsS0Z3aUxpOW9iM1psY2kxemJHbGtaWE5vYjNjdWFuTmNJaWs3WEhKY2JuWmhjaUJRYjNKMFptOXNhVzlHYVd4MFpYSWdQU0J5WlhGMWFYSmxLRndpTGk5d2IzSjBabTlzYVc4dFptbHNkR1Z5TG1welhDSXBPMXh5WEc1MllYSWdjMnhwWkdWemFHOTNjeUE5SUhKbGNYVnBjbVVvWENJdUwzUm9kVzFpYm1GcGJDMXpiR2xrWlhOb2IzY3ZjMnhwWkdWemFHOTNMbXB6WENJcE8xeHlYRzVjY2x4dUx5OGdVR2xqYTJsdVp5QmhJSEpoYm1SdmJTQnphMlYwWTJnZ2RHaGhkQ0IwYUdVZ2RYTmxjaUJvWVhOdUozUWdjMlZsYmlCaVpXWnZjbVZjY2x4dWRtRnlJRk5yWlhSamFDQTlJSEpsY1hWcGNtVW9YQ0l1TDNCcFkyc3RjbUZ1Wkc5dExYTnJaWFJqYUM1cWMxd2lLU2dwTzF4eVhHNWNjbHh1THk4Z1FVcEJXQ0J3WVdkbElHeHZZV1JsY2l3Z2QybDBhQ0JqWVd4c1ltRmpheUJtYjNJZ2NtVnNiMkZrYVc1bklIZHBaR2RsZEhOY2NseHVkbUZ5SUd4dllXUmxjaUE5SUc1bGR5Qk1iMkZrWlhJb2IyNVFZV2RsVEc5aFpDazdYSEpjYmx4eVhHNHZMeUJOWVdsdUlHNWhkaUIzYVdSblpYUmNjbHh1ZG1GeUlHMWhhVzVPWVhZZ1BTQnVaWGNnVFdGcGJrNWhkaWhzYjJGa1pYSXBPMXh5WEc1Y2NseHVMeThnU1c1MFpYSmhZM1JwZG1VZ2JHOW5ieUJwYmlCdVlYWmlZWEpjY2x4dWRtRnlJRzVoZGlBOUlDUW9YQ0p1WVhZdWJtRjJZbUZ5WENJcE8xeHlYRzUyWVhJZ2JtRjJURzluYnlBOUlHNWhkaTVtYVc1a0tGd2lMbTVoZG1KaGNpMWljbUZ1WkZ3aUtUdGNjbHh1Ym1WM0lGTnJaWFJqYUNodVlYWXNJRzVoZGt4dloyOHBPMXh5WEc1Y2NseHVMeThnVjJsa1oyVjBJR2RzYjJKaGJITmNjbHh1ZG1GeUlIQnZjblJtYjJ4cGIwWnBiSFJsY2p0Y2NseHVYSEpjYmk4dklFeHZZV1FnWVd4c0lIZHBaR2RsZEhOY2NseHViMjVRWVdkbFRHOWhaQ2dwTzF4eVhHNWNjbHh1THk4Z1NHRnVaR3hsSUdKaFkyc3ZabTl5ZDJGeVpDQmlkWFIwYjI1elhISmNibmRwYm1SdmR5NWhaR1JGZG1WdWRFeHBjM1JsYm1WeUtGd2ljRzl3YzNSaGRHVmNJaXdnYjI1UWIzQlRkR0YwWlNrN1hISmNibHh5WEc1bWRXNWpkR2x2YmlCdmJsQnZjRk4wWVhSbEtHVXBJSHRjY2x4dUlDQXZMeUJNYjJGa1pYSWdjM1J2Y21WeklHTjFjM1J2YlNCa1lYUmhJR2x1SUhSb1pTQnpkR0YwWlNBdElHbHVZMngxWkdsdVp5QjBhR1VnZFhKc0lHRnVaQ0IwYUdVZ2NYVmxjbmxjY2x4dUlDQjJZWElnZFhKc0lEMGdLR1V1YzNSaGRHVWdKaVlnWlM1emRHRjBaUzUxY213cElIeDhJRndpTDJsdVpHVjRMbWgwYld4Y0lqdGNjbHh1SUNCMllYSWdjWFZsY25sUFltcGxZM1FnUFNBb1pTNXpkR0YwWlNBbUppQmxMbk4wWVhSbExuRjFaWEo1S1NCOGZDQjdmVHRjY2x4dVhISmNiaUFnYVdZZ0tIVnliQ0E5UFQwZ2JHOWhaR1Z5TG1kbGRFeHZZV1JsWkZCaGRHZ29LU0FtSmlCMWNtd2dQVDA5SUZ3aUwzZHZjbXN1YUhSdGJGd2lLU0I3WEhKY2JpQWdJQ0F2THlCVWFHVWdZM1Z5Y21WdWRDQW1JSEJ5WlhacGIzVnpJR3h2WVdSbFpDQnpkR0YwWlhNZ2QyVnlaU0IzYjNKckxtaDBiV3dzSUhOdklHcDFjM1FnY21WbWFXeDBaWEpjY2x4dUlDQWdJSFpoY2lCallYUmxaMjl5ZVNBOUlIRjFaWEo1VDJKcVpXTjBMbU5oZEdWbmIzSjVJSHg4SUZ3aVlXeHNYQ0k3WEhKY2JpQWdJQ0J3YjNKMFptOXNhVzlHYVd4MFpYSXVjMlZzWldOMFEyRjBaV2R2Y25rb1kyRjBaV2R2Y25rcE8xeHlYRzRnSUgwZ1pXeHpaU0I3WEhKY2JpQWdJQ0F2THlCTWIyRmtJSFJvWlNCdVpYY2djR0ZuWlZ4eVhHNGdJQ0FnYkc5aFpHVnlMbXh2WVdSUVlXZGxLSFZ5YkN3Z2UzMHNJR1poYkhObEtUdGNjbHh1SUNCOVhISmNibjFjY2x4dVhISmNibVoxYm1OMGFXOXVJRzl1VUdGblpVeHZZV1FvS1NCN1hISmNiaUFnTHk4Z1VtVnNiMkZrSUdGc2JDQndiSFZuYVc1ekwzZHBaR2RsZEhOY2NseHVJQ0J1WlhjZ1NHOTJaWEpUYkdsa1pYTm9iM2R6S0NrN1hISmNiaUFnY0c5eWRHWnZiR2x2Um1sc2RHVnlJRDBnYm1WM0lGQnZjblJtYjJ4cGIwWnBiSFJsY2loc2IyRmtaWElwTzF4eVhHNGdJSE5zYVdSbGMyaHZkM011YVc1cGRDZ3BPMXh5WEc0Z0lHOWlhbVZqZEVacGRFbHRZV2RsY3lncE8xeHlYRzRnSUhOdFlYSjBjWFZ2ZEdWektDazdYSEpjYmx4eVhHNGdJQzh2SUZOc2FXZG9kR3g1SUhKbFpIVnVaR0Z1ZEN3Z1luVjBJSFZ3WkdGMFpTQjBhR1VnYldGcGJpQnVZWFlnZFhOcGJtY2dkR2hsSUdOMWNuSmxiblFnVlZKTUxpQlVhR2x6WEhKY2JpQWdMeThnYVhNZ2FXMXdiM0owWVc1MElHbG1JR0VnY0dGblpTQnBjeUJzYjJGa1pXUWdZbmtnZEhsd2FXNW5JR0VnWm5Wc2JDQlZVa3dnS0dVdVp5NGdaMjlwYm1kY2NseHVJQ0F2THlCa2FYSmxZM1JzZVNCMGJ5QXZkMjl5YXk1b2RHMXNLU0J2Y2lCM2FHVnVJRzF2ZG1sdVp5Qm1jbTl0SUhkdmNtc3VhSFJ0YkNCMGJ5QmhJSEJ5YjJwbFkzUXVYSEpjYmlBZ2JXRnBiazVoZGk1elpYUkJZM1JwZG1WR2NtOXRWWEpzS0NrN1hISmNibjFjY2x4dVhISmNiaTh2SUZkbEozWmxJR2hwZENCMGFHVWdiR0Z1WkdsdVp5QndZV2RsTENCc2IyRmtJSFJvWlNCaFltOTFkQ0J3WVdkbFhISmNiaTh2SUdsbUlDaHNiMk5oZEdsdmJpNXdZWFJvYm1GdFpTNXRZWFJqYUNndlhpaGNYQzk4WEZ3dmFXNWtaWGd1YUhSdGJIeHBibVJsZUM1b2RHMXNLU1F2S1NrZ2UxeHlYRzR2THlBZ0lDQWdiRzloWkdWeUxteHZZV1JRWVdkbEtGd2lMMkZpYjNWMExtaDBiV3hjSWl3Z2UzMHNJR1poYkhObEtUdGNjbHh1THk4Z2ZWeHlYRzRpTENKdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUV4dllXUmxjanRjY2x4dVhISmNiblpoY2lCMWRHbHNhWFJwWlhNZ1BTQnlaWEYxYVhKbEtGd2lMaTkxZEdsc2FYUnBaWE11YW5OY0lpazdYSEpjYmx4eVhHNW1kVzVqZEdsdmJpQk1iMkZrWlhJb2IyNVNaV3h2WVdRc0lHWmhaR1ZFZFhKaGRHbHZiaWtnZTF4eVhHNGdJSFJvYVhNdVh5UmpiMjUwWlc1MElEMGdKQ2hjSWlOamIyNTBaVzUwWENJcE8xeHlYRzRnSUhSb2FYTXVYMjl1VW1Wc2IyRmtJRDBnYjI1U1pXeHZZV1E3WEhKY2JpQWdkR2hwY3k1ZlptRmtaVVIxY21GMGFXOXVJRDBnWm1Ga1pVUjFjbUYwYVc5dUlDRTlQU0IxYm1SbFptbHVaV1FnUHlCbVlXUmxSSFZ5WVhScGIyNGdPaUF5TlRBN1hISmNiaUFnZEdocGN5NWZjR0YwYUNBOUlHeHZZMkYwYVc5dUxuQmhkR2h1WVcxbE8xeHlYRzU5WEhKY2JseHlYRzVNYjJGa1pYSXVjSEp2ZEc5MGVYQmxMbWRsZEV4dllXUmxaRkJoZEdnZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQnlaWFIxY200Z2RHaHBjeTVmY0dGMGFEdGNjbHh1ZlR0Y2NseHVYSEpjYmt4dllXUmxjaTV3Y205MGIzUjVjR1V1Ykc5aFpGQmhaMlVnUFNCbWRXNWpkR2x2YmloMWNtd3NJSEYxWlhKNVQySnFaV04wTENCemFHOTFiR1JRZFhOb1NHbHpkRzl5ZVNrZ2UxeHlYRzRnSUM4dklFWmhaR1VnZEdobGJpQmxiWEIwZVNCMGFHVWdZM1Z5Y21WdWRDQmpiMjUwWlc1MGMxeHlYRzRnSUhSb2FYTXVYeVJqYjI1MFpXNTBMblpsYkc5amFYUjVLRnh5WEc0Z0lDQWdleUJ2Y0dGamFYUjVPaUF3SUgwc1hISmNiaUFnSUNCMGFHbHpMbDltWVdSbFJIVnlZWFJwYjI0c1hISmNiaUFnSUNCY0luTjNhVzVuWENJc1hISmNiaUFnSUNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNBZ0lDQWdkR2hwY3k1ZkpHTnZiblJsYm5RdVpXMXdkSGtvS1R0Y2NseHVJQ0FnSUNBZ2RHaHBjeTVmSkdOdmJuUmxiblF1Ykc5aFpDaDFjbXdnS3lCY0lpQWpZMjl1ZEdWdWRGd2lMQ0J2YmtOdmJuUmxiblJHWlhSamFHVmtMbUpwYm1Rb2RHaHBjeWtwTzF4eVhHNGdJQ0FnZlM1aWFXNWtLSFJvYVhNcFhISmNiaUFnS1R0Y2NseHVYSEpjYmlBZ0x5OGdSbUZrWlNCMGFHVWdibVYzSUdOdmJuUmxiblFnYVc0Z1lXWjBaWElnYVhRZ2FHRnpJR0psWlc0Z1ptVjBZMmhsWkZ4eVhHNGdJR1oxYm1OMGFXOXVJRzl1UTI5dWRHVnVkRVpsZEdOb1pXUW9jbVZ6Y0c5dWMyVlVaWGgwTENCMFpYaDBVM1JoZEhWektTQjdYSEpjYmlBZ0lDQnBaaUFvZEdWNGRGTjBZWFIxY3lBOVBUMGdYQ0psY25KdmNsd2lLU0I3WEhKY2JpQWdJQ0FnSUdOdmJuTnZiR1V1Ykc5bktGd2lWR2hsY21VZ2QyRnpJR0VnY0hKdllteGxiU0JzYjJGa2FXNW5JSFJvWlNCd1lXZGxMbHdpS1R0Y2NseHVJQ0FnSUNBZ2NtVjBkWEp1TzF4eVhHNGdJQ0FnZlZ4eVhHNWNjbHh1SUNBZ0lIWmhjaUJ4ZFdWeWVWTjBjbWx1WnlBOUlIVjBhV3hwZEdsbGN5NWpjbVZoZEdWUmRXVnllVk4wY21sdVp5aHhkV1Z5ZVU5aWFtVmpkQ2s3WEhKY2JpQWdJQ0JwWmlBb2MyaHZkV3hrVUhWemFFaHBjM1J2Y25rcElIdGNjbHh1SUNBZ0lDQWdhR2x6ZEc5eWVTNXdkWE5vVTNSaGRHVW9YSEpjYmlBZ0lDQWdJQ0FnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdkWEpzT2lCMWNtd3NYSEpjYmlBZ0lDQWdJQ0FnSUNCeGRXVnllVG9nY1hWbGNubFBZbXBsWTNSY2NseHVJQ0FnSUNBZ0lDQjlMRnh5WEc0Z0lDQWdJQ0FnSUc1MWJHd3NYSEpjYmlBZ0lDQWdJQ0FnZFhKc0lDc2djWFZsY25sVGRISnBibWRjY2x4dUlDQWdJQ0FnS1R0Y2NseHVJQ0FnSUgxY2NseHVYSEpjYmlBZ0lDQXZMeUJWY0dSaGRHVWdSMjl2WjJ4bElHRnVZV3g1ZEdsamMxeHlYRzRnSUNBZ1oyRW9YQ0p6WlhSY0lpd2dYQ0p3WVdkbFhDSXNJSFZ5YkNBcklIRjFaWEo1VTNSeWFXNW5LVHRjY2x4dUlDQWdJR2RoS0Z3aWMyVnVaRndpTENCY0luQmhaMlYyYVdWM1hDSXBPMXh5WEc1Y2NseHVJQ0FnSUhSb2FYTXVYM0JoZEdnZ1BTQnNiMk5oZEdsdmJpNXdZWFJvYm1GdFpUdGNjbHh1SUNBZ0lIUm9hWE11WHlSamIyNTBaVzUwTG5abGJHOWphWFI1S0hzZ2IzQmhZMmwwZVRvZ01TQjlMQ0IwYUdsekxsOW1ZV1JsUkhWeVlYUnBiMjRzSUZ3aWMzZHBibWRjSWlrN1hISmNiaUFnSUNCMGFHbHpMbDl2YmxKbGJHOWhaQ2dwTzF4eVhHNGdJSDFjY2x4dWZUdGNjbHh1SWl3aWRtRnlJR052YjJ0cFpYTWdQU0J5WlhGMWFYSmxLRndpYW5NdFkyOXZhMmxsWENJcE8xeHlYRzUyWVhJZ2RYUnBiSE1nUFNCeVpYRjFhWEpsS0Z3aUxpOTFkR2xzYVhScFpYTXVhbk5jSWlrN1hISmNibHh5WEc1MllYSWdjMnRsZEdOb1EyOXVjM1J5ZFdOMGIzSnpJRDBnZTF4eVhHNGdJRndpYUdGc1puUnZibVV0Wm14aGMyaHNhV2RvZEZ3aU9pQnlaWEYxYVhKbEtGd2lMaTlwYm5SbGNtRmpkR2wyWlMxc2IyZHZjeTlvWVd4bWRHOXVaUzFtYkdGemFHeHBaMmgwTFhkdmNtUXVhbk5jSWlrc1hISmNiaUFnWENKdWIybHplUzEzYjNKa1hDSTZJSEpsY1hWcGNtVW9YQ0l1TDJsdWRHVnlZV04wYVhabExXeHZaMjl6TDI1dmFYTjVMWGR2Y21RdGMydGxkR05vTG1welhDSXBMRnh5WEc0Z0lGd2lZMjl1Ym1WamRDMXdiMmx1ZEhOY0lqb2djbVZ4ZFdseVpTaGNJaTR2YVc1MFpYSmhZM1JwZG1VdGJHOW5iM012WTI5dWJtVmpkQzF3YjJsdWRITXRjMnRsZEdOb0xtcHpYQ0lwWEhKY2JuMDdYSEpjYm5aaGNpQnVkVzFUYTJWMFkyaGxjeUE5SUU5aWFtVmpkQzVyWlhsektITnJaWFJqYUVOdmJuTjBjblZqZEc5eWN5a3ViR1Z1WjNSb08xeHlYRzUyWVhJZ1kyOXZhMmxsUzJWNUlEMGdYQ0p6WldWdUxYTnJaWFJqYUMxdVlXMWxjMXdpTzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUZCcFkyc2dZU0J5WVc1a2IyMGdjMnRsZEdOb0lIUm9ZWFFnZFhObGNpQm9ZWE51SjNRZ2MyVmxiaUI1WlhRdUlFbG1JSFJvWlNCMWMyVnlJR2hoY3lCelpXVnVJR0ZzYkNCMGFHVmNjbHh1SUNvZ2MydGxkR05vWlhNc0lHcDFjM1FnY0dsamF5QmhJSEpoYm1SdmJTQnZibVV1SUZSb2FYTWdkWE5sY3lCamIyOXJhV1Z6SUhSdklIUnlZV05ySUhkb1lYUWdkR2hsSUhWelpYSmNjbHh1SUNvZ2FHRnpJSE5sWlc0Z1lXeHlaV0ZrZVM1Y2NseHVJQ29nUUhKbGRIVnliaUI3Um5WdVkzUnBiMjU5SUVOdmJuTjBjblZqZEc5eUlHWnZjaUJoSUZOclpYUmphQ0JqYkdGemMxeHlYRzRnS2k5Y2NseHViVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQm1kVzVqZEdsdmJpQndhV05yVW1GdVpHOXRVMnRsZEdOb0tDa2dlMXh5WEc0Z0lIWmhjaUJ6WldWdVUydGxkR05vVG1GdFpYTWdQU0JqYjI5cmFXVnpMbWRsZEVwVFQwNG9ZMjl2YTJsbFMyVjVLU0I4ZkNCYlhUdGNjbHh1WEhKY2JpQWdMeThnUm1sdVpDQjBhR1VnYm1GdFpYTWdiMllnZEdobElIVnVjMlZsYmlCemEyVjBZMmhsYzF4eVhHNGdJSFpoY2lCMWJuTmxaVzVUYTJWMFkyaE9ZVzFsY3lBOUlHWnBibVJWYm5ObFpXNVRhMlYwWTJobGN5aHpaV1Z1VTJ0bGRHTm9UbUZ0WlhNcE8xeHlYRzVjY2x4dUlDQXZMeUJCYkd3Z2MydGxkR05vWlhNZ2FHRjJaU0JpWldWdUlITmxaVzVjY2x4dUlDQnBaaUFvZFc1elpXVnVVMnRsZEdOb1RtRnRaWE11YkdWdVozUm9JRDA5UFNBd0tTQjdYSEpjYmlBZ0lDQXZMeUJKWmlCM1pTZDJaU0JuYjNRZ2JXOXlaU0IwYUdWdUlHOXVaU0J6YTJWMFkyZ3NJSFJvWlc0Z2JXRnJaU0J6ZFhKbElIUnZJR05vYjI5elpTQmhJSEpoYm1SdmJWeHlYRzRnSUNBZ0x5OGdjMnRsZEdOb0lHVjRZMngxWkdsdVp5QjBhR1VnYlc5emRDQnlaV05sYm5Sc2VTQnpaV1Z1SUhOclpYUmphRnh5WEc0Z0lDQWdhV1lnS0c1MWJWTnJaWFJqYUdWeklENGdNU2tnZTF4eVhHNGdJQ0FnSUNCelpXVnVVMnRsZEdOb1RtRnRaWE1nUFNCYmMyVmxibE5yWlhSamFFNWhiV1Z6TG5CdmNDZ3BYVHRjY2x4dUlDQWdJQ0FnZFc1elpXVnVVMnRsZEdOb1RtRnRaWE1nUFNCbWFXNWtWVzV6WldWdVUydGxkR05vWlhNb2MyVmxibE5yWlhSamFFNWhiV1Z6S1R0Y2NseHVJQ0FnSUgwZ1pXeHpaU0I3WEhKY2JpQWdJQ0FnSUM4dklFbG1JSGRsSjNabElHOXViSGtnWjI5MElHOXVaU0J6YTJWMFkyZ3NJSFJvWlc0Z2QyVWdZMkZ1SjNRZ1pHOGdiWFZqYUM0dUxseHlYRzRnSUNBZ0lDQnpaV1Z1VTJ0bGRHTm9UbUZ0WlhNZ1BTQmJYVHRjY2x4dUlDQWdJQ0FnZFc1elpXVnVVMnRsZEdOb1RtRnRaWE1nUFNCUFltcGxZM1F1YTJWNWN5aHphMlYwWTJoRGIyNXpkSEoxWTNSdmNuTXBPMXh5WEc0Z0lDQWdmVnh5WEc0Z0lIMWNjbHh1WEhKY2JpQWdkbUZ5SUhKaGJtUlRhMlYwWTJoT1lXMWxJRDBnZFhScGJITXVjbUZ1WkVGeWNtRjVSV3hsYldWdWRDaDFibk5sWlc1VGEyVjBZMmhPWVcxbGN5azdYSEpjYmlBZ2MyVmxibE5yWlhSamFFNWhiV1Z6TG5CMWMyZ29jbUZ1WkZOclpYUmphRTVoYldVcE8xeHlYRzVjY2x4dUlDQXZMeUJUZEc5eVpTQjBhR1VnWjJWdVpYSmhkR1ZrSUhOclpYUmphQ0JwYmlCaElHTnZiMnRwWlM0Z1ZHaHBjeUJqY21WaGRHVnpJR0VnYlc5MmFXNW5JRGNnWkdGNVhISmNiaUFnTHk4Z2QybHVaRzkzSUMwZ1lXNTVkR2x0WlNCMGFHVWdjMmwwWlNCcGN5QjJhWE5wZEdWa0xDQjBhR1VnWTI5dmEybGxJR2x6SUhKbFpuSmxjMmhsWkM1Y2NseHVJQ0JqYjI5cmFXVnpMbk5sZENoamIyOXJhV1ZMWlhrc0lITmxaVzVUYTJWMFkyaE9ZVzFsY3l3Z2V5QmxlSEJwY21Wek9pQTNJSDBwTzF4eVhHNWNjbHh1SUNCeVpYUjFjbTRnYzJ0bGRHTm9RMjl1YzNSeWRXTjBiM0p6VzNKaGJtUlRhMlYwWTJoT1lXMWxYVHRjY2x4dWZUdGNjbHh1WEhKY2JtWjFibU4wYVc5dUlHWnBibVJWYm5ObFpXNVRhMlYwWTJobGN5aHpaV1Z1VTJ0bGRHTm9UbUZ0WlhNcElIdGNjbHh1SUNCMllYSWdkVzV6WldWdVUydGxkR05vVG1GdFpYTWdQU0JiWFR0Y2NseHVJQ0JtYjNJZ0tIWmhjaUJ6YTJWMFkyaE9ZVzFsSUdsdUlITnJaWFJqYUVOdmJuTjBjblZqZEc5eWN5a2dlMXh5WEc0Z0lDQWdhV1lnS0hObFpXNVRhMlYwWTJoT1lXMWxjeTVwYm1SbGVFOW1LSE5yWlhSamFFNWhiV1VwSUQwOVBTQXRNU2tnZTF4eVhHNGdJQ0FnSUNCMWJuTmxaVzVUYTJWMFkyaE9ZVzFsY3k1d2RYTm9LSE5yWlhSamFFNWhiV1VwTzF4eVhHNGdJQ0FnZlZ4eVhHNGdJSDFjY2x4dUlDQnlaWFIxY200Z2RXNXpaV1Z1VTJ0bGRHTm9UbUZ0WlhNN1hISmNibjFjY2x4dUlpd2liVzlrZFd4bExtVjRjRzl5ZEhNZ1BTQlFiM0owWm05c2FXOUdhV3gwWlhJN1hISmNibHh5WEc1MllYSWdkWFJwYkdsMGFXVnpJRDBnY21WeGRXbHlaU2hjSWk0dmRYUnBiR2wwYVdWekxtcHpYQ0lwTzF4eVhHNWNjbHh1ZG1GeUlHUmxabUYxYkhSQ2NtVmhhM0J2YVc1MGN5QTlJRnRjY2x4dUlDQjdJSGRwWkhSb09pQXhNakF3TENCamIyeHpPaUF6TENCemNHRmphVzVuT2lBeE5TQjlMRnh5WEc0Z0lIc2dkMmxrZEdnNklEazVNaXdnWTI5c2N6b2dNeXdnYzNCaFkybHVaem9nTVRVZ2ZTeGNjbHh1SUNCN0lIZHBaSFJvT2lBM01EQXNJR052YkhNNklETXNJSE53WVdOcGJtYzZJREUxSUgwc1hISmNiaUFnZXlCM2FXUjBhRG9nTmpBd0xDQmpiMnh6T2lBeUxDQnpjR0ZqYVc1bk9pQXhNQ0I5TEZ4eVhHNGdJSHNnZDJsa2RHZzZJRFE0TUN3Z1kyOXNjem9nTWl3Z2MzQmhZMmx1WnpvZ01UQWdmU3hjY2x4dUlDQjdJSGRwWkhSb09pQXpNakFzSUdOdmJITTZJREVzSUhOd1lXTnBibWM2SURFd0lIMWNjbHh1WFR0Y2NseHVYSEpjYm1aMWJtTjBhVzl1SUZCdmNuUm1iMnhwYjBacGJIUmxjaWhzYjJGa1pYSXNJR0p5WldGcmNHOXBiblJ6TENCaGMzQmxZM1JTWVhScGJ5d2dkSEpoYm5OcGRHbHZia1IxY21GMGFXOXVLU0I3WEhKY2JpQWdkR2hwY3k1ZmJHOWhaR1Z5SUQwZ2JHOWhaR1Z5TzF4eVhHNGdJSFJvYVhNdVgyZHlhV1JUY0dGamFXNW5JRDBnTUR0Y2NseHVJQ0IwYUdsekxsOWhjM0JsWTNSU1lYUnBieUE5SUdGemNHVmpkRkpoZEdsdklDRTlQU0IxYm1SbFptbHVaV1FnUHlCaGMzQmxZM1JTWVhScGJ5QTZJREUySUM4Z09UdGNjbHh1SUNCMGFHbHpMbDkwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRnUFNCMGNtRnVjMmwwYVc5dVJIVnlZWFJwYjI0Z0lUMDlJSFZ1WkdWbWFXNWxaQ0EvSUhSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlBNklEZ3dNRHRjY2x4dUlDQjBhR2x6TGw5aWNtVmhhM0J2YVc1MGN5QTlJR0p5WldGcmNHOXBiblJ6SUNFOVBTQjFibVJsWm1sdVpXUWdQeUJpY21WaGEzQnZhVzUwY3k1emJHbGpaU2dwSURvZ1pHVm1ZWFZzZEVKeVpXRnJjRzlwYm5SekxuTnNhV05sS0NrN1hISmNiaUFnZEdocGN5NWZKR2R5YVdRZ1BTQWtLRndpSTNCdmNuUm1iMnhwYnkxbmNtbGtYQ0lwTzF4eVhHNGdJSFJvYVhNdVh5UnVZWFlnUFNBa0tGd2lJM0J2Y25SbWIyeHBieTF1WVhaY0lpazdYSEpjYmlBZ2RHaHBjeTVmSkhCeWIycGxZM1J6SUQwZ1cxMDdYSEpjYmlBZ2RHaHBjeTVmSkdOaGRHVm5iM0pwWlhNZ1BTQjdmVHRjY2x4dUlDQjBhR2x6TGw5eWIzZHpJRDBnTUR0Y2NseHVJQ0IwYUdsekxsOWpiMnh6SUQwZ01EdGNjbHh1SUNCMGFHbHpMbDlwYldGblpVaGxhV2RvZENBOUlEQTdYSEpjYmlBZ2RHaHBjeTVmYVcxaFoyVlhhV1IwYUNBOUlEQTdYSEpjYmx4eVhHNGdJQzh2SUZOdmNuUWdkR2hsSUdKeVpXRnJjRzlwYm5SeklHbHVJR1JsYzJObGJtUnBibWNnYjNKa1pYSmNjbHh1SUNCMGFHbHpMbDlpY21WaGEzQnZhVzUwY3k1emIzSjBLR1oxYm1OMGFXOXVLR0VzSUdJcElIdGNjbHh1SUNBZ0lHbG1JQ2hoTG5kcFpIUm9JRHdnWWk1M2FXUjBhQ2tnY21WMGRYSnVJQzB4TzF4eVhHNGdJQ0FnWld4elpTQnBaaUFvWVM1M2FXUjBhQ0ErSUdJdWQybGtkR2dwSUhKbGRIVnliaUF4TzF4eVhHNGdJQ0FnWld4elpTQnlaWFIxY200Z01EdGNjbHh1SUNCOUtUdGNjbHh1WEhKY2JpQWdkR2hwY3k1ZlkyRmphR1ZRY205cVpXTjBjeWdwTzF4eVhHNGdJSFJvYVhNdVgyTnlaV0YwWlVkeWFXUW9LVHRjY2x4dVhISmNiaUFnZEdocGN5NWZKR2R5YVdRdVptbHVaQ2hjSWk1d2NtOXFaV04wSUdGY0lpa3ViMjRvWENKamJHbGphMXdpTENCMGFHbHpMbDl2YmxCeWIycGxZM1JEYkdsamF5NWlhVzVrS0hSb2FYTXBLVHRjY2x4dVhISmNiaUFnZG1GeUlIRnpJRDBnZFhScGJHbDBhV1Z6TG1kbGRGRjFaWEo1VUdGeVlXMWxkR1Z5Y3lncE8xeHlYRzRnSUhaaGNpQnBibWwwYVdGc1EyRjBaV2R2Y25rZ1BTQnhjeTVqWVhSbFoyOXllU0I4ZkNCY0ltRnNiRndpTzF4eVhHNGdJSFpoY2lCallYUmxaMjl5ZVNBOUlHbHVhWFJwWVd4RFlYUmxaMjl5ZVM1MGIweHZkMlZ5UTJGelpTZ3BPMXh5WEc0Z0lIUm9hWE11WHlSaFkzUnBkbVZPWVhaSmRHVnRJRDBnZEdocGN5NWZKRzVoZGk1bWFXNWtLRndpWVZ0a1lYUmhMV05oZEdWbmIzSjVQVndpSUNzZ1kyRjBaV2R2Y25rZ0t5QmNJbDFjSWlrN1hISmNiaUFnZEdocGN5NWZKR0ZqZEdsMlpVNWhka2wwWlcwdVlXUmtRMnhoYzNNb1hDSmhZM1JwZG1WY0lpazdYSEpjYmlBZ2RHaHBjeTVmWm1sc2RHVnlVSEp2YW1WamRITW9ZMkYwWldkdmNua3BPMXh5WEc0Z0lDUW9YQ0lqY0c5eWRHWnZiR2x2TFc1aGRpQmhYQ0lwTG05dUtGd2lZMnhwWTJ0Y0lpd2dkR2hwY3k1ZmIyNU9ZWFpEYkdsamF5NWlhVzVrS0hSb2FYTXBLVHRjY2x4dVhISmNiaUFnSkNoM2FXNWtiM2NwTG05dUtGd2ljbVZ6YVhwbFhDSXNJSFJvYVhNdVgyTnlaV0YwWlVkeWFXUXVZbWx1WkNoMGFHbHpLU2s3WEhKY2JuMWNjbHh1WEhKY2JsQnZjblJtYjJ4cGIwWnBiSFJsY2k1d2NtOTBiM1I1Y0dVdWMyVnNaV04wUTJGMFpXZHZjbmtnUFNCbWRXNWpkR2x2YmloallYUmxaMjl5ZVNrZ2UxeHlYRzRnSUdOaGRHVm5iM0o1SUQwZ0tHTmhkR1ZuYjNKNUlDWW1JR05oZEdWbmIzSjVMblJ2VEc5M1pYSkRZWE5sS0NrcElIeDhJRndpWVd4c1hDSTdYSEpjYmlBZ2RtRnlJQ1J6Wld4bFkzUmxaRTVoZGlBOUlIUm9hWE11WHlSdVlYWXVabWx1WkNoY0ltRmJaR0YwWVMxallYUmxaMjl5ZVQxY0lpQXJJR05oZEdWbmIzSjVJQ3NnWENKZFhDSXBPMXh5WEc0Z0lHbG1JQ2drYzJWc1pXTjBaV1JPWVhZdWJHVnVaM1JvSUNZbUlDRWtjMlZzWldOMFpXUk9ZWFl1YVhNb2RHaHBjeTVmSkdGamRHbDJaVTVoZGtsMFpXMHBLU0I3WEhKY2JpQWdJQ0IwYUdsekxsOGtZV04wYVhabFRtRjJTWFJsYlM1eVpXMXZkbVZEYkdGemN5aGNJbUZqZEdsMlpWd2lLVHRjY2x4dUlDQWdJSFJvYVhNdVh5UmhZM1JwZG1WT1lYWkpkR1Z0SUQwZ0pITmxiR1ZqZEdWa1RtRjJPMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHRmpkR2wyWlU1aGRrbDBaVzB1WVdSa1EyeGhjM01vWENKaFkzUnBkbVZjSWlrN1hISmNiaUFnSUNCMGFHbHpMbDltYVd4MFpYSlFjbTlxWldOMGN5aGpZWFJsWjI5eWVTazdYSEpjYmlBZ2ZWeHlYRzU5TzF4eVhHNWNjbHh1VUc5eWRHWnZiR2x2Um1sc2RHVnlMbkJ5YjNSdmRIbHdaUzVmWm1sc2RHVnlVSEp2YW1WamRITWdQU0JtZFc1amRHbHZiaWhqWVhSbFoyOXllU2tnZTF4eVhHNGdJSFpoY2lBa2MyVnNaV04wWldSRmJHVnRaVzUwY3lBOUlIUm9hWE11WDJkbGRGQnliMnBsWTNSelNXNURZWFJsWjI5eWVTaGpZWFJsWjI5eWVTazdYSEpjYmx4eVhHNGdJQzh2SUVGdWFXMWhkR1VnZEdobElHZHlhV1FnZEc4Z2RHaGxJR052Y25KbFkzUWdhR1ZwWjJoMElIUnZJR052Ym5SaGFXNGdkR2hsSUhKdmQzTmNjbHh1SUNCMGFHbHpMbDloYm1sdFlYUmxSM0pwWkVobGFXZG9kQ2drYzJWc1pXTjBaV1JGYkdWdFpXNTBjeTVzWlc1bmRHZ3BPMXh5WEc1Y2NseHVJQ0F2THlCTWIyOXdJSFJvY205MVoyZ2dZV3hzSUhCeWIycGxZM1J6WEhKY2JpQWdkR2hwY3k1ZkpIQnliMnBsWTNSekxtWnZja1ZoWTJnb1hISmNiaUFnSUNCbWRXNWpkR2x2Ymlna1pXeGxiV1Z1ZENrZ2UxeHlYRzRnSUNBZ0lDQXZMeUJUZEc5d0lHRnNiQ0JoYm1sdFlYUnBiMjV6WEhKY2JpQWdJQ0FnSUNSbGJHVnRaVzUwTG5abGJHOWphWFI1S0Z3aWMzUnZjRndpS1R0Y2NseHVJQ0FnSUNBZ0x5OGdTV1lnWVc0Z1pXeGxiV1Z1ZENCcGN5QnViM1FnYzJWc1pXTjBaV1E2SUdSeWIzQWdlaTFwYm1SbGVDQW1JR0Z1YVcxaGRHVWdiM0JoWTJsMGVTQXRQaUJvYVdSbFhISmNiaUFnSUNBZ0lIWmhjaUJ6Wld4bFkzUmxaRWx1WkdWNElEMGdKSE5sYkdWamRHVmtSV3hsYldWdWRITXVhVzVrWlhoUFppZ2taV3hsYldWdWRDazdYSEpjYmlBZ0lDQWdJR2xtSUNoelpXeGxZM1JsWkVsdVpHVjRJRDA5UFNBdE1Ta2dlMXh5WEc0Z0lDQWdJQ0FnSUNSbGJHVnRaVzUwTG1OemN5aGNJbnBKYm1SbGVGd2lMQ0F0TVNrN1hISmNiaUFnSUNBZ0lDQWdKR1ZzWlcxbGJuUXVkbVZzYjJOcGRIa29YSEpjYmlBZ0lDQWdJQ0FnSUNCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUc5d1lXTnBkSGs2SURCY2NseHVJQ0FnSUNBZ0lDQWdJSDBzWEhKY2JpQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5MGNtRnVjMmwwYVc5dVJIVnlZWFJwYjI0c1hISmNiaUFnSUNBZ0lDQWdJQ0JjSW1WaGMyVkpiazkxZEVOMVltbGpYQ0lzWEhKY2JpQWdJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdKR1ZzWlcxbGJuUXVhR2xrWlNncE8xeHlYRzRnSUNBZ0lDQWdJQ0FnZlZ4eVhHNGdJQ0FnSUNBZ0lDazdYSEpjYmlBZ0lDQWdJSDBnWld4elpTQjdYSEpjYmlBZ0lDQWdJQ0FnTHk4Z1NXWWdZVzRnWld4bGJXVnVkQ0JwY3lCelpXeGxZM1JsWkRvZ2MyaHZkeUFtSUdKMWJYQWdlaTFwYm1SbGVDQW1JR0Z1YVcxaGRHVWdkRzhnY0c5emFYUnBiMjVjY2x4dUlDQWdJQ0FnSUNBa1pXeGxiV1Z1ZEM1emFHOTNLQ2s3WEhKY2JpQWdJQ0FnSUNBZ0pHVnNaVzFsYm5RdVkzTnpLRndpZWtsdVpHVjRYQ0lzSURBcE8xeHlYRzRnSUNBZ0lDQWdJSFpoY2lCdVpYZFFiM01nUFNCMGFHbHpMbDlwYm1SbGVGUnZXRmtvYzJWc1pXTjBaV1JKYm1SbGVDazdYSEpjYmlBZ0lDQWdJQ0FnSkdWc1pXMWxiblF1ZG1Wc2IyTnBkSGtvWEhKY2JpQWdJQ0FnSUNBZ0lDQjdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHOXdZV05wZEhrNklERXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lIUnZjRG9nYm1WM1VHOXpMbmtnS3lCY0luQjRYQ0lzWEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR3hsWm5RNklHNWxkMUJ2Y3k1NElDc2dYQ0p3ZUZ3aVhISmNiaUFnSUNBZ0lDQWdJQ0I5TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmRISmhibk5wZEdsdmJrUjFjbUYwYVc5dUxGeHlYRzRnSUNBZ0lDQWdJQ0FnWENKbFlYTmxTVzVQZFhSRGRXSnBZMXdpWEhKY2JpQWdJQ0FnSUNBZ0tUdGNjbHh1SUNBZ0lDQWdmVnh5WEc0Z0lDQWdmUzVpYVc1a0tIUm9hWE1wWEhKY2JpQWdLVHRjY2x4dWZUdGNjbHh1WEhKY2JsQnZjblJtYjJ4cGIwWnBiSFJsY2k1d2NtOTBiM1I1Y0dVdVgyRnVhVzFoZEdWSGNtbGtTR1ZwWjJoMElEMGdablZ1WTNScGIyNG9iblZ0Uld4bGJXVnVkSE1wSUh0Y2NseHVJQ0IwYUdsekxsOGtaM0pwWkM1MlpXeHZZMmwwZVNoY0luTjBiM0JjSWlrN1hISmNiaUFnZG1GeUlHTjFjbEp2ZDNNZ1BTQk5ZWFJvTG1ObGFXd29iblZ0Uld4bGJXVnVkSE1nTHlCMGFHbHpMbDlqYjJ4ektUdGNjbHh1SUNCMGFHbHpMbDhrWjNKcFpDNTJaV3h2WTJsMGVTaGNjbHh1SUNBZ0lIdGNjbHh1SUNBZ0lDQWdhR1ZwWjJoME9pQjBhR2x6TGw5cGJXRm5aVWhsYVdkb2RDQXFJR04xY2xKdmQzTWdLeUIwYUdsekxsOW5jbWxrVTNCaFkybHVaeUFxSUNoamRYSlNiM2R6SUMwZ01Ta2dLeUJjSW5CNFhDSmNjbHh1SUNBZ0lIMHNYSEpjYmlBZ0lDQjBhR2x6TGw5MGNtRnVjMmwwYVc5dVJIVnlZWFJwYjI1Y2NseHVJQ0FwTzF4eVhHNTlPMXh5WEc1Y2NseHVVRzl5ZEdadmJHbHZSbWxzZEdWeUxuQnliM1J2ZEhsd1pTNWZaMlYwVUhKdmFtVmpkSE5KYmtOaGRHVm5iM0o1SUQwZ1puVnVZM1JwYjI0b1kyRjBaV2R2Y25rcElIdGNjbHh1SUNCcFppQW9ZMkYwWldkdmNua2dQVDA5SUZ3aVlXeHNYQ0lwSUh0Y2NseHVJQ0FnSUhKbGRIVnliaUIwYUdsekxsOGtjSEp2YW1WamRITTdYSEpjYmlBZ2ZTQmxiSE5sSUh0Y2NseHVJQ0FnSUhKbGRIVnliaUIwYUdsekxsOGtZMkYwWldkdmNtbGxjMXRqWVhSbFoyOXllVjBnZkh3Z1cxMDdYSEpjYmlBZ2ZWeHlYRzU5TzF4eVhHNWNjbHh1VUc5eWRHWnZiR2x2Um1sc2RHVnlMbkJ5YjNSdmRIbHdaUzVmWTJGamFHVlFjbTlxWldOMGN5QTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJSFJvYVhNdVh5UndjbTlxWldOMGN5QTlJRnRkTzF4eVhHNGdJSFJvYVhNdVh5UmpZWFJsWjI5eWFXVnpJRDBnZTMwN1hISmNiaUFnZEdocGN5NWZKR2R5YVdRdVptbHVaQ2hjSWk1d2NtOXFaV04wWENJcExtVmhZMmdvWEhKY2JpQWdJQ0JtZFc1amRHbHZiaWhwYm1SbGVDd2daV3hsYldWdWRDa2dlMXh5WEc0Z0lDQWdJQ0IyWVhJZ0pHVnNaVzFsYm5RZ1BTQWtLR1ZzWlcxbGJuUXBPMXh5WEc0Z0lDQWdJQ0IwYUdsekxsOGtjSEp2YW1WamRITXVjSFZ6YUNna1pXeGxiV1Z1ZENrN1hISmNiaUFnSUNBZ0lIWmhjaUJqWVhSbFoyOXllVTVoYldWeklEMGdKR1ZzWlcxbGJuUXVaR0YwWVNoY0ltTmhkR1ZuYjNKcFpYTmNJaWt1YzNCc2FYUW9YQ0lzWENJcE8xeHlYRzRnSUNBZ0lDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJR05oZEdWbmIzSjVUbUZ0WlhNdWJHVnVaM1JvT3lCcElDczlJREVwSUh0Y2NseHVJQ0FnSUNBZ0lDQjJZWElnWTJGMFpXZHZjbmtnUFNBa0xuUnlhVzBvWTJGMFpXZHZjbmxPWVcxbGMxdHBYU2t1ZEc5TWIzZGxja05oYzJVb0tUdGNjbHh1SUNBZ0lDQWdJQ0JwWmlBb0lYUm9hWE11WHlSallYUmxaMjl5YVdWelcyTmhkR1ZuYjNKNVhTa2dlMXh5WEc0Z0lDQWdJQ0FnSUNBZ2RHaHBjeTVmSkdOaGRHVm5iM0pwWlhOYlkyRjBaV2R2Y25sZElEMGdXeVJsYkdWdFpXNTBYVHRjY2x4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4eVhHNGdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZkpHTmhkR1ZuYjNKcFpYTmJZMkYwWldkdmNubGRMbkIxYzJnb0pHVnNaVzFsYm5RcE8xeHlYRzRnSUNBZ0lDQWdJSDFjY2x4dUlDQWdJQ0FnZlZ4eVhHNGdJQ0FnZlM1aWFXNWtLSFJvYVhNcFhISmNiaUFnS1R0Y2NseHVmVHRjY2x4dVhISmNiaTh2SUZCdmNuUm1iMnhwYjBacGJIUmxjaTV3Y205MGIzUjVjR1V1WDJOaGJHTjFiR0YwWlVkeWFXUWdQU0JtZFc1amRHbHZiaUFvS1NCN1hISmNiaTh2SUNBZ0lDQjJZWElnWjNKcFpGZHBaSFJvSUQwZ2RHaHBjeTVmSkdkeWFXUXVhVzV1WlhKWGFXUjBhQ2dwTzF4eVhHNHZMeUFnSUNBZ2RHaHBjeTVmWTI5c2N5QTlJRTFoZEdndVpteHZiM0lvS0dkeWFXUlhhV1IwYUNBcklIUm9hWE11WDJkeWFXUlRjR0ZqYVc1bktTQXZYSEpjYmk4dklDQWdJQ0FnSUNBZ0tIUm9hWE11WDIxcGJrbHRZV2RsVjJsa2RHZ2dLeUIwYUdsekxsOW5jbWxrVTNCaFkybHVaeWtwTzF4eVhHNHZMeUFnSUNBZ2RHaHBjeTVmY205M2N5QTlJRTFoZEdndVkyVnBiQ2gwYUdsekxsOGtjSEp2YW1WamRITXViR1Z1WjNSb0lDOGdkR2hwY3k1ZlkyOXNjeWs3WEhKY2JpOHZJQ0FnSUNCMGFHbHpMbDlwYldGblpWZHBaSFJvSUQwZ0tHZHlhV1JYYVdSMGFDQXRJQ2dvZEdocGN5NWZZMjlzY3lBdElERXBJQ29nZEdocGN5NWZaM0pwWkZOd1lXTnBibWNwS1NBdlhISmNiaTh2SUNBZ0lDQWdJQ0FnZEdocGN5NWZZMjlzY3p0Y2NseHVMeThnSUNBZ0lIUm9hWE11WDJsdFlXZGxTR1ZwWjJoMElEMGdkR2hwY3k1ZmFXMWhaMlZYYVdSMGFDQXFJQ2d4SUM4Z2RHaHBjeTVmWVhOd1pXTjBVbUYwYVc4cE8xeHlYRzR2THlCOU8xeHlYRzVjY2x4dVVHOXlkR1p2YkdsdlJtbHNkR1Z5TG5CeWIzUnZkSGx3WlM1ZlkyRnNZM1ZzWVhSbFIzSnBaQ0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUhaaGNpQm5jbWxrVjJsa2RHZ2dQU0IwYUdsekxsOGtaM0pwWkM1cGJtNWxjbGRwWkhSb0tDazdYSEpjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQjBhR2x6TGw5aWNtVmhhM0J2YVc1MGN5NXNaVzVuZEdnN0lHa2dLejBnTVNrZ2UxeHlYRzRnSUNBZ2FXWWdLR2R5YVdSWGFXUjBhQ0E4UFNCMGFHbHpMbDlpY21WaGEzQnZhVzUwYzF0cFhTNTNhV1IwYUNrZ2UxeHlYRzRnSUNBZ0lDQjBhR2x6TGw5amIyeHpJRDBnZEdocGN5NWZZbkpsWVd0d2IybHVkSE5iYVYwdVkyOXNjenRjY2x4dUlDQWdJQ0FnZEdocGN5NWZaM0pwWkZOd1lXTnBibWNnUFNCMGFHbHpMbDlpY21WaGEzQnZhVzUwYzF0cFhTNXpjR0ZqYVc1bk8xeHlYRzRnSUNBZ0lDQmljbVZoYXp0Y2NseHVJQ0FnSUgxY2NseHVJQ0I5WEhKY2JpQWdkR2hwY3k1ZmNtOTNjeUE5SUUxaGRHZ3VZMlZwYkNoMGFHbHpMbDhrY0hKdmFtVmpkSE11YkdWdVozUm9JQzhnZEdocGN5NWZZMjlzY3lrN1hISmNiaUFnZEdocGN5NWZhVzFoWjJWWGFXUjBhQ0E5SUNobmNtbGtWMmxrZEdnZ0xTQW9kR2hwY3k1ZlkyOXNjeUF0SURFcElDb2dkR2hwY3k1ZlozSnBaRk53WVdOcGJtY3BJQzhnZEdocGN5NWZZMjlzY3p0Y2NseHVJQ0IwYUdsekxsOXBiV0ZuWlVobGFXZG9kQ0E5SUhSb2FYTXVYMmx0WVdkbFYybGtkR2dnS2lBb01TQXZJSFJvYVhNdVgyRnpjR1ZqZEZKaGRHbHZLVHRjY2x4dWZUdGNjbHh1WEhKY2JsQnZjblJtYjJ4cGIwWnBiSFJsY2k1d2NtOTBiM1I1Y0dVdVgyTnlaV0YwWlVkeWFXUWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0IwYUdsekxsOWpZV3hqZFd4aGRHVkhjbWxrS0NrN1hISmNibHh5WEc0Z0lIUm9hWE11WHlSbmNtbGtMbU56Y3loY0luQnZjMmwwYVc5dVhDSXNJRndpY21Wc1lYUnBkbVZjSWlrN1hISmNiaUFnZEdocGN5NWZKR2R5YVdRdVkzTnpLSHRjY2x4dUlDQWdJR2hsYVdkb2REb2dkR2hwY3k1ZmFXMWhaMlZJWldsbmFIUWdLaUIwYUdsekxsOXliM2R6SUNzZ2RHaHBjeTVmWjNKcFpGTndZV05wYm1jZ0tpQW9kR2hwY3k1ZmNtOTNjeUF0SURFcElDc2dYQ0p3ZUZ3aVhISmNiaUFnZlNrN1hISmNibHh5WEc0Z0lIUm9hWE11WHlSd2NtOXFaV04wY3k1bWIzSkZZV05vS0Z4eVhHNGdJQ0FnWm5WdVkzUnBiMjRvSkdWc1pXMWxiblFzSUdsdVpHVjRLU0I3WEhKY2JpQWdJQ0FnSUhaaGNpQndiM01nUFNCMGFHbHpMbDlwYm1SbGVGUnZXRmtvYVc1a1pYZ3BPMXh5WEc0Z0lDQWdJQ0FrWld4bGJXVnVkQzVqYzNNb2UxeHlYRzRnSUNBZ0lDQWdJSEJ2YzJsMGFXOXVPaUJjSW1GaWMyOXNkWFJsWENJc1hISmNiaUFnSUNBZ0lDQWdkRzl3T2lCd2IzTXVlU0FySUZ3aWNIaGNJaXhjY2x4dUlDQWdJQ0FnSUNCc1pXWjBPaUJ3YjNNdWVDQXJJRndpY0hoY0lpeGNjbHh1SUNBZ0lDQWdJQ0IzYVdSMGFEb2dkR2hwY3k1ZmFXMWhaMlZYYVdSMGFDQXJJRndpY0hoY0lpeGNjbHh1SUNBZ0lDQWdJQ0JvWldsbmFIUTZJSFJvYVhNdVgybHRZV2RsU0dWcFoyaDBJQ3NnWENKd2VGd2lYSEpjYmlBZ0lDQWdJSDBwTzF4eVhHNGdJQ0FnZlM1aWFXNWtLSFJvYVhNcFhISmNiaUFnS1R0Y2NseHVmVHRjY2x4dVhISmNibEJ2Y25SbWIyeHBiMFpwYkhSbGNpNXdjbTkwYjNSNWNHVXVYMjl1VG1GMlEyeHBZMnNnUFNCbWRXNWpkR2x2YmlobEtTQjdYSEpjYmlBZ1pTNXdjbVYyWlc1MFJHVm1ZWFZzZENncE8xeHlYRzRnSUhaaGNpQWtkR0Z5WjJWMElEMGdKQ2hsTG5SaGNtZGxkQ2s3WEhKY2JpQWdhV1lnS0NSMFlYSm5aWFF1YVhNb2RHaHBjeTVmSkdGamRHbDJaVTVoZGtsMFpXMHBLU0J5WlhSMWNtNDdYSEpjYmlBZ2FXWWdLSFJvYVhNdVh5UmhZM1JwZG1WT1lYWkpkR1Z0TG14bGJtZDBhQ2tnZEdocGN5NWZKR0ZqZEdsMlpVNWhka2wwWlcwdWNtVnRiM1psUTJ4aGMzTW9YQ0poWTNScGRtVmNJaWs3WEhKY2JpQWdKSFJoY21kbGRDNWhaR1JEYkdGemN5aGNJbUZqZEdsMlpWd2lLVHRjY2x4dUlDQjBhR2x6TGw4a1lXTjBhWFpsVG1GMlNYUmxiU0E5SUNSMFlYSm5aWFE3WEhKY2JpQWdkbUZ5SUdOaGRHVm5iM0o1SUQwZ0pIUmhjbWRsZEM1a1lYUmhLRndpWTJGMFpXZHZjbmxjSWlrdWRHOU1iM2RsY2tOaGMyVW9LVHRjY2x4dVhISmNiaUFnYUdsemRHOXllUzV3ZFhOb1UzUmhkR1VvWEhKY2JpQWdJQ0I3WEhKY2JpQWdJQ0FnSUhWeWJEb2dYQ0l2ZDI5eWF5NW9kRzFzWENJc1hISmNiaUFnSUNBZ0lIRjFaWEo1T2lCN0lHTmhkR1ZuYjNKNU9pQmpZWFJsWjI5eWVTQjlYSEpjYmlBZ0lDQjlMRnh5WEc0Z0lDQWdiblZzYkN4Y2NseHVJQ0FnSUZ3aUwzZHZjbXN1YUhSdGJEOWpZWFJsWjI5eWVUMWNJaUFySUdOaGRHVm5iM0o1WEhKY2JpQWdLVHRjY2x4dVhISmNiaUFnZEdocGN5NWZabWxzZEdWeVVISnZhbVZqZEhNb1kyRjBaV2R2Y25rcE8xeHlYRzU5TzF4eVhHNWNjbHh1VUc5eWRHWnZiR2x2Um1sc2RHVnlMbkJ5YjNSdmRIbHdaUzVmYjI1UWNtOXFaV04wUTJ4cFkyc2dQU0JtZFc1amRHbHZiaWhsS1NCN1hISmNiaUFnWlM1d2NtVjJaVzUwUkdWbVlYVnNkQ2dwTzF4eVhHNGdJSFpoY2lBa2RHRnlaMlYwSUQwZ0pDaGxMbU4xY25KbGJuUlVZWEpuWlhRcE8xeHlYRzRnSUhaaGNpQndjbTlxWldOMFRtRnRaU0E5SUNSMFlYSm5aWFF1WkdGMFlTaGNJbTVoYldWY0lpazdYSEpjYmlBZ2RtRnlJSFZ5YkNBOUlGd2lMM0J5YjJwbFkzUnpMMXdpSUNzZ2NISnZhbVZqZEU1aGJXVWdLeUJjSWk1b2RHMXNYQ0k3WEhKY2JpQWdkR2hwY3k1ZmJHOWhaR1Z5TG14dllXUlFZV2RsS0hWeWJDd2dlMzBzSUhSeWRXVXBPMXh5WEc1OU8xeHlYRzVjY2x4dVVHOXlkR1p2YkdsdlJtbHNkR1Z5TG5CeWIzUnZkSGx3WlM1ZmFXNWtaWGhVYjFoWklEMGdablZ1WTNScGIyNG9hVzVrWlhncElIdGNjbHh1SUNCMllYSWdjaUE5SUUxaGRHZ3VabXh2YjNJb2FXNWtaWGdnTHlCMGFHbHpMbDlqYjJ4ektUdGNjbHh1SUNCMllYSWdZeUE5SUdsdVpHVjRJQ1VnZEdocGN5NWZZMjlzY3p0Y2NseHVJQ0J5WlhSMWNtNGdlMXh5WEc0Z0lDQWdlRG9nWXlBcUlIUm9hWE11WDJsdFlXZGxWMmxrZEdnZ0t5QmpJQ29nZEdocGN5NWZaM0pwWkZOd1lXTnBibWNzWEhKY2JpQWdJQ0I1T2lCeUlDb2dkR2hwY3k1ZmFXMWhaMlZJWldsbmFIUWdLeUJ5SUNvZ2RHaHBjeTVmWjNKcFpGTndZV05wYm1kY2NseHVJQ0I5TzF4eVhHNTlPMXh5WEc0aUxDSnRiMlIxYkdVdVpYaHdiM0owY3lBOUlGTnNhV1JsYzJodmQwMXZaR0ZzTzF4eVhHNWNjbHh1ZG1GeUlFdEZXVjlEVDBSRlV5QTlJSHRjY2x4dUlDQk1SVVpVWDBGU1VrOVhPaUF6Tnl4Y2NseHVJQ0JTU1VkSVZGOUJVbEpQVnpvZ016a3NYSEpjYmlBZ1JWTkRRVkJGT2lBeU4xeHlYRzU5TzF4eVhHNWNjbHh1Wm5WdVkzUnBiMjRnVTJ4cFpHVnphRzkzVFc5a1lXd29KR052Ym5SaGFXNWxjaXdnYzJ4cFpHVnphRzkzS1NCN1hISmNiaUFnZEdocGN5NWZjMnhwWkdWemFHOTNJRDBnYzJ4cFpHVnphRzkzTzF4eVhHNWNjbHh1SUNCMGFHbHpMbDhrYlc5a1lXd2dQU0FrWTI5dWRHRnBibVZ5TG1acGJtUW9YQ0l1YzJ4cFpHVnphRzkzTFcxdlpHRnNYQ0lwTzF4eVhHNGdJSFJvYVhNdVh5UnZkbVZ5YkdGNUlEMGdkR2hwY3k1ZkpHMXZaR0ZzTG1acGJtUW9YQ0l1Ylc5a1lXd3RiM1psY214aGVWd2lLVHRjY2x4dUlDQjBhR2x6TGw4a1kyOXVkR1Z1ZENBOUlIUm9hWE11WHlSdGIyUmhiQzVtYVc1a0tGd2lMbTF2WkdGc0xXTnZiblJsYm5SelhDSXBPMXh5WEc0Z0lIUm9hWE11WHlSallYQjBhVzl1SUQwZ2RHaHBjeTVmSkcxdlpHRnNMbVpwYm1Rb1hDSXViVzlrWVd3dFkyRndkR2x2Ymx3aUtUdGNjbHh1SUNCMGFHbHpMbDhrYVcxaFoyVkRiMjUwWVdsdVpYSWdQU0IwYUdsekxsOGtiVzlrWVd3dVptbHVaQ2hjSWk1dGIyUmhiQzFwYldGblpWd2lLVHRjY2x4dUlDQjBhR2x6TGw4a2FXMWhaMlZNWldaMElEMGdkR2hwY3k1ZkpHMXZaR0ZzTG1acGJtUW9YQ0l1YVcxaFoyVXRZV1IyWVc1alpTMXNaV1owWENJcE8xeHlYRzRnSUhSb2FYTXVYeVJwYldGblpWSnBaMmgwSUQwZ2RHaHBjeTVmSkcxdlpHRnNMbVpwYm1Rb1hDSXVhVzFoWjJVdFlXUjJZVzVqWlMxeWFXZG9kRndpS1R0Y2NseHVYSEpjYmlBZ2RHaHBjeTVmYVc1a1pYZ2dQU0F3T3lBdkx5QkpibVJsZUNCdlppQnpaV3hsWTNSbFpDQnBiV0ZuWlZ4eVhHNGdJSFJvYVhNdVgybHpUM0JsYmlBOUlHWmhiSE5sTzF4eVhHNWNjbHh1SUNCMGFHbHpMbDhrYVcxaFoyVk1aV1owTG05dUtGd2lZMnhwWTJ0Y0lpd2dkR2hwY3k1aFpIWmhibU5sVEdWbWRDNWlhVzVrS0hSb2FYTXBLVHRjY2x4dUlDQjBhR2x6TGw4a2FXMWhaMlZTYVdkb2RDNXZiaWhjSW1Oc2FXTnJYQ0lzSUhSb2FYTXVZV1IyWVc1alpWSnBaMmgwTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzRnSUNRb1pHOWpkVzFsYm5RcExtOXVLRndpYTJWNVpHOTNibHdpTENCMGFHbHpMbDl2Ymt0bGVVUnZkMjR1WW1sdVpDaDBhR2x6S1NrN1hISmNibHh5WEc0Z0lDOHZJRWRwZG1VZ2FsRjFaWEo1SUdOdmJuUnliMndnYjNabGNpQnphRzkzYVc1bkwyaHBaR2x1WjF4eVhHNGdJSFJvYVhNdVh5UnRiMlJoYkM1amMzTW9YQ0prYVhOd2JHRjVYQ0lzSUZ3aVlteHZZMnRjSWlrN1hISmNiaUFnZEdocGN5NWZKRzF2WkdGc0xtaHBaR1VvS1R0Y2NseHVYSEpjYmlBZ0x5OGdSWFpsYm5SelhISmNiaUFnSkNoM2FXNWtiM2NwTG05dUtGd2ljbVZ6YVhwbFhDSXNJSFJvYVhNdVgyOXVVbVZ6YVhwbExtSnBibVFvZEdocGN5a3BPMXh5WEc0Z0lIUm9hWE11WHlSdmRtVnliR0Y1TG05dUtGd2lZMnhwWTJ0Y0lpd2dkR2hwY3k1amJHOXpaUzVpYVc1a0tIUm9hWE1wS1R0Y2NseHVJQ0IwYUdsekxsOGtiVzlrWVd3dVptbHVaQ2hjSWk1dGIyUmhiQzFqYkc5elpWd2lLUzV2YmloY0ltTnNhV05yWENJc0lIUm9hWE11WTJ4dmMyVXVZbWx1WkNoMGFHbHpLU2s3WEhKY2JseHlYRzRnSUhSb2FYTXVYM1Z3WkdGMFpVTnZiblJ5YjJ4ektDazdYSEpjYmx4eVhHNGdJQzh2SUZOcGVtVWdiMllnWm05dWRHRjNaWE52YldVZ2FXTnZibk1nYm1WbFpITWdZU0J6YkdsbmFIUWdaR1ZzWVhrZ0tIVnVkR2xzSUhOMFlXTnJJR2x6SUdOc1pXRnlLU0JtYjNKY2NseHVJQ0F2THlCemIyMWxJSEpsWVhOdmJseHlYRzRnSUhObGRGUnBiV1Z2ZFhRb1hISmNiaUFnSUNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNBZ0lDQWdkR2hwY3k1ZmIyNVNaWE5wZW1Vb0tUdGNjbHh1SUNBZ0lIMHVZbWx1WkNoMGFHbHpLU3hjY2x4dUlDQWdJREJjY2x4dUlDQXBPMXh5WEc1OVhISmNibHh5WEc1VGJHbGtaWE5vYjNkTmIyUmhiQzV3Y205MGIzUjVjR1V1WVdSMllXNWpaVXhsWm5RZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQjBhR2x6TG5Ob2IzZEpiV0ZuWlVGMEtIUm9hWE11WDJsdVpHVjRJQzBnTVNrN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2ROYjJSaGJDNXdjbTkwYjNSNWNHVXVZV1IyWVc1alpWSnBaMmgwSUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2RHaHBjeTV6YUc5M1NXMWhaMlZCZENoMGFHbHpMbDlwYm1SbGVDQXJJREVwTzF4eVhHNTlPMXh5WEc1Y2NseHVVMnhwWkdWemFHOTNUVzlrWVd3dWNISnZkRzkwZVhCbExuTm9iM2RKYldGblpVRjBJRDBnWm5WdVkzUnBiMjRvYVc1a1pYZ3BJSHRjY2x4dUlDQnBibVJsZUNBOUlFMWhkR2d1YldGNEtHbHVaR1Y0TENBd0tUdGNjbHh1SUNCcGJtUmxlQ0E5SUUxaGRHZ3ViV2x1S0dsdVpHVjRMQ0IwYUdsekxsOXpiR2xrWlhOb2IzY3VaMlYwVG5WdFNXMWhaMlZ6S0NrZ0xTQXhLVHRjY2x4dUlDQjBhR2x6TGw5cGJtUmxlQ0E5SUdsdVpHVjRPMXh5WEc0Z0lIWmhjaUFrYVcxbklEMGdkR2hwY3k1ZmMyeHBaR1Z6YUc5M0xtZGxkRWRoYkd4bGNubEpiV0ZuWlNoMGFHbHpMbDlwYm1SbGVDazdYSEpjYmlBZ2RtRnlJR05oY0hScGIyNGdQU0IwYUdsekxsOXpiR2xrWlhOb2IzY3VaMlYwUTJGd2RHbHZiaWgwYUdsekxsOXBibVJsZUNrN1hISmNibHh5WEc0Z0lIUm9hWE11WHlScGJXRm5aVU52Ym5SaGFXNWxjaTVsYlhCMGVTZ3BPMXh5WEc0Z0lDUW9YQ0k4YVcxblBsd2lMQ0I3SUhOeVl6b2dKR2x0Wnk1aGRIUnlLRndpYzNKalhDSXBJSDBwTG1Gd2NHVnVaRlJ2S0hSb2FYTXVYeVJwYldGblpVTnZiblJoYVc1bGNpazdYSEpjYmx4eVhHNGdJSFJvYVhNdVh5UmpZWEIwYVc5dUxtVnRjSFI1S0NrN1hISmNiaUFnYVdZZ0tHTmhjSFJwYjI0cElIdGNjbHh1SUNBZ0lDUW9YQ0k4YzNCaGJqNWNJaWxjY2x4dUlDQWdJQ0FnTG1Ga1pFTnNZWE56S0Z3aVptbG5kWEpsTFc1MWJXSmxjbHdpS1Z4eVhHNGdJQ0FnSUNBdWRHVjRkQ2hjSWtacFp5NGdYQ0lnS3lBb2RHaHBjeTVmYVc1a1pYZ2dLeUF4S1NBcklGd2lPaUJjSWlsY2NseHVJQ0FnSUNBZ0xtRndjR1Z1WkZSdktIUm9hWE11WHlSallYQjBhVzl1S1R0Y2NseHVJQ0FnSUNRb1hDSThjM0JoYmo1Y0lpbGNjbHh1SUNBZ0lDQWdMbUZrWkVOc1lYTnpLRndpWTJGd2RHbHZiaTEwWlhoMFhDSXBYSEpjYmlBZ0lDQWdJQzUwWlhoMEtHTmhjSFJwYjI0cFhISmNiaUFnSUNBZ0lDNWhjSEJsYm1SVWJ5aDBhR2x6TGw4a1kyRndkR2x2YmlrN1hISmNiaUFnZlZ4eVhHNWNjbHh1SUNCMGFHbHpMbDl2YmxKbGMybDZaU2dwTzF4eVhHNGdJSFJvYVhNdVgzVndaR0YwWlVOdmJuUnliMnh6S0NrN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2ROYjJSaGJDNXdjbTkwYjNSNWNHVXViM0JsYmlBOUlHWjFibU4wYVc5dUtHbHVaR1Y0S1NCN1hISmNiaUFnYVc1a1pYZ2dQU0JwYm1SbGVDQjhmQ0F3TzF4eVhHNGdJSFJvYVhNdVh5UnRiMlJoYkM1emFHOTNLQ2s3WEhKY2JpQWdkR2hwY3k1emFHOTNTVzFoWjJWQmRDaHBibVJsZUNrN1hISmNiaUFnZEdocGN5NWZhWE5QY0dWdUlEMGdkSEoxWlR0Y2NseHVmVHRjY2x4dVhISmNibE5zYVdSbGMyaHZkMDF2WkdGc0xuQnliM1J2ZEhsd1pTNWpiRzl6WlNBOUlHWjFibU4wYVc5dUtDa2dlMXh5WEc0Z0lIUm9hWE11WHlSdGIyUmhiQzVvYVdSbEtDazdYSEpjYmlBZ2RHaHBjeTVmYVhOUGNHVnVJRDBnWm1Gc2MyVTdYSEpjYm4wN1hISmNibHh5WEc1VGJHbGtaWE5vYjNkTmIyUmhiQzV3Y205MGIzUjVjR1V1WDI5dVMyVjVSRzkzYmlBOUlHWjFibU4wYVc5dUtHVXBJSHRjY2x4dUlDQnBaaUFvSVhSb2FYTXVYMmx6VDNCbGJpa2djbVYwZFhKdU8xeHlYRzRnSUdsbUlDaGxMbmRvYVdOb0lEMDlQU0JMUlZsZlEwOUVSVk11VEVWR1ZGOUJVbEpQVnlrZ2UxeHlYRzRnSUNBZ2RHaHBjeTVoWkhaaGJtTmxUR1ZtZENncE8xeHlYRzRnSUgwZ1pXeHpaU0JwWmlBb1pTNTNhR2xqYUNBOVBUMGdTMFZaWDBOUFJFVlRMbEpKUjBoVVgwRlNVazlYS1NCN1hISmNiaUFnSUNCMGFHbHpMbUZrZG1GdVkyVlNhV2RvZENncE8xeHlYRzRnSUgwZ1pXeHpaU0JwWmlBb1pTNTNhR2xqYUNBOVBUMGdTMFZaWDBOUFJFVlRMa1ZUUTBGUVJTa2dlMXh5WEc0Z0lDQWdkR2hwY3k1amJHOXpaU2dwTzF4eVhHNGdJSDFjY2x4dWZUdGNjbHh1WEhKY2JsTnNhV1JsYzJodmQwMXZaR0ZzTG5CeWIzUnZkSGx3WlM1ZmRYQmtZWFJsUTI5dWRISnZiSE1nUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNBdkx5QlNaUzFsYm1GaWJHVmNjbHh1SUNCMGFHbHpMbDhrYVcxaFoyVlNhV2RvZEM1eVpXMXZkbVZEYkdGemN5aGNJbVJwYzJGaWJHVmtYQ0lwTzF4eVhHNGdJSFJvYVhNdVh5UnBiV0ZuWlV4bFpuUXVjbVZ0YjNabFEyeGhjM01vWENKa2FYTmhZbXhsWkZ3aUtUdGNjbHh1WEhKY2JpQWdMeThnUkdsellXSnNaU0JwWmlCM1pTZDJaU0J5WldGamFHVmtJSFJvWlNCMGFHVWdiV0Y0SUc5eUlHMXBiaUJzYVcxcGRGeHlYRzRnSUdsbUlDaDBhR2x6TGw5cGJtUmxlQ0ErUFNCMGFHbHpMbDl6Ykdsa1pYTm9iM2N1WjJWMFRuVnRTVzFoWjJWektDa2dMU0F4S1NCN1hISmNiaUFnSUNCMGFHbHpMbDhrYVcxaFoyVlNhV2RvZEM1aFpHUkRiR0Z6Y3loY0ltUnBjMkZpYkdWa1hDSXBPMXh5WEc0Z0lIMGdaV3h6WlNCcFppQW9kR2hwY3k1ZmFXNWtaWGdnUEQwZ01Da2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHbHRZV2RsVEdWbWRDNWhaR1JEYkdGemN5aGNJbVJwYzJGaWJHVmtYQ0lwTzF4eVhHNGdJSDFjY2x4dWZUdGNjbHh1WEhKY2JsTnNhV1JsYzJodmQwMXZaR0ZzTG5CeWIzUnZkSGx3WlM1ZmIyNVNaWE5wZW1VZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQjJZWElnSkdsdFlXZGxJRDBnZEdocGN5NWZKR2x0WVdkbFEyOXVkR0ZwYm1WeUxtWnBibVFvWENKcGJXZGNJaWs3WEhKY2JseHlYRzRnSUM4dklGSmxjMlYwSUhSb1pTQmpiMjUwWlc1MEozTWdkMmxrZEdoY2NseHVJQ0IwYUdsekxsOGtZMjl1ZEdWdWRDNTNhV1IwYUNoY0lsd2lLVHRjY2x4dVhISmNiaUFnTHk4Z1JtbHVaQ0IwYUdVZ2MybDZaU0J2WmlCMGFHVWdZMjl0Y0c5dVpXNTBjeUIwYUdGMElHNWxaV1FnZEc4Z1ltVWdaR2x6Y0d4aGVXVmtJR2x1SUdGa1pHbDBhVzl1SUhSdlhISmNiaUFnTHk4Z2RHaGxJR2x0WVdkbFhISmNiaUFnZG1GeUlHTnZiblJ5YjJ4elYybGtkR2dnUFNCMGFHbHpMbDhrYVcxaFoyVk1aV1owTG05MWRHVnlWMmxrZEdnb2RISjFaU2tnS3lCMGFHbHpMbDhrYVcxaFoyVlNhV2RvZEM1dmRYUmxjbGRwWkhSb0tIUnlkV1VwTzF4eVhHNGdJQzh2SUVoaFkyc2dabTl5SUc1dmR5QXRJR0oxWkdkbGRDQm1iM0lnTW5nZ2RHaGxJR05oY0hScGIyNGdhR1ZwWjJoMExseHlYRzRnSUhaaGNpQmpZWEIwYVc5dVNHVnBaMmgwSUQwZ01pQXFJSFJvYVhNdVh5UmpZWEIwYVc5dUxtOTFkR1Z5U0dWcFoyaDBLSFJ5ZFdVcE8xeHlYRzRnSUM4dklIWmhjaUJwYldGblpWQmhaR1JwYm1jZ1BTQWthVzFoWjJVdWFXNXVaWEpYYVdSMGFDZ3BPMXh5WEc1Y2NseHVJQ0F2THlCRFlXeGpkV3hoZEdVZ2RHaGxJR0YyWVdsc1lXSnNaU0JoY21WaElHWnZjaUIwYUdVZ2JXOWtZV3hjY2x4dUlDQjJZWElnYlhjZ1BTQjBhR2x6TGw4a2JXOWtZV3d1ZDJsa2RHZ29LU0F0SUdOdmJuUnliMnh6VjJsa2RHZzdYSEpjYmlBZ2RtRnlJRzFvSUQwZ2RHaHBjeTVmSkcxdlpHRnNMbWhsYVdkb2RDZ3BJQzBnWTJGd2RHbHZia2hsYVdkb2REdGNjbHh1WEhKY2JpQWdMeThnUm1sMElIUm9aU0JwYldGblpTQjBieUIwYUdVZ2NtVnRZV2x1YVc1bklITmpjbVZsYmlCeVpXRnNJR1Z6ZEdGMFpWeHlYRzRnSUhaaGNpQnpaWFJUYVhwbElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdJQ0IyWVhJZ2FYY2dQU0FrYVcxaFoyVXVjSEp2Y0NoY0ltNWhkSFZ5WVd4WGFXUjBhRndpS1R0Y2NseHVJQ0FnSUhaaGNpQnBhQ0E5SUNScGJXRm5aUzV3Y205d0tGd2libUYwZFhKaGJFaGxhV2RvZEZ3aUtUdGNjbHh1SUNBZ0lIWmhjaUJ6ZHlBOUlHbDNJQzhnYlhjN1hISmNiaUFnSUNCMllYSWdjMmdnUFNCcGFDQXZJRzFvTzF4eVhHNGdJQ0FnZG1GeUlITWdQU0JOWVhSb0xtMWhlQ2h6ZHl3Z2MyZ3BPMXh5WEc1Y2NseHVJQ0FnSUM4dklGTmxkQ0IzYVdSMGFDOW9aV2xuYUhRZ2RYTnBibWNnUTFOVElHbHVJRzl5WkdWeUlIUnZJSEpsYzNCbFkzUWdZbTk0TFhOcGVtbHVaMXh5WEc0Z0lDQWdhV1lnS0hNZ1BpQXhLU0I3WEhKY2JpQWdJQ0FnSUNScGJXRm5aUzVqYzNNb1hDSjNhV1IwYUZ3aUxDQnBkeUF2SUhNZ0t5QmNJbkI0WENJcE8xeHlYRzRnSUNBZ0lDQWthVzFoWjJVdVkzTnpLRndpYUdWcFoyaDBYQ0lzSUdsb0lDOGdjeUFySUZ3aWNIaGNJaWs3WEhKY2JpQWdJQ0I5SUdWc2MyVWdlMXh5WEc0Z0lDQWdJQ0FrYVcxaFoyVXVZM056S0Z3aWQybGtkR2hjSWl3Z2FYY2dLeUJjSW5CNFhDSXBPMXh5WEc0Z0lDQWdJQ0FrYVcxaFoyVXVZM056S0Z3aWFHVnBaMmgwWENJc0lHbG9JQ3NnWENKd2VGd2lLVHRjY2x4dUlDQWdJSDFjY2x4dVhISmNiaUFnSUNCMGFHbHpMbDhrYVcxaFoyVlNhV2RvZEM1amMzTW9YQ0owYjNCY0lpd2dKR2x0WVdkbExtOTFkR1Z5U0dWcFoyaDBLQ2tnTHlBeUlDc2dYQ0p3ZUZ3aUtUdGNjbHh1SUNBZ0lIUm9hWE11WHlScGJXRm5aVXhsWm5RdVkzTnpLRndpZEc5d1hDSXNJQ1JwYldGblpTNXZkWFJsY2tobGFXZG9kQ2dwSUM4Z01pQXJJRndpY0hoY0lpazdYSEpjYmx4eVhHNGdJQ0FnTHk4Z1UyVjBJSFJvWlNCamIyNTBaVzUwSUhkeVlYQndaWElnZEc4Z1ltVWdkR2hsSUhkcFpIUm9JRzltSUhSb1pTQnBiV0ZuWlM0Z1ZHaHBjeUIzYVd4c0lHdGxaWEJjY2x4dUlDQWdJQzh2SUhSb1pTQmpZWEIwYVc5dUlHWnliMjBnWlhod1lXNWthVzVuSUdKbGVXOXVaQ0IwYUdVZ2FXMWhaMlV1WEhKY2JpQWdJQ0IwYUdsekxsOGtZMjl1ZEdWdWRDNTNhV1IwYUNna2FXMWhaMlV1YjNWMFpYSlhhV1IwYUNoMGNuVmxLU2s3WEhKY2JpQWdmUzVpYVc1a0tIUm9hWE1wTzF4eVhHNWNjbHh1SUNCcFppQW9KR2x0WVdkbExuQnliM0FvWENKamIyMXdiR1YwWlZ3aUtTa2djMlYwVTJsNlpTZ3BPMXh5WEc0Z0lHVnNjMlVnSkdsdFlXZGxMbTl1WlNoY0lteHZZV1JjSWl3Z2MyVjBVMmw2WlNrN1hISmNibjA3WEhKY2JpSXNJblpoY2lCVGJHbGtaWE5vYjNkTmIyUmhiQ0E5SUhKbGNYVnBjbVVvWENJdUwzTnNhV1JsYzJodmR5MXRiMlJoYkM1cWMxd2lLVHRjY2x4dWRtRnlJRlJvZFcxaWJtRnBiRk5zYVdSbGNpQTlJSEpsY1hWcGNtVW9YQ0l1TDNSb2RXMWlibUZwYkMxemJHbGtaWEl1YW5OY0lpazdYSEpjYmx4eVhHNXRiMlIxYkdVdVpYaHdiM0owY3lBOUlIdGNjbHh1SUNCcGJtbDBPaUJtZFc1amRHbHZiaWgwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRwSUh0Y2NseHVJQ0FnSUhSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlBOUlIUnlZVzV6YVhScGIyNUVkWEpoZEdsdmJpQWhQVDBnZFc1a1pXWnBibVZrSUQ4Z2RISmhibk5wZEdsdmJrUjFjbUYwYVc5dUlEb2dOREF3TzF4eVhHNGdJQ0FnZEdocGN5NWZjMnhwWkdWemFHOTNjeUE5SUZ0ZE8xeHlYRzRnSUNBZ0pDaGNJaTV6Ykdsa1pYTm9iM2RjSWlrdVpXRmphQ2hjY2x4dUlDQWdJQ0FnWm5WdVkzUnBiMjRvYVc1a1pYZ3NJR1ZzWlcxbGJuUXBJSHRjY2x4dUlDQWdJQ0FnSUNCMllYSWdjMnhwWkdWemFHOTNJRDBnYm1WM0lGTnNhV1JsYzJodmR5Z2tLR1ZzWlcxbGJuUXBMQ0IwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRwTzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WDNOc2FXUmxjMmh2ZDNNdWNIVnphQ2h6Ykdsa1pYTm9iM2NwTzF4eVhHNGdJQ0FnSUNCOUxtSnBibVFvZEdocGN5bGNjbHh1SUNBZ0lDazdYSEpjYmlBZ2ZWeHlYRzU5TzF4eVhHNWNjbHh1Wm5WdVkzUnBiMjRnVTJ4cFpHVnphRzkzS0NSamIyNTBZV2x1WlhJc0lIUnlZVzV6YVhScGIyNUVkWEpoZEdsdmJpa2dlMXh5WEc0Z0lIUm9hWE11WDNSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlBOUlIUnlZVzV6YVhScGIyNUVkWEpoZEdsdmJqdGNjbHh1SUNCMGFHbHpMbDhrWTI5dWRHRnBibVZ5SUQwZ0pHTnZiblJoYVc1bGNqdGNjbHh1SUNCMGFHbHpMbDlwYm1SbGVDQTlJREE3SUM4dklFbHVaR1Y0SUc5bUlITmxiR1ZqZEdWa0lHbHRZV2RsWEhKY2JseHlYRzRnSUM4dklFTnlaV0YwWlNCamIyMXdiMjVsYm5SelhISmNiaUFnZEdocGN5NWZkR2gxYldKdVlXbHNVMnhwWkdWeUlEMGdibVYzSUZSb2RXMWlibUZwYkZOc2FXUmxjaWdrWTI5dWRHRnBibVZ5TENCMGFHbHpLVHRjY2x4dUlDQjBhR2x6TGw5dGIyUmhiQ0E5SUc1bGR5QlRiR2xrWlhOb2IzZE5iMlJoYkNna1kyOXVkR0ZwYm1WeUxDQjBhR2x6S1R0Y2NseHVYSEpjYmlBZ0x5OGdRMkZqYUdVZ1lXNWtJR055WldGMFpTQnVaV05sYzNOaGNua2dSRTlOSUdWc1pXMWxiblJ6WEhKY2JpQWdkR2hwY3k1ZkpHTmhjSFJwYjI1RGIyNTBZV2x1WlhJZ1BTQWtZMjl1ZEdGcGJtVnlMbVpwYm1Rb1hDSXVZMkZ3ZEdsdmJsd2lLVHRjY2x4dUlDQjBhR2x6TGw4a2MyVnNaV04wWldSSmJXRm5aVU52Ym5SaGFXNWxjaUE5SUNSamIyNTBZV2x1WlhJdVptbHVaQ2hjSWk1elpXeGxZM1JsWkMxcGJXRm5aVndpS1R0Y2NseHVYSEpjYmlBZ0x5OGdUM0JsYmlCdGIyUmhiQ0J2YmlCamJHbGphMmx1WnlCelpXeGxZM1JsWkNCcGJXRm5aVnh5WEc0Z0lIUm9hWE11WHlSelpXeGxZM1JsWkVsdFlXZGxRMjl1ZEdGcGJtVnlMbTl1S0Z4eVhHNGdJQ0FnWENKamJHbGphMXdpTEZ4eVhHNGdJQ0FnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnSUNBZ0lIUm9hWE11WDIxdlpHRnNMbTl3Wlc0b2RHaHBjeTVmYVc1a1pYZ3BPMXh5WEc0Z0lDQWdmUzVpYVc1a0tIUm9hWE1wWEhKY2JpQWdLVHRjY2x4dVhISmNiaUFnTHk4Z1RHOWhaQ0JwYldGblpYTmNjbHh1SUNCMGFHbHpMbDhrWjJGc2JHVnllVWx0WVdkbGN5QTlJSFJvYVhNdVgyeHZZV1JIWVd4c1pYSjVTVzFoWjJWektDazdYSEpjYmlBZ2RHaHBjeTVmYm5WdFNXMWhaMlZ6SUQwZ2RHaHBjeTVmSkdkaGJHeGxjbmxKYldGblpYTXViR1Z1WjNSb08xeHlYRzVjY2x4dUlDQXZMeUJUYUc5M0lIUm9aU0JtYVhKemRDQnBiV0ZuWlZ4eVhHNGdJSFJvYVhNdWMyaHZkMGx0WVdkbEtEQXBPMXh5WEc1OVhISmNibHh5WEc1VGJHbGtaWE5vYjNjdWNISnZkRzkwZVhCbExtZGxkRUZqZEdsMlpVbHVaR1Y0SUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2NtVjBkWEp1SUhSb2FYTXVYMmx1WkdWNE8xeHlYRzU5TzF4eVhHNWNjbHh1VTJ4cFpHVnphRzkzTG5CeWIzUnZkSGx3WlM1blpYUk9kVzFKYldGblpYTWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0J5WlhSMWNtNGdkR2hwY3k1ZmJuVnRTVzFoWjJWek8xeHlYRzU5TzF4eVhHNWNjbHh1VTJ4cFpHVnphRzkzTG5CeWIzUnZkSGx3WlM1blpYUkhZV3hzWlhKNVNXMWhaMlVnUFNCbWRXNWpkR2x2YmlocGJtUmxlQ2tnZTF4eVhHNGdJSEpsZEhWeWJpQjBhR2x6TGw4a1oyRnNiR1Z5ZVVsdFlXZGxjMXRwYm1SbGVGMDdYSEpjYm4wN1hISmNibHh5WEc1VGJHbGtaWE5vYjNjdWNISnZkRzkwZVhCbExtZGxkRU5oY0hScGIyNGdQU0JtZFc1amRHbHZiaWhwYm1SbGVDa2dlMXh5WEc0Z0lISmxkSFZ5YmlCMGFHbHpMbDhrWjJGc2JHVnllVWx0WVdkbGMxdHBibVJsZUYwdVpHRjBZU2hjSW1OaGNIUnBiMjVjSWlrN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2N1Y0hKdmRHOTBlWEJsTG5Ob2IzZEpiV0ZuWlNBOUlHWjFibU4wYVc5dUtHbHVaR1Y0S1NCN1hISmNiaUFnTHk4Z1VtVnpaWFFnWVd4c0lHbHRZV2RsY3lCMGJ5QnBiblpwYzJsaWJHVWdZVzVrSUd4dmQyVnpkQ0I2TFdsdVpHVjRMaUJVYUdseklHTnZkV3hrSUdKbElITnRZWEowWlhJc1hISmNiaUFnTHk4Z2JHbHJaU0JJYjNabGNsTnNhV1JsYzJodmR5d2dZVzVrSUc5dWJIa2djbVZ6WlhRZ1pYaGhZM1JzZVNCM2FHRjBJSGRsSUc1bFpXUXNJR0oxZENCM1pTQmhjbVZ1SjNSY2NseHVJQ0F2THlCM1lYTjBhVzVuSUhSb1lYUWdiV0Z1ZVNCamVXTnNaWE11WEhKY2JpQWdkR2hwY3k1ZkpHZGhiR3hsY25sSmJXRm5aWE11Wm05eVJXRmphQ2htZFc1amRHbHZiaWdrWjJGc2JHVnllVWx0WVdkbEtTQjdYSEpjYmlBZ0lDQWtaMkZzYkdWeWVVbHRZV2RsTG1OemN5aDdYSEpjYmlBZ0lDQWdJSHBKYm1SbGVEb2dNQ3hjY2x4dUlDQWdJQ0FnYjNCaFkybDBlVG9nTUZ4eVhHNGdJQ0FnZlNrN1hISmNiaUFnSUNBa1oyRnNiR1Z5ZVVsdFlXZGxMblpsYkc5amFYUjVLRndpYzNSdmNGd2lLVHNnTHk4Z1UzUnZjQ0JoYm5rZ1lXNXBiV0YwYVc5dWMxeHlYRzRnSUgwc0lIUm9hWE1wTzF4eVhHNWNjbHh1SUNBdkx5QkRZV05vWlNCeVpXWmxjbVZ1WTJWeklIUnZJSFJvWlNCc1lYTjBJR0Z1WkNCamRYSnlaVzUwSUdsdFlXZGxYSEpjYmlBZ2RtRnlJQ1JzWVhOMFNXMWhaMlVnUFNCMGFHbHpMbDhrWjJGc2JHVnllVWx0WVdkbGMxdDBhR2x6TGw5cGJtUmxlRjA3WEhKY2JpQWdkbUZ5SUNSamRYSnlaVzUwU1cxaFoyVWdQU0IwYUdsekxsOGtaMkZzYkdWeWVVbHRZV2RsYzF0cGJtUmxlRjA3WEhKY2JpQWdkR2hwY3k1ZmFXNWtaWGdnUFNCcGJtUmxlRHRjY2x4dVhISmNiaUFnTHk4Z1RXRnJaU0IwYUdVZ2JHRnpkQ0JwYldGblpTQjJhWE5wYzJKc1pTQmhibVFnZEdobGJpQmhibWx0WVhSbElIUm9aU0JqZFhKeVpXNTBJR2x0WVdkbElHbHVkRzhnZG1sbGQxeHlYRzRnSUM4dklHOXVJSFJ2Y0NCdlppQjBhR1VnYkdGemRGeHlYRzRnSUNSc1lYTjBTVzFoWjJVdVkzTnpLRndpZWtsdVpHVjRYQ0lzSURFcE8xeHlYRzRnSUNSamRYSnlaVzUwU1cxaFoyVXVZM056S0Z3aWVrbHVaR1Y0WENJc0lESXBPMXh5WEc0Z0lDUnNZWE4wU1cxaFoyVXVZM056S0Z3aWIzQmhZMmwwZVZ3aUxDQXhLVHRjY2x4dUlDQWtZM1Z5Y21WdWRFbHRZV2RsTG5abGJHOWphWFI1S0hzZ2IzQmhZMmwwZVRvZ01TQjlMQ0IwYUdsekxsOTBjbUZ1YzJsMGFXOXVSSFZ5WVhScGIyNHNJRndpWldGelpVbHVUM1YwVVhWaFpGd2lLVHRjY2x4dVhISmNiaUFnTHk4Z1EzSmxZWFJsSUhSb1pTQmpZWEIwYVc5dUxDQnBaaUJwZENCbGVHbHpkSE1nYjI0Z2RHaGxJSFJvZFcxaWJtRnBiRnh5WEc0Z0lIWmhjaUJqWVhCMGFXOXVJRDBnSkdOMWNuSmxiblJKYldGblpTNWtZWFJoS0Z3aVkyRndkR2x2Ymx3aUtUdGNjbHh1SUNCcFppQW9ZMkZ3ZEdsdmJpa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHTmhjSFJwYjI1RGIyNTBZV2x1WlhJdVpXMXdkSGtvS1R0Y2NseHVJQ0FnSUNRb1hDSThjM0JoYmo1Y0lpbGNjbHh1SUNBZ0lDQWdMbUZrWkVOc1lYTnpLRndpWm1sbmRYSmxMVzUxYldKbGNsd2lLVnh5WEc0Z0lDQWdJQ0F1ZEdWNGRDaGNJa1pwWnk0Z1hDSWdLeUFvZEdocGN5NWZhVzVrWlhnZ0t5QXhLU0FySUZ3aU9pQmNJaWxjY2x4dUlDQWdJQ0FnTG1Gd2NHVnVaRlJ2S0hSb2FYTXVYeVJqWVhCMGFXOXVRMjl1ZEdGcGJtVnlLVHRjY2x4dUlDQWdJQ1FvWENJOGMzQmhiajVjSWlsY2NseHVJQ0FnSUNBZ0xtRmtaRU5zWVhOektGd2lZMkZ3ZEdsdmJpMTBaWGgwWENJcFhISmNiaUFnSUNBZ0lDNTBaWGgwS0dOaGNIUnBiMjRwWEhKY2JpQWdJQ0FnSUM1aGNIQmxibVJVYnloMGFHbHpMbDhrWTJGd2RHbHZia052Ym5SaGFXNWxjaWs3WEhKY2JpQWdmVnh5WEc1Y2NseHVJQ0F2THlCUFltcGxZM1FnYVcxaFoyVWdabWwwSUhCdmJIbG1hV3hzSUdKeVpXRnJjeUJxVVhWbGNua2dZWFIwY2lndUxpNHBMQ0J6YnlCbVlXeHNZbUZqYXlCMGJ5QnFkWE4wWEhKY2JpQWdMeThnZFhOcGJtY2daV3hsYldWdWRDNXpjbU5jY2x4dUlDQXZMeUJVVDBSUE9pQk1ZWHA1SVZ4eVhHNGdJQzh2SUdsbUlDZ2tZM1Z5Y21WdWRFbHRZV2RsTG1kbGRDZ3dLUzV6Y21NZ1BUMDlJRndpWENJcElIdGNjbHh1SUNBdkx5QWdJQ0FnSkdOMWNuSmxiblJKYldGblpTNW5aWFFvTUNrdWMzSmpJRDBnSkdOMWNuSmxiblJKYldGblpTNWtZWFJoS0Z3aWFXMWhaMlV0ZFhKc1hDSXBPMXh5WEc0Z0lDOHZJSDFjY2x4dWZUdGNjbHh1WEhKY2JsTnNhV1JsYzJodmR5NXdjbTkwYjNSNWNHVXVYMnh2WVdSSFlXeHNaWEo1U1cxaFoyVnpJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnTHk4Z1EzSmxZWFJsSUdWdGNIUjVJR2x0WVdkbGN5QnBiaUIwYUdVZ1oyRnNiR1Z5ZVNCbWIzSWdaV0ZqYUNCMGFIVnRZbTVoYVd3dUlGUm9hWE1nYUdWc2NITWdkWE1nWkc5Y2NseHVJQ0F2THlCc1lYcDVJR3h2WVdScGJtY2diMllnWjJGc2JHVnllU0JwYldGblpYTWdZVzVrSUdGc2JHOTNjeUIxY3lCMGJ5QmpjbTl6Y3kxbVlXUmxJR2x0WVdkbGN5NWNjbHh1SUNCMllYSWdKR2RoYkd4bGNubEpiV0ZuWlhNZ1BTQmJYVHRjY2x4dUlDQm1iM0lnS0haaGNpQnBJRDBnTURzZ2FTQThJSFJvYVhNdVgzUm9kVzFpYm1GcGJGTnNhV1JsY2k1blpYUk9kVzFVYUhWdFltNWhhV3h6S0NrN0lHa2dLejBnTVNrZ2UxeHlYRzRnSUNBZ0x5OGdSMlYwSUhSb1pTQjBhSFZ0WW01aGFXd2daV3hsYldWdWRDQjNhR2xqYUNCb1lYTWdjR0YwYUNCaGJtUWdZMkZ3ZEdsdmJpQmtZWFJoWEhKY2JpQWdJQ0IyWVhJZ0pIUm9kVzFpSUQwZ2RHaHBjeTVmZEdoMWJXSnVZV2xzVTJ4cFpHVnlMbWRsZENSVWFIVnRZbTVoYVd3b2FTazdYSEpjYmx4eVhHNGdJQ0FnTHk4Z1EyRnNZM1ZzWVhSbElIUm9aU0JwWkNCbWNtOXRJSFJvWlNCd1lYUm9JSFJ2SUhSb1pTQnNZWEpuWlNCcGJXRm5aVnh5WEc0Z0lDQWdkbUZ5SUd4aGNtZGxVR0YwYUNBOUlDUjBhSFZ0WWk1a1lYUmhLRndpYkdGeVoyVXRjR0YwYUZ3aUtUdGNjbHh1SUNBZ0lIWmhjaUJwWkNBOUlHeGhjbWRsVUdGMGFGeHlYRzRnSUNBZ0lDQXVjM0JzYVhRb1hDSXZYQ0lwWEhKY2JpQWdJQ0FnSUM1d2IzQW9LVnh5WEc0Z0lDQWdJQ0F1YzNCc2FYUW9YQ0l1WENJcFd6QmRPMXh5WEc1Y2NseHVJQ0FnSUM4dklFTnlaV0YwWlNCaElHZGhiR3hsY25rZ2FXMWhaMlVnWld4bGJXVnVkRnh5WEc0Z0lDQWdkbUZ5SUNSbllXeHNaWEo1U1cxaFoyVWdQU0FrS0Z3aVBHbHRaejVjSWl3Z2V5QnBaRG9nYVdRZ2ZTbGNjbHh1SUNBZ0lDQWdMbU56Y3loN1hISmNiaUFnSUNBZ0lDQWdjRzl6YVhScGIyNDZJRndpWVdKemIyeDFkR1ZjSWl4Y2NseHVJQ0FnSUNBZ0lDQjBiM0E2SUZ3aU1IQjRYQ0lzWEhKY2JpQWdJQ0FnSUNBZ2JHVm1kRG9nWENJd2NIaGNJaXhjY2x4dUlDQWdJQ0FnSUNCdmNHRmphWFI1T2lBd0xGeHlYRzRnSUNBZ0lDQWdJSHBKYm1SbGVEb2dNRnh5WEc0Z0lDQWdJQ0I5S1Z4eVhHNGdJQ0FnSUNBdVpHRjBZU2hjSW1sdFlXZGxMWFZ5YkZ3aUxDQnNZWEpuWlZCaGRHZ3BYSEpjYmlBZ0lDQWdJQzVrWVhSaEtGd2lZMkZ3ZEdsdmJsd2lMQ0FrZEdoMWJXSXVaR0YwWVNoY0ltTmhjSFJwYjI1Y0lpa3BYSEpjYmlBZ0lDQWdJQzVoY0hCbGJtUlVieWgwYUdsekxsOGtjMlZzWldOMFpXUkpiV0ZuWlVOdmJuUmhhVzVsY2lrN1hISmNiaUFnSUNBa1oyRnNiR1Z5ZVVsdFlXZGxMbWRsZENnd0tTNXpjbU1nUFNCc1lYSm5aVkJoZEdnN0lDOHZJRlJQUkU4NklFMWhhMlVnZEdocGN5QnNZWHA1SVZ4eVhHNGdJQ0FnSkdkaGJHeGxjbmxKYldGblpYTXVjSFZ6YUNna1oyRnNiR1Z5ZVVsdFlXZGxLVHRjY2x4dUlDQjlYSEpjYmlBZ2NtVjBkWEp1SUNSbllXeHNaWEo1U1cxaFoyVnpPMXh5WEc1OU8xeHlYRzRpTENKdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUZSb2RXMWlibUZwYkZOc2FXUmxjanRjY2x4dVhISmNibVoxYm1OMGFXOXVJRlJvZFcxaWJtRnBiRk5zYVdSbGNpZ2tZMjl1ZEdGcGJtVnlMQ0J6Ykdsa1pYTm9iM2NwSUh0Y2NseHVJQ0IwYUdsekxsOGtZMjl1ZEdGcGJtVnlJRDBnSkdOdmJuUmhhVzVsY2p0Y2NseHVJQ0IwYUdsekxsOXpiR2xrWlhOb2IzY2dQU0J6Ykdsa1pYTm9iM2M3WEhKY2JseHlYRzRnSUhSb2FYTXVYMmx1WkdWNElEMGdNRHNnTHk4Z1NXNWtaWGdnYjJZZ2MyVnNaV04wWldRZ2RHaDFiV0p1WVdsc1hISmNiaUFnZEdocGN5NWZjMk55YjJ4c1NXNWtaWGdnUFNBd095QXZMeUJKYm1SbGVDQnZaaUIwYUdVZ2RHaDFiV0p1WVdsc0lIUm9ZWFFnYVhNZ1kzVnljbVZ1ZEd4NUlHTmxiblJsY21Wa1hISmNibHh5WEc0Z0lDOHZJRU5oWTJobElHRnVaQ0JqY21WaGRHVWdibVZqWlhOellYSjVJRVJQVFNCbGJHVnRaVzUwYzF4eVhHNGdJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeERiMjUwWVdsdVpYSWdQU0FrWTI5dWRHRnBibVZ5TG1acGJtUW9YQ0l1ZEdoMWJXSnVZV2xzYzF3aUtUdGNjbHh1SUNCMGFHbHpMbDhrZEdoMWJXSnVZV2xzU1cxaFoyVnpJRDBnZEdocGN5NWZKSFJvZFcxaWJtRnBiRU52Ym5SaGFXNWxjaTVtYVc1a0tGd2lhVzFuWENJcE8xeHlYRzRnSUhSb2FYTXVYeVIyYVhOcFlteGxWR2gxYldKdVlXbHNWM0poY0NBOUlDUmpiMjUwWVdsdVpYSXVabWx1WkNoY0lpNTJhWE5wWW14bExYUm9kVzFpYm1GcGJITmNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpHRmtkbUZ1WTJWTVpXWjBJRDBnSkdOdmJuUmhhVzVsY2k1bWFXNWtLRndpTG5Sb2RXMWlibUZwYkMxaFpIWmhibU5sTFd4bFpuUmNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpHRmtkbUZ1WTJWU2FXZG9kQ0E5SUNSamIyNTBZV2x1WlhJdVptbHVaQ2hjSWk1MGFIVnRZbTVoYVd3dFlXUjJZVzVqWlMxeWFXZG9kRndpS1R0Y2NseHVYSEpjYmlBZ0x5OGdURzl2Y0NCMGFISnZkV2RvSUhSb1pTQjBhSFZ0WW01aGFXeHpMQ0JuYVhabElIUm9aVzBnWVc0Z2FXNWtaWGdnWkdGMFlTQmhkSFJ5YVdKMWRHVWdZVzVrSUdOaFkyaGxYSEpjYmlBZ0x5OGdZU0J5WldabGNtVnVZMlVnZEc4Z2RHaGxiU0JwYmlCaGJpQmhjbkpoZVZ4eVhHNGdJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeHpJRDBnVzEwN1hISmNiaUFnZEdocGN5NWZKSFJvZFcxaWJtRnBiRWx0WVdkbGN5NWxZV05vS0Z4eVhHNGdJQ0FnWm5WdVkzUnBiMjRvYVc1a1pYZ3NJR1ZzWlcxbGJuUXBJSHRjY2x4dUlDQWdJQ0FnZG1GeUlDUjBhSFZ0WW01aGFXd2dQU0FrS0dWc1pXMWxiblFwTzF4eVhHNGdJQ0FnSUNBa2RHaDFiV0p1WVdsc0xtUmhkR0VvWENKcGJtUmxlRndpTENCcGJtUmxlQ2s3WEhKY2JpQWdJQ0FnSUhSb2FYTXVYeVIwYUhWdFltNWhhV3h6TG5CMWMyZ29KSFJvZFcxaWJtRnBiQ2s3WEhKY2JpQWdJQ0I5TG1KcGJtUW9kR2hwY3lsY2NseHVJQ0FwTzF4eVhHNGdJSFJvYVhNdVgyNTFiVWx0WVdkbGN5QTlJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeHpMbXhsYm1kMGFEdGNjbHh1WEhKY2JpQWdMeThnVEdWbWRDOXlhV2RvZENCamIyNTBjbTlzYzF4eVhHNGdJSFJvYVhNdVh5UmhaSFpoYm1ObFRHVm1kQzV2YmloY0ltTnNhV05yWENJc0lIUm9hWE11WVdSMllXNWpaVXhsWm5RdVltbHVaQ2gwYUdsektTazdYSEpjYmlBZ2RHaHBjeTVmSkdGa2RtRnVZMlZTYVdkb2RDNXZiaWhjSW1Oc2FXTnJYQ0lzSUhSb2FYTXVZV1IyWVc1alpWSnBaMmgwTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzVjY2x4dUlDQXZMeUJEYkdsamEybHVaeUJoSUhSb2RXMWlibUZwYkZ4eVhHNGdJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeEpiV0ZuWlhNdWIyNG9YQ0pqYkdsamExd2lMQ0IwYUdsekxsOXZia05zYVdOckxtSnBibVFvZEdocGN5a3BPMXh5WEc1Y2NseHVJQ0IwYUdsekxsOWhZM1JwZG1GMFpWUm9kVzFpYm1GcGJDZ3dLVHRjY2x4dVhISmNiaUFnTHk4Z1VtVnphWHBsWEhKY2JpQWdKQ2gzYVc1a2IzY3BMbTl1S0Z3aWNtVnphWHBsWENJc0lIUm9hWE11WDI5dVVtVnphWHBsTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzVjY2x4dUlDQXZMeUJHYjNJZ2MyOXRaU0J5WldGemIyNHNJSFJvWlNCemFYcHBibWNnYjI0Z2RHaGxJR052Ym5SeWIyeHpJR2x6SUcxbGMzTmxaQ0IxY0NCcFppQnBkQ0J5ZFc1elhISmNiaUFnTHk4Z2FXMXRaV1JwWVhSbGJIa2dMU0JrWld4aGVTQnphWHBwYm1jZ2RXNTBhV3dnYzNSaFkyc2dhWE1nWTJ4bFlYSmNjbHh1SUNCelpYUlVhVzFsYjNWMEtGeHlYRzRnSUNBZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ0lDQWdJSFJvYVhNdVgyOXVVbVZ6YVhwbEtDazdYSEpjYmlBZ0lDQjlMbUpwYm1Rb2RHaHBjeWtzWEhKY2JpQWdJQ0F3WEhKY2JpQWdLVHRjY2x4dWZWeHlYRzVjY2x4dVZHaDFiV0p1WVdsc1UyeHBaR1Z5TG5CeWIzUnZkSGx3WlM1blpYUkJZM1JwZG1WSmJtUmxlQ0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUhKbGRIVnliaUIwYUdsekxsOXBibVJsZUR0Y2NseHVmVHRjY2x4dVhISmNibFJvZFcxaWJtRnBiRk5zYVdSbGNpNXdjbTkwYjNSNWNHVXVaMlYwVG5WdFZHaDFiV0p1WVdsc2N5QTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJSEpsZEhWeWJpQjBhR2x6TGw5dWRXMUpiV0ZuWlhNN1hISmNibjA3WEhKY2JseHlYRzVVYUhWdFltNWhhV3hUYkdsa1pYSXVjSEp2ZEc5MGVYQmxMbWRsZENSVWFIVnRZbTVoYVd3Z1BTQm1kVzVqZEdsdmJpaHBibVJsZUNrZ2UxeHlYRzRnSUhKbGRIVnliaUIwYUdsekxsOGtkR2gxYldKdVlXbHNjMXRwYm1SbGVGMDdYSEpjYm4wN1hISmNibHh5WEc1VWFIVnRZbTVoYVd4VGJHbGtaWEl1Y0hKdmRHOTBlWEJsTG1Ga2RtRnVZMlZNWldaMElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdkbUZ5SUc1bGQwbHVaR1Y0SUQwZ2RHaHBjeTVmYzJOeWIyeHNTVzVrWlhnZ0xTQjBhR2x6TGw5dWRXMVdhWE5wWW14bE8xeHlYRzRnSUc1bGQwbHVaR1Y0SUQwZ1RXRjBhQzV0WVhnb2JtVjNTVzVrWlhnc0lEQXBPMXh5WEc0Z0lIUm9hWE11WDNOamNtOXNiRlJ2VkdoMWJXSnVZV2xzS0c1bGQwbHVaR1Y0S1R0Y2NseHVmVHRjY2x4dVhISmNibFJvZFcxaWJtRnBiRk5zYVdSbGNpNXdjbTkwYjNSNWNHVXVZV1IyWVc1alpWSnBaMmgwSUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2RtRnlJRzVsZDBsdVpHVjRJRDBnZEdocGN5NWZjMk55YjJ4c1NXNWtaWGdnS3lCMGFHbHpMbDl1ZFcxV2FYTnBZbXhsTzF4eVhHNGdJRzVsZDBsdVpHVjRJRDBnVFdGMGFDNXRhVzRvYm1WM1NXNWtaWGdzSUhSb2FYTXVYMjUxYlVsdFlXZGxjeUF0SURFcE8xeHlYRzRnSUhSb2FYTXVYM05qY205c2JGUnZWR2gxYldKdVlXbHNLRzVsZDBsdVpHVjRLVHRjY2x4dWZUdGNjbHh1WEhKY2JsUm9kVzFpYm1GcGJGTnNhV1JsY2k1d2NtOTBiM1I1Y0dVdVgzSmxjMlYwVTJsNmFXNW5JRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnTHk4Z1VtVnpaWFFnYzJsNmFXNW5JSFpoY21saFlteGxjeTRnVkdocGN5QnBibU5zZFdSbGN5QnlaWE5sZEhScGJtY2dZVzU1SUdsdWJHbHVaU0J6ZEhsc1pTQjBhR0YwSUdoaGMxeHlYRzRnSUM4dklHSmxaVzRnWVhCd2JHbGxaQ3dnYzI4Z2RHaGhkQ0JoYm5rZ2MybDZaU0JqWVd4amRXeGhkR2x2Ym5NZ1kyRnVJR0psSUdKaGMyVmtJRzl1SUhSb1pTQkRVMU5jY2x4dUlDQXZMeUJ6ZEhsc2FXNW5MbHh5WEc0Z0lIUm9hWE11WHlSMGFIVnRZbTVoYVd4RGIyNTBZV2x1WlhJdVkzTnpLSHRjY2x4dUlDQWdJSFJ2Y0RvZ1hDSmNJaXhjY2x4dUlDQWdJR3hsWm5RNklGd2lYQ0lzWEhKY2JpQWdJQ0IzYVdSMGFEb2dYQ0pjSWl4Y2NseHVJQ0FnSUdobGFXZG9kRG9nWENKY0lseHlYRzRnSUgwcE8xeHlYRzRnSUhSb2FYTXVYeVIyYVhOcFlteGxWR2gxYldKdVlXbHNWM0poY0M1M2FXUjBhQ2hjSWx3aUtUdGNjbHh1SUNCMGFHbHpMbDhrZG1semFXSnNaVlJvZFcxaWJtRnBiRmR5WVhBdWFHVnBaMmgwS0Z3aVhDSXBPMXh5WEc0Z0lDOHZJRTFoYTJVZ1lXeHNJSFJvZFcxaWJtRnBiSE1nYzNGMVlYSmxJR0Z1WkNCeVpYTmxkQ0JoYm5rZ2FHVnBaMmgwWEhKY2JpQWdkR2hwY3k1ZkpIUm9kVzFpYm1GcGJITXVabTl5UldGamFDaG1kVzVqZEdsdmJpZ2taV3hsYldWdWRDa2dlMXh5WEc0Z0lDQWdKR1ZzWlcxbGJuUXVhR1ZwWjJoMEtGd2lYQ0lwT3lBdkx5QlNaWE5sZENCb1pXbG5hSFFnWW1WbWIzSmxJSE5sZEhScGJtY2dkMmxrZEdoY2NseHVJQ0FnSUNSbGJHVnRaVzUwTG5kcFpIUm9LQ1JsYkdWdFpXNTBMbWhsYVdkb2RDZ3BLVHRjY2x4dUlDQjlLVHRjY2x4dWZUdGNjbHh1WEhKY2JsUm9kVzFpYm1GcGJGTnNhV1JsY2k1d2NtOTBiM1I1Y0dVdVgyOXVVbVZ6YVhwbElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdkR2hwY3k1ZmNtVnpaWFJUYVhwcGJtY29LVHRjY2x4dVhISmNiaUFnTHk4Z1EyRnNZM1ZzWVhSbElIUm9aU0J6YVhwbElHOW1JSFJvWlNCbWFYSnpkQ0IwYUhWdFltNWhhV3d1SUZSb2FYTWdZWE56ZFcxbGN5QjBhR1VnWm1seWMzUWdhVzFoWjJWY2NseHVJQ0F2THlCdmJteDVJR2hoY3lCaElISnBaMmgwTFhOcFpHVWdiV0Z5WjJsdUxseHlYRzRnSUhaaGNpQWtabWx5YzNSVWFIVnRZaUE5SUhSb2FYTXVYeVIwYUhWdFltNWhhV3h6V3pCZE8xeHlYRzRnSUhaaGNpQjBhSFZ0WWxOcGVtVWdQU0FrWm1seWMzUlVhSFZ0WWk1dmRYUmxja2hsYVdkb2RDaG1ZV3h6WlNrN1hISmNiaUFnZG1GeUlIUm9kVzFpVFdGeVoybHVJRDBnTWlBcUlDZ2tabWx5YzNSVWFIVnRZaTV2ZFhSbGNsZHBaSFJvS0hSeWRXVXBJQzBnZEdoMWJXSlRhWHBsS1R0Y2NseHVYSEpjYmlBZ0x5OGdUV1ZoYzNWeVpTQmpiMjUwY205c2N5NGdWR2hsZVNCdVpXVmtJSFJ2SUdKbElIWnBjMmxpYkdVZ2FXNGdiM0prWlhJZ2RHOGdZbVVnYldWaGMzVnlaV1F1WEhKY2JpQWdkR2hwY3k1ZkpHRmtkbUZ1WTJWU2FXZG9kQzVqYzNNb1hDSmthWE53YkdGNVhDSXNJRndpWW14dlkydGNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpHRmtkbUZ1WTJWTVpXWjBMbU56Y3loY0ltUnBjM0JzWVhsY0lpd2dYQ0ppYkc5amExd2lLVHRjY2x4dUlDQjJZWElnZEdoMWJXSkRiMjUwY205c1YybGtkR2dnUFZ4eVhHNGdJQ0FnZEdocGN5NWZKR0ZrZG1GdVkyVlNhV2RvZEM1dmRYUmxjbGRwWkhSb0tIUnlkV1VwSUNzZ2RHaHBjeTVmSkdGa2RtRnVZMlZNWldaMExtOTFkR1Z5VjJsa2RHZ29kSEoxWlNrN1hISmNibHh5WEc0Z0lDOHZJRU5oYkdOMWJHRjBaU0JvYjNjZ2JXRnVlU0JtZFd4c0lIUm9kVzFpYm1GcGJITWdZMkZ1SUdacGRDQjNhWFJvYVc0Z2RHaGxJSFJvZFcxaWJtRnBiQ0JoY21WaFhISmNiaUFnZG1GeUlIWnBjMmxpYkdWWGFXUjBhQ0E5SUhSb2FYTXVYeVIyYVhOcFlteGxWR2gxYldKdVlXbHNWM0poY0M1dmRYUmxjbGRwWkhSb0tHWmhiSE5sS1R0Y2NseHVJQ0IyWVhJZ2JuVnRWR2gxYldKelZtbHphV0pzWlNBOUlFMWhkR2d1Wm14dmIzSW9LSFpwYzJsaWJHVlhhV1IwYUNBdElIUm9kVzFpVFdGeVoybHVLU0F2SUNoMGFIVnRZbE5wZW1VZ0t5QjBhSFZ0WWsxaGNtZHBiaWtwTzF4eVhHNWNjbHh1SUNBdkx5QkRhR1ZqYXlCM2FHVjBhR1Z5SUdGc2JDQjBhR1VnZEdoMWJXSnVZV2xzY3lCallXNGdabWwwSUc5dUlIUm9aU0J6WTNKbFpXNGdZWFFnYjI1alpWeHlYRzRnSUdsbUlDaHVkVzFVYUhWdFluTldhWE5wWW14bElEd2dkR2hwY3k1ZmJuVnRTVzFoWjJWektTQjdYSEpjYmlBZ0lDQXZMeUJVWVd0bElHRWdZbVZ6ZENCbmRXVnpjeUJoZENCb2IzY2dkRzhnYzJsNlpTQjBhR1VnZEdoMWJXSnVZV2xzY3k0Z1UybDZaU0JtYjNKdGRXeGhPbHh5WEc0Z0lDQWdMeThnSUhkcFpIUm9JRDBnYm5WdElDb2dkR2gxYldKVGFYcGxJQ3NnS0c1MWJTQXRJREVwSUNvZ2RHaDFiV0pOWVhKbmFXNGdLeUJqYjI1MGNtOXNVMmw2WlZ4eVhHNGdJQ0FnTHk4Z1UyOXNkbVVnWm05eUlHNTFiV0psY2lCdlppQjBhSFZ0WW01aGFXeHpJR0Z1WkNCeWIzVnVaQ0IwYnlCMGFHVWdibVZoY21WemRDQnBiblJsWjJWeUlITnZYSEpjYmlBZ0lDQXZMeUIwYUdGMElIZGxJR1J2YmlkMElHaGhkbVVnWVc1NUlIQmhjblJwWVd3Z2RHaDFiV0p1WVdsc2N5QnphRzkzYVc1bkxseHlYRzRnSUNBZ2JuVnRWR2gxYldKelZtbHphV0pzWlNBOUlFMWhkR2d1Y205MWJtUW9YSEpjYmlBZ0lDQWdJQ2gyYVhOcFlteGxWMmxrZEdnZ0xTQjBhSFZ0WWtOdmJuUnliMnhYYVdSMGFDQXJJSFJvZFcxaVRXRnlaMmx1S1NBdklDaDBhSFZ0WWxOcGVtVWdLeUIwYUhWdFlrMWhjbWRwYmlsY2NseHVJQ0FnSUNrN1hISmNibHh5WEc0Z0lDQWdMeThnVlhObElIUm9hWE1nYm5WdFltVnlJRzltSUhSb2RXMWlibUZwYkhNZ2RHOGdZMkZzWTNWc1lYUmxJSFJvWlNCMGFIVnRZbTVoYVd3Z2MybDZaVnh5WEc0Z0lDQWdkbUZ5SUc1bGQxTnBlbVVnUFNBb2RtbHphV0pzWlZkcFpIUm9JQzBnZEdoMWJXSkRiMjUwY205c1YybGtkR2dnS3lCMGFIVnRZazFoY21kcGJpa2dMeUJ1ZFcxVWFIVnRZbk5XYVhOcFlteGxJQzBnZEdoMWJXSk5ZWEpuYVc0N1hISmNiaUFnSUNCMGFHbHpMbDhrZEdoMWJXSnVZV2xzY3k1bWIzSkZZV05vS0daMWJtTjBhVzl1S0NSbGJHVnRaVzUwS1NCN1hISmNiaUFnSUNBZ0lDOHZJQ1F1ZDJsa2RHZ2dZVzVrSUNRdWFHVnBaMmgwSUhObGRDQjBhR1VnWTI5dWRHVnVkQ0J6YVhwbElISmxaMkZ5Wkd4bGMzTWdiMllnZEdobFhISmNiaUFnSUNBZ0lDOHZJR0p2ZUMxemFYcHBibWN1SUZSb1pTQnBiV0ZuWlhNZ1lYSmxJR0p2Y21SbGNpMWliM2dzSUhOdklIZGxJSGRoYm5RZ2RHaGxJRU5UVXlCM2FXUjBhRnh5WEc0Z0lDQWdJQ0F2THlCaGJtUWdhR1ZwWjJoMExpQlVhR2x6SUdGc2JHOTNjeUIwYUdVZ1lXTjBhWFpsSUdsdFlXZGxJSFJ2SUdoaGRtVWdZU0JpYjNKa1pYSWdZVzVrSUhSb1pWeHlYRzRnSUNBZ0lDQXZMeUJ2ZEdobGNpQnBiV0ZuWlhNZ2RHOGdhR0YyWlNCd1lXUmthVzVuTGx4eVhHNGdJQ0FnSUNBa1pXeGxiV1Z1ZEM1amMzTW9YQ0ozYVdSMGFGd2lMQ0J1WlhkVGFYcGxJQ3NnWENKd2VGd2lLVHRjY2x4dUlDQWdJQ0FnSkdWc1pXMWxiblF1WTNOektGd2lhR1ZwWjJoMFhDSXNJRzVsZDFOcGVtVWdLeUJjSW5CNFhDSXBPMXh5WEc0Z0lDQWdmU2s3WEhKY2JseHlYRzRnSUNBZ0x5OGdVMlYwSUhSb1pTQjBhSFZ0WW01aGFXd2dkM0poY0NCemFYcGxMaUJKZENCemFHOTFiR1FnWW1VZ2FuVnpkQ0IwWVd4c0lHVnViM1ZuYUNCMGJ5Qm1hWFFnWVZ4eVhHNGdJQ0FnTHk4Z2RHaDFiV0p1WVdsc0lHRnVaQ0JzYjI1bklHVnViM1ZuYUNCMGJ5Qm9iMnhrSUdGc2JDQjBhR1VnZEdoMWJXSnVZV2xzY3lCcGJpQnZibVVnYkdsdVpUcGNjbHh1SUNBZ0lIWmhjaUIwYjNSaGJGTnBlbVVnUFNCdVpYZFRhWHBsSUNvZ2RHaHBjeTVmYm5WdFNXMWhaMlZ6SUNzZ2RHaDFiV0pOWVhKbmFXNGdLaUFvZEdocGN5NWZiblZ0U1cxaFoyVnpJQzBnTVNrN1hISmNiaUFnSUNCMGFHbHpMbDhrZEdoMWJXSnVZV2xzUTI5dWRHRnBibVZ5TG1OemN5aDdYSEpjYmlBZ0lDQWdJSGRwWkhSb09pQjBiM1JoYkZOcGVtVWdLeUJjSW5CNFhDSXNYSEpjYmlBZ0lDQWdJR2hsYVdkb2REb2dKR1pwY25OMFZHaDFiV0l1YjNWMFpYSklaV2xuYUhRb2RISjFaU2tnS3lCY0luQjRYQ0pjY2x4dUlDQWdJSDBwTzF4eVhHNWNjbHh1SUNBZ0lDOHZJRk5sZENCMGFHVWdkbWx6YVdKc1pTQjBhSFZ0WW01aGFXd2dkM0poY0NCemFYcGxMaUJVYUdseklHbHpJSFZ6WldRZ2RHOGdiV0ZyY3lCMGFHVWdiWFZqYUZ4eVhHNGdJQ0FnTHk4Z2JHRnlaMlZ5SUhSb2RXMWlibUZwYkNCamIyNTBZV2x1WlhJdUlFbDBJSE5vYjNWc1pDQmlaU0JoY3lCM2FXUmxJR0Z6SUdsMElHTmhiaUJpWlN3Z2JXbHVkWE5jY2x4dUlDQWdJQzh2SUhSb1pTQnpjR0ZqWlNCdVpXVmtaV1FnWm05eUlIUm9aU0JzWldaMEwzSnBaMmgwSUdOdmJuUnZiSE11WEhKY2JpQWdJQ0IwYUdsekxsOGtkbWx6YVdKc1pWUm9kVzFpYm1GcGJGZHlZWEF1WTNOektIdGNjbHh1SUNBZ0lDQWdkMmxrZEdnNklIWnBjMmxpYkdWWGFXUjBhQ0F0SUhSb2RXMWlRMjl1ZEhKdmJGZHBaSFJvSUNzZ1hDSndlRndpTEZ4eVhHNGdJQ0FnSUNCb1pXbG5hSFE2SUNSbWFYSnpkRlJvZFcxaUxtOTFkR1Z5U0dWcFoyaDBLSFJ5ZFdVcElDc2dYQ0p3ZUZ3aVhISmNiaUFnSUNCOUtUdGNjbHh1SUNCOUlHVnNjMlVnZTF4eVhHNGdJQ0FnTHk4Z1FXeHNJSFJvZFcxaWJtRnBiSE1nWVhKbElIWnBjMmxpYkdVc0lIZGxJR05oYmlCb2FXUmxJSFJvWlNCamIyNTBjbTlzY3lCaGJtUWdaWGh3WVc1a0lIUm9aVnh5WEc0Z0lDQWdMeThnZEdoMWJXSnVZV2xzSUdOdmJuUmhhVzVsY2lCMGJ5QXhNREFsWEhKY2JpQWdJQ0J1ZFcxVWFIVnRZbk5XYVhOcFlteGxJRDBnZEdocGN5NWZiblZ0U1cxaFoyVnpPMXh5WEc0Z0lDQWdkR2hwY3k1ZkpIUm9kVzFpYm1GcGJFTnZiblJoYVc1bGNpNWpjM01vWENKM2FXUjBhRndpTENCY0lqRXdNQ1ZjSWlrN1hISmNiaUFnSUNCMGFHbHpMbDhrWVdSMllXNWpaVkpwWjJoMExtTnpjeWhjSW1ScGMzQnNZWGxjSWl3Z1hDSnViMjVsWENJcE8xeHlYRzRnSUNBZ2RHaHBjeTVmSkdGa2RtRnVZMlZNWldaMExtTnpjeWhjSW1ScGMzQnNZWGxjSWl3Z1hDSnViMjVsWENJcE8xeHlYRzRnSUgxY2NseHVYSEpjYmlBZ2RHaHBjeTVmYm5WdFZtbHphV0pzWlNBOUlHNTFiVlJvZFcxaWMxWnBjMmxpYkdVN1hISmNiaUFnZG1GeUlHMXBaR1JzWlVsdVpHVjRJRDBnVFdGMGFDNW1iRzl2Y2lnb2RHaHBjeTVmYm5WdFZtbHphV0pzWlNBdElERXBJQzhnTWlrN1hISmNiaUFnZEdocGN5NWZjMk55YjJ4c1FtOTFibVJ6SUQwZ2UxeHlYRzRnSUNBZ2JXbHVPaUJ0YVdSa2JHVkpibVJsZUN4Y2NseHVJQ0FnSUcxaGVEb2dkR2hwY3k1ZmJuVnRTVzFoWjJWeklDMGdNU0F0SUcxcFpHUnNaVWx1WkdWNFhISmNiaUFnZlR0Y2NseHVJQ0JwWmlBb2RHaHBjeTVmYm5WdFZtbHphV0pzWlNBbElESWdQVDA5SURBcElIUm9hWE11WDNOamNtOXNiRUp2ZFc1a2N5NXRZWGdnTFQwZ01UdGNjbHh1WEhKY2JpQWdkR2hwY3k1ZmRYQmtZWFJsVkdoMWJXSnVZV2xzUTI5dWRISnZiSE1vS1R0Y2NseHVmVHRjY2x4dVhISmNibFJvZFcxaWJtRnBiRk5zYVdSbGNpNXdjbTkwYjNSNWNHVXVYMkZqZEdsMllYUmxWR2gxYldKdVlXbHNJRDBnWm5WdVkzUnBiMjRvYVc1a1pYZ3BJSHRjY2x4dUlDQXZMeUJCWTNScGRtRjBaUzlrWldGamRHbDJZWFJsSUhSb2RXMWlibUZwYkhOY2NseHVJQ0IwYUdsekxsOGtkR2gxYldKdVlXbHNjMXQwYUdsekxsOXBibVJsZUYwdWNtVnRiM1psUTJ4aGMzTW9YQ0poWTNScGRtVmNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpIUm9kVzFpYm1GcGJITmJhVzVrWlhoZExtRmtaRU5zWVhOektGd2lZV04wYVhabFhDSXBPMXh5WEc1OU8xeHlYRzVjY2x4dVZHaDFiV0p1WVdsc1UyeHBaR1Z5TG5CeWIzUnZkSGx3WlM1ZmMyTnliMnhzVkc5VWFIVnRZbTVoYVd3Z1BTQm1kVzVqZEdsdmJpaHBibVJsZUNrZ2UxeHlYRzRnSUM4dklFNXZJRzVsWldRZ2RHOGdjMk55YjJ4c0lHbG1JR0ZzYkNCMGFIVnRZbTVoYVd4eklHRnlaU0IyYVhOcFlteGxYSEpjYmlBZ2FXWWdLSFJvYVhNdVgyNTFiVlpwYzJsaWJHVWdQVDA5SUhSb2FYTXVYMjUxYlVsdFlXZGxjeWtnY21WMGRYSnVPMXh5WEc1Y2NseHVJQ0F2THlCRGIyNXpkSEpoYVc0Z2FXNWtaWGdnYzI4Z2RHaGhkQ0IzWlNCallXNG5kQ0J6WTNKdmJHd2diM1YwSUc5bUlHSnZkVzVrYzF4eVhHNGdJR2x1WkdWNElEMGdUV0YwYUM1dFlYZ29hVzVrWlhnc0lIUm9hWE11WDNOamNtOXNiRUp2ZFc1a2N5NXRhVzRwTzF4eVhHNGdJR2x1WkdWNElEMGdUV0YwYUM1dGFXNG9hVzVrWlhnc0lIUm9hWE11WDNOamNtOXNiRUp2ZFc1a2N5NXRZWGdwTzF4eVhHNGdJSFJvYVhNdVgzTmpjbTlzYkVsdVpHVjRJRDBnYVc1a1pYZzdYSEpjYmx4eVhHNGdJQzh2SUVacGJtUWdkR2hsSUZ3aWJHVm1kRndpSUhCdmMybDBhVzl1SUc5bUlIUm9aU0IwYUhWdFltNWhhV3dnWTI5dWRHRnBibVZ5SUhSb1lYUWdkMjkxYkdRZ2NIVjBJSFJvWlZ4eVhHNGdJQzh2SUhSb2RXMWlibUZwYkNCaGRDQnBibVJsZUNCaGRDQjBhR1VnWTJWdWRHVnlYSEpjYmlBZ2RtRnlJQ1IwYUhWdFlpQTlJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeHpXekJkTzF4eVhHNGdJSFpoY2lCemFYcGxJRDBnY0dGeWMyVkdiRzloZENna2RHaDFiV0l1WTNOektGd2lkMmxrZEdoY0lpa3BPMXh5WEc0Z0lIWmhjaUJ0WVhKbmFXNGdQU0F5SUNvZ2NHRnljMlZHYkc5aGRDZ2tkR2gxYldJdVkzTnpLRndpYldGeVoybHVMWEpwWjJoMFhDSXBLVHRjY2x4dUlDQjJZWElnWTJWdWRHVnlXQ0E5SUhOcGVtVWdLaUIwYUdsekxsOXpZM0p2Ykd4Q2IzVnVaSE11YldsdUlDc2diV0Z5WjJsdUlDb2dLSFJvYVhNdVgzTmpjbTlzYkVKdmRXNWtjeTV0YVc0Z0xTQXhLVHRjY2x4dUlDQjJZWElnZEdoMWJXSllJRDBnYzJsNlpTQXFJR2x1WkdWNElDc2diV0Z5WjJsdUlDb2dLR2x1WkdWNElDMGdNU2s3WEhKY2JpQWdkbUZ5SUd4bFpuUWdQU0JqWlc1MFpYSllJQzBnZEdoMWJXSllPMXh5WEc1Y2NseHVJQ0F2THlCQmJtbHRZWFJsSUhSb1pTQjBhSFZ0WW01aGFXd2dZMjl1ZEdGcGJtVnlYSEpjYmlBZ2RHaHBjeTVmSkhSb2RXMWlibUZwYkVOdmJuUmhhVzVsY2k1MlpXeHZZMmwwZVNoY0luTjBiM0JjSWlrN1hISmNiaUFnZEdocGN5NWZKSFJvZFcxaWJtRnBiRU52Ym5SaGFXNWxjaTUyWld4dlkybDBlU2hjY2x4dUlDQWdJSHRjY2x4dUlDQWdJQ0FnYkdWbWREb2diR1ZtZENBcklGd2ljSGhjSWx4eVhHNGdJQ0FnZlN4Y2NseHVJQ0FnSURZd01DeGNjbHh1SUNBZ0lGd2laV0Z6WlVsdVQzVjBVWFZoWkZ3aVhISmNiaUFnS1R0Y2NseHVYSEpjYmlBZ2RHaHBjeTVmZFhCa1lYUmxWR2gxYldKdVlXbHNRMjl1ZEhKdmJITW9LVHRjY2x4dWZUdGNjbHh1WEhKY2JsUm9kVzFpYm1GcGJGTnNhV1JsY2k1d2NtOTBiM1I1Y0dVdVgyOXVRMnhwWTJzZ1BTQm1kVzVqZEdsdmJpaGxLU0I3WEhKY2JpQWdkbUZ5SUNSMFlYSm5aWFFnUFNBa0tHVXVkR0Z5WjJWMEtUdGNjbHh1SUNCMllYSWdhVzVrWlhnZ1BTQWtkR0Z5WjJWMExtUmhkR0VvWENKcGJtUmxlRndpS1R0Y2NseHVYSEpjYmlBZ0x5OGdRMnhwWTJ0bFpDQnZiaUIwYUdVZ1lXTjBhWFpsSUdsdFlXZGxJQzBnYm04Z2JtVmxaQ0IwYnlCa2J5QmhibmwwYUdsdVoxeHlYRzRnSUdsbUlDaDBhR2x6TGw5cGJtUmxlQ0FoUFQwZ2FXNWtaWGdwSUh0Y2NseHVJQ0FnSUhSb2FYTXVYMkZqZEdsMllYUmxWR2gxYldKdVlXbHNLR2x1WkdWNEtUdGNjbHh1SUNBZ0lIUm9hWE11WDNOamNtOXNiRlJ2VkdoMWJXSnVZV2xzS0dsdVpHVjRLVHRjY2x4dUlDQWdJSFJvYVhNdVgybHVaR1Y0SUQwZ2FXNWtaWGc3WEhKY2JpQWdJQ0IwYUdsekxsOXpiR2xrWlhOb2IzY3VjMmh2ZDBsdFlXZGxLR2x1WkdWNEtUdGNjbHh1SUNCOVhISmNibjA3WEhKY2JseHlYRzVVYUhWdFltNWhhV3hUYkdsa1pYSXVjSEp2ZEc5MGVYQmxMbDkxY0dSaGRHVlVhSFZ0WW01aGFXeERiMjUwY205c2N5QTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJQzh2SUZKbExXVnVZV0pzWlZ4eVhHNGdJSFJvYVhNdVh5UmhaSFpoYm1ObFRHVm1kQzV5WlcxdmRtVkRiR0Z6Y3loY0ltUnBjMkZpYkdWa1hDSXBPMXh5WEc0Z0lIUm9hWE11WHlSaFpIWmhibU5sVW1sbmFIUXVjbVZ0YjNabFEyeGhjM01vWENKa2FYTmhZbXhsWkZ3aUtUdGNjbHh1WEhKY2JpQWdMeThnUkdsellXSnNaU0JwWmlCM1pTZDJaU0J5WldGamFHVmtJSFJvWlNCMGFHVWdiV0Y0SUc5eUlHMXBiaUJzYVcxcGRGeHlYRzRnSUM4dklIWmhjaUJ0YVdSVFkzSnZiR3hKYm1SbGVDQTlJRTFoZEdndVpteHZiM0lvS0hSb2FYTXVYMjUxYlZacGMybGliR1VnTFNBeEtTQXZJRElwTzF4eVhHNGdJQzh2SUhaaGNpQnRhVzVUWTNKdmJHeEpibVJsZUNBOUlHMXBaRk5qY205c2JFbHVaR1Y0TzF4eVhHNGdJQzh2SUhaaGNpQnRZWGhUWTNKdmJHeEpibVJsZUNBOUlIUm9hWE11WDI1MWJVbHRZV2RsY3lBdElERWdMU0J0YVdSVFkzSnZiR3hKYm1SbGVEdGNjbHh1SUNCcFppQW9kR2hwY3k1ZmMyTnliMnhzU1c1a1pYZ2dQajBnZEdocGN5NWZjMk55YjJ4c1FtOTFibVJ6TG0xaGVDa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZkpHRmtkbUZ1WTJWU2FXZG9kQzVoWkdSRGJHRnpjeWhjSW1ScGMyRmliR1ZrWENJcE8xeHlYRzRnSUgwZ1pXeHpaU0JwWmlBb2RHaHBjeTVmYzJOeWIyeHNTVzVrWlhnZ1BEMGdkR2hwY3k1ZmMyTnliMnhzUW05MWJtUnpMbTFwYmlrZ2UxeHlYRzRnSUNBZ2RHaHBjeTVmSkdGa2RtRnVZMlZNWldaMExtRmtaRU5zWVhOektGd2laR2x6WVdKc1pXUmNJaWs3WEhKY2JpQWdmVnh5WEc1OU8xeHlYRzRpTENKbGVIQnZjblJ6TG1SbFptRjFiSFFnUFNCbWRXNWpkR2x2YmloMllXd3NJR1JsWm1GMWJIUldZV3dwSUh0Y2NseHVJQ0J5WlhSMWNtNGdkbUZzSUNFOVBTQjFibVJsWm1sdVpXUWdQeUIyWVd3Z09pQmtaV1poZFd4MFZtRnNPMXh5WEc1OU8xeHlYRzVjY2x4dUx5OGdWVzUwWlhOMFpXUmNjbHh1THk4Z1pYaHdiM0owY3k1a1pXWmhkV3gwVUhKdmNHVnlkR2xsY3lBOUlHWjFibU4wYVc5dUlHUmxabUYxYkhSUWNtOXdaWEowYVdWeklDaHZZbW9zSUhCeWIzQnpLU0I3WEhKY2JpOHZJQ0FnSUNCbWIzSWdLSFpoY2lCd2NtOXdJR2x1SUhCeWIzQnpLU0I3WEhKY2JpOHZJQ0FnSUNBZ0lDQWdhV1lnS0hCeWIzQnpMbWhoYzA5M2JsQnliM0JsY25SNUtIQnliM0J6TENCd2NtOXdLU2tnZTF4eVhHNHZMeUFnSUNBZ0lDQWdJQ0FnSUNCMllYSWdkbUZzZFdVZ1BTQmxlSEJ2Y25SekxtUmxabUYxYkhSV1lXeDFaU2h3Y205d2N5NTJZV3gxWlN3Z2NISnZjSE11WkdWbVlYVnNkQ2s3WEhKY2JpOHZJQ0FnSUNBZ0lDQWdJQ0FnSUc5aWFsdHdjbTl3WFNBOUlIWmhiSFZsTzF4eVhHNHZMeUFnSUNBZ0lDQWdJSDFjY2x4dUx5OGdJQ0FnSUgxY2NseHVMeThnSUNBZ0lISmxkSFZ5YmlCdlltbzdYSEpjYmk4dklIMDdYSEpjYmk4dlhISmNibVY0Y0c5eWRITXVkR2x0WlVsMElEMGdablZ1WTNScGIyNG9ablZ1WXlrZ2UxeHlYRzRnSUhaaGNpQnpkR0Z5ZENBOUlIQmxjbVp2Y20xaGJtTmxMbTV2ZHlncE8xeHlYRzRnSUdaMWJtTW9LVHRjY2x4dUlDQjJZWElnWlc1a0lEMGdjR1Z5Wm05eWJXRnVZMlV1Ym05M0tDazdYSEpjYmlBZ2NtVjBkWEp1SUdWdVpDQXRJSE4wWVhKME8xeHlYRzU5TzF4eVhHNWNjbHh1Wlhod2IzSjBjeTVwYzBsdVVtVmpkQ0E5SUdaMWJtTjBhVzl1S0hnc0lIa3NJSEpsWTNRcElIdGNjbHh1SUNCcFppQW9lQ0ErUFNCeVpXTjBMbmdnSmlZZ2VDQThQU0J5WldOMExuZ2dLeUJ5WldOMExuY2dKaVlnZVNBK1BTQnlaV04wTG5rZ0ppWWdlU0E4UFNCeVpXTjBMbmtnS3lCeVpXTjBMbWdwSUh0Y2NseHVJQ0FnSUhKbGRIVnliaUIwY25WbE8xeHlYRzRnSUgxY2NseHVJQ0J5WlhSMWNtNGdabUZzYzJVN1hISmNibjA3WEhKY2JseHlYRzVsZUhCdmNuUnpMbkpoYm1SSmJuUWdQU0JtZFc1amRHbHZiaWh0YVc0c0lHMWhlQ2tnZTF4eVhHNGdJSEpsZEhWeWJpQk5ZWFJvTG1ac2IyOXlLRTFoZEdndWNtRnVaRzl0S0NrZ0tpQW9iV0Y0SUMwZ2JXbHVJQ3NnTVNrcElDc2diV2x1TzF4eVhHNTlPMXh5WEc1Y2NseHVaWGh3YjNKMGN5NXlZVzVrUVhKeVlYbEZiR1Z0Wlc1MElEMGdablZ1WTNScGIyNG9ZWEp5WVhrcElIdGNjbHh1SUNCMllYSWdhU0E5SUdWNGNHOXlkSE11Y21GdVpFbHVkQ2d3TENCaGNuSmhlUzVzWlc1bmRHZ2dMU0F4S1R0Y2NseHVJQ0J5WlhSMWNtNGdZWEp5WVhsYmFWMDdYSEpjYm4wN1hISmNibHh5WEc1bGVIQnZjblJ6TG0xaGNDQTlJR1oxYm1OMGFXOXVLRzUxYlN3Z2JXbHVNU3dnYldGNE1Td2diV2x1TWl3Z2JXRjRNaXdnYjNCMGFXOXVjeWtnZTF4eVhHNGdJSFpoY2lCdFlYQndaV1FnUFNBb2JuVnRJQzBnYldsdU1Ta2dMeUFvYldGNE1TQXRJRzFwYmpFcElDb2dLRzFoZURJZ0xTQnRhVzR5S1NBcklHMXBiakk3WEhKY2JpQWdhV1lnS0NGdmNIUnBiMjV6S1NCeVpYUjFjbTRnYldGd2NHVmtPMXh5WEc0Z0lHbG1JQ2h2Y0hScGIyNXpMbkp2ZFc1a0lDWW1JRzl3ZEdsdmJuTXVjbTkxYm1RZ1BUMDlJSFJ5ZFdVcElIdGNjbHh1SUNBZ0lHMWhjSEJsWkNBOUlFMWhkR2d1Y205MWJtUW9iV0Z3Y0dWa0tUdGNjbHh1SUNCOVhISmNiaUFnYVdZZ0tHOXdkR2x2Ym5NdVpteHZiM0lnSmlZZ2IzQjBhVzl1Y3k1bWJHOXZjaUE5UFQwZ2RISjFaU2tnZTF4eVhHNGdJQ0FnYldGd2NHVmtJRDBnVFdGMGFDNW1iRzl2Y2lodFlYQndaV1FwTzF4eVhHNGdJSDFjY2x4dUlDQnBaaUFvYjNCMGFXOXVjeTVqWldsc0lDWW1JRzl3ZEdsdmJuTXVZMlZwYkNBOVBUMGdkSEoxWlNrZ2UxeHlYRzRnSUNBZ2JXRndjR1ZrSUQwZ1RXRjBhQzVqWldsc0tHMWhjSEJsWkNrN1hISmNiaUFnZlZ4eVhHNGdJR2xtSUNodmNIUnBiMjV6TG1Oc1lXMXdJQ1ltSUc5d2RHbHZibk11WTJ4aGJYQWdQVDA5SUhSeWRXVXBJSHRjY2x4dUlDQWdJRzFoY0hCbFpDQTlJRTFoZEdndWJXbHVLRzFoY0hCbFpDd2diV0Y0TWlrN1hISmNiaUFnSUNCdFlYQndaV1FnUFNCTllYUm9MbTFoZUNodFlYQndaV1FzSUcxcGJqSXBPMXh5WEc0Z0lIMWNjbHh1SUNCeVpYUjFjbTRnYldGd2NHVmtPMXh5WEc1OU8xeHlYRzVjY2x4dVpYaHdiM0owY3k1blpYUlJkV1Z5ZVZCaGNtRnRaWFJsY25NZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQXZMeUJEYUdWamF5Qm1iM0lnY1hWbGNua2djM1J5YVc1blhISmNiaUFnZG1GeUlIRnpJRDBnZDJsdVpHOTNMbXh2WTJGMGFXOXVMbk5sWVhKamFEdGNjbHh1SUNCcFppQW9jWE11YkdWdVozUm9JRHc5SURFcElISmxkSFZ5YmlCN2ZUdGNjbHh1SUNBdkx5QlJkV1Z5ZVNCemRISnBibWNnWlhocGMzUnpMQ0J3WVhKelpTQnBkQ0JwYm5SdklHRWdjWFZsY25rZ2IySnFaV04wWEhKY2JpQWdjWE1nUFNCeGN5NXpkV0p6ZEhKcGJtY29NU2s3SUM4dklGSmxiVzkyWlNCMGFHVWdYQ0kvWENJZ1pHVnNhVzFwZEdWeVhISmNiaUFnZG1GeUlHdGxlVlpoYkZCaGFYSnpJRDBnY1hNdWMzQnNhWFFvWENJbVhDSXBPMXh5WEc0Z0lIWmhjaUJ4ZFdWeWVVOWlhbVZqZENBOUlIdDlPMXh5WEc0Z0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2dhMlY1Vm1Gc1VHRnBjbk11YkdWdVozUm9PeUJwSUNzOUlERXBJSHRjY2x4dUlDQWdJSFpoY2lCclpYbFdZV3dnUFNCclpYbFdZV3hRWVdseWMxdHBYUzV6Y0d4cGRDaGNJajFjSWlrN1hISmNiaUFnSUNCcFppQW9hMlY1Vm1Gc0xteGxibWQwYUNBOVBUMGdNaWtnZTF4eVhHNGdJQ0FnSUNCMllYSWdhMlY1SUQwZ1pHVmpiMlJsVlZKSlEyOXRjRzl1Wlc1MEtHdGxlVlpoYkZzd1hTazdYSEpjYmlBZ0lDQWdJSFpoY2lCMllXd2dQU0JrWldOdlpHVlZVa2xEYjIxd2IyNWxiblFvYTJWNVZtRnNXekZkS1R0Y2NseHVJQ0FnSUNBZ2NYVmxjbmxQWW1wbFkzUmJhMlY1WFNBOUlIWmhiRHRjY2x4dUlDQWdJSDFjY2x4dUlDQjlYSEpjYmlBZ2NtVjBkWEp1SUhGMVpYSjVUMkpxWldOME8xeHlYRzU5TzF4eVhHNWNjbHh1Wlhod2IzSjBjeTVqY21WaGRHVlJkV1Z5ZVZOMGNtbHVaeUE5SUdaMWJtTjBhVzl1S0hGMVpYSjVUMkpxWldOMEtTQjdYSEpjYmlBZ2FXWWdLSFI1Y0dWdlppQnhkV1Z5ZVU5aWFtVmpkQ0FoUFQwZ1hDSnZZbXBsWTNSY0lpa2djbVYwZFhKdUlGd2lYQ0k3WEhKY2JpQWdkbUZ5SUd0bGVYTWdQU0JQWW1wbFkzUXVhMlY1Y3loeGRXVnllVTlpYW1WamRDazdYSEpjYmlBZ2FXWWdLR3RsZVhNdWJHVnVaM1JvSUQwOVBTQXdLU0J5WlhSMWNtNGdYQ0pjSWp0Y2NseHVJQ0IyWVhJZ2NYVmxjbmxUZEhKcGJtY2dQU0JjSWo5Y0lqdGNjbHh1SUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHdGxlWE11YkdWdVozUm9PeUJwSUNzOUlERXBJSHRjY2x4dUlDQWdJSFpoY2lCclpYa2dQU0JyWlhselcybGRPMXh5WEc0Z0lDQWdkbUZ5SUhaaGJDQTlJSEYxWlhKNVQySnFaV04wVzJ0bGVWMDdYSEpjYmlBZ0lDQnhkV1Z5ZVZOMGNtbHVaeUFyUFNCbGJtTnZaR1ZWVWtsRGIyMXdiMjVsYm5Rb2EyVjVLU0FySUZ3aVBWd2lJQ3NnWlc1amIyUmxWVkpKUTI5dGNHOXVaVzUwS0haaGJDazdYSEpjYmlBZ0lDQnBaaUFvYVNBaFBUMGdhMlY1Y3k1c1pXNW5kR2dnTFNBeEtTQnhkV1Z5ZVZOMGNtbHVaeUFyUFNCY0lpWmNJanRjY2x4dUlDQjlYSEpjYmlBZ2NtVjBkWEp1SUhGMVpYSjVVM1J5YVc1bk8xeHlYRzU5TzF4eVhHNWNjbHh1Wlhod2IzSjBjeTUzY21Gd1NXNWtaWGdnUFNCbWRXNWpkR2x2YmlocGJtUmxlQ3dnYkdWdVozUm9LU0I3WEhKY2JpQWdkbUZ5SUhkeVlYQndaV1JKYm1SbGVDQTlJR2x1WkdWNElDVWdiR1Z1WjNSb08xeHlYRzRnSUdsbUlDaDNjbUZ3Y0dWa1NXNWtaWGdnUENBd0tTQjdYSEpjYmlBZ0lDQXZMeUJKWmlCdVpXZGhkR2wyWlN3Z1pteHBjQ0IwYUdVZ2FXNWtaWGdnYzI4Z2RHaGhkQ0F0TVNCaVpXTnZiV1Z6SUhSb1pTQnNZWE4wSUdsMFpXMGdhVzRnYkdsemRGeHlYRzRnSUNBZ2QzSmhjSEJsWkVsdVpHVjRJRDBnYkdWdVozUm9JQ3NnZDNKaGNIQmxaRWx1WkdWNE8xeHlYRzRnSUgxY2NseHVJQ0J5WlhSMWNtNGdkM0poY0hCbFpFbHVaR1Y0TzF4eVhHNTlPMXh5WEc0aVhYMD0ifQ==
