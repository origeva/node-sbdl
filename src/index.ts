import { Category, Segment, SponsorBlock } from 'sponsorblock-api'
import { Readable } from 'stream'
import ytdl from 'ytdl-core'
import { trimSegments } from './trimSegments'
import { trimSegmentsAudio } from './trimSegmentsAudio'
import { trimSegmentsVideo } from './trimSegmentsVideo'
import { videoDownloader } from './videoDownloader'

export type MediaType = 'audio' | 'video' | 'audioandvideo'
export type VideoFormat = 'matroska' | 'mp4'
export type AudioFormat = 'mp3' | 'opus'

async function sbdl(url: string, mediaType: 'audioandvideo', outputFormat: VideoFormat, categories?: Category[]): Promise<Readable>
async function sbdl(url: string, mediaType: 'video', outputFormat: VideoFormat, categories?: Category[]): Promise<Readable>
async function sbdl(url: string, mediaType: 'audio', outputFormat: AudioFormat, categories?: Category[]): Promise<Readable>
async function sbdl(url: string, mediaType: MediaType, outputFormat: VideoFormat | AudioFormat, categories: Category[] = ['intro', 'outro', 'music_offtopic']): Promise<Readable> {
	let segments: Segment[] = []
	try {
		segments = await new SponsorBlock('sbdl', { userAgent: 'sbdl' }).getSegments(ytdl.getVideoID(url), categories)
	} catch (e) {}
	if (mediaType === 'audio') {
		return trimSegmentsAudio(ytdl(url, { quality: 'highestaudio' }), segments, outputFormat as AudioFormat)
	} else if (mediaType === 'video') {
		return trimSegmentsVideo(ytdl(url, { quality: 'highestvideo' }), segments, outputFormat as VideoFormat)
	} else {
		return trimSegments(videoDownloader(url), segments, outputFormat as VideoFormat)
	}
}

export default sbdl
