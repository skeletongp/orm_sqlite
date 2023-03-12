const Database = require("../../initials/database");
let db;
db = new Database("test.db");

test("CanOpenDatabaseObject", () => {
  expect(db).toBeDefined();
});

test("CanOpenDatabaseConnection", () => {
  db.open();
  expect(db).toBeDefined();
});

test("CanCloseDatabaseConnection", () => {
  db.close();
  expect(db).toBeDefined();
});

test("CanRunSql", () => {
  db.open();
  const result = db.run("SELECT sqlite_version()");
  console.log(result);
  expect(result).toBeDefined();
  db.close();
});

test("CanGetSql", async () => {
  db.open();
  const result = await db.get("SELECT sqlite_version()");
  console.log(result);
  expect(result).toBeDefined();
  db.close();
});
