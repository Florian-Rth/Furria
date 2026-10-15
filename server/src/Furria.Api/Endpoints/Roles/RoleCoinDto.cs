using System.Diagnostics.Contracts;
using FluentValidation;
using Furria.Core.Club;
using Furria.Core.Groups;
using Furria.Core.Roles;

namespace Furria.Api.Endpoints.Roles;

public sealed record RoleCoinDto
{
    public required ClubIcon Icon { get; init; }

    public required GroupTone Tone { get; init; }

    [Pure]
    public static RoleCoinDto? From(RoleCoin? coin) =>
        coin is null ? null : new() { Icon = coin.Icon, Tone = coin.Tone };

    [Pure]
    public static RoleCoin? ToCoin(RoleCoinDto? coin) =>
        coin is null ? null : new(coin.Icon, coin.Tone);
}

public sealed class RoleCoinValidator : AbstractValidator<RoleCoinDto>
{
    public RoleCoinValidator()
    {
        RuleFor(coin => coin.Icon).IsInEnum();
        RuleFor(coin => coin.Tone).IsInEnum();
    }
}
