class Migrate {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
    this.columns = [];
    this.options = [];
  }

  name(name) {
    this.currentColumn = { name };
    this.columns.push(this.currentColumn);
    return this;
  }

  type(type) {
    this.currentColumn.type = type;
    return this;
  }

  length(length) {
    this.currentColumn.length = length;
    return this;
  }

  primary(primary) {
    this.currentColumn.primary = primary;
    return this;
  }

  autoincrement(autoincrement) {
    this.currentColumn.autoincrement = autoincrement;
    return this;
  }

  notNull(notNull) {
    this.currentColumn.notNull = notNull;
    return this;
  }

  unique(unique) {
    this.currentColumn.unique = unique;
    return this;
  }

  check(check) {
    this.currentColumn.check = check;
    return this;
  }

  default(defaultValue) {
    this.currentColumn.default = defaultValue;
    return this;
  }

  collate(collate) {
    this.currentColumn.collate = collate;
    return this;
  }

  foreignKey(column, foreignTable, foreignColumn, onUpdate, onDelete) {
    const foreignKey = {
      column,
      foreignTable,
      foreignColumn,
      onUpdate,
      onDelete,
    };
    this.options.push(
      `FOREIGN KEY (${column}) REFERENCES ${foreignTable}(${foreignColumn})`
    );
    if (onUpdate) {
      this.options[this.options.length - 1] += ` ON UPDATE ${onUpdate}`;
    }
    if (onDelete) {
      this.options[this.options.length - 1] += ` ON DELETE ${onDelete}`;
    }
    return this;
  }

  ok() {
    return this;
  }

  timestamps(){
    this.name('created_at').type('INTEGER').default("(strftime('%s', 'now'))").ok();
    this.name('updated_at').type('INTEGER').default("(strftime('%s', 'now'))").ok();
    return this;

  }
  sofdeletes(){
    this.name('deleted_at').type('INTEGER').ok();
    return this;
  }
  create() {
    const columnDefinitions = this.columns.map((column) => {
      let definition = `${column.name} ${column.type}`;
      if (column.length) {
        definition += `(${column.length})`;
      }
      if (column.primary) {
        definition += " PRIMARY KEY";
      }
      if (column.notNull !== undefined) {
        definition += column.notNull ? " NOT NULL" : " NULL";
      }
      if (column.unique) {
        definition += " UNIQUE";
      }
      if (column.check) {
        definition += ` CHECK(${column.check})`;
      }
      if (column.default !== undefined) {
        definition += ` DEFAULT ${column.default}`;
      }
      if (column.collate) {
        definition += ` COLLATE ${column.collate}`;
      }
      return definition;
    });

    const optionDefinitions = this.options.join(", ");

    const query = `CREATE TABLE IF NOT EXISTS ${
      this.tableName
    } (${columnDefinitions.join(", ")}${
      optionDefinitions ? `, ${optionDefinitions}` : ""
    })`;

    return new Promise((resolve, reject) => {
      this.db.run(query, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  //drop table if exists
  drop() {
    this.db.run(`DROP TABLE IF EXISTS ${this.tableName}`);
  }

  //truncate table if exists
  truncate() {
    this.db.run(`DELETE FROM ${this.tableName}`);
  }
 

   add(columnName) {
   
    this.currentColumn = { name: columnName };
    this.columns.push(this.currentColumn);
    return this;
  }

 
  getColumnDefinition(column) {
    let definition = `${column.name} ${column.type}`;

    if (column.primary) {
      definition += " PRIMARY KEY";
    }

    if (column.autoincrement) {
      definition += " AUTOINCREMENT";
    }

    if (column.notNull) {
      definition += " NOT NULL";
    }

    if (column.unique) {
      definition += " UNIQUE";
    }

    return definition;
  }

  createColumn() {
    const columnDefinition = this.getColumnDefinition(this.currentColumn);
    const existsColumn= this.validateColumn(this.currentColumn.name);
    if(!existsColumn) return false;
    const query = `ALTER TABLE ${this.tableName} ADD COLUMN ${columnDefinition}`;
     this.runQuery(query);
  }

  validateColumn(column) {
    const query = `PRAGMA table_info(${this.tableName})`;
    this.db.get(query).then((result) => {
      const columnNames = result?result.map((column) => column.name):[];
      return columnNames.includes(column);
    }).catch((err) => {
      return false;
    });;
  
   
  }   

  async rename(oldColumnName, newColumnName) {
    const existsColumn=await this.validateColumn(oldColumnName);
    if(!existsColumn) return false;
    const query = `ALTER TABLE ${this.tableName} RENAME COLUMN ${oldColumnName} TO ${newColumnName}`;
    return this.runQuery(query);
  }

  async dropColumn(columnName) {
    const existsColumn=await this.validateColumn(columnName);
    if(!existsColumn) return false;
    const query = `ALTER TABLE ${this.tableName} DROP COLUMN  ${columnName}`;
    await this.runQuery(query);
    this.columns = this.columns.filter((column) => column.name !== columnName);
  }
  async runQuery(query) {
    return new Promise((resolve, reject) => {
      this.db.run(query, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = Migrate;
