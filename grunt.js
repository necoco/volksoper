/*global module:false*/


module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-jasmine-runner');

    // Project configuration.
    grunt.initConfig({
        meta: {
            version: '0.1.0',
            banner: '/*! Volksoper - v<%= meta.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '* http://PROJECT_WEBSITE/\n' +
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
                    'tmp/volksoper-canvas.js'
                ],
                dest: 'dist/volksoper.js'
            }
        },
        typescript: {
            canvas: {
                src: ['src/core/*.ts', 'src/html/*.ts', 'src/canvas/*.ts'],
                dest: 'tmp/volksoper-canvas.js',
                options: {
                    target: "es5",
                    base_path: "src/"
                }
            },
            specs: {
                src: ['specs/**/*Spec.ts'],
                dest: "tmp/specs.js",
                options: {
                    target: "es5",
                    base_path: "specs/"
                }
            },
            helpers: {
                src: ['specs/helpers/*.ts'],
                dest: "tmp/helpers.js",
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
            specs: "tmp/specs.js",
            helpers: "tmp/helpers.js"
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
        'lint typescript:canvas concat typescript:specs jasmine min');

};
