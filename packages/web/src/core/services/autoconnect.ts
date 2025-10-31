import { z } from "zod";

/**
 * Zod schema for autoconnect.json configuration file.
 * Only HTTP transport is supported in kiosk mode.
 */
const AutoConnectConfigSchema = z.object({
  autoConnect: z.object({
    transport: z.literal("http"),
    url: z.string().min(1),
  }),
});

export type AutoConnectConfig = z.infer<
  typeof AutoConnectConfigSchema
>["autoConnect"];

/**
 * Loads and validates the autoconnect configuration from /autoconnect.json.
 * Returns null if the file doesn't exist or fetch fails.
 * Throws validation error if JSON is malformed or invalid.
 */
export async function loadAutoConnectConfig(): Promise<AutoConnectConfig | null> {
  try {
    const response = await fetch("/autoconnect.json");

    if (!response.ok) {
      // File not found or server error - return null to use normal UI
      return null;
    }

    const json = await response.json();
    const parsed = AutoConnectConfigSchema.parse(json);

    return parsed.autoConnect;
  } catch (error) {
    // Zod validation errors have a specific type we can check
    if (error && typeof error === "object" && "issues" in error) {
      // Validation error - throw to show error toast
      throw error;
    }
    // Network error or other fetch failures - return null
    return null;
  }
}
