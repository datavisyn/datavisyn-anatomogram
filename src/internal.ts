/**
 * Created by sam on 22.01.2017.
 */


export function randomPrefix() {
  return `r${Math.random().toString(36).slice(-8)}_`;
}

export function patchIds(svg: string, prefix: string) {
  // prepend the given prefix on all ids
  return svg.replace(/id="(.*)"/gm, `id="${prefix}$1"`);
}
