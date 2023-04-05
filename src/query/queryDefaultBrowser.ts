/**
 * opens URL in default browser specified in config file or by OS
 */

import open from "open";
import { getArgs } from "../command";
import { getDefaultsData } from "../data";
import { getBrowserArguments } from "../helpers/browser";

const args = getArgs();

export default async function queryDefaultBrowser(url: string): Promise<void> {
  const protocol = `http${args.secure ? "s" : ""}://`;
  const fullUrl = /^http/is.test(url) ? url : `${protocol}${url}`;
  const defaults = await getDefaultsData();

  if (defaults.browser) {
    const browserArguments = getBrowserArguments();
    await open(fullUrl, {
      app: { name: defaults.browser, arguments: browserArguments },
    });
  } else {
    await open(fullUrl);
  }
}
