#!/usr/bin/env node

/**
 * @typedef {{
 *  debug: boolean,
 *  watch: boolean,
 *  lint: boolean,
 *  verbose: boolean,
 *  mode: string,
 *  cliVersion: ?string,
 * }} KabaAppEnvironment
 *
 * @typedef {{
 *  runnerPath: string,
 *  modulePath: string,
 *  verbose: boolean,
 *  app: KabaAppEnvironment,
 *  arguments: string[],
 *  init: ?string,
 *  help: boolean,
 *  version: boolean,
 * }} KabaEnvironment
 */
const CLIRunner = require("../src/CLIRunner");
const environment = require("../src/environment");

const runner = new CLIRunner(environment);
runner.run();
