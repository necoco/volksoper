/*global module:false*/


module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-jasmine-runner');

    // Project configuration.
    grunt.initConfig({
        meta: {
            version: '0.0.1',
            sourcemap: '//@ sourceMappingURL=./volksoper-canvas.js.map',
            banner: '/*! Volksoper - v<%= meta.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '* https://github.com/necoco/volksoper\n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
                'tshinsay; Licensed MIT */'
        },
        lint: {
            files: ['grunt.js']
        },
        concat: {
            dist: {
                src: [
                    '<banner:meta.banner>',
                    'tests/tmp/volksoper-canvas.js'
                ],
                dest: 'dist/volksoper.js'
            },
            canvas: {
                src:[
                    '<banner:meta.sourcemap>',
                    'tests/tmp/volksoper-canvas.js'
                ],
                dest: 'tests/tmp/volksoper-canvas.js'
            }
        },
        typescript: {
            canvas: {
                src: ['src/core/*.ts', 'src/html/*.ts', 'src/canvas/*.ts'],
                dest: 'tests/tmp/volksoper-canvas.js',
                options: {
                    target: "es5",
                    sourcemap: "true",
                    base_path: "src/"
                }
            },
            specs: {
                src: ['src/core/*.ts', 'specs/**/*Spec.ts'],
                dest: "tests/tmp/specs.js",
                options: {
                    target: "es5",
                    base_path: "specs/"
                }
            },
            helpers: {
                src: ['specs/helpers/*.ts'],
                dest: "tests/tmp/helpers.js",
                options: {
                    target: "es5",
                    base_path: "specs/helpers/"
                }
            }
        },
        min: {
            dist: {
                src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
                dest: 'dist/volksoper.min.js'
            }
        },
        watch: {
            files: '<config:lint.files>',
            tasks: 'lint qunit'
        },
        jasmine: {
            //src: "dist/volksoper.js",
            specs: "tests/tmp/specs.js",
            helpers: "tests/tmp/helpers.js"
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                browser: true
            },
            globals: {}
        },
        uglify: {}
    });

    // Default task.
    grunt.registerTask('default',
        'lint typescript:canvas concat:dist concat:canvas typescript:specs jasmine min');

};
