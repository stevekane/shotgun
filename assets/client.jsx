var input = React.DOM.input
  , select = React.DOM.select
  , div = React.DOM.div
  , span = React.DOM.span
  , h1 = React.DOM.h1
  , h2 = React.DOM.h2
  , url = "http://localhost:8080/process";

window.appState = {
  user: {
    id: "",
    email: "" 
  },
  folderId: "",
  urls: []
};

var sendRequest = function (appState, url) {
  var paylaod = {
    email: appState.user.email,
    user: appState.user.id,
    folderId: appState.folderId,
    urls: appState.urls
  };

  $.ajax({
    type: "POST",
    url: url,
    contentType: "application/json",
    data: JSON.stringify(payload),
    dataType: "json"
  })
  .success(function (result) {
    alert(results);
  })
  .fail(function (err) {
    alert(err);
  });
};

var EmailInput = React.createClass({
  handleInput: function (e) {
    appState.user.email = e.target.value;
  },

  render: function () {
    return input({
      onChange: this.handleInput,
      value: this.props.email
    });
  }
});

var Main = React.createClass({
  render: function () {
    return div({
      className: "form"
    }, 
      EmailInput({
        email: this.props.user.email       
      })
    );
  }
});

var draw = function draw () {
  React.renderComponent(Main(appState), document.body);
  requestAnimationFrame(draw);
};

requestAnimationFrame(draw);
