// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

import Producto from '../pages/Producto';

// Catálogo de prueba simulado
const mockCatalogo = [
  {
    id: 1,
    nombre: 'Mouse Gamer RGB',
    marca: 'msi',
    precio: 25000,
    categoria: 'perifericos',
    stock: 5,
    imagen: 'assets/mouse.jpg'
  },
  {
    id: 2,
    nombre: 'Teclado Agotado',
    marca: 'lenovo',
    precio: 45000,
    categoria: 'perifericos',
    stock: 0,
    imagen: 'assets/teclado.jpg'
  }
];

describe('Componente Producto', () => {
  const mockAgregarProducto = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // Limpia el DOM simulado tras cada test
  });

  // Renderiza usando enrutamiento nativo de MemoryRouter
  const renderizarProducto = (idRuta = '1', catalogoDatos = mockCatalogo) => {
    return render(
      <MemoryRouter initialEntries={[`/producto/${idRuta}`]}>
        <Routes>
          <Route
            path="/producto/:id"
            element={
              <Producto
                catalogo={catalogoDatos}
                agregarProducto={mockAgregarProducto}
              />
            }
          />
          <Route
            path="/carrito"
            element={<div data-testid="pagina-carrito">Página Carrito</div>}
          />
        </Routes>
      </MemoryRouter>
    );
  };

  it('Debería mostrar un mensaje de error si el producto no existe', () => {
    renderizarProducto('999');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Producto no encontrado' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Volver al catalogo/i })
    ).toBeInTheDocument();
  });

  it('Debería renderizar la información del producto correctamente', () => {
    renderizarProducto('1');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Mouse Gamer RGB' })
    ).toBeInTheDocument();
    expect(screen.getByText('msi')).toBeInTheDocument();
    expect(screen.getByText('Stock disponible: 5')).toBeInTheDocument();
    expect(screen.getByLabelText('Cantidad')).toHaveValue(1);
  });

  it('Debería deshabilitar el input y el botón si el producto no tiene stock', () => {
    renderizarProducto('2');

    const inputCantidad = screen.getByLabelText('Cantidad');
    const botonAgregar = screen.getByRole('button', { name: /Agregar al carrito/i });

    expect(inputCantidad).toBeDisabled();
    expect(botonAgregar).toBeDisabled();
  });

  it('Debería llamar a agregarProducto y redirigir al carrito al hacer clic', () => {
    mockAgregarProducto.mockReturnValue(true);
    renderizarProducto('1');

    const inputCantidad = screen.getByLabelText('Cantidad');
    const botonAgregar = screen.getByRole('button', { name: /Agregar al carrito/i });

    fireEvent.change(inputCantidad, { target: { value: '2' } });
    fireEvent.click(botonAgregar);

    expect(mockAgregarProducto).toHaveBeenCalledWith(mockCatalogo[0], 2);
    expect(screen.getByTestId('pagina-carrito')).toBeInTheDocument();
  });
});