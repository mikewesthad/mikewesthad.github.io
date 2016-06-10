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
        this._$images[i].velocity("stop");
    }

    // Move the image from 1 steps ago down to the middle z-index and make
    // it completely visible
    if (this._numImages >= 2) {
        var i = utilities.wrapIndex(this._imageIndex - 1, this._numImages);
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
        $galleryImage.velocity("stop"); // Stop any animations
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
}

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


//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvaG92ZXItc2xpZGVzaG93LmpzIiwic3JjL2pzL2ltYWdlLWdhbGxlcnkuanMiLCJzcmMvanMvbWFpbi1uYXYuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9wYWdlLWxvYWRlci5qcyIsInNyYy9qcy9wb3J0Zm9saW8tZmlsdGVyLmpzIiwic3JjL2pzL3V0aWxpdGllcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gSG92ZXJTbGlkZXNob3dzO1xyXG5cclxudmFyIHV0aWxpdGllcyA9IHJlcXVpcmUoXCIuL3V0aWxpdGllcy5qc1wiKTtcclxuXHJcbmZ1bmN0aW9uIEhvdmVyU2xpZGVzaG93cyhzbGlkZXNob3dEZWxheSwgdHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgICB0aGlzLl9zbGlkZXNob3dEZWxheSA9IChzbGlkZXNob3dEZWxheSAhPT0gdW5kZWZpbmVkKSA/IHNsaWRlc2hvd0RlbGF5IDogXHJcbiAgICAgICAgMjAwMDtcclxuICAgIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9ICh0cmFuc2l0aW9uRHVyYXRpb24gIT09IHVuZGVmaW5lZCkgPyBcclxuICAgICAgICBfdHJhbnNpdGlvbkR1cmF0aW9uIDogMTAwMDsgICBcclxuXHJcbiAgICB0aGlzLl9zbGlkZXNob3dzID0gW107XHJcbiAgICB0aGlzLnJlbG9hZCgpO1xyXG59XHJcblxyXG5Ib3ZlclNsaWRlc2hvd3MucHJvdG90eXBlLnJlbG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIE5vdGU6IHRoaXMgaXMgY3VycmVudGx5IG5vdCByZWFsbHkgYmVpbmcgdXNlZC4gV2hlbiBhIHBhZ2UgaXMgbG9hZGVkLFxyXG4gICAgLy8gbWFpbi5qcyBpcyBqdXN0IHJlLWluc3RhbmNpbmcgdGhlIEhvdmVyU2xpZGVzaG93c1xyXG4gICAgdmFyIG9sZFNsaWRlc2hvd3MgPSB0aGlzLl9zbGlkZXNob3dzIHx8IFtdO1xyXG4gICAgdGhpcy5fc2xpZGVzaG93cyA9IFtdO1xyXG4gICAgJChcIi5ob3Zlci1zbGlkZXNob3dcIikuZWFjaChmdW5jdGlvbiAoXywgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gdGhpcy5fZmluZEluU2xpZGVzaG93cyhlbGVtZW50LCBvbGRTbGlkZXNob3dzKTtcclxuICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgICAgIHZhciBzbGlkZXNob3cgPSBvbGRTbGlkZXNob3dzLnNwbGljZShpbmRleCwgMSlbMF07XHJcbiAgICAgICAgICAgIHRoaXMuX3NsaWRlc2hvd3MucHVzaChzbGlkZXNob3cpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3NsaWRlc2hvd3MucHVzaChuZXcgU2xpZGVzaG93KCRlbGVtZW50LCB0aGlzLl9zbGlkZXNob3dEZWxheSxcclxuICAgICAgICAgICAgICAgIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbikpO1xyXG4gICAgICAgIH1cclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn07XHJcblxyXG5Ib3ZlclNsaWRlc2hvd3MucHJvdG90eXBlLl9maW5kSW5TbGlkZXNob3dzID0gZnVuY3Rpb24gKGVsZW1lbnQsIHNsaWRlc2hvd3MpIHtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpZGVzaG93cy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIGlmIChlbGVtZW50ID09PSBzbGlkZXNob3dzW2ldLmdldEVsZW1lbnQoKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gLTE7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBTbGlkZXNob3coJGNvbnRhaW5lciwgc2xpZGVzaG93RGVsYXksIHRyYW5zaXRpb25EdXJhdGlvbikge1xyXG4gICAgdGhpcy5fJGNvbnRhaW5lciA9ICRjb250YWluZXI7XHJcbiAgICB0aGlzLl9zbGlkZXNob3dEZWxheSA9IHNsaWRlc2hvd0RlbGF5O1xyXG4gICAgdGhpcy5fdHJhbnNpdGlvbkR1cmF0aW9uID0gdHJhbnNpdGlvbkR1cmF0aW9uO1xyXG4gICAgdGhpcy5fdGltZW91dElkID0gbnVsbDtcclxuICAgIHRoaXMuX2ltYWdlSW5kZXggPSAwO1xyXG4gICAgdGhpcy5fJGltYWdlcyA9IFtdO1xyXG5cclxuICAgIC8vIFNldCB1cCBhbmQgY2FjaGUgcmVmZXJlbmNlcyB0byBpbWFnZXNcclxuICAgIHRoaXMuXyRjb250YWluZXIuZmluZChcImltZ1wiKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xyXG4gICAgICAgIHZhciAkaW1hZ2UgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgICRpbWFnZS5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICB0b3A6IFwiMFwiLFxyXG4gICAgICAgICAgICBsZWZ0OiBcIjBcIixcclxuICAgICAgICAgICAgekluZGV4OiAoaW5kZXggPT09IDApID8gMiA6IDAgLy8gRmlyc3QgaW1hZ2Ugc2hvdWxkIGJlIG9uIHRvcFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXMucHVzaCgkaW1hZ2UpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBEZXRlcm1pbmUgd2hldGhlciB0byBiaW5kIGludGVyYWN0aXZpdHlcclxuICAgIHRoaXMuX251bUltYWdlcyA9IHRoaXMuXyRpbWFnZXMubGVuZ3RoO1xyXG4gICAgaWYgKHRoaXMuX251bUltYWdlcyA8PSAxKSByZXR1cm47XHJcblxyXG4gICAgLy8gQmluZCBldmVudCBsaXN0ZW5lcnNcclxuICAgIHRoaXMuXyRjb250YWluZXIub24oXCJtb3VzZWVudGVyXCIsIHRoaXMuX29uRW50ZXIuYmluZCh0aGlzKSk7XHJcbiAgICB0aGlzLl8kY29udGFpbmVyLm9uKFwibW91c2VsZWF2ZVwiLCB0aGlzLl9vbkxlYXZlLmJpbmQodGhpcykpO1xyXG5cclxufVxyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXRFbGVtZW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuXyRjb250YWluZXIuZ2V0KDApO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5nZXQkRWxlbWVudCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB0aGlzLl8kY29udGFpbmVyO1xyXG59O1xyXG5cclxuU2xpZGVzaG93LnByb3RvdHlwZS5fb25FbnRlciA9IGZ1bmN0aW9uICgpIHtcclxuICAgIC8vIEZpcnN0IHRyYW5zaXRpb24gc2hvdWxkIGhhcHBlbiBwcmV0dHkgc29vbiBhZnRlciBob3ZlcmluZyBpbiBvcmRlclxyXG4gICAgLy8gdG8gY2x1ZSB0aGUgdXNlciBpbnRvIHdoYXQgaXMgaGFwcGVuaW5nXHJcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBzZXRUaW1lb3V0KHRoaXMuX2FkdmFuY2VTbGlkZXNob3cuYmluZCh0aGlzKSwgNTAwKTtcclxufTtcclxuXHJcblNsaWRlc2hvdy5wcm90b3R5cGUuX29uTGVhdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBjbGVhckludGVydmFsKHRoaXMuX3RpbWVvdXRJZCk7ICBcclxuICAgIHRoaXMuX3RpbWVvdXRJZCA9IG51bGw7ICAgICAgXHJcbn07XHJcblxyXG5TbGlkZXNob3cucHJvdG90eXBlLl9hZHZhbmNlU2xpZGVzaG93ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5faW1hZ2VJbmRleCArPSAxO1xyXG5cclxuICAgIC8vIE1vdmUgdGhlIGltYWdlIGZyb20gMiBzdGVwcyBhZ28gZG93biB0byB0aGUgYm90dG9tIHotaW5kZXggYW5kIG1ha2VcclxuICAgIC8vIGl0IGludmlzaWJsZVxyXG4gICAgaWYgKHRoaXMuX251bUltYWdlcyA+PSAzKSB7XHJcbiAgICAgICAgdmFyIGkgPSB1dGlsaXRpZXMud3JhcEluZGV4KHRoaXMuX2ltYWdlSW5kZXggLSAyLCB0aGlzLl9udW1JbWFnZXMpO1xyXG4gICAgICAgIHRoaXMuXyRpbWFnZXNbaV0uY3NzKHtcclxuICAgICAgICAgICAgekluZGV4OiAwLFxyXG4gICAgICAgICAgICBvcGFjaXR5OiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlc1tpXS52ZWxvY2l0eShcInN0b3BcIik7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTW92ZSB0aGUgaW1hZ2UgZnJvbSAxIHN0ZXBzIGFnbyBkb3duIHRvIHRoZSBtaWRkbGUgei1pbmRleCBhbmQgbWFrZVxyXG4gICAgLy8gaXQgY29tcGxldGVseSB2aXNpYmxlXHJcbiAgICBpZiAodGhpcy5fbnVtSW1hZ2VzID49IDIpIHtcclxuICAgICAgICB2YXIgaSA9IHV0aWxpdGllcy53cmFwSW5kZXgodGhpcy5faW1hZ2VJbmRleCAtIDEsIHRoaXMuX251bUltYWdlcyk7XHJcbiAgICAgICAgdGhpcy5fJGltYWdlc1tpXS5jc3Moe1xyXG4gICAgICAgICAgICB6SW5kZXg6IDEsXHJcbiAgICAgICAgICAgIG9wYWNpdHk6IDFcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLl8kaW1hZ2VzW2ldLnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBNb3ZlIHRoZSBjdXJyZW50IGltYWdlIHRvIHRoZSB0b3Agei1pbmRleCBhbmQgZmFkZSBpdCBpblxyXG4gICAgdGhpcy5faW1hZ2VJbmRleCA9IHV0aWxpdGllcy53cmFwSW5kZXgodGhpcy5faW1hZ2VJbmRleCwgdGhpcy5fbnVtSW1hZ2VzKTtcclxuICAgIHRoaXMuXyRpbWFnZXNbdGhpcy5faW1hZ2VJbmRleF0uY3NzKHtcclxuICAgICAgICB6SW5kZXg6IDIsXHJcbiAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgfSk7XHJcbiAgICB0aGlzLl8kaW1hZ2VzW3RoaXMuX2ltYWdlSW5kZXhdLnZlbG9jaXR5KHtcclxuICAgICAgICBvcGFjaXR5OiAxXHJcbiAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFwiZWFzZUluT3V0UXVhZFwiKTtcclxuXHJcbiAgICAvLyBTY2hlZHVsZSBuZXh0IHRyYW5zaXRpb25cclxuICAgIHRoaXMuX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQodGhpcy5fYWR2YW5jZVNsaWRlc2hvdy5iaW5kKHRoaXMpLCBcclxuICAgICAgICB0aGlzLl9zbGlkZXNob3dEZWxheSk7XHJcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBJbWFnZUdhbGxlcmllcztcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBJbWFnZUdhbGxlcmllcyh0cmFuc2l0aW9uRHVyYXRpb24pIHsgXHJcbiAgICB0cmFuc2l0aW9uRHVyYXRpb24gPSAodHJhbnNpdGlvbkR1cmF0aW9uICE9PSB1bmRlZmluZWQpID9cclxuICAgICAgICB0cmFuc2l0aW9uRHVyYXRpb24gOiA0MDA7XHJcbiAgICB0aGlzLl9pbWFnZUdhbGxlcmllcyA9IFtdO1xyXG4gICAgJChcIi5pbWFnZS1nYWxsZXJ5XCIpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyIGdhbGxlcnkgPSBuZXcgSW1hZ2VHYWxsZXJ5KCQoZWxlbWVudCksIHRyYW5zaXRpb25EdXJhdGlvbik7XHJcbiAgICAgICAgdGhpcy5faW1hZ2VHYWxsZXJpZXMucHVzaChnYWxsZXJ5KTtcclxuICAgIH0uYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIEltYWdlR2FsbGVyeSgkY29udGFpbmVyLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiA9IHRyYW5zaXRpb25EdXJhdGlvbjtcclxuICAgIHRoaXMuXyRjb250YWluZXIgPSAkY29udGFpbmVyO1xyXG4gICAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lciA9ICRjb250YWluZXIuZmluZChcIi5pbWFnZS1nYWxsZXJ5LXRodW1ibmFpbHNcIik7XHJcbiAgICB0aGlzLl9pbmRleCA9IDA7IC8vIEluZGV4IG9mIHNlbGVjdGVkIGltYWdlXHJcblxyXG4gICAgLy8gTG9vcCB0aHJvdWdoIHRoZSB0aHVtYm5haWxzLCBnaXZlIHRoZW0gYW4gaW5kZXggZGF0YSBhdHRyaWJ1dGUgYW5kIGNhY2hlXHJcbiAgICAvLyBhIHJlZmVyZW5jZSB0byB0aGVtIGluIGFuIGFycmF5XHJcbiAgICB0aGlzLl8kdGh1bWJuYWlscyA9IFtdO1xyXG4gICAgdGhpcy5fJHRodW1ibmFpbENvbnRhaW5lci5maW5kKFwiaW1nXCIpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XHJcbiAgICAgICAgdmFyICR0aHVtYm5haWwgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgICR0aHVtYm5haWwuZGF0YShcImluZGV4XCIsIGluZGV4KTtcclxuICAgICAgICB0aGlzLl8kdGh1bWJuYWlscy5wdXNoKCR0aHVtYm5haWwpO1xyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAvLyBDcmVhdGUgZW1wdHkgaW1hZ2VzIGluIHRoZSBnYWxsZXJ5IGZvciBlYWNoIHRodW1ibmFpbC4gVGhpcyBoZWxwcyB1cyBkb1xyXG4gICAgLy8gbGF6eSBsb2FkaW5nIG9mIGdhbGxlcnkgaW1hZ2VzIGFuZCBhbGxvd3MgdXMgdG8gY3Jvc3MtZmFkZSBpbWFnZXMuXHJcbiAgICB0aGlzLl8kZ2FsbGVyeUltYWdlcyA9IFtdO1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl8kdGh1bWJuYWlscy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0aGUgaWQgZnJvbSB0aGUgcGF0aCB0byB0aGUgbGFyZ2UgaW1hZ2VcclxuICAgICAgICB2YXIgbGFyZ2VQYXRoID0gdGhpcy5fJHRodW1ibmFpbHNbaV0uZGF0YShcImxhcmdlLXBhdGhcIik7XHJcbiAgICAgICAgdmFyIGlkID0gbGFyZ2VQYXRoLnNwbGl0KFwiL1wiKS5wb3AoKS5zcGxpdChcIi5cIilbMF07XHJcbiAgICAgICAgdmFyICRnYWxsZXJ5SW1hZ2UgPSAkKFwiPGltZz5cIilcclxuICAgICAgICAgICAgLmNzcyh7XHJcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICAgICAgdG9wOiBcIjBweFwiLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogXCIwcHhcIixcclxuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDAsXHJcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDAsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwid2hpdGVcIlxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuYXR0cihcImlkXCIsIGlkKVxyXG4gICAgICAgICAgICAuZGF0YShcImltYWdlLXVybFwiLCBsYXJnZVBhdGgpXHJcbiAgICAgICAgICAgIC5hcHBlbmRUbygkY29udGFpbmVyLmZpbmQoXCIuaW1hZ2UtZ2FsbGVyeS1zZWxlY3RlZFwiKSk7XHJcbiAgICAgICAgJGdhbGxlcnlJbWFnZS5nZXQoMCkuc3JjID0gbGFyZ2VQYXRoOyAvLyBUT0RPOiBNYWtlIHRoaXMgbGF6eSFcclxuICAgICAgICB0aGlzLl8kZ2FsbGVyeUltYWdlcy5wdXNoKCRnYWxsZXJ5SW1hZ2UpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEFjdGl2YXRlIHRoZSBmaXJzdCB0aHVtYm5haWwgYW5kIGRpc3BsYXkgaXQgaW4gdGhlIGdhbGxlcnkgXHJcbiAgICB0aGlzLl9zd2l0Y2hBY3RpdmVJbWFnZSgwKTtcclxuXHJcbiAgICAvLyBCaW5kIHRoZSBldmVudCBoYW5kbGVycyB0byB0aGUgaW1hZ2VzXHJcbiAgICB0aGlzLl8kdGh1bWJuYWlsQ29udGFpbmVyLmZpbmQoXCJpbWdcIikub24oXCJjbGlja1wiLCB0aGlzLl9vbkNsaWNrLmJpbmQodGhpcykpO1xyXG59XHJcblxyXG5JbWFnZUdhbGxlcnkucHJvdG90eXBlLl9zd2l0Y2hBY3RpdmVJbWFnZSA9IGZ1bmN0aW9uIChpbmRleCkge1xyXG4gICAgLy8gUmVzZXQgYWxsIGltYWdlcyB0byBpbnZpc2libGUgYW5kIGxvd2VzdCB6LWluZGV4LiBUaGlzIGNvdWxkIGJlIHNtYXJ0ZXIsXHJcbiAgICAvLyBsaWtlIEhvdmVyU2xpZGVzaG93LCBhbmQgb25seSByZXNldCBleGFjdGx5IHdoYXQgd2UgbmVlZCwgYnV0IHdlIGFyZW4ndCBcclxuICAgIC8vIHdhc3RpbmcgdGhhdCBtYW55IGN5Y2xlcy5cclxuICAgIHRoaXMuXyRnYWxsZXJ5SW1hZ2VzLmZvckVhY2goZnVuY3Rpb24gKCRnYWxsZXJ5SW1hZ2UpIHtcclxuICAgICAgICAkZ2FsbGVyeUltYWdlLmNzcyh7XHJcbiAgICAgICAgICAgIFwiekluZGV4XCI6IDAsXHJcbiAgICAgICAgICAgIFwib3BhY2l0eVwiOiAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJGdhbGxlcnlJbWFnZS52ZWxvY2l0eShcInN0b3BcIik7IC8vIFN0b3AgYW55IGFuaW1hdGlvbnNcclxuICAgIH0sIHRoaXMpXHJcblxyXG4gICAgLy8gQ2FjaGUgcmVmZXJlbmNlcyB0byB0aGUgbGFzdCBhbmQgY3VycmVudCBpbWFnZSAmIHRodW1ibmFpbHNcclxuICAgIHZhciAkbGFzdFRodW1ibmFpbCA9IHRoaXMuXyR0aHVtYm5haWxzW3RoaXMuX2luZGV4XTtcclxuICAgIHZhciAkbGFzdEltYWdlID0gdGhpcy5fJGdhbGxlcnlJbWFnZXNbdGhpcy5faW5kZXhdO1xyXG4gICAgdGhpcy5faW5kZXggPSBpbmRleDtcclxuICAgIHZhciAkY3VycmVudFRodW1ibmFpbCA9IHRoaXMuXyR0aHVtYm5haWxzW3RoaXMuX2luZGV4XTtcclxuICAgIHZhciAkY3VycmVudEltYWdlID0gdGhpcy5fJGdhbGxlcnlJbWFnZXNbdGhpcy5faW5kZXhdO1xyXG5cclxuICAgIC8vIEFjdGl2YXRlL2RlYWN0aXZhdGUgdGh1bWJuYWlsc1xyXG4gICAgJGxhc3RUaHVtYm5haWwucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAkY3VycmVudFRodW1ibmFpbC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuXHJcbiAgICAvLyBNYWtlIHRoZSBsYXN0IGltYWdlIHZpc2lzYmxlIGFuZCB0aGVuIGFuaW1hdGUgdGhlIGN1cnJlbnQgaW1hZ2UgaW50byB2aWV3XHJcbiAgICAvLyBvbiB0b3Agb2YgdGhlIGxhc3RcclxuICAgICRsYXN0SW1hZ2UuY3NzKFwiekluZGV4XCIsIDEpO1xyXG4gICAgJGN1cnJlbnRJbWFnZS5jc3MoXCJ6SW5kZXhcIiwgMik7XHJcbiAgICAkbGFzdEltYWdlLmNzcyhcIm9wYWNpdHlcIiwgMSk7XHJcbiAgICAkY3VycmVudEltYWdlLnZlbG9jaXR5KHtcIm9wYWNpdHlcIjogMX0sIHRoaXMuX3RyYW5zaXRpb25EdXJhdGlvbiwgXHJcbiAgICAgICAgXCJlYXNlSW5PdXRRdWFkXCIpO1xyXG5cclxuICAgIC8vIE9iamVjdCBpbWFnZSBmaXQgcG9seWZpbGwgYnJlYWtzIGpRdWVyeSBhdHRyKC4uLiksIHNvIGZhbGxiYWNrIHRvIGp1c3QgXHJcbiAgICAvLyB1c2luZyBlbGVtZW50LnNyY1xyXG4gICAgLy8gVE9ETzogTGF6eSFcclxuICAgIC8vIGlmICgkY3VycmVudEltYWdlLmdldCgwKS5zcmMgPT09IFwiXCIpIHtcclxuICAgIC8vICAgICAkY3VycmVudEltYWdlLmdldCgwKS5zcmMgPSAkY3VycmVudEltYWdlLmRhdGEoXCJpbWFnZS11cmxcIik7XHJcbiAgICAvLyB9XHJcbn07XHJcblxyXG5JbWFnZUdhbGxlcnkucHJvdG90eXBlLl9vbkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcbiAgICB2YXIgaW5kZXggPSAkdGFyZ2V0LmRhdGEoXCJpbmRleFwiKTtcclxuICAgIFxyXG4gICAgLy8gQ2xpY2tlZCBvbiB0aGUgYWN0aXZlIGltYWdlIC0gbm8gbmVlZCB0byBkbyBhbnl0aGluZ1xyXG4gICAgaWYgKHRoaXMuX2luZGV4ID09PSBpbmRleCkgcmV0dXJuO1xyXG5cclxuICAgIHRoaXMuX3N3aXRjaEFjdGl2ZUltYWdlKGluZGV4KTsgIFxyXG59OyIsIm1vZHVsZS5leHBvcnRzID0gTWFpbk5hdjtcclxuXHJcbmZ1bmN0aW9uIE1haW5OYXYobG9hZGVyKSB7XHJcbiAgICB0aGlzLl9sb2FkZXIgPSBsb2FkZXI7XHJcbiAgICB0aGlzLl8kbmF2ID0gJChcIiNtYWluLW5hdlwiKTtcclxuICAgIHRoaXMuXyRuYXZMaW5rcyA9IHRoaXMuXyRuYXYuZmluZChcImFcIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2ID0gdGhpcy5fJG5hdkxpbmtzLmZpbmQoXCIuYWN0aXZlXCIpOyBcclxuICAgIHRoaXMuXyRuYXZMaW5rcy5vbihcImNsaWNrXCIsIHRoaXMuX29uTmF2Q2xpY2suYmluZCh0aGlzKSk7XHJcbn1cclxuXHJcbk1haW5OYXYucHJvdG90eXBlLnNldEFjdGl2ZUZyb21VcmwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl9kZWFjdGl2YXRlKCk7XHJcbiAgICB2YXIgdXJsID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICBpZiAodXJsID09PSBcIi9pbmRleC5odG1sXCIgfHwgdXJsID09PSBcIi9cIikge1xyXG4gICAgICAgIHRoaXMuX2FjdGl2YXRlTGluayh0aGlzLl8kbmF2TGlua3MuZmlsdGVyKFwiI2Fib3V0LWxpbmtcIikpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAodXJsID09PSBcIi93b3JrLmh0bWxcIikgeyAgICAgICAgXHJcbiAgICAgICAgdGhpcy5fYWN0aXZhdGVMaW5rKHRoaXMuXyRuYXZMaW5rcy5maWx0ZXIoXCIjd29yay1saW5rXCIpKTtcclxuICAgIH1cclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9kZWFjdGl2YXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgaWYgKHRoaXMuXyRhY3RpdmVOYXYubGVuZ3RoKSB7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdi5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgICAgICB0aGlzLl8kYWN0aXZlTmF2ID0gJCgpO1xyXG4gICAgfTtcclxufTtcclxuXHJcbk1haW5OYXYucHJvdG90eXBlLl9hY3RpdmF0ZUxpbmsgPSBmdW5jdGlvbiAoJGxpbmspIHtcclxuICAgICRsaW5rLmFkZENsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgdGhpcy5fJGFjdGl2ZU5hdiA9ICRsaW5rO1xyXG59O1xyXG5cclxuTWFpbk5hdi5wcm90b3R5cGUuX29uTmF2Q2xpY2sgPSBmdW5jdGlvbiAoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIC8vIENsb3NlIHRoZSBuYXYuIFRoaXMgb25seSBtYXR0ZXJzIGlmIHdlIGFyZSBvbiBtb2JpbGVcclxuICAgIHRoaXMuXyRuYXYuY29sbGFwc2UoXCJoaWRlXCIpO1xyXG5cclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgaWYgKCR0YXJnZXQuaXModGhpcy5fJGFjdGl2ZU5hdikpIHJldHVybjtcclxuXHJcbiAgICB0aGlzLl9kZWFjdGl2YXRlKCk7XHJcbiAgICB0aGlzLl9hY3RpdmF0ZUxpbmsoJHRhcmdldCk7XHJcblxyXG4gICAgdmFyIHVybCA9ICR0YXJnZXQuYXR0cihcImhyZWZcIik7XHJcbiAgICB0aGlzLl9sb2FkZXIubG9hZFBhZ2UodXJsLCB7fSwgdHJ1ZSk7ICAgIFxyXG59OyIsInZhciBMb2FkZXIgPSByZXF1aXJlKFwiLi9wYWdlLWxvYWRlci5qc1wiKTtcclxudmFyIE1haW5OYXYgPSByZXF1aXJlKFwiLi9tYWluLW5hdi5qc1wiKTtcclxudmFyIEhvdmVyU2xpZGVzaG93cyA9IHJlcXVpcmUoXCIuL2hvdmVyLXNsaWRlc2hvdy5qc1wiKTtcclxudmFyIFBvcnRmb2xpb0ZpbHRlciA9IHJlcXVpcmUoXCIuL3BvcnRmb2xpby1maWx0ZXIuanNcIik7XHJcbnZhciBJbWFnZUdhbGxlcmllcyA9IHJlcXVpcmUoXCIuL2ltYWdlLWdhbGxlcnkuanNcIik7XHJcblxyXG4vLyBBSkFYIHBhZ2UgbG9hZGVyLCB3aXRoIGNhbGxiYWNrIGZvciByZWxvYWRpbmcgd2lkZ2V0c1xyXG52YXIgbG9hZGVyID0gbmV3IExvYWRlcihvblBhZ2VMb2FkKTtcclxuXHJcbi8vIE1haW4gbmF2IHdpZGdldFxyXG52YXIgbWFpbk5hdiA9IG5ldyBNYWluTmF2KGxvYWRlcik7XHJcblxyXG4vLyBXaWRnZXQgZ2xvYmFsc1xyXG52YXIgaG92ZXJTbGlkZXNob3dzLCBwb3J0Zm9saW9GaWx0ZXIsIGltYWdlR2FsbGVyaWVzO1xyXG5cclxuLy8gTG9hZCBhbGwgd2lkZ2V0c1xyXG5vblBhZ2VMb2FkKCk7XHJcblxyXG4vLyBIYW5kbGUgYmFjay9mb3J3YXJkIGJ1dHRvbnNcclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBvblBvcFN0YXRlKTtcclxuXHJcbmZ1bmN0aW9uIG9uUG9wU3RhdGUoZSkge1xyXG4gICAgLy8gTG9hZGVyIHN0b3JlcyBjdXN0b20gZGF0YSBpbiB0aGUgc3RhdGUgLSBpbmNsdWRpbmcgdGhlIHVybCBhbmQgdGhlIHF1ZXJ5XHJcbiAgICB2YXIgdXJsID0gKGUuc3RhdGUgJiYgZS5zdGF0ZS51cmwpIHx8IFwiL2luZGV4Lmh0bWxcIjtcclxuICAgIHZhciBxdWVyeU9iamVjdCA9IChlLnN0YXRlICYmIGUuc3RhdGUucXVlcnkpIHx8IHt9O1xyXG5cclxuICAgIGlmICgodXJsID09PSBsb2FkZXIuZ2V0TG9hZGVkUGF0aCgpKSAmJiAodXJsID09PSBcIi93b3JrLmh0bWxcIikpIHtcclxuICAgICAgICAvLyBUaGUgY3VycmVudCAmIHByZXZpb3VzIGxvYWRlZCBzdGF0ZXMgd2VyZSB3b3JrLmh0bWwsIHNvIGp1c3QgcmVmaWx0ZXJcclxuICAgICAgICB2YXIgY2F0ZWdvcnkgPSBxdWVyeU9iamVjdC5jYXRlZ29yeSB8fCBcImFsbFwiO1xyXG4gICAgICAgIHBvcnRmb2xpb0ZpbHRlci5zZWxlY3RDYXRlZ29yeShjYXRlZ29yeSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIExvYWQgdGhlIG5ldyBwYWdlXHJcbiAgICAgICAgbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIGZhbHNlKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gb25QYWdlTG9hZCgpIHtcclxuICAgIC8vIFJlbG9hZCBhbGwgcGx1Z2lucy93aWRnZXRzXHJcbiAgICBob3ZlclNsaWRlc2hvd3MgPSBuZXcgSG92ZXJTbGlkZXNob3dzKCk7XHJcbiAgICBwb3J0Zm9saW9GaWx0ZXIgPSBuZXcgUG9ydGZvbGlvRmlsdGVyKGxvYWRlcik7XHJcbiAgICBpbWFnZUdhbGxlcmllcyA9IG5ldyBJbWFnZUdhbGxlcmllcygpO1xyXG4gICAgb2JqZWN0Rml0SW1hZ2VzKCk7XHJcbiAgICBzbWFydHF1b3RlcygpO1xyXG5cclxuICAgIC8vIFNsaWdodGx5IHJlZHVuZGFudCwgYnV0IHVwZGF0ZSB0aGUgbWFpbiBuYXYgdXNpbmcgdGhlIGN1cnJlbnQgVVJMLiBUaGlzXHJcbiAgICAvLyBpcyBpbXBvcnRhbnQgaWYgYSBwYWdlIGlzIGxvYWRlZCBieSB0eXBpbmcgYSBmdWxsIFVSTCAoZS5nLiBnb2luZ1xyXG4gICAgLy8gZGlyZWN0bHkgdG8gL3dvcmsuaHRtbCkgb3Igd2hlbiBtb3ZpbmcgZnJvbSB3b3JrLmh0bWwgdG8gYSBwcm9qZWN0LiBcclxuICAgIG1haW5OYXYuc2V0QWN0aXZlRnJvbVVybCgpO1xyXG59XHJcblxyXG4vLyBXZSd2ZSBoaXQgdGhlIGxhbmRpbmcgcGFnZSwgbG9hZCB0aGUgYWJvdXQgcGFnZVxyXG4vLyBpZiAobG9jYXRpb24ucGF0aG5hbWUubWF0Y2goL14oXFwvfFxcL2luZGV4Lmh0bWx8aW5kZXguaHRtbCkkLykpIHtcclxuLy8gICAgIGxvYWRlci5sb2FkUGFnZShcIi9hYm91dC5odG1sXCIsIHt9LCBmYWxzZSk7XHJcbi8vIH0iLCJtb2R1bGUuZXhwb3J0cyA9IExvYWRlcjtcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG5mdW5jdGlvbiBMb2FkZXIob25SZWxvYWQsIGZhZGVEdXJhdGlvbikge1xyXG4gICAgdGhpcy5fJGNvbnRlbnQgPSAkKFwiI2NvbnRlbnRcIik7XHJcbiAgICB0aGlzLl9vblJlbG9hZCA9IG9uUmVsb2FkO1xyXG4gICAgdGhpcy5fZmFkZUR1cmF0aW9uID0gKGZhZGVEdXJhdGlvbiAhPT0gdW5kZWZpbmVkKSA/IGZhZGVEdXJhdGlvbiA6IDI1MDtcclxuICAgIHRoaXMuX3BhdGggPSBsb2NhdGlvbi5wYXRobmFtZTtcclxufVxyXG5cclxuTG9hZGVyLnByb3RvdHlwZS5nZXRMb2FkZWRQYXRoID0gZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX3BhdGg7XHJcbn07XHJcblxyXG5Mb2FkZXIucHJvdG90eXBlLmxvYWRQYWdlID0gZnVuY3Rpb24gKHVybCwgcXVlcnlPYmplY3QsIHNob3VsZFB1c2hIaXN0b3J5KSB7XHJcbiAgICAvLyBGYWRlIHRoZW4gZW1wdHkgdGhlIGN1cnJlbnQgY29udGVudHNcclxuICAgIHRoaXMuXyRjb250ZW50LnZlbG9jaXR5KHsgb3BhY2l0eTogMCB9LCB0aGlzLl9mYWRlRHVyYXRpb24sIFwic3dpbmdcIixcclxuICAgICAgICBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fJGNvbnRlbnQuZW1wdHkoKTtcclxuICAgICAgICB0aGlzLl8kY29udGVudC5sb2FkKHVybCArIFwiICNjb250ZW50XCIsIG9uQ29udGVudEZldGNoZWQuYmluZCh0aGlzKSk7XHJcbiAgICB9LmJpbmQodGhpcykpO1xyXG5cclxuICAgIC8vIEZhZGUgdGhlIG5ldyBjb250ZW50IGluIGFmdGVyIGl0IGhhcyBiZWVuIGZldGNoZWRcclxuICAgIGZ1bmN0aW9uIG9uQ29udGVudEZldGNoZWQocmVzcG9uc2VUZXh0LCB0ZXh0U3RhdHVzLCBqcVhocikge1xyXG4gICAgICAgIGlmICh0ZXh0U3RhdHVzID09PSBcImVycm9yXCIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJUaGVyZSB3YXMgYSBwcm9ibGVtIGxvYWRpbmcgdGhlIHBhZ2UuXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcXVlcnlTdHJpbmcgPSB1dGlsaXRpZXMuY3JlYXRlUXVlcnlTdHJpbmcocXVlcnlPYmplY3QpO1xyXG4gICAgICAgIGlmIChzaG91bGRQdXNoSGlzdG9yeSkge1xyXG4gICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7XHJcbiAgICAgICAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgICAgICAgIHF1ZXJ5OiBxdWVyeU9iamVjdFxyXG4gICAgICAgICAgICB9LCBudWxsLCB1cmwgKyBxdWVyeVN0cmluZyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLl9wYXRoID0gbG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICAgICAgdGhpcy5fJGNvbnRlbnQudmVsb2NpdHkoeyBvcGFjaXR5OiAxIH0sIHRoaXMuX2ZhZGVEdXJhdGlvbiwgXHJcbiAgICAgICAgICAgIFwic3dpbmdcIik7XHJcbiAgICAgICAgdGhpcy5fb25SZWxvYWQoKTtcclxuICAgIH1cclxufTsiLCJtb2R1bGUuZXhwb3J0cyA9IFBvcnRmb2xpb0ZpbHRlcjtcclxuXHJcbnZhciB1dGlsaXRpZXMgPSByZXF1aXJlKFwiLi91dGlsaXRpZXMuanNcIik7XHJcblxyXG52YXIgZGVmYXVsdEJyZWFrcG9pbnRzID0gW1xyXG4gICAgeyB3aWR0aDogMTIwMCwgY29sczogMywgc3BhY2luZzogMTUgfSxcclxuICAgIHsgd2lkdGg6IDk5MiwgY29sczogMywgc3BhY2luZzogMTUgfSxcclxuICAgIHsgd2lkdGg6IDcwMCwgY29sczogMywgc3BhY2luZzogMTUgfSxcclxuICAgIHsgd2lkdGg6IDYwMCwgY29sczogMiwgc3BhY2luZzogMTAgfSxcclxuICAgIHsgd2lkdGg6IDQ4MCwgY29sczogMiwgc3BhY2luZzogMTAgfSxcclxuICAgIHsgd2lkdGg6IDMyMCwgY29sczogMSwgc3BhY2luZzogMTAgfVxyXG5dO1xyXG5cclxuZnVuY3Rpb24gUG9ydGZvbGlvRmlsdGVyKGxvYWRlciwgYnJlYWtwb2ludHMsIGFzcGVjdFJhdGlvLCB0cmFuc2l0aW9uRHVyYXRpb24pIHtcclxuICAgIHRoaXMuX2xvYWRlciA9IGxvYWRlcjtcclxuICAgIHRoaXMuX2dyaWRTcGFjaW5nID0gMDtcclxuICAgIHRoaXMuX2FzcGVjdFJhdGlvID0gKGFzcGVjdFJhdGlvICE9PSB1bmRlZmluZWQpID8gYXNwZWN0UmF0aW8gOiAoMTYvOSk7XHJcbiAgICB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24gPSAodHJhbnNpdGlvbkR1cmF0aW9uICE9PSB1bmRlZmluZWQpID8gXHJcbiAgICAgICAgdHJhbnNpdGlvbkR1cmF0aW9uIDogODAwO1xyXG4gICAgdGhpcy5fYnJlYWtwb2ludHMgPSAoYnJlYWtwb2ludHMgIT09IHVuZGVmaW5lZCkgPyBcclxuICAgICAgICBicmVha3BvaW50cy5zbGljZSgpIDogZGVmYXVsdEJyZWFrcG9pbnRzLnNsaWNlKCk7XHJcbiAgICB0aGlzLl8kZ3JpZCA9ICQoXCIjcG9ydGZvbGlvLWdyaWRcIik7XHJcbiAgICB0aGlzLl8kbmF2ID0gJChcIiNwb3J0Zm9saW8tbmF2XCIpO1xyXG4gICAgdGhpcy5fJHByb2plY3RzID0gW107XHJcbiAgICB0aGlzLl8kY2F0ZWdvcmllcyA9IHt9O1xyXG4gICAgdGhpcy5fcm93cyA9IDA7XHJcbiAgICB0aGlzLl9jb2xzID0gMDtcclxuICAgIHRoaXMuX2ltYWdlSGVpZ2h0ID0gMDtcclxuICAgIHRoaXMuX2ltYWdlV2lkdGggPSAwO1xyXG5cclxuICAgIC8vIFNvcnQgdGhlIGJyZWFrcG9pbnRzIGluIGRlc2NlbmRpbmcgb3JkZXJcclxuICAgIHRoaXMuX2JyZWFrcG9pbnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgIGlmIChhLndpZHRoIDwgYi53aWR0aCkgcmV0dXJuIC0xO1xyXG4gICAgICAgIGVsc2UgaWYgKGEud2lkdGggPiBiLndpZHRoKSByZXR1cm4gMTtcclxuICAgICAgICBlbHNlIHJldHVybiAwO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fY2FjaGVQcm9qZWN0cygpO1xyXG4gICAgdGhpcy5fY3JlYXRlR3JpZCgpO1xyXG5cclxuICAgIHRoaXMuXyRncmlkLmZpbmQoXCIucHJvamVjdCBhXCIpLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25Qcm9qZWN0Q2xpY2suYmluZCh0aGlzKSk7XHJcblxyXG4gICAgdmFyIHFzID0gdXRpbGl0aWVzLmdldFF1ZXJ5UGFyYW1ldGVycygpO1xyXG4gICAgdmFyIGluaXRpYWxDYXRlZ29yeSA9IHFzLmNhdGVnb3J5IHx8IFwiYWxsXCI7XHJcbiAgICB2YXIgY2F0ZWdvcnkgPSBpbml0aWFsQ2F0ZWdvcnkudG9Mb3dlckNhc2UoKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gdGhpcy5fJG5hdi5maW5kKFwiYVtkYXRhLWNhdGVnb3J5PVwiICsgY2F0ZWdvcnkgKyBcIl1cIik7XHJcbiAgICB0aGlzLl8kYWN0aXZlTmF2SXRlbS5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgIHRoaXMuX2ZpbHRlclByb2plY3RzKGNhdGVnb3J5KTtcclxuICAgICQoXCIjcG9ydGZvbGlvLW5hdiBhXCIpLm9uKFwiY2xpY2tcIiwgdGhpcy5fb25OYXZDbGljay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAkKHdpbmRvdykub24oXCJyZXNpemVcIiwgdGhpcy5fY3JlYXRlR3JpZC5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5zZWxlY3RDYXRlZ29yeSA9IGZ1bmN0aW9uIChjYXRlZ29yeSkge1xyXG4gICAgY2F0ZWdvcnkgPSAoY2F0ZWdvcnkgJiYgY2F0ZWdvcnkudG9Mb3dlckNhc2UoKSkgfHwgXCJhbGxcIjtcclxuICAgIHZhciAkc2VsZWN0ZWROYXYgPSB0aGlzLl8kbmF2LmZpbmQoXCJhW2RhdGEtY2F0ZWdvcnk9XCIgKyBjYXRlZ29yeSArIFwiXVwiKTtcclxuICAgIGlmICgkc2VsZWN0ZWROYXYubGVuZ3RoICYmICEkc2VsZWN0ZWROYXYuaXModGhpcy5fJGFjdGl2ZU5hdkl0ZW0pKSB7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0ucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0gPSAkc2VsZWN0ZWROYXY7XHJcbiAgICAgICAgdGhpcy5fJGFjdGl2ZU5hdkl0ZW0uYWRkQ2xhc3MoXCJhY3RpdmVcIik7XHJcbiAgICAgICAgdGhpcy5fZmlsdGVyUHJvamVjdHMoY2F0ZWdvcnkpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZmlsdGVyUHJvamVjdHMgPSBmdW5jdGlvbiAoY2F0ZWdvcnkpIHtcclxuICAgIHZhciAkc2VsZWN0ZWRFbGVtZW50cyA9IHRoaXMuX2dldFByb2plY3RzSW5DYXRlZ29yeShjYXRlZ29yeSk7XHJcblxyXG4gICAgLy8gQW5pbWF0ZSB0aGUgZ3JpZCB0byB0aGUgY29ycmVjdCBoZWlnaHQgdG8gY29udGFpbiB0aGUgcm93c1xyXG4gICAgdGhpcy5fYW5pbWF0ZUdyaWRIZWlnaHQoJHNlbGVjdGVkRWxlbWVudHMubGVuZ3RoKTtcclxuICAgIFxyXG4gICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBwcm9qZWN0c1xyXG4gICAgdGhpcy5fJHByb2plY3RzLmZvckVhY2goZnVuY3Rpb24gKCRlbGVtZW50KSB7XHJcbiAgICAgICAgLy8gU3RvcCBhbGwgYW5pbWF0aW9uc1xyXG4gICAgICAgICRlbGVtZW50LnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgICAgICAvLyBJZiBhbiBlbGVtZW50IGlzIG5vdCBzZWxlY3RlZDogZHJvcCB6LWluZGV4ICYgYW5pbWF0ZSBvcGFjaXR5IC0+IGhpZGVcclxuICAgICAgICB2YXIgc2VsZWN0ZWRJbmRleCA9ICRzZWxlY3RlZEVsZW1lbnRzLmluZGV4T2YoJGVsZW1lbnQpOyBcclxuICAgICAgICBpZiAoc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgJGVsZW1lbnQuY3NzKFwiekluZGV4XCIsIC0xKTtcclxuICAgICAgICAgICAgJGVsZW1lbnQudmVsb2NpdHkoe1xyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMFxyXG4gICAgICAgICAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFwiZWFzZUluT3V0Q3ViaWNcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgJGVsZW1lbnQuaGlkZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gSWYgYW4gZWxlbWVudCBpcyBzZWxlY3RlZDogc2hvdyAmIGJ1bXAgei1pbmRleCAmIGFuaW1hdGUgdG8gcG9zaXRpb24gXHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICRlbGVtZW50LnNob3coKTtcclxuICAgICAgICAgICAgJGVsZW1lbnQuY3NzKFwiekluZGV4XCIsIDApO1xyXG4gICAgICAgICAgICB2YXIgbmV3UG9zID0gdGhpcy5faW5kZXhUb1hZKHNlbGVjdGVkSW5kZXgpO1xyXG4gICAgICAgICAgICAkZWxlbWVudC52ZWxvY2l0eSh7IFxyXG4gICAgICAgICAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICAgICAgICAgIHRvcDogbmV3UG9zLnkgKyBcInB4XCIsXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBuZXdQb3MueCArIFwicHhcIlxyXG4gICAgICAgICAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24sIFwiZWFzZUluT3V0Q3ViaWNcIik7XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufVxyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fYW5pbWF0ZUdyaWRIZWlnaHQgPSBmdW5jdGlvbiAobnVtRWxlbWVudHMpIHtcclxuICAgIHRoaXMuXyRncmlkLnZlbG9jaXR5KFwic3RvcFwiKTtcclxuICAgIHZhciBjdXJSb3dzID0gTWF0aC5jZWlsKG51bUVsZW1lbnRzIC8gdGhpcy5fY29scyk7XHJcbiAgICB0aGlzLl8kZ3JpZC52ZWxvY2l0eSh7XHJcbiAgICAgICAgaGVpZ2h0OiB0aGlzLl9pbWFnZUhlaWdodCAqIGN1clJvd3MgKyBcclxuICAgICAgICAgICAgdGhpcy5fZ3JpZFNwYWNpbmcgKiAoY3VyUm93cyAtIDEpICsgXCJweFwiXHJcbiAgICB9LCB0aGlzLl90cmFuc2l0aW9uRHVyYXRpb24pO1xyXG59O1xyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5fZ2V0UHJvamVjdHNJbkNhdGVnb3J5ID0gZnVuY3Rpb24gKGNhdGVnb3J5KSB7XHJcbiAgICBpZiAoY2F0ZWdvcnkgPT09IFwiYWxsXCIpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5fJHByb2plY3RzO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gKHRoaXMuXyRjYXRlZ29yaWVzW2NhdGVnb3J5XSB8fCBbXSk7XHJcbiAgICB9ICAgICAgICBcclxufTtcclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhY2hlUHJvamVjdHMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB0aGlzLl8kcHJvamVjdHMgPSBbXTtcclxuICAgIHRoaXMuXyRjYXRlZ29yaWVzID0ge307XHJcbiAgICB0aGlzLl8kZ3JpZC5maW5kKFwiLnByb2plY3RcIikuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xyXG4gICAgICAgIHRoaXMuXyRwcm9qZWN0cy5wdXNoKCRlbGVtZW50KTtcclxuICAgICAgICB2YXIgY2F0ZWdvcnlOYW1lcyA9ICRlbGVtZW50LmRhdGEoXCJjYXRlZ29yaWVzXCIpLnNwbGl0KFwiLFwiKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhdGVnb3J5TmFtZXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICAgICAgdmFyIGNhdGVnb3J5ID0gJC50cmltKGNhdGVnb3J5TmFtZXNbaV0pLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl8kY2F0ZWdvcmllc1tjYXRlZ29yeV0gPSBbJGVsZW1lbnRdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fJGNhdGVnb3JpZXNbY2F0ZWdvcnldLnB1c2goJGVsZW1lbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfS5iaW5kKHRoaXMpKTtcclxufTtcclxuXHJcbi8vIFBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX2NhbGN1bGF0ZUdyaWQgPSBmdW5jdGlvbiAoKSB7XHJcbi8vICAgICB2YXIgZ3JpZFdpZHRoID0gdGhpcy5fJGdyaWQuaW5uZXJXaWR0aCgpO1xyXG4vLyAgICAgdGhpcy5fY29scyA9IE1hdGguZmxvb3IoKGdyaWRXaWR0aCArIHRoaXMuX2dyaWRTcGFjaW5nKSAvIFxyXG4vLyAgICAgICAgICh0aGlzLl9taW5JbWFnZVdpZHRoICsgdGhpcy5fZ3JpZFNwYWNpbmcpKTtcclxuLy8gICAgIHRoaXMuX3Jvd3MgPSBNYXRoLmNlaWwodGhpcy5fJHByb2plY3RzLmxlbmd0aCAvIHRoaXMuX2NvbHMpO1xyXG4vLyAgICAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAoKHRoaXMuX2NvbHMgLSAxKSAqIHRoaXMuX2dyaWRTcGFjaW5nKSkgLyBcclxuLy8gICAgICAgICB0aGlzLl9jb2xzO1xyXG4vLyAgICAgdGhpcy5faW1hZ2VIZWlnaHQgPSB0aGlzLl9pbWFnZVdpZHRoICogKDEgLyB0aGlzLl9hc3BlY3RSYXRpbyk7XHJcbi8vIH07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jYWxjdWxhdGVHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdmFyIGdyaWRXaWR0aCA9IHRoaXMuXyRncmlkLmlubmVyV2lkdGgoKTtcclxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fYnJlYWtwb2ludHMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICBpZiAoZ3JpZFdpZHRoIDw9IHRoaXMuX2JyZWFrcG9pbnRzW2ldLndpZHRoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbHMgPSB0aGlzLl9icmVha3BvaW50c1tpXS5jb2xzO1xyXG4gICAgICAgICAgICB0aGlzLl9ncmlkU3BhY2luZyA9IHRoaXMuX2JyZWFrcG9pbnRzW2ldLnNwYWNpbmc7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMuX3Jvd3MgPSBNYXRoLmNlaWwodGhpcy5fJHByb2plY3RzLmxlbmd0aCAvIHRoaXMuX2NvbHMpO1xyXG4gICAgdGhpcy5faW1hZ2VXaWR0aCA9IChncmlkV2lkdGggLSAoKHRoaXMuX2NvbHMgLSAxKSAqIHRoaXMuX2dyaWRTcGFjaW5nKSkgLyBcclxuICAgICAgICB0aGlzLl9jb2xzO1xyXG4gICAgdGhpcy5faW1hZ2VIZWlnaHQgPSB0aGlzLl9pbWFnZVdpZHRoICogKDEgLyB0aGlzLl9hc3BlY3RSYXRpbyk7XHJcbn07XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9jcmVhdGVHcmlkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgdGhpcy5fY2FsY3VsYXRlR3JpZCgpO1xyXG5cclxuICAgIHRoaXMuXyRncmlkLmNzcyhcInBvc2l0aW9uXCIsIFwicmVsYXRpdmVcIik7XHJcbiAgICB0aGlzLl8kZ3JpZC5jc3Moe1xyXG4gICAgICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKiB0aGlzLl9yb3dzICsgXHJcbiAgICAgICAgICAgIHRoaXMuX2dyaWRTcGFjaW5nICogKHRoaXMuX3Jvd3MgLSAxKSArIFwicHhcIlxyXG4gICAgfSk7ICAgIFxyXG5cclxuICAgIHRoaXMuXyRwcm9qZWN0cy5mb3JFYWNoKGZ1bmN0aW9uICgkZWxlbWVudCwgaW5kZXgpIHtcclxuICAgICAgICB2YXIgcG9zID0gdGhpcy5faW5kZXhUb1hZKGluZGV4KTtcclxuICAgICAgICAkZWxlbWVudC5jc3Moe1xyXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJhYnNvbHV0ZVwiLFxyXG4gICAgICAgICAgICB0b3A6IHBvcy55ICsgXCJweFwiLFxyXG4gICAgICAgICAgICBsZWZ0OiBwb3MueCArIFwicHhcIixcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuX2ltYWdlV2lkdGggKyBcInB4XCIsXHJcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5faW1hZ2VIZWlnaHQgKyBcInB4XCJcclxuICAgICAgICB9KTtcclxuICAgIH0uYmluZCh0aGlzKSk7ICAgIFxyXG59XHJcblxyXG5Qb3J0Zm9saW9GaWx0ZXIucHJvdG90eXBlLl9vbk5hdkNsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLnRhcmdldCk7XHJcbiAgICBpZiAoJHRhcmdldC5pcyh0aGlzLl8kYWN0aXZlTmF2SXRlbSkpIHJldHVybjtcclxuICAgIGlmICh0aGlzLl8kYWN0aXZlTmF2SXRlbS5sZW5ndGgpIHRoaXMuXyRhY3RpdmVOYXZJdGVtLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpO1xyXG4gICAgJHRhcmdldC5hZGRDbGFzcyhcImFjdGl2ZVwiKTtcclxuICAgIHRoaXMuXyRhY3RpdmVOYXZJdGVtID0gJHRhcmdldDtcclxuICAgIHZhciBjYXRlZ29yeSA9ICR0YXJnZXQuZGF0YShcImNhdGVnb3J5XCIpLnRvTG93ZXJDYXNlKCk7XHJcblxyXG4gICAgaGlzdG9yeS5wdXNoU3RhdGUoe1xyXG4gICAgICAgIHVybDogXCIvd29yay5odG1sXCIsXHJcbiAgICAgICAgcXVlcnk6IHsgY2F0ZWdvcnk6IGNhdGVnb3J5IH1cclxuICAgIH0sIG51bGwsIFwiL3dvcmsuaHRtbD9jYXRlZ29yeT1cIiArIGNhdGVnb3J5KTtcclxuXHJcbiAgICB0aGlzLl9maWx0ZXJQcm9qZWN0cyhjYXRlZ29yeSk7XHJcbn1cclxuXHJcblBvcnRmb2xpb0ZpbHRlci5wcm90b3R5cGUuX29uUHJvamVjdENsaWNrID0gZnVuY3Rpb24gKGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIHZhciAkdGFyZ2V0ID0gJChlLmN1cnJlbnRUYXJnZXQpO1xyXG4gICAgdmFyIHByb2plY3ROYW1lID0gJHRhcmdldC5kYXRhKFwibmFtZVwiKTtcclxuICAgIHZhciB1cmwgPSBcIi9wcm9qZWN0cy9cIiArIHByb2plY3ROYW1lICsgXCIuaHRtbFwiO1xyXG4gICAgdGhpcy5fbG9hZGVyLmxvYWRQYWdlKHVybCwge30sIHRydWUpO1xyXG59XHJcblxyXG5cclxuUG9ydGZvbGlvRmlsdGVyLnByb3RvdHlwZS5faW5kZXhUb1hZID0gZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICB2YXIgciA9IE1hdGguZmxvb3IoaW5kZXggLyB0aGlzLl9jb2xzKTtcclxuICAgIHZhciBjID0gaW5kZXggJSB0aGlzLl9jb2xzOyBcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgeDogYyAqIHRoaXMuX2ltYWdlV2lkdGggKyBjICogdGhpcy5fZ3JpZFNwYWNpbmcsXHJcbiAgICAgICAgeTogciAqIHRoaXMuX2ltYWdlSGVpZ2h0ICsgciAqIHRoaXMuX2dyaWRTcGFjaW5nXHJcbiAgICB9O1xyXG59IiwibW9kdWxlLmV4cG9ydHMuZ2V0UXVlcnlQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgLy8gQ2hlY2sgZm9yIHF1ZXJ5IHN0cmluZ1xyXG4gICAgcXMgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoO1xyXG4gICAgaWYgKHFzLmxlbmd0aCA8PSAxKSByZXR1cm4ge307XHJcbiAgICAvLyBRdWVyeSBzdHJpbmcgZXhpc3RzLCBwYXJzZSBpdCBpbnRvIGEgcXVlcnkgb2JqZWN0XHJcbiAgICBxcyA9IHFzLnN1YnN0cmluZygxKTsgLy8gUmVtb3ZlIHRoZSBcIj9cIiBkZWxpbWl0ZXJcclxuICAgIHZhciBrZXlWYWxQYWlycyA9IHFzLnNwbGl0KFwiJlwiKTtcclxuICAgIHZhciBxdWVyeU9iamVjdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlWYWxQYWlycy5sZW5ndGg7IGkgKz0gMSkge1xyXG4gICAgICAgIHZhciBrZXlWYWwgPSBrZXlWYWxQYWlyc1tpXS5zcGxpdChcIj1cIik7XHJcbiAgICAgICAgaWYgKGtleVZhbC5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgdmFyIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChrZXlWYWxbMF0pO1xyXG4gICAgICAgICAgICB2YXIgdmFsID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleVZhbFsxXSk7XHJcbiAgICAgICAgICAgIHF1ZXJ5T2JqZWN0W2tleV0gPSB2YWw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHF1ZXJ5T2JqZWN0O1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMuY3JlYXRlUXVlcnlTdHJpbmcgPSBmdW5jdGlvbiAocXVlcnlPYmplY3QpIHtcclxuICAgIGlmICh0eXBlb2YgcXVlcnlPYmplY3QgIT09IFwib2JqZWN0XCIpIHJldHVybiBcIlwiO1xyXG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhxdWVyeU9iamVjdCk7XHJcbiAgICBpZiAoa2V5cy5sZW5ndGggPT09IDApIHJldHVybiBcIlwiO1xyXG4gICAgdmFyIHF1ZXJ5U3RyaW5nID0gXCI/XCI7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpICs9IDEpIHtcclxuICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcclxuICAgICAgICB2YXIgdmFsID0gcXVlcnlPYmplY3Rba2V5XTtcclxuICAgICAgICBxdWVyeVN0cmluZyArPSBlbmNvZGVVUklDb21wb25lbnQoa2V5KSArIFwiPVwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHZhbCk7XHJcbiAgICAgICAgaWYgKGkgIT09IGtleXMubGVuZ3RoIC0gMSkgcXVlcnlTdHJpbmcgKz0gXCImXCI7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcXVlcnlTdHJpbmc7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cy53cmFwSW5kZXggPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xyXG4gICAgdmFyIHdyYXBwZWRJbmRleCA9IChpbmRleCAlIGxlbmd0aCk7IFxyXG4gICAgaWYgKHdyYXBwZWRJbmRleCA8IDApIHtcclxuICAgICAgICAvLyBJZiBuZWdhdGl2ZSwgZmxpcCB0aGUgaW5kZXggc28gdGhhdCAtMSBiZWNvbWVzIHRoZSBsYXN0IGl0ZW0gaW4gbGlzdCBcclxuICAgICAgICB3cmFwcGVkSW5kZXggPSBsZW5ndGggKyB3cmFwcGVkSW5kZXg7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gd3JhcHBlZEluZGV4O1xyXG59O1xyXG4iXX0=
