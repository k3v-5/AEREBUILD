import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ProjectRuntime } from "../runtime/ProjectRuntime.js";
import {
  CancelOperationInputSchema,
  CloseProjectInputSchema,
  CreateProjectInputSchema,
  DiffProjectRevisionsInputSchema,
  OpenProjectInputSchema,
  RestoreProjectRevisionInputSchema,
  SaveProjectInputSchema,
  ValidateProjectInputSchema,
} from "../schemas/runtime.schema.js";
import { registerLegacyAEBridge } from "./bridge/ae-bridge.js";
import { McpResources } from "./resources/mcp-resources.js";
import { RuntimeMCPResources } from "./resources/runtime-resources.js";
import {
  ApplyViralCaptionStyleSchema,
  CreateVideoFromScriptSchema,
  ExportAfterEffectsJSXSchema,
  GetTimelinePreviewFrameSchema,
} from "./schemas/mcp-tools.schema.js";
import { handleApplyViralCaptionStyle } from "./tools/apply-viral-caption-style.js";
import { handleCancelOperation } from "./tools/cancel-operation.js";
import { handleCloseProject } from "./tools/close-project.js";
import { handleCreateProject } from "./tools/create-project.js";
import { handleCreateVideoFromScript } from "./tools/create-video-from-script.js";
import { handleDiffProjectRevisions } from "./tools/diff-project-revisions.js";
import { handleExportAfterEffectsJSX } from "./tools/export-after-effects-jsx.js";
import { handleGetProjectStatus } from "./tools/get-project-status.js";
import { handleGetTimelinePreviewFrame } from "./tools/get-timeline-preview-frame.js";
import { handleListProjectRevisions } from "./tools/list-project-revisions.js";
import { handleOpenProject } from "./tools/open-project.js";
import { handleRestoreProjectRevision } from "./tools/restore-project-revision.js";
import { handleSaveProject } from "./tools/save-project.js";
import { handleValidateProject } from "./tools/validate-project.js";
import { handleTranscribeLocalAudio } from "./tools/transcribe-local-audio.js";
import { handleDetectViralClips } from "./tools/detect-viral-clips.js";
import { handlePackageSocialRelease } from "./tools/package-social-release.js";
import { handleAutoReframeVideo } from "./tools/auto-reframe-video.js";
import { z } from "zod";

/**
 * Registro centralizado de herramientas y recursos del Model Context Protocol (Fase 17 y 18).
 */
export class McpRegistry {
  private static defaultRuntime = new ProjectRuntime();

