import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const options = {
    broadcaster: 'pusher', 
    key: import.meta.env.VITE_PUSHER_KEY,
    forceTLS: false,
    cluster: import.meta.env.VITE_PUSHER_CLUSTER,
    authEndpoint: `${import.meta.env.VITE_API_URL_ONLY}/broadcasting/auth`
}
const echo = new Echo({
   ...options,
   client: new Pusher(options.key, options)
});

console.log('echo', echo)

export default echo;