using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Furria.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CalendarEntryKindsPlainTrainingTrip : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_kind",
                table: "calendar_entry"
            );

            migrationBuilder.Sql(
                """
                WITH closing (session_year, closes_on) AS (
                    VALUES
                        (2025, DATE '2026-02-19'),
                        (2026, DATE '2027-02-11'),
                        (2027, DATE '2028-03-02'),
                        (2028, DATE '2029-02-15'),
                        (2029, DATE '2030-03-07'),
                        (2030, DATE '2031-02-27'),
                        (2031, DATE '2032-02-12'),
                        (2032, DATE '2033-03-03'),
                        (2033, DATE '2034-02-23'),
                        (2034, DATE '2035-02-08'),
                        (2035, DATE '2036-02-28'),
                        (2036, DATE '2037-02-19'),
                        (2037, DATE '2038-03-11'),
                        (2038, DATE '2039-02-24'),
                        (2039, DATE '2040-02-16'),
                        (2040, DATE '2041-03-07')
                ),
                upcoming AS (
                    SELECT
                        entry.id,
                        entry.owner_group_id,
                        (entry.starts_at AT TIME ZONE 'Europe/Berlin')::date AS day
                    FROM calendar_entry entry
                    WHERE entry.kind = 'Training'
                      AND entry.starts_at >= now()
                      AND NOT entry.asks_for_response
                ),
                in_session AS (
                    SELECT
                        upcoming.id,
                        upcoming.owner_group_id,
                        upcoming.day,
                        CASE
                            WHEN extract(month FROM upcoming.day) > 11
                              OR (extract(month FROM upcoming.day) = 11 AND extract(day FROM upcoming.day) >= 11)
                            THEN extract(year FROM upcoming.day)::int
                            ELSE extract(year FROM upcoming.day)::int - 1
                        END AS session_year
                    FROM upcoming
                ),
                cast_asking AS (
                    SELECT
                        in_session.id,
                        in_session.owner_group_id,
                        CASE
                            WHEN in_session.day >= closing.closes_on THEN in_session.session_year + 1
                            ELSE in_session.session_year
                        END AS cast_session_year
                    FROM in_session
                    JOIN closing ON closing.session_year = in_session.session_year
                )
                UPDATE calendar_entry
                SET asks_for_response = true
                FROM cast_asking
                WHERE calendar_entry.id = cast_asking.id
                  AND EXISTS (
                      SELECT 1
                      FROM act
                      WHERE act.archived_at IS NULL
                        AND act.session_year = cast_asking.cast_session_year
                        AND (
                            act.group_id = cast_asking.owner_group_id
                            OR act.group_id IN (
                                SELECT link.group_id
                                FROM calendar_entry_group link
                                WHERE link.calendar_entry_id = cast_asking.id
                            )
                        )
                  );
                """
            );

            migrationBuilder.Sql(
                """
                UPDATE calendar_entry
                SET kind = CASE kind
                    WHEN 'Rehearsal' THEN 'Plain'
                    WHEN 'Meeting' THEN 'Plain'
                    WHEN 'Party' THEN 'Plain'
                    WHEN 'Other' THEN 'Plain'
                    WHEN 'Performance' THEN 'Trip'
                    ELSE kind
                END
                WHERE kind IN ('Rehearsal', 'Meeting', 'Party', 'Other', 'Performance');
                """
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_kind",
                table: "calendar_entry",
                sql: "kind IN ('Plain', 'Training', 'Trip', 'Event')"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "ck_calendar_entry_kind",
                table: "calendar_entry"
            );

            migrationBuilder.Sql(
                """
                UPDATE calendar_entry
                SET kind = CASE kind WHEN 'Plain' THEN 'Other' ELSE 'Performance' END
                WHERE kind IN ('Plain', 'Trip');
                """
            );

            migrationBuilder.AddCheckConstraint(
                name: "ck_calendar_entry_kind",
                table: "calendar_entry",
                sql: "kind IN ('Training', 'Rehearsal', 'Performance', 'Meeting', 'Party', 'Other', 'Event')"
            );
        }
    }
}
