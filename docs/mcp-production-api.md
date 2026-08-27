# Especificación de la API MCP de Producción (Fase 18)

## 1. Herramientas MCP (16 Tools)

| Herramienta | Parámetros Clave | Propósito |
|---|---|---|
| `create_project` | `projectId`, `name`, `width`, `height`, `fps`, `duration` | Inicializa proyecto persistido y revisión génesis |
| `open_project` | `projectId`, `revisionId?` | Abre proyecto y verifica estado del snapshot |
| `save_project` | `projectId`, `message` | Confirma estado en almacenamiento |
| `get_project` | `projectId`, `revisionId?` | Consulta datos del proyecto en formato JSON canónico |
| `list_projects` | `limit` | Lista proyectos registrados con metadatos |
| `create_revision` | `projectId`, `parentRevisionId?`, `message`, `projectData` | Crea nueva revisión inmutable |
| `get_revision` | `projectId`, `revisionId` | Obtiene el snapshot y metadata de una revisión |
| `list_revisions` | `projectId` | Lista el historial y linaje de revisiones |
| `diff_revisions` | `projectId`, `fromRevisionId`, `toRevisionId` | Emite diff estructurado semántico |
| `restore_revision` | `projectId`, `targetRevisionId` | Restaura revisión histórica como nueva revisión HEAD |
| `undo_revision` | `projectId`, `targetRevisionId` | Aplica parche inverso creando nueva revisión |
| `run_workflow` | `workflowId`, `projectId`, `parameters`, `dryRun` | Ejecuta tubería de producción con checkpoints |
| `get_workflow_status` | `workflowId` | Consulta estado, porcentaje y checkpoints de workflow |
| `cancel_workflow` | `workflowId`, `reason` | Cancelación cooperativa de workflow |
| `resume_workflow` | `workflowId`, `projectId` | Reanuda workflow tras interrupción |
| `validate_project` | `projectId`, `revisionId?` | Ejecuta validaciones estructurales y de límites |

## 2. Recursos MCP Declarativos

- `projects://`: catálogo de todos los proyectos persistidos.
- `projects://{projectId}`: estado completo del snapshot actual.
- `projects://{projectId}/revisions`: historial de revisiones del proyecto.
- `projects://{projectId}/revisions/{revisionId}`: snapshot de una revisión específica.
- `workflows://{workflowId}`: estado de ejecución de un workflow.
