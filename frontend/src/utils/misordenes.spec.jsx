
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

import MisOrdenes from '../pages/MisOrdenes';


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
    cleanup();
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

    expect(screen.getByRole('heading', { level: 1, name: /Mis ordenes/i })).toBeInTheDocument();
    expect(screen.getByText(/Aun no tienes ordenes registradas/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ir al catalogo/i })).toBeInTheDocument();
  });

  it('Debería renderizar correctamente la lista de órdenes con su información y detalles', () => {
    renderizarMisOrdenes();

    expect(screen.getByText(/Orden #.*ORD-001/i)).toBeInTheDocument();
    expect(screen.getByText(/Completado/i)).toBeInTheDocument();
    expect(screen.getByText(/Teclado Mecánico/i)).toBeInTheDocument();
    expect(screen.getByText(/Cantidad:\s*1/i)).toBeInTheDocument();
    expect(screen.getByText(/\$45\.000/)).toBeInTheDocument();
  });
});