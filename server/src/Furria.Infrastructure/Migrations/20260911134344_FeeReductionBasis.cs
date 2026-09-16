using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FeeReductionBasis : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "ck_fee_reduction_basis",
                table: "fee_reduction",
                sql: "basis IN ('Minor', 'School', 'Apprenticeship', 'Studies')"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_fee_reduction_basis",
                table: "fee_reduction"
            );
        }
    }
}
