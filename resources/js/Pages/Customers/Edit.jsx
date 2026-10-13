import Form from './Form';

export default function Edit({ customer }) {
    return <Form customer={customer.data ?? customer} isEdit={true} />;
}