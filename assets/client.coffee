parseUrl = require("url").parse
React = require "react"
_ = require "lodash"
$ = require "jquery-browserify"
uuid = require "node-uuid"
{partial, map} = _
Main = require "./ui.coffee"
appNode = document.getElementById("app")
log = (obj) -> console.log(JSON.stringify(obj, null ,2))

###
To build, run the following from the root of the project
browserify -x react -x lodash -x jquery-browserify -t coffeeify assets/client.coffee  -o assets/client.js
this runs browserify w/ external dependencies loaded from vendor.js and uses the coffeescript transform
###

#START Struct defs

Url = (href) ->
  href: href
  id: uuid.v4()

#END Struct defs


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
      newUrlName: ""
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

  updateToken: (value) ->
    appState.forms.token.value = value

  lockForm: (formName) ->
    appState.forms[formName]?.inFlight = true

  unlockForm: (formName) ->
    appState.forms[formName]?.inFlight = false

  updateEmail: (email) ->
    appState.forms.batch.email = email

  updateFolderId: (id) ->
    appState.forms.batch.folderId = id

  updateNewUrlName: (name) ->
    appState.forms.batch.newUrlName = name

  addUrl: (href) ->
    {protocol} = parseUrl(href)
    if (protocol)
      appState.forms.batch.urls.push(Url(href))
    else
      appState.forms.batch.error = "Must provide a protocol.  e.g. http"
      setTimeout((-> appState.forms.batch.error = ""), 4000)

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
      .done((user) ->
        transactions.updateUser(user)
        transactions.updateEmail(user.email)
      )
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

  sendBatchRequest: ->
    alert("Batch request sent.  IMPLEMENT!")

#END Network calls

#FOR TESTING PURPOSES
testUrls = [
  "http://www.google.com",
  "http://www.github.com",
  "http://www.reddit.com",
  "http://www.bing.com",
  "http://www.digg.com"
]

transactions.addUrl(url) for url in testUrls
#END TESTING

draw = ->
  React.renderComponent(Main({
    appState: appState
    transactions: transactions
    remotes: remotes
  }), appNode)
  requestAnimationFrame(draw)

draw()
