import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../prisma";
import { ensureUserFromClerk, checkProjectAccess } from "../auth";

export async function GET(request: NextRequest) {
  try {
    const user = await ensureUserFromClerk();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    await checkProjectAccess(projectId, user.id);

    const tickets = await prisma.ticket.findMany({
      where: { projectId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUserFromClerk();
    const body = await request.json();

    await checkProjectAccess(body.projectId, user.id);

    const ticket = await prisma.ticket.create({
      data: {
        title: body.title,
        description: body.description || "",
        status: body.status || "TODO",
        priority: body.priority || "MEDIUM",
        projectId: body.projectId,
        creatorId: user.id,
        assigneeId: body.assigneeId,
        dueDate: body.dueDate || null,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
