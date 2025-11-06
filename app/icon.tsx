import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

// Image generation - Simple icon representation
export default async function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'white',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb',
                }}
            >
                {/* Simple representation - Next.js metadata will use logo12.png from public folder */}
                <div
                    style={{
                        width: '24px',
                        height: '24px',
                        background: '#1f2937',
                        borderRadius: '2px',
                    }}
                />
            </div>
        ),
        { ...size }
    )
}
