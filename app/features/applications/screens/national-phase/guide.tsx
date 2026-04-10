/**
 * National Phase Guide Page
 *
 * 국제출원 국내단계 진입 가이드 페이지입니다.
 */
import { useTranslation } from "react-i18next";

export default function Guide() {
  const { t } = useTranslation();
  return (
    <div className="prose prose-sm dark:prose-invert mx-auto max-w-4xl">
      <h1>{t("nationalPhase.guide.title")}</h1>

      {(
        [
          {
            titleKey: "step1Title",
            bodyKey: "step1Body",
            items: ["step1_1", "step1_2", "step1_3", "step1_4"],
          },
          {
            titleKey: "step2Title",
            bodyKey: "step2Body",
            items: ["step2_1", "step2_2", "step2_3", "step2_4"],
          },
          {
            titleKey: "step3Title",
            bodyKey: "step3Body",
            items: ["step3_1", "step3_2", "step3_3", "step3_4"],
          },
          {
            titleKey: "step4Title",
            bodyKey: "step4Body",
            items: ["step4_1", "step4_2", "step4_3", "step4_4"],
          },
        ] as const
      ).map((step) => (
        <div
          key={step.titleKey}
          className="bg-card border-border group mb-8 rounded-lg border p-6 transition-shadow duration-300 hover:shadow-lg"
        >
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            {t(`nationalPhase.guide.${step.titleKey}`)}
          </h2>
          <p className="mb-4 text-muted-foreground">
            {t(`nationalPhase.guide.${step.bodyKey}`)}
          </p>
          <ul className="list-inside list-disc space-y-2 text-muted-foreground">
            {step.items.map((itemKey) => (
              <li key={itemKey}>{t(`nationalPhase.guide.${itemKey}`)}</li>
            ))}
          </ul>
        </div>
      ))}

      <div className="group rounded-lg border border-border bg-muted p-6 transition-shadow duration-300 hover:shadow-lg">
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          {t("nationalPhase.guide.noticeTitle")}
        </h2>
        <div className="space-y-3 text-muted-foreground">
          <div className="flex items-start space-x-2">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-destructive" />
            <p>{t("nationalPhase.guide.notice1")}</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-secondary" />
            <p>{t("nationalPhase.guide.notice2")}</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
            <p>{t("nationalPhase.guide.notice3")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
