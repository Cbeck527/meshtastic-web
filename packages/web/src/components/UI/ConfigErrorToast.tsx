import { useToast } from "@core/hooks/useToast.ts";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export interface ConfigErrorToastProps {
  error: string;
}

/**
 * Component that displays a toast notification when the autoconnect config is malformed.
 * Uses the existing toast system from the UI library.
 */
export function ConfigErrorToast({ error }: ConfigErrorToastProps) {
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: t("configError.title"),
      description: t("configError.description", { error }),
      variant: "destructive",
      duration: 10000,
    });
  }, [error, t, toast]);

  return null;
}
