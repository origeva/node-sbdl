import cp from 'child_process'
import ffmpeg from 'ffmpeg-static'
import { Segment } from 'sponsorblock-api'
import { Readable } from 'stream'
import { AudioFormat, VideoFormat } from '.'

export function trimSegmentsVideo(input: Readable, segments: Segment[] | { startTime: number; endTime: number }[], outputFormat: VideoFormat): Readable {
	if (!segments.length) {
		return input
	}
	let filter = ''
	if (segments) {
		let pos = 0
		for (let i = 0; i < segments.length; i++) {
			filter += `[0:v]trim=start=${pos}:end=${segments[i].startTime},setpts=PTS-STARTPTS[pt${i}];`
			pos = segments[i].endTime
		}
		filter += `[0:v]trim=start=${pos},setpts=PTS-STARTPTS[pt${segments.length}];`
		for (let i = 0; i < segments.length + 1; i++) {
			filter += `[pt${i}]`
		}
		filter += `concat=n=${segments.length + 1}:v=1:a=0`
	}
	// Start the ffmpeg child process
	const ffmpegProcess = cp.spawn(
		ffmpeg,
		[
			// Remove ffmpeg's console spamming
			'-loglevel',
			'8',
			'-hide_banner',
			// Audio input
			'-i',
			// stdin
			'pipe:0',
			// Filter Complex
			'-filter_complex',
			filter,
			// Define output container
			'-f',
			outputFormat,
			// stdout
			'pipe:1',
		],
		{
			stdio: ['pipe', 'pipe', 'inherit'],
		}
	)

	// Link streams
	input.pipe(ffmpegProcess.stdin)
	return ffmpegProcess.stdout
}
