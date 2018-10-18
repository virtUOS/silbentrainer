
// CREATE USER 'app'@'localhost' IDENTIFIED BY 'Ampel123,.'; GRANT ALL PRIVILEGES ON * . * TO 'app'@'localhost'; FLUSH PRIVILEGES;
// ALTER USER 'app'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Ampel123,.';
// CREATE DATABASE IF NOT EXISTS app_alexa_virtuos;
// SET GLOBAL general_log  = 'ON';

// sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
// uncomment:
	// general_log_file        = /var/log/mysql/mysql.log
	// general_log             = 1

// sudo systemctl restart mysql
// sudo tail -f /var/log/mysql/mysql.log


var mysql = require('mysql');

var con = mysql.createConnection({
	host: "localhost",
	user: "app",
	password: "app",
	database: "app_alexa_virtuos"
});

/*var con = mysql.createConnection({
	host: "localhost",
	user: "app",
	password: "Ampel123,.",
	database: "app_alexa_virtuos"
});*/

con.connect(function(err) {
	if (err) throw err;

	var sql = "CREATE TABLE IF NOT EXISTS customers (userid VARCHAR(255), points VARCHAR(255), chapter VARCHAR(255))";
	con.query(sql, function (err, result) {
		if (err) throw err;
		console.log("customers Table created");
	});

	/*
	var sql = "CREATE TABLE IF NOT EXISTS customers_lectures (userid VARCHAR(255), lectureid VARCHAR(255))";
	con.query(sql, function (err, result) {
		if (err) throw err;
		console.log("customers_lectures Table created");
	});
	*/
	var sql = "CREATE TABLE IF NOT EXISTS lectures (lectureid VARCHAR(255), category VARCHAR(255), text VARCHAR(255), answer VARCHAR(255))";
	con.query(sql, function (err, result) {
		if (err) throw err;
		console.log("lectures Table created");
	});


});

exports.addUser = function(userid){
	var sql = "SELECT * FROM customers WHERE userid = '"+userid+"'";
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    if(result.length>0){
	    	console.log("user already exists");
	    } else {
	    	var sql2 = "INSERT INTO customers (userid, points, chapter) VALUES ('"+userid+"', '0', '1')";
			con.query(sql2, function (err, result) {
				if (err) throw err;
				console.log("new user added");
			});
	    }
  	});
};

exports.getPointsFromUser = function(userid, callback){
	var sql = "SELECT * FROM customers WHERE userid = '"+userid+"'";
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    if(result.length>0){
	    	return callback(result[0].points);
	    }
  	});
};

exports.getChapterFromUser = function(userid, callback){
	var sql = "SELECT * FROM customers WHERE userid = '"+userid+"'";
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    if(result.length>0){
	    	return callback(result[0].chapter);
	    }
  	});
};

exports.removeSongPointsFromUser = function(userid){
	var sql = "SELECT * FROM customers WHERE userid = '"+userid+"'";
	con.query(sql, function (err, result) {
		if (err) throw err;
		let points = result[0].points;
		var sql2 = "UPDATE customers SET points = '"+(parseInt(points)-1)+"' WHERE userid = '"+userid+"'";
		con.query(sql2, function (err, result) {
			if (err) throw err;
			console.log("song points removed");
			//console.log(result);
		});
	});
};

exports.addPointToUser = function(userid){
	var sql = "SELECT * FROM customers WHERE userid = '"+userid+"'";
	con.query(sql, function (err, result) {
		if (err) throw err;
		let points = result[0].points;
		var sql2 = "UPDATE customers SET points = '"+(parseInt(points)+1)+"' WHERE userid = '"+userid+"'";
		con.query(sql2, function (err, result) {
			if (err) throw err;
			console.log("points added");
			//console.log(result);
		});
	});
};

exports.removePointFromUser = function(userid){
	var sql = "SELECT * FROM customers WHERE userid = '"+userid+"'";
	con.query(sql, function (err, result) {
		if (err) throw err;
		let points = result[0].points;
		var sql2 = "UPDATE customers SET points = '"+(parseInt(points)-1)+"' WHERE userid = '"+userid+"'";
		con.query(sql2, function (err, result) {
			if (err) throw err;
			console.log("points removed");
			//console.log(result);
		});
	});
};

exports.getUsers = function(){
	var sql = "SELECT * FROM customers";
	con.query(sql, function (err, result, fields) {
		if (err) throw err;
		//console.log(result);
	});
};

exports.getLection = function(lectureid, callback){
	var sql = "SELECT * FROM lectures WHERE lectureid = '"+lectureid+"'";
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    if(result.length>0){
	    	return callback(result[0]);
	    }
  	});
};

exports.getAllLections = function(callback){
	var sql = "SELECT * FROM lectures";
	con.query(sql, function (err, result) {
	    if (err) throw err;
	    if(result.length>0){
	    	return callback(result);
	    }
  	});
};

exports.addLectureToDatabase = function(lectureid, category, text, answer){
	var sql = "INSERT INTO lectures (lectureid, category, text, answer) VALUES ('"+lectureid+"', '"+category+"', '"+text+"', '"+answer+"')";
	con.query(sql, function (err, result) {
		if (err) throw err;
		console.log("new lecture added");
	});
};

exports.updateChapter = function(userid, chapter){
	var sql = "SELECT * FROM customers WHERE userid = '"+userid+"'";
	con.query(sql, function (err, result) {
		if (err) throw err;
		//let chapter = result[0].chapter;
		var sql2 = "UPDATE customers SET chapter = '"+(parseInt(chapter))+"' WHERE userid = '"+userid+"'";
		con.query(sql2, function (err, result) {
			if (err) throw err;

			console.log("chapter updated: " + chapter);
			//console.log(result);
		});
	});
};
