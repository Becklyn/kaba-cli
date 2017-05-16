const chalk = require("chalk");
const prettyTime = require("pretty-time");


/**
 * The main app CLI runner
 * @type {CLIRunner}
 */
module.exports = class CLIRunner
{
    /**
     *
     * @param {KabaEnvironment} env
     */
    constructor (env)
    {
        /**
         * @private
         * @type {KabaEnvironment}
         */
        this.env = env;

        /**
         * @private
         * @type {boolean}
         */
        this.hasValidKabafile = false;

        /**
         * @private
         * @type {string[]}
         */
        this.errors = [];

        /**
         * @private
         * @type {string}
         */
        this.DEFAULT_TASK_NAME = "";

        /**
         * @private
         * @type {string[]}
         */
        this.registeredTasks = [];

        /**
         * @private
         * @type {string[]}
         */
        this.registeredInitFiles = [];

        /**
         * @private
         * @type {?Kaba}
         */
        this.kaba = this.loadKaba();


        // initialize
        this.loadKabafile();
    }


    /**
     * Loads the kaba instance.
     *
     * @private
     * @return {?Kaba}
     */
    loadKaba ()
    {
        try {
            const kaba = require(this.env.modulePath);

            // load config from local kaba
            this.DEFAULT_TASK_NAME = kaba.DEFAULT_TASK_NAME;

            return kaba;
        }
        catch (e)
        {
            let message = e.message;

            if (0 === message.indexOf("Cannot find module"))
            {
                message = `Local kaba module not found.`;
            }

            this.errors.push(message);

            // rethrow if in verbose mode
            if (this.env.verbose)
            {
                throw e;
            }

            return null;
        }
    }


    /**
     * Loads the kaba file
     *
     * @private
     */
    loadKabafile ()
    {
        try
        {
            // run kabafile
            require(this.env.runnerPath);

            // load config from local kabafile
            this.hasValidKabafile = true;
            this.registeredTasks = this.kaba.listTasks().sort();
            this.registeredInitFiles = typeof this.kaba.getAllInitIdentifiers === "function"
                ? this.kaba.getAllInitIdentifiers().sort()
                : [];

        }
        catch (e)
        {
            this.hasValidKabafile = false;
            const message = e instanceof Error ? e.message : e;

            if (0 === message.indexOf(`Cannot find module '${this.env.runnerPath}'`))
            {
                this.errors.push(`No kabafile found.`);
            }
            else
            {
                this.errors.push(`The loaded kaba file has thrown an error: ${message}`);
            }

            // rethrow error, if verbose mode is set
            if (this.env.verbose)
            {
                throw e;
            }
        }
    }


    /**
     * Runs the CLI runner
     */
    run ()
    {
        if (this.env.version)
        {
            this.printVersion();
            return;
        }

        this.printHeader();

        if (this.env.help)
        {
            this.printUsage();
            return;
        }

        if (0 === this.errors.length)
        {
            // if the app should initialize a project
            if (null !== this.env.init && null !== this.kaba && typeof this.kaba.initProject !== "undefined")
            {
                this.initKabaProject(this.env.init);
            }
            else if (this.kaba !== null && this.hasValidKabafile)
            {
                this.registerTaskTimingEventListeners();
                this.runTask();
            }
        }

        if (0 !== this.errors.length)
        {
            this.printUsage();
        }
    }


    /**
     * Prints the kaba header
     *
     * @private
     */
    printHeader ()
    {
        console.log(``);
        console.log(`${chalk.black(chalk.bgYellow("  ~~~~~~~~~  "))}`);
        console.log(`${chalk.black(chalk.bgYellow("   🍫️  kaba   "))}`);
        console.log(`${chalk.black(chalk.bgYellow("  ~~~~~~~~~  "))}`);
        console.log(``);

        const kabaCliVersion = require(`${__dirname}/../package.json`).version;

        let message = `CLI ${kabaCliVersion}`;

        if (null !== this.kaba)
        {
            message = `${this.kaba.version} / ${message}`;
        }

        console.log(`@ ${message}`);
        console.log(``);
    }


    /**
     * Registers the timing event listeners
     *
     * @private
     */
    registerTaskTimingEventListeners ()
    {
        if (null === this.kaba)
        {
            return;
        }

        const timers = {};

        this.kaba.on(
            "start",
            /** @type {{id: number, task: string}} taskDetails */
            (taskDetails) => {
                timers[taskDetails.id] = process.hrtime();
                const taskName = (taskDetails.task === this.DEFAULT_TASK_NAME)
                    ? chalk.yellow.bold("Default task")
                    : `Task ${chalk.yellow(taskDetails.task)}`;

                console.log(`${chalk.bgYellow.black(" kaba ")} ${taskName} started`);
            }
        );

        this.kaba.on(
            "end",
            /** @type {{id: number, task: string}} taskDetails */
            (taskDetails) =>
            {
                if (timers[taskDetails.id])
                {
                    const diff = process.hrtime(timers[taskDetails.id]);
                    const taskName = (taskDetails.task === this.DEFAULT_TASK_NAME)
                        ? chalk.green.bold("Default task")
                        : `Task ${chalk.green(taskDetails.task)}`;

                    console.log(`${chalk.bgGreen.black(" kaba ")} ${taskName} finished after ${chalk.blue(prettyTime(diff))}`);
                    timers[taskDetails.id] = null;
                }
            }
        );
    }


    /**
     * Handles the initialization of a kaba project
     *
     * @private
     * @param {string} initFile
     */
    initKabaProject (initFile)
    {
        const initializationResult = this.kaba.initProject(initFile);

        if (true === initializationResult)
        {
            console.log(chalk.green(`The kabafile was created.`));
        }
        else
        {
            this.errors.push(`Error while initializing project: ${initializationResult}`);
        }
    }


    /**
     * Runs the selected task
     *
     * @private
     */
    runTask ()
    {
        let selectedTaskName;
        switch (this.env.arguments.length)
        {
            // if no task name is given, use the default task name
            case 0:
                selectedTaskName = this.DEFAULT_TASK_NAME;
                break;

            case 1:
                selectedTaskName = this.env.arguments[0];
                break;

            // if more than one task is given: abort
            default:
                this.errors.push(`Please select a single task.`);
                return;
        }


        const selectedTask = this.kaba.get(selectedTaskName);

        if (selectedTask)
        {
            try
            {
                // no specific version check yet, as just the check for the property is check enough
                if (typeof this.kaba.version !== "undefined")
                {
                    // new version
                    selectedTask(() => {}, this.env.app);
                }
                else
                {
                    // legacy version, doesn't yet have a version property
                    // @deprecated
                    selectedTask(() => {}, this.env.app.debug);
                }

            }
            catch (e)
            {
                const message = e instanceof Error ? e.message : e;
                this.errors.push(`The task has thrown an error: ${message}`);

                if (this.env.verbose)
                {
                    throw e;
                }
            }
        }
        else
        {
            const message = this.DEFAULT_TASK_NAME !== selectedTaskName
                ? `The task ${chalk.yellow(selectedTaskName)} is not registered.`
                : `No default task registered.`;

            this.errors.push(message);
        }
    }


    /**
     * Prints the version info
     *
     * @private
     */
    printVersion ()
    {
        const kabaCliVersion = require(`${__dirname}/../package.json`).version;
        const kabaVersion = null !== this.kaba
            ? this.kaba.version || "unknown"
            : chalk.red("no local kaba found");
        console.log(`${chalk.yellow(`kaba-cli`)} ${kabaCliVersion}`);
        console.log(`${chalk.yellow(`kaba`)}     ${kabaVersion}`);
    }


    /**
     * Prints the usage with the global error messages
     *
     * @private
     */
    printUsage ()
    {
        // Print errors
        if (0 !== this.errors.length)
        {
            this.errors.forEach(
                (error) => console.log(`❗️  ${chalk.red(error)}`)
            );
            console.log("");
            console.log("");
        }

        // Print usage
        console.log(chalk.yellow(`Usage`));
        console.log(chalk.yellow(`=====`));
        console.log("");

        console.log(chalk.yellow("Run a task"));
        console.log(chalk.yellow("----------"));
        console.log("");

        console.log(`$ ${chalk.blue("kaba")} ${chalk.underline("task")}`);
        console.log("");

        if (0 !== this.registeredTasks.length)
        {
            console.log(`The following tasks are registered:`);
            this.registeredTasks.forEach((task) => {
                const taskName = (this.DEFAULT_TASK_NAME === task)
                    ? `${chalk.yellow.italic("default task")}  (run without parameter)`
                    : chalk.yellow(task);

                console.log(`  • ${taskName}`);
            });
        }

        console.log(``);
        console.log(``);

        console.log(chalk.yellow("Initialize a local kaba project"));
        console.log(chalk.yellow("-------------------------------"));
        console.log("");

        console.log(`$ ${chalk.blue("kaba")} --init=${chalk.underline("file")}`);
        console.log("");

        if (0 !== this.registeredInitFiles.length)
        {
            console.log(`The following files are available:`);
            this.registeredInitFiles.forEach(
                (file) => console.log(`  • ${chalk.yellow(file)}`)
            );
        }

        console.log("");
    }
};
