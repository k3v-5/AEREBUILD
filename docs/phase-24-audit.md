# Auditoría de Arquitectura e Integración: Fase 24 — Distributed Production Orchestration, Multi-Agent Swarm & Elastic Resource Scheduling (v2.4.0)

## 1. Existing Systems & Architecture
- **Grafo de Revisiones y Merge 3-Way (Fase 18):** `RevisionGraph`, `RevisionDiff`, `RevisionPatch`, `RevisionMerge`.
- **Orquestación de Producción y DAG (Fase 18, 20):** `WorkflowEngine`, `WorkflowPlanner`, `ProductionOrchestrator`.
- **Persistencia, CAS y Serialización Canónica (Fase 21):** `StorageBackend`, `ProjectSerializer` (`canonicalize`, `hashCanonical`).
- **QA Multi-Capa y Diagnósticos (Fase 20, 23):** `QAEngine`, `PerceptualQAEngine`.
- **Control MCP (Fases 17, 18, 20):** `McpRegistry`, `McpServer`.

## 2. Baseline de Pruebas
- **Total:** 557 tests.
- **Estado:** 100% pasando en verde en 7.87s.

## 3. Potential Conflicts & Mitigations
- **Determinismo Distribuido:** Prohibido el uso de `Math.random()`, `Date.now()`, `crypto.randomUUID()` o dependencias del hardware.
  - $\text{Run}(1\text{ worker local}) \equiv \text{Run}(N\text{ workers distribuidos})$.
- **Concurrencia de Agentes del Enjambre:** El `ThreeWayMergeArbiter` valida y combina propuestas ortogonales (`Director` + `Editor` + `Motion` + `Audio`) sobre la IR canónica, rechazando colisiones con `ProposalConflictError`.
- **Leases y Tolerancia a Fallos:** Los workers operan bajo arrendamientos temporizados (`TaskLease`) con heartbeats lógicos. Las caídas de worker provocan reasignación determinista sin duplicación de cómputo.

## 4. Files to Create
- `src/distributed/core/`: `DistributedJob.ts`, `DistributedConfig.ts`, `DistributedContext.ts`, `DistributedResult.ts`, `DistributedErrors.ts`.
- `src/distributed/tasks/`: `TaskDefinition.ts`, `TaskDAG.ts`, `TaskPlanner.ts`, `TaskLease.ts`, `TaskResult.ts`.
- `src/distributed/swarm/`: `AgentRole.ts`, `SwarmAgent.ts`, `SwarmCoordinator.ts`, `AgentMessage.ts`, `AgentProposal.ts`, `ThreeWayMergeArbiter.ts`.
- `src/distributed/scheduler/`: `WorkerNode.ts`, `WorkerPool.ts`, `LoadBalancer.ts`, `HeartbeatMonitor.ts`, `WorkStealingEngine.ts`, `ElasticScheduler.ts`.
- `src/distributed/transport/`: `MessageTransport.ts`, `InMemoryTransport.ts`, `LocalProcessTransport.ts`, `TransportEnvelope.ts`.
- `src/distributed/telemetry/`: `SwarmTelemetry.ts`, `ClusterStatus.ts`, `DistributedEventLog.ts`.
- `src/distributed/index.ts`.
- Herramientas y recursos MCP en `src/mcp/tools/` y `src/mcp/resources/`.
- Suite de pruebas de 7 capas en `src/tests/distributed/`.

## 5. Files to Modify
- `src/index.ts` (export de módulo `distributed`).
- `src/mcp/registry.ts` (registro de tools y resources distribuidos).
- `src/mcp/index.ts`.

## 6. Files Explicitly NOT to Modify
- `src/core/*`
- `src/elements/*`
- `src/transform/*`
- `src/audio/*`
- `src/captions/*`
- `src/motion-graphics/*`
- `src/exporters/*`
- `src/tests/` de Fases 1 a 23 (preservación estricta de los 557 tests existentes).
