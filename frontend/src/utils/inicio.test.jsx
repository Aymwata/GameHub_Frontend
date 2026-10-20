// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

import Inicio from '../pages/Inicio';

// 1. Mock de Bootstrap Carousel soportando la instanciación con 'new'
vi.mock('bootstrap', () => ({
  Carousel: class {
    dispose = vi.fn();
  }
}));

// 2. Mock de productos con stock variado para verificar la lógica de filtrado visual
vi.mock('../data/productos.js', () => ({
  productos: [
    { id: 1, nombre: 'Producto Destacado 1', stock: 5 },
    { id: 2, nombre: 'Producto Destacado 2', stock: 3 },
    { id: 3, nombre: 'Producto Sin Stock', stock: 0 }, // No debe renderizarse
    { id: 4, nombre: 'Producto Destacado 3', stock: 10 },
    { id: 5, nombre: 'Producto Destacado 4', stock: 2 },
    { id: 6, nombre: 'Producto Destacado Excedente', stock: 1 } // Supera el límite de 4
  ]
}));

// 3. Mock de categorías
vi.mock('../data/categorias.js', () => ({
  categorias: [
    { id: 'monitores', nombre: 'Monitores', descripcion: 'Pantallas de alta frecuencia' },
    { id: 'perifericos', nombre: 'Periféricos', descripcion: 'Teclados y mouse' }
  ]
}));

// 4. Mock del subcomponente TarjetaProducto
vi.mock('../components/TarjetaProducto.jsx', () => ({
  default: (props) => (
    <div data-testid="tarjeta-producto">{props.producto.nombre}</div>
  )
}));

describe('Interfaz de Usuario - Componente Inicio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // Limpia el DOM simulado tras cada test
  });

  const renderizarInicio = () =>
    render(
      <MemoryRouter>
        <Inicio />
      </MemoryRouter>
    );

  it('Debería renderizar los títulos de las secciones principales y el iframe del video', () => {
    renderizarInicio();

    expect(screen.getByRole('heading', { level: 2, name: 'Productos destacados' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Explora por categorías' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Descubre la nueva generación' })).toBeInTheDocument();
    expect(screen.getByTitle('Presentación de productos gamer')).toBeInTheDocument();
  });

  it('Debería renderizar únicamente un máximo de 4 productos destacados que tengan stock disponible', () => {
    renderizarInicio();

    const tarjetas = screen.getAllByTestId('tarjeta-producto');
    expect(tarjetas).toHaveLength(4);

    expect(screen.getByText('Producto Destacado 1')).toBeInTheDocument();
    expect(screen.getByText('Producto Destacado 2')).toBeInTheDocument();
    expect(screen.getByText('Producto Destacado 3')).toBeInTheDocument();
    expect(screen.getByText('Producto Destacado 4')).toBeInTheDocument();
    expect(screen.queryByText('Producto Sin Stock')).not.toBeInTheDocument();
  });

  it('Debería renderizar las tarjetas de categorías según los datos', () => {
    renderizarInicio();

    expect(screen.getByRole('heading', { level: 3, name: 'Monitores' })).toBeInTheDocument();
    expect(screen.getByText('Pantallas de alta frecuencia')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Periféricos' })).toBeInTheDocument();
    expect(screen.getByText('Teclados y mouse')).toBeInTheDocument();
  });
});