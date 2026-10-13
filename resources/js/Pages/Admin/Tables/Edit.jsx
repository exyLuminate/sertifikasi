import Form from './Form';

export default function Edit({ table }) {
    return <Form tableData={table.data ?? table} isEdit={true} />;
}