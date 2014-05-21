React = require "react"
{map, partial, isEqual} = require "lodash"
{table, th, tr, td, ul, li, button, form, label, input, select, option, div, span, a, h1, h2} = React.DOM

isEnterKey = (keyCode) -> keyCode is 13

TokenForm = React.createClass

  updateToken: (e) ->
    @props.transactions.updateToken(e.target.value)

  submit: (e) ->
    e.preventDefault()
    @props.remotes.fetchUser()
    @props.remotes.fetchFolders()

  render: ->
    form {role: "form", className: "form-horizontal"},

      div {className: "form-group"},
        label {className: "control-label col-xs-2"}, "token"
        div {className: "col-xs-10"},
          input
            className: "form-control"
            onChange: @updateToken
            value: @props.form.value
            disabled: @props.form.inFlight
          span {className: "help-text"}, @props.form.error

      div {className: "form-group"},
        div {className: "col-xs-10 col-xs-offset-2"},
          button {
            className: "btn btn-info"
            onClick: @submit
            disabled: @props.form.inFlight
          }, "get user"

UserInfo = React.createClass

  render: ->
    table {className: "table table-hover"},
      tr {className: "active"},
        th {}, "email"
        th {}, "id"
      tr {className: "info"},
        td {}, @props.email
        td {}, @props.id

BatchForm = React.createClass

  updateEmail: (e) ->
    @props.transactions.updateEmail(e.target.value)

  updateFolderId: (e) ->
    @props.transactions.updateFolderId(e.target.value)

  updateNewUrlName: (e) ->
    @props.transactions.updateNewUrlName(e.target.value)

  handleKeyPress: (e) ->
    if isEnterKey(e.keyCode)
      e.preventDefault()
      @addUrl(e.target.value)

  addUrl: (value) ->
    @props.transactions.addUrl(value)

  render: ->
    removeUrl = @props.transactions.removeUrl

    folders = map @props.folders, (folder) ->
      option {value: folder.id, key: folder.id}, folder.name

    urls = map @props.form.urls, ({href, id}) ->
      removeSelf = (e) ->
        e.preventDefault()
        removeUrl(id)

      li {className: "row", href: href, key: id, target: "newtab"},
        div {className: "col-xs-2"},
          button {className: "btn btn-xs btn-danger", onClick: removeSelf}, "remove"
        div {className: "col-xs-10"}, href

    form {role: "form", className: "form-horizontal"},
      div {className: "form-group"},
        label {className: "control-label col-xs-2"}, "email"
        div {className: "col-xs-10"},
          input
            className: "form-control"
            onChange: @updateEmail
            value: @props.form.email

      div {className: "form-group"},
        label {className: "control-label col-xs-2"}, "folder"
        div {className: "col-xs-10"},
          select {
            className: "form-control"
            onChange: @updateFolderId
            value: @props.form.folderId
          }, folders

      div {className: "form-group"},
        label {className: "control-label col-xs-2"}, "add a url"
        div {className: "col-xs-10"},
          input
            className: "form-control"
            onChange: @updateNewUrlName
            onKeyPress: @handleKeyPress
            value: @props.form.newUrlName
            placeholder: "e.g. http://www.google.com"
          span {className: "help-text"}, @props.form.error

      div {className: "form-group"},
        ul {}, urls
        

module.exports = React.createClass

  shouldComponentUpdate: (next) ->
    isEqual(next, @props)

  render: ->
    div {},
      div {className: "row"},
        TokenForm
          transactions:
            updateToken: @props.transactions.updateToken
          remotes:
            fetchUser: @props.remotes.fetchUser
            fetchFolders: @props.remotes.fetchFolders
          form: @props.appState.forms.token

      if @props.appState.user.id
        div {className: "row"},
          UserInfo
            email: @props.appState.user.email
            id: @props.appState.user.id

      if @props.appState.user.id
        div {className: "row"},
          BatchForm
            transactions:
              updateEmail: @props.transactions.updateEmail
              updateFolderId: @props.transactions.updateFolderId
              updateNewUrlName: @props.transactions.updateNewUrlName
              addUrl: @props.transactions.addUrl
              removeUrl: @props.transactions.removeUrl
            remotes:
              sendBatchRequest: @props.remotes.sendBatchRequest
            form: @props.appState.forms.batch
            folders: @props.appState.user.folders
