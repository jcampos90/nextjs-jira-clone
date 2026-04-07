import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import { CollaboratorRole } from "@prisma/client";

export async function getAuthUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getOrCreateUser(clerkUserId: string) {
  let user = await prisma.user.findUnique({
    where: { id: clerkUserId },
  });

  if (!user) {
    const client = await clerkClient();
    let email = `${clerkUserId}@placeholder.local`;
    let name: string | null = null;

    try {
      const clerkUser = await client.users.getUser(clerkUserId);
      email = clerkUser.emailAddresses[0]?.emailAddress || email;
      name = clerkUser.fullName;
    } catch (err) {
      console.error("Failed to fetch Clerk user:", err);
    }

    user = await prisma.user.create({
      data: {
        id: clerkUserId,
        email,
        name,
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
