"use strict";

const chalk = require("chalk");
const tildify = require("tildify");
const prettyTime = require("pretty-time");


var timers = {};


/**
 *
 * @param {LiftoffEnvironment} env
 * @param argv
 */
module.exports = function (env, argv)
{
    console.log("");
    console.log("  " + chalk.black(chalk.bgYellow("  ~~~~~~  ")));
    console.log("  " + chalk.black(chalk.bgYellow("   kaba   ")));
    console.log("  " + chalk.black(chalk.bgYellow("  ~~~~~~  ")));
    console.log("");

    // check for local kaba installation
    if (!env.modulePath)
    {
        console.log(
            chalk.red("Local kaba not found in "),
            tildify(env.cwd)
        );
        process.exit(1);
    }

    // if no config file, return with an error
    if (!env.configPath)
    {
        console.log(chalk.red("No kabafile found."));
        process.exit(1);
    }

    console.log(chalk.blue("Using kabafile: ") + tildify(env.configPath));
    console.log("");

    // set current dir to the dir of the kabafile
    process.chdir(env.cwd);

    // get kaba instance
    let kaba = require(env.modulePath);

    kaba.on("start", (taskDetails) => timers[taskDetails.id] = process.hrtime());
    kaba.on("end", (taskDetails) => {
        if (timers[taskDetails.id])
        {
            let diff = process.hrtime(timers[taskDetails.id]);
            console.log("Task " + chalk.yellow(taskDetails.task) + " finished after " + chalk.blue(prettyTime(diff)));
            delete timers[taskDetails.id];
        }
    });

    // run kabafile
    require(env.configPath);

    if (!argv._.length)
    {
        printUsage(kaba, "No task selected");
    }
    else if (1 === argv._.length)
    {
        var selectedTask = kaba.task(argv._[0]);

        if (!selectedTask)
        {
            printUsage(kaba, "The task " + chalk.yellow(argv._[0]) + " is not registered.");
        }
        else
        {
            let debug = !!argv.debug || !!argv.dev;
            var noop = function () {};
            selectedTask(noop, debug);
        }
    }
    else
    {
        printUsage(kaba, "Please select a single task.");
    }
};


/**
 * Prints the usage information with an additional, optional error message
 *
 * @param {Kaba} kaba
 * @param {string|null} message
 */
function printUsage (kaba, message = null)
{
    console.log("Registered tasks:");

    kaba.listTasks().forEach(
        function (taskName)
        {
            console.log("    - " + chalk.yellow(taskName));
        }
    );

    console.log("");
    if (message)
    {
        console.log(chalk.red(message));
    }
    console.log("Please run a task with: " + chalk.cyan("kaba task"));
}
