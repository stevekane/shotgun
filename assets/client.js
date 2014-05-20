(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $, EmailInput, Main, React, appState, div, draw, h1, h2, input, label, select, span, _, _ref;

React = require("react");

_ = require("lodash");

$ = require("jquery-browserify");

_ref = React.DOM, label = _ref.label, input = _ref.input, select = _ref.select, div = _ref.div, span = _ref.span, h1 = _ref.h1, h2 = _ref.h2;

appState = {
  user: {
    id: "",
    email: ""
  },
  folderId: "",
  urls: []
};

EmailInput = React.createClass({
  handleInput: function(e) {
    return appState.user.email = e.target.value;
  },
  render: function() {
    return div({
      className: "form-row"
    }, span({
      className: "field-name"
    }, "email"), input({
      onChange: this.handleInput,
      value: this.props.email
    }));
  }
});

Main = React.createClass({
  render: function() {
    return div({
      className: "form"
    }, EmailInput({
      email: this.props.user.email
    }));
  }
});

draw = function() {
  React.renderComponent(Main(appState), document.body);
  return requestAnimationFrame(draw);
};

draw();


},{"jquery-browserify":"WRz1uS","lodash":"YNP8J9","react":"44ijaO"}]},{},[1])