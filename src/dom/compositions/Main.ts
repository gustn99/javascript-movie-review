import { getPopularMovies, Movie } from "../../apis/movie/api";
import TMDBError from "../../TMDBError";
import { Banner } from "../components/Banner";
import { ThumbnailList } from "../components/ThumbnailList";

export class Main {
  #root: HTMLElement | null;
  #banner: Banner;
  #thumbnailList: ThumbnailList | null = null;

  #errorContainer: HTMLElement | null = null;
  #emptyContainer: HTMLElement | null = null;
  #errorMessageContent: HTMLParagraphElement | null = null;
  #mainSeeMoreButton: HTMLElement | null = null;

  #isLastPage: boolean = true;
  #movies: Movie[] = [];
  #errorMessage: string = "";

  constructor(root: HTMLElement | null, bannerRoot: HTMLElement | null) {
    this.#root = root;
    this.#banner = new Banner(bannerRoot);
    this.#initTemplate();
  }

  async render() {
    this.#prepareRender();

    try {
      const popularMovies = await getPopularMovies({ language: "ko-KR" });
      this.#isLastPage = popularMovies.page === popularMovies.total_pages;
      this.#movies = popularMovies.results;

      if (this.#movies.length > 0) {
        this.#banner.render(this.#movies[0]);
        this.#thumbnailList?.render(this.#movies);
        this.#showContent();
      } else {
        this.#showEmpty();
      }
    } catch (error) {
      this.#handleError(error);
    }
  }

  show() {
    this.#banner.show();
    this.#thumbnailList?.show();
    if (this.#movies.length > 0 && !this.#isLastPage) {
      this.#mainSeeMoreButton?.classList.remove("hidden");
    }
  }

  hide() {
    this.#banner.hide();
    this.#thumbnailList?.hide();
    this.#mainSeeMoreButton?.classList.add("hidden");
    this.#errorContainer?.classList.add("hidden");
    this.#emptyContainer?.classList.add("hidden");
  }

  #initTemplate() {
    if (!this.#root) return;

    this.#root.innerHTML = `
      <section id="result-section" class="result-section">
        <h2 class="sub-title">지금 인기 있는 영화</h2>
        <div id="main-thumbnail-list-root"></div>
        
        <div class="unexpected-container hidden" id="empty-container">
          <img alt="" src="./images/으아아행성이.png"/>
          <p>검색 결과가 없습니다.</p>
        </div>

        <div class="unexpected-container hidden" id="error-container">
          <img alt="" src="./images/으아아행성이.png"/>
          <p>🚨 에러 발생 🚨</p>
          <button id="retry-button">재시도</button>
        </div>

        <button class="see-more-button hidden" id="main-see-more-button">
          더 보기
        </button>
      </section>
    `;

    this.#thumbnailList = new ThumbnailList(
      this.#root.querySelector("#main-thumbnail-list-root"),
      "main-thumbnail-list",
    );
    this.#errorContainer = this.#root.querySelector("#error-container");
    this.#emptyContainer = this.#root.querySelector("#empty-container");
    this.#errorMessageContent = this.#root.querySelector("#error-container p");
    this.#mainSeeMoreButton = this.#root.querySelector("#main-see-more-button");

    this.#root
      .querySelector("#retry-button")
      ?.addEventListener("click", () => this.render());
  }

  #prepareRender() {
    this.#errorMessage = "";
    this.#movies = [];

    this.#thumbnailList?.loading();
    this.#errorContainer?.classList.add("hidden");
    this.#emptyContainer?.classList.add("hidden");
    this.#mainSeeMoreButton?.classList.add("hidden");

    this.#banner.hide();
  }

  #showContent() {
    this.#banner.show();
    this.#thumbnailList?.show();
    if (!this.#isLastPage) {
      this.#mainSeeMoreButton?.classList.remove("hidden");
    }
  }

  #showEmpty() {
    this.#emptyContainer?.classList.remove("hidden");
  }

  #handleError(error: unknown) {
    this.#errorMessage = "🚨알 수 없는 에러가 발생했습니다.🚨";
    if (error instanceof TMDBError) {
      this.#errorMessage =
        "🚨TMDB에서 데이터를 불러오는 중 에러가 발생했습니다🚨";
    }

    if (this.#errorContainer && this.#errorMessageContent) {
      this.#errorMessageContent.innerText = this.#errorMessage;
      this.#errorContainer.classList.remove("hidden");
    }
  }
}
