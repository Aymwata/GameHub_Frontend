// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import Admin from '../pages/Admin.jsx';

const { solicitarConSesion } = vi.hoisted(() => ({ solicitarConSesion: vi.fn() }));
vi.mock('../services/sesion.js', () => ({ useSesion: () => ({ solicitarConSesion }) }));
afterEach(cleanup);

it('envía la imagen y las especificaciones al crear un producto', async () => {
    solicitarConSesion.mockResolvedValue({ id: 21 });
    render(
        <MemoryRouter>
            <Admin catalogo={[]} categorias={[{ id: 3, nombre: 'Componentes' }]}
                estadoCatalogo={{ estado: 'listo' }} onCambio={vi.fn()} />
        </MemoryRouter>,
    );
    for (const [etiqueta, value] of [
        ['nombre', 'Memoria Gamer'], ['marca', 'GameHub'], ['modelo', 'GH-RAM'],
        ['precio', '14990'], ['Categoría', '3'], ['Imagen', '/assets/images/memoria.jpg'],
        ['Especificaciones', 'Memoria: 16 GB\nConector: DDR5: UDIMM'],
    ]) {
        fireEvent.change(screen.getByLabelText(etiqueta), { target: { value } });
    }
    fireEvent.click(screen.getByRole('button', { name: 'Agregar producto' }));
    await waitFor(() => expect(solicitarConSesion).toHaveBeenCalledWith('/products', {
        method: 'POST',
        body: {
            nombre: 'Memoria Gamer', marca: 'GameHub', modelo: 'GH-RAM', precio: 14990,
            categoriaId: 3, descripcion: '', imagen: '/assets/images/memoria.jpg',
            especificaciones: { Memoria: '16 GB', Conector: 'DDR5: UDIMM' },
        },
    }));
});
