"use client";

import { useState } from "react";
import { UserProfile } from "@/lib/mock-user";

export default function ProfileSettings({ user }: { user: UserProfile }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-md space-y-8">
      {/* Profile form */}
      <form onSubmit={handleSave} className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Account details</h3>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Display name</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setSaved(false); }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setSaved(false); }}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <button
          type="submit"
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            saved ? "bg-green-500 text-white" : "bg-rose-500 text-white hover:bg-rose-600"
          }`}
        >
          {saved ? "Saved!" : "Save changes"}
        </button>
      </form>

      {/* Change password */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">Change password</h3>
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">Current password</label>
          <input type="password" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-1">New password</label>
          <input type="password" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400" />
        </div>
        <button className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
          Update password
        </button>
      </div>

      {/* Danger zone */}
      <div className="border border-red-100 rounded-xl p-4 space-y-2">
        <h3 className="text-sm font-semibold text-red-600">Danger zone</h3>
        <p className="text-xs text-gray-400">Deleting your account removes all your reviews and ratings permanently.</p>
        <button className="text-sm text-red-500 font-medium hover:underline">
          Delete my account
        </button>
      </div>
    </div>
  );
}
