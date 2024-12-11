export default {
	inputPaths: [
		// 'https://example.com/remote-image.jpg',
		// 'public/images/local-file.png'
	],
	outputPatterns: [
		'public/images/**/*.{jpg,png,webp}'
	],
	outputDir: './out/images',
	quality: 80,

	// Now 'modes' is an array. It can include 'scales', 'widths', or both.
	modes: ['scales', 'widths'],

	widths: [640, 1280, 1920],

	scales: {
		'@3x': 1,
		'@2x': 2/3,
		'@1x': 1/3
	},

	envMode: process.env.ENV_MODE || 'development'
}
