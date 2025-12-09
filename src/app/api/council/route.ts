import { NextRequest, NextResponse } from 'next/server';
import { runCouncil } from '@/lib/council';
import { DEFAULT_COUNCIL, validateCouncil } from '@/lib/config';
import { LLMConfig } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for long council sessions

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, council } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Use provided council or default
    const councilConfig: LLMConfig[] = council || DEFAULT_COUNCIL;

    // Validate council configuration
    try {
      validateCouncil(councilConfig);
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }

    // Run the council process
    const result = await runCouncil(query, councilConfig);

    return NextResponse.json({
      success: true,
      query,
      stage1: {
        status: 'completed',
        responses: result.responses,
      },
      stage2: {
        status: 'completed',
        reviews: result.reviews,
      },
      stage3: {
        status: 'completed',
        finalResponse: result.finalResponse,
        chairmanId: result.chairman.id,
        chairmanName: result.chairman.name,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Council API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve council configuration
export async function GET() {
  return NextResponse.json({
    defaultCouncil: DEFAULT_COUNCIL,
  });
}
