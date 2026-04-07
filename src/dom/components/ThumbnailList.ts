import { Movie } from "../../apis/movie/api";

export class ThumbnailList {
  #root: HTMLElement | null;
  #element: HTMLElement | null = null;
  #id: string;

  constructor(root: HTMLElement | null, id: string) {
    this.#root = root;
    this.#id = id;
  }

  // TODO: loading 메서드 추가

  render(movies: Movie[]) {
    if (!this.#root) return;

    if (!this.#element) {
      this.#root.innerHTML = `<ul class="thumbnail-list hidden" id="${this.#id}"></ul>`;
      this.#element = this.#root.querySelector(`#${this.#id}`);
    }

    if (!this.#element) return;

    const movieTemplates = movies
      .map((movie) => this.#createMovieTemplate(movie))
      .join("");

    this.#element.insertAdjacentHTML("beforeend", movieTemplates);
  }

  clear() {
    if (this.#element) {
      this.#element.innerHTML = "";
    }
  }

  show() {
    this.#element?.classList.remove("hidden");
  }

  hide() {
    this.#element?.classList.add("hidden");
  }

  #createMovieTemplate(movie: Movie) {
    const imageUrl = `${import.meta.env.VITE_TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`;

    return `
      <li id="movie-${movie.id}">
        <div class="item">
          <img
            class="thumbnail"
            src="${imageUrl}"
            alt="${movie.title} 포스터"
            loading="lazy"
          />
          <div class="item-desc">
            <p class="rate">
              <img src="./images/star_empty.png" alt="" class="star" />
              <span>${movie.vote_average}</span>
            </p>
            <strong>${movie.title}</strong>
          </div>
        </div>
      </li>
    `;
  }
}
