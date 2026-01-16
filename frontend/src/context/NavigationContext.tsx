import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  ReactNode,
} from "react";

interface NavigationContextType {
  backAction: (() => void) | null;
  backLabel: string | null;
  setBackAction: (action: (() => void) | null, label?: string | null) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [backAction, setBackActionState] = useState<(() => void) | null>(null);
  const [backLabel, setBackLabel] = useState<string | null>(null);

  const setBackAction = useCallback(
    (action: (() => void) | null, label: string | null = "Quay lại") => {
      setBackActionState((prevAction) => {
        if (prevAction === action) return prevAction;
        return action;
      });
      setBackLabel((prevLabel) => {
        if (prevLabel === label) return prevLabel;
        return label;
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      backAction,
      backLabel,
      setBackAction,
    }),
    [backAction, backLabel, setBackAction]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

/**
 * Custom hook to set the header back button for a component
 */
export const useSetBackAction = (
  action: (() => void) | null,
  label: string | null = "Quay lại"
) => {
  const { setBackAction } = useNavigation();

  React.useEffect(() => {
    setBackAction(action, label);
    return () => setBackAction(null);
  }, [action, label, setBackAction]);
};
