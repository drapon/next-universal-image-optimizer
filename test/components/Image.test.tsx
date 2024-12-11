/**
 * @jest-environment jsdom
 */
import React from 'react'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Image } from '../../src/components/Image'

jest.mock('../../nuio.config', () => {
	const originalConfig = jest.requireActual('../../nuio.config').default
	return {
		__esModule: true,
		default: {
			...originalConfig,
			envMode: 'development'
		}
	}
})

describe('Image component', () => {
	it('renders image with development basePath', () => {
		render(<Image baseName="hero-image" alt="Hero" widths={[640, 1280]} />)

		const img = screen.getByAltText('Hero') as HTMLImageElement
		expect(img).toBeInTheDocument()
		expect(img.src).toContain('/public/images/hero-image-640.webp')

		const picture = img.closest('picture')!
		const source = picture.querySelector('source') as HTMLSourceElement
		expect(source.srcset).toContain('/public/images/hero-image-640.webp 640w')
		expect(source.srcset).toContain('/public/images/hero-image-1280.webp 1280w')
	})

	it('renders image with production basePath', () => {
		jest.resetModules()
		jest.mock('../../nuio.config', () => {
			const originalConfig = jest.requireActual('../../nuio.config').default
			return {
				__esModule: true,
				default: {
					...originalConfig,
					envMode: 'prod'
				}
			}
		})

		const { Image: ProdImage } = require('../../src/components/Image')

		render(<ProdImage baseName="hero-image" alt="Hero" widths={[640, 1280]} />)

		const img = screen.getByAltText('Hero') as HTMLImageElement
		expect(img).toBeInTheDocument()
		expect(img.src).toContain('/out/images/hero-image-640.webp')
	})
})