  public static registerAll(server: McpServer, runtime: ProjectRuntime = this.defaultRuntime): void {
    // --- HERRAMIENTAS DE FASE 17 ---
    server.tool(
      "create_video_from_script",
      "Orchestrates a complete multi-agent audiovisual project in canonical IR from a creative script or prompt.",
      CreateVideoFromScriptSchema.shape,
      async (args) => {
        try {
          const result = await handleCreateVideoFromScript(args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, details: error.details }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      "export_to_after_effects_jsx",
      "Compiles a canonical project or composition into an executable Adobe After Effects ExtendScript (.jsx) file.",
      ExportAfterEffectsJSXSchema.shape,
      async (args) => {
        try {
          const result = await handleExportAfterEffectsJSX(args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, details: error.details }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      "get_timeline_preview_frame",
      "Inspects the evaluated visual and temporal frame state at timestamp t using the existing canonical engine.",
      GetTimelinePreviewFrameSchema.shape,
      async (args) => {
        try {
          const result = await handleGetTimelinePreviewFrame(args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, details: error.details }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      "apply_viral_caption_style",
      "Applies kinetic typography and caption presets creating a new immutable revision.",
      ApplyViralCaptionStyleSchema.shape,
      async (args) => {
        try {
          const result = await handleApplyViralCaptionStyle(args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, details: error.details }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    // --- HERRAMIENTAS DE FASE 18 (RUNTIME & PERSISTENCIA) ---
    server.tool(
      "create_project",
      "Creates a persistent versioned project envelope in the production runtime repository.",
      CreateProjectInputSchema.shape,
      async (args) => {
        try {
          const result = await handleCreateProject(runtime, args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, context: error.context }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      "open_project",
      "Opens an existing persistent project, running recovery if needed, and establishes an active editing session.",
      OpenProjectInputSchema.shape,
      async (args) => {
        try {
          const result = await handleOpenProject(runtime, args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, context: error.context }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      "save_project",
      "Saves a project envelope to persistent storage applying optimistic concurrency checks.",
      SaveProjectInputSchema.shape,
      async (args) => {
        try {
          const result = await handleSaveProject(runtime, args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, context: error.context }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      "close_project",
      "Closes an active project session, releasing concurrency locks safely.",
      CloseProjectInputSchema.shape,
      async (args) => {
        try {
          const result = await handleCloseProject(runtime, args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, context: error.context }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      "get_project_status",
      "Queries the current runtime status, revision HEAD, lock state, and health report of a project.",
      { projectId: CreateProjectInputSchema.shape.name },
      async (args) => {
        try {
          const result = await handleGetProjectStatus(runtime, args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, context: error.context }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      "list_project_revisions",
      "Lists the full immutable revision history for a persistent project.",
      { projectId: CreateProjectInputSchema.shape.name },
      async (args) => {
        try {
          const result = await handleListProjectRevisions(runtime, args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, context: error.context }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      "diff_project_revisions",
      "Calculates a structural and semantic diff between two revisions of a project.",
      DiffProjectRevisionsInputSchema.shape,
      async (args) => {
        try {
          const result = await handleDiffProjectRevisions(runtime, args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, context: error.context }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      "restore_project_revision",
      "Restores a historical revision by creating a new revision containing its content (non-destructive).",
      RestoreProjectRevisionInputSchema.shape,
      async (args) => {
        try {
          const result = await handleRestoreProjectRevision(runtime, args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, context: error.context }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      "validate_project",
      "Executes a comprehensive 6-layer validation on a project without mutating its state.",
      ValidateProjectInputSchema.shape,
      async (args) => {
        try {
          const result = await handleValidateProject(runtime, args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, context: error.context }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    server.tool(
      "cancel_operation",
      "Cancels an active long-running runtime operation cooperatively.",
      CancelOperationInputSchema.shape,
      async (args) => {
        try {
          const result = await handleCancelOperation(runtime, args);
          return {
            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
          };
        } catch (error: any) {
          return {
            content: [{ type: "text", text: JSON.stringify({ error: error.message, context: error.context }, null, 2) }],
            isError: true,
          };
        }
      }
    );

    // --- HERRAMIENTAS DE AUTOMATIZACIÓN (Autonomous Content Factory) ---
    server.tool(
      "transcribe_local_audio",
      "Transcribes local video/audio phonetically word-by-word with zero API cost using local Whisper or deterministic synthesis.",
      {
        audioPath: z.string().optional(),
        videoPath: z.string().optional(),
        textFallback: z.string().optional(),
        totalDurationSec: z.number().optional(),
      },
      async (args) => {
        try {
          const result = await handleTranscribeLocalAudio(args);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } catch (error: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }, null, 2) }], isError: true };
        }
      }
    );

    server.tool(
      "detect_viral_clips",
      "Analyzes long-form transcripts and audio energy to extract top viral clips (30s-60s) with virality scoring (0-100).",
      {
        transcriptText: z.string().optional(),
        totalDurationSec: z.number().optional(),
        topK: z.number().optional(),
      },
      async (args) => {
        try {
          const result = await handleDetectViralClips(args);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } catch (error: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }, null, 2) }], isError: true };
        }
      }
    );

    server.tool(
      "package_social_release",
      "Generates 3 A/B High-CTR YouTube titles, chapters description, and TikTok viral hashtags.",
      {
        projectName: z.string().optional(),
        topic: z.string(),
        keywords: z.array(z.string()).optional(),
        viralHookText: z.string().optional(),
      },
      async (args) => {
        try {
          const result = await handlePackageSocialRelease(args);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } catch (error: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }, null, 2) }], isError: true };
        }
      }
    );

    server.tool(
      "auto_reframe_video",
      "Calculates dynamic pan-and-scan or split-screen keyframes to convert 16:9 footage into 9:16 vertical video.",
      {
        mode: z.enum(["dynamic_pan_and_scan", "split_screen_stacked", "blur_background_boxed"]).optional(),
        sourceWidth: z.number().optional(),
        sourceHeight: z.number().optional(),
        targetWidth: z.number().optional(),
        targetHeight: z.number().optional(),
      },
      async (args) => {
        try {
          const result = await handleAutoReframeVideo(args);
          return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
        } catch (error: any) {
          return { content: [{ type: "text", text: JSON.stringify({ error: error.message }, null, 2) }], isError: true };
        }
      }
    );

    // --- RECURSOS DECLARATIVOS ---
    const resources = McpResources.getStaticResources();
    for (const res of resources) {
      server.resource(res.name, res.uri, async () => {
        return await res.read();
      });
    }

    server.resource("runtime-health", "runtime://health", async () => {
      const text = await RuntimeMCPResources.getResourceContent(runtime, "runtime://health");
      return { contents: [{ uri: "runtime://health", text }] };
    });

    server.resource("runtime-projects", "runtime://projects", async () => {
      const text = await RuntimeMCPResources.getResourceContent(runtime, "runtime://projects");
      return { contents: [{ uri: "runtime://projects", text }] };
    });

    server.resource("runtime-capabilities", "capabilities://runtime", async () => {
      const text = await RuntimeMCPResources.getResourceContent(runtime, "capabilities://runtime");
      return { contents: [{ uri: "capabilities://runtime", text }] };
    });

    // --- BRIDGE LEGADO ---
    registerLegacyAEBridge(server);
  }
}
