/**
 * Guide Page
 *
 * 한국 가출원 출원 가이드 페이지입니다.
 */
import { useTranslation } from "react-i18next";

export default function Guide() {
  const { t } = useTranslation();
  return (
    <div className="prose prose-sm dark:prose-invert">
      <h1>{t("provisional.guide.title")}</h1>
      <h2>{t("provisional.guide.step1Title")}</h2>
      <p>{t("provisional.guide.step1Body")}</p>
      <ul>
        <li>{t("provisional.guide.step1_1")}</li>
        <li>{t("provisional.guide.step1_2")}</li>
        <li>{t("provisional.guide.step1_3")}</li>
        <li>{t("provisional.guide.step1_4")}</li>
      </ul>
      <h2>{t("provisional.guide.step2Title")}</h2>
      <p>{t("provisional.guide.step2Body")}</p>
      <ul>
        <li>{t("provisional.guide.step2_1")}</li>
        <li>{t("provisional.guide.step2_2")}</li>
        <li>{t("provisional.guide.step2_3")}</li>
        <li>{t("provisional.guide.step2_4")}</li>
      </ul>
      <h2>{t("provisional.guide.step3Title")}</h2>
      <p>{t("provisional.guide.step3Body")}</p>
      <ul>
        <li>{t("provisional.guide.step3_1")}</li>
        <li>{t("provisional.guide.step3_2")}</li>
        <li>{t("provisional.guide.step3_3")}</li>
      </ul>
    </div>
  );
}
