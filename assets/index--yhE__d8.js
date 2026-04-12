(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const getSearchParamsFromObject = (params) => {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === void 0) continue;
    searchParams.set(key, String(value));
  }
  return searchParams;
};
const fetcher = async (endpoint, options = {}) => {
  const defaultOptions = {
    method: "GET",
    ...options,
    headers: {
      accept: "application/json",
      ...options.headers
    }
  };
  try {
    const response = await fetch(endpoint, defaultOptions);
    if (response.ok) {
      const data = await response.json();
      return data;
    }
    const error = await response.json();
    throw error;
  } catch (error) {
    throw error;
  }
};
class TMDBError extends Error {
  code;
  success;
  constructor({ status_code, status_message, success }) {
    super(status_message);
    this.code = status_code;
    this.success = success;
  }
}
const isTmdbError = (error) => {
  return error instanceof Object && "status_code" in error && "status_message" in error && "success" in error;
};
const tmdbFetcher = async (endpoint, options = {}) => {
  const defaultOptions = {
    method: "GET",
    ...options,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNGRkYjcxNGQwMDdiMDEwZTc0ODU3MTNmZjFkMzQxMSIsIm5iZiI6MTcxNjQyNjM2Ny4yNjksInN1YiI6IjY2NGU5NjdmNzgxYTZhNWY4YTE4YWU0YSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.zKlCHh5ONeNvm78CyrI3apOlWqoHhebzzi5nl4wNd-Y"}`,
      ...options.headers
    }
  };
  try {
    const response = await fetcher(
      `${"https://api.themoviedb.org/3"}${endpoint}`,
      defaultOptions
    );
    return response;
  } catch (error) {
    if (isTmdbError(error)) {
      throw new TMDBError(error);
    }
    throw error;
  }
};
const getSearchedMovies = async (params = {}) => {
  const searchParams = getSearchParamsFromObject(params);
  return await tmdbFetcher(
    `/search/movie?${searchParams.toString()}`
  );
};
const getPopularMovies = async (params = {}) => {
  const searchParams = getSearchParamsFromObject(params);
  return await tmdbFetcher(
    `/movie/popular?${searchParams.toString()}`
  );
};
const getMovieDetail = async ({
  movieId,
  ...params
}) => {
  const searchParams = getSearchParamsFromObject(params);
  return await tmdbFetcher(
    `/movie/${movieId}?${searchParams.toString()}`
  );
};
const EMPTY_CONTAINER_ID = "empty-container";
let emptyContainer = null;
const createEmptyContainerTemplate = (message) => `
  <div id="${EMPTY_CONTAINER_ID}" class="unexpected-container">
    <img alt="" src="./images/으아아행성이.png"/>
    <p>${message}</p>
  </div>
`;
const renderEmptyContainer = (parent, message) => {
  if (emptyContainer) {
    emptyContainer.remove();
  }
  parent.insertAdjacentHTML("beforeend", createEmptyContainerTemplate(message));
  emptyContainer = document.getElementById(EMPTY_CONTAINER_ID);
};
const removeEmptyContainer = () => {
  emptyContainer?.remove();
  emptyContainer = null;
};
const ERROR_CONTAINER_ID = "error-container";
const RETRY_BUTTON_ID = "retry-button";
let errorContainer = null;
const createErrorContainerTemplate = (message) => `
  <div id="${ERROR_CONTAINER_ID}" class="unexpected-container">
    <img alt="" src="./images/으아아행성이.png"/>
    <p>${message}</p>
    <button id=${RETRY_BUTTON_ID}>재시도</button>
  </div>
`;
const renderErrorContainer = (parent, message) => {
  if (errorContainer) {
    errorContainer.remove();
  }
  parent.insertAdjacentHTML("beforeend", createErrorContainerTemplate(message));
  errorContainer = document.getElementById(ERROR_CONTAINER_ID);
  errorContainer?.querySelector(`#${RETRY_BUTTON_ID}`)?.addEventListener("click", () => {
    window.location.reload();
  });
};
const removeErrorContainer = () => {
  errorContainer?.remove();
  errorContainer = null;
};
const RATE_KEY = "rate";
const getRates = () => {
  return JSON.parse(localStorage.getItem(RATE_KEY) ?? "{}");
};
const getRate = async ({
  movieId
}) => {
  const rate = getRates()[movieId];
  return { rate: rate ?? null };
};
const createRate = async ({
  movieId,
  rate
}) => {
  const rates = getRates();
  localStorage.setItem(RATE_KEY, JSON.stringify({ ...rates, [movieId]: rate }));
};
const updateRate = async ({
  movieId,
  rate
}) => {
  const rates = getRates();
  localStorage.setItem(RATE_KEY, JSON.stringify({ ...rates, [movieId]: rate }));
};
const RATES = [
  {
    rate: 0,
    comment: "별점을 남겨주세요",
    score: 0
  },
  {
    rate: 1,
    comment: "최악이에요",
    score: 2
  },
  {
    rate: 2,
    comment: "별로예요",
    score: 4
  },
  {
    rate: 3,
    comment: "보통이에요",
    score: 6
  },
  {
    rate: 4,
    comment: "재미있어요",
    score: 8
  },
  {
    rate: 5,
    comment: "명작이에요",
    score: 10
  }
];
const createRateButtonTemplate = (type) => {
  return `
    <button>
      <img src="./images/star_${type}.png" alt="" class="star" />
    </button>
`;
};
const renderRateButtons = (parent, type, count = 1) => {
  const itemsHTML = Array.from({ length: count }).map(() => createRateButtonTemplate(type)).join("");
  parent.insertAdjacentHTML("beforeend", itemsHTML);
};
const MY_RATE_ID = "my-rate";
const RATE_BUTTON_CONTAINER_ID = "rate-button-container";
let myRateElement = null;
const createMyRateTemplate = (userRate) => {
  const rateConfig = RATES.find(({ rate }) => rate === userRate);
  return `
  <div class="my-rate" id="${MY_RATE_ID}">
    <h3>내 별점</h3>
    <div>
      <div class="rate-button-container" id="${RATE_BUTTON_CONTAINER_ID}"></div>
      <span class="comment">${rateConfig?.comment}</span>
      <span class="score">(${rateConfig?.score}/10)</span>
    </div>
`;
};
const renderMyRate = async (parent, movieId) => {
  if (myRateElement) {
    myRateElement.remove();
  }
  const response = await getRate({ movieId });
  const rate = response?.rate ?? 0;
  parent.insertAdjacentHTML("beforeend", createMyRateTemplate(rate));
  myRateElement = document.getElementById(MY_RATE_ID);
  const rateButtonContainer = document.getElementById(RATE_BUTTON_CONTAINER_ID);
  if (rateButtonContainer) {
    renderRateButtons(rateButtonContainer, "filled", rate);
    renderRateButtons(rateButtonContainer, "empty", 5 - rate);
  }
  myRateElement?.addEventListener("click", async (e) => {
    if (e.target instanceof HTMLElement) {
      const rateButtonContainer2 = document.getElementById(
        RATE_BUTTON_CONTAINER_ID
      );
      const clickedButton = e.target.closest("button");
      const buttonIndex = Array.from(rateButtonContainer2.children).findIndex(
        (element) => element === clickedButton
      );
      if (buttonIndex === -1) return;
      if (rate === 0) {
        await createRate({ movieId, rate: buttonIndex + 1 });
      } else {
        await updateRate({ movieId, rate: buttonIndex + 1 });
      }
      await renderMyRate(parent, movieId);
    }
  });
};
const MODAL_ID = "modal-dialog";
const MY_RATE_CONTAINER_ID = "my-rate-container";
let modalElement = null;
const createMovieModalTemplate = (movie) => `
  <dialog class="modal" id="${MODAL_ID}">
    <button class="close-modal" id="closeModal">
      <img src="./images/modal_button_close.png" alt="닫기" />
    </button>
    <div class="modal-container">
      <div class="modal-image">
        <img
          src="${"https://image.tmdb.org/t/p"}/w500${movie?.poster_path}"
          alt=""
        />
      </div>
      <div class="modal-description">
        <h2>${movie?.title ?? "제목을 불러올 수 없습니다."}</h2>
        <p class="category">
          ${(movie?.genres.map((genre) => genre.name).join(", ") ?? "장르를 불러올 수 없습니다.") || "장르 정보가 없습니다."}
        </p>
        <div class="modal-rate">
          평균
          <p class="rate">
            <img src="./images/star_filled.png" alt="별점" class="star" />
            <span>${movie?.vote_average ?? "0"}</span>
          </p>
        </div>
        <div id="${MY_RATE_CONTAINER_ID}"></div>
        <div class="detail">
          <h3>줄거리</h3>
          <p>
            ${(movie?.overview ?? "줄거리를 불러올 수 없습니다.") || "줄거리 정보가 없습니다."}
          </p>
        </div>
      </div>
    </div>
  </dialog>
`;
const renderMovieModal = (parent, movie = null) => {
  if (modalElement) {
    modalElement.remove();
  }
  parent.insertAdjacentHTML("beforeend", createMovieModalTemplate(movie));
  modalElement = document.getElementById(MODAL_ID);
  const myRateContainer = document.getElementById(MY_RATE_CONTAINER_ID);
  if (myRateContainer) {
    renderMyRate(myRateContainer, movie?.id ?? -1);
  }
  modalElement?.showModal();
  document.body.classList.add("modal-open");
  modalElement?.addEventListener("cancel", () => {
    hideMovieModal();
  });
  modalElement?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      hideMovieModal();
    }
  });
  const closeModalButton = modalElement?.querySelector("button");
  closeModalButton?.addEventListener("click", () => {
    hideMovieModal();
  });
};
const hideMovieModal = () => {
  modalElement?.remove();
  document.body.classList.remove("modal-open");
};
const handleMovieItemClick = async (e) => {
  if (e.target instanceof HTMLElement) {
    const li = e.target.closest("li");
    if (!li) return;
    const movieId = li.id;
    if (movieId == null) {
      alert("영화 정보를 불러올 수 없습니다.");
      return;
    }
    try {
      const movieDetail = await getMovieDetail({
        movieId: Number(movieId),
        language: "ko-KR"
      });
      renderMovieModal(document.body, movieDetail);
    } catch {
      alert("영화 정보를 불러올 수 없습니다.");
    }
  }
};
const createMovieItemTemplate = (movie) => `
  <li id="${movie.id}">
    <div class="item">
      <img
        class="thumbnail"
        src="${"https://image.tmdb.org/t/p"}/w500${movie.poster_path}"
        alt="${movie.title} 포스터"
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
const createMovieItemSkeletonTemplate = () => `
  <li class="skeleton">
    <div class="item">
      <div class="thumbnail"></div>
      <div class="item-desc">
        <p class="rate"></p>
        <p class="title"></p>
      </div>
    </div>
  </li>
