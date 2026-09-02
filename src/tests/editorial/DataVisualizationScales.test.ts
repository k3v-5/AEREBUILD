import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  LinearScale,
  TimeScale,
  OrdinalScale,
} from "../../editorial/data-visualization/index.js";

describe("REQ-025 — DataVisualizationScales Tests", () => {
  it("LinearScale applies vertical inversion for After Effects coordinate space (§14)", () => {
    // Canvas: Y=0 es top, Y=1000 es bottom
    // Domain: 0 a 100
    const scale = new LinearScale({ min: 0, max: 100 }, { min: 0, max: 1000 }, true);

    // En AE invertido: el valor mínimo (0) debe mapearse a Y=1000 (fondo de la pantalla)
    assert.equal(scale.scale(0), 1000);

    // El valor máximo (100) debe mapearse a Y=0 (techo de la pantalla)
    assert.equal(scale.scale(100), 0);

    // El valor medio (50) debe mapearse a Y=500
    assert.equal(scale.scale(50), 500);

    // Invert funciona correctamente
    assert.equal(scale.invert(1000), 0);
    assert.equal(scale.invert(0), 100);
    assert.equal(scale.invert(500), 50);
  });

  it("LinearScale calculates zero baseline crossing position accurately", () => {
    // Dominio mixto de -50 a +50 mapeado a Y=[0, 1000] invertido
    const scale = new LinearScale({ min: -50, max: 50 }, { min: 0, max: 1000 }, true);

    // El cero está en el centro
    assert.equal(scale.getZeroBaseline(), 500);

    // Para un dominio estrictamente positivo [10, 100], el baseline cero es el bottom (1000)
    const posScale = new LinearScale({ min: 10, max: 100 }, { min: 0, max: 1000 }, true);
    assert.equal(posScale.getZeroBaseline(), 1000);
  });

  it("TimeScale maps timestamps proportionally across horizontal range (§14)", () => {
    const t0 = 1000;
    const t1 = 2000;
    const t2 = 3000;

    const timeScale = new TimeScale({ minTime: t0, maxTime: t2 }, { min: 100, max: 900 });

    assert.equal(timeScale.scale(t0), 100);
    assert.equal(timeScale.scale(t1), 500);
    assert.equal(timeScale.scale(t2), 900);
  });

  it("OrdinalScale provides uniform band distribution with padding (§14)", () => {
    const categories = ["Tech", "Finance", "Energy", "Healthcare"];
    const ordinalScale = new OrdinalScale(categories, { min: 0, max: 1000 }, 0.2);

    const bandWidth = ordinalScale.bandwidth();
    const step = ordinalScale.step();

    assert.ok(bandWidth > 0);
    assert.ok(step > bandWidth);

    // Coordenadas estrictamente crecientes
    let prevX = -1;
    for (const cat of categories) {
      const x = ordinalScale.scale(cat);
      assert.ok(x > prevX);
      prevX = x;
    }
  });
});
