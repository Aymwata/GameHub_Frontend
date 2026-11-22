// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

import Catalogo from '../pages/Catalogo';


vi.mock('../components/TarjetaProducto.jsx', () => ({
  default: (props) => (
    <div data-testid="tarjeta-producto">{props.producto.nombre}</div>
  )
}));


vi.mock('../data/categorias.js', () => ({
  categorias: [
    { id: 'monitores', nombre: 'Monitores' },
    { id: 'laptops', nombre: 'Laptops' }
  ]
}));

// Datos mock para pruebas de renderizado
const mockCatalogo = [
  { id: 1, nombre: 'Monitor Gamer', marca: 'samsung', precio: 180000, categoria: 'monitores' },
  { id: 2, nombre: 'Laptop Legion', marca: 'lenovo', precio: 850000, categoria: 'laptops' }
];

describe('Interfaz de Usuario - Componente Catalogo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // Limpia el DOM tras cada prueba para evitar elementos duplicados
  });

  const renderizar = () =>
    render(
      <MemoryRouter initialEntries={['/catalogo']}>
        <Catalogo catalogo={mockCatalogo} />
      </MemoryRouter>
    );

  it('Debería renderizar el título principal y la lista inicial de productos', () => {
    renderizar();

    expect(screen.getByRole('heading', { level: 1, name: 'Catalogo de productos' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Productos encontrados: 2');
    expect(screen.getAllByTestId('tarjeta-producto')).toHaveLength(2);
  });

  it('Debería filtrar visualmente cuando el usuario escribe en el buscador', () => {
    renderizar();

    const inputBuscar = screen.getByLabelText('Buscar producto');
    fireEvent.change(inputBuscar, { target: { value: 'Laptop' } });

    expect(screen.getByRole('status')).toHaveTextContent('Productos encontrados: 1');
    expect(screen.getByText('Laptop Legion')).toBeInTheDocument();
  });

  it('Debería actualizar el estado al seleccionar una marca', () => {
    renderizar();

    const selectMarca = screen.getByLabelText('Marca');
    fireEvent.change(selectMarca, { target: { value: 'samsung' } });

    expect(screen.getByRole('status')).toHaveTextContent('Productos encontrados: 1');
    expect(screen.getByText('Monitor Gamer')).toBeInTheDocument();
  });

  it('Debería mostrar un aviso si ningún producto coincide', () => {
    renderizar();

    const inputBuscar = screen.getByLabelText('Buscar producto');
    fireEvent.change(inputBuscar, { target: { value: 'Inexistente' } });

    expect(screen.getByText('No encontramos productos')).toBeInTheDocument();
  });

  it('Debería limpiar los campos de búsqueda al hacer clic en "Limpiar filtros"', () => {
    renderizar();

    const inputBuscar = screen.getByLabelText('Buscar producto');
    fireEvent.change(inputBuscar, { target: { value: 'Laptop' } });
    expect(screen.getByRole('status')).toHaveTextContent('Productos encontrados: 1');

    const botonLimpiar = screen.getByRole('button', { name: /Limpiar filtros/i });
    fireEvent.click(botonLimpiar);

    expect(screen.getByRole('status')).toHaveTextContent('Productos encontrados: 2');
  });
});