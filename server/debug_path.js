const path = require('path');
const fs = require('fs');

const clientDistPath = path.join(__dirname, "..", "client", "dist");
console.log("Joined path:", clientDistPath);
console.log("Absolute path:", path.resolve(clientDistPath));
console.log("Exists:", fs.existsSync(clientDistPath));
