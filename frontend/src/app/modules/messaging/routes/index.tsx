import { lazy } from "react";
import type { ModuleRoute } from "@app/routes/types";

export const messagingRoutes: ModuleRoute[] = [
  {
    path: "/mesaje",
    component: lazy(() =>
      import("../pages/ConversationsPage").then((m) => ({
        default: m.ConversationsPage,
      })),
    ),
    children: [
      {
        path: ":conversationId",
        component: lazy(() =>
          import("../pages/ConversationPage").then((m) => ({
            default: m.ConversationPage,
          })),
        ),
      },
    ],
  },
];
