import { HTMLDocument } from 'https://deno.land/x/deno_dom@v0.1.40/deno-dom-wasm-noinit.ts';

type MagnetLinks = {
  ptBRlink?: string;
  enUSlink?: string;
  doubleAudioLink?: string;
};

export function extractMagnetLinks(dom: HTMLDocument): MagnetLinks | null {
  const magnetLinks: MagnetLinks = {};

  // dubbed
  // subtitled
  // dual audio

  const dubbed = dom?.querySelector('.button.dublado a')?.getAttribute('href');
  const dualAudio = dom?.querySelector('.button.dual a')?.getAttribute('href');
  const subtitled = dom
    ?.querySelector('.button.legendado a')
    ?.getAttribute('href');

  if (dubbed) {
    magnetLinks.ptBRlink = dubbed;
  }

  if (dualAudio) {
    magnetLinks.doubleAudioLink = dualAudio;
  }

  if (subtitled) {
    magnetLinks.enUSlink = subtitled;
  }
  // console.log('links: ', magnetLinks);
  return Object.keys(magnetLinks).length === 0 ? null : magnetLinks;
}
