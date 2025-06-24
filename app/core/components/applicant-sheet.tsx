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

// 경로는 실제 프로젝트에 맞게 조정

export function ApplicantSheet({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // ✅ 공통 입력값
  const [entityType, setEntityType] = useState<"person" | "company">("person");
  const [nameEn, setNameEn] = useState("");
  const [addressEn, setAddressEn] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // ✅ 법인 전용
  const [signerPosition, setSignerPosition] = useState("");
  const [signerName, setSignerName] = useState("");
  const [representativeName, setRepresentativeName] = useState("");

  const [isLoading, setIsLoading] = useState(false);

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
        className="!w-[600px] !max-w-[600px] overflow-y-auto"
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
              <TabsTrigger value="person">Individual</TabsTrigger>
              <TabsTrigger value="company">Corporation</TabsTrigger>
            </TabsList>

            {/* ✅ Individual input form */}
            <TabsContent value="person" className="mt-8 space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <Label>First Name</Label>
                  <small className="text-muted-foreground">
                    Your given name as shown on your passport or ID
                  </small>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g., John"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label>Last Name</Label>
                  <small className="text-muted-foreground">
                    Your family name or surname
                  </small>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g., Smith"
                  />
                </div>
              </div>

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
          </Tabs>

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
