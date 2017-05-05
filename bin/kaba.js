#!/usr/bin/env node

/**
 * @typedef {{
 *  debug: boolean,
 *  watch: boolean,
 *  lint: boolean,
 *  verbose: boolean,
 *  compile: boolean,
 * }} KabaAppEnvironment
 *
 * @typedef {{
 *  runnerPath: string,
 *  modulePath: string,
 *  verbose: boolean,
 *  app: KabaAppEnvironment,
 *  arguments: string[],
 * }} KabaEnvironment
 */
const run = require("../src/run");
const environment = require("../src/environment");

run(environment);
