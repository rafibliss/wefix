/**
 * Helper to upload image files to ImgBB using NEXT_PUBLIC_IMGBB_API_KEY
 */
export async function uploadToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_IMGBB_API_KEY in environment variables");
  }

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.message || "Failed to upload image to ImgBB");
  }

  return data.data.url as string;
}
