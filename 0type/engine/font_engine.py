# 0TYPE Font Generation Engine
# ═══════════════════════════════════════════════════
# 
# This is the core engine that transforms AI-designed glyphs
# into production-ready font files. The B0B creative team
# designs the curves, this engine compiles them.
#
# Output formats: .otf, .ttf, .woff, .woff2

from fontTools.fontBuilder import FontBuilder
from fontTools.ttLib import TTFont
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.designspaceLib import DesignSpaceDocument, AxisDescriptor, SourceDescriptor
from fontTools.varLib import build as buildVF
from fontTools import subset
import json
import os
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path

@dataclass
class GlyphDesign:
    """A single glyph designed by a B0B creative agent"""
    name: str
    unicode: int
    width: int
    contours: List[List[Tuple[str, float, float]]]  # [(command, x, y), ...]
    designer_id: str
    created_at: str
    iterations: int

@dataclass
class FontProject:
    """A complete font project from the creative team"""
    id: str
    name: str
    family: str
    style: str
    version: str
    lead_designer: str
    team: List[str]
    units_per_em: int
    ascender: int
    descender: int
    cap_height: int
    x_height: int
    glyphs: Dict[str, GlyphDesign]
    kerning: Dict[str, Dict[str, int]]
    created_at: str
    status: str  # 'designing' | 'refining' | 'testing' | 'released'


