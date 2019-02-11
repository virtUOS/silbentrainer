
exports.DEBUG = true

// EXAMPLE: 'https://3d5fe997.ngrok.io'
// IMPORTANT: link without slash
exports.SERVER = 'https://eff40f5d.ngrok.io'
exports.PORT = 4567

// ffmpeg -i <input-file> -ac 2 -codec:a libmp3lame -b:a 48k -ar 16000 <output-file.mp3>

exports.SERVER_PATHS = {
  CHAPTER: {
    A: '/audio/chapter/1.mp3',
    B: '/audio/chapter/2.mp3',
    C: '/audio/chapter/3.mp3',
    D: '/audio/chapter/4.mp3',
    E: '/audio/chapter/5.mp3',
    F: '/audio/chapter/6.mp3',
    G: '/audio/chapter/7.mp3',
    H: '/audio/chapter/8.mp3'
  },
  SONG: {
    A: '/audio/song/song1.mp3',
    B: '/audio/song/song2.mp3',
    C: '/audio/song/song3.mp3'
  }
}

exports.STATES = {
  START: 'START',
  MUSIC: 'MUSIC',
  LEARN: 'LEARN',
  LEARNCONTINUE: 'LEARNCONTINUE',
  LEARNSELECT: 'LEARNSELECT',
  GAME: 'GAME',
  GAMEMENUE: 'GAMEMENUE',
  GAMECONTINUE: 'GAMECONTINUE',
  GAMERANDOM: 'GAMERANDOM'
}

exports.TEXT = {
  MENUE: ' Möchtest du lernen, üben oder Lieder hören? ',
  ERROR: ' Ups, da ist etwas schief gelaufen, das sollte eigentlich nicht passieren. ',
  UNHANDLED: 'Das habe ich leider nicht verstanden, sage bitte etwas anderes.',
  BYE: ' Auf Wiederhören! ',
  HELP: ' Jede Hilfe kommt zu spät, was kann ich für dich tun? ',
  ASK: ' was kann ich für dich tun? ',
  MUSIC1: " Genieße Song 1: <audio src='" + this.SERVER + this.SERVER_PATHS.SONG.A + "' /> was darf ich für dich tun? ",
  MUSIC2: " Genieße Song 2: <audio src='" + this.SERVER + this.SERVER_PATHS.SONG.B + "' /> was darf ich für dich tun? ",
  MUSIC3: " Genieße Song 3: <audio src='" + this.SERVER + this.SERVER_PATHS.SONG.C + "' /> was darf ich für dich tun? ",
  NO_MUSIC_POINTS: 'Leider hast du noch nicht genug Punkte für einen Song gesammelt. was darf ich für dich tun? ',
  C1: " Kapitel 1: <audio src='" + this.SERVER + this.SERVER_PATHS.CHAPTER.A + "' /> was darf ich für dich tun? ",
  C2: " Kapitel 2: <audio src='" + this.SERVER + this.SERVER_PATHS.CHAPTER.B + "' /> was darf ich für dich tun? ",
  C3: " Kapitel 3: <audio src='" + this.SERVER + this.SERVER_PATHS.CHAPTER.C + "' /> was darf ich für dich tun? ",
  C4: " Kapitel 4: <audio src='" + this.SERVER + this.SERVER_PATHS.CHAPTER.D + "' /> was darf ich für dich tun? ",
  C5: " Kapitel 5: <audio src='" + this.SERVER + this.SERVER_PATHS.CHAPTER.E + "' /> was darf ich für dich tun? ",
  C6: " Kapitel 6: <audio src='" + this.SERVER + this.SERVER_PATHS.CHAPTER.F + "' /> was darf ich für dich tun? ",
  C7: " Kapitel 7: <audio src='" + this.SERVER + this.SERVER_PATHS.CHAPTER.G + "' /> was darf ich für dich tun? ",
  C8: " Kapitel 8: <audio src='" + this.SERVER + this.SERVER_PATHS.CHAPTER.H + "' /> was darf ich für dich tun? ",
  ALL_CHAPTERS_DONE: ' Du hast alle Kapitel durchgehört, ich starte wieder vom Anfang: ',
  LEARN_C: ' Du bist bei Kapitel ',
  LEARN_MENUE: ', Möchtest du fortfahren oder ein bestimmtes Kapitel hören? ',
  GAME_MENUE: ', Möchtest du fortfahren oder zufällig spielen ',
  BUMM: ' User Daten werden gelöscht..., ... auf Wiederhören! ',
  ASK_CHAPTER: ' Welches Kapitel? ',
  GAME_FINISHED: ' Du hast deine Übungen alle beantwortet. ' + 'Möchtest du lernen, üben oder Lieder hören?'
}

exports.LOGGING = function (handlerInput) {
  if (this.DEBUG) {
    console.log('--------------------------------------------------------------------------')
    if (handlerInput.requestEnvelope.request.type) {
      console.log('TYPE: ' + handlerInput.requestEnvelope.request.type)
    }
    if (handlerInput.requestEnvelope.request.intent) {
      console.log('NAME: ' + handlerInput.requestEnvelope.request.intent.name)
    }
    /*
    if (handlerInput.attributesManager.getSessionAttributes().STATE) {
      console.log('STATE: ' + handlerInput.attributesManager.getSessionAttributes().STATE)
    }
    */
    if (handlerInput.requestEnvelope.request.error) {
      console.log('ERROR.TYPE: ' + handlerInput.requestEnvelope.request.error.type)
      console.log('ERROR.MESSAGE: ' + handlerInput.requestEnvelope.request.error.message)
    }
    // console.log('SESSION ATTRIBUTES: ' + JSON.stringify(handlerInput.attributesManager.getSessionAttributes(), null, 2))
    console.log('HISTORY_STATE: ' + JSON.stringify(handlerInput.attributesManager.getSessionAttributes().HISTORY_STATE, null, 2))
    console.log('HISTORY_INTENT: ' + JSON.stringify(handlerInput.attributesManager.getSessionAttributes().HISTORY_INTENT, null, 2))
    console.log('REQUEST: ' + JSON.stringify(handlerInput.requestEnvelope.request, null, 2))
    console.log('--------------------------------------------------------------------------')
  }
}
