using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FormularioFoodieApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "formularios_foodie",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    usuario_id = table.Column<int>(type: "integer", nullable: false),
                    nombre_completo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    numero_personal = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    fecha_nacimiento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    genero = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    pais = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ciudad = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    frecuencia_contenido = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    usuario_instagram = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    seguidores_instagram = table.Column<int>(type: "integer", nullable: false),
                    cuenta_publica = table.Column<bool>(type: "boolean", nullable: false),
                    usuario_tiktok = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    seguidores_tiktok = table.Column<int>(type: "integer", nullable: false),
                    sobre_ti = table.Column<string>(type: "text", nullable: false),
                    acepta_beneficios = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    acepta_terminos = table.Column<bool>(type: "boolean", nullable: false),
                    fecha_aplicacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "CURRENT_TIMESTAMP"),
                    fecha_actualizacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false, defaultValue: "pendiente"),
                    comentarios = table.Column<string>(type: "text", nullable: true),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_formularios_foodie", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FormulariosFoodie_Email",
                table: "formularios_foodie",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "IX_FormulariosFoodie_UsuarioId",
                table: "formularios_foodie",
                column: "usuario_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FormulariosFoodie_UsuarioInstagram",
                table: "formularios_foodie",
                column: "usuario_instagram");

            migrationBuilder.CreateIndex(
                name: "IX_FormulariosFoodie_UsuarioTikTok",
                table: "formularios_foodie",
                column: "usuario_tiktok");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "formularios_foodie");
        }
    }
}