class FontEngine:
    """
    The 0TYPE Font Generation Engine
    
    Takes designs from B0B creative agents and compiles them
    into production-ready font files.
    """
    
    def __init__(self, output_dir: str = "./fonts"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def build_font(self, project: FontProject) -> Dict[str, str]:
        """
        Build all font formats from a FontProject
        Returns paths to generated files
        """
        
        # Create FontBuilder
        fb = FontBuilder(project.units_per_em, isTTF=False)  # CFF outlines
        
        # Set naming
        fb.setupNameTable({
            "familyName": project.family,
            "styleName": project.style,
            "uniqueFontIdentifier": f"0TYPE;{project.family}-{project.style};{project.version}",
            "fullName": f"{project.family} {project.style}",
            "version": f"Version {project.version}",
            "psName": f"{project.family}-{project.style}".replace(" ", ""),
            "manufacturer": "0TYPE — Autonomous Typography by B0B",
            "designer": f"B0B Creative Team: {', '.join(project.team)}",
            "vendorURL": "https://0type.b0b.dev",
            "designerURL": "https://b0b.dev",
            "licenseDescription": "Licensed under 0TYPE Terms",
            "licenseInfoURL": "https://0type.b0b.dev/license",
        })
        
        # Build glyphs
        glyph_order = [".notdef"] + list(project.glyphs.keys())
        char_strings = {}
        
        for glyph_name, glyph in project.glyphs.items():
            pen = T2CharStringPen(glyph.width, None)
            self._draw_glyph(pen, glyph)
            char_strings[glyph_name] = pen.getCharString()
        
        # Add .notdef
        notdef_pen = T2CharStringPen(project.units_per_em // 2, None)
        char_strings[".notdef"] = notdef_pen.getCharString()
        
        fb.setupGlyphOrder(glyph_order)
        fb.setupCharacterMap({g.unicode: g.name for g in project.glyphs.values() if g.unicode})
        
        # Setup CFF
        fb.setupCFF(
            char_strings,
            {
                "FullName": f"{project.family} {project.style}",
                "FamilyName": project.family,
                "Weight": project.style,
            }
        )
        
        # Metrics
        metrics = {name: (g.width, 0) for name, g in project.glyphs.items()}
        metrics[".notdef"] = (project.units_per_em // 2, 0)
        fb.setupHorizontalMetrics(metrics)
        
        fb.setupHorizontalHeader(
            ascent=project.ascender,
            descent=project.descender
        )
        
        fb.setupOS2(
            sTypoAscender=project.ascender,
            sTypoDescender=project.descender,
            sCapHeight=project.cap_height,
            sxHeight=project.x_height,
            usWeightClass=400,
        )
        
        fb.setupPost()
        
        # Build kerning if present
        if project.kerning:
            self._setup_kerning(fb, project.kerning)
        
        # Save OTF
        font = fb.font
        base_name = f"{project.family}-{project.style}".replace(" ", "")
        
        outputs = {}
        
        # OTF
        otf_path = self.output_dir / f"{base_name}.otf"
        font.save(str(otf_path))
        outputs['otf'] = str(otf_path)
        
        # TTF (convert)
        ttf_path = self.output_dir / f"{base_name}.ttf"
        ttf_font = self._convert_to_ttf(font)
        ttf_font.save(str(ttf_path))
        outputs['ttf'] = str(ttf_path)
        
        # WOFF
        woff_path = self.output_dir / f"{base_name}.woff"
        font.flavor = 'woff'
        font.save(str(woff_path))
        outputs['woff'] = str(woff_path)
        
        # WOFF2
        woff2_path = self.output_dir / f"{base_name}.woff2"
        font.flavor = 'woff2'
        font.save(str(woff2_path))
        outputs['woff2'] = str(woff2_path)
        
        return outputs
    
    def _draw_glyph(self, pen: T2CharStringPen, glyph: GlyphDesign):
        """Draw glyph contours to pen"""
        for contour in glyph.contours:
            started = False
            for cmd, x, y in contour:
                if cmd == 'M':  # moveTo
                    if started:
                        pen.closePath()
                    pen.moveTo((x, y))
                    started = True
                elif cmd == 'L':  # lineTo
                    pen.lineTo((x, y))
                elif cmd == 'C':  # curveTo (cubic bezier)
                    # Assuming next two points are control points
                    pen.curveTo((x, y))
                elif cmd == 'Q':  # qCurveTo (quadratic)
                    pen.qCurveTo((x, y))
            if started:
                pen.closePath()
    
    def _setup_kerning(self, fb: FontBuilder, kerning: Dict[str, Dict[str, int]]):
        """Setup kerning table"""
        kern_pairs = []
        for left, rights in kerning.items():
            for right, value in rights.items():
                kern_pairs.append((left, right, value))
        
        if kern_pairs:
            fb.setupKerning({(l, r): v for l, r, v in kern_pairs})
    
    def _convert_to_ttf(self, otf_font: TTFont) -> TTFont:
        """Convert CFF to TrueType outlines"""
        # Simplified - in production would use cu2qu for proper conversion
        ttf = TTFont()
        for table in otf_font.keys():
            if table not in ['CFF ', 'CFF2']:
                ttf[table] = otf_font[table]
        return ttf


class CreativeSession:
    """
    A live session where B0B agents design glyphs
    Tracks progress, iterations, and outputs
    """
    
    def __init__(self, project_id: str, lead_designer: str):
        self.project_id = project_id
        self.lead_designer = lead_designer
        self.started_at = datetime.utcnow().isoformat()
        self.glyphs_designed: List[GlyphDesign] = []
        self.current_glyph: Optional[str] = None
        self.iterations = 0
        self.status = "initializing"
        self.observers: List[callable] = []
    
    def subscribe(self, callback: callable):
        """Subscribe to design updates"""
        self.observers.append(callback)
    
    def emit(self, event: str, data: dict):
        """Emit event to all observers"""
        for observer in self.observers:
            observer(event, data)
    
    def start_glyph(self, glyph_name: str):
        """Start designing a new glyph"""
        self.current_glyph = glyph_name
        self.status = "designing"
        self.emit("glyph_started", {
            "glyph": glyph_name,
            "designer": self.lead_designer,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def update_glyph(self, contours: List, iteration: int):
        """Update current glyph design"""
        self.iterations = iteration
        self.emit("glyph_updated", {
            "glyph": self.current_glyph,
            "contours": contours,
            "iteration": iteration,
            "timestamp": datetime.utcnow().isoformat()
        })
    
    def complete_glyph(self, glyph: GlyphDesign):
        """Mark glyph as complete"""
        self.glyphs_designed.append(glyph)
        self.emit("glyph_completed", {
            "glyph": glyph.name,
            "iterations": glyph.iterations,
            "designer": glyph.designer_id,
            "timestamp": datetime.utcnow().isoformat()
        })
        self.current_glyph = None


# Example usage / test
if __name__ == "__main__":
    # This would be called by the AI agents
    engine = FontEngine("./output")
    
    # Simple test glyph (letter 'l')
    test_glyph = GlyphDesign(
        name="l",
        unicode=ord('l'),
        width=280,
        contours=[[
            ('M', 60, 0),
            ('L', 60, 700),
            ('L', 140, 700),
            ('L', 140, 0),
            ('L', 60, 0),
        ]],
        designer_id="m0n0",
        created_at=datetime.utcnow().isoformat(),
        iterations=12
    )
    
    print("0TYPE Font Engine initialized")
    print(f"Output directory: {engine.output_dir}")
    print("Ready to compile B0B designs into production fonts.")
