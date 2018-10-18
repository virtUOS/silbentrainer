
const ngrok = "https://2bdc0532.ngrok.io/";
const filepath = "/Users/ek/Projects/dasmitdersilbe/";
const appId = "amzn1.ask.skill.f3bc5473-cad0-42f2-8e82-47664796986d";

const express = require('express');
const bodyParser = require('body-parser');
const Alexa = require('alexa-sdk');
const _ = require('lodash');
const fs = require('fs');
const hf = require('./helper_functions.js');
const data = require('./data.js');
const db = require('./database.js')

const app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
  //res.send('hello');
  fs.createReadStream(filepath + 'test.mp3').pipe(res);
});

app.get('/1', function (req, res) { fs.createReadStream(filepath + '1.mp3').pipe(res); });
app.get('/2', function (req, res) { fs.createReadStream(filepath + '2.mp3').pipe(res); });
app.get('/3', function (req, res) { fs.createReadStream(filepath + '3.mp3').pipe(res); });
app.get('/4', function (req, res) { fs.createReadStream(filepath + '4.mp3').pipe(res); });
app.get('/5', function (req, res) { fs.createReadStream(filepath + '5.mp3').pipe(res); });
app.get('/6', function (req, res) { fs.createReadStream(filepath + '6.mp3').pipe(res); });
app.get('/7', function (req, res) { fs.createReadStream(filepath + '7.mp3').pipe(res); });
app.get('/8', function (req, res) { fs.createReadStream(filepath + '8.mp3').pipe(res); });
app.get('/a', function (req, res) { fs.createReadStream(filepath + 'geburtstagstanz.mp3').pipe(res); });
app.get('/b', function (req, res) { fs.createReadStream(filepath + 'zau_zaubert.mp3').pipe(res); });
app.get('/c', function (req, res) { fs.createReadStream(filepath + 'schneller_teller.mp3').pipe(res); });

app.post('/', function (req, res) {
  let context = {
    succeed: function (result) {
      res.json(result);
    },
    fail: function (error) {
      console.log(error);
    }
  };
  let alexa = Alexa.handler(req.body, context);

  alexa.registerHandlers(
    handlers,
    start_handlers,
    lection_handlers,
    music_handlers,
    game_handlers
  );

  alexa.appId = appId;
  alexa.execute();
});

let server = app.listen(process.env.PORT || 4567, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log("Server listening at http://%s:%s", host, port);
  console.log("");
});

const handlers = {
  "LaunchRequest": function () {
    db.addUser(this.event.session.user.userId);

    // USE ONCE AT DATABASE CREATION
    //hf.createAllLectures();

    this.handler.state = "_START";
    this.emitWithState("Start");
  },
  "Unhandled": function () {
    this.response.speak("Auf Wiedersehen!").audioPlayerStop();
    this.emit(":responseReady");
  }
};

const start_handlers = Alexa.CreateStateHandler("_START", {
  "Start": function () {
    if(this.attributes["unhandled"]){
      this.attributes["unhandled"] = false;
      this.response.speak("Das hat leider nicht geklappt, versuchen wir es noch einmal. Möchtest du lernen, üben oder Lieder hören?")
      .listen("Sage lernen, üben oder Lieder hören");
      this.emit(":responseReady");
    } else {
      this.attributes["unhandled"] = false;
      this.response.speak("Möchtest du lernen, üben oder Lieder hören?")
      .listen("Sage lernen, üben oder Lieder hören");
      this.emit(":responseReady");
    }
  },
  'LearnIntent': function () {
    this.handler.state = "_LECTION";
    this.emitWithState("Lection");
  },
  'GameReadyIntent': function(){
    this.handler.state = "_GAME";
    this.attributes["game"] = true;
    this.emitWithState("Game");
  },
  "SongIntent": function () {
    this.handler.state = "_MUSIC";
    this.emitWithState("Music");
  },
  "AMAZON.StopIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "AMAZON.CancelIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "AMAZON.HelpIntent": function () {
    this.response.speak("Sage lernen, üben oder Lieder hören").listen("Sage lernen, üben oder Lieder hören");
    this.emit(":responseReady");
  },
  "Unhandled": function () {
    this.attributes["unhandled"] = true;
    this.emitWithState("Start");
  }
});

