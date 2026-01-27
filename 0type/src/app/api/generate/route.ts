/**
 * 0TYPE Font Generation API Route
 * Proxies to Python FontTools backend or provides mock response
 */

import { NextRequest, NextResponse } from 'next/server';

const PYTHON_API = process.env.FONT_API_URL || 'http://localhost:5002';

interface GenerateRequest {
  name: string;
  glyphs: Record<string, {
    width: number;
    strokes: Array<{
      type: string;
      points: number[];
    }>;
  }>;
  metadata: {
    style?: string;
    designer?: string;
    brushCombo?: string;
    glyphStyle?: string;
  };
  formats: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    
    // Try Python API first
    try {
      const response = await fetch(`${PYTHON_API}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch {
      // Python API not available, use mock
    }
    
    // Mock response when Python API unavailable
    const fontId = `0type-${body.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      fontId,
      name: body.name,
      message: 'Font generation queued (mock mode)',
      files: body.formats.map(fmt => ({
        format: fmt,
        filename: `${body.name.replace(/\s+/g, '')}.${fmt}`,
        url: `/api/download/${fontId}/${body.name.replace(/\s+/g, '')}.${fmt}`,
        size: Math.floor(Math.random() * 50000) + 20000, // Mock file size
      })),
      metadata: {
        name: body.name,
        style: body.metadata.style || 'Regular',
        designer: body.metadata.designer || '0TYPE AI',
        glyphCount: Object.keys(body.glyphs).length,
        createdAt: new Date().toISOString(),
      },
      _mock: true,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate font', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check
  try {
    const response = await fetch(`${PYTHON_API}/health`);
    if (response.ok) {
      return NextResponse.json({ 
        status: 'ok', 
        backend: 'python',
        api: PYTHON_API 
      });
    }
  } catch {
    // Python not running
  }
  
  return NextResponse.json({ 
    status: 'ok', 
    backend: 'mock',
    message: 'Python API not available, using mock mode'
  });
}
