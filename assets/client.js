(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $, Main, React, appNode, appState, draw, formatFolder, log, map, partial, remotes, transactions, _;

React = require("react");

_ = require("lodash");

$ = require("jquery-browserify");

partial = _.partial, map = _.map;

Main = require("./ui.coffee");

appNode = document.getElementById("app");

log = function(obj) {
  return console.log(JSON.stringify(obj, null, 2));
};


/*
To build, run the following from the root of the project
browserify -x react -x lodash -x jquery-browserify -t coffeeify assets/client.coffee  -o assets/client.js
this runs browserify w/ external dependencies loaded from vendor.js and uses the coffeescript transform
 */

appState = {
  forms: {
    token: {
      error: "",
      inFlight: false,
      value: ""
    },
    batch: {
      error: "",
      inFlight: false,
      folderId: "",
      email: "",
      urls: []
    }
  },
  user: {
    id: "",
    email: "",
    folders: []
  }
};

transactions = {
  updateUser: function(newUser) {
    appState.user.id = newUser.id;
    return appState.user.email = newUser.email;
  },
  updateFolders: function(folders) {
    return appState.user.folders = folders;
  },
  updateToken: function(value) {
    return appState.forms.token.value = value;
  },
  lockForm: function(formName) {
    var _ref;
    return (_ref = appState.forms[formName]) != null ? _ref.inFlight = true : void 0;
  },
  unlockForm: function(formName) {
    var _ref;
    return (_ref = appState.forms[formName]) != null ? _ref.inFlight = false : void 0;
  },
  updateEmail: function(email) {
    return appState.forms.batch.email = email;
  },
  displayErrorFor: function(formName, msg) {
    var _ref;
    return (_ref = appState.forms[formName]) != null ? _ref.error = msg : void 0;
  },
  clearErrorFor: function(formName) {
    var _ref;
    return (_ref = appState.forms[formName]) != null ? _ref.error = "" : void 0;
  }
};

formatFolder = function(_arg) {
  var folder_name, id;
  id = _arg.id, folder_name = _arg.folder_name;
  return {
    id: id,
    name: folder_name
  };
};

remotes = {
  fetchUser: function() {
    var clearError, displayError, lock, token, unlock, url;
    url = "https://api.page-vault.com/auth";
    displayError = partial(transactions.displayErrorFor, "token");
    clearError = partial(transactions.clearErrorFor, "token");
    lock = partial(transactions.lockForm, "token");
    unlock = partial(transactions.unlockForm, "token");
    token = appState.forms.token.value;
    if (token) {
      lock();
      return $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        data: {
          token: token
        },
        json: true
      }).done(transactions.updateUser).fail(function(xhr) {
        displayError(xhr.statusText);
        return setTimeout(clearError, 4000);
      }).always(unlock);
    } else {
      displayError("No token provided");
      return setTimeout(clearError, 4000);
    }
  },
  fetchFolders: function() {
    var token, url;
    url = "https://api.page-vault.com/folder";
    token = appState.forms.token.value;
    if (token) {
      return $.ajax({
        type: "GET",
        dataType: "json",
        url: url,
        data: {
          token: token
        },
        json: true
      }).done(function(folders) {
        return transactions.updateFolders(map(folders, formatFolder));
      }).fail(function(xhr) {
        return alert("Folders could not be loaded!");
      });
    }
  },
  sendBatchRequest: function() {
    return alert("Batch request sent.  IMPLEMENT!");
  }
};

draw = function() {
  React.renderComponent(Main({
    appState: appState,
    transactions: transactions,
    remotes: remotes
  }), appNode);
  return requestAnimationFrame(draw);
};

