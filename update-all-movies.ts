import {
  DOMParser,
  initParser
} from 'https://deno.land/x/deno_dom@v0.1.40/deno-dom-wasm-noinit.ts';
import { DB } from 'https://deno.land/x/sqlite@v3.8/mod.ts';
import { extractMagnetLinks } from './get-magnet-links.ts';
import { fetchMovie } from './util/fetch-movie.ts';
import { LoadingAnimation } from './util/loading-animation.ts';

function extractNumber(pattern: RegExp, target: string): number {
  const match = target.match(pattern);

  // Verifique se houve correspondência e extraia o valor
  if (match) {
    const value = match[1].replace(',', '.'); // Substitua ',' por '.' se necessário
    return parseFloat(value); // Converta para um valor numérico
  }
  return -1;
}

function extractString(pattern: RegExp, target: string): string {
  const match = target.match(pattern);
  if (match) return match[1];
  return '#';
}

const titlePattern = /T(?:í|i)tulo Traduzido:\s*(.+)/;
const oficialTitlePattern = /T(?:í|i)tulo Original:\s*(.+)/;
const IMDbPattern = /IMDb:\s*([\d,\.]+)/;
const audioQualityPattern = /Qualidade (?:de|do) Áudio:\s*(\d+(?:,\d+|\.\d+)?)/;
const videoQualityPattern = /Qualidade (?:de|do) Vídeo:\s*(\d+(?:,\d+|\.\d+)?)/;
const qualidadeAudioVideo = /Qualidade Áudio e Vídeo:\s*(\d+(?:,\d+|\.\d+)?)/;
const domParser = new DOMParser();
const db = new DB('movies.db');

const loadingAnimation = new LoadingAnimation(`update...`);

(async () => {
  await initParser();

  const movies_links = db.query(
    'SELECT page_url FROM movies WHERE updated = FALSE ORDER BY id ASC'
  );

  for (const [link] of movies_links) {
    // console.log('...here>');
    let movie: Response;
    try {
      movie = await fetchMovie(link as string);
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message ===
          'Fetch failed: Maximum number of redirects (20) reached'
      ) {
        console.log(`Error on fetch movie: ${link} - ${error.message}`);
        continue;
      }
      throw error;
    }

    // console.log('<here...');
    if (movie.status !== 200) {
      throw new Error(`Invalid status code ${movie.status} for ${link}`);
    }

    const html = await movie.text();

    const dom = domParser.parseFromString(html, 'text/html');

    if (!dom) {
      console.log(`Invalid DOM ${link} - DOM text:${html}`);
      continue;
    }

    const domElement = dom.querySelector('.entry-content.cf');
    if (!domElement) {
      console.log(`Invalid DOM Element [${link}]`);
      continue;
    }

    const text = domElement?.textContent;
    if (!text) {
      console.log(`Invalid Text [${link}]`);
      continue;
    }

    const imdbScore = extractNumber(IMDbPattern, text as string);
    let audioQuality = extractNumber(audioQualityPattern, text as string);
    let videoQuality = extractNumber(videoQualityPattern, text as string);
    const title = extractString(titlePattern, text as string);
    const oficialTitle = extractString(oficialTitlePattern, text as string);

    if (videoQuality == -1 && audioQuality == -1) {
      const audioAndVideoQuality = extractNumber(
        qualidadeAudioVideo,
        text as string
      );
      audioQuality = videoQuality = audioAndVideoQuality;
    }

    const magnetLinks = extractMagnetLinks(dom);
    if (magnetLinks) {
      const { ptBRlink, enUSlink, doubleAudioLink } = magnetLinks;
      const query = db.prepareQuery(`
        UPDATE movies SET
          magnet_dubbed = ?,
          magnet_subtitled = ?,
          magnet_dual_audio = ?
        WHERE 
          page_url = ?
      `);
      query.execute([ptBRlink, enUSlink, doubleAudioLink, link as string]);
      query.finalize();
    }

    // update all movies fields with the same page_url
    const query = db.prepareQuery(`
      UPDATE movies SET
        title = ?,
        oficial_title = ?,
        imdbScore = ?,
        audio_quality = ?,
        video_quality = ?,
        updated = TRUE
      WHERE 
        page_url = ?
    `);

    // loadingAnimation.printNextTick(`update movie ${oficialTitle}`);
    console.log(`update movie ${oficialTitle}...`);
    query.execute([
      title,
      oficialTitle,
      imdbScore,
      audioQuality,
      videoQuality,
      link as string
    ]);
    query.finalize();
  }

  db.close();
})();
