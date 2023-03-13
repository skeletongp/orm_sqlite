const {Database} = require('../index');

//test if the Database class is exported using jest

test('Database class is exported', () => {
    expect(Database).toBeDefined();
});

require("./tests/database.test.js")
require("./tests/migrate.test.js")
require("./tests/newmodel.test.js")
require("./tests/newrequest.test.js")
require("./tests/request.test.js")
require("./tests/model.test.js")

