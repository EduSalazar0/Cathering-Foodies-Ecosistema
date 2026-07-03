using Microsoft.EntityFrameworkCore;
using FormularioFoodieApi.Models;

namespace FormularioFoodieApi.Data
{
    public class FormularioFoodieDbContext : DbContext
    {
        public FormularioFoodieDbContext(DbContextOptions<FormularioFoodieDbContext> options)
            : base(options)
        {
        }

        public DbSet<FormularioFoodie> FormulariosFoodie { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración de la entidad FormularioFoodie
            modelBuilder.Entity<FormularioFoodie>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasIndex(e => e.UsuarioId)
                      .IsUnique()
                      .HasDatabaseName("IX_FormulariosFoodie_UsuarioId");

                entity.HasIndex(e => e.Email)
                      .HasDatabaseName("IX_FormulariosFoodie_Email");

                entity.HasIndex(e => e.UsuarioInstagram)
                      .HasDatabaseName("IX_FormulariosFoodie_UsuarioInstagram");

                entity.HasIndex(e => e.UsuarioTikTok)
                      .HasDatabaseName("IX_FormulariosFoodie_UsuarioTikTok");

                entity.Property(e => e.FechaAplicacion)
                      .HasDefaultValueSql("CURRENT_TIMESTAMP");

                entity.Property(e => e.Estado)
                      .HasDefaultValue("pendiente");

                entity.Property(e => e.Activo)
                      .HasDefaultValue(true);
            });
        }
    }
}