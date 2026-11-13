import { test, expect, SCREENS, openScreen } from "./fixtures";

test.use({ contextOptions: { reducedMotion: "reduce" } });

for (const screen of SCREENS) {
  test(`${screen.name}: no animation or transition runs with reduced motion`, async ({ page }) => {
    await openScreen(page, screen);
    await page.waitForTimeout(400);
    const running = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.playState === "running")
        .map(
          (a) =>
            `${a.constructor.name} ${(a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty ?? ""}`,
        ),
    );
    expect(running).toEqual([]);
  });
}
