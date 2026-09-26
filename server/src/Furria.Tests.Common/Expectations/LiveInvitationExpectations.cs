using Furria.Core.Identity;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Furria.Tests.Common.Expectations;

public sealed class LiveInvitationExpectations
{
    private readonly Expected _expected;
    private readonly int _personId;

    internal LiveInvitationExpectations(Expected expected, int personId)
    {
        _expected = expected;
        _personId = personId;
    }

    public Expected ToBeIssuedAs(
        InvitationChannel channel,
        bool isReminder,
        int issuedByPersonId
    ) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var invitation = await dbContext
                    .Invitations.AsNoTracking()
                    .SingleAsync(
                        row =>
                            row.PersonId == _personId
                            && row.RedeemedAt == null
                            && row.VoidedAt == null,
                        ct
                    );

                Assert.Equal(InvitationPurpose.Onboarding, invitation.Purpose);
                Assert.Equal(channel, invitation.Channel);
                Assert.Equal(isReminder, invitation.IsReminder);
                Assert.Equal(issuedByPersonId, invitation.IssuedByPersonId);
            }
        );

    public Expected ToBeSelfRequested() =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var invitation = await dbContext
                    .Invitations.AsNoTracking()
                    .SingleAsync(
                        row =>
                            row.PersonId == _personId
                            && row.RedeemedAt == null
                            && row.VoidedAt == null,
                        ct
                    );

                Assert.Equal(InvitationPurpose.Onboarding, invitation.Purpose);
                Assert.Equal(InvitationChannel.Request, invitation.Channel);
                Assert.False(invitation.IsReminder);
                Assert.Null(invitation.IssuedByPersonId);
            }
        );

    public Expected ToBeRecoveryIssuedBy(int issuedByPersonId) =>
        _expected.Enqueue(
            async (dbContext, ct) =>
            {
                var invitation = await dbContext
                    .Invitations.AsNoTracking()
                    .SingleAsync(
                        row =>
                            row.PersonId == _personId
                            && row.RedeemedAt == null
                            && row.VoidedAt == null,
                        ct
                    );

                Assert.Equal(InvitationPurpose.Recovery, invitation.Purpose);
                Assert.Equal(InvitationChannel.InPerson, invitation.Channel);
                Assert.Equal(issuedByPersonId, invitation.IssuedByPersonId);
            }
        );
}
