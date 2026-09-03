const productosDestacados = [
    {
        id: 1,
        nombre: "Monitor Gamer Samsung 27\", FHD, 180Hz, VA, 1ms, FreeSync, Odyssey G3 LS27DG300ELXZS",
        precio: 134990,
        imagen: "assets/images/monitorSamsung.jpg"
    },
    {
        id: 2,
        nombre: "Notebook Gamer LOQ Gen 10 Intel Core i7-13645HX NVIDIA GeForce RTX 5050 15.6\" 144Hz 16GB RAM 512GB Windows 11 Home Luna Grey 83JE0184CL",
        precio: 1229990,
        imagen: "assets/images/notebookLenovo.jpg"
    },
    {
        id: 3,
        nombre: "Tarjeta de Video Nvidia GeForce RTX 5060 8G VENTUS 2X OC WHITE",
        precio: 444990,
        imagen: "assets/images/tarjetaNvidia.jpg"
    },
    {
        id: 4,
        nombre: "Desktop Gamer Esgaming Ryzen 5 5500 32GB DDR4 RGB 500GB SSD RTX 5050",
        precio: 1399990,
        imagen: "assets/images/desktopEsgaming.jpg"
    }
];

const contenedor = document.getElementById('contenedor-destacados');

productosDestacados.forEach(producto => {
    const tarjetaHTML = `
        <div class="col-md-3 mb-4">
            <div class="card tarjeta-producto">
                <img src="${producto.imagen}" class="card-img-top imagen-producto" alt="${producto.nombre}">
                <div class="card-body">
                    <h5 class="card-title nombre-producto">${producto.nombre}</h5>
                    <p class="card-text precio-producto">$${producto.precio.toLocaleString('es-CL')}</p>
                    <button class="btn btn-agregar">Agregar al Carrito</button>
                </div>
            </div>
        </div>
    `;
    
    contenedor.innerHTML += tarjetaHTML;
});
