import { AlertCircleIcon, FileCheck2Icon } from "lucide-react";
import { useEffect, useState } from "react";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
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
  rawImage,
  setRawImage,
  finalImage,
  setFinalImage,
  showEditor,
  setShowEditor,
  showCropper,
  setShowCropper,
  croppedImage,
  setCroppedImage,
  title,
  nameEn,
  addressEn,
  setNameEn,
  setAddressEn,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  rawImage: File | null;
  setRawImage: (image: File | null) => void;
  finalImage: File | null;
  setFinalImage: (image: File | null) => void;
  showEditor: boolean;
  setShowEditor: (show: boolean) => void;
  showCropper: boolean;
  setShowCropper: (show: boolean) => void;
  croppedImage: File | null;
  setCroppedImage: (image: File | null) => void;
  title: string;
  nameEn: string;
  addressEn: string;
  setNameEn: (name: string) => void;
  setAddressEn: (address: string) => void;
}) {
  // ✅ 공통 입력값
  const [entityType, setEntityType] = useState<"person" | "company">("person");
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

  useEffect(() => {
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    setNameEn(fullName);
  }, [firstName, lastName]);

  useEffect(() => {
    if (!croppedImage) {
      setSignatureUrl("");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setSignatureUrl(reader.result);
      }
    };
    reader.readAsDataURL(croppedImage);
  }, [croppedImage]);

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
    <div>
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
                          <SelectLabel>
                            Nationality of the applicant
                          </SelectLabel>
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
                        please review the information carefully before
                        proceeding.
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
              </TabsContent>
            </Tabs>
            <div className="flex flex-col gap-1">
              <Label>Delegation Method</Label>
              <small className="text-muted-foreground">
                Select the appropriate method to grant Power of Attorney
              </small>

              <Tabs defaultValue="digital" className="flex flex-col gap-4">
                {/* ✅ 위임 유형 선택 Tabs */}
                <TabsList className="w-full justify-around">
                  <TabsTrigger value="digital">
                    <div className="flex flex-col items-center">
                      <Label>Digital Authorization</Label>
                      {/* <p className="text-muted-foreground text-center text-sm">
                      Use an uploaded signature image to authorize
                      electronically.
                    </p> */}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="paper">
                    <div className="flex flex-col items-center">
                      <Label>Paper-Based Authorization</Label>
                      {/* <p className="text-muted-foreground text-center text-sm">
                      Submit a scanned PDF after printing and signing the POA
                      form.
                    </p> */}
                    </div>
                  </TabsTrigger>
                </TabsList>

                {/* ✅ 디지털 위임 탭: 이미지 업로드 */}
                <TabsContent value="digital">
                  <Card>
                    <CardHeader>
                      <CardTitle>Digital Authorization</CardTitle>
                      <CardDescription>
                        Upload a signature image to instantly authorize via
                        electronic Power of Attorney.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="tabs-demo-name">Signature Image</Label>
                        {croppedImage ? (
                          <div className="relative w-full max-w-xs">
                            <img
                              src={URL.createObjectURL(croppedImage)}
                              alt="미리보기 이미지"
                              className="w-full rounded border object-contain shadow"
                            />
                            <Button
                              variant="ghost"
                              onClick={() => setCroppedImage(null)} // ❌ 이미지 초기화
                              className="absolute top-1 right-1 rounded bg-white/80 px-2 py-1 text-xs hover:bg-white"
                            >
                              Re-select
                            </Button>
                          </div>
                        ) : (
                          <ImageDropzone
                            rawImage={rawImage}
                            setRawImage={setRawImage}
                            finalImage={finalImage}
                            setFinalImage={setFinalImage}
                            showEditor={showEditor}
                            setShowEditor={setShowEditor}
                          />
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-row justify-end">
                      <Button
                        onClick={async () => {
                          const { generatePOAClient } = await import(
                            "~/core/lib/generate-pdf.client"
                          );
                          generatePOAClient({
                            elementId: "pdf-area",
                            filename: `POA_${nameEn}.pdf`,
                          });
                        }}
                      >
                        Generate POA
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                {/* ✅ 종이 기반 위임 탭: PDF 업로드 */}
                <TabsContent value="paper">
                  <Card>
                    <CardHeader>
                      <CardTitle>Paper-Based Authorization</CardTitle>
                      <CardDescription>
                        Download the Power of Attorney form, sign it manually,
                        and upload a scanned PDF.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="tabs-demo-pdf">
                          Signed POA Document (PDF)
                        </Label>
                        <FileDropzone onFileSelect={() => {}} />
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-row justify-end">
                      <Button variant="outline">
                        <FileCheck2Icon />
                        Upload Completed POA
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
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
      <div
        id="pdf-area"
        className="pointer-events-none absolute top-0 left-0 z-[-9999] min-h-[297mm] w-[210mm] bg-white p-10 font-serif text-sm text-black"
      >
        <div className="flex flex-col gap-0 text-xs">
          <p>LIDAM IP LAW FIRM</p>
          <p>
            2F, 9-15, Seocho-daero 32-gil, Seocho-gu, Seoul, 06661, Rep. of
            KOREA
          </p>
          <p>Phone: +82 2 6949 6993</p>
          <p>Fax: +82 70 8673 6993</p>
          <p>Email: lidamip@lidamip.com</p>
        </div>

        <h1 className="my-6 text-center text-xl font-bold underline">
          POWER OF ATTORNEY
        </h1>

        <p>
          I/We, the undersigned, <strong>{nameEn}</strong> of{" "}
          <strong>{addressEn}</strong>
        </p>

        <p className="mt-4">
          do hereby appoint LIDAM IP LAW FIRM (attorney code: 9-2020-100128-7),
          registered patent attorney of Seoul, Republic of Korea, as my/our
          lawful attorney to take on my/our behalf proceedings for:
        </p>

        <p className="mt-4">
          Title of Invention: <strong>{title}</strong>
        </p>

        <p className="mt-4">
          before the Korean Intellectual Property Office, and further empower
          said attorney, if necessary, to do any or all of the following:
        </p>

        <div className="mt-4 flex flex-col gap-2">
          {[...Array(14)].map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="min-w-[1.5rem] text-right">{i + 1}.</span>
              <p className="flex-1">
                {
                  [
                    "To take all necessary proceedings for the filing, prosecution and registration of said application.",
                    "To divide, convert, abandon or withdraw said application.",
                    "To withdraw or abandon a petition, an opposition, a request, a demand, an administrative petition or a suit made in relation to said application.",
                    "To claim priority under Article 55(1) of the Patent Law or Article 11 of Utility Model Law, or withdraw it.",
                    "To make a request for technical evaluation.",
                    "To withdraw an application for registration of an extension of the term of a patent right.",
                    "To appoint and to revoke sub-agents.",
                    "To counteract against an opposition in relation to said application.",
                    "To make an appeal against a decision of rejection of said application or of an amendment, or against a ruling for revocation to the Industrial Property Tribunal, the Patent Court or the Supreme Court.",
                    "To make an administrative petition or suit from dissatisfaction with an administrative action.",
                    "To act as the patent administrator under Article 5 of the Patent Law.",
                    "To perform all other formalities and acts under the provisions concerned with the Patent, Utility Model, Design and Trademark Laws of Korea or any Order issued therefrom before and after the completion of such registration.",
                    "To file application to renew the term of the said registration and to file application to register the reclassification goods of the said registration.",
                    "To file address and name change for the said applicant.",
                  ][i]
                }
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-right">
          <p>
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <p className="mt-1">
            <strong>{nameEn}</strong>
          </p>

          <div className="mt-6 inline-flex items-center gap-2">
            By:
            {signatureUrl ? (
              <img src={signatureUrl} alt="signature" className="w-[200px]" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
