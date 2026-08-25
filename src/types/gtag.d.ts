declare global {
  interface Window {
    gtag: (
      type: "event" | "config" | "js" | "set",
      eventName: string,
      eventParams?: Record<string, any>
    ) => void;
  }
}

export {};
