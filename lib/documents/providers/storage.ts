/* DEVIATION FROM SPEC: the task spec called for @supabase/supabase-js's
   storage client authenticated with SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
   Neither exists in .env. What IS in .env is Supabase Storage's S3-compatible
   credentials (SUPABASE_S3_ENDPOINT/REGION/ACCESS_KEY_ID/SECRET_ACCESS_KEY) —
   a different auth mechanism that supabase-js's storage client cannot use.
   Implemented against the S3-compatible API instead, via @aws-sdk/client-s3
   (installed for this), same public function signatures as specified. */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "documents";

let client: S3Client | null = null;
function getStorageClient(): S3Client {
  if (client) return client;
  const endpoint = process.env.SUPABASE_S3_ENDPOINT;
  const region = process.env.SUPABASE_S3_REGION;
  const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY;
  if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "SUPABASE_S3_ENDPOINT / SUPABASE_S3_REGION / SUPABASE_S3_ACCESS_KEY_ID / SUPABASE_S3_SECRET_ACCESS_KEY are not set — check .env"
    );
  }
  client = new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

export async function uploadDocument(key: string, file: Buffer, contentType: string): Promise<void> {
  const s3 = getStorageClient();
  const put = () => s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: file, ContentType: contentType }));
  try {
    await put();
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    if (name === "NoSuchBucket") {
      // Bucket doesn't exist yet — create it (private) and retry once.
      await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
      await put();
      return;
    }
    throw new Error(`Supabase Storage upload failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function downloadDocument(key: string): Promise<Buffer> {
  try {
    const res = await getStorageClient().send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    if (!res.Body) throw new Error("no data");
    const bytes = await res.Body.transformToByteArray();
    return Buffer.from(bytes);
  } catch (err) {
    throw new Error(`Supabase Storage download failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export async function deleteDocument(key: string): Promise<void> {
  try {
    await getStorageClient().send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
  } catch (err) {
    throw new Error(`Supabase Storage delete failed: ${err instanceof Error ? err.message : String(err)}`);
  }
}
