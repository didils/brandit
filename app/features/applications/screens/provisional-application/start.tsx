/**
 * Start Page
 *
 * 한국 가출원 신청 시작 페이지입니다.
 */
import type { Route } from "./+types/start";

import { ChevronRight, ChevronRightIcon, XIcon } from "lucide-react";
import { Form, Link } from "react-router";

import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";

export const loader = () => {
  return {
    applicants: [
      {
        id: 1,
        name: "Byung Joon",
      },
      {
        id: 2,
        name: "Nicolas",
      },
      {
        id: 3,
        name: "Lynn",
      },
    ],
    inventors: [
      {
        id: 1,
        name: "Byung Joon",
      },
      {
        id: 2,
        name: "Nicolas",
      },
      {
        id: 3,
        name: "Lynn",
      },
    ],
  };
};

export default function Start({ loaderData }: Route.ComponentProps) {
  const { applicants, inventors } = loaderData;
  return (
    <div>
      <div className="flex w-full flex-row items-center justify-between bg-[#0e3359] px-4 py-1.5">
        <h1 className="text-md text-center font-medium text-white">
          Provisional Application
        </h1>
        <h1 className="hidden text-center text-sm font-light text-white md:block">
          Please save your draft before you leave
        </h1>
        <div>
          <Button variant="outline" className="h-7 rounded-md">
            Save Draft
          </Button>
        </div>
      </div>
      <div className="w-full border-b border-gray-300 bg-[#0e3359]">
        <div className="mx-auto w-full rounded-tl-md rounded-tr-md bg-[#f6f9fc] px-[1vw] py-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="size-8">
                <XIcon className="size-4" />
              </Button>
              <span className="text-md font-light text-[#414552]">
                Fill out your provisional application
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-md p-3 font-medium">
                Hide preview
              </Button>
              <Button
                variant="default"
                className="rounded-md p-3 font-semibold"
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-row items-start justify-center gap-20 bg-blue-300 py-6">
        <div className="flex w-[70%] flex-col items-start gap-10 space-y-5 bg-red-300">
          <Form className="mx-auto flex w-[50%] flex-col items-start space-y-2">
            <Label
              htmlFor="applicant"
              className="flex flex-col items-start text-lg"
            >
              Applicant
            </Label>
            <Input
              id="applicant"
              name="applicant"
              required
              type="text"
              placeholder="Find or add applicants..."
              className="max-w-md"
            />
          </Form>
          <Form className="mx-auto flex w-[50%] flex-col items-start space-y-2">
            <Label
              htmlFor="applicant"
              className="flex flex-col items-start text-lg"
            >
              Inventor
            </Label>
            <Input
              id="inventor"
              name="inventor"
              required
              type="text"
              placeholder="Find or add inventors..."
              className="max-w-md"
            />
          </Form>
          <Form className="mx-auto flex w-[50%] flex-col items-start space-y-2">
            <Label
              htmlFor="applicant"
              className="flex flex-col items-start text-lg"
            >
              Provisional Specification File
            </Label>
            <Input
              id="file"
              name="file"
              required
              type="file"
              className="max-w-md"
            />
          </Form>
        </div>
        <div className="h-screen w-[30%] bg-[#f5f6f8]">right</div>
      </div>
    </div>
  );
}
