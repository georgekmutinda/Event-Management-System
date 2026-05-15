using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventManagementApi.Migrations
{
    /// <inheritdoc />
    public partial class AddCascadeDeletes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invitation_Event_EventId",
                table: "Invitation");

            migrationBuilder.AddForeignKey(
                name: "FK_Invitation_Event_EventId",
                table: "Invitation",
                column: "EventId",
                principalTable: "Event",
                principalColumn: "EventId",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Invitation_Event_EventId",
                table: "Invitation");

            migrationBuilder.AddForeignKey(
                name: "FK_Invitation_Event_EventId",
                table: "Invitation",
                column: "EventId",
                principalTable: "Event",
                principalColumn: "EventId");
        }
    }
}
