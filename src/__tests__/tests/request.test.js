const Database = require("../../initials/database.js");
const db = new Database("test.db").open();

test("CanValidateRequest", async () => {
  const Request = require("../../testrequests/requestTest.js");
  const req = new Request(db, {
    name: "Ismael",
    email: "user@email.test",
  });
  await req
    .validate()
    .then((result) => {
      expect(result).toBeDefined();
    })
    .catch((error) => {
      console.log(error);
      expect(error).toBeDefined();
    });
});
