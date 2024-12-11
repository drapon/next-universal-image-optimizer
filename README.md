# next-universal-image-optimizer

A build-time image optimization tool for Next.js (and other static build environments) that supports both internal and external images. It allows you to:

- Fetch images from remote URLs (e.g., from a CMS).
- Discover and optimize local images via glob patterns (e.g., `public/images/**/*`).
- Generate multiple responsive variants in various widths or scales.
- Convert images to optimized formats (e.g., WebP) with configurable quality.

**Note:** This tool is designed for static builds and works well with `next export` scenarios, where `next/image` dynamic optimization isn't available.

## Features

- **Universal Input**: Handle both local files and remote URLs.
- **Configurable**: Easily adjust widths, quality, output directories, and modes (widths/scales) via config or runtime options.
- **Uses Sharp**: [sharp](https://sharp.pixelplumbing.com/) handles resizing and conversion.
- **Next.js Integration**: Ideal for use before `next export` to ensure optimized images in your final static output.

## Installation

```bash
pnpm add next-universal-image-optimizer
```
*(You can use `npm` or `yarn` as well.)*

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
   modes: ['scales', 'widths'], // enable scaling mode as well as widths
   scales: {
      '@3x': 1,
      '@2x': 2/3,
      '@1x': 1/3
   },
   envMode: process.env.ENV_MODE || 'development'
}
```

You can merge these defaults with runtime options passed to `optimizeImages()`.

### 2. Calling `optimizeImages`

```typescript
import { optimizeImages } from 'next-universal-image-optimizer'

async function run() {
   await optimizeImages()
}
run().catch(err => {
   console.error('Failed to optimize images:', err)
   process.exit(1)
})
```

Without arguments, it defaults to `nuio.config.ts`.

You can override defaults:

```typescript
await optimizeImages({
   inputPaths: ['https://example.com/another-remote.jpg'],
   outputPatterns: ['public/images/**/*.png'],
   widths: [320, 640],
   quality: 90
})
```

### 3. Integrating with Next.js

If you're using `next export`:

1. Add `optimizeImages` after `next export`:
   ```json
   {
      "scripts": {
         "prebuild": "node scripts/fetch-images.js",
         "build": "next build && next export && node scripts/post-export-optimize.js"
      }
   }
   ```

2. In `scripts/post-export-optimize.js`:
   ```typescript
   import { optimizeImages } from 'next-universal-image-optimizer'

   async function postExport() {
      await optimizeImages()
      console.log('Images optimized successfully!')
   }
   postExport().catch(console.error)
   ```

3. After export, `out/images` contains optimized images. Reference them directly in your static HTML.

### 4. Testing

Use Jest or another test runner. See `test/index.test.ts` for mocking and verification examples.

### 5. Advanced Usage

- **External Image Lists**: Fetch URLs from a CMS before build and pass them to `optimizeImages`.
- **Formats**: By default outputs `.webp`. Adjust code or config to use other sharp-supported formats.

### Contributing

Contributions are welcome! Open issues or PRs on GitHub. For feature requests, describe your use case and desired outcome.

### License

MIT License
