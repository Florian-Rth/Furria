using System.Diagnostics.Contracts;
using System.Globalization;
using System.Net;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using FastEndpoints;
using Furria.Api.Authorization;
using Furria.Application.Authorization;
using Furria.Tests.Common.Fixtures;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Routing.Patterns;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Furria.Api.Tests.Authorization;

[Collection("Api")]
public sealed class EndpointConventionTests
{
    private const string HarnessUrlCacheRoute = "_test_url_cache_";
    private const string AnyRouteValue = "1";
    private const string NonPositiveId = "0";

    private static readonly string UnknownId = int.MaxValue.ToString(CultureInfo.InvariantCulture);

    private static readonly JsonSerializerOptions BodyOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new UndefinedElementAsNull() },
    };

    private static readonly BindingFlags RequestProperties =
        BindingFlags.Public | BindingFlags.Instance | BindingFlags.IgnoreCase;

    private readonly ApiTestFixture _fixture;

    public EndpointConventionTests(ApiTestFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Should_ReturnUnauthorized_When_AnEndpointThatIsNotAnonymousIsCalledWithoutAToken()
    {
        var ct = TestContext.Current.CancellationToken;
        await _fixture.BuildAsync(ct);
        var anonymous = _fixture.CreateClient();

        var answered = await AnswersAsync(
            anonymous,
            Registered().Where(endpoint => !IsAnonymous(endpoint)),
            _ => AnyRouteValue,
            ct
        );

        AssertAllAnswered(HttpStatusCode.Unauthorized, answered);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_TheCallerHoldsEveryPermissionButTheDeclaredOne()
    {
        var ct = TestContext.Current.CancellationToken;
        var answered = new List<(string Route, HttpStatusCode Status)>();

        foreach (var gate in Registered().Where(IsPermissionGated).GroupBy(DeclaredKeysOf))
        {
            var ctx = await _fixture.BuildAsync(
                builder =>
                    builder
                        .Identity(identity => identity.AddAccount("lacking"))
                        .Roles(roles =>
                            roles.AddRoleWithHolder(
                                "everything-else",
                                "lacking-everything-else",
                                "Alles andere",
                                "lacking",
                                [.. FurriaPermissions.All.Except(gate.Key.Split(' '))]
                            )
                        ),
                ct
            );
            var lacking = await ctx.Identity.ClientForAsync("lacking", ct);

            answered.AddRange(await AnswersAsync(lacking, gate, _ => AnyRouteValue, ct));
        }

        Assert.NotEmpty(answered);
        AssertAllAnswered(HttpStatusCode.Forbidden, answered);
    }

    [Fact]
    public async Task Should_ReturnForbidden_When_AnUnaffiliatedCallerCallsAnAffiliationGatedEndpoint()
    {
        var ct = TestContext.Current.CancellationToken;
        var ctx = await _fixture.BuildAsync(
            builder => builder.Identity(identity => identity.AddAccount("stranger")),
            ct
        );
        var stranger = await ctx.Identity.ClientForAsync("stranger", ct);

        var answered = await AnswersAsync(
            stranger,
            Registered().Where(endpoint => Carries<AffiliationRequirement>(endpoint)),
            _ => AnyRouteValue,
            ct
        );

        Assert.NotEmpty(answered);
        AssertAllAnswered(HttpStatusCode.Forbidden, answered);
    }

    [Fact]
    public async Task Should_RejectTheRouteId_When_ItIsNotPositive()
    {
        var ct = TestContext.Current.CancellationToken;
        var caller = await AllPowerfulCallerAsync(ct);
        var unrejected = new List<string>();

        foreach (var endpoint in Registered())
        foreach (var idName in IdParametersOf(endpoint))
        {
            var response = await SendAsync(
                caller,
                endpoint,
                name => name == idName ? NonPositiveId : AnyRouteValue,
                ct
            );
            if (!await RejectsAsync(response, idName, ct))
                unrejected.Add($"{RouteOf(endpoint)} {{{idName}}} → {(int)response.StatusCode}");
        }

        Assert.Empty(unrejected);
    }

    [Fact]
    public async Task Should_ReturnNotFound_When_ABodilessEndpointIsCalledWithAnUnknownId()
    {
        var ct = TestContext.Current.CancellationToken;
        var caller = await AllPowerfulCallerAsync(ct);

        var answered = await AnswersAsync(
            caller,
            Registered().Where(IsProductEndpoint).Where(IsAddressedByIdsAlone),
            _ => UnknownId,
            ct
        );

        Assert.NotEmpty(answered);
        AssertAllAnswered(HttpStatusCode.NotFound, answered);
    }

    private async Task<HttpClient> AllPowerfulCallerAsync(CancellationToken ct)
    {
        var ctx = await _fixture.BuildAsync(
            builder =>
                builder
                    .Identity(identity =>
                        identity
                            .AddAccount("vorstand")
                            .AddMembership("vorstand-mitglied", "vorstand")
                    )
                    .Roles(roles =>
                        roles.AddRoleWithHolder(
                            "alles",
                            "vorstand-alles",
                            "Alles",
                            "vorstand",
                            [.. FurriaPermissions.All]
                        )
                    ),
            ct
        );

        return await ctx.Identity.ClientForAsync("vorstand", ct);
    }

    private IEnumerable<RouteEndpoint> Registered() =>
        _fixture
            .Services.GetRequiredService<EndpointDataSource>()
            .Endpoints.OfType<RouteEndpoint>()
            .Where(endpoint => RouteOf(endpoint) != HarnessUrlCacheRoute);

    private static async Task<List<(string Route, HttpStatusCode Status)>> AnswersAsync(
        HttpClient client,
        IEnumerable<RouteEndpoint> endpoints,
        Func<string, string> routeValueOf,
        CancellationToken ct
    )
    {
        var answered = new List<(string Route, HttpStatusCode Status)>();
        foreach (var endpoint in endpoints)
        {
            var response = await SendAsync(client, endpoint, routeValueOf, ct);
            answered.Add(($"{VerbOf(endpoint)} {RouteOf(endpoint)}", response.StatusCode));
        }

        return answered;
    }

    private static void AssertAllAnswered(
        HttpStatusCode expected,
        IEnumerable<(string Route, HttpStatusCode Status)> answered
    ) =>
        Assert.Empty(
            answered
                .Where(answer => answer.Status != expected)
                .Select(answer => $"{answer.Route} → {(int)answer.Status}")
        );

    private static async Task<bool> RejectsAsync(
        HttpResponseMessage response,
        string idName,
        CancellationToken ct
    )
    {
        if (response.StatusCode != HttpStatusCode.BadRequest)
            return false;

        using var problem = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct));
        return problem.RootElement.TryGetProperty("errors", out var errors)
            && errors
                .EnumerateObject()
                .Any(error => error.Name.Equals(idName, StringComparison.OrdinalIgnoreCase));
    }

    private static Task<HttpResponseMessage> SendAsync(
        HttpClient client,
        RouteEndpoint endpoint,
        Func<string, string> routeValueOf,
        CancellationToken ct
    )
    {
        var verb = VerbOf(endpoint);
        var request = new HttpRequestMessage(new HttpMethod(verb), UrlOf(endpoint, routeValueOf));
        if (verb != "GET")
            request.Content = new StringContent(
                EmptyBodyOf(RequestTypeOf(endpoint)),
                Encoding.UTF8,
                "application/json"
            );

        return client.SendAsync(request, ct);
    }

    [Pure]
    private static string UrlOf(RouteEndpoint endpoint, Func<string, string> routeValueOf) =>
        "/"
        + string.Join(
            '/',
            endpoint.RoutePattern.PathSegments.Select(segment =>
                string.Concat(segment.Parts.Select(part => TextOf(part, routeValueOf)))
            )
        );

    [Pure]
    private static string TextOf(RoutePatternPart part, Func<string, string> routeValueOf) =>
        part switch
        {
            RoutePatternParameterPart parameter => routeValueOf(parameter.Name),
            RoutePatternLiteralPart literal => literal.Content,
            RoutePatternSeparatorPart separator => separator.Content,
            _ => "",
        };

    [Pure]
    private static string EmptyBodyOf(Type requestType) =>
        requestType == typeof(EmptyRequest)
            ? "{}"
            : JsonSerializer.Serialize(
                RuntimeHelpers.GetUninitializedObject(requestType),
                requestType,
                BodyOptions
            );

    [Pure]
    private static bool IsAnonymous(RouteEndpoint endpoint) =>
        endpoint.Metadata.GetMetadata<IAllowAnonymous>() is not null;

    [Pure]
    private static bool IsPermissionGated(RouteEndpoint endpoint) =>
        Carries<PermissionRequirement>(endpoint) || Carries<AnyPermissionRequirement>(endpoint);

    [Pure]
    private static string DeclaredKeysOf(RouteEndpoint endpoint) =>
        endpoint.Metadata.GetMetadata<PermissionRequirement>() is { } requirement
            ? requirement.PermissionKey
            : string.Join(
                ' ',
                endpoint
                    .Metadata.GetMetadata<AnyPermissionRequirement>()!
                    .PermissionKeys.Order(StringComparer.Ordinal)
            );

    [Pure]
    private static bool Carries<TRequirement>(RouteEndpoint endpoint)
        where TRequirement : class => endpoint.Metadata.GetMetadata<TRequirement>() is not null;

    [Pure]
    private static bool IsProductEndpoint(RouteEndpoint endpoint) =>
        endpoint.Metadata.GetMetadata<EndpointDefinition>()!.EndpointType.Assembly
        == typeof(Program).Assembly;

    [Pure]
    private static bool IsAddressedByIdsAlone(RouteEndpoint endpoint)
    {
        var ids = IdParametersOf(endpoint);
        return ids.Count > 0
            && RequestTypeOf(endpoint)
                .GetProperties(RequestProperties)
                .All(property => ids.Contains(property.Name, StringComparer.OrdinalIgnoreCase));
    }

    [Pure]
    private static IReadOnlyList<string> IdParametersOf(RouteEndpoint endpoint) =>
        [
            .. endpoint
                .RoutePattern.Parameters.Select(parameter => parameter.Name)
                .Where(name =>
                    RequestTypeOf(endpoint).GetProperty(name, RequestProperties)?.PropertyType
                    == typeof(int)
                ),
        ];

    [Pure]
    private static Type RequestTypeOf(RouteEndpoint endpoint) =>
        endpoint.Metadata.GetMetadata<EndpointDefinition>()!.ReqDtoType;

    [Pure]
    private static string VerbOf(RouteEndpoint endpoint) =>
        endpoint.Metadata.GetMetadata<HttpMethodMetadata>()!.HttpMethods.Single();

    [Pure]
    private static string RouteOf(RouteEndpoint endpoint) => endpoint.RoutePattern.RawText ?? "";

    private sealed class UndefinedElementAsNull : JsonConverter<JsonElement>
    {
        public override JsonElement Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        ) => JsonElement.ParseValue(ref reader);

        public override void Write(
            Utf8JsonWriter writer,
            JsonElement value,
            JsonSerializerOptions options
        )
        {
            if (value.ValueKind == JsonValueKind.Undefined)
                writer.WriteNullValue();
            else
                value.WriteTo(writer);
        }
    }
}
