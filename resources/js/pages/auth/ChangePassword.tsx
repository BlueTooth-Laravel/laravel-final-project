import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { ChangePasswordProps } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ChangePassword({
    mustChangePassword,
}: ChangePasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/change-password', {
            onSuccess: () => reset(),
        });
    };

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <AuthLayout
            title="Change Password"
            description={
                mustChangePassword
                    ? 'You must change your password before you can access the system'
                    : 'Please enter your current password and choose a new one'
            }
        >
            <Head title="Change Password" />

            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="password">New Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            autoComplete="new-password"
                            className="mt-1 block w-full"
                            autoFocus
                            placeholder="Enter new password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">
                            Confirm New Password
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            autoComplete="new-password"
                            className="mt-1 block w-full"
                            placeholder="Confirm new password"
                        />
                        <InputError
                            message={errors.password_confirmation}
                            className="mt-2"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 w-full"
                        disabled={processing}
                        data-test="change-password-button"
                    >
                        {processing && <Spinner />}
                        Change Password
                    </Button>

                    <div className="mt-4 text-center">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleLogout}
                            className="text-sm text-muted-foreground underline hover:text-foreground"
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