`;
const renderMovieItems = (parent, movies) => {
  const itemsHTML = movies.map(createMovieItemTemplate).join("");
  parent.insertAdjacentHTML("beforeend", itemsHTML);
  parent.addEventListener("click", handleMovieItemClick);
};
const renderMovieItemsLoading = (parent, count = 20) => {
  const skeletonsHTML = Array.from(
    { length: count },
    createMovieItemSkeletonTemplate
  ).join("");
  parent.insertAdjacentHTML("beforeend", skeletonsHTML);
};
const removeMovieItemsLoading = (parent) => {
  const skeletons = parent.querySelectorAll(".skeleton");
  skeletons.forEach((skeleton) => skeleton.remove());
};
const POPULAR_THUMBNAIL_LIST_ID = "popular-thumbnail-list";
let popularThumbnailList = null;
const createPopularThumbnailListTemplate = () => `
  <ul class="thumbnail-list" id="${POPULAR_THUMBNAIL_LIST_ID}"></ul>
`;
const renderPopularThumbnailLoading = (parent) => {
  if (popularThumbnailList) {
    popularThumbnailList.remove();
  }
  parent.insertAdjacentHTML("beforeend", createPopularThumbnailListTemplate());
  popularThumbnailList = document.getElementById(POPULAR_THUMBNAIL_LIST_ID);
  if (popularThumbnailList) {
    renderMovieItemsLoading(popularThumbnailList);
  }
};
const renderPopularThumbnailList = (parent, movies) => {
  if (popularThumbnailList) {
    popularThumbnailList.remove();
  }
  parent.insertAdjacentHTML("beforeend", createPopularThumbnailListTemplate());
  popularThumbnailList = document.getElementById(POPULAR_THUMBNAIL_LIST_ID);
  if (popularThumbnailList && movies.length > 0) {
    renderMovieItems(popularThumbnailList, movies);
  }
};
const removePopularThumbnailList = () => {
  popularThumbnailList?.remove();
  popularThumbnailList = null;
};
const BANNER_ID = "background-container";
let bannerElement = null;
const createBannerTemplate = (movie) => `
  <div class="background-container" id="${BANNER_ID}">
    <div aria-hidden="true" class="overlay"></div>
    <div class="top-rated-container">
      <div class="top-rated-movie">
        <div class="rate">
          <img class="star" src="./images/star_empty.png"/>
          <span class="rate-value">${movie?.vote_average ?? "..."}</span>
        </div>
        <h3 class="title">${movie?.title ?? "정보를 불러오는 중..."}</h3>
        <button class="primary detail">자세히 보기</button>
      </div>
    </div>
  </div>
