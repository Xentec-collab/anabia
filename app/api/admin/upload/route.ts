import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "@/lib/adminAuth";
import cloudinary from "@/lib/cloudinary";

// Max file size: 10 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

/**
 * Validates genuine image binary signatures (magic bytes) to prevent MIME spoofing.
 */
function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  // JPEG: FF D8 FF
  if (mimeType === "image/jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47
  if (mimeType === "image/png") {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }

  // GIF: GIF8 (47 49 46 38)
  if (mimeType === "image/gif") {
    return (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38
    );
  }

  // WebP: RIFF....WEBP (52 49 46 46 .... 57 45 42 50)
  if (mimeType === "image/webp") {
    const isRiff =
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46;
    const isWebp =
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  // AVIF: contains "ftypavif" or "ftypavis" in header box
  if (mimeType === "image/avif") {
    const headerString = buffer.subarray(0, 32).toString("binary");
    return headerString.includes("ftypavif") || headerString.includes("ftypavis");
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Defense-in-depth: verify admin session inside handler
    const cookieStore = await cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!(await verifyAdminSession(session))) {
      return NextResponse.json(
        { error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Content-Type must be multipart/form-data" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 2. Validate declared file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, AVIF, GIF` },
        { status: 400 }
      );
    }

    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum: 10 MB` },
        { status: 400 }
      );
    }

    // 4. Validate genuine magic byte signature
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!verifyMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: "Invalid image content: file signature does not match declared image type." },
        { status: 400 }
      );
    }

    // 5. Memory-efficient streaming upload to Cloudinary
    const uploadResult = await new Promise<{
      secure_url: string;
      public_id: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "anabia/products",
          resource_type: "image",
          quality: "auto:good",
          fetch_format: "auto",
          overwrite: false,
          unique_filename: true,
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Upload to Cloudinary returned no result"));
          } else {
            resolve(result as any);
          }
        }
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    });
  } catch (err: unknown) {
    console.error("Cloudinary upload error:", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
