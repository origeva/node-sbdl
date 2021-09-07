# node-sbdl

## YouTube downloader trimming skip segments fetched from SponsorBlock.

### Using ytdl-core for downloading the content, ffmpeg for trimming it and node-sponsorblock-api for fetching the skip segments from SponsorBlock.

By default skips intro, outro and music_offtopic segment categories.

### Usage:

```javascript
const fs = require('fs')
const sbdl = require('sbdl')

let video = await sbdl(url, 'audioandvideo', 'matroska')
video.pipe(fs.createWriteStream('video.mkv'))
```

Please note you must use a video output format for 'audioandvideo' and 'video' and an audio output format for 'audio'. ffmpeg does support more formats which are simply not typed **yet**.
