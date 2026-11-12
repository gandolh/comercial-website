import { Link, useNavigate } from "@core/lib/router";
import { useState } from "react";
import { useAuth } from "@core/lib/auth";
import { Button } from "@core/components/ui";
import { ContactSellerModal } from "@app/modules/messaging/components/ContactSellerModal";
import type { SellerSummary } from "../types";

interface SellerCardProps {
  seller: SellerSummary;
  listingId: string;
  isDigitalAsset?: boolean;
}

export function SellerCard({ seller, listingId, isDigitalAsset = false }: SellerCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const sellerName = seller.displayName || (isDigitalAsset ? "Autor PiațăRo" : "Vânzător PiațăRo");

  const isOwner = user?.id === seller.id;

  const handleContactClick = () => {
    if (!isAuthenticated) {
      navigate(`/autentificare?next=/anunturi/${listingId}`);
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 rounded-2xl bg-surface-container-low p-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/utilizator/${seller.id}`}
            className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-surface-container-highest transition-opacity hover:opacity-80"
          >
            {seller.avatarUrl ? (
              <img src={seller.avatarUrl} alt={sellerName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-outline">
                <span className="material-symbols-outlined">person</span>
              </div>
            )}
          </Link>
          <div>
            <Link to={`/utilizator/${seller.id}`} className="transition-colors hover:text-primary">
              <h3 className="text-lg font-bold text-on-surface">{sellerName}</h3>
            </Link>
            {seller.phoneVerified && (
              <div className="mt-1 flex w-fit items-center gap-1.5 rounded-full bg-tertiary-container/10 px-2 py-0.5 text-tertiary">
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{
                    fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  verified
                </span>
                <span className="text-[10px] font-bold tracking-wider uppercase">Vânzător Verificat</span>
              </div>
            )}
          </div>
        </div>
        <Link to={`/utilizator/${seller.id}`} className="text-sm font-bold text-primary hover:underline">
          Profil
        </Link>
      </div>

      {!isOwner && (
        <Button onClick={handleContactClick} iconLeft="mail" className="w-full">
          {isDigitalAsset ? "Contactează autorul" : "Contactează vânzătorul"}
        </Button>
      )}

      <ContactSellerModal
        listingId={listingId}
        sellerName={sellerName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-widest text-outline uppercase">Membru din</span>
          <div className="font-semibold text-on-surface">
            {new Date(seller.memberSince).toLocaleDateString("ro-RO", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-widest text-outline uppercase">Anunțuri active</span>
          <div className="font-semibold text-on-surface">{seller.activeListingsCount} anunțuri</div>
        </div>
      </div>
    </div>
  );
}
