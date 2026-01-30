# Generative AI Art — L0RE Library Reference

**Crawled**: 2026-01-30
**Category**: Foundational Models

---

## Stable Diffusion (CompVis)
**GitHub**: https://github.com/CompVis/stable-diffusion (72.3k ⭐)

### Architecture
- **Latent Diffusion Model** — operates in compressed latent space (not pixels)
- **860M UNet** + **123M CLIP ViT-L/14** text encoder
- **VAE**: Downsampling-factor 8 autoencoder
- Trained on LAION-5B dataset (aesthetic subset)

### Key Concepts
- **Latent Space**: 64x64 latent → 512x512 image
- **Classifier-Free Guidance**: `eps = eps(x, empty) + scale * (eps(x, cond) - eps(x, empty))`
- **PLMS/DDIM Sampling**: Different noise schedules
- **Strength Parameter**: Controls denoising amount (0.0-1.0)

### L0RE Connection
- Diffusion = gradual emergence from noise
- Latent space = compressed understanding
- Guidance scale = balance between freedom and intent

---

## DALL-E Mini / Craiyon
**GitHub**: https://github.com/borisdayma/dalle-mini (14.8k ⭐)

### Architecture  
- **VQGAN-f16-16384** for image encoding/decoding
- **BART-based** sequence-to-sequence model
- JAX/Flax implementation (TPU-optimized)

### Key Innovations
- Distributed Shampoo optimizer
- Super conditioning (Katherine Crowson)
- Sinkformers: Doubly stochastic attention

### Training References
- Zero-Shot Text-to-Image (Ramesh et al.)
- Taming Transformers (Esser et al.)
- CLIP (Radford et al.)

---

## StyleGAN3 (NVIDIA)
**GitHub**: https://github.com/NVlabs/stylegan3 (6.9k ⭐)

### Core Innovation: Alias-Free Synthesis
> "Detail appearing to be glued to image coordinates instead of surfaces"

Solved via careful signal processing to prevent aliasing.

### Configurations
- **stylegan3-t**: Translation equivariant
- **stylegan3-r**: Translation AND rotation equivariant

### Key Properties
- Fully equivariant at subpixel scales
- Perfect for video/animation (no "texture sticking")
- Continuous signal interpretation

### Architecture Components
- G.mapping: z → w (latent to style)
- G.synthesis: w → image
- Truncation: `truncation_psi` controls variation

---

## Synthesis for L0RE Visual Language

### Latent Space as Metaphor
```
Noise → Structure → Meaning
   ↓         ↓         ↓
Static → Pattern → Message
```

### Density Ramps (Gysin Connection)
ASCII art ≈ discrete sampling of continuous fields
```javascript
// Continuous value → discrete character
const char = density[Math.floor(value * density.length)]
```

### Diffusion as L0RE Process
1. **Pure Noise** — Chaos, potential
2. **Early Steps** — Structure emerges
3. **Middle Steps** — Details coalesce
4. **Late Steps** — Refinement
5. **Final** — Coherent output

This mirrors:
- Agent deliberation → consensus
- Data → insight
- Code → execution

---

## API Integration Map

### Available Models via Our APIs

| Provider | Model | Specialty | Cost |
|----------|-------|-----------|------|
| Anthropic | Claude Sonnet 4 | Reasoning, Code | $$$ |
| Groq | Llama 3.3 70B | Speed (inference) | FREE |
| DeepSeek | DeepSeek Chat | Chinese/Reasoning | $ |
| OpenRouter | Various | Routing/Fallback | $$ |
| Moonshot/Kimi | Kimi | Long context | $ |

### Fallback Chain
```
anthropic → groq → deepseek → openrouter
```

### Use Cases by Agent
- **b0b**: Creative direction → Anthropic (nuance)
- **r0ss**: Infrastructure → Groq (speed)
- **c0m**: Security analysis → DeepSeek (thoroughness)
- **d0t**: Quantitative → Groq (fast inference)

---

*Reference for L0RE visual language development*
*"The synthesis process depends on absolute coordinates in an unhealthy manner"*
