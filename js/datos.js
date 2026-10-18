// Catálogo simulado compartido por todas las vistas.
(function (root) {
    'use strict';
    // Define los productos de ejemplo con sus precios, imágenes, categorías y stock.
    const productos = [
    { id: 1, nombre: "Monitor Gamer Samsung 27\", FHD, 180Hz, VA, 1ms, FreeSync, Odyssey G3 LS27DG300ELXZS", precio: 180000, imagen: "assets/images/monitorSamsung.jpg", stock: 15, categoria: "perifericos", marca: "samsung" },
    { id: 2, nombre: "Notebook Gamer LOQ Gen 10 Intel Core i7-13645HX NVIDIA GeForce RTX 5050 15.6\" 144Hz 16GB RAM 512GB Windows 11 Home", precio: 850000, imagen: "assets/images/notebookLenovo.jpg", stock: 5, categoria: "computadores", marca: "lenovo" },
    { id: 3, nombre: "Tarjeta de Video MSI Nvidia GeForce RTX 5060 8G VENTUS 2X OC WHITE", precio: 320000, imagen: "assets/images/tarjetaNvidia.jpg", stock: 0, categoria: "componentes", marca: "msi" },
    { id: 4, nombre: "Desktop Gamer Esgaming Ryzen 5 5500 32GB DDR4 RGB 500GB SSD RTX 5050", precio: 1200000, imagen: "assets/images/desktopEsgaming.jpg", stock: 2, categoria: "computadores", marca: "esgaming" },
    { id: 5, nombre: "Monitor Gamer Samsung Curvo 49” Odyssey G9 G91F QHD 144Hz", precio: 849990, imagen: "assets/images/monitorSamsungCurvo.jpg", stock: 10, categoria: "perifericos", marca: "samsung" }
];
    // Relaciona el identificador de cada producto con sus características técnicas.
    const especificaciones = {
        1: { Pantalla: '27 pulgadas FHD', Frecuencia: '180 Hz', Panel: 'VA', Respuesta: '1 ms' },
        2: { Procesador: 'Intel Core i7-13645HX', Memoria: '16 GB RAM', Almacenamiento: '512 GB SSD', Gráficos: 'NVIDIA GeForce RTX 5050' },
        3: { Gráficos: 'NVIDIA GeForce RTX 5060', Memoria: '8 GB', Modelo: 'VENTUS 2X OC WHITE' },
        4: { Procesador: 'AMD Ryzen 5 5500', Memoria: '32 GB DDR4', Almacenamiento: '500 GB SSD', Gráficos: 'NVIDIA GeForce RTX 5050' },
        5: { Pantalla: '49 pulgadas QHD curva', Frecuencia: '144 Hz', Modelo: 'Odyssey G9 G91F' }
    };
    // Define los cupones de prueba con su porcentaje, descuento máximo y fechas de vigencia.
    const cupones = [
        { codigo: 'GAME20', porcentaje: 20, tope: 100000, inicio: '2026-01-01', fin: '2026-12-31' },
        { codigo: 'VENCIDO', porcentaje: 10, tope: 50000, inicio: '2020-01-01', fin: '2020-12-31' }
    ];
    // Permite consultar los mismos datos desde las páginas y las pruebas de Node.js.
    const datos = { productos, especificaciones, cupones };
    if (typeof module !== 'undefined' && module.exports) module.exports = datos;
    else root.GameHubDatos = datos;
})(globalThis);
