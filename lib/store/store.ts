/**
 * *Configures Redux Toolkit.
 * It uses redux-persist to save specific slices of data (like publicApiSlice) to the browser's localStorage (via storage.ts).
 *
 */

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { storage } from "./storage";

import authReducer from "./authSlice";
// Import 11 Slices
import { authApiSlice } from "./authApiSlice";
import { publicApiSlice } from "./publicApiSlice";
import { userApiSlice } from "./userApiSlice";
import { adminApiSlice } from "./adminApiSlice";
import { hrApiSlice } from "./hrApiSlice";
import { notificationsApiSlice } from "./notificationsApiSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { atsApiSlice } from "./atsApiSlice";
import { auditLogApiSlice } from "./auditLogApiSlice";
import { ticketApiSlice } from "./ticketApiSlice";
import { departmentApiSlice } from "./departmentApiSlice";
import { publishingAutomationApiSlice } from "./publishingAutomationApiSlice";

// 1. Chỉ Persist các dữ liệu ít thay đổi (Public/Learning Data)
const publicPersistConfig = { key: "publicApi", storage };
// const learningPersistConfig = { key: "learningApi", storage };

// 2. Gom Reducers
const appReducer = combineReducers({
  auth: authReducer,
  [authApiSlice.reducerPath]: authApiSlice.reducer, // Không persist Auth
  [userApiSlice.reducerPath]: userApiSlice.reducer,

  // Persisted Slices
  [publicApiSlice.reducerPath]: persistReducer(
    publicPersistConfig,
    publicApiSlice.reducer,
  ),
  [adminApiSlice.reducerPath]: adminApiSlice.reducer,
  [hrApiSlice.reducerPath]: hrApiSlice.reducer,
  [notificationsApiSlice.reducerPath]: notificationsApiSlice.reducer,
  [atsApiSlice.reducerPath]: atsApiSlice.reducer,
  [auditLogApiSlice.reducerPath]: auditLogApiSlice.reducer,
  [ticketApiSlice.reducerPath]: ticketApiSlice.reducer,
  [departmentApiSlice.reducerPath]: departmentApiSlice.reducer,
  [publishingAutomationApiSlice.reducerPath]: publishingAutomationApiSlice.reducer,
});

// THUẬT TOÁN QUÉT SẠCH RÁC: NẾU LOGOUT -> HỦY TOÀN BỘ STATE
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/logout") {
    // Chỉ giữ lại state của publicApi (bao gồm cả _persist nội bộ của nó)
    // Mọi thứ khác (auth, hrApi, atsApi...) sẽ bị ép thành undefined
    // để Redux tự động reset về initialState
    state = {
      [publicApiSlice.reducerPath]: state?.[publicApiSlice.reducerPath],
    };
  }
  return appReducer(state, action);
};

// 3. Configure Store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(
      authApiSlice.middleware,
      publicApiSlice.middleware,
      userApiSlice.middleware,
      adminApiSlice.middleware,
      hrApiSlice.middleware,
      notificationsApiSlice.middleware,
      atsApiSlice.middleware,
      auditLogApiSlice.middleware,
      ticketApiSlice.middleware,
      departmentApiSlice.middleware,
      publishingAutomationApiSlice.middleware,
    ),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
setupListeners(store.dispatch);
