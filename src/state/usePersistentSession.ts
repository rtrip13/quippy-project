import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useReducer, useRef, useState } from "react";
import { AppState } from "react-native";
import { createInitialSessionState } from "./initial";
import { sessionReducer } from "./reducer";
import { sessionActions } from "./actions";
import { createSessionWriter, type SaveStatus } from "./sessionWriter";
import { readSessionSnapshot } from "./sessionReader";

const STORAGE_KEY = "unlabeled:session:v1";

export function usePersistentSession() {
  const [state, dispatch] = useReducer(
    sessionReducer,
    undefined,
    createInitialSessionState,
  );
  const [hydrated, setHydrated] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const writer = useRef<ReturnType<typeof createSessionWriter> | null>(null);

  useEffect(() => {
    const activeWriter = createSessionWriter(
      (serialized) => AsyncStorage.setItem(STORAGE_KEY, serialized),
      setSaveStatus,
    );
    writer.current = activeWriter;
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState !== "active") void activeWriter.flush();
    });
    return () => {
      subscription.remove();
      activeWriter.dispose();
      writer.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoadError(false);
    void readSessionSnapshot(() => AsyncStorage.getItem(STORAGE_KEY)).then(
      (result) => {
        if (!active) return;
        if (result.status === "error") {
          setLoadError(true);
          return;
        }
        if (result.data !== null)
          dispatch(sessionActions.hydrated(result.data));
        setHydrated(true);
      },
    );
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  useEffect(() => {
    if (!hydrated) return;
    writer.current?.enqueue({
      revision: state.revision,
      serialized: JSON.stringify(state),
    });
  }, [hydrated, state]);

  return {
    state,
    dispatch,
    hydrated,
    saveStatus,
    loadError,
    retryLoad: () => setLoadAttempt((attempt) => attempt + 1),
  };
}
