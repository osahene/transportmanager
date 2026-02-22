declare module 'redux-persist/lib/storage' {
    const storage: any;
    export default storage;
}

declare module 'redux-persist/lib/storage/session' {
    const sessionStorage: any;
    export default sessionStorage;
}

declare module 'redux-persist-transform-encrypt' {
    export function encryptTransform(config: {
        secretKey: string;
        onError?: (err: Error) => void;
    }): any;
}