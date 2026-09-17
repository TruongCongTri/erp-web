// app/api/cv/route.ts
import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

function extractS3Key(rawKey: string): string {
  let key = rawKey.trim();

  // If it's a full URL, strip off everything before the path
  if (key.startsWith("http://") || key.startsWith("https://")) {
    try {
      const url = new URL(key);
      key = url.pathname; // Gets "/resumes/abc.pdf"
    } catch {
      // fallback if malformed
    }
  }

  // Remove leading slashes
  key = key.replace(/^\/+/, "");

  // If the bucket name accidentally got prefixed into the pathname
  const bucketName =
    process.env.AWS_S3_BUCKET_NAME ||
    "storage-chinhnamerp-666952271487-ap-southeast-2-an";
  if (key.startsWith(bucketName + "/")) {
    key = key.replace(bucketName + "/", "");
  }

  return decodeURIComponent(key);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawKey = searchParams.get("key"); // e.g. "resumes/candidate-123.pdf"
  const action = searchParams.get("action"); // "view" or "download"

  if (!rawKey) {
    return NextResponse.json(
      { error: "File key is required" },
      { status: 400 },
    );
  }

  // 1. Differentiate "inline" (view in browser) vs "attachment" (force download)
  const fileKey = extractS3Key(rawKey);
  const fileName = fileKey.split("/").pop() || "candidate-cv.pdf";
  const isDownload = action === "download";

  const command = new GetObjectCommand({
    Bucket:
      process.env.AWS_S3_BUCKET_NAME ||
      "storage-chinhnamerp-666952271487-ap-southeast-2-an",
    Key: fileKey,
    ResponseContentType: "application/pdf",
    ResponseContentDisposition: isDownload
      ? `attachment; filename="${fileName}"` // Forces immediate download dialog
      : `inline; filename="${fileName}"`, // Forces browser PDF viewer
  });

  try {
    // Generate signed URL valid for 15 minutes (900 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
    return NextResponse.json({ url: signedUrl });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error generating pre-signed URL:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate signed URL" },
      { status: 500 },
    );
  }
}
