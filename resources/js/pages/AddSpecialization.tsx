import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';

export default function AddSpecialization() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/specializations');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Add Specialization</CardTitle>
                    <CardDescription>Create a new specialization category.</CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Name</FieldLabel>
                                <Input
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Specialization Name"
                                    required
                                />
                                <FieldError errors={[{ message: errors.name }]} />
                            </Field>
                        </FieldGroup>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Adding...' : 'Add Specialization'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
