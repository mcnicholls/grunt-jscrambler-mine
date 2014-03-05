# grunt-jscrambler v0.2.0

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

#### Task Options

##### options.keys.access_key
Type: `String`

A string value that is used to provide the jscrambler api with the access key.

##### options.keys.secret_key
Type: `String`

A string value that is used to sign requests to the jscrambler api.

##### options.deleteProject
Type: `Boolean`
Default value: `false`

Used to indicate whether the project should be deleted from the 'My Projects' list on jscrambler.com

##### options.pollingInterval
Type: `Number`
Default value: `1000`

Used as the polling interval when checking jscrambler to see if the project has finished being obfuscated

#### Jscrambler Options

The following options are passed to the jscrambler API. More information about them can be found at https://jscrambler.com/en/help/webapi/documentation

##### options.asserts_elimination
Type: `String`

`name1;name2;...` - assert function names

Remove function definitions and function calls with a given name.

##### options.constant_folding
Type: `Boolean`

Simplifies constant expressions at compile-time to make your code faster at run-time.

##### options.dead_code
Type: `Boolean`

Randomly injects dead code into the source code.

##### options.dead_code_elimination
Type: `Boolean`

Removes dead code and void code from your JavaScript.

##### options.debugging_code_elimination
Type: `String`

`name1;name2;...` - debugging code names

Removes statements and public variable declarations used to control the output of debugging messages that help you debug your code.

##### options.dictionary_compression
Type: `Boolean`

Dictionary compression to shrink even more your source code.

##### options.domain_lock
Type: `String`

`domain1;domain2;...` - your domains

Locks your project to a list of domains you specify.

##### options.dot_notation_elimination
Type: `Boolean`

Transforms dot notation to subscript notation.

##### options.exceptions_list
Type: `String`

`name;name1;name2;...` - list of exceptions that will never be replaced or used to create new declarations

There are some names that should never be replaced or reused to create new declarations e.g. document, toUpperCase. Public declarations existing in more than one source file should not be replaced if you submit only a part of the project where they appear. Therefore a list of irreplaceable names and the logic to make distinction between public and local names already exists on JScrambler to avoid touching those names. Use this parameter to add your own exceptions.

##### options.expiration_date:
Type: `String`

`date` - date format YYYY/MM/DD

Sets your JavaScript to expire after a date of your choosing.

##### options.function_outlining
Type: `Boolean`

Turns statements into new function declarations.

##### options.function_reorder
Type: `Boolean`

Randomly reorders your source code's function declarations.

##### options.ignore_files
Type: `String`

`filename;filename1` - List of files (relative paths) to be ignored

Define a list of files (relative paths) that JScrambler must ignore.

##### options.literal_hooking
Type: `String`

`min;max[;percentage]` - min and max predicates in ternary operator and percentage chance of replacement

Replaces literals by a randomly sized chain of ternary operators. You may configure the minimum and maximum number of predicates per literal, as the occurrence probability of the transformation. This allows you to control how big the obfuscated JavaScript grows and the potency of the transformation.

##### options.literal_duplicates
Type: `Boolean`

Replaces literal duplicates by a symbol.

##### options.member_enumeration
Type: `Boolean`

Replaces Browser and HTML DOM objects by a member enumeration.

##### options.mode
Type: `String`

`starter` - Standard protection and optimization behavior. Enough for most JavaScript applications
`mobile` - Transformations are applied having into account the limitations and needs of mobile devices
`html5` - Protects your HTML5 and Web Gaming applications by targeting the new HTML5 features

##### options.name_prefix
Type: `String`

Set a prefix to be appended to the new names generated by JScrambler.

##### options.rename_local
Type: `Boolean`

Renames local names only. The best way to replace names without worrying about name dependencies.

##### options.string_splitting:
Type: `String`

`occurrences[;concatenation]`

occurrences - Percentage of occurrences. Accepted values between 0.01 and 1.
concatenation - Percentage of concatenation occurrences. Accepted values between 0 and 1 (0 means chunks of a single character and 1 the whole string).

##### options.whitespace
Type: `Boolean`

Shrink the size of your JavaScript removing unnecessary whitespaces and newlines from the source code.

### Usage Example

In this example, some simple options are used to obfuscate src/foo.js and src/bar.js and output them as dest/output1.js and dest/output2.js respectively.

```js
grunt.initConfig({
  jscrambler: {
    options: {
      keys: grunt.file.readJSON('jscrambler_key.json'),
      mode: 'starter',
      whitespace: true,
      function_reorder: true
    },
    files: {
      'dest/output1.js': ['src/foo.js'],
      'dest/output2.js': ['src/bar.js'],
    },
  },
})
```
The access_key and secret_key options are loaded from a separate json file that contains:

```json
{
    "access_key": "PUTYOURACCESSKEYHERE",
    "secret_key": "PUTYOURSECRETKEYHERE"
}
```

## Release History

 * 2014-01-08	v0.1.0 Work in progress, just about works, but not officially released.
 * 2014-03-05 v0.2.0 Options correctly exposed, now polls server for result.
