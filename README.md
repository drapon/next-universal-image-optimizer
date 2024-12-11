# next-universal-image-optimizer

A build-time image optimization tool for Next.js (and other static build environments) that supports both internal and external images. It allows you to:

- Fetch images from remote URLs (e.g., from a CMS).
- Discover and optimize local images via glob patterns (e.g., `public/images/**/*`).
- Generate multiple responsive variants in various widths or scales.
- Convert images to optimized formats (e.g., WebP) with configurable quality.

**Note:** This tool is designed for static builds and works well with `next export` scenarios, where dynamic optimization provided by `next/image` is not available.

## Features

- **Universal Input**: Supports both local files and remote URLs.
- **Configurable**: Easily adjust widths, quality, output directories, and modes (widths/scales) via config or runtime options.
- **Uses Sharp**: [sharp](https://sharp.pixelplumbing.com/) handles efficient resizing and conversion.
- **Next.js Integration**: Ideal for `next export` scenarios to ensure that final static output images are optimized.

## Installation

Use your package manager of choice:

```
pnpm add next-universal-image-optimizer
```

(You can also use `npm` or `yarn`.)

## Usage

### 1. Configuration File

Create `nuio.config.ts` (or `.js`) at your project root:

```typescript
export default {
   inputPaths: [
      // 'https://example.com/remote-image.jpg',
      // 'public/images/local-file.png'
   ],
   outputPatterns: [
      'public/images/**/*.{jpg,png,webp}'
   ],
   outputDir: 'out/images',
   widths: [640, 1280, 1920],
   quality: 80,
   modes: ['scales', 'widths'], // enable scaling and widths mode
   scales: {
      '@3x': 1,
      '@2x': 2/3,
      '@1x': 1/3
   },
   envMode: process.env.ENV_MODE || 'development'
}
```

### 2. Calling `optimizeImages`

Call `optimizeImages()` without arguments to use `nuio.config.ts` defaults:

```typescript
import { optimizeImages } from 'next-universal-image-optimizer'

async function run() {
  await optimizeImages()
  console.log('Images optimized successfully!')
}

run().catch(err => {
  console.error('Failed to optimize images:', err)
  process.exit(1)
})
```

You can override defaults by passing options:

```typescript
await optimizeImages({
  inputPaths: ['https://example.com/another-remote.jpg'],
  outputPatterns: ['public/images/**/*.png'],
  widths: [320, 640],
  quality: 90
})
```

### 3. Integrating with Next.js (`next export`)

For `next export` scenarios, run `optimizeImages` after exporting:

Example `package.json` scripts:

```json
{
   "scripts": {
      "prebuild": "node scripts/fetch-images.js",
      "build": "next build && next export && node scripts/post-export-optimize.js"
   }
}
```

In `scripts/post-export-optimize.js`:

```typescript
import { optimizeImages } from 'next-universal-image-optimizer'

async function postExport() {
   await optimizeImages()
   console.log('Images optimized successfully!')
}

postExport().catch(console.error)
```

After `next export`, optimized images will be in `out/images`. Reference them directly in your static HTML.

### 4. Testing

Use Jest or another test runner. For examples, see `test/index.test.ts` for mock and snapshot testing patterns.

### 5. Advanced Usage

- **External Image Lists**: Fetch a list of remote images from a CMS and pass them to `optimizeImages` before building.
- **Different Formats**: By default, images are converted to WebP. Adjust sharp options to convert to other formats if needed.

### Contributing

Contributions are welcome! Feel free to open issues or PRs on GitHub. For feature requests, please describe your use case and desired outcome.

### License

MIT License  
