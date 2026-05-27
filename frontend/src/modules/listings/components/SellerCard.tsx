import { Link, useNavigate } from "@/lib/router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui";
import { ContactSellerModal } from "@/modules/messaging/components/ContactSellerModal";
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
    <div className="bg-surface-container-low p-8 rounded-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            to={`/utilizator/${seller.id}`}
            className="w-14 h-14 rounded-full bg-surface-container-highest overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            {seller.avatarUrl ? (
              <img
                src={seller.avatarUrl}
                alt={sellerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-outline">
                <span className="material-symbols-outlined">person</span>
              </div>
            )}
          </Link>
          <div>
            <Link
              to={`/utilizator/${seller.id}`}
              className="hover:text-primary transition-colors"
            >
              <h3 className="font-bold text-lg text-on-surface">
                {sellerName}
              </h3>
            </Link>
            {seller.phoneVerified && (
              <div className="flex items-center gap-1.5 bg-tertiary-container/10 text-tertiary px-2 py-0.5 rounded-full w-fit mt-1">
                <span
                  className="material-symbols-outlined text-[14px]"
                  style={{
                    fontVariationSettings:
                      "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24",
                  }}
                >
                  verified
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Vânzător Verificat
                </span>
              </div>
            )}
          </div>
        </div>
        <Link
          to={`/utilizator/${seller.id}`}
          className="text-primary hover:underline font-bold text-sm"
        >
          Profil
        </Link>
      </div>

      {!isOwner && (
        <Button
          onClick={handleContactClick}
          iconLeft="mail"
          className="w-full"
        >
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
          <span className="text-[10px] text-outline uppercase tracking-widest font-bold">
            Membru din
          </span>
          <div className="font-semibold text-on-surface">
            {new Date(seller.memberSince).toLocaleDateString("ro-RO", {
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] text-outline uppercase tracking-widest font-bold">
            Anunțuri active
          </span>
          <div className="font-semibold text-on-surface">
            {seller.activeListingsCount} anunțuri
          </div>
        </div>
      </div>
    </div>
  );
}
