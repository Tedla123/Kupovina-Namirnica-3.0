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
let swipeEnabled = true;

window.onload = function () {
  setupTabs();
  setupLanguageButtons();
  renderCategories();
  loadSettings();
  setupSwipe();
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
  document.getElementById("btnStartShopping").textContent = lang === "HR" ? "Obavi kupnju" : translations["Obavi kupovinu"];
  document.getElementById("titleSettings").textContent = lang === "HR" ? "Uredi kategorije i namirnice" : translations["Uredi kategorije i namirnice"];
  document.getElementById("btnSaveSettings").textContent = lang === "HR" ? "Spremi postavke" : translations["Spremi postavke"];
  
  // Prevodimo i postavke switcheva
  document.querySelector('label[for="swipeToggle"]').childNodes[0].nodeValue = lang === "HR" ? "Swipe između tabova" : translations["Swipe između tabova"];
  document.querySelector('label[for="verticalScrollToggle"]').childNodes[0].nodeValue = lang === "HR" ? "Prikaži vertikalni scroll bar" : translations["Prikaži vertikalni scroll bar"];
  document.querySelector('label[for="horizontalScrollToggle"]').childNodes[0].nodeValue = lang === "HR" ? "Prikaži horizontalni scroll bar" : translations["Prikaži horizontalni scroll bar"];

  renderCategories();
}

function renderCategories() {
  const container = document.getElementById("categoriesContainer");
  container.innerHTML = "";

  let first = true;

  for (let [category, items] of Object.entries(categories)) {
    const catDiv = document.createElement("div");
    catDiv.className = "category";

    if (first) {
      catDiv.classList.add("active");
      first = false;
    }

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

      let pressTimer;
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        pressTimer = window.setTimeout(() => {
          showQuantityPopup(item, btn);
        }, 500);
      });
      btn.addEventListener('mouseup', (e) => {
        clearTimeout(pressTimer);
      });
      btn.addEventListener('mouseleave', (e) => {
        clearTimeout(pressTimer);
      });

      btn.addEventListener('click', (e) => {
        if (pressTimer) {
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
