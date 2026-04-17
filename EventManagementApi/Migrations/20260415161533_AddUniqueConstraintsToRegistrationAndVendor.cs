using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventManagementApi.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueConstraintsToRegistrationAndVendor : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EventVendor_EventId",
                table: "EventVendor");

            migrationBuilder.DropIndex(
                name: "IX_EventRegistration_EventId",
                table: "EventRegistration");

            migrationBuilder.CreateIndex(
                name: "IX_EventVendor_EventId_VendorId",
                table: "EventVendor",
                columns: new[] { "EventId", "VendorId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EventRegistration_EventId_AttendeeId",
                table: "EventRegistration",
                columns: new[] { "EventId", "AttendeeId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EventVendor_EventId_VendorId",
                table: "EventVendor");

            migrationBuilder.DropIndex(
                name: "IX_EventRegistration_EventId_AttendeeId",
                table: "EventRegistration");

            migrationBuilder.CreateIndex(
                name: "IX_EventVendor_EventId",
                table: "EventVendor",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_EventRegistration_EventId",
                table: "EventRegistration",
                column: "EventId");
        }
    }
}
