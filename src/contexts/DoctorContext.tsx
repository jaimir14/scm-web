import { createContext, useContext, useState, type ReactNode } from "react";
import { type Profesional, getProfesionalByUsuario } from "@/data/mockDoctorData";

interface DoctorContextType {
  profesional: Profesional | null;
  login: (username: string) => boolean;
  logout: () => void;
}

const DoctorContext = createContext<DoctorContextType | null>(null);

export function DoctorProvider({ children }: { children: ReactNode }) {
  const [profesional, setProfesional] = useState<Profesional | null>(null);

  const login = (username: string): boolean => {
    const prof = getProfesionalByUsuario(username);
    if (prof) {
      setProfesional(prof);
      return true;
    }
    return false;
  };

  const logout = () => setProfesional(null);

  return (
    <DoctorContext.Provider value={{ profesional, login, logout }}>
      {children}
    </DoctorContext.Provider>
  );
}

export function useDoctor() {
  const ctx = useContext(DoctorContext);
  if (!ctx) throw new Error("useDoctor must be used within DoctorProvider");
  return ctx;
}
