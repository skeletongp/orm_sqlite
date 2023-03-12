 class EagerLoading {
  

  hasOne(mainModel, relatedModel, ForeignKey, primaryKey = "id", alias = "") {
    const tableName = mainModel.tableName;
    const relatedName = relatedModel.tableName;
    const foreignKey = ForeignKey || `${tableName.slice(0, -1)}_id`;
    const columns = relatedModel.columns;
    const keys = columns.map((key) => {
      return `'${key}', ${relatedName}.${key}`;
    });

    let stm = `
      (SELECT JSON_OBJECT(${keys.join(
        ","
      )}) AS ${relatedName} FROM ${relatedName} WHERE ${relatedName}.${foreignKey} = ${tableName}.${primaryKey} LIMIT 1) AS ${relatedName}
    `;

    return stm;
  }

  hasMany(mainModel, relatedModel, ForeignKey, primaryKey = "id", alias = "") {
    const tableName = mainModel.tableName;
    const relatedName = relatedModel.tableName;
    const foreignKey = ForeignKey || `${tableName.slice(0, -1)}_id`;
    const columns = relatedModel.columns;
    const keys = columns.map((key) => {
      return `'${key}', ${alias || relatedName}.${key}`;
    });

    let stm = `
      (SELECT JSON_GROUP_ARRAY(JSON_OBJECT(${keys.join(
        ","
      )})) AS ${relatedName} FROM ${relatedName} ${alias} WHERE ${
      alias || relatedName
    }.${foreignKey} = ${tableName}.${primaryKey}) AS ${alias || relatedName}
    `;

    return stm;
  }
  belongsTo(
    mainModel,
    relatedModel,
    ForeignKey,
    primaryKey = "id",
    alias = ""
  ) {
    const tableName = mainModel.tableName;
    const relatedName = relatedModel.tableName;
    const foreignKey = ForeignKey || `${relatedName.slice(0, -1)}_id`;
    const columns = relatedModel.columns;
    const keys = columns.map((key) => {
      return `'${key}', ${relatedName}.${key}`;
    });

    let stm = `
      (SELECT JSON_OBJECT(${keys.join(
        ","
      )}) AS ${relatedName} FROM ${relatedName} WHERE ${relatedName}.${primaryKey} = ${tableName}.${foreignKey} LIMIT 1) AS ${
      alias || relatedName
    }
    `;

    return stm;
  }
}

module.exports = EagerLoading;