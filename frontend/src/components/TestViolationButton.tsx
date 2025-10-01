import { useState } from 'react';
import { Button } from '@mui/material';

export default function TestViolationButton() {
  const [file, setFile] = useState<File | null>(null);

  async function handleUpload() {
    if (!file) {
      alert('请先选择一个文件');
      return;
    }

    try {
      // 构造 FormData
      const formData = new FormData();
      formData.append('file', file); // 👈 上传的截图
      formData.append('kinds', JSON.stringify(['no_mask', 'no_helmet'])); // 👈 测试类型

      // 直接 fetch，不走封装
      const res = await fetch('http://localhost:8080/violations', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(`上传失败: ${res.status}`);
      const data = await res.json();

      console.log('✅ 上传成功', data);
      alert('上传成功: ' + JSON.stringify(data));
    } catch (err) {
      console.error('❌ 上传出错:', err);
      alert('上传失败: ' + err);
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button variant="contained" color="primary" onClick={handleUpload}>
        上传违章截图（绕过封装）
      </Button>
    </div>
  );
}
