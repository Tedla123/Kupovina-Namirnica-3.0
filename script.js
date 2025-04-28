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
  "Spremi postavke": "Save Settings"
};

let selectedItems = {};
let savedLists = [];
let currentLanguage = "HR";

window.onload = function () {
  setupTabs();
  setupLanguageButtons();
  renderCategories();
  loadSettings();
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
}

function renderCategories() {
  const container = document.getElementById("categoriesContainer");
  container.innerHTML = "";

  for (let [category, items] of Object.entries(categories)) {
    const catDiv = document.createElement("div");
    catDiv.className = "category active";

    const catHeader = document.createElement("h3");
    catHeader.textContent = currentLanguage === "HR" ? category : translations[category] || category;
    catDiv.appendChild(catHeader);

    const itemDiv = document.createElement("div");
    itemDiv.className = "items";

    items.forEach(item => {
      const btn = document.createElement("button");
      btn.textContent = currentLanguage === "HR" ? item : translations[item] || item;
      btn.onclick = () => {
        selectedItems[item] = (selectedItems[item] || 0) + 1;
        btn.classList.add("selected-item");
        renderSelectedItems();
      };
      itemDiv.appendChild(btn);
    });

    catDiv.appendChild(itemDiv);
    container.appendChild(catDiv);
  }
}

function renderSelectedItems() {
  const container = document.getElementById("selectedCategoriesView");
  if (!container) return;
  container.innerHTML = "";

  for (let item in selectedItems) {
    const btn = document.createElement("button");
    btn.textContent = `${item} - ${selectedItems[item]}`;
    btn.className = "shopping-item";
    btn.onclick = () => {
      if (selectedItems[item] > 1) {
        selectedItems[item]--;
      } else {
        delete selectedItems[item];
      }
      renderSelectedItems();
    };
    container.appendChild(btn);
  }
}

function saveShoppingList() {
  if (Object.keys(selectedItems).length === 0) {
    alert("Popis je prazan!");
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
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selectedItems));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `popis-${new Date().toLocaleDateString()}.json`);
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
      renderSelectedItems();
      alert("Popis uvezen!");
    } catch {
      alert("Greška pri učitavanju datoteke.");
    }
  };
  reader.readAsText(file);
}

function clearShoppingList() {
  if (confirm("Jesi li siguran?")) {
    selectedItems = {};
    renderSelectedItems();
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

  for (let item in selectedItems) {
    const btn = document.createElement("button");
    btn.textContent = `${item} - ${selectedItems[item]}`;
    btn.className = "shopping-item";
    btn.onclick = () => {
      delete selectedItems[item];
      renderShoppingItems();
    };
    container.appendChild(btn);
  }
}

function loadSettings() {
  document.getElementById("swipeToggle").checked = localStorage.getItem("swipeEnabled") === "true";
  document.getElementById("verticalScrollToggle").checked = localStorage.getItem("scrollY") !== "false";
  document.getElementById("horizontalScrollToggle").checked = localStorage.getItem("scrollX") !== "false";
}
