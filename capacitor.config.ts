import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.larpsim.wallet",
  appName: "Coinbase",
  webDir: "out",
  ios: {
    contentInset: "never",
    backgroundColor: "#000000",
    preferredContentMode: "mobile",
    scheme: "LarpSim",
  },
};

export default config;
