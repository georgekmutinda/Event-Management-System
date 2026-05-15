using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventManagementApi.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentCodeEventCascade : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentCodes_Event_EventId",
                table: "PaymentCodes");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentCodes_Event_EventId",
                table: "PaymentCodes",
                column: "EventId",
                principalTable: "Event",
                principalColumn: "EventId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PaymentCodes_Event_EventId",
                table: "PaymentCodes");

            migrationBuilder.AddForeignKey(
                name: "FK_PaymentCodes_Event_EventId",
                table: "PaymentCodes",
                column: "EventId",
                principalTable: "Event",
                principalColumn: "EventId");
        }
    }
}
