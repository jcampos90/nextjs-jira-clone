import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../prisma";
import { ensureUserFromClerk } from "../../auth";
import { deleteFile } from "@/lib/r2";
import { clerkClient } from "@clerk/nextjs/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await ensureUserFromClerk();

    const attachment = await prisma.attachment.findUnique({
      where: { id },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    const isOwner = attachment.uploadedById === user.id;
    let isAdmin = false;

    try {
      const client = await clerkClient();
      const clerkUser = await client.users.getUser(user.id);
      isAdmin = clerkUser.publicMetadata?.role === "admin";
    } catch {
      // If we can't check admin status, continue with permission check
    }

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await deleteFile(attachment.storageKey);

    await prisma.attachment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 });
  }
}
