
import axios from 'axios';
import { useSelector } from 'react-redux';

const useAuthAxios = () => {
    const token = useSelector((state) => state.auth?.user?.access_token); // assuming 'auth' is the name of your slice
    if(localStorage.getItem('token') == null){
        localStorage.setItem('token', token);
    }
    // console.log(token)
    const instance = axios.create({
        baseURL:  import.meta.env.VITE_API_URL,
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json'
        },
    });

    return instance;
};

export default useAuthAxios;
