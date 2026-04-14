export const getRealIp = (request: Request): string => {
    return (
        request.headers.get('cf-connecting-ip') ||
        request.headers.get('x-real-ip') ||
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        'unknown'
    )
}

export const handleIpRequest = (request: Request): Response => {
    const real = getRealIp(request)
    return new Response(`${real}\n`, {
        headers: {
            'Content-Type': 'text/plain',
        },
    })
}

export const handleJsonHeadersRequest = (request: Request): Response => {
    const headerObject = Object.fromEntries(request.headers.entries())
    console.log(headerObject)
    return new Response(JSON.stringify(headerObject, null, 2), {
        headers: {
            'Content-Type': 'application/json',
        },
    })
}

export const handleTextHeadersRequest = (request: Request): Response => {
    const arr = [...request.headers.entries()].map(([key, val]) => `${key}: ${val}`)
    return new Response(`${arr.join('\n')}\n`, {
        headers: {
            'Content-Type': 'text/plain',
        },
    })
}

export const handleNotFound = (): Response => new Response('Not Found', { status: 404 })
