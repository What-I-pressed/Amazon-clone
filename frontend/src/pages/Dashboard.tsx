import { isLoggedIn } from '../utils/auth';
import LogoutButton from '../components/LogoutButton';

const Dashboard = () => {
  if (!isLoggedIn()) {
    window.location.href = '/login';
    return null;
  }

  return (
    <div>
      <h1>Вітаємо в кабінеті!</h1>
      <LogoutButton />
    </div>
  );
};

export default Dashboard;
