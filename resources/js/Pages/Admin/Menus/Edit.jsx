import Form from './Form';

export default function Edit({ menu, categories }) {
    return <Form menuData={menu.data ?? menu} categories={categories} isEdit={true} />;
}