# 0TYPE Creative Agent API
# ═══════════════════════════════════════════════════
#
# WebSocket API for live font creation sessions
# Streams glyph design progress to subscribers

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from typing import Dict, List, Optional
from datetime import datetime
from pathlib import Path
import asyncio
import json
import base64
import random

app = FastAPI(
    title="0TYPE Creative API",
    description="Watch B0B agents design fonts in real-time",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ═══════════════════════════════════════════════════
# CREATIVE TEAM (mirrors frontend)
# ═══════════════════════════════════════════════════

CREATIVE_TEAM = {
    "b0b-prime": {
        "name": "B0B Prime",
        "role": "Creative Director",
        "status": "reviewing",
        "color": "#FFFFFF",
    },
    "glitch": {
        "name": "GL1TCH",
        "role": "Experimental Lead", 
        "status": "creating",
        "color": "#00FF41",
    },
    "mono": {
        "name": "M0N0",
        "role": "Technical Specialist",
        "status": "creating",
        "color": "#F5A623",
    },
    "sakura": {
        "name": "S4KURA",
        "role": "Display Designer",
        "status": "thinking",
        "color": "#FF6B9D",
    },
    "phantom": {
        "name": "PH4NT0M",
        "role": "Sans-Serif Specialist",
        "status": "creating",
        "color": "#888888",
    },
    "redux": {
        "name": "R3DUX",
        "role": "Revival Specialist",
        "status": "idle",
        "color": "#C9A962",
    },
}

# ═══════════════════════════════════════════════════
# LIVE SESSIONS
# ═══════════════════════════════════════════════════

class LiveSession:
    """A live font creation session"""
    
    def __init__(self, session_id: str, font_project: str, lead: str):
        self.id = session_id
        self.font_project = font_project
        self.lead = lead
        self.started_at = datetime.utcnow()
        self.subscribers: List[WebSocket] = []
        self.current_glyph: Optional[str] = None
        self.current_contours: List = []
        self.iteration = 0
        self.glyphs_completed: List[str] = []
        self.inspirations: List[dict] = []  # User-submitted inspiration
        self.status = "active"
    
    async def broadcast(self, message: dict):
        """Send message to all subscribers"""
        dead = []
        for ws in self.subscribers:
            try:
                await ws.send_json(message)
            except:
                dead.append(ws)
        for ws in dead:
            self.subscribers.remove(ws)
    
    async def add_inspiration(self, data: dict):
        """Add user inspiration to the session"""
        self.inspirations.append({
            **data,
            "received_at": datetime.utcnow().isoformat(),
        })
        await self.broadcast({
            "type": "inspiration_received",
            "data": data,
        })


# Active sessions
sessions: Dict[str, LiveSession] = {}

# Current simulation session
current_session: Optional[LiveSession] = None


# ═══════════════════════════════════════════════════
# GLYPH GENERATION SIMULATION
# ═══════════════════════════════════════════════════

def generate_glyph_contours(char: str, iteration: int, style: str = "mono") -> List:
    """
    Simulate AI glyph generation
    Returns bezier contours that evolve over iterations
    
    In production, this would be the actual AI model output
    """
    
    # Base templates for common characters
    templates = {
        'A': [
            [('M', 0, 0), ('L', 300, 700), ('L', 600, 0), ('L', 480, 0), 
             ('L', 400, 200), ('L', 200, 200), ('L', 120, 0), ('L', 0, 0)],
            [('M', 220, 280), ('L', 300, 500), ('L', 380, 280), ('L', 220, 280)],
        ],
        'B': [
            [('M', 80, 0), ('L', 80, 700), ('L', 380, 700), ('C', 500, 700), 
             ('C', 500, 400), ('L', 350, 400), ('L', 350, 350), ('L', 400, 350),
             ('C', 520, 350), ('C', 520, 0), ('L', 80, 0)],
        ],
        'g': [
            [('M', 400, 500), ('C', 400, 520), ('C', 100, 520), ('C', 100, 280),
             ('C', 100, 40), ('C', 400, 40), ('L', 400, -100), ('C', 400, -200),
             ('C', 100, -200), ('L', 100, -150), ('L', 320, -150), ('C', 320, -100),
             ('L', 320, 0), ('C', 200, 0), ('C', 180, 280), ('C', 180, 500),
             ('C', 320, 500), ('L', 320, 500)],
        ],
    }
    
    # Get template or generate procedural
    if char in templates:
        base = templates[char]
    else:
        # Procedural generation for unknown chars
        base = [[
            ('M', 50, 0),
            ('L', 50, 500),
            ('L', 350, 500),
            ('L', 350, 0),
            ('L', 50, 0),
        ]]
    
    # Apply iteration-based refinement (simulates AI learning)
    noise_factor = max(0, 50 - iteration * 5)  # Decreases with iterations
    
    refined = []
    for contour in base:
        refined_contour = []
        for point in contour:
            cmd, x, y = point
            # Add decreasing noise as iterations increase
            if noise_factor > 0 and cmd != 'M':
                x += random.uniform(-noise_factor, noise_factor)
                y += random.uniform(-noise_factor, noise_factor)
            refined_contour.append((cmd, round(x, 1), round(y, 1)))
        refined.append(refined_contour)
    
    return refined


async def simulate_design_session(session: LiveSession):
    """
    Simulate a B0B agent designing glyphs in real-time
    Broadcasts progress to all subscribers
    """
    
    glyphs_to_design = list("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789")
    
    for glyph in glyphs_to_design:
        if session.status != "active":
            break
            
        session.current_glyph = glyph
        session.iteration = 0
        
        # Announce starting glyph
        await session.broadcast({
            "type": "glyph_started",
            "glyph": glyph,
            "designer": session.lead,
            "timestamp": datetime.utcnow().isoformat(),
        })
        
        # Iterate on the design (8-15 iterations per glyph)
        num_iterations = random.randint(8, 15)
        
        for i in range(num_iterations):
            if session.status != "active":
                break
                
            session.iteration = i + 1
            contours = generate_glyph_contours(glyph, i + 1)
            session.current_contours = contours
            
            # Broadcast progress
            await session.broadcast({
                "type": "glyph_progress",
                "glyph": glyph,
                "contours": contours,
                "iteration": i + 1,
                "max_iterations": num_iterations,
                "designer": session.lead,
                "timestamp": datetime.utcnow().isoformat(),
            })
            
            # Simulate thinking time (faster for later iterations)
            await asyncio.sleep(0.3 + random.uniform(0, 0.5) * (1 - i/num_iterations))
        
        # Mark glyph complete
        session.glyphs_completed.append(glyph)
        
        await session.broadcast({
            "type": "glyph_completed",
            "glyph": glyph,
            "final_contours": session.current_contours,
            "iterations": session.iteration,
            "designer": session.lead,
            "total_completed": len(session.glyphs_completed),
            "timestamp": datetime.utcnow().isoformat(),
        })
        
        # Brief pause between glyphs
        await asyncio.sleep(0.5 + random.uniform(0, 1))
    
    # Session complete
    session.status = "completed"
    await session.broadcast({
        "type": "session_completed",
        "glyphs_completed": session.glyphs_completed,
        "total": len(session.glyphs_completed),
        "duration": (datetime.utcnow() - session.started_at).total_seconds(),
    })


# ═══════════════════════════════════════════════════
# API ROUTES
# ═══════════════════════════════════════════════════

@app.get("/")
async def root():
    return {
        "name": "0TYPE Creative API",
        "version": "1.0.0",
        "status": "operational",
        "team_size": len(CREATIVE_TEAM),
        "active_sessions": len([s for s in sessions.values() if s.status == "active"]),
    }


@app.get("/team")
async def get_team():
    """Get all creative team members"""
    return CREATIVE_TEAM


@app.get("/team/{bot_id}")
async def get_team_member(bot_id: str):
    """Get specific team member"""
    if bot_id not in CREATIVE_TEAM:
        raise HTTPException(status_code=404, detail="Bot not found")
    return CREATIVE_TEAM[bot_id]


@app.post("/sessions/start")
async def start_session(font_project: str = "MILSPEC Mono", lead: str = "mono"):
    """Start a new live design session"""
    global current_session
    
    session_id = f"session-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
    session = LiveSession(session_id, font_project, lead)
    sessions[session_id] = session
    current_session = session
    
    # Start simulation in background
    asyncio.create_task(simulate_design_session(session))
    
    return {
        "session_id": session_id,
        "font_project": font_project,
        "lead": lead,
        "status": "started",
        "websocket_url": f"/ws/session/{session_id}",
    }


@app.websocket("/ws/session/{session_id}")
async def websocket_session(websocket: WebSocket, session_id: str):
    """WebSocket for live session updates"""
    await websocket.accept()
    
    if session_id not in sessions:
        await websocket.close(code=4004, reason="Session not found")
        return
    
    session = sessions[session_id]
    session.subscribers.append(websocket)
    
    # Send current state
    await websocket.send_json({
        "type": "connected",
        "session_id": session_id,
        "current_glyph": session.current_glyph,
        "glyphs_completed": session.glyphs_completed,
        "status": session.status,
    })
    
    try:
        while True:
            # Keep connection alive and receive any client messages
            data = await websocket.receive_json()
            
            # Handle inspiration submissions
            if data.get("type") == "inspiration":
                await session.add_inspiration(data)
                
    except WebSocketDisconnect:
        session.subscribers.remove(websocket)


@app.websocket("/ws/live")
async def websocket_live(websocket: WebSocket):
    """WebSocket for current active session"""
    global current_session
    
    await websocket.accept()
    
    if not current_session:
        # Start a new session if none active
        session_id = f"session-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
        current_session = LiveSession(session_id, "MILSPEC Mono", "mono")
        sessions[session_id] = current_session
        asyncio.create_task(simulate_design_session(current_session))
    
    current_session.subscribers.append(websocket)
    
    await websocket.send_json({
        "type": "connected",
        "session_id": current_session.id,
        "current_glyph": current_session.current_glyph,
        "glyphs_completed": current_session.glyphs_completed,
    })
    
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("type") == "inspiration":
                await current_session.add_inspiration(data)
    except WebSocketDisconnect:
        if current_session and websocket in current_session.subscribers:
            current_session.subscribers.remove(websocket)


@app.post("/inspiration/upload")
async def upload_inspiration(
    file: UploadFile = File(...),
    notes: str = "",
    subscriber_id: str = "",
):
    """Upload inspiration image for the creative team"""
    global current_session
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Must be an image file")
    
    # Read and encode image
    contents = await file.read()
    b64 = base64.b64encode(contents).decode()
    
    inspiration = {
        "type": "image",
        "filename": file.filename,
        "content_type": file.content_type,
        "data": f"data:{file.content_type};base64,{b64}",
        "notes": notes,
        "subscriber_id": subscriber_id,
        "received_at": datetime.utcnow().isoformat(),
    }
    
    # Add to current session if active
    if current_session:
        await current_session.add_inspiration(inspiration)
    
    return {
        "status": "received",
        "message": "Inspiration received by the creative team!",
        "filename": file.filename,
    }


@app.post("/inspiration/drawing")
async def submit_drawing(
    drawing_data: str,  # Base64 canvas data
    notes: str = "",
    subscriber_id: str = "",
):
    """Submit a drawing from the onsite drawing pad"""
    global current_session
    
    inspiration = {
        "type": "drawing",
        "data": drawing_data,
        "notes": notes,
        "subscriber_id": subscriber_id,
        "received_at": datetime.utcnow().isoformat(),
    }
    
    if current_session:
        await current_session.add_inspiration(inspiration)
    
    return {
        "status": "received",
        "message": "Drawing received! The team is inspired.",
    }


# ═══════════════════════════════════════════════════
# FONT DOWNLOADS
# ═══════════════════════════════════════════════════

FONTS_DIR = Path("./fonts")

@app.get("/fonts")
async def list_fonts():
    """List available fonts for download"""
    if not FONTS_DIR.exists():
        return {"fonts": []}
    
    fonts = []
    for f in FONTS_DIR.glob("*"):
        if f.suffix in ['.otf', '.ttf', '.woff', '.woff2']:
            fonts.append({
                "name": f.stem,
                "format": f.suffix[1:],
                "size": f.stat().st_size,
                "download_url": f"/fonts/download/{f.name}",
            })
    
    return {"fonts": fonts}


@app.get("/fonts/download/{filename}")
async def download_font(filename: str):
    """Download a font file"""
    filepath = FONTS_DIR / filename
    
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Font not found")
    
    media_types = {
        '.otf': 'font/otf',
        '.ttf': 'font/ttf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
    }
    
    return FileResponse(
        filepath,
        media_type=media_types.get(filepath.suffix, 'application/octet-stream'),
        filename=filename,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
