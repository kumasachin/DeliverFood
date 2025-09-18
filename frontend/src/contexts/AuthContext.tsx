import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useEffect,
} from "react";
import { User, Role } from "../types/auth";
import { apiService } from "../services";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export type AuthAction =
  | { type: "AUTH_START" }
  | { type: "AUTH_SUCCESS"; payload: { user: User } }
  | { type: "AUTH_ERROR"; payload: { error: string } }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "AUTH_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case "AUTH_ERROR":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role?: Role
  ) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("userData");

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: "AUTH_SUCCESS", payload: { user } });
      } catch (error) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      }
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<void> => {
    dispatch({ type: "AUTH_START" });

    try {
      const loginResponse = await apiService.login({ email, password });
      apiService.setAuthToken(loginResponse.token);

      const user: User = {
        id: email,
        email,
        name: email.split("@")[0],
        role: loginResponse.role as Role,
        isActive: true,
      };

      localStorage.setItem("userData", JSON.stringify(user));
      dispatch({ type: "AUTH_SUCCESS", payload: { user } });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Invalid email or password";

      dispatch({
        type: "AUTH_ERROR",
        payload: { error: errorMessage },
      });
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: Role = "customer"
  ): Promise<void> => {
    dispatch({ type: "AUTH_START" });

    try {
      const registerResponse = await apiService.register({
        email,
        password,
        role: role as "customer" | "owner",
      });

      apiService.setAuthToken(registerResponse.token);

      const user: User = {
        id: registerResponse.uuid,
        email: registerResponse.email,
        name: name || email.split("@")[0],
        role: registerResponse.role as Role,
        isActive: true,
      };

      localStorage.setItem("userData", JSON.stringify(user));
      dispatch({ type: "AUTH_SUCCESS", payload: { user } });
    } catch (error: any) {
      dispatch({
        type: "AUTH_ERROR",
        payload: {
          error:
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Failed to create account",
        },
      });
    }
  };

  const logout = (): void => {
    apiService.clearAuthToken();
    dispatch({ type: "LOGOUT" });
    window.location.href = "/";
  };

  const clearError = (): void => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value: AuthContextType = {
    state,
    signIn,
    signUp,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
