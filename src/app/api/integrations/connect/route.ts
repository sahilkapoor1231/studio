// This file is DEPRECATED and will be removed.
// The logic has been moved into server actions in `src/lib/data.ts`
// to align with modern Next.js best practices (avoids creating extra API endpoints).
// See `createIntegrationSetting` and `deleteIntegrationSetting` in `src/lib/data.ts`.

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    return NextResponse.json({ message: 'This endpoint is deprecated.' }, { status: 410 });
}
