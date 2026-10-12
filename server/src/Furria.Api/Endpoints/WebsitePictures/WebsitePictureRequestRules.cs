using FluentValidation;
using Furria.Core.Media;
using Furria.Core.Website;

namespace Furria.Api.Endpoints.WebsitePictures;

internal static class WebsitePictureRequestRules
{
    private const string SlotKeyMessage =
        "A slot key is dotted lower camel case words, at most 80 characters.";
    private const string PositionMessage = "A position runs from 1 to 24.";
    private const string AspectMessage = "The aspect is a width-to-height ratio from 0.25 to 4.";
    private const string CropMessage = "The crop must be a cut of the picture.";

    internal static IRuleBuilderOptions<T, string> SlotKey<T>(this IRuleBuilder<T, string> rule) =>
        rule.Must(PictureSlotPosition.IsWellFormedSlotKey).WithMessage(SlotKeyMessage);

    internal static IRuleBuilderOptions<T, int> Position<T>(this IRuleBuilder<T, int> rule) =>
        rule.Must(PictureSlotPosition.IsWellFormedPosition).WithMessage(PositionMessage);

    internal static IRuleBuilderOptions<T, double> Aspect<T>(this IRuleBuilder<T, double> rule) =>
        rule.Must(WebsitePicture.IsWellFormedAspect).WithMessage(AspectMessage);

    internal static IRuleBuilderOptions<T, PictureCrop> CutOfThePicture<T>(
        this IRuleBuilder<T, PictureCrop> rule
    ) => rule.Must(crop => crop.IsCutOfThePicture()).WithMessage(CropMessage);
}
