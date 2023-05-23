interface PackageJSON {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

export function resolveImportPkg(name: string, pkgs: PackageJSON) {
  // deps
  const allDeps = { ...pkgs.dependencies }
  delete allDeps[name]

  const deps =
    pkgs.dependencies &&
    Object.entries(pkgs.dependencies)
      .map((item) => `${item[0]}@${item[1]}`)
      .join(",")

  const version = pkgs.dependencies?.[name] ?? "latest"

  return `https://esm.sh/${name}@${version}?dev${deps ? `&deps=${deps}` : ""}`
}
