import { Button } from "@components/UI/Button.tsx";
import { Heading } from "@components/UI/Typography/Heading.tsx";
import { P } from "@components/UI/Typography/P.tsx";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface KioskErrorPageProps {
  url: string;
  onRetry: () => void;
  retrying: boolean;
}

export function KioskErrorPage({
  url,
  onRetry,
  retrying,
}: KioskErrorPageProps) {
  const { t } = useTranslation();

  return (
    <article className="w-full h-screen overflow-y-auto bg-background-primary text-text-primary">
      <section className="flex flex-col items-center justify-center min-h-screen px-4 md:px-8 gap-8">
        <div className="flex flex-col items-center max-w-2xl text-center gap-6">
          <AlertCircle size={80} className="text-red-500" />

          <div className="space-y-4">
            <Heading as="h1" className="text-text-primary text-3xl md:text-4xl">
              {t("kioskError.title")}
            </Heading>

            <P className="text-lg">
              {t("kioskError.description", { url })}
            </P>

            <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <P className="text-sm text-slate-600 dark:text-slate-400 font-mono break-all">
                {url}
              </P>
            </div>
          </div>

          <Button
            onClick={onRetry}
            disabled={retrying}
            size="lg"
            className="mt-4"
          >
            {retrying ? t("kioskError.retrying") : t("kioskError.retryButton")}
          </Button>
        </div>

        <div className="hidden md:block md:max-w-64 lg:max-w-80 w-full">
          <img
            src="/chirpy.svg"
            alt="Chirpy the Meshtastic mascot"
            className="max-w-full h-auto opacity-50"
          />
        </div>
      </section>
    </article>
  );
}
