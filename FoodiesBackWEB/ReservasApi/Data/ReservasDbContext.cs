using Microsoft.EntityFrameworkCore;
using ReservasApi.Models;

namespace ReservasApi.Data
{
    public class ReservasDbContext : DbContext
    {
        public ReservasDbContext(DbContextOptions<ReservasDbContext> options) : base(options)
        {
        }

        public DbSet<Reserva> Reservas { get; set; } = null!;
        public DbSet<Entregable> Entregables { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de Reserva
            modelBuilder.Entity<Reserva>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.NombreLocal).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Hora).IsRequired().HasMaxLength(10);
                entity.Property(e => e.EstadoReserva).IsRequired().HasMaxLength(50).HasDefaultValue("Por Ir");
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.HasIndex(e => e.UsuarioId);
                entity.HasIndex(e => e.Fecha);
                entity.HasIndex(e => e.EstadoReserva);
            });

            // Configuración de Entregable
            modelBuilder.Entity<Entregable>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.EnlaceTikTok).HasMaxLength(500);
                entity.Property(e => e.EnlaceInstagram).HasMaxLength(500);
                entity.Property(e => e.CantidadGastada).HasColumnType("decimal(10,2)").HasDefaultValue(0);
                entity.Property(e => e.FechaCreacion).HasDefaultValueSql("CURRENT_TIMESTAMP");

                // Relación con Reserva
                entity.HasOne(e => e.Reserva)
                      .WithMany(r => r.Entregables)
                      .HasForeignKey(e => e.ReservaId)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}