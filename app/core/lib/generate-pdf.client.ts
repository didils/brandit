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
  console.log("[PDF] 요소:", element);
  if (!element) {
    console.error("[PDF] 요소를 찾을 수 없습니다:", elementId);
    return;
  }

  console.log("[PDF] 캔버스 생성 시작...");
  const canvas = await html2canvas(element);
  console.log("[PDF] 캔버스 생성 완료", canvas);
  document.body.appendChild(canvas); // 이걸 추가하면 실제 캡처된 이미지가 화면에 보입니다!

  const imgData = canvas.toDataURL("image/jpeg");
  if (!imgData || imgData === "data:,") {
    console.error("[PDF] ❌ 유효하지 않은 이미지 데이터입니다.");
    return;
  }
  console.log(
    "[PDF] 이미지 데이터 생성 완료 (base64 앞부분):",
    imgData.slice(0, 100),
  );

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
  console.log("[PDF] PDF 사이즈:", width, "x", height);

  pdf.addImage(imgData, "JPEG", 0, 0, width, height);
  console.log("[PDF] PDF에 이미지 추가 완료");

  pdf.save(filename);
  console.log("[PDF] 파일 저장 완료:", filename);
}
