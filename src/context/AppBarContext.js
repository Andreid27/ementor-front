import React, { createContext, useState, useContext } from 'react';

const AppBarContext = createContext();

export const AppBarProvider = ({ children }) => {
  const [components, setComponents] = useState([]);
  const [sourceComponent, setSourceComponent] = useState(null);

  const addComponent = (component, source) => {
    if (source !== sourceComponent) {
      setComponents([component]);
      setSourceComponent(source);
    } else {
      setComponents((prevComponents) => [...prevComponents, component]);
    }
  };

  const removeComponent = (index) => {
    setComponents((prevComponents) => prevComponents.filter((_, i) => i !== index));
  };

  const clearComponents = () => {
    setComponents([]);
    setSourceComponent(null);
  };

  return (
    <AppBarContext.Provider value={{ components, addComponent, removeComponent, clearComponents }}>
      {children}
    </AppBarContext.Provider>
  );
};

export const useAppBar = () => useContext(AppBarContext);
