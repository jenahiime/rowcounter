const widgetList = document.getElementById("widget-list");
const addProjectButton = document.getElementById("add-project-button");
const widgetTemplate = document.getElementById("widget-template");
const languageEnglishButton = document.getElementById("language-english");
const languageKoreanButton = document.getElementById("language-korean");

const STORAGE_KEY = "row-counter-projects";
const LANGUAGE_STORAGE_KEY = "row-counter-language";

const translations = {
  en: {
    workspaceEyebrow: "Knitting + Crochet",
    workspaceTitle: "Project Counters",
    addProject: "Add Project",
    uploadProjectIcon: "Upload project icon",
    addIcon: "Add Icon",
    projectName: "Project Name",
    projectNamePlaceholder: "My Cozy Scarf",
    craftType: "Craft Type",
    knitting: "Knitting",
    crocheting: "Crocheting",
    rowCounter: "Row Counter",
    totalRows: "Total Rows",
    rowAlert: "Increase/Decrease Row!",
    addIncreaseDecreaseCounter: "Add Increase/Decrease Counter",
    increaseDecreaseCount: "Increase/Decrease Count",
    remove: "Remove",
    rowsBetween: "Rows Between Increases/Decreases",
    patternStartsOnRow: "Pattern Starts On Row",
    totalIncreasesDecreases: "Total Increases/Decreases",
    automaticTotalNote: "This total updates automatically from the row counter and your pattern settings.",
    rowsUntilNext: "Rows Until Next Increase/Decrease",
    resetIncreaseDecreaseCounter: "Reset Increase/Decrease Counter",
    resetRowCounter: "Reset Row Counter",
    deleteProject: "Delete Project",
    rowsUntilMissingInterval: "Set rows between increases/decreases",
    rowsUntilMissingStart: "Set the starting row",
    craftLabelKnitting: "Knitting",
    craftLabelCrocheting: "Crocheting",
  },
  ko: {
    workspaceEyebrow: "뜨개질 + 코바늘",
    workspaceTitle: "프로젝트 카운터",
    addProject: "프로젝트 추가",
    uploadProjectIcon: "프로젝트 아이콘 업로드",
    addIcon: "아이콘 추가",
    projectName: "프로젝트",
    projectNamePlaceholder: "포근한 목도리",
    craftType: "프로젝트 종류",
    knitting: "대바늘",
    crocheting: "코바늘",
    rowCounter: "단수 카운터",
    totalRows: "총 단수",
    rowAlert: "증가/감소 단!",
    addIncreaseDecreaseCounter: "코늘림/줄임 카운터 추가",
    increaseDecreaseCount: "코늘림/줄임 카운터",
    remove: "제거",
    rowsBetween: "코늘림/줄임 사이 단수",
    patternStartsOnRow: "코늘림/줄임 패턴 시작 단수",
    totalIncreasesDecreases: "총 코늘림/줄임 단수",
    automaticTotalNote: "총 코늘림/줄임 단수는 패턴에 따라 자동으로 업데이트 됩니다.",
    rowsUntilNext: "다음 코늘림/줄임까지 단수",
    resetIncreaseDecreaseCounter: "코늘림/줄임 카운터 초기화",
    resetRowCounter: "단수 카운터 초기화",
    deleteProject: "프로젝트 삭제",
    rowsUntilMissingInterval: "증가/감소 간격 단수를 입력하세요",
    rowsUntilMissingStart: "시작 단수를 입력하세요",
    craftLabelKnitting: "대바늘",
    craftLabelCrocheting: "코바늘",
  },
};

let widgetCount = 0;
let projects = loadProjects();
let currentLanguage = loadLanguage();

function loadLanguage() {
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return savedLanguage === "ko" ? "ko" : "en";
}

function saveLanguage(language) {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
}

function t(key) {
  return translations[currentLanguage][key] ?? translations.en[key] ?? key;
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage === "ko" ? "ko" : "en";
  document.body.classList.toggle("lang-ko", currentLanguage === "ko");
  languageEnglishButton.classList.toggle("language-button--active", currentLanguage === "en");
  languageKoreanButton.classList.toggle("language-button--active", currentLanguage === "ko");

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
}

