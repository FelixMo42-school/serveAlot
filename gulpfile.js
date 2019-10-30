const gulp         = require('gulp')
const nodemon      = require('gulp-nodemon')
const scss         = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')


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

gulp.task("scss", async () => 
    gulp.series("scss:build", "scss:watch")
)

gulp.task('scss:watch', async () =>
    gulp.watch('./scss/**/*.scss', gulp.series("scss:build"))
)

gulp.task("scss:build", async () =>
    gulp.src('./scss/**/*.scss')
        .pipe(scss({outputStyle: 'compressed'}).on('error', scss.logError))
        .pipe(autoprefixer('last 10 versions', 'ie 9'))
        .pipe(gulp.dest('./public/css'))
)

gulp.task("start", gulp.parallel("server", "scss"))