import type { EventMap } from "./types";
export { EventBus } from "block-kit-utils/dist/es/event-bus";

declare module "block-kit-utils/dist/es/event-bus" {
  interface EventBusType extends EventMap {}
}
