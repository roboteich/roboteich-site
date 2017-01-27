// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
  var lastTime = 0;
  var vendors = [ "ms", "moz", "webkit", "o" ];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
    window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] ||
      window[vendors[x] + "CancelRequestAnimationFrame"];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(
        function() {
          callback(currTime + timeToCall);
        },
        timeToCall
      );
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
})();

/**
* @fileOverview centralized queue of animation frame renders.
* @author <a href="mailto:rteichner@olson.com">Ross Teichner</a>
*/
/**
* Render Frame.
* @module core/renderFrame
*/
//------------------------------------------------------
// Private Properties
//------------------------------------------------------
/** @private list of things to execute on renderFrame */
var queue = [];

/** @private id of nextAnimationFrame to run */
var nextFrame;

//------------------------------------------------------
// Public Methods
//------------------------------------------------------
/**
* Adds an action in central animation frame queue to invoke on next frame.
* @param {function} action function to invoke on next animation frame
* @return {Void} Void
*/
function addAction(action) {
  queue.push(action);
  requestFrame();
}

function removeAction(action) {
  queue = queue.filter(function(qAction) {
    var isAction = qAction === action;
    return !isAction;
  });
}

/**
* Cancels next frame execution
* @returns {Void} Void
*/
function cancelRun() {
  if (nextFrame !== null) {
    cancelAnimationFrame(nextFrame);
    reset();
  }
}

//------------------------------------------------------
// Private Methods
//------------------------------------------------------
// queues runActions to run on next frame
function requestFrame() {
  if (!nextFrame) {
    nextFrame = requestAnimationFrame(runActions);
  }
}

// clear properties for a new run
function reset() {
  nextFrame = null;
  queue.length = 0;
}

// invoke each queued action
function runActions() {
  var runQueue = queue.slice(0);
  reset();
  runQueue.forEach(function runAction(action) {
    action();
  });
}

//------------------------------------------------------
// Exports
//------------------------------------------------------
module.exports = { add: addAction, remove: removeAction, cancel: cancelRun };
// polyfill requestAnimationFrame https://gist.github.com/paulirish/1579671
