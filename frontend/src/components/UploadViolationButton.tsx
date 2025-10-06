import React, { useState } from 'react';
import {
  Button,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const ALL_TYPES = ['no_mask', 'no_helmet', 'no_vest', 'no_gloves'];

export default function UploadViolationButton() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; ok: boolean }>({
    open: false,
    msg: '',
    ok: true,
  });

  const handleUpload = async () => {
    if (!file || !type) {
      setSnack({ open: true, msg: '请选择图片和类型', ok: false });
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('kinds', JSON.stringify([type])); // 后端期望数组字符串

    try {
      const res = await fetch('http://localhost:8080/violations', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSnack({ open: true, msg: '✅ 上传成功', ok: true });
        console.log('📸 Created violation:', data);
      } else {
        throw new Error(data?.message || '上传失败');
      }
    } catch (err: any) {
      setSnack({ open: true, msg: err.message || '网络错误', ok: false });
    } finally {
      setLoading(false);
      setFile(null);
      setType('');
    }
  };

  return (
    <Stack spacing={2} direction="row" alignItems="center">
      <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
        {file ? file.name : '选择图片'}
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </Button>

      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel>类型</InputLabel>
        <Select value={type} label="类型" onChange={(e) => setType(e.target.value)}>
          {ALL_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" color="primary" disabled={loading} onClick={handleUpload}>
        {loading ? <CircularProgress size={22} color="inherit" /> : '上传'}
      </Button>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.ok ? 'success' : 'error'} sx={{ width: '100%' }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
