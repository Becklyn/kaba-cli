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

Tasks may support a debug mode, that doesn't minify files, includes sourcemaps or starts watchers. Just pass `--dev` or `--debug` to enable debug mode:

```bash
$ kaba taskname --debug
```


### Config Discovery

If you run kaba in a directory without `kabafile.js`, the runner automatically traverses through the parent directories looking for a kabafile. If it finds one it will be used and executed. See the docs of [Liftoff] for details.


[kaba]: https://www.npmjs.com/package/kaba
[Liftoff]: https://www.npmjs.com/package/liftoff
