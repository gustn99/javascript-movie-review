import { Movie } from "../../apis/movie/api";

export class Banner {
  #root: HTMLElement | null;
  #element: HTMLElement | null = null;

  constructor(root: HTMLElement | null) {
    this.#root = root;
  }

  render(movie: Movie) {
    if (!this.#root) return;

    const imageUrl = `${import.meta.env.VITE_TMDB_IMAGE_BASE_URL}/w1280${movie.backdrop_path}`;

    this.#root.innerHTML = `
      <div id="background-container" class="background-container" style="background-image: url(${imageUrl})">
        <div aria-hidden="true" class="overlay"></div>
        <div class="top-rated-container">
          <div class="top-rated-movie">
            <div class="rate">
              <img class="star" src="./images/star_empty.png"/>
              <span class="rate-value">${movie.vote_average}</span>
            </div>
            <h3 class="title">${movie.title}</h3>
            <button class="primary detail">자세히 보기</button>
          </div>
        </div>
      </div>
    `;
    this.#element = this.#root.querySelector("#background-container");
  }

  show() {
    this.#element?.classList.remove("hidden");
  }

  hide() {
    this.#element?.classList.add("hidden");
  }
}
