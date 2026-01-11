let tiles = [];
let currentImageBase64 = "";
const container = document.getElementById('catalog-container');
const form = document.getElementById('tile-form');
const searchInput = document.getElementById('search-input');
const imageInput = document.getElementById('image-input');

// 1. CARGA INICIAL
async function init() {
    const localData = localStorage.getItem('myTiles');
    if (localData) {
        tiles = JSON.parse(localData);
    } else {
        try {
            const response = await fetch('baldosas.json');
            tiles = await response.json();
            localStorage.setItem('myTiles', JSON.stringify(tiles));
        } catch (e) { console.log("Iniciando catálogo vacío"); }
    }
    renderTiles();
}

// 2. RENDERIZAR (Dibuja las baldosas)
function renderTiles(dataToRender = tiles) {
    if (!container) return;
    container.innerHTML = '';
    const isAdmin = sessionStorage.getItem('isAdmin') === 'true';

    dataToRender.forEach((tile, index) => {
        const card = document.createElement('div');
        card.className = 'tile-card';
        card.innerHTML = `
            <img src="${tile.image}" onerror="this.src='https://via.placeholder.com/200?text=Error+Imagen'">
            <div class="card-info">
                <h3>${tile.name}</h3>
                <p>Material: ${tile.material}</p>
                ${isAdmin ? `<button class="delete-btn" onclick="deleteTile(${index})">Eliminar</button>` : ''}
            </div>
        `;
        container.appendChild(card);
    });
}

// 3. CAPTURAR IMAGEN (Solo en admin.html)
if (imageInput) {
    imageInput.addEventListener('change', (e) => {
        const reader = new FileReader();
        reader.onload = () => currentImageBase64 = reader.result;
        reader.readAsDataURL(e.target.files[0]);
    });
}

// 4. GUARDAR NUEVA (Solo en admin.html)
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTile = {
            name: document.getElementById('name').value,
            material: document.getElementById('material').value,
            image: currentImageBase64
        };
        tiles.push(newTile);
        localStorage.setItem('myTiles', JSON.stringify(tiles));
        renderTiles();
        form.reset();
        currentImageBase64 = "";
    });
}

// 5. BUSCADOR (Solo en index.html)
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = tiles.filter(t => 
            t.name.toLowerCase().includes(term) || t.material.toLowerCase().includes(term)
        );
        renderTiles(filtered);
    });
}

// --- FUNCIÓN EXPORTAR ---
const exportBtn = document.getElementById('export-btn');
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        const dataStr = JSON.stringify(tiles, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'baldosas.json'; // Se descarga con el nombre que GitHub necesita
        link.click();
        
        alert("Archivo 'baldosas.json' descargado. Súbelo a tu repo de GitHub para actualizar a todos los usuarios.");
    });
}

// --- FUNCIÓN IMPORTAR ---
const importInput = document.getElementById('import-input');
if (importInput) {
    importInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedTiles = JSON.parse(event.target.result);
                if (Array.isArray(importedTiles)) {
                    tiles = importedTiles;
                    localStorage.setItem('myTiles', JSON.stringify(tiles));
                    renderTiles();
                    alert("¡Catálogo importado correctamente!");
                }
            } catch (err) {
                alert("Error: El archivo no es un JSON válido.");
            }
        };
        reader.readAsText(file);
    });
}

// 6. FUNCIONES GLOBALES
window.deleteTile = (index) => {
    if (confirm("¿Eliminar esta baldosa?")) {
        tiles.splice(index, 1);
        localStorage.setItem('myTiles', JSON.stringify(tiles));
        renderTiles();
    }
};

window.resetToDefault = () => {
    if (confirm("Se borrarán tus cambios y volverá el catálogo original.")) {
        localStorage.removeItem('myTiles');
        location.reload();
    }
};

init();
