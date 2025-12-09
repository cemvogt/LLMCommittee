import { NextRequest, NextResponse } from 'next/server';
import { runCommittee } from '@/lib/council';
import { DEFAULT_COMMITTEE, validateCommittee } from '@/lib/config';
import { LLMConfig } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes max for long committee sessions

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, committee } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Use provided committee or default
    const committeeConfig: LLMConfig[] = committee || DEFAULT_COMMITTEE;

    // Validate committee configuration
    try {
      validateCommittee(committeeConfig);
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }

    // Run the committee process
    const result = await runCommittee(query, committeeConfig);

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
    console.error('Committee API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve committee configuration
export async function GET() {
  return NextResponse.json({
    defaultCommittee: DEFAULT_COMMITTEE,
  });
}
