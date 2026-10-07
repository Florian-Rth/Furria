using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Authorization;
using Furria.Application.Registry;
using Furria.Infrastructure.Registry;

namespace Furria.Api.Endpoints.Persons;

public sealed class PutPersonArchived : Endpoint<PutPersonArchivedRequest>
{
    private readonly PersonArchiveService _personArchiveService;

    public PutPersonArchived(PersonArchiveService personArchiveService)
    {
        _personArchiveService = personArchiveService;
    }

    public override void Configure()
    {
        Put("manage/persons/{personId}/archived");
        Definition.RequirePermission(FurriaPermissions.PersonsManage);
    }

    public override async Task HandleAsync(PutPersonArchivedRequest req, CancellationToken ct)
    {
        var result = await _personArchiveService.SetArchivedAsync(
            new PersonArchiveCommand
            {
                PersonId = req.PersonId,
                IsArchived = req.IsArchived,
                ActorPersonId = User.PersonId(),
            },
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

public sealed record PutPersonArchivedRequest
{
    [RouteParam]
    public required int PersonId { get; init; }

    public required bool IsArchived { get; init; }
}

public sealed class PutPersonArchivedValidator : Validator<PutPersonArchivedRequest>
{
    public PutPersonArchivedValidator()
    {
        RuleFor(request => request.PersonId).GreaterThan(0);
    }
}
