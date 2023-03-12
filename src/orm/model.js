const QueryBuilder = require("./queryBuilder");
const EagerLoading = require("./eagerLoading");

class Model {
  constructor(db, tableName, columns = [], searchables = []) {
    this.db = db;
    this.tableName = tableName;
    this.columns = columns;
    this.searchables = searchables;
    this.whereClauses = [];
    this.selectColumns = ["*"];
    this.orderByClauses = [];
    this.limitClause = "";
    this.onlyTrashedClause = false;
    this.withTrashedClause = false;
    this.queryBuilder = new QueryBuilder(this.db, tableName, this.columns); // instancia del QueryBuilder
    this.eagerLoading = new EagerLoading(); // instancia del EagerLoading
    this.joinClauses = [];
  }

  where(column, operator, value) {
    if (!value) {
      value = operator;
      operator = "=";
    }

    this.whereClauses.push({
      column,
      operator,
      value,
    });
    return this;
  }

  whereIn(column, values) {
    this.whereClauses.push({
      column,
      operator: "IN",
      value: `${values.join(", ")}`,
    });
    return this;
  }

  whereNotIn(column, values) {
    this.whereClauses.push({
      column,
      operator: "NOT IN",
      value: `${values.join(", ")}`,
    });
    return this;
  }

  whereBetween(column, range) {
    this.whereClauses.push({
      column,
      operator: "BETWEEN",
      value: range,
    });
    return this;
  }

  whereDate(column, date) {
    this.whereClauses.push({
      column,
      operator: "=",
      value: date.toISOString().slice(0, 10),
    });
    return this;
  }

  whereMonth(column, month) {
    this.whereClauses.push({
      column,
      operator: "=",
      value: month,
    });
    return this;
  }

  whereYear(column, year) {
    this.whereClauses.push({
      column,
      operator: "=",
      value: year,
    });
    return this;
  }

  orWhere(column, operator, value) {
    if (!value) {
      value = operator;
      operator = "=";
    }
    this.whereClauses.push({
      column,
      operator,
      value,
      joiner: "OR",
    });
    return this;
  }

  orWhereBetween(column, range) {
    this.whereClauses.push({
      column,
      operator: "BETWEEN",
      value: range,
      joiner: "OR",
    });
    return this;
  }
  async pluck(column1, column2) {
    if (column2) {
      var results = await this.select(column1, column2).get();
    } else {
      var results = await this.select(column1).get();
    }
    if (column2) {
      return results.reduce((obj, row) => {
        obj[row[column1]] = row[column2];
        return obj;
      }, {});
    } else {
      return results.map((row) => row[column1]);
    }
  }

  include(
    relatedModel,
    type = "hasOne",
    foreignKey = null,
    primaryKey = "id",
    alias = ""
  ) {
    let stm = this.eagerLoading[type](
      this,
      relatedModel,
      foreignKey,
      primaryKey,
      alias
    );
    this.selectColumns.push(stm);
    return this;
  }

  search(searchString) {
    const searchables = this.searchables || [];
    const searchWords = searchString.toLowerCase().trim().split(/\s+/);
    var count = 0;
    for (let i = 0; i < searchables.length; i++) {
      if (count == 0) {
        this.where(searchables[i], "LIKE", `%${searchWords[0]}%`);
      } else {
        this.orWhere(searchables[i], "LIKE", `%${searchWords[0]}%`);
      }
      count++;
    }
    for (let i = 1; i < searchWords.length; i++) {
      const word = searchWords[i];
      for (let j = 0; j < searchables.length; j++) {
        if (count == 0) {
          this.where(searchables[j], "LIKE", `%${word}%`);
        } else {
          this.orWhere(searchables[j], "LIKE", `%${word}%`);
        }
        count++;
      }
    }
    return this;
  }

