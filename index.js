var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;
var typeScriptTemplateProto = require('typescript-template-proto');
var fs = require('fs');

// Consts
const PLUGIN_NAME = 'gulp-ts-template';

var template = fs.readFileSync(__dirname+'/template.tmpl', {encoding: 'utf8'});

// Plugin level function(dealing with files)
function gulpTypeScriptTemplate(config) {
    config = config || {};
    var keyPrefix = config.keyPrefix || '__ts_template_';
    var templateGetKey = config.templateGetKey || function(path){
        return path.split('/').pop().split('.').shift();//fileName
    };

    function createContents(path){
        var compileResult = typeScriptTemplateProto.compile(path);
        var _templateGetKey = templateGetKey(path);
        var data = {
            reference: compileResult.reference,
            contextType: compileResult.contextType,
            templateGetKey: _templateGetKey,
            templatePrefixedKey: keyPrefix + _templateGetKey,
            compiled: compileResult.compiled,
            file: true//TODO: why file is need?
        };
        return new Buffer(gutil.template(template, data));
    }

    // Creating a stream through which each file will pass
    return through.obj(function(file, enc, callback) {
        if (file.isNull()) {
            this.push(file); // Do nothing if no contents
            return callback();
        }

        if (file.isBuffer()) {
            file.contents = createContents(file.path);
            this.push(file);
            return callback();
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported!'));
            return callback();
        }
    });
};

// Exporting the plugin main function
module.exports = gulpTypeScriptTemplate;