const ts = require("typescript");
const fs = require("fs");

const configSearch = require.main?.path || process.cwd();
const configPath = ts.findConfigFile(
  configSearch,
  ts.sys.fileExists,
  "tsconfig.json"
);
const options = configPath && JSON.parse(fs.readFileSync(configPath, "utf8"));

require.extensions[".ts"] = function (module, filename) {
  if (!configPath) {
    throw new Error(
      "tsconfig not found! We searched path: " +
        configSearch +
        " for tsconfig.json but couldn't find it!"
    );
  }
  const servicesHost = {
    getScriptFileNames: () => [filename],
    getScriptVersion: (scriptName) => scriptName == filename && "0",
    getScriptSnapshot: (filename) => {
      if (!fs.existsSync(filename)) {
        return undefined;
      }
      return ts.ScriptSnapshot.fromString(fs.readFileSync(filename).toString());
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => options,
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  };

  // console.time("Creating language service");
  const services = ts.createLanguageService(
    servicesHost,
    ts.createDocumentRegistry()
  );
  // console.timeEnd("Creating language service");

  // console.time("Emitting");
  const output = services.getEmitOutput(filename);
  // console.timeEnd("Emitting");

  const data = output.outputFiles[0].text;
  // console.time("Compiling CJS");
  module._compile(data, filename);
  // console.timeEnd("Compiling CJS");
};
