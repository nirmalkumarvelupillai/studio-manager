let gulp = require('gulp');
let nodemon = require('gulp-nodemon');
let bs = require('browser-sync').create();
let bs_reload = bs.reload;

gulp.task('serve',(cb)=>{
    var called = false;
    nodemon({
        script: 'index.js'
        ,ext: 'js css html'
        ,ignore:[
            'node_modules/',
            'data/'
        ]
        ,env: { 'NODE_ENV': 'development' }
    }).on('start',()=>{
        if (!called) {
            called = true;
            cb();
        }
    })
    .on('restart', () => {
        setTimeout( ()=> {
            bs_reload({ stream: false });
        }, 3000);
    });

});

gulp.task('browser-sync',['serve'],()=>{
    setTimeout(()=>{
        bs.init(null,{
            proxy:'localhost:9000',
            notify:true
        });
    },3000)

});

gulp.task('default',['browser-sync'],()=>{
    console.log("application started...")
});