import React from 'react';
import { useAppSelector } from '../../store';

interface HasPermissionProps {
  requiredPermission: {
    method: string;
    apiPath: string;
    module: string;
  };
  children: React.ReactNode;
}

export const HasPermission: React.FC<HasPermissionProps> = ({ requiredPermission, children }) => {
  const user = useAppSelector((state) => state.auth.user);

  // Nếu là SUPER_ADMIN thì cho qua hết
  if (user?.role?.name === 'SUPER_ADMIN') return <>{children}</>;

  // Kiểm tra xem user có quyền này trong mảng permissions không
  const hasPerm = user?.role?.permissions?.some(
    (p) =>
      p.apiPath === requiredPermission.apiPath &&
      p.method === requiredPermission.method &&
      p.module === requiredPermission.module
  );

  return hasPerm ? <>{children}</> : null;
};

export default HasPermission;