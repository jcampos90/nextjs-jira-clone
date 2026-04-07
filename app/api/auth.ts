import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { CollaboratorRole } from "@prisma/client";

export async function getAuthUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getOrCreateUser(clerkUserId: string, email?: string, name?: string | null) {
  let user = await prisma.user.findUnique({
    where: { id: clerkUserId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: clerkUserId,
        email: email || `${clerkUserId}@placeholder.local`,
        name: name || null,
      },
    });
  }

  return user;
}

export async function ensureUserFromClerk() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  return getOrCreateUser(userId);
}

export async function checkProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: true,
    },
  });

  if (!project) {
    return null;
  }

  const isOwner = project.ownerId === userId;
  const collaborator = project.collaborators.find((c) => c.userId === userId);

  if (!isOwner && !collaborator) {
    throw new Error("Access denied");
  }

  return { project, isOwner, role: collaborator?.role ?? "OWNER" };
}

export function canEditProject(role: CollaboratorRole | undefined, isOwner: boolean): boolean {
  return isOwner || role === "OWNER" || role === "EDITOR";
}
