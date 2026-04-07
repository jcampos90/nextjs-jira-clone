import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../prisma";
import { ensureUserFromClerk, checkProjectAccess } from "../../../auth";
import { CollaboratorRole } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await ensureUserFromClerk();
    const access = await checkProjectAccess(id, user.id);

    if (!access) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const collaborators = await prisma.projectCollaborator.findMany({
      where: { projectId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    return NextResponse.json({ error: "Failed to fetch collaborators" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await ensureUserFromClerk();
    const access = await checkProjectAccess(id, user.id);

    if (!access) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!access.isOwner) {
      return NextResponse.json({ error: "Only owner can invite collaborators" }, { status: 403 });
    }

    const body = await request.json();
    const { email, role = "EDITOR" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const userToInvite = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToInvite) {
      return NextResponse.json({ error: "User not found. They must sign in first." }, { status: 404 });
    }

    const collaborator = await prisma.projectCollaborator.upsert({
      where: {
        userId_projectId: {
          userId: userToInvite.id,
          projectId: id,
        },
      },
      update: { role: role as CollaboratorRole },
      create: {
        userId: userToInvite.id,
        projectId: id,
        role: role as CollaboratorRole,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(collaborator, { status: 201 });
  } catch (error) {
    console.error("Error adding collaborator:", error);
    return NextResponse.json({ error: "Failed to add collaborator" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await ensureUserFromClerk();
    const access = await checkProjectAccess(id, user.id);

    if (!access) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!access.isOwner) {
      return NextResponse.json({ error: "Only owner can remove collaborators" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    await prisma.projectCollaborator.delete({
      where: {
        userId_projectId: {
          userId,
          projectId: id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return NextResponse.json({ error: "Failed to remove collaborator" }, { status: 500 });
  }
}
