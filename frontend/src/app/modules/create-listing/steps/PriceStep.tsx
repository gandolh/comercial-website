import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@core/components/ui";
import { priceStepSchema, type PriceStepInput } from "../schemas";

interface PriceStepProps {
  initialData?: Partial<PriceStepInput>;
  onNext: (data: PriceStepInput) => void;
  onBack?: () => void;
  hideFooter?: boolean;
  submitLabel?: string;
}

export function PriceStep({ initialData, onNext, onBack, hideFooter = false, submitLabel }: PriceStepProps) {
  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PriceStepInput>({
    resolver: zodResolver(priceStepSchema),
    defaultValues: {
      priceRon: initialData?.priceRon ?? null,
      isFree: initialData?.isFree ?? false,
    },
  });

  const isFree = watch("isFree");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? null : parseInt(e.target.value, 10);
    setValue("priceRon", value);
  };

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="font-headline text-2xl font-extrabold">Stabilește prețul</h2>
        <p className="text-on-surface-variant">Cât costă produsul tău?</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="priceRon" className="block px-1 text-sm font-bold">
              Preț (RON)
            </label>
            <div className="relative">
              <input
                id="priceRon"
                type="number"
                disabled={isFree}
                placeholder="Ex: 150"
                defaultValue={initialData?.priceRon ?? ""}
                onChange={handlePriceChange}
                className={`w-full rounded-2xl border-2 bg-surface-container-low px-5 py-4 transition-all outline-none ${
                  errors.priceRon ? "border-error" : "border-transparent focus:border-primary"
                } ${isFree ? "opacity-50 grayscale" : ""}`}
              />
              <span className="absolute top-1/2 right-5 -translate-y-1/2 font-bold text-on-surface-variant">RON</span>
            </div>
            {errors.priceRon && <p className="px-1 text-xs text-error">{errors.priceRon.message}</p>}
          </div>

          <div className="px-1">
            <Switch
              label={<span className="text-sm font-medium text-on-surface">Gratuit</span>}
              checked={isFree}
              onCheckedChange={(checked) => setValue("isFree", checked, { shouldDirty: true })}
            />
          </div>
        </div>
      </div>

      {!hideFooter && (
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-full border-2 border-outline-variant px-8 py-4 font-bold transition-colors hover:bg-surface-container-low"
          >
            Înapoi
          </button>
          <button
            type="submit"
            className="flex-[2] rounded-control bg-primary px-8 py-4 font-bold text-on-primary transition-all hover:bg-primary-container hover:text-on-primary-container"
          >
            {submitLabel || "Continuă"}
          </button>
        </div>
      )}

      {hideFooter && (
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="rounded-control bg-primary px-8 py-4 font-bold text-on-primary transition-all hover:bg-primary-container hover:text-on-primary-container"
          >
            {submitLabel || "Salvează"}
          </button>
        </div>
      )}
    </form>
  );
}
