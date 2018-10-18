
const _ = require('lodash');
const data = require('./data.js');
const db = require('./database.js');

exports.getRandomNumber = function(max) {
  return Math.floor(Math.random() * Math.floor(max));
};

exports.getRightVariation = function (){
  let shuffledRights = _.shuffle(data.right);
  return shuffledRights[0];
};

exports.getNumberToStringValue = function(n){
	switch(n) {
	    case "eins":
	        n = "1";
	        break;
	    case "zwei":
	        n = "2";
	        break;
	    case "drei":
	        n = "3";
	        break;
	    case "vier":
	        n = "4";
	        break;
	    case "fünf":
	        n = "5";
	        break;
	    case "sechs":
	        n = "6";
	        break;
	    case "sieben":
	        n = "7";
	        break;
	    case "acht":
	        n = "8";
	        break;
	    default:
	        n = "";
	        console.log("getNumberToStringValue: error");
    }
    return n;
};

exports.createAllLectures = function (){
	for (i = 1; i < data.questions.length+1; i++) {
		db.addLectureToDatabase(i,data.questions[i-1].category, data.questions[i-1].text, data.questions[i-1].answer);
	}
};

exports.getChapterQuestions = function(allQuestions, chapter) {
	arr = [];
	for (i = 0; i < allQuestions.length; i++) {
		if (allQuestions[i].category == chapter){
			arr.push(allQuestions[i]);
		}
	}
	return arr;
}
