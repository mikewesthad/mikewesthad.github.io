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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJub2RlX21vZHVsZXMvcDUtYmJveC1hbGlnbmVkLXRleHQvbGliL2Jib3gtYWxpZ25lZC10ZXh0LmpzIiwibm9kZV9tb2R1bGVzL3A1LWJib3gtYWxpZ25lZC10ZXh0L2xpYi91dGlscy5qcyIsInNyYy9qcy9ob3Zlci1zbGlkZXNob3cuanMiLCJzcmMvanMvaW1hZ2UtZ2FsbGVyeS5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9iYXNlLWxvZ28tc2tldGNoLmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2Nvbm5lY3QtcG9pbnRzLXNrZXRjaC5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9nZW5lcmF0b3JzL25vaXNlLWdlbmVyYXRvcnMuanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvZ2VuZXJhdG9ycy9zaW4tZ2VuZXJhdG9yLmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2hhbGZ0b25lLWZsYXNobGlnaHQtd29yZC5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9ub2lzeS13b3JkLXNrZXRjaC5qcyIsInNyYy9qcy9tYWluLW5hdi5qcyIsInNyYy9qcy9tYWluLmpzIiwic3JjL2pzL3BhZ2UtbG9hZGVyLmpzIiwic3JjL2pzL3BpY2stcmFuZG9tLXNrZXRjaC5qcyIsInNyYy9qcy9wb3J0Zm9saW8tZmlsdGVyLmpzIiwic3JjL2pzL3V0aWxpdGllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqWkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyohXG4gKiBKYXZhU2NyaXB0IENvb2tpZSB2Mi4xLjJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qcy1jb29raWUvanMtY29va2llXG4gKlxuICogQ29weXJpZ2h0IDIwMDYsIDIwMTUgS2xhdXMgSGFydGwgJiBGYWduZXIgQnJhY2tcbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG47KGZ1bmN0aW9uIChmYWN0b3J5KSB7XG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoZmFjdG9yeSk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIE9sZENvb2tpZXMgPSB3aW5kb3cuQ29va2llcztcblx0XHR2YXIgYXBpID0gd2luZG93LkNvb2tpZXMgPSBmYWN0b3J5KCk7XG5cdFx0YXBpLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR3aW5kb3cuQ29va2llcyA9IE9sZENvb2tpZXM7XG5cdFx0XHRyZXR1cm4gYXBpO1xuXHRcdH07XG5cdH1cbn0oZnVuY3Rpb24gKCkge1xuXHRmdW5jdGlvbiBleHRlbmQgKCkge1xuXHRcdHZhciBpID0gMDtcblx0XHR2YXIgcmVzdWx0ID0ge307XG5cdFx0Zm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHZhciBhdHRyaWJ1dGVzID0gYXJndW1lbnRzWyBpIF07XG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gYXR0cmlidXRlcykge1xuXHRcdFx0XHRyZXN1bHRba2V5XSA9IGF0dHJpYnV0ZXNba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGluaXQgKGNvbnZlcnRlcikge1xuXHRcdGZ1bmN0aW9uIGFwaSAoa2V5LCB2YWx1ZSwgYXR0cmlidXRlcykge1xuXHRcdFx0dmFyIHJlc3VsdDtcblx0XHRcdGlmICh0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Ly8gV3JpdGVcblxuXHRcdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdGF0dHJpYnV0ZXMgPSBleHRlbmQoe1xuXHRcdFx0XHRcdHBhdGg6ICcvJ1xuXHRcdFx0XHR9LCBhcGkuZGVmYXVsdHMsIGF0dHJpYnV0ZXMpO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YgYXR0cmlidXRlcy5leHBpcmVzID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdHZhciBleHBpcmVzID0gbmV3IERhdGUoKTtcblx0XHRcdFx0XHRleHBpcmVzLnNldE1pbGxpc2Vjb25kcyhleHBpcmVzLmdldE1pbGxpc2Vjb25kcygpICsgYXR0cmlidXRlcy5leHBpcmVzICogODY0ZSs1KTtcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLmV4cGlyZXMgPSBleHBpcmVzO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRyZXN1bHQgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG5cdFx0XHRcdFx0aWYgKC9eW1xce1xcW10vLnRlc3QocmVzdWx0KSkge1xuXHRcdFx0XHRcdFx0dmFsdWUgPSByZXN1bHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGNhdGNoIChlKSB7fVxuXG5cdFx0XHRcdGlmICghY29udmVydGVyLndyaXRlKSB7XG5cdFx0XHRcdFx0dmFsdWUgPSBlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKHZhbHVlKSlcblx0XHRcdFx0XHRcdC5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDNBfDNDfDNFfDNEfDJGfDNGfDQwfDVCfDVEfDVFfDYwfDdCfDdEfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHZhbHVlID0gY29udmVydGVyLndyaXRlKHZhbHVlLCBrZXkpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0a2V5ID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyhrZXkpKTtcblx0XHRcdFx0a2V5ID0ga2V5LnJlcGxhY2UoLyUoMjN8MjR8MjZ8MkJ8NUV8NjB8N0MpL2csIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC9bXFwoXFwpXS9nLCBlc2NhcGUpO1xuXG5cdFx0XHRcdHJldHVybiAoZG9jdW1lbnQuY29va2llID0gW1xuXHRcdFx0XHRcdGtleSwgJz0nLCB2YWx1ZSxcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLmV4cGlyZXMgJiYgJzsgZXhwaXJlcz0nICsgYXR0cmlidXRlcy5leHBpcmVzLnRvVVRDU3RyaW5nKCksIC8vIHVzZSBleHBpcmVzIGF0dHJpYnV0ZSwgbWF4LWFnZSBpcyBub3Qgc3VwcG9ydGVkIGJ5IElFXG5cdFx0XHRcdFx0YXR0cmlidXRlcy5wYXRoICAgICYmICc7IHBhdGg9JyArIGF0dHJpYnV0ZXMucGF0aCxcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLmRvbWFpbiAgJiYgJzsgZG9tYWluPScgKyBhdHRyaWJ1dGVzLmRvbWFpbixcblx0XHRcdFx0XHRhdHRyaWJ1dGVzLnNlY3VyZSA/ICc7IHNlY3VyZScgOiAnJ1xuXHRcdFx0XHRdLmpvaW4oJycpKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gUmVhZFxuXG5cdFx0XHRpZiAoIWtleSkge1xuXHRcdFx0XHRyZXN1bHQgPSB7fTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVG8gcHJldmVudCB0aGUgZm9yIGxvb3AgaW4gdGhlIGZpcnN0IHBsYWNlIGFzc2lnbiBhbiBlbXB0eSBhcnJheVxuXHRcdFx0Ly8gaW4gY2FzZSB0aGVyZSBhcmUgbm8gY29va2llcyBhdCBhbGwuIEFsc28gcHJldmVudHMgb2RkIHJlc3VsdCB3aGVuXG5cdFx0XHQvLyBjYWxsaW5nIFwiZ2V0KClcIlxuXHRcdFx0dmFyIGNvb2tpZXMgPSBkb2N1bWVudC5jb29raWUgPyBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsgJykgOiBbXTtcblx0XHRcdHZhciByZGVjb2RlID0gLyglWzAtOUEtWl17Mn0pKy9nO1xuXHRcdFx0dmFyIGkgPSAwO1xuXG5cdFx0XHRmb3IgKDsgaSA8IGNvb2tpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0dmFyIHBhcnRzID0gY29va2llc1tpXS5zcGxpdCgnPScpO1xuXHRcdFx0XHR2YXIgY29va2llID0gcGFydHMuc2xpY2UoMSkuam9pbignPScpO1xuXG5cdFx0XHRcdGlmIChjb29raWUuY2hhckF0KDApID09PSAnXCInKSB7XG5cdFx0XHRcdFx0Y29va2llID0gY29va2llLnNsaWNlKDEsIC0xKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0dmFyIG5hbWUgPSBwYXJ0c1swXS5yZXBsYWNlKHJkZWNvZGUsIGRlY29kZVVSSUNvbXBvbmVudCk7XG5cdFx0XHRcdFx0Y29va2llID0gY29udmVydGVyLnJlYWQgP1xuXHRcdFx0XHRcdFx0Y29udmVydGVyLnJlYWQoY29va2llLCBuYW1lKSA6IGNvbnZlcnRlcihjb29raWUsIG5hbWUpIHx8XG5cdFx0XHRcdFx0XHRjb29raWUucmVwbGFjZShyZGVjb2RlLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXG5cdFx0XHRcdFx0aWYgKHRoaXMuanNvbikge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Y29va2llID0gSlNPTi5wYXJzZShjb29raWUpO1xuXHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoa2V5ID09PSBuYW1lKSB7XG5cdFx0XHRcdFx0XHRyZXN1bHQgPSBjb29raWU7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIWtleSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0W25hbWVdID0gY29va2llO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHR9XG5cblx0XHRhcGkuc2V0ID0gYXBpO1xuXHRcdGFwaS5nZXQgPSBmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRyZXR1cm4gYXBpKGtleSk7XG5cdFx0fTtcblx0XHRhcGkuZ2V0SlNPTiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBhcGkuYXBwbHkoe1xuXHRcdFx0XHRqc29uOiB0cnVlXG5cdFx0XHR9LCBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuXHRcdH07XG5cdFx0YXBpLmRlZmF1bHRzID0ge307XG5cblx0XHRhcGkucmVtb3ZlID0gZnVuY3Rpb24gKGtleSwgYXR0cmlidXRlcykge1xuXHRcdFx0YXBpKGtleSwgJycsIGV4dGVuZChhdHRyaWJ1dGVzLCB7XG5cdFx0XHRcdGV4cGlyZXM6IC0xXG5cdFx0XHR9KSk7XG5cdFx0fTtcblxuXHRcdGFwaS53aXRoQ29udmVydGVyID0gaW5pdDtcblxuXHRcdHJldHVybiBhcGk7XG5cdH1cblxuXHRyZXR1cm4gaW5pdChmdW5jdGlvbiAoKSB7fSk7XG59KSk7XG4iLCJ2YXIgdXRpbHMgPSByZXF1aXJlKFwiLi91dGlscy5qc1wiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmJveEFsaWduZWRUZXh0O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgQmJveEFsaWduZWRUZXh0IG9iamVjdCAtIGEgdGV4dCBvYmplY3QgdGhhdCBjYW4gYmUgZHJhd24gd2l0aFxyXG4gKiBhbmNob3IgcG9pbnRzIGJhc2VkIG9uIGEgdGlnaHQgYm91bmRpbmcgYm94IGFyb3VuZCB0aGUgdGV4dC5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBmb250IC0gcDUuRm9udCBvYmplY3RcclxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgLSBTdHJpbmcgdG8gZGlzcGxheVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW2ZvbnRTaXplPTEyXSAtIEZvbnQgc2l6ZSB0byB1c2UgZm9yIHN0cmluZ1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW3g9MF0gLSBJbml0aWFsIHggbG9jYXRpb25cclxuICogQHBhcmFtIHtudW1iZXJ9IFt5PTBdIC0gSW5pdGlhbCB5IGxvY2F0aW9uXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcEluc3RhbmNlPXdpbmRvd10gLSBSZWZlcmVuY2UgdG8gcDUgaW5zdGFuY2UsIGxlYXZlIGJsYW5rIGlmXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2V0Y2ggaXMgZ2xvYmFsXHJcbiAqIEBleGFtcGxlXHJcbiAqIHZhciBmb250LCBiYm94VGV4dDtcclxuICogZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICogICAgIGZvbnQgPSBsb2FkRm9udChcIi4vYXNzZXRzL1JlZ3VsYXIudHRmXCIpO1xyXG4gKiB9XHJcbiAqIGZ1bmN0aW9uIHNldHVwKCkge1xyXG4gKiAgICAgY3JlYXRlQ2FudmFzKDQwMCwgNjAwKTtcclxuICogICAgIGJhY2tncm91bmQoMCk7XHJcbiAqICAgICBcclxuICogICAgIGJib3hUZXh0ID0gbmV3IEJib3hBbGlnbmVkVGV4dChmb250LCBcIkhleSFcIiwgMzApOyAgICBcclxuICogICAgIGJib3hUZXh0LnNldFJvdGF0aW9uKFBJIC8gNCk7XHJcbiAqICAgICBiYm94VGV4dC5zZXRBbmNob3IoQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9DRU5URVIsIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSKTtcclxuICogICAgIFxyXG4gKiAgICAgZmlsbChcIiMwMEE4RUFcIik7XHJcbiAqICAgICBub1N0cm9rZSgpO1xyXG4gKiAgICAgYmJveFRleHQuZHJhdyh3aWR0aCAvIDIsIGhlaWdodCAvIDIpO1xyXG4gKiB9XHJcbiAqL1xyXG5mdW5jdGlvbiBCYm94QWxpZ25lZFRleHQoZm9udCwgdGV4dCwgZm9udFNpemUsIHgsIHksIHBJbnN0YW5jZSkge1xyXG4gICAgdGhpcy5fZm9udCA9IGZvbnQ7XHJcbiAgICB0aGlzLl90ZXh0ID0gdGV4dDtcclxuICAgIHRoaXMuX3ggPSB1dGlscy5kZWZhdWx0KHgsIDApO1xyXG4gICAgdGhpcy5feSA9IHV0aWxzLmRlZmF1bHQoeSwgMCk7XHJcbiAgICB0aGlzLl9mb250U2l6ZSA9IHV0aWxzLmRlZmF1bHQoZm9udFNpemUsIDEyKTtcclxuICAgIHRoaXMuX3AgPSB1dGlscy5kZWZhdWx0KHBJbnN0YW5jZSwgd2luZG93KTtcclxuICAgIHRoaXMuX3JvdGF0aW9uID0gMDtcclxuICAgIHRoaXMuX2hBbGlnbiA9IEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfQ0VOVEVSO1xyXG4gICAgdGhpcy5fdkFsaWduID0gQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVI7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVNZXRyaWNzKHRydWUpO1xyXG59XHJcblxyXG4vKipcclxuICogVmVydGljYWwgYWxpZ25tZW50IHZhbHVlc1xyXG4gKiBAcHVibGljXHJcbiAqIEBzdGF0aWNcclxuICogQHJlYWRvbmx5XHJcbiAqIEBlbnVtIHtzdHJpbmd9XHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQuQUxJR04gPSB7XHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBsZWZ0IG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfTEVGVDogXCJib3hfbGVmdFwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgY2VudGVyIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfQ0VOVEVSOiBcImJveF9jZW50ZXJcIixcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIHJpZ2h0IG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfUklHSFQ6IFwiYm94X3JpZ2h0XCJcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlbGluZSBhbGlnbm1lbnQgdmFsdWVzXHJcbiAqIEBwdWJsaWNcclxuICogQHN0YXRpY1xyXG4gKiBAcmVhZG9ubHlcclxuICogQGVudW0ge3N0cmluZ31cclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5CQVNFTElORSA9IHtcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIHRvcCBvZiB0aGUgYmJveCAqL1xyXG4gICAgQk9YX1RPUDogXCJib3hfdG9wXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9DRU5URVI6IFwiYm94X2NlbnRlclwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgYm90dG9tIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfQk9UVE9NOiBcImJveF9ib3R0b21cIixcclxuICAgIC8qKiBcclxuICAgICAqIERyYXcgZnJvbSBoYWxmIHRoZSBoZWlnaHQgb2YgdGhlIGZvbnQuIFNwZWNpZmljYWxseSB0aGUgaGVpZ2h0IGlzXHJcbiAgICAgKiBjYWxjdWxhdGVkIGFzOiBhc2NlbnQgKyBkZXNjZW50LlxyXG4gICAgICovXHJcbiAgICBGT05UX0NFTlRFUjogXCJmb250X2NlbnRlclwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgdGhlIG5vcm1hbCBmb250IGJhc2VsaW5lICovXHJcbiAgICBBTFBIQUJFVElDOiBcImFscGhhYmV0aWNcIlxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCBjdXJyZW50IHRleHRcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gVGV4dCBzdHJpbmcgdG8gZGlzcGxheVxyXG4gKiBAcmV0dXJucyB7dGhpc30gVXNlZnVsIGZvciBjaGFpbmluZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRUZXh0ID0gZnVuY3Rpb24oc3RyaW5nKSB7XHJcbiAgICB0aGlzLl90ZXh0ID0gc3RyaW5nO1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlTWV0cmljcyhmYWxzZSk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIHRleHQgcG9zaXRpb25cclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0geCAtIFggcG9zaXRpb25cclxuICogQHBhcmFtIHtudW1iZXJ9IHggLSBZIHBvc2l0aW9uXHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oeCwgeSkge1xyXG4gICAgdGhpcy5feCA9IHV0aWxzLmRlZmF1bHQoeCwgdGhpcy5feCk7XHJcbiAgICB0aGlzLl95ID0gdXRpbHMuZGVmYXVsdCh5LCB0aGlzLl95KTtcclxuICAgIHJldHVybiB0aGlzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgdGV4dCBwb3NpdGlvblxyXG4gKiBAcHVibGljXHJcbiAqIEByZXR1cm4ge29iamVjdH0gUmV0dXJucyBhbiBvYmplY3Qgd2l0aCBwcm9wZXJ0aWVzOiB4LCB5XHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLmdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHRoaXMuX3gsXHJcbiAgICAgICAgeTogdGhpcy5feVxyXG4gICAgfTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgY3VycmVudCB0ZXh0IHNpemVcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0gZm9udFNpemUgVGV4dCBzaXplXHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFRleHRTaXplID0gZnVuY3Rpb24oZm9udFNpemUpIHtcclxuICAgIHRoaXMuX2ZvbnRTaXplID0gZm9udFNpemU7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVNZXRyaWNzKHRydWUpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IHJvdGF0aW9uIG9mIHRleHRcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgLSBSb3RhdGlvbiBpbiByYWRpYW5zXHJcbiAqIEByZXR1cm5zIHt0aGlzfSBVc2VmdWwgZm9yIGNoYWluaW5nXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFJvdGF0aW9uID0gZnVuY3Rpb24oYW5nbGUpIHtcclxuICAgIHRoaXMuX3JvdGF0aW9uID0gdXRpbHMuZGVmYXVsdChhbmdsZSwgdGhpcy5fcm90YXRpb24pO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IHJvdGF0aW9uIG9mIHRleHRcclxuICogQHB1YmxpY1xyXG4gKiBAcmV0dXJucyB7bnVtYmVyfSBSb3RhdGlvbiBpbiByYWRpYW5zXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLmdldFJvdGF0aW9uID0gZnVuY3Rpb24oYW5nbGUpIHtcclxuICAgIHJldHVybiB0aGlzLl9yb3RhdGlvbjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgdGhlIHAgaW5zdGFuY2UgdGhhdCBpcyB1c2VkIGZvciBkcmF3aW5nXHJcbiAqIEBwdWJsaWNcclxuICogQHBhcmFtIHtvYmplY3R9IHAgLSBJbnN0YW5jZSBvZiBwNSBmb3IgZHJhd2luZy4gVGhpcyBpcyBvbmx5IG5lZWRlZCB3aGVuIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgIHVzaW5nIGFuIG9mZnNjcmVlbiByZW5kZXJlciBvciB3aGVuIHVzaW5nIHA1IGluIGluc3RhbmNlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgbW9kZS5cclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0UEluc3RhbmNlID0gZnVuY3Rpb24ocCkge1xyXG4gICAgdGhpcy5fcCA9IHV0aWxzLmRlZmF1bHQocCwgdGhpcy5fcCk7XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgcm90YXRpb24gb2YgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEByZXR1cm5zIHtvYmplY3R9IEluc3RhbmNlIG9mIHA1IHRoYXQgaXMgYmVpbmcgdXNlZCBmb3IgZHJhd2luZ1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRQSW5zdGFuY2UgPSBmdW5jdGlvbigpIHtcclxuICAgIHJldHVybiB0aGlzLl9wO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCBhbmNob3IgcG9pbnQgZm9yIHRleHQgKGhvcml6b25hbCBhbmQgdmVydGljYWwgYWxpZ25tZW50KSByZWxhdGl2ZSB0b1xyXG4gKiBib3VuZGluZyBib3hcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2hBbGlnbj1DRU5URVJdIC0gSG9yaXpvbmFsIGFsaWdubWVudFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW3ZBbGlnbj1DRU5URVJdIC0gVmVydGljYWwgYmFzZWxpbmVcclxuICogQHBhcmFtIHtib29sZWFufSBbdXBkYXRlUG9zaXRpb249ZmFsc2VdIC0gSWYgc2V0IHRvIHRydWUsIHRoZSBwb3NpdGlvbiBvZiB0aGVcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHRleHQgd2lsbCBiZSBzaGlmdGVkIHNvIHRoYXRcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHRleHQgd2lsbCBiZSBkcmF3biBpbiB0aGUgc2FtZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZSBpdCB3YXMgYmVmb3JlIGNhbGxpbmcgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldEFuY2hvci5cclxuICogQHJldHVybnMge3RoaXN9IFVzZWZ1bCBmb3IgY2hhaW5pbmdcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0QW5jaG9yID0gZnVuY3Rpb24oaEFsaWduLCB2QWxpZ24sIHVwZGF0ZVBvc2l0aW9uKSB7XHJcbiAgICB2YXIgb2xkUG9zID0gdGhpcy5fY2FsY3VsYXRlQWxpZ25lZENvb3Jkcyh0aGlzLl94LCB0aGlzLl95KTtcclxuICAgIHRoaXMuX2hBbGlnbiA9IHV0aWxzLmRlZmF1bHQoaEFsaWduLCBCYm94QWxpZ25lZFRleHQuQUxJR04uQ0VOVEVSKTtcclxuICAgIHRoaXMuX3ZBbGlnbiA9IHV0aWxzLmRlZmF1bHQodkFsaWduLCBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQ0VOVEVSKTtcclxuICAgIGlmICh1cGRhdGVQb3NpdGlvbikge1xyXG4gICAgICAgIHZhciBuZXdQb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHRoaXMuX3gsIHRoaXMuX3kpO1xyXG4gICAgICAgIHRoaXMuX3ggKz0gb2xkUG9zLnggLSBuZXdQb3MueDtcclxuICAgICAgICB0aGlzLl95ICs9IG9sZFBvcy55IC0gbmV3UG9zLnk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGJvdW5kaW5nIGJveCB3aGVuIHRoZSB0ZXh0IGlzIHBsYWNlZCBhdCB0aGUgc3BlY2lmaWVkIGNvb3JkaW5hdGVzLlxyXG4gKiBOb3RlOiB0aGlzIGlzIHRoZSB1bnJvdGF0ZWQgYm91bmRpbmcgYm94ISBUT0RPOiBGaXggdGhpcy5cclxuICogQHBhcmFtIHtudW1iZXJ9IFt4PWN1cnJlbnQgeF0gLSBBIG5ldyB4IGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3IuIFRoaXNcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWxsIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGVybWFuZW50bHkuIFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3k9Y3VycmVudCB5XSAtIEEgbmV3IHkgY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpc1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbGwgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJtYW5lbnRseS5cclxuICogQHJldHVybiB7b2JqZWN0fSBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXM6IHgsIHksIHcsIGhcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0QmJveCA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICB2YXIgcG9zID0gdGhpcy5fY2FsY3VsYXRlQWxpZ25lZENvb3Jkcyh0aGlzLl94LCB0aGlzLl95KTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogcG9zLnggKyB0aGlzLl9ib3VuZHNPZmZzZXQueCxcclxuICAgICAgICB5OiBwb3MueSArIHRoaXMuX2JvdW5kc09mZnNldC55LFxyXG4gICAgICAgIHc6IHRoaXMud2lkdGgsXHJcbiAgICAgICAgaDogdGhpcy5oZWlnaHRcclxuICAgIH07XHJcbn07XHJcblxyXG4vKipcclxuICogR2V0IGFuIGFycmF5IG9mIHBvaW50cyB0aGF0IGZvbGxvdyBhbG9uZyB0aGUgdGV4dCBwYXRoLiBUaGlzIHdpbGwgdGFrZSBpbnRvXHJcbiAqIGNvbnNpZGVyYXRpb24gdGhlIGN1cnJlbnQgYWxpZ25tZW50IHNldHRpbmdzLlxyXG4gKiBOb3RlOiB0aGlzIGlzIGEgdGhpbiB3cmFwcGVyIGFyb3VuZCBhIHA1IG1ldGhvZCBhbmQgZG9lc24ndCBoYW5kbGUgdW5yb3RhdGVkXHJcbiAqIHRleHQhIFRPRE86IEZpeCB0aGlzLlxyXG4gKiBAcGFyYW0ge251bWJlcn0gW3g9Y3VycmVudCB4XSAtIEEgbmV3IHggY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpc1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbGwgY2hhbmdlIHRoZSB0ZXh0J3MgeCBwb3NpdGlvbiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwZXJtYW5lbnRseS4gXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbeT1jdXJyZW50IHldIC0gQSBuZXcgeSBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yLiBUaGlzXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lsbCBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBlcm1hbmVudGx5LlxyXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdIC0gQW4gb2JqZWN0IHRoYXQgY2FuIGhhdmU6XHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gc2FtcGxlRmFjdG9yOiByYXRpbyBvZiBwYXRoLWxlbmd0aCB0byBudW1iZXJcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvZiBzYW1wbGVzIChkZWZhdWx0PTAuMjUpLiBIaWdoZXIgdmFsdWVzIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHlpZWxkIG1vcmVwb2ludHMgYW5kIGFyZSB0aGVyZWZvcmUgbW9yZSBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVjaXNlLiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBzaW1wbGlmeVRocmVzaG9sZDogaWYgc2V0IHRvIGEgbm9uLXplcm8gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUsIGNvbGxpbmVhciBwb2ludHMgd2lsbCBiZSByZW1vdmVkLiBUaGVcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSByZXByZXNlbnRzIHRoZSB0aHJlc2hvbGQgYW5nbGUgdG8gdXNlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hlbiBkZXRlcm1pbmluZyB3aGV0aGVyIHR3byBlZGdlcyBhcmUgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGluZWFyLlxyXG4gKiBAcmV0dXJuIHthcnJheX0gQW4gYXJyYXkgb2YgcG9pbnRzLCBlYWNoIHdpdGggeCwgeSAmIGFscGhhICh0aGUgcGF0aCBhbmdsZSlcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0VGV4dFBvaW50cyA9IGZ1bmN0aW9uKHgsIHksIG9wdGlvbnMpIHtcclxuICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5fZm9udC50ZXh0VG9Qb2ludHModGhpcy5fdGV4dCwgdGhpcy5feCwgdGhpcy5feSwgXHJcbiAgICAgICAgdGhpcy5fZm9udFNpemUsIG9wdGlvbnMpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgcG9zID0gdGhpcy5fY2FsY3VsYXRlQWxpZ25lZENvb3Jkcyhwb2ludHNbaV0ueCwgcG9pbnRzW2ldLnkpO1xyXG4gICAgICAgIHBvaW50c1tpXS54ID0gcG9zLng7XHJcbiAgICAgICAgcG9pbnRzW2ldLnkgPSBwb3MueTtcclxuICAgIH1cclxuICAgIHJldHVybiBwb2ludHM7XHJcbn07XHJcblxyXG4vKipcclxuICogRHJhd3MgdGhlIHRleHQgcGFydGljbGUgd2l0aCB0aGUgc3BlY2lmaWVkIHN0eWxlIHBhcmFtZXRlcnMuIE5vdGU6IHRoaXMgaXNcclxuICogZ29pbmcgdG8gc2V0IHRoZSB0ZXh0Rm9udCwgdGV4dFNpemUgJiByb3RhdGlvbiBiZWZvcmUgZHJhd2luZy4gWW91IHNob3VsZCBzZXRcclxuICogdGhlIGNvbG9yL3N0cm9rZS9maWxsIHRoYXQgeW91IHdhbnQgYmVmb3JlIGRyYXdpbmcuIFRoaXMgZnVuY3Rpb24gd2lsbCBjbGVhblxyXG4gKiB1cCBhZnRlciBpdHNlbGYgYW5kIHJlc2V0IHN0eWxpbmcgYmFjayB0byB3aGF0IGl0IHdhcyBiZWZvcmUgaXQgd2FzIGNhbGxlZC5cclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW3g9Y3VycmVudCB4XSAtIEEgbmV3IHggY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvci4gVGhpcyB3aWxsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2UgdGhlIHRleHQncyB4IHBvc2l0aW9uIHBlcm1hbmVudGx5LiBcclxuICogQHBhcmFtIHtudW1iZXJ9IFt5PWN1cnJlbnQgeV0gLSBBIG5ldyB5IGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3IuIFRoaXMgd2lsbFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZSB0aGUgdGV4dCdzIHggcG9zaXRpb24gcGVybWFuZW50bHkuXHJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2RyYXdCb3VuZHM9ZmFsc2VdIC0gRmxhZyBmb3IgZHJhd2luZyBib3VuZGluZyBib3hcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHgsIHksIGRyYXdCb3VuZHMpIHtcclxuICAgIGRyYXdCb3VuZHMgPSB1dGlscy5kZWZhdWx0KGRyYXdCb3VuZHMsIGZhbHNlKTtcclxuICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XHJcbiAgICB2YXIgcG9zID0ge1xyXG4gICAgICAgIHg6IHRoaXMuX3gsIFxyXG4gICAgICAgIHk6IHRoaXMuX3lcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5fcC5wdXNoKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9yb3RhdGlvbikge1xyXG4gICAgICAgICAgICBwb3MgPSB0aGlzLl9jYWxjdWxhdGVSb3RhdGVkQ29vcmRzKHBvcy54LCBwb3MueSwgdGhpcy5fcm90YXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLl9wLnJvdGF0ZSh0aGlzLl9yb3RhdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBwb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHBvcy54LCBwb3MueSk7XHJcblxyXG4gICAgICAgIHRoaXMuX3AudGV4dEFsaWduKHRoaXMuX3AuTEVGVCwgdGhpcy5fcC5CQVNFTElORSk7XHJcbiAgICAgICAgdGhpcy5fcC50ZXh0Rm9udCh0aGlzLl9mb250KTtcclxuICAgICAgICB0aGlzLl9wLnRleHRTaXplKHRoaXMuX2ZvbnRTaXplKTtcclxuICAgICAgICB0aGlzLl9wLnRleHQodGhpcy5fdGV4dCwgcG9zLngsIHBvcy55KTtcclxuXHJcbiAgICAgICAgaWYgKGRyYXdCb3VuZHMpIHtcclxuICAgICAgICAgICAgdGhpcy5fcC5zdHJva2UoMjAwKTtcclxuICAgICAgICAgICAgdmFyIGJvdW5kc1ggPSBwb3MueCArIHRoaXMuX2JvdW5kc09mZnNldC54O1xyXG4gICAgICAgICAgICB2YXIgYm91bmRzWSA9IHBvcy55ICsgdGhpcy5fYm91bmRzT2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIHRoaXMuX3Aubm9GaWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX3AucmVjdChib3VuZHNYLCBib3VuZHNZLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG5cclxuICAgIHRoaXMuX3AucG9wKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogUHJvamVjdCB0aGUgY29vcmRpbmF0ZXMgKHgsIHkpIGludG8gYSByb3RhdGVkIGNvb3JkaW5hdGUgc3lzdGVtXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB4IC0gWCBjb29yZGluYXRlIChpbiB1bnJvdGF0ZWQgc3BhY2UpXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB5IC0gWSBjb29yZGluYXRlIChpbiB1bnJvdGF0ZWQgc3BhY2UpXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSAtIFJhZGlhbnMgb2Ygcm90YXRpb24gdG8gYXBwbHlcclxuICogQHJldHVybiB7b2JqZWN0fSBPYmplY3Qgd2l0aCB4ICYgeSBwcm9wZXJ0aWVzXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLl9jYWxjdWxhdGVSb3RhdGVkQ29vcmRzID0gZnVuY3Rpb24gKHgsIHksIGFuZ2xlKSB7ICBcclxuICAgIHZhciByeCA9IE1hdGguY29zKGFuZ2xlKSAqIHggKyBNYXRoLmNvcyhNYXRoLlBJIC8gMiAtIGFuZ2xlKSAqIHk7XHJcbiAgICB2YXIgcnkgPSAtTWF0aC5zaW4oYW5nbGUpICogeCArIE1hdGguc2luKE1hdGguUEkgLyAyIC0gYW5nbGUpICogeTtcclxuICAgIHJldHVybiB7eDogcngsIHk6IHJ5fTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIGRyYXcgY29vcmRpbmF0ZXMgZm9yIHRoZSB0ZXh0LCBhbGlnbmluZyBiYXNlZCBvbiB0aGUgYm91bmRpbmcgYm94LlxyXG4gKiBUaGUgdGV4dCBpcyBldmVudHVhbGx5IGRyYXduIHdpdGggY2FudmFzIGFsaWdubWVudCBzZXQgdG8gbGVmdCAmIGJhc2VsaW5lLCBzb1xyXG4gKiB0aGlzIGZ1bmN0aW9uIHRha2VzIGEgZGVzaXJlZCBwb3MgJiBhbGlnbm1lbnQgYW5kIHJldHVybnMgdGhlIGFwcHJvcHJpYXRlXHJcbiAqIGNvb3JkaW5hdGVzIGZvciB0aGUgbGVmdCAmIGJhc2VsaW5lLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0geCAtIFggY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0ge251bWJlcn0geSAtIFkgY29vcmRpbmF0ZVxyXG4gKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCB3aXRoIHggJiB5IHByb3BlcnRpZXNcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHMgPSBmdW5jdGlvbih4LCB5KSB7XHJcbiAgICB2YXIgbmV3WCwgbmV3WTtcclxuICAgIHN3aXRjaCAodGhpcy5faEFsaWduKSB7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQUxJR04uQk9YX0xFRlQ6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfQ0VOVEVSOlxyXG4gICAgICAgICAgICBuZXdYID0geCAtIHRoaXMuaGFsZldpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfUklHSFQ6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4IC0gdGhpcy53aWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgbmV3WCA9IHg7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5yZWNvZ25pemVkIGhvcml6b25hbCBhbGlnbjpcIiwgdGhpcy5faEFsaWduKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBzd2l0Y2ggKHRoaXMuX3ZBbGlnbikge1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9UT1A6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5IC0gdGhpcy5fYm91bmRzT2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVI6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5ICsgdGhpcy5fZGlzdEJhc2VUb01pZDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0JPVFRPTTpcclxuICAgICAgICAgICAgbmV3WSA9IHkgLSB0aGlzLl9kaXN0QmFzZVRvQm90dG9tO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5GT05UX0NFTlRFUjpcclxuICAgICAgICAgICAgLy8gSGVpZ2h0IGlzIGFwcHJveGltYXRlZCBhcyBhc2NlbnQgKyBkZXNjZW50XHJcbiAgICAgICAgICAgIG5ld1kgPSB5IC0gdGhpcy5fZGVzY2VudCArICh0aGlzLl9hc2NlbnQgKyB0aGlzLl9kZXNjZW50KSAvIDI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkFMUEhBQkVUSUM6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBuZXdZID0geTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbnJlY29nbml6ZWQgdmVydGljYWwgYWxpZ246XCIsIHRoaXMuX3ZBbGlnbik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHt4OiBuZXdYLCB5OiBuZXdZfTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyBib3VuZGluZyBib3ggYW5kIHZhcmlvdXMgbWV0cmljcyBmb3IgdGhlIGN1cnJlbnQgdGV4dCBhbmQgZm9udFxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5fY2FsY3VsYXRlTWV0cmljcyA9IGZ1bmN0aW9uKHNob3VsZFVwZGF0ZUhlaWdodCkgeyAgXHJcbiAgICAvLyBwNSAwLjUuMCBoYXMgYSBidWcgLSB0ZXh0IGJvdW5kcyBhcmUgY2xpcHBlZCBieSAoMCwgMClcclxuICAgIC8vIENhbGN1bGF0aW5nIGJvdW5kcyBoYWNrXHJcbiAgICB2YXIgYm91bmRzID0gdGhpcy5fZm9udC50ZXh0Qm91bmRzKHRoaXMuX3RleHQsIDEwMDAsIDEwMDAsIHRoaXMuX2ZvbnRTaXplKTtcclxuICAgIC8vIEJvdW5kcyBpcyBhIHJlZmVyZW5jZSAtIGlmIHdlIG1lc3Mgd2l0aCBpdCBkaXJlY3RseSwgd2UgY2FuIG1lc3MgdXAgXHJcbiAgICAvLyBmdXR1cmUgdmFsdWVzISAoSXQgY2hhbmdlcyB0aGUgYmJveCBjYWNoZSBpbiBwNS4pXHJcbiAgICBib3VuZHMgPSB7IFxyXG4gICAgICAgIHg6IGJvdW5kcy54IC0gMTAwMCwgXHJcbiAgICAgICAgeTogYm91bmRzLnkgLSAxMDAwLCBcclxuICAgICAgICB3OiBib3VuZHMudywgXHJcbiAgICAgICAgaDogYm91bmRzLmggXHJcbiAgICB9OyBcclxuXHJcbiAgICBpZiAoc2hvdWxkVXBkYXRlSGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5fYXNjZW50ID0gdGhpcy5fZm9udC5fdGV4dEFzY2VudCh0aGlzLl9mb250U2l6ZSk7XHJcbiAgICAgICAgdGhpcy5fZGVzY2VudCA9IHRoaXMuX2ZvbnQuX3RleHREZXNjZW50KHRoaXMuX2ZvbnRTaXplKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2UgYm91bmRzIHRvIGNhbGN1bGF0ZSBmb250IG1ldHJpY3NcclxuICAgIHRoaXMud2lkdGggPSBib3VuZHMudztcclxuICAgIHRoaXMuaGVpZ2h0ID0gYm91bmRzLmg7XHJcbiAgICB0aGlzLmhhbGZXaWR0aCA9IHRoaXMud2lkdGggLyAyO1xyXG4gICAgdGhpcy5oYWxmSGVpZ2h0ID0gdGhpcy5oZWlnaHQgLyAyO1xyXG4gICAgdGhpcy5fYm91bmRzT2Zmc2V0ID0geyB4OiBib3VuZHMueCwgeTogYm91bmRzLnkgfTtcclxuICAgIHRoaXMuX2Rpc3RCYXNlVG9NaWQgPSBNYXRoLmFicyhib3VuZHMueSkgLSB0aGlzLmhhbGZIZWlnaHQ7XHJcbiAgICB0aGlzLl9kaXN0QmFzZVRvQm90dG9tID0gdGhpcy5oZWlnaHQgLSBNYXRoLmFicyhib3VuZHMueSk7XHJcbn07IiwiZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24odmFsdWUsIGRlZmF1bHRWYWx1ZSkge1xyXG4gICAgcmV0dXJuICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSA/IHZhbHVlIDogZGVmYXVsdFZhbHVlO1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gSG92ZXJTbGlkZXNob3dzO1xyXG5cclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEhvdmVyU2xpZGVzaG93cyhzbGlkZXNob3dEZWxheSwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl9zbGlkZXNob3dEZWxheSA9IChzbGlkZXNob3dEZWxheSAhPT0gdW5kZWZpbmVkKSA/IHNsaWRlc2hvd0RlbGF5IDogXHJcbiAgICAgICAgMjAwMDtcclxuICAgIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9ICh0cmFuc2l0aW9uRHVyYXRpb24gIT09IHVuZGVmaW5lZCkgPyBcclxuICAgICAgICBfdHJhbnNpdGlvbkR1cmF0aW9uIDogMTAwMDsgICBcclxuXHJcbiAgICB0aGlzLl9zbGlkZXNob3dzID0gW107XHJcbiAgICB0aGlzLnJlbG9hZCgpO1xyXG59XHJcblxyXG5Ib3ZlclNsaWRlc2hvd3MucHJvdG90eXBlLnJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIE5vdGU6IHRoaXMgaXMgY3VycmVudGx5IG5vdCByZWFsbHkgYmVpbmcgdXNlZC4gV2hlbiBhIHBhZ2UgaXMgbG9hZGVkLFxyXG4gICAgLy8gbWFpbi5qcyBpcyBqdXN0IHJlLWluc3RhbmNpbmcgdGhlIEhvdmVyU2xpZGVzaG93c1xyXG4gICAgdmFyIG9sZFNsaWRlc2hvd3MgPSB0aGlzLl9zbGlkZXNob3dzIHx8IFtdO1xyXG4gICAgdGhpcy5fc2xpZGVzaG93cyA9IFtdO1xyXG4gICAgJChcIi5ob3Zlci1zbGlkZXNob3dcIikuZWFjaChmdW5jdGlvbiAoXywgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5fZmluZEluU2xpZGVzaG93cyhlbGVtZW50LCBvbGRTbGlkZXNob3dzKTtcclxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBzbGlkZXNob3cgPSBvbGRTbGlkZXNob3dzLnNwbGljZShpbmRleCwgMSlbMF07XHJcbiAgICAgICAgICAgIHRoaXMuX3NsaWRlc2hvd3MucHVzaChzbGlkZXNob3cpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NsaWRlc2hvd3MucHVzaChuZXcgU2xpZGVzaG93KCRlbGVtZW50LCB0aGlzLl9zbGlkZXNob3dEZWxheSxcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbikpO1xyXG4gICAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5Ib3ZlclNsaWRlc2hvd3MucHJvdG90eXBlLl9maW5kSW5TbGlkZXNob3dzID0gZnVuY3Rpb24gKGVsZW1lbnQsIHNsaWRlc2hvd3MpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzaG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmIChlbGVtZW50ID09PSBzbGlkZXNob3dzW2ldLmdldEVsZW1lbnQoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gLTE7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBTbGlkZXNob3coJGNvbnRhaW5lciwgc2xpZGVzaG93RGVsYXksIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lciA9ICRjb250YWluZXI7XHJcbiAgICB0aGlzLl9zbGlkZXNob3dEZWxheSA9IHNsaWRlc2hvd0RlbGF5O1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gdHJhbnNpdGlvbkR1cmF0aW9uO1xyXG4gICAgdGhpcy5fdGltZW91dElkID0gbnVsbDtcclxuICAgIHRoaXMuX2ltYWdlSW5kZXggPSAwO1xyXG4gICAgdGhpcy5fJGltYWdlcyA9IFtdO1xyXG5cclxuICAgIC8vIFNldCB1cCBhbmQgY2FjaGUgcmVmZXJlbmNlcyB0byBpbWFnZXNcclxuICAgIHRoaXMuXyRjb250YWluZXIuZmluZChcImltZ1wiKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciAkaW1hZ2UgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgICRpbWFnZS5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICB0b3A6IFwiMFwiLFxyXG4gICAgICAgICAgICBsZWZ0OiBcIjBcIixcclxuICAgICAgICAgICAgekluZGV4OiAoaW5kZXggPT09IDApID8gMiA6IDAgLy8gRmlyc3QgaW1hZ2Ugc2hvdWxkIGJlIG9uIHRvcFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXMucHVzaCgkaW1hZ2UpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0byBiaW5kIGludGVyYWN0aXZpdHlcclxuICAgIHRoaXMuX251bUltYWdlcyA9IHRoaXMuXyRpbWFnZXMubGVuZ3RoO1xyXG4gICAgaWYgKHRoaXMuX251bUltYWdlcyA8PSAxKSByZXR1cm47XHJcblxyXG4gICAgLy8gQmluZCBldmVudCBsaXN0ZW5lcnNcclxuICAgIHRoaXMuXyRjb250YWluZXIub24oXCJtb3VzZWVudGVyXCIsIHRoaXMuX29uRW50ZXIuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLl8kY29udGFpbmVyLm9uKFwibW91c2VsZWF2ZVwiLCB0aGlzLl9vbkxlYXZlLmJpbmQodGhpcykpO1xyXG5cclxufVxyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXRFbGVtZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuXyRjb250YWluZXIuZ2V0KDApO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXQkRWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLl8kY29udGFpbmVyO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fb25FbnRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIEZpcnN0IHRyYW5zaXRpb24gc2hvdWxkIGhhcHBlbiBwcmV0dHkgc29vbiBhZnRlciBob3ZlcmluZyBpbiBvcmRlclxyXG4gICAgLy8gdG8gY2x1ZSB0aGUgdXNlciBpbnRvIHdoYXQgaXMgaGFwcGVuaW5nXHJcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2FkdmFuY2VTbGlkZXNob3cuYmluZCh0aGlzKSwgNTAwKTtcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX29uTGVhdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBjbGVhckludGVydmFsKHRoaXMuX3RpbWVvdXRJZCk7ICBcclxuICAgIHRoaXMuX3RpbWVvdXRJZCA9IG51bGw7ICAgICAgXHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLl9hZHZhbmNlU2xpZGVzaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5faW1hZ2VJbmRleCArPSAxO1xyXG4gICAgdmFyIGk7XHJcblxyXG4gICAgLy8gTW92ZSB0aGUgaW1hZ2UgZnJvbSAyIHN0ZXBzIGFnbyBkb3duIHRvIHRoZSBib3R0b20gei1pbmRleCBhbmQgbWFrZVxyXG4gICAgLy8gaXQgaW52aXNpYmxlXHJcbiAgICBpZiAodGhpcy5fbnVtSW1hZ2VzID49IDMpIHtcclxuICAgICAgICBpID0gdXRpbGl0aWVzLndyYXBJbmRleCh0aGlzLl9pbWFnZUluZGV4IC0gMiwgdGhpcy5fbnVtSW1hZ2VzKTtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VzW2ldLmNzcyh7XHJcbiAgICAgICAgICAgIHpJbmRleDogMCxcclxuICAgICAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXNbaV0udmVsb2NpdHkoXCJzdG9wXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE1vdmUgdGhlIGltYWdlIGZyb20gMSBzdGVwcyBhZ28gZG93biB0byB0aGUgbWlkZGxlIHotaW5kZXggYW5kIG1ha2VcclxuICAgIC8vIGl0IGNvbXBsZXRlbHkgdmlzaWJsZVxyXG4gICAgaWYgKHRoaXMuX251bUltYWdlcyA+PSAyKSB7XHJcbiAgICAgICAgaSA9IHV0aWxpdGllcy53cmFwSW5kZXgodGhpcy5faW1hZ2VJbmRleCAtIDEsIHRoaXMuX251bUltYWdlcyk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlc1tpXS5jc3Moe1xyXG4gICAgICAgICAgICB6SW5kZXg6IDEsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VzW2ldLnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBNb3ZlIHRoZSBjdXJyZW50IGltYWdlIHRvIHRoZSB0b3Agei1pbmRleCBhbmQgZmFkZSBpdCBpblxyXG4gICAgdGhpcy5faW1hZ2VJbmRleCA9IHV0aWxpdGllcy53cmFwSW5kZXgodGhpcy5faW1hZ2VJbmRleCwgdGhpcy5fbnVtSW1hZ2VzKTtcclxuICAgIHRoaXMuXyRpbWFnZXNbdGhpcy5faW1hZ2VJbmRleF0uY3NzKHtcclxuICAgICAgICB6SW5kZXg6IDIsXHJcbiAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLl8kaW1hZ2VzW3RoaXMuX2ltYWdlSW5kZXhdLnZlbG9jaXR5KHtcclxuICAgICAgICBvcGFjaXR5OiAxXHJcbiAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFwiZWFzZUluT3V0UXVhZFwiKTtcclxuXHJcbiAgICAvLyBTY2hlZHVsZSBuZXh0IHRyYW5zaXRpb25cclxuICAgIHRoaXMuX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fYWR2YW5jZVNsaWRlc2hvdy5iaW5kKHRoaXMpLCBcclxuICAgICAgICB0aGlzLl9zbGlkZXNob3dEZWxheSk7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBJbWFnZUdhbGxlcmllcztcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBJbWFnZUdhbGxlcmllcyh0cmFuc2l0aW9uRHVyYXRpb24pIHsgXHJcbiAgICB0cmFuc2l0aW9uRHVyYXRpb24gPSAodHJhbnNpdGlvbkR1cmF0aW9uICE9PSB1bmRlZmluZWQpID9cclxuICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb24gOiA0MDA7XHJcbiAgICB0aGlzLl9pbWFnZUdhbGxlcmllcyA9IFtdO1xyXG4gICAgJChcIi5pbWFnZS1nYWxsZXJ5XCIpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyIGdhbGxlcnkgPSBuZXcgSW1hZ2VHYWxsZXJ5KCQoZWxlbWVudCksIHRyYW5zaXRpb25EdXJhdGlvbik7XHJcbiAgICAgICAgdGhpcy5faW1hZ2VHYWxsZXJpZXMucHVzaChnYWxsZXJ5KTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEltYWdlR2FsbGVyeSgkY29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbjtcclxuICAgIHRoaXMuXyRjb250YWluZXIgPSAkY29udGFpbmVyO1xyXG4gICAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lciA9ICRjb250YWluZXIuZmluZChcIi5pbWFnZS1nYWxsZXJ5LXRodW1ibmFpbHNcIik7XHJcbiAgICB0aGlzLl9pbmRleCA9IDA7IC8vIEluZGV4IG9mIHNlbGVjdGVkIGltYWdlXHJcblxyXG4gICAgLy8gTG9vcCB0aHJvdWdoIHRoZSB0aHVtYm5haWxzLCBnaXZlIHRoZW0gYW4gaW5kZXggZGF0YSBhdHRyaWJ1dGUgYW5kIGNhY2hlXHJcbiAgICAvLyBhIHJlZmVyZW5jZSB0byB0aGVtIGluIGFuIGFycmF5XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlscyA9IFtdO1xyXG4gICAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci5maW5kKFwiaW1nXCIpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICR0aHVtYm5haWwgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgICR0aHVtYm5haWwuZGF0YShcImluZGV4XCIsIGluZGV4KTtcclxuICAgICAgICB0aGlzLl8kdGh1bWJuYWlscy5wdXNoKCR0aHVtYm5haWwpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgZW1wdHkgaW1hZ2VzIGluIHRoZSBnYWxsZXJ5IGZvciBlYWNoIHRodW1ibmFpbC4gVGhpcyBoZWxwcyB1cyBkb1xyXG4gICAgLy8gbGF6eSBsb2FkaW5nIG9mIGdhbGxlcnkgaW1hZ2VzIGFuZCBhbGxvd3MgdXMgdG8gY3Jvc3MtZmFkZSBpbWFnZXMuXHJcbiAgICB0aGlzLl8kZ2FsbGVyeUltYWdlcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl8kdGh1bWJuYWlscy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgaWQgZnJvbSB0aGUgcGF0aCB0byB0aGUgbGFyZ2UgaW1hZ2VcclxuICAgICAgICB2YXIgbGFyZ2VQYXRoID0gdGhpcy5fJHRodW1ibmFpbHNbaV0uZGF0YShcImxhcmdlLXBhdGhcIik7XHJcbiAgICAgICAgdmFyIGlkID0gbGFyZ2VQYXRoLnNwbGl0KFwiL1wiKS5wb3AoKS5zcGxpdChcIi5cIilbMF07XHJcbiAgICAgICAgdmFyICRnYWxsZXJ5SW1hZ2UgPSAkKFwiPGltZz5cIilcclxuICAgICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICAgICAgdG9wOiBcIjBweFwiLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogXCIwcHhcIixcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDAsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwid2hpdGVcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYXR0cihcImlkXCIsIGlkKVxyXG4gICAgICAgICAgICAuZGF0YShcImltYWdlLXVybFwiLCBsYXJnZVBhdGgpXHJcbiAgICAgICAgICAgIC5hcHBlbmRUbygkY29udGFpbmVyLmZpbmQoXCIuaW1hZ2UtZ2FsbGVyeS1zZWxlY3RlZFwiKSk7XHJcbiAgICAgICAgJGdhbGxlcnlJbWFnZS5nZXQoMCkuc3JjID0gbGFyZ2VQYXRoOyAvLyBUT0RPOiBNYWtlIHRoaXMgbGF6eSFcclxuICAgICAgICB0aGlzLl8kZ2FsbGVyeUltYWdlcy5wdXNoKCRnYWxsZXJ5SW1hZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFjdGl2YXRlIHRoZSBmaXJzdCB0aHVtYm5haWwgYW5kIGRpc3BsYXkgaXQgaW4gdGhlIGdhbGxlcnkgXHJcbiAgICB0aGlzLl9zd2l0Y2hBY3RpdmVJbWFnZSgwKTtcclxuXHJcbiAgICAvLyBCaW5kIHRoZSBldmVudCBoYW5kbGVycyB0byB0aGUgaW1hZ2VzXHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyLmZpbmQoXCJpbWdcIikub24oXCJjbGlja1wiLCB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5JbWFnZUdhbGxlcnkucHJvdG90eXBlLl9zd2l0Y2hBY3RpdmVJbWFnZSA9IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgLy8gUmVzZXQgYWxsIGltYWdlcyB0byBpbnZpc2libGUgYW5kIGxvd2VzdCB6LWluZGV4LiBUaGlzIGNvdWxkIGJlIHNtYXJ0ZXIsXHJcbiAgICAvLyBsaWtlIEhvdmVyU2xpZGVzaG93LCBhbmQgb25seSByZXNldCBleGFjdGx5IHdoYXQgd2UgbmVlZCwgYnV0IHdlIGFyZW4ndCBcclxuICAgIC8vIHdhc3RpbmcgdGhhdCBtYW55IGN5Y2xlcy5cclxuICAgIHRoaXMuXyRnYWxsZXJ5SW1hZ2VzLmZvckVhY2goZnVuY3Rpb24gKCRnYWxsZXJ5SW1hZ2UpIHtcclxuICAgICAgICAkZ2FsbGVyeUltYWdlLmNzcyh7XHJcbiAgICAgICAgICAgIFwiekluZGV4XCI6IDAsXHJcbiAgICAgICAgICAgIFwib3BhY2l0eVwiOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGdhbGxlcnlJbWFnZS52ZWxvY2l0eShcInN0b3BcIik7IC8vIFN0b3AgYW55IGFuaW1hdGlvbnNcclxuICAgIH0sIHRoaXMpO1xyXG5cclxuICAgIC8vIENhY2hlIHJlZmVyZW5jZXMgdG8gdGhlIGxhc3QgYW5kIGN1cnJlbnQgaW1hZ2UgJiB0aHVtYm5haWxzXHJcbiAgICB2YXIgJGxhc3RUaHVtYm5haWwgPSB0aGlzLl8kdGh1bWJuYWlsc1t0aGlzLl9pbmRleF07XHJcbiAgICB2YXIgJGxhc3RJbWFnZSA9IHRoaXMuXyRnYWxsZXJ5SW1hZ2VzW3RoaXMuX2luZGV4XTtcclxuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XHJcbiAgICB2YXIgJGN1cnJlbnRUaHVtYm5haWwgPSB0aGlzLl8kdGh1bWJuYWlsc1t0aGlzLl9pbmRleF07XHJcbiAgICB2YXIgJGN1cnJlbnRJbWFnZSA9IHRoaXMuXyRnYWxsZXJ5SW1hZ2VzW3RoaXMuX2luZGV4XTtcclxuXHJcbiAgICAvLyBBY3RpdmF0ZS9kZWFjdGl2YXRlIHRodW1ibmFpbHNcclxuICAgICRsYXN0VGh1bWJuYWlsLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgJGN1cnJlbnRUaHVtYm5haWwuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcblxyXG4gICAgLy8gTWFrZSB0aGUgbGFzdCBpbWFnZSB2aXNpc2JsZSBhbmQgdGhlbiBhbmltYXRlIHRoZSBjdXJyZW50IGltYWdlIGludG8gdmlld1xyXG4gICAgLy8gb24gdG9wIG9mIHRoZSBsYXN0XHJcbiAgICAkbGFzdEltYWdlLmNzcyhcInpJbmRleFwiLCAxKTtcclxuICAgICRjdXJyZW50SW1hZ2UuY3NzKFwiekluZGV4XCIsIDIpO1xyXG4gICAgJGxhc3RJbWFnZS5jc3MoXCJvcGFjaXR5XCIsIDEpO1xyXG4gICAgJGN1cnJlbnRJbWFnZS52ZWxvY2l0eSh7XCJvcGFjaXR5XCI6IDF9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFxyXG4gICAgICAgIFwiZWFzZUluT3V0UXVhZFwiKTtcclxuXHJcbiAgICAvLyBPYmplY3QgaW1hZ2UgZml0IHBvbHlmaWxsIGJyZWFrcyBqUXVlcnkgYXR0ciguLi4pLCBzbyBmYWxsYmFjayB0byBqdXN0IFxyXG4gICAgLy8gdXNpbmcgZWxlbWVudC5zcmNcclxuICAgIC8vIFRPRE86IExhenkhXHJcbiAgICAvLyBpZiAoJGN1cnJlbnRJbWFnZS5nZXQoMCkuc3JjID09PSBcIlwiKSB7XHJcbiAgICAvLyAgICAgJGN1cnJlbnRJbWFnZS5nZXQoMCkuc3JjID0gJGN1cnJlbnRJbWFnZS5kYXRhKFwiaW1hZ2UtdXJsXCIpO1xyXG4gICAgLy8gfVxyXG59O1xyXG5cclxuSW1hZ2VHYWxsZXJ5LnByb3RvdHlwZS5fb25DbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xyXG4gICAgdmFyIGluZGV4ID0gJHRhcmdldC5kYXRhKFwiaW5kZXhcIik7XHJcbiAgICBcclxuICAgIC8vIENsaWNrZWQgb24gdGhlIGFjdGl2ZSBpbWFnZSAtIG5vIG5lZWQgdG8gZG8gYW55dGhpbmdcclxuICAgIGlmICh0aGlzLl9pbmRleCA9PT0gaW5kZXgpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLl9zd2l0Y2hBY3RpdmVJbWFnZShpbmRleCk7ICBcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IEJhc2VMb2dvU2tldGNoO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEJhc2VMb2dvU2tldGNoKCRuYXYsICRuYXZMb2dvLCBmb250UGF0aCkge1xyXG4gICAgdGhpcy5fJG5hdiA9ICRuYXY7XHJcbiAgICB0aGlzLl8kbmF2TG9nbyA9ICRuYXZMb2dvO1xyXG4gICAgdGhpcy5fZm9udFBhdGggPSBmb250UGF0aDtcclxuXHJcbiAgICB0aGlzLl90ZXh0ID0gdGhpcy5fJG5hdkxvZ28udGV4dCgpO1xyXG4gICAgdGhpcy5faXNGaXJzdEZyYW1lID0gdHJ1ZTtcclxuICAgIHRoaXMuX2lzTW91c2VPdmVyID0gZmFsc2U7XHJcbiAgICB0aGlzLl9pc092ZXJOYXZMb2dvID0gZmFsc2U7XHJcblxyXG4gICAgdGhpcy5fdXBkYXRlVGV4dE9mZnNldCgpO1xyXG4gICAgdGhpcy5fdXBkYXRlU2l6ZSgpO1xyXG4gICAgdGhpcy5fdXBkYXRlRm9udFNpemUoKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSAocmVsYXRpdmUgcG9zaXRpb25lZCkgY29udGFpbmVyIGZvciB0aGUgc2tldGNoIGluc2lkZSBvZiB0aGVcclxuICAgIC8vIG5hdiwgYnV0IG1ha2Ugc3VyZSB0aGF0IGl0IGlzIEJFSElORCBldmVyeXRoaW5nIGVsc2UuIEV2ZW50dWFsbHksIHdlIHdpbGxcclxuICAgIC8vIGRyb3AganVzdCB0aGUgbmF2IGxvZ28gKG5vdCB0aGUgbmF2IGxpbmtzISkgYmVoaW5kIHRoZSBjYW52YXMuXHJcbiAgICB0aGlzLl8kY29udGFpbmVyID0gJChcIjxkaXY+XCIpXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgICAgIHRvcDogXCIwcHhcIixcclxuICAgICAgICAgICAgbGVmdDogXCIwcHhcIlxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnByZXBlbmRUbyh0aGlzLl8kbmF2KVxyXG4gICAgICAgIC5oaWRlKCk7XHJcblxyXG4gICAgdGhpcy5fY3JlYXRlUDVJbnN0YW5jZSgpO1xyXG59XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgbmV3IHA1IGluc3RhbmNlIGFuZCBiaW5kIHRoZSBhcHByb3ByaWF0ZSBjbGFzcyBtZXRob2RzIHRvIHRoZVxyXG4gKiBpbnN0YW5jZS4gVGhpcyBhbHNvIGZpbGxzIGluIHRoZSBwIHBhcmFtZXRlciBvbiB0aGUgY2xhc3MgbWV0aG9kcyAoc2V0dXAsXHJcbiAqIGRyYXcsIGV0Yy4pIHNvIHRoYXQgdGhvc2UgZnVuY3Rpb25zIGNhbiBiZSBhIGxpdHRsZSBsZXNzIHZlcmJvc2UgOikgXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2NyZWF0ZVA1SW5zdGFuY2UgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBuZXcgcDUoZnVuY3Rpb24ocCkge1xyXG4gICAgICAgIHRoaXMuX3AgPSBwO1xyXG4gICAgICAgIHAucHJlbG9hZCA9IHRoaXMuX3ByZWxvYWQuYmluZCh0aGlzLCBwKTtcclxuICAgICAgICBwLnNldHVwID0gdGhpcy5fc2V0dXAuYmluZCh0aGlzLCBwKTtcclxuICAgICAgICBwLmRyYXcgPSB0aGlzLl9kcmF3LmJpbmQodGhpcywgcCk7XHJcbiAgICB9LmJpbmQodGhpcyksIHRoaXMuXyRjb250YWluZXIuZ2V0KDApKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGaW5kIHRoZSBkaXN0YW5jZSBmcm9tIHRoZSB0b3AgbGVmdCBvZiB0aGUgbmF2IHRvIHRoZSBicmFuZCBsb2dvJ3MgYmFzZWxpbmUuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3VwZGF0ZVRleHRPZmZzZXQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgYmFzZWxpbmVEaXYgPSAkKFwiPGRpdj5cIilcclxuICAgICAgICAuY3NzKHtcclxuICAgICAgICAgICAgZGlzcGxheTogXCJpbmxpbmUtYmxvY2tcIixcclxuICAgICAgICAgICAgdmVydGljYWxBbGlnbjogXCJiYXNlbGluZVwiXHJcbiAgICAgICAgfSkucHJlcGVuZFRvKHRoaXMuXyRuYXZMb2dvKTtcclxuICAgIHZhciBuYXZPZmZzZXQgPSB0aGlzLl8kbmF2Lm9mZnNldCgpO1xyXG4gICAgdmFyIGxvZ29CYXNlbGluZU9mZnNldCA9IGJhc2VsaW5lRGl2Lm9mZnNldCgpO1xyXG4gICAgdGhpcy5fdGV4dE9mZnNldCA9IHtcclxuICAgICAgICB0b3A6IGxvZ29CYXNlbGluZU9mZnNldC50b3AgLSBuYXZPZmZzZXQudG9wLFxyXG4gICAgICAgIGxlZnQ6IGxvZ29CYXNlbGluZU9mZnNldC5sZWZ0IC0gbmF2T2Zmc2V0LmxlZnRcclxuICAgIH07XHJcbiAgICBiYXNlbGluZURpdi5yZW1vdmUoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBGaW5kIHRoZSBib3VuZGluZyBib3ggb2YgdGhlIGJyYW5kIGxvZ28gaW4gdGhlIG5hdi4gVGhpcyBiYm94IGNhbiB0aGVuIGJlIFxyXG4gKiB1c2VkIHRvIGNvbnRyb2wgd2hlbiB0aGUgY3Vyc29yIHNob3VsZCBiZSBhIHBvaW50ZXIuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2NhbGN1bGF0ZU5hdkxvZ29Cb3VuZHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgbmF2T2Zmc2V0ID0gdGhpcy5fJG5hdi5vZmZzZXQoKTtcclxuICAgIHZhciBsb2dvT2Zmc2V0ID0gdGhpcy5fJG5hdkxvZ28ub2Zmc2V0KCk7XHJcbiAgICB0aGlzLl9sb2dvQmJveCA9IHtcclxuICAgICAgICB5OiBsb2dvT2Zmc2V0LnRvcCAtIG5hdk9mZnNldC50b3AsXHJcbiAgICAgICAgeDogbG9nb09mZnNldC5sZWZ0IC0gbmF2T2Zmc2V0LmxlZnQsXHJcbiAgICAgICAgdzogdGhpcy5fJG5hdkxvZ28ub3V0ZXJXaWR0aCgpLCAvLyBFeGNsdWRlIG1hcmdpbiBmcm9tIHRoZSBiYm94XHJcbiAgICAgICAgaDogdGhpcy5fJG5hdkxvZ28ub3V0ZXJIZWlnaHQoKSAvLyBMaW5rcyBhcmVuJ3QgY2xpY2thYmxlIG9uIG1hcmdpblxyXG4gICAgfTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIGRpbWVuc2lvbnMgdG8gbWF0Y2ggdGhlIG5hdiAtIGV4Y2x1ZGluZyBhbnkgbWFyZ2luLCBwYWRkaW5nICYgXHJcbiAqIGJvcmRlci5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fdXBkYXRlU2l6ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX3dpZHRoID0gdGhpcy5fJG5hdi5pbm5lcldpZHRoKCk7XHJcbiAgICB0aGlzLl9oZWlnaHQgPSB0aGlzLl8kbmF2LmlubmVySGVpZ2h0KCk7XHJcbn07XHJcblxyXG4vKipcclxuICogR3JhYiB0aGUgZm9udCBzaXplIGZyb20gdGhlIGJyYW5kIGxvZ28gbGluay4gVGhpcyBtYWtlcyB0aGUgZm9udCBzaXplIG9mIHRoZVxyXG4gKiBza2V0Y2ggcmVzcG9uc2l2ZS5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fdXBkYXRlRm9udFNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9mb250U2l6ZSA9IHRoaXMuXyRuYXZMb2dvLmNzcyhcImZvbnRTaXplXCIpLnJlcGxhY2UoXCJweFwiLCBcIlwiKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBXaGVuIHRoZSBicm93c2VyIGlzIHJlc2l6ZWQsIHJlY2FsY3VsYXRlIGFsbCB0aGUgbmVjZXNzYXJ5IHN0YXRzIHNvIHRoYXQgdGhlXHJcbiAqIHNrZXRjaCBjYW4gYmUgcmVzcG9uc2l2ZS4gVGhlIGxvZ28gaW4gdGhlIHNrZXRjaCBzaG91bGQgQUxXQVlTIGV4YWN0bHkgbWF0Y2hcclxuICogdGhlIGJyYW5nIGxvZ28gbGluayB0aGUgSFRNTC5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgdGhpcy5fdXBkYXRlU2l6ZSgpO1xyXG4gICAgdGhpcy5fdXBkYXRlRm9udFNpemUoKTtcclxuICAgIHRoaXMuX3VwZGF0ZVRleHRPZmZzZXQoKTtcclxuICAgIHRoaXMuX2NhbGN1bGF0ZU5hdkxvZ29Cb3VuZHMoKTtcclxuICAgIHAucmVzaXplQ2FudmFzKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgX2lzTW91c2VPdmVyIHByb3BlcnR5LiBcclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fc2V0TW91c2VPdmVyID0gZnVuY3Rpb24gKGlzTW91c2VPdmVyKSB7XHJcbiAgICB0aGlzLl9pc01vdXNlT3ZlciA9IGlzTW91c2VPdmVyO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIElmIHRoZSBjdXJzb3IgaXMgc2V0IHRvIGEgcG9pbnRlciwgZm9yd2FyZCBhbnkgY2xpY2sgZXZlbnRzIHRvIHRoZSBuYXYgbG9nby5cclxuICogVGhpcyByZWR1Y2VzIHRoZSBuZWVkIGZvciB0aGUgY2FudmFzIHRvIGRvIGFueSBBSkFYLXkgc3R1ZmYuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX29uQ2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgaWYgKHRoaXMuX2lzT3Zlck5hdkxvZ28pIHRoaXMuXyRuYXZMb2dvLnRyaWdnZXIoZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQmFzZSBwcmVsb2FkIG1ldGhvZCB0aGF0IGp1c3QgbG9hZHMgdGhlIG5lY2Vzc2FyeSBmb250XHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3ByZWxvYWQgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgdGhpcy5fZm9udCA9IHAubG9hZEZvbnQodGhpcy5fZm9udFBhdGgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2Ugc2V0dXAgbWV0aG9kIHRoYXQgZG9lcyBzb21lIGhlYXZ5IGxpZnRpbmcuIEl0IGhpZGVzIHRoZSBuYXYgYnJhbmQgbG9nb1xyXG4gKiBhbmQgcmV2ZWFscyB0aGUgY2FudmFzLiBJdCBhbHNvIHNldHMgdXAgYSBsb3Qgb2YgdGhlIGludGVybmFsIHZhcmlhYmxlcyBhbmRcclxuICogY2FudmFzIGV2ZW50cy5cclxuICovXHJcbkJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fc2V0dXAgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgdmFyIHJlbmRlcmVyID0gcC5jcmVhdGVDYW52YXModGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7XHJcbiAgICB0aGlzLl8kY2FudmFzID0gJChyZW5kZXJlci5jYW52YXMpO1xyXG5cclxuICAgIC8vIFNob3cgdGhlIGNhbnZhcyBhbmQgaGlkZSB0aGUgbG9nby4gVXNpbmcgc2hvdy9oaWRlIG9uIHRoZSBsb2dvIHdpbGwgY2F1c2VcclxuICAgIC8vIGpRdWVyeSB0byBtdWNrIHdpdGggdGhlIHBvc2l0aW9uaW5nLCB3aGljaCBpcyB1c2VkIHRvIGNhbGN1bGF0ZSB3aGVyZSB0b1xyXG4gICAgLy8gZHJhdyB0aGUgY2FudmFzIHRleHQuIEluc3RlYWQsIGp1c3QgcHVzaCB0aGUgbG9nbyBiZWhpbmQgdGhlIGNhbnZhcy4gVGhpc1xyXG4gICAgLy8gYWxsb3dzIG1ha2VzIGl0IHNvIHRoZSBjYW52YXMgaXMgc3RpbGwgYmVoaW5kIHRoZSBuYXYgbGlua3MuXHJcbiAgICB0aGlzLl8kY29udGFpbmVyLnNob3coKTtcclxuICAgIHRoaXMuXyRuYXZMb2dvLmNzcyhcInpJbmRleFwiLCAtMSk7XHJcblxyXG4gICAgLy8gVGhlcmUgaXNuJ3QgYSBnb29kIHdheSB0byBjaGVjayB3aGV0aGVyIHRoZSBza2V0Y2ggaGFzIHRoZSBtb3VzZSBvdmVyXHJcbiAgICAvLyBpdC4gcC5tb3VzZVggJiBwLm1vdXNlWSBhcmUgaW5pdGlhbGl6ZWQgdG8gKDAsIDApLCBhbmQgcC5mb2N1c2VkIGlzbid0IFxyXG4gICAgLy8gYWx3YXlzIHJlbGlhYmxlLlxyXG4gICAgdGhpcy5fJGNhbnZhcy5vbihcIm1vdXNlb3ZlclwiLCB0aGlzLl9zZXRNb3VzZU92ZXIuYmluZCh0aGlzLCB0cnVlKSk7XHJcbiAgICB0aGlzLl8kY2FudmFzLm9uKFwibW91c2VvdXRcIiwgdGhpcy5fc2V0TW91c2VPdmVyLmJpbmQodGhpcywgZmFsc2UpKTtcclxuXHJcbiAgICAvLyBGb3J3YXJkIG1vdXNlIGNsaWNrcyB0byB0aGUgbmF2IGxvZ29cclxuICAgIHRoaXMuXyRjYW52YXMub24oXCJjbGlja1wiLCB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHdpbmRvdyBpcyByZXNpemVkLCB0ZXh0ICYgY2FudmFzIHNpemluZyBhbmQgcGxhY2VtZW50IG5lZWQgdG8gYmVcclxuICAgIC8vIHJlY2FsY3VsYXRlZC4gVGhlIHNpdGUgaXMgcmVzcG9uc2l2ZSwgc28gdGhlIGludGVyYWN0aXZlIGNhbnZhcyBzaG91bGQgYmVcclxuICAgIC8vIHRvbyEgXHJcbiAgICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgdGhpcy5fb25SZXNpemUuYmluZCh0aGlzLCBwKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogQmFzZSBkcmF3IG1ldGhvZCB0aGF0IGNvbnRyb2xzIHdoZXRoZXIgb3Igbm90IHRoZSBjdXJzb3IgaXMgYSBwb2ludGVyLiBJdFxyXG4gKiBzaG91bGQgb25seSBiZSBhIHBvaW50ZXIgd2hlbiB0aGUgbW91c2UgaXMgb3ZlciB0aGUgbmF2IGJyYW5kIGxvZ28uXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgaWYgKHRoaXMuX2lzTW91c2VPdmVyKSB7XHJcbiAgICAgICAgdmFyIGlzT3ZlckxvZ28gPSB1dGlscy5pc0luUmVjdChwLm1vdXNlWCwgcC5tb3VzZVksIHRoaXMuX2xvZ29CYm94KTtcclxuICAgICAgICBpZiAoIXRoaXMuX2lzT3Zlck5hdkxvZ28gJiYgaXNPdmVyTG9nbykge1xyXG4gICAgICAgICAgICB0aGlzLl9pc092ZXJOYXZMb2dvID0gdHJ1ZTtcclxuICAgICAgICAgICAgdGhpcy5fJGNhbnZhcy5jc3MoXCJjdXJzb3JcIiwgXCJwb2ludGVyXCIpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5faXNPdmVyTmF2TG9nbyAmJiAhaXNPdmVyTG9nbykge1xyXG4gICAgICAgICAgICB0aGlzLl9pc092ZXJOYXZMb2dvID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRoaXMuXyRjYW52YXMuY3NzKFwiY3Vyc29yXCIsIFwiaW5pdGlhbFwiKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBTa2V0Y2g7XHJcblxyXG52YXIgQmJveFRleHQgPSByZXF1aXJlKFwicDUtYmJveC1hbGlnbmVkLXRleHRcIik7XHJcbnZhciBCYXNlTG9nb1NrZXRjaCA9IHJlcXVpcmUoXCIuL2Jhc2UtbG9nby1za2V0Y2guanNcIik7XHJcbnZhciBTaW5HZW5lcmF0b3IgPSByZXF1aXJlKFwiLi9nZW5lcmF0b3JzL3Npbi1nZW5lcmF0b3IuanNcIik7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuU2tldGNoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlKTtcclxuXHJcbmZ1bmN0aW9uIFNrZXRjaCgkbmF2LCAkbmF2TG9nbykge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2guY2FsbCh0aGlzLCAkbmF2LCAkbmF2TG9nbywgXCIuLi9mb250cy9iaWdfam9obi13ZWJmb250LnR0ZlwiKTtcclxufVxyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZS5jYWxsKHRoaXMsIHApO1xyXG4gICAgdGhpcy5fc3BhY2luZyA9IHV0aWxzLm1hcCh0aGlzLl9mb250U2l6ZSwgMjAsIDQwLCAyLCA1LCB7Y2xhbXA6IHRydWUsIFxyXG4gICAgICAgIHJvdW5kOiB0cnVlfSk7XHJcbiAgICAvLyBVcGRhdGUgdGhlIGJib3hUZXh0LCBwbGFjZSBvdmVyIHRoZSBuYXYgdGV4dCBsb2dvIGFuZCB0aGVuIHNoaWZ0IGl0cyBcclxuICAgIC8vIGFuY2hvciBiYWNrIHRvIChjZW50ZXIsIGNlbnRlcikgd2hpbGUgcHJlc2VydmluZyB0aGUgdGV4dCBwb3NpdGlvblxyXG4gICAgdGhpcy5fYmJveFRleHQuc2V0VGV4dCh0aGlzLl90ZXh0KVxyXG4gICAgICAgIC5zZXRUZXh0U2l6ZSh0aGlzLl9mb250U2l6ZSlcclxuICAgICAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9MRUZULCBCYm94VGV4dC5CQVNFTElORS5BTFBIQUJFVElDKVxyXG4gICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLl90ZXh0T2Zmc2V0LmxlZnQsIHRoaXMuX3RleHRPZmZzZXQudG9wKVxyXG4gICAgICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0NFTlRFUiwgQmJveFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUiwgXHJcbiAgICAgICAgICAgIHRydWUpO1xyXG4gICAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG4gICAgdGhpcy5fcG9pbnRzID0gdGhpcy5fYmJveFRleHQuZ2V0VGV4dFBvaW50cygpO1xyXG4gICAgdGhpcy5faXNGaXJzdEZyYW1lID0gdHJ1ZTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXdTdGF0aW9uYXJ5TG9nbyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgIHAuc3Ryb2tlKDI1NSk7XHJcbiAgICBwLmZpbGwoXCIjMEEwMDBBXCIpO1xyXG4gICAgcC5zdHJva2VXZWlnaHQoMik7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5kcmF3KCk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cCA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldHVwLmNhbGwodGhpcywgcCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgQmJveEFsaWduZWRUZXh0IGluc3RhbmNlIHRoYXQgd2lsbCBiZSB1c2VkIGZvciBkcmF3aW5nIGFuZCBcclxuICAgIC8vIHJvdGF0aW5nIHRleHRcclxuICAgIHRoaXMuX2Jib3hUZXh0ID0gbmV3IEJib3hUZXh0KHRoaXMuX2ZvbnQsIHRoaXMuX3RleHQsIHRoaXMuX2ZvbnRTaXplLCAwLCAwLFxyXG4gICAgICAgIHApO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgaW5pdGlhbCBzZXR1cCBieSB0cmlnZ2VyaW5nIGEgcmVzaXplXHJcbiAgICB0aGlzLl9vblJlc2l6ZShwKTtcclxuXHJcbiAgICAvLyBEcmF3IHRoZSBzdGF0aW9uYXJ5IGxvZ29cclxuICAgIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuXHJcbiAgICAvLyBTdGFydCB0aGUgc2luIGdlbmVyYXRvciBhdCBpdHMgbWF4IHZhbHVlXHJcbiAgICB0aGlzLl90aHJlc2hvbGRHZW5lcmF0b3IgPSBuZXcgU2luR2VuZXJhdG9yKHAsIDAsIDEsIDAuMDIsIHAuUEkvMik7IFxyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhdyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2RyYXcuY2FsbCh0aGlzLCBwKTtcclxuICAgIGlmICghdGhpcy5faXNNb3VzZU92ZXIgfHwgIXRoaXMuX2lzT3Zlck5hdkxvZ28pIHJldHVybjtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSB0ZXh0IGlzIGFib3V0IHRvIGJlY29tZSBhY3RpdmUgZm9yIHRoZSBmaXJzdCB0aW1lLCBjbGVhclxyXG4gICAgLy8gdGhlIHN0YXRpb25hcnkgbG9nbyB0aGF0IHdhcyBwcmV2aW91c2x5IGRyYXduLiBcclxuICAgIGlmICh0aGlzLl9pc0ZpcnN0RnJhbWUpIHtcclxuICAgICAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgICAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fZm9udFNpemUgPiAzMCkge1xyXG4gICAgICAgIHRoaXMuX3RocmVzaG9sZEdlbmVyYXRvci5zZXRCb3VuZHMoMC4yICogdGhpcy5fYmJveFRleHQuaGVpZ2h0LCBcclxuICAgICAgICAgICAgMC40NyAqIHRoaXMuX2Jib3hUZXh0LmhlaWdodCk7ICAgICAgICBcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuX3RocmVzaG9sZEdlbmVyYXRvci5zZXRCb3VuZHMoMC4yICogdGhpcy5fYmJveFRleHQuaGVpZ2h0LCBcclxuICAgICAgICAgICAgMC42ICogdGhpcy5fYmJveFRleHQuaGVpZ2h0KTsgICAgICAgICAgXHJcbiAgICB9XHJcbiAgICB2YXIgZGlzdGFuY2VUaHJlc2hvbGQgPSB0aGlzLl90aHJlc2hvbGRHZW5lcmF0b3IuZ2VuZXJhdGUoKTtcclxuICAgIFxyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSwgMTAwKTtcclxuICAgIHAuc3Ryb2tlV2VpZ2h0KDEpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9wb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgcG9pbnQxID0gdGhpcy5fcG9pbnRzW2ldO1xyXG4gICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IHRoaXMuX3BvaW50cy5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgICAgICB2YXIgcG9pbnQyID0gdGhpcy5fcG9pbnRzW2pdO1xyXG4gICAgICAgICAgICB2YXIgZGlzdCA9IHAuZGlzdChwb2ludDEueCwgcG9pbnQxLnksIHBvaW50Mi54LCBwb2ludDIueSk7XHJcbiAgICAgICAgICAgIGlmIChkaXN0IDwgZGlzdGFuY2VUaHJlc2hvbGQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBwLm5vU3Ryb2tlKCk7XHJcbiAgICAgICAgICAgICAgICBwLmZpbGwoXCJyZ2JhKDE2NSwgMCwgMTczLCAwLjI1KVwiKTtcclxuICAgICAgICAgICAgICAgIHAuZWxsaXBzZSgocG9pbnQxLnggKyBwb2ludDIueCkgLyAyLCAocG9pbnQxLnkgKyBwb2ludDIueSkgLyAyLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc3QsIGRpc3QpOyAgXHJcblxyXG4gICAgICAgICAgICAgICAgcC5zdHJva2UoXCJyZ2JhKDE2NSwgMCwgMTczLCAwLjI1KVwiKTtcclxuICAgICAgICAgICAgICAgIHAubm9GaWxsKCk7XHJcbiAgICAgICAgICAgICAgICBwLmxpbmUocG9pbnQxLngsIHBvaW50MS55LCBwb2ludDIueCwgcG9pbnQyLnkpOyAgXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XHJcbiAgICBOb2lzZUdlbmVyYXRvcjFEOiBOb2lzZUdlbmVyYXRvcjFELFxyXG4gICAgTm9pc2VHZW5lcmF0b3IyRDogTm9pc2VHZW5lcmF0b3IyRFxyXG59O1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uLy4uL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbi8vIC0tIDFEIE5vaXNlIEdlbmVyYXRvciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4vKipcclxuICogQSB1dGlsaXR5IGNsYXNzIGZvciBnZW5lcmF0aW5nIG5vaXNlIHZhbHVlc1xyXG4gKiBAY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtvYmplY3R9IHAgICAgICAgICAgICAgICBSZWZlcmVuY2UgdG8gYSBwNSBza2V0Y2hcclxuICogQHBhcmFtIHtudW1iZXJ9IFttaW49MF0gICAgICAgICBNaW5pbXVtIHZhbHVlIGZvciB0aGUgbm9pc2VcclxuICogQHBhcmFtIHtudW1iZXJ9IFttYXg9MV0gICAgICAgICBNYXhpbXVtIHZhbHVlIGZvciB0aGUgbm9pc2VcclxuICogQHBhcmFtIHtudW1iZXJ9IFtpbmNyZW1lbnQ9MC4xXSBTY2FsZSBvZiB0aGUgbm9pc2UsIHVzZWQgd2hlbiB1cGRhdGluZ1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW29mZnNldD1yYW5kb21dIEEgdmFsdWUgdXNlZCB0byBlbnN1cmUgbXVsdGlwbGUgbm9pc2VcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0b3JzIGFyZSByZXR1cm5pbmcgXCJpbmRlcGVuZGVudFwiIHZhbHVlc1xyXG4gKi9cclxuZnVuY3Rpb24gTm9pc2VHZW5lcmF0b3IxRChwLCBtaW4sIG1heCwgaW5jcmVtZW50LCBvZmZzZXQpIHtcclxuICAgIHRoaXMuX3AgPSBwO1xyXG4gICAgdGhpcy5fbWluID0gdXRpbHMuZGVmYXVsdChtaW4sIDApO1xyXG4gICAgdGhpcy5fbWF4ID0gdXRpbHMuZGVmYXVsdChtYXgsIDEpO1xyXG4gICAgdGhpcy5faW5jcmVtZW50ID0gdXRpbHMuZGVmYXVsdChpbmNyZW1lbnQsIDAuMSk7XHJcbiAgICB0aGlzLl9wb3NpdGlvbiA9IHV0aWxzLmRlZmF1bHQob2Zmc2V0LCBwLnJhbmRvbSgtMTAwMDAwMCwgMTAwMDAwMCkpO1xyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBtaW4gYW5kIG1heCBub2lzZSB2YWx1ZXNcclxuICogQHBhcmFtICB7bnVtYmVyfSBtaW4gTWluaW11bSBub2lzZSB2YWx1ZVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IG1heCBNYXhpbXVtIG5vaXNlIHZhbHVlXHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjFELnByb3RvdHlwZS5zZXRCb3VuZHMgPSBmdW5jdGlvbiAobWluLCBtYXgpIHtcclxuICAgIHRoaXMuX21pbiA9IHV0aWxzLmRlZmF1bHQobWluLCB0aGlzLl9taW4pO1xyXG4gICAgdGhpcy5fbWF4ID0gdXRpbHMuZGVmYXVsdChtYXgsIHRoaXMuX21heCk7XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBub2lzZSBpbmNyZW1lbnQgKGUuZy4gc2NhbGUpXHJcbiAqIEBwYXJhbSAge251bWJlcn0gaW5jcmVtZW50IE5ldyBpbmNyZW1lbnQgKHNjYWxlKSB2YWx1ZVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IxRC5wcm90b3R5cGUuc2V0SW5jcmVtZW50ID0gZnVuY3Rpb24gKGluY3JlbWVudCkge1xyXG4gICAgdGhpcy5faW5jcmVtZW50ID0gdXRpbHMuZGVmYXVsdChpbmNyZW1lbnQsIHRoaXMuX2luY3JlbWVudCk7XHJcbn07XHJcblxyXG4vKiogXHJcbiAqIEdlbmVyYXRlIHRoZSBuZXh0IG5vaXNlIHZhbHVlXHJcbiAqIEByZXR1cm4ge251bWJlcn0gQSBub2lzeSB2YWx1ZSBiZXR3ZWVuIG9iamVjdCdzIG1pbiBhbmQgbWF4XHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjFELnByb3RvdHlwZS5nZW5lcmF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgdmFyIG4gPSB0aGlzLl9wLm5vaXNlKHRoaXMuX3Bvc2l0aW9uKTtcclxuICAgIG4gPSB0aGlzLl9wLm1hcChuLCAwLCAxLCB0aGlzLl9taW4sIHRoaXMuX21heCk7XHJcbiAgICByZXR1cm4gbjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBJbnRlcm5hbCB1cGRhdGUgbWV0aG9kIGZvciBnZW5lcmF0aW5nIG5leHQgbm9pc2UgdmFsdWVcclxuICogQHByaXZhdGVcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLl91cGRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9wb3NpdGlvbiArPSB0aGlzLl9pbmNyZW1lbnQ7XHJcbn07XHJcblxyXG5cclxuLy8gLS0gMkQgTm9pc2UgR2VuZXJhdG9yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmZ1bmN0aW9uIE5vaXNlR2VuZXJhdG9yMkQocCwgeE1pbiwgeE1heCwgeU1pbiwgeU1heCwgeEluY3JlbWVudCwgeUluY3JlbWVudCwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgeE9mZnNldCwgeU9mZnNldCkge1xyXG4gICAgdGhpcy5feE5vaXNlID0gbmV3IE5vaXNlR2VuZXJhdG9yMUQocCwgeE1pbiwgeE1heCwgeEluY3JlbWVudCwgeE9mZnNldCk7XHJcbiAgICB0aGlzLl95Tm9pc2UgPSBuZXcgTm9pc2VHZW5lcmF0b3IxRChwLCB5TWluLCB5TWF4LCB5SW5jcmVtZW50LCB5T2Zmc2V0KTtcclxuICAgIHRoaXMuX3AgPSBwO1xyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBtaW4gYW5kIG1heCBub2lzZSB2YWx1ZXNcclxuICogQHBhcmFtICB7b2JqZWN0fSBvcHRpb25zIE9iamVjdCB3aXRoIGJvdW5kcyB0byBiZSB1cGRhdGVkIGUuZy4gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB7IHhNaW46IDAsIHhNYXg6IDEsIHlNaW46IC0xLCB5TWF4OiAxIH1cclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMkQucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICBpZiAoIW9wdGlvbnMpIHJldHVybjsgIFxyXG4gICAgdGhpcy5feE5vaXNlLnNldEJvdW5kcyhvcHRpb25zLnhNaW4sIG9wdGlvbnMueE1heCk7XHJcbiAgICB0aGlzLl95Tm9pc2Uuc2V0Qm91bmRzKG9wdGlvbnMueU1pbiwgb3B0aW9ucy55TWF4KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIGluY3JlbWVudCAoZS5nLiBzY2FsZSkgZm9yIHRoZSBub2lzZSBnZW5lcmF0b3JcclxuICogQHBhcmFtICB7b2JqZWN0fSBvcHRpb25zIE9iamVjdCB3aXRoIGJvdW5kcyB0byBiZSB1cGRhdGVkIGUuZy4gXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB7IHhJbmNyZW1lbnQ6IDAuMDUsIHlJbmNyZW1lbnQ6IDAuMSB9XHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjJELnByb3RvdHlwZS5zZXRCb3VuZHMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgaWYgKCFvcHRpb25zKSByZXR1cm47XHJcbiAgICB0aGlzLl94Tm9pc2Uuc2V0Qm91bmRzKG9wdGlvbnMueEluY3JlbWVudCk7XHJcbiAgICB0aGlzLl95Tm9pc2Uuc2V0Qm91bmRzKG9wdGlvbnMueUluY3JlbWVudCk7XHJcbn07XHJcblxyXG4vKipcclxuICogR2VuZXJhdGUgdGhlIG5leHQgcGFpciBvZiBub2lzZSB2YWx1ZXNcclxuICogQHJldHVybiB7b2JqZWN0fSBPYmplY3Qgd2l0aCB4IGFuZCB5IHByb3BlcnRpZXMgdGhhdCBjb250YWluIHRoZSBuZXh0IG5vaXNlXHJcbiAqICAgICAgICAgICAgICAgICAgdmFsdWVzIGFsb25nIGVhY2ggZGltZW5zaW9uXHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjJELnByb3RvdHlwZS5nZW5lcmF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogdGhpcy5feE5vaXNlLmdlbmVyYXRlKCksXHJcbiAgICAgICAgeTogdGhpcy5feU5vaXNlLmdlbmVyYXRlKClcclxuICAgIH07XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBTaW5HZW5lcmF0b3I7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuLyoqXHJcbiAqIEEgdXRpbGl0eSBjbGFzcyBmb3IgZ2VuZXJhdGluZyB2YWx1ZXMgYWxvbmcgYSBzaW53YXZlXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge29iamVjdH0gcCAgICAgICAgICAgICAgIFJlZmVyZW5jZSB0byBhIHA1IHNrZXRjaFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW21pbj0wXSAgICAgICAgIE1pbmltdW0gdmFsdWUgZm9yIHRoZSBub2lzZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW21heD0xXSAgICAgICAgIE1heGltdW0gdmFsdWUgZm9yIHRoZSBub2lzZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW2luY3JlbWVudD0wLjFdIEluY3JlbWVudCB1c2VkIHdoZW4gdXBkYXRpbmdcclxuICogQHBhcmFtIHtudW1iZXJ9IFtvZmZzZXQ9cmFuZG9tXSBXaGVyZSB0byBzdGFydCBhbG9uZyB0aGUgc2luZXdhdmVcclxuICovXHJcbmZ1bmN0aW9uIFNpbkdlbmVyYXRvcihwLCBtaW4sIG1heCwgYW5nbGVJbmNyZW1lbnQsIHN0YXJ0aW5nQW5nbGUpIHtcclxuICAgIHRoaXMuX3AgPSBwO1xyXG4gICAgdGhpcy5fbWluID0gdXRpbHMuZGVmYXVsdChtaW4sIDApO1xyXG4gICAgdGhpcy5fbWF4ID0gdXRpbHMuZGVmYXVsdChtYXgsIDApO1xyXG4gICAgdGhpcy5faW5jcmVtZW50ID0gdXRpbHMuZGVmYXVsdChhbmdsZUluY3JlbWVudCwgMC4xKTtcclxuICAgIHRoaXMuX2FuZ2xlID0gdXRpbHMuZGVmYXVsdChzdGFydGluZ0FuZ2xlLCBwLnJhbmRvbSgtMTAwMDAwMCwgMTAwMDAwMCkpO1xyXG59XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBtaW4gYW5kIG1heCB2YWx1ZXNcclxuICogQHBhcmFtICB7bnVtYmVyfSBtaW4gTWluaW11bSB2YWx1ZVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IG1heCBNYXhpbXVtIHZhbHVlXHJcbiAqL1xyXG5TaW5HZW5lcmF0b3IucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xyXG4gICAgdGhpcy5fbWluID0gdXRpbHMuZGVmYXVsdChtaW4sIHRoaXMuX21pbik7XHJcbiAgICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgdGhpcy5fbWF4KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIGFuZ2xlIGluY3JlbWVudCAoZS5nLiBob3cgZmFzdCB3ZSBtb3ZlIHRocm91Z2ggdGhlIHNpbndhdmUpXHJcbiAqIEBwYXJhbSAge251bWJlcn0gaW5jcmVtZW50IE5ldyBpbmNyZW1lbnQgdmFsdWVcclxuICovXHJcblNpbkdlbmVyYXRvci5wcm90b3R5cGUuc2V0SW5jcmVtZW50ID0gZnVuY3Rpb24gKGluY3JlbWVudCkge1xyXG4gICAgdGhpcy5faW5jcmVtZW50ID0gdXRpbHMuZGVmYXVsdChpbmNyZW1lbnQsIHRoaXMuX2luY3JlbWVudCk7XHJcbn07XHJcblxyXG4vKiogXHJcbiAqIEdlbmVyYXRlIHRoZSBuZXh0IHZhbHVlXHJcbiAqIEByZXR1cm4ge251bWJlcn0gQSB2YWx1ZSBiZXR3ZWVuIGdlbmVyYXRvcnMncyBtaW4gYW5kIG1heFxyXG4gKi9cclxuU2luR2VuZXJhdG9yLnByb3RvdHlwZS5nZW5lcmF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX3VwZGF0ZSgpO1xyXG4gICAgdmFyIG4gPSB0aGlzLl9wLnNpbih0aGlzLl9hbmdsZSk7XHJcbiAgICBuID0gdGhpcy5fcC5tYXAobiwgLTEsIDEsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcclxuICAgIHJldHVybiBuO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEludGVybmFsIHVwZGF0ZSBtZXRob2QgZm9yIGdlbmVyYXRpbmcgbmV4dCB2YWx1ZVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuU2luR2VuZXJhdG9yLnByb3RvdHlwZS5fdXBkYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fYW5nbGUgKz0gdGhpcy5faW5jcmVtZW50O1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gU2tldGNoO1xyXG5cclxudmFyIEJib3hUZXh0ID0gcmVxdWlyZShcInA1LWJib3gtYWxpZ25lZC10ZXh0XCIpO1xyXG52YXIgQmFzZUxvZ29Ta2V0Y2ggPSByZXF1aXJlKFwiLi9iYXNlLWxvZ28tc2tldGNoLmpzXCIpO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZSk7XHJcblxyXG5mdW5jdGlvbiBTa2V0Y2goJG5hdiwgJG5hdkxvZ28pIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLmNhbGwodGhpcywgJG5hdiwgJG5hdkxvZ28sIFwiLi4vZm9udHMvYmlnX2pvaG4td2ViZm9udC50dGZcIik7XHJcbn1cclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUuY2FsbCh0aGlzLCBwKTtcclxuICAgIHRoaXMuX3NwYWNpbmcgPSB1dGlscy5tYXAodGhpcy5fZm9udFNpemUsIDIwLCA0MCwgMiwgNSwge2NsYW1wOiB0cnVlLCBcclxuICAgICAgICByb3VuZDogdHJ1ZX0pO1xyXG4gICAgLy8gVXBkYXRlIHRoZSBiYm94VGV4dCwgcGxhY2Ugb3ZlciB0aGUgbmF2IHRleHQgbG9nbyBhbmQgdGhlbiBzaGlmdCBpdHMgXHJcbiAgICAvLyBhbmNob3IgYmFjayB0byAoY2VudGVyLCBjZW50ZXIpIHdoaWxlIHByZXNlcnZpbmcgdGhlIHRleHQgcG9zaXRpb25cclxuICAgIHRoaXMuX2Jib3hUZXh0LnNldFRleHQodGhpcy5fdGV4dClcclxuICAgICAgICAuc2V0VGV4dFNpemUodGhpcy5fZm9udFNpemUpXHJcbiAgICAgICAgLnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfTEVGVCwgQmJveFRleHQuQkFTRUxJTkUuQUxQSEFCRVRJQylcclxuICAgICAgICAuc2V0UG9zaXRpb24odGhpcy5fdGV4dE9mZnNldC5sZWZ0LCB0aGlzLl90ZXh0T2Zmc2V0LnRvcClcclxuICAgICAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9DRU5URVIsIEJib3hUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVIsIFxyXG4gICAgICAgICAgICB0cnVlKTtcclxuICAgIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuICAgIHRoaXMuX2NhbGN1bGF0ZUNpcmNsZXMocCk7XHJcbiAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSB0cnVlO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhd1N0YXRpb25hcnlMb2dvID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgcC5zdHJva2UoMjU1KTtcclxuICAgIHAuZmlsbChcIiMwQTAwMEFcIik7XHJcbiAgICBwLnN0cm9rZVdlaWdodCgyKTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LmRyYXcoKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX3NldHVwID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fc2V0dXAuY2FsbCh0aGlzLCBwKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBCYm94QWxpZ25lZFRleHQgaW5zdGFuY2UgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIGRyYXdpbmcgYW5kIFxyXG4gICAgLy8gcm90YXRpbmcgdGV4dFxyXG4gICAgdGhpcy5fYmJveFRleHQgPSBuZXcgQmJveFRleHQodGhpcy5fZm9udCwgdGhpcy5fdGV4dCwgdGhpcy5fZm9udFNpemUsIDAsIDAsIFxyXG4gICAgICAgIHApO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgaW5pdGlhbCBzZXR1cCBieSB0cmlnZ2VyaW5nIGEgcmVzaXplXHJcbiAgICB0aGlzLl9vblJlc2l6ZShwKTtcclxuXHJcbiAgICAvLyBEcmF3IHRoZSBzdGF0aW9uYXJ5IGxvZ29cclxuICAgIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuXHJcbiAgICB0aGlzLl9jYWxjdWxhdGVDaXJjbGVzKHApO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fY2FsY3VsYXRlQ2lyY2xlcyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICAvLyBUT0RPOiBEb24ndCBuZWVkIEFMTCB0aGUgcGl4ZWxzLiBUaGlzIGNvdWxkIGhhdmUgYW4gb2Zmc2NyZWVuIHJlbmRlcmVyXHJcbiAgICAvLyB0aGF0IGlzIGp1c3QgYmlnIGVub3VnaCB0byBmaXQgdGhlIHRleHQuXHJcbiAgICAvLyBMb29wIG92ZXIgdGhlIHBpeGVscyBpbiB0aGUgdGV4dCdzIGJvdW5kaW5nIGJveCB0byBzYW1wbGUgdGhlIHdvcmRcclxuICAgIHZhciBiYm94ID0gdGhpcy5fYmJveFRleHQuZ2V0QmJveCgpO1xyXG4gICAgdmFyIHN0YXJ0WCA9IE1hdGguZmxvb3IoTWF0aC5tYXgoYmJveC54IC0gNSwgMCkpO1xyXG4gICAgdmFyIGVuZFggPSBNYXRoLmNlaWwoTWF0aC5taW4oYmJveC54ICsgYmJveC53ICsgNSwgcC53aWR0aCkpO1xyXG4gICAgdmFyIHN0YXJ0WSA9IE1hdGguZmxvb3IoTWF0aC5tYXgoYmJveC55IC0gNSwgMCkpO1xyXG4gICAgdmFyIGVuZFkgPSBNYXRoLmNlaWwoTWF0aC5taW4oYmJveC55ICsgYmJveC5oICsgNSwgcC5oZWlnaHQpKTtcclxuICAgIHAubG9hZFBpeGVscygpO1xyXG4gICAgcC5waXhlbERlbnNpdHkoMSk7XHJcbiAgICB0aGlzLl9jaXJjbGVzID0gW107XHJcbiAgICBmb3IgKHZhciB5ID0gc3RhcnRZOyB5IDwgZW5kWTsgeSArPSB0aGlzLl9zcGFjaW5nKSB7XHJcbiAgICAgICAgZm9yICh2YXIgeCA9IHN0YXJ0WDsgeCA8IGVuZFg7IHggKz0gdGhpcy5fc3BhY2luZykgeyAgXHJcbiAgICAgICAgICAgIHZhciBpID0gNCAqICgoeSAqIHAud2lkdGgpICsgeCk7XHJcbiAgICAgICAgICAgIHZhciByID0gcC5waXhlbHNbaV07XHJcbiAgICAgICAgICAgIHZhciBnID0gcC5waXhlbHNbaSArIDFdO1xyXG4gICAgICAgICAgICB2YXIgYiA9IHAucGl4ZWxzW2kgKyAyXTtcclxuICAgICAgICAgICAgdmFyIGEgPSBwLnBpeGVsc1tpICsgM107XHJcbiAgICAgICAgICAgIHZhciBjID0gcC5jb2xvcihyLCBnLCBiLCBhKTtcclxuICAgICAgICAgICAgaWYgKHAuc2F0dXJhdGlvbihjKSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NpcmNsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeCArIHAucmFuZG9tKC0yLzMgKiB0aGlzLl9zcGFjaW5nLCAyLzMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgICAgICAgICAgICB5OiB5ICsgcC5yYW5kb20oLTIvMyAqIHRoaXMuX3NwYWNpbmcsIDIvMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBwLmNvbG9yKFwiIzA2RkZGRlwiKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jaXJjbGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHggKyBwLnJhbmRvbSgtMi8zICogdGhpcy5fc3BhY2luZywgMi8zICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogeSArIHAucmFuZG9tKC0yLzMgKiB0aGlzLl9zcGFjaW5nLCAyLzMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogcC5jb2xvcihcIiNGRTAwRkVcIilcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2lyY2xlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4ICsgcC5yYW5kb20oLTIvMyAqIHRoaXMuX3NwYWNpbmcsIDIvMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHkgKyBwLnJhbmRvbSgtMi8zICogdGhpcy5fc3BhY2luZywgMi8zICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IHAuY29sb3IoXCIjRkZGRjA0XCIpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9kcmF3LmNhbGwodGhpcywgcCk7XHJcbiAgICBpZiAoIXRoaXMuX2lzTW91c2VPdmVyIHx8ICF0aGlzLl9pc092ZXJOYXZMb2dvKSByZXR1cm47XHJcblxyXG4gICAgLy8gV2hlbiB0aGUgdGV4dCBpcyBhYm91dCB0byBiZWNvbWUgYWN0aXZlIGZvciB0aGUgZmlyc3QgdGltZSwgY2xlYXJcclxuICAgIC8vIHRoZSBzdGF0aW9uYXJ5IGxvZ28gdGhhdCB3YXMgcHJldmlvdXNseSBkcmF3bi4gXHJcbiAgICBpZiAodGhpcy5faXNGaXJzdEZyYW1lKSB7XHJcbiAgICAgICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcbiAgICAgICAgdGhpcy5faXNGaXJzdEZyYW1lID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ2xlYXJcclxuICAgIHAuYmxlbmRNb2RlKHAuQkxFTkQpO1xyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSk7XHJcblxyXG4gICAgLy8gRHJhdyBcImhhbGZ0b25lXCIgbG9nb1xyXG4gICAgcC5ub1N0cm9rZSgpOyAgIFxyXG4gICAgcC5ibGVuZE1vZGUocC5NVUxUSVBMWSk7XHJcblxyXG4gICAgdmFyIG1heERpc3QgPSB0aGlzLl9iYm94VGV4dC5oYWxmV2lkdGg7XHJcbiAgICB2YXIgbWF4UmFkaXVzID0gMiAqIHRoaXMuX3NwYWNpbmc7XHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9jaXJjbGVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIGNpcmNsZSA9IHRoaXMuX2NpcmNsZXNbaV07XHJcbiAgICAgICAgdmFyIGMgPSBjaXJjbGUuY29sb3I7XHJcbiAgICAgICAgdmFyIGRpc3QgPSBwLmRpc3QoY2lyY2xlLngsIGNpcmNsZS55LCBwLm1vdXNlWCwgcC5tb3VzZVkpO1xyXG4gICAgICAgIHZhciByYWRpdXMgPSB1dGlscy5tYXAoZGlzdCwgMCwgbWF4RGlzdCwgMSwgbWF4UmFkaXVzLCB7Y2xhbXA6IHRydWV9KTtcclxuICAgICAgICBwLmZpbGwoYyk7XHJcbiAgICAgICAgcC5lbGxpcHNlKGNpcmNsZS54LCBjaXJjbGUueSwgcmFkaXVzLCByYWRpdXMpO1xyXG4gICAgfVxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gU2tldGNoO1xyXG5cclxudmFyIE5vaXNlID0gcmVxdWlyZShcIi4vZ2VuZXJhdG9ycy9ub2lzZS1nZW5lcmF0b3JzLmpzXCIpO1xyXG52YXIgQmJveFRleHQgPSByZXF1aXJlKFwicDUtYmJveC1hbGlnbmVkLXRleHRcIik7XHJcbnZhciBCYXNlTG9nb1NrZXRjaCA9IHJlcXVpcmUoXCIuL2Jhc2UtbG9nby1za2V0Y2guanNcIik7XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUpO1xyXG5cclxuZnVuY3Rpb24gU2tldGNoKCRuYXYsICRuYXZMb2dvKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5jYWxsKHRoaXMsICRuYXYsICRuYXZMb2dvLCBcIi4uL2ZvbnRzL2JpZ19qb2huLXdlYmZvbnQudHRmXCIpO1xyXG59XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZSA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplLmNhbGwodGhpcywgcCk7XHJcbiAgICAvLyBVcGRhdGUgdGhlIGJib3hUZXh0LCBwbGFjZSBvdmVyIHRoZSBuYXYgdGV4dCBsb2dvIGFuZCB0aGVuIHNoaWZ0IGl0cyBcclxuICAgIC8vIGFuY2hvciBiYWNrIHRvIChjZW50ZXIsIGNlbnRlcikgd2hpbGUgcHJlc2VydmluZyB0aGUgdGV4dCBwb3NpdGlvblxyXG4gICAgdGhpcy5fYmJveFRleHQuc2V0VGV4dCh0aGlzLl90ZXh0KVxyXG4gICAgICAgIC5zZXRUZXh0U2l6ZSh0aGlzLl9mb250U2l6ZSlcclxuICAgICAgICAuc2V0Um90YXRpb24oMClcclxuICAgICAgICAuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9MRUZULCBCYm94VGV4dC5CQVNFTElORS5BTFBIQUJFVElDKVxyXG4gICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLl90ZXh0T2Zmc2V0LmxlZnQsIHRoaXMuX3RleHRPZmZzZXQudG9wKVxyXG4gICAgICAgIC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0NFTlRFUiwgQmJveFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUiwgXHJcbiAgICAgICAgICAgIHRydWUpO1xyXG4gICAgdGhpcy5fdGV4dFBvcyA9IHRoaXMuX2Jib3hUZXh0LmdldFBvc2l0aW9uKCk7XHJcbiAgICB0aGlzLl9kcmF3U3RhdGlvbmFyeUxvZ28ocCk7XHJcbiAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSB0cnVlO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhd1N0YXRpb25hcnlMb2dvID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgcC5zdHJva2UoMjU1KTtcclxuICAgIHAuZmlsbChcIiMwQTAwMEFcIik7XHJcbiAgICBwLnN0cm9rZVdlaWdodCgyKTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LmRyYXcoKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX3NldHVwID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fc2V0dXAuY2FsbCh0aGlzLCBwKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBCYm94QWxpZ25lZFRleHQgaW5zdGFuY2UgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIGRyYXdpbmcgYW5kIFxyXG4gICAgLy8gcm90YXRpbmcgdGV4dFxyXG4gICAgdGhpcy5fYmJveFRleHQgPSBuZXcgQmJveFRleHQodGhpcy5fZm9udCwgdGhpcy5fdGV4dCwgdGhpcy5fZm9udFNpemUsIDAsIDAsIFxyXG4gICAgICAgIHApO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgaW5pdGlhbCBzZXR1cCBieSB0cmlnZ2VyaW5nIGEgcmVzaXplXHJcbiAgICB0aGlzLl9vblJlc2l6ZShwKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgbm9pc2UgZ2VuZXJhdG9yc1xyXG4gICAgdGhpcy5fcm90YXRpb25Ob2lzZSA9IG5ldyBOb2lzZS5Ob2lzZUdlbmVyYXRvcjFEKHAsIC1wLlBJLzQsIHAuUEkvNCwgMC4wMik7IFxyXG4gICAgdGhpcy5feHlOb2lzZSA9IG5ldyBOb2lzZS5Ob2lzZUdlbmVyYXRvcjJEKHAsIC0xMDAsIDEwMCwgLTUwLCA1MCwgMC4wMSwgXHJcbiAgICAgICAgMC4wMSk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fZHJhdy5jYWxsKHRoaXMsIHApO1xyXG4gICAgaWYgKCF0aGlzLl9pc01vdXNlT3ZlciB8fCAhdGhpcy5faXNPdmVyTmF2TG9nbykgcmV0dXJuO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHRleHQgaXMgYWJvdXQgdG8gYmVjb21lIGFjdGl2ZSBmb3IgdGhlIGZpcnN0IHRpbWUsIGNsZWFyXHJcbiAgICAvLyB0aGUgc3RhdGlvbmFyeSBsb2dvIHRoYXQgd2FzIHByZXZpb3VzbHkgZHJhd24uIFxyXG4gICAgaWYgKHRoaXMuX2lzRmlyc3RGcmFtZSkge1xyXG4gICAgICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBwb3NpdGlvbiBhbmQgcm90YXRpb24gdG8gY3JlYXRlIGEgaml0dGVyeSBsb2dvXHJcbiAgICB2YXIgcm90YXRpb24gPSB0aGlzLl9yb3RhdGlvbk5vaXNlLmdlbmVyYXRlKCk7XHJcbiAgICB2YXIgeHlPZmZzZXQgPSB0aGlzLl94eU5vaXNlLmdlbmVyYXRlKCk7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRSb3RhdGlvbihyb3RhdGlvbilcclxuICAgICAgICAuc2V0UG9zaXRpb24odGhpcy5fdGV4dFBvcy54ICsgeHlPZmZzZXQueCwgdGhpcy5fdGV4dFBvcy55ICsgeHlPZmZzZXQueSlcclxuICAgICAgICAuZHJhdygpO1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gTWFpbk5hdjtcclxuXHJcbmZ1bmN0aW9uIE1haW5OYXYobG9hZGVyKSB7XHJcbiAgICB0aGlzLl9sb2FkZXIgPSBsb2FkZXI7XHJcbiAgICB0aGlzLl8kbG9nbyA9ICQoXCJuYXYubmF2YmFyIC5uYXZiYXItYnJhbmRcIik7XHJcbiAgICB0aGlzLl8kbmF2ID0gJChcIiNtYWluLW5hdlwiKTtcclxuICAgIHRoaXMuXyRuYXZMaW5rcyA9IHRoaXMuXyRuYXYuZmluZChcImFcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2ID0gdGhpcy5fJG5hdkxpbmtzLmZpbmQoXCIuYWN0aXZlXCIpOyBcclxuICAgIHRoaXMuXyRuYXZMaW5rcy5vbihcImNsaWNrXCIsIHRoaXMuX29uTmF2Q2xpY2suYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLl8kbG9nby5vbihcImNsaWNrXCIsIHRoaXMuX29uTG9nb0NsaWNrLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5NYWluTmF2LnByb3RvdHlwZS5zZXRBY3RpdmVGcm9tVXJsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fZGVhY3RpdmF0ZSgpO1xyXG4gICAgdmFyIHVybCA9IGxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgaWYgKHVybCA9PT0gXCIvaW5kZXguaHRtbFwiIHx8IHVybCA9PT0gXCIvXCIpIHtcclxuICAgICAgICB0aGlzLl9hY3RpdmF0ZUxpbmsodGhpcy5fJG5hdkxpbmtzLmZpbHRlcihcIiNhYm91dC1saW5rXCIpKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHVybCA9PT0gXCIvd29yay5odG1sXCIpIHsgICAgICAgIFxyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlTGluayh0aGlzLl8kbmF2TGlua3MuZmlsdGVyKFwiI3dvcmstbGlua1wiKSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5NYWluTmF2LnByb3RvdHlwZS5fZGVhY3RpdmF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLl8kYWN0aXZlTmF2Lmxlbmd0aCkge1xyXG4gICAgICAgIHRoaXMuXyRhY3RpdmVOYXYucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdiA9ICQoKTtcclxuICAgIH1cclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9hY3RpdmF0ZUxpbmsgPSBmdW5jdGlvbiAoJGxpbmspIHtcclxuICAgICRsaW5rLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdiA9ICRsaW5rO1xyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX29uTG9nb0NsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgdmFyIHVybCA9ICR0YXJnZXQuYXR0cihcImhyZWZcIik7XHJcbiAgICB0aGlzLl9sb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgdHJ1ZSk7XHJcbn07XHJcblxyXG5NYWluTmF2LnByb3RvdHlwZS5fb25OYXZDbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB0aGlzLl8kbmF2LmNvbGxhcHNlKFwiaGlkZVwiKTsgLy8gQ2xvc2UgdGhlIG5hdiAtIG9ubHkgbWF0dGVycyBvbiBtb2JpbGVcclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgaWYgKCR0YXJnZXQuaXModGhpcy5fJGFjdGl2ZU5hdikpIHJldHVybjtcclxuICAgIHRoaXMuX2RlYWN0aXZhdGUoKTtcclxuICAgIHRoaXMuX2FjdGl2YXRlTGluaygkdGFyZ2V0KTtcclxuICAgIHZhciB1cmwgPSAkdGFyZ2V0LmF0dHIoXCJocmVmXCIpO1xyXG4gICAgdGhpcy5fbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIHRydWUpOyAgICBcclxufTsiLCJ2YXIgTG9hZGVyID0gcmVxdWlyZShcIi4vcGFnZS1sb2FkZXIuanNcIik7XHJcbnZhciBNYWluTmF2ID0gcmVxdWlyZShcIi4vbWFpbi1uYXYuanNcIik7XHJcbnZhciBIb3ZlclNsaWRlc2hvd3MgPSByZXF1aXJlKFwiLi9ob3Zlci1zbGlkZXNob3cuanNcIik7XHJcbnZhciBQb3J0Zm9saW9GaWx0ZXIgPSByZXF1aXJlKFwiLi9wb3J0Zm9saW8tZmlsdGVyLmpzXCIpO1xyXG52YXIgSW1hZ2VHYWxsZXJpZXMgPSByZXF1aXJlKFwiLi9pbWFnZS1nYWxsZXJ5LmpzXCIpO1xyXG5cclxuLy8gUGlja2luZyBhIHJhbmRvbSBza2V0Y2ggdGhhdCB0aGUgdXNlciBoYXNuJ3Qgc2VlbiBiZWZvcmVcclxudmFyIFNrZXRjaCA9IHJlcXVpcmUoXCIuL3BpY2stcmFuZG9tLXNrZXRjaC5qc1wiKSgpO1xyXG5cclxuLy8gQUpBWCBwYWdlIGxvYWRlciwgd2l0aCBjYWxsYmFjayBmb3IgcmVsb2FkaW5nIHdpZGdldHNcclxudmFyIGxvYWRlciA9IG5ldyBMb2FkZXIob25QYWdlTG9hZCk7XHJcblxyXG4vLyBNYWluIG5hdiB3aWRnZXRcclxudmFyIG1haW5OYXYgPSBuZXcgTWFpbk5hdihsb2FkZXIpO1xyXG5cclxuLy8gSW50ZXJhY3RpdmUgbG9nbyBpbiBuYXZiYXJcclxudmFyIG5hdiA9ICQoXCJuYXYubmF2YmFyXCIpO1xyXG52YXIgbmF2TG9nbyA9IG5hdi5maW5kKFwiLm5hdmJhci1icmFuZFwiKTtcclxudmFyIHNrZXRjaCA9IG5ldyBTa2V0Y2gobmF2LCBuYXZMb2dvKTtcclxuXHJcbi8vIFdpZGdldCBnbG9iYWxzXHJcbnZhciBob3ZlclNsaWRlc2hvd3MsIHBvcnRmb2xpb0ZpbHRlciwgaW1hZ2VHYWxsZXJpZXM7XHJcblxyXG4vLyBMb2FkIGFsbCB3aWRnZXRzXHJcbm9uUGFnZUxvYWQoKTtcclxuXHJcbi8vIEhhbmRsZSBiYWNrL2ZvcndhcmQgYnV0dG9uc1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIG9uUG9wU3RhdGUpO1xyXG5cclxuZnVuY3Rpb24gb25Qb3BTdGF0ZShlKSB7XHJcbiAgICAvLyBMb2FkZXIgc3RvcmVzIGN1c3RvbSBkYXRhIGluIHRoZSBzdGF0ZSAtIGluY2x1ZGluZyB0aGUgdXJsIGFuZCB0aGUgcXVlcnlcclxuICAgIHZhciB1cmwgPSAoZS5zdGF0ZSAmJiBlLnN0YXRlLnVybCkgfHwgXCIvaW5kZXguaHRtbFwiO1xyXG4gICAgdmFyIHF1ZXJ5T2JqZWN0ID0gKGUuc3RhdGUgJiYgZS5zdGF0ZS5xdWVyeSkgfHwge307XHJcblxyXG4gICAgaWYgKCh1cmwgPT09IGxvYWRlci5nZXRMb2FkZWRQYXRoKCkpICYmICh1cmwgPT09IFwiL3dvcmsuaHRtbFwiKSkge1xyXG4gICAgICAgIC8vIFRoZSBjdXJyZW50ICYgcHJldmlvdXMgbG9hZGVkIHN0YXRlcyB3ZXJlIHdvcmsuaHRtbCwgc28ganVzdCByZWZpbHRlclxyXG4gICAgICAgIHZhciBjYXRlZ29yeSA9IHF1ZXJ5T2JqZWN0LmNhdGVnb3J5IHx8IFwiYWxsXCI7XHJcbiAgICAgICAgcG9ydGZvbGlvRmlsdGVyLnNlbGVjdENhdGVnb3J5KGNhdGVnb3J5KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gTG9hZCB0aGUgbmV3IHBhZ2VcclxuICAgICAgICBsb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgZmFsc2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBvblBhZ2VMb2FkKCkge1xyXG4gICAgLy8gUmVsb2FkIGFsbCBwbHVnaW5zL3dpZGdldHNcclxuICAgIGhvdmVyU2xpZGVzaG93cyA9IG5ldyBIb3ZlclNsaWRlc2hvd3MoKTtcclxuICAgIHBvcnRmb2xpb0ZpbHRlciA9IG5ldyBQb3J0Zm9saW9GaWx0ZXIobG9hZGVyKTtcclxuICAgIGltYWdlR2FsbGVyaWVzID0gbmV3IEltYWdlR2FsbGVyaWVzKCk7XHJcbiAgICBvYmplY3RGaXRJbWFnZXMoKTtcclxuICAgIHNtYXJ0cXVvdGVzKCk7XHJcblxyXG4gICAgLy8gU2xpZ2h0bHkgcmVkdW5kYW50LCBidXQgdXBkYXRlIHRoZSBtYWluIG5hdiB1c2luZyB0aGUgY3VycmVudCBVUkwuIFRoaXNcclxuICAgIC8vIGlzIGltcG9ydGFudCBpZiBhIHBhZ2UgaXMgbG9hZGVkIGJ5IHR5cGluZyBhIGZ1bGwgVVJMIChlLmcuIGdvaW5nXHJcbiAgICAvLyBkaXJlY3RseSB0byAvd29yay5odG1sKSBvciB3aGVuIG1vdmluZyBmcm9tIHdvcmsuaHRtbCB0byBhIHByb2plY3QuIFxyXG4gICAgbWFpbk5hdi5zZXRBY3RpdmVGcm9tVXJsKCk7XHJcbn1cclxuXHJcbi8vIFdlJ3ZlIGhpdCB0aGUgbGFuZGluZyBwYWdlLCBsb2FkIHRoZSBhYm91dCBwYWdlXHJcbi8vIGlmIChsb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvXihcXC98XFwvaW5kZXguaHRtbHxpbmRleC5odG1sKSQvKSkge1xyXG4vLyAgICAgbG9hZGVyLmxvYWRQYWdlKFwiL2Fib3V0Lmh0bWxcIiwge30sIGZhbHNlKTtcclxuLy8gfSIsIm1vZHVsZS5leHBvcnRzID0gTG9hZGVyO1xyXG5cclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIExvYWRlcihvblJlbG9hZCwgZmFkZUR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl8kY29udGVudCA9ICQoXCIjY29udGVudFwiKTtcclxuICAgIHRoaXMuX29uUmVsb2FkID0gb25SZWxvYWQ7XHJcbiAgICB0aGlzLl9mYWRlRHVyYXRpb24gPSAoZmFkZUR1cmF0aW9uICE9PSB1bmRlZmluZWQpID8gZmFkZUR1cmF0aW9uIDogMjUwO1xyXG4gICAgdGhpcy5fcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lO1xyXG59XHJcblxyXG5Mb2FkZXIucHJvdG90eXBlLmdldExvYWRlZFBhdGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGF0aDtcclxufTtcclxuXHJcbkxvYWRlci5wcm90b3R5cGUubG9hZFBhZ2UgPSBmdW5jdGlvbiAodXJsLCBxdWVyeU9iamVjdCwgc2hvdWxkUHVzaEhpc3RvcnkpIHtcclxuICAgIC8vIEZhZGUgdGhlbiBlbXB0eSB0aGUgY3VycmVudCBjb250ZW50c1xyXG4gICAgdGhpcy5fJGNvbnRlbnQudmVsb2NpdHkoeyBvcGFjaXR5OiAwIH0sIHRoaXMuX2ZhZGVEdXJhdGlvbiwgXCJzd2luZ1wiLFxyXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl8kY29udGVudC5lbXB0eSgpO1xyXG4gICAgICAgIHRoaXMuXyRjb250ZW50LmxvYWQodXJsICsgXCIgI2NvbnRlbnRcIiwgb25Db250ZW50RmV0Y2hlZC5iaW5kKHRoaXMpKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gRmFkZSB0aGUgbmV3IGNvbnRlbnQgaW4gYWZ0ZXIgaXQgaGFzIGJlZW4gZmV0Y2hlZFxyXG4gICAgZnVuY3Rpb24gb25Db250ZW50RmV0Y2hlZChyZXNwb25zZVRleHQsIHRleHRTdGF0dXMsIGpxWGhyKSB7XHJcbiAgICAgICAgaWYgKHRleHRTdGF0dXMgPT09IFwiZXJyb3JcIikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZXJlIHdhcyBhIHByb2JsZW0gbG9hZGluZyB0aGUgcGFnZS5cIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBxdWVyeVN0cmluZyA9IHV0aWxpdGllcy5jcmVhdGVRdWVyeVN0cmluZyhxdWVyeU9iamVjdCk7XHJcbiAgICAgICAgaWYgKHNob3VsZFB1c2hIaXN0b3J5KSB7XHJcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgICAgICAgICAgcXVlcnk6IHF1ZXJ5T2JqZWN0XHJcbiAgICAgICAgICAgIH0sIG51bGwsIHVybCArIHF1ZXJ5U3RyaW5nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX3BhdGggPSBsb2NhdGlvbi5wYXRobmFtZTtcclxuICAgICAgICB0aGlzLl8kY29udGVudC52ZWxvY2l0eSh7IG9wYWNpdHk6IDEgfSwgdGhpcy5fZmFkZUR1cmF0aW9uLCBcclxuICAgICAgICAgICAgXCJzd2luZ1wiKTtcclxuICAgICAgICB0aGlzLl9vblJlbG9hZCgpO1xyXG4gICAgfVxyXG59OyIsInZhciBjb29raWVzID0gcmVxdWlyZShcImpzLWNvb2tpZVwiKTtcclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxudmFyIHNrZXRjaENvbnN0cnVjdG9ycyA9IHtcclxuICAgIFwiaGFsZnRvbmUtZmxhc2hsaWdodFwiOiBcclxuICAgICAgICByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9oYWxmdG9uZS1mbGFzaGxpZ2h0LXdvcmQuanNcIiksXHJcbiAgICBcIm5vaXN5LXdvcmRcIjpcclxuICAgICAgICByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9ub2lzeS13b3JkLXNrZXRjaC5qc1wiKSxcclxuICAgIFwiY29ubmVjdC1wb2ludHNcIjpcclxuICAgICAgICByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9jb25uZWN0LXBvaW50cy1za2V0Y2guanNcIilcclxufTtcclxudmFyIG51bVNrZXRjaGVzID0gT2JqZWN0LmtleXMoc2tldGNoQ29uc3RydWN0b3JzKS5sZW5ndGg7XHJcbnZhciBjb29raWVLZXkgPSBcInNlZW4tc2tldGNoLW5hbWVzXCI7XHJcblxyXG4vKipcclxuICogUGljayBhIHJhbmRvbSBza2V0Y2ggdGhhdCB1c2VyIGhhc24ndCBzZWVuIHlldC4gSWYgdGhlIHVzZXIgaGFzIHNlZW4gYWxsIHRoZVxyXG4gKiBza2V0Y2hlcywganVzdCBwaWNrIGEgcmFuZG9tIG9uZS4gVGhpcyB1c2VzIGNvb2tpZXMgdG8gdHJhY2sgd2hhdCB0aGUgdXNlciBcclxuICogaGFzIHNlZW4gYWxyZWFkeS5cclxuICogQHJldHVybiB7RnVuY3Rpb259IENvbnN0cnVjdG9yIGZvciBhIFNrZXRjaCBjbGFzc1xyXG4gKi9cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBwaWNrUmFuZG9tU2tldGNoKCkge1xyXG4gICAgdmFyIHNlZW5Ta2V0Y2hOYW1lcyA9IGNvb2tpZXMuZ2V0SlNPTihjb29raWVLZXkpIHx8IFtdO1xyXG5cclxuICAgIC8vIEZpbmQgdGhlIG5hbWVzIG9mIHRoZSB1bnNlZW4gc2tldGNoZXNcclxuICAgIHZhciB1bnNlZW5Ta2V0Y2hOYW1lcyA9IGZpbmRVbnNlZW5Ta2V0Y2hlcyhzZWVuU2tldGNoTmFtZXMpO1xyXG5cclxuICAgIC8vIEFsbCBza2V0Y2hlcyBoYXZlIGJlZW4gc2VlblxyXG4gICAgaWYgKHVuc2VlblNrZXRjaE5hbWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgIC8vIElmIHdlJ3ZlIGdvdCBtb3JlIHRoZW4gb25lIHNrZXRjaCwgdGhlbiBtYWtlIHN1cmUgdG8gY2hvb3NlIGEgcmFuZG9tXHJcbiAgICAgICAgLy8gc2tldGNoIGV4Y2x1ZGluZyB0aGUgbW9zdCByZWNlbnRseSBzZWVuIHNrZXRjaFxyXG4gICAgICAgIGlmIChudW1Ta2V0Y2hlcyA+IDEpIHtcclxuICAgICAgICAgICAgc2VlblNrZXRjaE5hbWVzID0gW3NlZW5Ta2V0Y2hOYW1lcy5wb3AoKV07XHJcbiAgICAgICAgICAgIHVuc2VlblNrZXRjaE5hbWVzID0gZmluZFVuc2VlblNrZXRjaGVzKHNlZW5Ta2V0Y2hOYW1lcyk7XHJcbiAgICAgICAgfSBcclxuICAgICAgICAvLyBJZiB3ZSd2ZSBvbmx5IGdvdCBvbmUgc2tldGNoLCB0aGVuIHdlIGNhbid0IGRvIG11Y2guLi5cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VlblNrZXRjaE5hbWVzID0gW107XHJcbiAgICAgICAgICAgIHVuc2VlblNrZXRjaE5hbWVzID0gT2JqZWN0LmtleXMoc2tldGNoQ29uc3RydWN0b3JzKTsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHJhbmRTa2V0Y2hOYW1lID0gdXRpbHMucmFuZEFycmF5RWxlbWVudCh1bnNlZW5Ta2V0Y2hOYW1lcyk7XHJcbiAgICBzZWVuU2tldGNoTmFtZXMucHVzaChyYW5kU2tldGNoTmFtZSk7XHJcblxyXG4gICAgLy8gU3RvcmUgdGhlIGdlbmVyYXRlZCBza2V0Y2ggaW4gYSBjb29raWUuIFRoaXMgY3JlYXRlcyBhIG1vdmluZyA3IGRheVxyXG4gICAgLy8gd2luZG93IC0gYW55dGltZSB0aGUgc2l0ZSBpcyB2aXNpdGVkLCB0aGUgY29va2llIGlzIHJlZnJlc2hlZC5cclxuICAgIGNvb2tpZXMuc2V0KGNvb2tpZUtleSwgc2VlblNrZXRjaE5hbWVzLCB7IGV4cGlyZXM6IDcgfSk7XHJcblxyXG4gICAgcmV0dXJuIHNrZXRjaENvbnN0cnVjdG9yc1tyYW5kU2tldGNoTmFtZV07XHJcbn07XHJcblxyXG5mdW5jdGlvbiBmaW5kVW5zZWVuU2tldGNoZXMoc2VlblNrZXRjaE5hbWVzKSB7XHJcbiAgICB2YXIgdW5zZWVuU2tldGNoTmFtZXMgPSBbXTtcclxuICAgIGZvciAodmFyIHNrZXRjaE5hbWUgaW4gc2tldGNoQ29uc3RydWN0b3JzKSB7XHJcbiAgICAgICAgaWYgKHNlZW5Ta2V0Y2hOYW1lcy5pbmRleE9mKHNrZXRjaE5hbWUpID09PSAtMSkge1xyXG4gICAgICAgICAgICB1bnNlZW5Ta2V0Y2hOYW1lcy5wdXNoKHNrZXRjaE5hbWUpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB1bnNlZW5Ta2V0Y2hOYW1lcztcclxufSIsIm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvRmlsdGVyO1xyXG5cclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbnZhciBkZWZhdWx0QnJlYWtwb2ludHMgPSBbXHJcbiAgICB7IHdpZHRoOiAxMjAwLCBjb2xzOiAzLCBzcGFjaW5nOiAxNSB9LFxyXG4gICAgeyB3aWR0aDogOTkyLCBjb2xzOiAzLCBzcGFjaW5nOiAxNSB9LFxyXG4gICAgeyB3aWR0aDogNzAwLCBjb2xzOiAzLCBzcGFjaW5nOiAxNSB9LFxyXG4gICAgeyB3aWR0aDogNjAwLCBjb2xzOiAyLCBzcGFjaW5nOiAxMCB9LFxyXG4gICAgeyB3aWR0aDogNDgwLCBjb2xzOiAyLCBzcGFjaW5nOiAxMCB9LFxyXG4gICAgeyB3aWR0aDogMzIwLCBjb2xzOiAxLCBzcGFjaW5nOiAxMCB9XHJcbl07XHJcblxyXG5mdW5jdGlvbiBQb3J0Zm9saW9GaWx0ZXIobG9hZGVyLCBicmVha3BvaW50cywgYXNwZWN0UmF0aW8sIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgdGhpcy5fbG9hZGVyID0gbG9hZGVyO1xyXG4gICAgdGhpcy5fZ3JpZFNwYWNpbmcgPSAwO1xyXG4gICAgdGhpcy5fYXNwZWN0UmF0aW8gPSAoYXNwZWN0UmF0aW8gIT09IHVuZGVmaW5lZCkgPyBhc3BlY3RSYXRpbyA6ICgxNi85KTtcclxuICAgIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9ICh0cmFuc2l0aW9uRHVyYXRpb24gIT09IHVuZGVmaW5lZCkgPyBcclxuICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb24gOiA4MDA7XHJcbiAgICB0aGlzLl9icmVha3BvaW50cyA9IChicmVha3BvaW50cyAhPT0gdW5kZWZpbmVkKSA/IFxyXG4gICAgICAgIGJyZWFrcG9pbnRzLnNsaWNlKCkgOiBkZWZhdWx0QnJlYWtwb2ludHMuc2xpY2UoKTtcclxuICAgIHRoaXMuXyRncmlkID0gJChcIiNwb3J0Zm9saW8tZ3JpZFwiKTtcclxuICAgIHRoaXMuXyRuYXYgPSAkKFwiI3BvcnRmb2xpby1uYXZcIik7XHJcbiAgICB0aGlzLl8kcHJvamVjdHMgPSBbXTtcclxuICAgIHRoaXMuXyRjYXRlZ29yaWVzID0ge307XHJcbiAgICB0aGlzLl9yb3dzID0gMDtcclxuICAgIHRoaXMuX2NvbHMgPSAwO1xyXG4gICAgdGhpcy5faW1hZ2VIZWlnaHQgPSAwO1xyXG4gICAgdGhpcy5faW1hZ2VXaWR0aCA9IDA7XHJcblxyXG4gICAgLy8gU29ydCB0aGUgYnJlYWtwb2ludHMgaW4gZGVzY2VuZGluZyBvcmRlclxyXG4gICAgdGhpcy5fYnJlYWtwb2ludHMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEud2lkdGggPCBiLndpZHRoKSByZXR1cm4gLTE7XHJcbiAgICAgICAgZWxzZSBpZiAoYS53aWR0aCA+IGIud2lkdGgpIHJldHVybiAxO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuIDA7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9jYWNoZVByb2plY3RzKCk7XHJcbiAgICB0aGlzLl9jcmVhdGVHcmlkKCk7XHJcblxyXG4gICAgdGhpcy5fJGdyaWQuZmluZChcIi5wcm9qZWN0IGFcIikub24oXCJjbGlja1wiLCB0aGlzLl9vblByb2plY3RDbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB2YXIgcXMgPSB1dGlsaXRpZXMuZ2V0UXVlcnlQYXJhbWV0ZXJzKCk7XHJcbiAgICB2YXIgaW5pdGlhbENhdGVnb3J5ID0gcXMuY2F0ZWdvcnkgfHwgXCJhbGxcIjtcclxuICAgIHZhciBjYXRlZ29yeSA9IGluaXRpYWxDYXRlZ29yeS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0gPSB0aGlzLl8kbmF2LmZpbmQoXCJhW2RhdGEtY2F0ZWdvcnk9XCIgKyBjYXRlZ29yeSArIFwiXVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG4gICAgJChcIiNwb3J0Zm9saW8tbmF2IGFcIikub24oXCJjbGlja1wiLCB0aGlzLl9vbk5hdkNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgICQod2luZG93KS5vbihcInJlc2l6ZVwiLCB0aGlzLl9jcmVhdGVHcmlkLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLnNlbGVjdENhdGVnb3J5ID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XHJcbiAgICBjYXRlZ29yeSA9IChjYXRlZ29yeSAmJiBjYXRlZ29yeS50b0xvd2VyQ2FzZSgpKSB8fCBcImFsbFwiO1xyXG4gICAgdmFyICRzZWxlY3RlZE5hdiA9IHRoaXMuXyRuYXYuZmluZChcImFbZGF0YS1jYXRlZ29yeT1cIiArIGNhdGVnb3J5ICsgXCJdXCIpO1xyXG4gICAgaWYgKCRzZWxlY3RlZE5hdi5sZW5ndGggJiYgISRzZWxlY3RlZE5hdi5pcyh0aGlzLl8kYWN0aXZlTmF2SXRlbSkpIHtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9ICRzZWxlY3RlZE5hdjtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLl9maWx0ZXJQcm9qZWN0cyhjYXRlZ29yeSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9maWx0ZXJQcm9qZWN0cyA9IGZ1bmN0aW9uIChjYXRlZ29yeSkge1xyXG4gICAgdmFyICRzZWxlY3RlZEVsZW1lbnRzID0gdGhpcy5fZ2V0UHJvamVjdHNJbkNhdGVnb3J5KGNhdGVnb3J5KTtcclxuXHJcbiAgICAvLyBBbmltYXRlIHRoZSBncmlkIHRvIHRoZSBjb3JyZWN0IGhlaWdodCB0byBjb250YWluIHRoZSByb3dzXHJcbiAgICB0aGlzLl9hbmltYXRlR3JpZEhlaWdodCgkc2VsZWN0ZWRFbGVtZW50cy5sZW5ndGgpO1xyXG4gICAgXHJcbiAgICAvLyBMb29wIHRocm91Z2ggYWxsIHByb2plY3RzXHJcbiAgICB0aGlzLl8kcHJvamVjdHMuZm9yRWFjaChmdW5jdGlvbiAoJGVsZW1lbnQpIHtcclxuICAgICAgICAvLyBTdG9wIGFsbCBhbmltYXRpb25zXHJcbiAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoXCJzdG9wXCIpO1xyXG4gICAgICAgIC8vIElmIGFuIGVsZW1lbnQgaXMgbm90IHNlbGVjdGVkOiBkcm9wIHotaW5kZXggJiBhbmltYXRlIG9wYWNpdHkgLT4gaGlkZVxyXG4gICAgICAgIHZhciBzZWxlY3RlZEluZGV4ID0gJHNlbGVjdGVkRWxlbWVudHMuaW5kZXhPZigkZWxlbWVudCk7IFxyXG4gICAgICAgIGlmIChzZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAkZWxlbWVudC5jc3MoXCJ6SW5kZXhcIiwgLTEpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC52ZWxvY2l0eSh7XHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICAgICAgICAgIH0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXCJlYXNlSW5PdXRDdWJpY1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJZiBhbiBlbGVtZW50IGlzIHNlbGVjdGVkOiBzaG93ICYgYnVtcCB6LWluZGV4ICYgYW5pbWF0ZSB0byBwb3NpdGlvbiBcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC5jc3MoXCJ6SW5kZXhcIiwgMCk7XHJcbiAgICAgICAgICAgIHZhciBuZXdQb3MgPSB0aGlzLl9pbmRleFRvWFkoc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgICRlbGVtZW50LnZlbG9jaXR5KHsgXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxLFxyXG4gICAgICAgICAgICAgICAgdG9wOiBuZXdQb3MueSArIFwicHhcIixcclxuICAgICAgICAgICAgICAgIGxlZnQ6IG5ld1Bvcy54ICsgXCJweFwiXHJcbiAgICAgICAgICAgIH0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fYW5pbWF0ZUdyaWRIZWlnaHQgPSBmdW5jdGlvbiAobnVtRWxlbWVudHMpIHtcclxuICAgIHRoaXMuXyRncmlkLnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgIHZhciBjdXJSb3dzID0gTWF0aC5jZWlsKG51bUVsZW1lbnRzIC8gdGhpcy5fY29scyk7XHJcbiAgICB0aGlzLl8kZ3JpZC52ZWxvY2l0eSh7XHJcbiAgICAgICAgaGVpZ2h0OiB0aGlzLl9pbWFnZUhlaWdodCAqIGN1clJvd3MgKyBcclxuICAgICAgICAgICAgdGhpcy5fZ3JpZFNwYWNpbmcgKiAoY3VyUm93cyAtIDEpICsgXCJweFwiXHJcbiAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24pO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZ2V0UHJvamVjdHNJbkNhdGVnb3J5ID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XHJcbiAgICBpZiAoY2F0ZWdvcnkgPT09IFwiYWxsXCIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fJHByb2plY3RzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XSB8fCBbXSk7XHJcbiAgICB9ICAgICAgICBcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhY2hlUHJvamVjdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl8kcHJvamVjdHMgPSBbXTtcclxuICAgIHRoaXMuXyRjYXRlZ29yaWVzID0ge307XHJcbiAgICB0aGlzLl8kZ3JpZC5maW5kKFwiLnByb2plY3RcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuXyRwcm9qZWN0cy5wdXNoKCRlbGVtZW50KTtcclxuICAgICAgICB2YXIgY2F0ZWdvcnlOYW1lcyA9ICRlbGVtZW50LmRhdGEoXCJjYXRlZ29yaWVzXCIpLnNwbGl0KFwiLFwiKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhdGVnb3J5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyIGNhdGVnb3J5ID0gJC50cmltKGNhdGVnb3J5TmFtZXNbaV0pLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl8kY2F0ZWdvcmllc1tjYXRlZ29yeV0gPSBbJGVsZW1lbnRdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldLnB1c2goJGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbi8vIFBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhbGN1bGF0ZUdyaWQgPSBmdW5jdGlvbiAoKSB7XHJcbi8vICAgICB2YXIgZ3JpZFdpZHRoID0gdGhpcy5fJGdyaWQuaW5uZXJXaWR0aCgpO1xyXG4vLyAgICAgdGhpcy5fY29scyA9IE1hdGguZmxvb3IoKGdyaWRXaWR0aCArIHRoaXMuX2dyaWRTcGFjaW5nKSAvIFxyXG4vLyAgICAgICAgICh0aGlzLl9taW5JbWFnZVdpZHRoICsgdGhpcy5fZ3JpZFNwYWNpbmcpKTtcclxuLy8gICAgIHRoaXMuX3Jvd3MgPSBNYXRoLmNlaWwodGhpcy5fJHByb2plY3RzLmxlbmd0aCAvIHRoaXMuX2NvbHMpO1xyXG4vLyAgICAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAoKHRoaXMuX2NvbHMgLSAxKSAqIHRoaXMuX2dyaWRTcGFjaW5nKSkgLyBcclxuLy8gICAgICAgICB0aGlzLl9jb2xzO1xyXG4vLyAgICAgdGhpcy5faW1hZ2VIZWlnaHQgPSB0aGlzLl9pbWFnZVdpZHRoICogKDEgLyB0aGlzLl9hc3BlY3RSYXRpbyk7XHJcbi8vIH07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jYWxjdWxhdGVHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGdyaWRXaWR0aCA9IHRoaXMuXyRncmlkLmlubmVyV2lkdGgoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYnJlYWtwb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAoZ3JpZFdpZHRoIDw9IHRoaXMuX2JyZWFrcG9pbnRzW2ldLndpZHRoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbHMgPSB0aGlzLl9icmVha3BvaW50c1tpXS5jb2xzO1xyXG4gICAgICAgICAgICB0aGlzLl9ncmlkU3BhY2luZyA9IHRoaXMuX2JyZWFrcG9pbnRzW2ldLnNwYWNpbmc7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuX3Jvd3MgPSBNYXRoLmNlaWwodGhpcy5fJHByb2plY3RzLmxlbmd0aCAvIHRoaXMuX2NvbHMpO1xyXG4gICAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAoKHRoaXMuX2NvbHMgLSAxKSAqIHRoaXMuX2dyaWRTcGFjaW5nKSkgLyBcclxuICAgICAgICB0aGlzLl9jb2xzO1xyXG4gICAgdGhpcy5faW1hZ2VIZWlnaHQgPSB0aGlzLl9pbWFnZVdpZHRoICogKDEgLyB0aGlzLl9hc3BlY3RSYXRpbyk7XHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jcmVhdGVHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlR3JpZCgpO1xyXG5cclxuICAgIHRoaXMuXyRncmlkLmNzcyhcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XHJcbiAgICB0aGlzLl8kZ3JpZC5jc3Moe1xyXG4gICAgICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKiB0aGlzLl9yb3dzICsgXHJcbiAgICAgICAgICAgIHRoaXMuX2dyaWRTcGFjaW5nICogKHRoaXMuX3Jvd3MgLSAxKSArIFwicHhcIlxyXG4gICAgfSk7ICAgIFxyXG5cclxuICAgIHRoaXMuXyRwcm9qZWN0cy5mb3JFYWNoKGZ1bmN0aW9uICgkZWxlbWVudCwgaW5kZXgpIHtcclxuICAgICAgICB2YXIgcG9zID0gdGhpcy5faW5kZXhUb1hZKGluZGV4KTtcclxuICAgICAgICAkZWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICB0b3A6IHBvcy55ICsgXCJweFwiLFxyXG4gICAgICAgICAgICBsZWZ0OiBwb3MueCArIFwicHhcIixcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuX2ltYWdlV2lkdGggKyBcInB4XCIsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKyBcInB4XCJcclxuICAgICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7ICAgIFxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fb25OYXZDbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xyXG4gICAgaWYgKCR0YXJnZXQuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSByZXR1cm47XHJcbiAgICBpZiAodGhpcy5fJGFjdGl2ZU5hdkl0ZW0ubGVuZ3RoKSB0aGlzLl8kYWN0aXZlTmF2SXRlbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9ICR0YXJnZXQ7XHJcbiAgICB2YXIgY2F0ZWdvcnkgPSAkdGFyZ2V0LmRhdGEoXCJjYXRlZ29yeVwiKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgIGhpc3RvcnkucHVzaFN0YXRlKHtcclxuICAgICAgICB1cmw6IFwiL3dvcmsuaHRtbFwiLFxyXG4gICAgICAgIHF1ZXJ5OiB7IGNhdGVnb3J5OiBjYXRlZ29yeSB9XHJcbiAgICB9LCBudWxsLCBcIi93b3JrLmh0bWw/Y2F0ZWdvcnk9XCIgKyBjYXRlZ29yeSk7XHJcblxyXG4gICAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fb25Qcm9qZWN0Q2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICB2YXIgcHJvamVjdE5hbWUgPSAkdGFyZ2V0LmRhdGEoXCJuYW1lXCIpO1xyXG4gICAgdmFyIHVybCA9IFwiL3Byb2plY3RzL1wiICsgcHJvamVjdE5hbWUgKyBcIi5odG1sXCI7XHJcbiAgICB0aGlzLl9sb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgdHJ1ZSk7XHJcbn07XHJcblxyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5faW5kZXhUb1hZID0gZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICB2YXIgciA9IE1hdGguZmxvb3IoaW5kZXggLyB0aGlzLl9jb2xzKTtcclxuICAgIHZhciBjID0gaW5kZXggJSB0aGlzLl9jb2xzOyBcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogYyAqIHRoaXMuX2ltYWdlV2lkdGggKyBjICogdGhpcy5fZ3JpZFNwYWNpbmcsXHJcbiAgICAgICAgeTogciAqIHRoaXMuX2ltYWdlSGVpZ2h0ICsgciAqIHRoaXMuX2dyaWRTcGFjaW5nXHJcbiAgICB9O1xyXG59OyIsImV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uICh2YWwsIGRlZmF1bHRWYWwpIHtcclxuICAgIHJldHVybiAodmFsICE9PSB1bmRlZmluZWQpID8gdmFsIDogZGVmYXVsdFZhbDtcclxufTtcclxuXHJcbi8vIFVudGVzdGVkXHJcbi8vIGV4cG9ydHMuZGVmYXVsdFByb3BlcnRpZXMgPSBmdW5jdGlvbiBkZWZhdWx0UHJvcGVydGllcyAob2JqLCBwcm9wcykge1xyXG4vLyAgICAgZm9yICh2YXIgcHJvcCBpbiBwcm9wcykge1xyXG4vLyAgICAgICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwcm9wcywgcHJvcCkpIHtcclxuLy8gICAgICAgICAgICAgdmFyIHZhbHVlID0gZXhwb3J0cy5kZWZhdWx0VmFsdWUocHJvcHMudmFsdWUsIHByb3BzLmRlZmF1bHQpO1xyXG4vLyAgICAgICAgICAgICBvYmpbcHJvcF0gPSB2YWx1ZTtcclxuLy8gICAgICAgICB9XHJcbi8vICAgICB9XHJcbi8vICAgICByZXR1cm4gb2JqO1xyXG4vLyB9O1xyXG4vLyBcclxuZXhwb3J0cy50aW1lSXQgPSBmdW5jdGlvbiAoZnVuYykge1xyXG4gICAgdmFyIHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICBmdW5jKCk7XHJcbiAgICB2YXIgZW5kID0gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICByZXR1cm4gZW5kIC0gc3RhcnQ7XHJcbn07XHJcblxyXG5leHBvcnRzLmlzSW5SZWN0ID0gZnVuY3Rpb24gKHgsIHksIHJlY3QpIHtcclxuICAgIGlmICh4ID49IHJlY3QueCAmJiB4IDw9IChyZWN0LnggKyByZWN0LncpICYmXHJcbiAgICAgICAgeSA+PSByZWN0LnkgJiYgeSA8PSAocmVjdC55ICsgcmVjdC5oKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59O1xyXG5cclxuZXhwb3J0cy5yYW5kSW50ID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XHJcbiAgICByZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKSArIG1pbjtcclxufTtcclxuXHJcbmV4cG9ydHMucmFuZEFycmF5RWxlbWVudCA9IGZ1bmN0aW9uIChhcnJheSkge1xyXG4gICAgdmFyIGkgPSBleHBvcnRzLnJhbmRJbnQoMCwgYXJyYXkubGVuZ3RoIC0gMSk7ICAgIFxyXG4gICAgcmV0dXJuIGFycmF5W2ldO1xyXG59O1xyXG5cclxuZXhwb3J0cy5tYXAgPSBmdW5jdGlvbiAobnVtLCBtaW4xLCBtYXgxLCBtaW4yLCBtYXgyLCBvcHRpb25zKSB7XHJcbiAgICB2YXIgbWFwcGVkID0gKG51bSAtIG1pbjEpIC8gKG1heDEgLSBtaW4xKSAqIChtYXgyIC0gbWluMikgKyBtaW4yO1xyXG4gICAgaWYgKCFvcHRpb25zKSByZXR1cm4gbWFwcGVkO1xyXG4gICAgaWYgKG9wdGlvbnMucm91bmQgJiYgb3B0aW9ucy5yb3VuZCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIG1hcHBlZCA9IE1hdGgucm91bmQobWFwcGVkKTtcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLmZsb29yICYmIG9wdGlvbnMuZmxvb3IgPT09IHRydWUpIHtcclxuICAgICAgICBtYXBwZWQgPSBNYXRoLmZsb29yKG1hcHBlZCk7ICAgICAgICBcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLmNlaWwgJiYgb3B0aW9ucy5jZWlsID09PSB0cnVlKSB7XHJcbiAgICAgICAgbWFwcGVkID0gTWF0aC5jZWlsKG1hcHBlZCk7ICAgICAgICBcclxuICAgIH1cclxuICAgIGlmIChvcHRpb25zLmNsYW1wICYmIG9wdGlvbnMuY2xhbXAgPT09IHRydWUpIHtcclxuICAgICAgICBtYXBwZWQgPSBNYXRoLm1pbihtYXBwZWQsIG1heDIpO1xyXG4gICAgICAgIG1hcHBlZCA9IE1hdGgubWF4KG1hcHBlZCwgbWluMik7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWFwcGVkO1xyXG59O1xyXG5cclxuZXhwb3J0cy5nZXRRdWVyeVBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBDaGVjayBmb3IgcXVlcnkgc3RyaW5nXHJcbiAgICBxcyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XHJcbiAgICBpZiAocXMubGVuZ3RoIDw9IDEpIHJldHVybiB7fTtcclxuICAgIC8vIFF1ZXJ5IHN0cmluZyBleGlzdHMsIHBhcnNlIGl0IGludG8gYSBxdWVyeSBvYmplY3RcclxuICAgIHFzID0gcXMuc3Vic3RyaW5nKDEpOyAvLyBSZW1vdmUgdGhlIFwiP1wiIGRlbGltaXRlclxyXG4gICAgdmFyIGtleVZhbFBhaXJzID0gcXMuc3BsaXQoXCImXCIpO1xyXG4gICAgdmFyIHF1ZXJ5T2JqZWN0ID0ge307XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleVZhbFBhaXJzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIGtleVZhbCA9IGtleVZhbFBhaXJzW2ldLnNwbGl0KFwiPVwiKTtcclxuICAgICAgICBpZiAoa2V5VmFsLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICB2YXIga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleVZhbFswXSk7XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5VmFsWzFdKTtcclxuICAgICAgICAgICAgcXVlcnlPYmplY3Rba2V5XSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcXVlcnlPYmplY3Q7XHJcbn07XHJcblxyXG5leHBvcnRzLmNyZWF0ZVF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24gKHF1ZXJ5T2JqZWN0KSB7XHJcbiAgICBpZiAodHlwZW9mIHF1ZXJ5T2JqZWN0ICE9PSBcIm9iamVjdFwiKSByZXR1cm4gXCJcIjtcclxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocXVlcnlPYmplY3QpO1xyXG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcclxuICAgIHZhciBxdWVyeVN0cmluZyA9IFwiP1wiO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XHJcbiAgICAgICAgdmFyIHZhbCA9IHF1ZXJ5T2JqZWN0W2tleV07XHJcbiAgICAgICAgcXVlcnlTdHJpbmcgKz0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpO1xyXG4gICAgICAgIGlmIChpICE9PSBrZXlzLmxlbmd0aCAtIDEpIHF1ZXJ5U3RyaW5nICs9IFwiJlwiO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0cy53cmFwSW5kZXggPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xyXG4gICAgdmFyIHdyYXBwZWRJbmRleCA9IChpbmRleCAlIGxlbmd0aCk7IFxyXG4gICAgaWYgKHdyYXBwZWRJbmRleCA8IDApIHtcclxuICAgICAgICAvLyBJZiBuZWdhdGl2ZSwgZmxpcCB0aGUgaW5kZXggc28gdGhhdCAtMSBiZWNvbWVzIHRoZSBsYXN0IGl0ZW0gaW4gbGlzdCBcclxuICAgICAgICB3cmFwcGVkSW5kZXggPSBsZW5ndGggKyB3cmFwcGVkSW5kZXg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gd3JhcHBlZEluZGV4O1xyXG59O1xyXG4iXX0=
