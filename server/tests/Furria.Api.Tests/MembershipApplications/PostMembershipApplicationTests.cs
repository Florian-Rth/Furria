using System.Net;
using Furria.Api.Endpoints.MembershipApplications;
using Furria.Api.RateLimiting;
using Furria.Api.Tests.Auth;
using Furria.Core.Club;
using Furria.Tests.Common.Expectations;
using Furria.Tests.Common.Fixtures;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Furria.Api.Tests.MembershipApplications;

public sealed class PostMembershipApplicationTests : IClassFixture<ApiTestFixture>
{
    private readonly ApiTestFixture _fixture;

    public PostMembershipApplicationTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_MailTheApplicantALinkToConfirm_When_ASolvedApplicationArrives()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var email = InvitationSteps.UniqueContactEmail("mia");

        var response = await MembershipApplicationSteps.ApplyAsync(
            _fixture.CreateClient(),
            MembershipApplicationSteps.ApplicationOf(email, _fixture.Today.AddYears(-30))
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("{}", await response.Content.ReadAsStringAsync(ct));
        var mail = await _fixture.Mailbox.SingleMailToAsync(email, ct);
        Assert.Equal(MembershipApplicationSteps.ConfirmationSubject, mail.Subject);
        Assert.StartsWith(
            MembershipApplicationSteps.ConfirmationLinkPrefix,
            mail.Link(),
            StringComparison.Ordinal
        );
        Assert.StartsWith("Hallo Mia,", mail.Text, StringComparison.Ordinal);
    }

    [Fact]
    public async Task Should_RepeatNothingTypedButTheFirstName_When_TheConfirmationIsMailed()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var email = InvitationSteps.UniqueContactEmail("mia");
        var application = MembershipApplicationSteps.ApplicationOf(
            email,
            new DateOnly(1994, 7, 23)
        );

        await MembershipApplicationSteps.ApplyAsync(_fixture.CreateClient(), application);

