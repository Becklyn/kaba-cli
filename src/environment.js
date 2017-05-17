const minimist = require('minimist');


// prepare CLI arguments
const argv = minimist(process.argv.slice(2), {
    boolean: ["dev", "debug", "d", "v", "validate", "help", "version"],
    string: ["init"],
});

const cwd = process.cwd();

module.exports = {
    runnerPath: `${cwd}/kabafile.js`,
    modulePath: `${cwd}/node_modules/kaba`,
    app: getAppEnvironment(argv),
    verbose: argv.v,
    arguments: argv._,
    init: argv.init || null,
    version: argv.version,
    help: argv.help,
};



/**
 *
 * @param {{dev: boolean, debug: boolean, d: boolean, v: boolean, validate: boolean}} argv
 *
 * @return {KabaAppEnvironment}
 */
function getAppEnvironment (argv)
{
    const env = {
        debug: false,
        lint: false,
        watch: false,
        verbose: false,
        mode: "compile",
        cliVersion: null,
    };

    if (argv.d || argv.dev)
    {
        env.debug = true;
        env.lint = true;
        env.watch = true;
    }

    if (argv.debug)
    {
        env.debug = true;
    }

    if (argv.v)
    {
        env.verbose = true;
    }

    if (argv.validate)
    {
        env.lint = true;
        env.mode = "validate";
    }


    if (argv.debug)
    {
        env.debug = true;
    }

    return env;
}
