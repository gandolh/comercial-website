import { useTranslation } from "react-i18next";
import { useTheme, type Theme } from "@core/lib/theme";
import { Radio, RadioGroup } from "../RadioGroup";

const THEMES: readonly Theme[] = ["light", "dark", "system"];

/**
 * Light, Dark or System, kept on this device. A RadioGroup, because nothing goes to a server on a pick (base-ui
 * rules 14 and 16): the arrow keys may try each option.
 */
export function ThemeSwitch() {
  const { t } = useTranslation();
  const theme = useTheme((state) => state.theme);
  const setTheme = useTheme((state) => state.setTheme);

  return (
    <div className="flex items-center gap-3">
      <span id="theme-switch-label" className="text-control text-on-surface-variant">
        {t("footer.theme.label")}
      </span>
      <RadioGroup
        aria-labelledby="theme-switch-label"
        value={theme}
        onValueChange={(next) => setTheme(next as Theme)}
        className="inline-flex gap-0.5 rounded-xl bg-surface-container-lowest p-1 ring-1 ring-outline-variant ring-inset"
      >
        {THEMES.map((value) => (
          <Radio
            key={value}
            value={value}
            className="flex h-8 items-center rounded-lg px-3 text-control whitespace-nowrap text-on-surface-variant transition-colors hover:text-on-surface focus-visible:ring-inset data-checked:bg-primary-fixed data-checked:font-semibold data-checked:text-on-primary-fixed data-checked:shadow-[inset_0_0_0_1px_var(--color-primary)]"
          >
            {t(`footer.theme.${value}`)}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}
