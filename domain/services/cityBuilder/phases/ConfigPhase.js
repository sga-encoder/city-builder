import { setCityConfig } from "../../../config/runtimeConfig.js";

export class ConfigPhase {
  static async execute({ loadConfig }) {
    const data = await loadConfig();
    setCityConfig(data);
    return { data };
  }
}
