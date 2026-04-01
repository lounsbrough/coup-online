import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

type LoadingTextFieldProps = TextFieldProps & {
  loading?: boolean;
}

export default function LoadingTextField({ loading, ...props }: Readonly<LoadingTextFieldProps>) {
  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <TextField
        {...props}
        disabled={loading || props.disabled}
      />
      {loading && (
        <LinearProgress
          sx={(theme) => ({
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderBottomLeftRadius: props.variant === 'outlined' ? theme.shape.borderRadius : 0,
            borderBottomRightRadius: props.variant === 'outlined' ? theme.shape.borderRadius : 0,
            height: 2
          })}
        />
      )}
    </Box>
  );
}
