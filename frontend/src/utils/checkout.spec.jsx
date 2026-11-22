// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Checkout from '../pages/Checkout.jsx';

const carrito = [{ id: 1, nombre: 'Teclado', cantidad: 1, precio: 10000 }];

afterEach(cleanup);

function renderizar(props) {
    return render(
        <MemoryRouter initialEntries={['/checkout']}>
            <Routes>
                <Route path="/checkout" element={<Checkout carrito={carrito} {...props} />} />
                <Route path="/ordenes" element={<h1>Mis órdenes</h1>} />
            </Routes>
        </MemoryRouter>,
    );
}

describe('Confirmación del pedido', () => {
    it('identifica cuándo el carrito está vacío', () => {
        renderizar({ carrito: [] });
        expect(screen.getByText('Tu carrito está vacío.', { exact: false })).toBeInTheDocument();
    });

    it('impide confirmar si la cantidad supera el stock', () => {
        renderizar({ carritoValido: false });
        expect(screen.getByRole('button', { name: 'Crear pedido' })).toBeDisabled();
    });

    it('espera la orden del servidor antes de mostrar el historial', async () => {
        const finalizarCompra = vi.fn().mockResolvedValue({ id: 37 });
        renderizar({ finalizarCompra });
        fireEvent.click(screen.getByRole('button', { name: 'Crear pedido' }));
        expect(await screen.findByRole('heading', { name: 'Mis órdenes' })).toBeInTheDocument();
        expect(finalizarCompra).toHaveBeenCalledTimes(1);
    });

    it('muestra el rechazo del servidor y permite volver a intentar', async () => {
        const error = Object.assign(new Error('El código promocional no está vigente'), { status: 400 });
        const finalizarCompra = vi.fn().mockRejectedValue(error);
        renderizar({ codigoCupon: 'DEMO', finalizarCompra });
        fireEvent.click(screen.getByRole('button', { name: 'Crear pedido' }));
        expect(await screen.findByRole('alert')).toHaveTextContent(error.message);
        expect(screen.getByRole('button', { name: 'Crear pedido' })).toBeEnabled();
    });
});
