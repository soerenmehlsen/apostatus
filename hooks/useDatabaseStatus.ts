"use client";

import { useEffect, useState } from "react";

type DatabaseStatus = "starting" | "running";

// This hook checks the status of the database by pinging the databasestatus endpoint every 10 seconds.
export const useDatabaseStatus = (enabled: boolean) => {
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>("starting");

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const pingDatabase = async () => {
      try {
        // Ping the databasestatus endpoint to check if the database is connected.
        const response = await fetch("/api/databasestatus", {
          cache: "no-store",
        });
        const payload = await response.json();
        const connected = Boolean(payload?.data?.connected);

        // If the component is unmounted, it will not update the state.
        if (!mounted) {
          return;
        }

        // If the database is connected, the status is set to "running" and clear the interval.
        if (connected) {
          setDatabaseStatus("running");
          if (intervalId) {
            clearInterval(intervalId);
          }
          return;
        }

        // If the database is not connected, the status is set to "starting".
        setDatabaseStatus("starting");
      } catch {
        // If there is an error, the status is set to "starting".
        if (mounted) {
          setDatabaseStatus("starting");
        }
      }
    };

    // Ping the database when the hook is mounted, and set a interval to ping every 10 seconds.
    void pingDatabase();
    intervalId = setInterval(() => {
      void pingDatabase();
    }, 10000);

    // Clear the interval when the component is unmounted.
    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [enabled]);

  return {
    databaseStatus,
  };
};
