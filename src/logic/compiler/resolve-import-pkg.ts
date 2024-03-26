interface PackageJSON {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
}

export function resolveImportPkg(name: string, pkgs: PackageJSON) {
  // deps
  const indexSlashPath = name.startsWith("@") ? -1 : name.indexOf("/")
  const pkgName = indexSlashPath > -1 ? name.slice(0, indexSlashPath) : name

  const allDeps = { ...pkgs.dependencies }
  delete allDeps[pkgName]

  const deps =
    pkgs.dependencies &&
    Object.entries(pkgs.dependencies)
      .map((item) => `${item[0]}@${item[1]}`)
      .join(",")

  return `https://esm.run/${`${pkgName}@${
    pkgs.dependencies?.[pkgName] ?? "latest"
  }${
    indexSlashPath === -1 || indexSlashPath >= name.length
      ? ""
      : name.slice(indexSlashPath)
  }`}?dev${deps ? `&deps=${deps}` : ""}`
}
// https://esm.sh/preact/hooks@latest?dev&deps=preact@^10.13.1
