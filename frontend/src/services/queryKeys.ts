export const queryKeys = {
  admin: {
    all: ["admin"] as const,
    stats: () => ["admin", "stats"] as const,
    comments: {
      all: ["admin", "comments"] as const,
      list: (params: Record<string, any>) =>
        ["admin", "comments", "list", params] as const,
      stats: () => ["admin", "comments", "stats"] as const,
    },
    reports: {
      all: ["admin", "reports"] as const,
      stats: () => ["admin", "reports"] as const,
    },
    analytics: () => ["admin", "analytics"] as const,
  },
  idioms: {
    all: ["idioms"] as const,
    details: (query: string) => ["idiom", "details", query] as const,
    byId: (id: string) => ["idiom", "id", id] as const,
    stored: {
      all: ["idioms", "stored"] as const,
      list: (params: Record<string, any>) =>
        ["idioms", "stored", params] as const,
    },
    suggestions: (params: Record<string, any>) =>
      ["idioms", "suggestions", params] as const,
    daily: () => ["idioms", "daily"] as const,
  },
  user: {
    all: ["user"] as const,
    profile: () => ["user", "profile"] as const,
    history: {
      all: ["user", "history"] as const,
      list: (params: Record<string, any>) =>
        ["user", "history", params] as const,
    },
    reports: {
      all: ["user", "reports"] as const,
      list: (params: Record<string, any>) =>
        ["user", "reports", params] as const,
    },
    saved: {
      all: ["user", "saved"] as const,
      list: (params: Record<string, any>) => ["user", "saved", params] as const,
    },
    srs: {
      all: ["user", "srs"] as const,
      data: () => ["user", "srs", "data"] as const,
    },
  },
};
