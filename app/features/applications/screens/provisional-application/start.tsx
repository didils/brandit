/**
 * Start Page
 *
 * 한국 가출원 신청 시작 페이지입니다.
 */
import type { Route } from "./+types/start";

import {
  CheckIcon,
  ChevronRight,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import React from "react";
import { Form, Link } from "react-router";

import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/core/components/ui/command";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/core/components/ui/popover";
import { cn } from "~/core/lib/utils";

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

const applicants = [
  {
    name_en: "Samsung Electronics Co., Ltd.",
    address_en:
      "1, Samsung-ro, Giheung-gu, Yongin-si, Gyeonggi-do, Republic of Korea",
  },
  {
    name_en: "Apple Inc.",
    address_en:
      "1600 Amphitheatre Parkway, Mountain View, CA 94043, United States",
  },
  {
    name_en: "Google Inc.",
    address_en:
      "1600 Amphitheatre Parkway, Mountain View, CA 94043, United States",
  },
];

export function ApplicantCombobox() {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="min-w-xl justify-between font-normal"
        >
          {selected.length > 0
            ? selected.join(", ")
            : "Select previous applicants..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-xl p-0">
        <Command>
          <CommandInput placeholder="Search previous applicants" />
          <CommandList>
            <CommandEmpty>No applicant found.</CommandEmpty>
            <CommandGroup>
              {applicants.map((applicant) => (
                <CommandItem
                  key={applicant.name_en}
                  value={applicant.name_en}
                  onSelect={(currentValue) => {
                    setSelected((prev) =>
                      prev.includes(currentValue)
                        ? prev.filter((v) => v !== currentValue)
                        : [...prev, currentValue],
                    );
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(applicant.name_en)
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                  <div className="flex flex-col items-start">
                    <div className="text-sm font-medium">
                      {applicant.name_en}
                    </div>
                    <div className="text-muted-foreground pl-2 text-xs">
                      {applicant.address_en}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandItem
              onSelect={() => {
                // 새로운 신청자 추가 로직 실행
                console.log("Add new applicant clicked");
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add new applicant
            </CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

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
          <Form className="mx-auto flex w-[50%] flex-col items-start gap-10 space-y-2">
            <div>
              <Label
                htmlFor="applicant"
                className="flex flex-col items-start text-lg"
              >
                Title of the invention
              </Label>
              <Input
                id="applicant"
                name="applicant"
                required
                type="text"
                placeholder="Title of the invention"
                className="max-w-md min-w-xl"
              />
            </div>
            <div>
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
                className="max-w-md min-w-xl"
                value="테스트"
              />
              <ApplicantCombobox />
            </div>
            <div>
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
            </div>
            <div>
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
            </div>
          </Form>
        </div>
        <div className="h-screen w-[30%] bg-[#f5f6f8]">right</div>
      </div>
    </div>
  );
}
