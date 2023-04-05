import chalk from "chalk";
import defaultEngine from "./engine";
import defaultBrowser from "./browser";
import defaultProfile from "./profile";
import { cliPrompts } from "../../../helpers/prompts";
import { emptyLine } from "../../../helpers/print";
import { ConfigType } from "../../../types/config.types";

const { select } = cliPrompts;

async function defaultType(configType?: ConfigType): Promise<boolean> {
  if (configType === "engine") {
    return defaultEngine();
  } else if (configType === "browser") {
    return defaultBrowser();
  } else if (configType === "profile") {
    return defaultProfile();
  }

  return false;
}

export default async function defaultConfig(
  configType?: ConfigType
): Promise<boolean> {
  if (configType != null) {
    return defaultType(configType);
  }

  const configTypes: ConfigType[] = ["browser", "profile", "engine"];
  const answer = await select<ConfigType>(
    configTypes,
    `What ${chalk.yellow("config")} do you want to update?\n`
  );

  emptyLine();
  return defaultType(answer);
}
