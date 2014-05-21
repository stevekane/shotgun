React = require "react"
{table, th, tr, td, button, form, label, input, select, div, span, h1, h2} = React.DOM

TokenForm = React.createClass

  updateToken: (e) ->
    @props.transactions.updateToken(e.target.value)

  submit: (e) ->
    e.preventDefault()
    @props.remotes.fetchUser()
    @props.remotes.fetchFolders()

  render: ->
    form {role: "form", className: "form-horizontal"},
      span {className: "help-text"}, @props.form.error

      div {className: "form-group"},
        label {className: "control-label col-xs-2"}, "token"
        div {className: "col-xs-10"},
          input {
            className: "form-control",
            onChange: @updateToken,
            value: @props.form.value
            disabled: @props.form.inFlight
          }

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
        th {}, "folderCount"
      tr {className: "info"},
        td {}, @props.email
        td {}, @props.id
        td {}, @props.folderCount

module.exports = React.createClass

  updateEmail: (e) ->
    @props.transactions.updateEmail(e.target.value)

  render: ->
    div {className: "row"},
      div {className: "col-xs-12"},
        div {className: "form-container"},
          TokenForm
            transactions:
              updateToken: @props.transactions.updateToken
            remotes:
              fetchUser: @props.remotes.fetchUser
              fetchFolders: @props.remotes.fetchFolders
            form: @props.appState.forms.token

          if @props.appState.user.id
            form {role: "form", className: "form-horizontal"},
              UserInfo
                email: @props.appState.user.email
                id: @props.appState.user.id
                folderCount: @props.appState.user.folders.length

              span {className: "help-text"}, @props.appState.forms.batch.error

              div {className: "form-group"},
                label {className: "control-label col-xs-2"}, "email"
                div {className: "col-xs-10"},
                  input {
                    className: "form-control",
                    onChange: @updateEmail,
                    value: @props.appState.user.email
                  }
