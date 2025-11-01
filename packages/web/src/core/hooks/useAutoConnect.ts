import {
  type AutoConnectConfig,
  loadAutoConnectConfig,
} from "@core/services/autoconnect.ts";
import {
  useAppStore,
  useDeviceStore,
  useMessageStore,
  useNodeDBStore,
} from "@core/stores";
import { subscribeAll } from "@core/subscriptions.ts";
import { randId } from "@core/utils/randId.ts";
import { MeshDevice } from "@meshtastic/core";
import { TransportHTTP } from "@meshtastic/transport-http";
import { useEffect, useState } from "react";

export interface UseAutoConnectResult {
  loading: boolean;
  connecting: boolean;
  error: string | null;
  config: AutoConnectConfig | null;
  retry: () => void;
}

/**
 * Hook that handles auto-connect functionality for kiosk mode.
 * Loads config on mount, clears existing device state, and attempts connection.
 */
export function useAutoConnect(): UseAutoConnectResult {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AutoConnectConfig | null>(null);

  const connect = async (cfg: AutoConnectConfig) => {
    setConnecting(true);
    setError(null);

    try {
      // Get store methods
      const { addDevice } = useDeviceStore.getState();
      const { addNodeDB } = useNodeDBStore.getState();
      const { addMessageStore } = useMessageStore.getState();
      const { setSelectedDevice } = useAppStore.getState();

      // Create connection
      const id = randId();
      const transport = await TransportHTTP.create(
        cfg.url.replace(/^https?:\/\//, ""),
        cfg.url.startsWith("https"),
      );
      const device = addDevice(id);
      const nodeDB = addNodeDB(id);
      const messageStore = addMessageStore(id);

      const connection = new MeshDevice(transport, id);
      connection.configure();
      setSelectedDevice(id);
      device.addConnection(connection);
      subscribeAll(device, connection, messageStore, nodeDB);

      setConnecting(false);
    } catch (err) {
      console.error("Auto-connect failed:", err);
      setError(
        err instanceof Error ? err.message : "Connection failed. Please retry.",
      );
      setConnecting(false);
    }
  };

  const retry = () => {
    if (config) {
      connect(config);
    }
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const cfg = await loadAutoConnectConfig();

        if (cfg) {
          setConfig(cfg);
          const { setKioskMode } = useAppStore.getState();
          setKioskMode(true, cfg);
          await connect(cfg);
        }
      } catch (err) {
        console.error("Config validation failed:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Invalid configuration file format",
        );
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  return {
    loading,
    connecting,
    error,
    config,
    retry,
  };
}
