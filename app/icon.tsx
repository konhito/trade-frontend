import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'

// Image metadata - using maximum size for best quality
export const size = {
    width: 512,
    height: 512,
}
export const contentType = 'image/png'

// Generate favicon with logo filling entire space
export default async function Icon() {
    try {
        // Try to read the logo file from public folder
        const logoPath = path.join(process.cwd(), 'public', 'logo12.png')
        const logoBuffer = fs.readFileSync(logoPath)
        const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
        
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        padding: '0',
                        margin: '0',
                    }}
                >
                    <img
                        src={logoBase64}
                        alt="Logo"
                        width={512}
                        height={512}
                        style={{
                            width: '120%',
                            height: '120%',
                            objectFit: 'cover',
                            padding: '0',
                            margin: '0',
                        }}
                    />
                </div>
            ),
            { ...size }
        )
    } catch (error) {
        // Fallback if logo can't be loaded
        return new ImageResponse(
            (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#1f2937',
                    }}
                />
            ),
            { ...size }
        )
    }
}

