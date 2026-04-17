using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventManagementApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSeederAndModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Event_User_PlannerId",
                table: "Event");

            migrationBuilder.DropForeignKey(
                name: "FK_EventRegistration_User_AttendeeId",
                table: "EventRegistration");

            migrationBuilder.DropIndex(
                name: "IX_EventVendor_EventId_VendorId",
                table: "EventVendor");

            migrationBuilder.DropIndex(
                name: "IX_EventService_EventId_ProviderId",
                table: "EventService");

            migrationBuilder.DropIndex(
                name: "IX_EventRegistration_EventId_AttendeeId",
                table: "EventRegistration");

            migrationBuilder.CreateIndex(
                name: "IX_EventVendor_EventId",
                table: "EventVendor",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventService_EventId",
                table: "EventService",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventRegistration_EventId",
                table: "EventRegistration",
                column: "EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_Event_User_PlannerId",
                table: "Event",
                column: "PlannerId",
                principalTable: "User",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EventRegistration_User_AttendeeId",
                table: "EventRegistration",
                column: "AttendeeId",
                principalTable: "User",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Event_User_PlannerId",
                table: "Event");

            migrationBuilder.DropForeignKey(
                name: "FK_EventRegistration_User_AttendeeId",
                table: "EventRegistration");

            migrationBuilder.DropIndex(
                name: "IX_EventVendor_EventId",
                table: "EventVendor");

            migrationBuilder.DropIndex(
                name: "IX_EventService_EventId",
                table: "EventService");

            migrationBuilder.DropIndex(
                name: "IX_EventRegistration_EventId",
                table: "EventRegistration");

            migrationBuilder.CreateIndex(
                name: "IX_EventVendor_EventId_VendorId",
                table: "EventVendor",
                columns: new[] { "EventId", "VendorId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventService_EventId_ProviderId",
                table: "EventService",
                columns: new[] { "EventId", "ProviderId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventRegistration_EventId_AttendeeId",
                table: "EventRegistration",
                columns: new[] { "EventId", "AttendeeId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Event_User_PlannerId",
                table: "Event",
                column: "PlannerId",
                principalTable: "User",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EventRegistration_User_AttendeeId",
                table: "EventRegistration",
                column: "AttendeeId",
                principalTable: "User",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
