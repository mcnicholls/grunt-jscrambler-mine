/*
 * grunt-jscrambler
 * https://github.com/mcnicholls/grunt-jscrambler.git
 *
 * Copyright (c) 2013 Michael Nicholls
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

    var request = require('request'),
        sys = require('sys'),
        fs = require('fs'),
        path = require('path'),
        crypto = require('crypto'),
        JSZip = require('jszip'),
        mkdirp = require('mkdirp');

  grunt.registerMultiTask('jscrambler', 'Obfuscate Javascript via the jscrambler web API.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({ }),
        done = this.async(),
        file_paths = {},
        src_files = [];

    parseOptions(options);

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
        f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        file_paths[path.basename(filepath)] = f.dest;
        src_files.push(filepath);
      });
    });

    uploadCode( src_files, options, function ( body ) {
        var upResponse = JSON.parse(body),
            i;

        grunt.log.writeln('Project ' + upResponse.id + ' created');
        setTimeout( function () {
            var downloadCallback = function ( body ) {
                    unzipFiles(body, file_paths);
                    deleteProject( upResponse.id, options, function ( body ) {
                        var delResponse = JSON.parse(body);
                        if ( delResponse.deleted ) {
                            grunt.log.writeln('Project ' + delResponse.id + ' was deleted');
                        }
                        else {
                            grunt.log.writeln('Project ' + delResponse.id + ' was not deleted');
                        }
                        done();
                    });
                };
            downloadProject( upResponse.id, options, downloadCallback);
        }, 15000);
    });
  });

  function parseOptions(options) {
    if(options.function_outlining) {
        options.function_outlining = '%DEFAULT%';
    }
    if(options.constant_folding) {
        options.constant_folding = '%DEFAULT%';
    }
    if(options.dead_code) {
        options.dead_code = '%DEFAULT%';
    }
    if(options.dead_code_elimination) {
        options.dead_code_elimination = '%DEFAULT%';
    }
    if(options.dictionary_compression) {
        options.dictionary_compression = '%DEFAULT%';
    }
    if(options.dot_notation_elimination) {
        options.dot_notation_elimination = '%DEFAULT%';
    }
    if(options.function_outlining) {
        options.function_outlining = '%DEFAULT%';
    }
    if(options.function_reorder) {
        options.function_reorder = '%DEFAULT%';
    }
    if(options.literal_duplicates) {
        options.literal_duplicates = '%DEFAULT%';
    }
    if(options.member_enumeration) {
        options.member_enumeration = '%DEFAULT%';
    }
    if(options.rename_all) {
        options.rename_all = '%DEFAULT%';
    }
    if(options.rename_local) {
        options.rename_local = '%DEFAULT%';
    }
    if(options.whitespace) {
        options.whitespace = '%DEFAULT%';
    }
  }


  function uploadCode ( file_paths, options, callback ) {
    var query_params = [],
        form,
        signature_data,
        signature,
        query_string = '',
        prop_names = [],
        timestamp,
        hmac,
        setting,
        r,
        i;

    timestamp = new Date().toISOString();
    query_params['access_key'] = options.keys.access_key;

    // Iterate over all specified file groups.
    r = request.post('https://api.jscrambler.com/v3/code.json', function ( error, response , body) {
        callback(body);
    });

    form = r.form();
    form.append('access_key', options.keys.access_key);
    form.append('timestamp', timestamp);
    file_paths = file_paths.sort();
    for ( i = 0; i < file_paths.length; ++i ) {
        var md5 = crypto.createHash('md5'),
            filepath = file_paths[i],
            basename = 'file_' + i;

        md5.update(fs.readFileSync(filepath));
        query_params[basename] = md5.digest('hex');
        form.append(basename, fs.createReadStream(filepath));
    }
    query_params['timestamp'] = timestamp;

    for( setting in options ) {
        if ( options.hasOwnProperty(setting) && setting !== 'keys') {
            form.append(setting, options[setting]);
            query_params[setting] = options[setting];
        }
    }

    for( setting in query_params ) {
        if ( query_params.hasOwnProperty(setting) ) {
            prop_names.push(setting);
        }
    }
    prop_names.sort();

    query_string = encodeParams(prop_names, query_params);

    signature_data = 'POST;api.jscrambler.com;/code.json;' + query_string;
    hmac = crypto.createHmac('sha256', options.keys.secret_key);
    hmac.update(signature_data);
    signature = hmac.digest('base64');

    form.append('signature', signature);

  }

  function downloadProject( project_id, options, callback ) {

    var query_params = [],
        resource = '/code/' + project_id + '.zip',
        signature_data,
        signature,
        query_string = '',
        prop_names = [],
        timestamp,
        hmac,
        setting,
        r,
        r_opts,
        i;

    timestamp = new Date().toISOString();
    query_params['access_key'] = options.keys.access_key;
    query_params['timestamp'] = timestamp;

    // Iterate over all specified file groups.

    for( setting in query_params ) {
        if ( query_params.hasOwnProperty(setting) ) {
            prop_names.push(setting);
        }
    }
    prop_names.sort();

    query_string = encodeParams(prop_names, query_params);

    signature_data = 'GET;api.jscrambler.com;' + resource + ';' + query_string;
    hmac = crypto.createHmac('sha256', options.keys.secret_key);
    hmac.update(signature_data);
    signature = hmac.digest('base64');

    query_params['signature'] = signature;

    r_opts = {
        url: 'https://api.jscrambler.com/v3' + resource,
        qs: query_params,
        encoding: null
    };

    r = request.get(r_opts, function ( error, response , body) {
        callback(body);
    });
  }
  function downloadSource( project_id, source, options, callback ) {

    var query_params = [],
        resource = '/code/' + project_id + '/' + source.id + '.' + source.extension,
        signature_data,
        signature,
        query_string = '',
        prop_names = [],
        timestamp,
        hmac,
        setting,
        r,
        r_opts,
        i;

    timestamp = new Date().toISOString();
    query_params['access_key'] = options.keys.access_key;
    query_params['timestamp'] = timestamp;

    // Iterate over all specified file groups.

    for( setting in query_params ) {
        if ( query_params.hasOwnProperty(setting) ) {
            prop_names.push(setting);
        }
    }
    prop_names.sort();

    query_string = encodeParams(prop_names, query_params);

    signature_data = 'GET;api.jscrambler.com;' + resource + ';' + query_string;
    hmac = crypto.createHmac('sha256', options.keys.secret_key);
    hmac.update(signature_data);
    signature = hmac.digest('base64');

    query_params['signature'] = signature;

    r_opts = {
        url: 'https://api.jscrambler.com/v3' + resource,
        qs: query_params
    };

    r = request.get(r_opts, function ( error, response , body) {
        callback(body);
    });
  }

  function deleteProject( project_id, options, callback ) {

    var query_params = [],
        resource,
        signature_data,
        signature,
        query_string = '',
        prop_names = [],
        timestamp,
        hmac,
        setting,
        r,
        r_opts,
        i;

    resource = '/code/' + project_id + '.zip';

    timestamp = new Date().toISOString();
    query_params['access_key'] = options.keys.access_key;
    query_params['timestamp'] = timestamp;

    // Iterate over all specified file groups.

    for( setting in query_params ) {
        if ( query_params.hasOwnProperty(setting) ) {
            prop_names.push(setting);
        }
    }
    prop_names.sort();

    query_string = encodeParams(prop_names, query_params);

    signature_data = 'DELETE;api.jscrambler.com;' + resource + ';' + query_string;
    hmac = crypto.createHmac('sha256', options.keys.secret_key);
    hmac.update(signature_data);
    signature = hmac.digest('base64');

    query_params['signature'] = signature;

    r_opts = {
        url: 'https://api.jscrambler.com/v3' + resource,
        qs: query_params
    };

    r = request.del(r_opts, function ( error, response , body) {
        callback(body);
    });
  }

  function encodeParams ( keyNames, params ) {
    var i,
        encoded = '';

    for ( i = 0; i < keyNames.length; ++i ) {
        if ( i !== 0 ) {
            encoded += '&';
        }
        encoded += encodeURIComponent(keyNames[i]) + '=' + encodeURIComponent(params[keyNames[i]]);
    }
    return encoded;
  }

  function unzipFiles ( zipFile, filePaths ) {
    var zip = new JSZip(zipFile),
        file;

    for ( file in zip.files ) {
        var dest = filePaths[file],
            buffer = zip.file(file).asNodeBuffer();

        mkdirp.sync(path.dirname(dest));
        fs.createWriteStream(dest).write(buffer);
    }

  }
};
