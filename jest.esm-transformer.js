const ts = require("typescript");

module.exports = {
  process(sourceText, sourcePath) {
    const { outputText } = ts.transpileModule(sourceText, {
      fileName: sourcePath,
      compilerOptions: {
        allowJs: true,
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    });
    return { code: outputText };
  },
};
