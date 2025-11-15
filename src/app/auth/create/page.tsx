import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { adminProtectedPage } from '@/lib/page-protection';
import CreateUserForm from '@/components/CreateUserForm';

/** The sign up page. */
const SignUp = async () => {
  const session = await getServerSession(authOptions);

  adminProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  return (
    <CreateUserForm />
  );
};

export default SignUp;
