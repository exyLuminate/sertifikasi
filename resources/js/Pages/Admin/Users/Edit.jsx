import Form from './Form';

export default function Edit({ user }) {
    return <Form userData={user.data ?? user} isEdit={true} />;
}