draw();


},{"./ui.coffee":2,"jquery-browserify":"WRz1uS","lodash":"YNP8J9","react":"44ijaO"}],2:[function(require,module,exports){
var BatchForm, React, TokenForm, UserInfo, button, div, form, h1, h2, input, isEqual, label, map, option, select, span, table, td, th, tr, _ref, _ref1;

React = require("react");

_ref = require("lodash"), map = _ref.map, isEqual = _ref.isEqual;

_ref1 = React.DOM, table = _ref1.table, th = _ref1.th, tr = _ref1.tr, td = _ref1.td, button = _ref1.button, form = _ref1.form, label = _ref1.label, input = _ref1.input, select = _ref1.select, option = _ref1.option, div = _ref1.div, span = _ref1.span, h1 = _ref1.h1, h2 = _ref1.h2;

TokenForm = React.createClass({
  updateToken: function(e) {
    return this.props.transactions.updateToken(e.target.value);
  },
  submit: function(e) {
    e.preventDefault();
    this.props.remotes.fetchUser();
    return this.props.remotes.fetchFolders();
  },
  render: function() {
    return form({
      role: "form",
      className: "form-horizontal"
    }, span({
      className: "help-text"
    }, this.props.form.error), div({
      className: "form-group"
    }, label({
      className: "control-label col-xs-2"
    }, "token"), div({
      className: "col-xs-10"
    }, input({
      className: "form-control",
      onChange: this.updateToken,
      value: this.props.form.value,
      disabled: this.props.form.inFlight
    }))), div({
      className: "form-group"
    }, div({
      className: "col-xs-10 col-xs-offset-2"
    }, button({
      className: "btn btn-info",
      onClick: this.submit,
      disabled: this.props.form.inFlight
    }, "get user"))));
  }
});

UserInfo = React.createClass({
  render: function() {
    return table({
      className: "table table-hover"
    }, tr({
      className: "active"
    }, th({}, "email"), th({}, "id")), tr({
      className: "info"
    }, td({}, this.props.email), td({}, this.props.id)));
  }
});

BatchForm = React.createClass({
  updateEmail: function(e) {
    return this.props.transactions.updateEmail(e.target.value);
  },
  render: function() {
    return form({
      role: "form",
      className: "form-horizontal"
    }, span({
      className: "help-text"
    }, this.props.form.error), div({
      className: "form-group"
    }, label({
      className: "control-label col-xs-2"
    }, "email"), div({
      className: "col-xs-10"
    }, input({
      className: "form-control",
      onChange: this.updateEmail,
      value: this.props.form.email
    }))), div({
      className: "form-group"
    }, label({
      className: "control-label col-xs-2"
    }, "folder"), div({
      className: "col-xs-10"
    }, select({
      className: "form-control",
      onChange: this.updateFolderId,
      value: this.props.form.folderId
    }, map(this.props.folders, function(folder) {
      return option({
        value: folder.id,
        key: folder.id
      }, folder.name);
    })))));
  }
});

module.exports = React.createClass({
  shouldComponentUpdate: function(next) {
    return isEqual(next, this.props);
  },
  updateEmail: function(e) {
    return this.props.transactions.updateEmail(e.target.value);
  },
  render: function() {
    return div({
      className: "row"
    }, div({
      className: "col-xs-12"
    }, div({
      className: "form-container"
    }, TokenForm({
      transactions: {
        updateToken: this.props.transactions.updateToken
      },
      remotes: {
        fetchUser: this.props.remotes.fetchUser,
        fetchFolders: this.props.remotes.fetchFolders
      },
      form: this.props.appState.forms.token
    }), this.props.appState.user.id ? div({
      className: "row"
    }, div({
      className: "col-xs-10 col-xs-offset-2"
    }, UserInfo({
      email: this.props.appState.user.email,
      id: this.props.appState.user.id
    })), div({
      className: "col-xs-12"
    }, BatchForm({
      transactions: {
        updateEmail: this.props.transactions.updateEmail
      },
      remotes: {
        sendBatchRequest: this.props.remotes.sendBatchRequest
      },
      form: this.props.appState.forms.batch,
      folders: this.props.appState.user.folders
    }))) : void 0)));
  }
});


},{"lodash":"YNP8J9","react":"44ijaO"}]},{},[1])