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

    var JSCRAMBLER_PROTO = 'https://',
        JSCRAMBLER_HOST = 'api.jscrambler.com',
        JSCRAMBLER_VERSION = 'v3';

    var options,
        done,
        file_paths = {},
        src_files = [];

  grunt.registerMultiTask('jscrambler', 'Obfuscate Javascript via the jscrambler web API.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    options = this.options({
        deleteProject: false,
        pollingInterval: 1000
    });
    done = this.async();

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

    uploadCode(src_files, options, uploadCallback);
  });

  function uploadCallback( body ) {
    var upResponse = JSON.parse(body),
        i;

    grunt.log.writeln('Project ' + upResponse.id + ' created');
    pollProject( upResponse.id, options.pollingInterval, function () {
        downloadProject( upResponse.id, options, function(body) {
            downloadCallback(upResponse.id, body);
        });
    }, function () {
        grunt.log.writeln('Project ' + upResponse.id + ' errored with the following message: ');
    });
  }

  function downloadCallback ( id, body ) {
    unzipFiles(body, file_paths);
    if(options.deleteProject) {
        deleteProject( id, options, deleteCallback );
    }
    else {
        done();
    }
  }

  function deleteCallback( body ) {
    var delResponse = JSON.parse(body);
    if ( delResponse.deleted ) {
        grunt.log.writeln('Project ' + delResponse.id + ' was deleted');
    }
    else {
        grunt.log.writeln('Project ' + delResponse.id + ' was not deleted');
    }
    done();
  }

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

  function pollProject( project_id, interval, success, error) {
    jscrambler_request('/code.json', 'GET', options.keys, null,
        function(response) {
            pollSuccess(response, project_id, interval, success, error);
        }, onError
    );
  }

  function pollSuccess(response, project_id, interval, success, error) {
    var queue = JSON.parse(response),
        i,
        length;

    function poll() {
        pollProject(project_id, interval, success, error);
    }

    if(queue) {
        length = queue.length;
        for(i = 0; i < length; ++i) {
            if(queue[i].id === project_id) {
                if(!queue[i].error_message || queue[i].error_message === 'OK') {
                    if(queue[i].finished_at) {
                        success();
                    }
                    else {
                        setTimeout(poll, interval);
                    }
                }
                else {
                    error(queue.error_message);
                }
                return;
            }
        }
    }
  }

  function onError(error) {
    grunt.log.writeln(error);
    done();
  }

  function uploadCode ( file_paths, options, callback ) {
    jscrambler_request('/code.json', 'POST', options.keys, file_paths, callback, onError);
  }

  function downloadProject( project_id, options, callback ) {
    jscrambler_request('/code/' + project_id + '.zip', 'GET', options.keys, null, callback, onError);
  }

  function deleteProject( project_id, options, callback ) {
    jscrambler_request('/code/' + project_id + '.zip', 'DELETE', options.keys, null, callback, onError);
  }

  function jscrambler_request(resource, method, keys, files, onSuccess, onError) {
    var query_params = [],
        form = null,
        signature_data,
        signature,
        query_string = '',
        prop_names = [],
        timestamp,
        hmac,
        setting,
        url = JSCRAMBLER_PROTO + JSCRAMBLER_HOST + '/' + JSCRAMBLER_VERSION + resource,
        r,
        i,
        length,
        request_opts = {
            url: url,
            method: method,
            encoding: null
        };

    function cb( error, response , body) {
        if(error) {
            onError(error);
        }
        else {
            onSuccess(body);
        }
    }

    timestamp = new Date().toISOString();
    query_params['access_key'] = keys.access_key;
    query_params['timestamp'] = timestamp;

    if(method === 'POST') {
        r = request(request_opts, cb);
        form = r.form();
        form.append('access_key', keys.access_key);
        form.append('timestamp', timestamp);
        if(files) {
            files = files.sort();
            length = files.length;
            for ( i = 0; i < length; ++i ) {
                var md5 = crypto.createHash('md5'),
                    filepath = files[i],
                    basename = 'file_' + i;

                md5.update(fs.readFileSync(filepath));
                query_params[basename] = md5.digest('hex');
                form.append(basename, fs.createReadStream(filepath));
            }
        }
    }

    for( setting in options ) {
        if ( options.hasOwnProperty(setting) &&
            setting !== 'keys' &&
            setting !== 'deleteProject' &&
            setting !== 'pollingInterval') {
            if(form) {
                form.append(setting, options[setting]);
            }
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

    signature_data = method + ';' + JSCRAMBLER_HOST + ';' + resource + ';' + query_string;
    hmac = crypto.createHmac('sha256', keys.secret_key);
    hmac.update(signature_data);
    signature = hmac.digest('base64');

    if(form) {
        form.append('signature', signature);
    }

    if(!r) {
        query_params['signature'] = signature;
        request_opts.qs = query_params;
        r = request(request_opts, cb);
    }
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
