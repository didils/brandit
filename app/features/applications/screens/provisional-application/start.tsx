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
import React, { useState } from "react";
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
    inventors,
    applicants,
  };
};

export const inventors = [
  {
    id: "inventor-1",
    name_kr: "김은정",
    name_en: "Eunjung Kim",
    nationality: "KR",
    id_number: "900101-1234567",
    zipcode: "06000",
    address_kr: "서울특별시 서초구 반포대로 45",
    address_en: "45 Banpo-daero, Seocho-gu, Seoul",
    residence_country: "KR",
  },
  {
    id: "inventor-2",
    name_kr: "이한결",
    name_en: "Hangyeol Lee",
    nationality: "KR",
    id_number: "880202-2345678",
    zipcode: "13500",
    address_kr: "경기도 고양시 일산동구 백마로 12",
    address_en: "12 Baekma-ro, Ilsandong-gu, Goyang-si, Gyeonggi-do",
    residence_country: "KR",
  },
  {
    id: "inventor-3",
    name_kr: "John Smith",
    name_en: "John Smith",
    nationality: "US",
    id_number: "123-45-6789",
    zipcode: "10001",
    address_kr: "미국 뉴욕시 맨해튼 5번가 101",
    address_en: "101 5th Ave, Manhattan, NY, USA",
    residence_country: "US",
  },
  {
    id: "inventor-4",
    name_kr: "사토 유이",
    name_en: "Yui Sato",
    nationality: "JP",
    id_number: "S12345678",
    zipcode: "150-0001",
    address_kr: "일본 도쿄도 시부야구 진구마에 1-2-3",
    address_en: "1-2-3 Jingumae, Shibuya, Tokyo, Japan",
    residence_country: "JP",
  },
  {
    id: "inventor-5",
    name_kr: "최은석",
    name_en: "Eunseok Choi",
    nationality: "KR",
    id_number: "750303-3456789",
    zipcode: "48000",
    address_kr: "부산광역시 사하구 낙동대로 222",
    address_en: "222 Nakdong-daero, Saha-gu, Busan",
    residence_country: "KR",
  },
];

export const applicants = [
  {
    id: "applicant-1",
    name_kr: "홍길동",
    name_en: "Gil-Dong Hong",
    client_code: "A001",
    address_kr: "서울특별시 강남구 테헤란로 123",
    address_en: "123 Teheran-ro, Gangnam-gu, Seoul",
    has_poa: true,
    signature_image_url: "/signatures/gildong.png",
    signer_position: "대표이사",
    signer_name: "홍길동",
    representative_name: "홍길동",
  },
  {
    id: "applicant-2",
    name_kr: "주식회사 미래테크",
    name_en: "MiraeTech Co., Ltd.",
    client_code: "B102",
    address_kr: "경기도 성남시 분당구 판교로 456",
    address_en: "456 Pangyo-ro, Bundang-gu, Seongnam-si, Gyeonggi-do",
    has_poa: true,
    signature_image_url: "/signatures/miraetech.png",
    signer_position: "법무팀장",
    signer_name: "이수진",
    representative_name: "김성훈",
  },
  {
    id: "applicant-3",
    name_kr: "이노베이션랩",
    name_en: "Innovation Lab",
    client_code: "C789",
    address_kr: "부산광역시 해운대구 센텀서로 89",
    address_en: "89 Centumseo-ro, Haeundae-gu, Busan",
    has_poa: false,
    signature_image_url: "",
    signer_position: "CTO",
    signer_name: "박지훈",
    representative_name: "한지민",
  },
  {
    id: "applicant-4",
    name_kr: "강소기업연구소",
    name_en: "Small Business Institute",
    client_code: "D321",
    address_kr: "대전광역시 유성구 대학로 99",
    address_en: "99 Daehak-ro, Yuseong-gu, Daejeon",
    has_poa: true,
    signature_image_url: "/signatures/sbi.png",
    signer_position: "이사",
    signer_name: "최유정",
    representative_name: "오세훈",
  },
  {
    id: "applicant-5",
    name_kr: "최영수",
    name_en: "Youngsoo Choi",
    client_code: "E567",
    address_kr: "인천광역시 연수구 송도미래로 22",
    address_en: "22 Songdo Mirae-ro, Yeonsu-gu, Incheon",
    has_poa: false,
    signature_image_url: "",
    signer_position: "개인사업자",
    signer_name: "최영수",
    representative_name: "",
  },
];

