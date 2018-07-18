(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*!
 * JavaScript Cookie v2.2.0
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

				if (!this.json && cookie.charAt(0) === '"') {
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
  } else if (url === "/blog.html") {
    this._activateLink(this._$navLinks.filter("#blog-link"));
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJub2RlX21vZHVsZXMvcDUtYmJveC1hbGlnbmVkLXRleHQvbGliL2Jib3gtYWxpZ25lZC10ZXh0LmpzIiwibm9kZV9tb2R1bGVzL3A1LWJib3gtYWxpZ25lZC10ZXh0L2xpYi91dGlscy5qcyIsInNyYy9qcy9ob3Zlci1zbGlkZXNob3cuanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvYmFzZS1sb2dvLXNrZXRjaC5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9jb25uZWN0LXBvaW50cy1za2V0Y2guanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvZ2VuZXJhdG9ycy9ub2lzZS1nZW5lcmF0b3JzLmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2dlbmVyYXRvcnMvc2luLWdlbmVyYXRvci5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9oYWxmdG9uZS1mbGFzaGxpZ2h0LXdvcmQuanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3Mvbm9pc3ktd29yZC1za2V0Y2guanMiLCJzcmMvanMvbWFpbi1uYXYuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9wYWdlLWxvYWRlci5qcyIsInNyYy9qcy9waWNrLXJhbmRvbS1za2V0Y2guanMiLCJzcmMvanMvcG9ydGZvbGlvLWZpbHRlci5qcyIsInNyYy9qcy90aHVtYm5haWwtc2xpZGVzaG93L3NsaWRlc2hvdy1tb2RhbC5qcyIsInNyYy9qcy90aHVtYm5haWwtc2xpZGVzaG93L3NsaWRlc2hvdy5qcyIsInNyYy9qcy90aHVtYm5haWwtc2xpZGVzaG93L3RodW1ibmFpbC1zbGlkZXIuanMiLCJzcmMvanMvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIi8qIVxuICogSmF2YVNjcmlwdCBDb29raWUgdjIuMi4wXG4gKiBodHRwczovL2dpdGh1Yi5jb20vanMtY29va2llL2pzLWNvb2tpZVxuICpcbiAqIENvcHlyaWdodCAyMDA2LCAyMDE1IEtsYXVzIEhhcnRsICYgRmFnbmVyIEJyYWNrXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuOyhmdW5jdGlvbiAoZmFjdG9yeSkge1xuXHR2YXIgcmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gZmFsc2U7XG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdFx0cmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gdHJ1ZTtcblx0fVxuXHRpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdFx0cmVnaXN0ZXJlZEluTW9kdWxlTG9hZGVyID0gdHJ1ZTtcblx0fVxuXHRpZiAoIXJlZ2lzdGVyZWRJbk1vZHVsZUxvYWRlcikge1xuXHRcdHZhciBPbGRDb29raWVzID0gd2luZG93LkNvb2tpZXM7XG5cdFx0dmFyIGFwaSA9IHdpbmRvdy5Db29raWVzID0gZmFjdG9yeSgpO1xuXHRcdGFwaS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0d2luZG93LkNvb2tpZXMgPSBPbGRDb29raWVzO1xuXHRcdFx0cmV0dXJuIGFwaTtcblx0XHR9O1xuXHR9XG59KGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gZXh0ZW5kICgpIHtcblx0XHR2YXIgaSA9IDA7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlcyA9IGFyZ3VtZW50c1sgaSBdO1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0cmVzdWx0W2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRmdW5jdGlvbiBpbml0IChjb252ZXJ0ZXIpIHtcblx0XHRmdW5jdGlvbiBhcGkgKGtleSwgdmFsdWUsIGF0dHJpYnV0ZXMpIHtcblx0XHRcdHZhciByZXN1bHQ7XG5cdFx0XHRpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFdyaXRlXG5cblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRhdHRyaWJ1dGVzID0gZXh0ZW5kKHtcblx0XHRcdFx0XHRwYXRoOiAnLydcblx0XHRcdFx0fSwgYXBpLmRlZmF1bHRzLCBhdHRyaWJ1dGVzKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0XHR2YXIgZXhwaXJlcyA9IG5ldyBEYXRlKCk7XG5cdFx0XHRcdFx0ZXhwaXJlcy5zZXRNaWxsaXNlY29uZHMoZXhwaXJlcy5nZXRNaWxsaXNlY29uZHMoKSArIGF0dHJpYnV0ZXMuZXhwaXJlcyAqIDg2NGUrNSk7XG5cdFx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gZXhwaXJlcztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFdlJ3JlIHVzaW5nIFwiZXhwaXJlc1wiIGJlY2F1c2UgXCJtYXgtYWdlXCIgaXMgbm90IHN1cHBvcnRlZCBieSBJRVxuXHRcdFx0XHRhdHRyaWJ1dGVzLmV4cGlyZXMgPSBhdHRyaWJ1dGVzLmV4cGlyZXMgPyBhdHRyaWJ1dGVzLmV4cGlyZXMudG9VVENTdHJpbmcoKSA6ICcnO1xuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuXHRcdFx0XHRcdGlmICgvXltcXHtcXFtdLy50ZXN0KHJlc3VsdCkpIHtcblx0XHRcdFx0XHRcdHZhbHVlID0gcmVzdWx0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblxuXHRcdFx0XHRpZiAoIWNvbnZlcnRlci53cml0ZSkge1xuXHRcdFx0XHRcdHZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnwzQXwzQ3wzRXwzRHwyRnwzRnw0MHw1Qnw1RHw1RXw2MHw3Qnw3RHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGNvbnZlcnRlci53cml0ZSh2YWx1ZSwga2V5KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGtleSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoa2V5KSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDVFfDYwfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvW1xcKFxcKV0vZywgZXNjYXBlKTtcblxuXHRcdFx0XHR2YXIgc3RyaW5naWZpZWRBdHRyaWJ1dGVzID0gJyc7XG5cblx0XHRcdFx0Zm9yICh2YXIgYXR0cmlidXRlTmFtZSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdFx0aWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc7ICcgKyBhdHRyaWJ1dGVOYW1lO1xuXHRcdFx0XHRcdGlmIChhdHRyaWJ1dGVzW2F0dHJpYnV0ZU5hbWVdID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c3RyaW5naWZpZWRBdHRyaWJ1dGVzICs9ICc9JyArIGF0dHJpYnV0ZXNbYXR0cmlidXRlTmFtZV07XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIChkb2N1bWVudC5jb29raWUgPSBrZXkgKyAnPScgKyB2YWx1ZSArIHN0cmluZ2lmaWVkQXR0cmlidXRlcyk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlYWRcblxuXHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0cmVzdWx0ID0ge307XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRvIHByZXZlbnQgdGhlIGZvciBsb29wIGluIHRoZSBmaXJzdCBwbGFjZSBhc3NpZ24gYW4gZW1wdHkgYXJyYXlcblx0XHRcdC8vIGluIGNhc2UgdGhlcmUgYXJlIG5vIGNvb2tpZXMgYXQgYWxsLiBBbHNvIHByZXZlbnRzIG9kZCByZXN1bHQgd2hlblxuXHRcdFx0Ly8gY2FsbGluZyBcImdldCgpXCJcblx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG5cdFx0XHR2YXIgcmRlY29kZSA9IC8oJVswLTlBLVpdezJ9KSsvZztcblx0XHRcdHZhciBpID0gMDtcblxuXHRcdFx0Zm9yICg7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBwYXJ0cyA9IGNvb2tpZXNbaV0uc3BsaXQoJz0nKTtcblx0XHRcdFx0dmFyIGNvb2tpZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oJz0nKTtcblxuXHRcdFx0XHRpZiAoIXRoaXMuanNvbiAmJiBjb29raWUuY2hhckF0KDApID09PSAnXCInKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llLnNsaWNlKDEsIC0xKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0dmFyIG5hbWUgPSBwYXJ0c1swXS5yZXBsYWNlKHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdFx0Y29va2llID0gY29udmVydGVyLnJlYWQgP1xuXHRcdFx0XHRcdFx0Y29udmVydGVyLnJlYWQoY29va2llLCBuYW1lKSA6IGNvbnZlcnRlcihjb29raWUsIG5hbWUpIHx8XG5cdFx0XHRcdFx0XHRjb29raWUucmVwbGFjZShyZGVjb2RlLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMuanNvbikge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Y29va2llID0gSlNPTi5wYXJzZShjb29raWUpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoa2V5ID09PSBuYW1lKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgPSBjb29raWU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIWtleSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0W25hbWVdID0gY29va2llO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cblx0XHRhcGkuc2V0ID0gYXBpO1xuXHRcdGFwaS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4gYXBpLmNhbGwoYXBpLCBrZXkpO1xuXHRcdH07XG5cdFx0YXBpLmdldEpTT04gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gYXBpLmFwcGx5KHtcblx0XHRcdFx0anNvbjogdHJ1ZVxuXHRcdFx0fSwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcblx0XHR9O1xuXHRcdGFwaS5kZWZhdWx0cyA9IHt9O1xuXG5cdFx0YXBpLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXksIGF0dHJpYnV0ZXMpIHtcblx0XHRcdGFwaShrZXksICcnLCBleHRlbmQoYXR0cmlidXRlcywge1xuXHRcdFx0XHRleHBpcmVzOiAtMVxuXHRcdFx0fSkpO1xuXHRcdH07XG5cblx0XHRhcGkud2l0aENvbnZlcnRlciA9IGluaXQ7XG5cblx0XHRyZXR1cm4gYXBpO1xuXHR9XG5cblx0cmV0dXJuIGluaXQoZnVuY3Rpb24gKCkge30pO1xufSkpO1xuIiwidmFyIHV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHMuanNcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJib3hBbGlnbmVkVGV4dDtcclxuXHJcbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IEJib3hBbGlnbmVkVGV4dCBvYmplY3QgLSBhIHRleHQgb2JqZWN0IHRoYXQgY2FuIGJlIGRyYXduIHdpdGhcclxuICogYW5jaG9yIHBvaW50cyBiYXNlZCBvbiBhIHRpZ2h0IGJvdW5kaW5nIGJveCBhcm91bmQgdGhlIHRleHQuXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge29iamVjdH0gZm9udCAtIHA1LkZvbnQgb2JqZWN0XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IC0gU3RyaW5nIHRvIGRpc3BsYXlcclxuICogQHBhcmFtIHtudW1iZXJ9IFtmb250U2l6ZT0xMl0gLSBGb250IHNpemUgdG8gdXNlIGZvciBzdHJpbmdcclxuICogQHBhcmFtIHtudW1iZXJ9IFt4PTBdIC0gSW5pdGlhbCB4IGxvY2F0aW9uXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeT0wXSAtIEluaXRpYWwgeSBsb2NhdGlvblxyXG4gKiBAcGFyYW0ge29iamVjdH0gW3BJbnN0YW5jZT13aW5kb3ddIC0gUmVmZXJlbmNlIHRvIHA1IGluc3RhbmNlLCBsZWF2ZSBibGFuayBpZlxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2tldGNoIGlzIGdsb2JhbFxyXG4gKiBAZXhhbXBsZVxyXG4gKiB2YXIgZm9udCwgYmJveFRleHQ7XHJcbiAqIGZ1bmN0aW9uIHByZWxvYWQoKSB7XHJcbiAqICAgICBmb250ID0gbG9hZEZvbnQoXCIuL2Fzc2V0cy9SZWd1bGFyLnR0ZlwiKTtcclxuICogfVxyXG4gKiBmdW5jdGlvbiBzZXR1cCgpIHtcclxuICogICAgIGNyZWF0ZUNhbnZhcyg0MDAsIDYwMCk7XHJcbiAqICAgICBiYWNrZ3JvdW5kKDApO1xyXG4gKiAgICAgXHJcbiAqICAgICBiYm94VGV4dCA9IG5ldyBCYm94QWxpZ25lZFRleHQoZm9udCwgXCJIZXkhXCIsIDMwKTsgICAgXHJcbiAqICAgICBiYm94VGV4dC5zZXRSb3RhdGlvbihQSSAvIDQpO1xyXG4gKiAgICAgYmJveFRleHQuc2V0QW5jaG9yKEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfQ0VOVEVSLCBcclxuICogICAgICAgICAgICAgICAgICAgICAgICBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUik7XHJcbiAqICAgICBcclxuICogICAgIGZpbGwoXCIjMDBBOEVBXCIpO1xyXG4gKiAgICAgbm9TdHJva2UoKTtcclxuICogICAgIGJib3hUZXh0LmRyYXcod2lkdGggLyAyLCBoZWlnaHQgLyAyKTtcclxuICogfVxyXG4gKi9cclxuZnVuY3Rpb24gQmJveEFsaWduZWRUZXh0KGZvbnQsIHRleHQsIGZvbnRTaXplLCB4LCB5LCBwSW5zdGFuY2UpIHtcclxuICAgIHRoaXMuX2ZvbnQgPSBmb250O1xyXG4gICAgdGhpcy5fdGV4dCA9IHRleHQ7XHJcbiAgICB0aGlzLl94ID0gdXRpbHMuZGVmYXVsdCh4LCAwKTtcclxuICAgIHRoaXMuX3kgPSB1dGlscy5kZWZhdWx0KHksIDApO1xyXG4gICAgdGhpcy5fZm9udFNpemUgPSB1dGlscy5kZWZhdWx0KGZvbnRTaXplLCAxMik7XHJcbiAgICB0aGlzLl9wID0gdXRpbHMuZGVmYXVsdChwSW5zdGFuY2UsIHdpbmRvdyk7XHJcbiAgICB0aGlzLl9yb3RhdGlvbiA9IDA7XHJcbiAgICB0aGlzLl9oQWxpZ24gPSBCYm94QWxpZ25lZFRleHQuQUxJR04uQk9YX0NFTlRFUjtcclxuICAgIHRoaXMuX3ZBbGlnbiA9IEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSO1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlTWV0cmljcyh0cnVlKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFZlcnRpY2FsIGFsaWdubWVudCB2YWx1ZXNcclxuICogQHB1YmxpY1xyXG4gKiBAc3RhdGljXHJcbiAqIEByZWFkb25seVxyXG4gKiBAZW51bSB7c3RyaW5nfVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LkFMSUdOID0ge1xyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgbGVmdCBvZiB0aGUgYmJveCAqL1xyXG4gICAgQk9YX0xFRlQ6IFwiYm94X2xlZnRcIixcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIGNlbnRlciBvZiB0aGUgYmJveCAqL1xyXG4gICAgQk9YX0NFTlRFUjogXCJib3hfY2VudGVyXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSByaWdodCBvZiB0aGUgYmJveCAqL1xyXG4gICAgQk9YX1JJR0hUOiBcImJveF9yaWdodFwiXHJcbn07XHJcblxyXG4vKipcclxuICogQmFzZWxpbmUgYWxpZ25tZW50IHZhbHVlc1xyXG4gKiBAcHVibGljXHJcbiAqIEBzdGF0aWNcclxuICogQHJlYWRvbmx5XHJcbiAqIEBlbnVtIHtzdHJpbmd9XHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQuQkFTRUxJTkUgPSB7XHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSB0b3Agb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9UT1A6IFwiYm94X3RvcFwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgY2VudGVyIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfQ0VOVEVSOiBcImJveF9jZW50ZXJcIixcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIGJvdHRvbSBvZiB0aGUgYmJveCAqL1xyXG4gICAgQk9YX0JPVFRPTTogXCJib3hfYm90dG9tXCIsXHJcbiAgICAvKiogXHJcbiAgICAgKiBEcmF3IGZyb20gaGFsZiB0aGUgaGVpZ2h0IG9mIHRoZSBmb250LiBTcGVjaWZpY2FsbHkgdGhlIGhlaWdodCBpc1xyXG4gICAgICogY2FsY3VsYXRlZCBhczogYXNjZW50ICsgZGVzY2VudC5cclxuICAgICAqL1xyXG4gICAgRk9OVF9DRU5URVI6IFwiZm9udF9jZW50ZXJcIixcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIHRoZSBub3JtYWwgZm9udCBiYXNlbGluZSAqL1xyXG4gICAgQUxQSEFCRVRJQzogXCJhbHBoYWJldGljXCJcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgY3VycmVudCB0ZXh0XHJcbiAqIEBwdWJsaWNcclxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIFRleHQgc3RyaW5nIHRvIGRpc3BsYXlcclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0VGV4dCA9IGZ1bmN0aW9uKHN0cmluZykge1xyXG4gICAgdGhpcy5fdGV4dCA9IHN0cmluZztcclxuICAgIHRoaXMuX2NhbGN1bGF0ZU1ldHJpY3MoZmFsc2UpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IHRoZSB0ZXh0IHBvc2l0aW9uXHJcbiAqIEBwdWJsaWNcclxuICogQHBhcmFtIHtudW1iZXJ9IHggLSBYIHBvc2l0aW9uXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gWSBwb3NpdGlvblxyXG4gKiBAcmV0dXJucyB7dGhpc30gVXNlZnVsIGZvciBjaGFpbmluZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICAgIHRoaXMuX3ggPSB1dGlscy5kZWZhdWx0KHgsIHRoaXMuX3gpO1xyXG4gICAgdGhpcy5feSA9IHV0aWxzLmRlZmF1bHQoeSwgdGhpcy5feSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIHRleHQgcG9zaXRpb25cclxuICogQHB1YmxpY1xyXG4gKiBAcmV0dXJuIHtvYmplY3R9IFJldHVybnMgYW4gb2JqZWN0IHdpdGggcHJvcGVydGllczogeCwgeVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiB0aGlzLl94LFxyXG4gICAgICAgIHk6IHRoaXMuX3lcclxuICAgIH07XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGN1cnJlbnQgdGV4dCBzaXplXHJcbiAqIEBwdWJsaWNcclxuICogQHBhcmFtIHtudW1iZXJ9IGZvbnRTaXplIFRleHQgc2l6ZVxyXG4gKiBAcmV0dXJucyB7dGhpc30gVXNlZnVsIGZvciBjaGFpbmluZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRUZXh0U2l6ZSA9IGZ1bmN0aW9uKGZvbnRTaXplKSB7XHJcbiAgICB0aGlzLl9mb250U2l6ZSA9IGZvbnRTaXplO1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlTWV0cmljcyh0cnVlKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCByb3RhdGlvbiBvZiB0ZXh0XHJcbiAqIEBwdWJsaWNcclxuICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gUm90YXRpb24gaW4gcmFkaWFuc1xyXG4gKiBAcmV0dXJucyB7dGhpc30gVXNlZnVsIGZvciBjaGFpbmluZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRSb3RhdGlvbiA9IGZ1bmN0aW9uKGFuZ2xlKSB7XHJcbiAgICB0aGlzLl9yb3RhdGlvbiA9IHV0aWxzLmRlZmF1bHQoYW5nbGUsIHRoaXMuX3JvdGF0aW9uKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCByb3RhdGlvbiBvZiB0ZXh0XHJcbiAqIEBwdWJsaWNcclxuICogQHJldHVybnMge251bWJlcn0gUm90YXRpb24gaW4gcmFkaWFuc1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRSb3RhdGlvbiA9IGZ1bmN0aW9uKGFuZ2xlKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcm90YXRpb247XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IHRoZSBwIGluc3RhbmNlIHRoYXQgaXMgdXNlZCBmb3IgZHJhd2luZ1xyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwIC0gSW5zdGFuY2Ugb2YgcDUgZm9yIGRyYXdpbmcuIFRoaXMgaXMgb25seSBuZWVkZWQgd2hlbiBcclxuICogICAgICAgICAgICAgICAgICAgICB1c2luZyBhbiBvZmZzY3JlZW4gcmVuZGVyZXIgb3Igd2hlbiB1c2luZyBwNSBpbiBpbnN0YW5jZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgIG1vZGUuXHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFBJbnN0YW5jZSA9IGZ1bmN0aW9uKHApIHtcclxuICAgIHRoaXMuX3AgPSB1dGlscy5kZWZhdWx0KHAsIHRoaXMuX3ApO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHJvdGF0aW9uIG9mIHRleHRcclxuICogQHB1YmxpY1xyXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBJbnN0YW5jZSBvZiBwNSB0aGF0IGlzIGJlaW5nIHVzZWQgZm9yIGRyYXdpbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0UEluc3RhbmNlID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgYW5jaG9yIHBvaW50IGZvciB0ZXh0IChob3Jpem9uYWwgYW5kIHZlcnRpY2FsIGFsaWdubWVudCkgcmVsYXRpdmUgdG9cclxuICogYm91bmRpbmcgYm94XHJcbiAqIEBwdWJsaWNcclxuICogQHBhcmFtIHtzdHJpbmd9IFtoQWxpZ249Q0VOVEVSXSAtIEhvcml6b25hbCBhbGlnbm1lbnRcclxuICogQHBhcmFtIHtzdHJpbmd9IFt2QWxpZ249Q0VOVEVSXSAtIFZlcnRpY2FsIGJhc2VsaW5lXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW3VwZGF0ZVBvc2l0aW9uPWZhbHNlXSAtIElmIHNldCB0byB0cnVlLCB0aGUgcG9zaXRpb24gb2YgdGhlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSB0ZXh0IHdpbGwgYmUgc2hpZnRlZCBzbyB0aGF0XHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZSB0ZXh0IHdpbGwgYmUgZHJhd24gaW4gdGhlIHNhbWVcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2UgaXQgd2FzIGJlZm9yZSBjYWxsaW5nIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZXRBbmNob3IuXHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldEFuY2hvciA9IGZ1bmN0aW9uKGhBbGlnbiwgdkFsaWduLCB1cGRhdGVQb3NpdGlvbikge1xyXG4gICAgdmFyIG9sZFBvcyA9IHRoaXMuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHModGhpcy5feCwgdGhpcy5feSk7XHJcbiAgICB0aGlzLl9oQWxpZ24gPSB1dGlscy5kZWZhdWx0KGhBbGlnbiwgQmJveEFsaWduZWRUZXh0LkFMSUdOLkNFTlRFUik7XHJcbiAgICB0aGlzLl92QWxpZ24gPSB1dGlscy5kZWZhdWx0KHZBbGlnbiwgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkNFTlRFUik7XHJcbiAgICBpZiAodXBkYXRlUG9zaXRpb24pIHtcclxuICAgICAgICB2YXIgbmV3UG9zID0gdGhpcy5fY2FsY3VsYXRlQWxpZ25lZENvb3Jkcyh0aGlzLl94LCB0aGlzLl95KTtcclxuICAgICAgICB0aGlzLl94ICs9IG9sZFBvcy54IC0gbmV3UG9zLng7XHJcbiAgICAgICAgdGhpcy5feSArPSBvbGRQb3MueSAtIG5ld1Bvcy55O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRoZSBib3VuZGluZyBib3ggd2hlbiB0aGUgdGV4dCBpcyBwbGFjZWQgYXQgdGhlIHNwZWNpZmllZCBjb29yZGluYXRlcy5cclxuICogTm90ZTogdGhpcyBpcyB0aGUgdW5yb3RhdGVkIGJvdW5kaW5nIGJveCEgVE9ETzogRml4IHRoaXMuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeD1jdXJyZW50IHhdIC0gQSBuZXcgeCBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbmVudGx5LiBcclxuICogQHBhcmFtIHtudW1iZXJ9IFt5PWN1cnJlbnQgeV0gLSBBIG5ldyB5IGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3IuIFRoaXNcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVybWFuZW50bHkuXHJcbiAqIEByZXR1cm4ge29iamVjdH0gUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzOiB4LCB5LCB3LCBoXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLmdldEJib3ggPSBmdW5jdGlvbih4LCB5KSB7XHJcbiAgICB0aGlzLnNldFBvc2l0aW9uKHgsIHkpO1xyXG4gICAgdmFyIHBvcyA9IHRoaXMuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHModGhpcy5feCwgdGhpcy5feSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHBvcy54ICsgdGhpcy5fYm91bmRzT2Zmc2V0LngsXHJcbiAgICAgICAgeTogcG9zLnkgKyB0aGlzLl9ib3VuZHNPZmZzZXQueSxcclxuICAgICAgICB3OiB0aGlzLndpZHRoLFxyXG4gICAgICAgIGg6IHRoaXMuaGVpZ2h0XHJcbiAgICB9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCBhbiBhcnJheSBvZiBwb2ludHMgdGhhdCBmb2xsb3cgYWxvbmcgdGhlIHRleHQgcGF0aC4gVGhpcyB3aWxsIHRha2UgaW50b1xyXG4gKiBjb25zaWRlcmF0aW9uIHRoZSBjdXJyZW50IGFsaWdubWVudCBzZXR0aW5ncy5cclxuICogTm90ZTogdGhpcyBpcyBhIHRoaW4gd3JhcHBlciBhcm91bmQgYSBwNSBtZXRob2QgYW5kIGRvZXNuJ3QgaGFuZGxlIHVucm90YXRlZFxyXG4gKiB0ZXh0ISBUT0RPOiBGaXggdGhpcy5cclxuICogQHBhcmFtIHtudW1iZXJ9IFt4PWN1cnJlbnQgeF0gLSBBIG5ldyB4IGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3IuIFRoaXNcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVybWFuZW50bHkuIFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3k9Y3VycmVudCB5XSAtIEEgbmV3IHkgY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpc1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbGwgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJtYW5lbnRseS5cclxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAtIEFuIG9iamVjdCB0aGF0IGNhbiBoYXZlOlxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHNhbXBsZUZhY3RvcjogcmF0aW8gb2YgcGF0aC1sZW5ndGggdG8gbnVtYmVyXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2Ygc2FtcGxlcyAoZGVmYXVsdD0wLjI1KS4gSGlnaGVyIHZhbHVlcyBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB5aWVsZCBtb3JlcG9pbnRzIGFuZCBhcmUgdGhlcmVmb3JlIG1vcmUgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlY2lzZS4gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gc2ltcGxpZnlUaHJlc2hvbGQ6IGlmIHNldCB0byBhIG5vbi16ZXJvIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLCBjb2xsaW5lYXIgcG9pbnRzIHdpbGwgYmUgcmVtb3ZlZC4gVGhlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgcmVwcmVzZW50cyB0aGUgdGhyZXNob2xkIGFuZ2xlIHRvIHVzZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdoZW4gZGV0ZXJtaW5pbmcgd2hldGhlciB0d28gZWRnZXMgYXJlIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxpbmVhci5cclxuICogQHJldHVybiB7YXJyYXl9IEFuIGFycmF5IG9mIHBvaW50cywgZWFjaCB3aXRoIHgsIHkgJiBhbHBoYSAodGhlIHBhdGggYW5nbGUpXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLmdldFRleHRQb2ludHMgPSBmdW5jdGlvbih4LCB5LCBvcHRpb25zKSB7XHJcbiAgICB0aGlzLnNldFBvc2l0aW9uKHgsIHkpO1xyXG4gICAgdmFyIHBvaW50cyA9IHRoaXMuX2ZvbnQudGV4dFRvUG9pbnRzKHRoaXMuX3RleHQsIHRoaXMuX3gsIHRoaXMuX3ksIFxyXG4gICAgICAgIHRoaXMuX2ZvbnRTaXplLCBvcHRpb25zKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHMocG9pbnRzW2ldLngsIHBvaW50c1tpXS55KTtcclxuICAgICAgICBwb2ludHNbaV0ueCA9IHBvcy54O1xyXG4gICAgICAgIHBvaW50c1tpXS55ID0gcG9zLnk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcG9pbnRzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERyYXdzIHRoZSB0ZXh0IHBhcnRpY2xlIHdpdGggdGhlIHNwZWNpZmllZCBzdHlsZSBwYXJhbWV0ZXJzLiBOb3RlOiB0aGlzIGlzXHJcbiAqIGdvaW5nIHRvIHNldCB0aGUgdGV4dEZvbnQsIHRleHRTaXplICYgcm90YXRpb24gYmVmb3JlIGRyYXdpbmcuIFlvdSBzaG91bGQgc2V0XHJcbiAqIHRoZSBjb2xvci9zdHJva2UvZmlsbCB0aGF0IHlvdSB3YW50IGJlZm9yZSBkcmF3aW5nLiBUaGlzIGZ1bmN0aW9uIHdpbGwgY2xlYW5cclxuICogdXAgYWZ0ZXIgaXRzZWxmIGFuZCByZXNldCBzdHlsaW5nIGJhY2sgdG8gd2hhdCBpdCB3YXMgYmVmb3JlIGl0IHdhcyBjYWxsZWQuXHJcbiAqIEBwdWJsaWNcclxuICogQHBhcmFtIHtudW1iZXJ9IFt4PWN1cnJlbnQgeF0gLSBBIG5ldyB4IGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3IuIFRoaXMgd2lsbFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBwZXJtYW5lbnRseS4gXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeT1jdXJyZW50IHldIC0gQSBuZXcgeSBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzIHdpbGxcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIHBlcm1hbmVudGx5LlxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFtkcmF3Qm91bmRzPWZhbHNlXSAtIEZsYWcgZm9yIGRyYXdpbmcgYm91bmRpbmcgYm94XHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbih4LCB5LCBkcmF3Qm91bmRzKSB7XHJcbiAgICBkcmF3Qm91bmRzID0gdXRpbHMuZGVmYXVsdChkcmF3Qm91bmRzLCBmYWxzZSk7XHJcbiAgICB0aGlzLnNldFBvc2l0aW9uKHgsIHkpO1xyXG4gICAgdmFyIHBvcyA9IHtcclxuICAgICAgICB4OiB0aGlzLl94LCBcclxuICAgICAgICB5OiB0aGlzLl95XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX3AucHVzaCgpO1xyXG5cclxuICAgICAgICBpZiAodGhpcy5fcm90YXRpb24pIHtcclxuICAgICAgICAgICAgcG9zID0gdGhpcy5fY2FsY3VsYXRlUm90YXRlZENvb3Jkcyhwb3MueCwgcG9zLnksIHRoaXMuX3JvdGF0aW9uKTtcclxuICAgICAgICAgICAgdGhpcy5fcC5yb3RhdGUodGhpcy5fcm90YXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcG9zID0gdGhpcy5fY2FsY3VsYXRlQWxpZ25lZENvb3Jkcyhwb3MueCwgcG9zLnkpO1xyXG5cclxuICAgICAgICB0aGlzLl9wLnRleHRBbGlnbih0aGlzLl9wLkxFRlQsIHRoaXMuX3AuQkFTRUxJTkUpO1xyXG4gICAgICAgIHRoaXMuX3AudGV4dEZvbnQodGhpcy5fZm9udCk7XHJcbiAgICAgICAgdGhpcy5fcC50ZXh0U2l6ZSh0aGlzLl9mb250U2l6ZSk7XHJcbiAgICAgICAgdGhpcy5fcC50ZXh0KHRoaXMuX3RleHQsIHBvcy54LCBwb3MueSk7XHJcblxyXG4gICAgICAgIGlmIChkcmF3Qm91bmRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Auc3Ryb2tlKDIwMCk7XHJcbiAgICAgICAgICAgIHZhciBib3VuZHNYID0gcG9zLnggKyB0aGlzLl9ib3VuZHNPZmZzZXQueDtcclxuICAgICAgICAgICAgdmFyIGJvdW5kc1kgPSBwb3MueSArIHRoaXMuX2JvdW5kc09mZnNldC55O1xyXG4gICAgICAgICAgICB0aGlzLl9wLm5vRmlsbCgpO1xyXG4gICAgICAgICAgICB0aGlzLl9wLnJlY3QoYm91bmRzWCwgYm91bmRzWSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB0aGlzLl9wLnBvcCgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFByb2plY3QgdGhlIGNvb3JkaW5hdGVzICh4LCB5KSBpbnRvIGEgcm90YXRlZCBjb29yZGluYXRlIHN5c3RlbVxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0geCAtIFggY29vcmRpbmF0ZSAoaW4gdW5yb3RhdGVkIHNwYWNlKVxyXG4gKiBAcGFyYW0ge251bWJlcn0geSAtIFkgY29vcmRpbmF0ZSAoaW4gdW5yb3RhdGVkIHNwYWNlKVxyXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBSYWRpYW5zIG9mIHJvdGF0aW9uIHRvIGFwcGx5XHJcbiAqIEByZXR1cm4ge29iamVjdH0gT2JqZWN0IHdpdGggeCAmIHkgcHJvcGVydGllc1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5fY2FsY3VsYXRlUm90YXRlZENvb3JkcyA9IGZ1bmN0aW9uICh4LCB5LCBhbmdsZSkgeyAgXHJcbiAgICB2YXIgcnggPSBNYXRoLmNvcyhhbmdsZSkgKiB4ICsgTWF0aC5jb3MoTWF0aC5QSSAvIDIgLSBhbmdsZSkgKiB5O1xyXG4gICAgdmFyIHJ5ID0gLU1hdGguc2luKGFuZ2xlKSAqIHggKyBNYXRoLnNpbihNYXRoLlBJIC8gMiAtIGFuZ2xlKSAqIHk7XHJcbiAgICByZXR1cm4ge3g6IHJ4LCB5OiByeX07XHJcbn07XHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyBkcmF3IGNvb3JkaW5hdGVzIGZvciB0aGUgdGV4dCwgYWxpZ25pbmcgYmFzZWQgb24gdGhlIGJvdW5kaW5nIGJveC5cclxuICogVGhlIHRleHQgaXMgZXZlbnR1YWxseSBkcmF3biB3aXRoIGNhbnZhcyBhbGlnbm1lbnQgc2V0IHRvIGxlZnQgJiBiYXNlbGluZSwgc29cclxuICogdGhpcyBmdW5jdGlvbiB0YWtlcyBhIGRlc2lyZWQgcG9zICYgYWxpZ25tZW50IGFuZCByZXR1cm5zIHRoZSBhcHByb3ByaWF0ZVxyXG4gKiBjb29yZGluYXRlcyBmb3IgdGhlIGxlZnQgJiBiYXNlbGluZS5cclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtudW1iZXJ9IHggLSBYIGNvb3JkaW5hdGVcclxuICogQHBhcmFtIHtudW1iZXJ9IHkgLSBZIGNvb3JkaW5hdGVcclxuICogQHJldHVybiB7b2JqZWN0fSBPYmplY3Qgd2l0aCB4ICYgeSBwcm9wZXJ0aWVzXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzID0gZnVuY3Rpb24oeCwgeSkge1xyXG4gICAgdmFyIG5ld1gsIG5ld1k7XHJcbiAgICBzd2l0Y2ggKHRoaXMuX2hBbGlnbikge1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9MRUZUOlxyXG4gICAgICAgICAgICBuZXdYID0geDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQUxJR04uQk9YX0NFTlRFUjpcclxuICAgICAgICAgICAgbmV3WCA9IHggLSB0aGlzLmhhbGZXaWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQUxJR04uQk9YX1JJR0hUOlxyXG4gICAgICAgICAgICBuZXdYID0geCAtIHRoaXMud2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4O1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVucmVjb2duaXplZCBob3Jpem9uYWwgYWxpZ246XCIsIHRoaXMuX2hBbGlnbik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgc3dpdGNoICh0aGlzLl92QWxpZ24pIHtcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5CT1hfVE9QOlxyXG4gICAgICAgICAgICBuZXdZID0geSAtIHRoaXMuX2JvdW5kc09mZnNldC55O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSOlxyXG4gICAgICAgICAgICBuZXdZID0geSArIHRoaXMuX2Rpc3RCYXNlVG9NaWQ7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9CT1RUT006XHJcbiAgICAgICAgICAgIG5ld1kgPSB5IC0gdGhpcy5fZGlzdEJhc2VUb0JvdHRvbTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuRk9OVF9DRU5URVI6XHJcbiAgICAgICAgICAgIC8vIEhlaWdodCBpcyBhcHByb3hpbWF0ZWQgYXMgYXNjZW50ICsgZGVzY2VudFxyXG4gICAgICAgICAgICBuZXdZID0geSAtIHRoaXMuX2Rlc2NlbnQgKyAodGhpcy5fYXNjZW50ICsgdGhpcy5fZGVzY2VudCkgLyAyO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5BTFBIQUJFVElDOlxyXG4gICAgICAgICAgICBuZXdZID0geTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgbmV3WSA9IHk7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5yZWNvZ25pemVkIHZlcnRpY2FsIGFsaWduOlwiLCB0aGlzLl92QWxpZ24pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHJldHVybiB7eDogbmV3WCwgeTogbmV3WX07XHJcbn07XHJcblxyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgYm91bmRpbmcgYm94IGFuZCB2YXJpb3VzIG1ldHJpY3MgZm9yIHRoZSBjdXJyZW50IHRleHQgYW5kIGZvbnRcclxuICogQHByaXZhdGVcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuX2NhbGN1bGF0ZU1ldHJpY3MgPSBmdW5jdGlvbihzaG91bGRVcGRhdGVIZWlnaHQpIHsgIFxyXG4gICAgLy8gcDUgMC41LjAgaGFzIGEgYnVnIC0gdGV4dCBib3VuZHMgYXJlIGNsaXBwZWQgYnkgKDAsIDApXHJcbiAgICAvLyBDYWxjdWxhdGluZyBib3VuZHMgaGFja1xyXG4gICAgdmFyIGJvdW5kcyA9IHRoaXMuX2ZvbnQudGV4dEJvdW5kcyh0aGlzLl90ZXh0LCAxMDAwLCAxMDAwLCB0aGlzLl9mb250U2l6ZSk7XHJcbiAgICAvLyBCb3VuZHMgaXMgYSByZWZlcmVuY2UgLSBpZiB3ZSBtZXNzIHdpdGggaXQgZGlyZWN0bHksIHdlIGNhbiBtZXNzIHVwIFxyXG4gICAgLy8gZnV0dXJlIHZhbHVlcyEgKEl0IGNoYW5nZXMgdGhlIGJib3ggY2FjaGUgaW4gcDUuKVxyXG4gICAgYm91bmRzID0geyBcclxuICAgICAgICB4OiBib3VuZHMueCAtIDEwMDAsIFxyXG4gICAgICAgIHk6IGJvdW5kcy55IC0gMTAwMCwgXHJcbiAgICAgICAgdzogYm91bmRzLncsIFxyXG4gICAgICAgIGg6IGJvdW5kcy5oIFxyXG4gICAgfTsgXHJcblxyXG4gICAgaWYgKHNob3VsZFVwZGF0ZUhlaWdodCkge1xyXG4gICAgICAgIHRoaXMuX2FzY2VudCA9IHRoaXMuX2ZvbnQuX3RleHRBc2NlbnQodGhpcy5fZm9udFNpemUpO1xyXG4gICAgICAgIHRoaXMuX2Rlc2NlbnQgPSB0aGlzLl9mb250Ll90ZXh0RGVzY2VudCh0aGlzLl9mb250U2l6ZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVXNlIGJvdW5kcyB0byBjYWxjdWxhdGUgZm9udCBtZXRyaWNzXHJcbiAgICB0aGlzLndpZHRoID0gYm91bmRzLnc7XHJcbiAgICB0aGlzLmhlaWdodCA9IGJvdW5kcy5oO1xyXG4gICAgdGhpcy5oYWxmV2lkdGggPSB0aGlzLndpZHRoIC8gMjtcclxuICAgIHRoaXMuaGFsZkhlaWdodCA9IHRoaXMuaGVpZ2h0IC8gMjtcclxuICAgIHRoaXMuX2JvdW5kc09mZnNldCA9IHsgeDogYm91bmRzLngsIHk6IGJvdW5kcy55IH07XHJcbiAgICB0aGlzLl9kaXN0QmFzZVRvTWlkID0gTWF0aC5hYnMoYm91bmRzLnkpIC0gdGhpcy5oYWxmSGVpZ2h0O1xyXG4gICAgdGhpcy5fZGlzdEJhc2VUb0JvdHRvbSA9IHRoaXMuaGVpZ2h0IC0gTWF0aC5hYnMoYm91bmRzLnkpO1xyXG59OyIsImV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uKHZhbHVlLCBkZWZhdWx0VmFsdWUpIHtcclxuICAgIHJldHVybiAodmFsdWUgIT09IHVuZGVmaW5lZCkgPyB2YWx1ZSA6IGRlZmF1bHRWYWx1ZTtcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IEhvdmVyU2xpZGVzaG93cztcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBIb3ZlclNsaWRlc2hvd3Moc2xpZGVzaG93RGVsYXksIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gIHRoaXMuX3NsaWRlc2hvd0RlbGF5ID0gc2xpZGVzaG93RGVsYXkgIT09IHVuZGVmaW5lZCA/IHNsaWRlc2hvd0RlbGF5IDogMjAwMDtcclxuICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb24gIT09IHVuZGVmaW5lZCA/IHRyYW5zaXRpb25EdXJhdGlvbiA6IDEwMDA7XHJcblxyXG4gIHRoaXMuX3NsaWRlc2hvd3MgPSBbXTtcclxuICB0aGlzLnJlbG9hZCgpO1xyXG59XHJcblxyXG5Ib3ZlclNsaWRlc2hvd3MucHJvdG90eXBlLnJlbG9hZCA9IGZ1bmN0aW9uKCkge1xyXG4gIC8vIE5vdGU6IHRoaXMgaXMgY3VycmVudGx5IG5vdCByZWFsbHkgYmVpbmcgdXNlZC4gV2hlbiBhIHBhZ2UgaXMgbG9hZGVkLFxyXG4gIC8vIG1haW4uanMgaXMganVzdCByZS1pbnN0YW5jaW5nIHRoZSBIb3ZlclNsaWRlc2hvd3NcclxuICB2YXIgb2xkU2xpZGVzaG93cyA9IHRoaXMuX3NsaWRlc2hvd3MgfHwgW107XHJcbiAgdGhpcy5fc2xpZGVzaG93cyA9IFtdO1xyXG4gICQoXCIuaG92ZXItc2xpZGVzaG93XCIpLmVhY2goXHJcbiAgICBmdW5jdGlvbihfLCBlbGVtZW50KSB7XHJcbiAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XHJcbiAgICAgIHZhciBpbmRleCA9IHRoaXMuX2ZpbmRJblNsaWRlc2hvd3MoZWxlbWVudCwgb2xkU2xpZGVzaG93cyk7XHJcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICB2YXIgc2xpZGVzaG93ID0gb2xkU2xpZGVzaG93cy5zcGxpY2UoaW5kZXgsIDEpWzBdO1xyXG4gICAgICAgIHRoaXMuX3NsaWRlc2hvd3MucHVzaChzbGlkZXNob3cpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuX3NsaWRlc2hvd3MucHVzaChcclxuICAgICAgICAgIG5ldyBTbGlkZXNob3coJGVsZW1lbnQsIHRoaXMuX3NsaWRlc2hvd0RlbGF5LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24pXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxufTtcclxuXHJcbkhvdmVyU2xpZGVzaG93cy5wcm90b3R5cGUuX2ZpbmRJblNsaWRlc2hvd3MgPSBmdW5jdGlvbihlbGVtZW50LCBzbGlkZXNob3dzKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXNob3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICBpZiAoZWxlbWVudCA9PT0gc2xpZGVzaG93c1tpXS5nZXRFbGVtZW50KCkpIHtcclxuICAgICAgcmV0dXJuIGk7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiAtMTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIFNsaWRlc2hvdygkY29udGFpbmVyLCBzbGlkZXNob3dEZWxheSwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgdGhpcy5fJGNvbnRhaW5lciA9ICRjb250YWluZXI7XHJcbiAgdGhpcy5fc2xpZGVzaG93RGVsYXkgPSBzbGlkZXNob3dEZWxheTtcclxuICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb247XHJcbiAgdGhpcy5fdGltZW91dElkID0gbnVsbDtcclxuICB0aGlzLl9pbWFnZUluZGV4ID0gMDtcclxuICB0aGlzLl8kaW1hZ2VzID0gW107XHJcblxyXG4gIC8vIFNldCB1cCBhbmQgY2FjaGUgcmVmZXJlbmNlcyB0byBpbWFnZXNcclxuICB0aGlzLl8kY29udGFpbmVyLmZpbmQoXCJpbWdcIikuZWFjaChcclxuICAgIGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgIHZhciAkaW1hZ2UgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAkaW1hZ2UuY3NzKHtcclxuICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgIHRvcDogXCIwXCIsXHJcbiAgICAgICAgbGVmdDogXCIwXCIsXHJcbiAgICAgICAgekluZGV4OiBpbmRleCA9PT0gMCA/IDIgOiAwIC8vIEZpcnN0IGltYWdlIHNob3VsZCBiZSBvbiB0b3BcclxuICAgICAgfSk7XHJcbiAgICAgIHRoaXMuXyRpbWFnZXMucHVzaCgkaW1hZ2UpO1xyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxuXHJcbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdG8gYmluZCBpbnRlcmFjdGl2aXR5XHJcbiAgdGhpcy5fbnVtSW1hZ2VzID0gdGhpcy5fJGltYWdlcy5sZW5ndGg7XHJcbiAgaWYgKHRoaXMuX251bUltYWdlcyA8PSAxKSByZXR1cm47XHJcblxyXG4gIC8vIEJpbmQgZXZlbnQgbGlzdGVuZXJzXHJcbiAgdGhpcy5fJGNvbnRhaW5lci5vbihcIm1vdXNlZW50ZXJcIiwgdGhpcy5fb25FbnRlci5iaW5kKHRoaXMpKTtcclxuICB0aGlzLl8kY29udGFpbmVyLm9uKFwibW91c2VsZWF2ZVwiLCB0aGlzLl9vbkxlYXZlLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldEVsZW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5fJGNvbnRhaW5lci5nZXQoMCk7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldCRFbGVtZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMuXyRjb250YWluZXI7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLl9vbkVudGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gRmlyc3QgdHJhbnNpdGlvbiBzaG91bGQgaGFwcGVuIHByZXR0eSBzb29uIGFmdGVyIGhvdmVyaW5nIGluIG9yZGVyXHJcbiAgLy8gdG8gY2x1ZSB0aGUgdXNlciBpbnRvIHdoYXQgaXMgaGFwcGVuaW5nXHJcbiAgdGhpcy5fdGltZW91dElkID0gc2V0VGltZW91dCh0aGlzLl9hZHZhbmNlU2xpZGVzaG93LmJpbmQodGhpcyksIDUwMCk7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLl9vbkxlYXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgY2xlYXJJbnRlcnZhbCh0aGlzLl90aW1lb3V0SWQpO1xyXG4gIHRoaXMuX3RpbWVvdXRJZCA9IG51bGw7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLl9hZHZhbmNlU2xpZGVzaG93ID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5faW1hZ2VJbmRleCArPSAxO1xyXG4gIHZhciBpO1xyXG5cclxuICAvLyBNb3ZlIHRoZSBpbWFnZSBmcm9tIDIgc3RlcHMgYWdvIGRvd24gdG8gdGhlIGJvdHRvbSB6LWluZGV4IGFuZCBtYWtlXHJcbiAgLy8gaXQgaW52aXNpYmxlXHJcbiAgaWYgKHRoaXMuX251bUltYWdlcyA+PSAzKSB7XHJcbiAgICBpID0gdXRpbGl0aWVzLndyYXBJbmRleCh0aGlzLl9pbWFnZUluZGV4IC0gMiwgdGhpcy5fbnVtSW1hZ2VzKTtcclxuICAgIHRoaXMuXyRpbWFnZXNbaV0uY3NzKHtcclxuICAgICAgekluZGV4OiAwLFxyXG4gICAgICBvcGFjaXR5OiAwXHJcbiAgICB9KTtcclxuICAgIHRoaXMuXyRpbWFnZXNbaV0udmVsb2NpdHkoXCJzdG9wXCIpO1xyXG4gIH1cclxuXHJcbiAgLy8gTW92ZSB0aGUgaW1hZ2UgZnJvbSAxIHN0ZXBzIGFnbyBkb3duIHRvIHRoZSBtaWRkbGUgei1pbmRleCBhbmQgbWFrZVxyXG4gIC8vIGl0IGNvbXBsZXRlbHkgdmlzaWJsZVxyXG4gIGlmICh0aGlzLl9udW1JbWFnZXMgPj0gMikge1xyXG4gICAgaSA9IHV0aWxpdGllcy53cmFwSW5kZXgodGhpcy5faW1hZ2VJbmRleCAtIDEsIHRoaXMuX251bUltYWdlcyk7XHJcbiAgICB0aGlzLl8kaW1hZ2VzW2ldLmNzcyh7XHJcbiAgICAgIHpJbmRleDogMSxcclxuICAgICAgb3BhY2l0eTogMVxyXG4gICAgfSk7XHJcbiAgICB0aGlzLl8kaW1hZ2VzW2ldLnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICB9XHJcblxyXG4gIC8vIE1vdmUgdGhlIGN1cnJlbnQgaW1hZ2UgdG8gdGhlIHRvcCB6LWluZGV4IGFuZCBmYWRlIGl0IGluXHJcbiAgdGhpcy5faW1hZ2VJbmRleCA9IHV0aWxpdGllcy53cmFwSW5kZXgodGhpcy5faW1hZ2VJbmRleCwgdGhpcy5fbnVtSW1hZ2VzKTtcclxuICB0aGlzLl8kaW1hZ2VzW3RoaXMuX2ltYWdlSW5kZXhdLmNzcyh7XHJcbiAgICB6SW5kZXg6IDIsXHJcbiAgICBvcGFjaXR5OiAwXHJcbiAgfSk7XHJcbiAgdGhpcy5fJGltYWdlc1t0aGlzLl9pbWFnZUluZGV4XS52ZWxvY2l0eShcclxuICAgIHtcclxuICAgICAgb3BhY2l0eTogMVxyXG4gICAgfSxcclxuICAgIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbixcclxuICAgIFwiZWFzZUluT3V0UXVhZFwiXHJcbiAgKTtcclxuXHJcbiAgLy8gU2NoZWR1bGUgbmV4dCB0cmFuc2l0aW9uXHJcbiAgdGhpcy5fdGltZW91dElkID0gc2V0VGltZW91dCh0aGlzLl9hZHZhbmNlU2xpZGVzaG93LmJpbmQodGhpcyksIHRoaXMuX3NsaWRlc2hvd0RlbGF5KTtcclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBCYXNlTG9nb1NrZXRjaDtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBCYXNlTG9nb1NrZXRjaCgkbmF2LCAkbmF2TG9nbywgZm9udFBhdGgpIHtcclxuICB0aGlzLl8kbmF2ID0gJG5hdjtcclxuICB0aGlzLl8kbmF2TG9nbyA9ICRuYXZMb2dvO1xyXG4gIHRoaXMuX2ZvbnRQYXRoID0gZm9udFBhdGg7XHJcblxyXG4gIHRoaXMuX3RleHQgPSB0aGlzLl8kbmF2TG9nby50ZXh0KCk7XHJcbiAgdGhpcy5faXNGaXJzdEZyYW1lID0gdHJ1ZTtcclxuICB0aGlzLl9pc01vdXNlT3ZlciA9IGZhbHNlO1xyXG4gIHRoaXMuX2lzT3Zlck5hdkxvZ28gPSBmYWxzZTtcclxuXHJcbiAgdGhpcy5fdXBkYXRlVGV4dE9mZnNldCgpO1xyXG4gIHRoaXMuX3VwZGF0ZVNpemUoKTtcclxuICB0aGlzLl91cGRhdGVGb250U2l6ZSgpO1xyXG5cclxuICAvLyBDcmVhdGUgYSAocmVsYXRpdmUgcG9zaXRpb25lZCkgY29udGFpbmVyIGZvciB0aGUgc2tldGNoIGluc2lkZSBvZiB0aGVcclxuICAvLyBuYXYsIGJ1dCBtYWtlIHN1cmUgdGhhdCBpdCBpcyBCRUhJTkQgZXZlcnl0aGluZyBlbHNlLiBFdmVudHVhbGx5LCB3ZSB3aWxsXHJcbiAgLy8gZHJvcCBqdXN0IHRoZSBuYXYgbG9nbyAobm90IHRoZSBuYXYgbGlua3MhKSBiZWhpbmQgdGhlIGNhbnZhcy5cclxuICB0aGlzLl8kY29udGFpbmVyID0gJChcIjxkaXY+XCIpXHJcbiAgICAuY3NzKHtcclxuICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgdG9wOiBcIjBweFwiLFxyXG4gICAgICBsZWZ0OiBcIjBweFwiXHJcbiAgICB9KVxyXG4gICAgLnByZXBlbmRUbyh0aGlzLl8kbmF2KVxyXG4gICAgLmhpZGUoKTtcclxuXHJcbiAgdGhpcy5fY3JlYXRlUDVJbnN0YW5jZSgpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgbmV3IHA1IGluc3RhbmNlIGFuZCBiaW5kIHRoZSBhcHByb3ByaWF0ZSBjbGFzcyBtZXRob2RzIHRvIHRoZVxyXG4gKiBpbnN0YW5jZS4gVGhpcyBhbHNvIGZpbGxzIGluIHRoZSBwIHBhcmFtZXRlciBvbiB0aGUgY2xhc3MgbWV0aG9kcyAoc2V0dXAsXHJcbiAqIGRyYXcsIGV0Yy4pIHNvIHRoYXQgdGhvc2UgZnVuY3Rpb25zIGNhbiBiZSBhIGxpdHRsZSBsZXNzIHZlcmJvc2UgOilcclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fY3JlYXRlUDVJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xyXG4gIG5ldyBwNShcclxuICAgIGZ1bmN0aW9uKHApIHtcclxuICAgICAgdGhpcy5fcCA9IHA7XHJcbiAgICAgIHAucHJlbG9hZCA9IHRoaXMuX3ByZWxvYWQuYmluZCh0aGlzLCBwKTtcclxuICAgICAgcC5zZXR1cCA9IHRoaXMuX3NldHVwLmJpbmQodGhpcywgcCk7XHJcbiAgICAgIHAuZHJhdyA9IHRoaXMuX2RyYXcuYmluZCh0aGlzLCBwKTtcclxuICAgIH0uYmluZCh0aGlzKSxcclxuICAgIHRoaXMuXyRjb250YWluZXIuZ2V0KDApXHJcbiAgKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGaW5kIHRoZSBkaXN0YW5jZSBmcm9tIHRoZSB0b3AgbGVmdCBvZiB0aGUgbmF2IHRvIHRoZSBicmFuZCBsb2dvJ3MgYmFzZWxpbmUuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3VwZGF0ZVRleHRPZmZzZXQgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgYmFzZWxpbmVEaXYgPSAkKFwiPGRpdj5cIilcclxuICAgIC5jc3Moe1xyXG4gICAgICBkaXNwbGF5OiBcImlubGluZS1ibG9ja1wiLFxyXG4gICAgICB2ZXJ0aWNhbEFsaWduOiBcImJhc2VsaW5lXCJcclxuICAgIH0pXHJcbiAgICAucHJlcGVuZFRvKHRoaXMuXyRuYXZMb2dvKTtcclxuICB2YXIgbmF2T2Zmc2V0ID0gdGhpcy5fJG5hdi5vZmZzZXQoKTtcclxuICB2YXIgbG9nb0Jhc2VsaW5lT2Zmc2V0ID0gYmFzZWxpbmVEaXYub2Zmc2V0KCk7XHJcbiAgdGhpcy5fdGV4dE9mZnNldCA9IHtcclxuICAgIHRvcDogbG9nb0Jhc2VsaW5lT2Zmc2V0LnRvcCAtIG5hdk9mZnNldC50b3AsXHJcbiAgICBsZWZ0OiBsb2dvQmFzZWxpbmVPZmZzZXQubGVmdCAtIG5hdk9mZnNldC5sZWZ0XHJcbiAgfTtcclxuICBiYXNlbGluZURpdi5yZW1vdmUoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGaW5kIHRoZSBib3VuZGluZyBib3ggb2YgdGhlIGJyYW5kIGxvZ28gaW4gdGhlIG5hdi4gVGhpcyBiYm94IGNhbiB0aGVuIGJlXHJcbiAqIHVzZWQgdG8gY29udHJvbCB3aGVuIHRoZSBjdXJzb3Igc2hvdWxkIGJlIGEgcG9pbnRlci5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fY2FsY3VsYXRlTmF2TG9nb0JvdW5kcyA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBuYXZPZmZzZXQgPSB0aGlzLl8kbmF2Lm9mZnNldCgpO1xyXG4gIHZhciBsb2dvT2Zmc2V0ID0gdGhpcy5fJG5hdkxvZ28ub2Zmc2V0KCk7XHJcbiAgdGhpcy5fbG9nb0Jib3ggPSB7XHJcbiAgICB5OiBsb2dvT2Zmc2V0LnRvcCAtIG5hdk9mZnNldC50b3AsXHJcbiAgICB4OiBsb2dvT2Zmc2V0LmxlZnQgLSBuYXZPZmZzZXQubGVmdCxcclxuICAgIHc6IHRoaXMuXyRuYXZMb2dvLm91dGVyV2lkdGgoKSwgLy8gRXhjbHVkZSBtYXJnaW4gZnJvbSB0aGUgYmJveFxyXG4gICAgaDogdGhpcy5fJG5hdkxvZ28ub3V0ZXJIZWlnaHQoKSAvLyBMaW5rcyBhcmVuJ3QgY2xpY2thYmxlIG9uIG1hcmdpblxyXG4gIH07XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBkaW1lbnNpb25zIHRvIG1hdGNoIHRoZSBuYXYgLSBleGNsdWRpbmcgYW55IG1hcmdpbiwgcGFkZGluZyAmXHJcbiAqIGJvcmRlci5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fdXBkYXRlU2l6ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuX3dpZHRoID0gdGhpcy5fJG5hdi5pbm5lcldpZHRoKCk7XHJcbiAgdGhpcy5faGVpZ2h0ID0gdGhpcy5fJG5hdi5pbm5lckhlaWdodCgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdyYWIgdGhlIGZvbnQgc2l6ZSBmcm9tIHRoZSBicmFuZCBsb2dvIGxpbmsuIFRoaXMgbWFrZXMgdGhlIGZvbnQgc2l6ZSBvZiB0aGVcclxuICogc2tldGNoIHJlc3BvbnNpdmUuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3VwZGF0ZUZvbnRTaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5fZm9udFNpemUgPSB0aGlzLl8kbmF2TG9nby5jc3MoXCJmb250U2l6ZVwiKS5yZXBsYWNlKFwicHhcIiwgXCJcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogV2hlbiB0aGUgYnJvd3NlciBpcyByZXNpemVkLCByZWNhbGN1bGF0ZSBhbGwgdGhlIG5lY2Vzc2FyeSBzdGF0cyBzbyB0aGF0IHRoZVxyXG4gKiBza2V0Y2ggY2FuIGJlIHJlc3BvbnNpdmUuIFRoZSBsb2dvIGluIHRoZSBza2V0Y2ggc2hvdWxkIEFMV0FZUyBleGFjdGx5IG1hdGNoXHJcbiAqIHRoZSBicmFuZyBsb2dvIGxpbmsgdGhlIEhUTUwuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24ocCkge1xyXG4gIHRoaXMuX3VwZGF0ZVNpemUoKTtcclxuICB0aGlzLl91cGRhdGVGb250U2l6ZSgpO1xyXG4gIHRoaXMuX3VwZGF0ZVRleHRPZmZzZXQoKTtcclxuICB0aGlzLl9jYWxjdWxhdGVOYXZMb2dvQm91bmRzKCk7XHJcbiAgcC5yZXNpemVDYW52YXModGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBfaXNNb3VzZU92ZXIgcHJvcGVydHkuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldE1vdXNlT3ZlciA9IGZ1bmN0aW9uKGlzTW91c2VPdmVyKSB7XHJcbiAgdGhpcy5faXNNb3VzZU92ZXIgPSBpc01vdXNlT3ZlcjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBJZiB0aGUgY3Vyc29yIGlzIHNldCB0byBhIHBvaW50ZXIsIGZvcndhcmQgYW55IGNsaWNrIGV2ZW50cyB0byB0aGUgbmF2IGxvZ28uXHJcbiAqIFRoaXMgcmVkdWNlcyB0aGUgbmVlZCBmb3IgdGhlIGNhbnZhcyB0byBkbyBhbnkgQUpBWC15IHN0dWZmLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vbkNsaWNrID0gZnVuY3Rpb24oZSkge1xyXG4gIGlmICh0aGlzLl9pc092ZXJOYXZMb2dvKSB0aGlzLl8kbmF2TG9nby50cmlnZ2VyKGUpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgcHJlbG9hZCBtZXRob2QgdGhhdCBqdXN0IGxvYWRzIHRoZSBuZWNlc3NhcnkgZm9udFxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9wcmVsb2FkID0gZnVuY3Rpb24ocCkge1xyXG4gIHRoaXMuX2ZvbnQgPSBwLmxvYWRGb250KHRoaXMuX2ZvbnRQYXRoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlIHNldHVwIG1ldGhvZCB0aGF0IGRvZXMgc29tZSBoZWF2eSBsaWZ0aW5nLiBJdCBoaWRlcyB0aGUgbmF2IGJyYW5kIGxvZ29cclxuICogYW5kIHJldmVhbHMgdGhlIGNhbnZhcy4gSXQgYWxzbyBzZXRzIHVwIGEgbG90IG9mIHRoZSBpbnRlcm5hbCB2YXJpYWJsZXMgYW5kXHJcbiAqIGNhbnZhcyBldmVudHMuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldHVwID0gZnVuY3Rpb24ocCkge1xyXG4gIHZhciByZW5kZXJlciA9IHAuY3JlYXRlQ2FudmFzKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQpO1xyXG4gIHRoaXMuXyRjYW52YXMgPSAkKHJlbmRlcmVyLmNhbnZhcyk7XHJcblxyXG4gIC8vIFNob3cgdGhlIGNhbnZhcyBhbmQgaGlkZSB0aGUgbG9nby4gVXNpbmcgc2hvdy9oaWRlIG9uIHRoZSBsb2dvIHdpbGwgY2F1c2VcclxuICAvLyBqUXVlcnkgdG8gbXVjayB3aXRoIHRoZSBwb3NpdGlvbmluZywgd2hpY2ggaXMgdXNlZCB0byBjYWxjdWxhdGUgd2hlcmUgdG9cclxuICAvLyBkcmF3IHRoZSBjYW52YXMgdGV4dC4gSW5zdGVhZCwganVzdCBwdXNoIHRoZSBsb2dvIGJlaGluZCB0aGUgY2FudmFzLiBUaGlzXHJcbiAgLy8gYWxsb3dzIG1ha2VzIGl0IHNvIHRoZSBjYW52YXMgaXMgc3RpbGwgYmVoaW5kIHRoZSBuYXYgbGlua3MuXHJcbiAgdGhpcy5fJGNvbnRhaW5lci5zaG93KCk7XHJcbiAgdGhpcy5fJG5hdkxvZ28uY3NzKFwiekluZGV4XCIsIC0xKTtcclxuXHJcbiAgLy8gVGhlcmUgaXNuJ3QgYSBnb29kIHdheSB0byBjaGVjayB3aGV0aGVyIHRoZSBza2V0Y2ggaGFzIHRoZSBtb3VzZSBvdmVyXHJcbiAgLy8gaXQuIHAubW91c2VYICYgcC5tb3VzZVkgYXJlIGluaXRpYWxpemVkIHRvICgwLCAwKSwgYW5kIHAuZm9jdXNlZCBpc24ndFxyXG4gIC8vIGFsd2F5cyByZWxpYWJsZS5cclxuICB0aGlzLl8kY2FudmFzLm9uKFwibW91c2VvdmVyXCIsIHRoaXMuX3NldE1vdXNlT3Zlci5iaW5kKHRoaXMsIHRydWUpKTtcclxuICB0aGlzLl8kY2FudmFzLm9uKFwibW91c2VvdXRcIiwgdGhpcy5fc2V0TW91c2VPdmVyLmJpbmQodGhpcywgZmFsc2UpKTtcclxuXHJcbiAgLy8gRm9yd2FyZCBtb3VzZSBjbGlja3MgdG8gdGhlIG5hdiBsb2dvXHJcbiAgdGhpcy5fJGNhbnZhcy5vbihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gIC8vIFdoZW4gdGhlIHdpbmRvdyBpcyByZXNpemVkLCB0ZXh0ICYgY2FudmFzIHNpemluZyBhbmQgcGxhY2VtZW50IG5lZWQgdG8gYmVcclxuICAvLyByZWNhbGN1bGF0ZWQuIFRoZSBzaXRlIGlzIHJlc3BvbnNpdmUsIHNvIHRoZSBpbnRlcmFjdGl2ZSBjYW52YXMgc2hvdWxkIGJlXHJcbiAgLy8gdG9vIVxyXG4gICQod2luZG93KS5vbihcInJlc2l6ZVwiLCB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMsIHApKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlIGRyYXcgbWV0aG9kIHRoYXQgY29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIGN1cnNvciBpcyBhIHBvaW50ZXIuIEl0XHJcbiAqIHNob3VsZCBvbmx5IGJlIGEgcG9pbnRlciB3aGVuIHRoZSBtb3VzZSBpcyBvdmVyIHRoZSBuYXYgYnJhbmQgbG9nby5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fZHJhdyA9IGZ1bmN0aW9uKHApIHtcclxuICBpZiAodGhpcy5faXNNb3VzZU92ZXIpIHtcclxuICAgIHZhciBpc092ZXJMb2dvID0gdXRpbHMuaXNJblJlY3QocC5tb3VzZVgsIHAubW91c2VZLCB0aGlzLl9sb2dvQmJveCk7XHJcbiAgICBpZiAoIXRoaXMuX2lzT3Zlck5hdkxvZ28gJiYgaXNPdmVyTG9nbykge1xyXG4gICAgICB0aGlzLl9pc092ZXJOYXZMb2dvID0gdHJ1ZTtcclxuICAgICAgdGhpcy5fJGNhbnZhcy5jc3MoXCJjdXJzb3JcIiwgXCJwb2ludGVyXCIpO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLl9pc092ZXJOYXZMb2dvICYmICFpc092ZXJMb2dvKSB7XHJcbiAgICAgIHRoaXMuX2lzT3Zlck5hdkxvZ28gPSBmYWxzZTtcclxuICAgICAgdGhpcy5fJGNhbnZhcy5jc3MoXCJjdXJzb3JcIiwgXCJpbml0aWFsXCIpO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuIiwibW9kdWxlLmV4cG9ydHMgPSBTa2V0Y2g7XHJcblxyXG52YXIgQmJveFRleHQgPSByZXF1aXJlKFwicDUtYmJveC1hbGlnbmVkLXRleHRcIik7XHJcbnZhciBCYXNlTG9nb1NrZXRjaCA9IHJlcXVpcmUoXCIuL2Jhc2UtbG9nby1za2V0Y2guanNcIik7XHJcbnZhciBTaW5HZW5lcmF0b3IgPSByZXF1aXJlKFwiLi9nZW5lcmF0b3JzL3Npbi1nZW5lcmF0b3IuanNcIik7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuU2tldGNoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlKTtcclxuXHJcbmZ1bmN0aW9uIFNrZXRjaCgkbmF2LCAkbmF2TG9nbykge1xyXG4gIEJhc2VMb2dvU2tldGNoLmNhbGwodGhpcywgJG5hdiwgJG5hdkxvZ28sIFwiLi4vZm9udHMvYmlnX2pvaG4td2ViZm9udC50dGZcIik7XHJcbn1cclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24ocCkge1xyXG4gIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUuY2FsbCh0aGlzLCBwKTtcclxuICB0aGlzLl9zcGFjaW5nID0gdXRpbHMubWFwKHRoaXMuX2ZvbnRTaXplLCAyMCwgNDAsIDIsIDUsIHtcclxuICAgIGNsYW1wOiB0cnVlLFxyXG4gICAgcm91bmQ6IHRydWVcclxuICB9KTtcclxuICAvLyBVcGRhdGUgdGhlIGJib3hUZXh0LCBwbGFjZSBvdmVyIHRoZSBuYXYgdGV4dCBsb2dvIGFuZCB0aGVuIHNoaWZ0IGl0c1xyXG4gIC8vIGFuY2hvciBiYWNrIHRvIChjZW50ZXIsIGNlbnRlcikgd2hpbGUgcHJlc2VydmluZyB0aGUgdGV4dCBwb3NpdGlvblxyXG4gIHRoaXMuX2Jib3hUZXh0XHJcbiAgICAuc2V0VGV4dCh0aGlzLl90ZXh0KVxyXG4gICAgLnNldFRleHRTaXplKHRoaXMuX2ZvbnRTaXplKVxyXG4gICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfTEVGVCwgQmJveFRleHQuQkFTRUxJTkUuQUxQSEFCRVRJQylcclxuICAgIC5zZXRQb3NpdGlvbih0aGlzLl90ZXh0T2Zmc2V0LmxlZnQsIHRoaXMuX3RleHRPZmZzZXQudG9wKVxyXG4gICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfQ0VOVEVSLCBCYm94VGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSLCB0cnVlKTtcclxuICB0aGlzLl9kcmF3U3RhdGlvbmFyeUxvZ28ocCk7XHJcbiAgdGhpcy5fcG9pbnRzID0gdGhpcy5fYmJveFRleHQuZ2V0VGV4dFBvaW50cygpO1xyXG4gIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3U3RhdGlvbmFyeUxvZ28gPSBmdW5jdGlvbihwKSB7XHJcbiAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgcC5zdHJva2UoMjU1KTtcclxuICBwLmZpbGwoXCIjMEEwMDBBXCIpO1xyXG4gIHAuc3Ryb2tlV2VpZ2h0KDIpO1xyXG4gIHRoaXMuX2Jib3hUZXh0LmRyYXcoKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX3NldHVwID0gZnVuY3Rpb24ocCkge1xyXG4gIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fc2V0dXAuY2FsbCh0aGlzLCBwKTtcclxuXHJcbiAgLy8gQ3JlYXRlIGEgQmJveEFsaWduZWRUZXh0IGluc3RhbmNlIHRoYXQgd2lsbCBiZSB1c2VkIGZvciBkcmF3aW5nIGFuZFxyXG4gIC8vIHJvdGF0aW5nIHRleHRcclxuICB0aGlzLl9iYm94VGV4dCA9IG5ldyBCYm94VGV4dCh0aGlzLl9mb250LCB0aGlzLl90ZXh0LCB0aGlzLl9mb250U2l6ZSwgMCwgMCwgcCk7XHJcblxyXG4gIC8vIEhhbmRsZSB0aGUgaW5pdGlhbCBzZXR1cCBieSB0cmlnZ2VyaW5nIGEgcmVzaXplXHJcbiAgdGhpcy5fb25SZXNpemUocCk7XHJcblxyXG4gIC8vIERyYXcgdGhlIHN0YXRpb25hcnkgbG9nb1xyXG4gIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuXHJcbiAgLy8gU3RhcnQgdGhlIHNpbiBnZW5lcmF0b3IgYXQgaXRzIG1heCB2YWx1ZVxyXG4gIHRoaXMuX3RocmVzaG9sZEdlbmVyYXRvciA9IG5ldyBTaW5HZW5lcmF0b3IocCwgMCwgMSwgMC4wMiwgcC5QSSAvIDIpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhdyA9IGZ1bmN0aW9uKHApIHtcclxuICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2RyYXcuY2FsbCh0aGlzLCBwKTtcclxuICBpZiAoIXRoaXMuX2lzTW91c2VPdmVyIHx8ICF0aGlzLl9pc092ZXJOYXZMb2dvKSByZXR1cm47XHJcblxyXG4gIC8vIFdoZW4gdGhlIHRleHQgaXMgYWJvdXQgdG8gYmVjb21lIGFjdGl2ZSBmb3IgdGhlIGZpcnN0IHRpbWUsIGNsZWFyXHJcbiAgLy8gdGhlIHN0YXRpb25hcnkgbG9nbyB0aGF0IHdhcyBwcmV2aW91c2x5IGRyYXduLlxyXG4gIGlmICh0aGlzLl9pc0ZpcnN0RnJhbWUpIHtcclxuICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgdGhpcy5faXNGaXJzdEZyYW1lID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBpZiAodGhpcy5fZm9udFNpemUgPiAzMCkge1xyXG4gICAgdGhpcy5fdGhyZXNob2xkR2VuZXJhdG9yLnNldEJvdW5kcygwLjIgKiB0aGlzLl9iYm94VGV4dC5oZWlnaHQsIDAuNDcgKiB0aGlzLl9iYm94VGV4dC5oZWlnaHQpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLl90aHJlc2hvbGRHZW5lcmF0b3Iuc2V0Qm91bmRzKDAuMiAqIHRoaXMuX2Jib3hUZXh0LmhlaWdodCwgMC42ICogdGhpcy5fYmJveFRleHQuaGVpZ2h0KTtcclxuICB9XHJcbiAgdmFyIGRpc3RhbmNlVGhyZXNob2xkID0gdGhpcy5fdGhyZXNob2xkR2VuZXJhdG9yLmdlbmVyYXRlKCk7XHJcblxyXG4gIHAuYmFja2dyb3VuZCgyNTUsIDEwMCk7XHJcbiAgcC5zdHJva2VXZWlnaHQoMSk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9wb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBwb2ludDEgPSB0aGlzLl9wb2ludHNbaV07XHJcbiAgICBmb3IgKHZhciBqID0gaSArIDE7IGogPCB0aGlzLl9wb2ludHMubGVuZ3RoOyBqICs9IDEpIHtcclxuICAgICAgdmFyIHBvaW50MiA9IHRoaXMuX3BvaW50c1tqXTtcclxuICAgICAgdmFyIGRpc3QgPSBwLmRpc3QocG9pbnQxLngsIHBvaW50MS55LCBwb2ludDIueCwgcG9pbnQyLnkpO1xyXG4gICAgICBpZiAoZGlzdCA8IGRpc3RhbmNlVGhyZXNob2xkKSB7XHJcbiAgICAgICAgcC5ub1N0cm9rZSgpO1xyXG4gICAgICAgIHAuZmlsbChcInJnYmEoMTY1LCAwLCAxNzMsIDAuMjUpXCIpO1xyXG4gICAgICAgIHAuZWxsaXBzZSgocG9pbnQxLnggKyBwb2ludDIueCkgLyAyLCAocG9pbnQxLnkgKyBwb2ludDIueSkgLyAyLCBkaXN0LCBkaXN0KTtcclxuXHJcbiAgICAgICAgcC5zdHJva2UoXCJyZ2JhKDE2NSwgMCwgMTczLCAwLjI1KVwiKTtcclxuICAgICAgICBwLm5vRmlsbCgpO1xyXG4gICAgICAgIHAubGluZShwb2ludDEueCwgcG9pbnQxLnksIHBvaW50Mi54LCBwb2ludDIueSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIE5vaXNlR2VuZXJhdG9yMUQ6IE5vaXNlR2VuZXJhdG9yMUQsXHJcbiAgTm9pc2VHZW5lcmF0b3IyRDogTm9pc2VHZW5lcmF0b3IyRFxyXG59O1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uLy4uL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbi8vIC0tIDFEIE5vaXNlIEdlbmVyYXRvciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vKipcclxuICogQSB1dGlsaXR5IGNsYXNzIGZvciBnZW5lcmF0aW5nIG5vaXNlIHZhbHVlc1xyXG4gKiBAY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtvYmplY3R9IHAgICAgICAgICAgICAgICBSZWZlcmVuY2UgdG8gYSBwNSBza2V0Y2hcclxuICogQHBhcmFtIHtudW1iZXJ9IFttaW49MF0gICAgICAgICBNaW5pbXVtIHZhbHVlIGZvciB0aGUgbm9pc2VcclxuICogQHBhcmFtIHtudW1iZXJ9IFttYXg9MV0gICAgICAgICBNYXhpbXVtIHZhbHVlIGZvciB0aGUgbm9pc2VcclxuICogQHBhcmFtIHtudW1iZXJ9IFtpbmNyZW1lbnQ9MC4xXSBTY2FsZSBvZiB0aGUgbm9pc2UsIHVzZWQgd2hlbiB1cGRhdGluZ1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW29mZnNldD1yYW5kb21dIEEgdmFsdWUgdXNlZCB0byBlbnN1cmUgbXVsdGlwbGUgbm9pc2VcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0b3JzIGFyZSByZXR1cm5pbmcgXCJpbmRlcGVuZGVudFwiIHZhbHVlc1xyXG4gKi9cclxuZnVuY3Rpb24gTm9pc2VHZW5lcmF0b3IxRChwLCBtaW4sIG1heCwgaW5jcmVtZW50LCBvZmZzZXQpIHtcclxuICB0aGlzLl9wID0gcDtcclxuICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgMCk7XHJcbiAgdGhpcy5fbWF4ID0gdXRpbHMuZGVmYXVsdChtYXgsIDEpO1xyXG4gIHRoaXMuX2luY3JlbWVudCA9IHV0aWxzLmRlZmF1bHQoaW5jcmVtZW50LCAwLjEpO1xyXG4gIHRoaXMuX3Bvc2l0aW9uID0gdXRpbHMuZGVmYXVsdChvZmZzZXQsIHAucmFuZG9tKC0xMDAwMDAwLCAxMDAwMDAwKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG1pbiBhbmQgbWF4IG5vaXNlIHZhbHVlc1xyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IG1pbiBNaW5pbXVtIG5vaXNlIHZhbHVlXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWF4IE1heGltdW0gbm9pc2UgdmFsdWVcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XHJcbiAgdGhpcy5fbWluID0gdXRpbHMuZGVmYXVsdChtaW4sIHRoaXMuX21pbik7XHJcbiAgdGhpcy5fbWF4ID0gdXRpbHMuZGVmYXVsdChtYXgsIHRoaXMuX21heCk7XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBub2lzZSBpbmNyZW1lbnQgKGUuZy4gc2NhbGUpXHJcbiAqIEBwYXJhbSAge251bWJlcn0gaW5jcmVtZW50IE5ldyBpbmNyZW1lbnQgKHNjYWxlKSB2YWx1ZVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IxRC5wcm90b3R5cGUuc2V0SW5jcmVtZW50ID0gZnVuY3Rpb24oaW5jcmVtZW50KSB7XHJcbiAgdGhpcy5faW5jcmVtZW50ID0gdXRpbHMuZGVmYXVsdChpbmNyZW1lbnQsIHRoaXMuX2luY3JlbWVudCk7XHJcbn07XHJcblxyXG4vKipcclxuICogR2VuZXJhdGUgdGhlIG5leHQgbm9pc2UgdmFsdWVcclxuICogQHJldHVybiB7bnVtYmVyfSBBIG5vaXN5IHZhbHVlIGJldHdlZW4gb2JqZWN0J3MgbWluIGFuZCBtYXhcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgdmFyIG4gPSB0aGlzLl9wLm5vaXNlKHRoaXMuX3Bvc2l0aW9uKTtcclxuICBuID0gdGhpcy5fcC5tYXAobiwgMCwgMSwgdGhpcy5fbWluLCB0aGlzLl9tYXgpO1xyXG4gIHJldHVybiBuO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEludGVybmFsIHVwZGF0ZSBtZXRob2QgZm9yIGdlbmVyYXRpbmcgbmV4dCBub2lzZSB2YWx1ZVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IxRC5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuX3Bvc2l0aW9uICs9IHRoaXMuX2luY3JlbWVudDtcclxufTtcclxuXHJcbi8vIC0tIDJEIE5vaXNlIEdlbmVyYXRvciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5mdW5jdGlvbiBOb2lzZUdlbmVyYXRvcjJEKHAsIHhNaW4sIHhNYXgsIHlNaW4sIHlNYXgsIHhJbmNyZW1lbnQsIHlJbmNyZW1lbnQsIHhPZmZzZXQsIHlPZmZzZXQpIHtcclxuICB0aGlzLl94Tm9pc2UgPSBuZXcgTm9pc2VHZW5lcmF0b3IxRChwLCB4TWluLCB4TWF4LCB4SW5jcmVtZW50LCB4T2Zmc2V0KTtcclxuICB0aGlzLl95Tm9pc2UgPSBuZXcgTm9pc2VHZW5lcmF0b3IxRChwLCB5TWluLCB5TWF4LCB5SW5jcmVtZW50LCB5T2Zmc2V0KTtcclxuICB0aGlzLl9wID0gcDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgbWluIGFuZCBtYXggbm9pc2UgdmFsdWVzXHJcbiAqIEBwYXJhbSAge29iamVjdH0gb3B0aW9ucyBPYmplY3Qgd2l0aCBib3VuZHMgdG8gYmUgdXBkYXRlZCBlLmcuXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB7IHhNaW46IDAsIHhNYXg6IDEsIHlNaW46IC0xLCB5TWF4OiAxIH1cclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMkQucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuICBpZiAoIW9wdGlvbnMpIHJldHVybjtcclxuICB0aGlzLl94Tm9pc2Uuc2V0Qm91bmRzKG9wdGlvbnMueE1pbiwgb3B0aW9ucy54TWF4KTtcclxuICB0aGlzLl95Tm9pc2Uuc2V0Qm91bmRzKG9wdGlvbnMueU1pbiwgb3B0aW9ucy55TWF4KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIGluY3JlbWVudCAoZS5nLiBzY2FsZSkgZm9yIHRoZSBub2lzZSBnZW5lcmF0b3JcclxuICogQHBhcmFtICB7b2JqZWN0fSBvcHRpb25zIE9iamVjdCB3aXRoIGJvdW5kcyB0byBiZSB1cGRhdGVkIGUuZy5cclxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHsgeEluY3JlbWVudDogMC4wNSwgeUluY3JlbWVudDogMC4xIH1cclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMkQucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuICBpZiAoIW9wdGlvbnMpIHJldHVybjtcclxuICB0aGlzLl94Tm9pc2Uuc2V0Qm91bmRzKG9wdGlvbnMueEluY3JlbWVudCk7XHJcbiAgdGhpcy5feU5vaXNlLnNldEJvdW5kcyhvcHRpb25zLnlJbmNyZW1lbnQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIHRoZSBuZXh0IHBhaXIgb2Ygbm9pc2UgdmFsdWVzXHJcbiAqIEByZXR1cm4ge29iamVjdH0gT2JqZWN0IHdpdGggeCBhbmQgeSBwcm9wZXJ0aWVzIHRoYXQgY29udGFpbiB0aGUgbmV4dCBub2lzZVxyXG4gKiAgICAgICAgICAgICAgICAgIHZhbHVlcyBhbG9uZyBlYWNoIGRpbWVuc2lvblxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IyRC5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4ge1xyXG4gICAgeDogdGhpcy5feE5vaXNlLmdlbmVyYXRlKCksXHJcbiAgICB5OiB0aGlzLl95Tm9pc2UuZ2VuZXJhdGUoKVxyXG4gIH07XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gU2luR2VuZXJhdG9yO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uLy4uL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbi8qKlxyXG4gKiBBIHV0aWxpdHkgY2xhc3MgZm9yIGdlbmVyYXRpbmcgdmFsdWVzIGFsb25nIGEgc2lud2F2ZVxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtvYmplY3R9IHAgICAgICAgICAgICAgICBSZWZlcmVuY2UgdG8gYSBwNSBza2V0Y2hcclxuICogQHBhcmFtIHtudW1iZXJ9IFttaW49MF0gICAgICAgICBNaW5pbXVtIHZhbHVlIGZvciB0aGUgbm9pc2VcclxuICogQHBhcmFtIHtudW1iZXJ9IFttYXg9MV0gICAgICAgICBNYXhpbXVtIHZhbHVlIGZvciB0aGUgbm9pc2VcclxuICogQHBhcmFtIHtudW1iZXJ9IFtpbmNyZW1lbnQ9MC4xXSBJbmNyZW1lbnQgdXNlZCB3aGVuIHVwZGF0aW5nXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb2Zmc2V0PXJhbmRvbV0gV2hlcmUgdG8gc3RhcnQgYWxvbmcgdGhlIHNpbmV3YXZlXHJcbiAqL1xyXG5mdW5jdGlvbiBTaW5HZW5lcmF0b3IocCwgbWluLCBtYXgsIGFuZ2xlSW5jcmVtZW50LCBzdGFydGluZ0FuZ2xlKSB7XHJcbiAgdGhpcy5fcCA9IHA7XHJcbiAgdGhpcy5fbWluID0gdXRpbHMuZGVmYXVsdChtaW4sIDApO1xyXG4gIHRoaXMuX21heCA9IHV0aWxzLmRlZmF1bHQobWF4LCAwKTtcclxuICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGFuZ2xlSW5jcmVtZW50LCAwLjEpO1xyXG4gIHRoaXMuX2FuZ2xlID0gdXRpbHMuZGVmYXVsdChzdGFydGluZ0FuZ2xlLCBwLnJhbmRvbSgtMTAwMDAwMCwgMTAwMDAwMCkpO1xyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBtaW4gYW5kIG1heCB2YWx1ZXNcclxuICogQHBhcmFtICB7bnVtYmVyfSBtaW4gTWluaW11bSB2YWx1ZVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IG1heCBNYXhpbXVtIHZhbHVlXHJcbiAqL1xyXG5TaW5HZW5lcmF0b3IucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XHJcbiAgdGhpcy5fbWluID0gdXRpbHMuZGVmYXVsdChtaW4sIHRoaXMuX21pbik7XHJcbiAgdGhpcy5fbWF4ID0gdXRpbHMuZGVmYXVsdChtYXgsIHRoaXMuX21heCk7XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBhbmdsZSBpbmNyZW1lbnQgKGUuZy4gaG93IGZhc3Qgd2UgbW92ZSB0aHJvdWdoIHRoZSBzaW53YXZlKVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGluY3JlbWVudCBOZXcgaW5jcmVtZW50IHZhbHVlXHJcbiAqL1xyXG5TaW5HZW5lcmF0b3IucHJvdG90eXBlLnNldEluY3JlbWVudCA9IGZ1bmN0aW9uKGluY3JlbWVudCkge1xyXG4gIHRoaXMuX2luY3JlbWVudCA9IHV0aWxzLmRlZmF1bHQoaW5jcmVtZW50LCB0aGlzLl9pbmNyZW1lbnQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIHRoZSBuZXh0IHZhbHVlXHJcbiAqIEByZXR1cm4ge251bWJlcn0gQSB2YWx1ZSBiZXR3ZWVuIGdlbmVyYXRvcnMncyBtaW4gYW5kIG1heFxyXG4gKi9cclxuU2luR2VuZXJhdG9yLnByb3RvdHlwZS5nZW5lcmF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuX3VwZGF0ZSgpO1xyXG4gIHZhciBuID0gdGhpcy5fcC5zaW4odGhpcy5fYW5nbGUpO1xyXG4gIG4gPSB0aGlzLl9wLm1hcChuLCAtMSwgMSwgdGhpcy5fbWluLCB0aGlzLl9tYXgpO1xyXG4gIHJldHVybiBuO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEludGVybmFsIHVwZGF0ZSBtZXRob2QgZm9yIGdlbmVyYXRpbmcgbmV4dCB2YWx1ZVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuU2luR2VuZXJhdG9yLnByb3RvdHlwZS5fdXBkYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5fYW5nbGUgKz0gdGhpcy5faW5jcmVtZW50O1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFNrZXRjaDtcclxuXHJcbnZhciBCYm94VGV4dCA9IHJlcXVpcmUoXCJwNS1iYm94LWFsaWduZWQtdGV4dFwiKTtcclxudmFyIEJhc2VMb2dvU2tldGNoID0gcmVxdWlyZShcIi4vYmFzZS1sb2dvLXNrZXRjaC5qc1wiKTtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUpO1xyXG5cclxuZnVuY3Rpb24gU2tldGNoKCRuYXYsICRuYXZMb2dvKSB7XHJcbiAgQmFzZUxvZ29Ta2V0Y2guY2FsbCh0aGlzLCAkbmF2LCAkbmF2TG9nbywgXCIuLi9mb250cy9iaWdfam9obi13ZWJmb250LnR0ZlwiKTtcclxufVxyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbihwKSB7XHJcbiAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZS5jYWxsKHRoaXMsIHApO1xyXG4gIHRoaXMuX3NwYWNpbmcgPSB1dGlscy5tYXAodGhpcy5fZm9udFNpemUsIDIwLCA0MCwgMiwgNSwge1xyXG4gICAgY2xhbXA6IHRydWUsXHJcbiAgICByb3VuZDogdHJ1ZVxyXG4gIH0pO1xyXG4gIC8vIFVwZGF0ZSB0aGUgYmJveFRleHQsIHBsYWNlIG92ZXIgdGhlIG5hdiB0ZXh0IGxvZ28gYW5kIHRoZW4gc2hpZnQgaXRzXHJcbiAgLy8gYW5jaG9yIGJhY2sgdG8gKGNlbnRlciwgY2VudGVyKSB3aGlsZSBwcmVzZXJ2aW5nIHRoZSB0ZXh0IHBvc2l0aW9uXHJcbiAgdGhpcy5fYmJveFRleHRcclxuICAgIC5zZXRUZXh0KHRoaXMuX3RleHQpXHJcbiAgICAuc2V0VGV4dFNpemUodGhpcy5fZm9udFNpemUpXHJcbiAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9MRUZULCBCYm94VGV4dC5CQVNFTElORS5BTFBIQUJFVElDKVxyXG4gICAgLnNldFBvc2l0aW9uKHRoaXMuX3RleHRPZmZzZXQubGVmdCwgdGhpcy5fdGV4dE9mZnNldC50b3ApXHJcbiAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9DRU5URVIsIEJib3hUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVIsIHRydWUpO1xyXG4gIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuICB0aGlzLl9jYWxjdWxhdGVDaXJjbGVzKHApO1xyXG4gIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3U3RhdGlvbmFyeUxvZ28gPSBmdW5jdGlvbihwKSB7XHJcbiAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgcC5zdHJva2UoMjU1KTtcclxuICBwLmZpbGwoXCIjMEEwMDBBXCIpO1xyXG4gIHAuc3Ryb2tlV2VpZ2h0KDIpO1xyXG4gIHRoaXMuX2Jib3hUZXh0LmRyYXcoKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX3NldHVwID0gZnVuY3Rpb24ocCkge1xyXG4gIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fc2V0dXAuY2FsbCh0aGlzLCBwKTtcclxuXHJcbiAgLy8gQ3JlYXRlIGEgQmJveEFsaWduZWRUZXh0IGluc3RhbmNlIHRoYXQgd2lsbCBiZSB1c2VkIGZvciBkcmF3aW5nIGFuZFxyXG4gIC8vIHJvdGF0aW5nIHRleHRcclxuICB0aGlzLl9iYm94VGV4dCA9IG5ldyBCYm94VGV4dCh0aGlzLl9mb250LCB0aGlzLl90ZXh0LCB0aGlzLl9mb250U2l6ZSwgMCwgMCwgcCk7XHJcblxyXG4gIC8vIEhhbmRsZSB0aGUgaW5pdGlhbCBzZXR1cCBieSB0cmlnZ2VyaW5nIGEgcmVzaXplXHJcbiAgdGhpcy5fb25SZXNpemUocCk7XHJcblxyXG4gIC8vIERyYXcgdGhlIHN0YXRpb25hcnkgbG9nb1xyXG4gIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuXHJcbiAgdGhpcy5fY2FsY3VsYXRlQ2lyY2xlcyhwKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2NhbGN1bGF0ZUNpcmNsZXMgPSBmdW5jdGlvbihwKSB7XHJcbiAgLy8gVE9ETzogRG9uJ3QgbmVlZCBBTEwgdGhlIHBpeGVscy4gVGhpcyBjb3VsZCBoYXZlIGFuIG9mZnNjcmVlbiByZW5kZXJlclxyXG4gIC8vIHRoYXQgaXMganVzdCBiaWcgZW5vdWdoIHRvIGZpdCB0aGUgdGV4dC5cclxuICAvLyBMb29wIG92ZXIgdGhlIHBpeGVscyBpbiB0aGUgdGV4dCdzIGJvdW5kaW5nIGJveCB0byBzYW1wbGUgdGhlIHdvcmRcclxuICB2YXIgYmJveCA9IHRoaXMuX2Jib3hUZXh0LmdldEJib3goKTtcclxuICB2YXIgc3RhcnRYID0gTWF0aC5mbG9vcihNYXRoLm1heChiYm94LnggLSA1LCAwKSk7XHJcbiAgdmFyIGVuZFggPSBNYXRoLmNlaWwoTWF0aC5taW4oYmJveC54ICsgYmJveC53ICsgNSwgcC53aWR0aCkpO1xyXG4gIHZhciBzdGFydFkgPSBNYXRoLmZsb29yKE1hdGgubWF4KGJib3gueSAtIDUsIDApKTtcclxuICB2YXIgZW5kWSA9IE1hdGguY2VpbChNYXRoLm1pbihiYm94LnkgKyBiYm94LmggKyA1LCBwLmhlaWdodCkpO1xyXG4gIHAubG9hZFBpeGVscygpO1xyXG4gIHAucGl4ZWxEZW5zaXR5KDEpO1xyXG4gIHRoaXMuX2NpcmNsZXMgPSBbXTtcclxuICBmb3IgKHZhciB5ID0gc3RhcnRZOyB5IDwgZW5kWTsgeSArPSB0aGlzLl9zcGFjaW5nKSB7XHJcbiAgICBmb3IgKHZhciB4ID0gc3RhcnRYOyB4IDwgZW5kWDsgeCArPSB0aGlzLl9zcGFjaW5nKSB7XHJcbiAgICAgIHZhciBpID0gNCAqICh5ICogcC53aWR0aCArIHgpO1xyXG4gICAgICB2YXIgciA9IHAucGl4ZWxzW2ldO1xyXG4gICAgICB2YXIgZyA9IHAucGl4ZWxzW2kgKyAxXTtcclxuICAgICAgdmFyIGIgPSBwLnBpeGVsc1tpICsgMl07XHJcbiAgICAgIHZhciBhID0gcC5waXhlbHNbaSArIDNdO1xyXG4gICAgICB2YXIgYyA9IHAuY29sb3IociwgZywgYiwgYSk7XHJcbiAgICAgIGlmIChwLnNhdHVyYXRpb24oYykgPiAwKSB7XHJcbiAgICAgICAgdGhpcy5fY2lyY2xlcy5wdXNoKHtcclxuICAgICAgICAgIHg6IHggKyBwLnJhbmRvbSgtMiAvIDMgKiB0aGlzLl9zcGFjaW5nLCAyIC8gMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgeTogeSArIHAucmFuZG9tKC0yIC8gMyAqIHRoaXMuX3NwYWNpbmcsIDIgLyAzICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICBjb2xvcjogcC5jb2xvcihcIiMwNkZGRkZcIilcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl9jaXJjbGVzLnB1c2goe1xyXG4gICAgICAgICAgeDogeCArIHAucmFuZG9tKC0yIC8gMyAqIHRoaXMuX3NwYWNpbmcsIDIgLyAzICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICB5OiB5ICsgcC5yYW5kb20oLTIgLyAzICogdGhpcy5fc3BhY2luZywgMiAvIDMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgIGNvbG9yOiBwLmNvbG9yKFwiI0ZFMDBGRVwiKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuX2NpcmNsZXMucHVzaCh7XHJcbiAgICAgICAgICB4OiB4ICsgcC5yYW5kb20oLTIgLyAzICogdGhpcy5fc3BhY2luZywgMiAvIDMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgIHk6IHkgKyBwLnJhbmRvbSgtMiAvIDMgKiB0aGlzLl9zcGFjaW5nLCAyIC8gMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgY29sb3I6IHAuY29sb3IoXCIjRkZGRjA0XCIpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24ocCkge1xyXG4gIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fZHJhdy5jYWxsKHRoaXMsIHApO1xyXG4gIGlmICghdGhpcy5faXNNb3VzZU92ZXIgfHwgIXRoaXMuX2lzT3Zlck5hdkxvZ28pIHJldHVybjtcclxuXHJcbiAgLy8gV2hlbiB0aGUgdGV4dCBpcyBhYm91dCB0byBiZWNvbWUgYWN0aXZlIGZvciB0aGUgZmlyc3QgdGltZSwgY2xlYXJcclxuICAvLyB0aGUgc3RhdGlvbmFyeSBsb2dvIHRoYXQgd2FzIHByZXZpb3VzbHkgZHJhd24uXHJcbiAgaWYgKHRoaXMuX2lzRmlyc3RGcmFtZSkge1xyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vIENsZWFyXHJcbiAgcC5ibGVuZE1vZGUocC5CTEVORCk7XHJcbiAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcblxyXG4gIC8vIERyYXcgXCJoYWxmdG9uZVwiIGxvZ29cclxuICBwLm5vU3Ryb2tlKCk7XHJcbiAgcC5ibGVuZE1vZGUocC5NVUxUSVBMWSk7XHJcblxyXG4gIHZhciBtYXhEaXN0ID0gdGhpcy5fYmJveFRleHQuaGFsZldpZHRoO1xyXG4gIHZhciBtYXhSYWRpdXMgPSAyICogdGhpcy5fc3BhY2luZztcclxuXHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9jaXJjbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICB2YXIgY2lyY2xlID0gdGhpcy5fY2lyY2xlc1tpXTtcclxuICAgIHZhciBjID0gY2lyY2xlLmNvbG9yO1xyXG4gICAgdmFyIGRpc3QgPSBwLmRpc3QoY2lyY2xlLngsIGNpcmNsZS55LCBwLm1vdXNlWCwgcC5tb3VzZVkpO1xyXG4gICAgdmFyIHJhZGl1cyA9IHV0aWxzLm1hcChkaXN0LCAwLCBtYXhEaXN0LCAxLCBtYXhSYWRpdXMsIHsgY2xhbXA6IHRydWUgfSk7XHJcbiAgICBwLmZpbGwoYyk7XHJcbiAgICBwLmVsbGlwc2UoY2lyY2xlLngsIGNpcmNsZS55LCByYWRpdXMsIHJhZGl1cyk7XHJcbiAgfVxyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFNrZXRjaDtcclxuXHJcbnZhciBOb2lzZSA9IHJlcXVpcmUoXCIuL2dlbmVyYXRvcnMvbm9pc2UtZ2VuZXJhdG9ycy5qc1wiKTtcclxudmFyIEJib3hUZXh0ID0gcmVxdWlyZShcInA1LWJib3gtYWxpZ25lZC10ZXh0XCIpO1xyXG52YXIgQmFzZUxvZ29Ta2V0Y2ggPSByZXF1aXJlKFwiLi9iYXNlLWxvZ28tc2tldGNoLmpzXCIpO1xyXG5cclxuU2tldGNoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlKTtcclxuXHJcbmZ1bmN0aW9uIFNrZXRjaCgkbmF2LCAkbmF2TG9nbykge1xyXG4gIEJhc2VMb2dvU2tldGNoLmNhbGwodGhpcywgJG5hdiwgJG5hdkxvZ28sIFwiLi4vZm9udHMvYmlnX2pvaG4td2ViZm9udC50dGZcIik7XHJcbn1cclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24ocCkge1xyXG4gIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUuY2FsbCh0aGlzLCBwKTtcclxuICAvLyBVcGRhdGUgdGhlIGJib3hUZXh0LCBwbGFjZSBvdmVyIHRoZSBuYXYgdGV4dCBsb2dvIGFuZCB0aGVuIHNoaWZ0IGl0c1xyXG4gIC8vIGFuY2hvciBiYWNrIHRvIChjZW50ZXIsIGNlbnRlcikgd2hpbGUgcHJlc2VydmluZyB0aGUgdGV4dCBwb3NpdGlvblxyXG4gIHRoaXMuX2Jib3hUZXh0XHJcbiAgICAuc2V0VGV4dCh0aGlzLl90ZXh0KVxyXG4gICAgLnNldFRleHRTaXplKHRoaXMuX2ZvbnRTaXplKVxyXG4gICAgLnNldFJvdGF0aW9uKDApXHJcbiAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9MRUZULCBCYm94VGV4dC5CQVNFTElORS5BTFBIQUJFVElDKVxyXG4gICAgLnNldFBvc2l0aW9uKHRoaXMuX3RleHRPZmZzZXQubGVmdCwgdGhpcy5fdGV4dE9mZnNldC50b3ApXHJcbiAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9DRU5URVIsIEJib3hUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVIsIHRydWUpO1xyXG4gIHRoaXMuX3RleHRQb3MgPSB0aGlzLl9iYm94VGV4dC5nZXRQb3NpdGlvbigpO1xyXG4gIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSB0cnVlO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhd1N0YXRpb25hcnlMb2dvID0gZnVuY3Rpb24ocCkge1xyXG4gIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gIHAuc3Ryb2tlKDI1NSk7XHJcbiAgcC5maWxsKFwiIzBBMDAwQVwiKTtcclxuICBwLnN0cm9rZVdlaWdodCgyKTtcclxuICB0aGlzLl9iYm94VGV4dC5kcmF3KCk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cCA9IGZ1bmN0aW9uKHApIHtcclxuICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldHVwLmNhbGwodGhpcywgcCk7XHJcblxyXG4gIC8vIENyZWF0ZSBhIEJib3hBbGlnbmVkVGV4dCBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZHJhd2luZyBhbmRcclxuICAvLyByb3RhdGluZyB0ZXh0XHJcbiAgdGhpcy5fYmJveFRleHQgPSBuZXcgQmJveFRleHQodGhpcy5fZm9udCwgdGhpcy5fdGV4dCwgdGhpcy5fZm9udFNpemUsIDAsIDAsIHApO1xyXG5cclxuICAvLyBIYW5kbGUgdGhlIGluaXRpYWwgc2V0dXAgYnkgdHJpZ2dlcmluZyBhIHJlc2l6ZVxyXG4gIHRoaXMuX29uUmVzaXplKHApO1xyXG5cclxuICAvLyBTZXQgdXAgbm9pc2UgZ2VuZXJhdG9yc1xyXG4gIHRoaXMuX3JvdGF0aW9uTm9pc2UgPSBuZXcgTm9pc2UuTm9pc2VHZW5lcmF0b3IxRChwLCAtcC5QSSAvIDQsIHAuUEkgLyA0LCAwLjAyKTtcclxuICB0aGlzLl94eU5vaXNlID0gbmV3IE5vaXNlLk5vaXNlR2VuZXJhdG9yMkQocCwgLTEwMCwgMTAwLCAtNTAsIDUwLCAwLjAxLCAwLjAxKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbihwKSB7XHJcbiAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9kcmF3LmNhbGwodGhpcywgcCk7XHJcbiAgaWYgKCF0aGlzLl9pc01vdXNlT3ZlciB8fCAhdGhpcy5faXNPdmVyTmF2TG9nbykgcmV0dXJuO1xyXG5cclxuICAvLyBXaGVuIHRoZSB0ZXh0IGlzIGFib3V0IHRvIGJlY29tZSBhY3RpdmUgZm9yIHRoZSBmaXJzdCB0aW1lLCBjbGVhclxyXG4gIC8vIHRoZSBzdGF0aW9uYXJ5IGxvZ28gdGhhdCB3YXMgcHJldmlvdXNseSBkcmF3bi5cclxuICBpZiAodGhpcy5faXNGaXJzdEZyYW1lKSB7XHJcbiAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHBvc2l0aW9uIGFuZCByb3RhdGlvbiB0byBjcmVhdGUgYSBqaXR0ZXJ5IGxvZ29cclxuICB2YXIgcm90YXRpb24gPSB0aGlzLl9yb3RhdGlvbk5vaXNlLmdlbmVyYXRlKCk7XHJcbiAgdmFyIHh5T2Zmc2V0ID0gdGhpcy5feHlOb2lzZS5nZW5lcmF0ZSgpO1xyXG4gIHRoaXMuX2Jib3hUZXh0XHJcbiAgICAuc2V0Um90YXRpb24ocm90YXRpb24pXHJcbiAgICAuc2V0UG9zaXRpb24odGhpcy5fdGV4dFBvcy54ICsgeHlPZmZzZXQueCwgdGhpcy5fdGV4dFBvcy55ICsgeHlPZmZzZXQueSlcclxuICAgIC5kcmF3KCk7XHJcbn07XHJcbiIsIm1vZHVsZS5leHBvcnRzID0gTWFpbk5hdjtcclxuXHJcbmZ1bmN0aW9uIE1haW5OYXYobG9hZGVyKSB7XHJcbiAgdGhpcy5fbG9hZGVyID0gbG9hZGVyO1xyXG4gIHRoaXMuXyRsb2dvID0gJChcIm5hdi5uYXZiYXIgLm5hdmJhci1icmFuZFwiKTtcclxuICB0aGlzLl8kbmF2ID0gJChcIiNtYWluLW5hdlwiKTtcclxuICB0aGlzLl8kbmF2TGlua3MgPSB0aGlzLl8kbmF2LmZpbmQoXCJhXCIpO1xyXG4gIHRoaXMuXyRhY3RpdmVOYXYgPSB0aGlzLl8kbmF2TGlua3MuZmluZChcIi5hY3RpdmVcIik7XHJcbiAgdGhpcy5fJG5hdkxpbmtzLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25OYXZDbGljay5iaW5kKHRoaXMpKTtcclxuICB0aGlzLl8kbG9nby5vbihcImNsaWNrXCIsIHRoaXMuX29uTG9nb0NsaWNrLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5NYWluTmF2LnByb3RvdHlwZS5zZXRBY3RpdmVGcm9tVXJsID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5fZGVhY3RpdmF0ZSgpO1xyXG4gIHZhciB1cmwgPSBsb2NhdGlvbi5wYXRobmFtZTtcclxuICBpZiAodXJsID09PSBcIi9pbmRleC5odG1sXCIgfHwgdXJsID09PSBcIi9cIikge1xyXG4gICAgdGhpcy5fYWN0aXZhdGVMaW5rKHRoaXMuXyRuYXZMaW5rcy5maWx0ZXIoXCIjYWJvdXQtbGlua1wiKSk7XHJcbiAgfSBlbHNlIGlmICh1cmwgPT09IFwiL3dvcmsuaHRtbFwiKSB7XHJcbiAgICB0aGlzLl9hY3RpdmF0ZUxpbmsodGhpcy5fJG5hdkxpbmtzLmZpbHRlcihcIiN3b3JrLWxpbmtcIikpO1xyXG4gIH0gZWxzZSBpZiAodXJsID09PSBcIi9ibG9nLmh0bWxcIikge1xyXG4gICAgdGhpcy5fYWN0aXZhdGVMaW5rKHRoaXMuXyRuYXZMaW5rcy5maWx0ZXIoXCIjYmxvZy1saW5rXCIpKTtcclxuICB9IGVsc2UgaWYgKHVybCA9PT0gXCIvY29udGFjdC5odG1sXCIpIHtcclxuICAgIHRoaXMuX2FjdGl2YXRlTGluayh0aGlzLl8kbmF2TGlua3MuZmlsdGVyKFwiI2NvbnRhY3QtbGlua1wiKSk7XHJcbiAgfVxyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX2RlYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcclxuICBpZiAodGhpcy5fJGFjdGl2ZU5hdi5sZW5ndGgpIHtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXYucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2ID0gJCgpO1xyXG4gIH1cclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9hY3RpdmF0ZUxpbmsgPSBmdW5jdGlvbigkbGluaykge1xyXG4gICRsaW5rLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gIHRoaXMuXyRhY3RpdmVOYXYgPSAkbGluaztcclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9vbkxvZ29DbGljayA9IGZ1bmN0aW9uKGUpIHtcclxuICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgdmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgdmFyIHVybCA9ICR0YXJnZXQuYXR0cihcImhyZWZcIik7XHJcbiAgdGhpcy5fbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIHRydWUpO1xyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX29uTmF2Q2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHRoaXMuXyRuYXYuY29sbGFwc2UoXCJoaWRlXCIpOyAvLyBDbG9zZSB0aGUgbmF2IC0gb25seSBtYXR0ZXJzIG9uIG1vYmlsZVxyXG4gIHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gIGlmICgkdGFyZ2V0LmlzKHRoaXMuXyRhY3RpdmVOYXYpKSByZXR1cm47XHJcbiAgdGhpcy5fZGVhY3RpdmF0ZSgpO1xyXG4gIHRoaXMuX2FjdGl2YXRlTGluaygkdGFyZ2V0KTtcclxuICB2YXIgdXJsID0gJHRhcmdldC5hdHRyKFwiaHJlZlwiKTtcclxuICB0aGlzLl9sb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgdHJ1ZSk7XHJcbn07XHJcbiIsInZhciBMb2FkZXIgPSByZXF1aXJlKFwiLi9wYWdlLWxvYWRlci5qc1wiKTtcclxudmFyIE1haW5OYXYgPSByZXF1aXJlKFwiLi9tYWluLW5hdi5qc1wiKTtcclxudmFyIEhvdmVyU2xpZGVzaG93cyA9IHJlcXVpcmUoXCIuL2hvdmVyLXNsaWRlc2hvdy5qc1wiKTtcclxudmFyIFBvcnRmb2xpb0ZpbHRlciA9IHJlcXVpcmUoXCIuL3BvcnRmb2xpby1maWx0ZXIuanNcIik7XHJcbnZhciBzbGlkZXNob3dzID0gcmVxdWlyZShcIi4vdGh1bWJuYWlsLXNsaWRlc2hvdy9zbGlkZXNob3cuanNcIik7XHJcblxyXG4vLyBQaWNraW5nIGEgcmFuZG9tIHNrZXRjaCB0aGF0IHRoZSB1c2VyIGhhc24ndCBzZWVuIGJlZm9yZVxyXG52YXIgU2tldGNoID0gcmVxdWlyZShcIi4vcGljay1yYW5kb20tc2tldGNoLmpzXCIpKCk7XHJcblxyXG4vLyBBSkFYIHBhZ2UgbG9hZGVyLCB3aXRoIGNhbGxiYWNrIGZvciByZWxvYWRpbmcgd2lkZ2V0c1xyXG52YXIgbG9hZGVyID0gbmV3IExvYWRlcihvblBhZ2VMb2FkKTtcclxuXHJcbi8vIE1haW4gbmF2IHdpZGdldFxyXG52YXIgbWFpbk5hdiA9IG5ldyBNYWluTmF2KGxvYWRlcik7XHJcblxyXG4vLyBJbnRlcmFjdGl2ZSBsb2dvIGluIG5hdmJhclxyXG52YXIgbmF2ID0gJChcIm5hdi5uYXZiYXJcIik7XHJcbnZhciBuYXZMb2dvID0gbmF2LmZpbmQoXCIubmF2YmFyLWJyYW5kXCIpO1xyXG5uZXcgU2tldGNoKG5hdiwgbmF2TG9nbyk7XHJcblxyXG4vLyBXaWRnZXQgZ2xvYmFsc1xyXG52YXIgcG9ydGZvbGlvRmlsdGVyO1xyXG5cclxuLy8gTG9hZCBhbGwgd2lkZ2V0c1xyXG5vblBhZ2VMb2FkKCk7XHJcblxyXG4vLyBIYW5kbGUgYmFjay9mb3J3YXJkIGJ1dHRvbnNcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBvblBvcFN0YXRlKTtcclxuXHJcbmZ1bmN0aW9uIG9uUG9wU3RhdGUoZSkge1xyXG4gIC8vIExvYWRlciBzdG9yZXMgY3VzdG9tIGRhdGEgaW4gdGhlIHN0YXRlIC0gaW5jbHVkaW5nIHRoZSB1cmwgYW5kIHRoZSBxdWVyeVxyXG4gIHZhciB1cmwgPSAoZS5zdGF0ZSAmJiBlLnN0YXRlLnVybCkgfHwgXCIvaW5kZXguaHRtbFwiO1xyXG4gIHZhciBxdWVyeU9iamVjdCA9IChlLnN0YXRlICYmIGUuc3RhdGUucXVlcnkpIHx8IHt9O1xyXG5cclxuICBpZiAodXJsID09PSBsb2FkZXIuZ2V0TG9hZGVkUGF0aCgpICYmIHVybCA9PT0gXCIvd29yay5odG1sXCIpIHtcclxuICAgIC8vIFRoZSBjdXJyZW50ICYgcHJldmlvdXMgbG9hZGVkIHN0YXRlcyB3ZXJlIHdvcmsuaHRtbCwgc28ganVzdCByZWZpbHRlclxyXG4gICAgdmFyIGNhdGVnb3J5ID0gcXVlcnlPYmplY3QuY2F0ZWdvcnkgfHwgXCJhbGxcIjtcclxuICAgIHBvcnRmb2xpb0ZpbHRlci5zZWxlY3RDYXRlZ29yeShjYXRlZ29yeSk7XHJcbiAgfSBlbHNlIHtcclxuICAgIC8vIExvYWQgdGhlIG5ldyBwYWdlXHJcbiAgICBsb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgZmFsc2UpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gb25QYWdlTG9hZCgpIHtcclxuICAvLyBSZWxvYWQgYWxsIHBsdWdpbnMvd2lkZ2V0c1xyXG4gIG5ldyBIb3ZlclNsaWRlc2hvd3MoKTtcclxuICBwb3J0Zm9saW9GaWx0ZXIgPSBuZXcgUG9ydGZvbGlvRmlsdGVyKGxvYWRlcik7XHJcbiAgc2xpZGVzaG93cy5pbml0KCk7XHJcbiAgb2JqZWN0Rml0SW1hZ2VzKCk7XHJcbiAgc21hcnRxdW90ZXMoKTtcclxuXHJcbiAgLy8gUmVkaXJlY3QgZGF0YS1pbnRlcm5hbC1saW5rIGh5cGVybGlua3MgdGhyb3VnaCB0aGUgbG9hZGVyXHJcbiAgdmFyIGludGVybmFsTGlua3MgPSAkKFwiYVtkYXRhLWludGVybmFsLWxpbmtdXCIpO1xyXG4gIGludGVybmFsTGlua3Mub24oXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xyXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgIGxvYWRlci5sb2FkUGFnZSgkKGV2ZW50LmN1cnJlbnRUYXJnZXQpLmF0dHIoXCJocmVmXCIpLCB7fSwgdHJ1ZSk7XHJcbiAgfSk7XHJcblxyXG4gIC8vIFNsaWdodGx5IHJlZHVuZGFudCwgYnV0IHVwZGF0ZSB0aGUgbWFpbiBuYXYgdXNpbmcgdGhlIGN1cnJlbnQgVVJMLiBUaGlzXHJcbiAgLy8gaXMgaW1wb3J0YW50IGlmIGEgcGFnZSBpcyBsb2FkZWQgYnkgdHlwaW5nIGEgZnVsbCBVUkwgKGUuZy4gZ29pbmdcclxuICAvLyBkaXJlY3RseSB0byAvd29yay5odG1sKSBvciB3aGVuIG1vdmluZyBmcm9tIHdvcmsuaHRtbCB0byBhIHByb2plY3QuXHJcbiAgbWFpbk5hdi5zZXRBY3RpdmVGcm9tVXJsKCk7XHJcbn1cclxuXHJcbi8vIFdlJ3ZlIGhpdCB0aGUgbGFuZGluZyBwYWdlLCBsb2FkIHRoZSBhYm91dCBwYWdlXHJcbi8vIGlmIChsb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvXihcXC98XFwvaW5kZXguaHRtbHxpbmRleC5odG1sKSQvKSkge1xyXG4vLyAgICAgbG9hZGVyLmxvYWRQYWdlKFwiL2Fib3V0Lmh0bWxcIiwge30sIGZhbHNlKTtcclxuLy8gfVxyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IExvYWRlcjtcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBMb2FkZXIob25SZWxvYWQsIGZhZGVEdXJhdGlvbikge1xyXG4gIHRoaXMuXyRjb250ZW50ID0gJChcIiNjb250ZW50XCIpO1xyXG4gIHRoaXMuX29uUmVsb2FkID0gb25SZWxvYWQ7XHJcbiAgdGhpcy5fZmFkZUR1cmF0aW9uID0gZmFkZUR1cmF0aW9uICE9PSB1bmRlZmluZWQgPyBmYWRlRHVyYXRpb24gOiAyNTA7XHJcbiAgdGhpcy5fcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lO1xyXG59XHJcblxyXG5Mb2FkZXIucHJvdG90eXBlLmdldExvYWRlZFBhdGggPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5fcGF0aDtcclxufTtcclxuXHJcbkxvYWRlci5wcm90b3R5cGUubG9hZFBhZ2UgPSBmdW5jdGlvbih1cmwsIHF1ZXJ5T2JqZWN0LCBzaG91bGRQdXNoSGlzdG9yeSkge1xyXG4gIC8vIEZhZGUgdGhlbiBlbXB0eSB0aGUgY3VycmVudCBjb250ZW50c1xyXG4gIHRoaXMuXyRjb250ZW50LnZlbG9jaXR5KFxyXG4gICAgeyBvcGFjaXR5OiAwIH0sXHJcbiAgICB0aGlzLl9mYWRlRHVyYXRpb24sXHJcbiAgICBcInN3aW5nXCIsXHJcbiAgICBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5fJGNvbnRlbnQuZW1wdHkoKTtcclxuICAgICAgdGhpcy5fJGNvbnRlbnQubG9hZCh1cmwgKyBcIiAjY29udGVudFwiLCBvbkNvbnRlbnRGZXRjaGVkLmJpbmQodGhpcykpO1xyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxuXHJcbiAgLy8gRmFkZSB0aGUgbmV3IGNvbnRlbnQgaW4gYWZ0ZXIgaXQgaGFzIGJlZW4gZmV0Y2hlZFxyXG4gIGZ1bmN0aW9uIG9uQ29udGVudEZldGNoZWQocmVzcG9uc2VUZXh0LCB0ZXh0U3RhdHVzKSB7XHJcbiAgICBpZiAodGV4dFN0YXR1cyA9PT0gXCJlcnJvclwiKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBsb2FkaW5nIHRoZSBwYWdlLlwiKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBxdWVyeVN0cmluZyA9IHV0aWxpdGllcy5jcmVhdGVRdWVyeVN0cmluZyhxdWVyeU9iamVjdCk7XHJcbiAgICBpZiAoc2hvdWxkUHVzaEhpc3RvcnkpIHtcclxuICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICBxdWVyeTogcXVlcnlPYmplY3RcclxuICAgICAgICB9LFxyXG4gICAgICAgIG51bGwsXHJcbiAgICAgICAgdXJsICsgcXVlcnlTdHJpbmdcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVcGRhdGUgR29vZ2xlIGFuYWx5dGljc1xyXG4gICAgZ2EoXCJzZXRcIiwgXCJwYWdlXCIsIHVybCArIHF1ZXJ5U3RyaW5nKTtcclxuICAgIGdhKFwic2VuZFwiLCBcInBhZ2V2aWV3XCIpO1xyXG5cclxuICAgIHRoaXMuX3BhdGggPSBsb2NhdGlvbi5wYXRobmFtZTtcclxuICAgIHRoaXMuXyRjb250ZW50LnZlbG9jaXR5KHsgb3BhY2l0eTogMSB9LCB0aGlzLl9mYWRlRHVyYXRpb24sIFwic3dpbmdcIik7XHJcbiAgICB0aGlzLl9vblJlbG9hZCgpO1xyXG4gIH1cclxufTtcclxuIiwidmFyIGNvb2tpZXMgPSByZXF1aXJlKFwianMtY29va2llXCIpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG52YXIgc2tldGNoQ29uc3RydWN0b3JzID0ge1xyXG4gIFwiaGFsZnRvbmUtZmxhc2hsaWdodFwiOiByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9oYWxmdG9uZS1mbGFzaGxpZ2h0LXdvcmQuanNcIiksXHJcbiAgXCJub2lzeS13b3JkXCI6IHJlcXVpcmUoXCIuL2ludGVyYWN0aXZlLWxvZ29zL25vaXN5LXdvcmQtc2tldGNoLmpzXCIpLFxyXG4gIFwiY29ubmVjdC1wb2ludHNcIjogcmVxdWlyZShcIi4vaW50ZXJhY3RpdmUtbG9nb3MvY29ubmVjdC1wb2ludHMtc2tldGNoLmpzXCIpXHJcbn07XHJcbnZhciBudW1Ta2V0Y2hlcyA9IE9iamVjdC5rZXlzKHNrZXRjaENvbnN0cnVjdG9ycykubGVuZ3RoO1xyXG52YXIgY29va2llS2V5ID0gXCJzZWVuLXNrZXRjaC1uYW1lc1wiO1xyXG5cclxuLyoqXHJcbiAqIFBpY2sgYSByYW5kb20gc2tldGNoIHRoYXQgdXNlciBoYXNuJ3Qgc2VlbiB5ZXQuIElmIHRoZSB1c2VyIGhhcyBzZWVuIGFsbCB0aGVcclxuICogc2tldGNoZXMsIGp1c3QgcGljayBhIHJhbmRvbSBvbmUuIFRoaXMgdXNlcyBjb29raWVzIHRvIHRyYWNrIHdoYXQgdGhlIHVzZXJcclxuICogaGFzIHNlZW4gYWxyZWFkeS5cclxuICogQHJldHVybiB7RnVuY3Rpb259IENvbnN0cnVjdG9yIGZvciBhIFNrZXRjaCBjbGFzc1xyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwaWNrUmFuZG9tU2tldGNoKCkge1xyXG4gIHZhciBzZWVuU2tldGNoTmFtZXMgPSBjb29raWVzLmdldEpTT04oY29va2llS2V5KSB8fCBbXTtcclxuXHJcbiAgLy8gRmluZCB0aGUgbmFtZXMgb2YgdGhlIHVuc2VlbiBza2V0Y2hlc1xyXG4gIHZhciB1bnNlZW5Ta2V0Y2hOYW1lcyA9IGZpbmRVbnNlZW5Ta2V0Y2hlcyhzZWVuU2tldGNoTmFtZXMpO1xyXG5cclxuICAvLyBBbGwgc2tldGNoZXMgaGF2ZSBiZWVuIHNlZW5cclxuICBpZiAodW5zZWVuU2tldGNoTmFtZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAvLyBJZiB3ZSd2ZSBnb3QgbW9yZSB0aGVuIG9uZSBza2V0Y2gsIHRoZW4gbWFrZSBzdXJlIHRvIGNob29zZSBhIHJhbmRvbVxyXG4gICAgLy8gc2tldGNoIGV4Y2x1ZGluZyB0aGUgbW9zdCByZWNlbnRseSBzZWVuIHNrZXRjaFxyXG4gICAgaWYgKG51bVNrZXRjaGVzID4gMSkge1xyXG4gICAgICBzZWVuU2tldGNoTmFtZXMgPSBbc2VlblNrZXRjaE5hbWVzLnBvcCgpXTtcclxuICAgICAgdW5zZWVuU2tldGNoTmFtZXMgPSBmaW5kVW5zZWVuU2tldGNoZXMoc2VlblNrZXRjaE5hbWVzKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIElmIHdlJ3ZlIG9ubHkgZ290IG9uZSBza2V0Y2gsIHRoZW4gd2UgY2FuJ3QgZG8gbXVjaC4uLlxyXG4gICAgICBzZWVuU2tldGNoTmFtZXMgPSBbXTtcclxuICAgICAgdW5zZWVuU2tldGNoTmFtZXMgPSBPYmplY3Qua2V5cyhza2V0Y2hDb25zdHJ1Y3RvcnMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdmFyIHJhbmRTa2V0Y2hOYW1lID0gdXRpbHMucmFuZEFycmF5RWxlbWVudCh1bnNlZW5Ta2V0Y2hOYW1lcyk7XHJcbiAgc2VlblNrZXRjaE5hbWVzLnB1c2gocmFuZFNrZXRjaE5hbWUpO1xyXG5cclxuICAvLyBTdG9yZSB0aGUgZ2VuZXJhdGVkIHNrZXRjaCBpbiBhIGNvb2tpZS4gVGhpcyBjcmVhdGVzIGEgbW92aW5nIDcgZGF5XHJcbiAgLy8gd2luZG93IC0gYW55dGltZSB0aGUgc2l0ZSBpcyB2aXNpdGVkLCB0aGUgY29va2llIGlzIHJlZnJlc2hlZC5cclxuICBjb29raWVzLnNldChjb29raWVLZXksIHNlZW5Ta2V0Y2hOYW1lcywgeyBleHBpcmVzOiA3IH0pO1xyXG5cclxuICByZXR1cm4gc2tldGNoQ29uc3RydWN0b3JzW3JhbmRTa2V0Y2hOYW1lXTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGZpbmRVbnNlZW5Ta2V0Y2hlcyhzZWVuU2tldGNoTmFtZXMpIHtcclxuICB2YXIgdW5zZWVuU2tldGNoTmFtZXMgPSBbXTtcclxuICBmb3IgKHZhciBza2V0Y2hOYW1lIGluIHNrZXRjaENvbnN0cnVjdG9ycykge1xyXG4gICAgaWYgKHNlZW5Ta2V0Y2hOYW1lcy5pbmRleE9mKHNrZXRjaE5hbWUpID09PSAtMSkge1xyXG4gICAgICB1bnNlZW5Ta2V0Y2hOYW1lcy5wdXNoKHNrZXRjaE5hbWUpO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdW5zZWVuU2tldGNoTmFtZXM7XHJcbn1cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9GaWx0ZXI7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxudmFyIGRlZmF1bHRCcmVha3BvaW50cyA9IFtcclxuICB7IHdpZHRoOiAxMjAwLCBjb2xzOiAzLCBzcGFjaW5nOiAxNSB9LFxyXG4gIHsgd2lkdGg6IDk5MiwgY29sczogMywgc3BhY2luZzogMTUgfSxcclxuICB7IHdpZHRoOiA3MDAsIGNvbHM6IDMsIHNwYWNpbmc6IDE1IH0sXHJcbiAgeyB3aWR0aDogNjAwLCBjb2xzOiAyLCBzcGFjaW5nOiAxMCB9LFxyXG4gIHsgd2lkdGg6IDQ4MCwgY29sczogMiwgc3BhY2luZzogMTAgfSxcclxuICB7IHdpZHRoOiAzMjAsIGNvbHM6IDEsIHNwYWNpbmc6IDEwIH1cclxuXTtcclxuXHJcbmZ1bmN0aW9uIFBvcnRmb2xpb0ZpbHRlcihsb2FkZXIsIGJyZWFrcG9pbnRzLCBhc3BlY3RSYXRpbywgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgdGhpcy5fbG9hZGVyID0gbG9hZGVyO1xyXG4gIHRoaXMuX2dyaWRTcGFjaW5nID0gMDtcclxuICB0aGlzLl9hc3BlY3RSYXRpbyA9IGFzcGVjdFJhdGlvICE9PSB1bmRlZmluZWQgPyBhc3BlY3RSYXRpbyA6IDE2IC8gOTtcclxuICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb24gIT09IHVuZGVmaW5lZCA/IHRyYW5zaXRpb25EdXJhdGlvbiA6IDgwMDtcclxuICB0aGlzLl9icmVha3BvaW50cyA9IGJyZWFrcG9pbnRzICE9PSB1bmRlZmluZWQgPyBicmVha3BvaW50cy5zbGljZSgpIDogZGVmYXVsdEJyZWFrcG9pbnRzLnNsaWNlKCk7XHJcbiAgdGhpcy5fJGdyaWQgPSAkKFwiI3BvcnRmb2xpby1ncmlkXCIpO1xyXG4gIHRoaXMuXyRuYXYgPSAkKFwiI3BvcnRmb2xpby1uYXZcIik7XHJcbiAgdGhpcy5fJHByb2plY3RzID0gW107XHJcbiAgdGhpcy5fJGNhdGVnb3JpZXMgPSB7fTtcclxuICB0aGlzLl9yb3dzID0gMDtcclxuICB0aGlzLl9jb2xzID0gMDtcclxuICB0aGlzLl9pbWFnZUhlaWdodCA9IDA7XHJcbiAgdGhpcy5faW1hZ2VXaWR0aCA9IDA7XHJcblxyXG4gIC8vIFNvcnQgdGhlIGJyZWFrcG9pbnRzIGluIGRlc2NlbmRpbmcgb3JkZXJcclxuICB0aGlzLl9icmVha3BvaW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgIGlmIChhLndpZHRoIDwgYi53aWR0aCkgcmV0dXJuIC0xO1xyXG4gICAgZWxzZSBpZiAoYS53aWR0aCA+IGIud2lkdGgpIHJldHVybiAxO1xyXG4gICAgZWxzZSByZXR1cm4gMDtcclxuICB9KTtcclxuXHJcbiAgdGhpcy5fY2FjaGVQcm9qZWN0cygpO1xyXG4gIHRoaXMuX2NyZWF0ZUdyaWQoKTtcclxuXHJcbiAgdGhpcy5fJGdyaWQuZmluZChcIi5wcm9qZWN0IGFcIikub24oXCJjbGlja1wiLCB0aGlzLl9vblByb2plY3RDbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgdmFyIHFzID0gdXRpbGl0aWVzLmdldFF1ZXJ5UGFyYW1ldGVycygpO1xyXG4gIHZhciBpbml0aWFsQ2F0ZWdvcnkgPSBxcy5jYXRlZ29yeSB8fCBcImFsbFwiO1xyXG4gIHZhciBjYXRlZ29yeSA9IGluaXRpYWxDYXRlZ29yeS50b0xvd2VyQ2FzZSgpO1xyXG4gIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gdGhpcy5fJG5hdi5maW5kKFwiYVtkYXRhLWNhdGVnb3J5PVwiICsgY2F0ZWdvcnkgKyBcIl1cIik7XHJcbiAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG4gICQoXCIjcG9ydGZvbGlvLW5hdiBhXCIpLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25OYXZDbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX2NyZWF0ZUdyaWQuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuc2VsZWN0Q2F0ZWdvcnkgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xyXG4gIGNhdGVnb3J5ID0gKGNhdGVnb3J5ICYmIGNhdGVnb3J5LnRvTG93ZXJDYXNlKCkpIHx8IFwiYWxsXCI7XHJcbiAgdmFyICRzZWxlY3RlZE5hdiA9IHRoaXMuXyRuYXYuZmluZChcImFbZGF0YS1jYXRlZ29yeT1cIiArIGNhdGVnb3J5ICsgXCJdXCIpO1xyXG4gIGlmICgkc2VsZWN0ZWROYXYubGVuZ3RoICYmICEkc2VsZWN0ZWROYXYuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSB7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gJHNlbGVjdGVkTmF2O1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl9maWx0ZXJQcm9qZWN0cyhjYXRlZ29yeSk7XHJcbiAgfVxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZmlsdGVyUHJvamVjdHMgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xyXG4gIHZhciAkc2VsZWN0ZWRFbGVtZW50cyA9IHRoaXMuX2dldFByb2plY3RzSW5DYXRlZ29yeShjYXRlZ29yeSk7XHJcblxyXG4gIC8vIEFuaW1hdGUgdGhlIGdyaWQgdG8gdGhlIGNvcnJlY3QgaGVpZ2h0IHRvIGNvbnRhaW4gdGhlIHJvd3NcclxuICB0aGlzLl9hbmltYXRlR3JpZEhlaWdodCgkc2VsZWN0ZWRFbGVtZW50cy5sZW5ndGgpO1xyXG5cclxuICAvLyBMb29wIHRocm91Z2ggYWxsIHByb2plY3RzXHJcbiAgdGhpcy5fJHByb2plY3RzLmZvckVhY2goXHJcbiAgICBmdW5jdGlvbigkZWxlbWVudCkge1xyXG4gICAgICAvLyBTdG9wIGFsbCBhbmltYXRpb25zXHJcbiAgICAgICRlbGVtZW50LnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgICAgLy8gSWYgYW4gZWxlbWVudCBpcyBub3Qgc2VsZWN0ZWQ6IGRyb3Agei1pbmRleCAmIGFuaW1hdGUgb3BhY2l0eSAtPiBoaWRlXHJcbiAgICAgIHZhciBzZWxlY3RlZEluZGV4ID0gJHNlbGVjdGVkRWxlbWVudHMuaW5kZXhPZigkZWxlbWVudCk7XHJcbiAgICAgIGlmIChzZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICRlbGVtZW50LmNzcyhcInpJbmRleFwiLCAtMSk7XHJcbiAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sXHJcbiAgICAgICAgICBcImVhc2VJbk91dEN1YmljXCIsXHJcbiAgICAgICAgICBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gSWYgYW4gZWxlbWVudCBpcyBzZWxlY3RlZDogc2hvdyAmIGJ1bXAgei1pbmRleCAmIGFuaW1hdGUgdG8gcG9zaXRpb25cclxuICAgICAgICAkZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgJGVsZW1lbnQuY3NzKFwiekluZGV4XCIsIDApO1xyXG4gICAgICAgIHZhciBuZXdQb3MgPSB0aGlzLl9pbmRleFRvWFkoc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDEsXHJcbiAgICAgICAgICAgIHRvcDogbmV3UG9zLnkgKyBcInB4XCIsXHJcbiAgICAgICAgICAgIGxlZnQ6IG5ld1Bvcy54ICsgXCJweFwiXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uLFxyXG4gICAgICAgICAgXCJlYXNlSW5PdXRDdWJpY1wiXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2FuaW1hdGVHcmlkSGVpZ2h0ID0gZnVuY3Rpb24obnVtRWxlbWVudHMpIHtcclxuICB0aGlzLl8kZ3JpZC52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgdmFyIGN1clJvd3MgPSBNYXRoLmNlaWwobnVtRWxlbWVudHMgLyB0aGlzLl9jb2xzKTtcclxuICB0aGlzLl8kZ3JpZC52ZWxvY2l0eShcclxuICAgIHtcclxuICAgICAgaGVpZ2h0OiB0aGlzLl9pbWFnZUhlaWdodCAqIGN1clJvd3MgKyB0aGlzLl9ncmlkU3BhY2luZyAqIChjdXJSb3dzIC0gMSkgKyBcInB4XCJcclxuICAgIH0sXHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb25cclxuICApO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZ2V0UHJvamVjdHNJbkNhdGVnb3J5ID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcclxuICBpZiAoY2F0ZWdvcnkgPT09IFwiYWxsXCIpIHtcclxuICAgIHJldHVybiB0aGlzLl8kcHJvamVjdHM7XHJcbiAgfSBlbHNlIHtcclxuICAgIHJldHVybiB0aGlzLl8kY2F0ZWdvcmllc1tjYXRlZ29yeV0gfHwgW107XHJcbiAgfVxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fY2FjaGVQcm9qZWN0cyA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuXyRwcm9qZWN0cyA9IFtdO1xyXG4gIHRoaXMuXyRjYXRlZ29yaWVzID0ge307XHJcbiAgdGhpcy5fJGdyaWQuZmluZChcIi5wcm9qZWN0XCIpLmVhY2goXHJcbiAgICBmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG4gICAgICB0aGlzLl8kcHJvamVjdHMucHVzaCgkZWxlbWVudCk7XHJcbiAgICAgIHZhciBjYXRlZ29yeU5hbWVzID0gJGVsZW1lbnQuZGF0YShcImNhdGVnb3JpZXNcIikuc3BsaXQoXCIsXCIpO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhdGVnb3J5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgY2F0ZWdvcnkgPSAkLnRyaW0oY2F0ZWdvcnlOYW1lc1tpXSkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAoIXRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XSkge1xyXG4gICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldID0gWyRlbGVtZW50XTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldLnB1c2goJGVsZW1lbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxufTtcclxuXHJcbi8vIFBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhbGN1bGF0ZUdyaWQgPSBmdW5jdGlvbiAoKSB7XHJcbi8vICAgICB2YXIgZ3JpZFdpZHRoID0gdGhpcy5fJGdyaWQuaW5uZXJXaWR0aCgpO1xyXG4vLyAgICAgdGhpcy5fY29scyA9IE1hdGguZmxvb3IoKGdyaWRXaWR0aCArIHRoaXMuX2dyaWRTcGFjaW5nKSAvXHJcbi8vICAgICAgICAgKHRoaXMuX21pbkltYWdlV2lkdGggKyB0aGlzLl9ncmlkU3BhY2luZykpO1xyXG4vLyAgICAgdGhpcy5fcm93cyA9IE1hdGguY2VpbCh0aGlzLl8kcHJvamVjdHMubGVuZ3RoIC8gdGhpcy5fY29scyk7XHJcbi8vICAgICB0aGlzLl9pbWFnZVdpZHRoID0gKGdyaWRXaWR0aCAtICgodGhpcy5fY29scyAtIDEpICogdGhpcy5fZ3JpZFNwYWNpbmcpKSAvXHJcbi8vICAgICAgICAgdGhpcy5fY29scztcclxuLy8gICAgIHRoaXMuX2ltYWdlSGVpZ2h0ID0gdGhpcy5faW1hZ2VXaWR0aCAqICgxIC8gdGhpcy5fYXNwZWN0UmF0aW8pO1xyXG4vLyB9O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fY2FsY3VsYXRlR3JpZCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciBncmlkV2lkdGggPSB0aGlzLl8kZ3JpZC5pbm5lcldpZHRoKCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9icmVha3BvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgaWYgKGdyaWRXaWR0aCA8PSB0aGlzLl9icmVha3BvaW50c1tpXS53aWR0aCkge1xyXG4gICAgICB0aGlzLl9jb2xzID0gdGhpcy5fYnJlYWtwb2ludHNbaV0uY29scztcclxuICAgICAgdGhpcy5fZ3JpZFNwYWNpbmcgPSB0aGlzLl9icmVha3BvaW50c1tpXS5zcGFjaW5nO1xyXG4gICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcbiAgdGhpcy5fcm93cyA9IE1hdGguY2VpbCh0aGlzLl8kcHJvamVjdHMubGVuZ3RoIC8gdGhpcy5fY29scyk7XHJcbiAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAodGhpcy5fY29scyAtIDEpICogdGhpcy5fZ3JpZFNwYWNpbmcpIC8gdGhpcy5fY29scztcclxuICB0aGlzLl9pbWFnZUhlaWdodCA9IHRoaXMuX2ltYWdlV2lkdGggKiAoMSAvIHRoaXMuX2FzcGVjdFJhdGlvKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NyZWF0ZUdyaWQgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLl9jYWxjdWxhdGVHcmlkKCk7XHJcblxyXG4gIHRoaXMuXyRncmlkLmNzcyhcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XHJcbiAgdGhpcy5fJGdyaWQuY3NzKHtcclxuICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKiB0aGlzLl9yb3dzICsgdGhpcy5fZ3JpZFNwYWNpbmcgKiAodGhpcy5fcm93cyAtIDEpICsgXCJweFwiXHJcbiAgfSk7XHJcblxyXG4gIHRoaXMuXyRwcm9qZWN0cy5mb3JFYWNoKFxyXG4gICAgZnVuY3Rpb24oJGVsZW1lbnQsIGluZGV4KSB7XHJcbiAgICAgIHZhciBwb3MgPSB0aGlzLl9pbmRleFRvWFkoaW5kZXgpO1xyXG4gICAgICAkZWxlbWVudC5jc3Moe1xyXG4gICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgdG9wOiBwb3MueSArIFwicHhcIixcclxuICAgICAgICBsZWZ0OiBwb3MueCArIFwicHhcIixcclxuICAgICAgICB3aWR0aDogdGhpcy5faW1hZ2VXaWR0aCArIFwicHhcIixcclxuICAgICAgICBoZWlnaHQ6IHRoaXMuX2ltYWdlSGVpZ2h0ICsgXCJweFwiXHJcbiAgICAgIH0pO1xyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX29uTmF2Q2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcbiAgaWYgKCR0YXJnZXQuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSByZXR1cm47XHJcbiAgaWYgKHRoaXMuXyRhY3RpdmVOYXZJdGVtLmxlbmd0aCkgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgJHRhcmdldC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9ICR0YXJnZXQ7XHJcbiAgdmFyIGNhdGVnb3J5ID0gJHRhcmdldC5kYXRhKFwiY2F0ZWdvcnlcIikudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgaGlzdG9yeS5wdXNoU3RhdGUoXHJcbiAgICB7XHJcbiAgICAgIHVybDogXCIvd29yay5odG1sXCIsXHJcbiAgICAgIHF1ZXJ5OiB7IGNhdGVnb3J5OiBjYXRlZ29yeSB9XHJcbiAgICB9LFxyXG4gICAgbnVsbCxcclxuICAgIFwiL3dvcmsuaHRtbD9jYXRlZ29yeT1cIiArIGNhdGVnb3J5XHJcbiAgKTtcclxuXHJcbiAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fb25Qcm9qZWN0Q2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gIHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gIHZhciBwcm9qZWN0TmFtZSA9ICR0YXJnZXQuZGF0YShcIm5hbWVcIik7XHJcbiAgdmFyIHVybCA9IFwiL3Byb2plY3RzL1wiICsgcHJvamVjdE5hbWUgKyBcIi5odG1sXCI7XHJcbiAgdGhpcy5fbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIHRydWUpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5faW5kZXhUb1hZID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICB2YXIgciA9IE1hdGguZmxvb3IoaW5kZXggLyB0aGlzLl9jb2xzKTtcclxuICB2YXIgYyA9IGluZGV4ICUgdGhpcy5fY29scztcclxuICByZXR1cm4ge1xyXG4gICAgeDogYyAqIHRoaXMuX2ltYWdlV2lkdGggKyBjICogdGhpcy5fZ3JpZFNwYWNpbmcsXHJcbiAgICB5OiByICogdGhpcy5faW1hZ2VIZWlnaHQgKyByICogdGhpcy5fZ3JpZFNwYWNpbmdcclxuICB9O1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFNsaWRlc2hvd01vZGFsO1xyXG5cclxudmFyIEtFWV9DT0RFUyA9IHtcclxuICBMRUZUX0FSUk9XOiAzNyxcclxuICBSSUdIVF9BUlJPVzogMzksXHJcbiAgRVNDQVBFOiAyN1xyXG59O1xyXG5cclxuZnVuY3Rpb24gU2xpZGVzaG93TW9kYWwoJGNvbnRhaW5lciwgc2xpZGVzaG93KSB7XHJcbiAgdGhpcy5fc2xpZGVzaG93ID0gc2xpZGVzaG93O1xyXG5cclxuICB0aGlzLl8kbW9kYWwgPSAkY29udGFpbmVyLmZpbmQoXCIuc2xpZGVzaG93LW1vZGFsXCIpO1xyXG4gIHRoaXMuXyRvdmVybGF5ID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIubW9kYWwtb3ZlcmxheVwiKTtcclxuICB0aGlzLl8kY29udGVudCA9IHRoaXMuXyRtb2RhbC5maW5kKFwiLm1vZGFsLWNvbnRlbnRzXCIpO1xyXG4gIHRoaXMuXyRjYXB0aW9uID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIubW9kYWwtY2FwdGlvblwiKTtcclxuICB0aGlzLl8kaW1hZ2VDb250YWluZXIgPSB0aGlzLl8kbW9kYWwuZmluZChcIi5tb2RhbC1pbWFnZVwiKTtcclxuICB0aGlzLl8kaW1hZ2VMZWZ0ID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIuaW1hZ2UtYWR2YW5jZS1sZWZ0XCIpO1xyXG4gIHRoaXMuXyRpbWFnZVJpZ2h0ID0gdGhpcy5fJG1vZGFsLmZpbmQoXCIuaW1hZ2UtYWR2YW5jZS1yaWdodFwiKTtcclxuXHJcbiAgdGhpcy5faW5kZXggPSAwOyAvLyBJbmRleCBvZiBzZWxlY3RlZCBpbWFnZVxyXG4gIHRoaXMuX2lzT3BlbiA9IGZhbHNlO1xyXG5cclxuICB0aGlzLl8kaW1hZ2VMZWZ0Lm9uKFwiY2xpY2tcIiwgdGhpcy5hZHZhbmNlTGVmdC5iaW5kKHRoaXMpKTtcclxuICB0aGlzLl8kaW1hZ2VSaWdodC5vbihcImNsaWNrXCIsIHRoaXMuYWR2YW5jZVJpZ2h0LmJpbmQodGhpcykpO1xyXG4gICQoZG9jdW1lbnQpLm9uKFwia2V5ZG93blwiLCB0aGlzLl9vbktleURvd24uYmluZCh0aGlzKSk7XHJcblxyXG4gIC8vIEdpdmUgalF1ZXJ5IGNvbnRyb2wgb3ZlciBzaG93aW5nL2hpZGluZ1xyXG4gIHRoaXMuXyRtb2RhbC5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XHJcbiAgdGhpcy5fJG1vZGFsLmhpZGUoKTtcclxuXHJcbiAgLy8gRXZlbnRzXHJcbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xyXG4gIHRoaXMuXyRvdmVybGF5Lm9uKFwiY2xpY2tcIiwgdGhpcy5jbG9zZS5iaW5kKHRoaXMpKTtcclxuICB0aGlzLl8kbW9kYWwuZmluZChcIi5tb2RhbC1jbG9zZVwiKS5vbihcImNsaWNrXCIsIHRoaXMuY2xvc2UuYmluZCh0aGlzKSk7XHJcblxyXG4gIHRoaXMuX3VwZGF0ZUNvbnRyb2xzKCk7XHJcblxyXG4gIC8vIFNpemUgb2YgZm9udGF3ZXNvbWUgaWNvbnMgbmVlZHMgYSBzbGlnaHQgZGVsYXkgKHVudGlsIHN0YWNrIGlzIGNsZWFyKSBmb3JcclxuICAvLyBzb21lIHJlYXNvblxyXG4gIHNldFRpbWVvdXQoXHJcbiAgICBmdW5jdGlvbigpIHtcclxuICAgICAgdGhpcy5fb25SZXNpemUoKTtcclxuICAgIH0uYmluZCh0aGlzKSxcclxuICAgIDBcclxuICApO1xyXG59XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUuYWR2YW5jZUxlZnQgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLnNob3dJbWFnZUF0KHRoaXMuX2luZGV4IC0gMSk7XHJcbn07XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUuYWR2YW5jZVJpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5zaG93SW1hZ2VBdCh0aGlzLl9pbmRleCArIDEpO1xyXG59O1xyXG5cclxuU2xpZGVzaG93TW9kYWwucHJvdG90eXBlLnNob3dJbWFnZUF0ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICBpbmRleCA9IE1hdGgubWF4KGluZGV4LCAwKTtcclxuICBpbmRleCA9IE1hdGgubWluKGluZGV4LCB0aGlzLl9zbGlkZXNob3cuZ2V0TnVtSW1hZ2VzKCkgLSAxKTtcclxuICB0aGlzLl9pbmRleCA9IGluZGV4O1xyXG4gIHZhciAkaW1nID0gdGhpcy5fc2xpZGVzaG93LmdldEdhbGxlcnlJbWFnZSh0aGlzLl9pbmRleCk7XHJcbiAgdmFyIGNhcHRpb24gPSB0aGlzLl9zbGlkZXNob3cuZ2V0Q2FwdGlvbih0aGlzLl9pbmRleCk7XHJcblxyXG4gIHRoaXMuXyRpbWFnZUNvbnRhaW5lci5lbXB0eSgpO1xyXG4gICQoXCI8aW1nPlwiLCB7IHNyYzogJGltZy5hdHRyKFwic3JjXCIpIH0pLmFwcGVuZFRvKHRoaXMuXyRpbWFnZUNvbnRhaW5lcik7XHJcblxyXG4gIHRoaXMuXyRjYXB0aW9uLmVtcHR5KCk7XHJcbiAgaWYgKGNhcHRpb24pIHtcclxuICAgICQoXCI8c3Bhbj5cIilcclxuICAgICAgLmFkZENsYXNzKFwiZmlndXJlLW51bWJlclwiKVxyXG4gICAgICAudGV4dChcIkZpZy4gXCIgKyAodGhpcy5faW5kZXggKyAxKSArIFwiOiBcIilcclxuICAgICAgLmFwcGVuZFRvKHRoaXMuXyRjYXB0aW9uKTtcclxuICAgICQoXCI8c3Bhbj5cIilcclxuICAgICAgLmFkZENsYXNzKFwiY2FwdGlvbi10ZXh0XCIpXHJcbiAgICAgIC50ZXh0KGNhcHRpb24pXHJcbiAgICAgIC5hcHBlbmRUbyh0aGlzLl8kY2FwdGlvbik7XHJcbiAgfVxyXG5cclxuICB0aGlzLl9vblJlc2l6ZSgpO1xyXG4gIHRoaXMuX3VwZGF0ZUNvbnRyb2xzKCk7XHJcbn07XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgaW5kZXggPSBpbmRleCB8fCAwO1xyXG4gIHRoaXMuXyRtb2RhbC5zaG93KCk7XHJcbiAgdGhpcy5zaG93SW1hZ2VBdChpbmRleCk7XHJcbiAgdGhpcy5faXNPcGVuID0gdHJ1ZTtcclxufTtcclxuXHJcblNsaWRlc2hvd01vZGFsLnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuXyRtb2RhbC5oaWRlKCk7XHJcbiAgdGhpcy5faXNPcGVuID0gZmFsc2U7XHJcbn07XHJcblxyXG5TbGlkZXNob3dNb2RhbC5wcm90b3R5cGUuX29uS2V5RG93biA9IGZ1bmN0aW9uKGUpIHtcclxuICBpZiAoIXRoaXMuX2lzT3BlbikgcmV0dXJuO1xyXG4gIGlmIChlLndoaWNoID09PSBLRVlfQ09ERVMuTEVGVF9BUlJPVykge1xyXG4gICAgdGhpcy5hZHZhbmNlTGVmdCgpO1xyXG4gIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gS0VZX0NPREVTLlJJR0hUX0FSUk9XKSB7XHJcbiAgICB0aGlzLmFkdmFuY2VSaWdodCgpO1xyXG4gIH0gZWxzZSBpZiAoZS53aGljaCA9PT0gS0VZX0NPREVTLkVTQ0FQRSkge1xyXG4gICAgdGhpcy5jbG9zZSgpO1xyXG4gIH1cclxufTtcclxuXHJcblNsaWRlc2hvd01vZGFsLnByb3RvdHlwZS5fdXBkYXRlQ29udHJvbHMgPSBmdW5jdGlvbigpIHtcclxuICAvLyBSZS1lbmFibGVcclxuICB0aGlzLl8kaW1hZ2VSaWdodC5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIHRoaXMuXyRpbWFnZUxlZnQucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuXHJcbiAgLy8gRGlzYWJsZSBpZiB3ZSd2ZSByZWFjaGVkIHRoZSB0aGUgbWF4IG9yIG1pbiBsaW1pdFxyXG4gIGlmICh0aGlzLl9pbmRleCA+PSB0aGlzLl9zbGlkZXNob3cuZ2V0TnVtSW1hZ2VzKCkgLSAxKSB7XHJcbiAgICB0aGlzLl8kaW1hZ2VSaWdodC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIH0gZWxzZSBpZiAodGhpcy5faW5kZXggPD0gMCkge1xyXG4gICAgdGhpcy5fJGltYWdlTGVmdC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIH1cclxufTtcclxuXHJcblNsaWRlc2hvd01vZGFsLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgJGltYWdlID0gdGhpcy5fJGltYWdlQ29udGFpbmVyLmZpbmQoXCJpbWdcIik7XHJcblxyXG4gIC8vIFJlc2V0IHRoZSBjb250ZW50J3Mgd2lkdGhcclxuICB0aGlzLl8kY29udGVudC53aWR0aChcIlwiKTtcclxuXHJcbiAgLy8gRmluZCB0aGUgc2l6ZSBvZiB0aGUgY29tcG9uZW50cyB0aGF0IG5lZWQgdG8gYmUgZGlzcGxheWVkIGluIGFkZGl0aW9uIHRvXHJcbiAgLy8gdGhlIGltYWdlXHJcbiAgdmFyIGNvbnRyb2xzV2lkdGggPSB0aGlzLl8kaW1hZ2VMZWZ0Lm91dGVyV2lkdGgodHJ1ZSkgKyB0aGlzLl8kaW1hZ2VSaWdodC5vdXRlcldpZHRoKHRydWUpO1xyXG4gIC8vIEhhY2sgZm9yIG5vdyAtIGJ1ZGdldCBmb3IgMnggdGhlIGNhcHRpb24gaGVpZ2h0LlxyXG4gIHZhciBjYXB0aW9uSGVpZ2h0ID0gMiAqIHRoaXMuXyRjYXB0aW9uLm91dGVySGVpZ2h0KHRydWUpO1xyXG4gIC8vIHZhciBpbWFnZVBhZGRpbmcgPSAkaW1hZ2UuaW5uZXJXaWR0aCgpO1xyXG5cclxuICAvLyBDYWxjdWxhdGUgdGhlIGF2YWlsYWJsZSBhcmVhIGZvciB0aGUgbW9kYWxcclxuICB2YXIgbXcgPSB0aGlzLl8kbW9kYWwud2lkdGgoKSAtIGNvbnRyb2xzV2lkdGg7XHJcbiAgdmFyIG1oID0gdGhpcy5fJG1vZGFsLmhlaWdodCgpIC0gY2FwdGlvbkhlaWdodDtcclxuXHJcbiAgLy8gRml0IHRoZSBpbWFnZSB0byB0aGUgcmVtYWluaW5nIHNjcmVlbiByZWFsIGVzdGF0ZVxyXG4gIHZhciBzZXRTaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgaXcgPSAkaW1hZ2UucHJvcChcIm5hdHVyYWxXaWR0aFwiKTtcclxuICAgIHZhciBpaCA9ICRpbWFnZS5wcm9wKFwibmF0dXJhbEhlaWdodFwiKTtcclxuICAgIHZhciBzdyA9IGl3IC8gbXc7XHJcbiAgICB2YXIgc2ggPSBpaCAvIG1oO1xyXG4gICAgdmFyIHMgPSBNYXRoLm1heChzdywgc2gpO1xyXG5cclxuICAgIC8vIFNldCB3aWR0aC9oZWlnaHQgdXNpbmcgQ1NTIGluIG9yZGVyIHRvIHJlc3BlY3QgYm94LXNpemluZ1xyXG4gICAgaWYgKHMgPiAxKSB7XHJcbiAgICAgICRpbWFnZS5jc3MoXCJ3aWR0aFwiLCBpdyAvIHMgKyBcInB4XCIpO1xyXG4gICAgICAkaW1hZ2UuY3NzKFwiaGVpZ2h0XCIsIGloIC8gcyArIFwicHhcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkaW1hZ2UuY3NzKFwid2lkdGhcIiwgaXcgKyBcInB4XCIpO1xyXG4gICAgICAkaW1hZ2UuY3NzKFwiaGVpZ2h0XCIsIGloICsgXCJweFwiKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLl8kaW1hZ2VSaWdodC5jc3MoXCJ0b3BcIiwgJGltYWdlLm91dGVySGVpZ2h0KCkgLyAyICsgXCJweFwiKTtcclxuICAgIHRoaXMuXyRpbWFnZUxlZnQuY3NzKFwidG9wXCIsICRpbWFnZS5vdXRlckhlaWdodCgpIC8gMiArIFwicHhcIik7XHJcblxyXG4gICAgLy8gU2V0IHRoZSBjb250ZW50IHdyYXBwZXIgdG8gYmUgdGhlIHdpZHRoIG9mIHRoZSBpbWFnZS4gVGhpcyB3aWxsIGtlZXBcclxuICAgIC8vIHRoZSBjYXB0aW9uIGZyb20gZXhwYW5kaW5nIGJleW9uZCB0aGUgaW1hZ2UuXHJcbiAgICB0aGlzLl8kY29udGVudC53aWR0aCgkaW1hZ2Uub3V0ZXJXaWR0aCh0cnVlKSk7XHJcbiAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICBpZiAoJGltYWdlLnByb3AoXCJjb21wbGV0ZVwiKSkgc2V0U2l6ZSgpO1xyXG4gIGVsc2UgJGltYWdlLm9uZShcImxvYWRcIiwgc2V0U2l6ZSk7XHJcbn07XHJcbiIsInZhciBTbGlkZXNob3dNb2RhbCA9IHJlcXVpcmUoXCIuL3NsaWRlc2hvdy1tb2RhbC5qc1wiKTtcclxudmFyIFRodW1ibmFpbFNsaWRlciA9IHJlcXVpcmUoXCIuL3RodW1ibmFpbC1zbGlkZXIuanNcIik7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBpbml0OiBmdW5jdGlvbih0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkID8gdHJhbnNpdGlvbkR1cmF0aW9uIDogNDAwO1xyXG4gICAgdGhpcy5fc2xpZGVzaG93cyA9IFtdO1xyXG4gICAgJChcIi5zbGlkZXNob3dcIikuZWFjaChcclxuICAgICAgZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgc2xpZGVzaG93ID0gbmV3IFNsaWRlc2hvdygkKGVsZW1lbnQpLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xyXG4gICAgICAgIHRoaXMuX3NsaWRlc2hvd3MucHVzaChzbGlkZXNob3cpO1xyXG4gICAgICB9LmJpbmQodGhpcylcclxuICAgICk7XHJcbiAgfVxyXG59O1xyXG5cclxuZnVuY3Rpb24gU2xpZGVzaG93KCRjb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbjtcclxuICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICB0aGlzLl9pbmRleCA9IDA7IC8vIEluZGV4IG9mIHNlbGVjdGVkIGltYWdlXHJcblxyXG4gIC8vIENyZWF0ZSBjb21wb25lbnRzXHJcbiAgdGhpcy5fdGh1bWJuYWlsU2xpZGVyID0gbmV3IFRodW1ibmFpbFNsaWRlcigkY29udGFpbmVyLCB0aGlzKTtcclxuICB0aGlzLl9tb2RhbCA9IG5ldyBTbGlkZXNob3dNb2RhbCgkY29udGFpbmVyLCB0aGlzKTtcclxuXHJcbiAgLy8gQ2FjaGUgYW5kIGNyZWF0ZSBuZWNlc3NhcnkgRE9NIGVsZW1lbnRzXHJcbiAgdGhpcy5fJGNhcHRpb25Db250YWluZXIgPSAkY29udGFpbmVyLmZpbmQoXCIuY2FwdGlvblwiKTtcclxuICB0aGlzLl8kc2VsZWN0ZWRJbWFnZUNvbnRhaW5lciA9ICRjb250YWluZXIuZmluZChcIi5zZWxlY3RlZC1pbWFnZVwiKTtcclxuXHJcbiAgLy8gT3BlbiBtb2RhbCBvbiBjbGlja2luZyBzZWxlY3RlZCBpbWFnZVxyXG4gIHRoaXMuXyRzZWxlY3RlZEltYWdlQ29udGFpbmVyLm9uKFxyXG4gICAgXCJjbGlja1wiLFxyXG4gICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuX21vZGFsLm9wZW4odGhpcy5faW5kZXgpO1xyXG4gICAgfS5iaW5kKHRoaXMpXHJcbiAgKTtcclxuXHJcbiAgLy8gTG9hZCBpbWFnZXNcclxuICB0aGlzLl8kZ2FsbGVyeUltYWdlcyA9IHRoaXMuX2xvYWRHYWxsZXJ5SW1hZ2VzKCk7XHJcbiAgdGhpcy5fbnVtSW1hZ2VzID0gdGhpcy5fJGdhbGxlcnlJbWFnZXMubGVuZ3RoO1xyXG5cclxuICAvLyBTaG93IHRoZSBmaXJzdCBpbWFnZVxyXG4gIHRoaXMuc2hvd0ltYWdlKDApO1xyXG59XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldEFjdGl2ZUluZGV4ID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMuX2luZGV4O1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXROdW1JbWFnZXMgPSBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gdGhpcy5fbnVtSW1hZ2VzO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXRHYWxsZXJ5SW1hZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIHJldHVybiB0aGlzLl8kZ2FsbGVyeUltYWdlc1tpbmRleF07XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldENhcHRpb24gPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIHJldHVybiB0aGlzLl8kZ2FsbGVyeUltYWdlc1tpbmRleF0uZGF0YShcImNhcHRpb25cIik7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLnNob3dJbWFnZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgLy8gUmVzZXQgYWxsIGltYWdlcyB0byBpbnZpc2libGUgYW5kIGxvd2VzdCB6LWluZGV4LiBUaGlzIGNvdWxkIGJlIHNtYXJ0ZXIsXHJcbiAgLy8gbGlrZSBIb3ZlclNsaWRlc2hvdywgYW5kIG9ubHkgcmVzZXQgZXhhY3RseSB3aGF0IHdlIG5lZWQsIGJ1dCB3ZSBhcmVuJ3RcclxuICAvLyB3YXN0aW5nIHRoYXQgbWFueSBjeWNsZXMuXHJcbiAgdGhpcy5fJGdhbGxlcnlJbWFnZXMuZm9yRWFjaChmdW5jdGlvbigkZ2FsbGVyeUltYWdlKSB7XHJcbiAgICAkZ2FsbGVyeUltYWdlLmNzcyh7XHJcbiAgICAgIHpJbmRleDogMCxcclxuICAgICAgb3BhY2l0eTogMFxyXG4gICAgfSk7XHJcbiAgICAkZ2FsbGVyeUltYWdlLnZlbG9jaXR5KFwic3RvcFwiKTsgLy8gU3RvcCBhbnkgYW5pbWF0aW9uc1xyXG4gIH0sIHRoaXMpO1xyXG5cclxuICAvLyBDYWNoZSByZWZlcmVuY2VzIHRvIHRoZSBsYXN0IGFuZCBjdXJyZW50IGltYWdlXHJcbiAgdmFyICRsYXN0SW1hZ2UgPSB0aGlzLl8kZ2FsbGVyeUltYWdlc1t0aGlzLl9pbmRleF07XHJcbiAgdmFyICRjdXJyZW50SW1hZ2UgPSB0aGlzLl8kZ2FsbGVyeUltYWdlc1tpbmRleF07XHJcbiAgdGhpcy5faW5kZXggPSBpbmRleDtcclxuXHJcbiAgLy8gTWFrZSB0aGUgbGFzdCBpbWFnZSB2aXNpc2JsZSBhbmQgdGhlbiBhbmltYXRlIHRoZSBjdXJyZW50IGltYWdlIGludG8gdmlld1xyXG4gIC8vIG9uIHRvcCBvZiB0aGUgbGFzdFxyXG4gICRsYXN0SW1hZ2UuY3NzKFwiekluZGV4XCIsIDEpO1xyXG4gICRjdXJyZW50SW1hZ2UuY3NzKFwiekluZGV4XCIsIDIpO1xyXG4gICRsYXN0SW1hZ2UuY3NzKFwib3BhY2l0eVwiLCAxKTtcclxuICAkY3VycmVudEltYWdlLnZlbG9jaXR5KHsgb3BhY2l0eTogMSB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFwiZWFzZUluT3V0UXVhZFwiKTtcclxuXHJcbiAgLy8gQ3JlYXRlIHRoZSBjYXB0aW9uLCBpZiBpdCBleGlzdHMgb24gdGhlIHRodW1ibmFpbFxyXG4gIHZhciBjYXB0aW9uID0gJGN1cnJlbnRJbWFnZS5kYXRhKFwiY2FwdGlvblwiKTtcclxuICBpZiAoY2FwdGlvbikge1xyXG4gICAgdGhpcy5fJGNhcHRpb25Db250YWluZXIuZW1wdHkoKTtcclxuICAgICQoXCI8c3Bhbj5cIilcclxuICAgICAgLmFkZENsYXNzKFwiZmlndXJlLW51bWJlclwiKVxyXG4gICAgICAudGV4dChcIkZpZy4gXCIgKyAodGhpcy5faW5kZXggKyAxKSArIFwiOiBcIilcclxuICAgICAgLmFwcGVuZFRvKHRoaXMuXyRjYXB0aW9uQ29udGFpbmVyKTtcclxuICAgICQoXCI8c3Bhbj5cIilcclxuICAgICAgLmFkZENsYXNzKFwiY2FwdGlvbi10ZXh0XCIpXHJcbiAgICAgIC50ZXh0KGNhcHRpb24pXHJcbiAgICAgIC5hcHBlbmRUbyh0aGlzLl8kY2FwdGlvbkNvbnRhaW5lcik7XHJcbiAgfVxyXG5cclxuICAvLyBPYmplY3QgaW1hZ2UgZml0IHBvbHlmaWxsIGJyZWFrcyBqUXVlcnkgYXR0ciguLi4pLCBzbyBmYWxsYmFjayB0byBqdXN0XHJcbiAgLy8gdXNpbmcgZWxlbWVudC5zcmNcclxuICAvLyBUT0RPOiBMYXp5IVxyXG4gIC8vIGlmICgkY3VycmVudEltYWdlLmdldCgwKS5zcmMgPT09IFwiXCIpIHtcclxuICAvLyAgICAgJGN1cnJlbnRJbWFnZS5nZXQoMCkuc3JjID0gJGN1cnJlbnRJbWFnZS5kYXRhKFwiaW1hZ2UtdXJsXCIpO1xyXG4gIC8vIH1cclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX2xvYWRHYWxsZXJ5SW1hZ2VzID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gQ3JlYXRlIGVtcHR5IGltYWdlcyBpbiB0aGUgZ2FsbGVyeSBmb3IgZWFjaCB0aHVtYm5haWwuIFRoaXMgaGVscHMgdXMgZG9cclxuICAvLyBsYXp5IGxvYWRpbmcgb2YgZ2FsbGVyeSBpbWFnZXMgYW5kIGFsbG93cyB1cyB0byBjcm9zcy1mYWRlIGltYWdlcy5cclxuICB2YXIgJGdhbGxlcnlJbWFnZXMgPSBbXTtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3RodW1ibmFpbFNsaWRlci5nZXROdW1UaHVtYm5haWxzKCk7IGkgKz0gMSkge1xyXG4gICAgLy8gR2V0IHRoZSB0aHVtYm5haWwgZWxlbWVudCB3aGljaCBoYXMgcGF0aCBhbmQgY2FwdGlvbiBkYXRhXHJcbiAgICB2YXIgJHRodW1iID0gdGhpcy5fdGh1bWJuYWlsU2xpZGVyLmdldCRUaHVtYm5haWwoaSk7XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBpZCBmcm9tIHRoZSBwYXRoIHRvIHRoZSBsYXJnZSBpbWFnZVxyXG4gICAgdmFyIGxhcmdlUGF0aCA9ICR0aHVtYi5kYXRhKFwibGFyZ2UtcGF0aFwiKTtcclxuICAgIHZhciBpZCA9IGxhcmdlUGF0aFxyXG4gICAgICAuc3BsaXQoXCIvXCIpXHJcbiAgICAgIC5wb3AoKVxyXG4gICAgICAuc3BsaXQoXCIuXCIpWzBdO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIGdhbGxlcnkgaW1hZ2UgZWxlbWVudFxyXG4gICAgdmFyICRnYWxsZXJ5SW1hZ2UgPSAkKFwiPGltZz5cIiwgeyBpZDogaWQgfSlcclxuICAgICAgLmNzcyh7XHJcbiAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICB0b3A6IFwiMHB4XCIsXHJcbiAgICAgICAgbGVmdDogXCIwcHhcIixcclxuICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgIHpJbmRleDogMFxyXG4gICAgICB9KVxyXG4gICAgICAuZGF0YShcImltYWdlLXVybFwiLCBsYXJnZVBhdGgpXHJcbiAgICAgIC5kYXRhKFwiY2FwdGlvblwiLCAkdGh1bWIuZGF0YShcImNhcHRpb25cIikpXHJcbiAgICAgIC5hcHBlbmRUbyh0aGlzLl8kc2VsZWN0ZWRJbWFnZUNvbnRhaW5lcik7XHJcbiAgICAkZ2FsbGVyeUltYWdlLmdldCgwKS5zcmMgPSBsYXJnZVBhdGg7IC8vIFRPRE86IE1ha2UgdGhpcyBsYXp5IVxyXG4gICAgJGdhbGxlcnlJbWFnZXMucHVzaCgkZ2FsbGVyeUltYWdlKTtcclxuICB9XHJcbiAgcmV0dXJuICRnYWxsZXJ5SW1hZ2VzO1xyXG59O1xyXG4iLCJtb2R1bGUuZXhwb3J0cyA9IFRodW1ibmFpbFNsaWRlcjtcclxuXHJcbmZ1bmN0aW9uIFRodW1ibmFpbFNsaWRlcigkY29udGFpbmVyLCBzbGlkZXNob3cpIHtcclxuICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICB0aGlzLl9zbGlkZXNob3cgPSBzbGlkZXNob3c7XHJcblxyXG4gIHRoaXMuX2luZGV4ID0gMDsgLy8gSW5kZXggb2Ygc2VsZWN0ZWQgdGh1bWJuYWlsXHJcbiAgdGhpcy5fc2Nyb2xsSW5kZXggPSAwOyAvLyBJbmRleCBvZiB0aGUgdGh1bWJuYWlsIHRoYXQgaXMgY3VycmVudGx5IGNlbnRlcmVkXHJcblxyXG4gIC8vIENhY2hlIGFuZCBjcmVhdGUgbmVjZXNzYXJ5IERPTSBlbGVtZW50c1xyXG4gIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIgPSAkY29udGFpbmVyLmZpbmQoXCIudGh1bWJuYWlsc1wiKTtcclxuICB0aGlzLl8kdGh1bWJuYWlsSW1hZ2VzID0gdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci5maW5kKFwiaW1nXCIpO1xyXG4gIHRoaXMuXyR2aXNpYmxlVGh1bWJuYWlsV3JhcCA9ICRjb250YWluZXIuZmluZChcIi52aXNpYmxlLXRodW1ibmFpbHNcIik7XHJcbiAgdGhpcy5fJGFkdmFuY2VMZWZ0ID0gJGNvbnRhaW5lci5maW5kKFwiLnRodW1ibmFpbC1hZHZhbmNlLWxlZnRcIik7XHJcbiAgdGhpcy5fJGFkdmFuY2VSaWdodCA9ICRjb250YWluZXIuZmluZChcIi50aHVtYm5haWwtYWR2YW5jZS1yaWdodFwiKTtcclxuXHJcbiAgLy8gTG9vcCB0aHJvdWdoIHRoZSB0aHVtYm5haWxzLCBnaXZlIHRoZW0gYW4gaW5kZXggZGF0YSBhdHRyaWJ1dGUgYW5kIGNhY2hlXHJcbiAgLy8gYSByZWZlcmVuY2UgdG8gdGhlbSBpbiBhbiBhcnJheVxyXG4gIHRoaXMuXyR0aHVtYm5haWxzID0gW107XHJcbiAgdGhpcy5fJHRodW1ibmFpbEltYWdlcy5lYWNoKFxyXG4gICAgZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgdmFyICR0aHVtYm5haWwgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAkdGh1bWJuYWlsLmRhdGEoXCJpbmRleFwiLCBpbmRleCk7XHJcbiAgICAgIHRoaXMuXyR0aHVtYm5haWxzLnB1c2goJHRodW1ibmFpbCk7XHJcbiAgICB9LmJpbmQodGhpcylcclxuICApO1xyXG4gIHRoaXMuX251bUltYWdlcyA9IHRoaXMuXyR0aHVtYm5haWxzLmxlbmd0aDtcclxuXHJcbiAgLy8gTGVmdC9yaWdodCBjb250cm9sc1xyXG4gIHRoaXMuXyRhZHZhbmNlTGVmdC5vbihcImNsaWNrXCIsIHRoaXMuYWR2YW5jZUxlZnQuYmluZCh0aGlzKSk7XHJcbiAgdGhpcy5fJGFkdmFuY2VSaWdodC5vbihcImNsaWNrXCIsIHRoaXMuYWR2YW5jZVJpZ2h0LmJpbmQodGhpcykpO1xyXG5cclxuICAvLyBDbGlja2luZyBhIHRodW1ibmFpbFxyXG4gIHRoaXMuXyR0aHVtYm5haWxJbWFnZXMub24oXCJjbGlja1wiLCB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICB0aGlzLl9hY3RpdmF0ZVRodW1ibmFpbCgwKTtcclxuXHJcbiAgLy8gUmVzaXplXHJcbiAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcykpO1xyXG5cclxuICAvLyBGb3Igc29tZSByZWFzb24sIHRoZSBzaXppbmcgb24gdGhlIGNvbnRyb2xzIGlzIG1lc3NlZCB1cCBpZiBpdCBydW5zXHJcbiAgLy8gaW1tZWRpYXRlbHkgLSBkZWxheSBzaXppbmcgdW50aWwgc3RhY2sgaXMgY2xlYXJcclxuICBzZXRUaW1lb3V0KFxyXG4gICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgIHRoaXMuX29uUmVzaXplKCk7XHJcbiAgICB9LmJpbmQodGhpcyksXHJcbiAgICAwXHJcbiAgKTtcclxufVxyXG5cclxuVGh1bWJuYWlsU2xpZGVyLnByb3RvdHlwZS5nZXRBY3RpdmVJbmRleCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLl9pbmRleDtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuZ2V0TnVtVGh1bWJuYWlscyA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLl9udW1JbWFnZXM7XHJcbn07XHJcblxyXG5UaHVtYm5haWxTbGlkZXIucHJvdG90eXBlLmdldCRUaHVtYm5haWwgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIHJldHVybiB0aGlzLl8kdGh1bWJuYWlsc1tpbmRleF07XHJcbn07XHJcblxyXG5UaHVtYm5haWxTbGlkZXIucHJvdG90eXBlLmFkdmFuY2VMZWZ0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG5ld0luZGV4ID0gdGhpcy5fc2Nyb2xsSW5kZXggLSB0aGlzLl9udW1WaXNpYmxlO1xyXG4gIG5ld0luZGV4ID0gTWF0aC5tYXgobmV3SW5kZXgsIDApO1xyXG4gIHRoaXMuX3Njcm9sbFRvVGh1bWJuYWlsKG5ld0luZGV4KTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuYWR2YW5jZVJpZ2h0ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIG5ld0luZGV4ID0gdGhpcy5fc2Nyb2xsSW5kZXggKyB0aGlzLl9udW1WaXNpYmxlO1xyXG4gIG5ld0luZGV4ID0gTWF0aC5taW4obmV3SW5kZXgsIHRoaXMuX251bUltYWdlcyAtIDEpO1xyXG4gIHRoaXMuX3Njcm9sbFRvVGh1bWJuYWlsKG5ld0luZGV4KTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX3Jlc2V0U2l6aW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gUmVzZXQgc2l6aW5nIHZhcmlhYmxlcy4gVGhpcyBpbmNsdWRlcyByZXNldHRpbmcgYW55IGlubGluZSBzdHlsZSB0aGF0IGhhc1xyXG4gIC8vIGJlZW4gYXBwbGllZCwgc28gdGhhdCBhbnkgc2l6ZSBjYWxjdWxhdGlvbnMgY2FuIGJlIGJhc2VkIG9uIHRoZSBDU1NcclxuICAvLyBzdHlsaW5nLlxyXG4gIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIuY3NzKHtcclxuICAgIHRvcDogXCJcIixcclxuICAgIGxlZnQ6IFwiXCIsXHJcbiAgICB3aWR0aDogXCJcIixcclxuICAgIGhlaWdodDogXCJcIlxyXG4gIH0pO1xyXG4gIHRoaXMuXyR2aXNpYmxlVGh1bWJuYWlsV3JhcC53aWR0aChcIlwiKTtcclxuICB0aGlzLl8kdmlzaWJsZVRodW1ibmFpbFdyYXAuaGVpZ2h0KFwiXCIpO1xyXG4gIC8vIE1ha2UgYWxsIHRodW1ibmFpbHMgc3F1YXJlIGFuZCByZXNldCBhbnkgaGVpZ2h0XHJcbiAgdGhpcy5fJHRodW1ibmFpbHMuZm9yRWFjaChmdW5jdGlvbigkZWxlbWVudCkge1xyXG4gICAgJGVsZW1lbnQuaGVpZ2h0KFwiXCIpOyAvLyBSZXNldCBoZWlnaHQgYmVmb3JlIHNldHRpbmcgd2lkdGhcclxuICAgICRlbGVtZW50LndpZHRoKCRlbGVtZW50LmhlaWdodCgpKTtcclxuICB9KTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5fcmVzZXRTaXppbmcoKTtcclxuXHJcbiAgLy8gQ2FsY3VsYXRlIHRoZSBzaXplIG9mIHRoZSBmaXJzdCB0aHVtYm5haWwuIFRoaXMgYXNzdW1lcyB0aGUgZmlyc3QgaW1hZ2VcclxuICAvLyBvbmx5IGhhcyBhIHJpZ2h0LXNpZGUgbWFyZ2luLlxyXG4gIHZhciAkZmlyc3RUaHVtYiA9IHRoaXMuXyR0aHVtYm5haWxzWzBdO1xyXG4gIHZhciB0aHVtYlNpemUgPSAkZmlyc3RUaHVtYi5vdXRlckhlaWdodChmYWxzZSk7XHJcbiAgdmFyIHRodW1iTWFyZ2luID0gMiAqICgkZmlyc3RUaHVtYi5vdXRlcldpZHRoKHRydWUpIC0gdGh1bWJTaXplKTtcclxuXHJcbiAgLy8gTWVhc3VyZSBjb250cm9scy4gVGhleSBuZWVkIHRvIGJlIHZpc2libGUgaW4gb3JkZXIgdG8gYmUgbWVhc3VyZWQuXHJcbiAgdGhpcy5fJGFkdmFuY2VSaWdodC5jc3MoXCJkaXNwbGF5XCIsIFwiYmxvY2tcIik7XHJcbiAgdGhpcy5fJGFkdmFuY2VMZWZ0LmNzcyhcImRpc3BsYXlcIiwgXCJibG9ja1wiKTtcclxuICB2YXIgdGh1bWJDb250cm9sV2lkdGggPVxyXG4gICAgdGhpcy5fJGFkdmFuY2VSaWdodC5vdXRlcldpZHRoKHRydWUpICsgdGhpcy5fJGFkdmFuY2VMZWZ0Lm91dGVyV2lkdGgodHJ1ZSk7XHJcblxyXG4gIC8vIENhbGN1bGF0ZSBob3cgbWFueSBmdWxsIHRodW1ibmFpbHMgY2FuIGZpdCB3aXRoaW4gdGhlIHRodW1ibmFpbCBhcmVhXHJcbiAgdmFyIHZpc2libGVXaWR0aCA9IHRoaXMuXyR2aXNpYmxlVGh1bWJuYWlsV3JhcC5vdXRlcldpZHRoKGZhbHNlKTtcclxuICB2YXIgbnVtVGh1bWJzVmlzaWJsZSA9IE1hdGguZmxvb3IoKHZpc2libGVXaWR0aCAtIHRodW1iTWFyZ2luKSAvICh0aHVtYlNpemUgKyB0aHVtYk1hcmdpbikpO1xyXG5cclxuICAvLyBDaGVjayB3aGV0aGVyIGFsbCB0aGUgdGh1bWJuYWlscyBjYW4gZml0IG9uIHRoZSBzY3JlZW4gYXQgb25jZVxyXG4gIGlmIChudW1UaHVtYnNWaXNpYmxlIDwgdGhpcy5fbnVtSW1hZ2VzKSB7XHJcbiAgICAvLyBUYWtlIGEgYmVzdCBndWVzcyBhdCBob3cgdG8gc2l6ZSB0aGUgdGh1bWJuYWlscy4gU2l6ZSBmb3JtdWxhOlxyXG4gICAgLy8gIHdpZHRoID0gbnVtICogdGh1bWJTaXplICsgKG51bSAtIDEpICogdGh1bWJNYXJnaW4gKyBjb250cm9sU2l6ZVxyXG4gICAgLy8gU29sdmUgZm9yIG51bWJlciBvZiB0aHVtYm5haWxzIGFuZCByb3VuZCB0byB0aGUgbmVhcmVzdCBpbnRlZ2VyIHNvXHJcbiAgICAvLyB0aGF0IHdlIGRvbid0IGhhdmUgYW55IHBhcnRpYWwgdGh1bWJuYWlscyBzaG93aW5nLlxyXG4gICAgbnVtVGh1bWJzVmlzaWJsZSA9IE1hdGgucm91bmQoXHJcbiAgICAgICh2aXNpYmxlV2lkdGggLSB0aHVtYkNvbnRyb2xXaWR0aCArIHRodW1iTWFyZ2luKSAvICh0aHVtYlNpemUgKyB0aHVtYk1hcmdpbilcclxuICAgICk7XHJcblxyXG4gICAgLy8gVXNlIHRoaXMgbnVtYmVyIG9mIHRodW1ibmFpbHMgdG8gY2FsY3VsYXRlIHRoZSB0aHVtYm5haWwgc2l6ZVxyXG4gICAgdmFyIG5ld1NpemUgPSAodmlzaWJsZVdpZHRoIC0gdGh1bWJDb250cm9sV2lkdGggKyB0aHVtYk1hcmdpbikgLyBudW1UaHVtYnNWaXNpYmxlIC0gdGh1bWJNYXJnaW47XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlscy5mb3JFYWNoKGZ1bmN0aW9uKCRlbGVtZW50KSB7XHJcbiAgICAgIC8vICQud2lkdGggYW5kICQuaGVpZ2h0IHNldCB0aGUgY29udGVudCBzaXplIHJlZ2FyZGxlc3Mgb2YgdGhlXHJcbiAgICAgIC8vIGJveC1zaXppbmcuIFRoZSBpbWFnZXMgYXJlIGJvcmRlci1ib3gsIHNvIHdlIHdhbnQgdGhlIENTUyB3aWR0aFxyXG4gICAgICAvLyBhbmQgaGVpZ2h0LiBUaGlzIGFsbG93cyB0aGUgYWN0aXZlIGltYWdlIHRvIGhhdmUgYSBib3JkZXIgYW5kIHRoZVxyXG4gICAgICAvLyBvdGhlciBpbWFnZXMgdG8gaGF2ZSBwYWRkaW5nLlxyXG4gICAgICAkZWxlbWVudC5jc3MoXCJ3aWR0aFwiLCBuZXdTaXplICsgXCJweFwiKTtcclxuICAgICAgJGVsZW1lbnQuY3NzKFwiaGVpZ2h0XCIsIG5ld1NpemUgKyBcInB4XCIpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU2V0IHRoZSB0aHVtYm5haWwgd3JhcCBzaXplLiBJdCBzaG91bGQgYmUganVzdCB0YWxsIGVub3VnaCB0byBmaXQgYVxyXG4gICAgLy8gdGh1bWJuYWlsIGFuZCBsb25nIGVub3VnaCB0byBob2xkIGFsbCB0aGUgdGh1bWJuYWlscyBpbiBvbmUgbGluZTpcclxuICAgIHZhciB0b3RhbFNpemUgPSBuZXdTaXplICogdGhpcy5fbnVtSW1hZ2VzICsgdGh1bWJNYXJnaW4gKiAodGhpcy5fbnVtSW1hZ2VzIC0gMSk7XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyLmNzcyh7XHJcbiAgICAgIHdpZHRoOiB0b3RhbFNpemUgKyBcInB4XCIsXHJcbiAgICAgIGhlaWdodDogJGZpcnN0VGh1bWIub3V0ZXJIZWlnaHQodHJ1ZSkgKyBcInB4XCJcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIFNldCB0aGUgdmlzaWJsZSB0aHVtYm5haWwgd3JhcCBzaXplLiBUaGlzIGlzIHVzZWQgdG8gbWFrcyB0aGUgbXVjaFxyXG4gICAgLy8gbGFyZ2VyIHRodW1ibmFpbCBjb250YWluZXIuIEl0IHNob3VsZCBiZSBhcyB3aWRlIGFzIGl0IGNhbiBiZSwgbWludXNcclxuICAgIC8vIHRoZSBzcGFjZSBuZWVkZWQgZm9yIHRoZSBsZWZ0L3JpZ2h0IGNvbnRvbHMuXHJcbiAgICB0aGlzLl8kdmlzaWJsZVRodW1ibmFpbFdyYXAuY3NzKHtcclxuICAgICAgd2lkdGg6IHZpc2libGVXaWR0aCAtIHRodW1iQ29udHJvbFdpZHRoICsgXCJweFwiLFxyXG4gICAgICBoZWlnaHQ6ICRmaXJzdFRodW1iLm91dGVySGVpZ2h0KHRydWUpICsgXCJweFwiXHJcbiAgICB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gQWxsIHRodW1ibmFpbHMgYXJlIHZpc2libGUsIHdlIGNhbiBoaWRlIHRoZSBjb250cm9scyBhbmQgZXhwYW5kIHRoZVxyXG4gICAgLy8gdGh1bWJuYWlsIGNvbnRhaW5lciB0byAxMDAlXHJcbiAgICBudW1UaHVtYnNWaXNpYmxlID0gdGhpcy5fbnVtSW1hZ2VzO1xyXG4gICAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci5jc3MoXCJ3aWR0aFwiLCBcIjEwMCVcIik7XHJcbiAgICB0aGlzLl8kYWR2YW5jZVJpZ2h0LmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gICAgdGhpcy5fJGFkdmFuY2VMZWZ0LmNzcyhcImRpc3BsYXlcIiwgXCJub25lXCIpO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5fbnVtVmlzaWJsZSA9IG51bVRodW1ic1Zpc2libGU7XHJcbiAgdmFyIG1pZGRsZUluZGV4ID0gTWF0aC5mbG9vcigodGhpcy5fbnVtVmlzaWJsZSAtIDEpIC8gMik7XHJcbiAgdGhpcy5fc2Nyb2xsQm91bmRzID0ge1xyXG4gICAgbWluOiBtaWRkbGVJbmRleCxcclxuICAgIG1heDogdGhpcy5fbnVtSW1hZ2VzIC0gMSAtIG1pZGRsZUluZGV4XHJcbiAgfTtcclxuICBpZiAodGhpcy5fbnVtVmlzaWJsZSAlIDIgPT09IDApIHRoaXMuX3Njcm9sbEJvdW5kcy5tYXggLT0gMTtcclxuXHJcbiAgdGhpcy5fdXBkYXRlVGh1bWJuYWlsQ29udHJvbHMoKTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX2FjdGl2YXRlVGh1bWJuYWlsID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAvLyBBY3RpdmF0ZS9kZWFjdGl2YXRlIHRodW1ibmFpbHNcclxuICB0aGlzLl8kdGh1bWJuYWlsc1t0aGlzLl9pbmRleF0ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgdGhpcy5fJHRodW1ibmFpbHNbaW5kZXhdLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG59O1xyXG5cclxuVGh1bWJuYWlsU2xpZGVyLnByb3RvdHlwZS5fc2Nyb2xsVG9UaHVtYm5haWwgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gIC8vIE5vIG5lZWQgdG8gc2Nyb2xsIGlmIGFsbCB0aHVtYm5haWxzIGFyZSB2aXNpYmxlXHJcbiAgaWYgKHRoaXMuX251bVZpc2libGUgPT09IHRoaXMuX251bUltYWdlcykgcmV0dXJuO1xyXG5cclxuICAvLyBDb25zdHJhaW4gaW5kZXggc28gdGhhdCB3ZSBjYW4ndCBzY3JvbGwgb3V0IG9mIGJvdW5kc1xyXG4gIGluZGV4ID0gTWF0aC5tYXgoaW5kZXgsIHRoaXMuX3Njcm9sbEJvdW5kcy5taW4pO1xyXG4gIGluZGV4ID0gTWF0aC5taW4oaW5kZXgsIHRoaXMuX3Njcm9sbEJvdW5kcy5tYXgpO1xyXG4gIHRoaXMuX3Njcm9sbEluZGV4ID0gaW5kZXg7XHJcblxyXG4gIC8vIEZpbmQgdGhlIFwibGVmdFwiIHBvc2l0aW9uIG9mIHRoZSB0aHVtYm5haWwgY29udGFpbmVyIHRoYXQgd291bGQgcHV0IHRoZVxyXG4gIC8vIHRodW1ibmFpbCBhdCBpbmRleCBhdCB0aGUgY2VudGVyXHJcbiAgdmFyICR0aHVtYiA9IHRoaXMuXyR0aHVtYm5haWxzWzBdO1xyXG4gIHZhciBzaXplID0gcGFyc2VGbG9hdCgkdGh1bWIuY3NzKFwid2lkdGhcIikpO1xyXG4gIHZhciBtYXJnaW4gPSAyICogcGFyc2VGbG9hdCgkdGh1bWIuY3NzKFwibWFyZ2luLXJpZ2h0XCIpKTtcclxuICB2YXIgY2VudGVyWCA9IHNpemUgKiB0aGlzLl9zY3JvbGxCb3VuZHMubWluICsgbWFyZ2luICogKHRoaXMuX3Njcm9sbEJvdW5kcy5taW4gLSAxKTtcclxuICB2YXIgdGh1bWJYID0gc2l6ZSAqIGluZGV4ICsgbWFyZ2luICogKGluZGV4IC0gMSk7XHJcbiAgdmFyIGxlZnQgPSBjZW50ZXJYIC0gdGh1bWJYO1xyXG5cclxuICAvLyBBbmltYXRlIHRoZSB0aHVtYm5haWwgY29udGFpbmVyXHJcbiAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci52ZWxvY2l0eShcclxuICAgIHtcclxuICAgICAgbGVmdDogbGVmdCArIFwicHhcIlxyXG4gICAgfSxcclxuICAgIDYwMCxcclxuICAgIFwiZWFzZUluT3V0UXVhZFwiXHJcbiAgKTtcclxuXHJcbiAgdGhpcy5fdXBkYXRlVGh1bWJuYWlsQ29udHJvbHMoKTtcclxufTtcclxuXHJcblRodW1ibmFpbFNsaWRlci5wcm90b3R5cGUuX29uQ2xpY2sgPSBmdW5jdGlvbihlKSB7XHJcbiAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuICB2YXIgaW5kZXggPSAkdGFyZ2V0LmRhdGEoXCJpbmRleFwiKTtcclxuXHJcbiAgLy8gQ2xpY2tlZCBvbiB0aGUgYWN0aXZlIGltYWdlIC0gbm8gbmVlZCB0byBkbyBhbnl0aGluZ1xyXG4gIGlmICh0aGlzLl9pbmRleCAhPT0gaW5kZXgpIHtcclxuICAgIHRoaXMuX2FjdGl2YXRlVGh1bWJuYWlsKGluZGV4KTtcclxuICAgIHRoaXMuX3Njcm9sbFRvVGh1bWJuYWlsKGluZGV4KTtcclxuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XHJcbiAgICB0aGlzLl9zbGlkZXNob3cuc2hvd0ltYWdlKGluZGV4KTtcclxuICB9XHJcbn07XHJcblxyXG5UaHVtYm5haWxTbGlkZXIucHJvdG90eXBlLl91cGRhdGVUaHVtYm5haWxDb250cm9scyA9IGZ1bmN0aW9uKCkge1xyXG4gIC8vIFJlLWVuYWJsZVxyXG4gIHRoaXMuXyRhZHZhbmNlTGVmdC5yZW1vdmVDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIHRoaXMuXyRhZHZhbmNlUmlnaHQucmVtb3ZlQ2xhc3MoXCJkaXNhYmxlZFwiKTtcclxuXHJcbiAgLy8gRGlzYWJsZSBpZiB3ZSd2ZSByZWFjaGVkIHRoZSB0aGUgbWF4IG9yIG1pbiBsaW1pdFxyXG4gIC8vIHZhciBtaWRTY3JvbGxJbmRleCA9IE1hdGguZmxvb3IoKHRoaXMuX251bVZpc2libGUgLSAxKSAvIDIpO1xyXG4gIC8vIHZhciBtaW5TY3JvbGxJbmRleCA9IG1pZFNjcm9sbEluZGV4O1xyXG4gIC8vIHZhciBtYXhTY3JvbGxJbmRleCA9IHRoaXMuX251bUltYWdlcyAtIDEgLSBtaWRTY3JvbGxJbmRleDtcclxuICBpZiAodGhpcy5fc2Nyb2xsSW5kZXggPj0gdGhpcy5fc2Nyb2xsQm91bmRzLm1heCkge1xyXG4gICAgdGhpcy5fJGFkdmFuY2VSaWdodC5hZGRDbGFzcyhcImRpc2FibGVkXCIpO1xyXG4gIH0gZWxzZSBpZiAodGhpcy5fc2Nyb2xsSW5kZXggPD0gdGhpcy5fc2Nyb2xsQm91bmRzLm1pbikge1xyXG4gICAgdGhpcy5fJGFkdmFuY2VMZWZ0LmFkZENsYXNzKFwiZGlzYWJsZWRcIik7XHJcbiAgfVxyXG59O1xyXG4iLCJleHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbih2YWwsIGRlZmF1bHRWYWwpIHtcclxuICByZXR1cm4gdmFsICE9PSB1bmRlZmluZWQgPyB2YWwgOiBkZWZhdWx0VmFsO1xyXG59O1xyXG5cclxuLy8gVW50ZXN0ZWRcclxuLy8gZXhwb3J0cy5kZWZhdWx0UHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmF1bHRQcm9wZXJ0aWVzIChvYmosIHByb3BzKSB7XHJcbi8vICAgICBmb3IgKHZhciBwcm9wIGluIHByb3BzKSB7XHJcbi8vICAgICAgICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KHByb3BzLCBwcm9wKSkge1xyXG4vLyAgICAgICAgICAgICB2YXIgdmFsdWUgPSBleHBvcnRzLmRlZmF1bHRWYWx1ZShwcm9wcy52YWx1ZSwgcHJvcHMuZGVmYXVsdCk7XHJcbi8vICAgICAgICAgICAgIG9ialtwcm9wXSA9IHZhbHVlO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgIH1cclxuLy8gICAgIHJldHVybiBvYmo7XHJcbi8vIH07XHJcbi8vXHJcbmV4cG9ydHMudGltZUl0ID0gZnVuY3Rpb24oZnVuYykge1xyXG4gIHZhciBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gIGZ1bmMoKTtcclxuICB2YXIgZW5kID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgcmV0dXJuIGVuZCAtIHN0YXJ0O1xyXG59O1xyXG5cclxuZXhwb3J0cy5pc0luUmVjdCA9IGZ1bmN0aW9uKHgsIHksIHJlY3QpIHtcclxuICBpZiAoeCA+PSByZWN0LnggJiYgeCA8PSByZWN0LnggKyByZWN0LncgJiYgeSA+PSByZWN0LnkgJiYgeSA8PSByZWN0LnkgKyByZWN0LmgpIHtcclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5leHBvcnRzLnJhbmRJbnQgPSBmdW5jdGlvbihtaW4sIG1heCkge1xyXG4gIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG59O1xyXG5cclxuZXhwb3J0cy5yYW5kQXJyYXlFbGVtZW50ID0gZnVuY3Rpb24oYXJyYXkpIHtcclxuICB2YXIgaSA9IGV4cG9ydHMucmFuZEludCgwLCBhcnJheS5sZW5ndGggLSAxKTtcclxuICByZXR1cm4gYXJyYXlbaV07XHJcbn07XHJcblxyXG5leHBvcnRzLm1hcCA9IGZ1bmN0aW9uKG51bSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Miwgb3B0aW9ucykge1xyXG4gIHZhciBtYXBwZWQgPSAobnVtIC0gbWluMSkgLyAobWF4MSAtIG1pbjEpICogKG1heDIgLSBtaW4yKSArIG1pbjI7XHJcbiAgaWYgKCFvcHRpb25zKSByZXR1cm4gbWFwcGVkO1xyXG4gIGlmIChvcHRpb25zLnJvdW5kICYmIG9wdGlvbnMucm91bmQgPT09IHRydWUpIHtcclxuICAgIG1hcHBlZCA9IE1hdGgucm91bmQobWFwcGVkKTtcclxuICB9XHJcbiAgaWYgKG9wdGlvbnMuZmxvb3IgJiYgb3B0aW9ucy5mbG9vciA9PT0gdHJ1ZSkge1xyXG4gICAgbWFwcGVkID0gTWF0aC5mbG9vcihtYXBwZWQpO1xyXG4gIH1cclxuICBpZiAob3B0aW9ucy5jZWlsICYmIG9wdGlvbnMuY2VpbCA9PT0gdHJ1ZSkge1xyXG4gICAgbWFwcGVkID0gTWF0aC5jZWlsKG1hcHBlZCk7XHJcbiAgfVxyXG4gIGlmIChvcHRpb25zLmNsYW1wICYmIG9wdGlvbnMuY2xhbXAgPT09IHRydWUpIHtcclxuICAgIG1hcHBlZCA9IE1hdGgubWluKG1hcHBlZCwgbWF4Mik7XHJcbiAgICBtYXBwZWQgPSBNYXRoLm1heChtYXBwZWQsIG1pbjIpO1xyXG4gIH1cclxuICByZXR1cm4gbWFwcGVkO1xyXG59O1xyXG5cclxuZXhwb3J0cy5nZXRRdWVyeVBhcmFtZXRlcnMgPSBmdW5jdGlvbigpIHtcclxuICAvLyBDaGVjayBmb3IgcXVlcnkgc3RyaW5nXHJcbiAgdmFyIHFzID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcclxuICBpZiAocXMubGVuZ3RoIDw9IDEpIHJldHVybiB7fTtcclxuICAvLyBRdWVyeSBzdHJpbmcgZXhpc3RzLCBwYXJzZSBpdCBpbnRvIGEgcXVlcnkgb2JqZWN0XHJcbiAgcXMgPSBxcy5zdWJzdHJpbmcoMSk7IC8vIFJlbW92ZSB0aGUgXCI/XCIgZGVsaW1pdGVyXHJcbiAgdmFyIGtleVZhbFBhaXJzID0gcXMuc3BsaXQoXCImXCIpO1xyXG4gIHZhciBxdWVyeU9iamVjdCA9IHt9O1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5VmFsUGFpcnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBrZXlWYWwgPSBrZXlWYWxQYWlyc1tpXS5zcGxpdChcIj1cIik7XHJcbiAgICBpZiAoa2V5VmFsLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICB2YXIga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleVZhbFswXSk7XHJcbiAgICAgIHZhciB2YWwgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5VmFsWzFdKTtcclxuICAgICAgcXVlcnlPYmplY3Rba2V5XSA9IHZhbDtcclxuICAgIH1cclxuICB9XHJcbiAgcmV0dXJuIHF1ZXJ5T2JqZWN0O1xyXG59O1xyXG5cclxuZXhwb3J0cy5jcmVhdGVRdWVyeVN0cmluZyA9IGZ1bmN0aW9uKHF1ZXJ5T2JqZWN0KSB7XHJcbiAgaWYgKHR5cGVvZiBxdWVyeU9iamVjdCAhPT0gXCJvYmplY3RcIikgcmV0dXJuIFwiXCI7XHJcbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhxdWVyeU9iamVjdCk7XHJcbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcclxuICB2YXIgcXVlcnlTdHJpbmcgPSBcIj9cIjtcclxuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xyXG4gICAgdmFyIHZhbCA9IHF1ZXJ5T2JqZWN0W2tleV07XHJcbiAgICBxdWVyeVN0cmluZyArPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbCk7XHJcbiAgICBpZiAoaSAhPT0ga2V5cy5sZW5ndGggLSAxKSBxdWVyeVN0cmluZyArPSBcIiZcIjtcclxuICB9XHJcbiAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0cy53cmFwSW5kZXggPSBmdW5jdGlvbihpbmRleCwgbGVuZ3RoKSB7XHJcbiAgdmFyIHdyYXBwZWRJbmRleCA9IGluZGV4ICUgbGVuZ3RoO1xyXG4gIGlmICh3cmFwcGVkSW5kZXggPCAwKSB7XHJcbiAgICAvLyBJZiBuZWdhdGl2ZSwgZmxpcCB0aGUgaW5kZXggc28gdGhhdCAtMSBiZWNvbWVzIHRoZSBsYXN0IGl0ZW0gaW4gbGlzdFxyXG4gICAgd3JhcHBlZEluZGV4ID0gbGVuZ3RoICsgd3JhcHBlZEluZGV4O1xyXG4gIH1cclxuICByZXR1cm4gd3JhcHBlZEluZGV4O1xyXG59O1xyXG4iXSwicHJlRXhpc3RpbmdDb21tZW50IjoiLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW01dlpHVmZiVzlrZFd4bGN5OWljbTkzYzJWeUxYQmhZMnN2WDNCeVpXeDFaR1V1YW5NaUxDSnViMlJsWDIxdlpIVnNaWE12YW5NdFkyOXZhMmxsTDNOeVl5OXFjeTVqYjI5cmFXVXVhbk1pTENKdWIyUmxYMjF2WkhWc1pYTXZjRFV0WW1KdmVDMWhiR2xuYm1Wa0xYUmxlSFF2YkdsaUwySmliM2d0WVd4cFoyNWxaQzEwWlhoMExtcHpJaXdpYm05a1pWOXRiMlIxYkdWekwzQTFMV0ppYjNndFlXeHBaMjVsWkMxMFpYaDBMMnhwWWk5MWRHbHNjeTVxY3lJc0luTnlZeTlxY3k5b2IzWmxjaTF6Ykdsa1pYTm9iM2N1YW5NaUxDSnpjbU12YW5NdmFXNTBaWEpoWTNScGRtVXRiRzluYjNNdlltRnpaUzFzYjJkdkxYTnJaWFJqYUM1cWN5SXNJbk55WXk5cWN5OXBiblJsY21GamRHbDJaUzFzYjJkdmN5OWpiMjV1WldOMExYQnZhVzUwY3kxemEyVjBZMmd1YW5NaUxDSnpjbU12YW5NdmFXNTBaWEpoWTNScGRtVXRiRzluYjNNdloyVnVaWEpoZEc5eWN5OXViMmx6WlMxblpXNWxjbUYwYjNKekxtcHpJaXdpYzNKakwycHpMMmx1ZEdWeVlXTjBhWFpsTFd4dloyOXpMMmRsYm1WeVlYUnZjbk12YzJsdUxXZGxibVZ5WVhSdmNpNXFjeUlzSW5OeVl5OXFjeTlwYm5SbGNtRmpkR2wyWlMxc2IyZHZjeTlvWVd4bWRHOXVaUzFtYkdGemFHeHBaMmgwTFhkdmNtUXVhbk1pTENKemNtTXZhbk12YVc1MFpYSmhZM1JwZG1VdGJHOW5iM012Ym05cGMza3RkMjl5WkMxemEyVjBZMmd1YW5NaUxDSnpjbU12YW5NdmJXRnBiaTF1WVhZdWFuTWlMQ0p6Y21NdmFuTXZiV0ZwYmk1cWN5SXNJbk55WXk5cWN5OXdZV2RsTFd4dllXUmxjaTVxY3lJc0luTnlZeTlxY3k5d2FXTnJMWEpoYm1SdmJTMXphMlYwWTJndWFuTWlMQ0p6Y21NdmFuTXZjRzl5ZEdadmJHbHZMV1pwYkhSbGNpNXFjeUlzSW5OeVl5OXFjeTkwYUhWdFltNWhhV3d0YzJ4cFpHVnphRzkzTDNOc2FXUmxjMmh2ZHkxdGIyUmhiQzVxY3lJc0luTnlZeTlxY3k5MGFIVnRZbTVoYVd3dGMyeHBaR1Z6YUc5M0wzTnNhV1JsYzJodmR5NXFjeUlzSW5OeVl5OXFjeTkwYUhWdFltNWhhV3d0YzJ4cFpHVnphRzkzTDNSb2RXMWlibUZwYkMxemJHbGtaWEl1YW5NaUxDSnpjbU12YW5NdmRYUnBiR2wwYVdWekxtcHpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSkJRVUZCTzBGRFFVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkRja3RCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOcVdrRTdRVUZEUVR0QlFVTkJPenRCUTBaQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRM1pKUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOMlRFRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJReTlHUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVU42UjBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGRGVrUkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOb1NVRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUczdRVU4wUlVFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHM3UVVOMlJFRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3TzBGRGNrVkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN08wRkRka1JCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVRzN1FVTjRSRUU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZEY0U5Qk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRMnhMUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk96dEJRek5KUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdPMEZEZWs5Qk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRU0lzSW1acGJHVWlPaUpuWlc1bGNtRjBaV1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaUtHWjFibU4wYVc5dUtDbDdablZ1WTNScGIyNGdjaWhsTEc0c2RDbDdablZ1WTNScGIyNGdieWhwTEdZcGUybG1LQ0Z1VzJsZEtYdHBaaWdoWlZ0cFhTbDdkbUZ5SUdNOVhDSm1kVzVqZEdsdmJsd2lQVDEwZVhCbGIyWWdjbVZ4ZFdseVpTWW1jbVZ4ZFdseVpUdHBaaWdoWmlZbVl5bHlaWFIxY200Z1l5aHBMQ0V3S1R0cFppaDFLWEpsZEhWeWJpQjFLR2tzSVRBcE8zWmhjaUJoUFc1bGR5QkZjbkp2Y2loY0lrTmhibTV2ZENCbWFXNWtJRzF2WkhWc1pTQW5YQ0lyYVN0Y0lpZGNJaWs3ZEdoeWIzY2dZUzVqYjJSbFBWd2lUVTlFVlV4RlgwNVBWRjlHVDFWT1JGd2lMR0Y5ZG1GeUlIQTlibHRwWFQxN1pYaHdiM0owY3pwN2ZYMDdaVnRwWFZzd1hTNWpZV3hzS0hBdVpYaHdiM0owY3l4bWRXNWpkR2x2YmloeUtYdDJZWElnYmoxbFcybGRXekZkVzNKZE8zSmxkSFZ5YmlCdktHNThmSElwZlN4d0xIQXVaWGh3YjNKMGN5eHlMR1VzYml4MEtYMXlaWFIxY200Z2JsdHBYUzVsZUhCdmNuUnpmV1p2Y2loMllYSWdkVDFjSW1aMWJtTjBhVzl1WENJOVBYUjVjR1Z2WmlCeVpYRjFhWEpsSmlaeVpYRjFhWEpsTEdrOU1EdHBQSFF1YkdWdVozUm9PMmtyS3lsdktIUmJhVjBwTzNKbGRIVnliaUJ2ZlhKbGRIVnliaUJ5ZlNrb0tTSXNJaThxSVZ4dUlDb2dTbUYyWVZOamNtbHdkQ0JEYjI5cmFXVWdkakl1TWk0d1hHNGdLaUJvZEhSd2N6b3ZMMmRwZEdoMVlpNWpiMjB2YW5NdFkyOXZhMmxsTDJwekxXTnZiMnRwWlZ4dUlDcGNiaUFxSUVOdmNIbHlhV2RvZENBeU1EQTJMQ0F5TURFMUlFdHNZWFZ6SUVoaGNuUnNJQ1lnUm1GbmJtVnlJRUp5WVdOclhHNGdLaUJTWld4bFlYTmxaQ0IxYm1SbGNpQjBhR1VnVFVsVUlHeHBZMlZ1YzJWY2JpQXFMMXh1T3lobWRXNWpkR2x2YmlBb1ptRmpkRzl5ZVNrZ2UxeHVYSFIyWVhJZ2NtVm5hWE4wWlhKbFpFbHVUVzlrZFd4bFRHOWhaR1Z5SUQwZ1ptRnNjMlU3WEc1Y2RHbG1JQ2gwZVhCbGIyWWdaR1ZtYVc1bElEMDlQU0FuWm5WdVkzUnBiMjRuSUNZbUlHUmxabWx1WlM1aGJXUXBJSHRjYmx4MFhIUmtaV1pwYm1Vb1ptRmpkRzl5ZVNrN1hHNWNkRngwY21WbmFYTjBaWEpsWkVsdVRXOWtkV3hsVEc5aFpHVnlJRDBnZEhKMVpUdGNibHgwZlZ4dVhIUnBaaUFvZEhsd1pXOW1JR1Y0Y0c5eWRITWdQVDA5SUNkdlltcGxZM1FuS1NCN1hHNWNkRngwYlc5a2RXeGxMbVY0Y0c5eWRITWdQU0JtWVdOMGIzSjVLQ2s3WEc1Y2RGeDBjbVZuYVhOMFpYSmxaRWx1VFc5a2RXeGxURzloWkdWeUlEMGdkSEoxWlR0Y2JseDBmVnh1WEhScFppQW9JWEpsWjJsemRHVnlaV1JKYmsxdlpIVnNaVXh2WVdSbGNpa2dlMXh1WEhSY2RIWmhjaUJQYkdSRGIyOXJhV1Z6SUQwZ2QybHVaRzkzTGtOdmIydHBaWE03WEc1Y2RGeDBkbUZ5SUdGd2FTQTlJSGRwYm1SdmR5NURiMjlyYVdWeklEMGdabUZqZEc5eWVTZ3BPMXh1WEhSY2RHRndhUzV1YjBOdmJtWnNhV04wSUQwZ1puVnVZM1JwYjI0Z0tDa2dlMXh1WEhSY2RGeDBkMmx1Wkc5M0xrTnZiMnRwWlhNZ1BTQlBiR1JEYjI5cmFXVnpPMXh1WEhSY2RGeDBjbVYwZFhKdUlHRndhVHRjYmx4MFhIUjlPMXh1WEhSOVhHNTlLR1oxYm1OMGFXOXVJQ2dwSUh0Y2JseDBablZ1WTNScGIyNGdaWGgwWlc1a0lDZ3BJSHRjYmx4MFhIUjJZWElnYVNBOUlEQTdYRzVjZEZ4MGRtRnlJSEpsYzNWc2RDQTlJSHQ5TzF4dVhIUmNkR1p2Y2lBb095QnBJRHdnWVhKbmRXMWxiblJ6TG14bGJtZDBhRHNnYVNzcktTQjdYRzVjZEZ4MFhIUjJZWElnWVhSMGNtbGlkWFJsY3lBOUlHRnlaM1Z0Wlc1MGMxc2dhU0JkTzF4dVhIUmNkRngwWm05eUlDaDJZWElnYTJWNUlHbHVJR0YwZEhKcFluVjBaWE1wSUh0Y2JseDBYSFJjZEZ4MGNtVnpkV3gwVzJ0bGVWMGdQU0JoZEhSeWFXSjFkR1Z6VzJ0bGVWMDdYRzVjZEZ4MFhIUjlYRzVjZEZ4MGZWeHVYSFJjZEhKbGRIVnliaUJ5WlhOMWJIUTdYRzVjZEgxY2JseHVYSFJtZFc1amRHbHZiaUJwYm1sMElDaGpiMjUyWlhKMFpYSXBJSHRjYmx4MFhIUm1kVzVqZEdsdmJpQmhjR2tnS0d0bGVTd2dkbUZzZFdVc0lHRjBkSEpwWW5WMFpYTXBJSHRjYmx4MFhIUmNkSFpoY2lCeVpYTjFiSFE3WEc1Y2RGeDBYSFJwWmlBb2RIbHdaVzltSUdSdlkzVnRaVzUwSUQwOVBTQW5kVzVrWldacGJtVmtKeWtnZTF4dVhIUmNkRngwWEhSeVpYUjFjbTQ3WEc1Y2RGeDBYSFI5WEc1Y2JseDBYSFJjZEM4dklGZHlhWFJsWEc1Y2JseDBYSFJjZEdsbUlDaGhjbWQxYldWdWRITXViR1Z1WjNSb0lENGdNU2tnZTF4dVhIUmNkRngwWEhSaGRIUnlhV0oxZEdWeklEMGdaWGgwWlc1a0tIdGNibHgwWEhSY2RGeDBYSFJ3WVhSb09pQW5MeWRjYmx4MFhIUmNkRngwZlN3Z1lYQnBMbVJsWm1GMWJIUnpMQ0JoZEhSeWFXSjFkR1Z6S1R0Y2JseHVYSFJjZEZ4MFhIUnBaaUFvZEhsd1pXOW1JR0YwZEhKcFluVjBaWE11Wlhod2FYSmxjeUE5UFQwZ0oyNTFiV0psY2ljcElIdGNibHgwWEhSY2RGeDBYSFIyWVhJZ1pYaHdhWEpsY3lBOUlHNWxkeUJFWVhSbEtDazdYRzVjZEZ4MFhIUmNkRngwWlhod2FYSmxjeTV6WlhSTmFXeHNhWE5sWTI5dVpITW9aWGh3YVhKbGN5NW5aWFJOYVd4c2FYTmxZMjl1WkhNb0tTQXJJR0YwZEhKcFluVjBaWE11Wlhod2FYSmxjeUFxSURnMk5HVXJOU2s3WEc1Y2RGeDBYSFJjZEZ4MFlYUjBjbWxpZFhSbGN5NWxlSEJwY21WeklEMGdaWGh3YVhKbGN6dGNibHgwWEhSY2RGeDBmVnh1WEc1Y2RGeDBYSFJjZEM4dklGZGxKM0psSUhWemFXNW5JRndpWlhod2FYSmxjMXdpSUdKbFkyRjFjMlVnWENKdFlYZ3RZV2RsWENJZ2FYTWdibTkwSUhOMWNIQnZjblJsWkNCaWVTQkpSVnh1WEhSY2RGeDBYSFJoZEhSeWFXSjFkR1Z6TG1WNGNHbHlaWE1nUFNCaGRIUnlhV0oxZEdWekxtVjRjR2x5WlhNZ1B5QmhkSFJ5YVdKMWRHVnpMbVY0Y0dseVpYTXVkRzlWVkVOVGRISnBibWNvS1NBNklDY25PMXh1WEc1Y2RGeDBYSFJjZEhSeWVTQjdYRzVjZEZ4MFhIUmNkRngwY21WemRXeDBJRDBnU2xOUFRpNXpkSEpwYm1kcFpua29kbUZzZFdVcE8xeHVYSFJjZEZ4MFhIUmNkR2xtSUNndlhsdGNYSHRjWEZ0ZEx5NTBaWE4wS0hKbGMzVnNkQ2twSUh0Y2JseDBYSFJjZEZ4MFhIUmNkSFpoYkhWbElEMGdjbVZ6ZFd4ME8xeHVYSFJjZEZ4MFhIUmNkSDFjYmx4MFhIUmNkRngwZlNCallYUmphQ0FvWlNrZ2UzMWNibHh1WEhSY2RGeDBYSFJwWmlBb0lXTnZiblpsY25SbGNpNTNjbWwwWlNrZ2UxeHVYSFJjZEZ4MFhIUmNkSFpoYkhWbElEMGdaVzVqYjJSbFZWSkpRMjl0Y0c5dVpXNTBLRk4wY21sdVp5aDJZV3gxWlNrcFhHNWNkRngwWEhSY2RGeDBYSFF1Y21Wd2JHRmpaU2d2SlNneU0zd3lOSHd5Tm53eVFud3pRWHd6UTN3elJYd3pSSHd5Um53elJudzBNSHcxUW53MVJIdzFSWHcyTUh3M1FudzNSSHczUXlrdlp5d2daR1ZqYjJSbFZWSkpRMjl0Y0c5dVpXNTBLVHRjYmx4MFhIUmNkRngwZlNCbGJITmxJSHRjYmx4MFhIUmNkRngwWEhSMllXeDFaU0E5SUdOdmJuWmxjblJsY2k1M2NtbDBaU2gyWVd4MVpTd2dhMlY1S1R0Y2JseDBYSFJjZEZ4MGZWeHVYRzVjZEZ4MFhIUmNkR3RsZVNBOUlHVnVZMjlrWlZWU1NVTnZiWEJ2Ym1WdWRDaFRkSEpwYm1jb2EyVjVLU2s3WEc1Y2RGeDBYSFJjZEd0bGVTQTlJR3RsZVM1eVpYQnNZV05sS0M4bEtESXpmREkwZkRJMmZESkNmRFZGZkRZd2ZEZERLUzluTENCa1pXTnZaR1ZWVWtsRGIyMXdiMjVsYm5RcE8xeHVYSFJjZEZ4MFhIUnJaWGtnUFNCclpYa3VjbVZ3YkdGalpTZ3ZXMXhjS0Z4Y0tWMHZaeXdnWlhOallYQmxLVHRjYmx4dVhIUmNkRngwWEhSMllYSWdjM1J5YVc1bmFXWnBaV1JCZEhSeWFXSjFkR1Z6SUQwZ0p5YzdYRzVjYmx4MFhIUmNkRngwWm05eUlDaDJZWElnWVhSMGNtbGlkWFJsVG1GdFpTQnBiaUJoZEhSeWFXSjFkR1Z6S1NCN1hHNWNkRngwWEhSY2RGeDBhV1lnS0NGaGRIUnlhV0oxZEdWelcyRjBkSEpwWW5WMFpVNWhiV1ZkS1NCN1hHNWNkRngwWEhSY2RGeDBYSFJqYjI1MGFXNTFaVHRjYmx4MFhIUmNkRngwWEhSOVhHNWNkRngwWEhSY2RGeDBjM1J5YVc1bmFXWnBaV1JCZEhSeWFXSjFkR1Z6SUNzOUlDYzdJQ2NnS3lCaGRIUnlhV0oxZEdWT1lXMWxPMXh1WEhSY2RGeDBYSFJjZEdsbUlDaGhkSFJ5YVdKMWRHVnpXMkYwZEhKcFluVjBaVTVoYldWZElEMDlQU0IwY25WbEtTQjdYRzVjZEZ4MFhIUmNkRngwWEhSamIyNTBhVzUxWlR0Y2JseDBYSFJjZEZ4MFhIUjlYRzVjZEZ4MFhIUmNkRngwYzNSeWFXNW5hV1pwWldSQmRIUnlhV0oxZEdWeklDczlJQ2M5SnlBcklHRjBkSEpwWW5WMFpYTmJZWFIwY21saWRYUmxUbUZ0WlYwN1hHNWNkRngwWEhSY2RIMWNibHgwWEhSY2RGeDBjbVYwZFhKdUlDaGtiMk4xYldWdWRDNWpiMjlyYVdVZ1BTQnJaWGtnS3lBblBTY2dLeUIyWVd4MVpTQXJJSE4wY21sdVoybG1hV1ZrUVhSMGNtbGlkWFJsY3lrN1hHNWNkRngwWEhSOVhHNWNibHgwWEhSY2RDOHZJRkpsWVdSY2JseHVYSFJjZEZ4MGFXWWdLQ0ZyWlhrcElIdGNibHgwWEhSY2RGeDBjbVZ6ZFd4MElEMGdlMzA3WEc1Y2RGeDBYSFI5WEc1Y2JseDBYSFJjZEM4dklGUnZJSEJ5WlhabGJuUWdkR2hsSUdadmNpQnNiMjl3SUdsdUlIUm9aU0JtYVhKemRDQndiR0ZqWlNCaGMzTnBaMjRnWVc0Z1pXMXdkSGtnWVhKeVlYbGNibHgwWEhSY2RDOHZJR2x1SUdOaGMyVWdkR2hsY21VZ1lYSmxJRzV2SUdOdmIydHBaWE1nWVhRZ1lXeHNMaUJCYkhOdklIQnlaWFpsYm5SeklHOWtaQ0J5WlhOMWJIUWdkMmhsYmx4dVhIUmNkRngwTHk4Z1kyRnNiR2x1WnlCY0ltZGxkQ2dwWENKY2JseDBYSFJjZEhaaGNpQmpiMjlyYVdWeklEMGdaRzlqZFcxbGJuUXVZMjl2YTJsbElEOGdaRzlqZFcxbGJuUXVZMjl2YTJsbExuTndiR2wwS0NjN0lDY3BJRG9nVzEwN1hHNWNkRngwWEhSMllYSWdjbVJsWTI5a1pTQTlJQzhvSlZzd0xUbEJMVnBkZXpKOUtTc3ZaenRjYmx4MFhIUmNkSFpoY2lCcElEMGdNRHRjYmx4dVhIUmNkRngwWm05eUlDZzdJR2tnUENCamIyOXJhV1Z6TG14bGJtZDBhRHNnYVNzcktTQjdYRzVjZEZ4MFhIUmNkSFpoY2lCd1lYSjBjeUE5SUdOdmIydHBaWE5iYVYwdWMzQnNhWFFvSnowbktUdGNibHgwWEhSY2RGeDBkbUZ5SUdOdmIydHBaU0E5SUhCaGNuUnpMbk5zYVdObEtERXBMbXB2YVc0b0p6MG5LVHRjYmx4dVhIUmNkRngwWEhScFppQW9JWFJvYVhNdWFuTnZiaUFtSmlCamIyOXJhV1V1WTJoaGNrRjBLREFwSUQwOVBTQW5YQ0luS1NCN1hHNWNkRngwWEhSY2RGeDBZMjl2YTJsbElEMGdZMjl2YTJsbExuTnNhV05sS0RFc0lDMHhLVHRjYmx4MFhIUmNkRngwZlZ4dVhHNWNkRngwWEhSY2RIUnllU0I3WEc1Y2RGeDBYSFJjZEZ4MGRtRnlJRzVoYldVZ1BTQndZWEowYzFzd1hTNXlaWEJzWVdObEtISmtaV052WkdVc0lHUmxZMjlrWlZWU1NVTnZiWEJ2Ym1WdWRDazdYRzVjZEZ4MFhIUmNkRngwWTI5dmEybGxJRDBnWTI5dWRtVnlkR1Z5TG5KbFlXUWdQMXh1WEhSY2RGeDBYSFJjZEZ4MFkyOXVkbVZ5ZEdWeUxuSmxZV1FvWTI5dmEybGxMQ0J1WVcxbEtTQTZJR052Ym5abGNuUmxjaWhqYjI5cmFXVXNJRzVoYldVcElIeDhYRzVjZEZ4MFhIUmNkRngwWEhSamIyOXJhV1V1Y21Wd2JHRmpaU2h5WkdWamIyUmxMQ0JrWldOdlpHVlZVa2xEYjIxd2IyNWxiblFwTzF4dVhHNWNkRngwWEhSY2RGeDBhV1lnS0hSb2FYTXVhbk52YmlrZ2UxeHVYSFJjZEZ4MFhIUmNkRngwZEhKNUlIdGNibHgwWEhSY2RGeDBYSFJjZEZ4MFkyOXZhMmxsSUQwZ1NsTlBUaTV3WVhKelpTaGpiMjlyYVdVcE8xeHVYSFJjZEZ4MFhIUmNkRngwZlNCallYUmphQ0FvWlNrZ2UzMWNibHgwWEhSY2RGeDBYSFI5WEc1Y2JseDBYSFJjZEZ4MFhIUnBaaUFvYTJWNUlEMDlQU0J1WVcxbEtTQjdYRzVjZEZ4MFhIUmNkRngwWEhSeVpYTjFiSFFnUFNCamIyOXJhV1U3WEc1Y2RGeDBYSFJjZEZ4MFhIUmljbVZoYXp0Y2JseDBYSFJjZEZ4MFhIUjlYRzVjYmx4MFhIUmNkRngwWEhScFppQW9JV3RsZVNrZ2UxeHVYSFJjZEZ4MFhIUmNkRngwY21WemRXeDBXMjVoYldWZElEMGdZMjl2YTJsbE8xeHVYSFJjZEZ4MFhIUmNkSDFjYmx4MFhIUmNkRngwZlNCallYUmphQ0FvWlNrZ2UzMWNibHgwWEhSY2RIMWNibHh1WEhSY2RGeDBjbVYwZFhKdUlISmxjM1ZzZER0Y2JseDBYSFI5WEc1Y2JseDBYSFJoY0drdWMyVjBJRDBnWVhCcE8xeHVYSFJjZEdGd2FTNW5aWFFnUFNCbWRXNWpkR2x2YmlBb2EyVjVLU0I3WEc1Y2RGeDBYSFJ5WlhSMWNtNGdZWEJwTG1OaGJHd29ZWEJwTENCclpYa3BPMXh1WEhSY2RIMDdYRzVjZEZ4MFlYQnBMbWRsZEVwVFQwNGdQU0JtZFc1amRHbHZiaUFvS1NCN1hHNWNkRngwWEhSeVpYUjFjbTRnWVhCcExtRndjR3g1S0h0Y2JseDBYSFJjZEZ4MGFuTnZiam9nZEhKMVpWeHVYSFJjZEZ4MGZTd2dXMTB1YzJ4cFkyVXVZMkZzYkNoaGNtZDFiV1Z1ZEhNcEtUdGNibHgwWEhSOU8xeHVYSFJjZEdGd2FTNWtaV1poZFd4MGN5QTlJSHQ5TzF4dVhHNWNkRngwWVhCcExuSmxiVzkyWlNBOUlHWjFibU4wYVc5dUlDaHJaWGtzSUdGMGRISnBZblYwWlhNcElIdGNibHgwWEhSY2RHRndhU2hyWlhrc0lDY25MQ0JsZUhSbGJtUW9ZWFIwY21saWRYUmxjeXdnZTF4dVhIUmNkRngwWEhSbGVIQnBjbVZ6T2lBdE1WeHVYSFJjZEZ4MGZTa3BPMXh1WEhSY2RIMDdYRzVjYmx4MFhIUmhjR2t1ZDJsMGFFTnZiblpsY25SbGNpQTlJR2x1YVhRN1hHNWNibHgwWEhSeVpYUjFjbTRnWVhCcE8xeHVYSFI5WEc1Y2JseDBjbVYwZFhKdUlHbHVhWFFvWm5WdVkzUnBiMjRnS0NrZ2UzMHBPMXh1ZlNrcE8xeHVJaXdpZG1GeUlIVjBhV3h6SUQwZ2NtVnhkV2x5WlNoY0lpNHZkWFJwYkhNdWFuTmNJaWs3WEhKY2JseHlYRzV0YjJSMWJHVXVaWGh3YjNKMGN5QTlJRUppYjNoQmJHbG5ibVZrVkdWNGREdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQkRjbVZoZEdWeklHRWdibVYzSUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQ0J2WW1wbFkzUWdMU0JoSUhSbGVIUWdiMkpxWldOMElIUm9ZWFFnWTJGdUlHSmxJR1J5WVhkdUlIZHBkR2hjY2x4dUlDb2dZVzVqYUc5eUlIQnZhVzUwY3lCaVlYTmxaQ0J2YmlCaElIUnBaMmgwSUdKdmRXNWthVzVuSUdKdmVDQmhjbTkxYm1RZ2RHaGxJSFJsZUhRdVhISmNiaUFxSUVCamIyNXpkSEoxWTNSdmNseHlYRzRnS2lCQWNHRnlZVzBnZTI5aWFtVmpkSDBnWm05dWRDQXRJSEExTGtadmJuUWdiMkpxWldOMFhISmNiaUFxSUVCd1lYSmhiU0I3YzNSeWFXNW5mU0IwWlhoMElDMGdVM1J5YVc1bklIUnZJR1JwYzNCc1lYbGNjbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUZ0bWIyNTBVMmw2WlQweE1sMGdMU0JHYjI1MElITnBlbVVnZEc4Z2RYTmxJR1p2Y2lCemRISnBibWRjY2x4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlGdDRQVEJkSUMwZ1NXNXBkR2xoYkNCNElHeHZZMkYwYVc5dVhISmNiaUFxSUVCd1lYSmhiU0I3Ym5WdFltVnlmU0JiZVQwd1hTQXRJRWx1YVhScFlXd2dlU0JzYjJOaGRHbHZibHh5WEc0Z0tpQkFjR0Z5WVcwZ2UyOWlhbVZqZEgwZ1czQkpibk4wWVc1alpUMTNhVzVrYjNkZElDMGdVbVZtWlhKbGJtTmxJSFJ2SUhBMUlHbHVjM1JoYm1ObExDQnNaV0YyWlNCaWJHRnVheUJwWmx4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYzJ0bGRHTm9JR2x6SUdkc2IySmhiRnh5WEc0Z0tpQkFaWGhoYlhCc1pWeHlYRzRnS2lCMllYSWdabTl1ZEN3Z1ltSnZlRlJsZUhRN1hISmNiaUFxSUdaMWJtTjBhVzl1SUhCeVpXeHZZV1FvS1NCN1hISmNiaUFxSUNBZ0lDQm1iMjUwSUQwZ2JHOWhaRVp2Ym5Rb1hDSXVMMkZ6YzJWMGN5OVNaV2QxYkdGeUxuUjBabHdpS1R0Y2NseHVJQ29nZlZ4eVhHNGdLaUJtZFc1amRHbHZiaUJ6WlhSMWNDZ3BJSHRjY2x4dUlDb2dJQ0FnSUdOeVpXRjBaVU5oYm5aaGN5ZzBNREFzSURZd01DazdYSEpjYmlBcUlDQWdJQ0JpWVdOclozSnZkVzVrS0RBcE8xeHlYRzRnS2lBZ0lDQWdYSEpjYmlBcUlDQWdJQ0JpWW05NFZHVjRkQ0E5SUc1bGR5QkNZbTk0UVd4cFoyNWxaRlJsZUhRb1ptOXVkQ3dnWENKSVpYa2hYQ0lzSURNd0tUc2dJQ0FnWEhKY2JpQXFJQ0FnSUNCaVltOTRWR1Y0ZEM1elpYUlNiM1JoZEdsdmJpaFFTU0F2SURRcE8xeHlYRzRnS2lBZ0lDQWdZbUp2ZUZSbGVIUXVjMlYwUVc1amFHOXlLRUppYjNoQmJHbG5ibVZrVkdWNGRDNUJURWxIVGk1Q1QxaGZRMFZPVkVWU0xDQmNjbHh1SUNvZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JDWW05NFFXeHBaMjVsWkZSbGVIUXVRa0ZUUlV4SlRrVXVRazlZWDBORlRsUkZVaWs3WEhKY2JpQXFJQ0FnSUNCY2NseHVJQ29nSUNBZ0lHWnBiR3dvWENJak1EQkJPRVZCWENJcE8xeHlYRzRnS2lBZ0lDQWdibTlUZEhKdmEyVW9LVHRjY2x4dUlDb2dJQ0FnSUdKaWIzaFVaWGgwTG1SeVlYY29kMmxrZEdnZ0x5QXlMQ0JvWldsbmFIUWdMeUF5S1R0Y2NseHVJQ29nZlZ4eVhHNGdLaTljY2x4dVpuVnVZM1JwYjI0Z1FtSnZlRUZzYVdkdVpXUlVaWGgwS0dadmJuUXNJSFJsZUhRc0lHWnZiblJUYVhwbExDQjRMQ0I1TENCd1NXNXpkR0Z1WTJVcElIdGNjbHh1SUNBZ0lIUm9hWE11WDJadmJuUWdQU0JtYjI1ME8xeHlYRzRnSUNBZ2RHaHBjeTVmZEdWNGRDQTlJSFJsZUhRN1hISmNiaUFnSUNCMGFHbHpMbDk0SUQwZ2RYUnBiSE11WkdWbVlYVnNkQ2g0TENBd0tUdGNjbHh1SUNBZ0lIUm9hWE11WDNrZ1BTQjFkR2xzY3k1a1pXWmhkV3gwS0hrc0lEQXBPMXh5WEc0Z0lDQWdkR2hwY3k1ZlptOXVkRk5wZW1VZ1BTQjFkR2xzY3k1a1pXWmhkV3gwS0dadmJuUlRhWHBsTENBeE1pazdYSEpjYmlBZ0lDQjBhR2x6TGw5d0lEMGdkWFJwYkhNdVpHVm1ZWFZzZENod1NXNXpkR0Z1WTJVc0lIZHBibVJ2ZHlrN1hISmNiaUFnSUNCMGFHbHpMbDl5YjNSaGRHbHZiaUE5SURBN1hISmNiaUFnSUNCMGFHbHpMbDlvUVd4cFoyNGdQU0JDWW05NFFXeHBaMjVsWkZSbGVIUXVRVXhKUjA0dVFrOVlYME5GVGxSRlVqdGNjbHh1SUNBZ0lIUm9hWE11WDNaQmJHbG5iaUE5SUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQzVDUVZORlRFbE9SUzVDVDFoZlEwVk9WRVZTTzF4eVhHNGdJQ0FnZEdocGN5NWZZMkZzWTNWc1lYUmxUV1YwY21samN5aDBjblZsS1R0Y2NseHVmVnh5WEc1Y2NseHVMeW9xWEhKY2JpQXFJRlpsY25ScFkyRnNJR0ZzYVdkdWJXVnVkQ0IyWVd4MVpYTmNjbHh1SUNvZ1FIQjFZbXhwWTF4eVhHNGdLaUJBYzNSaGRHbGpYSEpjYmlBcUlFQnlaV0ZrYjI1c2VWeHlYRzRnS2lCQVpXNTFiU0I3YzNSeWFXNW5mVnh5WEc0Z0tpOWNjbHh1UW1KdmVFRnNhV2R1WldSVVpYaDBMa0ZNU1VkT0lEMGdlMXh5WEc0Z0lDQWdMeW9xSUVSeVlYY2dabkp2YlNCMGFHVWdiR1ZtZENCdlppQjBhR1VnWW1KdmVDQXFMMXh5WEc0Z0lDQWdRazlZWDB4RlJsUTZJRndpWW05NFgyeGxablJjSWl4Y2NseHVJQ0FnSUM4cUtpQkVjbUYzSUdaeWIyMGdkR2hsSUdObGJuUmxjaUJ2WmlCMGFHVWdZbUp2ZUNBcUwxeHlYRzRnSUNBZ1FrOVlYME5GVGxSRlVqb2dYQ0ppYjNoZlkyVnVkR1Z5WENJc1hISmNiaUFnSUNBdktpb2dSSEpoZHlCbWNtOXRJSFJvWlNCeWFXZG9kQ0J2WmlCMGFHVWdZbUp2ZUNBcUwxeHlYRzRnSUNBZ1FrOVlYMUpKUjBoVU9pQmNJbUp2ZUY5eWFXZG9kRndpWEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dRbUZ6Wld4cGJtVWdZV3hwWjI1dFpXNTBJSFpoYkhWbGMxeHlYRzRnS2lCQWNIVmliR2xqWEhKY2JpQXFJRUJ6ZEdGMGFXTmNjbHh1SUNvZ1FISmxZV1J2Ym14NVhISmNiaUFxSUVCbGJuVnRJSHR6ZEhKcGJtZDlYSEpjYmlBcUwxeHlYRzVDWW05NFFXeHBaMjVsWkZSbGVIUXVRa0ZUUlV4SlRrVWdQU0I3WEhKY2JpQWdJQ0F2S2lvZ1JISmhkeUJtY205dElIUm9aU0IwYjNBZ2IyWWdkR2hsSUdKaWIzZ2dLaTljY2x4dUlDQWdJRUpQV0Y5VVQxQTZJRndpWW05NFgzUnZjRndpTEZ4eVhHNGdJQ0FnTHlvcUlFUnlZWGNnWm5KdmJTQjBhR1VnWTJWdWRHVnlJRzltSUhSb1pTQmlZbTk0SUNvdlhISmNiaUFnSUNCQ1QxaGZRMFZPVkVWU09pQmNJbUp2ZUY5alpXNTBaWEpjSWl4Y2NseHVJQ0FnSUM4cUtpQkVjbUYzSUdaeWIyMGdkR2hsSUdKdmRIUnZiU0J2WmlCMGFHVWdZbUp2ZUNBcUwxeHlYRzRnSUNBZ1FrOVlYMEpQVkZSUFRUb2dYQ0ppYjNoZlltOTBkRzl0WENJc1hISmNiaUFnSUNBdktpb2dYSEpjYmlBZ0lDQWdLaUJFY21GM0lHWnliMjBnYUdGc1ppQjBhR1VnYUdWcFoyaDBJRzltSUhSb1pTQm1iMjUwTGlCVGNHVmphV1pwWTJGc2JIa2dkR2hsSUdobGFXZG9kQ0JwYzF4eVhHNGdJQ0FnSUNvZ1kyRnNZM1ZzWVhSbFpDQmhjem9nWVhOalpXNTBJQ3NnWkdWelkyVnVkQzVjY2x4dUlDQWdJQ0FxTDF4eVhHNGdJQ0FnUms5T1ZGOURSVTVVUlZJNklGd2labTl1ZEY5alpXNTBaWEpjSWl4Y2NseHVJQ0FnSUM4cUtpQkVjbUYzSUdaeWIyMGdkR2hsSUhSb1pTQnViM0p0WVd3Z1ptOXVkQ0JpWVhObGJHbHVaU0FxTDF4eVhHNGdJQ0FnUVV4UVNFRkNSVlJKUXpvZ1hDSmhiSEJvWVdKbGRHbGpYQ0pjY2x4dWZUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlRaWFFnWTNWeWNtVnVkQ0IwWlhoMFhISmNiaUFxSUVCd2RXSnNhV05jY2x4dUlDb2dRSEJoY21GdElIdHpkSEpwYm1kOUlITjBjbWx1WnlBdElGUmxlSFFnYzNSeWFXNW5JSFJ2SUdScGMzQnNZWGxjY2x4dUlDb2dRSEpsZEhWeWJuTWdlM1JvYVhOOUlGVnpaV1oxYkNCbWIzSWdZMmhoYVc1cGJtZGNjbHh1SUNvdlhISmNia0ppYjNoQmJHbG5ibVZrVkdWNGRDNXdjbTkwYjNSNWNHVXVjMlYwVkdWNGRDQTlJR1oxYm1OMGFXOXVLSE4wY21sdVp5a2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZmRHVjRkQ0E5SUhOMGNtbHVaenRjY2x4dUlDQWdJSFJvYVhNdVgyTmhiR04xYkdGMFpVMWxkSEpwWTNNb1ptRnNjMlVwTzF4eVhHNGdJQ0FnY21WMGRYSnVJSFJvYVhNN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nVTJWMElIUm9aU0IwWlhoMElIQnZjMmwwYVc5dVhISmNiaUFxSUVCd2RXSnNhV05jY2x4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlIZ2dMU0JZSUhCdmMybDBhVzl1WEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQjRJQzBnV1NCd2IzTnBkR2x2Ymx4eVhHNGdLaUJBY21WMGRYSnVjeUI3ZEdocGMzMGdWWE5sWm5Wc0lHWnZjaUJqYUdGcGJtbHVaMXh5WEc0Z0tpOWNjbHh1UW1KdmVFRnNhV2R1WldSVVpYaDBMbkJ5YjNSdmRIbHdaUzV6WlhSUWIzTnBkR2x2YmlBOUlHWjFibU4wYVc5dUtIZ3NJSGtwSUh0Y2NseHVJQ0FnSUhSb2FYTXVYM2dnUFNCMWRHbHNjeTVrWldaaGRXeDBLSGdzSUhSb2FYTXVYM2dwTzF4eVhHNGdJQ0FnZEdocGN5NWZlU0E5SUhWMGFXeHpMbVJsWm1GMWJIUW9lU3dnZEdocGN5NWZlU2s3WEhKY2JpQWdJQ0J5WlhSMWNtNGdkR2hwY3p0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJIWlhRZ2RHaGxJSFJsZUhRZ2NHOXphWFJwYjI1Y2NseHVJQ29nUUhCMVlteHBZMXh5WEc0Z0tpQkFjbVYwZFhKdUlIdHZZbXBsWTNSOUlGSmxkSFZ5Ym5NZ1lXNGdiMkpxWldOMElIZHBkR2dnY0hKdmNHVnlkR2xsY3pvZ2VDd2dlVnh5WEc0Z0tpOWNjbHh1UW1KdmVFRnNhV2R1WldSVVpYaDBMbkJ5YjNSdmRIbHdaUzVuWlhSUWIzTnBkR2x2YmlBOUlHWjFibU4wYVc5dUtDa2dlMXh5WEc0Z0lDQWdjbVYwZFhKdUlIdGNjbHh1SUNBZ0lDQWdJQ0I0T2lCMGFHbHpMbDk0TEZ4eVhHNGdJQ0FnSUNBZ0lIazZJSFJvYVhNdVgzbGNjbHh1SUNBZ0lIMDdYSEpjYm4wN1hISmNibHh5WEc0dktpcGNjbHh1SUNvZ1UyVjBJR04xY25KbGJuUWdkR1Y0ZENCemFYcGxYSEpjYmlBcUlFQndkV0pzYVdOY2NseHVJQ29nUUhCaGNtRnRJSHR1ZFcxaVpYSjlJR1p2Ym5SVGFYcGxJRlJsZUhRZ2MybDZaVnh5WEc0Z0tpQkFjbVYwZFhKdWN5QjdkR2hwYzMwZ1ZYTmxablZzSUdadmNpQmphR0ZwYm1sdVoxeHlYRzRnS2k5Y2NseHVRbUp2ZUVGc2FXZHVaV1JVWlhoMExuQnliM1J2ZEhsd1pTNXpaWFJVWlhoMFUybDZaU0E5SUdaMWJtTjBhVzl1S0dadmJuUlRhWHBsS1NCN1hISmNiaUFnSUNCMGFHbHpMbDltYjI1MFUybDZaU0E5SUdadmJuUlRhWHBsTzF4eVhHNGdJQ0FnZEdocGN5NWZZMkZzWTNWc1lYUmxUV1YwY21samN5aDBjblZsS1R0Y2NseHVJQ0FnSUhKbGRIVnliaUIwYUdsek8xeHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUZObGRDQnliM1JoZEdsdmJpQnZaaUIwWlhoMFhISmNiaUFxSUVCd2RXSnNhV05jY2x4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlHRnVaMnhsSUMwZ1VtOTBZWFJwYjI0Z2FXNGdjbUZrYVdGdWMxeHlYRzRnS2lCQWNtVjBkWEp1Y3lCN2RHaHBjMzBnVlhObFpuVnNJR1p2Y2lCamFHRnBibWx1WjF4eVhHNGdLaTljY2x4dVFtSnZlRUZzYVdkdVpXUlVaWGgwTG5CeWIzUnZkSGx3WlM1elpYUlNiM1JoZEdsdmJpQTlJR1oxYm1OMGFXOXVLR0Z1WjJ4bEtTQjdYSEpjYmlBZ0lDQjBhR2x6TGw5eWIzUmhkR2x2YmlBOUlIVjBhV3h6TG1SbFptRjFiSFFvWVc1bmJHVXNJSFJvYVhNdVgzSnZkR0YwYVc5dUtUdGNjbHh1SUNBZ0lISmxkSFZ5YmlCMGFHbHpPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFZGxkQ0J5YjNSaGRHbHZiaUJ2WmlCMFpYaDBYSEpjYmlBcUlFQndkV0pzYVdOY2NseHVJQ29nUUhKbGRIVnlibk1nZTI1MWJXSmxjbjBnVW05MFlYUnBiMjRnYVc0Z2NtRmthV0Z1YzF4eVhHNGdLaTljY2x4dVFtSnZlRUZzYVdkdVpXUlVaWGgwTG5CeWIzUnZkSGx3WlM1blpYUlNiM1JoZEdsdmJpQTlJR1oxYm1OMGFXOXVLR0Z1WjJ4bEtTQjdYSEpjYmlBZ0lDQnlaWFIxY200Z2RHaHBjeTVmY205MFlYUnBiMjQ3WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dVMlYwSUhSb1pTQndJR2x1YzNSaGJtTmxJSFJvWVhRZ2FYTWdkWE5sWkNCbWIzSWdaSEpoZDJsdVoxeHlYRzRnS2lCQWNIVmliR2xqWEhKY2JpQXFJRUJ3WVhKaGJTQjdiMkpxWldOMGZTQndJQzBnU1c1emRHRnVZMlVnYjJZZ2NEVWdabTl5SUdSeVlYZHBibWN1SUZSb2FYTWdhWE1nYjI1c2VTQnVaV1ZrWldRZ2QyaGxiaUJjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IxYzJsdVp5QmhiaUJ2Wm1aelkzSmxaVzRnY21WdVpHVnlaWElnYjNJZ2QyaGxiaUIxYzJsdVp5QndOU0JwYmlCcGJuTjBZVzVqWlZ4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUcxdlpHVXVYSEpjYmlBcUlFQnlaWFIxY201eklIdDBhR2x6ZlNCVmMyVm1kV3dnWm05eUlHTm9ZV2x1YVc1blhISmNiaUFxTDF4eVhHNUNZbTk0UVd4cFoyNWxaRlJsZUhRdWNISnZkRzkwZVhCbExuTmxkRkJKYm5OMFlXNWpaU0E5SUdaMWJtTjBhVzl1S0hBcElIdGNjbHh1SUNBZ0lIUm9hWE11WDNBZ1BTQjFkR2xzY3k1a1pXWmhkV3gwS0hBc0lIUm9hWE11WDNBcE8xeHlYRzRnSUNBZ2NtVjBkWEp1SUhSb2FYTTdYSEpjYm4wN1hISmNibHh5WEc0dktpcGNjbHh1SUNvZ1IyVjBJSEp2ZEdGMGFXOXVJRzltSUhSbGVIUmNjbHh1SUNvZ1FIQjFZbXhwWTF4eVhHNGdLaUJBY21WMGRYSnVjeUI3YjJKcVpXTjBmU0JKYm5OMFlXNWpaU0J2WmlCd05TQjBhR0YwSUdseklHSmxhVzVuSUhWelpXUWdabTl5SUdSeVlYZHBibWRjY2x4dUlDb3ZYSEpjYmtKaWIzaEJiR2xuYm1Wa1ZHVjRkQzV3Y205MGIzUjVjR1V1WjJWMFVFbHVjM1JoYm1ObElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdJQ0J5WlhSMWNtNGdkR2hwY3k1ZmNEdGNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtseHlYRzRnS2lCVFpYUWdZVzVqYUc5eUlIQnZhVzUwSUdadmNpQjBaWGgwSUNob2IzSnBlbTl1WVd3Z1lXNWtJSFpsY25ScFkyRnNJR0ZzYVdkdWJXVnVkQ2tnY21Wc1lYUnBkbVVnZEc5Y2NseHVJQ29nWW05MWJtUnBibWNnWW05NFhISmNiaUFxSUVCd2RXSnNhV05jY2x4dUlDb2dRSEJoY21GdElIdHpkSEpwYm1kOUlGdG9RV3hwWjI0OVEwVk9WRVZTWFNBdElFaHZjbWw2YjI1aGJDQmhiR2xuYm0xbGJuUmNjbHh1SUNvZ1FIQmhjbUZ0SUh0emRISnBibWQ5SUZ0MlFXeHBaMjQ5UTBWT1ZFVlNYU0F0SUZabGNuUnBZMkZzSUdKaGMyVnNhVzVsWEhKY2JpQXFJRUJ3WVhKaGJTQjdZbTl2YkdWaGJuMGdXM1Z3WkdGMFpWQnZjMmwwYVc5dVBXWmhiSE5sWFNBdElFbG1JSE5sZENCMGJ5QjBjblZsTENCMGFHVWdjRzl6YVhScGIyNGdiMllnZEdobFhISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJvWlNCMFpYaDBJSGRwYkd3Z1ltVWdjMmhwWm5SbFpDQnpieUIwYUdGMFhISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJvWlNCMFpYaDBJSGRwYkd3Z1ltVWdaSEpoZDI0Z2FXNGdkR2hsSUhOaGJXVmNjbHh1SUNvZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0d4aFkyVWdhWFFnZDJGeklHSmxabTl5WlNCallXeHNhVzVuSUZ4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnpaWFJCYm1Ob2IzSXVYSEpjYmlBcUlFQnlaWFIxY201eklIdDBhR2x6ZlNCVmMyVm1kV3dnWm05eUlHTm9ZV2x1YVc1blhISmNiaUFxTDF4eVhHNUNZbTk0UVd4cFoyNWxaRlJsZUhRdWNISnZkRzkwZVhCbExuTmxkRUZ1WTJodmNpQTlJR1oxYm1OMGFXOXVLR2hCYkdsbmJpd2dka0ZzYVdkdUxDQjFjR1JoZEdWUWIzTnBkR2x2YmlrZ2UxeHlYRzRnSUNBZ2RtRnlJRzlzWkZCdmN5QTlJSFJvYVhNdVgyTmhiR04xYkdGMFpVRnNhV2R1WldSRGIyOXlaSE1vZEdocGN5NWZlQ3dnZEdocGN5NWZlU2s3WEhKY2JpQWdJQ0IwYUdsekxsOW9RV3hwWjI0Z1BTQjFkR2xzY3k1a1pXWmhkV3gwS0doQmJHbG5iaXdnUW1KdmVFRnNhV2R1WldSVVpYaDBMa0ZNU1VkT0xrTkZUbFJGVWlrN1hISmNiaUFnSUNCMGFHbHpMbDkyUVd4cFoyNGdQU0IxZEdsc2N5NWtaV1poZFd4MEtIWkJiR2xuYml3Z1FtSnZlRUZzYVdkdVpXUlVaWGgwTGtKQlUwVk1TVTVGTGtORlRsUkZVaWs3WEhKY2JpQWdJQ0JwWmlBb2RYQmtZWFJsVUc5emFYUnBiMjRwSUh0Y2NseHVJQ0FnSUNBZ0lDQjJZWElnYm1WM1VHOXpJRDBnZEdocGN5NWZZMkZzWTNWc1lYUmxRV3hwWjI1bFpFTnZiM0prY3loMGFHbHpMbDk0TENCMGFHbHpMbDk1S1R0Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5NElDczlJRzlzWkZCdmN5NTRJQzBnYm1WM1VHOXpMbmc3WEhKY2JpQWdJQ0FnSUNBZ2RHaHBjeTVmZVNBclBTQnZiR1JRYjNNdWVTQXRJRzVsZDFCdmN5NTVPMXh5WEc0Z0lDQWdmVnh5WEc0Z0lDQWdjbVYwZFhKdUlIUm9hWE03WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dSMlYwSUhSb1pTQmliM1Z1WkdsdVp5QmliM2dnZDJobGJpQjBhR1VnZEdWNGRDQnBjeUJ3YkdGalpXUWdZWFFnZEdobElITndaV05wWm1sbFpDQmpiMjl5WkdsdVlYUmxjeTVjY2x4dUlDb2dUbTkwWlRvZ2RHaHBjeUJwY3lCMGFHVWdkVzV5YjNSaGRHVmtJR0p2ZFc1a2FXNW5JR0p2ZUNFZ1ZFOUVUem9nUm1sNElIUm9hWE11WEhKY2JpQXFJRUJ3WVhKaGJTQjdiblZ0WW1WeWZTQmJlRDFqZFhKeVpXNTBJSGhkSUMwZ1FTQnVaWGNnZUNCamIyOXlaR2x1WVhSbElHOW1JSFJsZUhRZ1lXNWphRzl5TGlCVWFHbHpYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZDJsc2JDQmphR0Z1WjJVZ2RHaGxJSFJsZUhRbmN5QjRJSEJ2YzJsMGFXOXVJRnh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhCbGNtMWhibVZ1ZEd4NUxpQmNjbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUZ0NVBXTjFjbkpsYm5RZ2VWMGdMU0JCSUc1bGR5QjVJR052YjNKa2FXNWhkR1VnYjJZZ2RHVjRkQ0JoYm1Ob2IzSXVJRlJvYVhOY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjNhV3hzSUdOb1lXNW5aU0IwYUdVZ2RHVjRkQ2R6SUhnZ2NHOXphWFJwYjI0Z1hISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjR1Z5YldGdVpXNTBiSGt1WEhKY2JpQXFJRUJ5WlhSMWNtNGdlMjlpYW1WamRIMGdVbVYwZFhKdWN5QmhiaUJ2WW1wbFkzUWdkMmwwYUNCd2NtOXdaWEowYVdWek9pQjRMQ0I1TENCM0xDQm9YSEpjYmlBcUwxeHlYRzVDWW05NFFXeHBaMjVsWkZSbGVIUXVjSEp2ZEc5MGVYQmxMbWRsZEVKaWIzZ2dQU0JtZFc1amRHbHZiaWg0TENCNUtTQjdYSEpjYmlBZ0lDQjBhR2x6TG5ObGRGQnZjMmwwYVc5dUtIZ3NJSGtwTzF4eVhHNGdJQ0FnZG1GeUlIQnZjeUE5SUhSb2FYTXVYMk5oYkdOMWJHRjBaVUZzYVdkdVpXUkRiMjl5WkhNb2RHaHBjeTVmZUN3Z2RHaHBjeTVmZVNrN1hISmNiaUFnSUNCeVpYUjFjbTRnZTF4eVhHNGdJQ0FnSUNBZ0lIZzZJSEJ2Y3k1NElDc2dkR2hwY3k1ZlltOTFibVJ6VDJabWMyVjBMbmdzWEhKY2JpQWdJQ0FnSUNBZ2VUb2djRzl6TG5rZ0t5QjBhR2x6TGw5aWIzVnVaSE5QWm1aelpYUXVlU3hjY2x4dUlDQWdJQ0FnSUNCM09pQjBhR2x6TG5kcFpIUm9MRnh5WEc0Z0lDQWdJQ0FnSUdnNklIUm9hWE11YUdWcFoyaDBYSEpjYmlBZ0lDQjlPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFZGxkQ0JoYmlCaGNuSmhlU0J2WmlCd2IybHVkSE1nZEdoaGRDQm1iMnhzYjNjZ1lXeHZibWNnZEdobElIUmxlSFFnY0dGMGFDNGdWR2hwY3lCM2FXeHNJSFJoYTJVZ2FXNTBiMXh5WEc0Z0tpQmpiMjV6YVdSbGNtRjBhVzl1SUhSb1pTQmpkWEp5Wlc1MElHRnNhV2R1YldWdWRDQnpaWFIwYVc1bmN5NWNjbHh1SUNvZ1RtOTBaVG9nZEdocGN5QnBjeUJoSUhSb2FXNGdkM0poY0hCbGNpQmhjbTkxYm1RZ1lTQndOU0J0WlhSb2IyUWdZVzVrSUdSdlpYTnVKM1FnYUdGdVpHeGxJSFZ1Y205MFlYUmxaRnh5WEc0Z0tpQjBaWGgwSVNCVVQwUlBPaUJHYVhnZ2RHaHBjeTVjY2x4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlGdDRQV04xY25KbGJuUWdlRjBnTFNCQklHNWxkeUI0SUdOdmIzSmthVzVoZEdVZ2IyWWdkR1Y0ZENCaGJtTm9iM0l1SUZSb2FYTmNjbHh1SUNvZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IzYVd4c0lHTm9ZVzVuWlNCMGFHVWdkR1Y0ZENkeklIZ2djRzl6YVhScGIyNGdYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY0dWeWJXRnVaVzUwYkhrdUlGeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnVzNrOVkzVnljbVZ1ZENCNVhTQXRJRUVnYm1WM0lIa2dZMjl2Y21ScGJtRjBaU0J2WmlCMFpYaDBJR0Z1WTJodmNpNGdWR2hwYzF4eVhHNGdLaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIZHBiR3dnWTJoaGJtZGxJSFJvWlNCMFpYaDBKM01nZUNCd2IzTnBkR2x2YmlCY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQndaWEp0WVc1bGJuUnNlUzVjY2x4dUlDb2dRSEJoY21GdElIdHZZbXBsWTNSOUlGdHZjSFJwYjI1elhTQXRJRUZ1SUc5aWFtVmpkQ0IwYUdGMElHTmhiaUJvWVhabE9seHlYRzRnS2lBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQXRJSE5oYlhCc1pVWmhZM1J2Y2pvZ2NtRjBhVzhnYjJZZ2NHRjBhQzFzWlc1bmRHZ2dkRzhnYm5WdFltVnlYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYjJZZ2MyRnRjR3hsY3lBb1pHVm1ZWFZzZEQwd0xqSTFLUzRnU0dsbmFHVnlJSFpoYkhWbGN5QmNjbHh1SUNvZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I1YVdWc1pDQnRiM0psY0c5cGJuUnpJR0Z1WkNCaGNtVWdkR2hsY21WbWIzSmxJRzF2Y21VZ1hISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjSEpsWTJselpTNGdYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQzBnYzJsdGNHeHBabmxVYUhKbGMyaHZiR1E2SUdsbUlITmxkQ0IwYnlCaElHNXZiaTE2WlhKdklGeHlYRzRnS2lBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoYkhWbExDQmpiMnhzYVc1bFlYSWdjRzlwYm5SeklIZHBiR3dnWW1VZ2NtVnRiM1psWkM0Z1ZHaGxYSEpjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1Gc2RXVWdjbVZ3Y21WelpXNTBjeUIwYUdVZ2RHaHlaWE5vYjJ4a0lHRnVaMnhsSUhSdklIVnpaVnh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhkb1pXNGdaR1YwWlhKdGFXNXBibWNnZDJobGRHaGxjaUIwZDI4Z1pXUm5aWE1nWVhKbElGeHlYRzRnS2lBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR052Ykd4cGJtVmhjaTVjY2x4dUlDb2dRSEpsZEhWeWJpQjdZWEp5WVhsOUlFRnVJR0Z5Y21GNUlHOW1JSEJ2YVc1MGN5d2daV0ZqYUNCM2FYUm9JSGdzSUhrZ0ppQmhiSEJvWVNBb2RHaGxJSEJoZEdnZ1lXNW5iR1VwWEhKY2JpQXFMMXh5WEc1Q1ltOTRRV3hwWjI1bFpGUmxlSFF1Y0hKdmRHOTBlWEJsTG1kbGRGUmxlSFJRYjJsdWRITWdQU0JtZFc1amRHbHZiaWg0TENCNUxDQnZjSFJwYjI1ektTQjdYSEpjYmlBZ0lDQjBhR2x6TG5ObGRGQnZjMmwwYVc5dUtIZ3NJSGtwTzF4eVhHNGdJQ0FnZG1GeUlIQnZhVzUwY3lBOUlIUm9hWE11WDJadmJuUXVkR1Y0ZEZSdlVHOXBiblJ6S0hSb2FYTXVYM1JsZUhRc0lIUm9hWE11WDNnc0lIUm9hWE11WDNrc0lGeHlYRzRnSUNBZ0lDQWdJSFJvYVhNdVgyWnZiblJUYVhwbExDQnZjSFJwYjI1ektUdGNjbHh1SUNBZ0lHWnZjaUFvZG1GeUlHa2dQU0F3T3lCcElEd2djRzlwYm5SekxteGxibWQwYURzZ2FTQXJQU0F4S1NCN1hISmNiaUFnSUNBZ0lDQWdkbUZ5SUhCdmN5QTlJSFJvYVhNdVgyTmhiR04xYkdGMFpVRnNhV2R1WldSRGIyOXlaSE1vY0c5cGJuUnpXMmxkTG5nc0lIQnZhVzUwYzF0cFhTNTVLVHRjY2x4dUlDQWdJQ0FnSUNCd2IybHVkSE5iYVYwdWVDQTlJSEJ2Y3k1NE8xeHlYRzRnSUNBZ0lDQWdJSEJ2YVc1MGMxdHBYUzU1SUQwZ2NHOXpMbms3WEhKY2JpQWdJQ0I5WEhKY2JpQWdJQ0J5WlhSMWNtNGdjRzlwYm5Sek8xeHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUVSeVlYZHpJSFJvWlNCMFpYaDBJSEJoY25ScFkyeGxJSGRwZEdnZ2RHaGxJSE53WldOcFptbGxaQ0J6ZEhsc1pTQndZWEpoYldWMFpYSnpMaUJPYjNSbE9pQjBhR2x6SUdselhISmNiaUFxSUdkdmFXNW5JSFJ2SUhObGRDQjBhR1VnZEdWNGRFWnZiblFzSUhSbGVIUlRhWHBsSUNZZ2NtOTBZWFJwYjI0Z1ltVm1iM0psSUdSeVlYZHBibWN1SUZsdmRTQnphRzkxYkdRZ2MyVjBYSEpjYmlBcUlIUm9aU0JqYjJ4dmNpOXpkSEp2YTJVdlptbHNiQ0IwYUdGMElIbHZkU0IzWVc1MElHSmxabTl5WlNCa2NtRjNhVzVuTGlCVWFHbHpJR1oxYm1OMGFXOXVJSGRwYkd3Z1kyeGxZVzVjY2x4dUlDb2dkWEFnWVdaMFpYSWdhWFJ6Wld4bUlHRnVaQ0J5WlhObGRDQnpkSGxzYVc1bklHSmhZMnNnZEc4Z2QyaGhkQ0JwZENCM1lYTWdZbVZtYjNKbElHbDBJSGRoY3lCallXeHNaV1F1WEhKY2JpQXFJRUJ3ZFdKc2FXTmNjbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUZ0NFBXTjFjbkpsYm5RZ2VGMGdMU0JCSUc1bGR5QjRJR052YjNKa2FXNWhkR1VnYjJZZ2RHVjRkQ0JoYm1Ob2IzSXVJRlJvYVhNZ2QybHNiRnh5WEc0Z0tpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJoaGJtZGxJSFJvWlNCMFpYaDBKM01nZUNCd2IzTnBkR2x2YmlCd1pYSnRZVzVsYm5Sc2VTNGdYSEpjYmlBcUlFQndZWEpoYlNCN2JuVnRZbVZ5ZlNCYmVUMWpkWEp5Wlc1MElIbGRJQzBnUVNCdVpYY2dlU0JqYjI5eVpHbHVZWFJsSUc5bUlIUmxlSFFnWVc1amFHOXlMaUJVYUdseklIZHBiR3hjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamFHRnVaMlVnZEdobElIUmxlSFFuY3lCNElIQnZjMmwwYVc5dUlIQmxjbTFoYm1WdWRHeDVMbHh5WEc0Z0tpQkFjR0Z5WVcwZ2UySnZiMnhsWVc1OUlGdGtjbUYzUW05MWJtUnpQV1poYkhObFhTQXRJRVpzWVdjZ1ptOXlJR1J5WVhkcGJtY2dZbTkxYm1ScGJtY2dZbTk0WEhKY2JpQXFMMXh5WEc1Q1ltOTRRV3hwWjI1bFpGUmxlSFF1Y0hKdmRHOTBlWEJsTG1SeVlYY2dQU0JtZFc1amRHbHZiaWg0TENCNUxDQmtjbUYzUW05MWJtUnpLU0I3WEhKY2JpQWdJQ0JrY21GM1FtOTFibVJ6SUQwZ2RYUnBiSE11WkdWbVlYVnNkQ2hrY21GM1FtOTFibVJ6TENCbVlXeHpaU2s3WEhKY2JpQWdJQ0IwYUdsekxuTmxkRkJ2YzJsMGFXOXVLSGdzSUhrcE8xeHlYRzRnSUNBZ2RtRnlJSEJ2Y3lBOUlIdGNjbHh1SUNBZ0lDQWdJQ0I0T2lCMGFHbHpMbDk0TENCY2NseHVJQ0FnSUNBZ0lDQjVPaUIwYUdsekxsOTVYSEpjYmlBZ0lDQjlPMXh5WEc1Y2NseHVJQ0FnSUhSb2FYTXVYM0F1Y0hWemFDZ3BPMXh5WEc1Y2NseHVJQ0FnSUNBZ0lDQnBaaUFvZEdocGN5NWZjbTkwWVhScGIyNHBJSHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdjRzl6SUQwZ2RHaHBjeTVmWTJGc1kzVnNZWFJsVW05MFlYUmxaRU52YjNKa2N5aHdiM011ZUN3Z2NHOXpMbmtzSUhSb2FYTXVYM0p2ZEdGMGFXOXVLVHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdkR2hwY3k1ZmNDNXliM1JoZEdVb2RHaHBjeTVmY205MFlYUnBiMjRwTzF4eVhHNGdJQ0FnSUNBZ0lIMWNjbHh1WEhKY2JpQWdJQ0FnSUNBZ2NHOXpJRDBnZEdocGN5NWZZMkZzWTNWc1lYUmxRV3hwWjI1bFpFTnZiM0prY3lod2IzTXVlQ3dnY0c5ekxua3BPMXh5WEc1Y2NseHVJQ0FnSUNBZ0lDQjBhR2x6TGw5d0xuUmxlSFJCYkdsbmJpaDBhR2x6TGw5d0xreEZSbFFzSUhSb2FYTXVYM0F1UWtGVFJVeEpUa1VwTzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WDNBdWRHVjRkRVp2Ym5Rb2RHaHBjeTVmWm05dWRDazdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjQzUwWlhoMFUybDZaU2gwYUdsekxsOW1iMjUwVTJsNlpTazdYSEpjYmlBZ0lDQWdJQ0FnZEdocGN5NWZjQzUwWlhoMEtIUm9hWE11WDNSbGVIUXNJSEJ2Y3k1NExDQndiM011ZVNrN1hISmNibHh5WEc0Z0lDQWdJQ0FnSUdsbUlDaGtjbUYzUW05MWJtUnpLU0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFJvYVhNdVgzQXVjM1J5YjJ0bEtESXdNQ2s3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCaWIzVnVaSE5ZSUQwZ2NHOXpMbmdnS3lCMGFHbHpMbDlpYjNWdVpITlBabVp6WlhRdWVEdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR0p2ZFc1a2Mxa2dQU0J3YjNNdWVTQXJJSFJvYVhNdVgySnZkVzVrYzA5bVpuTmxkQzU1TzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsekxsOXdMbTV2Um1sc2JDZ3BPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBhR2x6TGw5d0xuSmxZM1FvWW05MWJtUnpXQ3dnWW05MWJtUnpXU3dnZEdocGN5NTNhV1IwYUN3Z2RHaHBjeTVvWldsbmFIUXBPeUFnSUNBZ0lDQWdJQ0FnSUZ4eVhHNGdJQ0FnSUNBZ0lIMWNjbHh1WEhKY2JpQWdJQ0IwYUdsekxsOXdMbkJ2Y0NncE8xeHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUZCeWIycGxZM1FnZEdobElHTnZiM0prYVc1aGRHVnpJQ2g0TENCNUtTQnBiblJ2SUdFZ2NtOTBZWFJsWkNCamIyOXlaR2x1WVhSbElITjVjM1JsYlZ4eVhHNGdLaUJBY0hKcGRtRjBaVnh5WEc0Z0tpQkFjR0Z5WVcwZ2UyNTFiV0psY24wZ2VDQXRJRmdnWTI5dmNtUnBibUYwWlNBb2FXNGdkVzV5YjNSaGRHVmtJSE53WVdObEtWeHlYRzRnS2lCQWNHRnlZVzBnZTI1MWJXSmxjbjBnZVNBdElGa2dZMjl2Y21ScGJtRjBaU0FvYVc0Z2RXNXliM1JoZEdWa0lITndZV05sS1Z4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdZVzVuYkdVZ0xTQlNZV1JwWVc1eklHOW1JSEp2ZEdGMGFXOXVJSFJ2SUdGd2NHeDVYSEpjYmlBcUlFQnlaWFIxY200Z2UyOWlhbVZqZEgwZ1QySnFaV04wSUhkcGRHZ2dlQ0FtSUhrZ2NISnZjR1Z5ZEdsbGMxeHlYRzRnS2k5Y2NseHVRbUp2ZUVGc2FXZHVaV1JVWlhoMExuQnliM1J2ZEhsd1pTNWZZMkZzWTNWc1lYUmxVbTkwWVhSbFpFTnZiM0prY3lBOUlHWjFibU4wYVc5dUlDaDRMQ0I1TENCaGJtZHNaU2tnZXlBZ1hISmNiaUFnSUNCMllYSWdjbmdnUFNCTllYUm9MbU52Y3loaGJtZHNaU2tnS2lCNElDc2dUV0YwYUM1amIzTW9UV0YwYUM1UVNTQXZJRElnTFNCaGJtZHNaU2tnS2lCNU8xeHlYRzRnSUNBZ2RtRnlJSEo1SUQwZ0xVMWhkR2d1YzJsdUtHRnVaMnhsS1NBcUlIZ2dLeUJOWVhSb0xuTnBiaWhOWVhSb0xsQkpJQzhnTWlBdElHRnVaMnhsS1NBcUlIazdYSEpjYmlBZ0lDQnlaWFIxY200Z2UzZzZJSEo0TENCNU9pQnllWDA3WEhKY2JuMDdYSEpjYmx4eVhHNHZLaXBjY2x4dUlDb2dRMkZzWTNWc1lYUmxjeUJrY21GM0lHTnZiM0prYVc1aGRHVnpJR1p2Y2lCMGFHVWdkR1Y0ZEN3Z1lXeHBaMjVwYm1jZ1ltRnpaV1FnYjI0Z2RHaGxJR0p2ZFc1a2FXNW5JR0p2ZUM1Y2NseHVJQ29nVkdobElIUmxlSFFnYVhNZ1pYWmxiblIxWVd4c2VTQmtjbUYzYmlCM2FYUm9JR05oYm5aaGN5QmhiR2xuYm0xbGJuUWdjMlYwSUhSdklHeGxablFnSmlCaVlYTmxiR2x1WlN3Z2MyOWNjbHh1SUNvZ2RHaHBjeUJtZFc1amRHbHZiaUIwWVd0bGN5QmhJR1JsYzJseVpXUWdjRzl6SUNZZ1lXeHBaMjV0Wlc1MElHRnVaQ0J5WlhSMWNtNXpJSFJvWlNCaGNIQnliM0J5YVdGMFpWeHlYRzRnS2lCamIyOXlaR2x1WVhSbGN5Qm1iM0lnZEdobElHeGxablFnSmlCaVlYTmxiR2x1WlM1Y2NseHVJQ29nUUhCeWFYWmhkR1ZjY2x4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlIZ2dMU0JZSUdOdmIzSmthVzVoZEdWY2NseHVJQ29nUUhCaGNtRnRJSHR1ZFcxaVpYSjlJSGtnTFNCWklHTnZiM0prYVc1aGRHVmNjbHh1SUNvZ1FISmxkSFZ5YmlCN2IySnFaV04wZlNCUFltcGxZM1FnZDJsMGFDQjRJQ1lnZVNCd2NtOXdaWEowYVdWelhISmNiaUFxTDF4eVhHNUNZbTk0UVd4cFoyNWxaRlJsZUhRdWNISnZkRzkwZVhCbExsOWpZV3hqZFd4aGRHVkJiR2xuYm1Wa1EyOXZjbVJ6SUQwZ1puVnVZM1JwYjI0b2VDd2dlU2tnZTF4eVhHNGdJQ0FnZG1GeUlHNWxkMWdzSUc1bGQxazdYSEpjYmlBZ0lDQnpkMmwwWTJnZ0tIUm9hWE11WDJoQmJHbG5iaWtnZTF4eVhHNGdJQ0FnSUNBZ0lHTmhjMlVnUW1KdmVFRnNhV2R1WldSVVpYaDBMa0ZNU1VkT0xrSlBXRjlNUlVaVU9seHlYRzRnSUNBZ0lDQWdJQ0FnSUNCdVpYZFlJRDBnZUR0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWW5KbFlXczdYSEpjYmlBZ0lDQWdJQ0FnWTJGelpTQkNZbTk0UVd4cFoyNWxaRlJsZUhRdVFVeEpSMDR1UWs5WVgwTkZUbFJGVWpwY2NseHVJQ0FnSUNBZ0lDQWdJQ0FnYm1WM1dDQTlJSGdnTFNCMGFHbHpMbWhoYkdaWGFXUjBhRHRjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdZbkpsWVdzN1hISmNiaUFnSUNBZ0lDQWdZMkZ6WlNCQ1ltOTRRV3hwWjI1bFpGUmxlSFF1UVV4SlIwNHVRazlZWDFKSlIwaFVPbHh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQnVaWGRZSUQwZ2VDQXRJSFJvYVhNdWQybGtkR2c3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR0p5WldGck8xeHlYRzRnSUNBZ0lDQWdJR1JsWm1GMWJIUTZYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHNWxkMWdnUFNCNE8xeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCamIyNXpiMnhsTG14dlp5aGNJbFZ1Y21WamIyZHVhWHBsWkNCb2IzSnBlbTl1WVd3Z1lXeHBaMjQ2WENJc0lIUm9hWE11WDJoQmJHbG5iaWs3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJR0p5WldGck8xeHlYRzRnSUNBZ2ZWeHlYRzRnSUNBZ2MzZHBkR05vSUNoMGFHbHpMbDkyUVd4cFoyNHBJSHRjY2x4dUlDQWdJQ0FnSUNCallYTmxJRUppYjNoQmJHbG5ibVZrVkdWNGRDNUNRVk5GVEVsT1JTNUNUMWhmVkU5UU9seHlYRzRnSUNBZ0lDQWdJQ0FnSUNCdVpYZFpJRDBnZVNBdElIUm9hWE11WDJKdmRXNWtjMDltWm5ObGRDNTVPMXh5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmljbVZoYXp0Y2NseHVJQ0FnSUNBZ0lDQmpZWE5sSUVKaWIzaEJiR2xuYm1Wa1ZHVjRkQzVDUVZORlRFbE9SUzVDVDFoZlEwVk9WRVZTT2x4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0J1WlhkWklEMGdlU0FySUhSb2FYTXVYMlJwYzNSQ1lYTmxWRzlOYVdRN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUdKeVpXRnJPMXh5WEc0Z0lDQWdJQ0FnSUdOaGMyVWdRbUp2ZUVGc2FXZHVaV1JVWlhoMExrSkJVMFZNU1U1RkxrSlBXRjlDVDFSVVQwMDZYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHNWxkMWtnUFNCNUlDMGdkR2hwY3k1ZlpHbHpkRUpoYzJWVWIwSnZkSFJ2YlR0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWW5KbFlXczdYSEpjYmlBZ0lDQWdJQ0FnWTJGelpTQkNZbTk0UVd4cFoyNWxaRlJsZUhRdVFrRlRSVXhKVGtVdVJrOU9WRjlEUlU1VVJWSTZYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJRWhsYVdkb2RDQnBjeUJoY0hCeWIzaHBiV0YwWldRZ1lYTWdZWE5qWlc1MElDc2daR1Z6WTJWdWRGeHlYRzRnSUNBZ0lDQWdJQ0FnSUNCdVpYZFpJRDBnZVNBdElIUm9hWE11WDJSbGMyTmxiblFnS3lBb2RHaHBjeTVmWVhOalpXNTBJQ3NnZEdocGN5NWZaR1Z6WTJWdWRDa2dMeUF5TzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JpY21WaGF6dGNjbHh1SUNBZ0lDQWdJQ0JqWVhObElFSmliM2hCYkdsbmJtVmtWR1Y0ZEM1Q1FWTkZURWxPUlM1QlRGQklRVUpGVkVsRE9seHlYRzRnSUNBZ0lDQWdJQ0FnSUNCdVpYZFpJRDBnZVR0Y2NseHVJQ0FnSUNBZ0lDQWdJQ0FnWW5KbFlXczdYSEpjYmlBZ0lDQWdJQ0FnWkdWbVlYVnNkRHBjY2x4dUlDQWdJQ0FnSUNBZ0lDQWdibVYzV1NBOUlIazdYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibk52YkdVdWJHOW5LRndpVlc1eVpXTnZaMjVwZW1Wa0lIWmxjblJwWTJGc0lHRnNhV2R1T2x3aUxDQjBhR2x6TGw5MlFXeHBaMjRwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdJQ0JpY21WaGF6dGNjbHh1SUNBZ0lIMWNjbHh1SUNBZ0lISmxkSFZ5YmlCN2VEb2dibVYzV0N3Z2VUb2dibVYzV1gwN1hISmNibjA3WEhKY2JseHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFTmhiR04xYkdGMFpYTWdZbTkxYm1ScGJtY2dZbTk0SUdGdVpDQjJZWEpwYjNWeklHMWxkSEpwWTNNZ1ptOXlJSFJvWlNCamRYSnlaVzUwSUhSbGVIUWdZVzVrSUdadmJuUmNjbHh1SUNvZ1FIQnlhWFpoZEdWY2NseHVJQ292WEhKY2JrSmliM2hCYkdsbmJtVmtWR1Y0ZEM1d2NtOTBiM1I1Y0dVdVgyTmhiR04xYkdGMFpVMWxkSEpwWTNNZ1BTQm1kVzVqZEdsdmJpaHphRzkxYkdSVmNHUmhkR1ZJWldsbmFIUXBJSHNnSUZ4eVhHNGdJQ0FnTHk4Z2NEVWdNQzQxTGpBZ2FHRnpJR0VnWW5WbklDMGdkR1Y0ZENCaWIzVnVaSE1nWVhKbElHTnNhWEJ3WldRZ1lua2dLREFzSURBcFhISmNiaUFnSUNBdkx5QkRZV3hqZFd4aGRHbHVaeUJpYjNWdVpITWdhR0ZqYTF4eVhHNGdJQ0FnZG1GeUlHSnZkVzVrY3lBOUlIUm9hWE11WDJadmJuUXVkR1Y0ZEVKdmRXNWtjeWgwYUdsekxsOTBaWGgwTENBeE1EQXdMQ0F4TURBd0xDQjBhR2x6TGw5bWIyNTBVMmw2WlNrN1hISmNiaUFnSUNBdkx5QkNiM1Z1WkhNZ2FYTWdZU0J5WldabGNtVnVZMlVnTFNCcFppQjNaU0J0WlhOeklIZHBkR2dnYVhRZ1pHbHlaV04wYkhrc0lIZGxJR05oYmlCdFpYTnpJSFZ3SUZ4eVhHNGdJQ0FnTHk4Z1puVjBkWEpsSUhaaGJIVmxjeUVnS0VsMElHTm9ZVzVuWlhNZ2RHaGxJR0ppYjNnZ1kyRmphR1VnYVc0Z2NEVXVLVnh5WEc0Z0lDQWdZbTkxYm1SeklEMGdleUJjY2x4dUlDQWdJQ0FnSUNCNE9pQmliM1Z1WkhNdWVDQXRJREV3TURBc0lGeHlYRzRnSUNBZ0lDQWdJSGs2SUdKdmRXNWtjeTU1SUMwZ01UQXdNQ3dnWEhKY2JpQWdJQ0FnSUNBZ2R6b2dZbTkxYm1SekxuY3NJRnh5WEc0Z0lDQWdJQ0FnSUdnNklHSnZkVzVrY3k1b0lGeHlYRzRnSUNBZ2ZUc2dYSEpjYmx4eVhHNGdJQ0FnYVdZZ0tITm9iM1ZzWkZWd1pHRjBaVWhsYVdkb2RDa2dlMXh5WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYMkZ6WTJWdWRDQTlJSFJvYVhNdVgyWnZiblF1WDNSbGVIUkJjMk5sYm5Rb2RHaHBjeTVmWm05dWRGTnBlbVVwTzF4eVhHNGdJQ0FnSUNBZ0lIUm9hWE11WDJSbGMyTmxiblFnUFNCMGFHbHpMbDltYjI1MExsOTBaWGgwUkdWelkyVnVkQ2gwYUdsekxsOW1iMjUwVTJsNlpTazdYSEpjYmlBZ0lDQjlYSEpjYmx4eVhHNGdJQ0FnTHk4Z1ZYTmxJR0p2ZFc1a2N5QjBieUJqWVd4amRXeGhkR1VnWm05dWRDQnRaWFJ5YVdOelhISmNiaUFnSUNCMGFHbHpMbmRwWkhSb0lEMGdZbTkxYm1SekxuYzdYSEpjYmlBZ0lDQjBhR2x6TG1obGFXZG9kQ0E5SUdKdmRXNWtjeTVvTzF4eVhHNGdJQ0FnZEdocGN5NW9ZV3htVjJsa2RHZ2dQU0IwYUdsekxuZHBaSFJvSUM4Z01qdGNjbHh1SUNBZ0lIUm9hWE11YUdGc1praGxhV2RvZENBOUlIUm9hWE11YUdWcFoyaDBJQzhnTWp0Y2NseHVJQ0FnSUhSb2FYTXVYMkp2ZFc1a2MwOW1abk5sZENBOUlIc2dlRG9nWW05MWJtUnpMbmdzSUhrNklHSnZkVzVrY3k1NUlIMDdYSEpjYmlBZ0lDQjBhR2x6TGw5a2FYTjBRbUZ6WlZSdlRXbGtJRDBnVFdGMGFDNWhZbk1vWW05MWJtUnpMbmtwSUMwZ2RHaHBjeTVvWVd4bVNHVnBaMmgwTzF4eVhHNGdJQ0FnZEdocGN5NWZaR2x6ZEVKaGMyVlViMEp2ZEhSdmJTQTlJSFJvYVhNdWFHVnBaMmgwSUMwZ1RXRjBhQzVoWW5Nb1ltOTFibVJ6TG5rcE8xeHlYRzU5T3lJc0ltVjRjRzl5ZEhNdVpHVm1ZWFZzZENBOUlHWjFibU4wYVc5dUtIWmhiSFZsTENCa1pXWmhkV3gwVm1Gc2RXVXBJSHRjY2x4dUlDQWdJSEpsZEhWeWJpQW9kbUZzZFdVZ0lUMDlJSFZ1WkdWbWFXNWxaQ2tnUHlCMllXeDFaU0E2SUdSbFptRjFiSFJXWVd4MVpUdGNjbHh1ZlRzaUxDSnRiMlIxYkdVdVpYaHdiM0owY3lBOUlFaHZkbVZ5VTJ4cFpHVnphRzkzY3p0Y2NseHVYSEpjYm5aaGNpQjFkR2xzYVhScFpYTWdQU0J5WlhGMWFYSmxLRndpTGk5MWRHbHNhWFJwWlhNdWFuTmNJaWs3WEhKY2JseHlYRzVtZFc1amRHbHZiaUJJYjNabGNsTnNhV1JsYzJodmQzTW9jMnhwWkdWemFHOTNSR1ZzWVhrc0lIUnlZVzV6YVhScGIyNUVkWEpoZEdsdmJpa2dlMXh5WEc0Z0lIUm9hWE11WDNOc2FXUmxjMmh2ZDBSbGJHRjVJRDBnYzJ4cFpHVnphRzkzUkdWc1lYa2dJVDA5SUhWdVpHVm1hVzVsWkNBL0lITnNhV1JsYzJodmQwUmxiR0Y1SURvZ01qQXdNRHRjY2x4dUlDQjBhR2x6TGw5MGNtRnVjMmwwYVc5dVJIVnlZWFJwYjI0Z1BTQjBjbUZ1YzJsMGFXOXVSSFZ5WVhScGIyNGdJVDA5SUhWdVpHVm1hVzVsWkNBL0lIUnlZVzV6YVhScGIyNUVkWEpoZEdsdmJpQTZJREV3TURBN1hISmNibHh5WEc0Z0lIUm9hWE11WDNOc2FXUmxjMmh2ZDNNZ1BTQmJYVHRjY2x4dUlDQjBhR2x6TG5KbGJHOWhaQ2dwTzF4eVhHNTlYSEpjYmx4eVhHNUliM1psY2xOc2FXUmxjMmh2ZDNNdWNISnZkRzkwZVhCbExuSmxiRzloWkNBOUlHWjFibU4wYVc5dUtDa2dlMXh5WEc0Z0lDOHZJRTV2ZEdVNklIUm9hWE1nYVhNZ1kzVnljbVZ1ZEd4NUlHNXZkQ0J5WldGc2JIa2dZbVZwYm1jZ2RYTmxaQzRnVjJobGJpQmhJSEJoWjJVZ2FYTWdiRzloWkdWa0xGeHlYRzRnSUM4dklHMWhhVzR1YW5NZ2FYTWdhblZ6ZENCeVpTMXBibk4wWVc1amFXNW5JSFJvWlNCSWIzWmxjbE5zYVdSbGMyaHZkM05jY2x4dUlDQjJZWElnYjJ4a1UyeHBaR1Z6YUc5M2N5QTlJSFJvYVhNdVgzTnNhV1JsYzJodmQzTWdmSHdnVzEwN1hISmNiaUFnZEdocGN5NWZjMnhwWkdWemFHOTNjeUE5SUZ0ZE8xeHlYRzRnSUNRb1hDSXVhRzkyWlhJdGMyeHBaR1Z6YUc5M1hDSXBMbVZoWTJnb1hISmNiaUFnSUNCbWRXNWpkR2x2YmloZkxDQmxiR1Z0Wlc1MEtTQjdYSEpjYmlBZ0lDQWdJSFpoY2lBa1pXeGxiV1Z1ZENBOUlDUW9aV3hsYldWdWRDazdYSEpjYmlBZ0lDQWdJSFpoY2lCcGJtUmxlQ0E5SUhSb2FYTXVYMlpwYm1SSmJsTnNhV1JsYzJodmQzTW9aV3hsYldWdWRDd2diMnhrVTJ4cFpHVnphRzkzY3lrN1hISmNiaUFnSUNBZ0lHbG1JQ2hwYm1SbGVDQWhQVDBnTFRFcElIdGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ2MyeHBaR1Z6YUc5M0lEMGdiMnhrVTJ4cFpHVnphRzkzY3k1emNHeHBZMlVvYVc1a1pYZ3NJREVwV3pCZE8xeHlYRzRnSUNBZ0lDQWdJSFJvYVhNdVgzTnNhV1JsYzJodmQzTXVjSFZ6YUNoemJHbGtaWE5vYjNjcE8xeHlYRzRnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHlYRzRnSUNBZ0lDQWdJSFJvYVhNdVgzTnNhV1JsYzJodmQzTXVjSFZ6YUNoY2NseHVJQ0FnSUNBZ0lDQWdJRzVsZHlCVGJHbGtaWE5vYjNjb0pHVnNaVzFsYm5Rc0lIUm9hWE11WDNOc2FXUmxjMmh2ZDBSbGJHRjVMQ0IwYUdsekxsOTBjbUZ1YzJsMGFXOXVSSFZ5WVhScGIyNHBYSEpjYmlBZ0lDQWdJQ0FnS1R0Y2NseHVJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ2ZTNWlhVzVrS0hSb2FYTXBYSEpjYmlBZ0tUdGNjbHh1ZlR0Y2NseHVYSEpjYmtodmRtVnlVMnhwWkdWemFHOTNjeTV3Y205MGIzUjVjR1V1WDJacGJtUkpibE5zYVdSbGMyaHZkM01nUFNCbWRXNWpkR2x2YmlobGJHVnRaVzUwTENCemJHbGtaWE5vYjNkektTQjdYSEpjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQnpiR2xrWlhOb2IzZHpMbXhsYm1kMGFEc2dhU0FyUFNBeEtTQjdYSEpjYmlBZ0lDQnBaaUFvWld4bGJXVnVkQ0E5UFQwZ2MyeHBaR1Z6YUc5M2MxdHBYUzVuWlhSRmJHVnRaVzUwS0NrcElIdGNjbHh1SUNBZ0lDQWdjbVYwZFhKdUlHazdYSEpjYmlBZ0lDQjlYSEpjYmlBZ2ZWeHlYRzRnSUhKbGRIVnliaUF0TVR0Y2NseHVmVHRjY2x4dVhISmNibVoxYm1OMGFXOXVJRk5zYVdSbGMyaHZkeWdrWTI5dWRHRnBibVZ5TENCemJHbGtaWE5vYjNkRVpXeGhlU3dnZEhKaGJuTnBkR2x2YmtSMWNtRjBhVzl1S1NCN1hISmNiaUFnZEdocGN5NWZKR052Ym5SaGFXNWxjaUE5SUNSamIyNTBZV2x1WlhJN1hISmNiaUFnZEdocGN5NWZjMnhwWkdWemFHOTNSR1ZzWVhrZ1BTQnpiR2xrWlhOb2IzZEVaV3hoZVR0Y2NseHVJQ0IwYUdsekxsOTBjbUZ1YzJsMGFXOXVSSFZ5WVhScGIyNGdQU0IwY21GdWMybDBhVzl1UkhWeVlYUnBiMjQ3WEhKY2JpQWdkR2hwY3k1ZmRHbHRaVzkxZEVsa0lEMGdiblZzYkR0Y2NseHVJQ0IwYUdsekxsOXBiV0ZuWlVsdVpHVjRJRDBnTUR0Y2NseHVJQ0IwYUdsekxsOGthVzFoWjJWeklEMGdXMTA3WEhKY2JseHlYRzRnSUM4dklGTmxkQ0IxY0NCaGJtUWdZMkZqYUdVZ2NtVm1aWEpsYm1ObGN5QjBieUJwYldGblpYTmNjbHh1SUNCMGFHbHpMbDhrWTI5dWRHRnBibVZ5TG1acGJtUW9YQ0pwYldkY0lpa3VaV0ZqYUNoY2NseHVJQ0FnSUdaMWJtTjBhVzl1S0dsdVpHVjRMQ0JsYkdWdFpXNTBLU0I3WEhKY2JpQWdJQ0FnSUhaaGNpQWthVzFoWjJVZ1BTQWtLR1ZzWlcxbGJuUXBPMXh5WEc0Z0lDQWdJQ0FrYVcxaFoyVXVZM056S0h0Y2NseHVJQ0FnSUNBZ0lDQndiM05wZEdsdmJqb2dYQ0poWW5OdmJIVjBaVndpTEZ4eVhHNGdJQ0FnSUNBZ0lIUnZjRG9nWENJd1hDSXNYSEpjYmlBZ0lDQWdJQ0FnYkdWbWREb2dYQ0l3WENJc1hISmNiaUFnSUNBZ0lDQWdla2x1WkdWNE9pQnBibVJsZUNBOVBUMGdNQ0EvSURJZ09pQXdJQzh2SUVacGNuTjBJR2x0WVdkbElITm9iM1ZzWkNCaVpTQnZiaUIwYjNCY2NseHVJQ0FnSUNBZ2ZTazdYSEpjYmlBZ0lDQWdJSFJvYVhNdVh5UnBiV0ZuWlhNdWNIVnphQ2drYVcxaFoyVXBPMXh5WEc0Z0lDQWdmUzVpYVc1a0tIUm9hWE1wWEhKY2JpQWdLVHRjY2x4dVhISmNiaUFnTHk4Z1JHVjBaWEp0YVc1bElIZG9aWFJvWlhJZ2RHOGdZbWx1WkNCcGJuUmxjbUZqZEdsMmFYUjVYSEpjYmlBZ2RHaHBjeTVmYm5WdFNXMWhaMlZ6SUQwZ2RHaHBjeTVmSkdsdFlXZGxjeTVzWlc1bmRHZzdYSEpjYmlBZ2FXWWdLSFJvYVhNdVgyNTFiVWx0WVdkbGN5QThQU0F4S1NCeVpYUjFjbTQ3WEhKY2JseHlYRzRnSUM4dklFSnBibVFnWlhabGJuUWdiR2x6ZEdWdVpYSnpYSEpjYmlBZ2RHaHBjeTVmSkdOdmJuUmhhVzVsY2k1dmJpaGNJbTF2ZFhObFpXNTBaWEpjSWl3Z2RHaHBjeTVmYjI1RmJuUmxjaTVpYVc1a0tIUm9hWE1wS1R0Y2NseHVJQ0IwYUdsekxsOGtZMjl1ZEdGcGJtVnlMbTl1S0Z3aWJXOTFjMlZzWldGMlpWd2lMQ0IwYUdsekxsOXZia3hsWVhabExtSnBibVFvZEdocGN5a3BPMXh5WEc1OVhISmNibHh5WEc1VGJHbGtaWE5vYjNjdWNISnZkRzkwZVhCbExtZGxkRVZzWlcxbGJuUWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0J5WlhSMWNtNGdkR2hwY3k1ZkpHTnZiblJoYVc1bGNpNW5aWFFvTUNrN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2N1Y0hKdmRHOTBlWEJsTG1kbGRDUkZiR1Z0Wlc1MElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdjbVYwZFhKdUlIUm9hWE11WHlSamIyNTBZV2x1WlhJN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2N1Y0hKdmRHOTBlWEJsTGw5dmJrVnVkR1Z5SUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ0x5OGdSbWx5YzNRZ2RISmhibk5wZEdsdmJpQnphRzkxYkdRZ2FHRndjR1Z1SUhCeVpYUjBlU0J6YjI5dUlHRm1kR1Z5SUdodmRtVnlhVzVuSUdsdUlHOXlaR1Z5WEhKY2JpQWdMeThnZEc4Z1kyeDFaU0IwYUdVZ2RYTmxjaUJwYm5SdklIZG9ZWFFnYVhNZ2FHRndjR1Z1YVc1blhISmNiaUFnZEdocGN5NWZkR2x0Wlc5MWRFbGtJRDBnYzJWMFZHbHRaVzkxZENoMGFHbHpMbDloWkhaaGJtTmxVMnhwWkdWemFHOTNMbUpwYm1Rb2RHaHBjeWtzSURVd01DazdYSEpjYm4wN1hISmNibHh5WEc1VGJHbGtaWE5vYjNjdWNISnZkRzkwZVhCbExsOXZia3hsWVhabElEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdZMnhsWVhKSmJuUmxjblpoYkNoMGFHbHpMbDkwYVcxbGIzVjBTV1FwTzF4eVhHNGdJSFJvYVhNdVgzUnBiV1Z2ZFhSSlpDQTlJRzUxYkd3N1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2N1Y0hKdmRHOTBlWEJsTGw5aFpIWmhibU5sVTJ4cFpHVnphRzkzSUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2RHaHBjeTVmYVcxaFoyVkpibVJsZUNBclBTQXhPMXh5WEc0Z0lIWmhjaUJwTzF4eVhHNWNjbHh1SUNBdkx5Qk5iM1psSUhSb1pTQnBiV0ZuWlNCbWNtOXRJRElnYzNSbGNITWdZV2R2SUdSdmQyNGdkRzhnZEdobElHSnZkSFJ2YlNCNkxXbHVaR1Y0SUdGdVpDQnRZV3RsWEhKY2JpQWdMeThnYVhRZ2FXNTJhWE5wWW14bFhISmNiaUFnYVdZZ0tIUm9hWE11WDI1MWJVbHRZV2RsY3lBK1BTQXpLU0I3WEhKY2JpQWdJQ0JwSUQwZ2RYUnBiR2wwYVdWekxuZHlZWEJKYm1SbGVDaDBhR2x6TGw5cGJXRm5aVWx1WkdWNElDMGdNaXdnZEdocGN5NWZiblZ0U1cxaFoyVnpLVHRjY2x4dUlDQWdJSFJvYVhNdVh5UnBiV0ZuWlhOYmFWMHVZM056S0h0Y2NseHVJQ0FnSUNBZ2VrbHVaR1Y0T2lBd0xGeHlYRzRnSUNBZ0lDQnZjR0ZqYVhSNU9pQXdYSEpjYmlBZ0lDQjlLVHRjY2x4dUlDQWdJSFJvYVhNdVh5UnBiV0ZuWlhOYmFWMHVkbVZzYjJOcGRIa29YQ0p6ZEc5d1hDSXBPMXh5WEc0Z0lIMWNjbHh1WEhKY2JpQWdMeThnVFc5MlpTQjBhR1VnYVcxaFoyVWdabkp2YlNBeElITjBaWEJ6SUdGbmJ5QmtiM2R1SUhSdklIUm9aU0J0YVdSa2JHVWdlaTFwYm1SbGVDQmhibVFnYldGclpWeHlYRzRnSUM4dklHbDBJR052YlhCc1pYUmxiSGtnZG1semFXSnNaVnh5WEc0Z0lHbG1JQ2gwYUdsekxsOXVkVzFKYldGblpYTWdQajBnTWlrZ2UxeHlYRzRnSUNBZ2FTQTlJSFYwYVd4cGRHbGxjeTUzY21Gd1NXNWtaWGdvZEdocGN5NWZhVzFoWjJWSmJtUmxlQ0F0SURFc0lIUm9hWE11WDI1MWJVbHRZV2RsY3lrN1hISmNiaUFnSUNCMGFHbHpMbDhrYVcxaFoyVnpXMmxkTG1OemN5aDdYSEpjYmlBZ0lDQWdJSHBKYm1SbGVEb2dNU3hjY2x4dUlDQWdJQ0FnYjNCaFkybDBlVG9nTVZ4eVhHNGdJQ0FnZlNrN1hISmNiaUFnSUNCMGFHbHpMbDhrYVcxaFoyVnpXMmxkTG5abGJHOWphWFI1S0Z3aWMzUnZjRndpS1R0Y2NseHVJQ0I5WEhKY2JseHlYRzRnSUM4dklFMXZkbVVnZEdobElHTjFjbkpsYm5RZ2FXMWhaMlVnZEc4Z2RHaGxJSFJ2Y0NCNkxXbHVaR1Y0SUdGdVpDQm1ZV1JsSUdsMElHbHVYSEpjYmlBZ2RHaHBjeTVmYVcxaFoyVkpibVJsZUNBOUlIVjBhV3hwZEdsbGN5NTNjbUZ3U1c1a1pYZ29kR2hwY3k1ZmFXMWhaMlZKYm1SbGVDd2dkR2hwY3k1ZmJuVnRTVzFoWjJWektUdGNjbHh1SUNCMGFHbHpMbDhrYVcxaFoyVnpXM1JvYVhNdVgybHRZV2RsU1c1a1pYaGRMbU56Y3loN1hISmNiaUFnSUNCNlNXNWtaWGc2SURJc1hISmNiaUFnSUNCdmNHRmphWFI1T2lBd1hISmNiaUFnZlNrN1hISmNiaUFnZEdocGN5NWZKR2x0WVdkbGMxdDBhR2x6TGw5cGJXRm5aVWx1WkdWNFhTNTJaV3h2WTJsMGVTaGNjbHh1SUNBZ0lIdGNjbHh1SUNBZ0lDQWdiM0JoWTJsMGVUb2dNVnh5WEc0Z0lDQWdmU3hjY2x4dUlDQWdJSFJvYVhNdVgzUnlZVzV6YVhScGIyNUVkWEpoZEdsdmJpeGNjbHh1SUNBZ0lGd2laV0Z6WlVsdVQzVjBVWFZoWkZ3aVhISmNiaUFnS1R0Y2NseHVYSEpjYmlBZ0x5OGdVMk5vWldSMWJHVWdibVY0ZENCMGNtRnVjMmwwYVc5dVhISmNiaUFnZEdocGN5NWZkR2x0Wlc5MWRFbGtJRDBnYzJWMFZHbHRaVzkxZENoMGFHbHpMbDloWkhaaGJtTmxVMnhwWkdWemFHOTNMbUpwYm1Rb2RHaHBjeWtzSUhSb2FYTXVYM05zYVdSbGMyaHZkMFJsYkdGNUtUdGNjbHh1ZlR0Y2NseHVJaXdpYlc5a2RXeGxMbVY0Y0c5eWRITWdQU0JDWVhObFRHOW5iMU5yWlhSamFEdGNjbHh1WEhKY2JuWmhjaUIxZEdsc2N5QTlJSEpsY1hWcGNtVW9YQ0l1TGk5MWRHbHNhWFJwWlhNdWFuTmNJaWs3WEhKY2JseHlYRzVtZFc1amRHbHZiaUJDWVhObFRHOW5iMU5yWlhSamFDZ2tibUYyTENBa2JtRjJURzluYnl3Z1ptOXVkRkJoZEdncElIdGNjbHh1SUNCMGFHbHpMbDhrYm1GMklEMGdKRzVoZGp0Y2NseHVJQ0IwYUdsekxsOGtibUYyVEc5bmJ5QTlJQ1J1WVhaTWIyZHZPMXh5WEc0Z0lIUm9hWE11WDJadmJuUlFZWFJvSUQwZ1ptOXVkRkJoZEdnN1hISmNibHh5WEc0Z0lIUm9hWE11WDNSbGVIUWdQU0IwYUdsekxsOGtibUYyVEc5bmJ5NTBaWGgwS0NrN1hISmNiaUFnZEdocGN5NWZhWE5HYVhKemRFWnlZVzFsSUQwZ2RISjFaVHRjY2x4dUlDQjBhR2x6TGw5cGMwMXZkWE5sVDNabGNpQTlJR1poYkhObE8xeHlYRzRnSUhSb2FYTXVYMmx6VDNabGNrNWhka3h2WjI4Z1BTQm1ZV3h6WlR0Y2NseHVYSEpjYmlBZ2RHaHBjeTVmZFhCa1lYUmxWR1Y0ZEU5bVpuTmxkQ2dwTzF4eVhHNGdJSFJvYVhNdVgzVndaR0YwWlZOcGVtVW9LVHRjY2x4dUlDQjBhR2x6TGw5MWNHUmhkR1ZHYjI1MFUybDZaU2dwTzF4eVhHNWNjbHh1SUNBdkx5QkRjbVZoZEdVZ1lTQW9jbVZzWVhScGRtVWdjRzl6YVhScGIyNWxaQ2tnWTI5dWRHRnBibVZ5SUdadmNpQjBhR1VnYzJ0bGRHTm9JR2x1YzJsa1pTQnZaaUIwYUdWY2NseHVJQ0F2THlCdVlYWXNJR0oxZENCdFlXdGxJSE4xY21VZ2RHaGhkQ0JwZENCcGN5QkNSVWhKVGtRZ1pYWmxjbmwwYUdsdVp5QmxiSE5sTGlCRmRtVnVkSFZoYkd4NUxDQjNaU0IzYVd4c1hISmNiaUFnTHk4Z1pISnZjQ0JxZFhOMElIUm9aU0J1WVhZZ2JHOW5ieUFvYm05MElIUm9aU0J1WVhZZ2JHbHVhM01oS1NCaVpXaHBibVFnZEdobElHTmhiblpoY3k1Y2NseHVJQ0IwYUdsekxsOGtZMjl1ZEdGcGJtVnlJRDBnSkNoY0lqeGthWFkrWENJcFhISmNiaUFnSUNBdVkzTnpLSHRjY2x4dUlDQWdJQ0FnY0c5emFYUnBiMjQ2SUZ3aVlXSnpiMngxZEdWY0lpeGNjbHh1SUNBZ0lDQWdkRzl3T2lCY0lqQndlRndpTEZ4eVhHNGdJQ0FnSUNCc1pXWjBPaUJjSWpCd2VGd2lYSEpjYmlBZ0lDQjlLVnh5WEc0Z0lDQWdMbkJ5WlhCbGJtUlVieWgwYUdsekxsOGtibUYyS1Z4eVhHNGdJQ0FnTG1ocFpHVW9LVHRjY2x4dVhISmNiaUFnZEdocGN5NWZZM0psWVhSbFVEVkpibk4wWVc1alpTZ3BPMXh5WEc1OVhISmNibHh5WEc0dktpcGNjbHh1SUNvZ1EzSmxZWFJsSUdFZ2JtVjNJSEExSUdsdWMzUmhibU5sSUdGdVpDQmlhVzVrSUhSb1pTQmhjSEJ5YjNCeWFXRjBaU0JqYkdGemN5QnRaWFJvYjJSeklIUnZJSFJvWlZ4eVhHNGdLaUJwYm5OMFlXNWpaUzRnVkdocGN5QmhiSE52SUdacGJHeHpJR2x1SUhSb1pTQndJSEJoY21GdFpYUmxjaUJ2YmlCMGFHVWdZMnhoYzNNZ2JXVjBhRzlrY3lBb2MyVjBkWEFzWEhKY2JpQXFJR1J5WVhjc0lHVjBZeTRwSUhOdklIUm9ZWFFnZEdodmMyVWdablZ1WTNScGIyNXpJR05oYmlCaVpTQmhJR3hwZEhSc1pTQnNaWE56SUhabGNtSnZjMlVnT2lsY2NseHVJQ292WEhKY2JrSmhjMlZNYjJkdlUydGxkR05vTG5CeWIzUnZkSGx3WlM1ZlkzSmxZWFJsVURWSmJuTjBZVzVqWlNBOUlHWjFibU4wYVc5dUtDa2dlMXh5WEc0Z0lHNWxkeUJ3TlNoY2NseHVJQ0FnSUdaMWJtTjBhVzl1S0hBcElIdGNjbHh1SUNBZ0lDQWdkR2hwY3k1ZmNDQTlJSEE3WEhKY2JpQWdJQ0FnSUhBdWNISmxiRzloWkNBOUlIUm9hWE11WDNCeVpXeHZZV1F1WW1sdVpDaDBhR2x6TENCd0tUdGNjbHh1SUNBZ0lDQWdjQzV6WlhSMWNDQTlJSFJvYVhNdVgzTmxkSFZ3TG1KcGJtUW9kR2hwY3l3Z2NDazdYSEpjYmlBZ0lDQWdJSEF1WkhKaGR5QTlJSFJvYVhNdVgyUnlZWGN1WW1sdVpDaDBhR2x6TENCd0tUdGNjbHh1SUNBZ0lIMHVZbWx1WkNoMGFHbHpLU3hjY2x4dUlDQWdJSFJvYVhNdVh5UmpiMjUwWVdsdVpYSXVaMlYwS0RBcFhISmNiaUFnS1R0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJHYVc1a0lIUm9aU0JrYVhOMFlXNWpaU0JtY205dElIUm9aU0IwYjNBZ2JHVm1kQ0J2WmlCMGFHVWdibUYySUhSdklIUm9aU0JpY21GdVpDQnNiMmR2SjNNZ1ltRnpaV3hwYm1VdVhISmNiaUFxTDF4eVhHNUNZWE5sVEc5bmIxTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgzVndaR0YwWlZSbGVIUlBabVp6WlhRZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQjJZWElnWW1GelpXeHBibVZFYVhZZ1BTQWtLRndpUEdScGRqNWNJaWxjY2x4dUlDQWdJQzVqYzNNb2UxeHlYRzRnSUNBZ0lDQmthWE53YkdGNU9pQmNJbWx1YkdsdVpTMWliRzlqYTF3aUxGeHlYRzRnSUNBZ0lDQjJaWEowYVdOaGJFRnNhV2R1T2lCY0ltSmhjMlZzYVc1bFhDSmNjbHh1SUNBZ0lIMHBYSEpjYmlBZ0lDQXVjSEpsY0dWdVpGUnZLSFJvYVhNdVh5UnVZWFpNYjJkdktUdGNjbHh1SUNCMllYSWdibUYyVDJabWMyVjBJRDBnZEdocGN5NWZKRzVoZGk1dlptWnpaWFFvS1R0Y2NseHVJQ0IyWVhJZ2JHOW5iMEpoYzJWc2FXNWxUMlptYzJWMElEMGdZbUZ6Wld4cGJtVkVhWFl1YjJabWMyVjBLQ2s3WEhKY2JpQWdkR2hwY3k1ZmRHVjRkRTltWm5ObGRDQTlJSHRjY2x4dUlDQWdJSFJ2Y0RvZ2JHOW5iMEpoYzJWc2FXNWxUMlptYzJWMExuUnZjQ0F0SUc1aGRrOW1abk5sZEM1MGIzQXNYSEpjYmlBZ0lDQnNaV1owT2lCc2IyZHZRbUZ6Wld4cGJtVlBabVp6WlhRdWJHVm1kQ0F0SUc1aGRrOW1abk5sZEM1c1pXWjBYSEpjYmlBZ2ZUdGNjbHh1SUNCaVlYTmxiR2x1WlVScGRpNXlaVzF2ZG1Vb0tUdGNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtseHlYRzRnS2lCR2FXNWtJSFJvWlNCaWIzVnVaR2x1WnlCaWIzZ2diMllnZEdobElHSnlZVzVrSUd4dloyOGdhVzRnZEdobElHNWhkaTRnVkdocGN5QmlZbTk0SUdOaGJpQjBhR1Z1SUdKbFhISmNiaUFxSUhWelpXUWdkRzhnWTI5dWRISnZiQ0IzYUdWdUlIUm9aU0JqZFhKemIzSWdjMmh2ZFd4a0lHSmxJR0VnY0c5cGJuUmxjaTVjY2x4dUlDb3ZYSEpjYmtKaGMyVk1iMmR2VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmWTJGc1kzVnNZWFJsVG1GMlRHOW5iMEp2ZFc1a2N5QTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJSFpoY2lCdVlYWlBabVp6WlhRZ1BTQjBhR2x6TGw4a2JtRjJMbTltWm5ObGRDZ3BPMXh5WEc0Z0lIWmhjaUJzYjJkdlQyWm1jMlYwSUQwZ2RHaHBjeTVmSkc1aGRreHZaMjh1YjJabWMyVjBLQ2s3WEhKY2JpQWdkR2hwY3k1ZmJHOW5iMEppYjNnZ1BTQjdYSEpjYmlBZ0lDQjVPaUJzYjJkdlQyWm1jMlYwTG5SdmNDQXRJRzVoZGs5bVpuTmxkQzUwYjNBc1hISmNiaUFnSUNCNE9pQnNiMmR2VDJabWMyVjBMbXhsWm5RZ0xTQnVZWFpQWm1aelpYUXViR1ZtZEN4Y2NseHVJQ0FnSUhjNklIUm9hWE11WHlSdVlYWk1iMmR2TG05MWRHVnlWMmxrZEdnb0tTd2dMeThnUlhoamJIVmtaU0J0WVhKbmFXNGdabkp2YlNCMGFHVWdZbUp2ZUZ4eVhHNGdJQ0FnYURvZ2RHaHBjeTVmSkc1aGRreHZaMjh1YjNWMFpYSklaV2xuYUhRb0tTQXZMeUJNYVc1cmN5QmhjbVZ1SjNRZ1kyeHBZMnRoWW14bElHOXVJRzFoY21kcGJseHlYRzRnSUgwN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nVlhCa1lYUmxJSFJvWlNCa2FXMWxibk5wYjI1eklIUnZJRzFoZEdOb0lIUm9aU0J1WVhZZ0xTQmxlR05zZFdScGJtY2dZVzU1SUcxaGNtZHBiaXdnY0dGa1pHbHVaeUFtWEhKY2JpQXFJR0p2Y21SbGNpNWNjbHh1SUNvdlhISmNia0poYzJWTWIyZHZVMnRsZEdOb0xuQnliM1J2ZEhsd1pTNWZkWEJrWVhSbFUybDZaU0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUhSb2FYTXVYM2RwWkhSb0lEMGdkR2hwY3k1ZkpHNWhkaTVwYm01bGNsZHBaSFJvS0NrN1hISmNiaUFnZEdocGN5NWZhR1ZwWjJoMElEMGdkR2hwY3k1ZkpHNWhkaTVwYm01bGNraGxhV2RvZENncE8xeHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUVkeVlXSWdkR2hsSUdadmJuUWdjMmw2WlNCbWNtOXRJSFJvWlNCaWNtRnVaQ0JzYjJkdklHeHBibXN1SUZSb2FYTWdiV0ZyWlhNZ2RHaGxJR1p2Ym5RZ2MybDZaU0J2WmlCMGFHVmNjbHh1SUNvZ2MydGxkR05vSUhKbGMzQnZibk5wZG1VdVhISmNiaUFxTDF4eVhHNUNZWE5sVEc5bmIxTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgzVndaR0YwWlVadmJuUlRhWHBsSUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2RHaHBjeTVmWm05dWRGTnBlbVVnUFNCMGFHbHpMbDhrYm1GMlRHOW5ieTVqYzNNb1hDSm1iMjUwVTJsNlpWd2lLUzV5WlhCc1lXTmxLRndpY0hoY0lpd2dYQ0pjSWlrN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nVjJobGJpQjBhR1VnWW5KdmQzTmxjaUJwY3lCeVpYTnBlbVZrTENCeVpXTmhiR04xYkdGMFpTQmhiR3dnZEdobElHNWxZMlZ6YzJGeWVTQnpkR0YwY3lCemJ5QjBhR0YwSUhSb1pWeHlYRzRnS2lCemEyVjBZMmdnWTJGdUlHSmxJSEpsYzNCdmJuTnBkbVV1SUZSb1pTQnNiMmR2SUdsdUlIUm9aU0J6YTJWMFkyZ2djMmh2ZFd4a0lFRk1WMEZaVXlCbGVHRmpkR3g1SUcxaGRHTm9YSEpjYmlBcUlIUm9aU0JpY21GdVp5QnNiMmR2SUd4cGJtc2dkR2hsSUVoVVRVd3VYSEpjYmlBcUwxeHlYRzVDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXVYMjl1VW1WemFYcGxJRDBnWm5WdVkzUnBiMjRvY0NrZ2UxeHlYRzRnSUhSb2FYTXVYM1Z3WkdGMFpWTnBlbVVvS1R0Y2NseHVJQ0IwYUdsekxsOTFjR1JoZEdWR2IyNTBVMmw2WlNncE8xeHlYRzRnSUhSb2FYTXVYM1Z3WkdGMFpWUmxlSFJQWm1aelpYUW9LVHRjY2x4dUlDQjBhR2x6TGw5allXeGpkV3hoZEdWT1lYWk1iMmR2UW05MWJtUnpLQ2s3WEhKY2JpQWdjQzV5WlhOcGVtVkRZVzUyWVhNb2RHaHBjeTVmZDJsa2RHZ3NJSFJvYVhNdVgyaGxhV2RvZENrN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nVlhCa1lYUmxJSFJvWlNCZmFYTk5iM1Z6WlU5MlpYSWdjSEp2Y0dWeWRIa3VYSEpjYmlBcUwxeHlYRzVDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXVYM05sZEUxdmRYTmxUM1psY2lBOUlHWjFibU4wYVc5dUtHbHpUVzkxYzJWUGRtVnlLU0I3WEhKY2JpQWdkR2hwY3k1ZmFYTk5iM1Z6WlU5MlpYSWdQU0JwYzAxdmRYTmxUM1psY2p0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJKWmlCMGFHVWdZM1Z5YzI5eUlHbHpJSE5sZENCMGJ5QmhJSEJ2YVc1MFpYSXNJR1p2Y25kaGNtUWdZVzU1SUdOc2FXTnJJR1YyWlc1MGN5QjBieUIwYUdVZ2JtRjJJR3h2WjI4dVhISmNiaUFxSUZSb2FYTWdjbVZrZFdObGN5QjBhR1VnYm1WbFpDQm1iM0lnZEdobElHTmhiblpoY3lCMGJ5QmtieUJoYm5rZ1FVcEJXQzE1SUhOMGRXWm1MbHh5WEc0Z0tpOWNjbHh1UW1GelpVeHZaMjlUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDl2YmtOc2FXTnJJRDBnWm5WdVkzUnBiMjRvWlNrZ2UxeHlYRzRnSUdsbUlDaDBhR2x6TGw5cGMwOTJaWEpPWVhaTWIyZHZLU0IwYUdsekxsOGtibUYyVEc5bmJ5NTBjbWxuWjJWeUtHVXBPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFSmhjMlVnY0hKbGJHOWhaQ0J0WlhSb2IyUWdkR2hoZENCcWRYTjBJR3h2WVdSeklIUm9aU0J1WldObGMzTmhjbmtnWm05dWRGeHlYRzRnS2k5Y2NseHVRbUZ6WlV4dloyOVRhMlYwWTJndWNISnZkRzkwZVhCbExsOXdjbVZzYjJGa0lEMGdablZ1WTNScGIyNG9jQ2tnZTF4eVhHNGdJSFJvYVhNdVgyWnZiblFnUFNCd0xteHZZV1JHYjI1MEtIUm9hWE11WDJadmJuUlFZWFJvS1R0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJDWVhObElITmxkSFZ3SUcxbGRHaHZaQ0IwYUdGMElHUnZaWE1nYzI5dFpTQm9aV0YyZVNCc2FXWjBhVzVuTGlCSmRDQm9hV1JsY3lCMGFHVWdibUYySUdKeVlXNWtJR3h2WjI5Y2NseHVJQ29nWVc1a0lISmxkbVZoYkhNZ2RHaGxJR05oYm5aaGN5NGdTWFFnWVd4emJ5QnpaWFJ6SUhWd0lHRWdiRzkwSUc5bUlIUm9aU0JwYm5SbGNtNWhiQ0IyWVhKcFlXSnNaWE1nWVc1a1hISmNiaUFxSUdOaGJuWmhjeUJsZG1WdWRITXVYSEpjYmlBcUwxeHlYRzVDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXVYM05sZEhWd0lEMGdablZ1WTNScGIyNG9jQ2tnZTF4eVhHNGdJSFpoY2lCeVpXNWtaWEpsY2lBOUlIQXVZM0psWVhSbFEyRnVkbUZ6S0hSb2FYTXVYM2RwWkhSb0xDQjBhR2x6TGw5b1pXbG5hSFFwTzF4eVhHNGdJSFJvYVhNdVh5UmpZVzUyWVhNZ1BTQWtLSEpsYm1SbGNtVnlMbU5oYm5aaGN5azdYSEpjYmx4eVhHNGdJQzh2SUZOb2IzY2dkR2hsSUdOaGJuWmhjeUJoYm1RZ2FHbGtaU0IwYUdVZ2JHOW5ieTRnVlhOcGJtY2djMmh2ZHk5b2FXUmxJRzl1SUhSb1pTQnNiMmR2SUhkcGJHd2dZMkYxYzJWY2NseHVJQ0F2THlCcVVYVmxjbmtnZEc4Z2JYVmpheUIzYVhSb0lIUm9aU0J3YjNOcGRHbHZibWx1Wnl3Z2QyaHBZMmdnYVhNZ2RYTmxaQ0IwYnlCallXeGpkV3hoZEdVZ2QyaGxjbVVnZEc5Y2NseHVJQ0F2THlCa2NtRjNJSFJvWlNCallXNTJZWE1nZEdWNGRDNGdTVzV6ZEdWaFpDd2dhblZ6ZENCd2RYTm9JSFJvWlNCc2IyZHZJR0psYUdsdVpDQjBhR1VnWTJGdWRtRnpMaUJVYUdselhISmNiaUFnTHk4Z1lXeHNiM2R6SUcxaGEyVnpJR2wwSUhOdklIUm9aU0JqWVc1MllYTWdhWE1nYzNScGJHd2dZbVZvYVc1a0lIUm9aU0J1WVhZZ2JHbHVhM011WEhKY2JpQWdkR2hwY3k1ZkpHTnZiblJoYVc1bGNpNXphRzkzS0NrN1hISmNiaUFnZEdocGN5NWZKRzVoZGt4dloyOHVZM056S0Z3aWVrbHVaR1Y0WENJc0lDMHhLVHRjY2x4dVhISmNiaUFnTHk4Z1ZHaGxjbVVnYVhOdUozUWdZU0JuYjI5a0lIZGhlU0IwYnlCamFHVmpheUIzYUdWMGFHVnlJSFJvWlNCemEyVjBZMmdnYUdGeklIUm9aU0J0YjNWelpTQnZkbVZ5WEhKY2JpQWdMeThnYVhRdUlIQXViVzkxYzJWWUlDWWdjQzV0YjNWelpWa2dZWEpsSUdsdWFYUnBZV3hwZW1Wa0lIUnZJQ2d3TENBd0tTd2dZVzVrSUhBdVptOWpkWE5sWkNCcGMyNG5kRnh5WEc0Z0lDOHZJR0ZzZDJGNWN5QnlaV3hwWVdKc1pTNWNjbHh1SUNCMGFHbHpMbDhrWTJGdWRtRnpMbTl1S0Z3aWJXOTFjMlZ2ZG1WeVhDSXNJSFJvYVhNdVgzTmxkRTF2ZFhObFQzWmxjaTVpYVc1a0tIUm9hWE1zSUhSeWRXVXBLVHRjY2x4dUlDQjBhR2x6TGw4a1kyRnVkbUZ6TG05dUtGd2liVzkxYzJWdmRYUmNJaXdnZEdocGN5NWZjMlYwVFc5MWMyVlBkbVZ5TG1KcGJtUW9kR2hwY3l3Z1ptRnNjMlVwS1R0Y2NseHVYSEpjYmlBZ0x5OGdSbTl5ZDJGeVpDQnRiM1Z6WlNCamJHbGphM01nZEc4Z2RHaGxJRzVoZGlCc2IyZHZYSEpjYmlBZ2RHaHBjeTVmSkdOaGJuWmhjeTV2YmloY0ltTnNhV05yWENJc0lIUm9hWE11WDI5dVEyeHBZMnN1WW1sdVpDaDBhR2x6S1NrN1hISmNibHh5WEc0Z0lDOHZJRmRvWlc0Z2RHaGxJSGRwYm1SdmR5QnBjeUJ5WlhOcGVtVmtMQ0IwWlhoMElDWWdZMkZ1ZG1GeklITnBlbWx1WnlCaGJtUWdjR3hoWTJWdFpXNTBJRzVsWldRZ2RHOGdZbVZjY2x4dUlDQXZMeUJ5WldOaGJHTjFiR0YwWldRdUlGUm9aU0J6YVhSbElHbHpJSEpsYzNCdmJuTnBkbVVzSUhOdklIUm9aU0JwYm5SbGNtRmpkR2wyWlNCallXNTJZWE1nYzJodmRXeGtJR0psWEhKY2JpQWdMeThnZEc5dklWeHlYRzRnSUNRb2QybHVaRzkzS1M1dmJpaGNJbkpsYzJsNlpWd2lMQ0IwYUdsekxsOXZibEpsYzJsNlpTNWlhVzVrS0hSb2FYTXNJSEFwS1R0Y2NseHVmVHRjY2x4dVhISmNiaThxS2x4eVhHNGdLaUJDWVhObElHUnlZWGNnYldWMGFHOWtJSFJvWVhRZ1kyOXVkSEp2YkhNZ2QyaGxkR2hsY2lCdmNpQnViM1FnZEdobElHTjFjbk52Y2lCcGN5QmhJSEJ2YVc1MFpYSXVJRWwwWEhKY2JpQXFJSE5vYjNWc1pDQnZibXg1SUdKbElHRWdjRzlwYm5SbGNpQjNhR1Z1SUhSb1pTQnRiM1Z6WlNCcGN5QnZkbVZ5SUhSb1pTQnVZWFlnWW5KaGJtUWdiRzluYnk1Y2NseHVJQ292WEhKY2JrSmhjMlZNYjJkdlUydGxkR05vTG5CeWIzUnZkSGx3WlM1ZlpISmhkeUE5SUdaMWJtTjBhVzl1S0hBcElIdGNjbHh1SUNCcFppQW9kR2hwY3k1ZmFYTk5iM1Z6WlU5MlpYSXBJSHRjY2x4dUlDQWdJSFpoY2lCcGMwOTJaWEpNYjJkdklEMGdkWFJwYkhNdWFYTkpibEpsWTNRb2NDNXRiM1Z6WlZnc0lIQXViVzkxYzJWWkxDQjBhR2x6TGw5c2IyZHZRbUp2ZUNrN1hISmNiaUFnSUNCcFppQW9JWFJvYVhNdVgybHpUM1psY2s1aGRreHZaMjhnSmlZZ2FYTlBkbVZ5VEc5bmJ5a2dlMXh5WEc0Z0lDQWdJQ0IwYUdsekxsOXBjMDkyWlhKT1lYWk1iMmR2SUQwZ2RISjFaVHRjY2x4dUlDQWdJQ0FnZEdocGN5NWZKR05oYm5aaGN5NWpjM01vWENKamRYSnpiM0pjSWl3Z1hDSndiMmx1ZEdWeVhDSXBPMXh5WEc0Z0lDQWdmU0JsYkhObElHbG1JQ2gwYUdsekxsOXBjMDkyWlhKT1lYWk1iMmR2SUNZbUlDRnBjMDkyWlhKTWIyZHZLU0I3WEhKY2JpQWdJQ0FnSUhSb2FYTXVYMmx6VDNabGNrNWhka3h2WjI4Z1BTQm1ZV3h6WlR0Y2NseHVJQ0FnSUNBZ2RHaHBjeTVmSkdOaGJuWmhjeTVqYzNNb1hDSmpkWEp6YjNKY0lpd2dYQ0pwYm1sMGFXRnNYQ0lwTzF4eVhHNGdJQ0FnZlZ4eVhHNGdJSDFjY2x4dWZUdGNjbHh1SWl3aWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCVGEyVjBZMmc3WEhKY2JseHlYRzUyWVhJZ1FtSnZlRlJsZUhRZ1BTQnlaWEYxYVhKbEtGd2ljRFV0WW1KdmVDMWhiR2xuYm1Wa0xYUmxlSFJjSWlrN1hISmNiblpoY2lCQ1lYTmxURzluYjFOclpYUmphQ0E5SUhKbGNYVnBjbVVvWENJdUwySmhjMlV0Ykc5bmJ5MXphMlYwWTJndWFuTmNJaWs3WEhKY2JuWmhjaUJUYVc1SFpXNWxjbUYwYjNJZ1BTQnlaWEYxYVhKbEtGd2lMaTluWlc1bGNtRjBiM0p6TDNOcGJpMW5aVzVsY21GMGIzSXVhbk5jSWlrN1hISmNibHh5WEc1MllYSWdkWFJwYkhNZ1BTQnlaWEYxYVhKbEtGd2lMaTR2ZFhScGJHbDBhV1Z6TG1welhDSXBPMXh5WEc1Y2NseHVVMnRsZEdOb0xuQnliM1J2ZEhsd1pTQTlJRTlpYW1WamRDNWpjbVZoZEdVb1FtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsS1R0Y2NseHVYSEpjYm1aMWJtTjBhVzl1SUZOclpYUmphQ2drYm1GMkxDQWtibUYyVEc5bmJ5a2dlMXh5WEc0Z0lFSmhjMlZNYjJkdlUydGxkR05vTG1OaGJHd29kR2hwY3l3Z0pHNWhkaXdnSkc1aGRreHZaMjhzSUZ3aUxpNHZabTl1ZEhNdlltbG5YMnB2YUc0dGQyVmlabTl1ZEM1MGRHWmNJaWs3WEhKY2JuMWNjbHh1WEhKY2JsTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgyOXVVbVZ6YVhwbElEMGdablZ1WTNScGIyNG9jQ2tnZTF4eVhHNGdJRUpoYzJWTWIyZHZVMnRsZEdOb0xuQnliM1J2ZEhsd1pTNWZiMjVTWlhOcGVtVXVZMkZzYkNoMGFHbHpMQ0J3S1R0Y2NseHVJQ0IwYUdsekxsOXpjR0ZqYVc1bklEMGdkWFJwYkhNdWJXRndLSFJvYVhNdVgyWnZiblJUYVhwbExDQXlNQ3dnTkRBc0lESXNJRFVzSUh0Y2NseHVJQ0FnSUdOc1lXMXdPaUIwY25WbExGeHlYRzRnSUNBZ2NtOTFibVE2SUhSeWRXVmNjbHh1SUNCOUtUdGNjbHh1SUNBdkx5QlZjR1JoZEdVZ2RHaGxJR0ppYjNoVVpYaDBMQ0J3YkdGalpTQnZkbVZ5SUhSb1pTQnVZWFlnZEdWNGRDQnNiMmR2SUdGdVpDQjBhR1Z1SUhOb2FXWjBJR2wwYzF4eVhHNGdJQzh2SUdGdVkyaHZjaUJpWVdOcklIUnZJQ2hqWlc1MFpYSXNJR05sYm5SbGNpa2dkMmhwYkdVZ2NISmxjMlZ5ZG1sdVp5QjBhR1VnZEdWNGRDQndiM05wZEdsdmJseHlYRzRnSUhSb2FYTXVYMkppYjNoVVpYaDBYSEpjYmlBZ0lDQXVjMlYwVkdWNGRDaDBhR2x6TGw5MFpYaDBLVnh5WEc0Z0lDQWdMbk5sZEZSbGVIUlRhWHBsS0hSb2FYTXVYMlp2Ym5SVGFYcGxLVnh5WEc0Z0lDQWdMbk5sZEVGdVkyaHZjaWhDWW05NFZHVjRkQzVCVEVsSFRpNUNUMWhmVEVWR1ZDd2dRbUp2ZUZSbGVIUXVRa0ZUUlV4SlRrVXVRVXhRU0VGQ1JWUkpReWxjY2x4dUlDQWdJQzV6WlhSUWIzTnBkR2x2YmloMGFHbHpMbDkwWlhoMFQyWm1jMlYwTG14bFpuUXNJSFJvYVhNdVgzUmxlSFJQWm1aelpYUXVkRzl3S1Z4eVhHNGdJQ0FnTG5ObGRFRnVZMmh2Y2loQ1ltOTRWR1Y0ZEM1QlRFbEhUaTVDVDFoZlEwVk9WRVZTTENCQ1ltOTRWR1Y0ZEM1Q1FWTkZURWxPUlM1Q1QxaGZRMFZPVkVWU0xDQjBjblZsS1R0Y2NseHVJQ0IwYUdsekxsOWtjbUYzVTNSaGRHbHZibUZ5ZVV4dloyOG9jQ2s3WEhKY2JpQWdkR2hwY3k1ZmNHOXBiblJ6SUQwZ2RHaHBjeTVmWW1KdmVGUmxlSFF1WjJWMFZHVjRkRkJ2YVc1MGN5Z3BPMXh5WEc0Z0lIUm9hWE11WDJselJtbHljM1JHY21GdFpTQTlJSFJ5ZFdVN1hISmNibjA3WEhKY2JseHlYRzVUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDlrY21GM1UzUmhkR2x2Ym1GeWVVeHZaMjhnUFNCbWRXNWpkR2x2Ymlod0tTQjdYSEpjYmlBZ2NDNWlZV05yWjNKdmRXNWtLREkxTlNrN1hISmNiaUFnY0M1emRISnZhMlVvTWpVMUtUdGNjbHh1SUNCd0xtWnBiR3dvWENJak1FRXdNREJCWENJcE8xeHlYRzRnSUhBdWMzUnliMnRsVjJWcFoyaDBLRElwTzF4eVhHNGdJSFJvYVhNdVgySmliM2hVWlhoMExtUnlZWGNvS1R0Y2NseHVmVHRjY2x4dVhISmNibE5yWlhSamFDNXdjbTkwYjNSNWNHVXVYM05sZEhWd0lEMGdablZ1WTNScGIyNG9jQ2tnZTF4eVhHNGdJRUpoYzJWTWIyZHZVMnRsZEdOb0xuQnliM1J2ZEhsd1pTNWZjMlYwZFhBdVkyRnNiQ2gwYUdsekxDQndLVHRjY2x4dVhISmNiaUFnTHk4Z1EzSmxZWFJsSUdFZ1FtSnZlRUZzYVdkdVpXUlVaWGgwSUdsdWMzUmhibU5sSUhSb1lYUWdkMmxzYkNCaVpTQjFjMlZrSUdadmNpQmtjbUYzYVc1bklHRnVaRnh5WEc0Z0lDOHZJSEp2ZEdGMGFXNW5JSFJsZUhSY2NseHVJQ0IwYUdsekxsOWlZbTk0VkdWNGRDQTlJRzVsZHlCQ1ltOTRWR1Y0ZENoMGFHbHpMbDltYjI1MExDQjBhR2x6TGw5MFpYaDBMQ0IwYUdsekxsOW1iMjUwVTJsNlpTd2dNQ3dnTUN3Z2NDazdYSEpjYmx4eVhHNGdJQzh2SUVoaGJtUnNaU0IwYUdVZ2FXNXBkR2xoYkNCelpYUjFjQ0JpZVNCMGNtbG5aMlZ5YVc1bklHRWdjbVZ6YVhwbFhISmNiaUFnZEdocGN5NWZiMjVTWlhOcGVtVW9jQ2s3WEhKY2JseHlYRzRnSUM4dklFUnlZWGNnZEdobElITjBZWFJwYjI1aGNua2diRzluYjF4eVhHNGdJSFJvYVhNdVgyUnlZWGRUZEdGMGFXOXVZWEo1VEc5bmJ5aHdLVHRjY2x4dVhISmNiaUFnTHk4Z1UzUmhjblFnZEdobElITnBiaUJuWlc1bGNtRjBiM0lnWVhRZ2FYUnpJRzFoZUNCMllXeDFaVnh5WEc0Z0lIUm9hWE11WDNSb2NtVnphRzlzWkVkbGJtVnlZWFJ2Y2lBOUlHNWxkeUJUYVc1SFpXNWxjbUYwYjNJb2NDd2dNQ3dnTVN3Z01DNHdNaXdnY0M1UVNTQXZJRElwTzF4eVhHNTlPMXh5WEc1Y2NseHVVMnRsZEdOb0xuQnliM1J2ZEhsd1pTNWZaSEpoZHlBOUlHWjFibU4wYVc5dUtIQXBJSHRjY2x4dUlDQkNZWE5sVEc5bmIxTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgyUnlZWGN1WTJGc2JDaDBhR2x6TENCd0tUdGNjbHh1SUNCcFppQW9JWFJvYVhNdVgybHpUVzkxYzJWUGRtVnlJSHg4SUNGMGFHbHpMbDlwYzA5MlpYSk9ZWFpNYjJkdktTQnlaWFIxY200N1hISmNibHh5WEc0Z0lDOHZJRmRvWlc0Z2RHaGxJSFJsZUhRZ2FYTWdZV0p2ZFhRZ2RHOGdZbVZqYjIxbElHRmpkR2wyWlNCbWIzSWdkR2hsSUdacGNuTjBJSFJwYldVc0lHTnNaV0Z5WEhKY2JpQWdMeThnZEdobElITjBZWFJwYjI1aGNua2diRzluYnlCMGFHRjBJSGRoY3lCd2NtVjJhVzkxYzJ4NUlHUnlZWGR1TGx4eVhHNGdJR2xtSUNoMGFHbHpMbDlwYzBacGNuTjBSbkpoYldVcElIdGNjbHh1SUNBZ0lIQXVZbUZqYTJkeWIzVnVaQ2d5TlRVcE8xeHlYRzRnSUNBZ2RHaHBjeTVmYVhOR2FYSnpkRVp5WVcxbElEMGdabUZzYzJVN1hISmNiaUFnZlZ4eVhHNWNjbHh1SUNCcFppQW9kR2hwY3k1ZlptOXVkRk5wZW1VZ1BpQXpNQ2tnZTF4eVhHNGdJQ0FnZEdocGN5NWZkR2h5WlhOb2IyeGtSMlZ1WlhKaGRHOXlMbk5sZEVKdmRXNWtjeWd3TGpJZ0tpQjBhR2x6TGw5aVltOTRWR1Y0ZEM1b1pXbG5hSFFzSURBdU5EY2dLaUIwYUdsekxsOWlZbTk0VkdWNGRDNW9aV2xuYUhRcE8xeHlYRzRnSUgwZ1pXeHpaU0I3WEhKY2JpQWdJQ0IwYUdsekxsOTBhSEpsYzJodmJHUkhaVzVsY21GMGIzSXVjMlYwUW05MWJtUnpLREF1TWlBcUlIUm9hWE11WDJKaWIzaFVaWGgwTG1obGFXZG9kQ3dnTUM0MklDb2dkR2hwY3k1ZlltSnZlRlJsZUhRdWFHVnBaMmgwS1R0Y2NseHVJQ0I5WEhKY2JpQWdkbUZ5SUdScGMzUmhibU5sVkdoeVpYTm9iMnhrSUQwZ2RHaHBjeTVmZEdoeVpYTm9iMnhrUjJWdVpYSmhkRzl5TG1kbGJtVnlZWFJsS0NrN1hISmNibHh5WEc0Z0lIQXVZbUZqYTJkeWIzVnVaQ2d5TlRVc0lERXdNQ2s3WEhKY2JpQWdjQzV6ZEhKdmEyVlhaV2xuYUhRb01TazdYSEpjYmlBZ1ptOXlJQ2gyWVhJZ2FTQTlJREE3SUdrZ1BDQjBhR2x6TGw5d2IybHVkSE11YkdWdVozUm9PeUJwSUNzOUlERXBJSHRjY2x4dUlDQWdJSFpoY2lCd2IybHVkREVnUFNCMGFHbHpMbDl3YjJsdWRITmJhVjA3WEhKY2JpQWdJQ0JtYjNJZ0tIWmhjaUJxSUQwZ2FTQXJJREU3SUdvZ1BDQjBhR2x6TGw5d2IybHVkSE11YkdWdVozUm9PeUJxSUNzOUlERXBJSHRjY2x4dUlDQWdJQ0FnZG1GeUlIQnZhVzUwTWlBOUlIUm9hWE11WDNCdmFXNTBjMXRxWFR0Y2NseHVJQ0FnSUNBZ2RtRnlJR1JwYzNRZ1BTQndMbVJwYzNRb2NHOXBiblF4TG5nc0lIQnZhVzUwTVM1NUxDQndiMmx1ZERJdWVDd2djRzlwYm5ReUxua3BPMXh5WEc0Z0lDQWdJQ0JwWmlBb1pHbHpkQ0E4SUdScGMzUmhibU5sVkdoeVpYTm9iMnhrS1NCN1hISmNiaUFnSUNBZ0lDQWdjQzV1YjFOMGNtOXJaU2dwTzF4eVhHNGdJQ0FnSUNBZ0lIQXVabWxzYkNoY0luSm5ZbUVvTVRZMUxDQXdMQ0F4TnpNc0lEQXVNalVwWENJcE8xeHlYRzRnSUNBZ0lDQWdJSEF1Wld4c2FYQnpaU2dvY0c5cGJuUXhMbmdnS3lCd2IybHVkREl1ZUNrZ0x5QXlMQ0FvY0c5cGJuUXhMbmtnS3lCd2IybHVkREl1ZVNrZ0x5QXlMQ0JrYVhOMExDQmthWE4wS1R0Y2NseHVYSEpjYmlBZ0lDQWdJQ0FnY0M1emRISnZhMlVvWENKeVoySmhLREUyTlN3Z01Dd2dNVGN6TENBd0xqSTFLVndpS1R0Y2NseHVJQ0FnSUNBZ0lDQndMbTV2Um1sc2JDZ3BPMXh5WEc0Z0lDQWdJQ0FnSUhBdWJHbHVaU2h3YjJsdWRERXVlQ3dnY0c5cGJuUXhMbmtzSUhCdmFXNTBNaTU0TENCd2IybHVkREl1ZVNrN1hISmNiaUFnSUNBZ0lIMWNjbHh1SUNBZ0lIMWNjbHh1SUNCOVhISmNibjA3WEhKY2JpSXNJbTF2WkhWc1pTNWxlSEJ2Y25SeklEMGdlMXh5WEc0Z0lFNXZhWE5sUjJWdVpYSmhkRzl5TVVRNklFNXZhWE5sUjJWdVpYSmhkRzl5TVVRc1hISmNiaUFnVG05cGMyVkhaVzVsY21GMGIzSXlSRG9nVG05cGMyVkhaVzVsY21GMGIzSXlSRnh5WEc1OU8xeHlYRzVjY2x4dWRtRnlJSFYwYVd4eklEMGdjbVZ4ZFdseVpTaGNJaTR1THk0dUwzVjBhV3hwZEdsbGN5NXFjMXdpS1R0Y2NseHVYSEpjYmk4dklDMHRJREZFSUU1dmFYTmxJRWRsYm1WeVlYUnZjaUF0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nUVNCMWRHbHNhWFI1SUdOc1lYTnpJR1p2Y2lCblpXNWxjbUYwYVc1bklHNXZhWE5sSUhaaGJIVmxjMXh5WEc0Z0tpQkFZMjl1YzNSeWRXTjBiM0pjY2x4dUlDb2dRSEJoY21GdElIdHZZbXBsWTNSOUlIQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCU1pXWmxjbVZ1WTJVZ2RHOGdZU0J3TlNCemEyVjBZMmhjY2x4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlGdHRhVzQ5TUYwZ0lDQWdJQ0FnSUNCTmFXNXBiWFZ0SUhaaGJIVmxJR1p2Y2lCMGFHVWdibTlwYzJWY2NseHVJQ29nUUhCaGNtRnRJSHR1ZFcxaVpYSjlJRnR0WVhnOU1WMGdJQ0FnSUNBZ0lDQk5ZWGhwYlhWdElIWmhiSFZsSUdadmNpQjBhR1VnYm05cGMyVmNjbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUZ0cGJtTnlaVzFsYm5ROU1DNHhYU0JUWTJGc1pTQnZaaUIwYUdVZ2JtOXBjMlVzSUhWelpXUWdkMmhsYmlCMWNHUmhkR2x1WjF4eVhHNGdLaUJBY0dGeVlXMGdlMjUxYldKbGNuMGdXMjltWm5ObGREMXlZVzVrYjIxZElFRWdkbUZzZFdVZ2RYTmxaQ0IwYnlCbGJuTjFjbVVnYlhWc2RHbHdiR1VnYm05cGMyVmNjbHh1SUNvZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JuWlc1bGNtRjBiM0p6SUdGeVpTQnlaWFIxY201cGJtY2dYQ0pwYm1SbGNHVnVaR1Z1ZEZ3aUlIWmhiSFZsYzF4eVhHNGdLaTljY2x4dVpuVnVZM1JwYjI0Z1RtOXBjMlZIWlc1bGNtRjBiM0l4UkNod0xDQnRhVzRzSUcxaGVDd2dhVzVqY21WdFpXNTBMQ0J2Wm1aelpYUXBJSHRjY2x4dUlDQjBhR2x6TGw5d0lEMGdjRHRjY2x4dUlDQjBhR2x6TGw5dGFXNGdQU0IxZEdsc2N5NWtaV1poZFd4MEtHMXBiaXdnTUNrN1hISmNiaUFnZEdocGN5NWZiV0Y0SUQwZ2RYUnBiSE11WkdWbVlYVnNkQ2h0WVhnc0lERXBPMXh5WEc0Z0lIUm9hWE11WDJsdVkzSmxiV1Z1ZENBOUlIVjBhV3h6TG1SbFptRjFiSFFvYVc1amNtVnRaVzUwTENBd0xqRXBPMXh5WEc0Z0lIUm9hWE11WDNCdmMybDBhVzl1SUQwZ2RYUnBiSE11WkdWbVlYVnNkQ2h2Wm1aelpYUXNJSEF1Y21GdVpHOXRLQzB4TURBd01EQXdMQ0F4TURBd01EQXdLU2s3WEhKY2JuMWNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQlZjR1JoZEdVZ2RHaGxJRzFwYmlCaGJtUWdiV0Y0SUc1dmFYTmxJSFpoYkhWbGMxeHlYRzRnS2lCQWNHRnlZVzBnSUh0dWRXMWlaWEo5SUcxcGJpQk5hVzVwYlhWdElHNXZhWE5sSUhaaGJIVmxYSEpjYmlBcUlFQndZWEpoYlNBZ2UyNTFiV0psY24wZ2JXRjRJRTFoZUdsdGRXMGdibTlwYzJVZ2RtRnNkV1ZjY2x4dUlDb3ZYSEpjYms1dmFYTmxSMlZ1WlhKaGRHOXlNVVF1Y0hKdmRHOTBlWEJsTG5ObGRFSnZkVzVrY3lBOUlHWjFibU4wYVc5dUtHMXBiaXdnYldGNEtTQjdYSEpjYmlBZ2RHaHBjeTVmYldsdUlEMGdkWFJwYkhNdVpHVm1ZWFZzZENodGFXNHNJSFJvYVhNdVgyMXBiaWs3WEhKY2JpQWdkR2hwY3k1ZmJXRjRJRDBnZFhScGJITXVaR1ZtWVhWc2RDaHRZWGdzSUhSb2FYTXVYMjFoZUNrN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nVlhCa1lYUmxJSFJvWlNCdWIybHpaU0JwYm1OeVpXMWxiblFnS0dVdVp5NGdjMk5oYkdVcFhISmNiaUFxSUVCd1lYSmhiU0FnZTI1MWJXSmxjbjBnYVc1amNtVnRaVzUwSUU1bGR5QnBibU55WlcxbGJuUWdLSE5qWVd4bEtTQjJZV3gxWlZ4eVhHNGdLaTljY2x4dVRtOXBjMlZIWlc1bGNtRjBiM0l4UkM1d2NtOTBiM1I1Y0dVdWMyVjBTVzVqY21WdFpXNTBJRDBnWm5WdVkzUnBiMjRvYVc1amNtVnRaVzUwS1NCN1hISmNiaUFnZEdocGN5NWZhVzVqY21WdFpXNTBJRDBnZFhScGJITXVaR1ZtWVhWc2RDaHBibU55WlcxbGJuUXNJSFJvYVhNdVgybHVZM0psYldWdWRDazdYSEpjYm4wN1hISmNibHh5WEc0dktpcGNjbHh1SUNvZ1IyVnVaWEpoZEdVZ2RHaGxJRzVsZUhRZ2JtOXBjMlVnZG1Gc2RXVmNjbHh1SUNvZ1FISmxkSFZ5YmlCN2JuVnRZbVZ5ZlNCQklHNXZhWE41SUhaaGJIVmxJR0psZEhkbFpXNGdiMkpxWldOMEozTWdiV2x1SUdGdVpDQnRZWGhjY2x4dUlDb3ZYSEpjYms1dmFYTmxSMlZ1WlhKaGRHOXlNVVF1Y0hKdmRHOTBlWEJsTG1kbGJtVnlZWFJsSUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2RHaHBjeTVmZFhCa1lYUmxLQ2s3WEhKY2JpQWdkbUZ5SUc0Z1BTQjBhR2x6TGw5d0xtNXZhWE5sS0hSb2FYTXVYM0J2YzJsMGFXOXVLVHRjY2x4dUlDQnVJRDBnZEdocGN5NWZjQzV0WVhBb2Jpd2dNQ3dnTVN3Z2RHaHBjeTVmYldsdUxDQjBhR2x6TGw5dFlYZ3BPMXh5WEc0Z0lISmxkSFZ5YmlCdU8xeHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUVsdWRHVnlibUZzSUhWd1pHRjBaU0J0WlhSb2IyUWdabTl5SUdkbGJtVnlZWFJwYm1jZ2JtVjRkQ0J1YjJselpTQjJZV3gxWlZ4eVhHNGdLaUJBY0hKcGRtRjBaVnh5WEc0Z0tpOWNjbHh1VG05cGMyVkhaVzVsY21GMGIzSXhSQzV3Y205MGIzUjVjR1V1WDNWd1pHRjBaU0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUhSb2FYTXVYM0J2YzJsMGFXOXVJQ3M5SUhSb2FYTXVYMmx1WTNKbGJXVnVkRHRjY2x4dWZUdGNjbHh1WEhKY2JpOHZJQzB0SURKRUlFNXZhWE5sSUVkbGJtVnlZWFJ2Y2lBdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdExTMHRMUzB0TFMwdFhISmNibHh5WEc1bWRXNWpkR2x2YmlCT2IybHpaVWRsYm1WeVlYUnZjakpFS0hBc0lIaE5hVzRzSUhoTllYZ3NJSGxOYVc0c0lIbE5ZWGdzSUhoSmJtTnlaVzFsYm5Rc0lIbEpibU55WlcxbGJuUXNJSGhQWm1aelpYUXNJSGxQWm1aelpYUXBJSHRjY2x4dUlDQjBhR2x6TGw5NFRtOXBjMlVnUFNCdVpYY2dUbTlwYzJWSFpXNWxjbUYwYjNJeFJDaHdMQ0I0VFdsdUxDQjRUV0Y0TENCNFNXNWpjbVZ0Wlc1MExDQjRUMlptYzJWMEtUdGNjbHh1SUNCMGFHbHpMbDk1VG05cGMyVWdQU0J1WlhjZ1RtOXBjMlZIWlc1bGNtRjBiM0l4UkNod0xDQjVUV2x1TENCNVRXRjRMQ0I1U1c1amNtVnRaVzUwTENCNVQyWm1jMlYwS1R0Y2NseHVJQ0IwYUdsekxsOXdJRDBnY0R0Y2NseHVmVnh5WEc1Y2NseHVMeW9xWEhKY2JpQXFJRlZ3WkdGMFpTQjBhR1VnYldsdUlHRnVaQ0J0WVhnZ2JtOXBjMlVnZG1Gc2RXVnpYSEpjYmlBcUlFQndZWEpoYlNBZ2UyOWlhbVZqZEgwZ2IzQjBhVzl1Y3lCUFltcGxZM1FnZDJsMGFDQmliM1Z1WkhNZ2RHOGdZbVVnZFhCa1lYUmxaQ0JsTG1jdVhISmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I3SUhoTmFXNDZJREFzSUhoTllYZzZJREVzSUhsTmFXNDZJQzB4TENCNVRXRjRPaUF4SUgxY2NseHVJQ292WEhKY2JrNXZhWE5sUjJWdVpYSmhkRzl5TWtRdWNISnZkRzkwZVhCbExuTmxkRUp2ZFc1a2N5QTlJR1oxYm1OMGFXOXVLRzl3ZEdsdmJuTXBJSHRjY2x4dUlDQnBaaUFvSVc5d2RHbHZibk1wSUhKbGRIVnlianRjY2x4dUlDQjBhR2x6TGw5NFRtOXBjMlV1YzJWMFFtOTFibVJ6S0c5d2RHbHZibk11ZUUxcGJpd2diM0IwYVc5dWN5NTRUV0Y0S1R0Y2NseHVJQ0IwYUdsekxsOTVUbTlwYzJVdWMyVjBRbTkxYm1SektHOXdkR2x2Ym5NdWVVMXBiaXdnYjNCMGFXOXVjeTU1VFdGNEtUdGNjbHh1ZlR0Y2NseHVYSEpjYmk4cUtseHlYRzRnS2lCVmNHUmhkR1VnZEdobElHbHVZM0psYldWdWRDQW9aUzVuTGlCelkyRnNaU2tnWm05eUlIUm9aU0J1YjJselpTQm5aVzVsY21GMGIzSmNjbHh1SUNvZ1FIQmhjbUZ0SUNCN2IySnFaV04wZlNCdmNIUnBiMjV6SUU5aWFtVmpkQ0IzYVhSb0lHSnZkVzVrY3lCMGJ5QmlaU0IxY0dSaGRHVmtJR1V1Wnk1Y2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSHNnZUVsdVkzSmxiV1Z1ZERvZ01DNHdOU3dnZVVsdVkzSmxiV1Z1ZERvZ01DNHhJSDFjY2x4dUlDb3ZYSEpjYms1dmFYTmxSMlZ1WlhKaGRHOXlNa1F1Y0hKdmRHOTBlWEJsTG5ObGRFSnZkVzVrY3lBOUlHWjFibU4wYVc5dUtHOXdkR2x2Ym5NcElIdGNjbHh1SUNCcFppQW9JVzl3ZEdsdmJuTXBJSEpsZEhWeWJqdGNjbHh1SUNCMGFHbHpMbDk0VG05cGMyVXVjMlYwUW05MWJtUnpLRzl3ZEdsdmJuTXVlRWx1WTNKbGJXVnVkQ2s3WEhKY2JpQWdkR2hwY3k1ZmVVNXZhWE5sTG5ObGRFSnZkVzVrY3lodmNIUnBiMjV6TG5sSmJtTnlaVzFsYm5RcE8xeHlYRzU5TzF4eVhHNWNjbHh1THlvcVhISmNiaUFxSUVkbGJtVnlZWFJsSUhSb1pTQnVaWGgwSUhCaGFYSWdiMllnYm05cGMyVWdkbUZzZFdWelhISmNiaUFxSUVCeVpYUjFjbTRnZTI5aWFtVmpkSDBnVDJKcVpXTjBJSGRwZEdnZ2VDQmhibVFnZVNCd2NtOXdaWEowYVdWeklIUm9ZWFFnWTI5dWRHRnBiaUIwYUdVZ2JtVjRkQ0J1YjJselpWeHlYRzRnS2lBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGJIVmxjeUJoYkc5dVp5QmxZV05vSUdScGJXVnVjMmx2Ymx4eVhHNGdLaTljY2x4dVRtOXBjMlZIWlc1bGNtRjBiM0l5UkM1d2NtOTBiM1I1Y0dVdVoyVnVaWEpoZEdVZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQnlaWFIxY200Z2UxeHlYRzRnSUNBZ2VEb2dkR2hwY3k1ZmVFNXZhWE5sTG1kbGJtVnlZWFJsS0Nrc1hISmNiaUFnSUNCNU9pQjBhR2x6TGw5NVRtOXBjMlV1WjJWdVpYSmhkR1VvS1Z4eVhHNGdJSDA3WEhKY2JuMDdYSEpjYmlJc0ltMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1UybHVSMlZ1WlhKaGRHOXlPMXh5WEc1Y2NseHVkbUZ5SUhWMGFXeHpJRDBnY21WeGRXbHlaU2hjSWk0dUx5NHVMM1YwYVd4cGRHbGxjeTVxYzF3aUtUdGNjbHh1WEhKY2JpOHFLbHh5WEc0Z0tpQkJJSFYwYVd4cGRIa2dZMnhoYzNNZ1ptOXlJR2RsYm1WeVlYUnBibWNnZG1Gc2RXVnpJR0ZzYjI1bklHRWdjMmx1ZDJGMlpWeHlYRzRnS2lCQVkyOXVjM1J5ZFdOMGIzSmNjbHh1SUNvZ1FIQmhjbUZ0SUh0dlltcGxZM1I5SUhBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JTWldabGNtVnVZMlVnZEc4Z1lTQndOU0J6YTJWMFkyaGNjbHh1SUNvZ1FIQmhjbUZ0SUh0dWRXMWlaWEo5SUZ0dGFXNDlNRjBnSUNBZ0lDQWdJQ0JOYVc1cGJYVnRJSFpoYkhWbElHWnZjaUIwYUdVZ2JtOXBjMlZjY2x4dUlDb2dRSEJoY21GdElIdHVkVzFpWlhKOUlGdHRZWGc5TVYwZ0lDQWdJQ0FnSUNCTllYaHBiWFZ0SUhaaGJIVmxJR1p2Y2lCMGFHVWdibTlwYzJWY2NseHVJQ29nUUhCaGNtRnRJSHR1ZFcxaVpYSjlJRnRwYm1OeVpXMWxiblE5TUM0eFhTQkpibU55WlcxbGJuUWdkWE5sWkNCM2FHVnVJSFZ3WkdGMGFXNW5YSEpjYmlBcUlFQndZWEpoYlNCN2JuVnRZbVZ5ZlNCYmIyWm1jMlYwUFhKaGJtUnZiVjBnVjJobGNtVWdkRzhnYzNSaGNuUWdZV3h2Ym1jZ2RHaGxJSE5wYm1WM1lYWmxYSEpjYmlBcUwxeHlYRzVtZFc1amRHbHZiaUJUYVc1SFpXNWxjbUYwYjNJb2NDd2diV2x1TENCdFlYZ3NJR0Z1WjJ4bFNXNWpjbVZ0Wlc1MExDQnpkR0Z5ZEdsdVowRnVaMnhsS1NCN1hISmNiaUFnZEdocGN5NWZjQ0E5SUhBN1hISmNiaUFnZEdocGN5NWZiV2x1SUQwZ2RYUnBiSE11WkdWbVlYVnNkQ2h0YVc0c0lEQXBPMXh5WEc0Z0lIUm9hWE11WDIxaGVDQTlJSFYwYVd4ekxtUmxabUYxYkhRb2JXRjRMQ0F3S1R0Y2NseHVJQ0IwYUdsekxsOXBibU55WlcxbGJuUWdQU0IxZEdsc2N5NWtaV1poZFd4MEtHRnVaMnhsU1c1amNtVnRaVzUwTENBd0xqRXBPMXh5WEc0Z0lIUm9hWE11WDJGdVoyeGxJRDBnZFhScGJITXVaR1ZtWVhWc2RDaHpkR0Z5ZEdsdVowRnVaMnhsTENCd0xuSmhibVJ2YlNndE1UQXdNREF3TUN3Z01UQXdNREF3TUNrcE8xeHlYRzU5WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nVlhCa1lYUmxJSFJvWlNCdGFXNGdZVzVrSUcxaGVDQjJZV3gxWlhOY2NseHVJQ29nUUhCaGNtRnRJQ0I3Ym5WdFltVnlmU0J0YVc0Z1RXbHVhVzExYlNCMllXeDFaVnh5WEc0Z0tpQkFjR0Z5WVcwZ0lIdHVkVzFpWlhKOUlHMWhlQ0JOWVhocGJYVnRJSFpoYkhWbFhISmNiaUFxTDF4eVhHNVRhVzVIWlc1bGNtRjBiM0l1Y0hKdmRHOTBlWEJsTG5ObGRFSnZkVzVrY3lBOUlHWjFibU4wYVc5dUtHMXBiaXdnYldGNEtTQjdYSEpjYmlBZ2RHaHBjeTVmYldsdUlEMGdkWFJwYkhNdVpHVm1ZWFZzZENodGFXNHNJSFJvYVhNdVgyMXBiaWs3WEhKY2JpQWdkR2hwY3k1ZmJXRjRJRDBnZFhScGJITXVaR1ZtWVhWc2RDaHRZWGdzSUhSb2FYTXVYMjFoZUNrN1hISmNibjA3WEhKY2JseHlYRzR2S2lwY2NseHVJQ29nVlhCa1lYUmxJSFJvWlNCaGJtZHNaU0JwYm1OeVpXMWxiblFnS0dVdVp5NGdhRzkzSUdaaGMzUWdkMlVnYlc5MlpTQjBhSEp2ZFdkb0lIUm9aU0J6YVc1M1lYWmxLVnh5WEc0Z0tpQkFjR0Z5WVcwZ0lIdHVkVzFpWlhKOUlHbHVZM0psYldWdWRDQk9aWGNnYVc1amNtVnRaVzUwSUhaaGJIVmxYSEpjYmlBcUwxeHlYRzVUYVc1SFpXNWxjbUYwYjNJdWNISnZkRzkwZVhCbExuTmxkRWx1WTNKbGJXVnVkQ0E5SUdaMWJtTjBhVzl1S0dsdVkzSmxiV1Z1ZENrZ2UxeHlYRzRnSUhSb2FYTXVYMmx1WTNKbGJXVnVkQ0E5SUhWMGFXeHpMbVJsWm1GMWJIUW9hVzVqY21WdFpXNTBMQ0IwYUdsekxsOXBibU55WlcxbGJuUXBPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFZGxibVZ5WVhSbElIUm9aU0J1WlhoMElIWmhiSFZsWEhKY2JpQXFJRUJ5WlhSMWNtNGdlMjUxYldKbGNuMGdRU0IyWVd4MVpTQmlaWFIzWldWdUlHZGxibVZ5WVhSdmNuTW5jeUJ0YVc0Z1lXNWtJRzFoZUZ4eVhHNGdLaTljY2x4dVUybHVSMlZ1WlhKaGRHOXlMbkJ5YjNSdmRIbHdaUzVuWlc1bGNtRjBaU0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUhSb2FYTXVYM1Z3WkdGMFpTZ3BPMXh5WEc0Z0lIWmhjaUJ1SUQwZ2RHaHBjeTVmY0M1emFXNG9kR2hwY3k1ZllXNW5iR1VwTzF4eVhHNGdJRzRnUFNCMGFHbHpMbDl3TG0xaGNDaHVMQ0F0TVN3Z01Td2dkR2hwY3k1ZmJXbHVMQ0IwYUdsekxsOXRZWGdwTzF4eVhHNGdJSEpsZEhWeWJpQnVPMXh5WEc1OU8xeHlYRzVjY2x4dUx5b3FYSEpjYmlBcUlFbHVkR1Z5Ym1Gc0lIVndaR0YwWlNCdFpYUm9iMlFnWm05eUlHZGxibVZ5WVhScGJtY2dibVY0ZENCMllXeDFaVnh5WEc0Z0tpQkFjSEpwZG1GMFpWeHlYRzRnS2k5Y2NseHVVMmx1UjJWdVpYSmhkRzl5TG5CeWIzUnZkSGx3WlM1ZmRYQmtZWFJsSUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2RHaHBjeTVmWVc1bmJHVWdLejBnZEdocGN5NWZhVzVqY21WdFpXNTBPMXh5WEc1OU8xeHlYRzRpTENKdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUZOclpYUmphRHRjY2x4dVhISmNiblpoY2lCQ1ltOTRWR1Y0ZENBOUlISmxjWFZwY21Vb1hDSndOUzFpWW05NExXRnNhV2R1WldRdGRHVjRkRndpS1R0Y2NseHVkbUZ5SUVKaGMyVk1iMmR2VTJ0bGRHTm9JRDBnY21WeGRXbHlaU2hjSWk0dlltRnpaUzFzYjJkdkxYTnJaWFJqYUM1cWMxd2lLVHRjY2x4dVhISmNiblpoY2lCMWRHbHNjeUE5SUhKbGNYVnBjbVVvWENJdUxpOTFkR2xzYVhScFpYTXVhbk5jSWlrN1hISmNibHh5WEc1VGEyVjBZMmd1Y0hKdmRHOTBlWEJsSUQwZ1QySnFaV04wTG1OeVpXRjBaU2hDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXBPMXh5WEc1Y2NseHVablZ1WTNScGIyNGdVMnRsZEdOb0tDUnVZWFlzSUNSdVlYWk1iMmR2S1NCN1hISmNiaUFnUW1GelpVeHZaMjlUYTJWMFkyZ3VZMkZzYkNoMGFHbHpMQ0FrYm1GMkxDQWtibUYyVEc5bmJ5d2dYQ0l1TGk5bWIyNTBjeTlpYVdkZmFtOW9iaTEzWldKbWIyNTBMblIwWmx3aUtUdGNjbHh1ZlZ4eVhHNWNjbHh1VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmYjI1U1pYTnBlbVVnUFNCbWRXNWpkR2x2Ymlod0tTQjdYSEpjYmlBZ1FtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5dmJsSmxjMmw2WlM1allXeHNLSFJvYVhNc0lIQXBPMXh5WEc0Z0lIUm9hWE11WDNOd1lXTnBibWNnUFNCMWRHbHNjeTV0WVhBb2RHaHBjeTVmWm05dWRGTnBlbVVzSURJd0xDQTBNQ3dnTWl3Z05Td2dlMXh5WEc0Z0lDQWdZMnhoYlhBNklIUnlkV1VzWEhKY2JpQWdJQ0J5YjNWdVpEb2dkSEoxWlZ4eVhHNGdJSDBwTzF4eVhHNGdJQzh2SUZWd1pHRjBaU0IwYUdVZ1ltSnZlRlJsZUhRc0lIQnNZV05sSUc5MlpYSWdkR2hsSUc1aGRpQjBaWGgwSUd4dloyOGdZVzVrSUhSb1pXNGdjMmhwWm5RZ2FYUnpYSEpjYmlBZ0x5OGdZVzVqYUc5eUlHSmhZMnNnZEc4Z0tHTmxiblJsY2l3Z1kyVnVkR1Z5S1NCM2FHbHNaU0J3Y21WelpYSjJhVzVuSUhSb1pTQjBaWGgwSUhCdmMybDBhVzl1WEhKY2JpQWdkR2hwY3k1ZlltSnZlRlJsZUhSY2NseHVJQ0FnSUM1elpYUlVaWGgwS0hSb2FYTXVYM1JsZUhRcFhISmNiaUFnSUNBdWMyVjBWR1Y0ZEZOcGVtVW9kR2hwY3k1ZlptOXVkRk5wZW1VcFhISmNiaUFnSUNBdWMyVjBRVzVqYUc5eUtFSmliM2hVWlhoMExrRk1TVWRPTGtKUFdGOU1SVVpVTENCQ1ltOTRWR1Y0ZEM1Q1FWTkZURWxPUlM1QlRGQklRVUpGVkVsREtWeHlYRzRnSUNBZ0xuTmxkRkJ2YzJsMGFXOXVLSFJvYVhNdVgzUmxlSFJQWm1aelpYUXViR1ZtZEN3Z2RHaHBjeTVmZEdWNGRFOW1abk5sZEM1MGIzQXBYSEpjYmlBZ0lDQXVjMlYwUVc1amFHOXlLRUppYjNoVVpYaDBMa0ZNU1VkT0xrSlBXRjlEUlU1VVJWSXNJRUppYjNoVVpYaDBMa0pCVTBWTVNVNUZMa0pQV0Y5RFJVNVVSVklzSUhSeWRXVXBPMXh5WEc0Z0lIUm9hWE11WDJSeVlYZFRkR0YwYVc5dVlYSjVURzluYnlod0tUdGNjbHh1SUNCMGFHbHpMbDlqWVd4amRXeGhkR1ZEYVhKamJHVnpLSEFwTzF4eVhHNGdJSFJvYVhNdVgybHpSbWx5YzNSR2NtRnRaU0E5SUhSeWRXVTdYSEpjYm4wN1hISmNibHh5WEc1VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5a2NtRjNVM1JoZEdsdmJtRnllVXh2WjI4Z1BTQm1kVzVqZEdsdmJpaHdLU0I3WEhKY2JpQWdjQzVpWVdOclozSnZkVzVrS0RJMU5TazdYSEpjYmlBZ2NDNXpkSEp2YTJVb01qVTFLVHRjY2x4dUlDQndMbVpwYkd3b1hDSWpNRUV3TURCQlhDSXBPMXh5WEc0Z0lIQXVjM1J5YjJ0bFYyVnBaMmgwS0RJcE8xeHlYRzRnSUhSb2FYTXVYMkppYjNoVVpYaDBMbVJ5WVhjb0tUdGNjbHh1ZlR0Y2NseHVYSEpjYmxOclpYUmphQzV3Y205MGIzUjVjR1V1WDNObGRIVndJRDBnWm5WdVkzUnBiMjRvY0NrZ2UxeHlYRzRnSUVKaGMyVk1iMmR2VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmYzJWMGRYQXVZMkZzYkNoMGFHbHpMQ0J3S1R0Y2NseHVYSEpjYmlBZ0x5OGdRM0psWVhSbElHRWdRbUp2ZUVGc2FXZHVaV1JVWlhoMElHbHVjM1JoYm1ObElIUm9ZWFFnZDJsc2JDQmlaU0IxYzJWa0lHWnZjaUJrY21GM2FXNW5JR0Z1WkZ4eVhHNGdJQzh2SUhKdmRHRjBhVzVuSUhSbGVIUmNjbHh1SUNCMGFHbHpMbDlpWW05NFZHVjRkQ0E5SUc1bGR5QkNZbTk0VkdWNGRDaDBhR2x6TGw5bWIyNTBMQ0IwYUdsekxsOTBaWGgwTENCMGFHbHpMbDltYjI1MFUybDZaU3dnTUN3Z01Dd2djQ2s3WEhKY2JseHlYRzRnSUM4dklFaGhibVJzWlNCMGFHVWdhVzVwZEdsaGJDQnpaWFIxY0NCaWVTQjBjbWxuWjJWeWFXNW5JR0VnY21WemFYcGxYSEpjYmlBZ2RHaHBjeTVmYjI1U1pYTnBlbVVvY0NrN1hISmNibHh5WEc0Z0lDOHZJRVJ5WVhjZ2RHaGxJSE4wWVhScGIyNWhjbmtnYkc5bmIxeHlYRzRnSUhSb2FYTXVYMlJ5WVhkVGRHRjBhVzl1WVhKNVRHOW5ieWh3S1R0Y2NseHVYSEpjYmlBZ2RHaHBjeTVmWTJGc1kzVnNZWFJsUTJseVkyeGxjeWh3S1R0Y2NseHVmVHRjY2x4dVhISmNibE5yWlhSamFDNXdjbTkwYjNSNWNHVXVYMk5oYkdOMWJHRjBaVU5wY21Oc1pYTWdQU0JtZFc1amRHbHZiaWh3S1NCN1hISmNiaUFnTHk4Z1ZFOUVUem9nUkc5dUozUWdibVZsWkNCQlRFd2dkR2hsSUhCcGVHVnNjeTRnVkdocGN5QmpiM1ZzWkNCb1lYWmxJR0Z1SUc5bVpuTmpjbVZsYmlCeVpXNWtaWEpsY2x4eVhHNGdJQzh2SUhSb1lYUWdhWE1nYW5WemRDQmlhV2NnWlc1dmRXZG9JSFJ2SUdacGRDQjBhR1VnZEdWNGRDNWNjbHh1SUNBdkx5Qk1iMjl3SUc5MlpYSWdkR2hsSUhCcGVHVnNjeUJwYmlCMGFHVWdkR1Y0ZENkeklHSnZkVzVrYVc1bklHSnZlQ0IwYnlCellXMXdiR1VnZEdobElIZHZjbVJjY2x4dUlDQjJZWElnWW1KdmVDQTlJSFJvYVhNdVgySmliM2hVWlhoMExtZGxkRUppYjNnb0tUdGNjbHh1SUNCMllYSWdjM1JoY25SWUlEMGdUV0YwYUM1bWJHOXZjaWhOWVhSb0xtMWhlQ2hpWW05NExuZ2dMU0ExTENBd0tTazdYSEpjYmlBZ2RtRnlJR1Z1WkZnZ1BTQk5ZWFJvTG1ObGFXd29UV0YwYUM1dGFXNG9ZbUp2ZUM1NElDc2dZbUp2ZUM1M0lDc2dOU3dnY0M1M2FXUjBhQ2twTzF4eVhHNGdJSFpoY2lCemRHRnlkRmtnUFNCTllYUm9MbVpzYjI5eUtFMWhkR2d1YldGNEtHSmliM2d1ZVNBdElEVXNJREFwS1R0Y2NseHVJQ0IyWVhJZ1pXNWtXU0E5SUUxaGRHZ3VZMlZwYkNoTllYUm9MbTFwYmloaVltOTRMbmtnS3lCaVltOTRMbWdnS3lBMUxDQndMbWhsYVdkb2RDa3BPMXh5WEc0Z0lIQXViRzloWkZCcGVHVnNjeWdwTzF4eVhHNGdJSEF1Y0dsNFpXeEVaVzV6YVhSNUtERXBPMXh5WEc0Z0lIUm9hWE11WDJOcGNtTnNaWE1nUFNCYlhUdGNjbHh1SUNCbWIzSWdLSFpoY2lCNUlEMGdjM1JoY25SWk95QjVJRHdnWlc1a1dUc2dlU0FyUFNCMGFHbHpMbDl6Y0dGamFXNW5LU0I3WEhKY2JpQWdJQ0JtYjNJZ0tIWmhjaUI0SUQwZ2MzUmhjblJZT3lCNElEd2daVzVrV0RzZ2VDQXJQU0IwYUdsekxsOXpjR0ZqYVc1bktTQjdYSEpjYmlBZ0lDQWdJSFpoY2lCcElEMGdOQ0FxSUNoNUlDb2djQzUzYVdSMGFDQXJJSGdwTzF4eVhHNGdJQ0FnSUNCMllYSWdjaUE5SUhBdWNHbDRaV3h6VzJsZE8xeHlYRzRnSUNBZ0lDQjJZWElnWnlBOUlIQXVjR2w0Wld4elcya2dLeUF4WFR0Y2NseHVJQ0FnSUNBZ2RtRnlJR0lnUFNCd0xuQnBlR1ZzYzF0cElDc2dNbDA3WEhKY2JpQWdJQ0FnSUhaaGNpQmhJRDBnY0M1d2FYaGxiSE5iYVNBcklETmRPMXh5WEc0Z0lDQWdJQ0IyWVhJZ1l5QTlJSEF1WTI5c2IzSW9jaXdnWnl3Z1lpd2dZU2s3WEhKY2JpQWdJQ0FnSUdsbUlDaHdMbk5oZEhWeVlYUnBiMjRvWXlrZ1BpQXdLU0I3WEhKY2JpQWdJQ0FnSUNBZ2RHaHBjeTVmWTJseVkyeGxjeTV3ZFhOb0tIdGNjbHh1SUNBZ0lDQWdJQ0FnSUhnNklIZ2dLeUJ3TG5KaGJtUnZiU2d0TWlBdklETWdLaUIwYUdsekxsOXpjR0ZqYVc1bkxDQXlJQzhnTXlBcUlIUm9hWE11WDNOd1lXTnBibWNwTEZ4eVhHNGdJQ0FnSUNBZ0lDQWdlVG9nZVNBcklIQXVjbUZ1Wkc5dEtDMHlJQzhnTXlBcUlIUm9hWE11WDNOd1lXTnBibWNzSURJZ0x5QXpJQ29nZEdocGN5NWZjM0JoWTJsdVp5a3NYSEpjYmlBZ0lDQWdJQ0FnSUNCamIyeHZjam9nY0M1amIyeHZjaWhjSWlNd05rWkdSa1pjSWlsY2NseHVJQ0FnSUNBZ0lDQjlLVHRjY2x4dUlDQWdJQ0FnSUNCMGFHbHpMbDlqYVhKamJHVnpMbkIxYzJnb2UxeHlYRzRnSUNBZ0lDQWdJQ0FnZURvZ2VDQXJJSEF1Y21GdVpHOXRLQzB5SUM4Z015QXFJSFJvYVhNdVgzTndZV05wYm1jc0lESWdMeUF6SUNvZ2RHaHBjeTVmYzNCaFkybHVaeWtzWEhKY2JpQWdJQ0FnSUNBZ0lDQjVPaUI1SUNzZ2NDNXlZVzVrYjIwb0xUSWdMeUF6SUNvZ2RHaHBjeTVmYzNCaFkybHVaeXdnTWlBdklETWdLaUIwYUdsekxsOXpjR0ZqYVc1bktTeGNjbHh1SUNBZ0lDQWdJQ0FnSUdOdmJHOXlPaUJ3TG1OdmJHOXlLRndpSTBaRk1EQkdSVndpS1Z4eVhHNGdJQ0FnSUNBZ0lIMHBPMXh5WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYMk5wY21Oc1pYTXVjSFZ6YUNoN1hISmNiaUFnSUNBZ0lDQWdJQ0I0T2lCNElDc2djQzV5WVc1a2IyMG9MVElnTHlBeklDb2dkR2hwY3k1ZmMzQmhZMmx1Wnl3Z01pQXZJRE1nS2lCMGFHbHpMbDl6Y0dGamFXNW5LU3hjY2x4dUlDQWdJQ0FnSUNBZ0lIazZJSGtnS3lCd0xuSmhibVJ2YlNndE1pQXZJRE1nS2lCMGFHbHpMbDl6Y0dGamFXNW5MQ0F5SUM4Z015QXFJSFJvYVhNdVgzTndZV05wYm1jcExGeHlYRzRnSUNBZ0lDQWdJQ0FnWTI5c2IzSTZJSEF1WTI5c2IzSW9YQ0lqUmtaR1JqQTBYQ0lwWEhKY2JpQWdJQ0FnSUNBZ2ZTazdYSEpjYmlBZ0lDQWdJSDFjY2x4dUlDQWdJSDFjY2x4dUlDQjlYSEpjYm4wN1hISmNibHh5WEc1VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5a2NtRjNJRDBnWm5WdVkzUnBiMjRvY0NrZ2UxeHlYRzRnSUVKaGMyVk1iMmR2VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmWkhKaGR5NWpZV3hzS0hSb2FYTXNJSEFwTzF4eVhHNGdJR2xtSUNnaGRHaHBjeTVmYVhOTmIzVnpaVTkyWlhJZ2ZId2dJWFJvYVhNdVgybHpUM1psY2s1aGRreHZaMjhwSUhKbGRIVnlianRjY2x4dVhISmNiaUFnTHk4Z1YyaGxiaUIwYUdVZ2RHVjRkQ0JwY3lCaFltOTFkQ0IwYnlCaVpXTnZiV1VnWVdOMGFYWmxJR1p2Y2lCMGFHVWdabWx5YzNRZ2RHbHRaU3dnWTJ4bFlYSmNjbHh1SUNBdkx5QjBhR1VnYzNSaGRHbHZibUZ5ZVNCc2IyZHZJSFJvWVhRZ2QyRnpJSEJ5WlhacGIzVnpiSGtnWkhKaGQyNHVYSEpjYmlBZ2FXWWdLSFJvYVhNdVgybHpSbWx5YzNSR2NtRnRaU2tnZTF4eVhHNGdJQ0FnY0M1aVlXTnJaM0p2ZFc1a0tESTFOU2s3WEhKY2JpQWdJQ0IwYUdsekxsOXBjMFpwY25OMFJuSmhiV1VnUFNCbVlXeHpaVHRjY2x4dUlDQjlYSEpjYmx4eVhHNGdJQzh2SUVOc1pXRnlYSEpjYmlBZ2NDNWliR1Z1WkUxdlpHVW9jQzVDVEVWT1JDazdYSEpjYmlBZ2NDNWlZV05yWjNKdmRXNWtLREkxTlNrN1hISmNibHh5WEc0Z0lDOHZJRVJ5WVhjZ1hDSm9ZV3htZEc5dVpWd2lJR3h2WjI5Y2NseHVJQ0J3TG01dlUzUnliMnRsS0NrN1hISmNiaUFnY0M1aWJHVnVaRTF2WkdVb2NDNU5WVXhVU1ZCTVdTazdYSEpjYmx4eVhHNGdJSFpoY2lCdFlYaEVhWE4wSUQwZ2RHaHBjeTVmWW1KdmVGUmxlSFF1YUdGc1psZHBaSFJvTzF4eVhHNGdJSFpoY2lCdFlYaFNZV1JwZFhNZ1BTQXlJQ29nZEdocGN5NWZjM0JoWTJsdVp6dGNjbHh1WEhKY2JpQWdabTl5SUNoMllYSWdhU0E5SURBN0lHa2dQQ0IwYUdsekxsOWphWEpqYkdWekxteGxibWQwYURzZ2FTQXJQU0F4S1NCN1hISmNiaUFnSUNCMllYSWdZMmx5WTJ4bElEMGdkR2hwY3k1ZlkybHlZMnhsYzF0cFhUdGNjbHh1SUNBZ0lIWmhjaUJqSUQwZ1kybHlZMnhsTG1OdmJHOXlPMXh5WEc0Z0lDQWdkbUZ5SUdScGMzUWdQU0J3TG1ScGMzUW9ZMmx5WTJ4bExuZ3NJR05wY21Oc1pTNTVMQ0J3TG0xdmRYTmxXQ3dnY0M1dGIzVnpaVmtwTzF4eVhHNGdJQ0FnZG1GeUlISmhaR2wxY3lBOUlIVjBhV3h6TG0xaGNDaGthWE4wTENBd0xDQnRZWGhFYVhOMExDQXhMQ0J0WVhoU1lXUnBkWE1zSUhzZ1kyeGhiWEE2SUhSeWRXVWdmU2s3WEhKY2JpQWdJQ0J3TG1acGJHd29ZeWs3WEhKY2JpQWdJQ0J3TG1Wc2JHbHdjMlVvWTJseVkyeGxMbmdzSUdOcGNtTnNaUzU1TENCeVlXUnBkWE1zSUhKaFpHbDFjeWs3WEhKY2JpQWdmVnh5WEc1OU8xeHlYRzRpTENKdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUZOclpYUmphRHRjY2x4dVhISmNiblpoY2lCT2IybHpaU0E5SUhKbGNYVnBjbVVvWENJdUwyZGxibVZ5WVhSdmNuTXZibTlwYzJVdFoyVnVaWEpoZEc5eWN5NXFjMXdpS1R0Y2NseHVkbUZ5SUVKaWIzaFVaWGgwSUQwZ2NtVnhkV2x5WlNoY0luQTFMV0ppYjNndFlXeHBaMjVsWkMxMFpYaDBYQ0lwTzF4eVhHNTJZWElnUW1GelpVeHZaMjlUYTJWMFkyZ2dQU0J5WlhGMWFYSmxLRndpTGk5aVlYTmxMV3h2WjI4dGMydGxkR05vTG1welhDSXBPMXh5WEc1Y2NseHVVMnRsZEdOb0xuQnliM1J2ZEhsd1pTQTlJRTlpYW1WamRDNWpjbVZoZEdVb1FtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsS1R0Y2NseHVYSEpjYm1aMWJtTjBhVzl1SUZOclpYUmphQ2drYm1GMkxDQWtibUYyVEc5bmJ5a2dlMXh5WEc0Z0lFSmhjMlZNYjJkdlUydGxkR05vTG1OaGJHd29kR2hwY3l3Z0pHNWhkaXdnSkc1aGRreHZaMjhzSUZ3aUxpNHZabTl1ZEhNdlltbG5YMnB2YUc0dGQyVmlabTl1ZEM1MGRHWmNJaWs3WEhKY2JuMWNjbHh1WEhKY2JsTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgyOXVVbVZ6YVhwbElEMGdablZ1WTNScGIyNG9jQ2tnZTF4eVhHNGdJRUpoYzJWTWIyZHZVMnRsZEdOb0xuQnliM1J2ZEhsd1pTNWZiMjVTWlhOcGVtVXVZMkZzYkNoMGFHbHpMQ0J3S1R0Y2NseHVJQ0F2THlCVmNHUmhkR1VnZEdobElHSmliM2hVWlhoMExDQndiR0ZqWlNCdmRtVnlJSFJvWlNCdVlYWWdkR1Y0ZENCc2IyZHZJR0Z1WkNCMGFHVnVJSE5vYVdaMElHbDBjMXh5WEc0Z0lDOHZJR0Z1WTJodmNpQmlZV05ySUhSdklDaGpaVzUwWlhJc0lHTmxiblJsY2lrZ2QyaHBiR1VnY0hKbGMyVnlkbWx1WnlCMGFHVWdkR1Y0ZENCd2IzTnBkR2x2Ymx4eVhHNGdJSFJvYVhNdVgySmliM2hVWlhoMFhISmNiaUFnSUNBdWMyVjBWR1Y0ZENoMGFHbHpMbDkwWlhoMEtWeHlYRzRnSUNBZ0xuTmxkRlJsZUhSVGFYcGxLSFJvYVhNdVgyWnZiblJUYVhwbEtWeHlYRzRnSUNBZ0xuTmxkRkp2ZEdGMGFXOXVLREFwWEhKY2JpQWdJQ0F1YzJWMFFXNWphRzl5S0VKaWIzaFVaWGgwTGtGTVNVZE9Ma0pQV0Y5TVJVWlVMQ0JDWW05NFZHVjRkQzVDUVZORlRFbE9SUzVCVEZCSVFVSkZWRWxES1Z4eVhHNGdJQ0FnTG5ObGRGQnZjMmwwYVc5dUtIUm9hWE11WDNSbGVIUlBabVp6WlhRdWJHVm1kQ3dnZEdocGN5NWZkR1Y0ZEU5bVpuTmxkQzUwYjNBcFhISmNiaUFnSUNBdWMyVjBRVzVqYUc5eUtFSmliM2hVWlhoMExrRk1TVWRPTGtKUFdGOURSVTVVUlZJc0lFSmliM2hVWlhoMExrSkJVMFZNU1U1RkxrSlBXRjlEUlU1VVJWSXNJSFJ5ZFdVcE8xeHlYRzRnSUhSb2FYTXVYM1JsZUhSUWIzTWdQU0IwYUdsekxsOWlZbTk0VkdWNGRDNW5aWFJRYjNOcGRHbHZiaWdwTzF4eVhHNGdJSFJvYVhNdVgyUnlZWGRUZEdGMGFXOXVZWEo1VEc5bmJ5aHdLVHRjY2x4dUlDQjBhR2x6TGw5cGMwWnBjbk4wUm5KaGJXVWdQU0IwY25WbE8xeHlYRzU5TzF4eVhHNWNjbHh1VTJ0bGRHTm9MbkJ5YjNSdmRIbHdaUzVmWkhKaGQxTjBZWFJwYjI1aGNubE1iMmR2SUQwZ1puVnVZM1JwYjI0b2NDa2dlMXh5WEc0Z0lIQXVZbUZqYTJkeWIzVnVaQ2d5TlRVcE8xeHlYRzRnSUhBdWMzUnliMnRsS0RJMU5TazdYSEpjYmlBZ2NDNW1hV3hzS0Z3aUl6QkJNREF3UVZ3aUtUdGNjbHh1SUNCd0xuTjBjbTlyWlZkbGFXZG9kQ2d5S1R0Y2NseHVJQ0IwYUdsekxsOWlZbTk0VkdWNGRDNWtjbUYzS0NrN1hISmNibjA3WEhKY2JseHlYRzVUYTJWMFkyZ3VjSEp2ZEc5MGVYQmxMbDl6WlhSMWNDQTlJR1oxYm1OMGFXOXVLSEFwSUh0Y2NseHVJQ0JDWVhObFRHOW5iMU5yWlhSamFDNXdjbTkwYjNSNWNHVXVYM05sZEhWd0xtTmhiR3dvZEdocGN5d2djQ2s3WEhKY2JseHlYRzRnSUM4dklFTnlaV0YwWlNCaElFSmliM2hCYkdsbmJtVmtWR1Y0ZENCcGJuTjBZVzVqWlNCMGFHRjBJSGRwYkd3Z1ltVWdkWE5sWkNCbWIzSWdaSEpoZDJsdVp5QmhibVJjY2x4dUlDQXZMeUJ5YjNSaGRHbHVaeUIwWlhoMFhISmNiaUFnZEdocGN5NWZZbUp2ZUZSbGVIUWdQU0J1WlhjZ1FtSnZlRlJsZUhRb2RHaHBjeTVmWm05dWRDd2dkR2hwY3k1ZmRHVjRkQ3dnZEdocGN5NWZabTl1ZEZOcGVtVXNJREFzSURBc0lIQXBPMXh5WEc1Y2NseHVJQ0F2THlCSVlXNWtiR1VnZEdobElHbHVhWFJwWVd3Z2MyVjBkWEFnWW5rZ2RISnBaMmRsY21sdVp5QmhJSEpsYzJsNlpWeHlYRzRnSUhSb2FYTXVYMjl1VW1WemFYcGxLSEFwTzF4eVhHNWNjbHh1SUNBdkx5QlRaWFFnZFhBZ2JtOXBjMlVnWjJWdVpYSmhkRzl5YzF4eVhHNGdJSFJvYVhNdVgzSnZkR0YwYVc5dVRtOXBjMlVnUFNCdVpYY2dUbTlwYzJVdVRtOXBjMlZIWlc1bGNtRjBiM0l4UkNod0xDQXRjQzVRU1NBdklEUXNJSEF1VUVrZ0x5QTBMQ0F3TGpBeUtUdGNjbHh1SUNCMGFHbHpMbDk0ZVU1dmFYTmxJRDBnYm1WM0lFNXZhWE5sTGs1dmFYTmxSMlZ1WlhKaGRHOXlNa1FvY0N3Z0xURXdNQ3dnTVRBd0xDQXROVEFzSURVd0xDQXdMakF4TENBd0xqQXhLVHRjY2x4dWZUdGNjbHh1WEhKY2JsTnJaWFJqYUM1d2NtOTBiM1I1Y0dVdVgyUnlZWGNnUFNCbWRXNWpkR2x2Ymlod0tTQjdYSEpjYmlBZ1FtRnpaVXh2WjI5VGEyVjBZMmd1Y0hKdmRHOTBlWEJsTGw5a2NtRjNMbU5oYkd3b2RHaHBjeXdnY0NrN1hISmNiaUFnYVdZZ0tDRjBhR2x6TGw5cGMwMXZkWE5sVDNabGNpQjhmQ0FoZEdocGN5NWZhWE5QZG1WeVRtRjJURzluYnlrZ2NtVjBkWEp1TzF4eVhHNWNjbHh1SUNBdkx5QlhhR1Z1SUhSb1pTQjBaWGgwSUdseklHRmliM1YwSUhSdklHSmxZMjl0WlNCaFkzUnBkbVVnWm05eUlIUm9aU0JtYVhKemRDQjBhVzFsTENCamJHVmhjbHh5WEc0Z0lDOHZJSFJvWlNCemRHRjBhVzl1WVhKNUlHeHZaMjhnZEdoaGRDQjNZWE1nY0hKbGRtbHZkWE5zZVNCa2NtRjNiaTVjY2x4dUlDQnBaaUFvZEdocGN5NWZhWE5HYVhKemRFWnlZVzFsS1NCN1hISmNiaUFnSUNCd0xtSmhZMnRuY205MWJtUW9NalUxS1R0Y2NseHVJQ0FnSUhSb2FYTXVYMmx6Um1seWMzUkdjbUZ0WlNBOUlHWmhiSE5sTzF4eVhHNGdJSDFjY2x4dVhISmNiaUFnTHk4Z1EyRnNZM1ZzWVhSbElIQnZjMmwwYVc5dUlHRnVaQ0J5YjNSaGRHbHZiaUIwYnlCamNtVmhkR1VnWVNCcWFYUjBaWEo1SUd4dloyOWNjbHh1SUNCMllYSWdjbTkwWVhScGIyNGdQU0IwYUdsekxsOXliM1JoZEdsdmJrNXZhWE5sTG1kbGJtVnlZWFJsS0NrN1hISmNiaUFnZG1GeUlIaDVUMlptYzJWMElEMGdkR2hwY3k1ZmVIbE9iMmx6WlM1blpXNWxjbUYwWlNncE8xeHlYRzRnSUhSb2FYTXVYMkppYjNoVVpYaDBYSEpjYmlBZ0lDQXVjMlYwVW05MFlYUnBiMjRvY205MFlYUnBiMjRwWEhKY2JpQWdJQ0F1YzJWMFVHOXphWFJwYjI0b2RHaHBjeTVmZEdWNGRGQnZjeTU0SUNzZ2VIbFBabVp6WlhRdWVDd2dkR2hwY3k1ZmRHVjRkRkJ2Y3k1NUlDc2dlSGxQWm1aelpYUXVlU2xjY2x4dUlDQWdJQzVrY21GM0tDazdYSEpjYm4wN1hISmNiaUlzSW0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnVFdGcGJrNWhkanRjY2x4dVhISmNibVoxYm1OMGFXOXVJRTFoYVc1T1lYWW9iRzloWkdWeUtTQjdYSEpjYmlBZ2RHaHBjeTVmYkc5aFpHVnlJRDBnYkc5aFpHVnlPMXh5WEc0Z0lIUm9hWE11WHlSc2IyZHZJRDBnSkNoY0ltNWhkaTV1WVhaaVlYSWdMbTVoZG1KaGNpMWljbUZ1WkZ3aUtUdGNjbHh1SUNCMGFHbHpMbDhrYm1GMklEMGdKQ2hjSWlOdFlXbHVMVzVoZGx3aUtUdGNjbHh1SUNCMGFHbHpMbDhrYm1GMlRHbHVhM01nUFNCMGFHbHpMbDhrYm1GMkxtWnBibVFvWENKaFhDSXBPMXh5WEc0Z0lIUm9hWE11WHlSaFkzUnBkbVZPWVhZZ1BTQjBhR2x6TGw4a2JtRjJUR2x1YTNNdVptbHVaQ2hjSWk1aFkzUnBkbVZjSWlrN1hISmNiaUFnZEdocGN5NWZKRzVoZGt4cGJtdHpMbTl1S0Z3aVkyeHBZMnRjSWl3Z2RHaHBjeTVmYjI1T1lYWkRiR2xqYXk1aWFXNWtLSFJvYVhNcEtUdGNjbHh1SUNCMGFHbHpMbDhrYkc5bmJ5NXZiaWhjSW1Oc2FXTnJYQ0lzSUhSb2FYTXVYMjl1VEc5bmIwTnNhV05yTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzU5WEhKY2JseHlYRzVOWVdsdVRtRjJMbkJ5YjNSdmRIbHdaUzV6WlhSQlkzUnBkbVZHY205dFZYSnNJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnZEdocGN5NWZaR1ZoWTNScGRtRjBaU2dwTzF4eVhHNGdJSFpoY2lCMWNtd2dQU0JzYjJOaGRHbHZiaTV3WVhSb2JtRnRaVHRjY2x4dUlDQnBaaUFvZFhKc0lEMDlQU0JjSWk5cGJtUmxlQzVvZEcxc1hDSWdmSHdnZFhKc0lEMDlQU0JjSWk5Y0lpa2dlMXh5WEc0Z0lDQWdkR2hwY3k1ZllXTjBhWFpoZEdWTWFXNXJLSFJvYVhNdVh5UnVZWFpNYVc1cmN5NW1hV3gwWlhJb1hDSWpZV0p2ZFhRdGJHbHVhMXdpS1NrN1hISmNiaUFnZlNCbGJITmxJR2xtSUNoMWNtd2dQVDA5SUZ3aUwzZHZjbXN1YUhSdGJGd2lLU0I3WEhKY2JpQWdJQ0IwYUdsekxsOWhZM1JwZG1GMFpVeHBibXNvZEdocGN5NWZKRzVoZGt4cGJtdHpMbVpwYkhSbGNpaGNJaU4zYjNKckxXeHBibXRjSWlrcE8xeHlYRzRnSUgwZ1pXeHpaU0JwWmlBb2RYSnNJRDA5UFNCY0lpOWliRzluTG1oMGJXeGNJaWtnZTF4eVhHNGdJQ0FnZEdocGN5NWZZV04wYVhaaGRHVk1hVzVyS0hSb2FYTXVYeVJ1WVhaTWFXNXJjeTVtYVd4MFpYSW9YQ0lqWW14dlp5MXNhVzVyWENJcEtUdGNjbHh1SUNCOUlHVnNjMlVnYVdZZ0tIVnliQ0E5UFQwZ1hDSXZZMjl1ZEdGamRDNW9kRzFzWENJcElIdGNjbHh1SUNBZ0lIUm9hWE11WDJGamRHbDJZWFJsVEdsdWF5aDBhR2x6TGw4a2JtRjJUR2x1YTNNdVptbHNkR1Z5S0Z3aUkyTnZiblJoWTNRdGJHbHVhMXdpS1NrN1hISmNiaUFnZlZ4eVhHNTlPMXh5WEc1Y2NseHVUV0ZwYms1aGRpNXdjbTkwYjNSNWNHVXVYMlJsWVdOMGFYWmhkR1VnUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNCcFppQW9kR2hwY3k1ZkpHRmpkR2wyWlU1aGRpNXNaVzVuZEdncElIdGNjbHh1SUNBZ0lIUm9hWE11WHlSaFkzUnBkbVZPWVhZdWNtVnRiM1psUTJ4aGMzTW9YQ0poWTNScGRtVmNJaWs3WEhKY2JpQWdJQ0IwYUdsekxsOGtZV04wYVhabFRtRjJJRDBnSkNncE8xeHlYRzRnSUgxY2NseHVmVHRjY2x4dVhISmNiazFoYVc1T1lYWXVjSEp2ZEc5MGVYQmxMbDloWTNScGRtRjBaVXhwYm1zZ1BTQm1kVzVqZEdsdmJpZ2tiR2x1YXlrZ2UxeHlYRzRnSUNSc2FXNXJMbUZrWkVOc1lYTnpLRndpWVdOMGFYWmxYQ0lwTzF4eVhHNGdJSFJvYVhNdVh5UmhZM1JwZG1WT1lYWWdQU0FrYkdsdWF6dGNjbHh1ZlR0Y2NseHVYSEpjYmsxaGFXNU9ZWFl1Y0hKdmRHOTBlWEJsTGw5dmJreHZaMjlEYkdsamF5QTlJR1oxYm1OMGFXOXVLR1VwSUh0Y2NseHVJQ0JsTG5CeVpYWmxiblJFWldaaGRXeDBLQ2s3WEhKY2JpQWdkbUZ5SUNSMFlYSm5aWFFnUFNBa0tHVXVZM1Z5Y21WdWRGUmhjbWRsZENrN1hISmNiaUFnZG1GeUlIVnliQ0E5SUNSMFlYSm5aWFF1WVhSMGNpaGNJbWh5WldaY0lpazdYSEpjYmlBZ2RHaHBjeTVmYkc5aFpHVnlMbXh2WVdSUVlXZGxLSFZ5YkN3Z2UzMHNJSFJ5ZFdVcE8xeHlYRzU5TzF4eVhHNWNjbHh1VFdGcGJrNWhkaTV3Y205MGIzUjVjR1V1WDI5dVRtRjJRMnhwWTJzZ1BTQm1kVzVqZEdsdmJpaGxLU0I3WEhKY2JpQWdaUzV3Y21WMlpXNTBSR1ZtWVhWc2RDZ3BPMXh5WEc0Z0lIUm9hWE11WHlSdVlYWXVZMjlzYkdGd2MyVW9YQ0pvYVdSbFhDSXBPeUF2THlCRGJHOXpaU0IwYUdVZ2JtRjJJQzBnYjI1c2VTQnRZWFIwWlhKeklHOXVJRzF2WW1sc1pWeHlYRzRnSUhaaGNpQWtkR0Z5WjJWMElEMGdKQ2hsTG1OMWNuSmxiblJVWVhKblpYUXBPMXh5WEc0Z0lHbG1JQ2drZEdGeVoyVjBMbWx6S0hSb2FYTXVYeVJoWTNScGRtVk9ZWFlwS1NCeVpYUjFjbTQ3WEhKY2JpQWdkR2hwY3k1ZlpHVmhZM1JwZG1GMFpTZ3BPMXh5WEc0Z0lIUm9hWE11WDJGamRHbDJZWFJsVEdsdWF5Z2tkR0Z5WjJWMEtUdGNjbHh1SUNCMllYSWdkWEpzSUQwZ0pIUmhjbWRsZEM1aGRIUnlLRndpYUhKbFpsd2lLVHRjY2x4dUlDQjBhR2x6TGw5c2IyRmtaWEl1Ykc5aFpGQmhaMlVvZFhKc0xDQjdmU3dnZEhKMVpTazdYSEpjYm4wN1hISmNiaUlzSW5aaGNpQk1iMkZrWlhJZ1BTQnlaWEYxYVhKbEtGd2lMaTl3WVdkbExXeHZZV1JsY2k1cWMxd2lLVHRjY2x4dWRtRnlJRTFoYVc1T1lYWWdQU0J5WlhGMWFYSmxLRndpTGk5dFlXbHVMVzVoZGk1cWMxd2lLVHRjY2x4dWRtRnlJRWh2ZG1WeVUyeHBaR1Z6YUc5M2N5QTlJSEpsY1hWcGNtVW9YQ0l1TDJodmRtVnlMWE5zYVdSbGMyaHZkeTVxYzF3aUtUdGNjbHh1ZG1GeUlGQnZjblJtYjJ4cGIwWnBiSFJsY2lBOUlISmxjWFZwY21Vb1hDSXVMM0J2Y25SbWIyeHBieTFtYVd4MFpYSXVhbk5jSWlrN1hISmNiblpoY2lCemJHbGtaWE5vYjNkeklEMGdjbVZ4ZFdseVpTaGNJaTR2ZEdoMWJXSnVZV2xzTFhOc2FXUmxjMmh2ZHk5emJHbGtaWE5vYjNjdWFuTmNJaWs3WEhKY2JseHlYRzR2THlCUWFXTnJhVzVuSUdFZ2NtRnVaRzl0SUhOclpYUmphQ0IwYUdGMElIUm9aU0IxYzJWeUlHaGhjMjRuZENCelpXVnVJR0psWm05eVpWeHlYRzUyWVhJZ1UydGxkR05vSUQwZ2NtVnhkV2x5WlNoY0lpNHZjR2xqYXkxeVlXNWtiMjB0YzJ0bGRHTm9MbXB6WENJcEtDazdYSEpjYmx4eVhHNHZMeUJCU2tGWUlIQmhaMlVnYkc5aFpHVnlMQ0IzYVhSb0lHTmhiR3hpWVdOcklHWnZjaUJ5Wld4dllXUnBibWNnZDJsa1oyVjBjMXh5WEc1MllYSWdiRzloWkdWeUlEMGdibVYzSUV4dllXUmxjaWh2YmxCaFoyVk1iMkZrS1R0Y2NseHVYSEpjYmk4dklFMWhhVzRnYm1GMklIZHBaR2RsZEZ4eVhHNTJZWElnYldGcGJrNWhkaUE5SUc1bGR5Qk5ZV2x1VG1GMktHeHZZV1JsY2lrN1hISmNibHh5WEc0dkx5QkpiblJsY21GamRHbDJaU0JzYjJkdklHbHVJRzVoZG1KaGNseHlYRzUyWVhJZ2JtRjJJRDBnSkNoY0ltNWhkaTV1WVhaaVlYSmNJaWs3WEhKY2JuWmhjaUJ1WVhaTWIyZHZJRDBnYm1GMkxtWnBibVFvWENJdWJtRjJZbUZ5TFdKeVlXNWtYQ0lwTzF4eVhHNXVaWGNnVTJ0bGRHTm9LRzVoZGl3Z2JtRjJURzluYnlrN1hISmNibHh5WEc0dkx5QlhhV1JuWlhRZ1oyeHZZbUZzYzF4eVhHNTJZWElnY0c5eWRHWnZiR2x2Um1sc2RHVnlPMXh5WEc1Y2NseHVMeThnVEc5aFpDQmhiR3dnZDJsa1oyVjBjMXh5WEc1dmJsQmhaMlZNYjJGa0tDazdYSEpjYmx4eVhHNHZMeUJJWVc1a2JHVWdZbUZqYXk5bWIzSjNZWEprSUdKMWRIUnZibk5jY2x4dWQybHVaRzkzTG1Ga1pFVjJaVzUwVEdsemRHVnVaWElvWENKd2IzQnpkR0YwWlZ3aUxDQnZibEJ2Y0ZOMFlYUmxLVHRjY2x4dVhISmNibVoxYm1OMGFXOXVJRzl1VUc5d1UzUmhkR1VvWlNrZ2UxeHlYRzRnSUM4dklFeHZZV1JsY2lCemRHOXlaWE1nWTNWemRHOXRJR1JoZEdFZ2FXNGdkR2hsSUhOMFlYUmxJQzBnYVc1amJIVmthVzVuSUhSb1pTQjFjbXdnWVc1a0lIUm9aU0J4ZFdWeWVWeHlYRzRnSUhaaGNpQjFjbXdnUFNBb1pTNXpkR0YwWlNBbUppQmxMbk4wWVhSbExuVnliQ2tnZkh3Z1hDSXZhVzVrWlhndWFIUnRiRndpTzF4eVhHNGdJSFpoY2lCeGRXVnllVTlpYW1WamRDQTlJQ2hsTG5OMFlYUmxJQ1ltSUdVdWMzUmhkR1V1Y1hWbGNua3BJSHg4SUh0OU8xeHlYRzVjY2x4dUlDQnBaaUFvZFhKc0lEMDlQU0JzYjJGa1pYSXVaMlYwVEc5aFpHVmtVR0YwYUNncElDWW1JSFZ5YkNBOVBUMGdYQ0l2ZDI5eWF5NW9kRzFzWENJcElIdGNjbHh1SUNBZ0lDOHZJRlJvWlNCamRYSnlaVzUwSUNZZ2NISmxkbWx2ZFhNZ2JHOWhaR1ZrSUhOMFlYUmxjeUIzWlhKbElIZHZjbXN1YUhSdGJDd2djMjhnYW5WemRDQnlaV1pwYkhSbGNseHlYRzRnSUNBZ2RtRnlJR05oZEdWbmIzSjVJRDBnY1hWbGNubFBZbXBsWTNRdVkyRjBaV2R2Y25rZ2ZId2dYQ0poYkd4Y0lqdGNjbHh1SUNBZ0lIQnZjblJtYjJ4cGIwWnBiSFJsY2k1elpXeGxZM1JEWVhSbFoyOXllU2hqWVhSbFoyOXllU2s3WEhKY2JpQWdmU0JsYkhObElIdGNjbHh1SUNBZ0lDOHZJRXh2WVdRZ2RHaGxJRzVsZHlCd1lXZGxYSEpjYmlBZ0lDQnNiMkZrWlhJdWJHOWhaRkJoWjJVb2RYSnNMQ0I3ZlN3Z1ptRnNjMlVwTzF4eVhHNGdJSDFjY2x4dWZWeHlYRzVjY2x4dVpuVnVZM1JwYjI0Z2IyNVFZV2RsVEc5aFpDZ3BJSHRjY2x4dUlDQXZMeUJTWld4dllXUWdZV3hzSUhCc2RXZHBibk12ZDJsa1oyVjBjMXh5WEc0Z0lHNWxkeUJJYjNabGNsTnNhV1JsYzJodmQzTW9LVHRjY2x4dUlDQndiM0owWm05c2FXOUdhV3gwWlhJZ1BTQnVaWGNnVUc5eWRHWnZiR2x2Um1sc2RHVnlLR3h2WVdSbGNpazdYSEpjYmlBZ2MyeHBaR1Z6YUc5M2N5NXBibWwwS0NrN1hISmNiaUFnYjJKcVpXTjBSbWwwU1cxaFoyVnpLQ2s3WEhKY2JpQWdjMjFoY25SeGRXOTBaWE1vS1R0Y2NseHVYSEpjYmlBZ0x5OGdVbVZrYVhKbFkzUWdaR0YwWVMxcGJuUmxjbTVoYkMxc2FXNXJJR2g1Y0dWeWJHbHVhM01nZEdoeWIzVm5hQ0IwYUdVZ2JHOWhaR1Z5WEhKY2JpQWdkbUZ5SUdsdWRHVnlibUZzVEdsdWEzTWdQU0FrS0Z3aVlWdGtZWFJoTFdsdWRHVnlibUZzTFd4cGJtdGRYQ0lwTzF4eVhHNGdJR2x1ZEdWeWJtRnNUR2x1YTNNdWIyNG9YQ0pqYkdsamExd2lMQ0JtZFc1amRHbHZiaWhsZG1WdWRDa2dlMXh5WEc0Z0lDQWdaWFpsYm5RdWNISmxkbVZ1ZEVSbFptRjFiSFFvS1R0Y2NseHVJQ0FnSUd4dllXUmxjaTVzYjJGa1VHRm5aU2drS0dWMlpXNTBMbU4xY25KbGJuUlVZWEpuWlhRcExtRjBkSElvWENKb2NtVm1YQ0lwTENCN2ZTd2dkSEoxWlNrN1hISmNiaUFnZlNrN1hISmNibHh5WEc0Z0lDOHZJRk5zYVdkb2RHeDVJSEpsWkhWdVpHRnVkQ3dnWW5WMElIVndaR0YwWlNCMGFHVWdiV0ZwYmlCdVlYWWdkWE5wYm1jZ2RHaGxJR04xY25KbGJuUWdWVkpNTGlCVWFHbHpYSEpjYmlBZ0x5OGdhWE1nYVcxd2IzSjBZVzUwSUdsbUlHRWdjR0ZuWlNCcGN5QnNiMkZrWldRZ1lua2dkSGx3YVc1bklHRWdablZzYkNCVlVrd2dLR1V1Wnk0Z1oyOXBibWRjY2x4dUlDQXZMeUJrYVhKbFkzUnNlU0IwYnlBdmQyOXlheTVvZEcxc0tTQnZjaUIzYUdWdUlHMXZkbWx1WnlCbWNtOXRJSGR2Y21zdWFIUnRiQ0IwYnlCaElIQnliMnBsWTNRdVhISmNiaUFnYldGcGJrNWhkaTV6WlhSQlkzUnBkbVZHY205dFZYSnNLQ2s3WEhKY2JuMWNjbHh1WEhKY2JpOHZJRmRsSjNabElHaHBkQ0IwYUdVZ2JHRnVaR2x1WnlCd1lXZGxMQ0JzYjJGa0lIUm9aU0JoWW05MWRDQndZV2RsWEhKY2JpOHZJR2xtSUNoc2IyTmhkR2x2Ymk1d1lYUm9ibUZ0WlM1dFlYUmphQ2d2WGloY1hDOThYRnd2YVc1a1pYZ3VhSFJ0Ykh4cGJtUmxlQzVvZEcxc0tTUXZLU2tnZTF4eVhHNHZMeUFnSUNBZ2JHOWhaR1Z5TG14dllXUlFZV2RsS0Z3aUwyRmliM1YwTG1oMGJXeGNJaXdnZTMwc0lHWmhiSE5sS1R0Y2NseHVMeThnZlZ4eVhHNGlMQ0p0YjJSMWJHVXVaWGh3YjNKMGN5QTlJRXh2WVdSbGNqdGNjbHh1WEhKY2JuWmhjaUIxZEdsc2FYUnBaWE1nUFNCeVpYRjFhWEpsS0Z3aUxpOTFkR2xzYVhScFpYTXVhbk5jSWlrN1hISmNibHh5WEc1bWRXNWpkR2x2YmlCTWIyRmtaWElvYjI1U1pXeHZZV1FzSUdaaFpHVkVkWEpoZEdsdmJpa2dlMXh5WEc0Z0lIUm9hWE11WHlSamIyNTBaVzUwSUQwZ0pDaGNJaU5qYjI1MFpXNTBYQ0lwTzF4eVhHNGdJSFJvYVhNdVgyOXVVbVZzYjJGa0lEMGdiMjVTWld4dllXUTdYSEpjYmlBZ2RHaHBjeTVmWm1Ga1pVUjFjbUYwYVc5dUlEMGdabUZrWlVSMWNtRjBhVzl1SUNFOVBTQjFibVJsWm1sdVpXUWdQeUJtWVdSbFJIVnlZWFJwYjI0Z09pQXlOVEE3WEhKY2JpQWdkR2hwY3k1ZmNHRjBhQ0E5SUd4dlkyRjBhVzl1TG5CaGRHaHVZVzFsTzF4eVhHNTlYSEpjYmx4eVhHNU1iMkZrWlhJdWNISnZkRzkwZVhCbExtZGxkRXh2WVdSbFpGQmhkR2dnUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNCeVpYUjFjbTRnZEdocGN5NWZjR0YwYUR0Y2NseHVmVHRjY2x4dVhISmNia3h2WVdSbGNpNXdjbTkwYjNSNWNHVXViRzloWkZCaFoyVWdQU0JtZFc1amRHbHZiaWgxY213c0lIRjFaWEo1VDJKcVpXTjBMQ0J6YUc5MWJHUlFkWE5vU0dsemRHOXllU2tnZTF4eVhHNGdJQzh2SUVaaFpHVWdkR2hsYmlCbGJYQjBlU0IwYUdVZ1kzVnljbVZ1ZENCamIyNTBaVzUwYzF4eVhHNGdJSFJvYVhNdVh5UmpiMjUwWlc1MExuWmxiRzlqYVhSNUtGeHlYRzRnSUNBZ2V5QnZjR0ZqYVhSNU9pQXdJSDBzWEhKY2JpQWdJQ0IwYUdsekxsOW1ZV1JsUkhWeVlYUnBiMjRzWEhKY2JpQWdJQ0JjSW5OM2FXNW5YQ0lzWEhKY2JpQWdJQ0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0FnSUNBZ2RHaHBjeTVmSkdOdmJuUmxiblF1Wlcxd2RIa29LVHRjY2x4dUlDQWdJQ0FnZEdocGN5NWZKR052Ym5SbGJuUXViRzloWkNoMWNtd2dLeUJjSWlBalkyOXVkR1Z1ZEZ3aUxDQnZia052Ym5SbGJuUkdaWFJqYUdWa0xtSnBibVFvZEdocGN5a3BPMXh5WEc0Z0lDQWdmUzVpYVc1a0tIUm9hWE1wWEhKY2JpQWdLVHRjY2x4dVhISmNiaUFnTHk4Z1JtRmtaU0IwYUdVZ2JtVjNJR052Ym5SbGJuUWdhVzRnWVdaMFpYSWdhWFFnYUdGeklHSmxaVzRnWm1WMFkyaGxaRnh5WEc0Z0lHWjFibU4wYVc5dUlHOXVRMjl1ZEdWdWRFWmxkR05vWldRb2NtVnpjRzl1YzJWVVpYaDBMQ0IwWlhoMFUzUmhkSFZ6S1NCN1hISmNiaUFnSUNCcFppQW9kR1Y0ZEZOMFlYUjFjeUE5UFQwZ1hDSmxjbkp2Y2x3aUtTQjdYSEpjYmlBZ0lDQWdJR052Ym5OdmJHVXViRzluS0Z3aVZHaGxjbVVnZDJGeklHRWdjSEp2WW14bGJTQnNiMkZrYVc1bklIUm9aU0J3WVdkbExsd2lLVHRjY2x4dUlDQWdJQ0FnY21WMGRYSnVPMXh5WEc0Z0lDQWdmVnh5WEc1Y2NseHVJQ0FnSUhaaGNpQnhkV1Z5ZVZOMGNtbHVaeUE5SUhWMGFXeHBkR2xsY3k1amNtVmhkR1ZSZFdWeWVWTjBjbWx1WnloeGRXVnllVTlpYW1WamRDazdYSEpjYmlBZ0lDQnBaaUFvYzJodmRXeGtVSFZ6YUVocGMzUnZjbmtwSUh0Y2NseHVJQ0FnSUNBZ2FHbHpkRzl5ZVM1d2RYTm9VM1JoZEdVb1hISmNiaUFnSUNBZ0lDQWdlMXh5WEc0Z0lDQWdJQ0FnSUNBZ2RYSnNPaUIxY213c1hISmNiaUFnSUNBZ0lDQWdJQ0J4ZFdWeWVUb2djWFZsY25sUFltcGxZM1JjY2x4dUlDQWdJQ0FnSUNCOUxGeHlYRzRnSUNBZ0lDQWdJRzUxYkd3c1hISmNiaUFnSUNBZ0lDQWdkWEpzSUNzZ2NYVmxjbmxUZEhKcGJtZGNjbHh1SUNBZ0lDQWdLVHRjY2x4dUlDQWdJSDFjY2x4dVhISmNiaUFnSUNBdkx5QlZjR1JoZEdVZ1IyOXZaMnhsSUdGdVlXeDVkR2xqYzF4eVhHNGdJQ0FnWjJFb1hDSnpaWFJjSWl3Z1hDSndZV2RsWENJc0lIVnliQ0FySUhGMVpYSjVVM1J5YVc1bktUdGNjbHh1SUNBZ0lHZGhLRndpYzJWdVpGd2lMQ0JjSW5CaFoyVjJhV1YzWENJcE8xeHlYRzVjY2x4dUlDQWdJSFJvYVhNdVgzQmhkR2dnUFNCc2IyTmhkR2x2Ymk1d1lYUm9ibUZ0WlR0Y2NseHVJQ0FnSUhSb2FYTXVYeVJqYjI1MFpXNTBMblpsYkc5amFYUjVLSHNnYjNCaFkybDBlVG9nTVNCOUxDQjBhR2x6TGw5bVlXUmxSSFZ5WVhScGIyNHNJRndpYzNkcGJtZGNJaWs3WEhKY2JpQWdJQ0IwYUdsekxsOXZibEpsYkc5aFpDZ3BPMXh5WEc0Z0lIMWNjbHh1ZlR0Y2NseHVJaXdpZG1GeUlHTnZiMnRwWlhNZ1BTQnlaWEYxYVhKbEtGd2lhbk10WTI5dmEybGxYQ0lwTzF4eVhHNTJZWElnZFhScGJITWdQU0J5WlhGMWFYSmxLRndpTGk5MWRHbHNhWFJwWlhNdWFuTmNJaWs3WEhKY2JseHlYRzUyWVhJZ2MydGxkR05vUTI5dWMzUnlkV04wYjNKeklEMGdlMXh5WEc0Z0lGd2lhR0ZzWm5SdmJtVXRabXhoYzJoc2FXZG9kRndpT2lCeVpYRjFhWEpsS0Z3aUxpOXBiblJsY21GamRHbDJaUzFzYjJkdmN5OW9ZV3htZEc5dVpTMW1iR0Z6YUd4cFoyaDBMWGR2Y21RdWFuTmNJaWtzWEhKY2JpQWdYQ0p1YjJsemVTMTNiM0prWENJNklISmxjWFZwY21Vb1hDSXVMMmx1ZEdWeVlXTjBhWFpsTFd4dloyOXpMMjV2YVhONUxYZHZjbVF0YzJ0bGRHTm9MbXB6WENJcExGeHlYRzRnSUZ3aVkyOXVibVZqZEMxd2IybHVkSE5jSWpvZ2NtVnhkV2x5WlNoY0lpNHZhVzUwWlhKaFkzUnBkbVV0Ykc5bmIzTXZZMjl1Ym1WamRDMXdiMmx1ZEhNdGMydGxkR05vTG1welhDSXBYSEpjYm4wN1hISmNiblpoY2lCdWRXMVRhMlYwWTJobGN5QTlJRTlpYW1WamRDNXJaWGx6S0hOclpYUmphRU52Ym5OMGNuVmpkRzl5Y3lrdWJHVnVaM1JvTzF4eVhHNTJZWElnWTI5dmEybGxTMlY1SUQwZ1hDSnpaV1Z1TFhOclpYUmphQzF1WVcxbGMxd2lPMXh5WEc1Y2NseHVMeW9xWEhKY2JpQXFJRkJwWTJzZ1lTQnlZVzVrYjIwZ2MydGxkR05vSUhSb1lYUWdkWE5sY2lCb1lYTnVKM1FnYzJWbGJpQjVaWFF1SUVsbUlIUm9aU0IxYzJWeUlHaGhjeUJ6WldWdUlHRnNiQ0IwYUdWY2NseHVJQ29nYzJ0bGRHTm9aWE1zSUdwMWMzUWdjR2xqYXlCaElISmhibVJ2YlNCdmJtVXVJRlJvYVhNZ2RYTmxjeUJqYjI5cmFXVnpJSFJ2SUhSeVlXTnJJSGRvWVhRZ2RHaGxJSFZ6WlhKY2NseHVJQ29nYUdGeklITmxaVzRnWVd4eVpXRmtlUzVjY2x4dUlDb2dRSEpsZEhWeWJpQjdSblZ1WTNScGIyNTlJRU52Ym5OMGNuVmpkRzl5SUdadmNpQmhJRk5yWlhSamFDQmpiR0Z6YzF4eVhHNGdLaTljY2x4dWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCbWRXNWpkR2x2YmlCd2FXTnJVbUZ1Wkc5dFUydGxkR05vS0NrZ2UxeHlYRzRnSUhaaGNpQnpaV1Z1VTJ0bGRHTm9UbUZ0WlhNZ1BTQmpiMjlyYVdWekxtZGxkRXBUVDA0b1kyOXZhMmxsUzJWNUtTQjhmQ0JiWFR0Y2NseHVYSEpjYmlBZ0x5OGdSbWx1WkNCMGFHVWdibUZ0WlhNZ2IyWWdkR2hsSUhWdWMyVmxiaUJ6YTJWMFkyaGxjMXh5WEc0Z0lIWmhjaUIxYm5ObFpXNVRhMlYwWTJoT1lXMWxjeUE5SUdacGJtUlZibk5sWlc1VGEyVjBZMmhsY3loelpXVnVVMnRsZEdOb1RtRnRaWE1wTzF4eVhHNWNjbHh1SUNBdkx5QkJiR3dnYzJ0bGRHTm9aWE1nYUdGMlpTQmlaV1Z1SUhObFpXNWNjbHh1SUNCcFppQW9kVzV6WldWdVUydGxkR05vVG1GdFpYTXViR1Z1WjNSb0lEMDlQU0F3S1NCN1hISmNiaUFnSUNBdkx5QkpaaUIzWlNkMlpTQm5iM1FnYlc5eVpTQjBhR1Z1SUc5dVpTQnphMlYwWTJnc0lIUm9aVzRnYldGclpTQnpkWEpsSUhSdklHTm9iMjl6WlNCaElISmhibVJ2YlZ4eVhHNGdJQ0FnTHk4Z2MydGxkR05vSUdWNFkyeDFaR2x1WnlCMGFHVWdiVzl6ZENCeVpXTmxiblJzZVNCelpXVnVJSE5yWlhSamFGeHlYRzRnSUNBZ2FXWWdLRzUxYlZOclpYUmphR1Z6SUQ0Z01Ta2dlMXh5WEc0Z0lDQWdJQ0J6WldWdVUydGxkR05vVG1GdFpYTWdQU0JiYzJWbGJsTnJaWFJqYUU1aGJXVnpMbkJ2Y0NncFhUdGNjbHh1SUNBZ0lDQWdkVzV6WldWdVUydGxkR05vVG1GdFpYTWdQU0JtYVc1a1ZXNXpaV1Z1VTJ0bGRHTm9aWE1vYzJWbGJsTnJaWFJqYUU1aGJXVnpLVHRjY2x4dUlDQWdJSDBnWld4elpTQjdYSEpjYmlBZ0lDQWdJQzh2SUVsbUlIZGxKM1psSUc5dWJIa2daMjkwSUc5dVpTQnphMlYwWTJnc0lIUm9aVzRnZDJVZ1kyRnVKM1FnWkc4Z2JYVmphQzR1TGx4eVhHNGdJQ0FnSUNCelpXVnVVMnRsZEdOb1RtRnRaWE1nUFNCYlhUdGNjbHh1SUNBZ0lDQWdkVzV6WldWdVUydGxkR05vVG1GdFpYTWdQU0JQWW1wbFkzUXVhMlY1Y3loemEyVjBZMmhEYjI1emRISjFZM1J2Y25NcE8xeHlYRzRnSUNBZ2ZWeHlYRzRnSUgxY2NseHVYSEpjYmlBZ2RtRnlJSEpoYm1SVGEyVjBZMmhPWVcxbElEMGdkWFJwYkhNdWNtRnVaRUZ5Y21GNVJXeGxiV1Z1ZENoMWJuTmxaVzVUYTJWMFkyaE9ZVzFsY3lrN1hISmNiaUFnYzJWbGJsTnJaWFJqYUU1aGJXVnpMbkIxYzJnb2NtRnVaRk5yWlhSamFFNWhiV1VwTzF4eVhHNWNjbHh1SUNBdkx5QlRkRzl5WlNCMGFHVWdaMlZ1WlhKaGRHVmtJSE5yWlhSamFDQnBiaUJoSUdOdmIydHBaUzRnVkdocGN5QmpjbVZoZEdWeklHRWdiVzkyYVc1bklEY2daR0Y1WEhKY2JpQWdMeThnZDJsdVpHOTNJQzBnWVc1NWRHbHRaU0IwYUdVZ2MybDBaU0JwY3lCMmFYTnBkR1ZrTENCMGFHVWdZMjl2YTJsbElHbHpJSEpsWm5KbGMyaGxaQzVjY2x4dUlDQmpiMjlyYVdWekxuTmxkQ2hqYjI5cmFXVkxaWGtzSUhObFpXNVRhMlYwWTJoT1lXMWxjeXdnZXlCbGVIQnBjbVZ6T2lBM0lIMHBPMXh5WEc1Y2NseHVJQ0J5WlhSMWNtNGdjMnRsZEdOb1EyOXVjM1J5ZFdOMGIzSnpXM0poYm1SVGEyVjBZMmhPWVcxbFhUdGNjbHh1ZlR0Y2NseHVYSEpjYm1aMWJtTjBhVzl1SUdacGJtUlZibk5sWlc1VGEyVjBZMmhsY3loelpXVnVVMnRsZEdOb1RtRnRaWE1wSUh0Y2NseHVJQ0IyWVhJZ2RXNXpaV1Z1VTJ0bGRHTm9UbUZ0WlhNZ1BTQmJYVHRjY2x4dUlDQm1iM0lnS0haaGNpQnphMlYwWTJoT1lXMWxJR2x1SUhOclpYUmphRU52Ym5OMGNuVmpkRzl5Y3lrZ2UxeHlYRzRnSUNBZ2FXWWdLSE5sWlc1VGEyVjBZMmhPWVcxbGN5NXBibVJsZUU5bUtITnJaWFJqYUU1aGJXVXBJRDA5UFNBdE1Ta2dlMXh5WEc0Z0lDQWdJQ0IxYm5ObFpXNVRhMlYwWTJoT1lXMWxjeTV3ZFhOb0tITnJaWFJqYUU1aGJXVXBPMXh5WEc0Z0lDQWdmVnh5WEc0Z0lIMWNjbHh1SUNCeVpYUjFjbTRnZFc1elpXVnVVMnRsZEdOb1RtRnRaWE03WEhKY2JuMWNjbHh1SWl3aWJXOWtkV3hsTG1WNGNHOXlkSE1nUFNCUWIzSjBabTlzYVc5R2FXeDBaWEk3WEhKY2JseHlYRzUyWVhJZ2RYUnBiR2wwYVdWeklEMGdjbVZ4ZFdseVpTaGNJaTR2ZFhScGJHbDBhV1Z6TG1welhDSXBPMXh5WEc1Y2NseHVkbUZ5SUdSbFptRjFiSFJDY21WaGEzQnZhVzUwY3lBOUlGdGNjbHh1SUNCN0lIZHBaSFJvT2lBeE1qQXdMQ0JqYjJ4ek9pQXpMQ0J6Y0dGamFXNW5PaUF4TlNCOUxGeHlYRzRnSUhzZ2QybGtkR2c2SURrNU1pd2dZMjlzY3pvZ015d2djM0JoWTJsdVp6b2dNVFVnZlN4Y2NseHVJQ0I3SUhkcFpIUm9PaUEzTURBc0lHTnZiSE02SURNc0lITndZV05wYm1jNklERTFJSDBzWEhKY2JpQWdleUIzYVdSMGFEb2dOakF3TENCamIyeHpPaUF5TENCemNHRmphVzVuT2lBeE1DQjlMRnh5WEc0Z0lIc2dkMmxrZEdnNklEUTRNQ3dnWTI5c2N6b2dNaXdnYzNCaFkybHVaem9nTVRBZ2ZTeGNjbHh1SUNCN0lIZHBaSFJvT2lBek1qQXNJR052YkhNNklERXNJSE53WVdOcGJtYzZJREV3SUgxY2NseHVYVHRjY2x4dVhISmNibVoxYm1OMGFXOXVJRkJ2Y25SbWIyeHBiMFpwYkhSbGNpaHNiMkZrWlhJc0lHSnlaV0ZyY0c5cGJuUnpMQ0JoYzNCbFkzUlNZWFJwYnl3Z2RISmhibk5wZEdsdmJrUjFjbUYwYVc5dUtTQjdYSEpjYmlBZ2RHaHBjeTVmYkc5aFpHVnlJRDBnYkc5aFpHVnlPMXh5WEc0Z0lIUm9hWE11WDJkeWFXUlRjR0ZqYVc1bklEMGdNRHRjY2x4dUlDQjBhR2x6TGw5aGMzQmxZM1JTWVhScGJ5QTlJR0Z6Y0dWamRGSmhkR2x2SUNFOVBTQjFibVJsWm1sdVpXUWdQeUJoYzNCbFkzUlNZWFJwYnlBNklERTJJQzhnT1R0Y2NseHVJQ0IwYUdsekxsOTBjbUZ1YzJsMGFXOXVSSFZ5WVhScGIyNGdQU0IwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRnSVQwOUlIVnVaR1ZtYVc1bFpDQS9JSFJ5WVc1emFYUnBiMjVFZFhKaGRHbHZiaUE2SURnd01EdGNjbHh1SUNCMGFHbHpMbDlpY21WaGEzQnZhVzUwY3lBOUlHSnlaV0ZyY0c5cGJuUnpJQ0U5UFNCMWJtUmxabWx1WldRZ1B5QmljbVZoYTNCdmFXNTBjeTV6YkdsalpTZ3BJRG9nWkdWbVlYVnNkRUp5WldGcmNHOXBiblJ6TG5Oc2FXTmxLQ2s3WEhKY2JpQWdkR2hwY3k1ZkpHZHlhV1FnUFNBa0tGd2lJM0J2Y25SbWIyeHBieTFuY21sa1hDSXBPMXh5WEc0Z0lIUm9hWE11WHlSdVlYWWdQU0FrS0Z3aUkzQnZjblJtYjJ4cGJ5MXVZWFpjSWlrN1hISmNiaUFnZEdocGN5NWZKSEJ5YjJwbFkzUnpJRDBnVzEwN1hISmNiaUFnZEdocGN5NWZKR05oZEdWbmIzSnBaWE1nUFNCN2ZUdGNjbHh1SUNCMGFHbHpMbDl5YjNkeklEMGdNRHRjY2x4dUlDQjBhR2x6TGw5amIyeHpJRDBnTUR0Y2NseHVJQ0IwYUdsekxsOXBiV0ZuWlVobGFXZG9kQ0E5SURBN1hISmNiaUFnZEdocGN5NWZhVzFoWjJWWGFXUjBhQ0E5SURBN1hISmNibHh5WEc0Z0lDOHZJRk52Y25RZ2RHaGxJR0p5WldGcmNHOXBiblJ6SUdsdUlHUmxjMk5sYm1ScGJtY2diM0prWlhKY2NseHVJQ0IwYUdsekxsOWljbVZoYTNCdmFXNTBjeTV6YjNKMEtHWjFibU4wYVc5dUtHRXNJR0lwSUh0Y2NseHVJQ0FnSUdsbUlDaGhMbmRwWkhSb0lEd2dZaTUzYVdSMGFDa2djbVYwZFhKdUlDMHhPMXh5WEc0Z0lDQWdaV3h6WlNCcFppQW9ZUzUzYVdSMGFDQStJR0l1ZDJsa2RHZ3BJSEpsZEhWeWJpQXhPMXh5WEc0Z0lDQWdaV3h6WlNCeVpYUjFjbTRnTUR0Y2NseHVJQ0I5S1R0Y2NseHVYSEpjYmlBZ2RHaHBjeTVmWTJGamFHVlFjbTlxWldOMGN5Z3BPMXh5WEc0Z0lIUm9hWE11WDJOeVpXRjBaVWR5YVdRb0tUdGNjbHh1WEhKY2JpQWdkR2hwY3k1ZkpHZHlhV1F1Wm1sdVpDaGNJaTV3Y205cVpXTjBJR0ZjSWlrdWIyNG9YQ0pqYkdsamExd2lMQ0IwYUdsekxsOXZibEJ5YjJwbFkzUkRiR2xqYXk1aWFXNWtLSFJvYVhNcEtUdGNjbHh1WEhKY2JpQWdkbUZ5SUhGeklEMGdkWFJwYkdsMGFXVnpMbWRsZEZGMVpYSjVVR0Z5WVcxbGRHVnljeWdwTzF4eVhHNGdJSFpoY2lCcGJtbDBhV0ZzUTJGMFpXZHZjbmtnUFNCeGN5NWpZWFJsWjI5eWVTQjhmQ0JjSW1Gc2JGd2lPMXh5WEc0Z0lIWmhjaUJqWVhSbFoyOXllU0E5SUdsdWFYUnBZV3hEWVhSbFoyOXllUzUwYjB4dmQyVnlRMkZ6WlNncE8xeHlYRzRnSUhSb2FYTXVYeVJoWTNScGRtVk9ZWFpKZEdWdElEMGdkR2hwY3k1ZkpHNWhkaTVtYVc1a0tGd2lZVnRrWVhSaExXTmhkR1ZuYjNKNVBWd2lJQ3NnWTJGMFpXZHZjbmtnS3lCY0lsMWNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpHRmpkR2wyWlU1aGRrbDBaVzB1WVdSa1EyeGhjM01vWENKaFkzUnBkbVZjSWlrN1hISmNiaUFnZEdocGN5NWZabWxzZEdWeVVISnZhbVZqZEhNb1kyRjBaV2R2Y25rcE8xeHlYRzRnSUNRb1hDSWpjRzl5ZEdadmJHbHZMVzVoZGlCaFhDSXBMbTl1S0Z3aVkyeHBZMnRjSWl3Z2RHaHBjeTVmYjI1T1lYWkRiR2xqYXk1aWFXNWtLSFJvYVhNcEtUdGNjbHh1WEhKY2JpQWdKQ2gzYVc1a2IzY3BMbTl1S0Z3aWNtVnphWHBsWENJc0lIUm9hWE11WDJOeVpXRjBaVWR5YVdRdVltbHVaQ2gwYUdsektTazdYSEpjYm4xY2NseHVYSEpjYmxCdmNuUm1iMnhwYjBacGJIUmxjaTV3Y205MGIzUjVjR1V1YzJWc1pXTjBRMkYwWldkdmNua2dQU0JtZFc1amRHbHZiaWhqWVhSbFoyOXllU2tnZTF4eVhHNGdJR05oZEdWbmIzSjVJRDBnS0dOaGRHVm5iM0o1SUNZbUlHTmhkR1ZuYjNKNUxuUnZURzkzWlhKRFlYTmxLQ2twSUh4OElGd2lZV3hzWENJN1hISmNiaUFnZG1GeUlDUnpaV3hsWTNSbFpFNWhkaUE5SUhSb2FYTXVYeVJ1WVhZdVptbHVaQ2hjSW1GYlpHRjBZUzFqWVhSbFoyOXllVDFjSWlBcklHTmhkR1ZuYjNKNUlDc2dYQ0pkWENJcE8xeHlYRzRnSUdsbUlDZ2tjMlZzWldOMFpXUk9ZWFl1YkdWdVozUm9JQ1ltSUNFa2MyVnNaV04wWldST1lYWXVhWE1vZEdocGN5NWZKR0ZqZEdsMlpVNWhka2wwWlcwcEtTQjdYSEpjYmlBZ0lDQjBhR2x6TGw4a1lXTjBhWFpsVG1GMlNYUmxiUzV5WlcxdmRtVkRiR0Z6Y3loY0ltRmpkR2wyWlZ3aUtUdGNjbHh1SUNBZ0lIUm9hWE11WHlSaFkzUnBkbVZPWVhaSmRHVnRJRDBnSkhObGJHVmpkR1ZrVG1GMk8xeHlYRzRnSUNBZ2RHaHBjeTVmSkdGamRHbDJaVTVoZGtsMFpXMHVZV1JrUTJ4aGMzTW9YQ0poWTNScGRtVmNJaWs3WEhKY2JpQWdJQ0IwYUdsekxsOW1hV3gwWlhKUWNtOXFaV04wY3loallYUmxaMjl5ZVNrN1hISmNiaUFnZlZ4eVhHNTlPMXh5WEc1Y2NseHVVRzl5ZEdadmJHbHZSbWxzZEdWeUxuQnliM1J2ZEhsd1pTNWZabWxzZEdWeVVISnZhbVZqZEhNZ1BTQm1kVzVqZEdsdmJpaGpZWFJsWjI5eWVTa2dlMXh5WEc0Z0lIWmhjaUFrYzJWc1pXTjBaV1JGYkdWdFpXNTBjeUE5SUhSb2FYTXVYMmRsZEZCeWIycGxZM1J6U1c1RFlYUmxaMjl5ZVNoallYUmxaMjl5ZVNrN1hISmNibHh5WEc0Z0lDOHZJRUZ1YVcxaGRHVWdkR2hsSUdkeWFXUWdkRzhnZEdobElHTnZjbkpsWTNRZ2FHVnBaMmgwSUhSdklHTnZiblJoYVc0Z2RHaGxJSEp2ZDNOY2NseHVJQ0IwYUdsekxsOWhibWx0WVhSbFIzSnBaRWhsYVdkb2RDZ2tjMlZzWldOMFpXUkZiR1Z0Wlc1MGN5NXNaVzVuZEdncE8xeHlYRzVjY2x4dUlDQXZMeUJNYjI5d0lIUm9jbTkxWjJnZ1lXeHNJSEJ5YjJwbFkzUnpYSEpjYmlBZ2RHaHBjeTVmSkhCeWIycGxZM1J6TG1admNrVmhZMmdvWEhKY2JpQWdJQ0JtZFc1amRHbHZiaWdrWld4bGJXVnVkQ2tnZTF4eVhHNGdJQ0FnSUNBdkx5QlRkRzl3SUdGc2JDQmhibWx0WVhScGIyNXpYSEpjYmlBZ0lDQWdJQ1JsYkdWdFpXNTBMblpsYkc5amFYUjVLRndpYzNSdmNGd2lLVHRjY2x4dUlDQWdJQ0FnTHk4Z1NXWWdZVzRnWld4bGJXVnVkQ0JwY3lCdWIzUWdjMlZzWldOMFpXUTZJR1J5YjNBZ2VpMXBibVJsZUNBbUlHRnVhVzFoZEdVZ2IzQmhZMmwwZVNBdFBpQm9hV1JsWEhKY2JpQWdJQ0FnSUhaaGNpQnpaV3hsWTNSbFpFbHVaR1Y0SUQwZ0pITmxiR1ZqZEdWa1JXeGxiV1Z1ZEhNdWFXNWtaWGhQWmlna1pXeGxiV1Z1ZENrN1hISmNiaUFnSUNBZ0lHbG1JQ2h6Wld4bFkzUmxaRWx1WkdWNElEMDlQU0F0TVNrZ2UxeHlYRzRnSUNBZ0lDQWdJQ1JsYkdWdFpXNTBMbU56Y3loY0lucEpibVJsZUZ3aUxDQXRNU2s3WEhKY2JpQWdJQ0FnSUNBZ0pHVnNaVzFsYm5RdWRtVnNiMk5wZEhrb1hISmNiaUFnSUNBZ0lDQWdJQ0I3WEhKY2JpQWdJQ0FnSUNBZ0lDQWdJRzl3WVdOcGRIazZJREJjY2x4dUlDQWdJQ0FnSUNBZ0lIMHNYSEpjYmlBZ0lDQWdJQ0FnSUNCMGFHbHpMbDkwY21GdWMybDBhVzl1UkhWeVlYUnBiMjRzWEhKY2JpQWdJQ0FnSUNBZ0lDQmNJbVZoYzJWSmJrOTFkRU4xWW1salhDSXNYSEpjYmlBZ0lDQWdJQ0FnSUNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNBZ0lDQWdJQ0FnSUNBZ0pHVnNaVzFsYm5RdWFHbGtaU2dwTzF4eVhHNGdJQ0FnSUNBZ0lDQWdmVnh5WEc0Z0lDQWdJQ0FnSUNrN1hISmNiaUFnSUNBZ0lIMGdaV3h6WlNCN1hISmNiaUFnSUNBZ0lDQWdMeThnU1dZZ1lXNGdaV3hsYldWdWRDQnBjeUJ6Wld4bFkzUmxaRG9nYzJodmR5QW1JR0oxYlhBZ2VpMXBibVJsZUNBbUlHRnVhVzFoZEdVZ2RHOGdjRzl6YVhScGIyNWNjbHh1SUNBZ0lDQWdJQ0FrWld4bGJXVnVkQzV6YUc5M0tDazdYSEpjYmlBZ0lDQWdJQ0FnSkdWc1pXMWxiblF1WTNOektGd2lla2x1WkdWNFhDSXNJREFwTzF4eVhHNGdJQ0FnSUNBZ0lIWmhjaUJ1WlhkUWIzTWdQU0IwYUdsekxsOXBibVJsZUZSdldGa29jMlZzWldOMFpXUkpibVJsZUNrN1hISmNiaUFnSUNBZ0lDQWdKR1ZzWlcxbGJuUXVkbVZzYjJOcGRIa29YSEpjYmlBZ0lDQWdJQ0FnSUNCN1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUc5d1lXTnBkSGs2SURFc1hISmNiaUFnSUNBZ0lDQWdJQ0FnSUhSdmNEb2dibVYzVUc5ekxua2dLeUJjSW5CNFhDSXNYSEpjYmlBZ0lDQWdJQ0FnSUNBZ0lHeGxablE2SUc1bGQxQnZjeTU0SUNzZ1hDSndlRndpWEhKY2JpQWdJQ0FnSUNBZ0lDQjlMRnh5WEc0Z0lDQWdJQ0FnSUNBZ2RHaHBjeTVmZEhKaGJuTnBkR2x2YmtSMWNtRjBhVzl1TEZ4eVhHNGdJQ0FnSUNBZ0lDQWdYQ0psWVhObFNXNVBkWFJEZFdKcFkxd2lYSEpjYmlBZ0lDQWdJQ0FnS1R0Y2NseHVJQ0FnSUNBZ2ZWeHlYRzRnSUNBZ2ZTNWlhVzVrS0hSb2FYTXBYSEpjYmlBZ0tUdGNjbHh1ZlR0Y2NseHVYSEpjYmxCdmNuUm1iMnhwYjBacGJIUmxjaTV3Y205MGIzUjVjR1V1WDJGdWFXMWhkR1ZIY21sa1NHVnBaMmgwSUQwZ1puVnVZM1JwYjI0b2JuVnRSV3hsYldWdWRITXBJSHRjY2x4dUlDQjBhR2x6TGw4a1ozSnBaQzUyWld4dlkybDBlU2hjSW5OMGIzQmNJaWs3WEhKY2JpQWdkbUZ5SUdOMWNsSnZkM01nUFNCTllYUm9MbU5sYVd3b2JuVnRSV3hsYldWdWRITWdMeUIwYUdsekxsOWpiMnh6S1R0Y2NseHVJQ0IwYUdsekxsOGtaM0pwWkM1MlpXeHZZMmwwZVNoY2NseHVJQ0FnSUh0Y2NseHVJQ0FnSUNBZ2FHVnBaMmgwT2lCMGFHbHpMbDlwYldGblpVaGxhV2RvZENBcUlHTjFjbEp2ZDNNZ0t5QjBhR2x6TGw5bmNtbGtVM0JoWTJsdVp5QXFJQ2hqZFhKU2IzZHpJQzBnTVNrZ0t5QmNJbkI0WENKY2NseHVJQ0FnSUgwc1hISmNiaUFnSUNCMGFHbHpMbDkwY21GdWMybDBhVzl1UkhWeVlYUnBiMjVjY2x4dUlDQXBPMXh5WEc1OU8xeHlYRzVjY2x4dVVHOXlkR1p2YkdsdlJtbHNkR1Z5TG5CeWIzUnZkSGx3WlM1ZloyVjBVSEp2YW1WamRITkpia05oZEdWbmIzSjVJRDBnWm5WdVkzUnBiMjRvWTJGMFpXZHZjbmtwSUh0Y2NseHVJQ0JwWmlBb1kyRjBaV2R2Y25rZ1BUMDlJRndpWVd4c1hDSXBJSHRjY2x4dUlDQWdJSEpsZEhWeWJpQjBhR2x6TGw4a2NISnZhbVZqZEhNN1hISmNiaUFnZlNCbGJITmxJSHRjY2x4dUlDQWdJSEpsZEhWeWJpQjBhR2x6TGw4a1kyRjBaV2R2Y21sbGMxdGpZWFJsWjI5eWVWMGdmSHdnVzEwN1hISmNiaUFnZlZ4eVhHNTlPMXh5WEc1Y2NseHVVRzl5ZEdadmJHbHZSbWxzZEdWeUxuQnliM1J2ZEhsd1pTNWZZMkZqYUdWUWNtOXFaV04wY3lBOUlHWjFibU4wYVc5dUtDa2dlMXh5WEc0Z0lIUm9hWE11WHlSd2NtOXFaV04wY3lBOUlGdGRPMXh5WEc0Z0lIUm9hWE11WHlSallYUmxaMjl5YVdWeklEMGdlMzA3WEhKY2JpQWdkR2hwY3k1ZkpHZHlhV1F1Wm1sdVpDaGNJaTV3Y205cVpXTjBYQ0lwTG1WaFkyZ29YSEpjYmlBZ0lDQm1kVzVqZEdsdmJpaHBibVJsZUN3Z1pXeGxiV1Z1ZENrZ2UxeHlYRzRnSUNBZ0lDQjJZWElnSkdWc1pXMWxiblFnUFNBa0tHVnNaVzFsYm5RcE8xeHlYRzRnSUNBZ0lDQjBhR2x6TGw4a2NISnZhbVZqZEhNdWNIVnphQ2drWld4bGJXVnVkQ2s3WEhKY2JpQWdJQ0FnSUhaaGNpQmpZWFJsWjI5eWVVNWhiV1Z6SUQwZ0pHVnNaVzFsYm5RdVpHRjBZU2hjSW1OaGRHVm5iM0pwWlhOY0lpa3VjM0JzYVhRb1hDSXNYQ0lwTzF4eVhHNGdJQ0FnSUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHTmhkR1ZuYjNKNVRtRnRaWE11YkdWdVozUm9PeUJwSUNzOUlERXBJSHRjY2x4dUlDQWdJQ0FnSUNCMllYSWdZMkYwWldkdmNua2dQU0FrTG5SeWFXMG9ZMkYwWldkdmNubE9ZVzFsYzF0cFhTa3VkRzlNYjNkbGNrTmhjMlVvS1R0Y2NseHVJQ0FnSUNBZ0lDQnBaaUFvSVhSb2FYTXVYeVJqWVhSbFoyOXlhV1Z6VzJOaGRHVm5iM0o1WFNrZ2UxeHlYRzRnSUNBZ0lDQWdJQ0FnZEdocGN5NWZKR05oZEdWbmIzSnBaWE5iWTJGMFpXZHZjbmxkSUQwZ1d5UmxiR1Z0Wlc1MFhUdGNjbHh1SUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh5WEc0Z0lDQWdJQ0FnSUNBZ2RHaHBjeTVmSkdOaGRHVm5iM0pwWlhOYlkyRjBaV2R2Y25sZExuQjFjMmdvSkdWc1pXMWxiblFwTzF4eVhHNGdJQ0FnSUNBZ0lIMWNjbHh1SUNBZ0lDQWdmVnh5WEc0Z0lDQWdmUzVpYVc1a0tIUm9hWE1wWEhKY2JpQWdLVHRjY2x4dWZUdGNjbHh1WEhKY2JpOHZJRkJ2Y25SbWIyeHBiMFpwYkhSbGNpNXdjbTkwYjNSNWNHVXVYMk5oYkdOMWJHRjBaVWR5YVdRZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEhKY2JpOHZJQ0FnSUNCMllYSWdaM0pwWkZkcFpIUm9JRDBnZEdocGN5NWZKR2R5YVdRdWFXNXVaWEpYYVdSMGFDZ3BPMXh5WEc0dkx5QWdJQ0FnZEdocGN5NWZZMjlzY3lBOUlFMWhkR2d1Wm14dmIzSW9LR2R5YVdSWGFXUjBhQ0FySUhSb2FYTXVYMmR5YVdSVGNHRmphVzVuS1NBdlhISmNiaTh2SUNBZ0lDQWdJQ0FnS0hSb2FYTXVYMjFwYmtsdFlXZGxWMmxrZEdnZ0t5QjBhR2x6TGw5bmNtbGtVM0JoWTJsdVp5a3BPMXh5WEc0dkx5QWdJQ0FnZEdocGN5NWZjbTkzY3lBOUlFMWhkR2d1WTJWcGJDaDBhR2x6TGw4a2NISnZhbVZqZEhNdWJHVnVaM1JvSUM4Z2RHaHBjeTVmWTI5c2N5azdYSEpjYmk4dklDQWdJQ0IwYUdsekxsOXBiV0ZuWlZkcFpIUm9JRDBnS0dkeWFXUlhhV1IwYUNBdElDZ29kR2hwY3k1ZlkyOXNjeUF0SURFcElDb2dkR2hwY3k1ZlozSnBaRk53WVdOcGJtY3BLU0F2WEhKY2JpOHZJQ0FnSUNBZ0lDQWdkR2hwY3k1ZlkyOXNjenRjY2x4dUx5OGdJQ0FnSUhSb2FYTXVYMmx0WVdkbFNHVnBaMmgwSUQwZ2RHaHBjeTVmYVcxaFoyVlhhV1IwYUNBcUlDZ3hJQzhnZEdocGN5NWZZWE53WldOMFVtRjBhVzhwTzF4eVhHNHZMeUI5TzF4eVhHNWNjbHh1VUc5eWRHWnZiR2x2Um1sc2RHVnlMbkJ5YjNSdmRIbHdaUzVmWTJGc1kzVnNZWFJsUjNKcFpDQTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJSFpoY2lCbmNtbGtWMmxrZEdnZ1BTQjBhR2x6TGw4a1ozSnBaQzVwYm01bGNsZHBaSFJvS0NrN1hISmNiaUFnWm05eUlDaDJZWElnYVNBOUlEQTdJR2tnUENCMGFHbHpMbDlpY21WaGEzQnZhVzUwY3k1c1pXNW5kR2c3SUdrZ0t6MGdNU2tnZTF4eVhHNGdJQ0FnYVdZZ0tHZHlhV1JYYVdSMGFDQThQU0IwYUdsekxsOWljbVZoYTNCdmFXNTBjMXRwWFM1M2FXUjBhQ2tnZTF4eVhHNGdJQ0FnSUNCMGFHbHpMbDlqYjJ4eklEMGdkR2hwY3k1ZlluSmxZV3R3YjJsdWRITmJhVjB1WTI5c2N6dGNjbHh1SUNBZ0lDQWdkR2hwY3k1ZlozSnBaRk53WVdOcGJtY2dQU0IwYUdsekxsOWljbVZoYTNCdmFXNTBjMXRwWFM1emNHRmphVzVuTzF4eVhHNGdJQ0FnSUNCaWNtVmhhenRjY2x4dUlDQWdJSDFjY2x4dUlDQjlYSEpjYmlBZ2RHaHBjeTVmY205M2N5QTlJRTFoZEdndVkyVnBiQ2gwYUdsekxsOGtjSEp2YW1WamRITXViR1Z1WjNSb0lDOGdkR2hwY3k1ZlkyOXNjeWs3WEhKY2JpQWdkR2hwY3k1ZmFXMWhaMlZYYVdSMGFDQTlJQ2huY21sa1YybGtkR2dnTFNBb2RHaHBjeTVmWTI5c2N5QXRJREVwSUNvZ2RHaHBjeTVmWjNKcFpGTndZV05wYm1jcElDOGdkR2hwY3k1ZlkyOXNjenRjY2x4dUlDQjBhR2x6TGw5cGJXRm5aVWhsYVdkb2RDQTlJSFJvYVhNdVgybHRZV2RsVjJsa2RHZ2dLaUFvTVNBdklIUm9hWE11WDJGemNHVmpkRkpoZEdsdktUdGNjbHh1ZlR0Y2NseHVYSEpjYmxCdmNuUm1iMnhwYjBacGJIUmxjaTV3Y205MGIzUjVjR1V1WDJOeVpXRjBaVWR5YVdRZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQjBhR2x6TGw5allXeGpkV3hoZEdWSGNtbGtLQ2s3WEhKY2JseHlYRzRnSUhSb2FYTXVYeVJuY21sa0xtTnpjeWhjSW5CdmMybDBhVzl1WENJc0lGd2ljbVZzWVhScGRtVmNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpHZHlhV1F1WTNOektIdGNjbHh1SUNBZ0lHaGxhV2RvZERvZ2RHaHBjeTVmYVcxaFoyVklaV2xuYUhRZ0tpQjBhR2x6TGw5eWIzZHpJQ3NnZEdocGN5NWZaM0pwWkZOd1lXTnBibWNnS2lBb2RHaHBjeTVmY205M2N5QXRJREVwSUNzZ1hDSndlRndpWEhKY2JpQWdmU2s3WEhKY2JseHlYRzRnSUhSb2FYTXVYeVJ3Y205cVpXTjBjeTVtYjNKRllXTm9LRnh5WEc0Z0lDQWdablZ1WTNScGIyNG9KR1ZzWlcxbGJuUXNJR2x1WkdWNEtTQjdYSEpjYmlBZ0lDQWdJSFpoY2lCd2IzTWdQU0IwYUdsekxsOXBibVJsZUZSdldGa29hVzVrWlhncE8xeHlYRzRnSUNBZ0lDQWtaV3hsYldWdWRDNWpjM01vZTF4eVhHNGdJQ0FnSUNBZ0lIQnZjMmwwYVc5dU9pQmNJbUZpYzI5c2RYUmxYQ0lzWEhKY2JpQWdJQ0FnSUNBZ2RHOXdPaUJ3YjNNdWVTQXJJRndpY0hoY0lpeGNjbHh1SUNBZ0lDQWdJQ0JzWldaME9pQndiM011ZUNBcklGd2ljSGhjSWl4Y2NseHVJQ0FnSUNBZ0lDQjNhV1IwYURvZ2RHaHBjeTVmYVcxaFoyVlhhV1IwYUNBcklGd2ljSGhjSWl4Y2NseHVJQ0FnSUNBZ0lDQm9aV2xuYUhRNklIUm9hWE11WDJsdFlXZGxTR1ZwWjJoMElDc2dYQ0p3ZUZ3aVhISmNiaUFnSUNBZ0lIMHBPMXh5WEc0Z0lDQWdmUzVpYVc1a0tIUm9hWE1wWEhKY2JpQWdLVHRjY2x4dWZUdGNjbHh1WEhKY2JsQnZjblJtYjJ4cGIwWnBiSFJsY2k1d2NtOTBiM1I1Y0dVdVgyOXVUbUYyUTJ4cFkyc2dQU0JtZFc1amRHbHZiaWhsS1NCN1hISmNiaUFnWlM1d2NtVjJaVzUwUkdWbVlYVnNkQ2dwTzF4eVhHNGdJSFpoY2lBa2RHRnlaMlYwSUQwZ0pDaGxMblJoY21kbGRDazdYSEpjYmlBZ2FXWWdLQ1IwWVhKblpYUXVhWE1vZEdocGN5NWZKR0ZqZEdsMlpVNWhka2wwWlcwcEtTQnlaWFIxY200N1hISmNiaUFnYVdZZ0tIUm9hWE11WHlSaFkzUnBkbVZPWVhaSmRHVnRMbXhsYm1kMGFDa2dkR2hwY3k1ZkpHRmpkR2wyWlU1aGRrbDBaVzB1Y21WdGIzWmxRMnhoYzNNb1hDSmhZM1JwZG1WY0lpazdYSEpjYmlBZ0pIUmhjbWRsZEM1aFpHUkRiR0Z6Y3loY0ltRmpkR2wyWlZ3aUtUdGNjbHh1SUNCMGFHbHpMbDhrWVdOMGFYWmxUbUYyU1hSbGJTQTlJQ1IwWVhKblpYUTdYSEpjYmlBZ2RtRnlJR05oZEdWbmIzSjVJRDBnSkhSaGNtZGxkQzVrWVhSaEtGd2lZMkYwWldkdmNubGNJaWt1ZEc5TWIzZGxja05oYzJVb0tUdGNjbHh1WEhKY2JpQWdhR2x6ZEc5eWVTNXdkWE5vVTNSaGRHVW9YSEpjYmlBZ0lDQjdYSEpjYmlBZ0lDQWdJSFZ5YkRvZ1hDSXZkMjl5YXk1b2RHMXNYQ0lzWEhKY2JpQWdJQ0FnSUhGMVpYSjVPaUI3SUdOaGRHVm5iM0o1T2lCallYUmxaMjl5ZVNCOVhISmNiaUFnSUNCOUxGeHlYRzRnSUNBZ2JuVnNiQ3hjY2x4dUlDQWdJRndpTDNkdmNtc3VhSFJ0YkQ5allYUmxaMjl5ZVQxY0lpQXJJR05oZEdWbmIzSjVYSEpjYmlBZ0tUdGNjbHh1WEhKY2JpQWdkR2hwY3k1ZlptbHNkR1Z5VUhKdmFtVmpkSE1vWTJGMFpXZHZjbmtwTzF4eVhHNTlPMXh5WEc1Y2NseHVVRzl5ZEdadmJHbHZSbWxzZEdWeUxuQnliM1J2ZEhsd1pTNWZiMjVRY205cVpXTjBRMnhwWTJzZ1BTQm1kVzVqZEdsdmJpaGxLU0I3WEhKY2JpQWdaUzV3Y21WMlpXNTBSR1ZtWVhWc2RDZ3BPMXh5WEc0Z0lIWmhjaUFrZEdGeVoyVjBJRDBnSkNobExtTjFjbkpsYm5SVVlYSm5aWFFwTzF4eVhHNGdJSFpoY2lCd2NtOXFaV04wVG1GdFpTQTlJQ1IwWVhKblpYUXVaR0YwWVNoY0ltNWhiV1ZjSWlrN1hISmNiaUFnZG1GeUlIVnliQ0E5SUZ3aUwzQnliMnBsWTNSekwxd2lJQ3NnY0hKdmFtVmpkRTVoYldVZ0t5QmNJaTVvZEcxc1hDSTdYSEpjYmlBZ2RHaHBjeTVmYkc5aFpHVnlMbXh2WVdSUVlXZGxLSFZ5YkN3Z2UzMHNJSFJ5ZFdVcE8xeHlYRzU5TzF4eVhHNWNjbHh1VUc5eWRHWnZiR2x2Um1sc2RHVnlMbkJ5YjNSdmRIbHdaUzVmYVc1a1pYaFViMWhaSUQwZ1puVnVZM1JwYjI0b2FXNWtaWGdwSUh0Y2NseHVJQ0IyWVhJZ2NpQTlJRTFoZEdndVpteHZiM0lvYVc1a1pYZ2dMeUIwYUdsekxsOWpiMnh6S1R0Y2NseHVJQ0IyWVhJZ1l5QTlJR2x1WkdWNElDVWdkR2hwY3k1ZlkyOXNjenRjY2x4dUlDQnlaWFIxY200Z2UxeHlYRzRnSUNBZ2VEb2dZeUFxSUhSb2FYTXVYMmx0WVdkbFYybGtkR2dnS3lCaklDb2dkR2hwY3k1ZlozSnBaRk53WVdOcGJtY3NYSEpjYmlBZ0lDQjVPaUJ5SUNvZ2RHaHBjeTVmYVcxaFoyVklaV2xuYUhRZ0t5QnlJQ29nZEdocGN5NWZaM0pwWkZOd1lXTnBibWRjY2x4dUlDQjlPMXh5WEc1OU8xeHlYRzRpTENKdGIyUjFiR1V1Wlhod2IzSjBjeUE5SUZOc2FXUmxjMmh2ZDAxdlpHRnNPMXh5WEc1Y2NseHVkbUZ5SUV0RldWOURUMFJGVXlBOUlIdGNjbHh1SUNCTVJVWlVYMEZTVWs5WE9pQXpOeXhjY2x4dUlDQlNTVWRJVkY5QlVsSlBWem9nTXprc1hISmNiaUFnUlZORFFWQkZPaUF5TjF4eVhHNTlPMXh5WEc1Y2NseHVablZ1WTNScGIyNGdVMnhwWkdWemFHOTNUVzlrWVd3b0pHTnZiblJoYVc1bGNpd2djMnhwWkdWemFHOTNLU0I3WEhKY2JpQWdkR2hwY3k1ZmMyeHBaR1Z6YUc5M0lEMGdjMnhwWkdWemFHOTNPMXh5WEc1Y2NseHVJQ0IwYUdsekxsOGtiVzlrWVd3Z1BTQWtZMjl1ZEdGcGJtVnlMbVpwYm1Rb1hDSXVjMnhwWkdWemFHOTNMVzF2WkdGc1hDSXBPMXh5WEc0Z0lIUm9hWE11WHlSdmRtVnliR0Y1SUQwZ2RHaHBjeTVmSkcxdlpHRnNMbVpwYm1Rb1hDSXViVzlrWVd3dGIzWmxjbXhoZVZ3aUtUdGNjbHh1SUNCMGFHbHpMbDhrWTI5dWRHVnVkQ0E5SUhSb2FYTXVYeVJ0YjJSaGJDNW1hVzVrS0Z3aUxtMXZaR0ZzTFdOdmJuUmxiblJ6WENJcE8xeHlYRzRnSUhSb2FYTXVYeVJqWVhCMGFXOXVJRDBnZEdocGN5NWZKRzF2WkdGc0xtWnBibVFvWENJdWJXOWtZV3d0WTJGd2RHbHZibHdpS1R0Y2NseHVJQ0IwYUdsekxsOGthVzFoWjJWRGIyNTBZV2x1WlhJZ1BTQjBhR2x6TGw4a2JXOWtZV3d1Wm1sdVpDaGNJaTV0YjJSaGJDMXBiV0ZuWlZ3aUtUdGNjbHh1SUNCMGFHbHpMbDhrYVcxaFoyVk1aV1owSUQwZ2RHaHBjeTVmSkcxdlpHRnNMbVpwYm1Rb1hDSXVhVzFoWjJVdFlXUjJZVzVqWlMxc1pXWjBYQ0lwTzF4eVhHNGdJSFJvYVhNdVh5UnBiV0ZuWlZKcFoyaDBJRDBnZEdocGN5NWZKRzF2WkdGc0xtWnBibVFvWENJdWFXMWhaMlV0WVdSMllXNWpaUzF5YVdkb2RGd2lLVHRjY2x4dVhISmNiaUFnZEdocGN5NWZhVzVrWlhnZ1BTQXdPeUF2THlCSmJtUmxlQ0J2WmlCelpXeGxZM1JsWkNCcGJXRm5aVnh5WEc0Z0lIUm9hWE11WDJselQzQmxiaUE5SUdaaGJITmxPMXh5WEc1Y2NseHVJQ0IwYUdsekxsOGthVzFoWjJWTVpXWjBMbTl1S0Z3aVkyeHBZMnRjSWl3Z2RHaHBjeTVoWkhaaGJtTmxUR1ZtZEM1aWFXNWtLSFJvYVhNcEtUdGNjbHh1SUNCMGFHbHpMbDhrYVcxaFoyVlNhV2RvZEM1dmJpaGNJbU5zYVdOclhDSXNJSFJvYVhNdVlXUjJZVzVqWlZKcFoyaDBMbUpwYm1Rb2RHaHBjeWtwTzF4eVhHNGdJQ1FvWkc5amRXMWxiblFwTG05dUtGd2lhMlY1Wkc5M2Jsd2lMQ0IwYUdsekxsOXZia3RsZVVSdmQyNHVZbWx1WkNoMGFHbHpLU2s3WEhKY2JseHlYRzRnSUM4dklFZHBkbVVnYWxGMVpYSjVJR052Ym5SeWIyd2diM1psY2lCemFHOTNhVzVuTDJocFpHbHVaMXh5WEc0Z0lIUm9hWE11WHlSdGIyUmhiQzVqYzNNb1hDSmthWE53YkdGNVhDSXNJRndpWW14dlkydGNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpHMXZaR0ZzTG1ocFpHVW9LVHRjY2x4dVhISmNiaUFnTHk4Z1JYWmxiblJ6WEhKY2JpQWdKQ2gzYVc1a2IzY3BMbTl1S0Z3aWNtVnphWHBsWENJc0lIUm9hWE11WDI5dVVtVnphWHBsTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzRnSUhSb2FYTXVYeVJ2ZG1WeWJHRjVMbTl1S0Z3aVkyeHBZMnRjSWl3Z2RHaHBjeTVqYkc5elpTNWlhVzVrS0hSb2FYTXBLVHRjY2x4dUlDQjBhR2x6TGw4a2JXOWtZV3d1Wm1sdVpDaGNJaTV0YjJSaGJDMWpiRzl6WlZ3aUtTNXZiaWhjSW1Oc2FXTnJYQ0lzSUhSb2FYTXVZMnh2YzJVdVltbHVaQ2gwYUdsektTazdYSEpjYmx4eVhHNGdJSFJvYVhNdVgzVndaR0YwWlVOdmJuUnliMnh6S0NrN1hISmNibHh5WEc0Z0lDOHZJRk5wZW1VZ2IyWWdabTl1ZEdGM1pYTnZiV1VnYVdOdmJuTWdibVZsWkhNZ1lTQnpiR2xuYUhRZ1pHVnNZWGtnS0hWdWRHbHNJSE4wWVdOcklHbHpJR05zWldGeUtTQm1iM0pjY2x4dUlDQXZMeUJ6YjIxbElISmxZWE52Ymx4eVhHNGdJSE5sZEZScGJXVnZkWFFvWEhKY2JpQWdJQ0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0FnSUNBZ2RHaHBjeTVmYjI1U1pYTnBlbVVvS1R0Y2NseHVJQ0FnSUgwdVltbHVaQ2gwYUdsektTeGNjbHh1SUNBZ0lEQmNjbHh1SUNBcE8xeHlYRzU5WEhKY2JseHlYRzVUYkdsa1pYTm9iM2ROYjJSaGJDNXdjbTkwYjNSNWNHVXVZV1IyWVc1alpVeGxablFnUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNCMGFHbHpMbk5vYjNkSmJXRm5aVUYwS0hSb2FYTXVYMmx1WkdWNElDMGdNU2s3WEhKY2JuMDdYSEpjYmx4eVhHNVRiR2xrWlhOb2IzZE5iMlJoYkM1d2NtOTBiM1I1Y0dVdVlXUjJZVzVqWlZKcFoyaDBJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnZEdocGN5NXphRzkzU1cxaFoyVkJkQ2gwYUdsekxsOXBibVJsZUNBcklERXBPMXh5WEc1OU8xeHlYRzVjY2x4dVUyeHBaR1Z6YUc5M1RXOWtZV3d1Y0hKdmRHOTBlWEJsTG5Ob2IzZEpiV0ZuWlVGMElEMGdablZ1WTNScGIyNG9hVzVrWlhncElIdGNjbHh1SUNCcGJtUmxlQ0E5SUUxaGRHZ3ViV0Y0S0dsdVpHVjRMQ0F3S1R0Y2NseHVJQ0JwYm1SbGVDQTlJRTFoZEdndWJXbHVLR2x1WkdWNExDQjBhR2x6TGw5emJHbGtaWE5vYjNjdVoyVjBUblZ0U1cxaFoyVnpLQ2tnTFNBeEtUdGNjbHh1SUNCMGFHbHpMbDlwYm1SbGVDQTlJR2x1WkdWNE8xeHlYRzRnSUhaaGNpQWthVzFuSUQwZ2RHaHBjeTVmYzJ4cFpHVnphRzkzTG1kbGRFZGhiR3hsY25sSmJXRm5aU2gwYUdsekxsOXBibVJsZUNrN1hISmNiaUFnZG1GeUlHTmhjSFJwYjI0Z1BTQjBhR2x6TGw5emJHbGtaWE5vYjNjdVoyVjBRMkZ3ZEdsdmJpaDBhR2x6TGw5cGJtUmxlQ2s3WEhKY2JseHlYRzRnSUhSb2FYTXVYeVJwYldGblpVTnZiblJoYVc1bGNpNWxiWEIwZVNncE8xeHlYRzRnSUNRb1hDSThhVzFuUGx3aUxDQjdJSE55WXpvZ0pHbHRaeTVoZEhSeUtGd2ljM0pqWENJcElIMHBMbUZ3Y0dWdVpGUnZLSFJvYVhNdVh5UnBiV0ZuWlVOdmJuUmhhVzVsY2lrN1hISmNibHh5WEc0Z0lIUm9hWE11WHlSallYQjBhVzl1TG1WdGNIUjVLQ2s3WEhKY2JpQWdhV1lnS0dOaGNIUnBiMjRwSUh0Y2NseHVJQ0FnSUNRb1hDSThjM0JoYmo1Y0lpbGNjbHh1SUNBZ0lDQWdMbUZrWkVOc1lYTnpLRndpWm1sbmRYSmxMVzUxYldKbGNsd2lLVnh5WEc0Z0lDQWdJQ0F1ZEdWNGRDaGNJa1pwWnk0Z1hDSWdLeUFvZEdocGN5NWZhVzVrWlhnZ0t5QXhLU0FySUZ3aU9pQmNJaWxjY2x4dUlDQWdJQ0FnTG1Gd2NHVnVaRlJ2S0hSb2FYTXVYeVJqWVhCMGFXOXVLVHRjY2x4dUlDQWdJQ1FvWENJOGMzQmhiajVjSWlsY2NseHVJQ0FnSUNBZ0xtRmtaRU5zWVhOektGd2lZMkZ3ZEdsdmJpMTBaWGgwWENJcFhISmNiaUFnSUNBZ0lDNTBaWGgwS0dOaGNIUnBiMjRwWEhKY2JpQWdJQ0FnSUM1aGNIQmxibVJVYnloMGFHbHpMbDhrWTJGd2RHbHZiaWs3WEhKY2JpQWdmVnh5WEc1Y2NseHVJQ0IwYUdsekxsOXZibEpsYzJsNlpTZ3BPMXh5WEc0Z0lIUm9hWE11WDNWd1pHRjBaVU52Ym5SeWIyeHpLQ2s3WEhKY2JuMDdYSEpjYmx4eVhHNVRiR2xrWlhOb2IzZE5iMlJoYkM1d2NtOTBiM1I1Y0dVdWIzQmxiaUE5SUdaMWJtTjBhVzl1S0dsdVpHVjRLU0I3WEhKY2JpQWdhVzVrWlhnZ1BTQnBibVJsZUNCOGZDQXdPMXh5WEc0Z0lIUm9hWE11WHlSdGIyUmhiQzV6YUc5M0tDazdYSEpjYmlBZ2RHaHBjeTV6YUc5M1NXMWhaMlZCZENocGJtUmxlQ2s3WEhKY2JpQWdkR2hwY3k1ZmFYTlBjR1Z1SUQwZ2RISjFaVHRjY2x4dWZUdGNjbHh1WEhKY2JsTnNhV1JsYzJodmQwMXZaR0ZzTG5CeWIzUnZkSGx3WlM1amJHOXpaU0E5SUdaMWJtTjBhVzl1S0NrZ2UxeHlYRzRnSUhSb2FYTXVYeVJ0YjJSaGJDNW9hV1JsS0NrN1hISmNiaUFnZEdocGN5NWZhWE5QY0dWdUlEMGdabUZzYzJVN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2ROYjJSaGJDNXdjbTkwYjNSNWNHVXVYMjl1UzJWNVJHOTNiaUE5SUdaMWJtTjBhVzl1S0dVcElIdGNjbHh1SUNCcFppQW9JWFJvYVhNdVgybHpUM0JsYmlrZ2NtVjBkWEp1TzF4eVhHNGdJR2xtSUNobExuZG9hV05vSUQwOVBTQkxSVmxmUTA5RVJWTXVURVZHVkY5QlVsSlBWeWtnZTF4eVhHNGdJQ0FnZEdocGN5NWhaSFpoYm1ObFRHVm1kQ2dwTzF4eVhHNGdJSDBnWld4elpTQnBaaUFvWlM1M2FHbGphQ0E5UFQwZ1MwVlpYME5QUkVWVExsSkpSMGhVWDBGU1VrOVhLU0I3WEhKY2JpQWdJQ0IwYUdsekxtRmtkbUZ1WTJWU2FXZG9kQ2dwTzF4eVhHNGdJSDBnWld4elpTQnBaaUFvWlM1M2FHbGphQ0E5UFQwZ1MwVlpYME5QUkVWVExrVlRRMEZRUlNrZ2UxeHlYRzRnSUNBZ2RHaHBjeTVqYkc5elpTZ3BPMXh5WEc0Z0lIMWNjbHh1ZlR0Y2NseHVYSEpjYmxOc2FXUmxjMmh2ZDAxdlpHRnNMbkJ5YjNSdmRIbHdaUzVmZFhCa1lYUmxRMjl1ZEhKdmJITWdQU0JtZFc1amRHbHZiaWdwSUh0Y2NseHVJQ0F2THlCU1pTMWxibUZpYkdWY2NseHVJQ0IwYUdsekxsOGthVzFoWjJWU2FXZG9kQzV5WlcxdmRtVkRiR0Z6Y3loY0ltUnBjMkZpYkdWa1hDSXBPMXh5WEc0Z0lIUm9hWE11WHlScGJXRm5aVXhsWm5RdWNtVnRiM1psUTJ4aGMzTW9YQ0prYVhOaFlteGxaRndpS1R0Y2NseHVYSEpjYmlBZ0x5OGdSR2x6WVdKc1pTQnBaaUIzWlNkMlpTQnlaV0ZqYUdWa0lIUm9aU0IwYUdVZ2JXRjRJRzl5SUcxcGJpQnNhVzFwZEZ4eVhHNGdJR2xtSUNoMGFHbHpMbDlwYm1SbGVDQStQU0IwYUdsekxsOXpiR2xrWlhOb2IzY3VaMlYwVG5WdFNXMWhaMlZ6S0NrZ0xTQXhLU0I3WEhKY2JpQWdJQ0IwYUdsekxsOGthVzFoWjJWU2FXZG9kQzVoWkdSRGJHRnpjeWhjSW1ScGMyRmliR1ZrWENJcE8xeHlYRzRnSUgwZ1pXeHpaU0JwWmlBb2RHaHBjeTVmYVc1a1pYZ2dQRDBnTUNrZ2UxeHlYRzRnSUNBZ2RHaHBjeTVmSkdsdFlXZGxUR1ZtZEM1aFpHUkRiR0Z6Y3loY0ltUnBjMkZpYkdWa1hDSXBPMXh5WEc0Z0lIMWNjbHh1ZlR0Y2NseHVYSEpjYmxOc2FXUmxjMmh2ZDAxdlpHRnNMbkJ5YjNSdmRIbHdaUzVmYjI1U1pYTnBlbVVnUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNCMllYSWdKR2x0WVdkbElEMGdkR2hwY3k1ZkpHbHRZV2RsUTI5dWRHRnBibVZ5TG1acGJtUW9YQ0pwYldkY0lpazdYSEpjYmx4eVhHNGdJQzh2SUZKbGMyVjBJSFJvWlNCamIyNTBaVzUwSjNNZ2QybGtkR2hjY2x4dUlDQjBhR2x6TGw4a1kyOXVkR1Z1ZEM1M2FXUjBhQ2hjSWx3aUtUdGNjbHh1WEhKY2JpQWdMeThnUm1sdVpDQjBhR1VnYzJsNlpTQnZaaUIwYUdVZ1kyOXRjRzl1Wlc1MGN5QjBhR0YwSUc1bFpXUWdkRzhnWW1VZ1pHbHpjR3hoZVdWa0lHbHVJR0ZrWkdsMGFXOXVJSFJ2WEhKY2JpQWdMeThnZEdobElHbHRZV2RsWEhKY2JpQWdkbUZ5SUdOdmJuUnliMnh6VjJsa2RHZ2dQU0IwYUdsekxsOGthVzFoWjJWTVpXWjBMbTkxZEdWeVYybGtkR2dvZEhKMVpTa2dLeUIwYUdsekxsOGthVzFoWjJWU2FXZG9kQzV2ZFhSbGNsZHBaSFJvS0hSeWRXVXBPMXh5WEc0Z0lDOHZJRWhoWTJzZ1ptOXlJRzV2ZHlBdElHSjFaR2RsZENCbWIzSWdNbmdnZEdobElHTmhjSFJwYjI0Z2FHVnBaMmgwTGx4eVhHNGdJSFpoY2lCallYQjBhVzl1U0dWcFoyaDBJRDBnTWlBcUlIUm9hWE11WHlSallYQjBhVzl1TG05MWRHVnlTR1ZwWjJoMEtIUnlkV1VwTzF4eVhHNGdJQzh2SUhaaGNpQnBiV0ZuWlZCaFpHUnBibWNnUFNBa2FXMWhaMlV1YVc1dVpYSlhhV1IwYUNncE8xeHlYRzVjY2x4dUlDQXZMeUJEWVd4amRXeGhkR1VnZEdobElHRjJZV2xzWVdKc1pTQmhjbVZoSUdadmNpQjBhR1VnYlc5a1lXeGNjbHh1SUNCMllYSWdiWGNnUFNCMGFHbHpMbDhrYlc5a1lXd3VkMmxrZEdnb0tTQXRJR052Ym5SeWIyeHpWMmxrZEdnN1hISmNiaUFnZG1GeUlHMW9JRDBnZEdocGN5NWZKRzF2WkdGc0xtaGxhV2RvZENncElDMGdZMkZ3ZEdsdmJraGxhV2RvZER0Y2NseHVYSEpjYmlBZ0x5OGdSbWwwSUhSb1pTQnBiV0ZuWlNCMGJ5QjBhR1VnY21WdFlXbHVhVzVuSUhOamNtVmxiaUJ5WldGc0lHVnpkR0YwWlZ4eVhHNGdJSFpoY2lCelpYUlRhWHBsSUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ0lDQjJZWElnYVhjZ1BTQWthVzFoWjJVdWNISnZjQ2hjSW01aGRIVnlZV3hYYVdSMGFGd2lLVHRjY2x4dUlDQWdJSFpoY2lCcGFDQTlJQ1JwYldGblpTNXdjbTl3S0Z3aWJtRjBkWEpoYkVobGFXZG9kRndpS1R0Y2NseHVJQ0FnSUhaaGNpQnpkeUE5SUdsM0lDOGdiWGM3WEhKY2JpQWdJQ0IyWVhJZ2MyZ2dQU0JwYUNBdklHMW9PMXh5WEc0Z0lDQWdkbUZ5SUhNZ1BTQk5ZWFJvTG0xaGVDaHpkeXdnYzJncE8xeHlYRzVjY2x4dUlDQWdJQzh2SUZObGRDQjNhV1IwYUM5b1pXbG5hSFFnZFhOcGJtY2dRMU5USUdsdUlHOXlaR1Z5SUhSdklISmxjM0JsWTNRZ1ltOTRMWE5wZW1sdVoxeHlYRzRnSUNBZ2FXWWdLSE1nUGlBeEtTQjdYSEpjYmlBZ0lDQWdJQ1JwYldGblpTNWpjM01vWENKM2FXUjBhRndpTENCcGR5QXZJSE1nS3lCY0luQjRYQ0lwTzF4eVhHNGdJQ0FnSUNBa2FXMWhaMlV1WTNOektGd2lhR1ZwWjJoMFhDSXNJR2xvSUM4Z2N5QXJJRndpY0hoY0lpazdYSEpjYmlBZ0lDQjlJR1ZzYzJVZ2UxeHlYRzRnSUNBZ0lDQWthVzFoWjJVdVkzTnpLRndpZDJsa2RHaGNJaXdnYVhjZ0t5QmNJbkI0WENJcE8xeHlYRzRnSUNBZ0lDQWthVzFoWjJVdVkzTnpLRndpYUdWcFoyaDBYQ0lzSUdsb0lDc2dYQ0p3ZUZ3aUtUdGNjbHh1SUNBZ0lIMWNjbHh1WEhKY2JpQWdJQ0IwYUdsekxsOGthVzFoWjJWU2FXZG9kQzVqYzNNb1hDSjBiM0JjSWl3Z0pHbHRZV2RsTG05MWRHVnlTR1ZwWjJoMEtDa2dMeUF5SUNzZ1hDSndlRndpS1R0Y2NseHVJQ0FnSUhSb2FYTXVYeVJwYldGblpVeGxablF1WTNOektGd2lkRzl3WENJc0lDUnBiV0ZuWlM1dmRYUmxja2hsYVdkb2RDZ3BJQzhnTWlBcklGd2ljSGhjSWlrN1hISmNibHh5WEc0Z0lDQWdMeThnVTJWMElIUm9aU0JqYjI1MFpXNTBJSGR5WVhCd1pYSWdkRzhnWW1VZ2RHaGxJSGRwWkhSb0lHOW1JSFJvWlNCcGJXRm5aUzRnVkdocGN5QjNhV3hzSUd0bFpYQmNjbHh1SUNBZ0lDOHZJSFJvWlNCallYQjBhVzl1SUdaeWIyMGdaWGh3WVc1a2FXNW5JR0psZVc5dVpDQjBhR1VnYVcxaFoyVXVYSEpjYmlBZ0lDQjBhR2x6TGw4a1kyOXVkR1Z1ZEM1M2FXUjBhQ2drYVcxaFoyVXViM1YwWlhKWGFXUjBhQ2gwY25WbEtTazdYSEpjYmlBZ2ZTNWlhVzVrS0hSb2FYTXBPMXh5WEc1Y2NseHVJQ0JwWmlBb0pHbHRZV2RsTG5CeWIzQW9YQ0pqYjIxd2JHVjBaVndpS1NrZ2MyVjBVMmw2WlNncE8xeHlYRzRnSUdWc2MyVWdKR2x0WVdkbExtOXVaU2hjSW14dllXUmNJaXdnYzJWMFUybDZaU2s3WEhKY2JuMDdYSEpjYmlJc0luWmhjaUJUYkdsa1pYTm9iM2ROYjJSaGJDQTlJSEpsY1hWcGNtVW9YQ0l1TDNOc2FXUmxjMmh2ZHkxdGIyUmhiQzVxYzF3aUtUdGNjbHh1ZG1GeUlGUm9kVzFpYm1GcGJGTnNhV1JsY2lBOUlISmxjWFZwY21Vb1hDSXVMM1JvZFcxaWJtRnBiQzF6Ykdsa1pYSXVhbk5jSWlrN1hISmNibHh5WEc1dGIyUjFiR1V1Wlhod2IzSjBjeUE5SUh0Y2NseHVJQ0JwYm1sME9pQm1kVzVqZEdsdmJpaDBjbUZ1YzJsMGFXOXVSSFZ5WVhScGIyNHBJSHRjY2x4dUlDQWdJSFJ5WVc1emFYUnBiMjVFZFhKaGRHbHZiaUE5SUhSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlBaFBUMGdkVzVrWldacGJtVmtJRDhnZEhKaGJuTnBkR2x2YmtSMWNtRjBhVzl1SURvZ05EQXdPMXh5WEc0Z0lDQWdkR2hwY3k1ZmMyeHBaR1Z6YUc5M2N5QTlJRnRkTzF4eVhHNGdJQ0FnSkNoY0lpNXpiR2xrWlhOb2IzZGNJaWt1WldGamFDaGNjbHh1SUNBZ0lDQWdablZ1WTNScGIyNG9hVzVrWlhnc0lHVnNaVzFsYm5RcElIdGNjbHh1SUNBZ0lDQWdJQ0IyWVhJZ2MyeHBaR1Z6YUc5M0lEMGdibVYzSUZOc2FXUmxjMmh2ZHlna0tHVnNaVzFsYm5RcExDQjBjbUZ1YzJsMGFXOXVSSFZ5WVhScGIyNHBPMXh5WEc0Z0lDQWdJQ0FnSUhSb2FYTXVYM05zYVdSbGMyaHZkM011Y0hWemFDaHpiR2xrWlhOb2IzY3BPMXh5WEc0Z0lDQWdJQ0I5TG1KcGJtUW9kR2hwY3lsY2NseHVJQ0FnSUNrN1hISmNiaUFnZlZ4eVhHNTlPMXh5WEc1Y2NseHVablZ1WTNScGIyNGdVMnhwWkdWemFHOTNLQ1JqYjI1MFlXbHVaWElzSUhSeVlXNXphWFJwYjI1RWRYSmhkR2x2YmlrZ2UxeHlYRzRnSUhSb2FYTXVYM1J5WVc1emFYUnBiMjVFZFhKaGRHbHZiaUE5SUhSeVlXNXphWFJwYjI1RWRYSmhkR2x2Ymp0Y2NseHVJQ0IwYUdsekxsOGtZMjl1ZEdGcGJtVnlJRDBnSkdOdmJuUmhhVzVsY2p0Y2NseHVJQ0IwYUdsekxsOXBibVJsZUNBOUlEQTdJQzh2SUVsdVpHVjRJRzltSUhObGJHVmpkR1ZrSUdsdFlXZGxYSEpjYmx4eVhHNGdJQzh2SUVOeVpXRjBaU0JqYjIxd2IyNWxiblJ6WEhKY2JpQWdkR2hwY3k1ZmRHaDFiV0p1WVdsc1UyeHBaR1Z5SUQwZ2JtVjNJRlJvZFcxaWJtRnBiRk5zYVdSbGNpZ2tZMjl1ZEdGcGJtVnlMQ0IwYUdsektUdGNjbHh1SUNCMGFHbHpMbDl0YjJSaGJDQTlJRzVsZHlCVGJHbGtaWE5vYjNkTmIyUmhiQ2drWTI5dWRHRnBibVZ5TENCMGFHbHpLVHRjY2x4dVhISmNiaUFnTHk4Z1EyRmphR1VnWVc1a0lHTnlaV0YwWlNCdVpXTmxjM05oY25rZ1JFOU5JR1ZzWlcxbGJuUnpYSEpjYmlBZ2RHaHBjeTVmSkdOaGNIUnBiMjVEYjI1MFlXbHVaWElnUFNBa1kyOXVkR0ZwYm1WeUxtWnBibVFvWENJdVkyRndkR2x2Ymx3aUtUdGNjbHh1SUNCMGFHbHpMbDhrYzJWc1pXTjBaV1JKYldGblpVTnZiblJoYVc1bGNpQTlJQ1JqYjI1MFlXbHVaWEl1Wm1sdVpDaGNJaTV6Wld4bFkzUmxaQzFwYldGblpWd2lLVHRjY2x4dVhISmNiaUFnTHk4Z1QzQmxiaUJ0YjJSaGJDQnZiaUJqYkdsamEybHVaeUJ6Wld4bFkzUmxaQ0JwYldGblpWeHlYRzRnSUhSb2FYTXVYeVJ6Wld4bFkzUmxaRWx0WVdkbFEyOXVkR0ZwYm1WeUxtOXVLRnh5WEc0Z0lDQWdYQ0pqYkdsamExd2lMRnh5WEc0Z0lDQWdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdJQ0FnSUhSb2FYTXVYMjF2WkdGc0xtOXdaVzRvZEdocGN5NWZhVzVrWlhncE8xeHlYRzRnSUNBZ2ZTNWlhVzVrS0hSb2FYTXBYSEpjYmlBZ0tUdGNjbHh1WEhKY2JpQWdMeThnVEc5aFpDQnBiV0ZuWlhOY2NseHVJQ0IwYUdsekxsOGtaMkZzYkdWeWVVbHRZV2RsY3lBOUlIUm9hWE11WDJ4dllXUkhZV3hzWlhKNVNXMWhaMlZ6S0NrN1hISmNiaUFnZEdocGN5NWZiblZ0U1cxaFoyVnpJRDBnZEdocGN5NWZKR2RoYkd4bGNubEpiV0ZuWlhNdWJHVnVaM1JvTzF4eVhHNWNjbHh1SUNBdkx5QlRhRzkzSUhSb1pTQm1hWEp6ZENCcGJXRm5aVnh5WEc0Z0lIUm9hWE11YzJodmQwbHRZV2RsS0RBcE8xeHlYRzU5WEhKY2JseHlYRzVUYkdsa1pYTm9iM2N1Y0hKdmRHOTBlWEJsTG1kbGRFRmpkR2wyWlVsdVpHVjRJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnY21WMGRYSnVJSFJvYVhNdVgybHVaR1Y0TzF4eVhHNTlPMXh5WEc1Y2NseHVVMnhwWkdWemFHOTNMbkJ5YjNSdmRIbHdaUzVuWlhST2RXMUpiV0ZuWlhNZ1BTQm1kVzVqZEdsdmJpZ3BJSHRjY2x4dUlDQnlaWFIxY200Z2RHaHBjeTVmYm5WdFNXMWhaMlZ6TzF4eVhHNTlPMXh5WEc1Y2NseHVVMnhwWkdWemFHOTNMbkJ5YjNSdmRIbHdaUzVuWlhSSFlXeHNaWEo1U1cxaFoyVWdQU0JtZFc1amRHbHZiaWhwYm1SbGVDa2dlMXh5WEc0Z0lISmxkSFZ5YmlCMGFHbHpMbDhrWjJGc2JHVnllVWx0WVdkbGMxdHBibVJsZUYwN1hISmNibjA3WEhKY2JseHlYRzVUYkdsa1pYTm9iM2N1Y0hKdmRHOTBlWEJsTG1kbGRFTmhjSFJwYjI0Z1BTQm1kVzVqZEdsdmJpaHBibVJsZUNrZ2UxeHlYRzRnSUhKbGRIVnliaUIwYUdsekxsOGtaMkZzYkdWeWVVbHRZV2RsYzF0cGJtUmxlRjB1WkdGMFlTaGNJbU5oY0hScGIyNWNJaWs3WEhKY2JuMDdYSEpjYmx4eVhHNVRiR2xrWlhOb2IzY3VjSEp2ZEc5MGVYQmxMbk5vYjNkSmJXRm5aU0E5SUdaMWJtTjBhVzl1S0dsdVpHVjRLU0I3WEhKY2JpQWdMeThnVW1WelpYUWdZV3hzSUdsdFlXZGxjeUIwYnlCcGJuWnBjMmxpYkdVZ1lXNWtJR3h2ZDJWemRDQjZMV2x1WkdWNExpQlVhR2x6SUdOdmRXeGtJR0psSUhOdFlYSjBaWElzWEhKY2JpQWdMeThnYkdsclpTQkliM1psY2xOc2FXUmxjMmh2ZHl3Z1lXNWtJRzl1YkhrZ2NtVnpaWFFnWlhoaFkzUnNlU0IzYUdGMElIZGxJRzVsWldRc0lHSjFkQ0IzWlNCaGNtVnVKM1JjY2x4dUlDQXZMeUIzWVhOMGFXNW5JSFJvWVhRZ2JXRnVlU0JqZVdOc1pYTXVYSEpjYmlBZ2RHaHBjeTVmSkdkaGJHeGxjbmxKYldGblpYTXVabTl5UldGamFDaG1kVzVqZEdsdmJpZ2taMkZzYkdWeWVVbHRZV2RsS1NCN1hISmNiaUFnSUNBa1oyRnNiR1Z5ZVVsdFlXZGxMbU56Y3loN1hISmNiaUFnSUNBZ0lIcEpibVJsZURvZ01DeGNjbHh1SUNBZ0lDQWdiM0JoWTJsMGVUb2dNRnh5WEc0Z0lDQWdmU2s3WEhKY2JpQWdJQ0FrWjJGc2JHVnllVWx0WVdkbExuWmxiRzlqYVhSNUtGd2ljM1J2Y0Z3aUtUc2dMeThnVTNSdmNDQmhibmtnWVc1cGJXRjBhVzl1YzF4eVhHNGdJSDBzSUhSb2FYTXBPMXh5WEc1Y2NseHVJQ0F2THlCRFlXTm9aU0J5WldabGNtVnVZMlZ6SUhSdklIUm9aU0JzWVhOMElHRnVaQ0JqZFhKeVpXNTBJR2x0WVdkbFhISmNiaUFnZG1GeUlDUnNZWE4wU1cxaFoyVWdQU0IwYUdsekxsOGtaMkZzYkdWeWVVbHRZV2RsYzF0MGFHbHpMbDlwYm1SbGVGMDdYSEpjYmlBZ2RtRnlJQ1JqZFhKeVpXNTBTVzFoWjJVZ1BTQjBhR2x6TGw4a1oyRnNiR1Z5ZVVsdFlXZGxjMXRwYm1SbGVGMDdYSEpjYmlBZ2RHaHBjeTVmYVc1a1pYZ2dQU0JwYm1SbGVEdGNjbHh1WEhKY2JpQWdMeThnVFdGclpTQjBhR1VnYkdGemRDQnBiV0ZuWlNCMmFYTnBjMkpzWlNCaGJtUWdkR2hsYmlCaGJtbHRZWFJsSUhSb1pTQmpkWEp5Wlc1MElHbHRZV2RsSUdsdWRHOGdkbWxsZDF4eVhHNGdJQzh2SUc5dUlIUnZjQ0J2WmlCMGFHVWdiR0Z6ZEZ4eVhHNGdJQ1JzWVhOMFNXMWhaMlV1WTNOektGd2lla2x1WkdWNFhDSXNJREVwTzF4eVhHNGdJQ1JqZFhKeVpXNTBTVzFoWjJVdVkzTnpLRndpZWtsdVpHVjRYQ0lzSURJcE8xeHlYRzRnSUNSc1lYTjBTVzFoWjJVdVkzTnpLRndpYjNCaFkybDBlVndpTENBeEtUdGNjbHh1SUNBa1kzVnljbVZ1ZEVsdFlXZGxMblpsYkc5amFYUjVLSHNnYjNCaFkybDBlVG9nTVNCOUxDQjBhR2x6TGw5MGNtRnVjMmwwYVc5dVJIVnlZWFJwYjI0c0lGd2laV0Z6WlVsdVQzVjBVWFZoWkZ3aUtUdGNjbHh1WEhKY2JpQWdMeThnUTNKbFlYUmxJSFJvWlNCallYQjBhVzl1TENCcFppQnBkQ0JsZUdsemRITWdiMjRnZEdobElIUm9kVzFpYm1GcGJGeHlYRzRnSUhaaGNpQmpZWEIwYVc5dUlEMGdKR04xY25KbGJuUkpiV0ZuWlM1a1lYUmhLRndpWTJGd2RHbHZibHdpS1R0Y2NseHVJQ0JwWmlBb1kyRndkR2x2YmlrZ2UxeHlYRzRnSUNBZ2RHaHBjeTVmSkdOaGNIUnBiMjVEYjI1MFlXbHVaWEl1Wlcxd2RIa29LVHRjY2x4dUlDQWdJQ1FvWENJOGMzQmhiajVjSWlsY2NseHVJQ0FnSUNBZ0xtRmtaRU5zWVhOektGd2labWxuZFhKbExXNTFiV0psY2x3aUtWeHlYRzRnSUNBZ0lDQXVkR1Y0ZENoY0lrWnBaeTRnWENJZ0t5QW9kR2hwY3k1ZmFXNWtaWGdnS3lBeEtTQXJJRndpT2lCY0lpbGNjbHh1SUNBZ0lDQWdMbUZ3Y0dWdVpGUnZLSFJvYVhNdVh5UmpZWEIwYVc5dVEyOXVkR0ZwYm1WeUtUdGNjbHh1SUNBZ0lDUW9YQ0k4YzNCaGJqNWNJaWxjY2x4dUlDQWdJQ0FnTG1Ga1pFTnNZWE56S0Z3aVkyRndkR2x2YmkxMFpYaDBYQ0lwWEhKY2JpQWdJQ0FnSUM1MFpYaDBLR05oY0hScGIyNHBYSEpjYmlBZ0lDQWdJQzVoY0hCbGJtUlVieWgwYUdsekxsOGtZMkZ3ZEdsdmJrTnZiblJoYVc1bGNpazdYSEpjYmlBZ2ZWeHlYRzVjY2x4dUlDQXZMeUJQWW1wbFkzUWdhVzFoWjJVZ1ptbDBJSEJ2YkhsbWFXeHNJR0p5WldGcmN5QnFVWFZsY25rZ1lYUjBjaWd1TGk0cExDQnpieUJtWVd4c1ltRmpheUIwYnlCcWRYTjBYSEpjYmlBZ0x5OGdkWE5wYm1jZ1pXeGxiV1Z1ZEM1emNtTmNjbHh1SUNBdkx5QlVUMFJQT2lCTVlYcDVJVnh5WEc0Z0lDOHZJR2xtSUNna1kzVnljbVZ1ZEVsdFlXZGxMbWRsZENnd0tTNXpjbU1nUFQwOUlGd2lYQ0lwSUh0Y2NseHVJQ0F2THlBZ0lDQWdKR04xY25KbGJuUkpiV0ZuWlM1blpYUW9NQ2t1YzNKaklEMGdKR04xY25KbGJuUkpiV0ZuWlM1a1lYUmhLRndpYVcxaFoyVXRkWEpzWENJcE8xeHlYRzRnSUM4dklIMWNjbHh1ZlR0Y2NseHVYSEpjYmxOc2FXUmxjMmh2ZHk1d2NtOTBiM1I1Y0dVdVgyeHZZV1JIWVd4c1pYSjVTVzFoWjJWeklEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdMeThnUTNKbFlYUmxJR1Z0Y0hSNUlHbHRZV2RsY3lCcGJpQjBhR1VnWjJGc2JHVnllU0JtYjNJZ1pXRmphQ0IwYUhWdFltNWhhV3d1SUZSb2FYTWdhR1ZzY0hNZ2RYTWdaRzljY2x4dUlDQXZMeUJzWVhwNUlHeHZZV1JwYm1jZ2IyWWdaMkZzYkdWeWVTQnBiV0ZuWlhNZ1lXNWtJR0ZzYkc5M2N5QjFjeUIwYnlCamNtOXpjeTFtWVdSbElHbHRZV2RsY3k1Y2NseHVJQ0IyWVhJZ0pHZGhiR3hsY25sSmJXRm5aWE1nUFNCYlhUdGNjbHh1SUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElIUm9hWE11WDNSb2RXMWlibUZwYkZOc2FXUmxjaTVuWlhST2RXMVVhSFZ0WW01aGFXeHpLQ2s3SUdrZ0t6MGdNU2tnZTF4eVhHNGdJQ0FnTHk4Z1IyVjBJSFJvWlNCMGFIVnRZbTVoYVd3Z1pXeGxiV1Z1ZENCM2FHbGphQ0JvWVhNZ2NHRjBhQ0JoYm1RZ1kyRndkR2x2YmlCa1lYUmhYSEpjYmlBZ0lDQjJZWElnSkhSb2RXMWlJRDBnZEdocGN5NWZkR2gxYldKdVlXbHNVMnhwWkdWeUxtZGxkQ1JVYUhWdFltNWhhV3dvYVNrN1hISmNibHh5WEc0Z0lDQWdMeThnUTJGc1kzVnNZWFJsSUhSb1pTQnBaQ0JtY205dElIUm9aU0J3WVhSb0lIUnZJSFJvWlNCc1lYSm5aU0JwYldGblpWeHlYRzRnSUNBZ2RtRnlJR3hoY21kbFVHRjBhQ0E5SUNSMGFIVnRZaTVrWVhSaEtGd2liR0Z5WjJVdGNHRjBhRndpS1R0Y2NseHVJQ0FnSUhaaGNpQnBaQ0E5SUd4aGNtZGxVR0YwYUZ4eVhHNGdJQ0FnSUNBdWMzQnNhWFFvWENJdlhDSXBYSEpjYmlBZ0lDQWdJQzV3YjNBb0tWeHlYRzRnSUNBZ0lDQXVjM0JzYVhRb1hDSXVYQ0lwV3pCZE8xeHlYRzVjY2x4dUlDQWdJQzh2SUVOeVpXRjBaU0JoSUdkaGJHeGxjbmtnYVcxaFoyVWdaV3hsYldWdWRGeHlYRzRnSUNBZ2RtRnlJQ1JuWVd4c1pYSjVTVzFoWjJVZ1BTQWtLRndpUEdsdFp6NWNJaXdnZXlCcFpEb2dhV1FnZlNsY2NseHVJQ0FnSUNBZ0xtTnpjeWg3WEhKY2JpQWdJQ0FnSUNBZ2NHOXphWFJwYjI0NklGd2lZV0p6YjJ4MWRHVmNJaXhjY2x4dUlDQWdJQ0FnSUNCMGIzQTZJRndpTUhCNFhDSXNYSEpjYmlBZ0lDQWdJQ0FnYkdWbWREb2dYQ0l3Y0hoY0lpeGNjbHh1SUNBZ0lDQWdJQ0J2Y0dGamFYUjVPaUF3TEZ4eVhHNGdJQ0FnSUNBZ0lIcEpibVJsZURvZ01GeHlYRzRnSUNBZ0lDQjlLVnh5WEc0Z0lDQWdJQ0F1WkdGMFlTaGNJbWx0WVdkbExYVnliRndpTENCc1lYSm5aVkJoZEdncFhISmNiaUFnSUNBZ0lDNWtZWFJoS0Z3aVkyRndkR2x2Ymx3aUxDQWtkR2gxYldJdVpHRjBZU2hjSW1OaGNIUnBiMjVjSWlrcFhISmNiaUFnSUNBZ0lDNWhjSEJsYm1SVWJ5aDBhR2x6TGw4a2MyVnNaV04wWldSSmJXRm5aVU52Ym5SaGFXNWxjaWs3WEhKY2JpQWdJQ0FrWjJGc2JHVnllVWx0WVdkbExtZGxkQ2d3S1M1emNtTWdQU0JzWVhKblpWQmhkR2c3SUM4dklGUlBSRTg2SUUxaGEyVWdkR2hwY3lCc1lYcDVJVnh5WEc0Z0lDQWdKR2RoYkd4bGNubEpiV0ZuWlhNdWNIVnphQ2drWjJGc2JHVnllVWx0WVdkbEtUdGNjbHh1SUNCOVhISmNiaUFnY21WMGRYSnVJQ1JuWVd4c1pYSjVTVzFoWjJWek8xeHlYRzU5TzF4eVhHNGlMQ0p0YjJSMWJHVXVaWGh3YjNKMGN5QTlJRlJvZFcxaWJtRnBiRk5zYVdSbGNqdGNjbHh1WEhKY2JtWjFibU4wYVc5dUlGUm9kVzFpYm1GcGJGTnNhV1JsY2lna1kyOXVkR0ZwYm1WeUxDQnpiR2xrWlhOb2IzY3BJSHRjY2x4dUlDQjBhR2x6TGw4a1kyOXVkR0ZwYm1WeUlEMGdKR052Ym5SaGFXNWxjanRjY2x4dUlDQjBhR2x6TGw5emJHbGtaWE5vYjNjZ1BTQnpiR2xrWlhOb2IzYzdYSEpjYmx4eVhHNGdJSFJvYVhNdVgybHVaR1Y0SUQwZ01Ec2dMeThnU1c1a1pYZ2diMllnYzJWc1pXTjBaV1FnZEdoMWJXSnVZV2xzWEhKY2JpQWdkR2hwY3k1ZmMyTnliMnhzU1c1a1pYZ2dQU0F3T3lBdkx5QkpibVJsZUNCdlppQjBhR1VnZEdoMWJXSnVZV2xzSUhSb1lYUWdhWE1nWTNWeWNtVnVkR3g1SUdObGJuUmxjbVZrWEhKY2JseHlYRzRnSUM4dklFTmhZMmhsSUdGdVpDQmpjbVZoZEdVZ2JtVmpaWE56WVhKNUlFUlBUU0JsYkdWdFpXNTBjMXh5WEc0Z0lIUm9hWE11WHlSMGFIVnRZbTVoYVd4RGIyNTBZV2x1WlhJZ1BTQWtZMjl1ZEdGcGJtVnlMbVpwYm1Rb1hDSXVkR2gxYldKdVlXbHNjMXdpS1R0Y2NseHVJQ0IwYUdsekxsOGtkR2gxYldKdVlXbHNTVzFoWjJWeklEMGdkR2hwY3k1ZkpIUm9kVzFpYm1GcGJFTnZiblJoYVc1bGNpNW1hVzVrS0Z3aWFXMW5YQ0lwTzF4eVhHNGdJSFJvYVhNdVh5UjJhWE5wWW14bFZHaDFiV0p1WVdsc1YzSmhjQ0E5SUNSamIyNTBZV2x1WlhJdVptbHVaQ2hjSWk1MmFYTnBZbXhsTFhSb2RXMWlibUZwYkhOY0lpazdYSEpjYmlBZ2RHaHBjeTVmSkdGa2RtRnVZMlZNWldaMElEMGdKR052Ym5SaGFXNWxjaTVtYVc1a0tGd2lMblJvZFcxaWJtRnBiQzFoWkhaaGJtTmxMV3hsWm5SY0lpazdYSEpjYmlBZ2RHaHBjeTVmSkdGa2RtRnVZMlZTYVdkb2RDQTlJQ1JqYjI1MFlXbHVaWEl1Wm1sdVpDaGNJaTUwYUhWdFltNWhhV3d0WVdSMllXNWpaUzF5YVdkb2RGd2lLVHRjY2x4dVhISmNiaUFnTHk4Z1RHOXZjQ0IwYUhKdmRXZG9JSFJvWlNCMGFIVnRZbTVoYVd4ekxDQm5hWFpsSUhSb1pXMGdZVzRnYVc1a1pYZ2daR0YwWVNCaGRIUnlhV0oxZEdVZ1lXNWtJR05oWTJobFhISmNiaUFnTHk4Z1lTQnlaV1psY21WdVkyVWdkRzhnZEdobGJTQnBiaUJoYmlCaGNuSmhlVnh5WEc0Z0lIUm9hWE11WHlSMGFIVnRZbTVoYVd4eklEMGdXMTA3WEhKY2JpQWdkR2hwY3k1ZkpIUm9kVzFpYm1GcGJFbHRZV2RsY3k1bFlXTm9LRnh5WEc0Z0lDQWdablZ1WTNScGIyNG9hVzVrWlhnc0lHVnNaVzFsYm5RcElIdGNjbHh1SUNBZ0lDQWdkbUZ5SUNSMGFIVnRZbTVoYVd3Z1BTQWtLR1ZzWlcxbGJuUXBPMXh5WEc0Z0lDQWdJQ0FrZEdoMWJXSnVZV2xzTG1SaGRHRW9YQ0pwYm1SbGVGd2lMQ0JwYm1SbGVDazdYSEpjYmlBZ0lDQWdJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeHpMbkIxYzJnb0pIUm9kVzFpYm1GcGJDazdYSEpjYmlBZ0lDQjlMbUpwYm1Rb2RHaHBjeWxjY2x4dUlDQXBPMXh5WEc0Z0lIUm9hWE11WDI1MWJVbHRZV2RsY3lBOUlIUm9hWE11WHlSMGFIVnRZbTVoYVd4ekxteGxibWQwYUR0Y2NseHVYSEpjYmlBZ0x5OGdUR1ZtZEM5eWFXZG9kQ0JqYjI1MGNtOXNjMXh5WEc0Z0lIUm9hWE11WHlSaFpIWmhibU5sVEdWbWRDNXZiaWhjSW1Oc2FXTnJYQ0lzSUhSb2FYTXVZV1IyWVc1alpVeGxablF1WW1sdVpDaDBhR2x6S1NrN1hISmNiaUFnZEdocGN5NWZKR0ZrZG1GdVkyVlNhV2RvZEM1dmJpaGNJbU5zYVdOclhDSXNJSFJvYVhNdVlXUjJZVzVqWlZKcFoyaDBMbUpwYm1Rb2RHaHBjeWtwTzF4eVhHNWNjbHh1SUNBdkx5QkRiR2xqYTJsdVp5QmhJSFJvZFcxaWJtRnBiRnh5WEc0Z0lIUm9hWE11WHlSMGFIVnRZbTVoYVd4SmJXRm5aWE11YjI0b1hDSmpiR2xqYTF3aUxDQjBhR2x6TGw5dmJrTnNhV05yTG1KcGJtUW9kR2hwY3lrcE8xeHlYRzVjY2x4dUlDQjBhR2x6TGw5aFkzUnBkbUYwWlZSb2RXMWlibUZwYkNnd0tUdGNjbHh1WEhKY2JpQWdMeThnVW1WemFYcGxYSEpjYmlBZ0pDaDNhVzVrYjNjcExtOXVLRndpY21WemFYcGxYQ0lzSUhSb2FYTXVYMjl1VW1WemFYcGxMbUpwYm1Rb2RHaHBjeWtwTzF4eVhHNWNjbHh1SUNBdkx5QkdiM0lnYzI5dFpTQnlaV0Z6YjI0c0lIUm9aU0J6YVhwcGJtY2diMjRnZEdobElHTnZiblJ5YjJ4eklHbHpJRzFsYzNObFpDQjFjQ0JwWmlCcGRDQnlkVzV6WEhKY2JpQWdMeThnYVcxdFpXUnBZWFJsYkhrZ0xTQmtaV3hoZVNCemFYcHBibWNnZFc1MGFXd2djM1JoWTJzZ2FYTWdZMnhsWVhKY2NseHVJQ0J6WlhSVWFXMWxiM1YwS0Z4eVhHNGdJQ0FnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnSUNBZ0lIUm9hWE11WDI5dVVtVnphWHBsS0NrN1hISmNiaUFnSUNCOUxtSnBibVFvZEdocGN5a3NYSEpjYmlBZ0lDQXdYSEpjYmlBZ0tUdGNjbHh1ZlZ4eVhHNWNjbHh1VkdoMWJXSnVZV2xzVTJ4cFpHVnlMbkJ5YjNSdmRIbHdaUzVuWlhSQlkzUnBkbVZKYm1SbGVDQTlJR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNGdJSEpsZEhWeWJpQjBhR2x6TGw5cGJtUmxlRHRjY2x4dWZUdGNjbHh1WEhKY2JsUm9kVzFpYm1GcGJGTnNhV1JsY2k1d2NtOTBiM1I1Y0dVdVoyVjBUblZ0VkdoMWJXSnVZV2xzY3lBOUlHWjFibU4wYVc5dUtDa2dlMXh5WEc0Z0lISmxkSFZ5YmlCMGFHbHpMbDl1ZFcxSmJXRm5aWE03WEhKY2JuMDdYSEpjYmx4eVhHNVVhSFZ0WW01aGFXeFRiR2xrWlhJdWNISnZkRzkwZVhCbExtZGxkQ1JVYUhWdFltNWhhV3dnUFNCbWRXNWpkR2x2YmlocGJtUmxlQ2tnZTF4eVhHNGdJSEpsZEhWeWJpQjBhR2x6TGw4a2RHaDFiV0p1WVdsc2MxdHBibVJsZUYwN1hISmNibjA3WEhKY2JseHlYRzVVYUhWdFltNWhhV3hUYkdsa1pYSXVjSEp2ZEc5MGVYQmxMbUZrZG1GdVkyVk1aV1owSUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2RtRnlJRzVsZDBsdVpHVjRJRDBnZEdocGN5NWZjMk55YjJ4c1NXNWtaWGdnTFNCMGFHbHpMbDl1ZFcxV2FYTnBZbXhsTzF4eVhHNGdJRzVsZDBsdVpHVjRJRDBnVFdGMGFDNXRZWGdvYm1WM1NXNWtaWGdzSURBcE8xeHlYRzRnSUhSb2FYTXVYM05qY205c2JGUnZWR2gxYldKdVlXbHNLRzVsZDBsdVpHVjRLVHRjY2x4dWZUdGNjbHh1WEhKY2JsUm9kVzFpYm1GcGJGTnNhV1JsY2k1d2NtOTBiM1I1Y0dVdVlXUjJZVzVqWlZKcFoyaDBJRDBnWm5WdVkzUnBiMjRvS1NCN1hISmNiaUFnZG1GeUlHNWxkMGx1WkdWNElEMGdkR2hwY3k1ZmMyTnliMnhzU1c1a1pYZ2dLeUIwYUdsekxsOXVkVzFXYVhOcFlteGxPMXh5WEc0Z0lHNWxkMGx1WkdWNElEMGdUV0YwYUM1dGFXNG9ibVYzU1c1a1pYZ3NJSFJvYVhNdVgyNTFiVWx0WVdkbGN5QXRJREVwTzF4eVhHNGdJSFJvYVhNdVgzTmpjbTlzYkZSdlZHaDFiV0p1WVdsc0tHNWxkMGx1WkdWNEtUdGNjbHh1ZlR0Y2NseHVYSEpjYmxSb2RXMWlibUZwYkZOc2FXUmxjaTV3Y205MGIzUjVjR1V1WDNKbGMyVjBVMmw2YVc1bklEMGdablZ1WTNScGIyNG9LU0I3WEhKY2JpQWdMeThnVW1WelpYUWdjMmw2YVc1bklIWmhjbWxoWW14bGN5NGdWR2hwY3lCcGJtTnNkV1JsY3lCeVpYTmxkSFJwYm1jZ1lXNTVJR2x1YkdsdVpTQnpkSGxzWlNCMGFHRjBJR2hoYzF4eVhHNGdJQzh2SUdKbFpXNGdZWEJ3YkdsbFpDd2djMjhnZEdoaGRDQmhibmtnYzJsNlpTQmpZV3hqZFd4aGRHbHZibk1nWTJGdUlHSmxJR0poYzJWa0lHOXVJSFJvWlNCRFUxTmNjbHh1SUNBdkx5QnpkSGxzYVc1bkxseHlYRzRnSUhSb2FYTXVYeVIwYUhWdFltNWhhV3hEYjI1MFlXbHVaWEl1WTNOektIdGNjbHh1SUNBZ0lIUnZjRG9nWENKY0lpeGNjbHh1SUNBZ0lHeGxablE2SUZ3aVhDSXNYSEpjYmlBZ0lDQjNhV1IwYURvZ1hDSmNJaXhjY2x4dUlDQWdJR2hsYVdkb2REb2dYQ0pjSWx4eVhHNGdJSDBwTzF4eVhHNGdJSFJvYVhNdVh5UjJhWE5wWW14bFZHaDFiV0p1WVdsc1YzSmhjQzUzYVdSMGFDaGNJbHdpS1R0Y2NseHVJQ0IwYUdsekxsOGtkbWx6YVdKc1pWUm9kVzFpYm1GcGJGZHlZWEF1YUdWcFoyaDBLRndpWENJcE8xeHlYRzRnSUM4dklFMWhhMlVnWVd4c0lIUm9kVzFpYm1GcGJITWdjM0YxWVhKbElHRnVaQ0J5WlhObGRDQmhibmtnYUdWcFoyaDBYSEpjYmlBZ2RHaHBjeTVmSkhSb2RXMWlibUZwYkhNdVptOXlSV0ZqYUNobWRXNWpkR2x2Ymlna1pXeGxiV1Z1ZENrZ2UxeHlYRzRnSUNBZ0pHVnNaVzFsYm5RdWFHVnBaMmgwS0Z3aVhDSXBPeUF2THlCU1pYTmxkQ0JvWldsbmFIUWdZbVZtYjNKbElITmxkSFJwYm1jZ2QybGtkR2hjY2x4dUlDQWdJQ1JsYkdWdFpXNTBMbmRwWkhSb0tDUmxiR1Z0Wlc1MExtaGxhV2RvZENncEtUdGNjbHh1SUNCOUtUdGNjbHh1ZlR0Y2NseHVYSEpjYmxSb2RXMWlibUZwYkZOc2FXUmxjaTV3Y205MGIzUjVjR1V1WDI5dVVtVnphWHBsSUQwZ1puVnVZM1JwYjI0b0tTQjdYSEpjYmlBZ2RHaHBjeTVmY21WelpYUlRhWHBwYm1jb0tUdGNjbHh1WEhKY2JpQWdMeThnUTJGc1kzVnNZWFJsSUhSb1pTQnphWHBsSUc5bUlIUm9aU0JtYVhKemRDQjBhSFZ0WW01aGFXd3VJRlJvYVhNZ1lYTnpkVzFsY3lCMGFHVWdabWx5YzNRZ2FXMWhaMlZjY2x4dUlDQXZMeUJ2Ym14NUlHaGhjeUJoSUhKcFoyaDBMWE5wWkdVZ2JXRnlaMmx1TGx4eVhHNGdJSFpoY2lBa1ptbHljM1JVYUhWdFlpQTlJSFJvYVhNdVh5UjBhSFZ0WW01aGFXeHpXekJkTzF4eVhHNGdJSFpoY2lCMGFIVnRZbE5wZW1VZ1BTQWtabWx5YzNSVWFIVnRZaTV2ZFhSbGNraGxhV2RvZENobVlXeHpaU2s3WEhKY2JpQWdkbUZ5SUhSb2RXMWlUV0Z5WjJsdUlEMGdNaUFxSUNna1ptbHljM1JVYUhWdFlpNXZkWFJsY2xkcFpIUm9LSFJ5ZFdVcElDMGdkR2gxYldKVGFYcGxLVHRjY2x4dVhISmNiaUFnTHk4Z1RXVmhjM1Z5WlNCamIyNTBjbTlzY3k0Z1ZHaGxlU0J1WldWa0lIUnZJR0psSUhacGMybGliR1VnYVc0Z2IzSmtaWElnZEc4Z1ltVWdiV1ZoYzNWeVpXUXVYSEpjYmlBZ2RHaHBjeTVmSkdGa2RtRnVZMlZTYVdkb2RDNWpjM01vWENKa2FYTndiR0Y1WENJc0lGd2lZbXh2WTJ0Y0lpazdYSEpjYmlBZ2RHaHBjeTVmSkdGa2RtRnVZMlZNWldaMExtTnpjeWhjSW1ScGMzQnNZWGxjSWl3Z1hDSmliRzlqYTF3aUtUdGNjbHh1SUNCMllYSWdkR2gxYldKRGIyNTBjbTlzVjJsa2RHZ2dQVnh5WEc0Z0lDQWdkR2hwY3k1ZkpHRmtkbUZ1WTJWU2FXZG9kQzV2ZFhSbGNsZHBaSFJvS0hSeWRXVXBJQ3NnZEdocGN5NWZKR0ZrZG1GdVkyVk1aV1owTG05MWRHVnlWMmxrZEdnb2RISjFaU2s3WEhKY2JseHlYRzRnSUM4dklFTmhiR04xYkdGMFpTQm9iM2NnYldGdWVTQm1kV3hzSUhSb2RXMWlibUZwYkhNZ1kyRnVJR1pwZENCM2FYUm9hVzRnZEdobElIUm9kVzFpYm1GcGJDQmhjbVZoWEhKY2JpQWdkbUZ5SUhacGMybGliR1ZYYVdSMGFDQTlJSFJvYVhNdVh5UjJhWE5wWW14bFZHaDFiV0p1WVdsc1YzSmhjQzV2ZFhSbGNsZHBaSFJvS0daaGJITmxLVHRjY2x4dUlDQjJZWElnYm5WdFZHaDFiV0p6Vm1semFXSnNaU0E5SUUxaGRHZ3VabXh2YjNJb0tIWnBjMmxpYkdWWGFXUjBhQ0F0SUhSb2RXMWlUV0Z5WjJsdUtTQXZJQ2gwYUhWdFlsTnBlbVVnS3lCMGFIVnRZazFoY21kcGJpa3BPMXh5WEc1Y2NseHVJQ0F2THlCRGFHVmpheUIzYUdWMGFHVnlJR0ZzYkNCMGFHVWdkR2gxYldKdVlXbHNjeUJqWVc0Z1ptbDBJRzl1SUhSb1pTQnpZM0psWlc0Z1lYUWdiMjVqWlZ4eVhHNGdJR2xtSUNodWRXMVVhSFZ0WW5OV2FYTnBZbXhsSUR3Z2RHaHBjeTVmYm5WdFNXMWhaMlZ6S1NCN1hISmNiaUFnSUNBdkx5QlVZV3RsSUdFZ1ltVnpkQ0JuZFdWemN5QmhkQ0JvYjNjZ2RHOGdjMmw2WlNCMGFHVWdkR2gxYldKdVlXbHNjeTRnVTJsNlpTQm1iM0p0ZFd4aE9seHlYRzRnSUNBZ0x5OGdJSGRwWkhSb0lEMGdiblZ0SUNvZ2RHaDFiV0pUYVhwbElDc2dLRzUxYlNBdElERXBJQ29nZEdoMWJXSk5ZWEpuYVc0Z0t5QmpiMjUwY205c1UybDZaVnh5WEc0Z0lDQWdMeThnVTI5c2RtVWdabTl5SUc1MWJXSmxjaUJ2WmlCMGFIVnRZbTVoYVd4eklHRnVaQ0J5YjNWdVpDQjBieUIwYUdVZ2JtVmhjbVZ6ZENCcGJuUmxaMlZ5SUhOdlhISmNiaUFnSUNBdkx5QjBhR0YwSUhkbElHUnZiaWQwSUdoaGRtVWdZVzU1SUhCaGNuUnBZV3dnZEdoMWJXSnVZV2xzY3lCemFHOTNhVzVuTGx4eVhHNGdJQ0FnYm5WdFZHaDFiV0p6Vm1semFXSnNaU0E5SUUxaGRHZ3VjbTkxYm1Rb1hISmNiaUFnSUNBZ0lDaDJhWE5wWW14bFYybGtkR2dnTFNCMGFIVnRZa052Ym5SeWIyeFhhV1IwYUNBcklIUm9kVzFpVFdGeVoybHVLU0F2SUNoMGFIVnRZbE5wZW1VZ0t5QjBhSFZ0WWsxaGNtZHBiaWxjY2x4dUlDQWdJQ2s3WEhKY2JseHlYRzRnSUNBZ0x5OGdWWE5sSUhSb2FYTWdiblZ0WW1WeUlHOW1JSFJvZFcxaWJtRnBiSE1nZEc4Z1kyRnNZM1ZzWVhSbElIUm9aU0IwYUhWdFltNWhhV3dnYzJsNlpWeHlYRzRnSUNBZ2RtRnlJRzVsZDFOcGVtVWdQU0FvZG1semFXSnNaVmRwWkhSb0lDMGdkR2gxYldKRGIyNTBjbTlzVjJsa2RHZ2dLeUIwYUhWdFlrMWhjbWRwYmlrZ0x5QnVkVzFVYUhWdFluTldhWE5wWW14bElDMGdkR2gxYldKTllYSm5hVzQ3WEhKY2JpQWdJQ0IwYUdsekxsOGtkR2gxYldKdVlXbHNjeTVtYjNKRllXTm9LR1oxYm1OMGFXOXVLQ1JsYkdWdFpXNTBLU0I3WEhKY2JpQWdJQ0FnSUM4dklDUXVkMmxrZEdnZ1lXNWtJQ1F1YUdWcFoyaDBJSE5sZENCMGFHVWdZMjl1ZEdWdWRDQnphWHBsSUhKbFoyRnlaR3hsYzNNZ2IyWWdkR2hsWEhKY2JpQWdJQ0FnSUM4dklHSnZlQzF6YVhwcGJtY3VJRlJvWlNCcGJXRm5aWE1nWVhKbElHSnZjbVJsY2kxaWIzZ3NJSE52SUhkbElIZGhiblFnZEdobElFTlRVeUIzYVdSMGFGeHlYRzRnSUNBZ0lDQXZMeUJoYm1RZ2FHVnBaMmgwTGlCVWFHbHpJR0ZzYkc5M2N5QjBhR1VnWVdOMGFYWmxJR2x0WVdkbElIUnZJR2hoZG1VZ1lTQmliM0prWlhJZ1lXNWtJSFJvWlZ4eVhHNGdJQ0FnSUNBdkx5QnZkR2hsY2lCcGJXRm5aWE1nZEc4Z2FHRjJaU0J3WVdSa2FXNW5MbHh5WEc0Z0lDQWdJQ0FrWld4bGJXVnVkQzVqYzNNb1hDSjNhV1IwYUZ3aUxDQnVaWGRUYVhwbElDc2dYQ0p3ZUZ3aUtUdGNjbHh1SUNBZ0lDQWdKR1ZzWlcxbGJuUXVZM056S0Z3aWFHVnBaMmgwWENJc0lHNWxkMU5wZW1VZ0t5QmNJbkI0WENJcE8xeHlYRzRnSUNBZ2ZTazdYSEpjYmx4eVhHNGdJQ0FnTHk4Z1UyVjBJSFJvWlNCMGFIVnRZbTVoYVd3Z2QzSmhjQ0J6YVhwbExpQkpkQ0J6YUc5MWJHUWdZbVVnYW5WemRDQjBZV3hzSUdWdWIzVm5hQ0IwYnlCbWFYUWdZVnh5WEc0Z0lDQWdMeThnZEdoMWJXSnVZV2xzSUdGdVpDQnNiMjVuSUdWdWIzVm5hQ0IwYnlCb2IyeGtJR0ZzYkNCMGFHVWdkR2gxYldKdVlXbHNjeUJwYmlCdmJtVWdiR2x1WlRwY2NseHVJQ0FnSUhaaGNpQjBiM1JoYkZOcGVtVWdQU0J1WlhkVGFYcGxJQ29nZEdocGN5NWZiblZ0U1cxaFoyVnpJQ3NnZEdoMWJXSk5ZWEpuYVc0Z0tpQW9kR2hwY3k1ZmJuVnRTVzFoWjJWeklDMGdNU2s3WEhKY2JpQWdJQ0IwYUdsekxsOGtkR2gxYldKdVlXbHNRMjl1ZEdGcGJtVnlMbU56Y3loN1hISmNiaUFnSUNBZ0lIZHBaSFJvT2lCMGIzUmhiRk5wZW1VZ0t5QmNJbkI0WENJc1hISmNiaUFnSUNBZ0lHaGxhV2RvZERvZ0pHWnBjbk4wVkdoMWJXSXViM1YwWlhKSVpXbG5hSFFvZEhKMVpTa2dLeUJjSW5CNFhDSmNjbHh1SUNBZ0lIMHBPMXh5WEc1Y2NseHVJQ0FnSUM4dklGTmxkQ0IwYUdVZ2RtbHphV0pzWlNCMGFIVnRZbTVoYVd3Z2QzSmhjQ0J6YVhwbExpQlVhR2x6SUdseklIVnpaV1FnZEc4Z2JXRnJjeUIwYUdVZ2JYVmphRnh5WEc0Z0lDQWdMeThnYkdGeVoyVnlJSFJvZFcxaWJtRnBiQ0JqYjI1MFlXbHVaWEl1SUVsMElITm9iM1ZzWkNCaVpTQmhjeUIzYVdSbElHRnpJR2wwSUdOaGJpQmlaU3dnYldsdWRYTmNjbHh1SUNBZ0lDOHZJSFJvWlNCemNHRmpaU0J1WldWa1pXUWdabTl5SUhSb1pTQnNaV1owTDNKcFoyaDBJR052Ym5SdmJITXVYSEpjYmlBZ0lDQjBhR2x6TGw4a2RtbHphV0pzWlZSb2RXMWlibUZwYkZkeVlYQXVZM056S0h0Y2NseHVJQ0FnSUNBZ2QybGtkR2c2SUhacGMybGliR1ZYYVdSMGFDQXRJSFJvZFcxaVEyOXVkSEp2YkZkcFpIUm9JQ3NnWENKd2VGd2lMRnh5WEc0Z0lDQWdJQ0JvWldsbmFIUTZJQ1JtYVhKemRGUm9kVzFpTG05MWRHVnlTR1ZwWjJoMEtIUnlkV1VwSUNzZ1hDSndlRndpWEhKY2JpQWdJQ0I5S1R0Y2NseHVJQ0I5SUdWc2MyVWdlMXh5WEc0Z0lDQWdMeThnUVd4c0lIUm9kVzFpYm1GcGJITWdZWEpsSUhacGMybGliR1VzSUhkbElHTmhiaUJvYVdSbElIUm9aU0JqYjI1MGNtOXNjeUJoYm1RZ1pYaHdZVzVrSUhSb1pWeHlYRzRnSUNBZ0x5OGdkR2gxYldKdVlXbHNJR052Ym5SaGFXNWxjaUIwYnlBeE1EQWxYSEpjYmlBZ0lDQnVkVzFVYUhWdFluTldhWE5wWW14bElEMGdkR2hwY3k1ZmJuVnRTVzFoWjJWek8xeHlYRzRnSUNBZ2RHaHBjeTVmSkhSb2RXMWlibUZwYkVOdmJuUmhhVzVsY2k1amMzTW9YQ0ozYVdSMGFGd2lMQ0JjSWpFd01DVmNJaWs3WEhKY2JpQWdJQ0IwYUdsekxsOGtZV1IyWVc1alpWSnBaMmgwTG1OemN5aGNJbVJwYzNCc1lYbGNJaXdnWENKdWIyNWxYQ0lwTzF4eVhHNGdJQ0FnZEdocGN5NWZKR0ZrZG1GdVkyVk1aV1owTG1OemN5aGNJbVJwYzNCc1lYbGNJaXdnWENKdWIyNWxYQ0lwTzF4eVhHNGdJSDFjY2x4dVhISmNiaUFnZEdocGN5NWZiblZ0Vm1semFXSnNaU0E5SUc1MWJWUm9kVzFpYzFacGMybGliR1U3WEhKY2JpQWdkbUZ5SUcxcFpHUnNaVWx1WkdWNElEMGdUV0YwYUM1bWJHOXZjaWdvZEdocGN5NWZiblZ0Vm1semFXSnNaU0F0SURFcElDOGdNaWs3WEhKY2JpQWdkR2hwY3k1ZmMyTnliMnhzUW05MWJtUnpJRDBnZTF4eVhHNGdJQ0FnYldsdU9pQnRhV1JrYkdWSmJtUmxlQ3hjY2x4dUlDQWdJRzFoZURvZ2RHaHBjeTVmYm5WdFNXMWhaMlZ6SUMwZ01TQXRJRzFwWkdSc1pVbHVaR1Y0WEhKY2JpQWdmVHRjY2x4dUlDQnBaaUFvZEdocGN5NWZiblZ0Vm1semFXSnNaU0FsSURJZ1BUMDlJREFwSUhSb2FYTXVYM05qY205c2JFSnZkVzVrY3k1dFlYZ2dMVDBnTVR0Y2NseHVYSEpjYmlBZ2RHaHBjeTVmZFhCa1lYUmxWR2gxYldKdVlXbHNRMjl1ZEhKdmJITW9LVHRjY2x4dWZUdGNjbHh1WEhKY2JsUm9kVzFpYm1GcGJGTnNhV1JsY2k1d2NtOTBiM1I1Y0dVdVgyRmpkR2wyWVhSbFZHaDFiV0p1WVdsc0lEMGdablZ1WTNScGIyNG9hVzVrWlhncElIdGNjbHh1SUNBdkx5QkJZM1JwZG1GMFpTOWtaV0ZqZEdsMllYUmxJSFJvZFcxaWJtRnBiSE5jY2x4dUlDQjBhR2x6TGw4a2RHaDFiV0p1WVdsc2MxdDBhR2x6TGw5cGJtUmxlRjB1Y21WdGIzWmxRMnhoYzNNb1hDSmhZM1JwZG1WY0lpazdYSEpjYmlBZ2RHaHBjeTVmSkhSb2RXMWlibUZwYkhOYmFXNWtaWGhkTG1Ga1pFTnNZWE56S0Z3aVlXTjBhWFpsWENJcE8xeHlYRzU5TzF4eVhHNWNjbHh1VkdoMWJXSnVZV2xzVTJ4cFpHVnlMbkJ5YjNSdmRIbHdaUzVmYzJOeWIyeHNWRzlVYUhWdFltNWhhV3dnUFNCbWRXNWpkR2x2YmlocGJtUmxlQ2tnZTF4eVhHNGdJQzh2SUU1dklHNWxaV1FnZEc4Z2MyTnliMnhzSUdsbUlHRnNiQ0IwYUhWdFltNWhhV3h6SUdGeVpTQjJhWE5wWW14bFhISmNiaUFnYVdZZ0tIUm9hWE11WDI1MWJWWnBjMmxpYkdVZ1BUMDlJSFJvYVhNdVgyNTFiVWx0WVdkbGN5a2djbVYwZFhKdU8xeHlYRzVjY2x4dUlDQXZMeUJEYjI1emRISmhhVzRnYVc1a1pYZ2djMjhnZEdoaGRDQjNaU0JqWVc0bmRDQnpZM0p2Ykd3Z2IzVjBJRzltSUdKdmRXNWtjMXh5WEc0Z0lHbHVaR1Y0SUQwZ1RXRjBhQzV0WVhnb2FXNWtaWGdzSUhSb2FYTXVYM05qY205c2JFSnZkVzVrY3k1dGFXNHBPMXh5WEc0Z0lHbHVaR1Y0SUQwZ1RXRjBhQzV0YVc0b2FXNWtaWGdzSUhSb2FYTXVYM05qY205c2JFSnZkVzVrY3k1dFlYZ3BPMXh5WEc0Z0lIUm9hWE11WDNOamNtOXNiRWx1WkdWNElEMGdhVzVrWlhnN1hISmNibHh5WEc0Z0lDOHZJRVpwYm1RZ2RHaGxJRndpYkdWbWRGd2lJSEJ2YzJsMGFXOXVJRzltSUhSb1pTQjBhSFZ0WW01aGFXd2dZMjl1ZEdGcGJtVnlJSFJvWVhRZ2QyOTFiR1FnY0hWMElIUm9aVnh5WEc0Z0lDOHZJSFJvZFcxaWJtRnBiQ0JoZENCcGJtUmxlQ0JoZENCMGFHVWdZMlZ1ZEdWeVhISmNiaUFnZG1GeUlDUjBhSFZ0WWlBOUlIUm9hWE11WHlSMGFIVnRZbTVoYVd4eld6QmRPMXh5WEc0Z0lIWmhjaUJ6YVhwbElEMGdjR0Z5YzJWR2JHOWhkQ2drZEdoMWJXSXVZM056S0Z3aWQybGtkR2hjSWlrcE8xeHlYRzRnSUhaaGNpQnRZWEpuYVc0Z1BTQXlJQ29nY0dGeWMyVkdiRzloZENna2RHaDFiV0l1WTNOektGd2liV0Z5WjJsdUxYSnBaMmgwWENJcEtUdGNjbHh1SUNCMllYSWdZMlZ1ZEdWeVdDQTlJSE5wZW1VZ0tpQjBhR2x6TGw5elkzSnZiR3hDYjNWdVpITXViV2x1SUNzZ2JXRnlaMmx1SUNvZ0tIUm9hWE11WDNOamNtOXNiRUp2ZFc1a2N5NXRhVzRnTFNBeEtUdGNjbHh1SUNCMllYSWdkR2gxYldKWUlEMGdjMmw2WlNBcUlHbHVaR1Y0SUNzZ2JXRnlaMmx1SUNvZ0tHbHVaR1Y0SUMwZ01TazdYSEpjYmlBZ2RtRnlJR3hsWm5RZ1BTQmpaVzUwWlhKWUlDMGdkR2gxYldKWU8xeHlYRzVjY2x4dUlDQXZMeUJCYm1sdFlYUmxJSFJvWlNCMGFIVnRZbTVoYVd3Z1kyOXVkR0ZwYm1WeVhISmNiaUFnZEdocGN5NWZKSFJvZFcxaWJtRnBiRU52Ym5SaGFXNWxjaTUyWld4dlkybDBlU2hjSW5OMGIzQmNJaWs3WEhKY2JpQWdkR2hwY3k1ZkpIUm9kVzFpYm1GcGJFTnZiblJoYVc1bGNpNTJaV3h2WTJsMGVTaGNjbHh1SUNBZ0lIdGNjbHh1SUNBZ0lDQWdiR1ZtZERvZ2JHVm1kQ0FySUZ3aWNIaGNJbHh5WEc0Z0lDQWdmU3hjY2x4dUlDQWdJRFl3TUN4Y2NseHVJQ0FnSUZ3aVpXRnpaVWx1VDNWMFVYVmhaRndpWEhKY2JpQWdLVHRjY2x4dVhISmNiaUFnZEdocGN5NWZkWEJrWVhSbFZHaDFiV0p1WVdsc1EyOXVkSEp2YkhNb0tUdGNjbHh1ZlR0Y2NseHVYSEpjYmxSb2RXMWlibUZwYkZOc2FXUmxjaTV3Y205MGIzUjVjR1V1WDI5dVEyeHBZMnNnUFNCbWRXNWpkR2x2YmlobEtTQjdYSEpjYmlBZ2RtRnlJQ1IwWVhKblpYUWdQU0FrS0dVdWRHRnlaMlYwS1R0Y2NseHVJQ0IyWVhJZ2FXNWtaWGdnUFNBa2RHRnlaMlYwTG1SaGRHRW9YQ0pwYm1SbGVGd2lLVHRjY2x4dVhISmNiaUFnTHk4Z1EyeHBZMnRsWkNCdmJpQjBhR1VnWVdOMGFYWmxJR2x0WVdkbElDMGdibThnYm1WbFpDQjBieUJrYnlCaGJubDBhR2x1WjF4eVhHNGdJR2xtSUNoMGFHbHpMbDlwYm1SbGVDQWhQVDBnYVc1a1pYZ3BJSHRjY2x4dUlDQWdJSFJvYVhNdVgyRmpkR2wyWVhSbFZHaDFiV0p1WVdsc0tHbHVaR1Y0S1R0Y2NseHVJQ0FnSUhSb2FYTXVYM05qY205c2JGUnZWR2gxYldKdVlXbHNLR2x1WkdWNEtUdGNjbHh1SUNBZ0lIUm9hWE11WDJsdVpHVjRJRDBnYVc1a1pYZzdYSEpjYmlBZ0lDQjBhR2x6TGw5emJHbGtaWE5vYjNjdWMyaHZkMGx0WVdkbEtHbHVaR1Y0S1R0Y2NseHVJQ0I5WEhKY2JuMDdYSEpjYmx4eVhHNVVhSFZ0WW01aGFXeFRiR2xrWlhJdWNISnZkRzkwZVhCbExsOTFjR1JoZEdWVWFIVnRZbTVoYVd4RGIyNTBjbTlzY3lBOUlHWjFibU4wYVc5dUtDa2dlMXh5WEc0Z0lDOHZJRkpsTFdWdVlXSnNaVnh5WEc0Z0lIUm9hWE11WHlSaFpIWmhibU5sVEdWbWRDNXlaVzF2ZG1WRGJHRnpjeWhjSW1ScGMyRmliR1ZrWENJcE8xeHlYRzRnSUhSb2FYTXVYeVJoWkhaaGJtTmxVbWxuYUhRdWNtVnRiM1psUTJ4aGMzTW9YQ0prYVhOaFlteGxaRndpS1R0Y2NseHVYSEpjYmlBZ0x5OGdSR2x6WVdKc1pTQnBaaUIzWlNkMlpTQnlaV0ZqYUdWa0lIUm9aU0IwYUdVZ2JXRjRJRzl5SUcxcGJpQnNhVzFwZEZ4eVhHNGdJQzh2SUhaaGNpQnRhV1JUWTNKdmJHeEpibVJsZUNBOUlFMWhkR2d1Wm14dmIzSW9LSFJvYVhNdVgyNTFiVlpwYzJsaWJHVWdMU0F4S1NBdklESXBPMXh5WEc0Z0lDOHZJSFpoY2lCdGFXNVRZM0p2Ykd4SmJtUmxlQ0E5SUcxcFpGTmpjbTlzYkVsdVpHVjRPMXh5WEc0Z0lDOHZJSFpoY2lCdFlYaFRZM0p2Ykd4SmJtUmxlQ0E5SUhSb2FYTXVYMjUxYlVsdFlXZGxjeUF0SURFZ0xTQnRhV1JUWTNKdmJHeEpibVJsZUR0Y2NseHVJQ0JwWmlBb2RHaHBjeTVmYzJOeWIyeHNTVzVrWlhnZ1BqMGdkR2hwY3k1ZmMyTnliMnhzUW05MWJtUnpMbTFoZUNrZ2UxeHlYRzRnSUNBZ2RHaHBjeTVmSkdGa2RtRnVZMlZTYVdkb2RDNWhaR1JEYkdGemN5aGNJbVJwYzJGaWJHVmtYQ0lwTzF4eVhHNGdJSDBnWld4elpTQnBaaUFvZEdocGN5NWZjMk55YjJ4c1NXNWtaWGdnUEQwZ2RHaHBjeTVmYzJOeWIyeHNRbTkxYm1SekxtMXBiaWtnZTF4eVhHNGdJQ0FnZEdocGN5NWZKR0ZrZG1GdVkyVk1aV1owTG1Ga1pFTnNZWE56S0Z3aVpHbHpZV0pzWldSY0lpazdYSEpjYmlBZ2ZWeHlYRzU5TzF4eVhHNGlMQ0psZUhCdmNuUnpMbVJsWm1GMWJIUWdQU0JtZFc1amRHbHZiaWgyWVd3c0lHUmxabUYxYkhSV1lXd3BJSHRjY2x4dUlDQnlaWFIxY200Z2RtRnNJQ0U5UFNCMWJtUmxabWx1WldRZ1B5QjJZV3dnT2lCa1pXWmhkV3gwVm1Gc08xeHlYRzU5TzF4eVhHNWNjbHh1THk4Z1ZXNTBaWE4wWldSY2NseHVMeThnWlhod2IzSjBjeTVrWldaaGRXeDBVSEp2Y0dWeWRHbGxjeUE5SUdaMWJtTjBhVzl1SUdSbFptRjFiSFJRY205d1pYSjBhV1Z6SUNodlltb3NJSEJ5YjNCektTQjdYSEpjYmk4dklDQWdJQ0JtYjNJZ0tIWmhjaUJ3Y205d0lHbHVJSEJ5YjNCektTQjdYSEpjYmk4dklDQWdJQ0FnSUNBZ2FXWWdLSEJ5YjNCekxtaGhjMDkzYmxCeWIzQmxjblI1S0hCeWIzQnpMQ0J3Y205d0tTa2dlMXh5WEc0dkx5QWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2RtRnNkV1VnUFNCbGVIQnZjblJ6TG1SbFptRjFiSFJXWVd4MVpTaHdjbTl3Y3k1MllXeDFaU3dnY0hKdmNITXVaR1ZtWVhWc2RDazdYSEpjYmk4dklDQWdJQ0FnSUNBZ0lDQWdJRzlpYWx0d2NtOXdYU0E5SUhaaGJIVmxPMXh5WEc0dkx5QWdJQ0FnSUNBZ0lIMWNjbHh1THk4Z0lDQWdJSDFjY2x4dUx5OGdJQ0FnSUhKbGRIVnliaUJ2WW1vN1hISmNiaTh2SUgwN1hISmNiaTh2WEhKY2JtVjRjRzl5ZEhNdWRHbHRaVWwwSUQwZ1puVnVZM1JwYjI0b1puVnVZeWtnZTF4eVhHNGdJSFpoY2lCemRHRnlkQ0E5SUhCbGNtWnZjbTFoYm1ObExtNXZkeWdwTzF4eVhHNGdJR1oxYm1Nb0tUdGNjbHh1SUNCMllYSWdaVzVrSUQwZ2NHVnlabTl5YldGdVkyVXVibTkzS0NrN1hISmNiaUFnY21WMGRYSnVJR1Z1WkNBdElITjBZWEowTzF4eVhHNTlPMXh5WEc1Y2NseHVaWGh3YjNKMGN5NXBjMGx1VW1WamRDQTlJR1oxYm1OMGFXOXVLSGdzSUhrc0lISmxZM1FwSUh0Y2NseHVJQ0JwWmlBb2VDQStQU0J5WldOMExuZ2dKaVlnZUNBOFBTQnlaV04wTG5nZ0t5QnlaV04wTG5jZ0ppWWdlU0ErUFNCeVpXTjBMbmtnSmlZZ2VTQThQU0J5WldOMExua2dLeUJ5WldOMExtZ3BJSHRjY2x4dUlDQWdJSEpsZEhWeWJpQjBjblZsTzF4eVhHNGdJSDFjY2x4dUlDQnlaWFIxY200Z1ptRnNjMlU3WEhKY2JuMDdYSEpjYmx4eVhHNWxlSEJ2Y25SekxuSmhibVJKYm5RZ1BTQm1kVzVqZEdsdmJpaHRhVzRzSUcxaGVDa2dlMXh5WEc0Z0lISmxkSFZ5YmlCTllYUm9MbVpzYjI5eUtFMWhkR2d1Y21GdVpHOXRLQ2tnS2lBb2JXRjRJQzBnYldsdUlDc2dNU2twSUNzZ2JXbHVPMXh5WEc1OU8xeHlYRzVjY2x4dVpYaHdiM0owY3k1eVlXNWtRWEp5WVhsRmJHVnRaVzUwSUQwZ1puVnVZM1JwYjI0b1lYSnlZWGtwSUh0Y2NseHVJQ0IyWVhJZ2FTQTlJR1Y0Y0c5eWRITXVjbUZ1WkVsdWRDZ3dMQ0JoY25KaGVTNXNaVzVuZEdnZ0xTQXhLVHRjY2x4dUlDQnlaWFIxY200Z1lYSnlZWGxiYVYwN1hISmNibjA3WEhKY2JseHlYRzVsZUhCdmNuUnpMbTFoY0NBOUlHWjFibU4wYVc5dUtHNTFiU3dnYldsdU1Td2diV0Y0TVN3Z2JXbHVNaXdnYldGNE1pd2diM0IwYVc5dWN5a2dlMXh5WEc0Z0lIWmhjaUJ0WVhCd1pXUWdQU0FvYm5WdElDMGdiV2x1TVNrZ0x5QW9iV0Y0TVNBdElHMXBiakVwSUNvZ0tHMWhlRElnTFNCdGFXNHlLU0FySUcxcGJqSTdYSEpjYmlBZ2FXWWdLQ0Z2Y0hScGIyNXpLU0J5WlhSMWNtNGdiV0Z3Y0dWa08xeHlYRzRnSUdsbUlDaHZjSFJwYjI1ekxuSnZkVzVrSUNZbUlHOXdkR2x2Ym5NdWNtOTFibVFnUFQwOUlIUnlkV1VwSUh0Y2NseHVJQ0FnSUcxaGNIQmxaQ0E5SUUxaGRHZ3VjbTkxYm1Rb2JXRndjR1ZrS1R0Y2NseHVJQ0I5WEhKY2JpQWdhV1lnS0c5d2RHbHZibk11Wm14dmIzSWdKaVlnYjNCMGFXOXVjeTVtYkc5dmNpQTlQVDBnZEhKMVpTa2dlMXh5WEc0Z0lDQWdiV0Z3Y0dWa0lEMGdUV0YwYUM1bWJHOXZjaWh0WVhCd1pXUXBPMXh5WEc0Z0lIMWNjbHh1SUNCcFppQW9iM0IwYVc5dWN5NWpaV2xzSUNZbUlHOXdkR2x2Ym5NdVkyVnBiQ0E5UFQwZ2RISjFaU2tnZTF4eVhHNGdJQ0FnYldGd2NHVmtJRDBnVFdGMGFDNWpaV2xzS0cxaGNIQmxaQ2s3WEhKY2JpQWdmVnh5WEc0Z0lHbG1JQ2h2Y0hScGIyNXpMbU5zWVcxd0lDWW1JRzl3ZEdsdmJuTXVZMnhoYlhBZ1BUMDlJSFJ5ZFdVcElIdGNjbHh1SUNBZ0lHMWhjSEJsWkNBOUlFMWhkR2d1YldsdUtHMWhjSEJsWkN3Z2JXRjRNaWs3WEhKY2JpQWdJQ0J0WVhCd1pXUWdQU0JOWVhSb0xtMWhlQ2h0WVhCd1pXUXNJRzFwYmpJcE8xeHlYRzRnSUgxY2NseHVJQ0J5WlhSMWNtNGdiV0Z3Y0dWa08xeHlYRzU5TzF4eVhHNWNjbHh1Wlhod2IzSjBjeTVuWlhSUmRXVnllVkJoY21GdFpYUmxjbk1nUFNCbWRXNWpkR2x2YmlncElIdGNjbHh1SUNBdkx5QkRhR1ZqYXlCbWIzSWdjWFZsY25rZ2MzUnlhVzVuWEhKY2JpQWdkbUZ5SUhGeklEMGdkMmx1Wkc5M0xteHZZMkYwYVc5dUxuTmxZWEpqYUR0Y2NseHVJQ0JwWmlBb2NYTXViR1Z1WjNSb0lEdzlJREVwSUhKbGRIVnliaUI3ZlR0Y2NseHVJQ0F2THlCUmRXVnllU0J6ZEhKcGJtY2daWGhwYzNSekxDQndZWEp6WlNCcGRDQnBiblJ2SUdFZ2NYVmxjbmtnYjJKcVpXTjBYSEpjYmlBZ2NYTWdQU0J4Y3k1emRXSnpkSEpwYm1jb01TazdJQzh2SUZKbGJXOTJaU0IwYUdVZ1hDSS9YQ0lnWkdWc2FXMXBkR1Z5WEhKY2JpQWdkbUZ5SUd0bGVWWmhiRkJoYVhKeklEMGdjWE11YzNCc2FYUW9YQ0ltWENJcE8xeHlYRzRnSUhaaGNpQnhkV1Z5ZVU5aWFtVmpkQ0E5SUh0OU8xeHlYRzRnSUdadmNpQW9kbUZ5SUdrZ1BTQXdPeUJwSUR3Z2EyVjVWbUZzVUdGcGNuTXViR1Z1WjNSb095QnBJQ3M5SURFcElIdGNjbHh1SUNBZ0lIWmhjaUJyWlhsV1lXd2dQU0JyWlhsV1lXeFFZV2x5YzF0cFhTNXpjR3hwZENoY0lqMWNJaWs3WEhKY2JpQWdJQ0JwWmlBb2EyVjVWbUZzTG14bGJtZDBhQ0E5UFQwZ01pa2dlMXh5WEc0Z0lDQWdJQ0IyWVhJZ2EyVjVJRDBnWkdWamIyUmxWVkpKUTI5dGNHOXVaVzUwS0d0bGVWWmhiRnN3WFNrN1hISmNiaUFnSUNBZ0lIWmhjaUIyWVd3Z1BTQmtaV052WkdWVlVrbERiMjF3YjI1bGJuUW9hMlY1Vm1Gc1d6RmRLVHRjY2x4dUlDQWdJQ0FnY1hWbGNubFBZbXBsWTNSYmEyVjVYU0E5SUhaaGJEdGNjbHh1SUNBZ0lIMWNjbHh1SUNCOVhISmNiaUFnY21WMGRYSnVJSEYxWlhKNVQySnFaV04wTzF4eVhHNTlPMXh5WEc1Y2NseHVaWGh3YjNKMGN5NWpjbVZoZEdWUmRXVnllVk4wY21sdVp5QTlJR1oxYm1OMGFXOXVLSEYxWlhKNVQySnFaV04wS1NCN1hISmNiaUFnYVdZZ0tIUjVjR1Z2WmlCeGRXVnllVTlpYW1WamRDQWhQVDBnWENKdlltcGxZM1JjSWlrZ2NtVjBkWEp1SUZ3aVhDSTdYSEpjYmlBZ2RtRnlJR3RsZVhNZ1BTQlBZbXBsWTNRdWEyVjVjeWh4ZFdWeWVVOWlhbVZqZENrN1hISmNiaUFnYVdZZ0tHdGxlWE11YkdWdVozUm9JRDA5UFNBd0tTQnlaWFIxY200Z1hDSmNJanRjY2x4dUlDQjJZWElnY1hWbGNubFRkSEpwYm1jZ1BTQmNJajljSWp0Y2NseHVJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUd0bGVYTXViR1Z1WjNSb095QnBJQ3M5SURFcElIdGNjbHh1SUNBZ0lIWmhjaUJyWlhrZ1BTQnJaWGx6VzJsZE8xeHlYRzRnSUNBZ2RtRnlJSFpoYkNBOUlIRjFaWEo1VDJKcVpXTjBXMnRsZVYwN1hISmNiaUFnSUNCeGRXVnllVk4wY21sdVp5QXJQU0JsYm1OdlpHVlZVa2xEYjIxd2IyNWxiblFvYTJWNUtTQXJJRndpUFZ3aUlDc2daVzVqYjJSbFZWSkpRMjl0Y0c5dVpXNTBLSFpoYkNrN1hISmNiaUFnSUNCcFppQW9hU0FoUFQwZ2EyVjVjeTVzWlc1bmRHZ2dMU0F4S1NCeGRXVnllVk4wY21sdVp5QXJQU0JjSWlaY0lqdGNjbHh1SUNCOVhISmNiaUFnY21WMGRYSnVJSEYxWlhKNVUzUnlhVzVuTzF4eVhHNTlPMXh5WEc1Y2NseHVaWGh3YjNKMGN5NTNjbUZ3U1c1a1pYZ2dQU0JtZFc1amRHbHZiaWhwYm1SbGVDd2diR1Z1WjNSb0tTQjdYSEpjYmlBZ2RtRnlJSGR5WVhCd1pXUkpibVJsZUNBOUlHbHVaR1Y0SUNVZ2JHVnVaM1JvTzF4eVhHNGdJR2xtSUNoM2NtRndjR1ZrU1c1a1pYZ2dQQ0F3S1NCN1hISmNiaUFnSUNBdkx5QkpaaUJ1WldkaGRHbDJaU3dnWm14cGNDQjBhR1VnYVc1a1pYZ2djMjhnZEdoaGRDQXRNU0JpWldOdmJXVnpJSFJvWlNCc1lYTjBJR2wwWlcwZ2FXNGdiR2x6ZEZ4eVhHNGdJQ0FnZDNKaGNIQmxaRWx1WkdWNElEMGdiR1Z1WjNSb0lDc2dkM0poY0hCbFpFbHVaR1Y0TzF4eVhHNGdJSDFjY2x4dUlDQnlaWFIxY200Z2QzSmhjSEJsWkVsdVpHVjRPMXh5WEc1OU8xeHlYRzRpWFgwPSJ9
