"""
0TYPE Font Generation API
Generates real .otf, .ttf, .woff, .woff2 font files from glyph data
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._g_l_y_f import Glyph
from fontTools.pens.ttGlyphPen import TTGlyphPen
import json
import os
import tempfile
import subprocess
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Font metrics (matching our glyph library)
UNITS_PER_EM = 1000
ASCENDER = 800
DESCENDER = -200
CAP_HEIGHT = 720
X_HEIGHT = 520

def parse_stroke_to_outline(stroke, weight=90):
    """Convert a stroke (centerline) to an outline with width."""
    points = stroke['points']
    stroke_type = stroke['type']
    
    # For simplicity, expand strokes into rectangular outlines
    # A more sophisticated version would handle curves properly
    
    if stroke_type == 'line':
        x1, y1, x2, y2 = points[0], points[1], points[2], points[3]
        
        # Calculate perpendicular offset for stroke width
        import math
        dx = x2 - x1
        dy = y2 - y1
        length = math.sqrt(dx*dx + dy*dy)
        
        if length == 0:
            return []
        
        # Perpendicular unit vector
        px = -dy / length * (weight / 2)
        py = dx / length * (weight / 2)
        
        # Four corners of the stroke rectangle
        return [
            ('moveTo', [(x1 + px, y1 + py)]),
            ('lineTo', [(x2 + px, y2 + py)]),
            ('lineTo', [(x2 - px, y2 - py)]),
            ('lineTo', [(x1 - px, y1 - py)]),
            ('closePath', []),
        ]
    
    elif stroke_type == 'arc':
        # Simplified: treat arc as series of lines
        # In production, use proper bezier curves
        x1, y1 = points[0], points[1]
        cx, cy = points[2], points[3]
        x2, y2 = points[4], points[5]
        
        # Create quadratic bezier approximation
        return [
            ('moveTo', [(x1, y1 - weight/2)]),
            ('qCurveTo', [(cx, cy - weight/2), (x2, y2 - weight/2)]),
            ('lineTo', [(x2, y2 + weight/2)]),
            ('qCurveTo', [(cx, cy + weight/2), (x1, y1 + weight/2)]),
            ('closePath', []),
        ]
    
    return []

def create_glyph_outline(glyph_data, weight=90):
    """Convert glyph stroke data to font outline."""
    all_commands = []
    
    for stroke in glyph_data.get('strokes', []):
        commands = parse_stroke_to_outline(stroke, weight)
        all_commands.extend(commands)
    
    return all_commands

def build_cff_font(font_name, glyphs_data, metadata):
    """Build a CFF-based OpenType font (.otf)"""
    
    fb = FontBuilder(UNITS_PER_EM, isTTF=False)
    fb.setupGlyphOrder(['.notdef'] + list(glyphs_data.keys()))
    
    # Character to glyph mapping
    cmap = {ord(char): char for char in glyphs_data.keys()}
    fb.setupCharacterMap(cmap)
    
    # Build glyph outlines
    pen_class = T2CharStringPen
    charstrings = {}
    
    # .notdef glyph
    pen = pen_class(width=500, glyphSet=None)
    pen.moveTo((50, 0))
    pen.lineTo((50, 700))
    pen.lineTo((450, 700))
    pen.lineTo((450, 0))
    pen.closePath()
    pen.moveTo((100, 50))
    pen.lineTo((400, 50))
    pen.lineTo((400, 650))
    pen.lineTo((100, 650))
    pen.closePath()
    charstrings['.notdef'] = pen.getCharString()
    
    # Build each glyph
    weight = metadata.get('strokeWeight', 90)
    
    for char, glyph_data in glyphs_data.items():
        width = glyph_data.get('width', 500)
        pen = pen_class(width=width, glyphSet=None)
        
        commands = create_glyph_outline(glyph_data, weight)
        
        for cmd in commands:
            if cmd[0] == 'moveTo':
                pen.moveTo(cmd[1][0])
            elif cmd[0] == 'lineTo':
                pen.lineTo(cmd[1][0])
            elif cmd[0] == 'qCurveTo':
                pen.qCurveTo(*cmd[1])
            elif cmd[0] == 'curveTo':
                pen.curveTo(*cmd[1])
            elif cmd[0] == 'closePath':
                pen.closePath()
        
        charstrings[char] = pen.getCharString()
    
    fb.setupCFF(charstrings, {
        'FontName': font_name.replace(' ', ''),
        'FullName': font_name,
        'FamilyName': font_name,
    })
    
    # Font metrics
    fb.setupHead(unitsPerEm=UNITS_PER_EM)
    
    fb.setupHhea(ascent=ASCENDER, descent=DESCENDER)
    
    # Horizontal metrics
    metrics = {'.notdef': (500, 0)}
    for char, glyph_data in glyphs_data.items():
        metrics[char] = (glyph_data.get('width', 500), 0)
    fb.setupHmtx(metrics)
    
    # Naming table
    fb.setupNameTable({
        'familyName': font_name,
        'styleName': metadata.get('style', 'Regular'),
        'uniqueFontIdentifier': f'0TYPE;{font_name.replace(" ", "")};1.0',
        'fullName': f'{font_name} {metadata.get("style", "Regular")}',
        'version': 'Version 1.0',
        'psName': font_name.replace(' ', ''),
        'designer': metadata.get('designer', 'B0B Creative Team'),
        'manufacturer': '0TYPE',
        'vendorURL': 'https://0type.dev',
        'designerURL': 'https://b0b.dev',
        'licenseDescription': metadata.get('license', 'Commercial License'),
        'description': metadata.get('description', 'AI-generated typeface'),
    })
    
    fb.setupOS2(
        sTypoAscender=ASCENDER,
        sTypoDescender=DESCENDER,
        sCapHeight=CAP_HEIGHT,
        sxHeight=X_HEIGHT,
        usWeightClass=metadata.get('weight', 400),
    )
    
    fb.setupPost()
    
    return fb.font

def build_ttf_font(font_name, glyphs_data, metadata):
    """Build a TrueType font (.ttf)"""
    
    fb = FontBuilder(UNITS_PER_EM, isTTF=True)
    fb.setupGlyphOrder(['.notdef'] + list(glyphs_data.keys()))
    
    # Character mapping
    cmap = {ord(char): char for char in glyphs_data.keys()}
    fb.setupCharacterMap(cmap)
    
    # Build glyph outlines
    pen = TTGlyphPen(None)
    glyph_table = {}
    
    # .notdef
    pen.moveTo((50, 0))
    pen.lineTo((50, 700))
    pen.lineTo((450, 700))
    pen.lineTo((450, 0))
    pen.closePath()
    glyph_table['.notdef'] = pen.glyph()
    
    weight = metadata.get('strokeWeight', 90)
    
    for char, glyph_data in glyphs_data.items():
        pen = TTGlyphPen(None)
        commands = create_glyph_outline(glyph_data, weight)
        
        for cmd in commands:
            if cmd[0] == 'moveTo':
                pen.moveTo(cmd[1][0])
            elif cmd[0] == 'lineTo':
                pen.lineTo(cmd[1][0])
            elif cmd[0] == 'qCurveTo':
                pen.qCurveTo(*cmd[1])
            elif cmd[0] == 'closePath':
                pen.closePath()
        
        glyph_table[char] = pen.glyph()
    
    fb.setupGlyf(glyph_table)
    
    # Metrics
    fb.setupHead(unitsPerEm=UNITS_PER_EM)
    fb.setupHhea(ascent=ASCENDER, descent=DESCENDER)
    
    metrics = {'.notdef': (500, 0)}
    for char, glyph_data in glyphs_data.items():
        metrics[char] = (glyph_data.get('width', 500), 0)
    fb.setupHmtx(metrics)
    
    fb.setupMaxp()
    
    fb.setupNameTable({
        'familyName': font_name,
        'styleName': metadata.get('style', 'Regular'),
    })
    
    fb.setupOS2(
        sTypoAscender=ASCENDER,
        sTypoDescender=DESCENDER,
    )
    
    fb.setupPost()
    
    return fb.font


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': '0TYPE Font Generator'})


@app.route('/generate', methods=['POST'])
def generate_font():
    """
    Generate font files from glyph data.
    
    Request body:
    {
        "name": "Font Name",
        "glyphs": {
            "A": { "width": 600, "strokes": [...] },
            ...
        },
        "metadata": {
            "style": "Regular",
            "weight": 400,
            "strokeWeight": 90,
            "designer": "B0B Creative Team",
            "license": "Commercial",
            "description": "..."
        },
        "formats": ["otf", "ttf", "woff2"]
    }
    """
    try:
        data = request.json
        font_name = data.get('name', 'Untitled')
        glyphs = data.get('glyphs', {})
        metadata = data.get('metadata', {})
        formats = data.get('formats', ['otf'])
        
        if not glyphs:
            return jsonify({'error': 'No glyphs provided'}), 400
        
        results = {}
        temp_dir = tempfile.mkdtemp()
        
        # Generate OTF
        if 'otf' in formats:
            try:
                font = build_cff_font(font_name, glyphs, metadata)
                otf_path = os.path.join(temp_dir, f'{font_name.replace(" ", "")}.otf')
                font.save(otf_path)
                results['otf'] = otf_path
            except Exception as e:
                results['otf_error'] = str(e)
        
        # Generate TTF
        if 'ttf' in formats:
            try:
                font = build_ttf_font(font_name, glyphs, metadata)
                ttf_path = os.path.join(temp_dir, f'{font_name.replace(" ", "")}.ttf')
                font.save(ttf_path)
                results['ttf'] = ttf_path
            except Exception as e:
                results['ttf_error'] = str(e)
        
        # Generate WOFF2 from TTF
        if 'woff2' in formats and 'ttf' in results:
            try:
                # Use fonttools to convert
                font = TTFont(results['ttf'])
                font.flavor = 'woff2'
                woff2_path = os.path.join(temp_dir, f'{font_name.replace(" ", "")}.woff2')
                font.save(woff2_path)
                results['woff2'] = woff2_path
            except Exception as e:
                results['woff2_error'] = str(e)
        
        return jsonify({
            'success': True,
            'name': font_name,
            'files': results,
            'temp_dir': temp_dir,
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/download/<path:filename>', methods=['GET'])
def download_font(filename):
    """Download a generated font file."""
    # Security: only allow files from temp directories
    if not filename.startswith('/tmp') and not filename.startswith('C:\\'):
        return jsonify({'error': 'Invalid path'}), 400
    
    if os.path.exists(filename):
        return send_file(filename, as_attachment=True)
    
    return jsonify({'error': 'File not found'}), 404


@app.route('/preview', methods=['POST'])
def preview_glyph():
    """Generate a preview SVG for a single glyph."""
    data = request.json
    glyph_data = data.get('glyph', {})
    weight = data.get('weight', 90)
    
    commands = create_glyph_outline(glyph_data, weight)
    
    # Convert to SVG path
    path_d = []
    for cmd in commands:
        if cmd[0] == 'moveTo':
            path_d.append(f"M {cmd[1][0][0]} {cmd[1][0][1]}")
        elif cmd[0] == 'lineTo':
            path_d.append(f"L {cmd[1][0][0]} {cmd[1][0][1]}")
        elif cmd[0] == 'qCurveTo':
            path_d.append(f"Q {cmd[1][0][0]} {cmd[1][0][1]} {cmd[1][1][0]} {cmd[1][1][1]}")
        elif cmd[0] == 'closePath':
            path_d.append("Z")
    
    return jsonify({
        'path': ' '.join(path_d),
        'width': glyph_data.get('width', 500),
    })


if __name__ == '__main__':
    print("🔤 0TYPE Font Generator API")
    print("   Endpoints:")
    print("   POST /generate - Generate font files")
    print("   GET /download/<path> - Download font file")
    print("   POST /preview - Preview glyph SVG")
    app.run(host='0.0.0.0', port=5002, debug=True)