export function ApplicantCombobox({
  selectedNames,
  onChange,
}: {
  selectedNames: string[];
  onChange: (names: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  //   const [value, setValue] = React.useState("");
  //   const [selected, setSelected] = React.useState<string[]>([]);

  const toggleSelect = (value: string) => {
    const updated = selectedNames.includes(value)
      ? selectedNames.filter((v) => v !== value)
      : [...selectedNames, value];
    onChange(updated);
  };

  const removeSelected = (value: string) => {
    onChange(selectedNames.filter((v) => v !== value));
  };

  return (
    <div className="w-full max-w-xl min-w-[280px]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            Click to select or add applicants
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="w-full max-w-xl min-w-[280px] xl:min-w-[500px]">
            <Command>
              <CommandInput placeholder="Search previous applicants" />
              <CommandList>
                <CommandEmpty>No applicant found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      // 새로운 신청자 추가 로직 실행
                      console.log("Add new applicant clicked");
                    }}
                    className="w-full max-w-xl min-w-[280px]"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add new applicant
                  </CommandItem>
                  {applicants.map((applicant) => (
                    <CommandItem
                      key={applicant.name_en}
                      value={applicant.name_en}
                      onSelect={(currentValue) => toggleSelect(currentValue)}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedNames.includes(applicant.name_en)
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
              </CommandList>
            </Command>
          </div>
        </PopoverContent>
      </Popover>

      {/* 🔽 선택된 항목 출력 영역 */}
      <div className="mt-3 space-y-2">
        {selectedNames.map((name) => (
          <SelectedApplicantCard
            key={name}
            name={name}
            onRemove={() => removeSelected(name)}
          />
        ))}
      </div>
    </div>
  );
}

// ✅ 선택된 항목을 출력하는 컴포넌트
function SelectedApplicantCard({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
      <span className="text-sm font-medium">{name}</span>
      <Button
        variant="ghost"
        size="icon"
        className="ml-2 h-5 w-5"
        onClick={onRemove}
      >
        <XIcon className="text-muted-foreground h-4 w-4" />
      </Button>
    </div>
  );
}

export function InventorCombobox({
  selectedNames,
  onChange,
}: {
  selectedNames: string[];
  onChange: (names: string[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  //   const [value, setValue] = React.useState("");
  //   const [selected, setSelected] = React.useState<string[]>([]);

  const toggleSelect = (value: string) => {
    const updated = selectedNames.includes(value)
      ? selectedNames.filter((v) => v !== value)
      : [...selectedNames, value];
    onChange(updated);
  };

  const removeSelected = (value: string) => {
    onChange(selectedNames.filter((v) => v !== value));
  };

  return (
    <div className="w-full max-w-xl min-w-[280px]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            Click to select or add inventors
            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <div className="w-full max-w-xl min-w-[280px] xl:min-w-[500px]">
            <Command>
              <CommandInput placeholder="Search previous inventors" />
              <CommandList>
                <CommandEmpty>No inventor found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      // 새로운 발명자 추가 로직 실행
                      console.log("Add new inventor clicked");
                    }}
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add new inventor
                  </CommandItem>
                  {inventors.map((inventor) => (
                    <CommandItem
                      key={inventor.name_en}
                      value={inventor.name_en}
                      onSelect={(currentValue) => {
                        toggleSelect(currentValue);
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedNames.includes(inventor.name_en)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      <div className="flex flex-col items-start">
                        <div className="text-sm font-medium">
                          {inventor.name_en}
                        </div>
                        <div className="text-muted-foreground pl-2 text-xs">
                          {inventor.address_en}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </PopoverContent>
      </Popover>
      {/* 🔽 선택된 항목 출력 영역 */}
      <div className="mt-3 space-y-2">
        {selectedNames.map((name) => (
          <SelectedApplicantCard
            key={name}
            name={name}
            onRemove={() => removeSelected(name)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Start({ loaderData }: Route.ComponentProps) {
  const { applicants, inventors } = loaderData;
  const [applicantNames, setApplicantNames] = useState<string[]>([]);
  const [inventorNames, setInventorNames] = useState<string[]>([]);

  const handleApplicantChange = (names: string[]) => {
    setApplicantNames(names);
  };

  const handleInventorChange = (names: string[]) => {
    setInventorNames(names);
  };

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
      <div className="flex w-full flex-row items-start justify-center gap-20 py-6">
        <div className="flex w-[70%] flex-col items-start gap-10 space-y-5">
          <Form className="mx-auto flex w-[50%] flex-col items-start gap-10 space-y-2">
            {/* <div className="flex flex-col items-start">
              <Label
                htmlFor="applicant"
                className="flex flex-col items-start text-lg"
              >
                Title of the invention
              </Label>
              <small className="text-muted-foreground pb-1.5 text-sm font-light">
                Please enter the title of the invention.
              </small>
              <Input
                id="applicant"
                name="applicant"
                required
                type="text"
                placeholder="Title of the invention"
                className=""
              />
            </div> */}
            <div className="flex w-full flex-col items-start">
              <Label
                htmlFor="applicant"
                className="flex flex-col items-start text-lg"
              >
                Title of the invention
              </Label>
              <small className="text-muted-foreground pb-1.5 text-sm font-light">
                A brief, descriptive title highlighting the invention’s main
                function or features.
              </small>
              <Input
                id="applicant"
                name="applicant"
                required
                type="text"
                placeholder="Title of the invention"
                className="w-full max-w-xl min-w-[280px]"
              />
            </div>
            <div className="flex w-full max-w-xl min-w-[280px] flex-col items-start">
              <Label
                htmlFor="applicant"
                className="flex flex-col items-start text-lg"
              >
                Applicant
              </Label>
              <small className="text-muted-foreground pb-1.5 text-sm font-light">
                The applicant must be an individual or entity entitled to the
                invention. Multiple applicants allowed.
              </small>
              <Input
                id="applicant"
                name="applicant"
                required
                type="hidden"
                className="max-w-md min-w-xl"
                value="테스트"
              />
              <ApplicantCombobox
                selectedNames={applicantNames}
                onChange={handleApplicantChange}
              />
            </div>
            <div className="flex w-full max-w-xl min-w-[280px] flex-col items-start">
              <Label
                htmlFor="inventor"
                className="flex flex-col items-start text-lg"
              >
                Inventor
              </Label>
              <small className="text-muted-foreground pb-1.5 text-sm font-light">
                At least one natural person must have contributed to the
                invention.
              </small>
              <Input
                id="inventor"
                name="inventor"
                required
                type="hidden"
                placeholder="Find or add inventors..."
                className="max-w-md"
              />
              <InventorCombobox
                selectedNames={inventorNames}
                onChange={handleInventorChange}
              />
            </div>
            <div className="flex flex-col items-start">
              <Label
                htmlFor="file"
                className="flex flex-col items-start text-lg"
              >
                Provisional Specification File
              </Label>
              <small className="text-muted-foreground text-sm font-light">
                pdf, docx, pptx or any other file types of documents are
                supported.
              </small>
              <Input
                id="file"
                name="file"
                required
                type="file"
                className="mt-1.5 max-w-md min-w-xl"
              />
            </div>
          </Form>
        </div>
        <div className="h-screen w-[30%] bg-[#f5f6f8]">right</div>
      </div>
    </div>
  );
}
