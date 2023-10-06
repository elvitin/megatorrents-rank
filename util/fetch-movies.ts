export function fetchMovies(page: number) {
  return fetch(
    `https://megatorrents.com.br/baixar-filmes-utorrent/page/${page}`
  );
}
