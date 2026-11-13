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

export function DetailsStep({ initialData, onNext, onBack, hideFooter = false, submitLabel }: DetailsStepProps) {
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
    },
  });

  const title = watch("title");
  const description = watch("description");

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-8 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="font-headline text-2xl font-extrabold">Spune-ne mai multe</h2>
        <p className="text-on-surface-variant">Un titlu clar și o descriere detaliată te ajută să vinzi mai repede.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block px-1 text-sm font-bold">
            Titlu anunț*
          </label>
          <div className="relative">
            <input
              {...register("title")}
              id="title"
              type="text"
              placeholder="Ex: iPhone 13 Pro 128GB Stare Perfectă"
              className={`w-full rounded-control bg-surface-container-low px-3.5 py-3 text-body ring-1 ring-outline outline-none ring-inset ${
                errors.title ? "ring-2 ring-error" : "focus:ring-2 focus:ring-primary"
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
          {errors.title && <p className="px-1 text-xs text-error">{errors.title.message}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="block px-1 text-sm font-bold">
            Descriere*
          </label>
          <div className="relative">
            <textarea
              {...register("description")}
              id="description"
              rows={6}
              placeholder="Descrie produsul tău în detaliu. Menționează starea, defectele (dacă există) și de ce îl vinzi."
              className={`w-full resize-none rounded-control bg-surface-container-low px-3.5 py-3 text-body ring-1 ring-outline outline-none ring-inset ${
                errors.description ? "ring-2 ring-error" : "focus:ring-2 focus:ring-primary"
              }`}
            />
            <span
              className={`absolute right-4 bottom-4 text-xs ${
                description.length > 5000 ? "text-error" : "text-on-surface-variant"
              }`}
            >
              {description.length}/5000
            </span>
          </div>
          {errors.description && <p className="px-1 text-xs text-error">{errors.description.message}</p>}
        </div>
      </div>

      {!hideFooter && (
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 rounded-control border border-outline px-5 py-3 font-semibold transition-colors hover:bg-surface-container-low"
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
