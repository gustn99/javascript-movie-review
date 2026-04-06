import { getPopularMovies, Movie } from "../../apis/movie/api";
import TMDBError from "../../TMDBError";
import { Banner } from "../components/Banner";
import { renderResultSectionContent } from "./renderResultSectionContent";
import { ThumbnailList } from "../components/ThumbnailList";

export const renderMainUI = async () => {
  let isError = false;
  let isLastPage = true;
  let movies: Movie[] = [];
  let errorMessage = "";

  try {
    const popularMovies = await getPopularMovies({ language: "ko-KR" });
    isLastPage = popularMovies.page === popularMovies.total_pages;
    movies = popularMovies.results;

    const banner = new Banner(document.getElementById("banner-root"));
    banner.render(movies[0]);

    const thumbnailList = new ThumbnailList(
      document.getElementById("main-thumbnail-list-root"),
      "main-thumbnail-list",
    );
    thumbnailList.render(movies);
  } catch (error) {
    isError = true;
    errorMessage = "🚨알 수 없는 에러가 발생했습니다.🚨";
    if (error instanceof TMDBError) {
      errorMessage = "🚨TMDB에서 데이터를 불러오는 중 에러가 발생했습니다🚨";
    }
  } finally {
    renderResultSectionContent({
      isLoading: false,
      isError,
      isLastPage,
      errorMessage,
      movies,
    });
  }
};
