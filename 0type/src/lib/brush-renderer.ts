// ═══════════════════════════════════════════════════════════════════════════
// 0TYPE BRUSH RENDERER
// Re-exports the Hand Renderer - point-by-point drawing simulation
// Also exports the new Stroke Engine powered by perfect-freehand
// ═══════════════════════════════════════════════════════════════════════════

export {
  renderBrushStroke,
  generateStrokePoints,
  generatePath,
  drawStroke,
  renderMonolineBrush,
  renderCalligraphicBrush,
  renderInkBrush,
  renderChalkBrush,
  renderNeonBrush,
  renderPressureBrush,
  renderWatercolorBrush,
  type StrokePoint,
} from './hand-renderer';

// New: perfect-freehand powered stroke engine
export {
  StrokeEngine,
  quickStroke,
  listPresets,
  getPresetsByCategory,
  STROKE_PRESETS,
  EASINGS,
  type StrokeStyle,
  type StrokePreset,
} from './stroke-engine';
