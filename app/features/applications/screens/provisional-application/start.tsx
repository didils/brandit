/**
 * Start Page
 *
 * 한국 가출원 신청 시작 페이지입니다.
 */
import type { Route } from "./+types/start";

import {
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2,
  PlusIcon,
  XIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Form, redirect, useNavigate } from "react-router";
import { toast } from "sonner";

import { Combobox } from "~/core/components/combobox";
import { Button } from "~/core/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "~/core/components/ui/dialog";
import { Dialog, DialogTitle } from "~/core/components/ui/dialog";
import { DialogDescription } from "~/core/components/ui/dialog";
import { FileDropzone } from "~/core/components/ui/filedropzone";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { browserClient } from "~/core/lib/browser-client";

export async function loader({ request }: Route.LoaderArgs) {
  //   console.log("🚀 [loader] 실행됨");
  const { default: makeServerClient } = await import(
    "~/core/lib/supa-client.server"
  );
  const [client] = makeServerClient(request);

  const {
    data: { user },
  } = await client.auth.getUser();
  //   console.log("🚀 [loader] 실행됨 2");
  if (!user) {
    //   console.log("🚫 사용자 없음 - 비로그인 상태");
    return {
      user: null,
      applicants: [],
      inventors: [],
    };
  }

  const { data: applicants, error: applicantsError } = await client
    .from("entities")
    .select("*")
    .eq("user_id", user.id);

  const { data: inventors, error: inventorsError } = await client
    .from("inventors")
    .select("*")
    .eq("user_id", user.id);

  // console.log("🚀 [loader] 실행됨 3", {
  //   applicants,
  //   inventors,
  // });

  // ✅ 에러 발생 시 반환
  if (applicantsError || inventorsError) {
    // console.error("❗ 데이터 로딩 에러", {
    //   applicantsError,
    //   inventorsError,
    // });

    throw new Response("Failed to fetch applicants or inventors", {
      status: 500,
    });
  }
  //   console.log("🚀 [loader] 실행됨 3", {
  //     applicants,
  //     inventors,
  //   });
  return {
    user,
    applicants,
    inventors,
  };
}

type Applicant = {
  id: string;
  name_kr: string;
  name_en: string;
  nationality: string;
  id_number: string;
  zipcode: string;
  address_kr: string;
  address_en: string;
  residence_country: string;
};

export type Inventor = {
  id: string;
  user_id: string;

  name_kr: string;
  name_en: string | null;

  id_number: string | null;

  nationality: string | null;
  residence_country: string | null;

  address_kr: string | null;
  address_en: string | null;
  zipcode: string | null;

  created_at: string;
  updated_at: string;
};

