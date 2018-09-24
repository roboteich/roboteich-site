"use strict";
/**
* utils
*/
var buffer = require("vinyl-buffer");

/**
* stream transforms
*/
var del = require("del");
var gulp = require("gulp");
var gutil = require("gulp-util");
var rename = require("gulp-rename");
var runSequence = require("run-sequence");
var source = require("vinyl-source-stream");

/**
* sass
*/
var sass = require("gulp-sass");
var sassGlob = require("gulp-sass-glob");
var autoprefixer = require("gulp-autoprefixer");
var cssnano = require("gulp-cssnano");

/**
* js
*/
var babelify = require("babelify");
var browserify = require("browserify");
var eslint = require("gulp-eslint");
var sourcemaps = require("gulp-sourcemaps");
var uglify = require("gulp-uglify");

/**
* templates
*/
var htmlreplace = require("gulp-html-replace");

/**
* preview
*/
var browserSync = require("browser-sync");

/**
* config
*/
var env = process.env.NODE_ENV === "development" ? "development" : "production";
var filePaths = {
  src: {
    scripts: {
      entry: "./app/scripts/index.js",
      all: "./app/scripts/**/*.js",
      spec: "./app/scripts/**/*.spec.js",
      bundled: "bundle.min.js"
    },
    config: { browserSync: "./app/scripts/config/development.js" },
    styles: {
      entry: "./app/styles/main.scss",
      all: "./app/styles/**/*.scss",
      vendor: [],
      bundled: "styles.min.css"
    },
    templates: { entry: "./app/templates/index.html" },
    public: { all: "./app/public/**/*.*" }
  },
  dest: {
    build: "./dist",
    scripts: "./dist/js",
    styles: "./dist/css",
    public: { all: "dist" },
    templates: "./dist"
  }
};

// lint-scripts
gulp.task("lint:scripts", function() {
  return gulp
    .src([
      filePaths.src.scripts.all,
      "!node_modules/**",
      "!" + filePaths.src.scripts.spec
    ])
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

// compile javascript
gulp.task("build:scripts", function() {
  process.env.NODE_ENV = env;
  return browserify({
    entries: filePaths.src.scripts.entry,
    extensions: ".js",
    paths: [ "./node_modules" ],
    debug: true
  })
    .transform(babelify.configure({ ignore: /(node_modules)/ }))
    .bundle()
    .on("error", function(err) {
      gutil.log(gutil.colors.red(err));
    })
    .pipe(source(filePaths.src.scripts.bundled))
    .pipe(buffer())
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(filePaths.dest.scripts));
});

// compile css
gulp.task("build:styles", function() {
  return gulp
    .src(filePaths.src.styles.entry)
    .pipe(sassGlob())
    .pipe(
      sass({
        outputStyle: "nested",
        includePaths: [
          filePaths.src.styles.all,
          "node_modules/normalize-scss/sass/",
          "node_modules/include-media/dist/"
        ]
      }).on("error", sass.logError)
    )
    .pipe(autoprefixer())
    .pipe(rename(filePaths.src.styles.bundled))
    .pipe(gulp.dest(filePaths.dest.styles));
});

// compile media assets
gulp.task("copy:public", function() {
  return gulp
    .src(filePaths.src.public.all)
    .pipe(gulp.dest(filePaths.dest.public.all));
});

// compile templates
gulp.task("build:templates", function() {
  gulp
    .src(filePaths.src.templates.entry)
    .pipe(
      htmlreplace({
        css: "css/" + filePaths.src.styles.bundled,
        js: "js/" + filePaths.src.scripts.bundled,
        config: {
          src: gulp.src(filePaths.src.config.browserSync),
          tpl: "<script type=\"text/javascript\">\n%s</script>"
        }
      })
    )
    .pipe(gulp.dest(filePaths.dest.templates));
});

// move assets
gulp.task("reload:public", [ "copy:public" ], browserSync.reload);

// watch styles
gulp.task("reload:styles", [ "build:styles" ], browserSync.reload);

// watch scripts
gulp.task("reload:scripts", [ "build:scripts" ], browserSync.reload);

// watch templates
gulp.task("reload:templates", [ "build:templates" ], browserSync.reload);

// // run tests
// gulp.task('test', function(done) {
//   karma.start({
//     configFile: __dirname + '/karma.conf.js'
//   }, done);
// });
// cleanup
gulp.task("clean", function() {
  del.sync([ filePaths.dest.build + "/**/*.*" ]);
});

// preview
gulp.task("browser-sync", function() {
  browserSync({
    logConnections: true,
    open: "external",
    server: { baseDir: filePaths.dest.templates },
    port: process.env.PORT || 5000,
    xip: true
  });
});

// watch assets
// watch styles
gulp.task("watch", function() {
  var callback = function() {
    gulp.watch(filePaths.src.scripts.all, [ "reload:scripts" ]);
    gulp.watch(filePaths.src.styles.all, [ "reload:styles" ]);
    gulp.watch(filePaths.src.templates.entry, [ "reload:templates" ]);
    gulp.watch(filePaths.src.public.all, [ "reload:public" ]);

    gutil.log(gutil.colors.green("Watching for changes..."));
  };

  runSequence(
    "clean",
    "lint:scripts",
    [ "build:scripts", "build:styles", "build:templates", "copy:public" ],
    "browser-sync",
    callback
  );
});

gulp.task("build", function(cb) {
  var callback = function() {
    gutil.log(gutil.colors.green("Build complete."));
    cb();
  };

  runSequence(
    "clean",
    "lint:scripts",
    [ "build:scripts", "build:styles", "build:templates", "copy:public" ],
    callback
  );
});

gulp.task("default", [ "build" ]);
