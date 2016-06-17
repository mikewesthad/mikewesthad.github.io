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
module.exports = BboxAlignedText;

/**
 * Creates a new BboxAlignedText object - a text object that can be drawn with
 * anchor points based on a tight bounding box around the text.
 * @constructor
 * @param {object} font               p5.Font object
 * @param {string} text               String to display
 * @param {number} [fontSize=12]      Font size to use for string
 * @param {object} [pInstance=window] Reference to p5 instance, leave blank if
 *                                    sketch is global
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
 *     bboxText.draw(width / 2, height / 2, true);
 * }
 */
function BboxAlignedText(font, text, fontSize, pInstance) {
    this._font = font;
    this._text = text;
    this._fontSize = (fontSize !== undefined) ? fontSize : 12;
    this.p = pInstance || window; // If instance is omitted, assume global scope
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
 * @param {string} string Text string to display
 */
BboxAlignedText.prototype.setText = function(string) {
    this._text = string;
    this._calculateMetrics(false);
};

/**
 * Set current text size
 * @public
 * @param {number} fontSize Text size
 */
BboxAlignedText.prototype.setTextSize = function(fontSize) {
    this._fontSize = fontSize;
    this._calculateMetrics(true);
};

/**
 * Set rotation of text
 * @public
 * @param {number} angle Rotation in radians
 */
BboxAlignedText.prototype.setRotation = function(angle) {
    this._rotation = angle;
};

/**
 * Set anchor point for text (horizonal and vertical alignment) relative to
 * bounding box
 * @public
 * @param {string} [hAlign=CENTER] Horizonal alignment
 * @param {string} [vAlign=CENTER] Vertical baseline
 */
BboxAlignedText.prototype.setAnchor = function(hAlign, vAlign) {
    this._hAlign = hAlign || BboxAlignedText.ALIGN.CENTER;
    this._vAlign = vAlign || BboxAlignedText.BASELINE.CENTER;
};

/**
 * Get the bounding box when the text is placed at the specified coordinates.
 * Note: this is the unrotated bounding box! TODO: Fix this.
 * @param  {number} x X coordinate
 * @param  {number} y Y coordinate
 * @return {object}   Returns an object with properties: x, y, w, h
 */
BboxAlignedText.prototype.getBbox = function(x, y) {
    var pos = this._calculateAlignedCoords(x, y);
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
 * @param  {number} x         X coordinate
 * @param  {number} y         Y coordinate
 * @param  {object} [options] An object that can have:
 *                            - sampleFactor: ratio of path-length to number of
 *                              samples (default=0.25). Higher values yield more
 *                              points and are therefore more precise. 
 *                            - simplifyThreshold: if set to a non-zero value,
 *                              collinear points will be removed. The value 
 *                              represents the threshold angle to use when
 *                              determining whether two edges are collinear.
 * @return {array} An array of points, each with x, y & alpha (the path angle)
 */
BboxAlignedText.prototype.getTextPoints = function(x, y, options) {
    var points = this._font.textToPoints(this._text, x, y, this._fontSize, 
                                         options);
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
 * @param  {number}  [x=0]              X coordinate of text anchor
 * @param  {number}  [y=0]              Y coordinate of text anchor
 * @param  {boolean} [drawBounds=false] Flag for drawing bounding box
 */
BboxAlignedText.prototype.draw = function(x, y, drawBounds) {
    drawBounds = drawBounds || false;
    var pos = {
        x: (x !== undefined) ? x : 0, 
        y: (y !== undefined) ? y : 0
    };

    this.p.push();

        if (this._rotation) {
            pos = this._calculateRotatedCoords(pos.x, pos.y, this._rotation);
            this.p.rotate(this._rotation);
        }

        pos = this._calculateAlignedCoords(pos.x, pos.y);

        this.p.textAlign(this.p.LEFT, this.p.BASELINE);
        this.p.textFont(this._font);
        this.p.textSize(this._fontSize);
        this.p.text(this._text, pos.x, pos.y);

        if (drawBounds) {
            this.p.stroke(200);
            var boundsX = pos.x + this._boundsOffset.x;
            var boundsY = pos.y + this._boundsOffset.y;
            this.p.noFill();
            this.p.rect(boundsX, boundsY, this.width, this.height);            
        }

    this.p.pop();
};

/**
 * Project the coordinates (x, y) into a rotated coordinate system
 * @private
 * @param  {number} x     X coordinate (in unrotated space)
 * @param  {number} y     Y coordinate (in unrotated space)
 * @param  {number} angle Radians of rotation to apply
 * @return {object}       Object with x & y properties
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
 * @param  {number} x      X coordinate
 * @param  {number} y      Y coordinate
 * @return {object}        Object with x & y properties
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
},{}],3:[function(require,module,exports){
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
},{"./utilities.js":16}],4:[function(require,module,exports){
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
},{"./utilities.js":16}],5:[function(require,module,exports){
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
},{"../utilities.js":16}],6:[function(require,module,exports){
module.exports = Sketch;

var BboxText = require("p5-bbox-aligned-text");
var BaseLogoSketch = require("./base-logo-sketch.js");
var SinGenerator = require("./generators/sin-generator.js");

var utils = require("../utilities.js");

Sketch.prototype = Object.create(BaseLogoSketch.prototype);

function Sketch($nav, $navLogo) {
    BaseLogoSketch.call(this, $nav, $navLogo, "../fonts/big_john-webfont.ttf");

    this._spacing = utils.map(this._fontSize, 20, 40, 2, 5, {clamp: true, 
        round: true});
}

Sketch.prototype._onResize = function (p) {
    BaseLogoSketch.prototype._onResize.call(this, p);
    this._spacing = utils.map(this._fontSize, 20, 40, 2, 5, {clamp: true, 
        round: true});
    this._bboxText.setText(this._text);
    this._bboxText.setTextSize(this._fontSize);
    this._textOffset.top -= this._bboxText._distBaseToMid;
    this._textOffset.left += this._bboxText.halfWidth;  
    this._drawStationaryLogo(p);
    this._calculatePoints();
    this._isFirstFrame = true;
};

Sketch.prototype._drawStationaryLogo = function (p) {
    p.background(255);
    p.stroke(255);
    p.fill("#0A000A");
    p.strokeWeight(2);
    this._bboxText.setRotation(0);
    this._bboxText.draw(this._textOffset.left, this._textOffset.top);
};

Sketch.prototype._setup = function (p) {
    BaseLogoSketch.prototype._setup.call(this, p);

    // Create a BboxAlignedText instance that will be used for drawing and 
    // rotating text
    this._bboxText = new BboxText(this._font, this._text, this._fontSize, p);
    this._bboxText.setAnchor(BboxText.ALIGN.BOX_CENTER,
        BboxText.BASELINE.BOX_CENTER);

    // Handle the initial setup by triggering a resize
    this._onResize(p);

    // Draw the stationary logo
    this._drawStationaryLogo(p);

    // Start the sin generator at its max value
    this._thresholdGenerator = new SinGenerator(p, 0, 1, 0.02, p.PI/2); 
};

Sketch.prototype._calculatePoints = function () {
    this._points = this._bboxText.getTextPoints(this._textOffset.left, 
        this._textOffset.top);
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
                p.ellipse((point1.x+point2.x)/2, (point1.y+point2.y)/2, dist, dist);  

                p.stroke("rgba(165, 0, 173, 0.25)");
                p.noFill();
                p.line(point1.x, point1.y, point2.x, point2.y);  
            }
        }
    }
};
},{"../utilities.js":16,"./base-logo-sketch.js":5,"./generators/sin-generator.js":8,"p5-bbox-aligned-text":2}],7:[function(require,module,exports){
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
},{"../../utilities.js":16}],8:[function(require,module,exports){
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
},{"../../utilities.js":16}],9:[function(require,module,exports){
module.exports = Sketch;

var BboxText = require("p5-bbox-aligned-text");
var BaseLogoSketch = require("./base-logo-sketch.js");

var utils = require("../utilities.js");

Sketch.prototype = Object.create(BaseLogoSketch.prototype);

function Sketch($nav, $navLogo) {
    BaseLogoSketch.call(this, $nav, $navLogo, "../fonts/big_john-webfont.ttf");

    this._spacing = utils.map(this._fontSize, 20, 40, 2, 5, {clamp: true, 
        round: true});
}

Sketch.prototype._onResize = function (p) {
    BaseLogoSketch.prototype._onResize.call(this, p);
    this._spacing = utils.map(this._fontSize, 20, 40, 2, 5, {clamp: true, 
        round: true});
    this._bboxText.setText(this._text);
    this._bboxText.setTextSize(this._fontSize);
    this._textOffset.top -= this._bboxText._distBaseToMid;
    this._textOffset.left += this._bboxText.halfWidth;  
    this._drawStationaryLogo(p);
    this._calculateCircles(p);
    this._isFirstFrame = true;
};

Sketch.prototype._drawStationaryLogo = function (p) {
    p.background(255);
    p.stroke(255);
    p.fill("#0A000A");
    p.strokeWeight(2);
    this._bboxText.setRotation(0);
    this._bboxText.draw(this._textOffset.left, this._textOffset.top);
};

Sketch.prototype._setup = function (p) {
    BaseLogoSketch.prototype._setup.call(this, p);

    // Create a BboxAlignedText instance that will be used for drawing and 
    // rotating text
    this._bboxText = new BboxText(this._font, this._text, this._fontSize, p);
    this._bboxText.setAnchor(BboxText.ALIGN.BOX_CENTER,
        BboxText.BASELINE.BOX_CENTER);

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
    var bbox = this._bboxText.getBbox(this._textOffset.left, 
        this._textOffset.top);
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
},{"../utilities.js":16,"./base-logo-sketch.js":5,"p5-bbox-aligned-text":2}],10:[function(require,module,exports){
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
    this._bboxText.setText(this._text);
    this._bboxText.setTextSize(this._fontSize);
    this._textOffset.top -= this._bboxText._distBaseToMid;
    this._textOffset.left += this._bboxText.halfWidth;  
    this._drawStationaryLogo(p);
    this._isFirstFrame = true;
};

Sketch.prototype._drawStationaryLogo = function (p) {
    p.background(255);
    p.stroke(255);
    p.fill("#0A000A");
    p.strokeWeight(2);
    this._bboxText.setRotation(0);
    this._bboxText.draw(this._textOffset.left, this._textOffset.top);
};

Sketch.prototype._setup = function (p) {
    BaseLogoSketch.prototype._setup.call(this, p);

    // Create a BboxAlignedText instance that will be used for drawing and 
    // rotating text
    this._bboxText = new BboxText(this._font, this._text, this._fontSize, p);
    this._bboxText.setAnchor(BboxText.ALIGN.BOX_CENTER,
        BboxText.BASELINE.BOX_CENTER);

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
    this._bboxText.setRotation(rotation);
    this._bboxText.draw(this._textOffset.left + xyOffset.x, 
        this._textOffset.top + xyOffset.y);
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
},{}],12:[function(require,module,exports){
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
},{"./hover-slideshow.js":3,"./image-gallery.js":4,"./main-nav.js":11,"./page-loader.js":13,"./pick-random-sketch.js":14,"./portfolio-filter.js":15}],13:[function(require,module,exports){
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
},{"./utilities.js":16}],14:[function(require,module,exports){
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
},{"./interactive-logos/connect-points-sketch.js":6,"./interactive-logos/halftone-flashlight-word.js":9,"./interactive-logos/noisy-word-sketch.js":10,"./utilities.js":16,"js-cookie":1}],15:[function(require,module,exports){
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
},{"./utilities.js":16}],16:[function(require,module,exports){
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

},{}]},{},[12])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvanMtY29va2llL3NyYy9qcy5jb29raWUuanMiLCJub2RlX21vZHVsZXMvcDUtYmJveC1hbGlnbmVkLXRleHQvbGliL2Jib3gtYWxpZ25lZC10ZXh0LmpzIiwic3JjL2pzL2hvdmVyLXNsaWRlc2hvdy5qcyIsInNyYy9qcy9pbWFnZS1nYWxsZXJ5LmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2Jhc2UtbG9nby1za2V0Y2guanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvY29ubmVjdC1wb2ludHMtc2tldGNoLmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2dlbmVyYXRvcnMvbm9pc2UtZ2VuZXJhdG9ycy5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9nZW5lcmF0b3JzL3Npbi1nZW5lcmF0b3IuanMiLCJzcmMvanMvaW50ZXJhY3RpdmUtbG9nb3MvaGFsZnRvbmUtZmxhc2hsaWdodC13b3JkLmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL25vaXN5LXdvcmQtc2tldGNoLmpzIiwic3JjL2pzL21haW4tbmF2LmpzIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvcGFnZS1sb2FkZXIuanMiLCJzcmMvanMvcGljay1yYW5kb20tc2tldGNoLmpzIiwic3JjL2pzL3BvcnRmb2xpby1maWx0ZXIuanMiLCJzcmMvanMvdXRpbGl0aWVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIVxuICogSmF2YVNjcmlwdCBDb29raWUgdjIuMS4yXG4gKiBodHRwczovL2dpdGh1Yi5jb20vanMtY29va2llL2pzLWNvb2tpZVxuICpcbiAqIENvcHlyaWdodCAyMDA2LCAyMDE1IEtsYXVzIEhhcnRsICYgRmFnbmVyIEJyYWNrXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuOyhmdW5jdGlvbiAoZmFjdG9yeSkge1xuXHRpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG5cdFx0ZGVmaW5lKGZhY3RvcnkpO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHR9IGVsc2Uge1xuXHRcdHZhciBPbGRDb29raWVzID0gd2luZG93LkNvb2tpZXM7XG5cdFx0dmFyIGFwaSA9IHdpbmRvdy5Db29raWVzID0gZmFjdG9yeSgpO1xuXHRcdGFwaS5ub0NvbmZsaWN0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0d2luZG93LkNvb2tpZXMgPSBPbGRDb29raWVzO1xuXHRcdFx0cmV0dXJuIGFwaTtcblx0XHR9O1xuXHR9XG59KGZ1bmN0aW9uICgpIHtcblx0ZnVuY3Rpb24gZXh0ZW5kICgpIHtcblx0XHR2YXIgaSA9IDA7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgYXR0cmlidXRlcyA9IGFyZ3VtZW50c1sgaSBdO1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGF0dHJpYnV0ZXMpIHtcblx0XHRcdFx0cmVzdWx0W2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHRmdW5jdGlvbiBpbml0IChjb252ZXJ0ZXIpIHtcblx0XHRmdW5jdGlvbiBhcGkgKGtleSwgdmFsdWUsIGF0dHJpYnV0ZXMpIHtcblx0XHRcdHZhciByZXN1bHQ7XG5cdFx0XHRpZiAodHlwZW9mIGRvY3VtZW50ID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFdyaXRlXG5cblx0XHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRhdHRyaWJ1dGVzID0gZXh0ZW5kKHtcblx0XHRcdFx0XHRwYXRoOiAnLydcblx0XHRcdFx0fSwgYXBpLmRlZmF1bHRzLCBhdHRyaWJ1dGVzKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mIGF0dHJpYnV0ZXMuZXhwaXJlcyA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0XHR2YXIgZXhwaXJlcyA9IG5ldyBEYXRlKCk7XG5cdFx0XHRcdFx0ZXhwaXJlcy5zZXRNaWxsaXNlY29uZHMoZXhwaXJlcy5nZXRNaWxsaXNlY29uZHMoKSArIGF0dHJpYnV0ZXMuZXhwaXJlcyAqIDg2NGUrNSk7XG5cdFx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzID0gZXhwaXJlcztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0cmVzdWx0ID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuXHRcdFx0XHRcdGlmICgvXltcXHtcXFtdLy50ZXN0KHJlc3VsdCkpIHtcblx0XHRcdFx0XHRcdHZhbHVlID0gcmVzdWx0O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZSkge31cblxuXHRcdFx0XHRpZiAoIWNvbnZlcnRlci53cml0ZSkge1xuXHRcdFx0XHRcdHZhbHVlID0gZW5jb2RlVVJJQ29tcG9uZW50KFN0cmluZyh2YWx1ZSkpXG5cdFx0XHRcdFx0XHQucmVwbGFjZSgvJSgyM3wyNHwyNnwyQnwzQXwzQ3wzRXwzRHwyRnwzRnw0MHw1Qnw1RHw1RXw2MHw3Qnw3RHw3QykvZywgZGVjb2RlVVJJQ29tcG9uZW50KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR2YWx1ZSA9IGNvbnZlcnRlci53cml0ZSh2YWx1ZSwga2V5KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGtleSA9IGVuY29kZVVSSUNvbXBvbmVudChTdHJpbmcoa2V5KSk7XG5cdFx0XHRcdGtleSA9IGtleS5yZXBsYWNlKC8lKDIzfDI0fDI2fDJCfDVFfDYwfDdDKS9nLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHRrZXkgPSBrZXkucmVwbGFjZSgvW1xcKFxcKV0vZywgZXNjYXBlKTtcblxuXHRcdFx0XHRyZXR1cm4gKGRvY3VtZW50LmNvb2tpZSA9IFtcblx0XHRcdFx0XHRrZXksICc9JywgdmFsdWUsXG5cdFx0XHRcdFx0YXR0cmlidXRlcy5leHBpcmVzICYmICc7IGV4cGlyZXM9JyArIGF0dHJpYnV0ZXMuZXhwaXJlcy50b1VUQ1N0cmluZygpLCAvLyB1c2UgZXhwaXJlcyBhdHRyaWJ1dGUsIG1heC1hZ2UgaXMgbm90IHN1cHBvcnRlZCBieSBJRVxuXHRcdFx0XHRcdGF0dHJpYnV0ZXMucGF0aCAgICAmJiAnOyBwYXRoPScgKyBhdHRyaWJ1dGVzLnBhdGgsXG5cdFx0XHRcdFx0YXR0cmlidXRlcy5kb21haW4gICYmICc7IGRvbWFpbj0nICsgYXR0cmlidXRlcy5kb21haW4sXG5cdFx0XHRcdFx0YXR0cmlidXRlcy5zZWN1cmUgPyAnOyBzZWN1cmUnIDogJydcblx0XHRcdFx0XS5qb2luKCcnKSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlYWRcblxuXHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0cmVzdWx0ID0ge307XG5cdFx0XHR9XG5cblx0XHRcdC8vIFRvIHByZXZlbnQgdGhlIGZvciBsb29wIGluIHRoZSBmaXJzdCBwbGFjZSBhc3NpZ24gYW4gZW1wdHkgYXJyYXlcblx0XHRcdC8vIGluIGNhc2UgdGhlcmUgYXJlIG5vIGNvb2tpZXMgYXQgYWxsLiBBbHNvIHByZXZlbnRzIG9kZCByZXN1bHQgd2hlblxuXHRcdFx0Ly8gY2FsbGluZyBcImdldCgpXCJcblx0XHRcdHZhciBjb29raWVzID0gZG9jdW1lbnQuY29va2llID8gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7ICcpIDogW107XG5cdFx0XHR2YXIgcmRlY29kZSA9IC8oJVswLTlBLVpdezJ9KSsvZztcblx0XHRcdHZhciBpID0gMDtcblxuXHRcdFx0Zm9yICg7IGkgPCBjb29raWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHZhciBwYXJ0cyA9IGNvb2tpZXNbaV0uc3BsaXQoJz0nKTtcblx0XHRcdFx0dmFyIGNvb2tpZSA9IHBhcnRzLnNsaWNlKDEpLmpvaW4oJz0nKTtcblxuXHRcdFx0XHRpZiAoY29va2llLmNoYXJBdCgwKSA9PT0gJ1wiJykge1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvb2tpZS5zbGljZSgxLCAtMSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdHZhciBuYW1lID0gcGFydHNbMF0ucmVwbGFjZShyZGVjb2RlLCBkZWNvZGVVUklDb21wb25lbnQpO1xuXHRcdFx0XHRcdGNvb2tpZSA9IGNvbnZlcnRlci5yZWFkID9cblx0XHRcdFx0XHRcdGNvbnZlcnRlci5yZWFkKGNvb2tpZSwgbmFtZSkgOiBjb252ZXJ0ZXIoY29va2llLCBuYW1lKSB8fFxuXHRcdFx0XHRcdFx0Y29va2llLnJlcGxhY2UocmRlY29kZSwgZGVjb2RlVVJJQ29tcG9uZW50KTtcblxuXHRcdFx0XHRcdGlmICh0aGlzLmpzb24pIHtcblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGNvb2tpZSA9IEpTT04ucGFyc2UoY29va2llKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGtleSA9PT0gbmFtZSkge1xuXHRcdFx0XHRcdFx0cmVzdWx0ID0gY29va2llO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFrZXkpIHtcblx0XHRcdFx0XHRcdHJlc3VsdFtuYW1lXSA9IGNvb2tpZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKGUpIHt9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0fVxuXG5cdFx0YXBpLnNldCA9IGFwaTtcblx0XHRhcGkuZ2V0ID0gZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0cmV0dXJuIGFwaShrZXkpO1xuXHRcdH07XG5cdFx0YXBpLmdldEpTT04gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gYXBpLmFwcGx5KHtcblx0XHRcdFx0anNvbjogdHJ1ZVxuXHRcdFx0fSwgW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcblx0XHR9O1xuXHRcdGFwaS5kZWZhdWx0cyA9IHt9O1xuXG5cdFx0YXBpLnJlbW92ZSA9IGZ1bmN0aW9uIChrZXksIGF0dHJpYnV0ZXMpIHtcblx0XHRcdGFwaShrZXksICcnLCBleHRlbmQoYXR0cmlidXRlcywge1xuXHRcdFx0XHRleHBpcmVzOiAtMVxuXHRcdFx0fSkpO1xuXHRcdH07XG5cblx0XHRhcGkud2l0aENvbnZlcnRlciA9IGluaXQ7XG5cblx0XHRyZXR1cm4gYXBpO1xuXHR9XG5cblx0cmV0dXJuIGluaXQoZnVuY3Rpb24gKCkge30pO1xufSkpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBCYm94QWxpZ25lZFRleHQ7XHJcblxyXG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBCYm94QWxpZ25lZFRleHQgb2JqZWN0IC0gYSB0ZXh0IG9iamVjdCB0aGF0IGNhbiBiZSBkcmF3biB3aXRoXHJcbiAqIGFuY2hvciBwb2ludHMgYmFzZWQgb24gYSB0aWdodCBib3VuZGluZyBib3ggYXJvdW5kIHRoZSB0ZXh0LlxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtvYmplY3R9IGZvbnQgICAgICAgICAgICAgICBwNS5Gb250IG9iamVjdFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCAgICAgICAgICAgICAgIFN0cmluZyB0byBkaXNwbGF5XHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbZm9udFNpemU9MTJdICAgICAgRm9udCBzaXplIHRvIHVzZSBmb3Igc3RyaW5nXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcEluc3RhbmNlPXdpbmRvd10gUmVmZXJlbmNlIHRvIHA1IGluc3RhbmNlLCBsZWF2ZSBibGFuayBpZlxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNrZXRjaCBpcyBnbG9iYWxcclxuICogQGV4YW1wbGVcclxuICogdmFyIGZvbnQsIGJib3hUZXh0O1xyXG4gKiBmdW5jdGlvbiBwcmVsb2FkKCkge1xyXG4gKiAgICAgZm9udCA9IGxvYWRGb250KFwiLi9hc3NldHMvUmVndWxhci50dGZcIik7XHJcbiAqIH1cclxuICogZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAqICAgICBjcmVhdGVDYW52YXMoNDAwLCA2MDApO1xyXG4gKiAgICAgYmFja2dyb3VuZCgwKTtcclxuICogICAgIFxyXG4gKiAgICAgYmJveFRleHQgPSBuZXcgQmJveEFsaWduZWRUZXh0KGZvbnQsIFwiSGV5IVwiLCAzMCk7ICAgIFxyXG4gKiAgICAgYmJveFRleHQuc2V0Um90YXRpb24oUEkgLyA0KTtcclxuICogICAgIGJib3hUZXh0LnNldEFuY2hvcihCYm94QWxpZ25lZFRleHQuQUxJR04uQk9YX0NFTlRFUiwgXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVIpO1xyXG4gKiAgICAgXHJcbiAqICAgICBmaWxsKFwiIzAwQThFQVwiKTtcclxuICogICAgIG5vU3Ryb2tlKCk7XHJcbiAqICAgICBiYm94VGV4dC5kcmF3KHdpZHRoIC8gMiwgaGVpZ2h0IC8gMiwgdHJ1ZSk7XHJcbiAqIH1cclxuICovXHJcbmZ1bmN0aW9uIEJib3hBbGlnbmVkVGV4dChmb250LCB0ZXh0LCBmb250U2l6ZSwgcEluc3RhbmNlKSB7XHJcbiAgICB0aGlzLl9mb250ID0gZm9udDtcclxuICAgIHRoaXMuX3RleHQgPSB0ZXh0O1xyXG4gICAgdGhpcy5fZm9udFNpemUgPSAoZm9udFNpemUgIT09IHVuZGVmaW5lZCkgPyBmb250U2l6ZSA6IDEyO1xyXG4gICAgdGhpcy5wID0gcEluc3RhbmNlIHx8IHdpbmRvdzsgLy8gSWYgaW5zdGFuY2UgaXMgb21pdHRlZCwgYXNzdW1lIGdsb2JhbCBzY29wZVxyXG4gICAgdGhpcy5fcm90YXRpb24gPSAwO1xyXG4gICAgdGhpcy5faEFsaWduID0gQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9DRU5URVI7XHJcbiAgICB0aGlzLl92QWxpZ24gPSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUjtcclxuICAgIHRoaXMuX2NhbGN1bGF0ZU1ldHJpY3ModHJ1ZSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBWZXJ0aWNhbCBhbGlnbm1lbnQgdmFsdWVzXHJcbiAqIEBwdWJsaWNcclxuICogQHN0YXRpY1xyXG4gKiBAcmVhZG9ubHlcclxuICogQGVudW0ge3N0cmluZ31cclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5BTElHTiA9IHtcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIGxlZnQgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9MRUZUOiBcImJveF9sZWZ0XCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9DRU5URVI6IFwiYm94X2NlbnRlclwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgcmlnaHQgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9SSUdIVDogXCJib3hfcmlnaHRcIlxyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2VsaW5lIGFsaWdubWVudCB2YWx1ZXNcclxuICogQHB1YmxpY1xyXG4gKiBAc3RhdGljXHJcbiAqIEByZWFkb25seVxyXG4gKiBAZW51bSB7c3RyaW5nfVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FID0ge1xyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgdG9wIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfVE9QOiBcImJveF90b3BcIixcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIGNlbnRlciBvZiB0aGUgYmJveCAqL1xyXG4gICAgQk9YX0NFTlRFUjogXCJib3hfY2VudGVyXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBib3R0b20gb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9CT1RUT006IFwiYm94X2JvdHRvbVwiLFxyXG4gICAgLyoqIFxyXG4gICAgICogRHJhdyBmcm9tIGhhbGYgdGhlIGhlaWdodCBvZiB0aGUgZm9udC4gU3BlY2lmaWNhbGx5IHRoZSBoZWlnaHQgaXNcclxuICAgICAqIGNhbGN1bGF0ZWQgYXM6IGFzY2VudCArIGRlc2NlbnQuXHJcbiAgICAgKi9cclxuICAgIEZPTlRfQ0VOVEVSOiBcImZvbnRfY2VudGVyXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSB0aGUgbm9ybWFsIGZvbnQgYmFzZWxpbmUgKi9cclxuICAgIEFMUEhBQkVUSUM6IFwiYWxwaGFiZXRpY1wiXHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGN1cnJlbnQgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgVGV4dCBzdHJpbmcgdG8gZGlzcGxheVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRUZXh0ID0gZnVuY3Rpb24oc3RyaW5nKSB7XHJcbiAgICB0aGlzLl90ZXh0ID0gc3RyaW5nO1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlTWV0cmljcyhmYWxzZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGN1cnJlbnQgdGV4dCBzaXplXHJcbiAqIEBwdWJsaWNcclxuICogQHBhcmFtIHtudW1iZXJ9IGZvbnRTaXplIFRleHQgc2l6ZVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRUZXh0U2l6ZSA9IGZ1bmN0aW9uKGZvbnRTaXplKSB7XHJcbiAgICB0aGlzLl9mb250U2l6ZSA9IGZvbnRTaXplO1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlTWV0cmljcyh0cnVlKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBTZXQgcm90YXRpb24gb2YgdGV4dFxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBhbmdsZSBSb3RhdGlvbiBpbiByYWRpYW5zXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldFJvdGF0aW9uID0gZnVuY3Rpb24oYW5nbGUpIHtcclxuICAgIHRoaXMuX3JvdGF0aW9uID0gYW5nbGU7XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IGFuY2hvciBwb2ludCBmb3IgdGV4dCAoaG9yaXpvbmFsIGFuZCB2ZXJ0aWNhbCBhbGlnbm1lbnQpIHJlbGF0aXZlIHRvXHJcbiAqIGJvdW5kaW5nIGJveFxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBbaEFsaWduPUNFTlRFUl0gSG9yaXpvbmFsIGFsaWdubWVudFxyXG4gKiBAcGFyYW0ge3N0cmluZ30gW3ZBbGlnbj1DRU5URVJdIFZlcnRpY2FsIGJhc2VsaW5lXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLnNldEFuY2hvciA9IGZ1bmN0aW9uKGhBbGlnbiwgdkFsaWduKSB7XHJcbiAgICB0aGlzLl9oQWxpZ24gPSBoQWxpZ24gfHwgQmJveEFsaWduZWRUZXh0LkFMSUdOLkNFTlRFUjtcclxuICAgIHRoaXMuX3ZBbGlnbiA9IHZBbGlnbiB8fCBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQ0VOVEVSO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCB0aGUgYm91bmRpbmcgYm94IHdoZW4gdGhlIHRleHQgaXMgcGxhY2VkIGF0IHRoZSBzcGVjaWZpZWQgY29vcmRpbmF0ZXMuXHJcbiAqIE5vdGU6IHRoaXMgaXMgdGhlIHVucm90YXRlZCBib3VuZGluZyBib3ghIFRPRE86IEZpeCB0aGlzLlxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHggWCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSAge251bWJlcn0geSBZIGNvb3JkaW5hdGVcclxuICogQHJldHVybiB7b2JqZWN0fSAgIFJldHVybnMgYW4gb2JqZWN0IHdpdGggcHJvcGVydGllczogeCwgeSwgdywgaFxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRCYm94ID0gZnVuY3Rpb24oeCwgeSkge1xyXG4gICAgdmFyIHBvcyA9IHRoaXMuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHMoeCwgeSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHBvcy54ICsgdGhpcy5fYm91bmRzT2Zmc2V0LngsXHJcbiAgICAgICAgeTogcG9zLnkgKyB0aGlzLl9ib3VuZHNPZmZzZXQueSxcclxuICAgICAgICB3OiB0aGlzLndpZHRoLFxyXG4gICAgICAgIGg6IHRoaXMuaGVpZ2h0XHJcbiAgICB9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdldCBhbiBhcnJheSBvZiBwb2ludHMgdGhhdCBmb2xsb3cgYWxvbmcgdGhlIHRleHQgcGF0aC4gVGhpcyB3aWxsIHRha2UgaW50b1xyXG4gKiBjb25zaWRlcmF0aW9uIHRoZSBjdXJyZW50IGFsaWdubWVudCBzZXR0aW5ncy5cclxuICogTm90ZTogdGhpcyBpcyBhIHRoaW4gd3JhcHBlciBhcm91bmQgYSBwNSBtZXRob2QgYW5kIGRvZXNuJ3QgaGFuZGxlIHVucm90YXRlZFxyXG4gKiB0ZXh0ISBUT0RPOiBGaXggdGhpcy5cclxuICogQHBhcmFtICB7bnVtYmVyfSB4ICAgICAgICAgWCBjb29yZGluYXRlXHJcbiAqIEBwYXJhbSAge251bWJlcn0geSAgICAgICAgIFkgY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IFtvcHRpb25zXSBBbiBvYmplY3QgdGhhdCBjYW4gaGF2ZTpcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBzYW1wbGVGYWN0b3I6IHJhdGlvIG9mIHBhdGgtbGVuZ3RoIHRvIG51bWJlciBvZlxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNhbXBsZXMgKGRlZmF1bHQ9MC4yNSkuIEhpZ2hlciB2YWx1ZXMgeWllbGQgbW9yZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvaW50cyBhbmQgYXJlIHRoZXJlZm9yZSBtb3JlIHByZWNpc2UuIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtIHNpbXBsaWZ5VGhyZXNob2xkOiBpZiBzZXQgdG8gYSBub24temVybyB2YWx1ZSxcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xsaW5lYXIgcG9pbnRzIHdpbGwgYmUgcmVtb3ZlZC4gVGhlIHZhbHVlIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcHJlc2VudHMgdGhlIHRocmVzaG9sZCBhbmdsZSB0byB1c2Ugd2hlblxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRldGVybWluaW5nIHdoZXRoZXIgdHdvIGVkZ2VzIGFyZSBjb2xsaW5lYXIuXHJcbiAqIEByZXR1cm4ge2FycmF5fSBBbiBhcnJheSBvZiBwb2ludHMsIGVhY2ggd2l0aCB4LCB5ICYgYWxwaGEgKHRoZSBwYXRoIGFuZ2xlKVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5nZXRUZXh0UG9pbnRzID0gZnVuY3Rpb24oeCwgeSwgb3B0aW9ucykge1xyXG4gICAgdmFyIHBvaW50cyA9IHRoaXMuX2ZvbnQudGV4dFRvUG9pbnRzKHRoaXMuX3RleHQsIHgsIHksIHRoaXMuX2ZvbnRTaXplLCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHMocG9pbnRzW2ldLngsIHBvaW50c1tpXS55KTtcclxuICAgICAgICBwb2ludHNbaV0ueCA9IHBvcy54O1xyXG4gICAgICAgIHBvaW50c1tpXS55ID0gcG9zLnk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcG9pbnRzO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIERyYXdzIHRoZSB0ZXh0IHBhcnRpY2xlIHdpdGggdGhlIHNwZWNpZmllZCBzdHlsZSBwYXJhbWV0ZXJzLiBOb3RlOiB0aGlzIGlzXHJcbiAqIGdvaW5nIHRvIHNldCB0aGUgdGV4dEZvbnQsIHRleHRTaXplICYgcm90YXRpb24gYmVmb3JlIGRyYXdpbmcuIFlvdSBzaG91bGQgc2V0XHJcbiAqIHRoZSBjb2xvci9zdHJva2UvZmlsbCB0aGF0IHlvdSB3YW50IGJlZm9yZSBkcmF3aW5nLiBUaGlzIGZ1bmN0aW9uIHdpbGwgY2xlYW5cclxuICogdXAgYWZ0ZXIgaXRzZWxmIGFuZCByZXNldCBzdHlsaW5nIGJhY2sgdG8gd2hhdCBpdCB3YXMgYmVmb3JlIGl0IHdhcyBjYWxsZWQuXHJcbiAqIEBwdWJsaWNcclxuICogQHBhcmFtICB7bnVtYmVyfSAgW3g9MF0gICAgICAgICAgICAgIFggY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvclxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9ICBbeT0wXSAgICAgICAgICAgICAgWSBjb29yZGluYXRlIG9mIHRleHQgYW5jaG9yXHJcbiAqIEBwYXJhbSAge2Jvb2xlYW59IFtkcmF3Qm91bmRzPWZhbHNlXSBGbGFnIGZvciBkcmF3aW5nIGJvdW5kaW5nIGJveFxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oeCwgeSwgZHJhd0JvdW5kcykge1xyXG4gICAgZHJhd0JvdW5kcyA9IGRyYXdCb3VuZHMgfHwgZmFsc2U7XHJcbiAgICB2YXIgcG9zID0ge1xyXG4gICAgICAgIHg6ICh4ICE9PSB1bmRlZmluZWQpID8geCA6IDAsIFxyXG4gICAgICAgIHk6ICh5ICE9PSB1bmRlZmluZWQpID8geSA6IDBcclxuICAgIH07XHJcblxyXG4gICAgdGhpcy5wLnB1c2goKTtcclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX3JvdGF0aW9uKSB7XHJcbiAgICAgICAgICAgIHBvcyA9IHRoaXMuX2NhbGN1bGF0ZVJvdGF0ZWRDb29yZHMocG9zLngsIHBvcy55LCB0aGlzLl9yb3RhdGlvbik7XHJcbiAgICAgICAgICAgIHRoaXMucC5yb3RhdGUodGhpcy5fcm90YXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcG9zID0gdGhpcy5fY2FsY3VsYXRlQWxpZ25lZENvb3Jkcyhwb3MueCwgcG9zLnkpO1xyXG5cclxuICAgICAgICB0aGlzLnAudGV4dEFsaWduKHRoaXMucC5MRUZULCB0aGlzLnAuQkFTRUxJTkUpO1xyXG4gICAgICAgIHRoaXMucC50ZXh0Rm9udCh0aGlzLl9mb250KTtcclxuICAgICAgICB0aGlzLnAudGV4dFNpemUodGhpcy5fZm9udFNpemUpO1xyXG4gICAgICAgIHRoaXMucC50ZXh0KHRoaXMuX3RleHQsIHBvcy54LCBwb3MueSk7XHJcblxyXG4gICAgICAgIGlmIChkcmF3Qm91bmRzKSB7XHJcbiAgICAgICAgICAgIHRoaXMucC5zdHJva2UoMjAwKTtcclxuICAgICAgICAgICAgdmFyIGJvdW5kc1ggPSBwb3MueCArIHRoaXMuX2JvdW5kc09mZnNldC54O1xyXG4gICAgICAgICAgICB2YXIgYm91bmRzWSA9IHBvcy55ICsgdGhpcy5fYm91bmRzT2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIHRoaXMucC5ub0ZpbGwoKTtcclxuICAgICAgICAgICAgdGhpcy5wLnJlY3QoYm91bmRzWCwgYm91bmRzWSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuXHJcbiAgICB0aGlzLnAucG9wKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogUHJvamVjdCB0aGUgY29vcmRpbmF0ZXMgKHgsIHkpIGludG8gYSByb3RhdGVkIGNvb3JkaW5hdGUgc3lzdGVtXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSAge251bWJlcn0geCAgICAgWCBjb29yZGluYXRlIChpbiB1bnJvdGF0ZWQgc3BhY2UpXHJcbiAqIEBwYXJhbSAge251bWJlcn0geSAgICAgWSBjb29yZGluYXRlIChpbiB1bnJvdGF0ZWQgc3BhY2UpXHJcbiAqIEBwYXJhbSAge251bWJlcn0gYW5nbGUgUmFkaWFucyBvZiByb3RhdGlvbiB0byBhcHBseVxyXG4gKiBAcmV0dXJuIHtvYmplY3R9ICAgICAgIE9iamVjdCB3aXRoIHggJiB5IHByb3BlcnRpZXNcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuX2NhbGN1bGF0ZVJvdGF0ZWRDb29yZHMgPSBmdW5jdGlvbiAoeCwgeSwgYW5nbGUpIHsgIFxyXG4gICAgdmFyIHJ4ID0gTWF0aC5jb3MoYW5nbGUpICogeCArIE1hdGguY29zKE1hdGguUEkgLyAyIC0gYW5nbGUpICogeTtcclxuICAgIHZhciByeSA9IC1NYXRoLnNpbihhbmdsZSkgKiB4ICsgTWF0aC5zaW4oTWF0aC5QSSAvIDIgLSBhbmdsZSkgKiB5O1xyXG4gICAgcmV0dXJuIHt4OiByeCwgeTogcnl9O1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgZHJhdyBjb29yZGluYXRlcyBmb3IgdGhlIHRleHQsIGFsaWduaW5nIGJhc2VkIG9uIHRoZSBib3VuZGluZyBib3guXHJcbiAqIFRoZSB0ZXh0IGlzIGV2ZW50dWFsbHkgZHJhd24gd2l0aCBjYW52YXMgYWxpZ25tZW50IHNldCB0byBsZWZ0ICYgYmFzZWxpbmUsIHNvXHJcbiAqIHRoaXMgZnVuY3Rpb24gdGFrZXMgYSBkZXNpcmVkIHBvcyAmIGFsaWdubWVudCBhbmQgcmV0dXJucyB0aGUgYXBwcm9wcmlhdGVcclxuICogY29vcmRpbmF0ZXMgZm9yIHRoZSBsZWZ0ICYgYmFzZWxpbmUuXHJcbiAqIEBwcml2YXRlXHJcbiAqIEBwYXJhbSAge251bWJlcn0geCAgICAgIFggY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHkgICAgICBZIGNvb3JkaW5hdGVcclxuICogQHJldHVybiB7b2JqZWN0fSAgICAgICAgT2JqZWN0IHdpdGggeCAmIHkgcHJvcGVydGllc1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5fY2FsY3VsYXRlQWxpZ25lZENvb3JkcyA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICAgIHZhciBuZXdYLCBuZXdZO1xyXG4gICAgc3dpdGNoICh0aGlzLl9oQWxpZ24pIHtcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfTEVGVDpcclxuICAgICAgICAgICAgbmV3WCA9IHg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9DRU5URVI6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4IC0gdGhpcy5oYWxmV2lkdGg7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9SSUdIVDpcclxuICAgICAgICAgICAgbmV3WCA9IHggLSB0aGlzLndpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBuZXdYID0geDtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbnJlY29nbml6ZWQgaG9yaXpvbmFsIGFsaWduOlwiLCB0aGlzLl9oQWxpZ24pO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHN3aXRjaCAodGhpcy5fdkFsaWduKSB7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX1RPUDpcclxuICAgICAgICAgICAgbmV3WSA9IHkgLSB0aGlzLl9ib3VuZHNPZmZzZXQueTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUjpcclxuICAgICAgICAgICAgbmV3WSA9IHkgKyB0aGlzLl9kaXN0QmFzZVRvTWlkO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5CT1hfQk9UVE9NOlxyXG4gICAgICAgICAgICBuZXdZID0geSAtIHRoaXMuX2Rpc3RCYXNlVG9Cb3R0b207XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkZPTlRfQ0VOVEVSOlxyXG4gICAgICAgICAgICAvLyBIZWlnaHQgaXMgYXBwcm94aW1hdGVkIGFzIGFzY2VudCArIGRlc2NlbnRcclxuICAgICAgICAgICAgbmV3WSA9IHkgLSB0aGlzLl9kZXNjZW50ICsgKHRoaXMuX2FzY2VudCArIHRoaXMuX2Rlc2NlbnQpIC8gMjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQUxQSEFCRVRJQzpcclxuICAgICAgICAgICAgbmV3WSA9IHk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5O1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVucmVjb2duaXplZCB2ZXJ0aWNhbCBhbGlnbjpcIiwgdGhpcy5fdkFsaWduKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4ge3g6IG5ld1gsIHk6IG5ld1l9O1xyXG59O1xyXG5cclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIGJvdW5kaW5nIGJveCBhbmQgdmFyaW91cyBtZXRyaWNzIGZvciB0aGUgY3VycmVudCB0ZXh0IGFuZCBmb250XHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLl9jYWxjdWxhdGVNZXRyaWNzID0gZnVuY3Rpb24oc2hvdWxkVXBkYXRlSGVpZ2h0KSB7ICBcclxuICAgIC8vIHA1IDAuNS4wIGhhcyBhIGJ1ZyAtIHRleHQgYm91bmRzIGFyZSBjbGlwcGVkIGJ5ICgwLCAwKVxyXG4gICAgLy8gQ2FsY3VsYXRpbmcgYm91bmRzIGhhY2tcclxuICAgIHZhciBib3VuZHMgPSB0aGlzLl9mb250LnRleHRCb3VuZHModGhpcy5fdGV4dCwgMTAwMCwgMTAwMCwgdGhpcy5fZm9udFNpemUpO1xyXG4gICAgLy8gQm91bmRzIGlzIGEgcmVmZXJlbmNlIC0gaWYgd2UgbWVzcyB3aXRoIGl0IGRpcmVjdGx5LCB3ZSBjYW4gbWVzcyB1cCBcclxuICAgIC8vIGZ1dHVyZSB2YWx1ZXMhIChJdCBjaGFuZ2VzIHRoZSBiYm94IGNhY2hlIGluIHA1LilcclxuICAgIGJvdW5kcyA9IHsgXHJcbiAgICAgICAgeDogYm91bmRzLnggLSAxMDAwLCBcclxuICAgICAgICB5OiBib3VuZHMueSAtIDEwMDAsIFxyXG4gICAgICAgIHc6IGJvdW5kcy53LCBcclxuICAgICAgICBoOiBib3VuZHMuaCBcclxuICAgIH07IFxyXG5cclxuICAgIGlmIChzaG91bGRVcGRhdGVIZWlnaHQpIHtcclxuICAgICAgICB0aGlzLl9hc2NlbnQgPSB0aGlzLl9mb250Ll90ZXh0QXNjZW50KHRoaXMuX2ZvbnRTaXplKTtcclxuICAgICAgICB0aGlzLl9kZXNjZW50ID0gdGhpcy5fZm9udC5fdGV4dERlc2NlbnQodGhpcy5fZm9udFNpemUpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIFVzZSBib3VuZHMgdG8gY2FsY3VsYXRlIGZvbnQgbWV0cmljc1xyXG4gICAgdGhpcy53aWR0aCA9IGJvdW5kcy53O1xyXG4gICAgdGhpcy5oZWlnaHQgPSBib3VuZHMuaDtcclxuICAgIHRoaXMuaGFsZldpZHRoID0gdGhpcy53aWR0aCAvIDI7XHJcbiAgICB0aGlzLmhhbGZIZWlnaHQgPSB0aGlzLmhlaWdodCAvIDI7XHJcbiAgICB0aGlzLl9ib3VuZHNPZmZzZXQgPSB7IHg6IGJvdW5kcy54LCB5OiBib3VuZHMueSB9O1xyXG4gICAgdGhpcy5fZGlzdEJhc2VUb01pZCA9IE1hdGguYWJzKGJvdW5kcy55KSAtIHRoaXMuaGFsZkhlaWdodDtcclxuICAgIHRoaXMuX2Rpc3RCYXNlVG9Cb3R0b20gPSB0aGlzLmhlaWdodCAtIE1hdGguYWJzKGJvdW5kcy55KTtcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IEhvdmVyU2xpZGVzaG93cztcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBIb3ZlclNsaWRlc2hvd3Moc2xpZGVzaG93RGVsYXksIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgdGhpcy5fc2xpZGVzaG93RGVsYXkgPSAoc2xpZGVzaG93RGVsYXkgIT09IHVuZGVmaW5lZCkgPyBzbGlkZXNob3dEZWxheSA6IFxyXG4gICAgICAgIDIwMDA7XHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSAodHJhbnNpdGlvbkR1cmF0aW9uICE9PSB1bmRlZmluZWQpID8gXHJcbiAgICAgICAgX3RyYW5zaXRpb25EdXJhdGlvbiA6IDEwMDA7ICAgXHJcblxyXG4gICAgdGhpcy5fc2xpZGVzaG93cyA9IFtdO1xyXG4gICAgdGhpcy5yZWxvYWQoKTtcclxufVxyXG5cclxuSG92ZXJTbGlkZXNob3dzLnByb3RvdHlwZS5yZWxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBOb3RlOiB0aGlzIGlzIGN1cnJlbnRseSBub3QgcmVhbGx5IGJlaW5nIHVzZWQuIFdoZW4gYSBwYWdlIGlzIGxvYWRlZCxcclxuICAgIC8vIG1haW4uanMgaXMganVzdCByZS1pbnN0YW5jaW5nIHRoZSBIb3ZlclNsaWRlc2hvd3NcclxuICAgIHZhciBvbGRTbGlkZXNob3dzID0gdGhpcy5fc2xpZGVzaG93cyB8fCBbXTtcclxuICAgIHRoaXMuX3NsaWRlc2hvd3MgPSBbXTtcclxuICAgICQoXCIuaG92ZXItc2xpZGVzaG93XCIpLmVhY2goZnVuY3Rpb24gKF8sIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuX2ZpbmRJblNsaWRlc2hvd3MoZWxlbWVudCwgb2xkU2xpZGVzaG93cyk7XHJcbiAgICAgICAgaWYgKGluZGV4ICE9PSAtMSkge1xyXG4gICAgICAgICAgICB2YXIgc2xpZGVzaG93ID0gb2xkU2xpZGVzaG93cy5zcGxpY2UoaW5kZXgsIDEpWzBdO1xyXG4gICAgICAgICAgICB0aGlzLl9zbGlkZXNob3dzLnB1c2goc2xpZGVzaG93KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9zbGlkZXNob3dzLnB1c2gobmV3IFNsaWRlc2hvdygkZWxlbWVudCwgdGhpcy5fc2xpZGVzaG93RGVsYXksXHJcbiAgICAgICAgICAgICAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24pKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuSG92ZXJTbGlkZXNob3dzLnByb3RvdHlwZS5fZmluZEluU2xpZGVzaG93cyA9IGZ1bmN0aW9uIChlbGVtZW50LCBzbGlkZXNob3dzKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNsaWRlc2hvd3MubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAoZWxlbWVudCA9PT0gc2xpZGVzaG93c1tpXS5nZXRFbGVtZW50KCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIC0xO1xyXG59O1xyXG5cclxuZnVuY3Rpb24gU2xpZGVzaG93KCRjb250YWluZXIsIHNsaWRlc2hvd0RlbGF5LCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRoaXMuXyRjb250YWluZXIgPSAkY29udGFpbmVyO1xyXG4gICAgdGhpcy5fc2xpZGVzaG93RGVsYXkgPSBzbGlkZXNob3dEZWxheTtcclxuICAgIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbjtcclxuICAgIHRoaXMuX3RpbWVvdXRJZCA9IG51bGw7XHJcbiAgICB0aGlzLl9pbWFnZUluZGV4ID0gMDtcclxuICAgIHRoaXMuXyRpbWFnZXMgPSBbXTtcclxuXHJcbiAgICAvLyBTZXQgdXAgYW5kIGNhY2hlIHJlZmVyZW5jZXMgdG8gaW1hZ2VzXHJcbiAgICB0aGlzLl8kY29udGFpbmVyLmZpbmQoXCJpbWdcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgJGltYWdlID0gJChlbGVtZW50KTtcclxuICAgICAgICAkaW1hZ2UuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICAgICAgdG9wOiBcIjBcIixcclxuICAgICAgICAgICAgbGVmdDogXCIwXCIsXHJcbiAgICAgICAgICAgIHpJbmRleDogKGluZGV4ID09PSAwKSA/IDIgOiAwIC8vIEZpcnN0IGltYWdlIHNob3VsZCBiZSBvbiB0b3BcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VzLnB1c2goJGltYWdlKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgdG8gYmluZCBpbnRlcmFjdGl2aXR5XHJcbiAgICB0aGlzLl9udW1JbWFnZXMgPSB0aGlzLl8kaW1hZ2VzLmxlbmd0aDtcclxuICAgIGlmICh0aGlzLl9udW1JbWFnZXMgPD0gMSkgcmV0dXJuO1xyXG5cclxuICAgIC8vIEJpbmQgZXZlbnQgbGlzdGVuZXJzXHJcbiAgICB0aGlzLl8kY29udGFpbmVyLm9uKFwibW91c2VlbnRlclwiLCB0aGlzLl9vbkVudGVyLmJpbmQodGhpcykpO1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5vbihcIm1vdXNlbGVhdmVcIiwgdGhpcy5fb25MZWF2ZS5iaW5kKHRoaXMpKTtcclxuXHJcbn1cclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuZ2V0RWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLl8kY29udGFpbmVyLmdldCgwKTtcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuZ2V0JEVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fJGNvbnRhaW5lcjtcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX29uRW50ZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBGaXJzdCB0cmFuc2l0aW9uIHNob3VsZCBoYXBwZW4gcHJldHR5IHNvb24gYWZ0ZXIgaG92ZXJpbmcgaW4gb3JkZXJcclxuICAgIC8vIHRvIGNsdWUgdGhlIHVzZXIgaW50byB3aGF0IGlzIGhhcHBlbmluZ1xyXG4gICAgdGhpcy5fdGltZW91dElkID0gc2V0VGltZW91dCh0aGlzLl9hZHZhbmNlU2xpZGVzaG93LmJpbmQodGhpcyksIDUwMCk7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLl9vbkxlYXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLl90aW1lb3V0SWQpOyAgXHJcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBudWxsOyAgICAgIFxyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fYWR2YW5jZVNsaWRlc2hvdyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX2ltYWdlSW5kZXggKz0gMTtcclxuICAgIHZhciBpO1xyXG5cclxuICAgIC8vIE1vdmUgdGhlIGltYWdlIGZyb20gMiBzdGVwcyBhZ28gZG93biB0byB0aGUgYm90dG9tIHotaW5kZXggYW5kIG1ha2VcclxuICAgIC8vIGl0IGludmlzaWJsZVxyXG4gICAgaWYgKHRoaXMuX251bUltYWdlcyA+PSAzKSB7XHJcbiAgICAgICAgaSA9IHV0aWxpdGllcy53cmFwSW5kZXgodGhpcy5faW1hZ2VJbmRleCAtIDIsIHRoaXMuX251bUltYWdlcyk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlc1tpXS5jc3Moe1xyXG4gICAgICAgICAgICB6SW5kZXg6IDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VzW2ldLnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBNb3ZlIHRoZSBpbWFnZSBmcm9tIDEgc3RlcHMgYWdvIGRvd24gdG8gdGhlIG1pZGRsZSB6LWluZGV4IGFuZCBtYWtlXHJcbiAgICAvLyBpdCBjb21wbGV0ZWx5IHZpc2libGVcclxuICAgIGlmICh0aGlzLl9udW1JbWFnZXMgPj0gMikge1xyXG4gICAgICAgIGkgPSB1dGlsaXRpZXMud3JhcEluZGV4KHRoaXMuX2ltYWdlSW5kZXggLSAxLCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXNbaV0uY3NzKHtcclxuICAgICAgICAgICAgekluZGV4OiAxLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAxXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlc1tpXS52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTW92ZSB0aGUgY3VycmVudCBpbWFnZSB0byB0aGUgdG9wIHotaW5kZXggYW5kIGZhZGUgaXQgaW5cclxuICAgIHRoaXMuX2ltYWdlSW5kZXggPSB1dGlsaXRpZXMud3JhcEluZGV4KHRoaXMuX2ltYWdlSW5kZXgsIHRoaXMuX251bUltYWdlcyk7XHJcbiAgICB0aGlzLl8kaW1hZ2VzW3RoaXMuX2ltYWdlSW5kZXhdLmNzcyh7XHJcbiAgICAgICAgekluZGV4OiAyLFxyXG4gICAgICAgIG9wYWNpdHk6IDBcclxuICAgIH0pO1xyXG4gICAgdGhpcy5fJGltYWdlc1t0aGlzLl9pbWFnZUluZGV4XS52ZWxvY2l0eSh7XHJcbiAgICAgICAgb3BhY2l0eTogMVxyXG4gICAgfSwgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uLCBcImVhc2VJbk91dFF1YWRcIik7XHJcblxyXG4gICAgLy8gU2NoZWR1bGUgbmV4dCB0cmFuc2l0aW9uXHJcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2FkdmFuY2VTbGlkZXNob3cuYmluZCh0aGlzKSwgXHJcbiAgICAgICAgdGhpcy5fc2xpZGVzaG93RGVsYXkpO1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gSW1hZ2VHYWxsZXJpZXM7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gSW1hZ2VHYWxsZXJpZXModHJhbnNpdGlvbkR1cmF0aW9uKSB7IFxyXG4gICAgdHJhbnNpdGlvbkR1cmF0aW9uID0gKHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSA/XHJcbiAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uIDogNDAwO1xyXG4gICAgdGhpcy5faW1hZ2VHYWxsZXJpZXMgPSBbXTtcclxuICAgICQoXCIuaW1hZ2UtZ2FsbGVyeVwiKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciBnYWxsZXJ5ID0gbmV3IEltYWdlR2FsbGVyeSgkKGVsZW1lbnQpLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xyXG4gICAgICAgIHRoaXMuX2ltYWdlR2FsbGVyaWVzLnB1c2goZ2FsbGVyeSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBJbWFnZUdhbGxlcnkoJGNvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb247XHJcbiAgICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICAgIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIgPSAkY29udGFpbmVyLmZpbmQoXCIuaW1hZ2UtZ2FsbGVyeS10aHVtYm5haWxzXCIpO1xyXG4gICAgdGhpcy5faW5kZXggPSAwOyAvLyBJbmRleCBvZiBzZWxlY3RlZCBpbWFnZVxyXG5cclxuICAgIC8vIExvb3AgdGhyb3VnaCB0aGUgdGh1bWJuYWlscywgZ2l2ZSB0aGVtIGFuIGluZGV4IGRhdGEgYXR0cmlidXRlIGFuZCBjYWNoZVxyXG4gICAgLy8gYSByZWZlcmVuY2UgdG8gdGhlbSBpbiBhbiBhcnJheVxyXG4gICAgdGhpcy5fJHRodW1ibmFpbHMgPSBbXTtcclxuICAgIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIuZmluZChcImltZ1wiKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciAkdGh1bWJuYWlsID0gJChlbGVtZW50KTtcclxuICAgICAgICAkdGh1bWJuYWlsLmRhdGEoXCJpbmRleFwiLCBpbmRleCk7XHJcbiAgICAgICAgdGhpcy5fJHRodW1ibmFpbHMucHVzaCgkdGh1bWJuYWlsKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGVtcHR5IGltYWdlcyBpbiB0aGUgZ2FsbGVyeSBmb3IgZWFjaCB0aHVtYm5haWwuIFRoaXMgaGVscHMgdXMgZG9cclxuICAgIC8vIGxhenkgbG9hZGluZyBvZiBnYWxsZXJ5IGltYWdlcyBhbmQgYWxsb3dzIHVzIHRvIGNyb3NzLWZhZGUgaW1hZ2VzLlxyXG4gICAgdGhpcy5fJGdhbGxlcnlJbWFnZXMgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fJHRodW1ibmFpbHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGlkIGZyb20gdGhlIHBhdGggdG8gdGhlIGxhcmdlIGltYWdlXHJcbiAgICAgICAgdmFyIGxhcmdlUGF0aCA9IHRoaXMuXyR0aHVtYm5haWxzW2ldLmRhdGEoXCJsYXJnZS1wYXRoXCIpO1xyXG4gICAgICAgIHZhciBpZCA9IGxhcmdlUGF0aC5zcGxpdChcIi9cIikucG9wKCkuc3BsaXQoXCIuXCIpWzBdO1xyXG4gICAgICAgIHZhciAkZ2FsbGVyeUltYWdlID0gJChcIjxpbWc+XCIpXHJcbiAgICAgICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICAgICAgICAgIHRvcDogXCIwcHhcIixcclxuICAgICAgICAgICAgICAgIGxlZnQ6IFwiMHB4XCIsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICAgICAgekluZGV4OiAwLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIndoaXRlXCJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmF0dHIoXCJpZFwiLCBpZClcclxuICAgICAgICAgICAgLmRhdGEoXCJpbWFnZS11cmxcIiwgbGFyZ2VQYXRoKVxyXG4gICAgICAgICAgICAuYXBwZW5kVG8oJGNvbnRhaW5lci5maW5kKFwiLmltYWdlLWdhbGxlcnktc2VsZWN0ZWRcIikpO1xyXG4gICAgICAgICRnYWxsZXJ5SW1hZ2UuZ2V0KDApLnNyYyA9IGxhcmdlUGF0aDsgLy8gVE9ETzogTWFrZSB0aGlzIGxhenkhXHJcbiAgICAgICAgdGhpcy5fJGdhbGxlcnlJbWFnZXMucHVzaCgkZ2FsbGVyeUltYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBY3RpdmF0ZSB0aGUgZmlyc3QgdGh1bWJuYWlsIGFuZCBkaXNwbGF5IGl0IGluIHRoZSBnYWxsZXJ5IFxyXG4gICAgdGhpcy5fc3dpdGNoQWN0aXZlSW1hZ2UoMCk7XHJcblxyXG4gICAgLy8gQmluZCB0aGUgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGltYWdlc1xyXG4gICAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci5maW5kKFwiaW1nXCIpLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuSW1hZ2VHYWxsZXJ5LnByb3RvdHlwZS5fc3dpdGNoQWN0aXZlSW1hZ2UgPSBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgIC8vIFJlc2V0IGFsbCBpbWFnZXMgdG8gaW52aXNpYmxlIGFuZCBsb3dlc3Qgei1pbmRleC4gVGhpcyBjb3VsZCBiZSBzbWFydGVyLFxyXG4gICAgLy8gbGlrZSBIb3ZlclNsaWRlc2hvdywgYW5kIG9ubHkgcmVzZXQgZXhhY3RseSB3aGF0IHdlIG5lZWQsIGJ1dCB3ZSBhcmVuJ3QgXHJcbiAgICAvLyB3YXN0aW5nIHRoYXQgbWFueSBjeWNsZXMuXHJcbiAgICB0aGlzLl8kZ2FsbGVyeUltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uICgkZ2FsbGVyeUltYWdlKSB7XHJcbiAgICAgICAgJGdhbGxlcnlJbWFnZS5jc3Moe1xyXG4gICAgICAgICAgICBcInpJbmRleFwiOiAwLFxyXG4gICAgICAgICAgICBcIm9wYWNpdHlcIjogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRnYWxsZXJ5SW1hZ2UudmVsb2NpdHkoXCJzdG9wXCIpOyAvLyBTdG9wIGFueSBhbmltYXRpb25zXHJcbiAgICB9LCB0aGlzKTtcclxuXHJcbiAgICAvLyBDYWNoZSByZWZlcmVuY2VzIHRvIHRoZSBsYXN0IGFuZCBjdXJyZW50IGltYWdlICYgdGh1bWJuYWlsc1xyXG4gICAgdmFyICRsYXN0VGh1bWJuYWlsID0gdGhpcy5fJHRodW1ibmFpbHNbdGhpcy5faW5kZXhdO1xyXG4gICAgdmFyICRsYXN0SW1hZ2UgPSB0aGlzLl8kZ2FsbGVyeUltYWdlc1t0aGlzLl9pbmRleF07XHJcbiAgICB0aGlzLl9pbmRleCA9IGluZGV4O1xyXG4gICAgdmFyICRjdXJyZW50VGh1bWJuYWlsID0gdGhpcy5fJHRodW1ibmFpbHNbdGhpcy5faW5kZXhdO1xyXG4gICAgdmFyICRjdXJyZW50SW1hZ2UgPSB0aGlzLl8kZ2FsbGVyeUltYWdlc1t0aGlzLl9pbmRleF07XHJcblxyXG4gICAgLy8gQWN0aXZhdGUvZGVhY3RpdmF0ZSB0aHVtYm5haWxzXHJcbiAgICAkbGFzdFRodW1ibmFpbC5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICRjdXJyZW50VGh1bWJuYWlsLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG5cclxuICAgIC8vIE1ha2UgdGhlIGxhc3QgaW1hZ2UgdmlzaXNibGUgYW5kIHRoZW4gYW5pbWF0ZSB0aGUgY3VycmVudCBpbWFnZSBpbnRvIHZpZXdcclxuICAgIC8vIG9uIHRvcCBvZiB0aGUgbGFzdFxyXG4gICAgJGxhc3RJbWFnZS5jc3MoXCJ6SW5kZXhcIiwgMSk7XHJcbiAgICAkY3VycmVudEltYWdlLmNzcyhcInpJbmRleFwiLCAyKTtcclxuICAgICRsYXN0SW1hZ2UuY3NzKFwib3BhY2l0eVwiLCAxKTtcclxuICAgICRjdXJyZW50SW1hZ2UudmVsb2NpdHkoe1wib3BhY2l0eVwiOiAxfSwgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uLCBcclxuICAgICAgICBcImVhc2VJbk91dFF1YWRcIik7XHJcblxyXG4gICAgLy8gT2JqZWN0IGltYWdlIGZpdCBwb2x5ZmlsbCBicmVha3MgalF1ZXJ5IGF0dHIoLi4uKSwgc28gZmFsbGJhY2sgdG8ganVzdCBcclxuICAgIC8vIHVzaW5nIGVsZW1lbnQuc3JjXHJcbiAgICAvLyBUT0RPOiBMYXp5IVxyXG4gICAgLy8gaWYgKCRjdXJyZW50SW1hZ2UuZ2V0KDApLnNyYyA9PT0gXCJcIikge1xyXG4gICAgLy8gICAgICRjdXJyZW50SW1hZ2UuZ2V0KDApLnNyYyA9ICRjdXJyZW50SW1hZ2UuZGF0YShcImltYWdlLXVybFwiKTtcclxuICAgIC8vIH1cclxufTtcclxuXHJcbkltYWdlR2FsbGVyeS5wcm90b3R5cGUuX29uQ2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuICAgIHZhciBpbmRleCA9ICR0YXJnZXQuZGF0YShcImluZGV4XCIpO1xyXG4gICAgXHJcbiAgICAvLyBDbGlja2VkIG9uIHRoZSBhY3RpdmUgaW1hZ2UgLSBubyBuZWVkIHRvIGRvIGFueXRoaW5nXHJcbiAgICBpZiAodGhpcy5faW5kZXggPT09IGluZGV4KSByZXR1cm47XHJcblxyXG4gICAgdGhpcy5fc3dpdGNoQWN0aXZlSW1hZ2UoaW5kZXgpOyAgXHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBCYXNlTG9nb1NrZXRjaDtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBCYXNlTG9nb1NrZXRjaCgkbmF2LCAkbmF2TG9nbywgZm9udFBhdGgpIHtcclxuICAgIHRoaXMuXyRuYXYgPSAkbmF2O1xyXG4gICAgdGhpcy5fJG5hdkxvZ28gPSAkbmF2TG9nbztcclxuICAgIHRoaXMuX2ZvbnRQYXRoID0gZm9udFBhdGg7XHJcblxyXG4gICAgdGhpcy5fdGV4dCA9IHRoaXMuXyRuYXZMb2dvLnRleHQoKTtcclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbiAgICB0aGlzLl9pc01vdXNlT3ZlciA9IGZhbHNlO1xyXG4gICAgdGhpcy5faXNPdmVyTmF2TG9nbyA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuX3VwZGF0ZVRleHRPZmZzZXQoKTtcclxuICAgIHRoaXMuX3VwZGF0ZVNpemUoKTtcclxuICAgIHRoaXMuX3VwZGF0ZUZvbnRTaXplKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgKHJlbGF0aXZlIHBvc2l0aW9uZWQpIGNvbnRhaW5lciBmb3IgdGhlIHNrZXRjaCBpbnNpZGUgb2YgdGhlXHJcbiAgICAvLyBuYXYsIGJ1dCBtYWtlIHN1cmUgdGhhdCBpdCBpcyBCRUhJTkQgZXZlcnl0aGluZyBlbHNlLiBFdmVudHVhbGx5LCB3ZSB3aWxsXHJcbiAgICAvLyBkcm9wIGp1c3QgdGhlIG5hdiBsb2dvIChub3QgdGhlIG5hdiBsaW5rcyEpIGJlaGluZCB0aGUgY2FudmFzLlxyXG4gICAgdGhpcy5fJGNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKVxyXG4gICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICB0b3A6IFwiMHB4XCIsXHJcbiAgICAgICAgICAgIGxlZnQ6IFwiMHB4XCJcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5wcmVwZW5kVG8odGhpcy5fJG5hdilcclxuICAgICAgICAuaGlkZSgpO1xyXG5cclxuICAgIHRoaXMuX2NyZWF0ZVA1SW5zdGFuY2UoKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIENyZWF0ZSBhIG5ldyBwNSBpbnN0YW5jZSBhbmQgYmluZCB0aGUgYXBwcm9wcmlhdGUgY2xhc3MgbWV0aG9kcyB0byB0aGVcclxuICogaW5zdGFuY2UuIFRoaXMgYWxzbyBmaWxscyBpbiB0aGUgcCBwYXJhbWV0ZXIgb24gdGhlIGNsYXNzIG1ldGhvZHMgKHNldHVwLFxyXG4gKiBkcmF3LCBldGMuKSBzbyB0aGF0IHRob3NlIGZ1bmN0aW9ucyBjYW4gYmUgYSBsaXR0bGUgbGVzcyB2ZXJib3NlIDopIFxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9jcmVhdGVQNUluc3RhbmNlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgbmV3IHA1KGZ1bmN0aW9uKHApIHtcclxuICAgICAgICB0aGlzLl9wID0gcDtcclxuICAgICAgICBwLnByZWxvYWQgPSB0aGlzLl9wcmVsb2FkLmJpbmQodGhpcywgcCk7XHJcbiAgICAgICAgcC5zZXR1cCA9IHRoaXMuX3NldHVwLmJpbmQodGhpcywgcCk7XHJcbiAgICAgICAgcC5kcmF3ID0gdGhpcy5fZHJhdy5iaW5kKHRoaXMsIHApO1xyXG4gICAgfS5iaW5kKHRoaXMpLCB0aGlzLl8kY29udGFpbmVyLmdldCgwKSk7XHJcbn07XHJcblxyXG4vKipcclxuICogRmluZCB0aGUgZGlzdGFuY2UgZnJvbSB0aGUgdG9wIGxlZnQgb2YgdGhlIG5hdiB0byB0aGUgYnJhbmQgbG9nbydzIGJhc2VsaW5lLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl91cGRhdGVUZXh0T2Zmc2V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGJhc2VsaW5lRGl2ID0gJChcIjxkaXY+XCIpXHJcbiAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgIGRpc3BsYXk6IFwiaW5saW5lLWJsb2NrXCIsXHJcbiAgICAgICAgICAgIHZlcnRpY2FsQWxpZ246IFwiYmFzZWxpbmVcIlxyXG4gICAgICAgIH0pLnByZXBlbmRUbyh0aGlzLl8kbmF2TG9nbyk7XHJcbiAgICB2YXIgbmF2T2Zmc2V0ID0gdGhpcy5fJG5hdi5vZmZzZXQoKTtcclxuICAgIHZhciBsb2dvQmFzZWxpbmVPZmZzZXQgPSBiYXNlbGluZURpdi5vZmZzZXQoKTtcclxuICAgIHRoaXMuX3RleHRPZmZzZXQgPSB7XHJcbiAgICAgICAgdG9wOiBsb2dvQmFzZWxpbmVPZmZzZXQudG9wIC0gbmF2T2Zmc2V0LnRvcCxcclxuICAgICAgICBsZWZ0OiBsb2dvQmFzZWxpbmVPZmZzZXQubGVmdCAtIG5hdk9mZnNldC5sZWZ0XHJcbiAgICB9O1xyXG4gICAgYmFzZWxpbmVEaXYucmVtb3ZlKCk7XHJcbn07XHJcblxyXG4vKipcclxuICogRmluZCB0aGUgYm91bmRpbmcgYm94IG9mIHRoZSBicmFuZCBsb2dvIGluIHRoZSBuYXYuIFRoaXMgYmJveCBjYW4gdGhlbiBiZSBcclxuICogdXNlZCB0byBjb250cm9sIHdoZW4gdGhlIGN1cnNvciBzaG91bGQgYmUgYSBwb2ludGVyLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9jYWxjdWxhdGVOYXZMb2dvQm91bmRzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIG5hdk9mZnNldCA9IHRoaXMuXyRuYXYub2Zmc2V0KCk7XHJcbiAgICB2YXIgbG9nb09mZnNldCA9IHRoaXMuXyRuYXZMb2dvLm9mZnNldCgpO1xyXG4gICAgdGhpcy5fbG9nb0Jib3ggPSB7XHJcbiAgICAgICAgeTogbG9nb09mZnNldC50b3AgLSBuYXZPZmZzZXQudG9wLFxyXG4gICAgICAgIHg6IGxvZ29PZmZzZXQubGVmdCAtIG5hdk9mZnNldC5sZWZ0LFxyXG4gICAgICAgIHc6IHRoaXMuXyRuYXZMb2dvLm91dGVyV2lkdGgoKSwgLy8gRXhjbHVkZSBtYXJnaW4gZnJvbSB0aGUgYmJveFxyXG4gICAgICAgIGg6IHRoaXMuXyRuYXZMb2dvLm91dGVySGVpZ2h0KCkgLy8gTGlua3MgYXJlbid0IGNsaWNrYWJsZSBvbiBtYXJnaW5cclxuICAgIH07XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBkaW1lbnNpb25zIHRvIG1hdGNoIHRoZSBuYXYgLSBleGNsdWRpbmcgYW55IG1hcmdpbiwgcGFkZGluZyAmIFxyXG4gKiBib3JkZXIuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3VwZGF0ZVNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl93aWR0aCA9IHRoaXMuXyRuYXYuaW5uZXJXaWR0aCgpO1xyXG4gICAgdGhpcy5faGVpZ2h0ID0gdGhpcy5fJG5hdi5pbm5lckhlaWdodCgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdyYWIgdGhlIGZvbnQgc2l6ZSBmcm9tIHRoZSBicmFuZCBsb2dvIGxpbmsuIFRoaXMgbWFrZXMgdGhlIGZvbnQgc2l6ZSBvZiB0aGVcclxuICogc2tldGNoIHJlc3BvbnNpdmUuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3VwZGF0ZUZvbnRTaXplID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fZm9udFNpemUgPSB0aGlzLl8kbmF2TG9nby5jc3MoXCJmb250U2l6ZVwiKS5yZXBsYWNlKFwicHhcIiwgXCJcIik7XHJcbn07XHJcblxyXG4vKipcclxuICogV2hlbiB0aGUgYnJvd3NlciBpcyByZXNpemVkLCByZWNhbGN1bGF0ZSBhbGwgdGhlIG5lY2Vzc2FyeSBzdGF0cyBzbyB0aGF0IHRoZVxyXG4gKiBza2V0Y2ggY2FuIGJlIHJlc3BvbnNpdmUuIFRoZSBsb2dvIGluIHRoZSBza2V0Y2ggc2hvdWxkIEFMV0FZUyBleGFjdGx5IG1hdGNoXHJcbiAqIHRoZSBicmFuZyBsb2dvIGxpbmsgdGhlIEhUTUwuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHRoaXMuX3VwZGF0ZVNpemUoKTtcclxuICAgIHRoaXMuX3VwZGF0ZUZvbnRTaXplKCk7XHJcbiAgICB0aGlzLl91cGRhdGVUZXh0T2Zmc2V0KCk7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVOYXZMb2dvQm91bmRzKCk7XHJcbiAgICBwLnJlc2l6ZUNhbnZhcyh0aGlzLl93aWR0aCwgdGhpcy5faGVpZ2h0KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIF9pc01vdXNlT3ZlciBwcm9wZXJ0eS4gXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldE1vdXNlT3ZlciA9IGZ1bmN0aW9uIChpc01vdXNlT3Zlcikge1xyXG4gICAgdGhpcy5faXNNb3VzZU92ZXIgPSBpc01vdXNlT3ZlcjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBJZiB0aGUgY3Vyc29yIGlzIHNldCB0byBhIHBvaW50ZXIsIGZvcndhcmQgYW55IGNsaWNrIGV2ZW50cyB0byB0aGUgbmF2IGxvZ28uXHJcbiAqIFRoaXMgcmVkdWNlcyB0aGUgbmVlZCBmb3IgdGhlIGNhbnZhcyB0byBkbyBhbnkgQUpBWC15IHN0dWZmLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vbkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGlmICh0aGlzLl9pc092ZXJOYXZMb2dvKSB0aGlzLl8kbmF2TG9nby50cmlnZ2VyKGUpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgcHJlbG9hZCBtZXRob2QgdGhhdCBqdXN0IGxvYWRzIHRoZSBuZWNlc3NhcnkgZm9udFxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9wcmVsb2FkID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHRoaXMuX2ZvbnQgPSBwLmxvYWRGb250KHRoaXMuX2ZvbnRQYXRoKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlIHNldHVwIG1ldGhvZCB0aGF0IGRvZXMgc29tZSBoZWF2eSBsaWZ0aW5nLiBJdCBoaWRlcyB0aGUgbmF2IGJyYW5kIGxvZ29cclxuICogYW5kIHJldmVhbHMgdGhlIGNhbnZhcy4gSXQgYWxzbyBzZXRzIHVwIGEgbG90IG9mIHRoZSBpbnRlcm5hbCB2YXJpYWJsZXMgYW5kXHJcbiAqIGNhbnZhcyBldmVudHMuXHJcbiAqL1xyXG5CYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldHVwID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHZhciByZW5kZXJlciA9IHAuY3JlYXRlQ2FudmFzKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQpO1xyXG4gICAgdGhpcy5fJGNhbnZhcyA9ICQocmVuZGVyZXIuY2FudmFzKTtcclxuXHJcbiAgICAvLyBTaG93IHRoZSBjYW52YXMgYW5kIGhpZGUgdGhlIGxvZ28uIFVzaW5nIHNob3cvaGlkZSBvbiB0aGUgbG9nbyB3aWxsIGNhdXNlXHJcbiAgICAvLyBqUXVlcnkgdG8gbXVjayB3aXRoIHRoZSBwb3NpdGlvbmluZywgd2hpY2ggaXMgdXNlZCB0byBjYWxjdWxhdGUgd2hlcmUgdG9cclxuICAgIC8vIGRyYXcgdGhlIGNhbnZhcyB0ZXh0LiBJbnN0ZWFkLCBqdXN0IHB1c2ggdGhlIGxvZ28gYmVoaW5kIHRoZSBjYW52YXMuIFRoaXNcclxuICAgIC8vIGFsbG93cyBtYWtlcyBpdCBzbyB0aGUgY2FudmFzIGlzIHN0aWxsIGJlaGluZCB0aGUgbmF2IGxpbmtzLlxyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5zaG93KCk7XHJcbiAgICB0aGlzLl8kbmF2TG9nby5jc3MoXCJ6SW5kZXhcIiwgLTEpO1xyXG5cclxuICAgIC8vIFRoZXJlIGlzbid0IGEgZ29vZCB3YXkgdG8gY2hlY2sgd2hldGhlciB0aGUgc2tldGNoIGhhcyB0aGUgbW91c2Ugb3ZlclxyXG4gICAgLy8gaXQuIHAubW91c2VYICYgcC5tb3VzZVkgYXJlIGluaXRpYWxpemVkIHRvICgwLCAwKSwgYW5kIHAuZm9jdXNlZCBpc24ndCBcclxuICAgIC8vIGFsd2F5cyByZWxpYWJsZS5cclxuICAgIHRoaXMuXyRjYW52YXMub24oXCJtb3VzZW92ZXJcIiwgdGhpcy5fc2V0TW91c2VPdmVyLmJpbmQodGhpcywgdHJ1ZSkpO1xyXG4gICAgdGhpcy5fJGNhbnZhcy5vbihcIm1vdXNlb3V0XCIsIHRoaXMuX3NldE1vdXNlT3Zlci5iaW5kKHRoaXMsIGZhbHNlKSk7XHJcblxyXG4gICAgLy8gRm9yd2FyZCBtb3VzZSBjbGlja3MgdG8gdGhlIG5hdiBsb2dvXHJcbiAgICB0aGlzLl8kY2FudmFzLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSB3aW5kb3cgaXMgcmVzaXplZCwgdGV4dCAmIGNhbnZhcyBzaXppbmcgYW5kIHBsYWNlbWVudCBuZWVkIHRvIGJlXHJcbiAgICAvLyByZWNhbGN1bGF0ZWQuIFRoZSBzaXRlIGlzIHJlc3BvbnNpdmUsIHNvIHRoZSBpbnRlcmFjdGl2ZSBjYW52YXMgc2hvdWxkIGJlXHJcbiAgICAvLyB0b28hIFxyXG4gICAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcywgcCkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEJhc2UgZHJhdyBtZXRob2QgdGhhdCBjb250cm9scyB3aGV0aGVyIG9yIG5vdCB0aGUgY3Vyc29yIGlzIGEgcG9pbnRlci4gSXRcclxuICogc2hvdWxkIG9ubHkgYmUgYSBwb2ludGVyIHdoZW4gdGhlIG1vdXNlIGlzIG92ZXIgdGhlIG5hdiBicmFuZCBsb2dvLlxyXG4gKi9cclxuQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24gKHApIHtcclxuICAgIGlmICh0aGlzLl9pc01vdXNlT3Zlcikge1xyXG4gICAgICAgIHZhciBpc092ZXJMb2dvID0gdXRpbHMuaXNJblJlY3QocC5tb3VzZVgsIHAubW91c2VZLCB0aGlzLl9sb2dvQmJveCk7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9pc092ZXJOYXZMb2dvICYmIGlzT3ZlckxvZ28pIHtcclxuICAgICAgICAgICAgdGhpcy5faXNPdmVyTmF2TG9nbyA9IHRydWU7XHJcbiAgICAgICAgICAgIHRoaXMuXyRjYW52YXMuY3NzKFwiY3Vyc29yXCIsIFwicG9pbnRlclwiKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2lzT3Zlck5hdkxvZ28gJiYgIWlzT3ZlckxvZ28pIHtcclxuICAgICAgICAgICAgdGhpcy5faXNPdmVyTmF2TG9nbyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB0aGlzLl8kY2FudmFzLmNzcyhcImN1cnNvclwiLCBcImluaXRpYWxcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gU2tldGNoO1xyXG5cclxudmFyIEJib3hUZXh0ID0gcmVxdWlyZShcInA1LWJib3gtYWxpZ25lZC10ZXh0XCIpO1xyXG52YXIgQmFzZUxvZ29Ta2V0Y2ggPSByZXF1aXJlKFwiLi9iYXNlLWxvZ28tc2tldGNoLmpzXCIpO1xyXG52YXIgU2luR2VuZXJhdG9yID0gcmVxdWlyZShcIi4vZ2VuZXJhdG9ycy9zaW4tZ2VuZXJhdG9yLmpzXCIpO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZSk7XHJcblxyXG5mdW5jdGlvbiBTa2V0Y2goJG5hdiwgJG5hdkxvZ28pIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLmNhbGwodGhpcywgJG5hdiwgJG5hdkxvZ28sIFwiLi4vZm9udHMvYmlnX2pvaG4td2ViZm9udC50dGZcIik7XHJcblxyXG4gICAgdGhpcy5fc3BhY2luZyA9IHV0aWxzLm1hcCh0aGlzLl9mb250U2l6ZSwgMjAsIDQwLCAyLCA1LCB7Y2xhbXA6IHRydWUsIFxyXG4gICAgICAgIHJvdW5kOiB0cnVlfSk7XHJcbn1cclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUuY2FsbCh0aGlzLCBwKTtcclxuICAgIHRoaXMuX3NwYWNpbmcgPSB1dGlscy5tYXAodGhpcy5fZm9udFNpemUsIDIwLCA0MCwgMiwgNSwge2NsYW1wOiB0cnVlLCBcclxuICAgICAgICByb3VuZDogdHJ1ZX0pO1xyXG4gICAgdGhpcy5fYmJveFRleHQuc2V0VGV4dCh0aGlzLl90ZXh0KTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LnNldFRleHRTaXplKHRoaXMuX2ZvbnRTaXplKTtcclxuICAgIHRoaXMuX3RleHRPZmZzZXQudG9wIC09IHRoaXMuX2Jib3hUZXh0Ll9kaXN0QmFzZVRvTWlkO1xyXG4gICAgdGhpcy5fdGV4dE9mZnNldC5sZWZ0ICs9IHRoaXMuX2Jib3hUZXh0LmhhbGZXaWR0aDsgIFxyXG4gICAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlUG9pbnRzKCk7XHJcbiAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSB0cnVlO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhd1N0YXRpb25hcnlMb2dvID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgcC5zdHJva2UoMjU1KTtcclxuICAgIHAuZmlsbChcIiMwQTAwMEFcIik7XHJcbiAgICBwLnN0cm9rZVdlaWdodCgyKTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LnNldFJvdGF0aW9uKDApO1xyXG4gICAgdGhpcy5fYmJveFRleHQuZHJhdyh0aGlzLl90ZXh0T2Zmc2V0LmxlZnQsIHRoaXMuX3RleHRPZmZzZXQudG9wKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX3NldHVwID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fc2V0dXAuY2FsbCh0aGlzLCBwKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgYSBCYm94QWxpZ25lZFRleHQgaW5zdGFuY2UgdGhhdCB3aWxsIGJlIHVzZWQgZm9yIGRyYXdpbmcgYW5kIFxyXG4gICAgLy8gcm90YXRpbmcgdGV4dFxyXG4gICAgdGhpcy5fYmJveFRleHQgPSBuZXcgQmJveFRleHQodGhpcy5fZm9udCwgdGhpcy5fdGV4dCwgdGhpcy5fZm9udFNpemUsIHApO1xyXG4gICAgdGhpcy5fYmJveFRleHQuc2V0QW5jaG9yKEJib3hUZXh0LkFMSUdOLkJPWF9DRU5URVIsXHJcbiAgICAgICAgQmJveFRleHQuQkFTRUxJTkUuQk9YX0NFTlRFUik7XHJcblxyXG4gICAgLy8gSGFuZGxlIHRoZSBpbml0aWFsIHNldHVwIGJ5IHRyaWdnZXJpbmcgYSByZXNpemVcclxuICAgIHRoaXMuX29uUmVzaXplKHApO1xyXG5cclxuICAgIC8vIERyYXcgdGhlIHN0YXRpb25hcnkgbG9nb1xyXG4gICAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG5cclxuICAgIC8vIFN0YXJ0IHRoZSBzaW4gZ2VuZXJhdG9yIGF0IGl0cyBtYXggdmFsdWVcclxuICAgIHRoaXMuX3RocmVzaG9sZEdlbmVyYXRvciA9IG5ldyBTaW5HZW5lcmF0b3IocCwgMCwgMSwgMC4wMiwgcC5QSS8yKTsgXHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9jYWxjdWxhdGVQb2ludHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9wb2ludHMgPSB0aGlzLl9iYm94VGV4dC5nZXRUZXh0UG9pbnRzKHRoaXMuX3RleHRPZmZzZXQubGVmdCwgXHJcbiAgICAgICAgdGhpcy5fdGV4dE9mZnNldC50b3ApO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhdyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX2RyYXcuY2FsbCh0aGlzLCBwKTtcclxuICAgIGlmICghdGhpcy5faXNNb3VzZU92ZXIgfHwgIXRoaXMuX2lzT3Zlck5hdkxvZ28pIHJldHVybjtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSB0ZXh0IGlzIGFib3V0IHRvIGJlY29tZSBhY3RpdmUgZm9yIHRoZSBmaXJzdCB0aW1lLCBjbGVhclxyXG4gICAgLy8gdGhlIHN0YXRpb25hcnkgbG9nbyB0aGF0IHdhcyBwcmV2aW91c2x5IGRyYXduLiBcclxuICAgIGlmICh0aGlzLl9pc0ZpcnN0RnJhbWUpIHtcclxuICAgICAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgICAgICB0aGlzLl9pc0ZpcnN0RnJhbWUgPSBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5fZm9udFNpemUgPiAzMCkge1xyXG4gICAgICAgIHRoaXMuX3RocmVzaG9sZEdlbmVyYXRvci5zZXRCb3VuZHMoMC4yICogdGhpcy5fYmJveFRleHQuaGVpZ2h0LCBcclxuICAgICAgICAgICAgMC40NyAqIHRoaXMuX2Jib3hUZXh0LmhlaWdodCk7ICAgICAgICBcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHRoaXMuX3RocmVzaG9sZEdlbmVyYXRvci5zZXRCb3VuZHMoMC4yICogdGhpcy5fYmJveFRleHQuaGVpZ2h0LCBcclxuICAgICAgICAgICAgMC42ICogdGhpcy5fYmJveFRleHQuaGVpZ2h0KTsgICAgICAgICAgXHJcbiAgICB9XHJcbiAgICB2YXIgZGlzdGFuY2VUaHJlc2hvbGQgPSB0aGlzLl90aHJlc2hvbGRHZW5lcmF0b3IuZ2VuZXJhdGUoKTtcclxuICAgIFxyXG4gICAgcC5iYWNrZ3JvdW5kKDI1NSwgMTAwKTtcclxuICAgIHAuc3Ryb2tlV2VpZ2h0KDEpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9wb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIgcG9pbnQxID0gdGhpcy5fcG9pbnRzW2ldO1xyXG4gICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IHRoaXMuX3BvaW50cy5sZW5ndGg7IGogKz0gMSkge1xyXG4gICAgICAgICAgICB2YXIgcG9pbnQyID0gdGhpcy5fcG9pbnRzW2pdO1xyXG4gICAgICAgICAgICB2YXIgZGlzdCA9IHAuZGlzdChwb2ludDEueCwgcG9pbnQxLnksIHBvaW50Mi54LCBwb2ludDIueSk7XHJcbiAgICAgICAgICAgIGlmIChkaXN0IDwgZGlzdGFuY2VUaHJlc2hvbGQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBwLm5vU3Ryb2tlKCk7XHJcbiAgICAgICAgICAgICAgICBwLmZpbGwoXCJyZ2JhKDE2NSwgMCwgMTczLCAwLjI1KVwiKTtcclxuICAgICAgICAgICAgICAgIHAuZWxsaXBzZSgocG9pbnQxLngrcG9pbnQyLngpLzIsIChwb2ludDEueStwb2ludDIueSkvMiwgZGlzdCwgZGlzdCk7ICBcclxuXHJcbiAgICAgICAgICAgICAgICBwLnN0cm9rZShcInJnYmEoMTY1LCAwLCAxNzMsIDAuMjUpXCIpO1xyXG4gICAgICAgICAgICAgICAgcC5ub0ZpbGwoKTtcclxuICAgICAgICAgICAgICAgIHAubGluZShwb2ludDEueCwgcG9pbnQxLnksIHBvaW50Mi54LCBwb2ludDIueSk7ICBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHtcclxuICAgIE5vaXNlR2VuZXJhdG9yMUQ6IE5vaXNlR2VuZXJhdG9yMUQsXHJcbiAgICBOb2lzZUdlbmVyYXRvcjJEOiBOb2lzZUdlbmVyYXRvcjJEXHJcbn07XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuLy8gLS0gMUQgTm9pc2UgR2VuZXJhdG9yIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbi8qKlxyXG4gKiBBIHV0aWxpdHkgY2xhc3MgZm9yIGdlbmVyYXRpbmcgbm9pc2UgdmFsdWVzXHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKiBAcGFyYW0ge29iamVjdH0gcCAgICAgICAgICAgICAgIFJlZmVyZW5jZSB0byBhIHA1IHNrZXRjaFxyXG4gKiBAcGFyYW0ge251bWJlcn0gW21pbj0wXSAgICAgICAgIE1pbmltdW0gdmFsdWUgZm9yIHRoZSBub2lzZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW21heD0xXSAgICAgICAgIE1heGltdW0gdmFsdWUgZm9yIHRoZSBub2lzZVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW2luY3JlbWVudD0wLjFdIFNjYWxlIG9mIHRoZSBub2lzZSwgdXNlZCB3aGVuIHVwZGF0aW5nXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbb2Zmc2V0PXJhbmRvbV0gQSB2YWx1ZSB1c2VkIHRvIGVuc3VyZSBtdWx0aXBsZSBub2lzZVxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRvcnMgYXJlIHJldHVybmluZyBcImluZGVwZW5kZW50XCIgdmFsdWVzXHJcbiAqL1xyXG5mdW5jdGlvbiBOb2lzZUdlbmVyYXRvcjFEKHAsIG1pbiwgbWF4LCBpbmNyZW1lbnQsIG9mZnNldCkge1xyXG4gICAgdGhpcy5fcCA9IHA7XHJcbiAgICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgMCk7XHJcbiAgICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgMSk7XHJcbiAgICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGluY3JlbWVudCwgMC4xKTtcclxuICAgIHRoaXMuX3Bvc2l0aW9uID0gdXRpbHMuZGVmYXVsdChvZmZzZXQsIHAucmFuZG9tKC0xMDAwMDAwLCAxMDAwMDAwKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG1pbiBhbmQgbWF4IG5vaXNlIHZhbHVlc1xyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IG1pbiBNaW5pbXVtIG5vaXNlIHZhbHVlXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWF4IE1heGltdW0gbm9pc2UgdmFsdWVcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uIChtaW4sIG1heCkge1xyXG4gICAgdGhpcy5fbWluID0gdXRpbHMuZGVmYXVsdChtaW4sIHRoaXMuX21pbik7XHJcbiAgICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgdGhpcy5fbWF4KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG5vaXNlIGluY3JlbWVudCAoZS5nLiBzY2FsZSlcclxuICogQHBhcmFtICB7bnVtYmVyfSBpbmNyZW1lbnQgTmV3IGluY3JlbWVudCAoc2NhbGUpIHZhbHVlXHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjFELnByb3RvdHlwZS5zZXRJbmNyZW1lbnQgPSBmdW5jdGlvbiAoaW5jcmVtZW50KSB7XHJcbiAgICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGluY3JlbWVudCwgdGhpcy5faW5jcmVtZW50KTtcclxufTtcclxuXHJcbi8qKiBcclxuICogR2VuZXJhdGUgdGhlIG5leHQgbm9pc2UgdmFsdWVcclxuICogQHJldHVybiB7bnVtYmVyfSBBIG5vaXN5IHZhbHVlIGJldHdlZW4gb2JqZWN0J3MgbWluIGFuZCBtYXhcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICB2YXIgbiA9IHRoaXMuX3Aubm9pc2UodGhpcy5fcG9zaXRpb24pO1xyXG4gICAgbiA9IHRoaXMuX3AubWFwKG4sIDAsIDEsIHRoaXMuX21pbiwgdGhpcy5fbWF4KTtcclxuICAgIHJldHVybiBuO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEludGVybmFsIHVwZGF0ZSBtZXRob2QgZm9yIGdlbmVyYXRpbmcgbmV4dCBub2lzZSB2YWx1ZVxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IxRC5wcm90b3R5cGUuX3VwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX3Bvc2l0aW9uICs9IHRoaXMuX2luY3JlbWVudDtcclxufTtcclxuXHJcblxyXG4vLyAtLSAyRCBOb2lzZSBHZW5lcmF0b3IgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuZnVuY3Rpb24gTm9pc2VHZW5lcmF0b3IyRChwLCB4TWluLCB4TWF4LCB5TWluLCB5TWF4LCB4SW5jcmVtZW50LCB5SW5jcmVtZW50LCBcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB4T2Zmc2V0LCB5T2Zmc2V0KSB7XHJcbiAgICB0aGlzLl94Tm9pc2UgPSBuZXcgTm9pc2VHZW5lcmF0b3IxRChwLCB4TWluLCB4TWF4LCB4SW5jcmVtZW50LCB4T2Zmc2V0KTtcclxuICAgIHRoaXMuX3lOb2lzZSA9IG5ldyBOb2lzZUdlbmVyYXRvcjFEKHAsIHlNaW4sIHlNYXgsIHlJbmNyZW1lbnQsIHlPZmZzZXQpO1xyXG4gICAgdGhpcy5fcCA9IHA7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG1pbiBhbmQgbWF4IG5vaXNlIHZhbHVlc1xyXG4gKiBAcGFyYW0gIHtvYmplY3R9IG9wdGlvbnMgT2JqZWN0IHdpdGggYm91bmRzIHRvIGJlIHVwZGF0ZWQgZS5nLiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHsgeE1pbjogMCwgeE1heDogMSwgeU1pbjogLTEsIHlNYXg6IDEgfVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IyRC5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgIGlmICghb3B0aW9ucykgcmV0dXJuOyAgXHJcbiAgICB0aGlzLl94Tm9pc2Uuc2V0Qm91bmRzKG9wdGlvbnMueE1pbiwgb3B0aW9ucy54TWF4KTtcclxuICAgIHRoaXMuX3lOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy55TWluLCBvcHRpb25zLnlNYXgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgaW5jcmVtZW50IChlLmcuIHNjYWxlKSBmb3IgdGhlIG5vaXNlIGdlbmVyYXRvclxyXG4gKiBAcGFyYW0gIHtvYmplY3R9IG9wdGlvbnMgT2JqZWN0IHdpdGggYm91bmRzIHRvIGJlIHVwZGF0ZWQgZS5nLiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgIHsgeEluY3JlbWVudDogMC4wNSwgeUluY3JlbWVudDogMC4xIH1cclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMkQucHJvdG90eXBlLnNldEJvdW5kcyA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICBpZiAoIW9wdGlvbnMpIHJldHVybjtcclxuICAgIHRoaXMuX3hOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy54SW5jcmVtZW50KTtcclxuICAgIHRoaXMuX3lOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy55SW5jcmVtZW50KTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZW5lcmF0ZSB0aGUgbmV4dCBwYWlyIG9mIG5vaXNlIHZhbHVlc1xyXG4gKiBAcmV0dXJuIHtvYmplY3R9IE9iamVjdCB3aXRoIHggYW5kIHkgcHJvcGVydGllcyB0aGF0IGNvbnRhaW4gdGhlIG5leHQgbm9pc2VcclxuICogICAgICAgICAgICAgICAgICB2YWx1ZXMgYWxvbmcgZWFjaCBkaW1lbnNpb25cclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMkQucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiB0aGlzLl94Tm9pc2UuZ2VuZXJhdGUoKSxcclxuICAgICAgICB5OiB0aGlzLl95Tm9pc2UuZ2VuZXJhdGUoKVxyXG4gICAgfTtcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IFNpbkdlbmVyYXRvcjtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG4vKipcclxuICogQSB1dGlsaXR5IGNsYXNzIGZvciBnZW5lcmF0aW5nIHZhbHVlcyBhbG9uZyBhIHNpbndhdmVcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwICAgICAgICAgICAgICAgUmVmZXJlbmNlIHRvIGEgcDUgc2tldGNoXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWluPTBdICAgICAgICAgTWluaW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWF4PTFdICAgICAgICAgTWF4aW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbaW5jcmVtZW50PTAuMV0gSW5jcmVtZW50IHVzZWQgd2hlbiB1cGRhdGluZ1xyXG4gKiBAcGFyYW0ge251bWJlcn0gW29mZnNldD1yYW5kb21dIFdoZXJlIHRvIHN0YXJ0IGFsb25nIHRoZSBzaW5ld2F2ZVxyXG4gKi9cclxuZnVuY3Rpb24gU2luR2VuZXJhdG9yKHAsIG1pbiwgbWF4LCBhbmdsZUluY3JlbWVudCwgc3RhcnRpbmdBbmdsZSkge1xyXG4gICAgdGhpcy5fcCA9IHA7XHJcbiAgICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgMCk7XHJcbiAgICB0aGlzLl9tYXggPSB1dGlscy5kZWZhdWx0KG1heCwgMCk7XHJcbiAgICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGFuZ2xlSW5jcmVtZW50LCAwLjEpO1xyXG4gICAgdGhpcy5fYW5nbGUgPSB1dGlscy5kZWZhdWx0KHN0YXJ0aW5nQW5nbGUsIHAucmFuZG9tKC0xMDAwMDAwLCAxMDAwMDAwKSk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBVcGRhdGUgdGhlIG1pbiBhbmQgbWF4IHZhbHVlc1xyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IG1pbiBNaW5pbXVtIHZhbHVlXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWF4IE1heGltdW0gdmFsdWVcclxuICovXHJcblNpbkdlbmVyYXRvci5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XHJcbiAgICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgdGhpcy5fbWluKTtcclxuICAgIHRoaXMuX21heCA9IHV0aWxzLmRlZmF1bHQobWF4LCB0aGlzLl9tYXgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgYW5nbGUgaW5jcmVtZW50IChlLmcuIGhvdyBmYXN0IHdlIG1vdmUgdGhyb3VnaCB0aGUgc2lud2F2ZSlcclxuICogQHBhcmFtICB7bnVtYmVyfSBpbmNyZW1lbnQgTmV3IGluY3JlbWVudCB2YWx1ZVxyXG4gKi9cclxuU2luR2VuZXJhdG9yLnByb3RvdHlwZS5zZXRJbmNyZW1lbnQgPSBmdW5jdGlvbiAoaW5jcmVtZW50KSB7XHJcbiAgICB0aGlzLl9pbmNyZW1lbnQgPSB1dGlscy5kZWZhdWx0KGluY3JlbWVudCwgdGhpcy5faW5jcmVtZW50KTtcclxufTtcclxuXHJcbi8qKiBcclxuICogR2VuZXJhdGUgdGhlIG5leHQgdmFsdWVcclxuICogQHJldHVybiB7bnVtYmVyfSBBIHZhbHVlIGJldHdlZW4gZ2VuZXJhdG9ycydzIG1pbiBhbmQgbWF4XHJcbiAqL1xyXG5TaW5HZW5lcmF0b3IucHJvdG90eXBlLmdlbmVyYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fdXBkYXRlKCk7XHJcbiAgICB2YXIgbiA9IHRoaXMuX3Auc2luKHRoaXMuX2FuZ2xlKTtcclxuICAgIG4gPSB0aGlzLl9wLm1hcChuLCAtMSwgMSwgdGhpcy5fbWluLCB0aGlzLl9tYXgpO1xyXG4gICAgcmV0dXJuIG47XHJcbn07XHJcblxyXG4vKipcclxuICogSW50ZXJuYWwgdXBkYXRlIG1ldGhvZCBmb3IgZ2VuZXJhdGluZyBuZXh0IHZhbHVlXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5TaW5HZW5lcmF0b3IucHJvdG90eXBlLl91cGRhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9hbmdsZSArPSB0aGlzLl9pbmNyZW1lbnQ7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBTa2V0Y2g7XHJcblxyXG52YXIgQmJveFRleHQgPSByZXF1aXJlKFwicDUtYmJveC1hbGlnbmVkLXRleHRcIik7XHJcbnZhciBCYXNlTG9nb1NrZXRjaCA9IHJlcXVpcmUoXCIuL2Jhc2UtbG9nby1za2V0Y2guanNcIik7XHJcblxyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuU2tldGNoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlKTtcclxuXHJcbmZ1bmN0aW9uIFNrZXRjaCgkbmF2LCAkbmF2TG9nbykge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2guY2FsbCh0aGlzLCAkbmF2LCAkbmF2TG9nbywgXCIuLi9mb250cy9iaWdfam9obi13ZWJmb250LnR0ZlwiKTtcclxuXHJcbiAgICB0aGlzLl9zcGFjaW5nID0gdXRpbHMubWFwKHRoaXMuX2ZvbnRTaXplLCAyMCwgNDAsIDIsIDUsIHtjbGFtcDogdHJ1ZSwgXHJcbiAgICAgICAgcm91bmQ6IHRydWV9KTtcclxufVxyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZS5jYWxsKHRoaXMsIHApO1xyXG4gICAgdGhpcy5fc3BhY2luZyA9IHV0aWxzLm1hcCh0aGlzLl9mb250U2l6ZSwgMjAsIDQwLCAyLCA1LCB7Y2xhbXA6IHRydWUsIFxyXG4gICAgICAgIHJvdW5kOiB0cnVlfSk7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRUZXh0KHRoaXMuX3RleHQpO1xyXG4gICAgdGhpcy5fYmJveFRleHQuc2V0VGV4dFNpemUodGhpcy5fZm9udFNpemUpO1xyXG4gICAgdGhpcy5fdGV4dE9mZnNldC50b3AgLT0gdGhpcy5fYmJveFRleHQuX2Rpc3RCYXNlVG9NaWQ7XHJcbiAgICB0aGlzLl90ZXh0T2Zmc2V0LmxlZnQgKz0gdGhpcy5fYmJveFRleHQuaGFsZldpZHRoOyAgXHJcbiAgICB0aGlzLl9kcmF3U3RhdGlvbmFyeUxvZ28ocCk7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVDaXJjbGVzKHApO1xyXG4gICAgdGhpcy5faXNGaXJzdEZyYW1lID0gdHJ1ZTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXdTdGF0aW9uYXJ5TG9nbyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgIHAuc3Ryb2tlKDI1NSk7XHJcbiAgICBwLmZpbGwoXCIjMEEwMDBBXCIpO1xyXG4gICAgcC5zdHJva2VXZWlnaHQoMik7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRSb3RhdGlvbigwKTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LmRyYXcodGhpcy5fdGV4dE9mZnNldC5sZWZ0LCB0aGlzLl90ZXh0T2Zmc2V0LnRvcCk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cCA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldHVwLmNhbGwodGhpcywgcCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgQmJveEFsaWduZWRUZXh0IGluc3RhbmNlIHRoYXQgd2lsbCBiZSB1c2VkIGZvciBkcmF3aW5nIGFuZCBcclxuICAgIC8vIHJvdGF0aW5nIHRleHRcclxuICAgIHRoaXMuX2Jib3hUZXh0ID0gbmV3IEJib3hUZXh0KHRoaXMuX2ZvbnQsIHRoaXMuX3RleHQsIHRoaXMuX2ZvbnRTaXplLCBwKTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfQ0VOVEVSLFxyXG4gICAgICAgIEJib3hUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVIpO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgaW5pdGlhbCBzZXR1cCBieSB0cmlnZ2VyaW5nIGEgcmVzaXplXHJcbiAgICB0aGlzLl9vblJlc2l6ZShwKTtcclxuXHJcbiAgICAvLyBEcmF3IHRoZSBzdGF0aW9uYXJ5IGxvZ29cclxuICAgIHRoaXMuX2RyYXdTdGF0aW9uYXJ5TG9nbyhwKTtcclxuXHJcbiAgICB0aGlzLl9jYWxjdWxhdGVDaXJjbGVzKHApO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fY2FsY3VsYXRlQ2lyY2xlcyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICAvLyBUT0RPOiBEb24ndCBuZWVkIEFMTCB0aGUgcGl4ZWxzLiBUaGlzIGNvdWxkIGhhdmUgYW4gb2Zmc2NyZWVuIHJlbmRlcmVyXHJcbiAgICAvLyB0aGF0IGlzIGp1c3QgYmlnIGVub3VnaCB0byBmaXQgdGhlIHRleHQuXHJcbiAgICAvLyBMb29wIG92ZXIgdGhlIHBpeGVscyBpbiB0aGUgdGV4dCdzIGJvdW5kaW5nIGJveCB0byBzYW1wbGUgdGhlIHdvcmRcclxuICAgIHZhciBiYm94ID0gdGhpcy5fYmJveFRleHQuZ2V0QmJveCh0aGlzLl90ZXh0T2Zmc2V0LmxlZnQsIFxyXG4gICAgICAgIHRoaXMuX3RleHRPZmZzZXQudG9wKTtcclxuICAgIHZhciBzdGFydFggPSBNYXRoLmZsb29yKE1hdGgubWF4KGJib3gueCAtIDUsIDApKTtcclxuICAgIHZhciBlbmRYID0gTWF0aC5jZWlsKE1hdGgubWluKGJib3gueCArIGJib3gudyArIDUsIHAud2lkdGgpKTtcclxuICAgIHZhciBzdGFydFkgPSBNYXRoLmZsb29yKE1hdGgubWF4KGJib3gueSAtIDUsIDApKTtcclxuICAgIHZhciBlbmRZID0gTWF0aC5jZWlsKE1hdGgubWluKGJib3gueSArIGJib3guaCArIDUsIHAuaGVpZ2h0KSk7XHJcbiAgICBwLmxvYWRQaXhlbHMoKTtcclxuICAgIHAucGl4ZWxEZW5zaXR5KDEpO1xyXG4gICAgdGhpcy5fY2lyY2xlcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgeSA9IHN0YXJ0WTsgeSA8IGVuZFk7IHkgKz0gdGhpcy5fc3BhY2luZykge1xyXG4gICAgICAgIGZvciAodmFyIHggPSBzdGFydFg7IHggPCBlbmRYOyB4ICs9IHRoaXMuX3NwYWNpbmcpIHsgIFxyXG4gICAgICAgICAgICB2YXIgaSA9IDQgKiAoKHkgKiBwLndpZHRoKSArIHgpO1xyXG4gICAgICAgICAgICB2YXIgciA9IHAucGl4ZWxzW2ldO1xyXG4gICAgICAgICAgICB2YXIgZyA9IHAucGl4ZWxzW2kgKyAxXTtcclxuICAgICAgICAgICAgdmFyIGIgPSBwLnBpeGVsc1tpICsgMl07XHJcbiAgICAgICAgICAgIHZhciBhID0gcC5waXhlbHNbaSArIDNdO1xyXG4gICAgICAgICAgICB2YXIgYyA9IHAuY29sb3IociwgZywgYiwgYSk7XHJcbiAgICAgICAgICAgIGlmIChwLnNhdHVyYXRpb24oYykgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jaXJjbGVzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHg6IHggKyBwLnJhbmRvbSgtMi8zICogdGhpcy5fc3BhY2luZywgMi8zICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICAgICAgICAgICAgeTogeSArIHAucmFuZG9tKC0yLzMgKiB0aGlzLl9zcGFjaW5nLCAyLzMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvcjogcC5jb2xvcihcIiMwNkZGRkZcIilcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY2lyY2xlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB4ICsgcC5yYW5kb20oLTIvMyAqIHRoaXMuX3NwYWNpbmcsIDIvMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIHk6IHkgKyBwLnJhbmRvbSgtMi8zICogdGhpcy5fc3BhY2luZywgMi8zICogdGhpcy5fc3BhY2luZyksXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3I6IHAuY29sb3IoXCIjRkUwMEZFXCIpXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NpcmNsZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgeDogeCArIHAucmFuZG9tKC0yLzMgKiB0aGlzLl9zcGFjaW5nLCAyLzMgKiB0aGlzLl9zcGFjaW5nKSxcclxuICAgICAgICAgICAgICAgICAgICB5OiB5ICsgcC5yYW5kb20oLTIvMyAqIHRoaXMuX3NwYWNpbmcsIDIvMyAqIHRoaXMuX3NwYWNpbmcpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yOiBwLmNvbG9yKFwiI0ZGRkYwNFwiKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fZHJhdy5jYWxsKHRoaXMsIHApO1xyXG4gICAgaWYgKCF0aGlzLl9pc01vdXNlT3ZlciB8fCAhdGhpcy5faXNPdmVyTmF2TG9nbykgcmV0dXJuO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHRleHQgaXMgYWJvdXQgdG8gYmVjb21lIGFjdGl2ZSBmb3IgdGhlIGZpcnN0IHRpbWUsIGNsZWFyXHJcbiAgICAvLyB0aGUgc3RhdGlvbmFyeSBsb2dvIHRoYXQgd2FzIHByZXZpb3VzbHkgZHJhd24uIFxyXG4gICAgaWYgKHRoaXMuX2lzRmlyc3RGcmFtZSkge1xyXG4gICAgICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENsZWFyXHJcbiAgICBwLmJsZW5kTW9kZShwLkJMRU5EKTtcclxuICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG5cclxuICAgIC8vIERyYXcgXCJoYWxmdG9uZVwiIGxvZ29cclxuICAgIHAubm9TdHJva2UoKTsgICBcclxuICAgIHAuYmxlbmRNb2RlKHAuTVVMVElQTFkpO1xyXG5cclxuICAgIHZhciBtYXhEaXN0ID0gdGhpcy5fYmJveFRleHQuaGFsZldpZHRoO1xyXG4gICAgdmFyIG1heFJhZGl1cyA9IDIgKiB0aGlzLl9zcGFjaW5nO1xyXG5cclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fY2lyY2xlcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBjaXJjbGUgPSB0aGlzLl9jaXJjbGVzW2ldO1xyXG4gICAgICAgIHZhciBjID0gY2lyY2xlLmNvbG9yO1xyXG4gICAgICAgIHZhciBkaXN0ID0gcC5kaXN0KGNpcmNsZS54LCBjaXJjbGUueSwgcC5tb3VzZVgsIHAubW91c2VZKTtcclxuICAgICAgICB2YXIgcmFkaXVzID0gdXRpbHMubWFwKGRpc3QsIDAsIG1heERpc3QsIDEsIG1heFJhZGl1cywge2NsYW1wOiB0cnVlfSk7XHJcbiAgICAgICAgcC5maWxsKGMpO1xyXG4gICAgICAgIHAuZWxsaXBzZShjaXJjbGUueCwgY2lyY2xlLnksIHJhZGl1cywgcmFkaXVzKTtcclxuICAgIH1cclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IFNrZXRjaDtcclxuXHJcbnZhciBOb2lzZSA9IHJlcXVpcmUoXCIuL2dlbmVyYXRvcnMvbm9pc2UtZ2VuZXJhdG9ycy5qc1wiKTtcclxudmFyIEJib3hUZXh0ID0gcmVxdWlyZShcInA1LWJib3gtYWxpZ25lZC10ZXh0XCIpO1xyXG52YXIgQmFzZUxvZ29Ta2V0Y2ggPSByZXF1aXJlKFwiLi9iYXNlLWxvZ28tc2tldGNoLmpzXCIpO1xyXG5cclxuU2tldGNoLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlKTtcclxuXHJcbmZ1bmN0aW9uIFNrZXRjaCgkbmF2LCAkbmF2TG9nbykge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2guY2FsbCh0aGlzLCAkbmF2LCAkbmF2TG9nbywgXCIuLi9mb250cy9iaWdfam9obi13ZWJmb250LnR0ZlwiKTtcclxufVxyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fb25SZXNpemUgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgQmFzZUxvZ29Ta2V0Y2gucHJvdG90eXBlLl9vblJlc2l6ZS5jYWxsKHRoaXMsIHApO1xyXG4gICAgdGhpcy5fYmJveFRleHQuc2V0VGV4dCh0aGlzLl90ZXh0KTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LnNldFRleHRTaXplKHRoaXMuX2ZvbnRTaXplKTtcclxuICAgIHRoaXMuX3RleHRPZmZzZXQudG9wIC09IHRoaXMuX2Jib3hUZXh0Ll9kaXN0QmFzZVRvTWlkO1xyXG4gICAgdGhpcy5fdGV4dE9mZnNldC5sZWZ0ICs9IHRoaXMuX2Jib3hUZXh0LmhhbGZXaWR0aDsgIFxyXG4gICAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG4gICAgdGhpcy5faXNGaXJzdEZyYW1lID0gdHJ1ZTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXdTdGF0aW9uYXJ5TG9nbyA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBwLmJhY2tncm91bmQoMjU1KTtcclxuICAgIHAuc3Ryb2tlKDI1NSk7XHJcbiAgICBwLmZpbGwoXCIjMEEwMDBBXCIpO1xyXG4gICAgcC5zdHJva2VXZWlnaHQoMik7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRSb3RhdGlvbigwKTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LmRyYXcodGhpcy5fdGV4dE9mZnNldC5sZWZ0LCB0aGlzLl90ZXh0T2Zmc2V0LnRvcCk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9zZXR1cCA9IGZ1bmN0aW9uIChwKSB7XHJcbiAgICBCYXNlTG9nb1NrZXRjaC5wcm90b3R5cGUuX3NldHVwLmNhbGwodGhpcywgcCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgQmJveEFsaWduZWRUZXh0IGluc3RhbmNlIHRoYXQgd2lsbCBiZSB1c2VkIGZvciBkcmF3aW5nIGFuZCBcclxuICAgIC8vIHJvdGF0aW5nIHRleHRcclxuICAgIHRoaXMuX2Jib3hUZXh0ID0gbmV3IEJib3hUZXh0KHRoaXMuX2ZvbnQsIHRoaXMuX3RleHQsIHRoaXMuX2ZvbnRTaXplLCBwKTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LnNldEFuY2hvcihCYm94VGV4dC5BTElHTi5CT1hfQ0VOVEVSLFxyXG4gICAgICAgIEJib3hUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVIpO1xyXG5cclxuICAgIC8vIEhhbmRsZSB0aGUgaW5pdGlhbCBzZXR1cCBieSB0cmlnZ2VyaW5nIGEgcmVzaXplXHJcbiAgICB0aGlzLl9vblJlc2l6ZShwKTtcclxuXHJcbiAgICAvLyBTZXQgdXAgbm9pc2UgZ2VuZXJhdG9yc1xyXG4gICAgdGhpcy5fcm90YXRpb25Ob2lzZSA9IG5ldyBOb2lzZS5Ob2lzZUdlbmVyYXRvcjFEKHAsIC1wLlBJLzQsIHAuUEkvNCwgMC4wMik7IFxyXG4gICAgdGhpcy5feHlOb2lzZSA9IG5ldyBOb2lzZS5Ob2lzZUdlbmVyYXRvcjJEKHAsIC0xMDAsIDEwMCwgLTUwLCA1MCwgMC4wMSwgXHJcbiAgICAgICAgMC4wMSk7XHJcbn07XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl9kcmF3ID0gZnVuY3Rpb24gKHApIHtcclxuICAgIEJhc2VMb2dvU2tldGNoLnByb3RvdHlwZS5fZHJhdy5jYWxsKHRoaXMsIHApO1xyXG4gICAgaWYgKCF0aGlzLl9pc01vdXNlT3ZlciB8fCAhdGhpcy5faXNPdmVyTmF2TG9nbykgcmV0dXJuO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHRleHQgaXMgYWJvdXQgdG8gYmVjb21lIGFjdGl2ZSBmb3IgdGhlIGZpcnN0IHRpbWUsIGNsZWFyXHJcbiAgICAvLyB0aGUgc3RhdGlvbmFyeSBsb2dvIHRoYXQgd2FzIHByZXZpb3VzbHkgZHJhd24uIFxyXG4gICAgaWYgKHRoaXMuX2lzRmlyc3RGcmFtZSkge1xyXG4gICAgICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBwb3NpdGlvbiBhbmQgcm90YXRpb24gdG8gY3JlYXRlIGEgaml0dGVyeSBsb2dvXHJcbiAgICB2YXIgcm90YXRpb24gPSB0aGlzLl9yb3RhdGlvbk5vaXNlLmdlbmVyYXRlKCk7XHJcbiAgICB2YXIgeHlPZmZzZXQgPSB0aGlzLl94eU5vaXNlLmdlbmVyYXRlKCk7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRSb3RhdGlvbihyb3RhdGlvbik7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5kcmF3KHRoaXMuX3RleHRPZmZzZXQubGVmdCArIHh5T2Zmc2V0LngsIFxyXG4gICAgICAgIHRoaXMuX3RleHRPZmZzZXQudG9wICsgeHlPZmZzZXQueSk7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBNYWluTmF2O1xyXG5cclxuZnVuY3Rpb24gTWFpbk5hdihsb2FkZXIpIHtcclxuICAgIHRoaXMuX2xvYWRlciA9IGxvYWRlcjtcclxuICAgIHRoaXMuXyRsb2dvID0gJChcIm5hdi5uYXZiYXIgLm5hdmJhci1icmFuZFwiKTtcclxuICAgIHRoaXMuXyRuYXYgPSAkKFwiI21haW4tbmF2XCIpO1xyXG4gICAgdGhpcy5fJG5hdkxpbmtzID0gdGhpcy5fJG5hdi5maW5kKFwiYVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXYgPSB0aGlzLl8kbmF2TGlua3MuZmluZChcIi5hY3RpdmVcIik7IFxyXG4gICAgdGhpcy5fJG5hdkxpbmtzLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25OYXZDbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuXyRsb2dvLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25Mb2dvQ2xpY2suYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbk1haW5OYXYucHJvdG90eXBlLnNldEFjdGl2ZUZyb21VcmwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9kZWFjdGl2YXRlKCk7XHJcbiAgICB2YXIgdXJsID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICBpZiAodXJsID09PSBcIi9pbmRleC5odG1sXCIgfHwgdXJsID09PSBcIi9cIikge1xyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlTGluayh0aGlzLl8kbmF2TGlua3MuZmlsdGVyKFwiI2Fib3V0LWxpbmtcIikpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodXJsID09PSBcIi93b3JrLmh0bWxcIikgeyAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVMaW5rKHRoaXMuXyRuYXZMaW5rcy5maWx0ZXIoXCIjd29yay1saW5rXCIpKTtcclxuICAgIH1cclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9kZWFjdGl2YXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuXyRhY3RpdmVOYXYubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdi5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2ID0gJCgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX2FjdGl2YXRlTGluayA9IGZ1bmN0aW9uICgkbGluaykge1xyXG4gICAgJGxpbmsuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2ID0gJGxpbms7XHJcbn07XHJcblxyXG5NYWluTmF2LnByb3RvdHlwZS5fb25Mb2dvQ2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICB2YXIgdXJsID0gJHRhcmdldC5hdHRyKFwiaHJlZlwiKTtcclxuICAgIHRoaXMuX2xvYWRlci5sb2FkUGFnZSh1cmwsIHt9LCB0cnVlKTtcclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9vbk5hdkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRoaXMuXyRuYXYuY29sbGFwc2UoXCJoaWRlXCIpOyAvLyBDbG9zZSB0aGUgbmF2IC0gb25seSBtYXR0ZXJzIG9uIG1vYmlsZVxyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICBpZiAoJHRhcmdldC5pcyh0aGlzLl8kYWN0aXZlTmF2KSkgcmV0dXJuO1xyXG4gICAgdGhpcy5fZGVhY3RpdmF0ZSgpO1xyXG4gICAgdGhpcy5fYWN0aXZhdGVMaW5rKCR0YXJnZXQpO1xyXG4gICAgdmFyIHVybCA9ICR0YXJnZXQuYXR0cihcImhyZWZcIik7XHJcbiAgICB0aGlzLl9sb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgdHJ1ZSk7ICAgIFxyXG59OyIsInZhciBMb2FkZXIgPSByZXF1aXJlKFwiLi9wYWdlLWxvYWRlci5qc1wiKTtcclxudmFyIE1haW5OYXYgPSByZXF1aXJlKFwiLi9tYWluLW5hdi5qc1wiKTtcclxudmFyIEhvdmVyU2xpZGVzaG93cyA9IHJlcXVpcmUoXCIuL2hvdmVyLXNsaWRlc2hvdy5qc1wiKTtcclxudmFyIFBvcnRmb2xpb0ZpbHRlciA9IHJlcXVpcmUoXCIuL3BvcnRmb2xpby1maWx0ZXIuanNcIik7XHJcbnZhciBJbWFnZUdhbGxlcmllcyA9IHJlcXVpcmUoXCIuL2ltYWdlLWdhbGxlcnkuanNcIik7XHJcblxyXG4vLyBQaWNraW5nIGEgcmFuZG9tIHNrZXRjaCB0aGF0IHRoZSB1c2VyIGhhc24ndCBzZWVuIGJlZm9yZVxyXG52YXIgU2tldGNoID0gcmVxdWlyZShcIi4vcGljay1yYW5kb20tc2tldGNoLmpzXCIpKCk7XHJcblxyXG4vLyBBSkFYIHBhZ2UgbG9hZGVyLCB3aXRoIGNhbGxiYWNrIGZvciByZWxvYWRpbmcgd2lkZ2V0c1xyXG52YXIgbG9hZGVyID0gbmV3IExvYWRlcihvblBhZ2VMb2FkKTtcclxuXHJcbi8vIE1haW4gbmF2IHdpZGdldFxyXG52YXIgbWFpbk5hdiA9IG5ldyBNYWluTmF2KGxvYWRlcik7XHJcblxyXG4vLyBJbnRlcmFjdGl2ZSBsb2dvIGluIG5hdmJhclxyXG52YXIgbmF2ID0gJChcIm5hdi5uYXZiYXJcIik7XHJcbnZhciBuYXZMb2dvID0gbmF2LmZpbmQoXCIubmF2YmFyLWJyYW5kXCIpO1xyXG52YXIgc2tldGNoID0gbmV3IFNrZXRjaChuYXYsIG5hdkxvZ28pO1xyXG5cclxuLy8gV2lkZ2V0IGdsb2JhbHNcclxudmFyIGhvdmVyU2xpZGVzaG93cywgcG9ydGZvbGlvRmlsdGVyLCBpbWFnZUdhbGxlcmllcztcclxuXHJcbi8vIExvYWQgYWxsIHdpZGdldHNcclxub25QYWdlTG9hZCgpO1xyXG5cclxuLy8gSGFuZGxlIGJhY2svZm9yd2FyZCBidXR0b25zXHJcbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicG9wc3RhdGVcIiwgb25Qb3BTdGF0ZSk7XHJcblxyXG5mdW5jdGlvbiBvblBvcFN0YXRlKGUpIHtcclxuICAgIC8vIExvYWRlciBzdG9yZXMgY3VzdG9tIGRhdGEgaW4gdGhlIHN0YXRlIC0gaW5jbHVkaW5nIHRoZSB1cmwgYW5kIHRoZSBxdWVyeVxyXG4gICAgdmFyIHVybCA9IChlLnN0YXRlICYmIGUuc3RhdGUudXJsKSB8fCBcIi9pbmRleC5odG1sXCI7XHJcbiAgICB2YXIgcXVlcnlPYmplY3QgPSAoZS5zdGF0ZSAmJiBlLnN0YXRlLnF1ZXJ5KSB8fCB7fTtcclxuXHJcbiAgICBpZiAoKHVybCA9PT0gbG9hZGVyLmdldExvYWRlZFBhdGgoKSkgJiYgKHVybCA9PT0gXCIvd29yay5odG1sXCIpKSB7XHJcbiAgICAgICAgLy8gVGhlIGN1cnJlbnQgJiBwcmV2aW91cyBsb2FkZWQgc3RhdGVzIHdlcmUgd29yay5odG1sLCBzbyBqdXN0IHJlZmlsdGVyXHJcbiAgICAgICAgdmFyIGNhdGVnb3J5ID0gcXVlcnlPYmplY3QuY2F0ZWdvcnkgfHwgXCJhbGxcIjtcclxuICAgICAgICBwb3J0Zm9saW9GaWx0ZXIuc2VsZWN0Q2F0ZWdvcnkoY2F0ZWdvcnkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBMb2FkIHRoZSBuZXcgcGFnZVxyXG4gICAgICAgIGxvYWRlci5sb2FkUGFnZSh1cmwsIHt9LCBmYWxzZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG9uUGFnZUxvYWQoKSB7XHJcbiAgICAvLyBSZWxvYWQgYWxsIHBsdWdpbnMvd2lkZ2V0c1xyXG4gICAgaG92ZXJTbGlkZXNob3dzID0gbmV3IEhvdmVyU2xpZGVzaG93cygpO1xyXG4gICAgcG9ydGZvbGlvRmlsdGVyID0gbmV3IFBvcnRmb2xpb0ZpbHRlcihsb2FkZXIpO1xyXG4gICAgaW1hZ2VHYWxsZXJpZXMgPSBuZXcgSW1hZ2VHYWxsZXJpZXMoKTtcclxuICAgIG9iamVjdEZpdEltYWdlcygpO1xyXG4gICAgc21hcnRxdW90ZXMoKTtcclxuXHJcbiAgICAvLyBTbGlnaHRseSByZWR1bmRhbnQsIGJ1dCB1cGRhdGUgdGhlIG1haW4gbmF2IHVzaW5nIHRoZSBjdXJyZW50IFVSTC4gVGhpc1xyXG4gICAgLy8gaXMgaW1wb3J0YW50IGlmIGEgcGFnZSBpcyBsb2FkZWQgYnkgdHlwaW5nIGEgZnVsbCBVUkwgKGUuZy4gZ29pbmdcclxuICAgIC8vIGRpcmVjdGx5IHRvIC93b3JrLmh0bWwpIG9yIHdoZW4gbW92aW5nIGZyb20gd29yay5odG1sIHRvIGEgcHJvamVjdC4gXHJcbiAgICBtYWluTmF2LnNldEFjdGl2ZUZyb21VcmwoKTtcclxufVxyXG5cclxuLy8gV2UndmUgaGl0IHRoZSBsYW5kaW5nIHBhZ2UsIGxvYWQgdGhlIGFib3V0IHBhZ2VcclxuLy8gaWYgKGxvY2F0aW9uLnBhdGhuYW1lLm1hdGNoKC9eKFxcL3xcXC9pbmRleC5odG1sfGluZGV4Lmh0bWwpJC8pKSB7XHJcbi8vICAgICBsb2FkZXIubG9hZFBhZ2UoXCIvYWJvdXQuaHRtbFwiLCB7fSwgZmFsc2UpO1xyXG4vLyB9IiwibW9kdWxlLmV4cG9ydHMgPSBMb2FkZXI7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gTG9hZGVyKG9uUmVsb2FkLCBmYWRlRHVyYXRpb24pIHtcclxuICAgIHRoaXMuXyRjb250ZW50ID0gJChcIiNjb250ZW50XCIpO1xyXG4gICAgdGhpcy5fb25SZWxvYWQgPSBvblJlbG9hZDtcclxuICAgIHRoaXMuX2ZhZGVEdXJhdGlvbiA9IChmYWRlRHVyYXRpb24gIT09IHVuZGVmaW5lZCkgPyBmYWRlRHVyYXRpb24gOiAyNTA7XHJcbiAgICB0aGlzLl9wYXRoID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbn1cclxuXHJcbkxvYWRlci5wcm90b3R5cGUuZ2V0TG9hZGVkUGF0aCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLl9wYXRoO1xyXG59O1xyXG5cclxuTG9hZGVyLnByb3RvdHlwZS5sb2FkUGFnZSA9IGZ1bmN0aW9uICh1cmwsIHF1ZXJ5T2JqZWN0LCBzaG91bGRQdXNoSGlzdG9yeSkge1xyXG4gICAgLy8gRmFkZSB0aGVuIGVtcHR5IHRoZSBjdXJyZW50IGNvbnRlbnRzXHJcbiAgICB0aGlzLl8kY29udGVudC52ZWxvY2l0eSh7IG9wYWNpdHk6IDAgfSwgdGhpcy5fZmFkZUR1cmF0aW9uLCBcInN3aW5nXCIsXHJcbiAgICAgICAgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuXyRjb250ZW50LmVtcHR5KCk7XHJcbiAgICAgICAgdGhpcy5fJGNvbnRlbnQubG9hZCh1cmwgKyBcIiAjY29udGVudFwiLCBvbkNvbnRlbnRGZXRjaGVkLmJpbmQodGhpcykpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBGYWRlIHRoZSBuZXcgY29udGVudCBpbiBhZnRlciBpdCBoYXMgYmVlbiBmZXRjaGVkXHJcbiAgICBmdW5jdGlvbiBvbkNvbnRlbnRGZXRjaGVkKHJlc3BvbnNlVGV4dCwgdGV4dFN0YXR1cywganFYaHIpIHtcclxuICAgICAgICBpZiAodGV4dFN0YXR1cyA9PT0gXCJlcnJvclwiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBsb2FkaW5nIHRoZSBwYWdlLlwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHF1ZXJ5U3RyaW5nID0gdXRpbGl0aWVzLmNyZWF0ZVF1ZXJ5U3RyaW5nKHF1ZXJ5T2JqZWN0KTtcclxuICAgICAgICBpZiAoc2hvdWxkUHVzaEhpc3RvcnkpIHtcclxuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICBxdWVyeTogcXVlcnlPYmplY3RcclxuICAgICAgICAgICAgfSwgbnVsbCwgdXJsICsgcXVlcnlTdHJpbmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgICAgIHRoaXMuXyRjb250ZW50LnZlbG9jaXR5KHsgb3BhY2l0eTogMSB9LCB0aGlzLl9mYWRlRHVyYXRpb24sIFxyXG4gICAgICAgICAgICBcInN3aW5nXCIpO1xyXG4gICAgICAgIHRoaXMuX29uUmVsb2FkKCk7XHJcbiAgICB9XHJcbn07IiwidmFyIGNvb2tpZXMgPSByZXF1aXJlKFwianMtY29va2llXCIpO1xyXG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG52YXIgc2tldGNoQ29uc3RydWN0b3JzID0ge1xyXG4gICAgXCJoYWxmdG9uZS1mbGFzaGxpZ2h0XCI6IFxyXG4gICAgICAgIHJlcXVpcmUoXCIuL2ludGVyYWN0aXZlLWxvZ29zL2hhbGZ0b25lLWZsYXNobGlnaHQtd29yZC5qc1wiKSxcclxuICAgIFwibm9pc3ktd29yZFwiOlxyXG4gICAgICAgIHJlcXVpcmUoXCIuL2ludGVyYWN0aXZlLWxvZ29zL25vaXN5LXdvcmQtc2tldGNoLmpzXCIpLFxyXG4gICAgXCJjb25uZWN0LXBvaW50c1wiOlxyXG4gICAgICAgIHJlcXVpcmUoXCIuL2ludGVyYWN0aXZlLWxvZ29zL2Nvbm5lY3QtcG9pbnRzLXNrZXRjaC5qc1wiKVxyXG59O1xyXG52YXIgbnVtU2tldGNoZXMgPSBPYmplY3Qua2V5cyhza2V0Y2hDb25zdHJ1Y3RvcnMpLmxlbmd0aDtcclxudmFyIGNvb2tpZUtleSA9IFwic2Vlbi1za2V0Y2gtbmFtZXNcIjtcclxuXHJcbi8qKlxyXG4gKiBQaWNrIGEgcmFuZG9tIHNrZXRjaCB0aGF0IHVzZXIgaGFzbid0IHNlZW4geWV0LiBJZiB0aGUgdXNlciBoYXMgc2VlbiBhbGwgdGhlXHJcbiAqIHNrZXRjaGVzLCBqdXN0IHBpY2sgYSByYW5kb20gb25lLiBUaGlzIHVzZXMgY29va2llcyB0byB0cmFjayB3aGF0IHRoZSB1c2VyIFxyXG4gKiBoYXMgc2VlbiBhbHJlYWR5LlxyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gQ29uc3RydWN0b3IgZm9yIGEgU2tldGNoIGNsYXNzXHJcbiAqL1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBpY2tSYW5kb21Ta2V0Y2goKSB7XHJcbiAgICB2YXIgc2VlblNrZXRjaE5hbWVzID0gY29va2llcy5nZXRKU09OKGNvb2tpZUtleSkgfHwgW107XHJcblxyXG4gICAgLy8gRmluZCB0aGUgbmFtZXMgb2YgdGhlIHVuc2VlbiBza2V0Y2hlc1xyXG4gICAgdmFyIHVuc2VlblNrZXRjaE5hbWVzID0gZmluZFVuc2VlblNrZXRjaGVzKHNlZW5Ta2V0Y2hOYW1lcyk7XHJcblxyXG4gICAgLy8gQWxsIHNrZXRjaGVzIGhhdmUgYmVlbiBzZWVuXHJcbiAgICBpZiAodW5zZWVuU2tldGNoTmFtZXMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgLy8gSWYgd2UndmUgZ290IG1vcmUgdGhlbiBvbmUgc2tldGNoLCB0aGVuIG1ha2Ugc3VyZSB0byBjaG9vc2UgYSByYW5kb21cclxuICAgICAgICAvLyBza2V0Y2ggZXhjbHVkaW5nIHRoZSBtb3N0IHJlY2VudGx5IHNlZW4gc2tldGNoXHJcbiAgICAgICAgaWYgKG51bVNrZXRjaGVzID4gMSkge1xyXG4gICAgICAgICAgICBzZWVuU2tldGNoTmFtZXMgPSBbc2VlblNrZXRjaE5hbWVzLnBvcCgpXTtcclxuICAgICAgICAgICAgdW5zZWVuU2tldGNoTmFtZXMgPSBmaW5kVW5zZWVuU2tldGNoZXMoc2VlblNrZXRjaE5hbWVzKTtcclxuICAgICAgICB9IFxyXG4gICAgICAgIC8vIElmIHdlJ3ZlIG9ubHkgZ290IG9uZSBza2V0Y2gsIHRoZW4gd2UgY2FuJ3QgZG8gbXVjaC4uLlxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWVuU2tldGNoTmFtZXMgPSBbXTtcclxuICAgICAgICAgICAgdW5zZWVuU2tldGNoTmFtZXMgPSBPYmplY3Qua2V5cyhza2V0Y2hDb25zdHJ1Y3RvcnMpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB2YXIgcmFuZFNrZXRjaE5hbWUgPSB1dGlscy5yYW5kQXJyYXlFbGVtZW50KHVuc2VlblNrZXRjaE5hbWVzKTtcclxuICAgIHNlZW5Ta2V0Y2hOYW1lcy5wdXNoKHJhbmRTa2V0Y2hOYW1lKTtcclxuXHJcbiAgICAvLyBTdG9yZSB0aGUgZ2VuZXJhdGVkIHNrZXRjaCBpbiBhIGNvb2tpZS4gVGhpcyBjcmVhdGVzIGEgbW92aW5nIDcgZGF5XHJcbiAgICAvLyB3aW5kb3cgLSBhbnl0aW1lIHRoZSBzaXRlIGlzIHZpc2l0ZWQsIHRoZSBjb29raWUgaXMgcmVmcmVzaGVkLlxyXG4gICAgY29va2llcy5zZXQoY29va2llS2V5LCBzZWVuU2tldGNoTmFtZXMsIHsgZXhwaXJlczogNyB9KTtcclxuXHJcbiAgICByZXR1cm4gc2tldGNoQ29uc3RydWN0b3JzW3JhbmRTa2V0Y2hOYW1lXTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIGZpbmRVbnNlZW5Ta2V0Y2hlcyhzZWVuU2tldGNoTmFtZXMpIHtcclxuICAgIHZhciB1bnNlZW5Ta2V0Y2hOYW1lcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgc2tldGNoTmFtZSBpbiBza2V0Y2hDb25zdHJ1Y3RvcnMpIHtcclxuICAgICAgICBpZiAoc2VlblNrZXRjaE5hbWVzLmluZGV4T2Yoc2tldGNoTmFtZSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHVuc2VlblNrZXRjaE5hbWVzLnB1c2goc2tldGNoTmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVuc2VlblNrZXRjaE5hbWVzO1xyXG59IiwibW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9GaWx0ZXI7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxudmFyIGRlZmF1bHRCcmVha3BvaW50cyA9IFtcclxuICAgIHsgd2lkdGg6IDEyMDAsIGNvbHM6IDMsIHNwYWNpbmc6IDE1IH0sXHJcbiAgICB7IHdpZHRoOiA5OTIsIGNvbHM6IDMsIHNwYWNpbmc6IDE1IH0sXHJcbiAgICB7IHdpZHRoOiA3MDAsIGNvbHM6IDMsIHNwYWNpbmc6IDE1IH0sXHJcbiAgICB7IHdpZHRoOiA2MDAsIGNvbHM6IDIsIHNwYWNpbmc6IDEwIH0sXHJcbiAgICB7IHdpZHRoOiA0ODAsIGNvbHM6IDIsIHNwYWNpbmc6IDEwIH0sXHJcbiAgICB7IHdpZHRoOiAzMjAsIGNvbHM6IDEsIHNwYWNpbmc6IDEwIH1cclxuXTtcclxuXHJcbmZ1bmN0aW9uIFBvcnRmb2xpb0ZpbHRlcihsb2FkZXIsIGJyZWFrcG9pbnRzLCBhc3BlY3RSYXRpbywgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl9sb2FkZXIgPSBsb2FkZXI7XHJcbiAgICB0aGlzLl9ncmlkU3BhY2luZyA9IDA7XHJcbiAgICB0aGlzLl9hc3BlY3RSYXRpbyA9IChhc3BlY3RSYXRpbyAhPT0gdW5kZWZpbmVkKSA/IGFzcGVjdFJhdGlvIDogKDE2LzkpO1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gKHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSA/IFxyXG4gICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbiA6IDgwMDtcclxuICAgIHRoaXMuX2JyZWFrcG9pbnRzID0gKGJyZWFrcG9pbnRzICE9PSB1bmRlZmluZWQpID8gXHJcbiAgICAgICAgYnJlYWtwb2ludHMuc2xpY2UoKSA6IGRlZmF1bHRCcmVha3BvaW50cy5zbGljZSgpO1xyXG4gICAgdGhpcy5fJGdyaWQgPSAkKFwiI3BvcnRmb2xpby1ncmlkXCIpO1xyXG4gICAgdGhpcy5fJG5hdiA9ICQoXCIjcG9ydGZvbGlvLW5hdlwiKTtcclxuICAgIHRoaXMuXyRwcm9qZWN0cyA9IFtdO1xyXG4gICAgdGhpcy5fJGNhdGVnb3JpZXMgPSB7fTtcclxuICAgIHRoaXMuX3Jvd3MgPSAwO1xyXG4gICAgdGhpcy5fY29scyA9IDA7XHJcbiAgICB0aGlzLl9pbWFnZUhlaWdodCA9IDA7XHJcbiAgICB0aGlzLl9pbWFnZVdpZHRoID0gMDtcclxuXHJcbiAgICAvLyBTb3J0IHRoZSBicmVha3BvaW50cyBpbiBkZXNjZW5kaW5nIG9yZGVyXHJcbiAgICB0aGlzLl9icmVha3BvaW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICBpZiAoYS53aWR0aCA8IGIud2lkdGgpIHJldHVybiAtMTtcclxuICAgICAgICBlbHNlIGlmIChhLndpZHRoID4gYi53aWR0aCkgcmV0dXJuIDE7XHJcbiAgICAgICAgZWxzZSByZXR1cm4gMDtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX2NhY2hlUHJvamVjdHMoKTtcclxuICAgIHRoaXMuX2NyZWF0ZUdyaWQoKTtcclxuXHJcbiAgICB0aGlzLl8kZ3JpZC5maW5kKFwiLnByb2plY3QgYVwiKS5vbihcImNsaWNrXCIsIHRoaXMuX29uUHJvamVjdENsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHZhciBxcyA9IHV0aWxpdGllcy5nZXRRdWVyeVBhcmFtZXRlcnMoKTtcclxuICAgIHZhciBpbml0aWFsQ2F0ZWdvcnkgPSBxcy5jYXRlZ29yeSB8fCBcImFsbFwiO1xyXG4gICAgdmFyIGNhdGVnb3J5ID0gaW5pdGlhbENhdGVnb3J5LnRvTG93ZXJDYXNlKCk7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9IHRoaXMuXyRuYXYuZmluZChcImFbZGF0YS1jYXRlZ29yeT1cIiArIGNhdGVnb3J5ICsgXCJdXCIpO1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl9maWx0ZXJQcm9qZWN0cyhjYXRlZ29yeSk7XHJcbiAgICAkKFwiI3BvcnRmb2xpby1uYXYgYVwiKS5vbihcImNsaWNrXCIsIHRoaXMuX29uTmF2Q2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX2NyZWF0ZUdyaWQuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuc2VsZWN0Q2F0ZWdvcnkgPSBmdW5jdGlvbiAoY2F0ZWdvcnkpIHtcclxuICAgIGNhdGVnb3J5ID0gKGNhdGVnb3J5ICYmIGNhdGVnb3J5LnRvTG93ZXJDYXNlKCkpIHx8IFwiYWxsXCI7XHJcbiAgICB2YXIgJHNlbGVjdGVkTmF2ID0gdGhpcy5fJG5hdi5maW5kKFwiYVtkYXRhLWNhdGVnb3J5PVwiICsgY2F0ZWdvcnkgKyBcIl1cIik7XHJcbiAgICBpZiAoJHNlbGVjdGVkTmF2Lmxlbmd0aCAmJiAhJHNlbGVjdGVkTmF2LmlzKHRoaXMuXyRhY3RpdmVOYXZJdGVtKSkge1xyXG4gICAgICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gJHNlbGVjdGVkTmF2O1xyXG4gICAgICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgIHRoaXMuX2ZpbHRlclByb2plY3RzKGNhdGVnb3J5KTtcclxuICAgIH1cclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2ZpbHRlclByb2plY3RzID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XHJcbiAgICB2YXIgJHNlbGVjdGVkRWxlbWVudHMgPSB0aGlzLl9nZXRQcm9qZWN0c0luQ2F0ZWdvcnkoY2F0ZWdvcnkpO1xyXG5cclxuICAgIC8vIEFuaW1hdGUgdGhlIGdyaWQgdG8gdGhlIGNvcnJlY3QgaGVpZ2h0IHRvIGNvbnRhaW4gdGhlIHJvd3NcclxuICAgIHRoaXMuX2FuaW1hdGVHcmlkSGVpZ2h0KCRzZWxlY3RlZEVsZW1lbnRzLmxlbmd0aCk7XHJcbiAgICBcclxuICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgcHJvamVjdHNcclxuICAgIHRoaXMuXyRwcm9qZWN0cy5mb3JFYWNoKGZ1bmN0aW9uICgkZWxlbWVudCkge1xyXG4gICAgICAgIC8vIFN0b3AgYWxsIGFuaW1hdGlvbnNcclxuICAgICAgICAkZWxlbWVudC52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgICAgICAgLy8gSWYgYW4gZWxlbWVudCBpcyBub3Qgc2VsZWN0ZWQ6IGRyb3Agei1pbmRleCAmIGFuaW1hdGUgb3BhY2l0eSAtPiBoaWRlXHJcbiAgICAgICAgdmFyIHNlbGVjdGVkSW5kZXggPSAkc2VsZWN0ZWRFbGVtZW50cy5pbmRleE9mKCRlbGVtZW50KTsgXHJcbiAgICAgICAgaWYgKHNlbGVjdGVkSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICRlbGVtZW50LmNzcyhcInpJbmRleFwiLCAtMSk7XHJcbiAgICAgICAgICAgICRlbGVtZW50LnZlbG9jaXR5KHtcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDBcclxuICAgICAgICAgICAgfSwgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uLCBcImVhc2VJbk91dEN1YmljXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICRlbGVtZW50LmhpZGUoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIElmIGFuIGVsZW1lbnQgaXMgc2VsZWN0ZWQ6IHNob3cgJiBidW1wIHotaW5kZXggJiBhbmltYXRlIHRvIHBvc2l0aW9uIFxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAkZWxlbWVudC5zaG93KCk7XHJcbiAgICAgICAgICAgICRlbGVtZW50LmNzcyhcInpJbmRleFwiLCAwKTtcclxuICAgICAgICAgICAgdmFyIG5ld1BvcyA9IHRoaXMuX2luZGV4VG9YWShzZWxlY3RlZEluZGV4KTtcclxuICAgICAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoeyBcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDEsXHJcbiAgICAgICAgICAgICAgICB0b3A6IG5ld1Bvcy55ICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogbmV3UG9zLnggKyBcInB4XCJcclxuICAgICAgICAgICAgfSwgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uLCBcImVhc2VJbk91dEN1YmljXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9hbmltYXRlR3JpZEhlaWdodCA9IGZ1bmN0aW9uIChudW1FbGVtZW50cykge1xyXG4gICAgdGhpcy5fJGdyaWQudmVsb2NpdHkoXCJzdG9wXCIpO1xyXG4gICAgdmFyIGN1clJvd3MgPSBNYXRoLmNlaWwobnVtRWxlbWVudHMgLyB0aGlzLl9jb2xzKTtcclxuICAgIHRoaXMuXyRncmlkLnZlbG9jaXR5KHtcclxuICAgICAgICBoZWlnaHQ6IHRoaXMuX2ltYWdlSGVpZ2h0ICogY3VyUm93cyArIFxyXG4gICAgICAgICAgICB0aGlzLl9ncmlkU3BhY2luZyAqIChjdXJSb3dzIC0gMSkgKyBcInB4XCJcclxuICAgIH0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbik7XHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9nZXRQcm9qZWN0c0luQ2F0ZWdvcnkgPSBmdW5jdGlvbiAoY2F0ZWdvcnkpIHtcclxuICAgIGlmIChjYXRlZ29yeSA9PT0gXCJhbGxcIikge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl8kcHJvamVjdHM7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAodGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldIHx8IFtdKTtcclxuICAgIH0gICAgICAgIFxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fY2FjaGVQcm9qZWN0cyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuXyRwcm9qZWN0cyA9IFtdO1xyXG4gICAgdGhpcy5fJGNhdGVnb3JpZXMgPSB7fTtcclxuICAgIHRoaXMuXyRncmlkLmZpbmQoXCIucHJvamVjdFwiKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgdGhpcy5fJHByb2plY3RzLnB1c2goJGVsZW1lbnQpO1xyXG4gICAgICAgIHZhciBjYXRlZ29yeU5hbWVzID0gJGVsZW1lbnQuZGF0YShcImNhdGVnb3JpZXNcIikuc3BsaXQoXCIsXCIpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2F0ZWdvcnlOYW1lcy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgICAgICB2YXIgY2F0ZWdvcnkgPSAkLnRyaW0oY2F0ZWdvcnlOYW1lc1tpXSkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLl8kY2F0ZWdvcmllc1tjYXRlZ29yeV0pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XSA9IFskZWxlbWVudF07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl8kY2F0ZWdvcmllc1tjYXRlZ29yeV0ucHVzaCgkZWxlbWVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuLy8gUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fY2FsY3VsYXRlR3JpZCA9IGZ1bmN0aW9uICgpIHtcclxuLy8gICAgIHZhciBncmlkV2lkdGggPSB0aGlzLl8kZ3JpZC5pbm5lcldpZHRoKCk7XHJcbi8vICAgICB0aGlzLl9jb2xzID0gTWF0aC5mbG9vcigoZ3JpZFdpZHRoICsgdGhpcy5fZ3JpZFNwYWNpbmcpIC8gXHJcbi8vICAgICAgICAgKHRoaXMuX21pbkltYWdlV2lkdGggKyB0aGlzLl9ncmlkU3BhY2luZykpO1xyXG4vLyAgICAgdGhpcy5fcm93cyA9IE1hdGguY2VpbCh0aGlzLl8kcHJvamVjdHMubGVuZ3RoIC8gdGhpcy5fY29scyk7XHJcbi8vICAgICB0aGlzLl9pbWFnZVdpZHRoID0gKGdyaWRXaWR0aCAtICgodGhpcy5fY29scyAtIDEpICogdGhpcy5fZ3JpZFNwYWNpbmcpKSAvIFxyXG4vLyAgICAgICAgIHRoaXMuX2NvbHM7XHJcbi8vICAgICB0aGlzLl9pbWFnZUhlaWdodCA9IHRoaXMuX2ltYWdlV2lkdGggKiAoMSAvIHRoaXMuX2FzcGVjdFJhdGlvKTtcclxuLy8gfTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhbGN1bGF0ZUdyaWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB2YXIgZ3JpZFdpZHRoID0gdGhpcy5fJGdyaWQuaW5uZXJXaWR0aCgpO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9icmVha3BvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmIChncmlkV2lkdGggPD0gdGhpcy5fYnJlYWtwb2ludHNbaV0ud2lkdGgpIHtcclxuICAgICAgICAgICAgdGhpcy5fY29scyA9IHRoaXMuX2JyZWFrcG9pbnRzW2ldLmNvbHM7XHJcbiAgICAgICAgICAgIHRoaXMuX2dyaWRTcGFjaW5nID0gdGhpcy5fYnJlYWtwb2ludHNbaV0uc3BhY2luZztcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5fcm93cyA9IE1hdGguY2VpbCh0aGlzLl8kcHJvamVjdHMubGVuZ3RoIC8gdGhpcy5fY29scyk7XHJcbiAgICB0aGlzLl9pbWFnZVdpZHRoID0gKGdyaWRXaWR0aCAtICgodGhpcy5fY29scyAtIDEpICogdGhpcy5fZ3JpZFNwYWNpbmcpKSAvIFxyXG4gICAgICAgIHRoaXMuX2NvbHM7XHJcbiAgICB0aGlzLl9pbWFnZUhlaWdodCA9IHRoaXMuX2ltYWdlV2lkdGggKiAoMSAvIHRoaXMuX2FzcGVjdFJhdGlvKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NyZWF0ZUdyaWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVHcmlkKCk7XHJcblxyXG4gICAgdGhpcy5fJGdyaWQuY3NzKFwicG9zaXRpb25cIiwgXCJyZWxhdGl2ZVwiKTtcclxuICAgIHRoaXMuXyRncmlkLmNzcyh7XHJcbiAgICAgICAgaGVpZ2h0OiB0aGlzLl9pbWFnZUhlaWdodCAqIHRoaXMuX3Jvd3MgKyBcclxuICAgICAgICAgICAgdGhpcy5fZ3JpZFNwYWNpbmcgKiAodGhpcy5fcm93cyAtIDEpICsgXCJweFwiXHJcbiAgICB9KTsgICAgXHJcblxyXG4gICAgdGhpcy5fJHByb2plY3RzLmZvckVhY2goZnVuY3Rpb24gKCRlbGVtZW50LCBpbmRleCkge1xyXG4gICAgICAgIHZhciBwb3MgPSB0aGlzLl9pbmRleFRvWFkoaW5kZXgpO1xyXG4gICAgICAgICRlbGVtZW50LmNzcyh7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgICAgIHRvcDogcG9zLnkgKyBcInB4XCIsXHJcbiAgICAgICAgICAgIGxlZnQ6IHBvcy54ICsgXCJweFwiLFxyXG4gICAgICAgICAgICB3aWR0aDogdGhpcy5faW1hZ2VXaWR0aCArIFwicHhcIixcclxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLl9pbWFnZUhlaWdodCArIFwicHhcIlxyXG4gICAgICAgIH0pO1xyXG4gICAgfS5iaW5kKHRoaXMpKTsgICAgXHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9vbk5hdkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcbiAgICBpZiAoJHRhcmdldC5pcyh0aGlzLl8kYWN0aXZlTmF2SXRlbSkpIHJldHVybjtcclxuICAgIGlmICh0aGlzLl8kYWN0aXZlTmF2SXRlbS5sZW5ndGgpIHRoaXMuXyRhY3RpdmVOYXZJdGVtLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgJHRhcmdldC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gJHRhcmdldDtcclxuICAgIHZhciBjYXRlZ29yeSA9ICR0YXJnZXQuZGF0YShcImNhdGVnb3J5XCIpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgaGlzdG9yeS5wdXNoU3RhdGUoe1xyXG4gICAgICAgIHVybDogXCIvd29yay5odG1sXCIsXHJcbiAgICAgICAgcXVlcnk6IHsgY2F0ZWdvcnk6IGNhdGVnb3J5IH1cclxuICAgIH0sIG51bGwsIFwiL3dvcmsuaHRtbD9jYXRlZ29yeT1cIiArIGNhdGVnb3J5KTtcclxuXHJcbiAgICB0aGlzLl9maWx0ZXJQcm9qZWN0cyhjYXRlZ29yeSk7XHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9vblByb2plY3RDbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgIHZhciBwcm9qZWN0TmFtZSA9ICR0YXJnZXQuZGF0YShcIm5hbWVcIik7XHJcbiAgICB2YXIgdXJsID0gXCIvcHJvamVjdHMvXCIgKyBwcm9qZWN0TmFtZSArIFwiLmh0bWxcIjtcclxuICAgIHRoaXMuX2xvYWRlci5sb2FkUGFnZSh1cmwsIHt9LCB0cnVlKTtcclxufTtcclxuXHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9pbmRleFRvWFkgPSBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgIHZhciByID0gTWF0aC5mbG9vcihpbmRleCAvIHRoaXMuX2NvbHMpO1xyXG4gICAgdmFyIGMgPSBpbmRleCAlIHRoaXMuX2NvbHM7IFxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiBjICogdGhpcy5faW1hZ2VXaWR0aCArIGMgKiB0aGlzLl9ncmlkU3BhY2luZyxcclxuICAgICAgICB5OiByICogdGhpcy5faW1hZ2VIZWlnaHQgKyByICogdGhpcy5fZ3JpZFNwYWNpbmdcclxuICAgIH07XHJcbn07IiwiZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKHZhbCwgZGVmYXVsdFZhbCkge1xyXG4gICAgcmV0dXJuICh2YWwgIT09IHVuZGVmaW5lZCkgPyB2YWwgOiBkZWZhdWx0VmFsO1xyXG59O1xyXG5cclxuLy8gVW50ZXN0ZWRcclxuLy8gZXhwb3J0cy5kZWZhdWx0UHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmF1bHRQcm9wZXJ0aWVzIChvYmosIHByb3BzKSB7XHJcbi8vICAgICBmb3IgKHZhciBwcm9wIGluIHByb3BzKSB7XHJcbi8vICAgICAgICAgaWYgKHByb3BzLmhhc093blByb3BlcnR5KHByb3BzLCBwcm9wKSkge1xyXG4vLyAgICAgICAgICAgICB2YXIgdmFsdWUgPSBleHBvcnRzLmRlZmF1bHRWYWx1ZShwcm9wcy52YWx1ZSwgcHJvcHMuZGVmYXVsdCk7XHJcbi8vICAgICAgICAgICAgIG9ialtwcm9wXSA9IHZhbHVlO1xyXG4vLyAgICAgICAgIH1cclxuLy8gICAgIH1cclxuLy8gICAgIHJldHVybiBvYmo7XHJcbi8vIH07XHJcbi8vIFxyXG5leHBvcnRzLnRpbWVJdCA9IGZ1bmN0aW9uIChmdW5jKSB7XHJcbiAgICB2YXIgc3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIGZ1bmMoKTtcclxuICAgIHZhciBlbmQgPSBwZXJmb3JtYW5jZS5ub3coKTtcclxuICAgIHJldHVybiBlbmQgLSBzdGFydDtcclxufTtcclxuXHJcbmV4cG9ydHMuaXNJblJlY3QgPSBmdW5jdGlvbiAoeCwgeSwgcmVjdCkge1xyXG4gICAgaWYgKHggPj0gcmVjdC54ICYmIHggPD0gKHJlY3QueCArIHJlY3QudykgJiZcclxuICAgICAgICB5ID49IHJlY3QueSAmJiB5IDw9IChyZWN0LnkgKyByZWN0LmgpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn07XHJcblxyXG5leHBvcnRzLnJhbmRJbnQgPSBmdW5jdGlvbiAobWluLCBtYXgpIHtcclxuICAgIHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xyXG59O1xyXG5cclxuZXhwb3J0cy5yYW5kQXJyYXlFbGVtZW50ID0gZnVuY3Rpb24gKGFycmF5KSB7XHJcbiAgICB2YXIgaSA9IGV4cG9ydHMucmFuZEludCgwLCBhcnJheS5sZW5ndGggLSAxKTsgICAgXHJcbiAgICByZXR1cm4gYXJyYXlbaV07XHJcbn07XHJcblxyXG5leHBvcnRzLm1hcCA9IGZ1bmN0aW9uIChudW0sIG1pbjEsIG1heDEsIG1pbjIsIG1heDIsIG9wdGlvbnMpIHtcclxuICAgIHZhciBtYXBwZWQgPSAobnVtIC0gbWluMSkgLyAobWF4MSAtIG1pbjEpICogKG1heDIgLSBtaW4yKSArIG1pbjI7XHJcbiAgICBpZiAoIW9wdGlvbnMpIHJldHVybiBtYXBwZWQ7XHJcbiAgICBpZiAob3B0aW9ucy5yb3VuZCAmJiBvcHRpb25zLnJvdW5kID09PSB0cnVlKSB7XHJcbiAgICAgICAgbWFwcGVkID0gTWF0aC5yb3VuZChtYXBwZWQpO1xyXG4gICAgfVxyXG4gICAgaWYgKG9wdGlvbnMuZmxvb3IgJiYgb3B0aW9ucy5mbG9vciA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIG1hcHBlZCA9IE1hdGguZmxvb3IobWFwcGVkKTsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgaWYgKG9wdGlvbnMuY2VpbCAmJiBvcHRpb25zLmNlaWwgPT09IHRydWUpIHtcclxuICAgICAgICBtYXBwZWQgPSBNYXRoLmNlaWwobWFwcGVkKTsgICAgICAgIFxyXG4gICAgfVxyXG4gICAgaWYgKG9wdGlvbnMuY2xhbXAgJiYgb3B0aW9ucy5jbGFtcCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIG1hcHBlZCA9IE1hdGgubWluKG1hcHBlZCwgbWF4Mik7XHJcbiAgICAgICAgbWFwcGVkID0gTWF0aC5tYXgobWFwcGVkLCBtaW4yKTtcclxuICAgIH1cclxuICAgIHJldHVybiBtYXBwZWQ7XHJcbn07XHJcblxyXG5leHBvcnRzLmdldFF1ZXJ5UGFyYW1ldGVycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIENoZWNrIGZvciBxdWVyeSBzdHJpbmdcclxuICAgIHFzID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcclxuICAgIGlmIChxcy5sZW5ndGggPD0gMSkgcmV0dXJuIHt9O1xyXG4gICAgLy8gUXVlcnkgc3RyaW5nIGV4aXN0cywgcGFyc2UgaXQgaW50byBhIHF1ZXJ5IG9iamVjdFxyXG4gICAgcXMgPSBxcy5zdWJzdHJpbmcoMSk7IC8vIFJlbW92ZSB0aGUgXCI/XCIgZGVsaW1pdGVyXHJcbiAgICB2YXIga2V5VmFsUGFpcnMgPSBxcy5zcGxpdChcIiZcIik7XHJcbiAgICB2YXIgcXVlcnlPYmplY3QgPSB7fTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5VmFsUGFpcnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIga2V5VmFsID0ga2V5VmFsUGFpcnNbaV0uc3BsaXQoXCI9XCIpO1xyXG4gICAgICAgIGlmIChrZXlWYWwubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5VmFsWzBdKTtcclxuICAgICAgICAgICAgdmFyIHZhbCA9IGRlY29kZVVSSUNvbXBvbmVudChrZXlWYWxbMV0pO1xyXG4gICAgICAgICAgICBxdWVyeU9iamVjdFtrZXldID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBxdWVyeU9iamVjdDtcclxufTtcclxuXHJcbmV4cG9ydHMuY3JlYXRlUXVlcnlTdHJpbmcgPSBmdW5jdGlvbiAocXVlcnlPYmplY3QpIHtcclxuICAgIGlmICh0eXBlb2YgcXVlcnlPYmplY3QgIT09IFwib2JqZWN0XCIpIHJldHVybiBcIlwiO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhxdWVyeU9iamVjdCk7XHJcbiAgICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHJldHVybiBcIlwiO1xyXG4gICAgdmFyIHF1ZXJ5U3RyaW5nID0gXCI/XCI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcclxuICAgICAgICB2YXIgdmFsID0gcXVlcnlPYmplY3Rba2V5XTtcclxuICAgICAgICBxdWVyeVN0cmluZyArPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbCk7XHJcbiAgICAgICAgaWYgKGkgIT09IGtleXMubGVuZ3RoIC0gMSkgcXVlcnlTdHJpbmcgKz0gXCImXCI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcXVlcnlTdHJpbmc7XHJcbn07XHJcblxyXG5leHBvcnRzLndyYXBJbmRleCA9IGZ1bmN0aW9uIChpbmRleCwgbGVuZ3RoKSB7XHJcbiAgICB2YXIgd3JhcHBlZEluZGV4ID0gKGluZGV4ICUgbGVuZ3RoKTsgXHJcbiAgICBpZiAod3JhcHBlZEluZGV4IDwgMCkge1xyXG4gICAgICAgIC8vIElmIG5lZ2F0aXZlLCBmbGlwIHRoZSBpbmRleCBzbyB0aGF0IC0xIGJlY29tZXMgdGhlIGxhc3QgaXRlbSBpbiBsaXN0IFxyXG4gICAgICAgIHdyYXBwZWRJbmRleCA9IGxlbmd0aCArIHdyYXBwZWRJbmRleDtcclxuICAgIH1cclxuICAgIHJldHVybiB3cmFwcGVkSW5kZXg7XHJcbn07XHJcbiJdfQ==
