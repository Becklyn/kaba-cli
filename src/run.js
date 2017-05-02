const chalk = require("chalk");
const prettyTime = require("pretty-time");
const timers = {};


/**
 * @param {KabaEnvironment} env
 */
module.exports = function (env)
{
    console.log(``);
    console.log(`  ${chalk.black(chalk.bgYellow("  ~~~~~~  "))}`);
    console.log(`  ${chalk.black(chalk.bgYellow("   kaba   "))}`);
    console.log(`  ${chalk.black(chalk.bgYellow("  ~~~~~~  "))}`);
    console.log(``);
    console.log(``);

    /** @type {Kaba} kaba */
    let kaba;

    try
    {
        // get kaba instance
        kaba = require(env.modulePath);

        kaba.on("start", (taskDetails) => timers[taskDetails.id] = process.hrtime());
        kaba.on("end", (taskDetails) =>
        {
            if (timers[taskDetails.id])
            {
                let diff = process.hrtime(timers[taskDetails.id]);
                let taskName = (taskDetails.task === kaba.DEFAULT_TASK_NAME)
                    ? chalk.yellow.bold("Default task")
                    : `Task ${chalk.yellow(taskDetails.task)}`;

                console.log(`${taskName} finished after ${chalk.blue(prettyTime(diff))}`);
                timers[taskDetails.id] = null;
            }
        });
    }
    catch (e)
    {
        console.log(
            chalk.red(`Local kaba module not found.`)
        );
        process.exit(1);
    }

    try
    {
        // run kabafile
        require(env.runnerPath);
    }
    catch (e)
    {
        let message = e instanceof Error ? e.message : e;

        if (0 === message.indexOf("Cannot find module"))
        {
            message = `No kabafile found.`;
        }
        else
        {
            message = `The loaded kaba file has thrown an error: ${message}`;
        }

        printUsage(kaba, message);

        // rethrow error, if verbose mode is set
        if (env.verbose)
        {
            throw e;
        }

        return;
    }

    // get selected task name
    let selectedTaskName;
    switch (env.arguments.length)
    {
        // if no task name is given, use the default task name
        case 0:
            selectedTaskName = kaba.DEFAULT_TASK_NAME;
            break;

        case 1:
            selectedTaskName = env.arguments[0];
            break;

        // if more than one task is given: abort
        default:
            printUsage(kaba, `Please select a single task.`);
            return;
    }

    let selectedTask = kaba.task(selectedTaskName);

    if (!selectedTask)
    {
        const message = kaba.DEFAULT_TASK_NAME !== selectedTaskName
            ? `The task ${chalk.yellow(selectedTaskName)} is not registered.`
            : `No default task registered.`;

        printUsage(kaba, message);
    }
    else
    {
        try
        {
            var noop = () => {};
            selectedTask(noop, false);
        }
        catch (e)
        {
            let message = e instanceof Error ? e.message : e;
            console.log(chalk.red(`The task has thrown an error: ${message}`));

            if (env.verbose)
            {
                throw e;
            }
        }
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
    const tasks = kaba ? kaba.listTasks() : [];

    if (tasks.length)
    {
        console.log(`Registered tasks:`);

        tasks.forEach(
            function (taskName)
            {
                let formattedTaskName = (kaba.DEFAULT_TASK_NAME === taskName)
                    ? `${chalk.yellow.bold("default task")}  (run without parameter)`
                    : chalk.yellow(taskName);

                console.log(`    - ${formattedTaskName}`);
            }
        );
    }
    else
    {
        console.log(`No tasks defined.`);
    }

    console.log(``);

    if (message)
    {
        console.log(chalk.red(message));
        console.log(``);
    }

    console.log(`Please run a task with: ${chalk.cyan("kaba task")}`);
}
