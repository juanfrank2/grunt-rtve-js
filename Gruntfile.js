module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        dir_dependencies : 'dist/dependencies',
        dir_src: 'src',
        dir_packs: 'dist/packs',
        dir_public: 'public/js',
        dir_config: 'config',

        js_groupid : 'com.irtve.js',
        js_ext : 'jar',

        artifactory: {
            options: {
                url: 'http://ci.irtve.rtve.int:80',
                repository: 'libs-releases',
                username: 'ciadmin',
                password: 'c1@dm1n'
            },
            client: {
                options: {
                    fetch: require('./config/dependencies.json')
                }
            }
        },

        jshint: {
            all: ['<%=dir_src%>/**/*.js','<%=dir_dependencies%>/**/*.js'],
            options: {
                reporter: 'jslint',
                reporterOutput: 'reporter.xml',
                force: true
            }
        },

        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            dist: {
                files: require('./config/scripts.json')
            }
        },

        uglify: {
            options: {
                mangle: true,
                banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                        '<%= grunt.template.today("yyyy-mm-dd") %> */',
                compress: {
                    drop_console: true
                }
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%=dir_packs%>',
                    src: '**/*.js',
                    dest: '<%=dir_public%>'
                }]
            }
        },

        watch: {
            js: {
                files: ['<%=dir_src%>/**/*.js'],
                tasks: ['compile'],
                options: {
                    interrupt: true
                }
            },
            dependencies: {
                files: ['<%=dir_config%>/dependencies.json'],
                tasks: ['build'],
                options: {
                    interrupt: true
                }
            }
        },

        bower: {
            install: {
                options: {
                    targetDir: './dist/vendor',
                    layout: 'byComponent',
                    install: true,
                    verbose: true,
                    cleanBowerDir: false
                }
            }
        }
    });

    //Load plugins
    grunt.loadNpmTasks('grunt-artifactory-artifact');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-bower-task');

    //Fetch Javascript Dependencies (dependencies.json)
    grunt.registerTask('dependencies', 'artifactory:client:fetch'),

    //Test Javascript
    grunt.registerTask('test', 'jshint:all'),

    //Compile Javascript Client-Side: concat (scripts.json), compress, obfuscate
    grunt.registerTask('compile', ['concat','uglify']),

    //Build Javascript Project
    grunt.registerTask('build', ['dependencies', 'test', 'compile']);

    //Run the server and watch for file changes
    //grunt.registerTask('server', ['bgShell:runNode', 'compile', 'watch'])

    //Default task(s)
    grunt.registerTask('default', ['build', 'bower:install']);
}