import React, { createContext, useContext, useEffect, useRef } from 'react';
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

  useEffect(() => {
    console.log('WebSocketProvider mounted');

    return () => console.log('WebSocketProvider unmounted');
  }, []);

  useEffect(() => {
    if (userId && !initializedRef.current) {
      WebSocketService.initialize(auth, (notification) => dispatch(addNotification(notification)));
      initializedRef.current = true;
    }

    return () => {
      if (initializedRef.current) {
        WebSocketService.disconnect();
        initializedRef.current = false;
      }
    };
  }, [userId, dispatch]); // Depend on userId and dispatch

  return (
    <WebSocketContext.Provider value={WebSocketService}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