        var mail = await _fixture.Mailbox.SingleMailToAsync(email, ct);
        foreach (
            var typed in new[]
            {
                application.LastName,
                application.Street,
                application.PostalCode,
                application.City,
                application.Phone!,
                "1994",
                "23.07.",
            }
        )
        {
            Assert.DoesNotContain(typed, mail.Text, StringComparison.Ordinal);
            Assert.DoesNotContain(typed, mail.Html, StringComparison.Ordinal);
        }
    }

    [Fact]
    public async Task Should_RefuseTheApplication_When_TheApplicantIsYoungerThanTheAgeOfConsent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var email = InvitationSteps.UniqueContactEmail("ida");

        var response = await MembershipApplicationSteps.ApplyAsync(
            _fixture.CreateClient(),
            MembershipApplicationSteps.ApplicationOf(
                email,
                _fixture.Today.AddYears(-ClubRecord.DefaultAgeOfConsent).AddDays(1)
            )
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.MembershipApplications().ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AcceptTheApplication_When_TheApplicantReachesTheAgeOfConsentToday()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var email = InvitationSteps.UniqueContactEmail("ida");

        var response = await MembershipApplicationSteps.ApplyAsync(
            _fixture.CreateClient(),
            MembershipApplicationSteps.ApplicationOf(
                email,
                _fixture.Today.AddYears(-ClubRecord.DefaultAgeOfConsent)
            )
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected.MembershipApplications().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_RefuseTheApplication_When_TheApplicantIsYoungerThanTheClubsOwnAgeOfConsent()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Club(club => club.SetClubRecord(ageOfConsent: 18)),
            ct
        );

        var response = await MembershipApplicationSteps.ApplyAsync(
            _fixture.CreateClient(),
            MembershipApplicationSteps.ApplicationOf(
                InvitationSteps.UniqueContactEmail("ida"),
                _fixture.Today.AddYears(-17)
            )
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.MembershipApplications().ToHaveCount(0).AssertAsync(ct);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(-121)]
    public async Task Should_RefuseTheApplication_When_TheBirthDateCannotBeRight(int yearsFromNow)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var response = await MembershipApplicationSteps.ApplyAsync(
            _fixture.CreateClient(),
            MembershipApplicationSteps.ApplicationOf(
                InvitationSteps.UniqueContactEmail("ida"),
                _fixture.Today.AddYears(yearsFromNow)
            )
        );

        Assert.Equal(HttpStatusCode.UnprocessableEntity, response.StatusCode);
        await ctx.Expected.MembershipApplications().ToHaveCount(0).AssertAsync(ct);
    }

    [Theory]
    [InlineData("")]
    [InlineData("bm8tY2hhbGxlbmdl")]
    public async Task Should_RefuseTheApplication_When_NoSolvedChallengeComesWithIt(string altcha)
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var response = await MembershipApplicationSteps.SubmitAsync(
            _fixture.CreateClient(),
            AdultApplication() with
            {
                Altcha = altcha,
            }
        );

        await AssertAltchaRefusedAsync(response, ctx.Expected, ct);
    }

    [Fact]
    public async Task Should_RefuseTheApplication_When_TheSolutionDoesNotSolveTheChallenge()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var challenge = await MembershipApplicationSteps.ChallengeAsync(client);
        var wrong = new AltchaSolution(0, new string('0', 64));

        var response = await MembershipApplicationSteps.SubmitAsync(
            client,
            AdultApplication() with
            {
                Altcha = AltchaSolver.PayloadOf(challenge, wrong),
            }
        );

        await AssertAltchaRefusedAsync(response, ctx.Expected, ct);
    }

    [Fact]
    public async Task Should_RefuseTheApplication_When_TheChallengeWasAlteredBeforeSolving()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var issued = await MembershipApplicationSteps.ChallengeAsync(client);
        var altered = issued with
        {
            Parameters = issued.Parameters with { ExpiresAt = issued.Parameters.ExpiresAt + 3_600 },
        };

        var response = await MembershipApplicationSteps.SubmitAsync(
            client,
            AdultApplication() with
            {
                Altcha = AltchaSolver.PayloadOf(altered, AltchaSolver.Solve(issued)),
            }
        );

        await AssertAltchaRefusedAsync(response, ctx.Expected, ct);
    }

    [Fact]
    public async Task Should_RefuseTheApplication_When_TheChallengeExpiredBeforeItArrived()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var altcha = await MembershipApplicationSteps.SolvedAltchaAsync(client);

        await _fixture.AtLaterTimeAsync(
            TimeSpan.FromMinutes(10) + TimeSpan.FromSeconds(1),
            async () =>
            {
                var response = await MembershipApplicationSteps.SubmitAsync(
                    client,
                    AdultApplication() with
                    {
                        Altcha = altcha,
                    }
                );

                await AssertAltchaRefusedAsync(response, ctx.Expected, ct);
            }
        );
    }

    [Fact]
    public async Task Should_RefuseTheApplication_When_ASolvedChallengeIsSentASecondTime()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var altcha = await MembershipApplicationSteps.SolvedAltchaAsync(client);
        var first = await MembershipApplicationSteps.SubmitAsync(
            client,
            AdultApplication() with
            {
                Altcha = altcha,
            }
        );
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        var second = await MembershipApplicationSteps.SubmitAsync(
            client,
            AdultApplication() with
            {
                Altcha = altcha,
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
        Assert.Equal(["altcha"], await MembershipApplicationSteps.RefusedFieldsAsync(second, ct));
        await ctx.Expected.MembershipApplications().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_NameEveryRefusedField_When_TheFormArrivesIncomplete()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();

        var response = await MembershipApplicationSteps.SubmitAsync(
            client,
            AdultApplication() with
            {
                FirstName = " ",
                PostalCode = "5066",
                Email = "mia-at-web.test",
                Phone = "kein Telefon",
                ConsentAccepted = false,
                Altcha = await MembershipApplicationSteps.SolvedAltchaAsync(client),
            }
        );

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(
            ["consentAccepted", "email", "firstName", "phone", "postalCode"],
            await MembershipApplicationSteps.RefusedFieldsAsync(response, ct)
        );
        await ctx.Expected.MembershipApplications().ToHaveCount(0).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_AcceptTheApplication_When_ItGivesNoPhone()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);

        var response = await MembershipApplicationSteps.ApplyAsync(
            _fixture.CreateClient(),
            AdultApplication() with
            {
                Phone = null,
            }
        );

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await ctx.Expected.MembershipApplications().ToHaveCount(1).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnTooManyRequests_When_OneAddressAppliesTooOften()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(ct);
        var client = _fixture.CreateClient();
        var application = AdultApplication();
        var permits = new SignedOutRateLimitOptions().PermitsPerAddress;

        for (var attempt = 0; attempt < permits; attempt++)
            Assert.Equal(
                HttpStatusCode.OK,
                (await MembershipApplicationSteps.ApplyAsync(client, application)).StatusCode
            );
        var refused = await MembershipApplicationSteps.ApplyAsync(client, application);

        Assert.Equal(HttpStatusCode.TooManyRequests, refused.StatusCode);
        await ctx.Expected.MembershipApplications().ToHaveCount(permits).AssertAsync(ct);
    }

    [Fact]
    public async Task Should_ReturnTooManyRequests_When_OneVisitorSendsMoreThanThePerIpLimit()
    {
        await _fixture.BuildAsync(TestContext.Current.CancellationToken);
        await using var host = _fixture.HostWithSettings(
            new Dictionary<string, string>
            {
                [
                    $"{SignedOutRateLimitOptions.SectionName}:{nameof(SignedOutRateLimitOptions.PermitsPerIp)}"
                ] = "2",
            }
        );
        var client = host.CreateClientForwardedFor("203.0.113.50");

        var applied = await MembershipApplicationSteps.ApplyAsync(client, AdultApplication());
        var refused = await MembershipApplicationSteps.SubmitAsync(
            client,
            AdultApplication() with
            {
                Altcha = "bm8tY2hhbGxlbmdl",
            }
        );

        Assert.Equal(HttpStatusCode.OK, applied.StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, refused.StatusCode);
    }

    [Fact]
    public async Task Should_KeepNoApplication_When_ItsConfirmationMailCannotBeStored()
    {
        var ct = TestContext.Current.CancellationToken;
        await using var host = await _fixture.HostOnOwnDatabaseAsync(
            new Dictionary<string, string>(),
            ct
        );
        var client = host.CreateClient();
        var application = AdultApplication() with
        {
            Altcha = await MembershipApplicationSteps.SolvedAltchaAsync(client),
        };

        await using (await RejectedWrites.OnAsync(host, "outbox_mail", ct))
        {
            var refused = await MembershipApplicationSteps.SubmitAsync(client, application);
            Assert.Equal(HttpStatusCode.InternalServerError, refused.StatusCode);
        }

        await new Expected(host.Services.GetRequiredService<IServiceScopeFactory>())
            .MembershipApplications()
            .ToHaveCount(0)
            .AssertAsync(ct);
    }

    private PostMembershipApplicationRequest AdultApplication() =>
        MembershipApplicationSteps.ApplicationOf(
            InvitationSteps.UniqueContactEmail("mia"),
            _fixture.Today.AddYears(-30)
        );

    private static async Task AssertAltchaRefusedAsync(
        HttpResponseMessage response,
        Expected expected,
        CancellationToken ct
    )
    {
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(["altcha"], await MembershipApplicationSteps.RefusedFieldsAsync(response, ct));
        await expected.MembershipApplications().ToHaveCount(0).AssertAsync(ct);
    }
}
