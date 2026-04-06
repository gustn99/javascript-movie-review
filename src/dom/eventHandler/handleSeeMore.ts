import { getPopularMovies } from "../../apis/movie/api";
import { getSearchedMovies } from "../../apis/search/api";
import { ThumbnailList } from "../components/ThumbnailList";

export const handleMainSeeMore = async () => {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const prevPage = Number(params.get("page") || 1);

  params.set("page", String(prevPage + 1));
  url.search = params.toString();
  window.history.pushState({}, "", url.toString());

  const movies = await getPopularMovies({
    page: prevPage + 1,
    language: "ko-KR",
  });

  const thumbnailList = new ThumbnailList(
    document.getElementById("main-thumbnail-list-root"),
    "main-thumbnail-list",
  );
  thumbnailList.render(movies.results);
};

export const handleSearchSeeMore = async (keyword: string) => {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const prevPage = Number(params.get("page") || 1);

  params.set("page", String(prevPage + 1));
  url.search = params.toString();
  window.history.pushState({}, "", url.toString());

  const movies = await getSearchedMovies({
    query: keyword,
    page: prevPage + 1,
    language: "ko-KR",
  });

  const thumbnailList = new ThumbnailList(
    document.getElementById("search-thumbnail-list-root"),
    "search-thumbnail-list",
  );
  thumbnailList.render(movies.results);
};
