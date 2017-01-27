"use strict";
// Provides a rudimentary, chainable way to create DOM elements
// e.g.: var el = e('div').id('my-div').cls('green blue').text('hello').el();
function elementCreationHelper(element) {
  var elem = element;
  if (typeof elem === "string") {
    elem = document.createElement(elem);
  } else if (!(elem instanceof Element)) {
    throw new TypeError("Argument must be a string or DOM Element.");
  }

  function computedStyle() {
    return window.getComputedStyle
      ? window.getComputedStyle(elem, null)
      : elem.currentStyle; // IE 8 and less
  }

  return {
    id: function id(idName) {
      elem.id = idName;
      return elementCreationHelper(elem);
    },
    cls: function cls(classNames) {
      elem.className = classNames;
      return elementCreationHelper(elem);
    },
    attr: function attr(name, value) {
      elem.setAttribute(name, value);
      return elementCreationHelper(elem);
    },
    append: function append() {
      var nodes = Array.isArray(arguments[0])
        ? arguments[0]
        : [].slice.call(arguments);

      nodes.forEach(function appendNode(node) {
        var n = typeof node.el === "function" ? node.el() : node;
        elem.appendChild(n);
      });
      return elementCreationHelper(elem);
    },
    text: function text(txt) {
      elem.appendChild(document.createTextNode(txt));
      return elementCreationHelper(elem);
    },
    el: function el() {
      return elem;
    },
    prop: function prop(propName, val) {
      elem[propName] = val;
    },
    computedStyle: computedStyle,
    isVisible: function isVisible() {
      return !(elem.offsetWidth === 0 && elem.offsetHeight === 0) &&
        computedStyle().visibility !== "hidden";
    }
  };
}

module.exports = {
  getUA: () => window.navigator.userAgent,
  isIPad: function isIPad() {
    var ua = this.getUA();
    ua.match(/iPad/i);
  },
  isIPhoneOrIPod: function isIPhone() {
    var ua = this.getUA();
    return ua.match(/iPhone/i) || ua.match(/iPod/i);
  },
  isAndroid: function isAndroid() {
    var ua = this.getUA();
    return ua.match(/android/i);
  },
  isAndroidOrIPad: function isAndroid() {
    var ua = this.getUA();
    return ua.match(/android/i) || ua.match(/iPad/i);
  },
  isMobile: function isMobile() {
    var ua = this.getUA();
    return ua.match(/android|iphone|ipod|ipad|iemobile/i);
  },
  element(tagName) {
    return function elementFactory() {
      return elementCreationHelper(tagName);
    };
  },
  e: elementCreationHelper
};
