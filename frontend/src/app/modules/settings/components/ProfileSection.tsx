import React, { useState } from "react";
import { useUpdateProfile } from "../hooks/useProfile";
import { useAuth } from "@core/lib/auth";
import { Input, Button } from "@core/components/ui";
import PhoneVerifyModal from "@app/modules/auth/components/PhoneVerifyModal";

export function ProfileSection() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const updateProfileMutation = useUpdateProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileMutation.mutateAsync({ display_name: displayName });
  };

  return (
    <section className="bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant">
      <h3 className="text-xl font-semibold mb-6">Informații Profil</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nume afișat"
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Cum să te vadă ceilalți?"
          fullWidth
        />

        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface">Email</label>
          <div className="p-3 bg-surface-container-high rounded-md text-on-surface-variant flex justify-between items-center">
            <span>{user?.email}</span>
            <span className="text-xs italic">
              Email-ul nu poate fi schimbat momentan
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-on-surface">Telefon</label>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-surface-container-high rounded-md text-on-surface-variant">
              {user?.phone || "Niciun număr adăugat"}
            </div>
            {!user?.phone_verified && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsPhoneModalOpen(true)}
              >
                Verifică
              </Button>
            )}
            {user?.phone_verified && (
              <div className="px-4 py-2 bg-success/10 text-success rounded-md font-medium flex items-center gap-1">
                ✓ Verificat
              </div>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" loading={updateProfileMutation.isPending}>
            Salvează modificările
          </Button>
        </div>
      </form>

      {isPhoneModalOpen && (
        <PhoneVerifyModal
          open={isPhoneModalOpen}
          onOpenChange={setIsPhoneModalOpen}
        />
      )}
    </section>
  );
}
