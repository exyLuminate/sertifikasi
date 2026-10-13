import Form from './Form';

export default function Edit({ category }) {
    return <Form categoryData={category.data ?? category} isEdit={true} />;
}