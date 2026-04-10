import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";

/**
 * Price Page
 *
 * 한국 가출원 비용 안내 페이지입니다.
 */
export default function Price() {
  const { t } = useTranslation();
  return (
    <div className="pb-70">
      <div className="mt-9 flex h-full w-full flex-col gap-5 pb-20">
        <div className="prose prose-sm dark:prose-invert mb-15 flex flex-col gap-10">
          <h1 className="scroll-m-20 text-6xl leading-tight font-bold tracking-tighter text-balance text-foreground">
            <p>{t("provisional.price.title1")}</p>
            <p>{t("provisional.price.title2")}</p>
          </h1>
        </div>
        <div className="flex flex-row justify-center gap-5">
          <Card className="flex w-[50%] flex-row rounded-md bg-card p-1">
            <div className="flex w-[50%] flex-col">
              <CardHeader className="pt-5">
                <CardTitle className="pb-3 text-xl text-foreground">
                  {t("provisional.price.singleTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <p className="text-sm text-muted-foreground">
                  {t("provisional.price.singleDesc")}
                </p>
              </CardContent>
              <CardFooter className="pb-6">
                <Button
                  variant="default"
                  asChild
                  className="h-8 rounded-full px-4 text-base font-medium"
                >
                  <Link to="/applications/provisional-application">
                    {t("provisional.price.getStarted")}
                  </Link>
                </Button>
              </CardFooter>
            </div>
            <h2 className="flex w-[50%] items-center justify-center rounded-xs border-b bg-muted text-center text-3xl font-medium tracking-tighter text-foreground">
              $400
            </h2>
          </Card>
          <Card className="flex w-[50%] flex-row rounded-md bg-card p-1">
            <div className="flex w-[50%] flex-col">
              <CardHeader className="pt-5">
                <CardTitle className="pb-3 text-xl text-foreground">
                  {t("provisional.price.multiTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <p className="text-sm text-muted-foreground">
                  {t("provisional.price.multiDesc1")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("provisional.price.multiDesc2")}
                </p>
              </CardContent>
              <CardFooter className="pb-6">
                <Button
                  variant="default"
                  asChild
                  className="h-8 rounded-full px-4 text-base font-medium"
                >
                  <Link to="/applications/provisional-application">
                    {t("provisional.price.getStarted")}
                  </Link>
                </Button>
              </CardFooter>
            </div>
            <h2 className="flex w-[50%] items-center justify-center rounded-xs border-b bg-muted text-center text-3xl font-medium tracking-tighter text-foreground">
              <p>$360/each</p>
            </h2>
          </Card>
        </div>
      </div>
    </div>
  );
}
