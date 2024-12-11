import React, { ImgHTMLAttributes } from 'react'
import config from '../../nuio.config'

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
	baseName: string
	alt: string
	widths: number[]
}

export function Image({ baseName, alt, widths, ...imgProps }: ImageProps) {
	const runtimeEnvMode = process.env.ENV_MODE || config.envMode

	let basePath: string
	if (runtimeEnvMode === 'prod') {
		// In production mode, convert outputDir (e.g. './out/images') to '/out/images'.
		basePath = config.outputDir.replace(/^\.\/?/, '/')
	} else {
		// In development mode, use '/public/images'.
		basePath = '/public/images'
	}

	const srcset = widths
		.map((w) => `${basePath}/${baseName}-${w}.webp ${w}w`)
		.join(', ')

	const defaultSrc = `${basePath}/${baseName}-${widths[0]}.webp`

	return (
		<picture>
			<source srcSet={srcset} type="image/webp" />
			<img src={defaultSrc} alt={alt} {...imgProps} />
		</picture>
	)
}
