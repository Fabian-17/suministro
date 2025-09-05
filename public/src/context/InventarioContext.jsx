import React, { createContext, useState } from 'react';

export const InventarioContext = createContext();

export const InventarioProvider = ({ children }) => {
  const [inventario, setInventario] = useState([]);
  const [entradas, setEntradas] = useState([]);
  const [salidas, setSalidas] = useState([]);
  // Aquí puedes agregar funciones para cargar, agregar, editar, eliminar, etc.

  return (
    <InventarioContext.Provider value={{ inventario, setInventario, entradas, setEntradas, salidas, setSalidas }}>
      {children}
    </InventarioContext.Provider>
  );
};
