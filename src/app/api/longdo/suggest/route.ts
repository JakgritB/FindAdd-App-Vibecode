import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get('keyword');
  const area = searchParams.get('area');

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
  }

  const apiKey = process.env.LONGDO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const params = new URLSearchParams({
      keyword,
      key: apiKey,
      limit: '10'
    });

    if (area) {
      params.append('area', area);
    }

    const response = await fetch(
      `https://search.longdo.com/mapsearch/json/suggest?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Longdo API');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Suggest API error:', error);
    return NextResponse.json(
      { error: 'Failed to get suggestions' },
      { status: 500 }
    );
  }
}