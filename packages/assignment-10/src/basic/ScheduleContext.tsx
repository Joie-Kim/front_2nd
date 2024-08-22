import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import dummyScheduleMap from './dummyScheduleMap';

type ScheduleState = {
  tableIds: string[];
};

type ScheduleAction =
  | { type: 'ADD_TABLE'; payload: { tableId: string } }
  | { type: 'REMOVE_TABLE'; payload: { tableId: string } };

const ScheduleContext = createContext<
  | {
      tableIds: string[];
      addTable: (tableId: string) => void;
      removeTable: (tableId: string) => void;
    }
  | undefined
>(undefined);

const scheduleReducer = (
  state: ScheduleState,
  action: ScheduleAction
): ScheduleState => {
  switch (action.type) {
    case 'ADD_TABLE':
      return {
        ...state,
        tableIds: [...state.tableIds, action.payload.tableId],
      };
    case 'REMOVE_TABLE':
      return {
        ...state,
        tableIds: state.tableIds.filter((id) => id !== action.payload.tableId),
      };
    default:
      return state;
  }
};

export const useScheduleContext = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error(
      'useScheduleContext must be used within a ScheduleProvider'
    );
  }
  return context;
};

export const ScheduleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(scheduleReducer, {
    tableIds: Object.keys(dummyScheduleMap),
  });

  const addTable = useCallback((tableId: string) => {
    dispatch({ type: 'ADD_TABLE', payload: { tableId } });
  }, []);

  const removeTable = useCallback((tableId: string) => {
    dispatch({ type: 'REMOVE_TABLE', payload: { tableId } });
  }, []);

  const value = useMemo(
    () => ({
      tableIds: state.tableIds,
      addTable,
      removeTable,
    }),
    [state.tableIds, addTable, removeTable]
  );

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};
