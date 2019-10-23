const { series, src, dest, watch } = require('gulp');
const parseArgs = require('minimist');
const browserSync = require('browser-sync').create();
const gulpif = require('gulp-if');
const htmlmin = require('gulp-htmlmin');
const pug = require('gulp-pug');
const ejs = require('gulp-ejs');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const dartSass = require('gulp-dart-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');

const envOptions = {
  string: 'env',
  default: { env: 'develop' },
};
const options = parseArgs(process.argv.slice(2), envOptions);

function copyHTML() {
  return src('src/*.html')
    .pipe(
      gulpif(
        options.env === 'production',
        htmlmin({ collapseWhitespace: true, removeComments: true }),
      ),
    )
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

function pugToHTML() {
  return src('src/*.pug')
    .pipe(gulpif(options.env === 'production', pug({}), pug({ pretty: true })))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

function ejsToHTML() {
  return src('src/*.ejs')
    .pipe(ejs({}))
    .pipe(rename({ extname: '.html' }))
    .pipe(
      gulpif(
        options.env === 'production',
        htmlmin({ collapseWhitespace: true, removeComments: true }),
      ),
    )
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

function copyCSS() {
  return src('src/styles/**/*.css')
    .pipe(gulpif(options.env === 'production', sourcemaps.init()))
    .pipe(
      gulpif(
        options.env === 'production',
        cleanCSS({ compatibility: 'ie8', debug: true }, details => {
          console.log(`${details.name}: ${details.stats.originalSize}`);
          console.log(`${details.name}: ${details.stats.minifiedSize}`);
        }),
      ),
    )
    .pipe(gulpif(options.env === 'production', sourcemaps.write('.')))
    .pipe(dest('dist/styles'))
    .pipe(browserSync.stream());
}

function scssToCSS() {
  return src('src/styles/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(
      gulpif(
        options.env === 'production',
        dartSass({
          outputStyle: 'compressed',
          includePaths: [
            './node_modules/bootstrap/scss',
            './node_modules/@fortawesome/fontawesome-free/scss',
          ],
        }).on('error', dartSass.logError),
        dartSass({
          includePaths: [
            './node_modules/bootstrap/scss',
            './node_modules/@fortawesome/fontawesome-free/scss',
          ],
        }).on('error', dartSass.logError),
      ),
    )
    .pipe(postcss([autoprefixer()]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/styles'))
    .pipe(browserSync.stream());
}

function copyJS() {
  return src('src/scripts/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(
      babel({
        presets: ['@babel/env'],
      }),
    )
    .pipe(concat('vendor.js'))
    .pipe(gulpif(options.env === 'production', uglify()))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/scripts'))
    .pipe(browserSync.stream());
}

function tsToJS() {
  return src('src/scripts/**/*.ts')
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(gulpif(options.env === 'production', uglify()))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/scripts'))
    .pipe(browserSync.stream());
}

function copyImages() {
  return src('src/images/**/*')
    .pipe(gulpif(options.env === 'production', imagemin()))
    .pipe(dest('dist/images'))
    .pipe(browserSync.stream());
}

function copyStatic() {
  return src('src/static/**/*')
    .pipe(dest('dist/static'))
    .pipe(browserSync.stream());
}

function serve() {
  browserSync.init({
    server: {
      baseDir: './dist',
    },
  });
  watch('src/*.html', series(copyHTML));
  watch('src/**/*.pug', series(pugToHTML));
  watch('src/**/*.ejs', series(ejsToHTML));
  watch('src/styles/**/*.css', series(copyCSS));
  watch('src/styles/**/*.scss', series(scssToCSS));
  watch('src/scripts/**/*.js', series(copyJS));
  watch('src/scripts/**/*.ts', series(tsToJS));
  watch('src/images/**/*', series(copyImages));
  watch('src/static/**/*', series(copyStatic));
}

exports.default = series(
  copyHTML,
  pugToHTML,
  ejsToHTML,
  copyCSS,
  scssToCSS,
  copyJS,
  tsToJS,
  copyImages,
  copyStatic,
  serve,
);

exports.build = series(
  copyHTML,
  pugToHTML,
  ejsToHTML,
  copyCSS,
  scssToCSS,
  copyJS,
  tsToJS,
  copyImages,
  copyStatic,
);
