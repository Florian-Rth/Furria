namespace Furria.Infrastructure.Mail;

public sealed record PersonErasureNoticeMailContent
{
    public required int PersonId { get; init; }

    public required string To { get; init; }

    public required string FirstName { get; init; }

    public required string? ClubName { get; init; }

    public required string? ClubEmail { get; init; }

    public required string? ClubPhone { get; init; }

    public required string? ClubStreet { get; init; }

    public required string? ClubZip { get; init; }

    public required string? ClubCity { get; init; }
}
