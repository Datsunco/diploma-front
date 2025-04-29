import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NetworkState {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingActions: Array<{
    type: string;
    payload: any;
    meta: any;
    timestamp: string;
  }>;
}

const initialState: NetworkState = {
  isOnline: navigator.onLine,
  lastSyncTime: null,
  pendingActions: [],
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    
    setLastSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },
    
    addPendingAction: (
      state,
      action: PayloadAction<{
        type: string;
        payload: any;
        meta: any;
      }>
    ) => {
      state.pendingActions.push({
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    
    removePendingAction: (state, action: PayloadAction<number>) => {
      state.pendingActions.splice(action.payload, 1);
    },
    
    clearPendingActions: (state) => {
      state.pendingActions = [];
    },
  },
});

export const {
  setOnlineStatus,
  setLastSyncTime,
  addPendingAction,
  removePendingAction,
  clearPendingActions,
} = networkSlice.actions;

export default networkSlice.reducer;