using System.Net;
using FastEndpoints;
using Furria.Api.Endpoints.Intakes;
using Furria.Tests.Common.Builder;
using Furria.Tests.Common.Fixtures;
using Xunit;
using static Furria.Api.Tests.Intakes.IntakeScene;
using static Furria.Api.Tests.Intakes.IntakeSubmissions;

namespace Furria.Api.Tests.Intakes;

public sealed class ResolveIntakeTests : IClassFixture<ApiTestFixture>
{
    private const string Existing = "existing";
    private const string Stranger = "stranger";
    private const string ExistingEmail = "lena.neu@example.org";

    private readonly ApiTestFixture _fixture;

    public ResolveIntakeTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_FillOnlyHerGapsAndAffiliateHer_When_TheDeciderRecognisesHer()
    {
        var ct = TestContext.Current.CancellationToken;
        var memberFrom = _fixture.Today.AddDays(-3);
        var ctx = await ParkedAsync(memberFrom, ct);
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");
        var existingId = ctx.Identity.People.IdOf(Existing);
        var manager = await ctx.Identity.ClientForAsync(Manager, ct);

        var (response, resolved) = await ResolveAsync(manager, intakeId, existingId);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(existingId, resolved.PersonId);
        await ctx
            .Expected.Intake(intakeId)
            .ToBeCompletedAs(existingId)
            .Person(existingId)
            .ToHaveName("Magdalena", "Altmann")
            .Person(existingId)
            .ToHaveContactDetails(
                ExistingEmail,
                "0170 1234567",
                "Hauptstraße 1",
                "12345",
                "Narrenstadt"
            )
            .MembershipsOfPerson(existingId)
            .ToHaveOnlyOneFromIntake(intakeId, memberFrom)
            .Person(existingId)
            .ToBeInGroupsSince(_fixture.Today, ctx.Groups.Groups.IdOf(Guard))
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_StartHerNewMembershipAfterTheFormerOne_When_TheyWouldOverlap()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ParkedAsync(
            _fixture.Today.AddDays(-10),
            ct,
            identity =>
                identity.AddMembership(
                    "former",
                    Existing,
                    _fixture.Today.AddYears(-3),
                    _fixture.Today.AddDays(-1)
                )
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");
        var existingId = ctx.Identity.People.IdOf(Existing);
        var manager = await ctx.Identity.ClientForAsync(Manager, ct);

        await ResolveAsync(manager, intakeId, existingId);

        await ctx
            .Expected.MembershipsOfPerson(existingId)
            .ToHaveCount(2)
            .MembershipsOfPerson(existingId)
            .ToHaveOneFromIntakeSince(intakeId, _fixture.Today)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheChoice_When_ThePersonIsNoCandidate()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ParkedAsync(
            _fixture.Today,
            ct,
            identity => identity.AddPerson(Stranger, "Erika", "Fremd")
        );
        var intakeId = ctx.Intakes.Intakes.IdOf("fresh");
        var manager = await ctx.Identity.ClientForAsync(Manager, ct);

        var (response, _) = await ResolveAsync(
            manager,
            intakeId,
            ctx.Identity.People.IdOf(Stranger)
        );

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        await ctx
            .Expected.Intake(intakeId)
            .ToAwaitReviewHolding("Lena", "Neu", ExistingEmail)
            .AssertAsync(ct);
    }

    [Fact]
    public async Task Should_Forbid_When_AGroupAdminResolvesAnIntakeSheDidNotStart()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await ParkedAsync(_fixture.Today, ct);
        var trainer = await ctx.Identity.ClientForAsync(GuardTrainer, ct);

        var (response, _) = await ResolveAsync(
            trainer,
            ctx.Intakes.Intakes.IdOf("fresh"),
            personId: null
        );

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    private async Task<SeededContext> ParkedAsync(
        DateOnly? memberFrom,
        CancellationToken ct,
        Action<IdentitySeedBuilder>? identity = null
    )
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
            {
                With(intakes =>
                    intakes.AddIntake("fresh", Manager, memberFrom, groupAliases: [Guard])
                )(builder);
                builder.Identity(people =>
                {
                    people
                        .AddPerson(Existing, "Magdalena", "Altmann")
                        .AddPersonContact(Existing, email: ExistingEmail);
                    identity?.Invoke(people);
                });
            },
            ct
        );
        var token = ctx.Intakes.LinkTokens.IdOf("fresh");

        var (response, _) = await _fixture
            .CreateClient()
            .POSTAsync<SubmitIntake, SubmitIntakeRequest, SubmitIntakeResponse>(Adult(token));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return ctx;
    }

    private static Task<TestResult<ResolveIntakeResponse>> ResolveAsync(
        HttpClient client,
        int intakeId,
        int? personId
    ) =>
        client.POSTAsync<ResolveIntake, ResolveIntakeRequest, ResolveIntakeResponse>(
            new() { IntakeId = intakeId, PersonId = personId }
        );
}
