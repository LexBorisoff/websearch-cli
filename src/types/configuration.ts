export type ConfigCommand = "add" | "update" | "delete";
export type ConfigType = "default" | "browser" | "profile";

export interface PromptAnswer<T> {
  answer?: T;
}

export interface PromptChoice {
  title: string;
  value: string;
}