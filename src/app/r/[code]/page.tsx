"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { encrypt, decrypt } from "@/lib/crypto";
import styles from "./room.module.css";

type Status = "connecting" | "connected" | "disconnected" | "error";

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = decodeURIComponent(params.code as string);

  const [text, setText] = useState("");
  const [status, setStatus] = useState<Status>("connecting");
  const [peerCount, setPeerCount] = useState(0);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);
  const [syncDir, setSyncDir] = useState<"in" | "out" | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRemoteUpdate = useRef(false);

  // Send encrypted text to server
  const sendText = useCallback(async (value: string) => {
    try {
      const payload = await encrypt(value, roomCode);
      const res = await fetch("/api/room/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: roomCode, payload }),
      });
      if (res.ok) {
        setLastSync(new Date());
        setSyncDir("out");
        setTimeout(() => setSyncDir(null), 600);
      }
    } catch (err) {
      console.error("send error", err);
    }
  }, [roomCode]);

  // Connect SSE
  useEffect(() => {
    let retryTimeout: ReturnType<typeof setTimeout>;
    let retryCount = 0;

    const connect = () => {
      setStatus("connecting");
      const es = new EventSource(`/api/room/subscribe?room=${encodeURIComponent(roomCode)}`);
      eventSourceRef.current = es;

      es.onopen = () => {
        setStatus("connected");
        setPeerCount(1);
        retryCount = 0;
      };

      es.onmessage = async (e) => {
        try {
          const plain = await decrypt(e.data, roomCode);
          isRemoteUpdate.current = true;
          setText(plain);
          setLastSync(new Date());
          setSyncDir("in");
          setTimeout(() => setSyncDir(null), 600);
          // Focus textarea on first incoming message
          textareaRef.current?.focus();
        } catch {
          // Decryption failed (different key / garbage) — ignore
        }
      };

      es.onerror = () => {
        es.close();
        setStatus("disconnected");
        setPeerCount(0);
        retryCount++;
        const delay = Math.min(1000 * 2 ** retryCount, 30_000);
        retryTimeout = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      clearTimeout(retryTimeout);
      eventSourceRef.current?.close();
    };
  }, [roomCode]);

  // Debounced send on text change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
    sendTimerRef.current = setTimeout(() => sendText(val), 300);
  };

  // Send immediately on paste
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (!pasted) return;
    // Let React update state first, then send
    setTimeout(() => sendText(pasted), 0);
  };

  const copyToClipboard = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clearText = () => {
    setText("");
    sendText("");
  };

  const statusLabel: Record<Status, string> = {
    connecting: "connecting...",
    connected: "connected",
    disconnected: "reconnecting...",
    error: "error",
  };

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}/r/${encodeURIComponent(roomCode)}`
    : "";

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <button className={styles.back} onClick={() => router.push("/")}>← back</button>
        <div className={styles.roomInfo}>
          <span className={`${styles.dot} ${styles[status]}`} />
          <span className={styles.roomCode}>{roomCode}</span>
          <span className={styles.statusText}>{statusLabel[status]}</span>
        </div>
        <div className={styles.meta}>
          {peerCount > 0 && <span className={styles.peer}>{peerCount} session</span>}
          {lastSync && (
            <span className={styles.sync}>
              {syncDir === "in" ? "↓ received" : syncDir === "out" ? "↑ sent" : `synced ${lastSync.toLocaleTimeString()}`}
            </span>
          )}
        </div>
      </header>

      <div className={styles.urlBar}>
        <span className={styles.urlText}>{fullUrl}</span>
        <button
          className={styles.urlCopy}
          onClick={async () => { await navigator.clipboard.writeText(fullUrl); }}
          title="Copy room URL"
        >
          copy url
        </button>
      </div>

      <div className={styles.editorWrap}>
        <textarea
          ref={textareaRef}
          className={styles.editor}
          value={text}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder={"Paste or type here...\n\nThis textarea is synced live across both machines.\nEverything is encrypted — the server only sees ciphertext."}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
        <div className={`${styles.syncFlash} ${syncDir ? styles.flashActive : ""} ${syncDir === "in" ? styles.flashIn : styles.flashOut}`} />
      </div>

      <footer className={styles.footer}>
        <button className={styles.action} onClick={copyToClipboard} disabled={!text}>
          {copied ? "✓ copied" : "copy"}
        </button>
        <button className={styles.action} onClick={clearText} disabled={!text}>
          clear
        </button>
        <span className={styles.enc}>⚿ AES-256-GCM · e2e encrypted</span>
      </footer>
    </main>
  );
}