  select(...columns) {
    this.selectColumns = columns;
    return this;
  }
  limit(limit, offset = 0) {
    this.limitClause = `LIMIT ${limit} OFFSET ${offset - 1}`;
    return this;
  }
  async paginate(page = 1, limit = 10) {
    const count = await this.count();
    const lastPage = Math.ceil(count / limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < lastPage ? page + 1 : null;
    const from = (page - 1) * limit + 1;
    const to = page * limit;
    const results = await this.limit(limit, from).get();
    const links = {
      first: `?page=1&limit=${limit}`,
      last: `?page=${lastPage}&limit=${limit}`,
      prev: prevPage !== null ? `?page=${prevPage}&limit=${limit}` : null,
      next: nextPage !== null ? `?page=${nextPage}&limit=${limit}` : null,
      total: count,
      currentPage: page,
      lastPage: lastPage,
      from: from,
      to: to,
    };
    return {
      data: results,
      links: links,
    };
  }

  async find(id) {
    const results = await this.where("id", "=", id).get();
    const modelClass = this.constructor;
    return results.length > 0 ? new modelClass().getter(results[0]) : null;
  }

  async first() {
    const results = await this.limit(1).get();
    const modelClass = this.constructor;
    return results.length > 0 ? new modelClass().getter(results[0]) : null;
  }

  async last() {
    const results = await this.orderBy("id", "desc").limit(1).get();
    const modelClass = this.constructor;
    return results.length > 0 ? new modelClass().getter(results[0]) : null;
  }

  orderBy(column, direction = "ASC") {
    this.orderByClauses = [{ column, direction }];
    return this;
  }

  async count() {
    const selectColumns = this.selectColumns;
    const results = await this.select("COUNT(*) as count").get();
    this.selectColumns = selectColumns;
    return results[0].count;
  }

  async sum(column) {
    const results = await this.select(`SUM(${column}) as sum`).get();
    return results[0].sum;
  }

  onlyTrashed() {
    this.onlyTrashedClause = true;
    return this;
  }

  withTrashed() {
    this.withTrashedClause = true;
    return this;
  }

  async avg(column) {
    const results = await this.select(`AVG(${column}) as avg`).get();
    return results[0].avg;
  }

  join(tableName, column, joinType = "INNER JOIN") {
    if (typeof column === "string") {
      column = `${this.tableName}.${column}`;
    }
    this.joinClauses.push({
      tableName,
      column,
      joinType,
    });
    return this;
  }
  async get() {
    let sql = `SELECT ${this.selectColumns.join(", ")} FROM ${this.tableName}`;
    const values = [];

    if (this.joinClauses.length > 0) {
      for (let i = 0; i < this.joinClauses.length; i++) {
        const { tableName, column, joinType } = this.joinClauses[i];
        const joinCondition = `${tableName}.${column} = ${this.tableName}.${
          this.primaryKey || "id"
        }`;
        sql += ` ${joinType} ${tableName} ON ${joinCondition}`;
      }
    }

    if (this.whereClauses.length > 0) {
      sql += " WHERE ";
      for (let i = 0; i < this.whereClauses.length; i++) {
        const { column, operator, value, joiner } = this.whereClauses[i];
        sql += `${
          i > 0 ? ` ${joiner || "AND"} ` : ""
        }\`${column}\` ${operator} ${
          operator == "BETWEEN" || operator == "NOT BETWEEN"
            ? "(?) AND (?)"
            : "(?)"
        }`;
        if (operator == "BETWEEN" || operator == "NOT BETWEEN") {
          values.push(value[0]);
          values.push(value[1]);
        } else {
          values.push(value);
        }
      }
    }

    if (this.softDeletes) {
      if (!this.withTrashedClause && !this.onlyTrashedClause) {
        if (this.whereClauses.length > 0) {
          sql += " AND `deleted_at` IS NULL";
        } else {
          sql += " WHERE `deleted_at` IS NULL";
        }
      }
      if (this.onlyTrashedClause) {
        if (this.whereClauses.length > 0) {
          sql += " AND `deleted_at` IS NOT NULL";
        } else {
          sql += " WHERE `deleted_at` IS NOT NULL";
        }
      }
    }
    if (this.orderByClauses.length > 0) {
      sql += " ORDER BY ";
      for (let i = 0; i < this.orderByClauses.length; i++) {
        const { column, direction } = this.orderByClauses[i];
        sql += `\`${column}\` ${direction}`;
        if (i < this.orderByClauses.length - 1) {
          sql += ", ";
        }
      }
    }
    sql += ` ${this.limitClause}`;
    const results = await this.db.get(sql, values);

    const modelClass = this.constructor;
    if (Array.isArray(results)) {
      return results.map((result) => {
        return new modelClass().getter(result);
      });
    } else return new modelClass().getter(results);
  }
  toJSON() {
    const data = {};
    for (const key in this) {
      if (this.hasOwnProperty(key) && typeof this[key] !== "function") {
        data[key] = this[key];
      }
    }
    return data;
  }

  /* From queryBuilder */

  async create(data) {
    return this.queryBuilder.create(data);
  }

  async save(data) {
    return this.queryBuilder.save(data);
  }

  async update(data) {
    return this.queryBuilder.update(data);
  }

  async delete(id) {
    return this.queryBuilder.delete(id);
  }

  async forceDelete(id) {
    return this.queryBuilder.forceDelete(id);
  }

  async restore(id) {
    return this.queryBuilder.restore(id);
  }
  async updateOrCreate(data) {
    return this.queryBuilder.updateOrCreate(data);
  }
}

module.exports = Model;