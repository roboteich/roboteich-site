"use strict";
var component = require("../../core/component");
var assign = require("object-assign");
var helpers = require("../../core/helpers");
var e = helpers.e;
var PIXI = require("pixi.js");

var defaultOptions = { reelSrc: "/video/project-reel.mp4", scaleMode: "cover" };

function reelFactory(el, instanceOptions) {
  var settings;
  var renderer;
  var state;
  var texture;
  var videoSprite;
  var video;
  var playing = false;

  var reelComponent = component.create({
    defaultProps: { autoplay: true },
    initialize: function(options) {
      settings = assign({}, defaultOptions, options);
      console.log("initialize: ", PIXI);
    },
    createChildren: function() {
      // renderer = PIXI.autoDetectRenderer(
      //   window.innerWidth,
      //   window.innerHeight,
      //   { transparent: true }
      // );
      // renderer.autoResize = true;
      // stage = new PIXI.Container();
      video = e("video")
        .cls("site-reel-video")
        .attr("webkit-playsinline", "")
        .attr("width", 1280)
        .attr("height", 720)
        .attr("playsinline", "")
        .attr("autoplay", "")
        .attr("preload", "auto")
        .attr("muted", "");

      // texture = PIXI.Texture.fromVideoUrl(settings.reelSrc);
      // videoSprite = new PIXI.Sprite(texture);
      // videoSprite.width = renderer.width;
      // videoSprite.height = renderer.height;
      //
      // stage.addChild(videoSprite);
      this.getEl().appendChild(video.el());

      video.attr("src", settings.reelSrc);
    },
    draw: function() {
      var videoEl = video.el();
      var el = this.getEl();
      var scale = Math.max(el.offsetWidth / 1280, el.offsetHeight / 720);
      videoEl.style.transform = "translate3d(-50%, -50%, 0) scale3d(" + scale +
        "," +
        scale +
        ",1)";

      console.log("draw");
    },
    didDraw: function() {},
    ready: function() {
      video.el().addEventListener("ended", handleVideoEnd.bind(this));

      if (this.getProps().autoplay) {
        this.play();
      }

      window.addEventListener("resize", handleResize.bind(this));
    },
    methods: {
      play: function() {
        playing = true;
        this.invalidate();
      },
      pause: function() {
        playing = false;
      }
    }
  });

  function handleResize() {
    this.invalidate();
  }

  function handleVideoEnd(e) {
    video.el().currentTime = 0;
    video.el().play();
  }

  return reelComponent(el, instanceOptions);
}

module.exports = reelFactory;
