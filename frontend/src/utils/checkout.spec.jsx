// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';

import Checkout from '../pages/Checkout';

// 1. Mock asíncrono de React Router para simular useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 2. Mock de calcularResumen (ya probado independientemente en precios.js/carrito.test.jsx)
vi.mock('../utils/precios.js', () => ({
  calcularResumen: vi.fn(() => ({ subtotal: 10000, descuento: 0, total: 10000 }))
}));

// 3. Mock del subcomponente ResumenCompra
vi.mock('../components/ResumenCompra.jsx', () => ({
  default: () => <div data-testid="resumen-compra">Resumen de Compra Mock</div>
}));

describe('Interfaz de Usuario - Componente Checkout', () => {
  const mockFinalizarCompra = vi.fn();
  const mockCarrito = [
    { id: 1, nombre: 'Teclado Gamer', cantidad: 1, precio: 10000 }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup(); // Limpia el DOM simulado tras cada test
  });

  const renderizarCheckout = (carritoDatos = mockCarrito) => {
    return render(
      <MemoryRouter>
        <Checkout 
          carrito={carritoDatos} 
          codigoCupon="" 
          finalizarCompra={mockFinalizarCompra} 
        />
      </MemoryRouter>
    );
  };

  it('Debería mostrar el mensaje de carrito vacío si no hay productos', () => {
    renderizarCheckout([]);

    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explorar catálogo/i })).toBeInTheDocument();
    expect(screen.queryByLabelText('Nombre completo')).not.toBeInTheDocument();
  });

  it('Debería mantener el botón deshabilitado cuando los campos obligatorios están vacíos', () => {
    renderizarCheckout();

    const botonConfirmar = screen.getByRole('button', { name: /Confirmar compra simulada/i });
    expect(botonConfirmar).toBeDisabled();
  });

  it('Debería mostrar mensajes de error cuando los formatos de correo y teléfono sean inválidos', () => {
    renderizarCheckout();

    const inputCorreo = screen.getByLabelText('Correo electrónico');
    const inputTelefono = screen.getByLabelText('Teléfono de 9 dígitos');

    fireEvent.change(inputCorreo, { target: { value: 'correo-invalido' } });
    fireEvent.change(inputTelefono, { target: { value: '123' } });

    // Gatilla la visualización de errores mediante blur
    fireEvent.blur(inputCorreo);

    expect(screen.getByText('Ingresa un correo válido.')).toBeInTheDocument();
    expect(screen.getByText('Ingresa exactamente 9 dígitos.')).toBeInTheDocument();
  });

  it('Debería habilitar el botón, invocar finalizarCompra y redirigir a /ordenes al completar el formulario', () => {
    mockFinalizarCompra.mockReturnValue(true);
    renderizarCheckout();

    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Juan Pérez' } });
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'juan@ejemplo.com' } });
    fireEvent.change(screen.getByLabelText('Teléfono de 9 dígitos'), { target: { value: '987654321' } });
    fireEvent.change(screen.getByLabelText('Región'), { target: { value: 'Valparaíso' } });
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Viña del Mar' } });
    fireEvent.change(screen.getByLabelText('Dirección'), { target: { value: 'Calle Falsa 123' } });

    const botonConfirmar = screen.getByRole('button', { name: /Confirmar compra simulada/i });
    expect(botonConfirmar).not.toBeDisabled();

    fireEvent.click(botonConfirmar);

    expect(mockFinalizarCompra).toHaveBeenCalledWith({
      nombre: 'Juan Pérez',
      correo: 'juan@ejemplo.com',
      telefono: '987654321',
      region: 'Valparaíso',
      comuna: 'Viña del Mar',
      direccion: 'Calle Falsa 123',
      pago: 'tarjeta'
    });
    expect(mockNavigate).toHaveBeenCalledWith('/ordenes');
  });
});