React = require "react"
_ = require "lodash"
$ = require "jquery-browserify"
{partial, map} = _
Main = require "./ui.coffee"
appNode = document.getElementById("app")
log = (obj) -> console.log(JSON.stringify(obj, null ,2))

###
To build, run the following from the root of the project
browserify -x react -x lodash -x jquery-browserify -t coffeeify assets/client.coffee  -o assets/client.js
this runs browserify w/ external dependencies loaded from vendor.js and uses the coffeescript transform
###

appState =
  forms:
    token:
      error: ""
      inFlight: false
      value: ""
    batch:
      error: ""
      inFlight: false
      folderId: ""
      email: ""
      urls: []

  user:
    id: ""
    email: ""
    folders: []

#START transactions

transactions =
  updateUser: (newUser) ->
    appState.user.id = newUser.id
    appState.user.email = newUser.email

  updateFolders: (folders) ->
    appState.user.folders = folders
    log(folders)

  updateToken: (value) ->
    appState.forms.token.value = value

  lockForm: (formName) ->
    appState.forms[formName]?.inFlight = true

  unlockForm: (formName) ->
    appState.forms[formName]?.inFlight = false

  updateEmail: (email) ->
    appState.user.email = email

  displayErrorFor: (formName, msg) ->
    appState.forms[formName]?.error= msg

  clearErrorFor: (formName) ->
    appState.forms[formName]?.error = ""

#END transactions

#START functional helpers

formatFolder = ({id, folder_name}) ->
  id: id
  name: folder_name

#END functional helpers

#START Network calls

remotes =
  fetchUser: ->
    url = "https://api.page-vault.com/auth"
    displayError = partial(transactions.displayErrorFor, "token")
    clearError = partial(transactions.clearErrorFor, "token")
    lock = partial(transactions.lockForm, "token")
    unlock = partial(transactions.unlockForm, "token")
    token = appState.forms.token.value

    if token
      lock()
      $.ajax({
        type: "GET"
        dataType: "json"
        url: url
        data:
          token: token
        json: true
      })
      .done(transactions.updateUser)
      .fail((xhr) ->
        displayError(xhr.statusText)
        setTimeout(clearError, 4000)
      )
      .always(unlock)
    else
      displayError("No token provided")
      setTimeout(clearError, 4000)

  fetchFolders: ->
    url = "https://api.page-vault.com/folder"
    token = appState.forms.token.value
    
    if token
      $.ajax({
        type: "GET"
        dataType: "json"
        url: url
        data:
          token: token
        json: true
      })
      .done((folders) ->
        transactions.updateFolders(map(folders, formatFolder))
      )
      .fail((xhr) ->
        alert("Folders could not be loaded!")
      )

#END Network calls

draw = ->
  React.renderComponent(Main({
    appState: appState
    transactions: transactions
    remotes: remotes
  }), appNode)
  requestAnimationFrame(draw)

draw()