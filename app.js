
const express = require('express')
const bodyParser = require('body-parser')
const Alexa = require('ask-sdk')
const fs = require('fs')

// const _ = require('lodash')
// const hf = require('./helper_functions.js')
// const data = require('./data.js')
const db = require('./database.js')

let skill

// this link is just for development purposes, ngrok won't be used in production
const ngrok = 'https://3d5fe997.ngrok.io/'

const app = express()

app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('hello')
})

// ffmpeg -i <input-file> -ac 2 -codec:a libmp3lame -b:a 48k -ar 16000 <output-file.mp3>
app.get('/1', function (req, res) { fs.createReadStream('./audio/1.mp3').pipe(res) })
app.get('/2', function (req, res) { fs.createReadStream('./audio/2.mp3').pipe(res) })
app.get('/a', function (req, res) { fs.createReadStream('./audio/geburtstagstanz.mp3').pipe(res) })
app.get('/b', function (req, res) { fs.createReadStream('./audio/zau_zaubert.mp3').pipe(res) })
app.get('/c', function (req, res) { fs.createReadStream('./audio/schneller_teller.mp3').pipe(res) })

app.post('/', function (req, res) {
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        launchHandler,
        lectionHandler,
        lectionPlayHandler,
        lectionContinueHandler,
        // musicHandler,
        // gameHandler,
        exitHandler,
        errorHandler,
        sessionEndedRequestHandler
      )
      .create()
  }

  skill.invoke(req.body)
    .then(function (responseBody) {
      res.json(responseBody)
    })
    .catch(function (error) {
      console.log(error)
      res.status(500).send('Error during the request')
    })
})

let server = app.listen(process.env.PORT || 4567, function () {
  let host = server.address().address
  let port = server.address().port
  console.log('Server listening at http://%s:%s', host, port)
  console.log('')
})

const launchHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest' ||
    (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
    handlerInput.requestEnvelope.request.intent.name === 'HomeIntent')
  },
  handle (handlerInput) {
    db.addUser(handlerInput.requestEnvelope.session.user.userId)
    handlerInput.attributesManager.getSessionAttributes().STATE = 'START'
    const speechText = 'Hauptmenü, Möchtest du lernen, üben oder Lieder hören?'
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hauptmenü', speechText)
      .getResponse()
  }
}

const lectionHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
    handlerInput.requestEnvelope.request.intent.name === 'LectureContinueIntent' &&
    handlerInput.attributesManager.getSessionAttributes().STATE === 'START'
  },
  handle (handlerInput) {
    const speechText = 'Möchtest du fortfahren oder ein bestimmtes Kapitel hören?'
    handlerInput.attributesManager.getSessionAttributes().STATE = 'LECTION'
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Kapitel Modul', speechText)
      .getResponse()
  }
}

const lectionPlayHandler = {
  canHandle (handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
    handlerInput.requestEnvelope.request.intent.name === 'LecturePlayIntent' &&
    handlerInput.attributesManager.getSessionAttributes().STATE === 'LECTION')
  },
  handle (handlerInput) {
    let speechText = ''
    if (handlerInput.requestEnvelope.request.intent.slots.Lection.value) {
      speechText = 'Spiele Kapitel: ' + handlerInput.requestEnvelope.request.intent.slots.Lection.value + " <audio src='" + ngrok + "a' />  , was darf ich für dich tun?"
      handlerInput.attributesManager.getSessionAttributes().STATE = 'START'
    } else {
      speechText = 'Welches Kapitel möchtest du hören?'
      handlerInput.attributesManager.getSessionAttributes().STATE = 'LECTION'
    }
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Kapitel Play Modul', speechText)
      .getResponse()
  }
}

const lectionContinueHandler = {
  canHandle (handlerInput) {
    return (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
    handlerInput.requestEnvelope.request.intent.name === 'LectureContinueIntent' &&
    handlerInput.attributesManager.getSessionAttributes().STATE === 'LECTION')
  },
  handle (handlerInput) {
    const speechText = "Fahre fort: <audio src='" + ngrok + "a' /> , was darf ich für dich tun?"
    handlerInput.attributesManager.getSessionAttributes().STATE = 'START'
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Kapitel Continue Modul', speechText)
      .getResponse()
  }
}

const errorHandler = {
  canHandle () {
    console.log('ERROR')
    return true
  },
  handle (handlerInput, error) {
    return handlerInput.responseBuilder
      .speak('Ups, da ist etwas schief gelaufen, das sollte eigentlich nicht passieren.')
      .getResponse()
  }
}

const sessionEndedRequestHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
  },
  handle (handlerInput) {
    console.log('Session Ended Request Handler')
    return handlerInput.responseBuilder.getResponse()
  }
}

const exitHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
        handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
  },
  handle (handlerInput) {
    return handlerInput.responseBuilder
      .speak('Auf Wiederhören!')
      .getResponse()
  }
}

/*

const musicHandler = {

}

const gameHandler = {

}

*/
