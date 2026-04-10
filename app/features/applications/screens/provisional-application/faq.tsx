/**
 * FAQ Page
 *
 * 한국 가출원 관련 자주 묻는 질문 페이지입니다.
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
      <h1>{t("provisional.faq.title")}</h1>
      <div className="not-prose">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>{t("provisional.faq.q1")}</AccordionTrigger>
            <AccordionContent>{t("provisional.faq.a1")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>{t("provisional.faq.q2")}</AccordionTrigger>
            <AccordionContent>{t("provisional.faq.a2")}</AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>{t("provisional.faq.q3")}</AccordionTrigger>
            <AccordionContent>{t("provisional.faq.a3")}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
