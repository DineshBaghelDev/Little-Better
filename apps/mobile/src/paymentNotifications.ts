import { NativeModules, Platform } from "react-native";

export type PaymentNotification = {
  key: string;
  packageName: string;
  postedAt: number;
  text: string;
};

type PaymentNotificationsModule = {
  dismiss: (key: string) => Promise<void>;
  getPending: (ownerId: string) => Promise<PaymentNotification[]>;
  isAccessEnabled: () => Promise<boolean>;
  openSettings: () => void;
  setOwner: (ownerId: string | null) => void;
};

const nativeModule = NativeModules.PaymentNotifications as PaymentNotificationsModule | undefined;

export const paymentNotificationsSupported = Platform.OS === "android" && nativeModule !== undefined;

export const paymentNotifications = nativeModule;
