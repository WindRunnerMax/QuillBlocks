export type CMDPayload = {
  value: string;
  [key: string]: unknown;
};

export type CMDFunc = (data: CMDPayload) => void | Promise<void>;

export type EditorCMD = Record<string, CMDFunc>;
