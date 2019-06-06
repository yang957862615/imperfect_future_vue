import {getToken} from "../utils/auth";

export default function ({$axios, redirect}) {
    $axios.onRequest(config => {
        console.log('Making request to ' + config.url)
    });

    $axios.onResponse(response => {
        const code = parseInt(response.status && error.response.status);
        if (code === 401) {
            redirect('/auth/sign-in')
        }
    });

    $axios.onError(error => {
        const code = parseInt(error.response && error.response.status);
        if (code === 401) {
            redirect('/auth/sign-in')
        }
    });

    // Adds header: `Content-Type: application/x-www-form-urlencoded` to only post requests
    $axios.setHeader('Content-Type', 'application/x-www-form-urlencoded', [
        'post'
    ]);

    $axios.setHeader('Authorization', 'Bearer ' + 123);
}