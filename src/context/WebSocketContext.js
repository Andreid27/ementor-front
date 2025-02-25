import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import WebSocketService from 'src/@core/axios/WebSocketService';
import { useAuth } from 'src/hooks/useAuth';
import { useDispatch } from 'react-redux';
import { addNotification } from 'src/store/apps/notifications';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const auth = useAuth();
  const dispatch = useDispatch();
  const initializedRef = useRef(false);
  const userId = auth.user?.id; // Use a stable identifier
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('WebSocketProvider mounted');

    return () => console.log('WebSocketProvider unmounted');
  }, []);

  useEffect(() => {
    if (userId && !initializedRef.current) {
      WebSocketService.initialize(auth, (notification) => dispatch(addNotification(notification)));
      initializedRef.current = true;
      setIsConnected(true);
      console.log('WebSocket connected');
    }

    return () => {
      if (initializedRef.current) {
        const instance = WebSocketService.getInstance();
        instance.disconnect();
        initializedRef.current = false;
        setIsConnected(false);
        console.log('WebSocket disconnected');
      }
    };
  }, [userId, dispatch]); // Depend on userId and dispatch

  return (
    <WebSocketContext.Provider value={{ WebSocketService, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