`;
const renderBanner = (parent, movie = null) => {
  if (bannerElement) {
    bannerElement.remove();
  }
  parent.insertAdjacentHTML("beforeend", createBannerTemplate(movie));
  bannerElement = document.getElementById(BANNER_ID);
  if (bannerElement && movie) {
    bannerElement.style.backgroundImage = `url(${"https://image.tmdb.org/t/p"}/w1280${movie.backdrop_path})`;
  }
  const button = bannerElement?.querySelector("button");
  button?.addEventListener("click", async () => {
    if (movie?.id == null) {
      window.alert("영화 정보를 불러올 수 없습니다.");
      return;
    }
    try {
      const movieDetail = await getMovieDetail({
        movieId: movie.id,
        language: "ko-KR"
      });
      renderMovieModal(document.body, movieDetail);
    } catch {
      window.alert("영화 정보를 불러올 수 없습니다.");
    }
  });
};
const removeBanner = () => {
  bannerElement?.remove();
  bannerElement = null;
};
const HOME_OBSERVER_TARGET_ID = "home-observer-target";
let homeObserver = null;
let homeObserverTarget = null;
const renderHome = (isLastPage, movies) => {
  removeHome();
  removeSearch();
  const header = document.querySelector("header");
  if (header) {
    renderBanner(header, movies[0]);
  }
  const resultSection = document.getElementById("result-section");
  if (!resultSection) return;
  renderPopularThumbnailList(resultSection, movies);
  if (!isLastPage) {
    observeTarget$1(resultSection, () => {
      handleMainSeeMore();
    });
  }
};
const renderHomeLoading = () => {
  removeHome();
  removeSearch();
  const header = document.querySelector("header");
  if (header) {
    renderBanner(header);
  }
  const resultSection = document.getElementById("result-section");
  if (resultSection) {
    renderPopularThumbnailLoading(resultSection);
  }
};
const renderHomeError = (errorMessage) => {
  removeHome();
  removeSearch();
  const resultSection = document.getElementById("result-section");
  if (resultSection) {
    renderErrorContainer(
      resultSection,
      errorMessage || "🚨문제가 발생했습니다.🚨"
    );
  }
};
const renderHomeEmpty = () => {
  removeHome();
  removeSearch();
  const resultSection = document.getElementById("result-section");
  if (resultSection) {
    renderEmptyContainer(resultSection, "검색 결과가 없습니다.");
  }
};
const appendPopularMovies = (isLastPage, movies) => {
  const resultSection = document.getElementById("result-section");
  const popularThumbnailList2 = document.getElementById(
    "popular-thumbnail-list"
  );
  if (!resultSection || !popularThumbnailList2) return;
  removeObserverTarget$1();
  removeMovieItemsLoading(popularThumbnailList2);
  renderMovieItems(popularThumbnailList2, movies);
  if (!isLastPage) {
    observeTarget$1(resultSection, () => {
      handleMainSeeMore();
    });
  }
};
const removeHome = () => {
  homeObserver?.disconnect();
  homeObserver = null;
  removeObserverTarget$1();
  removeBanner();
  removePopularThumbnailList();
  removeErrorContainer();
  removeEmptyContainer();
};
const observeTarget$1 = (parent, onIntersect) => {
  homeObserver?.disconnect();
  parent.insertAdjacentHTML(
    "beforeend",
    `<div id="${HOME_OBSERVER_TARGET_ID}" class="observer-target"></div>`
  );
  homeObserverTarget = document.getElementById(HOME_OBSERVER_TARGET_ID);
  if (!homeObserverTarget) return;
  homeObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        homeObserver?.disconnect();
        onIntersect();
      }
    },
    {
      rootMargin: "400px",
      threshold: 0.1
    }
  );
  homeObserver.observe(homeObserverTarget);
};
const removeObserverTarget$1 = () => {
  homeObserverTarget?.remove();
  homeObserverTarget = null;
};
const renderHomePage = async (type) => {
  let isError = false;
  let isLastPage = true;
  let movies = [];
  let errorMessage = "";
  const page = Number(sessionStorage.getItem("page") || 1);
  try {
    if (type === "init") {
      renderHomeLoading();
    }
    const popularMovies = await getPopularMovies({
      language: "ko-KR",
      page
    });
    isLastPage = popularMovies.page === popularMovies.total_pages;
    movies = popularMovies.results;
  } catch (error) {
    isError = true;
    errorMessage = "🚨알 수 없는 에러가 발생했습니다.🚨";
    if (error instanceof TMDBError) {
      errorMessage = "🚨TMDB에서 데이터를 불러오는 중 에러가 발생했습니다🚨";
    }
  } finally {
    if (type === "init") {
      if (isError) {
        renderHomeError(errorMessage);
      } else if (movies.length === 0) {
        renderHomeEmpty();
      } else if (type === "init") {
        renderHome(isLastPage, movies);
      }
    }
    if (type === "append") {
      if (isError) {
        window.alert(errorMessage);
      } else {
        appendPopularMovies(isLastPage, movies);
      }
    }
  }
};
const handleMainSeeMore = async () => {
  const prevPage = Number(sessionStorage.getItem("page") || 1);
  sessionStorage.setItem("page", String(prevPage + 1));
  await renderHomePage("append");
};
const handleSearchSeeMore = async () => {
  const prevPage = Number(sessionStorage.getItem("page") || 1);
  sessionStorage.setItem("page", String(prevPage + 1));
  await renderSearchPage("append");
};
const SEARCH_THUMBNAIL_LIST_ID = "search-thumbnail-list";
let searchThumbnailList = null;
const createSearchThumbnailListTemplate = () => `
  <ul class="thumbnail-list" id="${SEARCH_THUMBNAIL_LIST_ID}"></ul>
