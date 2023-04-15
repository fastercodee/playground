/* eslint-disable camelcase */
import { defineStore } from "pinia";
import { post } from "src/boot/axios";
import type { SketchController } from "src/types/api/Controller/SketchController";

function exists(path: string): Promise<boolean> {
  return Filesystem.stat({
    path,
    directory: Directory.External,
  }).then(() => true).catch(() => false)
}

async function actionFirstOpenSketch(sketch_uid: number) {
  // download first sketch fullied

  const res = await post<SketchController["fetch"]>("/fetch", {
    uid: sketch_uid,
  })

  // not exists yet
  await Filesystem.mkdir({
    path: `home/${sketch_uid}`,
    directory: Directory.External,
    recursive: true,
  })

}

export const useSketchStore = defineStore("sketch", () => {
  async function fetch(sketch_uid: number) {
    if (await exists(`home/${sketch_uid}`)) {
      // exists already
      // New user opens sketch for the first time
    } else {
      actionFirstOpenSketch(sketch_uid)
    }
  }
})
