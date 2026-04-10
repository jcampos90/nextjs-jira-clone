import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../prisma";
import { ensureUserFromClerk } from "../../auth";
import { uploadFile } from "@/lib/r2";
import { isValidMimeType, isValidFileSize } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUserFromClerk();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const ticketId = formData.get("ticketId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ticketId) {
      return NextResponse.json({ error: "ticketId is required" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;
    const mimeType = file.type;

    if (!isValidMimeType(mimeType)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (!isValidFileSize(buffer.length)) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const storageKey = await uploadFile(buffer, filename, mimeType);

    const attachment = await prisma.attachment.create({
      data: {
        filename,
        mimeType,
        size: buffer.length,
        storageKey,
        ticketId,
        uploadedById: user.id,
      },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return NextResponse.json({ error: "Failed to upload attachment" }, { status: 500 });
  }
}
