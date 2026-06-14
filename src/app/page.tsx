"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateRoomCode } from "@/lib/words";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");

  const createRoom = () => {
    const code = generateRoomCode();
    router.push(`/r/${encodeURIComponent(code)}`);
  };

  const joinRoom = () => {
    const code = manualCode.trim().toLowerCase();
    if (!code) { setError("Enter a room code"); return; }
    router.push(`/r/${encodeURIComponent(code)}`);
  };

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoSymbol}>⬡</span>
          <span className={styles.logoText}>ClipBridge</span>
        </div>

        <p className={styles.tagline}>
          Paste on one machine.<br />Appears on the other.<br />
          <span className={styles.muted}>End-to-end encrypted. No history. No accounts.</span>
        </p>

        <div className={styles.divider} />

        <button className={styles.primary} onClick={createRoom}>
          Generate room code →
        </button>

        <div className={styles.orRow}>
          <span className={styles.orLine} />
          <span className={styles.orText}>or join existing</span>
          <span className={styles.orLine} />
        </div>

        <div className={styles.joinRow}>
          <input
            className={styles.input}
            placeholder="swift-bolt-42"
            value={manualCode}
            onChange={(e) => { setManualCode(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            spellCheck={false}
          />
          <button className={styles.secondary} onClick={joinRoom}>Join</button>
        </div>
        {error && <p className={styles.error}>{error}</p>}

        <p className={styles.footer}>
          Open the same room on both machines · text syncs instantly
        </p>
      </div>
    </main>
  );
}
