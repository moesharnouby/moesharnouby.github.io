(function () {
  "use strict";

  const root = document.documentElement;
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".tab-nav");
  const panels = [...document.querySelectorAll("[data-tab-panel]")];
  const tabButtons = [...document.querySelectorAll(".nav-tab")];
  const projectGrid = document.querySelector("#project-grid");
  const dialog = document.querySelector("#project-dialog");
  const dialogContent = document.querySelector("#dialog-content");
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const projects = window.portfolioProjects || [];

  function openTab(name, updateHash = true, scrollTop = true) {
    if (!panels.some((panel) => panel.dataset.tabPanel === name)) name = "home";
    panels.forEach((panel) => {
      const active = panel.dataset.tabPanel === name;
      panel.classList.toggle("is-active", active);
      panel.hidden = !active;
    });
    tabButtons.forEach((button) => {
      const active = button.dataset.tabTarget === name;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    nav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    if (updateHash) history.replaceState(null, "", `#${name}`);
    if (scrollTop) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll("[data-tab-target]").forEach((button) => {
    button.addEventListener("click", () => openTab(button.dataset.tabTarget));
  });

  document.querySelectorAll("[data-scroll-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const target = document.querySelector(`#${button.dataset.scrollTarget}`);
      if (!target) return;
      openTab("home", false, false);
      nav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      history.replaceState(null, "", `#${button.dataset.scrollTarget}`);
      window.requestAnimationFrame(() => target.scrollIntoView({ behavior: "smooth", block: "start" }));
    });
  });

  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  function projectCard(project) {
    const media = project.image
      ? `<img src="${project.image}" alt="${project.imageAlt}" loading="lazy">`
      : `<div class="system-art" aria-label="${project.imageAlt}"><span></span><span></span><span></span><strong>METRO<br>SYSTEMS</strong></div>`;
    return `
      <article class="project-card" data-category="${project.category}">
        <button type="button" data-project-id="${project.id}" aria-label="Open ${project.title}">
          <div class="project-media">${media}<span class="card-index">${String(projects.indexOf(project) + 1).padStart(2, "0")}</span></div>
          <div class="project-copy">
            <p><span>${project.year}</span><span>${project.client}</span></p>
            <h2>${project.title}</h2>
            <div><em>${project.tools.slice(0, 3).join(" · ")}</em><span class="round-arrow">↗</span></div>
          </div>
        </button>
      </article>`;
  }

  function renderProjects(filter = "all") {
    const shown = filter === "all" ? projects : projects.filter((project) => project.category === filter);
    projectGrid.innerHTML = shown.map(projectCard).join("");
    document.querySelector("#project-count").textContent = shown.length;
  }

  function openProject(id) {
    const project = projects.find((item) => item.id === id);
    if (!project) return;
    const media = project.image
      ? `<img class="dialog-image" src="${project.image}" alt="${project.imageAlt}">`
      : `<div class="dialog-system-art system-art"><span></span><span></span><span></span><strong>METRO<br>SYSTEMS</strong></div>`;
    dialogContent.innerHTML = `
      ${media}
      <div class="dialog-copy">
        <p class="eyebrow">${project.year} · ${project.client}</p>
        <h2>${project.title}</h2>
        <p class="dialog-summary">${project.summary}</p>
        <ul>${project.details.map((detail) => `<li>${detail}</li>`).join("")}</ul>
        <div class="tag-list">${project.tools.map((tool) => `<span>${tool}</span>`).join("")}</div>
      </div>`;
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  document.addEventListener("click", (event) => {
    const projectButton = event.target.closest("[data-project-id]");
    if (projectButton) openProject(projectButton.dataset.projectId);
  });

  document.querySelectorAll(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-button").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderProjects(button.dataset.filter);
    });
  });

  document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme) root.dataset.theme = savedTheme;
  function syncThemeColor() {
    themeColor.setAttribute("content", root.dataset.theme === "light" ? "#ecece7" : "#0b0d0c");
  }
  syncThemeColor();
  document.querySelector(".theme-toggle").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("portfolio-theme", root.dataset.theme);
    syncThemeColor();
  });

  const systemsOrbit = document.querySelector(".systems-orbit");
  if (systemsOrbit) {
    if ("IntersectionObserver" in window) {
      const orbitObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-animated", entry.isIntersecting);
        });
      }, { threshold: 0.12 });
      orbitObserver.observe(systemsOrbit);
    } else {
      systemsOrbit.classList.add("is-animated");
    }
  }

  const roleRotator = document.querySelector("[data-role-rotator]");
  if (roleRotator) {
    const roles = [
      "Mechatronics Engineer",
      "Embedded Systems Engineer",
      "Model-Based Design Engineer"
    ];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let roleIndex = 0;
    let roleTimer = null;

    function changeRole() {
      roleRotator.classList.add("is-leaving");
      window.setTimeout(() => {
        roleIndex = (roleIndex + 1) % roles.length;
        roleRotator.textContent = roles[roleIndex];
        roleRotator.classList.remove("is-leaving");
        roleRotator.classList.add("is-entering");
        window.setTimeout(() => roleRotator.classList.remove("is-entering"), 420);
      }, 240);
    }

    function startRoleRotation() {
      if (reduceMotion || roleTimer) return;
      roleTimer = window.setInterval(changeRole, 3600);
    }

    function stopRoleRotation() {
      if (!roleTimer) return;
      window.clearInterval(roleTimer);
      roleTimer = null;
    }

    if ("IntersectionObserver" in window) {
      const roleObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) startRoleRotation();
        else stopRoleRotation();
      }, { threshold: 0.25 });
      roleObserver.observe(roleRotator.parentElement);
    } else {
      startRoleRotation();
    }
  }

  const heroPortrait = document.querySelector("[data-hero-portrait]");
  if (heroPortrait) {
    const reducePortraitMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePortraitPointer = window.matchMedia("(pointer: fine)").matches;

    if (!reducePortraitMotion && finePortraitPointer) {
      heroPortrait.addEventListener("pointermove", (event) => {
        const rect = heroPortrait.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        heroPortrait.style.setProperty("--portrait-x", `${x * 15}px`);
        heroPortrait.style.setProperty("--portrait-y", `${y * 10}px`);
        heroPortrait.style.setProperty("--portrait-inverse-x", `${x * -7}px`);
        heroPortrait.style.setProperty("--portrait-inverse-y", `${y * -5}px`);
        heroPortrait.style.setProperty("--portrait-tilt-x", `${y * -2.5}deg`);
        heroPortrait.style.setProperty("--portrait-tilt-y", `${x * 3.5}deg`);
      });
      heroPortrait.addEventListener("pointerleave", () => {
        ["--portrait-x", "--portrait-y", "--portrait-inverse-x", "--portrait-inverse-y"].forEach((property) => heroPortrait.style.setProperty(property, "0px"));
        heroPortrait.style.setProperty("--portrait-tilt-x", "0deg");
        heroPortrait.style.setProperty("--portrait-tilt-y", "0deg");
      });
    }
  }

  const contactMotion = document.querySelector("[data-contact-motion]");
  if (contactMotion) {
    const reduceContactMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (!reduceContactMotion && "IntersectionObserver" in window) {
      const contactObserver = new IntersectionObserver(([entry]) => {
        contactMotion.classList.toggle("is-in-view", entry.isIntersecting);
      }, { threshold: 0.18 });
      contactObserver.observe(contactMotion);
    } else {
      contactMotion.classList.add("is-in-view");
    }

    if (!reduceContactMotion && finePointer) {
      contactMotion.addEventListener("pointerenter", () => contactMotion.classList.add("is-interacting"));
      contactMotion.addEventListener("pointermove", (event) => {
        const rect = contactMotion.getBoundingClientRect();
        const xRatio = (event.clientX - rect.left) / rect.width;
        const yRatio = (event.clientY - rect.top) / rect.height;
        contactMotion.style.setProperty("--contact-x", `${(xRatio - 0.5) * 32}px`);
        contactMotion.style.setProperty("--contact-y", `${(yRatio - 0.5) * 22}px`);
        contactMotion.style.setProperty("--glow-x", `${xRatio * 100}%`);
        contactMotion.style.setProperty("--glow-y", `${yRatio * 100}%`);
      });
      contactMotion.addEventListener("pointerleave", () => {
        contactMotion.classList.remove("is-interacting");
        contactMotion.style.setProperty("--contact-x", "0px");
        contactMotion.style.setProperty("--contact-y", "0px");
        contactMotion.style.setProperty("--glow-x", "50%");
        contactMotion.style.setProperty("--glow-y", "50%");
      });
    }
  }

  document.querySelector("#current-year").textContent = new Date().getFullYear();
  renderProjects();
  const initialView = location.hash.replace("#", "") || "home";
  if (["about", "contact"].includes(initialView)) {
    openTab("home", false, false);
    window.requestAnimationFrame(() => document.querySelector(`#${initialView}`)?.scrollIntoView({ block: "start" }));
  } else {
    openTab(initialView, false);
  }
})();
