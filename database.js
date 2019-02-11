
// CREATE USER 'app'@'localhost' IDENTIFIED BY 'Ampel123,.'; GRANT ALL PRIVILEGES ON * . * TO 'app'@'localhost'; FLUSH PRIVILEGES;
// ALTER USER 'app'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Ampel123,.';
// CREATE DATABASE IF NOT EXISTS app_alexa_virtuos;
// SET GLOBAL general_log  = 'ON';

var mysql = require('mysql')

var pool = mysql.createPool({
  connectionLimit: 100,
  host: 'localhost',
  user: 'app',
  password: 'Ampel123,.',
  database: 'app_alexa_virtuos'
})

pool.getConnection(function (err, con) {
  if (err) {
    con.release()
    throw err
  }
  var sql = 'CREATE TABLE IF NOT EXISTS customers (userid VARCHAR(255), points VARCHAR(255), chapter VARCHAR(255))'
  con.query(sql, function (err2, result) {
    if (err2) throw err2
    // console.log('customers Table created')
  })

  sql = 'CREATE TABLE IF NOT EXISTS lectures (lectureid VARCHAR(255), category VARCHAR(255), text VARCHAR(255), answer VARCHAR(255))'
  con.query(sql, function (err2, result) {
    if (err2) throw err2
    // console.log('lectures Table created')
  })
  con.release()
})

exports.addUser = function (userid) {
  pool.getConnection(function (err, con) {
    if (err) {
      con.release()
      throw err
    }

    var sql = "SELECT * FROM customers WHERE userid = '" + con.escapeId(userid) + "'"
    con.query(sql, function (err2, result) {
      if (err2) throw err2
      if (result.length > 0) {
        // console.log('user already exists')
      } else {
        var sql2 = "INSERT INTO customers (userid, points, chapter) VALUES ('" + con.escapeId(userid) + "', '0', '0')"
        con.query(sql2, function (err2, result) {
          if (err2) throw err2
          // console.log('new user added')
        })
      }
    })

    con.release()
  })
}

exports.getPointsFromUser = function (userid) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, con) {
      if (err) {
        con.release()
        throw err
      }
      var sql = "SELECT * FROM customers WHERE userid = '" + con.escapeId(userid) + "'"
      con.query(sql, function (err2, result) {
        if (err2) reject(err2)
        if (result.length > 0) {
          resolve(result[0].points)
        }
      })
      con.release()
    })
  })
}

exports.getChapterFromUser = function (userid) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, con) {
      if (err) {
        con.release()
        throw err
      }
      var sql = "SELECT * FROM customers WHERE userid = '" + con.escapeId(userid) + "'"
      con.query(sql, function (err2, result) {
        if (err2) reject(err2)
        if (result.length > 0) {
          resolve(result[0].chapter)
        }
      })
      con.release()
    })
  })
}

exports.removeSongPointsFromUser = function (userid, amount) {
  pool.getConnection(function (err, con) {
    if (err) {
      con.release()
      throw err
    }
    var sql = "SELECT * FROM customers WHERE userid = '" + con.escapeId(userid) + "'"
    con.query(sql, function (err2, result) {
      if (err2) throw err2
      let points = result[0].points
      var sql2 = "UPDATE customers SET points = '" + con.escape((parseInt(points) - amount)) + "' WHERE userid = '" + con.escapeId(userid) + "'"
      con.query(sql2, function (err2, result) {
        if (err2) throw err2
        // console.log('song points removed')
        // // console.log(result);
      })
    })
    con.release()
  })
}

exports.addPointToUser = function (userid) {
  pool.getConnection(function (err, con) {
    if (err) {
      con.release()
      throw err
    }
    var sql = "SELECT * FROM customers WHERE userid = '" + con.escapeId(userid) + "'"
    con.query(sql, function (err2, result) {
      if (err2) throw err2
      let points = result[0].points
      var sql2 = "UPDATE customers SET points = '" + con.escape((parseInt(points) + 1)) + "' WHERE userid = '" + con.escapeId(userid) + "'"
      con.query(sql2, function (err2, result) {
        if (err2) throw err2
        // console.log('points added')
        // // console.log(result);
      })
    })
    con.release()
  })
}

exports.removePointFromUser = function (userid) {
  pool.getConnection(function (err, con) {
    if (err) {
      con.release()
      throw err
    }
    var sql = "SELECT * FROM customers WHERE userid = '" + con.escapeId(userid) + "'"
    con.query(sql, function (err2, result) {
      if (err2) throw err2
      let points = result[0].points
      var sql2 = "UPDATE customers SET points = '" + con.escape((parseInt(points) - 1)) + "' WHERE userid = '" + con.escapeId(userid) + "'"
      con.query(sql2, function (err2, result) {
        if (err2) throw err2
        // console.log('points removed')
        // // console.log(result);
      })
    })
    con.release()
  })
}

exports.getLection = function (lectureid, callback) {
  pool.getConnection(function (err, con) {
    if (err) {
      con.release()
      throw err
    }
    var sql = "SELECT * FROM lectures WHERE lectureid = '" + con.escape(lectureid) + "'"
    con.query(sql, function (err2, result) {
      if (err2) throw err2
      if (result.length > 0) {
        return callback(result[0])
      }
    })
    con.release()
  })
}

exports.getAllLections = function () {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, con) {
      if (err) {
        con.release()
        throw err
      }
      var sql = 'SELECT * FROM lectures'
      con.query(sql, function (err2, result) {
        if (err2) reject(err2)
        if (result.length > 0) {
          resolve(result)
        }
      })
      con.release()
    })
  })
}

exports.getLectionsByCategory = function (category) {
  return new Promise((resolve, reject) => {
    pool.getConnection(function (err, con) {
      if (err) {
        con.release()
        throw err
      }
      category = parseInt(category)
      if (category === 0 || category === 6 || category === 7 || category === 8) {
        category = 1
      }
      var sql = 'SELECT * FROM lectures WHERE category = ' + con.escape(category)
      con.query(sql, function (err2, result) {
        if (err2) reject(err2)
        if (result.length > 0) {
          resolve(result)
        }
      })
      con.release()
    })
  })
}

exports.deleteUserData = function () {
  pool.getConnection(function (err, con) {
    if (err) {
      con.release()
      throw err
    }
    var sql = 'DELETE FROM customers WHERE 1'
    con.query(sql, function (err2, result) {
      if (err2) throw err2
    })
    con.release()
  })
}

exports.addLectureToDatabase = function (lectureid, category, text, answer) {
  pool.getConnection(function (err, con) {
    if (err) {
      con.release()
      throw err
    }
    var sql = 'INSERT INTO lectures (lectureid, category, text, answer) VALUES (' + con.escape(lectureid) + ', ' + con.escape(category) + ', ' + con.escape(text) + ', ' + con.escape(answer) + ')'
    con.query(sql, function (err2, result) {
      if (err2) throw err2
      // console.log('new lecture added')
    })
    con.release()
  })
}

exports.updateChapter = function (userid, chapter) {
  pool.getConnection(function (err, con) {
    if (err) {
      con.release()
      throw err
    }
    var sql = "SELECT * FROM customers WHERE userid = '" + userid + "'"
    con.query(sql, function (err2, result) {
      if (err2) throw err2
      // let chapter = result[0].chapter
      var sql2 = "UPDATE customers SET chapter = '" + con.escape((parseInt(chapter))) + "' WHERE userid = '" + con.escapeId(userid) + "'"
      con.query(sql2, function (err2, result) {
        if (err2) throw err2
        // console.log('chapter updated: ' + chapter)
        // // console.log(result);
      })
    })
    con.release()
  })
}
