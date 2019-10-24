const gulp    = require('gulp')
const nodemon = require('gulp-nodemon')
const scss    = require('gulp-sass')

gulp.task("server", async (done) => 
    nodemon({
        script: 'src/server.js',
        ext: "js",
        verbose: false,
        env: {
            'NODE_ENV': 'development'
        },
        watch: [
            "src/"
        ],
        done: done
    })
)

scss.compiler = require('node-sass')

gulp.task('scss', async () =>
    gulp.watch('./scss/**/*.scss', gulp.series("scss:build"))
)

gulp.task("scss:build", async () =>
    gulp.src('./scss/**/*.scss')
        .pipe(scss({outputStyle: 'compressed'}).on('error', scss.logError))
        .pipe(gulp.dest('./public/css'))
)

gulp.task("start", gulp.parallel("server", "scss"))