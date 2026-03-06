import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotPermittedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '100px 20px', display: 'flex', justifyContent: 'center' }}>
      <Result
        status="403"
        title="403 - Truy Cập Bị Từ Chối"
        subTitle="Xin lỗi, bạn không có quyền truy cập vào khu vực này."
        extra={
          <Button type="primary" size="large" onClick={() => navigate('/')}>
            Quay lại Trang chủ
          </Button>
        }
      />
    </div>
  );
};

export default NotPermittedPage;