module.exports = function(grunt) {
    grunt.file.defaultEncoding = 'UTF-8';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        project: {
            css: 'src/Resources/public/css/',
            js: 'src/Resources/public/js/',
            jsSrc: 'src/Resources/public/js/src/',
            scss: 'src/Resources/public/scss/',
            jsFiles: [
                '<%= project.js %>vendor/weixiyen/jquery-filedrop/jquery.filedrop.js',
                '<%= project.jsSrc %>common.js',
                '<%= project.jsSrc %>UploadImage.js',
                '<%= project.jsSrc %>UploadImageCollection.js'
            ]
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    '<%= project.css %>UploadImage.css': '<%= project.scss %>main.scss'
                }
            }
        },
        cssmin: {
            default: {
                files: {
                    '<%= project.css %>UploadImage.min.css': '<%= project.css %>UploadImage.css'
                }
            }
        },
        concat: {
            js: {
                src: '<%= project.jsFiles %>',
                dest: '<%= project.js %>UploadImage.js'
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
                    '<%= project.js %>UploadImage.min.js': '<%= project.js %>UploadImage.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['sass', 'cssmin', 'concat', 'uglify']);
};
