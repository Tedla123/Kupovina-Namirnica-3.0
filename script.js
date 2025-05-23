// Globalne varijable
let touchStartX = 0;
let touchEndX = 0;

let categories = {
  "Voće": ["Jabuka", "Banana", "Kruška", "Šljiva", "Mandarina", "Naranča", "Smokva", "Lubenica", "Grožđe", "Kivi"],
  "Povrće": ["Krumpir", "Rajčica", "Krastavac", "Luk", "Mrkva", "Papar", "Češnjak", "Tikvica", "Kupus", "Blitva"],
  "Meso i riba": ["Piletina", "Junetina", "Svinjetina", "Riba orada", "Riba brancin", "Riblji štapići", "Škampi", "Janjetina", "Kobasice", "Pršut"]
};

let translations = {
  "Voće": "Fruit", "Povrće": "Vegetables", "Meso i riba": "Meat and Fish",
  "Odabir namirnica": "Select Groceries",
  "Popis za kupovinu": "Shopping List",
  "Kupovina": "Shopping",
  "Postavke": "Settings",
  "Spremi trenutni popis": "Save Current List",
  "Izvezi popis": "Export List",
  "Uvezi popis": "Import List",
  "Obriši popis": "Clear List",
  "Obavi kupnju": "Start Shopping",
  "Uredi kategorije i namirnice": "Edit Categories and Items",
  "Swipe između tabova": "Swipe between tabs",
  "Prikaži vertikalni scroll bar": "Show vertical scroll bar",
  "Prikaži horizontalni scroll bar": "Show horizontal scroll bar",
  "Spremi postavke": "Save Settings"
};

let selectedItems = {};
let savedLists = [];
let currentLanguage = "HR";



window.onload = function () {
  setupTabs();
  setupLanguageButtons();
  renderCategories();
  activateFirstCategory();
  loadSettings();
  setupSwipe();
  loadTemplateJSON(); // <-- dodano

  // Na kraju – obradi link ako postoji
  const urlParams = new URLSearchParams(window.location.search);
  const encoded = urlParams.get("popis");
  if (encoded) {
    try {
      const decoded = decodeURIComponent(escape(atob(encoded)));
      selectedItems = JSON.parse(decoded);
      renderSelectedItems();

      // Aktiviraj tab "Popis za kupovinu"
      document.getElementById("tabShoppingList").click();
    } catch {
      alert("Greška pri učitavanju podataka iz linka.");
    }
  }
};



function setupTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      document.querySelectorAll(".content").forEach(c => c.classList.remove("active"));
      this.classList.add("active");
      document.getElementById(this.getAttribute("data-target")).classList.add("active");

      if (this.getAttribute("data-target") === "shopping-list") {
        renderSelectedItems();
        renderSavedLists();
      }
    });
  });
}


function setupLanguageButtons() {
  document.getElementById('hrButton').addEventListener('click', () => switchLanguage('HR'));
  document.getElementById('enButton').addEventListener('click', () => switchLanguage('EN'));
}

function switchLanguage(lang) {
  currentLanguage = lang;
  document.getElementById("tabFruit").textContent = lang === "HR" ? "Odabir namirnica" : translations["Odabir namirnica"];
  document.getElementById("tabShoppingList").textContent = lang === "HR" ? "Popis za kupovinu" : translations["Popis za kupovinu"];
  document.getElementById("tabShopping").textContent = lang === "HR" ? "Kupovina" : translations["Kupovina"];
  document.getElementById("tabSettings").textContent = lang === "HR" ? "Postavke" : translations["Postavke"];
  document.getElementById("btnSaveList").title = lang === "HR" ? "Spremi trenutni popis" : translations["Spremi trenutni popis"];
  document.getElementById("btnExportList").title = lang === "HR" ? "Izvezi popis" : translations["Izvezi popis"];
  document.getElementById("btnImportList").title = lang === "HR" ? "Uvezi popis" : translations["Uvezi popis"];
  document.getElementById("btnClearList").title = lang === "HR" ? "Obriši popis" : translations["Obriši popis"];
  document.getElementById("btnStartShopping").textContent = lang === "HR" ? "Obavi kupnju" : translations["Obavi kupnju"];
  document.getElementById("titleSettings").textContent = lang === "HR" ? "Uredi kategorije i namirnice" : translations["Uredi kategorije i namirnice"];
  document.getElementById("btnSaveSettings").textContent = lang === "HR" ? "Spremi postavke" : translations["Spremi postavke"];

  renderCategories();
  activateFirstCategory();
}

