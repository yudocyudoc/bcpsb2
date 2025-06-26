// src/pages/ProfilePage.tsx
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileHeader } from "@/components/profile/ProfileHeader";

export function ProfilePage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
      <ProfileHeader />
      <ProfileForm />
    </div>
  );
}