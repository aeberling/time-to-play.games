import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

export default function UpdateSecretPhraseForm({
    className = '',
}: {
    className?: string;
}) {
    const secretPhraseInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        secret_phrase: '',
    });

    const updateSecretPhrase: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('secret-phrase.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: () => {
                secretPhraseInput.current?.focus();
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Secret Phrase Login
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    Set a secret phrase to enable the "Speak Friend and Enter"
                    login method. This allows you to login with just your secret
                    phrase, without needing your email and password.
                </p>
            </header>

            <form onSubmit={updateSecretPhrase} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="secret_phrase"
                        value="Secret Phrase"
                    />

                    <TextInput
                        id="secret_phrase"
                        ref={secretPhraseInput}
                        value={data.secret_phrase}
                        onChange={(e) =>
                            setData('secret_phrase', e.target.value)
                        }
                        type="password"
                        className="mt-1 block w-full"
                        autoComplete="off"
                        placeholder="Enter your secret phrase (min 8 characters)"
                    />

                    <InputError
                        message={errors.secret_phrase}
                        className="mt-2"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                        Your secret phrase can include spaces and special
                        characters. Leave blank to remove your secret phrase.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        Save Secret Phrase
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
