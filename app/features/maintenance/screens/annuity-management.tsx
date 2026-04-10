import type { Route } from "./+types/annuity-management";

import {
  ArrowRightIcon,
  FileSpreadsheetIcon,
  LayoutDashboardIcon,
  SearchIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useFetcher } from "react-router";

import { Badge } from "~/core/components/ui/badge";
import { Button } from "~/core/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/core/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { Input } from "~/core/components/ui/input";
import { requireAuthentication } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";

export const meta: Route.MetaFunction = () => [
  { title: `연차료 관리 | ${import.meta.env.VITE_APP_NAME}` },
];

// ── Types ──────────────────────────────────────────────────────────────

type AnnuityRecord = {
  year: number;
  dueDate: string;
  paidDate: string | null;
  fee: number;
  status: "paid" | "unpaid" | "overdue";
};

type SearchResult = {
  registrationNo: string;
  title: string;
  applicant: string;
  applicationNo: string;
  applicationDate: string;
  registrationDate: string;
  type: "patent" | "design";
  annuityRecords: AnnuityRecord[];
};

// ── Loader ─────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAuthentication(client);

  const { data: { user } } = await client.auth.getUser();

  const { data: managedCases } = await client
    .from("annuity_cases")
    .select(`
      id,
      ip_type,
      registration_no,
      title,
      applicant,
      status,
      expiry_date,
      annuity_payments (
        annuity_year,
        due_date,
        is_paid,
        payment_status
      )
    `)
    .eq("user_id", user!.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5);

  return { managedCases: managedCases ?? [] };
}

// ── Action ─────────────────────────────────────────────────────────────

export async function action({ request }: Route.ActionArgs) {
  const [client] = makeServerClient(request);
  await requireAuthentication(client);

  const { data: { user } } = await client.auth.getUser();
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "search") {
    const registrationNo = String(formData.get("registrationNo") ?? "").trim();

    const patentPattern = /^10-\d{7}$/;
    const designPattern = /^30-\d{7}$/;

    if (!patentPattern.test(registrationNo) && !designPattern.test(registrationNo)) {
      return {
        intent: "search",
        error: "등록번호 형식이 올바르지 않습니다. (특허: 10-0000000, 디자인: 30-0000000)",
        result: null,
        registered: false,
      };
    }

    const type: "patent" | "design" = registrationNo.startsWith("10-") ? "patent" : "design";

    // TODO: Call KIPRIS Open API to fetch real case data
    // GET https://plus.kipris.or.kr/kipo-api/kipi/patUtiModInfoSearchSevice/getPatentUtilityInfo
    const mockResult: SearchResult = {
      registrationNo,
      title: type === "patent" ? "시스템 및 방법에 관한 발명" : "전자기기 디자인",
      applicant: "주식회사 예시 (EXAMPLE CO., LTD.)",
      applicationNo: type === "patent" ? "10-2020-0012345" : "30-2020-0005678",
      applicationDate: "2020-03-15",
      registrationDate: "2022-08-10",
      type,
      annuityRecords: [
        { year: 4, dueDate: "2026-08-10", paidDate: null, fee: 60000, status: "unpaid" },
        { year: 3, dueDate: "2025-08-10", paidDate: "2025-07-20", fee: 50000, status: "paid" },
        { year: 2, dueDate: "2024-08-10", paidDate: "2024-07-18", fee: 40000, status: "paid" },
        { year: 1, dueDate: "2023-08-10", paidDate: "2023-07-25", fee: 30000, status: "paid" },
      ],
    };

    return { intent: "search", error: null, result: mockResult, registered: false };
  }

  if (intent === "register") {
    const registrationNo = String(formData.get("registrationNo") ?? "").trim();
    const ipType = String(formData.get("ipType") ?? "") as "patent" | "design";
    const title = String(formData.get("title") ?? "");
    const applicant = String(formData.get("applicant") ?? "");
    const applicationNo = String(formData.get("applicationNo") ?? "");
    const applicationDate = String(formData.get("applicationDate") ?? "") || null;
    const registrationDate = String(formData.get("registrationDate") ?? "") || null;

    // 이미 등록된 사건인지 확인
    const { data: existing } = await client
      .from("annuity_cases")
      .select("id")
      .eq("user_id", user!.id)
      .eq("registration_no", registrationNo)
      .single();

    if (existing) {
      return { intent: "register", error: "이미 연차료 관리에 등록된 사건입니다.", result: null, registered: false };
    }

    // 만료일 계산: 출원일 + 20년
    let expiryDate: string | null = null;
    if (applicationDate) {
      const d = new Date(applicationDate);
      d.setFullYear(d.getFullYear() + 20);
      expiryDate = d.toISOString().slice(0, 10);
    }

    const { data: newCase, error: insertError } = await client
      .from("annuity_cases")
      .insert({
        user_id: user!.id,
        ip_type: ipType,
        registration_no: registrationNo,
        title: title || null,
        applicant: applicant || null,
        application_no: applicationNo || null,
        application_date: applicationDate,
        registration_date: registrationDate,
        expiry_date: expiryDate,
        status: "active",
      })
      .select("id")
      .single();

    if (insertError || !newCase) {
      return { intent: "register", error: "사건 등록에 실패했습니다. 다시 시도해 주세요.", result: null, registered: false };
    }

    // 연차료 레코드 생성 (4~20년차, 최대 17개)
    // 납부 기한 = 등록일로부터 매년 (등록일 기준 n년차 = 등록일 + (n-1)년)
    const baseDate = registrationDate ? new Date(registrationDate) : new Date();
    const paymentRows = Array.from({ length: 17 }, (_, i) => {
      const year = i + 4; // 4~20
      const due = new Date(baseDate);
      due.setFullYear(due.getFullYear() + (year - 1));
      return {
        case_id: newCase.id,
        user_id: user!.id,
        annuity_year: year,
        due_date: due.toISOString().slice(0, 10),
        payment_status: "unpaid" as const,
        is_paid: false,
      };
    });

    await client.from("annuity_payments").insert(paymentRows);

    return { intent: "register", error: null, result: null, registered: true };
  }

  return { intent: null, error: "알 수 없는 요청입니다.", result: null, registered: false };
}

