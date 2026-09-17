"use client";
/**
 * * The "use client" directive turns this provider into a Client Component. 
 * By wrapping {children} in RootLayout.tsx,
you are injecting Redux into the React tree. 
 * PersistGate ensures the UI doesn't render until Redux has successfully rehydrated its data from localStorage.
 * */ 
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "@/lib/store/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}