export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url)
  const address = requestUrl.searchParams.get('address')?.trim() ?? ''

  if (address.length < 5 || address.length > 200) {
    return Response.json({ error: 'Enter a valid address.' }, { status: 400 })
  }

  const censusUrl = new URL(
    'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress',
  )
  censusUrl.searchParams.set('address', address)
  censusUrl.searchParams.set('benchmark', 'Public_AR_Current')
  censusUrl.searchParams.set('format', 'json')

  const upstream = await fetch(censusUrl, {
    headers: { Accept: 'application/json' },
  })

  if (!upstream.ok) {
    return Response.json({ error: 'Address verification is unavailable.' }, { status: 502 })
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, no-store',
    },
  })
}