function renderCategories() {
  const container = document.getElementById("categoriesContainer");
  container.innerHTML = "";

  for (let [category, items] of Object.entries(categories)) {
    const catDiv = document.createElement("div");
    catDiv.className = "category";

    const catHeader = document.createElement("h3");
    catHeader.textContent = currentLanguage === "HR" ? category : (translations[category] || category);
    catHeader.onclick = () => {
      document.querySelectorAll(".category").forEach(c => c.classList.remove("active"));
      catDiv.classList.add("active");
    };
    catDiv.appendChild(catHeader);

    const itemDiv = document.createElement("div");
    itemDiv.className = "items";

    items.forEach(item => {
      const btn = document.createElement("button");
      btn.textContent = currentLanguage === "HR" ? item : translations[item] || item;
      btn.classList.add('item-button');

      // Ako je već odabran ➔ odmah ga označi zeleno
      if (selectedItems[item] && selectedItems[item] > 0) {
        btn.classList.add("selected-item");
      }

      let pressTimer;
      let isLongPress = false;

      function startPressTimer() {
        isLongPress = false;
        pressTimer = window.setTimeout(() => {
          isLongPress = true;
          showQuantityPopup(item, btn);
        }, 500);
      }

      function cancelPressTimer() {
        clearTimeout(pressTimer);
      }

      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startPressTimer();
      });
      btn.addEventListener('mouseup', cancelPressTimer);
      btn.addEventListener('mouseleave', cancelPressTimer);

      btn.addEventListener('touchstart', (e) => {
        isLongPress = false;
        startPressTimer();
      });
      btn.addEventListener('touchend', (e) => {
        cancelPressTimer();
        if (!isLongPress) {
          selectedItems[item] = (selectedItems[item] || 0) + 1;
          btn.classList.add("selected-item");
          renderSelectedItems();
          showFloatingPlus(btn);
        }
      });
      btn.addEventListener('touchcancel', cancelPressTimer);

      btn.addEventListener('click', (e) => {
        if (!isLongPress && !("ontouchstart" in window)) {
          selectedItems[item] = (selectedItems[item] || 0) + 1;
          btn.classList.add("selected-item");
          renderSelectedItems();
          showFloatingPlus(btn);
        }
      });

      itemDiv.appendChild(btn);
    });

    catDiv.appendChild(itemDiv);
    container.appendChild(catDiv);
  }
}


function activateFirstCategory() {
  const allCategories = document.querySelectorAll(".category");
  allCategories.forEach(c => c.classList.remove("active"));
  if (allCategories.length > 0) {
    allCategories[0].classList.add("active");
  }
}

function showQuantityPopup(item, button) {
  const quantity = prompt(currentLanguage === "HR" ? "Unesite količinu za " + item + ":" : "Enter quantity for " + item + ":");
  if (quantity && !isNaN(quantity) && parseFloat(quantity) > 0) {
    selectedItems[item] = parseFloat(quantity);
    renderSelectedItems();
    button.classList.add("selected-item");
  }
}

function showFloatingPlus(button) {
  const plus = document.createElement('div');
  plus.textContent = "+1";
  plus.className = "floating-plus";
  plus.style.position = "absolute";
  plus.style.left = "50%";
  plus.style.top = "0";
  plus.style.transform = "translate(-50%, -100%)";
  plus.style.fontSize = "18px";
  plus.style.fontWeight = "bold";
  plus.style.color = "#4caf50";
  plus.style.animation = "moveUpFade 2s forwards";
  plus.style.pointerEvents = "none";
  plus.style.zIndex = "1000";

  button.style.position = "relative";
  button.appendChild(plus);

  setTimeout(() => {
    plus.remove();
  }, 2000);
}

