import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { DeadCompany } from '../types';
import { getIncenseData, addIncense as storageAddIncense, getSubmissions, addSubmission } from '../services/storage';

interface AppState {
  incenseData: Record<string, number>;
  submissions: DeadCompany[];
}

type AppAction =
  | { type: 'ADD_INCENSE'; companyId: string }
  | { type: 'ADD_SUBMISSION'; company: DeadCompany }
  | { type: 'LOAD_DATA' };

const AppContext = createContext<{
  state: AppState;
  addIncense: (companyId: string) => void;
  submitCompany: (company: DeadCompany) => void;
} | null>(null);

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_INCENSE': {
      const newCount = (state.incenseData[action.companyId] || 0) + 1;
      storageAddIncense(action.companyId);
      return {
        ...state,
        incenseData: { ...state.incenseData, [action.companyId]: newCount }
      };
    }
    case 'ADD_SUBMISSION': {
      const newSubmissions = [...state.submissions, action.company];
      addSubmission(action.company);
      return { ...state, submissions: newSubmissions };
    }
    case 'LOAD_DATA':
      return {
        incenseData: getIncenseData(),
        submissions: getSubmissions<DeadCompany>(),
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    incenseData: {},
    submissions: [],
  });

  useEffect(() => {
    dispatch({ type: 'LOAD_DATA' });
  }, []);

  const addIncense = (companyId: string) => {
    dispatch({ type: 'ADD_INCENSE', companyId });
  };

  const submitCompany = (company: DeadCompany) => {
    dispatch({ type: 'ADD_SUBMISSION', company });
  };

  return (
    <AppContext.Provider value={{ state, addIncense, submitCompany }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
