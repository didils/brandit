import type { Inventor } from "./screens/provisional-application/start";

import { toast } from "sonner";

import { browserClient } from "~/core/lib/browser-client";

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

// 🔹 파일 업로드: Supabase Storage에 저장 후 public URL 반환
export async function uploadPatentFile(
  // client: SupabaseClient<Database>,
  userId: string,
  file: File,
): Promise<string | null> {
  const filePath = `patents/${userId}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await browserClient.storage
    .from("documents")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    console.error("File upload error:", uploadError);
    return null;
  }

  const { data: urlData } = browserClient.storage
    .from("documents")
    .getPublicUrl(filePath);
  return urlData?.publicUrl ?? null;
}

// 🔹 데이터 저장: Supabase DB의 patents 테이블에 insert
export async function insertPatentRecord(
  // client: SupabaseClient<Database>,
  userId: string,
  {
    title,
    applicantNames,
    inventorNames,
    fileUrl,
    ourRef,
  }: {
    title: string;
    applicantNames: Applicant[];
    inventorNames: Inventor[];
    fileUrl: string | null;
    ourRef: string;
  },
): Promise<boolean> {
  const { error } = await browserClient.from("patents").insert({
    user_id: userId,
    application_type: "provisional",
    our_ref: ourRef,
    status: "pending",
    title_en: title,
    applicant: applicantNames.map((applicant) => ({
      id: applicant.id,
      name_en: applicant.name_en,
      name_kr: applicant.name_kr,
      nationality: applicant.nationality,
      id_number: applicant.id_number,
      zipcode: applicant.zipcode,
    })),
    metadata: { file_url: fileUrl },
  });

  if (error) {
    console.error("Insert error:", error);
    return false;
  }

  return true;
}

type EntityInput = {
  user_id: string;
  name_kr: string;
  name_en?: string;
  address_kr?: string;
  address_en?: string;
  country?: string;
  has_poa?: boolean; // 기본값 true
  signature_image_url?: string;
  signer_position: string;
  signer_name?: string;
  representative_name?: string;
};

export async function insertEntity(data: EntityInput) {
  const {
    user_id,
    name_kr,
    name_en,
    address_kr,
    address_en,
    country,
    has_poa = true,
    signature_image_url,
    signer_position,
    signer_name,
    representative_name,
  } = data;

  const { data: inserted, error } = await browserClient
    .from("entities")
    .insert([
      {
        user_id,
        name_kr,
        name_en,
        address_kr,
        address_en,
        country,
        has_poa,
        signature_image_url,
        signer_position,
        signer_name,
        representative_name,
      },
    ]);

  if (error) {
    console.error("❌ Entity insert error:", error.message);
    toast.error(error.message);
    return null;
  }

  toast.success("Entity saved");

  return inserted;
}

type InventorInput = {
  user_id: string;
  name_kr: string;
  name_en: string;
  address_kr: string;
  address_en: string;
  nationality: string;
  residence_country: string;
};

// ✅ 삽입 후 삽입된 행 반환
export async function insertInventor(data: InventorInput) {
  const { data: inserted, error } = await browserClient
    .from("inventors")
    .insert([data])
    .select()
    .single(); // 한 행만 반환

  if (error) {
    console.error("❌ Inventor insert error:", error.message);
    toast.error(error.message);
    return null;
  }

  toast.success("Inventor saved");
  return inserted; // ✅ 삽입된 객체 반환
}
