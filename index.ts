import { GuleisCCJS } from "./src/compiler";
import fs from "fs";

let file_path = "c_src/exemplar/stage_";

if (process.argv[2]) {
  file_path += process.argv[2];
} else {
  file_path += "1";
}

console.log(`Compiling files in ${file_path}/valid.`);

fs.readdirSync(file_path + "/valid").forEach((file) => {
  if (file.includes(".c")) {
    console.log(` ! Beginning compilation for ${file}.`);
    const compiler = new GuleisCCJS(file_path + "/valid/" + file);
    compiler.compile();
    console.log(`  - COMPLETED SUCCESFULLY`);
  }
});

console.log(`Compilation for ${file_path}/valid complete!\n\n`);

// console.log(`Compiling files in ${file_path}/invalid.`);

// fs.readdirSync(file_path + "/invalid").forEach((file) => {
//   if (file.includes(".c")) {
//     console.log(` ! Beginning compilation for ${file}.`);
//     const compiler = new GuleisCCJS(file_path + "/invalid/" + file);
//     compiler.compile();
//     console.log(`  - COMPLETED SUCCESFULLY`);
//   }
// });

// console.log(`Compilation for ${file_path}/invalid complete!\n\n`);