`;
const renderSearchThumbnailLoading = (parent) => {
  if (searchThumbnailList) {
    searchThumbnailList.remove();
  }
  parent.insertAdjacentHTML("beforeend", createSearchThumbnailListTemplate());
  searchThumbnailList = document.getElementById(SEARCH_THUMBNAIL_LIST_ID);
  if (searchThumbnailList) {
    renderMovieItemsLoading(searchThumbnailList);
  }
};
const renderSearchThumbnailList = (parent, movies) => {
  if (searchThumbnailList) {
    searchThumbnailList.remove();
  }
  parent.insertAdjacentHTML("beforeend", createSearchThumbnailListTemplate());
  searchThumbnailList = document.getElementById(SEARCH_THUMBNAIL_LIST_ID);
  if (searchThumbnailList && movies.length > 0) {
    renderMovieItems(searchThumbnailList, movies);
  }
};
const removeSearchThumbnailList = () => {
  searchThumbnailList?.remove();
  searchThumbnailList = null;
};
const SEARCH_OBSERVER_TARGET_ID = "search-observer-target";
let searchObserver = null;
let searchObserverTarget = null;
const renderSearch = (isLastPage, movies) => {
  removeHome();
  removeSearch();
  const resultSection = document.getElementById("result-section");
  if (!resultSection) return;
  renderSearchThumbnailList(resultSection, movies);
  if (!isLastPage) {
    observeTarget(resultSection, () => {
      handleSearchSeeMore();
    });
  }
};
const renderSearchLoading = (keyword) => {
  removeHome();
  removeSearch();
  const resultSection = document.getElementById("result-section");
  const subTitle = document.getElementById("sub-title");
  if (resultSection) {
    resultSection.classList.add("result-section");
    renderSearchThumbnailLoading(resultSection);
  }
  if (subTitle) {
    subTitle.innerText = `"${keyword}" 검색 결과`;
  }
};
const renderSearchError = (errorMessage) => {
  removeHome();
  removeSearch();
  const resultSection = document.getElementById("result-section");
  if (resultSection) {
    renderErrorContainer(
      resultSection,
      errorMessage || "🚨문제가 발생했습니다.🚨"
    );
  }
};
const renderSearchEmpty = () => {
  removeHome();
  removeSearch();
  const resultSection = document.getElementById("result-section");
  if (resultSection) {
    renderEmptyContainer(resultSection, "검색 결과가 없습니다.");
  }
};
const appendSearchedMovies = (isLastPage, movies) => {
  const resultSection = document.getElementById("result-section");
  const searchThumbnailList2 = document.getElementById("search-thumbnail-list");
  if (!resultSection || !searchThumbnailList2) return;
  removeObserverTarget();
  removeMovieItemsLoading(searchThumbnailList2);
  renderMovieItems(searchThumbnailList2, movies);
  if (!isLastPage) {
    observeTarget(resultSection, () => {
      handleSearchSeeMore();
    });
  }
};
const removeSearch = () => {
  searchObserver?.disconnect();
  searchObserver = null;
  removeObserverTarget();
  removeSearchThumbnailList();
  removeErrorContainer();
  removeEmptyContainer();
};
const observeTarget = (parent, onIntersect) => {
  searchObserver?.disconnect();
  parent.insertAdjacentHTML(
    "beforeend",
    `<div id="${SEARCH_OBSERVER_TARGET_ID}" class="observer-target"></div>`
  );
  searchObserverTarget = document.getElementById(SEARCH_OBSERVER_TARGET_ID);
  if (!searchObserverTarget) return;
  searchObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        searchObserver?.disconnect();
        onIntersect();
      }
    },
    {
      rootMargin: "400px",
      threshold: 0.1
    }
  );
  searchObserver.observe(searchObserverTarget);
};
const removeObserverTarget = () => {
  searchObserverTarget?.remove();
  searchObserverTarget = null;
};
const renderSearchPage = async (type) => {
  let isError = false;
  let isLastPage = true;
  let movies = [];
  let errorMessage = "";
  const keyword = new URLSearchParams(window.location.search).get("keyword") || "";
  const page = Number(sessionStorage.getItem("page") || 1);
  if (keyword.trim() === "") return;
  const searchInput = document.getElementById(
    "search-input"
  );
  if (searchInput) {
    searchInput.value = keyword;
  }
  try {
    if (type === "init") {
      renderSearchLoading(keyword);
    }
    const searchResult = await getSearchedMovies({
      query: keyword,
      language: "ko-KR",
      page
    });
    isLastPage = searchResult.page === searchResult.total_pages;
    movies = searchResult.results;
  } catch (error) {
    isError = true;
    errorMessage = "🚨알 수 없는 에러가 발생했습니다.🚨";
    if (error instanceof TMDBError) {
      errorMessage = "🚨TMDB에서 데이터를 불러오는 중 에러가 발생했습니다🚨";
    }
  } finally {
    if (type === "init") {
      if (isError) {
        renderSearchError(errorMessage);
      } else if (movies.length === 0) {
        renderSearchEmpty();
      } else if (type === "init") {
        renderSearch(isLastPage, movies);
      }
    }
    if (type === "append") {
      if (isError) {
        window.alert(errorMessage);
      } else {
        appendSearchedMovies(isLastPage, movies);
      }
    }
  }
};
const handleMovieSearch = async (keyword) => {
  if (keyword.trim() === "") {
    const hasKeyword = new URLSearchParams(window.location.search).has(
      "keyword"
    );
    if (hasKeyword) {
      window.location.href = "/javascript-movie-review/";
    }
    return;
  }
  const url = new URL(window.location.href);
  const params = url.searchParams;
  params.set("keyword", keyword);
  url.search = params.toString();
  window.location.href = url.toString();
  sessionStorage.setItem("page", "1");
  await renderSearchPage("init");
};
const main = async () => {
  const url = new URL(window.location.href);
  const params = url.searchParams;
  const keyword = params.get("keyword");
  sessionStorage.setItem("page", "1");
  addEventListener();
  if (keyword) {
    await renderSearchPage("init");
  } else {
    await renderHomePage("init");
  }
};
const addEventListener = () => {
  const logo = document.getElementById("logo");
  const searchInput = document.getElementById(
    "search-input"
  );
  const searchButton = document.getElementById("search-button");
  if (logo) {
    logo.addEventListener("click", () => {
      window.location.href = "/javascript-movie-review/";
    });
  }
  if (searchInput && searchButton) {
    searchButton.addEventListener(
      "click",
      () => handleMovieSearch(searchInput.value)
    );
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleMovieSearch(searchInput.value);
    });
  }
};
await main();
