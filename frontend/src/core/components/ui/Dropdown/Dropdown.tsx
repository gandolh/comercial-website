import { Menu } from "@base-ui/react/menu";
import type { ReactElement, ReactNode } from "react";
import { cn } from "@core/lib/cn";

export interface DropdownItem {
  key: string;
  label: string;
  icon?: string;
  variant?: "default" | "danger";
  onClick?: () => void;
  href?: string;
}

export interface DropdownLinkItem extends DropdownItem {
  renderLink: (props: { className: string; children: ReactNode }) => ReactNode;
}

interface DropdownProps {
  /** The button that opens the menu. It is passed through `render`, so it is the trigger and nothing nests in it. */
  trigger: ReactElement;
  items: (DropdownItem | DropdownLinkItem)[];
  align?: "start" | "end";
}

const itemClass = (variant?: "default" | "danger") =>
  cn(
    "flex h-11 w-full cursor-default items-center gap-3 rounded-lg px-3 text-control transition-colors",
    "outline-none data-highlighted:bg-primary-fixed data-highlighted:text-on-primary-fixed",
    variant === "danger" ? "text-error" : "text-on-surface",
  );

function isLinkItem(item: DropdownItem | DropdownLinkItem): item is DropdownLinkItem {
  return "renderLink" in item;
}

export function Dropdown({ trigger, items, align = "end" }: DropdownProps) {
  return (
    <Menu.Root>
      <Menu.Trigger render={trigger} />
      <Menu.Portal>
        <Menu.Positioner side="bottom" align={align} sideOffset={8} className="z-popup outline-none">
          <Menu.Popup className="min-w-56 rounded-xl border border-outline-variant bg-surface-container-lowest p-1.5 shadow-popup outline-none">
            {items.map((item, idx) => {
              if (item.key === "__separator__") {
                return <Menu.Separator key={`sep-${idx}`} className="mx-2 my-1 border-t border-outline-variant" />;
              }

              if (isLinkItem(item)) {
                return (
                  <Menu.Item
                    key={item.key}
                    className={itemClass(item.variant)}
                    render={(props) =>
                      item.renderLink({
                        className: props.className ?? itemClass(item.variant),
                        children: (
                          <>
                            {item.icon && (
                              <span className="material-symbols-outlined text-lg" aria-hidden="true">
                                {item.icon}
                              </span>
                            )}
                            {item.label}
                          </>
                        ),
                      }) as ReactElement
                    }
                  />
                );
              }

              return (
                <Menu.Item key={item.key} onClick={item.onClick} className={itemClass(item.variant)}>
                  {item.icon && (
                    <span className="material-symbols-outlined text-lg" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </Menu.Item>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function dropdownSeparator(): DropdownItem {
  return { key: "__separator__", label: "" };
}
