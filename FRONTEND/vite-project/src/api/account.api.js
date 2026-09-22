import api from "./axios";

export const getMyAccount = async () => {
    const response = await api.get("/account");
    return response.data;
};

export const createAccount = async () => {
    const response = await api.post("/account");
    return response.data;
};

export const getBalance = async (accountId) => {
    const response = await api.get(
        `/account/balance/${accountId}`
    );

    return response.data;
};

export const findAccountByEmail = async (email) => {
    const response = await api.get(
        `/account/find?email=${encodeURIComponent(email)}`
    );

    return response.data;
};