// ── Annuity status badge ───────────────────────────────────────────────

function AnnuityStatusBadge({ status }: { status: AnnuityRecord["status"] }) {
  if (status === "paid") {
    return (
      <Badge variant="outline" className="border-success/40 bg-success/10 text-success text-xs">
        납부 완료
      </Badge>
    );
  }
  if (status === "overdue") {
    return <Badge variant="destructive" className="text-xs">기한 초과</Badge>;
  }
  return <Badge variant="secondary" className="text-xs">납부 예정</Badge>;
}

// ── Excel import dialog ────────────────────────────────────────────────

function ExcelImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validateAndSet = (file: File) => {
    const allowed = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    const isExcel =
      allowed.includes(file.type) ||
      file.name.endsWith(".xls") ||
      file.name.endsWith(".xlsx");
    if (!isExcel) { setError("엑셀 파일(.xls, .xlsx)만 업로드 가능합니다."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("파일 크기는 10MB 이하여야 합니다."); return; }
    setError(null);
    setSelectedFile(file);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheetIcon className="size-5 text-primary" />
            엑셀 일괄 등록
          </DialogTitle>
          <DialogDescription>
            엑셀 파일에 등록번호를 정리하여 업로드하면 사건을 한 번에 등록할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">양식 안내</span>
            &nbsp;— A열: 등록번호, B열: 사건명(선택). 1행은 헤더로 사용하세요.
          </div>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file) validateAndSet(file);
            }}
            className={`flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed transition-colors ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50"
            }`}
          >
            <FileSpreadsheetIcon className="size-10 text-muted-foreground" />
            {selectedFile ? (
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                <Button variant="ghost" size="sm" className="mt-1 text-destructive hover:text-destructive" onClick={() => setSelectedFile(null)}>
                  파일 제거
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-sm text-muted-foreground">엑셀 파일을 드래그하거나</p>
                <label className="cursor-pointer text-sm font-medium text-primary underline-offset-2 hover:underline">
                  파일 선택
                  <input type="file" accept=".xls,.xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSet(f); }} />
                </label>
                <p className="text-xs text-muted-foreground">.xls, .xlsx · 최대 10MB</p>
              </div>
            )}
          </div>
          {error && (
            <p className="flex items-center gap-1 text-sm text-destructive">
              <XCircleIcon className="size-4 shrink-0" />{error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>취소</Button>
            <Button disabled={!selectedFile}>등록하기</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Search result panel ────────────────────────────────────────────────

function SearchResultPanel({
  result,
  onRegister,
  isRegistering,
}: {
  result: SearchResult;
  onRegister: () => void;
  isRegistering: boolean;
}) {
  const typeLabel = result.type === "patent" ? "특허" : "디자인";
  const unpaidCount = result.annuityRecords.filter((r) => r.status !== "paid").length;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{typeLabel}</Badge>
            <span className="text-xs text-muted-foreground">{result.registrationNo}</span>
          </div>
          <p className="text-base font-semibold text-foreground">{result.title}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>출원인: <span className="text-foreground">{result.applicant}</span></span>
            <span>출원번호: <span className="text-foreground">{result.applicationNo}</span></span>
            <span>출원일: <span className="text-foreground">{result.applicationDate}</span></span>
            <span>등록일: <span className="text-foreground">{result.registrationDate}</span></span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button size="sm" onClick={onRegister} disabled={isRegistering}>
            {isRegistering ? "등록 중…" : "연차료 관리 등록"}
          </Button>
          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" disabled={isRegistering}>
            취소
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">연차료 납부 현황</p>
          {unpaidCount > 0 && <span className="text-xs text-warning">미납 {unpaidCount}건</span>}
        </div>
        <div className="overflow-hidden rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">연차</th>
                <th className="px-4 py-2 font-medium">납부 기한</th>
                <th className="px-4 py-2 font-medium">납부일</th>
                <th className="px-4 py-2 font-medium">납부액</th>
                <th className="px-4 py-2 font-medium">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {result.annuityRecords.map((r) => (
                <tr key={r.year} className="bg-card">
                  <td className="px-4 py-2 font-medium text-foreground">{r.year}년차</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.dueDate}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.paidDate ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{r.fee.toLocaleString("ko-KR")}원</td>
                  <td className="px-4 py-2"><AnnuityStatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────

export default function AnnuityManagement({ loaderData }: Route.ComponentProps) {
  const { managedCases } = loaderData;
  const fetcher = useFetcher<typeof action>();
  const [regNo, setRegNo] = useState("");
  const [excelOpen, setExcelOpen] = useState(false);

  const data = fetcher.data;
  const searchResult = data?.intent === "search" ? data.result : null;
  const searchError = data?.intent === "search" ? data.error : null;
  const registerError = data?.intent === "register" ? data.error : null;
  const registered = data?.registered ?? false;
  const isSearching = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "search";
  const isRegistering = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "register";

  const handleSearch = () => {
    const fd = new FormData();
    fd.append("intent", "search");
    fd.append("registrationNo", regNo);
    fetcher.submit(fd, { method: "post" });
  };

  const handleRegister = (result: SearchResult) => {
    const fd = new FormData();
    fd.append("intent", "register");
    fd.append("registrationNo", result.registrationNo);
    fd.append("ipType", result.type);
    fd.append("title", result.title);
    fd.append("applicant", result.applicant);
    fd.append("applicationNo", result.applicationNo);
    fd.append("applicationDate", result.applicationDate);
    fd.append("registrationDate", result.registrationDate);
    fetcher.submit(fd, { method: "post" });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">연차료 관리</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            특허·디자인권의 연차료 납부 현황을 조회하고 관리 사건을 등록하세요.
          </p>
        </div>
        <Button variant="outline" className="shrink-0" onClick={() => setExcelOpen(true)}>
          <FileSpreadsheetIcon className="mr-2 size-4" />
          엑셀로 일괄 등록
        </Button>
      </div>

      {/* ── Currently managed cases ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheckIcon className="size-4 text-primary" />
            현재 관리 중인 사건
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard">
              <LayoutDashboardIcon className="mr-1 size-4" />
              대시보드로 이동
              <ArrowRightIcon className="ml-1 size-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {managedCases.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10">
              <ShieldCheckIcon className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">아직 연차료 관리 중인 사건이 없습니다.</p>
              <p className="text-xs text-muted-foreground">아래에서 등록번호를 조회하여 사건을 추가하세요.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {managedCases.map((c) => {
                const payments = Array.isArray(c.annuity_payments) ? c.annuity_payments : [];
                const nextUnpaid = payments
                  .filter((p: { is_paid: boolean }) => !p.is_paid)
                  .sort((a: { annuity_year: number }, b: { annuity_year: number }) => a.annuity_year - b.annuity_year)[0];
                return (
                  <div key={c.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.title ?? c.registration_no}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.registration_no} · {c.applicant ?? "—"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {nextUnpaid && (
                        <span className="text-xs text-muted-foreground">
                          {(nextUnpaid as { annuity_year: number }).annuity_year}년차 · {(nextUnpaid as { due_date: string }).due_date} 납부 예정
                        </span>
                      )}
                      <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-xs">
                        {c.status === "active" ? "관리 중" : c.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Search & add case ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <SearchIcon className="size-4 text-primary" />
            사건 조회 및 추가
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            등록번호를 입력하고 조회하면 특허청 정보와 연차료 납부 현황을 확인할 수 있습니다.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              placeholder="등록번호 입력 (예: 10-1234567 또는 30-1234567)"
              className="max-w-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching || !regNo.trim()}>
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  조회 중
                </span>
              ) : (
                <><SearchIcon className="mr-1 size-4" />조회</>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">특허: 10-0000000 형식 · 디자인: 30-0000000 형식</p>

          {searchError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive-subtle px-4 py-3 text-sm text-destructive-text">
              <XCircleIcon className="size-4 shrink-0" />{searchError}
            </div>
          )}
          {registerError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive-subtle px-4 py-3 text-sm text-destructive-text">
              <XCircleIcon className="size-4 shrink-0" />{registerError}
            </div>
          )}
          {registered && (
            <div className="flex items-center gap-2 rounded-md bg-success/10 px-4 py-3 text-sm text-success">
              연차료 관리 사건으로 등록되었습니다. 4~20년차 납부 레코드가 생성되었습니다.
            </div>
          )}
          {searchResult && !registered && (
            <SearchResultPanel
              result={searchResult}
              onRegister={() => handleRegister(searchResult)}
              isRegistering={isRegistering}
            />
          )}
        </CardContent>
      </Card>

      <ExcelImportDialog open={excelOpen} onClose={() => setExcelOpen(false)} />
    </div>
  );
}
