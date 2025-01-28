declare global {
  interface Window {
    Selection: typeof Selection["constructor"];
    DataTransfer: typeof DataTransfer["constructor"];
    Node: typeof Node["constructor"];
  }
}

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
  }
}
