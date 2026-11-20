namespace Furria.Infrastructure.Intakes;

internal sealed record IntakePush(int IntakeId, string NewcomerName, IntakePushKind Kind);
