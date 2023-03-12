const fs = require("fs");
const path = require("path");
const modelName = process.argv[2] || "MyModel";
const route = process.argv[3] || "./";
const tableName=process.argv[4] || "table";

// Validate model name
const regex = /^[A-Z][a-zA-Z]+$/;
if (!modelName || !modelName.match(regex)) {
  console.error("Invalid model name");
  process.exit(1);
}

// Create model file
const requestFile = `request${modelName}.js`;
const filePath = path.join(__dirname, route, requestFile);
if (fs.existsSync(filePath)) {
  console.error(`${requestFile} already exists`);
  process.exit(1);
}


const nodeModulesIndex = __dirname.indexOf('node_modules');
var pathForRequest="";
if (nodeModulesIndex !== -1) {
  pathForRequest = "orm_sqlite/src/orm/request.js";
} else {
  pathForRequest = "../orm/request.js";
}
const fileContent = `
//import super class Request
const Request =require ("${pathForRequest}");
class request${modelName} extends Request {

  //must set db has an instance of Database class using method open
    constructor(db, data) {
      const table="${tableName}"
       const validations = {
            // For example: name: ["required", "lowerThan:25"],
            /* allowed validations: required, unique:table,column, exists:table,column, lowerThan, greaterThan, email, url,  string, numeric, array, object, */
        };

        super(db,data, validations, table);
      }
  

}


module.exports = request${modelName};
`;
fs.writeFileSync(filePath, fileContent);

console.log(`${requestFile} request created successfully`);
