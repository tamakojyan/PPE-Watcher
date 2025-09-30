import { Button } from '@mui/material';
import api from '../api/client'; // 你的封装好的 axios/fetch 客户端

export default function TestViolationButton() {
  async function handleClick() {
    try {
      const res = await api.post('/violations', {
        confidence: 0.92,
        snapshotUrl: 'https://via.placeholder.com/300.png', // 测试图片
        kinds: ['no_mask', 'no_helmet'], // 测试类型
      });
      alert('Violation created:\n' + JSON.stringify(res, null, 2));
      console.log('Created violation:', res);
    } catch (err) {
      console.error('Failed to create violation:', err);
      alert('Error creating violation, check console');
    }
  }

  return (
    <Button variant="contained" color="primary" onClick={handleClick}>
      Create Test Violation
    </Button>
  );
}
