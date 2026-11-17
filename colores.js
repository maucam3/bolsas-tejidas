// Colores para probar sobre las fotos.
// OJO: son de relleno. Se reemplazan por los hilos reales de Lilián cuando tengamos su lista.

const COLORS = [
  { id: 'crudo', name: 'Crudo', hex: '#efe4cf' },
  { id: 'arena', name: 'Arena', hex: '#d9b98c' },
  { id: 'terracota', name: 'Terracota', hex: '#c4623f' },
  { id: 'mostaza', name: 'Mostaza', hex: '#d9a420' },
  { id: 'salvia', name: 'Salvia', hex: '#8fa58a' },
  { id: 'oliva', name: 'Oliva', hex: '#5f6b3a' },
  { id: 'mar', name: 'Mar', hex: '#2f7f86' },
  { id: 'cielo', name: 'Cielo', hex: '#8fbcd4' },
  { id: 'indigo', name: 'Índigo', hex: '#2e3a6b' },
  { id: 'rosa', name: 'Rosa palo', hex: '#e3a9a4' },
  { id: 'fucsia', name: 'Fucsia', hex: '#c2306f' },
  { id: 'lavanda', name: 'Lavanda', hex: '#a99bc9' },
  { id: 'carbon', name: 'Carbón', hex: '#2b2a2a' },
  { id: 'blanco', name: 'Blanco', hex: '#faf8f3' },
];

const byId = (list, id) => list.find(x => x.id === id) || list[0];
const hexOf = id => byId(COLORS, id).hex;
