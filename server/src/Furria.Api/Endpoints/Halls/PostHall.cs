using FastEndpoints;
using FluentValidation;
using Furria.Api.Authorization;
using Furria.Api.Results;
using Furria.Application.Halls;
using Furria.Infrastructure.Halls;

namespace Furria.Api.Endpoints.Halls;

public sealed class PostHall : Endpoint<PostHallRequest, PostHallResponse>
{
    private readonly HallService _hallService;

    public PostHall(HallService hallService)
    {
        _hallService = hallService;
    }

    public override void Configure()
    {
        Post("halls");
        Definition.RequireAnyPermission(HallKeys.Planners);
    }

    public override async Task HandleAsync(PostHallRequest req, CancellationToken ct)
    {
        var result = await _hallService.CreateHallAsync(req.VenueId, req.Name, ct);
        if (!result.IsSuccess)
        {
            await HttpContext.Response.SendFailureAsync(result.Error, ct);
            return;
        }

        await Send.OkAsync(new PostHallResponse { HallId = result.Value }, cancellation: ct);
    }
}

public sealed record PostHallRequest
{
    public required int VenueId { get; init; }

    public required string Name { get; init; }
}

public sealed class PostHallValidator : Validator<PostHallRequest>
{
    public PostHallValidator()
    {
        RuleFor(request => request.VenueId).GreaterThan(0);
        RuleFor(request => request.Name)
            .Cascade(CascadeMode.Stop)
            .NotNull()
            .Must(name => !string.IsNullOrWhiteSpace(name))
            .WithMessage("Der Saal braucht einen Namen.")
            .MaximumLength(HallLimits.NameLength);
    }
}

public sealed record PostHallResponse
{
    public required int HallId { get; init; }
}
