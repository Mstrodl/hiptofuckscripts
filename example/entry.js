// Load the hiptofuckscripts prelude:
require("../index.js");
// Do something ungodly:
const value = require("./example.ts");

// Hey look, we can access exports!
console.log("example.ts exports:", value);
console.log("Value of bar(32):", value.bar(32));
console.log(
  "Value of bar([String]):",
  value.bar("Hahahaha you can't reach me here!")
);
