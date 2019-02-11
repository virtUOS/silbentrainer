
const express = require('express')
const bodyParser = require('body-parser')
const Alexa = require('ask-sdk')
const _ = require('lodash')
const hf = require('./helper_functions.js')
const config = require('./config.js')
const db = require('./database.js')
let skill
const app = express()

app.use('/audio', express.static(__dirname.concat('/audio')))

app.use(bodyParser.json())
app.get('/', function (req, res) {
  res.send('alexa skill says hello')
})

app.post('/', function (req, res) {
  // Fuer lokalen Server statt Lambda wichtig -> .create()
  skill = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
      launchRequestHandler,
      learnIntentHandler,
      learnContinueIntentHandler,
      learnSelectIntentHandler,
      gameMenueIntentHandler,
      gameContinueIntentHandler,
      gameRandomIntentHandler,
      gameIntentHandler,
      songIntentHandler,
      deleteIntentHandler,
      helpIntentHandler,
      exitIntentHandler,
      unhandledHandler
    )
    .addErrorHandlers(errorIntentHandler)
    .create()

  skill.invoke(req.body)
    .then(function (responseBody) {
      // console.log(responseBody)
      res.json(responseBody)
    })
    .catch(function (error) {
      console.log(error)
      res.status(500).send('Error during the request')
    })
})

let server = app.listen(process.env.PORT || config.PORT, function () {
  let host = server.address().address
  let port = server.address().port
  console.log('Server listening at http://%s:%s', host, port)
  console.log('')
  // hf.createAllLectures()
})

const errorIntentHandler = {
  canHandle (handlerInput) {
    return true
  },
  handle (handlerInput, error) {
    config.LOGGING(handlerInput)
    console.log(`Error handled: ${error.message}`)
    return handlerInput.responseBuilder
      .speak(config.TEXT.ERROR)
      .getResponse()
  }
}

const unhandledHandler = {
  canHandle () {
    return true
  },
  handle (handlerInput) {
    const outputSpeech = config.TEXT.UNHANDLED
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .reprompt(outputSpeech)
      .getResponse()
  }
}

const exitIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
        handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
  },
  handle (handlerInput) {
    config.LOGGING(handlerInput)
    return handlerInput.responseBuilder
      .speak(config.TEXT.BYE)
      .getResponse()
  }
}

const helpIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
  },
  handle (handlerInput) {
    config.LOGGING(handlerInput)
    return handlerInput.responseBuilder
      .speak(config.TEXT.HELP)
      .reprompt(config.TEXT.ASK)
      .getResponse()
  }
}

const launchRequestHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest' ||
    (handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
    handlerInput.requestEnvelope.request.intent.name === 'HomeIntent')
  },
  handle (handlerInput) {
    var attr = handlerInput.attributesManager.getSessionAttributes()

    attr.HISTORY_STATE = ['START']
    attr.HISTORY_INTENT = ['LaunchRequest']
    config.LOGGING(handlerInput)
    attr.STATE = config.STATES.START
    db.addUser(handlerInput.requestEnvelope.session.user.userId)
    const speechText = config.TEXT.MENUE
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse()
  }
}

const learnIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
    handlerInput.requestEnvelope.request.intent.name === 'LearnIntent'
  },
  async handle (handlerInput) {
    var attr = handlerInput.attributesManager.getSessionAttributes()
    var userId = handlerInput.requestEnvelope.session.user.userId

    attr.HISTORY_STATE = attr.HISTORY_STATE.concat(attr.STATE)
    attr.HISTORY_INTENT = attr.HISTORY_INTENT.concat(['LearnIntent'])
    const chapter = await db.getChapterFromUser(userId)
    config.LOGGING(handlerInput)
    attr.STATE = config.STATES.LEARN
    const speechText = config.TEXT.LEARN_C + chapter + config.TEXT.LEARN_MENUE
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse()
  }
}

const learnContinueIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
    handlerInput.requestEnvelope.request.intent.name === 'LearnContinueIntent'
  },
  async handle (handlerInput) {
    var attr = handlerInput.attributesManager.getSessionAttributes()
    var userId = handlerInput.requestEnvelope.session.user.userId

    attr.HISTORY_STATE = attr.HISTORY_STATE.concat(attr.STATE)
    attr.HISTORY_INTENT = attr.HISTORY_INTENT.concat(['LearnContinueIntent'])
    if (attr.STATE === config.STATES.GAMEMENUE) {
      config.LOGGING(handlerInput)
      // !!! DONT FORGET THIS PART
      attr.questions = await db.getLectionsByCategory(await db.getChapterFromUser(userId))
      attr.STATE = config.STATES.GAMECONTINUE
      return gameIntentHandler.handle(handlerInput)
    } else {
      const chapter = await db.getChapterFromUser(userId)
      config.LOGGING(handlerInput)
      console.log('Last Chapter: ' + chapter)
      attr.STATE = config.STATES.LEARNCONTINUE
      const speechText = hf.getTextToChapter(parseInt(chapter) + 1, userId)
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse()
    }
  }
}

const learnSelectIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
    handlerInput.requestEnvelope.request.intent.name === 'LearnSelectIntent'
  },
  handle (handlerInput) {
    var attr = handlerInput.attributesManager.getSessionAttributes()
    var userId = handlerInput.requestEnvelope.session.user.userId

    attr.HISTORY_STATE = attr.HISTORY_STATE.concat(attr.STATE)
    attr.HISTORY_INTENT = attr.HISTORY_INTENT.concat(['LearnSelectIntent'])
    if (attr.STATE === config.STATES.LEARNSELECT) {
      config.LOGGING(handlerInput)
      let stringnumber = 0
      if (handlerInput.requestEnvelope.request.intent.slots.ANSWER) {
        stringnumber = handlerInput.requestEnvelope.request.intent.slots.ANSWER.value
      } else {
        stringnumber = handlerInput.requestEnvelope.request.intent.slots.CHAPTER.value
      }
      const speechText = hf.getNumberToStringValue(stringnumber)
      console.log(hf.getNumberFromStringValue(stringnumber))
      db.updateChapter(userId, hf.getNumberFromStringValue(stringnumber))
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse()
    } else if (attr.STATE === config.STATES.LEARN) {
      config.LOGGING(handlerInput)
      attr.STATE = config.STATES.LEARNSELECT
      const speechText = config.TEXT.ASK_CHAPTER
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse()
    }
  }
}

const songIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
    handlerInput.requestEnvelope.request.intent.name === 'SongIntent'
  },
  async handle (handlerInput) {
    var attr = handlerInput.attributesManager.getSessionAttributes()
    var userId = handlerInput.requestEnvelope.session.user.userId

    attr.HISTORY_STATE = attr.HISTORY_STATE.concat(attr.STATE)
    attr.HISTORY_INTENT = attr.HISTORY_INTENT.concat(['SongIntent'])
    if (attr.STATE !== config.STATES.GAME) {
      config.LOGGING(handlerInput)
      attr.STATE = config.STATES.MUSIC
      const points = await db.getPointsFromUser(userId)
      const speechText = hf.getSong(userId, points)
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(config.TEXT.ASK)
        .getResponse()
    } else {
      return unhandledHandler.handle(handlerInput)
    }
  }
}

const gameRandomIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'GameRandomIntent'
  },
  async handle (handlerInput) {
    var attr = handlerInput.attributesManager.getSessionAttributes()

    attr.HISTORY_STATE = attr.HISTORY_STATE.concat(attr.STATE)
    attr.HISTORY_INTENT = attr.HISTORY_INTENT.concat(['GameRandomIntent'])
    config.LOGGING(handlerInput)
    attr.STATE = config.STATES.GAMERANDOM
    attr.questions = await db.getAllLections()
    return gameIntentHandler.handle(handlerInput)
  }
}

const gameContinueIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'GameContinueIntent'
  },
  async handle (handlerInput) {
    var attr = handlerInput.attributesManager.getSessionAttributes()
    var userId = handlerInput.requestEnvelope.session.user.userId

    attr.HISTORY_STATE = attr.HISTORY_STATE.concat(attr.STATE)
    attr.HISTORY_INTENT = attr.HISTORY_INTENT.concat(['GameContinueIntent'])
    config.LOGGING(handlerInput)
    attr.STATE = config.STATES.GAMECONTINUE
    attr.questions = await db.getLectionsByCategory(await db.getChapterFromUser(userId))
    return gameIntentHandler.handle(handlerInput)
  }
}

const gameMenueIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'GameMenueIntent'
  },
  async handle (handlerInput) {
    var attr = handlerInput.attributesManager.getSessionAttributes()
    var userId = handlerInput.requestEnvelope.session.user.userId

    attr.HISTORY_STATE = attr.HISTORY_STATE.concat(attr.STATE)
    attr.HISTORY_INTENT = attr.HISTORY_INTENT.concat(['GameMenueIntent'])
    if (attr.STATE === config.STATES.GAME) {
      config.LOGGING(handlerInput)
      return gameIntentHandler.handle(handlerInput)
    } else if (attr.STATE === config.STATES.START) {
      config.LOGGING(handlerInput)
      attr.STATE = config.STATES.GAMEMENUE
      const speechText = config.TEXT.LEARN_C + await db.getChapterFromUser(userId) + config.TEXT.GAME_MENUE
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse()
    } else {
      config.LOGGING(handlerInput)
      return learnSelectIntentHandler.handle(handlerInput)
    }
  }
}

const gameIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'GameIntent'
  },
  async handle (handlerInput) {
    var attr = handlerInput.attributesManager.getSessionAttributes()
    var userId = handlerInput.requestEnvelope.session.user.userId

    attr.HISTORY_STATE = attr.HISTORY_STATE.concat(attr.STATE)
    attr.HISTORY_INTENT = attr.HISTORY_INTENT.concat(['GameIntent'])
    if (attr.STATE === config.STATES.GAMECONTINUE ||
        attr.STATE === config.STATES.GAMERANDOM) {
      config.LOGGING(handlerInput)
      attr.STATE = config.STATES.GAME
      attr.round = 1
      attr.currentquestion = (_.shuffle(attr.questions)).pop()
      attr.questions = hf.removeItemFromCollection(attr.questions, attr.currentquestion)
      const speechText = attr.currentquestion.text
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse()
    } else if (attr.STATE === config.STATES.LEARNSELECT) {
      config.LOGGING(handlerInput)
      return learnSelectIntentHandler.handle(handlerInput)
    } else {
      config.LOGGING(handlerInput)
      attr.STATE = config.STATES.GAME

      let answer = null

      if (handlerInput.requestEnvelope.request.intent.slots.ANSWER) {
        answer = handlerInput.requestEnvelope.request.intent.slots.ANSWER.value
      } else {
        answer = handlerInput.requestEnvelope.request.intent.slots.CHAPTER.value
      }

      if (attr.round === 3) {
        if (attr.currentquestion.answer === answer) {
          attr.round = attr.round + 1
          attr.currentquestion = (_.shuffle(attr.questions)).pop()
          attr.questions = hf.removeItemFromCollection(attr.questions, attr.currentquestion)
          db.addPointToUser(userId)
          const speechText = 'Richtig, ' + config.TEXT.GAME_FINISHED
          attr.STATE = config.STATES.START
          return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse()
        } else {
          attr.round = attr.round + 1
          attr.currentquestion = (_.shuffle(attr.questions)).pop()
          attr.questions = hf.removeItemFromCollection(attr.questions, attr.currentquestion)
          db.removePointFromUser(userId)
          const speechText = 'Falsch, ' + config.TEXT.GAME_FINISHED
          attr.STATE = config.STATES.START
          return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse()
        }
      } else {
        if (attr.currentquestion.answer === answer) {
          attr.round = attr.round + 1
          attr.currentquestion = (_.shuffle(attr.questions)).pop()
          attr.questions = hf.removeItemFromCollection(attr.questions, attr.currentquestion)
          db.addPointToUser(userId)
          const speechText = 'Richtig, ' + attr.currentquestion.text
          return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse()
        } else {
          attr.round = attr.round + 1
          attr.currentquestion = (_.shuffle(attr.questions)).pop()
          attr.questions = hf.removeItemFromCollection(attr.questions, attr.currentquestion)
          db.removePointFromUser(userId)
          const speechText = 'Falsch, ' + attr.currentquestion.text
          return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse()
        }
      }
    }
  }
}

const deleteIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'DeleteIntent'
  },
  handle (handlerInput) {
    var attr = handlerInput.attributesManager.getSessionAttributes()

    attr.HISTORY_STATE = attr.HISTORY_STATE.concat(attr.STATE)
    attr.HISTORY_INTENT = attr.HISTORY_INTENT.concat(['DeleteIntent'])
    config.LOGGING(handlerInput)
    db.deleteUserData()
    const speechText = config.TEXT.BUMM
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse()
  }
}
