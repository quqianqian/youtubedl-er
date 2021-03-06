var express = require('express')
var app = express()
var validUrl = require('valid-url')

var fs = require('fs');
var youtubedl = require('youtube-dl');

app.set('port', (process.env.PORT || 3000));

var log = function() {
    var timestamp = new Date().toLocaleString();
    var LOG_PREFIX = `[${timestamp}] -`;

    // 1. Convert args to a normal array
    var args = Array.prototype.slice.call(arguments);

    // 2. Prepend log prefix log string
    args.unshift(LOG_PREFIX);

    // 3. Pass along arguments to console.log
    console.log.apply(console, args);
}

function getAssetStream(url, args) {
    if (!validUrl.isUri(url)) {
        return null;
    }
    // var params = ['--prefer-free-formats'];
    var params = [];
    log(args);
    if ('height' in args) {
        params.push(`-f mp4[height<=${args.height}]`);
    } else if ('format' in args) {
        params.push('-f ' + args.format);
    } else {
        params.push('-f best');
    }
    log(`Downloading video: ${url} ...`);
    var video = youtubedl(url, params);
        //['--recode-video=mp4']);
    return video;
}

app.get('/', (req, res) => {
    log("Got request")
    log(req.headers)
    var video = getAssetStream(req.query.url, req.query)
    if (video) {
        video.on('info', (info) => {
            log('Download started');
            log('title: ' + info.title);
            log('filename: ' + info._filename);
            log('size: ' + info.size);
            res.writeHead(200, {
                'Accept-Ranges': 'bytes',
                //'Content-Type': 'video/mp4',
                'Content-Length': info.size,
                'Content-Disposition': `attachment; filename="${encodeURIComponent(info._filename)}"`
            });
            
            video.pipe(res)
        })
        
        video.on('end', function() {
            log('finished downloading!');
        });
    } else {
        res.sendStatus(400)
    }
})

app.listen(app.get('port'), () => {
    log('youtubedl app listening on port', app.get('port'))
})

