const Database = require("../../initials/database");


const db = new Database("test.db").open();

beforeAll(async () => {
  await db.run(
    "CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER, email TEXT, address TEXT)"
  );
  await db.run(
    "INSERT INTO test (name, age, email, address) VALUES (?, ?, ?, ?)",["User", 20, "user@email.test1", "test address"]);
  await db.run(
    "INSERT INTO test (name, age, email, address) VALUES (?, ?, ?, ?)",["Second User", 21, "second@email.test1", "test address"]);
  await db.run("INSERT INTO test (name, age, email, address) VALUES (?, ?, ?, ?)",["Third User", 22, "third@email.test1", "test address"]);
});



test("CanInstantiateModel", () => {
  const TestModel = require("../../testmodels/Test");
  const model = new TestModel(db);
  expect(model).toBeInstanceOf(TestModel);
  expect(model.columns.length>0).toBe(true);
});

test("CanInsertData", async () => {
  const TestModel = require("../../testmodels/Test");
  const Request = require("../../testrequests/requestTest");
  const model = new TestModel(db);
  const data = {
    name: "Fift User",
    age: 27,
    email: "fift@email.test",
    address: "test address",
  };
  const request = new Request(db, data);
  await request
    .validate()
    .then(async (result) => {
      const newData = await model.create(data);
      expect(newData).toBeDefined();
    })
    .catch((error) => {
      console.log(error);
      expect(error).toBeDefined();
    });
});

test("CanGetAllData", async () => {
  const TestModel = require("../../testmodels/Test");
  const model = new TestModel(db);
  const data = await model.get();
  console.log(data);
  expect(Array.isArray(data)).toBe(true);
  expect(data.every((item) => item instanceof TestModel)).toBe(true);
});

test("CanGetSingleData", async () => {
  const TestModel = require("../../testmodels/Test");
  const model = new TestModel(db);
  const data = await model.find(2);
  console.log(data);
  expect(data instanceof TestModel || data === null).toBe(true);
});

test("CanPaginateData", async () => {
  const TestModel = require("../../testmodels/Test");
  const model = new TestModel(db);
  const data = await model.paginate(1, 3);
  console.log(data);
  expect(data).toBeDefined();
  expect(data.data).toBeDefined();
  expect(Array.isArray(data.data)).toBe(true);
  expect(data.data.every((item) => item instanceof TestModel)).toBe(true);
  expect(data.data.length <= 3).toBe(true);
  expect(data.links).toBeDefined();
  expect(typeof data.links).toBe("object");
});

test("CanFilterData", async () => {
  const TestModel = require("../../testmodels/Test");
  const model = new TestModel(db);
  const data = await model.where("id", "<", 3).orderBy("id", "desc").get();
  console.log(data);
  expect(Array.isArray(data)).toBe(true);
  expect(data.length <= 3).toBe(true);
  expect(data.every((item) => item instanceof TestModel)).toBe(true);
});

test("CanUpdateData", async () => {
  const TestModel = require("../../testmodels/Test");
  const Request = require("../../testrequests/requestTest");
  const model = new TestModel(db);
  const data = {
    id: 4,
    name: "Fourth User",
    age: Math.floor(Math.random() * 11) + 20,
    email: "updated@email.test",
    address: "test address",
  };
  const request = new Request(db, data);
  await request
    .validate()
    .then(async (result) => {
      const newData = await model.update(data);
      console.log(newData);
      expect(newData).toBeDefined();
    })
    .catch((error) => {
      console.log(error);
      expect(error).toBeDefined();
    });
});

test("CanDeleteData", async () => {
  const TestModel = require("../../testmodels/Test");
  const model = new TestModel(db);
  const data = await model.delete(3);
  console.log(data);
  expect(data).toBe(true);
});

