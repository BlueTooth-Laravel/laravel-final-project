import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';

export default function AddTreatmentType() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        standard_cost: '',
        duration_minutes: '',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/treatment-types');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Add Treatment Type</CardTitle>
                    <CardDescription>Enter the details for the new treatment type.</CardDescription>
                </CardHeader>
                <form onSubmit={submit}>
                    <CardContent className="space-y-6">
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Name</FieldLabel>
                                <Input
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Treatment Name"
                                    required
                                />
                                <FieldError errors={[{ message: errors.name }]} />
                            </Field>

                            <Field>
                                <FieldLabel>Description</FieldLabel>
                                <Textarea
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Enter a detailed description..."
                                    required
                                />
                                <FieldError errors={[{ message: errors.description }]} />
                            </Field>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel>Standard Cost</FieldLabel>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.standard_cost}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            // Allow empty input or valid number with up to 2 decimal places
                                            if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                                                setData('standard_cost', value);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const value = parseFloat(e.target.value);
                                            if (!isNaN(value)) {
                                                setData('standard_cost', value.toFixed(2));
                                            } else {
                                                  // Optional: Clear if invalid, or leave as is if you prefer
                                                  setData('standard_cost', ''); 
                                            }
                                        }}
                                        placeholder="0.00"
                                        required
                                    />
                                    <FieldError errors={[{ message: errors.standard_cost }]} />
                                </Field>

                                <Field>
                                    <FieldLabel>Duration (Minutes)</FieldLabel>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={data.duration_minutes}
                                        onChange={e => setData('duration_minutes', e.target.value)}
                                        placeholder="60"
                                        required
                                    />
                                    <FieldError errors={[{ message: errors.duration_minutes }]} />
                                </Field>
                            </div>

                            <Field orientation="horizontal" className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', !!checked)}
                                />
                                <FieldLabel htmlFor="is_active" className="cursor-pointer font-normal m-0 p-0 text-sm">
                                    Active Status
                                </FieldLabel>
                                <FieldError errors={[{ message: errors.is_active }]} />
                            </Field>
                        </FieldGroup>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Treatment Type'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
