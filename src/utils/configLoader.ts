import path from 'path'

const defaultConfig = {
  outputDir: 'out/images',
  inputPaths: ['public/images/**/*.{jpg,png}'],
  widths: [640, 1280, 1920],
  quality: 80,
  envMode: 'development',
}

export async function loadConfig() {
  const configPath = path.join(process.cwd(), 'nuio.config.cjs')
  try {
    const config = require(configPath)
    return { ...defaultConfig, ...config }
  } catch (error) {
    console.log(error)
    console.warn(
      'No configuration file found or failed to load. Using default settings.',
    )
    return defaultConfig
  }
}
