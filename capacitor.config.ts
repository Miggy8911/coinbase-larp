import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.larpsim.wallet",
  appName: "CB LARP",
  webDir: "out",
  ios: {
    contentInset: "automatic",
    backgroundColor: "#000000",
    preferredContentMode: "mobile",
    scheme: "LarpSim",
  },
};

export default config;
