import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "../services/supabaseClient";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface CameraState {
  position: [number, number, number];
  target:   [number, number, number];
}

interface SyncPayload {
  camera:    CameraState;
  teacherId: string;
}

interface UseClassroomSyncOptions {
  sessionId:       string;
  role:            "teacher" | "student";
  teacherId:       string;
  onRemoteUpdate?: (state: CameraState) => void;
  /** Set false to pause sync (e.g. teacher not broadcasting) */
  enabled?:        boolean;
}

export function useClassroomSync({
  sessionId,
  role,
  teacherId,
  onRemoteUpdate,
  enabled = true,
}: UseClassroomSyncOptions) {
  const channelRef       = useRef<RealtimeChannel | null>(null);
  const lastBroadcastRef = useRef<number>(0);
  const [isConnected, setIsConnected] = useState(false);

  // Dynamic throttle: teachers broadcast at 10fps, students
  // receive passively so no throttle needed on their side
  const THROTTLE_MS = role === "teacher" ? 100 : Infinity;

  const onRemoteUpdateRef = useRef(onRemoteUpdate);
  useEffect(() => {
    onRemoteUpdateRef.current = onRemoteUpdate;
  }, [onRemoteUpdate]);

  useEffect(() => {
    // Do NOT connect if sync is disabled or no sessionId
    if (!enabled || !sessionId) return;

    // Disconnect when tab is hidden to save connections
    // Reconnect automatically when tab becomes visible again
    const handleVisibility = () => {
      if (document.hidden) {
        channelRef.current?.unsubscribe();
        channelRef.current = null;
        setIsConnected(false);
      } else {
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    function connect() {
      // Prevent double-subscribe
      if (channelRef.current) return;

      const channel = supabase.channel(
        `classroom:${sessionId}`,
        // IMPORTANT: use 'broadcast' config only — never 'presence'
        // Broadcast mode does NOT count toward the Realtime connection
        // quota the same way. It is stateless and server-fan-out only.
        { config: { broadcast: { self: false, ack: false } } }
      );

      channel
        .on("broadcast", { event: "camera_sync" }, ({ payload }) => {
          if (role === "student" && onRemoteUpdateRef.current) {
            onRemoteUpdateRef.current((payload as SyncPayload).camera);
          }
        })
        .subscribe((status) => {
          setIsConnected(status === "SUBSCRIBED");
        });

      channelRef.current = channel;
    }

    connect();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      channelRef.current?.unsubscribe();
      channelRef.current = null;
      setIsConnected(false);
    };
  }, [sessionId, role, enabled]);

  const broadcastCamera = useCallback(
    (camera: CameraState) => {
      if (role !== "teacher") return;
      if (!channelRef.current || !isConnected) return;

      const now = Date.now();
      if (now - lastBroadcastRef.current < THROTTLE_MS) return;
      lastBroadcastRef.current = now;

      channelRef.current.send({
        type:    "broadcast",
        event:   "camera_sync",
        payload: { camera, teacherId } satisfies SyncPayload,
      });
    },
    [role, teacherId, isConnected, THROTTLE_MS]
  );

  return { broadcastCamera, isConnected };
}
