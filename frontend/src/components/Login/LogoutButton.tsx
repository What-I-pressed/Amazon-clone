import { logout } from '../../utilites/auth';

const LogoutButton = () => (
  <button onClick={logout}>Вийти</button>
);

export default LogoutButton;
