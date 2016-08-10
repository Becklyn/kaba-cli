#!/usr/bin/env node

/**
 *
 * @typedef {{
 *  cwd: string,
 *  require: Array,
 *  configNameSearch: string[],
 *  configPath: string,
 *  configBase: string,
 *  modulePath: string,
 *  modulePackage: *,
 * }} LiftoffEnvironment
 */
const Liftoff = require("liftoff");
const run = require("../src/run");
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2), {
    boolean: ["dev", "debug", "d", "v"]
});
const Kaba = new Liftoff({
    name: "kaba",
    extensions: {
        ".js": null
    },
    v8flags: ['--harmony']
});


Kaba.launch({
    cwd: argv.cwd,
    configPath: argv.kabafile,
    require: argv.require,
    completion: argv.completion
}, (env) => run(env, argv));
