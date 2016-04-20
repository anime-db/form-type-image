module.exports = function(grunt) {
    grunt.file.defaultEncoding = 'UTF-8';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        project: {
            css: 'src/Resources/public/css/',
            js: 'src/Resources/public/js/',
            jsSrc: 'src/Resources/public/js/src/',
            scss: 'src/Resources/public/scss/',
            filedrop: '<%= project.js %>/vendor/weixiyen/jquery-filedrop/jquery.filedrop.js',
            jsFiles: [
                '<%= project.jsSrc %>/common.js',
                '<%= project.jsSrc %>/image.js',
                '<%= project.jsSrc %>/image_collection.js'
            ]
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    '<%= project.css %>upload_image.css': '<%= project.scss %>main.scss'
                }
            }
        },
        cssmin: {
            default: {
                files: {
                    '<%= project.css %>upload_image.min.css': '<%= project.css %>upload_image.css'
                }
            }
        },
        concat: {
            js: {
                src: ['<%= project.filedrop %>', '<%= project.jsFiles %>'],
                dest: '<%= project.js %>upload_image.js'
            }
        },
        uglify: {
            options: {
                banner: '/* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                compress: {
                    drop_console: true
                }
            },
            build: {
                options: {
                    mangle: false // do not change the names of the functions in the minification
                },
                files: {
                    '<%= project.js %>/upload_image.min.js': '<%= project.js %>/upload_image.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');


    grunt.registerTask('default', ['sass', 'cssmin', 'concat', 'uglify']);
};
