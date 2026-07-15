export default function Pagination({ pagina, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="pagination">
      <button disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>‹ Anterior</button>
      <span>Página {pagina} de {totalPaginas}</span>
      <button disabled={pagina >= totalPaginas} onClick={() => onCambiar(pagina + 1)}>Siguiente ›</button>
    </div>
  );
}