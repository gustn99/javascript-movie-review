import { handleMovieSearch } from "./dom/eventHandler/handleMovieSearch";
import {
  handleMainSeeMore,
  handleSearchSeeMore,
} from "./dom/eventHandler/handleSeeMore";
import { renderLoadingUI } from "./dom/render/renderLoadingUI.ts";
import { Main } from "./dom/compositions/Main";
import { renderSearchUI } from "./dom/render/renderSearchUI";

const logo = document.getElementById("logo");
const searchInput = document.getElementById(
  "search-input",
) as HTMLInputElement | null;
const searchButton = document.getElementById("search-button");

if (logo) {
  logo.addEventListener("click", () => {
    window.location.href = import.meta.env.BASE_URL;
  });
}

if (searchInput && searchButton) {
  searchButton.addEventListener("click", () =>
    handleMovieSearch(searchInput.value),
  );

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleMovieSearch(searchInput.value);
  });
}

const main = new Main(
  document.getElementById("main-root"),
  document.getElementById("banner-root"),
);

// Main 내부에서 See More 버튼에 대한 리스너를 설정하기 위해 이벤트를 위임하거나 Main에 전달할 수 있습니다.
// 여기서는 간단히 Main 인스턴스가 생성된 후 See More 버튼을 찾아 리스너를 추가하겠습니다.
document
  .getElementById("main-see-more-button")
  ?.addEventListener("click", () => {
    handleMainSeeMore();
  });

// Search UI도 클래스형으로 전환될 수 있지만, 현재는 기존 handleSearchSeeMore를 유지합니다.
document
  .getElementById("search-see-more-button")
  ?.addEventListener("click", () => {
    if (searchInput) handleSearchSeeMore(searchInput.value);
  });

const render = async () => {
  renderLoadingUI();

  const url = new URL(window.location.href);
  const params = url.searchParams;
  const keyword = params.get("keyword");
  if (keyword) {
    await renderSearchUI(keyword);
  } else {
    await main.render();
  }
};

await render();
