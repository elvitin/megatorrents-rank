# Megatorrents Rank

## Descrição

Um projeto desenvolvido em [Deno](https://deno.com/) com o único objetivo de obter os filmes melhores rankeados no site [Megatorrents](https://megatorrents.com.br/) para download.



#### Requisitos

certifique-se de ter o deno instalado com `deno --version`. se não estiver, recomendo a instalação pelo [asdf ou docker](https://docs.deno.com/runtime/manual/getting_started/installation).

## Como usar

Existe três principais arquivos que podem ser executados:
- `sqlite-migration.ts` - Cria a tabela `movies` no banco de dados. **Execute esse antes de qualquer outro**.

- `get-all-movies.ts`: Obtém todos os filmes do site e salva o link da página princípal na tabela `movies`.

- `update-all-movies.ts`: Atualiza os filmes que já estão no banco de dados com o restante das informações. _Observe que essa etapa pode gerar algums erros `Error on fetch movie...` é normal._

- `get-better-rankings.ts`: Gera um JSON com os os filmes com as melhores notas IMDb.

Você pode executar qualquer um desses arquivos com o comando `deno run -A <nome-do-arquivo>`. O parâmetro `-A` é necessário para dar todas as permissões.

## Exemplo de uso

```bash
deno run -A sqlite-migration.ts
deno run -A get-all-movies.ts
deno run -A update-all-movies.ts
deno run -A get-better-rankings.ts
```

#### Opcionalmente use os scripts

```bash
deno task migrateSqlite
deno task getAllMovies
deno task updateAllMovies
deno task getBestMovies
```

