// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

import MisOrdenes from '../pages/MisOrdenes';

// Datos de prueba para simular el historial de compras
const mockOrdenes = [
  {
    id: 'ORD-001',
    fecha: '2026-03-15T10:00:00Z',
    estado: 'Completado',
    productos: [
      { id: 101, nombre: 'Teclado Mecánico', cantidad: 1 }
    ],
    despacho: {
      direccion: 'Av. Libertad 456',
      comuna: 'Viña del Mar',
      region: 'Valparaíso'
    },
    descuento: 5000,
    total: 45000
  }
];

describe('Interfaz de Usuario - Componente MisOrdenes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // Limpia el DOM simulado tras cada prueba
  });

  const renderizarMisOrdenes = (ordenesDatos = mockOrdenes) => {
    return render(
      <MemoryRouter>
        <MisOrdenes ordenes={ordenesDatos} />
      </MemoryRouter>
    );
  };

  it('Debería mostrar un mensaje y enlace al catálogo si no hay órdenes guardadas', () => {
    renderizarMisOrdenes([]);

    expect(screen.getByRole('heading', { level: 1, name: 'Mis órdenes' })).toBeInTheDocument();
    expect(screen.getByText(/Todavía no tienes órdenes/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explorar catálogo/i })).toBeInTheDocument();
  });

  it('Debería renderizar correctamente la lista de órdenes con su información y detalles', () => {
    renderizarMisOrdenes();

    expect(screen.getByRole('heading', { level: 2, name: 'ORD-001' })).toBeInTheDocument();
    expect(screen.getByText(/Estado: Completado/i)).toBeInTheDocument();
    expect(screen.getByText(/Teclado Mecánico × 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Av\. Libertad 456, Viña del Mar, Valparaíso/i)).toBeInTheDocument();
    expect(screen.getByText(/Total: \$45\.000/i)).toBeInTheDocument();
  });
});