using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace EventManagementApi.Migrations
{
    /// <inheritdoc />
    public partial class SyncPendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "TicketPrice",
                table: "Event",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "BroadcastMessages",
                columns: table => new
                {
                    MessageId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Text = table.Column<string>(type: "text", nullable: false),
                    SentBy = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BroadcastMessages", x => x.MessageId);
                });

            migrationBuilder.CreateTable(
                name: "PaymentCodes",
                columns: table => new
                {
                    PaymentCodeId = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    EventName = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    EventId = table.Column<int>(type: "integer", nullable: true),
                    IsRedeemed = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    RedeemedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PaymentId = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PaymentCodes", x => x.PaymentCodeId);
                    table.ForeignKey(
                        name: "FK_PaymentCodes_Event_EventId",
                        column: x => x.EventId,
                        principalTable: "Event",
                        principalColumn: "EventId");
                    table.ForeignKey(
                        name: "FK_PaymentCodes_Payment_PaymentId",
                        column: x => x.PaymentId,
                        principalTable: "Payment",
                        principalColumn: "PaymentId",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PaymentCodes_Code",
                table: "PaymentCodes",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PaymentCodes_EventId",
                table: "PaymentCodes",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_PaymentCodes_PaymentId",
                table: "PaymentCodes",
                column: "PaymentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BroadcastMessages");

            migrationBuilder.DropTable(
                name: "PaymentCodes");

            migrationBuilder.DropColumn(
                name: "TicketPrice",
                table: "Event");
        }
    }
}
