'use client';

import {useEffect, useState} from 'react';

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [loggedIn, setLogin] = useState(false);
    const [message, setMessage] = useState('');

    const checkIsLogin = async () => {
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/login', {method: 'POST'});
            const data = await response.json();

            if (response.ok) {
                setMessage('✅ Logged in successfully!');
                setLogin(true)
            } else {
                setMessage(`❌ Error: ${data.error}`);
                setLogin(false)
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setMessage('⚠️ Request failed.');
            setLogin(false)
        }

        setLoading(false);
    };

    useEffect(() => {
        checkIsLogin()
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white shadow-lg rounded-xl p-6 max-w-md flex flex-col gap-2 w-full text-center">
                <h1 className="text-xl font-semibold text-black mb-4">
                    Instagram Bot
                </h1>
                {loading && (
                    <div className="flex flex-col gap-2 w-full">
                        <p className="text-blue-600 py-5 ">
                            Authenticating your account...
                        </p>
                        {message && (
                            <p className="text-black  ">
                                {message}
                            </p>
                        )}
                    </div>
                )}
                {(!loading && loggedIn) && (
                    <AddTo isDoing={true}/>
                )}
            </div>
        </div>
    );
}


type AddToProps = {
    isDoing: boolean;
}
const AddTo = (props: AddToProps) => {

    const {
        // loggedIn,
        // setLogin,
    } = props

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('');
    const [success, setSuccess] = useState(false);


    const onStart = async () => {
        if (!username) {
            setMessage('Username is required');
            return
        }
        setLoading(true);
        setMessage('');


        try {
            const response = await fetch('/api/start', {method: 'POST', body: JSON.stringify({username})});
            const data = await response.json();
            if (response.ok) {
                setMessage('✅ Started successfully!\nYou can close me and wait to do :)');
                setSuccess(true)
            } else {
                setMessage(`❌ Error: ${data.error}`);
                setSuccess(false)
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            setMessage('⚠️ Request failed.');
            setSuccess(false)
        }

        setLoading(false);
    };


    return (
        <div className="flex flex-col gap-2">
            <input
                type="text"
                placeholder="Instagram Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded-md text-black"
            />
            <button
                onClick={onStart}
                disabled={loading || success}
                className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition"
            >
                Start
            </button>
            {message && (<p className="mt-4 text-black">{message}</p>)}
        </div>
    )
}
