namespace Furria.Infrastructure.MembershipApplications;

public sealed record ApplicantKey(
    string Email,
    string FirstName,
    string LastName,
    DateOnly BirthDate
);
