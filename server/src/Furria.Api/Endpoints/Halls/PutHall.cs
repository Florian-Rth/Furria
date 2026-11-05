using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.Halls;

public sealed class PutHall : Endpoint<PutHallRequest, PutHallResponse>
{
    private readonly HallService _hallService;

    public PutHall(HallService hallService)
    {
        _hallService = hallService;
    }

    public override void Configure()
    {
        Put("halls/{hallId}");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(PutHallRequest req, CancellationToken ct)
    {
        var result = await _hallService.SaveHallAsync(
            new SaveHallCommand
            {
                HallId = req.HallId,
                Name = req.Name,
                Document = req.Document.ToDocument(),
                Version = req.Version,
            },
            ct
        );
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(new PutHallResponse { Version = result.Value }, cancellation: ct);
    }
}

public sealed record PutHallRequest
{
    [RouteParam]
    public required int HallId { get; init; }

    public required string Name { get; init; }

    public required HallDocumentDto Document { get; init; }

    public required int Version { get; init; }
}

public sealed class PutHallValidator : Validator<PutHallRequest>
{
    public PutHallValidator()
    {
        RuleFor(request => request.HallId).GreaterThan(0);
        RuleFor(request => request.Name)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(name => !string.IsNullOrWhiteSpace(name))
            .WithMessage("Der Saal braucht einen Namen.")
            .MaximumLength(HallLimits.NameLength);
        RuleFor(request => request.Document)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .SetValidator(new HallDocumentValidator());
        RuleFor(request => request.Version).GreaterThan(0);
    }
}

public sealed record PutHallResponse
{
    public required int Version { get; init; }
}
