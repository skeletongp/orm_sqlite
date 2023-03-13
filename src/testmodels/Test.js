
//import super class Model
const Model =require ("../orm/model.js");
class Test extends Model {

  //must set db has an instance of Database class using method open
  constructor(db, data = {}) {
    super(db,"test", Test.columns, Test.searchables); //
    this.softDeletes = false; // set true to enable soft deletes if table has a deleted_at column
  }

  //must set getter method to return an instance of TestData
  getter(data) {
    return new TestData(data);
  }

}


//Class to return data
class TestData {

  //must set constructor to assign data to this
  constructor(data = {}) {
    Object.assign(this, data);
  }
}


//must set prototype of TestData to Test prototype
Object.setPrototypeOf(TestData.prototype, Test.prototype);

//required: set table name, columns and searchables
Test.tableName = "test";

//these columns are just examples, you must set your own
Test.columns = ["id", "name", "age", "email", "address"];
Test.searchables = [];

module.exports = Test;
