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
  }

  function findEls() {
    reelContainerEl = _document.getElementById("site-main-hero");
  }

  function createChildren() {
    reel = _createReelComponent(reelContainerEl, {});
  }

  function loadAssets() {
    loadFonts();
  }

  function loadFonts() {
    fonts.load({ google: { families: [ "Lato:100,300" ] } });
  }

  function handleCoverClick() {}

  function handleReelStart() {}

  // startup
  _window.addEventListener("DOMContentLoaded", main);
})(window, document, webfonts, createReelComponent);
