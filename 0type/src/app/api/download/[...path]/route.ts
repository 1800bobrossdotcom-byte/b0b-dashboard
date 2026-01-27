/**
 * 0TYPE Font Download API Route
 * Serves generated font files
 */

import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';

const PYTHON_API = process.env.FONT_API_URL || 'http://localhost:5002';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filePath = path.join('/');
  
  // Try Python API first
  try {
    const response = await fetch(`${PYTHON_API}/download/${filePath}`);
    
    if (response.ok) {
      const blob = await response.blob();
      const headers = new Headers();
      
      // Determine content type from extension
      const ext = filePath.split('.').pop()?.toLowerCase();
      const contentTypes: Record<string, string> = {
        'otf': 'font/otf',
        'ttf': 'font/ttf',
        'woff': 'font/woff',
        'woff2': 'font/woff2',
      };
      
      headers.set('Content-Type', contentTypes[ext || ''] || 'application/octet-stream');
      headers.set('Content-Disposition', `attachment; filename="${filePath.split('/').pop()}"`);
      
      return new NextResponse(blob, { headers });
    }
  } catch {
    // Python API not available
  }
  
  // Mock: return a placeholder response
  return NextResponse.json(
    { 
      error: 'Font file not found',
      message: 'Start Python API: cd 0type/api && python font_generator.py',
      requestedPath: filePath
    },
    { status: 404 }
  );
}
