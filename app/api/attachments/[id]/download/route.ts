import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../prisma";
import { ensureUserFromClerk, checkProjectAccess } from "../../../auth";
import { getSignedUrl } from "@/lib/r2";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await ensureUserFromClerk();

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        ticket: { select: { projectId: true } },
      },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    // Check access - user must be project member or attachment owner
    const isOwner = attachment.uploadedById === user.id;
    if (!isOwner) {
      const access = await checkProjectAccess(attachment.ticket.projectId, user.id);
      if (!access) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const signedUrl = await getSignedUrl(attachment.storageKey);

    return NextResponse.json({ url: signedUrl, filename: attachment.filename });
  } catch (error) {
    console.error("Error generating download URL:", error);
    return NextResponse.json({ error: "Failed to get download URL" }, { status: 500 });
  }
}
