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

// npm task

gulp.task("build", gulp.series("sass:build"))

gulp.task("start",
    process.env.NODE_ENV  === "production" ?
        gulp.series("build", "server:production") :
        gulp.series("sass",  "server:development")
)