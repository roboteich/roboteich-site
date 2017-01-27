var webfonts = require("webfontloader");
var createReelComponent = require("./components/reel/reel");

(function(_window, _document, fonts, _createReelComponent) {
  // model
  var state = {
    videoStarted: false,
    viewportWidth: null,
    viewportHeight: null
  };

  // elements
  var reelContainerEl;
  var reel;

  function main() {
    findEls();
    createChildren();
    loadAssets();
    console.log("main");
  }

  function findEls() {
    reelContainerEl = _document.getElementById("site-reel-viewport");
  }

  function createChildren() {
    reel = _createReelComponent(reelContainerEl, {});
  }

  function loadAssets() {
    loadFonts();
  }

  function loadFonts() {
    fonts.load({ google: { families: [ "Open Sans", "Montserrat" ] } });
  }

  function handleCoverClick() {}

  function handleReelStart() {}

  // startup
  _window.addEventListener("DOMContentLoaded", main);
})(window, document, webfonts, createReelComponent);
