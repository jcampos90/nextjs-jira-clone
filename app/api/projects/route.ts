import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../prisma";
import { ensureUserFromClerk } from "../auth";

export async function GET() {
  try {
    const user = await ensureUserFromClerk();

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { collaborators: { some: { userId: user.id } } },
        ],
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        collaborators: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { tickets: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await ensureUserFromClerk();
    const body = await request.json();

    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description || "",
        ownerId: user.id,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        collaborators: true,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
