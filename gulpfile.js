var fs = require('fs'),
	gulp = require("gulp"),
	gulpLoadPlugins = require("gulp-load-plugins"),
	plugins = gulpLoadPlugins();
/*
* 清理src、build目录
*/
gulp.task("clean", function() {
	return gulp.src(["src/","build/"], {
			read: false
		})
		.pipe(plugins.rimraf());
});
/*
 * @desc 复制文件到src目录
 */
gulp.task("copy-echarts", function() {
	return gulp.src(["echarts/src/**/*.*"])
		.pipe(gulp.dest("src/echarts/"))
});
gulp.task("copy-zrender", function() {
	return gulp.src(["zrender/src/**/*.*"])
		.pipe(gulp.dest("src/echarts/zrender/"))
});

/*
* 转换amd及zrender引用路径
*/
gulp.task("src-cmd", function(cb) {
	return gulp.src("src/**/*.js")
		.pipe(plugins.jsbeautifier())
		.pipe(plugins.replace('define(function(require)', 'define(function(require,exports,module)'))
		.pipe(plugins.replace('define(function()', 'define(function(require,exports,module)'))
		.pipe(plugins.replace("require('zrender", "require('crm-modules/common/echarts/zrender"))
		.pipe(gulp.dest("src/"))
});

/*
* 格式化依赖文件
*/
gulp.task('dep', function(cb) {
	return gulp.src('dep.json')
		.pipe(plugins.replace(/Loaded module:/g, ","))
		.pipe(plugins.replace(/zrender\//g, 'echarts/zrender/'))
		.pipe(plugins.header('{"dep":[""'))
		.pipe(plugins.footer(']}'))
		.pipe(plugins.rename({
            suffix: '-build'
        }))
		.pipe(gulp.dest('src/'))
});

/*
* id提取并合并为压缩版echarts.js 输出到build目录
*/
gulp.task('transform', function(cb) {
	return gulp.src( 'src/**/*.js' )
		.pipe(plugins.cmdTransit({
            dealIdCallback: function(id) {
                return 'crm-modules/common/' + id;
            }
        }))
        .pipe(gulp.dest('src/'))
});

/*
* js文件合并
*/
gulp.task('concat',function(cb){
	var json = require('./src/dep-build.json');
	if (!json) return;
	var delDataArr = ['src/echarts/Secharts.js'];
    for (var i=0;i<json.dep.length;i++) {
    	if( json.dep[i] ){
        	delDataArr.push( 'src/'+json.dep[i]+'.js' );
    	} 
    }
	return gulp.src( delDataArr )
		.pipe(plugins.concat("Secharts.js"))
        .pipe(plugins.uglify({
            mangle: true,
            compress: {
                drop_console: true
            }
        }))
        .pipe(gulp.dest('build/'))
});
gulp.task('build',function(cb){
	plugins.sequence("clean",["copy-echarts", "copy-zrender"],['dep',"src-cmd"],'transform','concat', cb);
});

gulp.task('getsrc',function(cb){
	plugins.sequence("clean",["copy-echarts", "copy-zrender"],'src-cmd', cb);
});