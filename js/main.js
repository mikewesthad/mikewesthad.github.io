(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
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
},{"./utilities.js":10}],3:[function(require,module,exports){
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
},{"./utilities.js":10}],4:[function(require,module,exports){
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
},{"../../utilities.js":10}],5:[function(require,module,exports){
module.exports = Sketch;

var utils = require("../utilities.js");
var Noise = require("./generators/noise-generators.js");
var BboxText = require("p5-bbox-aligned-text");

var p;
var fontPath = "../fonts/big_john-webfont.ttf";

function Sketch($nav, $navLogo) {
    this._$nav = $nav;
    this._$navLogo = $navLogo;
    this._text = this._$navLogo.text();

    this._isFirstFrame = true;
    this._isMouseOver = false;

    this._font = null;
    this._p = null;
    this._$canvas = null;
    this._rotationNoise = null; 
    this._xyNoise = null;
    this._bboxText = null;

    this._updateSize();
    this._updateFontSize();

    // Create a (relative positioned) container for the sketch inside of the
    // nav, but make sure that it is BEHIND everything else. Eventually, we will
    // drop just the nav logo (not the nav links!) behind the canvas.
    this._$container = $("<div>")
        .css({
            position: "absolute",
            top: "0px",
            left: "0px",
            cursor: "pointer" // Make it look like a link :)
        })
        .prependTo(this._$nav)
        .hide();

    this._updateTextOffset();

    // Create a p5 instance
    new p5(function(p) {
        this._p = p;
        p.preload = this._preload.bind(this, p);
        p.setup = this._setup.bind(this, p);
        p.draw = this._draw.bind(this, p);
    }.bind(this), this._$container.get(0));
}

Sketch.prototype._updateTextOffset = function (p) {
    // Find the distance from the nav to the logo's baseline
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

Sketch.prototype._updateSize = function () {
    this._width = this._$nav.innerWidth();
    this._height = this._$nav.innerHeight();
};

Sketch.prototype._updateFontSize = function () {
    this._fontSize = this._$navLogo.css("fontSize").replace("px", "");
};

Sketch.prototype._onResize = function (p) {
    this._updateSize();
    this._updateFontSize();
    this._updateTextOffset();
    this._bboxText.setText(this._text);
    this._bboxText.setTextSize(this._fontSize);
    this._textOffset.top -= this._bboxText._distBaseToMid;
    this._textOffset.left += this._bboxText.halfWidth;
    p.resizeCanvas(this._width, this._height);    
    this._drawStationaryLogo(p);
    this._isFirstFrame = true;
};

Sketch.prototype._preload = function (p) {
    this._font = p.loadFont(fontPath);
};

Sketch.prototype._setMouseOver = function (isMouseOver) {
    this._isMouseOver = isMouseOver;
};

Sketch.prototype._onClick = function (e) {
    this._$navLogo.trigger(e);
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
    if (!this._isMouseOver) return;

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
},{"../utilities.js":10,"./generators/noise-generators.js":4,"p5-bbox-aligned-text":1}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
var Loader = require("./page-loader.js");
var MainNav = require("./main-nav.js");
var HoverSlideshows = require("./hover-slideshow.js");
var PortfolioFilter = require("./portfolio-filter.js");
var ImageGalleries = require("./image-gallery.js");
var Sketch = require("./interactive-logos/noisy-word.js");

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
},{"./hover-slideshow.js":2,"./image-gallery.js":3,"./interactive-logos/noisy-word.js":5,"./main-nav.js":6,"./page-loader.js":8,"./portfolio-filter.js":9}],8:[function(require,module,exports){
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
},{"./utilities.js":10}],9:[function(require,module,exports){
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
},{"./utilities.js":10}],10:[function(require,module,exports){
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

},{}]},{},[7])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvcDUtYmJveC1hbGlnbmVkLXRleHQvbGliL2Jib3gtYWxpZ25lZC10ZXh0LmpzIiwic3JjL2pzL2hvdmVyLXNsaWRlc2hvdy5qcyIsInNyYy9qcy9pbWFnZS1nYWxsZXJ5LmpzIiwic3JjL2pzL2ludGVyYWN0aXZlLWxvZ29zL2dlbmVyYXRvcnMvbm9pc2UtZ2VuZXJhdG9ycy5qcyIsInNyYy9qcy9pbnRlcmFjdGl2ZS1sb2dvcy9ub2lzeS13b3JkLmpzIiwic3JjL2pzL21haW4tbmF2LmpzIiwic3JjL2pzL21haW4uanMiLCJzcmMvanMvcGFnZS1sb2FkZXIuanMiLCJzcmMvanMvcG9ydGZvbGlvLWZpbHRlci5qcyIsInNyYy9qcy91dGlsaXRpZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gQmJveEFsaWduZWRUZXh0O1xyXG5cclxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgQmJveEFsaWduZWRUZXh0IG9iamVjdCAtIGEgdGV4dCBvYmplY3QgdGhhdCBjYW4gYmUgZHJhd24gd2l0aFxyXG4gKiBhbmNob3IgcG9pbnRzIGJhc2VkIG9uIGEgdGlnaHQgYm91bmRpbmcgYm94IGFyb3VuZCB0aGUgdGV4dC5cclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBmb250ICAgICAgICAgICAgICAgcDUuRm9udCBvYmplY3RcclxuICogQHBhcmFtIHtzdHJpbmd9IHRleHQgICAgICAgICAgICAgICBTdHJpbmcgdG8gZGlzcGxheVxyXG4gKiBAcGFyYW0ge251bWJlcn0gW2ZvbnRTaXplPTEyXSAgICAgIEZvbnQgc2l6ZSB0byB1c2UgZm9yIHN0cmluZ1xyXG4gKiBAcGFyYW0ge29iamVjdH0gW3BJbnN0YW5jZT13aW5kb3ddIFJlZmVyZW5jZSB0byBwNSBpbnN0YW5jZSwgbGVhdmUgYmxhbmsgaWZcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBza2V0Y2ggaXMgZ2xvYmFsXHJcbiAqIEBleGFtcGxlXHJcbiAqIHZhciBmb250LCBiYm94VGV4dDtcclxuICogZnVuY3Rpb24gcHJlbG9hZCgpIHtcclxuICogICAgIGZvbnQgPSBsb2FkRm9udChcIi4vYXNzZXRzL1JlZ3VsYXIudHRmXCIpO1xyXG4gKiB9XHJcbiAqIGZ1bmN0aW9uIHNldHVwKCkge1xyXG4gKiAgICAgY3JlYXRlQ2FudmFzKDQwMCwgNjAwKTtcclxuICogICAgIGJhY2tncm91bmQoMCk7XHJcbiAqICAgICBcclxuICogICAgIGJib3hUZXh0ID0gbmV3IEJib3hBbGlnbmVkVGV4dChmb250LCBcIkhleSFcIiwgMzApOyAgICBcclxuICogICAgIGJib3hUZXh0LnNldFJvdGF0aW9uKFBJIC8gNCk7XHJcbiAqICAgICBiYm94VGV4dC5zZXRBbmNob3IoQmJveEFsaWduZWRUZXh0LkFMSUdOLkJPWF9DRU5URVIsIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSKTtcclxuICogICAgIFxyXG4gKiAgICAgZmlsbChcIiMwMEE4RUFcIik7XHJcbiAqICAgICBub1N0cm9rZSgpO1xyXG4gKiAgICAgYmJveFRleHQuZHJhdyh3aWR0aCAvIDIsIGhlaWdodCAvIDIsIHRydWUpO1xyXG4gKiB9XHJcbiAqL1xyXG5mdW5jdGlvbiBCYm94QWxpZ25lZFRleHQoZm9udCwgdGV4dCwgZm9udFNpemUsIHBJbnN0YW5jZSkge1xyXG4gICAgdGhpcy5fZm9udCA9IGZvbnQ7XHJcbiAgICB0aGlzLl90ZXh0ID0gdGV4dDtcclxuICAgIHRoaXMuX2ZvbnRTaXplID0gKGZvbnRTaXplICE9PSB1bmRlZmluZWQpID8gZm9udFNpemUgOiAxMjtcclxuICAgIHRoaXMucCA9IHBJbnN0YW5jZSB8fCB3aW5kb3c7IC8vIElmIGluc3RhbmNlIGlzIG9taXR0ZWQsIGFzc3VtZSBnbG9iYWwgc2NvcGVcclxuICAgIHRoaXMuX3JvdGF0aW9uID0gMDtcclxuICAgIHRoaXMuX2hBbGlnbiA9IEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfQ0VOVEVSO1xyXG4gICAgdGhpcy5fdkFsaWduID0gQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVI7XHJcbiAgICB0aGlzLl9jYWxjdWxhdGVNZXRyaWNzKHRydWUpO1xyXG59XHJcblxyXG4vKipcclxuICogVmVydGljYWwgYWxpZ25tZW50IHZhbHVlc1xyXG4gKiBAcHVibGljXHJcbiAqIEBzdGF0aWNcclxuICogQHJlYWRvbmx5XHJcbiAqIEBlbnVtIHtzdHJpbmd9XHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQuQUxJR04gPSB7XHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBsZWZ0IG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfTEVGVDogXCJib3hfbGVmdFwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgY2VudGVyIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfQ0VOVEVSOiBcImJveF9jZW50ZXJcIixcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIHJpZ2h0IG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfUklHSFQ6IFwiYm94X3JpZ2h0XCJcclxufTtcclxuXHJcbi8qKlxyXG4gKiBCYXNlbGluZSBhbGlnbm1lbnQgdmFsdWVzXHJcbiAqIEBwdWJsaWNcclxuICogQHN0YXRpY1xyXG4gKiBAcmVhZG9ubHlcclxuICogQGVudW0ge3N0cmluZ31cclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5CQVNFTElORSA9IHtcclxuICAgIC8qKiBEcmF3IGZyb20gdGhlIHRvcCBvZiB0aGUgYmJveCAqL1xyXG4gICAgQk9YX1RPUDogXCJib3hfdG9wXCIsXHJcbiAgICAvKiogRHJhdyBmcm9tIHRoZSBjZW50ZXIgb2YgdGhlIGJib3ggKi9cclxuICAgIEJPWF9DRU5URVI6IFwiYm94X2NlbnRlclwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgYm90dG9tIG9mIHRoZSBiYm94ICovXHJcbiAgICBCT1hfQk9UVE9NOiBcImJveF9ib3R0b21cIixcclxuICAgIC8qKiBcclxuICAgICAqIERyYXcgZnJvbSBoYWxmIHRoZSBoZWlnaHQgb2YgdGhlIGZvbnQuIFNwZWNpZmljYWxseSB0aGUgaGVpZ2h0IGlzXHJcbiAgICAgKiBjYWxjdWxhdGVkIGFzOiBhc2NlbnQgKyBkZXNjZW50LlxyXG4gICAgICovXHJcbiAgICBGT05UX0NFTlRFUjogXCJmb250X2NlbnRlclwiLFxyXG4gICAgLyoqIERyYXcgZnJvbSB0aGUgdGhlIG5vcm1hbCBmb250IGJhc2VsaW5lICovXHJcbiAgICBBTFBIQUJFVElDOiBcImFscGhhYmV0aWNcIlxyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCBjdXJyZW50IHRleHRcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIFRleHQgc3RyaW5nIHRvIGRpc3BsYXlcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0VGV4dCA9IGZ1bmN0aW9uKHN0cmluZykge1xyXG4gICAgdGhpcy5fdGV4dCA9IHN0cmluZztcclxuICAgIHRoaXMuX2NhbGN1bGF0ZU1ldHJpY3MoZmFsc2UpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCBjdXJyZW50IHRleHQgc2l6ZVxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBmb250U2l6ZSBUZXh0IHNpemVcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuc2V0VGV4dFNpemUgPSBmdW5jdGlvbihmb250U2l6ZSkge1xyXG4gICAgdGhpcy5fZm9udFNpemUgPSBmb250U2l6ZTtcclxuICAgIHRoaXMuX2NhbGN1bGF0ZU1ldHJpY3ModHJ1ZSk7XHJcbn07XHJcblxyXG4vKipcclxuICogU2V0IHJvdGF0aW9uIG9mIHRleHRcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge251bWJlcn0gYW5nbGUgUm90YXRpb24gaW4gcmFkaWFuc1xyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRSb3RhdGlvbiA9IGZ1bmN0aW9uKGFuZ2xlKSB7XHJcbiAgICB0aGlzLl9yb3RhdGlvbiA9IGFuZ2xlO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFNldCBhbmNob3IgcG9pbnQgZm9yIHRleHQgKGhvcml6b25hbCBhbmQgdmVydGljYWwgYWxpZ25tZW50KSByZWxhdGl2ZSB0b1xyXG4gKiBib3VuZGluZyBib3hcclxuICogQHB1YmxpY1xyXG4gKiBAcGFyYW0ge3N0cmluZ30gW2hBbGlnbj1DRU5URVJdIEhvcml6b25hbCBhbGlnbm1lbnRcclxuICogQHBhcmFtIHtzdHJpbmd9IFt2QWxpZ249Q0VOVEVSXSBWZXJ0aWNhbCBiYXNlbGluZVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5zZXRBbmNob3IgPSBmdW5jdGlvbihoQWxpZ24sIHZBbGlnbikge1xyXG4gICAgdGhpcy5faEFsaWduID0gaEFsaWduIHx8IEJib3hBbGlnbmVkVGV4dC5BTElHTi5DRU5URVI7XHJcbiAgICB0aGlzLl92QWxpZ24gPSB2QWxpZ24gfHwgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkNFTlRFUjtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgdGhlIGJvdW5kaW5nIGJveCB3aGVuIHRoZSB0ZXh0IGlzIHBsYWNlZCBhdCB0aGUgc3BlY2lmaWVkIGNvb3JkaW5hdGVzLlxyXG4gKiBOb3RlOiB0aGlzIGlzIHRoZSB1bnJvdGF0ZWQgYm91bmRpbmcgYm94ISBUT0RPOiBGaXggdGhpcy5cclxuICogQHBhcmFtICB7bnVtYmVyfSB4IFggY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHkgWSBjb29yZGluYXRlXHJcbiAqIEByZXR1cm4ge29iamVjdH0gICBSZXR1cm5zIGFuIG9iamVjdCB3aXRoIHByb3BlcnRpZXM6IHgsIHksIHcsIGhcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0QmJveCA9IGZ1bmN0aW9uKHgsIHkpIHtcclxuICAgIHZhciBwb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHgsIHkpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICB4OiBwb3MueCArIHRoaXMuX2JvdW5kc09mZnNldC54LFxyXG4gICAgICAgIHk6IHBvcy55ICsgdGhpcy5fYm91bmRzT2Zmc2V0LnksXHJcbiAgICAgICAgdzogdGhpcy53aWR0aCxcclxuICAgICAgICBoOiB0aGlzLmhlaWdodFxyXG4gICAgfTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBHZXQgYW4gYXJyYXkgb2YgcG9pbnRzIHRoYXQgZm9sbG93IGFsb25nIHRoZSB0ZXh0IHBhdGguIFRoaXMgd2lsbCB0YWtlIGludG9cclxuICogY29uc2lkZXJhdGlvbiB0aGUgY3VycmVudCBhbGlnbm1lbnQgc2V0dGluZ3MuXHJcbiAqIE5vdGU6IHRoaXMgaXMgYSB0aGluIHdyYXBwZXIgYXJvdW5kIGEgcDUgbWV0aG9kIGFuZCBkb2Vzbid0IGhhbmRsZSB1bnJvdGF0ZWRcclxuICogdGV4dCEgVE9ETzogRml4IHRoaXMuXHJcbiAqIEBwYXJhbSAge251bWJlcn0geCAgICAgICAgIFggY29vcmRpbmF0ZVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHkgICAgICAgICBZIGNvb3JkaW5hdGVcclxuICogQHBhcmFtICB7b2JqZWN0fSBbb3B0aW9uc10gQW4gb2JqZWN0IHRoYXQgY2FuIGhhdmU6XHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gc2FtcGxlRmFjdG9yOiByYXRpbyBvZiBwYXRoLWxlbmd0aCB0byBudW1iZXIgb2ZcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzYW1wbGVzIChkZWZhdWx0PTAuMjUpLiBIaWdoZXIgdmFsdWVzIHlpZWxkIG1vcmVcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwb2ludHMgYW5kIGFyZSB0aGVyZWZvcmUgbW9yZSBwcmVjaXNlLiBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBzaW1wbGlmeVRocmVzaG9sZDogaWYgc2V0IHRvIGEgbm9uLXplcm8gdmFsdWUsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sbGluZWFyIHBvaW50cyB3aWxsIGJlIHJlbW92ZWQuIFRoZSB2YWx1ZSBcclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXByZXNlbnRzIHRoZSB0aHJlc2hvbGQgYW5nbGUgdG8gdXNlIHdoZW5cclxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXRlcm1pbmluZyB3aGV0aGVyIHR3byBlZGdlcyBhcmUgY29sbGluZWFyLlxyXG4gKiBAcmV0dXJuIHthcnJheX0gQW4gYXJyYXkgb2YgcG9pbnRzLCBlYWNoIHdpdGggeCwgeSAmIGFscGhhICh0aGUgcGF0aCBhbmdsZSlcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZ2V0VGV4dFBvaW50cyA9IGZ1bmN0aW9uKHgsIHksIG9wdGlvbnMpIHtcclxuICAgIHZhciBwb2ludHMgPSB0aGlzLl9mb250LnRleHRUb1BvaW50cyh0aGlzLl90ZXh0LCB4LCB5LCB0aGlzLl9mb250U2l6ZSwgXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucyk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBwb3MgPSB0aGlzLl9jYWxjdWxhdGVBbGlnbmVkQ29vcmRzKHBvaW50c1tpXS54LCBwb2ludHNbaV0ueSk7XHJcbiAgICAgICAgcG9pbnRzW2ldLnggPSBwb3MueDtcclxuICAgICAgICBwb2ludHNbaV0ueSA9IHBvcy55O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHBvaW50cztcclxufTtcclxuXHJcbi8qKlxyXG4gKiBEcmF3cyB0aGUgdGV4dCBwYXJ0aWNsZSB3aXRoIHRoZSBzcGVjaWZpZWQgc3R5bGUgcGFyYW1ldGVycy4gTm90ZTogdGhpcyBpc1xyXG4gKiBnb2luZyB0byBzZXQgdGhlIHRleHRGb250LCB0ZXh0U2l6ZSAmIHJvdGF0aW9uIGJlZm9yZSBkcmF3aW5nLiBZb3Ugc2hvdWxkIHNldFxyXG4gKiB0aGUgY29sb3Ivc3Ryb2tlL2ZpbGwgdGhhdCB5b3Ugd2FudCBiZWZvcmUgZHJhd2luZy4gVGhpcyBmdW5jdGlvbiB3aWxsIGNsZWFuXHJcbiAqIHVwIGFmdGVyIGl0c2VsZiBhbmQgcmVzZXQgc3R5bGluZyBiYWNrIHRvIHdoYXQgaXQgd2FzIGJlZm9yZSBpdCB3YXMgY2FsbGVkLlxyXG4gKiBAcHVibGljXHJcbiAqIEBwYXJhbSAge251bWJlcn0gIFt4PTBdICAgICAgICAgICAgICBYIGNvb3JkaW5hdGUgb2YgdGV4dCBhbmNob3JcclxuICogQHBhcmFtICB7bnVtYmVyfSAgW3k9MF0gICAgICAgICAgICAgIFkgY29vcmRpbmF0ZSBvZiB0ZXh0IGFuY2hvclxyXG4gKiBAcGFyYW0gIHtib29sZWFufSBbZHJhd0JvdW5kcz1mYWxzZV0gRmxhZyBmb3IgZHJhd2luZyBib3VuZGluZyBib3hcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHgsIHksIGRyYXdCb3VuZHMpIHtcclxuICAgIGRyYXdCb3VuZHMgPSBkcmF3Qm91bmRzIHx8IGZhbHNlO1xyXG4gICAgdmFyIHBvcyA9IHtcclxuICAgICAgICB4OiAoeCAhPT0gdW5kZWZpbmVkKSA/IHggOiAwLCBcclxuICAgICAgICB5OiAoeSAhPT0gdW5kZWZpbmVkKSA/IHkgOiAwXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMucC5wdXNoKCk7XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9yb3RhdGlvbikge1xyXG4gICAgICAgICAgICBwb3MgPSB0aGlzLl9jYWxjdWxhdGVSb3RhdGVkQ29vcmRzKHBvcy54LCBwb3MueSwgdGhpcy5fcm90YXRpb24pO1xyXG4gICAgICAgICAgICB0aGlzLnAucm90YXRlKHRoaXMuX3JvdGF0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHBvcyA9IHRoaXMuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHMocG9zLngsIHBvcy55KTtcclxuXHJcbiAgICAgICAgdGhpcy5wLnRleHRBbGlnbih0aGlzLnAuTEVGVCwgdGhpcy5wLkJBU0VMSU5FKTtcclxuICAgICAgICB0aGlzLnAudGV4dEZvbnQodGhpcy5fZm9udCk7XHJcbiAgICAgICAgdGhpcy5wLnRleHRTaXplKHRoaXMuX2ZvbnRTaXplKTtcclxuICAgICAgICB0aGlzLnAudGV4dCh0aGlzLl90ZXh0LCBwb3MueCwgcG9zLnkpO1xyXG5cclxuICAgICAgICBpZiAoZHJhd0JvdW5kcykge1xyXG4gICAgICAgICAgICB0aGlzLnAuc3Ryb2tlKDIwMCk7XHJcbiAgICAgICAgICAgIHZhciBib3VuZHNYID0gcG9zLnggKyB0aGlzLl9ib3VuZHNPZmZzZXQueDtcclxuICAgICAgICAgICAgdmFyIGJvdW5kc1kgPSBwb3MueSArIHRoaXMuX2JvdW5kc09mZnNldC55O1xyXG4gICAgICAgICAgICB0aGlzLnAubm9GaWxsKCk7XHJcbiAgICAgICAgICAgIHRoaXMucC5yZWN0KGJvdW5kc1gsIGJvdW5kc1ksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcblxyXG4gICAgdGhpcy5wLnBvcCgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFByb2plY3QgdGhlIGNvb3JkaW5hdGVzICh4LCB5KSBpbnRvIGEgcm90YXRlZCBjb29yZGluYXRlIHN5c3RlbVxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHggICAgIFggY29vcmRpbmF0ZSAoaW4gdW5yb3RhdGVkIHNwYWNlKVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHkgICAgIFkgY29vcmRpbmF0ZSAoaW4gdW5yb3RhdGVkIHNwYWNlKVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGFuZ2xlIFJhZGlhbnMgb2Ygcm90YXRpb24gdG8gYXBwbHlcclxuICogQHJldHVybiB7b2JqZWN0fSAgICAgICBPYmplY3Qgd2l0aCB4ICYgeSBwcm9wZXJ0aWVzXHJcbiAqL1xyXG5CYm94QWxpZ25lZFRleHQucHJvdG90eXBlLl9jYWxjdWxhdGVSb3RhdGVkQ29vcmRzID0gZnVuY3Rpb24gKHgsIHksIGFuZ2xlKSB7ICBcclxuICAgIHZhciByeCA9IE1hdGguY29zKGFuZ2xlKSAqIHggKyBNYXRoLmNvcyhNYXRoLlBJIC8gMiAtIGFuZ2xlKSAqIHk7XHJcbiAgICB2YXIgcnkgPSAtTWF0aC5zaW4oYW5nbGUpICogeCArIE1hdGguc2luKE1hdGguUEkgLyAyIC0gYW5nbGUpICogeTtcclxuICAgIHJldHVybiB7eDogcngsIHk6IHJ5fTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBDYWxjdWxhdGVzIGRyYXcgY29vcmRpbmF0ZXMgZm9yIHRoZSB0ZXh0LCBhbGlnbmluZyBiYXNlZCBvbiB0aGUgYm91bmRpbmcgYm94LlxyXG4gKiBUaGUgdGV4dCBpcyBldmVudHVhbGx5IGRyYXduIHdpdGggY2FudmFzIGFsaWdubWVudCBzZXQgdG8gbGVmdCAmIGJhc2VsaW5lLCBzb1xyXG4gKiB0aGlzIGZ1bmN0aW9uIHRha2VzIGEgZGVzaXJlZCBwb3MgJiBhbGlnbm1lbnQgYW5kIHJldHVybnMgdGhlIGFwcHJvcHJpYXRlXHJcbiAqIGNvb3JkaW5hdGVzIGZvciB0aGUgbGVmdCAmIGJhc2VsaW5lLlxyXG4gKiBAcHJpdmF0ZVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IHggICAgICBYIGNvb3JkaW5hdGVcclxuICogQHBhcmFtICB7bnVtYmVyfSB5ICAgICAgWSBjb29yZGluYXRlXHJcbiAqIEByZXR1cm4ge29iamVjdH0gICAgICAgIE9iamVjdCB3aXRoIHggJiB5IHByb3BlcnRpZXNcclxuICovXHJcbkJib3hBbGlnbmVkVGV4dC5wcm90b3R5cGUuX2NhbGN1bGF0ZUFsaWduZWRDb29yZHMgPSBmdW5jdGlvbih4LCB5KSB7XHJcbiAgICB2YXIgbmV3WCwgbmV3WTtcclxuICAgIHN3aXRjaCAodGhpcy5faEFsaWduKSB7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQUxJR04uQk9YX0xFRlQ6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfQ0VOVEVSOlxyXG4gICAgICAgICAgICBuZXdYID0geCAtIHRoaXMuaGFsZldpZHRoO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5BTElHTi5CT1hfUklHSFQ6XHJcbiAgICAgICAgICAgIG5ld1ggPSB4IC0gdGhpcy53aWR0aDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgbmV3WCA9IHg7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5yZWNvZ25pemVkIGhvcml6b25hbCBhbGlnbjpcIiwgdGhpcy5faEFsaWduKTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBzd2l0Y2ggKHRoaXMuX3ZBbGlnbikge1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9UT1A6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5IC0gdGhpcy5fYm91bmRzT2Zmc2V0Lnk7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkJPWF9DRU5URVI6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5ICsgdGhpcy5fZGlzdEJhc2VUb01pZDtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBCYm94QWxpZ25lZFRleHQuQkFTRUxJTkUuQk9YX0JPVFRPTTpcclxuICAgICAgICAgICAgbmV3WSA9IHkgLSB0aGlzLl9kaXN0QmFzZVRvQm90dG9tO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIEJib3hBbGlnbmVkVGV4dC5CQVNFTElORS5GT05UX0NFTlRFUjpcclxuICAgICAgICAgICAgLy8gSGVpZ2h0IGlzIGFwcHJveGltYXRlZCBhcyBhc2NlbnQgKyBkZXNjZW50XHJcbiAgICAgICAgICAgIG5ld1kgPSB5IC0gdGhpcy5fZGVzY2VudCArICh0aGlzLl9hc2NlbnQgKyB0aGlzLl9kZXNjZW50KSAvIDI7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgQmJveEFsaWduZWRUZXh0LkJBU0VMSU5FLkFMUEhBQkVUSUM6XHJcbiAgICAgICAgICAgIG5ld1kgPSB5O1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICBuZXdZID0geTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbnJlY29nbml6ZWQgdmVydGljYWwgYWxpZ246XCIsIHRoaXMuX3ZBbGlnbik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHt4OiBuZXdYLCB5OiBuZXdZfTtcclxufTtcclxuXHJcblxyXG4vKipcclxuICogQ2FsY3VsYXRlcyBib3VuZGluZyBib3ggYW5kIHZhcmlvdXMgbWV0cmljcyBmb3IgdGhlIGN1cnJlbnQgdGV4dCBhbmQgZm9udFxyXG4gKiBAcHJpdmF0ZVxyXG4gKi9cclxuQmJveEFsaWduZWRUZXh0LnByb3RvdHlwZS5fY2FsY3VsYXRlTWV0cmljcyA9IGZ1bmN0aW9uKHNob3VsZFVwZGF0ZUhlaWdodCkgeyAgXHJcbiAgICAvLyBwNSAwLjUuMCBoYXMgYSBidWcgLSB0ZXh0IGJvdW5kcyBhcmUgY2xpcHBlZCBieSAoMCwgMClcclxuICAgIC8vIENhbGN1bGF0aW5nIGJvdW5kcyBoYWNrXHJcbiAgICB2YXIgYm91bmRzID0gdGhpcy5fZm9udC50ZXh0Qm91bmRzKHRoaXMuX3RleHQsIDEwMDAsIDEwMDAsIHRoaXMuX2ZvbnRTaXplKTtcclxuICAgIC8vIEJvdW5kcyBpcyBhIHJlZmVyZW5jZSAtIGlmIHdlIG1lc3Mgd2l0aCBpdCBkaXJlY3RseSwgd2UgY2FuIG1lc3MgdXAgXHJcbiAgICAvLyBmdXR1cmUgdmFsdWVzISAoSXQgY2hhbmdlcyB0aGUgYmJveCBjYWNoZSBpbiBwNS4pXHJcbiAgICBib3VuZHMgPSB7IFxyXG4gICAgICAgIHg6IGJvdW5kcy54IC0gMTAwMCwgXHJcbiAgICAgICAgeTogYm91bmRzLnkgLSAxMDAwLCBcclxuICAgICAgICB3OiBib3VuZHMudywgXHJcbiAgICAgICAgaDogYm91bmRzLmggXHJcbiAgICB9OyBcclxuXHJcbiAgICBpZiAoc2hvdWxkVXBkYXRlSGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5fYXNjZW50ID0gdGhpcy5fZm9udC5fdGV4dEFzY2VudCh0aGlzLl9mb250U2l6ZSk7XHJcbiAgICAgICAgdGhpcy5fZGVzY2VudCA9IHRoaXMuX2ZvbnQuX3RleHREZXNjZW50KHRoaXMuX2ZvbnRTaXplKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBVc2UgYm91bmRzIHRvIGNhbGN1bGF0ZSBmb250IG1ldHJpY3NcclxuICAgIHRoaXMud2lkdGggPSBib3VuZHMudztcclxuICAgIHRoaXMuaGVpZ2h0ID0gYm91bmRzLmg7XHJcbiAgICB0aGlzLmhhbGZXaWR0aCA9IHRoaXMud2lkdGggLyAyO1xyXG4gICAgdGhpcy5oYWxmSGVpZ2h0ID0gdGhpcy5oZWlnaHQgLyAyO1xyXG4gICAgdGhpcy5fYm91bmRzT2Zmc2V0ID0geyB4OiBib3VuZHMueCwgeTogYm91bmRzLnkgfTtcclxuICAgIHRoaXMuX2Rpc3RCYXNlVG9NaWQgPSBNYXRoLmFicyhib3VuZHMueSkgLSB0aGlzLmhhbGZIZWlnaHQ7XHJcbiAgICB0aGlzLl9kaXN0QmFzZVRvQm90dG9tID0gdGhpcy5oZWlnaHQgLSBNYXRoLmFicyhib3VuZHMueSk7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBIb3ZlclNsaWRlc2hvd3M7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gSG92ZXJTbGlkZXNob3dzKHNsaWRlc2hvd0RlbGF5LCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRoaXMuX3NsaWRlc2hvd0RlbGF5ID0gKHNsaWRlc2hvd0RlbGF5ICE9PSB1bmRlZmluZWQpID8gc2xpZGVzaG93RGVsYXkgOiBcclxuICAgICAgICAyMDAwO1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gKHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSA/IFxyXG4gICAgICAgIF90cmFuc2l0aW9uRHVyYXRpb24gOiAxMDAwOyAgIFxyXG5cclxuICAgIHRoaXMuX3NsaWRlc2hvd3MgPSBbXTtcclxuICAgIHRoaXMucmVsb2FkKCk7XHJcbn1cclxuXHJcbkhvdmVyU2xpZGVzaG93cy5wcm90b3R5cGUucmVsb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gTm90ZTogdGhpcyBpcyBjdXJyZW50bHkgbm90IHJlYWxseSBiZWluZyB1c2VkLiBXaGVuIGEgcGFnZSBpcyBsb2FkZWQsXHJcbiAgICAvLyBtYWluLmpzIGlzIGp1c3QgcmUtaW5zdGFuY2luZyB0aGUgSG92ZXJTbGlkZXNob3dzXHJcbiAgICB2YXIgb2xkU2xpZGVzaG93cyA9IHRoaXMuX3NsaWRlc2hvd3MgfHwgW107XHJcbiAgICB0aGlzLl9zbGlkZXNob3dzID0gW107XHJcbiAgICAkKFwiLmhvdmVyLXNsaWRlc2hvd1wiKS5lYWNoKGZ1bmN0aW9uIChfLCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcclxuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl9maW5kSW5TbGlkZXNob3dzKGVsZW1lbnQsIG9sZFNsaWRlc2hvd3MpO1xyXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlc2hvdyA9IG9sZFNsaWRlc2hvd3Muc3BsaWNlKGluZGV4LCAxKVswXTtcclxuICAgICAgICAgICAgdGhpcy5fc2xpZGVzaG93cy5wdXNoKHNsaWRlc2hvdyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fc2xpZGVzaG93cy5wdXNoKG5ldyBTbGlkZXNob3coJGVsZW1lbnQsIHRoaXMuX3NsaWRlc2hvd0RlbGF5LFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkhvdmVyU2xpZGVzaG93cy5wcm90b3R5cGUuX2ZpbmRJblNsaWRlc2hvd3MgPSBmdW5jdGlvbiAoZWxlbWVudCwgc2xpZGVzaG93cykge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXNob3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IHNsaWRlc2hvd3NbaV0uZ2V0RWxlbWVudCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAtMTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIFNsaWRlc2hvdygkY29udGFpbmVyLCBzbGlkZXNob3dEZWxheSwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICAgIHRoaXMuX3NsaWRlc2hvd0RlbGF5ID0gc2xpZGVzaG93RGVsYXk7XHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb247XHJcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBudWxsO1xyXG4gICAgdGhpcy5faW1hZ2VJbmRleCA9IDA7XHJcbiAgICB0aGlzLl8kaW1hZ2VzID0gW107XHJcblxyXG4gICAgLy8gU2V0IHVwIGFuZCBjYWNoZSByZWZlcmVuY2VzIHRvIGltYWdlc1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5maW5kKFwiaW1nXCIpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRpbWFnZSA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgJGltYWdlLmNzcyh7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgICAgIHRvcDogXCIwXCIsXHJcbiAgICAgICAgICAgIGxlZnQ6IFwiMFwiLFxyXG4gICAgICAgICAgICB6SW5kZXg6IChpbmRleCA9PT0gMCkgPyAyIDogMCAvLyBGaXJzdCBpbWFnZSBzaG91bGQgYmUgb24gdG9wXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlcy5wdXNoKCRpbWFnZSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRvIGJpbmQgaW50ZXJhY3Rpdml0eVxyXG4gICAgdGhpcy5fbnVtSW1hZ2VzID0gdGhpcy5fJGltYWdlcy5sZW5ndGg7XHJcbiAgICBpZiAodGhpcy5fbnVtSW1hZ2VzIDw9IDEpIHJldHVybjtcclxuXHJcbiAgICAvLyBCaW5kIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5vbihcIm1vdXNlZW50ZXJcIiwgdGhpcy5fb25FbnRlci5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuXyRjb250YWluZXIub24oXCJtb3VzZWxlYXZlXCIsIHRoaXMuX29uTGVhdmUuYmluZCh0aGlzKSk7XHJcblxyXG59XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldEVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fJGNvbnRhaW5lci5nZXQoMCk7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldCRFbGVtZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuXyRjb250YWluZXI7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLl9vbkVudGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gRmlyc3QgdHJhbnNpdGlvbiBzaG91bGQgaGFwcGVuIHByZXR0eSBzb29uIGFmdGVyIGhvdmVyaW5nIGluIG9yZGVyXHJcbiAgICAvLyB0byBjbHVlIHRoZSB1c2VyIGludG8gd2hhdCBpcyBoYXBwZW5pbmdcclxuICAgIHRoaXMuX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fYWR2YW5jZVNsaWRlc2hvdy5iaW5kKHRoaXMpLCA1MDApO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fb25MZWF2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fdGltZW91dElkKTsgIFxyXG4gICAgdGhpcy5fdGltZW91dElkID0gbnVsbDsgICAgICBcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX2FkdmFuY2VTbGlkZXNob3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9pbWFnZUluZGV4ICs9IDE7XHJcbiAgICB2YXIgaTtcclxuXHJcbiAgICAvLyBNb3ZlIHRoZSBpbWFnZSBmcm9tIDIgc3RlcHMgYWdvIGRvd24gdG8gdGhlIGJvdHRvbSB6LWluZGV4IGFuZCBtYWtlXHJcbiAgICAvLyBpdCBpbnZpc2libGVcclxuICAgIGlmICh0aGlzLl9udW1JbWFnZXMgPj0gMykge1xyXG4gICAgICAgIGkgPSB1dGlsaXRpZXMud3JhcEluZGV4KHRoaXMuX2ltYWdlSW5kZXggLSAyLCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXNbaV0uY3NzKHtcclxuICAgICAgICAgICAgekluZGV4OiAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlc1tpXS52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTW92ZSB0aGUgaW1hZ2UgZnJvbSAxIHN0ZXBzIGFnbyBkb3duIHRvIHRoZSBtaWRkbGUgei1pbmRleCBhbmQgbWFrZVxyXG4gICAgLy8gaXQgY29tcGxldGVseSB2aXNpYmxlXHJcbiAgICBpZiAodGhpcy5fbnVtSW1hZ2VzID49IDIpIHtcclxuICAgICAgICBpID0gdXRpbGl0aWVzLndyYXBJbmRleCh0aGlzLl9pbWFnZUluZGV4IC0gMSwgdGhpcy5fbnVtSW1hZ2VzKTtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VzW2ldLmNzcyh7XHJcbiAgICAgICAgICAgIHpJbmRleDogMSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXNbaV0udmVsb2NpdHkoXCJzdG9wXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE1vdmUgdGhlIGN1cnJlbnQgaW1hZ2UgdG8gdGhlIHRvcCB6LWluZGV4IGFuZCBmYWRlIGl0IGluXHJcbiAgICB0aGlzLl9pbWFnZUluZGV4ID0gdXRpbGl0aWVzLndyYXBJbmRleCh0aGlzLl9pbWFnZUluZGV4LCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gICAgdGhpcy5fJGltYWdlc1t0aGlzLl9pbWFnZUluZGV4XS5jc3Moe1xyXG4gICAgICAgIHpJbmRleDogMixcclxuICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICB9KTtcclxuICAgIHRoaXMuXyRpbWFnZXNbdGhpcy5faW1hZ2VJbmRleF0udmVsb2NpdHkoe1xyXG4gICAgICAgIG9wYWNpdHk6IDFcclxuICAgIH0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXCJlYXNlSW5PdXRRdWFkXCIpO1xyXG5cclxuICAgIC8vIFNjaGVkdWxlIG5leHQgdHJhbnNpdGlvblxyXG4gICAgdGhpcy5fdGltZW91dElkID0gc2V0VGltZW91dCh0aGlzLl9hZHZhbmNlU2xpZGVzaG93LmJpbmQodGhpcyksIFxyXG4gICAgICAgIHRoaXMuX3NsaWRlc2hvd0RlbGF5KTtcclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IEltYWdlR2FsbGVyaWVzO1xyXG5cclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEltYWdlR2FsbGVyaWVzKHRyYW5zaXRpb25EdXJhdGlvbikgeyBcclxuICAgIHRyYW5zaXRpb25EdXJhdGlvbiA9ICh0cmFuc2l0aW9uRHVyYXRpb24gIT09IHVuZGVmaW5lZCkgP1xyXG4gICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbiA6IDQwMDtcclxuICAgIHRoaXMuX2ltYWdlR2FsbGVyaWVzID0gW107XHJcbiAgICAkKFwiLmltYWdlLWdhbGxlcnlcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgZ2FsbGVyeSA9IG5ldyBJbWFnZUdhbGxlcnkoJChlbGVtZW50KSwgdHJhbnNpdGlvbkR1cmF0aW9uKTtcclxuICAgICAgICB0aGlzLl9pbWFnZUdhbGxlcmllcy5wdXNoKGdhbGxlcnkpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gSW1hZ2VHYWxsZXJ5KCRjb250YWluZXIsIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gdHJhbnNpdGlvbkR1cmF0aW9uO1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lciA9ICRjb250YWluZXI7XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyID0gJGNvbnRhaW5lci5maW5kKFwiLmltYWdlLWdhbGxlcnktdGh1bWJuYWlsc1wiKTtcclxuICAgIHRoaXMuX2luZGV4ID0gMDsgLy8gSW5kZXggb2Ygc2VsZWN0ZWQgaW1hZ2VcclxuXHJcbiAgICAvLyBMb29wIHRocm91Z2ggdGhlIHRodW1ibmFpbHMsIGdpdmUgdGhlbSBhbiBpbmRleCBkYXRhIGF0dHJpYnV0ZSBhbmQgY2FjaGVcclxuICAgIC8vIGEgcmVmZXJlbmNlIHRvIHRoZW0gaW4gYW4gYXJyYXlcclxuICAgIHRoaXMuXyR0aHVtYm5haWxzID0gW107XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyLmZpbmQoXCJpbWdcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgJHRodW1ibmFpbCA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgJHRodW1ibmFpbC5kYXRhKFwiaW5kZXhcIiwgaW5kZXgpO1xyXG4gICAgICAgIHRoaXMuXyR0aHVtYm5haWxzLnB1c2goJHRodW1ibmFpbCk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBlbXB0eSBpbWFnZXMgaW4gdGhlIGdhbGxlcnkgZm9yIGVhY2ggdGh1bWJuYWlsLiBUaGlzIGhlbHBzIHVzIGRvXHJcbiAgICAvLyBsYXp5IGxvYWRpbmcgb2YgZ2FsbGVyeSBpbWFnZXMgYW5kIGFsbG93cyB1cyB0byBjcm9zcy1mYWRlIGltYWdlcy5cclxuICAgIHRoaXMuXyRnYWxsZXJ5SW1hZ2VzID0gW107XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuXyR0aHVtYm5haWxzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBpZCBmcm9tIHRoZSBwYXRoIHRvIHRoZSBsYXJnZSBpbWFnZVxyXG4gICAgICAgIHZhciBsYXJnZVBhdGggPSB0aGlzLl8kdGh1bWJuYWlsc1tpXS5kYXRhKFwibGFyZ2UtcGF0aFwiKTtcclxuICAgICAgICB2YXIgaWQgPSBsYXJnZVBhdGguc3BsaXQoXCIvXCIpLnBvcCgpLnNwbGl0KFwiLlwiKVswXTtcclxuICAgICAgICB2YXIgJGdhbGxlcnlJbWFnZSA9ICQoXCI8aW1nPlwiKVxyXG4gICAgICAgICAgICAuY3NzKHtcclxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgICAgICAgICB0b3A6IFwiMHB4XCIsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBcIjBweFwiLFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMCxcclxuICAgICAgICAgICAgICAgIHpJbmRleDogMCxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogXCJ3aGl0ZVwiXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5hdHRyKFwiaWRcIiwgaWQpXHJcbiAgICAgICAgICAgIC5kYXRhKFwiaW1hZ2UtdXJsXCIsIGxhcmdlUGF0aClcclxuICAgICAgICAgICAgLmFwcGVuZFRvKCRjb250YWluZXIuZmluZChcIi5pbWFnZS1nYWxsZXJ5LXNlbGVjdGVkXCIpKTtcclxuICAgICAgICAkZ2FsbGVyeUltYWdlLmdldCgwKS5zcmMgPSBsYXJnZVBhdGg7IC8vIFRPRE86IE1ha2UgdGhpcyBsYXp5IVxyXG4gICAgICAgIHRoaXMuXyRnYWxsZXJ5SW1hZ2VzLnB1c2goJGdhbGxlcnlJbWFnZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQWN0aXZhdGUgdGhlIGZpcnN0IHRodW1ibmFpbCBhbmQgZGlzcGxheSBpdCBpbiB0aGUgZ2FsbGVyeSBcclxuICAgIHRoaXMuX3N3aXRjaEFjdGl2ZUltYWdlKDApO1xyXG5cclxuICAgIC8vIEJpbmQgdGhlIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBpbWFnZXNcclxuICAgIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIuZmluZChcImltZ1wiKS5vbihcImNsaWNrXCIsIHRoaXMuX29uQ2xpY2suYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbkltYWdlR2FsbGVyeS5wcm90b3R5cGUuX3N3aXRjaEFjdGl2ZUltYWdlID0gZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAvLyBSZXNldCBhbGwgaW1hZ2VzIHRvIGludmlzaWJsZSBhbmQgbG93ZXN0IHotaW5kZXguIFRoaXMgY291bGQgYmUgc21hcnRlcixcclxuICAgIC8vIGxpa2UgSG92ZXJTbGlkZXNob3csIGFuZCBvbmx5IHJlc2V0IGV4YWN0bHkgd2hhdCB3ZSBuZWVkLCBidXQgd2UgYXJlbid0IFxyXG4gICAgLy8gd2FzdGluZyB0aGF0IG1hbnkgY3ljbGVzLlxyXG4gICAgdGhpcy5fJGdhbGxlcnlJbWFnZXMuZm9yRWFjaChmdW5jdGlvbiAoJGdhbGxlcnlJbWFnZSkge1xyXG4gICAgICAgICRnYWxsZXJ5SW1hZ2UuY3NzKHtcclxuICAgICAgICAgICAgXCJ6SW5kZXhcIjogMCxcclxuICAgICAgICAgICAgXCJvcGFjaXR5XCI6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICAkZ2FsbGVyeUltYWdlLnZlbG9jaXR5KFwic3RvcFwiKTsgLy8gU3RvcCBhbnkgYW5pbWF0aW9uc1xyXG4gICAgfSwgdGhpcyk7XHJcblxyXG4gICAgLy8gQ2FjaGUgcmVmZXJlbmNlcyB0byB0aGUgbGFzdCBhbmQgY3VycmVudCBpbWFnZSAmIHRodW1ibmFpbHNcclxuICAgIHZhciAkbGFzdFRodW1ibmFpbCA9IHRoaXMuXyR0aHVtYm5haWxzW3RoaXMuX2luZGV4XTtcclxuICAgIHZhciAkbGFzdEltYWdlID0gdGhpcy5fJGdhbGxlcnlJbWFnZXNbdGhpcy5faW5kZXhdO1xyXG4gICAgdGhpcy5faW5kZXggPSBpbmRleDtcclxuICAgIHZhciAkY3VycmVudFRodW1ibmFpbCA9IHRoaXMuXyR0aHVtYm5haWxzW3RoaXMuX2luZGV4XTtcclxuICAgIHZhciAkY3VycmVudEltYWdlID0gdGhpcy5fJGdhbGxlcnlJbWFnZXNbdGhpcy5faW5kZXhdO1xyXG5cclxuICAgIC8vIEFjdGl2YXRlL2RlYWN0aXZhdGUgdGh1bWJuYWlsc1xyXG4gICAgJGxhc3RUaHVtYm5haWwucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAkY3VycmVudFRodW1ibmFpbC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuXHJcbiAgICAvLyBNYWtlIHRoZSBsYXN0IGltYWdlIHZpc2lzYmxlIGFuZCB0aGVuIGFuaW1hdGUgdGhlIGN1cnJlbnQgaW1hZ2UgaW50byB2aWV3XHJcbiAgICAvLyBvbiB0b3Agb2YgdGhlIGxhc3RcclxuICAgICRsYXN0SW1hZ2UuY3NzKFwiekluZGV4XCIsIDEpO1xyXG4gICAgJGN1cnJlbnRJbWFnZS5jc3MoXCJ6SW5kZXhcIiwgMik7XHJcbiAgICAkbGFzdEltYWdlLmNzcyhcIm9wYWNpdHlcIiwgMSk7XHJcbiAgICAkY3VycmVudEltYWdlLnZlbG9jaXR5KHtcIm9wYWNpdHlcIjogMX0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXHJcbiAgICAgICAgXCJlYXNlSW5PdXRRdWFkXCIpO1xyXG5cclxuICAgIC8vIE9iamVjdCBpbWFnZSBmaXQgcG9seWZpbGwgYnJlYWtzIGpRdWVyeSBhdHRyKC4uLiksIHNvIGZhbGxiYWNrIHRvIGp1c3QgXHJcbiAgICAvLyB1c2luZyBlbGVtZW50LnNyY1xyXG4gICAgLy8gVE9ETzogTGF6eSFcclxuICAgIC8vIGlmICgkY3VycmVudEltYWdlLmdldCgwKS5zcmMgPT09IFwiXCIpIHtcclxuICAgIC8vICAgICAkY3VycmVudEltYWdlLmdldCgwKS5zcmMgPSAkY3VycmVudEltYWdlLmRhdGEoXCJpbWFnZS11cmxcIik7XHJcbiAgICAvLyB9XHJcbn07XHJcblxyXG5JbWFnZUdhbGxlcnkucHJvdG90eXBlLl9vbkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcbiAgICB2YXIgaW5kZXggPSAkdGFyZ2V0LmRhdGEoXCJpbmRleFwiKTtcclxuICAgIFxyXG4gICAgLy8gQ2xpY2tlZCBvbiB0aGUgYWN0aXZlIGltYWdlIC0gbm8gbmVlZCB0byBkbyBhbnl0aGluZ1xyXG4gICAgaWYgKHRoaXMuX2luZGV4ID09PSBpbmRleCkgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3N3aXRjaEFjdGl2ZUltYWdlKGluZGV4KTsgIFxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgTm9pc2VHZW5lcmF0b3IxRDogTm9pc2VHZW5lcmF0b3IxRCxcclxuICAgIE5vaXNlR2VuZXJhdG9yMkQ6IE5vaXNlR2VuZXJhdG9yMkRcclxufTtcclxuXHJcbnZhciB1dGlscyA9IHJlcXVpcmUoXCIuLi8uLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG4vLyAtLSAxRCBOb2lzZSBHZW5lcmF0b3IgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuLyoqXHJcbiAqIEEgdXRpbGl0eSBjbGFzcyBmb3IgZ2VuZXJhdGluZyBub2lzZSB2YWx1ZXNcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7b2JqZWN0fSBwICAgICAgICAgICAgICAgUmVmZXJlbmNlIHRvIGEgcDUgc2tldGNoXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWluPTBdICAgICAgICAgTWluaW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbbWF4PTFdICAgICAgICAgTWF4aW11bSB2YWx1ZSBmb3IgdGhlIG5vaXNlXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBbaW5jcmVtZW50PTAuMV0gU2NhbGUgb2YgdGhlIG5vaXNlLCB1c2VkIHdoZW4gdXBkYXRpbmdcclxuICogQHBhcmFtIHtudW1iZXJ9IFtvZmZzZXQ9cmFuZG9tXSBBIHZhbHVlIHVzZWQgdG8gZW5zdXJlIG11bHRpcGxlIG5vaXNlXHJcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdG9ycyBhcmUgcmV0dXJuaW5nIFwiaW5kZXBlbmRlbnRcIiB2YWx1ZXNcclxuICovXHJcbmZ1bmN0aW9uIE5vaXNlR2VuZXJhdG9yMUQocCwgbWluLCBtYXgsIGluY3JlbWVudCwgb2Zmc2V0KSB7XHJcbiAgICB0aGlzLl9wID0gcDtcclxuICAgIHRoaXMuX21pbiA9IHV0aWxzLmRlZmF1bHQobWluLCAwKTtcclxuICAgIHRoaXMuX21heCA9IHV0aWxzLmRlZmF1bHQobWF4LCAxKTtcclxuICAgIHRoaXMuX2luY3JlbWVudCA9IHV0aWxzLmRlZmF1bHQoaW5jcmVtZW50LCAwLjEpO1xyXG4gICAgdGhpcy5fcG9zaXRpb24gPSB1dGlscy5kZWZhdWx0KG9mZnNldCwgcC5yYW5kb20oLTEwMDAwMDAsIDEwMDAwMDApKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgbWluIGFuZCBtYXggbm9pc2UgdmFsdWVzXHJcbiAqIEBwYXJhbSAge251bWJlcn0gbWluIE1pbmltdW0gbm9pc2UgdmFsdWVcclxuICogQHBhcmFtICB7bnVtYmVyfSBtYXggTWF4aW11bSBub2lzZSB2YWx1ZVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IxRC5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKG1pbiwgbWF4KSB7XHJcbiAgICB0aGlzLl9taW4gPSB1dGlscy5kZWZhdWx0KG1pbiwgdGhpcy5fbWluKTtcclxuICAgIHRoaXMuX21heCA9IHV0aWxzLmRlZmF1bHQobWF4LCB0aGlzLl9tYXgpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgbm9pc2UgaW5jcmVtZW50IChlLmcuIHNjYWxlKVxyXG4gKiBAcGFyYW0gIHtudW1iZXJ9IGluY3JlbWVudCBOZXcgaW5jcmVtZW50IChzY2FsZSkgdmFsdWVcclxuICovXHJcbk5vaXNlR2VuZXJhdG9yMUQucHJvdG90eXBlLnNldEluY3JlbWVudCA9IGZ1bmN0aW9uIChpbmNyZW1lbnQpIHtcclxuICAgIHRoaXMuX2luY3JlbWVudCA9IHV0aWxzLmRlZmF1bHQoaW5jcmVtZW50LCB0aGlzLl9pbmNyZW1lbnQpO1xyXG59O1xyXG5cclxuLyoqIFxyXG4gKiBHZW5lcmF0ZSB0aGUgbmV4dCBub2lzZSB2YWx1ZVxyXG4gKiBAcmV0dXJuIHtudW1iZXJ9IEEgbm9pc3kgdmFsdWUgYmV0d2VlbiBvYmplY3QncyBtaW4gYW5kIG1heFxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IxRC5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl91cGRhdGUoKTtcclxuICAgIHZhciBuID0gdGhpcy5fcC5ub2lzZSh0aGlzLl9wb3NpdGlvbik7XHJcbiAgICBuID0gdGhpcy5fcC5tYXAobiwgMCwgMSwgdGhpcy5fbWluLCB0aGlzLl9tYXgpO1xyXG4gICAgcmV0dXJuIG47XHJcbn07XHJcblxyXG4vKipcclxuICogSW50ZXJuYWwgdXBkYXRlIG1ldGhvZCBmb3IgZ2VuZXJhdGluZyBuZXh0IG5vaXNlIHZhbHVlXHJcbiAqIEBwcml2YXRlXHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjFELnByb3RvdHlwZS5fdXBkYXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fcG9zaXRpb24gKz0gdGhpcy5faW5jcmVtZW50O1xyXG59O1xyXG5cclxuXHJcbi8vIC0tIDJEIE5vaXNlIEdlbmVyYXRvciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5mdW5jdGlvbiBOb2lzZUdlbmVyYXRvcjJEKHAsIHhNaW4sIHhNYXgsIHlNaW4sIHlNYXgsIHhJbmNyZW1lbnQsIHlJbmNyZW1lbnQsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHhPZmZzZXQsIHlPZmZzZXQpIHtcclxuICAgIHRoaXMuX3hOb2lzZSA9IG5ldyBOb2lzZUdlbmVyYXRvcjFEKHAsIHhNaW4sIHhNYXgsIHhJbmNyZW1lbnQsIHhPZmZzZXQpO1xyXG4gICAgdGhpcy5feU5vaXNlID0gbmV3IE5vaXNlR2VuZXJhdG9yMUQocCwgeU1pbiwgeU1heCwgeUluY3JlbWVudCwgeU9mZnNldCk7XHJcbiAgICB0aGlzLl9wID0gcDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFVwZGF0ZSB0aGUgbWluIGFuZCBtYXggbm9pc2UgdmFsdWVzXHJcbiAqIEBwYXJhbSAge29iamVjdH0gb3B0aW9ucyBPYmplY3Qgd2l0aCBib3VuZHMgdG8gYmUgdXBkYXRlZCBlLmcuIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgeyB4TWluOiAwLCB4TWF4OiAxLCB5TWluOiAtMSwgeU1heDogMSB9XHJcbiAqL1xyXG5Ob2lzZUdlbmVyYXRvcjJELnByb3RvdHlwZS5zZXRCb3VuZHMgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgaWYgKCFvcHRpb25zKSByZXR1cm47ICBcclxuICAgIHRoaXMuX3hOb2lzZS5zZXRCb3VuZHMob3B0aW9ucy54TWluLCBvcHRpb25zLnhNYXgpO1xyXG4gICAgdGhpcy5feU5vaXNlLnNldEJvdW5kcyhvcHRpb25zLnlNaW4sIG9wdGlvbnMueU1heCk7XHJcbn07XHJcblxyXG4vKipcclxuICogVXBkYXRlIHRoZSBpbmNyZW1lbnQgKGUuZy4gc2NhbGUpIGZvciB0aGUgbm9pc2UgZ2VuZXJhdG9yXHJcbiAqIEBwYXJhbSAge29iamVjdH0gb3B0aW9ucyBPYmplY3Qgd2l0aCBib3VuZHMgdG8gYmUgdXBkYXRlZCBlLmcuIFxyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgeyB4SW5jcmVtZW50OiAwLjA1LCB5SW5jcmVtZW50OiAwLjEgfVxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IyRC5wcm90b3R5cGUuc2V0Qm91bmRzID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgIGlmICghb3B0aW9ucykgcmV0dXJuO1xyXG4gICAgdGhpcy5feE5vaXNlLnNldEJvdW5kcyhvcHRpb25zLnhJbmNyZW1lbnQpO1xyXG4gICAgdGhpcy5feU5vaXNlLnNldEJvdW5kcyhvcHRpb25zLnlJbmNyZW1lbnQpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEdlbmVyYXRlIHRoZSBuZXh0IHBhaXIgb2Ygbm9pc2UgdmFsdWVzXHJcbiAqIEByZXR1cm4ge29iamVjdH0gT2JqZWN0IHdpdGggeCBhbmQgeSBwcm9wZXJ0aWVzIHRoYXQgY29udGFpbiB0aGUgbmV4dCBub2lzZVxyXG4gKiAgICAgICAgICAgICAgICAgIHZhbHVlcyBhbG9uZyBlYWNoIGRpbWVuc2lvblxyXG4gKi9cclxuTm9pc2VHZW5lcmF0b3IyRC5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IHRoaXMuX3hOb2lzZS5nZW5lcmF0ZSgpLFxyXG4gICAgICAgIHk6IHRoaXMuX3lOb2lzZS5nZW5lcmF0ZSgpXHJcbiAgICB9O1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gU2tldGNoO1xyXG5cclxudmFyIHV0aWxzID0gcmVxdWlyZShcIi4uL3V0aWxpdGllcy5qc1wiKTtcclxudmFyIE5vaXNlID0gcmVxdWlyZShcIi4vZ2VuZXJhdG9ycy9ub2lzZS1nZW5lcmF0b3JzLmpzXCIpO1xyXG52YXIgQmJveFRleHQgPSByZXF1aXJlKFwicDUtYmJveC1hbGlnbmVkLXRleHRcIik7XHJcblxyXG52YXIgcDtcclxudmFyIGZvbnRQYXRoID0gXCIuLi9mb250cy9iaWdfam9obi13ZWJmb250LnR0ZlwiO1xyXG5cclxuZnVuY3Rpb24gU2tldGNoKCRuYXYsICRuYXZMb2dvKSB7XHJcbiAgICB0aGlzLl8kbmF2ID0gJG5hdjtcclxuICAgIHRoaXMuXyRuYXZMb2dvID0gJG5hdkxvZ287XHJcbiAgICB0aGlzLl90ZXh0ID0gdGhpcy5fJG5hdkxvZ28udGV4dCgpO1xyXG5cclxuICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IHRydWU7XHJcbiAgICB0aGlzLl9pc01vdXNlT3ZlciA9IGZhbHNlO1xyXG5cclxuICAgIHRoaXMuX2ZvbnQgPSBudWxsO1xyXG4gICAgdGhpcy5fcCA9IG51bGw7XHJcbiAgICB0aGlzLl8kY2FudmFzID0gbnVsbDtcclxuICAgIHRoaXMuX3JvdGF0aW9uTm9pc2UgPSBudWxsOyBcclxuICAgIHRoaXMuX3h5Tm9pc2UgPSBudWxsO1xyXG4gICAgdGhpcy5fYmJveFRleHQgPSBudWxsO1xyXG5cclxuICAgIHRoaXMuX3VwZGF0ZVNpemUoKTtcclxuICAgIHRoaXMuX3VwZGF0ZUZvbnRTaXplKCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgKHJlbGF0aXZlIHBvc2l0aW9uZWQpIGNvbnRhaW5lciBmb3IgdGhlIHNrZXRjaCBpbnNpZGUgb2YgdGhlXHJcbiAgICAvLyBuYXYsIGJ1dCBtYWtlIHN1cmUgdGhhdCBpdCBpcyBCRUhJTkQgZXZlcnl0aGluZyBlbHNlLiBFdmVudHVhbGx5LCB3ZSB3aWxsXHJcbiAgICAvLyBkcm9wIGp1c3QgdGhlIG5hdiBsb2dvIChub3QgdGhlIG5hdiBsaW5rcyEpIGJlaGluZCB0aGUgY2FudmFzLlxyXG4gICAgdGhpcy5fJGNvbnRhaW5lciA9ICQoXCI8ZGl2PlwiKVxyXG4gICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICB0b3A6IFwiMHB4XCIsXHJcbiAgICAgICAgICAgIGxlZnQ6IFwiMHB4XCIsXHJcbiAgICAgICAgICAgIGN1cnNvcjogXCJwb2ludGVyXCIgLy8gTWFrZSBpdCBsb29rIGxpa2UgYSBsaW5rIDopXHJcbiAgICAgICAgfSlcclxuICAgICAgICAucHJlcGVuZFRvKHRoaXMuXyRuYXYpXHJcbiAgICAgICAgLmhpZGUoKTtcclxuXHJcbiAgICB0aGlzLl91cGRhdGVUZXh0T2Zmc2V0KCk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGEgcDUgaW5zdGFuY2VcclxuICAgIG5ldyBwNShmdW5jdGlvbihwKSB7XHJcbiAgICAgICAgdGhpcy5fcCA9IHA7XHJcbiAgICAgICAgcC5wcmVsb2FkID0gdGhpcy5fcHJlbG9hZC5iaW5kKHRoaXMsIHApO1xyXG4gICAgICAgIHAuc2V0dXAgPSB0aGlzLl9zZXR1cC5iaW5kKHRoaXMsIHApO1xyXG4gICAgICAgIHAuZHJhdyA9IHRoaXMuX2RyYXcuYmluZCh0aGlzLCBwKTtcclxuICAgIH0uYmluZCh0aGlzKSwgdGhpcy5fJGNvbnRhaW5lci5nZXQoMCkpO1xyXG59XHJcblxyXG5Ta2V0Y2gucHJvdG90eXBlLl91cGRhdGVUZXh0T2Zmc2V0ID0gZnVuY3Rpb24gKHApIHtcclxuICAgIC8vIEZpbmQgdGhlIGRpc3RhbmNlIGZyb20gdGhlIG5hdiB0byB0aGUgbG9nbydzIGJhc2VsaW5lXHJcbiAgICB2YXIgYmFzZWxpbmVEaXYgPSAkKFwiPGRpdj5cIilcclxuICAgICAgICAuY3NzKHtcclxuICAgICAgICAgICAgZGlzcGxheTogXCJpbmxpbmUtYmxvY2tcIixcclxuICAgICAgICAgICAgdmVydGljYWxBbGlnbjogXCJiYXNlbGluZVwiXHJcbiAgICAgICAgfSkucHJlcGVuZFRvKHRoaXMuXyRuYXZMb2dvKTtcclxuICAgIHZhciBuYXZPZmZzZXQgPSB0aGlzLl8kbmF2Lm9mZnNldCgpO1xyXG4gICAgdmFyIGxvZ29CYXNlbGluZU9mZnNldCA9IGJhc2VsaW5lRGl2Lm9mZnNldCgpO1xyXG4gICAgdGhpcy5fdGV4dE9mZnNldCA9IHtcclxuICAgICAgICB0b3A6IGxvZ29CYXNlbGluZU9mZnNldC50b3AgLSBuYXZPZmZzZXQudG9wLFxyXG4gICAgICAgIGxlZnQ6IGxvZ29CYXNlbGluZU9mZnNldC5sZWZ0IC0gbmF2T2Zmc2V0LmxlZnRcclxuICAgIH07XHJcbiAgICBiYXNlbGluZURpdi5yZW1vdmUoKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX3VwZGF0ZVNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl93aWR0aCA9IHRoaXMuXyRuYXYuaW5uZXJXaWR0aCgpO1xyXG4gICAgdGhpcy5faGVpZ2h0ID0gdGhpcy5fJG5hdi5pbm5lckhlaWdodCgpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fdXBkYXRlRm9udFNpemUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9mb250U2l6ZSA9IHRoaXMuXyRuYXZMb2dvLmNzcyhcImZvbnRTaXplXCIpLnJlcGxhY2UoXCJweFwiLCBcIlwiKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX29uUmVzaXplID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHRoaXMuX3VwZGF0ZVNpemUoKTtcclxuICAgIHRoaXMuX3VwZGF0ZUZvbnRTaXplKCk7XHJcbiAgICB0aGlzLl91cGRhdGVUZXh0T2Zmc2V0KCk7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRUZXh0KHRoaXMuX3RleHQpO1xyXG4gICAgdGhpcy5fYmJveFRleHQuc2V0VGV4dFNpemUodGhpcy5fZm9udFNpemUpO1xyXG4gICAgdGhpcy5fdGV4dE9mZnNldC50b3AgLT0gdGhpcy5fYmJveFRleHQuX2Rpc3RCYXNlVG9NaWQ7XHJcbiAgICB0aGlzLl90ZXh0T2Zmc2V0LmxlZnQgKz0gdGhpcy5fYmJveFRleHQuaGFsZldpZHRoO1xyXG4gICAgcC5yZXNpemVDYW52YXModGhpcy5fd2lkdGgsIHRoaXMuX2hlaWdodCk7ICAgIFxyXG4gICAgdGhpcy5fZHJhd1N0YXRpb25hcnlMb2dvKHApO1xyXG4gICAgdGhpcy5faXNGaXJzdEZyYW1lID0gdHJ1ZTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX3ByZWxvYWQgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgdGhpcy5fZm9udCA9IHAubG9hZEZvbnQoZm9udFBhdGgpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fc2V0TW91c2VPdmVyID0gZnVuY3Rpb24gKGlzTW91c2VPdmVyKSB7XHJcbiAgICB0aGlzLl9pc01vdXNlT3ZlciA9IGlzTW91c2VPdmVyO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fb25DbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICB0aGlzLl8kbmF2TG9nby50cmlnZ2VyKGUpO1xyXG59O1xyXG5cclxuU2tldGNoLnByb3RvdHlwZS5fZHJhd1N0YXRpb25hcnlMb2dvID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgcC5zdHJva2UoMjU1KTtcclxuICAgIHAuZmlsbChcIiMwQTAwMEFcIik7XHJcbiAgICBwLnN0cm9rZVdlaWdodCgyKTtcclxuICAgIHRoaXMuX2Jib3hUZXh0LnNldFJvdGF0aW9uKDApO1xyXG4gICAgdGhpcy5fYmJveFRleHQuZHJhdyh0aGlzLl90ZXh0T2Zmc2V0LmxlZnQsIHRoaXMuX3RleHRPZmZzZXQudG9wKTtcclxufTtcclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX3NldHVwID0gZnVuY3Rpb24gKHApIHtcclxuICAgIHZhciByZW5kZXJlciA9IHAuY3JlYXRlQ2FudmFzKHRoaXMuX3dpZHRoLCB0aGlzLl9oZWlnaHQpO1xyXG4gICAgdGhpcy5fJGNhbnZhcyA9ICQocmVuZGVyZXIuY2FudmFzKTtcclxuXHJcbiAgICAvLyBTaG93IHRoZSBjYW52YXMgYW5kIGhpZGUgdGhlIGxvZ28uIFVzaW5nIHNob3cvaGlkZSBvbiB0aGUgbG9nbyB3aWxsIGNhdXNlXHJcbiAgICAvLyBqUXVlcnkgdG8gbXVjayB3aXRoIHRoZSBwb3NpdGlvbmluZywgd2hpY2ggaXMgdXNlZCB0byBjYWxjdWxhdGUgd2hlcmUgdG9cclxuICAgIC8vIGRyYXcgdGhlIGNhbnZhcyB0ZXh0LiBJbnN0ZWFkLCBqdXN0IHB1c2ggdGhlIGxvZ28gYmVoaW5kIHRoZSBjYW52YXMuIFRoaXNcclxuICAgIC8vIGFsbG93cyBtYWtlcyBpdCBzbyB0aGUgY2FudmFzIGlzIHN0aWxsIGJlaGluZCB0aGUgbmF2IGxpbmtzLlxyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5zaG93KCk7XHJcbiAgICB0aGlzLl8kbmF2TG9nby5jc3MoXCJ6SW5kZXhcIiwgLTEpO1xyXG5cclxuICAgIC8vIFRoZXJlIGlzbid0IGEgZ29vZCB3YXkgdG8gY2hlY2sgd2hldGhlciB0aGUgc2tldGNoIGhhcyB0aGUgbW91c2Ugb3ZlclxyXG4gICAgLy8gaXQuIHAubW91c2VYICYgcC5tb3VzZVkgYXJlIGluaXRpYWxpemVkIHRvICgwLCAwKSwgYW5kIHAuZm9jdXNlZCBpc24ndCBcclxuICAgIC8vIGFsd2F5cyByZWxpYWJsZS5cclxuICAgIHRoaXMuXyRjYW52YXMub24oXCJtb3VzZW92ZXJcIiwgdGhpcy5fc2V0TW91c2VPdmVyLmJpbmQodGhpcywgdHJ1ZSkpO1xyXG4gICAgdGhpcy5fJGNhbnZhcy5vbihcIm1vdXNlb3V0XCIsIHRoaXMuX3NldE1vdXNlT3Zlci5iaW5kKHRoaXMsIGZhbHNlKSk7XHJcblxyXG4gICAgLy8gRm9yd2FyZCBtb3VzZSBjbGlja3MgdG8gdGhlIG5hdiBsb2dvXHJcbiAgICB0aGlzLl8kY2FudmFzLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBXaGVuIHRoZSB3aW5kb3cgaXMgcmVzaXplZCwgdGV4dCAmIGNhbnZhcyBzaXppbmcgYW5kIHBsYWNlbWVudCBuZWVkIHRvIGJlXHJcbiAgICAvLyByZWNhbGN1bGF0ZWQuIFRoZSBzaXRlIGlzIHJlc3BvbnNpdmUsIHNvIHRoZSBpbnRlcmFjdGl2ZSBjYW52YXMgc2hvdWxkIGJlXHJcbiAgICAvLyB0b28hIFxyXG4gICAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX29uUmVzaXplLmJpbmQodGhpcywgcCkpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBhIEJib3hBbGlnbmVkVGV4dCBpbnN0YW5jZSB0aGF0IHdpbGwgYmUgdXNlZCBmb3IgZHJhd2luZyBhbmQgXHJcbiAgICAvLyByb3RhdGluZyB0ZXh0XHJcbiAgICB0aGlzLl9iYm94VGV4dCA9IG5ldyBCYm94VGV4dCh0aGlzLl9mb250LCB0aGlzLl90ZXh0LCB0aGlzLl9mb250U2l6ZSwgcCk7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRBbmNob3IoQmJveFRleHQuQUxJR04uQk9YX0NFTlRFUixcclxuICAgICAgICBCYm94VGV4dC5CQVNFTElORS5CT1hfQ0VOVEVSKTtcclxuXHJcbiAgICAvLyBIYW5kbGUgdGhlIGluaXRpYWwgc2V0dXAgYnkgdHJpZ2dlcmluZyBhIHJlc2l6ZVxyXG4gICAgdGhpcy5fb25SZXNpemUocCk7XHJcblxyXG4gICAgLy8gU2V0IHVwIG5vaXNlIGdlbmVyYXRvcnNcclxuICAgIHRoaXMuX3JvdGF0aW9uTm9pc2UgPSBuZXcgTm9pc2UuTm9pc2VHZW5lcmF0b3IxRChwLCAtcC5QSS80LCBwLlBJLzQsIDAuMDIpOyBcclxuICAgIHRoaXMuX3h5Tm9pc2UgPSBuZXcgTm9pc2UuTm9pc2VHZW5lcmF0b3IyRChwLCAtMTAwLCAxMDAsIC01MCwgNTAsIDAuMDEsIFxyXG4gICAgICAgIDAuMDEpO1xyXG59O1xyXG5cclxuXHJcblNrZXRjaC5wcm90b3R5cGUuX2RyYXcgPSBmdW5jdGlvbiAocCkge1xyXG4gICAgaWYgKCF0aGlzLl9pc01vdXNlT3ZlcikgcmV0dXJuO1xyXG5cclxuICAgIC8vIFdoZW4gdGhlIHRleHQgaXMgYWJvdXQgdG8gYmVjb21lIGFjdGl2ZSBmb3IgdGhlIGZpcnN0IHRpbWUsIGNsZWFyXHJcbiAgICAvLyB0aGUgc3RhdGlvbmFyeSBsb2dvIHRoYXQgd2FzIHByZXZpb3VzbHkgZHJhd24uIFxyXG4gICAgaWYgKHRoaXMuX2lzRmlyc3RGcmFtZSkge1xyXG4gICAgICAgIHAuYmFja2dyb3VuZCgyNTUpO1xyXG4gICAgICAgIHRoaXMuX2lzRmlyc3RGcmFtZSA9IGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIENhbGN1bGF0ZSBwb3NpdGlvbiBhbmQgcm90YXRpb24gdG8gY3JlYXRlIGEgaml0dGVyeSBsb2dvXHJcbiAgICB2YXIgcm90YXRpb24gPSB0aGlzLl9yb3RhdGlvbk5vaXNlLmdlbmVyYXRlKCk7XHJcbiAgICB2YXIgeHlPZmZzZXQgPSB0aGlzLl94eU5vaXNlLmdlbmVyYXRlKCk7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5zZXRSb3RhdGlvbihyb3RhdGlvbik7XHJcbiAgICB0aGlzLl9iYm94VGV4dC5kcmF3KHRoaXMuX3RleHRPZmZzZXQubGVmdCArIHh5T2Zmc2V0LngsIFxyXG4gICAgICAgIHRoaXMuX3RleHRPZmZzZXQudG9wICsgeHlPZmZzZXQueSk7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBNYWluTmF2O1xyXG5cclxuZnVuY3Rpb24gTWFpbk5hdihsb2FkZXIpIHtcclxuICAgIHRoaXMuX2xvYWRlciA9IGxvYWRlcjtcclxuICAgIHRoaXMuXyRsb2dvID0gJChcIm5hdi5uYXZiYXIgLm5hdmJhci1icmFuZFwiKTtcclxuICAgIHRoaXMuXyRuYXYgPSAkKFwiI21haW4tbmF2XCIpO1xyXG4gICAgdGhpcy5fJG5hdkxpbmtzID0gdGhpcy5fJG5hdi5maW5kKFwiYVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXYgPSB0aGlzLl8kbmF2TGlua3MuZmluZChcIi5hY3RpdmVcIik7IFxyXG4gICAgdGhpcy5fJG5hdkxpbmtzLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25OYXZDbGljay5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuXyRsb2dvLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25Mb2dvQ2xpY2suYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbk1haW5OYXYucHJvdG90eXBlLnNldEFjdGl2ZUZyb21VcmwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9kZWFjdGl2YXRlKCk7XHJcbiAgICB2YXIgdXJsID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICBpZiAodXJsID09PSBcIi9pbmRleC5odG1sXCIgfHwgdXJsID09PSBcIi9cIikge1xyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlTGluayh0aGlzLl8kbmF2TGlua3MuZmlsdGVyKFwiI2Fib3V0LWxpbmtcIikpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodXJsID09PSBcIi93b3JrLmh0bWxcIikgeyAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVMaW5rKHRoaXMuXyRuYXZMaW5rcy5maWx0ZXIoXCIjd29yay1saW5rXCIpKTtcclxuICAgIH1cclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9kZWFjdGl2YXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuXyRhY3RpdmVOYXYubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdi5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2ID0gJCgpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX2FjdGl2YXRlTGluayA9IGZ1bmN0aW9uICgkbGluaykge1xyXG4gICAgJGxpbmsuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2ID0gJGxpbms7XHJcbn07XHJcblxyXG5NYWluTmF2LnByb3RvdHlwZS5fb25Mb2dvQ2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICB2YXIgdXJsID0gJHRhcmdldC5hdHRyKFwiaHJlZlwiKTtcclxuICAgIHRoaXMuX2xvYWRlci5sb2FkUGFnZSh1cmwsIHt9LCB0cnVlKTtcclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9vbk5hdkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHRoaXMuXyRuYXYuY29sbGFwc2UoXCJoaWRlXCIpOyAvLyBDbG9zZSB0aGUgbmF2IC0gb25seSBtYXR0ZXJzIG9uIG1vYmlsZVxyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICBpZiAoJHRhcmdldC5pcyh0aGlzLl8kYWN0aXZlTmF2KSkgcmV0dXJuO1xyXG4gICAgdGhpcy5fZGVhY3RpdmF0ZSgpO1xyXG4gICAgdGhpcy5fYWN0aXZhdGVMaW5rKCR0YXJnZXQpO1xyXG4gICAgdmFyIHVybCA9ICR0YXJnZXQuYXR0cihcImhyZWZcIik7XHJcbiAgICB0aGlzLl9sb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgdHJ1ZSk7ICAgIFxyXG59OyIsInZhciBMb2FkZXIgPSByZXF1aXJlKFwiLi9wYWdlLWxvYWRlci5qc1wiKTtcclxudmFyIE1haW5OYXYgPSByZXF1aXJlKFwiLi9tYWluLW5hdi5qc1wiKTtcclxudmFyIEhvdmVyU2xpZGVzaG93cyA9IHJlcXVpcmUoXCIuL2hvdmVyLXNsaWRlc2hvdy5qc1wiKTtcclxudmFyIFBvcnRmb2xpb0ZpbHRlciA9IHJlcXVpcmUoXCIuL3BvcnRmb2xpby1maWx0ZXIuanNcIik7XHJcbnZhciBJbWFnZUdhbGxlcmllcyA9IHJlcXVpcmUoXCIuL2ltYWdlLWdhbGxlcnkuanNcIik7XHJcbnZhciBTa2V0Y2ggPSByZXF1aXJlKFwiLi9pbnRlcmFjdGl2ZS1sb2dvcy9ub2lzeS13b3JkLmpzXCIpO1xyXG5cclxuLy8gQUpBWCBwYWdlIGxvYWRlciwgd2l0aCBjYWxsYmFjayBmb3IgcmVsb2FkaW5nIHdpZGdldHNcclxudmFyIGxvYWRlciA9IG5ldyBMb2FkZXIob25QYWdlTG9hZCk7XHJcblxyXG4vLyBNYWluIG5hdiB3aWRnZXRcclxudmFyIG1haW5OYXYgPSBuZXcgTWFpbk5hdihsb2FkZXIpO1xyXG5cclxuLy8gSW50ZXJhY3RpdmUgbG9nbyBpbiBuYXZiYXJcclxudmFyIG5hdiA9ICQoXCJuYXYubmF2YmFyXCIpO1xyXG52YXIgbmF2TG9nbyA9IG5hdi5maW5kKFwiLm5hdmJhci1icmFuZFwiKTtcclxudmFyIHNrZXRjaCA9IG5ldyBTa2V0Y2gobmF2LCBuYXZMb2dvKTtcclxuXHJcbi8vIFdpZGdldCBnbG9iYWxzXHJcbnZhciBob3ZlclNsaWRlc2hvd3MsIHBvcnRmb2xpb0ZpbHRlciwgaW1hZ2VHYWxsZXJpZXM7XHJcblxyXG4vLyBMb2FkIGFsbCB3aWRnZXRzXHJcbm9uUGFnZUxvYWQoKTtcclxuXHJcbi8vIEhhbmRsZSBiYWNrL2ZvcndhcmQgYnV0dG9uc1xyXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIG9uUG9wU3RhdGUpO1xyXG5cclxuZnVuY3Rpb24gb25Qb3BTdGF0ZShlKSB7XHJcbiAgICAvLyBMb2FkZXIgc3RvcmVzIGN1c3RvbSBkYXRhIGluIHRoZSBzdGF0ZSAtIGluY2x1ZGluZyB0aGUgdXJsIGFuZCB0aGUgcXVlcnlcclxuICAgIHZhciB1cmwgPSAoZS5zdGF0ZSAmJiBlLnN0YXRlLnVybCkgfHwgXCIvaW5kZXguaHRtbFwiO1xyXG4gICAgdmFyIHF1ZXJ5T2JqZWN0ID0gKGUuc3RhdGUgJiYgZS5zdGF0ZS5xdWVyeSkgfHwge307XHJcblxyXG4gICAgaWYgKCh1cmwgPT09IGxvYWRlci5nZXRMb2FkZWRQYXRoKCkpICYmICh1cmwgPT09IFwiL3dvcmsuaHRtbFwiKSkge1xyXG4gICAgICAgIC8vIFRoZSBjdXJyZW50ICYgcHJldmlvdXMgbG9hZGVkIHN0YXRlcyB3ZXJlIHdvcmsuaHRtbCwgc28ganVzdCByZWZpbHRlclxyXG4gICAgICAgIHZhciBjYXRlZ29yeSA9IHF1ZXJ5T2JqZWN0LmNhdGVnb3J5IHx8IFwiYWxsXCI7XHJcbiAgICAgICAgcG9ydGZvbGlvRmlsdGVyLnNlbGVjdENhdGVnb3J5KGNhdGVnb3J5KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gTG9hZCB0aGUgbmV3IHBhZ2VcclxuICAgICAgICBsb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgZmFsc2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBvblBhZ2VMb2FkKCkge1xyXG4gICAgLy8gUmVsb2FkIGFsbCBwbHVnaW5zL3dpZGdldHNcclxuICAgIGhvdmVyU2xpZGVzaG93cyA9IG5ldyBIb3ZlclNsaWRlc2hvd3MoKTtcclxuICAgIHBvcnRmb2xpb0ZpbHRlciA9IG5ldyBQb3J0Zm9saW9GaWx0ZXIobG9hZGVyKTtcclxuICAgIGltYWdlR2FsbGVyaWVzID0gbmV3IEltYWdlR2FsbGVyaWVzKCk7XHJcbiAgICBvYmplY3RGaXRJbWFnZXMoKTtcclxuICAgIHNtYXJ0cXVvdGVzKCk7XHJcblxyXG4gICAgLy8gU2xpZ2h0bHkgcmVkdW5kYW50LCBidXQgdXBkYXRlIHRoZSBtYWluIG5hdiB1c2luZyB0aGUgY3VycmVudCBVUkwuIFRoaXNcclxuICAgIC8vIGlzIGltcG9ydGFudCBpZiBhIHBhZ2UgaXMgbG9hZGVkIGJ5IHR5cGluZyBhIGZ1bGwgVVJMIChlLmcuIGdvaW5nXHJcbiAgICAvLyBkaXJlY3RseSB0byAvd29yay5odG1sKSBvciB3aGVuIG1vdmluZyBmcm9tIHdvcmsuaHRtbCB0byBhIHByb2plY3QuIFxyXG4gICAgbWFpbk5hdi5zZXRBY3RpdmVGcm9tVXJsKCk7XHJcbn1cclxuXHJcbi8vIFdlJ3ZlIGhpdCB0aGUgbGFuZGluZyBwYWdlLCBsb2FkIHRoZSBhYm91dCBwYWdlXHJcbi8vIGlmIChsb2NhdGlvbi5wYXRobmFtZS5tYXRjaCgvXihcXC98XFwvaW5kZXguaHRtbHxpbmRleC5odG1sKSQvKSkge1xyXG4vLyAgICAgbG9hZGVyLmxvYWRQYWdlKFwiL2Fib3V0Lmh0bWxcIiwge30sIGZhbHNlKTtcclxuLy8gfSIsIm1vZHVsZS5leHBvcnRzID0gTG9hZGVyO1xyXG5cclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIExvYWRlcihvblJlbG9hZCwgZmFkZUR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl8kY29udGVudCA9ICQoXCIjY29udGVudFwiKTtcclxuICAgIHRoaXMuX29uUmVsb2FkID0gb25SZWxvYWQ7XHJcbiAgICB0aGlzLl9mYWRlRHVyYXRpb24gPSAoZmFkZUR1cmF0aW9uICE9PSB1bmRlZmluZWQpID8gZmFkZUR1cmF0aW9uIDogMjUwO1xyXG4gICAgdGhpcy5fcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lO1xyXG59XHJcblxyXG5Mb2FkZXIucHJvdG90eXBlLmdldExvYWRlZFBhdGggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fcGF0aDtcclxufTtcclxuXHJcbkxvYWRlci5wcm90b3R5cGUubG9hZFBhZ2UgPSBmdW5jdGlvbiAodXJsLCBxdWVyeU9iamVjdCwgc2hvdWxkUHVzaEhpc3RvcnkpIHtcclxuICAgIC8vIEZhZGUgdGhlbiBlbXB0eSB0aGUgY3VycmVudCBjb250ZW50c1xyXG4gICAgdGhpcy5fJGNvbnRlbnQudmVsb2NpdHkoeyBvcGFjaXR5OiAwIH0sIHRoaXMuX2ZhZGVEdXJhdGlvbiwgXCJzd2luZ1wiLFxyXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl8kY29udGVudC5lbXB0eSgpO1xyXG4gICAgICAgIHRoaXMuXyRjb250ZW50LmxvYWQodXJsICsgXCIgI2NvbnRlbnRcIiwgb25Db250ZW50RmV0Y2hlZC5iaW5kKHRoaXMpKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gRmFkZSB0aGUgbmV3IGNvbnRlbnQgaW4gYWZ0ZXIgaXQgaGFzIGJlZW4gZmV0Y2hlZFxyXG4gICAgZnVuY3Rpb24gb25Db250ZW50RmV0Y2hlZChyZXNwb25zZVRleHQsIHRleHRTdGF0dXMsIGpxWGhyKSB7XHJcbiAgICAgICAgaWYgKHRleHRTdGF0dXMgPT09IFwiZXJyb3JcIikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRoZXJlIHdhcyBhIHByb2JsZW0gbG9hZGluZyB0aGUgcGFnZS5cIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBxdWVyeVN0cmluZyA9IHV0aWxpdGllcy5jcmVhdGVRdWVyeVN0cmluZyhxdWVyeU9iamVjdCk7XHJcbiAgICAgICAgaWYgKHNob3VsZFB1c2hIaXN0b3J5KSB7XHJcbiAgICAgICAgICAgIGhpc3RvcnkucHVzaFN0YXRlKHtcclxuICAgICAgICAgICAgICAgIHVybDogdXJsLFxyXG4gICAgICAgICAgICAgICAgcXVlcnk6IHF1ZXJ5T2JqZWN0XHJcbiAgICAgICAgICAgIH0sIG51bGwsIHVybCArIHF1ZXJ5U3RyaW5nKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuX3BhdGggPSBsb2NhdGlvbi5wYXRobmFtZTtcclxuICAgICAgICB0aGlzLl8kY29udGVudC52ZWxvY2l0eSh7IG9wYWNpdHk6IDEgfSwgdGhpcy5fZmFkZUR1cmF0aW9uLCBcclxuICAgICAgICAgICAgXCJzd2luZ1wiKTtcclxuICAgICAgICB0aGlzLl9vblJlbG9hZCgpO1xyXG4gICAgfVxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gUG9ydGZvbGlvRmlsdGVyO1xyXG5cclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbnZhciBkZWZhdWx0QnJlYWtwb2ludHMgPSBbXHJcbiAgICB7IHdpZHRoOiAxMjAwLCBjb2xzOiAzLCBzcGFjaW5nOiAxNSB9LFxyXG4gICAgeyB3aWR0aDogOTkyLCBjb2xzOiAzLCBzcGFjaW5nOiAxNSB9LFxyXG4gICAgeyB3aWR0aDogNzAwLCBjb2xzOiAzLCBzcGFjaW5nOiAxNSB9LFxyXG4gICAgeyB3aWR0aDogNjAwLCBjb2xzOiAyLCBzcGFjaW5nOiAxMCB9LFxyXG4gICAgeyB3aWR0aDogNDgwLCBjb2xzOiAyLCBzcGFjaW5nOiAxMCB9LFxyXG4gICAgeyB3aWR0aDogMzIwLCBjb2xzOiAxLCBzcGFjaW5nOiAxMCB9XHJcbl07XHJcblxyXG5mdW5jdGlvbiBQb3J0Zm9saW9GaWx0ZXIobG9hZGVyLCBicmVha3BvaW50cywgYXNwZWN0UmF0aW8sIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgdGhpcy5fbG9hZGVyID0gbG9hZGVyO1xyXG4gICAgdGhpcy5fZ3JpZFNwYWNpbmcgPSAwO1xyXG4gICAgdGhpcy5fYXNwZWN0UmF0aW8gPSAoYXNwZWN0UmF0aW8gIT09IHVuZGVmaW5lZCkgPyBhc3BlY3RSYXRpbyA6ICgxNi85KTtcclxuICAgIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9ICh0cmFuc2l0aW9uRHVyYXRpb24gIT09IHVuZGVmaW5lZCkgPyBcclxuICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb24gOiA4MDA7XHJcbiAgICB0aGlzLl9icmVha3BvaW50cyA9IChicmVha3BvaW50cyAhPT0gdW5kZWZpbmVkKSA/IFxyXG4gICAgICAgIGJyZWFrcG9pbnRzLnNsaWNlKCkgOiBkZWZhdWx0QnJlYWtwb2ludHMuc2xpY2UoKTtcclxuICAgIHRoaXMuXyRncmlkID0gJChcIiNwb3J0Zm9saW8tZ3JpZFwiKTtcclxuICAgIHRoaXMuXyRuYXYgPSAkKFwiI3BvcnRmb2xpby1uYXZcIik7XHJcbiAgICB0aGlzLl8kcHJvamVjdHMgPSBbXTtcclxuICAgIHRoaXMuXyRjYXRlZ29yaWVzID0ge307XHJcbiAgICB0aGlzLl9yb3dzID0gMDtcclxuICAgIHRoaXMuX2NvbHMgPSAwO1xyXG4gICAgdGhpcy5faW1hZ2VIZWlnaHQgPSAwO1xyXG4gICAgdGhpcy5faW1hZ2VXaWR0aCA9IDA7XHJcblxyXG4gICAgLy8gU29ydCB0aGUgYnJlYWtwb2ludHMgaW4gZGVzY2VuZGluZyBvcmRlclxyXG4gICAgdGhpcy5fYnJlYWtwb2ludHMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEud2lkdGggPCBiLndpZHRoKSByZXR1cm4gLTE7XHJcbiAgICAgICAgZWxzZSBpZiAoYS53aWR0aCA+IGIud2lkdGgpIHJldHVybiAxO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuIDA7XHJcbiAgICB9KTtcclxuXHJcbiAgICB0aGlzLl9jYWNoZVByb2plY3RzKCk7XHJcbiAgICB0aGlzLl9jcmVhdGVHcmlkKCk7XHJcblxyXG4gICAgdGhpcy5fJGdyaWQuZmluZChcIi5wcm9qZWN0IGFcIikub24oXCJjbGlja1wiLCB0aGlzLl9vblByb2plY3RDbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICB2YXIgcXMgPSB1dGlsaXRpZXMuZ2V0UXVlcnlQYXJhbWV0ZXJzKCk7XHJcbiAgICB2YXIgaW5pdGlhbENhdGVnb3J5ID0gcXMuY2F0ZWdvcnkgfHwgXCJhbGxcIjtcclxuICAgIHZhciBjYXRlZ29yeSA9IGluaXRpYWxDYXRlZ29yeS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0gPSB0aGlzLl8kbmF2LmZpbmQoXCJhW2RhdGEtY2F0ZWdvcnk9XCIgKyBjYXRlZ29yeSArIFwiXVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG4gICAgJChcIiNwb3J0Zm9saW8tbmF2IGFcIikub24oXCJjbGlja1wiLCB0aGlzLl9vbk5hdkNsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgICQod2luZG93KS5vbihcInJlc2l6ZVwiLCB0aGlzLl9jcmVhdGVHcmlkLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLnNlbGVjdENhdGVnb3J5ID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XHJcbiAgICBjYXRlZ29yeSA9IChjYXRlZ29yeSAmJiBjYXRlZ29yeS50b0xvd2VyQ2FzZSgpKSB8fCBcImFsbFwiO1xyXG4gICAgdmFyICRzZWxlY3RlZE5hdiA9IHRoaXMuXyRuYXYuZmluZChcImFbZGF0YS1jYXRlZ29yeT1cIiArIGNhdGVnb3J5ICsgXCJdXCIpO1xyXG4gICAgaWYgKCRzZWxlY3RlZE5hdi5sZW5ndGggJiYgISRzZWxlY3RlZE5hdi5pcyh0aGlzLl8kYWN0aXZlTmF2SXRlbSkpIHtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9ICRzZWxlY3RlZE5hdjtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLl9maWx0ZXJQcm9qZWN0cyhjYXRlZ29yeSk7XHJcbiAgICB9XHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9maWx0ZXJQcm9qZWN0cyA9IGZ1bmN0aW9uIChjYXRlZ29yeSkge1xyXG4gICAgdmFyICRzZWxlY3RlZEVsZW1lbnRzID0gdGhpcy5fZ2V0UHJvamVjdHNJbkNhdGVnb3J5KGNhdGVnb3J5KTtcclxuXHJcbiAgICAvLyBBbmltYXRlIHRoZSBncmlkIHRvIHRoZSBjb3JyZWN0IGhlaWdodCB0byBjb250YWluIHRoZSByb3dzXHJcbiAgICB0aGlzLl9hbmltYXRlR3JpZEhlaWdodCgkc2VsZWN0ZWRFbGVtZW50cy5sZW5ndGgpO1xyXG4gICAgXHJcbiAgICAvLyBMb29wIHRocm91Z2ggYWxsIHByb2plY3RzXHJcbiAgICB0aGlzLl8kcHJvamVjdHMuZm9yRWFjaChmdW5jdGlvbiAoJGVsZW1lbnQpIHtcclxuICAgICAgICAvLyBTdG9wIGFsbCBhbmltYXRpb25zXHJcbiAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoXCJzdG9wXCIpO1xyXG4gICAgICAgIC8vIElmIGFuIGVsZW1lbnQgaXMgbm90IHNlbGVjdGVkOiBkcm9wIHotaW5kZXggJiBhbmltYXRlIG9wYWNpdHkgLT4gaGlkZVxyXG4gICAgICAgIHZhciBzZWxlY3RlZEluZGV4ID0gJHNlbGVjdGVkRWxlbWVudHMuaW5kZXhPZigkZWxlbWVudCk7IFxyXG4gICAgICAgIGlmIChzZWxlY3RlZEluZGV4ID09PSAtMSkge1xyXG4gICAgICAgICAgICAkZWxlbWVudC5jc3MoXCJ6SW5kZXhcIiwgLTEpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC52ZWxvY2l0eSh7XHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICAgICAgICAgIH0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXCJlYXNlSW5PdXRDdWJpY1wiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5oaWRlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBJZiBhbiBlbGVtZW50IGlzIHNlbGVjdGVkOiBzaG93ICYgYnVtcCB6LWluZGV4ICYgYW5pbWF0ZSB0byBwb3NpdGlvbiBcclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgJGVsZW1lbnQuc2hvdygpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC5jc3MoXCJ6SW5kZXhcIiwgMCk7XHJcbiAgICAgICAgICAgIHZhciBuZXdQb3MgPSB0aGlzLl9pbmRleFRvWFkoc2VsZWN0ZWRJbmRleCk7XHJcbiAgICAgICAgICAgICRlbGVtZW50LnZlbG9jaXR5KHsgXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxLFxyXG4gICAgICAgICAgICAgICAgdG9wOiBuZXdQb3MueSArIFwicHhcIixcclxuICAgICAgICAgICAgICAgIGxlZnQ6IG5ld1Bvcy54ICsgXCJweFwiXHJcbiAgICAgICAgICAgIH0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fYW5pbWF0ZUdyaWRIZWlnaHQgPSBmdW5jdGlvbiAobnVtRWxlbWVudHMpIHtcclxuICAgIHRoaXMuXyRncmlkLnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgIHZhciBjdXJSb3dzID0gTWF0aC5jZWlsKG51bUVsZW1lbnRzIC8gdGhpcy5fY29scyk7XHJcbiAgICB0aGlzLl8kZ3JpZC52ZWxvY2l0eSh7XHJcbiAgICAgICAgaGVpZ2h0OiB0aGlzLl9pbWFnZUhlaWdodCAqIGN1clJvd3MgKyBcclxuICAgICAgICAgICAgdGhpcy5fZ3JpZFNwYWNpbmcgKiAoY3VyUm93cyAtIDEpICsgXCJweFwiXHJcbiAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24pO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZ2V0UHJvamVjdHNJbkNhdGVnb3J5ID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XHJcbiAgICBpZiAoY2F0ZWdvcnkgPT09IFwiYWxsXCIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fJHByb2plY3RzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XSB8fCBbXSk7XHJcbiAgICB9ICAgICAgICBcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhY2hlUHJvamVjdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl8kcHJvamVjdHMgPSBbXTtcclxuICAgIHRoaXMuXyRjYXRlZ29yaWVzID0ge307XHJcbiAgICB0aGlzLl8kZ3JpZC5maW5kKFwiLnByb2plY3RcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuXyRwcm9qZWN0cy5wdXNoKCRlbGVtZW50KTtcclxuICAgICAgICB2YXIgY2F0ZWdvcnlOYW1lcyA9ICRlbGVtZW50LmRhdGEoXCJjYXRlZ29yaWVzXCIpLnNwbGl0KFwiLFwiKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhdGVnb3J5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyIGNhdGVnb3J5ID0gJC50cmltKGNhdGVnb3J5TmFtZXNbaV0pLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl8kY2F0ZWdvcmllc1tjYXRlZ29yeV0gPSBbJGVsZW1lbnRdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldLnB1c2goJGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbi8vIFBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhbGN1bGF0ZUdyaWQgPSBmdW5jdGlvbiAoKSB7XHJcbi8vICAgICB2YXIgZ3JpZFdpZHRoID0gdGhpcy5fJGdyaWQuaW5uZXJXaWR0aCgpO1xyXG4vLyAgICAgdGhpcy5fY29scyA9IE1hdGguZmxvb3IoKGdyaWRXaWR0aCArIHRoaXMuX2dyaWRTcGFjaW5nKSAvIFxyXG4vLyAgICAgICAgICh0aGlzLl9taW5JbWFnZVdpZHRoICsgdGhpcy5fZ3JpZFNwYWNpbmcpKTtcclxuLy8gICAgIHRoaXMuX3Jvd3MgPSBNYXRoLmNlaWwodGhpcy5fJHByb2plY3RzLmxlbmd0aCAvIHRoaXMuX2NvbHMpO1xyXG4vLyAgICAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAoKHRoaXMuX2NvbHMgLSAxKSAqIHRoaXMuX2dyaWRTcGFjaW5nKSkgLyBcclxuLy8gICAgICAgICB0aGlzLl9jb2xzO1xyXG4vLyAgICAgdGhpcy5faW1hZ2VIZWlnaHQgPSB0aGlzLl9pbWFnZVdpZHRoICogKDEgLyB0aGlzLl9hc3BlY3RSYXRpbyk7XHJcbi8vIH07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jYWxjdWxhdGVHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGdyaWRXaWR0aCA9IHRoaXMuXyRncmlkLmlubmVyV2lkdGgoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYnJlYWtwb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAoZ3JpZFdpZHRoIDw9IHRoaXMuX2JyZWFrcG9pbnRzW2ldLndpZHRoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbHMgPSB0aGlzLl9icmVha3BvaW50c1tpXS5jb2xzO1xyXG4gICAgICAgICAgICB0aGlzLl9ncmlkU3BhY2luZyA9IHRoaXMuX2JyZWFrcG9pbnRzW2ldLnNwYWNpbmc7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuX3Jvd3MgPSBNYXRoLmNlaWwodGhpcy5fJHByb2plY3RzLmxlbmd0aCAvIHRoaXMuX2NvbHMpO1xyXG4gICAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAoKHRoaXMuX2NvbHMgLSAxKSAqIHRoaXMuX2dyaWRTcGFjaW5nKSkgLyBcclxuICAgICAgICB0aGlzLl9jb2xzO1xyXG4gICAgdGhpcy5faW1hZ2VIZWlnaHQgPSB0aGlzLl9pbWFnZVdpZHRoICogKDEgLyB0aGlzLl9hc3BlY3RSYXRpbyk7XHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jcmVhdGVHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlR3JpZCgpO1xyXG5cclxuICAgIHRoaXMuXyRncmlkLmNzcyhcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XHJcbiAgICB0aGlzLl8kZ3JpZC5jc3Moe1xyXG4gICAgICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKiB0aGlzLl9yb3dzICsgXHJcbiAgICAgICAgICAgIHRoaXMuX2dyaWRTcGFjaW5nICogKHRoaXMuX3Jvd3MgLSAxKSArIFwicHhcIlxyXG4gICAgfSk7ICAgIFxyXG5cclxuICAgIHRoaXMuXyRwcm9qZWN0cy5mb3JFYWNoKGZ1bmN0aW9uICgkZWxlbWVudCwgaW5kZXgpIHtcclxuICAgICAgICB2YXIgcG9zID0gdGhpcy5faW5kZXhUb1hZKGluZGV4KTtcclxuICAgICAgICAkZWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICB0b3A6IHBvcy55ICsgXCJweFwiLFxyXG4gICAgICAgICAgICBsZWZ0OiBwb3MueCArIFwicHhcIixcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuX2ltYWdlV2lkdGggKyBcInB4XCIsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKyBcInB4XCJcclxuICAgICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7ICAgIFxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fb25OYXZDbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xyXG4gICAgaWYgKCR0YXJnZXQuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSByZXR1cm47XHJcbiAgICBpZiAodGhpcy5fJGFjdGl2ZU5hdkl0ZW0ubGVuZ3RoKSB0aGlzLl8kYWN0aXZlTmF2SXRlbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9ICR0YXJnZXQ7XHJcbiAgICB2YXIgY2F0ZWdvcnkgPSAkdGFyZ2V0LmRhdGEoXCJjYXRlZ29yeVwiKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgIGhpc3RvcnkucHVzaFN0YXRlKHtcclxuICAgICAgICB1cmw6IFwiL3dvcmsuaHRtbFwiLFxyXG4gICAgICAgIHF1ZXJ5OiB7IGNhdGVnb3J5OiBjYXRlZ29yeSB9XHJcbiAgICB9LCBudWxsLCBcIi93b3JrLmh0bWw/Y2F0ZWdvcnk9XCIgKyBjYXRlZ29yeSk7XHJcblxyXG4gICAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fb25Qcm9qZWN0Q2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgdmFyICR0YXJnZXQgPSAkKGUuY3VycmVudFRhcmdldCk7XHJcbiAgICB2YXIgcHJvamVjdE5hbWUgPSAkdGFyZ2V0LmRhdGEoXCJuYW1lXCIpO1xyXG4gICAgdmFyIHVybCA9IFwiL3Byb2plY3RzL1wiICsgcHJvamVjdE5hbWUgKyBcIi5odG1sXCI7XHJcbiAgICB0aGlzLl9sb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgdHJ1ZSk7XHJcbn07XHJcblxyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5faW5kZXhUb1hZID0gZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICB2YXIgciA9IE1hdGguZmxvb3IoaW5kZXggLyB0aGlzLl9jb2xzKTtcclxuICAgIHZhciBjID0gaW5kZXggJSB0aGlzLl9jb2xzOyBcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogYyAqIHRoaXMuX2ltYWdlV2lkdGggKyBjICogdGhpcy5fZ3JpZFNwYWNpbmcsXHJcbiAgICAgICAgeTogciAqIHRoaXMuX2ltYWdlSGVpZ2h0ICsgciAqIHRoaXMuX2dyaWRTcGFjaW5nXHJcbiAgICB9O1xyXG59OyIsImV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uICh2YWwsIGRlZmF1bHRWYWwpIHtcclxuICAgIHJldHVybiAodmFsICE9PSB1bmRlZmluZWQpID8gdmFsIDogZGVmYXVsdFZhbDtcclxufTtcclxuXHJcbi8vIFVudGVzdGVkXHJcbi8vIGV4cG9ydHMuZGVmYXVsdFByb3BlcnRpZXMgPSBmdW5jdGlvbiBkZWZhdWx0UHJvcGVydGllcyAob2JqLCBwcm9wcykge1xyXG4vLyAgICAgZm9yICh2YXIgcHJvcCBpbiBwcm9wcykge1xyXG4vLyAgICAgICAgIGlmIChwcm9wcy5oYXNPd25Qcm9wZXJ0eShwcm9wcywgcHJvcCkpIHtcclxuLy8gICAgICAgICAgICAgdmFyIHZhbHVlID0gZXhwb3J0cy5kZWZhdWx0VmFsdWUocHJvcHMudmFsdWUsIHByb3BzLmRlZmF1bHQpO1xyXG4vLyAgICAgICAgICAgICBvYmpbcHJvcF0gPSB2YWx1ZTtcclxuLy8gICAgICAgICB9XHJcbi8vICAgICB9XHJcbi8vICAgICByZXR1cm4gb2JqO1xyXG4vLyB9O1xyXG5cclxuZXhwb3J0cy5nZXRRdWVyeVBhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAvLyBDaGVjayBmb3IgcXVlcnkgc3RyaW5nXHJcbiAgICBxcyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XHJcbiAgICBpZiAocXMubGVuZ3RoIDw9IDEpIHJldHVybiB7fTtcclxuICAgIC8vIFF1ZXJ5IHN0cmluZyBleGlzdHMsIHBhcnNlIGl0IGludG8gYSBxdWVyeSBvYmplY3RcclxuICAgIHFzID0gcXMuc3Vic3RyaW5nKDEpOyAvLyBSZW1vdmUgdGhlIFwiP1wiIGRlbGltaXRlclxyXG4gICAgdmFyIGtleVZhbFBhaXJzID0gcXMuc3BsaXQoXCImXCIpO1xyXG4gICAgdmFyIHF1ZXJ5T2JqZWN0ID0ge307XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleVZhbFBhaXJzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIGtleVZhbCA9IGtleVZhbFBhaXJzW2ldLnNwbGl0KFwiPVwiKTtcclxuICAgICAgICBpZiAoa2V5VmFsLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICB2YXIga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleVZhbFswXSk7XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5VmFsWzFdKTtcclxuICAgICAgICAgICAgcXVlcnlPYmplY3Rba2V5XSA9IHZhbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcXVlcnlPYmplY3Q7XHJcbn07XHJcblxyXG5leHBvcnRzLmNyZWF0ZVF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24gKHF1ZXJ5T2JqZWN0KSB7XHJcbiAgICBpZiAodHlwZW9mIHF1ZXJ5T2JqZWN0ICE9PSBcIm9iamVjdFwiKSByZXR1cm4gXCJcIjtcclxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocXVlcnlPYmplY3QpO1xyXG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcclxuICAgIHZhciBxdWVyeVN0cmluZyA9IFwiP1wiO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XHJcbiAgICAgICAgdmFyIHZhbCA9IHF1ZXJ5T2JqZWN0W2tleV07XHJcbiAgICAgICAgcXVlcnlTdHJpbmcgKz0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpO1xyXG4gICAgICAgIGlmIChpICE9PSBrZXlzLmxlbmd0aCAtIDEpIHF1ZXJ5U3RyaW5nICs9IFwiJlwiO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xyXG59O1xyXG5cclxuZXhwb3J0cy53cmFwSW5kZXggPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xyXG4gICAgdmFyIHdyYXBwZWRJbmRleCA9IChpbmRleCAlIGxlbmd0aCk7IFxyXG4gICAgaWYgKHdyYXBwZWRJbmRleCA8IDApIHtcclxuICAgICAgICAvLyBJZiBuZWdhdGl2ZSwgZmxpcCB0aGUgaW5kZXggc28gdGhhdCAtMSBiZWNvbWVzIHRoZSBsYXN0IGl0ZW0gaW4gbGlzdCBcclxuICAgICAgICB3cmFwcGVkSW5kZXggPSBsZW5ndGggKyB3cmFwcGVkSW5kZXg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gd3JhcHBlZEluZGV4O1xyXG59O1xyXG4iXX0=
