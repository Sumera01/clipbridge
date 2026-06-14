"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";
import * as Ably from "ably";
import styles from "../room.module.css";

export default function RoomPage() {
  const params = useParams();
  const code = params?.code as string;
  const [clipboard, setClipboard] = useState("");
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<Ably.Types.RealtimeChannelPromise | null>(null);
  const ablyRef = useRef<Ably.Types.RealtimePromise | null>(null);

  const setupAbly = useCallback(async () => {
    if (!code) return;
    try {
      const res = await fetch("/api/ably-token");
      const tokenRequest = await res.json();
      const ably = new Ably.Realtime.Promise({ authCallback: (_, cb) => cb(null, tokenRequest) });
      ablyRef.current = ably;
      const channel = ably.channels.get(`clip-${code}`);
      channelRef.current = channel;

      await channel.attach();
      setConnected(true);

      channel.subscribe("clip", (message) => {
        setClipboard(message.data);
      });

      ably.connection.on("disconnected", () => setConnected(false));
      ably.connection.on("connected", () => setConnected(true));
    } catch (e) {
      console.error("Ably setup failed", e);
    }
  }, [code]);

  useEffect(() => {
    setupAbly();
    return () => {
      channelRef.current?.detach();
      ablyRef.current?.close();
    };
  }, [setupAbly]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && channelRef.current) {
        channelRef.current.publish("clip", text);
        setClipboard(text);
      }
    } catch (err) {
      console.error("Paste failed:", err);
    }
  }, []);

  const copyToClipboard = () => {
    if (clipboard) {
      navigator.clipboard.writeText(clipboard);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ClipBridge</h1>
      <p className={styles.code}>Room: <strong>{code}</strong></p>
      <div className={styles.status}>
        <span className={styles.dot} style={{ backgroundColor: connected ? "#22c55e" : "#ef4444" }} />
        {connected ? "Connected" : "Disconnected"}
      </div>
      <div className={styles.content}>
        <textarea
          className={styles.textarea}
          value={clipboard}
          onChange={(e) => {
            setClipboard(e.target.value);
            if (channelRef.current) {
              channelRef.current.publish("clip", e.target.value);
            }
          }}
          placeholder="Your shared clipboard..."
        />
        <div className={styles.buttons}>
          <button onClick={handlePaste}>📋 Paste from system</button>
          <button onClick={copyToClipboard}>📄 Copy to system</button>
          <button onClick={() => setClipboard("")}>🗑 Clear</button>
        </div>
      </div>
    </div>
  );
}
