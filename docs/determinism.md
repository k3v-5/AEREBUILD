# Reglas de Determinismo Absoluto en Producción (Fase 18)

## 1. Principio Fundamental

> **La IR Canónica y las identidades criptográficas no contienen fuentes de no-determinismo.**

## 2. Restricciones No Negociables
1. **Cero Timestamps en la IR:**
   Las propiedades de animación, estructura de capas, tiempos de entrada/salida y parámetros visuales son independientes del reloj del sistema. `Date.now()` o `new Date()` únicamente se permiten como metadata operacional externa (`createdAt`, `updatedAt`), nunca como parte del cálculo de hashes deterministas o claves del grafo.
2. **Cero Números Aleatorios no Sembrados:**
   Prohibido el uso de `Math.random()` o UUIDs aleatorios para generar IDs de proyecto o revisión.
3. **Cálculo Determinista de Hashes:**
   Tanto `ProjectSerializer.hashCanonical` como `RevisionId.generate` utilizan serialización canónica con ordenamiento lexicográfico de claves y normalización de números flotantes.
