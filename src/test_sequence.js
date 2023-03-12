module.exports = {
    // Orden en que se ejecutarán los archivos de prueba
    testSequencer: async (testCases) => {
      const orderedTests = [
        './__tests__/index.test.js',
        './__tests__/database.test.js',
        './__tests__/migrate.test.js',
        './__tests__/newmodel.test.js',
        './__tests__/newrequest.test.js',
        './__tests__/model.test.js',
        './__tests__/request.test.js',
      ];
  
      const orderedTestCases = [];
      orderedTests.forEach((orderedTest) => {
        const testCase = testCases.find(
          (testCase) => testCase.path === orderedTest
        );
        if (testCase) {
          orderedTestCases.push(testCase);
        }
      });
  
      return orderedTestCases;
    },
  };
  