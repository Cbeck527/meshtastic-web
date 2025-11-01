import { DeviceWrapper } from "@app/DeviceWrapper.tsx";
import { CommandPalette } from "@components/CommandPalette/index.tsx";
import { DialogManager } from "@components/Dialog/DialogManager.tsx";
import { NewDeviceDialog } from "@components/Dialog/NewDeviceDialog.tsx";
import { KeyBackupReminder } from "@components/KeyBackupReminder.tsx";
import { Toaster } from "@components/Toaster.tsx";
import { ConfigErrorToast } from "@components/UI/ConfigErrorToast.tsx";
import { ErrorPage } from "@components/UI/ErrorPage.tsx";
import Footer from "@components/UI/Footer.tsx";
import { KioskErrorPage } from "@components/UI/KioskErrorPage.tsx";
import { useAutoConnect } from "@core/hooks/useAutoConnect.ts";
import { useTheme } from "@core/hooks/useTheme.ts";
import { SidebarProvider, useAppStore, useDeviceStore } from "@core/stores";
// import { SidebarProvider, ThemeProvider } from "@meshtastic/ui";
import { Dashboard } from "@pages/Dashboard/index.tsx";
import { Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ErrorBoundary } from "react-error-boundary";
import { MapProvider } from "react-map-gl/maplibre";

export function App() {
  useTheme();

  const { loading, connecting, error, config, retry } = useAutoConnect();
  const { getDevice } = useDeviceStore();
  const {
    selectedDeviceId,
    setConnectDialogOpen,
    connectDialogOpen,
    kioskMode,
  } = useAppStore();

  const device = getDevice(selectedDeviceId);

  // Show loading screen while checking for autoconnect config
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background-primary text-text-primary">
        <p>Loading...</p>
      </div>
    );
  }

  // Show config validation error toast (user can still use normal UI)
  const hasConfigError = error && !config && !kioskMode;

  // Show kiosk error page (connection failed in kiosk mode)
  const hasConnectionError = error && config && kioskMode;

  return (
    <ErrorBoundary FallbackComponent={ErrorPage}>
      {hasConfigError && <ConfigErrorToast error={error} />}

      {hasConnectionError && (
        <KioskErrorPage url={config.url} onRetry={retry} retrying={connecting} />
      )}

      {!hasConnectionError && (
        <>
          {!kioskMode && (
            <NewDeviceDialog
              open={connectDialogOpen}
              onOpenChange={(open) => {
                setConnectDialogOpen(open);
              }}
            />
          )}
          <Toaster />
          <TanStackRouterDevtools position="bottom-right" />
          <DeviceWrapper deviceId={selectedDeviceId}>
            <div
              className="flex h-screen flex-col bg-background-primary text-text-primary"
              style={{ scrollbarWidth: "thin" }}
            >
              <SidebarProvider>
                <div className="h-full flex flex-1 flex-col">
                  {device ? (
                    <div className="h-full flex w-full">
                      <DialogManager />
                      <KeyBackupReminder />
                      <CommandPalette />
                      <MapProvider>
                        <Outlet />
                      </MapProvider>
                    </div>
                  ) : (
                    <>
                      <Dashboard />
                      <Footer />
                    </>
                  )}
                </div>
              </SidebarProvider>
            </div>
          </DeviceWrapper>
        </>
      )}
    </ErrorBoundary>
  );
}
