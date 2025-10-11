import React, { useEffect, useState } from 'react';
import { Box, Stack, Button, useTheme } from '@mui/material';

export default function IndicatorLight({ tick }: { tick: number }): React.ReactElement {
  const [alertActive, setAlertActive] = useState(false);
  const theme = useTheme();

  // 收到 SSE 广播时变红
  useEffect(() => {
    if (tick > 0) {
      setAlertActive(true);
    }
  }, [tick]);

  const handleReset = () => setAlertActive(false);

  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      {/* 指示灯 */}
      <Box
        sx={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          bgcolor: alertActive ? '#ff4d4d' : '#4eff4e', // 更亮的红绿
          boxShadow: alertActive
            ? '0 0 10px 3px rgba(255, 80, 80, 0.7)'
            : '0 0 10px 3px rgba(80, 255, 80, 0.5)',
          border: '1px solid rgba(255,255,255,0.6)',
          transition: 'all 0.3s ease',
          animation: alertActive ? 'blink 1s infinite' : 'none',
          '@keyframes blink': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.4 },
          },
        }}
      />

      {/* 状态按钮 */}
      <Button
        size="small"
        variant="outlined"
        color={alertActive ? 'error' : 'inherit'}
        onClick={handleReset}
        disabled={!alertActive}
        sx={{
          minWidth: 80,
          fontWeight: 600,
          textTransform: 'none',
          color: alertActive ? theme.palette.error.light : theme.palette.common.white, // 白色文字
          borderColor: 'rgba(255,255,255,0.6)', // 按钮边框更浅
          '&.Mui-disabled': {
            borderColor: 'rgba(255,255,255,0.3)',
            color: 'rgba(255,255,255,0.5)',
          },
          '&:hover': {
            borderColor: 'rgba(255,255,255,0.9)',
          },
        }}
      >
        {alertActive ? 'Reset' : 'Normal'}
      </Button>
    </Stack>
  );
}
