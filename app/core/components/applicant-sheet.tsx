import { AlertCircleIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "~/core/components/ui/button";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/core/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/core/components/ui/tabs";
import { browserClient } from "~/core/lib/browser-client";

import { ImageDropzone } from "./imagedropzone";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { FileDropzone } from "./ui/filedropzone";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const countries = [
  { name: "United States", code: "US" },
  { name: "South Korea", code: "KR" },
  { name: "European Union", code: "EU" },
  { name: "China", code: "CN" },
  { name: "Japan", code: "JP" },
];

export function ApplicantSheet({
  isOpen,
  onOpenChange,
  selectedCountry,
  setSelectedCountry,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
}) {
  // ✅ 공통 입력값
  const [entityType, setEntityType] = useState<"person" | "company">("person");
  const [nameEn, setNameEn] = useState("");
  const [addressEn, setAddressEn] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [delegationType, setDelegationType] = useState<"simple" | "standard">(
    "simple",
  );

  // ✅ 법인 전용
  const [signerPosition, setSignerPosition] = useState("");
  const [signerName, setSignerName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [customCountry, setCustomCountry] = useState("");

  const handleSave = async () => {
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await browserClient.auth.getUser();

      if (!user) {
        alert("로그인이 필요합니다.");
        return;
      }

      const insertData: any = {
        user_id: user.id,
        name_en: nameEn,
        address_en: addressEn,
        signature_image_url: signatureUrl,
      };

      if (entityType === "company") {
        insertData.signer_position = signerPosition;
        insertData.signer_name = signerName;
        insertData.representative_name = representativeName;
      } else {
        insertData.signer_position = "본인";
        insertData.signer_name = nameEn;
        insertData.representative_name = null;
      }

      const { error } = await browserClient.from("entities").insert(insertData);

      if (error) {
        console.error("저장 실패:", error.message);
        alert("저장 중 오류가 발생했습니다.");
      } else {
        alert("저장 완료!");
        // 값 초기화
        setNameEn("");
        setAddressEn("");
        setSignatureUrl("");
        setSignerPosition("");
        setSignerName("");
        setRepresentativeName("");
        onOpenChange(false); // 시트 닫기
      }
    } catch (e) {
      console.error(e);
      alert("예외가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="mb-10 !w-[600px] !max-w-[600px] overflow-y-auto pb-10"
      >
        <SheetHeader>
          <SheetTitle>Add New Applicant</SheetTitle>
          <SheetDescription>
            Please enter the information for the new applicant.
          </SheetDescription>
        </SheetHeader>

        {/* ✅ Tabs로 구분 */}
        <div className="mx-14 flex flex-col gap-4">
          <Tabs
            defaultValue="person"
            onValueChange={(v) => setEntityType(v as "person" | "company")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="company">Corporation</TabsTrigger>
              <TabsTrigger value="person">Individual</TabsTrigger>
            </TabsList>
            {/* ✅ Corporation input form */}
            <TabsContent value="company" className="mt-4 space-y-4">
              <div className="flex flex-col gap-1">
                <Label>Company Name (English)</Label>
                <Input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                />
                <small className="text-muted-foreground">
                  Must match the name on your business registration
                </small>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Company Name (English)</Label>
                <Input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                />
                <small className="text-muted-foreground">
                  Must match the name on your business registration
                </small>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Address (English)</Label>
                <Input
                  value={addressEn}
                  onChange={(e) => setAddressEn(e.target.value)}
                />
                <small className="text-muted-foreground">
                  Full address of the company headquarters
                </small>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Signature Image URL</Label>
                <Input
                  value={signatureUrl}
                  onChange={(e) => setSignatureUrl(e.target.value)}
                />
                <small className="text-muted-foreground">
                  URL to the corporate seal or signature image
                </small>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Signer's Position</Label>
                <Input
                  value={signerPosition}
                  onChange={(e) => setSignerPosition(e.target.value)}
                />
                <small className="text-muted-foreground">
                  e.g., CEO, Director, or authorized officer
                </small>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Signer's Name</Label>
                <small className="text-muted-foreground">
                  Full name of the person signing the documents
                </small>
                <Input
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Representative's Name</Label>
                <small className="text-muted-foreground">
                  Name of the registered representative of the company
                </small>
                <Input
                  value={representativeName}
                  onChange={(e) => setRepresentativeName(e.target.value)}
                />
              </div>
            </TabsContent>

            {/* ✅ Individual input form */}

            <TabsContent value="person" className="mt-8 space-y-4">
              {/* ✅ 국가 선택 */}
              <div className="flex flex-col gap-1">
                <Label>Nationality of the applicant</Label>
                <div className="flex w-full flex-row justify-between gap-1">
                  <Select
                    onValueChange={(value) => {
                      if (value === "etc") {
                        setSelectedCountry("etc"); // 초기화 (선택된 국가 없음)
                      } else {
                        setSelectedCountry(value); // 일반 국가 선택 시 설정
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder="Select a country"
                        // value는 외부에서 관리하므로 selectedCountry 사용
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Nationality of the applicant</SelectLabel>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="etc">Other nationality</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {/* ❗ "기타 국가"를 선택했을 때만 input 표시 */}
                  {selectedCountry === "etc" && (
                    <Input
                      placeholder="Enter nationality"
                      value={customCountry}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setCustomCountry(inputValue);
                        //   setSelectedCountry(inputValue); // 입력된 국가를 selectedCountry로 설정
                      }}
                    />
                  )}
                </div>
              </div>
              <Alert variant="destructive">
                <AlertCircleIcon />
                <AlertTitle>
                  Nationality should match the country of the address.
                </AlertTitle>
                <AlertDescription>
                  <p>
                    Please ensure that the applicant's nationality corresponds
                    to the country of their address.
                  </p>
                  <ul className="list-inside list-disc text-sm">
                    <li>
                      For example, if the address is in the United States, the
                      nationality should also be set to the U.S.
                    </li>
                    <li>
                      If the nationality differs from the address country,
                      please review the information carefully before proceeding.
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>
              {/* ✅ 이름 입력 */}
              <div className="flex flex-row justify-between gap-2">
                <div className="flex w-1/2 flex-col gap-1">
                  <Label>First Name</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g., John"
                  />
                </div>

                <div className="flex w-1/2 flex-col gap-1">
                  <Label>Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g., Smith"
                  />
                </div>
              </div>

              {/* ✅ 주소 입력 */}
              <div className="flex flex-col gap-1">
                <Label>Address (English)</Label>
                <small className="text-muted-foreground">
                  Full mailing address in English
                </small>
                <Input
                  value={addressEn}
                  onChange={(e) => setAddressEn(e.target.value)}
                />
              </div>
              {/* ✅ 서명 이미지 URL */}
              <div className="flex flex-col gap-1">
                <Label>Signature Image URL</Label>
                <Input
                  value={signatureUrl}
                  onChange={(e) => setSignatureUrl(e.target.value)}
                />
                <small className="text-muted-foreground">
                  Link to a PNG or JPG image of your signature
                </small>
              </div>
            </TabsContent>
          </Tabs>
          <div className="mt-6 flex flex-col gap-4">
            <RadioGroup
              defaultValue="simple"
              onValueChange={(value) =>
                setDelegationType(value as "simple" | "standard")
              }
            >
              {/* ✅ 간편 위임 옵션 */}
              <div className="flex items-center gap-3">
                <RadioGroupItem value="simple" id="simple" />
                <div>
                  <Label htmlFor="simple">Simple Power of Attorney</Label>
                  <p className="text-muted-foreground text-sm">
                    Upload a signature image to submit a simplified Power of
                    Attorney.
                  </p>
                </div>
              </div>

              {/* ✅ 일반 위임 옵션 */}
              <div className="flex items-center gap-3">
                <RadioGroupItem value="standard" id="standard" />
                <div>
                  <Label htmlFor="formal">Formal Power of Attorney</Label>
                  <p className="text-muted-foreground text-sm">
                    Download the POA form, sign it, and upload the signed PDF.
                  </p>
                </div>
              </div>
            </RadioGroup>

            {/* ✅ 선택된 위임 방식에 따라 컴포넌트 출력 */}
            {delegationType === "simple" ? (
              <ImageDropzone onFileSelect={() => {}} />
            ) : (
              <FileDropzone onFileSelect={() => {}} />
            )}
          </div>
          <div className="mt-6">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Saving..." : "Save Applicant"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
