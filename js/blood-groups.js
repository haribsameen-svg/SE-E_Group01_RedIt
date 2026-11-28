/* ==========================================================================
   Blood Groups Information - Page Interactivity & Single Data Source
   Generates the 8 blood-group cards, compatibility checker results,
   and full donor-vs-recipient compatibility chart from ONE object.
   ========================================================================== */

(function () {
  "use strict";

  const ALL_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  /**
   * Single source of truth for all blood group compatibility rules,
   * card labels, and special tags.
   */
  const BLOOD_GROUPS = {
    "A+": {
      donateTo: ["A+", "AB+"],
      receiveFrom: ["A+", "A-", "O+", "O-"],
      donateLabel: "A+, AB+",
      receiveLabel: "A+, A-, O+, O-",
      tag: ""
    },
    "A-": {
      donateTo: ["A+", "A-", "AB+", "AB-"],
      receiveFrom: ["A-", "O-"],
      donateLabel: "A+, A-, AB+, AB-",
      receiveLabel: "A-, O-",
      tag: ""
    },
    "B+": {
      donateTo: ["B+", "AB+"],
      receiveFrom: ["B+", "B-", "O+", "O-"],
      donateLabel: "B+, AB+",
      receiveLabel: "B+, B-, O+, O-",
      tag: ""
    },
    "B-": {
      donateTo: ["B+", "B-", "AB+", "AB-"],
      receiveFrom: ["B-", "O-"],
      donateLabel: "B+, B-, AB+, AB-",
      receiveLabel: "B-, O-",
      tag: ""
    },
    "AB+": {
      donateTo: ["AB+"],
      receiveFrom: ALL_GROUPS.slice(),
      donateLabel: "AB+",
      receiveLabel: "All groups",
      tag: "Universal Recipient"
    },
    "AB-": {
      donateTo: ["AB+", "AB-"],
      receiveFrom: ["A-", "B-", "AB-", "O-"],
      donateLabel: "AB+, AB-",
      receiveLabel: "A-, B-, AB-, O-",
      tag: ""
    },
    "O+": {
      donateTo: ["O+", "A+", "B+", "AB+"],
      receiveFrom: ["O+", "O-"],
      donateLabel: "O+, A+, B+, AB+",
      receiveLabel: "O+, O-",
      tag: ""
    },
    "O-": {
      donateTo: ALL_GROUPS.slice(),
      receiveFrom: ["O-"],
      donateLabel: "All groups",
      receiveLabel: "O- only",
      tag: "Universal Donor"
    }
  };

  /* DOM Elements */
  const navToggle = document.getElementById("navToggle");
  const primaryNav = document.getElementById("primaryNav");
  const bloodGroupsGrid = document.getElementById("bloodGroupsGrid");
  const bloodGroupSelect = document.getElementById("bloodGroupSelect");
  const directionSelect = document.getElementById("directionSelect");
  const compatibilityForm = document.getElementById("compatibilityForm");
  const resetBtn = document.getElementById("resetBtn");
  const checkerResult = document.getElementById("checkerResult");
  const compatibilityTable = document.getElementById("compatibilityTable");
  const checkerSection = document.getElementById("compatibility-checker");

  /* --------------------------------------------------------------------------
     1. Mobile Hamburger Navigation
     -------------------------------------------------------------------------- */
  function initMobileNav() {
    if (!navToggle || !primaryNav) return;

    navToggle.addEventListener("click", function () {
      const isOpen = primaryNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close menu when a link is clicked on mobile
    primaryNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        primaryNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* --------------------------------------------------------------------------
     2. Build the 8 Blood Group Cards & Populate Checker Dropdown
     -------------------------------------------------------------------------- */
  function renderBloodGroupCards() {
    if (!bloodGroupsGrid) return;

    const fragment = document.createDocumentFragment();

    Object.keys(BLOOD_GROUPS).forEach(function (group) {
      const info = BLOOD_GROUPS[group];

      const card = document.createElement("button");
      card.type = "button";
      card.className = "blood-group-card reveal-card";
      card.dataset.group = group;
      card.setAttribute("aria-label", "Select blood group " + group + " for compatibility check");

      const topRow = document.createElement("div");
      topRow.className = "blood-group-card-top";

      const badge = document.createElement("span");
      badge.className = "blood-circle-badge";
      badge.textContent = group;
      topRow.appendChild(badge);

      if (info.tag) {
        const tag = document.createElement("span");
        tag.className = "blood-special-tag";
        tag.textContent = info.tag;
        topRow.appendChild(tag);
      }

      const rows = document.createElement("div");
      rows.className = "blood-group-rows";

      const donateRow = document.createElement("div");
      donateRow.className = "blood-group-row";
      const donateLabel = document.createElement("span");
      donateLabel.className = "blood-row-label";
      donateLabel.textContent = "Can donate to";
      const donateValue = document.createElement("span");
      donateValue.className = "blood-row-value";
      donateValue.textContent = info.donateLabel;
      donateRow.appendChild(donateLabel);
      donateRow.appendChild(donateValue);

      const receiveRow = document.createElement("div");
      receiveRow.className = "blood-group-row";
      const receiveLabel = document.createElement("span");
      receiveLabel.className = "blood-row-label";
      receiveLabel.textContent = "Can receive from";
      const receiveValue = document.createElement("span");
      receiveValue.className = "blood-row-value";
      receiveValue.textContent = info.receiveLabel;
      receiveRow.appendChild(receiveLabel);
      receiveRow.appendChild(receiveValue);

      rows.appendChild(donateRow);
      rows.appendChild(receiveRow);

      const hint = document.createElement("span");
      hint.className = "blood-card-hint";
      hint.textContent = "Click to check compatibility →";

      card.appendChild(topRow);
      card.appendChild(rows);
      card.appendChild(hint);

      card.addEventListener("click", function () {
        selectGroupFromCard(group);
      });

      fragment.appendChild(card);
    });

    bloodGroupsGrid.appendChild(fragment);
  }

  function populateDropdown() {
    if (!bloodGroupSelect) return;

    Object.keys(BLOOD_GROUPS).forEach(function (group) {
      const option = document.createElement("option");
      option.value = group;
      option.textContent = group;
      bloodGroupSelect.appendChild(option);
    });
  }

  /* --------------------------------------------------------------------------
     3. Card Highlight + Scroll to Compatibility Checker
     -------------------------------------------------------------------------- */
  function highlightCard(selectedGroup) {
    if (!bloodGroupsGrid) return;

    const cards = bloodGroupsGrid.querySelectorAll(".blood-group-card");
    cards.forEach(function (card) {
      const matches = card.dataset.group === selectedGroup;
      card.classList.toggle("is-selected", matches);
    });
  }

  function selectGroupFromCard(group) {
    highlightCard(group);

    if (bloodGroupSelect) {
      bloodGroupSelect.value = group;
    }

    renderCheckerResult();

    if (checkerSection) {
      checkerSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* --------------------------------------------------------------------------
     4. Compatibility Checker Logic
     -------------------------------------------------------------------------- */
  function renderCheckerResult() {
    if (!checkerResult || !bloodGroupSelect || !directionSelect) return;

    const selectedGroup = bloodGroupSelect.value;
    const direction = directionSelect.value;

    checkerResult.innerHTML = "";

    if (!selectedGroup || !BLOOD_GROUPS[selectedGroup]) {
      const errorMsg = document.createElement("p");
      errorMsg.className = "checker-result-message checker-result-message--error";
      errorMsg.textContent = "Please choose a blood group first to check compatibility.";
      checkerResult.appendChild(errorMsg);
      return;
    }

    highlightCard(selectedGroup);

    const groupData = BLOOD_GROUPS[selectedGroup];
    const matches = direction === "donate" ? groupData.donateTo : groupData.receiveFrom;

    const summary = document.createElement("p");
    summary.className = "checker-result-message";
    summary.textContent =
      direction === "donate"
        ? "Blood group " + selectedGroup + " can donate to (" + matches.length + " compatible " + (matches.length === 1 ? "group" : "groups") + "):"
        : "Blood group " + selectedGroup + " can receive from (" + matches.length + " compatible " + (matches.length === 1 ? "group" : "groups") + "):";

    const chipsWrapper = document.createElement("div");
    chipsWrapper.className = "checker-chips";

    matches.forEach(function (targetGroup) {
      const chip = document.createElement("span");
      chip.className = "group-chip";
      chip.textContent = targetGroup;
      chipsWrapper.appendChild(chip);
    });

    checkerResult.appendChild(summary);
    checkerResult.appendChild(chipsWrapper);
  }

  function resetChecker() {
    if (bloodGroupSelect) {
      bloodGroupSelect.value = "";
    }
    if (directionSelect) {
      directionSelect.value = "donate";
    }
    highlightCard("");

    if (checkerResult) {
      checkerResult.innerHTML =
        '<p class="checker-result-message">Select a blood group above and click <strong>Check</strong> to view compatible types.</p>';
    }
  }

  function initChecker() {
    if (!compatibilityForm || !resetBtn) return;

    compatibilityForm.addEventListener("submit", function (event) {
      event.preventDefault();
      renderCheckerResult();
    });

    resetBtn.addEventListener("click", resetChecker);
  }

  /* --------------------------------------------------------------------------
     5. Build Compatibility Chart Matrix (Donors in rows vs Recipients in cols)
     -------------------------------------------------------------------------- */
  function renderCompatibilityChart() {
    if (!compatibilityTable) return;

    const groups = Object.keys(BLOOD_GROUPS);

    // Table Header: Recipients
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const corner = document.createElement("th");
    corner.scope = "col";
    corner.className = "corner-cell";
    corner.textContent = "Donor \\ Recipient";
    headerRow.appendChild(corner);

    groups.forEach(function (recipient) {
      const th = document.createElement("th");
      th.scope = "col";
      th.textContent = recipient;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    // Table Body: Donors
    const tbody = document.createElement("tbody");

    groups.forEach(function (donor) {
      const row = document.createElement("tr");

      const rowHeader = document.createElement("th");
      rowHeader.scope = "row";
      rowHeader.textContent = donor;
      row.appendChild(rowHeader);

      const allowedRecipients = BLOOD_GROUPS[donor].donateTo;

      groups.forEach(function (recipient) {
        const td = document.createElement("td");
        const isCompatible = allowedRecipients.indexOf(recipient) !== -1;

        if (isCompatible) {
          const check = document.createElement("span");
          check.className = "cell-check";
          check.setAttribute("aria-hidden", "true");
          check.textContent = "✓";

          const srText = document.createElement("span");
          srText.className = "sr-only";
          srText.textContent = donor + " can donate to " + recipient;

          td.appendChild(check);
          td.appendChild(srText);
        } else {
          const dash = document.createElement("span");
          dash.className = "cell-dash";
          dash.setAttribute("aria-hidden", "true");
          dash.textContent = "—";

          const srText = document.createElement("span");
          srText.className = "sr-only";
          srText.textContent = donor + " cannot donate to " + recipient;

          td.appendChild(dash);
          td.appendChild(srText);
        }

        row.appendChild(td);
      });

      tbody.appendChild(row);
    });

    compatibilityTable.appendChild(thead);
    compatibilityTable.appendChild(tbody);
  }

  /* --------------------------------------------------------------------------
     6. Scroll Fade-In on Cards
     -------------------------------------------------------------------------- */
  function initScrollReveal() {
    const cards = document.querySelectorAll(".reveal-card");
    if (!cards.length) return;

    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (card) {
        card.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    cards.forEach(function (card) {
      observer.observe(card);
    });
  }

  /* --------------------------------------------------------------------------
     Initialize Page
     -------------------------------------------------------------------------- */
  initMobileNav();
  renderBloodGroupCards();
  populateDropdown();
  initChecker();
  renderCompatibilityChart();
  initScrollReveal();
})();
