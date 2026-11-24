// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import MisOrdenes from '../pages/MisOrdenes.jsx';

afterEach(cleanup);

function renderizar(ordenes) {
    const solicitarConSesion = vi.fn().mockResolvedValue(ordenes);
    const productos = new Map([[2, { nombre: 'Teclado mecánico' }]]);
    render(
        <MemoryRouter>
            <MisOrdenes productos={productos} usuario={{ nombre: 'Cliente Demo', email: 'cliente@demo.example' }}
                solicitarConSesion={solicitarConSesion} />
        </MemoryRouter>,
    );
    return solicitarConSesion;
}

describe('Mis órdenes', () => {
    it('consulta Spring y muestra el estado vacío', async () => {
        const solicitarConSesion = renderizar([]);
        expect(await screen.findByText('Todavía no tienes órdenes.', { exact: false })).toBeInTheDocument();
        expect(solicitarConSesion).toHaveBeenCalledWith('/orders/me', expect.objectContaining({ signal: expect.anything() }));
    });

    it('muestra el estado, el total y el precio histórico del pedido', async () => {
        renderizar([{
            id: 1, estado: 'PENDIENTE', subtotal: 22000, descuento: 2000, total: 20000,
            detalles: [{ id: 10, productoId: 2, cantidad: 2, precioUnitario: 11000 }],
            datosCheckout: { nombre: 'Cliente Demo', email: 'cliente@demo.example', telefono: '912345678',
                region: 'Metropolitana', comuna: 'Santiago', direccion: 'Calle Demo 100', metodoPago: 'TRANSFERENCIA' },
        }]);
        const titulo = await screen.findByRole('heading', { name: 'Orden #1' });
        expect(titulo.closest('article')).toHaveClass('orden-card', 'rounded-4', 'shadow-sm');
        expect(screen.getByText(/Pendiente de pago/)).toBeInTheDocument();
        expect(screen.getByText(/Teclado mecánico × 2/)).toBeInTheDocument();
        expect(screen.getByText('$20.000')).toBeInTheDocument();
        expect(screen.getByText('cliente@demo.example')).toBeInTheDocument();
        expect(screen.getByText('Calle Demo 100, Santiago, Metropolitana')).toBeInTheDocument();
        expect(screen.getByText('Transferencia')).toBeInTheDocument();
    });
});
