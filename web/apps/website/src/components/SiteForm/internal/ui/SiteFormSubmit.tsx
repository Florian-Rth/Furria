import Button from '@mui/material/Button';
import type { FC, PropsWithChildren } from 'react';
import { useFormContext } from 'react-hook-form';

interface SiteFormSubmitProps extends PropsWithChildren {
  loading: boolean;
}

export const SiteFormSubmit: FC<SiteFormSubmitProps> = ({ loading, children }) => {
  const { formState } = useFormContext();

  return (
    <Button
      type="submit"
      variant="contained"
      color="primary"
      size="large"
      fullWidth
      loading={loading}
      disabled={!formState.isValid}
    >
      {children}
    </Button>
  );
};
