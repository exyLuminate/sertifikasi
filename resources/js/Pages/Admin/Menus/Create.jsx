import Form from './Form';

export default function Create({ categories }) {
    return <Form categories={categories} isEdit={false} />;
}