function renderSelectedItems() {
  const container = document.getElementById("selectedCategoriesView");
  if (!container) return;
  container.innerHTML = "";

  const categoriesSelected = {};

  for (let item in selectedItems) {
    for (let category in categories) {
      if (categories[category].includes(item)) {
        if (!categoriesSelected[category]) categoriesSelected[category] = [];
        categoriesSelected[category].push({ name: item, quantity: selectedItems[item] });
        break;
      }
    }
  }

  for (let category in categoriesSelected) {
    const catDiv = document.createElement("div");
    catDiv.className = "category active";

    const catHeader = document.createElement("h3");
    catHeader.textContent = currentLanguage === "HR" ? category : (translations[category] || category);
    catDiv.appendChild(catHeader);

    const itemDiv = document.createElement("div");
    itemDiv.className = "items";

    categoriesSelected[category].forEach(itemObj => {
      const btn = document.createElement("button");
      btn.textContent = `${itemObj.name} - ${itemObj.quantity}`;
      btn.className = "shopping-item";
      btn.onclick = () => {
        selectedItems[itemObj.name] = (selectedItems[itemObj.name] || 0) - 1;
        if (selectedItems[itemObj.name] <= 0) {
          delete selectedItems[itemObj.name];
        }
        renderSelectedItems();
      };
      itemDiv.appendChild(btn);
    });

    catDiv.appendChild(itemDiv);
    container.appendChild(catDiv);
  }
}


function saveShoppingList() {
  if (Object.keys(selectedItems).length === 0) {
    alert(currentLanguage === "HR" ? "Popis je prazan!" : "The list is empty!");
    return;
  }
  savedLists.push({ title: `Popis ${new Date().toLocaleString('hr-HR')}`, data: { ...selectedItems } });
  renderSavedLists();
}

function renderSavedLists() {
  const savedContainer = document.getElementById("savedShoppingLists");
  savedContainer.innerHTML = "";

  savedLists.forEach(list => {
    const wrapper = document.createElement("div");
    const title = document.createElement("h4");
    title.textContent = list.title;
    title.style.cursor = "pointer";
    const listDiv = document.createElement("div");
    listDiv.style.display = "none";
    listDiv.style.marginTop = "10px";

    for (let item in list.data) {
      const p = document.createElement("p");
      p.textContent = `• ${item} x ${list.data[item]}`;
      listDiv.appendChild(p);
    }

    title.onclick = () => {
      listDiv.style.display = listDiv.style.display === "none" ? "block" : "none";
    };

    wrapper.appendChild(title);
    wrapper.appendChild(listDiv);
    savedContainer.appendChild(wrapper);
  });
}

function exportShoppingList() {
  const dataStr = "data:application/x.smartcart;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedItems));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `popis-${new Date().toLocaleDateString('hr-HR')}.smartcart`);
  dlAnchor.click();
}

function importShoppingList(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      selectedItems = data;

      // Prebaci na prikaz
      document.getElementById("tabShoppingList").click();

      setTimeout(() => {
        renderSelectedItems();
        showPopup(currentLanguage === "HR" ? "Popis uvezen!" : "List imported!");
      }, 100); // mali delay kako bi DOM stigao renderirati
    } catch {
      showPopup(currentLanguage === "HR" ? "Greška pri učitavanju datoteke." : "Error loading file.");
    }
  };
  reader.readAsText(file);
}


function showPopup(message) {
  const popup = document.getElementById("popupMessage");
  popup.textContent = message;
  popup.style.display = "block";
  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
    popup.style.display = "none";
  }, 2000);
}

function clearShoppingList() {
  if (confirm(currentLanguage === "HR" ? "Jesi li siguran?" : "Are you sure?")) {
    selectedItems = {};
    renderSelectedItems();
    renderCategories();
    activateFirstCategory();
  }
}

function startShopping() {
  const popup = document.getElementById("shoppingPopup");
  popup.innerHTML = "";

  savedLists.forEach(list => {
    const btn = document.createElement("button");
    btn.textContent = list.title;
    btn.onclick = () => {
      selectedItems = { ...list.data };
      renderShoppingItems();
      popup.style.display = "none";
    };
    popup.appendChild(btn);
  });

  popup.style.display = "block";
}

