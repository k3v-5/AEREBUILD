# Subsistema de Persistencia Desacoplada (Fase 18)

## 1. Arquitectura de Almacenamiento

El motor motion graphics desacopla el almacenamiento del proyecto de la memoria volátil a través de interfaces formales:

- **`ProjectStore` (Interfaz Base):**
  Define el contrato para `create`, `get`, `update`, `exists`, `delete`, `saveRevision`, `getRevision`, `listRevisions` y `listProjects`.

- **`MemoryProjectStore`:**
  Implementación en memoria de alta velocidad orientada a tests y ejecución efímera.

- **`FileProjectStore`:**
  Implementación en sistema de archivos local con:
  1. Sandboxing y prevención estricta de Path Traversal mediante `PathSanitizer`.
  2. Protocolo de escritura atómica:
     $$\text{JSON Canónico} \to \text{archivo.tmp.pid\_timestamp} \to \text{fsync} \to \text{atomic rename} \to \text{project.json}$$
  3. Organización estandarizada en disco:
     ```
     storageRoot/
       projects/
         {projectId}/
           project.json
           revisions/
             {revisionId}.json
     ```

## 2. Serialización Canónica Determinista (`ProjectSerializer`)

Garantiza invariantes fundamentales para la identidad criptográfica:
- Ordenamiento determinista de claves de objetos anidados.
- Normalización estricta de números de coma flotante ($-0 \to 0$, rechazo de `NaN` o `Infinity`).
- Cálculo SHA-256 libre de timestamps o dependencias volátiles.

```typescript
const canonicalJson = ProjectSerializer.canonicalize(project);
const hash = ProjectSerializer.hashCanonical(project);
```
