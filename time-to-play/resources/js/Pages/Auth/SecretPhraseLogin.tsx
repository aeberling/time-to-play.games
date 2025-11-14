import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function SecretPhraseLogin({
    status,
}: {
    status?: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        secret_phrase: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login.secret-phrase'), {
            onFinish: () => reset('secret_phrase'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Speak Friend and Enter" />

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Speak, Friend, and Enter
                </h1>
                <p className="text-sm text-gray-600 italic">
                    "The Doors of Durin, Lord of Moria. Speak, friend, and enter."
                </p>
            </div>

            {/* Gate of Moria ASCII Art */}
            <div className="mb-8 text-center font-mono text-xs text-gray-500 whitespace-pre">
{`              ___
             /   \\
            /  ^  \\
           |  / \\  |
           | |   | |
            \\  O  /
             \\___/
              | |
            __|_|__
           |       |
           | ITHIL |
           |  /|\\  |
           | / | \\ |
           |/  |  \\|
           |   |   |
           |_______|`}
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <label
                        htmlFor="secret_phrase"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        What is your secret phrase?
                    </label>
                    <TextInput
                        id="secret_phrase"
                        type="password"
                        name="secret_phrase"
                        value={data.secret_phrase}
                        className="mt-1 block w-full"
                        autoComplete="off"
                        isFocused={true}
                        onChange={(e) => setData('secret_phrase', e.target.value)}
                        placeholder="Enter the words to open the gate..."
                    />
                    <InputError message={errors.secret_phrase} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                        />
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-6 flex items-center justify-between">
                    <Link
                        href={route('login')}
                        className="text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md"
                    >
                        Use email and password instead
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Enter
                    </PrimaryButton>
                </div>
            </form>

            <div className="mt-8 text-center text-xs text-gray-500 italic">
                <p>Hint: Set your secret phrase in your profile settings</p>
            </div>
        </GuestLayout>
    );
}
