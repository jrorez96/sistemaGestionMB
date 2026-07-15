export default function CrudTable({ columnas, datos, onEditar, onEliminar }) {
  return (
    <table className="crud-table">
      <thead>
        <tr>
          {columnas.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {datos.length === 0 && (
          <tr>
            <td colSpan={columnas.length + 1} style={{ textAlign: 'center', padding: 20 }}>
              No hay registros
            </td>
          </tr>
        )}
        {datos.map((fila, i) => (
          <tr key={fila.id ?? i}>
            {columnas.map((col) => (
              <td key={col.key}>{col.render ? col.render(fila) : fila[col.key]}</td>
            ))}
            <td>
              <button className="btn-editar" onClick={() => onEditar(fila)}>Editar</button>
              <button className="btn-eliminar" onClick={() => onEliminar(fila)}>Eliminar</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}