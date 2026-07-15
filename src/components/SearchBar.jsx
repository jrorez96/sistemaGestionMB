import { useState, useEffect } from 'react';

export default function SearchBar({ onBuscar, placeholder }) {
  const [texto, setTexto] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onBuscar(texto);
    }, 400);
    return () => clearTimeout(timer);
  }, [texto]);

  return (
    <input
      className="search-bar"
      type="text"
      placeholder={placeholder || 'Buscar...'}
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
    />
  );
}