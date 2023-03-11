export function checkErrorFileName(
  fileName: string,
  siblings: string[],
  skipEmpty: boolean
) {
  if (fileName === "") {
    return skipEmpty
      ? undefined
      : {
          type: "error",
          message: "A file or folder name must be provided."
        }
  }

  if (siblings.includes(fileName)) {
    return {
      type: "error",
      message: `
        <span>
          File or folder <span class="font-bold">${fileName}</span> already
          exists at this location.
        </span>
      `
    }
  }

  if (fileName === "." || fileName === "..") {
    return {
      type: "error",
      message: `<span>
          The name <span class="font-bold">${fileName}</span> is not a valid
          as file or directory. Please select a different file name.
        </span>`
    }
  }

  if (fileName[0] === "/" || fileName[0] === "\\") {
    return {
      type: "error",
      message: "A file or folder name cannot start with a slash."
    }
  }

  if (fileName[0] === " ") {
    return {
      type: "warn",
      message:
        "Leading or trailing whitespace detected in a file or folder name."
    }
  }

  if (/\\|\/|:|\*|\?|'|"\|/.test(fileName)) {
    return {
      type: "error",
      message: `<span>
          The name <span class="font-bold">${fileName}</span> is not a valid
          as file or folder name. Please select a different file name.
        </span>`
    }
  }
}
