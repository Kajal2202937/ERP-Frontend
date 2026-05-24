import { useEffect, useRef, useCallback } from "react";
import { getSocket, initSocket } from "../services/socket";
import { TICKET_EVENTS } from "../services/socketEvents";

/**
 * useTicketSocket
 *
 * Reuses the module-level singleton from services/socket.js.
 * NEVER creates a second socket connection — integrates with
 * the existing AuthContext socket lifecycle.
 *
 * @param {object} options
 * @param {string|null} options.token     - JWT (admin) or null (public user)
 * @param {boolean}     options.isAdmin   - Whether to join admin_room
 * @param {string|null} options.ticketId  - ticketId string e.g. "TICKET-1001"
 * @param {object}      options.handlers  - { [TICKET_EVENTS.X]: callbackFn }
 */
const useTicketSocket = ({
  token = null,
  isAdmin = false,
  ticketId = null,
  handlers = {},
} = {}) => {
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const socket = getSocket() || initSocket(token);
    if (!socket) return;

    const onConnect = () => {
      if (isAdmin) socket.emit(TICKET_EVENTS.JOIN_ADMIN);
      if (ticketId) socket.emit(TICKET_EVENTS.JOIN_TICKET, { ticketId });
    };

    const onReconnect = () => {
      if (isAdmin) socket.emit(TICKET_EVENTS.JOIN_ADMIN);
      if (ticketId) socket.emit(TICKET_EVENTS.JOIN_TICKET, { ticketId });
    };

    socket.on("connect", onConnect);
    socket.io?.on("reconnect", onReconnect);

    if (socket.connected) onConnect();

    const wrappers = {};
    Object.keys(handlersRef.current).forEach((event) => {
      wrappers[event] = (...args) => handlersRef.current[event]?.(...args);
      socket.on(event, wrappers[event]);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.io?.off("reconnect", onReconnect);

      Object.entries(wrappers).forEach(([event, fn]) => {
        socket.off(event, fn);
      });

      if (ticketId) {
        socket.emit(TICKET_EVENTS.LEAVE_TICKET, { ticketId });
      }
    };
  }, [token, isAdmin, ticketId]);

  const emitTyping = useCallback((tid) => {
    getSocket()?.emit(TICKET_EVENTS.TYPING, { ticketId: tid });
  }, []);

  const emitStopTyping = useCallback((tid) => {
    getSocket()?.emit(TICKET_EVENTS.STOP_TYPING, { ticketId: tid });
  }, []);

  const emitSeen = useCallback((tid) => {
    getSocket()?.emit(TICKET_EVENTS.SEEN, { ticketId: tid });
  }, []);

  return { emitTyping, emitStopTyping, emitSeen };
};

export default useTicketSocket;
