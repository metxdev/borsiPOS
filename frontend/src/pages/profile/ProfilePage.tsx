import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ProfileForm from "@/components/ProfileForm";
import PageHeader from "@/components/PageHeader";

export default function Profile() {
  const user = useSelector((s: RootState) => s.auth.user);

  if (!user) {
    return (
      <div>
        <div>Loading…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Profile" subtitle="Update your account information." />
      <div>
        <ProfileForm
          id={user.id}
          fullName={user.fullName}
          email={user.email}
        />
      </div>
    </div>
  );
}
