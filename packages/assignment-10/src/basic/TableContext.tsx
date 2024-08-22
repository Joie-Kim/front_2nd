import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
} from 'react';
import { Schedule } from './types';
import dummyScheduleMap from './dummyScheduleMap';

type TableState = {
  schedules: Schedule[];
};

type TableAction = {
  type: 'UPDATE_SCHEDULES';
  payload: { schedules: Schedule[] };
};

const TableContext = createContext<
  | {
      tableId: string;
      schedules: Schedule[];
      updateSchedule: (schedules: Schedule[]) => void;
    }
  | undefined
>(undefined);

const tableReducer = (state: TableState, action: TableAction): TableState => {
  switch (action.type) {
    case 'UPDATE_SCHEDULES':
      return { ...state, schedules: action.payload.schedules };
    default:
      return state;
  }
};

export const useTableContext = () => {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTableContext must be used within a TableProvider');
  }
  return context;
};

export const TableProvider = ({
  tableId,
  children,
}: {
  tableId: string;
  children: React.ReactNode;
}) => {
  const initialSchedules =
    dummyScheduleMap[tableId as keyof typeof dummyScheduleMap] || [];
  const [state, dispatch] = useReducer(tableReducer, {
    schedules: initialSchedules,
  });

  const updateSchedule = useCallback((schedules: Schedule[]) => {
    dispatch({ type: 'UPDATE_SCHEDULES', payload: { schedules } });
  }, []);

  const value = useMemo(
    () => ({
      tableId,
      schedules: state.schedules,
      updateSchedule,
    }),
    [tableId, state.schedules, updateSchedule]
  );

  return (
    <TableContext.Provider value={value}>{children}</TableContext.Provider>
  );
};
