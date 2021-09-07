import cp from 'child_process'
import ffmpeg from 'ffmpeg-static'
import { Segment } from 'sponsorblock-api'
import { Readable, Writable } from 'stream'
import { AudioFormat, VideoFormat } from '.'

export function trimSegments(input: Readable, segments: Segment[] | { startTime: number; endTime: number }[], outputFormat: VideoFormat): Readable {
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
		filter += `concat=n=${segments.length + 1}:v=1:a=0[outv];`
		pos = 0
		for (let i = 0; i < segments.length; i++) {
			filter += `[0:a]atrim=start=${pos}:end=${segments[i].startTime},asetpts=PTS-STARTPTS[pt${i}];`
			pos = segments[i].endTime
		}
		filter += `[0:a]atrim=start=${pos},asetpts=PTS-STARTPTS[pt${segments.length}];`
		for (let i = 0; i < segments.length + 1; i++) {
			filter += `[pt${i}]`
		}
		filter += `concat=n=${segments.length + 1}:v=0:a=1[outa]`
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
			'pipe:3',
			// Filter Complex
			'-filter_complex',
			filter,
			// Define output container
			'-map',
			'[outv]',
			'-map',
			'[outa]',
			'-f',
			outputFormat,
			// stdout
			'pipe:4',
		],
		{
			stdio: ['inherit', 'inherit', 'inherit', 'pipe', 'pipe'],
		}
	)

	// Link streams
	input.pipe(ffmpegProcess.stdio[3] as Writable)
	return ffmpegProcess.stdio[4] as Readable
}
