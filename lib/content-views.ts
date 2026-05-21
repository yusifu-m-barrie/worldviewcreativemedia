import mongoose from "mongoose";
import { connectDB, isDbConfigured, tryConnectDB } from "@/lib/db";
import { Article } from "@/models/Article";
import { Video } from "@/models/Video";
import { LiveStream } from "@/models/LiveStream";
import { ContentView, type ViewContentType } from "@/models/ContentView";
import "@/models";

export interface RecordViewResult {
  counted: boolean;
  viewCount: number;
}

async function getPublishedViewCount(
  contentType: ViewContentType,
  contentId: string
): Promise<number> {
  const oid = new mongoose.Types.ObjectId(contentId);
  if (contentType === "article") {
    const doc = await Article.findById(oid).select("viewCount").lean();
    return doc?.viewCount ?? 0;
  }
  if (contentType === "video") {
    const doc = await Video.findOne({ _id: oid, status: "published" }).select("viewCount").lean();
    return doc?.viewCount ?? 0;
  }
  const doc = await LiveStream.findById(oid).select("viewCount").lean();
  return doc?.viewCount ?? 0;
}

async function contentExists(
  contentType: ViewContentType,
  contentId: string
): Promise<boolean> {
  const oid = new mongoose.Types.ObjectId(contentId);
  if (contentType === "article") {
    const doc = await Article.findOne({ _id: oid, status: "published" }).select("_id").lean();
    return Boolean(doc);
  }
  if (contentType === "video") {
    const doc = await Video.findOne({ _id: oid, status: "published" }).select("_id").lean();
    return Boolean(doc);
  }
  const doc = await LiveStream.findById(oid).select("_id").lean();
  return Boolean(doc);
}

async function incrementViewCount(
  contentType: ViewContentType,
  contentId: string
): Promise<number> {
  const oid = new mongoose.Types.ObjectId(contentId);
  if (contentType === "article") {
    const doc = await Article.findByIdAndUpdate(
      oid,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .select("viewCount")
      .lean();
    return doc?.viewCount ?? 0;
  }
  if (contentType === "video") {
    const doc = await Video.findByIdAndUpdate(
      oid,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .select("viewCount")
      .lean();
    return doc?.viewCount ?? 0;
  }
  const doc = await LiveStream.findByIdAndUpdate(
    oid,
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .select("viewCount")
    .lean();
  return doc?.viewCount ?? 0;
}

/**
 * Record at most one view per visitorKey per content item.
 * visitorKey comes from cookie (preferred) or hashed IP + user-agent.
 */
export async function recordUniqueContentView(
  contentType: ViewContentType,
  contentId: string,
  visitorKey: string,
  ipHash?: string
): Promise<RecordViewResult> {
  if (!isDbConfigured() || !(await tryConnectDB())) {
    return { counted: false, viewCount: 0 };
  }

  if (!mongoose.Types.ObjectId.isValid(contentId)) {
    return { counted: false, viewCount: 0 };
  }

  await connectDB();

  if (!(await contentExists(contentType, contentId))) {
    return { counted: false, viewCount: 0 };
  }

  const contentOid = new mongoose.Types.ObjectId(contentId);
  const orConditions: Record<string, unknown>[] = [{ visitorKey }];
  if (ipHash) orConditions.push({ ipHash });

  const existing = await ContentView.findOne({
    contentType,
    contentId: contentOid,
    $or: orConditions,
  })
    .select("_id")
    .lean();

  if (existing) {
    const viewCount = await getPublishedViewCount(contentType, contentId);
    return { counted: false, viewCount };
  }

  try {
    await ContentView.create({
      contentType,
      contentId: contentOid,
      visitorKey,
      ipHash: ipHash || undefined,
      firstViewedAt: new Date(),
    });
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code === 11000) {
      const viewCount = await getPublishedViewCount(contentType, contentId);
      return { counted: false, viewCount };
    }
    throw err;
  }

  const viewCount = await incrementViewCount(contentType, contentId);
  return { counted: true, viewCount };
}
