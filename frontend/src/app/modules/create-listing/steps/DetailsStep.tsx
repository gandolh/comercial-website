import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { detailsStepSchema, type DetailsStepInput } from "../schemas";

interface DetailsStepProps {
  initialData?: Partial<DetailsStepInput>;
  onNext: (data: DetailsStepInput) => void;
  onBack?: () => void;
  hideFooter?: boolean;
  submitLabel?: string;
}

export function DetailsStep({
  initialData,
  onNext,
  onBack,
  hideFooter = false,
  submitLabel,
}: DetailsStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DetailsStepInput>({
    resolver: zodResolver(detailsStepSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      isNegotiable: initialData?.isNegotiable ?? false,
    },
  });

  const title = watch("title");
  const description = watch("description");

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
          Spune-ne mai multe
        </h2>
        <p className="text-on-surface-variant">
          Un titlu clar și o descriere detaliată te ajută să vinzi mai repede.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block font-bold text-sm px-1">
            Titlu anunț*
          </label>
          <div className="relative">
            <input
              {...register("title")}
              id="title"
              type="text"
              placeholder="Ex: iPhone 13 Pro 128GB Stare Perfectă"
              className={`w-full bg-surface-container-low border-2 rounded-2xl px-5 py-4 outline-none transition-all ${
                errors.title
                  ? "border-error"
                  : "border-transparent focus:border-primary"
              }`}
            />
            <span
              className={`absolute right-4 bottom-4 text-xs ${
                title.length > 200 ? "text-error" : "text-on-surface-variant"
              }`}
            >
              {title.length}/200
            </span>
          </div>
          {errors.title && (
            <p className="text-error text-xs px-1">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block font-bold text-sm px-1">
            Descriere*
          </label>
          <div className="relative">
            <textarea
              {...register("description")}
              id="description"
              rows={6}
              placeholder="Descrie produsul tău în detaliu. Menționează starea, defectele (dacă există) și de ce îl vinzi."
              className={`w-full bg-surface-container-low border-2 rounded-2xl px-5 py-4 outline-none transition-all resize-none ${
                errors.description
                  ? "border-error"
                  : "border-transparent focus:border-primary"
              }`}
            />
            <span
              className={`absolute right-4 bottom-4 text-xs ${
                description.length > 5000
                  ? "text-error"
                  : "text-on-surface-variant"
              }`}
            >
              {description.length}/5000
            </span>
          </div>
          {errors.description && (
            <p className="text-error text-xs px-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 px-1">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              {...register("isNegotiable")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
          <span className="text-sm font-medium text-on-surface">
            Preț negociabil
          </span>
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
