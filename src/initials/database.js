const sqlite3 = require("sqlite3").verbose();

class Database {
  //initialize the database with path to the database file
  constructor(path) {
    this.dbtPath = path;
  }

  //open the database connection

  open() {
    const db = new sqlite3.Database(this.dbtPath, (err) => {
      if (err) {
        throw err;
      }
    });
    this.db = db;
    return this;
  }

  run(sql, params = []) {
   return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err.message);
        } else {
          resolve(true);
        }
      });
    });
  }

  get(sql, params = []) {
    try {
      return new Promise((resolve, reject) => {
        console.log("running sql: ", sql, " with params: ", params)
        this.db.all(sql, params, (err, rows) => {
          if (err) {
            console.log("error running sql: ", sql, " with params: ", params);
            reject(err.message);
          } else {
            resolve(rows);
          }
        });
      });
    } catch (error) {
      console.log("error running sql: ", sql, " with params: ", params);
      console.log(error);
    }
  }

  //close the database connection
  close() {
    this.db.close((err) => {
      if (err) {
        throw err;
      }
      return true;
    });
  }
}

module.exports = Database;
