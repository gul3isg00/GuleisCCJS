import { GuleisCCJS } from "./src/compiler";
import fs from "fs";
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let tests_passed = 0;
let num_tests = 0;

async function run_tests(start_stages: number, stages: number) {
  console.clear();

  let file_path = "c_src/exemplar/stage_";

  if (stages == null || isNaN(stages) || stages < 1 || stages > 10 || start_stages > stages) return;


  for (let x = start_stages; x <= stages; x++) {
    for (let y = 0; y < 2; y++) {
      const extra_path = y === 0 ? "valid" : "invalid";
      await iterate_through_files(x, file_path, extra_path);
    }
  }
  console.log(`\n---------------------------`);
  console.log(`Passed ${tests_passed}/${num_tests} tests.`);
  console.log(`-----------------------------`);
}

async function iterate_through_files(stage: number, main_path: string, extra_path: string) {
  const cur_file_path = `${main_path}${stage}/${extra_path}/`;

  if (!fs.existsSync(cur_file_path)) return;

  const files = fs.readdirSync(cur_file_path);

  for (const file of files) {
    if (!file.endsWith(".c")) continue;

    num_tests += 1;
    const fullFilePath = cur_file_path + file;
    const executablePath = cur_file_path + file.replace(".c", "");
    const oracleExecutablePath = cur_file_path + file.replace(".c", "_oracle"); // GCC's binary

    let current_stage = "Compiling to Assembly (GuleisCCJS)";
    try {
      console.log(`\n(Stage ${stage} - ${extra_path}) ${file}.`);

      const compiler = new GuleisCCJS(fullFilePath);
      await compiler.compile();

      if (extra_path === "invalid") {
        console.log(` - ${current_stage} ❌ (Compiled when it should have failed)`);
        continue;
      }

      console.log(` - ${current_stage} ✅`);

      current_stage = "Getting expected baseline (gcc)";
      await execAsync(`gcc ${fullFilePath} -o ${oracleExecutablePath}`);

      let expectedExitCode = 0;
      try {
        await execAsync(`./${oracleExecutablePath}`);
      } catch (runErr: any) {
        expectedExitCode = runErr.code !== undefined ? runErr.code : -1;
      }
      console.log(` - ${current_stage} ✅ (Oracle Exit Code: ${expectedExitCode})`);

      current_stage = "Running file.";
      let actualExitCode = 0;

      try {
        await execAsync(`./${executablePath}`);
      } catch (runErr: any) {
        actualExitCode = runErr.code !== undefined ? runErr.code : -1;
      }

      if (actualExitCode === expectedExitCode) {
        console.log(` - ${current_stage} ✅ (Exit code: ${actualExitCode})`);
        tests_passed += 1;
      } else {
        console.log(` - ${current_stage} ❌ (Expected: ${expectedExitCode}, Got: ${actualExitCode})`);
      }

    } catch (error: any) {
      if (extra_path === "invalid") {
        console.log(` - ${current_stage} ✅ (${error})`);
        tests_passed += 1;
      } else {
        console.log(` - ${current_stage} ❌ (${error.message || error})`);
      }
    } finally {
      const filesToClean = [
        executablePath,
        oracleExecutablePath,
        fullFilePath.replace(".c", ".s")
      ];

      filesToClean.forEach(f => {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      });
    }
  }
}

const start_stages = Number(process.argv[2]);
const end_stages = Number(process.argv[3])

run_tests(start_stages, isNaN(end_stages) ? start_stages : end_stages);