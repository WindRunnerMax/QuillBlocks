export type { EventContext } from "laser-utils/dist/es/event-bus";
export { EventBus } from "laser-utils/dist/es/event-bus";

export interface EventBusMap {}

declare module "laser-utils/dist/es/event-bus" {
  interface EventBusType extends EventBusMap {}
}
