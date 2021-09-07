import cp from 'child_process'
import { Readable, Writable } from 'stream'
import ffmpeg from 'ffmpeg-static'
import ytdl from 'ytdl-core'

export function videoDownloader(url: string): Readable {
	// Get audio and video streams
	const audio = ytdl(url, { quality: 'highestaudio' })
	const video = ytdl(url, { quality: 'highestvideo' })

	// Start the ffmpeg child process
	const ffmpegProcess = cp.spawn(
		ffmpeg,
		[
			// Remove ffmpeg's console spamming
			'-loglevel',
			'8',
			'-hide_banner',
			// Set inputs
			'-i',
			'pipe:0',
			'-i',
			'pipe:3',
			// Map audio & video from streams
			'-map',
			'0:a',
			'-map',
			'1:v',
			// Keep encoding
			'-c:v',
			'copy',
			// Define output file
			'-f',
			'matroska',
			'pipe:1',
		],
		{
			stdio: ['pipe', 'pipe', 'inherit', 'pipe'],
		}
	)

	// Link streams
	audio.pipe(ffmpegProcess.stdin as Writable)
	video.pipe(ffmpegProcess.stdio[3] as Writable)
	return ffmpegProcess.stdout as Readable
}