const music_handlers = Alexa.CreateStateHandler("_MUSIC", {
  "Music": function () {
    this.emitWithState("MusicIntent");
  },
  "MusicIntent": function () {
    db.getPointsFromUser(this.event.session.user.userId, (points) => {
      if(points >= 1){
        db.removeSongPointsFromUser(this.event.session.user.userId);
        
        let r = hf.getRandomNumber(3);
        let url = ngrok;
        if(r==0){
          url = ngrok + "a";
        } else if(r==1){
          url = ngrok + "b";
        } else {
          url = ngrok + "c";
        }

        const cardTitle = 'MusicIntent';
        const cardContent = 'Streame Musik.';
        const speechOutput = 'Streame Musik.';
        const behavior = 'REPLACE_ALL';

        const token = '0';
        const expectedPreviousToken = null;
        const offsetInMilliseconds = 0;
        this.response.speak(speechOutput)
        .audioPlayerPlay(behavior, url, token, expectedPreviousToken, offsetInMilliseconds)
        .cardRenderer(cardTitle, cardContent, data.imageObj);
        this.emit(':responseReady');

      } else {
        this.response.speak("Du hast leider weniger als 1 Punkt, du hast nur " + points + ", soll ich dich zurück ins Hauptmenü bringen?")
        .listen("Soll ich dich zurück ins Hauptmenü bringen? Ja oder Nein");
        this.emit(":responseReady");
      }

    });
  },
  "AMAZON.PauseIntent": function () {
    this.response.speak('Pause');
    this.emit(":responseReady");
  },
  "AMAZON.StopIntent": function () {
    this.handler.state = "_START";
    this.emitWithState("Start");
  },
  "AMAZON.CancelIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "AMAZON.HelpIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "AMAZON.YesIntent": function () {
    this.handler.state = "_START";
    this.emitWithState("Start");
  },
  "AMAZON.NoIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "HomeIntent": function () {
    this.handler.state = "_START";
    this.emitWithState("Start");
  },
  "Unhandled": function () {
    this.emitWithState("Music");
  }
});

