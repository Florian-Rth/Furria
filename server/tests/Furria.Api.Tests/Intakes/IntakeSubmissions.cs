using Furria.Api.Endpoints.Intakes;
using Furria.Infrastructure.Persistence;
using Furria.Tests.Common.Fixtures;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Furria.Api.Tests.Intakes;

internal static class IntakeSubmissions
{
    internal static readonly DateOnly AdultBirthDate = new(1998, 6, 3);

    internal static SubmitIntakeRequest Adult(
        string token,
        string? email = "lena.neu@example.org"
    ) =>
        new()
        {
            Token = token,
            FirstName = "Lena",
            LastName = "Neu",
            BirthDate = AdultBirthDate,
            Street = "Hauptstraße 1",
            Zip = "12345",
            City = "Narrenstadt",
            Phone = "0170 1234567",
            Email = email,
            ContactVisibleToMembers = true,
        };

    internal static async Task<int> MadePersonIdAsync(
        ApiTestFixture fixture,
        int intakeId,
        CancellationToken ct
    )
    {
        await using var scope = fixture.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        return await dbContext
            .Intakes.AsNoTracking()
            .Where(intake => intake.Id == intakeId)
            .Select(intake => intake.PersonId!.Value)
            .SingleAsync(ct);
    }
}
