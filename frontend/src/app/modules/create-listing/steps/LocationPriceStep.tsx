import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { locationPriceStepSchema, type LocationPriceInput } from "../schemas";

interface LocationPriceStepProps {
  initialData?: Partial<LocationPriceInput>;
  onNext: (data: LocationPriceInput) => void;
  onBack?: () => void;
  hideFooter?: boolean;
  submitLabel?: string;
}

export function LocationPriceStep({
  initialData,
  onNext,
  onBack,
  hideFooter = false,
  submitLabel,
}: LocationPriceStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocationPriceInput>({
    resolver: zodResolver(locationPriceStepSchema),
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
    <form
      onSubmit={handleSubmit(onNext)}
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="text-center space-y-2">
        <h2
          className="text-2xl font-black"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          Stabilește prețul
        </h2>
        <p className="text-on-surface-variant">
          Cât costă produsul tău digital?
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="priceRon" className="block font-bold text-sm px-1">
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
                className={`w-full bg-surface-container-low border-2 rounded-2xl px-5 py-4 outline-none transition-all ${
                  errors.priceRon
                    ? "border-error"
                    : "border-transparent focus:border-primary"
                } ${isFree ? "opacity-50 grayscale" : ""}`}
              />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-outline">
                RON
              </span>
            </div>
            {errors.priceRon && (
              <p className="text-error text-xs px-1">
                {errors.priceRon.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 px-1">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("isFree")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
            <span className="text-sm font-medium text-on-surface">
              Oferit gratuit
            </span>
          </div>
        </div>
      </div>

      {!hideFooter && (
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-8 py-4 rounded-full font-bold border-2 border-outline-variant hover:bg-surface-container-low transition-colors"
          >
            Înapoi
          </button>
          <button
            type="submit"
            className="flex-[2] px-8 py-4 rounded-full font-bold bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md"
          >
            {submitLabel || "Continuă"}
          </button>
        </div>
      )}

      {hideFooter && (
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="px-8 py-4 rounded-full font-bold bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all shadow-md"
          >
            {submitLabel || "Salvează"}
          </button>
        </div>
      )}
    </form>
  );
}
