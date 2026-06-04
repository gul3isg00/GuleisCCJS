import { GuleisCCJS } from "./src/compiler";
import fs from "fs";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let tests_passed = 0;
let num_tests = 0;

async function run_tests(stages: number) {
  console.clear();

  let file_path = "c_src/exemplar/stage_";

  if (stages == null || isNaN(stages)) return;

  for (let x = 1; x != (stages + 1); x++) {
    for (let y = 0; y != 2; y++) {
      const extra_path = y == 0 ? "valid" : "invalid";
      await iterate_through_files(x, file_path, extra_path);
    }
  }
  console.log(`\n---------------------------`);
  console.log(`Passed ${tests_passed}/${num_tests} tests.`);
  console.log(`-----------------------------`);

  return;
}

async function iterate_through_files(stage: number, main_path: string, extra_path: string) {
  const cur_file_path = `${main_path}${stage}/${extra_path}/`;
  const files = fs.readdirSync(cur_file_path);

  for (let x = 0; x != files.length; x++) {
    const file = files[x];
    if (file.includes(".c")) {
      num_tests += 1;
      let current_stage = "Compiling to Assembly (GuleisCCTS)";
      try {
        console.log(`\n(Stage ${stage} - ${extra_path}) ${file}.`);
        const compiler = new GuleisCCJS(cur_file_path + file);
        compiler.compile();

        if (extra_path == "invalid") {
          console.log(` - ${current_stage} ❌`);
          continue;
        };

        console.log(` - ${current_stage} ✅`);

        current_stage = "Compiling to machine code (gcc)"
        const { stderr: compileError } = await execAsync(`gcc ${(cur_file_path + file).replace(".c", ".s")} -o ${cur_file_path + file.replace(".c", "")}`);
        console.log(` - ${current_stage} ✅`);
        current_stage = "Running file."
        const { stdout, stderr: runError } = await execAsync("./" + cur_file_path + file.replace(".c", ""));
        console.log(` - ${current_stage} ✅ (Exit code: 0)`);
        tests_passed += 1;

      } catch (error: any) {
        if (error.code !== undefined && error.signal === null) {
          console.log(` - ${current_stage} ✅ (Exit code: ${error.code})`);
          tests_passed += 1;
        } else {
          if (extra_path == "invalid") {
            tests_passed += 1;
          }
          console.log(` - ${current_stage} ${extra_path == "invalid" ? "✅" : "❌"} (${error})`)
        }

      }
    }

  }
}

const stages = Number(process.argv[2]);

run_tests(stages);

