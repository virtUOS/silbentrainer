
const express = require('express')
const bodyParser = require('body-parser')
const Alexa = require('ask-sdk')
const fs = require('fs')
const _ = require('lodash')
const hf = require('./helper_functions.js')
const config = require('./config.js')
const db = require('./database.js')
let skill
const app = express()

app.use(bodyParser.json())
app.get('/', function (req, res) {
  res.send('alexa skill says hello')
})
app.get(config.SERVER_PATHS.CHAPTER.A, function (req, res) {
  fs.createReadStream(config.SERVER_PATHS.AUDIO_FOLDER + config.SERVER_PATHS.CHAPTER.A).pipe(res)
})
app.get(config.SERVER_PATHS.CHAPTER.B, function (req, res) {
  fs.createReadStream(config.SERVER_PATHS.AUDIO_FOLDER + config.SERVER_PATHS.CHAPTER.B).pipe(res)
})
app.get(config.SERVER_PATHS.CHAPTER.C, function (req, res) {
  fs.createReadStream(config.SERVER_PATHS.AUDIO_FOLDER + config.SERVER_PATHS.CHAPTER.C).pipe(res)
})
app.get(config.SERVER_PATHS.CHAPTER.D, function (req, res) {
  fs.createReadStream(config.SERVER_PATHS.AUDIO_FOLDER + config.SERVER_PATHS.CHAPTER.D).pipe(res)
})
app.get(config.SERVER_PATHS.CHAPTER.E, function (req, res) {
  fs.createReadStream(config.SERVER_PATHS.AUDIO_FOLDER + config.SERVER_PATHS.CHAPTER.E).pipe(res)
})
app.get(config.SERVER_PATHS.CHAPTER.F, function (req, res) {
  fs.createReadStream(config.SERVER_PATHS.AUDIO_FOLDER + config.SERVER_PATHS.CHAPTER.F).pipe(res)
})
app.get(config.SERVER_PATHS.CHAPTER.G, function (req, res) {
  fs.createReadStream(config.SERVER_PATHS.AUDIO_FOLDER + config.SERVER_PATHS.CHAPTER.G).pipe(res)
})
app.get(config.SERVER_PATHS.CHAPTER.H, function (req, res) {
  fs.createReadStream(config.SERVER_PATHS.AUDIO_FOLDER + config.SERVER_PATHS.CHAPTER.H).pipe(res)
})
app.get(config.SERVER_PATHS.SONG.A, function (req, res) {
  fs.createReadStream(config.SERVER_PATHS.AUDIO_FOLDER + config.SERVER_PATHS.SONG.A).pipe(res)
})
app.get(config.SERVER_PATHS.SONG.B, function (req, res) {
  fs.createReadStream(config.SERVER_PATHS.AUDIO_FOLDER + config.SERVER_PATHS.SONG.B).pipe(res)
})
app.get(config.SERVER_PATHS.SONG.C, function (req, res) {
  fs.createReadStream(config.SERVER_PATHS.AUDIO_FOLDER + config.SERVER_PATHS.SONG.C).pipe(res)
})

app.post('/', function (req, res) {
  if (!skill) {
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
        errorIntentHandler,
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
    return handlerInput.responseBuilder
      .speak(config.TEXT.ERROR)
      .getResponse()
  }
}

const sessionEndedRequestHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
  },
  handle (handlerInput) {
    config.LOGGING(handlerInput)
    return handlerInput.responseBuilder
      .speak(config.TEXT.ERROR)
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
    config.LOGGING(handlerInput)
    handlerInput.attributesManager.getSessionAttributes().STATE = config.STATES.START
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
    const chapter = await db.getChapterFromUser(handlerInput.requestEnvelope.session.user.userId)
    config.LOGGING(handlerInput)
    handlerInput.attributesManager.getSessionAttributes().STATE = config.STATES.LEARN
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
    if (handlerInput.attributesManager.getSessionAttributes().STATE === config.STATES.GAMEMENUE) {
      config.LOGGING(handlerInput)
      // !!! DONT FORGET THIS PART
      handlerInput.attributesManager.getSessionAttributes().questions = await db.getLectionsByCategory(await db.getChapterFromUser(handlerInput.requestEnvelope.session.user.userId))
      handlerInput.attributesManager.getSessionAttributes().STATE = config.STATES.GAMECONTINUE
      return gameIntentHandler.handle(handlerInput)
    } else {
      const chapter = await db.getChapterFromUser(handlerInput.requestEnvelope.session.user.userId)
      config.LOGGING(handlerInput)
      console.log('Last Chapter: ' + chapter)
      handlerInput.attributesManager.getSessionAttributes().STATE = config.STATES.LEARNCONTINUE
      const speechText = hf.getTextToChapter(parseInt(chapter) + 1, handlerInput.requestEnvelope.session.user.userId)
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
    if (handlerInput.attributesManager.getSessionAttributes().STATE === config.STATES.LEARNSELECT) {
      config.LOGGING(handlerInput)
      let stringnumber = 0
      if (handlerInput.requestEnvelope.request.intent.slots.ANSWER) {
        stringnumber = handlerInput.requestEnvelope.request.intent.slots.ANSWER.value
      } else {
        stringnumber = handlerInput.requestEnvelope.request.intent.slots.CHAPTER.value
      }
      const speechText = hf.getNumberToStringValue(stringnumber)
      console.log(hf.getNumberFromStringValue(stringnumber))
      db.updateChapter(handlerInput.requestEnvelope.session.user.userId, hf.getNumberFromStringValue(stringnumber))
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse()
    } else if (handlerInput.attributesManager.getSessionAttributes().STATE === config.STATES.START) {
      config.LOGGING(handlerInput)
      handlerInput.attributesManager.getSessionAttributes().STATE = config.STATES.LEARNSELECT
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
    if (handlerInput.attributesManager.getSessionAttributes().STATE !== config.STATES.GAME) {
      config.LOGGING(handlerInput)
      handlerInput.attributesManager.getSessionAttributes().STATE = config.STATES.MUSIC
      const points = await db.getPointsFromUser(handlerInput.requestEnvelope.session.user.userId)
      const speechText = hf.getSong(handlerInput.requestEnvelope.session.user.userId, points)
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(config.TEXT.ASK)
        .getResponse()
    }
  }
}

const gameRandomIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'GameRandomIntent'
  },
  async handle (handlerInput) {
    config.LOGGING(handlerInput)
    handlerInput.attributesManager.getSessionAttributes().STATE = config.STATES.GAMERANDOM
    handlerInput.attributesManager.getSessionAttributes().questions = await db.getAllLections()
    return gameIntentHandler.handle(handlerInput)
  }
}

const gameContinueIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'GameContinueIntent'
  },
  async handle (handlerInput) {
    config.LOGGING(handlerInput)
    handlerInput.attributesManager.getSessionAttributes().STATE = config.STATES.GAMECONTINUE
    handlerInput.attributesManager.getSessionAttributes().questions = await db.getLectionsByCategory(await db.getChapterFromUser(handlerInput.requestEnvelope.session.user.userId))
    return gameIntentHandler.handle(handlerInput)
  }
}

const gameMenueIntentHandler = {
  canHandle (handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'GameMenueIntent'
  },
  async handle (handlerInput) {
    if (handlerInput.attributesManager.getSessionAttributes().STATE === config.STATES.GAME) {
      config.LOGGING(handlerInput)
      handlerInput.attributesManager.getSessionAttributes().STATE = config.STATES.GAME
      return gameIntentHandler.handle(handlerInput)
    } else if (handlerInput.attributesManager.getSessionAttributes().STATE === config.STATES.START) {
      config.LOGGING(handlerInput)
      handlerInput.attributesManager.getSessionAttributes().STATE = config.STATES.GAMEMENUE
      const speechText = config.TEXT.LEARN_C + await db.getChapterFromUser(handlerInput.requestEnvelope.session.user.userId) + config.TEXT.GAME_MENUE
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
    if (handlerInput.attributesManager.getSessionAttributes().STATE === config.STATES.GAMECONTINUE ||
        handlerInput.attributesManager.getSessionAttributes().STATE === config.STATES.GAMERANDOM) {
      config.LOGGING(handlerInput)
      handlerInput.attributesManager.getSessionAttributes().STATE = config.STATES.GAME
      handlerInput.attributesManager.getSessionAttributes().currentquestion = _.sample(handlerInput.attributesManager.getSessionAttributes().questions)
      const speechText = handlerInput.attributesManager.getSessionAttributes().currentquestion.text
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse()
    } else {
      config.LOGGING(handlerInput)
      handlerInput.attributesManager.getSessionAttributes().STATE = config.STATES.GAME

      let answer = null

      if (handlerInput.requestEnvelope.request.intent.slots.ANSWER) {
        answer = handlerInput.requestEnvelope.request.intent.slots.ANSWER.value
      } else {
        answer = handlerInput.requestEnvelope.request.intent.slots.CHAPTER.value
      }

      if (handlerInput.attributesManager.getSessionAttributes().currentquestion.answer === answer) {
        handlerInput.attributesManager.getSessionAttributes().currentquestion = _.sample(handlerInput.attributesManager.getSessionAttributes().questions)
        db.addPointToUser(handlerInput.requestEnvelope.session.user.userId)
        const speechText = 'Richtig, ' + handlerInput.attributesManager.getSessionAttributes().currentquestion.text
        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .getResponse()
      } else {
        handlerInput.attributesManager.getSessionAttributes().currentquestion = _.sample(handlerInput.attributesManager.getSessionAttributes().questions)
        db.removePointFromUser(handlerInput.requestEnvelope.session.user.userId)
        const speechText = 'Falsch, ' + handlerInput.attributesManager.getSessionAttributes().currentquestion.text
        return handlerInput.responseBuilder
          .speak(speechText)
          .reprompt(speechText)
          .getResponse()
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
    config.LOGGING(handlerInput)
    db.deleteUserData()
    const speechText = config.TEXT.BUMM
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse()
  }
}
