const { withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

function withPodfileDeploymentTarget(config, { deploymentTarget } = {}) {
  if (!deploymentTarget) {
    throw new Error(
      "withPodfileDeploymentTarget requires a deploymentTarget option"
    );
  }

  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const podfilePath = path.join(
        config.modRequest.platformProjectRoot,
        "Podfile"
      );
      let contents = fs.readFileSync(podfilePath, "utf8");

      const snippet = [
        "",
        "    # Force minimum deployment target on every pod target",
        "    installer.pods_project.targets.each do |target|",
        "      target.build_configurations.each do |bc|",
        `        if bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < ${deploymentTarget}`,
        `          bc.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '${deploymentTarget}'`,
        "        end",
        "      end",
        "    end",
      ].join("\n");

      // Insert right after "post_install do |installer|"
      contents = contents.replace(
        /(post_install do \|installer\|)/,
        `$1${snippet}`
      );

      fs.writeFileSync(podfilePath, contents);
      return config;
    },
  ]);
}

module.exports = withPodfileDeploymentTarget;
