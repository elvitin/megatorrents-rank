import {
  DOMParser,
  initParser
} from 'https://deno.land/x/deno_dom@v0.1.40/deno-dom-wasm-noinit.ts';
import { DB } from 'https://deno.land/x/sqlite@v3.8/mod.ts';

(async () => {
  await initParser();
  const db = new DB('movies.db');
  const domParser = new DOMParser();
  let page = 0;
  let response = await fetch(
    `https://megatorrents.com.br/baixar-filmes-utorrent/page/${page}`
  );

  while (response.status !== 404) {
    const html = await response.text();
    const dom = domParser.parseFromString(html, 'text/html');

    const hrefList = dom
      ?.querySelector('.post_list')
      ?.querySelectorAll('.post .inner .title a');

    if (!hrefList) {
      throw new Error('hrefList is undefined or null');
    }

    hrefList.forEach((aTag: any) => {
      const link: string = aTag.getAttribute('href');
      console.log('inserting link: ', link);
      const query = db.prepareQuery(
        'INSERT OR IGNORE INTO movies (page_url) VALUES (?)'
      );
      query.execute([link]);
      query.finalize();
    });

    response = await fetch(
      `https://megatorrents.com.br/baixar-filmes-utorrent/page/${++page}`
    );
  }
  // count quanties of records from movies_url
  const count = db.query('SELECT COUNT(*) FROM movies');
  console.log(`Total of records: `, count[0][0]);
  db.close();
})();
