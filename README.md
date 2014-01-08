# grunt-jscrambler v0.1.0

> Obfuscate javascript files using jscrambler

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-jscrambler --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-jscrambler');
```

## The "jscrambler" task

### Overview
In your project's Gruntfile, add a section named `jscrambler` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  jscrambler: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

### Options

#### options.access_key
Type: `String`
Default value: `''`

A string value that is used to provide the jscrambler api with the access key.

#### options.secret_key
Type: `String`
Default value: `''`

A string value that is used to sign requests to the jscrambler api.

### Usage Examples

#### Default Options
In this example, the default options are used to do obfuscate src/foo.js and output it as dest/output.js.

```js
grunt.initConfig({
  jscrambler: {
    options: grunt.file.readJSON('jscrambler_key.json'),
    files: {
      'dest/output.js': ['src/foo.js'],
    },
  },
})
```
The access_key and secret_key options are loaded from a seperate json file that contains:

```json
{
    "access_key": "PUTYOURACCESSKEYHERE",
    "secret_key": "PUTYOURSECRETKEYHERE"
}
```

## Release History

 * 2014-01-08	v0.1.0	Work in progress, just about works, but not officially released.
