import * as semver from 'semver';

import type {
  DependencyConstraint,
  SemverVersionConstraint,
} from '../types/DependencyConstraint';

const BASE_SATISFIES_OPTIONS: semver.RangeOptions = {
  includePrerelease: true,
};

function loadDependencyPackageJson(
  packageName: string,
): { version: string } | null {
  try {
    return require(`${packageName}/package.json`) as { version: string };
  } catch (error) {
    // Error caused because the package isn't present?
    if (
      error != null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'MODULE_NOT_FOUND'
    ) {
      return null;
    }

    throw error;
  }
}

function satisfiesDependencyConstraint(
  packageName: string,
  constraintIn: DependencyConstraint[string],
): boolean {
  const packageJson = loadDependencyPackageJson(packageName);
  if (packageJson == null) {
    return false;
  }

  const constraint: SemverVersionConstraint =
    typeof constraintIn === 'string'
      ? {
          range: `>=${constraintIn}`,
        }
      : constraintIn;

  return semver.satisfies(
    packageJson.version,
    constraint.range,
    typeof constraint.options === 'object'
      ? { ...BASE_SATISFIES_OPTIONS, ...constraint.options }
      : constraint.options,
  );
}

export function satisfiesAllDependencyConstraints(
  dependencyConstraints: DependencyConstraint | undefined,
): boolean {
  if (dependencyConstraints == null) {
    return true;
  }

  for (const [packageName, constraint] of Object.entries(
    dependencyConstraints,
  )) {
    if (!satisfiesDependencyConstraint(packageName, constraint)) {
      return false;
    }
  }

  return true;
}
