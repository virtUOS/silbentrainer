
const _ = require('lodash')
const data = require('./data.js')
const db = require('./database.js')
const config = require('./config.js')

exports.removeItemFromCollection = function (collection, item) {
  let newCollection = []
  for (var i = 0; i < collection.length; i++) {
    if (collection[i].lectureid !== item.lectureid) {
      newCollection.push(collection[i])
    }
  }
  return newCollection
}

exports.getRightVariation = function () {
  let shuffledRights = _.shuffle(data.right)
  return shuffledRights[0]
}

exports.getNumberToStringValue = function (n) {
  switch (n) {
    case 'eins':
      n = config.TEXT.C1
      break
    case 'zwei':
      n = config.TEXT.C2
      break
    case 'drei':
      n = config.TEXT.C3
      break
    case 'vier':
      n = config.TEXT.C4
      break
    case 'fünf':
      n = config.TEXT.C5
      break
    case 'sechs':
      n = config.TEXT.C6
      break
    case 'sieben':
      n = config.TEXT.C7
      break
    case 'acht':
      n = config.TEXT.C8
      break
    default:
      n = 'Dieses Kapitel existiert nicht, welches Kapitel möchtest du hören?'
      console.log('getNumberToStringValue: error')
  }
  return n
}

exports.getNumberFromStringValue = function (n) {
  switch (n) {
    case 'eins':
      n = 1
      break
    case 'zwei':
      n = 2
      break
    case 'drei':
      n = 3
      break
    case 'vier':
      n = 4
      break
    case 'fünf':
      n = 5
      break
    case 'sechs':
      n = 6
      break
    case 'sieben':
      n = 7
      break
    case 'acht':
      n = 8
      break
    default:
      n = 'error'
      console.log('getNumberToStringValue: error')
  }
  return n
}

exports.getTextToChapter = function (n, userId) {
  switch (n) {
    case 0:
      db.updateChapter(userId, n)
      n = config.TEXT.C1
      break
    case 1:
      db.updateChapter(userId, n)
      n = config.TEXT.C1
      break
    case 2:
      db.updateChapter(userId, n)
      n = config.TEXT.C2
      break
    case 3:
      db.updateChapter(userId, n)
      n = config.TEXT.C3
      break
    case 4:
      db.updateChapter(userId, n)
      n = config.TEXT.C4
      break
    case 5:
      db.updateChapter(userId, n)
      n = config.TEXT.C5
      break
    case 6:
      db.updateChapter(userId, n)
      n = config.TEXT.C6
      break
    case 7:
      db.updateChapter(userId, n)
      n = config.TEXT.C7
      break
    case 8:
      db.updateChapter(userId, n)
      n = config.TEXT.C8
      break
    default:
      db.updateChapter(userId, 1)
      n = config.TEXT.ALL_CHAPTERS_DONE + config.TEXT.C1
      console.log('getTextToChapter: max range, reset to 1')
  }
  return n
}

exports.createAllLectures = function () {
  for (var i = 1; i < data.questions.length + 1; i++) {
    db.addLectureToDatabase(i, data.questions[i - 1].category, data.questions[i - 1].text, data.questions[i - 1].answer)
  }
}

exports.getSong = function (userid, points) {
  points = parseInt(points)
  if (points >= 3) {
    db.removeSongPointsFromUser(userid, 3)
    return config.TEXT.MUSIC3
  } else if (points === 2) {
    db.removeSongPointsFromUser(userid, 2)
    return config.TEXT.MUSIC2
  } else if (points === 1) {
    db.removeSongPointsFromUser(userid, 1)
    return config.TEXT.MUSIC1
  } else {
    return config.TEXT.NO_MUSIC_POINTS
  }
}
