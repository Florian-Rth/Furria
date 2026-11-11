using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Core.GroupMatcher;
using Furria.Infrastructure.Authorization;
using Furria.Infrastructure.GroupMatcher;

namespace Furria.Api.Endpoints.GroupMatcher;

public sealed class PutAdmissionAges : Endpoint<PutAdmissionAgesRequest>
{
    private readonly GroupMatcherService _groupMatcherService;
    private readonly PermissionAuthorizer _authorizer;

    public PutAdmissionAges(
        GroupMatcherService groupMatcherService,
        PermissionAuthorizer authorizer
    )
    {
        _groupMatcherService = groupMatcherService;
        _authorizer = authorizer;
    }

    public override void Configure()
    {
        Put("groups/{groupId}/group-matcher/admission-ages");
    }

    public override async Task HandleAsync(PutAdmissionAgesRequest req, CancellationToken ct)
    {
        var accountId = User.AccountId();
        if (accountId is null)
        {
            await Send.UnauthorizedAsync(ct);
            return;
        }

        if (!await _authorizer.CanAdministerGroupAsync(accountId.Value, req.GroupId, ct))
        {
            await Send.ForbiddenAsync(ct);
            return;
        }

        var result = await _groupMatcherService.SetAdmissionAgesAsync(
            req.GroupId,
            req.AdmissionAges,
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.NoContentAsync(ct);
    }
}

public sealed record PutAdmissionAgesRequest
{
    [RouteParam]
    public required int GroupId { get; init; }

    public required IReadOnlyList<AdmissionAgeBand> AdmissionAges { get; init; }
}

public sealed class PutAdmissionAgesValidator : Validator<PutAdmissionAgesRequest>
{
    public PutAdmissionAgesValidator()
    {
        RuleFor(request => request.GroupId).GreaterThan(0);
        RuleFor(request => request.AdmissionAges).NotNull();
        RuleForEach(request => request.AdmissionAges).IsInEnum();
    }
}