const lection_handlers = Alexa.CreateStateHandler("_LECTION", {
  'Lection': function () {
    this.attributes["unhandled"] = false;
    this.response.speak("Möchtest du das Kapitel fortfahren oder ein bestimmtes Kapitel hören?").listen("Möchtest du das Kapitel fortfahren oder ein bestimmtes Kapitel hören?");
    this.emit(":responseReady");
  },
  'LectureNumberIntent': function () {
    if(this.attributes["unhandled"]){
      this.attributes["unhandled"] = false;
      this.attributes["continuelecture"] = false;

      //console.log(hf.getNumberToStringValue(this.event.request.intent.slots.Answer.value.toLowerCase()));

      if(this.event.request.intent.name == "GameContinueIntent"){
        this.emitWithState("LectureContinueIntent");
      } if(this.event.request.intent.name == "GameIntent"){
        this.emitWithState("LecturePlayIntent");
      } else {
        this.response.speak("Das hat nicht geklappt, aktuell sind 8 Kapitel verfügbar.").listen("Sage zum Beispiel Kapitel Vier oder Kapitel fortfahren.");
        this.emit(":responseReady");
      }

    } else {
      this.attributes["unhandled"] = false;
      this.attributes["continuelecture"] = false;
      this.response.speak("Mit welchem Kapitel möchtest du starten?").listen("Sage zum Beispiel Kapitel Vier.");
      this.emit(":responseReady");
    }
  },
  'LecturePlayIntent': function () {

    console.log("CONTINUE: " + this.attributes["continuelecture"] + "\n");

    db.getChapterFromUser( this.event.session.user.userId, (chapter) => {

      if(this.attributes["continuelecture"]){
        if(chapter <8){
          this.attributes["continuelecture"] = false;
          db.updateChapter(this.event.session.user.userId, (parseInt(chapter)+1));
          const cardTitle = 'Kapitel ' + (parseInt(chapter)+1);
          const cardContent = 'Kapitel ' + (parseInt(chapter)+1);
          const speechOutput = 'Kapitel ' + (parseInt(chapter)+1);
          const behavior = 'REPLACE_ALL';
          const url = ngrok + (parseInt(chapter)+1);
          const token = '0';
          const expectedPreviousToken = null;
          const offsetInMilliseconds = 0;
          this.response.speak(speechOutput)
          .audioPlayerPlay(behavior, url, token, expectedPreviousToken, offsetInMilliseconds)
          .cardRenderer(cardTitle, cardContent, data.imageObj);
          
          //this.response.shouldEndSession(false, "Reprompt your user here");

          this.emit(':responseReady');
        } else {
          this.attributes["continuelecture"] = false;
          db.updateChapter(this.event.session.user.userId, 1);
          const cardTitle = 'Kapitel ' + 1;
          const cardContent = 'Kapitel ' + 1;
          const speechOutput = 'Kapitel ' + 1;
          const behavior = 'REPLACE_ALL';
          const url = ngrok + 1;
          const token = '0';
          const expectedPreviousToken = null;
          const offsetInMilliseconds = 0;
          this.response.speak(speechOutput)
          .audioPlayerPlay(behavior, url, token, expectedPreviousToken, offsetInMilliseconds)
          .cardRenderer(cardTitle, cardContent, data.imageObj);
          
          //this.response.shouldEndSession(false, "Reprompt your user here");

          this.emit(':responseReady');
        }

      } else {
        this.attributes["unhandled"] = false;

        if(this.event.request.intent.slots.Lection){

          if (this.event.request.intent.slots.Lection != ""){
            db.updateChapter(this.event.session.user.userId, hf.getNumberToStringValue(this.event.request.intent.slots.Lection.value));
            const cardTitle = 'Kapitel ' + hf.getNumberToStringValue(this.event.request.intent.slots.Lection.value);
            const cardContent = 'Kapitel ' + hf.getNumberToStringValue(this.event.request.intent.slots.Lection.value);
            const speechOutput = 'Kapitel ' + hf.getNumberToStringValue(this.event.request.intent.slots.Lection.value);
            const behavior = 'REPLACE_ALL';
            const url = ngrok + hf.getNumberToStringValue(this.event.request.intent.slots.Lection.value);
            const token = '0';
            const expectedPreviousToken = null;
            const offsetInMilliseconds = 0;
            this.response.speak(speechOutput)
            .audioPlayerPlay(behavior, url, token, expectedPreviousToken, offsetInMilliseconds)
            .cardRenderer(cardTitle, cardContent, data.imageObj);
            this.emit(':responseReady');
          } else {
            this.response.speak("Unbekanntes Kapitel");
            this.emit(":responseReady");
          }
        } else {
          if (hf.getNumberToStringValue(this.event.request.intent.slots.Answer.value.toLowerCase()) != ""){

            const cardTitle = 'Kapitel ' + hf.getNumberToStringValue(this.event.request.intent.slots.Answer.value.toLowerCase());
            const cardContent = 'Kapitel ' + hf.getNumberToStringValue(this.event.request.intent.slots.Answer.value.toLowerCase());
            const speechOutput = 'Kapitel ' + hf.getNumberToStringValue(this.event.request.intent.slots.Answer.value.toLowerCase());
            const behavior = 'REPLACE_ALL';
            const url = ngrok + hf.getNumberToStringValue(this.event.request.intent.slots.Answer.value.toLowerCase());
            const token = '0';
            const expectedPreviousToken = null;
            const offsetInMilliseconds = 0;
            this.response.speak(speechOutput)
            .audioPlayerPlay(behavior, url, token, expectedPreviousToken, offsetInMilliseconds)
            .cardRenderer(cardTitle, cardContent, data.imageObj);
            this.emit(':responseReady');
          } else {
            this.response.speak("Unbekanntes Kapitel");
            this.emit(":responseReady");
          }
        }


      }

    });

  },
  'LectureContinueIntent': function () {
    this.attributes["continuelecture"] = true;
    this.emitWithState("LecturePlayIntent");
  },
  "AMAZON.StopIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "AMAZON.CancelIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "AMAZON.HelpIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "AMAZON.YesIntent": function () {
    this.handler.state = "_START";
    this.emitWithState("Start");
  },
  "AMAZON.NoIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "HomeIntent": function () {
    this.handler.state = "_START";
    this.emitWithState("Start");
  },
  "Unhandled": function () {
    this.attributes["unhandled"] = true;
    this.emitWithState("LectureNumberIntent");
  }
});

