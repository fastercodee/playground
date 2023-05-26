export function parseGitIgnore(gitignore: string): string[] {
  const lines = gitignore.split("\n")
  const excludes = []

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === "" || trimmed.startsWith("#")) {
      continue
    }

    // eslint-disable-next-line functional/no-let
    let exclude = trimmed

    if (exclude.startsWith("/")) {
      exclude = exclude.slice(1)
    }

    if (exclude.endsWith("/")) {
      exclude = `${exclude}*`
    }

    if (exclude.includes("/")) {
      exclude = `${exclude}/**`
    }

    excludes.push(exclude)
  }

  return excludes
}
