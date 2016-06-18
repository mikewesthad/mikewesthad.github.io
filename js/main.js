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
                zIndex: 0,
                backgroundColor: "white"
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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJub2RlX21vZHVsZXMvcDUtYmJveC1hbGlnbmVkLXRleHQvbGliL2Jib3gtYWxpZ25lZC10ZXh0LmpzIiwibm9kZV9tb2R1bGVzL3A1LWJib3gtYWxpZ25lZC10ZXh0L2xpYi91dGlscy5qcyIsInNyYy9qcy9ob3Zlci1zbGlkZXNob3cuanMiLCJzcmMvanMvaW1hZ2UtZ2FsbGVyeS5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9iYXNlLWxvZ28tc2tldGNoLmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2Nvbm5lY3QtcG9pbnRzLXNrZXRjaC5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9nZW5lcmF0b3JzL25vaXNlLWdlbmVyYXRvcnMuanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvZ2VuZXJhdG9ycy9zaW4tZ2VuZXJhdG9yLmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2hhbGZ0b25lLWZsYXNobGlnaHQtd29yZC5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9ub2lzeS13b3JkLXNrZXRjaC5qcyIsInNyYy9qcy9tYWluLW5hdi5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL3BhZ2UtbG9hZGVyLmpzIiwic3JjL2pzL3BpY2stcmFuZG9tLXNrZXRjaC5qcyIsInNyYy9qcy9wb3J0Zm9saW8tZmlsdGVyLmpzIiwic3JjL2pzL3V0aWxpdGllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIEphdmFTY3JpcHQgQ29va2llIHYyLjEuMlxuICogaHR0cHM6Ly9naXRodWIuY29tL2pzLWNvb2tpZS9qcy1jb29raWVcbiAqXG4gKiBDb3B5cmlnaHQgMjAwNiwgMjAxNSBLbGF1cyBIYXJ0bCAmIEZhZ25lciBCcmFja1xuICogUmVsZWFzZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlXG4gKi9cbjsoZnVuY3Rpb24gKGZhY3RvcnkpIHtcblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShmYWN0b3J5KTtcblx0fSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0fSBlbHNlIHtcblx0XHR2YXIgT2xkQ29va2llcyA9IHdpbmRvdy5Db29raWVzO1xuXHRcdHZhciBhcGkgPSB3aW5kb3cuQ29va2llcyA9IGZhY3RvcnkoKTtcblx0XHRhcGkubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHdpbmRvdy5Db29raWVzID0gT2xkQ29va2llcztcblx0XHRcdHJldHVybiBhcGk7XG5cdFx0fTtcblx0fVxufShmdW5jdGlvbiAoKSB7XG5cdGZ1bmN0aW9uIGV4dGVuZCAoKSB7XG5cdFx0dmFyIGkgPSAwO1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIGF0dHJpYnV0ZXMgPSBhcmd1bWVudHNbIGkgXTtcblx0XHRcdGZvciAodmFyIGtleSBpbiBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRcdHJlc3VsdFtrZXldID0gYXR0cmlidXRlc1trZXldO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gaW5pdCAoY29udmVydGVyKSB7XG5cdFx0ZnVuY3Rpb24gYXBpIChrZXksIHZhbHVlLCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHR2YXIgcmVzdWx0O1xuXHRcdFx0aWYgKHR5cGVvZiBkb2N1bWVudCA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBXcml0ZVxuXG5cdFx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0YXR0cmlidXRlcyA9IGV4dGVuZCh7XG5cdFx0XHRcdFx0cGF0aDogJy8nXG5cdFx0XHRcdH0sIGFwaS5kZWZhdWx0cywgYXR0cmlidXRlcyk7XG5cblx0XHRcdFx0aWYgKHR5cGVvZiBhdHRyaWJ1dGVzLmV4cGlyZXMgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0dmFyIGV4cGlyZXMgPSBuZXcgRGF0ZSgpO1xuXHRcdFx0XHRcdGV4cGlyZXMuc2V0TWlsbGlzZWNvbmRzKGV4cGlyZXMuZ2V0TWlsbGlzZWNvbmRzKCkgKyBhdHRyaWJ1dGVzLmV4cGlyZXMgKiA4NjRlKzUpO1xuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyA9IGV4cGlyZXM7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHJlc3VsdCA9IEpTT04uc3RyaW5naWZ5KHZhbHVlKTtcblx0XHRcdFx0XHRpZiAoL15bXFx7XFxbXS8udGVzdChyZXN1bHQpKSB7XG5cdFx0XHRcdFx0XHR2YWx1ZSA9IHJlc3VsdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cblx0XHRcdFx0aWYgKCFjb252ZXJ0ZXIud3JpdGUpIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcodmFsdWUpKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8M0F8M0N8M0V8M0R8MkZ8M0Z8NDB8NUJ8NUR8NUV8NjB8N0J8N0R8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBjb252ZXJ0ZXIud3JpdGUodmFsdWUsIGtleSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRrZXkgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGtleSkpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnw1RXw2MHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoL1tcXChcXCldL2csIGVzY2FwZSk7XG5cblx0XHRcdFx0cmV0dXJuIChkb2N1bWVudC5jb29raWUgPSBbXG5cdFx0XHRcdFx0a2V5LCAnPScsIHZhbHVlLFxuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZXhwaXJlcyAmJiAnOyBleHBpcmVzPScgKyBhdHRyaWJ1dGVzLmV4cGlyZXMudG9VVENTdHJpbmcoKSwgLy8gdXNlIGV4cGlyZXMgYXR0cmlidXRlLCBtYXgtYWdlIGlzIG5vdCBzdXBwb3J0ZWQgYnkgSUVcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLnBhdGggICAgJiYgJzsgcGF0aD0nICsgYXR0cmlidXRlcy5wYXRoLFxuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuZG9tYWluICAmJiAnOyBkb21haW49JyArIGF0dHJpYnV0ZXMuZG9tYWluLFxuXHRcdFx0XHRcdGF0dHJpYnV0ZXMuc2VjdXJlID8gJzsgc2VjdXJlJyA6ICcnXG5cdFx0XHRcdF0uam9pbignJykpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBSZWFkXG5cblx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdHJlc3VsdCA9IHt9O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBUbyBwcmV2ZW50IHRoZSBmb3IgbG9vcCBpbiB0aGUgZmlyc3QgcGxhY2UgYXNzaWduIGFuIGVtcHR5IGFycmF5XG5cdFx0XHQvLyBpbiBjYXNlIHRoZXJlIGFyZSBubyBjb29raWVzIGF0IGFsbC4gQWxzbyBwcmV2ZW50cyBvZGQgcmVzdWx0IHdoZW5cblx0XHRcdC8vIGNhbGxpbmcgXCJnZXQoKVwiXG5cdFx0XHR2YXIgY29va2llcyA9IGRvY3VtZW50LmNvb2tpZSA/IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOyAnKSA6IFtdO1xuXHRcdFx0dmFyIHJkZWNvZGUgPSAvKCVbMC05QS1aXXsyfSkrL2c7XG5cdFx0XHR2YXIgaSA9IDA7XG5cblx0XHRcdGZvciAoOyBpIDwgY29va2llcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR2YXIgcGFydHMgPSBjb29raWVzW2ldLnNwbGl0KCc9Jyk7XG5cdFx0XHRcdHZhciBjb29raWUgPSBwYXJ0cy5zbGljZSgxKS5qb2luKCc9Jyk7XG5cblx0XHRcdFx0aWYgKGNvb2tpZS5jaGFyQXQoMCkgPT09ICdcIicpIHtcblx0XHRcdFx0XHRjb29raWUgPSBjb29raWUuc2xpY2UoMSwgLTEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHR2YXIgbmFtZSA9IHBhcnRzWzBdLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0XHRjb29raWUgPSBjb252ZXJ0ZXIucmVhZCA/XG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXIucmVhZChjb29raWUsIG5hbWUpIDogY29udmVydGVyKGNvb2tpZSwgbmFtZSkgfHxcblx0XHRcdFx0XHRcdGNvb2tpZS5yZXBsYWNlKHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cblx0XHRcdFx0XHRpZiAodGhpcy5qc29uKSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb29raWUgPSBKU09OLnBhcnNlKGNvb2tpZSk7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChrZXkgPT09IG5hbWUpIHtcblx0XHRcdFx0XHRcdHJlc3VsdCA9IGNvb2tpZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICgha2V5KSB7XG5cdFx0XHRcdFx0XHRyZXN1bHRbbmFtZV0gPSBjb29raWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdH1cblxuXHRcdGFwaS5zZXQgPSBhcGk7XG5cdFx0YXBpLmdldCA9IGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHJldHVybiBhcGkoa2V5KTtcblx0XHR9O1xuXHRcdGFwaS5nZXRKU09OID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIGFwaS5hcHBseSh7XG5cdFx0XHRcdGpzb246IHRydWVcblx0XHRcdH0sIFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG5cdFx0fTtcblx0XHRhcGkuZGVmYXVsdHMgPSB7fTtcblxuXHRcdGFwaS5yZW1vdmUgPSBmdW5jdGlvbiAoa2V5LCBhdHRyaWJ1dGVzKSB7XG5cdFx0XHRhcGkoa2V5LCAnJywgZXh0ZW5kKGF0dHJpYnV0ZXMsIHtcblx0XHRcdFx0ZXhwaXJlczogLTFcblx0XHRcdH0pKTtcblx0XHR9O1xuXG5cdFx0YXBpLndpdGhDb252ZXJ0ZXIgPSBpbml0O1xuXG5cdFx0cmV0dXJuIGFwaTtcblx0fVxuXG5cdHJldHVybiBpbml0KGZ1bmN0aW9uICgpIHt9KTtcbn0pKTtcbiIsInZhciB1dGlscyA9IHJlcXVpcmUoXCIuL3V0aWxzLmpzXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCYm94QWxpZ25lZFRleHQ7XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBCYm94QWxpZ25lZFRleHQgb2JqZWN0IC0gYSB0ZXh0IG9iamVjdCB0aGF0IGNhbiBiZSBkcmF3biB3aXRoXHJcbiAqIGFuY2hvciBwb2ludHMgYmFzZWQgb24gYSB0aWdodCBib3VuZGluZyBib3ggYXJvdW5kIHRoZSB0ZXh0LlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtvYmplY3R9IGZvbnQgLSBwNS5Gb250IG9iamVjdFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAtIFN0cmluZyB0byBkaXNwbGF5XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbZm9udFNpemU9MTJdIC0gRm9udCBzaXplIHRvIHVzZSBmb3Igc3RyaW5nXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeD0wXSAtIEluaXRpYWwgeCBsb2NhdGlvblxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3k9MF0gLSBJbml0aWFsIHkgbG9jYXRpb25cclxuICogQHBhcmFtIHtvYmplY3R9IFtwSW5zdGFuY2U9d2luZG93XSAtIFJlZmVyZW5jZSB0byBwNSBpbnN0YW5jZSwgbGVhdmUgYmxhbmsgaWZcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNrZXRjaCBpcyBnbG9iYWxcclxuICogQGV4YW1wbGVcclxuICogdmFyIGZvbnQsIGJib3hUZXh0O1xyXG4gKiBmdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gKiAgICAgZm9udCA9IGxvYWRGb250KFwiLi9hc3NldHMvUmVndWxhci50dGZcIik7XHJcbiAqIH1cclxuICogZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAqICAgICBjcmVhdGVDYW52YXMoNDAwLCA2MDApO1xyXG4gKiAgICAgYmFja2dyb3VuZCgwKTtcclxuICogICAgIFxyXG4gKiAgICAgYmJveFRleHQgPSBuZXcgQmJveEFsaWduZWRUZXh0KGZvbnQsIFwiSGV5IVwiLCAzMCk7ICAgIFxyXG4gKiAgICAgYmJveFRleHQuc2V0Um90YXRpb24oUEkgLyA0KTtcclxuICogICAgIGJib3hUZXh0LnNldEFuY2hvcihCYm94QWxpZ25lZFRleHQuQUxJR04uQk9YX0NFTlRFUiwgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVIpO1xyXG4gKiAgICAgXHJcbiAqICAgICBmaWxsKFwiIzAwQThFQVwiKTtcclxuICogICAgIG5vU3Ryb2tlKCk7XHJcbiAqICAgICBiYm94VGV4dC5kcmF3KHdpZHRoIC8gMiwgaGVpZ2h0IC8gMik7XHJcbiAqIH1cclxuICovXHJcbmZ1bmN0aW9uIEJib3hBbGlnbmVkVGV4dChmb250LCB0ZXh0LCBmb250U2l6ZSwgeCwgeSwgcEluc3RhbmNlKSB7XHJcbiAgICB0aGlzLl9mb250ID0gZm9udDtcclxuICAgIHRoaXMuX3RleHQgPSB0ZXh0O1xyXG4gICAgdGhpcy5feCA9IHV0aWxzLmRlZmF1bHQoeCwgMCk7XHJcbiAgICB0aGlzLl95ID0gdXRpbHMuZGVmYXVsdCh5LCAwKTtcclxuICAgIHRoaXMuX2ZvbnRTaXplID0gdXRpbHMuZGVmYXVsdChmb250U2l6ZSwgMTIpO1xyXG4gICAgdGhpcy5fcCA9IHV0aWxzLmRlZmF1bHQocEluc3RhbmNlLCB3aW5kb3cpO1xyXG4gICAgdGhpcy5fcm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy5faEFsaWduID0gQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9DRU5URVI7XHJcbiAgICB0aGlzLl92QWxpZ24gPSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUjtcclxuICAgIHRoaXMuX2NhbGN1bGF0ZU1ldHJpY3ModHJ1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWZXJ0aWNhbCBhbGlnbm1lbnQgdmFsdWVzXHJcbiAqIEBwdWJsaWNcclxuICogQHN0YXRpY1xyXG4gKiBAcmVhZG9ubHlcclxuICogQGVudW0ge3N0cmluZ31cclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5BTElHTiA9IHtcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIGxlZnQgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9MRUZUOiBcImJveF9sZWZ0XCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9DRU5URVI6IFwiYm94X2NlbnRlclwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgcmlnaHQgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9SSUdIVDogXCJib3hfcmlnaHRcIlxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2VsaW5lIGFsaWdubWVudCB2YWx1ZXNcclxuICogQHB1YmxpY1xyXG4gKiBAc3RhdGljXHJcbiAqIEByZWFkb25seVxyXG4gKiBAZW51bSB7c3RyaW5nfVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FID0ge1xyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgdG9wIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfVE9QOiBcImJveF90b3BcIixcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIGNlbnRlciBvZiB0aGUgYmJveCAqL1xyXG4gICAgQk9YX0NFTlRFUjogXCJib3hfY2VudGVyXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBib3R0b20gb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9CT1RUT006IFwiYm94X2JvdHRvbVwiLFxyXG4gICAgLyoqIFxyXG4gICAgICogRHJhdyBmcm9tIGhhbGYgdGhlIGhlaWdodCBvZiB0aGUgZm9udC4gU3BlY2lmaWNhbGx5IHRoZSBoZWlnaHQgaXNcclxuICAgICAqIGNhbGN1bGF0ZWQgYXM6IGFzY2VudCArIGRlc2NlbnQuXHJcbiAgICAgKi9cclxuICAgIEZPTlRfQ0VOVEVSOiBcImZvbnRfY2VudGVyXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSB0aGUgbm9ybWFsIGZvbnQgYmFzZWxpbmUgKi9cclxuICAgIEFMUEhBQkVUSUM6IFwiYWxwaGFiZXRpY1wiXHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGN1cnJlbnQgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBUZXh0IHN0cmluZyB0byBkaXNwbGF5XHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFRleHQgPSBmdW5jdGlvbihzdHJpbmcpIHtcclxuICAgIHRoaXMuX3RleHQgPSBzdHJpbmc7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVNZXRyaWNzKGZhbHNlKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgdGV4dCBwb3NpdGlvblxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gWCBwb3NpdGlvblxyXG4gKiBAcGFyYW0ge251bWJlcn0geCAtIFkgcG9zaXRpb25cclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0UG9zaXRpb24gPSBmdW5jdGlvbih4LCB5KSB7XHJcbiAgICB0aGlzLl94ID0gdXRpbHMuZGVmYXVsdCh4LCB0aGlzLl94KTtcclxuICAgIHRoaXMuX3kgPSB1dGlscy5kZWZhdWx0KHksIHRoaXMuX3kpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHRoZSB0ZXh0IHBvc2l0aW9uXHJcbiAqIEBwdWJsaWNcclxuICogQHJldHVybiB7b2JqZWN0fSBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXM6IHgsIHlcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogdGhpcy5feCxcclxuICAgICAgICB5OiB0aGlzLl95XHJcbiAgICB9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCBjdXJyZW50IHRleHQgc2l6ZVxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBmb250U2l6ZSBUZXh0IHNpemVcclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0VGV4dFNpemUgPSBmdW5jdGlvbihmb250U2l6ZSkge1xyXG4gICAgdGhpcy5fZm9udFNpemUgPSBmb250U2l6ZTtcclxuICAgIHRoaXMuX2NhbGN1bGF0ZU1ldHJpY3ModHJ1ZSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgcm90YXRpb24gb2YgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFJvdGF0aW9uIGluIHJhZGlhbnNcclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0Um90YXRpb24gPSBmdW5jdGlvbihhbmdsZSkge1xyXG4gICAgdGhpcy5fcm90YXRpb24gPSB1dGlscy5kZWZhdWx0KGFuZ2xlLCB0aGlzLl9yb3RhdGlvbik7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgcm90YXRpb24gb2YgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEByZXR1cm5zIHtudW1iZXJ9IFJvdGF0aW9uIGluIHJhZGlhbnNcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0Um90YXRpb24gPSBmdW5jdGlvbihhbmdsZSkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3JvdGF0aW9uO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCB0aGUgcCBpbnN0YW5jZSB0aGF0IGlzIHVzZWQgZm9yIGRyYXdpbmdcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge29iamVjdH0gcCAtIEluc3RhbmNlIG9mIHA1IGZvciBkcmF3aW5nLiBUaGlzIGlzIG9ubHkgbmVlZGVkIHdoZW4gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgdXNpbmcgYW4gb2Zmc2NyZWVuIHJlbmRlcmVyIG9yIHdoZW4gdXNpbmcgcDUgaW4gaW5zdGFuY2VcclxuICogICAgICAgICAgICAgICAgICAgICBtb2RlLlxyXG4gKiBAcmV0dXJucyB7dGhpc30gVXNlZnVsIGZvciBjaGFpbmluZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRQSW5zdGFuY2UgPSBmdW5jdGlvbihwKSB7XHJcbiAgICB0aGlzLl9wID0gdXRpbHMuZGVmYXVsdChwLCB0aGlzLl9wKTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCByb3RhdGlvbiBvZiB0ZXh0XHJcbiAqIEBwdWJsaWNcclxuICogQHJldHVybnMge29iamVjdH0gSW5zdGFuY2Ugb2YgcDUgdGhhdCBpcyBiZWluZyB1c2VkIGZvciBkcmF3aW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLmdldFBJbnN0YW5jZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3A7XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGFuY2hvciBwb2ludCBmb3IgdGV4dCAoaG9yaXpvbmFsIGFuZCB2ZXJ0aWNhbCBhbGlnbm1lbnQpIHJlbGF0aXZlIHRvXHJcbiAqIGJvdW5kaW5nIGJveFxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbaEFsaWduPUNFTlRFUl0gLSBIb3Jpem9uYWwgYWxpZ25tZW50XHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdkFsaWduPUNFTlRFUl0gLSBWZXJ0aWNhbCBiYXNlbGluZVxyXG4gKiBAcGFyYW0ge2Jvb2xlYW59IFt1cGRhdGVQb3NpdGlvbj1mYWxzZV0gLSBJZiBzZXQgdG8gdHJ1ZSwgdGhlIHBvc2l0aW9uIG9mIHRoZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgdGV4dCB3aWxsIGJlIHNoaWZ0ZWQgc28gdGhhdFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGUgdGV4dCB3aWxsIGJlIGRyYXduIGluIHRoZSBzYW1lXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlIGl0IHdhcyBiZWZvcmUgY2FsbGluZyBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0QW5jaG9yLlxyXG4gKiBAcmV0dXJucyB7dGhpc30gVXNlZnVsIGZvciBjaGFpbmluZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRBbmNob3IgPSBmdW5jdGlvbihoQWxpZ24sIHZBbGlnbiwgdXBkYXRlUG9zaXRpb24pIHtcclxuICAgIHZhciBvbGRQb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHRoaXMuX3gsIHRoaXMuX3kpO1xyXG4gICAgdGhpcy5faEFsaWduID0gdXRpbHMuZGVmYXVsdChoQWxpZ24sIEJib3hBbGlnbmVkVGV4dC5BTElHTi5DRU5URVIpO1xyXG4gICAgdGhpcy5fdkFsaWduID0gdXRpbHMuZGVmYXVsdCh2QWxpZ24sIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5DRU5URVIpO1xyXG4gICAgaWYgKHVwZGF0ZVBvc2l0aW9uKSB7XHJcbiAgICAgICAgdmFyIG5ld1BvcyA9IHRoaXMuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHModGhpcy5feCwgdGhpcy5feSk7XHJcbiAgICAgICAgdGhpcy5feCArPSBvbGRQb3MueCAtIG5ld1Bvcy54O1xyXG4gICAgICAgIHRoaXMuX3kgKz0gb2xkUG9zLnkgLSBuZXdQb3MueTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgYm91bmRpbmcgYm94IHdoZW4gdGhlIHRleHQgaXMgcGxhY2VkIGF0IHRoZSBzcGVjaWZpZWQgY29vcmRpbmF0ZXMuXHJcbiAqIE5vdGU6IHRoaXMgaXMgdGhlIHVucm90YXRlZCBib3VuZGluZyBib3ghIFRPRE86IEZpeCB0aGlzLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3g9Y3VycmVudCB4XSAtIEEgbmV3IHggY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpc1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbGwgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJtYW5lbnRseS4gXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeT1jdXJyZW50IHldIC0gQSBuZXcgeSBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbmVudGx5LlxyXG4gKiBAcmV0dXJuIHtvYmplY3R9IFJldHVybnMgYW4gb2JqZWN0IHdpdGggcHJvcGVydGllczogeCwgeSwgdywgaFxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRCYm94ID0gZnVuY3Rpb24oeCwgeSkge1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvbih4LCB5KTtcclxuICAgIHZhciBwb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHRoaXMuX3gsIHRoaXMuX3kpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiBwb3MueCArIHRoaXMuX2JvdW5kc09mZnNldC54LFxyXG4gICAgICAgIHk6IHBvcy55ICsgdGhpcy5fYm91bmRzT2Zmc2V0LnksXHJcbiAgICAgICAgdzogdGhpcy53aWR0aCxcclxuICAgICAgICBoOiB0aGlzLmhlaWdodFxyXG4gICAgfTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgYW4gYXJyYXkgb2YgcG9pbnRzIHRoYXQgZm9sbG93IGFsb25nIHRoZSB0ZXh0IHBhdGguIFRoaXMgd2lsbCB0YWtlIGludG9cclxuICogY29uc2lkZXJhdGlvbiB0aGUgY3VycmVudCBhbGlnbm1lbnQgc2V0dGluZ3MuXHJcbiAqIE5vdGU6IHRoaXMgaXMgYSB0aGluIHdyYXBwZXIgYXJvdW5kIGEgcDUgbWV0aG9kIGFuZCBkb2Vzbid0IGhhbmRsZSB1bnJvdGF0ZWRcclxuICogdGV4dCEgVE9ETzogRml4IHRoaXMuXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeD1jdXJyZW50IHhdIC0gQSBuZXcgeCBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbmVudGx5LiBcclxuICogQHBhcmFtIHtudW1iZXJ9IFt5PWN1cnJlbnQgeV0gLSBBIG5ldyB5IGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3IuIFRoaXNcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVybWFuZW50bHkuXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gLSBBbiBvYmplY3QgdGhhdCBjYW4gaGF2ZTpcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBzYW1wbGVGYWN0b3I6IHJhdGlvIG9mIHBhdGgtbGVuZ3RoIHRvIG51bWJlclxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mIHNhbXBsZXMgKGRlZmF1bHQ9MC4yNSkuIEhpZ2hlciB2YWx1ZXMgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeWllbGQgbW9yZXBvaW50cyBhbmQgYXJlIHRoZXJlZm9yZSBtb3JlIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZWNpc2UuIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHNpbXBsaWZ5VGhyZXNob2xkOiBpZiBzZXQgdG8gYSBub24temVybyBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSwgY29sbGluZWFyIHBvaW50cyB3aWxsIGJlIHJlbW92ZWQuIFRoZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlIHJlcHJlc2VudHMgdGhlIHRocmVzaG9sZCBhbmdsZSB0byB1c2VcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGVuIGRldGVybWluaW5nIHdoZXRoZXIgdHdvIGVkZ2VzIGFyZSBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaW5lYXIuXHJcbiAqIEByZXR1cm4ge2FycmF5fSBBbiBhcnJheSBvZiBwb2ludHMsIGVhY2ggd2l0aCB4LCB5ICYgYWxwaGEgKHRoZSBwYXRoIGFuZ2xlKVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRUZXh0UG9pbnRzID0gZnVuY3Rpb24oeCwgeSwgb3B0aW9ucykge1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvbih4LCB5KTtcclxuICAgIHZhciBwb2ludHMgPSB0aGlzLl9mb250LnRleHRUb1BvaW50cyh0aGlzLl90ZXh0LCB0aGlzLl94LCB0aGlzLl95LCBcclxuICAgICAgICB0aGlzLl9mb250U2l6ZSwgb3B0aW9ucyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBwb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHBvaW50c1tpXS54LCBwb2ludHNbaV0ueSk7XHJcbiAgICAgICAgcG9pbnRzW2ldLnggPSBwb3MueDtcclxuICAgICAgICBwb2ludHNbaV0ueSA9IHBvcy55O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBvaW50cztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEcmF3cyB0aGUgdGV4dCBwYXJ0aWNsZSB3aXRoIHRoZSBzcGVjaWZpZWQgc3R5bGUgcGFyYW1ldGVycy4gTm90ZTogdGhpcyBpc1xyXG4gKiBnb2luZyB0byBzZXQgdGhlIHRleHRGb250LCB0ZXh0U2l6ZSAmIHJvdGF0aW9uIGJlZm9yZSBkcmF3aW5nLiBZb3Ugc2hvdWxkIHNldFxyXG4gKiB0aGUgY29sb3Ivc3Ryb2tlL2ZpbGwgdGhhdCB5b3Ugd2FudCBiZWZvcmUgZHJhd2luZy4gVGhpcyBmdW5jdGlvbiB3aWxsIGNsZWFuXHJcbiAqIHVwIGFmdGVyIGl0c2VsZiBhbmQgcmVzZXQgc3R5bGluZyBiYWNrIHRvIHdoYXQgaXQgd2FzIGJlZm9yZSBpdCB3YXMgY2FsbGVkLlxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeD1jdXJyZW50IHhdIC0gQSBuZXcgeCBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzIHdpbGxcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gcGVybWFuZW50bHkuIFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3k9Y3VycmVudCB5XSAtIEEgbmV3IHkgY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpcyB3aWxsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBwZXJtYW5lbnRseS5cclxuICogQHBhcmFtIHtib29sZWFufSBbZHJhd0JvdW5kcz1mYWxzZV0gLSBGbGFnIGZvciBkcmF3aW5nIGJvdW5kaW5nIGJveFxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oeCwgeSwgZHJhd0JvdW5kcykge1xyXG4gICAgZHJhd0JvdW5kcyA9IHV0aWxzLmRlZmF1bHQoZHJhd0JvdW5kcywgZmFsc2UpO1xyXG4gICAgdGhpcy5zZXRQb3NpdGlvbih4LCB5KTtcclxuICAgIHZhciBwb3MgPSB7XHJcbiAgICAgICAgeDogdGhpcy5feCwgXHJcbiAgICAgICAgeTogdGhpcy5feVxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9wLnB1c2goKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3JvdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuX2NhbGN1bGF0ZVJvdGF0ZWRDb29yZHMocG9zLngsIHBvcy55LCB0aGlzLl9yb3RhdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMuX3Aucm90YXRlKHRoaXMuX3JvdGF0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBvcyA9IHRoaXMuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHMocG9zLngsIHBvcy55KTtcclxuXHJcbiAgICAgICAgdGhpcy5fcC50ZXh0QWxpZ24odGhpcy5fcC5MRUZULCB0aGlzLl9wLkJBU0VMSU5FKTtcclxuICAgICAgICB0aGlzLl9wLnRleHRGb250KHRoaXMuX2ZvbnQpO1xyXG4gICAgICAgIHRoaXMuX3AudGV4dFNpemUodGhpcy5fZm9udFNpemUpO1xyXG4gICAgICAgIHRoaXMuX3AudGV4dCh0aGlzLl90ZXh0LCBwb3MueCwgcG9zLnkpO1xyXG5cclxuICAgICAgICBpZiAoZHJhd0JvdW5kcykge1xyXG4gICAgICAgICAgICB0aGlzLl9wLnN0cm9rZSgyMDApO1xyXG4gICAgICAgICAgICB2YXIgYm91bmRzWCA9IHBvcy54ICsgdGhpcy5fYm91bmRzT2Zmc2V0Lng7XHJcbiAgICAgICAgICAgIHZhciBib3VuZHNZID0gcG9zLnkgKyB0aGlzLl9ib3VuZHNPZmZzZXQueTtcclxuICAgICAgICAgICAgdGhpcy5fcC5ub0ZpbGwoKTtcclxuICAgICAgICAgICAgdGhpcy5fcC5yZWN0KGJvdW5kc1gsIGJvdW5kc1ksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgdGhpcy5fcC5wb3AoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBQcm9qZWN0IHRoZSBjb29yZGluYXRlcyAoeCwgeSkgaW50byBhIHJvdGF0ZWQgY29vcmRpbmF0ZSBzeXN0ZW1cclxuICogQHByaXZhdGVcclxuICogQHBhcmFtIHtudW1iZXJ9IHggLSBYIGNvb3JkaW5hdGUgKGluIHVucm90YXRlZCBzcGFjZSlcclxuICogQHBhcmFtIHtudW1iZXJ9IHkgLSBZIGNvb3JkaW5hdGUgKGluIHVucm90YXRlZCBzcGFjZSlcclxuICogQHBhcmFtIHtudW1iZXJ9IGFuZ2xlIC0gUmFkaWFucyBvZiByb3RhdGlvbiB0byBhcHBseVxyXG4gKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCB3aXRoIHggJiB5IHByb3BlcnRpZXNcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuX2NhbGN1bGF0ZVJvdGF0ZWRDb29yZHMgPSBmdW5jdGlvbiAoeCwgeSwgYW5nbGUpIHsgIFxyXG4gICAgdmFyIHJ4ID0gTWF0aC5jb3MoYW5nbGUpICogeCArIE1hdGguY29zKE1hdGguUEkgLyAyIC0gYW5nbGUpICogeTtcclxuICAgIHZhciByeSA9IC1NYXRoLnNpbihhbmdsZSkgKiB4ICsgTWF0aC5zaW4oTWF0aC5QSSAvIDIgLSBhbmdsZSkgKiB5O1xyXG4gICAgcmV0dXJuIHt4OiByeCwgeTogcnl9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgZHJhdyBjb29yZGluYXRlcyBmb3IgdGhlIHRleHQsIGFsaWduaW5nIGJhc2VkIG9uIHRoZSBib3VuZGluZyBib3guXHJcbiAqIFRoZSB0ZXh0IGlzIGV2ZW50dWFsbHkgZHJhd24gd2l0aCBjYW52YXMgYWxpZ25tZW50IHNldCB0byBsZWZ0ICYgYmFzZWxpbmUsIHNvXHJcbiAqIHRoaXMgZnVuY3Rpb24gdGFrZXMgYSBkZXNpcmVkIHBvcyAmIGFsaWdubWVudCBhbmQgcmV0dXJucyB0aGUgYXBwcm9wcmlhdGVcclxuICogY29vcmRpbmF0ZXMgZm9yIHRoZSBsZWZ0ICYgYmFzZWxpbmUuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gWCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gWSBjb29yZGluYXRlXHJcbiAqIEByZXR1cm4ge29iamVjdH0gT2JqZWN0IHdpdGggeCAmIHkgcHJvcGVydGllc1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5fY2FsY3VsYXRlQWxpZ25lZENvb3JkcyA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICAgIHZhciBuZXdYLCBuZXdZO1xyXG4gICAgc3dpdGNoICh0aGlzLl9oQWxpZ24pIHtcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfTEVGVDpcclxuICAgICAgICAgICAgbmV3WCA9IHg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9DRU5URVI6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4IC0gdGhpcy5oYWxmV2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9SSUdIVDpcclxuICAgICAgICAgICAgbmV3WCA9IHggLSB0aGlzLndpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBuZXdYID0geDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbnJlY29nbml6ZWQgaG9yaXpvbmFsIGFsaWduOlwiLCB0aGlzLl9oQWxpZ24pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHN3aXRjaCAodGhpcy5fdkFsaWduKSB7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX1RPUDpcclxuICAgICAgICAgICAgbmV3WSA9IHkgLSB0aGlzLl9ib3VuZHNPZmZzZXQueTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUjpcclxuICAgICAgICAgICAgbmV3WSA9IHkgKyB0aGlzLl9kaXN0QmFzZVRvTWlkO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5CT1hfQk9UVE9NOlxyXG4gICAgICAgICAgICBuZXdZID0geSAtIHRoaXMuX2Rpc3RCYXNlVG9Cb3R0b207XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkZPTlRfQ0VOVEVSOlxyXG4gICAgICAgICAgICAvLyBIZWlnaHQgaXMgYXBwcm94aW1hdGVkIGFzIGFzY2VudCArIGRlc2NlbnRcclxuICAgICAgICAgICAgbmV3WSA9IHkgLSB0aGlzLl9kZXNjZW50ICsgKHRoaXMuX2FzY2VudCArIHRoaXMuX2Rlc2NlbnQpIC8gMjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQUxQSEFCRVRJQzpcclxuICAgICAgICAgICAgbmV3WSA9IHk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5O1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVucmVjb2duaXplZCB2ZXJ0aWNhbCBhbGlnbjpcIiwgdGhpcy5fdkFsaWduKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge3g6IG5ld1gsIHk6IG5ld1l9O1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIGJvdW5kaW5nIGJveCBhbmQgdmFyaW91cyBtZXRyaWNzIGZvciB0aGUgY3VycmVudCB0ZXh0IGFuZCBmb250XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLl9jYWxjdWxhdGVNZXRyaWNzID0gZnVuY3Rpb24oc2hvdWxkVXBkYXRlSGVpZ2h0KSB7ICBcclxuICAgIC8vIHA1IDAuNS4wIGhhcyBhIGJ1ZyAtIHRleHQgYm91bmRzIGFyZSBjbGlwcGVkIGJ5ICgwLCAwKVxyXG4gICAgLy8gQ2FsY3VsYXRpbmcgYm91bmRzIGhhY2tcclxuICAgIHZhciBib3VuZHMgPSB0aGlzLl9mb250LnRleHRCb3VuZHModGhpcy5fdGV4dCwgMTAwMCwgMTAwMCwgdGhpcy5fZm9udFNpemUpO1xyXG4gICAgLy8gQm91bmRzIGlzIGEgcmVmZXJlbmNlIC0gaWYgd2UgbWVzcyB3aXRoIGl0IGRpcmVjdGx5LCB3ZSBjYW4gbWVzcyB1cCBcclxuICAgIC8vIGZ1dHVyZSB2YWx1ZXMhIChJdCBjaGFuZ2VzIHRoZSBiYm94IGNhY2hlIGluIHA1LilcclxuICAgIGJvdW5kcyA9IHsgXHJcbiAgICAgICAgeDogYm91bmRzLnggLSAxMDAwLCBcclxuICAgICAgICB5OiBib3VuZHMueSAtIDEwMDAsIFxyXG4gICAgICAgIHc6IGJvdW5kcy53LCBcclxuICAgICAgICBoOiBib3VuZHMuaCBcclxuICAgIH07IFxyXG5cclxuICAgIGlmIChzaG91bGRVcGRhdGVIZWlnaHQpIHtcclxuICAgICAgICB0aGlzLl9hc2NlbnQgPSB0aGlzLl9mb250Ll90ZXh0QXNjZW50KHRoaXMuX2ZvbnRTaXplKTtcclxuICAgICAgICB0aGlzLl9kZXNjZW50ID0gdGhpcy5fZm9udC5fdGV4dERlc2NlbnQodGhpcy5fZm9udFNpemUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZSBib3VuZHMgdG8gY2FsY3VsYXRlIGZvbnQgbWV0cmljc1xyXG4gICAgdGhpcy53aWR0aCA9IGJvdW5kcy53O1xyXG4gICAgdGhpcy5oZWlnaHQgPSBib3VuZHMuaDtcclxuICAgIHRoaXMuaGFsZldpZHRoID0gdGhpcy53aWR0aCAvIDI7XHJcbiAgICB0aGlzLmhhbGZIZWlnaHQgPSB0aGlzLmhlaWdodCAvIDI7XHJcbiAgICB0aGlzLl9ib3VuZHNPZmZzZXQgPSB7IHg6IGJvdW5kcy54LCB5OiBib3VuZHMueSB9O1xyXG4gICAgdGhpcy5fZGlzdEJhc2VUb01pZCA9IE1hdGguYWJzKGJvdW5kcy55KSAtIHRoaXMuaGFsZkhlaWdodDtcclxuICAgIHRoaXMuX2Rpc3RCYXNlVG9Cb3R0b20gPSB0aGlzLmhlaWdodCAtIE1hdGguYWJzKGJvdW5kcy55KTtcclxufTsiLCJleHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbih2YWx1ZSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICByZXR1cm4gKHZhbHVlICE9PSB1bmRlZmluZWQpID8gdmFsdWUgOiBkZWZhdWx0VmFsdWU7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBIb3ZlclNsaWRlc2hvd3M7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gSG92ZXJTbGlkZXNob3dzKHNsaWRlc2hvd0RlbGF5LCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRoaXMuX3NsaWRlc2hvd0RlbGF5ID0gKHNsaWRlc2hvd0RlbGF5ICE9PSB1bmRlZmluZWQpID8gc2xpZGVzaG93RGVsYXkgOiBcclxuICAgICAgICAyMDAwO1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gKHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSA/IFxyXG4gICAgICAgIF90cmFuc2l0aW9uRHVyYXRpb24gOiAxMDAwOyAgIFxyXG5cclxuICAgIHRoaXMuX3NsaWRlc2hvd3MgPSBbXTtcclxuICAgIHRoaXMucmVsb2FkKCk7XHJcbn1cclxuXHJcbkhvdmVyU2xpZGVzaG93cy5wcm90b3R5cGUucmVsb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gTm90ZTogdGhpcyBpcyBjdXJyZW50bHkgbm90IHJlYWxseSBiZWluZyB1c2VkLiBXaGVuIGEgcGFnZSBpcyBsb2FkZWQsXHJcbiAgICAvLyBtYWluLmpzIGlzIGp1c3QgcmUtaW5zdGFuY2luZyB0aGUgSG92ZXJTbGlkZXNob3dzXHJcbiAgICB2YXIgb2xkU2xpZGVzaG93cyA9IHRoaXMuX3NsaWRlc2hvd3MgfHwgW107XHJcbiAgICB0aGlzLl9zbGlkZXNob3dzID0gW107XHJcbiAgICAkKFwiLmhvdmVyLXNsaWRlc2hvd1wiKS5lYWNoKGZ1bmN0aW9uIChfLCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcclxuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl9maW5kSW5TbGlkZXNob3dzKGVsZW1lbnQsIG9sZFNsaWRlc2hvd3MpO1xyXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlc2hvdyA9IG9sZFNsaWRlc2hvd3Muc3BsaWNlKGluZGV4LCAxKVswXTtcclxuICAgICAgICAgICAgdGhpcy5fc2xpZGVzaG93cy5wdXNoKHNsaWRlc2hvdyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fc2xpZGVzaG93cy5wdXNoKG5ldyBTbGlkZXNob3coJGVsZW1lbnQsIHRoaXMuX3NsaWRlc2hvd0RlbGF5LFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkhvdmVyU2xpZGVzaG93cy5wcm90b3R5cGUuX2ZpbmRJblNsaWRlc2hvd3MgPSBmdW5jdGlvbiAoZWxlbWVudCwgc2xpZGVzaG93cykge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXNob3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IHNsaWRlc2hvd3NbaV0uZ2V0RWxlbWVudCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAtMTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIFNsaWRlc2hvdygkY29udGFpbmVyLCBzbGlkZXNob3dEZWxheSwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICAgIHRoaXMuX3NsaWRlc2hvd0RlbGF5ID0gc2xpZGVzaG93RGVsYXk7XHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb247XHJcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBudWxsO1xyXG4gICAgdGhpcy5faW1hZ2VJbmRleCA9IDA7XHJcbiAgICB0aGlzLl8kaW1hZ2VzID0gW107XHJcblxyXG4gICAgLy8gU2V0IHVwIGFuZCBjYWNoZSByZWZlcmVuY2VzIHRvIGltYWdlc1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5maW5kKFwiaW1nXCIpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRpbWFnZSA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgJGltYWdlLmNzcyh7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgICAgIHRvcDogXCIwXCIsXHJcbiAgICAgICAgICAgIGxlZnQ6IFwiMFwiLFxyXG4gICAgICAgICAgICB6SW5kZXg6IChpbmRleCA9PT0gMCkgPyAyIDogMCAvLyBGaXJzdCBpbWFnZSBzaG91bGQgYmUgb24gdG9wXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlcy5wdXNoKCRpbWFnZSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRvIGJpbmQgaW50ZXJhY3Rpdml0eVxyXG4gICAgdGhpcy5fbnVtSW1hZ2VzID0gdGhpcy5fJGltYWdlcy5sZW5ndGg7XHJcbiAgICBpZiAodGhpcy5fbnVtSW1hZ2VzIDw9IDEpIHJldHVybjtcclxuXHJcbiAgICAvLyBCaW5kIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5vbihcIm1vdXNlZW50ZXJcIiwgdGhpcy5fb25FbnRlci5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuXyRjb250YWluZXIub24oXCJtb3VzZWxlYXZlXCIsIHRoaXMuX29uTGVhdmUuYmluZCh0aGlzKSk7XHJcblxyXG59XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldEVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fJGNvbnRhaW5lci5nZXQoMCk7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldCRFbGVtZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuXyRjb250YWluZXI7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLl9vbkVudGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gRmlyc3QgdHJhbnNpdGlvbiBzaG91bGQgaGFwcGVuIHByZXR0eSBzb29uIGFmdGVyIGhvdmVyaW5nIGluIG9yZGVyXHJcbiAgICAvLyB0byBjbHVlIHRoZSB1c2VyIGludG8gd2hhdCBpcyBoYXBwZW5pbmdcclxuICAgIHRoaXMuX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fYWR2YW5jZVNsaWRlc2hvdy5iaW5kKHRoaXMpLCA1MDApO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fb25MZWF2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fdGltZW91dElkKTsgIFxyXG4gICAgdGhpcy5fdGltZW91dElkID0gbnVsbDsgICAgICBcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX2FkdmFuY2VTbGlkZXNob3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9pbWFnZUluZGV4ICs9IDE7XHJcbiAgICB2YXIgaTtcclxuXHJcbiAgICAvLyBNb3ZlIHRoZSBpbWFnZSBmcm9tIDIgc3RlcHMgYWdvIGRvd24gdG8gdGhlIGJvdHRvbSB6LWluZGV4IGFuZCBtYWtlXHJcbiAgICAvLyBpdCBpbnZpc2libGVcclxuICAgIGlmICh0aGlzLl9udW1JbWFnZXMgPj0gMykge1xyXG4gICAgICAgIGkgPSB1dGlsaXRpZXMud3JhcEluZGV4KHRoaXMuX2ltYWdlSW5kZXggLSAyLCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXNbaV0uY3NzKHtcclxuICAgICAgICAgICAgekluZGV4OiAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlc1tpXS52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTW92ZSB0aGUgaW1hZ2UgZnJvbSAxIHN0ZXBzIGFnbyBkb3duIHRvIHRoZSBtaWRkbGUgei1pbmRleCBhbmQgbWFrZVxyXG4gICAgLy8gaXQgY29tcGxldGVseSB2aXNpYmxlXHJcbiAgICBpZiAodGhpcy5fbnVtSW1hZ2VzID49IDIpIHtcclxuICAgICAgICBpID0gdXRpbGl0aWVzLndyYXBJbmRleCh0aGlzLl9pbWFnZUluZGV4IC0gMSwgdGhpcy5fbnVtSW1hZ2VzKTtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VzW2ldLmNzcyh7XHJcbiAgICAgICAgICAgIHpJbmRleDogMSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXNbaV0udmVsb2NpdHkoXCJzdG9wXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE1vdmUgdGhlIGN1cnJlbnQgaW1hZ2UgdG8gdGhlIHRvcCB6LWluZGV4IGFuZCBmYWRlIGl0IGluXHJcbiAgICB0aGlzLl9pbWFnZUluZGV4ID0gdXRpbGl0aWVzLndyYXBJbmRleCh0aGlzLl9pbWFnZUluZGV4LCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gICAgdGhpcy5fJGltYWdlc1t0aGlzLl9pbWFnZUluZGV4XS5jc3Moe1xyXG4gICAgICAgIHpJbmRleDogMixcclxuICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICB9KTtcclxuICAgIHRoaXMuXyRpbWFnZXNbdGhpcy5faW1hZ2VJbmRleF0udmVsb2NpdHkoe1xyXG4gICAgICAgIG9wYWNpdHk6IDFcclxuICAgIH0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXCJlYXNlSW5PdXRRdWFkXCIpO1xyXG5cclxuICAgIC8vIFNjaGVkdWxlIG5leHQgdHJhbnNpdGlvblxyXG4gICAgdGhpcy5fdGltZW91dElkID0gc2V0VGltZW91dCh0aGlzLl9hZHZhbmNlU2xpZGVzaG93LmJpbmQodGhpcyksIFxyXG4gICAgICAgIHRoaXMuX3NsaWRlc2hvd0RlbGF5KTtcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IEltYWdlR2FsbGVyaWVzO1xyXG5cclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEltYWdlR2FsbGVyaWVzKHRyYW5zaXRpb25EdXJhdGlvbikgeyBcclxuICAgIHRyYW5zaXRpb25EdXJhdGlvbiA9ICh0cmFuc2l0aW9uRHVyYXRpb24gIT09IHVuZGVmaW5lZCkgP1xyXG4gICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbiA6IDQwMDtcclxuICAgIHRoaXMuX2ltYWdlR2FsbGVyaWVzID0gW107XHJcbiAgICAkKFwiLmltYWdlLWdhbGxlcnlcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgZ2FsbGVyeSA9IG5ldyBJbWFnZUdhbGxlcnkoJChlbGVtZW50KSwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcclxuICAgICAgICB0aGlzLl9pbWFnZUdhbGxlcmllcy5wdXNoKGdhbGxlcnkpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gSW1hZ2VHYWxsZXJ5KCRjb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gdHJhbnNpdGlvbkR1cmF0aW9uO1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lciA9ICRjb250YWluZXI7XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyID0gJGNvbnRhaW5lci5maW5kKFwiLmltYWdlLWdhbGxlcnktdGh1bWJuYWlsc1wiKTtcclxuICAgIHRoaXMuX2luZGV4ID0gMDsgLy8gSW5kZXggb2Ygc2VsZWN0ZWQgaW1hZ2VcclxuXHJcbiAgICAvLyBMb29wIHRocm91Z2ggdGhlIHRodW1ibmFpbHMsIGdpdmUgdGhlbSBhbiBpbmRleCBkYXRhIGF0dHJpYnV0ZSBhbmQgY2FjaGVcclxuICAgIC8vIGEgcmVmZXJlbmNlIHRvIHRoZW0gaW4gYW4gYXJyYXlcclxuICAgIHRoaXMuXyR0aHVtYm5haWxzID0gW107XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyLmZpbmQoXCJpbWdcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgJHRodW1ibmFpbCA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgJHRodW1ibmFpbC5kYXRhKFwiaW5kZXhcIiwgaW5kZXgpO1xyXG4gICAgICAgIHRoaXMuXyR0aHVtYm5haWxzLnB1c2goJHRodW1ibmFpbCk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBlbXB0eSBpbWFnZXMgaW4gdGhlIGdhbGxlcnkgZm9yIGVhY2ggdGh1bWJuYWlsLiBUaGlzIGhlbHBzIHVzIGRvXHJcbiAgICAvLyBsYXp5IGxvYWRpbmcgb2YgZ2FsbGVyeSBpbWFnZXMgYW5kIGFsbG93cyB1cyB0byBjcm9zcy1mYWRlIGltYWdlcy5cclxuICAgIHRoaXMuXyRnYWxsZXJ5SW1hZ2VzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuXyR0aHVtYm5haWxzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBpZCBmcm9tIHRoZSBwYXRoIHRvIHRoZSBsYXJnZSBpbWFnZVxyXG4gICAgICAgIHZhciBsYXJnZVBhdGggPSB0aGlzLl8kdGh1bWJuYWlsc1tpXS5kYXRhKFwibGFyZ2UtcGF0aFwiKTtcclxuICAgICAgICB2YXIgaWQgPSBsYXJnZVBhdGguc3BsaXQoXCIvXCIpLnBvcCgpLnNwbGl0KFwiLlwiKVswXTtcclxuICAgICAgICB2YXIgJGdhbGxlcnlJbWFnZSA9ICQoXCI8aW1nPlwiKVxyXG4gICAgICAgICAgICAuY3NzKHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgICAgICAgICB0b3A6IFwiMHB4XCIsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBcIjBweFwiLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgICAgIHpJbmRleDogMCxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJ3aGl0ZVwiXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hdHRyKFwiaWRcIiwgaWQpXHJcbiAgICAgICAgICAgIC5kYXRhKFwiaW1hZ2UtdXJsXCIsIGxhcmdlUGF0aClcclxuICAgICAgICAgICAgLmFwcGVuZFRvKCRjb250YWluZXIuZmluZChcIi5pbWFnZS1nYWxsZXJ5LXNlbGVjdGVkXCIpKTtcclxuICAgICAgICAkZ2FsbGVyeUltYWdlLmdldCgwKS5zcmMgPSBsYXJnZVBhdGg7IC8vIFRPRE86IE1ha2UgdGhpcyBsYXp5IVxyXG4gICAgICAgIHRoaXMuXyRnYWxsZXJ5SW1hZ2VzLnB1c2goJGdhbGxlcnlJbWFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWN0aXZhdGUgdGhlIGZpcnN0IHRodW1ibmFpbCBhbmQgZGlzcGxheSBpdCBpbiB0aGUgZ2FsbGVyeSBcclxuICAgIHRoaXMuX3N3aXRjaEFjdGl2ZUltYWdlKDApO1xyXG5cclxuICAgIC8vIEJpbmQgdGhlIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBpbWFnZXNcclxuICAgIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIuZmluZChcImltZ1wiKS5vbihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbkltYWdlR2FsbGVyeS5wcm90b3R5cGUuX3N3aXRjaEFjdGl2ZUltYWdlID0gZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAvLyBSZXNldCBhbGwgaW1hZ2VzIHRvIGludmlzaWJsZSBhbmQgbG93ZXN0IHotaW5kZXguIFRoaXMgY291bGQgYmUgc21hcnRlcixcclxuICAgIC8vIGxpa2UgSG92ZXJTbGlkZXNob3csIGFuZCBvbmx5IHJlc2V0IGV4YWN0bHkgd2hhdCB3ZSBuZWVkLCBidXQgd2UgYXJlbid0IFxyXG4gICAgLy8gd2FzdGluZyB0aGF0IG1hbnkgY3ljbGVzLlxyXG4gICAgdGhpcy5fJGdhbGxlcnlJbWFnZXMuZm9yRWFjaChmdW5jdGlvbiAoJGdhbGxlcnlJbWFnZSkge1xyXG4gICAgICAgICRnYWxsZXJ5SW1hZ2UuY3NzKHtcclxuICAgICAgICAgICAgXCJ6SW5kZXhcIjogMCxcclxuICAgICAgICAgICAgXCJvcGFjaXR5XCI6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICAkZ2FsbGVyeUltYWdlLnZlbG9jaXR5KFwic3RvcFwiKTsgLy8gU3RvcCBhbnkgYW5pbWF0aW9uc1xyXG4gICAgfSwgdGhpcyk7XHJcblxyXG4gICAgLy8gQ2FjaGUgcmVmZXJlbmNlcyB0byB0aGUgbGFzdCBhbmQgY3VycmVudCBpbWFnZSAmIHRodW1ibmFpbHNcclxuICAgIHZhciAkbGFzdFRodW1ibmFpbCA9IHRoaXMuXyR0aHVtYm5haWxzW3RoaXMuX2luZGV4XTtcclxuICAgIHZhciAkbGFzdEltYWdlID0gdGhpcy5fJGdhbGxlcnlJbWFnZXNbdGhpcy5faW5kZXhdO1xyXG4gICAgdGhpcy5faW5kZXggPSBpbmRleDtcclxuICAgIHZhciAkY3VycmVudFRodW1ibmFpbCA9IHRoaXMuXyR0aHVtYm5haWxzW3RoaXMuX2luZGV4XTtcclxuICAgIHZhciAkY3VycmVudEltYWdlID0gdGhpcy5fJGdhbGxlcnlJbWFnZXNbdGhpcy5faW5kZXhdO1xyXG5cclxuICAgIC8vIEFjdGl2YXRlL2RlYWN0aXZhdGUgdGh1bWJuYWlsc1xyXG4gICAgJGxhc3RUaHVtYm5haWwucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAkY3VycmVudFRodW1ibmFpbC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuXHJcbiAgICAvLyBNYWtlIHRoZSBsYXN0IGltYWdlIHZpc2lzYmxlIGFuZCB0aGVuIGFuaW1hdGUgdGhlIGN1cnJlbnQgaW1hZ2UgaW50byB2aWV3XHJcbiAgICAvLyBvbiB0b3Agb2YgdGhlIGxhc3RcclxuICAgICRsYXN0SW1hZ2UuY3NzKFwiekluZGV4XCIsIDEpO1xyXG4gICAgJGN1cnJlbnRJbWFnZS5jc3MoXCJ6SW5kZXhcIiwgMik7XHJcbiAgICAkbGFzdEltYWdlLmNzcyhcIm9wYWNpdHlcIiwgMSk7XHJcbiAgICAkY3VycmVudEltYWdlLnZlbG9jaXR5KHtcIm9wYWNpdHlcIjogMX0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXHJcbiAgICAgICAgXCJlYXNlSW5PdXRRdWFkXCIpO1xyXG5cclxuICAgIC8vIE9iamVjdCBpbWFnZSBmaXQgcG9seWZpbGwgYnJlYWtzIGpRdWVyeSBhdHRyKC4uLiksIHNvIGZhbGxiYWNrIHRvIGp1c3QgXHJcbiAgICAvLyB1c2luZyBlbGVtZW50LnNyY1xyXG4gICAgLy8gVE9ETzogTGF6eSFcclxuICAgIC8vIGlmICgkY3VycmVudEltYWdlLmdldCgwKS5zcmMgPT09IFwiXCIpIHtcclxuICAgIC8vICAgICAkY3VycmVudEltYWdlLmdldCgwKS5zcmMgPSAkY3VycmVudEltYWdlLmRhdGEoXCJpbWFnZS11cmxcIik7XHJcbiAgICAvLyB9XHJcbn07XHJcblxyXG5JbWFnZUdhbGxlcnkucHJvdG90eXBlLl9vbkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcbiAgICB2YXIgaW5kZXggPSAkdGFyZ2V0LmRhdGEoXCJpbmRleFwiKTtcclxuICAgIFxyXG4gICAgLy8gQ2xpY2tlZCBvbiB0aGUgYWN0aXZlIGltYWdlIC0gbm8gbmVlZCB0byBkbyBhbnl0aGluZ1xyXG4gICAgaWYgKHRoaXMuX2luZGV4ID09PSBpbmRleCkgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3N3aXRjaEFjdGl2ZUltYWdlKGluZGV4KTsgIFxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gQmFzZUxvZ29Ta2V0Y2g7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gQmFzZUxvZ29Ta2V0Y2goJG5hdiwgJG5hdkxvZ28sIGZvbnRQYXRoKSB7XHJcbiAgICB0aGlzLl8kbmF2ID0gJG5hdjtcclxuICAgIHRoaXMuXyRuYXZMb2dvID0gJG5hdkxvZ287XHJcbiAgICB0aGlzLl9mb250UGF0aCA9IGZvbnRQYXRoO1xyXG5cclxuICAgIHRoaXMuX3RleHQgPSB0aGlzLl8kbmF2TG9nby50ZXh0KCk7XHJcbiAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSB0cnVlO1xyXG4gICAgdGhpcy5faXNNb3VzZU92ZXIgPSBmYWxzZTtcclxuICAgIHRoaXMuX2lzT3Zlck5hdkxvZ28gPSBmYWxzZTtcclxuXHJcbiAgICB0aGlzLl91cGRhdGVUZXh0T2Zmc2V0KCk7XHJcbiAgICB0aGlzLl91cGRhdGVTaXplKCk7XHJcbiAgICB0aGlzLl91cGRhdGVGb250U2l6ZSgpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIChyZWxhdGl2ZSBwb3NpdGlvbmVkKSBjb250YWluZXIgZm9yIHRoZSBza2V0Y2ggaW5zaWRlIG9mIHRoZVxyXG4gICAgLy8gbmF2LCBidXQgbWFrZSBzdXJlIHRoYXQgaXQgaXMgQkVISU5EIGV2ZXJ5dGhpbmcgZWxzZS4gRXZlbnR1YWxseSwgd2Ugd2lsbFxyXG4gICAgLy8gZHJvcCBqdXN0IHRoZSBuYXYgbG9nbyAobm90IHRoZSBuYXYgbGlua3MhKSBiZWhpbmQgdGhlIGNhbnZhcy5cclxuICAgIHRoaXMuXyRjb250YWluZXIgPSAkKFwiPGRpdj5cIilcclxuICAgICAgICAuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICAgICAgdG9wOiBcIjBweFwiLFxyXG4gICAgICAgICAgICBsZWZ0OiBcIjBweFwiXHJcbiAgICAgICAgfSlcclxuICAgICAgICAucHJlcGVuZFRvKHRoaXMuXyRuYXYpXHJcbiAgICAgICAgLmhpZGUoKTtcclxuXHJcbiAgICB0aGlzLl9jcmVhdGVQNUluc3RhbmNlKCk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDcmVhdGUgYSBuZXcgcDUgaW5zdGFuY2UgYW5kIGJpbmQgdGhlIGFwcHJvcHJpYXRlIGNsYXNzIG1ldGhvZHMgdG8gdGhlXHJcbiAqIGluc3RhbmNlLiBUaGlzIGFsc28gZmlsbHMgaW4gdGhlIHAgcGFyYW1ldGVyIG9uIHRoZSBjbGFzcyBtZXRob2RzIChzZXR1cCxcclxuICogZHJhdywgZXRjLikgc28gdGhhdCB0aG9zZSBmdW5jdGlvbnMgY2FuIGJlIGEgbGl0dGxlIGxlc3MgdmVyYm9zZSA6KSBcclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fY3JlYXRlUDVJbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIG5ldyBwNShmdW5jdGlvbihwKSB7XHJcbiAgICAgICAgdGhpcy5fcCA9IHA7XHJcbiAgICAgICAgcC5wcmVsb2FkID0gdGhpcy5fcHJlbG9hZC5iaW5kKHRoaXMsIHApO1xyXG4gICAgICAgIHAuc2V0dXAgPSB0aGlzLl9zZXR1cC5iaW5kKHRoaXMsIHApO1xyXG4gICAgICAgIHAuZHJhdyA9IHRoaXMuX2RyYXcuYmluZCh0aGlzLCBwKTtcclxuICAgIH0uYmluZCh0aGlzKSwgdGhpcy5fJGNvbnRhaW5lci5nZXQoMCkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZpbmQgdGhlIGRpc3RhbmNlIGZyb20gdGhlIHRvcCBsZWZ0IG9mIHRoZSBuYXYgdG8gdGhlIGJyYW5kIGxvZ28ncyBiYXNlbGluZS5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fdXBkYXRlVGV4dE9mZnNldCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBiYXNlbGluZURpdiA9ICQoXCI8ZGl2PlwiKVxyXG4gICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICBkaXNwbGF5OiBcImlubGluZS1ibG9ja1wiLFxyXG4gICAgICAgICAgICB2ZXJ0aWNhbEFsaWduOiBcImJhc2VsaW5lXCJcclxuICAgICAgICB9KS5wcmVwZW5kVG8odGhpcy5fJG5hdkxvZ28pO1xyXG4gICAgdmFyIG5hdk9mZnNldCA9IHRoaXMuXyRuYXYub2Zmc2V0KCk7XHJcbiAgICB2YXIgbG9nb0Jhc2VsaW5lT2Zmc2V0ID0gYmFzZWxpbmVEaXYub2Zmc2V0KCk7XHJcbiAgICB0aGlzLl90ZXh0T2Zmc2V0ID0ge1xyXG4gICAgICAgIHRvcDogbG9nb0Jhc2VsaW5lT2Zmc2V0LnRvcCAtIG5hdk9mZnNldC50b3AsXHJcbiAgICAgICAgbGVmdDogbG9nb0Jhc2VsaW5lT2Zmc2V0LmxlZnQgLSBuYXZPZmZzZXQubGVmdFxyXG4gICAgfTtcclxuICAgIGJhc2VsaW5lRGl2LnJlbW92ZSgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEZpbmQgdGhlIGJvdW5kaW5nIGJveCBvZiB0aGUgYnJhbmQgbG9nbyBpbiB0aGUgbmF2LiBUaGlzIGJib3ggY2FuIHRoZW4gYmUgXHJcbiAqIHVzZWQgdG8gY29udHJvbCB3aGVuIHRoZSBjdXJzb3Igc2hvdWxkIGJlIGEgcG9pbnRlci5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fY2FsY3VsYXRlTmF2TG9nb0JvdW5kcyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBuYXZPZmZzZXQgPSB0aGlzLl8kbmF2Lm9mZnNldCgpO1xyXG4gICAgdmFyIGxvZ29PZmZzZXQgPSB0aGlzLl8kbmF2TG9nby5vZmZzZXQoKTtcclxuICAgIHRoaXMuX2xvZ29CYm94ID0ge1xyXG4gICAgICAgIHk6IGxvZ29PZmZzZXQudG9wIC0gbmF2T2Zmc2V0LnRvcCxcclxuICAgICAgICB4OiBsb2dvT2Zmc2V0LmxlZnQgLSBuYXZPZmZzZXQubGVmdCxcclxuICAgICAgICB3OiB0aGlzLl8kbmF2TG9nby5vdXRlcldpZHRoKCksIC8vIEV4Y2x1ZGUgbWFyZ2luIGZyb20gdGhlIGJib3hcclxuICAgICAgICBoOiB0aGlzLl8kbmF2TG9nby5vdXRlckhlaWdodCgpIC8vIExpbmtzIGFyZW4ndCBjbGlja2FibGUgb24gbWFyZ2luXHJcbiAgICB9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgZGltZW5zaW9ucyB0byBtYXRjaCB0aGUgbmF2IC0gZXhjbHVkaW5nIGFueSBtYXJnaW4sIHBhZGRpbmcgJiBcclxuICogYm9yZGVyLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl91cGRhdGVTaXplID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fd2lkdGggPSB0aGlzLl8kbmF2LmlubmVyV2lkdGgoKTtcclxuICAgIHRoaXMuX2hlaWdodCA9IHRoaXMuXyRuYXYuaW5uZXJIZWlnaHQoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHcmFiIHRoZSBmb250IHNpemUgZnJvbSB0aGUgYnJhbmQgbG9nbyBsaW5rLiBUaGlzIG1ha2VzIHRoZSBmb250IHNpemUgb2YgdGhlXHJcbiAqIHNrZXRjaCByZXNwb25zaXZlLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl91cGRhdGVGb250U2l6ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX2ZvbnRTaXplID0gdGhpcy5fJG5hdkxvZ28uY3NzKFwiZm9udFNpemVcIikucmVwbGFjZShcInB4XCIsIFwiXCIpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFdoZW4gdGhlIGJyb3dzZXIgaXMgcmVzaXplZCwgcmVjYWxjdWxhdGUgYWxsIHRoZSBuZWNlc3Nhcnkgc3RhdHMgc28gdGhhdCB0aGVcclxuICogc2tldGNoIGNhbiBiZSByZXNwb25zaXZlLiBUaGUgbG9nbyBpbiB0aGUgc2tldGNoIHNob3VsZCBBTFdBWVMgZXhhY3RseSBtYXRjaFxyXG4gKiB0aGUgYnJhbmcgbG9nbyBsaW5rIHRoZSBIVE1MLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZSA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICB0aGlzLl91cGRhdGVTaXplKCk7XHJcbiAgICB0aGlzLl91cGRhdGVGb250U2l6ZSgpO1xyXG4gICAgdGhpcy5fdXBkYXRlVGV4dE9mZnNldCgpO1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlTmF2TG9nb0JvdW5kcygpO1xyXG4gICAgcC5yZXNpemVDYW52YXModGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBfaXNNb3VzZU92ZXIgcHJvcGVydHkuIFxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXRNb3VzZU92ZXIgPSBmdW5jdGlvbiAoaXNNb3VzZU92ZXIpIHtcclxuICAgIHRoaXMuX2lzTW91c2VPdmVyID0gaXNNb3VzZU92ZXI7XHJcbn07XHJcblxyXG4vKipcclxuICogSWYgdGhlIGN1cnNvciBpcyBzZXQgdG8gYSBwb2ludGVyLCBmb3J3YXJkIGFueSBjbGljayBldmVudHMgdG8gdGhlIG5hdiBsb2dvLlxyXG4gKiBUaGlzIHJlZHVjZXMgdGhlIG5lZWQgZm9yIHRoZSBjYW52YXMgdG8gZG8gYW55IEFKQVgteSBzdHVmZi5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25DbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBpZiAodGhpcy5faXNPdmVyTmF2TG9nbykgdGhpcy5fJG5hdkxvZ28udHJpZ2dlcihlKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlIHByZWxvYWQgbWV0aG9kIHRoYXQganVzdCBsb2FkcyB0aGUgbmVjZXNzYXJ5IGZvbnRcclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fcHJlbG9hZCA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICB0aGlzLl9mb250ID0gcC5sb2FkRm9udCh0aGlzLl9mb250UGF0aCk7XHJcbn07XHJcblxyXG4vKipcclxuICogQmFzZSBzZXR1cCBtZXRob2QgdGhhdCBkb2VzIHNvbWUgaGVhdnkgbGlmdGluZy4gSXQgaGlkZXMgdGhlIG5hdiBicmFuZCBsb2dvXHJcbiAqIGFuZCByZXZlYWxzIHRoZSBjYW52YXMuIEl0IGFsc28gc2V0cyB1cCBhIGxvdCBvZiB0aGUgaW50ZXJuYWwgdmFyaWFibGVzIGFuZFxyXG4gKiBjYW52YXMgZXZlbnRzLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cCA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICB2YXIgcmVuZGVyZXIgPSBwLmNyZWF0ZUNhbnZhcyh0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcclxuICAgIHRoaXMuXyRjYW52YXMgPSAkKHJlbmRlcmVyLmNhbnZhcyk7XHJcblxyXG4gICAgLy8gU2hvdyB0aGUgY2FudmFzIGFuZCBoaWRlIHRoZSBsb2dvLiBVc2luZyBzaG93L2hpZGUgb24gdGhlIGxvZ28gd2lsbCBjYXVzZVxyXG4gICAgLy8galF1ZXJ5IHRvIG11Y2sgd2l0aCB0aGUgcG9zaXRpb25pbmcsIHdoaWNoIGlzIHVzZWQgdG8gY2FsY3VsYXRlIHdoZXJlIHRvXHJcbiAgICAvLyBkcmF3IHRoZSBjYW52YXMgdGV4dC4gSW5zdGVhZCwganVzdCBwdXNoIHRoZSBsb2dvIGJlaGluZCB0aGUgY2FudmFzLiBUaGlzXHJcbiAgICAvLyBhbGxvd3MgbWFrZXMgaXQgc28gdGhlIGNhbnZhcyBpcyBzdGlsbCBiZWhpbmQgdGhlIG5hdiBsaW5rcy5cclxuICAgIHRoaXMuXyRjb250YWluZXIuc2hvdygpO1xyXG4gICAgdGhpcy5fJG5hdkxvZ28uY3NzKFwiekluZGV4XCIsIC0xKTtcclxuXHJcbiAgICAvLyBUaGVyZSBpc24ndCBhIGdvb2Qgd2F5IHRvIGNoZWNrIHdoZXRoZXIgdGhlIHNrZXRjaCBoYXMgdGhlIG1vdXNlIG92ZXJcclxuICAgIC8vIGl0LiBwLm1vdXNlWCAmIHAubW91c2VZIGFyZSBpbml0aWFsaXplZCB0byAoMCwgMCksIGFuZCBwLmZvY3VzZWQgaXNuJ3QgXHJcbiAgICAvLyBhbHdheXMgcmVsaWFibGUuXHJcbiAgICB0aGlzLl8kY2FudmFzLm9uKFwibW91c2VvdmVyXCIsIHRoaXMuX3NldE1vdXNlT3Zlci5iaW5kKHRoaXMsIHRydWUpKTtcclxuICAgIHRoaXMuXyRjYW52YXMub24oXCJtb3VzZW91dFwiLCB0aGlzLl9zZXRNb3VzZU92ZXIuYmluZCh0aGlzLCBmYWxzZSkpO1xyXG5cclxuICAgIC8vIEZvcndhcmQgbW91c2UgY2xpY2tzIHRvIHRoZSBuYXYgbG9nb1xyXG4gICAgdGhpcy5fJGNhbnZhcy5vbihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgd2luZG93IGlzIHJlc2l6ZWQsIHRleHQgJiBjYW52YXMgc2l6aW5nIGFuZCBwbGFjZW1lbnQgbmVlZCB0byBiZVxyXG4gICAgLy8gcmVjYWxjdWxhdGVkLiBUaGUgc2l0ZSBpcyByZXNwb25zaXZlLCBzbyB0aGUgaW50ZXJhY3RpdmUgY2FudmFzIHNob3VsZCBiZVxyXG4gICAgLy8gdG9vISBcclxuICAgICQod2luZG93KS5vbihcInJlc2l6ZVwiLCB0aGlzLl9vblJlc2l6ZS5iaW5kKHRoaXMsIHApKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlIGRyYXcgbWV0aG9kIHRoYXQgY29udHJvbHMgd2hldGhlciBvciBub3QgdGhlIGN1cnNvciBpcyBhIHBvaW50ZXIuIEl0XHJcbiAqIHNob3VsZCBvbmx5IGJlIGEgcG9pbnRlciB3aGVuIHRoZSBtb3VzZSBpcyBvdmVyIHRoZSBuYXYgYnJhbmQgbG9nby5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fZHJhdyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBpZiAodGhpcy5faXNNb3VzZU92ZXIpIHtcclxuICAgICAgICB2YXIgaXNPdmVyTG9nbyA9IHV0aWxzLmlzSW5SZWN0KHAubW91c2VYLCBwLm1vdXNlWSwgdGhpcy5fbG9nb0Jib3gpO1xyXG4gICAgICAgIGlmICghdGhpcy5faXNPdmVyTmF2TG9nbyAmJiBpc092ZXJMb2dvKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzT3Zlck5hdkxvZ28gPSB0cnVlO1xyXG4gICAgICAgICAgICB0aGlzLl8kY2FudmFzLmNzcyhcImN1cnNvclwiLCBcInBvaW50ZXJcIik7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9pc092ZXJOYXZMb2dvICYmICFpc092ZXJMb2dvKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2lzT3Zlck5hdkxvZ28gPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5fJGNhbnZhcy5jc3MoXCJjdXJzb3JcIiwgXCJpbml0aWFsXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IFNrZXRjaDtcclxuXHJcbnZhciBCYm94VGV4dCA9IHJlcXVpcmUoXCJwNS1iYm94LWFsaWduZWQtdGV4dFwiKTtcclxudmFyIEJhc2VMb2dvU2tldGNoID0gcmVxdWlyZShcIi4vYmFzZS1sb2dvLXNrZXRjaC5qc1wiKTtcclxudmFyIFNpbkdlbmVyYXRvciA9IHJlcXVpcmUoXCIuL2dlbmVyYXRvcnMvc2luLWdlbmVyYXRvci5qc1wiKTtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUpO1xyXG5cclxuZnVuY3Rpb24gU2tldGNoKCRuYXYsICRuYXZMb2dvKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5jYWxsKHRoaXMsICRuYXYsICRuYXZMb2dvLCBcIi4uL2ZvbnRzL2JpZ19qb2huLXdlYmZvbnQudHRmXCIpO1xyXG59XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZSA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplLmNhbGwodGhpcywgcCk7XHJcbiAgICB0aGlzLl9zcGFjaW5nID0gdXRpbHMubWFwKHRoaXMuX2ZvbnRTaXplLCAyMCwgNDAsIDIsIDUsIHtjbGFtcDogdHJ1ZSwgXHJcbiAgICAgICAgcm91bmQ6IHRydWV9KTtcclxuICAgIC8vIFVwZGF0ZSB0aGUgYmJveFRleHQsIHBsYWNlIG92ZXIgdGhlIG5hdiB0ZXh0IGxvZ28gYW5kIHRoZW4gc2hpZnQgaXRzIFxyXG4gICAgLy8gYW5jaG9yIGJhY2sgdG8gKGNlbnRlciwgY2VudGVyKSB3aGlsZSBwcmVzZXJ2aW5nIHRoZSB0ZXh0IHBvc2l0aW9uXHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRUZXh0KHRoaXMuX3RleHQpXHJcbiAgICAgICAgLnNldFRleHRTaXplKHRoaXMuX2ZvbnRTaXplKVxyXG4gICAgICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0xFRlQsIEJib3hUZXh0LkJBU0VMSU5FLkFMUEhBQkVUSUMpXHJcbiAgICAgICAgLnNldFBvc2l0aW9uKHRoaXMuX3RleHRPZmZzZXQubGVmdCwgdGhpcy5fdGV4dE9mZnNldC50b3ApXHJcbiAgICAgICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfQ0VOVEVSLCBCYm94VGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSLCBcclxuICAgICAgICAgICAgdHJ1ZSk7XHJcbiAgICB0aGlzLl9kcmF3U3RhdGlvbmFyeUxvZ28ocCk7XHJcbiAgICB0aGlzLl9wb2ludHMgPSB0aGlzLl9iYm94VGV4dC5nZXRUZXh0UG9pbnRzKCk7XHJcbiAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSB0cnVlO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhd1N0YXRpb25hcnlMb2dvID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgcC5zdHJva2UoMjU1KTtcclxuICAgIHAuZmlsbChcIiMwQTAwMEFcIik7XHJcbiAgICBwLnN0cm9rZVdlaWdodCgyKTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LmRyYXcoKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX3NldHVwID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fc2V0dXAuY2FsbCh0aGlzLCBwKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBCYm94QWxpZ25lZFRleHQgaW5zdGFuY2UgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIGRyYXdpbmcgYW5kIFxyXG4gICAgLy8gcm90YXRpbmcgdGV4dFxyXG4gICAgdGhpcy5fYmJveFRleHQgPSBuZXcgQmJveFRleHQodGhpcy5fZm9udCwgdGhpcy5fdGV4dCwgdGhpcy5fZm9udFNpemUsIDAsIDAsXHJcbiAgICAgICAgcCk7XHJcblxyXG4gICAgLy8gSGFuZGxlIHRoZSBpbml0aWFsIHNldHVwIGJ5IHRyaWdnZXJpbmcgYSByZXNpemVcclxuICAgIHRoaXMuX29uUmVzaXplKHApO1xyXG5cclxuICAgIC8vIERyYXcgdGhlIHN0YXRpb25hcnkgbG9nb1xyXG4gICAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG5cclxuICAgIC8vIFN0YXJ0IHRoZSBzaW4gZ2VuZXJhdG9yIGF0IGl0cyBtYXggdmFsdWVcclxuICAgIHRoaXMuX3RocmVzaG9sZEdlbmVyYXRvciA9IG5ldyBTaW5HZW5lcmF0b3IocCwgMCwgMSwgMC4wMiwgcC5QSS8yKTsgXHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fZHJhdy5jYWxsKHRoaXMsIHApO1xyXG4gICAgaWYgKCF0aGlzLl9pc01vdXNlT3ZlciB8fCAhdGhpcy5faXNPdmVyTmF2TG9nbykgcmV0dXJuO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHRleHQgaXMgYWJvdXQgdG8gYmVjb21lIGFjdGl2ZSBmb3IgdGhlIGZpcnN0IHRpbWUsIGNsZWFyXHJcbiAgICAvLyB0aGUgc3RhdGlvbmFyeSBsb2dvIHRoYXQgd2FzIHByZXZpb3VzbHkgZHJhd24uIFxyXG4gICAgaWYgKHRoaXMuX2lzRmlyc3RGcmFtZSkge1xyXG4gICAgICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLl9mb250U2l6ZSA+IDMwKSB7XHJcbiAgICAgICAgdGhpcy5fdGhyZXNob2xkR2VuZXJhdG9yLnNldEJvdW5kcygwLjIgKiB0aGlzLl9iYm94VGV4dC5oZWlnaHQsIFxyXG4gICAgICAgICAgICAwLjQ3ICogdGhpcy5fYmJveFRleHQuaGVpZ2h0KTsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgdGhpcy5fdGhyZXNob2xkR2VuZXJhdG9yLnNldEJvdW5kcygwLjIgKiB0aGlzLl9iYm94VGV4dC5oZWlnaHQsIFxyXG4gICAgICAgICAgICAwLjYgKiB0aGlzLl9iYm94VGV4dC5oZWlnaHQpOyAgICAgICAgICBcclxuICAgIH1cclxuICAgIHZhciBkaXN0YW5jZVRocmVzaG9sZCA9IHRoaXMuX3RocmVzaG9sZEdlbmVyYXRvci5nZW5lcmF0ZSgpO1xyXG4gICAgXHJcbiAgICBwLmJhY2tncm91bmQoMjU1LCAxMDApO1xyXG4gICAgcC5zdHJva2VXZWlnaHQoMSk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3BvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBwb2ludDEgPSB0aGlzLl9wb2ludHNbaV07XHJcbiAgICAgICAgZm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgdGhpcy5fcG9pbnRzLmxlbmd0aDsgaiArPSAxKSB7XHJcbiAgICAgICAgICAgIHZhciBwb2ludDIgPSB0aGlzLl9wb2ludHNbal07XHJcbiAgICAgICAgICAgIHZhciBkaXN0ID0gcC5kaXN0KHBvaW50MS54LCBwb2ludDEueSwgcG9pbnQyLngsIHBvaW50Mi55KTtcclxuICAgICAgICAgICAgaWYgKGRpc3QgPCBkaXN0YW5jZVRocmVzaG9sZCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHAubm9TdHJva2UoKTtcclxuICAgICAgICAgICAgICAgIHAuZmlsbChcInJnYmEoMTY1LCAwLCAxNzMsIDAuMjUpXCIpO1xyXG4gICAgICAgICAgICAgICAgcC5lbGxpcHNlKChwb2ludDEueCArIHBvaW50Mi54KSAvIDIsIChwb2ludDEueSArIHBvaW50Mi55KSAvIDIsXHJcbiAgICAgICAgICAgICAgICAgICAgZGlzdCwgZGlzdCk7ICBcclxuXHJcbiAgICAgICAgICAgICAgICBwLnN0cm9rZShcInJnYmEoMTY1LCAwLCAxNzMsIDAuMjUpXCIpO1xyXG4gICAgICAgICAgICAgICAgcC5ub0ZpbGwoKTtcclxuICAgICAgICAgICAgICAgIHAubGluZShwb2ludDEueCwgcG9pbnQxLnksIHBvaW50Mi54LCBwb2ludDIueSk7ICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIE5vaXNlR2VuZXJhdG9yMUQ6IE5vaXNlR2VuZXJhdG9yMUQsXHJcbiAgICBOb2lzZUdlbmVyYXRvcjJEOiBOb2lzZUdlbmVyYXRvcjJEXHJcbn07XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuLy8gLS0gMUQgTm9pc2UgR2VuZXJhdG9yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBBIHV0aWxpdHkgY2xhc3MgZm9yIGdlbmVyYXRpbmcgbm9pc2UgdmFsdWVzXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge29iamVjdH0gcCAgICAgICAgICAgICAgIFJlZmVyZW5jZSB0byBhIHA1IHNrZXRjaFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW21pbj0wXSAgICAgICAgIE1pbmltdW0gdmFsdWUgZm9yIHRoZSBub2lzZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW21heD0xXSAgICAgICAgIE1heGltdW0gdmFsdWUgZm9yIHRoZSBub2lzZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW2luY3JlbWVudD0wLjFdIFNjYWxlIG9mIHRoZSBub2lzZSwgdXNlZCB3aGVuIHVwZGF0aW5nXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb2Zmc2V0PXJhbmRvbV0gQSB2YWx1ZSB1c2VkIHRvIGVuc3VyZSBtdWx0aXBsZSBub2lzZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRvcnMgYXJlIHJldHVybmluZyBcImluZGVwZW5kZW50XCIgdmFsdWVzXHJcbiAqL1xyXG5mdW5jdGlvbiBOb2lzZUdlbmVyYXRvcjFEKHAsIG1pbiwgbWF4LCBpbmNyZW1lbnQsIG9mZnNldCkge1xyXG4gICAgdGhpcy5fcCA9IHA7XHJcbiAgICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgMCk7XHJcbiAgICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgMSk7XHJcbiAgICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGluY3JlbWVudCwgMC4xKTtcclxuICAgIHRoaXMuX3Bvc2l0aW9uID0gdXRpbHMuZGVmYXVsdChvZmZzZXQsIHAucmFuZG9tKC0xMDAwMDAwLCAxMDAwMDAwKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG1pbiBhbmQgbWF4IG5vaXNlIHZhbHVlc1xyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IG1pbiBNaW5pbXVtIG5vaXNlIHZhbHVlXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWF4IE1heGltdW0gbm9pc2UgdmFsdWVcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xyXG4gICAgdGhpcy5fbWluID0gdXRpbHMuZGVmYXVsdChtaW4sIHRoaXMuX21pbik7XHJcbiAgICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgdGhpcy5fbWF4KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG5vaXNlIGluY3JlbWVudCAoZS5nLiBzY2FsZSlcclxuICogQHBhcmFtICB7bnVtYmVyfSBpbmNyZW1lbnQgTmV3IGluY3JlbWVudCAoc2NhbGUpIHZhbHVlXHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjFELnByb3RvdHlwZS5zZXRJbmNyZW1lbnQgPSBmdW5jdGlvbiAoaW5jcmVtZW50KSB7XHJcbiAgICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGluY3JlbWVudCwgdGhpcy5faW5jcmVtZW50KTtcclxufTtcclxuXHJcbi8qKiBcclxuICogR2VuZXJhdGUgdGhlIG5leHQgbm9pc2UgdmFsdWVcclxuICogQHJldHVybiB7bnVtYmVyfSBBIG5vaXN5IHZhbHVlIGJldHdlZW4gb2JqZWN0J3MgbWluIGFuZCBtYXhcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICB2YXIgbiA9IHRoaXMuX3Aubm9pc2UodGhpcy5fcG9zaXRpb24pO1xyXG4gICAgbiA9IHRoaXMuX3AubWFwKG4sIDAsIDEsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcclxuICAgIHJldHVybiBuO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEludGVybmFsIHVwZGF0ZSBtZXRob2QgZm9yIGdlbmVyYXRpbmcgbmV4dCBub2lzZSB2YWx1ZVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IxRC5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX3Bvc2l0aW9uICs9IHRoaXMuX2luY3JlbWVudDtcclxufTtcclxuXHJcblxyXG4vLyAtLSAyRCBOb2lzZSBHZW5lcmF0b3IgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZnVuY3Rpb24gTm9pc2VHZW5lcmF0b3IyRChwLCB4TWluLCB4TWF4LCB5TWluLCB5TWF4LCB4SW5jcmVtZW50LCB5SW5jcmVtZW50LCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB4T2Zmc2V0LCB5T2Zmc2V0KSB7XHJcbiAgICB0aGlzLl94Tm9pc2UgPSBuZXcgTm9pc2VHZW5lcmF0b3IxRChwLCB4TWluLCB4TWF4LCB4SW5jcmVtZW50LCB4T2Zmc2V0KTtcclxuICAgIHRoaXMuX3lOb2lzZSA9IG5ldyBOb2lzZUdlbmVyYXRvcjFEKHAsIHlNaW4sIHlNYXgsIHlJbmNyZW1lbnQsIHlPZmZzZXQpO1xyXG4gICAgdGhpcy5fcCA9IHA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG1pbiBhbmQgbWF4IG5vaXNlIHZhbHVlc1xyXG4gKiBAcGFyYW0gIHtvYmplY3R9IG9wdGlvbnMgT2JqZWN0IHdpdGggYm91bmRzIHRvIGJlIHVwZGF0ZWQgZS5nLiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHsgeE1pbjogMCwgeE1heDogMSwgeU1pbjogLTEsIHlNYXg6IDEgfVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IyRC5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgIGlmICghb3B0aW9ucykgcmV0dXJuOyAgXHJcbiAgICB0aGlzLl94Tm9pc2Uuc2V0Qm91bmRzKG9wdGlvbnMueE1pbiwgb3B0aW9ucy54TWF4KTtcclxuICAgIHRoaXMuX3lOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy55TWluLCBvcHRpb25zLnlNYXgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgaW5jcmVtZW50IChlLmcuIHNjYWxlKSBmb3IgdGhlIG5vaXNlIGdlbmVyYXRvclxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IG9wdGlvbnMgT2JqZWN0IHdpdGggYm91bmRzIHRvIGJlIHVwZGF0ZWQgZS5nLiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHsgeEluY3JlbWVudDogMC4wNSwgeUluY3JlbWVudDogMC4xIH1cclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMkQucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICBpZiAoIW9wdGlvbnMpIHJldHVybjtcclxuICAgIHRoaXMuX3hOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy54SW5jcmVtZW50KTtcclxuICAgIHRoaXMuX3lOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy55SW5jcmVtZW50KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZSB0aGUgbmV4dCBwYWlyIG9mIG5vaXNlIHZhbHVlc1xyXG4gKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCB3aXRoIHggYW5kIHkgcHJvcGVydGllcyB0aGF0IGNvbnRhaW4gdGhlIG5leHQgbm9pc2VcclxuICogICAgICAgICAgICAgICAgICB2YWx1ZXMgYWxvbmcgZWFjaCBkaW1lbnNpb25cclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMkQucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiB0aGlzLl94Tm9pc2UuZ2VuZXJhdGUoKSxcclxuICAgICAgICB5OiB0aGlzLl95Tm9pc2UuZ2VuZXJhdGUoKVxyXG4gICAgfTtcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IFNpbkdlbmVyYXRvcjtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG4vKipcclxuICogQSB1dGlsaXR5IGNsYXNzIGZvciBnZW5lcmF0aW5nIHZhbHVlcyBhbG9uZyBhIHNpbndhdmVcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwICAgICAgICAgICAgICAgUmVmZXJlbmNlIHRvIGEgcDUgc2tldGNoXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWluPTBdICAgICAgICAgTWluaW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWF4PTFdICAgICAgICAgTWF4aW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbaW5jcmVtZW50PTAuMV0gSW5jcmVtZW50IHVzZWQgd2hlbiB1cGRhdGluZ1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW29mZnNldD1yYW5kb21dIFdoZXJlIHRvIHN0YXJ0IGFsb25nIHRoZSBzaW5ld2F2ZVxyXG4gKi9cclxuZnVuY3Rpb24gU2luR2VuZXJhdG9yKHAsIG1pbiwgbWF4LCBhbmdsZUluY3JlbWVudCwgc3RhcnRpbmdBbmdsZSkge1xyXG4gICAgdGhpcy5fcCA9IHA7XHJcbiAgICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgMCk7XHJcbiAgICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgMCk7XHJcbiAgICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGFuZ2xlSW5jcmVtZW50LCAwLjEpO1xyXG4gICAgdGhpcy5fYW5nbGUgPSB1dGlscy5kZWZhdWx0KHN0YXJ0aW5nQW5nbGUsIHAucmFuZG9tKC0xMDAwMDAwLCAxMDAwMDAwKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG1pbiBhbmQgbWF4IHZhbHVlc1xyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IG1pbiBNaW5pbXVtIHZhbHVlXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWF4IE1heGltdW0gdmFsdWVcclxuICovXHJcblNpbkdlbmVyYXRvci5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XHJcbiAgICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgdGhpcy5fbWluKTtcclxuICAgIHRoaXMuX21heCA9IHV0aWxzLmRlZmF1bHQobWF4LCB0aGlzLl9tYXgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgYW5nbGUgaW5jcmVtZW50IChlLmcuIGhvdyBmYXN0IHdlIG1vdmUgdGhyb3VnaCB0aGUgc2lud2F2ZSlcclxuICogQHBhcmFtICB7bnVtYmVyfSBpbmNyZW1lbnQgTmV3IGluY3JlbWVudCB2YWx1ZVxyXG4gKi9cclxuU2luR2VuZXJhdG9yLnByb3RvdHlwZS5zZXRJbmNyZW1lbnQgPSBmdW5jdGlvbiAoaW5jcmVtZW50KSB7XHJcbiAgICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGluY3JlbWVudCwgdGhpcy5faW5jcmVtZW50KTtcclxufTtcclxuXHJcbi8qKiBcclxuICogR2VuZXJhdGUgdGhlIG5leHQgdmFsdWVcclxuICogQHJldHVybiB7bnVtYmVyfSBBIHZhbHVlIGJldHdlZW4gZ2VuZXJhdG9ycydzIG1pbiBhbmQgbWF4XHJcbiAqL1xyXG5TaW5HZW5lcmF0b3IucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICB2YXIgbiA9IHRoaXMuX3Auc2luKHRoaXMuX2FuZ2xlKTtcclxuICAgIG4gPSB0aGlzLl9wLm1hcChuLCAtMSwgMSwgdGhpcy5fbWluLCB0aGlzLl9tYXgpO1xyXG4gICAgcmV0dXJuIG47XHJcbn07XHJcblxyXG4vKipcclxuICogSW50ZXJuYWwgdXBkYXRlIG1ldGhvZCBmb3IgZ2VuZXJhdGluZyBuZXh0IHZhbHVlXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5TaW5HZW5lcmF0b3IucHJvdG90eXBlLl91cGRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9hbmdsZSArPSB0aGlzLl9pbmNyZW1lbnQ7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBTa2V0Y2g7XHJcblxyXG52YXIgQmJveFRleHQgPSByZXF1aXJlKFwicDUtYmJveC1hbGlnbmVkLXRleHRcIik7XHJcbnZhciBCYXNlTG9nb1NrZXRjaCA9IHJlcXVpcmUoXCIuL2Jhc2UtbG9nby1za2V0Y2guanNcIik7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuU2tldGNoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlKTtcclxuXHJcbmZ1bmN0aW9uIFNrZXRjaCgkbmF2LCAkbmF2TG9nbykge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2guY2FsbCh0aGlzLCAkbmF2LCAkbmF2TG9nbywgXCIuLi9mb250cy9iaWdfam9obi13ZWJmb250LnR0ZlwiKTtcclxufVxyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZS5jYWxsKHRoaXMsIHApO1xyXG4gICAgdGhpcy5fc3BhY2luZyA9IHV0aWxzLm1hcCh0aGlzLl9mb250U2l6ZSwgMjAsIDQwLCAyLCA1LCB7Y2xhbXA6IHRydWUsIFxyXG4gICAgICAgIHJvdW5kOiB0cnVlfSk7XHJcbiAgICAvLyBVcGRhdGUgdGhlIGJib3hUZXh0LCBwbGFjZSBvdmVyIHRoZSBuYXYgdGV4dCBsb2dvIGFuZCB0aGVuIHNoaWZ0IGl0cyBcclxuICAgIC8vIGFuY2hvciBiYWNrIHRvIChjZW50ZXIsIGNlbnRlcikgd2hpbGUgcHJlc2VydmluZyB0aGUgdGV4dCBwb3NpdGlvblxyXG4gICAgdGhpcy5fYmJveFRleHQuc2V0VGV4dCh0aGlzLl90ZXh0KVxyXG4gICAgICAgIC5zZXRUZXh0U2l6ZSh0aGlzLl9mb250U2l6ZSlcclxuICAgICAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9MRUZULCBCYm94VGV4dC5CQVNFTElORS5BTFBIQUJFVElDKVxyXG4gICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLl90ZXh0T2Zmc2V0LmxlZnQsIHRoaXMuX3RleHRPZmZzZXQudG9wKVxyXG4gICAgICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0NFTlRFUiwgQmJveFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUiwgXHJcbiAgICAgICAgICAgIHRydWUpO1xyXG4gICAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlQ2lyY2xlcyhwKTtcclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3U3RhdGlvbmFyeUxvZ28gPSBmdW5jdGlvbiAocCkge1xyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICBwLnN0cm9rZSgyNTUpO1xyXG4gICAgcC5maWxsKFwiIzBBMDAwQVwiKTtcclxuICAgIHAuc3Ryb2tlV2VpZ2h0KDIpO1xyXG4gICAgdGhpcy5fYmJveFRleHQuZHJhdygpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fc2V0dXAgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cC5jYWxsKHRoaXMsIHApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIEJib3hBbGlnbmVkVGV4dCBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZHJhd2luZyBhbmQgXHJcbiAgICAvLyByb3RhdGluZyB0ZXh0XHJcbiAgICB0aGlzLl9iYm94VGV4dCA9IG5ldyBCYm94VGV4dCh0aGlzLl9mb250LCB0aGlzLl90ZXh0LCB0aGlzLl9mb250U2l6ZSwgMCwgMCwgXHJcbiAgICAgICAgcCk7XHJcblxyXG4gICAgLy8gSGFuZGxlIHRoZSBpbml0aWFsIHNldHVwIGJ5IHRyaWdnZXJpbmcgYSByZXNpemVcclxuICAgIHRoaXMuX29uUmVzaXplKHApO1xyXG5cclxuICAgIC8vIERyYXcgdGhlIHN0YXRpb25hcnkgbG9nb1xyXG4gICAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG5cclxuICAgIHRoaXMuX2NhbGN1bGF0ZUNpcmNsZXMocCk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9jYWxjdWxhdGVDaXJjbGVzID0gZnVuY3Rpb24gKHApIHtcclxuICAgIC8vIFRPRE86IERvbid0IG5lZWQgQUxMIHRoZSBwaXhlbHMuIFRoaXMgY291bGQgaGF2ZSBhbiBvZmZzY3JlZW4gcmVuZGVyZXJcclxuICAgIC8vIHRoYXQgaXMganVzdCBiaWcgZW5vdWdoIHRvIGZpdCB0aGUgdGV4dC5cclxuICAgIC8vIExvb3Agb3ZlciB0aGUgcGl4ZWxzIGluIHRoZSB0ZXh0J3MgYm91bmRpbmcgYm94IHRvIHNhbXBsZSB0aGUgd29yZFxyXG4gICAgdmFyIGJib3ggPSB0aGlzLl9iYm94VGV4dC5nZXRCYm94KCk7XHJcbiAgICB2YXIgc3RhcnRYID0gTWF0aC5mbG9vcihNYXRoLm1heChiYm94LnggLSA1LCAwKSk7XHJcbiAgICB2YXIgZW5kWCA9IE1hdGguY2VpbChNYXRoLm1pbihiYm94LnggKyBiYm94LncgKyA1LCBwLndpZHRoKSk7XHJcbiAgICB2YXIgc3RhcnRZID0gTWF0aC5mbG9vcihNYXRoLm1heChiYm94LnkgLSA1LCAwKSk7XHJcbiAgICB2YXIgZW5kWSA9IE1hdGguY2VpbChNYXRoLm1pbihiYm94LnkgKyBiYm94LmggKyA1LCBwLmhlaWdodCkpO1xyXG4gICAgcC5sb2FkUGl4ZWxzKCk7XHJcbiAgICBwLnBpeGVsRGVuc2l0eSgxKTtcclxuICAgIHRoaXMuX2NpcmNsZXMgPSBbXTtcclxuICAgIGZvciAodmFyIHkgPSBzdGFydFk7IHkgPCBlbmRZOyB5ICs9IHRoaXMuX3NwYWNpbmcpIHtcclxuICAgICAgICBmb3IgKHZhciB4ID0gc3RhcnRYOyB4IDwgZW5kWDsgeCArPSB0aGlzLl9zcGFjaW5nKSB7ICBcclxuICAgICAgICAgICAgdmFyIGkgPSA0ICogKCh5ICogcC53aWR0aCkgKyB4KTtcclxuICAgICAgICAgICAgdmFyIHIgPSBwLnBpeGVsc1tpXTtcclxuICAgICAgICAgICAgdmFyIGcgPSBwLnBpeGVsc1tpICsgMV07XHJcbiAgICAgICAgICAgIHZhciBiID0gcC5waXhlbHNbaSArIDJdO1xyXG4gICAgICAgICAgICB2YXIgYSA9IHAucGl4ZWxzW2kgKyAzXTtcclxuICAgICAgICAgICAgdmFyIGMgPSBwLmNvbG9yKHIsIGcsIGIsIGEpO1xyXG4gICAgICAgICAgICBpZiAocC5zYXR1cmF0aW9uKGMpID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2lyY2xlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4ICsgcC5yYW5kb20oLTIvMyAqIHRoaXMuX3NwYWNpbmcsIDIvMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHkgKyBwLnJhbmRvbSgtMi8zICogdGhpcy5fc3BhY2luZywgMi8zICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IHAuY29sb3IoXCIjMDZGRkZGXCIpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NpcmNsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeCArIHAucmFuZG9tKC0yLzMgKiB0aGlzLl9zcGFjaW5nLCAyLzMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgICAgICAgICAgICB5OiB5ICsgcC5yYW5kb20oLTIvMyAqIHRoaXMuX3NwYWNpbmcsIDIvMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBwLmNvbG9yKFwiI0ZFMDBGRVwiKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jaXJjbGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHggKyBwLnJhbmRvbSgtMi8zICogdGhpcy5fc3BhY2luZywgMi8zICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogeSArIHAucmFuZG9tKC0yLzMgKiB0aGlzLl9zcGFjaW5nLCAyLzMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogcC5jb2xvcihcIiNGRkZGMDRcIilcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhdyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2RyYXcuY2FsbCh0aGlzLCBwKTtcclxuICAgIGlmICghdGhpcy5faXNNb3VzZU92ZXIgfHwgIXRoaXMuX2lzT3Zlck5hdkxvZ28pIHJldHVybjtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSB0ZXh0IGlzIGFib3V0IHRvIGJlY29tZSBhY3RpdmUgZm9yIHRoZSBmaXJzdCB0aW1lLCBjbGVhclxyXG4gICAgLy8gdGhlIHN0YXRpb25hcnkgbG9nbyB0aGF0IHdhcyBwcmV2aW91c2x5IGRyYXduLiBcclxuICAgIGlmICh0aGlzLl9pc0ZpcnN0RnJhbWUpIHtcclxuICAgICAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgICAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBDbGVhclxyXG4gICAgcC5ibGVuZE1vZGUocC5CTEVORCk7XHJcbiAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuXHJcbiAgICAvLyBEcmF3IFwiaGFsZnRvbmVcIiBsb2dvXHJcbiAgICBwLm5vU3Ryb2tlKCk7ICAgXHJcbiAgICBwLmJsZW5kTW9kZShwLk1VTFRJUExZKTtcclxuXHJcbiAgICB2YXIgbWF4RGlzdCA9IHRoaXMuX2Jib3hUZXh0LmhhbGZXaWR0aDtcclxuICAgIHZhciBtYXhSYWRpdXMgPSAyICogdGhpcy5fc3BhY2luZztcclxuXHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2NpcmNsZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgY2lyY2xlID0gdGhpcy5fY2lyY2xlc1tpXTtcclxuICAgICAgICB2YXIgYyA9IGNpcmNsZS5jb2xvcjtcclxuICAgICAgICB2YXIgZGlzdCA9IHAuZGlzdChjaXJjbGUueCwgY2lyY2xlLnksIHAubW91c2VYLCBwLm1vdXNlWSk7XHJcbiAgICAgICAgdmFyIHJhZGl1cyA9IHV0aWxzLm1hcChkaXN0LCAwLCBtYXhEaXN0LCAxLCBtYXhSYWRpdXMsIHtjbGFtcDogdHJ1ZX0pO1xyXG4gICAgICAgIHAuZmlsbChjKTtcclxuICAgICAgICBwLmVsbGlwc2UoY2lyY2xlLngsIGNpcmNsZS55LCByYWRpdXMsIHJhZGl1cyk7XHJcbiAgICB9XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBTa2V0Y2g7XHJcblxyXG52YXIgTm9pc2UgPSByZXF1aXJlKFwiLi9nZW5lcmF0b3JzL25vaXNlLWdlbmVyYXRvcnMuanNcIik7XHJcbnZhciBCYm94VGV4dCA9IHJlcXVpcmUoXCJwNS1iYm94LWFsaWduZWQtdGV4dFwiKTtcclxudmFyIEJhc2VMb2dvU2tldGNoID0gcmVxdWlyZShcIi4vYmFzZS1sb2dvLXNrZXRjaC5qc1wiKTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZSk7XHJcblxyXG5mdW5jdGlvbiBTa2V0Y2goJG5hdiwgJG5hdkxvZ28pIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLmNhbGwodGhpcywgJG5hdiwgJG5hdkxvZ28sIFwiLi4vZm9udHMvYmlnX2pvaG4td2ViZm9udC50dGZcIik7XHJcbn1cclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUuY2FsbCh0aGlzLCBwKTtcclxuICAgIC8vIFVwZGF0ZSB0aGUgYmJveFRleHQsIHBsYWNlIG92ZXIgdGhlIG5hdiB0ZXh0IGxvZ28gYW5kIHRoZW4gc2hpZnQgaXRzIFxyXG4gICAgLy8gYW5jaG9yIGJhY2sgdG8gKGNlbnRlciwgY2VudGVyKSB3aGlsZSBwcmVzZXJ2aW5nIHRoZSB0ZXh0IHBvc2l0aW9uXHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRUZXh0KHRoaXMuX3RleHQpXHJcbiAgICAgICAgLnNldFRleHRTaXplKHRoaXMuX2ZvbnRTaXplKVxyXG4gICAgICAgIC5zZXRSb3RhdGlvbigwKVxyXG4gICAgICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0xFRlQsIEJib3hUZXh0LkJBU0VMSU5FLkFMUEhBQkVUSUMpXHJcbiAgICAgICAgLnNldFBvc2l0aW9uKHRoaXMuX3RleHRPZmZzZXQubGVmdCwgdGhpcy5fdGV4dE9mZnNldC50b3ApXHJcbiAgICAgICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfQ0VOVEVSLCBCYm94VGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSLCBcclxuICAgICAgICAgICAgdHJ1ZSk7XHJcbiAgICB0aGlzLl90ZXh0UG9zID0gdGhpcy5fYmJveFRleHQuZ2V0UG9zaXRpb24oKTtcclxuICAgIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3U3RhdGlvbmFyeUxvZ28gPSBmdW5jdGlvbiAocCkge1xyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICBwLnN0cm9rZSgyNTUpO1xyXG4gICAgcC5maWxsKFwiIzBBMDAwQVwiKTtcclxuICAgIHAuc3Ryb2tlV2VpZ2h0KDIpO1xyXG4gICAgdGhpcy5fYmJveFRleHQuZHJhdygpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fc2V0dXAgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cC5jYWxsKHRoaXMsIHApO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIEJib3hBbGlnbmVkVGV4dCBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZHJhd2luZyBhbmQgXHJcbiAgICAvLyByb3RhdGluZyB0ZXh0XHJcbiAgICB0aGlzLl9iYm94VGV4dCA9IG5ldyBCYm94VGV4dCh0aGlzLl9mb250LCB0aGlzLl90ZXh0LCB0aGlzLl9mb250U2l6ZSwgMCwgMCwgXHJcbiAgICAgICAgcCk7XHJcblxyXG4gICAgLy8gSGFuZGxlIHRoZSBpbml0aWFsIHNldHVwIGJ5IHRyaWdnZXJpbmcgYSByZXNpemVcclxuICAgIHRoaXMuX29uUmVzaXplKHApO1xyXG5cclxuICAgIC8vIFNldCB1cCBub2lzZSBnZW5lcmF0b3JzXHJcbiAgICB0aGlzLl9yb3RhdGlvbk5vaXNlID0gbmV3IE5vaXNlLk5vaXNlR2VuZXJhdG9yMUQocCwgLXAuUEkvNCwgcC5QSS80LCAwLjAyKTsgXHJcbiAgICB0aGlzLl94eU5vaXNlID0gbmV3IE5vaXNlLk5vaXNlR2VuZXJhdG9yMkQocCwgLTEwMCwgMTAwLCAtNTAsIDUwLCAwLjAxLCBcclxuICAgICAgICAwLjAxKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9kcmF3LmNhbGwodGhpcywgcCk7XHJcbiAgICBpZiAoIXRoaXMuX2lzTW91c2VPdmVyIHx8ICF0aGlzLl9pc092ZXJOYXZMb2dvKSByZXR1cm47XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgdGV4dCBpcyBhYm91dCB0byBiZWNvbWUgYWN0aXZlIGZvciB0aGUgZmlyc3QgdGltZSwgY2xlYXJcclxuICAgIC8vIHRoZSBzdGF0aW9uYXJ5IGxvZ28gdGhhdCB3YXMgcHJldmlvdXNseSBkcmF3bi4gXHJcbiAgICBpZiAodGhpcy5faXNGaXJzdEZyYW1lKSB7XHJcbiAgICAgICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICAgICAgdGhpcy5faXNGaXJzdEZyYW1lID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2FsY3VsYXRlIHBvc2l0aW9uIGFuZCByb3RhdGlvbiB0byBjcmVhdGUgYSBqaXR0ZXJ5IGxvZ29cclxuICAgIHZhciByb3RhdGlvbiA9IHRoaXMuX3JvdGF0aW9uTm9pc2UuZ2VuZXJhdGUoKTtcclxuICAgIHZhciB4eU9mZnNldCA9IHRoaXMuX3h5Tm9pc2UuZ2VuZXJhdGUoKTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LnNldFJvdGF0aW9uKHJvdGF0aW9uKVxyXG4gICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLl90ZXh0UG9zLnggKyB4eU9mZnNldC54LCB0aGlzLl90ZXh0UG9zLnkgKyB4eU9mZnNldC55KVxyXG4gICAgICAgIC5kcmF3KCk7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBNYWluTmF2O1xyXG5cclxuZnVuY3Rpb24gTWFpbk5hdihsb2FkZXIpIHtcclxuICAgIHRoaXMuX2xvYWRlciA9IGxvYWRlcjtcclxuICAgIHRoaXMuXyRsb2dvID0gJChcIm5hdi5uYXZiYXIgLm5hdmJhci1icmFuZFwiKTtcclxuICAgIHRoaXMuXyRuYXYgPSAkKFwiI21haW4tbmF2XCIpO1xyXG4gICAgdGhpcy5fJG5hdkxpbmtzID0gdGhpcy5fJG5hdi5maW5kKFwiYVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXYgPSB0aGlzLl8kbmF2TGlua3MuZmluZChcIi5hY3RpdmVcIik7IFxyXG4gICAgdGhpcy5fJG5hdkxpbmtzLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25OYXZDbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuXyRsb2dvLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25Mb2dvQ2xpY2suYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbk1haW5OYXYucHJvdG90eXBlLnNldEFjdGl2ZUZyb21VcmwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9kZWFjdGl2YXRlKCk7XHJcbiAgICB2YXIgdXJsID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICBpZiAodXJsID09PSBcIi9pbmRleC5odG1sXCIgfHwgdXJsID09PSBcIi9cIikge1xyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlTGluayh0aGlzLl8kbmF2TGlua3MuZmlsdGVyKFwiI2Fib3V0LWxpbmtcIikpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodXJsID09PSBcIi93b3JrLmh0bWxcIikgeyAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVMaW5rKHRoaXMuXyRuYXZMaW5rcy5maWx0ZXIoXCIjd29yay1saW5rXCIpKTtcclxuICAgIH1cclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9kZWFjdGl2YXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuXyRhY3RpdmVOYXYubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdi5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2ID0gJCgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX2FjdGl2YXRlTGluayA9IGZ1bmN0aW9uICgkbGluaykge1xyXG4gICAgJGxpbmsuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2ID0gJGxpbms7XHJcbn07XHJcblxyXG5NYWluTmF2LnByb3RvdHlwZS5fb25Mb2dvQ2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICB2YXIgdXJsID0gJHRhcmdldC5hdHRyKFwiaHJlZlwiKTtcclxuICAgIHRoaXMuX2xvYWRlci5sb2FkUGFnZSh1cmwsIHt9LCB0cnVlKTtcclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9vbk5hdkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRoaXMuXyRuYXYuY29sbGFwc2UoXCJoaWRlXCIpOyAvLyBDbG9zZSB0aGUgbmF2IC0gb25seSBtYXR0ZXJzIG9uIG1vYmlsZVxyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICBpZiAoJHRhcmdldC5pcyh0aGlzLl8kYWN0aXZlTmF2KSkgcmV0dXJuO1xyXG4gICAgdGhpcy5fZGVhY3RpdmF0ZSgpO1xyXG4gICAgdGhpcy5fYWN0aXZhdGVMaW5rKCR0YXJnZXQpO1xyXG4gICAgdmFyIHVybCA9ICR0YXJnZXQuYXR0cihcImhyZWZcIik7XHJcbiAgICB0aGlzLl9sb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgdHJ1ZSk7ICAgIFxyXG59OyIsInZhciBMb2FkZXIgPSByZXF1aXJlKFwiLi9wYWdlLWxvYWRlci5qc1wiKTtcclxudmFyIE1haW5OYXYgPSByZXF1aXJlKFwiLi9tYWluLW5hdi5qc1wiKTtcclxudmFyIEhvdmVyU2xpZGVzaG93cyA9IHJlcXVpcmUoXCIuL2hvdmVyLXNsaWRlc2hvdy5qc1wiKTtcclxudmFyIFBvcnRmb2xpb0ZpbHRlciA9IHJlcXVpcmUoXCIuL3BvcnRmb2xpby1maWx0ZXIuanNcIik7XHJcbnZhciBJbWFnZUdhbGxlcmllcyA9IHJlcXVpcmUoXCIuL2ltYWdlLWdhbGxlcnkuanNcIik7XHJcblxyXG4vLyBQaWNraW5nIGEgcmFuZG9tIHNrZXRjaCB0aGF0IHRoZSB1c2VyIGhhc24ndCBzZWVuIGJlZm9yZVxyXG52YXIgU2tldGNoID0gcmVxdWlyZShcIi4vcGljay1yYW5kb20tc2tldGNoLmpzXCIpKCk7XHJcblxyXG4vLyBBSkFYIHBhZ2UgbG9hZGVyLCB3aXRoIGNhbGxiYWNrIGZvciByZWxvYWRpbmcgd2lkZ2V0c1xyXG52YXIgbG9hZGVyID0gbmV3IExvYWRlcihvblBhZ2VMb2FkKTtcclxuXHJcbi8vIE1haW4gbmF2IHdpZGdldFxyXG52YXIgbWFpbk5hdiA9IG5ldyBNYWluTmF2KGxvYWRlcik7XHJcblxyXG4vLyBJbnRlcmFjdGl2ZSBsb2dvIGluIG5hdmJhclxyXG52YXIgbmF2ID0gJChcIm5hdi5uYXZiYXJcIik7XHJcbnZhciBuYXZMb2dvID0gbmF2LmZpbmQoXCIubmF2YmFyLWJyYW5kXCIpO1xyXG52YXIgc2tldGNoID0gbmV3IFNrZXRjaChuYXYsIG5hdkxvZ28pO1xyXG5cclxuLy8gV2lkZ2V0IGdsb2JhbHNcclxudmFyIGhvdmVyU2xpZGVzaG93cywgcG9ydGZvbGlvRmlsdGVyLCBpbWFnZUdhbGxlcmllcztcclxuXHJcbi8vIExvYWQgYWxsIHdpZGdldHNcclxub25QYWdlTG9hZCgpO1xyXG5cclxuLy8gSGFuZGxlIGJhY2svZm9yd2FyZCBidXR0b25zXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicG9wc3RhdGVcIiwgb25Qb3BTdGF0ZSk7XHJcblxyXG5mdW5jdGlvbiBvblBvcFN0YXRlKGUpIHtcclxuICAgIC8vIExvYWRlciBzdG9yZXMgY3VzdG9tIGRhdGEgaW4gdGhlIHN0YXRlIC0gaW5jbHVkaW5nIHRoZSB1cmwgYW5kIHRoZSBxdWVyeVxyXG4gICAgdmFyIHVybCA9IChlLnN0YXRlICYmIGUuc3RhdGUudXJsKSB8fCBcIi9pbmRleC5odG1sXCI7XHJcbiAgICB2YXIgcXVlcnlPYmplY3QgPSAoZS5zdGF0ZSAmJiBlLnN0YXRlLnF1ZXJ5KSB8fCB7fTtcclxuXHJcbiAgICBpZiAoKHVybCA9PT0gbG9hZGVyLmdldExvYWRlZFBhdGgoKSkgJiYgKHVybCA9PT0gXCIvd29yay5odG1sXCIpKSB7XHJcbiAgICAgICAgLy8gVGhlIGN1cnJlbnQgJiBwcmV2aW91cyBsb2FkZWQgc3RhdGVzIHdlcmUgd29yay5odG1sLCBzbyBqdXN0IHJlZmlsdGVyXHJcbiAgICAgICAgdmFyIGNhdGVnb3J5ID0gcXVlcnlPYmplY3QuY2F0ZWdvcnkgfHwgXCJhbGxcIjtcclxuICAgICAgICBwb3J0Zm9saW9GaWx0ZXIuc2VsZWN0Q2F0ZWdvcnkoY2F0ZWdvcnkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBMb2FkIHRoZSBuZXcgcGFnZVxyXG4gICAgICAgIGxvYWRlci5sb2FkUGFnZSh1cmwsIHt9LCBmYWxzZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUGFnZUxvYWQoKSB7XHJcbiAgICAvLyBSZWxvYWQgYWxsIHBsdWdpbnMvd2lkZ2V0c1xyXG4gICAgaG92ZXJTbGlkZXNob3dzID0gbmV3IEhvdmVyU2xpZGVzaG93cygpO1xyXG4gICAgcG9ydGZvbGlvRmlsdGVyID0gbmV3IFBvcnRmb2xpb0ZpbHRlcihsb2FkZXIpO1xyXG4gICAgaW1hZ2VHYWxsZXJpZXMgPSBuZXcgSW1hZ2VHYWxsZXJpZXMoKTtcclxuICAgIG9iamVjdEZpdEltYWdlcygpO1xyXG4gICAgc21hcnRxdW90ZXMoKTtcclxuXHJcbiAgICAvLyBTbGlnaHRseSByZWR1bmRhbnQsIGJ1dCB1cGRhdGUgdGhlIG1haW4gbmF2IHVzaW5nIHRoZSBjdXJyZW50IFVSTC4gVGhpc1xyXG4gICAgLy8gaXMgaW1wb3J0YW50IGlmIGEgcGFnZSBpcyBsb2FkZWQgYnkgdHlwaW5nIGEgZnVsbCBVUkwgKGUuZy4gZ29pbmdcclxuICAgIC8vIGRpcmVjdGx5IHRvIC93b3JrLmh0bWwpIG9yIHdoZW4gbW92aW5nIGZyb20gd29yay5odG1sIHRvIGEgcHJvamVjdC4gXHJcbiAgICBtYWluTmF2LnNldEFjdGl2ZUZyb21VcmwoKTtcclxufVxyXG5cclxuLy8gV2UndmUgaGl0IHRoZSBsYW5kaW5nIHBhZ2UsIGxvYWQgdGhlIGFib3V0IHBhZ2VcclxuLy8gaWYgKGxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC9eKFxcL3xcXC9pbmRleC5odG1sfGluZGV4Lmh0bWwpJC8pKSB7XHJcbi8vICAgICBsb2FkZXIubG9hZFBhZ2UoXCIvYWJvdXQuaHRtbFwiLCB7fSwgZmFsc2UpO1xyXG4vLyB9IiwibW9kdWxlLmV4cG9ydHMgPSBMb2FkZXI7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gTG9hZGVyKG9uUmVsb2FkLCBmYWRlRHVyYXRpb24pIHtcclxuICAgIHRoaXMuXyRjb250ZW50ID0gJChcIiNjb250ZW50XCIpO1xyXG4gICAgdGhpcy5fb25SZWxvYWQgPSBvblJlbG9hZDtcclxuICAgIHRoaXMuX2ZhZGVEdXJhdGlvbiA9IChmYWRlRHVyYXRpb24gIT09IHVuZGVmaW5lZCkgPyBmYWRlRHVyYXRpb24gOiAyNTA7XHJcbiAgICB0aGlzLl9wYXRoID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbn1cclxuXHJcbkxvYWRlci5wcm90b3R5cGUuZ2V0TG9hZGVkUGF0aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9wYXRoO1xyXG59O1xyXG5cclxuTG9hZGVyLnByb3RvdHlwZS5sb2FkUGFnZSA9IGZ1bmN0aW9uICh1cmwsIHF1ZXJ5T2JqZWN0LCBzaG91bGRQdXNoSGlzdG9yeSkge1xyXG4gICAgLy8gRmFkZSB0aGVuIGVtcHR5IHRoZSBjdXJyZW50IGNvbnRlbnRzXHJcbiAgICB0aGlzLl8kY29udGVudC52ZWxvY2l0eSh7IG9wYWNpdHk6IDAgfSwgdGhpcy5fZmFkZUR1cmF0aW9uLCBcInN3aW5nXCIsXHJcbiAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuXyRjb250ZW50LmVtcHR5KCk7XHJcbiAgICAgICAgdGhpcy5fJGNvbnRlbnQubG9hZCh1cmwgKyBcIiAjY29udGVudFwiLCBvbkNvbnRlbnRGZXRjaGVkLmJpbmQodGhpcykpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBGYWRlIHRoZSBuZXcgY29udGVudCBpbiBhZnRlciBpdCBoYXMgYmVlbiBmZXRjaGVkXHJcbiAgICBmdW5jdGlvbiBvbkNvbnRlbnRGZXRjaGVkKHJlc3BvbnNlVGV4dCwgdGV4dFN0YXR1cywganFYaHIpIHtcclxuICAgICAgICBpZiAodGV4dFN0YXR1cyA9PT0gXCJlcnJvclwiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBsb2FkaW5nIHRoZSBwYWdlLlwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHF1ZXJ5U3RyaW5nID0gdXRpbGl0aWVzLmNyZWF0ZVF1ZXJ5U3RyaW5nKHF1ZXJ5T2JqZWN0KTtcclxuICAgICAgICBpZiAoc2hvdWxkUHVzaEhpc3RvcnkpIHtcclxuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICBxdWVyeTogcXVlcnlPYmplY3RcclxuICAgICAgICAgICAgfSwgbnVsbCwgdXJsICsgcXVlcnlTdHJpbmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVXBkYXRlIEdvb2dsZSBhbmFseXRpY3NcclxuICAgICAgICBnYShcInNldFwiLCBcInBhZ2VcIiwgdXJsICsgcXVlcnlTdHJpbmcpO1xyXG4gICAgICAgIGdhKFwic2VuZFwiLCBcInBhZ2V2aWV3XCIpO1xyXG5cclxuICAgICAgICB0aGlzLl9wYXRoID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICAgICAgdGhpcy5fJGNvbnRlbnQudmVsb2NpdHkoeyBvcGFjaXR5OiAxIH0sIHRoaXMuX2ZhZGVEdXJhdGlvbiwgXHJcbiAgICAgICAgICAgIFwic3dpbmdcIik7XHJcbiAgICAgICAgdGhpcy5fb25SZWxvYWQoKTtcclxuICAgIH1cclxufTsiLCJ2YXIgY29va2llcyA9IHJlcXVpcmUoXCJqcy1jb29raWVcIik7XHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbnZhciBza2V0Y2hDb25zdHJ1Y3RvcnMgPSB7XHJcbiAgICBcImhhbGZ0b25lLWZsYXNobGlnaHRcIjogXHJcbiAgICAgICAgcmVxdWlyZShcIi4vaW50ZXJhY3RpdmUtbG9nb3MvaGFsZnRvbmUtZmxhc2hsaWdodC13b3JkLmpzXCIpLFxyXG4gICAgXCJub2lzeS13b3JkXCI6XHJcbiAgICAgICAgcmVxdWlyZShcIi4vaW50ZXJhY3RpdmUtbG9nb3Mvbm9pc3ktd29yZC1za2V0Y2guanNcIiksXHJcbiAgICBcImNvbm5lY3QtcG9pbnRzXCI6XHJcbiAgICAgICAgcmVxdWlyZShcIi4vaW50ZXJhY3RpdmUtbG9nb3MvY29ubmVjdC1wb2ludHMtc2tldGNoLmpzXCIpXHJcbn07XHJcbnZhciBudW1Ta2V0Y2hlcyA9IE9iamVjdC5rZXlzKHNrZXRjaENvbnN0cnVjdG9ycykubGVuZ3RoO1xyXG52YXIgY29va2llS2V5ID0gXCJzZWVuLXNrZXRjaC1uYW1lc1wiO1xyXG5cclxuLyoqXHJcbiAqIFBpY2sgYSByYW5kb20gc2tldGNoIHRoYXQgdXNlciBoYXNuJ3Qgc2VlbiB5ZXQuIElmIHRoZSB1c2VyIGhhcyBzZWVuIGFsbCB0aGVcclxuICogc2tldGNoZXMsIGp1c3QgcGljayBhIHJhbmRvbSBvbmUuIFRoaXMgdXNlcyBjb29raWVzIHRvIHRyYWNrIHdoYXQgdGhlIHVzZXIgXHJcbiAqIGhhcyBzZWVuIGFscmVhZHkuXHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBDb25zdHJ1Y3RvciBmb3IgYSBTa2V0Y2ggY2xhc3NcclxuICovXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gcGlja1JhbmRvbVNrZXRjaCgpIHtcclxuICAgIHZhciBzZWVuU2tldGNoTmFtZXMgPSBjb29raWVzLmdldEpTT04oY29va2llS2V5KSB8fCBbXTtcclxuXHJcbiAgICAvLyBGaW5kIHRoZSBuYW1lcyBvZiB0aGUgdW5zZWVuIHNrZXRjaGVzXHJcbiAgICB2YXIgdW5zZWVuU2tldGNoTmFtZXMgPSBmaW5kVW5zZWVuU2tldGNoZXMoc2VlblNrZXRjaE5hbWVzKTtcclxuXHJcbiAgICAvLyBBbGwgc2tldGNoZXMgaGF2ZSBiZWVuIHNlZW5cclxuICAgIGlmICh1bnNlZW5Ta2V0Y2hOYW1lcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAvLyBJZiB3ZSd2ZSBnb3QgbW9yZSB0aGVuIG9uZSBza2V0Y2gsIHRoZW4gbWFrZSBzdXJlIHRvIGNob29zZSBhIHJhbmRvbVxyXG4gICAgICAgIC8vIHNrZXRjaCBleGNsdWRpbmcgdGhlIG1vc3QgcmVjZW50bHkgc2VlbiBza2V0Y2hcclxuICAgICAgICBpZiAobnVtU2tldGNoZXMgPiAxKSB7XHJcbiAgICAgICAgICAgIHNlZW5Ta2V0Y2hOYW1lcyA9IFtzZWVuU2tldGNoTmFtZXMucG9wKCldO1xyXG4gICAgICAgICAgICB1bnNlZW5Ta2V0Y2hOYW1lcyA9IGZpbmRVbnNlZW5Ta2V0Y2hlcyhzZWVuU2tldGNoTmFtZXMpO1xyXG4gICAgICAgIH0gXHJcbiAgICAgICAgLy8gSWYgd2UndmUgb25seSBnb3Qgb25lIHNrZXRjaCwgdGhlbiB3ZSBjYW4ndCBkbyBtdWNoLi4uXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlZW5Ta2V0Y2hOYW1lcyA9IFtdO1xyXG4gICAgICAgICAgICB1bnNlZW5Ta2V0Y2hOYW1lcyA9IE9iamVjdC5rZXlzKHNrZXRjaENvbnN0cnVjdG9ycyk7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHZhciByYW5kU2tldGNoTmFtZSA9IHV0aWxzLnJhbmRBcnJheUVsZW1lbnQodW5zZWVuU2tldGNoTmFtZXMpO1xyXG4gICAgc2VlblNrZXRjaE5hbWVzLnB1c2gocmFuZFNrZXRjaE5hbWUpO1xyXG5cclxuICAgIC8vIFN0b3JlIHRoZSBnZW5lcmF0ZWQgc2tldGNoIGluIGEgY29va2llLiBUaGlzIGNyZWF0ZXMgYSBtb3ZpbmcgNyBkYXlcclxuICAgIC8vIHdpbmRvdyAtIGFueXRpbWUgdGhlIHNpdGUgaXMgdmlzaXRlZCwgdGhlIGNvb2tpZSBpcyByZWZyZXNoZWQuXHJcbiAgICBjb29raWVzLnNldChjb29raWVLZXksIHNlZW5Ta2V0Y2hOYW1lcywgeyBleHBpcmVzOiA3IH0pO1xyXG5cclxuICAgIHJldHVybiBza2V0Y2hDb25zdHJ1Y3RvcnNbcmFuZFNrZXRjaE5hbWVdO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gZmluZFVuc2VlblNrZXRjaGVzKHNlZW5Ta2V0Y2hOYW1lcykge1xyXG4gICAgdmFyIHVuc2VlblNrZXRjaE5hbWVzID0gW107XHJcbiAgICBmb3IgKHZhciBza2V0Y2hOYW1lIGluIHNrZXRjaENvbnN0cnVjdG9ycykge1xyXG4gICAgICAgIGlmIChzZWVuU2tldGNoTmFtZXMuaW5kZXhPZihza2V0Y2hOYW1lKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdW5zZWVuU2tldGNoTmFtZXMucHVzaChza2V0Y2hOYW1lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5zZWVuU2tldGNoTmFtZXM7XHJcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb0ZpbHRlcjtcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG52YXIgZGVmYXVsdEJyZWFrcG9pbnRzID0gW1xyXG4gICAgeyB3aWR0aDogMTIwMCwgY29sczogMywgc3BhY2luZzogMTUgfSxcclxuICAgIHsgd2lkdGg6IDk5MiwgY29sczogMywgc3BhY2luZzogMTUgfSxcclxuICAgIHsgd2lkdGg6IDcwMCwgY29sczogMywgc3BhY2luZzogMTUgfSxcclxuICAgIHsgd2lkdGg6IDYwMCwgY29sczogMiwgc3BhY2luZzogMTAgfSxcclxuICAgIHsgd2lkdGg6IDQ4MCwgY29sczogMiwgc3BhY2luZzogMTAgfSxcclxuICAgIHsgd2lkdGg6IDMyMCwgY29sczogMSwgc3BhY2luZzogMTAgfVxyXG5dO1xyXG5cclxuZnVuY3Rpb24gUG9ydGZvbGlvRmlsdGVyKGxvYWRlciwgYnJlYWtwb2ludHMsIGFzcGVjdFJhdGlvLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRoaXMuX2xvYWRlciA9IGxvYWRlcjtcclxuICAgIHRoaXMuX2dyaWRTcGFjaW5nID0gMDtcclxuICAgIHRoaXMuX2FzcGVjdFJhdGlvID0gKGFzcGVjdFJhdGlvICE9PSB1bmRlZmluZWQpID8gYXNwZWN0UmF0aW8gOiAoMTYvOSk7XHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSAodHJhbnNpdGlvbkR1cmF0aW9uICE9PSB1bmRlZmluZWQpID8gXHJcbiAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uIDogODAwO1xyXG4gICAgdGhpcy5fYnJlYWtwb2ludHMgPSAoYnJlYWtwb2ludHMgIT09IHVuZGVmaW5lZCkgPyBcclxuICAgICAgICBicmVha3BvaW50cy5zbGljZSgpIDogZGVmYXVsdEJyZWFrcG9pbnRzLnNsaWNlKCk7XHJcbiAgICB0aGlzLl8kZ3JpZCA9ICQoXCIjcG9ydGZvbGlvLWdyaWRcIik7XHJcbiAgICB0aGlzLl8kbmF2ID0gJChcIiNwb3J0Zm9saW8tbmF2XCIpO1xyXG4gICAgdGhpcy5fJHByb2plY3RzID0gW107XHJcbiAgICB0aGlzLl8kY2F0ZWdvcmllcyA9IHt9O1xyXG4gICAgdGhpcy5fcm93cyA9IDA7XHJcbiAgICB0aGlzLl9jb2xzID0gMDtcclxuICAgIHRoaXMuX2ltYWdlSGVpZ2h0ID0gMDtcclxuICAgIHRoaXMuX2ltYWdlV2lkdGggPSAwO1xyXG5cclxuICAgIC8vIFNvcnQgdGhlIGJyZWFrcG9pbnRzIGluIGRlc2NlbmRpbmcgb3JkZXJcclxuICAgIHRoaXMuX2JyZWFrcG9pbnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgIGlmIChhLndpZHRoIDwgYi53aWR0aCkgcmV0dXJuIC0xO1xyXG4gICAgICAgIGVsc2UgaWYgKGEud2lkdGggPiBiLndpZHRoKSByZXR1cm4gMTtcclxuICAgICAgICBlbHNlIHJldHVybiAwO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fY2FjaGVQcm9qZWN0cygpO1xyXG4gICAgdGhpcy5fY3JlYXRlR3JpZCgpO1xyXG5cclxuICAgIHRoaXMuXyRncmlkLmZpbmQoXCIucHJvamVjdCBhXCIpLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25Qcm9qZWN0Q2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdmFyIHFzID0gdXRpbGl0aWVzLmdldFF1ZXJ5UGFyYW1ldGVycygpO1xyXG4gICAgdmFyIGluaXRpYWxDYXRlZ29yeSA9IHFzLmNhdGVnb3J5IHx8IFwiYWxsXCI7XHJcbiAgICB2YXIgY2F0ZWdvcnkgPSBpbml0aWFsQ2F0ZWdvcnkudG9Mb3dlckNhc2UoKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gdGhpcy5fJG5hdi5maW5kKFwiYVtkYXRhLWNhdGVnb3J5PVwiICsgY2F0ZWdvcnkgKyBcIl1cIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgIHRoaXMuX2ZpbHRlclByb2plY3RzKGNhdGVnb3J5KTtcclxuICAgICQoXCIjcG9ydGZvbGlvLW5hdiBhXCIpLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25OYXZDbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgdGhpcy5fY3JlYXRlR3JpZC5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5zZWxlY3RDYXRlZ29yeSA9IGZ1bmN0aW9uIChjYXRlZ29yeSkge1xyXG4gICAgY2F0ZWdvcnkgPSAoY2F0ZWdvcnkgJiYgY2F0ZWdvcnkudG9Mb3dlckNhc2UoKSkgfHwgXCJhbGxcIjtcclxuICAgIHZhciAkc2VsZWN0ZWROYXYgPSB0aGlzLl8kbmF2LmZpbmQoXCJhW2RhdGEtY2F0ZWdvcnk9XCIgKyBjYXRlZ29yeSArIFwiXVwiKTtcclxuICAgIGlmICgkc2VsZWN0ZWROYXYubGVuZ3RoICYmICEkc2VsZWN0ZWROYXYuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSB7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0gPSAkc2VsZWN0ZWROYXY7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZmlsdGVyUHJvamVjdHMgPSBmdW5jdGlvbiAoY2F0ZWdvcnkpIHtcclxuICAgIHZhciAkc2VsZWN0ZWRFbGVtZW50cyA9IHRoaXMuX2dldFByb2plY3RzSW5DYXRlZ29yeShjYXRlZ29yeSk7XHJcblxyXG4gICAgLy8gQW5pbWF0ZSB0aGUgZ3JpZCB0byB0aGUgY29ycmVjdCBoZWlnaHQgdG8gY29udGFpbiB0aGUgcm93c1xyXG4gICAgdGhpcy5fYW5pbWF0ZUdyaWRIZWlnaHQoJHNlbGVjdGVkRWxlbWVudHMubGVuZ3RoKTtcclxuICAgIFxyXG4gICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBwcm9qZWN0c1xyXG4gICAgdGhpcy5fJHByb2plY3RzLmZvckVhY2goZnVuY3Rpb24gKCRlbGVtZW50KSB7XHJcbiAgICAgICAgLy8gU3RvcCBhbGwgYW5pbWF0aW9uc1xyXG4gICAgICAgICRlbGVtZW50LnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgICAgICAvLyBJZiBhbiBlbGVtZW50IGlzIG5vdCBzZWxlY3RlZDogZHJvcCB6LWluZGV4ICYgYW5pbWF0ZSBvcGFjaXR5IC0+IGhpZGVcclxuICAgICAgICB2YXIgc2VsZWN0ZWRJbmRleCA9ICRzZWxlY3RlZEVsZW1lbnRzLmluZGV4T2YoJGVsZW1lbnQpOyBcclxuICAgICAgICBpZiAoc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgJGVsZW1lbnQuY3NzKFwiekluZGV4XCIsIC0xKTtcclxuICAgICAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoe1xyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICAgICAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFwiZWFzZUluT3V0Q3ViaWNcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gSWYgYW4gZWxlbWVudCBpcyBzZWxlY3RlZDogc2hvdyAmIGJ1bXAgei1pbmRleCAmIGFuaW1hdGUgdG8gcG9zaXRpb24gXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICRlbGVtZW50LnNob3coKTtcclxuICAgICAgICAgICAgJGVsZW1lbnQuY3NzKFwiekluZGV4XCIsIDApO1xyXG4gICAgICAgICAgICB2YXIgbmV3UG9zID0gdGhpcy5faW5kZXhUb1hZKHNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC52ZWxvY2l0eSh7IFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICAgICAgICAgIHRvcDogbmV3UG9zLnkgKyBcInB4XCIsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBuZXdQb3MueCArIFwicHhcIlxyXG4gICAgICAgICAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFwiZWFzZUluT3V0Q3ViaWNcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2FuaW1hdGVHcmlkSGVpZ2h0ID0gZnVuY3Rpb24gKG51bUVsZW1lbnRzKSB7XHJcbiAgICB0aGlzLl8kZ3JpZC52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgICB2YXIgY3VyUm93cyA9IE1hdGguY2VpbChudW1FbGVtZW50cyAvIHRoaXMuX2NvbHMpO1xyXG4gICAgdGhpcy5fJGdyaWQudmVsb2NpdHkoe1xyXG4gICAgICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKiBjdXJSb3dzICsgXHJcbiAgICAgICAgICAgIHRoaXMuX2dyaWRTcGFjaW5nICogKGN1clJvd3MgLSAxKSArIFwicHhcIlxyXG4gICAgfSwgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2dldFByb2plY3RzSW5DYXRlZ29yeSA9IGZ1bmN0aW9uIChjYXRlZ29yeSkge1xyXG4gICAgaWYgKGNhdGVnb3J5ID09PSBcImFsbFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuXyRwcm9qZWN0cztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLl8kY2F0ZWdvcmllc1tjYXRlZ29yeV0gfHwgW10pO1xyXG4gICAgfSAgICAgICAgXHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jYWNoZVByb2plY3RzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fJHByb2plY3RzID0gW107XHJcbiAgICB0aGlzLl8kY2F0ZWdvcmllcyA9IHt9O1xyXG4gICAgdGhpcy5fJGdyaWQuZmluZChcIi5wcm9qZWN0XCIpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcclxuICAgICAgICB0aGlzLl8kcHJvamVjdHMucHVzaCgkZWxlbWVudCk7XHJcbiAgICAgICAgdmFyIGNhdGVnb3J5TmFtZXMgPSAkZWxlbWVudC5kYXRhKFwiY2F0ZWdvcmllc1wiKS5zcGxpdChcIixcIik7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYXRlZ29yeU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHZhciBjYXRlZ29yeSA9ICQudHJpbShjYXRlZ29yeU5hbWVzW2ldKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldID0gWyRlbGVtZW50XTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XS5wdXNoKCRlbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vLyBQb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jYWxjdWxhdGVHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4vLyAgICAgdmFyIGdyaWRXaWR0aCA9IHRoaXMuXyRncmlkLmlubmVyV2lkdGgoKTtcclxuLy8gICAgIHRoaXMuX2NvbHMgPSBNYXRoLmZsb29yKChncmlkV2lkdGggKyB0aGlzLl9ncmlkU3BhY2luZykgLyBcclxuLy8gICAgICAgICAodGhpcy5fbWluSW1hZ2VXaWR0aCArIHRoaXMuX2dyaWRTcGFjaW5nKSk7XHJcbi8vICAgICB0aGlzLl9yb3dzID0gTWF0aC5jZWlsKHRoaXMuXyRwcm9qZWN0cy5sZW5ndGggLyB0aGlzLl9jb2xzKTtcclxuLy8gICAgIHRoaXMuX2ltYWdlV2lkdGggPSAoZ3JpZFdpZHRoIC0gKCh0aGlzLl9jb2xzIC0gMSkgKiB0aGlzLl9ncmlkU3BhY2luZykpIC8gXHJcbi8vICAgICAgICAgdGhpcy5fY29scztcclxuLy8gICAgIHRoaXMuX2ltYWdlSGVpZ2h0ID0gdGhpcy5faW1hZ2VXaWR0aCAqICgxIC8gdGhpcy5fYXNwZWN0UmF0aW8pO1xyXG4vLyB9O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fY2FsY3VsYXRlR3JpZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBncmlkV2lkdGggPSB0aGlzLl8kZ3JpZC5pbm5lcldpZHRoKCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2JyZWFrcG9pbnRzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKGdyaWRXaWR0aCA8PSB0aGlzLl9icmVha3BvaW50c1tpXS53aWR0aCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jb2xzID0gdGhpcy5fYnJlYWtwb2ludHNbaV0uY29scztcclxuICAgICAgICAgICAgdGhpcy5fZ3JpZFNwYWNpbmcgPSB0aGlzLl9icmVha3BvaW50c1tpXS5zcGFjaW5nO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLl9yb3dzID0gTWF0aC5jZWlsKHRoaXMuXyRwcm9qZWN0cy5sZW5ndGggLyB0aGlzLl9jb2xzKTtcclxuICAgIHRoaXMuX2ltYWdlV2lkdGggPSAoZ3JpZFdpZHRoIC0gKCh0aGlzLl9jb2xzIC0gMSkgKiB0aGlzLl9ncmlkU3BhY2luZykpIC8gXHJcbiAgICAgICAgdGhpcy5fY29scztcclxuICAgIHRoaXMuX2ltYWdlSGVpZ2h0ID0gdGhpcy5faW1hZ2VXaWR0aCAqICgxIC8gdGhpcy5fYXNwZWN0UmF0aW8pO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fY3JlYXRlR3JpZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX2NhbGN1bGF0ZUdyaWQoKTtcclxuXHJcbiAgICB0aGlzLl8kZ3JpZC5jc3MoXCJwb3NpdGlvblwiLCBcInJlbGF0aXZlXCIpO1xyXG4gICAgdGhpcy5fJGdyaWQuY3NzKHtcclxuICAgICAgICBoZWlnaHQ6IHRoaXMuX2ltYWdlSGVpZ2h0ICogdGhpcy5fcm93cyArIFxyXG4gICAgICAgICAgICB0aGlzLl9ncmlkU3BhY2luZyAqICh0aGlzLl9yb3dzIC0gMSkgKyBcInB4XCJcclxuICAgIH0pOyAgICBcclxuXHJcbiAgICB0aGlzLl8kcHJvamVjdHMuZm9yRWFjaChmdW5jdGlvbiAoJGVsZW1lbnQsIGluZGV4KSB7XHJcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMuX2luZGV4VG9YWShpbmRleCk7XHJcbiAgICAgICAgJGVsZW1lbnQuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICAgICAgdG9wOiBwb3MueSArIFwicHhcIixcclxuICAgICAgICAgICAgbGVmdDogcG9zLnggKyBcInB4XCIsXHJcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLl9pbWFnZVdpZHRoICsgXCJweFwiLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuX2ltYWdlSGVpZ2h0ICsgXCJweFwiXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpOyAgICBcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX29uTmF2Q2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuICAgIGlmICgkdGFyZ2V0LmlzKHRoaXMuXyRhY3RpdmVOYXZJdGVtKSkgcmV0dXJuO1xyXG4gICAgaWYgKHRoaXMuXyRhY3RpdmVOYXZJdGVtLmxlbmd0aCkgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAkdGFyZ2V0LmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0gPSAkdGFyZ2V0O1xyXG4gICAgdmFyIGNhdGVnb3J5ID0gJHRhcmdldC5kYXRhKFwiY2F0ZWdvcnlcIikudG9Mb3dlckNhc2UoKTtcclxuXHJcbiAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7XHJcbiAgICAgICAgdXJsOiBcIi93b3JrLmh0bWxcIixcclxuICAgICAgICBxdWVyeTogeyBjYXRlZ29yeTogY2F0ZWdvcnkgfVxyXG4gICAgfSwgbnVsbCwgXCIvd29yay5odG1sP2NhdGVnb3J5PVwiICsgY2F0ZWdvcnkpO1xyXG5cclxuICAgIHRoaXMuX2ZpbHRlclByb2plY3RzKGNhdGVnb3J5KTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX29uUHJvamVjdENsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgdmFyIHByb2plY3ROYW1lID0gJHRhcmdldC5kYXRhKFwibmFtZVwiKTtcclxuICAgIHZhciB1cmwgPSBcIi9wcm9qZWN0cy9cIiArIHByb2plY3ROYW1lICsgXCIuaHRtbFwiO1xyXG4gICAgdGhpcy5fbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIHRydWUpO1xyXG59O1xyXG5cclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2luZGV4VG9YWSA9IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgdmFyIHIgPSBNYXRoLmZsb29yKGluZGV4IC8gdGhpcy5fY29scyk7XHJcbiAgICB2YXIgYyA9IGluZGV4ICUgdGhpcy5fY29sczsgXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IGMgKiB0aGlzLl9pbWFnZVdpZHRoICsgYyAqIHRoaXMuX2dyaWRTcGFjaW5nLFxyXG4gICAgICAgIHk6IHIgKiB0aGlzLl9pbWFnZUhlaWdodCArIHIgKiB0aGlzLl9ncmlkU3BhY2luZ1xyXG4gICAgfTtcclxufTsiLCJleHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAodmFsLCBkZWZhdWx0VmFsKSB7XHJcbiAgICByZXR1cm4gKHZhbCAhPT0gdW5kZWZpbmVkKSA/IHZhbCA6IGRlZmF1bHRWYWw7XHJcbn07XHJcblxyXG4vLyBVbnRlc3RlZFxyXG4vLyBleHBvcnRzLmRlZmF1bHRQcm9wZXJ0aWVzID0gZnVuY3Rpb24gZGVmYXVsdFByb3BlcnRpZXMgKG9iaiwgcHJvcHMpIHtcclxuLy8gICAgIGZvciAodmFyIHByb3AgaW4gcHJvcHMpIHtcclxuLy8gICAgICAgICBpZiAocHJvcHMuaGFzT3duUHJvcGVydHkocHJvcHMsIHByb3ApKSB7XHJcbi8vICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGV4cG9ydHMuZGVmYXVsdFZhbHVlKHByb3BzLnZhbHVlLCBwcm9wcy5kZWZhdWx0KTtcclxuLy8gICAgICAgICAgICAgb2JqW3Byb3BdID0gdmFsdWU7XHJcbi8vICAgICAgICAgfVxyXG4vLyAgICAgfVxyXG4vLyAgICAgcmV0dXJuIG9iajtcclxuLy8gfTtcclxuLy8gXHJcbmV4cG9ydHMudGltZUl0ID0gZnVuY3Rpb24gKGZ1bmMpIHtcclxuICAgIHZhciBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgZnVuYygpO1xyXG4gICAgdmFyIGVuZCA9IHBlcmZvcm1hbmNlLm5vdygpO1xyXG4gICAgcmV0dXJuIGVuZCAtIHN0YXJ0O1xyXG59O1xyXG5cclxuZXhwb3J0cy5pc0luUmVjdCA9IGZ1bmN0aW9uICh4LCB5LCByZWN0KSB7XHJcbiAgICBpZiAoeCA+PSByZWN0LnggJiYgeCA8PSAocmVjdC54ICsgcmVjdC53KSAmJlxyXG4gICAgICAgIHkgPj0gcmVjdC55ICYmIHkgPD0gKHJlY3QueSArIHJlY3QuaCkpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxufTtcclxuXHJcbmV4cG9ydHMucmFuZEludCA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xyXG4gICAgcmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSkgKyBtaW47XHJcbn07XHJcblxyXG5leHBvcnRzLnJhbmRBcnJheUVsZW1lbnQgPSBmdW5jdGlvbiAoYXJyYXkpIHtcclxuICAgIHZhciBpID0gZXhwb3J0cy5yYW5kSW50KDAsIGFycmF5Lmxlbmd0aCAtIDEpOyAgICBcclxuICAgIHJldHVybiBhcnJheVtpXTtcclxufTtcclxuXHJcbmV4cG9ydHMubWFwID0gZnVuY3Rpb24gKG51bSwgbWluMSwgbWF4MSwgbWluMiwgbWF4Miwgb3B0aW9ucykge1xyXG4gICAgdmFyIG1hcHBlZCA9IChudW0gLSBtaW4xKSAvIChtYXgxIC0gbWluMSkgKiAobWF4MiAtIG1pbjIpICsgbWluMjtcclxuICAgIGlmICghb3B0aW9ucykgcmV0dXJuIG1hcHBlZDtcclxuICAgIGlmIChvcHRpb25zLnJvdW5kICYmIG9wdGlvbnMucm91bmQgPT09IHRydWUpIHtcclxuICAgICAgICBtYXBwZWQgPSBNYXRoLnJvdW5kKG1hcHBlZCk7XHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy5mbG9vciAmJiBvcHRpb25zLmZsb29yID09PSB0cnVlKSB7XHJcbiAgICAgICAgbWFwcGVkID0gTWF0aC5mbG9vcihtYXBwZWQpOyAgICAgICAgXHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy5jZWlsICYmIG9wdGlvbnMuY2VpbCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIG1hcHBlZCA9IE1hdGguY2VpbChtYXBwZWQpOyAgICAgICAgXHJcbiAgICB9XHJcbiAgICBpZiAob3B0aW9ucy5jbGFtcCAmJiBvcHRpb25zLmNsYW1wID09PSB0cnVlKSB7XHJcbiAgICAgICAgbWFwcGVkID0gTWF0aC5taW4obWFwcGVkLCBtYXgyKTtcclxuICAgICAgICBtYXBwZWQgPSBNYXRoLm1heChtYXBwZWQsIG1pbjIpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG1hcHBlZDtcclxufTtcclxuXHJcbmV4cG9ydHMuZ2V0UXVlcnlQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gQ2hlY2sgZm9yIHF1ZXJ5IHN0cmluZ1xyXG4gICAgcXMgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xyXG4gICAgaWYgKHFzLmxlbmd0aCA8PSAxKSByZXR1cm4ge307XHJcbiAgICAvLyBRdWVyeSBzdHJpbmcgZXhpc3RzLCBwYXJzZSBpdCBpbnRvIGEgcXVlcnkgb2JqZWN0XHJcbiAgICBxcyA9IHFzLnN1YnN0cmluZygxKTsgLy8gUmVtb3ZlIHRoZSBcIj9cIiBkZWxpbWl0ZXJcclxuICAgIHZhciBrZXlWYWxQYWlycyA9IHFzLnNwbGl0KFwiJlwiKTtcclxuICAgIHZhciBxdWVyeU9iamVjdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlWYWxQYWlycy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBrZXlWYWwgPSBrZXlWYWxQYWlyc1tpXS5zcGxpdChcIj1cIik7XHJcbiAgICAgICAgaWYgKGtleVZhbC5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgdmFyIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChrZXlWYWxbMF0pO1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleVZhbFsxXSk7XHJcbiAgICAgICAgICAgIHF1ZXJ5T2JqZWN0W2tleV0gPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHF1ZXJ5T2JqZWN0O1xyXG59O1xyXG5cclxuZXhwb3J0cy5jcmVhdGVRdWVyeVN0cmluZyA9IGZ1bmN0aW9uIChxdWVyeU9iamVjdCkge1xyXG4gICAgaWYgKHR5cGVvZiBxdWVyeU9iamVjdCAhPT0gXCJvYmplY3RcIikgcmV0dXJuIFwiXCI7XHJcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHF1ZXJ5T2JqZWN0KTtcclxuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIFwiXCI7XHJcbiAgICB2YXIgcXVlcnlTdHJpbmcgPSBcIj9cIjtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xyXG4gICAgICAgIHZhciB2YWwgPSBxdWVyeU9iamVjdFtrZXldO1xyXG4gICAgICAgIHF1ZXJ5U3RyaW5nICs9IGVuY29kZVVSSUNvbXBvbmVudChrZXkpICsgXCI9XCIgKyBlbmNvZGVVUklDb21wb25lbnQodmFsKTtcclxuICAgICAgICBpZiAoaSAhPT0ga2V5cy5sZW5ndGggLSAxKSBxdWVyeVN0cmluZyArPSBcIiZcIjtcclxuICAgIH1cclxuICAgIHJldHVybiBxdWVyeVN0cmluZztcclxufTtcclxuXHJcbmV4cG9ydHMud3JhcEluZGV4ID0gZnVuY3Rpb24gKGluZGV4LCBsZW5ndGgpIHtcclxuICAgIHZhciB3cmFwcGVkSW5kZXggPSAoaW5kZXggJSBsZW5ndGgpOyBcclxuICAgIGlmICh3cmFwcGVkSW5kZXggPCAwKSB7XHJcbiAgICAgICAgLy8gSWYgbmVnYXRpdmUsIGZsaXAgdGhlIGluZGV4IHNvIHRoYXQgLTEgYmVjb21lcyB0aGUgbGFzdCBpdGVtIGluIGxpc3QgXHJcbiAgICAgICAgd3JhcHBlZEluZGV4ID0gbGVuZ3RoICsgd3JhcHBlZEluZGV4O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHdyYXBwZWRJbmRleDtcclxufTtcclxuIl19
