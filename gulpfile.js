const gulp         = require('gulp')
const nodemon      = require('gulp-nodemon')
const sass         = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')

// server task

gulp.task("server:development", async (done) =>
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

gulp.task("server:production", async () =>
    require('./src/server.js')
)

// scss task

sass.compiler = require('node-sass')

gulp.task('sass:watch', async () =>
    gulp.watch('./scss/**/*.scss', gulp.series("sass:build"))
)

gulp.task("sass:build", async () =>
    gulp.src('./scss/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer('last 10 versions', 'ie 9'))
        .pipe(gulp.dest('./public/css'))
)

gulp.task("sass", gulp.series("sass:build", "sass:watch"))

// fontawsome

gulp.task('fontawsome:fonts', function() {
    return gulp.src('./node_modules/@fortawesome/fontawesome-free/webfonts/*').pipe(gulp.dest('./public/fonts'))
})

gulp.task('fontawsome:sprites', function() {
    return gulp.src('./node_modules/@fortawesome/fontawesome-free/sprites/*').pipe(gulp.dest('./public/sprites'))
})

gulp.task('fontawsome:svgs', function() {
    return gulp.src('./node_modules/@fortawesome/fontawesome-free/svgs/*').pipe(gulp.dest('./public/svgs'))
})

gulp.task('fontawsome', gulp.series("fontawsome:fonts", "fontawsome:sprites", "fontawsome:svgs"))

// npm task

gulp.task("build", gulp.series("sass:build", "fontawsome"))

gulp.task("start",
    process.env.NODE_ENV  === "production" ?
        gulp.series("build", "server:production") :
        gulp.series("sass",  "fontawsome", "server:development")
)