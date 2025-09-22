//Asynchronous code execution

import fs from "fs";

console.log("This is the start of the file");

fs.readFile("testFile.txt", "utf-8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }
  console.log(data, "----this is the data");
});

console.log("This is the end of the file");


//Synchronous code execution

import fs from "fs";

console.log("This is the start of the file");

const data = fs.readFileSync("testFile.txt", "utf-8");
console.log(data, "----this is the data");

console.log("This is the end of the file");

