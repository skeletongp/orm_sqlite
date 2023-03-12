const Migrate = require("../../initials/migrate");
const Database = require("../../initials/database");

const db = new Database("test.db").open();
  test("CanCreateMigrateObject", () => {
    const migrate = new Migrate();
    expect(migrate).toBeDefined();
  });

  test("CanCreateTable", () => {
    const tableName = "test";
    const table = new Migrate(db, tableName);
    table.drop();
    table
      .name("id")
      .type("INTEGER")
      .primary(true)
      .autoincrement(true)
      .ok()
      .name("name")
      .type("TEXT")
      .notNull(true)
      .ok()
      .name("age")
      .type("INTEGER")
      .ok()
      .name("email")
      .type("TEXT")
      .unique(true)
      .ok()
      .name("address")
      .type("TEXT")
      .ok()
      .timestamps()
      .sofdeletes()
      ;
    table.create();
    expect(table).toBeDefined();
  });

  test("CandAddColumn", () => {
    const tableName = "test";
    const table = new Migrate(db, tableName);
    table.add("employee").type("TEXT");
    table.createColumn();
    expect(table).toBeDefined();
  });

  test("CanDropTable", () => {
    const tableName = "users";
    const table = new Migrate(db, tableName);
    table.drop();
    expect(table).toBeDefined();
  });

  test('CanRenameColumn', () => {
    const tableName = 'test';
    const table = new Migrate(db, tableName);
    table.rename('employee', 'employee_id');
    expect(table).toBeDefined();

  });
  test("CanDropColumn", async  () => {
    const tableName = "test";
    const table = new Migrate(db, tableName);
   await table.dropColumn("employee_id");
    expect(table).toBeDefined();
  });

  test("CanTruncateTable", () => {
    const tableName = "test";
    const table = new Migrate(db, tableName);
    table.truncate();
    expect(table).toBeDefined();
  });
