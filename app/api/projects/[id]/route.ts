import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../prisma";
import { ensureUserFromClerk, checkProjectAccess, canEditProject } from "../../auth";

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

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        collaborators: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        tickets: true,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(
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

    if (!canEditProject(access.role, access.isOwner)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const project = await prisma.project.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
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
      return NextResponse.json({ error: "Only owner can delete project" }, { status: 403 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
