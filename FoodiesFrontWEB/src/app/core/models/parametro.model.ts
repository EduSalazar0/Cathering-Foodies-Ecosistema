export interface Parametro {
    id: number;
    codigo: string;
    descripcion: string;
    valorEntero: number | null;
    valorDecimal: number | null;
    valorFecha: Date | null;
    valorTexto: string | null;
    valorBoolean: boolean | null;
    estaActivo: boolean;
}

export interface ParametroRequest {
    codigo: string;
    descripcion: string;
    valorEntero: number | null;
    valorDecimal: number | null;
    valorFecha: Date | null;
    valorTexto: string | null;
    valorBoolean: boolean | null;
    estaActivo: boolean;
}