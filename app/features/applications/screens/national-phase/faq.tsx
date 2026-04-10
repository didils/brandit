/**
 * National Phase FAQ Page
 *
 * 국제출원 국내단계 관련 자주 묻는 질문 페이지입니다.
 */
import { useTranslation } from "react-i18next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/core/components/ui/accordion";

export default function FAQ() {
  const { t } = useTranslation();
  return (
    <div className="prose prose-sm dark:prose-invert">
      <h1>{t("nationalPhase.faq.title")}</h1>
      <div className="not-prose">
        <Accordion type="single" collapsible className="w-full space-y-4">
          {(["1", "2", "3", "4", "5", "6"] as const).map((n) => (
            <AccordionItem
              key={n}
              value={`item-${n}`}
              className="group hover:bg-muted/50 rounded-lg transition-colors"
            >
              <AccordionTrigger className="group-hover:text-primary transition-colors">
                {t(`nationalPhase.faq.q${n}`)}
              </AccordionTrigger>
              <AccordionContent>
                {t(`nationalPhase.faq.a${n}`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
