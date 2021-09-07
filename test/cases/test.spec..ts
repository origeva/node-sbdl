import { pipeline, Writable } from 'stream'
import fs from 'fs'
import sbdl, { url } from '../config'

describe('Execute sbdl', () => {
	let destination: Writable
	before(() => {
		destination = fs.createWriteStream('./test/test.mp3')
	})
	it('should download video and pipe it to a file.', (done) => {
		sbdl(url, 'audio', 'mp3').then((video) => {
			video.pipe(destination)
			video.once('close', () => {
				done()
			})
		})
	})
})
