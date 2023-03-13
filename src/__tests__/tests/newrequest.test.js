const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

test("CanGenerateRequest", () => {
    const modelName = "Test";
    const requestPath = "src/testrequests";
    const table = "test";

    
  // Eliminar el archivo de modelo si ya existe
  const filePath =`./${requestPath}/request${modelName}`;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // Ejecutar el script para crear un modelo
  execSync(`npm run newRequest ${modelName} ${requestPath} ${table} `,{ stdio: "inherit" });

  // Comprobar que se ha creado el archivo de modelo
  expect(fs.existsSync(filePath)).toBe(true);

  // Comprobar que el archivo de modelo tiene el contenido esperado
  const fileContent = fs.readFileSync(filePath, "utf-8");
  expect(fileContent).toContain(`class request${modelName} extends Request {`);
  expect(fileContent).toContain(`const table="${table}"`);

  });