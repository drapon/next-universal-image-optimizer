import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'
import fg from 'fast-glob'
import { loadConfig } from './utils/configLoader'
import { OptimizeOptions } from './types/optimizeOptions'

export async function optimizeImages(options?: Partial<OptimizeOptions>) {
  const config = await loadConfig()

  const mergedOptions = {
    ...config,
    ...options,
  } as OptimizeOptions

  const {
    inputPaths = [],
    outputPatterns = [],
    outputDir,
    modes = ['widths'],
    widths = [640, 1280, 1920],
    scales = {},
    quality = 80,
  } = mergedOptions

  await fs.mkdir(outputDir, { recursive: true })

  let allPaths = [...inputPaths]
  for (const pattern of outputPatterns) {
    const matchedFiles = await fg(pattern, { cwd: process.cwd() })
    allPaths = allPaths.concat(matchedFiles)
  }

  const uniquePaths = Array.from(new Set(allPaths))

  for (const inputPath of uniquePaths) {
    let buffer: Buffer

    if (inputPath.startsWith('http://') || inputPath.startsWith('https://')) {
      const res = await fetch(inputPath)
      if (!res.ok) {
        console.error(`Failed to fetch ${inputPath}, status: ${res.status}`)
        continue
      }
      buffer = Buffer.from(await res.arrayBuffer())
    } else {
      const localPath = path.join(process.cwd(), inputPath)
      buffer = await fs.readFile(localPath)
    }

    const baseName = path.basename(inputPath, path.extname(inputPath))
    const metadata = await sharp(buffer).metadata()
    const originalWidth = metadata.width || 0

    for (const mode of modes) {
      if (mode === 'widths') {
        for (const w of widths) {
          const outputFileName = `${baseName}-${w}.webp`
          const outputFilePath = path.join(outputDir, outputFileName)

          const optimizedBuffer = await sharp(buffer)
            .resize(w)
            .webp({ quality })
            .toBuffer()

          await fs.writeFile(outputFilePath, optimizedBuffer)
          console.log(`Optimized image saved: ${outputFilePath}`)
        }
      } else if (mode === 'scales') {
        for (const [suffix, factor] of Object.entries(scales)) {
          const targetWidth = Math.round(originalWidth * factor)
          const outputFileName = `${baseName}${suffix}.webp`
          const outputFilePath = path.join(outputDir, outputFileName)

          const optimizedBuffer = await sharp(buffer)
            .resize(targetWidth)
            .webp({ quality })
            .toBuffer()

          await fs.writeFile(outputFilePath, optimizedBuffer)
          console.log(
            `Optimized image saved: ${outputFilePath} (width: ${targetWidth})`,
          )
        }
      }
    }
  }
}
