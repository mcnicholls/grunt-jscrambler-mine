/*
 * grunt-jscrambler
 * https://github.com/Mike/grunt-jscrambler
 *
 * Copyright (c) 2013 Michael Nicholls
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    jscrambler: {
      default_options: {
        options: {
          keys: grunt.file.readJSON('jscrambler_key.json'),
          asserts_elimination: 'loadTasks',
          constant_folding: true,
          dead_code: true,
          dead_code_elimination: true,
          debugging_code_elimination: 'loadNpmTasks',
          dictionary_compression: true,
          domain_lock: 'github.com',
          dot_notation_elimination: true,
          exceptions_list: 'module',
          expiration_date: '2099/12/18',
          function_outlining: true,
          function_reorder: true,
          ignore_files: 'scripts/jquery.min.js',
          literal_hooking: '1;2;.3',
          literal_duplicates: true,
          member_enumeration: true,
          mode: 'starter',
          name_prefix: 'abc',
          // rename_all: true,
          rename_local: true,
          string_splitting: '0.2',
          whitespace: true,
        },
        files: [
          {
            expand: true,
            src: ['Gruntfile.js'],
            dest: 'tmp/'
          }
        ],
      },
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'jscrambler', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
