export async function generatePOAClient({
  elementId,
  filename,
}: {
  elementId: string;
  filename: string;
}) {
  console.log("[PDF] 시작: PDF 생성 시도");

  const { jsPDF } = await import("jspdf");
  const html2canvas = (await import("html2canvas")).default;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error("[PDF] 요소를 찾을 수 없습니다:", elementId);
    return;
  }

  const canvas = await html2canvas(element);
  document.body.appendChild(canvas); // 이걸 추가하면 실제 캡처된 이미지가 화면에 보입니다!

  const imgData = canvas.toDataURL("image/jpeg");
  if (!imgData || imgData === "data:,") {
    return;
  }

  const pdf = new jsPDF("p", "mm", "a4");
  const width = pdf.internal.pageSize.getWidth();
  if (!canvas.width || !canvas.height) {
    console.error(
      "[PDF] ❌ 캔버스 비정상. width:",
      canvas.width,
      "height:",
      canvas.height,
    );
    return;
  }
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData, "JPEG", 0, 0, width, height);

  // pdf.save(filename);
  // ✅ 브라우저 새 탭에서 PDF 미리보기
  const pdfBlobUrl = pdf.output("bloburl");
  window.open(pdfBlobUrl, "_blank");

  // ✅ File로 변환
  const blob = pdf.output("blob");
  const file = new File([blob], filename, { type: "application/pdf" });
  return file;
}
