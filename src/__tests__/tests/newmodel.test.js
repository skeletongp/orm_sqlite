const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

test("CanGenerateModel", () => {
  const modelName = "Test";
  const table = "test";
  const route = "../testmodels";

  // Eliminar el archivo de modelo si ya existe
  const filePath = path.join('./src','testmodels',`${modelName}.js`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Ejecutar el script para crear un modelo
  execSync(`npm run newModel ${modelName} ${table} ${route}`,{ stdio: "inherit" });
  console.log(filePath)
  // Comprobar que se ha creado el archivo de modelo
  expect(fs.existsSync(filePath)).toBe(true);

  // Comprobar que el archivo de modelo tiene el contenido esperado
  const fileContent = fs.readFileSync(filePath, "utf-8");
  expect(fileContent).toContain(`class ${modelName} extends Model {`);
  expect(fileContent).toContain(`tableName = "${table}"`);
});
