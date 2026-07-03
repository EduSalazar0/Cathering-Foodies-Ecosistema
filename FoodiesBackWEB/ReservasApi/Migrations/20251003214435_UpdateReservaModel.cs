using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ReservasApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateReservaModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Reservas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    NombreLocal = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Hora = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    NumeroPersonas = table.Column<int>(type: "integer", nullable: false),
                    EstadoReserva = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Por Ir"),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reservas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Entregables",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReservaId = table.Column<int>(type: "integer", nullable: false),
                    EnlaceTikTok = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    EnlaceInstagram = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CantidadGastada = table.Column<decimal>(type: "numeric(10,2)", nullable: false, defaultValue: 0m),
                    FechaCreacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    FechaActualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entregables", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entregables_Reservas_ReservaId",
                        column: x => x.ReservaId,
                        principalTable: "Reservas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Entregables_ReservaId",
                table: "Entregables",
                column: "ReservaId");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_EstadoReserva",
                table: "Reservas",
                column: "EstadoReserva");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_Fecha",
                table: "Reservas",
                column: "Fecha");

            migrationBuilder.CreateIndex(
                name: "IX_Reservas_UsuarioId",
                table: "Reservas",
                column: "UsuarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Entregables");

            migrationBuilder.DropTable(
                name: "Reservas");
        }
    }
}