function renderShoppingItems() {
  const container = document.getElementById("shoppingItems");
  container.innerHTML = "";

  const categoriesSelected = {};

  for (let item in selectedItems) {
    for (let category in categories) {
      if (categories[category].includes(item)) {
        if (!categoriesSelected[category]) categoriesSelected[category] = [];
        categoriesSelected[category].push({ name: item, quantity: selectedItems[item] });
        break;
      }
    }
  }

  for (let category in categoriesSelected) {
    const catDiv = document.createElement("div");
    catDiv.className = "category active";

    const catHeader = document.createElement("h3");
    catHeader.textContent = currentLanguage === "HR" ? category : (translations[category] || category);
    catDiv.appendChild(catHeader);

    const itemDiv = document.createElement("div");
    itemDiv.className = "items";

    categoriesSelected[category].forEach(itemObj => {
      const btn = document.createElement("button");
      btn.textContent = `${itemObj.name} - ${itemObj.quantity}`;
      btn.className = "shopping-item";
      btn.onclick = () => {
        delete selectedItems[itemObj.name];
        renderShoppingItems();
      };
      itemDiv.appendChild(btn);
    });

    catDiv.appendChild(itemDiv);
    container.appendChild(catDiv);
  }
}

function loadSettings() {
  document.getElementById("swipeToggle").checked = localStorage.getItem("swipeEnabled") === "true";
  document.getElementById("verticalScrollToggle").checked = localStorage.getItem("scrollY") !== "false";
  document.getElementById("horizontalScrollToggle").checked = localStorage.getItem("scrollX") !== "false";
}

function saveSettings() {
  localStorage.setItem("swipeEnabled", document.getElementById("swipeToggle").checked);
  localStorage.setItem("scrollY", document.getElementById("verticalScrollToggle").checked);
  localStorage.setItem("scrollX", document.getElementById("horizontalScrollToggle").checked);
  alert(currentLanguage === "HR" ? "Postavke spremljene!" : "Settings saved!");
}

function setupSwipe() {
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
  }, { passive: true });
}

function handleSwipeGesture() {
  const swipeEnabled = document.getElementById("swipeToggle").checked;
  if (!swipeEnabled) return;

  const diff = touchEndX - touchStartX;
  if (Math.abs(diff) > 50) {
    const tabs = Array.from(document.querySelectorAll(".tab"));
    const activeTab = document.querySelector(".tab.active");
    const activeIndex = tabs.indexOf(activeTab);
    if (diff < 0) {
      const nextTab = tabs[activeIndex + 1];
      if (nextTab) nextTab.click();
    } else {
      const prevTab = tabs[activeIndex - 1];
      if (prevTab) prevTab.click();
    }
  }
}


function renderCategories() {
  const container = document.getElementById("categoriesContainer");
  container.innerHTML = "";

  for (let [category, items] of Object.entries(categories)) {
    const catDiv = document.createElement("div");
    catDiv.className = "category";

    const catHeader = document.createElement("h3");
    catHeader.textContent = currentLanguage === "HR" ? category : (translations[category] || category);
    catHeader.onclick = () => {
      document.querySelectorAll(".category").forEach(c => c.classList.remove("active"));
      catDiv.classList.add("active");
    };
    catDiv.appendChild(catHeader);

    const itemDiv = document.createElement("div");
    itemDiv.className = "items";

    items.forEach(item => {
      const btn = document.createElement("button");
      btn.textContent = currentLanguage === "HR" ? item : translations[item] || item;
      btn.classList.add('item-button');

      // Ako je već odabran ➔ odmah ga označi zeleno
      if (selectedItems[item] && selectedItems[item] > 0) {
        btn.classList.add("selected-item");
      }

      let pressTimer;
      let isLongPress = false;

      function startPressTimer() {
        isLongPress = false;
        pressTimer = window.setTimeout(() => {
          isLongPress = true;
          showQuantityPopup(item, btn);
        }, 500);
      }

      function cancelPressTimer() {
        clearTimeout(pressTimer);
      }

      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startPressTimer();
      });
      btn.addEventListener('mouseup', cancelPressTimer);
      btn.addEventListener('mouseleave', cancelPressTimer);

      btn.addEventListener('touchstart', (e) => {
        isLongPress = false;
        startPressTimer();
      });
      btn.addEventListener('touchend', (e) => {
        cancelPressTimer();
        if (!isLongPress) {
          selectedItems[item] = (selectedItems[item] || 0) + 1;
          btn.classList.add("selected-item");
          renderSelectedItems();
          showFloatingPlus(btn);
        }
      });
      btn.addEventListener('touchcancel', cancelPressTimer);

      btn.addEventListener('click', (e) => {
        if (!isLongPress && !("ontouchstart" in window)) {
          selectedItems[item] = (selectedItems[item] || 0) + 1;
          btn.classList.add("selected-item");
          renderSelectedItems();
          showFloatingPlus(btn);
        }
      });

      itemDiv.appendChild(btn);
    });

    catDiv.appendChild(itemDiv);
    container.appendChild(catDiv);
  }
}


