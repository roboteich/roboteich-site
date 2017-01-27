/**
* @fileOverview factory for quickly creating 'dumb' components
* @author <a href='mailto:rteichner@olson.com'>Ross Teichner</a>
*/

var renderFrame = require("./render-frame");
var assign = require("object-assign");
var EventEmitter = require("events").EventEmitter;

/**
* @class BaseComponent
*/
module.exports = function BaseComponent() {
  /**
  * Factory function that returns another factory function of component instances.
  * @param {Object} config - custom LifeCycle hooks and custom functionality to mixin
  * @param {Object} config.defaultProps - default set or property values merged into
  * each instance of a custom component at initialization.
  * @param {BaseComponent~initializeCallback} config.initialize - callback invoked
  * upon initialization of a new instance of the custom component
  * @param {Function} config.createChildren - called after initialization and before
  * first draw.  This is where a components template should be attached to it's
  * containing element (@see BaseComponent.create.el)
  * @param {Function} config.draw - called after creation of child elements and
  * after new properties have been recieved. Perform visual updates to any internal
  * elements based on current properties.
  * @param {Function} config.ready - called after first draw completes.  Attach
  * listeners to or configure other functionality.
  * @param {Function} config.didDraw - called after every draw.
  * @param {BaseComponent~shouldDrawCallback} config.shouldDraw - called after
  * property updates to compare properties before rendering.
  * @param {Object} config.methods - key/value pairs of method names and implementations.
  * each method will be added by key to an instance and called within it's scope.
  * @returns {function} - factory function to create instances of components
  */
  function create(config) {
    /**
    * Factory method for creating instances of custom components
    * @param {HTMLElement} el - HTMLElementContainer to render component into
    * @param {Object} options - custom settings passed on to component at initialization
    * @param {Object} options.props - prop values overriding factory defaultProps @see BaseComponent.config.defaultProps
    * @returns {CustomComponent} instance of a custom component.
    */
    return function componentFactory(el, options) {
      //------------------------------------
      // Utils
      //------------------------------------
      function run() {
        var method = arguments[0];
        var scope = arguments[1];
        var args = Array.prototype.slice.apply(arguments, [ 2 ]);
        if (method) {
          return method.apply(scope, args);
        }
      }

      //------------------------------------
      // Private Properties
      //------------------------------------
      var props = {};
      var drawAction;
      var mountAction;
      var nextProps;
      var invalidated = false;
      var initialized = false;

      //------------------------------------
      // LifeCycle Methods
      //------------------------------------
      function initialize() {
        var internalOptions = options || {};

        props = assign(props, config.defaultProps, internalOptions.props);
        mountAction = mount.bind(this);
        drawAction = draw.bind(this);

        run(config.initialize, this, internalOptions);
        run(createChildren, this);
        run(invalidate, this, mountAction, true);
      }

      function createChildren() {
        run(config.createChildren, this);
      }

      function ready() {
        initialized = true;
        run(config.ready, this);
      }

      function invalidate(action, force) {
        var willDraw = run(shouldDraw, this, force);

        if (nextProps) {
          props = nextProps;
          nextProps = null;
        }

        if (willDraw) {
          renderFrame.add(action);
        }
      }

      function invalidateAndDraw(force) {
        run(invalidate, this, drawAction, force);
      }

      function shouldDraw(force) {
        if (!invalidated) {
          if (!force && typeof config.shouldDraw === "function") {
            invalidated = run(config.shouldDraw, this, props, nextProps);
          } else {
            invalidated = true;
          }

          return invalidated;
        }

        return false;
      }

      function mount() {
        run(draw, this);
        run(ready, this);
      }

      function draw() {
        run(config.draw, this);
        invalidated = false;
        run(didDraw, this);
      }

      function didDraw() {
        run(config.didDraw, this);
      }

      function destroy() {
        if (invalidated) {
          if (initialized) {
            renderFrame.remove(drawAction);
          } else {
            renderFrame.remove(mountAction);
          }
          invalidated = false;
          initialized = false;
        }
        run(config.destroy, this);
        this.removeAllListeners();
      }

      //------------------------------------
      // Getter/Setter
      //------------------------------------
      function setProps(newProps) {
        nextProps = assign({}, props, newProps);
        run(config.willRecieveProps, this, newProps);
        run(invalidate, this, drawAction);
      }

      function getProps() {
        return props;
      }

      function getEl() {
        return el;
      }

      function isReady() {
        return initialized;
      }

      function isDrawn() {
        return !invalidated;
      }

      //------------------------------------
      // API
      //------------------------------------
      /**
      * @class component
      * Custom implementation of BaseComponent.
      * Hooks into LifeCycle methods to generate
      * custom markup from optional parameters.
      */
      var component = assign(
        new EventEmitter(),
        {
          /**
        * @returns {HTMLElement} - container element
        */
          getEl: getEl,
          /**
        * Set new properties and trigger potential redraw
        * @param {Object} newProps - key/values to override
        * @returns {Void}
        */
          setProps: setProps,
          /**
        * Get hash of properties
        * @returns {Object}
        */
          getProps: getProps,
          /**
        * Flag component for a redraw
        * @param {Boolean} force - force a redraw;
        * @returns {Void}
        */
          invalidate: invalidateAndDraw,
          /**
        * Whether component sub elements and properties have been rendered
        * @returns {Boolean}
        */
          isReady: isReady,
          /**
        * Whether current properties have been rendered
        * @returns {Boolean}
        */
          isDrawn: isDrawn,
          /**
        * Transmit messages over communication bus
        * @returns {Void}
        */
          destroy: destroy
        },
        config.methods
      );

      //------------------------------------
      // Iniitialization
      //------------------------------------
      run(initialize, component);

      return component;
    };
  }

  return { create: create };
}();
/**
* Called before any child components have been created to configure initial
* component state
* @callback initializeCallback
* @param {Object} options - initial options passed to the
* custom component on initialization
*/
/**
* Called before any child components have been created to configure initial
* component state
* @callback shouldDrawCallback
* @param {Object} prevProps - TODO
* @param {Object} nextProps - TODO
* @returns {Boolean} - true to invoke a redraw, false to override.
* custom component on initialization
*/
