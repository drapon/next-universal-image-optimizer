export interface OptimizeOptions {
  inputPaths?: string[]
  outputPatterns?: string[]
  outputDir: string
  widths?: number[]
  quality?: number
  modes?: Array<'widths' | 'scales'>
  scales?: Record<string, number>
}
