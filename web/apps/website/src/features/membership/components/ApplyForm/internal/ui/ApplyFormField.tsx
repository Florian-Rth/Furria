import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { SiteForm } from '@/components/SiteForm/SiteForm';
import type { SiteFormTextFieldType } from '@/components/SiteForm/site-form-types';
import type { MembershipApplicationForm } from '@/features/membership/schemas';

type TextFieldName = Exclude<
  {
    [Key in keyof MembershipApplicationForm]: MembershipApplicationForm[Key] extends string
      ? Key
      : never;
  }[keyof MembershipApplicationForm],
  'honeypot'
>;

interface ApplyFormFieldProps {
  name: TextFieldName;
  label: string;
  required: boolean;
  type?: SiteFormTextFieldType;
  autoComplete?: string;
}

export const ApplyFormField: FC<ApplyFormFieldProps> = ({
  name,
  label,
  required,
  type,
  autoComplete,
}) => {
  const { register, formState } = useFormContext<MembershipApplicationForm>();

  return (
    <SiteForm.TextField
      registration={register(name)}
      error={formState.errors[name]}
      label={label}
      required={required}
      type={type}
      autoComplete={autoComplete}
    />
  );
};
