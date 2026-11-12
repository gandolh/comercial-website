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
    <RadioGroup
      aria-label={t("footer.theme.label")}
      value={theme}
      onValueChange={(next) => setTheme(next as Theme)}
      className="inline-flex rounded-full border border-outline p-0.5"
    >
      {THEMES.map((value) => (
        <Radio
          key={value}
          value={value}
          className="rounded-full px-3 py-1 text-xs font-medium text-on-surface-variant transition-colors hover:text-on-surface focus-visible:ring-inset data-checked:bg-primary data-checked:text-on-primary"
        >
          {t(`footer.theme.${value}`)}
        </Radio>
      ))}
    </RadioGroup>
  );
}