const game_handlers = Alexa.CreateStateHandler("_GAME", {
  "Game": function () {
    this.attributes["game"] = false;
    this.response.speak("Möchtest du das Spiel fortfahren oder zufällig Spielen?").listen("Sage Spiel fortfahren oder zufällig Spielen!");
    this.emit(":responseReady");
  },
  'GameIntent': function () {

    /*db.getLection(4, (lecture) => {
    console.log(lecture)
  });*/

  console.log("INTENT: " + this.event.request.intent.name);
  console.log("GAME: " + this.attributes["game"]);
  console.log("CONTINUE: " + this.attributes["continuegame"]);
  console.log("RANDOM: " + this.attributes["randomgame"] + "\n");

  db.getAllLections( (lectures) => {
    db.getChapterFromUser( this.event.session.user.userId, (chapter) => {
      //console.log(lectures);
      //console.log(chapter);

      if(this.attributes["game"]){

        // continue or random

        if( this.attributes["currentQuestion"] === undefined ) {

          this.attributes["points"] = 0;
          //console.log(lectures);
          if(this.attributes["randomgame"]){
            this.attributes["allQuestions"] = lectures;
          } else {
            if(chapter == 0 || chapter == null){
              this.attributes["allQuestions"] = hf.getChapterQuestions(lectures, 1);
              db.updateChapter(this.event.session.user.userId, 1);
            } else {
              this.attributes["allQuestions"] = hf.getChapterQuestions(lectures, chapter);
            }
          }

          this.attributes["stopcounter"] = 0;
          this.attributes["allQuestions"] = _.shuffle(this.attributes["allQuestions"]);
          this.attributes["currentQuestion"] = this.attributes["allQuestions"].pop();

          //console.log("----------------------------------------------------------------------------");
          //console.log("\n*** POINTS: " + this.attributes["points"] + " ***");
          //console.log("\n" + this.attributes["currentQuestion"].text + "\n-> " + this.attributes["currentQuestion"].answer);
          //console.log("");

          this.response.speak("Es geht los! " + this.attributes["currentQuestion"].text).listen("Es geht los! " + this.attributes["currentQuestion"].text);
          this.emit(":responseReady");

        } else {

          if( this.event.request.intent.slots === undefined ){
            this.response.speak("Das habe ich leider nicht verstanden, " + this.attributes["currentQuestion"].text).listen("Das habe ich leider nicht verstanden, " + this.attributes["currentQuestion"].text);
            this.emit(":responseReady");
          } else {

            if(this.event.request.intent.name == "LecturePlayIntent"){
              //console.log(" ERROR ");
              if( this.event.request.intent.slots.Lection.value.toLowerCase() === this.attributes["currentQuestion"].answer.toLowerCase() ||
              (this.event.request.intent.slots.Lection.value.toLowerCase() === "eine" &&  this.attributes["currentQuestion"].answer.toLowerCase() === "eins") ){
                this.attributes["points"] += 1;
                db.addPointToUser(this.event.session.user.userId);
                this.attributes["stopcounter"] = this.attributes["stopcounter"]+1;
                this.attributes["allQuestions"] = _.shuffle(this.attributes["allQuestions"]);
                this.attributes["currentQuestion"] = this.attributes["allQuestions"].pop();

                if(this.attributes["stopcounter"] == 3){
                  this.attributes["currentQuestion"] = null;
                }

                if(!this.attributes["currentQuestion"]){
                  this.response.speak("Richtig, Du hast deine Aufgaben beantwortet.");
                  this.emit(":responseReady");
                } else {
                  this.response.speak(hf.getRightVariation() + " , " + this.attributes["currentQuestion"].text).listen(hf.getRightVariation() + " , " + this.attributes["currentQuestion"].text);
                  this.emit(":responseReady");
                }

              } else {
                this.attributes["points"] -= 1;
                db.removePointFromUser(this.event.session.user.userId);
                this.attributes["stopcounter"] = this.attributes["stopcounter"]+1;
                this.attributes["allQuestions"] = _.shuffle(this.attributes["allQuestions"]);
                this.attributes["currentQuestion"] = this.attributes["allQuestions"].pop();

                if(this.attributes["stopcounter"] == 3){
                  this.attributes["currentQuestion"] = null;
                }
                if(!this.attributes["currentQuestion"]){
                  this.response.speak("Leider falsch, Du hast deine Aufgaben beantwortet.");
                  this.emit(":responseReady");
                } else {
                  this.response.speak("Leider falsch, " + this.attributes["currentQuestion"].text).listen("Leider falsch, " + this.attributes["currentQuestion"].text);
                  this.emit(":responseReady");
                }

              }
            } else {
              if( this.event.request.intent.slots.Answer.value.toLowerCase() === this.attributes["currentQuestion"].answer.toLowerCase() ||
              (this.event.request.intent.slots.Answer.value.toLowerCase() === "eine" &&  this.attributes["currentQuestion"].answer.toLowerCase() === "eins") ){
                this.attributes["points"] += 1;
                db.addPointToUser(this.event.session.user.userId);
                this.attributes["stopcounter"] = this.attributes["stopcounter"]+1;
                this.attributes["allQuestions"] = _.shuffle(this.attributes["allQuestions"]);
                this.attributes["currentQuestion"] = this.attributes["allQuestions"].pop();

                if(this.attributes["stopcounter"] == 3){
                  this.attributes["currentQuestion"] = null;
                }
                if(!this.attributes["currentQuestion"]){
                  this.response.speak("Richtig, Du hast deine Aufgaben beantwortet.");
                  this.emit(":responseReady");
                } else {
                  this.response.speak(hf.getRightVariation() + " , " + this.attributes["currentQuestion"].text).listen(hf.getRightVariation() + " , " + this.attributes["currentQuestion"].text);
                  this.emit(":responseReady");
                }

              } else {
                this.attributes["points"] -= 1;
                db.removePointFromUser(this.event.session.user.userId);
                this.attributes["stopcounter"] = this.attributes["stopcounter"]+1;
                this.attributes["allQuestions"] = _.shuffle(this.attributes["allQuestions"]);
                this.attributes["currentQuestion"] = this.attributes["allQuestions"].pop();

                if(this.attributes["stopcounter"] == 3){
                  this.attributes["currentQuestion"] = null;
                }
                if(!this.attributes["currentQuestion"]){
                  this.response.speak("Leider falsch, Du hast deine Aufgaben beantwortet.");
                  this.emit(":responseReady");
                } else {
                  this.response.speak("Leider falsch, " + this.attributes["currentQuestion"].text).listen("Leider falsch, " + this.attributes["currentQuestion"].text);
                  this.emit(":responseReady");
                }

              }
            }

          }

        }

      } else {
        this.attributes["game"] = false;

        console.log(this.event.request.intent.name);

        if(this.event.request.intent.name == "LectureContinueIntent"){
          this.emitWithState("GameContinueIntent");
        } else {
          this.response.speak('Das hat leider nicht geklappt, sage Spiel fortfahren oder zufällig Spielen!').listen('Das hat leider nicht geklappt, sage Spiel fortfahren oder zufällig Spielen!');
          this.emit(":responseReady");
        }
      }
    });
  });

  },
  "GameRandomIntent": function () {
    this.attributes["game"] = true;
    this.attributes["randomgame"] = true;
    this.emitWithState("GameIntent");
  },
  "GameContinueIntent": function () {
    this.attributes["game"] = true;
    this.attributes["continuegame"] = true;
    this.emitWithState("GameIntent");
  },
  "AMAZON.StopIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "AMAZON.CancelIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "AMAZON.HelpIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "AMAZON.YesIntent": function () {
    this.handler.state = "_START";
    this.emitWithState("Start");
  },
  "AMAZON.NoIntent": function () {
    this.response.speak('Auf Wiederhören!');
    this.emit(":responseReady");
  },
  "HomeIntent": function () {
    this.handler.state = "_START";
    this.emitWithState("Start");
  },
  "Unhandled": function () {
    this.emitWithState("GameIntent");
  }
});
