(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

    // Move the image from 2 steps ago down to the bottom z-index and make
    // it invisible
    if (this._numImages >= 3) {
        var i = utilities.wrapIndex(this._imageIndex - 2, this._numImages);
        this._$images[i].css({
            zIndex: 0,
            opacity: 0
        });
        this._$images[i].stop();
    }

    // Move the image from 1 steps ago down to the middle z-index and make
    // it completely visible
    if (this._numImages >= 2) {
        var i = utilities.wrapIndex(this._imageIndex - 1, this._numImages);
        this._$images[i].css({
            zIndex: 1,
            opacity: 1
        });
        this._$images[i].stop();
    }

    // Move the current image to the top z-index and fade it in
    this._imageIndex = utilities.wrapIndex(this._imageIndex, this._numImages);
    this._$images[this._imageIndex].css({
        zIndex: 2,
        opacity: 0
    });
    this._$images[this._imageIndex].animate({
        opacity: 1
    }, this._transitionDuration, "easeInOutQuad");

    // Schedule next transition
    this._timeoutId = setTimeout(this._advanceSlideshow.bind(this), 
        this._slideshowDelay);
};
},{"./utilities.js":7}],2:[function(require,module,exports){
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
        $galleryImage.stop(); // Stop any animations
    }, this)

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
    $currentImage.animate({"opacity": 1}, this._transitionDuration, 
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
},{"./utilities.js":7}],3:[function(require,module,exports){
module.exports = MainNav;

function MainNav(loader) {
    this._loader = loader;
    this._$nav = $("#main-nav");
    this._$navLinks = this._$nav.find("a");
    this._$activeNav = this._$navLinks.find(".active"); 
    this._$navLinks.on("click", this._onNavClick.bind(this));
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
    };
};

MainNav.prototype._activateLink = function ($link) {
    $link.addClass("active");
    this._$activeNav = $link;
};

MainNav.prototype._onNavClick = function (e) {
    e.preventDefault();

    // Close the nav. This only matters if we are on mobile
    this._$nav.collapse("hide");

    var $target = $(e.currentTarget);
    if ($target.is(this._$activeNav)) return;

    this._deactivate();
    this._activateLink($target);

    var url = $target.attr("href");
    this._loader.loadPage(url, {}, true);    
};
},{}],4:[function(require,module,exports){
var Loader = require("./page-loader.js");
var MainNav = require("./main-nav.js");
var HoverSlideshows = require("./hover-slideshow.js");
var PortfolioFilter = require("./portfolio-filter.js");
var ImageGalleries = require("./image-gallery.js");

// AJAX page loader, with callback for reloading widgets
var loader = new Loader(onPageLoad);

// Main nav widget
var mainNav = new MainNav(loader);

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
},{"./hover-slideshow.js":1,"./image-gallery.js":2,"./main-nav.js":3,"./page-loader.js":5,"./portfolio-filter.js":6}],5:[function(require,module,exports){
module.exports = Loader;

var utilities = require("./utilities.js");

function Loader(onReload, fadeDuration) {
    this._$content = $("#content");
    this._onReload = onReload;
    this._fadeDuration = (fadeDuration !== undefined) ? fadeDuration : 200;
    this._path = location.pathname;
}

Loader.prototype.getLoadedPath = function () {
    return this._path;
};

Loader.prototype.loadPage = function (url, queryObject, shouldPushHistory) {
    // Fade then empty the current contents
    this._$content.fadeOut(this._fadeDuration, function () {
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
        this._$content.fadeIn(this._fadeDuration);
        this._onReload();
    }
};
},{"./utilities.js":7}],6:[function(require,module,exports){
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
        $element.stop();
        // If an element is not selected: drop z-index & animate opacity -> hide
        var selectedIndex = $selectedElements.indexOf($element); 
        if (selectedIndex === -1) {
            $element.css("zIndex", -1);
            $element.animate({
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
            $element.animate({ 
                opacity: 1,
                top: newPos.y + "px",
                left: newPos.x + "px"
            }, this._transitionDuration, "easeInOutCubic");
        }
    }.bind(this));
}

PortfolioFilter.prototype._animateGridHeight = function (numElements) {
    this._$grid.stop();
    var curRows = Math.ceil(numElements / this._cols);
    this._$grid.animate({
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
}

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
}

PortfolioFilter.prototype._onProjectClick = function (e) {
    e.preventDefault();
    var $target = $(e.currentTarget);
    var projectName = $target.data("name");
    var url = "/projects/" + projectName + ".html";
    this._loader.loadPage(url, {}, true);
}


PortfolioFilter.prototype._indexToXY = function (index) {
    var r = Math.floor(index / this._cols);
    var c = index % this._cols; 
    return {
        x: c * this._imageWidth + c * this._gridSpacing,
        y: r * this._imageHeight + r * this._gridSpacing
    };
}
},{"./utilities.js":7}],7:[function(require,module,exports){
module.exports.getQueryParameters = function () {
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

module.exports.createQueryString = function (queryObject) {
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

module.exports.wrapIndex = function (index, length) {
    var wrappedIndex = (index % length); 
    if (wrappedIndex < 0) {
        // If negative, flip the index so that -1 becomes the last item in list 
        wrappedIndex = length + wrappedIndex;
    }
    return wrappedIndex;
};

},{}]},{},[4])


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaG92ZXItc2xpZGVzaG93LmpzIiwic3JjL2pzL2ltYWdlLWdhbGxlcnkuanMiLCJzcmMvanMvbWFpbi1uYXYuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9wYWdlLWxvYWRlci5qcyIsInNyYy9qcy9wb3J0Zm9saW8tZmlsdGVyLmpzIiwic3JjL2pzL3V0aWxpdGllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIvc291cmNlLyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBIb3ZlclNsaWRlc2hvd3M7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gSG92ZXJTbGlkZXNob3dzKHNsaWRlc2hvd0RlbGF5LCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRoaXMuX3NsaWRlc2hvd0RlbGF5ID0gKHNsaWRlc2hvd0RlbGF5ICE9PSB1bmRlZmluZWQpID8gc2xpZGVzaG93RGVsYXkgOiBcclxuICAgICAgICAyMDAwO1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gKHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSA/IFxyXG4gICAgICAgIF90cmFuc2l0aW9uRHVyYXRpb24gOiAxMDAwOyAgIFxyXG5cclxuICAgIHRoaXMuX3NsaWRlc2hvd3MgPSBbXTtcclxuICAgIHRoaXMucmVsb2FkKCk7XHJcbn1cclxuXHJcbkhvdmVyU2xpZGVzaG93cy5wcm90b3R5cGUucmVsb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gTm90ZTogdGhpcyBpcyBjdXJyZW50bHkgbm90IHJlYWxseSBiZWluZyB1c2VkLiBXaGVuIGEgcGFnZSBpcyBsb2FkZWQsXHJcbiAgICAvLyBtYWluLmpzIGlzIGp1c3QgcmUtaW5zdGFuY2luZyB0aGUgSG92ZXJTbGlkZXNob3dzXHJcbiAgICB2YXIgb2xkU2xpZGVzaG93cyA9IHRoaXMuX3NsaWRlc2hvd3MgfHwgW107XHJcbiAgICB0aGlzLl9zbGlkZXNob3dzID0gW107XHJcbiAgICAkKFwiLmhvdmVyLXNsaWRlc2hvd1wiKS5lYWNoKGZ1bmN0aW9uIChfLCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcclxuICAgICAgICB2YXIgaW5kZXggPSB0aGlzLl9maW5kSW5TbGlkZXNob3dzKGVsZW1lbnQsIG9sZFNsaWRlc2hvd3MpO1xyXG4gICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICAgICAgdmFyIHNsaWRlc2hvdyA9IG9sZFNsaWRlc2hvd3Muc3BsaWNlKGluZGV4LCAxKVswXTtcclxuICAgICAgICAgICAgdGhpcy5fc2xpZGVzaG93cy5wdXNoKHNsaWRlc2hvdyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fc2xpZGVzaG93cy5wdXNoKG5ldyBTbGlkZXNob3coJGVsZW1lbnQsIHRoaXMuX3NsaWRlc2hvd0RlbGF5LFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbkhvdmVyU2xpZGVzaG93cy5wcm90b3R5cGUuX2ZpbmRJblNsaWRlc2hvd3MgPSBmdW5jdGlvbiAoZWxlbWVudCwgc2xpZGVzaG93cykge1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGlkZXNob3dzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKGVsZW1lbnQgPT09IHNsaWRlc2hvd3NbaV0uZ2V0RWxlbWVudCgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiAtMTtcclxufTtcclxuXHJcbmZ1bmN0aW9uIFNsaWRlc2hvdygkY29udGFpbmVyLCBzbGlkZXNob3dEZWxheSwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICAgIHRoaXMuX3NsaWRlc2hvd0RlbGF5ID0gc2xpZGVzaG93RGVsYXk7XHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb247XHJcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBudWxsO1xyXG4gICAgdGhpcy5faW1hZ2VJbmRleCA9IDA7XHJcbiAgICB0aGlzLl8kaW1hZ2VzID0gW107XHJcblxyXG4gICAgLy8gU2V0IHVwIGFuZCBjYWNoZSByZWZlcmVuY2VzIHRvIGltYWdlc1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5maW5kKFwiaW1nXCIpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRpbWFnZSA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgJGltYWdlLmNzcyh7XHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgICAgICAgIHRvcDogXCIwXCIsXHJcbiAgICAgICAgICAgIGxlZnQ6IFwiMFwiLFxyXG4gICAgICAgICAgICB6SW5kZXg6IChpbmRleCA9PT0gMCkgPyAyIDogMCAvLyBGaXJzdCBpbWFnZSBzaG91bGQgYmUgb24gdG9wXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlcy5wdXNoKCRpbWFnZSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIERldGVybWluZSB3aGV0aGVyIHRvIGJpbmQgaW50ZXJhY3Rpdml0eVxyXG4gICAgdGhpcy5fbnVtSW1hZ2VzID0gdGhpcy5fJGltYWdlcy5sZW5ndGg7XHJcbiAgICBpZiAodGhpcy5fbnVtSW1hZ2VzIDw9IDEpIHJldHVybjtcclxuXHJcbiAgICAvLyBCaW5kIGV2ZW50IGxpc3RlbmVyc1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lci5vbihcIm1vdXNlZW50ZXJcIiwgdGhpcy5fb25FbnRlci5iaW5kKHRoaXMpKTtcclxuICAgIHRoaXMuXyRjb250YWluZXIub24oXCJtb3VzZWxlYXZlXCIsIHRoaXMuX29uTGVhdmUuYmluZCh0aGlzKSk7XHJcblxyXG59XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldEVsZW1lbnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5fJGNvbnRhaW5lci5nZXQoMCk7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLmdldCRFbGVtZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuXyRjb250YWluZXI7XHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLl9vbkVudGVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gRmlyc3QgdHJhbnNpdGlvbiBzaG91bGQgaGFwcGVuIHByZXR0eSBzb29uIGFmdGVyIGhvdmVyaW5nIGluIG9yZGVyXHJcbiAgICAvLyB0byBjbHVlIHRoZSB1c2VyIGludG8gd2hhdCBpcyBoYXBwZW5pbmdcclxuICAgIHRoaXMuX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fYWR2YW5jZVNsaWRlc2hvdy5iaW5kKHRoaXMpLCA1MDApO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fb25MZWF2ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fdGltZW91dElkKTsgIFxyXG4gICAgdGhpcy5fdGltZW91dElkID0gbnVsbDsgICAgICBcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX2FkdmFuY2VTbGlkZXNob3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9pbWFnZUluZGV4ICs9IDE7XHJcblxyXG4gICAgLy8gTW92ZSB0aGUgaW1hZ2UgZnJvbSAyIHN0ZXBzIGFnbyBkb3duIHRvIHRoZSBib3R0b20gei1pbmRleCBhbmQgbWFrZVxyXG4gICAgLy8gaXQgaW52aXNpYmxlXHJcbiAgICBpZiAodGhpcy5fbnVtSW1hZ2VzID49IDMpIHtcclxuICAgICAgICB2YXIgaSA9IHV0aWxpdGllcy53cmFwSW5kZXgodGhpcy5faW1hZ2VJbmRleCAtIDIsIHRoaXMuX251bUltYWdlcyk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlc1tpXS5jc3Moe1xyXG4gICAgICAgICAgICB6SW5kZXg6IDAsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDBcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VzW2ldLnN0b3AoKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBNb3ZlIHRoZSBpbWFnZSBmcm9tIDEgc3RlcHMgYWdvIGRvd24gdG8gdGhlIG1pZGRsZSB6LWluZGV4IGFuZCBtYWtlXHJcbiAgICAvLyBpdCBjb21wbGV0ZWx5IHZpc2libGVcclxuICAgIGlmICh0aGlzLl9udW1JbWFnZXMgPj0gMikge1xyXG4gICAgICAgIHZhciBpID0gdXRpbGl0aWVzLndyYXBJbmRleCh0aGlzLl9pbWFnZUluZGV4IC0gMSwgdGhpcy5fbnVtSW1hZ2VzKTtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VzW2ldLmNzcyh7XHJcbiAgICAgICAgICAgIHpJbmRleDogMSxcclxuICAgICAgICAgICAgb3BhY2l0eTogMVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXNbaV0uc3RvcCgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE1vdmUgdGhlIGN1cnJlbnQgaW1hZ2UgdG8gdGhlIHRvcCB6LWluZGV4IGFuZCBmYWRlIGl0IGluXHJcbiAgICB0aGlzLl9pbWFnZUluZGV4ID0gdXRpbGl0aWVzLndyYXBJbmRleCh0aGlzLl9pbWFnZUluZGV4LCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gICAgdGhpcy5fJGltYWdlc1t0aGlzLl9pbWFnZUluZGV4XS5jc3Moe1xyXG4gICAgICAgIHpJbmRleDogMixcclxuICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICB9KTtcclxuICAgIHRoaXMuXyRpbWFnZXNbdGhpcy5faW1hZ2VJbmRleF0uYW5pbWF0ZSh7XHJcbiAgICAgICAgb3BhY2l0eTogMVxyXG4gICAgfSwgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uLCBcImVhc2VJbk91dFF1YWRcIik7XHJcblxyXG4gICAgLy8gU2NoZWR1bGUgbmV4dCB0cmFuc2l0aW9uXHJcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2FkdmFuY2VTbGlkZXNob3cuYmluZCh0aGlzKSwgXHJcbiAgICAgICAgdGhpcy5fc2xpZGVzaG93RGVsYXkpO1xyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gSW1hZ2VHYWxsZXJpZXM7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxuZnVuY3Rpb24gSW1hZ2VHYWxsZXJpZXModHJhbnNpdGlvbkR1cmF0aW9uKSB7IFxyXG4gICAgdHJhbnNpdGlvbkR1cmF0aW9uID0gKHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSA/XHJcbiAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uIDogNDAwO1xyXG4gICAgdGhpcy5faW1hZ2VHYWxsZXJpZXMgPSBbXTtcclxuICAgICQoXCIuaW1hZ2UtZ2FsbGVyeVwiKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciBnYWxsZXJ5ID0gbmV3IEltYWdlR2FsbGVyeSgkKGVsZW1lbnQpLCB0cmFuc2l0aW9uRHVyYXRpb24pO1xyXG4gICAgICAgIHRoaXMuX2ltYWdlR2FsbGVyaWVzLnB1c2goZ2FsbGVyeSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBJbWFnZUdhbGxlcnkoJGNvbnRhaW5lciwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSB0cmFuc2l0aW9uRHVyYXRpb247XHJcbiAgICB0aGlzLl8kY29udGFpbmVyID0gJGNvbnRhaW5lcjtcclxuICAgIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIgPSAkY29udGFpbmVyLmZpbmQoXCIuaW1hZ2UtZ2FsbGVyeS10aHVtYm5haWxzXCIpO1xyXG4gICAgdGhpcy5faW5kZXggPSAwOyAvLyBJbmRleCBvZiBzZWxlY3RlZCBpbWFnZVxyXG5cclxuICAgIC8vIExvb3AgdGhyb3VnaCB0aGUgdGh1bWJuYWlscywgZ2l2ZSB0aGVtIGFuIGluZGV4IGRhdGEgYXR0cmlidXRlIGFuZCBjYWNoZVxyXG4gICAgLy8gYSByZWZlcmVuY2UgdG8gdGhlbSBpbiBhbiBhcnJheVxyXG4gICAgdGhpcy5fJHRodW1ibmFpbHMgPSBbXTtcclxuICAgIHRoaXMuXyR0aHVtYm5haWxDb250YWluZXIuZmluZChcImltZ1wiKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciAkdGh1bWJuYWlsID0gJChlbGVtZW50KTtcclxuICAgICAgICAkdGh1bWJuYWlsLmRhdGEoXCJpbmRleFwiLCBpbmRleCk7XHJcbiAgICAgICAgdGhpcy5fJHRodW1ibmFpbHMucHVzaCgkdGh1bWJuYWlsKTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcblxyXG4gICAgLy8gQ3JlYXRlIGVtcHR5IGltYWdlcyBpbiB0aGUgZ2FsbGVyeSBmb3IgZWFjaCB0aHVtYm5haWwuIFRoaXMgaGVscHMgdXMgZG9cclxuICAgIC8vIGxhenkgbG9hZGluZyBvZiBnYWxsZXJ5IGltYWdlcyBhbmQgYWxsb3dzIHVzIHRvIGNyb3NzLWZhZGUgaW1hZ2VzLlxyXG4gICAgdGhpcy5fJGdhbGxlcnlJbWFnZXMgPSBbXTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fJHRodW1ibmFpbHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGlkIGZyb20gdGhlIHBhdGggdG8gdGhlIGxhcmdlIGltYWdlXHJcbiAgICAgICAgdmFyIGxhcmdlUGF0aCA9IHRoaXMuXyR0aHVtYm5haWxzW2ldLmRhdGEoXCJsYXJnZS1wYXRoXCIpO1xyXG4gICAgICAgIHZhciBpZCA9IGxhcmdlUGF0aC5zcGxpdChcIi9cIikucG9wKCkuc3BsaXQoXCIuXCIpWzBdO1xyXG4gICAgICAgIHZhciAkZ2FsbGVyeUltYWdlID0gJChcIjxpbWc+XCIpXHJcbiAgICAgICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICAgICAgICAgIHRvcDogXCIwcHhcIixcclxuICAgICAgICAgICAgICAgIGxlZnQ6IFwiMHB4XCIsXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLFxyXG4gICAgICAgICAgICAgICAgekluZGV4OiAwLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBcIndoaXRlXCJcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmF0dHIoXCJpZFwiLCBpZClcclxuICAgICAgICAgICAgLmRhdGEoXCJpbWFnZS11cmxcIiwgbGFyZ2VQYXRoKVxyXG4gICAgICAgICAgICAuYXBwZW5kVG8oJGNvbnRhaW5lci5maW5kKFwiLmltYWdlLWdhbGxlcnktc2VsZWN0ZWRcIikpO1xyXG4gICAgICAgICRnYWxsZXJ5SW1hZ2UuZ2V0KDApLnNyYyA9IGxhcmdlUGF0aDsgLy8gVE9ETzogTWFrZSB0aGlzIGxhenkhXHJcbiAgICAgICAgdGhpcy5fJGdhbGxlcnlJbWFnZXMucHVzaCgkZ2FsbGVyeUltYWdlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBBY3RpdmF0ZSB0aGUgZmlyc3QgdGh1bWJuYWlsIGFuZCBkaXNwbGF5IGl0IGluIHRoZSBnYWxsZXJ5IFxyXG4gICAgdGhpcy5fc3dpdGNoQWN0aXZlSW1hZ2UoMCk7XHJcblxyXG4gICAgLy8gQmluZCB0aGUgZXZlbnQgaGFuZGxlcnMgdG8gdGhlIGltYWdlc1xyXG4gICAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci5maW5kKFwiaW1nXCIpLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25DbGljay5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuSW1hZ2VHYWxsZXJ5LnByb3RvdHlwZS5fc3dpdGNoQWN0aXZlSW1hZ2UgPSBmdW5jdGlvbiAoaW5kZXgpIHtcclxuICAgIC8vIFJlc2V0IGFsbCBpbWFnZXMgdG8gaW52aXNpYmxlIGFuZCBsb3dlc3Qgei1pbmRleC4gVGhpcyBjb3VsZCBiZSBzbWFydGVyLFxyXG4gICAgLy8gbGlrZSBIb3ZlclNsaWRlc2hvdywgYW5kIG9ubHkgcmVzZXQgZXhhY3RseSB3aGF0IHdlIG5lZWQsIGJ1dCB3ZSBhcmVuJ3QgXHJcbiAgICAvLyB3YXN0aW5nIHRoYXQgbWFueSBjeWNsZXMuXHJcbiAgICB0aGlzLl8kZ2FsbGVyeUltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uICgkZ2FsbGVyeUltYWdlKSB7XHJcbiAgICAgICAgJGdhbGxlcnlJbWFnZS5jc3Moe1xyXG4gICAgICAgICAgICBcInpJbmRleFwiOiAwLFxyXG4gICAgICAgICAgICBcIm9wYWNpdHlcIjogMFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRnYWxsZXJ5SW1hZ2Uuc3RvcCgpOyAvLyBTdG9wIGFueSBhbmltYXRpb25zXHJcbiAgICB9LCB0aGlzKVxyXG5cclxuICAgIC8vIENhY2hlIHJlZmVyZW5jZXMgdG8gdGhlIGxhc3QgYW5kIGN1cnJlbnQgaW1hZ2UgJiB0aHVtYm5haWxzXHJcbiAgICB2YXIgJGxhc3RUaHVtYm5haWwgPSB0aGlzLl8kdGh1bWJuYWlsc1t0aGlzLl9pbmRleF07XHJcbiAgICB2YXIgJGxhc3RJbWFnZSA9IHRoaXMuXyRnYWxsZXJ5SW1hZ2VzW3RoaXMuX2luZGV4XTtcclxuICAgIHRoaXMuX2luZGV4ID0gaW5kZXg7XHJcbiAgICB2YXIgJGN1cnJlbnRUaHVtYm5haWwgPSB0aGlzLl8kdGh1bWJuYWlsc1t0aGlzLl9pbmRleF07XHJcbiAgICB2YXIgJGN1cnJlbnRJbWFnZSA9IHRoaXMuXyRnYWxsZXJ5SW1hZ2VzW3RoaXMuX2luZGV4XTtcclxuXHJcbiAgICAvLyBBY3RpdmF0ZS9kZWFjdGl2YXRlIHRodW1ibmFpbHNcclxuICAgICRsYXN0VGh1bWJuYWlsLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgJGN1cnJlbnRUaHVtYm5haWwuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcblxyXG4gICAgLy8gTWFrZSB0aGUgbGFzdCBpbWFnZSB2aXNpc2JsZSBhbmQgdGhlbiBhbmltYXRlIHRoZSBjdXJyZW50IGltYWdlIGludG8gdmlld1xyXG4gICAgLy8gb24gdG9wIG9mIHRoZSBsYXN0XHJcbiAgICAkbGFzdEltYWdlLmNzcyhcInpJbmRleFwiLCAxKTtcclxuICAgICRjdXJyZW50SW1hZ2UuY3NzKFwiekluZGV4XCIsIDIpO1xyXG4gICAgJGxhc3RJbWFnZS5jc3MoXCJvcGFjaXR5XCIsIDEpO1xyXG4gICAgJGN1cnJlbnRJbWFnZS5hbmltYXRlKHtcIm9wYWNpdHlcIjogMX0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXHJcbiAgICAgICAgXCJlYXNlSW5PdXRRdWFkXCIpO1xyXG5cclxuICAgIC8vIE9iamVjdCBpbWFnZSBmaXQgcG9seWZpbGwgYnJlYWtzIGpRdWVyeSBhdHRyKC4uLiksIHNvIGZhbGxiYWNrIHRvIGp1c3QgXHJcbiAgICAvLyB1c2luZyBlbGVtZW50LnNyY1xyXG4gICAgLy8gVE9ETzogTGF6eSFcclxuICAgIC8vIGlmICgkY3VycmVudEltYWdlLmdldCgwKS5zcmMgPT09IFwiXCIpIHtcclxuICAgIC8vICAgICAkY3VycmVudEltYWdlLmdldCgwKS5zcmMgPSAkY3VycmVudEltYWdlLmRhdGEoXCJpbWFnZS11cmxcIik7XHJcbiAgICAvLyB9XHJcbn07XHJcblxyXG5JbWFnZUdhbGxlcnkucHJvdG90eXBlLl9vbkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcbiAgICB2YXIgaW5kZXggPSAkdGFyZ2V0LmRhdGEoXCJpbmRleFwiKTtcclxuICAgIFxyXG4gICAgLy8gQ2xpY2tlZCBvbiB0aGUgYWN0aXZlIGltYWdlIC0gbm8gbmVlZCB0byBkbyBhbnl0aGluZ1xyXG4gICAgaWYgKHRoaXMuX2luZGV4ID09PSBpbmRleCkgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3N3aXRjaEFjdGl2ZUltYWdlKGluZGV4KTsgIFxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gTWFpbk5hdjtcclxuXHJcbmZ1bmN0aW9uIE1haW5OYXYobG9hZGVyKSB7XHJcbiAgICB0aGlzLl9sb2FkZXIgPSBsb2FkZXI7XHJcbiAgICB0aGlzLl8kbmF2ID0gJChcIiNtYWluLW5hdlwiKTtcclxuICAgIHRoaXMuXyRuYXZMaW5rcyA9IHRoaXMuXyRuYXYuZmluZChcImFcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2ID0gdGhpcy5fJG5hdkxpbmtzLmZpbmQoXCIuYWN0aXZlXCIpOyBcclxuICAgIHRoaXMuXyRuYXZMaW5rcy5vbihcImNsaWNrXCIsIHRoaXMuX29uTmF2Q2xpY2suYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbk1haW5OYXYucHJvdG90eXBlLnNldEFjdGl2ZUZyb21VcmwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9kZWFjdGl2YXRlKCk7XHJcbiAgICB2YXIgdXJsID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICBpZiAodXJsID09PSBcIi9pbmRleC5odG1sXCIgfHwgdXJsID09PSBcIi9cIikge1xyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlTGluayh0aGlzLl8kbmF2TGlua3MuZmlsdGVyKFwiI2Fib3V0LWxpbmtcIikpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodXJsID09PSBcIi93b3JrLmh0bWxcIikgeyAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVMaW5rKHRoaXMuXyRuYXZMaW5rcy5maWx0ZXIoXCIjd29yay1saW5rXCIpKTtcclxuICAgIH1cclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9kZWFjdGl2YXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuXyRhY3RpdmVOYXYubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdi5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2ID0gJCgpO1xyXG4gICAgfTtcclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9hY3RpdmF0ZUxpbmsgPSBmdW5jdGlvbiAoJGxpbmspIHtcclxuICAgICRsaW5rLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdiA9ICRsaW5rO1xyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX29uTmF2Q2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIC8vIENsb3NlIHRoZSBuYXYuIFRoaXMgb25seSBtYXR0ZXJzIGlmIHdlIGFyZSBvbiBtb2JpbGVcclxuICAgIHRoaXMuXyRuYXYuY29sbGFwc2UoXCJoaWRlXCIpO1xyXG5cclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgaWYgKCR0YXJnZXQuaXModGhpcy5fJGFjdGl2ZU5hdikpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLl9kZWFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLl9hY3RpdmF0ZUxpbmsoJHRhcmdldCk7XHJcblxyXG4gICAgdmFyIHVybCA9ICR0YXJnZXQuYXR0cihcImhyZWZcIik7XHJcbiAgICB0aGlzLl9sb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgdHJ1ZSk7ICAgIFxyXG59OyIsInZhciBMb2FkZXIgPSByZXF1aXJlKFwiLi9wYWdlLWxvYWRlci5qc1wiKTtcclxudmFyIE1haW5OYXYgPSByZXF1aXJlKFwiLi9tYWluLW5hdi5qc1wiKTtcclxudmFyIEhvdmVyU2xpZGVzaG93cyA9IHJlcXVpcmUoXCIuL2hvdmVyLXNsaWRlc2hvdy5qc1wiKTtcclxudmFyIFBvcnRmb2xpb0ZpbHRlciA9IHJlcXVpcmUoXCIuL3BvcnRmb2xpby1maWx0ZXIuanNcIik7XHJcbnZhciBJbWFnZUdhbGxlcmllcyA9IHJlcXVpcmUoXCIuL2ltYWdlLWdhbGxlcnkuanNcIik7XHJcblxyXG4vLyBBSkFYIHBhZ2UgbG9hZGVyLCB3aXRoIGNhbGxiYWNrIGZvciByZWxvYWRpbmcgd2lkZ2V0c1xyXG52YXIgbG9hZGVyID0gbmV3IExvYWRlcihvblBhZ2VMb2FkKTtcclxuXHJcbi8vIE1haW4gbmF2IHdpZGdldFxyXG52YXIgbWFpbk5hdiA9IG5ldyBNYWluTmF2KGxvYWRlcik7XHJcblxyXG4vLyBXaWRnZXQgZ2xvYmFsc1xyXG52YXIgaG92ZXJTbGlkZXNob3dzLCBwb3J0Zm9saW9GaWx0ZXIsIGltYWdlR2FsbGVyaWVzO1xyXG5cclxuLy8gTG9hZCBhbGwgd2lkZ2V0c1xyXG5vblBhZ2VMb2FkKCk7XHJcblxyXG4vLyBIYW5kbGUgYmFjay9mb3J3YXJkIGJ1dHRvbnNcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBvblBvcFN0YXRlKTtcclxuXHJcbmZ1bmN0aW9uIG9uUG9wU3RhdGUoZSkge1xyXG4gICAgLy8gTG9hZGVyIHN0b3JlcyBjdXN0b20gZGF0YSBpbiB0aGUgc3RhdGUgLSBpbmNsdWRpbmcgdGhlIHVybCBhbmQgdGhlIHF1ZXJ5XHJcbiAgICB2YXIgdXJsID0gKGUuc3RhdGUgJiYgZS5zdGF0ZS51cmwpIHx8IFwiL2luZGV4Lmh0bWxcIjtcclxuICAgIHZhciBxdWVyeU9iamVjdCA9IChlLnN0YXRlICYmIGUuc3RhdGUucXVlcnkpIHx8IHt9O1xyXG5cclxuICAgIGlmICgodXJsID09PSBsb2FkZXIuZ2V0TG9hZGVkUGF0aCgpKSAmJiAodXJsID09PSBcIi93b3JrLmh0bWxcIikpIHtcclxuICAgICAgICAvLyBUaGUgY3VycmVudCAmIHByZXZpb3VzIGxvYWRlZCBzdGF0ZXMgd2VyZSB3b3JrLmh0bWwsIHNvIGp1c3QgcmVmaWx0ZXJcclxuICAgICAgICB2YXIgY2F0ZWdvcnkgPSBxdWVyeU9iamVjdC5jYXRlZ29yeSB8fCBcImFsbFwiO1xyXG4gICAgICAgIHBvcnRmb2xpb0ZpbHRlci5zZWxlY3RDYXRlZ29yeShjYXRlZ29yeSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIExvYWQgdGhlIG5ldyBwYWdlXHJcbiAgICAgICAgbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIGZhbHNlKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gb25QYWdlTG9hZCgpIHtcclxuICAgIC8vIFJlbG9hZCBhbGwgcGx1Z2lucy93aWRnZXRzXHJcbiAgICBob3ZlclNsaWRlc2hvd3MgPSBuZXcgSG92ZXJTbGlkZXNob3dzKCk7XHJcbiAgICBwb3J0Zm9saW9GaWx0ZXIgPSBuZXcgUG9ydGZvbGlvRmlsdGVyKGxvYWRlcik7XHJcbiAgICBpbWFnZUdhbGxlcmllcyA9IG5ldyBJbWFnZUdhbGxlcmllcygpO1xyXG4gICAgb2JqZWN0Rml0SW1hZ2VzKCk7XHJcbiAgICBzbWFydHF1b3RlcygpO1xyXG5cclxuICAgIC8vIFNsaWdodGx5IHJlZHVuZGFudCwgYnV0IHVwZGF0ZSB0aGUgbWFpbiBuYXYgdXNpbmcgdGhlIGN1cnJlbnQgVVJMLiBUaGlzXHJcbiAgICAvLyBpcyBpbXBvcnRhbnQgaWYgYSBwYWdlIGlzIGxvYWRlZCBieSB0eXBpbmcgYSBmdWxsIFVSTCAoZS5nLiBnb2luZ1xyXG4gICAgLy8gZGlyZWN0bHkgdG8gL3dvcmsuaHRtbCkgb3Igd2hlbiBtb3ZpbmcgZnJvbSB3b3JrLmh0bWwgdG8gYSBwcm9qZWN0LiBcclxuICAgIG1haW5OYXYuc2V0QWN0aXZlRnJvbVVybCgpO1xyXG59XHJcblxyXG4vLyBXZSd2ZSBoaXQgdGhlIGxhbmRpbmcgcGFnZSwgbG9hZCB0aGUgYWJvdXQgcGFnZVxyXG4vLyBpZiAobG9jYXRpb24ucGF0aG5hbWUubWF0Y2goL14oXFwvfFxcL2luZGV4Lmh0bWx8aW5kZXguaHRtbCkkLykpIHtcclxuLy8gICAgIGxvYWRlci5sb2FkUGFnZShcIi9hYm91dC5odG1sXCIsIHt9LCBmYWxzZSk7XHJcbi8vIH0iLCJtb2R1bGUuZXhwb3J0cyA9IExvYWRlcjtcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBMb2FkZXIob25SZWxvYWQsIGZhZGVEdXJhdGlvbikge1xyXG4gICAgdGhpcy5fJGNvbnRlbnQgPSAkKFwiI2NvbnRlbnRcIik7XHJcbiAgICB0aGlzLl9vblJlbG9hZCA9IG9uUmVsb2FkO1xyXG4gICAgdGhpcy5fZmFkZUR1cmF0aW9uID0gKGZhZGVEdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSA/IGZhZGVEdXJhdGlvbiA6IDIwMDtcclxuICAgIHRoaXMuX3BhdGggPSBsb2NhdGlvbi5wYXRobmFtZTtcclxufVxyXG5cclxuTG9hZGVyLnByb3RvdHlwZS5nZXRMb2FkZWRQYXRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3BhdGg7XHJcbn07XHJcblxyXG5Mb2FkZXIucHJvdG90eXBlLmxvYWRQYWdlID0gZnVuY3Rpb24gKHVybCwgcXVlcnlPYmplY3QsIHNob3VsZFB1c2hIaXN0b3J5KSB7XHJcbiAgICAvLyBGYWRlIHRoZW4gZW1wdHkgdGhlIGN1cnJlbnQgY29udGVudHNcclxuICAgIHRoaXMuXyRjb250ZW50LmZhZGVPdXQodGhpcy5fZmFkZUR1cmF0aW9uLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICB0aGlzLl8kY29udGVudC5lbXB0eSgpO1xyXG4gICAgICAgdGhpcy5fJGNvbnRlbnQubG9hZCh1cmwgKyBcIiAjY29udGVudFwiLCBvbkNvbnRlbnRGZXRjaGVkLmJpbmQodGhpcykpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBGYWRlIHRoZSBuZXcgY29udGVudCBpbiBhZnRlciBpdCBoYXMgYmVlbiBmZXRjaGVkXHJcbiAgICBmdW5jdGlvbiBvbkNvbnRlbnRGZXRjaGVkKHJlc3BvbnNlVGV4dCwgdGV4dFN0YXR1cywganFYaHIpIHtcclxuICAgICAgICBpZiAodGV4dFN0YXR1cyA9PT0gXCJlcnJvclwiKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVGhlcmUgd2FzIGEgcHJvYmxlbSBsb2FkaW5nIHRoZSBwYWdlLlwiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHF1ZXJ5U3RyaW5nID0gdXRpbGl0aWVzLmNyZWF0ZVF1ZXJ5U3RyaW5nKHF1ZXJ5T2JqZWN0KTtcclxuICAgICAgICBpZiAoc2hvdWxkUHVzaEhpc3RvcnkpIHtcclxuICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe1xyXG4gICAgICAgICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICAgICAgICBxdWVyeTogcXVlcnlPYmplY3RcclxuICAgICAgICAgICAgfSwgbnVsbCwgdXJsICsgcXVlcnlTdHJpbmcpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5fcGF0aCA9IGxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgICAgIHRoaXMuXyRjb250ZW50LmZhZGVJbih0aGlzLl9mYWRlRHVyYXRpb24pO1xyXG4gICAgICAgIHRoaXMuX29uUmVsb2FkKCk7XHJcbiAgICB9XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBQb3J0Zm9saW9GaWx0ZXI7XHJcblxyXG52YXIgdXRpbGl0aWVzID0gcmVxdWlyZShcIi4vdXRpbGl0aWVzLmpzXCIpO1xyXG5cclxudmFyIGRlZmF1bHRCcmVha3BvaW50cyA9IFtcclxuICAgIHsgd2lkdGg6IDEyMDAsIGNvbHM6IDMsIHNwYWNpbmc6IDE1IH0sXHJcbiAgICB7IHdpZHRoOiA5OTIsIGNvbHM6IDMsIHNwYWNpbmc6IDE1IH0sXHJcbiAgICB7IHdpZHRoOiA3MDAsIGNvbHM6IDMsIHNwYWNpbmc6IDE1IH0sXHJcbiAgICB7IHdpZHRoOiA2MDAsIGNvbHM6IDIsIHNwYWNpbmc6IDEwIH0sXHJcbiAgICB7IHdpZHRoOiA0ODAsIGNvbHM6IDIsIHNwYWNpbmc6IDEwIH0sXHJcbiAgICB7IHdpZHRoOiAzMjAsIGNvbHM6IDEsIHNwYWNpbmc6IDEwIH1cclxuXTtcclxuXHJcbmZ1bmN0aW9uIFBvcnRmb2xpb0ZpbHRlcihsb2FkZXIsIGJyZWFrcG9pbnRzLCBhc3BlY3RSYXRpbywgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl9sb2FkZXIgPSBsb2FkZXI7XHJcbiAgICB0aGlzLl9ncmlkU3BhY2luZyA9IDA7XHJcbiAgICB0aGlzLl9hc3BlY3RSYXRpbyA9IChhc3BlY3RSYXRpbyAhPT0gdW5kZWZpbmVkKSA/IGFzcGVjdFJhdGlvIDogKDE2LzkpO1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gKHRyYW5zaXRpb25EdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSA/IFxyXG4gICAgICAgIHRyYW5zaXRpb25EdXJhdGlvbiA6IDgwMDtcclxuICAgIHRoaXMuX2JyZWFrcG9pbnRzID0gKGJyZWFrcG9pbnRzICE9PSB1bmRlZmluZWQpID8gXHJcbiAgICAgICAgYnJlYWtwb2ludHMuc2xpY2UoKSA6IGRlZmF1bHRCcmVha3BvaW50cy5zbGljZSgpO1xyXG4gICAgdGhpcy5fJGdyaWQgPSAkKFwiI3BvcnRmb2xpby1ncmlkXCIpO1xyXG4gICAgdGhpcy5fJG5hdiA9ICQoXCIjcG9ydGZvbGlvLW5hdlwiKTtcclxuICAgIHRoaXMuXyRwcm9qZWN0cyA9IFtdO1xyXG4gICAgdGhpcy5fJGNhdGVnb3JpZXMgPSB7fTtcclxuICAgIHRoaXMuX3Jvd3MgPSAwO1xyXG4gICAgdGhpcy5fY29scyA9IDA7XHJcbiAgICB0aGlzLl9pbWFnZUhlaWdodCA9IDA7XHJcbiAgICB0aGlzLl9pbWFnZVdpZHRoID0gMDtcclxuXHJcbiAgICAvLyBTb3J0IHRoZSBicmVha3BvaW50cyBpbiBkZXNjZW5kaW5nIG9yZGVyXHJcbiAgICB0aGlzLl9icmVha3BvaW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICBpZiAoYS53aWR0aCA8IGIud2lkdGgpIHJldHVybiAtMTtcclxuICAgICAgICBlbHNlIGlmIChhLndpZHRoID4gYi53aWR0aCkgcmV0dXJuIDE7XHJcbiAgICAgICAgZWxzZSByZXR1cm4gMDtcclxuICAgIH0pO1xyXG5cclxuICAgIHRoaXMuX2NhY2hlUHJvamVjdHMoKTtcclxuICAgIHRoaXMuX2NyZWF0ZUdyaWQoKTtcclxuXHJcbiAgICB0aGlzLl8kZ3JpZC5maW5kKFwiLnByb2plY3QgYVwiKS5vbihcImNsaWNrXCIsIHRoaXMuX29uUHJvamVjdENsaWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgIHZhciBxcyA9IHV0aWxpdGllcy5nZXRRdWVyeVBhcmFtZXRlcnMoKTtcclxuICAgIHZhciBpbml0aWFsQ2F0ZWdvcnkgPSBxcy5jYXRlZ29yeSB8fCBcImFsbFwiO1xyXG4gICAgdmFyIGNhdGVnb3J5ID0gaW5pdGlhbENhdGVnb3J5LnRvTG93ZXJDYXNlKCk7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9IHRoaXMuXyRuYXYuZmluZChcImFbZGF0YS1jYXRlZ29yeT1cIiArIGNhdGVnb3J5ICsgXCJdXCIpO1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl9maWx0ZXJQcm9qZWN0cyhjYXRlZ29yeSk7XHJcbiAgICAkKFwiI3BvcnRmb2xpby1uYXYgYVwiKS5vbihcImNsaWNrXCIsIHRoaXMuX29uTmF2Q2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgJCh3aW5kb3cpLm9uKFwicmVzaXplXCIsIHRoaXMuX2NyZWF0ZUdyaWQuYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuc2VsZWN0Q2F0ZWdvcnkgPSBmdW5jdGlvbiAoY2F0ZWdvcnkpIHtcclxuICAgIGNhdGVnb3J5ID0gKGNhdGVnb3J5ICYmIGNhdGVnb3J5LnRvTG93ZXJDYXNlKCkpIHx8IFwiYWxsXCI7XHJcbiAgICB2YXIgJHNlbGVjdGVkTmF2ID0gdGhpcy5fJG5hdi5maW5kKFwiYVtkYXRhLWNhdGVnb3J5PVwiICsgY2F0ZWdvcnkgKyBcIl1cIik7XHJcbiAgICBpZiAoJHNlbGVjdGVkTmF2Lmxlbmd0aCAmJiAhJHNlbGVjdGVkTmF2LmlzKHRoaXMuXyRhY3RpdmVOYXZJdGVtKSkge1xyXG4gICAgICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gJHNlbGVjdGVkTmF2O1xyXG4gICAgICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgICAgIHRoaXMuX2ZpbHRlclByb2plY3RzKGNhdGVnb3J5KTtcclxuICAgIH1cclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2ZpbHRlclByb2plY3RzID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XHJcbiAgICB2YXIgJHNlbGVjdGVkRWxlbWVudHMgPSB0aGlzLl9nZXRQcm9qZWN0c0luQ2F0ZWdvcnkoY2F0ZWdvcnkpO1xyXG5cclxuICAgIC8vIEFuaW1hdGUgdGhlIGdyaWQgdG8gdGhlIGNvcnJlY3QgaGVpZ2h0IHRvIGNvbnRhaW4gdGhlIHJvd3NcclxuICAgIHRoaXMuX2FuaW1hdGVHcmlkSGVpZ2h0KCRzZWxlY3RlZEVsZW1lbnRzLmxlbmd0aCk7XHJcbiAgICBcclxuICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgcHJvamVjdHNcclxuICAgIHRoaXMuXyRwcm9qZWN0cy5mb3JFYWNoKGZ1bmN0aW9uICgkZWxlbWVudCkge1xyXG4gICAgICAgIC8vIFN0b3AgYWxsIGFuaW1hdGlvbnNcclxuICAgICAgICAkZWxlbWVudC5zdG9wKCk7XHJcbiAgICAgICAgLy8gSWYgYW4gZWxlbWVudCBpcyBub3Qgc2VsZWN0ZWQ6IGRyb3Agei1pbmRleCAmIGFuaW1hdGUgb3BhY2l0eSAtPiBoaWRlXHJcbiAgICAgICAgdmFyIHNlbGVjdGVkSW5kZXggPSAkc2VsZWN0ZWRFbGVtZW50cy5pbmRleE9mKCRlbGVtZW50KTsgXHJcbiAgICAgICAgaWYgKHNlbGVjdGVkSW5kZXggPT09IC0xKSB7XHJcbiAgICAgICAgICAgICRlbGVtZW50LmNzcyhcInpJbmRleFwiLCAtMSk7XHJcbiAgICAgICAgICAgICRlbGVtZW50LmFuaW1hdGUoe1xyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICAgICAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFwiZWFzZUluT3V0Q3ViaWNcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gSWYgYW4gZWxlbWVudCBpcyBzZWxlY3RlZDogc2hvdyAmIGJ1bXAgei1pbmRleCAmIGFuaW1hdGUgdG8gcG9zaXRpb24gXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICRlbGVtZW50LnNob3coKTtcclxuICAgICAgICAgICAgJGVsZW1lbnQuY3NzKFwiekluZGV4XCIsIDApO1xyXG4gICAgICAgICAgICB2YXIgbmV3UG9zID0gdGhpcy5faW5kZXhUb1hZKHNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC5hbmltYXRlKHsgXHJcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxLFxyXG4gICAgICAgICAgICAgICAgdG9wOiBuZXdQb3MueSArIFwicHhcIixcclxuICAgICAgICAgICAgICAgIGxlZnQ6IG5ld1Bvcy54ICsgXCJweFwiXHJcbiAgICAgICAgICAgIH0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcclxuICAgICAgICB9XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9hbmltYXRlR3JpZEhlaWdodCA9IGZ1bmN0aW9uIChudW1FbGVtZW50cykge1xyXG4gICAgdGhpcy5fJGdyaWQuc3RvcCgpO1xyXG4gICAgdmFyIGN1clJvd3MgPSBNYXRoLmNlaWwobnVtRWxlbWVudHMgLyB0aGlzLl9jb2xzKTtcclxuICAgIHRoaXMuXyRncmlkLmFuaW1hdGUoe1xyXG4gICAgICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKiBjdXJSb3dzICsgXHJcbiAgICAgICAgICAgIHRoaXMuX2dyaWRTcGFjaW5nICogKGN1clJvd3MgLSAxKSArIFwicHhcIlxyXG4gICAgfSwgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uKTtcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2dldFByb2plY3RzSW5DYXRlZ29yeSA9IGZ1bmN0aW9uIChjYXRlZ29yeSkge1xyXG4gICAgaWYgKGNhdGVnb3J5ID09PSBcImFsbFwiKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuXyRwcm9qZWN0cztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuICh0aGlzLl8kY2F0ZWdvcmllc1tjYXRlZ29yeV0gfHwgW10pO1xyXG4gICAgfSAgICAgICAgXHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jYWNoZVByb2plY3RzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fJHByb2plY3RzID0gW107XHJcbiAgICB0aGlzLl8kY2F0ZWdvcmllcyA9IHt9O1xyXG4gICAgdGhpcy5fJGdyaWQuZmluZChcIi5wcm9qZWN0XCIpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcclxuICAgICAgICB0aGlzLl8kcHJvamVjdHMucHVzaCgkZWxlbWVudCk7XHJcbiAgICAgICAgdmFyIGNhdGVnb3J5TmFtZXMgPSAkZWxlbWVudC5kYXRhKFwiY2F0ZWdvcmllc1wiKS5zcGxpdChcIixcIik7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYXRlZ29yeU5hbWVzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgICAgIHZhciBjYXRlZ29yeSA9ICQudHJpbShjYXRlZ29yeU5hbWVzW2ldKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldID0gWyRlbGVtZW50XTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XS5wdXNoKCRlbGVtZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG4vLyBQb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jYWxjdWxhdGVHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4vLyAgICAgdmFyIGdyaWRXaWR0aCA9IHRoaXMuXyRncmlkLmlubmVyV2lkdGgoKTtcclxuLy8gICAgIHRoaXMuX2NvbHMgPSBNYXRoLmZsb29yKChncmlkV2lkdGggKyB0aGlzLl9ncmlkU3BhY2luZykgLyBcclxuLy8gICAgICAgICAodGhpcy5fbWluSW1hZ2VXaWR0aCArIHRoaXMuX2dyaWRTcGFjaW5nKSk7XHJcbi8vICAgICB0aGlzLl9yb3dzID0gTWF0aC5jZWlsKHRoaXMuXyRwcm9qZWN0cy5sZW5ndGggLyB0aGlzLl9jb2xzKTtcclxuLy8gICAgIHRoaXMuX2ltYWdlV2lkdGggPSAoZ3JpZFdpZHRoIC0gKCh0aGlzLl9jb2xzIC0gMSkgKiB0aGlzLl9ncmlkU3BhY2luZykpIC8gXHJcbi8vICAgICAgICAgdGhpcy5fY29scztcclxuLy8gICAgIHRoaXMuX2ltYWdlSGVpZ2h0ID0gdGhpcy5faW1hZ2VXaWR0aCAqICgxIC8gdGhpcy5fYXNwZWN0UmF0aW8pO1xyXG4vLyB9O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fY2FsY3VsYXRlR3JpZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHZhciBncmlkV2lkdGggPSB0aGlzLl8kZ3JpZC5pbm5lcldpZHRoKCk7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2JyZWFrcG9pbnRzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgaWYgKGdyaWRXaWR0aCA8PSB0aGlzLl9icmVha3BvaW50c1tpXS53aWR0aCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jb2xzID0gdGhpcy5fYnJlYWtwb2ludHNbaV0uY29scztcclxuICAgICAgICAgICAgdGhpcy5fZ3JpZFNwYWNpbmcgPSB0aGlzLl9icmVha3BvaW50c1tpXS5zcGFjaW5nO1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLl9yb3dzID0gTWF0aC5jZWlsKHRoaXMuXyRwcm9qZWN0cy5sZW5ndGggLyB0aGlzLl9jb2xzKTtcclxuICAgIHRoaXMuX2ltYWdlV2lkdGggPSAoZ3JpZFdpZHRoIC0gKCh0aGlzLl9jb2xzIC0gMSkgKiB0aGlzLl9ncmlkU3BhY2luZykpIC8gXHJcbiAgICAgICAgdGhpcy5fY29scztcclxuICAgIHRoaXMuX2ltYWdlSGVpZ2h0ID0gdGhpcy5faW1hZ2VXaWR0aCAqICgxIC8gdGhpcy5fYXNwZWN0UmF0aW8pO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fY3JlYXRlR3JpZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHRoaXMuX2NhbGN1bGF0ZUdyaWQoKTtcclxuXHJcbiAgICB0aGlzLl8kZ3JpZC5jc3MoXCJwb3NpdGlvblwiLCBcInJlbGF0aXZlXCIpO1xyXG4gICAgdGhpcy5fJGdyaWQuY3NzKHtcclxuICAgICAgICBoZWlnaHQ6IHRoaXMuX2ltYWdlSGVpZ2h0ICogdGhpcy5fcm93cyArIFxyXG4gICAgICAgICAgICB0aGlzLl9ncmlkU3BhY2luZyAqICh0aGlzLl9yb3dzIC0gMSkgKyBcInB4XCJcclxuICAgIH0pOyAgICBcclxuXHJcbiAgICB0aGlzLl8kcHJvamVjdHMuZm9yRWFjaChmdW5jdGlvbiAoJGVsZW1lbnQsIGluZGV4KSB7XHJcbiAgICAgICAgdmFyIHBvcyA9IHRoaXMuX2luZGV4VG9YWShpbmRleCk7XHJcbiAgICAgICAgJGVsZW1lbnQuY3NzKHtcclxuICAgICAgICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgICAgICAgdG9wOiBwb3MueSArIFwicHhcIixcclxuICAgICAgICAgICAgbGVmdDogcG9zLnggKyBcInB4XCIsXHJcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLl9pbWFnZVdpZHRoICsgXCJweFwiLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuX2ltYWdlSGVpZ2h0ICsgXCJweFwiXHJcbiAgICAgICAgfSk7XHJcbiAgICB9LmJpbmQodGhpcykpOyAgICBcclxufVxyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fb25OYXZDbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xyXG4gICAgaWYgKCR0YXJnZXQuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSByZXR1cm47XHJcbiAgICBpZiAodGhpcy5fJGFjdGl2ZU5hdkl0ZW0ubGVuZ3RoKSB0aGlzLl8kYWN0aXZlTmF2SXRlbS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICR0YXJnZXQuYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbSA9ICR0YXJnZXQ7XHJcbiAgICB2YXIgY2F0ZWdvcnkgPSAkdGFyZ2V0LmRhdGEoXCJjYXRlZ29yeVwiKS50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgIGhpc3RvcnkucHVzaFN0YXRlKHtcclxuICAgICAgICB1cmw6IFwiL3dvcmsuaHRtbFwiLFxyXG4gICAgICAgIHF1ZXJ5OiB7IGNhdGVnb3J5OiBjYXRlZ29yeSB9XHJcbiAgICB9LCBudWxsLCBcIi93b3JrLmh0bWw/Y2F0ZWdvcnk9XCIgKyBjYXRlZ29yeSk7XHJcblxyXG4gICAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG59XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9vblByb2plY3RDbGljayA9IGZ1bmN0aW9uIChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICB2YXIgJHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgIHZhciBwcm9qZWN0TmFtZSA9ICR0YXJnZXQuZGF0YShcIm5hbWVcIik7XHJcbiAgICB2YXIgdXJsID0gXCIvcHJvamVjdHMvXCIgKyBwcm9qZWN0TmFtZSArIFwiLmh0bWxcIjtcclxuICAgIHRoaXMuX2xvYWRlci5sb2FkUGFnZSh1cmwsIHt9LCB0cnVlKTtcclxufVxyXG5cclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2luZGV4VG9YWSA9IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgdmFyIHIgPSBNYXRoLmZsb29yKGluZGV4IC8gdGhpcy5fY29scyk7XHJcbiAgICB2YXIgYyA9IGluZGV4ICUgdGhpcy5fY29sczsgXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHg6IGMgKiB0aGlzLl9pbWFnZVdpZHRoICsgYyAqIHRoaXMuX2dyaWRTcGFjaW5nLFxyXG4gICAgICAgIHk6IHIgKiB0aGlzLl9pbWFnZUhlaWdodCArIHIgKiB0aGlzLl9ncmlkU3BhY2luZ1xyXG4gICAgfTtcclxufSIsIm1vZHVsZS5leHBvcnRzLmdldFF1ZXJ5UGFyYW1ldGVycyA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIENoZWNrIGZvciBxdWVyeSBzdHJpbmdcclxuICAgIHFzID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaDtcclxuICAgIGlmIChxcy5sZW5ndGggPD0gMSkgcmV0dXJuIHt9O1xyXG4gICAgLy8gUXVlcnkgc3RyaW5nIGV4aXN0cywgcGFyc2UgaXQgaW50byBhIHF1ZXJ5IG9iamVjdFxyXG4gICAgcXMgPSBxcy5zdWJzdHJpbmcoMSk7IC8vIFJlbW92ZSB0aGUgXCI/XCIgZGVsaW1pdGVyXHJcbiAgICB2YXIga2V5VmFsUGFpcnMgPSBxcy5zcGxpdChcIiZcIik7XHJcbiAgICB2YXIgcXVlcnlPYmplY3QgPSB7fTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5VmFsUGFpcnMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIga2V5VmFsID0ga2V5VmFsUGFpcnNbaV0uc3BsaXQoXCI9XCIpO1xyXG4gICAgICAgIGlmIChrZXlWYWwubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5VmFsWzBdKTtcclxuICAgICAgICAgICAgdmFyIHZhbCA9IGRlY29kZVVSSUNvbXBvbmVudChrZXlWYWxbMV0pO1xyXG4gICAgICAgICAgICBxdWVyeU9iamVjdFtrZXldID0gdmFsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBxdWVyeU9iamVjdDtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzLmNyZWF0ZVF1ZXJ5U3RyaW5nID0gZnVuY3Rpb24gKHF1ZXJ5T2JqZWN0KSB7XHJcbiAgICBpZiAodHlwZW9mIHF1ZXJ5T2JqZWN0ICE9PSBcIm9iamVjdFwiKSByZXR1cm4gXCJcIjtcclxuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMocXVlcnlPYmplY3QpO1xyXG4gICAgaWYgKGtleXMubGVuZ3RoID09PSAwKSByZXR1cm4gXCJcIjtcclxuICAgIHZhciBxdWVyeVN0cmluZyA9IFwiP1wiO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSArPSAxKSB7XHJcbiAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XHJcbiAgICAgICAgdmFyIHZhbCA9IHF1ZXJ5T2JqZWN0W2tleV07XHJcbiAgICAgICAgcXVlcnlTdHJpbmcgKz0gZW5jb2RlVVJJQ29tcG9uZW50KGtleSkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpO1xyXG4gICAgICAgIGlmIChpICE9PSBrZXlzLmxlbmd0aCAtIDEpIHF1ZXJ5U3RyaW5nICs9IFwiJlwiO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHF1ZXJ5U3RyaW5nO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMud3JhcEluZGV4ID0gZnVuY3Rpb24gKGluZGV4LCBsZW5ndGgpIHtcclxuICAgIHZhciB3cmFwcGVkSW5kZXggPSAoaW5kZXggJSBsZW5ndGgpOyBcclxuICAgIGlmICh3cmFwcGVkSW5kZXggPCAwKSB7XHJcbiAgICAgICAgLy8gSWYgbmVnYXRpdmUsIGZsaXAgdGhlIGluZGV4IHNvIHRoYXQgLTEgYmVjb21lcyB0aGUgbGFzdCBpdGVtIGluIGxpc3QgXHJcbiAgICAgICAgd3JhcHBlZEluZGV4ID0gbGVuZ3RoICsgd3JhcHBlZEluZGV4O1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHdyYXBwZWRJbmRleDtcclxufTtcclxuIl19
