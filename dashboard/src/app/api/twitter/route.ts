import { NextResponse } from 'next/server';

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || '';

export async function GET() {
  if (!TWITTER_BEARER_TOKEN) {
    return NextResponse.json({
      success: false,
      error: 'No Twitter bearer token configured'
    }, { status: 500 });
  }

  try {
    // Crypto influencers to monitor
    const accounts = [
      'VitalikButerin',
      'coinbase',
      'base',
      'CoinDesk',
      'DefiLlama'
    ];

    // Search for recent crypto tweets
    const query = 'crypto OR ethereum OR base -is:retweet lang:en';
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=10&tweet.fields=created_at,author_id,public_metrics`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Twitter API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      tweets: data.data || [],
      meta: data.meta || {}
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
