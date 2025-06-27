/**
 * Start Page
 *
 * 한국 가출원 신청 시작 페이지입니다.
 */
import type { Route } from "./+types/start";

import { TooltipArrow } from "@radix-ui/react-tooltip";
import {
  AlertCircleIcon,
  CheckIcon,
  ChevronsUpDownIcon,
  CircleDollarSignIcon,
  Loader2,
  PlusIcon,
  Terminal,
  XIcon,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Form,
  redirect,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router";
import { toast } from "sonner";

import ImageCropper from "~/core/components/ImageCropper";
import { ApplicantSheet } from "~/core/components/applicant-sheet";
import { Combobox } from "~/core/components/combobox";
import { CompletionEstimator } from "~/core/components/completion-estimator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/core/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/core/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/core/components/ui/alert-dialog";
import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
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
import { FormErrorAlert } from "~/core/components/ui/form-error-alert";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import { Separator } from "~/core/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/core/components/ui/tooltip";
import { browserClient } from "~/core/lib/browser-client";
import { cn } from "~/core/lib/utils";

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

  console.log("🚀 [loader] 실행됨 3", {
    applicants,
    inventors,
  });

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
type ProvisionalAppResult = {
  patent_id: string;
  process_id: string;
  our_ref: string;
};

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
  client_code: string;
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
  // 예시 코드
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [croppedImage, setCroppedImage] = useState<File | null>(null);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setShowCropper(true);
  };
  const [supabase, setSupabase] = useState<typeof browserClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filePath, setFilePath] = useState<string | null>(null);
  const navigate = useNavigate();
  const { applicants, inventors } = loaderData;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedApplicants, setSelectedApplicants] = useState<Applicant[]>([]);
  const [selectedInventors, setSelectedInventors] = useState<Inventor[]>([]);
  const [title, setTitle] = useState(""); // 1. state 생성
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [isSubmittingDraft, setIsSubmittingDraft] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCanceled, setIsCanceled] = useState(false);
  const [existingDraftId, setExistingDraftId] = useState<string | null>(null);
  const [existingProcessId, setExistingProcessId] = useState<string | null>(
    null,
  );
  const [isUrgent, setIsUrgent] = useState(false);
  const [estimatedDate, setEstimatedDate] = useState<Date | null>(null);
  // const [textareaValue, setTextareaValue] = useState("");
  // ✅ Sheet 열림 상태
  const [isApplicantSheetOpen, setIsApplicantSheetOpen] = useState(false);
  const [isInventorSheetOpen, setIsInventorSheetOpen] = useState(false);
  const [staffNote, setStaffNote] = useState("");
  const [clientRequest, setClientRequest] = useState("");
  const [isHidden, setIsHidden] = useResponsiveIsHidden();
  const [isTitleMissing, setIsTitleMissing] = useState(false);
  const [isApplicantMissing, setIsApplicantMissing] = useState(false);
  const [isInventorMissing, setIsInventorMissing] = useState(false);
  const [isFileMissing, setIsFileMissing] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [addressEn, setAddressEn] = useState("");

  function useResponsiveIsHidden() {
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
      // Tailwind의 md(768px 이상)를 기준으로
      const mediaQuery = window.matchMedia("(max-width: 1280px)");

      const handleResize = () => {
        setIsHidden(mediaQuery.matches); // true = 숨김 (작은 화면)
      };

      handleResize(); // 초기 실행
      mediaQuery.addEventListener("change", handleResize);

      return () => mediaQuery.removeEventListener("change", handleResize);
    }, []);

    return [isHidden, setIsHidden] as const;
  }

  // ✅ 총 금액 계산
  const basePrice = 299;
  const urgentFee = 79;
  const totalPrice = isUrgent ? basePrice + urgentFee : basePrice;

  const location = useLocation();
  const isExpeditedDisabled =
    selectedApplicants.length === 0 ||
    selectedApplicants.some(
      (applicant) =>
        !applicant.client_code || applicant.client_code.trim() === "",
    );
  const tooltipMessage =
    selectedApplicants.length === 0
      ? "Select at least one applicant to enable expedited filing."
      : "Applicants must have a valid client code.\nNew codes take 2–3 business days to issue,\nso expedited filing is not available in those cases.";
  const navigationType = useNavigationType(); // 'POP' = back/forward, 'PUSH', 'REPLACE'
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ✅ 좌우 ref가 모두 연결됐는지 체크 (초기 렌더 시점)
    if (!leftRef.current || !rightRef.current) return;

    const updateRightHeight = () => {
      // ✅ 매번 실행 시점에서도 체크
      if (!leftRef.current || !rightRef.current) return;

      const leftHeight = leftRef.current.offsetHeight;
      rightRef.current.style.height = `${leftHeight}px`;
    };

    // ✅ 최초 1회 높이 동기화
    updateRightHeight();

    // ✅ 좌측 요소 감지 및 동기화
    const observer = new ResizeObserver(() => {
      updateRightHeight(); // 내부에서도 매번 null-safe 체크 포함됨
    });

    observer.observe(leftRef.current);

    // ✅ 클린업
    return () => {
      observer.disconnect();
    };
  }, [leftRef.current, rightRef.current]); // ✅ 안전하게 리렌더링 대응

  useEffect(() => {
    const wasJustSubmitted = sessionStorage.getItem("submitted-provisional");
    if (wasJustSubmitted === "true") {
      sessionStorage.removeItem("submitted-provisional");
      navigate("/dashboard/provisional-applications", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    // 1. 컴포넌트 마운트 시 더미 히스토리 스택 쌓기
    window.history.pushState({ modalOpen: false }, "");

    const handlePopState = (event: PopStateEvent) => {
      // 2. 뒤로가기가 눌리면 모달 오픈
      setIsCanceled(true);

      // 3. 이동 "되돌리기" - 현재 URL을 다시 push
      navigate(location.pathname, { replace: true });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location, navigate]);

  // ✅ 브라우저 환경에서만 browserClient를 초기화
  useEffect(() => {
    // console.log("🚀 [useEffect] 실행됨");
    setSupabase(browserClient);
  }, []);

  useEffect(() => {
    if (filePath) {
      console.log("✅ [useEffect] filePath가 변경됨:", filePath);
    }
  }, [filePath]);

  async function savePatentDraft(finalFilePath: string | null) {
    let uploadedFileInfo: { name: string; url: string; type: string }[] = [];

    if (finalFilePath) {
      uploadedFileInfo = [
        {
          name: "provisional application",
          url: finalFilePath,
          type: selectedFile?.type ?? "",
        },
      ];
    }

    const { error, data } = await supabase!
      .from("patents")
      .insert([
        {
          user_id: loaderData.user?.id,
          status: "draft",
          application_type: "provisional",
          title_en: title,
          applicant: selectedApplicants,
          inventor: selectedInventors,
          metadata: uploadedFileInfo, // ✅ 파일 있으면 넣고, 없으면 빈 배열
        },
      ])
      .select();

    if (error) {
      toast.error("draft save failed");
    } else {
      toast.success("draft saved");
      console.log("✅ patent ID:", data?.[0]?.id);
      setExistingDraftId(data?.[0]?.id!);
      console.log("✅ existingDraftId:", existingDraftId);
      setIsSubmittingDraft(false);
    }
  }

  async function updatePatentDraft(
    finalFilePath: string | null,
    existingDraftId: string | null,
  ) {
    let uploadedFileInfo: { name: string; url: string; type: string }[] = [];
    if (finalFilePath) {
      uploadedFileInfo = [
        {
          name: "provisional application",
          url: finalFilePath,
          type: selectedFile?.type ?? "",
        },
      ];
    }

    const { error, data } = await supabase!
      .from("patents")
      .update({
        title_en: title, // 수정할 필드들
        applicant: selectedApplicants,
        inventor: selectedInventors,
        metadata: uploadedFileInfo ? [uploadedFileInfo] : [],
        // 필요하다면 status도 포함 가능: status: "draft"
      })
      .eq("id", existingDraftId!)
      .select();

    if (error) {
      toast.error("draft update failed");
    } else {
      toast.success("draft updated");
      setIsSubmittingDraft(false);
    }
  }

  const handleUpload = async (uploadType: "checkout" | "draft") => {
    // ✅ 먼저 유효성 검사부터 실행 (아무 상태 변경 없이!)
    if (!title || title.trim() === "") {
      toast.error("Title of invention is required.");
      setIsTitleMissing(true);
      return;
    }
    if (uploadType === "checkout") {
      if (!selectedApplicants || selectedApplicants.length === 0) {
        toast.error("At least one applicant is required.");
        setIsApplicantMissing(true);
        return;
      }
      if (!selectedInventors || selectedInventors.length === 0) {
        toast.error("At least one inventor is required.");
        setIsInventorMissing(true);
        return;
      }
      if (!selectedFile) {
        toast.error("Attached file is required.");
        setIsFileMissing(true);
        return;
      }
    }

    // ✅ 유효성 통과 후에만 로딩 상태 설정
    if (uploadType === "checkout") {
      setIsSubmittingCheckout(true);
    } else {
      setIsSubmittingDraft(true);
    }
    // setIsSubmitting(true);

    // try {
    //   const userId = loaderData.user?.id;
    //   if (!supabase || !userId) return;

    //   // ✅ 파일 업로드 (draft는 파일 없이도 허용)
    //   let uploadedFileInfo = null;
    //   if (selectedFile) {
    //     const safeFileName = (name: string) =>
    //       name
    //         .normalize("NFKD")
    //         .replace(/[\u0300-\u036f]/g, "")
    //         .replace(/[^\w.\-]/g, "_");
    //     const safeName = safeFileName(selectedFile.name);
    //     const timestamp = Date.now();
    //     const path = `${userId}/temp/${timestamp}_${safeName}`;

    //     const { error: uploadError } = await supabase.storage
    //       .from("provisional-application")
    //       .upload(path, selectedFile, {
    //         contentType: selectedFile.type,
    //         upsert: true,
    //       });

    //     if (uploadError) {
    //       toast.error("File upload failed.");
    //       return;
    //     } else {
    //       console.log("🚀 [handleUpload] 실행됨 2", {
    //         path,
    //       });
    //       setFilePath(path);
    //       console.log("🚀 [handleUpload] 실행됨 3", {
    //         filePath,
    //       });
    //     }

    //     uploadedFileInfo = {
    //       name: "provisional_application",
    //       url: path,
    //       type: selectedFile.type,
    //     };
    //   }

    // ✅ 유효성 통과 후에만 로딩 상태 설정
    if (uploadType === "draft" && existingDraftId === null) {
      if (!selectedFile) {
        await savePatentDraft(null); // null 넘김
        return;
      }

      // 2️⃣ 파일이 있는 경우 → 먼저 업로드 후 경로 넘김
      const safeFileName = (name: string) =>
        name
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w.\-]/g, "_");
      const path = `${loaderData.user?.id}/filling/${safeFileName(selectedFile.name)}`;
      const { error: uploadError } = await supabase!.storage
        .from("provisional-application")
        .upload(path, selectedFile, {
          contentType: selectedFile.type,
          upsert: true,
        });

      console.log("🛠️ [handleUpload] 파일 업로드 실패", {
        uploadError,
      });

      if (uploadError) {
        toast.error("파일 업로드 실패");
        return;
      }

      // 3️⃣ 업로드 성공 시 → 그 경로를 넘겨서 저장
      await savePatentDraft(path);
    }
    if (uploadType === "draft" && existingDraftId !== null) {
      console.log("update draft");
      if (!selectedFile) {
        await updatePatentDraft(null, existingDraftId);
        return;
      }

      // 2️⃣ 파일이 있는 경우 → 먼저 업로드 후 경로 넘김
      const safeFileName = (name: string) =>
        name
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w.\-]/g, "_");
      const path = `${loaderData.user?.id}/filling/${safeFileName(selectedFile.name)}`;
      const { error: uploadError } = await supabase!.storage
        .from("provisional-application")
        .upload(path, selectedFile, {
          contentType: selectedFile.type,
          upsert: true,
        });
      console.log("🛠️ [handleUpload] 파일 업로드 실패", {
        uploadError,
      });

      if (uploadError) {
        toast.error("파일 업로드 실패");

        return;
      }

      // 3️⃣ 업로드 성공 시 → 그 경로를 넘겨서 저장
      await updatePatentDraft(path, existingDraftId);
    }
    if (uploadType === "checkout" && existingDraftId === null) {
      // 2️⃣ 파일이 있는 경우 → 먼저 업로드 후 경로 넘김
      const safeFileName = (name: string) =>
        name
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w.\-]/g, "_");
      const path = `${loaderData.user?.id}/filling/${safeFileName(selectedFile?.name ?? "")}`;
      const { error: uploadError } = await supabase!.storage
        .from("provisional-application")
        .upload(path, selectedFile!, {
          contentType: selectedFile?.type ?? "",
          upsert: true,
        });
      console.log("🛠️ [handleUpload] 파일 업로드 실패", {
        uploadError,
      });

      if (uploadError) {
        toast.error("파일 업로드 실패");
        return;
      }

      const { data, error } = await supabase!.rpc(
        "create_provisional_application",
        {
          p_user_id: loaderData.user?.id!,
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
              name: selectedFile?.name,
              url: path,
              type: selectedFile?.type,
            },
          ],
          p_client_request: clientRequest, // ✅ 추가
          p_is_urgent: isUrgent, // ✅ 추가
        },
      );
      if (error) {
        toast.error("Upload failed");
      } else {
        setIsSubmittingCheckout(false);
        sessionStorage.setItem("submitted-provisional", "true");
        navigate("/dashboard/provisional-applications");
      }
    }
    if (uploadType === "checkout" && existingDraftId !== null) {
      // 1️⃣ 파일 경로 생성 및 업로드
      const safeFileName = (name: string) =>
        name
          .normalize("NFKD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w.\-]/g, "_");

      const path = `${loaderData.user?.id}/filling/${safeFileName(selectedFile?.name ?? "")}`;

      const { error: uploadError } = await supabase!.storage
        .from("provisional-application")
        .upload(path, selectedFile!, {
          contentType: selectedFile?.type ?? "",
          upsert: true,
        });

      console.log("🛠️ [handleUpload] 파일 업로드 결과:", { uploadError });

      if (uploadError) {
        toast.error("파일 업로드 실패");
        return;
      }

      // 2️⃣ Supabase RPC 함수 호출 (update_provisional_application)
      const { data, error } = await supabase!.rpc(
        "update_provisional_application",
        {
          p_patent_id: existingDraftId, // 기존 draft ID
          p_user_id: loaderData.user?.id!,
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
              name: selectedFile?.name,
              url: path,
              type: selectedFile?.type,
            },
          ],
          p_client_request: clientRequest,
          p_is_urgent: isUrgent,
        },
      );

      // 3️⃣ 결과 처리
      if (error) {
        console.error("❌ RPC update 실패:", error);
        toast.error("업데이트 실패");
      } else {
        console.log("✅ provisional 업데이트 완료", data);
        sessionStorage.setItem("submitted-provisional", "true");
        setIsSubmittingCheckout(false);
        navigate("/dashboard/provisional-applications");
      }
    }

    // ✅ DB 등록 (status 포함)
    // const params = {
    //   p_patent_id: existingDraftId ?? null,
    //   p_process_id: existingProcessId ?? null,
    //   p_user_id: userId,
    //   p_title_en: title,
    //   p_applicant: selectedApplicants,
    //   p_inventor: selectedInventors,
    //   p_attached_files: uploadedFileInfo ? [uploadedFileInfo] : [],
    //   p_status: uploadType === "draft" ? "draft" : "awaiting_payment",
    // };

    // const { data, error } = await supabase.rpc<ProvisionalAppResult>(
    //   "create_or_update_provisional_application",
    //   params,
    // );
    // console.log("🚀 [handleUpload] 실행됨 1", {
    //   data,
    //   error,
    // });

    // ✅ data는 ProvisionalAppResult[] 형태로 반환됨

    // console.log("🚀 [handleUpload] 실행됨 1.5", {
    //   data,
    //   error,
    //   existingDraftId,
    // });
    // } catch (err) {
    //   toast.error("A system error occurred.");
    // } finally {
    //   if (uploadType === "checkout") {
    //     setIsSubmittingCheckout(false);
    //     navigate("/applications/payment");
    //   } else {
    //     setIsSubmittingDraft(false);
    //     setIsDialogOpen(true);
    //   }
    // }
  };

  return (
    <div>
      {showCropper && imageFile && (
        <ImageCropper
          imageFile={imageFile}
          onCancel={() => setShowCropper(false)}
          croppedImage={croppedImage}
          setCroppedImage={setCroppedImage}
          setShowCropper={setShowCropper}
        />
      )}
      <div className="flex w-full flex-row items-center justify-between bg-[#0e3359] px-4 py-1.5">
        <h1 className="text-md text-center font-medium text-white">
          Provisional Application
        </h1>
        <h1 className="hidden text-center text-sm font-light text-white md:block">
          Please save your draft before you leave
        </h1>
        <div>
          <Button
            variant="outline"
            className="h-7 rounded-md"
            onClick={() => handleUpload("draft")}
            disabled={isSubmittingDraft}
          >
            {isSubmittingDraft ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Save Draft"
            )}
          </Button>
        </div>
      </div>
      <div className="w-full border-b border-gray-300 bg-[#0e3359]">
        <div className="mx-auto w-full rounded-tl-md rounded-tr-md bg-[#f6f9fc] px-[1vw] py-4">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => setIsCanceled(true)}
              >
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
                onClick={() => setIsHidden(!isHidden)}
              >
                {isHidden ? "Show preview" : "Hide preview"}
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
      <div className="flex min-h-screen w-full flex-row items-stretch justify-center gap-20">
        <div
          ref={leftRef}
          className="flex w-[65%] flex-col items-start gap-10 space-y-5 pt-10 pb-20"
        >
          <div className="mx-auto flex flex-col items-start gap-10 space-y-2">
            <SaveDraftAlert
              isOpen={isCanceled}
              onOpenChange={setIsCanceled}
              onSaveDraft={() => handleUpload("draft")}
              onLeaveWithoutSaving={() => {
                setIsCanceled(false);
                navigate("/dashboard/provisional-applications");
              }}
            />
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
                A brief, descriptive title highlighting the invention's main
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
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsTitleMissing(false);
                }} // 3. 입력되면 state에 저장
              />
              {isTitleMissing && (
                <FormErrorAlert
                  title="Title is required"
                  description="Please enter a title."
                />
              )}
            </div>
            <Combobox
              comboName="applicant"
              labelName="Applicant"
              description="The applicant must be an individual or entity entitled to the invention. Multiple applicants allowed."
              dbItem={applicants}
              items={selectedApplicants}
              setItems={(newItems) => {
                setSelectedApplicants(newItems);
                setIsApplicantMissing(false); // 선택 시 누락 해제
              }}
              onClick={() => {
                setIsApplicantMissing(false);
              }}
              isApplicantMissing={isApplicantMissing}
              isInventorMissing={isInventorMissing}
              onAddNew={() => {
                // ✅ title이 없거나 빈 문자열인 경우 처리
                if (!title || title.trim() === "") {
                  // shadcn toast 또는 기본 alert 사용
                  toast.error("Please enter the title of the invention first.");
                  return; // 시트 열지 않음
                }

                // ✅ title이 정상적으로 존재하면 시트 열기
                setIsApplicantSheetOpen(true);
              }}
            />
            <div>
              <Combobox
                comboName="inventor"
                labelName="Inventor"
                description="At least one natural person must have contributed to the invention. Multiple inventors allowed."
                dbItem={inventors}
                items={selectedInventors}
                setItems={setSelectedInventors}
                onClick={() => setIsInventorMissing(false)}
                isApplicantMissing={isApplicantMissing}
                isInventorMissing={isInventorMissing}
                onAddNew={() => setIsInventorSheetOpen(true)}
              />
            </div>
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
              <FileDropzone
                onFileSelect={(file) => {
                  setSelectedFile(file);
                  setIsFileMissing(false);
                }}
              />
              {selectedFile && (
                <div className="mt-4 max-w-xl text-sm text-green-700">
                  selected file: {selectedFile.name} (
                  {(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
              {isFileMissing && (
                <FormErrorAlert
                  title="File is required"
                  description="Please select a file."
                />
              )}
            </div>
            <div className="mt-6 w-full max-w-xl">
              <Label className="text-lg">Need it urgently?</Label>
              <p className="text-muted-foreground mt-1 text-sm">
                Standard processing takes 3–4 business days. If you need it
                sooner, choose expedited processing and we’ll handle it within 1
                business day for an additional $79.
              </p>

              <div className="mt-3 flex flex-col gap-2">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="urgency"
                    value="standard"
                    checked={!isUrgent}
                    onChange={() => setIsUrgent(false)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm">
                    Standard (3–4 business days, no extra charge)
                  </span>
                </label>
                <div
                  className="relative inline-block"
                  onMouseEnter={() => setIsTooltipVisible(true)}
                  onMouseLeave={() => setIsTooltipVisible(false)}
                >
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="radio"
                      name="urgency"
                      value="expedited"
                      checked={isUrgent}
                      onChange={() => setIsUrgent(true)}
                      className="accent-blue-600"
                      disabled={isExpeditedDisabled}
                    />
                    <span
                      className={cn(
                        "text-sm font-medium",
                        isExpeditedDisabled
                          ? "text-muted-foreground"
                          : "text-primary",
                      )}
                    >
                      Expedited (+$79, processed within 1 business day)
                    </span>
                  </label>

                  {isExpeditedDisabled && isTooltipVisible && (
                    <div className="absolute top-full left-0 z-50 mt-2 w-[420px] rounded-md bg-[#FBEAEA] px-3 py-2 text-sm text-[#E2584D] shadow-md">
                      {tooltipMessage}
                    </div>
                  )}
                </div>
              </div>
              <CompletionEstimator
                isUrgent={isUrgent}
                onEstimate={(date) => {
                  setEstimatedDate(date);
                }}
              />
            </div>
            <div className="flex w-full flex-col items-start">
              <Label
                htmlFor="clientRequest"
                className="flex flex-col items-start text-lg"
              >
                Request or memo to the staff
              </Label>
              <small className="text-muted-foreground pb-1.5 text-sm font-light">
                You can include specific instructions, deadlines, or internal
                references for our team.
              </small>
              <textarea
                id="clientRequest"
                name="clientRequest"
                placeholder="e.g., This is urgent for our upcoming launch. Please prioritize if possible."
                className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full max-w-xl min-w-[280px] rounded-md border px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none"
                rows={4}
                value={clientRequest}
                onChange={(e) => setClientRequest(e.target.value)}
              />
            </div>

            {isHidden && (
              <div className="flex w-full flex-col justify-between gap-4 px-0 md:flex-row md:p-4">
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
            )}
          </div>
        </div>
        {!isHidden && (
          <div ref={rightRef} className="w-[35%] bg-[#f5f6f8] px-10 pt-5 pb-7">
            <div className="sticky top-9">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Provisional Patent Application (KIPO)</CardTitle>
                  <CardDescription>
                    A comprehensive service covering all essential steps to file
                    a provisional application with the Korean Intellectual
                    Property Office.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {/* 업무 상세 보기 아코디언 */}
                  <Accordion type="single" collapsible className="w-full pb-2">
                    <AccordionItem value="details">
                      <AccordionTrigger className="text-muted-foreground text-sm font-medium">
                        View service details
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="text-muted-foreground space-y-2 pl-0 text-sm">
                          {[
                            "Apply for Patent Client Code",
                            "Complete Power of Attorney (POA) for patent attorney representation",
                            "Review of draft specification and drawings",
                            "File provisional application to KIPO (The Korean Intellectual Property Office) via online platform",
                            "Receive and review official filing receipt",
                            "Report filing result to client with submission confirmation",
                            "Provide guidance on post-filing amendments (if needed)",
                            "Send reminder for regular application within 12 months",
                            // ✅ 추가 항목
                            "Draft and provide priority claim statement for regular application",
                          ].map((task, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckIcon className="mt-1 h-4 w-4 flex-shrink-0 self-start text-green-600" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* 비용 정보 */}
                  <div className="text-muted-foreground mt-5 flex justify-between px-2 text-sm">
                    <span>subtotal:</span>
                    <span className="text-sm font-light">${basePrice}</span>
                  </div>

                  {/* Urgent 옵션 */}
                  {isUrgent && (
                    <>
                      <hr className="my-6 border-gray-300" />
                      <div className="text-muted-foreground flex justify-between px-2 text-sm">
                        <span>⚡ Urgent filing (within 1 business day)</span>
                        <span className="text-sm font-light">
                          +${urgentFee}
                        </span>
                      </div>
                    </>
                  )}

                  <Separator className="my-6" />

                  {/* 총 금액 */}
                  <div className="text-black-300 mt-6 flex justify-between px-2 text-sm font-medium">
                    <span className="text-black-300 text-md font-light">
                      Total Fee:
                    </span>
                    <span className="text-black-300 text-md font-semibold">
                      ${totalPrice}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-3 flex w-full flex-col items-center justify-center gap-3 px-0 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-7/9 rounded-md p-3 font-medium"
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
                  className="w-7/9 rounded-md p-3 font-medium"
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
        )}
      </div>
      <ApplicantSheet
        isOpen={isApplicantSheetOpen}
        onOpenChange={(nextOpen) => {
          // ✅ 이미지 편집 중이면 Sheet 닫힘 방지
          if (showCropper) return;
          setIsApplicantSheetOpen(nextOpen);
        }}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        rawImage={imageFile}
        setRawImage={setImageFile}
        finalImage={croppedImage}
        setFinalImage={setCroppedImage}
        showEditor={showCropper}
        setShowEditor={setShowCropper}
        showCropper={showCropper}
        setShowCropper={setShowCropper}
        croppedImage={croppedImage}
        setCroppedImage={setCroppedImage}
        title={title}
        nameEn={nameEn}
        addressEn={addressEn}
        setNameEn={setNameEn}
        setAddressEn={setAddressEn}
      />
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

export function SaveDraftAlert({
  isOpen,
  onOpenChange,
  onSaveDraft,
  onLeaveWithoutSaving,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveDraft: () => void;
  onLeaveWithoutSaving: () => void;
}) {
  const navigate = useNavigate();
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Have you saved your draft?</AlertDialogTitle>
          <AlertDialogDescription>
            Leaving now may cause you to lose any unsaved information. Make sure
            to save your draft before exiting.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              onOpenChange(false);
              onSaveDraft();
            }}
          >
            Save draft
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onOpenChange(false);
              navigate("/applications/provisional-application");
            }}
          >
            Leave without saving
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
