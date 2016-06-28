(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * JavaScript Cookie v2.1.2
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
;(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
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

				return (document.cookie = [
					key, '=', value,
					attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
					attributes.path    && '; path=' + attributes.path,
					attributes.domain  && '; domain=' + attributes.domain,
					attributes.secure ? '; secure' : ''
				].join(''));
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
			return api(key);
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
        _transitionDuration : 1000;   

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
},{"./utilities.js":17}],5:[function(require,module,exports){
module.exports = ImageGalleries;

var utilities = require("./utilities.js");

function ImageGalleries(transitionDuration) { 
    transitionDuration = (transitionDuration !== undefined) ?
        transitionDuration : 400;
    this._imageGalleries = [];
    $(".image-gallery").each(function (index, element) {
        var gallery = new ImageGallery($(element), transitionDuration);
        this._imageGalleries.push(gallery);
    }.bind(this));
}

function ImageGallery($container, transitionDuration) {
    this._transitionDuration = transitionDuration;
    this._$container = $container;
    this._$captionContainer = $container.find(".image-gallery-caption");
    this._$thumbnailContainer = $container.find(".image-gallery-thumbnails");
    this._index = 0; // Index of selected image

    // Loop through the thumbnails, give them an index data attribute and cache
    // a reference to them in an array
    this._$thumbnails = [];
    this._$thumbnailContainer.find("img").each(function (index, element) {
        var $thumbnail = $(element);
        $thumbnail.data("index", index);
        this._$thumbnails.push($thumbnail);
    }.bind(this));

    // Create empty images in the gallery for each thumbnail. This helps us do
    // lazy loading of gallery images and allows us to cross-fade images.
    this._$galleryImages = [];
    for (var i = 0; i < this._$thumbnails.length; i += 1) {
        // Calculate the id from the path to the large image
        var largePath = this._$thumbnails[i].data("large-path");
        var id = largePath.split("/").pop().split(".")[0];
        var $galleryImage = $("<img>")
            .css({
                position: "absolute",
                top: "0px",
                left: "0px",
                opacity: 0,
                zIndex: 0
            })
            .attr("id", id)
            .data("image-url", largePath)
            .appendTo($container.find(".image-gallery-selected"));
        $galleryImage.get(0).src = largePath; // TODO: Make this lazy!
        this._$galleryImages.push($galleryImage);
    }

    // Activate the first thumbnail and display it in the gallery 
    this._switchActiveImage(0);

    // Bind the event handlers to the images
    this._$thumbnailContainer.find("img").on("click", this._onClick.bind(this));
}

ImageGallery.prototype._switchActiveImage = function (index) {
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

    // Cache references to the last and current image & thumbnails
    var $lastThumbnail = this._$thumbnails[this._index];
    var $lastImage = this._$galleryImages[this._index];
    this._index = index;
    var $currentThumbnail = this._$thumbnails[this._index];
    var $currentImage = this._$galleryImages[this._index];

    // Activate/deactivate thumbnails
    $lastThumbnail.removeClass("active");
    $currentThumbnail.addClass("active");

    // Make the last image visisble and then animate the current image into view
    // on top of the last
    $lastImage.css("zIndex", 1);
    $currentImage.css("zIndex", 2);
    $lastImage.css("opacity", 1);
    $currentImage.velocity({"opacity": 1}, this._transitionDuration, 
        "easeInOutQuad");

    // Create the caption, if it exists on the thumbnail
    var caption = $currentThumbnail.data("caption");
    if (caption) {
        this._$captionContainer.empty();
        $("<span>").addClass("figure-number")
            .text("Fig. " + (this._index + 1) + ": ")
            .appendTo(this._$captionContainer);
        $("<span>").addClass("caption")
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

ImageGallery.prototype._onClick = function (e) {
    var $target = $(e.target);
    var index = $target.data("index");
    
    // Clicked on the active image - no need to do anything
    if (this._index === index) return;

    this._switchActiveImage(index);  
};
},{"./utilities.js":17}],6:[function(require,module,exports){
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
},{"../utilities.js":17}],7:[function(require,module,exports){
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
    }
    else {
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
},{"../utilities.js":17,"./base-logo-sketch.js":6,"./generators/sin-generator.js":9,"p5-bbox-aligned-text":2}],8:[function(require,module,exports){
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
},{"../../utilities.js":17}],9:[function(require,module,exports){
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
},{"../../utilities.js":17}],10:[function(require,module,exports){
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
},{"../utilities.js":17,"./base-logo-sketch.js":6,"p5-bbox-aligned-text":2}],11:[function(require,module,exports){
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
},{"./base-logo-sketch.js":6,"./generators/noise-generators.js":8,"p5-bbox-aligned-text":2}],12:[function(require,module,exports){
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
    }
    else if (url === "/work.html") {        
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
},{}],13:[function(require,module,exports){
var Loader = require("./page-loader.js");
var MainNav = require("./main-nav.js");
var HoverSlideshows = require("./hover-slideshow.js");
var PortfolioFilter = require("./portfolio-filter.js");
var ImageGalleries = require("./image-gallery.js");

// Picking a random sketch that the user hasn't seen before
var Sketch = require("./pick-random-sketch.js")();

// AJAX page loader, with callback for reloading widgets
var loader = new Loader(onPageLoad);

// Main nav widget
var mainNav = new MainNav(loader);

// Interactive logo in navbar
var nav = $("nav.navbar");
var navLogo = nav.find(".navbar-brand");
var sketch = new Sketch(nav, navLogo);

// Widget globals
var hoverSlideshows, portfolioFilter, imageGalleries;

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
    hoverSlideshows = new HoverSlideshows();
    portfolioFilter = new PortfolioFilter(loader);
    imageGalleries = new ImageGalleries();
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
},{"./hover-slideshow.js":4,"./image-gallery.js":5,"./main-nav.js":12,"./page-loader.js":14,"./pick-random-sketch.js":15,"./portfolio-filter.js":16}],14:[function(require,module,exports){
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
    this._$content.velocity({ opacity: 0 }, this._fadeDuration, "swing",
        function () {
        this._$content.empty();
        this._$content.load(url + " #content", onContentFetched.bind(this));
    }.bind(this));

    // Fade the new content in after it has been fetched
    function onContentFetched(responseText, textStatus, jqXhr) {
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
},{"./utilities.js":17}],15:[function(require,module,exports){
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
        } 
        // If we've only got one sketch, then we can't do much...
        else {
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
},{"./interactive-logos/connect-points-sketch.js":7,"./interactive-logos/halftone-flashlight-word.js":10,"./interactive-logos/noisy-word-sketch.js":11,"./utilities.js":17,"js-cookie":1}],16:[function(require,module,exports){
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
        }
        // If an element is selected: show & bump z-index & animate to position 
        else {
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
},{"./utilities.js":17}],17:[function(require,module,exports){
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
    qs = window.location.search;
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

},{}]},{},[13])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJub2RlX21vZHVsZXMvcDUtYmJveC1hbGlnbmVkLXRleHQvbGliL2Jib3gtYWxpZ25lZC10ZXh0LmpzIiwibm9kZV9tb2R1bGVzL3A1LWJib3gtYWxpZ25lZC10ZXh0L2xpYi91dGlscy5qcyIsInNyYy9qcy9ob3Zlci1zbGlkZXNob3cuanMiLCJzcmMvanMvaW1hZ2UtZ2FsbGVyeS5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9iYXNlLWxvZ28tc2tldGNoLmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2Nvbm5lY3QtcG9pbnRzLXNrZXRjaC5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9nZW5lcmF0b3JzL25vaXNlLWdlbmVyYXRvcnMuanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvZ2VuZXJhdG9ycy9zaW4tZ2VuZXJhdG9yLmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2hhbGZ0b25lLWZsYXNobGlnaHQtd29yZC5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9ub2lzeS13b3JkLXNrZXRjaC5qcyIsInNyYy9qcy9tYWluLW5hdi5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL3BhZ2UtbG9hZGVyLmpzIiwic3JjL2pzL3BpY2stcmFuZG9tLXNrZXRjaC5qcyIsInNyYy9qcy9wb3J0Zm9saW8tZmlsdGVyLmpzIiwic3JjL2pzL3V0aWxpdGllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIEphdmFTY3JpcHQgQ29va2llIHYyLjEuMlxuICogaHR0cHM6Ly9naXRodWIuY29tL2pzLWNvb2tpZS9qcy1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAwNiwgMjAxNSBLbGF1cyBIYXJ0bCAmIEZhZ25lciBCcmFja1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0fSBlbHNlIHtcblx0XHR2YXIgT2xkQ29va2llcyA9IHdpbmRvdy5Db29raWVzO1xuXHRcdHZhciBhcGkgPSB3aW5kb3cuQ29va2llcyA9IGZhY3RvcnkoKTtcblx0XHRhcGkubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHdpbmRvdy5Db29raWVzID0gT2xkQ29va2llcztcblx0XHRcdHJldHVybiBhcGk7XG5cdFx0fTtcblx0fVxufShmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIGV4dGVuZCAoKSB7XG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHNbIGkgXTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdHJlc3VsdFtrZXldID0gYXR0cmlidXRlc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG5cdFx0ZnVuY3Rpb24gYXBpIChrZXksIHZhbHVlLCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHR2YXIgcmVzdWx0O1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXcml0ZVxuXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0YXR0cmlidXRlcyA9IGV4dGVuZCh7XG5cdFx0XHRcdFx0cGF0aDogJy8nXG5cdFx0XHRcdH0sIGFwaS5kZWZhdWx0cywgYXR0cmlidXRlcyk7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiBhdHRyaWJ1dGVzLmV4cGlyZXMgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0dmFyIGV4cGlyZXMgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0XHRcdGV4cGlyZXMuc2V0TWlsbGlzZWNvbmRzKGV4cGlyZXMuZ2V0TWlsbGlzZWNvbmRzKCkgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlKzUpO1xuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGV4cGlyZXM7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcblx0XHRcdFx0XHRpZiAoL15bXFx7XFxbXS8udGVzdChyZXN1bHQpKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZSA9IHJlc3VsdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cblx0XHRcdFx0aWYgKCFjb252ZXJ0ZXIud3JpdGUpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcodmFsdWUpKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8M0F8M0N8M0V8M0R8MkZ8M0Z8NDB8NUJ8NUR8NUV8NjB8N0J8N0R8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRrZXkgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGtleSkpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1tcXChcXCldL2csIGVzY2FwZSk7XG5cblx0XHRcdFx0cmV0dXJuIChkb2N1bWVudC5jb29raWUgPSBbXG5cdFx0XHRcdFx0a2V5LCAnPScsIHZhbHVlLFxuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyAmJiAnOyBleHBpcmVzPScgKyBhdHRyaWJ1dGVzLmV4cGlyZXMudG9VVENTdHJpbmcoKSwgLy8gdXNlIGV4cGlyZXMgYXR0cmlidXRlLCBtYXgtYWdlIGlzIG5vdCBzdXBwb3J0ZWQgYnkgSUVcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLnBhdGggICAgJiYgJzsgcGF0aD0nICsgYXR0cmlidXRlcy5wYXRoLFxuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZG9tYWluICAmJiAnOyBkb21haW49JyArIGF0dHJpYnV0ZXMuZG9tYWluLFxuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuc2VjdXJlID8gJzsgc2VjdXJlJyA6ICcnXG5cdFx0XHRcdF0uam9pbignJykpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZWFkXG5cblx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdHJlc3VsdCA9IHt9O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG5cdFx0XHQvLyBpbiBjYXNlIHRoZXJlIGFyZSBubyBjb29raWVzIGF0IGFsbC4gQWxzbyBwcmV2ZW50cyBvZGQgcmVzdWx0IHdoZW5cblx0XHRcdC8vIGNhbGxpbmcgXCJnZXQoKVwiXG5cdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOyAnKSA6IFtdO1xuXHRcdFx0dmFyIHJkZWNvZGUgPSAvKCVbMC05QS1aXXsyfSkrL2c7XG5cdFx0XHR2YXIgaSA9IDA7XG5cblx0XHRcdGZvciAoOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG5cblx0XHRcdFx0aWYgKGNvb2tpZS5jaGFyQXQoMCkgPT09ICdcIicpIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWUuc2xpY2UoMSwgLTEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR2YXIgbmFtZSA9IHBhcnRzWzBdLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0XHRjb29raWUgPSBjb252ZXJ0ZXIucmVhZCA/XG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXIucmVhZChjb29raWUsIG5hbWUpIDogY29udmVydGVyKGNvb2tpZSwgbmFtZSkgfHxcblx0XHRcdFx0XHRcdGNvb2tpZS5yZXBsYWNlKHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cblx0XHRcdFx0XHRpZiAodGhpcy5qc29uKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb29raWUgPSBKU09OLnBhcnNlKGNvb2tpZSk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChrZXkgPT09IG5hbWUpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IGNvb2tpZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdFx0XHRyZXN1bHRbbmFtZV0gPSBjb29raWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdGFwaS5zZXQgPSBhcGk7XG5cdFx0YXBpLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHJldHVybiBhcGkoa2V5KTtcblx0XHR9O1xuXHRcdGFwaS5nZXRKU09OID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGFwaS5hcHBseSh7XG5cdFx0XHRcdGpzb246IHRydWVcblx0XHRcdH0sIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG5cdFx0fTtcblx0XHRhcGkuZGVmYXVsdHMgPSB7fTtcblxuXHRcdGFwaS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5LCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRhcGkoa2V5LCAnJywgZXh0ZW5kKGF0dHJpYnV0ZXMsIHtcblx0XHRcdFx0ZXhwaXJlczogLTFcblx0XHRcdH0pKTtcblx0XHR9O1xuXG5cdFx0YXBpLndpdGhDb252ZXJ0ZXIgPSBpbml0O1xuXG5cdFx0cmV0dXJuIGFwaTtcblx0fVxuXG5cdHJldHVybiBpbml0KGZ1bmN0aW9uICgpIHt9KTtcbn0pKTtcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzLmpzXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYm94QWxpZ25lZFRleHQ7XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBCYm94QWxpZ25lZFRleHQgb2JqZWN0IC0gYSB0ZXh0IG9iamVjdCB0aGF0IGNhbiBiZSBkcmF3biB3aXRoXHJcbiAqIGFuY2hvciBwb2ludHMgYmFzZWQgb24gYSB0aWdodCBib3VuZGluZyBib3ggYXJvdW5kIHRoZSB0ZXh0LlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtvYmplY3R9IGZvbnQgLSBwNS5Gb250IG9iamVjdFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFN0cmluZyB0byBkaXNwbGF5XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbZm9udFNpemU9MTJdIC0gRm9udCBzaXplIHRvIHVzZSBmb3Igc3RyaW5nXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeD0wXSAtIEluaXRpYWwgeCBsb2NhdGlvblxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3k9MF0gLSBJbml0aWFsIHkgbG9jYXRpb25cclxuICogQHBhcmFtIHtvYmplY3R9IFtwSW5zdGFuY2U9d2luZG93XSAtIFJlZmVyZW5jZSB0byBwNSBpbnN0YW5jZSwgbGVhdmUgYmxhbmsgaWZcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNrZXRjaCBpcyBnbG9iYWxcclxuICogQGV4YW1wbGVcclxuICogdmFyIGZvbnQsIGJib3hUZXh0O1xyXG4gKiBmdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gKiAgICAgZm9udCA9IGxvYWRGb250KFwiLi9hc3NldHMvUmVndWxhci50dGZcIik7XHJcbiAqIH1cclxuICogZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAqICAgICBjcmVhdGVDYW52YXMoNDAwLCA2MDApO1xyXG4gKiAgICAgYmFja2dyb3VuZCgwKTtcclxuICogICAgIFxyXG4gKiAgICAgYmJveFRleHQgPSBuZXcgQmJveEFsaWduZWRUZXh0KGZvbnQsIFwiSGV5IVwiLCAzMCk7ICAgIFxyXG4gKiAgICAgYmJveFRleHQuc2V0Um90YXRpb24oUEkgLyA0KTtcclxuICogICAgIGJib3hUZXh0LnNldEFuY2hvcihCYm94QWxpZ25lZFRleHQuQUxJR04uQk9YX0NFTlRFUiwgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVIpO1xyXG4gKiAgICAgXHJcbiAqICAgICBmaWxsKFwiIzAwQThFQVwiKTtcclxuICogICAgIG5vU3Ryb2tlKCk7XHJcbiAqICAgICBiYm94VGV4dC5kcmF3KHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XHJcbiAqIH1cclxuICovXHJcbmZ1bmN0aW9uIEJib3hBbGlnbmVkVGV4dChmb250LCB0ZXh0LCBmb250U2l6ZSwgeCwgeSwgcEluc3RhbmNlKSB7XHJcbiAgICB0aGlzLl9mb250ID0gZm9udDtcclxuICAgIHRoaXMuX3RleHQgPSB0ZXh0O1xyXG4gICAgdGhpcy5feCA9IHV0aWxzLmRlZmF1bHQoeCwgMCk7XHJcbiAgICB0aGlzLl95ID0gdXRpbHMuZGVmYXVsdCh5LCAwKTtcclxuICAgIHRoaXMuX2ZvbnRTaXplID0gdXRpbHMuZGVmYXVsdChmb250U2l6ZSwgMTIpO1xyXG4gICAgdGhpcy5fcCA9IHV0aWxzLmRlZmF1bHQocEluc3RhbmNlLCB3aW5kb3cpO1xyXG4gICAgdGhpcy5fcm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy5faEFsaWduID0gQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9DRU5URVI7XHJcbiAgICB0aGlzLl92QWxpZ24gPSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUjtcclxuICAgIHRoaXMuX2NhbGN1bGF0ZU1ldHJpY3ModHJ1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWZXJ0aWNhbCBhbGlnbm1lbnQgdmFsdWVzXHJcbiAqIEBwdWJsaWNcclxuICogQHN0YXRpY1xyXG4gKiBAcmVhZG9ubHlcclxuICogQGVudW0ge3N0cmluZ31cclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5BTElHTiA9IHtcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIGxlZnQgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9MRUZUOiBcImJveF9sZWZ0XCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9DRU5URVI6IFwiYm94X2NlbnRlclwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgcmlnaHQgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9SSUdIVDogXCJib3hfcmlnaHRcIlxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2VsaW5lIGFsaWdubWVudCB2YWx1ZXNcclxuICogQHB1YmxpY1xyXG4gKiBAc3RhdGljXHJcbiAqIEByZWFkb25seVxyXG4gKiBAZW51bSB7c3RyaW5nfVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FID0ge1xyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgdG9wIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfVE9QOiBcImJveF90b3BcIixcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIGNlbnRlciBvZiB0aGUgYmJveCAqL1xyXG4gICAgQk9YX0NFTlRFUjogXCJib3hfY2VudGVyXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBib3R0b20gb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9CT1RUT006IFwiYm94X2JvdHRvbVwiLFxyXG4gICAgLyoqIFxyXG4gICAgICogRHJhdyBmcm9tIGhhbGYgdGhlIGhlaWdodCBvZiB0aGUgZm9udC4gU3BlY2lmaWNhbGx5IHRoZSBoZWlnaHQgaXNcclxuICAgICAqIGNhbGN1bGF0ZWQgYXM6IGFzY2VudCArIGRlc2NlbnQuXHJcbiAgICAgKi9cclxuICAgIEZPTlRfQ0VOVEVSOiBcImZvbnRfY2VudGVyXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSB0aGUgbm9ybWFsIGZvbnQgYmFzZWxpbmUgKi9cclxuICAgIEFMUEhBQkVUSUM6IFwiYWxwaGFiZXRpY1wiXHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGN1cnJlbnQgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBUZXh0IHN0cmluZyB0byBkaXNwbGF5XHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFRleHQgPSBmdW5jdGlvbihzdHJpbmcpIHtcclxuICAgIHRoaXMuX3RleHQgPSBzdHJpbmc7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVNZXRyaWNzKGZhbHNlKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgdGV4dCBwb3NpdGlvblxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gWCBwb3NpdGlvblxyXG4gKiBAcGFyYW0ge251bWJlcn0geCAtIFkgcG9zaXRpb25cclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbih4LCB5KSB7XHJcbiAgICB0aGlzLl94ID0gdXRpbHMuZGVmYXVsdCh4LCB0aGlzLl94KTtcclxuICAgIHRoaXMuX3kgPSB1dGlscy5kZWZhdWx0KHksIHRoaXMuX3kpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRoZSB0ZXh0IHBvc2l0aW9uXHJcbiAqIEBwdWJsaWNcclxuICogQHJldHVybiB7b2JqZWN0fSBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXM6IHgsIHlcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogdGhpcy5feCxcclxuICAgICAgICB5OiB0aGlzLl95XHJcbiAgICB9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCBjdXJyZW50IHRleHQgc2l6ZVxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBmb250U2l6ZSBUZXh0IHNpemVcclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0VGV4dFNpemUgPSBmdW5jdGlvbihmb250U2l6ZSkge1xyXG4gICAgdGhpcy5fZm9udFNpemUgPSBmb250U2l6ZTtcclxuICAgIHRoaXMuX2NhbGN1bGF0ZU1ldHJpY3ModHJ1ZSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgcm90YXRpb24gb2YgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFJvdGF0aW9uIGluIHJhZGlhbnNcclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0Um90YXRpb24gPSBmdW5jdGlvbihhbmdsZSkge1xyXG4gICAgdGhpcy5fcm90YXRpb24gPSB1dGlscy5kZWZhdWx0KGFuZ2xlLCB0aGlzLl9yb3RhdGlvbik7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgcm90YXRpb24gb2YgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJvdGF0aW9uIGluIHJhZGlhbnNcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0Um90YXRpb24gPSBmdW5jdGlvbihhbmdsZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3JvdGF0aW9uO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgcCBpbnN0YW5jZSB0aGF0IGlzIHVzZWQgZm9yIGRyYXdpbmdcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge29iamVjdH0gcCAtIEluc3RhbmNlIG9mIHA1IGZvciBkcmF3aW5nLiBUaGlzIGlzIG9ubHkgbmVlZGVkIHdoZW4gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgdXNpbmcgYW4gb2Zmc2NyZWVuIHJlbmRlcmVyIG9yIHdoZW4gdXNpbmcgcDUgaW4gaW5zdGFuY2VcclxuICogICAgICAgICAgICAgICAgICAgICBtb2RlLlxyXG4gKiBAcmV0dXJucyB7dGhpc30gVXNlZnVsIGZvciBjaGFpbmluZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRQSW5zdGFuY2UgPSBmdW5jdGlvbihwKSB7XHJcbiAgICB0aGlzLl9wID0gdXRpbHMuZGVmYXVsdChwLCB0aGlzLl9wKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCByb3RhdGlvbiBvZiB0ZXh0XHJcbiAqIEBwdWJsaWNcclxuICogQHJldHVybnMge29iamVjdH0gSW5zdGFuY2Ugb2YgcDUgdGhhdCBpcyBiZWluZyB1c2VkIGZvciBkcmF3aW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLmdldFBJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3A7XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGFuY2hvciBwb2ludCBmb3IgdGV4dCAoaG9yaXpvbmFsIGFuZCB2ZXJ0aWNhbCBhbGlnbm1lbnQpIHJlbGF0aXZlIHRvXHJcbiAqIGJvdW5kaW5nIGJveFxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbaEFsaWduPUNFTlRFUl0gLSBIb3Jpem9uYWwgYWxpZ25tZW50XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdkFsaWduPUNFTlRFUl0gLSBWZXJ0aWNhbCBiYXNlbGluZVxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFt1cGRhdGVQb3NpdGlvbj1mYWxzZV0gLSBJZiBzZXQgdG8gdHJ1ZSwgdGhlIHBvc2l0aW9uIG9mIHRoZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgdGV4dCB3aWxsIGJlIHNoaWZ0ZWQgc28gdGhhdFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgdGV4dCB3aWxsIGJlIGRyYXduIGluIHRoZSBzYW1lXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlIGl0IHdhcyBiZWZvcmUgY2FsbGluZyBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0QW5jaG9yLlxyXG4gKiBAcmV0dXJucyB7dGhpc30gVXNlZnVsIGZvciBjaGFpbmluZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRBbmNob3IgPSBmdW5jdGlvbihoQWxpZ24sIHZBbGlnbiwgdXBkYXRlUG9zaXRpb24pIHtcclxuICAgIHZhciBvbGRQb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHRoaXMuX3gsIHRoaXMuX3kpO1xyXG4gICAgdGhpcy5faEFsaWduID0gdXRpbHMuZGVmYXVsdChoQWxpZ24sIEJib3hBbGlnbmVkVGV4dC5BTElHTi5DRU5URVIpO1xyXG4gICAgdGhpcy5fdkFsaWduID0gdXRpbHMuZGVmYXVsdCh2QWxpZ24sIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5DRU5URVIpO1xyXG4gICAgaWYgKHVwZGF0ZVBvc2l0aW9uKSB7XHJcbiAgICAgICAgdmFyIG5ld1BvcyA9IHRoaXMuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHModGhpcy5feCwgdGhpcy5feSk7XHJcbiAgICAgICAgdGhpcy5feCArPSBvbGRQb3MueCAtIG5ld1Bvcy54O1xyXG4gICAgICAgIHRoaXMuX3kgKz0gb2xkUG9zLnkgLSBuZXdQb3MueTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgYm91bmRpbmcgYm94IHdoZW4gdGhlIHRleHQgaXMgcGxhY2VkIGF0IHRoZSBzcGVjaWZpZWQgY29vcmRpbmF0ZXMuXHJcbiAqIE5vdGU6IHRoaXMgaXMgdGhlIHVucm90YXRlZCBib3VuZGluZyBib3ghIFRPRE86IEZpeCB0aGlzLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3g9Y3VycmVudCB4XSAtIEEgbmV3IHggY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpc1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbGwgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJtYW5lbnRseS4gXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeT1jdXJyZW50IHldIC0gQSBuZXcgeSBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbmVudGx5LlxyXG4gKiBAcmV0dXJuIHtvYmplY3R9IFJldHVybnMgYW4gb2JqZWN0IHdpdGggcHJvcGVydGllczogeCwgeSwgdywgaFxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRCYm94ID0gZnVuY3Rpb24oeCwgeSkge1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvbih4LCB5KTtcclxuICAgIHZhciBwb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHRoaXMuX3gsIHRoaXMuX3kpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiBwb3MueCArIHRoaXMuX2JvdW5kc09mZnNldC54LFxyXG4gICAgICAgIHk6IHBvcy55ICsgdGhpcy5fYm91bmRzT2Zmc2V0LnksXHJcbiAgICAgICAgdzogdGhpcy53aWR0aCxcclxuICAgICAgICBoOiB0aGlzLmhlaWdodFxyXG4gICAgfTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgYW4gYXJyYXkgb2YgcG9pbnRzIHRoYXQgZm9sbG93IGFsb25nIHRoZSB0ZXh0IHBhdGguIFRoaXMgd2lsbCB0YWtlIGludG9cclxuICogY29uc2lkZXJhdGlvbiB0aGUgY3VycmVudCBhbGlnbm1lbnQgc2V0dGluZ3MuXHJcbiAqIE5vdGU6IHRoaXMgaXMgYSB0aGluIHdyYXBwZXIgYXJvdW5kIGEgcDUgbWV0aG9kIGFuZCBkb2Vzbid0IGhhbmRsZSB1bnJvdGF0ZWRcclxuICogdGV4dCEgVE9ETzogRml4IHRoaXMuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeD1jdXJyZW50IHhdIC0gQSBuZXcgeCBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbmVudGx5LiBcclxuICogQHBhcmFtIHtudW1iZXJ9IFt5PWN1cnJlbnQgeV0gLSBBIG5ldyB5IGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3IuIFRoaXNcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVybWFuZW50bHkuXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gLSBBbiBvYmplY3QgdGhhdCBjYW4gaGF2ZTpcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBzYW1wbGVGYWN0b3I6IHJhdGlvIG9mIHBhdGgtbGVuZ3RoIHRvIG51bWJlclxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mIHNhbXBsZXMgKGRlZmF1bHQ9MC4yNSkuIEhpZ2hlciB2YWx1ZXMgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgbW9yZXBvaW50cyBhbmQgYXJlIHRoZXJlZm9yZSBtb3JlIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWNpc2UuIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHNpbXBsaWZ5VGhyZXNob2xkOiBpZiBzZXQgdG8gYSBub24temVybyBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSwgY29sbGluZWFyIHBvaW50cyB3aWxsIGJlIHJlbW92ZWQuIFRoZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlIHJlcHJlc2VudHMgdGhlIHRocmVzaG9sZCBhbmdsZSB0byB1c2VcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuIGRldGVybWluaW5nIHdoZXRoZXIgdHdvIGVkZ2VzIGFyZSBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaW5lYXIuXHJcbiAqIEByZXR1cm4ge2FycmF5fSBBbiBhcnJheSBvZiBwb2ludHMsIGVhY2ggd2l0aCB4LCB5ICYgYWxwaGEgKHRoZSBwYXRoIGFuZ2xlKVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRUZXh0UG9pbnRzID0gZnVuY3Rpb24oeCwgeSwgb3B0aW9ucykge1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvbih4LCB5KTtcclxuICAgIHZhciBwb2ludHMgPSB0aGlzLl9mb250LnRleHRUb1BvaW50cyh0aGlzLl90ZXh0LCB0aGlzLl94LCB0aGlzLl95LCBcclxuICAgICAgICB0aGlzLl9mb250U2l6ZSwgb3B0aW9ucyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBwb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHBvaW50c1tpXS54LCBwb2ludHNbaV0ueSk7XHJcbiAgICAgICAgcG9pbnRzW2ldLnggPSBwb3MueDtcclxuICAgICAgICBwb2ludHNbaV0ueSA9IHBvcy55O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBvaW50cztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEcmF3cyB0aGUgdGV4dCBwYXJ0aWNsZSB3aXRoIHRoZSBzcGVjaWZpZWQgc3R5bGUgcGFyYW1ldGVycy4gTm90ZTogdGhpcyBpc1xyXG4gKiBnb2luZyB0byBzZXQgdGhlIHRleHRGb250LCB0ZXh0U2l6ZSAmIHJvdGF0aW9uIGJlZm9yZSBkcmF3aW5nLiBZb3Ugc2hvdWxkIHNldFxyXG4gKiB0aGUgY29sb3Ivc3Ryb2tlL2ZpbGwgdGhhdCB5b3Ugd2FudCBiZWZvcmUgZHJhd2luZy4gVGhpcyBmdW5jdGlvbiB3aWxsIGNsZWFuXHJcbiAqIHVwIGFmdGVyIGl0c2VsZiBhbmQgcmVzZXQgc3R5bGluZyBiYWNrIHRvIHdoYXQgaXQgd2FzIGJlZm9yZSBpdCB3YXMgY2FsbGVkLlxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeD1jdXJyZW50IHhdIC0gQSBuZXcgeCBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzIHdpbGxcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gcGVybWFuZW50bHkuIFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3k9Y3VycmVudCB5XSAtIEEgbmV3IHkgY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpcyB3aWxsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBwZXJtYW5lbnRseS5cclxuICogQHBhcmFtIHtib29sZWFufSBbZHJhd0JvdW5kcz1mYWxzZV0gLSBGbGFnIGZvciBkcmF3aW5nIGJvdW5kaW5nIGJveFxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oeCwgeSwgZHJhd0JvdW5kcykge1xyXG4gICAgZHJhd0JvdW5kcyA9IHV0aWxzLmRlZmF1bHQoZHJhd0JvdW5kcywgZmFsc2UpO1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvbih4LCB5KTtcclxuICAgIHZhciBwb3MgPSB7XHJcbiAgICAgICAgeDogdGhpcy5feCwgXHJcbiAgICAgICAgeTogdGhpcy5feVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9wLnB1c2goKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3JvdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuX2NhbGN1bGF0ZVJvdGF0ZWRDb29yZHMocG9zLngsIHBvcy55LCB0aGlzLl9yb3RhdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuX3Aucm90YXRlKHRoaXMuX3JvdGF0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBvcyA9IHRoaXMuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHMocG9zLngsIHBvcy55KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcC50ZXh0QWxpZ24odGhpcy5fcC5MRUZULCB0aGlzLl9wLkJBU0VMSU5FKTtcclxuICAgICAgICB0aGlzLl9wLnRleHRGb250KHRoaXMuX2ZvbnQpO1xyXG4gICAgICAgIHRoaXMuX3AudGV4dFNpemUodGhpcy5fZm9udFNpemUpO1xyXG4gICAgICAgIHRoaXMuX3AudGV4dCh0aGlzLl90ZXh0LCBwb3MueCwgcG9zLnkpO1xyXG5cclxuICAgICAgICBpZiAoZHJhd0JvdW5kcykge1xyXG4gICAgICAgICAgICB0aGlzLl9wLnN0cm9rZSgyMDApO1xyXG4gICAgICAgICAgICB2YXIgYm91bmRzWCA9IHBvcy54ICsgdGhpcy5fYm91bmRzT2Zmc2V0Lng7XHJcbiAgICAgICAgICAgIHZhciBib3VuZHNZID0gcG9zLnkgKyB0aGlzLl9ib3VuZHNPZmZzZXQueTtcclxuICAgICAgICAgICAgdGhpcy5fcC5ub0ZpbGwoKTtcclxuICAgICAgICAgICAgdGhpcy5fcC5yZWN0KGJvdW5kc1gsIGJvdW5kc1ksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgdGhpcy5fcC5wb3AoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBQcm9qZWN0IHRoZSBjb29yZGluYXRlcyAoeCwgeSkgaW50byBhIHJvdGF0ZWQgY29vcmRpbmF0ZSBzeXN0ZW1cclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtudW1iZXJ9IHggLSBYIGNvb3JkaW5hdGUgKGluIHVucm90YXRlZCBzcGFjZSlcclxuICogQHBhcmFtIHtudW1iZXJ9IHkgLSBZIGNvb3JkaW5hdGUgKGluIHVucm90YXRlZCBzcGFjZSlcclxuICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gUmFkaWFucyBvZiByb3RhdGlvbiB0byBhcHBseVxyXG4gKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCB3aXRoIHggJiB5IHByb3BlcnRpZXNcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuX2NhbGN1bGF0ZVJvdGF0ZWRDb29yZHMgPSBmdW5jdGlvbiAoeCwgeSwgYW5nbGUpIHsgIFxyXG4gICAgdmFyIHJ4ID0gTWF0aC5jb3MoYW5nbGUpICogeCArIE1hdGguY29zKE1hdGguUEkgLyAyIC0gYW5nbGUpICogeTtcclxuICAgIHZhciByeSA9IC1NYXRoLnNpbihhbmdsZSkgKiB4ICsgTWF0aC5zaW4oTWF0aC5QSSAvIDIgLSBhbmdsZSkgKiB5O1xyXG4gICAgcmV0dXJuIHt4OiByeCwgeTogcnl9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgZHJhdyBjb29yZGluYXRlcyBmb3IgdGhlIHRleHQsIGFsaWduaW5nIGJhc2VkIG9uIHRoZSBib3VuZGluZyBib3guXHJcbiAqIFRoZSB0ZXh0IGlzIGV2ZW50dWFsbHkgZHJhd24gd2l0aCBjYW52YXMgYWxpZ25tZW50IHNldCB0byBsZWZ0ICYgYmFzZWxpbmUsIHNvXHJcbiAqIHRoaXMgZnVuY3Rpb24gdGFrZXMgYSBkZXNpcmVkIHBvcyAmIGFsaWdubWVudCBhbmQgcmV0dXJucyB0aGUgYXBwcm9wcmlhdGVcclxuICogY29vcmRpbmF0ZXMgZm9yIHRoZSBsZWZ0ICYgYmFzZWxpbmUuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gWCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gWSBjb29yZGluYXRlXHJcbiAqIEByZXR1cm4ge29iamVjdH0gT2JqZWN0IHdpdGggeCAmIHkgcHJvcGVydGllc1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5fY2FsY3VsYXRlQWxpZ25lZENvb3JkcyA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICAgIHZhciBuZXdYLCBuZXdZO1xyXG4gICAgc3dpdGNoICh0aGlzLl9oQWxpZ24pIHtcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfTEVGVDpcclxuICAgICAgICAgICAgbmV3WCA9IHg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9DRU5URVI6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4IC0gdGhpcy5oYWxmV2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9SSUdIVDpcclxuICAgICAgICAgICAgbmV3WCA9IHggLSB0aGlzLndpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBuZXdYID0geDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbnJlY29nbml6ZWQgaG9yaXpvbmFsIGFsaWduOlwiLCB0aGlzLl9oQWxpZ24pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHN3aXRjaCAodGhpcy5fdkFsaWduKSB7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX1RPUDpcclxuICAgICAgICAgICAgbmV3WSA9IHkgLSB0aGlzLl9ib3VuZHNPZmZzZXQueTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUjpcclxuICAgICAgICAgICAgbmV3WSA9IHkgKyB0aGlzLl9kaXN0QmFzZVRvTWlkO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5CT1hfQk9UVE9NOlxyXG4gICAgICAgICAgICBuZXdZID0geSAtIHRoaXMuX2Rpc3RCYXNlVG9Cb3R0b207XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkZPTlRfQ0VOVEVSOlxyXG4gICAgICAgICAgICAvLyBIZWlnaHQgaXMgYXBwcm94aW1hdGVkIGFzIGFzY2VudCArIGRlc2NlbnRcclxuICAgICAgICAgICAgbmV3WSA9IHkgLSB0aGlzLl9kZXNjZW50ICsgKHRoaXMuX2FzY2VudCArIHRoaXMuX2Rlc2NlbnQpIC8gMjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQUxQSEFCRVRJQzpcclxuICAgICAgICAgICAgbmV3WSA9IHk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5O1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVucmVjb2duaXplZCB2ZXJ0aWNhbCBhbGlnbjpcIiwgdGhpcy5fdkFsaWduKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge3g6IG5ld1gsIHk6IG5ld1l9O1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIGJvdW5kaW5nIGJveCBhbmQgdmFyaW91cyBtZXRyaWNzIGZvciB0aGUgY3VycmVudCB0ZXh0IGFuZCBmb250XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLl9jYWxjdWxhdGVNZXRyaWNzID0gZnVuY3Rpb24oc2hvdWxkVXBkYXRlSGVpZ2h0KSB7ICBcclxuICAgIC8vIHA1IDAuNS4wIGhhcyBhIGJ1ZyAtIHRleHQgYm91bmRzIGFyZSBjbGlwcGVkIGJ5ICgwLCAwKVxyXG4gICAgLy8gQ2FsY3VsYXRpbmcgYm91bmRzIGhhY2tcclxuICAgIHZhciBib3VuZHMgPSB0aGlzLl9mb250LnRleHRCb3VuZHModGhpcy5fdGV4dCwgMTAwMCwgMTAwMCwgdGhpcy5fZm9udFNpemUpO1xyXG4gICAgLy8gQm91bmRzIGlzIGEgcmVmZXJlbmNlIC0gaWYgd2UgbWVzcyB3aXRoIGl0IGRpcmVjdGx5LCB3ZSBjYW4gbWVzcyB1cCBcclxuICAgIC8vIGZ1dHVyZSB2YWx1ZXMhIChJdCBjaGFuZ2VzIHRoZSBiYm94IGNhY2hlIGluIHA1LilcclxuICAgIGJvdW5kcyA9IHsgXHJcbiAgICAgICAgeDogYm91bmRzLnggLSAxMDAwLCBcclxuICAgICAgICB5OiBib3VuZHMueSAtIDEwMDAsIFxyXG4gICAgICAgIHc6IGJvdW5kcy53LCBcclxuICAgICAgICBoOiBib3VuZHMuaCBcclxuICAgIH07IFxyXG5cclxuICAgIGlmIChzaG91bGRVcGRhdGVIZWlnaHQpIHtcclxuICAgICAgICB0aGlzLl9hc2NlbnQgPSB0aGlzLl9mb250Ll90ZXh0QXNjZW50KHRoaXMuX2ZvbnRTaXplKTtcclxuICAgICAgICB0aGlzLl9kZXNjZW50ID0gdGhpcy5fZm9udC5fdGV4dERlc2NlbnQodGhpcy5fZm9udFNpemUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZSBib3VuZHMgdG8gY2FsY3VsYXRlIGZvbnQgbWV0cmljc1xyXG4gICAgdGhpcy53aWR0aCA9IGJvdW5kcy53O1xyXG4gICAgdGhpcy5oZWlnaHQgPSBib3VuZHMuaDtcclxuICAgIHRoaXMuaGFsZldpZHRoID0gdGhpcy53aWR0aCAvIDI7XHJcbiAgICB0aGlzLmhhbGZIZWlnaHQgPSB0aGlzLmhlaWdodCAvIDI7XHJcbiAgICB0aGlzLl9ib3VuZHNPZmZzZXQgPSB7IHg6IGJvdW5kcy54LCB5OiBib3VuZHMueSB9O1xyXG4gICAgdGhpcy5fZGlzdEJhc2VUb01pZCA9IE1hdGguYWJzKGJvdW5kcy55KSAtIHRoaXMuaGFsZkhlaWdodDtcclxuICAgIHRoaXMuX2Rpc3RCYXNlVG9Cb3R0b20gPSB0aGlzLmhlaWdodCAtIE1hdGguYWJzKGJvdW5kcy55KTtcclxufTsiLCJleHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbih2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICByZXR1cm4gKHZhbHVlICE9PSB1bmRlZmluZWQpID8gdmFsdWUgOiBkZWZhdWx0VmFsdWU7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBIb3ZlclNsaWRlc2hvd3M7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gSG92ZXJTbGlkZXNob3dzKHNsaWRlc2hvd0RlbGF5LCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRoaXMuX3NsaWRlc2hvd0RlbGF5ID0gKHNsaWRlc2hvd0RlbGF5ICE9PSB1bmRlZmluZWQpID8gc2xpZGVzaG93RGVsYXkgOiBcclxuICAgICAgICAyMDAwO1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gKHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSA/IFxyXG4gICAgICAgIF90cmFuc2l0aW9uRHVyYXRpb24gOiAxMDAwOyAgIFxyXG5cclxuICAgIHRoaXMuX3NsaWRlc2hvd3MgPSBbXTtcclxuICAgIHRoaXMucmVsb2FkKCk7XHJcbn1cclxuXHJcbkhvdmVyU2xpZGVzaG93cy5wcm90b3R5cGUucmVsb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gTm90ZTogdGhpcyBpcyBjdXJyZW50bHkgbm90IHJlYWxseSBiZWluZyB1c2VkLiBXaGVuIGEgcGFnZSBpcyBsb2FkZWQsXHJcbiAgICAvLyBtYWluLmpzIGlzIGp1c3QgcmUtaW5zdGFuY2luZyB0aGUgSG92ZXJTbGlkZXNob3dzXHJcbiAgICB2YXIgb2xkU2xpZGVzaG93cyA9IHRoaXMuX3NsaWRlc2hvd3MgfHwgW107XHJcbiAgICB0aGlzLl9zbGlkZXNob3dzID0gW107XHJcbiAgICAkKFwiLmhvdmVyLXNsaWRlc2hvd1wiKS5lYWNoKGZ1bmN0aW9uIChfLCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcclxuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl9maW5kSW5TbGlkZXNob3dzKGVsZW1lbnQsIG9sZFNsaWRlc2hvd3MpO1xyXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlc2hvdyA9IG9sZFNsaWRlc2hvd3Muc3BsaWNlKGluZGV4LCAxKVswXTtcclxuICAgICAgICAgICAgdGhpcy5fc2xpZGVzaG93cy5wdXNoKHNsaWRlc2hvdyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fc2xpZGVzaG93cy5wdXNoKG5ldyBTbGlkZXNob3coJGVsZW1lbnQsIHRoaXMuX3NsaWRlc2hvd0RlbGF5LFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkhvdmVyU2xpZGVzaG93cy5wcm90b3R5cGUuX2ZpbmRJblNsaWRlc2hvd3MgPSBmdW5jdGlvbiAoZWxlbWVudCwgc2xpZGVzaG93cykge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXNob3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IHNsaWRlc2hvd3NbaV0uZ2V0RWxlbWVudCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAtMTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIFNsaWRlc2hvdygkY29udGFpbmVyLCBzbGlkZXNob3dEZWxheSwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICAgIHRoaXMuX3NsaWRlc2hvd0RlbGF5ID0gc2xpZGVzaG93RGVsYXk7XHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb247XHJcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBudWxsO1xyXG4gICAgdGhpcy5faW1hZ2VJbmRleCA9IDA7XHJcbiAgICB0aGlzLl8kaW1hZ2VzID0gW107XHJcblxyXG4gICAgLy8gU2V0IHVwIGFuZCBjYWNoZSByZWZlcmVuY2VzIHRvIGltYWdlc1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5maW5kKFwiaW1nXCIpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRpbWFnZSA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgJGltYWdlLmNzcyh7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgICAgIHRvcDogXCIwXCIsXHJcbiAgICAgICAgICAgIGxlZnQ6IFwiMFwiLFxyXG4gICAgICAgICAgICB6SW5kZXg6IChpbmRleCA9PT0gMCkgPyAyIDogMCAvLyBGaXJzdCBpbWFnZSBzaG91bGQgYmUgb24gdG9wXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlcy5wdXNoKCRpbWFnZSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRvIGJpbmQgaW50ZXJhY3Rpdml0eVxyXG4gICAgdGhpcy5fbnVtSW1hZ2VzID0gdGhpcy5fJGltYWdlcy5sZW5ndGg7XHJcbiAgICBpZiAodGhpcy5fbnVtSW1hZ2VzIDw9IDEpIHJldHVybjtcclxuXHJcbiAgICAvLyBCaW5kIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5vbihcIm1vdXNlZW50ZXJcIiwgdGhpcy5fb25FbnRlci5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuXyRjb250YWluZXIub24oXCJtb3VzZWxlYXZlXCIsIHRoaXMuX29uTGVhdmUuYmluZCh0aGlzKSk7XHJcblxyXG59XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldEVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fJGNvbnRhaW5lci5nZXQoMCk7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldCRFbGVtZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuXyRjb250YWluZXI7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLl9vbkVudGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gRmlyc3QgdHJhbnNpdGlvbiBzaG91bGQgaGFwcGVuIHByZXR0eSBzb29uIGFmdGVyIGhvdmVyaW5nIGluIG9yZGVyXHJcbiAgICAvLyB0byBjbHVlIHRoZSB1c2VyIGludG8gd2hhdCBpcyBoYXBwZW5pbmdcclxuICAgIHRoaXMuX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fYWR2YW5jZVNsaWRlc2hvdy5iaW5kKHRoaXMpLCA1MDApO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fb25MZWF2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fdGltZW91dElkKTsgIFxyXG4gICAgdGhpcy5fdGltZW91dElkID0gbnVsbDsgICAgICBcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX2FkdmFuY2VTbGlkZXNob3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9pbWFnZUluZGV4ICs9IDE7XHJcbiAgICB2YXIgaTtcclxuXHJcbiAgICAvLyBNb3ZlIHRoZSBpbWFnZSBmcm9tIDIgc3RlcHMgYWdvIGRvd24gdG8gdGhlIGJvdHRvbSB6LWluZGV4IGFuZCBtYWtlXHJcbiAgICAvLyBpdCBpbnZpc2libGVcclxuICAgIGlmICh0aGlzLl9udW1JbWFnZXMgPj0gMykge1xyXG4gICAgICAgIGkgPSB1dGlsaXRpZXMud3JhcEluZGV4KHRoaXMuX2ltYWdlSW5kZXggLSAyLCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXNbaV0uY3NzKHtcclxuICAgICAgICAgICAgekluZGV4OiAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlc1tpXS52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTW92ZSB0aGUgaW1hZ2UgZnJvbSAxIHN0ZXBzIGFnbyBkb3duIHRvIHRoZSBtaWRkbGUgei1pbmRleCBhbmQgbWFrZVxyXG4gICAgLy8gaXQgY29tcGxldGVseSB2aXNpYmxlXHJcbiAgICBpZiAodGhpcy5fbnVtSW1hZ2VzID49IDIpIHtcclxuICAgICAgICBpID0gdXRpbGl0aWVzLndyYXBJbmRleCh0aGlzLl9pbWFnZUluZGV4IC0gMSwgdGhpcy5fbnVtSW1hZ2VzKTtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VzW2ldLmNzcyh7XHJcbiAgICAgICAgICAgIHpJbmRleDogMSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXNbaV0udmVsb2NpdHkoXCJzdG9wXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE1vdmUgdGhlIGN1cnJlbnQgaW1hZ2UgdG8gdGhlIHRvcCB6LWluZGV4IGFuZCBmYWRlIGl0IGluXHJcbiAgICB0aGlzLl9pbWFnZUluZGV4ID0gdXRpbGl0aWVzLndyYXBJbmRleCh0aGlzLl9pbWFnZUluZGV4LCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gICAgdGhpcy5fJGltYWdlc1t0aGlzLl9pbWFnZUluZGV4XS5jc3Moe1xyXG4gICAgICAgIHpJbmRleDogMixcclxuICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICB9KTtcclxuICAgIHRoaXMuXyRpbWFnZXNbdGhpcy5faW1hZ2VJbmRleF0udmVsb2NpdHkoe1xyXG4gICAgICAgIG9wYWNpdHk6IDFcclxuICAgIH0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXCJlYXNlSW5PdXRRdWFkXCIpO1xyXG5cclxuICAgIC8vIFNjaGVkdWxlIG5leHQgdHJhbnNpdGlvblxyXG4gICAgdGhpcy5fdGltZW91dElkID0gc2V0VGltZW91dCh0aGlzLl9hZHZhbmNlU2xpZGVzaG93LmJpbmQodGhpcyksIFxyXG4gICAgICAgIHRoaXMuX3NsaWRlc2hvd0RlbGF5KTtcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IEltYWdlR2FsbGVyaWVzO1xyXG5cclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEltYWdlR2FsbGVyaWVzKHRyYW5zaXRpb25EdXJhdGlvbikgeyBcclxuICAgIHRyYW5zaXRpb25EdXJhdGlvbiA9ICh0cmFuc2l0aW9uRHVyYXRpb24gIT09IHVuZGVmaW5lZCkgP1xyXG4gICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbiA6IDQwMDtcclxuICAgIHRoaXMuX2ltYWdlR2FsbGVyaWVzID0gW107XHJcbiAgICAkKFwiLmltYWdlLWdhbGxlcnlcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgZ2FsbGVyeSA9IG5ldyBJbWFnZUdhbGxlcnkoJChlbGVtZW50KSwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcclxuICAgICAgICB0aGlzLl9pbWFnZUdhbGxlcmllcy5wdXNoKGdhbGxlcnkpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gSW1hZ2VHYWxsZXJ5KCRjb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gdHJhbnNpdGlvbkR1cmF0aW9uO1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lciA9ICRjb250YWluZXI7XHJcbiAgICB0aGlzLl8kY2FwdGlvbkNvbnRhaW5lciA9ICRjb250YWluZXIuZmluZChcIi5pbWFnZS1nYWxsZXJ5LWNhcHRpb25cIik7XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyID0gJGNvbnRhaW5lci5maW5kKFwiLmltYWdlLWdhbGxlcnktdGh1bWJuYWlsc1wiKTtcclxuICAgIHRoaXMuX2luZGV4ID0gMDsgLy8gSW5kZXggb2Ygc2VsZWN0ZWQgaW1hZ2VcclxuXHJcbiAgICAvLyBMb29wIHRocm91Z2ggdGhlIHRodW1ibmFpbHMsIGdpdmUgdGhlbSBhbiBpbmRleCBkYXRhIGF0dHJpYnV0ZSBhbmQgY2FjaGVcclxuICAgIC8vIGEgcmVmZXJlbmNlIHRvIHRoZW0gaW4gYW4gYXJyYXlcclxuICAgIHRoaXMuXyR0aHVtYm5haWxzID0gW107XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyLmZpbmQoXCJpbWdcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgJHRodW1ibmFpbCA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgJHRodW1ibmFpbC5kYXRhKFwiaW5kZXhcIiwgaW5kZXgpO1xyXG4gICAgICAgIHRoaXMuXyR0aHVtYm5haWxzLnB1c2goJHRodW1ibmFpbCk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBlbXB0eSBpbWFnZXMgaW4gdGhlIGdhbGxlcnkgZm9yIGVhY2ggdGh1bWJuYWlsLiBUaGlzIGhlbHBzIHVzIGRvXHJcbiAgICAvLyBsYXp5IGxvYWRpbmcgb2YgZ2FsbGVyeSBpbWFnZXMgYW5kIGFsbG93cyB1cyB0byBjcm9zcy1mYWRlIGltYWdlcy5cclxuICAgIHRoaXMuXyRnYWxsZXJ5SW1hZ2VzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuXyR0aHVtYm5haWxzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBpZCBmcm9tIHRoZSBwYXRoIHRvIHRoZSBsYXJnZSBpbWFnZVxyXG4gICAgICAgIHZhciBsYXJnZVBhdGggPSB0aGlzLl8kdGh1bWJuYWlsc1tpXS5kYXRhKFwibGFyZ2UtcGF0aFwiKTtcclxuICAgICAgICB2YXIgaWQgPSBsYXJnZVBhdGguc3BsaXQoXCIvXCIpLnBvcCgpLnNwbGl0KFwiLlwiKVswXTtcclxuICAgICAgICB2YXIgJGdhbGxlcnlJbWFnZSA9ICQoXCI8aW1nPlwiKVxyXG4gICAgICAgICAgICAuY3NzKHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgICAgICAgICB0b3A6IFwiMHB4XCIsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBcIjBweFwiLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgICAgIHpJbmRleDogMFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYXR0cihcImlkXCIsIGlkKVxyXG4gICAgICAgICAgICAuZGF0YShcImltYWdlLXVybFwiLCBsYXJnZVBhdGgpXHJcbiAgICAgICAgICAgIC5hcHBlbmRUbygkY29udGFpbmVyLmZpbmQoXCIuaW1hZ2UtZ2FsbGVyeS1zZWxlY3RlZFwiKSk7XHJcbiAgICAgICAgJGdhbGxlcnlJbWFnZS5nZXQoMCkuc3JjID0gbGFyZ2VQYXRoOyAvLyBUT0RPOiBNYWtlIHRoaXMgbGF6eSFcclxuICAgICAgICB0aGlzLl8kZ2FsbGVyeUltYWdlcy5wdXNoKCRnYWxsZXJ5SW1hZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFjdGl2YXRlIHRoZSBmaXJzdCB0aHVtYm5haWwgYW5kIGRpc3BsYXkgaXQgaW4gdGhlIGdhbGxlcnkgXHJcbiAgICB0aGlzLl9zd2l0Y2hBY3RpdmVJbWFnZSgwKTtcclxuXHJcbiAgICAvLyBCaW5kIHRoZSBldmVudCBoYW5kbGVycyB0byB0aGUgaW1hZ2VzXHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyLmZpbmQoXCJpbWdcIikub24oXCJjbGlja1wiLCB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5JbWFnZUdhbGxlcnkucHJvdG90eXBlLl9zd2l0Y2hBY3RpdmVJbWFnZSA9IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgLy8gUmVzZXQgYWxsIGltYWdlcyB0byBpbnZpc2libGUgYW5kIGxvd2VzdCB6LWluZGV4LiBUaGlzIGNvdWxkIGJlIHNtYXJ0ZXIsXHJcbiAgICAvLyBsaWtlIEhvdmVyU2xpZGVzaG93LCBhbmQgb25seSByZXNldCBleGFjdGx5IHdoYXQgd2UgbmVlZCwgYnV0IHdlIGFyZW4ndCBcclxuICAgIC8vIHdhc3RpbmcgdGhhdCBtYW55IGN5Y2xlcy5cclxuICAgIHRoaXMuXyRnYWxsZXJ5SW1hZ2VzLmZvckVhY2goZnVuY3Rpb24gKCRnYWxsZXJ5SW1hZ2UpIHtcclxuICAgICAgICAkZ2FsbGVyeUltYWdlLmNzcyh7XHJcbiAgICAgICAgICAgIFwiekluZGV4XCI6IDAsXHJcbiAgICAgICAgICAgIFwib3BhY2l0eVwiOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGdhbGxlcnlJbWFnZS52ZWxvY2l0eShcInN0b3BcIik7IC8vIFN0b3AgYW55IGFuaW1hdGlvbnNcclxuICAgIH0sIHRoaXMpO1xyXG5cclxuICAgIC8vIENhY2hlIHJlZmVyZW5jZXMgdG8gdGhlIGxhc3QgYW5kIGN1cnJlbnQgaW1hZ2UgJiB0aHVtYm5haWxzXHJcbiAgICB2YXIgJGxhc3RUaHVtYm5haWwgPSB0aGlzLl8kdGh1bWJuYWlsc1t0aGlzLl9pbmRleF07XHJcbiAgICB2YXIgJGxhc3RJbWFnZSA9IHRoaXMuXyRnYWxsZXJ5SW1hZ2VzW3RoaXMuX2luZGV4XTtcclxuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XHJcbiAgICB2YXIgJGN1cnJlbnRUaHVtYm5haWwgPSB0aGlzLl8kdGh1bWJuYWlsc1t0aGlzLl9pbmRleF07XHJcbiAgICB2YXIgJGN1cnJlbnRJbWFnZSA9IHRoaXMuXyRnYWxsZXJ5SW1hZ2VzW3RoaXMuX2luZGV4XTtcclxuXHJcbiAgICAvLyBBY3RpdmF0ZS9kZWFjdGl2YXRlIHRodW1ibmFpbHNcclxuICAgICRsYXN0VGh1bWJuYWlsLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgJGN1cnJlbnRUaHVtYm5haWwuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcblxyXG4gICAgLy8gTWFrZSB0aGUgbGFzdCBpbWFnZSB2aXNpc2JsZSBhbmQgdGhlbiBhbmltYXRlIHRoZSBjdXJyZW50IGltYWdlIGludG8gdmlld1xyXG4gICAgLy8gb24gdG9wIG9mIHRoZSBsYXN0XHJcbiAgICAkbGFzdEltYWdlLmNzcyhcInpJbmRleFwiLCAxKTtcclxuICAgICRjdXJyZW50SW1hZ2UuY3NzKFwiekluZGV4XCIsIDIpO1xyXG4gICAgJGxhc3RJbWFnZS5jc3MoXCJvcGFjaXR5XCIsIDEpO1xyXG4gICAgJGN1cnJlbnRJbWFnZS52ZWxvY2l0eSh7XCJvcGFjaXR5XCI6IDF9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFxyXG4gICAgICAgIFwiZWFzZUluT3V0UXVhZFwiKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgdGhlIGNhcHRpb24sIGlmIGl0IGV4aXN0cyBvbiB0aGUgdGh1bWJuYWlsXHJcbiAgICB2YXIgY2FwdGlvbiA9ICRjdXJyZW50VGh1bWJuYWlsLmRhdGEoXCJjYXB0aW9uXCIpO1xyXG4gICAgaWYgKGNhcHRpb24pIHtcclxuICAgICAgICB0aGlzLl8kY2FwdGlvbkNvbnRhaW5lci5lbXB0eSgpO1xyXG4gICAgICAgICQoXCI8c3Bhbj5cIikuYWRkQ2xhc3MoXCJmaWd1cmUtbnVtYmVyXCIpXHJcbiAgICAgICAgICAgIC50ZXh0KFwiRmlnLiBcIiArICh0aGlzLl9pbmRleCArIDEpICsgXCI6IFwiKVxyXG4gICAgICAgICAgICAuYXBwZW5kVG8odGhpcy5fJGNhcHRpb25Db250YWluZXIpO1xyXG4gICAgICAgICQoXCI8c3Bhbj5cIikuYWRkQ2xhc3MoXCJjYXB0aW9uXCIpXHJcbiAgICAgICAgICAgIC50ZXh0KGNhcHRpb24pXHJcbiAgICAgICAgICAgIC5hcHBlbmRUbyh0aGlzLl8kY2FwdGlvbkNvbnRhaW5lcik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gT2JqZWN0IGltYWdlIGZpdCBwb2x5ZmlsbCBicmVha3MgalF1ZXJ5IGF0dHIoLi4uKSwgc28gZmFsbGJhY2sgdG8ganVzdCBcclxuICAgIC8vIHVzaW5nIGVsZW1lbnQuc3JjXHJcbiAgICAvLyBUT0RPOiBMYXp5IVxyXG4gICAgLy8gaWYgKCRjdXJyZW50SW1hZ2UuZ2V0KDApLnNyYyA9PT0gXCJcIikge1xyXG4gICAgLy8gICAgICRjdXJyZW50SW1hZ2UuZ2V0KDApLnNyYyA9ICRjdXJyZW50SW1hZ2UuZGF0YShcImltYWdlLXVybFwiKTtcclxuICAgIC8vIH1cclxufTtcclxuXHJcbkltYWdlR2FsbGVyeS5wcm90b3R5cGUuX29uQ2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuICAgIHZhciBpbmRleCA9ICR0YXJnZXQuZGF0YShcImluZGV4XCIpO1xyXG4gICAgXHJcbiAgICAvLyBDbGlja2VkIG9uIHRoZSBhY3RpdmUgaW1hZ2UgLSBubyBuZWVkIHRvIGRvIGFueXRoaW5nXHJcbiAgICBpZiAodGhpcy5faW5kZXggPT09IGluZGV4KSByZXR1cm47XHJcblxyXG4gICAgdGhpcy5fc3dpdGNoQWN0aXZlSW1hZ2UoaW5kZXgpOyAgXHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBCYXNlTG9nb1NrZXRjaDtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBCYXNlTG9nb1NrZXRjaCgkbmF2LCAkbmF2TG9nbywgZm9udFBhdGgpIHtcclxuICAgIHRoaXMuXyRuYXYgPSAkbmF2O1xyXG4gICAgdGhpcy5fJG5hdkxvZ28gPSAkbmF2TG9nbztcclxuICAgIHRoaXMuX2ZvbnRQYXRoID0gZm9udFBhdGg7XHJcblxyXG4gICAgdGhpcy5fdGV4dCA9IHRoaXMuXyRuYXZMb2dvLnRleHQoKTtcclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbiAgICB0aGlzLl9pc01vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgdGhpcy5faXNPdmVyTmF2TG9nbyA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuX3VwZGF0ZVRleHRPZmZzZXQoKTtcclxuICAgIHRoaXMuX3VwZGF0ZVNpemUoKTtcclxuICAgIHRoaXMuX3VwZGF0ZUZvbnRTaXplKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgKHJlbGF0aXZlIHBvc2l0aW9uZWQpIGNvbnRhaW5lciBmb3IgdGhlIHNrZXRjaCBpbnNpZGUgb2YgdGhlXHJcbiAgICAvLyBuYXYsIGJ1dCBtYWtlIHN1cmUgdGhhdCBpdCBpcyBCRUhJTkQgZXZlcnl0aGluZyBlbHNlLiBFdmVudHVhbGx5LCB3ZSB3aWxsXHJcbiAgICAvLyBkcm9wIGp1c3QgdGhlIG5hdiBsb2dvIChub3QgdGhlIG5hdiBsaW5rcyEpIGJlaGluZCB0aGUgY2FudmFzLlxyXG4gICAgdGhpcy5fJGNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKVxyXG4gICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICB0b3A6IFwiMHB4XCIsXHJcbiAgICAgICAgICAgIGxlZnQ6IFwiMHB4XCJcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5wcmVwZW5kVG8odGhpcy5fJG5hdilcclxuICAgICAgICAuaGlkZSgpO1xyXG5cclxuICAgIHRoaXMuX2NyZWF0ZVA1SW5zdGFuY2UoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIG5ldyBwNSBpbnN0YW5jZSBhbmQgYmluZCB0aGUgYXBwcm9wcmlhdGUgY2xhc3MgbWV0aG9kcyB0byB0aGVcclxuICogaW5zdGFuY2UuIFRoaXMgYWxzbyBmaWxscyBpbiB0aGUgcCBwYXJhbWV0ZXIgb24gdGhlIGNsYXNzIG1ldGhvZHMgKHNldHVwLFxyXG4gKiBkcmF3LCBldGMuKSBzbyB0aGF0IHRob3NlIGZ1bmN0aW9ucyBjYW4gYmUgYSBsaXR0bGUgbGVzcyB2ZXJib3NlIDopIFxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9jcmVhdGVQNUluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgbmV3IHA1KGZ1bmN0aW9uKHApIHtcclxuICAgICAgICB0aGlzLl9wID0gcDtcclxuICAgICAgICBwLnByZWxvYWQgPSB0aGlzLl9wcmVsb2FkLmJpbmQodGhpcywgcCk7XHJcbiAgICAgICAgcC5zZXR1cCA9IHRoaXMuX3NldHVwLmJpbmQodGhpcywgcCk7XHJcbiAgICAgICAgcC5kcmF3ID0gdGhpcy5fZHJhdy5iaW5kKHRoaXMsIHApO1xyXG4gICAgfS5iaW5kKHRoaXMpLCB0aGlzLl8kY29udGFpbmVyLmdldCgwKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRmluZCB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgdG9wIGxlZnQgb2YgdGhlIG5hdiB0byB0aGUgYnJhbmQgbG9nbydzIGJhc2VsaW5lLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl91cGRhdGVUZXh0T2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGJhc2VsaW5lRGl2ID0gJChcIjxkaXY+XCIpXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6IFwiaW5saW5lLWJsb2NrXCIsXHJcbiAgICAgICAgICAgIHZlcnRpY2FsQWxpZ246IFwiYmFzZWxpbmVcIlxyXG4gICAgICAgIH0pLnByZXBlbmRUbyh0aGlzLl8kbmF2TG9nbyk7XHJcbiAgICB2YXIgbmF2T2Zmc2V0ID0gdGhpcy5fJG5hdi5vZmZzZXQoKTtcclxuICAgIHZhciBsb2dvQmFzZWxpbmVPZmZzZXQgPSBiYXNlbGluZURpdi5vZmZzZXQoKTtcclxuICAgIHRoaXMuX3RleHRPZmZzZXQgPSB7XHJcbiAgICAgICAgdG9wOiBsb2dvQmFzZWxpbmVPZmZzZXQudG9wIC0gbmF2T2Zmc2V0LnRvcCxcclxuICAgICAgICBsZWZ0OiBsb2dvQmFzZWxpbmVPZmZzZXQubGVmdCAtIG5hdk9mZnNldC5sZWZ0XHJcbiAgICB9O1xyXG4gICAgYmFzZWxpbmVEaXYucmVtb3ZlKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRmluZCB0aGUgYm91bmRpbmcgYm94IG9mIHRoZSBicmFuZCBsb2dvIGluIHRoZSBuYXYuIFRoaXMgYmJveCBjYW4gdGhlbiBiZSBcclxuICogdXNlZCB0byBjb250cm9sIHdoZW4gdGhlIGN1cnNvciBzaG91bGQgYmUgYSBwb2ludGVyLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9jYWxjdWxhdGVOYXZMb2dvQm91bmRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG5hdk9mZnNldCA9IHRoaXMuXyRuYXYub2Zmc2V0KCk7XHJcbiAgICB2YXIgbG9nb09mZnNldCA9IHRoaXMuXyRuYXZMb2dvLm9mZnNldCgpO1xyXG4gICAgdGhpcy5fbG9nb0Jib3ggPSB7XHJcbiAgICAgICAgeTogbG9nb09mZnNldC50b3AgLSBuYXZPZmZzZXQudG9wLFxyXG4gICAgICAgIHg6IGxvZ29PZmZzZXQubGVmdCAtIG5hdk9mZnNldC5sZWZ0LFxyXG4gICAgICAgIHc6IHRoaXMuXyRuYXZMb2dvLm91dGVyV2lkdGgoKSwgLy8gRXhjbHVkZSBtYXJnaW4gZnJvbSB0aGUgYmJveFxyXG4gICAgICAgIGg6IHRoaXMuXyRuYXZMb2dvLm91dGVySGVpZ2h0KCkgLy8gTGlua3MgYXJlbid0IGNsaWNrYWJsZSBvbiBtYXJnaW5cclxuICAgIH07XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBkaW1lbnNpb25zIHRvIG1hdGNoIHRoZSBuYXYgLSBleGNsdWRpbmcgYW55IG1hcmdpbiwgcGFkZGluZyAmIFxyXG4gKiBib3JkZXIuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3VwZGF0ZVNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl93aWR0aCA9IHRoaXMuXyRuYXYuaW5uZXJXaWR0aCgpO1xyXG4gICAgdGhpcy5faGVpZ2h0ID0gdGhpcy5fJG5hdi5pbm5lckhlaWdodCgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdyYWIgdGhlIGZvbnQgc2l6ZSBmcm9tIHRoZSBicmFuZCBsb2dvIGxpbmsuIFRoaXMgbWFrZXMgdGhlIGZvbnQgc2l6ZSBvZiB0aGVcclxuICogc2tldGNoIHJlc3BvbnNpdmUuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3VwZGF0ZUZvbnRTaXplID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fZm9udFNpemUgPSB0aGlzLl8kbmF2TG9nby5jc3MoXCJmb250U2l6ZVwiKS5yZXBsYWNlKFwicHhcIiwgXCJcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogV2hlbiB0aGUgYnJvd3NlciBpcyByZXNpemVkLCByZWNhbGN1bGF0ZSBhbGwgdGhlIG5lY2Vzc2FyeSBzdGF0cyBzbyB0aGF0IHRoZVxyXG4gKiBza2V0Y2ggY2FuIGJlIHJlc3BvbnNpdmUuIFRoZSBsb2dvIGluIHRoZSBza2V0Y2ggc2hvdWxkIEFMV0FZUyBleGFjdGx5IG1hdGNoXHJcbiAqIHRoZSBicmFuZyBsb2dvIGxpbmsgdGhlIEhUTUwuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHRoaXMuX3VwZGF0ZVNpemUoKTtcclxuICAgIHRoaXMuX3VwZGF0ZUZvbnRTaXplKCk7XHJcbiAgICB0aGlzLl91cGRhdGVUZXh0T2Zmc2V0KCk7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVOYXZMb2dvQm91bmRzKCk7XHJcbiAgICBwLnJlc2l6ZUNhbnZhcyh0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIF9pc01vdXNlT3ZlciBwcm9wZXJ0eS4gXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldE1vdXNlT3ZlciA9IGZ1bmN0aW9uIChpc01vdXNlT3Zlcikge1xyXG4gICAgdGhpcy5faXNNb3VzZU92ZXIgPSBpc01vdXNlT3ZlcjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBJZiB0aGUgY3Vyc29yIGlzIHNldCB0byBhIHBvaW50ZXIsIGZvcndhcmQgYW55IGNsaWNrIGV2ZW50cyB0byB0aGUgbmF2IGxvZ28uXHJcbiAqIFRoaXMgcmVkdWNlcyB0aGUgbmVlZCBmb3IgdGhlIGNhbnZhcyB0byBkbyBhbnkgQUpBWC15IHN0dWZmLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vbkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICh0aGlzLl9pc092ZXJOYXZMb2dvKSB0aGlzLl8kbmF2TG9nby50cmlnZ2VyKGUpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgcHJlbG9hZCBtZXRob2QgdGhhdCBqdXN0IGxvYWRzIHRoZSBuZWNlc3NhcnkgZm9udFxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9wcmVsb2FkID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHRoaXMuX2ZvbnQgPSBwLmxvYWRGb250KHRoaXMuX2ZvbnRQYXRoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlIHNldHVwIG1ldGhvZCB0aGF0IGRvZXMgc29tZSBoZWF2eSBsaWZ0aW5nLiBJdCBoaWRlcyB0aGUgbmF2IGJyYW5kIGxvZ29cclxuICogYW5kIHJldmVhbHMgdGhlIGNhbnZhcy4gSXQgYWxzbyBzZXRzIHVwIGEgbG90IG9mIHRoZSBpbnRlcm5hbCB2YXJpYWJsZXMgYW5kXHJcbiAqIGNhbnZhcyBldmVudHMuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldHVwID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHZhciByZW5kZXJlciA9IHAuY3JlYXRlQ2FudmFzKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQpO1xyXG4gICAgdGhpcy5fJGNhbnZhcyA9ICQocmVuZGVyZXIuY2FudmFzKTtcclxuXHJcbiAgICAvLyBTaG93IHRoZSBjYW52YXMgYW5kIGhpZGUgdGhlIGxvZ28uIFVzaW5nIHNob3cvaGlkZSBvbiB0aGUgbG9nbyB3aWxsIGNhdXNlXHJcbiAgICAvLyBqUXVlcnkgdG8gbXVjayB3aXRoIHRoZSBwb3NpdGlvbmluZywgd2hpY2ggaXMgdXNlZCB0byBjYWxjdWxhdGUgd2hlcmUgdG9cclxuICAgIC8vIGRyYXcgdGhlIGNhbnZhcyB0ZXh0LiBJbnN0ZWFkLCBqdXN0IHB1c2ggdGhlIGxvZ28gYmVoaW5kIHRoZSBjYW52YXMuIFRoaXNcclxuICAgIC8vIGFsbG93cyBtYWtlcyBpdCBzbyB0aGUgY2FudmFzIGlzIHN0aWxsIGJlaGluZCB0aGUgbmF2IGxpbmtzLlxyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5zaG93KCk7XHJcbiAgICB0aGlzLl8kbmF2TG9nby5jc3MoXCJ6SW5kZXhcIiwgLTEpO1xyXG5cclxuICAgIC8vIFRoZXJlIGlzbid0IGEgZ29vZCB3YXkgdG8gY2hlY2sgd2hldGhlciB0aGUgc2tldGNoIGhhcyB0aGUgbW91c2Ugb3ZlclxyXG4gICAgLy8gaXQuIHAubW91c2VYICYgcC5tb3VzZVkgYXJlIGluaXRpYWxpemVkIHRvICgwLCAwKSwgYW5kIHAuZm9jdXNlZCBpc24ndCBcclxuICAgIC8vIGFsd2F5cyByZWxpYWJsZS5cclxuICAgIHRoaXMuXyRjYW52YXMub24oXCJtb3VzZW92ZXJcIiwgdGhpcy5fc2V0TW91c2VPdmVyLmJpbmQodGhpcywgdHJ1ZSkpO1xyXG4gICAgdGhpcy5fJGNhbnZhcy5vbihcIm1vdXNlb3V0XCIsIHRoaXMuX3NldE1vdXNlT3Zlci5iaW5kKHRoaXMsIGZhbHNlKSk7XHJcblxyXG4gICAgLy8gRm9yd2FyZCBtb3VzZSBjbGlja3MgdG8gdGhlIG5hdiBsb2dvXHJcbiAgICB0aGlzLl8kY2FudmFzLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSB3aW5kb3cgaXMgcmVzaXplZCwgdGV4dCAmIGNhbnZhcyBzaXppbmcgYW5kIHBsYWNlbWVudCBuZWVkIHRvIGJlXHJcbiAgICAvLyByZWNhbGN1bGF0ZWQuIFRoZSBzaXRlIGlzIHJlc3BvbnNpdmUsIHNvIHRoZSBpbnRlcmFjdGl2ZSBjYW52YXMgc2hvdWxkIGJlXHJcbiAgICAvLyB0b28hIFxyXG4gICAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcywgcCkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgZHJhdyBtZXRob2QgdGhhdCBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgY3Vyc29yIGlzIGEgcG9pbnRlci4gSXRcclxuICogc2hvdWxkIG9ubHkgYmUgYSBwb2ludGVyIHdoZW4gdGhlIG1vdXNlIGlzIG92ZXIgdGhlIG5hdiBicmFuZCBsb2dvLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24gKHApIHtcclxuICAgIGlmICh0aGlzLl9pc01vdXNlT3Zlcikge1xyXG4gICAgICAgIHZhciBpc092ZXJMb2dvID0gdXRpbHMuaXNJblJlY3QocC5tb3VzZVgsIHAubW91c2VZLCB0aGlzLl9sb2dvQmJveCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc092ZXJOYXZMb2dvICYmIGlzT3ZlckxvZ28pIHtcclxuICAgICAgICAgICAgdGhpcy5faXNPdmVyTmF2TG9nbyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuXyRjYW52YXMuY3NzKFwiY3Vyc29yXCIsIFwicG9pbnRlclwiKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzT3Zlck5hdkxvZ28gJiYgIWlzT3ZlckxvZ28pIHtcclxuICAgICAgICAgICAgdGhpcy5faXNPdmVyTmF2TG9nbyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl8kY2FudmFzLmNzcyhcImN1cnNvclwiLCBcImluaXRpYWxcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gU2tldGNoO1xyXG5cclxudmFyIEJib3hUZXh0ID0gcmVxdWlyZShcInA1LWJib3gtYWxpZ25lZC10ZXh0XCIpO1xyXG52YXIgQmFzZUxvZ29Ta2V0Y2ggPSByZXF1aXJlKFwiLi9iYXNlLWxvZ28tc2tldGNoLmpzXCIpO1xyXG52YXIgU2luR2VuZXJhdG9yID0gcmVxdWlyZShcIi4vZ2VuZXJhdG9ycy9zaW4tZ2VuZXJhdG9yLmpzXCIpO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZSk7XHJcblxyXG5mdW5jdGlvbiBTa2V0Y2goJG5hdiwgJG5hdkxvZ28pIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLmNhbGwodGhpcywgJG5hdiwgJG5hdkxvZ28sIFwiLi4vZm9udHMvYmlnX2pvaG4td2ViZm9udC50dGZcIik7XHJcbn1cclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUuY2FsbCh0aGlzLCBwKTtcclxuICAgIHRoaXMuX3NwYWNpbmcgPSB1dGlscy5tYXAodGhpcy5fZm9udFNpemUsIDIwLCA0MCwgMiwgNSwge2NsYW1wOiB0cnVlLCBcclxuICAgICAgICByb3VuZDogdHJ1ZX0pO1xyXG4gICAgLy8gVXBkYXRlIHRoZSBiYm94VGV4dCwgcGxhY2Ugb3ZlciB0aGUgbmF2IHRleHQgbG9nbyBhbmQgdGhlbiBzaGlmdCBpdHMgXHJcbiAgICAvLyBhbmNob3IgYmFjayB0byAoY2VudGVyLCBjZW50ZXIpIHdoaWxlIHByZXNlcnZpbmcgdGhlIHRleHQgcG9zaXRpb25cclxuICAgIHRoaXMuX2Jib3hUZXh0LnNldFRleHQodGhpcy5fdGV4dClcclxuICAgICAgICAuc2V0VGV4dFNpemUodGhpcy5fZm9udFNpemUpXHJcbiAgICAgICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfTEVGVCwgQmJveFRleHQuQkFTRUxJTkUuQUxQSEFCRVRJQylcclxuICAgICAgICAuc2V0UG9zaXRpb24odGhpcy5fdGV4dE9mZnNldC5sZWZ0LCB0aGlzLl90ZXh0T2Zmc2V0LnRvcClcclxuICAgICAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9DRU5URVIsIEJib3hUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVIsIFxyXG4gICAgICAgICAgICB0cnVlKTtcclxuICAgIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuICAgIHRoaXMuX3BvaW50cyA9IHRoaXMuX2Jib3hUZXh0LmdldFRleHRQb2ludHMoKTtcclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3U3RhdGlvbmFyeUxvZ28gPSBmdW5jdGlvbiAocCkge1xyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICBwLnN0cm9rZSgyNTUpO1xyXG4gICAgcC5maWxsKFwiIzBBMDAwQVwiKTtcclxuICAgIHAuc3Ryb2tlV2VpZ2h0KDIpO1xyXG4gICAgdGhpcy5fYmJveFRleHQuZHJhdygpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fc2V0dXAgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cC5jYWxsKHRoaXMsIHApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIEJib3hBbGlnbmVkVGV4dCBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZHJhd2luZyBhbmQgXHJcbiAgICAvLyByb3RhdGluZyB0ZXh0XHJcbiAgICB0aGlzLl9iYm94VGV4dCA9IG5ldyBCYm94VGV4dCh0aGlzLl9mb250LCB0aGlzLl90ZXh0LCB0aGlzLl9mb250U2l6ZSwgMCwgMCxcclxuICAgICAgICBwKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgdGhlIGluaXRpYWwgc2V0dXAgYnkgdHJpZ2dlcmluZyBhIHJlc2l6ZVxyXG4gICAgdGhpcy5fb25SZXNpemUocCk7XHJcblxyXG4gICAgLy8gRHJhdyB0aGUgc3RhdGlvbmFyeSBsb2dvXHJcbiAgICB0aGlzLl9kcmF3U3RhdGlvbmFyeUxvZ28ocCk7XHJcblxyXG4gICAgLy8gU3RhcnQgdGhlIHNpbiBnZW5lcmF0b3IgYXQgaXRzIG1heCB2YWx1ZVxyXG4gICAgdGhpcy5fdGhyZXNob2xkR2VuZXJhdG9yID0gbmV3IFNpbkdlbmVyYXRvcihwLCAwLCAxLCAwLjAyLCBwLlBJLzIpOyBcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9kcmF3LmNhbGwodGhpcywgcCk7XHJcbiAgICBpZiAoIXRoaXMuX2lzTW91c2VPdmVyIHx8ICF0aGlzLl9pc092ZXJOYXZMb2dvKSByZXR1cm47XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgdGV4dCBpcyBhYm91dCB0byBiZWNvbWUgYWN0aXZlIGZvciB0aGUgZmlyc3QgdGltZSwgY2xlYXJcclxuICAgIC8vIHRoZSBzdGF0aW9uYXJ5IGxvZ28gdGhhdCB3YXMgcHJldmlvdXNseSBkcmF3bi4gXHJcbiAgICBpZiAodGhpcy5faXNGaXJzdEZyYW1lKSB7XHJcbiAgICAgICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICAgICAgdGhpcy5faXNGaXJzdEZyYW1lID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX2ZvbnRTaXplID4gMzApIHtcclxuICAgICAgICB0aGlzLl90aHJlc2hvbGRHZW5lcmF0b3Iuc2V0Qm91bmRzKDAuMiAqIHRoaXMuX2Jib3hUZXh0LmhlaWdodCwgXHJcbiAgICAgICAgICAgIDAuNDcgKiB0aGlzLl9iYm94VGV4dC5oZWlnaHQpOyAgICAgICAgXHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICB0aGlzLl90aHJlc2hvbGRHZW5lcmF0b3Iuc2V0Qm91bmRzKDAuMiAqIHRoaXMuX2Jib3hUZXh0LmhlaWdodCwgXHJcbiAgICAgICAgICAgIDAuNiAqIHRoaXMuX2Jib3hUZXh0LmhlaWdodCk7ICAgICAgICAgIFxyXG4gICAgfVxyXG4gICAgdmFyIGRpc3RhbmNlVGhyZXNob2xkID0gdGhpcy5fdGhyZXNob2xkR2VuZXJhdG9yLmdlbmVyYXRlKCk7XHJcbiAgICBcclxuICAgIHAuYmFja2dyb3VuZCgyNTUsIDEwMCk7XHJcbiAgICBwLnN0cm9rZVdlaWdodCgxKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fcG9pbnRzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIHBvaW50MSA9IHRoaXMuX3BvaW50c1tpXTtcclxuICAgICAgICBmb3IgKHZhciBqID0gaSArIDE7IGogPCB0aGlzLl9wb2ludHMubGVuZ3RoOyBqICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyIHBvaW50MiA9IHRoaXMuX3BvaW50c1tqXTtcclxuICAgICAgICAgICAgdmFyIGRpc3QgPSBwLmRpc3QocG9pbnQxLngsIHBvaW50MS55LCBwb2ludDIueCwgcG9pbnQyLnkpO1xyXG4gICAgICAgICAgICBpZiAoZGlzdCA8IGRpc3RhbmNlVGhyZXNob2xkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgcC5ub1N0cm9rZSgpO1xyXG4gICAgICAgICAgICAgICAgcC5maWxsKFwicmdiYSgxNjUsIDAsIDE3MywgMC4yNSlcIik7XHJcbiAgICAgICAgICAgICAgICBwLmVsbGlwc2UoKHBvaW50MS54ICsgcG9pbnQyLngpIC8gMiwgKHBvaW50MS55ICsgcG9pbnQyLnkpIC8gMixcclxuICAgICAgICAgICAgICAgICAgICBkaXN0LCBkaXN0KTsgIFxyXG5cclxuICAgICAgICAgICAgICAgIHAuc3Ryb2tlKFwicmdiYSgxNjUsIDAsIDE3MywgMC4yNSlcIik7XHJcbiAgICAgICAgICAgICAgICBwLm5vRmlsbCgpO1xyXG4gICAgICAgICAgICAgICAgcC5saW5lKHBvaW50MS54LCBwb2ludDEueSwgcG9pbnQyLngsIHBvaW50Mi55KTsgIFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgTm9pc2VHZW5lcmF0b3IxRDogTm9pc2VHZW5lcmF0b3IxRCxcclxuICAgIE5vaXNlR2VuZXJhdG9yMkQ6IE5vaXNlR2VuZXJhdG9yMkRcclxufTtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG4vLyAtLSAxRCBOb2lzZSBHZW5lcmF0b3IgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLyoqXHJcbiAqIEEgdXRpbGl0eSBjbGFzcyBmb3IgZ2VuZXJhdGluZyBub2lzZSB2YWx1ZXNcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwICAgICAgICAgICAgICAgUmVmZXJlbmNlIHRvIGEgcDUgc2tldGNoXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWluPTBdICAgICAgICAgTWluaW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWF4PTFdICAgICAgICAgTWF4aW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbaW5jcmVtZW50PTAuMV0gU2NhbGUgb2YgdGhlIG5vaXNlLCB1c2VkIHdoZW4gdXBkYXRpbmdcclxuICogQHBhcmFtIHtudW1iZXJ9IFtvZmZzZXQ9cmFuZG9tXSBBIHZhbHVlIHVzZWQgdG8gZW5zdXJlIG11bHRpcGxlIG5vaXNlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdG9ycyBhcmUgcmV0dXJuaW5nIFwiaW5kZXBlbmRlbnRcIiB2YWx1ZXNcclxuICovXHJcbmZ1bmN0aW9uIE5vaXNlR2VuZXJhdG9yMUQocCwgbWluLCBtYXgsIGluY3JlbWVudCwgb2Zmc2V0KSB7XHJcbiAgICB0aGlzLl9wID0gcDtcclxuICAgIHRoaXMuX21pbiA9IHV0aWxzLmRlZmF1bHQobWluLCAwKTtcclxuICAgIHRoaXMuX21heCA9IHV0aWxzLmRlZmF1bHQobWF4LCAxKTtcclxuICAgIHRoaXMuX2luY3JlbWVudCA9IHV0aWxzLmRlZmF1bHQoaW5jcmVtZW50LCAwLjEpO1xyXG4gICAgdGhpcy5fcG9zaXRpb24gPSB1dGlscy5kZWZhdWx0KG9mZnNldCwgcC5yYW5kb20oLTEwMDAwMDAsIDEwMDAwMDApKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgbWluIGFuZCBtYXggbm9pc2UgdmFsdWVzXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWluIE1pbmltdW0gbm9pc2UgdmFsdWVcclxuICogQHBhcmFtICB7bnVtYmVyfSBtYXggTWF4aW11bSBub2lzZSB2YWx1ZVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IxRC5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XHJcbiAgICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgdGhpcy5fbWluKTtcclxuICAgIHRoaXMuX21heCA9IHV0aWxzLmRlZmF1bHQobWF4LCB0aGlzLl9tYXgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgbm9pc2UgaW5jcmVtZW50IChlLmcuIHNjYWxlKVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGluY3JlbWVudCBOZXcgaW5jcmVtZW50IChzY2FsZSkgdmFsdWVcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLnNldEluY3JlbWVudCA9IGZ1bmN0aW9uIChpbmNyZW1lbnQpIHtcclxuICAgIHRoaXMuX2luY3JlbWVudCA9IHV0aWxzLmRlZmF1bHQoaW5jcmVtZW50LCB0aGlzLl9pbmNyZW1lbnQpO1xyXG59O1xyXG5cclxuLyoqIFxyXG4gKiBHZW5lcmF0ZSB0aGUgbmV4dCBub2lzZSB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtudW1iZXJ9IEEgbm9pc3kgdmFsdWUgYmV0d2VlbiBvYmplY3QncyBtaW4gYW5kIG1heFxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IxRC5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl91cGRhdGUoKTtcclxuICAgIHZhciBuID0gdGhpcy5fcC5ub2lzZSh0aGlzLl9wb3NpdGlvbik7XHJcbiAgICBuID0gdGhpcy5fcC5tYXAobiwgMCwgMSwgdGhpcy5fbWluLCB0aGlzLl9tYXgpO1xyXG4gICAgcmV0dXJuIG47XHJcbn07XHJcblxyXG4vKipcclxuICogSW50ZXJuYWwgdXBkYXRlIG1ldGhvZCBmb3IgZ2VuZXJhdGluZyBuZXh0IG5vaXNlIHZhbHVlXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjFELnByb3RvdHlwZS5fdXBkYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fcG9zaXRpb24gKz0gdGhpcy5faW5jcmVtZW50O1xyXG59O1xyXG5cclxuXHJcbi8vIC0tIDJEIE5vaXNlIEdlbmVyYXRvciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5mdW5jdGlvbiBOb2lzZUdlbmVyYXRvcjJEKHAsIHhNaW4sIHhNYXgsIHlNaW4sIHlNYXgsIHhJbmNyZW1lbnQsIHlJbmNyZW1lbnQsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHhPZmZzZXQsIHlPZmZzZXQpIHtcclxuICAgIHRoaXMuX3hOb2lzZSA9IG5ldyBOb2lzZUdlbmVyYXRvcjFEKHAsIHhNaW4sIHhNYXgsIHhJbmNyZW1lbnQsIHhPZmZzZXQpO1xyXG4gICAgdGhpcy5feU5vaXNlID0gbmV3IE5vaXNlR2VuZXJhdG9yMUQocCwgeU1pbiwgeU1heCwgeUluY3JlbWVudCwgeU9mZnNldCk7XHJcbiAgICB0aGlzLl9wID0gcDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgbWluIGFuZCBtYXggbm9pc2UgdmFsdWVzXHJcbiAqIEBwYXJhbSAge29iamVjdH0gb3B0aW9ucyBPYmplY3Qgd2l0aCBib3VuZHMgdG8gYmUgdXBkYXRlZCBlLmcuIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgeyB4TWluOiAwLCB4TWF4OiAxLCB5TWluOiAtMSwgeU1heDogMSB9XHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjJELnByb3RvdHlwZS5zZXRCb3VuZHMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgaWYgKCFvcHRpb25zKSByZXR1cm47ICBcclxuICAgIHRoaXMuX3hOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy54TWluLCBvcHRpb25zLnhNYXgpO1xyXG4gICAgdGhpcy5feU5vaXNlLnNldEJvdW5kcyhvcHRpb25zLnlNaW4sIG9wdGlvbnMueU1heCk7XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBpbmNyZW1lbnQgKGUuZy4gc2NhbGUpIGZvciB0aGUgbm9pc2UgZ2VuZXJhdG9yXHJcbiAqIEBwYXJhbSAge29iamVjdH0gb3B0aW9ucyBPYmplY3Qgd2l0aCBib3VuZHMgdG8gYmUgdXBkYXRlZCBlLmcuIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgeyB4SW5jcmVtZW50OiAwLjA1LCB5SW5jcmVtZW50OiAwLjEgfVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IyRC5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgIGlmICghb3B0aW9ucykgcmV0dXJuO1xyXG4gICAgdGhpcy5feE5vaXNlLnNldEJvdW5kcyhvcHRpb25zLnhJbmNyZW1lbnQpO1xyXG4gICAgdGhpcy5feU5vaXNlLnNldEJvdW5kcyhvcHRpb25zLnlJbmNyZW1lbnQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIHRoZSBuZXh0IHBhaXIgb2Ygbm9pc2UgdmFsdWVzXHJcbiAqIEByZXR1cm4ge29iamVjdH0gT2JqZWN0IHdpdGggeCBhbmQgeSBwcm9wZXJ0aWVzIHRoYXQgY29udGFpbiB0aGUgbmV4dCBub2lzZVxyXG4gKiAgICAgICAgICAgICAgICAgIHZhbHVlcyBhbG9uZyBlYWNoIGRpbWVuc2lvblxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IyRC5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHRoaXMuX3hOb2lzZS5nZW5lcmF0ZSgpLFxyXG4gICAgICAgIHk6IHRoaXMuX3lOb2lzZS5nZW5lcmF0ZSgpXHJcbiAgICB9O1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gU2luR2VuZXJhdG9yO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uLy4uL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbi8qKlxyXG4gKiBBIHV0aWxpdHkgY2xhc3MgZm9yIGdlbmVyYXRpbmcgdmFsdWVzIGFsb25nIGEgc2lud2F2ZVxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtvYmplY3R9IHAgICAgICAgICAgICAgICBSZWZlcmVuY2UgdG8gYSBwNSBza2V0Y2hcclxuICogQHBhcmFtIHtudW1iZXJ9IFttaW49MF0gICAgICAgICBNaW5pbXVtIHZhbHVlIGZvciB0aGUgbm9pc2VcclxuICogQHBhcmFtIHtudW1iZXJ9IFttYXg9MV0gICAgICAgICBNYXhpbXVtIHZhbHVlIGZvciB0aGUgbm9pc2VcclxuICogQHBhcmFtIHtudW1iZXJ9IFtpbmNyZW1lbnQ9MC4xXSBJbmNyZW1lbnQgdXNlZCB3aGVuIHVwZGF0aW5nXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb2Zmc2V0PXJhbmRvbV0gV2hlcmUgdG8gc3RhcnQgYWxvbmcgdGhlIHNpbmV3YXZlXHJcbiAqL1xyXG5mdW5jdGlvbiBTaW5HZW5lcmF0b3IocCwgbWluLCBtYXgsIGFuZ2xlSW5jcmVtZW50LCBzdGFydGluZ0FuZ2xlKSB7XHJcbiAgICB0aGlzLl9wID0gcDtcclxuICAgIHRoaXMuX21pbiA9IHV0aWxzLmRlZmF1bHQobWluLCAwKTtcclxuICAgIHRoaXMuX21heCA9IHV0aWxzLmRlZmF1bHQobWF4LCAwKTtcclxuICAgIHRoaXMuX2luY3JlbWVudCA9IHV0aWxzLmRlZmF1bHQoYW5nbGVJbmNyZW1lbnQsIDAuMSk7XHJcbiAgICB0aGlzLl9hbmdsZSA9IHV0aWxzLmRlZmF1bHQoc3RhcnRpbmdBbmdsZSwgcC5yYW5kb20oLTEwMDAwMDAsIDEwMDAwMDApKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgbWluIGFuZCBtYXggdmFsdWVzXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWluIE1pbmltdW0gdmFsdWVcclxuICogQHBhcmFtICB7bnVtYmVyfSBtYXggTWF4aW11bSB2YWx1ZVxyXG4gKi9cclxuU2luR2VuZXJhdG9yLnByb3RvdHlwZS5zZXRCb3VuZHMgPSBmdW5jdGlvbiAobWluLCBtYXgpIHtcclxuICAgIHRoaXMuX21pbiA9IHV0aWxzLmRlZmF1bHQobWluLCB0aGlzLl9taW4pO1xyXG4gICAgdGhpcy5fbWF4ID0gdXRpbHMuZGVmYXVsdChtYXgsIHRoaXMuX21heCk7XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBhbmdsZSBpbmNyZW1lbnQgKGUuZy4gaG93IGZhc3Qgd2UgbW92ZSB0aHJvdWdoIHRoZSBzaW53YXZlKVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGluY3JlbWVudCBOZXcgaW5jcmVtZW50IHZhbHVlXHJcbiAqL1xyXG5TaW5HZW5lcmF0b3IucHJvdG90eXBlLnNldEluY3JlbWVudCA9IGZ1bmN0aW9uIChpbmNyZW1lbnQpIHtcclxuICAgIHRoaXMuX2luY3JlbWVudCA9IHV0aWxzLmRlZmF1bHQoaW5jcmVtZW50LCB0aGlzLl9pbmNyZW1lbnQpO1xyXG59O1xyXG5cclxuLyoqIFxyXG4gKiBHZW5lcmF0ZSB0aGUgbmV4dCB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtudW1iZXJ9IEEgdmFsdWUgYmV0d2VlbiBnZW5lcmF0b3JzJ3MgbWluIGFuZCBtYXhcclxuICovXHJcblNpbkdlbmVyYXRvci5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl91cGRhdGUoKTtcclxuICAgIHZhciBuID0gdGhpcy5fcC5zaW4odGhpcy5fYW5nbGUpO1xyXG4gICAgbiA9IHRoaXMuX3AubWFwKG4sIC0xLCAxLCB0aGlzLl9taW4sIHRoaXMuX21heCk7XHJcbiAgICByZXR1cm4gbjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBJbnRlcm5hbCB1cGRhdGUgbWV0aG9kIGZvciBnZW5lcmF0aW5nIG5leHQgdmFsdWVcclxuICogQHByaXZhdGVcclxuICovXHJcblNpbkdlbmVyYXRvci5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX2FuZ2xlICs9IHRoaXMuX2luY3JlbWVudDtcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IFNrZXRjaDtcclxuXHJcbnZhciBCYm94VGV4dCA9IHJlcXVpcmUoXCJwNS1iYm94LWFsaWduZWQtdGV4dFwiKTtcclxudmFyIEJhc2VMb2dvU2tldGNoID0gcmVxdWlyZShcIi4vYmFzZS1sb2dvLXNrZXRjaC5qc1wiKTtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUpO1xyXG5cclxuZnVuY3Rpb24gU2tldGNoKCRuYXYsICRuYXZMb2dvKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5jYWxsKHRoaXMsICRuYXYsICRuYXZMb2dvLCBcIi4uL2ZvbnRzL2JpZ19qb2huLXdlYmZvbnQudHRmXCIpO1xyXG59XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZSA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplLmNhbGwodGhpcywgcCk7XHJcbiAgICB0aGlzLl9zcGFjaW5nID0gdXRpbHMubWFwKHRoaXMuX2ZvbnRTaXplLCAyMCwgNDAsIDIsIDUsIHtjbGFtcDogdHJ1ZSwgXHJcbiAgICAgICAgcm91bmQ6IHRydWV9KTtcclxuICAgIC8vIFVwZGF0ZSB0aGUgYmJveFRleHQsIHBsYWNlIG92ZXIgdGhlIG5hdiB0ZXh0IGxvZ28gYW5kIHRoZW4gc2hpZnQgaXRzIFxyXG4gICAgLy8gYW5jaG9yIGJhY2sgdG8gKGNlbnRlciwgY2VudGVyKSB3aGlsZSBwcmVzZXJ2aW5nIHRoZSB0ZXh0IHBvc2l0aW9uXHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRUZXh0KHRoaXMuX3RleHQpXHJcbiAgICAgICAgLnNldFRleHRTaXplKHRoaXMuX2ZvbnRTaXplKVxyXG4gICAgICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0xFRlQsIEJib3hUZXh0LkJBU0VMSU5FLkFMUEhBQkVUSUMpXHJcbiAgICAgICAgLnNldFBvc2l0aW9uKHRoaXMuX3RleHRPZmZzZXQubGVmdCwgdGhpcy5fdGV4dE9mZnNldC50b3ApXHJcbiAgICAgICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfQ0VOVEVSLCBCYm94VGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSLCBcclxuICAgICAgICAgICAgdHJ1ZSk7XHJcbiAgICB0aGlzLl9kcmF3U3RhdGlvbmFyeUxvZ28ocCk7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVDaXJjbGVzKHApO1xyXG4gICAgdGhpcy5faXNGaXJzdEZyYW1lID0gdHJ1ZTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXdTdGF0aW9uYXJ5TG9nbyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgIHAuc3Ryb2tlKDI1NSk7XHJcbiAgICBwLmZpbGwoXCIjMEEwMDBBXCIpO1xyXG4gICAgcC5zdHJva2VXZWlnaHQoMik7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5kcmF3KCk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cCA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldHVwLmNhbGwodGhpcywgcCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgQmJveEFsaWduZWRUZXh0IGluc3RhbmNlIHRoYXQgd2lsbCBiZSB1c2VkIGZvciBkcmF3aW5nIGFuZCBcclxuICAgIC8vIHJvdGF0aW5nIHRleHRcclxuICAgIHRoaXMuX2Jib3hUZXh0ID0gbmV3IEJib3hUZXh0KHRoaXMuX2ZvbnQsIHRoaXMuX3RleHQsIHRoaXMuX2ZvbnRTaXplLCAwLCAwLCBcclxuICAgICAgICBwKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgdGhlIGluaXRpYWwgc2V0dXAgYnkgdHJpZ2dlcmluZyBhIHJlc2l6ZVxyXG4gICAgdGhpcy5fb25SZXNpemUocCk7XHJcblxyXG4gICAgLy8gRHJhdyB0aGUgc3RhdGlvbmFyeSBsb2dvXHJcbiAgICB0aGlzLl9kcmF3U3RhdGlvbmFyeUxvZ28ocCk7XHJcblxyXG4gICAgdGhpcy5fY2FsY3VsYXRlQ2lyY2xlcyhwKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2NhbGN1bGF0ZUNpcmNsZXMgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgLy8gVE9ETzogRG9uJ3QgbmVlZCBBTEwgdGhlIHBpeGVscy4gVGhpcyBjb3VsZCBoYXZlIGFuIG9mZnNjcmVlbiByZW5kZXJlclxyXG4gICAgLy8gdGhhdCBpcyBqdXN0IGJpZyBlbm91Z2ggdG8gZml0IHRoZSB0ZXh0LlxyXG4gICAgLy8gTG9vcCBvdmVyIHRoZSBwaXhlbHMgaW4gdGhlIHRleHQncyBib3VuZGluZyBib3ggdG8gc2FtcGxlIHRoZSB3b3JkXHJcbiAgICB2YXIgYmJveCA9IHRoaXMuX2Jib3hUZXh0LmdldEJib3goKTtcclxuICAgIHZhciBzdGFydFggPSBNYXRoLmZsb29yKE1hdGgubWF4KGJib3gueCAtIDUsIDApKTtcclxuICAgIHZhciBlbmRYID0gTWF0aC5jZWlsKE1hdGgubWluKGJib3gueCArIGJib3gudyArIDUsIHAud2lkdGgpKTtcclxuICAgIHZhciBzdGFydFkgPSBNYXRoLmZsb29yKE1hdGgubWF4KGJib3gueSAtIDUsIDApKTtcclxuICAgIHZhciBlbmRZID0gTWF0aC5jZWlsKE1hdGgubWluKGJib3gueSArIGJib3guaCArIDUsIHAuaGVpZ2h0KSk7XHJcbiAgICBwLmxvYWRQaXhlbHMoKTtcclxuICAgIHAucGl4ZWxEZW5zaXR5KDEpO1xyXG4gICAgdGhpcy5fY2lyY2xlcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgeSA9IHN0YXJ0WTsgeSA8IGVuZFk7IHkgKz0gdGhpcy5fc3BhY2luZykge1xyXG4gICAgICAgIGZvciAodmFyIHggPSBzdGFydFg7IHggPCBlbmRYOyB4ICs9IHRoaXMuX3NwYWNpbmcpIHsgIFxyXG4gICAgICAgICAgICB2YXIgaSA9IDQgKiAoKHkgKiBwLndpZHRoKSArIHgpO1xyXG4gICAgICAgICAgICB2YXIgciA9IHAucGl4ZWxzW2ldO1xyXG4gICAgICAgICAgICB2YXIgZyA9IHAucGl4ZWxzW2kgKyAxXTtcclxuICAgICAgICAgICAgdmFyIGIgPSBwLnBpeGVsc1tpICsgMl07XHJcbiAgICAgICAgICAgIHZhciBhID0gcC5waXhlbHNbaSArIDNdO1xyXG4gICAgICAgICAgICB2YXIgYyA9IHAuY29sb3IociwgZywgYiwgYSk7XHJcbiAgICAgICAgICAgIGlmIChwLnNhdHVyYXRpb24oYykgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jaXJjbGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHggKyBwLnJhbmRvbSgtMi8zICogdGhpcy5fc3BhY2luZywgMi8zICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogeSArIHAucmFuZG9tKC0yLzMgKiB0aGlzLl9zcGFjaW5nLCAyLzMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogcC5jb2xvcihcIiMwNkZGRkZcIilcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2lyY2xlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4ICsgcC5yYW5kb20oLTIvMyAqIHRoaXMuX3NwYWNpbmcsIDIvMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHkgKyBwLnJhbmRvbSgtMi8zICogdGhpcy5fc3BhY2luZywgMi8zICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IHAuY29sb3IoXCIjRkUwMEZFXCIpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NpcmNsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeCArIHAucmFuZG9tKC0yLzMgKiB0aGlzLl9zcGFjaW5nLCAyLzMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgICAgICAgICAgICB5OiB5ICsgcC5yYW5kb20oLTIvMyAqIHRoaXMuX3NwYWNpbmcsIDIvMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBwLmNvbG9yKFwiI0ZGRkYwNFwiKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fZHJhdy5jYWxsKHRoaXMsIHApO1xyXG4gICAgaWYgKCF0aGlzLl9pc01vdXNlT3ZlciB8fCAhdGhpcy5faXNPdmVyTmF2TG9nbykgcmV0dXJuO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHRleHQgaXMgYWJvdXQgdG8gYmVjb21lIGFjdGl2ZSBmb3IgdGhlIGZpcnN0IHRpbWUsIGNsZWFyXHJcbiAgICAvLyB0aGUgc3RhdGlvbmFyeSBsb2dvIHRoYXQgd2FzIHByZXZpb3VzbHkgZHJhd24uIFxyXG4gICAgaWYgKHRoaXMuX2lzRmlyc3RGcmFtZSkge1xyXG4gICAgICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENsZWFyXHJcbiAgICBwLmJsZW5kTW9kZShwLkJMRU5EKTtcclxuICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG5cclxuICAgIC8vIERyYXcgXCJoYWxmdG9uZVwiIGxvZ29cclxuICAgIHAubm9TdHJva2UoKTsgICBcclxuICAgIHAuYmxlbmRNb2RlKHAuTVVMVElQTFkpO1xyXG5cclxuICAgIHZhciBtYXhEaXN0ID0gdGhpcy5fYmJveFRleHQuaGFsZldpZHRoO1xyXG4gICAgdmFyIG1heFJhZGl1cyA9IDIgKiB0aGlzLl9zcGFjaW5nO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fY2lyY2xlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBjaXJjbGUgPSB0aGlzLl9jaXJjbGVzW2ldO1xyXG4gICAgICAgIHZhciBjID0gY2lyY2xlLmNvbG9yO1xyXG4gICAgICAgIHZhciBkaXN0ID0gcC5kaXN0KGNpcmNsZS54LCBjaXJjbGUueSwgcC5tb3VzZVgsIHAubW91c2VZKTtcclxuICAgICAgICB2YXIgcmFkaXVzID0gdXRpbHMubWFwKGRpc3QsIDAsIG1heERpc3QsIDEsIG1heFJhZGl1cywge2NsYW1wOiB0cnVlfSk7XHJcbiAgICAgICAgcC5maWxsKGMpO1xyXG4gICAgICAgIHAuZWxsaXBzZShjaXJjbGUueCwgY2lyY2xlLnksIHJhZGl1cywgcmFkaXVzKTtcclxuICAgIH1cclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IFNrZXRjaDtcclxuXHJcbnZhciBOb2lzZSA9IHJlcXVpcmUoXCIuL2dlbmVyYXRvcnMvbm9pc2UtZ2VuZXJhdG9ycy5qc1wiKTtcclxudmFyIEJib3hUZXh0ID0gcmVxdWlyZShcInA1LWJib3gtYWxpZ25lZC10ZXh0XCIpO1xyXG52YXIgQmFzZUxvZ29Ta2V0Y2ggPSByZXF1aXJlKFwiLi9iYXNlLWxvZ28tc2tldGNoLmpzXCIpO1xyXG5cclxuU2tldGNoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlKTtcclxuXHJcbmZ1bmN0aW9uIFNrZXRjaCgkbmF2LCAkbmF2TG9nbykge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2guY2FsbCh0aGlzLCAkbmF2LCAkbmF2TG9nbywgXCIuLi9mb250cy9iaWdfam9obi13ZWJmb250LnR0ZlwiKTtcclxufVxyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZS5jYWxsKHRoaXMsIHApO1xyXG4gICAgLy8gVXBkYXRlIHRoZSBiYm94VGV4dCwgcGxhY2Ugb3ZlciB0aGUgbmF2IHRleHQgbG9nbyBhbmQgdGhlbiBzaGlmdCBpdHMgXHJcbiAgICAvLyBhbmNob3IgYmFjayB0byAoY2VudGVyLCBjZW50ZXIpIHdoaWxlIHByZXNlcnZpbmcgdGhlIHRleHQgcG9zaXRpb25cclxuICAgIHRoaXMuX2Jib3hUZXh0LnNldFRleHQodGhpcy5fdGV4dClcclxuICAgICAgICAuc2V0VGV4dFNpemUodGhpcy5fZm9udFNpemUpXHJcbiAgICAgICAgLnNldFJvdGF0aW9uKDApXHJcbiAgICAgICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfTEVGVCwgQmJveFRleHQuQkFTRUxJTkUuQUxQSEFCRVRJQylcclxuICAgICAgICAuc2V0UG9zaXRpb24odGhpcy5fdGV4dE9mZnNldC5sZWZ0LCB0aGlzLl90ZXh0T2Zmc2V0LnRvcClcclxuICAgICAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9DRU5URVIsIEJib3hUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVIsIFxyXG4gICAgICAgICAgICB0cnVlKTtcclxuICAgIHRoaXMuX3RleHRQb3MgPSB0aGlzLl9iYm94VGV4dC5nZXRQb3NpdGlvbigpO1xyXG4gICAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG4gICAgdGhpcy5faXNGaXJzdEZyYW1lID0gdHJ1ZTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXdTdGF0aW9uYXJ5TG9nbyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgIHAuc3Ryb2tlKDI1NSk7XHJcbiAgICBwLmZpbGwoXCIjMEEwMDBBXCIpO1xyXG4gICAgcC5zdHJva2VXZWlnaHQoMik7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5kcmF3KCk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cCA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldHVwLmNhbGwodGhpcywgcCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgQmJveEFsaWduZWRUZXh0IGluc3RhbmNlIHRoYXQgd2lsbCBiZSB1c2VkIGZvciBkcmF3aW5nIGFuZCBcclxuICAgIC8vIHJvdGF0aW5nIHRleHRcclxuICAgIHRoaXMuX2Jib3hUZXh0ID0gbmV3IEJib3hUZXh0KHRoaXMuX2ZvbnQsIHRoaXMuX3RleHQsIHRoaXMuX2ZvbnRTaXplLCAwLCAwLCBcclxuICAgICAgICBwKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgdGhlIGluaXRpYWwgc2V0dXAgYnkgdHJpZ2dlcmluZyBhIHJlc2l6ZVxyXG4gICAgdGhpcy5fb25SZXNpemUocCk7XHJcblxyXG4gICAgLy8gU2V0IHVwIG5vaXNlIGdlbmVyYXRvcnNcclxuICAgIHRoaXMuX3JvdGF0aW9uTm9pc2UgPSBuZXcgTm9pc2UuTm9pc2VHZW5lcmF0b3IxRChwLCAtcC5QSS80LCBwLlBJLzQsIDAuMDIpOyBcclxuICAgIHRoaXMuX3h5Tm9pc2UgPSBuZXcgTm9pc2UuTm9pc2VHZW5lcmF0b3IyRChwLCAtMTAwLCAxMDAsIC01MCwgNTAsIDAuMDEsIFxyXG4gICAgICAgIDAuMDEpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhdyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2RyYXcuY2FsbCh0aGlzLCBwKTtcclxuICAgIGlmICghdGhpcy5faXNNb3VzZU92ZXIgfHwgIXRoaXMuX2lzT3Zlck5hdkxvZ28pIHJldHVybjtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSB0ZXh0IGlzIGFib3V0IHRvIGJlY29tZSBhY3RpdmUgZm9yIHRoZSBmaXJzdCB0aW1lLCBjbGVhclxyXG4gICAgLy8gdGhlIHN0YXRpb25hcnkgbG9nbyB0aGF0IHdhcyBwcmV2aW91c2x5IGRyYXduLiBcclxuICAgIGlmICh0aGlzLl9pc0ZpcnN0RnJhbWUpIHtcclxuICAgICAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgICAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDYWxjdWxhdGUgcG9zaXRpb24gYW5kIHJvdGF0aW9uIHRvIGNyZWF0ZSBhIGppdHRlcnkgbG9nb1xyXG4gICAgdmFyIHJvdGF0aW9uID0gdGhpcy5fcm90YXRpb25Ob2lzZS5nZW5lcmF0ZSgpO1xyXG4gICAgdmFyIHh5T2Zmc2V0ID0gdGhpcy5feHlOb2lzZS5nZW5lcmF0ZSgpO1xyXG4gICAgdGhpcy5fYmJveFRleHQuc2V0Um90YXRpb24ocm90YXRpb24pXHJcbiAgICAgICAgLnNldFBvc2l0aW9uKHRoaXMuX3RleHRQb3MueCArIHh5T2Zmc2V0LngsIHRoaXMuX3RleHRQb3MueSArIHh5T2Zmc2V0LnkpXHJcbiAgICAgICAgLmRyYXcoKTtcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IE1haW5OYXY7XHJcblxyXG5mdW5jdGlvbiBNYWluTmF2KGxvYWRlcikge1xyXG4gICAgdGhpcy5fbG9hZGVyID0gbG9hZGVyO1xyXG4gICAgdGhpcy5fJGxvZ28gPSAkKFwibmF2Lm5hdmJhciAubmF2YmFyLWJyYW5kXCIpO1xyXG4gICAgdGhpcy5fJG5hdiA9ICQoXCIjbWFpbi1uYXZcIik7XHJcbiAgICB0aGlzLl8kbmF2TGlua3MgPSB0aGlzLl8kbmF2LmZpbmQoXCJhXCIpO1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdiA9IHRoaXMuXyRuYXZMaW5rcy5maW5kKFwiLmFjdGl2ZVwiKTsgXHJcbiAgICB0aGlzLl8kbmF2TGlua3Mub24oXCJjbGlja1wiLCB0aGlzLl9vbk5hdkNsaWNrLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5fJGxvZ28ub24oXCJjbGlja1wiLCB0aGlzLl9vbkxvZ29DbGljay5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuc2V0QWN0aXZlRnJvbVVybCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX2RlYWN0aXZhdGUoKTtcclxuICAgIHZhciB1cmwgPSBsb2NhdGlvbi5wYXRobmFtZTtcclxuICAgIGlmICh1cmwgPT09IFwiL2luZGV4Lmh0bWxcIiB8fCB1cmwgPT09IFwiL1wiKSB7XHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVMaW5rKHRoaXMuXyRuYXZMaW5rcy5maWx0ZXIoXCIjYWJvdXQtbGlua1wiKSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh1cmwgPT09IFwiL3dvcmsuaHRtbFwiKSB7ICAgICAgICBcclxuICAgICAgICB0aGlzLl9hY3RpdmF0ZUxpbmsodGhpcy5fJG5hdkxpbmtzLmZpbHRlcihcIiN3b3JrLWxpbmtcIikpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX2RlYWN0aXZhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy5fJGFjdGl2ZU5hdi5sZW5ndGgpIHtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2LnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgIHRoaXMuXyRhY3RpdmVOYXYgPSAkKCk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5NYWluTmF2LnByb3RvdHlwZS5fYWN0aXZhdGVMaW5rID0gZnVuY3Rpb24gKCRsaW5rKSB7XHJcbiAgICAkbGluay5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXYgPSAkbGluaztcclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9vbkxvZ29DbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgIHZhciB1cmwgPSAkdGFyZ2V0LmF0dHIoXCJocmVmXCIpO1xyXG4gICAgdGhpcy5fbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIHRydWUpO1xyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX29uTmF2Q2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdGhpcy5fJG5hdi5jb2xsYXBzZShcImhpZGVcIik7IC8vIENsb3NlIHRoZSBuYXYgLSBvbmx5IG1hdHRlcnMgb24gbW9iaWxlXHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgIGlmICgkdGFyZ2V0LmlzKHRoaXMuXyRhY3RpdmVOYXYpKSByZXR1cm47XHJcbiAgICB0aGlzLl9kZWFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLl9hY3RpdmF0ZUxpbmsoJHRhcmdldCk7XHJcbiAgICB2YXIgdXJsID0gJHRhcmdldC5hdHRyKFwiaHJlZlwiKTtcclxuICAgIHRoaXMuX2xvYWRlci5sb2FkUGFnZSh1cmwsIHt9LCB0cnVlKTsgICAgXHJcbn07IiwidmFyIExvYWRlciA9IHJlcXVpcmUoXCIuL3BhZ2UtbG9hZGVyLmpzXCIpO1xyXG52YXIgTWFpbk5hdiA9IHJlcXVpcmUoXCIuL21haW4tbmF2LmpzXCIpO1xyXG52YXIgSG92ZXJTbGlkZXNob3dzID0gcmVxdWlyZShcIi4vaG92ZXItc2xpZGVzaG93LmpzXCIpO1xyXG52YXIgUG9ydGZvbGlvRmlsdGVyID0gcmVxdWlyZShcIi4vcG9ydGZvbGlvLWZpbHRlci5qc1wiKTtcclxudmFyIEltYWdlR2FsbGVyaWVzID0gcmVxdWlyZShcIi4vaW1hZ2UtZ2FsbGVyeS5qc1wiKTtcclxuXHJcbi8vIFBpY2tpbmcgYSByYW5kb20gc2tldGNoIHRoYXQgdGhlIHVzZXIgaGFzbid0IHNlZW4gYmVmb3JlXHJcbnZhciBTa2V0Y2ggPSByZXF1aXJlKFwiLi9waWNrLXJhbmRvbS1za2V0Y2guanNcIikoKTtcclxuXHJcbi8vIEFKQVggcGFnZSBsb2FkZXIsIHdpdGggY2FsbGJhY2sgZm9yIHJlbG9hZGluZyB3aWRnZXRzXHJcbnZhciBsb2FkZXIgPSBuZXcgTG9hZGVyKG9uUGFnZUxvYWQpO1xyXG5cclxuLy8gTWFpbiBuYXYgd2lkZ2V0XHJcbnZhciBtYWluTmF2ID0gbmV3IE1haW5OYXYobG9hZGVyKTtcclxuXHJcbi8vIEludGVyYWN0aXZlIGxvZ28gaW4gbmF2YmFyXHJcbnZhciBuYXYgPSAkKFwibmF2Lm5hdmJhclwiKTtcclxudmFyIG5hdkxvZ28gPSBuYXYuZmluZChcIi5uYXZiYXItYnJhbmRcIik7XHJcbnZhciBza2V0Y2ggPSBuZXcgU2tldGNoKG5hdiwgbmF2TG9nbyk7XHJcblxyXG4vLyBXaWRnZXQgZ2xvYmFsc1xyXG52YXIgaG92ZXJTbGlkZXNob3dzLCBwb3J0Zm9saW9GaWx0ZXIsIGltYWdlR2FsbGVyaWVzO1xyXG5cclxuLy8gTG9hZCBhbGwgd2lkZ2V0c1xyXG5vblBhZ2VMb2FkKCk7XHJcblxyXG4vLyBIYW5kbGUgYmFjay9mb3J3YXJkIGJ1dHRvbnNcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBvblBvcFN0YXRlKTtcclxuXHJcbmZ1bmN0aW9uIG9uUG9wU3RhdGUoZSkge1xyXG4gICAgLy8gTG9hZGVyIHN0b3JlcyBjdXN0b20gZGF0YSBpbiB0aGUgc3RhdGUgLSBpbmNsdWRpbmcgdGhlIHVybCBhbmQgdGhlIHF1ZXJ5XHJcbiAgICB2YXIgdXJsID0gKGUuc3RhdGUgJiYgZS5zdGF0ZS51cmwpIHx8IFwiL2luZGV4Lmh0bWxcIjtcclxuICAgIHZhciBxdWVyeU9iamVjdCA9IChlLnN0YXRlICYmIGUuc3RhdGUucXVlcnkpIHx8IHt9O1xyXG5cclxuICAgIGlmICgodXJsID09PSBsb2FkZXIuZ2V0TG9hZGVkUGF0aCgpKSAmJiAodXJsID09PSBcIi93b3JrLmh0bWxcIikpIHtcclxuICAgICAgICAvLyBUaGUgY3VycmVudCAmIHByZXZpb3VzIGxvYWRlZCBzdGF0ZXMgd2VyZSB3b3JrLmh0bWwsIHNvIGp1c3QgcmVmaWx0ZXJcclxuICAgICAgICB2YXIgY2F0ZWdvcnkgPSBxdWVyeU9iamVjdC5jYXRlZ29yeSB8fCBcImFsbFwiO1xyXG4gICAgICAgIHBvcnRmb2xpb0ZpbHRlci5zZWxlY3RDYXRlZ29yeShjYXRlZ29yeSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIExvYWQgdGhlIG5ldyBwYWdlXHJcbiAgICAgICAgbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIGZhbHNlKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gb25QYWdlTG9hZCgpIHtcclxuICAgIC8vIFJlbG9hZCBhbGwgcGx1Z2lucy93aWRnZXRzXHJcbiAgICBob3ZlclNsaWRlc2hvd3MgPSBuZXcgSG92ZXJTbGlkZXNob3dzKCk7XHJcbiAgICBwb3J0Zm9saW9GaWx0ZXIgPSBuZXcgUG9ydGZvbGlvRmlsdGVyKGxvYWRlcik7XHJcbiAgICBpbWFnZUdhbGxlcmllcyA9IG5ldyBJbWFnZUdhbGxlcmllcygpO1xyXG4gICAgb2JqZWN0Rml0SW1hZ2VzKCk7XHJcbiAgICBzbWFydHF1b3RlcygpO1xyXG5cclxuICAgIC8vIFNsaWdodGx5IHJlZHVuZGFudCwgYnV0IHVwZGF0ZSB0aGUgbWFpbiBuYXYgdXNpbmcgdGhlIGN1cnJlbnQgVVJMLiBUaGlzXHJcbiAgICAvLyBpcyBpbXBvcnRhbnQgaWYgYSBwYWdlIGlzIGxvYWRlZCBieSB0eXBpbmcgYSBmdWxsIFVSTCAoZS5nLiBnb2luZ1xyXG4gICAgLy8gZGlyZWN0bHkgdG8gL3dvcmsuaHRtbCkgb3Igd2hlbiBtb3ZpbmcgZnJvbSB3b3JrLmh0bWwgdG8gYSBwcm9qZWN0LiBcclxuICAgIG1haW5OYXYuc2V0QWN0aXZlRnJvbVVybCgpO1xyXG59XHJcblxyXG4vLyBXZSd2ZSBoaXQgdGhlIGxhbmRpbmcgcGFnZSwgbG9hZCB0aGUgYWJvdXQgcGFnZVxyXG4vLyBpZiAobG9jYXRpb24ucGF0aG5hbWUubWF0Y2goL14oXFwvfFxcL2luZGV4Lmh0bWx8aW5kZXguaHRtbCkkLykpIHtcclxuLy8gICAgIGxvYWRlci5sb2FkUGFnZShcIi9hYm91dC5odG1sXCIsIHt9LCBmYWxzZSk7XHJcbi8vIH0iLCJtb2R1bGUuZXhwb3J0cyA9IExvYWRlcjtcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBMb2FkZXIob25SZWxvYWQsIGZhZGVEdXJhdGlvbikge1xyXG4gICAgdGhpcy5fJGNvbnRlbnQgPSAkKFwiI2NvbnRlbnRcIik7XHJcbiAgICB0aGlzLl9vblJlbG9hZCA9IG9uUmVsb2FkO1xyXG4gICAgdGhpcy5fZmFkZUR1cmF0aW9uID0gKGZhZGVEdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSA/IGZhZGVEdXJhdGlvbiA6IDI1MDtcclxuICAgIHRoaXMuX3BhdGggPSBsb2NhdGlvbi5wYXRobmFtZTtcclxufVxyXG5cclxuTG9hZGVyLnByb3RvdHlwZS5nZXRMb2FkZWRQYXRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3BhdGg7XHJcbn07XHJcblxyXG5Mb2FkZXIucHJvdG90eXBlLmxvYWRQYWdlID0gZnVuY3Rpb24gKHVybCwgcXVlcnlPYmplY3QsIHNob3VsZFB1c2hIaXN0b3J5KSB7XHJcbiAgICAvLyBGYWRlIHRoZW4gZW1wdHkgdGhlIGN1cnJlbnQgY29udGVudHNcclxuICAgIHRoaXMuXyRjb250ZW50LnZlbG9jaXR5KHsgb3BhY2l0eTogMCB9LCB0aGlzLl9mYWRlRHVyYXRpb24sIFwic3dpbmdcIixcclxuICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fJGNvbnRlbnQuZW1wdHkoKTtcclxuICAgICAgICB0aGlzLl8kY29udGVudC5sb2FkKHVybCArIFwiICNjb250ZW50XCIsIG9uQ29udGVudEZldGNoZWQuYmluZCh0aGlzKSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIEZhZGUgdGhlIG5ldyBjb250ZW50IGluIGFmdGVyIGl0IGhhcyBiZWVuIGZldGNoZWRcclxuICAgIGZ1bmN0aW9uIG9uQ29udGVudEZldGNoZWQocmVzcG9uc2VUZXh0LCB0ZXh0U3RhdHVzLCBqcVhocikge1xyXG4gICAgICAgIGlmICh0ZXh0U3RhdHVzID09PSBcImVycm9yXCIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGxvYWRpbmcgdGhlIHBhZ2UuXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcXVlcnlTdHJpbmcgPSB1dGlsaXRpZXMuY3JlYXRlUXVlcnlTdHJpbmcocXVlcnlPYmplY3QpO1xyXG4gICAgICAgIGlmIChzaG91bGRQdXNoSGlzdG9yeSkge1xyXG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgICAgICAgIHF1ZXJ5OiBxdWVyeU9iamVjdFxyXG4gICAgICAgICAgICB9LCBudWxsLCB1cmwgKyBxdWVyeVN0cmluZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVcGRhdGUgR29vZ2xlIGFuYWx5dGljc1xyXG4gICAgICAgIGdhKFwic2V0XCIsIFwicGFnZVwiLCB1cmwgKyBxdWVyeVN0cmluZyk7XHJcbiAgICAgICAgZ2EoXCJzZW5kXCIsIFwicGFnZXZpZXdcIik7XHJcblxyXG4gICAgICAgIHRoaXMuX3BhdGggPSBsb2NhdGlvbi5wYXRobmFtZTtcclxuICAgICAgICB0aGlzLl8kY29udGVudC52ZWxvY2l0eSh7IG9wYWNpdHk6IDEgfSwgdGhpcy5fZmFkZUR1cmF0aW9uLCBcclxuICAgICAgICAgICAgXCJzd2luZ1wiKTtcclxuICAgICAgICB0aGlzLl9vblJlbG9hZCgpO1xyXG4gICAgfVxyXG59OyIsInZhciBjb29raWVzID0gcmVxdWlyZShcImpzLWNvb2tpZVwiKTtcclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxudmFyIHNrZXRjaENvbnN0cnVjdG9ycyA9IHtcclxuICAgIFwiaGFsZnRvbmUtZmxhc2hsaWdodFwiOiBcclxuICAgICAgICByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9oYWxmdG9uZS1mbGFzaGxpZ2h0LXdvcmQuanNcIiksXHJcbiAgICBcIm5vaXN5LXdvcmRcIjpcclxuICAgICAgICByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9ub2lzeS13b3JkLXNrZXRjaC5qc1wiKSxcclxuICAgIFwiY29ubmVjdC1wb2ludHNcIjpcclxuICAgICAgICByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9jb25uZWN0LXBvaW50cy1za2V0Y2guanNcIilcclxufTtcclxudmFyIG51bVNrZXRjaGVzID0gT2JqZWN0LmtleXMoc2tldGNoQ29uc3RydWN0b3JzKS5sZW5ndGg7XHJcbnZhciBjb29raWVLZXkgPSBcInNlZW4tc2tldGNoLW5hbWVzXCI7XHJcblxyXG4vKipcclxuICogUGljayBhIHJhbmRvbSBza2V0Y2ggdGhhdCB1c2VyIGhhc24ndCBzZWVuIHlldC4gSWYgdGhlIHVzZXIgaGFzIHNlZW4gYWxsIHRoZVxyXG4gKiBza2V0Y2hlcywganVzdCBwaWNrIGEgcmFuZG9tIG9uZS4gVGhpcyB1c2VzIGNvb2tpZXMgdG8gdHJhY2sgd2hhdCB0aGUgdXNlciBcclxuICogaGFzIHNlZW4gYWxyZWFkeS5cclxuICogQHJldHVybiB7RnVuY3Rpb259IENvbnN0cnVjdG9yIGZvciBhIFNrZXRjaCBjbGFzc1xyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwaWNrUmFuZG9tU2tldGNoKCkge1xyXG4gICAgdmFyIHNlZW5Ta2V0Y2hOYW1lcyA9IGNvb2tpZXMuZ2V0SlNPTihjb29raWVLZXkpIHx8IFtdO1xyXG5cclxuICAgIC8vIEZpbmQgdGhlIG5hbWVzIG9mIHRoZSB1bnNlZW4gc2tldGNoZXNcclxuICAgIHZhciB1bnNlZW5Ta2V0Y2hOYW1lcyA9IGZpbmRVbnNlZW5Ta2V0Y2hlcyhzZWVuU2tldGNoTmFtZXMpO1xyXG5cclxuICAgIC8vIEFsbCBza2V0Y2hlcyBoYXZlIGJlZW4gc2VlblxyXG4gICAgaWYgKHVuc2VlblNrZXRjaE5hbWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIC8vIElmIHdlJ3ZlIGdvdCBtb3JlIHRoZW4gb25lIHNrZXRjaCwgdGhlbiBtYWtlIHN1cmUgdG8gY2hvb3NlIGEgcmFuZG9tXHJcbiAgICAgICAgLy8gc2tldGNoIGV4Y2x1ZGluZyB0aGUgbW9zdCByZWNlbnRseSBzZWVuIHNrZXRjaFxyXG4gICAgICAgIGlmIChudW1Ta2V0Y2hlcyA+IDEpIHtcclxuICAgICAgICAgICAgc2VlblNrZXRjaE5hbWVzID0gW3NlZW5Ta2V0Y2hOYW1lcy5wb3AoKV07XHJcbiAgICAgICAgICAgIHVuc2VlblNrZXRjaE5hbWVzID0gZmluZFVuc2VlblNrZXRjaGVzKHNlZW5Ta2V0Y2hOYW1lcyk7XHJcbiAgICAgICAgfSBcclxuICAgICAgICAvLyBJZiB3ZSd2ZSBvbmx5IGdvdCBvbmUgc2tldGNoLCB0aGVuIHdlIGNhbid0IGRvIG11Y2guLi5cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VlblNrZXRjaE5hbWVzID0gW107XHJcbiAgICAgICAgICAgIHVuc2VlblNrZXRjaE5hbWVzID0gT2JqZWN0LmtleXMoc2tldGNoQ29uc3RydWN0b3JzKTsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHJhbmRTa2V0Y2hOYW1lID0gdXRpbHMucmFuZEFycmF5RWxlbWVudCh1bnNlZW5Ta2V0Y2hOYW1lcyk7XHJcbiAgICBzZWVuU2tldGNoTmFtZXMucHVzaChyYW5kU2tldGNoTmFtZSk7XHJcblxyXG4gICAgLy8gU3RvcmUgdGhlIGdlbmVyYXRlZCBza2V0Y2ggaW4gYSBjb29raWUuIFRoaXMgY3JlYXRlcyBhIG1vdmluZyA3IGRheVxyXG4gICAgLy8gd2luZG93IC0gYW55dGltZSB0aGUgc2l0ZSBpcyB2aXNpdGVkLCB0aGUgY29va2llIGlzIHJlZnJlc2hlZC5cclxuICAgIGNvb2tpZXMuc2V0KGNvb2tpZUtleSwgc2VlblNrZXRjaE5hbWVzLCB7IGV4cGlyZXM6IDcgfSk7XHJcblxyXG4gICAgcmV0dXJuIHNrZXRjaENvbnN0cnVjdG9yc1tyYW5kU2tldGNoTmFtZV07XHJcbn07XHJcblxyXG5mdW5jdGlvbiBmaW5kVW5zZWVuU2tldGNoZXMoc2VlblNrZXRjaE5hbWVzKSB7XHJcbiAgICB2YXIgdW5zZWVuU2tldGNoTmFtZXMgPSBbXTtcclxuICAgIGZvciAodmFyIHNrZXRjaE5hbWUgaW4gc2tldGNoQ29uc3RydWN0b3JzKSB7XHJcbiAgICAgICAgaWYgKHNlZW5Ta2V0Y2hOYW1lcy5pbmRleE9mKHNrZXRjaE5hbWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICB1bnNlZW5Ta2V0Y2hOYW1lcy5wdXNoKHNrZXRjaE5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB1bnNlZW5Ta2V0Y2hOYW1lcztcclxufSIsIm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvRmlsdGVyO1xyXG5cclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbnZhciBkZWZhdWx0QnJlYWtwb2ludHMgPSBbXHJcbiAgICB7IHdpZHRoOiAxMjAwLCBjb2xzOiAzLCBzcGFjaW5nOiAxNSB9LFxyXG4gICAgeyB3aWR0aDogOTkyLCBjb2xzOiAzLCBzcGFjaW5nOiAxNSB9LFxyXG4gICAgeyB3aWR0aDogNzAwLCBjb2xzOiAzLCBzcGFjaW5nOiAxNSB9LFxyXG4gICAgeyB3aWR0aDogNjAwLCBjb2xzOiAyLCBzcGFjaW5nOiAxMCB9LFxyXG4gICAgeyB3aWR0aDogNDgwLCBjb2xzOiAyLCBzcGFjaW5nOiAxMCB9LFxyXG4gICAgeyB3aWR0aDogMzIwLCBjb2xzOiAxLCBzcGFjaW5nOiAxMCB9XHJcbl07XHJcblxyXG5mdW5jdGlvbiBQb3J0Zm9saW9GaWx0ZXIobG9hZGVyLCBicmVha3BvaW50cywgYXNwZWN0UmF0aW8sIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgdGhpcy5fbG9hZGVyID0gbG9hZGVyO1xyXG4gICAgdGhpcy5fZ3JpZFNwYWNpbmcgPSAwO1xyXG4gICAgdGhpcy5fYXNwZWN0UmF0aW8gPSAoYXNwZWN0UmF0aW8gIT09IHVuZGVmaW5lZCkgPyBhc3BlY3RSYXRpbyA6ICgxNi85KTtcclxuICAgIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9ICh0cmFuc2l0aW9uRHVyYXRpb24gIT09IHVuZGVmaW5lZCkgPyBcclxuICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb24gOiA4MDA7XHJcbiAgICB0aGlzLl9icmVha3BvaW50cyA9IChicmVha3BvaW50cyAhPT0gdW5kZWZpbmVkKSA/IFxyXG4gICAgICAgIGJyZWFrcG9pbnRzLnNsaWNlKCkgOiBkZWZhdWx0QnJlYWtwb2ludHMuc2xpY2UoKTtcclxuICAgIHRoaXMuXyRncmlkID0gJChcIiNwb3J0Zm9saW8tZ3JpZFwiKTtcclxuICAgIHRoaXMuXyRuYXYgPSAkKFwiI3BvcnRmb2xpby1uYXZcIik7XHJcbiAgICB0aGlzLl8kcHJvamVjdHMgPSBbXTtcclxuICAgIHRoaXMuXyRjYXRlZ29yaWVzID0ge307XHJcbiAgICB0aGlzLl9yb3dzID0gMDtcclxuICAgIHRoaXMuX2NvbHMgPSAwO1xyXG4gICAgdGhpcy5faW1hZ2VIZWlnaHQgPSAwO1xyXG4gICAgdGhpcy5faW1hZ2VXaWR0aCA9IDA7XHJcblxyXG4gICAgLy8gU29ydCB0aGUgYnJlYWtwb2ludHMgaW4gZGVzY2VuZGluZyBvcmRlclxyXG4gICAgdGhpcy5fYnJlYWtwb2ludHMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEud2lkdGggPCBiLndpZHRoKSByZXR1cm4gLTE7XHJcbiAgICAgICAgZWxzZSBpZiAoYS53aWR0aCA+IGIud2lkdGgpIHJldHVybiAxO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuIDA7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9jYWNoZVByb2plY3RzKCk7XHJcbiAgICB0aGlzLl9jcmVhdGVHcmlkKCk7XHJcblxyXG4gICAgdGhpcy5fJGdyaWQuZmluZChcIi5wcm9qZWN0IGFcIikub24oXCJjbGlja1wiLCB0aGlzLl9vblByb2plY3RDbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB2YXIgcXMgPSB1dGlsaXRpZXMuZ2V0UXVlcnlQYXJhbWV0ZXJzKCk7XHJcbiAgICB2YXIgaW5pdGlhbENhdGVnb3J5ID0gcXMuY2F0ZWdvcnkgfHwgXCJhbGxcIjtcclxuICAgIHZhciBjYXRlZ29yeSA9IGluaXRpYWxDYXRlZ29yeS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0gPSB0aGlzLl8kbmF2LmZpbmQoXCJhW2RhdGEtY2F0ZWdvcnk9XCIgKyBjYXRlZ29yeSArIFwiXVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG4gICAgJChcIiNwb3J0Zm9saW8tbmF2IGFcIikub24oXCJjbGlja1wiLCB0aGlzLl9vbk5hdkNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgICQod2luZG93KS5vbihcInJlc2l6ZVwiLCB0aGlzLl9jcmVhdGVHcmlkLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLnNlbGVjdENhdGVnb3J5ID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XHJcbiAgICBjYXRlZ29yeSA9IChjYXRlZ29yeSAmJiBjYXRlZ29yeS50b0xvd2VyQ2FzZSgpKSB8fCBcImFsbFwiO1xyXG4gICAgdmFyICRzZWxlY3RlZE5hdiA9IHRoaXMuXyRuYXYuZmluZChcImFbZGF0YS1jYXRlZ29yeT1cIiArIGNhdGVnb3J5ICsgXCJdXCIpO1xyXG4gICAgaWYgKCRzZWxlY3RlZE5hdi5sZW5ndGggJiYgISRzZWxlY3RlZE5hdi5pcyh0aGlzLl8kYWN0aXZlTmF2SXRlbSkpIHtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9ICRzZWxlY3RlZE5hdjtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLl9maWx0ZXJQcm9qZWN0cyhjYXRlZ29yeSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9maWx0ZXJQcm9qZWN0cyA9IGZ1bmN0aW9uIChjYXRlZ29yeSkge1xyXG4gICAgdmFyICRzZWxlY3RlZEVsZW1lbnRzID0gdGhpcy5fZ2V0UHJvamVjdHNJbkNhdGVnb3J5KGNhdGVnb3J5KTtcclxuXHJcbiAgICAvLyBBbmltYXRlIHRoZSBncmlkIHRvIHRoZSBjb3JyZWN0IGhlaWdodCB0byBjb250YWluIHRoZSByb3dzXHJcbiAgICB0aGlzLl9hbmltYXRlR3JpZEhlaWdodCgkc2VsZWN0ZWRFbGVtZW50cy5sZW5ndGgpO1xyXG4gICAgXHJcbiAgICAvLyBMb29wIHRocm91Z2ggYWxsIHByb2plY3RzXHJcbiAgICB0aGlzLl8kcHJvamVjdHMuZm9yRWFjaChmdW5jdGlvbiAoJGVsZW1lbnQpIHtcclxuICAgICAgICAvLyBTdG9wIGFsbCBhbmltYXRpb25zXHJcbiAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoXCJzdG9wXCIpO1xyXG4gICAgICAgIC8vIElmIGFuIGVsZW1lbnQgaXMgbm90IHNlbGVjdGVkOiBkcm9wIHotaW5kZXggJiBhbmltYXRlIG9wYWNpdHkgLT4gaGlkZVxyXG4gICAgICAgIHZhciBzZWxlY3RlZEluZGV4ID0gJHNlbGVjdGVkRWxlbWVudHMuaW5kZXhPZigkZWxlbWVudCk7IFxyXG4gICAgICAgIGlmIChzZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAkZWxlbWVudC5jc3MoXCJ6SW5kZXhcIiwgLTEpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC52ZWxvY2l0eSh7XHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICAgICAgICAgIH0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXCJlYXNlSW5PdXRDdWJpY1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJZiBhbiBlbGVtZW50IGlzIHNlbGVjdGVkOiBzaG93ICYgYnVtcCB6LWluZGV4ICYgYW5pbWF0ZSB0byBwb3NpdGlvbiBcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC5jc3MoXCJ6SW5kZXhcIiwgMCk7XHJcbiAgICAgICAgICAgIHZhciBuZXdQb3MgPSB0aGlzLl9pbmRleFRvWFkoc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgICRlbGVtZW50LnZlbG9jaXR5KHsgXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxLFxyXG4gICAgICAgICAgICAgICAgdG9wOiBuZXdQb3MueSArIFwicHhcIixcclxuICAgICAgICAgICAgICAgIGxlZnQ6IG5ld1Bvcy54ICsgXCJweFwiXHJcbiAgICAgICAgICAgIH0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fYW5pbWF0ZUdyaWRIZWlnaHQgPSBmdW5jdGlvbiAobnVtRWxlbWVudHMpIHtcclxuICAgIHRoaXMuXyRncmlkLnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgIHZhciBjdXJSb3dzID0gTWF0aC5jZWlsKG51bUVsZW1lbnRzIC8gdGhpcy5fY29scyk7XHJcbiAgICB0aGlzLl8kZ3JpZC52ZWxvY2l0eSh7XHJcbiAgICAgICAgaGVpZ2h0OiB0aGlzLl9pbWFnZUhlaWdodCAqIGN1clJvd3MgKyBcclxuICAgICAgICAgICAgdGhpcy5fZ3JpZFNwYWNpbmcgKiAoY3VyUm93cyAtIDEpICsgXCJweFwiXHJcbiAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24pO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZ2V0UHJvamVjdHNJbkNhdGVnb3J5ID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XHJcbiAgICBpZiAoY2F0ZWdvcnkgPT09IFwiYWxsXCIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fJHByb2plY3RzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XSB8fCBbXSk7XHJcbiAgICB9ICAgICAgICBcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhY2hlUHJvamVjdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl8kcHJvamVjdHMgPSBbXTtcclxuICAgIHRoaXMuXyRjYXRlZ29yaWVzID0ge307XHJcbiAgICB0aGlzLl8kZ3JpZC5maW5kKFwiLnByb2plY3RcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuXyRwcm9qZWN0cy5wdXNoKCRlbGVtZW50KTtcclxuICAgICAgICB2YXIgY2F0ZWdvcnlOYW1lcyA9ICRlbGVtZW50LmRhdGEoXCJjYXRlZ29yaWVzXCIpLnNwbGl0KFwiLFwiKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhdGVnb3J5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyIGNhdGVnb3J5ID0gJC50cmltKGNhdGVnb3J5TmFtZXNbaV0pLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl8kY2F0ZWdvcmllc1tjYXRlZ29yeV0gPSBbJGVsZW1lbnRdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldLnB1c2goJGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbi8vIFBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhbGN1bGF0ZUdyaWQgPSBmdW5jdGlvbiAoKSB7XHJcbi8vICAgICB2YXIgZ3JpZFdpZHRoID0gdGhpcy5fJGdyaWQuaW5uZXJXaWR0aCgpO1xyXG4vLyAgICAgdGhpcy5fY29scyA9IE1hdGguZmxvb3IoKGdyaWRXaWR0aCArIHRoaXMuX2dyaWRTcGFjaW5nKSAvIFxyXG4vLyAgICAgICAgICh0aGlzLl9taW5JbWFnZVdpZHRoICsgdGhpcy5fZ3JpZFNwYWNpbmcpKTtcclxuLy8gICAgIHRoaXMuX3Jvd3MgPSBNYXRoLmNlaWwodGhpcy5fJHByb2plY3RzLmxlbmd0aCAvIHRoaXMuX2NvbHMpO1xyXG4vLyAgICAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAoKHRoaXMuX2NvbHMgLSAxKSAqIHRoaXMuX2dyaWRTcGFjaW5nKSkgLyBcclxuLy8gICAgICAgICB0aGlzLl9jb2xzO1xyXG4vLyAgICAgdGhpcy5faW1hZ2VIZWlnaHQgPSB0aGlzLl9pbWFnZVdpZHRoICogKDEgLyB0aGlzLl9hc3BlY3RSYXRpbyk7XHJcbi8vIH07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jYWxjdWxhdGVHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGdyaWRXaWR0aCA9IHRoaXMuXyRncmlkLmlubmVyV2lkdGgoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYnJlYWtwb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAoZ3JpZFdpZHRoIDw9IHRoaXMuX2JyZWFrcG9pbnRzW2ldLndpZHRoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbHMgPSB0aGlzLl9icmVha3BvaW50c1tpXS5jb2xzO1xyXG4gICAgICAgICAgICB0aGlzLl9ncmlkU3BhY2luZyA9IHRoaXMuX2JyZWFrcG9pbnRzW2ldLnNwYWNpbmc7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuX3Jvd3MgPSBNYXRoLmNlaWwodGhpcy5fJHByb2plY3RzLmxlbmd0aCAvIHRoaXMuX2NvbHMpO1xyXG4gICAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAoKHRoaXMuX2NvbHMgLSAxKSAqIHRoaXMuX2dyaWRTcGFjaW5nKSkgLyBcclxuICAgICAgICB0aGlzLl9jb2xzO1xyXG4gICAgdGhpcy5faW1hZ2VIZWlnaHQgPSB0aGlzLl9pbWFnZVdpZHRoICogKDEgLyB0aGlzLl9hc3BlY3RSYXRpbyk7XHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jcmVhdGVHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlR3JpZCgpO1xyXG5cclxuICAgIHRoaXMuXyRncmlkLmNzcyhcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XHJcbiAgICB0aGlzLl8kZ3JpZC5jc3Moe1xyXG4gICAgICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKiB0aGlzLl9yb3dzICsgXHJcbiAgICAgICAgICAgIHRoaXMuX2dyaWRTcGFjaW5nICogKHRoaXMuX3Jvd3MgLSAxKSArIFwicHhcIlxyXG4gICAgfSk7ICAgIFxyXG5cclxuICAgIHRoaXMuXyRwcm9qZWN0cy5mb3JFYWNoKGZ1bmN0aW9uICgkZWxlbWVudCwgaW5kZXgpIHtcclxuICAgICAgICB2YXIgcG9zID0gdGhpcy5faW5kZXhUb1hZKGluZGV4KTtcclxuICAgICAgICAkZWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICB0b3A6IHBvcy55ICsgXCJweFwiLFxyXG4gICAgICAgICAgICBsZWZ0OiBwb3MueCArIFwicHhcIixcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuX2ltYWdlV2lkdGggKyBcInB4XCIsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKyBcInB4XCJcclxuICAgICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7ICAgIFxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fb25OYXZDbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xyXG4gICAgaWYgKCR0YXJnZXQuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSByZXR1cm47XHJcbiAgICBpZiAodGhpcy5fJGFjdGl2ZU5hdkl0ZW0ubGVuZ3RoKSB0aGlzLl8kYWN0aXZlTmF2SXRlbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9ICR0YXJnZXQ7XHJcbiAgICB2YXIgY2F0ZWdvcnkgPSAkdGFyZ2V0LmRhdGEoXCJjYXRlZ29yeVwiKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgIGhpc3RvcnkucHVzaFN0YXRlKHtcclxuICAgICAgICB1cmw6IFwiL3dvcmsuaHRtbFwiLFxyXG4gICAgICAgIHF1ZXJ5OiB7IGNhdGVnb3J5OiBjYXRlZ29yeSB9XHJcbiAgICB9LCBudWxsLCBcIi93b3JrLmh0bWw/Y2F0ZWdvcnk9XCIgKyBjYXRlZ29yeSk7XHJcblxyXG4gICAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fb25Qcm9qZWN0Q2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICB2YXIgcHJvamVjdE5hbWUgPSAkdGFyZ2V0LmRhdGEoXCJuYW1lXCIpO1xyXG4gICAgdmFyIHVybCA9IFwiL3Byb2plY3RzL1wiICsgcHJvamVjdE5hbWUgKyBcIi5odG1sXCI7XHJcbiAgICB0aGlzLl9sb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgdHJ1ZSk7XHJcbn07XHJcblxyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5faW5kZXhUb1hZID0gZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICB2YXIgciA9IE1hdGguZmxvb3IoaW5kZXggLyB0aGlzLl9jb2xzKTtcclxuICAgIHZhciBjID0gaW5kZXggJSB0aGlzLl9jb2xzOyBcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogYyAqIHRoaXMuX2ltYWdlV2lkdGggKyBjICogdGhpcy5fZ3JpZFNwYWNpbmcsXHJcbiAgICAgICAgeTogciAqIHRoaXMuX2ltYWdlSGVpZ2h0ICsgciAqIHRoaXMuX2dyaWRTcGFjaW5nXHJcbiAgICB9O1xyXG59OyIsImV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uICh2YWwsIGRlZmF1bHRWYWwpIHtcclxuICAgIHJldHVybiAodmFsICE9PSB1bmRlZmluZWQpID8gdmFsIDogZGVmYXVsdFZhbDtcclxufTtcclxuXHJcbi8vIFVudGVzdGVkXHJcbi8vIGV4cG9ydHMuZGVmYXVsdFByb3BlcnRpZXMgPSBmdW5jdGlvbiBkZWZhdWx0UHJvcGVydGllcyAob2JqLCBwcm9wcykge1xyXG4vLyAgICAgZm9yICh2YXIgcHJvcCBpbiBwcm9wcykge1xyXG4vLyAgICAgICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwcm9wcywgcHJvcCkpIHtcclxuLy8gICAgICAgICAgICAgdmFyIHZhbHVlID0gZXhwb3J0cy5kZWZhdWx0VmFsdWUocHJvcHMudmFsdWUsIHByb3BzLmRlZmF1bHQpO1xyXG4vLyAgICAgICAgICAgICBvYmpbcHJvcF0gPSB2YWx1ZTtcclxuLy8gICAgICAgICB9XHJcbi8vICAgICB9XHJcbi8vICAgICByZXR1cm4gb2JqO1xyXG4vLyB9O1xyXG4vLyBcclxuZXhwb3J0cy50aW1lSXQgPSBmdW5jdGlvbiAoZnVuYykge1xyXG4gICAgdmFyIHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICBmdW5jKCk7XHJcbiAgICB2YXIgZW5kID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICByZXR1cm4gZW5kIC0gc3RhcnQ7XHJcbn07XHJcblxyXG5leHBvcnRzLmlzSW5SZWN0ID0gZnVuY3Rpb24gKHgsIHksIHJlY3QpIHtcclxuICAgIGlmICh4ID49IHJlY3QueCAmJiB4IDw9IChyZWN0LnggKyByZWN0LncpICYmXHJcbiAgICAgICAgeSA+PSByZWN0LnkgJiYgeSA8PSAocmVjdC55ICsgcmVjdC5oKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuZXhwb3J0cy5yYW5kSW50ID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcclxufTtcclxuXHJcbmV4cG9ydHMucmFuZEFycmF5RWxlbWVudCA9IGZ1bmN0aW9uIChhcnJheSkge1xyXG4gICAgdmFyIGkgPSBleHBvcnRzLnJhbmRJbnQoMCwgYXJyYXkubGVuZ3RoIC0gMSk7ICAgIFxyXG4gICAgcmV0dXJuIGFycmF5W2ldO1xyXG59O1xyXG5cclxuZXhwb3J0cy5tYXAgPSBmdW5jdGlvbiAobnVtLCBtaW4xLCBtYXgxLCBtaW4yLCBtYXgyLCBvcHRpb25zKSB7XHJcbiAgICB2YXIgbWFwcGVkID0gKG51bSAtIG1pbjEpIC8gKG1heDEgLSBtaW4xKSAqIChtYXgyIC0gbWluMikgKyBtaW4yO1xyXG4gICAgaWYgKCFvcHRpb25zKSByZXR1cm4gbWFwcGVkO1xyXG4gICAgaWYgKG9wdGlvbnMucm91bmQgJiYgb3B0aW9ucy5yb3VuZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIG1hcHBlZCA9IE1hdGgucm91bmQobWFwcGVkKTtcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLmZsb29yICYmIG9wdGlvbnMuZmxvb3IgPT09IHRydWUpIHtcclxuICAgICAgICBtYXBwZWQgPSBNYXRoLmZsb29yKG1hcHBlZCk7ICAgICAgICBcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLmNlaWwgJiYgb3B0aW9ucy5jZWlsID09PSB0cnVlKSB7XHJcbiAgICAgICAgbWFwcGVkID0gTWF0aC5jZWlsKG1hcHBlZCk7ICAgICAgICBcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLmNsYW1wICYmIG9wdGlvbnMuY2xhbXAgPT09IHRydWUpIHtcclxuICAgICAgICBtYXBwZWQgPSBNYXRoLm1pbihtYXBwZWQsIG1heDIpO1xyXG4gICAgICAgIG1hcHBlZCA9IE1hdGgubWF4KG1hcHBlZCwgbWluMik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWFwcGVkO1xyXG59O1xyXG5cclxuZXhwb3J0cy5nZXRRdWVyeVBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBDaGVjayBmb3IgcXVlcnkgc3RyaW5nXHJcbiAgICBxcyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XHJcbiAgICBpZiAocXMubGVuZ3RoIDw9IDEpIHJldHVybiB7fTtcclxuICAgIC8vIFF1ZXJ5IHN0cmluZyBleGlzdHMsIHBhcnNlIGl0IGludG8gYSBxdWVyeSBvYmplY3RcclxuICAgIHFzID0gcXMuc3Vic3RyaW5nKDEpOyAvLyBSZW1vdmUgdGhlIFwiP1wiIGRlbGltaXRlclxyXG4gICAgdmFyIGtleVZhbFBhaXJzID0gcXMuc3BsaXQoXCImXCIpO1xyXG4gICAgdmFyIHF1ZXJ5T2JqZWN0ID0ge307XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleVZhbFBhaXJzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIGtleVZhbCA9IGtleVZhbFBhaXJzW2ldLnNwbGl0KFwiPVwiKTtcclxuICAgICAgICBpZiAoa2V5VmFsLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICB2YXIga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleVZhbFswXSk7XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5VmFsWzFdKTtcclxuICAgICAgICAgICAgcXVlcnlPYmplY3Rba2V5XSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcXVlcnlPYmplY3Q7XHJcbn07XHJcblxyXG5leHBvcnRzLmNyZWF0ZVF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24gKHF1ZXJ5T2JqZWN0KSB7XHJcbiAgICBpZiAodHlwZW9mIHF1ZXJ5T2JqZWN0ICE9PSBcIm9iamVjdFwiKSByZXR1cm4gXCJcIjtcclxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocXVlcnlPYmplY3QpO1xyXG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcclxuICAgIHZhciBxdWVyeVN0cmluZyA9IFwiP1wiO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XHJcbiAgICAgICAgdmFyIHZhbCA9IHF1ZXJ5T2JqZWN0W2tleV07XHJcbiAgICAgICAgcXVlcnlTdHJpbmcgKz0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpO1xyXG4gICAgICAgIGlmIChpICE9PSBrZXlzLmxlbmd0aCAtIDEpIHF1ZXJ5U3RyaW5nICs9IFwiJlwiO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0cy53cmFwSW5kZXggPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xyXG4gICAgdmFyIHdyYXBwZWRJbmRleCA9IChpbmRleCAlIGxlbmd0aCk7IFxyXG4gICAgaWYgKHdyYXBwZWRJbmRleCA8IDApIHtcclxuICAgICAgICAvLyBJZiBuZWdhdGl2ZSwgZmxpcCB0aGUgaW5kZXggc28gdGhhdCAtMSBiZWNvbWVzIHRoZSBsYXN0IGl0ZW0gaW4gbGlzdCBcclxuICAgICAgICB3cmFwcGVkSW5kZXggPSBsZW5ndGggKyB3cmFwcGVkSW5kZXg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gd3JhcHBlZEluZGV4O1xyXG59O1xyXG4iXX0=
