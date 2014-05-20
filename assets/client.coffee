React = require "react"
_ = require "lodash"
$ = require "jquery-browserify"
{label, input, select, div, span, h1, h2} = React.DOM

appState =
  user:
    id: ""
    email: ""
  folderId: ""
  urls: []

EmailInput = React.createClass
  handleInput: (e) ->
    appState.user.email = e.target.value

  render: ->
    div className: "form-row",
      span {className: "field-name"}, "email"
      input onChange: @handleInput, value: @props.email

Main = React.createClass
  render: ->
    div className: "form",
      EmailInput email: @props.user.email
        
draw = ->
  React.renderComponent(Main(appState), document.body)
  requestAnimationFrame(draw)

draw()
