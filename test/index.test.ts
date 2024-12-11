/**
 * @jest-environment node
 */
import { optimizeImages } from '../src'
import { promises as fs } from 'fs'
import fg from 'fast-glob'
import sharp from 'sharp'

// Mocking modules
jest.mock('fast-glob')
jest.mock('fs', () => ({
	promises: {
		readFile: jest.fn(),
		writeFile: jest.fn(),
		mkdir: jest.fn()
	}
}))
jest.mock('sharp')

// Mock fetch (Node.js v18+): we can redefine global.fetch
global.fetch = jest.fn()

const mockedFs = fs as jest.Mocked<typeof fs>;
const mockedFg = fg as jest.MockedFunction<typeof fg>;
const mockedSharp = sharp as unknown as jest.MockedFunction<typeof sharp>;

describe('optimizeImages', () => {
	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks()
	})

	it('should process both external and local images', async () => {
		// Mock external URL fetch response
		const externalImageBuffer = Buffer.from('external image data')
		;(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			arrayBuffer: async () => externalImageBuffer,
		})

		// Mock local file read
		const localImageBuffer = Buffer.from('local image data')
		mockedFs.readFile.mockResolvedValueOnce(localImageBuffer)

		// Mock fast-glob to return one local file
		mockedFg.mockResolvedValueOnce(['public/images/sample-local.jpg'])

		// Mock mkdir
		mockedFs.mkdir.mockResolvedValueOnce(undefined)

		// Mock sharp
		const resizeMock = jest.fn().mockReturnThis()
		const webpMock = jest.fn().mockReturnThis()
		const toBufferMock = jest.fn().mockResolvedValue(Buffer.from('optimized data'))

			// sharp() returns an object that can chain resize().webp().toBuffer()
		;(sharp as unknown as jest.Mock).mockImplementation(() => ({
			metadata: jest.fn().mockResolvedValue({ width: 800, height: 600 }),
			resize: resizeMock,
			webp: webpMock,
			toBuffer: toBufferMock
		}))

		// Execute the function with some options
		await optimizeImages({
			inputPaths: ['https://example.com/image1.jpg'],
			outputPatterns: ['public/images/**/*.jpg'],
			outputDir: './out/images',
			widths: [640],
			quality: 80
		})

		// Check if fetch was called for the external URL
		expect(global.fetch).toHaveBeenCalledWith('https://example.com/image1.jpg')

		// Check if fast-glob was called for the pattern
		expect(mockedFg).toHaveBeenCalledWith('public/images/**/*.jpg', { cwd: process.cwd() })

		// Check if local file read was called
		expect(mockedFs.readFile).toHaveBeenCalledWith(expect.stringContaining('public/images/sample-local.jpg'))

		// Check if mkdir was called
		expect(mockedFs.mkdir).toHaveBeenCalledWith('./out/images', { recursive: true })

		// Check if sharp was called for each image buffer
		// For external image
		expect(sharp).toHaveBeenCalledWith(externalImageBuffer)
		// For local image
		expect(sharp).toHaveBeenCalledWith(localImageBuffer)

		// Check if resize, webp and toBuffer were called
		expect(resizeMock).toHaveBeenCalledWith(640)
		expect(webpMock).toHaveBeenCalledWith({ quality: 80 })
		expect(toBufferMock).toHaveBeenCalled()

		// Check if writeFile was called for the optimized images
		// Output file name pattern: `<baseName>-<width>.webp`
		// external URL: image1.jpg -> image1-640.webp
		expect(mockedFs.writeFile).toHaveBeenCalledWith(
			'out/images/image1-640.webp',
			expect.any(Buffer)
		)
		// local: sample-local.jpg -> sample-local-640.webp
		expect(mockedFs.writeFile).toHaveBeenCalledWith(
			'out/images/sample-local-640.webp',
			expect.any(Buffer)
		)
	})
})
