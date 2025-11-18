import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="text-center mb-6">
                <h1 className="text-4xl font-black text-adventure-900 drop-shadow-md">
                    Welcome Back!
                </h1>
                <p className="text-lg font-bold text-adventure-700 mt-2">
                    The party awaits!
                </p>
            </div>

            {status && (
                <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-quest-200 to-quest-300 border-4 border-quest-500 text-adventure-900 font-bold text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-6">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-6 block">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-3 text-base font-bold text-adventure-800">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                    <PrimaryButton className="w-full justify-center" disabled={processing}>
                        {processing ? 'Entering...' : 'Log in'}
                    </PrimaryButton>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-center text-base font-bold text-adventure-700 hover:text-adventure-900 transition underline"
                        >
                            Forgot your password?
                        </Link>
                    )}
                </div>
            </form>

            <div className="mt-8 pt-6 border-t-4 border-adventure-200 text-center">
                <Link
                    href={route('login.secret-phrase')}
                    className="inline-block text-lg font-black text-coral-600 hover:text-coral-700 transition hover:scale-105 transform"
                >
                    Or... Speak Friend and Enter 🗝️
                </Link>
            </div>
        </GuestLayout>
    );
}
