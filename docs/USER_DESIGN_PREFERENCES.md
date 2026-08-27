# 🎨 Guía de Estilo, Estándares Visuales y Gustos del Usuario
## Motion Graphics Engine & Adobe After Effects MCP

Este documento define las **reglas de oro estéticas, compositivas y tipográficas** que cualquier agente de IA o módulo generador debe seguir obligatoriamente para complacer el estándar de calidad visual del usuario.

---

## 🚫 1. Anti-Patrones Estrictamente Prohibidos (Lo que NO se debe hacer)

1. **PROHIBIDO el uso de fuentes Serif genéricas por defecto:**
   - Nunca permitir que After Effects recurra a `Times New Roman` o `Minion Pro`.
   - Se debe forzar explícitamente la fuente en el `Source Text` del script.

2. **PROHIBIDO el diseño de formas planas estilo "PowerPoint" / Wireframe:**
   - Nada de rectángulos y círculos sólidos de colores básicos primarios (amarillo chillón o cian plano sin gradiente ni desenfoque) con trazos gruesos desproporcionados.
   - Nada de composiciones rígidas donde todos los elementos están amontonados o desfasados del eje óptico.

3. **PROHIBIDO texto con alineación desfasada:**
   - Todo texto centrado debe usar obligatoriamente `textDoc.justification = ParagraphJustification.CENTER_JUSTIFY;`.
   - El punto de anclaje debe coincidir con el centro geométrico del elemento.

4. **PROHIBIDO renderizar sin Motion Blur:**
   - Las animaciones sin desenfoque de movimiento se ven baratas y robóticas.
   - Siempre activar `comp.motionBlur = true` y `layer.motionBlur = true`.

---

## 🏆 2. Estilo Maestro Preferido: Editorial Poster / High-Impact (TIME Style)

Este es el estilo visual **favorito y aprobado por el usuario** (inspirado en portadas icónicas, posters tipográficos y motion graphics editoriales de alto impacto):

```
┌─────────────────────────────────────────────────────────────┐
│                       ✦ CAPÍTULO 01 ✦                       │ ← Sub-tag de contexto
│                                                             │
│             ╔═════════════════════════════════╗             │
│             ║            EL ARTE              ║             │ ← Blanco Puro / Masivo
│             ╚═════════════════════════════════╝             │
│                                                             │
│       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─       │
│      │        ( DIAL DE RELOJ / TICKS VECTORIALES )  │      │ ← Gráfico sutil en rotación
│      │                                               │      │
│      │                  DISFRUTAR                    │      │ ← ROJO CARMESÍ GIGANTE
│      │                                               │      │   (Ultra-condensado estirado)
│       ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─       │
│                                                             │
│             [ VIVE LA EXPERIENCIA // 2026 ]                 │ ← Badge de cierre
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Tipografía y Escala Masiva
- **Fuentes aprobadas (Fallback list):**
  ```javascript
  var fonts = ["Impact", "Arial-Black", "Haettenschweiler", "Anton", "BebasNeue", "SegoeUI-Black", "Arial-BoldMT"];
  ```
- **Escala:** Tipografía gigante que ocupa entre el $70\%$ y el $95\%$ del ancho del canvas vertical ($1080\text{ px}$).
- **Proporción:** Estiramiento vertical intencional (`scale: [100, 120]` a `[100, 150]`) con **tracking negativo** ($-10$ a $-20$) para un aspecto compacto y contundente.
- **Paleta de Color de Alto Contraste:**
  - **Rojo Carmesí Neón Editorial:** `[1.0, 0.08, 0.14]` (`#FF1424`).
  - **Blanco Puro:** `[0.98, 0.98, 0.98]` (`#FAFAFA`).
  - **Negro Profundo / Slate:** `[0.03, 0.03, 0.05]` (`#08080D`).

### 2.2 Ritmo y Animación Palabra por Palabra (Word-by-Word Kinetic Pacing)
- En lugar de mostrar bloques largos de texto, las palabras deben entrar **secuencialmente al ritmo del habla**:
  - `EL ARTE` ($0.2\text{s} - 1.5\text{s}$)
  - `DE` ($1.5\text{s} - 2.2\text{s}$)
  - `DISFRUTAR` ($2.2\text{s} - 4.8\text{s}$) [Texto héroe masivo rojo]
  - `LOS` ($4.8\text{s} - 5.5\text{s}$)
  - `FESTIVALES` ($5.5\text{s} - 8.0\text{s}$) [Póster Slam final]
- **Física de Entrada:** Rebote elástico punchy (`inertiaBounce(0.04, 7.0, 4.0)` o snap zoom de escala $180\% \to 100\%$).

### 2.3 Elementos Gráficos de Acompañamiento
- **Diales y Marcas Horarias Minimalistas:** Anillos vectoriales ultrafinos ($2\text{ px}$) con marcas de reloj (*ticks* usando `Repeater` de 24 o 60 copias) rotando a baja velocidad (`time * 15`).
- **Etiquetas y Badges:** Formato `✦ SECCIÓN ✦` o `[ CATEGORÍA // AÑO ]` con interletraje expandido ($+25$ a $+40$).

---

## 💎 3. Segundo Estilo Aprobado: Minimal Luxury / Tech (Apple / Linear)

Para interfaces de producto, dashboards, métricas y SaaS:

1. **Fondo:** Graphite OLED / Dark Slate (`#08080C`) con resplandor ambiental suave al $35\%$.
2. **Tipografía:** `SegoeUI-Black` o `Arial-Black`, interletraje negativo, colores blanco y azul hielo eléctrico (`#00E5FF`).
3. **Glassmorphism:** Tarjetas oscuras con esquinas redondeadas ($32\text{ px}$ - $40\text{ px}$), relleno al $80\%$ de opacidad y borde fino resplandeciente ($1.5\text{ px}$).
4. **Botón CTA:** Cápsula alargada con esquinas completamente redondeadas (*pill shape*), micro-rebote al aparecer y pulso de respiración armónico.

---

## 🎥 4. Reglas de Integración sobre Video Real (.mp4 / .mov)

Cuando se superpongan gráficos sobre un video de fondo del usuario:
1. **Auto-Cover:** Escalar el video con `Math.max(scaleX, scaleY)` para garantizar $100\%$ de cobertura sin bandas negras.
2. **Viñeteado de Contraste Obligatorio:** Capa sólida oscura al $35\% - 45\%$ de opacidad colocada entre el video y los textos para garantizar legibilidad WCAG.
3. **Safe Zones Verticales:** Mantener los textos principales entre $Y = 320\text{ px}$ y $Y = 1580\text{ px}$ (dejando espacio libre para la interfaz de TikTok / Reels).
