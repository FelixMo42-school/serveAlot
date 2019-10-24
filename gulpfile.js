const gulp    = require('gulp')
const nodemon = require('gulp-nodemon')
const sass    = require('gulp-sass')

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

sass.compiler = require('node-sass')

gulp.task('sass', async () =>
    gulp.watch('./sass/**/*.scss', gulp.series("sass:build"))
)

gulp.task("sass:build", async () =>
    gulp.src('./sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest('./public/css'))
)

gulp.task("start", gulp.parallel("server", "sass"))