function parseStoredNumber(value) {
  const parsedValue = typeof value === "string" ? Number.parseInt(value, 10) : value;

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function loadProjects() {
  try {
    const savedProjects = localStorage.getItem(STORAGE_KEY);

    if (!savedProjects) {
      return [];
    }

    const parsedProjects = JSON.parse(savedProjects);

    if (!Array.isArray(parsedProjects)) {
      return [];
    }

    return parsedProjects.map((project) => ({
      id: typeof project.id === "number" ? project.id : Date.now() + Math.random(),
      projectName: typeof project.projectName === "string" ? project.projectName : "",
      craftType: project.craftType === "Crocheting" ? "Crocheting" : "Knitting",
      totalRows: parseStoredNumber(project.totalRows) ?? 0,
      hasSecondaryCounter: Boolean(project.hasSecondaryCounter),
      secondaryTotal: parseStoredNumber(project.secondaryTotal) ?? 0,
      patternInterval: parseStoredNumber(project.patternInterval),
      patternStartRow: parseStoredNumber(project.patternStartRow),
      iconDataUrl: typeof project.iconDataUrl === "string" ? project.iconDataUrl : "",
    }));
  } catch (error) {
    return [];
  }
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function createProject() {
  widgetCount += 1;

  return {
    id: widgetCount,
    projectName: "",
    craftType: "Knitting",
    totalRows: 0,
    hasSecondaryCounter: false,
    secondaryTotal: 0,
    patternInterval: null,
    patternStartRow: null,
    iconDataUrl: "",
  };
}

function getRowsUntilNextPattern(project) {
  const totalRows = parseStoredNumber(project.totalRows) ?? 0;
  const patternInterval = parseStoredNumber(project.patternInterval);
  const patternStartRow = parseStoredNumber(project.patternStartRow);

  if (!Number.isFinite(patternInterval) || patternInterval <= 0) {
    return t("rowsUntilMissingInterval");
  }

  if (!Number.isFinite(patternStartRow) || patternStartRow < 0) {
    return t("rowsUntilMissingStart");
  }

  if (totalRows < patternStartRow) {
    return String(patternStartRow - totalRows);
  }

  const rowsSinceStart = totalRows - patternStartRow;
  const remainder = rowsSinceStart % patternInterval;

  return String(remainder === 0 ? 0 : patternInterval - remainder);
}

function hasPattern(project) {
  const patternInterval = parseStoredNumber(project.patternInterval);
  const patternStartRow = parseStoredNumber(project.patternStartRow);

  return Number.isFinite(patternInterval) &&
    patternInterval > 0 &&
    Number.isFinite(patternStartRow) &&
    patternStartRow >= 0;
}

function getAutomaticSecondaryTotal(project) {
  const totalRows = parseStoredNumber(project.totalRows) ?? 0;
  const patternInterval = parseStoredNumber(project.patternInterval);
  const patternStartRow = parseStoredNumber(project.patternStartRow);

  if (
    !Number.isFinite(patternInterval) ||
    patternInterval <= 0 ||
    !Number.isFinite(patternStartRow) ||
    patternStartRow < 0 ||
    totalRows < patternStartRow
  ) {
    return 0;
  }

  return Math.floor((totalRows - patternStartRow) / patternInterval) + 1;
}

function normalizeProject(project) {
  project.totalRows = parseStoredNumber(project.totalRows) ?? 0;
  project.secondaryTotal = parseStoredNumber(project.secondaryTotal) ?? 0;
  project.patternInterval = parseStoredNumber(project.patternInterval);
  project.patternStartRow = parseStoredNumber(project.patternStartRow);
}

function createWidget(project) {
  const widgetFragment = widgetTemplate.content.cloneNode(true);
  const cardElement = widgetFragment.querySelector(".counter-card");
  const craftLabelElement = widgetFragment.querySelector('[data-role="craft-label"]');
  const projectIconInput = widgetFragment.querySelector('[data-role="project-icon-input"]');
  const projectIconImage = widgetFragment.querySelector('[data-role="project-icon-image"]');
  const projectIconPlaceholder = widgetFragment.querySelector('[data-role="project-icon-placeholder"]');
  const projectNameInput = widgetFragment.querySelector('[data-role="project-name"]');
  const totalElement = widgetFragment.querySelector('[data-role="row-total"]');
  const rowAlertElement = widgetFragment.querySelector('[data-role="row-alert"]');
  const increaseButton = widgetFragment.querySelector('[data-role="increase-button"]');
  const decreaseButton = widgetFragment.querySelector('[data-role="decrease-button"]');
  const toggleSecondaryCounterButton = widgetFragment.querySelector('[data-role="toggle-secondary-counter"]');
  const secondaryCounterElement = widgetFragment.querySelector('[data-role="secondary-counter"]');
  const secondaryTotalElement = widgetFragment.querySelector('[data-role="secondary-total"]');
  const secondaryTotalNoteElement = widgetFragment.querySelector('[data-role="secondary-total-note"]');
  const patternIntervalInput = widgetFragment.querySelector('[data-role="pattern-interval"]');
  const patternStartRowInput = widgetFragment.querySelector('[data-role="pattern-start-row"]');
  const rowsUntilNextElement = widgetFragment.querySelector('[data-role="rows-until-next"]');
  const secondaryIncreaseButton = widgetFragment.querySelector('[data-role="secondary-increase-button"]');
  const secondaryDecreaseButton = widgetFragment.querySelector('[data-role="secondary-decrease-button"]');
  const secondaryResetButton = widgetFragment.querySelector('[data-role="secondary-reset-button"]');
  const removeSecondaryCounterButton = widgetFragment.querySelector('[data-role="remove-secondary-counter"]');
  const resetButton = widgetFragment.querySelector('[data-role="reset-button"]');
  const deleteButton = widgetFragment.querySelector('[data-role="delete-button"]');
  const craftTypeInputs = widgetFragment.querySelectorAll('[data-role="craft-type"]');

  function renderWidget() {
    normalizeProject(project);

    const patternIsActive = hasPattern(project);
    const displayedSecondaryTotal = patternIsActive
      ? getAutomaticSecondaryTotal(project)
      : project.secondaryTotal;

    totalElement.textContent = project.totalRows;
    secondaryTotalElement.textContent = displayedSecondaryTotal;
    projectNameInput.value = project.projectName;
    patternIntervalInput.value = project.patternInterval === null ? "" : String(project.patternInterval);
    patternStartRowInput.value = project.patternStartRow === null ? "" : String(project.patternStartRow);
    rowsUntilNextElement.textContent = getRowsUntilNextPattern(project);
    secondaryTotalNoteElement.classList.toggle("secondary-total-note--hidden", !patternIsActive);
    rowAlertElement.classList.toggle("row-alert--hidden", getRowsUntilNextPattern(project) !== "0");
    const localizedCraftType = project.craftType === "Crocheting" ? t("craftLabelCrocheting") : t("craftLabelKnitting");
    craftLabelElement.textContent = project.projectName ? `${localizedCraftType} · ${project.projectName}` : localizedCraftType;
    projectIconImage.src = project.iconDataUrl || "";
    projectIconImage.classList.toggle("project-icon-image--hidden", !project.iconDataUrl);
    projectIconPlaceholder.hidden = Boolean(project.iconDataUrl);
    toggleSecondaryCounterButton.hidden = project.hasSecondaryCounter;
    secondaryCounterElement.classList.toggle("secondary-counter--hidden", !project.hasSecondaryCounter);
    secondaryIncreaseButton.disabled = patternIsActive;
    secondaryDecreaseButton.disabled = patternIsActive;
    secondaryResetButton.disabled = patternIsActive;

    craftTypeInputs.forEach((input) => {
      input.checked = input.value === project.craftType;
    });
  }

  craftTypeInputs.forEach((input) => {
    input.name = `craftType-${project.id}`;
  });

  cardElement.setAttribute("data-widget-id", String(project.id));

  function applyIconDataUrl(dataUrl) {
    project.iconDataUrl = dataUrl;
    saveProjects();
    renderWidget();
  }

  function handleImageFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        applyIconDataUrl(reader.result);
      }
    });

    reader.readAsDataURL(file);
  }

  increaseButton.addEventListener("click", () => {
    project.totalRows += 1;
    normalizeProject(project);
    saveProjects();
    renderWidget();
  });

  decreaseButton.addEventListener("click", () => {
    project.totalRows -= 1;
    normalizeProject(project);
    saveProjects();
    renderWidget();
  });

  toggleSecondaryCounterButton.addEventListener("click", () => {
    project.hasSecondaryCounter = true;
    normalizeProject(project);
    saveProjects();
    renderWidget();
  });

  secondaryIncreaseButton.addEventListener("click", () => {
    if (hasPattern(project)) {
      return;
    }

    project.secondaryTotal += 1;
    saveProjects();
    renderWidget();
  });

  secondaryDecreaseButton.addEventListener("click", () => {
    if (hasPattern(project)) {
      return;
    }

    project.secondaryTotal -= 1;
    saveProjects();
    renderWidget();
  });

  secondaryResetButton.addEventListener("click", () => {
    if (hasPattern(project)) {
      return;
    }

    project.secondaryTotal = 0;
    saveProjects();
    renderWidget();
  });

  removeSecondaryCounterButton.addEventListener("click", () => {
    project.hasSecondaryCounter = false;
    project.secondaryTotal = 0;
    project.patternInterval = null;
    project.patternStartRow = null;
    saveProjects();
    renderWidget();
  });

  resetButton.addEventListener("click", () => {
    project.totalRows = 0;
    normalizeProject(project);
    saveProjects();
    renderWidget();
  });

  deleteButton.addEventListener("click", () => {
    projects = projects.filter((savedProject) => savedProject.id !== project.id);
    saveProjects();
    cardElement.remove();

    if (projects.length === 0) {
      const nextProject = createProject();

      projects.push(nextProject);
      saveProjects();
      createWidget(nextProject);
    }
  });

  projectNameInput.addEventListener("input", (event) => {
    project.projectName = event.target.value.trim();
    saveProjects();
    renderWidget();
  });

  projectIconInput.addEventListener("change", (event) => {
    const [file] = event.target.files;

    handleImageFile(file);
  });

  cardElement.addEventListener("paste", (event) => {
    const imageItem = Array.from(event.clipboardData?.items || []).find((item) =>
      item.type.startsWith("image/")
    );

    if (!imageItem) {
      return;
    }

    event.preventDefault();
    handleImageFile(imageItem.getAsFile());
  });

  patternIntervalInput.addEventListener("input", (event) => {
    project.patternInterval = event.target.value;
    normalizeProject(project);
    saveProjects();
    renderWidget();
  });

  patternStartRowInput.addEventListener("input", (event) => {
    project.patternStartRow = event.target.value;
    normalizeProject(project);
    saveProjects();
    renderWidget();
  });

  craftTypeInputs.forEach((input) => {
    input.addEventListener("change", (event) => {
      project.craftType = event.target.value;
      saveProjects();
      renderWidget();
    });
  });

  renderWidget();
  widgetList.appendChild(widgetFragment);
}

languageEnglishButton.addEventListener("click", () => {
  currentLanguage = "en";
  saveLanguage(currentLanguage);
  applyLanguage();
  widgetList.innerHTML = "";
  projects.forEach((project) => createWidget(project));
});

languageKoreanButton.addEventListener("click", () => {
  currentLanguage = "ko";
  saveLanguage(currentLanguage);
  applyLanguage();
  widgetList.innerHTML = "";
  projects.forEach((project) => createWidget(project));
});

addProjectButton.addEventListener("click", () => {
  const project = createProject();

  projects.push(project);
  saveProjects();
  createWidget(project);
});

if (projects.length > 0) {
  projects.forEach((project) => {
    widgetCount = Math.max(widgetCount, project.id);
    createWidget(project);
  });
} else {
  const project = createProject();

  projects.push(project);
  saveProjects();
  createWidget(project);
}

applyLanguage();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // If registration fails, the counter still works as a normal web app.
    });
  });
}
