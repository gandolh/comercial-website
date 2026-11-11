import preset from "../vendor/house-style/knip.json" with { type: "json" };

// knip has no `extends`, so this spreads the house preset. It runs per project (each has its own
// package.json and lockfile), and the root check:conventions calls both. The ESLint config is an entry
// because knip only finds it through an `eslint` dependency, and ESLint is installed once, in the folder
// above, so knip sees it, and knip itself, as binaries the project does not list.
export default {
  ...preset,
  entry: ["eslint.config.js"],
  ignoreBinaries: ["eslint", "knip"],
  // An exception for now (2026-11-11): these files have no importer, because the pages that would use them
  // were never wired in. When each is wired in or deleted, it comes off this list.
  ignore: [
    "src/app/modules/auth/components/FormField.tsx",
    "src/app/modules/auth/components/SubmitButton.tsx",
    "src/app/modules/auth/hooks/useResendVerificationMutation.ts",
    "src/app/modules/create-listing/components/StepFooter.tsx",
    "src/app/modules/create-listing/hooks/useCreateDraftMutation.ts",
    "src/app/modules/listings/components/SpecsBento.tsx",
    "src/app/modules/settings/components/AvatarUploader.tsx",
    "src/app/modules/settings/components/PasswordSection.tsx",
    "src/app/queries/locationQueries.ts",
    "src/app/routes/builders.tsx",
    "src/core/index.ts",
    "src/core/shared/constants/cities.ts",
  ],
  // An exception for now (2026-11-11): the router devtools are listed and never imported. When the
  // dependency is dropped from package.json, this goes.
  ignoreDependencies: ["@tanstack/router-devtools"],
};
