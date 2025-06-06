import { window } from "vscode";
import { pull } from "@intlayer/cli";
import { fetchDistantDictionaryKeys } from "@intlayer/chokidar";
import { findProjectRoot } from "./findProjectRoot";
import { getConfiguration } from "@intlayer/config";

export const pullCommand = async () => {
  const projectDir = findProjectRoot();

  if (!projectDir) {
    window.showErrorMessage("Could not find intlayer project root.");
    return;
  }

  window.showInformationMessage("Fetching dictionaries...");

  try {
    const configuration = getConfiguration({
      baseDir: projectDir,
    });
    const dictionariesKeys = await fetchDistantDictionaryKeys(configuration);

    if (!dictionariesKeys.length) {
      window.showWarningMessage("No dictionaries available.");
      return;
    }

    // Show a selection dialog with multiple choices
    const selectedDictionaries = await window.showQuickPick(
      dictionariesKeys.map((dict) => ({ label: dict, picked: false })), // Display dictionary names
      {
        canPickMany: true,
        placeHolder: "Select dictionaries to pull",
      }
    );

    if (!selectedDictionaries || selectedDictionaries.length === 0) {
      window.showWarningMessage("No dictionary selected.");
      return;
    }

    window.showInformationMessage("Pulling...");

    await pull({
      configOptions: {
        baseDir: projectDir,
      },
      dictionaries: selectedDictionaries.map((d) => d.label),
    });

    window.showInformationMessage("Intlayer pull completed successfully!");
  } catch (error) {
    window.showErrorMessage(
      `Intlayer pull failed: ${(error as Error).message}`
    );
  }
};
