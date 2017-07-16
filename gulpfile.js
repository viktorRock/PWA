var gulp = require('gulp');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var del = require('del');
var swPrecache = require('sw-precache');
var dom = require('gulp-dom');
var indexPath =  './';
var config = {
  stylePath: './styles/', /*'./styles/*.scss'*/
  imagesPath: './images/',
  scriptPath: './scripts/', /*./styles/*/
  logPreffix: '[gulp]: ',
  
  gulpAbsPath: './gulpfile.js',
  srvWrkAbsPath: './service-worker.js'
};

// gulp.task('getHtmlTite', function() {
// return gulp.src(indexPath + 'index.html')
// .pipe(dom(function(){
// return this.querySelectorAll('head > title')[0].getAttribute('text');

// }))
//  .pipe(gulp.dest('./public/'));
// });

gulp.task('sass', function () {
  console.log('SASS :' + ' SRC = ' + config.stylePath + '*.scss' + ' | DEST = ' + config.stylePath );
  return gulp
  .src(config.stylePath + '*.scss')
  .pipe(sass())
  .pipe(autoprefixer())
  .pipe(gulp.dest(config.stylePath))
  .pipe(minifyCss({}))
  .pipe(rename({
      suffix: '.min'
    }))
  .pipe(gulp.dest(config.stylePath));
});

// gulp.task('default', function() {
// // place code for your default task here
// });



gulp.task('browser-sync', function () {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
});

gulp.task('generate-sw', function() {
  var swOptions = {
    // staticFileGlobs: [indexPath + '/**/*.{js,html,css,png,jpg,gif,svg}'],
    staticFileGlobs: [
      indexPath + 'index.html',
      config.imagesPath + '*.{png,svg,gif,jpg}',
      config.scriptPath + '*.js',
      config.stylePath + '*.css'
    ],
    stripPrefix: '.',
    runtimeCaching: [{
      urlPattern: /^https:\/\/publicdata-weather\.firebaseio\.com/,
      handler: 'networkFirst',
      options: {
        cache: {
          name: 'weatherData-v3'
        }
      }
    }]
  };
  return swPrecache.write(config.srvWrkAbsPath, swOptions);
});


gulp.task('serve', ['generate-sw'], function () {
  gulp.watch(config.stylePath + '*.scss', ['sass']);
  browserSync({
    notify: false,
    logPrefix: config.logPreffix,
    server: ['.'],
    open: false
  });
  gulp.watch([
      indexPath + '*.html',
      config.scriptPath + '*.js',
      config.stylePath + '*.css',
      '!' + config.srvWrkAbsPath,
      '!' + config.gulpAbsPath,
    ], ['generate-sw'], browserSync.reload);
});

gulp.task('default', ['serve','sass'],function () {
	// var htmlTitle = config.logPreffix + gulp.src(indexPath + 'index.html')
    // .pipe(dom(function(){
	// return this.querySelector('title').textContent
		// }));
	// console.log('htmlTitle = ' , htmlTitle);
});

/*****************************************************************************/
gulp.task('correct-faulty-markup', function() {
    return gulp.src(indexPath + 'index.html')
        .pipe(dom(function(){
            return this;
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
  return gulp
    // Watch the input folder for change,
    // and run `sass` task when something happens
    .watch(input, ['sass'])
    // When there is a change,
    // log a message in the console
    .on('change', function(event) {
      console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});