function shareShoppingList() {
  const json = JSON.stringify(selectedItems); // Generiraj JSON odabrane liste
  const file = new File([json], "popis.smartcart", { type: "application/x.smartcart" });

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isFileShareSupported = navigator.canShare && navigator.canShare({ files: [file] });

  // Ako je mobilni uređaj i podržano dijeljenje datoteka
  if (isMobile && isFileShareSupported) {
    navigator.share({
      title: "SmartCart Popis",
      text: "Pogledaj moj popis za kupovinu:",
      files: [file]
    }).catch(err => {
      console.log("Dijeljenje prekinuto:", err);
      fallbackToLink(json); // Ako dijeljenje ne uspije, koristi fallback na link
    });
  } else {
    fallbackToLink(json); // Za desktop ili kad mobilno dijeljenje nije podržano
  }
}

// Fallback funkcija za dijeljenje putem URL linka
function fallbackToLink(json) {
  const encoded = btoa(unescape(encodeURIComponent(json))); // Enkodiraj popis u URL
  const shareUrl = `${window.location.origin}${window.location.pathname}?popis=${encoded}`;

  // Kopiranje linka u međuspremnik
  navigator.clipboard.writeText(shareUrl).then(() => {
    showPopup(currentLanguage === "HR"
      ? "Link kopiran u međuspremnik!"
      : "Link copied to clipboard!");
  }).catch(() => {
    alert(currentLanguage === "HR"
      ? "Kopiranje linka nije uspjelo."
      : "Failed to copy link.");
  });
}


// Firebase konfiguracija i predložak
let firebaseApp, database, activeListId = null;
let templateData = [];
let settings = { language: "hr" };
let hasImportedTemplate = localStorage.getItem("templateImported") === "true";

function initializeFirebase(config) {
  firebaseApp = firebase.initializeApp(config);
  database = firebase.database();
}

function connectToList(listId) {
  activeListId = listId;
  listenToFirebaseItems();
  updateFirebaseItems();
  document.getElementById("connectedListInfo").textContent = `Povezano s popisom: ${listId}`;
}

function updateFirebaseItems() {
  if (!database || !activeListId) return;
  database.ref(`popisi/${activeListId}`).set(selectedItems);
}

function listenToFirebaseItems() {
  if (!database || !activeListId) return;
  database.ref(`popisi/${activeListId}`).on("value", (snapshot) => {
    const data = snapshot.val();
    if (data) {
      selectedItems = data;
      renderSelectedItems();
      renderCategories();
    }
  });
}

function loadTemplateJSON() {
  fetch("smartcart_predlozak_namirnica.json")
    .then(response => response.json())
    .then(data => {
      templateData = data;
      populateCountryDropdown();
      if (!hasImportedTemplate) {
        importTemplate("Hrvatska", settings.language);
        localStorage.setItem("templateImported", "true");
      }
    });
}

function populateCountryDropdown() {
  const countries = [...new Set(templateData.map(entry => entry.country))];
  const dropdown = document.getElementById("countryDropdown");
  countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    dropdown.appendChild(option);
  });
  dropdown.value = "Hrvatska";
}

function confirmAndImport() {
  const selectedCountry = document.getElementById("countryDropdown").value;
  if (confirm(settings.language === "hr" ?
      `Želite li zamijeniti postojeći popis namirnica s predloškom za zemlju ${selectedCountry}?`
      : `Replace current items with the template for ${selectedCountry}?`)) {
    importTemplate(selectedCountry, settings.language);
  }
}

function importTemplate(country, language) {
  const filtered = templateData.filter(entry => entry.country === country);
  const newCategories = {};
  let totalItems = 0;
  filtered.forEach(entry => {
    const cat = entry.category;
    const items = entry.items.map(i => i[`name_${language}`] || i.name_hr);
    newCategories[cat] = items;
    totalItems += items.length;
  });
  categories = newCategories;
  renderCategories();
  showPopup(`Uvezen predložak za zemlju: ${country} (${Object.keys(categories).length} kategorija, ${totalItems} namirnica).`);
}


