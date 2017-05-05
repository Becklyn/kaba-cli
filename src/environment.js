const minimist = require('minimist');


// prepare CLI arguments
const argv = minimist(process.argv.slice(2), {
    boolean: ["dev", "debug", "d", "v", "lint"]
});

const cwd = process.cwd();

module.exports = {
    runnerPath: `${cwd}/kabafile.js`,
    modulePath: `${cwd}/node_modules/kaba`,
    app: getAppEnvironment(argv),
    verbose: argv.v,
    arguments: argv._,
};



/**
 *
 * @param {{dev: boolean, debug: boolean, d: boolean, v: boolean, lint: boolean}} argv
 *
 * @return {KabaAppEnvironment}
 */
function getAppEnvironment (argv)
{
    const debug = argv.dev || argv.debug || argv.d;

    return {
        debug: debug,
        lint: argv.lint || debug,
        watch: debug,
        verbose: argv.v,
        mode: argv.lint ? "lint" : "compile",
    };
}
