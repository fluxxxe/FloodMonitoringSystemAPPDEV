// PC‑compatible wrapper for the mobile‑style Notifications screen
// Re‑uses the existing web Notifications component to avoid duplication.

import { Notifications as WebNotifications } from "./Notifications";

export const NotificationsMobileWeb = WebNotifications;
export default WebNotifications;
