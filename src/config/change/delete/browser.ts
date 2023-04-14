import chalk from "chalk";
import {
  getConfigData,
  getDefaultsData,
  getBrowsersData,
  getProfilesData,
} from "../../../data";
import { writeConfigFile } from "../../../helpers/config";
import { cliPrompts, getTitle } from "../../../helpers/prompts";
import { emptyLine, printInfo, printError } from "../../../helpers/print";

const { select, multiselect, toggle } = cliPrompts;

export default async function deleteBrowser(): Promise<boolean> {
  let yes = false;
  const browsers = await getBrowsersData();

  if (browsers.length === 0) {
    printError(`No browsers currently exist in the config`);
    return false;
  }

  const browserNames = browsers.map((browser) =>
    typeof browser === "string" ? browser : browser.name
  );

  const listToDelete = await multiselect(
    browserNames,
    "Select all browsers you want to delete.\n"
  );

  if (listToDelete == null) {
    return false;
  }

  emptyLine();
  yes = await toggle("Are you sure?\n", true);

  if (!yes) {
    return false;
  }

  const profiles = await getProfilesData();
  let defaults = await getDefaultsData();
  const currentDefaultBrowser = defaults.browser;

  // deleting a default browser
  if (
    currentDefaultBrowser != null &&
    listToDelete.includes(currentDefaultBrowser)
  ) {
    emptyLine();

    yes = await toggle(
      `${getTitle(currentDefaultBrowser)} is the ${chalk.yellow(
        "default browser"
      )}. Delete it?\n`,
      true
    );

    if (!yes) {
      // remove current default browser from the list of browsers to delete
      const index = listToDelete.findIndex(
        (browser) => browser === currentDefaultBrowser
      );

      if (index >= 0) {
        listToDelete.splice(index, 1);
      }
    } else {
      // delete browser from profiles config
      if (profiles[currentDefaultBrowser] != null) {
        delete profiles[currentDefaultBrowser];
      }

      // get the new default browser
      const remainingBrowserNames = browserNames.filter(
        (browser) => !listToDelete.includes(browser)
      );

      let newDefaultBrowser: string | undefined = remainingBrowserNames[0];
      emptyLine();

      // re-assign a default browser automatically
      if (remainingBrowserNames.length === 1) {
        printInfo(`${getTitle(newDefaultBrowser)} is the new default browser.`);
      }
      // choose a new default browser
      else if (remainingBrowserNames.length > 1) {
        newDefaultBrowser = await select(
          remainingBrowserNames,
          `What should be the ${chalk.italic.cyan("new")} ${chalk.yellow(
            "default browser"
          )}?\n`
        );
      }

      if (newDefaultBrowser != null) {
        defaults = {
          ...defaults,
          browser: newDefaultBrowser,
        };

        delete defaults.profile?.[currentDefaultBrowser];

        // set the default profile for the new default browser
        if (defaults.profile?.[newDefaultBrowser] == null) {
          const browserProfiles = profiles[newDefaultBrowser] ?? {};
          const profileNames = Object.keys(browserProfiles);

          if (profileNames.length === 1) {
            defaults = {
              ...defaults,
              profile: {
                ...defaults.profile,
                [newDefaultBrowser]: profileNames[0],
              },
            };
          } else if (profileNames.length > 1) {
            emptyLine();
            const defaultProfile = await select(
              profileNames,
              `What should the ${chalk.yellow(
                "default profile"
              )} for ${getTitle(newDefaultBrowser)}\n`,
              false
            );

            if (defaultProfile == null) {
              emptyLine();
              printError(
                "Default profile must be selected for the new default browser"
              );
              return false;
            }

            defaults = {
              ...defaults,
              profile: {
                ...defaults.profile,
                [newDefaultBrowser]: defaultProfile,
              },
            };
          }
        }
      }
    }

    // update config
    if (listToDelete.length > 0) {
      const config = await getConfigData();
      const remainingBrowsers = browsers.filter(
        (browser) =>
          !listToDelete.includes(
            typeof browser === "string" ? browser : browser.name
          )
      );

      writeConfigFile({
        ...config,
        defaults,
        browsers: remainingBrowsers,
        profiles,
      });

      return true;
    }
  }

  return false;
}
