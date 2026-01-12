export const defineExtensionMessaging = () => ({
  sendMessage: () => Promise.resolve({ isOk: () => true }),
});
