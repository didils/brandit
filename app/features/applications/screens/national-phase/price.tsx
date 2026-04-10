/**
 * National Phase Price Page
 *
 * 국제출원 국내단계 비용 안내 페이지입니다.
 */
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

export default function Price() {
  const { t } = useTranslation();
  return (
    <div className="pb-70">
      <div className="mt-9 flex h-full w-full flex-col gap-5 pb-20">
        <div className="prose prose-sm dark:prose-invert mb-15 flex flex-col gap-10">
          <h1 className="scroll-m-20 text-6xl leading-tight font-bold tracking-tighter text-balance text-foreground">
            {t("nationalPhase.price.title")}
          </h1>
        </div>
        <div className="flex flex-row justify-center gap-5">
          <Card className="group flex w-[50%] flex-row rounded-md bg-card p-1 transition-shadow duration-300 hover:shadow-lg">
            <div className="flex w-[50%] flex-col">
              <CardHeader className="pt-5">
                <CardTitle className="pb-3 text-xl text-foreground">
                  {t("nationalPhase.price.standardTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <p className="text-sm text-muted-foreground">
                  {t("nationalPhase.price.standardDesc")}
                </p>
              </CardContent>
              <CardFooter className="pb-6">
                <Button
                  variant="default"
                  asChild
                  className="group-hover:bg-primary/90 h-8 rounded-full px-4 text-base font-medium transition-colors"
                >
                  <Link to="/applications/national-phase/start">
                    {t("nationalPhase.price.getStarted")}
                  </Link>
                </Button>
              </CardFooter>
            </div>
            <h2 className="flex w-[50%] items-center justify-center rounded-xs border-b bg-muted text-center text-3xl font-medium tracking-tighter text-foreground">
              ₩290,000
            </h2>
          </Card>
          <Card className="group flex w-[50%] flex-row rounded-md bg-card p-1 transition-shadow duration-300 hover:shadow-lg">
            <div className="flex w-[50%] flex-col">
              <CardHeader className="pt-5">
                <CardTitle className="pb-3 text-xl text-foreground">
                  {t("nationalPhase.price.expeditedTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <p className="text-sm text-muted-foreground">
                  {t("nationalPhase.price.expeditedDesc")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("nationalPhase.price.expeditedGuarantee")}
                </p>
              </CardContent>
              <CardFooter className="pb-6">
                <Button
                  variant="default"
                  asChild
                  className="group-hover:bg-primary/90 h-8 rounded-full px-4 text-base font-medium transition-colors"
                >
                  <Link to="/applications/national-phase/start">
                    {t("nationalPhase.price.getStarted")}
                  </Link>
                </Button>
              </CardFooter>
            </div>
            <h2 className="flex w-[50%] items-center justify-center rounded-xs border-b bg-muted text-center text-3xl font-medium tracking-tighter text-foreground">
              ₩390,000
            </h2>
          </Card>
        </div>

        <div className="mx-auto mt-8 max-w-4xl">
          <Card className="group border-border bg-muted transition-shadow duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <h3 className="mb-4 text-xl font-semibold text-foreground">
                {t("nationalPhase.price.includedTitle")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(["1", "2", "3", "4", "5", "6"] as const).map((n) => (
                  <div key={n} className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">
                      {t(`nationalPhase.price.included${n}`)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
