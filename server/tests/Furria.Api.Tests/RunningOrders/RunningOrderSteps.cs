using System.Net.Http.Json;
using FastEndpoints;
using Furria.Api.Endpoints.Acts;
using Furria.Api.Endpoints.RunningOrders;
using Furria.Core.RunningOrders;
using Xunit;

namespace Furria.Api.Tests.RunningOrders;

internal static class RunningOrderSteps
{
    internal static async Task<int> CreateActAsync(
        HttpClient client,
        string name,
        int? groupId = null,
        ActKind? kind = null,
        IReadOnlyList<int>? added = null,
        IReadOnlyList<int>? removed = null,
        IReadOnlyList<ActWishDataDto>? wishes = null,
        int? sessionYear = null
    )
    {
        var (response, result) = await client.POSTAsync<PostAct, PostActRequest, PostActResponse>(
            new()
            {
                Name = name,
                GroupId = groupId,
                Kind = kind,
                SessionYear = sessionYear,
                AddedPersonIds = added ?? [],
                RemovedPersonIds = removed ?? [],
                Wishes = wishes ?? [],
            }
        );
        response.EnsureSuccessStatusCode();

        return result.ActId;
    }

    internal static Task<TestResult<PutRunningOrderResponse>> SaveAsync(
        HttpClient client,
        int eventId,
        int? version,
        IReadOnlyList<RunningOrderLineDataDto> lines,
        IReadOnlyList<RunningOrderRuleDataDto>? rules = null,
        IReadOnlyList<int>? suspendedActWishIds = null
    ) =>
        client.PUTAsync<PutRunningOrder, PutRunningOrderRequest, PutRunningOrderResponse>(
            new()
            {
                EventId = eventId,
                Version = version,
                Lines = lines,
                Rules = rules ?? [],
                SuspendedActWishIds = suspendedActWishIds ?? [],
            }
        );

    internal static async Task<PutRunningOrderResponse> SavedAsync(
        HttpClient client,
        int eventId,
        int? version,
        IReadOnlyList<RunningOrderLineDataDto> lines,
        IReadOnlyList<RunningOrderRuleDataDto>? rules = null,
        IReadOnlyList<int>? suspendedActWishIds = null
    )
    {
        var (response, result) = await SaveAsync(
            client,
            eventId,
            version,
            lines,
            rules,
            suspendedActWishIds
        );
        response.EnsureSuccessStatusCode();

        return result;
    }

    internal static Task<TestResult<PutRunningOrderConfirmationResponse>> ConfirmAsync(
        HttpClient client,
        int eventId,
        bool confirmed
    ) =>
        client.PUTAsync<
            PutRunningOrderConfirmation,
            PutRunningOrderConfirmationRequest,
            PutRunningOrderConfirmationResponse
        >(new() { EventId = eventId, Confirmed = confirmed });

    internal static RunningOrderLineDataDto Line(
        int actId,
        int? position,
        bool pinned = false,
        int? blockKey = null
    ) =>
        new()
        {
            ActId = actId,
            Position = position,
            Pinned = pinned,
            BlockKey = blockKey,
        };

    internal static RunningOrderRuleDataDto Rule(
        RunningOrderRuleKind kind,
        int actId,
        int? otherActId = null,
        RuleStrength strength = RuleStrength.Must
    ) =>
        new()
        {
            Kind = kind,
            Strength = strength,
            ActId = actId,
            OtherActId = otherActId,
            ActKind = null,
        };

    internal static ActWishDataDto Wish(RunningOrderRuleKind kind, RuleStrength strength) =>
        new() { Kind = kind, Strength = strength };

    internal static async Task<string> RefusalOfAsync(HttpResponseMessage response) =>
        Assert.Single(
            (
                await response.Content.ReadFromJsonAsync<ErrorResponse>(
                    TestContext.Current.CancellationToken
                )
            )!
                .Errors.Single()
                .Value
        );
}
