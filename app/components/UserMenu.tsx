'use client';

import { UserButton } from "@clerk/nextjs";

export default function UserMenu() {
  return (
    <div className="relative">
      <UserButton 
        appearance={{
          elements: {
            avatarBox: "w-8 h-8"
          }
        }}
      />
    </div>
  );
}
