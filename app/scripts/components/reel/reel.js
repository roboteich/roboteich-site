"use strict";
var component = require("../../core/component");
var assign = require("object-assign");

var defaultOptions = { reelSrc: "/video/project-reel.mp4" };

function reelFactory(el, instanceOptions) {
  var settings;
  var video;
  var playing = false;
  var videoUpdateAction;

  var reelComponent = component.create({
    defaultProps: { autoplay: true },
    initialize: function(options) {
      settings = assign({}, defaultOptions, options);
    },
    createChildren: function() {
      video = this.getEl().getElementsByClassName("site-reel-video")[0];
    },
    draw: function() {
      var videoEl = video;
      var el = this.getEl();
      var scale = Math.max(el.offsetWidth / 1280, el.offsetHeight / 720);
      videoEl.style.transform = "translate3d(-50%, -50%, 0) scale3d(" + scale +
        "," +
        scale +
        ",1)";
    },
    didDraw: function() {
      if(playing && !video.playing){
        video.src = settings.reelSrc;
      }
    },

    ready: function() {
      var videoUpdateAction = handleVideoUpdate.bind(this);
      video.addEventListener("ended", handleVideoEnd.bind(this));
      video.addEventListener("timeupdate", videoUpdateAction);

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

  function handleVideoEnd() {
    video.currentTime = 0;
    video.play();
  }

  function handleVideoUpdate() {
    var videoEl = video;
    if (videoEl.currentTime > 0) {
      videoEl.removeEventListener("timeupdate", videoUpdateAction);
      videoEl.classList.add("active");
    }
  }

  return reelComponent(el, instanceOptions);
}

module.exports = reelFactory;
