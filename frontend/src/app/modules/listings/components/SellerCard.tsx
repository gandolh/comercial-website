import { Link, useNavigate } from "@core/lib/router";
import { useState } from "react";
import { useAuth } from "@core/lib/auth";
import { Button } from "@core/components/ui";
import { Panel } from "./Panel";
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
    <Panel aria-label="Autor" className="gap-4">
      <div className="flex items-center gap-3.5">
        <Link
          to={`/utilizator/${seller.id}`}
          aria-label={sellerName}
          className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-container-high text-on-surface-variant transition-opacity hover:opacity-80"
        >
          {seller.avatarUrl ? (
            <img src={seller.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="material-symbols-outlined" aria-hidden="true">
              person
            </span>
          )}
        </Link>
        <div className="min-w-0">
          <Link to={`/utilizator/${seller.id}`} className="text-on-surface no-underline hover:text-primary">
            <h2 className="text-card-title font-extrabold">{sellerName}</h2>
          </Link>
          {seller.phoneVerified && (
            <span className="mt-1 inline-flex h-6 items-center gap-1 rounded-xl bg-tertiary-container pr-2.5 pl-2 text-label font-semibold text-on-fill">
              <span className="material-symbols-outlined" style={{ fontSize: "14px" }} aria-hidden="true">
                verified
              </span>
              Vânzător verificat
            </span>
          )}
        </div>
        <Link
          to={`/utilizator/${seller.id}`}
          className="ml-auto py-3 pl-2 text-control font-semibold text-primary underline underline-offset-3"
        >
          Profil
        </Link>
      </div>

      {!isOwner && (
        <Button variant="outline" onClick={handleContactClick} iconLeft="mail" className="w-full">
          {isDigitalAsset ? "Contactează autorul" : "Contactează vânzătorul"}
        </Button>
      )}

      <ContactSellerModal
        listingId={listingId}
        sellerName={sellerName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="grid grid-cols-2 gap-4 border-t border-outline-variant pt-4">
        <div>
          <span className="block text-control text-on-surface-variant">Membru din</span>
          <span className="block font-semibold text-on-surface">
            {new Date(seller.memberSince).toLocaleDateString("ro-RO", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <div>
          <span className="block text-control text-on-surface-variant">Anunțuri active</span>
          <span className="block font-semibold text-on-surface">{seller.activeListingsCount} anunțuri</span>
        </div>
      </div>
    </Panel>
  );
}