export default function Start({ loaderData }: Route.ComponentProps) {
  // console.log("🚀 [Start] 실행됨");
  const [supabase, setSupabase] = useState<typeof browserClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { applicants, inventors } = loaderData;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedApplicants, setSelectedApplicants] = useState<Applicant[]>([]);
  const [selectedInventors, setSelectedInventors] = useState<Inventor[]>([]);
  const [title, setTitle] = useState(""); // 1. state 생성
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ✅ 브라우저 환경에서만 browserClient를 초기화
  useEffect(() => {
    // console.log("🚀 [useEffect] 실행됨");
    setSupabase(browserClient);
  }, []);

  const handleUpload = async (uploadType: "checkout" | "draft") => {
    if (uploadType === "checkout") {
      setIsSubmittingCheckout(true);
    } else {
      setIsSubmittingDraft(true);
    }
    setIsSubmitting(true);
    try {
      // console.log("🚀 [handleUpload] 실행됨", selectedFile);
      if (!selectedFile || !supabase || !loaderData.user?.id) return;

      const safeFileName = (name: string) =>
        name
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w.\-]/g, "_");

      const userId = loaderData.user.id;
      const safeName = safeFileName(selectedFile.name);
      const timestamp = Date.now();
      const path = `${userId}/temp/${timestamp}_${safeName}`;

      // 1. 파일 업로드
      const { error: uploadError } = await supabase.storage
        .from("provisional-application")
        .upload(path, selectedFile, {
          contentType: selectedFile.type,
          upsert: true,
        });

      if (uploadError) {
        console.error("❌ 파일 업로드 실패:", uploadError);
        toast.error("파일 업로드에 실패했습니다.");
        return;
      }

      // const {
      //   data: { publicUrl },
      // } = supabase.storage.from("provisional-application").getPublicUrl(path);
      // console.log("✅ 파일 업로드 성공:", publicUrl);

      // 2. RPC 호출
      const { data, error } = await supabase.rpc(
        "create_provisional_application",
        {
          p_user_id: userId,
          p_title_en: title,
          p_applicant: selectedApplicants.map((applicant) => ({
            id: applicant.id,
            name_en: applicant.name_en,
            name_kr: applicant.name_kr,
            nationality: applicant.nationality,
            id_number: applicant.id_number,
            zipcode: applicant.zipcode,
            address_kr: applicant.address_kr,
            address_en: applicant.address_en,
            residence_country: applicant.residence_country,
          })),
          p_inventor: selectedInventors.map((i) => ({
            id: i.id,
            user_id: i.user_id,
            name_kr: i.name_kr,
            name_en: i.name_en,
            nationality: i.nationality,
            id_number: i.id_number,
            zipcode: i.zipcode,
            address_kr: i.address_kr,
            address_en: i.address_en,
            residence_country: i.residence_country,
          })),
          p_attached_files: [
            {
              name: selectedFile.name,
              url: path,
              type: selectedFile.type,
            },
          ],
        },
      );

      if (error || !data || data.length === 0) {
        // console.error("❌ 등록 실패:", error ?? "No data returned");
        toast.error("등록에 실패했습니다. 다시 시도해 주세요.");
        return;
      }

      // console.log("✅ 등록 완료:", data[0]);
      // toast.success("Event has been created", {
      //   description: "Sunday, December 03, 2023 at 9:00 AM",
      //   action: {
      //     label: "Undo",
      //     onClick: () => console.log("Undo"),
      //   },
      // });
    } catch (err) {
      // console.error("예기치 않은 오류:", err);
      toast.error("시스템 오류가 발생했습니다.");
    } finally {
      if (uploadType === "checkout") {
        setIsSubmittingCheckout(false);
        navigate("/applications/payment");
      } else {
        setIsSubmittingDraft(false);
        setIsDialogOpen(true);
      }
    }
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
              <Button
                variant="outline"
                className="min-w-[100px] rounded-md p-3 font-medium"
              >
                Hide preview
              </Button>
              <Button
                variant="default"
                className="min-w-[100px] rounded-md p-3 font-semibold"
                disabled={isSubmittingCheckout}
                onClick={() => handleUpload("checkout")}
              >
                {isSubmittingCheckout ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Checkout"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-row items-start justify-center gap-20">
        <div className="flex w-[70%] flex-col items-start gap-10 space-y-5 pt-10 pb-20">
          <div className="mx-auto flex flex-col items-start gap-10 space-y-2">
            <DialogSaveDraft
              isOpen={isDialogOpen}
              onOpenChange={setIsDialogOpen}
            />
            <div className="flex w-full flex-col items-start">
              <Label
                htmlFor="title"
                className="flex flex-col items-start text-lg"
              >
                Title of the invention
              </Label>
              <small className="text-muted-foreground pb-1.5 text-sm font-light">
                A brief, descriptive title highlighting the invention’s main
                function or features.
              </small>
              <Input
                id="title"
                name="title"
                required
                type="text"
                placeholder="Title of the invention"
                className="w-full max-w-xl min-w-[280px]"
                value={title} // 2. input에 state 바인딩
                onChange={(e) => setTitle(e.target.value)} // 3. 입력되면 state에 저장
              />
            </div>
            <Combobox
              comboName="applicant"
              labelName="Applicant"
              description="The applicant must be an individual or entity entitled to the invention. Multiple applicants allowed."
              dbItem={applicants}
              items={selectedApplicants}
              setItems={setSelectedApplicants}
              onManageClick={() => {}}
            />
            <Combobox
              comboName="inventor"
              labelName="Inventor"
              description="At least one natural person must have contributed to the invention. Multiple inventors allowed."
              dbItem={inventors}
              items={selectedInventors}
              setItems={setSelectedInventors}
              onManageClick={() => {}}
            />
            <div className="flex flex-col items-start">
              <Label
                htmlFor="file"
                className="flex flex-col items-start text-lg"
              >
                Provisional Specification File
              </Label>
              <small className="text-muted-foreground max-w-xl text-sm font-light">
                You can upload one file at a time. Supported document types
                include PDF, DOCX, PPTX, and similar formats.
              </small>
              <FileDropzone onFileSelect={(file) => setSelectedFile(file)} />
              {selectedFile && (
                <div className="mt-4 text-sm text-green-700">
                  선택한 파일: {selectedFile.name} (
                  {(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
            <div className="flex w-full flex-col justify-between px-0 md:flex-row md:p-4">
              <Button
                type="button"
                variant="outline"
                className="min-w-[250px] rounded-md p-3 font-medium"
                onClick={() => handleUpload("draft")}
                disabled={isSubmittingDraft}
              >
                {isSubmittingDraft ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Save Draft"
                )}
              </Button>
              <Button
                type="button"
                variant="default"
                className="min-w-[250px] rounded-md p-3 font-medium"
                onClick={() => handleUpload("checkout")}
                disabled={isSubmittingCheckout}
              >
                {isSubmittingCheckout ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Checkout"
                )}
              </Button>
            </div>
          </div>
        </div>
        <div className="hidden h-screen w-[30%] bg-[#f5f6f8] md:block">
          preview
        </div>
      </div>
    </div>
  );
}

export function DialogSaveDraft({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} data-slot="dialog">
      <form>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Draft saved successfully</DialogTitle>
            <DialogDescription>
              You can continue editing it anytime from your dashboard.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="default"
                onClick={() => navigate("/dashboard/provisional-applications")}
              >
                Go to dashboard
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
