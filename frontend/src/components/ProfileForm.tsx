import { useState } from "react";
import { updateUserById } from "@/store/auth/authAction";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useAppDispatch } from "@/store/hooks";
import InputField from "./InputField";
import PasswordField from "./PasswordField";
import Card from "./Card"; // ✅ import your Card component

interface ProfileProps {
  id: number;
  fullName: string;
  email: string;
}

export default function ProfileForm({ id, email, fullName }: ProfileProps) {
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    fullName
  )}&background=0D8ABC&color=fff`;

  const dispatch = useAppDispatch();
  const authState = useSelector((s: RootState) => s.auth);

  const [name, setName] = useState(fullName);
  const [emailVal, setEmail] = useState(email);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    const payload = {
      id,
      fullName: name,
      email: emailVal,
      ...(password && { password }),
    };

    setSubmitting(true);
    const result = await dispatch(updateUserById(payload as any) as any);
    setSubmitting(false);

    if (result.meta?.requestStatus === "fulfilled") {
      alert("Profile updated!");
    } else {
      const errMsg =
        (result.payload as string) || authState.error || "Failed to update profile";
      alert(errMsg);
    }
  };

  return (
    <Card className="max-w-xl space-y-6 p-6 border border-neutral-800 rounded-2xl bg-card/60 backdrop-blur-md">
      <header className="flex items-center gap-4">
        <img
          src={avatar}
          alt="Avatar"
          className="w-14 h-14 rounded-full border border-neutral-700"
        />
        <div>
          <h2 className="text-xl font-semibold text-light">Edit Profile</h2>
          <p className="text-sm text-muted">{emailVal}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-5">
        <InputField
          id="fullName"
          label="Full Name"
          type="text"
          value={name}
          onChange={setName}
        />
        <InputField
          id="email"
          label="Email"
          type="email"
          value={emailVal}
          onChange={setEmail}
        />
        <PasswordField
          id="password"
          label="New Password"
          value={password}
          onChange={setPassword}
        />
        <PasswordField
          id="confirm"
          label="Confirm Password"
          value={confirm}
          onChange={setConfirm}
        />

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="reset"
            disabled={submitting}
            onClick={() => {
              setName(fullName);
              setEmail(email);
              setPassword("");
              setConfirm("");
            }}
            className="text-muted hover:text-white text-sm"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Card>
  );
}
