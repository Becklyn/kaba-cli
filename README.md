kaba-cli
========

The CLI runner for [kaba].


Installation
------------

Install it globally for all projects:

```bash
$ npm install -g kaba-cli
```


Usage
-----

Go to the directory containing the local kaba module and just run kaba:

```bash
$ kaba taskname
```

where `taskname` is the task name of your choice.


### Debug Mode

Tasks may support a debug mode, that doesn't minify files, includes sourcemaps or starts watchers. Just pass `--dev` or `--debug` or `-d` to enable debug mode:

```bash
$ kaba taskname --debug
```


### Config Discovery

If you run kaba in a directory without `kabafile.js`, the runner automatically traverses through the parent directories looking for a kabafile. If it finds one it will be used and executed. See the docs of [Liftoff] for details.


### Debugging errors in your kabafile or your task

If the kabafile or one of the tasks throw an error, you can rethrow the error in kaba-cli (to get a proper call stack) by passing the verbose flag `-v`.


[kaba]: https://www.npmjs.com/package/kaba
[Liftoff]: https://www.npmjs.com/package/liftoff
