namespace ReservasApi.Dtos.Response
{
    public class ReservaResponse
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string NombreLocal { get; set; } = string.Empty;
        public DateTime Fecha { get; set; }
        public string Hora { get; set; } = string.Empty;
        public int NumeroPersonas { get; set; }
        public string EstadoReserva { get; set; } = string.Empty;
        public DateTime FechaCreacion { get; set; }
        public DateTime? FechaActualizacion { get; set; }
        public List<EntregableResponse> Entregables { get; set; } = new List<EntregableResponse>();
        
        // Información del usuario/foodie
        public string? NombreUsuario { get; set; }
        public string? CorreoUsuario { get; set; }
        
        // Propiedades calculadas para el frontend
        public bool PuedeCancelar 
        { 
            get 
            {
                if (EstadoReserva != "Por Ir") return false;
                var fechaHoraVisita = Fecha.Add(TimeSpan.Parse(Hora));
                return DateTime.Now < fechaHoraVisita;
            } 
        }
        
        public bool EnPeriodoEntrega 
        { 
            get 
            {
                if (EstadoReserva != "Por Ir") return false;
                var fechaHoraVisita = Fecha.Add(TimeSpan.Parse(Hora));
                var ahora = DateTime.Now;
                var limitePlazo = fechaHoraVisita.AddHours(48);
                return ahora > fechaHoraVisita && ahora <= limitePlazo;
            } 
        }
        
        public bool DebeMarcarFaltaGrave 
        { 
            get 
            {
                if (EstadoReserva != "Por Ir") return false;
                var fechaHoraVisita = Fecha.Add(TimeSpan.Parse(Hora));
                var limitePlazo = fechaHoraVisita.AddHours(48);
                return DateTime.Now > limitePlazo && !Entregables.Any();
            } 
        }
        
        public double HorasRestantesParaEntrega 
        { 
            get 
            {
                if (EstadoReserva != "Por Ir") return 0;
                var fechaHoraVisita = Fecha.Add(TimeSpan.Parse(Hora));
                var limitePlazo = fechaHoraVisita.AddHours(48);
                var ahora = DateTime.Now;
                if (ahora < fechaHoraVisita) return 48; // Aún no es hora de la visita
                if (ahora > limitePlazo) return 0; // Ya expiró
                return (limitePlazo - ahora).TotalHours;
            } 
        }
    }
}